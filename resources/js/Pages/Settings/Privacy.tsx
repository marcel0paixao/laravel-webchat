import FormButton from '@/Components/Form/Button';
import AppLayout from '@/Layouts/AppLayout';
import { ShieldCheckIcon } from '@heroicons/react/outline';
import { useForm } from '@inertiajs/inertia-react';
import { User } from '@/types';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import route from 'ziggy-js';

export default function Privacy() {
    const [blocked,setBlocked]=useState<User[]>([]);
    const form = useForm({password: ''});
    useEffect(() => { axios.get(route('blocked.users')).then(r=>setBlocked(r.data.users)); }, []);
    const unblock=(id:number)=>axios.delete(route('unblock.users',{id})).then(()=>setBlocked(current=>current.filter(user=>user.id!==id)));
    const initials = (name: string) => name.split(' ').filter(Boolean).slice(0,2).map(part=>part[0]).join('').toUpperCase();
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.delete(route('current-user.destroy'), { preserveScroll: true });
    };

    return <AppLayout title="Privacy settings">
        <div className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-50 text-purple-700 dark:bg-slate-800 dark:text-purple-300"><ShieldCheckIcon className="h-5 w-5" /></span>
                <div><h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1><p className="text-sm text-slate-500 dark:text-slate-400">Control account privacy and ownership.</p></div>
            </div>
            <div className="mt-6 border-b border-slate-200 dark:border-slate-800">
                <button className="border-b-2 border-purple-500 px-1 pb-3 text-sm font-semibold text-purple-700 dark:border-purple-400 dark:text-purple-200">Privacy</button>
            </div>
            <section className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="font-semibold text-slate-900 dark:text-white">Blocked users</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">People you blocked cannot message you or start conversations with you.</p>
                <div className="mt-4 space-y-2">
                    {blocked.length === 0 && <p className="rounded-md border border-dashed border-slate-300 px-3 py-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">No blocked users.</p>}
                    {blocked.map(user => <div key={user.id} className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                        {user.profile_photo_path ? <img src={user.profile_photo_url} className="h-10 w-10 rounded-full object-cover" /> : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-TBL_SECONDARY text-xs font-bold text-white">{initials(user.name)}</span>}
                        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p><p className="text-xs text-slate-500">{user.handle}</p></div>
                        <button type="button" onClick={()=>unblock(user.id)} className="rounded-md border border-purple-300 px-3 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-50 dark:border-purple-500/40 dark:text-purple-200 dark:hover:bg-purple-500/10">Unblock</button>
                    </div>)}
                </div>
            </section>
            <form onSubmit={submit} className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="font-semibold text-slate-900 dark:text-white">Delete account</h2>
                        <p className="mt-1 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">This removes your profile, sessions, and account access permanently. Confirm your password to continue.</p>
                    </div>
                    <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">Permanent</span>
                </div>
                <input type="password" value={form.data.password} onChange={e=>form.setData('password', e.currentTarget.value)} placeholder="Confirm password" className="mt-5 h-11 w-full rounded-md border-slate-300 bg-white px-3 text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500" />
                {form.errors.password && <p className="mt-2 text-sm text-rose-300">{form.errors.password}</p>}
                <FormButton disabled={form.processing} className="mt-4 bg-slate-800 text-white hover:bg-rose-600 dark:bg-slate-700 dark:hover:bg-rose-700">Delete account</FormButton>
            </form>
        </div>
    </AppLayout>;
}
