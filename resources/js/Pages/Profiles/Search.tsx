import AppLayout from '@/Layouts/AppLayout';
import { User } from '@/types';
import { InertiaLink } from '@inertiajs/inertia-react';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import route from 'ziggy-js';

const historyKey = 'webchats.profileSearchHistory';
type RecentProfile = Pick<User, 'id' | 'name' | 'username' | 'handle' | 'profile_photo_path' | 'profile_photo_url'>;

export default function Search() {
    const [handle,setHandle]=useState('');
    const [users,setUsers]=useState<User[]>([]);
    const [history,setHistory]=useState<RecentProfile[]>(() => {
        try { return JSON.parse(localStorage.getItem(historyKey) || '[]').filter((item: any) => item && typeof item === 'object' && item.id); } catch { return []; }
    });
    const normalized = useMemo(() => handle.trim().replace(/^@/, '').toLowerCase(), [handle]);

    useEffect(()=>{
        if (!normalized) { setUsers([]); return; }
        const id=window.setTimeout(()=>axios.get(route('profiles.api.search',{handle: normalized})).then(r=>setUsers(r.data.users)),250);
        return()=>window.clearTimeout(id);
    },[normalized]);

    const remember = (user: User) => {
        const item = {id:user.id,name:user.name,username:user.username,handle:user.handle,profile_photo_path:user.profile_photo_path,profile_photo_url:user.profile_photo_url};
        const next = [item, ...history.filter(existing => existing.id !== user.id)].slice(0, 8);
        setHistory(next);
        localStorage.setItem(historyKey, JSON.stringify(next));
    };
    const add=(id:number)=>axios.post(route('friends.store',{id})).then(r=>setUsers(u=>u.map(x=>x.id===id?{...x,friendship_status:r.data.friendship.status,friendship_direction:r.data.friendship.requester_id===x.id?'incoming':'outgoing'}:x)));
    const cancel=(id:number)=>axios.delete(route('friends.destroy',{id})).then(()=>setUsers(u=>u.map(x=>x.id===id?{...x,friendship_status:null,friendship_direction:null}:x)));
    const unblock=(id:number)=>axios.delete(route('unblock.users',{id})).then(r=>setUsers(u=>u.map(x=>x.id===id?{...x,is_blocked_by_me:false,friendship_status:r.data.friendship_status ?? null,friendship_direction:r.data.friendship_direction ?? null}:x)));
    const initials = (name: string) => name.split(' ').filter(Boolean).slice(0,2).map(part => part[0]).join('').toUpperCase();

    return <AppLayout title="Search profiles">
        <div className="mx-auto h-full max-w-3xl overflow-y-auto rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Search profiles</h1>
            <input className="mt-4 h-11 w-full rounded-md border-slate-300 bg-white px-3 text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500" value={handle} onChange={e=>setHandle(e.currentTarget.value)} placeholder="Search by @handle" autoFocus />
            {!normalized && history.length > 0 && <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Recent searches</p>
                <div className="space-y-2">{history.map(user => <InertiaLink key={user.id} href={route('profiles.show',{username:user.username})} className="flex items-center gap-3 rounded-md border border-slate-200 p-3 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                    {user.profile_photo_path ? <img src={user.profile_photo_url} className="h-11 w-11 rounded-full object-cover" /> : <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-TBL_SECONDARY text-xs font-bold text-white">{initials(user.name)}</span>}
                    <span className="min-w-0"><span className="block truncate font-semibold text-slate-900 dark:text-white">{user.name}</span><span className="text-sm text-slate-500">{user.handle}</span></span>
                </InertiaLink>)}</div>
            </div>}
            {!normalized && history.length === 0 && <p className="mt-6 text-sm text-slate-400">Type a @handle to search profiles.</p>}
            {normalized && <ul className="mt-4 space-y-2">{users.map(user=><li key={user.id} className="flex items-center gap-3 rounded-md border border-slate-200 p-3 dark:border-slate-800">
                {user.profile_photo_path ? <img src={user.profile_photo_url} className="h-11 w-11 rounded-full object-cover" /> : <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-TBL_SECONDARY text-xs font-bold text-white">{initials(user.name)}</span>}
                <div className="min-w-0"><InertiaLink onClick={()=>remember(user)} href={route('profiles.show',{username:user.username})} className="font-semibold text-slate-900 dark:text-white">{user.name}</InertiaLink><p className="text-sm text-slate-500">{user.handle}</p></div>
                {user.friendship_status==='accepted' && <span className="ml-auto text-sm text-emerald-500">Friends</span>}
                {user.friendship_status==='pending' && user.friendship_direction==='incoming' && <InertiaLink onClick={()=>remember(user)} href={route('profiles.show',{username:user.username})} className="ml-auto rounded-md border border-purple-300 px-3 py-2 text-sm font-semibold text-purple-700 dark:border-purple-500/40 dark:text-purple-200">Respond</InertiaLink>}
                {user.friendship_status==='pending' && user.friendship_direction==='outgoing' && <button onClick={()=>cancel(user.id)} className="ml-auto rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Cancel request</button>}
                {user.is_blocked_by_me && <button onClick={()=>unblock(user.id)} className="ml-auto rounded-md bg-TBL_SECONDARY px-3 py-2 text-sm font-semibold text-white">Unblock</button>}
                {!user.friendship_status && !user.is_blocked_by_me && !user.is_blocked_by_them && <button onClick={()=>add(user.id)} className="ml-auto rounded-md bg-TBL_SECONDARY px-3 py-2 text-sm font-semibold text-white">Add friend</button>}
            </li>)}</ul>}
            {normalized && users.length === 0 && <p className="mt-6 text-sm text-slate-400">No matching handles.</p>}
        </div>
    </AppLayout>;
}
