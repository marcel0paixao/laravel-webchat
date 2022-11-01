import React, { PropsWithChildren } from "react";
import UserBox from "./UserBox";

interface Props{
    
}

export default function UsersList({...props}: Props){
    return (
        <ul className="w-full max-h-[710px] overflow-y-auto space-y-2 pr-2">
            <UserBox />
            <UserBox />
            <UserBox />
            <UserBox />
            <UserBox />
            <UserBox />
            <UserBox />
            <UserBox />
            <UserBox />
            <UserBox />
            <UserBox />
            <UserBox />
            <UserBox />
        </ul>
    )
}