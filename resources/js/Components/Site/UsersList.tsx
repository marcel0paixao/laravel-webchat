import { Conversation, User } from '@/types';
import React, { useState } from 'react';
import UserBox from './UserBox';

interface Props {
    conversations: Conversation[];
    active: Conversation | null;
    friends: User[];
    typingConversationHash: string | null;
    onSelect: (conversation: Conversation) => void;
    onCreateGroup: (name: string, userIds: number[]) => void;
}

export default function UsersList({conversations, active, friends, typingConversationHash, onSelect, onCreateGroup}: Props) {
    const [creating, setCreating] = useState(false);
    const [name, setName] = useState('');
    const [selected, setSelected] = useState<number[]>([]);
    const toggle = (id: number) => setSelected(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || selected.length < 2) return;
        onCreateGroup(name.trim(), selected);
        setName('');
        setSelected([]);
        setCreating(false);
    };

    return <div className="flex h-full w-full flex-col">
        <div className="flex items-center gap-2 border-b border-slate-200 p-3 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Chats</h2>
            <button type="button" onClick={() => setCreating(v => !v)} className="ml-auto rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">New group</button>
        </div>
        {creating && <form onSubmit={submit} className="space-y-3 border-b border-slate-200 p-3 dark:border-slate-800">
            <input value={name} onChange={e => setName(e.currentTarget.value)} placeholder="Group name" className="h-10 w-full rounded-md border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
            <div className="grid max-h-44 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
                {friends.map(friend => {
                    const active = selected.includes(friend.id);
                    const initials = friend.name.split(' ').filter(Boolean).slice(0,2).map(part => part[0]).join('').toUpperCase();
                    return <button type="button" key={friend.id} onClick={() => toggle(friend.id)} className={(active ? 'border-purple-400 bg-purple-50 text-purple-900 dark:bg-purple-500/15 dark:text-purple-100' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700') + ' flex min-w-0 items-center gap-2 rounded-lg border p-2 text-left transition'}>
                        <span className={(active ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200') + ' flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold'}>{initials}</span>
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{friend.name}</span>
                        {active && <span className="text-xs font-bold">Added</span>}
                    </button>;
                })}
            </div>
            <button type="submit" className="w-full rounded-md bg-TBL_SECONDARY px-3 py-2 text-xs font-bold text-white disabled:opacity-50" disabled={!name.trim() || selected.length < 2}>Create group</button>
        </form>}
        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
            {conversations.map(conversation => <UserBox key={conversation.hash} conversation={conversation} onClick={() => onSelect(conversation)} active={active?.hash === conversation.hash} typing={typingConversationHash === conversation.hash} />)}
        </ul>
    </div>;
}
