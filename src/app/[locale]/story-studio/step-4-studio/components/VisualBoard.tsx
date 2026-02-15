import { Frame } from "@/lib/gemini/types";
import { FrameCard } from "./FrameCard";

interface VisualBoardProps {
    frames: Frame[];
    sceneImages: Record<number, string>;
    sceneAudios: Record<number, string>;
    isGeneratingScene: Record<number, boolean>;
    isGeneratingAudio: Record<number, boolean>;
    onGenerateFrame: (frameId: number, prompt: string) => void;
    onGenerateVoice: (frameId: number, dialogue: string, speaker: number) => void;
    t: (key: string) => string;
}

export function VisualBoard({
    frames,
    sceneImages,
    sceneAudios,
    isGeneratingScene,
    isGeneratingAudio,
    onGenerateFrame,
    onGenerateVoice,
    t
}: VisualBoardProps) {
    return (
        <div className="flex-1 bg-transparent p-4 md:p-8 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                {frames.map((frame) => (
                    <FrameCard
                        key={frame.frameId}
                        frame={frame}
                        hasImage={!!sceneImages[frame.frameId]}
                        isLoading={!!isGeneratingScene[frame.frameId]}
                        isVoiceLoading={!!isGeneratingAudio[frame.frameId]}
                        hasAudio={!!sceneAudios[frame.frameId]}
                        sceneImageUrl={sceneImages[frame.frameId]}
                        sceneAudioUrl={sceneAudios[frame.frameId]}
                        onGenerateFrame={onGenerateFrame}
                        onGenerateVoice={onGenerateVoice}
                        t={t}
                    />
                ))}
            </div>
        </div>
    );
}
