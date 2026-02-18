'use client';

import { useKolMiniLuluStore } from "@/stores/useKolMiniLuluStore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Sparkles, Users, FileText, Clapperboard, Film, Check, ArrowLeft, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

import { useTranslations, useLocale } from "next-intl";

export default function KolMiniLuluLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const t = useTranslations('KolMiniLulu.Layout');
    const pathname = usePathname();
    const router = useRouter();
    const locale = useLocale();
    const { currentStep, setCurrentStep, saveProject, isCustom, selectedTemplateId, isSaving } = useKolMiniLuluStore();

    const STEPS = useMemo(() => [
        { id: 1, name: t('step1'), icon: Sparkles, path: "/kol-mini-lulu/step-1-concept" },
        { id: 2, name: t('step2'), icon: Users, path: "/kol-mini-lulu/step-2-casting" },
        { id: 3, name: t('step3'), icon: FileText, path: "/kol-mini-lulu/step-3-script" },
        { id: 4, name: t('step4'), icon: Clapperboard, path: "/kol-mini-lulu/step-4-studio" },
        { id: 5, name: t('step5'), icon: Film, path: "/kol-mini-lulu/step-5-export" },
    ], [t]);

    // Check if we're on a step page (not the landing page)
    const isStepPage = pathname.includes('/step-');

    useEffect(() => {
        // Sync store with pathname on mount/change
        const cleanPath = pathname.replace(/^\/[a-z]{2}/, '');
        const step = STEPS.find(s => cleanPath.includes(s.path));

        if (step && step.id !== currentStep) {
            setCurrentStep(step.id);
        }
    }, [pathname, setCurrentStep, currentStep, STEPS]);

    // Auto-save on step change
    useEffect(() => {
        if (currentStep > 1 || isCustom || selectedTemplateId) {
            const timer = setTimeout(() => {
                saveProject();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [currentStep, saveProject, isCustom, selectedTemplateId]);

    const handleStepClick = (step: typeof STEPS[number]) => {
        // Only allow navigating to completed or current steps
        if (step.id <= currentStep) {
            router.push(`/${locale}${step.path}`);
        }
    };

    return (
        <div className="min-h-screen relative font-sans">
            <main className="pt-28 pb-10 px-4 md:px-8 w-full mx-auto min-h-screen z-10 flex flex-col relative">
                {/* Background Glows for Ambience */}
                <div className="fixed top-20 left-10 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none z-[-1]" />
                <div className="fixed bottom-20 right-10 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] pointer-events-none z-[-1]" />

                {/* Step Progress Bar - Only on step pages */}
                {isStepPage && (
                    <m.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8 max-w-5xl mx-auto w-full"
                    >
                        {/* Back to Dashboard */}
                        <div className="flex items-center justify-between mb-4 px-2">
                            <Link
                                href={`/${locale}/kol-mini-lulu`}
                                className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors group"
                            >
                                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                                <Home className="w-3.5 h-3.5" />
                                <span>{t('back_to_home')}</span>
                            </Link>

                            {/* Step counter */}
                            <span className="text-xs text-gray-500 font-mono">
                                {currentStep} / {STEPS.length}
                            </span>
                        </div>

                        {/* Progress Steps */}
                        <div className="relative flex items-center justify-between px-4">
                            {/* Background Line */}
                            <div className="absolute top-5 left-8 right-8 h-[2px] bg-white/5 rounded-full" />

                            {/* Active Line */}
                            <m.div
                                className="absolute top-5 left-8 h-[2px] bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-full origin-left"
                                initial={{ width: '0%' }}
                                animate={{ width: `calc((100% - 4rem) * ${(currentStep - 1) / (STEPS.length - 1)})` }}
                                transition={{ duration: 0.6, ease: 'easeInOut' }}
                            />

                            {STEPS.map((step) => {
                                const Icon = step.icon;
                                const isActive = step.id === currentStep;
                                const isCompleted = step.id < currentStep;
                                const isClickable = step.id <= currentStep;

                                return (
                                    <button
                                        key={step.id}
                                        onClick={() => handleStepClick(step)}
                                        disabled={!isClickable}
                                        className={cn(
                                            "flex flex-col items-center gap-1.5 relative z-10 transition-all",
                                            isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-40"
                                        )}
                                    >
                                        {/* Step Circle */}
                                        <m.div
                                            className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                                                isActive
                                                    ? "bg-gradient-to-br from-orange-500 to-pink-500 border-orange-400 shadow-lg shadow-orange-500/30 scale-110"
                                                    : isCompleted
                                                        ? "bg-emerald-500/20 border-emerald-500/50"
                                                        : "bg-white/5 border-white/10"
                                            )}
                                            whileHover={isClickable ? { scale: 1.15 } : {}}
                                            whileTap={isClickable ? { scale: 0.95 } : {}}
                                        >
                                            {isCompleted ? (
                                                <Check className="w-4 h-4 text-emerald-400" />
                                            ) : (
                                                <Icon className={cn(
                                                    "w-4 h-4",
                                                    isActive ? "text-white" : "text-gray-500"
                                                )} />
                                            )}
                                        </m.div>

                                        {/* Step Label */}
                                        <span className={cn(
                                            "text-[10px] font-medium whitespace-nowrap transition-colors",
                                            isActive ? "text-white" : isCompleted ? "text-emerald-400/80" : "text-gray-600"
                                        )}>
                                            {step.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </m.div>
                )}

                {/* Auto-save Indicator */}
                <AnimatePresence>
                    {isSaving && (
                        <m.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="fixed top-24 right-8 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full z-50 shadow-2xl"
                        >
                            <Sparkles className="w-3 h-3 text-orange-400 animate-pulse" />
                            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-300">Auto-Saving...</span>
                        </m.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    <m.div
                        key={pathname}
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="flex-1 w-full"
                    >
                        {children}
                    </m.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
