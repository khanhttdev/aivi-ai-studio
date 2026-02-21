import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase/client';
import type { POVType, POVScriptResponse, POVScriptRecord, POVScene, POVSection, POVMarketingData } from '@/types/pov-studio';

interface PovStudioState {
    // Current Project State
    currentProject: POVScriptRecord | null;
    currentStep: number;
    povType: POVType;
    productImage: string | null;
    monsterImage: string | null;
    productName: string;
    monsterDescription: string;
    sceneCount: number;
    result: POVScriptResponse | null;
    seoData: POVMarketingData | null;
    coverImage: string | null;

    // Projects Cache
    projects: POVScriptRecord[];
    isLoadingProjects: boolean;

    // Actions
    setPovType: (type: POVType) => void;
    setProductImage: (image: string | null) => void;
    setMonsterImage: (image: string | null) => void;
    setProductName: (name: string) => void;
    setMonsterDescription: (desc: string) => void;
    setSceneCount: (count: number) => void;
    setResult: (result: POVScriptResponse | null) => void;
    setCurrentStep: (step: number) => void;
    setSeoData: (data: POVMarketingData | null) => void;
    setCoverImage: (image: string | null) => void;

    // CRUD Actions
    fetchUserProjects: () => Promise<void>;
    saveProject: (scriptResult: POVScriptResponse) => Promise<string | null>;
    deleteProject: (id: string) => Promise<boolean>;
    loadProject: (id: string) => Promise<boolean>;
    reset: () => void;
}

export const usePovStudioStore = create<PovStudioState>()(
    persist(
        (set, get) => ({
            currentProject: null,
            currentStep: 1,
            povType: 'bacteria',
            productImage: null,
            monsterImage: null,
            productName: '',
            monsterDescription: '',
            sceneCount: 5,
            result: null,
            seoData: null,
            coverImage: null,

            projects: [],
            isLoadingProjects: false,

            setPovType: (type) => set({ povType: type }),
            setProductImage: (image) => set({ productImage: image }),
            setMonsterImage: (image) => set({ monsterImage: image }),
            setProductName: (name) => set({ productName: name }),
            setMonsterDescription: (desc) => set({ monsterDescription: desc }),
            setSceneCount: (count) => set({ sceneCount: count }),
            setResult: (result) => set({ result }),
            setCurrentStep: (step) => {
                set({ currentStep: step });
                const { currentProject } = get();
                if (currentProject) {
                    (supabase as any)
                        .from('pov_scripts')
                        .update({ current_step: step })
                        .eq('id', currentProject.id)
                        .then(() => get().fetchUserProjects());
                }
            },
            setSeoData: (data) => set({ seoData: data }),
            setCoverImage: (image) => set({ coverImage: image }),

            fetchUserProjects: async () => {
                set({ isLoadingProjects: true });
                try {
                    const { data, error } = await supabase
                        .from('pov_scripts')
                        .select('*')
                        .order('updated_at', { ascending: false });

                    if (error) throw error;
                    set({ projects: (data as POVScriptRecord[]) || [] });
                } catch (err) {
                    console.error('Failed to fetch POV projects:', err);
                } finally {
                    set({ isLoadingProjects: false });
                }
            },

            saveProject: async (scriptResult) => {
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return null;

                    const { povType, productName, monsterDescription, sceneCount, currentProject } = get();

                    const projectData = {
                        user_id: user.id,
                        title: scriptResult.title || `POV: ${productName}`,
                        pov_type: povType,
                        product_name: productName,
                        monster_description: monsterDescription,
                        scene_count: sceneCount,
                        script_data: scriptResult.scenes,
                        hook: scriptResult.hook,
                        cta: scriptResult.cta,
                        current_step: get().currentStep,
                        updated_at: new Date().toISOString(),
                    };

                    let res;
                    if (currentProject?.id) {
                        res = await (supabase as any)
                            .from('pov_scripts')
                            .update(projectData)
                            .eq('id', currentProject.id)
                            .select()
                            .single();
                    } else {
                        res = await (supabase as any)
                            .from('pov_scripts')
                            .insert(projectData)
                            .select()
                            .single();
                    }

                    if (res.error) throw res.error;

                    const savedProject = res.data as POVScriptRecord;
                    set({ currentProject: savedProject });
                    get().fetchUserProjects();
                    return savedProject.id;
                } catch (err) {
                    console.error('Failed to save POV project:', err);
                    return null;
                }
            },

            deleteProject: async (id) => {
                try {
                    const { error } = await supabase
                        .from('pov_scripts')
                        .delete()
                        .eq('id', id);

                    if (error) throw error;
                    set(state => ({
                        projects: state.projects.filter(p => p.id !== id)
                    }));
                    return true;
                } catch (err) {
                    console.error('Failed to delete POV project:', err);
                    return false;
                }
            },

            loadProject: async (id) => {
                try {
                    const { data, error } = await (supabase
                        .from('pov_scripts') as any)
                        .select('*')
                        .eq('id', id)
                        .single();

                    if (error) throw error;
                    const project = data as POVScriptRecord;

                    set({
                        currentProject: project,
                        povType: project.pov_type,
                        productName: project.product_name || '',
                        monsterDescription: project.monster_description || '',
                        sceneCount: project.scene_count,
                        result: {
                            title: project.title,
                            scenes: project.script_data,
                            hook: project.hook as POVSection,
                            cta: project.cta as POVSection,
                        },
                        seoData: null, // Reset for new load or fetch if stored separately
                        coverImage: null,
                        currentStep: project.current_step || 1,
                    });
                    return true;
                } catch (err) {
                    console.error('Failed to load POV project:', err);
                    return false;
                }
            },

            reset: () => set({
                currentProject: null,
                currentStep: 1,
                povType: 'bacteria',
                productImage: null,
                monsterImage: null,
                productName: '',
                monsterDescription: '',
                sceneCount: 5,
                result: null,
                seoData: null,
                coverImage: null,
            }),
        }),
        {
            name: 'pov-studio-storage',
            partialize: (state) => ({
                currentStep: state.currentStep,
                povType: state.povType,
                productName: state.productName,
                monsterDescription: state.monsterDescription,
                sceneCount: state.sceneCount,
                result: state.result,
                seoData: state.seoData,
                coverImage: state.coverImage,
            }),
        }
    )
);
