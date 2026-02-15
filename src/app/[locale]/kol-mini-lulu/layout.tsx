'use client';

import { useKolMiniLuluStore } from "@/stores/useKolMiniLuluStore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Sparkles, Users, FileText, Clapperboard, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

import { useTranslations } from "next-intl";

export default function KolMiniLuluLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const t = useTranslations('KolMiniLulu.Layout');
    const pathname = usePathname();
    const router = useRouter();
    const { currentStep, setCurrentStep, saveProject, isCustom, selectedTemplateId, isSaving } = useKolMiniLuluStore();

    const STEPS = [
        { id: 1, name: t('step1'), icon: Sparkles, path: "/kol-mini-lulu/step-1-concept" },
        { id: 2, name: t('step2'), icon: Users, path: "/kol-mini-lulu/step-2-casting" },
        { id: 3, name: t('step3'), icon: FileText, path: "/kol-mini-lulu/step-3-script" },
        { id: 4, name: t('step4'), icon: Clapperboard, path: "/kol-mini-lulu/step-4-studio" },
        { id: 5, name: t('step5'), icon: Film, path: "/kol-mini-lulu/step-5-export" },
    ];

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

    return (
        <div className="min-h-screen relative font-sans">
            <main className="pt-28 pb-10 px-4 md:px-8 max-w-6xl mx-auto min-h-screen z-10 flex flex-col relative">
                {/* Background Glows for Ambience */}
                <div className="fixed top-20 left-10 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none z-[-1]" />
                <div className="fixed bottom-20 right-10 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] pointer-events-none z-[-1]" />

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
