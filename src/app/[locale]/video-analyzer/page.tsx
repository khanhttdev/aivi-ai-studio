'use client';

import { useVideoAnalyzerStore } from '@/stores/videoAnalyzerStore';
import { useLocale, useTranslations } from 'next-intl';
import { m } from 'framer-motion';
import {
    Video,
    Link2,
    Upload,
    Sparkles,
    TrendingUp,
    FileText,
    Clock,
    Trash2,
    ArrowRight
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VideoAnalyzerPage() {
    const {
        videoUrl,
        videoFile,
        videoPreviewUrl,
        status,
        progress,
        progressMessage,
        errorMessage,
        currentAnalysis,
        analysisHistory,
        isLoadingHistory,
        setVideoUrl,
        setVideoFile,
        analyzeVideo,
        fetchHistory,
        deleteAnalysis,
        reset,
    } = useVideoAnalyzerStore();

    const t = useTranslations('VideoAnalyzer');
    const locale = useLocale();
    const router = useRouter();
    const [inputMode, setInputMode] = useState<'url' | 'upload'>('upload');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleFileDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('video/')) {
            setVideoFile(file);
        }
    }, [setVideoFile]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
        }
    }, [setVideoFile]);

    const isProcessing = status === 'uploading' || status === 'processing';
    const canAnalyze = (inputMode === 'url' ? videoUrl.trim() : videoFile) && !isProcessing;

    return (
        <div className="py-8 px-4 md:px-8 lg:px-16 lg:pl-48">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <m.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 mb-6">
                        <Video className="w-4 h-4 text-[var(--accent-primary)]" />
                        <span className="text-sm font-medium text-[var(--accent-primary)]">{t('nav_title')}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="gradient-text">{t('page_title')}</span>
                    </h1>
                    <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
                        {t('page_subtitle')}
                    </p>
                </m.div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Left: Input Section */}
                    <m.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-3 space-y-6"
                    >
                        {/* Input Mode Tabs */}
                        <div className="flex gap-2 p-1 bg-transparent rounded-xl border border-[var(--border)]">
                            <button
                                onClick={() => setInputMode('upload')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${inputMode === 'upload'
                                    ? 'bg-[var(--accent-primary)] text-white shadow-lg'
                                    : 'text-[var(--text-secondary)] hover:text-white'
                                    }`}
                            >
                                <Upload className="w-4 h-4" />
                                <span className="font-medium">{t('tab_upload')}</span>
                            </button>
                            <m.button
                                onClick={() => setInputMode('url')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${inputMode === 'url'
                                    ? 'bg-[var(--accent-primary)] text-white shadow-lg'
                                    : 'text-[var(--text-secondary)] hover:text-white'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Link2 className="w-4 h-4" />
                                <span className="font-medium">{t('tab_url')}</span>
                            </m.button>
                        </div>

                        {/* Upload Zone / URL Input */}
                        {inputMode === 'upload' ? (
                            <div
                                onDrop={handleFileDrop}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={() => fileInputRef.current?.click()}
                                className={`
                                    relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all glass-card
                                    ${videoPreviewUrl
                                        ? 'border-[var(--accent-emerald)] bg-[var(--accent-emerald)]/5'
                                        : 'border-[var(--border)] hover:border-[var(--accent-primary)] bg-white/5 hover:bg-white/10'
                                    }
                                `}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="video/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />

                                {videoPreviewUrl ? (
                                    <div className="space-y-4">
                                        <video
                                            src={videoPreviewUrl}
                                            className="max-h-64 mx-auto rounded-xl shadow-lg"
                                            controls
                                        />
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            {videoFile?.name} ({(videoFile!.size / 1024 / 1024).toFixed(2)} MB)
                                        </p>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setVideoFile(null); }}
                                            className="text-sm text-red-400 hover:text-red-300"
                                        >
                                            Xóa video
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center">
                                            <Upload className="w-8 h-8 text-[var(--accent-primary)]" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-medium text-white">{t('uploadTitle')}</p>
                                            <p className="text-sm text-[var(--text-secondary)]">{t('uploadDescription')}</p>
                                        </div>
                                        <p className="text-xs text-[var(--text-secondary)]">
                                            Hỗ trợ: MP4, MOV, WebM, AVI
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="relative">
                                    <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                                    <input
                                        type="url"
                                        value={videoUrl}
                                        onChange={(e) => setVideoUrl(e.target.value)}
                                        placeholder={t('url_placeholder')}
                                        className="w-full pl-12 pr-4 py-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-white placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                                    />
                                </div>
                                <p className="text-xs text-[var(--text-secondary)]">
                                    {t('url_support')}
                                </p>
                            </div>
                        )}

                        {/* Error Message */}
                        {errorMessage && (
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                {errorMessage}
                            </div>
                        )}

                        {/* Progress */}
                        {isProcessing && (
                            <div className="p-6 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-[var(--text-secondary)]">{progressMessage}</span>
                                    <span className="text-sm font-medium text-[var(--accent-primary)]">{progress}%</span>
                                </div>
                                <div className="h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden border border-white/10">
                                    <m.div
                                        className="h-full bg-gradient-to-r from-[var(--accent-sky)] to-[var(--accent-violet)]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Analyze Button */}
                        <m.button
                            onClick={() => analyzeVideo(locale)}
                            disabled={!canAnalyze}
                            className={`
                                w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all
                                ${canAnalyze
                                    ? 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-purple)] text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
                                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] cursor-not-allowed'
                                }
                            `}
                            whileHover={canAnalyze ? { scale: 1.02 } : {}}
                            whileTap={canAnalyze ? { scale: 0.98 } : {}}
                        >
                            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            {isProcessing ? t('analyzing') : t('btn_analyze')}
                            {!isProcessing && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </m.button>

                        {/* Analysis Result Preview */}
                        {currentAnalysis && status === 'completed' && (
                            <m.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-6 bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-purple)]/10 border border-[var(--accent-primary)]/30 rounded-2xl space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-[var(--accent-success)]" />
                                        Viral Score
                                    </h3>
                                    <div className="text-4xl font-bold gradient-text">
                                        {currentAnalysis.viralScore}/100
                                    </div>
                                </div>

                                <p className="text-[var(--text-secondary)]">
                                    {currentAnalysis.analysisResult?.summary}
                                </p>

                                <button
                                    onClick={() => router.push(`/video-analyzer/${currentAnalysis.id}`)}
                                    className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    <FileText className="w-4 h-4" />
                                    {t('view_detail')}
                                </button>
                            </m.div>
                        )}
                    </m.div>

                    {/* Right: History */}
                    <m.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2"
                    >
                        <div className="sticky top-8">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-[var(--accent-cyan)]" />
                                {t('history_title')}
                            </h2>

                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                                {isLoadingHistory ? (
                                    <div className="text-center py-8 text-[var(--text-secondary)]">
                                        {t('loading')}
                                    </div>
                                ) : analysisHistory.length === 0 ? (
                                    <div className="text-center py-8 text-[var(--text-secondary)]">
                                        <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>{t('empty_history')}</p>
                                    </div>
                                ) : (
                                    analysisHistory.map((analysis) => (
                                        <m.div
                                            key={analysis.id}
                                            onClick={() => router.push(`/video-analyzer/${analysis.id}`)}
                                            className="p-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl hover:border-[var(--accent-primary)]/50 transition-colors group cursor-pointer"
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-white truncate">{analysis.title}</p>
                                                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                                                        {new Date(analysis.createdAt).toLocaleDateString('vi-VN')}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="text-sm font-bold text-[var(--accent-success)]">
                                                        {analysis.viralScore}
                                                    </div>
                                                    <button
                                                        onClick={() => deleteAnalysis(analysis.id)}
                                                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </m.div>
                                    ))
                                )}
                            </div>

                            {analysisHistory.length > 0 && (
                                <button
                                    onClick={reset}
                                    className="w-full mt-4 py-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors"
                                >
                                    Phân tích mới
                                </button>
                            )}
                        </div>
                    </m.div>
                </div>
            </div>
        </div>
    );
}
