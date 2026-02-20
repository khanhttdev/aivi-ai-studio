import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`pov-script:${clientIp}`, RATE_LIMITS.kolGeneration);
    if (!rateCheck.allowed) {
        return rateLimitResponse(rateCheck);
    }

    try {
        const body = await request.json();
        const {
            productName,
            monsterDescription,
            sceneCount = 5,
            povType = 'monster',
            locale = 'vi',
            apiKey,
            productImage,
            monsterImage,
        } = body;

        if (!productName || !monsterDescription) {
            return NextResponse.json(
                { error: 'Missing required fields: productName, monsterDescription' },
                { status: 400 }
            );
        }

        const genAI = new GoogleGenAI({
            apiKey: apiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
        });

        // Build POV type description
        const povTypeDescriptions: Record<string, string> = {
            monster: 'a scary monster/creature',
            bacteria: 'a microscopic bacteria/germ',
            object: 'an inanimate object (e.g., dirt, stain, odor)',
            pet: 'a mischievous pet',
            villain: 'a cartoon villain',
            custom: 'a custom character',
        };
        const povDesc = povTypeDescriptions[povType] || 'a monster';

        const isVietnamese = locale === 'vi';

        const systemPrompt = `You are a creative TikTok scriptwriter specializing in viral "POV Villain" content for TikTok Shop.

CONCEPT: Create a script from the POV (Point of View) of ${povDesc} who is the "villain" being defeated by the product.

PRODUCT: "${productName}"
VILLAIN/MONSTER: "${monsterDescription}"
NUMBER OF SCENES: ${sceneCount}
LANGUAGE: ${isVietnamese ? 'Vietnamese (Tiếng Việt) - use natural, funny, dramatic Vietnamese dialogue' : 'English'}

SCRIPT STYLE:
- The monster/villain speaks directly to camera (POV style)
- Start with the monster being confident/threatening
- Middle scenes: monster realizes the product is coming, starts panicking
- End scenes: monster is desperate, begging, defeated
- Dialogue should be funny, dramatic, and relatable
- Each scene should have clear visual action

Return ONLY valid JSON matching this exact schema:
{
  "title": "Short catchy title for this POV script",
  "hook": "Opening hook text (1-2 sentences to grab attention)",
  "cta": "Call-to-action text at the end",
  "scenes": [
    {
      "sceneNumber": 1,
      "monsterDialogue": "What the monster/villain says (${isVietnamese ? 'in Vietnamese' : 'in English'})",
      "visualDescription": "What the camera shows / visual action (${isVietnamese ? 'in Vietnamese' : 'in English'})",
      "productHighlight": "How the product is featured in this scene",
      "emotion": "Monster's emotion: confident/scared/angry/desperate/defeated"
    }
  ]
}`;

        // Build content parts - include images if provided
        const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
            { text: systemPrompt }
        ];

        if (productImage) {
            // Extract base64 from data URL
            const base64Match = productImage.match(/^data:([^;]+);base64,(.+)$/);
            if (base64Match) {
                parts.push({
                    inlineData: {
                        mimeType: base64Match[1],
                        data: base64Match[2],
                    }
                });
                parts.push({ text: "This is the product image. Use it to understand the product better." });
            }
        }

        if (monsterImage) {
            const base64Match = monsterImage.match(/^data:([^;]+);base64,(.+)$/);
            if (base64Match) {
                parts.push({
                    inlineData: {
                        mimeType: base64Match[1],
                        data: base64Match[2],
                    }
                });
                parts.push({ text: "This is the monster/villain character image. Use it to describe the visual scenes." });
            }
        }

        const response = await genAI.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts }],
            config: { responseMimeType: 'application/json' }
        });

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("No response from AI");

        const script = JSON.parse(text);

        return NextResponse.json({ result: script });

    } catch (error) {
        console.error('POV Script API Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
