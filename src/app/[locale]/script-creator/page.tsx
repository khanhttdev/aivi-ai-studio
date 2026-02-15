"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ContentIdea } from "@/lib/gemini/types";
import { EliteButton } from "@/components/ui/EliteButton";
import { EliteInput } from "@/components/ui/EliteInput";
import { EliteCard } from "@/components/ui/EliteCard";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Sparkles, Upload, Image as ImageIcon, Video, Wand2, ArrowRight, Download, History } from "lucide-react";
import { generateSubNichesAction, generateIdeasAction, generateScriptAction, generateImageAction } from "@/app/actions/script-actions";
import { cn } from "@/lib/utils";
import { useToastStore } from "@/stores/toastStore";
import { createClient } from "@/lib/supabase/client";
import { projectService } from "@/lib/services/projectService";
import { useLocale } from "next-intl";
import { Volume2, Zap } from "lucide-react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useApiKeyEnforcer } from "@/hooks/useApiKeyEnforcer";


export default function ScriptCreatorPage() {
    const { addToast } = useToastStore();
    const { apiKey } = useSettingsStore();
    const { checkApiKey, ApiKeyEnforcer } = useApiKeyEnforcer();
    const locale = useLocale();


    // State
    const [topic, setTopic] = useState("");
    const [subNiches, setSubNiches] = useState<string[]>([]);
    const [selectedNiche, setSelectedNiche] = useState("");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [ideas, setIdeas] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [script, setScript] = useState<any>(null); // New state for script
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [history, setHistory] = useState<any[]>([]);

    // Fetch History on Mount
    React.useEffect(() => {
        const fetchHistory = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('scripts')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (data) setHistory(data);
        };
        fetchHistory();

        // Check for Remix Context from Video Analyzer
        const remixContext = localStorage.getItem('aivi_remix_context');
        if (remixContext) {
            try {
                const context = JSON.parse(remixContext);
                if (context.topic) {
                    setTopic(context.topic);
                }
                localStorage.removeItem('aivi_remix_context');
            } catch (e) {
                console.error("Failed to parse remix context", e);
            }
        }
    }, []);

    const [loadingStep, setLoadingStep] = useState<"none" | "niche" | "ideas" | "script">("none");

    // Image State
    const [char1Image, setChar1Image] = useState<string | null>(null);
    const [char2Image, setChar2Image] = useState<string | null>(null);

    // Scene Image Generation State
    const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({}); // frameId -> url
    const [loadingImages, setLoadingImages] = useState<Record<number, boolean>>({}); // frameId -> isLoading

    // Handlers
    const handleAnalyzeTopic = async () => {
        if (!topic) return;
        if (!checkApiKey()) return;
        setLoadingStep("niche");
        try {
            // apiKey is already available from useSettingsStore
            const results = await generateSubNichesAction(topic, apiKey);
            setSubNiches(results);
            setSelectedNiche(""); // Reset selected niche when new topic is analyzed
            setIdeas([]); // Clear ideas
            setScript(null); // Clear script
            addToast("Đã phân tích xong chủ đề!", "success");
        } catch (e) {
            console.error(e);
            addToast("Lỗi khi tạo sub-niches. Vui lòng thử lại.", "error");
        } finally {
            setLoadingStep("none");
        }
    };

    const handleSelectNiche = (niche: string) => {
        setSelectedNiche(niche);
    };

    const resizeImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const maxDim = 1024; // Resize to max 1024px to result in ~500KB-1MB base64

                    if (width > height) {
                        if (width > maxDim) {
                            height = Math.round((height *= maxDim / width));
                            width = maxDim;
                        }
                    } else {
                        if (height > maxDim) {
                            width = Math.round((width *= maxDim / height));
                            height = maxDim;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8)); // Use JPEG 0.8 quality
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, charId: 1 | 2) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const base64 = await resizeImage(file);
            if (charId === 1) setChar1Image(base64);
            else setChar2Image(base64);
        } catch (error) {
            console.error("Resize error:", error);
            addToast("Lỗi xử lý ảnh", "error");
        }
    };

    const handleGenerateIdeas = async () => {
        if (!char1Image || !char2Image) {
            addToast("Vui lòng upload cả 2 ảnh nhân vật", "warning");
            return;
        }
        setScript(null); // Clear any existing script when generating new ideas
        if (!checkApiKey()) return;
        setLoadingStep("ideas");
        try {
            const images = [char1Image, char2Image];
            // apiKey is available
            const results = await generateIdeasAction(selectedNiche || topic, images, apiKey);
            setIdeas(results);
            addToast("Đã tạo 5 ý tưởng viral!", "success");
        } catch (e) {
            console.error(e);
            addToast("Lỗi khi tạo ý tưởng. Kiểm tra API Key của bạn.", "error");
        } finally {
            setLoadingStep("none");
        }
    };

    const handleSelectIdea = async (idea: ContentIdea) => {
        setLoadingStep("script");
        setGeneratedImages({}); // Clear images for new script
        if (!checkApiKey()) return;
        try {
            // apiKey available
            const result = await generateScriptAction(idea, apiKey);
            setScript(result);

            // Save to Supabase
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: savedScript } = await (supabase.from('scripts') as any).insert({
                    user_id: user.id,
                    topic: topic || "Chủ đề chưa đặt tên",
                    niche: selectedNiche,
                    ideas: ideas,
                    selected_idea: idea,
                    content: result
                }).select().single();


                if (savedScript) {
                    setHistory(prev => [savedScript, ...prev]);
                }
            }

            addToast("Kịch bản viral đã sẵn sàng!", "success");
        } catch (e) {
            console.error(e);
            addToast("Lỗi khi tạo kịch bản.", "error");
        } finally {
            setLoadingStep("none");
        }
    };

    const handleGenerateSceneImage = async (frameId: number, prompt: string) => {
        setLoadingImages(prev => ({ ...prev, [frameId]: true }));
        if (!checkApiKey()) {
            setLoadingImages(prev => ({ ...prev, [frameId]: false }));
            return;
        }
        try {
            // In a real app, we might mix the prompt with character context
            // apiKey available
            const result = await generateImageAction(prompt, apiKey);
            if (result) {
                setGeneratedImages(prev => ({ ...prev, [frameId]: result }));
                addToast("Đã tạo ảnh minh họa!", "success");
            }
        } catch (e) {
            console.error(e);
            addToast("Lỗi khi tạo ảnh.", "error");
        } finally {
            setLoadingImages(prev => ({ ...prev, [frameId]: false }));
        }
    };

    const handleDownloadImage = (url: string, fileName: string) => {
        try {
            // 1. Validate URL
            if (!url || !url.startsWith('data:')) {
                console.error("Invalid image data");
                return;
            }

            // 2. Decode Base64 manually (Robust method)
            const parts = url.split(',');
            const mimeString = parts[0].split(':')[1].split(';')[0];
            const byteString = atob(parts[1]);

            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            // 3. Create Blob
            const blob = new Blob([ab], { type: mimeString });
            const blobUrl = URL.createObjectURL(blob);

            // 4. Determine Filename with Extension
            // Default to jpg if mime is unknown, otherwise map common types
            let ext = 'jpg';
            if (mimeString === 'image/png') ext = 'png';
            else if (mimeString === 'image/webp') ext = 'webp';

            // Ensure filename has the correct extension
            const nameBase = fileName.includes('.') ? fileName.split('.')[0] : fileName;
            const finalName = `${nameBase}.${ext}`;

            // 5. Trigger Download
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = finalName;
            link.style.display = 'none'; // Hide explicitly
            document.body.appendChild(link);

            link.click();

            // 6. Cleanup
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

            addToast("Đang lưu ảnh...", "success");
        } catch (e) {
            console.error("Download Error:", e);
            addToast("Lỗi khi tải xuống.", "error");
        }
    };

    const handleSpeakDialogue = (text: string) => {
        if (!('speechSynthesis' in window)) {
            addToast("Trình duyệt của bạn không hỗ trợ TTS", "error");
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = locale === 'vi' ? 'vi-VN' : 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    };

    const handleSaveAsProject = async () => {
        if (!script) return;
        setLoadingStep("script");
        try {
            await projectService.createProject(
                `Campaign: ${topic}`,
                'marketing',
                {
                    script,
                    assets: generatedImages,
                }
            );
            addToast("Đã lưu chiến dịch vào Dashboard!", "success");
        } catch (e) {
            console.error(e);
            addToast("Lỗi khi lưu chiến dịch", "error");
        } finally {
            setLoadingStep("none");
        }
    };

    return (
        <div className="flex bg-transparent min-h-screen text-[var(--text-primary)] font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-[var(--border)] hidden md:flex flex-col p-6 gap-6 bg-[var(--bg-secondary)]/80 backdrop-blur-xl fixed h-full z-10 transition-all glass-panel">
                <Link href="/" className="flex items-center gap-3 text-[var(--accent-primary)] hover:opacity-80 transition-opacity">
                    <div className="p-2 bg-[var(--accent-primary)]/10 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                        <Video className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-xl tracking-tight gradient-text">AIVI Studio</span>
                </Link>

                <nav className="flex flex-col gap-2">
                    <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] px-2 mb-2">Creative Suite</div>

                    <Link href="/script-creator">
                        <EliteButton variant="secondary" className="justify-start border-[var(--accent-primary)]/50 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] w-full shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                            <Wand2 className="w-4 h-4 mr-2" />
                            Script Creator
                        </EliteButton>
                    </Link>

                    <Link href="/image-studio">
                        <EliteButton variant="ghost" className="justify-start text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-tertiary)] w-full transition-all">
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Image Studio
                        </EliteButton>
                    </Link>


                </nav>

                {/* History Section */}
                {history.length > 0 && (
                    <div className="flex flex-col gap-2 overflow-y-auto max-h-[200px] scrollbar-hide">
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-2 mb-2 flex items-center gap-2">
                            <History className="w-3 h-3" /> Recent Scripts
                        </div>
                        {history.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setScript(item.content);
                                    setIdeas(item.ideas || []);
                                    setTopic(item.topic);
                                    setSelectedNiche(item.niche);
                                }}
                                className="text-left px-3 py-2 rounded-lg text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors truncate"
                            >
                                {item.content?.title || item.topic}
                            </button>
                        ))}
                    </div>
                )}

                <div className="mt-auto mb-6">
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] border border-[var(--border)] glass-card">
                        <h4 className="font-bold text-sm text-[var(--text-primary)] mb-1">Pro Tips</h4>
                        <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                            Upload ảnh nhân vật rõ nét để AI tạo kịch bản sát thực tế nhất.
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 px-4 py-8 md:p-12 max-w-7xl mx-auto w-full pb-24 md:pb-12">
                {/* Header */}
                <header className="mb-6 md:mb-12 flex flex-col gap-3 md:gap-4">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-[10px] font-black uppercase tracking-[0.2em] border border-[var(--accent-primary)]/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                            New Feature
                        </span>
                        <span className="text-[var(--text-muted)] font-mono text-xs">v1.0.0</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
                        Elite <span className="gradient-text">Script Creator</span>
                    </h1>
                    <p className="text-[var(--text-secondary)] text-sm md:text-lg max-w-2xl font-medium leading-relaxed uppercase tracking-wide opacity-80">
                        Tạo kịch bản video viral triệu view chỉ trong vài giây với sức mạnh của <span className="text-[var(--accent-primary)] font-black">Gemini AI</span>.
                    </p>
                </header>

                {/* Setup Section */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

                    {/* Left Column: Configuration */}
                    <div className="lg:col-span-4 space-y-4 md:space-y-6">
                        <EliteCard variant="glass" className="space-y-4 md:space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center text-[var(--accent-primary)] font-black shadow-[0_0_10px_rgba(6,182,212,0.3)]">1</div>
                                <h3 className="font-black text-base md:text-lg uppercase tracking-widest">Cấu hình Chủ đề</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <EliteInput
                                        placeholder="VD: Mẹo vặt, Tài chính..."
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        className="flex-1 w-full"
                                    />
                                    <EliteButton
                                        onClick={handleAnalyzeTopic}
                                        isLoading={loadingStep === "niche"}
                                        className="w-full sm:w-auto px-6 bg-[var(--accent-primary)] text-black justify-center"
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                    </EliteButton>
                                </div>

                                {/* Sub-niches Selection */}
                                {subNiches.length > 0 && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">
                                            Chọn ngách viral ({subNiches.length})
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {subNiches.map((niche) => (
                                                <button
                                                    key={niche}
                                                    onClick={() => handleSelectNiche(niche)}
                                                    className={cn(
                                                        "px-3 py-2 rounded-lg text-sm font-medium transition-all border text-left",
                                                        selectedNiche === niche
                                                            ? "bg-[var(--accent-primary)] text-black border-[var(--accent-primary)] shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                                                            : "bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]/50 hover:text-[var(--text-primary)]"
                                                    )}
                                                >
                                                    {niche}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {selectedNiche && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 pt-4 border-t border-[var(--border)]">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-black text-[10px] text-[var(--text-secondary)] uppercase tracking-[0.2em]">Nhân vật (Visuals)</h3>
                                            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-mono">{'// Required'}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                                            {/* Char 1 */}
                                            <div className="relative aspect-square rounded-2xl border-2 border-dashed border-[var(--border)] hover:border-[var(--accent-primary)] hover:bg-[var(--bg-tertiary)] transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-[var(--text-muted)] hover:text-[var(--accent-primary)] group overflow-hidden glass-card">
                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleImageUpload(e, 1)} accept="image/*" />
                                                {char1Image ? (
                                                    <Image src={char1Image} alt="Char 1" fill className="object-cover" unoptimized />
                                                ) : (
                                                    <>
                                                        <div className="p-3 rounded-full bg-[var(--bg-tertiary)] group-hover:bg-[var(--accent-primary)]/10 transition-colors">
                                                            <Upload className="w-5 h-5" />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-center px-1">Character 1</span>
                                                    </>
                                                )}
                                            </div>

                                            {/* Char 2 */}
                                            <div className="relative aspect-square rounded-2xl border-2 border-dashed border-[var(--border)] hover:border-[var(--accent-primary)] hover:bg-[var(--bg-tertiary)] transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-[var(--text-muted)] hover:text-[var(--accent-primary)] group overflow-hidden glass-card">
                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleImageUpload(e, 2)} accept="image/*" />
                                                {char2Image ? (
                                                    <Image src={char2Image} alt="Char 2" fill className="object-cover" unoptimized />
                                                ) : (
                                                    <>
                                                        <div className="p-3 rounded-full bg-[var(--bg-tertiary)] group-hover:bg-[var(--accent-primary)]/10 transition-colors">
                                                            <Upload className="w-5 h-5" />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-center px-1">Character 2</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <EliteButton block onClick={handleGenerateIdeas} isLoading={loadingStep === "ideas"}>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Generate Ideas
                                    </EliteButton>
                                </div>
                            )}
                        </EliteCard>
                    </div>

                    {/* Right Column: Results & Preview */}
                    <div className="lg:col-span-8 flex flex-col gap-4 md:gap-6 relative min-h-[500px]">
                        {loadingStep === "script" && (
                            <LoadingOverlay
                                message="Đang viết kịch bản viral..."
                                description="AI đang phân tích tâm lý người xem và tối ưu từng câu thoại theo phong cách Elite."
                                className="z-20 rounded-3xl"
                            />
                        )}

                        {loadingStep === "ideas" && (
                            <LoadingOverlay
                                message="Đang brainstorm ý tưởng..."
                                description="AI đang phân tích hình ảnh nhân vật và xu hướng viral..."
                                className="z-20 rounded-3xl"
                            />
                        )}

                        {script ? (
                            <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                {/* Script Header */}
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter">
                                        {script.title}
                                    </h2>
                                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                        <EliteButton variant="secondary" onClick={() => setScript(null)} className="w-full sm:w-auto text-sm justify-center">
                                            Back to Ideas
                                        </EliteButton>
                                        <EliteButton variant="primary" onClick={handleSaveAsProject} className="w-full sm:w-auto text-sm bg-[var(--accent-primary)]/20 border-[var(--accent-primary)]/50 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/30 justify-center">
                                            <Zap className="w-4 h-4 mr-2" />
                                            Save Campaign
                                        </EliteButton>
                                    </div>
                                </div>
                                <p className="text-zinc-400 text-sm md:text-base italic">{script.scriptDescription}</p>

                                {/* Scenes */}
                                <div className="space-y-4">
                                    {script.scenes.map((scene: { frameId: number; description: string; dialogue: string; videoPrompt?: string; imagePrompt?: string }, idx: number) => (
                                        <EliteCard key={idx} variant="glass" className="relative overflow-hidden group hover:border-primary-orange/50 transition-all duration-500">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-zinc-800 group-hover:bg-primary-orange transition-colors duration-300" />
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                                <div className="md:col-span-2 space-y-3 order-2 md:order-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Scene {scene.frameId}</span>
                                                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] md:text-xs text-zinc-300 line-clamp-1">{scene.description}</span>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <p className="text-base md:text-lg font-medium text-zinc-100 leading-relaxed flex-1">
                                                            &quot;{scene.dialogue}&quot;
                                                        </p>
                                                        <button
                                                            onClick={() => handleSpeakDialogue(scene.dialogue)}
                                                            className="p-2 rounded-full bg-zinc-800/50 hover:bg-[var(--accent-primary)]/20 text-zinc-400 hover:text-[var(--accent-primary)] transition-all flex-shrink-0"
                                                            title="Nghe lồng tiếng AI"
                                                        >
                                                            <Volume2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
                                                        <span className="text-[10px] md:text-xs font-bold text-zinc-600 uppercase block mb-1">Image Prompt</span>
                                                        <p className="text-[10px] md:text-xs text-zinc-500 line-clamp-3">{scene.imagePrompt}</p>
                                                    </div>
                                                </div>

                                                {/* Image Placeholder or Result */}
                                                <div
                                                    className={cn(
                                                        "aspect-video md:aspect-[9/16] bg-[var(--bg-darker)] rounded-xl border border-[var(--border)] flex flex-col items-center justify-center gap-2 group/image hover:border-[var(--accent-primary)]/50 transition-all cursor-pointer overflow-hidden relative order-1 md:order-2 w-full",
                                                        generatedImages[scene.frameId] && "border-none"
                                                    )}
                                                    onClick={() => !loadingImages[scene.frameId] && !generatedImages[scene.frameId] && handleGenerateSceneImage(scene.frameId, scene.imagePrompt || '')}
                                                >
                                                    {generatedImages[scene.frameId] ? (
                                                        <>
                                                            <Image src={generatedImages[scene.frameId]} alt="Scene Visual" fill className="object-cover animate-in fade-in" unoptimized />
                                                            {/* Download Overlay */}
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        // Ensure we pass the full Data URI or URL
                                                                        handleDownloadImage(generatedImages[scene.frameId], `scene-${scene.frameId}.png`);
                                                                    }}
                                                                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all hover:scale-110"
                                                                    title="Tải ảnh này về"
                                                                >
                                                                    <Download className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : loadingImages[scene.frameId] ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Wand2 className="w-6 h-6 text-primary-orange animate-spin" />
                                                            <span className="text-xs text-zinc-500 animate-pulse">Designing...</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <ImageIcon className="w-8 h-8 text-zinc-700 group-hover/image:text-primary-orange transition-colors" />
                                                            <span className="text-xs font-bold text-zinc-600 group-hover/image:text-primary-orange">Generate Visual</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </EliteCard>
                                    ))}
                                </div>
                            </div>
                        ) : ideas.length === 0 ? (
                            <div className="flex-1 min-h-[500px] border border-[var(--border)] rounded-3xl bg-[var(--bg-secondary)]/30 flex flex-col items-center justify-center text-center p-12 glass-card">
                                <div className="w-20 h-20 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
                                    <Sparkles className="w-8 h-8 text-[var(--accent-primary)]/30" />
                                </div>
                                <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-widest mb-2">Chưa có ý tưởng nào</h3>
                                <p className="text-[var(--text-muted)] max-w-sm text-sm font-medium">
                                    Hãy chọn ngách và upload ảnh nhân vật để AI bắt đầu brainstorm các ý tưởng viral cho bạn.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                                {ideas.map((idea) => (
                                    <EliteCard
                                        key={idea.id}
                                        variant="default"
                                        className="cursor-pointer group hover:bg-[var(--bg-secondary)] hover:border-[var(--accent-primary)]/50 transition-all glass-card"
                                        onClick={() => handleSelectIdea(idea)}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="inline-flex items-center justify-center px-2 py-1 bg-[var(--bg-tertiary)] rounded text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border border-white/5">
                                                #{idea.id}
                                            </span>
                                            <div className="flex items-center gap-1 text-[var(--accent-primary)]">
                                                <Sparkles className="w-3 h-3 fill-current" />
                                                <span className="text-[10px] font-black tracking-widest">{idea.viralScore || 0}/10</span>
                                            </div>
                                        </div>
                                        <h4 className="font-black text-lg text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-primary)] transition-colors tracking-tight">
                                            {idea.title}
                                        </h4>
                                        <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                                            {idea.brief}
                                        </p>
                                        <div className="mt-4 flex items-center text-[var(--accent-primary)] text-[10px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                            Create Script <ArrowRight className="w-4 h-4 ml-2" />
                                        </div>
                                    </EliteCard>
                                ))}
                            </div>
                        )}
                    </div>

                </section>
            </main>
            <ApiKeyEnforcer />
        </div>
    );
}
