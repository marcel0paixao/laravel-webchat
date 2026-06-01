import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';

interface Props {
    open: boolean;
    title: string;
    onClose: () => void;
    endpoint: string;
}

export default function ReportDialog({open, title, onClose, endpoint}: Props) {
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!open) return;
        const closeOnOutsideClick = (event: MouseEvent) => {
            if (dialogRef.current?.contains(event.target as Node)) return;
            onClose();
        };
        document.addEventListener('mousedown', closeOnOutsideClick);
        return () => document.removeEventListener('mousedown', closeOnOutsideClick);
    }, [open, onClose]);

    useEffect(() => {
        if (!open) return;
        setReason('');
        setDetails('');
        setSent(false);
        setError(null);
    }, [open, endpoint]);

    if (!open) return null;

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!reason.trim() || processing) return;
        setProcessing(true);
        setError(null);
        axios.post(endpoint, {reason: reason.trim(), details: details.trim() || null})
            .then(() => setSent(true))
            .catch(err => setError(err.response?.data?.message ?? 'Unable to send report.'))
            .finally(() => setProcessing(false));
    };

    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div ref={dialogRef} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            {sent ? <>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Report sent</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Thanks. The moderation team can now review the reason, details, and conversation history.</p>
                <button type="button" onClick={onClose} className="mt-5 w-full rounded-md bg-TBL_SECONDARY px-4 py-2 text-sm font-bold text-white">Done</button>
            </> : <form onSubmit={submit} className="space-y-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tell moderators what happened.</p>
                </div>
                <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Reason</label>
                    <input value={reason} onChange={event => setReason(event.currentTarget.value)} maxLength={120} className="mt-1 h-11 w-full rounded-md border-slate-300 bg-white px-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="Spam, abuse, scam..." />
                </div>
                <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Details</label>
                    <textarea value={details} onChange={event => setDetails(event.currentTarget.value)} rows={5} maxLength={2000} className="mt-1 w-full rounded-md border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="Add context for the moderator." />
                </div>
                {error && <p className="text-sm font-semibold text-red-600 dark:text-red-300">{error}</p>}
                <div className="flex gap-2">
                    <button type="button" onClick={onClose} className="flex-1 rounded-md border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Cancel</button>
                    <button disabled={!reason.trim() || processing} className="flex-1 rounded-md bg-TBL_SECONDARY px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{processing ? 'Sending...' : 'Send report'}</button>
                </div>
            </form>}
        </div>
    </div>;
}
