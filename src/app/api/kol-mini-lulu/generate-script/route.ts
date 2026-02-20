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
        const { prompt, character, tone, apiKey, category, productInfo } = body;

        if (!prompt) {
            return NextResponse.json(
                { error: 'Missing prompt' },
                { status: 400 }
            );
        }

        const genAI = new GoogleGenAI({
            apiKey: apiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
        });

        let productContext = '';
        if (productInfo && productInfo.enabled) {
            const isFashion = productInfo.type === 'fashion';

            productContext = `
            **ADVERTISING/BOOKING MODE ACTIVE:**
            - **Product Name:** ${productInfo.name}
            - **USP (Key Benefit):** ${productInfo.usp}
            - **Type:** ${isFashion ? 'Fashion / Clothing' : 'General Product'}
            
            **CRITICAL INSTRUCTION FOR SCRIPT:**
            - The story MUST revolve around the character having a problem that the PRODUCT solves.
            - Include at least one line of dialogue mentioning the Product Name naturally.
            ${isFashion ?
                    `- Visual Action: Show the character WEARING the product. They should POSE, WALK, or ADMIRE the outfit.
             - Ending: The character feels confident/beautiful.`
                    :
                    `- Visual Action: Show the character holding or using the product.
             - Ending: A happy resolution thanks to the product.`
                }
            `;
        }

        const systemPrompt = `
You are a creative scriptwriter for "Mini & Lulu", a specialized TikTok channel featuring a sassy Cat (Mini) and a clumsy Dog (Lulu).
Style: 3D Pixar Animation. Short, funny, viral content.

CHARACTERS:
- Mini (Cat): Sassy, bossy, loves food/sleep, acts like royalty.
- Lulu (Dog): Energetic, dumb but happy, loves Mini, clumsy.

USER INPUT: "${prompt}"
SELECTED CHARACTERS: ${character || 'both'}
CATEGORY/TOPIC: ${category || 'General'}
SELECTED TONE: ${tone || 'funny'} (Adjust the style/dialogue to match this tone)

${productContext}

TASK:
Create a short script (3-5 scenes) based on the user input and category.
IMPORTANT:
- If Selected Characters is "mini", ONLY use Mini. Lulu often does NOT appear.
- If Selected Characters is "lulu", ONLY use Lulu. Mini often does NOT appear.
- If "both", use both interacting.

Return ONLY valid JSON matching this schema:
[
  {
    "id": "uuid",
    "character": "mini" | "lulu" | "both",
    "action": "Visual description of the action for 3D generation. Be specific about the character's pose and environment. ${productInfo?.enabled ? 'Mention the product if relevant.' : ''}",
    "dialogue": "Short dialogue in Vietnamese (Tiếng Việt). Keep it natural and funny.",
    "visual_prompt": "Detailed prompt for image generation. Style: 3D Pixar Animation. Describe the character's outfit and surroundings based on the category: ${category || 'General'}. ${productInfo?.enabled ? `Ensure the product (${productInfo.name}) is visible in the scene if mentioned.` : ''}",
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
