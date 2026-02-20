import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { KOL_MINI_LULU_CONSTANTS } from '@/lib/constants/kol-mini-lulu';

// Rate limiting map
const rateLimit = new Map<string, number>();

export async function POST(request: NextRequest) {
    // Basic Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    if (rateLimit.has(ip) && now - rateLimit.get(ip)! < 2000) { // 2s cooldown
        return NextResponse.json(
            { error: 'Too many requests. Please wait a moment.' },
            { status: 429 }
        );
    }
    rateLimit.set(ip, now);

    try {
        const body = await request.json();
        const { apiKey, category, productInfo } = body;

        // Use server-side key if not provided (recommended) or client key
        const finalApiKey = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

        if (!finalApiKey) {
            return NextResponse.json(
                { error: 'API key is missing.' },
                { status: 401 }
            );
        }

        const genAI = new GoogleGenAI({ apiKey: finalApiKey });

        // Determine allowed character based on category
        let allowedCharacter = 'Both Mini and Lulu';
        let constraintText = '';

        const miniCats = ['food', 'home', 'fashion', 'health'];
        const luluCats = ['tech', 'education', 'finance', 'travel'];

        if (category && miniCats.includes(category)) {
            allowedCharacter = 'ONLY Mini (Cat)';
            constraintText = 'IMPORTANT: The story must feature ONLY Mini. Do not mention Lulu.';
        } else if (category && luluCats.includes(category)) {
            allowedCharacter = 'ONLY Lulu (Dog)';
            constraintText = 'IMPORTANT: The story must feature ONLY Lulu. Do not mention Mini.';
        }

        let prompt = '';

        if (productInfo) {
            // COMMERCIAL / BOOKING MODE
            const isFashion = productInfo.type === 'fashion';

            prompt = `
            You are a creative director for a TikTok channel featuring two characters:
            1. **Mini** (Cat): Sassy, bossy, loves luxury.
            2. **Lulu** (Dog): Clumsy, energetic, loyal.

            CONTEXT:
            Category: ${category || 'General'}
            Allowed Character: ${allowedCharacter}
            
            **ADVERTISING CAMPAIGN:**
            - **Product Name:** ${productInfo.name}
            - **USP (Key Benefit):** ${productInfo.usp}
            - **Type:** ${isFashion ? 'Fashion / Clothing' : 'General Product'}

            **TASK:**
            Generate ONE (1) short, funny video concept (under 60s) that NATURALLY integrates the product.
            Structure:
            1. **Hook**: The character faces a relatable problem (e.g., boring outfit, messy room).
            2. **Product Reveal**: The product is introduced as the solution.
            3. **Benefit / Transformation**: 
               ${isFashion
                    ? '- SHOW the character wearing the outfit. They transform from boring to stylish/cool. \n   - Scene MUST involve a "runway walk", "posing", or "admiring themselves in the mirror".'
                    : '- Show the character enjoying the benefit (USP).'}
            
            ${constraintText}
            
            Format: Return ONLY the raw text of the idea concept. Max 3 sentences.
            Example: ${isFashion
                    ? '"Mini feels her outfit is boring. She puts on [Product Name] and instantly transforms into a supermodel, doing a runway walk while Lulu claps."'
                    : '"Mini is stressed about messy fur. She discovers [Product Name] and instantly becomes fluffy and shiny."'}
            Language: Vietnamese.
            Tone: Funny, Enthusiastic, Persuasive but subtle.
            `;
        } else {
            // NORMAL MODE
            prompt = `
            You are a creative director for a TikTok channel featuring two 3D Pixar-style characters:
            1. **Mini** (Cat): Sassy, bossy, acts like a queen, cute but grumpy.
            2. **Lulu** (Dog): Clumsy, energetic, happy-go-lucky, loves Mini unconditionally.
            
            CONTEXT:
            Category: ${category || 'General'}
            Allowed Character: ${allowedCharacter}
            
            Generate ONE (1) short, funny, and viral video concept (under 60s).
            ${constraintText}
            
            Format: Return ONLY the raw text of the idea concept. Max 2-3 sentences.
            Example: "Mini tries to teach Lulu yoga, but Lulu falls asleep on Mini. Mini gets annoyed but eventually uses Lulu as a pillow."
            Language: Vietnamese.
            Tone: Funny, Cute, chaotic.
            `;
        }

        const response = await genAI.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        // The response structure might differ slightly, checking candidates
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!text) throw new Error('No idea generated');

        return NextResponse.json({ idea: text });

    } catch (error: any) {
        console.error('Idea Generation Error:', error);
        console.error('Error Stack:', error.stack);
        return NextResponse.json(
            {
                error: error.message || 'Failed to generate idea',
                details: error.toString()
            },
            { status: 500 }
        );
    }
}
