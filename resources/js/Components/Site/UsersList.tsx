import { Message, User } from "@/types";
import { Inertia } from "@inertiajs/inertia";
import axios from "axios";
import React, { Dispatch, PropsWithChildren, SetStateAction, useEffect, useState } from "react";
import route from "ziggy-js";
import UserBox from "./UserBox";

interface Props{
    users: Array<User>;
    setActive: Dispatch<SetStateAction<User | null>>;
    active: User | null;
}

export default function UsersList({users, active, setActive, ...props}: Props){
    return (
        <ul className="w-full max-h-[710px] overflow-y-auto space-y-2 pr-2">
            {users?.map(user => <UserBox key={user.id} id={user.id} name={user.name} onClick={() => setActive(users.find(usr => usr.id == user.id) ?? null)} active={active?.id == user.id}/>)}
        </ul>
    )
}