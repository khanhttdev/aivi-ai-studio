export type ContentIdea = {
    id: string;
    title: string;
    brief: string;
    viralScore: number;
};

export type ScriptScene = {
    frameId: number;
    description: string;
    dialogue: string;
    imagePrompt: string;
    imageUrl?: string;
};

export type ViralScript = {
    id: string;
    title: string;
    topic: string;
    scriptDescription: string;
    scenes: ScriptScene[];
    thumbnailPrompts: string[];
    suggestedTitles: string[];
};
