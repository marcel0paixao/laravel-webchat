import { Message, MessageAttachment } from '@/types';
import React from 'react';

interface Props { byOwn: boolean; date: string; message: Message; showSender: boolean; onImageClick: (attachment: MessageAttachment) => void; }

function label(a: MessageAttachment) { return a.media_type === 'image' ? 'Image attachment' : a.media_type === 'video' ? 'Video attachment' : a.media_type === 'audio' ? 'Audio attachment' : (a.original_name ?? 'Attachment'); }
function seen(message: Message) { return message.statuses?.some(status => status.read_at) ? 'Seen' : 'Sent'; }

export default function MessageBox({byOwn,date,message,showSender,onImageClick}: Props) {
    if (message.type === 'system') {
        return <li className="flex justify-center"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">{message.message}</span></li>;
    }
    return <li className={(byOwn ? 'justify-end' : 'justify-start') + ' message flex w-full'}>
        <div className={(byOwn ? 'message-own border-TBL_SECONDARY bg-TBL_SECONDARY text-white' : 'message-other border-slate-200 bg-slate-100 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white') + ' relative max-w-[85%] rounded-2xl border px-3 py-2 text-sm shadow-sm'}>
            {showSender && message.sender && !byOwn && <p className="mb-1 text-[11px] font-bold text-purple-300">{message.sender.name}</p>}
            {message.attachments?.length > 0 && <div className="mb-2 space-y-2">{message.attachments.map(a => a.media_type === 'image' ? <button type="button" key={a.id} onClick={() => onImageClick(a)} className="block overflow-hidden rounded-md"><img src={a.url} alt={label(a)} className="max-h-72 w-full object-cover" /></button> : a.media_type === 'video' ? <video key={a.id} controls className="max-h-72 w-full rounded-md"><source src={a.url} type={a.mime_type ?? undefined} /></video> : a.media_type === 'audio' ? <audio key={a.id} controls className="w-full"><source src={a.url} type={a.mime_type ?? undefined} /></audio> : <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className={(byOwn ? 'bg-white/15 text-white' : 'bg-white text-purple-700 dark:bg-slate-900 dark:text-purple-300') + ' block truncate rounded-md px-3 py-2 text-xs font-semibold'}>{label(a)}</a>)}</div>}
            {message.message && <p className="whitespace-pre-wrap break-words">{message.message}</p>}
            <p className={(byOwn ? 'text-purple-100' : 'text-slate-400') + ' mt-1 text-right text-[10px]'}>{date}{byOwn ? ` · ${seen(message)}` : ''}</p>
        </div>
    </li>;
}
