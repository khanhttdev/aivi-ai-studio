import React from 'react';
import { Notification } from '@/lib/services/notificationService';
import { Info, CheckCircle, AlertTriangle, AlertOctagon, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale'; // You might need to adjust locale import based on your setup
import { useRouter } from 'next/navigation';

interface NotificationItemProps {
    notification: Notification;
    onRead: (id: string) => void;
    compact?: boolean; // If true, rendering for Popover (short content)
    locale?: string;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRead, compact = false, locale = 'en' }) => {
    const router = useRouter();

    const getIcon = () => {
        switch (notification.type) {
            case 'success': return <CheckCircle size={18} className="text-green-500" />;
            case 'warning': return <AlertTriangle size={18} className="text-yellow-500" />;
            case 'error': return <AlertOctagon size={18} className="text-red-500" />;
            default: return <Info size={18} className="text-blue-500" />;
        }
    };

    const handleClick = () => {
        if (!notification.is_read) {
            onRead(notification.id);
        }
        if (notification.link) {
            router.push(notification.link);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`
                relative flex gap-3 p-3 rounded-xl transition-all cursor-pointer border
                ${notification.is_read
                    ? 'bg-transparent border-transparent hover:bg-white/5 opacity-70'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }
            `}
        >
            <div className="flex-shrink-0 mt-1">
                {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h4 className={`text-sm font-semibold text-[var(--text-primary)] ${compact ? 'truncate' : ''}`}>
                        {notification.title}
                    </h4>
                    {!notification.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] flex-shrink-0 mt-1.5" />
                    )}
                </div>
                <p className={`text-xs text-[var(--text-secondary)] mt-1 ${compact ? 'line-clamp-2' : ''}`}>
                    {notification.message}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] mt-2">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: locale === 'vi' ? vi : enUS })}
                </p>
            </div>
        </div>
    );
};
