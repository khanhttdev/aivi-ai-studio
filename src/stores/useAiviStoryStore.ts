/**
 * AIVI Story Store
 * Main store entry point - composes from modular actions
 * Types: ./story/types.ts | Actions: ./story/actions.ts
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { indexedDBStorage } from '@/lib/storage';
import { StoryState, extractStateForPersistence } from './story/types';
import { createPersistenceActions, createDashboardActions } from './story/actions';

// Re-export types for consumers
export type { Character, StoryState } from './story/types';

export const useAiviStoryStore = create<StoryState>()(
    persist(
        (set, get) => ({
            // === Initial State ===
            currentStep: 1,
            storyId: null,
            mainTopic: '',
            plotSeeds: [],
            isGeneratingSeeds: false,
            selectedPlot: null,
            character1: null,
            character2: null,
            backgroundRef: null,
            contentIdeas: [],
            selectedIdea: null,
            script: null,
            isGeneratingIdeas: false,
            isGeneratingScript: false,
            sceneImages: {},
            isGeneratingScene: {},
            sceneAudios: {},
            isGeneratingAudio: {},
            backgroundMusic: null,
            isGeneratingMusic: false,
            narratorVoice: 'aoede',
            character1Voice: 'charon',
            character2Voice: 'kore',
            isSaving: false,
            isOpeningStory: false,

            // === Simple Setters ===
            setCurrentStep: (step) => set({ currentStep: step }),
            setMainTopic: (topic) => set({ mainTopic: topic }),
            setPlotSeeds: (seeds) => set({ plotSeeds: seeds }),
            setIsGeneratingSeeds: (loading) => set({ isGeneratingSeeds: loading }),

            setSelectedPlot: (plot) => {
                const currentPlot = get().selectedPlot;
                if (currentPlot !== plot) {
                    get().resetDependentData(2);
                }
                set({ selectedPlot: plot });
            },

            resetDependentData: (fromStep: number) => {
                const updates: Partial<StoryState> = {};
                if (fromStep <= 1) {
                    updates.plotSeeds = [];
                    updates.selectedPlot = null;
                }
                if (fromStep <= 2) {
                    updates.character1 = null;
                    updates.character2 = null;
                    updates.backgroundRef = null;
                }
                if (fromStep <= 3) {
                    updates.contentIdeas = [];
                    updates.selectedIdea = null;
                    updates.script = null;
                    updates.sceneImages = {};
                    updates.sceneAudios = {};
                    updates.backgroundMusic = null;
                }
                set(updates);
            },

            setCharacter1: (char) => set({ character1: char }),
            setCharacter2: (char) => set({ character2: char }),
            setBackgroundRef: (bg) => set({ backgroundRef: bg }),
            setContentIdeas: (ideas) => set({ contentIdeas: ideas }),
            setSelectedIdea: (idea) => set({ selectedIdea: idea }),
            setScript: (script) => set({ script }),
            setIsGeneratingIdeas: (loading) => set({ isGeneratingIdeas: loading }),
            setIsGeneratingScript: (loading) => set({ isGeneratingScript: loading }),

            setSceneImage: (frameId, url) => set((state) => ({
                sceneImages: { ...state.sceneImages, [frameId]: url }
            })),
            setGeneratingScene: (frameId, loading) =>
                set((state) => ({ isGeneratingScene: { ...state.isGeneratingScene, [frameId]: loading } })),

            setSceneAudio: (frameId, url) =>
                set((state) => ({ sceneAudios: { ...state.sceneAudios, [frameId]: url } })),
            setGeneratingAudio: (frameId, loading) =>
                set((state) => ({ isGeneratingAudio: { ...state.isGeneratingAudio, [frameId]: loading } })),

            setBackgroundMusic: (url) => set({ backgroundMusic: url }),
            setIsGeneratingMusic: (loading) => set({ isGeneratingMusic: loading }),

            setVoiceAssignments: (narrator, c1, c2) => set({
                narratorVoice: narrator,
                character1Voice: c1,
                character2Voice: c2
            }),

            setStoryId: (id) => set({ storyId: id }),

            reset: () => set({
                currentStep: 1,
                storyId: null,
                mainTopic: '',
                plotSeeds: [],
                selectedPlot: null,
                character1: null,
                character2: null,
                backgroundRef: null,
                contentIdeas: [],
                selectedIdea: null,
                script: null,
                sceneImages: {},
                isGeneratingScene: {},
                sceneAudios: {},
                isGeneratingAudio: {},
                backgroundMusic: null,
                isGeneratingMusic: false,
                narratorVoice: 'aoede',
                character1Voice: 'charon',
                character2Voice: 'kore',
                isSaving: false,
                isOpeningStory: false,
            }),

            // === Composed Actions ===
            ...createPersistenceActions(set, get),

            // Dashboard Data
            stories: [],
            isLoadingStories: false,
            characterLibrary: [],
            isLoadingLibrary: false,
            ...createDashboardActions(set, get),
        }),
        {
            name: 'aivi-story-storage',
            storage: createJSONStorage(() => indexedDBStorage),
            partialize: (state) => extractStateForPersistence(state),
        }
    )
);
