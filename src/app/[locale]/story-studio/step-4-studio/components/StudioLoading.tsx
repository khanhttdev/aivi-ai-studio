import { Loader2, Clapperboard } from "lucide-react";

interface StudioLoadingProps {
    type: 'analyzing' | 'writing';
    t: (key: string) => string;
}

export function StudioLoading({ type, t }: StudioLoadingProps) {
    return (
        <div className="flex-1 flex items-center justify-center p-8 text-center text-[var(--text-muted)] animate-pulse">
            <div className="flex flex-col items-center gap-4">
                {type === 'analyzing' ? (
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
                ) : (
                    <Clapperboard className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
                )}
                <p>{type === 'analyzing' ? t('analyzing') : t('writing_script')}</p>
            </div>
        </div>
    );
}
