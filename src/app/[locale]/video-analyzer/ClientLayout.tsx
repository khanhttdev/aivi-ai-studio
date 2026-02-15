'use client';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Sparkles, TrendingUp, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function VideoAnalyzerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    // Using the 'VideoAnalyzer' namespace
    const t = useTranslations('VideoAnalyzer');

    // Check if we are on a detail page (UUID pattern or just deeper than root)
    const isDetailPage = pathname.length > '/video-analyzer'.length;

    const pills = [
        {
            id: 'upload',
            label: t('pills.upload'),
            icon: Video,
            href: '/video-analyzer',
            active: !isDetailPage
        },
        {
            id: 'detection',
            label: t('pills.detection'),
            icon: Sparkles,
            href: isDetailPage ? '#ai-detection' : undefined,
            active: false
        },
        {
            id: 'viral',
            label: t('pills.viral'),
            icon: TrendingUp,
            href: isDetailPage ? '#viral-score' : undefined,
            active: false
        },
        {
            id: 'export',
            label: t('pills.export'),
            icon: Download,
            href: isDetailPage ? '#export-prompts' : undefined,
            active: false
        },
    ];

    const scrollToSection = (id: string) => {
        if (!isDetailPage) return;
        const element = document.getElementById(id.replace('#', ''));
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-purple)]/30">
            {/* Background Ambient Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--accent-purple)]/10 blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--accent-cyan)]/10 blur-[100px]" />
                <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-[var(--accent-primary)]/5 blur-[150px]" />
            </div>

            {/* Feature Pills */}
            <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-20 hidden lg:flex flex-col gap-4">
                {pills.map((pill) => (
                    <FeaturePill
                        key={pill.id}
                        icon={pill.icon}
                        label={pill.label}
                        active={pill.active}
                        onClick={() => pill.href?.startsWith('#') ? scrollToSection(pill.href) : null}
                        disabled={!pill.href}
                    />
                ))}
            </div>

            {/* Main Content */}
            <main className="relative min-h-screen z-10 flex flex-col">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex-1 flex flex-col"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}

function FeaturePill({
    icon: Icon,
    label,
    active = false,
    onClick,
    disabled = false
}: {
    icon: React.ElementType;
    label: string;
    active?: boolean;
    onClick?: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
            flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300
            ${active
                    ? 'bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/40 shadow-lg shadow-[var(--accent-primary)]/10'
                    : disabled
                        ? 'bg-transparent border border-transparent opacity-30 cursor-not-allowed'
                        : 'bg-[var(--bg-secondary)]/50 border border-[var(--border)]/50 opacity-50 hover:opacity-100 cursor-pointer hover:scale-105'
                }
        `}>
            <Icon className={`w-4 h-4 ${active ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`} />
            <span className={`text-xs font-medium ${active ? 'text-white' : 'text-[var(--text-secondary)]'}`}>
                {label}
            </span>
        </button>
    );
}
