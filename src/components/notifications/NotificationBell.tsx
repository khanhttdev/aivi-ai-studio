'use client';

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { m, AnimatePresence } from 'framer-motion';
import { notificationService, Notification } from '@/lib/services/notificationService';
import { NotificationPopover } from './NotificationPopover';
import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface NotificationBellProps {
    user: User | null;
    locale: string;
    isMobile?: boolean;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ user, locale, isMobile }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter(); // Use useRouter for navigation on mobile

    // Fetch initial count and setup subscription
    useEffect(() => {
        if (!user) return;

        const fetchCount = async () => {
            try {
                const count = await notificationService.getUnreadCount();
                setUnreadCount(count);
            } catch (error) {
                console.error("Failed to fetch notification count", error);
            }
        };

        fetchCount();

        // Realtime subscription for new notifications
        const channel = supabase
            .channel('notification-bell')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    setUnreadCount((prev) => prev + 1);
                    // If popover is open, we might want to refresh the list or prepend
                    if (isOpen) {
                        setNotifications((prev) => [payload.new as Notification, ...prev]);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, isOpen]);

    const handleOpen = async () => {
        if (isMobile) {
            router.push('/profile?tab=notifications');
            return;
        }

        if (isOpen) {
            setIsOpen(false);
            return;
        }

        setIsOpen(true);
        setLoading(true);
        try {
            const data = await notificationService.getNotifications(10); // Fetch top 10 for popover
            setNotifications(data);

            // Note: We don't mark as read immediately on open, usually on click or manual action,
            // OR we can mark all as read here if that's the desired UX. 
            // For now, let's keep them unread until clicked or "Mark all read".
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    }

    if (!user) return null;

    return (
        <div className="relative">
            <m.button
                onClick={handleOpen}
                className="relative p-2 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Notifications"
            >
                <Bell size={20} />
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <m.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute top-1.5 right-1.5 min-w-[16px] h-4 flex items-center justify-center bg-[var(--error)] text-white text-[9px] font-bold rounded-full px-1 border border-[#0a0f1a]"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </m.div>
                    )}
                </AnimatePresence>
            </m.button>

            {isOpen && (
                <NotificationPopover
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    notifications={notifications}
                    onRead={handleRead}
                    onMarkAllRead={handleMarkAllRead}
                    loading={loading}
                    locale={locale}
                />
            )}
        </div>
    );
};
