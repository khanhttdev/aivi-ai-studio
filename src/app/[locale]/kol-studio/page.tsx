'use client';

import { useKOLStudioStore } from '@/stores/kolStudioStore';
import { useRouter } from 'next/navigation';
// import { useTranslations } from 'next-intl';
import { Plus, Edit, Trash2, User, Calendar, Search, Loader2 } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { KOL_THEMES, KOLEntity } from '@/lib/kol/types';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { JsonLd } from '@/components/seo/JsonLd';

export default function KOLDashboard() {
    const router = useRouter();
    // const t = useTranslations('KOLStudio');
    const supabase = createClient();

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "KOL AI Studio",
        "applicationCategory": "MultimediaApplication",
        "description": "Quản lý và tạo dựng đội ngũ Influencer AI độc quyền.",
        "operatingSystem": "All",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        }
    };

    const {
        savedKOLs,
        setSavedKOLs,
        reset,
        setCurrentKOL,
        setKOLProfile,
        setKOLName,
        setSelectedTheme,
        setBaseKOLImage,
        deleteSavedKOL,
        setChannelPositioning,
        isLoadingLibrary,
        setIsLoadingLibrary
    } = useKOLStudioStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [kolToDelete, setKolToDelete] = useState<string | null>(null);
    const [isDeletingLoading, setIsDeletingLoading] = useState(false);

    useEffect(() => {
        const fetchKOLs = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            setIsLoadingLibrary(true);

            // Fetch KOL profiles with their first image from kol_images
            const { data: profiles, error } = await supabase
                .from('kol_profiles')
                .select('*, kol_images(image_url)')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (!error && profiles) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mappedKOLs = (profiles as unknown[]).map((p: any) => ({
                    id: p.id,
                    user_id: p.user_id,
                    name: p.name || 'Untitled KOL',
                    theme: p.theme || 'custom',
                    channel_positioning: p.channel_positioning || '',
                    profile_data: p.profile_data || {},
                    base_image_url: p.kol_images?.[0]?.image_url || p.base_image_url || null,
                    created_at: p.created_at,
                    updated_at: p.updated_at || p.created_at
                }));
                setSavedKOLs(mappedKOLs as KOLEntity[]);
            }
            setIsLoadingLibrary(false);
        };
        fetchKOLs();
    }, [setIsLoadingLibrary, setSavedKOLs, supabase]);

    const handleCreateNew = useCallback(() => {
        reset();
        router.push('/kol-studio/step-1-theme');
    }, [reset, router]);

    const handleEditKOL = useCallback((kol: KOLEntity) => {
        reset(); // Reset first to clear potentially conflicting state
        setCurrentKOL(kol);
        setKOLName(kol.name);
        setKOLProfile(kol.profile_data);
        setBaseKOLImage(kol.base_image_url);
        setChannelPositioning(kol.channel_positioning);

        // Find theme object
        const themeObj = KOL_THEMES.find(t => t.id === kol.theme) || null;
        if (themeObj) {
            setSelectedTheme(themeObj);
        }

        // Navigate to appropriate step
        if (kol.base_image_url) {
            router.push('/kol-studio/step-6-export');
        } else {
            router.push('/kol-studio/step-3-generate');
        }
    }, [reset, setCurrentKOL, setKOLName, setKOLProfile, setBaseKOLImage, setChannelPositioning, setSelectedTheme, router]);

    const handleDeleteKOL = useCallback((e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        e.preventDefault();
        setKolToDelete(id);
    }, []);

    const confirmDelete = async () => {
        if (!kolToDelete) return;

        setIsDeletingLoading(true);
        try {
            // First delete related kol_images
            await supabase
                .from('kol_images')
                .delete()
                .eq('kol_id', kolToDelete);

            // Then delete the kol_profile
            const { error } = await supabase
                .from('kol_profiles')
                .delete()
                .eq('id', kolToDelete);

            if (!error) {
                deleteSavedKOL(kolToDelete);
                setKolToDelete(null);
            } else {
                console.error('Failed to delete KOL:', error);
                alert('Không thể xóa KOL. Vui lòng thử lại.');
            }
        } catch (err) {
            console.error('Error deleting KOL:', err);
            alert('Có lỗi xảy ra khi xóa KOL.');
        } finally {
            setIsDeletingLoading(false);
        }
    };

    const filteredKOLs = useMemo(() => savedKOLs.filter(kol =>
        kol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kol.theme.toLowerCase().includes(searchTerm.toLowerCase())
    ), [savedKOLs, searchTerm]);

    return (
        <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-screen overflow-x-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black gradient-text">KOL Studio Dashboard</h1>
                    <p className="text-[var(--text-secondary)] mt-1">Quản lý đội ngũ Influencer AI độc quyền của bạn</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm KOL..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-[var(--accent-primary)] outline-none transition-all"
                        />
                    </div>
                    <m.button
                        onClick={handleCreateNew}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-primary shadow-lg shadow-cyan-500/20 px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold whitespace-nowrap"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">Tạo KOL Mới</span>
                        <span className="sm:hidden">Mới</span>
                    </m.button>
                </div>
            </div>

            {isLoadingLibrary ? (
                <div className="flex-1 flex items-center justify-center min-h-[400px]">
                    <div className="flex flex-col items-center gap-4 text-[var(--text-muted)]">
                        <Loader2 size={40} className="animate-spin text-[var(--accent-primary)]" />
                        <p>Đang tải dữ liệu...</p>
                    </div>
                </div>
            ) : savedKOLs.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] rounded-3xl p-10 bg-[var(--bg-secondary)]/30 min-h-[400px]">
                    <div className="w-20 h-20 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mb-6">
                        <User size={40} className="text-[var(--text-muted)]" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Chưa có KOL nào</h3>
                    <p className="text-[var(--text-muted)] text-center max-w-md mb-8">
                        Bắt đầu xây dựng hình ảnh thương hiệu của bạn với Influencer AI đầu tiên.
                    </p>
                    <button onClick={handleCreateNew} className="btn-primary px-8 py-3 rounded-xl font-bold">
                        Bắt đầu ngay
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {filteredKOLs.map((kol) => (
                            <m.div
                                key={kol.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={() => handleEditKOL(kol)}
                                className="group relative bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-[var(--accent-primary)]/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1"
                            >
                                {/* Image Area */}
                                <div className="aspect-[3/4] bg-[var(--bg-tertiary)] relative overflow-hidden">
                                    {kol.base_image_url ? (
                                        <Image src={kol.base_image_url} alt={kol.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-muted)]">
                                            <User size={48} strokeWidth={1} />
                                            <span className="text-xs mt-2 font-medium uppercase tracking-wider">No Image</span>
                                        </div>
                                    )}

                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                    {/* Theme Badge */}
                                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                                        <span>{KOL_THEMES.find(t => t.id === kol.theme)?.icon || '✨'}</span>
                                        <span>{KOL_THEMES.find(t => t.id === kol.theme)?.nameVi || kol.theme}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 right-0 p-5 pt-0">
                                    <h3 className="text-xl font-bold text-white mb-0.5 truncate">{kol.name}</h3>
                                    <p className="text-xs text-white/60 line-clamp-1 mb-3">{kol.channel_positioning}</p>

                                    <div className="flex items-center gap-2 text-[10px] text-white/40 font-medium uppercase tracking-wider">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={10} />
                                            {new Date(kol.updated_at).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>

                                    {/* Action Buttons (Show on hover) */}
                                    <div className="absolute right-4 bottom-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300 z-10">
                                        <button
                                            onClick={(e) => handleDeleteKOL(e, kol.id)}
                                            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white transition-all backdrop-blur-md"
                                            title="Xóa KOL"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleEditKOL(kol); }}
                                            className="p-2 rounded-lg bg-[var(--accent-primary)] text-black transition-all hover:scale-110 shadow-lg shadow-cyan-500/20"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit size={16} />
                                        </button>
                                    </div>
                                </div>
                            </m.div>
                        ))}
                    </AnimatePresence>

                    {/* Create New Card (Always visible at end) */}
                    <m.div
                        onClick={handleCreateNew}
                        layout
                        className="group flex flex-col items-center justify-center aspect-[3/4] border-2 border-dashed border-[var(--border)] rounded-2xl cursor-pointer hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/5 transition-all text-[var(--text-muted)] hover:text-[var(--accent-primary)]"
                    >
                        <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] group-hover:bg-[var(--accent-primary)]/10 flex items-center justify-center mb-4 transition-colors">
                            <Plus size={32} />
                        </div>
                        <span className="font-bold">Tạo mới</span>
                    </m.div>
                </div>
            )}
            {/* Actions & Modals */}
            <AnimatePresence>
                {kolToDelete && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isDeletingLoading && setKolToDelete(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <m.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/50 via-red-500 to-red-500/50" />

                            <div className="flex flex-col items-center text-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                                    <Trash2 size={32} />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold">Xác nhận xóa KOL?</h3>
                                    <p className="text-[var(--text-muted)]">
                                        Hành động này không thể hoàn tác. Tất cả dữ liệu và hình ảnh liên quan sẽ bị xóa vĩnh viễn khỏi thư viện của bạn.
                                    </p>
                                </div>

                                <div className="flex w-full gap-3">
                                    <button
                                        disabled={isDeletingLoading}
                                        onClick={() => setKolToDelete(null)}
                                        className="flex-1 py-3.5 rounded-xl font-bold bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] border border-[var(--border)] transition-colors disabled:opacity-50"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        disabled={isDeletingLoading}
                                        onClick={confirmDelete}
                                        className="flex-1 py-3.5 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isDeletingLoading ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Đang xóa...
                                            </>
                                        ) : (
                                            'Xác nhận xóa'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </m.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}
