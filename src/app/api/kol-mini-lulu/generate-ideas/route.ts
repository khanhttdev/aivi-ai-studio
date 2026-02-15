import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { KOL_MINI_LULU_CONSTANTS } from '@/lib/constants/kol-mini-lulu';

// Rate limiting map
const rateLimit = new Map<string, number>();

export async function POST(request: NextRequest) {
    // Basic Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    if (rateLimit.has(ip) && now - rateLimit.get(ip)! < 2000) { // 2s cooldown
        return NextResponse.json(
            { error: 'Too many requests. Please wait a moment.' },
            { status: 429 }
        );
    }
    rateLimit.set(ip, now);

    try {
        const body = await request.json();
        const { apiKey } = body;

        // Use server-side key if not provided (recommended) or client key
        const finalApiKey = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

        if (!finalApiKey) {
            return NextResponse.json(
                { error: 'API key is missing.' },
                { status: 401 }
            );
        }

        const genAI = new GoogleGenAI({ apiKey: finalApiKey });

        const prompt = `
        You are a creative director for a TikTok channel featuring two 3D Pixar-style characters:
        1. **Mini** (Cat): Sassy, bossy, acts like a queen, cute but grumpy.
        2. **Lulu** (Dog): Clumsy, energetic, happy-go-lucky, loves Mini unconditionally.
        
        Generate ONE (1) short, funny, and viral video concept (under 60s) for them.
        
        Format: Return ONLY the raw text of the idea concept. Max 2-3 sentences.
        Example: "Mini tries to teach Lulu yoga, but Lulu falls asleep on Mini. Mini gets annoyed but eventually uses Lulu as a pillow."
        Language: Vietnamese.
        Tone: Funny, Cute, chaotic.
        `;

        const response = await genAI.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        // The response structure might differ slightly, checking candidates
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!text) throw new Error('No idea generated');

        return NextResponse.json({ idea: text });

    } catch (error: any) {
        console.error('Idea Generation Error:', error);
        console.error('Error Stack:', error.stack);
        return NextResponse.json(
            {
                error: error.message || 'Failed to generate idea',
                details: error.toString()
            },
            { status: 500 }
        );
    }
}
