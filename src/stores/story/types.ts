/**
 * Story Store - Type definitions
 * Extracted from useAiviStoryStore.ts to reduce file size
 */

import { ContentIdea, ScriptResult } from '@/lib/gemini/types';
import { Story } from '@/types/story';

export interface Character {
    role: string;  // 'Protagonist', 'Antagonist'
    image: string; // base64 or URL
    name: string;
}

export interface StoryState {
    // Navigation
    currentStep: number;
    storyId: string | null;

    // Step 1: Spark
    mainTopic: string;
    plotSeeds: string[];
    isGeneratingSeeds: boolean;

    // Step 2: Crossroads
    selectedPlot: string | null;

    // Step 3: Casting
    character1: Character | null;
    character2: Character | null;
    backgroundRef: string | null;

    // Step 4: Logic / Scripting
    contentIdeas: ContentIdea[];
    selectedIdea: ContentIdea | null;
    script: ScriptResult | null;
    isGeneratingIdeas: boolean;
    isGeneratingScript: boolean;

    sceneImages: Record<number, string>;
    isGeneratingScene: Record<number, boolean>;

    // Audio / Voice over
    sceneAudios: Record<number, string>;
    isGeneratingAudio: Record<number, boolean>;

    // Voice assignment
    narratorVoice: string;
    character1Voice: string;
    character2Voice: string;

    // Background Music
    backgroundMusic: string | null;
    isGeneratingMusic: boolean;

    // Actions
    setCurrentStep: (step: number) => void;
    setMainTopic: (topic: string) => void;
    setPlotSeeds: (seeds: string[]) => void;
    setIsGeneratingSeeds: (loading: boolean) => void;
    setSelectedPlot: (plot: string) => void;
    setCharacter1: (char: Character | null) => void;
    setCharacter2: (char: Character | null) => void;
    setBackgroundRef: (bg: string | null) => void;
    setContentIdeas: (ideas: ContentIdea[]) => void;
    setSelectedIdea: (idea: ContentIdea | null) => void;
    setScript: (script: ScriptResult | null) => void;
    setIsGeneratingIdeas: (loading: boolean) => void;
    setIsGeneratingScript: (loading: boolean) => void;
    setSceneImage: (frameId: number, url: string) => void;
    setGeneratingScene: (frameId: number, loading: boolean) => void;
    setSceneAudio: (frameId: number, url: string) => void;
    setGeneratingAudio: (frameId: number, loading: boolean) => void;
    setBackgroundMusic: (url: string | null) => void;
    setIsGeneratingMusic: (loading: boolean) => void;
    setVoiceAssignments: (narrator: string, c1: string, c2: string) => void;
    reset: () => void;
    resetDependentData: (fromStep: number) => void;

    // Persistence Actions
    isSaving: boolean;
    isOpeningStory: boolean;
    saveStory: () => Promise<void>;
    loadStory: (id: string) => Promise<boolean>;
    deleteStory: (id: string) => Promise<void>;
    setStoryId: (id: string | null) => void;

    // Dashboard
    stories: Story[];
    isLoadingStories: boolean;
    fetchUserStories: () => Promise<void>;

    // Character Library
    characterLibrary: Character[];
    isLoadingLibrary: boolean;
    saveCharacterToLibrary: (char: Character) => Promise<void>;
    fetchCharacterLibrary: () => Promise<void>;
}

/**
 * Extract state for persistence (DB and LocalStorage)
 */
export const extractStateForPersistence = (state: StoryState) => ({
    currentStep: state.currentStep,
    storyId: state.storyId,
    mainTopic: state.mainTopic,
    plotSeeds: state.plotSeeds,
    selectedPlot: state.selectedPlot,
    character1: state.character1,
    character2: state.character2,
    backgroundRef: state.backgroundRef,
    contentIdeas: state.contentIdeas,
    selectedIdea: state.selectedIdea,
    script: state.script,
    sceneImages: state.sceneImages,
    sceneAudios: state.sceneAudios,
    backgroundMusic: state.backgroundMusic,
    narratorVoice: state.narratorVoice,
    character1Voice: state.character1Voice,
    character2Voice: state.character2Voice,
});
