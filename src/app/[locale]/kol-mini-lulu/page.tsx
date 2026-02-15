'use client';

import { useKolMiniLuluStore } from "@/stores/useKolMiniLuluStore";
import { Plus, Clock, Trash2, Sparkles, Layout, ChevronRight, Search, Filter } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { notificationService } from "@/lib/services/notificationService";
import { supabase } from "@/lib/supabase/client";

export default function KolMiniLuluDashboard() {
    const router = useRouter();
    const locale = useLocale();
    const {
        projects,
        isLoadingProjects,
        fetchUserProjects,
        reset,
        loadProject,
        deleteProject
    } = useKolMiniLuluStore();
    const t = useTranslations('KolMiniLulu.Dashboard');
    const tCommon = useTranslations('Common');

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchUserProjects();
    }, [fetchUserProjects]);

    const handleNewProject = () => {
        reset();
        router.push('/kol-mini-lulu/step-1-concept');
    };

    const handleResume = async (projectId: string) => {
        const success = await loadProject(projectId);
        if (success) {
            const currentStep = useKolMiniLuluStore.getState().currentStep;
            router.push(`/kol-mini-lulu/step-${currentStep}-concept`); // Fallback logic if step path differs
            // Better: switch based on step
            const stepPaths = [
                '/kol-mini-lulu/step-1-concept',
                '/kol-mini-lulu/step-2-casting',
                '/kol-mini-lulu/step-3-script',
                '/kol-mini-lulu/step-4-studio',
                '/kol-mini-lulu/step-5-export'
            ];
            router.push(stepPaths[currentStep - 1] || stepPaths[0]);
        } else {
            toast.error(t('load_fail'));
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            await deleteProject(deleteId);
            toast.success(t('delete_success'));
        } catch (error) {
            toast.error(t('delete_fail'));
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    const filteredProjects = projects.filter(p =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const dateLocale = locale === 'vi' ? vi : enUS;

    return (
        <div className="absolute inset-0 overflow-y-auto px-4 md:px-8 pt-24 pb-20">
            <ConfirmDialog
                isOpen={!!deleteId}
                title={t('delete_title')}
                message={t('delete_confirm')}
                confirmLabel={t('btn_delete')}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
                isDestructive={true}
                isLoading={isDeleting}
            />

            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <m.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest"
                        >
                            <Sparkles size={12} />
                            {t('category')}
                        </m.div>
                        <m.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-amber-400 via-orange-500 to-pink-600"
                        >
                            {t('title')}
                        </m.h1>
                        <m.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-[var(--text-secondary)] max-w-lg"
                        >
                            {t('subtitle')}
                        </m.p>
                    </div>

                    <m.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleNewProject}
                        className="btn-primary bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-amber-500/20 flex items-center gap-3 self-start md:self-auto"
                    >
                        <Plus size={20} />
                        {t('btn_new')}
                    </m.button>
                </header>

                {/* Stats & Search */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-[var(--bg-card)]/30 backdrop-blur-xl p-2 rounded-2xl border border-[var(--border)]">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
                        <input
                            type="text"
                            placeholder={t('search_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent pl-12 pr-4 py-3 focus:outline-none text-sm"
                        />
                    </div>
                    <div className="h-6 w-[1px] bg-[var(--border)] hidden sm:block" />
                    <div className="px-4 py-2 text-sm text-[var(--text-secondary)] font-medium whitespace-nowrap">
                        {projects.length} {t('projects_count')}
                    </div>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {isLoadingProjects ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="aspect-[4/5] rounded-3xl bg-[var(--bg-card)] animate-pulse border border-[var(--border)]" />
                        ))
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filteredProjects.map((project, idx) => (
                                <m.div
                                    key={project.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group relative"
                                >
                                    <div
                                        onClick={() => handleResume(project.id)}
                                        className="aspect-[4/5] rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden flex flex-col transition-all duration-500 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer"
                                    >
                                        {/* Image Preview */}
                                        <div className="relative flex-1 bg-[var(--bg-secondary)] overflow-hidden">
                                            {project.concept_image_url ? (
                                                <img
                                                    src={project.concept_image_url}
                                                    alt={project.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500/5 to-orange-500/5">
                                                    <Layout className="w-12 h-12 text-amber-500/20" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                            <div className="absolute bottom-4 left-4 right-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase mb-2">
                                                    Step {project.current_step} / 5
                                                </div>
                                            </div>

                                            {/* Step Progress Mini Bar */}
                                            <div className="absolute bottom-0 left-0 h-1.5 bg-amber-500 transition-all duration-300" style={{ width: `${(project.current_step / 5) * 100}%` }} />
                                        </div>

                                        {/* Info */}
                                        <div className="p-5 space-y-3 bg-[var(--bg-card)]">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-amber-500 transition-colors">
                                                    {project.title || t('untitled')}
                                                </h3>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteId(project.id);
                                                    }}
                                                    className="p-2 -mr-2 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={12} className="text-amber-500" />
                                                    {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true, locale: dateLocale })}
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-amber-500 font-bold">
                                                    {t('btn_continue')}
                                                    <ChevronRight size={12} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </m.div>
                            ))}
                        </AnimatePresence>
                    )}

                    {!isLoadingProjects && filteredProjects.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-20 h-20 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center border border-[var(--border)]">
                                <Layout className="w-8 h-8 text-[var(--text-muted)]" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold">{t('empty_title')}</h3>
                                <p className="text-[var(--text-secondary)] max-w-xs">{t('empty_subtitle')}</p>
                            </div>
                            <button
                                onClick={handleNewProject}
                                className="text-amber-500 font-bold hover:underline"
                            >
                                {t('btn_create_first')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

