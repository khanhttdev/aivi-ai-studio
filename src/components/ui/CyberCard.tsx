'use client';

import React from 'react';

interface CyberCardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'neon';
    glowColor?: string;
    onClick?: () => void;
    selected?: boolean;
}

export const CyberCard = ({
    children,
    className = '',
    variant = 'default',
    glowColor = '#06B6D4',
    onClick,
    selected = false
}: CyberCardProps) => {
    const baseStyles = "relative rounded-3xl p-4 transition-all duration-300 overflow-hidden";

    const variants = {
        default: "bg-zinc-900/50 border border-white/5",
        glass: "bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl",
        neon: "bg-zinc-900 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
    };

    const selectedStyles = selected
        ? "border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
        : "hover:border-white/10";

    return (
        <div
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} ${selectedStyles} ${className} ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''}`}
        >
            {/* Dynamic Background Glow Layer */}
            {selected && (
                <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                        background: `radial-gradient(circle at 50% 50%, ${glowColor}20 0%, transparent 70%)`
                    }}
                />
            )}

            {/* Decorative Corner (Premium AI Tech feel) */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};
