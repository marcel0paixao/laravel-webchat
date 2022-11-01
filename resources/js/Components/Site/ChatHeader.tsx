import React, { PropsWithChildren } from "react";

interface Props{
    
}

export default function ChatHeader({...props}: Props){
    return (
        <header className="flex h-16 border-b border-[#ccc] w-full">
            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80" className="w-14 h-14 rounded-full" />
            <div className="ml-3 mt-1 min-w-max">
                <h2>Nome Usuário</h2>
                <span className="text-[10px] text-gray-400">Last seen one hour ago</span>
            </div>
            <button className="border border-red-500 px-2 h-12 py-1 mt-1 mr-4 ml-auto rounded-md text-red-500">Delete</button>
        </header>
    )
}