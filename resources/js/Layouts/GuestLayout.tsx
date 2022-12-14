import {Inertia} from '@inertiajs/inertia';
import React, {PropsWithChildren} from 'react';
import useRoute from '@/Hooks/useRoute';
import { Head } from '@inertiajs/inertia-react';

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
            <Head title={title} />

            <div className="font-sans text-TBL_TEXT_PRIMARY antialiased">
                {children}
            </div>
        </div>
    );
}
