import Constants from "@/Constants";
import useTypedPage from "@/Hooks/useTypedPage";
import { Message } from "@/types";
import React, { useEffect } from "react";
import MessageBox from "./MessageBox";

interface Props{
    messages: Array<Message>;
}

export default function MessagesList({messages}: Props){
    const { user } = useTypedPage().props;

    return (
        <ul className="space-y-4">
            {messages.map(message =>
                <MessageBox date={new Intl.DateTimeFormat('en-GB', {
                    hour: "numeric",
                    minute: "numeric",
                    day: "numeric",
                    month: "short",
                    year: "2-digit"
                  }).format(new Date(message.created_at))} byOwn={message.from == user.id} key={message.id}>
                    {message.message}
                </MessageBox>)}
            
        </ul>
    )
}