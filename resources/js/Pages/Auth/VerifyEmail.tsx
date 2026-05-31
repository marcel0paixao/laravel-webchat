import { InertiaLink, useForm } from '@inertiajs/inertia-react';
import React from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import OuterCenteredContainer from '@/Components/Site/OuterCenteredContainer';
import FormButton from '@/Components/Form/Button';
import useRoute from '@/Hooks/useRoute';
import useTypedPage from '@/Hooks/useTypedPage';
import Logo from '@/Components/Site/Logo';

export default function VerifyEmail() {
    const route = useRoute();
    const form = useForm({});
    const flash: any = useTypedPage().props.flash;

    return <GuestLayout title="Verify email">
        <OuterCenteredContainer className="rounded-lg border border-slate-200 bg-white px-6 py-8 text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 sm:px-8">
            <Logo compact className="mb-6 justify-center" />
            <h1 className="text-center text-2xl font-bold text-slate-900 dark:text-white">Verify your email</h1>
            <p className="mt-3 text-center text-sm leading-6 text-slate-500 dark:text-slate-300">
                Your account is almost ready. Confirm your email address using the link we sent, then come back here.
            </p>
            {flash?.status === 'verification-link-sent' && <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">A new verification link was sent to your email.</p>}
            <form className="mt-6" onSubmit={e => { e.preventDefault(); form.post(route('verification.send')); }}>
                <FormButton className="h-12 w-full bg-purple-600" disabled={form.processing}>Resend verification email</FormButton>
            </form>
            <InertiaLink method="post" as="button" href={route('logout')} className="mt-3 flex h-12 w-full items-center justify-center rounded-sm border border-slate-300 text-sm font-semibold text-slate-600 hover:border-purple-400 dark:border-slate-700 dark:text-slate-200">Log out</InertiaLink>
        </OuterCenteredContainer>
    </GuestLayout>;
}
