'use client';

import { useImageStudioStore, AI_MODEL_PRESETS, ENVIRONMENT_PRESETS } from '@/stores/imageStudioStore';
import { VIDEO_TEMPLATES } from '@/lib/templates/videoTemplates';
import GenericImageUploader from '@/components/image-studio/GenericImageUploader';
import { Sparkles, Loader2, ArrowRight, ArrowLeft, Image as ImageIcon, Film, Play, Users, Wand2 } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import dynamic from 'next/dynamic';
const KOLLibrary = dynamic(() => import('@/components/kol-library/KOLLibrary'), {
    ssr: false,
    loading: () => <div className="h-64 flex items-center justify-center bg-gray-100/10 rounded-xl animate-pulse" />
});
import Image from 'next/image';
import { KOLEntity } from '@/lib/kol/types';
import { useSettingsStore } from '@/stores/settingsStore';
// import { useToastStore } from '@/stores/toastStore';
import { useApiKeyEnforcer } from '@/hooks/useApiKeyEnforcer';


export default function Step2GenerationPage() {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('ImageStudio');
    const {
        processedSource,
        selectedModel,
        setSelectedModel,
        selectedEnvironment,
        setSelectedEnvironment,
        customEnvironmentPrompt,
        setCustomEnvironmentPrompt,
        isGeneratingFinal,
        setIsGeneratingFinal,
        setFinalResult,
        // Video Template state
        generationMode,
        setGenerationMode,
        selectedTemplate,
        setSelectedTemplate,
        isGeneratingBatch,
        setIsGeneratingBatch,
        setBatchProgress,
        setGeneratedScenes,
    } = useImageStudioStore();

    const { apiKey } = useSettingsStore();
    // const { addToast } = useToastStore();
    const { checkApiKey, ApiKeyEnforcer } = useApiKeyEnforcer();

    // const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
    const [modelSource, setModelSource] = useState<'upload' | 'kol'>('upload');
    const [selectedKOL, setSelectedKOL] = useState<KOLEntity | null>(null);
    const [uploadedModelImage, setUploadedModelImage] = useState<string | null>(null);

    // Protect route: if no processed source, go back to step 1
    useEffect(() => {
        if (!processedSource) {
            router.push('/image-studio/step-1-input');
        }
    }, [processedSource, router]);

    // Handle Single Image generation
    const handleGenerateSingle = async () => {
        // Validate: Need processed source + (Model OR Uploaded Image) + (Environment OR Custom Prompt)
        if (!processedSource) return;

        let finalModelPreset = undefined;
        let finalModelImage = undefined;

        // Check based on active tab
        if (modelSource === 'upload') {
            if (!uploadedModelImage) {
                alert(t('page.missing_model_upload') || "Please upload a model image");
                return;
            }
            finalModelImage = uploadedModelImage;
        } else {
            // KOL mode
            if (!selectedModel) {
                alert(t('page.missing_model_kol') || "Please select a KOL model");
                return;
            }
            finalModelPreset = selectedModel;
        }

        if (!selectedEnvironment && !customEnvironmentPrompt) {
            alert(t('page.missing_env') || "Please select an environment");
            return;
        }

        if (!checkApiKey()) return;

        setIsGeneratingFinal(true);
        try {
            const response = await fetch('/api/generate-image?type=scene', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourceImage: processedSource,
                    modelPreset: finalModelPreset,
                    modelImage: finalModelImage,
                    environment: selectedEnvironment || customEnvironmentPrompt,
                    apiKey: apiKey,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to generate scene');

            setFinalResult(data.result);
            router.push('/image-studio/step-3-result');
        } catch (error) {
            console.error('Error generating final scene:', error);
            alert(error instanceof Error ? error.message : t('page.error_scene'));
        } finally {
            setIsGeneratingFinal(false);
        }
    };

    // Handle Video Template generation (batch) - Using optimized batch API
    const handleGenerateVideo = async () => {
        if (!processedSource || !selectedTemplate) return;

        if (!checkApiKey()) return;

        setIsGeneratingBatch(true);
        setBatchProgress(0);

        try {
            // Build model description from selected model or default
            const model = selectedModel || AI_MODEL_PRESETS[0];
            const modelDescription = `${model.style} ${model.gender}, ${model.ageRange}, ${model.description}`;

            // Prepare scenes for batch API
            const scenesPayload = selectedTemplate.scenes.map((scene) => ({
                id: scene.id,
                environmentPrompt: scene.environmentPrompt,
                overlayText: locale === 'vi' ? scene.overlayTextVi : scene.overlayText,
            }));

            setBatchProgress(10);

            // Call batch-scenes API (uses 9:16 vertical format)
            const response = await fetch('/api/generate-image?type=batch-scenes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourceImage: processedSource,
                    modelDescription,
                    scenes: scenesPayload,
                    apiKey: apiKey,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to generate video scenes');

            // Transform response to match store format
            const generatedResults = data.scenes
                .filter((s: { status: string }) => s.status === 'success')
                .map((scene: { id: string; imageUrl: string }, _idx: number) => {
                    const templateScene = selectedTemplate.scenes.find(ts => ts.id === scene.id);
                    return {
                        id: scene.id,
                        order: templateScene?.order || _idx,
                        imageUrl: scene.imageUrl,
                        overlayText: locale === 'vi' ? templateScene?.overlayTextVi : templateScene?.overlayText,
                    };
                });

            if (generatedResults.length === 0) {
                throw new Error('No scenes were generated successfully');
            }

            setBatchProgress(100);
            setGeneratedScenes(generatedResults);
            router.push('/image-studio/step-3-result');
        } catch (error) {
            console.error('Error generating video scenes:', error);
            alert(error instanceof Error ? error.message : t('page.error_scene'));
        } finally {
            setIsGeneratingBatch(false);
            setBatchProgress(0);
        }
    };

    if (!processedSource) return null;

    return (
        <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 lg:p-6 overflow-hidden flex flex-col items-center">
            <div className="w-full flex flex-col lg:flex-row gap-6 h-full min-h-0">
                {/* Left Panel - Processed Source */}
                <div className="w-full lg:w-5/12 xl:w-4/12 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
                    <div className="bg-[var(--bg-secondary)]/50 rounded-2xl p-1 border border-[var(--border)]">
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]/50">
                            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)]">
                                <ImageIcon size={18} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[var(--text-primary)]">{t('page.processed_preview')}</h3>
                                <p className="text-xs text-[var(--text-muted)]">{t('scene_section.processed_image')}</p>
                            </div>
                        </div>
                        <div className="p-4 flex items-center justify-center bg-[url('/grid-pattern.svg')]">
                            <div className="relative w-full aspect-[3/4] max-h-[50vh] lg:max-h-none rounded-xl overflow-hidden shadow-lg border border-[var(--border)]/50">
                                <Image
                                    src={processedSource}
                                    alt="Processed Source"
                                    fill
                                    className="object-contain bg-[var(--bg-tertiary)]"
                                    unoptimized
                                />
                            </div>
                        </div>
                    </div>

                    {/* Back Button Mobile */}
                    <button
                        onClick={() => router.push('/image-studio/step-1-input')}
                        className="lg:hidden flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-all font-medium border border-[var(--border)]"
                    >
                        <ArrowLeft size={18} />
                        {t('page.back_input')}
                    </button>

                    {/* Back Button Desktop */}
                    <button
                        onClick={() => router.push('/image-studio/step-1-input')}
                        className="hidden lg:flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-all font-medium border border-[var(--border)]"
                    >
                        <ArrowLeft size={18} />
                        {t('page.back_input')}
                    </button>
                </div>

                {/* Right Panel - Configuration */}
                <div className="w-full lg:w-7/12 xl:w-8/12 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1 pb-20 lg:pb-0">
                    <div className="bg-[var(--bg-secondary)]/30 rounded-2xl border border-[var(--border)] backdrop-blur-sm p-4 lg:p-6">

                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-purple-600 flex items-center justify-center text-white shadow-lg shadow-[var(--accent-primary)]/20">
                                <Wand2 size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[var(--text-secondary)]">
                                    {t('page.scene_title')}
                                </h2>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    {t('page.scene_subtitle')}
                                </p>
                            </div>
                        </div>

                        {/* Mode Toggle */}
                        <div className="flex justify-center mb-6">
                            <div className="inline-flex bg-[var(--bg-tertiary)] rounded-xl p-1 border border-[var(--border)]">
                                <button
                                    onClick={() => setGenerationMode('single')}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${generationMode === 'single'
                                        ? 'bg-[var(--accent-primary)] text-black'
                                        : 'text-[var(--text-secondary)] hover:text-white'
                                        }`}
                                >
                                    <ImageIcon size={18} />
                                    {t('page.mode_single') || 'Single Image'}
                                </button>
                                <button
                                    onClick={() => setGenerationMode('video')}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${generationMode === 'video'
                                        ? 'bg-[var(--accent-primary)] text-black'
                                        : 'text-[var(--text-secondary)] hover:text-white'
                                        }`}
                                >
                                    <Film size={18} />
                                    {t('page.mode_video') || 'Video Story'}
                                </button>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {generationMode === 'single' ? (
                                <m.div
                                    key="single-mode"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    {/* Model Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                                            <Users size={16} />
                                            {t('page.ai_model_label')}
                                        </label>

                                        <div className="flex gap-2 mb-4 p-1 bg-[var(--bg-tertiary)]/50 rounded-lg w-fit">
                                            <button
                                                onClick={() => setModelSource('upload')}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${modelSource === 'upload'
                                                    ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm'
                                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                                    }`}
                                            >
                                                <Wand2 size={14} />
                                                {t('page.toggle_upload')}
                                            </button>
                                            <button
                                                onClick={() => setModelSource('kol')}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${modelSource === 'kol'
                                                    ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm'
                                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                                    }`}
                                            >
                                                <Users size={14} />
                                                {t('page.toggle_kol')}
                                            </button>
                                        </div>

                                        {modelSource === 'upload' ? (
                                            <div className="bg-[var(--bg-secondary)]/50 rounded-xl p-4 border border-[var(--border)]/50">
                                                <GenericImageUploader
                                                    value={uploadedModelImage}
                                                    onChange={setUploadedModelImage}
                                                    label={t('page.upload_model_label')}
                                                    browseLabel={t('upload_zone.browse_file')}
                                                    className="w-full max-w-md mx-auto"
                                                />
                                                {uploadedModelImage && (
                                                    <p className="text-xs text-[var(--text-muted)] mt-3 text-center bg-[var(--accent-primary)]/5 py-2 px-3 rounded-lg border border-[var(--accent-primary)]/10">
                                                        <Sparkles size={12} className="inline mr-1 text-[var(--accent-primary)]" />
                                                        {t('page.upload_model_hint')}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="bg-[var(--bg-secondary)]/50 rounded-xl p-4 max-h-[400px] overflow-y-auto custom-scrollbar border border-[var(--border)]/50">
                                                <KOLLibrary
                                                    mode="select"
                                                    selectedKOLId={selectedKOL?.id}
                                                    onSelectKOL={(kol) => {
                                                        setSelectedKOL(kol);
                                                        setSelectedModel({
                                                            id: kol.id,
                                                            name: kol.name,
                                                            thumbnail: kol.base_image_url || '/images/placeholder.png',
                                                            description: kol.channel_positioning || '',
                                                            style: 'asian' as const,
                                                            gender: kol.profile_data?.gender || 'female',
                                                            ageRange: kol.profile_data?.ageRange || '20-30',
                                                        });
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Environments */}
                                    <div className="space-y-4">
                                        <label className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                                            {t('page.environment_label')}
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {ENVIRONMENT_PRESETS.map((env) => (
                                                <m.button
                                                    key={env.id}
                                                    onClick={() => setSelectedEnvironment(env)}
                                                    className={`relative h-20 rounded-xl overflow-hidden border transition-all ${selectedEnvironment?.id === env.id
                                                        ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                                                        : 'border-[var(--border)] bg-[var(--bg-tertiary)] hover:border-[var(--text-muted)]'
                                                        }`}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <div className="absolute inset-0 flex items-center justify-center p-2 text-center">
                                                        <span className={`text-xs font-bold ${selectedEnvironment?.id === env.id ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`}>
                                                            {t(`environment_presets.${env.id}`)}
                                                        </span>
                                                    </div>
                                                </m.button>
                                            ))}
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                                                placeholder={t('page.custom_env_placeholder')}
                                                value={customEnvironmentPrompt}
                                                onFocus={() => setSelectedEnvironment(null)}
                                                onChange={(e) => {
                                                    setCustomEnvironmentPrompt(e.target.value);
                                                    setSelectedEnvironment(null);
                                                }}
                                            />
                                            <Wand2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                        </div>
                                    </div>

                                    {/* Single Action Button */}
                                    <m.button
                                        onClick={handleGenerateSingle}
                                        disabled={
                                            (modelSource === 'upload' ? !uploadedModelImage : !selectedModel) ||
                                            (!selectedEnvironment && !customEnvironmentPrompt) ||
                                            isGeneratingFinal
                                        }
                                        className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_50px_rgba(34,211,238,0.5)] transition-all"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {isGeneratingFinal ? (
                                            <>
                                                <Loader2 size={24} className="animate-spin" />
                                                {t('page.generating_magic_btn')}
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={24} />
                                                {t('page.generate_final_btn')}
                                                <ArrowRight size={24} />
                                            </>
                                        )}
                                    </m.button>
                                </m.div>
                            ) : (
                                <m.div
                                    key="video-mode"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    {/* Video Templates */}
                                    <div className="space-y-4">
                                        <label className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                                            {t('page.template_label') || 'Choose Story Template'}
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {VIDEO_TEMPLATES.map((template) => (
                                                <m.button
                                                    key={template.id}
                                                    onClick={() => setSelectedTemplate(template)}
                                                    className={`relative rounded-2xl overflow-hidden border-2 transition-all text-left ${selectedTemplate?.id === template.id
                                                        ? 'border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/30'
                                                        : 'border-[var(--border)] hover:border-[var(--text-muted)]'
                                                        }`}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <div className="p-4 bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)] h-full">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex-1 min-w-0 pr-2">
                                                                <h3 className="font-bold text-white text-lg truncate">
                                                                    {locale === 'vi' ? template.nameVi : template.name}
                                                                </h3>
                                                                <p className="text-xs text-[var(--text-muted)] mt-1">
                                                                    {template.scenes.length} {t('page.scenes') || 'scenes'}
                                                                </p>
                                                            </div>
                                                            <span className={`px-2 py-1 text-xs rounded-full shrink-0 ${template.category === 'lifestyle' ? 'bg-pink-500/20 text-pink-400' :
                                                                template.category === 'travel' ? 'bg-blue-500/20 text-blue-400' :
                                                                    template.category === 'dating' ? 'bg-red-500/20 text-red-400' :
                                                                        'bg-purple-500/20 text-purple-400'
                                                                }`}>
                                                                {template.category}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                                                            {locale === 'vi' ? template.descriptionVi : template.description}
                                                        </p>

                                                        <div className="mt-3 flex gap-1">
                                                            {template.scenes.map((scene) => (
                                                                <div
                                                                    key={scene.id}
                                                                    className={`h-1 flex-1 rounded-full ${selectedTemplate?.id === template.id
                                                                        ? 'bg-[var(--accent-primary)]'
                                                                        : 'bg-[var(--border)]'
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </m.button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Preview Scenes */}
                                    <AnimatePresence>
                                        {selectedTemplate && (
                                            <m.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="glass-card p-4 space-y-3 overflow-hidden rounded-xl border border-[var(--border)]"
                                            >
                                                <h4 className="font-bold text-[var(--accent-primary)]">
                                                    {t('page.preview_scenes') || 'Scene Preview'}
                                                </h4>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {selectedTemplate.scenes.map((scene) => (
                                                        <div key={scene.id} className="space-y-1">
                                                            <div className="aspect-video rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-muted)]">
                                                                <Play size={16} />
                                                            </div>
                                                            <p className="text-[10px] text-[var(--text-muted)] truncate">
                                                                {locale === 'vi' ? scene.overlayTextVi : scene.overlayText}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </m.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Video Action Button */}
                                    <m.button
                                        onClick={handleGenerateVideo}
                                        disabled={!selectedTemplate || isGeneratingBatch}
                                        className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-all bg-gradient-to-r from-purple-500 to-pink-500"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {isGeneratingBatch ? (
                                            <>
                                                <Loader2 size={24} className="animate-spin" />
                                                {t('page.generating_video_btn') || 'Generating Video...'}
                                            </>
                                        ) : (
                                            <>
                                                <Film size={24} />
                                                {t('page.generate_video_btn') || 'Generate Video Story'}
                                                <ArrowRight size={24} />
                                            </>
                                        )}
                                    </m.button>
                                </m.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
            <ApiKeyEnforcer />
        </div>
    );
}
