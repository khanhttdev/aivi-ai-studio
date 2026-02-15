'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const t = useTranslations('ErrorPage');

    useEffect(() => {
        console.error('Page error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center" role="alert">
            {/* Glow */}
            <div className="absolute w-[400px] h-[400px] bg-red-500/5 blur-[100px] rounded-full" />

            <div className="relative space-y-8">
                {/* Icon */}
                <div className="w-24 h-24 mx-auto rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-12 h-12 text-red-400" />
                </div>

                {/* Text */}
                <div className="space-y-3">
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        {t('title')}
                    </h1>
                    <p className="text-white/50 text-sm max-w-lg mx-auto leading-relaxed">
                        {error.message || t('default_message')}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-4 justify-center flex-wrap">
                    <button
                        onClick={reset}
                        className="flex items-center gap-2 px-8 py-4 bg-[#22d3ee]/10 hover:bg-[#22d3ee]/20 border border-[#22d3ee]/20 rounded-2xl text-sm font-bold text-[#22d3ee] transition-all focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
                    >
                        <RefreshCw size={18} />
                        {t('try_again')}
                    </button>
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
                    >
                        <Home size={18} />
                        {t('go_home')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
