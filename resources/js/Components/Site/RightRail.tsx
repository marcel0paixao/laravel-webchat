import useTypedPage from '@/Hooks/useTypedPage';
import { CollectionIcon, ShieldCheckIcon } from '@heroicons/react/outline';
import { InertiaLink } from '@inertiajs/inertia-react';
import React from 'react';
import route from 'ziggy-js';

export default function RightRail() {
    const { user } = useTypedPage().props;
    if (!user?.is_admin) return null;

    return <aside className="group hidden h-full w-16 shrink-0 overflow-hidden border-r border-slate-200 bg-white px-2 py-3 transition-all duration-200 hover:w-56 dark:border-slate-800 dark:bg-slate-900 lg:block">
        <nav className="flex flex-col gap-2">
            <InertiaLink href={route('admin.reports.index')} title="Admin reports" className="flex h-11 items-center gap-3 rounded-xl px-3 text-purple-700 transition hover:bg-purple-50 dark:text-purple-200 dark:hover:bg-slate-800">
                <ShieldCheckIcon className="h-5 w-5 shrink-0" />
                <span className="whitespace-nowrap text-sm font-bold opacity-0 transition-opacity group-hover:opacity-100">Reports</span>
            </InertiaLink>
            <button type="button" title="Posts coming soon" className="flex h-11 items-center gap-3 rounded-xl px-3 text-slate-400 dark:text-slate-500">
                <CollectionIcon className="h-5 w-5 shrink-0" />
                <span className="whitespace-nowrap text-sm font-semibold opacity-0 transition-opacity group-hover:opacity-100">Posts soon</span>
            </button>
        </nav>
    </aside>;
}
