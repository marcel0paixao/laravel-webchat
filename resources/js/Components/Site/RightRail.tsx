import useTypedPage from '@/Hooks/useTypedPage';
import { CollectionIcon, ShieldCheckIcon } from '@heroicons/react/outline';
import { InertiaLink } from '@inertiajs/inertia-react';
import React from 'react';
import route from 'ziggy-js';

export default function RightRail() {
    const { user } = useTypedPage().props;
    if (!user?.is_admin) return null;

    return <aside className="hidden h-full w-16 shrink-0 border-l border-slate-200 bg-white px-2 py-3 dark:border-slate-800 dark:bg-slate-900 lg:block">
        <nav className="flex flex-col items-center gap-2">
            <InertiaLink href={route('admin.reports.index')} title="Admin reports" className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-purple-700 transition hover:bg-purple-50 dark:text-purple-200 dark:hover:bg-slate-800">
                <ShieldCheckIcon className="h-5 w-5" />
            </InertiaLink>
            <button type="button" title="Posts coming soon" className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 dark:text-slate-500">
                <CollectionIcon className="h-5 w-5" />
            </button>
        </nav>
    </aside>;
}
