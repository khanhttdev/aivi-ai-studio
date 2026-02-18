'use client';

import { useKolMiniLuluStore } from "@/stores/useKolMiniLuluStore";
import { KOL_MINI_LULU_CONSTANTS } from "@/lib/constants/kol-mini-lulu";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, Plus, Trash2, Wand2 } from "lucide-react";
import { Scene, CharacterId } from "@/types/kol-mini-lulu";
// import { v4 as uuidv4 } from 'uuid'; // Removed to use crypto.randomUUID

import { useTranslations } from "next-intl";

export default function Step3ScriptPage() {
    const t = useTranslations('KolMiniLulu.Step3');
    const router = useRouter();
    const {
        selectedTemplateId,
        script,
        setScript,
        updateScene,
        isCustom,
        customPrompt,
        selectedCharacter,
        selectedTone,
        setSelectedTone
    } = useKolMiniLuluStore();

    const [isGenerating, setIsGenerating] = useState(false);

    // Auto-generate or load template on mount
    useEffect(() => {
        const generateCustomScript = async () => {
            if (isCustom && customPrompt && script.length === 0 && !isGenerating) {
                setIsGenerating(true);
                try {
                    const response = await fetch('/api/kol-mini-lulu/generate-script', {
                        method: 'POST',
                        body: JSON.stringify({
                            prompt: customPrompt,
                            character: selectedCharacter || 'both',
                            tone: selectedTone
                        })
                    });
                    const data = await response.json();
                    if (data.result && Array.isArray(data.result)) {
                        setScript(data.result);
                    }
                } catch (error) {
                    console.error("Script generation failed:", error);
                } finally {
                    setIsGenerating(false);
                }
            }
        };

        if (script.length === 0) {
            if (selectedTemplateId) {
                const template = KOL_MINI_LULU_CONSTANTS.TEMPLATES.find(t => t.id === selectedTemplateId);
                if (template) {
                    const newScript: Scene[] = template.scenes.map(s => ({
                        id: crypto.randomUUID(),
                        character: s.character as CharacterId,
                        action: s.action,
                        dialogue: s.dialogue,
                        duration: 5
                    }));
                    setScript(newScript);
                }
            } else {
                generateCustomScript();
            }
        }
    }, [selectedTemplateId, isCustom, customPrompt, script.length, setScript]);

    const handleAddScene = () => {
        const newScene: Scene = {
            id: crypto.randomUUID(),
            character: 'mini',
            action: '',
            dialogue: '',
            visual_prompt: '',
            duration: 5
        };
        setScript([...script, newScene]);
    };

    const handleDeleteScene = (id: string) => {
        setScript(script.filter(s => s.id !== id));
    };

    const handleNext = () => {
        if (script.length > 0) {
            router.push('/kol-mini-lulu/step-4-studio');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
                            {t('title')}
                        </h1>
                        <p className="text-[var(--text-secondary)]">
                            {isCustom ? t('subtitle_custom') : t('subtitle_template')}
                        </p>
                    </div>
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-sm hover:bg-[var(--bg-secondary)] transition-colors"
                        onClick={() => setScript([])}
                    >
                        <Wand2 className="w-4 h-4" />
                        {t('btn_regenerate')}
                    </button>
                </div>

                {/* Tone Selector */}
                {isCustom && script.length === 0 && (
                    <div className="flex items-center gap-3 bg-[var(--bg-secondary)]/50 p-2 rounded-xl border border-[var(--border)] w-fit">
                        <span className="text-sm font-medium px-2 text-[var(--text-secondary)]">{t('tone_label')}</span>
                        {[
                            { id: 'funny', label: t('tone_funny'), color: 'text-orange-500 bg-orange-500/10 border-orange-500/30' },
                            { id: 'emotional', label: t('tone_emotional'), color: 'text-pink-500 bg-pink-500/10 border-pink-500/30' },
                            { id: 'action', label: t('tone_action'), color: 'text-red-500 bg-red-500/10 border-red-500/30' }
                        ].map((tItem) => (
                            <button
                                key={tItem.id}
                                onClick={() => setSelectedTone(tItem.id as any)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-sm transition-all border",
                                    selectedTone === tItem.id
                                        ? `${tItem.color} font-medium shadow-sm`
                                        : "border-transparent hover:bg-[var(--bg-card)] text-[var(--text-secondary)]"
                                )}
                            >
                                {tItem.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {script.map((scene, index) => (
                    <div
                        key={scene.id}
                        className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] relative group hover:border-[var(--accent-primary)]/30 transition-all"
                    >
                        <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center font-bold text-sm text-[var(--text-secondary)]">
                            {index + 1}
                        </div>

                        <div className="pl-12 space-y-4">
                            {/* Character Select */}
                            <div className="flex gap-4">
                                {['mini', 'lulu', 'both'].map((char) => (
                                    <button
                                        key={char}
                                        onClick={() => updateScene(scene.id, { character: char as CharacterId })}
                                        className={cn(
                                            "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                                            scene.character === char
                                                ? "bg-orange-500/10 border-orange-500 text-orange-500"
                                                : "bg-[var(--bg-secondary)] border-[var(--border)]"
                                        )}
                                    >
                                        {char.toUpperCase()}
                                    </button>
                                ))}
                            </div>

                            {/* Action & Dialogue */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-[var(--text-secondary)] uppercase mb-1 block">{t('action_label')}</label>
                                    <textarea
                                        value={scene.action}
                                        onChange={(e) => updateScene(scene.id, { action: e.target.value })}
                                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none resize-none h-24"
                                        placeholder="Mô tả hành động..."
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-[var(--text-secondary)] uppercase mb-1 block">{t('dialogue_label')}</label>
                                    <textarea
                                        value={scene.dialogue}
                                        onChange={(e) => updateScene(scene.id, { dialogue: e.target.value })}
                                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-3 text-sm focus:ring-2 focus:ring-pink-500/50 outline-none resize-none h-24"
                                        placeholder="Nhập lời thoại..."
                                    />
                                </div>
                            </div>

                            {/* Visual Prompt */}
                            <div className="mt-4">
                                <label className="text-xs font-medium text-[var(--text-secondary)] uppercase mb-1 flex items-center gap-2">
                                    <Wand2 className="w-3 h-3 text-purple-500" />
                                    {t('visual_prompt_label')}
                                </label>
                                <textarea
                                    value={scene.visual_prompt || ''}
                                    onChange={(e) => updateScene(scene.id, { visual_prompt: e.target.value })}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none resize-none h-24 font-mono text-gray-400"
                                    placeholder={t('visual_prompt_placeholder')}
                                />
                            </div>
                        </div>

                        {/* Delete Button */}
                        <button
                            onClick={() => handleDeleteScene(scene.id)}
                            className="absolute top-4 right-4 p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 rounded-full"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                <button
                    onClick={handleAddScene}
                    className="w-full py-4 border-2 border-dashed border-[var(--border)] rounded-2xl flex items-center justify-center gap-2 text-[var(--text-secondary)] hover:border-orange-500/50 hover:text-orange-500 transition-all font-medium"
                >
                    <Plus className="w-5 h-5" />
                    {t('btn_add_scene')}
                </button>
            </div>

            <div className="flex justify-end pt-8">
                <button
                    onClick={handleNext}
                    disabled={script.length === 0}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-1"
                >
                    {t('btn_next')}
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
