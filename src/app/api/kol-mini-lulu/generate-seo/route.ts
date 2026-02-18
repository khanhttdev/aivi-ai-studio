import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`kol-mini-lulu-seo:${clientIp}`, RATE_LIMITS.kolGeneration);
    if (!rateCheck.allowed) {
        return rateLimitResponse(rateCheck);
    }

    try {
        const body = await request.json();
        const { script, character, apiKey } = body;

        if (!script || !Array.isArray(script)) {
            return NextResponse.json(
                { error: 'Invalid script data' },
                { status: 400 }
            );
        }

        const scriptContent = script.map(s => `[${s.character}]: ${s.dialogue}`).join('\n');

        // Initialize Gemini
        const genAI = new GoogleGenAI({
            apiKey: apiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
        });

        const systemPrompt = `
        TASK:
        Generate viral social media metadata for a funny/cute video script featuring Mini (Cat) and Lulu (Dog).
        Input Script:
        ${scriptContent}

        OUTPUT FORMAT:
        Return ONLY valid JSON with this schema:
        {
            "title": "Short, punchy, viral title (Vietnamese or English depending on script language)",
            "description": "Engaging caption for TikTok/Reels/Shorts including a call to action.",
            "hashtags": ["#tag1", "#tag2", ...],
            "keywords": ["keyword1", "keyword2", ...]
        }
        `;

        const response = await genAI.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
            config: { responseMimeType: 'application/json' }
        });

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("No response from AI");

        const seoData = JSON.parse(text);

        return NextResponse.json(seoData);

    } catch (error) {
        console.error('KOL Mini Lulu SEO API Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
