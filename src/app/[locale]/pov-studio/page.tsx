'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import {
    Upload, Zap, Copy, Download, Trash2, Clock, Plus,
    ChevronDown, Skull, Bug, Package, PawPrint, Star, Sparkles,
    RefreshCw, FileText, History, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';
import type { POVType, POVScriptResponse, POVScriptRecord } from '@/types/pov-studio';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

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
}: {
    label: string;
    hint: string;
    value: string | null;
    onChange: (base64: string | null) => void;
    accept?: string;
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
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-xs text-white/80 font-medium">{label}</p>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center gap-3 p-6 h-40">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Upload size={20} className="text-white/40" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-white/70">{label}</p>
                        <p className="text-xs text-white/30 mt-0.5">{hint}</p>
                    </div>
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
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<POVScriptResponse | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // History state
    const [history, setHistory] = useState<POVScriptRecord[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

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
                script_data: scriptResult.scenes,
                hook: scriptResult.hook,
                cta: scriptResult.cta,
            });

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
            `🪝 HOOK: ${result.hook}`,
            ``,
            ...result.scenes.map(s =>
                `📍 Cảnh ${s.sceneNumber} [${s.emotion.toUpperCase()}]\n💬 "${s.monsterDialogue}"\n🎥 ${s.visualDescription}\n✨ ${s.productHighlight}`
            ),
            ``,
            `📢 CTA: ${result.cta}`,
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
            `HOOK: ${result.hook}`,
            ``,
            ...result.scenes.map(s =>
                `--- Scene ${s.sceneNumber} [${s.emotion}] ---\nDialogue: "${s.monsterDialogue}"\nVisual: ${s.visualDescription}\nProduct: ${s.productHighlight}\n`
            ),
            `CTA: ${result.cta}`,
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

    const handleDeleteHistory = async (id: string) => {
        try {
            const { error } = await supabase.from('pov_scripts').delete().eq('id', id);
            if (error) throw error;
            setHistory(prev => prev.filter(h => h.id !== id));
            toast.success(t('deleted'));
        } catch (err) {
            toast.error(t('error_delete'));
        }
    };

    const handleLoadHistory = (record: POVScriptRecord) => {
        setProductName(record.product_name || '');
        setMonsterDescription(record.monster_description || '');
        setSceneCount(record.scene_count);
        setPovType(record.pov_type);
        setResult({
            title: record.title,
            hook: record.hook || '',
            cta: record.cta || '',
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
                                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
                                        {t('label_monster_desc')} {selectedPovConfig && <span className="text-orange-400">{selectedPovConfig.emoji}</span>}
                                    </label>
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
                                                            onClick={() => handleDeleteHistory(record.id)}
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
                                            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
                                                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">🪝 Hook</p>
                                                <p className="text-sm text-white/80 font-medium">{result.hook}</p>
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
                                                            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5">💬 {t('dialogue_label')}</p>
                                                            <p className="text-sm text-white font-medium italic">"{scene.monsterDialogue}"</p>
                                                        </div>

                                                        {/* Visual */}
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="bg-white/5 rounded-xl p-3">
                                                                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5">🎥 {t('visual_label')}</p>
                                                                <p className="text-xs text-white/70">{scene.visualDescription}</p>
                                                            </div>
                                                            <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-3">
                                                                <p className="text-[10px] text-orange-400/70 uppercase tracking-wider mb-1.5">✨ {t('product_label')}</p>
                                                                <p className="text-xs text-white/70">{scene.productHighlight}</p>
                                                            </div>
                                                        </div>
                                                    </m.div>
                                                );
                                            })}
                                        </div>

                                        {/* CTA */}
                                        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-4">
                                            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">📢 CTA</p>
                                            <p className="text-sm text-white/80 font-medium">{result.cta}</p>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={handleCopyScript}
                                                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/20 font-bold text-sm transition-all"
                                            >
                                                <Copy size={16} />
                                                {t('btn_copy')}
                                            </button>
                                            <button
                                                onClick={handleDownload}
                                                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 font-bold text-sm transition-all"
                                            >
                                                <Download size={16} />
                                                {t('btn_download')}
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
        </div>
    );
}
