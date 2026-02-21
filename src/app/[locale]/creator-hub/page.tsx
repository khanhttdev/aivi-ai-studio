'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { m, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    Sparkles, Video, Users, Camera, Film, Mic, FileText, Bug,
    ArrowRight, Activity, ArrowUpRight, Code, ShieldCheck
} from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { cn } from '@/lib/utils';

// Constants for Categories
type Category = 'all' | 'video_production' | 'content_writing' | 'asset_generation' | 'analysis';

// Data structure for the tools
const TOOLS = [
    {
        id: 'video_analyzer',
        route: '/video-analyzer',
        icon: Video,
        categories: ['video_production', 'analysis'] as Category[],
        color: 'from-purple-500 to-indigo-500',
        bgGlow: 'bg-purple-500/20',
        textColor: 'text-purple-400',
        border: 'group-hover:border-purple-500/50',
        gridClass: 'col-span-1 md:col-span-2 lg:col-span-2 row-span-2 lg:row-span-2',
        pattern: 'radial',
        key: 'video_analyzer'
    },
    {
        id: 'pov_studio',
        route: '/pov-studio',
        icon: Bug,
        categories: ['video_production', 'content_writing'] as Category[],
        color: 'from-orange-500 to-pink-500',
        bgGlow: 'bg-orange-500/20',
        textColor: 'text-orange-400',
        border: 'group-hover:border-orange-500/50',
        gridClass: 'col-span-1 md:col-span-2 lg:col-span-2 row-span-1',
        pattern: 'dots',
        key: 'pov_studio'
    },
    {
        id: 'kol_studio',
        route: '/kol-studio',
        icon: Users,
        categories: ['asset_generation', 'analysis'] as Category[],
        color: 'from-cyan-400 to-blue-500',
        bgGlow: 'bg-cyan-500/20',
        textColor: 'text-cyan-400',
        border: 'group-hover:border-cyan-500/50',
        gridClass: 'col-span-1',
        pattern: 'waves',
        key: 'kol_studio'
    },
    {
        id: 'mini_lulu',
        route: '/kol-mini-lulu',
        icon: Sparkles,
        categories: ['video_production', 'asset_generation'] as Category[],
        color: 'from-amber-400 to-orange-500',
        bgGlow: 'bg-amber-500/20',
        textColor: 'text-amber-400',
        border: 'group-hover:border-amber-500/50',
        gridClass: 'col-span-1',
        pattern: 'stars',
        key: 'mini_lulu'
    },
    {
        id: 'image_studio',
        route: '/image-studio',
        icon: Camera,
        categories: ['asset_generation'] as Category[],
        color: 'from-fuchsia-400 to-pink-500',
        bgGlow: 'bg-fuchsia-500/20',
        textColor: 'text-fuchsia-400',
        border: 'group-hover:border-fuchsia-500/50',
        gridClass: 'col-span-1',
        pattern: 'grid',
        key: 'image_studio'
    },
    {
        id: 'story_studio',
        route: '/story-studio',
        icon: Film,
        categories: ['content_writing', 'video_production'] as Category[],
        color: 'from-red-400 to-rose-500',
        bgGlow: 'bg-red-500/20',
        textColor: 'text-red-400',
        border: 'group-hover:border-red-500/50',
        gridClass: 'col-span-1',
        pattern: 'diag',
        key: 'story_studio'
    },
    {
        id: 'voice_studio',
        route: '/voice-studio',
        icon: Mic,
        categories: ['asset_generation'] as Category[],
        color: 'from-emerald-400 to-teal-500',
        bgGlow: 'bg-emerald-500/20',
        textColor: 'text-emerald-400',
        border: 'group-hover:border-emerald-500/50',
        gridClass: 'col-span-1',
        pattern: 'waves',
        key: 'voice_studio'
    },
    {
        id: 'script_creator',
        route: '/script-creator',
        icon: FileText,
        categories: ['content_writing'] as Category[],
        color: 'from-lime-400 to-green-500',
        bgGlow: 'bg-lime-500/20',
        textColor: 'text-lime-400',
        border: 'group-hover:border-lime-500/50',
        gridClass: 'col-span-1',
        pattern: 'dots',
        key: 'script_creator'
    }
];

export default function CreatorHubPage() {
    const t = useTranslations('CreatorHub');
    const locale = useLocale();
    const [activeTab, setActiveTab] = useState<Category>('all');

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": t('title'),
        "description": t('description'),
        "applicationCategory": "MultimediaApplication",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
    };

    const categories: { id: Category; key: string }[] = [
        { id: 'all', key: 'categories.all' },
        { id: 'video_production', key: 'categories.video_production' },
        { id: 'content_writing', key: 'categories.content_writing' },
        { id: 'asset_generation', key: 'categories.asset_generation' },
        { id: 'analysis', key: 'categories.analysis' },
    ];

    const filteredTools = TOOLS.filter(tool => activeTab === 'all' || tool.categories.includes(activeTab));

    return (
        <main className="min-h-screen pb-32">
            <JsonLd data={structuredData} />

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full" />
            </div>

            {/* HEADER */}
            <header className="pt-20 lg:pt-32 pb-12 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <m.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl mb-6"
                    >
                        <Sparkles size={14} className="text-cyan-400" />
                        <span className="text-xs font-bold uppercase tracking-widest text-white/70">AIVI Ecosystem</span>
                    </m.div>

                    <m.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tighter"
                    >
                        <span className="gradient-text drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]">{t('title')}</span>
                    </m.h1>

                    <m.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto font-medium"
                    >
                        {t('description')}
                    </m.p>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6">
                {/* FILTER TABS */}
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-wrap items-center justify-center gap-2 mb-12"
                >
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={cn(
                                "px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300",
                                activeTab === cat.id
                                    ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105"
                                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
                            )}
                        >
                            {t(cat.key as any)}
                        </button>
                    ))}
                </m.div>

                {/* BENTO GRID */}
                <m.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[220px]"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredTools.map((tool, index) => {
                            const badgeStr = t(`tools.${tool.key}.badge` as any);
                            const hasBadge = badgeStr && badgeStr !== "";

                            return (
                                <m.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                    key={tool.id}
                                    className={cn(
                                        tool.gridClass,
                                        "group relative rounded-[2rem] overflow-hidden bg-white/[0.03] border border-white/5 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl",
                                        tool.border
                                    )}
                                >
                                    {/* Hover Glow Background */}
                                    <div className={cn(
                                        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[80px] -z-10",
                                        tool.bgGlow
                                    )} />

                                    <Link href={`/${locale}${tool.route}`} className="absolute inset-0 z-20 flex flex-col p-8">
                                        <div className="flex items-start justify-between mb-auto">
                                            <div className={cn(
                                                "w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg",
                                                tool.color
                                            )}>
                                                <tool.icon size={28} className="text-white drop-shadow-md" />
                                            </div>

                                            {hasBadge && (
                                                <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-black tracking-widest uppercase text-white backdrop-blur-md">
                                                    {badgeStr}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-8 transition-transform duration-500 group-hover:translate-x-2">
                                            <h2 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/50 transition-all">
                                                {t(`tools.${tool.key}.title` as any)}
                                            </h2>
                                            <p className="text-sm text-white/50 font-medium line-clamp-2 pr-8 group-hover:text-white/70 transition-colors">
                                                {t(`tools.${tool.key}.desc` as any)}
                                            </p>
                                        </div>

                                        <div className={cn(
                                            "absolute bottom-8 right-8 w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-100",
                                            tool.textColor
                                        )}>
                                            <ArrowUpRight size={18} />
                                        </div>
                                    </Link>
                                </m.div>
                            );
                        })}
                    </AnimatePresence>
                </m.div>
            </div>
        </main>
    );
}
