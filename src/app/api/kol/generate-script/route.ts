import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit';

export async function POST(req: Request) {
    // Rate limiting
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`kol-script:${clientIp}`, RATE_LIMITS.kolGeneration);
    if (!rateCheck.allowed) {
        return rateLimitResponse(rateCheck);
    }

    try {
        const body = await req.json();
        const { prompt, apiKey, locale = 'vi' } = body;

        if (!prompt) {
            return NextResponse.json(
                { error: "Missing 'prompt' in request body" },
                { status: 400 }
            );
        }

        // Initialize Gemini API with custom key if provided
        const genAI = new GoogleGenAI({
            apiKey: apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
        });

        // Add language instruction
        const langInstruction = locale === 'vi'
            ? "Vui lòng trả lời hoàn toàn bằng Tiếng Việt. Giữ nguyên cấu trúc JSON."
            : "Please respond entirely in English. Keep the JSON structure intact.";

        const finalPrompt = `${langInstruction}\n\n${prompt}`;

        const response = await genAI.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
        });

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error("No response from AI");
        }

        // Try to parse and return structured data
        try {
            // Clean markdown code blocks if present
            let cleanText = text.trim();
            if (cleanText.startsWith('```json')) {
                cleanText = cleanText.slice(7);
            } else if (cleanText.startsWith('```')) {
                cleanText = cleanText.slice(3);
            }
            if (cleanText.endsWith('```')) {
                cleanText = cleanText.slice(0, -3);
            }
            cleanText = cleanText.trim();

            const parsed = JSON.parse(cleanText);
            return NextResponse.json({ result: parsed });
        } catch (parseError) {
            console.warn("Failed to parse JSON response:", parseError);
            return NextResponse.json({ result: text });
        }

    } catch (error) {
        console.error("KOL Script Generation API error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
