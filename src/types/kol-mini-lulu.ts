export type CharacterId = 'mini' | 'lulu' | 'both';

export interface Scene {
    id: string;
    character: CharacterId;
    action: string;
    dialogue: string;
    visual_prompt?: string;
    image_url?: string;
    audio_url?: string;
    video_url?: string;
    duration?: number;
}

export interface SeoData {
    title: string;
    description: string;
    hashtags: string[];
    keywords: string[];
}

export interface MiniLuluProject {
    id: string;
    user_id: string;
    title: string;
    concept_image_url: string | null;
    current_step: number;
    state: Partial<MiniLuluState>;
    created_at: string;
    updated_at: string;
}

export interface MiniLuluState {
    // Persistence & Projects
    projectId: string | null;
    projects: MiniLuluProject[];
    isLoadingProjects: boolean;
    isSaving: boolean;

    // Navigation
    currentStep: number;

    // Concept (Step 1)
    selectedTemplateId: string | null;
    customPrompt: string;
    isCustom: boolean;

    // Casting (Step 2)
    selectedCharacter: CharacterId | null;
    customCharacter: { name: string; prompt: string } | null;
    miniConfig: { prompt: string; image: string | null };
    luluConfig: { prompt: string; image: string | null };
    conceptImageUrl: string | null;

    // Script (Step 3)
    selectedTone: 'funny' | 'emotional' | 'action';
    script: Scene[];
    isGeneratingScript: boolean;
    isGeneratingIdea: boolean;

    // Studio (Step 4)
    isGeneratingImages: Record<string, boolean>; // sceneId -> boolean
    isGeneratingVideo: Record<string, boolean>; // sceneId -> boolean

    // Export (Step 5)
    seoData: SeoData | null;

    // Actions
    setCurrentStep: (step: number) => void;
    setTemplate: (id: string | null) => void;
    setCustomPrompt: (prompt: string) => void;
    setCustomCharacter: (char: { name: string; prompt: string } | null) => void;
    setMiniConfig: (config: { prompt?: string; image?: string | null }) => void;
    setLuluConfig: (config: { prompt?: string; image?: string | null }) => void;
    setConceptImageUrl: (url: string | null) => void;
    setSelectedTone: (tone: 'funny' | 'emotional' | 'action') => void;
    setCharacter: (char: CharacterId) => void;
    setScript: (script: Scene[]) => void;
    setIsGeneratingIdea: (loading: boolean) => void;
    setSeoData: (data: SeoData | null) => void;
    updateScene: (id: string, updates: Partial<Scene>) => void;
    reset: () => void;

    // Project Management Actions
    fetchUserProjects: () => Promise<void>;
    saveProject: (title?: string) => Promise<string | null>;
    loadProject: (id: string) => Promise<boolean>;
    deleteProject: (id: string) => Promise<void>;
}

export const extractLuluStateForPersistence = (state: MiniLuluState): Partial<MiniLuluState> => {
    const {
        projectId,
        currentStep,
        selectedTemplateId,
        customPrompt,
        isCustom,
        selectedCharacter,
        customCharacter,
        miniConfig,
        luluConfig,
        conceptImageUrl,
        selectedTone,
        script,
        seoData
    } = state;

    return {
        projectId,
        currentStep,
        selectedTemplateId,
        customPrompt,
        isCustom,
        selectedCharacter,
        customCharacter,
        miniConfig,
        luluConfig,
        conceptImageUrl,
        selectedTone,
        script,
        seoData
    };
};
