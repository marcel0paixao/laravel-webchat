import { useForm } from "@inertiajs/inertia-react";
import classNames from "classnames";
import React from "react";
import FormButton from "../Form/Button";
import FormInput from "../Form/Input";
import ChatHeader from "./ChatHeader";
import MessagesList from "./MessagesList";

export default function Chat(){
    const form = useForm({
        message: '',
        user_id: 1,
        chat_room: 1
    });

    const submitMessage = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key == "Enter") {
            console.log(Object(e.target).value);
        }
    }
    
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('submited');
    }

    return (
        <div className="h-full ml-4">
            <ChatHeader />
            <div className="p-4 flex h-[80%] overflow-y-auto border-[#ddd]">
                <MessagesList />
            </div>
            <form action="" onSubmit={onSubmit} className="mt-3 pt-2 flex border-t">
                <FormInput
                    name="message"
                    placeholder={__('Enter a message')}
                    id="message"
                    type="text"
                    className="mt-1 block w-full rounded-r-none" />
                <FormButton
                    type="submit"
                    className={classNames('w-[30px] bg-purple-600 h-[48px] mt-[4px] rounded-r-md ', {'opacity-25': form.processing})}
                    disabled={form.processing}>
                        <svg className="-ml-2" xmlns="http://www.w3.org/2000/svg" width="21" height="18" viewBox="0 0 21 18" fill="none">
                            <path d="M0.00999999 18L21 9L0.00999999 0L0 7L15 9L0 11L0.00999999 18Z" fill="#fff"/>
                        </svg>
                </FormButton>
            </form>
        </div>
    )
}