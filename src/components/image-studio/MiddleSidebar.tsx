'use client';

import { useImageStudioStore, AI_MODEL_PRESETS, ENVIRONMENT_PRESETS } from '@/stores/imageStudioStore';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function MiddleSidebar() {
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
    } = useImageStudioStore();

    const handleGenerateFinal = async () => {
        if (!processedSource || !selectedModel || (!selectedEnvironment && !customEnvironmentPrompt)) return;

        setIsGeneratingFinal(true);
        try {
            const response = await fetch('/api/generate-image?type=scene', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourceImage: processedSource,
                    modelPreset: selectedModel,
                    environment: selectedEnvironment || customEnvironmentPrompt,
                    apiKey: localStorage.getItem('gemini_api_key') || undefined,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to generate scene');

            setFinalResult(data.result);
        } catch (error) {
            console.error('Error generating final scene:', error);
            alert(error instanceof Error ? error.message : 'Lỗi khi tạo cảnh. Vui lòng thử lại.');
        } finally {
            setIsGeneratingFinal(false);
        }
    };

    return (
        <aside className="sidebar w-full h-full lg:border-x border-[var(--border)] overflow-y-auto custom-scrollbar pb-24">
            <div className="sidebar-section">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                    <span className="text-[var(--accent-secondary)]">✨</span>
                    Dựng Scene
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Chọn mẫu và bối cảnh</p>
            </div>

            {/* Source Preview */}
            <div className="sidebar-section">
                <label className="sidebar-title">Ảnh đã xử lý</label>
                <motion.div
                    className="aspect-square rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] overflow-hidden"
                    layout
                >
                    <AnimatePresence mode="wait">
                        {processedSource ? (
                            <motion.img
                                key="processed"
                                src={processedSource}
                                alt="Processed"
                                className="w-full h-full object-contain"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
                            />
                        ) : (
                            <motion.div
                                key="placeholder"
                                className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-sm p-4 text-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                Xử lý ảnh ở cột trái để bắt đầu
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Model Selector */}
            <div className="sidebar-section">
                <label className="sidebar-title">Người mẫu AI</label>
                <div className="grid grid-cols-3 gap-2">
                    {AI_MODEL_PRESETS.map((model, index) => (
                        <motion.button
                            key={model.id}
                            onClick={() => setSelectedModel(model)}
                            className={`thumbnail aspect-square rounded-lg overflow-hidden border-2 ${selectedModel?.id === model.id
                                ? 'selected border-[var(--accent-primary)]'
                                : 'border-[var(--border)]'
                                }`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Image
                                src={model.thumbnail}
                                alt={model.name}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                            {selectedModel?.id === model.id && (
                                <motion.div
                                    className="absolute inset-0 border-2 border-[var(--accent-primary)] rounded-lg pointer-events-none"
                                    layoutId="model-selection"
                                    transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
                                />
                            )}
                        </motion.button>
                    ))}
                </div>
                {selectedModel && (
                    <motion.p
                        className="text-xs text-[var(--text-secondary)] mt-2 text-center"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="text-[var(--accent-primary)] font-medium">{selectedModel.name}</span> • {selectedModel.description}
                    </motion.p>
                )}
            </div>

            {/* Environment Selector */}
            <div className="sidebar-section">
                <label className="sidebar-title">Bối cảnh</label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                    {ENVIRONMENT_PRESETS.slice(0, 4).map((env, index) => (
                        <motion.button
                            key={env.id}
                            onClick={() => setSelectedEnvironment(env)}
                            className={`px-3 py-2.5 rounded-lg text-xs border transition-all scale-bounce ${selectedEnvironment?.id === env.id
                                ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)] text-[var(--accent-primary)]'
                                : 'bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)]'
                                }`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.03 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {env.name}
                        </motion.button>
                    ))}
                </div>
                <input
                    type="text"
                    className="input-field text-sm"
                    placeholder="Hoặc nhập bối cảnh tùy chỉnh..."
                    value={customEnvironmentPrompt}
                    onFocus={() => setSelectedEnvironment(null)}
                    onChange={(e) => {
                        setCustomEnvironmentPrompt(e.target.value);
                        setSelectedEnvironment(null);
                    }}
                />
            </div>

            {/* Final Button */}
            <div className="sidebar-section">
                <motion.button
                    onClick={handleGenerateFinal}
                    disabled={!processedSource || isGeneratingFinal}
                    className="btn-primary w-full flex items-center justify-center gap-2 neon-glow bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] py-3 relative"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {isGeneratingFinal ? (
                        <div className="flex items-center gap-2 relative z-10">
                            <Loader2 size={20} className="animate-spin" />
                            <span>Đang tạo...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 relative z-10">
                            <Sparkles size={20} />
                            <span>Generate Final</span>
                            <ArrowRight size={16} />
                        </div>
                    )}
                </motion.button>
            </div>
        </aside>
    );
}
