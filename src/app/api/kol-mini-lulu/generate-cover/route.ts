import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Rate limiting map
const rateLimit = new Map<string, number>();

export async function POST(request: NextRequest) {
    // Basic Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    if (rateLimit.has(ip) && now - rateLimit.get(ip)! < 5000) { // 5s cooldown for images
        return NextResponse.json(
            { error: 'Too many requests. Please wait a moment.' },
            { status: 429 }
        );
    }
    rateLimit.set(ip, now);

    try {
        const body = await request.json();
        const { idea, characterPrompt, apiKey, locale } = body;

        const finalApiKey = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

        if (!finalApiKey) {
            return NextResponse.json(
                { error: 'API key is missing.' },
                { status: 401 }
            );
        }

        const genAI = new GoogleGenAI({ apiKey: finalApiKey });

        const isVietnamese = locale === 'vi';
        const textLanguageInstruction = isVietnamese
            ? "Ensure any text in the image is in **Vietnamese**."
            : "Ensure any text in the image is in **English**.";

        const finalPrompt = `
        Create a 3D Pixar-style movie poster/cover art.
        
        Characters:
        1. **Mini** (Cat): Sassy, cute but grumpy, wears hoodies.
        2. **Lulu** (Dog): Energetic, happy, wears glasses/scarf.
        ${characterPrompt ? `Custom Details: ${characterPrompt}` : ''}
        
        Action/Context from Story Idea:
        "${idea}"
        
        Style: 3D Animation, Pixar/Disney style, **VIBRANT COLORS**, high saturation, lively atmosphere, high quality, 4k render, cute, expressive lighting.
        
        Text Requirement:
        - Include a catchy, short title related to the action.
        - ${textLanguageInstruction}
        - The text should be bold, colorful, and fun.

        Format: Vertical 9:16 aspect ratio composition.
        `;

        const response = await genAI.models.generateContent({
            model: "gemini-3-pro-image-preview",
            contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
            config: {
                responseModalities: ['image']
            }
        });

        const parts = response.candidates?.[0]?.content?.parts;
        if (!parts) throw new Error('No content generated');

        let imageBase64 = '';
        for (const part of parts) {
            if (part.inlineData?.data) {
                imageBase64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                break;
            }
        }

        if (!imageBase64) throw new Error('No image data found in response');

        return NextResponse.json({ imageUrl: imageBase64 });

    } catch (error: any) {
        console.error('Cover Generation Error:', error);
        console.error('Error Stack:', error.stack);
        return NextResponse.json(
            {
                error: error.message || 'Failed to generate cover',
                details: error.toString()
            },
            { status: 500 }
        );
    }
}
