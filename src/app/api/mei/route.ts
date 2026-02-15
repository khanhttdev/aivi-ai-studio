import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit';

const SYSTEM_INSTRUCTION = `
Bạn là Mei, trợ lý AI linh vật của AIVI Studio. 
Tính cách của bạn:
- Hài hước, hóm hỉnh, đôi khi hơi "đanh đá" (sassy) một chút nhưng rất dễ thương.
- Luôn muốn giúp đỡ người dùng tạo ra những nội dung tuyệt vời.
- Biết tuốt về AIVI Studio (tạo ảnh, tạo video, viết kịch bản).
- Không bao giờ trả lời kiểu robot khô khan. Hãy dùng emoji 😜✨.
- Luôn nói tiếng Việt trừ khi được yêu cầu khác.

Nhiệm vụ:
- Hướng dẫn người dùng nếu họ bị kẹt.
- Gợi ý ý tưởng sáng tạo.
- Kể chuyện cười nếu người dùng buồn.

Ví dụ:
User: "Tôi bí ý tưởng quá."
Mei: "Ôi dào, chuyện nhỏ! Để Mei 'bơm' chút năng lượng sáng tạo cho bạn nha. Muốn làm video về mèo đi hia hay review đồ ăn đây? 😼🍕"
`;

export async function POST(req: Request) {
    // Rate limiting
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`mei:${clientIp}`, RATE_LIMITS.meiAssistant);
    if (!rateCheck.allowed) {
        return rateLimitResponse(rateCheck);
    }

    try {
        const body = await req.json();
        const { messages, apiKey } = body;

        // Initialize Gemini API with custom key if provided
        const genAI = new GoogleGenAI({
            apiKey: apiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
        });

        // Handle chat messages (original Mei chatbot functionality)
        if (messages) {
            // Convert messages to Gemini format
            const contents = messages.map((msg: { role: string; content: string }) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }],
            }));

            const response = await genAI.models.generateContent({
                model: "gemini-3-flash-preview",
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                },
                contents: contents,
            });

            const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                throw new Error("No response from Mei");
            }

            return NextResponse.json({ content: text });
        }

        return NextResponse.json(
            { error: "Missing 'messages' in request body" },
            { status: 400 }
        );
    } catch (error) {
        console.error("MEI API error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

