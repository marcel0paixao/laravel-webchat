import React, { MouseEventHandler } from "react";
import { Message } from "@/types";

interface Props {
    name: string,
    active?: boolean,
    last_message: Message | null,
    onClick?: MouseEventHandler;
}

export default function UserBox({name, active, last_message, onClick = () => {}}: Props){
    let timeFormat = new Intl.DateTimeFormat('en-GB', {
        hour: "numeric",
        minute: "numeric",
        day: "numeric",
        month: "long"
    })
    let formatedTime = timeFormat.format(new Date(last_message?.created_at ?? new Date()))
    return (
        <li className={"h-18 p-2 border rounded-md border-[#ddd] flex max-w-max cursor-pointer w-full " + (active ? 'bg-gray-100' : 'bg-white')} onClick={onClick}>
            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80" className="w-14 h-14 rounded-full" />
            <div className="ml-2 mt-1 w-[23rem] md:w-[246px]">
                <div className="flex">
                    <h5 className="font-bold truncate">{name}</h5>
                    <span className="font-ligther text-[10px] ml-auto mt-[7px]">{formatedTime}</span>
                  </div>
                <p className="md:truncate text-xs max-w-[100%]">{last_message?.message ?? ''}</p>
            </div>
        </li>
    )
}