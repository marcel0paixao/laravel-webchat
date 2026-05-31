import { InertiaLink, useForm } from '@inertiajs/inertia-react';
import React from 'react';
import FormButton from '@/Components/Form/Button';
import FormInput from '@/Components/Form/Input';
import OuterCenteredContainer from '@/Components/Site/OuterCenteredContainer';
import GuestLayout from '@/Layouts/GuestLayout';
import Logo from '@/Components/Site/Logo';
import route from 'ziggy-js';

export default function VerifyPhone({ phone }: { phone: string }) {
    const form = useForm({ code: '' });
    return <GuestLayout title="Verify phone"><OuterCenteredContainer className="rounded-lg border border-slate-200 bg-white px-6 py-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-8">
        <Logo compact className="mb-6 justify-center" />
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Verify your phone</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">We sent a six digit code to {phone}. In local development, check Laravel logs.</p>
        <form className="mt-6" onSubmit={e => { e.preventDefault(); form.post(route('phone.verify')); }}>
            <FormInput label="SMS code" error={form.errors.code} id="code" type="text" value={form.data.code} onChange={e => form.setData('code', e.currentTarget.value)} />
            <FormButton className="mt-6 h-12 w-full bg-purple-600">Verify</FormButton>
        </form>
        <InertiaLink method="post" as="button" href={route('phone.resend')} className="mt-4 block w-full text-center text-sm font-semibold text-purple-700 dark:text-purple-300">Resend code</InertiaLink>
    </OuterCenteredContainer></GuestLayout>;
}
