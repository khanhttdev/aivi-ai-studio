'use client';

import { useAiviStoryStore } from "@/stores/useAiviStoryStore";
import { useToastStore } from "@/stores/toastStore";
import { Plus, Calendar, Trash2, Film, Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useTranslations } from 'next-intl';
import { TourGuide } from "@/components/features/onboarding/TourGuide";
export default function StoryStudioDashboard() {
    const router = useRouter();
    const { stories, isLoadingStories, fetchUserStories, reset, loadStory, deleteStory } = useAiviStoryStore();
    const { addToast } = useToastStore();
    const t = useTranslations('StoryStudio.Dashboard');

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchUserStories();
    }, [fetchUserStories]);

    const handleNewStory = () => {
        reset(); // Reset store for new story
    };

    const handleResume = async (storyId: string) => {
        try {
            const success = await loadStory(storyId);
            if (success) {
                const currentStep = useAiviStoryStore.getState().currentStep;
                const stepPath = currentStep === 5 ? '/story-studio/step-5-export' :
                    '/story-studio/step-4-studio';

                router.push(stepPath);
            } else {
                addToast(t('load_fail'), "error");
            }
        } catch {
            addToast(t('load_fail'), "error");
        }
    };

    const onDeleteClick = (storyId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteId(storyId);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;

        setIsDeleting(true);
        try {
            await deleteStory(deleteId);
            addToast(t('delete_success'), "success");
        } catch (error) {
            addToast(t('delete_fail'), "error");
            console.error(error);
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    return (
        <div className="absolute inset-0 overflow-y-auto px-4 md:px-6 pt-24 md:pt-32 pb-8 text-white">
            <TourGuide startOnMount={true} />
            <ConfirmDialog
                isOpen={!!deleteId}
                title={t('delete_title')}
                message={t('delete_msg')}
                confirmLabel={t('delete_btn')}
                isDestructive={true}
                isLoading={isDeleting}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteId(null)}
            />

            <div className="max-w-7xl mx-auto space-y-12 pb-20">

                {/* Hero Section */}
                <section aria-label="Story Studio Hero" className="relative rounded-3xl overflow-hidden p-6 md:p-10 min-h-[300px] flex items-center">
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-purple)]/20 to-[var(--accent-cyan)]/20 backdrop-blur-3xl" />
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />

                    <div className="relative z-10 max-w-2xl">
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-xs font-semibold uppercase tracking-wider mb-4"
                        >
                            <Film size={14} />
                            {t('studio_badge')}
                        </m.div>
                        <m.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl md:text-5xl font-black tracking-tight text-white mb-6"
                        >
                            {t('title_prefix')} <br />
                            <span className="gradient-text">{t('title_suffix')}</span>
                        </m.h1>
                        <m.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-[var(--text-secondary)] mb-8 max-w-lg"
                        >
                            {t('subtitle')}
                        </m.p>
                    </div>
                </section>

                {/* Dashboard Grid */}
                <section aria-labelledby="stories-heading" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 id="stories-heading" className="text-2xl font-bold text-[var(--text-primary)]">{t('your_stories')}</h2>
                        <div className="text-sm text-[var(--text-secondary)]">
                            {stories.length} {t('projects_count')}
                        </div>
                    </div>

                    <div id="projects-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {/* New Story Card */}
                        <m.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Link
                                id="new-story-btn"
                                href="/story-studio/step-1-spark"
                                onClick={handleNewStory}
                                className="group relative aspect-[4/3] rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)] hover:border-[var(--accent-primary)]/50 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer h-full"
                            >
                                <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] group-hover:bg-[var(--accent-primary)]/20 flex items-center justify-center transition-colors mb-4">
                                    <Plus className="w-8 h-8 text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors" />
                                </div>
                                <span className="font-semibold text-[var(--text-primary)]">{t('new_story')}</span>
                                <span className="text-sm text-[var(--text-secondary)] mt-1">{t('start_scratch')}</span>
                            </Link>
                        </m.div>

                        {/* Story Cards */}
                        {isLoadingStories ? (
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="aspect-[4/3] rounded-2xl bg-[var(--glass-bg)] animate-pulse" />
                            ))
                        ) : (
                            <AnimatePresence>
                                {stories.map((story) => (
                                    <m.article
                                        key={story.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        onClick={() => handleResume(story.id)}
                                        className="group relative aspect-[4/3] glass-card rounded-2xl p-5 hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                                                {story.genre || t('uncategorized')}
                                            </div>
                                            <button
                                                onClick={(e) => onDeleteClick(story.id, e)}
                                                className="p-2 bg-[var(--bg-tertiary)] hover:bg-red-500/20 hover:text-red-500 rounded-full text-[var(--text-secondary)] transition-colors z-20 group/btn"
                                                title={t('delete_title')}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-lg text-[var(--text-primary)] line-clamp-2 mb-1 group-hover:text-[var(--accent-primary)] transition-colors">
                                                {story.title || t('untitled')}
                                            </h3>
                                            <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-4">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    <span>{new Date(story.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    <span>{story.status || t('draft')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--accent-primary)]/30 rounded-2xl transition-all pointer-events-none" />
                                    </m.article>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
