import { cn } from "@/lib/utils";
import { Volume2 } from "lucide-react";
import { Frame } from "@/lib/gemini/types";

interface ScriptPanelProps {
    scriptDescription: string;
    frames: Frame[];
    sceneImages: Record<number, string>;
    sceneAudios: Record<number, string>;
    t: (key: string) => string;
}

export function ScriptPanel({
    scriptDescription,
    frames,
    sceneImages,
    sceneAudios,
    t
}: ScriptPanelProps) {
    return (
        <div className="w-full lg:w-1/3 h-[40vh] lg:h-full overflow-y-auto bg-black/10 backdrop-blur-sm p-6 space-y-8 custom-scrollbar border-b lg:border-b-0 lg:border-r border-white/5">
            <div className="space-y-2 mb-8">
                <h3 className="text-xs font-mono text-[var(--text-muted)] uppercase">{t('logline')}</h3>
                <p className="text-sm italic text-[var(--text-secondary)]">{scriptDescription}</p>
            </div>

            {frames.map((frame, idx) => (
                <div key={idx} className="space-y-2 group">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono uppercase">
                        <span className={cn("w-6 h-6 rounded-full flex items-center justify-center border", sceneImages[frame.frameId] ? "border-[var(--success)] text-[var(--success)] bg-[var(--success)]/10" : "border-[var(--border)]")}>
                            {idx + 1}
                        </span>
                        {t('scene')} {frame.frameId}
                    </div>
                    <div className="pl-8 border-l-2 border-[var(--border)] group-hover:border-[var(--accent-primary)]/50 transition-colors py-1">
                        <p className="text-[var(--text-primary)] font-medium mb-1">{frame.description}</p>
                        {frame.dialogue && (
                            <p className="text-[var(--text-secondary)] font-serif italic text-sm">
                                &quot;{frame.dialogue}&quot;
                                {sceneAudios[frame.frameId] && <Volume2 className="inline w-3 h-3 ml-2 text-[var(--success)]" />}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
