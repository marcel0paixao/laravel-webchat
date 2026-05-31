import {InertiaLink, useForm} from '@inertiajs/inertia-react';
import classNames from 'classnames';
import React from 'react';
import useRoute from '@/Hooks/useRoute';
import GuestLayout from '@/Layouts/GuestLayout';
import OuterCenteredContainer from '@/Components/Site/OuterCenteredContainer';
import useTypedPage from '@/Hooks/useTypedPage';
import FormInput from '@/Components/Form/Input';
import JetCheckbox from '@/Jetstream/Checkbox';
import FormButton from '@/Components/Form/Button';
import Logo from '@/Components/Site/Logo';
export default function Login() {
    const route = useRoute();
    const flash: any = useTypedPage().props.flash;
    const form = useForm({ email: '', password: '', remember: '' });
    function onSubmit(e: React.FormEvent) { e.preventDefault(); form.post(route('login'), { preserveScroll: true, onFinish: () => form.reset('password') }); }
    return <GuestLayout title="Login"><OuterCenteredContainer className="rounded-lg border border-slate-200 bg-white px-6 py-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-8">
        <div className="mb-8 text-center"><Logo className="justify-center" /><h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Webchats</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Sign in to continue</p></div>
        {flash?.status && <div className="mb-4 text-sm font-medium text-green-600">{flash.status}</div>}
        <form onSubmit={onSubmit}><FormInput label="Email" error={form.errors.email} id="email" type="email" className="mt-1 block w-full" value={form.data.email} onChange={e => form.setData('email', e.currentTarget.value)} autoFocus />
        <div className="mt-4"><FormInput label="Password" error={form.errors.password} id="password" type="password" className="mt-1 block w-full" value={form.data.password} onChange={e => form.setData('password', e.currentTarget.value)} autoComplete="current-password" /></div>
        <label className="mt-4 flex items-center"><JetCheckbox id="remember_me" checked={form.data.remember === 'on'} onChange={e => form.setData('remember', e.currentTarget.checked ? 'on' : '')} /><span className="ml-2 text-sm text-slate-500 dark:text-slate-400">Remember me</span></label>
        <FormButton className={classNames('mt-6 h-12 w-full bg-purple-600', {'opacity-25': form.processing})} disabled={form.processing}>Log in</FormButton>
        <InertiaLink href={route('register')} className="mt-3 flex h-12 w-full items-center justify-center rounded-sm border border-slate-300 bg-white text-sm font-semibold text-slate-600 transition hover:border-purple-300 hover:text-purple-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">Create account</InertiaLink>
        <div className="mt-4 text-center"><InertiaLink href={route('password.request')} className="text-sm text-TBL_SECONDARY dark:text-purple-300">Forgot your password?</InertiaLink></div></form>
    </OuterCenteredContainer></GuestLayout>;
}
