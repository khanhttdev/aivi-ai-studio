'use client';

import React, { useState, useEffect } from 'react';
import {
    Search, Image as ImageIcon,
    ChevronDown,
    Trash2, ExternalLink, UploadCloud, Download,
    FileText, X,
    LayoutGrid
} from 'lucide-react';
import { CyberCard } from '@/components/ui/CyberCard';
// import { createClient } from '@/lib/supabase/client';
import { projectService } from '@/lib/services/projectService';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import Image from 'next/image';



// --- CATEGORIES ---
const CATEGORIES = [
    { id: 'characters', label: 'AI Characters' },
    { id: 'processed', label: 'Processed Images' },
    { id: 'marketing', label: 'Marketing Campaigns' },
    { id: 'backgrounds', label: 'Backgrounds' },
];

export default function AssetsLibrary() {
    const [activeCategory, setActiveCategory] = useState('characters');
    const [searchQuery, setSearchQuery] = useState('');
    const [showMobileDetails, setShowMobileDetails] = useState(false);



    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [assets, setAssets] = useState<any[]>([]);
    // const [isLoading, setIsLoading] = useState(true);
    const locale = useLocale();

    useEffect(() => {
        const fetchAll = async () => {
            // setIsLoading(true);
            try {
                const history = await projectService.getHistory(50);
                if (history) {
                    // Transform projects into library assets
                    const transformed = history.flatMap(proj => {
                        // If it's a marketing project, treat the whole project as one asset
                        if (proj.type === 'marketing') {
                            return [{
                                id: proj.id,
                                name: proj.name,
                                category: 'marketing',
                                type: 'Campaign',
                                thumbnail: (proj.assets && proj.assets.length > 0) ? proj.assets[0].url : null,
                                tags: ['AI', 'Marketing'],
                                timeAgo: formatDistanceToNow(new Date(proj.created_at), {
                                    addSuffix: true,
                                    locale: locale === 'vi' ? vi : enUS
                                }),
                                created: new Date(proj.created_at).toLocaleString(),
                                size: '-',
                                dimensions: 'Multi-Asset'
                            }];
                        }

                        // Otherwise, map individual assets
                        return (proj.assets || []).map((asset, idx) => ({
                            id: `${proj.id}-${idx}`,
                            name: `${proj.name} Item ${idx + 1}`,
                            category: asset.type === 'source' ? 'characters' : 'processed',
                            type: asset.type.toUpperCase(),
                            thumbnail: asset.url,
                            tags: [proj.type.toUpperCase()],
                            timeAgo: formatDistanceToNow(new Date(proj.created_at), {
                                addSuffix: true,
                                locale: locale === 'vi' ? vi : enUS
                            }),
                            created: new Date(proj.created_at).toLocaleString(),
                            size: 'N/A',
                            dimensions: 'N/A'
                        }));
                    });
                    setAssets(transformed);
                }
            } catch (e) {
                console.error("Error fetching library:", e);
            }
            // finally {
            //     setIsLoading(false);
            // }
        };
        fetchAll();
    }, [locale]);

    const filteredAssets = assets.filter(a =>
        a.category === activeCategory &&
        (a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const selectedAsset = filteredAssets.find(a => a.id === selectedAssetId) || filteredAssets[0];



    return (
        <div className="flex h-screen bg-transparent text-[var(--text-primary)] overflow-hidden font-sans selection:bg-cyan-500/30">

            {/* === COLUMN 2: ASSET GRID (Center) === */}
            <main className="flex-1 flex flex-col relative overflow-hidden bg-transparent">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

                {/* Search & Toolbar Row */}
                <div className="p-4 md:px-10 py-6 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 relative z-20 bg-black/20 backdrop-blur-md">
                    <div className="w-full md:max-w-md relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-cyan-400 transition" />
                        <input
                            type="text"
                            placeholder="Search assets..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:border-white/20 transition flex items-center gap-2">
                            Sort <ChevronDown size={14} className="text-zinc-600" />
                        </button>
                    </div>
                </div>

                {/* Categories Scrollbar */}
                <div className="px-4 md:px-10 py-4 border-b border-white/5 overflow-x-auto no-scrollbar relative z-10 bg-black/5">
                    <div className="flex gap-2 min-w-max">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeCategory === cat.id
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                                    : 'text-zinc-500 hover:text-zinc-400 hover:bg-white/5'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-10 no-scrollbar relative z-10">
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                        {filteredAssets.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-zinc-600 font-bold uppercase tracking-widest">
                                No assets found in this category
                            </div>
                        ) : (
                            filteredAssets.map((asset) => (
                                <div
                                    key={asset.id}
                                    onClick={() => {
                                        setSelectedAssetId(asset.id);
                                        if (window.innerWidth < 768) setShowMobileDetails(true);
                                    }}
                                    className={`group cursor-pointer relative ${selectedAsset?.id === asset.id ? 'z-20' : 'z-10'}`}
                                >
                                    <div className={`absolute -inset-[2px] bg-cyan-500 rounded-[22px] blur-md opacity-0 transition-opacity duration-300 ${selectedAsset?.id === asset.id ? 'opacity-30' : 'group-hover:opacity-10'}`} />
                                    <CyberCard
                                        selected={selectedAsset?.id === asset.id}
                                        className={`flex flex-col gap-0 p-0 border-white/5 bg-zinc-900 overflow-hidden h-[320px] shadow-2xl transition-transform duration-300 ${selectedAsset?.id === asset.id ? 'scale-[1.02]' : 'group-hover:translate-y-[-4px]'}`}
                                    >
                                        <div className="aspect-[3/4] relative overflow-hidden bg-zinc-800">
                                            {asset.thumbnail ? (
                                                <>
                                                    <Image src={asset.thumbnail} fill className="object-cover transition-transform duration-500 group-hover:scale-110" alt={asset.name} unoptimized />
                                                </>

                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-zinc-900/50">
                                                    <ImageIcon className="text-zinc-800" size={48} />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-60" />

                                            {/* File Type Badge */}
                                            <div className="absolute top-4 left-4 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/10 flex items-center gap-1.5 shadow-xl">
                                                <ImageIcon size={10} className="text-cyan-400" />
                                                <span className="text-[8px] font-black text-white">{asset.type}</span>
                                            </div>

                                            <div className="absolute bottom-4 right-4 text-[8px] font-black text-zinc-400 uppercase tracking-widest">
                                                {asset.timeAgo}
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gradient-to-b from-transparent to-black/40">
                                            <h3 className="text-xs font-black text-white uppercase tracking-tight mb-2 truncate group-hover:text-cyan-400 transition-colors uppercase">{asset.name}</h3>
                                            <div className="flex flex-wrap gap-1.5">
                                                {asset.tags?.map((tag: string, i: number) => (
                                                    <span key={i} className={`text-[7px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded border ${tag === 'NEW' ? 'bg-cyan-500 border-cyan-400 text-black animate-pulse' : 'bg-white/5 border-white/10 text-zinc-500'
                                                        }`}>
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </CyberCard>
                                </div>
                            ))
                        )}

                        {/* Upload Placeholder */}
                        <div className="col-span-full mt-10">
                            <div className="w-full border-2 border-dashed border-white/5 rounded-[40px] p-20 flex flex-col items-center justify-center group hover:border-cyan-500/30 hover:bg-cyan-500/[0.02] transition-all cursor-pointer">
                                <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition duration-500 group-hover:border-cyan-500/20 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                                    <UploadCloud className="w-8 h-8 text-zinc-700 group-hover:text-cyan-500 transition" />
                                </div>
                                <h4 className="text-lg font-black text-white mb-2 uppercase tracking-tight">Upload New Assets</h4>
                                <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest">Drag & drop files here or click to browse</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* === COLUMN 3: DETAIL PANEL (Right) === */}
            <aside className={`fixed md:relative inset-y-0 right-0 w-full md:w-[380px] lg:w-[420px] 2xl:w-[480px] border-l border-white/5 bg-[var(--bg-secondary)]/95 md:bg-[var(--bg-secondary)]/50 backdrop-blur-2xl md:backdrop-blur-xl flex flex-col z-50 transform transition-transform duration-300 ${showMobileDetails ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
                <header className="h-24 md:h-28 border-b border-white/5 flex items-center justify-between px-6 md:px-10 bg-transparent">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-1">Details</span>
                        <h2 className="text-sm md:text-lg font-black text-white uppercase tracking-tight truncate max-w-[200px]">{selectedAsset?.name || 'No selection'}</h2>
                    </div>
                    <button className="md:hidden p-2 text-zinc-500 hover:text-white" onClick={() => setShowMobileDetails(false)}>
                        <X size={20} />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-10 no-scrollbar space-y-12">
                    {!selectedAsset ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-600 font-bold uppercase tracking-widest">
                            Pick an asset to see details
                        </div>
                    ) : (
                        <>
                            {/* Main Preview */}
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-cyan-500/10 rounded-[3rem] blur-3xl opacity-30" />
                                <div className="relative aspect-[4/3] bg-zinc-900 rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
                                    {selectedAsset.thumbnail ? (
                                        <>
                                            <Image src={selectedAsset.thumbnail} fill className="object-cover opacity-80" alt="Preview" unoptimized />
                                        </>
                                    ) : (
                                        <ImageIcon className="text-zinc-800" size={64} />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <button className="absolute top-6 right-6 p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl text-white hover:scale-110 transition">
                                        <ExternalLink size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Metadata Grid */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                    <FileText size={14} className="text-cyan-500" />
                                    Metadata
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { label: 'File Type', value: `${selectedAsset.type} - ${selectedAsset.subType || '8bit'}` },
                                        { label: 'Dimensions', value: selectedAsset.dimensions },
                                        { label: 'Size', value: selectedAsset.size },
                                        { label: 'Created', value: selectedAsset.created },
                                    ].map((row, i) => (
                                        <div key={i} className="flex justify-between items-center py-1 group">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{row.label}</span>
                                            <span className="text-xs font-mono text-zinc-300 group-hover:text-cyan-400 transition-colors uppercase">{row.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Used In Projects */}
                            {selectedAsset.projects && selectedAsset.projects.length > 0 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                        <LayoutGrid size={14} className="text-purple-500" />
                                        Used in Projects
                                    </div>
                                    <div className="space-y-4">
                                        {selectedAsset.projects.map((proj: { name: string; lastEdited: string; icon: React.ComponentType<{ size: number; className?: string }> }, i: number) => (
                                            <CyberCard key={i} className="bg-white/5 border-white/5 p-4 flex items-center justify-between group hover:border-white/10">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center">
                                                        <proj.icon size={18} className={i === 0 ? 'text-cyan-400' : 'text-orange-400'} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-black text-white uppercase tracking-tight">{proj.name}</h4>
                                                        <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">Last edited {proj.lastEdited}</p>
                                                    </div>
                                                </div>
                                                <button className="p-2 text-zinc-700 hover:text-cyan-400 transition">
                                                    <ChevronDown size={16} className="-rotate-90" />
                                                </button>
                                            </CyberCard>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions Bottom */}
                            <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                                <button
                                    onClick={async () => {
                                        if (!selectedAsset?.thumbnail) return;
                                        try {
                                            const response = await fetch(selectedAsset.thumbnail);
                                            const blob = await response.blob();
                                            const url = window.URL.createObjectURL(blob);
                                            const link = document.createElement('a');
                                            link.href = url;
                                            link.download = `${selectedAsset.name.replace(/\s+/g, '_')}.png`;
                                            document.body.appendChild(link);
                                            link.click();
                                            window.URL.revokeObjectURL(url);
                                            document.body.removeChild(link);
                                        } catch {
                                            window.open(selectedAsset.thumbnail, '_blank');
                                        }
                                    }}
                                    className="flex items-center justify-center gap-3 px-6 py-4 bg-zinc-900 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:bg-zinc-800 transition"
                                >
                                    <Download size={16} /> Download
                                </button>
                                <button className="flex items-center justify-center gap-3 px-6 py-4 bg-zinc-900 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500/70 hover:bg-red-500/10 hover:border-red-500/20 transition">
                                    <Trash2 size={16} /> Delete
                                </button>
                                {activeCategory === 'characters' ? null : (
                                    <button className="col-span-2 flex items-center justify-center gap-3 px-6 py-5 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-black shadow-[0_15px_30px_rgba(6,182,212,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all">
                                        <FileText size={16} /> Open in Editor
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </aside >

        </div >
    );
}
