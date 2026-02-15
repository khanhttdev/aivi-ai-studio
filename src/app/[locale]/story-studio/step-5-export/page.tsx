'use client';

import { useAiviStoryStore } from "@/stores/useAiviStoryStore";
import { useRouter } from "next/navigation";
import { Download, Copy, Check, ArrowLeft, Package, Sparkles, Loader2, Hash, Tag, Image as ImageIcon, Wand2, Volume2 } from "lucide-react";
import { useState } from 'react';
import Image from 'next/image';
import { cn } from "@/lib/utils";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useTranslations } from 'next-intl';
import { toast } from "sonner";
import { AiviAudioPlayer } from "@/components/ui/AiviAudioPlayer";

import { GoogleGenAI } from "@google/genai";
import { generateSEOAssets, SEOAssets, generateBackgroundMusic } from "@/lib/gemini/story-service";

// Helper function to generate thumbnail image
const generateThumbnailFromPrompt = async (prompt: string): Promise<string> => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    const ai = new GoogleGenAI({ apiKey });

    const enhancedPrompt = `YouTube/TikTok Thumbnail (Vertical 9:16), ultra high CTR design. 
    ${prompt}. 
    Vibrant saturated colors, dramatic lighting, extremely expressive facial expressions, 
    bold composition, eye-catching, professional quality. Vertical portrait format 9:16. NO TEXT.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: [{ parts: [{ text: enhancedPrompt }] }],
        config: {
            responseModalities: ['image'],
            // @ts-expect-error - aspectRatio may not be in the type definition yet
            aspectRatio: '9:16'
        }
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part && 'inlineData' in part && part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Failed to generate thumbnail");
};

export default function Step5Export() {
    const router = useRouter();
    const t = useTranslations('StoryStudio.Step5');
    const { script, sceneImages, sceneAudios, backgroundMusic, setBackgroundMusic, isGeneratingMusic, setIsGeneratingMusic, mainTopic } = useAiviStoryStore();
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [copiedSeo, setCopiedSeo] = useState<string | null>(null);

    // SEO State
    const [seoAssets, setSeoAssets] = useState<SEOAssets | null>(null);
    const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);

    // Thumbnail Generation State
    const [generatedThumbnails, setGeneratedThumbnails] = useState<Record<number, string>>({});
    const [generatingThumbIndex, setGeneratingThumbIndex] = useState<number | null>(null);

    if (!script) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-[50vh]">
                <h2 className="text-xl font-bold mb-4">{t('no_content')}</h2>
                <button onClick={() => router.push('/story-studio/step-1-spark')} className="text-indigo-400 hover:text-indigo-300">
                    {t('start_new')}
                </button>
            </div>
        )
    }

    const handleCopyPrompt = (id: number, prompt: string) => {
        navigator.clipboard.writeText(prompt);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleCopySeo = (key: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedSeo(key);
        toast.success(t('copied'));
        setTimeout(() => setCopiedSeo(null), 2000);
    };

    const handleDownloadScript = () => {
        const content = `TITLE: ${script.title}
TOPIC: ${mainTopic}
LOGLINE: ${script.scriptDescription}

${script.frames.map(f => `
SCENE ${f.frameId}: ${f.description}
DIALOGUE: "${f.dialogue}"
VIDEO PROMPT: ${f.videoPrompt}
`).join('\n')}
    `;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${script.title.replace(/\s+/g, '_')}_Script.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Helper: Add decorative text to thumbnail
    const addTextToThumbnail = async (imageUrl: string, text: string): Promise<string> => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(imageUrl);
                return;
            }
            const img = document.createElement('img');
            img.crossOrigin = "anonymous";
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;

                // 1. Draw original image
                ctx.drawImage(img, 0, 0);

                // 2. Add Dark Gradient Overlay at bottom for contrast
                const gradient = ctx.createLinearGradient(0, canvas.height * 0.4, 0, canvas.height);
                gradient.addColorStop(0, "transparent");
                gradient.addColorStop(1, "rgba(0,0,0,0.8)");
                ctx.fillStyle = gradient;
                ctx.fillRect(0, canvas.height * 0.4, canvas.width, canvas.height * 0.6);

                // 3. Configure Text Style (Pro YouTube Style)
                const fontSize = Math.floor(canvas.width * 0.085);
                ctx.font = `900 ${fontSize}px "Impact", "Arial Black", "Segoe UI", sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Shadow/Glow
                ctx.shadowColor = "black";
                ctx.shadowBlur = 15;
                ctx.shadowOffsetX = 5;
                ctx.shadowOffsetY = 5;

                // Word Wrap Logic
                const words = text.toUpperCase().split(' ');
                const lines: string[] = [];
                let currentLine = words[0];

                for (let i = 1; i < words.length; i++) {
                    const width = ctx.measureText(currentLine + " " + words[i]).width;
                    if (width < canvas.width * 0.85) {
                        currentLine += " " + words[i];
                    } else {
                        lines.push(currentLine);
                        currentLine = words[i];
                    }
                }
                lines.push(currentLine);

                // Calculate position (Center-Bottom or Center)
                // Let's put it slightly below center for impact
                const startY = canvas.height * 0.55;
                const lineHeight = fontSize * 1.15;

                lines.forEach((line, i) => {
                    const y = startY + i * lineHeight - ((lines.length - 1) * lineHeight) / 2;

                    // Stroke (Thick Black Outline)
                    ctx.strokeStyle = "rgba(0,0,0,1)";
                    ctx.lineWidth = fontSize * 0.15;
                    ctx.lineJoin = "round";
                    ctx.strokeText(line, canvas.width / 2, y);

                    // Fill (Yellow/Gold Gradient)
                    const textGradient = ctx.createLinearGradient(0, y - fontSize, 0, y + fontSize);
                    textGradient.addColorStop(0, "#FFD700"); // Gold
                    textGradient.addColorStop(0.5, "#FFF700"); // Yellow
                    textGradient.addColorStop(1, "#FF8C00"); // Dark Orange
                    ctx.fillStyle = textGradient;
                    ctx.fillText(line, canvas.width / 2, y);

                    // Add White Highlight top
                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                    ctx.fillStyle = "rgba(255,255,255,0.2)";
                    ctx.fillText(line, canvas.width / 2, y - 2);
                });

                resolve(canvas.toDataURL('image/png', 1.0));
            };
            img.onerror = () => resolve(imageUrl);
            img.src = imageUrl;
        });
    };

    const handleDownloadZip = async () => {
        const zip = new JSZip();

        // Add Script
        let content = `TITLE: ${script.title}
TOPIC: ${mainTopic}
LOGLINE: ${script.scriptDescription}

${script.frames.map(f => `
SCENE ${f.frameId}: ${f.description}
DIALOGUE: "${f.dialogue}"
VIDEO PROMPT: ${f.videoPrompt}
`).join('\n')}
`;

        // Add SEO Assets if available
        if (seoAssets) {
            content += `\n\n=== SEO & MARKETING ASSETS ===\n\n`;
            content += `VIRAL TITLES:\n${seoAssets.viralTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n`;
            content += `DESCRIPTION:\n${seoAssets.description}\n\n`;
            content += `HASHTAGS:\n${seoAssets.hashtags.join(' ')}\n\n`;
            content += `KEYWORDS:\n${seoAssets.keywords.join(', ')}\n\n`;
            content += `THUMBNAIL PROMPTS:\n${seoAssets.thumbnailPrompts.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n`;
        }

        zip.file(`${script.title.replace(/\s+/g, '_')}_Script.txt`, content);

        // Helper to convert Data URI to Blob safely
        // Helper to convert Data URI to Blob safely
        const addFileToZip = async (folder: JSZip | null, filename: string, dataUrl: string) => {
            if (!folder || !dataUrl) return;
            const finalUrl = dataUrl.trim();

            // 1. Handle Data URIs directly (bypass fetch for performance/reliability)
            if (finalUrl.startsWith('data:')) {
                try {
                    const arr = finalUrl.split(',');
                    const mime = arr[0].match(/:(.*?);/)?.[1];
                    const bstr = atob(arr[1]);
                    let n = bstr.length;
                    const u8arr = new Uint8Array(n);
                    while (n--) {
                        u8arr[n] = bstr.charCodeAt(n);
                    }
                    const blob = new Blob([u8arr], { type: mime });
                    folder.file(filename, blob);
                    return;
                } catch (e) {
                    console.error(`Failed to process Data URI for ${filename}`, e);
                    folder.file(`${filename}.error.txt`, `Failed to process Data URI: ${e}`);
                    return;
                }
            }

            // 2. Handle raw base64 (missing prefix) - treat as Data URI
            // Quick check if it looks like base64 (no http protocol)
            if (!finalUrl.startsWith('http') && !finalUrl.startsWith('blob:')) {
                try {
                    // Guess mime type based on extension
                    const ext = filename.split('.').pop()?.toLowerCase();
                    let mime = 'application/octet-stream';
                    if (ext === 'png') mime = 'image/png';
                    else if (ext === 'jpg' || ext === 'jpeg') mime = 'image/jpeg';
                    else if (ext === 'mp3') mime = 'audio/mpeg'; // mp3 usually audio/mpeg
                    else if (ext === 'wav') mime = 'audio/wav';

                    // Clean up if it unintentionally has some prefix or newline
                    const b64Data = finalUrl.replace(/^data:.*,/, '').replace(/\s/g, '');

                    const bstr = atob(b64Data);
                    let n = bstr.length;
                    const u8arr = new Uint8Array(n);
                    while (n--) {
                        u8arr[n] = bstr.charCodeAt(n);
                    }
                    const blob = new Blob([u8arr], { type: mime });
                    folder.file(filename, blob);
                    return;
                } catch (e) {
                    console.warn(`Failed to process raw string for ${filename} as base64, attempting fetch...`, e);
                    // Fallthrough to fetch
                }
            }

            // 3. Handle Remote URLs (Http/Blob)
            try {
                const res = await fetch(finalUrl);
                if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);
                const blob = await res.blob();
                folder.file(filename, blob);
            } catch (e) {
                console.error(`Failed to add ${filename} to zip`, e);
                folder.file(`${filename}.error.txt`, `Failed to process file: ${e}`);
            }
        };

        const promises: Promise<void>[] = [];

        // Add Scene Images
        const imgFolder = zip.folder("images");
        script.frames.forEach((frame) => {
            const imgData = sceneImages[frame.frameId];
            if (imgData) promises.push(addFileToZip(imgFolder, `Scene_${frame.frameId}.png`, imgData));
        });

        // Add Audios
        const audioFolder = zip.folder("audios");
        script.frames.forEach((frame) => {
            const audioData = sceneAudios[frame.frameId];
            if (audioData) {
                let ext = "mp3";
                if (audioData.startsWith("data:audio/wav")) ext = "wav";
                promises.push(addFileToZip(audioFolder, `Scene_${frame.frameId}.${ext}`, audioData));
            }
        });

        // Add Generated Thumbnails
        const thumbFolder = zip.folder("thumbnails");
        Object.entries(generatedThumbnails).forEach(([index, imgData]) => {
            if (imgData) promises.push(addFileToZip(thumbFolder, `Thumbnail_${Number(index) + 1}.png`, imgData));
        });

        // Add Background Music
        if (backgroundMusic) {
            promises.push(addFileToZip(zip, "background_music.mp3", backgroundMusic));
        }

        // Wait for all files to be processed
        await Promise.all(promises);

        if (promises.length === 0) {
            alert(t('no_images_alert'));
            return;
        }

        const bloom = await zip.generateAsync({ type: "blob" });
        saveAs(bloom, `${script.title.replace(/\s+/g, '_')}_Assets.zip`);
    };

    const handleDownloadImage = (frameId: number) => {
        const imgData = sceneImages[frameId];
        if (imgData) {
            saveAs(imgData, `Scene_${frameId}.png`);
        }
    };

    const handleGenerateSeo = async () => {
        if (!script) return;
        setIsGeneratingSeo(true);
        try {
            const assets = await generateSEOAssets(
                script.title,
                script.scriptDescription || "",
                mainTopic,
                script.frames.map(f => ({ description: f.description, dialogue: f.dialogue }))
            );
            setSeoAssets(assets);
            toast.success("SEO Assets generated!");
        } catch (e) {
            console.error("Failed to generate SEO", e);
            toast.error("Failed to generate SEO assets");
        } finally {
            setIsGeneratingSeo(false);
        }
    };

    const handleGenerateThumbnail = async (index: number, prompt: string) => {
        setGeneratingThumbIndex(index);
        try {
            const rawImageUrl = await generateThumbnailFromPrompt(prompt);

            // Add Text Overlay
            const titleText = script?.title || "VIDEO TITLE";
            // Use Short Title if generated SEO title exists?
            const displayTitle = (seoAssets?.viralTitles?.[0]) || titleText;

            const finalImageUrl = await addTextToThumbnail(rawImageUrl, displayTitle);

            setGeneratedThumbnails(prev => ({ ...prev, [index]: finalImageUrl }));
            toast.success("Thumbnail generated with text!");
        } catch (e) {
            console.error("Failed to generate thumbnail", e);
            toast.error("Failed to generate thumbnail");
        } finally {
            setGeneratingThumbIndex(null);
        }
    };

    const handleDownloadThumbnail = (index: number) => {
        const imgData = generatedThumbnails[index];
        if (imgData) {
            saveAs(imgData, `Thumbnail_${index + 1}.png`);
        }
    };

    const handleDownloadAudio = (frameId: number) => {
        const audioData = sceneAudios[frameId];
        if (audioData) {
            saveAs(audioData, `Scene_${frameId}.mp3`);
        }
    };

    const handleGenerateMusic = async () => {
        if (!script) return;
        setIsGeneratingMusic(true);
        try {
            const musicUrl = await generateBackgroundMusic(script.scriptDescription || mainTopic);
            setBackgroundMusic(musicUrl);
            toast.success("Background music generated!");
        } catch (e) {
            console.error("Failed to generate music", e);
            toast.error("Failed to generate background music");
        } finally {
            setIsGeneratingMusic(false);
        }
    };

    const handleDownloadMusicAsset = () => {
        if (backgroundMusic) {
            saveAs(backgroundMusic, `Background_Music.mp3`);
        }
    };

    return (
        <div className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full pb-20 overflow-y-auto">
            <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 btn-ghost rounded-full transition">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">{t('title')}</h2>
                        <p className="text-sm text-[var(--text-secondary)]">{t('subtitle')}</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={handleDownloadScript}
                        className="btn-ghost border border-[var(--border)] flex items-center justify-center gap-2 flex-1 md:flex-none"
                    >
                        <Download className="w-4 h-4" />
                        {t('btn_script')}
                    </button>
                    <button
                        onClick={handleDownloadZip}
                        className="btn-ghost border border-[var(--border)] flex items-center justify-center gap-2 flex-1 md:flex-none"
                    >
                        <Package className="w-4 h-4" />
                        {t('btn_zip')}
                    </button>
                </div>
            </div>

            {/* Scene Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {script.frames.map((frame) => (
                    <div key={frame.frameId} className="card p-0 overflow-hidden group border-[var(--border)] hover:border-[var(--accent-primary)] flex flex-col">
                        <div className="aspect-[9/16] bg-black relative shrink-0">
                            {sceneImages[frame.frameId] ? (

                                <Image src={sceneImages[frame.frameId]} alt={`Scene ${frame.frameId}`} fill unoptimized className="object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)] text-xs p-4 text-center border-b border-[var(--border)]">
                                    {t('no_image')}
                                </div>
                            )}
                            <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] font-mono border border-[var(--border)] text-[var(--text-secondary)]">
                                SC {frame.frameId}
                            </div>
                            {sceneImages[frame.frameId] && (
                                <button
                                    onClick={() => handleDownloadImage(frame.frameId)}
                                    className="absolute bottom-2 right-2 p-2 rounded-full bg-black/60 text-white hover:bg-[var(--accent-primary)] hover:text-black transition-colors opacity-0 group-hover:opacity-100"
                                    title="Download Image"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="p-4 space-y-3 flex-1 flex flex-col">
                            <div className="space-y-1 flex-1">
                                <div className="flex justify-between items-center text-[10px] uppercase text-[var(--text-muted)] tracking-wider font-bold">
                                    <span>{t('video_prompt')}</span>
                                    <button
                                        onClick={() => handleCopyPrompt(frame.frameId, frame.videoPrompt)}
                                        className={cn("p-1.5 rounded hover:bg-[var(--bg-tertiary)] transition", copiedId === frame.frameId ? "text-[var(--success)]" : "text-[var(--text-secondary)]")}
                                    >
                                        {copiedId === frame.frameId ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    </button>
                                </div>
                                <p className="text-[10px] text-[var(--text-secondary)] line-clamp-3 bg-[var(--bg-tertiary)] p-2 rounded border border-[var(--border)] font-mono">
                                    {frame.videoPrompt}
                                </p>
                            </div>

                            {/* Audio Player/Download */}
                            <div className="pt-2">
                                {sceneAudios[frame.frameId] ? (
                                    <div className="space-y-2">
                                        <AiviAudioPlayer src={sceneAudios[frame.frameId]} />
                                        <button
                                            onClick={() => handleDownloadAudio(frame.frameId)}
                                            className="w-full flex items-center justify-between px-3 py-2 bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 rounded-lg text-xs text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/20 transition-all font-bold"
                                        >
                                            <span className="flex items-center gap-2">
                                                <Volume2 className="w-3 h-3" />
                                                {t('download_audio')}
                                            </span>
                                            <Download className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-[10px] text-[var(--text-muted)] text-center py-2 px-3 bg-[var(--bg-tertiary)]/50 rounded-lg border border-dashed border-[var(--border)]">
                                        {t('no_audio')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Background Music Section */}
            <div className="border-t border-[var(--border)] pt-10 mb-12">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                            <Volume2 className="w-6 h-6 text-[var(--accent-primary)]" />
                            {t('music_title')}
                        </h3>
                        <p className="text-[var(--text-secondary)] text-sm mt-1">{t('music_subtitle')}</p>
                    </div>
                    <button
                        onClick={handleGenerateMusic}
                        disabled={isGeneratingMusic}
                        className="btn-primary flex items-center gap-2"
                    >
                        {isGeneratingMusic ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t('generating_music')}
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                {t('btn_generate_music')}
                            </>
                        )}
                    </button>
                </div>

                {backgroundMusic ? (
                    <div className="card p-6 flex flex-col md:flex-row items-center gap-6 bg-[var(--accent-primary)]/5 border-[var(--accent-primary)]/20">
                        <div className="w-16 h-16 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center shrink-0">
                            <Volume2 className="w-8 h-8 text-[var(--accent-primary)]" />
                        </div>
                        <div className="flex-1 space-y-2 w-full">
                            <AiviAudioPlayer src={backgroundMusic} />
                            <div className="flex justify-between items-center text-xs text-[var(--text-muted)] font-mono uppercase">
                                <span>LYRIA REALTIME ENGINE</span>
                                <span>15s GENERATED TRACK</span>
                            </div>
                        </div>
                        <button
                            onClick={handleDownloadMusicAsset}
                            className="btn-secondary px-6 flex items-center gap-2 shrink-0 mb-auto md:mb-0"
                        >
                            <Download className="w-4 h-4" />
                            {t('download_music')}
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-2xl bg-[var(--bg-secondary)]/30">
                        <p className="text-[var(--text-muted)] italic">{t('no_music')}</p>
                    </div>
                )}
            </div>

            {/* SEO & Marketing Assets Section */}
            <div className="border-t border-[var(--border)] pt-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-[var(--accent-primary)]" />
                            {t('seo_title')}
                        </h3>
                        <p className="text-[var(--text-secondary)] text-sm mt-1">{t('seo_subtitle')}</p>
                    </div>
                    <button
                        onClick={handleGenerateSeo}
                        disabled={isGeneratingSeo}
                        className="btn-primary flex items-center gap-2"
                    >
                        {isGeneratingSeo ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t('generating_seo')}
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                {t('btn_generate_seo')}
                            </>
                        )}
                    </button>
                </div>

                {seoAssets && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Viral Titles */}
                        <div className="card space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-[var(--accent-primary)]" />
                                    {t('viral_titles')}
                                </h4>
                                <button
                                    onClick={() => handleCopySeo('titles', seoAssets.viralTitles.join('\n'))}
                                    className={cn("text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-[var(--bg-tertiary)]", copiedSeo === 'titles' ? "text-[var(--success)]" : "text-[var(--text-muted)]")}
                                >
                                    {copiedSeo === 'titles' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    {t('copy_all')}
                                </button>
                            </div>
                            <div className="space-y-2">
                                {seoAssets.viralTitles.map((title, i) => (
                                    <div key={i} className="p-3 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border)] text-sm text-[var(--text-primary)] hover:border-[var(--accent-primary)] cursor-pointer transition-colors" onClick={() => handleCopySeo(`title-${i}`, title)}>
                                        <span className="text-[var(--accent-primary)] font-bold mr-2">{i + 1}.</span>
                                        {title}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="card space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-[var(--text-primary)]">{t('description_label')}</h4>
                                <button
                                    onClick={() => handleCopySeo('desc', seoAssets.description)}
                                    className={cn("text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-[var(--bg-tertiary)]", copiedSeo === 'desc' ? "text-[var(--success)]" : "text-[var(--text-muted)]")}
                                >
                                    {copiedSeo === 'desc' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    {t('copy_all')}
                                </button>
                            </div>
                            <p className="p-4 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border)] text-sm text-[var(--text-secondary)] leading-relaxed">
                                {seoAssets.description}
                            </p>
                        </div>

                        {/* Hashtags */}
                        <div className="card space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                                    <Hash className="w-4 h-4 text-[var(--accent-primary)]" />
                                    {t('hashtags_label')}
                                </h4>
                                <button
                                    onClick={() => handleCopySeo('hashtags', seoAssets.hashtags.join(' '))}
                                    className={cn("text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-[var(--bg-tertiary)]", copiedSeo === 'hashtags' ? "text-[var(--success)]" : "text-[var(--text-muted)]")}
                                >
                                    {copiedSeo === 'hashtags' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    {t('copy_all')}
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {seoAssets.hashtags.map((tag, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] rounded-full text-xs font-medium border border-[var(--accent-primary)]/30 hover:bg-[var(--accent-primary)]/20 cursor-pointer transition-colors" onClick={() => handleCopySeo(`tag-${i}`, tag)}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Keywords */}
                        <div className="card space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-[var(--text-primary)]">{t('keywords_label')}</h4>
                                <button
                                    onClick={() => handleCopySeo('keywords', seoAssets.keywords.join(', '))}
                                    className={cn("text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-[var(--bg-tertiary)]", copiedSeo === 'keywords' ? "text-[var(--success)]" : "text-[var(--text-muted)]")}
                                >
                                    {copiedSeo === 'keywords' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    {t('copy_all')}
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {seoAssets.keywords.map((kw, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-lg text-xs border border-[var(--border)] hover:border-[var(--accent-primary)] cursor-pointer transition-colors" onClick={() => handleCopySeo(`kw-${i}`, kw)}>
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Thumbnail Prompts with AI Generate */}
                        <div className="card space-y-4 lg:col-span-2">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-[var(--accent-primary)]" />
                                    {t('thumbnail_prompts')}
                                </h4>
                                <button
                                    onClick={() => handleCopySeo('thumbs', seoAssets.thumbnailPrompts.join('\n\n'))}
                                    className={cn("text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-[var(--bg-tertiary)]", copiedSeo === 'thumbs' ? "text-[var(--success)]" : "text-[var(--text-muted)]")}
                                >
                                    {copiedSeo === 'thumbs' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    {t('copy_all')}
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {seoAssets.thumbnailPrompts.map((prompt, i) => (
                                    <div key={i} className="bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border)] overflow-hidden hover:border-[var(--accent-primary)] transition-colors">
                                        {/* Thumbnail Preview */}
                                        <div className="aspect-[9/16] bg-[var(--bg-primary)] relative">
                                            {generatedThumbnails[i] ? (
                                                <>
                                                    { }
                                                    <Image src={generatedThumbnails[i]} alt={`Thumbnail ${i + 1}`} fill unoptimized className="object-cover" />
                                                    <button
                                                        onClick={() => handleDownloadThumbnail(i)}
                                                        className="absolute bottom-2 right-2 p-2 rounded-full bg-black/60 text-white hover:bg-[var(--accent-primary)] hover:text-black transition-colors"
                                                        title="Download Thumbnail"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : generatingThumbIndex === i ? (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)] mb-2" />
                                                    <span className="text-xs text-[var(--text-muted)]">{t('generating_thumb')}</span>
                                                </div>
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                                                    <ImageIcon className="w-8 h-8 text-[var(--text-muted)] mb-2 opacity-30" />
                                                    <button
                                                        onClick={() => handleGenerateThumbnail(i, prompt)}
                                                        className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
                                                    >
                                                        <Wand2 className="w-3 h-3" />
                                                        {t('btn_generate_thumb')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Prompt Text */}
                                        <div className="p-4" onClick={() => handleCopySeo(`thumb-${i}`, prompt)}>
                                            <div className="text-[10px] uppercase text-[var(--accent-primary)] font-bold mb-2">Thumbnail {i + 1}</div>
                                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">{prompt}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {!seoAssets && !isGeneratingSeo && (
                    <div className="text-center py-16 border border-dashed border-[var(--border)] rounded-2xl">
                        <Sparkles className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
                        <p className="text-[var(--text-muted)]">Click &quot;{t('btn_generate_seo')}&quot; to create viral marketing assets</p>
                    </div>
                )}
            </div>
        </div>
    );
}

