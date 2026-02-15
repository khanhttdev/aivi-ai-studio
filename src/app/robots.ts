import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/login', '/profile'],
            },
        ],
        sitemap: 'https://aivi-studio.vercel.app/sitemap.xml',
    }
}
