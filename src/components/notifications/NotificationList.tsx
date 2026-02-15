'use client'

import React, { useState, useEffect } from 'react';
import { Notification, notificationService } from '@/lib/services/notificationService';
import { NotificationItem } from './NotificationItem';
import { Loader2, Inbox, CheckCheck } from 'lucide-react';
import { m } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface NotificationListProps {
    userId: string;
    locale: string;
}

export const NotificationList: React.FC<NotificationListProps> = ({ userId, locale }) => {
    const t = useTranslations('Notifications');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await notificationService.getNotifications(50); // Get more for full list
            setNotifications(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [userId]);

    const handleRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error(error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const filteredNotifications = filter === 'all'
        ? notifications
        : notifications.filter(n => !n.is_read);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-[var(--accent-primary)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2 bg-[var(--bg-tertiary)] p-1 rounded-xl">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${filter === 'all' ? 'bg-[var(--accent-primary)] text-black shadow-lg' : 'text-[var(--text-secondary)] hover:text-white'}`}
                    >
                        {t('all')}
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${filter === 'unread' ? 'bg-[var(--accent-primary)] text-black shadow-lg' : 'text-[var(--text-secondary)] hover:text-white'}`}
                    >
                        {t('unread')}
                    </button>
                </div>

                <m.button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <CheckCheck size={16} /> {t('mark_all_read')}
                </m.button>
            </div>

            {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)]">
                    <Inbox size={48} className="mb-4 opacity-50" />
                    <p>{t('empty')}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredNotifications.map(notif => (
                        <NotificationItem
                            key={notif.id}
                            notification={notif}
                            onRead={handleRead}
                            locale={locale}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
