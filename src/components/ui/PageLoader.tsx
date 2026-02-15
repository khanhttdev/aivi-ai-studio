'use client';

import { m } from 'framer-motion';
import { cn } from '@/lib/utils';

export function PageLoader({ className }: { className?: string }) {
    return (
        <div className={cn("fixed inset-0 z-[100] flex items-center justify-center bg-[#050505]/90 backdrop-blur-3xl transition-opacity duration-500", className)}>
            <div className="relative flex flex-col items-center">
                {/* Center Logo/Orb Glow */}
                <m.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-64 h-64 rounded-full bg-gradient-to-tr from-cyan-500/10 via-purple-500/10 to-pink-500/10 blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />

                {/* Container for Spinner */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                    {/* Outer Ring */}
                    <m.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute w-full h-full rounded-full border border-white/5 border-t-cyan-500/30 border-r-cyan-500/10"
                    />

                    {/* Middle Ring (Reverse) */}
                    <m.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                        className="absolute w-16 h-16 rounded-full border border-white/5 border-b-purple-500/40 border-l-purple-500/10"
                    />

                    {/* Inner Pulse Core */}
                    <m.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-2 h-2 rounded-full bg-white/80 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                    />
                </div>

                {/* Loading Text */}
                <div className="mt-8 relative overflow-hidden">
                    <m.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-[10px] font-black tracking-[0.4em] text-white/60 uppercase"
                    >
                        INITIALIZING SYSTEM
                    </m.p>
                    <m.div
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear", repeatDelay: 0.5 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                    />
                </div>
            </div>
        </div>
    );
}
