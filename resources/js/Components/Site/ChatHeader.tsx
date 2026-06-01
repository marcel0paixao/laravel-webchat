import { Conversation, User } from '@/types';
import { ArrowLeftIcon, BanIcon, DotsVerticalIcon, FlagIcon, LogoutIcon, TrashIcon, UserAddIcon } from '@heroicons/react/outline';
import { Inertia } from '@inertiajs/inertia';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import route from 'ziggy-js';
import useTypedPage from '@/Hooks/useTypedPage';

interface Props { conversation: Conversation; onBack: () => void; onDeleted: () => void; onBlocked: () => void; onConversationUpdated: (conversation: Conversation) => void; }

export default function ChatHeader({conversation,onBack,onDeleted,onBlocked,onConversationUpdated}: Props) {
    const { user: currentUser } = useTypedPage().props;
    const headerRef = useRef<HTMLElement | null>(null);
    const [menu,setMenu]=useState(false);
    const [membersOpen,setMembersOpen]=useState(false);
    const [groupName,setGroupName]=useState(conversation.name);
    const [participants,setParticipants]=useState(conversation.participants);
    const [currentRole,setCurrentRole]=useState(conversation.current_user_role ?? null);
    const [addOpen,setAddOpen]=useState(false);
    const [friends,setFriends]=useState<User[]>([]);
    const [selectedToAdd,setSelectedToAdd]=useState<number[]>([]);
    const [adding,setAdding]=useState(false);
    const [addError,setAddError]=useState<string | null>(null);
    useEffect(() => {
        setGroupName(conversation.name);
        setParticipants(conversation.participants);
        setCurrentRole(conversation.current_user_role ?? null);
        setMembersOpen(false);
        setAddOpen(false);
        setSelectedToAdd([]);
        setAddError(null);
        setMenu(false);
    }, [conversation.hash, conversation.name, conversation.participants, conversation.current_user_role]);
    useEffect(() => {
        if (!menu && !membersOpen) return;
        const closeOnOutsideClick = (event: MouseEvent) => {
            if (headerRef.current?.contains(event.target as Node)) return;
            setMenu(false);
            setMembersOpen(false);
            setAddOpen(false);
        };
        document.addEventListener('mousedown', closeOnOutsideClick);
        return () => document.removeEventListener('mousedown', closeOnOutsideClick);
    }, [menu, membersOpen]);
    const initials=groupName.split(' ').filter(Boolean).slice(0,2).map(n=>n[0]).join('').toUpperCase();
    const partner = conversation.partner;
    const canManage = conversation.type === 'group' && (currentRole === 'owner' || currentRole === 'admin');
    const block=()=> partner ? axios.post(route('block.users',{id:partner.id})).then(onBlocked) : undefined;
    const remove=()=> partner ? axios.delete(route('destroy.messages',{id:partner.id})).then(onDeleted) : onDeleted();
    const openHeader = () => { if (partner) Inertia.visit(route('profiles.show', {username: partner.username})); else if (conversation.type === 'group') setMembersOpen(v => !v); };
    const sync = (next: Conversation) => { setGroupName(next.name); setParticipants(next.participants); setCurrentRole(next.current_user_role ?? null); onConversationUpdated(next); };
    const saveName = () => axios.patch(route('conversations.groups.update', {hash: conversation.hash}), {name: groupName}).then(r => sync(r.data.conversation));
    const availableFriends = friends.filter(friend => !participants.some(member => Number(member.id) === Number(friend.id)));
    const toggleAdd = (id: number) => setSelectedToAdd(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
    const openAddMembers = () => {
        setAddOpen(value => !value);
        setAddError(null);
        if (friends.length === 0) axios.get(route('load.users')).then(r => setFriends(r.data.users));
    };
    const addMembers = () => {
        if (selectedToAdd.length === 0 || adding) return;
        setAdding(true);
        setAddError(null);
        axios.post(route('conversations.groups.members.add', {hash: conversation.hash}), {user_ids: selectedToAdd})
            .then(r => {
                sync(r.data.conversation);
                setSelectedToAdd([]);
                setAddOpen(false);
            })
            .catch(err => setAddError(err.response?.data?.message ?? 'Unable to add members.'))
            .finally(() => setAdding(false));
    };
    const promote = (id: number) => axios.post(route('conversations.groups.members.promote', {hash: conversation.hash, user: id})).then(r => sync(r.data.conversation));
    const demote = (id: number) => axios.post(route('conversations.groups.members.demote', {hash: conversation.hash, user: id})).then(r => sync(r.data.conversation));
    const removeMember = (id: number) => axios.delete(route('conversations.groups.members.remove', {hash: conversation.hash, user: id})).then(r => sync(r.data.conversation));
    const leaveGroup = () => axios.delete(route('conversations.groups.leave', {hash: conversation.hash})).then(r => { setMenu(false); setMembersOpen(false); sync(r.data.conversation); });
    const reportGroup = () => axios.post(route('conversations.groups.report', {hash: conversation.hash}), {reason:'group_report'}).then(()=>setMenu(false));

    return <header ref={headerRef} className="relative flex h-16 items-center border-b border-slate-200 px-3 dark:border-slate-800">
        <button type="button" className="mr-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-TBL_SECONDARY md:hidden" onClick={onBack}><ArrowLeftIcon className="h-5 w-5" /></button>
        <button type="button" onClick={openHeader} className="flex min-w-0 items-center rounded-xl px-2 py-1.5 text-left transition hover:bg-slate-100 focus:bg-slate-100 dark:hover:bg-slate-800/80 dark:focus:bg-slate-800/80">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-TBL_SECONDARY text-sm font-bold text-white">{initials}</div>
            <div className="ml-3 min-w-0">
                <h2 className="truncate text-sm font-semibold text-slate-900 dark:text-white">{groupName}</h2>
                {conversation.type === 'direct' && partner && <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400"><span className={(partner.is_online?'bg-emerald-500':'bg-slate-400')+' h-2 w-2 rounded-full'} />{partner.is_online?'Online':'Offline'}</span>}
                {conversation.type === 'group' && <span className="text-[11px] text-slate-400">{participants.length} members</span>}
            </div>
        </button>
        <button type="button" onClick={()=>setMenu(v=>!v)} className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-300"><DotsVerticalIcon className="h-5 w-5" /></button>
        {menu && <div className="absolute right-3 top-14 z-20 w-48 rounded-md border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
            <button type="button" onClick={remove} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-700"><TrashIcon className="h-4 w-4" />Delete conversation</button>
            {partner && <button type="button" onClick={block} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-slate-700"><BanIcon className="h-4 w-4" />Block user</button>}
            {conversation.type === 'group' && <button type="button" onClick={reportGroup} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-700"><FlagIcon className="h-4 w-4" />Report group</button>}
            {conversation.type === 'group' && <button type="button" onClick={leaveGroup} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-slate-700"><LogoutIcon className="h-4 w-4" />Leave group</button>}
        </div>}
        {membersOpen && conversation.type === 'group' && <div className="absolute left-3 right-3 top-14 z-30 rounded-lg border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-700 dark:bg-slate-800 sm:left-auto sm:w-96">
            <div className="mb-3 flex items-center gap-2">
                {canManage ? <input value={groupName} onChange={e=>setGroupName(e.currentTarget.value)} className="h-10 min-w-0 flex-1 rounded-md border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white" /> : <h3 className="min-w-0 flex-1 truncate text-sm font-bold text-slate-900 dark:text-white">{groupName}</h3>}
                {canManage && <button type="button" onClick={saveName} className="rounded-md bg-TBL_SECONDARY px-3 py-2 text-xs font-bold text-white">Save</button>}
            </div>
            {canManage && <div className="relative mb-3">
                <button type="button" onClick={openAddMembers} className="flex w-full items-center justify-center gap-2 rounded-md border border-purple-300 bg-purple-50 px-3 py-2 text-sm font-bold text-purple-800 transition hover:bg-purple-100 dark:border-purple-500/40 dark:bg-purple-500/10 dark:text-purple-100 dark:hover:bg-purple-500/20"><UserAddIcon className="h-4 w-4" />Add members</button>
                {addOpen && <div className="absolute left-0 right-0 top-11 z-40 rounded-lg border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                    {availableFriends.length === 0 && <p className="px-2 py-6 text-center text-sm text-slate-500 dark:text-slate-400">No available friends to add.</p>}
                    {availableFriends.length > 0 && <div className="max-h-56 space-y-2 overflow-y-auto">
                        {availableFriends.map(friend => {
                            const active = selectedToAdd.includes(friend.id);
                            const initials = friend.name.split(' ').filter(Boolean).slice(0,2).map(part=>part[0]).join('').toUpperCase();
                            return <button type="button" key={friend.id} onClick={() => toggleAdd(friend.id)} className={(active ? 'border-purple-400 bg-purple-50 text-purple-900 dark:bg-purple-500/15 dark:text-purple-100' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700') + ' flex w-full min-w-0 items-center gap-2 rounded-lg border p-2 text-left transition'}>
                                <span className={(active ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200') + ' flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold'}>{initials}</span>
                                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{friend.name}</span>
                                {active && <span className="text-xs font-bold">Selected</span>}
                            </button>;
                        })}
                    </div>}
                    {addError && <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-300">{addError}</p>}
                    <button type="button" onClick={addMembers} disabled={selectedToAdd.length === 0 || adding} className="mt-2 w-full rounded-md bg-TBL_SECONDARY px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{adding ? 'Adding...' : `Add ${selectedToAdd.length || ''}`}</button>
                </div>}
            </div>}
            <div className="max-h-80 space-y-2 overflow-y-auto">
                {participants.map(member => {
                    const role = member.pivot?.role ?? 'member';
                    const isSelf = Number(member.id) === Number(currentUser.id);
                    return <div key={member.id} className="flex items-center gap-2 rounded-md border border-slate-200 p-2 dark:border-slate-700">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-TBL_SECONDARY text-xs font-bold text-white">{member.name.split(' ').filter(Boolean).slice(0,2).map(part=>part[0]).join('').toUpperCase()}</div>
                        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{member.name}{isSelf ? ' (you)' : ''}</p><p className="text-xs capitalize text-slate-400">{role}</p></div>
                        {canManage && !isSelf && role !== 'owner' && <div className="flex gap-1">
                            {role !== 'admin' && <button type="button" onClick={() => promote(member.id)} className="rounded-md border border-purple-300 px-2 py-1 text-xs font-semibold text-purple-700 dark:border-purple-500 dark:text-purple-200">Admin</button>}
                            {currentRole === 'owner' && role === 'admin' && <button type="button" onClick={() => demote(member.id)} className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200">Remove admin</button>}
                            <button type="button" onClick={() => removeMember(member.id)} className="rounded-md border border-red-300 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">Remove</button>
                        </div>}
                    </div>;
                })}
            </div>
            <button type="button" onClick={leaveGroup} className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-100 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"><LogoutIcon className="h-4 w-4" />Leave group</button>
        </div>}
    </header>;
}
