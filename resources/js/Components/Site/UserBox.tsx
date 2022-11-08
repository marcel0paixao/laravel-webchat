import React, { MouseEventHandler } from "react";

interface Props {
    id: number,
    name: string,
    active?: boolean,
    onClick?: MouseEventHandler;
}

export default function UserBox({id, name, active, onClick = () => {}}: Props){
    return (
        <li className={"h-18 p-2 border rounded-md border-[#ddd] flex w-full cursor-pointer " + (active ? 'bg-gray-100' : 'bg-white')} onClick={onClick}>
            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80" className="w-14 h-14 rounded-full" />
            <div className="ml-2 mt-1 w-full">
                <h5 className="font-bold truncate">{name}</h5>
                <p className="truncate text-xs max-w-[100px]">Mensagem mensagem mensagem mensagem mensagem mensagem mensagem mensagem mensagem mensagem mensagem mensagem</p>
            </div>
            <span className="ml-full font-ligther text-[10px] mt-3">23:59 21/12/2015</span>
        </li>
    )
}