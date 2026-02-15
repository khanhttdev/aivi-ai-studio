'use client';
import { useAiviStoryStore } from "@/stores/useAiviStoryStore";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Sparkles, Route, Users, Clapperboard, Film, Video, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

const STEPS = [
    { id: 1, name: "The Spark", icon: Sparkles, path: "/story-studio/step-1-spark" },
    { id: 2, name: "The Crossroads", icon: Route, path: "/story-studio/step-2-crossroads" },
    { id: 3, name: "Cast Your Leads", icon: Users, path: "/story-studio/step-3-casting" },
    { id: 4, name: "The Studio", icon: Clapperboard, path: "/story-studio/step-4-studio" },
    { id: 5, name: "The Export", icon: Film, path: "/story-studio/step-5-export" },
    { id: 6, name: "Video Studio", icon: Video, path: "/story-studio/step-6-video" },
];

export default function StoryStudioLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // const router = useRouter(); // Unused
    const pathname = usePathname();
    const { currentStep, setCurrentStep, isOpeningStory } = useAiviStoryStore();
    const t = useTranslations('StoryStudio.Dashboard');

    useEffect(() => {
        // Sync store with pathname on mount/change
        const step = STEPS.find(s => s.path === pathname);
        if (step && step.id !== currentStep) {
            setCurrentStep(step.id);
        }
    }, [pathname, setCurrentStep, currentStep]);

    return (
        <div className="min-h-screen text-[var(--text-primary)] font-sans selection:bg-[var(--accent-purple)]/30">

            {/* Project Opening Overlay */}
            <AnimatePresence>
                {isOpeningStory && (
                    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center">
                        <m.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-[var(--bg-secondary)] border border-[var(--border)] p-8 rounded-3xl flex flex-col items-center shadow-2xl"
                        >
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-[var(--accent-primary)]/20 blur-2xl rounded-full" />
                                <Loader2 className="w-12 h-12 text-[var(--accent-primary)] animate-spin relative z-10" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{t('opening_title')}</h3>
                            <p className="text-[var(--text-secondary)] text-sm">{t('opening_msg')}</p>
                        </m.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Header / Nav - REMOVED as per user request to use global header */}
            {/* 
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-md h-16 flex items-center px-6 justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
                        <Film className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight gradient-text">
                        AIVI Story
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    {STEPS.map((step, idx) => {
                        const isActive = step.id === currentStep;
                        const isCompleted = step.id < currentStep;

                        return (
                            <div key={step.id} className="flex items-center">
                                <div
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300",
                                        isActive ? "bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30" : "opacity-40 hover:opacity-70"
                                    )}
                                >
                                    <step.icon className={cn("w-4 h-4", isActive ? "text-[var(--accent-primary)]" : "text-[var(--text-secondary)]")} />
                                    {isActive && <span className="text-xs font-medium text-[var(--text-primary)]">{step.name}</span>}
                                </div>
                                {idx < STEPS.length - 1 && (
                                    <div className={cn("w-8 h-[1px] mx-1", isCompleted ? "bg-[var(--accent-success)]" : "bg-[var(--border)]")} />
                                )}
                            </div>
                        )
                    })}
                </div>

                <div className="w-24" /> 
            </header>
            */}

            {/* content */}
            <main className="relative min-h-screen z-10 flex flex-col">
                <AnimatePresence mode="wait">
                    <m.main
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex-1 flex overflow-hidden"
                    >
                        {children}
                    </m.main>
                </AnimatePresence>
            </main>
        </div>
    );
}
