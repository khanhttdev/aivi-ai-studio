'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { Languages } from 'lucide-react';
import { useTransition } from 'react';
import { m, AnimatePresence } from 'framer-motion';

export function LanguageSwitcher() {
    const t = useTranslations('Common');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const toggleLanguage = () => {
        const nextLocale = locale === 'vi' ? 'en' : 'vi';
        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
        });
    };

    return (
        <button
            onClick={toggleLanguage}
            disabled={isPending}
            className={`
                group relative flex items-center gap-2 p-1 pr-4 rounded-full 
                bg-white/5 backdrop-blur-xl border border-white/10 
                hover:border-[#22d3ee]/50 transition-all duration-500
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-2xl active:scale-95
            `}
            title={t('switch_language')}
        >
            {/* Animated Indicator Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#22d3ee]/10 to-[#f43f5e]/10 opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-500" />

            {/* Visual Icon Box */}
            <div className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${locale === 'vi' ? 'bg-[#f43f5e]/20 text-[#f43f5e]' : 'bg-[#22d3ee]/20 text-[#22d3ee]'}
                border border-white/10 group-hover:scale-110 transition-transform duration-500
            `}>
                <Languages size={14} className={isPending ? 'animate-spin' : ''} />
            </div>

            <div className="flex flex-col items-start leading-none relative z-10">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/60 transition-colors">
                    Language
                </span>
                <AnimatePresence mode="wait">
                    <m.span
                        key={locale}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="text-[11px] font-bold text-white group-hover:text-[#22d3ee] transition-colors"
                    >
                        {locale === 'vi' ? 'Tiếng Việt' : 'English'}
                    </m.span>
                </AnimatePresence>
            </div>

            {/* Glowing Dot */}
            <div className={`w-1 h-1 rounded-full absolute right-2.5 top-1/2 -translate-y-1/2 shadow-[0_0_8px_currentColor] ${locale === 'vi' ? 'bg-[#f43f5e] text-[#f43f5e]' : 'bg-[#22d3ee] text-[#22d3ee]'}`} />
        </button>
    );
}
