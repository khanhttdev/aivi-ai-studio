import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`pov-seo:${clientIp}`, RATE_LIMITS.kolGeneration);
    if (!rateCheck.allowed) {
        return rateLimitResponse(rateCheck);
    }

    try {
        const body = await request.json();
        const { hook, scenes, cta, povType, productName, apiKey } = body;

        if (!hook || !scenes) {
            return NextResponse.json(
                { error: 'Missing script data' },
                { status: 400 }
            );
        }

        // Build script summary for SEO generation
        const hookText = typeof hook === 'string' ? hook : hook.text || '';
        const ctaText = typeof cta === 'string' ? cta : cta?.text || '';
        const scenesText = scenes.map((s: any, i: number) =>
            `Scene ${i + 1}: ${s.monsterDialogue || s.dialogue || ''}`
        ).join('\n');

        const scriptSummary = `Hook: ${hookText}\n${scenesText}\nCTA: ${ctaText}`;

        // Initialize Gemini
        const genAI = new GoogleGenAI({
            apiKey: apiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
        });

        const systemPrompt = `
        TASK:
        Generate viral TikTok/Reels metadata for a POV-style product video.
        
        Product: ${productName || 'Unknown product'}
        POV Type: ${povType || 'monster/bacteria'}
        
        Script Summary:
        ${scriptSummary}

        RULES:
        - Title: Short, punchy, viral-worthy. Use hooks like "POV:", "Wait for it...", emojis.
        - Description: Engaging caption with storytelling, call to action, and emotional hook.
        - Hashtags: 15-20 relevant TikTok hashtags including trending ones.
        - Keywords: 8-12 SEO keywords for discoverability.
        - viralHooks: 3 short, compelling 3-second hooks to grab attention.
        - socialPosts: Write short, native-feeling posts for Threads/X, Instagram Reels, and Facebook Shorts.
        - targetAudience: Identify the ideal target demographics, 2-3 pain points, and 2-3 deepest desires related to this product/video.
        - Match the language of the script (Vietnamese or English).

        OUTPUT FORMAT:
        Return ONLY valid JSON:
        {
            "title": "Viral title here",
            "description": "Engaging caption here",
            "hashtags": ["#tag1", "#tag2"],
            "keywords": ["keyword1", "keyword2"],
            "viralHooks": ["Hook 1", "Hook 2", "Hook 3"],
            "socialPosts": {
                "threads": "Short text post...",
                "instagram": "Reels caption with aesthetic...",
                "facebook": "Engaging Facebook post..."
            },
            "targetAudience": {
                "demographics": "E.g., Gen Z users aged 18-24...",
                "painPoints": ["Point 1", "Point 2"],
                "desires": ["Desire 1", "Desire 2"]
            }
        }
        `;

        const response = await genAI.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
            config: { responseMimeType: 'application/json' }
        });

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("No response from AI");

        const seoData = JSON.parse(text);

        return NextResponse.json(seoData);

    } catch (error) {
        console.error('POV SEO API Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
