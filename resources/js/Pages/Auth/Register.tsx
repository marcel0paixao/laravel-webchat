import {InertiaLink, useForm} from '@inertiajs/inertia-react';
import React, {Props, useEffect} from 'react';
import useRoute from '@/Hooks/useRoute';
import useTypedPage from '@/Hooks/useTypedPage';
import GuestLayout from "@/Layouts/GuestLayout";
import FormButton from "@/Components/Form/Button";
import FormInput from "@/Components/Form/Input";
import OuterCenteredContainer from "@/Components/Site/OuterCenteredContainer";
import usePrevalidate from "@/Hooks/usePrevalidate";
import {Method} from "@inertiajs/inertia";

const POST_ROUTE = 'register';

export default function Register(props: any) {
    const page = useTypedPage();
    const route = useRoute();
    const form = useForm(POST_ROUTE,{
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });
    const {preValidate} = usePrevalidate(form, {method: Method.POST, url: route(POST_ROUTE)});

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post(route(POST_ROUTE), {
            onFinish: () => form.reset('password', 'password_confirmation'),
        });
    }

    return (
        <GuestLayout title={__('Register')}>
            <OuterCenteredContainer className="py-32">
                <h1 className='flex justify-center font-bold mb-16'>
                    <div className="block mr-1 text-TBL_MENU_COLOR">{__('Register')} {__('in')}</div>
                    <div className="block text-purple-600">Webchat</div>
                </h1>

                <form onSubmit={onSubmit}  >
                    <div className="mt-4">
                        <FormInput
                            label={__('Name') + '*'}
                            error={form.errors.name}
                            placeholder={__('Enter your name')}
                            id="name"
                            type="text"
                            className="mt-1 block w-full"
                            value={form.data.name}
                            onChange={e => form.setData('name', e.currentTarget.value)}
                            autoFocus
                            autoComplete="name"
                        />
                    </div>

                    <div className="mt-4">
                        <FormInput
                            label={__('Email label') + '*'}
                            error={form.errors.email}
                            placeholder={__('Enter your email')}
                            id="email"
                            type="email"
                            className="mt-1 block w-full"
                            value={form.data.email}
                            onChange={e => form.setData('email', e.currentTarget.value)}
                        />
                    </div>

                    <div className="mt-4">
                        <FormInput
                            label={__('Password') + '*'}
                            error={form.errors.password}
                            placeholder={__('Enter your password')}
                            id="password"
                            type="password"
                            className="mt-1 block w-full"
                            value={form.data.password}
                            onChange={e => form.setData('password', e.currentTarget.value)}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="mt-4">
                        <FormInput
                            label={__('Confirm Password') + '*'}
                            error={form.errors.password_confirmation}
                            placeholder={__('Confirm your password')}
                            id="password_confirmation"
                            type="password"
                            className="mt-1 block w-full"
                            value={form.data.password_confirmation}
                            onChange={e =>
                                form.setData('password_confirmation', e.currentTarget.value)
                            }
                            autoComplete="new-password"
                        />
                    </div>

                    <FormButton className="mt-8 w-full h-12 bg-purple-600" disabled={form.processing}>
                        {__('Register')}
                    </FormButton>

                    <div className="mt-8 mb-16 flex text-xs justify-center font-normal text-TBL_TEXT_PLACEHOLDER">
                        {__('Já possui conta?')}
                        <InertiaLink href={route('login')} className="ml-2 text-TBL_SECONDARY hover:font-semibold">
                            {__('Enter login')}
                        </InertiaLink>
                    </div>

                </form>
            </OuterCenteredContainer>
        </GuestLayout>
    );
}
