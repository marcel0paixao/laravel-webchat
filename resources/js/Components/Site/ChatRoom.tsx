import React, { PropsWithChildren } from "react";

interface Props{
    
}

export default function ChatRoom({children, ...props}: PropsWithChildren<Props>){
    return (
        <div className="border-l border-r bg-white border-[#ddd] w-full rounded-lg h-[750px] p-4 flex">
            {children}
        </div>
    )
}