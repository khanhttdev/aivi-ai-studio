'use client';

import { useState, useEffect, useRef } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const AiviAudioPlayer = ({ src, className }: { src: string; className?: string }) => {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        let currentUrl = "";
        let isMounted = true;

        setError(null);
        setBlobUrl(null);

        if (!src) {
            setError("No audio source");
            return;
        }

        const handleAudioSource = async () => {
            if (src.startsWith('data:')) {
                try {
                    // Check if base64 seems valid
                    if (!src.includes('base64,')) {
                        console.warn("Base64 string missing 'base64,' prefix");
                    }

                    const res = await fetch(src);
                    const blob = await res.blob();

                    if (blob.size === 0) throw new Error("Empty audio Blob");

                    if (isMounted) {
                        currentUrl = URL.createObjectURL(blob);
                        setBlobUrl(currentUrl);
                    }
                } catch (e) {
                    console.error("Failed to create blob for audio, attempting fallback", e);
                    if (isMounted) setBlobUrl(src);
                }
            } else {
                if (isMounted) setBlobUrl(src);
            }
        };

        handleAudioSource();

        return () => {
            isMounted = false;
            if (currentUrl) URL.revokeObjectURL(currentUrl);
        };
    }, [src]);

    if (error) {
        return (
            <div className={cn("w-full h-10 flex items-center justify-center bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs gap-2", className)}>
                <AlertCircle className="w-4 h-4" />
                <span>Error loading audio</span>
            </div>
        );
    }

    if (!blobUrl) {
        return (
            <div className={cn("w-full h-10 flex items-center justify-center bg-[var(--bg-tertiary)] rounded-lg animate-pulse", className)}>
                <Loader2 className="w-4 h-4 animate-spin opacity-30" />
            </div>
        );
    }

    return (
        <audio
            ref={audioRef}
            controls
            preload="auto"
            src={blobUrl}
            className={cn("w-full h-10 block", className)}
            onError={(e) => {
                const target = e.target as HTMLAudioElement;
                console.error("Audio playback error:", target.error);
                setError("Playback failed");
            }}
        />
    );
};
