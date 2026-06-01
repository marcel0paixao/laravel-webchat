import AppLayout from '@/Layouts/AppLayout';
import { InertiaLink } from '@inertiajs/inertia-react';
import React from 'react';
import route from 'ziggy-js';

type Report = {
    id: number;
    target_type: 'user' | 'group';
    reason: string;
    status: string;
    resolution: string | null;
    reporter: {name: string; username: string};
    reported: {name: string; username: string} | null;
    conversation: {name: string | null; hash: string; type: string} | null;
    created_at: string;
};

export default function Index({reports}: {reports: {data: Report[]}}) {
    return <AppLayout title="Admin reports">
        <div className="mx-auto h-full max-w-6xl overflow-y-auto rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Reports</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Review user and group reports.</p>
                </div>
            </div>
            <div className="space-y-2">
                {reports.data.length === 0 && <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">No reports yet.</p>}
                {reports.data.map(report => <InertiaLink key={report.id} href={route('admin.reports.show', {report: report.id})} className="block rounded-md border border-slate-200 p-4 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                    <div className="flex items-start gap-3">
                        <span className={(report.status === 'open' ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200') + ' rounded-full px-2.5 py-1 text-xs font-bold uppercase'}>{report.status}</span>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{report.target_type === 'group' ? `Group: ${report.conversation?.name ?? report.conversation?.hash}` : `User: ${report.reported?.name ?? 'Unknown'}`}</p>
                            <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{report.reason}</p>
                        </div>
                        <span className="text-xs text-slate-400">{new Intl.DateTimeFormat('en-GB', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}).format(new Date(report.created_at))}</span>
                    </div>
                </InertiaLink>)}
            </div>
        </div>
    </AppLayout>;
}
