'use client';

import Script from 'next/script';

interface JsonLdProps {
    data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
    return (
        <Script
            id="json-ld-script"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
