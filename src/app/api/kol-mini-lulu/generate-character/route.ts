import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { character, idea, prompt, apiKey } = body; // character: 'mini' | 'lulu'

        const finalApiKey = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

        if (!finalApiKey) {
            return NextResponse.json({ error: 'API key is missing.' }, { status: 401 });
        }

        const genAI = new GoogleGenAI({ apiKey: finalApiKey });

        let characterDesc = '';
        if (character === 'mini') {
            characterDesc = `
            Subject: **Mini** (The SAME specific Cat character). 
            **FIXED TRAITS (DO NOT CHANGE):** 
            - Breed: British Shorthair mixed. 
            - Fur: Light Grey/Silver with subtle tabby markings.
            - Eyes: Big, round, expressive amber/orange eyes.
            - Face: Round, chubby cheeks, slightly grumpy/judging expression (resting bitch face) but cute.
            - Body: Chubby, fluffy.
            
            **VARIABLE TRAITS (CHANGE BASED ON PROMPT):**
            - Outfit/Accessories: ${prompt || 'Signature red bow tie or hoodie'}
            - Pose/Action: Acting out the scene.
            `;
        } else if (character === 'lulu') {
            characterDesc = `
            Subject: **Lulu** (The SAME specific Dog character).
            **FIXED TRAITS (DO NOT CHANGE):**
            - Breed: Golden Retriever.
            - Fur: Golden/Cream, long and wavy, very fluffy.
            - Eyes: Dark, warm, happy eyes.
            - Face: Big happy smile, tongue often out, looks goofy/clumsy.
            - Body: Big, strong but unaware of his size.
            
            **VARIABLE TRAITS (CHANGE BASED ON PROMPT):**
            - Outfit/Accessories: ${prompt || 'Signature blue scarf or glasses'}
            - Pose/Action: Acting out the scene.
            `;
        }

        const finalPrompt = `
        Create a 3D Pixar-style character render.
        
        CRITICAL: KEEP THE CHARACTER FACE AND BODY EXACTLY AS DESCRIBED. THEY ARE FAMOUS IDOLS AND MUST LOOK THE SAME IN EVERY PHOTO. ONLY CHANGE THE CLOTHING/CONTEXT.
        
        ${characterDesc}
        
        Context/Story Vibe: "${idea || 'Studio photoshoot'}"
        
        Style: 3D Animation, Pixar/Disney style, vibrant colors, high quality, 4k render, cute, expressive lighting, solid or simple gradient background (studio lighting).
        Format: Vertical 9:16 aspect ratio. Focus on the character.
        `;

        // Use the same model as generate-cover for consistency
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
                imageBase64 = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                break;
            }
        }

        if (!imageBase64) throw new Error('No image data found in response');

        return NextResponse.json({ imageUrl: imageBase64 });

    } catch (error: any) {
        console.error('Character Gen Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate character' },
            { status: 500 }
        );
    }
}
