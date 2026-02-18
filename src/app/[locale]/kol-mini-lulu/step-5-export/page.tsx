'use client';

import { useKolMiniLuluStore } from "@/stores/useKolMiniLuluStore";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Plus, Share2, Sparkles, RefreshCw, Copy, Image as ImageIcon, Check, Loader2, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

import { useTranslations, useLocale } from "next-intl";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function Step5MarketingKitPage() {
    const t = useTranslations('KolMiniLulu.Step5');
    const locale = useLocale();
    const router = useRouter();
    const {
        reset,
        script,
        selectedCharacter,
        customPrompt,
        customCharacter,
        conceptImageUrl,
        setConceptImageUrl,
        seoData,
        setSeoData
    } = useKolMiniLuluStore();

    const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);
    const [isGeneratingCover, setIsGeneratingCover] = useState(false);

    const handleDownloadZip = async () => {
        if (!conceptImageUrl && !seoData) {
            toast.error(t('toast_seo_error'));
            return;
        }

        try {
            const zip = new JSZip();

            // 1. Add Image
            if (conceptImageUrl) {
                try {
                    let blob: Blob;
                    if (conceptImageUrl.startsWith('data:')) {
                        // Handle Base64 string directly
                        const base64Data = conceptImageUrl.split(',')[1];
                        const binaryString = window.atob(base64Data);
                        const len = binaryString.length;
                        const bytes = new Uint8Array(len);
                        for (let i = 0; i < len; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }
                        blob = new Blob([bytes], { type: 'image/png' }); // Assuming PNG based on API
                    } else {
                        // Handle URL
                        const response = await fetch(conceptImageUrl);
                        if (!response.ok) throw new Error('Network response was not ok');
                        blob = await response.blob();
                    }
                    zip.file("thumbnail.png", blob);
                } catch (e) {
                    console.error("Failed to add image to zip", e);
                    toast.error("Failed to add image to ZIP");
                }
            }

            // 2. Add Metadata Text
            if (seoData) {
                const content = `TITLE: ${seoData.title}\n\nDESCRIPTION:\n${seoData.description}\n\nHASHTAGS:\n${seoData.hashtags.join(' ')}\n\nKEYWORDS:\n${seoData.keywords?.join(', ')}`;
                zip.file("marketing-kit.txt", content);
            }

            // 3. Generate and Save
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, "marketing-kit.zip");
            toast.success(t('copy_all'));
        } catch (error) {
            console.error("ZIP Generation failed", error);
            toast.error("Failed to create ZIP file");
        }
    };



    const handleNewProject = () => {
        reset();
        router.push(`/${locale}/kol-mini-lulu/step-1-concept`);
    };

    const generateSEO = async () => {
        setIsGeneratingSeo(true);
        try {
            const res = await fetch('/api/kol-mini-lulu/generate-seo', {
                method: 'POST',
                body: JSON.stringify({
                    script,
                    character: selectedCharacter
                })
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Server Error: ${res.statusText}`);
            }

            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setSeoData(data);
            toast.success(t('toast_seo_success'));
        } catch (error: any) {
            console.error("SEO Generation failed", error);
            toast.error(t('toast_seo_error'));
        } finally {
            setIsGeneratingSeo(false);
        }
    };

    const generateCover = async () => {
        setIsGeneratingCover(true);
        try {
            const res = await fetch('/api/kol-mini-lulu/generate-cover', {
                method: 'POST',
                body: JSON.stringify({
                    idea: customPrompt,
                    characterPrompt: customCharacter?.prompt || selectedCharacter,
                    locale
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            if (data.imageUrl) {
                setConceptImageUrl(data.imageUrl);
                toast.success(t('toast_cover_success'));
            }
        } catch (error) {
            console.error("Cover Generation failed", error);
            toast.error(t('toast_cover_error'));
        } finally {
            setIsGeneratingCover(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20 pt-4">
            <div className="text-center space-y-3">
                <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 drop-shadow-sm">
                    {t('title')}
                </h1>
                <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
                    {t('subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

                {/* LEFT: Thumbnail / Concept Art */}
                <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
                    <div className="bg-[#0f1115] border border-white/10 rounded-3xl p-1 shadow-2xl overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-purple-500/10 opacity-50" />

                        <div className="bg-[#1a1d24] rounded-[22px] p-6 relative z-10 h-full flex flex-col">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                                <ImageIcon className="w-5 h-5 text-pink-500" />
                                {t('thumbnail_title')}
                            </h3>

                            {/* Thumbnail Display */}
                            <div className="aspect-[9/16] w-full max-w-[320px] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative bg-black/40 group-hover:border-pink-500/30 transition-colors">
                                {isGeneratingCover ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 backdrop-blur-sm z-20">
                                        <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
                                        <p className="text-sm font-mono text-pink-400 animate-pulse">{t('designing_thumbnail')}</p>
                                    </div>
                                ) : null}

                                <img
                                    src={conceptImageUrl || (selectedCharacter === 'mini' ? '/images/models/minh_anh.png' : selectedCharacter === 'lulu' ? '/images/models/james.png' : 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop')}
                                    alt="Cover Art"
                                    className={cn("w-full h-full object-cover transition-all duration-700", isGeneratingCover ? "scale-105 blur-sm" : "scale-100 blur-0")}
                                />

                                {/* Overlay Title Preview */}
                                {seoData?.title && (
                                    <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                                        <h2 className="text-white font-black text-3xl uppercase leading-tight drop-shadow-lg line-clamp-3">
                                            {seoData.title}
                                        </h2>
                                    </div>
                                )}

                                {/* Placeholder Overlay if no concept art generated yet */}
                                {!conceptImageUrl && !isGeneratingCover && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                                        <button
                                            onClick={generateCover}
                                            className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full backdrop-blur-md flex items-center gap-2 transition-all hover:scale-105"
                                        >
                                            <Sparkles className="w-5 h-5 text-yellow-400" />
                                            <span className="font-bold text-white">{t('btn_generate_cover')}</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="mt-6 flex justify-center gap-3">
                                <button
                                    onClick={generateCover}
                                    disabled={isGeneratingCover}
                                    className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isGeneratingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                    {conceptImageUrl ? t('btn_regenerate_cover') : t('btn_generate_cover')}
                                </button>

                                {conceptImageUrl && (
                                    <a
                                        href={conceptImageUrl}
                                        download="viral-thumbnail.png"
                                        className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        {t('btn_download_raw')}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: SEO Content */}
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 delay-100">
                    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6 shadow-xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-orange-500" />
                                {t('seo_title')}
                            </h3>
                            <button
                                onClick={generateSEO}
                                disabled={isGeneratingSeo}
                                className="px-5 py-2 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 rounded-full text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {isGeneratingSeo ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                {seoData ? t('btn_rewrite') : t('btn_generate_seo')}
                            </button>
                        </div>

                        {seoData ? (
                            <div className="space-y-6">
                                {/* Title */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                                            {t('viral_title')}
                                        </label>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(seoData.title);
                                                toast.success(t('copy_title'));
                                            }}
                                            className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                                        >
                                            <Copy className="w-3.5 h-3.5 text-gray-400" />
                                        </button>
                                    </div>
                                    <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] shadow-inner">
                                        <p className="font-bold text-lg leading-tight text-white">{seoData.title}</p>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                                            {t('caption')}
                                        </label>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(seoData.description);
                                                toast.success(t('copy_desc'));
                                            }}
                                            className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                                        >
                                            <Copy className="w-3.5 h-3.5 text-gray-400" />
                                        </button>
                                    </div>
                                    <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] shadow-inner">
                                        <p className="text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">{seoData.description}</p>
                                    </div>
                                </div>

                                {/* Keywords & Hashtags */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
                                            <Tag className="w-3 h-3" /> {t('hashtags')}
                                        </label>
                                        <div className="flex flex-wrap gap-2 p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] min-h-[80px] content-start">
                                            {seoData.hashtags.map((tag: string, i: number) => (
                                                <span key={i} className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md text-xs font-medium border border-blue-500/20 hover:bg-blue-500/20 cursor-default">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
                                            <Check className="w-3 h-3" /> {t('keywords')}
                                        </label>
                                        <div className="flex flex-wrap gap-2 p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] min-h-[80px] content-start">
                                            {seoData.keywords?.map((kw: string, i: number) => (
                                                <span key={i} className="px-2 py-1 bg-green-500/10 text-green-400 rounded-md text-xs font-medium border border-green-500/20 hover:bg-green-500/20 cursor-default">
                                                    {kw}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        const text = `${seoData.title}\n\n${seoData.description}\n\n${seoData.hashtags.join(' ')}\n\nKeywords: ${seoData.keywords?.join(', ')}`;
                                        navigator.clipboard.writeText(text);
                                        toast.success(t('copy_all'));
                                    }}
                                    className="w-full py-3 mt-2 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-xl text-sm font-bold transition-all border border-white/10 flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <Copy className="w-4 h-4" />
                                    {t('btn_copy_all')}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-[var(--bg-secondary)]/50 rounded-2xl border border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-3">
                                <div className="p-4 bg-orange-500/10 rounded-full">
                                    <Sparkles className="w-8 h-8 text-orange-500" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-white">{t('empty_seo_title')}</h4>
                                    <p className="text-[var(--text-secondary)] text-sm max-w-xs mx-auto">
                                        {t('empty_seo_desc')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Final Actions */}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <button
                            onClick={handleNewProject}
                            className="py-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl hover:bg-[var(--bg-secondary)] transition-all font-bold text-gray-400 hover:text-white flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            {t('btn_new_project')}
                        </button>
                        <button
                            className="py-4 bg-white text-black rounded-2xl hover:bg-gray-200 transition-all font-bold shadow-xl shadow-white/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleDownloadZip}
                            disabled={!conceptImageUrl && !seoData}
                        >
                            <Download className="w-5 h-5" />
                            {t('btn_download_zip')}
                        </button>

                    </div>
                </div>
            </div >
        </div >
    );
}
