'use client';

import { useKolMiniLuluStore } from "@/stores/useKolMiniLuluStore";
import { KOL_MINI_LULU_CONSTANTS } from "@/lib/constants/kol-mini-lulu";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles } from "lucide-react";

import { useTranslations } from "next-intl";

export default function Step1ConceptPage() {
    const t = useTranslations('KolMiniLulu.Step1');
    const router = useRouter();
    const {
        selectedTemplateId,
        setTemplate,
        customPrompt,
        setCustomPrompt,
        isGeneratingIdea,
        setIsGeneratingIdea,
        reset
    } = useKolMiniLuluStore();

    const handleNext = () => {
        if (selectedTemplateId || customPrompt.trim()) {
            router.push('/kol-mini-lulu/step-2-casting');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
                    {t('title')}
                </h1>
                <p className="text-[var(--text-secondary)]">
                    {t('subtitle')}
                </p>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {KOL_MINI_LULU_CONSTANTS.TEMPLATES.map((template) => (
                    <div
                        key={template.id}
                        onClick={() => setTemplate(template.id)}
                        className={cn(
                            "group cursor-pointer p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden",
                            selectedTemplateId === template.id
                                ? "border-orange-500 bg-orange-500/5 ring-1 ring-orange-500"
                                : "border-[var(--border)] bg-[var(--bg-card)] hover:border-orange-500/50"
                        )}
                    >
                        <div className="relative z-10">
                            <h3 className="font-semibold text-lg mb-2">{template.title}</h3>
                            <p className="text-sm text-[var(--text-secondary)]">{template.description}</p>
                        </div>
                        {selectedTemplateId === template.id && (
                            <div className="absolute top-4 right-4 text-orange-500">
                                <Sparkles className="w-5 h-5 fill-current" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Custom Input */}
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="h-[1px] flex-1 bg-[var(--border)]" />
                    <span className="text-sm text-[var(--text-secondary)] uppercase font-medium">{t('or_label')}</span>
                    <div className="h-[1px] flex-1 bg-[var(--border)]" />
                </div>

                <div className={cn(
                    "p-6 rounded-2xl border transition-all",
                    customPrompt ? "border-pink-500 bg-pink-500/5" : "border-[var(--border)] bg-[var(--bg-card)]"
                )}>
                    <label className="flex items-center justify-between text-sm font-medium mb-3">
                        <span>{t('custom_idea_title')}</span>
                        <button
                            onClick={async () => {
                                setIsGeneratingIdea(true);
                                try {
                                    const res = await fetch('/api/kol-mini-lulu/generate-ideas', { method: 'POST', body: JSON.stringify({}) });
                                    const data = await res.json();
                                    if (data.idea) setCustomPrompt(data.idea);
                                } catch (e) {
                                    console.error(e);
                                } finally {
                                    setIsGeneratingIdea(false);
                                }
                            }}
                            disabled={isGeneratingIdea}
                            className="text-xs flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 text-purple-400 border border-purple-500/30 transition-all"
                        >
                            {isGeneratingIdea ? (
                                <span className="animate-spin">✨</span>
                            ) : (
                                <Sparkles className="w-3 h-3" />
                            )}
                            {isGeneratingIdea ? t('btn_generating') : t('btn_generate_idea')}
                        </button>
                    </label>
                    <textarea
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder={t('custom_idea_placeholder')}
                        className="w-full h-32 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all resize-none"
                    />
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-end pt-8">
                <button
                    onClick={handleNext}
                    disabled={!selectedTemplateId && !customPrompt.trim()}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-1"
                >
                    {t('btn_next')}
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
