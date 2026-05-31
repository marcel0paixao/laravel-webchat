import React, {PropsWithChildren} from 'react';
import { Head } from '@inertiajs/inertia-react';
interface Props { title: string; }
export default function GuestLayout({title, children}: PropsWithChildren<Props>) {
    return <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100"><Head title={title} /><main className="auth-screen flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 font-sans antialiased">{children}</main></div>;
}
