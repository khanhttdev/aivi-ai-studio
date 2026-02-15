'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ImageStudioEntry() {
    const router = useRouter();

    useEffect(() => {
        router.push('/image-studio/step-1-input');
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center bg-transparent">
            {/* Simple redirection loader */}
            <Loader2 className="animate-spin text-[var(--accent-primary)] w-10 h-10" />
        </div>
    );
}
