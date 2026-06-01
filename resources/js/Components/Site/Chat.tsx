import { Conversation, Message, MessageAttachment } from '@/types';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import route from 'ziggy-js';
import ChatHeader from './ChatHeader';
import Form from './Form';
import MessagesList from './MessagesList';
import { BanIcon } from '@heroicons/react/outline';

interface Props { conversation: Conversation; onBack: () => void; incomingMessage: Message | null; readReceipt: {conversation_hash: string; reader_id: number; read_at: string} | null; typing: boolean; onConversationMessage: (message: Message) => void; onConversationCleared: (conversation: Conversation) => void; onConversationBlocked: () => void; }

export default function Chat({conversation, onBack, incomingMessage, readReceipt, typing, onConversationMessage, onConversationCleared, onConversationBlocked}: Props) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [meta, setMeta] = useState(conversation);
    const [draft, setDraft] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newCount, setNewCount] = useState(0);
    const [preview, setPreview] = useState<MessageAttachment | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const boxRef = useRef<HTMLDivElement | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const lastTypingAt = useRef(0);
    const blocked = Boolean(meta.partner?.is_blocked_by_me || meta.partner?.is_blocked_by_them);
    const removedFromGroup = Boolean(meta.current_user_left_at);
    const canSend = !removedFromGroup && !blocked && (meta.type === 'group' || meta.partner?.friendship_status === 'accepted');
    const disabledMessage = removedFromGroup ? 'You were removed from this group. You can still read previous messages.' : (blocked ? 'This conversation is blocked.' : 'You can only message friends.');

    const isNearBottom = () => { const el = boxRef.current; return !el || el.scrollHeight - el.scrollTop - el.clientHeight < 120; };
    const scrollBottom = (smooth = false) => bottomRef.current?.scrollIntoView({ block: 'end', behavior: smooth ? 'smooth' : 'auto' });

    useEffect(() => {
        setMeta(conversation);
        if (conversation.type !== 'direct' || !conversation.partner || conversation.partner.friendship_status) return;
        axios.get(route('conversations.show', {hash: conversation.hash})).then(r => setMeta(r.data.conversation)).catch(() => {});
    }, [conversation]);

    useEffect(() => {
        setMessages([]); setAttachments([]); setError(null); setNewCount(0); setHasMore(false);
        axios.get(route('load.messages', {conversation_hash: conversation.hash})).then(r => {
            setMessages(r.data.messages);
            setHasMore(Boolean(r.data.has_more));
            window.setTimeout(() => scrollBottom(false), 40);
        });
    }, [conversation.hash]);

    useEffect(() => {
        if (!incomingMessage || incomingMessage.conversation?.hash !== conversation.hash) return;
        const shouldScroll = isNearBottom();
        setMessages(current => current.some(m => m.id === incomingMessage.id) ? current : [...current, incomingMessage]);
        axios.patch(route('messages.read'), {conversation_hash: conversation.hash}).catch(() => {});
        axios.get(route('conversations.show', {hash: conversation.hash})).then(r => setMeta(r.data.conversation)).catch(() => {});
        if (shouldScroll) window.setTimeout(() => scrollBottom(true), 40); else setNewCount(c => c + 1);
    }, [incomingMessage, conversation.hash]);

    useEffect(() => {
        if (typing && isNearBottom()) window.setTimeout(() => scrollBottom(true), 40);
    }, [typing]);

    useEffect(() => {
        if (!readReceipt || readReceipt.conversation_hash !== conversation.hash) return;
        setMessages(current => current.map(message => ({
            ...message,
            statuses: (message.statuses ?? []).map(status => Number(status.user_id) === Number(readReceipt.reader_id) ? {...status, read_at: readReceipt.read_at, delivered_at: status.delivered_at ?? readReceipt.read_at} : status),
        })));
    }, [readReceipt, conversation.hash]);

    const loadOlder = () => {
        if (!hasMore || loadingMore || messages.length === 0) return;
        const el = boxRef.current;
        const previousHeight = el?.scrollHeight ?? 0;
        setLoadingMore(true);
        axios.get(route('load.messages', {conversation_hash: conversation.hash, before_id: messages[0].id})).then(r => {
            setMessages(current => [...r.data.messages, ...current]);
            setHasMore(Boolean(r.data.has_more));
            window.setTimeout(() => { if (el) el.scrollTop = el.scrollHeight - previousHeight; }, 20);
        }).finally(() => setLoadingMore(false));
    };

    const sendTyping = () => { const now = Date.now(); if (now - lastTypingAt.current < 1200) return; lastTypingAt.current = now; axios.post(route('typing.store'), {conversation_hash: conversation.hash}).catch(() => {}); };
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSend) { setError(disabledMessage); return; }
        const text = draft.trim();
        if ((!text && attachments.length === 0) || processing) return;
        setProcessing(true); setError(null);
        try {
            const payload = new FormData();
            payload.append('conversation_hash', conversation.hash);
            payload.append('message', text);
            attachments.forEach(file => payload.append('attachments[]', file));
            const r = await axios.post(route('store.messages'), payload, {headers:{'Content-Type':'multipart/form-data'}});
            setMessages(current => [...current, r.data.message]);
            onConversationMessage(r.data.message);
            setDraft(''); setAttachments([]);
            window.setTimeout(() => scrollBottom(true), 40);
        } catch (err: any) { setError(err.response?.status === 429 ? 'You tried too many times. Please wait one minute before sending more messages.' : (err.response?.data?.message ?? 'Unable to send message.')); }
        finally { setProcessing(false); }
    };
    const clearConversation = () => {
        setMessages([]);
        setMeta(current => {
            const next = {...current, last_message: null};
            onConversationCleared(next);
            return next;
        });
    };

    return <div className="relative flex h-full min-h-0 flex-col">
        <ChatHeader conversation={meta} onBack={onBack} onBlocked={onConversationBlocked} onDeleted={clearConversation} onConversationUpdated={setMeta} />
        <div ref={boxRef} onScroll={() => { if ((boxRef.current?.scrollTop ?? 0) < 80) loadOlder(); if (isNearBottom()) setNewCount(0); }} className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-4">
            {loadingMore && <div className="mb-3 text-center text-xs text-slate-400">Loading older messages...</div>}
            <MessagesList messages={messages} showSenders={conversation.type === 'group'} onImageClick={setPreview} />
            {typing && <div className="mt-2 flex justify-start"><div className="typing-bubble"><span /><span /><span /></div></div>}
            <div ref={bottomRef} />
        </div>
        {newCount > 0 && <button type="button" onClick={() => { setNewCount(0); scrollBottom(true); }} className="absolute bottom-24 left-1/2 z-10 -translate-x-1/2 rounded-full bg-TBL_SECONDARY px-4 py-2 text-xs font-semibold text-white shadow-lg">↓ {newCount} new</button>}
        {!canSend && <div className="flex items-center gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"><BanIcon className="h-5 w-5 text-slate-400" />{disabledMessage}</div>}
        {canSend && <Form onSubmit={submit} value={draft} onChange={v => { setDraft(v); sendTyping(); }} attachments={attachments} onAttachmentsChange={files => setAttachments(current => [...current, ...files].slice(0,4))} onRemoveAttachment={i => setAttachments(current => current.filter((_, idx) => idx !== i))} disabled={processing} error={error} />}
        {preview && <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4" onClick={() => setPreview(null)}><button className="absolute right-5 top-5 rounded-full bg-white/10 px-3 py-2 text-white">Close</button><img src={preview.url} alt={preview.original_name ?? 'Image preview'} className="max-h-[88vh] max-w-[92vw] rounded-lg object-contain" /></div>}
    </div>;
}
