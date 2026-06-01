import { Head, InertiaLink } from '@inertiajs/inertia-react';
import React, { useState } from 'react';
import route from 'ziggy-js';

export default function Banned({ban}: {ban: {reason: string | null; details: string | null; banned_at: string | null}}) {
    const [appealed, setAppealed] = useState(false);

    return <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <Head title="Account banned" />
        <div className="w-full max-w-lg rounded-lg border border-red-500/30 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-4 inline-flex rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold uppercase text-red-300">Moderation action</div>
            <h1 className="text-2xl font-bold">Your account has been blocked.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">You cannot use Webchats while this moderation decision is active. You can appeal the decision and wait for an admin review.</p>
            <div className="mt-5 rounded-md border border-slate-700 bg-slate-950 p-4">
                <p className="text-sm font-semibold text-slate-200">Reason</p>
                <p className="mt-1 text-sm text-slate-400">{ban.reason || 'No public reason provided.'}</p>
                {ban.details && <p className="mt-3 whitespace-pre-wrap text-sm text-slate-400">{ban.details}</p>}
            </div>
            {appealed ? <p className="mt-5 rounded-md bg-purple-500/10 p-3 text-sm font-semibold text-purple-200">Appeal noted. A future moderation workflow can expand this into a dedicated queue.</p> : <button type="button" onClick={() => setAppealed(true)} className="mt-5 w-full rounded-md bg-TBL_SECONDARY px-4 py-2 text-sm font-bold text-white">Appeal decision</button>}
            <InertiaLink method="post" as="button" href={route('logout')} className="mt-3 w-full rounded-md border border-slate-700 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-slate-800">Log out</InertiaLink>
        </div>
    </div>;
}
