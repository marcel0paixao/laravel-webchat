import { User } from "@/types";
import axios from "axios";
import React, { PropsWithChildren, useState } from "react";
import route from "ziggy-js";

interface Props{
    user: User | null;
}

export default function ChatHeader({user, ...props}: Props){
    const [deleteAction, setDeleteAction] = useState<boolean>(false);
    const [deleteContent, setDeleteContent] = useState<number>(1);

    const deleteConversation = () => {
        axios.delete(route('destroy.messages', {id: user?.id ?? 0}))
        .then(response => {
            if (response.data == 204) {
                setDeleteContent(2);
            }
        })
        .catch(e => console.log(e));
    }

    return (
        <header className="flex h-16 border-b border-[#ccc] w-full">
            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80" className="w-14 h-14 rounded-full" />
            <div className="ml-3 mt-1 min-w-max">
                <h2>{user?.name}</h2>
                <span className="text-[10px] text-gray-400">Last seen one hour ago</span>
            </div>
            <button className="border border-red-500 px-2 h-12 py-1 mt-1 mr-4 ml-auto rounded-md text-red-500" onClick={() => {
                setDeleteAction(true);
            }}>Delete</button>
            {deleteAction && 
                (<div className="absolute text-center left-0 right-0 p-6 mr-auto ml-auto w-[90%] sm:w-96 bg-white border-2 border-gray-300 rounded-md box-shadow">
                    <h2 className="text-xl">{deleteContent == 1 ? `Are you sure you wan't to delete this conversation?` : 'You have successfully deleted this conversation!'}</h2>
                    <div className="flex mt-16">
                        {deleteContent == 1 && <button className="h-10 w-full rounded-md bg-white border-2 border-gray-300" onClick={() => setDeleteAction(false)}>CANCEL</button>}
                        <button className={`h-10 w-full rounded-md ${deleteContent == 1 ? 'ml-4': ''} bg-red-500 border-2 text-white border-gray-300`} onClick={() => {
                            if (deleteContent == 1) {
                                deleteConversation();
                                return;
                            }
                            setDeleteAction(false);
                            setDeleteContent(1);
                        }}>{deleteContent == 1 ? 'DELETE' : 'OK'}</button>
                    </div>
                </div>)
            }
        </header>
    )
}