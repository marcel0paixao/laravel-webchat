import { Conversation } from '@/types';
import { ArrowLeftIcon, BanIcon, DotsVerticalIcon, TrashIcon } from '@heroicons/react/outline';
import { Inertia } from '@inertiajs/inertia';
import axios from 'axios';
import React, { useState } from 'react';
import route from 'ziggy-js';

interface Props { conversation: Conversation; onBack: () => void; onDeleted: () => void; onBlocked: () => void; }

export default function ChatHeader({conversation,onBack,onDeleted,onBlocked}: Props) {
    const [menu,setMenu]=useState(false);
    const initials=conversation.name.split(' ').filter(Boolean).slice(0,2).map(n=>n[0]).join('').toUpperCase();
    const partner = conversation.partner;
    const block=()=> partner ? axios.post(route('block.users',{id:partner.id})).then(onBlocked) : undefined;
    const remove=()=> partner ? axios.delete(route('destroy.messages',{id:partner.id})).then(onDeleted) : onDeleted();
    const openProfile = () => { if (partner) Inertia.visit(route('profiles.show', {username: partner.username})); };

    return <header className="relative flex h-16 items-center border-b border-slate-200 px-3 dark:border-slate-800">
        <button type="button" className="mr-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-TBL_SECONDARY md:hidden" onClick={onBack}><ArrowLeftIcon className="h-5 w-5" /></button>
        <button type="button" onClick={openProfile} disabled={!partner} className="flex min-w-0 items-center rounded-xl px-2 py-1.5 text-left transition hover:bg-slate-100 focus:bg-slate-100 disabled:cursor-default disabled:hover:bg-slate-100/60 dark:hover:bg-slate-800/80 dark:focus:bg-slate-800/80 dark:disabled:hover:bg-slate-800/40">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-TBL_SECONDARY text-sm font-bold text-white">{initials}</div>
            <div className="ml-3 min-w-0">
                <h2 className="truncate text-sm font-semibold text-slate-900 dark:text-white">{conversation.name}</h2>
                {conversation.type === 'direct' && partner && <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400"><span className={(partner.is_online?'bg-emerald-500':'bg-slate-400')+' h-2 w-2 rounded-full'} />{partner.is_online?'Online':'Offline'}</span>}
                {conversation.type === 'group' && <span className="text-[11px] text-slate-400">{conversation.participants.length} members</span>}
            </div>
        </button>
        <button type="button" onClick={()=>setMenu(v=>!v)} className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-300"><DotsVerticalIcon className="h-5 w-5" /></button>
        {menu && <div className="absolute right-3 top-14 z-20 w-48 rounded-md border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
            <button onClick={remove} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-700"><TrashIcon className="h-4 w-4" />Delete conversation</button>
            {partner && <button onClick={block} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-slate-700"><BanIcon className="h-4 w-4" />Block user</button>}
        </div>}
    </header>;
}
