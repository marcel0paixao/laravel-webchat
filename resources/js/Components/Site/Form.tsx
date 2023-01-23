import React, { Dispatch, MouseEvent, SetStateAction, useState } from "react";
import FormError from "@/Components/Form/Error";
import { InertiaFormProps } from "@inertiajs/inertia-react";
import { ChevronDoubleRightIcon } from '@heroicons/react/outline';

interface Props {
    onSubmit: (e: React.FormEvent) => void;
    errors?: string;
    form: InertiaFormProps<{ message: string; from: number; to: number; }>;
}

export default function Form({onSubmit, form, errors}: Props) {
    return (
        <>
            <form action="" className="py-[30px] px-[20px] border-t border-[#DFE1E5]" id="chat-form" onSubmit={e => onSubmit(e)}>
                <input type="text" 
                    className="rounded-[20px] h-[44px] px-[20px] py-[12px] text-[12px] text-TBL_TEXT_PLACEHOLDER font-[400] bg-[#FBFBFB] border-[#DADADA] w-full pr-10" 
                    id="form_messages"
                    maxLength={65535}
                    onKeyDown={e => {
                        if (e.key == "Enter" && Object(e.target).value.length > 0) {
                           form.setData('message', Object(e.target).value) 
                        }
                    }}
                    placeholder={__('Type a message...')} />
                <button type="submit" className="absolute -ml-8">
                    <ChevronDoubleRightIcon color="#611199" className="h-7 w-7 mt-[8px] -ml-[7px]" />
                </button>
            </form>
        </>
    )
}