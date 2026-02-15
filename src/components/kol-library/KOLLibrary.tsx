'use client';

import { useEffect, useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { User, Plus, Loader2, Trash2, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { KOLEntity } from '@/lib/kol/types';
import Link from 'next/link';
import Image from 'next/image';

interface KOLLibraryProps {
    onSelectKOL?: (kol: KOLEntity) => void;
    selectedKOLId?: string | null;
    mode?: 'select' | 'manage'; // select for Image Studio, manage for standalone
}

export default function KOLLibrary({
    onSelectKOL,
    selectedKOLId,
    mode = 'select'
}: KOLLibraryProps) {
    const [kols, setKOLs] = useState<KOLEntity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchKOLs = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setError('Vui lòng đăng nhập để xem KOL Library');
                return;
            }

            const { data, error: fetchError } = await supabase
                .from('kol_profiles')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            setKOLs(data || []);
        } catch (err) {
            console.error('Error fetching KOLs:', err);
            setError('Không thể tải KOL Library');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchKOLs();
    }, []);

    const handleDelete = async (kolId: string) => {
        if (!confirm('Bạn có chắc muốn xóa KOL này?')) return;

        setDeletingId(kolId);

        try {
            const supabase = createClient();
            const { error: deleteError } = await supabase
                .from('kol_profiles')
                .delete()
                .eq('id', kolId);

            if (deleteError) throw deleteError;

            setKOLs(kols.filter(k => k.id !== kolId));
        } catch (err) {
            console.error('Error deleting KOL:', err);
            alert('Không thể xóa KOL');
        } finally {
            setDeletingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 size={32} className="animate-spin text-[var(--accent-primary)]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 gap-4">
                <p className="text-red-400">{error}</p>
                <button
                    onClick={fetchKOLs}
                    className="text-sm px-4 py-2 bg-[var(--bg-tertiary)] rounded-lg hover:bg-[var(--bg-secondary)]"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <User size={20} className="text-[var(--accent-primary)]" />
                    KOL Library ({kols.length})
                </h3>
                <Link href="/kol-studio">
                    <m.button
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Plus size={16} />
                        Tạo KOL mới
                    </m.button>
                </Link>
            </div>

            {/* Empty State */}
            {kols.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 gap-4 bg-[var(--bg-secondary)]/50 rounded-2xl border border-dashed border-[var(--border)]">
                    <User size={48} className="text-[var(--text-muted)]" />
                    <p className="text-[var(--text-muted)]">Chưa có KOL nào</p>
                    <Link href="/kol-studio">
                        <button className="px-6 py-3 bg-[var(--accent-primary)] text-black font-bold rounded-xl">
                            Tạo KOL đầu tiên
                        </button>
                    </Link>
                </div>
            )}

            {/* KOL Grid */}
            {kols.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <AnimatePresence>
                        {kols.map((kol) => {
                            const isSelected = selectedKOLId === kol.id;
                            const isDeleting = deletingId === kol.id;

                            return (
                                <m.div
                                    key={kol.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className={`
                                        relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer
                                        ${isSelected
                                            ? 'border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/30'
                                            : 'border-[var(--border)] hover:border-[var(--text-muted)]'
                                        }
                                        ${isDeleting ? 'opacity-50' : ''}
                                    `}
                                    onClick={() => onSelectKOL?.(kol)}
                                >
                                    {/* Image */}
                                    <div className="aspect-[9/16] bg-[var(--bg-tertiary)]">
                                        {kol.base_image_url ? (
                                            <Image
                                                src={kol.base_image_url}
                                                alt={kol.name}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User size={40} className="text-[var(--text-muted)]" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                                        <p className="font-bold text-white text-sm truncate">{kol.name}</p>
                                        <p className="text-xs text-white/70 truncate">{kol.theme}</p>
                                    </div>

                                    {/* Selected Indicator */}
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 w-6 h-6 bg-[var(--accent-primary)] rounded-full flex items-center justify-center">
                                            <Check size={14} className="text-black" />
                                        </div>
                                    )}

                                    {/* Delete Button (manage mode) */}
                                    {mode === 'manage' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(kol.id);
                                            }}
                                            disabled={isDeleting}
                                            className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-full transition-colors"
                                        >
                                            {isDeleting ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={14} />
                                            )}
                                        </button>
                                    )}
                                </m.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
