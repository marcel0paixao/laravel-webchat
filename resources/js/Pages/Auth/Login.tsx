import {InertiaLink, useForm} from '@inertiajs/inertia-react';
import classNames from 'classnames';
import React from 'react';
import useRoute from '@/Hooks/useRoute';
import GuestLayout from "@/Layouts/GuestLayout";
import OuterCenteredContainer from "@/Components/Site/OuterCenteredContainer";
import usePrevalidate from "@/Hooks/usePrevalidate";
import {Method} from "@inertiajs/inertia";
import {Nullable} from "@/types";
import useTypedPage from "@/Hooks/useTypedPage";
import FormInput from '@/Components/Form/Input';
import JetCheckbox from '@/Jetstream/Checkbox';
import FormButton from '@/Components/Form/Button';

const POST_ROUTE = 'login';

export default function Login() {
    const route = useRoute();
    const flash: Nullable<any> = useTypedPage().props.flash;
    const form = useForm({
        email: '',
        password: '',
        remember: '',
    });
    const {preValidate} = usePrevalidate(form, {method: Method.POST, url: route(POST_ROUTE)});

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post(route(POST_ROUTE), {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => form.reset('password'),
        });
    }

    return (
        <GuestLayout title={__('Login')}>
            <OuterCenteredContainer className="py-32">
                <h1 className='flex justify-center font-bold mb-16'>
                    <div className="block mr-1 text-TBL_MENU_COLOR">{__('Login in')}</div>
                    <div className="block text-purple-600">Webchat</div>
                </h1>

                {flash?.status && (
                    <div className="mb-4 font-medium text-sm text-green-600">{flash?.status}</div>
                )}

                <form onSubmit={onSubmit}>
                    <div>
                        <FormInput
                            placeholder={__('Enter your email')}
                            label={__('Email label')}
                            error={form.errors.email}
                            id="email"
                            type="email"
                            className="mt-1 block w-full"
                            value={form.data.email}
                            onChange={e => form.setData('email', e.currentTarget.value)}
                            autoFocus
                        />
                    </div>

                    <div className="mt-4">
                        <FormInput
                            placeholder={__('Enter your password')}
                            label={__('Password')}
                            error={form.errors.password}
                            id="password"
                            type="password"
                            className="mt-1 block w-full"
                            value={form.data.password}
                            onChange={e => form.setData('password', e.currentTarget.value)}
                            autoComplete="current-password"
                        />
                    </div>

                    <div className="mt-4">
                        <label htmlFor="remember_me" className="flex items-center">
                            <JetCheckbox
                                id="remember_me"
                                name="remember"
                                checked={form.data.remember === 'on'}
                                onChange={e =>
                                    form.setData('remember', e.currentTarget.checked ? 'on' : '')
                                }
                            />
                            <span className="ml-2 text-sm text-TBL_TEXT_PLACEHOLDER">{__('Remember me')}</span>
                        </label>
                    </div>

                    <FormButton
                        className={classNames('mt-6 w-full bg-purple-600 ', {'opacity-25': form.processing})}
                        disabled={form.processing}>
                        {__('Log in')}
                    </FormButton>
                    
                    <div className="mt-3">
                        <div className="text-center">
                            <InertiaLink
                                href={route('password.request')}
                                className="text-TBL_SECONDARY font-normal">
                                {__('Forgot your password?')}
                            </InertiaLink>
                        </div>
                    </div>

                    <div className='flex justify-center text-TBL_TEXT_PLACEHOLDER text-xs mt-2'>
                        {__("Don't have an account?")}
                        <InertiaLink
                            href={route('register')}>
                            <span className='text-TBL_SECONDARY font-normal ml-1'>{__("Register")}</span>
                        </InertiaLink>
                    </div>

                </form>
            </OuterCenteredContainer>
        </GuestLayout>
    );
}
