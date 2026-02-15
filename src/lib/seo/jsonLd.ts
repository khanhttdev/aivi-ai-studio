/**
 * JSON-LD Structured Data helpers for SEO rich snippets
 */

export function getWebApplicationJsonLd(locale: string) {
    const isVi = locale === 'vi';

    return {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'AIVI Studio',
        description: isVi
            ? 'Nền tảng tạo nội dung AI toàn diện cho Video, Hình ảnh, Kịch bản và Giọng nói'
            : 'Comprehensive AI content creation platform for Video, Image, Script and Voice',
        url: 'https://aivi-studio.vercel.app',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Web',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        featureList: [
            'AI Image Generation',
            'AI Story Studio',
            'KOL Studio',
            'Voice Studio',
            'Video Analyzer',
            'Script Creator',
        ],
        inLanguage: [locale],
    };
}

export function getBreadcrumbJsonLd(
    items: Array<{ name: string; url: string }>
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

export function getOrganizationJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'AIVI Studio',
        url: 'https://aivi-studio.vercel.app',
        logo: 'https://aivi-studio.vercel.app/icon.png',
        sameAs: [],
    };
}

/**
 * Renders JSON-LD as a script tag string for embedding in HTML
 */
export function renderJsonLd(data: Record<string, unknown>): string {
    return JSON.stringify(data);
}
