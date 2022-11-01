import {Inertia} from '@inertiajs/inertia';
import React, {PropsWithChildren} from 'react';
import useRoute from '@/Hooks/useRoute';
import { Head } from '@inertiajs/inertia-react';
import Header from '@/Components/Site/Header';

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
            <Header />

            <div className="font-sans rounded-md pt-32 p-4 text-TBL_TEXT_PRIMARY antialiased bg-gray-200">
                {children}
            </div>
        </div>
    );
}
