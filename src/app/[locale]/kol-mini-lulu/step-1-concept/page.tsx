'use client';

import { useKolMiniLuluStore } from "@/stores/useKolMiniLuluStore";
import { KOL_MINI_LULU_CONSTANTS } from "@/lib/constants/kol-mini-lulu";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles, Tag, X } from "lucide-react";
import { useMemo } from "react";

import { useTranslations, useLocale } from "next-intl";

export default function Step1ConceptPage() {
    const t = useTranslations('KolMiniLulu.Step1');
    const tCat = useTranslations('KolMiniLulu.Categories');
    const tTpl = useTranslations('KolMiniLulu.Templates');
    const locale = useLocale();
    const router = useRouter();
    const {
        selectedTemplateId,
        setTemplate,
        customPrompt,
        setCustomPrompt,
        isGeneratingIdea,
        setIsGeneratingIdea,
        selectedCategory,
        setSelectedCategory,
        reset,
        productInfo,
        setProductInfo
    } = useKolMiniLuluStore();

    // Get templates based on selected category
    const templates = useMemo(() => {
        if (selectedCategory) {
            const catTemplates = KOL_MINI_LULU_CONSTANTS.CATEGORY_TEMPLATES[selectedCategory];
            if (catTemplates && catTemplates.length > 0) {
                return catTemplates;
            }
        }
        // Fallback: show all category templates combined or legacy templates
        return KOL_MINI_LULU_CONSTANTS.TEMPLATES.map(tpl => ({
            id: tpl.id,
            titleKey: tpl.id.replace(/-/g, '_'),
            descKey: `${tpl.id.replace(/-/g, '_')}_desc`,
            scenes: tpl.scenes,
            _legacyTitle: tpl.title,
            _legacyDesc: tpl.description,
        }));
    }, [selectedCategory]);

    const handleNext = () => {
        if (selectedTemplateId || customPrompt.trim()) {
            // Auto-select character based on category
            if (selectedCategory) {
                const miniCats = ['food', 'home', 'fashion', 'health'];
                const luluCats = ['tech', 'education', 'finance', 'travel'];
                // Ent, Lifestyle => Both (default)

                if (miniCats.includes(selectedCategory)) {
                    useKolMiniLuluStore.getState().setCharacter('mini');
                } else if (luluCats.includes(selectedCategory)) {
                    useKolMiniLuluStore.getState().setCharacter('lulu');
                } else {
                    useKolMiniLuluStore.getState().setCharacter('both');
                }
            }

            router.push(`/${locale}/kol-mini-lulu/step-2-casting`);
        }
    };

    // When selecting a category template, also set the script in the legacy format
    const handleSelectTemplate = (templateId: string) => {
        setTemplate(templateId);
    };

    const getTemplateTitle = (tpl: any) => {
        if (tpl._legacyTitle) return tpl._legacyTitle;
        try { return tTpl(tpl.titleKey); } catch { return tpl.titleKey; }
    };

    const getTemplateDesc = (tpl: any) => {
        if (tpl._legacyDesc) return tpl._legacyDesc;
        try { return tTpl(tpl.descKey); } catch { return tpl.descKey; }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
                    {t('title')}
                </h1>
                <p className="text-[var(--text-secondary)]">
                    {t('subtitle')}
                </p>
            </div>

            {/* Category Badge + Change */}
            {selectedCategory && (
                <div className="flex items-center justify-center">
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl">
                        <Tag className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-bold text-amber-300">
                            {tCat(selectedCategory as any)}
                        </span>
                        <span className="text-white/30">•</span>
                        <span className="text-xs text-white/40">
                            {templates.length} {t('templates_count')}
                        </span>
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className="ml-1 p-1 hover:bg-white/10 rounded-full transition-colors"
                            title={t('change_category')}
                        >
                            <X className="w-3.5 h-3.5 text-white/40 hover:text-white" />
                        </button>
                    </div>
                </div>
            )}

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                    <div
                        key={template.id}
                        onClick={() => handleSelectTemplate(template.id)}
                        className={cn(
                            "group cursor-pointer p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden",
                            selectedTemplateId === template.id
                                ? "border-orange-500 bg-orange-500/5 ring-1 ring-orange-500"
                                : "border-[var(--border)] bg-[var(--bg-card)] hover:border-orange-500/50"
                        )}
                    >
                        <div className="relative z-10">
                            <h3 className="font-semibold text-lg mb-2">{getTemplateTitle(template)}</h3>
                            <p className="text-sm text-[var(--text-secondary)]">{getTemplateDesc(template)}</p>
                            <div className="flex items-center gap-2 mt-3 text-[10px] text-white/30 uppercase tracking-wider">
                                <span>{template.scenes.length} scenes</span>
                                <span>•</span>
                                <span>{template.scenes.map((s: any) => s.character).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i).join(' & ')}</span>
                            </div>
                        </div>
                        {selectedTemplateId === template.id && (
                            <div className="absolute top-4 right-4 text-orange-500">
                                <Sparkles className="w-5 h-5 fill-current" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Advertising Mode Toggle */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 transition-all hover:border-blue-500/50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", productInfo.enabled ? "bg-blue-500/20 text-blue-400" : "bg-gray-800 text-gray-400")}>
                            <Tag className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-white">{t('ad_mode_title')}</h3>
                            <p className="text-sm text-[var(--text-secondary)]">{t('ad_mode_desc')}</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={productInfo.enabled}
                            onChange={(e) => setProductInfo({ enabled: e.target.checked })}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                {productInfo.enabled && (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--text-secondary)]">{t('product_name_label')}</label>
                                <input
                                    type="text"
                                    value={productInfo.name}
                                    onChange={(e) => setProductInfo({ name: e.target.value })}
                                    placeholder={t('product_name_placeholder')}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--text-secondary)]">{t('product_usp_label')}</label>
                                <input
                                    type="text"
                                    value={productInfo.usp}
                                    onChange={(e) => setProductInfo({ usp: e.target.value })}
                                    placeholder={t('product_usp_placeholder')}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Product Type Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--text-secondary)]">{t('product_type_label')}</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setProductInfo({ type: 'general' })}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                                        productInfo.type === 'general' || !productInfo.type
                                            ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                                            : "bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-secondary)] hover:border-blue-500/30"
                                    )}
                                >
                                    {t('product_type_general')}
                                </button>
                                <button
                                    onClick={() => setProductInfo({ type: 'fashion' })}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                                        productInfo.type === 'fashion'
                                            ? "bg-pink-500/20 border-pink-500/50 text-pink-400"
                                            : "bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-secondary)] hover:border-pink-500/30"
                                    )}
                                >
                                    {t('product_type_fashion')}
                                </button>
                            </div>
                        </div>

                        {/* Product Image Upload */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--text-secondary)]">
                                {productInfo.type === 'fashion' ? t('product_clothing_label') : t('product_image_label')}
                            </label>
                            <div className="flex items-center gap-4">
                                {productInfo.image ? (
                                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-blue-500/30 group">
                                        <img src={productInfo.image} alt="Product" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => setProductInfo({ image: null })}
                                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-6 h-6 text-white" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] rounded-xl cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
                                        <span className="text-xs text-[var(--text-secondary)] text-center px-1">{t('upload_image')}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setProductInfo({ image: reader.result as string });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </label>
                                )}
                                <div className="text-xs text-[var(--text-secondary)] max-w-[200px]">
                                    {productInfo.type === 'fashion'
                                        ? "AI sẽ mặc trang phục này cho nhân vật. Vui lòng upload ảnh rõ nét, trải phẳng hoặc ma-nơ-canh."
                                        : t('product_image_hint')}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Input */}
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="h-[1px] flex-1 bg-[var(--border)]" />
                    <span className="text-sm text-[var(--text-secondary)] uppercase font-medium">{t('or_label')}</span>
                    <div className="h-[1px] flex-1 bg-[var(--border)]" />
                </div>

                <div className={cn(
                    "p-6 rounded-2xl border transition-all",
                    customPrompt ? "border-pink-500 bg-pink-500/5" : "border-[var(--border)] bg-[var(--bg-card)]"
                )}>
                    <label className="flex items-center justify-between text-sm font-medium mb-3">
                        <span>{t('custom_idea_title')}</span>
                        <button
                            onClick={async () => {
                                setIsGeneratingIdea(true);
                                try {
                                    const response = await fetch('/api/kol-mini-lulu/generate-ideas', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            category: selectedCategory, // Pass selected category to enforce character constraints
                                            productInfo: productInfo.enabled ? productInfo : undefined // Pass product info if enabled
                                        })
                                    });
                                    const data = await response.json();
                                    if (data.idea) setCustomPrompt(data.idea);
                                } catch (e) {
                                    console.error(e);
                                } finally {
                                    setIsGeneratingIdea(false);
                                }
                            }}
                            disabled={isGeneratingIdea}
                            className="text-xs flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 text-purple-400 border border-purple-500/30 transition-all"
                        >
                            {isGeneratingIdea ? (
                                <span className="animate-spin">✨</span>
                            ) : (
                                <Sparkles className="w-3 h-3" />
                            )}
                            {isGeneratingIdea ? t('btn_generating') : t('btn_generate_idea')}
                        </button>
                    </label>
                    <textarea
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder={selectedCategory
                            ? t('custom_idea_placeholder_cat', { category: tCat(selectedCategory as any) })
                            : t('custom_idea_placeholder')
                        }
                        className="w-full h-32 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all resize-none"
                    />
                </div>
            </div >

            {/* Navigation */}
            < div className="flex justify-end pt-8" >
                <button
                    onClick={handleNext}
                    disabled={!selectedTemplateId && !customPrompt.trim()}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-1"
                >
                    {t('btn_next')}
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div >
        </div >
    );
}
