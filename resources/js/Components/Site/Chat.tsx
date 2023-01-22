import useTypedPage from "@/Hooks/useTypedPage";
import { Message, User } from "@/types";
import { Inertia } from "@inertiajs/inertia";
import { useForm } from "@inertiajs/inertia-react";
import axios from "axios";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import route from "ziggy-js";
import FormButton from "../Form/Button";
import FormInput from "../Form/Input";
import ChatHeader from "./ChatHeader";
import MessagesList from "./MessagesList";

interface Props{
    activeUser: User;
}

export default function Chat({activeUser}: Props){
    const { user } = useTypedPage().props;
    const [messages, setMessages] = useState<Array<Message>>([]);

    useEffect(() => {
        Object(window).Echo.private(`user.${user.id}`).listen('.SendMessage', (e: any) => {
            if (e.message.from == activeUser?.id) {
                setMessages(msg => {
                    return [...msg, {
                        id: e.message.id,
                        to: e.message.to,
                        from: e.message.from,
                        message: e.message.message,
                        created_at: e.message.created_at,
                        updated_at: e.message.updated_at,
                        deleted_at: null,
                        seen_by: null
                    }];
                });
                document.querySelectorAll('.message:last-child')[0]?.scrollIntoView();
            }
        });
    }, [])

    useEffect(() => {
        form.setData('to', activeUser?.id)
        axios.get(route('load.messages', { 'user_id': activeUser?.id ?? 0 })).then(response => {
            setMessages(response.data.messages);
            document.querySelectorAll('.message:last-child')[0]?.scrollIntoView();
        });
    }, [activeUser]);

    const form = useForm({
        message: '',
        from: user.id,
        to: activeUser?.id
    });

    const enterSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key == "Enter" && form.data.message.length > 0) {
            submitMessage();
        }
    }
    
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (form.data.message.length > 0) {
            submitMessage();
        }
    }

    const submitMessage = async () => {
        form.post(route('store.messages'), {
            onSuccess: (response) => {
                setMessages(msg => {
                    return [...msg, {
                        id: msg.length,
                        to: form.data.to ?? activeUser?.id ?? 0,
                        from: user.id,
                        message: form.data.message,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        deleted_at: null,
                        seen_by: null
                    }];
                });
                document.querySelectorAll('.message:last-child')[0].scrollIntoView();
                form.setData('message', '');
            }
        })
    }

    return (
        <div className="h-full ml-4">
            {activeUser ? (
                <>
                    <ChatHeader user={activeUser} />
                    <div className="p-4 flex h-[80%] overflow-y-auto border-[#ddd]" id="chatbox">
                        <MessagesList messages={messages} />
                    </div>
                    <form onSubmit={onSubmit} className="mt-3 pt-2 flex border-t">
                        <FormInput
                            name="message"
                            placeholder={__('Enter a message')}
                            value={form.data.message}
                            id="message"
                            type="text"
                            className="mt-1 block w-full rounded-r-none"
                            onChange={(e) => form.setData('message', e.target.value)}
                            onKeyDown={(e) => enterSubmit(e)} />
                        <FormButton
                            type="submit"
                            className={classNames('w-[30px] bg-purple-600 h-[48px] mt-[4px] rounded-r-md ', {'opacity-25': form.processing})}
                            disabled={form.processing}>
                                <svg className="-ml-2" xmlns="http://www.w3.org/2000/svg" width="21" height="18" viewBox="0 0 21 18" fill="none">
                                    <path d="M0.00999999 18L21 9L0.00999999 0L0 7L15 9L0 11L0.00999999 18Z" fill="#fff"/>
                                </svg>
                        </FormButton>
                    </form>
                </>
            ) : (
                <div className="h-full border-l text-center text-xl pt-16">
                    <h2>No messages to show</h2>
                </div>
            )}
            
        </div>
    )
}