import Chat from "@/Components/Site/Chat";
import ChatList from "@/Components/Site/UsersList";
import ChatRoom from "@/Components/Site/ChatRoom";
import OuterCenteredContainer from "@/Components/Site/OuterCenteredContainer";
import AppLayout from "@/Layouts/AppLayout";
import React, { useEffect, useState } from "react";
import UsersList from "@/Components/Site/UsersList";
import { Message, User } from "@/types";
import axios from "axios";

export default function() {
    const [users, setUsers] = useState<Array<User>>([]);
    const [messages, setMessages] = useState<Array<Message>>([]);
    const [activeUser, setActiveUser] = useState<User | null>(null);

    useEffect(() => {
        axios.get('api/users').then(response => {
            setUsers(response.data.users)
        })
    }, [])

    return (
        <AppLayout title="Chat room">
            <OuterCenteredContainer className="!max-w-[1024px]">
                <ChatRoom>
                    <div className="md:block hidden md:w-[35%]">
                        <UsersList users={users} active={activeUser} setActive={setActiveUser} setMessages={setMessages} />
                    </div>
                    <div className="h-full md:w-[65%]">
                        <Chat activeUser={activeUser} messages={messages} />
                    </div>
                </ChatRoom>
            </OuterCenteredContainer>
        </AppLayout>
    )
}