'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { m } from 'framer-motion';
import { Check, LayoutDashboard, UserCircle, Wand2, Copy, Video, FileOutput, Menu } from 'lucide-react';
import { useState } from 'react';

const STEPS = [
    { id: 1, path: 'step-1-theme', icon: LayoutDashboard, key: 'theme', label: 'Theme & Style' },
    { id: 2, path: 'step-2-profile', icon: UserCircle, key: 'profile', label: 'Profile Setup' },
    { id: 3, path: 'step-3-generate', icon: Wand2, key: 'generate', label: 'Generate Visuals' },
    { id: 4, path: 'step-4-clone', icon: Copy, key: 'clone', label: 'Identity Clone' },
    { id: 5, path: 'step-5-content', icon: Video, key: 'content', label: 'Content Script' },
    { id: 6, path: 'step-6-export', icon: FileOutput, key: 'export', label: 'Export & Share' },
];

export default function KOLStudioLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const t = useTranslations('KOLStudio');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Determine current step from pathname
    const currentStepPath = pathname.split('/').pop() || 'step-1-theme';
    const currentStepIndex = STEPS.findIndex(s => s.path === currentStepPath);
    const currentStep = currentStepIndex >= 0 ? currentStepIndex + 1 : 1;

    const handleStepClick = (stepPath: string, stepId: number) => {
        // Only allow navigating to completed steps or the next immediate step
        // In this flow, we generally allow free navigation if they've passed the step before
        if (stepId <= currentStep + 1 || stepId <= Math.max(currentStep, 1)) {
            router.push(`/kol-studio/${stepPath}`);
        }
    };

    // Check if we are on the dashboard page
    // Note: pathname includes locale, e.g., /en/kol-studio
    const isDashboard = pathname.endsWith('/kol-studio');

    if (isDashboard) {
        return (
            <div className="flex flex-col md:flex-row min-h-[calc(100vh-7rem)] bg-transparent w-full overflow-x-hidden">
                <main className="flex-1 flex flex-col relative overflow-hidden w-full max-w-full">
                    <div className="flex-1 overflow-y-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-7rem)] bg-transparent w-full overflow-x-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-72 flex-col sticky top-28 h-[calc(100vh-7rem)] border-r border-[var(--border)] bg-[var(--bg-secondary)]/50 backdrop-blur-xl">
                <div className="p-6 border-b border-[var(--border)]">
                    <h1 className="text-xl font-bold gradient-text">
                        {t('title') || 'KOL AI Studio'}
                    </h1>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                        {t('subtitle') || 'Create Pro AI Influencers'}
                    </p>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    {STEPS.map((step, index) => {
                        const isCompleted = step.id < currentStep;
                        const isCurrent = step.id === currentStep;
                        const isActive = isCompleted || isCurrent;
                        const Icon = step.icon;

                        return (
                            <div key={step.id} className="relative">
                                {/* Connector Line */}
                                {index < STEPS.length - 1 && (
                                    <div className={`absolute left-6 top-10 bottom-[-10px] w-0.5 z-0 
                                        ${isCompleted ? 'bg-[var(--accent-primary)]' : 'bg-[var(--border)]'}`}
                                    />
                                )}

                                <m.button
                                    onClick={() => handleStepClick(step.path, step.id)}
                                    disabled={!isActive && step.id > currentStep}
                                    className={`
                                        relative z-10 w-full flex items-center gap-4 p-3 rounded-xl text-left transition-all duration-300
                                        ${isCurrent
                                            ? 'bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30'
                                            : 'hover:bg-[var(--bg-tertiary)]'
                                        }
                                        ${!isActive && step.id > currentStep ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                    whileHover={isActive || step.id <= currentStep ? { x: 4 } : {}}
                                >
                                    <div className={`
                                        w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors
                                        ${isCompleted
                                            ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-black'
                                            : isCurrent
                                                ? 'bg-[var(--bg-primary)] border-[var(--accent-primary)] text-[var(--accent-primary)]'
                                                : 'bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-muted)]'
                                        }
                                    `}>
                                        {isCompleted ? <Check size={14} strokeWidth={3} /> : <Icon size={14} />}
                                    </div>

                                    <div>
                                        <div className={`text-sm font-bold ${isCurrent ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}`}>
                                            {t(`steps.${step.key || 'theme'}`) || step.label}
                                        </div>
                                        {isCurrent && (
                                            <div className="text-[10px] text-[var(--accent-primary)] animate-pulse">
                                                In Progress...
                                            </div>
                                        )}
                                    </div>

                                    {isCurrent && (
                                        <m.div
                                            layoutId="sidebar-active-indicator"
                                            className="absolute right-3 w-2 h-2 rounded-full bg-[var(--accent-primary)]"
                                        />
                                    )}
                                </m.button>
                            </div>
                        );
                    })}
                </nav>
            </aside>

            {/* Mobile Header (Collapsible) */}
            <div className="md:hidden flex flex-col w-full">
                <div className="sticky top-28 z-30 bg-[var(--bg-secondary)] border-b border-[var(--border)] p-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold gradient-text">KOL Studio</h1>
                        <p className="text-xs text-[var(--text-muted)]">Step {currentStep} of {STEPS.length}: {t(`steps.${STEPS[currentStepIndex]?.key || 'theme'}`) || STEPS[currentStepIndex]?.label || STEPS[0].label}</p>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 rounded-lg bg-[var(--bg-tertiary)]"
                    >
                        <Menu size={20} />
                    </button>
                </div>

                {isMobileMenuOpen && (
                    <m.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        className="bg-[var(--bg-secondary)] border-b border-[var(--border)] overflow-hidden"
                    >
                        {STEPS.map((step) => (
                            <button
                                key={step.id}
                                onClick={() => handleStepClick(step.path, step.id)}
                                className={`w-full p-4 flex items-center gap-3 border-b border-[var(--border)]/50
                                    ${step.id === currentStep ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}
                                `}
                            >
                                <step.icon size={18} />
                                <span className="text-sm font-medium">{t(`steps.${step.key}`) || step.label}</span>
                                {step.id < currentStep && <Check size={14} className="ml-auto text-green-500" />}
                            </button>
                        ))}
                    </m.div>
                )}
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative overflow-hidden w-full max-w-full">
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-5xl mx-auto dark-glass p-0 rounded-2xl md:bg-transparent md:border-none md:shadow-none">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
