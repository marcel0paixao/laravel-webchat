import {InertiaLink, useForm} from '@inertiajs/inertia-react';
import React from 'react';
import useRoute from '@/Hooks/useRoute';
import GuestLayout from '@/Layouts/GuestLayout';
import FormButton from '@/Components/Form/Button';
import FormInput from '@/Components/Form/Input';
import OuterCenteredContainer from '@/Components/Site/OuterCenteredContainer';
import Logo from '@/Components/Site/Logo';
export default function Register() {
    const route = useRoute();
    const form = useForm({ name: '', username: '', email: '', phone: '', password: '', password_confirmation: '', terms: false });
    function onSubmit(e: React.FormEvent) { e.preventDefault(); form.post(route('register'), { onFinish: () => form.reset('password', 'password_confirmation') }); }
    return <GuestLayout title="Register"><OuterCenteredContainer className="rounded-lg border border-slate-200 bg-white px-6 py-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-8"><div className="mb-6 text-center"><Logo className="justify-center" /><h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Create your account</h1></div><form onSubmit={onSubmit}>
        <FormInput label="Name" error={form.errors.name} id="name" type="text" value={form.data.name} onChange={e => form.setData('name', e.currentTarget.value)} autoFocus />
        <div className="mt-4"><FormInput label="Immutable @handle" error={form.errors.username} id="username" type="text" value={form.data.username} onChange={e => form.setData('username', e.currentTarget.value.toLowerCase().replace(/^@/, ''))} placeholder="marcelo" /></div>
        <div className="mt-4"><FormInput label="Email" error={form.errors.email} id="email" type="email" value={form.data.email} onChange={e => form.setData('email', e.currentTarget.value)} /></div>
        <div className="mt-4"><FormInput label="Phone for SMS verification" error={form.errors.phone} id="phone" type="tel" value={form.data.phone} onChange={e => form.setData('phone', e.currentTarget.value)} placeholder="+5511999999999" /></div>
        <div className="mt-4"><FormInput label="Password" error={form.errors.password} id="password" type="password" value={form.data.password} onChange={e => form.setData('password', e.currentTarget.value)} /></div>
        <div className="mt-4"><FormInput label="Confirm password" error={form.errors.password_confirmation} id="password_confirmation" type="password" value={form.data.password_confirmation} onChange={e => form.setData('password_confirmation', e.currentTarget.value)} /></div>
        <FormButton className="mt-8 h-12 w-full bg-purple-600" disabled={form.processing}>Register</FormButton><div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">Already have an account?<InertiaLink href={route('login')} className="ml-2 text-TBL_SECONDARY dark:text-purple-300">Log in</InertiaLink></div>
    </form></OuterCenteredContainer></GuestLayout>;
}
