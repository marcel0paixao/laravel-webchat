import Chat from "@/Components/Site/Chat";
import ChatList from "@/Components/Site/UsersList";
import ChatRoom from "@/Components/Site/ChatRoom";
import OuterCenteredContainer from "@/Components/Site/OuterCenteredContainer";
import AppLayout from "@/Layouts/AppLayout";
import React, { useEffect, useState } from "react";
import UsersList from "@/Components/Site/UsersList";
import { Message, User } from "@/types";
import axios from "axios";
import route from "ziggy-js";
import useTypedPage from "@/Hooks/useTypedPage";

export default function() {
    const { user } = useTypedPage().props;
    const [users, setUsers] = useState<Array<User>>([]);
    const [activeUser, setActiveUser] = useState<User | null>(null);

    useEffect(() => {
        axios.get('api/users').then(response => {
            setUsers(response.data.users)
        });
    }, []);

    return (
        <AppLayout title="Chat room">
            <OuterCenteredContainer className="!max-w-[1024px]">
                <ChatRoom>
                    <div className={`md:block md:w-[35%] ${activeUser ? 'hidden' : 'block'}`}>
                        <UsersList users={users} active={activeUser} setActive={setActiveUser} />
                    </div>
                    <div className="h-full md:w-[65%]">
                        {activeUser ? <Chat activeUser={activeUser} /> : <h2 className="text-center text-xl text-black pt-24">Select a conversation</h2>}
                    </div>
                </ChatRoom>
            </OuterCenteredContainer>
        </AppLayout>
    )
}