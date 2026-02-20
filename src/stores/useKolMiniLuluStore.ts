import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { indexedDBStorage } from '@/lib/storage';
import { MiniLuluState, MiniLuluProject, CharacterId, Scene, SeoData, extractLuluStateForPersistence } from '@/types/kol-mini-lulu';
import { supabase } from '@/lib/supabase/client';

export const useKolMiniLuluStore = create<MiniLuluState>()(
    persist(
        (set: any, get: any) => ({
            // Initial State
            projectId: null as string | null,
            projects: [] as MiniLuluProject[],
            isLoadingProjects: false as boolean,
            isSaving: false as boolean,
            currentStep: 1,
            selectedCategory: null as string | null,
            selectedTemplateId: null as string | null,
            customPrompt: '',
            isCustom: false as boolean,
            selectedCharacter: 'both' as CharacterId | null,
            customCharacter: null as { name: string; prompt: string } | null,
            miniConfig: { prompt: '' as string, image: null as string | null },
            luluConfig: { prompt: '' as string, image: null as string | null },
            conceptImageUrl: null as string | null,

            // Marketing / Booking
            productInfo: {
                enabled: false as boolean,
                name: '' as string,
                usp: '' as string,
                image: null as string | null,
                type: 'general' as 'general' | 'fashion' // Default to general
            },

            selectedTone: 'funny' as 'funny' | 'emotional' | 'action',
            seoData: null as SeoData | null,
            script: [] as Scene[],
            isGeneratingScript: false as boolean,
            isGeneratingIdea: false as boolean,
            isGeneratingImages: {} as Record<string, boolean>,
            isGeneratingVideo: {} as Record<string, boolean>,

            // Actions
            setCurrentStep: (step: number) => set({ currentStep: step }),

            setSelectedCategory: (cat: string | null) => set({ selectedCategory: cat }),

            setTemplate: (id: string | null) => set({
                selectedTemplateId: id,
                isCustom: false,
            }),

            setCustomPrompt: (prompt: string) => set({
                customPrompt: prompt,
                selectedTemplateId: null,
                isCustom: true
            }),

            setCharacter: (char: any) => set({ selectedCharacter: char }),

            setCustomCharacter: (char: any) => set({ customCharacter: char }),

            setMiniConfig: (config: any) => set((state: any) => ({ miniConfig: { ...state.miniConfig, ...config } })),
            setLuluConfig: (config: any) => set((state: any) => ({ luluConfig: { ...state.luluConfig, ...config } })),

            setConceptImageUrl: (url: string | null) => set({ conceptImageUrl: url }),

            setProductInfo: (info: any) => set((state: any) => ({ productInfo: { ...state.productInfo, ...info } })),

            setSelectedTone: (tone: any) => set({ selectedTone: tone }),

            setScript: (script: any[]) => set({ script }),

            setSeoData: (data: any) => set({ seoData: data }),

            setIsGeneratingIdea: (loading: boolean) => set({ isGeneratingIdea: loading }),

            updateScene: (id: string, updates: any) => set((state: any) => ({
                script: state.script.map((s: any) => s.id === id ? { ...s, ...updates } : s)
            })),

            setGeneratedImage: (sceneId: string, url: string) => set((state: any) => ({
                script: state.script.map((s: any) => s.id === sceneId ? { ...s, image_url: url } : s)
            })),

            setGeneratedVideo: (sceneId: string, url: string) => set((state: any) => ({
                script: state.script.map((s: any) => s.id === sceneId ? { ...s, video_url: url } : s)
            })),

            reset: () => set({
                projectId: null,
                currentStep: 1,
                selectedCategory: null,
                selectedTemplateId: null,
                customPrompt: '',
                isCustom: false,
                selectedCharacter: 'both',
                customCharacter: null,
                miniConfig: { prompt: '', image: null },
                luluConfig: { prompt: '', image: null },
                conceptImageUrl: null,
                selectedTone: 'funny',
                seoData: null,
                script: [],
                isGeneratingScript: false,
                isGeneratingIdea: false,
                isGeneratingImages: {},
                isGeneratingVideo: {},
                isSaving: false
            }),

            // Project Management Actions
            fetchUserProjects: async () => {
                set({ isLoadingProjects: true });
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;

                    const { data, error } = await (supabase.from('lulu_projects') as any)
                        .select('*')
                        .eq('user_id', user.id)
                        .order('updated_at', { ascending: false });

                    if (error) throw error;
                    set({ projects: data || [] });
                } catch (error) {
                    console.error('Error fetching Lulu projects:', error);
                } finally {
                    set({ isLoadingProjects: false });
                }
            },

            saveProject: async (title?: string) => {
                const state = get();
                if (state.isSaving) return state.projectId;

                set({ isSaving: true });
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) throw new Error('User not authenticated');

                    const pid = state.projectId;
                    const persistenceState = extractLuluStateForPersistence(state);

                    // We use title if provided, otherwise fallback to existing title or prompt preview
                    const projectTitle = title || state.customPrompt || state.selectedTemplateId || 'Untitled Mimi & Lulu';

                    if (pid) {
                        // Update
                        const { error } = await (supabase.from('lulu_projects') as any)
                            .update({
                                title: projectTitle,
                                current_step: state.currentStep,
                                concept_image_url: state.conceptImageUrl,
                                state: persistenceState,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', pid);

                        if (error) throw error;
                        return pid;
                    } else {
                        // Create
                        const { data, error } = await (supabase.from('lulu_projects') as any)
                            .insert({
                                user_id: user.id,
                                title: projectTitle,
                                current_step: state.currentStep,
                                concept_image_url: state.conceptImageUrl,
                                state: persistenceState
                            })
                            .select()
                            .single();

                        if (error) throw error;
                        set({ projectId: data.id });
                        return data.id;
                    }
                } catch (error) {
                    console.error('Error saving Lulu project:', error);
                    return null;
                } finally {
                    set({ isSaving: false });
                }
            },

            loadProject: async (id: string) => {
                set({ isSaving: true }); // Using isSaving as a global loading indicator for loads too
                try {
                    const { data, error } = await (supabase.from('lulu_projects') as any)
                        .select('*')
                        .eq('id', id)
                        .single();

                    if (error) throw error;

                    // Merge state
                    set({
                        ...data.state,
                        projectId: data.id,
                        currentStep: data.current_step,
                        conceptImageUrl: data.concept_image_url
                    });
                    return true;
                } catch (error) {
                    console.error('Error loading Lulu project:', error);
                    return false;
                } finally {
                    set({ isSaving: false });
                }
            },

            deleteProject: async (id: string) => {
                try {
                    const { error } = await (supabase.from('lulu_projects') as any)
                        .delete()
                        .eq('id', id);

                    if (error) throw error;
                    set((state: any) => ({
                        projects: state.projects.filter((p: any) => p.id !== id),
                        projectId: state.projectId === id ? null : state.projectId
                    }));
                } catch (error) {
                    console.error('Error deleting Lulu project:', error);
                    throw error;
                }
            }
        }),
        {
            name: 'aivi-mini-lulu-storage',
            storage: createJSONStorage(() => indexedDBStorage),
            partialize: (state: any) => extractLuluStateForPersistence(state),
        }
    )
);
