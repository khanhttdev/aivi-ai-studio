'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, Play, Sparkles, UserPlus, LogIn, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import { m } from 'framer-motion';

type AuthMode = 'signin' | 'signup';

export default function LoginPage() {
    const [mode, setMode] = useState<AuthMode>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [magicLinkLoading, setMagicLinkLoading] = useState(false);

    const router = useRouter();
    const t = useTranslations('Auth');
    const locale = useLocale();

    const validateForm = () => {
        if (!email || !email.includes('@') || !email.includes('.')) {
            toast.error(t('invalid_email'), {
                style: { background: 'var(--bg-tertiary)', border: '1px solid var(--error)', color: 'var(--error)' }
            });
            return false;
        }
        if (password.length < 6) {
            toast.error(t('password_too_short'), {
                style: { background: 'var(--bg-tertiary)', border: '1px solid var(--error)', color: 'var(--error)' }
            });
            return false;
        }
        return true;
    };

    const handleEmailPasswordAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);

        try {
            if (mode === 'signin') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;

                toast.success(t('toast_success_login'), {
                    style: { background: 'var(--bg-tertiary)', border: '1px solid var(--success)', color: 'var(--success)' }
                });

                router.push(`/${locale}`);
                router.refresh();
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback`,
                    },
                });

                if (error) throw error;

                toast.success(t('toast_success_signup'), {
                    style: { background: 'var(--bg-tertiary)', border: '1px solid var(--success)', color: 'var(--success)' },
                    duration: 5000,
                });
                setMode('signin');
                setPassword('');
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : (mode === 'signin' ? t('error_login') : t('error_signup'));
            toast.error(errorMsg, {
                style: { background: 'var(--bg-tertiary)', border: '1px solid var(--error)', color: 'var(--error)' }
            });
        } finally {
            setLoading(false);
        }
    };

    const handleMagicLink = async () => {
        if (!email || !email.includes('@') || !email.includes('.')) {
            toast.error(t('invalid_email'), {
                style: { background: 'var(--bg-tertiary)', border: '1px solid var(--error)', color: 'var(--error)' }
            });
            return;
        }

        setMagicLinkLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${location.origin}/auth/callback`,
                }
            });

            if (error) throw error;

            toast.success(t('toast_success_magic_link'), {
                style: { background: 'var(--bg-tertiary)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' },
                duration: 5000,
            });
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : t('toast_error_system');
            toast.error(errorMsg, {
                style: { background: 'var(--bg-tertiary)', border: '1px solid var(--error)', color: 'var(--error)' }
            });
        } finally {
            setMagicLinkLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${location.origin}/auth/callback`,
                }
            });

            if (error) throw error;
        } catch (err) {
            toast.error(t('toast_error_system'), {
                style: { background: 'var(--bg-tertiary)', border: '1px solid var(--error)', color: 'var(--error)' }
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-transparent">
            {/* Glow orbs */}
            <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-[var(--accent-primary)] rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-pulse pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-[var(--accent-purple)] rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

            <div className="w-full max-w-md relative z-10">
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[var(--bg-secondary)]/80 border border-[var(--border)] rounded-[2rem] shadow-2xl backdrop-blur-3xl overflow-hidden glass-card"
                >
                    {/* Header */}
                    <div className="p-8 pb-6 text-center border-b border-[var(--border)] bg-gradient-to-b from-[var(--bg-tertiary)]/50 to-transparent">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--accent-primary)]/10 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.2)] border border-[var(--accent-primary)]/20">
                            <Sparkles className="text-[var(--accent-primary)]" size={24} />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight mb-2">
                            {t('welcome_prefix')} <span className="gradient-text">{t('welcome_suffix')}</span>
                        </h1>
                        <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-[0.2em]">
                            {t('subtitle')}
                        </p>
                    </div>

                    <div className="p-8 pt-6">
                        {/* Mode Switcher */}
                        <div className="flex p-1 bg-[var(--bg-tertiary)] rounded-full mb-8 border border-[var(--border)]">
                            <button
                                onClick={() => setMode('signin')}
                                className={`flex-1 py-2 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${mode === 'signin'
                                        ? 'bg-[var(--accent-primary)] text-black shadow-md'
                                        : 'text-[var(--text-muted)] hover:text-white'
                                    }`}
                            >
                                <LogIn size={14} />
                                {t('connect_btn')}
                            </button>
                            <button
                                onClick={() => setMode('signup')}
                                className={`flex-1 py-2 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${mode === 'signup'
                                        ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] shadow-md border border-[var(--accent-primary)]/30'
                                        : 'text-[var(--text-muted)] hover:text-white'
                                    }`}
                            >
                                <UserPlus size={14} />
                                {t('signup_btn')}
                            </button>
                        </div>

                        <form onSubmit={handleEmailPasswordAuth} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider ml-1">
                                    {t('email_label')}
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-primary)] transition-colors" size={18} />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-[var(--bg-tertiary)]/50 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--accent-primary)]/50 focus:border-[var(--accent-primary)] transition-all placeholder-[var(--text-muted)] text-white text-sm"
                                        placeholder={t('email_placeholder')}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />

                                    {/* Inline Magic Link Button */}
                                    {mode === 'signin' && email.includes('@') && (
                                        <button
                                            type="button"
                                            onClick={handleMagicLink}
                                            disabled={magicLinkLoading}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[10px] font-bold text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 transition-colors flex items-center gap-1"
                                            title="Send magic login link"
                                        >
                                            {magicLinkLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                            Magic Link
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider ml-1">
                                    {t('password_label')}
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-primary)] transition-colors" size={18} />
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-[var(--bg-tertiary)]/50 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--accent-primary)]/50 focus:border-[var(--accent-primary)] transition-all placeholder-[var(--text-muted)] text-white text-sm"
                                        placeholder={t('password_placeholder')}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-[var(--accent-primary)] text-black rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-2 shadow-[0_5px_15px_rgba(6,182,212,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : (mode === 'signin' ? <Play size={16} fill="currentColor" /> : <UserPlus size={16} />)}
                                {mode === 'signin' ? t('connect_btn') : t('signup_btn')}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 h-px bg-[var(--border)]" />
                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">OR</span>
                            <div className="flex-1 h-px bg-[var(--border)]" />
                        </div>

                        {/* Social Logins */}
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full py-3.5 bg-white text-black hover:bg-gray-100 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            {t('google_btn')}
                        </button>
                    </div>
                </m.div>

                <div className="text-center mt-6">
                    <Link href="/" className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">
                        <ArrowRight className="rotate-180" size={14} />
                        {t('return_home')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
