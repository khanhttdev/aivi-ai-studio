import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`kol-mini-lulu-cover:${clientIp}`, RATE_LIMITS.kolGeneration);
    if (!rateCheck.allowed) {
        return rateLimitResponse(rateCheck);
    }

    try {
        const body = await request.json();
        const { idea, characterPrompt, locale, apiKey, character, category, referenceImage } = body;

        const finalApiKey = apiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

        if (!finalApiKey) {
            return NextResponse.json({ error: 'API key is missing.' }, { status: 401 });
        }

        const genAI = new GoogleGenAI({ apiKey: finalApiKey });

        // Determine character description based on selection
        let charDesc = '';
        if (character === 'mini') {
            charDesc = '- Mini: A cute grey British Shorthair Cat with amber eyes, chubby, grumpy-cute expression. (SOLO STAR)';
        } else if (character === 'lulu') {
            charDesc = '- Lulu: A golden Golden Retriever Dog with a big happy smile, tongue out, fluffy. (SOLO STAR)';
        } else {
            charDesc = `
            - Mini: A cute grey British Shorthair Cat with amber eyes, grumpy-cute.
            - Lulu: A golden Golden Retriever Dog with happy smile, fluffy.
            `;
        }

        // Construct a highly detailed prompt for viral thumbnail
        const basePrompt = `
        Create a VIRAL YouTube/TikTok Thumbnail in 3D Pixar/Disney Animation Style.
        
        Category: ${category || 'General Entertainment'}
        Theme/Story: "${idea || characterPrompt || 'Funny chaotic situation'}"
        
        Characters: 
        ${charDesc}
        ${referenceImage ? 'IMPORTANT: MATCH THE CHARACTER FACE AND BODY EXACTLY WITH THE REFERENCE IMAGE.' : ''}
        
        Thumbnail Requirements:
        - EXTREMELY eye-catching, high contrast colors (Pop art style).
        - Characters with EXAGGERATED shocked/surprised/funny expressions reacting to the story theme.
        - Dynamic composition, characters looking at camera or reacting to an event.
        - Bold, clean background related to the Category: ${category}.
        - Studio lighting with rim light for pop effect.
        - NO TEXT on the image.
        - 3D render quality, Pixar/Disney style, 8K resolution.
        
        Aspect Ratio: 9:16 (Vertical, portrait for TikTok/Reels).
        `;

        // Prepare contents
        const contents: any[] = [{
            role: 'user',
            parts: [
                // Add reference image if provided
                ...(referenceImage ? [{
                    inlineData: {
                        mimeType: 'image/png',
                        data: referenceImage.split(',')[1] || referenceImage
                    }
                }] : []),
                { text: basePrompt }
            ]
        }];

        // Try primary model
        try {
            const response = await genAI.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: contents, // Use updated contents with image support
                config: {
                    responseModalities: ['image'],
                }
            });

            const parts = response.candidates?.[0]?.content?.parts;
            const imagePart = parts?.find((p: any) => p.inlineData);

            if (imagePart?.inlineData) {
                const base64 = imagePart.inlineData.data;
                const mimeType = imagePart.inlineData.mimeType || 'image/png';
                return NextResponse.json({ imageUrl: `data:${mimeType};base64,${base64}` });
            }

            throw new Error('No image from gemini-3-pro-image-preview');

        } catch (primaryError) {
            console.warn('gemini-3-pro-image-preview failed, trying gemini-2.0-flash:', primaryError);

            // Try gemini-2.0-flash-preview-image-generation as fallback
            try {
                const fallbackResponse = await genAI.models.generateContent({
                    model: 'gemini-2.0-flash-preview-image-generation',
                    contents: contents, // Use updated contents with reference image
                    config: {
                        responseModalities: ['image', 'text'],
                    }
                });

                const parts = fallbackResponse.candidates?.[0]?.content?.parts;
                const imagePart = parts?.find((p: any) => p.inlineData);

                if (imagePart?.inlineData) {
                    const base64 = imagePart.inlineData.data;
                    const mimeType = imagePart.inlineData.mimeType || 'image/png';
                    return NextResponse.json({ imageUrl: `data:${mimeType};base64,${base64}` });
                }

                throw new Error('No image from fallback model');

            } catch (fallbackError) {
                console.warn('Fallback model failed, using Pollinations:', fallbackError);

                // Final fallback: Pollinations.ai
                const safePrompt = encodeURIComponent(basePrompt.slice(0, 300));
                const seed = Math.floor(Math.random() * 100000);
                const imageUrl = `https://image.pollinations.ai/prompt/${safePrompt}?width=576&height=1024&model=flux&seed=${seed}&nologo=true`;

                return NextResponse.json({ imageUrl });
            }
        }

    } catch (error) {
        console.error('KOL Mini Lulu Cover API Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
