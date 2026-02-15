'use client';

import { useAiviStoryStore, Character } from "@/stores/useAiviStoryStore";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, ArrowRight, User, Wand2, Loader2, Sparkles, Save, BookOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from 'next-intl';
import { useEffect, useState } from "react";
import Image from 'next/image';
import { generateCastingPrompts, generateRealisticActor } from "@/lib/gemini/story-service";
import { toast } from "sonner";
import { m, AnimatePresence } from "framer-motion";

// Simple image uploader helper
const ImageUploader = ({
    label,
    value,
    onChange,
    uploadText,
    aiPrompt,
    onAiGenerate,
    isGenerating,
    aiLabel,
    btnText,
    onSave,
    onLoad
}: {
    label: string,
    value: string | null,
    onChange: (val: string) => void,
    uploadText: string,
    aiPrompt: string,
    onAiGenerate: (prompt: string) => void,
    isGenerating: boolean,
    aiLabel: string,
    btnText: string,
    onSave: () => void,
    onLoad: () => void
}) => {
    const [localPrompt, setLocalPrompt] = useState(aiPrompt);

    useEffect(() => {
        setLocalPrompt(aiPrompt);
    }, [aiPrompt]);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onChange(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex flex-col gap-4 flex-1">
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-widest pl-1">{label}</span>
                    <button onClick={onLoad} className="text-xs flex items-center gap-1 text-[var(--accent-primary)] hover:underline">
                        <BookOpen size={12} />
                        Load from Vault
                    </button>
                </div>

                <div
                    className={cn(
                        "relative aspect-[3/4] upload-zone flex flex-col items-center justify-center overflow-hidden group mb-0",
                        value ? "border-solid border-[var(--accent-primary)]/50" : ""
                    )}
                >
                    {isGenerating ? (
                        <div className="absolute inset-0 z-20 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
                            <Loader2 className="w-10 h-10 animate-spin text-[var(--accent-primary)] mb-2" />
                            <span className="text-xs text-white animate-pulse">Generating Character...</span>
                        </div>
                    ) : null}

                    {value ? (

                        <Image src={value} alt={label} fill unoptimized className="object-cover" />
                    ) : (
                        <div className="flex flex-col items-center text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors pointer-events-none">
                            <Upload className="w-8 h-8 mb-2 opacity-50" />
                            <span className="text-xs text-center px-4">{uploadText}</span>
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFile}
                        disabled={isGenerating}
                    />

                    {value && !isGenerating && (
                        <div className="absolute bottom-2 right-2 flex gap-2">
                            <m.button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onSave();
                                }}
                                className="bg-black/60 backdrop-blur rounded-full p-2 text-white border border-white/20 hover:bg-[var(--accent-primary)] hover:text-black transition-colors"
                                title="Save to Vault"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <Save className="w-4 h-4" />
                            </m.button>
                            <div className="bg-black/60 backdrop-blur rounded-full p-2 text-[var(--success)] border border-[var(--success)]/30">
                                <User className="w-4 h-4" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Control Panel */}
            <div className="glass-card p-4 space-y-3 border-[var(--border)] group/ai">
                <div className="flex items-center gap-2 text-[var(--accent-primary)] mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{aiLabel}</span>
                </div>

                <textarea
                    value={localPrompt}
                    onChange={(e) => setLocalPrompt(e.target.value)}
                    className="w-full bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg p-2 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-primary)] resize-none"
                    rows={3}
                    placeholder="AI character prompt..."
                />

                <m.button
                    onClick={() => onAiGenerate(localPrompt)}
                    disabled={isGenerating || !localPrompt.trim()}
                    className="w-full btn-secondary text-xs py-2 flex items-center justify-center gap-2 hover:bg-[var(--accent-primary)] hover:text-black transition-all"
                    whileHover={!isGenerating && localPrompt.trim() ? { scale: 1.02 } : {}}
                    whileTap={!isGenerating && localPrompt.trim() ? { scale: 0.98 } : {}}
                >
                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                    {btnText}
                </m.button>
            </div>
        </div>
    )
}

function LibraryModal({
    isOpen,
    onClose,
    onSelect
}: {
    isOpen: boolean,
    onClose: () => void,
    onSelect: (char: Character) => void
}) {
    const { characterLibrary, fetchCharacterLibrary, isLoadingLibrary } = useAiviStoryStore();

    useEffect(() => {
        if (isOpen) {
            fetchCharacterLibrary();
        }
    }, [isOpen, fetchCharacterLibrary]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <m.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-[var(--bg-secondary)] border border-[var(--border)] w-full max-w-3xl rounded-2xl overflow-hidden flex flex-col max-h-[80vh]"
                    >
                        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-[var(--accent-primary)]" />
                                Character Vault
                            </h3>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto min-h-[300px]">
                            {isLoadingLibrary ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
                                </div>
                            ) : characterLibrary.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">
                                    <User className="w-12 h-12 mb-4 opacity-20" />
                                    <p>No characters in vault yet.</p>
                                    <p className="text-sm">Generate and save characters to see them here.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {characterLibrary.map((char, idx) => (
                                        <m.div
                                            key={idx}
                                            className="group relative aspect-[3/4] rounded-lg overflow-hidden border border-[var(--border)] cursor-pointer hover:border-[var(--accent-primary)] transition-all"
                                            onClick={() => {
                                                onSelect(char);
                                                onClose();
                                            }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Image src={char.image} alt={char.name} fill unoptimized className="object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                                <p className="font-bold text-white text-sm truncate">{char.name}</p>
                                                <p className="text-xs text-white/70 truncate">{char.role}</p>
                                            </div>
                                        </m.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </m.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export default function Step3Casting() {
    const router = useRouter();
    const t = useTranslations('StoryStudio.Step3');
    const {
        selectedPlot,
        character1, setCharacter1,
        character2, setCharacter2,
        saveStory, isSaving,
        saveCharacterToLibrary
    } = useAiviStoryStore();

    const [aiSuggestions, setAiSuggestions] = useState({ char1Prompt: "", char2Prompt: "" });
    const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
    const [isGenerating1, setIsGenerating1] = useState(false);
    const [isGenerating2, setIsGenerating2] = useState(false);

    const [libraryOpen, setLibraryOpen] = useState(false);
    const [targetCharIndex, setTargetCharIndex] = useState<number | null>(null);

    useEffect(() => {
        if (!selectedPlot) {
            router.push('/story-studio/step-2-crossroads');
            return;
        }

        const fetchPrompts = async () => {
            setIsLoadingPrompts(true);
            try {
                const prompts = await generateCastingPrompts(selectedPlot);
                setAiSuggestions(prompts);
            } catch (e) {
                console.error("Failed to fetch casting prompts", e);
            } finally {
                setIsLoadingPrompts(false);
            }
        };

        fetchPrompts();
    }, [selectedPlot, router]);

    const handleAiGenerate = async (charIndex: number, prompt: string) => {
        if (!prompt) return;

        if (charIndex === 1) setIsGenerating1(true);
        else setIsGenerating2(true);

        try {
            const imageUrl = await generateRealisticActor(prompt);
            if (imageUrl) {
                if (charIndex === 1) {
                    setCharacter1({ image: imageUrl, role: 'Protagonist', name: 'Character 1' });
                } else {
                    setCharacter2({ image: imageUrl, role: 'Deuteragonist', name: 'Character 2' });
                }
                toast.success(t('ai_gen_success'));
            }
        } catch (e) {
            console.error("AI Generation failed", e);
            toast.error("Generation failed. Please try again.");
        } finally {
            if (charIndex === 1) setIsGenerating1(false);
            else setIsGenerating2(false);
        }
    };

    const handleSaveToVault = async (char: Character | null) => {
        if (!char) return;
        toast.promise(saveCharacterToLibrary(char), {
            loading: 'Saving to Vault...',
            success: 'Character saved safely!',
            error: 'Failed to save character'
        });
    };

    const openLibrary = (index: number) => {
        setTargetCharIndex(index);
        setLibraryOpen(true);
    };

    const handleLibrarySelect = (char: Character) => {
        if (targetCharIndex === 1) {
            setCharacter1({ image: char.image, role: 'Protagonist', name: char.name });
        } else {
            setCharacter2({ image: char.image, role: 'Deuteragonist', name: char.name });
        }
    };

    const canProceed = character1?.image && character2?.image;

    const handleNext = async () => {
        if (!canProceed) return;

        try {
            await saveStory();
            router.push('/story-studio/step-4-studio');
        } catch (error) {
            console.error("Save failed, but moving forward for UX", error);
            router.push('/story-studio/step-4-studio');
        }
    };

    return (
        <div className="flex-1 flex flex-col p-8 max-w-6xl mx-auto w-full h-full pb-20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 md:gap-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 btn-ghost rounded-full transition">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">{t('title')}</h2>
                        <p className="text-sm md:text-base text-[var(--text-secondary)]">{t('subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <span className="text-xs font-mono text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 px-2 py-1 rounded uppercase tracking-widest block">{t('step_indicator')}</span>
                    <m.button
                        onClick={handleNext}
                        disabled={!canProceed || isSaving}
                        className="btn-primary flex items-center gap-2"
                        whileHover={canProceed && !isSaving ? { scale: 1.05 } : {}}
                        whileTap={canProceed && !isSaving ? { scale: 0.95 } : {}}
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {isSaving ? "Saving..." : t('btn_continue')}
                        {!isSaving && <ArrowRight className="w-4 h-4" />}
                    </m.button>
                </div>
            </div>

            {isLoadingPrompts && (
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] animate-pulse mb-4 ml-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t('loading_prompts')}
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-8 items-stretch justify-center flex-1">
                {/* Character 1 */}
                <div className="flex-1 card flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-[var(--accent-indigo)]/20 flex items-center justify-center text-[var(--accent-indigo)] font-bold">1</div>
                            <div>
                                <h3 className="font-bold text-[var(--text-primary)]">{t('protagonist')}</h3>
                                <p className="text-xs text-[var(--text-muted)]">{t('main_char_1')}</p>
                            </div>
                        </div>
                    </div>

                    <ImageUploader
                        label={t('reference_photo')}
                        value={character1?.image || null}
                        onChange={(img) => setCharacter1({
                            image: img,
                            role: 'Protagonist',
                            name: 'Character 1'
                        })}
                        uploadText={t('upload_portrait')}
                        aiPrompt={aiSuggestions.char1Prompt}
                        onAiGenerate={(p) => handleAiGenerate(1, p)}
                        isGenerating={isGenerating1}
                        aiLabel={t('ai_suggest')}
                        btnText={t('btn_generate')}
                        onSave={() => handleSaveToVault(character1)}
                        onLoad={() => openLibrary(1)}
                    />
                </div>

                {/* Character 2 */}
                <div className="flex-1 card flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-[var(--accent-purple)]/20 flex items-center justify-center text-[var(--accent-purple)] font-bold">2</div>
                            <div>
                                <h3 className="font-bold text-[var(--text-primary)]">{t('antagonist')}</h3>
                                <p className="text-xs text-[var(--text-muted)]">{t('main_char_2')}</p>
                            </div>
                        </div>
                    </div>

                    <ImageUploader
                        label={t('reference_photo')}
                        value={character2?.image || null}
                        onChange={(img) => setCharacter2({
                            image: img,
                            role: 'Deuteragonist',
                            name: 'Character 2'
                        })}
                        uploadText={t('upload_portrait')}
                        aiPrompt={aiSuggestions.char2Prompt}
                        onAiGenerate={(p) => handleAiGenerate(2, p)}
                        isGenerating={isGenerating2}
                        aiLabel={t('ai_suggest')}
                        btnText={t('btn_generate')}
                        onSave={() => handleSaveToVault(character2)}
                        onLoad={() => openLibrary(2)}
                    />
                </div>
            </div>

            <LibraryModal
                isOpen={libraryOpen}
                onClose={() => setLibraryOpen(false)}
                onSelect={handleLibrarySelect}
            />
        </div>
    );
}
