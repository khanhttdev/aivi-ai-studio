'use client';

import dynamic from 'next/dynamic';

const MeiAssistant = dynamic(() => import('./MeiAssistant').then(mod => mod.MeiAssistant), {
    ssr: false,
    loading: () => null, // Or a small placeholder if needed
});

export default function MeiAssistantWrapper() {
    return <MeiAssistant />;
}
