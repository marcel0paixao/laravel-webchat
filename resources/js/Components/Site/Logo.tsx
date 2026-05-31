import { ChatAlt2Icon } from '@heroicons/react/outline';
import React from 'react';

interface Props { compact?: boolean; className?: string; }

export default function Logo({compact = false, className = ''}: Props) {
    return <div className={`inline-flex items-center gap-2 ${className}`}>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-lg shadow-purple-950/30">
            <ChatAlt2Icon className="h-5 w-5" />
        </span>
        {!compact && <span className="font-bold tracking-normal text-slate-900 dark:text-white">Webchats</span>}
    </div>;
}
