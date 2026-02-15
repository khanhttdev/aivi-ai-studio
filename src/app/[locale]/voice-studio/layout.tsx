import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Voice Studio | AIVI AI Studio',
    description: 'Professional AI Voice Generation powered by Gemini TTS',
};

export default function VoiceStudioLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
