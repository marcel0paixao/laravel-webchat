import React, { PropsWithChildren } from "react";

interface Props{
    byOwn: boolean
    date: string,
}

export default function MessageBox({children, byOwn, date}: PropsWithChildren<Props>){
    return (
        <li className={"border rounded-md p-2 text-md text-black bg-[#eee] max-w-[80%] message " + (byOwn ? ' ml-auto' : '')}>
            <p className="text-[14px]">{children}</p>
            <p className="text-[10px] font-lighter text-right">{date}</p>
        </li>
    )
}