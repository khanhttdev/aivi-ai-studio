'use client';

import { useKolMiniLuluStore } from "@/stores/useKolMiniLuluStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, Clapperboard, Film, RefreshCw, Wand2, Play, Download } from "lucide-react";

import { useTranslations } from "next-intl";

export default function Step4StudioPage() {
    const t = useTranslations('KolMiniLulu.Step4');
    const router = useRouter();
    const {
        script,
        updateScene,
        customCharacter,
        isGeneratingImages,
        isGeneratingVideo
    } = useKolMiniLuluStore();

    // Local state to simulate loading for specific items
    const [loadingState, setLoadingState] = useState<Record<string, 'image' | 'video' | null>>({});

    const handleGenerateImage = async (sceneId: string) => {
        const scene = script.find(s => s.id === sceneId);
        if (!scene) return;

        setLoadingState(prev => ({ ...prev, [sceneId]: 'image' }));

        try {
            const response = await fetch('/api/kol-mini-lulu/generate-image', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: scene.action,
                    character: scene.character,
                    customPrompt: customCharacter?.prompt // Send custom prompt
                })
            });
            const data = await response.json();

            if (data.result) {
                updateScene(sceneId, { image_url: data.result });
            } else {
                console.error("No image result", data);
            }
        } catch (error) {
            console.error("Image generation failed:", error);
        } finally {
            setLoadingState(prev => ({ ...prev, [sceneId]: null }));
        }
    };

    const handleGenerateVideo = (sceneId: string) => {
        const scene = script.find(s => s.id === sceneId);
        if (!scene) return;

        setLoadingState(prev => ({ ...prev, [sceneId]: 'video' }));

        // Generate Motion Prompt (Text for now)
        // Formula: <Camera> + <Action> + <Quality>
        const motionPrompt = `Subject: ${scene.character === 'both' ? 'Cat and Dog' : (scene.character === 'mini' ? 'Cat' : 'Dog')}. Action: ${scene.action}. Camera: Slow motion, cinematic tracking shot. Atmosphere: Cute 3D animation style.`;

        // Simulate API delay for Ux
        setTimeout(() => {
            updateScene(sceneId, {
                video_url: 'placeholder_for_motion_prompt', // Using this field to indicate "generated"
                visual_prompt: motionPrompt // Storing the actual prompt here
            });
            setLoadingState(prev => ({ ...prev, [sceneId]: null }));
        }, 1000);
    };

    const handleNext = () => {
        router.push('/kol-mini-lulu/step-5-export');
    };

    if (script.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-[var(--text-secondary)]">
                <p>{t('no_script')}</p>
                <button
                    onClick={() => router.push('/kol-mini-lulu/step-3-script')}
                    className="mt-4 px-4 py-2 bg-[var(--bg-secondary)] rounded-lg text-sm hover:bg-[var(--bg-card)] transition-colors"
                >
                    {t('back_to_script')}
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
                    {t('title')}
                </h1>
                <p className="text-[var(--text-secondary)]">
                    {t('subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {script.map((scene, index) => (
                    <div
                        key={scene.id}
                        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                    >
                        {/* Status Bar */}
                        <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)] flex justify-between items-center">
                            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                                {t('scene_label', { index: index + 1, char: scene.character.toUpperCase() })}
                            </span>
                            <span className="text-xs text-[var(--text-secondary)]">{scene.duration}s</span>
                        </div>

                        {/* Visual Area */}
                        <div className="aspect-[9/16] bg-gray-900 relative group">
                            {scene.image_url ? (
                                <img
                                    src={scene.image_url}
                                    alt={`Scene ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-700">
                                    <Clapperboard className="w-12 h-12 opacity-20" />
                                </div>
                            )}

                            {/* Loading Overlay */}
                            {loadingState[scene.id] && (
                                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                    <RefreshCw className="w-8 h-8 text-white animate-spin" />
                                </div>
                            )}

                            {/* Hover Actions */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 gap-3">
                                <button
                                    onClick={() => handleGenerateImage(scene.id)}
                                    disabled={!!loadingState[scene.id]}
                                    className="w-full py-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2 transition-all"
                                >
                                    <Wand2 className="w-4 h-4" />
                                    {scene.image_url ? t('btn_regenerate_image') : t('btn_generate_image')}
                                </button>

                                {scene.image_url && (
                                    <div className="w-full flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleGenerateVideo(scene.id)}
                                                disabled={!!loadingState[scene.id]}
                                                className="flex-1 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
                                            >
                                                <Film className="w-4 h-4" />
                                                {scene.visual_prompt ? t('btn_regenerate_motion') : t('btn_generate_motion')}
                                            </button>

                                            <a
                                                href={scene.image_url}
                                                download={`mini-lulu-scene-${index + 1}.png`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors flex items-center justify-center"
                                                title="Tải ảnh"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </div>

                                        {/* Motion Prompt Display */}
                                        {scene.visual_prompt && (
                                            <div className="bg-black/80 p-3 rounded-lg text-xs text-white/90 border border-white/10 break-words relative group">
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className="font-bold text-[10px] text-purple-400 uppercase">Motion Prompt (Kling/Luma):</p>
                                                    <button
                                                        onClick={() => navigator.clipboard.writeText(scene.visual_prompt || '')}
                                                        className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-white transition-colors"
                                                    >
                                                        Copy
                                                    </button>
                                                </div>
                                                {scene.visual_prompt}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Text Preview */}
                        <div className="p-4 space-y-2 flex-1 border-t border-[var(--border)] bg-[var(--bg-card)]">
                            <p className="text-sm font-medium line-clamp-2" title={scene.action}>
                                <span className="text-[var(--text-secondary)]">Action:</span> {scene.action}
                            </p>
                            <p className="text-sm italic text-[var(--text-secondary)] line-clamp-2" title={scene.dialogue}>
                                {scene.dialogue.startsWith('"') ? scene.dialogue : `"${scene.dialogue}"`}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center pt-8 pb-12 border-t border-[var(--border)] mt-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] border border-[var(--border)] transition-colors"
                >
                    <ArrowRight className="w-4 h-4 turn-180" />
                    {t('btn_back')}
                </button>

                <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white rounded-full font-bold shadow-lg shadow-pink-500/25 transition-all transform hover:-translate-y-1"
                >
                    {t('btn_next')}
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
