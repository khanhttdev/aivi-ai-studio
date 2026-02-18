import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

// Load mascot reference images as base64 at startup
function getMascotBase64(character: 'mini' | 'lulu'): string | null {
    try {
        const fileName = character === 'mini' ? 'mini-mascot.png' : 'lulu-mascot.png';
        const imagePath = path.join(process.cwd(), 'public', 'images', 'kol-mini-lulu', fileName);
        if (fs.existsSync(imagePath)) {
            const buffer = fs.readFileSync(imagePath);
            return buffer.toString('base64');
        }
    } catch (e) {
        console.warn('Could not load mascot reference image:', e);
    }
    return null;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { character, idea, prompt, useReferenceImage, apiKey } = body;

        const finalApiKey = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

        if (!finalApiKey) {
            return NextResponse.json({ error: 'API key is missing.' }, { status: 401 });
        }

        const genAI = new GoogleGenAI({ apiKey: finalApiKey });

        // Build character description with strict identity lock
        let characterDesc = '';
        if (character === 'mini') {
            characterDesc = `
            Subject: **Mini** - a specific, iconic Cat character. KEEP IDENTITY EXACTLY.
            **LOCKED PHYSICAL TRAITS (NEVER CHANGE):**
            - Breed: British Shorthair. Fur: Light Grey/Silver.
            - Eyes: Big, round, expressive amber/orange eyes.
            - Face: Round, chubby cheeks, slightly grumpy/judging expression but cute.
            - Body: Chubby, fluffy, compact.
            
            **CHANGE ONLY:**
            - Outfit/Accessories: ${prompt ? prompt : `Creative outfit fitting the story: "${idea || 'fun adventure'}". Keep it cute and stylish.`}
            - Pose: Dynamic, expressive pose fitting the story mood.
            `;
        } else if (character === 'lulu') {
            characterDesc = `
            Subject: **Lulu** - a specific, iconic Dog character. KEEP IDENTITY EXACTLY.
            **LOCKED PHYSICAL TRAITS (NEVER CHANGE):**
            - Breed: Golden Retriever. Fur: Golden/Cream, long and wavy, fluffy.
            - Eyes: Dark, warm, happy eyes. Big happy smile, tongue often out.
            - Face: Goofy, clumsy, lovable expression.
            - Body: Big, strong but unaware of his size.
            
            **CHANGE ONLY:**
            - Outfit/Accessories: ${prompt ? prompt : `Creative outfit fitting the story: "${idea || 'fun adventure'}". Keep it fun and goofy.`}
            - Pose: Dynamic, expressive pose fitting the story mood.
            `;
        }

        const finalPrompt = `
        Create a 3D Pixar/Disney-style character illustration.
        
        ⚠️ CRITICAL RULE: The character's face, body shape, and core appearance MUST match the reference image exactly. ONLY change the clothing and accessories.
        
        ${characterDesc}
        
        Story Context: "${idea || 'A fun adventure'}"
        
        Style: 3D Animation render, Pixar quality, vibrant colors, expressive lighting, clean background with subtle gradient.
        Format: Vertical 9:16 aspect ratio. Character centered, full body or 3/4 view.
        Quality: 4K, highly detailed, professional animation studio quality.
        `;

        // Try to load reference image
        const referenceBase64 = useReferenceImage ? getMascotBase64(character) : null;

        // Build contents with optional reference image
        const contents: any[] = [{
            role: 'user',
            parts: [
                // Include reference image if available
                ...(referenceBase64 ? [{
                    inlineData: {
                        mimeType: 'image/png',
                        data: referenceBase64,
                    }
                }] : []),
                {
                    text: referenceBase64
                        ? `This is the reference character image. Generate a NEW image of this SAME character with a different outfit as described below:\n\n${finalPrompt}`
                        : finalPrompt
                }
            ]
        }];

        try {
            const response = await genAI.models.generateContent({
                model: "gemini-3-pro-image-preview",
                contents,
                config: {
                    responseModalities: ['image'],
                }
            });

            const parts = response.candidates?.[0]?.content?.parts;
            if (!parts) throw new Error('No content generated');

            let imageBase64 = '';
            for (const part of parts) {
                if (part.inlineData?.data) {
                    imageBase64 = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                    break;
                }
            }

            if (!imageBase64) throw new Error('No image data found in response');

            return NextResponse.json({ imageUrl: imageBase64 });

        } catch (genError: any) {
            console.warn('Primary model failed, trying fallback:', genError?.message);

            // Fallback: Try gemini-3-pro-image-preview
            try {
                const fallbackResponse = await genAI.models.generateContent({
                    model: "gemini-2.0-flash-preview-image-generation",
                    contents,
                    config: {
                        responseModalities: ['image', 'text'],
                    }
                });

                const parts = fallbackResponse.candidates?.[0]?.content?.parts;
                let imageBase64 = '';
                for (const part of (parts || [])) {
                    if ((part as any).inlineData?.data) {
                        imageBase64 = `data:${(part as any).inlineData.mimeType || 'image/png'};base64,${(part as any).inlineData.data}`;
                        break;
                    }
                }

                if (imageBase64) return NextResponse.json({ imageUrl: imageBase64 });
            } catch (fallbackError) {
                console.warn('Fallback model also failed:', fallbackError);
            }

            // Final fallback: Pollinations with detailed prompt
            const safePrompt = encodeURIComponent(
                `3D Pixar style ${character === 'mini' ? 'grey British Shorthair cat with amber eyes' : 'golden retriever dog with happy smile'}, wearing outfit for story: ${idea || 'adventure'}, cute, vibrant, 9:16`
            );
            const seed = Math.floor(Math.random() * 100000);
            const imageUrl = `https://image.pollinations.ai/prompt/${safePrompt}?width=576&height=1024&model=flux&seed=${seed}&nologo=true`;

            return NextResponse.json({ imageUrl });
        }

    } catch (error: any) {
        console.error('Character Gen Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate character' },
            { status: 500 }
        );
    }
}
