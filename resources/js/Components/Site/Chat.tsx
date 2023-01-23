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
import Form from "./Form";
import MessagesList from "./MessagesList";

interface Props{
    activeUser: User;
}

export default function Chat({activeUser}: Props){
    const { user } = useTypedPage().props;
    const [messages, setMessages] = useState<Array<Message>>([]);
    const [submitProcessing, setSubmitProcessing] = useState<boolean>(false);

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
    
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (Object(e.target)[0].value.length > 0) {
            form.data.message = Object(e.target)[0].value;
            if (!submitProcessing) {
                Object(document.querySelectorAll('#form_messages'))[0].value = '';
                submitMessage();   
            }
        }
    }

    const submitMessage = async () => {
        form.post(route('store.messages'), {
            onProgress: () => {
                setSubmitProcessing(true);
            },
            onSuccess: () => {
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
                setSubmitProcessing(false);
            }
        })
    }

    return (
        <div className="h-full ml-4">
            {activeUser ? (
                <>
                    <ChatHeader user={activeUser} />
                    <div className="sm:p-4 flex h-[80%] overflow-y-auto border-[#ddd]" id="chatbox">
                        <MessagesList messages={messages} />
                    </div>
                    <Form onSubmit={onSubmit} form={form} />
                </>
            ) : (
                <div className="h-full border-l text-center text-xl pt-16">
                    <h2>No messages to show</h2>
                </div>
            )}
            
        </div>
    )
}