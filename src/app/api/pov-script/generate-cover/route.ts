import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`pov-cover:${clientIp}`, RATE_LIMITS.imageGeneration);
    if (!rateCheck.allowed) {
        return rateLimitResponse(rateCheck);
    }

    try {
        const body = await request.json();
        const { hook, povType, productName, monsterImage, productImage, apiKey } = body;

        const hookText = typeof hook === 'string' ? hook : hook?.text || '';
        const hookImagePrompt = typeof hook === 'object' ? hook?.imagePrompt || '' : '';

        // Initialize Gemini
        const genAI = new GoogleGenAI({
            apiKey: apiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
        });

        // Construct thumbnail prompt
        const coverPrompt = `
        Create a VERTICAL (9:16 aspect ratio) eye-catching TikTok video thumbnail/cover image.
        
        Context:
        - This is a POV-style product video where a ${povType || 'monster/bacteria'} encounters "${productName || 'a product'}"
        - Hook scene: ${hookText}
        ${hookImagePrompt ? `- Visual reference: ${hookImagePrompt}` : ''}
        
        Style Requirements:
        - 3D Pixar/Disney animation style, hyper-vibrant colors
        - VERTICAL 9:16 format (portrait mode for TikTok)
        - Dramatic lighting with cinematic composition
        - The character should show extreme emotion (shock, fear, or surprise)
        - Include visual elements that create curiosity and make viewers want to click
        - Make it feel like a movie poster for a TikTok video
        - Bold, eye-catching, designed to stop scrolling
        `;

        // Prepare parts
        const parts: any[] = [];

        // Add character reference
        if (monsterImage && monsterImage.startsWith('data:')) {
            parts.push({
                inlineData: {
                    mimeType: monsterImage.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/png',
                    data: monsterImage.includes('base64,') ? monsterImage.split('base64,')[1] : monsterImage
                }
            });
            parts.push({ text: "Use this character as the main character in the thumbnail." });
        }

        // Add product reference
        if (productImage && productImage.startsWith('data:')) {
            parts.push({
                inlineData: {
                    mimeType: productImage.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/png',
                    data: productImage.includes('base64,') ? productImage.split('base64,')[1] : productImage
                }
            });
            parts.push({ text: "Include this product in the thumbnail." });
        }

        parts.push({ text: coverPrompt });

        // Try primary model
        try {
            const imageResponse = await genAI.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: [{ role: 'user', parts }],
                config: {
                    responseModalities: ['image'],
                }
            });

            const candidates = imageResponse.candidates;
            const responseParts = candidates?.[0]?.content?.parts;
            const imagePart = responseParts?.find((p: any) => p.inlineData);

            if (imagePart && imagePart.inlineData) {
                const base64 = imagePart.inlineData.data;
                const mimeType = imagePart.inlineData.mimeType || 'image/png';
                return NextResponse.json({ imageUrl: `data:${mimeType};base64,${base64}` });
            }
        } catch (primaryError) {
            console.warn('Primary model failed for cover, trying fallback:', primaryError);
        }

        // Fallback: Pollinations
        const encodedPrompt = encodeURIComponent(coverPrompt.substring(0, 500));
        const fallbackUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=720&height=1280&nologo=true`;

        return NextResponse.json({ imageUrl: fallbackUrl });

    } catch (error) {
        console.error('POV Cover API Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
