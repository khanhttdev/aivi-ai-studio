'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { projectService, Project, Asset } from '@/lib/services/projectService';
import { useImageStudioStore } from '@/stores/imageStudioStore';
import { Clock, Image as ImageIcon, Loader2, RefreshCw, MoreVertical, Pencil, Trash2, X, Check } from 'lucide-react';
import Image from 'next/image';

// Component hiển thị thumbnail có xử lý lỗi
function ProjectThumbnail({ src, alt }: { src: string; alt: string }) {
    const [error, setError] = useState(false);

    if (error || !src) {
        return (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] bg-[var(--bg-tertiary)]">
                <ImageIcon size={20} />
            </div>
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            onError={() => setError(true)}
            loading="lazy"
            unoptimized
        />
    );
}

// Component hiển thị từng item lịch sử với chức năng Edit/Delete
function HistoryItem({
    project,
    onSelect,
    onUpdate,
    onDelete
}: {
    project: Project;
    onSelect: (p: Project) => void;
    onUpdate: (id: string, newName: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(project.name);
    const [showMenu, setShowMenu] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const resultAsset = project.assets?.find((a: Asset) => a.type === 'result');

    // Handle click outside to close menu
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSaveRename = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newName.trim() || newName === project.name) {
            setIsEditing(false);
            return;
        }

        setIsUpdating(true);
        try {
            await onUpdate(project.id, newName);
            setIsEditing(false);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Bạn có chắc muốn xóa bản ghi này?')) {
            await onDelete(project.id);
        }
    };

    return (
        <div
            onClick={() => !isEditing && onSelect(project)}
            className="group relative p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] hover:border-[var(--accent-primary)] cursor-pointer transition-all"
        >
            <div className="flex gap-3">
                <div className="w-16 h-16 rounded-lg bg-[var(--bg-primary)] overflow-hidden flex-shrink-0 border border-[var(--border)]">
                    {resultAsset ? (
                        <ProjectThumbnail src={resultAsset.url} alt={project.name} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                            <ImageIcon size={20} />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    {isEditing ? (
                        <form onSubmit={handleSaveRename} className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <input
                                autoFocus
                                type="text"
                                className="flex-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="p-1 hover:text-[var(--success)] text-[var(--text-secondary)]"
                            >
                                <Check size={14} />
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setNewName(project.name);
                                }}
                                className="p-1 hover:text-[var(--error)] text-[var(--text-secondary)]"
                            >
                                <X size={14} />
                            </button>
                        </form>
                    ) : (
                        <>
                            <div className="flex justify-between items-start">
                                <p className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[120px]">
                                    {project.name}
                                </p>
                                <div className="relative" ref={menuRef} onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={() => setShowMenu(!showMenu)}
                                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                    >
                                        <MoreVertical size={14} />
                                    </button>

                                    {showMenu && (
                                        <div className="absolute right-0 top-full mt-1 w-24 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-xl z-20 overflow-hidden">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsEditing(true);
                                                    setShowMenu(false);
                                                }}
                                                className="w-full text-left px-3 py-2 text-xs hover:bg-[var(--bg-tertiary)] flex items-center gap-2 text-[var(--text-primary)]"
                                            >
                                                <Pencil size={12} /> Sửa tên
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    handleDelete(e);
                                                    setShowMenu(false);
                                                }}
                                                className="w-full text-left px-3 py-2 text-xs hover:bg-[var(--error)]/10 text-[var(--error)] flex items-center gap-2"
                                            >
                                                <Trash2 size={12} /> Xóa
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className="text-[10px] text-[var(--text-muted)] mt-1">
                                {new Date(project.created_at).toLocaleDateString()}
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function HistorySidebar() {
    const [history, setHistory] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const store = useImageStudioStore();

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const data = await projectService.getHistory();
            setHistory(data as Project[] || []);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setIsMounted(true);
        fetchHistory();
    }, [fetchHistory]);

    const handleSelectProject = (project: Project) => {
        const resultAsset = project.assets?.find((a: Asset) => a.type === 'result');
        if (resultAsset) {
            store.setFinalResult(resultAsset.url);
        }
    };

    const handleUpdateName = async (id: string, newName: string) => {
        try {
            await projectService.updateProject(id, { name: newName });
            setHistory(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
        } catch (error) {
            console.error('Error updating project:', error);
            alert('Không thể đổi tên. Vui lòng thử lại.');
        }
    };

    const handleDeleteProject = async (id: string) => {
        try {
            await projectService.deleteProject(id);
            setHistory(prev => prev.filter(p => p.id !== id));
            // If current result is from this project, clear it
            // (Optional logic, can implemented if needed)
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Không thể xóa. Vui lòng thử lại.');
        }
    };

    if (!isMounted) return null;

    return (
        <aside className="w-full h-full bg-[var(--bg-secondary)] lg:border-r border-[var(--border)] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                    <Clock size={18} className="text-[var(--accent-primary)]" />
                    Lịch sử tạo
                </h2>
                <button
                    onClick={fetchHistory}
                    className="p-1 hover:bg-[var(--bg-tertiary)] rounded transition-colors text-[var(--text-secondary)]"
                    title="Làm mới"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {loading && history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)]">
                        <Loader2 className="animate-spin mb-2" size={24} />
                        <p className="text-sm">Đang tải...</p>
                    </div>
                ) : history.length > 0 ? (
                    history.map((project) => (
                        <HistoryItem
                            key={project.id}
                            project={project}
                            onSelect={handleSelectProject}
                            onUpdate={handleUpdateName}
                            onDelete={handleDeleteProject}
                        />
                    ))
                ) : (
                    <div className="text-center py-12 px-4">
                        <div className="w-12 h-12 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mx-auto mb-3">
                            <ImageIcon size={24} className="text-[var(--text-muted)]" />
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">Chưa có lịch sử</p>
                    </div>
                )}
            </div>
        </aside>
    );
}
