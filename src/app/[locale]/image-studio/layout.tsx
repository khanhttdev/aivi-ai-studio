'use client';

import { useImageStudioStore } from "@/stores/imageStudioStore";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Image, Download, Wand2 } from "lucide-react";
// import { useTranslations } from "next-intl";

const STEPS = [
    { id: 1, name: "steps.step1", icon: Image, path: "/image-studio/step-1-input" },
    { id: 2, name: "steps.step2", icon: Wand2, path: "/image-studio/step-2-generation" },
    { id: 3, name: "steps.step3", icon: Download, path: "/image-studio/step-3-result" },
];

export default function ImageStudioLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { currentStep, setCurrentStep } = useImageStudioStore();
    // const t = useTranslations('ImageStudio');

    useEffect(() => {
        const step = STEPS.find(s => s.path === pathname);
        if (step && step.id !== currentStep) {
            setCurrentStep(step.id);
        }
    }, [pathname, setCurrentStep, currentStep]);

    return (
        <div className="min-h-screen text-[var(--text-primary)] font-sans selection:bg-[var(--accent-primary)]/30">
            {/* Steps Header handled globally via pathname or here locally if needed. 
                For now we keep the layout simple as per design.
            */}

            {/* Content */}
            <main className="relative min-h-screen z-10 flex flex-col">
                <AnimatePresence mode="wait">
                    <m.div
                        key={pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5 }}
                        className="flex-1 flex overflow-hidden"
                    >
                        {children}
                    </m.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
