'use client';

import { useKolMiniLuluStore } from "@/stores/useKolMiniLuluStore";
import { Plus, Clock, Trash2, Sparkles, Layout, ChevronRight, Search, ArrowRight, Star, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";
import CharacterAvatar from "@/components/mini-lulu/CharacterAvatar";
import CategorySelector from "@/components/mini-lulu/CategorySelector";
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
        deleteProject,
        setSelectedCategory: setStoreCategory
    } = useKolMiniLuluStore();
    const t = useTranslations('KolMiniLulu.Dashboard');
    const tHero = useTranslations('KolMiniLulu.Hero');
    const tCat = useTranslations('KolMiniLulu.Categories');

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    // Track which project IDs are having thumbnails auto-generated
    const [generatingThumbnails, setGeneratingThumbnails] = useState<Set<string>>(new Set());
    const [localThumbnails, setLocalThumbnails] = useState<Record<string, string>>({});
    const autoGenRef = useRef<Set<string>>(new Set()); // prevent double-fire

    useEffect(() => {
        fetchUserProjects();
    }, [fetchUserProjects]);

    // Auto-generate thumbnails for projects that don't have one
    useEffect(() => {
        if (isLoadingProjects || projects.length === 0) return;

        const projectsWithoutThumbnail = projects.filter(
            p => !p.concept_image_url && !autoGenRef.current.has(p.id)
        );

        if (projectsWithoutThumbnail.length === 0) return;

        projectsWithoutThumbnail.forEach(async (project) => {
            autoGenRef.current.add(project.id);
            setGeneratingThumbnails(prev => new Set([...prev, project.id]));

            try {
                // Get the story idea from saved state
                const idea = (project as any).state?.customPrompt ||
                    project.title ||
                    'Mini and Lulu funny adventure';

                const res = await fetch('/api/kol-mini-lulu/generate-cover', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idea })
                });

                if (!res.ok) throw new Error('Failed to generate thumbnail');
                const data = await res.json();

                if (data.imageUrl) {
                    // Save to local state immediately for display
                    setLocalThumbnails(prev => ({ ...prev, [project.id]: data.imageUrl }));

                    // Save to Supabase in background
                    await (supabase.from('lulu_projects') as any)
                        .update({ concept_image_url: data.imageUrl })
                        .eq('id', project.id);
                }
            } catch (err) {
                console.warn(`Auto-thumbnail failed for project ${project.id}:`, err);
                autoGenRef.current.delete(project.id); // allow retry
            } finally {
                setGeneratingThumbnails(prev => {
                    const next = new Set(prev);
                    next.delete(project.id);
                    return next;
                });
            }
        });
    }, [projects, isLoadingProjects]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleNewProject = () => {
        reset();
        if (selectedCategory) {
            setStoreCategory(selectedCategory);
        }
        router.push(`/${locale}/kol-mini-lulu/step-1-concept`);
    };

    const handleResume = async (projectId: string) => {
        const success = await loadProject(projectId);
        if (success) {
            const currentStep = useKolMiniLuluStore.getState().currentStep;
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
        <div className="absolute inset-0 overflow-y-auto">
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

            {/* ═══════════════════════ HERO SECTION ═══════════════════════ */}
            <section className="relative px-4 md:px-8 pt-24 pb-16 overflow-hidden">
                {/* Background Atmospherics */}
                <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-violet-500/8 blur-[120px] rounded-full -z-10" />
                <div className="absolute top-20 right-1/4 w-[500px] h-[350px] bg-amber-500/8 blur-[100px] rounded-full -z-10" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-40 bg-gradient-to-t from-[var(--bg-primary)] to-transparent z-10 pointer-events-none" />

                <div className="max-w-6xl mx-auto relative z-20">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        {/* Left: Text Content */}
                        <div className="flex-1 text-center lg:text-left space-y-6">
                            {/* Badge */}
                            <m.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl"
                            >
                                <Sparkles size={14} className="text-amber-400 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/60">
                                    {tHero('badge')}
                                </span>
                            </m.div>

                            {/* Title */}
                            <m.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.9]"
                            >
                                <span className="text-white/90">{tHero('title_line1')}</span>
                                <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-pink-400 to-amber-400">
                                    {tHero('title_line2')}
                                </span>
                            </m.h1>

                            {/* Subtitle */}
                            <m.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-white/50 text-lg max-w-xl font-medium leading-relaxed"
                            >
                                {tHero('subtitle')}
                            </m.p>

                            {/* CTAs */}
                            <m.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-3"
                            >
                                {/* Selected Category Badge */}
                                <AnimatePresence>
                                    {selectedCategory && (
                                        <m.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex justify-center lg:justify-start"
                                        >
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-sm">
                                                <span className="text-amber-400 font-bold">{tCat(selectedCategory as any)}</span>
                                                <button
                                                    onClick={() => setSelectedCategory(null)}
                                                    className="text-white/40 hover:text-white transition-colors text-xs ml-1"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </m.div>
                                    )}
                                </AnimatePresence>

                                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                    <button
                                        onClick={handleNewProject}
                                        className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-500 via-pink-500 to-amber-500 text-white rounded-2xl font-bold shadow-2xl shadow-violet-500/20 hover:shadow-violet-500/40 transition-all duration-300 hover:-translate-y-1"
                                    >
                                        <Zap size={18} className="group-hover:animate-pulse" />
                                        {tHero('cta_create')}
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </button>

                                    <Link
                                        href="#projects"
                                        className="flex items-center gap-3 px-8 py-4 border border-white/10 bg-white/[0.03] backdrop-blur-sm text-white/70 hover:text-white hover:border-white/20 rounded-2xl font-bold transition-all duration-300"
                                    >
                                        {tHero('cta_explore')}
                                    </Link>
                                </div>
                            </m.div>

                            {/* Stats */}
                            <m.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex items-center gap-8 justify-center lg:justify-start pt-4"
                            >
                                <div className="text-center">
                                    <p className="text-2xl font-black text-white">10+</p>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">{tHero('stat_categories')}</p>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="text-center">
                                    <p className="text-2xl font-black text-white">AI</p>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">{tHero('stat_powered')}</p>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="text-center">
                                    <div className="flex items-center gap-1 justify-center">
                                        <Star size={14} className="text-amber-400 fill-amber-400" />
                                        <p className="text-2xl font-black text-white">{projects.length}</p>
                                    </div>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">{tHero('stat_projects')}</p>
                                </div>
                            </m.div>
                        </div>

                        {/* Right: Mascots */}
                        <m.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.8, type: 'spring' }}
                            className="relative flex items-end gap-6 lg:gap-8"
                        >
                            {/* Floating particles */}
                            <m.div
                                animate={{ y: [-8, 8, -8], rotate: [0, 10, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                                className="absolute -top-8 left-8 text-2xl"
                            >
                                ✨
                            </m.div>
                            <m.div
                                animate={{ y: [6, -6, 6], rotate: [0, -15, 0] }}
                                transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.5 }}
                                className="absolute -top-4 right-6 text-xl"
                            >
                                💫
                            </m.div>

                            {/* Mini */}
                            <m.div
                                initial={{ x: -30, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.4, type: 'spring' }}
                                className="relative"
                            >
                                <CharacterAvatar character="mini" size="xl" showGlow showLabel />
                                <m.div
                                    animate={{ y: [-3, 3, -3] }}
                                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                                    className="absolute -top-4 -right-2 px-2 py-1 rounded-lg bg-violet-500/20 border border-violet-500/30 backdrop-blur-sm"
                                >
                                    <span className="text-[10px] font-bold text-violet-300">
                                        {tHero('mini_says')}
                                    </span>
                                </m.div>
                            </m.div>

                            {/* Lulu */}
                            <m.div
                                initial={{ x: 30, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5, type: 'spring' }}
                                className="relative -mb-2"
                            >
                                <CharacterAvatar character="lulu" size="xl" showGlow showLabel />
                                <m.div
                                    animate={{ y: [3, -3, 3] }}
                                    transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut', delay: 0.3 }}
                                    className="absolute -top-4 -left-3 px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 backdrop-blur-sm"
                                >
                                    <span className="text-[10px] font-bold text-amber-300">
                                        {tHero('lulu_says')}
                                    </span>
                                </m.div>
                            </m.div>
                        </m.div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════ CATEGORIES ═══════════════════════ */}
            <section className="px-4 md:px-8 py-12">
                <div className="max-w-6xl mx-auto">
                    <m.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-8"
                    >
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                            {tHero('categories_title')}
                        </h2>
                        <p className="text-sm text-white/40 max-w-lg mx-auto">
                            {tHero('categories_subtitle')}
                        </p>
                    </m.div>

                    <CategorySelector
                        selected={selectedCategory}
                        onSelect={(catId) => setSelectedCategory(prev => prev === catId ? null : catId)}
                    />
                </div>
            </section>

            {/* ═══════════════════════ PROJECTS ═══════════════════════ */}
            <section id="projects" className="px-4 md:px-8 py-12 scroll-mt-32">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header + Search */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tight">
                                {t('title')} <span className="text-amber-400">Studio</span>
                            </h2>
                            <p className="text-[var(--text-secondary)] max-w-md">{t('subtitle')}</p>
                        </div>

                        <m.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleNewProject}
                            className="btn-primary bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-amber-500/20 flex items-center gap-3 self-start md:self-auto"
                        >
                            <Plus size={20} />
                            {t('btn_new')}
                        </m.button>
                    </div>

                    {/* Search Bar */}
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
                                                {(() => {
                                                    const thumb = project.concept_image_url || localThumbnails[project.id];
                                                    const isGenerating = generatingThumbnails.has(project.id);

                                                    if (isGenerating && !thumb) {
                                                        // Shimmer loading state
                                                        return (
                                                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-amber-500/5 to-violet-500/5">
                                                                <div className="relative">
                                                                    <div className="w-10 h-10 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
                                                                    <Sparkles className="absolute inset-0 m-auto w-4 h-4 text-amber-400" />
                                                                </div>
                                                                <p className="text-[9px] text-amber-400/60 font-medium">Đang tạo ảnh...</p>
                                                            </div>
                                                        );
                                                    }

                                                    if (thumb) {
                                                        return (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img
                                                                src={thumb}
                                                                alt={project.title}
                                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                            />
                                                        );
                                                    }

                                                    return (
                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500/5 to-orange-500/5">
                                                            <Layout className="w-12 h-12 text-amber-500/20" />
                                                        </div>
                                                    );
                                                })()}
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
                                <div className="flex items-center -space-x-4">
                                    <CharacterAvatar character="mini" size="md" showGlow={false} />
                                    <CharacterAvatar character="lulu" size="md" showGlow={false} />
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
            </section>
        </div>
    );
}
