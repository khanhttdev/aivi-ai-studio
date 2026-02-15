'use client';

import { useVideoAnalyzerStore } from '@/stores/videoAnalyzerStore';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { m } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
    ArrowLeft,
    TrendingUp,
    Eye,
    Volume2,
    Zap,
    Settings,
    Copy,
    Check,
    Download,
    Sparkles,
    Video,
    Camera,
    Music,
    Film,
    Wand2
} from 'lucide-react';
import { VideoAnalysis } from '@/lib/video-analyzer/types';
import { supabase } from '@/lib/supabase/client';

export default function AnalysisDetailPage() {
    const params = useParams();
    const router = useRouter();
    const t = useTranslations('VideoAnalyzer');
    const locale = useLocale();
    const { currentAnalysis, setCurrentAnalysis } = useVideoAnalyzerStore();
    const [analysis, setAnalysis] = useState<VideoAnalysis | null>(currentAnalysis);
    const [loading, setLoading] = useState(!currentAnalysis);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'grok' | 'veo3'>('grok');

    useEffect(() => {
        const fetchAnalysis = async () => {
            if (currentAnalysis?.id === params.id) {
                setAnalysis(currentAnalysis);
                setLoading(false);
                return;
            }

            try {
                interface AnalysisRow {
                    id: string;
                    user_id: string;
                    source_type: string;
                    source_url: string;
                    title: string;
                    duration_seconds: number | null;
                    thumbnail_url: string | null;
                    analysis_result: unknown;
                    viral_score: number;
                    generated_prompts: unknown;
                    status: string;
                    error_message: string | null;
                    created_at: string;
                    updated_at: string;
                }

                const { data, error } = await supabase
                    .from('video_analyses')
                    .select('*')
                    .eq('id', params.id as string)
                    .single() as { data: AnalysisRow | null; error: unknown };

                if (error || !data) {
                    router.push('/video-analyzer');
                    return;
                }

                const transformed: VideoAnalysis = {
                    id: data.id,
                    userId: data.user_id,
                    sourceType: data.source_type as 'upload' | 'url',
                    sourceUrl: data.source_url,
                    title: data.title,
                    durationSeconds: data.duration_seconds ?? 0,
                    thumbnailUrl: data.thumbnail_url,
                    analysisResult: data.analysis_result as VideoAnalysis['analysisResult'],
                    viralScore: data.viral_score,
                    generatedPrompts: data.generated_prompts as VideoAnalysis['generatedPrompts'],
                    status: data.status as VideoAnalysis['status'],
                    errorMessage: data.error_message,
                    createdAt: data.created_at,
                    updatedAt: data.updated_at,
                };

                setAnalysis(transformed);
                setCurrentAnalysis(transformed);
            } catch (err) {
                console.error('Failed to fetch analysis:', err);
                router.push('/video-analyzer');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, [params.id, currentAnalysis, router, setCurrentAnalysis]);

    const copyToClipboard = async (text: string, field: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleGenerateRemix = () => {
        if (!analysis) return;
        localStorage.setItem('aivi_remix_context', JSON.stringify({
            topic: analysis.title,
            viralFactors: analysis.analysisResult?.viralFactors,
            summary: analysis.analysisResult?.summary
        }));
        router.push('/script-creator');
    };

    const downloadPrompts = () => {
        if (!analysis?.generatedPrompts) return;

        const content = `# Video Analysis Prompts
Generated: ${new Date().toISOString()}
Video: ${analysis.title}
Viral Score: ${analysis.viralScore}/100

## GROK AI IMAGINE (Image-to-Video)

### Image Prompt
${analysis.generatedPrompts.grokImagine.imagePrompt}

### Motion Prompt
${analysis.generatedPrompts.grokImagine.motionPrompt}

### Style Notes
${analysis.generatedPrompts.grokImagine.styleNotes}

### Suggested Duration
${analysis.generatedPrompts.grokImagine.suggestedDuration} seconds

---

## VEO 3 (Text-to-Video)

### Video Prompt
${analysis.generatedPrompts.veo3.videoPrompt}

### Camera Directions
${analysis.generatedPrompts.veo3.cameraDirections}

### Motion Guidance
${analysis.generatedPrompts.veo3.motionGuidance}

### Audio Suggestions
${analysis.generatedPrompts.veo3.audioSuggestions}

---

## Enhancement Tips
${analysis.generatedPrompts.enhancementNotes.map((n, i) => `${i + 1}. ${n}`).join('\n')}

## Viral Tips
${analysis.generatedPrompts.viralTips.map((t, i) => `${i + 1}. ${t}`).join('\n')}
`;

        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prompts-${analysis.title.replace(/\s+/g, '-')}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!analysis) {
        return null;
    }

    const { analysisResult, generatedPrompts, viralScore } = analysis;
    const viralFactors = analysisResult?.viralFactors;

    return (
        <div className="min-h-screen py-8 px-4 md:px-8 lg:px-16">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => router.push('/video-analyzer')}
                    className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('detail.back')}
                </button>

                {/* Header */}
                <m.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">{analysis.title}</h1>
                            <p className="text-[var(--text-secondary)]">
                                {t('detail.analyzed_at')} {new Date(analysis.createdAt).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <div className="text-5xl font-black gradient-text">{viralScore}</div>
                                <div className="text-sm text-[var(--text-secondary)] uppercase font-black tracking-widest">{t('pills.viral')}</div>
                            </div>
                        </div>
                    </div>
                </m.div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left: Analysis Details */}
                    <m.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-1 space-y-6"
                    >
                        {/* Viral Factors */}
                        <m.div
                            id="viral-score"
                            className="p-8 glass-card border-[var(--border-strong)] rounded-3xl relative overflow-hidden group"
                            whileHover={{ y: -5 }}
                        >
                            <div className="absolute -top-12 -right-12 w-24 h-24 bg-[var(--accent-emerald)]/10 blur-[40px] rounded-full group-hover:scale-150 transition-transform duration-700" />

                            <h3 className="text-xs font-black text-white mb-8 flex items-center gap-2 uppercase tracking-[0.2em] relative z-10">
                                <TrendingUp className="w-4 h-4 text-[var(--accent-emerald)]" />
                                {t('detail.viral_factors')}
                            </h3>
                            <div className="space-y-5 relative z-10">
                                {viralFactors && [
                                    { label: t('detail.hook_strength'), value: viralFactors.hookStrength, color: 'var(--accent-sky)' },
                                    { label: t('detail.emotional_resonance'), value: viralFactors.emotionalResonance, color: 'var(--accent-rose)' },
                                    { label: t('detail.pacing'), value: viralFactors.pacing, color: 'var(--accent-amber)' },
                                    { label: t('detail.uniqueness'), value: viralFactors.uniqueness, color: 'var(--accent-emerald)' },
                                    { label: t('detail.shareability'), value: viralFactors.shareability, color: 'var(--accent-blue)' },
                                    { label: t('detail.trend_alignment'), value: viralFactors.trendAlignment, color: 'var(--accent-violet)' },
                                ].map(({ label, value, color }) => (
                                    <div key={label}>
                                        <div className="flex justify-between text-[10px] mb-2 font-mono uppercase tracking-wider text-[var(--text-muted)]">
                                            <span>{label}</span>
                                            <span className="text-white font-bold">{value}</span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                            <m.div
                                                className="h-full rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${value}%` }}
                                                transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                                                style={{
                                                    backgroundColor: color,
                                                    boxShadow: `0 0 10px ${color}40`
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </m.div>

                        <div id="ai-detection" className="grid grid-cols-2 gap-4">
                            <StatCard icon={Eye} label={t('detail.visual')} value={analysisResult?.visual?.visualQuality ?? 0} />
                            <StatCard icon={Volume2} label={t('detail.audio')} value={analysisResult?.audio?.overallAudioQuality ?? 0} />
                            <StatCard icon={Settings} label={t('detail.technical')} value={analysisResult?.technical?.overallTechnicalScore ?? 0} />
                            <StatCard icon={Zap} label={t('detail.scenes')} value={analysisResult?.scenes?.length ?? 0} isCount />
                        </div>

                        {analysisResult?.summary && (
                            <m.div
                                className="p-6 glass-card border-[var(--border-strong)] rounded-2xl border-l-[var(--accent-sky)] border-l-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic">{analysisResult.summary}</p>
                            </m.div>
                        )}
                    </m.div>

                    {/* Right: Prompts */}
                    <m.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        {/* Tab Selector */}
                        <div className="flex gap-2 p-1 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                            <button
                                onClick={() => setActiveTab('grok')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${activeTab === 'grok'
                                    ? 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-purple)] text-white shadow-lg'
                                    : 'text-[var(--text-secondary)] hover:text-white'
                                    }`}
                            >
                                <Camera className="w-4 h-4" />
                                <span className="font-medium">Grok AI Imagine</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('veo3')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${activeTab === 'veo3'
                                    ? 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-purple)] text-white shadow-lg'
                                    : 'text-[var(--text-secondary)] hover:text-white'
                                    }`}
                            >
                                <Film className="w-4 h-4" />
                                <span className="font-medium">Veo 3</span>
                            </button>
                        </div>

                        {/* Prompts Content */}
                        {generatedPrompts && (
                            <div className="space-y-4">
                                {activeTab === 'grok' ? (
                                    <>
                                        <PromptCard
                                            icon={Sparkles}
                                            title="Image Prompt"
                                            content={generatedPrompts.grokImagine.imagePrompt}
                                            copied={copiedField === 'grok-image'}
                                            onCopy={() => copyToClipboard(generatedPrompts.grokImagine.imagePrompt, 'grok-image')}
                                        />
                                        <PromptCard
                                            icon={Video}
                                            title="Motion Prompt"
                                            content={generatedPrompts.grokImagine.motionPrompt}
                                            copied={copiedField === 'grok-motion'}
                                            onCopy={() => copyToClipboard(generatedPrompts.grokImagine.motionPrompt, 'grok-motion')}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl">
                                                <p className="text-xs text-[var(--text-secondary)] mb-1">Style Notes</p>
                                                <p className="text-sm text-white">{generatedPrompts.grokImagine.styleNotes}</p>
                                            </div>
                                            <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl">
                                                <p className="text-xs text-[var(--text-secondary)] mb-1">Suggested Duration</p>
                                                <p className="text-2xl font-bold text-[var(--accent-primary)]">
                                                    {generatedPrompts.grokImagine.suggestedDuration}s
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <PromptCard
                                            icon={Film}
                                            title="Video Prompt"
                                            content={generatedPrompts.veo3.videoPrompt}
                                            copied={copiedField === 'veo-video'}
                                            onCopy={() => copyToClipboard(generatedPrompts.veo3.videoPrompt, 'veo-video')}
                                        />
                                        <PromptCard
                                            icon={Camera}
                                            title="Camera Directions"
                                            content={generatedPrompts.veo3.cameraDirections}
                                            copied={copiedField === 'veo-camera'}
                                            onCopy={() => copyToClipboard(generatedPrompts.veo3.cameraDirections, 'veo-camera')}
                                        />
                                        <PromptCard
                                            icon={Video}
                                            title="Motion Guidance"
                                            content={generatedPrompts.veo3.motionGuidance}
                                            copied={copiedField === 'veo-motion'}
                                            onCopy={() => copyToClipboard(generatedPrompts.veo3.motionGuidance, 'veo-motion')}
                                        />
                                        <PromptCard
                                            icon={Music}
                                            title="Audio Suggestions"
                                            content={generatedPrompts.veo3.audioSuggestions}
                                            copied={copiedField === 'veo-audio'}
                                            onCopy={() => copyToClipboard(generatedPrompts.veo3.audioSuggestions, 'veo-audio')}
                                        />
                                    </>
                                )}
                            </div>
                        )}

                        {/* Tips */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <TipsCard
                                title="💡 Enhancement Notes"
                                tips={generatedPrompts?.enhancementNotes || []}
                            />
                            <TipsCard
                                title="🚀 Viral Tips"
                                tips={generatedPrompts?.viralTips || []}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-4">
                            <m.button
                                onClick={handleGenerateRemix}
                                className="btn-secondary w-full border-[#22d3ee]/30 text-[#22d3ee] hover:bg-[#22d3ee]/5 flex items-center justify-center gap-2"
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <Wand2 className="w-5 h-5" />
                                {t('detail.generate_script')}
                            </m.button>
                            <m.button
                                id="export-prompts"
                                onClick={downloadPrompts}
                                className="btn-primary w-full"
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <Download className="w-5 h-5" />
                                {t('detail.download_prompts')}
                            </m.button>
                        </div>
                    </m.div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, isCount = false }: {
    icon: React.ElementType;
    label: string;
    value: number;
    isCount?: boolean;
}) {
    return (
        <m.div
            className="p-4 glass-card border-[var(--border)] rounded-2xl text-center group hover:border-[var(--accent-sky)]/30 transition-all duration-300"
            whileHover={{ y: -5 }}
        >
            <Icon className="w-5 h-5 mx-auto mb-2 text-[var(--accent-sky)] group-hover:scale-110 transition-transform" />
            <div className="text-2xl font-black text-white">{value}{!isCount && '%'}</div>
            <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">{label}</div>
        </m.div>
    );
}

function PromptCard({ icon: Icon, title, content, copied, onCopy }: {
    icon: React.ElementType;
    title: string;
    content: string;
    copied: boolean;
    onCopy: () => void;
}) {
    return (
        <m.div
            className="p-5 glass-card border-[var(--border-strong)] rounded-2xl relative group overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-sky)]/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-[var(--accent-sky)]/10 transition-all" />

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20">
                        <Icon className="w-4 h-4 text-[var(--accent-primary)]" />
                    </div>
                    <span className="text-xs font-black text-white uppercase tracking-widest">{title}</span>
                </div>
                <button
                    onClick={onCopy}
                    className={`p-2 rounded-lg transition-all ${copied
                        ? 'bg-[var(--accent-success)]/20 text-[var(--accent-success)]'
                        : 'hover:bg-white/10 text-[var(--text-secondary)]'
                        }`}
                >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
            </div>
            <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{content}</p>
        </m.div>
    );
}

function TipsCard({ title, tips }: { title: string; tips: string[] }) {
    return (
        <m.div
            className="p-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <h4 className="font-medium text-white mb-3">{title}</h4>
            <ul className="space-y-2">
                {tips.map((tip, i) => (
                    <li key={i} className="text-sm text-[var(--text-secondary)] flex gap-2">
                        <span className="text-[var(--accent-gold)]">•</span>
                        {tip}
                    </li>
                ))}
            </ul>
        </m.div>
    );
}
