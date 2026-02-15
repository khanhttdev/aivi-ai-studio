import { Frame } from "@/lib/gemini/types";
import { Loader2, Wand2, Volume2, Mic, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const AiviAudioPlayer = dynamic(() => import('@/components/ui/AiviAudioPlayer').then(mod => mod.AiviAudioPlayer), {
    ssr: false,
    loading: () => <div className="h-10 w-full bg-gray-100 animate-pulse rounded" />
});

interface FrameCardProps {
    frame: Frame;
    hasImage: boolean;
    isLoading: boolean;
    isVoiceLoading: boolean;
    hasAudio: boolean;
    sceneImageUrl?: string;
    sceneAudioUrl?: string;
    onGenerateFrame: (frameId: number, prompt: string) => void;
    onGenerateVoice: (frameId: number, dialogue: string, speaker: number) => void;
    t: (key: string) => string;
}

export function FrameCard({
    frame,
    hasImage,
    isLoading,
    isVoiceLoading,
    hasAudio,
    sceneImageUrl,
    sceneAudioUrl,
    onGenerateFrame,
    onGenerateVoice,
    t
}: FrameCardProps) {
    return (
        <div className="card p-3 md:p-4 space-y-4 hover:border-[var(--accent-primary)]/50 transition-all border border-[var(--border)] bg-[var(--bg-secondary)]/50 backdrop-blur-sm">
            {/* Scene Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 px-1.5 py-0.5 rounded uppercase tracking-widest bg-[var(--accent-primary)]/5">
                        {t('scene')} {frame.frameId}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] hidden md:inline">{t('full_shot')}</span>
                </div>
                <div className="flex items-center gap-2">
                    {hasAudio && <Volume2 className="w-3 h-3 text-[var(--success)]" />}
                    <span className="text-[10px] text-[var(--text-muted)]">{t('video_ready')}</span>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {/* Image Container */}
                <div className="relative aspect-[9/16] bg-[var(--bg-secondary)] rounded-xl overflow-hidden border border-[var(--border)] group/img transition-colors">
                    {hasImage && sceneImageUrl ? (
                        <Image src={sceneImageUrl} alt={`Scene ${frame.frameId}`} fill unoptimized className="object-cover" />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-[var(--text-muted)] bg-[var(--bg-tertiary)]/30">
                            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-[10px] line-clamp-3 px-2">{frame.imagePrompt}</p>
                        </div>
                    )}

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <button
                            onClick={() => onGenerateFrame(frame.frameId, frame.imagePrompt)}
                            disabled={isLoading}
                            className="bg-white text-black px-4 py-2 rounded-full font-medium text-sm hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 shadow-xl"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                            {hasImage ? t('regenerate') : t('generate_shot')}
                        </button>
                    </div>
                </div>

                {/* Prompt & Voicing Grouped */}
                <div className="space-y-3 bg-[var(--bg-tertiary)]/40 p-3 rounded-xl border border-[var(--border)]">
                    <div className="flex gap-3 items-start">
                        <div className="flex-1 space-y-1">
                            <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{t('tab_script')}</label>
                            <p className="text-[11px] text-[var(--text-secondary)] italic leading-relaxed line-clamp-4">{frame.videoPrompt}</p>
                        </div>
                        <button
                            onClick={() => onGenerateVoice(frame.frameId, frame.dialogue, frame.speaker || 0)}
                            disabled={isVoiceLoading || !frame.dialogue}
                            className={cn(
                                "p-2.5 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-tighter shrink-0 min-w-[60px] aspect-square",
                                hasAudio
                                    ? "border-[var(--success)]/30 bg-[var(--success)]/10 text-[var(--success)]"
                                    : "border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/5"
                            )}
                            title={t('btn_generate_voice')}
                        >
                            {isVoiceLoading ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <Mic className="w-3 h-3" />
                            )}
                            <span>{hasAudio ? t('btn_revoice') : t('btn_voice')}</span>
                        </button>
                    </div>

                    {hasAudio && sceneAudioUrl && (
                        <div className="bg-[var(--bg-primary)]/50 rounded-lg p-2 border border-[var(--accent-primary)]/10 space-y-2">
                            <AiviAudioPlayer src={sceneAudioUrl} />
                            <button
                                onClick={() => {
                                    const a = document.createElement('a');
                                    a.href = sceneAudioUrl;
                                    a.download = `voice-scene-${frame.frameId}.mp3`;
                                    a.click();
                                }}
                                className="w-full py-1 text-[9px] font-bold text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 rounded border border-[var(--accent-primary)]/20 transition-colors uppercase tracking-widest"
                            >
                                {t('btn_download_voice')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
