import AppLayout from '@/Layouts/AppLayout';
import { Conversation, User } from '@/types';
import { Inertia } from '@inertiajs/inertia';
import { useForm } from '@inertiajs/inertia-react';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import route from 'ziggy-js';

export default function Show({profile}: {profile: User & {is_self?: boolean}}) {
    const [user,setUser]=useState(profile);
    const [menu,setMenu]=useState(false);
    const [requestMenu,setRequestMenu]=useState(false);
    const [photoPreview, setPhotoPreview] = useState(profile.profile_photo_url);
    const fileRef = useRef<HTMLInputElement | null>(null);
    const form = useForm({name: profile.name, bio: profile.bio ?? '', profile_photo: null as File | null});
    const isSelf = Boolean(profile.is_self);
    const add=()=>axios.post(route('friends.store',{id:user.id})).then(r=>setUser({...user, friendship_status:r.data.friendship.status, friendship_direction:'outgoing'}));
    const accept=()=>axios.post(route('friends.accept',{id:user.id})).then(r=>{ setUser({...user, friendship_status:r.data.friendship.status, friendship_direction:null}); setRequestMenu(false); });
    const reject=()=>axios.delete(route('friends.reject',{id:user.id})).then(()=>{ setUser({...user, friendship_status:null, friendship_direction:null}); setRequestMenu(false); });
    const cancel=()=>axios.delete(route('friends.destroy',{id:user.id})).then(()=>setUser({...user, friendship_status:null, friendship_direction:null}));
    const unfriend=()=>axios.delete(route('friends.destroy',{id:user.id})).then(()=>setUser({...user, friendship_status:null, friendship_direction:null}));
    const block=()=>axios.post(route('block.users',{id:user.id})).then(()=>Inertia.visit(route('profiles.search')));
    const report=()=>axios.post(route('reports.store',{id:user.id, reason:'profile_report'})).then(()=>setMenu(false));
    const chat=()=>axios.post(route('conversations.direct',{user:user.id})).then((r:{data:{conversation:Conversation}})=>Inertia.visit(route('chat.show',{hash:r.data.conversation.hash})));
    const save=(e:React.FormEvent)=>{ e.preventDefault(); form.post(route('profiles.update'), { forceFormData: true, onSuccess: () => setUser(current => ({...current, name: form.data.name, bio: form.data.bio, profile_photo_url: photoPreview})) }); };
    const initials = (form.data.name || user.name).split(' ').filter(Boolean).slice(0,2).map(part => part[0]).join('').toUpperCase();
    const hasPhoto = Boolean(user.profile_photo_path || form.data.profile_photo);
    const avatar = hasPhoto ? <img src={photoPreview} className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center bg-TBL_SECONDARY text-2xl font-bold text-white">{initials}</span>;
    useEffect(() => {
        const listener = (event: Event) => {
            const detail = (event as CustomEvent).detail as {userId: number; status: 'pending' | 'accepted' | null; direction: 'incoming' | 'outgoing' | null};
            if (Number(detail.userId) !== Number(user.id)) return;
            setUser(current => ({...current, friendship_status: detail.status, friendship_direction: detail.direction}));
        };
        window.addEventListener('webchats:friendship-updated', listener);
        return () => window.removeEventListener('webchats:friendship-updated', listener);
    }, [user.id]);

    return <AppLayout title={user.name}>
        <div className="mx-auto max-w-3xl overflow-visible rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start gap-4">
                {isSelf ? <button type="button" onClick={() => fileRef.current?.click()} className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-slate-300 dark:border-slate-700">
                    {avatar}
                    <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-xs font-semibold text-white opacity-0 transition group-hover:bg-black/45 group-hover:opacity-100">Change</span>
                </button> : <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full">{hasPhoto ? <img src={user.profile_photo_url} className="h-full w-full object-cover" /> : avatar}</div>}
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{user.name}</h1>
                    <p className="text-slate-400">{user.handle}</p>
                    {!isSelf && <p className="mt-4 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{user.bio || 'No bio yet.'}</p>}
                </div>
                {!isSelf && <div className="relative flex gap-2">
                    {user.friendship_status==='accepted' && <button onClick={chat} className="rounded-md bg-TBL_SECONDARY px-4 py-2 text-sm font-semibold text-white">Chat</button>}
                    {user.friendship_status==='pending' && user.friendship_direction==='incoming' && <div className="relative">
                        <button onClick={()=>setRequestMenu(v=>!v)} className="rounded-md bg-TBL_SECONDARY px-4 py-2 text-sm font-semibold text-white">Respond request</button>
                        {requestMenu && <div className="absolute right-0 top-11 z-20 w-40 rounded-md border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                            <button onClick={accept} className="block w-full rounded px-3 py-2 text-left text-sm text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-slate-700">Accept</button>
                            <button onClick={reject} className="block w-full rounded px-3 py-2 text-left text-sm font-semibold text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10">Reject</button>
                        </div>}
                    </div>}
                    {user.friendship_status==='pending' && user.friendship_direction==='outgoing' && <button onClick={cancel} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Cancel request</button>}
                    {!user.friendship_status && <button onClick={add} className="rounded-md bg-TBL_SECONDARY px-4 py-2 text-sm font-semibold text-white">Add friend</button>}
                    <button onClick={()=>setMenu(v=>!v)} className="rounded-md border border-slate-300 px-3 py-2 text-slate-700 dark:border-slate-700 dark:text-slate-200">...</button>
                    {menu&&<div className="absolute right-0 top-11 z-10 w-44 rounded-md border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">{user.friendship_status==='accepted'&&<button onClick={unfriend} className="block w-full rounded px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-700">Unfriend</button>}<button onClick={block} className="block w-full rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-slate-700">Block</button><button onClick={report} className="block w-full rounded px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-700">Report</button></div>}
                </div>}
            </div>
            {isSelf && <form onSubmit={save} className="mt-8 space-y-4">
                <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Name</label><input value={form.data.name} onChange={e=>form.setData('name', e.currentTarget.value)} className="mt-1 h-11 w-full rounded-md border-slate-300 bg-white px-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white" /></div>
                <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Handle</label><input value={user.handle} disabled className="mt-1 h-11 w-full rounded-md border-slate-300 bg-slate-50 px-3 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400" /></div>
                <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Bio</label><textarea value={form.data.bio} onChange={e=>form.setData('bio', e.currentTarget.value)} rows={5} className="mt-1 w-full rounded-md border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white" /></div>
                <input ref={fileRef} type="file" accept="image/*" onChange={e=>{ const file = e.currentTarget.files?.[0] ?? null; form.setData('profile_photo', file); if (file) setPhotoPreview(URL.createObjectURL(file)); }} className="sr-only" />
                <button disabled={form.processing} className="rounded-md bg-TBL_SECONDARY px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Save profile</button>
            </form>}
        </div>
    </AppLayout>;
}
