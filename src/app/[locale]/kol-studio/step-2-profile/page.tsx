'use client';

import { useKOLStudioStore } from '@/stores/kolStudioStore';

import { generateKOLProfilePrompt } from '@/lib/kol/prompts';
import { m } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, Loader2, User, Palette, Heart, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useApiKeyEnforcer } from '@/hooks/useApiKeyEnforcer';

export default function Step2ProfilePage() {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('KOLStudio');

    const {
        selectedTheme,
        customTheme,
        kolName,
        setKOLName,
        channelPositioning,
        setChannelPositioning,
        kolProfile,
        setKOLProfile,
        isGeneratingProfile,
        setIsGeneratingProfile,
    } = useKOLStudioStore();

    const { apiKey } = useSettingsStore();
    const { checkApiKey, ApiKeyEnforcer } = useApiKeyEnforcer();

    const [error, setError] = useState<string | null>(null);

    // Redirect if no theme
    useEffect(() => {
        if (!selectedTheme) {
            router.push('/kol-studio/step-1-theme');
        }
    }, [selectedTheme, router]);

    const handleGenerateProfile = async () => {
        if (!kolName || !channelPositioning || !selectedTheme) return;

        if (!checkApiKey()) return;

        setIsGeneratingProfile(true);
        setError(null);

        try {
            const prompt = generateKOLProfilePrompt(
                kolName,
                selectedTheme.id === 'custom' ? (customTheme || '') : (locale === 'vi' ? (selectedTheme.nameVi || selectedTheme.name) : selectedTheme.name),
                channelPositioning
            );

            const response = await fetch('/api/kol/generate-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, apiKey }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate profile');
            }

            setKOLProfile(data.result);

            // Auto-navigate removed as per user request
            // router.push('/kol-studio/step-3-generate');
        } catch (err) {
            console.error('Error generating profile:', err);
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
        } finally {
            setIsGeneratingProfile(false);
        }
    };

    const handleNext = () => {
        if (kolProfile) {
            router.push('/kol-studio/step-3-generate');
        }
    };

    if (!selectedTheme) return null;

    return (
        <div className="flex-1 flex flex-col items-center p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full overflow-x-hidden">
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full space-y-8"
            >
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/kol-studio/step-1-theme')}
                        className="p-2 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-white transition-all"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black gradient-text">
                            {t('step2.title') || '2. Thiết Lập Nhân Vật'}
                        </h2>
                        <p className="text-[var(--text-secondary)]">
                            Xác định danh tính và cá tính cho Influencer AI
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Form Left */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                                <User size={16} />
                                {t('step2.nameLabel') || 'Tên Influencer:'}
                            </label>
                            <input
                                type="text"
                                value={kolName}
                                onChange={(e) => setKOLName(e.target.value)}
                                placeholder="Ví dụ: AI Mei, Karo Tech..."
                                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-xl py-3 px-4 focus:border-[var(--accent-primary)] outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                                <Palette size={16} />
                                {t('step2.positioningLabel') || 'Định hướng nội dung / Phong cách:'}
                            </label>
                            <textarea
                                value={channelPositioning}
                                onChange={(e) => setChannelPositioning(e.target.value)}
                                placeholder="Ví dụ: GenZ năng động, hài hước, phong cách tối giản, hay chia sẻ về kiến thức AI và đời sống..."
                                rows={4}
                                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-xl py-3 px-4 focus:border-[var(--accent-primary)] outline-none transition-all resize-none"
                            />
                        </div>

                        <m.button
                            onClick={handleGenerateProfile}
                            disabled={!kolName || !channelPositioning || isGeneratingProfile}
                            className={`
                                w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all
                                ${kolName && channelPositioning && !isGeneratingProfile
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg hover:shadow-cyan-500/20'
                                    : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed'
                                }
                            `}
                            whileHover={kolName && channelPositioning ? { scale: 1.02 } : {}}
                            whileTap={kolName && channelPositioning ? { scale: 0.98 } : {}}
                        >
                            {isGeneratingProfile ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    {t('step2.generating') || 'Đang phân tích nhân vật...'}
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} />
                                    {t('step2.generateBtn') || 'Tạo Hồ Sơ Nhân Vật'}
                                </>
                            )}
                        </m.button>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Results Right */}
                    <div className="flex flex-col">
                        <div className={`
                            flex-1 p-6 rounded-3xl border-2 border-dashed flex flex-col
                            ${kolProfile ? 'border-[var(--accent-primary)]/30 bg-[var(--bg-secondary)]/50' : 'border-[var(--border)] bg-[var(--bg-tertiary)]/30'}
                        `}>
                            {!kolProfile && !isGeneratingProfile ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                    <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
                                        <Sparkles size={32} className="text-[var(--text-muted)]" />
                                    </div>
                                    <h4 className="font-bold mb-2">Chưa có hồ sơ</h4>
                                    <p className="text-sm text-[var(--text-muted)]">
                                        Điền thông tin bên trái và nhấn nút &quot;Tạo Hồ Sơ&quot; để AI đề xuất tính cách và ngoại hình chi tiết.
                                    </p>
                                </div>
                            ) : isGeneratingProfile ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4">
                                    <div className="relative">
                                        <Loader2 size={60} className="animate-spin text-[var(--accent-primary)]" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <User size={24} className="text-white" />
                                        </div>
                                    </div>
                                    <p className="animate-pulse text-[var(--text-secondary)]">AI đang phác họa nhân vật đặc trưng cho {kolName}...</p>
                                </div>
                            ) : (
                                <m.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center text-[var(--accent-primary)]">
                                            <Sparkles size={20} />
                                        </div>
                                        <h4 className="text-lg font-bold">Hồ Sơ Influencer AI</h4>
                                    </div>

                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)] flex items-center gap-2">
                                                <Palette size={10} /> {t('step2.appearance') || 'Ngoại hình đề xuất'}
                                            </p>
                                            <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                                                {kolProfile?.appearanceSummary ||
                                                    (typeof kolProfile?.appearance === 'string'
                                                        ? kolProfile.appearance
                                                        : kolProfile?.appearance?.hairStyle && `${kolProfile.appearance.hairStyle}, ${kolProfile.appearance.hairColor}`)}
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-purple)] flex items-center gap-2">
                                                <Heart size={10} /> {t('step2.personality') || 'Tính cách & Giọng điệu'}
                                            </p>
                                            <p className="text-sm leading-relaxed text-[var(--text-primary)]">{kolProfile?.personality}</p>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-amber)] flex items-center gap-2">
                                                <Briefcase size={10} /> {t('step2.expertise') || 'Kỹ năng chuyên môn'}
                                            </p>
                                            <p className="text-sm leading-relaxed text-[var(--text-primary)]">{kolProfile?.expertise || kolProfile?.occupation}</p>
                                        </div>
                                    </div>
                                </m.div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Navigation */}
                {kolProfile && (
                    <m.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center pt-4"
                    >
                        <m.button
                            onClick={handleNext}
                            className="px-10 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 bg-[var(--accent-primary)] text-black shadow-lg shadow-cyan-500/20 hover:brightness-110 transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {t('step2.nextBtn') || 'Tạo Hình KOL'}
                            <ArrowRight size={20} />
                        </m.button>
                    </m.div>
                )}
            </m.div>
            <ApiKeyEnforcer />
        </div>
    );
}
