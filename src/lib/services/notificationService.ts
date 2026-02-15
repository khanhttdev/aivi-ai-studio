import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/types';

export type Notification = Database['public']['Tables']['notifications']['Row'];

export const notificationService = {
    async getNotifications(limit = 20) {
        const { data, error } = await (supabase.from('notifications') as any)
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    },

    async getUnreadCount() {
        const { count, error } = await (supabase.from('notifications') as any)
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false);

        if (error) throw error;
        return count || 0;
    },

    async updateNotification(id: string, updates: any) {
        const { error } = await (supabase.from('notifications') as any)
            .update(updates)
            .eq('id', id);
        if (error) throw error;
    },

    async markAsRead(id: string) {
        const { error } = await (supabase.from('notifications') as any)
            .update({ is_read: true })
            .eq('id', id);

        if (error) throw error;
    },

    async markAllAsRead() {
        const { error } = await (supabase.from('notifications') as any)
            .update({ is_read: true })
            .eq('is_read', false);

        if (error) throw error;
    },

    async createNotification(userId: string, type: 'info' | 'success' | 'warning' | 'error', title: string, message: string, link?: string) {
        const { error } = await (supabase.from('notifications') as any)
            .insert([{
                user_id: userId,
                type: type,
                title: title,
                message: message,
                link: link || null,
                is_read: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }]);

        if (error) throw error;
    },

    // Subscribe to realtime changes
    subscribeToNotifications(userId: string, callback: () => void) {
        return supabase
            .channel('public:notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    callback();
                }
            )
            .subscribe();
    }
};
