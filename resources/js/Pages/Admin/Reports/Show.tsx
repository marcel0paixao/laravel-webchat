import AppLayout from '@/Layouts/AppLayout';
import { Message } from '@/types';
import { Inertia } from '@inertiajs/inertia';
import React, { useState } from 'react';
import route from 'ziggy-js';

type Report = {
    id: number;
    target_type: 'user' | 'group';
    reason: string;
    details: string | null;
    status: string;
    resolution: string | null;
    reporter: {id: number; name: string; username: string};
    reported: {id: number; name: string; username: string; banned_at?: string | null} | null;
    conversation: {id: number; hash: string; name: string | null; type: string; banned_at?: string | null} | null;
    created_at: string;
};

export default function Show({report, conversation, messages}: {report: Report; conversation: Report['conversation']; messages: Message[]}) {
    const [reason, setReason] = useState(report.reason);
    const [details, setDetails] = useState(report.details ?? '');
    const target = report.target_type === 'group' ? (conversation?.name ?? 'Group') : (report.reported?.name ?? 'User');
    const post = (href: string, data: any = {}) => Inertia.post(href, data, {preserveScroll: true});

    return <AppLayout title={`Report #${report.id}`}>
        <div className="mx-auto grid h-full max-w-7xl gap-4 overflow-hidden lg:grid-cols-[24rem,1fr]">
            <section className="overflow-y-auto rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <span className={(report.status === 'open' ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200') + ' rounded-full px-2.5 py-1 text-xs font-bold uppercase'}>{report.status}</span>
                <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{target}</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Reported by {report.reporter.name}</p>
                <div className="mt-5 space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Ban reason</label>
                        <input value={reason} onChange={event => setReason(event.currentTarget.value)} className="mt-1 h-10 w-full rounded-md border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Report details</label>
                        <textarea value={details} onChange={event => setDetails(event.currentTarget.value)} rows={5} className="mt-1 w-full rounded-md border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                    </div>
                </div>
                <div className="mt-5 grid gap-2">
                    {report.reported && !report.reported.banned_at && <button type="button" onClick={() => post(route('admin.reports.ban-user', {report: report.id}), {reason, details})} className="rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">Ban user</button>}
                    {report.reported?.banned_at && <button type="button" onClick={() => post(route('admin.reports.unban-user', {report: report.id}))} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700">Unban user</button>}
                    {conversation?.type === 'group' && !conversation.banned_at && <button type="button" onClick={() => post(route('admin.reports.ban-group', {report: report.id}), {reason})} className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">Ban group</button>}
                    {conversation?.type === 'group' && conversation.banned_at && <button type="button" onClick={() => post(route('admin.reports.unban-group', {report: report.id}))} className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300">Unban group</button>}
                    <button type="button" onClick={() => post(route('admin.reports.dismiss', {report: report.id}))} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Dismiss report</button>
                </div>
                {report.resolution && <p className="mt-4 rounded-md bg-slate-100 p-3 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">Resolution: {report.resolution}</p>}
            </section>
            <section className="min-h-0 overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Conversation history</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{conversation ? 'Recent messages available to moderation.' : 'No conversation attached to this report.'}</p>
                </div>
                <div className="h-[calc(100%-4.5rem)] overflow-y-auto p-5">
                    {messages.length === 0 && <p className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">No messages to review.</p>}
                    <div className="space-y-3">
                        {messages.map(message => <div key={message.id} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                            <div className="mb-1 flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{message.sender?.name ?? 'Unknown'}</span>
                                <span className="text-xs text-slate-400">{new Intl.DateTimeFormat('en-GB', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}).format(new Date(message.created_at))}</span>
                            </div>
                            <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{message.message || `[${message.type}]`}</p>
                        </div>)}
                    </div>
                </div>
            </section>
        </div>
    </AppLayout>;
}
