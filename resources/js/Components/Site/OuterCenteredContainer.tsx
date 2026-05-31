import React, {PropsWithChildren} from 'react';
interface Props { className?: string; }
export default function OuterCenteredContainer({children, className = ''}: PropsWithChildren<Props>) { return <div className={`mx-auto h-full w-full max-w-md ${className}`}>{children}</div>; }
