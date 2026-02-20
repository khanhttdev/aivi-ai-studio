'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import {
    Upload, Zap, Copy, Download, Trash2, Clock, Plus,
    ChevronDown, Skull, Bug, Package, PawPrint, Star, Sparkles,
    RefreshCw, FileText, History, X, Mic, Image as ImageIcon, Archive, Play, Pause, Volume2, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';
import type { POVType, POVScriptResponse, POVScriptRecord } from '@/types/pov-studio';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { SAMPLE_RATE } from '@/lib/voice-studio/constants';
import JSZip from 'jszip';

// POV Type configs
const POV_TYPES: Array<{ id: POVType; emoji: string; labelKey: string; descKey: string }> = [
    { id: 'bacteria', emoji: '🦠', labelKey: 'pov_bacteria', descKey: 'pov_bacteria_desc' },
    { id: 'monster', emoji: '👾', labelKey: 'pov_monster', descKey: 'pov_monster_desc' },
    { id: 'object', emoji: '💨', labelKey: 'pov_object', descKey: 'pov_object_desc' },
    { id: 'pet', emoji: '🐾', labelKey: 'pov_pet', descKey: 'pov_pet_desc' },
    { id: 'villain', emoji: '😈', labelKey: 'pov_villain', descKey: 'pov_villain_desc' },
    { id: 'custom', emoji: '✨', labelKey: 'pov_custom', descKey: 'pov_custom_desc' },
];

const POV_ICONS: Record<POVType, React.ReactNode> = {
    bacteria: <Bug size={20} />,
    monster: <Skull size={20} />,
    object: <Package size={20} />,
    pet: <PawPrint size={20} />,
    villain: <Star size={20} />,
    custom: <Sparkles size={20} />,
};

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
                    <img src={value} alt={label} className="w-full h-40 object-cover" />
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

    // Form state
    const [povType, setPovType] = useState<POVType>('bacteria');
    const [productImage, setProductImage] = useState<string | null>(null);
    const [monsterImage, setMonsterImage] = useState<string | null>(null);
    const [productName, setProductName] = useState('');
    const [monsterDescription, setMonsterDescription] = useState('');
    const [sceneCount, setSceneCount] = useState(5);

    // Result state
    const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<POVScriptResponse | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Scene asset state
    const [sceneAudios, setSceneAudios] = useState<Record<string | number, string>>({});
    const [sceneImages, setSceneImages] = useState<Record<string | number, string>>({});
    const [generatingVoice, setGeneratingVoice] = useState<Record<string | number, boolean>>({});
    const [generatingSceneImg, setGeneratingSceneImg] = useState<Record<string | number, boolean>>({});
    const [isExportingZip, setIsExportingZip] = useState(false);
    const [playingAudio, setPlayingAudio] = useState<string | number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [history, setHistory] = useState<POVScriptRecord[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Load history on mount
    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const { data, error } = await supabase
                .from('pov_scripts')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            setHistory((data as POVScriptRecord[]) || []);
        } catch (err) {
            console.error('Failed to load history:', err);
        } finally {
            setIsLoadingHistory(false);
        }
    };

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
            // Get API key from localStorage (same pattern as other studios)
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
            toast.success(t('success_generated'));

            // Auto-save to Supabase
            await saveToSupabase(data.result);
        } catch (error) {
            console.error('POV Script generation error:', error);
            toast.error(error instanceof Error ? error.message : t('error_generate'));
        } finally {
            setIsGenerating(false);
        }
    };

    const saveToSupabase = async (scriptResult: POVScriptResponse) => {
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase.from('pov_scripts').insert({
                user_id: user.id,
                title: scriptResult.title || `POV: ${productName}`,
                pov_type: povType,
                product_name: productName,
                monster_description: monsterDescription,
                scene_count: sceneCount,
                script_data: scriptResult.scenes as any,
                hook: scriptResult.hook,
                cta: scriptResult.cta,
            } as any);

            if (error) throw error;
            await loadHistory();
        } catch (err) {
            console.error('Failed to save script:', err);
        } finally {
            setIsSaving(false);
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

    // Helper: Convert PCM to WAV format
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

    // --- Scene-level Image Generation ---
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

    // --- Play/Pause Audio ---
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

    // --- Export ZIP ---
    const handleExportZip = async () => {
        if (!result) return;
        setIsExportingZip(true);
        try {
            const zip = new JSZip();

            // Add script text
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

            // Add audio files
            for (const [idx, audioUrl] of Object.entries(sceneAudios)) {
                try {
                    const response = await fetch(audioUrl);
                    const blob = await response.blob();
                    zip.file(`scene-${Number(idx) + 1}-voice.wav`, blob);
                } catch (e) {
                    console.warn(`Failed to add audio for scene ${idx}:`, e);
                }
            }

            // Add image files
            for (const [idx, imgSrc] of Object.entries(sceneImages)) {
                try {
                    if (imgSrc.startsWith('data:')) {
                        const base64Data = imgSrc.split('base64,')[1];
                        const byteChars = atob(base64Data);
                        const byteArray = new Uint8Array(byteChars.length);
                        for (let i = 0; i < byteChars.length; i++) byteArray[i] = byteChars.charCodeAt(i);
                        zip.file(`scene-${Number(idx) + 1}-storyboard.png`, byteArray);
                    } else {
                        // URL-based image (Pollinations fallback)
                        const response = await fetch(imgSrc);
                        const blob = await response.blob();
                        zip.file(`scene-${Number(idx) + 1}-storyboard.png`, blob);
                    }
                } catch (e) {
                    console.warn(`Failed to add image for scene ${idx}:`, e);
                }
            }

            // Add character image if exists
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

    const handleDeleteHistory = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        try {
            const { error } = await supabase.from('pov_scripts').delete().eq('id', id);
            if (error) throw error;
            setHistory(prev => prev.filter(h => h.id !== id));
            toast.success(t('deleted'));
        } catch (err) {
            toast.error(t('error_delete'));
        } finally {
            setDeleteConfirmId(null);
        }
    };

    const handleLoadHistory = (record: POVScriptRecord) => {
        setProductName(record.product_name || '');
        setMonsterDescription(record.monster_description || '');
        setSceneCount(record.scene_count);
        setPovType(record.pov_type);
        setResult({
            title: record.title,
            hook: typeof record.hook === 'string' ? { text: record.hook as any, imagePrompt: '', motionPrompt: '' } : ((record.hook as any) || { text: '', imagePrompt: '', motionPrompt: '' }),
            cta: typeof record.cta === 'string' ? { text: record.cta as any, imagePrompt: '', motionPrompt: '' } : ((record.cta as any) || { text: '', imagePrompt: '', motionPrompt: '' }),
            scenes: record.script_data,
        });
        setShowHistory(false);
        toast.success(t('loaded'));
    };

    const selectedPovConfig = POV_TYPES.find(p => p.id === povType);

    return (
        <div className="absolute inset-0 overflow-y-auto">
            {/* ═══ HERO SECTION ═══ */}
            <section className="relative px-4 md:px-8 pt-20 pb-12 overflow-hidden">
                {/* Background glow */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-orange-500/8 blur-[120px] rounded-full -z-10" />
                <div className="absolute top-10 right-1/4 w-[400px] h-[250px] bg-red-500/8 blur-[100px] rounded-full -z-10" />

                <div className="max-w-5xl mx-auto">
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-4"
                    >
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                            <Skull size={14} className="text-orange-400 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-400">
                                {t('badge')}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9]">
                            <span className="text-white/90">{t('title_line1')}</span>
                            <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-red-400 to-pink-400">
                                {t('title_line2')}
                            </span>
                        </h1>

                        <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
                            {t('subtitle')}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center gap-8 justify-center pt-2">
                            {[
                                { value: '6', label: t('stat_pov_types') },
                                { value: 'AI', label: t('stat_powered') },
                                { value: `${history.length}`, label: t('stat_scripts') },
                            ].map((stat, i) => (
                                <div key={i} className="text-center">
                                    <p className="text-2xl font-black text-white">{stat.value}</p>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </m.div>
                </div>
            </section>

            {/* ═══ MAIN CONTENT ═══ */}
            <section className="px-4 md:px-8 pb-20">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* ═══ LEFT: FORM ═══ */}
                        <m.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-6"
                        >
                            {/* POV Type Selector */}
                            <div className="bg-white/[0.03] border border-white/8 rounded-3xl p-6 space-y-4">
                                <div>
                                    <h2 className="text-lg font-black text-white uppercase tracking-tight">
                                        {t('section_pov_type')}
                                    </h2>
                                    <p className="text-sm text-white/40 mt-1">{t('section_pov_type_desc')}</p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {POV_TYPES.map((pov) => (
                                        <button
                                            key={pov.id}
                                            onClick={() => setPovType(pov.id)}
                                            className={cn(
                                                'flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200 text-center',
                                                povType === pov.id
                                                    ? 'border-orange-500/60 bg-orange-500/10 text-orange-400'
                                                    : 'border-white/8 bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white/70'
                                            )}
                                        >
                                            <span className="text-2xl">{pov.emoji}</span>
                                            <span className="text-xs font-bold">{t(pov.labelKey as any)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div className="bg-white/[0.03] border border-white/8 rounded-3xl p-6 space-y-4">
                                <div>
                                    <h2 className="text-lg font-black text-white uppercase tracking-tight">
                                        {t('section_images')}
                                    </h2>
                                    <p className="text-sm text-white/40 mt-1">{t('section_images_desc')}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <ImageUploadZone
                                        label={t('upload_product')}
                                        hint={t('upload_product_hint')}
                                        value={productImage}
                                        onChange={setProductImage}
                                    />
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

                            {/* Script Config */}
                            <div className="bg-white/[0.03] border border-white/8 rounded-3xl p-6 space-y-5">
                                <div>
                                    <h2 className="text-lg font-black text-white uppercase tracking-tight">
                                        {t('section_config')}
                                    </h2>
                                    <p className="text-sm text-white/40 mt-1">{t('section_config_desc')}</p>
                                </div>

                                {/* Product Name */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
                                        {t('label_product_name')}
                                    </label>
                                    <input
                                        type="text"
                                        value={productName}
                                        onChange={(e) => setProductName(e.target.value)}
                                        placeholder={t('placeholder_product_name')}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50 transition-colors"
                                    />
                                </div>

                                {/* Monster Description */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
                                            {t('label_monster_desc')} {selectedPovConfig && <span className="text-orange-400">{selectedPovConfig.emoji}</span>}
                                        </label>
                                        <button
                                            onClick={handleGenerateDescription}
                                            disabled={isGeneratingDesc}
                                            className="text-[10px] font-bold px-2 py-1 rounded bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white transition-colors flex items-center gap-1 border border-orange-500/30"
                                        >
                                            {isGeneratingDesc ? <RefreshCw size={10} className="animate-spin" /> : <Sparkles size={10} />}
                                            {t('btn_auto_desc')}
                                        </button>
                                    </div>
                                    <textarea
                                        value={monsterDescription}
                                        onChange={(e) => setMonsterDescription(e.target.value)}
                                        placeholder={t('placeholder_monster_desc')}
                                        rows={3}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
                                    />
                                </div>

                                {/* Scene Count */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
                                            {t('label_scene_count')}
                                        </label>
                                        <span className="text-orange-400 font-black text-lg">{sceneCount}</span>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        {[3, 4, 5, 6, 7, 8, 10, 12].map((n) => (
                                            <button
                                                key={n}
                                                onClick={() => setSceneCount(n)}
                                                className={cn(
                                                    'w-10 h-10 rounded-xl text-sm font-bold transition-all',
                                                    sceneCount === n
                                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                                        : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                                                )}
                                            >
                                                {n}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Generate Button */}
                                <m.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className={cn(
                                        'w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-base transition-all duration-300',
                                        isGenerating
                                            ? 'bg-white/10 text-white/40 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50'
                                    )}
                                >
                                    {isGenerating ? (
                                        <>
                                            <RefreshCw size={20} className="animate-spin" />
                                            {t('btn_generating')}
                                        </>
                                    ) : (
                                        <>
                                            <Zap size={20} />
                                            {t('btn_generate')}
                                        </>
                                    )}
                                </m.button>
                            </div>
                        </m.div>

                        {/* ═══ RIGHT: RESULT ═══ */}
                        <m.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-6"
                        >
                            {/* History Toggle */}
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-black text-white uppercase tracking-tight">
                                    {result ? t('section_result') : t('section_preview')}
                                </h2>
                                <button
                                    onClick={() => setShowHistory(!showHistory)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/60 hover:text-white hover:border-white/20 transition-all"
                                >
                                    <History size={14} />
                                    {t('btn_history')} ({history.length})
                                </button>
                            </div>

                            {/* History Panel */}
                            <AnimatePresence>
                                {showHistory && (
                                    <m.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-white/[0.03] border border-white/8 rounded-3xl overflow-hidden"
                                    >
                                        <div className="p-4 border-b border-white/8 flex items-center justify-between">
                                            <h3 className="font-bold text-white/80 text-sm">{t('history_title')}</h3>
                                            <button onClick={() => setShowHistory(false)} className="text-white/40 hover:text-white">
                                                <X size={16} />
                                            </button>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto divide-y divide-white/5">
                                            {isLoadingHistory ? (
                                                <div className="p-6 text-center text-white/30 text-sm">{t('loading')}</div>
                                            ) : history.length === 0 ? (
                                                <div className="p-6 text-center text-white/30 text-sm">{t('history_empty')}</div>
                                            ) : (
                                                history.map((record) => (
                                                    <div
                                                        key={record.id}
                                                        className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors group"
                                                    >
                                                        <button
                                                            onClick={() => handleLoadHistory(record)}
                                                            className="flex-1 text-left"
                                                        >
                                                            <p className="text-sm font-semibold text-white/80 group-hover:text-white line-clamp-1">
                                                                {record.title}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs text-orange-400/70">{record.pov_type}</span>
                                                                <span className="text-xs text-white/30">•</span>
                                                                <span className="text-xs text-white/30 flex items-center gap-1">
                                                                    <Clock size={10} />
                                                                    {formatDistanceToNow(new Date(record.created_at), { addSuffix: true, locale: dateLocale })}
                                                                </span>
                                                            </div>
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDeleteConfirmId(record.id);
                                                            }}
                                                            className="p-1.5 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </m.div>
                                )}
                            </AnimatePresence>

                            {/* Result Display */}
                            <AnimatePresence mode="wait">
                                {isGenerating ? (
                                    <m.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="bg-white/[0.03] border border-white/8 rounded-3xl p-12 flex flex-col items-center justify-center gap-6 min-h-[400px]"
                                    >
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin" />
                                            <div className="absolute inset-0 flex items-center justify-center text-3xl">
                                                {selectedPovConfig?.emoji}
                                            </div>
                                        </div>
                                        <div className="text-center space-y-2">
                                            <p className="font-black text-white text-lg">{t('generating_title')}</p>
                                            <p className="text-white/40 text-sm max-w-xs">{t('generating_desc')}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {[0, 1, 2].map(i => (
                                                <div
                                                    key={i}
                                                    className="w-2 h-2 rounded-full bg-orange-500 animate-bounce"
                                                    style={{ animationDelay: `${i * 0.15}s` }}
                                                />
                                            ))}
                                        </div>
                                    </m.div>
                                ) : result ? (
                                    <m.div
                                        key="result"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        {/* Result Header */}
                                        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-3xl p-6">
                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                <div>
                                                    <h3 className="text-xl font-black text-white">{result.title}</h3>
                                                    <p className="text-sm text-orange-400/80 mt-1 flex items-center gap-1">
                                                        <FileText size={12} />
                                                        {result.scenes.length} {t('scenes_label')}
                                                        {isSaving && <span className="text-white/30 ml-2">{t('saving')}</span>}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleCopyScript}
                                                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all"
                                                        title={t('btn_copy')}
                                                    >
                                                        <Copy size={16} />
                                                    </button>
                                                    <button
                                                        onClick={handleDownload}
                                                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all"
                                                        title={t('btn_download')}
                                                    >
                                                        <Download size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => { setResult(null); }}
                                                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all"
                                                        title={t('btn_reset')}
                                                    >
                                                        <Plus size={16} className="rotate-45" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Hook */}
                                            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 space-y-3">
                                                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">🪝 Hook</p>

                                                <div className="bg-white/5 rounded-xl p-3">
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <p className="text-[10px] text-white/40 uppercase tracking-wider">💬 {t('dialogue_label')}</p>
                                                        <button
                                                            onClick={() => handleGenerateVoice('hook', result.hook.text)}
                                                            disabled={generatingVoice['hook']}
                                                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white transition-colors flex items-center gap-1 border border-purple-500/30"
                                                        >
                                                            {generatingVoice['hook'] ? <RefreshCw size={10} className="animate-spin" /> : <Mic size={10} />}
                                                            {generatingVoice['hook'] ? t('generating_voice') : t('btn_generate_voice')}
                                                        </button>
                                                    </div>
                                                    <p className="text-sm text-white font-medium italic">&quot;{result.hook.text}&quot;</p>
                                                    {sceneAudios['hook'] && (
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <button
                                                                onClick={() => handlePlayAudio('hook')}
                                                                className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white transition-colors"
                                                            >
                                                                {playingAudio === 'hook' ? <Pause size={12} /> : <Play size={12} />}
                                                            </button>
                                                            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                                                <div className={cn('h-full bg-purple-500 rounded-full transition-all', playingAudio === 'hook' ? 'animate-pulse w-full' : 'w-0')} />
                                                            </div>
                                                            <Volume2 size={10} className="text-purple-400/50" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="bg-white/5 rounded-xl p-3">
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <p className="text-[10px] text-white/40 uppercase tracking-wider">🎥 {t('image_prompt_label')}</p>
                                                            <button
                                                                onClick={() => handleGenerateSceneImage('hook', result.hook.imagePrompt || result.hook.text)}
                                                                disabled={generatingSceneImg['hook']}
                                                                className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-white transition-colors flex items-center gap-0.5 border border-cyan-500/30"
                                                            >
                                                                {generatingSceneImg['hook'] ? <RefreshCw size={8} className="animate-spin" /> : <ImageIcon size={8} />}
                                                                {generatingSceneImg['hook'] ? '...' : t('btn_generate_scene_img')}
                                                            </button>
                                                        </div>
                                                        <p className="text-xs text-white/70">{result.hook.imagePrompt}</p>
                                                        {sceneImages['hook'] && (
                                                            <div className="mt-2 rounded-lg overflow-hidden border border-cyan-500/20">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img src={sceneImages['hook']} alt={`Hook Scene`} className="w-full h-32 object-cover" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-3">
                                                        <p className="text-[10px] text-orange-400/70 uppercase tracking-wider mb-1.5">🎬 {t('motion_prompt_label')}</p>
                                                        <p className="text-xs text-white/70">{result.hook.motionPrompt}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Scenes */}
                                        <div className="space-y-3">
                                            {result.scenes.map((scene, idx) => {
                                                const emotionColors: Record<string, string> = {
                                                    confident: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
                                                    scared: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                                                    angry: 'text-red-400 bg-red-500/10 border-red-500/20',
                                                    desperate: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
                                                    defeated: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
                                                };
                                                const emotionColor = emotionColors[scene.emotion?.toLowerCase()] || 'text-orange-400 bg-orange-500/10 border-orange-500/20';

                                                return (
                                                    <m.div
                                                        key={idx}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-3"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-black text-white/50 uppercase tracking-widest">
                                                                {t('scene_label')} {scene.sceneNumber}
                                                            </span>
                                                            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase', emotionColor)}>
                                                                {scene.emotion}
                                                            </span>
                                                        </div>

                                                        {/* Dialogue */}
                                                        <div className="bg-white/5 rounded-xl p-3">
                                                            <div className="flex items-center justify-between mb-1.5">
                                                                <p className="text-[10px] text-white/40 uppercase tracking-wider">💬 {t('dialogue_label')}</p>
                                                                <button
                                                                    onClick={() => handleGenerateVoice(idx, scene.monsterDialogue)}
                                                                    disabled={generatingVoice[idx]}
                                                                    className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white transition-colors flex items-center gap-1 border border-purple-500/30"
                                                                >
                                                                    {generatingVoice[idx] ? <RefreshCw size={10} className="animate-spin" /> : <Mic size={10} />}
                                                                    {generatingVoice[idx] ? t('generating_voice') : t('btn_generate_voice')}
                                                                </button>
                                                            </div>
                                                            <p className="text-sm text-white font-medium italic">&quot;{scene.monsterDialogue}&quot;</p>
                                                            {sceneAudios[idx] && (
                                                                <div className="mt-2 flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => handlePlayAudio(idx)}
                                                                        className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white transition-colors"
                                                                    >
                                                                        {playingAudio === idx ? <Pause size={12} /> : <Play size={12} />}
                                                                    </button>
                                                                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                                                        <div className={cn('h-full bg-purple-500 rounded-full transition-all', playingAudio === idx ? 'animate-pulse w-full' : 'w-0')} />
                                                                    </div>
                                                                    <Volume2 size={10} className="text-purple-400/50" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Visual + Product */}
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="bg-white/5 rounded-xl p-3">
                                                                <div className="flex items-center justify-between mb-1.5">
                                                                    <p className="text-[10px] text-white/40 uppercase tracking-wider">🎥 {t('image_prompt_label')}</p>
                                                                    <button
                                                                        onClick={() => handleGenerateSceneImage(idx, scene.imagePrompt)}
                                                                        disabled={generatingSceneImg[idx]}
                                                                        className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-white transition-colors flex items-center gap-0.5 border border-cyan-500/30"
                                                                    >
                                                                        {generatingSceneImg[idx] ? <RefreshCw size={8} className="animate-spin" /> : <ImageIcon size={8} />}
                                                                        {generatingSceneImg[idx] ? '...' : t('btn_generate_scene_img')}
                                                                    </button>
                                                                </div>
                                                                <p className="text-xs text-white/70">{scene.imagePrompt}</p>
                                                                {sceneImages[idx] && (
                                                                    <div className="mt-2 rounded-lg overflow-hidden border border-cyan-500/20">
                                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                        <img src={sceneImages[idx]} alt={`Scene ${idx + 1}`} className="w-full h-32 object-cover" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-3">
                                                                <p className="text-[10px] text-orange-400/70 uppercase tracking-wider mb-1.5">🎬 {t('motion_prompt_label')}</p>
                                                                <p className="text-xs text-white/70">{scene.motionPrompt}</p>
                                                            </div>
                                                        </div>
                                                    </m.div>
                                                );
                                            })}
                                        </div>

                                        {/* CTA */}
                                        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-4 space-y-3">
                                            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">📢 CTA</p>

                                            <div className="bg-white/5 rounded-xl p-3">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <p className="text-[10px] text-white/40 uppercase tracking-wider">💬 {t('dialogue_label')}</p>
                                                    <button
                                                        onClick={() => handleGenerateVoice('cta', result.cta.text)}
                                                        disabled={generatingVoice['cta']}
                                                        className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white transition-colors flex items-center gap-1 border border-purple-500/30"
                                                    >
                                                        {generatingVoice['cta'] ? <RefreshCw size={10} className="animate-spin" /> : <Mic size={10} />}
                                                        {generatingVoice['cta'] ? t('generating_voice') : t('btn_generate_voice')}
                                                    </button>
                                                </div>
                                                <p className="text-sm text-white font-medium italic">&quot;{result.cta.text}&quot;</p>
                                                {sceneAudios['cta'] && (
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <button
                                                            onClick={() => handlePlayAudio('cta')}
                                                            className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white transition-colors"
                                                        >
                                                            {playingAudio === 'cta' ? <Pause size={12} /> : <Play size={12} />}
                                                        </button>
                                                        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                                            <div className={cn('h-full bg-purple-500 rounded-full transition-all', playingAudio === 'cta' ? 'animate-pulse w-full' : 'w-0')} />
                                                        </div>
                                                        <Volume2 size={10} className="text-purple-400/50" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="bg-white/5 rounded-xl p-3">
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <p className="text-[10px] text-white/40 uppercase tracking-wider">🎥 {t('image_prompt_label')}</p>
                                                        <button
                                                            onClick={() => handleGenerateSceneImage('cta', result.cta.imagePrompt || result.cta.text)}
                                                            disabled={generatingSceneImg['cta']}
                                                            className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-white transition-colors flex items-center gap-0.5 border border-cyan-500/30"
                                                        >
                                                            {generatingSceneImg['cta'] ? <RefreshCw size={8} className="animate-spin" /> : <ImageIcon size={8} />}
                                                            {generatingSceneImg['cta'] ? '...' : t('btn_generate_scene_img')}
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-white/70">{result.cta.imagePrompt}</p>
                                                    {sceneImages['cta'] && (
                                                        <div className="mt-2 rounded-lg overflow-hidden border border-cyan-500/20">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img src={sceneImages['cta']} alt={`CTA Scene`} className="w-full h-32 object-cover" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-3">
                                                    <p className="text-[10px] text-orange-400/70 uppercase tracking-wider mb-1.5">🎬 {t('motion_prompt_label')}</p>
                                                    <p className="text-xs text-white/70">{result.cta.motionPrompt}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="grid grid-cols-3 gap-3">
                                            <button
                                                onClick={handleCopyScript}
                                                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/20 font-bold text-sm transition-all"
                                            >
                                                <Copy size={16} />
                                                {t('btn_copy')}
                                            </button>
                                            <button
                                                onClick={handleDownload}
                                                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/20 font-bold text-sm transition-all"
                                            >
                                                <Download size={16} />
                                                {t('btn_download')}
                                            </button>
                                            <button
                                                onClick={handleExportZip}
                                                disabled={isExportingZip}
                                                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 text-cyan-400 hover:from-cyan-500/20 hover:to-purple-500/20 font-bold text-sm transition-all"
                                            >
                                                {isExportingZip ? <RefreshCw size={16} className="animate-spin" /> : <Archive size={16} />}
                                                {isExportingZip ? t('exporting_zip') : t('btn_export_zip')}
                                            </button>
                                        </div>
                                    </m.div>
                                ) : (
                                    <m.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="bg-white/[0.03] border border-white/8 rounded-3xl p-12 flex flex-col items-center justify-center gap-6 min-h-[400px]"
                                    >
                                        <div className="text-6xl animate-bounce">👾</div>
                                        <div className="text-center space-y-2">
                                            <p className="font-black text-white text-lg">{t('empty_title')}</p>
                                            <p className="text-white/40 text-sm max-w-xs">{t('empty_desc')}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {['🦠 Vi khuẩn', '👾 Quái vật', '💨 Mùi hôi', '🐾 Thú cưng'].map(tag => (
                                                <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/40">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </m.div>
                                )}
                            </AnimatePresence>
                        </m.div>
                    </div>
                </div>
            </section>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirmId && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setDeleteConfirmId(null)}
                        />
                        <m.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-zinc-900 border border-red-500/20 rounded-2xl p-6 w-full max-w-md shadow-2xl overflow-hidden"
                        >
                            {/* Glow effect */}
                            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />

                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                                    <AlertTriangle className="text-red-400" size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{t('delete_title')}</h3>
                                <p className="text-white/60 text-sm mb-6 max-w-[280px]">
                                    {t('confirm_delete')}
                                </p>
                                <div className="flex items-center gap-3 w-full">
                                    <button
                                        onClick={() => setDeleteConfirmId(null)}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-colors"
                                    >
                                        {t('btn_cancel')}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteHistory(deleteConfirmId)}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={16} />
                                        {t('btn_delete')}
                                    </button>
                                </div>
                            </div>
                        </m.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
