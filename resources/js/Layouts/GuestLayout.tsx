import {Inertia} from '@inertiajs/inertia';
import React, {PropsWithChildren} from 'react';
import useRoute from '@/Hooks/useRoute';

interface Props {
    title: string;
}

export default function GuestLayout({
                                      title,
                                      children,
                                  }: PropsWithChildren<Props>) {
    const route = useRoute();

    function logout(e: React.FormEvent) {
        e.preventDefault();
        Inertia.post(route('logout'));
    }

    return (
        <div>
            <h1>teste</h1>
        </div>
    );
}
