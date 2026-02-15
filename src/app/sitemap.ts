import type { MetadataRoute } from 'next'

const BASE_URL = 'https://aivi-studio.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
    const mainRoutes = [
        '',
        '/image-studio',
        '/story-studio',
        '/kol-studio',
        '/script-creator',
        '/voice-studio',
        '/video-analyzer',
        '/library',
    ]

    // Sub-step routes for each studio
    const storyStudioSteps = [
        '/story-studio/step-1-spark',
        '/story-studio/step-2-crossroads',
        '/story-studio/step-3-casting',
        '/story-studio/step-4-studio',
        '/story-studio/step-5-export',
        '/story-studio/step-6-director',
    ]

    const kolStudioSteps = [
        '/kol-studio/step-1-theme',
        '/kol-studio/step-2-profile',
        '/kol-studio/step-3-generate',
        '/kol-studio/step-4-clone',
        '/kol-studio/step-5-content',
        '/kol-studio/step-6-export',
    ]

    const imageStudioSteps = [
        '/image-studio/step-1-input',
        '/image-studio/step-2-generation',
        '/image-studio/step-3-result',
    ]

    const allRoutes = [
        ...mainRoutes,
        ...storyStudioSteps,
        ...kolStudioSteps,
        ...imageStudioSteps,
    ]

    const locales = ['vi', 'en']
    const entries: MetadataRoute.Sitemap = []

    for (const locale of locales) {
        for (const route of allRoutes) {
            const isMainRoute = mainRoutes.includes(route)
            entries.push({
                url: `${BASE_URL}/${locale}${route}`,
                lastModified: new Date(),
                changeFrequency: isMainRoute ? 'weekly' : 'monthly',
                priority: route === '' ? 1 : isMainRoute ? 0.8 : 0.6,
            })
        }
    }

    return entries
}
