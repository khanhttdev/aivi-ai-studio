'use client';

import { useKOLStudioStore } from '@/stores/kolStudioStore';
import { KOL_THEMES, KOLTheme } from '@/lib/kol/types';
import { m } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

export default function Step1ThemePage() {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('KOLStudio');

    const {
        selectedTheme,
        setSelectedTheme,
        customTheme,
        setCustomTheme,
    } = useKOLStudioStore();

    const handleThemeSelect = (theme: KOLTheme) => {
        setSelectedTheme(theme);
        if (theme.id !== 'custom') {
            setCustomTheme('');
        }
    };

    const handleNext = () => {
        if (selectedTheme) {
            router.push('/kol-studio/step-2-profile');
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full overflow-x-hidden">
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full space-y-8"
            >
                <div className="text-center space-y-2">
                    <h2 className="text-2xl md:text-3xl font-black gradient-text">
                        {t('step1.title') || '1. Chọn Chủ Đề KOL'}
                    </h2>
                    <p className="text-[var(--text-secondary)]">
                        {t('step1.subtitle') || 'Lĩnh vực hoạt động chính của Influencer AI'}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {KOL_THEMES.map((theme) => (
                        <m.button
                            key={theme.id}
                            onClick={() => handleThemeSelect(theme)}
                            className={`
                                relative p-6 rounded-2xl text-left transition-all duration-300 border-2 overflow-hidden group
                                ${selectedTheme?.id === theme.id
                                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                                    : 'border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--text-muted)]'
                                }
                            `}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="flex items-center gap-4 mb-3">
                                <div className={`
                                    w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                                    ${selectedTheme?.id === theme.id ? 'bg-[var(--accent-primary)]/20' : 'bg-[var(--bg-tertiary)]'}
                                `}>
                                    {theme.icon}
                                </div>
                                {selectedTheme?.id === theme.id && (
                                    <m.div
                                        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[var(--accent-primary)] flex items-center justify-center"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                    >
                                        <Sparkles size={12} className="text-black" />
                                    </m.div>
                                )}
                            </div>

                            <h3 className={`font-bold text-lg ${selectedTheme?.id === theme.id ? 'text-[var(--accent-primary)]' : 'text-white'}`}>
                                {locale === 'vi' ? theme.nameVi : theme.name}
                            </h3>
                            <p className="text-sm text-[var(--text-muted)] mt-1 line-clamp-2">
                                {locale === 'vi' ? theme.descriptionVi : theme.description}
                            </p>

                            {/* Hover highlight */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/0 via-cyan-500/0 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </m.button>
                    ))}
                </div>

                {selectedTheme?.id === 'custom' && (
                    <m.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="space-y-3"
                    >
                        <label className="text-sm font-medium text-[var(--text-secondary)]">
                            {t('step1.customLabel') || 'Hoặc nhập chủ đề khác của bạn:'}
                        </label>
                        <input
                            type="text"
                            value={customTheme}
                            onChange={(e) => setCustomTheme(e.target.value)}
                            placeholder="Ví dụ: Review đồ gia dụng, Vlog du lịch mạo hiểm..."
                            className="w-full bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-xl py-3 px-4 focus:border-[var(--accent-primary)] outline-none transition-all"
                        />
                    </m.div>
                )}

                <div className="flex justify-center pt-8">
                    <m.button
                        onClick={handleNext}
                        disabled={!selectedTheme || (selectedTheme.id === 'custom' && !customTheme)}
                        className={`
                            px-10 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all
                            ${selectedTheme && (selectedTheme.id !== 'custom' || customTheme)
                                ? 'bg-[var(--accent-primary)] text-black shadow-lg shadow-cyan-500/20 hover:brightness-110'
                                : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed'
                            }
                        `}
                        whileHover={selectedTheme ? { scale: 1.05 } : {}}
                        whileTap={selectedTheme ? { scale: 0.95 } : {}}
                    >
                        {t('step1.nextBtn') || 'Tiếp tục thiết lập'}
                        <ArrowRight size={20} />
                    </m.button>
                </div>
            </m.div>
        </div>
    );
}
