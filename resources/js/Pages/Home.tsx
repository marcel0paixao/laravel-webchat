import Chat from "@/Components/Site/Chat";
import ChatList from "@/Components/Site/UsersList";
import ChatRoom from "@/Components/Site/ChatRoom";
import OuterCenteredContainer from "@/Components/Site/OuterCenteredContainer";
import AppLayout from "@/Layouts/AppLayout";
import React from "react";
import UsersList from "@/Components/Site/UsersList";

interface Props{
    
}

export default function() {
    return (
        <AppLayout title="Chat room">
            <OuterCenteredContainer className="!max-w-[1024px]">
                <ChatRoom>
                    <div className="md:block hidden md:w-[35%]">
                        <UsersList />
                    </div>
                    <div className="h-full md:w-[65%]">
                        <Chat />
                    </div>
                </ChatRoom>
            </OuterCenteredContainer>
        </AppLayout>
    )
}