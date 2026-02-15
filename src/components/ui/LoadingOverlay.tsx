
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
    message?: string;
    description?: string;
    isFullScreen?: boolean;
    className?: string;
}

export function LoadingOverlay({
    message = "Đang xử lý...",
    description,
    isFullScreen = false,
    className
}: LoadingOverlayProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center z-50 bg-black/60 backdrop-blur-md transition-all duration-500 animate-in fade-in",
            isFullScreen ? "fixed inset-0" : "absolute inset-0 rounded-2xl",
            className
        )}>
            <div className="relative">
                {/* Glowing orb effect */}
                <div className="absolute inset-0 bg-primary-orange/20 blur-xl rounded-full animate-pulse" />

                <div className="relative bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 min-w-[280px]">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 border-4 border-zinc-800 rounded-full" />
                        <div className="absolute inset-0 border-4 border-t-primary-orange border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                        <div className="absolute inset-2 border-4 border-t-transparent border-r-blue-500 border-b-transparent border-l-transparent rounded-full animate-spin-reverse opacity-70" />
                    </div>

                    <div className="text-center space-y-1">
                        <h3 className="font-bold text-lg text-white tracking-tight">{message}</h3>
                        {description && (
                            <p className="text-xs text-zinc-400 max-w-[200px]">{description}</p>
                        )}
                    </div>

                    {/* Scanning line animation */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-orange/50 to-transparent overflow-hidden">
                        <div className="w-full h-full bg-primary-orange/50 animate-shimmer-fast" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoadingOverlay;
