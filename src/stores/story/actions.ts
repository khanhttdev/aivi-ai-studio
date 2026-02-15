/**
 * Story Store - Persistence actions (save, load, delete)
 * Extracted from useAiviStoryStore.ts to reduce file size
 */

import type { StoryState, Character } from './types';
import { extractStateForPersistence } from './types';

type SetFn = (partial: Partial<StoryState> | ((state: StoryState) => Partial<StoryState>)) => void;
type GetFn = () => StoryState;

/**
 * Create persistence-related actions for the story store
 */
export const createPersistenceActions = (set: SetFn, get: GetFn) => ({
    saveStory: async () => {
        set({ isSaving: true });
        try {
            const { supabase, uploadBase64File } = await import('@/lib/supabase/client');
            const state = get();

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.warn("User not logged in, cannot save story");
                set({ isSaving: false });
                return;
            }

            // 1. Upload Base64 Assets to Storage
            const updatedSceneImages = { ...state.sceneImages };
            const updatedSceneAudios = { ...state.sceneAudios };
            let updatedBackgroundMusic = state.backgroundMusic;
            let hasUploadUpdates = false;

            const allUploadPromises: Promise<void>[] = [];

            // Images
            Object.entries(updatedSceneImages).forEach(([key, url]) => {
                const frameId = Number(key);
                if (url && url.startsWith('data:')) {
                    allUploadPromises.push((async () => {
                        try {
                            const { publicUrl } = await uploadBase64File(url, `scene-${frameId}-${Date.now()}`);
                            updatedSceneImages[frameId] = publicUrl;
                            hasUploadUpdates = true;
                        } catch (e) {
                            console.error(`Failed to upload image for scene ${frameId}`, e);
                        }
                    })());
                }
            });

            // Audios
            Object.entries(updatedSceneAudios).forEach(([key, url]) => {
                const frameId = Number(key);
                if (url && url.startsWith('data:')) {
                    allUploadPromises.push((async () => {
                        try {
                            const { publicUrl } = await uploadBase64File(url, `audio-${frameId}-${Date.now()}`);
                            updatedSceneAudios[frameId] = publicUrl;
                            hasUploadUpdates = true;
                        } catch (e) {
                            console.error(`Failed to upload audio for scene ${frameId}`, e);
                        }
                    })());
                }
            });

            // Background Music
            if (updatedBackgroundMusic && updatedBackgroundMusic.startsWith('data:')) {
                allUploadPromises.push((async () => {
                    try {
                        const { publicUrl } = await uploadBase64File(updatedBackgroundMusic!, `bg-music-${Date.now()}`);
                        updatedBackgroundMusic = publicUrl;
                        hasUploadUpdates = true;
                    } catch (e) {
                        console.error(`Failed to upload background music`, e);
                    }
                })());
            }

            if (allUploadPromises.length > 0) {
                await Promise.all(allUploadPromises);
            }

            if (hasUploadUpdates) {
                set({
                    sceneImages: updatedSceneImages,
                    sceneAudios: updatedSceneAudios,
                    backgroundMusic: updatedBackgroundMusic
                });
            }

            // Prepare state dump
            const stateToSave = extractStateForPersistence({
                ...state,
                sceneImages: updatedSceneImages,
                sceneAudios: updatedSceneAudios,
                backgroundMusic: updatedBackgroundMusic
            });

            // 2. Upsert Story Record
            const storyData = {
                user_id: user.id,
                title: state.script?.title || state.mainTopic || 'Untitled Story',
                genre: 'General',
                tone: 'Neutral',
                plot_seed: state.selectedPlot,
                updated_at: new Date().toISOString(),
                status: 'draft',
                state_dump: stateToSave
            };

            let currentStoryId = state.storyId;

            if (currentStoryId) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { error, count } = await (supabase.from('aivi_stories') as any)
                    .update(storyData)
                    .eq('id', currentStoryId)
                    .select('id', { count: 'exact' });

                if (error) throw error;
                if (count === 0) currentStoryId = null;
            }

            if (!currentStoryId) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data, error } = await (supabase.from('aivi_stories') as any)
                    .insert([storyData])
                    .select()
                    .single();
                if (error) throw error;
                currentStoryId = data.id;
                set({ storyId: currentStoryId });
            }

            // 3. Upsert Scenes
            if (state.script && state.script.frames && currentStoryId) {
                const scenesData = state.script.frames.map((frame, index) => ({
                    story_id: currentStoryId,
                    order_index: index,
                    content: frame.dialogue,
                    visual_prompt: frame.videoPrompt,
                    image_url: updatedSceneImages[frame.frameId] || null,
                }));

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (supabase.from('aivi_scenes') as any).delete().eq('story_id', currentStoryId);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { error: sceneError } = await (supabase.from('aivi_scenes') as any).insert(scenesData);
                if (sceneError) throw sceneError;
            }

            console.log("Story saved successfully:", currentStoryId);
        } catch (error: unknown) {
            console.error('Save story failed:', error);
            const message = error instanceof Error ? error.message : (typeof error === 'string' ? error : JSON.stringify(error));
            throw new Error(message || "Unknown save error");
        } finally {
            set({ isSaving: false });
        }
    },

    loadStory: async (id: string) => {
        set({ isOpeningStory: true });
        try {
            const { supabase } = await import('@/lib/supabase/client');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase.from('aivi_stories') as any)
                .select('state_dump')
                .eq('id', id)
                .single();

            if (error || !data) throw error || new Error('Story not found');

            if (data.state_dump) {
                set({
                    ...data.state_dump,
                    storyId: id,
                    isOpeningStory: false
                });
                return true;
            }
            return false;
        } catch (e) {
            console.error("Load story failed", e);
            set({ isOpeningStory: false });
            return false;
        }
    },

    deleteStory: async (id: string) => {
        const { supabase } = await import('@/lib/supabase/client');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('aivi_stories') as any)
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Delete story failed', error);
            throw error;
        }

        set(state => ({
            stories: state.stories.filter(s => s.id !== id)
        }));
    },
});

/**
 * Create dashboard-related actions for the story store
 */
export const createDashboardActions = (set: SetFn, get: GetFn) => ({
    fetchUserStories: async () => {
        set({ isLoadingStories: true });
        const { supabase } = await import('@/lib/supabase/client');

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            set({ isLoadingStories: false, stories: [] });
            return;
        }

        const { data, error } = await supabase
            .from('aivi_stories')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        if (!error && data) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            set({ stories: data as any });
        }
        set({ isLoadingStories: false });
    },

    saveCharacterToLibrary: async (char: Character) => {
        try {
            const { supabase, uploadBase64File } = await import('@/lib/supabase/client');
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            let imageUrl = char.image;
            if (imageUrl.startsWith('data:')) {
                const { publicUrl } = await uploadBase64File(imageUrl, `char-${Date.now()}`);
                imageUrl = publicUrl;
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('aivi_characters') as any).insert({
                user_id: user.id,
                name: char.name,
                image_url: imageUrl,
                description: char.role,
                style_preset: {}
            });

            if (error) throw error;
            get().fetchCharacterLibrary();
        } catch (error) {
            console.error("Failed to save character:", error);
        }
    },

    fetchCharacterLibrary: async () => {
        set({ isLoadingLibrary: true });
        try {
            const { supabase } = await import('@/lib/supabase/client');
            const { data, error } = await supabase
                .from('aivi_characters')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                set({
                    characterLibrary: data.map((d: { name: string; image_url: string; description?: string }) => ({
                        name: d.name,
                        image: d.image_url,
                        role: d.description || 'Character'
                    }))
                });
            }
        } catch (error) {
            console.error("Failed to fetch library:", error);
        } finally {
            set({ isLoadingLibrary: false });
        }
    },
});
