'use client';

import { useAiviStoryStore } from "@/stores/useAiviStoryStore";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ArrowLeft, Play, Pause, Save, ArrowRight, Video, GripVertical, Trash2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from 'next-intl';
import { toast } from "sonner";

export default function Step6Director() {
    const router = useRouter();
    const t = useTranslations('StoryStudio.Step6');
    const {
        script, setScript,
        sceneImages,
        sceneAudios,
        backgroundMusic,
        saveStory, isSaving
    } = useAiviStoryStore();

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

    // Preview state
    const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const bgMusicRef = useRef<HTMLAudioElement | null>(null);

    const playSceneRef = useRef<(index: number) => Promise<void>>(null);

    const playScene = useCallback(async (index: number) => {
        if (!script || index >= script.frames.length) {
            setIsPlaying(false);
            setCurrentFrameIndex(0);
            return;
        }

        setCurrentFrameIndex(index);
        const frame = script.frames[index];
        const audioUrl = sceneAudios[frame.frameId];

        const moodDuration = 3000; // Default duration if no audio

        // Handle Audio Playback
        if (audioUrl) {
            const currentAudio = audioRef.current;
            if (currentAudio) {
                try {
                    currentAudio.src = audioUrl;
                    await currentAudio.play();
                } catch (err: unknown) {
                    if (err instanceof Error && err.name !== 'AbortError') {
                        console.error("Audio playback error:", err);
                    }
                }

                currentAudio.onended = () => {
                    if (playSceneRef.current) {
                        playSceneRef.current(index + 1);
                    }
                };
                // If audio is playing, let it control the timing, don't set a timeout
                return;
            }
        }

        // Fallback timer if no audio or audioRef is not ready
        previewTimeoutRef.current = setTimeout(() => {
            if (playSceneRef.current) {
                playSceneRef.current(index + 1);
            }
        }, moodDuration);
    }, [script, sceneAudios]); // Dependencies for useCallback

    // Store playScene in a ref to allow safe recursion without initialization issues
    useEffect(() => {
        playSceneRef.current = playScene;
    }, [playScene]);

    useEffect(() => {
        // This effect manages the overall playback state and cleanup
        const currentAudio = audioRef.current;
        const currentBgMusic = bgMusicRef.current;
        const currentTimeout = previewTimeoutRef.current;

        if (isPlaying) {
            // If playing, start or continue the scene playback
            // Use setTimeout to avoid set-state-in-effect warning if playScene calls state updates
            const timer = setTimeout(() => {
                playScene(currentFrameIndex);
            }, 0);
            return () => clearTimeout(timer);
        } else {
            // If not playing, stop all playback and reset
            if (currentTimeout) {
                clearTimeout(currentTimeout);
                previewTimeoutRef.current = null;
            }
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }
            if (currentBgMusic) {
                currentBgMusic.pause();
            }
        }

        // Cleanup function for when component unmounts or isPlaying changes
        return () => {
            if (previewTimeoutRef.current) {
                clearTimeout(previewTimeoutRef.current);
            }
            if (currentAudio) {
                currentAudio.pause();
            }
            if (currentBgMusic) {
                currentBgMusic.pause();
            }
        };
    }, [isPlaying, currentFrameIndex, playScene]); // Dependencies for useEffect

    // Initial check for script availability
    if (!script) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-[var(--text-muted)]">
                <p>{t('no_script')}</p>
                <button onClick={() => router.push('/story-studio/step-1-spark')} className="btn-primary mt-4">
                    {t('btn_go_start')}
                </button>
            </div>
        );
    }

    const togglePlay = () => {
        if (isPlaying) {
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
            // Start background music only when playback begins
            if (backgroundMusic && bgMusicRef.current) {
                bgMusicRef.current.src = backgroundMusic;
                bgMusicRef.current.volume = 0.3;
                bgMusicRef.current.loop = true;
                bgMusicRef.current.play();
            }
            // playScene will be called by the useEffect when isPlaying becomes true
        }
    };

    // Reordering Logic
    const handleDragStart = (index: number) => {
        setDraggedItemIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedItemIndex === null || draggedItemIndex === index) return;

        const newFrames = [...script.frames];
        const draggedItem = newFrames[draggedItemIndex];
        newFrames.splice(draggedItemIndex, 1);
        newFrames.splice(index, 0, draggedItem);

        setScript({ ...script, frames: newFrames });
        setDraggedItemIndex(index); // Update dragged item index to reflect its new position
    };

    const handleDragEnd = () => {
        setDraggedItemIndex(null);
    };

    const handleDeleteFrame = (index: number) => {
        const newFrames = script.frames.filter((_, i) => i !== index);
        setScript({ ...script, frames: newFrames });
        // If the current frame is deleted, adjust currentFrameIndex
        if (currentFrameIndex === index) {
            setCurrentFrameIndex(Math.max(0, index - 1));
        } else if (currentFrameIndex > index) {
            setCurrentFrameIndex(currentFrameIndex - 1);
        }
    };

    const handleSave = async () => {
        try {
            await saveStory();
            toast.success(t('save_success'));
        } catch {
            // Error logged if needed
            toast.error(t('save_error'));
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--bg-primary)]">
            {/* Header / Toolbar */}
            <div className="h-auto py-3 md:h-16 md:py-0 border-b border-[var(--border)] bg-[var(--bg-secondary)] flex flex-col md:flex-row items-center justify-between px-4 md:px-6 z-10 shrink-0 gap-3 md:gap-0">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button onClick={() => router.back()} className="p-2 hover:bg-[var(--bg-tertiary)] rounded-full text-[var(--text-secondary)]">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                            <Video className="w-5 h-5 text-[var(--accent-primary)]" />
                            {t('title')}
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <button
                        onClick={togglePlay}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all flex-1 md:flex-none justify-center",
                            isPlaying
                                ? "bg-[var(--accent-primary)] text-black"
                                : "bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--text-secondary)]/20"
                        )}
                    >
                        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                        {isPlaying ? t('btn_pause') : t('btn_play')}
                    </button>

                    <div className="w-px h-6 bg-[var(--border)] mx-2 hidden md:block" />

                    <div className="flex items-center gap-2">
                        <button onClick={handleSave} disabled={isSaving} className="btn-ghost" title={t('btn_save')}>
                            <Save className="w-5 h-5" />
                        </button>

                        <button onClick={() => router.push('/story-studio/step-5-export')} className="btn-primary flex items-center gap-2">
                            <span className="hidden sm:inline">{t('btn_export')}</span> <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Editor Workspace */}
            <div className="flex-1 flex overflow-hidden">

                {/* Preview Monitor (Top/Center) */}
                <div className="flex-1 flex flex-col">
                    {/* Monitor */}
                    <div className="flex-1 bg-black flex items-center justify-center relative shadow-inner">
                        <div className="aspect-video h-[80%] max-w-[90%] bg-[var(--bg-primary)] border border-[var(--border)] relative overflow-hidden rounded-lg shadow-2xl">
                            {/* Display current frame */}
                            {(() => {
                                const frame = script.frames[currentFrameIndex];
                                const img = sceneImages[frame?.frameId];
                                return (
                                    <>
                                        {img ? (
                                            <Image src={img} fill unoptimized className="object-contain bg-black" alt="Monitor" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-muted)]">
                                                <Video className="w-12 h-12 mb-4 opacity-20" />
                                                <p>{t('no_image')} {frame?.frameId}</p>
                                            </div>
                                        )}

                                        {/* Subtitles Overlay */}
                                        {frame?.dialogue && (
                                            <div className="absolute bottom-8 left-0 right-0 text-center px-10">
                                                <span className="bg-black/60 text-white text-lg px-4 py-2 rounded-lg backdrop-blur-sm inline-block shadow-lg">
                                                    {frame.dialogue}
                                                </span>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}

                            {/* Scene Index Indicator */}
                            <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded font-mono">
                                {t('scene_label')} {currentFrameIndex + 1} / {script.frames.length}
                            </div>
                        </div>

                        {/* Hidden Audio Elements */}
                        <audio ref={audioRef} className="hidden" />
                        <audio ref={bgMusicRef} className="hidden" />
                    </div>

                    {/* Timeline Strip */}
                    <div className="h-64 bg-[var(--bg-secondary)] border-t border-[var(--border)] flex flex-col shrink-0">
                        <div className="h-8 border-b border-[var(--border)] flex items-center px-4 justify-between bg-[var(--bg-tertiary)]">
                            <div className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-widest">{t('timeline_label')}</div>
                            <div className="text-xs text-[var(--text-muted)]">{script.frames.length} {t('clips_label')}</div>
                        </div>

                        <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar p-6 bg-[url('/grid-pattern.png')]">
                            <div className="flex gap-2 min-w-min pb-4">
                                {script.frames.map((frame, index) => (
                                    <div
                                        key={frame.frameId} // Use frameId usually, but index is safe if key is unique
                                        draggable
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        onClick={() => setCurrentFrameIndex(index)}
                                        className={cn(
                                            "w-48 h-32 bg-[var(--bg-primary)] border rounded-lg flex flex-col overflow-hidden shrink-0 cursor-pointer transition-all relative group shadow-sm",
                                            currentFrameIndex === index ? "border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/20 z-10" : "border-[var(--border)] hover:border-[var(--text-secondary)]",
                                            draggedItemIndex === index ? "opacity-50" : "opacity-100"
                                        )}
                                    >
                                        {/* Handle */}
                                        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/50 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center cursor-move">
                                            <GripVertical className="w-3 h-3 text-white" />
                                        </div>

                                        <div className="flex-1 bg-black relative">
                                            {sceneImages[frame.frameId] ? (
                                                <Image src={sceneImages[frame.frameId]} fill unoptimized className="object-cover opacity-80" alt="" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-[10px]">{t('no_image')}</div>
                                            )}
                                        </div>

                                        <div className="h-8 bg-[var(--bg-tertiary)] border-t border-[var(--border)] flex items-center justify-between px-2 text-[10px] text-[var(--text-secondary)]">
                                            <span className="font-mono">SC {frame.frameId}</span>
                                            {sceneAudios[frame.frameId] && <Settings className="w-3 h-3 text-[var(--success)]" />}
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteFrame(index); }}
                                            className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all z-20"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}

                                {/* Add Add Frame button if needed */}
                                {/* <button className="w-12 h-32 border border-dashed border-[var(--border)] rounded-lg flex items-center justify-center hover:bg-[var(--bg-tertiary)] transition-colors">
                                     <Plus className="w-4 h-4 text-[var(--text-muted)]" />
                                 </button> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
