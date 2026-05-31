import React, { MouseEventHandler } from 'react';
import { Conversation, Message } from '@/types';

interface Props { conversation: Conversation; active?: boolean; typing?: boolean; onClick?: MouseEventHandler; }

function preview(message: Message | null, typing?: boolean) {
    if (typing) return '...';
    if (!message) return 'No messages yet';
    if (message.message) return message.message;
    const a = message.attachments?.[0];
    return a?.media_type === 'image' ? 'Image' : a?.media_type === 'video' ? 'Video' : a?.media_type === 'audio' ? 'Audio' : 'Attachment';
}

export default function UserBox({conversation, active, typing, onClick = () => {}}: Props) {
    const initials = conversation.name.split(' ').filter(Boolean).slice(0,2).map(n => n[0]).join('').toUpperCase();
    const online = conversation.type === 'direct' && Boolean(conversation.partner?.is_online);
    const time = conversation.last_message ? new Intl.DateTimeFormat('en-GB', {hour:'numeric', minute:'numeric', day:'numeric', month:'short'}).format(new Date(conversation.last_message.created_at)) : '';

    return <li className={(active ? 'bg-slate-100 dark:bg-slate-800 ' : 'bg-white dark:bg-slate-900 ') + 'flex w-full cursor-pointer rounded-md border border-slate-200 p-2 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800'} onClick={onClick}>
        <div className="relative h-12 w-12 shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-TBL_SECONDARY text-sm font-bold text-white">{initials}</div>
            {conversation.type === 'direct' && <span className={(online ? 'bg-emerald-500' : 'bg-slate-400') + ' absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900'} />}
        </div>
        <div className="ml-3 min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
                <h5 className="truncate text-sm font-bold text-slate-900 dark:text-white">{conversation.name}</h5>
                <span className="ml-auto shrink-0 text-[10px] text-slate-400">{time}</span>
            </div>
            <div className="mt-0.5 flex min-w-0 items-center gap-2">
                {conversation.type === 'direct' && <><span className={(online ? 'bg-emerald-500' : 'bg-slate-400') + ' h-1.5 w-1.5 shrink-0 rounded-full'} /><span className="shrink-0 text-[10px] font-semibold uppercase text-slate-400">{online ? 'Online' : 'Offline'}</span></>}
                {conversation.type === 'group' && <span className="shrink-0 text-[10px] font-semibold uppercase text-slate-400">{conversation.participants.length} members</span>}
                <p className={(typing ? 'text-purple-300' : 'text-slate-400') + ' min-w-0 truncate text-xs'}>{preview(conversation.last_message, typing)}</p>
            </div>
        </div>
    </li>;
}
