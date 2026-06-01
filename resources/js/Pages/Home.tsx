import Chat from '@/Components/Site/Chat';
import ChatRoom from '@/Components/Site/ChatRoom';
import OuterCenteredContainer from '@/Components/Site/OuterCenteredContainer';
import AppLayout from '@/Layouts/AppLayout';
import React, { useCallback, useEffect, useState } from 'react';
import UsersList from '@/Components/Site/UsersList';
import { Conversation, Message, User } from '@/types';
import axios from 'axios';
import useTypedPage from '@/Hooks/useTypedPage';
import route from 'ziggy-js';
import { Inertia } from '@inertiajs/inertia';

interface Props { conversationHash?: string | null; }

export default function Home({conversationHash = null}: Props) {
    const { user } = useTypedPage().props;
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [friends, setFriends] = useState<User[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [incomingMessage, setIncomingMessage] = useState<Message | null>(null);
    const [readReceipt, setReadReceipt] = useState<{conversation_hash: string; reader_id: number; read_at: string} | null>(null);
    const [typingConversationHash, setTypingConversationHash] = useState<string | null>(null);

    const loadConversations = useCallback(() => axios.get(route('conversations.index')).then(r => {
        setConversations(r.data.conversations);
        setActiveConversation(current => {
            const hash = conversationHash ?? current?.hash;
            return hash ? (r.data.conversations.find((c: Conversation) => c.hash === hash) ?? current) : current;
        });
    }), [conversationHash]);
    const loadFriends = useCallback(() => axios.get(route('load.users')).then(r => setFriends(r.data.users)), []);

    useEffect(() => { loadConversations(); loadFriends(); const id = window.setInterval(loadConversations, 30000); return () => window.clearInterval(id); }, [loadConversations, loadFriends]);
    useEffect(() => { if (!conversationHash) return; axios.get(route('conversations.show', {hash: conversationHash})).then(r => setActiveConversation(r.data.conversation)); }, [conversationHash]);

    const selectConversation = (conversation: Conversation) => {
        axios.get(route('conversations.show', {hash: conversation.hash})).then(r => setActiveConversation(r.data.conversation));
        Inertia.visit(route('chat.show', {hash: conversation.hash}), { preserveState: true, preserveScroll: true });
    };

    const updatePreview = useCallback((message: Message) => {
        const hash = message.conversation?.hash ?? activeConversation?.hash;
        if (!hash) return;
        setConversations(current => {
            const touched = current.find(c => c.hash === hash);
            return touched ? [{...touched, last_message: message}, ...current.filter(c => c.hash !== hash)] : current;
        });
        setActiveConversation(current => current && current.hash === hash ? {...current, last_message: message} : current);
        axios.get(route('conversations.show', {hash})).then(r => {
            setConversations(current => current.some(c => c.hash === hash)
                ? current.map(c => c.hash === hash ? {...r.data.conversation, last_message: message} : c)
                : [{...r.data.conversation, last_message: message}, ...current]);
            setActiveConversation(current => current && current.hash === hash ? {...r.data.conversation, last_message: message} : current);
        }).catch(() => {});
    }, [activeConversation?.hash]);
    const clearPreview = useCallback((conversation: Conversation) => {
        setConversations(current => current.map(item => item.hash === conversation.hash ? {...item, last_message: null} : item));
        setActiveConversation(current => current && current.hash === conversation.hash ? {...current, last_message: null} : current);
    }, []);

    useEffect(() => {
        if (!Object(window).Echo) return;
        const channel = Object(window).Echo.private(`user.${user.id}`);
        channel.listen('.SendMessage', (e: {message: Message}) => { updatePreview(e.message); setIncomingMessage(e.message); });
        channel.listen('.MessagesRead', (e: {conversation_hash: string; reader_id: number; read_at: string}) => setReadReceipt(e));
        channel.listen('.UserTyping', (e: {from: number; conversation_hash?: string}) => {
            const hash = e.conversation_hash ?? null;
            setTypingConversationHash(hash);
            window.setTimeout(() => setTypingConversationHash(current => current === hash ? null : current), 2200);
        });
        return () => { channel.stopListening('.SendMessage'); channel.stopListening('.MessagesRead'); channel.stopListening('.UserTyping'); };
    }, [updatePreview, user.id]);

    const createGroup = (name: string, userIds: number[]) => axios.post(route('conversations.groups.store'), {name, user_ids: userIds}).then(r => {
        setConversations(current => [r.data.conversation, ...current]);
        selectConversation(r.data.conversation);
    });

    return <AppLayout title="Chat room"><OuterCenteredContainer className="!max-w-[1120px]"><ChatRoom>
        <div className={`min-h-0 w-full border-r border-slate-200 dark:border-slate-800 md:block md:w-[36%] ${activeConversation ? 'hidden' : 'block'}`}>
            <UsersList conversations={conversations} active={activeConversation} friends={friends} onSelect={selectConversation} onCreateGroup={createGroup} typingConversationHash={typingConversationHash} />
        </div>
        <div className={`min-h-0 flex-1 ${activeConversation ? 'block' : 'hidden md:block'}`}>
            {activeConversation ? <Chat conversation={activeConversation} onBack={() => { setActiveConversation(null); Inertia.visit(route('Home'), { preserveState: true, preserveScroll: true }); }} incomingMessage={incomingMessage} readReceipt={readReceipt} typing={typingConversationHash === activeConversation.hash} onConversationMessage={updatePreview} onConversationCleared={clearPreview} onConversationBlocked={() => { const hash = activeConversation.hash; setConversations(current => current.filter(c => c.hash !== hash)); setActiveConversation(null); Inertia.visit(route('Home'), { preserveState: true, preserveScroll: true }); }} /> : <div className="flex h-full items-center justify-center text-slate-400">Select a chat</div>}
        </div>
    </ChatRoom></OuterCenteredContainer></AppLayout>;
}
