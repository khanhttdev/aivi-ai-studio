import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import ClientLayout from './ClientLayout';

export default async function VideoAnalyzerLayout({ children }: { children: React.ReactNode }) {
    // Providing all messages to the client
    // side is the easiest way to get started
    const messages = await getMessages();

    return (
        <NextIntlClientProvider messages={messages}>
            <ClientLayout>{children}</ClientLayout>
        </NextIntlClientProvider>
    );
}
