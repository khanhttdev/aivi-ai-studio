'use client';

import { useAiviStoryStore } from "@/stores/useAiviStoryStore";
import { useRouter } from "next/navigation";
import { generateSubNiches } from '@/lib/gemini/story-service';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { m } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function Step1Spark() {
    const router = useRouter();
    const t = useTranslations('StoryStudio.Step1');
    const {
        mainTopic,
        setMainTopic,
        setPlotSeeds,
        setIsGeneratingSeeds,
        isGeneratingSeeds,
        saveStory,
        resetDependentData
    } = useAiviStoryStore();

    const handleIgnite = async () => {
        if (!mainTopic.trim()) return;

        setIsGeneratingSeeds(true);
        // Reset old data before starting new generation
        resetDependentData(1);
        try {
            // Call AI Service
            const seeds = await generateSubNiches(mainTopic);
            if (seeds && seeds.length > 0) {
                setPlotSeeds(seeds);
                // Auto-save after generating seeds
                saveStory().catch(err => console.error("Auto-save failed:", err));
                router.push('/story-studio/step-2-crossroads');
            } else {
                alert(t('error_generate'));
            }
        } catch (error) {
            console.error(error);
            alert(t('error_service'));
        } finally {
            setIsGeneratingSeeds(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto w-full">

            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6 w-full"
            >
                <div className="space-y-2">
                    <h1 className="text-5xl font-bold gradient-text pb-2">
                        {t('title')}
                    </h1>
                    <p className="text-xl text-[var(--text-secondary)] font-light max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="mt-12 w-full max-w-2xl mx-auto relative group">
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-purple)] rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />

                    <div className="relative flex flex-col md:flex-row items-center glass-card p-2 pl-4 md:pl-6 shadow-2xl gap-3 md:gap-0">
                        <div className="flex items-center w-full md:w-auto md:flex-1">
                            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-[var(--accent-primary)] mr-3 md:mr-4 animate-pulse shrink-0" />
                            <input
                                type="text"
                                value={mainTopic}
                                onChange={(e) => setMainTopic(e.target.value)}
                                placeholder={t('placeholder')}
                                className="flex-1 bg-transparent border-none outline-none text-base md:text-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] h-12 w-full"
                                onKeyDown={(e) => e.key === 'Enter' && handleIgnite()}
                            />
                        </div>

                        <m.button
                            onClick={handleIgnite}
                            disabled={isGeneratingSeeds || !mainTopic.trim()}
                            className="w-full md:w-auto md:ml-2 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            whileHover={!isGeneratingSeeds && mainTopic.trim() ? { scale: 1.05 } : {}}
                            whileTap={!isGeneratingSeeds && mainTopic.trim() ? { scale: 0.95 } : {}}
                        >
                            {isGeneratingSeeds ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {t('btn_generating')}
                                </>
                            ) : (
                                <>
                                    {t('btn_ignite')}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </m.button>
                    </div>
                </div>

                {/* Suggestion Chips */}
                <div className="flex flex-wrap justify-center gap-3 mt-8 opacity-70">
                    <span className="text-sm text-[var(--text-muted)] mr-2">{t('try_label')}</span>
                    {['Opera vũ trụ', 'Phim noir', 'High Fantasy', 'Phim độc lập'].map((tag: string) => (
                        <m.button
                            key={tag}
                            onClick={() => setMainTopic(tag)}
                            className="px-4 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-sm hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-all"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {tag}
                        </m.button>
                    ))}
                </div>
            </m.div>

        </div>
    );
}
