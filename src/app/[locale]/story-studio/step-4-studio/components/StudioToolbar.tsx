import { m } from "framer-motion";
import { Settings2, Loader2, Image as ImageIcon, Mic, Video, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudioToolbarProps {
    title?: string;
    frameCount: number;
    mainTopic: string;
    showVoiceSettings: boolean;
    setShowVoiceSettings: (show: boolean) => void;
    isGeneratingAll: boolean;
    isGeneratingAllAudio: boolean;
    isSaving: boolean;
    onGenerateAll: () => void;
    onGenerateAllAudio: () => void;
    onDirectorMode: () => void;
    onExport: () => void;
    t: (key: string) => string;
}

export function StudioToolbar({
    title,
    frameCount,
    mainTopic,
    showVoiceSettings,
    setShowVoiceSettings,
    isGeneratingAll,
    isGeneratingAllAudio,
    isSaving,
    onGenerateAll,
    onGenerateAllAudio,
    onDirectorMode,
    onExport,
    t
}: StudioToolbarProps) {
    return (
        <div className="h-auto md:h-16 py-4 md:py-0 bg-[var(--glass-bg)] flex flex-col md:flex-row items-center justify-between px-4 md:px-6 z-20 relative gap-4 md:gap-0">
            <div className="w-full md:w-auto flex justify-between md:block">
                <div>
                    <h2 className="font-bold text-[var(--text-primary)] text-sm md:text-base">{title}</h2>
                    <p className="text-[10px] md:text-xs text-[var(--text-muted)] uppercase tracking-widest">{frameCount} {t('scenes')} • {mainTopic}</p>
                </div>
                <m.button
                    onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                    className={cn("btn-ghost flex md:hidden items-center gap-2 text-sm", showVoiceSettings && "bg-[var(--bg-tertiary)]")}
                >
                    <Settings2 className="w-4 h-4" />
                </m.button>
            </div>

            <div className="flex items-center justify-between w-full md:w-auto gap-2 md:gap-3 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                <m.button
                    onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                    className={cn("btn-ghost hidden md:flex items-center gap-2 text-sm", showVoiceSettings && "bg-[var(--bg-tertiary)]")}
                    title={t('title_voice_settings')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Settings2 className="w-4 h-4" />
                    <span className="hidden lg:inline">{t('btn_voice_settings')}</span>
                </m.button>

                <div className="h-6 w-px bg-[var(--border)] mx-1 md:mx-2 hidden md:block" />

                <m.button
                    onClick={onGenerateAll}
                    disabled={isGeneratingAll || isSaving}
                    className="btn-secondary flex items-center gap-2 text-xs md:text-sm px-3 md:px-4"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title={t('generate_all')}
                >
                    {isGeneratingAll ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <ImageIcon className="w-4 h-4" />
                    )}
                    <span className="hidden md:inline">{t('generate_all')}</span>
                </m.button>

                <m.button
                    onClick={onGenerateAllAudio}
                    disabled={isGeneratingAllAudio || isSaving}
                    className="btn-secondary flex items-center gap-2 text-xs md:text-sm px-3 md:px-4"
                    title={t('btn_voice_all')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {isGeneratingAllAudio ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Mic className="w-4 h-4" />
                    )}
                    <span className="hidden md:inline">{t('btn_voice_all')}</span>
                </m.button>

                <m.button
                    onClick={onDirectorMode}
                    disabled={isSaving || isGeneratingAll}
                    className="btn-secondary flex items-center gap-2 text-xs md:text-sm px-3 md:px-4"
                    title={t('title_director_mode')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Video className="w-4 h-4" />
                    <span className="hidden lg:inline">{t('director_mode')}</span>
                </m.button>

                <m.button
                    onClick={onExport}
                    disabled={isSaving || isGeneratingAll}
                    className="btn-primary flex items-center gap-2 text-xs md:text-sm px-3 md:px-4 ml-auto md:ml-0"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="hidden md:inline">{t('saving')}</span>
                        </>
                    ) : (
                        <>
                            <span className="hidden md:inline">{t('finalize')}</span> <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </m.button>
            </div>
        </div>
    );
}
