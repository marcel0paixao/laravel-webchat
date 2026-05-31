import React, { PropsWithChildren } from "react";
export default function ChatRoom({children}: PropsWithChildren<{}>){ return <div className="flex h-full min-h-0 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">{children}</div>; }
