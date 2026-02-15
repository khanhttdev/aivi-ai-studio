'use client';

import { useKOLStudioStore } from '@/stores/kolStudioStore';
import { CLONE_CONTEXTS, KOLEntity } from '@/lib/kol/types';
import { m, AnimatePresence } from 'framer-motion';
import { Download, RotateCcw, Copy, Check, Play, Pause, ChevronLeft, ChevronRight, Package, Home, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

export default function Step6ExportPage() {
    const router = useRouter();
    // const locale = useLocale();
    const t = useTranslations('KOLStudio');

    const {
        kolName,
        baseKOLImage,
        generatedClones,
        generatedScript,
        reset,
        // Save Logic
        addSavedKOL,
        updateSavedKOL,
        currentKOL,
        setCurrentKOL,
        kolProfile,
        selectedTheme,
        channelPositioning,
    } = useKOLStudioStore();

    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState(false);
    const [copied, setCopied] = useState(false);
    const slideInterval = useRef<NodeJS.Timeout | null>(null);

    // All images (base + clones)
    const allImages = [
        { id: 'base', image_url: baseKOLImage, context: 'base', label: 'Ảnh gốc' },
        ...generatedClones.map(c => ({
            ...c,
            label: CLONE_CONTEXTS.find(ctx => ctx.id === c.context)?.nameVi || c.context,
        })),
    ].filter(img => img.image_url);

    // Redirect if no content
    useEffect(() => {
        if (!baseKOLImage) {
            router.push('/kol-studio/step-3-generate');
        }
    }, [baseKOLImage, router]);

    // Auto-save KOL to Library (Database & Local)
    useEffect(() => {
        if (!baseKOLImage || !kolProfile) return;

        const saveToDB = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.log('User not logged in, saving to local store only');
                // Fallback to local logic (already handled if we want local-only support)
                // But for now let's prioritize DB sync if possible
                return;
            }

            const kolData = {
                user_id: user.id,
                name: kolName || 'Untitled KOL',
                theme: selectedTheme?.id || 'custom',
                channel_positioning: channelPositioning,
                profile_data: kolProfile as unknown as Record<string, unknown>,
                base_image_url: baseKOLImage,
                updated_at: new Date().toISOString(),
            };

            try {
                if (currentKOL?.id && currentKOL.id.length > 30) {
                    // Assuming valid UUID from DB is long, simple local ID might be excluded if we used short ID
                    // But actually we used crypto.randomUUID() locally which is also UUID.
                    // The best way is to check if we have a currentKOL that came from DB?
                    // Let's try update, if fail (0 rows), then insert? No, update requires ID.

                    // If currentKOL exists and we believe it's synced
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const { error } = await (supabase as any)
                        .from('kol_profiles')
                        .update(kolData)
                        .eq('id', currentKOL.id);

                    if (!error) {
                        updateSavedKOL({ ...currentKOL, ...kolData, profile_data: kolProfile } as KOLEntity);
                    }
                } else {
                    // Start new insert
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const { data, error } = await (supabase as any)
                        .from('kol_profiles')
                        .insert(kolData)
                        .select()
                        .single();

                    if (data && !error) {
                        const newEntity = data as KOLEntity;
                        addSavedKOL(newEntity);
                        setCurrentKOL(newEntity);
                    }
                }
            } catch (e) {
                console.error('Error saving KOL to DB:', e);
            }
        };

        saveToDB();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [baseKOLImage, kolProfile]);


    // Auto-play slideshow
    useEffect(() => {
        if (isPlaying && allImages.length > 1) {
            slideInterval.current = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % allImages.length);
            }, 2000);
        }
        return () => {
            if (slideInterval.current) clearInterval(slideInterval.current);
        };
    }, [isPlaying, allImages.length]);

    const nextSlide = () => {
        setCurrentSlide(prev => (prev + 1) % allImages.length);
    };

    const prevSlide = () => {
        setCurrentSlide(prev => (prev - 1 + allImages.length) % allImages.length);
    };

    const handleDownloadSingle = (imageUrl: string, filename: string) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = filename;
        link.click();
    };

    const handleDownloadAll = async () => {
        setIsDownloading(true);

        for (let i = 0; i < allImages.length; i++) {
            const img = allImages[i];
            await new Promise(resolve => setTimeout(resolve, 300));
            handleDownloadSingle(img.image_url!, `kol-${kolName}-${img.context}-${i + 1}.png`);
        }

        setIsDownloading(false);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 2000);
    };

    const handleCopyScript = () => {
        if (!generatedScript) return;

        const fullScript = `[HOOK]
${generatedScript.hook}

[NỘI DUNG]
${generatedScript.body}

[CTA]
${generatedScript.cta}`;

        navigator.clipboard.writeText(fullScript);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleNewKOL = () => {
        reset();
        router.push('/kol-studio/step-1-theme');
    };

    if (!baseKOLImage) return null;

    return (
        <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full overflow-x-hidden">
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full space-y-6 flex-1 flex flex-col"
            >
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold gradient-text">
                        {t('step6.title') || '🎉 Hoàn Thành!'}
                    </h2>
                    <p className="text-[var(--text-secondary)] mt-2">
                        KOL AI <span className="text-[var(--accent-primary)] font-bold">{kolName}</span> đã sẵn sàng
                    </p>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                    {/* Slideshow */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="relative bg-[var(--bg-secondary)]/50 rounded-2xl border border-[var(--border)] overflow-hidden min-h-[400px] flex items-center justify-center">
                            {/* Navigation Buttons */}
                            {allImages.length > 1 && (
                                <>
                                    <button
                                        onClick={prevSlide}
                                        className="absolute left-2 z-10 p-2 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={nextSlide}
                                        className="absolute right-2 z-10 p-2 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </>
                            )}

                            {/* Current Image */}
                            <AnimatePresence mode="wait">
                                <m.div
                                    key={currentSlide}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    className="relative"
                                >
                                    <Image
                                        src={allImages[currentSlide]?.image_url || ''}
                                        alt={`${kolName} - ${currentSlide + 1}`}
                                        width={512}
                                        height={912}
                                        className="max-h-[50vh] max-w-full object-contain rounded-lg shadow-2xl"
                                        unoptimized
                                    />
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 rounded-full text-sm">
                                        {allImages[currentSlide]?.label}
                                    </div>
                                </m.div>
                            </AnimatePresence>

                            {/* Play/Pause & Progress */}
                            {allImages.length > 1 && (
                                <div className="absolute bottom-4 right-4 flex items-center gap-3 px-4 py-2 bg-black/60 rounded-full">
                                    <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="p-1 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                                    </button>
                                    <span className="text-xs text-white/70">
                                        {currentSlide + 1} / {allImages.length}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {allImages.map((img, idx) => (
                                <button
                                    key={img.id}
                                    onClick={() => {
                                        setCurrentSlide(idx);
                                        setIsPlaying(false);
                                    }}
                                    className={`
                                        w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all relative
                                        ${idx === currentSlide
                                            ? 'border-[var(--accent-primary)] scale-105'
                                            : 'border-transparent opacity-60 hover:opacity-100'
                                        }
                                    `}
                                >
                                    <Image src={img.image_url || ''} alt="" fill className="object-cover" unoptimized />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar: Script + Actions */}
                    <div className="space-y-4">
                        {/* Script Preview */}
                        {generatedScript && (
                            <div className="glass-card p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-sm">📝 Kịch Bản</h3>
                                    <button
                                        onClick={handleCopyScript}
                                        className="text-xs flex items-center gap-1 text-[var(--text-muted)] hover:text-white transition-colors"
                                    >
                                        {copied ? <Check size={12} /> : <Copy size={12} />}
                                        {copied ? 'Đã copy!' : 'Copy'}
                                    </button>
                                </div>
                                <div className="text-xs space-y-2 max-h-40 overflow-y-auto">
                                    <p className="text-red-400">{generatedScript.hook}</p>
                                    <p className="text-[var(--text-secondary)] line-clamp-3">{generatedScript.body}</p>
                                    <p className="text-green-400">{generatedScript.cta}</p>
                                </div>
                            </div>
                        )}

                        {/* Download Actions */}
                        <div className="space-y-3">
                            <m.button
                                onClick={handleDownloadAll}
                                disabled={isDownloading}
                                className={`
                                    w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2
                                    ${downloadSuccess
                                        ? 'bg-[var(--success)] text-black'
                                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-purple-500/30'
                                    }
                                `}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isDownloading ? (
                                    <>Đang tải...</>
                                ) : downloadSuccess ? (
                                    <>
                                        <Check size={18} />
                                        Đã tải!
                                    </>
                                ) : (
                                    <>
                                        <Package size={18} />
                                        Tải tất cả ({allImages.length} ảnh)
                                    </>
                                )}
                            </m.button>

                            <button
                                onClick={() => handleDownloadSingle(allImages[currentSlide]?.image_url || '', `kol-${kolName}-current.png`)}
                                className="w-full py-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] transition-colors flex items-center justify-center gap-2"
                            >
                                <Download size={18} />
                                Tải ảnh hiện tại
                            </button>
                        </div>

                        {/* Other Actions */}
                        <div className="pt-4 border-t border-[var(--border)] space-y-3">
                            <m.button
                                onClick={handleNewKOL}
                                className="w-full py-3 rounded-xl bg-[var(--accent-primary)] text-black font-bold flex items-center justify-center gap-2"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <m.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
                                    <Sparkles size={18} />
                                </m.div>
                                Tạo KOL mới
                            </m.button>

                            <Link href="/image-studio" className="block">
                                <button className="w-full py-3 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors flex items-center justify-center gap-2">
                                    <RotateCcw size={18} />
                                    Ghép sản phẩm
                                </button>
                            </Link>

                            <Link href="/" className="block">
                                <button className="w-full py-2 rounded-xl text-[var(--text-muted)] hover:text-white transition-colors flex items-center justify-center gap-2 text-sm">
                                    <Home size={16} />
                                    Về trang chủ
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </m.div>
        </div>
    );
}
