// import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Quicksand } from "next/font/google";
import "../globals.css";
import Header from "@/components/layout/Header";
import { Toaster } from "@/components/ui/Toaster";
import { LazyMotionProvider } from "@/components/providers/LazyMotionProvider";
import MeiAssistant from "@/components/features/ai-assistant/MeiAssistantWrapper";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import NextTopLoader from 'nextjs-toploader';

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin", "vietnamese"],
});

const jetbrainsMono = JetBrains_Mono({
    variable: "--font-jetbrains",
    subsets: ["latin"],
});

const quicksand = Quicksand({
    variable: "--font-quicksand",
    subsets: ["vietnamese"],
});

export async function generateMetadata({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Metadata' });

    return {
        metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
        title: t('title'),
        description: t('description'),
        keywords: t('keywords').split(',').map(k => k.trim()),
        openGraph: {
            title: t('og_title'),
            description: t('og_description'),
            type: 'website',
            locale: locale,
            siteName: 'AIVI AI Studio',
            images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'AIVI AI Studio' }],
        },
        twitter: {
            card: 'summary_large_image',
            title: t('twitter_title'),
            description: t('twitter_description'),
            images: ['/opengraph-image'],
        },
    };
}

export default async function LocaleLayout({
    children,
    params
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}>) {
    // Ensure that the incoming `locale` is valid
    const { locale } = await params;

    if (!routing.locales.includes(locale as typeof routing.locales[number])) {
        notFound();
    }

    const messages = await getMessages();

    return (
        <html lang={locale}>
            <body
                className={`${inter.variable} ${jetbrainsMono.variable} ${quicksand.variable} antialiased`}
            >
                <NextTopLoader
                    color="#22d3ee"
                    initialPosition={0.08}
                    crawlSpeed={200}
                    height={3}
                    crawl={true}
                    showSpinner={false}
                    easing="ease"
                    speed={200}
                    shadow="0 0 10px #22d3ee,0 0 5px #22d3ee"
                    zIndex={1600}
                    showAtBottom={false}
                />
                <NextIntlClientProvider messages={messages}>
                    <LazyMotionProvider>
                        <div className="h-screen flex flex-col bg-transparent overflow-hidden">
                            {/* Skip navigation link for keyboard accessibility */}
                            <a
                                href="#main-content"
                                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--accent-primary)] focus:text-black focus:rounded-lg focus:font-bold"
                            >
                                Skip to main content
                            </a>
                            <Header />
                            <main id="main-content" role="main" aria-label="Main content" className="flex-1 overflow-y-auto pt-28">
                                {children}
                            </main>
                            <Toaster />
                            <MeiAssistant />
                        </div>
                    </LazyMotionProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
