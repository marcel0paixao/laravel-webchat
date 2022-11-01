import React, { PropsWithChildren } from "react";

interface Props{
    
}

export default function ChatRoom({children, ...props}: PropsWithChildren<Props>){
    return (
        <div className="border-l border-r bg-white border-[#ddd]">
            {children}
        </div>
    )
}