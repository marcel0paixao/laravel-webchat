import React from 'react';
import GuestLayout from "@/Layouts/GuestLayout";
import OuterCenteredContainer from "@/Components/Site/OuterCenteredContainer";

const Welcome = () => {
    return (
        <GuestLayout title={__('Bem vindo')}>
            <OuterCenteredContainer className="mb-32">
                <div className="flex flex-col justify-center items-center ">
                    
                </div>
            </OuterCenteredContainer>
        </GuestLayout>
    );
}

export default Welcome;
