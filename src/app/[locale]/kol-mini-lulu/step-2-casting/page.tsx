'use client';

import { useKolMiniLuluStore } from "@/stores/useKolMiniLuluStore";
import { KOL_MINI_LULU_CONSTANTS } from "@/lib/constants/kol-mini-lulu";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles, ImagePlus, RefreshCw, Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useTranslations } from "next-intl";

export default function Step2CastingPage() {
    const t = useTranslations('KolMiniLulu.Step2');
    const router = useRouter();
    const {
        selectedCharacter,
        setCharacter,
        customPrompt, // The Story Idea from Step 1
        miniConfig,
        luluConfig,
        setMiniConfig,
        setLuluConfig,
        isGeneratingImages, // Record<string, boolean>
    } = useKolMiniLuluStore();

    // Local state for loading to update store safely if needed, 
    // but store has isGeneratingImages, let's use a helper to toggle it
    // Actually store doesn't have a specific setter for isGeneratingImages key, 
    // so let's stick to local state or assume we added a setter. 
    // Looking at store, `isGeneratingImages` is just state, no specific setter for keys.
    // Let's us local state for now to avoid store complexity if setter is missing.
    const [generatingState, setGeneratingState] = useState<{ [key: string]: boolean }>({});

    const handleGenerate = async (charId: 'mini' | 'lulu') => {
        setGeneratingState(prev => ({ ...prev, [charId]: true }));

        try {
            const config = charId === 'mini' ? miniConfig : luluConfig;
            const setConfig = charId === 'mini' ? setMiniConfig : setLuluConfig;

            const res = await fetch('/api/kol-mini-lulu/generate-character', {
                method: 'POST',
                body: JSON.stringify({
                    character: charId,
                    idea: customPrompt,
                    prompt: config.prompt
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed');

            if (data.imageUrl) {
                setConfig({ image: data.imageUrl });
                toast.success(t('toast_success', { char: charId === 'mini' ? 'Mini' : 'Lulu' }));
            }
        } catch (error) {
            console.error(error);
            toast.error(t('toast_error'));
        } finally {
            setGeneratingState(prev => ({ ...prev, [charId]: false }));
        }
    };

    const handleNext = () => {
        if (selectedCharacter) {
            router.push('/kol-mini-lulu/step-3-script');
        }
    };

    const renderCard = (type: 'mini' | 'lulu') => {
        const isMini = type === 'mini';
        const config = isMini ? miniConfig : luluConfig;
        const isLoading = generatingState[type];

        // Use original generated character previews
        const defaultImage = isMini ? "/images/kol-mini-lulu/mini-preview.png" : "/images/kol-mini-lulu/lulu-preview.png";

        return (
            <div className="relative group bg-[#0f1115] rounded-2xl overflow-hidden border border-white/5 hover:border-orange-500/30 transition-all shadow-xl">
                {/* Image Container */}
                <div className="aspect-[3/4] relative w-full bg-[#1a1d24]">
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 bg-black/50 backdrop-blur-sm">
                            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                            <span className="text-[10px] font-mono text-orange-400">{t('generating_outfit')}</span>
                        </div>
                    ) : (
                        <img
                            src={config?.image || defaultImage}
                            alt={type}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // Fallback if local image missing
                                e.currentTarget.src = "";
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />

                    {/* Character Name & Icon (Minimal) */}
                    <div className="absolute bottom-4 left-4 z-20">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            {isMini ? 'Mini' : 'Lulu'}
                            <span className="text-xl">{isMini ? '🐱' : '🐶'}</span>
                        </h3>
                    </div>

                    {/* Actions (Floating Top Right) */}
                    {config?.image && !isLoading && (
                        <div className="absolute top-2 right-2 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a
                                href={config.image}
                                download={`${type}-outfit.png`}
                                className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-md"
                                title="Download"
                            >
                                <Download className="w-4 h-4" />
                            </a>
                        </div>
                    )}
                </div>

                {/* Controls (Compact) */}
                <div className="p-3 space-y-2 bg-[#0f1115]">
                    <div className="relative">
                        <textarea
                            value={config.prompt || ''}
                            onChange={(e) => isMini ? setMiniConfig({ prompt: e.target.value }) : setLuluConfig({ prompt: e.target.value })}
                            placeholder={isMini ? t('prompt_placeholder_mini') : t('prompt_placeholder_lulu')}
                            className="w-full bg-[#1a1d24] rounded-lg pl-3 pr-10 py-2 text-xs text-gray-300 placeholder:text-gray-600 focus:outline-none focus:bg-[#25282e] resize-none h-10 min-h-[40px] border border-white/5"
                            style={{ scrollbarWidth: 'none' }}
                        />
                        <button
                            onClick={() => handleGenerate(type)}
                            disabled={isLoading}
                            className="absolute right-1 top-1 h-8 w-8 flex items-center justify-center bg-orange-600 hover:bg-orange-500 rounded-md text-white transition-colors disabled:opacity-50"
                            title="Tạo hình mới"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto pb-12 pt-2 md:pt-4">
            {/* Header: Compact */}
            <div className="flex items-center justify-between mb-6 px-2">
                <div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
                        {t('title')}
                    </h1>
                    <p className="text-[var(--text-secondary)] text-xs">
                        {t('subtitle')}
                    </p>
                </div>

                {/* Type Selector */}
                <div className="flex gap-1 p-1 bg-[#1a1d24] rounded-lg border border-white/5">
                    {['mini', 'lulu', 'both'].map((id) => (
                        <button
                            key={id}
                            onClick={() => setCharacter(id as any)}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                                selectedCharacter === id
                                    ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-sm"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {id === 'mini' && t('mini')}
                            {id === 'lulu' && t('lulu')}
                            {id === 'both' && t('both')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid Layout - Compact & Centered */}
            <div className="flex justify-center">
                <div className={cn(
                    "grid gap-4 w-full transition-all duration-500",
                    selectedCharacter === 'both' ? "grid-cols-1 sm:grid-cols-2 max-w-2xl" : "grid-cols-1 max-w-xs"
                )}>
                    {(selectedCharacter === 'mini' || selectedCharacter === 'both') && renderCard('mini')}
                    {(selectedCharacter === 'lulu' || selectedCharacter === 'both') && renderCard('lulu')}
                </div>
            </div>

            <div className="flex justify-end pt-8 mt-4 border-t border-white/5">
                <button
                    onClick={handleNext}
                    disabled={!selectedCharacter}
                    className="flex items-center gap-2 px-6 py-2 bg-white text-black hover:bg-gray-200 rounded-full text-sm font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-1"
                >
                    {t('btn_continue')}
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
