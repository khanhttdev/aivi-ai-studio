'use client';

import { useImageStudioStore } from '@/stores/imageStudioStore';
import ImageUploader from '@/components/image-studio/ImageUploader';
import ProcessingConfig from '@/components/image-studio/ProcessingConfig';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useSettingsStore } from '@/stores/settingsStore';
import { useApiKeyEnforcer } from '@/hooks/useApiKeyEnforcer';
import { useToastStore } from '@/stores/toastStore';

export default function Step1InputPage() {
    const router = useRouter();
    const t = useTranslations('ImageStudio.page');
    const {
        uploadedImage,
        processingMode,
        clothingType,
        colorConfig,
        customPrompt,
        isProcessingSource,
        setProcessedSource,
        setIsProcessingSource,
    } = useImageStudioStore();

    const { apiKey } = useSettingsStore();
    const { addToast } = useToastStore();
    const { ApiKeyEnforcer } = useApiKeyEnforcer();

    const handleGenerate = async () => {
        if (!uploadedImage) return;

        if (!apiKey) {
            addToast(t('missing_api_key') || "Vui lòng nhập API Key trong Profile", 'error');
            router.push('/profile');
            return;
        }

        setIsProcessingSource(true);
        try {
            const response = await fetch('/api/generate-image?type=process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: uploadedImage,
                    mode: processingMode,
                    clothingType,
                    colorConfig: colorConfig || undefined,
                    customPrompt: customPrompt || undefined,
                    apiKey: apiKey,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to process image');
            }

            setProcessedSource(data.result);
            // Navigate to next step on success
            router.push('/image-studio/step-2-generation');
        } catch (error) {
            console.error('Error processing image:', error);
            alert(error instanceof Error ? error.message : t('error_process'));
        } finally {
            setIsProcessingSource(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-6xl mx-auto w-full">
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
            >
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold gradient-text mb-4">{t('input_title')}</h1>
                    <p className="text-[var(--text-secondary)] text-lg">{t('input_subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Left: Upload */}
                    <div className="space-y-6">
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold mb-4 text-[var(--accent-primary)] flex items-center gap-2">
                                <span>📸</span> {t('upload_source_title')}
                            </h2>
                            <ImageUploader />
                        </div>
                    </div>

                    {/* Right: Config */}
                    <div className="space-y-8">
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold mb-4 text-[var(--accent-secondary)] flex items-center gap-2">
                                <span>⚙️</span> {t('config_title')}
                            </h2>
                            <ProcessingConfig />
                        </div>

                        <m.button
                            onClick={handleGenerate}
                            disabled={!uploadedImage || isProcessingSource}
                            className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isProcessingSource ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" />
                                    {t('processing_btn')}
                                </>
                            ) : (
                                <>
                                    <Sparkles size={24} />
                                    {t('process_btn')}
                                    <ArrowRight size={24} />
                                </>
                            )}
                        </m.button>
                    </div>
                </div>
            </m.div>
            <ApiKeyEnforcer />
        </div>
    );
}
