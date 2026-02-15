'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from '@/i18n/routing';
import { Camera, Settings, Home, LogOut, Menu, X, Wand2, Film, Video, Users, Mic, ChevronDown, Sparkles } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { m, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { Logo } from '@/components/ui/Logo';
import { useSettingsStore } from '@/stores/settingsStore';
import { NotificationBell } from '../notifications/NotificationBell';

// Maximum number of nav items visible directly on desktop
const MAX_VISIBLE_ITEMS = 5;

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
    const moreDropdownRef = useRef<HTMLDivElement>(null);

    const t = useTranslations('Navigation');
    const tCommon = useTranslations('Common');
    const locale = useLocale();
    const { avatarUrl, displayName } = useSettingsStore();

    const navItems = [
        { href: '/', label: t('home'), icon: Home },
        { href: '/kol-studio', label: t('kol_studio'), icon: Users },
        { href: '/story-studio', label: t('story_studio'), icon: Film },
        { href: '/video-analyzer', label: t('video_analyzer'), icon: Video },
        { href: '/image-studio/step-1-input', label: t('image_studio'), icon: Camera },
        { href: '/script-creator', label: t('script_creator'), icon: Wand2 },
        { href: '/voice-studio', label: t('voice_studio'), icon: Mic },
        { href: '/kol-mini-lulu', label: t('mini_lulu'), icon: Sparkles },
    ];

    // Split nav items: visible (max 5) and overflow (rest)
    const visibleNavItems = navItems.slice(0, MAX_VISIBLE_ITEMS);
    const overflowNavItems = navItems.slice(MAX_VISIBLE_ITEMS);
    const hasOverflow = overflowNavItems.length > 0;

    // Check if any overflow item is currently active
    const isOverflowActive = overflowNavItems.some(item => pathname === item.href);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Close menus on route change — legitimate side effect pattern
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMobileMenuOpen(false);
        setIsMoreDropdownOpen(false);
    }, [pathname]);

    // Close dropdown when clicking outside
    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
            setIsMoreDropdownOpen(false);
        }
    }, []);

    useEffect(() => {
        if (isMoreDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMoreDropdownOpen, handleClickOutside]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push('/login');
    };

    return (
        <>
            <header role="banner" className="sticky top-0 w-full py-6 -mb-28 flex items-center justify-center px-4 md:px-8 z-50 pointer-events-none">
                <div className="w-full max-w-7xl h-16 bg-white/[0.03] backdrop-blur-2xl rounded-full border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-between px-6 pointer-events-auto relative overflow-visible">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0 transition-transform hover:scale-105 active:scale-95 duration-300 focus:outline-none focus:ring-2 focus:ring-[#22d3ee] rounded-lg" aria-label="AIVI AI Studio Home">
                        <Logo size="sm" />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
                        {/* Visible items (max 5) */}
                        {visibleNavItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    aria-current={isActive ? 'page' : undefined}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-500 relative group/nav focus:outline-none focus:ring-2 focus:ring-[#22d3ee] ${isActive
                                        ? 'text-[#fcd34d]'
                                        : 'text-white/40 hover:text-white'
                                        }`}
                                >
                                    {isActive && (
                                        <m.div
                                            layoutId="nav-pill-active"
                                            className="absolute inset-0 bg-black/40 rounded-full border border-[#f43f5e]/30 shadow-[0_0_20px_rgba(244,63,94,0.3)] -z-10"
                                            transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                                        />
                                    )}
                                    <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-[#fcd34d]' : ''}`}>
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}

                        {/* "More" dropdown for overflow items */}
                        {hasOverflow && (
                            <div ref={moreDropdownRef} className="relative">
                                <button
                                    onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}
                                    aria-expanded={isMoreDropdownOpen}
                                    aria-haspopup="true"
                                    aria-label="More navigation items"
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all duration-500 relative group/nav focus:outline-none focus:ring-2 focus:ring-[#22d3ee] ${isOverflowActive
                                        ? 'text-[#fcd34d]'
                                        : 'text-white/40 hover:text-white'
                                        }`}
                                >
                                    {isOverflowActive && (
                                        <m.div
                                            layoutId="nav-pill-active"
                                            className="absolute inset-0 bg-black/40 rounded-full border border-[#f43f5e]/30 shadow-[0_0_20px_rgba(244,63,94,0.3)] -z-10"
                                            transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                                        />
                                    )}
                                    <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${isOverflowActive ? 'text-[#fcd34d]' : ''}`}>
                                        {t('more')}
                                    </span>
                                    <ChevronDown
                                        size={14}
                                        className={`transition-transform duration-300 ${isMoreDropdownOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {/* Dropdown Panel */}
                                <AnimatePresence>
                                    {isMoreDropdownOpen && (
                                        <m.div
                                            initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                                            className="absolute top-full right-0 mt-3 min-w-[220px] bg-[#0d1117]/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_30px_rgba(244,63,94,0.08)] p-2 z-[60]"
                                            role="menu"
                                        >
                                            {/* Decorative top accent line */}
                                            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#fcd34d]/40 to-transparent" />

                                            {overflowNavItems.map((item) => {
                                                const Icon = item.icon;
                                                const isActive = pathname === item.href;
                                                return (
                                                    <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group/dropdown ${isActive
                                                            ? 'bg-[#fcd34d]/10 text-[#fcd34d] shadow-[inset_0_0_15px_rgba(252,211,77,0.06)]'
                                                            : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
                                                            }`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${isActive
                                                            ? 'bg-[#fcd34d]/15 text-[#fcd34d]'
                                                            : 'bg-white/5 text-white/30 group-hover/dropdown:bg-white/10 group-hover/dropdown:text-white/60'
                                                            }`}>
                                                            <Icon size={16} />
                                                        </div>
                                                        <span className={`text-[11px] font-black uppercase tracking-[0.15em] ${isActive ? 'text-[#fcd34d]' : ''}`}>
                                                            {item.label}
                                                        </span>
                                                        {isActive && (
                                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#fcd34d] shadow-[0_0_8px_rgba(252,211,77,0.6)]" />
                                                        )}
                                                    </Link>
                                                );
                                            })}
                                        </m.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </nav>

                    {/* Right side controls */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block">
                            <LanguageSwitcher />
                        </div>

                        {user ? (
                            <div className="flex items-center gap-3 pl-3 border-l border-white/10">


                                <Link id="profile-menu" href="/profile" aria-label="User profile settings" className="w-10 h-10 rounded-full bg-[#fcd34d] p-[1.5px] group focus:outline-none focus:ring-2 focus:ring-[#22d3ee] focus:ring-offset-2 focus:ring-offset-[#0a0f1a] overflow-hidden relative">
                                    {avatarUrl ? (
                                        <div className="w-full h-full rounded-full overflow-hidden relative">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={avatarUrl}
                                                alt={displayName || user.email || 'User'}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-[#0a0f1a] flex items-center justify-center text-[#fcd34d] font-black text-xs transition-transform group-hover:scale-90">
                                            {(displayName || user.email)?.[0]?.toUpperCase()}
                                        </div>
                                    )}
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    aria-label="Sign out"
                                    className="hidden md:flex p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-[#f43f5e] transition-colors focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <Link href="/login" className="px-5 py-2 rounded-full bg-[#fcd34d] text-[#0a0f1a] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-[0_0_15px_rgba(252,211,77,0.3)]">
                                {t('login')}
                            </Link>
                        )}

                        {/* Notification Bell */}
                        <div className="hidden md:block">
                            <NotificationBell user={user} locale={locale} />
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={isMobileMenuOpen}
                            className="md:hidden p-2 rounded-full text-white/40 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 sm:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Menu Panel */}
                        <m.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed top-28 right-0 bottom-0 w-72 bg-[var(--bg-secondary)] border-l border-[var(--border)] z-50 sm:hidden overflow-y-auto"
                        >
                            {/* Navigation Links */}
                            <nav className="p-6 space-y-3" aria-label="Mobile navigation">
                                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 px-3">
                                    {t('menu')}
                                </p>

                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all border focus:outline-none focus:ring-2 focus:ring-[#22d3ee] ${isActive
                                                ? 'bg-[#22d3ee]/10 text-[#22d3ee] border-[#22d3ee]/30 shadow-[inset_0_0_20px_rgba(34,211,238,0.1)]'
                                                : 'text-[var(--text-secondary)] border-transparent hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <Icon size={22} className={isActive ? 'animate-pulse' : ''} />
                                            <span className="font-black uppercase tracking-[0.15em] text-[11px]">{item.label}</span>
                                        </Link>
                                    );
                                })}

                                {/* Mobile Controls: Notifications & Language */}
                                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[var(--border)] mt-6">
                                    <div className="flex flex-col gap-2 p-4 bg-white/5 rounded-2xl border border-white/10 items-center justify-center">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/30">{t('menu')}</span>
                                        <NotificationBell user={user} locale={locale} isMobile={true} />
                                    </div>
                                    <div className="flex flex-col gap-2 p-4 bg-white/5 rounded-2xl border border-white/10 items-center justify-center overflow-hidden">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/30">{locale.toUpperCase()}</span>
                                        <LanguageSwitcher />
                                    </div>
                                </div>
                            </nav>

                            {/* User Section */}
                            {user && (
                                <div className="p-4 border-t border-[var(--border)] mt-4">
                                    <div className="flex items-center gap-3 mb-4 px-3">
                                        <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-[var(--bg-primary)] font-bold">
                                            {user.email?.[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[150px]">
                                                {user.email?.split('@')[0]}
                                            </p>
                                            <p className="text-xs text-[var(--accent-gold)]">{tCommon('pro_plan')}</p>
                                        </div>
                                    </div>

                                    <Link href="/profile" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                                        <Settings size={18} />
                                        <span className="text-sm">{tCommon('account_settings')}</span>
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors mt-1"
                                    >
                                        <LogOut size={18} />
                                        <span className="text-sm">{t('logout')}</span>
                                    </button>
                                </div>
                            )}
                        </m.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
