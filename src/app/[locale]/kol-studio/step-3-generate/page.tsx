'use client';

import { useKOLStudioStore } from '@/stores/kolStudioStore';
import { KOLEntity } from '@/lib/kol/types';
import { generateBaseKOLImagePrompt } from '@/lib/kol/prompts';
import { m } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, Loader2, RotateCcw, Download, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { useSettingsStore } from '@/stores/settingsStore';
// import { useToastStore } from '@/stores/toastStore';
import { useApiKeyEnforcer } from '@/hooks/useApiKeyEnforcer';

export default function Step3GeneratePage() {
    const router = useRouter();
    // const locale = useLocale();
    const t = useTranslations('KOLStudio');

    const {
        kolProfile,
        kolName,
        selectedTheme,
        customTheme,
        channelPositioning,
        baseKOLImage,
        setBaseKOLImage,
        isGeneratingBase,
        setIsGeneratingBase,
        setCurrentKOL,
    } = useKOLStudioStore();

    const { apiKey } = useSettingsStore();
    // const { addToast } = useToastStore();
    const { checkApiKey, ApiKeyEnforcer } = useApiKeyEnforcer();

    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Redirect if no profile
    useEffect(() => {
        if (!kolProfile || !kolName) {
            router.push('/kol-studio/step-2-profile');
        }
    }, [kolProfile, kolName, router]);

    const handleGenerateImage = async () => {
        if (!kolProfile) return;

        if (!checkApiKey()) return;

        setIsGeneratingBase(true);
        setError(null);

        try {
            const prompt = generateBaseKOLImagePrompt(kolProfile);

            const response = await fetch('/api/generate-image?type=kol-base', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    aspectRatio: '9:16',
                    apiKey: apiKey,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate image');
            }

            setBaseKOLImage(data.result);
        } catch (err) {
            console.error('Error generating image:', err);
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
        } finally {
            setIsGeneratingBase(false);
        }
    };

    const handleSaveKOL = async () => {
        if (!baseKOLImage || !kolProfile) return;

        setIsSaving(true);
        setError(null);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('Vui lòng đăng nhập để lưu KOL');
            }

            // Save to Supabase
            const { data: kol, error: insertError } = await supabase
                .from('kol_profiles' as string)
                .insert({
                    user_id: user.id,
                    name: kolName,
                    theme: selectedTheme?.id || customTheme || 'custom',
                    channel_positioning: channelPositioning,
                    profile_data: kolProfile,
                    base_image_url: baseKOLImage,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as unknown as any)
                .select()
                .single();

            if (insertError) throw insertError;

            setCurrentKOL(kol as unknown as KOLEntity);
            setSaveSuccess(true);

            setTimeout(() => {
                router.push('/kol-studio/step-4-clone');
            }, 1000);
        } catch (err) {
            console.error('Error saving KOL:', err);
            setError(err instanceof Error ? err.message : 'Không thể lưu KOL');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownload = () => {
        if (!baseKOLImage) return;

        const link = document.createElement('a');
        link.href = baseKOLImage;
        link.download = `kol-${kolName}-${Date.now()}.png`;
        link.click();
    };

    if (!kolProfile) return null;

    return (
        <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full overflow-x-hidden">
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full space-y-6 flex-1 flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.push('/kol-studio/step-2-profile')}
                        className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="hidden sm:inline">{t('back') || 'Quay lại'}</span>
                    </button>
                    <div className="text-center flex-1 px-2 overflow-hidden">
                        <h2 className="text-xl md:text-2xl font-bold truncate">
                            {t('step3.title') || '🎨 Tạo Hình KOL Gốc'}
                        </h2>
                        <p className="text-xs md:text-sm text-[var(--text-muted)] truncate">
                            {kolName}
                        </p>
                    </div>
                    <div className="w-10 sm:w-24 shrink-0" />
                </div>

                {/* Generate Button (if no image) */}
                {!baseKOLImage && !isGeneratingBase && (
                    <m.button
                        onClick={handleGenerateImage}
                        className="w-full py-6 rounded-2xl font-bold text-xl flex flex-col items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-purple-500/30 transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Sparkles size={40} />
                        {t('step3.generateBtn') || 'Tạo Hình KOL AI'}
                        <span className="text-sm font-normal opacity-80">
                            Dựa trên hồ sơ nhân vật đã tạo
                        </span>
                    </m.button>
                )}

                {/* Loading State */}
                {isGeneratingBase && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12">
                        <div className="relative">
                            <Loader2 size={60} className="animate-spin text-[var(--accent-primary)]" />
                            <Sparkles size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />
                        </div>
                        <p className="text-[var(--text-secondary)] text-center">
                            {t('step3.generating') || 'Đang tạo hình KOL AI...'}
                            <br />
                            <span className="text-sm text-[var(--text-muted)]">Quá trình này có thể mất 15-30 giây</span>
                        </p>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Generated Image Display */}
                {baseKOLImage && (
                    <m.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col gap-6"
                    >
                        {/* Image Preview */}
                        <div className="flex-1 flex items-center justify-center bg-[var(--bg-secondary)]/50 rounded-2xl border border-[var(--border)] p-4 min-h-[400px]">
                            <Image
                                src={baseKOLImage}
                                alt={`KOL ${kolName}`}
                                width={512}
                                height={912}
                                className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-2xl"
                                unoptimized
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 justify-center">
                            <m.button
                                onClick={handleGenerateImage}
                                disabled={isGeneratingBase}
                                className="px-5 py-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] transition-colors flex items-center gap-2"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <RotateCcw size={18} />
                                {t('step3.regenerate') || 'Tạo lại'}
                            </m.button>

                            <m.button
                                onClick={handleDownload}
                                className="px-5 py-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] transition-colors flex items-center gap-2"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Download size={18} />
                                {t('step3.download') || 'Tải xuống'}
                            </m.button>

                            <m.button
                                onClick={handleSaveKOL}
                                disabled={isSaving || saveSuccess}
                                className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${saveSuccess
                                    ? 'bg-[var(--success)] text-black'
                                    : 'bg-[var(--accent-primary)] text-black hover:brightness-110'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : saveSuccess ? (
                                    <>
                                        <Save size={18} />
                                        Đã lưu!
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        {t('step3.saveBtn') || 'Lưu & Tiếp tục'}
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </m.button>
                        </div>
                    </m.div>
                )}
            </m.div>
            <ApiKeyEnforcer />
        </div>
    );
}
