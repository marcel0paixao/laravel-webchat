import useRoute from "@/Hooks/useRoute";
import useTypedPage from "@/Hooks/useTypedPage";
import { Inertia } from "@inertiajs/inertia";
import React from "react";
import route from "ziggy-js";

interface Props {
    
}

export default function Header({...props}: Props) {
    const page = useTypedPage();
    const route = useRoute();
    
    function logout(e: React.FormEvent) {
        e.preventDefault();
        Inertia.post(route('logout'), {}, {
            onSuccess: () => {
                location.reload();
            }
        });
    }
    
    return (
        <header className="w-full h-16 border-b px-6 py-2">
            <form action={route('logout')} onSubmit={logout}>
                <button type="submit">Log Out</button>
            </form>
        </header>
    )
}