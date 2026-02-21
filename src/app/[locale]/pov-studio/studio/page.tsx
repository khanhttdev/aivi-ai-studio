'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { toast } from 'sonner';
import {
    Upload, Zap, Copy, Download, Trash2, Plus,
    ChevronDown, Skull, Bug, Package, PawPrint, Star, Sparkles,
    RefreshCw, FileText, History, X, Mic, Image as ImageIcon, Archive, Play, Pause, AlertTriangle,
    ChevronRight, ChevronLeft, Loader2, Tag, Check, ArrowLeft, Home, Wand2, Film, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';
import type { POVType, POVScriptResponse, POVScriptRecord } from '@/types/pov-studio';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { SAMPLE_RATE } from '@/lib/voice-studio/constants';
import JSZip from 'jszip';
import { usePovStudioStore } from '@/stores/usePovStudioStore';

// POV Type configs
const POV_TYPES: Array<{ id: POVType; emoji: string; labelKey: string; descKey: string }> = [
    { id: 'bacteria', emoji: '🦠', labelKey: 'pov_bacteria', descKey: 'pov_bacteria_desc' },
    { id: 'monster', emoji: '👾', labelKey: 'pov_monster', descKey: 'pov_monster_desc' },
    { id: 'object', emoji: '💨', labelKey: 'pov_object', descKey: 'pov_object_desc' },
    { id: 'pet', emoji: '🐾', labelKey: 'pov_pet', descKey: 'pov_pet_desc' },
    { id: 'villain', emoji: '😈', labelKey: 'pov_villain', descKey: 'pov_villain_desc' },
    { id: 'custom', emoji: '✨', labelKey: 'pov_custom', descKey: 'pov_custom_desc' },
];

// Image upload zone component
function ImageUploadZone({
    label,
    hint,
    value,
    onChange,
    accept = 'image/*',
    onGenerate,
    isGenerating,
    generateText,
    generatingText,
}: {
    label: string;
    hint: string;
    value: string | null;
    onChange: (base64: string | null) => void;
    accept?: string;
    onGenerate?: () => void;
    isGenerating?: boolean;
    generateText?: string;
    generatingText?: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => onChange(e.target?.result as string);
        reader.readAsDataURL(file);
    }, [onChange]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    return (
        <div
            className={cn(
                'relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden',
                isDragging
                    ? 'border-orange-500 bg-orange-500/10'
                    : value
                        ? 'border-orange-500/40 bg-orange-500/5'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
            )}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            style={{ minHeight: 160 }}
        >
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                }}
            />

            {value ? (
                <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={value} alt={label} className="w-full h-full object-cover" />
                    <button
                        onClick={(e) => { e.stopPropagation(); onChange(null); }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-500/80 transition-colors"
                    >
                        <X size={14} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-center">
                        <p className="text-xs text-white/80 font-medium">{label}</p>
                        {onGenerate && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onGenerate(); }}
                                disabled={isGenerating}
                                className="text-[10px] font-bold px-2 py-1 rounded bg-orange-500/80 hover:bg-orange-500 text-white transition-colors flex items-center gap-1"
                            >
                                {isGenerating ? <RefreshCw size={10} className="animate-spin" /> : <Sparkles size={10} />}
                                {isGenerating ? generatingText : generateText}
                            </button>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center gap-2 p-4 h-40">
                    {isGenerating ? (
                        <>
                            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center animate-pulse">
                                <RefreshCw size={18} className="text-orange-400 animate-spin" />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-bold text-orange-400">{generatingText || label}</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <Upload size={18} className="text-white/40" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-white/70">{label}</p>
                                <p className="text-[10px] text-white/30 mt-0.5 max-w-[120px] mx-auto leading-tight">{hint}</p>
                            </div>
                            {onGenerate && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onGenerate(); }}
                                    className="mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 hover:border-orange-500/40 transition-colors text-xs font-bold"
                                >
                                    <Sparkles size={12} />
                                    {generateText}
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default function POVStudioPage() {
    const locale = useLocale();
    const t = useTranslations('POVStudio');
    const dateLocale = locale === 'vi' ? vi : enUS;

    const {
        currentStep, setCurrentStep,
        povType, setPovType,
        productImage, setProductImage,
        monsterImage, setMonsterImage,
        productName, setProductName,
        monsterDescription, setMonsterDescription,
        sceneCount, setSceneCount,
        result, setResult,
        seoData, setSeoData,
        coverImage, setCoverImage,
        saveProject,
        reset
    } = usePovStudioStore();

    // Local-only state (transient/UI)
    const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Scene asset state
    const [sceneAudios, setSceneAudios] = useState<Record<string | number, string>>({});
    const [sceneImages, setSceneImages] = useState<Record<string | number, string>>({});
    const [generatingVoice, setGeneratingVoice] = useState<Record<string | number, boolean>>({});
    const [generatingSceneImg, setGeneratingSceneImg] = useState<Record<string | number, boolean>>({});
    const [isExportingZip, setIsExportingZip] = useState(false);
    const [playingAudio, setPlayingAudio] = useState<string | number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Marketing Kit local state
    const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);
    const [isGeneratingCover, setIsGeneratingCover] = useState(false);

    const handleGenerateDescription = async () => {
        if (!productName.trim() || !povType) {
            toast.error(t('error_missing_product_desc'));
            return;
        }

        setIsGeneratingDesc(true);
        try {
            const apiKey = localStorage.getItem('gemini_api_key') || '';
            const res = await fetch('/api/pov-script/generate-description', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName: productName.trim(),
                    povType,
                    productImage,
                    apiKey,
                    locale
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Description generation failed');
            }

            const data = await res.json();
            setMonsterDescription(data.result);
            toast.success(t('success_desc'));
        } catch (error) {
            console.error('POV Description generation error:', error);
            toast.error(error instanceof Error ? error.message : t('error_desc'));
        } finally {
            setIsGeneratingDesc(false);
        }
    };

    const handleGenerateImage = async () => {
        if (!monsterDescription.trim()) {
            toast.error(t('error_missing_desc'));
            return;
        }

        setIsGeneratingImage(true);
        try {
            const apiKey = localStorage.getItem('gemini_api_key') || '';
            const res = await fetch('/api/pov-script/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    monsterDescription: monsterDescription.trim(),
                    povType,
                    productImage,
                    apiKey
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Image generation failed');
            }

            const data = await res.json();
            setMonsterImage(data.result);
            toast.success(t('success_image'));
        } catch (error) {
            console.error('POV Image generation error:', error);
            toast.error(error instanceof Error ? error.message : t('error_image'));
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleGenerate = async () => {
        if (!productName.trim()) {
            toast.error(t('error_no_product'));
            return;
        }
        if (!monsterDescription.trim()) {
            toast.error(t('error_no_monster'));
            return;
        }

        setIsGenerating(true);
        setResult(null);

        try {
            const apiKey = localStorage.getItem('gemini_api_key') || '';

            const res = await fetch('/api/pov-script', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName: productName.trim(),
                    monsterDescription: monsterDescription.trim(),
                    sceneCount,
                    povType,
                    locale,
                    apiKey,
                    productImage,
                    monsterImage,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Generation failed');
            }

            const data = await res.json();
            setResult(data.result);
            setCurrentStep(2);
            toast.success(t('success_generated'));

            // Use the store to save
            await saveProject(data.result);
        } catch (error) {
            console.error('POV Script generation error:', error);
            toast.error(error instanceof Error ? error.message : t('error_generate'));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyScript = () => {
        if (!result) return;
        const text = [
            `🎬 ${result.title}`,
            ``,
            `🪝 HOOK: ${result.hook.text}`,
            ``,
            ...result.scenes.map(s =>
                `📍 Cảnh ${s.sceneNumber} [${s.emotion.toUpperCase()}]\n💬 "${s.monsterDialogue}"\n🎥 ${s.imagePrompt}\n✨ ${s.motionPrompt}`
            ),
            ``,
            `📢 CTA: ${result.cta.text}`,
        ].join('\n');

        navigator.clipboard.writeText(text);
        toast.success(t('copied'));
    };

    const handleDownload = () => {
        if (!result) return;
        const text = [
            `POV SCRIPT STUDIO - ${result.title}`,
            `Generated by AIVI AI Studio`,
            ``,
            `HOOK: ${result.hook.text}`,
            ``,
            ...result.scenes.map(s =>
                `--- Scene ${s.sceneNumber} [${s.emotion}] ---\nDialogue: "${s.monsterDialogue}"\nImage Prompt: ${s.imagePrompt}\nMotion Prompt: ${s.motionPrompt}\n`
            ),
            `CTA: ${result.cta.text}`,
        ].join('\n');

        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pov-script-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(t('downloaded'));
    };

    // --- Scene-level Voiceover Generation ---
    const handleGenerateVoice = async (sceneIdx: number | string, dialogue: string) => {
        setGeneratingVoice(prev => ({ ...prev, [sceneIdx]: true }));
        try {
            const apiKey = localStorage.getItem('gemini_api_key') || '';
            const res = await fetch('/api/voice-studio/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: dialogue,
                    voiceName: 'Puck',
                    apiKey,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Voice generation failed');
            }

            const data = await res.json();

            // Convert raw PCM to WAV
            const pcmBytes = Uint8Array.from(atob(data.audio), c => c.charCodeAt(0));
            const wavBuffer = createWavFromPcm(pcmBytes, SAMPLE_RATE);
            const blob = new Blob([wavBuffer], { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(blob);

            setSceneAudios(prev => ({ ...prev, [sceneIdx]: audioUrl }));
            toast.success(t('success_voice'));
        } catch (error) {
            console.error('Voice generation error:', error);
            toast.error(error instanceof Error ? error.message : t('error_voice'));
        } finally {
            setGeneratingVoice(prev => ({ ...prev, [sceneIdx]: false }));
        }
    };

    const createWavFromPcm = (pcmData: Uint8Array, sampleRate: number): ArrayBuffer => {
        const numChannels = 1;
        const bitsPerSample = 16;
        const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
        const blockAlign = numChannels * (bitsPerSample / 8);
        const dataSize = pcmData.length;
        const buffer = new ArrayBuffer(44 + dataSize);
        const view = new DataView(buffer);

        const writeString = (offset: number, str: string) => {
            for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + dataSize, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, byteRate, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitsPerSample, true);
        writeString(36, 'data');
        view.setUint32(40, dataSize, true);

        const pcmView = new Uint8Array(buffer, 44);
        pcmView.set(pcmData);

        return buffer;
    };

    const handleGenerateSceneImage = async (sceneIdx: number | string, visualNote: string) => {
        setGeneratingSceneImg(prev => ({ ...prev, [sceneIdx]: true }));
        try {
            const apiKey = localStorage.getItem('gemini_api_key') || '';
            const res = await fetch('/api/pov-script/generate-scene-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visualNote,
                    sceneIndex: sceneIdx,
                    monsterImage,
                    productImage,
                    povType,
                    apiKey,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Scene image generation failed');
            }

            const data = await res.json();
            setSceneImages(prev => ({ ...prev, [sceneIdx]: data.result }));
            toast.success(t('success_scene_img'));
        } catch (error) {
            console.error('Scene image generation error:', error);
            toast.error(error instanceof Error ? error.message : t('error_scene_img'));
        } finally {
            setGeneratingSceneImg(prev => ({ ...prev, [sceneIdx]: false }));
        }
    };

    const handlePlayAudio = (sceneIdx: number | string) => {
        if (playingAudio === sceneIdx) {
            audioRef.current?.pause();
            setPlayingAudio(null);
            return;
        }

        if (audioRef.current) {
            audioRef.current.pause();
        }

        const audio = new Audio(sceneAudios[sceneIdx]);
        audioRef.current = audio;
        audio.play();
        setPlayingAudio(sceneIdx);
        audio.onended = () => setPlayingAudio(null);
    };

    const handleExportZip = async () => {
        if (!result) return;
        setIsExportingZip(true);
        try {
            const zip = new JSZip();

            const scriptText = [
                `POV SCRIPT STUDIO - ${result.title}`,
                `Generated by AIVI AI Studio`,
                ``,
                `HOOK: ${result.hook.text}`,
                ``,
                ...result.scenes.map(s =>
                    `--- Scene ${s.sceneNumber} [${s.emotion}] ---\nDialogue: "${s.monsterDialogue}"\nImage Prompt: ${s.imagePrompt}\nMotion Prompt: ${s.motionPrompt}\n`
                ),
                `CTA: ${result.cta.text}`,
            ].join('\n');
            zip.file('script.txt', scriptText);

            if (seoData) {
                const mkText = [
                    `MARKETING KIT - ${seoData.title}`,
                    `Generated by AIVI AI Studio`,
                    ``,
                    `== VIRAL TITLE ==`,
                    seoData.title,
                    ``,
                    `== CAPTION ==`,
                    seoData.description,
                    ``,
                    `== HASHTAGS ==`,
                    ...(seoData.hashtags || []),
                    ``,
                    `== VIRAL HOOKS ==`,
                    ...(seoData.viralHooks || []).map((h, i) => `${i + 1}. ${h}`),
                    ``,
                    `== TARGET AUDIENCE ==`,
                    `Demographics: ${seoData.targetAudience?.demographics || ''}`,
                    `Pain Points: ${(seoData.targetAudience?.painPoints || []).join(', ')}`,
                    `Desires: ${(seoData.targetAudience?.desires || []).join(', ')}`,
                    ``,
                    `== SOCIAL POSTS ==`,
                    `[Threads]`,
                    seoData.socialPosts?.threads || '',
                    ``,
                    `[Instagram Reels]`,
                    seoData.socialPosts?.instagram || '',
                    ``,
                    `[Facebook]`,
                    seoData.socialPosts?.facebook || '',
                ].join('\n');
                zip.file('marketing_kit.txt', mkText);
            }

            for (const [idx, audioUrl] of Object.entries(sceneAudios)) {
                try {
                    const response = await fetch(audioUrl);
                    const blob = await response.blob();
                    zip.file(`scene-${Number(idx) + 1}-voice.wav`, blob);
                } catch (e) {
                    console.warn(`Failed to add audio for scene ${idx}:`, e);
                }
            }

            for (const [idx, imgSrc] of Object.entries(sceneImages)) {
                try {
                    if (imgSrc.startsWith('data:')) {
                        const base64Data = imgSrc.split('base64,')[1];
                        const byteChars = atob(base64Data);
                        const byteArray = new Uint8Array(byteChars.length);
                        for (let i = 0; i < byteChars.length; i++) byteArray[i] = byteChars.charCodeAt(i);
                        zip.file(`scene-${Number(idx) + 1}-storyboard.png`, byteArray);
                    } else {
                        const response = await fetch(imgSrc);
                        const blob = await response.blob();
                        zip.file(`scene-${Number(idx) + 1}-storyboard.png`, blob);
                    }
                } catch (e) {
                    console.warn(`Failed to add image for scene ${idx}:`, e);
                }
            }

            if (monsterImage && monsterImage.startsWith('data:')) {
                const base64Data = monsterImage.split('base64,')[1];
                const byteChars = atob(base64Data);
                const byteArray = new Uint8Array(byteChars.length);
                for (let i = 0; i < byteChars.length; i++) byteArray[i] = byteChars.charCodeAt(i);
                zip.file('character.png', byteArray);
            }

            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pov-kit-${Date.now()}.zip`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success(t('success_zip'));
        } catch (error) {
            console.error('ZIP export error:', error);
            toast.error(t('error_zip'));
        } finally {
            setIsExportingZip(false);
        }
    };

    const handleGenerateSEO = async () => {
        if (!result) return;
        setIsGeneratingSeo(true);
        try {
            const apiKey = localStorage.getItem('gemini_api_key') || '';
            const res = await fetch('/api/pov-script/generate-seo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hook: result.hook,
                    scenes: result.scenes,
                    cta: result.cta,
                    povType,
                    productName,
                    apiKey,
                }),
            });
            if (!res.ok) throw new Error('SEO generation failed');
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setSeoData(data);
            toast.success(t('mk_toast_seo_success'));
        } catch (error) {
            console.error('SEO generation error:', error);
            toast.error(t('mk_toast_seo_error'));
        } finally {
            setIsGeneratingSeo(false);
        }
    };

    const handleGenerateCover = async () => {
        if (!result) return;
        setIsGeneratingCover(true);
        try {
            const apiKey = localStorage.getItem('gemini_api_key') || '';
            const res = await fetch('/api/pov-script/generate-cover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hook: result.hook,
                    povType,
                    productName,
                    monsterImage,
                    productImage,
                    apiKey,
                }),
            });
            if (!res.ok) throw new Error('Cover generation failed');
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            if (data.imageUrl) {
                setCoverImage(data.imageUrl);
                toast.success(t('mk_toast_cover_success'));
            }
        } catch (error) {
            console.error('Cover generation error:', error);
            toast.error(t('mk_toast_cover_error'));
        } finally {
            setIsGeneratingCover(false);
        }
    };

    const handleDownloadMarketingZip = async () => {
        if (!coverImage && !seoData) return;
        setIsExportingZip(true);
        try {
            const zip = new JSZip();
            if (coverImage) {
                if (coverImage.startsWith('data:')) {
                    const base64Data = coverImage.split(',')[1];
                    const binaryString = window.atob(base64Data);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
                    zip.file('thumbnail.png', bytes);
                } else {
                    const response = await fetch(coverImage);
                    const blob = await response.blob();
                    zip.file('thumbnail.png', blob);
                }
            }
            if (seoData) {
                const content = `TITLE: ${seoData.title}\n\nDESCRIPTION:\n${seoData.description}\n\nHASHTAGS:\n${seoData.hashtags.join(' ')}\n\nKEYWORDS:\n${seoData.keywords?.join(', ')}`;
                zip.file('marketing-kit.txt', content);
            }
            const blob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pov-marketing-kit-${Date.now()}.zip`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success(t('success_zip'));
        } catch (error) {
            console.error('Marketing ZIP error:', error);
            toast.error(t('error_zip'));
        } finally {
            setIsExportingZip(false);
        }
    };

    const STEPS = [
        { num: 1, title: t('step_1_title'), desc: t('step_1_desc'), icon: <Sparkles size={16} /> },
        { num: 2, title: t('step_2_title'), desc: t('step_2_desc'), icon: <FileText size={16} /> },
        { num: 3, title: t('step_3_title'), desc: t('step_3_desc'), icon: <ImageIcon size={16} /> },
        { num: 4, title: t('step_4_title'), desc: t('step_4_desc'), icon: <Archive size={16} /> },
    ];

    return (
        <div className="min-h-screen pt-32 pb-20">
            {/* ═══ STEP INDICATOR ═══ */}
            <section className="relative z-40 px-4 md:px-8 xl:px-12 mb-8">
                <div className="w-full max-w-5xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <Link href={`/${locale}/pov-studio`} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all border border-white/10 group">
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-black text-white uppercase tracking-tight">{t('studio_title')}</h1>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{t('studio_subtitle')}</p>
                        </div>
                    </div>

                    <div className="relative flex items-center justify-between px-4">
                        <div className="absolute top-5 left-8 right-8 h-[2px] bg-white/5 rounded-full" />
                        <m.div
                            className="absolute top-5 left-8 h-[2px] bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-full origin-left"
                            initial={{ width: '0%' }}
                            animate={{ width: `calc((100% - 4rem) * ${(currentStep - 1) / (STEPS.length - 1)})` }}
                            transition={{ duration: 0.6, ease: 'easeInOut' }}
                        />

                        {STEPS.map((step) => {
                            const isActive = step.num === currentStep;
                            const isCompleted = step.num < currentStep;
                            const isClickable = step.num <= 1 || !!result;

                            return (
                                <button
                                    key={step.num}
                                    onClick={() => { if (isClickable) setCurrentStep(step.num); }}
                                    disabled={!isClickable}
                                    className={cn(
                                        "flex flex-col items-center gap-1.5 relative z-10 transition-all",
                                        isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-40"
                                    )}
                                >
                                    <m.div
                                        className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                            isActive
                                                ? "bg-gradient-to-br from-orange-500 to-pink-500 border-orange-400 shadow-lg shadow-orange-500/30 scale-110"
                                                : isCompleted
                                                    ? "bg-emerald-500/20 border-emerald-500/50"
                                                    : "bg-white/5 border-white/10 text-gray-500 hover:text-white"
                                        )}
                                        whileHover={isClickable ? { scale: 1.15 } : {}}
                                        whileTap={isClickable ? { scale: 0.95 } : {}}
                                    >
                                        {isCompleted ? (
                                            <Check className="w-4 h-4 text-emerald-400" />
                                        ) : (
                                            <span className={cn(isActive ? "text-white" : "text-gray-500")}>
                                                {step.icon}
                                            </span>
                                        )}
                                    </m.div>
                                    <span className={cn(
                                        "text-[10px] font-medium whitespace-nowrap transition-colors mt-1.5",
                                        isActive ? "text-white" : isCompleted ? "text-emerald-400/80" : "text-gray-600"
                                    )}>
                                        {step.title}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ═══ MAIN CONTENT ═══ */}
            <section className="px-4 md:px-8 xl:px-12 py-12 mt-8">
                <div className="w-full max-w-7xl mx-auto">
                    <div className="min-w-0">
                        <AnimatePresence mode="wait">
                            {currentStep === 1 && (
                                <m.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                    <div className="space-y-10">
                                        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr_1fr] gap-8 items-stretch">
                                            <div className="flex flex-col">
                                                <div className="bg-zinc-900/50 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-2xl h-full flex flex-col justify-center">
                                                    <div className="mb-8">
                                                        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 uppercase tracking-widest">{t('section_pov_type')}</h2>
                                                        <p className="text-sm text-white/50 mt-2 font-medium leading-relaxed">{t('section_pov_type_desc')}</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                        {POV_TYPES.map((pov) => (
                                                            <button
                                                                key={pov.id}
                                                                onClick={() => setPovType(pov.id)}
                                                                className={cn(
                                                                    'flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300 text-center relative overflow-hidden group',
                                                                    povType === pov.id
                                                                        ? 'border-orange-500/50 bg-gradient-to-b from-orange-500/20 to-orange-500/5 text-orange-400'
                                                                        : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/30 hover:bg-white/[0.08] hover:text-white/90'
                                                                )}
                                                            >
                                                                <span className="text-3xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">{pov.emoji}</span>
                                                                <span className="text-[11px] font-bold tracking-wide uppercase">{t(pov.labelKey as any)}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="bg-zinc-900/50 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl h-full">
                                                    <div>
                                                        <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 uppercase tracking-widest">{t('section_config')}</h2>
                                                        <p className="text-sm text-white/50 mt-1 font-medium">{t('section_config_desc')}</p>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="text-xs font-bold text-white/70 uppercase tracking-widest mb-2 block flex items-center gap-2">
                                                                <Tag size={14} className="text-orange-400" />
                                                                {t('label_product_name')}
                                                            </label>
                                                            <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder={t('placeholder_product_name')} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm font-medium" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <label className="text-xs font-bold text-white/70 uppercase tracking-widest flex items-center gap-2">
                                                                    <FileText size={14} className="text-orange-400" />
                                                                    {t('label_monster_desc')}
                                                                </label>
                                                                <button onClick={handleGenerateDescription} disabled={isGeneratingDesc} className="text-[10px] font-bold px-3 py-1.5 rounded-xl bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-all flex items-center gap-1.5 border border-white/10">
                                                                    {isGeneratingDesc ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                                                    {isGeneratingDesc ? '...' : t('btn_auto_desc')}
                                                                </button>
                                                            </div>
                                                            <textarea value={monsterDescription} onChange={(e) => setMonsterDescription(e.target.value)} placeholder={t('placeholder_monster_desc')} rows={3} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm font-medium resize-none leading-relaxed" />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-bold text-white/70 uppercase tracking-widest mb-2 block flex items-center gap-2">
                                                                <ImageIcon size={14} className="text-orange-400" />
                                                                {t('label_scene_count')}
                                                            </label>
                                                            <div className="flex gap-3">
                                                                {[3, 4, 5, 6, 7].map(n => (
                                                                    <button key={n} onClick={() => setSceneCount(n)} className={cn("w-12 h-12 flex items-center justify-center rounded-2xl font-black text-sm transition-all duration-300", sceneCount === n ? "bg-gradient-to-br from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30 scale-105 border border-orange-400" : "bg-black/40 text-white/50 hover:text-white hover:bg-white/10 border border-white/10")}>
                                                                        {n}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="bg-zinc-900/50 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl h-full flex flex-col">
                                                    <div>
                                                        <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 uppercase tracking-widest">{t('section_images')}</h2>
                                                        <p className="text-sm text-white/50 mt-1 font-medium">{t('section_images_desc')}</p>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-5 flex-1">
                                                        <ImageUploadZone label={t('upload_product')} hint={t('upload_product_hint')} value={productImage} onChange={setProductImage} />
                                                        <ImageUploadZone
                                                            label={t('upload_monster')}
                                                            hint={t('upload_monster_hint')}
                                                            value={monsterImage}
                                                            onChange={setMonsterImage}
                                                            onGenerate={handleGenerateImage}
                                                            isGenerating={isGeneratingImage}
                                                            generateText={t('btn_auto_generate')}
                                                            generatingText={t('generating_image')}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex justify-center">
                                            <button
                                                onClick={handleGenerate}
                                                disabled={isGenerating || !productName}
                                                className="w-full max-w-2xl py-5 rounded-3xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white font-black text-xl uppercase tracking-widest transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] border border-white/30 relative overflow-hidden group"
                                            >
                                                {isGenerating ? <Loader2 size={26} className="animate-spin" /> : <Sparkles size={26} />}
                                                <span>{isGenerating ? t('btn_generating') : t('btn_generate')}</span>
                                            </button>
                                        </div>
                                    </div>
                                </m.div>
                            )}

                            {currentStep === 2 && result && (
                                <m.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                                    <div className="bg-white/[0.03] border border-white/8 rounded-3xl p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h2 className="text-xl font-black text-white">{result.title}</h2>
                                                <p className="text-sm text-white/40">{result.scenes.length} {t('scenes_label')}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={handleCopyScript} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all" aria-label="Copy script"><Copy size={16} /></button>
                                                <button onClick={handleDownload} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all" aria-label="Download script text"><Download size={16} /></button>
                                            </div>
                                        </div>

                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 space-y-3 mb-4">
                                            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">🪝 Hook</p>
                                            <p className="text-sm text-white font-medium italic">&quot;{result.hook.text}&quot;</p>
                                            {result.hook.imagePrompt && (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="bg-white/5 rounded-xl p-3">
                                                        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">🖼️ {t('image_prompt_label')}</p>
                                                        <p className="text-xs text-white/70">{result.hook.imagePrompt}</p>
                                                    </div>
                                                    <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-3">
                                                        <p className="text-[10px] text-orange-400/70 uppercase tracking-wider mb-1">🎬 {t('motion_prompt_label')}</p>
                                                        <p className="text-xs text-white/70">{result.hook.motionPrompt}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            {result.scenes.map((scene, idx) => (
                                                <div key={idx} className="rounded-2xl p-4 space-y-3 border border-white/10 bg-white/5">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">{t('scene_label')} {scene.sceneNumber}</p>
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60 uppercase">{scene.emotion}</span>
                                                    </div>
                                                    <p className="text-sm text-white font-medium italic">&quot;{scene.monsterDialogue}&quot;</p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="bg-white/5 rounded-xl p-3">
                                                            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{t('image_prompt_label')}</p>
                                                            <p className="text-xs text-white/70">{scene.imagePrompt}</p>
                                                        </div>
                                                        <div className="bg-white/5 rounded-xl p-3">
                                                            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{t('motion_prompt_label')}</p>
                                                            <p className="text-xs text-white/70">{scene.motionPrompt}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 space-y-3 mt-4">
                                            <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">🎯 CTA</p>
                                            <p className="text-sm text-white font-medium italic">&quot;{result.cta.text}&quot;</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setCurrentStep(3)}
                                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-3 shadow-lg"
                                    >
                                        {t('btn_go_to_storyboard')}
                                        <ChevronRight size={20} />
                                    </button>
                                </m.div>
                            )}

                            {currentStep === 3 && result && (
                                <m.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8 pb-10">
                                    <div className="text-center space-y-2 mb-8">
                                        <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500 uppercase tracking-tight">{t('step_3_title')}</h1>
                                        <p className="text-white/50 text-sm max-w-lg mx-auto">{t('step_3_desc')}</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">

                                        {/* HOOK CARD */}
                                        <div className="bg-[#0f1115] border border-white/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:border-orange-500/30 transition-all flex flex-col group/card relative">
                                            <div className="px-5 py-3 border-b border-white/5 bg-[#161920] flex justify-between items-center">
                                                <span className="text-[11px] font-black text-orange-400 uppercase tracking-widest flex items-center gap-2"><Sparkles size={14} /> HOOK 3S</span>
                                            </div>

                                            <div className="aspect-[9/16] bg-[#090a0c] relative group">
                                                {sceneImages['hook'] ? (
                                                    <img src={sceneImages['hook']} alt="Hook Scene" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-4 p-6 text-center">
                                                        <ImageIcon className="w-12 h-12 opacity-20" />
                                                        <button
                                                            onClick={() => handleGenerateSceneImage('hook', result.hook.imagePrompt || result.hook.text)}
                                                            disabled={generatingSceneImg['hook']}
                                                            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:border-cyan-500/50"
                                                        >
                                                            {generatingSceneImg['hook'] ? <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> : <Wand2 className="w-4 h-4 text-cyan-400" />}
                                                            <span className={generatingSceneImg['hook'] ? "text-cyan-400" : "text-white"}>{generatingSceneImg['hook'] ? t('generating_image') : t('btn_generate_scene_img')}</span>
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Loading Overlay */}
                                                {generatingSceneImg['hook'] && sceneImages['hook'] && (
                                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-20">
                                                        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                                                    </div>
                                                )}

                                                {/* Hover Actions */}
                                                {sceneImages['hook'] && (
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5 gap-3 z-10 touch-manipulation opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleGenerateSceneImage('hook', result.hook.imagePrompt || result.hook.text)}
                                                            disabled={generatingSceneImg['hook']}
                                                            className="w-full py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                                                        >
                                                            {generatingSceneImg['hook'] ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                                            {t('btn_generate_scene_img')}
                                                        </button>
                                                        <a
                                                            href={sceneImages['hook']}
                                                            download="hook-scene.png"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-full py-2.5 bg-[#161920] border border-white/5 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                                                        >
                                                            <Download className="w-4 h-4" /> Tải ảnh
                                                        </a>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Text Content */}
                                            <div className="p-5 flex-1 border-t border-white/5 bg-[#0f1115] flex flex-col justify-between relative">
                                                <div className="space-y-4 mb-4">
                                                    <p className="text-[13px] font-semibold italic text-white/90 leading-relaxed overflow-y-auto max-h-[100px] scrollbar-hide">
                                                        "{result.hook.text}"
                                                    </p>
                                                    {result.hook.motionPrompt && (
                                                        <div className="bg-[#1a1d24] p-3 rounded-xl border border-white/5 group/prompt">
                                                            <p className="text-[10px] text-orange-400 uppercase tracking-widest mb-1.5 flex justify-between items-center font-bold">
                                                                Motion Prompt
                                                                <button onClick={() => navigator.clipboard.writeText(result.hook.motionPrompt || '')} className="text-white/30 hover:text-white transition-colors p-1" aria-label="Copy motion prompt"><Copy size={12} /></button>
                                                            </p>
                                                            <p className="text-[11px] text-white/50 line-clamp-3 leading-relaxed" title={result.hook.motionPrompt}>{result.hook.motionPrompt}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Voice Controls */}
                                                <div className="pt-4 border-t border-white/5 flex items-center gap-3 mt-auto">
                                                    <button
                                                        onClick={() => handleGenerateVoice('hook', result.hook.text)}
                                                        disabled={generatingVoice['hook']}
                                                        className="flex-1 text-[11px] font-bold px-3 py-2.5 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white transition-all flex items-center justify-center gap-2 border border-purple-500/20 disabled:opacity-50 tracking-wide uppercase"
                                                    >
                                                        {generatingVoice['hook'] ? <Loader2 size={14} className="animate-spin" /> : <Mic size={14} />}
                                                        {t('btn_generate_voice')}
                                                    </button>
                                                    {sceneAudios['hook'] && (
                                                        <button onClick={() => handlePlayAudio('hook')} className="w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20 hover:scale-105 transition-all" aria-label="Play audio">
                                                            {playingAudio === 'hook' ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* SCENE CARDS */}
                                        {result.scenes.map((scene, idx) => (
                                            <div key={idx} className="bg-[#0f1115] border border-white/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:border-cyan-500/30 transition-all flex flex-col group/card relative">
                                                <div className="px-5 py-3 border-b border-white/5 bg-[#161920] flex justify-between items-center">
                                                    <span className="text-[11px] font-black text-white/50 uppercase tracking-widest flex items-center gap-2"><Film size={14} /> {t('scene_label')} {scene.sceneNumber}</span>
                                                    <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#1a1d24] border border-white/5 text-cyan-400">{scene.emotion}</span>
                                                </div>

                                                <div className="aspect-[9/16] bg-[#090a0c] relative group">
                                                    {sceneImages[idx] ? (
                                                        <img src={sceneImages[idx]} alt={`Scene ${scene.sceneNumber}`} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-4 p-6 text-center">
                                                            <ImageIcon className="w-12 h-12 opacity-20" />
                                                            <button
                                                                onClick={() => handleGenerateSceneImage(idx, scene.imagePrompt)}
                                                                disabled={generatingSceneImg[idx]}
                                                                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:border-cyan-500/50"
                                                            >
                                                                {generatingSceneImg[idx] ? <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> : <Wand2 className="w-4 h-4 text-cyan-400" />}
                                                                <span className={generatingSceneImg[idx] ? "text-cyan-400" : "text-white"}>{generatingSceneImg[idx] ? t('generating_image') : t('btn_generate_scene_img')}</span>
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Loading Overlay */}
                                                    {generatingSceneImg[idx] && sceneImages[idx] && (
                                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-20">
                                                            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                                                        </div>
                                                    )}

                                                    {/* Hover Actions */}
                                                    {sceneImages[idx] && (
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5 gap-3 z-10 touch-manipulation opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleGenerateSceneImage(idx, scene.imagePrompt)}
                                                                disabled={generatingSceneImg[idx]}
                                                                className="w-full py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                                                            >
                                                                {generatingSceneImg[idx] ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                                                {t('btn_generate_scene_img')}
                                                            </button>
                                                            <a
                                                                href={sceneImages[idx]}
                                                                download={`scene-${scene.sceneNumber}.png`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="w-full py-2.5 bg-[#161920] border border-white/5 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                                                            >
                                                                <Download className="w-4 h-4" /> Tải ảnh
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Text Content */}
                                                <div className="p-5 flex-1 border-t border-white/5 bg-[#0f1115] flex flex-col justify-between relative">
                                                    <div className="space-y-4 mb-4">
                                                        <p className="text-[13px] font-semibold italic text-white/90 leading-relaxed overflow-y-auto max-h-[100px] scrollbar-hide">
                                                            "{scene.monsterDialogue}"
                                                        </p>
                                                        {scene.motionPrompt && (
                                                            <div className="bg-[#1a1d24] p-3 rounded-xl border border-white/5 group/prompt">
                                                                <p className="text-[10px] text-cyan-400 uppercase tracking-widest mb-1.5 flex justify-between items-center font-bold">
                                                                    Motion Prompt
                                                                    <button onClick={() => navigator.clipboard.writeText(scene.motionPrompt || '')} className="text-white/30 hover:text-white transition-colors p-1" aria-label="Copy motion prompt"><Copy size={12} /></button>
                                                                </p>
                                                                <p className="text-[11px] text-white/50 line-clamp-3 leading-relaxed" title={scene.motionPrompt}>{scene.motionPrompt}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Voice Controls */}
                                                    <div className="pt-4 border-t border-white/5 flex items-center gap-3 mt-auto">
                                                        <button
                                                            onClick={() => handleGenerateVoice(idx, scene.monsterDialogue)}
                                                            disabled={generatingVoice[idx]}
                                                            className="flex-1 text-[11px] font-bold px-3 py-2.5 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white transition-all flex items-center justify-center gap-2 border border-purple-500/20 disabled:opacity-50 tracking-wide uppercase"
                                                        >
                                                            {generatingVoice[idx] ? <Loader2 size={14} className="animate-spin" /> : <Mic size={14} />}
                                                            {t('btn_generate_voice')}
                                                        </button>
                                                        {sceneAudios[idx] && (
                                                            <button onClick={() => handlePlayAudio(idx)} className="w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20 hover:scale-105 transition-all" aria-label="Play audio">
                                                                {playingAudio === idx ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* OPTIONAL CTA CARD */}
                                        <div className="bg-[#0f1115] border border-white/5 rounded-2xl overflow-hidden shadow-sm flex flex-col sm:col-span-2 lg:col-span-3 lg:w-1/3 lg:mx-auto">
                                            <div className="px-5 py-3 border-b border-white/5 bg-[#161920] flex items-center gap-2">
                                                <span className="text-[11px] font-black text-green-400 uppercase tracking-widest flex items-center gap-2"><Sparkles size={14} /> CALL TO ACTION (CTA)</span>
                                            </div>
                                            <div className="p-6 text-center">
                                                <p className="text-sm font-semibold text-white/90 italic">"{result.cta.text}"</p>
                                            </div>
                                        </div>

                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-between items-center pt-8 mt-12 border-t border-white/10">
                                        <button
                                            onClick={() => setCurrentStep(2)}
                                            className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white/80 hover:text-white group"
                                        >
                                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                            {t('btn_back')}
                                        </button>
                                        <button
                                            onClick={() => setCurrentStep(4)}
                                            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 text-white rounded-full font-black uppercase tracking-wider shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all transform hover:-translate-y-0.5"
                                        >
                                            {t('btn_go_to_marketing')}
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </m.div>
                            )}

                            {currentStep === 4 && result && (
                                <m.div key="step4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                                    <div className="text-center space-y-2">
                                        <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500">{t('mk_title')}</h1>
                                        <p className="text-white/50 text-sm max-w-lg mx-auto">{t('mk_subtitle')}</p>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                                        <div className="bg-zinc-900/50 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 space-y-4">
                                            <h3 className="text-lg font-bold flex items-center gap-2 text-white"><ImageIcon className="w-5 h-5 text-pink-500" />{t('mk_thumbnail_title')}</h3>
                                            <div className="aspect-[9/16] w-full max-w-[300px] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative bg-black/40">
                                                {isGeneratingCover && (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 backdrop-blur-sm z-20">
                                                        <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
                                                        <p className="text-sm font-mono text-pink-400 animate-pulse">{t('mk_designing_thumbnail')}</p>
                                                    </div>
                                                )}
                                                {coverImage ? (
                                                    <>
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                                                        {seoData?.title && (
                                                            <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                                                                <h2 className="text-white font-black text-2xl uppercase leading-tight line-clamp-3">{seoData.title}</h2>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : !isGeneratingCover && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <button onClick={handleGenerateCover} className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full backdrop-blur-md text-white font-bold transition-all"><Sparkles className="w-5 h-5 mr-2 inline" />{t('mk_btn_generate_cover')}</button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-center gap-3">
                                                <button onClick={handleGenerateCover} disabled={isGeneratingCover} className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50">{t('mk_btn_regenerate_cover')}</button>
                                                {coverImage && <a href={coverImage} download="viral-thumbnail.png" className="px-5 py-2.5 bg-white/10 rounded-xl text-sm font-bold text-white border border-white/10 transition-all">{t('mk_btn_download_raw')}</a>}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="bg-zinc-900/50 backdrop-blur-3xl border border-white/10 rounded-3xl p-6">
                                                <div className="flex items-center justify-between mb-6">
                                                    <h3 className="text-lg font-bold flex items-center gap-2 text-white"><Sparkles className="w-5 h-5 text-orange-500" />{t('mk_seo_title')}</h3>
                                                    <button onClick={handleGenerateSEO} disabled={isGeneratingSeo} className="px-5 py-2 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 rounded-full text-sm font-bold transition-all">{seoData ? t('mk_btn_rewrite') : t('mk_btn_generate_seo')}</button>
                                                </div>
                                                {seoData ? (
                                                    <div className="space-y-5">
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-white/40 uppercase tracking-wider">{t('mk_viral_title')}</label>
                                                            <div className="p-4 bg-white/5 rounded-xl border border-white/10"><p className="font-bold text-lg text-white">{seoData.title}</p></div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-white/40 uppercase tracking-wider">{t('mk_caption')}</label>
                                                            <div className="p-4 bg-white/5 rounded-xl border border-white/10"><p className="text-sm text-gray-300 whitespace-pre-wrap">{seoData.description}</p></div>
                                                        </div>

                                                        {(seoData.hashtags?.length > 0 || seoData.keywords?.length > 0) && (
                                                            <div className="grid grid-cols-2 gap-4">
                                                                {seoData.hashtags?.length > 0 && (
                                                                    <div className="space-y-2">
                                                                        <label className="text-xs font-bold text-white/40 uppercase tracking-wider">{t('mk_hashtags')}</label>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {seoData.hashtags.map((tag, i) => (
                                                                                <span key={i} className="px-2.5 py-1 text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">
                                                                                    {tag.startsWith('#') ? tag : `#${tag}`}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {seoData.keywords?.length > 0 && (
                                                                    <div className="space-y-2">
                                                                        <label className="text-xs font-bold text-white/40 uppercase tracking-wider">{t('mk_keywords')}</label>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {seoData.keywords.map((kw, i) => (
                                                                                <span key={i} className="px-2.5 py-1 text-[11px] font-medium bg-green-500/10 text-green-400 border border-green-500/20 rounded-md">
                                                                                    {kw}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {seoData.viralHooks && seoData.viralHooks.length > 0 && (
                                                            <div className="space-y-2 mt-4">
                                                                <label className="text-xs font-bold text-white/40 uppercase tracking-wider">{t('mk_viral_hooks')}</label>
                                                                <div className="grid gap-2">
                                                                    {seoData.viralHooks.map((hook, i) => (
                                                                        <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/10 text-sm text-white flex items-start gap-2">
                                                                            <span className="text-orange-500 font-bold">{i + 1}.</span> {hook}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {seoData.targetAudience && (
                                                            <div className="space-y-2 mt-4">
                                                                <label className="text-xs font-bold text-white/40 uppercase tracking-wider">{t('mk_target_audience')}</label>
                                                                <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                                                                    <div>
                                                                        <span className="text-xs font-bold text-pink-400 uppercase">{t('mk_demographics')}:</span>
                                                                        <p className="text-sm text-white mt-1">{seoData.targetAudience.demographics}</p>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-xs font-bold text-pink-400 uppercase">{t('mk_pain_points')}:</span>
                                                                        <ul className="list-disc pl-4 text-sm text-white mt-1">
                                                                            {seoData.targetAudience.painPoints?.map((p, i) => <li key={i}>{p}</li>)}
                                                                        </ul>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-xs font-bold text-pink-400 uppercase">{t('mk_desires')}:</span>
                                                                        <ul className="list-disc pl-4 text-sm text-white mt-1">
                                                                            {seoData.targetAudience.desires?.map((d, i) => <li key={i}>{d}</li>)}
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {seoData.socialPosts && (
                                                            <div className="space-y-2 mt-4">
                                                                <label className="text-xs font-bold text-white/40 uppercase tracking-wider">{t('mk_social_posts')}</label>
                                                                <div className="grid gap-3">
                                                                    <div className="p-4 bg-[#000000] rounded-xl border border-white/10">
                                                                        <span className="text-xs font-bold text-white uppercase block mb-2">Threads / X</span>
                                                                        <p className="text-sm text-gray-300 whitespace-pre-wrap">{seoData.socialPosts.threads}</p>
                                                                    </div>
                                                                    <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl border border-white/10">
                                                                        <span className="text-xs font-bold text-white uppercase block mb-2">Instagram Reels</span>
                                                                        <p className="text-sm text-white whitespace-pre-wrap">{seoData.socialPosts.instagram}</p>
                                                                    </div>
                                                                    <div className="p-4 bg-[#1877F2] rounded-xl border border-white/10">
                                                                        <span className="text-xs font-bold text-white uppercase block mb-2">Facebook</span>
                                                                        <p className="text-sm text-white whitespace-pre-wrap">{seoData.socialPosts.facebook}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-center pt-2">
                                                            <button onClick={handleExportZip} className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl text-white font-bold shadow-xl transition-all">{t('mk_btn_download_zip')}</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-16 bg-white/[0.02] rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-3">
                                                        <Sparkles className="w-8 h-8 text-orange-500" />
                                                        <h4 className="font-bold text-white">No SEO content yet</h4>
                                                        <button onClick={handleGenerateSEO} disabled={isGeneratingSeo} className="mt-2 text-xs font-bold px-4 py-2 rounded-full bg-orange-500 text-white">{t('mk_btn_generate_seo_now')}</button>
                                                    </div>
                                                )}
                                            </div>

                                            <button onClick={() => { reset(); reset(); setCurrentStep(1); }} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-gray-400 hover:text-white transition-all">{t('btn_start_over')}</button>
                                        </div>
                                    </div>
                                </m.div>
                            )}
                        </AnimatePresence>

                        {currentStep > 1 && (
                            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
                                <button onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-sm font-semibold transition-all border border-white/10">
                                    <ChevronLeft size={16} />
                                    {t('btn_prev_step')}
                                </button>
                            </m.div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
