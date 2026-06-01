import { Message, MessageAttachment } from '@/types';
import React from 'react';
import MessageBox from './MessageBox';
import useTypedPage from '@/Hooks/useTypedPage';
interface Props { messages: Message[]; showSenders: boolean; onImageClick: (attachment: MessageAttachment) => void; }
export default function MessagesList({messages, showSenders, onImageClick}: Props){ const { user } = useTypedPage().props; const format = new Intl.DateTimeFormat('en-GB', {hour:'numeric', minute:'numeric'}); return <ul className="flex w-full flex-col gap-2">{messages.map(message => <MessageBox key={message.id} byOwn={Number(message.from) === Number(user.id)} date={format.format(new Date(message.created_at))} message={message} showSender={showSenders} onImageClick={onImageClick} />)}</ul>; }
