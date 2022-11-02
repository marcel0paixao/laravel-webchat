import React from 'react';
import GuestLayout from "@/Layouts/GuestLayout";
import OuterCenteredContainer from "@/Components/Site/OuterCenteredContainer";
import useTypedPage from '@/Hooks/useTypedPage';
import route from 'ziggy-js';

export default function Welcome(){
    const page = useTypedPage();
    
    return (
        <GuestLayout title={__('')}>
            <OuterCenteredContainer className="mb-32">
                <div className="flex flex-col justify-center items-center ">
                    {/* <!-- GUEST --> */}
                    {!page.props.user ? (
                            <>
                                <a href={route('login')}>
                                    <span>{__('Log in')}</span>
                                    <img src="/images/menu/login.svg" alt="" />
                                </a>
                                <a href={route('register')}>
                                    <span>{__('Register')}</span>
                                    <img src="/images/menu/register.svg" alt="" />
                                </a>
                            </>
                    ) : (
                        <a href={route('Home')}>
                            <span>{__('Home')}</span>
                        </a>
                    )}
                </div>
            </OuterCenteredContainer>
        </GuestLayout>
    );
}
