'use client';

import { useState } from 'react';
import { useImageStudioStore } from '@/stores/imageStudioStore';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function ImageUploader() {
    const { uploadedImage, setUploadedImage } = useImageStudioStore();
    const [isDragOver, setIsDragOver] = useState(false);
    const t = useTranslations('ImageStudio.upload_zone');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert(t('formats')); // Improving alert message logic if needed, but formats hint is close enough
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            setUploadedImage(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    return (
        <div className="space-y-4">
            <AnimatePresence mode="wait">
                {!uploadedImage ? (
                    <m.label
                        key="uploader"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
                        className={`upload-zone aspect-square flex flex-col items-center justify-center cursor-pointer ${isDragOver ? 'dragover' : ''
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <m.div
                            animate={isDragOver ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                            transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                            className="flex flex-col items-center"
                        >
                            <div className={`p-4 rounded-full mb-4 transition-colors ${isDragOver
                                ? 'bg-[var(--accent-primary)]/20'
                                : 'bg-[var(--bg-tertiary)]'
                                }`}>
                                <Upload
                                    size={32}
                                    className={`transition-colors ${isDragOver
                                        ? 'text-[var(--accent-primary)]'
                                        : 'text-[var(--text-muted)]'
                                        }`}
                                />
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] text-center font-medium">
                                {isDragOver ? t('drop_here') : t('drag_drop')}
                            </p>
                            <p className="text-xs text-[var(--text-muted)] mt-2">
                                {t('formats')}
                            </p>
                        </m.div>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </m.label>
                ) : (
                    <m.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
                        className="relative aspect-square rounded-xl overflow-hidden border border-[var(--border)] group"
                    >
                        <Image
                            src={uploadedImage}
                            alt="Uploaded"
                            fill
                            className="object-cover"
                            unoptimized
                        />

                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Image info */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-2 text-white/80">
                                <ImageIcon size={14} />
                                <span className="text-xs">{t('original_image')}</span>
                            </div>
                        </div>

                        {/* Remove button */}
                        <m.button
                            onClick={() => setUploadedImage(null)}
                            className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-sm text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-[var(--error)] hover:scale-110"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <X size={16} />
                        </m.button>
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    );
}
