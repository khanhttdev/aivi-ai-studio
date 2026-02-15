'use client';

import { useAiviStoryStore } from "@/stores/useAiviStoryStore";
import { useRouter } from "next/navigation";
import { m } from 'framer-motion';
import { ArrowLeft, Plus } from 'lucide-react';
import { useEffect, useState } from "react";
import { useTranslations } from 'next-intl';

const CARD_VARIANTS = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i: number) => ({
        opacity: 1,
        scale: 1,
        transition: {
            delay: i * 0.1,
            duration: 0.4
        }
    })
};

const GRADIENTS = [
    "from-blue-600 to-indigo-900",
    "from-purple-600 to-pink-900",
    "from-emerald-600 to-teal-900",
    "from-orange-600 to-red-900",
    "from-slate-600 to-gray-900",
    "from-cyan-600 to-blue-900",
];

export default function Step2Crossroads() {
    const router = useRouter();
    const t = useTranslations('StoryStudio.Step2');
    const { plotSeeds, setSelectedPlot, saveStory } = useAiviStoryStore();
    const [isEditingCustom, setIsEditingCustom] = useState(false);
    const [customPlot, setCustomPlot] = useState("");

    useEffect(() => {
        // If no seeds, go back
        if (!plotSeeds || plotSeeds.length === 0) {
            router.push('/story-studio/step-1-spark');
        }
    }, [plotSeeds, router]);

    const handleSelect = (plot: string) => {
        setSelectedPlot(plot);
        saveStory().catch(err => console.error("Auto-save failed:", err));
        router.push('/story-studio/step-3-casting');
    };

    return (
        <div className="flex-1 flex flex-col p-8 max-w-7xl mx-auto w-full">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 btn-ghost rounded-full transition">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-bold text-[var(--text-primary)]">{t('title')}</h2>
                        <p className="text-[var(--text-secondary)]">{t('subtitle')}</p>
                    </div>
                </div>
                <span className="text-xs font-mono text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 px-2 py-1 rounded uppercase tracking-widest">{t('step_indicator')}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Generated Plot Cards */}
                {plotSeeds.map((seed, idx) => {
                    const gradient = GRADIENTS[idx % GRADIENTS.length];
                    return (
                        <m.button
                            key={idx}
                            custom={idx}
                            initial="hidden"
                            animate="visible"
                            variants={CARD_VARIANTS}
                            onClick={() => handleSelect(seed)}
                            className="group relative aspect-[3/4] rounded-2xl overflow-hidden text-left shadow-2xl hover:scale-[1.02] transition-transform duration-300 border border-[var(--border)] hover:border-[var(--accent-primary)]"
                        >
                            {/* Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60 group-hover:opacity-90 transition-opacity`} />
                            <div className="absolute inset-0 bg-[var(--bg-primary)]/40 group-hover:bg-transparent transition-colors" />

                            {/* Content */}
                            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                <div className="mb-auto opacity-70 font-mono text-xs border border-white/60 rounded px-2 py-1 w-fit text-white">
                                    {t('plot_seed')} #{idx + 1}
                                </div>

                                <h3 className="text-xl font-bold leading-tight mb-2 drop-shadow-md text-white">
                                    {seed}
                                </h3>

                                <div className="h-1 w-12 bg-[var(--accent-primary)] rounded-full group-hover:w-full transition-all duration-500" />
                            </div>
                        </m.button>
                    );
                })}

                {/* Custom Plot Card */}
                <m.div
                    custom={plotSeeds.length}
                    initial="hidden"
                    animate="visible"
                    variants={CARD_VARIANTS}
                    className="group relative aspect-[3/4] rounded-2xl overflow-hidden glass-card border border-[var(--border)] border-dashed hover:border-[var(--accent-primary)] transition-colors"
                >
                    {!isEditingCustom ? (
                        <button
                            onClick={() => setIsEditingCustom(true)}
                            className="absolute inset-0 flex flex-col items-center justify-center gap-4 group-hover:bg-[var(--bg-tertiary)]/50 transition-colors"
                        >
                            <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Plus className="w-8 h-8 text-[var(--accent-primary)]" />
                            </div>
                            <span className="font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                                {t('create_own')}
                            </span>
                        </button>
                    ) : (
                        <div className="absolute inset-0 p-6 flex flex-col">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">{t('custom_title')}</h3>
                            <textarea
                                autoFocus
                                value={customPlot}
                                onChange={(e) => setCustomPlot(e.target.value)}
                                placeholder={t('custom_placeholder')}
                                className="flex-1 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-xl p-4 text-sm text-[var(--text-primary)] resize-none focus:outline-none focus:border-[var(--accent-primary)] mb-4"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsEditingCustom(false)}
                                    className="flex-1 btn-ghost text-xs py-2"
                                >
                                    {t('btn_cancel')}
                                </button>
                                <button
                                    disabled={!customPlot.trim()}
                                    onClick={() => handleSelect(customPlot)}
                                    className="flex-1 btn-primary text-xs py-2 disabled:opacity-50"
                                >
                                    {t('btn_confirm')}
                                </button>
                            </div>
                        </div>
                    )}
                </m.div>
            </div>
        </div>
    );
}
