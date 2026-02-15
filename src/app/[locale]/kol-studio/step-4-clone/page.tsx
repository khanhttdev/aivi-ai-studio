'use client';

import { useKOLStudioStore } from '@/stores/kolStudioStore';
import { CLONE_CONTEXTS, CloneContext } from '@/lib/kol/types';
import { generateKOLClonePrompt, IDENTITY_LOCK_SUFFIX } from '@/lib/kol/prompts';
import { m, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, Loader2, Check, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { useSettingsStore } from '@/stores/settingsStore';
// import { useToastStore } from '@/stores/toastStore';
import { useApiKeyEnforcer } from '@/hooks/useApiKeyEnforcer';

export default function Step4ClonePage() {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('KOLStudio');

    const {
        kolProfile,
        // kolName,
        baseKOLImage,
        currentKOL,
        selectedContexts,
        setSelectedContexts,
        generatedClones,
        addGeneratedClone,
        setGeneratedClones,
        isGeneratingClone,
        setIsGeneratingClone,
        cloneProgress,
        setCloneProgress,
    } = useKOLStudioStore();

    const { apiKey } = useSettingsStore();
    // const { addToast } = useToastStore();
    const { checkApiKey, ApiKeyEnforcer } = useApiKeyEnforcer();


    const [, setError] = useState<string | null>(null);
    const [currentGenerating, setCurrentGenerating] = useState<string | null>(null);

    // Redirect if no base image
    useEffect(() => {
        if (!baseKOLImage || !currentKOL) {
            router.push('/kol-studio/step-3-generate');
        }
    }, [baseKOLImage, currentKOL, router]);

    const toggleContext = (context: CloneContext) => {
        if (selectedContexts.find(c => c.id === context.id)) {
            setSelectedContexts(selectedContexts.filter(c => c.id !== context.id));
        } else {
            setSelectedContexts([...selectedContexts, context]);
        }
    };

    const handleGenerateClones = async () => {
        if (selectedContexts.length === 0 || !kolProfile || !baseKOLImage || !currentKOL) return;

        if (!checkApiKey()) return;

        setIsGeneratingClone(true);
        setError(null);
        setGeneratedClones([]);
        setCloneProgress(0);

        const supabase = createClient();

        for (let i = 0; i < selectedContexts.length; i++) {
            const context = selectedContexts[i];
            setCurrentGenerating(context.id);

            try {
                const prompt = generateKOLClonePrompt(kolProfile, context);

                const response = await fetch('/api/generate-image?type=kol-clone', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: prompt + IDENTITY_LOCK_SUFFIX,
                        referenceImage: baseKOLImage,
                        aspectRatio: '9:16',
                        apiKey: apiKey,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    console.error(`Failed to generate clone for ${context.id}:`, data.error);
                    continue;
                }

                // Save to Supabase
                const { data: savedImage, error: saveError } = await supabase
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .from('kol_images' as any)
                    .insert({
                        kol_id: currentKOL.id,
                        image_url: data.result,
                        context: context.id,
                        outfit: context.suggestedOutfit,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } as any)
                    .select()
                    .single();

                if (saveError) {
                    console.error('Failed to save clone:', saveError);
                }

                addGeneratedClone({
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    id: (savedImage as any)?.id || `temp-${Date.now()}`,
                    kol_id: currentKOL.id,
                    image_url: data.result,
                    context: context.id,
                    outfit: context.suggestedOutfit,
                    created_at: new Date().toISOString(),
                });

            } catch (err) {
                console.error(`Error generating clone for ${context.id}:`, err);
            }

            setCloneProgress(Math.round(((i + 1) / selectedContexts.length) * 100));
        }

        setCurrentGenerating(null);
        setIsGeneratingClone(false);
    };

    const handleNext = () => {
        router.push('/kol-studio/step-5-content');
    };

    if (!baseKOLImage) return null;

    return (
        <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full overflow-x-hidden">
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full space-y-6 flex-1 flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.push('/kol-studio/step-3-generate')}
                        className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="hidden sm:inline">{t('back') || 'Quay lại'}</span>
                    </button>
                    <div className="text-center flex-1 px-2 overflow-hidden">
                        <h2 className="text-xl md:text-2xl font-bold truncate">
                            {t('step4.title') || '🔄 Nhân Bản Phong Cách'}
                        </h2>
                        <p className="text-xs md:text-sm text-[var(--text-muted)] truncate">
                            {t('step4.subtitle') || 'Tạo nhiều phiên bản KOL'}
                        </p>
                    </div>
                    <div className="w-10 sm:w-24 shrink-0" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                    {/* Left: Base Image + Context Selection */}
                    <div className="space-y-4">
                        {/* Base Image Preview */}
                        <div className="glass-card p-3">
                            <p className="text-xs text-[var(--text-muted)] mb-2">Ảnh gốc tham chiếu:</p>
                            <Image
                                src={baseKOLImage}
                                alt="Base KOL"
                                width={360}
                                height={640}
                                className="w-full aspect-[9/16] object-cover rounded-lg"
                                unoptimized
                            />
                        </div>

                        {/* Context Selection */}
                        <div className="space-y-3">
                            <p className="text-sm font-medium">Chọn bối cảnh ({selectedContexts.length}/8):</p>
                            <div className="grid grid-cols-2 gap-2">
                                {CLONE_CONTEXTS.map((context) => {
                                    const isSelected = selectedContexts.find(c => c.id === context.id);
                                    const isGenerating = currentGenerating === context.id;
                                    const isGenerated = generatedClones.find(c => c.context === context.id);

                                    return (
                                        <button
                                            key={context.id}
                                            onClick={() => toggleContext(context)}
                                            disabled={isGeneratingClone}
                                            className={`
                                                relative p-3 rounded-xl text-left text-sm transition-all
                                                border-2
                                                ${isSelected
                                                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                                                    : 'border-[var(--border)] bg-[var(--bg-tertiary)] hover:border-[var(--text-muted)]'
                                                }
                                                ${isGeneratingClone ? 'opacity-60' : ''}
                                            `}
                                        >
                                            <span className="font-medium">
                                                {locale === 'vi' ? context.nameVi : context.name}
                                            </span>

                                            {isSelected && !isGenerated && !isGenerating && (
                                                <Check size={14} className="absolute top-2 right-2 text-[var(--accent-primary)]" />
                                            )}
                                            {isGenerating && (
                                                <Loader2 size={14} className="absolute top-2 right-2 animate-spin text-[var(--accent-primary)]" />
                                            )}
                                            {isGenerated && (
                                                <ImageIcon size={14} className="absolute top-2 right-2 text-[var(--success)]" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Generate Button */}
                        <m.button
                            onClick={handleGenerateClones}
                            disabled={selectedContexts.length === 0 || isGeneratingClone}
                            className={`
                                w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2
                                transition-all
                                ${selectedContexts.length > 0 && !isGeneratingClone
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-purple-500/30'
                                    : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed'
                                }
                            `}
                            whileHover={selectedContexts.length > 0 ? { scale: 1.02 } : {}}
                            whileTap={selectedContexts.length > 0 ? { scale: 0.98 } : {}}
                        >
                            {isGeneratingClone ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Đang tạo... {cloneProgress}%
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} />
                                    Tạo {selectedContexts.length} phiên bản
                                </>
                            )}
                        </m.button>
                    </div>

                    {/* Right: Generated Clones Gallery */}
                    <div className="lg:col-span-2">
                        <p className="text-sm font-medium mb-3">
                            Ảnh đã tạo ({generatedClones.length}):
                        </p>

                        {generatedClones.length === 0 ? (
                            <div className="flex items-center justify-center h-64 bg-[var(--bg-secondary)]/50 rounded-2xl border border-dashed border-[var(--border)]">
                                <p className="text-[var(--text-muted)]">
                                    Chọn bối cảnh và nhấn Tạo để bắt đầu
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto p-1">
                                <AnimatePresence>
                                    {generatedClones.map((clone, idx) => {
                                        const context = CLONE_CONTEXTS.find(c => c.id === clone.context);
                                        return (
                                            <m.div
                                                key={clone.id}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="relative aspect-[9/16] rounded-xl overflow-hidden border border-[var(--border)] group"
                                            >
                                                <Image
                                                    src={clone.image_url}
                                                    alt={`Clone ${idx + 1}`}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                                    <p className="text-xs text-white font-medium">
                                                        {context ? (locale === 'vi' ? context.nameVi : context.name) : clone.context}
                                                    </p>
                                                </div>
                                            </m.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>

                {/* Next Button */}
                {generatedClones.length > 0 && (
                    <m.button
                        onClick={handleNext}
                        className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 btn-primary shadow-lg"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {t('step4.nextBtn') || 'Tạo Content Script'}
                        <ArrowRight size={20} />
                    </m.button>
                )}
            </m.div>
            <ApiKeyEnforcer />
        </div>
    );
}
