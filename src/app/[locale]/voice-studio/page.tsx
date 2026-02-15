'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { m, AnimatePresence } from 'framer-motion';
import {
    Mic, Search, Play, Pause, Download, Trash2,
    Wand2, Loader2, Check, ChevronLeft, ChevronRight,
    Music2, AlertCircle, StopCircle, Merge,
} from 'lucide-react';
import { useVoiceStudioStore, AppState } from '@/stores/voiceStudioStore';
import { CATEGORIES, VOICE_PRESETS } from '@/lib/voice-studio/constants';
import { useApiKeyEnforcer } from '@/hooks/useApiKeyEnforcer';

const ITEMS_PER_PAGE = 8;

export default function VoiceStudioPage() {
    const t = useTranslations('VoiceStudio');

    const { checkApiKey, ApiKeyEnforcer } = useApiKeyEnforcer();

    const {
        inputText, setInputText,
        selectedCategory, setSelectedCategory,
        selectedVoiceId, setSelectedVoiceId,
        speed, setSpeed,
        pitch, setPitch,
        appState,
        segments,
        isMerging,
        handleGenerate,
        handleStop,
        handleClear,
        handleMergeAndDownload,
        getProgress,
        getHasCompletedSegments,
        getCurrentVoice,
        processNextSegment,
    } = useVoiceStudioStore();

    const handleGenerateWithAuth = () => {
        if (!checkApiKey()) return;
        handleGenerate();
    };

    // Voice selector state
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Audio playback state
    const [playingId, setPlayingId] = useState<string | null>(null);
    const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});

    // Trigger processing when segments change
    useEffect(() => {
        if (appState === AppState.PROCESSING) {
            processNextSegment();
        }
    }, [segments, appState, processNextSegment]);

    // Update playback rate when speed changes
    useEffect(() => {
        Object.values(audioRefs.current).forEach(audio => {
            if (audio) audio.playbackRate = speed;
        });
    }, [speed]);

    // Filter voices
    const filteredVoices = VOICE_PRESETS.filter(v =>
        v.categoryId === selectedCategory &&
        (v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.style.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.styleEn.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const totalPages = Math.ceil(filteredVoices.length / ITEMS_PER_PAGE);
    const paginatedVoices = filteredVoices.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Audio playback
    const togglePlay = useCallback((id: string) => {
        const audio = audioRefs.current[id];
        if (!audio) return;
        audio.playbackRate = speed;

        if (playingId === id) {
            audio.pause();
            setPlayingId(null);
        } else {
            if (playingId && audioRefs.current[playingId]) {
                audioRefs.current[playingId]?.pause();
            }
            audio.play();
            setPlayingId(id);
        }
    }, [playingId, speed]);

    const progress = getProgress();
    const hasCompleted = getHasCompletedSegments();
    const currentVoice = getCurrentVoice();
    const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
    const charCount = inputText.length;

    return (
        <main className="min-h-screen pb-32">
            {/* Header Section */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-6">
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center space-y-3"
                >
                    <div className="inline-flex items-center gap-2 glass-pill text-sm text-white/60 mb-4">
                        <Mic className="w-4 h-4 text-[var(--accent-sky)]" />
                        <span>Gemini 2.5 Flash TTS</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black">
                        <span className="text-white">{t('title').split(' ')[0]} </span>
                        <span className="gradient-text">{t('title').split(' ').slice(1).join(' ') || 'Studio'}</span>
                    </h1>
                    <p className="text-white/50 text-lg">{t('subtitle')}</p>
                </m.div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">

                {/* ===== VOICE SELECTOR ===== */}
                <m.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6"
                >
                    <h2 className="text-sm font-bold text-white/50 uppercase flex items-center gap-2 mb-5">
                        <Mic className="w-4 h-4 text-[var(--accent-sky)]" />
                        {t('select_voice')}
                    </h2>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-2 mb-6 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setSelectedCategory(cat.id);
                                    setCurrentPage(1);
                                    setSearchQuery('');
                                }}
                                disabled={appState === AppState.PROCESSING}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${cat.id === selectedCategory
                                    ? 'bg-[var(--accent-sky)] text-black shadow-lg shadow-[var(--accent-sky)]/20'
                                    : 'text-white/40 hover:text-white/80 hover:bg-white/[0.05]'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Search + Count */}
                    <div className="flex gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder={t('search_voice')}
                                className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/60 focus:outline-none focus:border-[var(--accent-sky)]/30 transition-colors"
                            />
                        </div>
                        <div className="px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-white/50 flex items-center">
                            {filteredVoices.length} {t('voice_count')}
                        </div>
                    </div>

                    {/* Voice Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <AnimatePresence mode="popLayout">
                            {paginatedVoices.map(voice => (
                                <m.button
                                    key={voice.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    whileHover={{ y: -2 }}
                                    onClick={() => setSelectedVoiceId(voice.id)}
                                    disabled={appState === AppState.PROCESSING}
                                    className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 ${voice.id === selectedVoiceId
                                        ? 'border-[var(--accent-sky)] bg-[var(--accent-sky)]/[0.06] shadow-lg shadow-[var(--accent-sky)]/10'
                                        : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[10px] uppercase font-bold px-2 py-1 bg-white/[0.08] rounded text-white/60">
                                            {voice.style}
                                        </span>
                                        {voice.id === selectedVoiceId && (
                                            <m.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-5 h-5 rounded-full bg-[var(--accent-sky)] flex items-center justify-center"
                                            >
                                                <Check className="w-3 h-3 text-black" />
                                            </m.div>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-lg text-white">{voice.name}</h3>
                                    <p className="text-xs text-white/40 mt-1">{voice.gender} · {voice.geminiVoiceName}</p>
                                    {voice.description && (
                                        <p className="text-xs text-white/60 mt-2 line-clamp-2">{voice.description}</p>
                                    )}
                                </m.button>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-3 mt-6">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white disabled:opacity-30 transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-white/50">{currentPage} / {totalPages}</span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white disabled:opacity-30 transition-all"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </m.section>

                {/* ===== CONTROLS: Speed & Pitch ===== */}
                <m.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    {/* Speed */}
                    <div className="glass-card p-6">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-semibold text-white/70">{t('speed_label')}</span>
                            <span className="text-lg font-bold text-[var(--accent-sky)]">{speed.toFixed(1)}x</span>
                        </div>
                        <input
                            type="range"
                            min="0.5"
                            max="2.0"
                            step="0.1"
                            value={speed}
                            onChange={(e) => setSpeed(parseFloat(e.target.value))}
                            className="w-full accent-[var(--accent-sky)] h-2 bg-white/[0.08] rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent-sky)]
                [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-[var(--accent-sky)]/30
                [&::-webkit-slider-thumb]:cursor-pointer"
                        />
                    </div>

                    {/* Pitch */}
                    <div className="glass-card p-6">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-semibold text-white/70">{t('pitch_label')}</span>
                            <span className="text-lg font-bold text-[var(--accent-rose)]">{pitch}</span>
                        </div>
                        <input
                            type="range"
                            min="-2"
                            max="2"
                            step="1"
                            value={pitch}
                            onChange={(e) => setPitch(parseInt(e.target.value))}
                            className="w-full accent-[var(--accent-rose)] h-2 bg-white/[0.08] rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent-rose)]
                [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-[var(--accent-rose)]/30
                [&::-webkit-slider-thumb]:cursor-pointer"
                        />
                    </div>
                </m.section>

                {/* ===== TEXT INPUT ===== */}
                <m.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6"
                >
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={t('input_placeholder')}
                        disabled={appState === AppState.PROCESSING}
                        className="w-full h-64 p-4 bg-white/[0.03] rounded-xl border border-white/[0.06] text-white text-base
              placeholder:text-white/25 resize-y focus:outline-none focus:border-[var(--accent-sky)]/30
              transition-colors disabled:opacity-50"
                    />
                    <div className="flex gap-4 mt-3 text-xs text-white/40">
                        <span>{wordCount} {t('word_count')}</span>
                        <span>·</span>
                        <span>{charCount} {t('char_count')}</span>
                        {currentVoice && (
                            <>
                                <span>·</span>
                                <span className="text-[var(--accent-sky)]">
                                    {currentVoice.name} ({currentVoice.geminiVoiceName})
                                </span>
                            </>
                        )}
                    </div>
                </m.section>

                {/* ===== AUDIO RESULTS ===== */}
                <AnimatePresence>
                    {segments.length > 0 && (
                        <m.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-3"
                        >
                            <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <Music2 className="w-5 h-5 text-[var(--accent-sky)]" />
                                {t('results_title')}
                            </h2>

                            <div className="space-y-3">
                                {segments.map((segment, index) => (
                                    <m.div
                                        key={segment.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm"
                                    >
                                        {/* Segment info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-white/40 font-bold uppercase mb-1">
                                                {t('segment_label')} {index + 1}
                                            </p>
                                            <p className="text-sm text-white/70 truncate">{segment.text}</p>
                                        </div>

                                        {/* Status / Controls */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            {segment.status === 'pending' && (
                                                <span className="text-xs text-white/60 px-3 py-1.5 rounded-lg bg-white/[0.04]">
                                                    {t('status_pending')}
                                                </span>
                                            )}
                                            {segment.status === 'processing' && (
                                                <span className="flex items-center gap-2 text-xs text-[var(--accent-amber)] px-3 py-1.5 rounded-lg bg-[var(--accent-amber)]/[0.08]">
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                    {t('status_processing')}
                                                </span>
                                            )}
                                            {segment.status === 'error' && (
                                                <span className="flex items-center gap-2 text-xs text-[var(--accent-rose)] px-3 py-1.5 rounded-lg bg-[var(--accent-rose)]/[0.08]">
                                                    <AlertCircle className="w-3 h-3" />
                                                    {t('status_error')}
                                                </span>
                                            )}
                                            {segment.status === 'completed' && segment.url && (
                                                <>
                                                    <audio
                                                        ref={(el) => { audioRefs.current[segment.id] = el; }}
                                                        src={segment.url}
                                                        onEnded={() => setPlayingId(null)}
                                                        className="hidden"
                                                    />
                                                    <m.button
                                                        onClick={() => togglePlay(segment.id)}
                                                        className="p-2.5 rounded-full bg-white/[0.06] hover:bg-[var(--accent-sky)]/[0.15] text-white/70 hover:text-[var(--accent-sky)] transition-all"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        {playingId === segment.id
                                                            ? <Pause className="w-4 h-4" />
                                                            : <Play className="w-4 h-4" />}
                                                    </m.button>
                                                    <m.a
                                                        href={segment.url}
                                                        download={`voice_segment_${index + 1}.wav`}
                                                        className="p-2.5 rounded-full bg-white/[0.06] hover:bg-[var(--accent-emerald)]/[0.15] text-white/70 hover:text-[var(--accent-emerald)] transition-all"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </m.a>
                                                </>
                                            )}
                                        </div>
                                    </m.div>
                                ))}
                            </div>
                        </m.section>
                    )}
                </AnimatePresence>
            </div>

            {/* ===== STICKY ACTION BAR ===== */}
            <div className="fixed bottom-0 left-0 right-0 z-30">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-4">
                    <m.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--bg-deep)]/90 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/50"
                    >
                        {/* Generate / Stop Button */}
                        {appState === AppState.PROCESSING ? (
                            <m.button
                                onClick={handleStop}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent-rose)]/20
                  text-[var(--accent-rose)] font-bold text-sm hover:bg-[var(--accent-rose)]/30 transition-all"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <StopCircle className="w-4 h-4" />
                                {t('btn_stop')}
                            </m.button>
                        ) : (
                            <m.button
                                onClick={handleGenerateWithAuth}
                                disabled={!inputText.trim() && segments.length === 0}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all
                  disabled:opacity-30 disabled:cursor-not-allowed
                  bg-gradient-to-r from-[var(--accent-sky)] to-[var(--accent-blue)] text-black
                  hover:shadow-lg hover:shadow-[var(--accent-sky)]/20 hover:scale-[1.02]"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Wand2 className="w-4 h-4" />
                                {segments.length > 0 && segments.some(s => s.status === 'pending' || s.status === 'processing')
                                    ? t('btn_continue')
                                    : t('btn_start')}
                            </m.button>
                        )}

                        {/* Merge & Download */}
                        {hasCompleted && (
                            <m.button
                                onClick={handleMergeAndDownload}
                                disabled={isMerging}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.06]
                  text-white/80 font-semibold text-sm hover:bg-white/[0.1] transition-all
                  disabled:opacity-50"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {isMerging ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Merge className="w-4 h-4" />
                                )}
                                {isMerging ? t('merging') : t('btn_merge_download')}
                            </m.button>
                        )}

                        {/* Clear */}
                        {segments.length > 0 && (
                            <m.button
                                onClick={handleClear}
                                className="p-3 rounded-xl text-white/40 hover:text-[var(--accent-rose)] hover:bg-[var(--accent-rose)]/[0.08] transition-all"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <Trash2 className="w-4 h-4" />
                            </m.button>
                        )}

                        {/* Progress Bar */}
                        {segments.length > 0 && (
                            <div className="flex-1 flex flex-col justify-center ml-2">
                                <div className="flex justify-between text-xs text-white/50 mb-1">
                                    <span>{segments.filter(s => s.status === 'completed').length}/{segments.length}</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                                    <m.div
                                        className="h-full rounded-full bg-gradient-to-r from-[var(--accent-sky)] to-[var(--accent-blue)]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.5, ease: 'easeOut' }}
                                    />
                                </div>
                            </div>
                        )}
                    </m.div>
                </div>
            </div>
            <ApiKeyEnforcer />
        </main>
    );
}
