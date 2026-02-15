import { NextRequest, NextResponse } from 'next/server';
import { generateImageFromPrompt } from '@/lib/gemini/client';
import { KOL_MINI_LULU_CONSTANTS } from '@/lib/constants/kol-mini-lulu';
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`kol-mini-lulu-image:${clientIp}`, RATE_LIMITS.imageGeneration);
    if (!rateCheck.allowed) {
        return rateLimitResponse(rateCheck);
    }

    try {
        const body = await request.json();

        const { prompt, character, apiKey, customPrompt } = body; // Receiving customPrompt from client

        if (!prompt || !character) {
            return NextResponse.json(
                { error: 'Missing required fields: prompt, character' },
                { status: 400 }
            );
        }

        // 1. Get Stylized Character Prompt
        let charPrompt = '';
        if (character === 'mini') {
            charPrompt = KOL_MINI_LULU_CONSTANTS.CHARACTERS.MINI.visual_prompt;
        } else if (character === 'lulu') {
            charPrompt = KOL_MINI_LULU_CONSTANTS.CHARACTERS.LULU.visual_prompt;
        } else if (character === 'both') {
            charPrompt = `${KOL_MINI_LULU_CONSTANTS.CHARACTERS.MINI.visual_prompt} AND ${KOL_MINI_LULU_CONSTANTS.CHARACTERS.LULU.visual_prompt} TOGETHER`;
        }

        // Append Custom Appearance if provided
        if (customPrompt) {
            charPrompt += `\nCUSTOM APPEARANCE MODIFIER: ${customPrompt}`;
        }

        // 2. Construct Final Prompt
        // Structure: [Style] + [Character Visuals] + [Scene Action] + [Lighting/Details]
        const finalPrompt = `
${KOL_MINI_LULU_CONSTANTS.STYLE.BASE_PROMPT}

SUBJECT: ${charPrompt}

ACTION & SCENE: ${prompt}

MANDATORY STYLE LOCK:
- 3D Render, Pixar/Disney Animation Style.
- Cute, fluffy, vibrant colors.
- NO Realistic/Photorealistic style.
- NO 2D/Anime style.
- Aspect Ratio: 9:16 Vertical.
`;

        // 3. Generate Image
        const imageUrl = await generateImageFromPrompt(finalPrompt, undefined, apiKey);

        return NextResponse.json({ result: imageUrl });

    } catch (error) {
        console.error('KOL Mini Lulu Image API Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
