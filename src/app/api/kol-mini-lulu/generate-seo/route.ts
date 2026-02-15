
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { script, character, apiKey } = body;

        const finalApiKey = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

        if (!finalApiKey) {
            return NextResponse.json({ error: 'API key is missing.' }, { status: 401 });
        }

        const genAI = new GoogleGenAI({ apiKey: finalApiKey });

        if (!script || !Array.isArray(script)) {
            return NextResponse.json({ error: 'Valid script is required' }, { status: 400 });
        }

        // Construct the prompt
        const prompt = `
You are a TikTok/Reels Viral Marketing Expert. Generate a "Marketing Kit" for a short video script about "${character}" (Mini the Cat and/or Lulu the Dog).

SCRIPT:
${script.map((s: any) => `- [${s.character}] ${s.action}: "${s.dialogue}"`).join('\n')}

REQUIREMENTS:
1. Viral Title: Catchy, short, shocking or funny hook (Vietnamese).
2. Video Description: Engaging caption, includes a question for engagement (Vietnamese).
3. Hashtags: 5-8 relevant trending hashtags (mix English/Vietnamese).
4. Keywords: 5-10 high-traffic keywords for SEO (comma separated).

Return JSON format:
{
  "title": "String",
  "description": "String",
  "hashtags": ["#tag1", "#tag2"],
  "keywords": ["keyword1", "keyword2"]
}
`;

        const response = await genAI.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json"
            }
        });

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!text) throw new Error('No SEO generated');

        const seoData = JSON.parse(text);

        return NextResponse.json(seoData);

    } catch (error: any) {
        console.error('SEO Generation Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate SEO' },
            { status: 500 }
        );
    }
}
