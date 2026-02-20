import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit';
import { POVType } from '@/types/pov-studio';

export async function POST(request: NextRequest) {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`pov-studio-desc:${clientIp}`, RATE_LIMITS.meiAssistant); // Using meiAssistant limits as it's text-based
    if (!rateCheck.allowed) {
        return rateLimitResponse(rateCheck);
    }

    try {
        const body = await request.json();
        const { productName, povType, productImage, apiKey, locale = 'vi' } = body;

        if (!productName || !povType) {
            return NextResponse.json(
                { error: 'Missing product name or POV type' },
                { status: 400 }
            );
        }

        // Initialize Gemini
        const genAI = new GoogleGenAI({
            apiKey: apiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
        });

        const getPovContext = (type: POVType) => {
            switch (type) {
                case 'bacteria': return 'A tiny micro-organism or bacteria living on or near the product.';
                case 'monster': return 'A fictional, funny, or quirky monster/creature interacting with the product.';
                case 'object': return 'The product itself, or an object immediately next to it, coming to life.';
                case 'pet': return 'A household pet (cat, dog, etc.) observing or using the product.';
                case 'villain': return 'A comical, cartoonish villain plotting something using the product.';
                default: return 'A creative fictional character.';
            }
        };

        const langInstruction = locale === 'vi'
            ? "PHẢI HỒI ĐÁP BẰNG TIẾNG VIỆT."
            : "MUST RESPOND IN ENGLISH.";

        const promptText = `
        You are a creative director for a viral TikTok video.
        Generate a highly creative, funny, and engaging "Narrator Description" (character profile) for a POV video.
        
        Input Context:
        - Product Name: ${productName}
        - POV Type: ${getPovContext(povType as POVType)}
        
        Task:
        Describe the physical appearance and personality of this character in 1 to 2 short sentences.
        Make it quirky and visually descriptive. DO NOT include any explanations, just the description itself.
        
        ${langInstruction}
        `;

        const parts: any[] = [];

        // Include product image if available, to inspire the description
        if (productImage) {
            parts.push({
                inlineData: {
                    mimeType: productImage.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/png',
                    data: productImage.includes('base64,') ? productImage.split('base64,')[1] : productImage
                }
            });
            parts.push({ text: "Use this product image for inspiration for the character's style or color scheme." });
        }

        parts.push({ text: promptText });

        const contents = [{
            role: 'user',
            parts: parts
        }];

        // Use gemini-1.5-flash as it's fast and supports multimodal if needed
        const response = await genAI.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: contents,
            config: {
                temperature: 0.8,
            }
        });

        const textResponse = response.text;

        if (!textResponse) {
            throw new Error("Empty response from AI");
        }

        return NextResponse.json({ result: textResponse.trim() });

    } catch (error) {
        console.error('POV Generate Description error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
