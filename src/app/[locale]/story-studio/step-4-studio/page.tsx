'use client';

import { useAiviStoryStore } from "@/stores/useAiviStoryStore";
import { useRouter } from "next/navigation";
import { useState } from 'react';
import { AnimatePresence } from "framer-motion";
import { useTranslations } from 'next-intl';
import { VoiceSettingsPanel } from './components/VoiceSettingsPanel';
import { ScriptPanel } from './components/ScriptPanel';
import { VisualBoard } from './components/VisualBoard';
import { StudioToolbar } from './components/StudioToolbar';
import { StudioLoading } from './components/StudioLoading';
import { IdeaSelector } from './components/IdeaSelector';
import { useStoryGeneration } from './hooks/useStoryGeneration';

export default function Step4Studio() {
    const router = useRouter();
    const t = useTranslations('StoryStudio.Step4');
    const [isGeneratingAll, setIsGeneratingAll] = useState(false);
    const [isGeneratingAllAudio, setIsGeneratingAllAudio] = useState(false);
    const [showVoiceSettings, setShowVoiceSettings] = useState(false);

    const {
        script, isGeneratingScript,
        character1, character2,
        sceneImages,
        isGeneratingScene,
        sceneAudios,
        isGeneratingAudio,
        narratorVoice, character1Voice, character2Voice, setVoiceAssignments,
        mainTopic,
        contentIdeas,
        selectedIdea, setSelectedIdea,
        isGeneratingIdeas,
        isSaving
    } = useAiviStoryStore();

    const {
        generateFrame,
        generateVoiceAudio,
        generateAllFrames,
        generateAllAudio,
        saveAndExport
    } = useStoryGeneration();

    // -- Render: Loading State --
    if (isGeneratingIdeas && contentIdeas.length === 0) {
        return <StudioLoading type="analyzing" t={t} />;
    }

    // -- Render: Phase A - Select Idea --
    if (!selectedIdea) {
        return <IdeaSelector contentIdeas={contentIdeas} onSelectIdea={setSelectedIdea} t={t} />;
    }

    // -- Render: Phase B - Loading Script --
    if (isGeneratingScript && !script) {
        return <StudioLoading type="writing" t={t} />;
    }

    // -- Render: Phase C - Production Studio --
    return (
        <div className="flex-1 flex flex-col h-full max-w-[1920px] mx-auto w-full overflow-hidden relative">
            {/* Toolbar */}
            <StudioToolbar
                title={script?.title}
                frameCount={script?.frames?.length || 0}
                mainTopic={mainTopic}
                showVoiceSettings={showVoiceSettings}
                setShowVoiceSettings={setShowVoiceSettings}
                isGeneratingAll={isGeneratingAll}
                isGeneratingAllAudio={isGeneratingAllAudio}
                isSaving={isSaving}
                onGenerateAll={() => generateAllFrames(setIsGeneratingAll)}
                onGenerateAllAudio={() => generateAllAudio(setIsGeneratingAllAudio)}
                onDirectorMode={() => router.push('/story-studio/step-6-director')}
                onExport={saveAndExport}
                t={t}
            />

            {/* Voice Settings Panel */}
            <AnimatePresence>
                {showVoiceSettings && (
                    <VoiceSettingsPanel
                        show={showVoiceSettings}
                        onClose={() => setShowVoiceSettings(false)}
                        narratorVoice={narratorVoice}
                        character1Voice={character1Voice}
                        character2Voice={character2Voice}
                        character1Name={character1?.name || t('char1_default')}
                        character2Name={character2?.name || t('char2_default')}
                        onVoiceChange={setVoiceAssignments}
                        t={t}
                    />
                )}
            </AnimatePresence>

            {/* Main Workspace */}
            <div className="flex-1 flex flex-col lg:flex-row h-full pt-16">
                {/* Script Panel (Left) */}
                <ScriptPanel
                    scriptDescription={script?.scriptDescription || ""}
                    frames={script?.frames || []}
                    sceneImages={sceneImages}
                    sceneAudios={sceneAudios}
                    t={t}
                />

                {/* Visual Board (Centre/Right) */}
                <VisualBoard
                    frames={script?.frames || []}
                    sceneImages={sceneImages}
                    sceneAudios={sceneAudios}
                    isGeneratingScene={isGeneratingScene}
                    isGeneratingAudio={isGeneratingAudio}
                    onGenerateFrame={generateFrame}
                    onGenerateVoice={generateVoiceAudio}
                    t={t}
                />
            </div >
        </div >
    );
}
