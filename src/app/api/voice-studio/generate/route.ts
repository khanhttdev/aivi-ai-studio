import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { SAMPLE_RATE } from '@/lib/voice-studio/constants';
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit';

// TTS Model
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';



export async function POST(req: Request) {
    // Rate limiting
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`voice-studio:${clientIp}`, RATE_LIMITS.voiceStudio);
    if (!rateCheck.allowed) {
        return rateLimitResponse(rateCheck);
    }

    try {
        const { text, voiceName, apiKey: userApiKey } = await req.json();

        if (!text || !voiceName) {
            return NextResponse.json(
                { error: 'Missing required fields: text, voiceName' },
                { status: 400 }
            );
        }

        const apiKey = userApiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Gemini API Key is not configured' },
                { status: 500 }
            );
        }

        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: TTS_MODEL,
            contents: [
                {
                    parts: [{ text: text }],
                },
            ],
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName: voiceName,
                        },
                    },
                },
            },
        });

        // Extract audio data from response
        const parts = response.candidates?.[0]?.content?.parts;
        if (!parts) {
            return NextResponse.json(
                { error: 'No response from Gemini TTS' },
                { status: 500 }
            );
        }

        for (const part of parts) {
            if (part.inlineData?.data) {
                // Gemini returns raw PCM data, need to add WAV header client-side
                return NextResponse.json({
                    audio: part.inlineData.data,
                    mimeType: part.inlineData.mimeType || 'audio/L16',
                    sampleRate: SAMPLE_RATE,
                });
            }
        }

        return NextResponse.json(
            { error: 'No audio generated' },
            { status: 500 }
        );
    } catch (error) {
        console.error('Voice Studio TTS Error:', error);

        const message = error instanceof Error ? error.message : 'Unknown error';

        // Handle rate limiting
        if (message.includes('429') || message.includes('quota') || message.includes('RESOURCE_EXHAUSTED')) {
            return NextResponse.json(
                { error: 'API quota exceeded. Please try again later.' },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: `TTS generation failed: ${message}` },
            { status: 500 }
        );
    }
}
