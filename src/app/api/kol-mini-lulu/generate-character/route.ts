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
            Subject: **Mini** - The British Shorthair Cat.
            **LOCKED IDENTITY (MUST MATCH REFERENCE EXACTLY):**
            - **Face:** Round, chubby cheeks, flat face profile.
            - **Eyes:** Big, round, expressive amber/orange eyes.
            - **Fur:** Solid light grey/silver. Plush texture.
            - **Body:** Chubby, short legs, "cobby" build.
            - **Expression:** Slightly grumpy/judging but very cute.
            
            **DYNAMIC ELEMENTS (CHANGE BASED ON CONTEXT):**
            - **Outfit:** ${prompt ? prompt : `Costume fitting for "${idea}": e.g., Chef hat, Scarf, etc. Keep it cute.`}
            - **Pose:** Acting out the role (e.g., cooking, traveling).
            `;
        } else if (character === 'lulu') {
            characterDesc = `
            Subject: **Lulu** - The Golden Retriever Dog.
            **LOCKED IDENTITY (MUST MATCH REFERENCE EXACTLY):**
            - **Face:** Friendly, goofy, wet nose.
            - **Eyes:** Dark, warm, happy eyes.
            - **Fur:** Golden/Cream color. Long, wavy, fluffy ears/tail.
            - **Body:** Big, sturdy, fluffy.
            - **Expression:** Big happy smile, tongue often lolling out.
            
            **DYNAMIC ELEMENTS (CHANGE BASED ON CONTEXT):**
            - **Outfit:** ${prompt ? prompt : `Costume fitting for "${idea}": e.g., Glasses, Bandana, Backpack. Keep it goofy.`}
            - **Pose:** Energetic, clumsy, acting out the role.
            `;
        }

        const finalPrompt = `
        **TASK:** Create a 3D Pixar/Disney-style character render.
        
        **CRITICAL INSTRUCTION:** 
        1. Look at the REFERENCE IMAGE provided. You MUST keep the character's Face, Body shape, and Fur color EXACTLY THE SAME as the reference.
        2. ONLY change the Outfit/Accessories and Pose to match the Story Context.
        
        **CHARACTER SPECS:**
        ${characterDesc}
        
        **STORY CONTEXT:** "${idea || 'A fun adventure'}"
        
        **STYLE:** 
        - 3D Animation render.
        - Pixar quality: Subsurface scattering on fur, expressive lighting.
        - Vibrant colors, clean background (studio lighting or simple scenic background).
        - Aspect Ratio: 9:16 (Vertical).
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
