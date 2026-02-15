'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { m } from 'framer-motion';
import { Settings, Key, User as UserIcon, Save, Check, Shield, Camera, Edit2, LogOut, Eye, EyeOff, Bell } from 'lucide-react';
import { NotificationList } from '@/components/notifications/NotificationList';
import { notificationService } from '@/lib/services/notificationService';
import { useTranslations } from 'next-intl';
import { useSettingsStore } from '@/stores/settingsStore';
import { useToastStore } from '@/stores/toastStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';

const AVATAR_PRESETS = [
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Willow',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Emery',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Jude',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Brook',
];

export default function ProfilePage() {
    const router = useRouter();
    const t = useTranslations('Profile');
    const tNotif = useTranslations('Notifications');
    const {
        apiKey, setApiKey, hasApiKey,
        avatarUrl, setAvatarUrl,
        displayName, setDisplayName
    } = useSettingsStore();

    const addToast = useToastStore((state) => state.addToast);

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Form States
    const [inputKey, setInputKey] = useState('');
    const [inputName, setInputName] = useState('');
    const [inputAvatar, setInputAvatar] = useState('');

    const [savedKey, setSavedKey] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [saveProfileSuccess, setSaveProfileSuccess] = useState(false);

    // Navigation State
    const [activeTab, setActiveTab] = useState<'settings' | 'security' | 'notifications'>('settings');

    // Security Form State
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Notification Badge on Tab
    const [unreadCount, setUnreadCount] = useState(0);
    const searchParams = useSearchParams();
    const locale = useLocale();

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'notifications') {
            setActiveTab('notifications');
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchUnread = async () => {
            if (!user) return;
            try {
                const count = await notificationService.getUnreadCount();
                setUnreadCount(count);
            } catch (e) {
                console.error(e);
            }
        };
        fetchUnread();

        // Subscribe to update badge even here
        if (user) {
            const channel = notificationService.subscribeToNotifications(user.id, () => {
                setUnreadCount(prev => prev + 1);
            });
            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user]);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);

            if (user) {
                // Initialize form with store values or user metadata
                setInputName(displayName || user.user_metadata?.full_name || user.email?.split('@')[0] || '');
                setInputAvatar(avatarUrl || user.user_metadata?.avatar_url || '');
            }
        };
        getUser();
    }, [displayName, avatarUrl]);

    useEffect(() => {
        setInputKey(apiKey);
        setSavedKey(hasApiKey());
    }, [apiKey, hasApiKey]);

    const handleSaveKey = () => {
        if (!inputKey.trim()) {
            setApiKey('');
            setSavedKey(false);
            return;
        }

        if (inputKey.startsWith('AIza')) {
            setApiKey(inputKey.trim());
            setSavedKey(true);
            setTimeout(() => setSavedKey(false), 2000);
            addToast(t('config_saved'), 'success');
        } else {
            addToast(t('invalid_api_key'), 'error');
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        // Validation (Max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            addToast(t('avatar_file_size_error'), 'error');
            return;
        }

        try {
            setIsSavingProfile(true); // Re-use saving state for visual feedback

            const fileExt = file.name.split('.').pop();
            const fileName = `avatars/${user.id}/${Date.now()}.${fileExt}`;

            // 1. Upload to 'images' bucket (assuming it exists and is public based on other code)
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(fileName);

            // 3. Update Input State
            setInputAvatar(publicUrl);
            addToast(t('avatar_upload_success'), 'success');

        } catch (error) {
            console.error('Error uploading avatar:', error);
            addToast(t('avatar_upload_error'), 'error');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleChangePassword = async () => {
        if (!passwordData.newPassword || !passwordData.confirmPassword) {
            addToast(t('fill_all_fields'), 'error');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            addToast(t('password_mismatch'), 'error');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            addToast(t('password_too_short'), 'error');
            return;
        }

        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])/;

        if (!strongPasswordRegex.test(passwordData.newPassword)) {
            addToast(t('password_req_uppercase'), 'error');
            return;
        }

        setIsChangingPassword(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            });

            if (error) throw error;

            addToast(t('password_updated'), 'success');
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (error: unknown) {
            console.error('Error changing password:', error);
            if (error instanceof Error && error.message?.includes('requires reauthentication')) {
                addToast(t('reauth_required'), 'error');
            } else {
                addToast(t('password_update_failed'), 'error');
            }
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setIsSavingProfile(true);

        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: inputName,
                    avatar_url: inputAvatar
                }
            });

            if (error) throw error;

            setDisplayName(inputName);
            setAvatarUrl(inputAvatar);

            setSaveProfileSuccess(true);
            setTimeout(() => setSaveProfileSuccess(false), 2000);
            addToast(t('profile_update_success'), 'success');

        } catch (error) {
            console.error('Error updating profile:', error);
            addToast(t('profile_update_error'), 'error');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-[var(--accent-primary)] border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
                <div className="glass-panel p-8 rounded-2xl text-center max-w-md w-full">
                    <UserIcon size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">{t('not_logged_in')}</h2>
                    <p className="text-[var(--text-secondary)] mb-6">{t('login_required_msg')}</p>
                    <Link href="/login" className="px-6 py-2 bg-[var(--accent-primary)] text-black rounded-lg font-bold">
                        {t('login_now')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent text-[var(--text-primary)] font-sans pb-20">
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--accent-primary)]/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--accent-purple)]/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-5xl mx-auto py-12 px-6">
                <header className="mb-12 flex items-end justify-between">
                    <div>
                        <m.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 mb-4"
                        >
                            <div className="p-3 bg-[var(--accent-primary)]/10 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.1)] border border-[var(--accent-primary)]/20">
                                <Settings className="w-8 h-8 text-[var(--accent-primary)]" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
                                {t('system_profile')}
                            </h1>
                        </m.div>
                        <m.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-[var(--text-secondary)] text-sm uppercase tracking-[0.2em] font-black opacity-60"
                        >
                            {t('subtitle')}
                        </m.p>
                    </div>
                    <m.button
                        onClick={handleLogout}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors border border-transparent hover:border-[var(--error)]/20"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <LogOut size={18} />
                        <span className="font-bold text-sm">{t('sign_out')}</span>
                    </m.button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 space-y-6">
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[var(--bg-secondary)]/50 border border-[var(--border)] rounded-[2rem] p-6 glass-card relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative flex flex-col items-center text-center">
                                <m.div
                                    className="relative mb-4 group/avatar cursor-pointer"
                                    onClick={() => document.getElementById('avatar-upload')?.click()}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <div className="w-32 h-32 rounded-full border-4 border-[var(--bg-secondary)] shadow-2xl overflow-hidden bg-[var(--bg-tertiary)] relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={inputAvatar || user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${inputName || user.email}&background=random`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                            <Camera className="text-white w-8 h-8" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 right-0 p-2 bg-[var(--accent-primary)] rounded-full text-black shadow-lg hover:scale-110 transition-transform">
                                        <Edit2 size={14} />
                                    </div>
                                    <input
                                        type="file"
                                        id="avatar-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                    />
                                </m.div>

                                <h2 className="text-xl font-bold text-white mb-1">{inputName || 'User'}</h2>
                                <p className="text-sm text-[var(--text-secondary)] mb-4">{user.email}</p>

                                <div className="px-3 py-1 bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] rounded-full text-[10px] font-black uppercase tracking-widest border border-[var(--accent-gold)]/20">
                                    {t('pro_plan')}
                                </div>
                            </div>
                        </m.div>

                        <div className="space-y-2">
                            <m.button
                                onClick={() => setActiveTab('settings')}
                                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'settings' ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'}`}
                                whileHover={{ x: 5 }}
                            >
                                <UserIcon className="w-4 h-4" /> {t('account_settings')}
                            </m.button>
                            <m.button
                                onClick={() => setActiveTab('security')}
                                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'security' ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'}`}
                                whileHover={{ x: 5 }}
                            >
                                <Shield className="w-4 h-4" /> {t('security_privacy')}
                            </m.button>
                            <m.button
                                onClick={() => setActiveTab('notifications')}
                                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all relative ${activeTab === 'notifications' ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'}`}
                                whileHover={{ x: 5 }}
                            >
                                <Bell className="w-4 h-4" />
                                <span>Thông báo</span>
                                {unreadCount > 0 && (
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 min-w-[18px] h-[18px] flex items-center justify-center bg-[var(--error)] text-white text-[9px] font-bold rounded-full px-1.5 shadow-lg">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </m.button>
                        </div>
                    </div>

                    <div className="lg:col-span-8 space-y-6">
                        {activeTab === 'settings' && (
                            <>
                                <m.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[2.5rem] p-8 glass-card"
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                                            <span className="w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-pulse" />
                                            {t('personal_information')}
                                        </h2>
                                        {saveProfileSuccess && (
                                            <span className="text-[var(--success)] text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-right">
                                                <Check size={16} /> Saved
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">
                                                {t('display_name')}
                                            </label>
                                            <input
                                                type="text"
                                                value={inputName}
                                                onChange={(e) => setInputName(e.target.value)}
                                                className="w-full p-4 bg-[var(--bg-tertiary)]/50 border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-[var(--accent-primary)]/50 focus:border-[var(--accent-primary)] transition-all text-white placeholder-[var(--text-muted)]"
                                                placeholder={t('enter_display_name')}
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">
                                                {t('avatar_url_label')}
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={inputAvatar}
                                                    onChange={(e) => setInputAvatar(e.target.value)}
                                                    className="flex-1 p-4 bg-[var(--bg-tertiary)]/50 border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-[var(--accent-primary)]/50 focus:border-[var(--accent-primary)] transition-all text-white placeholder-[var(--text-muted)] text-sm"
                                                    placeholder="https://..."
                                                />
                                            </div>

                                            <div className="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar">
                                                {AVATAR_PRESETS.map((url, idx) => (
                                                    <m.button
                                                        key={idx}
                                                        onClick={() => setInputAvatar(url)}
                                                        className={`flex-shrink-0 w-10 h-10 rounded-full border-2 overflow-hidden transition-all ${inputAvatar === url ? 'border-[var(--accent-primary)] scale-110 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                                                    </m.button>
                                                ))}
                                            </div>
                                        </div>

                                        <m.button
                                            onClick={handleSaveProfile}
                                            disabled={isSavingProfile}
                                            className="px-8 py-3 bg-[var(--bg-tertiary)] hover:bg-[var(--accent-primary)] hover:text-black text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {isSavingProfile ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
                                            {t('save_changes')}
                                        </m.button>
                                    </div>
                                </m.div>

                                <m.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[2.5rem] p-8 glass-card"
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                                            <span className="w-2 h-2 bg-[var(--accent-purple)] rounded-full animate-pulse"></span>
                                            {t('gemini_config')}
                                        </h2>
                                        <div className="px-3 py-1 bg-[var(--success)]/10 text-[var(--success)] text-[10px] font-black rounded-lg uppercase tracking-widest border border-[var(--success)]/20">
                                            {t('cloud_active')}
                                        </div>
                                    </div>

                                    <div className="relative group mb-6">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Key className="h-5 w-5 text-[var(--text-muted)] group-focus-within:text-[var(--accent-purple)] transition-colors" />
                                        </div>
                                        <input
                                            type="password"
                                            value={inputKey}
                                            onChange={(e) => {
                                                setInputKey(e.target.value);
                                                setSavedKey(false);
                                            }}
                                            className="block w-full pl-12 pr-4 py-4 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-[var(--accent-purple)]/50 focus:border-[var(--accent-purple)] transition-all placeholder-[var(--text-muted)] text-white font-mono"
                                            placeholder={t('api_key_placeholder')}
                                        />
                                    </div>

                                    <m.button
                                        onClick={handleSaveKey}
                                        className="w-full py-4 bg-[var(--accent-purple)] text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(168,85,247,0.2)]"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {savedKey ? (
                                            <>
                                                <Bell className="w-4 h-4" /> {tNotif('title')}
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" /> {t('deploy_key')}
                                            </>
                                        )}
                                    </m.button>

                                    <div className="mt-4 text-center">
                                        <a
                                            href="https://aistudio.google.com/app/apikey"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-purple)] hover:underline inline-flex items-center gap-1"
                                        >
                                            {t('deploy_from_google')} <Save className="w-3 h-3 rotate-[-90deg]" />
                                        </a>
                                    </div>
                                </m.div>
                            </>
                        )}

                        {activeTab === 'security' && (
                            <m.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[2.5rem] p-8 glass-card"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                                        <span className="w-2 h-2 bg-[var(--error)] rounded-full animate-pulse" />
                                        {t('security_privacy')}
                                    </h2>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-6">
                                        <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border)] pb-2">
                                            Change Password
                                        </h3>

                                        <div className="space-y-4">
                                            <div className="space-y-2 relative">
                                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">
                                                    New Password
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showNewPassword ? "text" : "password"}
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                        className="w-full p-4 bg-[var(--bg-tertiary)]/50 border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-[var(--accent-primary)]/50 focus:border-[var(--accent-primary)] transition-all text-white placeholder-[var(--text-muted)] pr-12"
                                                        placeholder="Enter new password"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition-colors"
                                                    >
                                                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-2 relative">
                                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">
                                                    Confirm Password
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        value={passwordData.confirmPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                        className="w-full p-4 bg-[var(--bg-tertiary)]/50 border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-[var(--accent-primary)]/50 focus:border-[var(--accent-primary)] transition-all text-white placeholder-[var(--text-muted)] pr-12"
                                                        placeholder="Confirm new password"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition-colors"
                                                    >
                                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <m.button
                                            onClick={handleChangePassword}
                                            disabled={isChangingPassword}
                                            className="px-8 py-3 bg-[var(--bg-tertiary)] hover:bg-[var(--error)] hover:text-white text-[var(--text-primary)] rounded-xl font-bold text-sm transition-all flex items-center gap-2 border border-[var(--border)] hover:border-[var(--error)]"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {isChangingPassword ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Shield size={18} />}
                                            Update Password
                                        </m.button>
                                    </div>
                                </div>
                            </m.div>
                        )}

                        {activeTab === 'notifications' && (
                            <m.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[2.5rem] p-8 glass-card"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                                        <span className="w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-pulse" />
                                        {tNotif('title')}
                                    </h2>
                                    <div className="px-3 py-1 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-[10px] font-bold rounded-lg uppercase tracking-widest border border-[var(--border)]">
                                        {tNotif('personal_inbox')}
                                    </div>
                                </div>

                                <NotificationList userId={user.id} locale={locale} />
                            </m.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
