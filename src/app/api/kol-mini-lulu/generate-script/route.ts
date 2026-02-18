import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`kol-mini-lulu-script:${clientIp}`, RATE_LIMITS.kolGeneration);
    if (!rateCheck.allowed) {
        return rateLimitResponse(rateCheck);
    }

    try {
        const body = await request.json();
        const { prompt, character, tone, apiKey } = body;

        if (!prompt) {
            return NextResponse.json(
                { error: 'Missing prompt' },
                { status: 400 }
            );
        }

        const genAI = new GoogleGenAI({
            apiKey: apiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
        });

        const systemPrompt = `
You are a creative scriptwriter for "Mini & Lulu", a specialized TikTok channel featuring a sassy Cat (Mini) and a clumsy Dog (Lulu).
Style: 3D Pixar Animation. Short, funny, viral content.

CHARACTERS:
- Mini (Cat): Sassy, bossy, loves food/sleep, acts like royalty.
- Lulu (Dog): Energetic, dumb but happy, loves Mini, clumsy.

USER INPUT: "${prompt}"
SELECTED CHARACTERS: ${character || 'both'}
SELECTED TONE: ${tone || 'funny'} (Adjust the style/dialogue to match this tone)

TASK:
Create a short script (3-5 scenes) based on the user input.
Return ONLY valid JSON matching this schema:
[
  {
    "id": "uuid",
    "character": "mini" | "lulu" | "both",
    "action": "Visual description of the action for 3D generation",
    "dialogue": "Short dialogue in Vietnamese (Tiếng Việt)",
    "visual_prompt": "Detailed prompt for image generation. Style: 3D Pixar Animation, Cute, Bright Lighting. Describe the character's pose, expression, and environment in English.",
    "duration": 5
  }
]
`;

        const response = await genAI.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
            config: { responseMimeType: 'application/json' }
        });

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) throw new Error("No response from AI");

        // Parse JSON (Gemini 2.0/3.0 often returns clean JSON with responseMimeType)
        const script = JSON.parse(text);

        return NextResponse.json({ result: script });

    } catch (error) {
        console.error('KOL Mini Lulu Script API Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
