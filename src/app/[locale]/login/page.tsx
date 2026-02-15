'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, Play } from 'lucide-react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const t = useTranslations('Auth');
    const locale = useLocale();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }

            router.push(`/${locale}`);
            router.refresh(); // Refresh to update middleware/server components
        } catch (err) {
            setError(err instanceof Error ? err.message : t('error_login'));
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async () => {
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${location.origin}/auth/callback`,
                },
            });

            if (error) {
                throw error;
            }

            setError(t('email_sent'));
        } catch (err) {
            setError(err instanceof Error ? err.message : t('error_signup'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-transparent">
            {/* Phase Marker */}




            {/* Glow orbs */}
            <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-[var(--accent-primary)] rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-pulse" />
            <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-[var(--accent-purple)] rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="w-full max-w-md relative z-10">
                <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[3rem] p-10 shadow-2xl backdrop-blur-3xl glass-card">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--accent-primary)]/10 mb-6 shadow-[0_0_20px_rgba(6,182,212,0.2)] border border-[var(--accent-primary)]/20">
                            <span className="text-[var(--accent-primary)] font-black text-xl">AI</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter mb-2">{t('welcome_prefix')} <span className="gradient-text">{t('welcome_suffix')}</span></h1>
                        <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em]">{t('subtitle')}</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-2">{t('email_label')}</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-primary)] transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-[var(--bg-tertiary)]/50 border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-[var(--accent-primary)]/50 focus:border-[var(--accent-primary)] transition-all placeholder-[var(--text-muted)] text-white"
                                    placeholder={t('email_placeholder')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-2">{t('password_label')}</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-primary)] transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-[var(--bg-tertiary)]/50 border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-[var(--accent-primary)]/50 focus:border-[var(--accent-primary)] transition-all placeholder-[var(--text-muted)] text-white"
                                    placeholder={t('password_placeholder')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className={`p-3 rounded-lg text-sm ${error.includes('xác nhận') ? 'bg-[var(--success)]/10 text-[var(--success)]' : 'bg-[var(--error)]/10 text-[var(--error)]'}`}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-[var(--accent-primary)] text-black rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-2 mt-4 shadow-[0_10px_30px_rgba(6,182,212,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} fill="currentColor" />}
                            {t('connect_btn')}
                        </button>

                        <button
                            type="button"
                            onClick={handleSignUp}
                            disabled={loading}
                            className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-all"
                        >
                            {t('signup_btn')}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-8">
                    <Link href="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">
                        {t('return_home')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
