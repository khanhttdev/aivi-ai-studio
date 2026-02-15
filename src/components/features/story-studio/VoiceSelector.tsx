'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown, Loader2, Play, Square, Mic, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Voice {
    id: string;
    name: string;
    category?: string;
    preview_url?: string;
    labels?: Record<string, string>;
}

const DEFAULT_VOICES: Voice[] = [
    { id: 'Aoede', name: 'Aoede (Nữ - Tự tin)', category: 'Standard' },
    { id: 'Kore', name: 'Kore (Nữ - Nhẹ nhàng)', category: 'Standard' },
    { id: 'Charon', name: 'Charon (Nam - Trầm)', category: 'Standard' },
    { id: 'Fenrir', name: 'Fenrir (Nam - Mạnh mẽ)', category: 'Standard' },
    { id: 'Puck', name: 'Puck (Nam - Vui vẻ)', category: 'Standard' },
];

interface VoiceSelectorProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
}

export function VoiceSelector({ value, onChange, label }: VoiceSelectorProps) {
    const [open, setOpen] = useState(false);
    const [voices, setVoices] = useState<Voice[]>(DEFAULT_VOICES);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchVoices = async () => {
            setIsLoading(true);
            try {
                const res = await fetch('/api/text-to-speech');
                if (res.ok) {
                    const data = await res.json();
                    if (data.voices && Array.isArray(data.voices)) {
                        const elevenLabsVoices = data.voices.map((v: { voice_id: string; name: string; preview_url?: string; labels?: Record<string, string> }) => ({
                            id: v.voice_id,
                            name: v.name,
                            category: 'Pro (ElevenLabs)',
                            preview_url: v.preview_url,
                            labels: v.labels
                        }));
                        setVoices([...DEFAULT_VOICES, ...elevenLabsVoices]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch voices", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVoices();
    }, []);

    // Handle play preview
    const handlePlayPreview = async (e: React.MouseEvent, voice: Voice) => {
        e.stopPropagation();

        if (playingVoiceId === voice.id) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            setPlayingVoiceId(null);
            return;
        }

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        if (voice.preview_url) {
            const audio = new Audio(voice.preview_url);
            audioRef.current = audio;
            audio.onended = () => setPlayingVoiceId(null);

            try {
                setPlayingVoiceId(voice.id);
                await audio.play();
            } catch (error: unknown) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    // Ignore AbortError
                } else {
                    console.error("Preview playback failed", error);
                    toast.error("Failed to play preview");
                }
                setPlayingVoiceId(null);
            }
        } else {
            toast.info(`Preview not available for ${voice.name}`);
        }
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedVoice = voices.find((v) => v.id === value);

    // Group voices & Filter
    const filteredVoices = voices.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.category && v.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const groupedVoices = filteredVoices.reduce((acc, voice) => {
        const cat = voice.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(voice);
        return acc;
    }, {} as Record<string, Voice[]>);

    return (
        <div className="space-y-1 relative" ref={containerRef}>
            {label && <label className="text-xs text-[var(--text-muted)] uppercase font-medium ml-1">{label}</label>}

            <button
                onClick={() => setOpen(!open)}
                className="w-full justify-between flex items-center bg-[var(--bg-tertiary)] border border-[var(--border)] px-3 py-2 rounded-lg text-sm hover:border-[var(--accent-primary)] transition-colors"
            >
                {isLoading ? (
                    <span className="flex items-center gap-2 text-[var(--text-muted)]">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading voices...
                    </span>
                ) : (
                    <span className="flex items-center gap-2 truncate">
                        <Mic className="w-4 h-4 text-[var(--accent-primary)]" />
                        <span className={!selectedVoice ? "text-[var(--text-muted)]" : ""}>
                            {selectedVoice ? selectedVoice.name : "Select voice..."}
                        </span>
                    </span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </button>

            {open && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full z-50 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-[var(--border)] sticky top-0 bg-[var(--bg-secondary)] z-10">
                        <div className="flex items-center gap-2 px-2 bg-[var(--bg-tertiary)] rounded border border-[var(--border)]">
                            <Search className="w-4 h-4 text-[var(--text-muted)]" />
                            <input
                                className="w-full bg-transparent border-none py-1.5 text-xs focus:outline-none"
                                placeholder="Search voices..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="max-h-[250px] overflow-y-auto custom-scrollbar p-1">
                        {Object.entries(groupedVoices).length === 0 ? (
                            <div className="p-4 text-center text-xs text-[var(--text-muted)]">No voices found</div>
                        ) : (
                            Object.entries(groupedVoices).map(([category, categoryVoices]) => (
                                <div key={category} className="mb-2 last:mb-0">
                                    <div className="px-2 py-1 text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider sticky top-0 bg-[var(--bg-secondary)]">
                                        {category}
                                    </div>
                                    <div className="space-y-0.5">
                                        {categoryVoices.map((voice) => (
                                            <div
                                                key={voice.id}
                                                onClick={() => {
                                                    onChange(voice.id === value ? "" : voice.id);
                                                    setOpen(false);
                                                }}
                                                className={cn(
                                                    "px-2 py-1.5 rounded flex items-center justify-between cursor-pointer group transition-colors",
                                                    value === voice.id ? "bg-[var(--accent-primary)]/10 text-[var(--text-primary)]" : "hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                                                )}
                                            >
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <Check
                                                        className={cn(
                                                            "h-3 w-3 shrink-0",
                                                            value === voice.id ? "opacity-100 text-[var(--accent-primary)]" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex flex-col truncate">
                                                        <span className="text-xs font-medium truncate">{voice.name}</span>
                                                        {voice.labels && (
                                                            <span className="text-[9px] opacity-60 truncate">
                                                                {Object.values(voice.labels).slice(0, 2).join(', ')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {voice.preview_url && (
                                                    <button
                                                        onClick={(e) => handlePlayPreview(e, voice)}
                                                        className="p-1.5 rounded-full hover:bg-[var(--accent-primary)] hover:text-black opacity-60 hover:opacity-100 transition-all ml-1 shrink-0"
                                                        title="Preview Voice"
                                                    >
                                                        {playingVoiceId === voice.id ? (
                                                            <Square className="w-3 h-3 fill-current" />
                                                        ) : (
                                                            <Play className="w-3 h-3 fill-current" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
