import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAiviStoryStore } from "@/stores/useAiviStoryStore";
import { generateContentIdeas, generateViralScript, generateSingleFrameImage, generateCommonBackground, generateVoice } from "@/lib/gemini/story-service";
import { toast } from "sonner";

export function useStoryGeneration() {
    const router = useRouter();
    const store = useAiviStoryStore();
    const {
        script, setScript, setIsGeneratingScript, isGeneratingScript,
        character1, character2, backgroundRef, setBackgroundRef,
        setGeneratingScene, setSceneImage,
        setGeneratingAudio, setSceneAudio,
        narratorVoice, character1Voice, character2Voice,
        mainTopic,
        contentIdeas, setContentIdeas,
        selectedIdea,
        isGeneratingIdeas, setIsGeneratingIdeas,
        saveStory
    } = store;

    // -- 1. Generate Ideas --
    useEffect(() => {
        if (!character1 || !character2 || !mainTopic) {
            router.push('/story-studio/step-1-spark');
            return;
        }

        const initIdeas = async () => {
            if (contentIdeas.length === 0 && !isGeneratingIdeas && !selectedIdea) {
                setIsGeneratingIdeas(true);
                try {
                    const ideas = await generateContentIdeas(
                        character1.image,
                        character2.image,
                        mainTopic,
                        useAiviStoryStore.getState().selectedPlot || "",
                        character1.role,
                        character2.role
                    );
                    if (ideas && ideas.length > 0) {
                        setContentIdeas(ideas);
                    }
                } catch (e) {
                    console.error("Failed to generate ideas", e);
                } finally {
                    setIsGeneratingIdeas(false);
                }
            }
        };

        initIdeas();
    }, [contentIdeas.length, isGeneratingIdeas, mainTopic, character1, character2, router, setContentIdeas, setIsGeneratingIdeas, selectedIdea]);


    // -- 2. Generate Script --
    useEffect(() => {
        const initScript = async () => {
            if (selectedIdea && !script && !isGeneratingScript) {
                setIsGeneratingScript(true);
                try {
                    // Default 6 frames
                    const result = await generateViralScript(
                        character1!.image,
                        character2!.image,
                        mainTopic,
                        selectedIdea,
                        character1!.role,
                        character2!.role,
                        6
                    );
                    setScript(result);

                    // Also auto-generate background if missing
                    if (!backgroundRef) {
                        const bg = await generateCommonBackground(result.scriptDescription, mainTopic);
                        if (bg) setBackgroundRef(bg);
                    }

                } catch (e) {
                    console.error("Failed to script", e);
                } finally {
                    setIsGeneratingScript(false);
                }
            }
        };
        initScript();
    }, [selectedIdea, script, isGeneratingScript, character1, character2, mainTopic, setScript, setIsGeneratingScript, backgroundRef, setBackgroundRef]);


    // -- Actions --

    const generateFrame = useCallback(async (frameId: number, imagePrompt: string) => {
        if (!character1 || !character2 || !backgroundRef) return;

        setGeneratingScene(frameId, true);
        try {
            const img = await generateSingleFrameImage(
                character1.image,
                character2.image,
                backgroundRef,
                imagePrompt,
                character1.role,
                character2.role
            );
            if (img) {
                setSceneImage(frameId, img);
            }
        } catch (e) {
            console.error("Frame gen failed", e);
        } finally {
            setGeneratingScene(frameId, false);
        }
    }, [character1, character2, backgroundRef, setGeneratingScene, setSceneImage]);

    const generateVoiceAudio = useCallback(async (frameId: number, dialogue: string, speaker: number) => {
        if (!dialogue) return;

        setGeneratingAudio(frameId, true);
        try {
            let voiceName = narratorVoice;
            if (speaker === 1) voiceName = character1Voice;
            else if (speaker === 2) voiceName = character2Voice;

            const audioUrl = await generateVoice(dialogue, voiceName);
            if (audioUrl) {
                setSceneAudio(frameId, audioUrl);
            }
        } catch (e) {
            console.error("Voice gen failed", e);
            toast.error("Voice generation failed. Please try again.");
        } finally {
            setGeneratingAudio(frameId, false);
        }
    }, [narratorVoice, character1Voice, character2Voice, setGeneratingAudio, setSceneAudio]);

    const generateAllFrames = useCallback(async (setIsGeneratingAll: (v: boolean) => void) => {
        if (!script || !character1 || !character2 || !backgroundRef) return;

        setIsGeneratingAll(true);
        // Mark all as generating visually
        script.frames.forEach(f => setGeneratingScene(f.frameId, true));

        try {
            await Promise.all(script.frames.map(async (frame) => {
                try {
                    const img = await generateSingleFrameImage(
                        character1.image,
                        character2.image,
                        backgroundRef,
                        frame.imagePrompt,
                        character1.role,
                        character2.role
                    );
                    if (img) {
                        setSceneImage(frame.frameId, img);
                    }
                } catch (e) {
                    console.error(`Failed to generate frame ${frame.frameId}`, e);
                } finally {
                    setGeneratingScene(frame.frameId, false);
                }
            }));
        } catch (e) {
            console.error("Generate All failed", e);
        } finally {
            setIsGeneratingAll(false);
        }
    }, [script, character1, character2, backgroundRef, setGeneratingScene, setSceneImage]);

    const generateAllAudio = useCallback(async (setIsGeneratingAllAudio: (v: boolean) => void) => {
        if (!script) return;

        setIsGeneratingAllAudio(true);
        const framesToGen = script.frames.filter(frame => !!frame.dialogue);
        framesToGen.forEach(f => setGeneratingAudio(f.frameId, true));

        try {
            await Promise.all(framesToGen.map(async (frame) => {
                try {
                    let voiceName = narratorVoice;
                    if (frame.speaker === 1) voiceName = character1Voice;
                    else if (frame.speaker === 2) voiceName = character2Voice;

                    const audioUrl = await generateVoice(frame.dialogue, voiceName);
                    if (audioUrl) {
                        setSceneAudio(frame.frameId, audioUrl);
                    }
                } catch (e) {
                    console.error(`Failed to generate audio for frame ${frame.frameId}`, e);
                } finally {
                    setGeneratingAudio(frame.frameId, false);
                }
            }));
            toast.success("Audio generation completed!");
        } catch (e) {
            console.error("Generate All Audio failed", e);
            toast.error("Failed to generate some audio files");
        } finally {
            setIsGeneratingAllAudio(false);
        }
    }, [script, narratorVoice, character1Voice, character2Voice, setGeneratingAudio, setSceneAudio]);

    const saveAndExport = useCallback(async () => {
        try {
            await saveStory();
            router.push('/story-studio/step-5-export');
        } catch (e) {
            console.error("Save process encountered an error", e);
        }
    }, [saveStory, router]);

    return {
        generateFrame,
        generateVoiceAudio,
        generateAllFrames,
        generateAllAudio,
        saveAndExport
    };
}
