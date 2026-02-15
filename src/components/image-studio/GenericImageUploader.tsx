'use client';

import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface GenericImageUploaderProps {
    value: string | null;
    onChange: (value: string | null) => void;
    label?: string;
    className?: string; // Add className
    browseLabel?: string;
}

export default function GenericImageUploader({ value, onChange, label, className = "", browseLabel = "Browse File" }: GenericImageUploaderProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const t = useTranslations('ImageStudio.upload_zone');

    // ... (handlers remain same)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert(t('formats'));
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            onChange(ev.target?.result as string);
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
        <div className={`space-y-2 ${className}`}>
            {label && <p className="text-sm font-medium text-[var(--text-secondary)]">{label}</p>}
            <AnimatePresence mode="wait">
                {!value ? (
                    <label
                        className={`relative w-full aspect-[3/4] rounded-xl flex flex-col items-center justify-center cursor-pointer border-2 border-dashed transition-all ${isDragOver
                            ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                            : 'border-[var(--border)] bg-[var(--bg-tertiary)] hover:border-[var(--text-muted)]'
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <m.div
                            animate={isDragOver ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            className="flex flex-col items-center p-4 text-center"
                        >
                            <div className={`p-3 rounded-full mb-3 transition-colors ${isDragOver
                                ? 'bg-[var(--accent-primary)]/20'
                                : 'bg-[var(--bg-secondary)]'
                                }`}>
                                <Upload
                                    size={24}
                                    className={`transition-colors ${isDragOver
                                        ? 'text-[var(--accent-primary)]'
                                        : 'text-[var(--text-muted)]'
                                        }`}
                                />
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] font-medium">
                                {isDragOver ? t('drop_here') : t('drag_drop')}
                            </p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">
                                {t('formats')}
                            </p>
                            <div className="mt-3 px-4 py-2 bg-[var(--bg-secondary)] rounded-lg text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                                {browseLabel}
                            </div>
                        </m.div>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </label>
                ) : (
                    <m.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="relative w-full aspect-[3/4] rounded-xl overflow-hidden border border-[var(--border)] group"
                    >
                        <Image
                            src={value}
                            alt="Uploaded Model"
                            fill
                            className="object-cover"
                            unoptimized
                        />

                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Remove button */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                onChange(null);
                            }}
                            className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-sm text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-[var(--error)] hover:scale-110"
                        >
                            <X size={16} />
                        </button>

                        <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md text-xs text-white font-medium">
                            {label || "Image"}
                        </div>
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    );
}
