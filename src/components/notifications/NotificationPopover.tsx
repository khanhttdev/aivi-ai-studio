import React, { useEffect, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X, CheckCheck } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import { Notification } from '@/lib/services/notificationService';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface NotificationPopoverProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    onRead: (id: string) => void;
    onMarkAllRead: () => void;
    loading: boolean;
    locale?: string;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
    isOpen,
    onClose,
    notifications,
    onRead,
    onMarkAllRead,
    loading,
    locale
}) => {

    const t = useTranslations('Notifications');
    const popoverRef = useRef<HTMLDivElement>(null);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // ESC key handler
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <m.div
                    ref={popoverRef}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-4 w-[360px] max-w-[90vw] bg-[#0d1117]/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col z-50 overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                        <h3 className="font-bold text-sm text-[var(--text-primary)]">{t('title')}</h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onMarkAllRead}
                                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-white/10 transition-colors"
                                title={t('mark_all_read')}
                            >
                                <CheckCheck size={16} />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto max-h-[400px] p-2 space-y-1 custom-scrollbar">
                        {loading ? (
                            <div className="py-8 text-center text-[var(--text-muted)] text-sm">
                                {t('loading')}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-8 text-center text-[var(--text-muted)] text-sm">
                                {t('empty')}
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <NotificationItem
                                    key={notif.id}
                                    notification={notif}
                                    onRead={onRead}
                                    compact={true}
                                    locale={locale}
                                />
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <Link
                        href="/profile?tab=notifications"
                        onClick={onClose}
                        className="p-3 text-center text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-white/5 transition-colors border-t border-white/10"
                    >
                        {t('view_all')}
                    </Link>
                </m.div>
            )}
        </AnimatePresence>
    );
};
