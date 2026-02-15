import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit';
import { validateRequest, ttsRequestSchema } from '@/lib/validations/schemas';

const API_URL = "https://api.elevenlabs.io/v1";

export async function POST(req: Request) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    // Rate limiting
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`tts:${clientIp}`, RATE_LIMITS.textToSpeech);
    if (!rateCheck.allowed) {
        return rateLimitResponse(rateCheck);
    }

    if (!apiKey) {
        return NextResponse.json({ error: "Server missing API Key" }, { status: 500 });
    }

    try {
        const body = await req.json();

        const validation = validateRequest(ttsRequestSchema, body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }
        const { text, voiceId } = validation.data;

        const response = await fetch(`${API_URL}/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
            },
            body: JSON.stringify({
                text,
                model_id: "eleven_monolingual_v1",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5,
                }
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("ElevenLabs API Error:", errorText);
            return NextResponse.json({ error: "ElevenLabs API Error", details: errorText }, { status: response.status });
        }

        const audioBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(audioBuffer);
        const base64Audio = buffer.toString('base64');
        const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

        return NextResponse.json({ audio: audioDataUrl });

    } catch (error) {
        console.error("TTS Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET() {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "Server missing API Key" }, { status: 500 });
    }

    try {
        const response = await fetch(`${API_URL}/voices`, {
            headers: {
                'xi-api-key': apiKey,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch voices");
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Fetch Voices Error:", error);
        return NextResponse.json({ error: "Failed to fetch voices" }, { status: 500 });
    }
}
