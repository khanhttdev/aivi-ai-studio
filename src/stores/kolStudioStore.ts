import { create } from 'zustand';
import {
    KOLStudioState,
    KOLTheme,
    KOLProfile,
    KOLEntity,
    KOLImageEntity,
    CloneContext,
    TikTokScript,
} from '@/lib/kol/types';

const initialState = {
    // Step 1: Theme
    selectedTheme: null as KOLTheme | null,
    customTheme: '',
    channelPositioning: '',

    // Step 2: Profile
    kolProfile: null as KOLProfile | null,
    kolName: '',
    isGeneratingProfile: false,

    // Step 3: Base Image
    baseKOLImage: null as string | null,
    isGeneratingBase: false,

    // Step 4: Clones
    selectedContexts: [] as CloneContext[],
    generatedClones: [] as KOLImageEntity[],
    isGeneratingClone: false,
    cloneProgress: 0,

    // Step 5: Content
    generatedScript: null as TikTokScript | null,
    isGeneratingScript: false,

    // Current KOL
    currentKOL: null as KOLEntity | null,

    // Navigation
    currentStep: 1,

    // Library
    savedKOLs: [] as KOLEntity[],
    isLoadingLibrary: false,
};

import { persist, createJSONStorage } from 'zustand/middleware';

export const useKOLStudioStore = create<KOLStudioState>()(
    persist(
        (set) => ({
            ...initialState,

            // Step 1 Actions
            setSelectedTheme: (theme: KOLTheme | null) => set({ selectedTheme: theme }),
            setCustomTheme: (theme: string) => set({ customTheme: theme }),
            setChannelPositioning: (positioning: string) => set({ channelPositioning: positioning }),

            // Step 2 Actions
            setKOLProfile: (profile: KOLProfile | null) => set({ kolProfile: profile }),
            setKOLName: (name: string) => set({ kolName: name }),
            setIsGeneratingProfile: (loading: boolean) => set({ isGeneratingProfile: loading }),

            // Step 3 Actions
            setBaseKOLImage: (image: string | null) => set({ baseKOLImage: image }),
            setIsGeneratingBase: (loading: boolean) => set({ isGeneratingBase: loading }),

            // Step 4 Actions
            setSelectedContexts: (contexts: CloneContext[]) => set({ selectedContexts: contexts }),
            addGeneratedClone: (clone: KOLImageEntity) =>
                set((state) => ({ generatedClones: [...state.generatedClones, clone] })),
            setGeneratedClones: (clones: KOLImageEntity[]) => set({ generatedClones: clones }),
            setIsGeneratingClone: (loading: boolean) => set({ isGeneratingClone: loading }),
            setCloneProgress: (progress: number) => set({ cloneProgress: progress }),

            // Step 5 Actions
            setGeneratedScript: (script: TikTokScript | null) => set({ generatedScript: script }),
            setIsGeneratingScript: (loading: boolean) => set({ isGeneratingScript: loading }),

            // KOL Actions
            setCurrentKOL: (kol: KOLEntity | null) => set({ currentKOL: kol }),

            // Navigation
            setCurrentStep: (step: number) => set({ currentStep: step }),

            // Library Actions
            setSavedKOLs: (kols: KOLEntity[]) => set({ savedKOLs: kols }),
            addSavedKOL: (kol: KOLEntity) => set((state) => ({ savedKOLs: [kol, ...state.savedKOLs] })),
            updateSavedKOL: (kol: KOLEntity) =>
                set((state) => ({
                    savedKOLs: state.savedKOLs.map((k) => (k.id === kol.id ? kol : k)),
                })),
            deleteSavedKOL: (id: string) =>
                set((state) => ({ savedKOLs: state.savedKOLs.filter((k) => k.id !== id) })),
            setIsLoadingLibrary: (loading: boolean) => set({ isLoadingLibrary: loading }),

            // Reset
            reset: () => set(initialState),
        }),
        {
            name: 'kol-studio-storage', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
            partialize: (state) => ({
                // Selectively persist fields if needed, or persist all
                selectedTheme: state.selectedTheme,
                customTheme: state.customTheme,
                channelPositioning: state.channelPositioning,
                kolProfile: state.kolProfile,
                kolName: state.kolName,
                baseKOLImage: state.baseKOLImage,
                currentKOL: state.currentKOL,
                generatedClones: state.generatedClones,
                generatedScript: state.generatedScript,
                // Don't persist loading states usually
            }),
        }
    )
);
