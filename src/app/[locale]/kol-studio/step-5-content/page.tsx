'use client';

import { useKOLStudioStore } from '@/stores/kolStudioStore';
import { generateTikTokScriptPrompt } from '@/lib/kol/prompts';
import { KOL_THEMES, TikTokScript } from '@/lib/kol/types';
import { m } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, Loader2, Copy, Check, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
// import { useToastStore } from '@/stores/toastStore';
import { useApiKeyEnforcer } from '@/hooks/useApiKeyEnforcer';

export default function Step5ContentPage() {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('KOLStudio');

    const {
        kolProfile,
        // kolName,
        selectedTheme,
        customTheme,
        generatedScript,
        setGeneratedScript,
        isGeneratingScript,
        setIsGeneratingScript,
    } = useKOLStudioStore();

    const { apiKey } = useSettingsStore();
    // const { addToast } = useToastStore();
    const { checkApiKey, ApiKeyEnforcer } = useApiKeyEnforcer();

    const [topic, setTopic] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Redirect if no profile
    useEffect(() => {
        if (!kolProfile) {
            router.push('/kol-studio/step-2-profile');
        }
    }, [kolProfile, router]);

    const handleGenerateScript = async () => {
        if (!kolProfile || !topic.trim()) return;

        if (!checkApiKey()) return;

        setIsGeneratingScript(true);
        setError(null);

        try {
            const theme = selectedTheme || KOL_THEMES.find(t => t.id === 'fashion')!;
            const prompt = generateTikTokScriptPrompt(
                kolProfile,
                customTheme ? { ...theme, nameVi: customTheme } : theme,
                topic
            );

            const response = await fetch('/api/kol/generate-script', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    locale,
                    apiKey: apiKey,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate script');
            }

            let script: TikTokScript;
            if (typeof data.result === 'string') {
                script = JSON.parse(data.result);
            } else {
                script = data.result;
            }

            setGeneratedScript(script);
        } catch (err) {
            console.error('Error generating script:', err);
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
        } finally {
            setIsGeneratingScript(false);
        }
    };

    const handleCopyScript = () => {
        if (!generatedScript) return;

        const fullScript = `[HOOK - 0-3s]
${generatedScript.hook}

[BODY - 4-${generatedScript.duration - 5}s]
${generatedScript.body}

[CTA - cuối video]
${generatedScript.cta}

---
Giọng điệu: ${generatedScript.voiceTone}
Thời lượng: ~${generatedScript.duration}s`;

        navigator.clipboard.writeText(fullScript);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleNext = () => {
        router.push('/kol-studio/step-6-export');
    };

    if (!kolProfile) return null;

    return (
        <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full overflow-x-hidden">
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full space-y-6 flex-1 flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.push('/kol-studio/step-4-clone')}
                        className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="hidden sm:inline">{t('back') || 'Quay lại'}</span>
                    </button>
                    <div className="text-center flex-1 px-2 overflow-hidden">
                        <h2 className="text-xl md:text-2xl font-bold truncate">
                            {t('step5.title') || '📝 Tạo Kịch Bản TikTok'}
                        </h2>
                        <p className="text-xs md:text-sm text-[var(--text-muted)] truncate">
                            {t('step5.subtitle') || 'AI viết script phù hợp với KOL'}
                        </p>
                    </div>
                    <div className="w-10 sm:w-24 shrink-0" />
                </div>

                {/* Topic Input */}
                <div className="glass-card p-5 space-y-3">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">
                        Chủ đề video:
                    </label>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Ví dụ: Outfit đi làm mùa hè, Review son mới, Tips chăm da..."
                        className="w-full bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-xl px-4 py-3 text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                    />

                    {/* Quick Topic Suggestions */}
                    <div className="flex flex-wrap gap-2">
                        {[
                            'Phối đồ công sở',
                            'OOTD cuối tuần',
                            'Review sản phẩm mới',
                            'Tips làm đẹp',
                            'Get ready with me',
                        ].map((suggestion) => (
                            <button
                                key={suggestion}
                                onClick={() => setTopic(suggestion)}
                                className="text-xs px-3 py-1.5 rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-muted)] hover:text-white"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Generate Button */}
                <m.button
                    onClick={handleGenerateScript}
                    disabled={!topic.trim() || isGeneratingScript}
                    className={`
                        w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3
                        transition-all
                        ${topic.trim() && !isGeneratingScript
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-purple-500/30'
                            : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed'
                        }
                    `}
                    whileHover={topic.trim() ? { scale: 1.02 } : {}}
                    whileTap={topic.trim() ? { scale: 0.98 } : {}}
                >
                    {isGeneratingScript ? (
                        <>
                            <Loader2 size={24} className="animate-spin" />
                            Đang viết kịch bản...
                        </>
                    ) : (
                        <>
                            <Video size={24} />
                            Viết Kịch Bản TikTok
                        </>
                    )}
                </m.button>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Generated Script Display */}
                {generatedScript && (
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4 flex-1"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-[var(--accent-primary)]">
                                Kịch Bản Video (~{generatedScript.duration}s)
                            </h3>
                            <button
                                onClick={handleCopyScript}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] transition-colors text-sm"
                            >
                                {copied ? <Check size={16} className="text-[var(--success)]" /> : <Copy size={16} />}
                                {copied ? 'Đã copy!' : 'Copy'}
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Hook */}
                            <div className="glass-card p-4 border-l-4 border-red-500">
                                <p className="text-xs text-red-400 font-bold mb-2">🎣 HOOK (0-3s)</p>
                                <p className="text-white">{generatedScript.hook}</p>
                            </div>

                            {/* Body */}
                            <div className="glass-card p-4 border-l-4 border-blue-500">
                                <p className="text-xs text-blue-400 font-bold mb-2">📢 NỘI DUNG CHÍNH</p>
                                <p className="text-white whitespace-pre-wrap">{generatedScript.body}</p>
                            </div>

                            {/* CTA */}
                            <div className="glass-card p-4 border-l-4 border-green-500">
                                <p className="text-xs text-green-400 font-bold mb-2">👆 CALL TO ACTION</p>
                                <p className="text-white">{generatedScript.cta}</p>
                            </div>

                            {/* Voice Tone */}
                            <div className="glass-card p-3 bg-[var(--bg-tertiary)]/50">
                                <p className="text-xs text-[var(--text-muted)]">
                                    <span className="font-bold">Giọng điệu:</span> {generatedScript.voiceTone}
                                </p>
                            </div>
                        </div>

                        {/* Regenerate */}
                        <button
                            onClick={handleGenerateScript}
                            disabled={isGeneratingScript}
                            className="w-full py-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] transition-colors flex items-center justify-center gap-2"
                        >
                            <Sparkles size={18} />
                            Viết lại kịch bản khác
                        </button>

                        {/* Next Button */}
                        <m.button
                            onClick={handleNext}
                            className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 btn-primary shadow-lg"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Xuất Kết Quả
                            <ArrowRight size={20} />
                        </m.button>
                    </m.div>
                )}
            </m.div>
            <ApiKeyEnforcer />
        </div>
    );
}
