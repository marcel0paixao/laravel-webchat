import React, { PropsWithChildren } from 'react';
import { Head } from '@inertiajs/inertia-react';
import Header from '@/Components/Site/Header';
interface Props { title: string; }
export default function AppLayout({ title, children }: PropsWithChildren<Props>) {
    return <div className="h-screen overflow-hidden bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100"><Head title={title} /><Header /><main className="h-[calc(100vh-4rem)] overflow-hidden bg-slate-100 px-3 py-3 dark:bg-slate-900 sm:px-5">{children}</main></div>;
}
