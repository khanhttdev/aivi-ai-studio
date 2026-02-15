'use client';

import Image from 'next/image';


interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
    subtext?: string;
}

export function Logo({ className = '', size = 'md', showText = true, subtext }: LogoProps) {
    const sizes = {
        sm: { width: 32, height: 32, text: 'text-base' },
        md: { width: 44, height: 44, text: 'text-2xl' },
        lg: { width: 64, height: 64, text: 'text-4xl' }
    };

    const currentSize = sizes[size];

    return (
        <div className={`flex items-center gap-3 group select-none ${className}`}>
            <div className={`relative overflow-hidden rounded-xl bg-black/20 backdrop-blur-sm border border-white/5 shadow-[0_0_15px_rgba(34,211,238,0.15)] group-hover:shadow-[0_0_25px_rgba(167,139,250,0.3)] transition-all duration-500 group-hover:scale-105 group-hover:rotate-1`}>
                <Image
                    src="/logo.png"
                    alt="AIVI Logo"
                    width={currentSize.width}
                    height={currentSize.height}
                    className="object-cover"
                    quality={100}
                />

                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {showText && (
                <div className="flex flex-col justify-center">
                    <span className={`font-black tracking-tighter leading-none uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#22d3ee] via-[#ffffff] to-[#a78bfa] drop-shadow-sm ${currentSize.text}`}>
                        AIVI
                    </span>
                    {subtext && (
                        <span className="text-[10px] text-white/40 font-bold tracking-[0.2em] uppercase mt-0.5 group-hover:text-white/60 transition-colors">
                            {subtext}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
