import { User } from "@/types";
import { Inertia } from "@inertiajs/inertia";
import axios from "axios";
import React, { PropsWithChildren, useEffect, useState } from "react";
import route from "ziggy-js";
import UserBox from "./UserBox";

interface Props{
    
}

export default function UsersList({...props}: Props){
    const [users, setUsers] = useState<Array<User>>();

    useEffect(() => {
        axios.get('api/users').then(response => {
            setUsers(response.data.users)
        })
    }, [])
    

    return (
        <ul className="w-full max-h-[710px] overflow-y-auto space-y-2 pr-2">
            {users?.map(user => <UserBox key={user.id} id={user.id} name={user.name} />)}
        </ul>
    )
}