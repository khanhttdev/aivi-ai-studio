'use client';

import { useState } from 'react';
import { useImageStudioStore } from '@/stores/imageStudioStore';
import { Download, ZoomIn, ZoomOut, Maximize2, RotateCcw, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RightSidebar() {
    const { finalResult } = useImageStudioStore();
    const [zoom, setZoom] = useState(1);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
    const handleReset = () => setZoom(1);

    const handleDownload = async () => {
        if (!finalResult) return;

        setIsDownloading(true);

        // Simulate download delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));

        const link = document.createElement('a');
        link.href = finalResult;
        link.download = `aivi-result-${Date.now()}.png`;
        link.click();

        setIsDownloading(false);
        setDownloadSuccess(true);

        setTimeout(() => setDownloadSuccess(false), 2000);
    };

    return (
        <aside className="sidebar flex-1 flex flex-col min-w-0 h-full overflow-hidden">
            <div className="sidebar-section">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                    <span className="text-[var(--decorative-start)]">🎯</span>
                    Kết quả
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Ảnh đã hoàn thiện</p>
            </div>

            {/* Result Preview Container */}
            <div className="flex-1 flex flex-col p-4 lg:p-12 items-center justify-center overflow-hidden min-h-0">
                <motion.div
                    className="w-full h-full glass-panel rounded-2xl flex items-center justify-center relative overflow-hidden board-pattern"
                    layout
                >
                    <AnimatePresence mode="wait">
                        {finalResult ? (
                            <motion.div
                                key="result"
                                className="relative z-10 flex items-center justify-center w-full h-full p-4"
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                                transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
                            >
                                <motion.img
                                    src={finalResult}
                                    alt="Final Result"
                                    className="max-w-full max-h-full w-auto h-auto object-contain drop-shadow-2xl rounded-lg cursor-grab active:cursor-grabbing"
                                    decoding="async"
                                    animate={{ scale: zoom }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    drag={zoom > 1} // Only enable drag when zoomed in
                                    dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
                                    dragElastic={0.1}
                                    onDragStart={(e) => e.stopPropagation()}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="placeholder"
                                className="text-center"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <motion.div
                                    className="w-24 h-24 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mx-auto mb-4 border border-[var(--border)]"
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 3,
                                        ease: 'easeInOut'
                                    }}
                                >
                                    <span className="text-4xl">🖼️</span>
                                </motion.div>
                                <p className="text-[var(--text-muted)] text-lg font-medium">Chưa có kết quả</p>
                                <p className="text-xs text-[var(--text-muted)] mt-2 max-w-[200px]">
                                    Hoàn thành bước 1 và 2 để xem kết quả tuyệt vời tại đây
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Overlay Controls */}
                    {finalResult && (
                        <div
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 z-20"
                        >
                            <button
                                className="p-1.5 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors"
                                onClick={handleZoomOut}
                                title="Thu nhỏ"
                            >
                                <ZoomOut size={18} />
                            </button>

                            <span className="text-xs text-white/60 min-w-[40px] text-center select-none">
                                {Math.round(zoom * 100)}%
                            </span>

                            <button
                                className="p-1.5 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors"
                                onClick={handleZoomIn}
                                title="Phóng to"
                            >
                                <ZoomIn size={18} />
                            </button>

                            <div className="w-px h-4 bg-white/10" />

                            <button
                                className="p-1.5 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors"
                                onClick={() => setIsFullscreen(true)}
                                title="Toàn màn hình"
                            >
                                <Maximize2 size={18} />
                            </button>

                            <button
                                className="p-1.5 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors"
                                onClick={handleReset}
                                title="Đặt lại"
                            >
                                <RotateCcw size={18} />
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Actions Footer - Fixed at bottom */}
            <div className="p-6 border-t border-[var(--border)] bg-[var(--bg-secondary)] pb-12">
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            if (confirm('Bạn có chắc muốn xóa kết quả hiện tại để làm mới?')) {
                                useImageStudioStore.getState().setFinalResult(null);
                            }
                        }}
                        disabled={!finalResult}
                        className="btn-secondary px-4 flex flex-col items-center justify-center gap-1 min-w-[80px]"
                        title="Làm mới"
                    >
                        <RotateCcw size={18} />
                        <span className="text-[10px] font-medium">Làm mới</span>
                    </button>

                    <motion.button
                        onClick={handleDownload}
                        disabled={!finalResult || isDownloading}
                        className={`flex-1 btn-primary py-3 flex items-center justify-center gap-2 neon-glow-purple relative overflow-hidden ${downloadSuccess ? 'bg-[var(--success)]' : ''
                            }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {downloadSuccess ? (
                            <div className="flex items-center gap-2 relative z-10">
                                <Check size={20} />
                                <span>Đã tải!</span>
                            </div>
                        ) : isDownloading ? (
                            <div className="flex items-center gap-2 relative z-10">
                                <Download size={20} className="animate-bounce" />
                                <span>Đang tải...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 relative z-10">
                                <Download size={20} />
                                <span>Tải ảnh HQ</span>
                            </div>
                        )}
                    </motion.button>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] text-center mt-3 uppercase tracking-widest font-bold">
                    Định dạng PNG 4K • Tự động lưu lịch sử
                </p>
            </div>

            {/* Fullscreen Modal */}
            <AnimatePresence>
                {isFullscreen && finalResult && (
                    <motion.div
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsFullscreen(false)}
                    >
                        <button
                            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-20"
                            onClick={() => setIsFullscreen(false)}
                        >
                            <X size={24} />
                        </button>

                        <motion.img
                            src={finalResult}
                            alt="Fullscreen Result"
                            className="max-w-full max-h-full object-contain cursor-zoom-out"
                            decoding="async"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </aside>
    );
}
