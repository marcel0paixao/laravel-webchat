import { InertiaLink } from '@inertiajs/inertia-react';
import { BellIcon, DotsVerticalIcon, MoonIcon, SearchIcon, SunIcon } from '@heroicons/react/outline';
import React, { useEffect, useRef, useState } from 'react';
import route from 'ziggy-js';
import useTypedPage from '@/Hooks/useTypedPage';
import Logo from './Logo';
import axios from 'axios';
import { AppNotification } from '@/types';
import { Inertia } from '@inertiajs/inertia';

export default function Header() {
    const { user } = useTypedPage().props;
    const headerRef = useRef<HTMLElement | null>(null);
    const profileHref = user.username ? route('profiles.show', { username: user.username }) : route('profiles.search');
    const [dark, setDark] = useState(document.documentElement.classList.contains('dark'));
    const [menu, setMenu] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unread, setUnread] = useState(0);
    const [toast, setToast] = useState<AppNotification | null>(null);
    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark);
        document.body.classList.toggle('dark-app', dark);
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    }, [dark]);
    useEffect(() => {
        if (!menu && !notificationsOpen) return;
        const closeOnOutsideClick = (event: MouseEvent) => {
            if (headerRef.current?.contains(event.target as Node)) return;
            setMenu(false);
            setNotificationsOpen(false);
        };
        document.addEventListener('mousedown', closeOnOutsideClick);
        return () => document.removeEventListener('mousedown', closeOnOutsideClick);
    }, [menu, notificationsOpen]);
    useEffect(() => {
        axios.get(route('notifications.index')).then(r => { setNotifications(r.data.notifications); setUnread(r.data.unread_count); });
    }, []);
    const initials = (name?: string | null) => (name ?? '?').split(' ').filter(Boolean).slice(0,2).map(part => part[0]).join('').toUpperCase();
    const profileUrl = (notification: AppNotification) => notification.actor?.username ? route('profiles.show', {username: notification.actor.username}) : route('profiles.search');
    const notificationText = (notification: AppNotification) => notification.body ?? notification.title;
    const isFriendRequest = (notification: AppNotification) => notification.type === 'friend_request_created' && notification.actor_id;
    const actorAvatar = (notification: AppNotification) => notification.actor?.profile_photo_path
        ? <img src={notification.actor.profile_photo_url} className="h-10 w-10 rounded-full object-cover" />
        : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-TBL_SECONDARY text-xs font-bold text-white">{initials(notification.actor?.name)}</span>;
    const removeNotification = (notification: AppNotification) => {
        if (!notification.read_at) setUnread(current => Math.max(0, current - 1));
        setNotifications(current => current.filter(item => item.id !== notification.id));
        setToast(current => current?.id === notification.id ? null : current);
    };
    const clearNotifications = () => {
        axios.delete(route('notifications.clear')).then(() => {
            setNotifications([]);
            setUnread(0);
            setToast(null);
        });
    };
    const markRead = (notification: AppNotification) => {
        if (notification.read_at) return;
        setNotifications(current => current.map(item => item.id === notification.id ? {...item, read_at: new Date().toISOString()} : item));
        setUnread(current => Math.max(0, current - 1));
        axios.patch(route('notifications.read', {notification: notification.id})).catch(() => {});
    };
    const emitFriendshipUpdate = (userId: number, status: 'pending' | 'accepted' | null, direction: 'incoming' | 'outgoing' | null) => {
        window.dispatchEvent(new CustomEvent('webchats:friendship-updated', { detail: { userId, status, direction } }));
    };
    const acceptRequest = (notification: AppNotification) => {
        if (!notification.actor_id) return;
        axios.post(route('friends.accept', {id: notification.actor_id})).then(() => {
            removeNotification(notification);
            emitFriendshipUpdate(notification.actor_id as number, 'accepted', null);
        });
    };
    const rejectRequest = (notification: AppNotification) => {
        if (!notification.actor_id) return;
        axios.delete(route('friends.reject', {id: notification.actor_id})).then(() => {
            removeNotification(notification);
            emitFriendshipUpdate(notification.actor_id as number, null, null);
        });
    };
    useEffect(() => {
        if (!Object(window).Echo) return;
        const channel = Object(window).Echo.private(`user.${user.id}`);
        channel.listen('.UserNotification', (e: {notification: AppNotification}) => {
            setNotifications(current => [e.notification, ...current].slice(0, 30));
            setUnread(current => current + 1);
            setToast(e.notification);
            if (e.notification.type === 'account_banned') {
                window.setTimeout(() => Inertia.visit(route('banned')), 800);
            }
            if (e.notification.actor_id && e.notification.type === 'friend_request_accepted') {
                emitFriendshipUpdate(e.notification.actor_id, 'accepted', null);
            }
            if (e.notification.actor_id && e.notification.type === 'friend_request_created') {
                emitFriendshipUpdate(e.notification.actor_id, 'pending', 'incoming');
            }
            window.setTimeout(() => setToast(current => current?.id === e.notification.id ? null : current), 6500);
        });
        return () => { channel.stopListening('.UserNotification'); };
    }, [user.id]);

    return <header ref={headerRef} className="relative flex h-16 items-center border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
        <InertiaLink href={route('Home')} className="text-lg font-bold text-purple-300"><Logo /></InertiaLink>
        <nav className="ml-auto flex items-center gap-2">
            <InertiaLink href={route('profiles.search')} title="Search profiles" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><SearchIcon className="h-5 w-5" /></InertiaLink>
            <button type="button" title="Notifications" onClick={() => { setNotificationsOpen(v => !v); setMenu(false); }} className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                <BellIcon className="h-5 w-5" />
                {unread > 0 && <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-purple-600 px-1 text-[10px] font-bold text-white">{unread > 9 ? '9+' : unread}</span>}
            </button>
            <button type="button" title="Toggle dark mode" onClick={() => setDark(v => !v)} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">{dark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}</button>
            <button type="button" title="Menu" onClick={() => { setMenu(v => !v); setNotificationsOpen(false); }} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><DotsVerticalIcon className="h-5 w-5" /></button>
        </nav>
        {notificationsOpen && <div className="absolute right-14 top-14 z-30 w-[min(24rem,calc(100vw-2rem))] rounded-lg border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between px-2 py-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h2>
                <div className="flex items-center gap-2">
                    {notifications.length > 0 && <button type="button" onClick={clearNotifications} className="rounded-md px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">Clear</button>}
                    {unread > 0 && <span className="rounded-full bg-purple-50 px-2 py-1 text-xs font-semibold text-purple-700 dark:bg-slate-700 dark:text-purple-200">{unread} new</span>}
                </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 && <p className="px-2 py-8 text-center text-sm text-slate-500 dark:text-slate-400">No notifications yet.</p>}
                {notifications.map(notification => <div key={notification.id} className={(notification.read_at ? '' : 'bg-purple-50/70 dark:bg-purple-500/10 ') + 'rounded-md px-2 py-3 transition hover:bg-slate-100 dark:hover:bg-slate-700'}>
                    <div className="flex gap-3">
                        <InertiaLink href={profileUrl(notification)} onClick={() => markRead(notification)} className="shrink-0">{actorAvatar(notification)}</InertiaLink>
                        <InertiaLink href={profileUrl(notification)} onClick={() => markRead(notification)} className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-slate-900 dark:text-white">{notification.title}</span>
                            <span className="block text-sm leading-5 text-slate-600 dark:text-slate-300">{notificationText(notification)}</span>
                        </InertiaLink>
                    </div>
                    {isFriendRequest(notification) && <div className="mt-3 flex gap-2 pl-[3.25rem]">
                        <button type="button" onClick={() => acceptRequest(notification)} className="flex-1 rounded-md bg-TBL_SECONDARY px-3 py-1.5 text-xs font-bold text-white">Accept</button>
                        <button type="button" onClick={() => rejectRequest(notification)} className="flex-1 rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">Reject</button>
                    </div>}
                </div>)}
            </div>
        </div>}
        {menu && <div className="absolute right-4 top-14 z-30 w-48 rounded-md border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
            <InertiaLink href={profileHref} className="block rounded px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-700">Profile</InertiaLink>
            {user.is_admin && <InertiaLink href={route('admin.reports.index')} className="block rounded px-3 py-2 text-sm text-purple-700 hover:bg-purple-50 dark:text-purple-200 dark:hover:bg-slate-700">Admin panel</InertiaLink>}
            <InertiaLink href={route('settings.privacy')} className="block rounded px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-700">Settings</InertiaLink>
            <InertiaLink method="post" as="button" href={route('logout')} className="block w-full rounded px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:text-red-300 dark:hover:bg-slate-700">Log out</InertiaLink>
        </div>}
        {toast && <div className="fixed bottom-5 left-5 z-50 w-[min(22rem,calc(100vw-2.5rem))] rounded-lg border border-slate-200 bg-white p-3 shadow-2xl transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex gap-3">
                <InertiaLink href={profileUrl(toast)} onClick={() => markRead(toast)} className="shrink-0">{actorAvatar(toast)}</InertiaLink>
                <InertiaLink href={profileUrl(toast)} onClick={() => markRead(toast)} className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-slate-900 dark:text-white">{toast.title}</span>
                    <span className="block text-sm leading-5 text-slate-600 dark:text-slate-300">{notificationText(toast)}</span>
                </InertiaLink>
            </div>
            {isFriendRequest(toast) && <div className="mt-3 flex gap-2 pl-[3.25rem]">
                <button type="button" onClick={() => acceptRequest(toast)} className="flex-1 rounded-md bg-TBL_SECONDARY px-3 py-1.5 text-xs font-bold text-white">Accept</button>
                <button type="button" onClick={() => rejectRequest(toast)} className="flex-1 rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">Reject</button>
            </div>}
        </div>}
    </header>;
}
