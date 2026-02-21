'use client';

import { usePovStudioStore } from "@/stores/usePovStudioStore";
import { Plus, Clock, Trash2, Sparkles, Layout, ChevronRight, Search, ArrowRight, Zap, Target, TrendingUp, Video } from "lucide-react";
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

export default function POVStudioLanding() {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('POVStudio.Dashboard');
    const tHero = useTranslations('POVStudio.Hero');
    const tStudio = useTranslations('POVStudio');

    const {
        projects,
        isLoadingProjects,
        fetchUserProjects,
        reset,
        loadProject,
        deleteProject
    } = usePovStudioStore();

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchUserProjects();
    }, [fetchUserProjects]);

    const handleNewProject = () => {
        reset();
        router.push(`/${locale}/pov-studio/studio`);
    };

    const handleResume = async (projectId: string) => {
        const success = await loadProject(projectId);
        if (success) {
            router.push(`/${locale}/pov-studio/studio`);
        } else {
            toast.error(t('load_fail'));
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            await deleteProject(deleteId);
            toast.success(tStudio('deleted'));
        } catch (error) {
            toast.error(tStudio('error_delete'));
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    const filteredProjects = projects.filter(p =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.product_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const dateLocale = locale === 'vi' ? vi : enUS;

    return (
        <div className="absolute inset-0 overflow-y-auto pb-20">
            <ConfirmDialog
                isOpen={!!deleteId}
                title={t('delete_title')}
                message={t('delete_confirm')}
                confirmLabel={tStudio('btn_delete')}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
                isDestructive={true}
                isLoading={isDeleting}
            />

            {/* ═══════════════════════ HERO SECTION ═══════════════════════ */}
            <section className="relative px-4 md:px-8 pt-24 pb-16 overflow-hidden">
                {/* Background Atmospherics */}
                <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-red-500/5 blur-[120px] rounded-full -z-10" />
                <div className="absolute top-20 right-1/4 w-[500px] h-[350px] bg-amber-500/5 blur-[100px] rounded-full -z-10" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-40 bg-gradient-to-t from-[var(--bg-primary)] to-transparent z-10 pointer-events-none" />

                <div className="max-w-6xl mx-auto relative z-20">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        {/* Left: Text Content */}
                        <div className="flex-1 text-center lg:text-left space-y-8">
                            {/* Badge */}
                            <m.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl"
                            >
                                <Sparkles size={14} className="text-red-400 animate-pulse" />
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
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-rose-500 to-amber-500">
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
                                className="flex flex-wrap gap-4 justify-center lg:justify-start"
                            >
                                <button
                                    onClick={handleNewProject}
                                    className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white rounded-2xl font-bold shadow-2xl shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-300 hover:-translate-y-1"
                                >
                                    <Zap size={18} className="group-hover:animate-pulse" />
                                    {tHero('cta_create')}
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>

                                <Link
                                    href="#dashboard"
                                    className="flex items-center gap-3 px-8 py-4 border border-white/10 bg-white/[0.03] backdrop-blur-sm text-white/70 hover:text-white hover:border-white/20 rounded-2xl font-bold transition-all duration-300"
                                >
                                    {tHero('cta_explore')}
                                </Link>
                            </m.div>

                            {/* Stats */}
                            <m.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex items-center gap-8 justify-center lg:justify-start pt-4"
                            >
                                <div className="text-center">
                                    <p className="text-2xl font-black text-white">6+</p>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">{tHero('stat_pov_types')}</p>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="text-center">
                                    <p className="text-2xl font-black text-white">Gemini</p>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">{tHero('stat_powered')}</p>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="text-center">
                                    <div className="flex items-center gap-2 justify-center">
                                        <TrendingUp size={16} className="text-red-500" />
                                        <p className="text-2xl font-black text-white">{projects.length}</p>
                                    </div>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">{tHero('stat_scripts')}</p>
                                </div>
                            </m.div>
                        </div>

                        {/* Right: Abstract Viral Visual */}
                        <m.div
                            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, duration: 0.8, type: 'spring' }}
                            className="relative lg:w-1/3 aspect-square flex items-center justify-center"
                        >
                            {/* Animated Rings */}
                            <m.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 rounded-full border border-red-500/10"
                            />
                            <m.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-8 rounded-full border border-amber-500/10"
                            />

                            {/* Central Icon */}
                            <div className="relative group">
                                <div className="absolute inset-x-0 inset-y-0 bg-red-500/20 blur-2xl rounded-full group-hover:bg-red-500/40 transition-colors" />
                                <div className="relative w-40 h-40 rounded-3xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-2xl border border-white/10 group-hover:scale-110 transition-transform duration-500">
                                    <Video size={64} className="text-white fill-white/20" />
                                </div>

                                {/* Floating Tags */}
                                <m.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -top-4 -right-8 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-black tracking-widest text-amber-400"
                                >
                                    VIRAL
                                </m.div>
                                <m.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                    className="absolute -bottom-4 -left-12 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-black tracking-widest text-red-400"
                                >
                                    ULTRA POV
                                </m.div>
                            </div>
                        </m.div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════ DASHBOARD SECTION ═══════════════════════ */}
            <section id="dashboard" className="px-4 md:px-8 py-16 scroll-mt-20">
                <div className="max-w-7xl mx-auto space-y-10">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-3">
                            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">
                                {t('title')} <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-amber-500">PRO</span>
                            </h2>
                            <p className="text-white/40 max-w-md font-medium">{t('subtitle')}</p>
                        </div>

                        <button
                            onClick={handleNewProject}
                            className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 hover:border-red-500/50 hover:bg-red-500/5 text-white rounded-2xl font-bold transition-all duration-300 group shadow-xl"
                        >
                            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                            {t('btn_new')}
                        </button>
                    </div>

                    {/* Search & Stats Bar */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/[0.02] backdrop-blur-md p-2 rounded-2xl border border-white/5 shadow-2xl">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                            <input
                                type="text"
                                placeholder={t('search_placeholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent pl-14 pr-4 py-4 focus:outline-none text-sm text-white placeholder:text-white/10"
                            />
                        </div>
                        <div className="h-8 w-[1px] bg-white/5 hidden sm:block" />
                        <div className="px-6 py-2 text-sm text-white/40 font-bold whitespace-nowrap">
                            {projects.length} <span className="text-white/20">{t('projects_count')}</span>
                        </div>
                    </div>

                    {/* Project Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {isLoadingProjects ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="aspect-[16/10] rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse" />
                            ))
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {filteredProjects.map((project, idx) => (
                                    <m.div
                                        key={project.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group relative"
                                    >
                                        <div
                                            onClick={() => handleResume(project.id)}
                                            className="h-full rounded-3xl bg-white/[0.02] border border-white/5 overflow-hidden flex flex-col transition-all duration-500 hover:border-red-500/40 hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-red-500/10 cursor-pointer"
                                        >
                                            {/* Top Preview Area */}
                                            <div className="relative aspect-[16/9] bg-gradient-to-br from-red-500/10 to-amber-500/10 overflow-hidden flex items-center justify-center">
                                                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                                                {/* POV Type Badge in Image */}
                                                <div className="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-black text-white/80 uppercase tracking-widest">
                                                    {project.pov_type}
                                                </div>

                                                <m.div
                                                    whileHover={{ scale: 1.1, rotate: 2 }}
                                                    className="relative"
                                                >
                                                    <Target size={48} className="text-red-500/20 group-hover:text-red-500/40 transition-colors" />
                                                </m.div>

                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                                                        {t('btn_continue')}
                                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div className="p-6 space-y-4 flex-1 flex flex-col">
                                                <div className="space-y-1">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <h3 className="font-black text-lg text-white group-hover:text-red-400 transition-colors line-clamp-1 leading-tight">
                                                            {project.title || t('untitled')}
                                                        </h3>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDeleteId(project.id);
                                                            }}
                                                            className="p-2 -mr-2 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                            aria-label={tStudio('btn_delete')}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                    <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest">
                                                        {project.product_name}
                                                    </p>
                                                </div>

                                                <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase">
                                                        <Clock size={12} className="text-red-500" />
                                                        {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true, locale: dateLocale })}
                                                    </div>

                                                    {/* Progress Indicator */}
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4].map((s) => (
                                                            <div
                                                                key={s}
                                                                className={cn(
                                                                    "w-1.5 h-1.5 rounded-full",
                                                                    s <= (project.current_step || 1) ? "bg-red-500" : "bg-white/10"
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </m.div>
                                ))}
                            </AnimatePresence>
                        )}

                        {!isLoadingProjects && filteredProjects.length === 0 && (
                            <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
                                    <div className="relative w-24 h-24 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                                        <TrendingUp size={40} className="text-white/20" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-white">{tStudio('empty_title')}</h3>
                                    <p className="text-white/40 font-medium max-w-xs">{tStudio('empty_desc')}</p>
                                </div>
                                <button
                                    onClick={handleNewProject}
                                    className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-500 transition-colors shadow-2xl shadow-red-500/20"
                                >
                                    {tHero('cta_create')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
