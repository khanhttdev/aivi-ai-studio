'use client';

import { useImageStudioStore } from '@/stores/imageStudioStore';
import { Download, ZoomIn, ZoomOut, Maximize2, RotateCcw, Check, X, ArrowLeft, Play, Pause, ChevronLeft, ChevronRight, Film, Package, Video, Loader2 } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { exportSlideshowVideo, downloadVideo } from '@/lib/services/videoExport';
import Image from 'next/image';

export default function Step3ResultPage() {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('ImageStudio.page');
    const { finalResult, setFinalResult, generatedScenes, setGeneratedScenes, reset } = useImageStudioStore();

    // Single image states
    const [zoom, setZoom] = useState(1);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showConfirmReset, setShowConfirmReset] = useState(false);

    // Slideshow states
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isDownloadingAll, setIsDownloadingAll] = useState(false);
    const [isExportingVideo, setIsExportingVideo] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    // const [exportStatus, setExportStatus] = useState('');
    const slideInterval = useRef<NodeJS.Timeout | null>(null);

    const isVideoMode = generatedScenes && generatedScenes.length > 0;

    // Redirect if no result
    useEffect(() => {
        if (!finalResult && (!generatedScenes || generatedScenes.length === 0)) {
            router.push('/image-studio/step-2-generation');
        }
    }, [finalResult, generatedScenes, router]);

    const nextSlide = useCallback(() => {
        if (!generatedScenes) return;
        setCurrentSlide(prev => (prev + 1) % generatedScenes.length);
    }, [generatedScenes]);

    const prevSlide = useCallback(() => {
        if (!generatedScenes) return;
        setCurrentSlide(prev => (prev - 1 + generatedScenes.length) % generatedScenes.length);
    }, [generatedScenes]);

    // Handle Esc key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isFullscreen) setIsFullscreen(false);
                if (showConfirmReset) setShowConfirmReset(false);
            }
            // Arrow keys for slideshow
            if (isVideoMode) {
                if (e.key === 'ArrowLeft') prevSlide();
                if (e.key === 'ArrowRight') nextSlide();
                if (e.key === ' ') {
                    e.preventDefault();
                    setIsPlaying(p => !p);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen, showConfirmReset, isVideoMode, nextSlide, prevSlide]);

    // Auto-play slideshow
    useEffect(() => {
        if (isPlaying && isVideoMode) {
            slideInterval.current = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % (generatedScenes?.length || 1));
            }, 2000);
        }
        return () => {
            if (slideInterval.current) clearInterval(slideInterval.current);
        };
    }, [isPlaying, isVideoMode, generatedScenes?.length]);



    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));

    // Download single image
    const handleDownload = async (imageUrl?: string, filename?: string) => {
        const url = imageUrl || finalResult;
        if (!url) return;

        setIsDownloading(true);
        await new Promise(resolve => setTimeout(resolve, 300));

        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `aivi-result-${Date.now()}.png`;
        link.click();

        setIsDownloading(false);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 2000);
    };

    // Download all scenes as separate files
    const handleDownloadAll = async () => {
        if (!generatedScenes || generatedScenes.length === 0) return;

        setIsDownloadingAll(true);

        for (let i = 0; i < generatedScenes.length; i++) {
            const scene = generatedScenes[i];
            await new Promise(resolve => setTimeout(resolve, 300));

            const link = document.createElement('a');
            link.href = scene.imageUrl;
            link.download = `aivi-scene-${i + 1}-${Date.now()}.png`;
            link.click();
        }

        setIsDownloadingAll(false);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 2000);
    };

    // Export video from scenes
    const handleExportVideo = async () => {
        if (!generatedScenes || generatedScenes.length === 0) return;

        setIsExportingVideo(true);
        setExportProgress(0);
        // setExportStatus('Starting...');

        try {
            const videoBlob = await exportSlideshowVideo(
                generatedScenes,
                {
                    sceneDuration: 3,
                    transition: 'fade',
                    transitionDuration: 0.5,
                },
                (progress) => {
                    setExportProgress(Math.round(progress));
                    // setExportStatus(status);
                }
            );

            downloadVideo(videoBlob, `aivi-video-story-${Date.now()}.webm`);
            setDownloadSuccess(true);
            setTimeout(() => setDownloadSuccess(false), 2000);
        } catch (error) {
            console.error('Error exporting video:', error);
            alert(error instanceof Error ? error.message : 'Failed to export video');
        } finally {
            setIsExportingVideo(false);
            setExportProgress(0);
            // setExportStatus('');
        }
    };

    const handleReset = () => {
        setFinalResult(null);
        setGeneratedScenes([]);
        reset();
        router.push('/image-studio/step-1-input');
    };

    if (!finalResult && (!generatedScenes || generatedScenes.length === 0)) return null;

    return (
        <div className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full h-full pb-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => router.push('/image-studio/step-2-generation')}
                    className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    {t('back_composition')}
                </button>
                <div className="flex items-center gap-3">
                    {isVideoMode && (
                        <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-sm text-purple-400 flex items-center gap-2">
                            <Film size={14} />
                            Video Story
                        </span>
                    )}
                    <h1 className="text-3xl font-bold gradient-text">{t('final_title')}</h1>
                </div>
                <div className="w-24" />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative min-h-0 bg-[var(--bg-secondary)]/30 border border-[var(--border)] rounded-3xl overflow-hidden backdrop-blur-sm">

                {isVideoMode ? (
                    /* Slideshow Mode */
                    <>
                        <div className="relative w-full h-full flex items-center justify-center p-8">
                            {/* Prev Button */}
                            <button
                                onClick={prevSlide}
                                className="absolute left-4 z-20 p-3 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
                            >
                                <ChevronLeft size={24} />
                            </button>

                            {/* Current Slide */}
                            <AnimatePresence mode="wait">
                                <m.div
                                    key={currentSlide}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    className="relative"
                                >
                                    <Image
                                        src={generatedScenes[currentSlide]?.imageUrl}
                                        alt={`Scene ${currentSlide + 1}`}
                                        width={512}
                                        height={912}
                                        className="max-w-full max-h-[60vh] object-contain shadow-2xl rounded-lg"
                                        unoptimized
                                    />
                                    {/* Overlay Text */}
                                    {generatedScenes[currentSlide]?.overlayText && (
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                                            {generatedScenes[currentSlide].overlayText}
                                        </div>
                                    )}
                                </m.div>
                            </AnimatePresence>

                            {/* Next Button */}
                            <button
                                onClick={nextSlide}
                                className="absolute right-4 z-20 p-3 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        {/* Slideshow Controls */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-black/60 backdrop-blur-md rounded-full border border-white/10 z-20">
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                            </button>

                            <div className="flex gap-1">
                                {generatedScenes.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setCurrentSlide(idx);
                                            setIsPlaying(false);
                                        }}
                                        className={`w-8 h-1.5 rounded-full transition-all ${idx === currentSlide
                                            ? 'bg-[var(--accent-primary)]'
                                            : 'bg-white/30 hover:bg-white/50'
                                            }`}
                                    />
                                ))}
                            </div>

                            <span className="text-sm text-white/70 min-w-[50px] text-center">
                                {currentSlide + 1} / {generatedScenes.length}
                            </span>
                        </div>

                        {/* Thumbnail Strip */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 bg-black/40 rounded-xl z-10">
                            {generatedScenes.map((scene, idx) => (
                                <button
                                    key={scene.id}
                                    onClick={() => {
                                        setCurrentSlide(idx);
                                        setIsPlaying(false);
                                    }}
                                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${idx === currentSlide
                                        ? 'border-[var(--accent-primary)] scale-110'
                                        : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <Image src={scene.imageUrl} alt={`Thumb ${idx + 1}`} fill className="object-cover" unoptimized />
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    /* Single Image Mode */
                    <>
                        <div className="relative w-full h-full flex items-center justify-center p-8 overflow-hidden">
                            <m.div
                                className="relative z-10"
                                animate={{ scale: zoom }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                drag={zoom > 1}
                                dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
                            >
                                <Image
                                    src={finalResult || ''}
                                    alt="Final Result"
                                    width={512}
                                    height={912}
                                    className="max-w-full max-h-[70vh] object-contain shadow-2xl rounded-lg"
                                    unoptimized
                                />
                            </m.div>
                        </div>

                        {/* Floating Controls */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 z-20">
                            <button onClick={handleZoomOut} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ZoomOut size={18} /></button>
                            <span className="text-sm font-mono text-white/80 min-w-[50px] text-center">{Math.round(zoom * 100)}%</span>
                            <button onClick={handleZoomIn} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ZoomIn size={18} /></button>
                            <div className="w-px h-6 bg-white/10 mx-1" />
                            <button onClick={() => setIsFullscreen(true)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><Maximize2 size={18} /></button>
                        </div>
                    </>
                )}
            </div>

            {/* Bottom Action Bar */}
            <div className="mt-8 flex justify-center gap-4">
                <button
                    onClick={() => setShowConfirmReset(true)}
                    className="btn-secondary px-8 py-4 flex items-center gap-2"
                >
                    <RotateCcw size={20} />
                    {t('new_creation')}
                </button>

                {isVideoMode ? (
                    /* Video Mode Actions */
                    <div className="flex gap-3">
                        {/* Download All Button */}
                        <m.button
                            onClick={handleDownloadAll}
                            disabled={isDownloadingAll || isExportingVideo}
                            className={`px-8 py-4 flex items-center gap-3 font-bold shadow-lg transition-all rounded-xl border border-purple-500/30 ${downloadSuccess
                                ? 'bg-[var(--success)]'
                                : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)]'
                                }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isDownloadingAll ? (
                                <>
                                    <Package size={20} className="animate-pulse" />
                                    {t('downloading') || 'Downloading...'}
                                </>
                            ) : (
                                <>
                                    <Package size={20} />
                                    {t('download_all') || `Images (${generatedScenes.length})`}
                                </>
                            )}
                        </m.button>

                        {/* Export Video Button */}
                        <m.button
                            onClick={handleExportVideo}
                            disabled={isDownloadingAll || isExportingVideo}
                            className={`px-12 py-4 flex items-center gap-3 text-lg font-bold shadow-lg transition-all rounded-xl ${downloadSuccess
                                ? 'bg-[var(--success)]'
                                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-purple-500/30'
                                }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {downloadSuccess ? (
                                <>
                                    <Check size={24} />
                                    {t('saved_device')}
                                </>
                            ) : isExportingVideo ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" />
                                    <div className="flex flex-col items-start text-sm">
                                        <span>{exportProgress}%</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Video size={24} />
                                    {locale === 'vi' ? 'Xuất Video' : 'Export Video'}
                                </>
                            )}
                        </m.button>
                    </div>
                ) : (
                    /* Download Single Button */
                    <m.button
                        onClick={() => handleDownload()}
                        disabled={isDownloading}
                        className={`btn-primary px-12 py-4 flex items-center gap-3 text-lg font-bold shadow-lg hover:shadow-cyan-500/20 ${downloadSuccess ? 'bg-[var(--success)]' : ''}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {downloadSuccess ? (
                            <>
                                <Check size={24} />
                                {t('saved_device')}
                            </>
                        ) : isDownloading ? (
                            <>
                                <Download size={24} className="animate-bounce" />
                                {t('downloading')}
                            </>
                        ) : (
                            <>
                                <Download size={24} />
                                {t('download_high_res')}
                            </>
                        )}
                    </m.button>
                )}
            </div>

            {/* Fullscreen Overlay (Single Image only) */}
            <AnimatePresence>
                {isFullscreen && !isVideoMode && (
                    <m.div
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsFullscreen(false)}
                    >
                        <button
                            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-20"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsFullscreen(false);
                            }}
                        >
                            <X size={28} />
                        </button>

                        <m.img
                            src={finalResult || ''}
                            alt="Fullscreen Result"
                            className="max-w-full max-h-full object-contain cursor-default"
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </m.div>
                )}
            </AnimatePresence>

            {/* Confirm Reset Modal */}
            <AnimatePresence>
                {showConfirmReset && (
                    <m.div
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowConfirmReset(false)}
                    >
                        <m.div
                            className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-6 max-w-md w-full shadow-2xl"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 text-[var(--accent-warning)] mb-4">
                                <div className="p-3 bg-[var(--accent-warning)]/10 rounded-full">
                                    <RotateCcw size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white">{t('new_creation')}?</h3>
                            </div>

                            <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
                                {t('confirm_reset')}
                            </p>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowConfirmReset(false)}
                                    className="px-5 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-[var(--text-secondary)] font-medium"
                                >
                                    {locale === 'vi' ? 'Hủy' : 'Cancel'}
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] text-black font-bold hover:brightness-110 transition-all shadow-lg shadow-cyan-500/20"
                                >
                                    {locale === 'vi' ? 'Bắt đầu mới' : 'Start New'}
                                </button>
                            </div>
                        </m.div>
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    );
}
