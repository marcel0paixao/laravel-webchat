import FormButton from '@/Components/Form/Button';
import AppLayout from '@/Layouts/AppLayout';
import { ShieldCheckIcon } from '@heroicons/react/outline';
import { useForm } from '@inertiajs/inertia-react';
import React from 'react';
import route from 'ziggy-js';

export default function Privacy() {
    const form = useForm({password: ''});
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
