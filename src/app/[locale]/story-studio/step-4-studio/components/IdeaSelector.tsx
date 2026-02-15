import { m } from "framer-motion";
import { Wand2 } from "lucide-react";
import { ContentIdea } from "@/lib/gemini/types";

interface IdeaSelectorProps {
    contentIdeas: ContentIdea[];
    onSelectIdea: (idea: ContentIdea) => void;
    t: (key: string) => string;
}

export function IdeaSelector({ contentIdeas, onSelectIdea, t }: IdeaSelectorProps) {
    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">{t('choose_concept')}</h2>
                    <p className="text-[var(--text-muted)]">{t('choose_concept_desc')}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {contentIdeas.map((idea) => (
                        <m.button
                            key={idea.id}
                            onClick={() => onSelectIdea(idea)}
                            className="text-left p-6 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] hover:bg-[var(--card-hover)] hover:border-[var(--accent-primary)] transition-all group"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                                    {idea.title}
                                </h3>
                                <Wand2 className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-primary)]" />
                            </div>
                            <p className="text-sm text-[var(--text-muted)] line-clamp-3">
                                {idea.brief}
                            </p>
                        </m.button>
                    ))}
                </div>
            </div>
        </div>
    );
}
