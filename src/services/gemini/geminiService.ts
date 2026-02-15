
import { GoogleGenAI, Part } from "@google/genai";
import { generateImageFromPrompt } from "@/lib/gemini/client";
import { ContentIdea, ScriptResult } from "@/lib/gemini/types";

// Helper for SchemaType if not exported


// Helper to strip markdown and parse JSON
const safeParseJson = (text: string) => {
    try {
        // Strip markdown code blocks if present
        const cleaned = text.replace(/```json\n?|```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        // If it still fails, try to find the first [ or { and the last ] or }
        const startBracket = text.indexOf('[');
        const startBrace = text.indexOf('{');
        let start = -1;

        if (startBracket !== -1 && (startBrace === -1 || startBracket < startBrace)) start = startBracket;
        else if (startBrace !== -1) start = startBrace;

        if (start !== -1) {
            const endBracket = text.lastIndexOf(']');
            const endBrace = text.lastIndexOf('}');
            const end = Math.max(endBracket, endBrace);

            if (end !== -1 && end > start) {
                try {
                    return JSON.parse(text.substring(start, end + 1));
                } catch (innerE) {
                    console.error("Deep JSON parse failed:", innerE);
                }
            }
        }
        throw e;
    }
};

// Helper to get client (using NEW SDK @google/genai for text/multimodal v2/v3)
const getGenAI = (apiKey?: string) => {
    const key = apiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.API_KEY || "";
    if (!key) console.warn("API Key missing for Gemini Service - Please check .env.local or User Profile");
    return new GoogleGenAI({ apiKey: key });
};

export const geminiService = {
    // 1. Brainstorm Sub-niches
    generateSubNiches: async (topic: string, avoidList: string[] = [], apiKey?: string): Promise<string[]> => {
        try {
            const ai = getGenAI(apiKey);

            const avoidPrompt = avoidList.length > 0
                ? `BẠN PHẢI TRÁNH TUYỆT ĐỐI các ý tưởng sau đây vì chúng đã cũ: ${JSON.stringify(avoidList)}`
                : "";

            const prompt = `
        Từ chủ đề chính: "${topic}", hãy suy luận và đề xuất 5 ngách nhỏ (sub-niches) CỰC KỲ CỤ THỂ, mang tính "lifehack" viral.
        
        Yêu cầu:
        - Chỉ trả về TIÊU ĐỀ ngắn gọn (dưới 10 chữ), không mô tả dài dòng.
        - Ý tưởng phải độc đáo, gây tò mò.
        - ${avoidPrompt}
        - Trả về JSON là một mảng gồm 5 chuỗi (Array<string>).
      `;

            // SDK v1.0.0 (New GoogleGenAI) syntax
            const result = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: { responseMimeType: "application/json" }
            });

            // Handle response safely
            // Handle response safely
            // Note: In @google/genai SDK, result itself contains candidates or response structure might differ.
            // Based on observed types: GenerateContentResponse usually has candidates directly if not nested in 'response' property differently than assumed.
            // Let's coerce type safely or check documentation pattern.
            // Actually, for @google/genai, it returns a response object that has candidates.
            // If the previous error said 'response' does not exist on type 'GenerateContentResponse', 
            // it means 'result' IS the GenerateContentResponse.
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error("No response text");

            return safeParseJson(text);
        } catch (error) {
            console.error("Gemini Error (SubNiches):", error);
            // Fallback
            return ["Mẹo vặt tổng hợp", "Kỹ năng sinh tồn", "Hack tư duy", "Sáng tạo nội dung", "Phong cách sống"];
        }
    },

    // 2. Generate Video Concepts (Ideas)
    generateIdeas: async (topic: string, images: string[], apiKey?: string): Promise<ContentIdea[]> => {
        try {
            const ai = getGenAI(apiKey);

            // Prepare image parts for new SDK
            // Format: { inlineData: { data: base64, mimeType: "image/jpeg" } }
            // API expects contents parts array
            const imageParts = images.map(base64 => ({
                inlineData: {
                    data: base64.replace(/^data:image\/\w+;base64,/, ""),
                    mimeType: "image/jpeg"
                }
            }));

            const prompt = `
        Dựa trên ảnh của Nhân vật 1 (ảnh 1) và Nhân vật 2 (ảnh 2), đề xuất 5 ý tưởng nội dung video viral CHI TIẾT và CHỈ XOAY QUANH mẹo vặt này: "${topic}".
        
        YÊU CẦU BẮT BUỘC: 
        - KHÔNG ĐƯỢC đề xuất các mẹo vặt khác ngoài nội dung "${topic}".
        - Các ý tưởng phải là các tình huống cụ thể khác nhau để thực hiện mẹo "${topic}".
        - Cấu trúc mỗi ý tưởng: Vấn đề (Nhân vật 2 gặp khó) - Giải pháp (Nhân vật 1 dạy thực hiện mẹo "${topic}" theo phong cách "Luxury/Chuyên gia") - Kết quả (Happy ending).
        
        Trả về JSON mảng 5 đối tượng theo cấu trúc:
        {
          id: number;
          title: string;
          brief: string; 
          viralScore: number; // Đánh giá độ viral từ 1-10
        }
        `;

            const parts: Part[] = [{ text: prompt }]; // Mix text and inlineData parts
            imageParts.forEach(img => parts.push(img));

            const result = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: [{ role: 'user', parts: parts }],
                config: { responseMimeType: "application/json" }
            });

            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) return [];

            return safeParseJson(text);
        } catch (error) {
            console.error("Gemini Error (Ideas):", error);
            return [];
        }
    },

    // 3. Generate Full Viral Script
    generateScript: async (idea: ContentIdea, apiKey?: string): Promise<ScriptResult | null> => {
        try {
            const ai = getGenAI(apiKey);

            const prompt = `
        Viết một kịch bản video viral ngắn (Shorts/Reels) dựa trên ý tưởng này:
        - Tiêu đề: "${idea.title}"
        - Tóm tắt: "${idea.brief}"

        Yêu cầu:
        - Phong cách: "Viral Clickbait, Aesthetic Luxury, Conflict & Solution".
        - Cấu trúc 3 phân cảnh (3 Scenes):
            1. Scene 1: Vấn đề (Conflict/Drama nhẹ).
            2. Scene 2: Giải pháp (Nhân vật chính "mắng yêu" hoặc dạy mẹo).
            3. Scene 3: Kết quả (Satisfying/Happy Ending).
        - Lời thoại: Tiếng Việt tự nhiên, gen Z, hài hước.
        - Image Prompts: Mô tả visual bằng Tiếng Anh để tạo ảnh (Keywords: Cinematic, 8k, photorealistic).

        Trả về JSON đúng cấu trúc sau:
        {
          "title": "Tên video giật tít",
          "scriptDescription": "Mô tả ngắn về video",
          "scenes": [
            {
              "frameId": 1,
              "description": "Mô tả cảnh 1",
              "dialogue": "Lời thoại nhân vật",
              "imagePrompt": "Detailed English prompt for image generation..."
            }
          ],
          "suggestedTitles": ["Title 1", "Title 2"],
          "thumbnailPrompts": ["Prompt for thumbnail 1", "Prompt for thumbnail 2"]
        }
        `;

            // Using Gem 2.0 Flash or 3.0 Pro if available to user
            const result = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: { responseMimeType: "application/json" }
            });

            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) return null;

            return safeParseJson(text);
        } catch (error) {
            console.error("Gemini Error (Script):", error);
            return null;
        }
    },
    // 4. Generate Image (Phase 5)
    generateImage: async (prompt: string, apiKey?: string): Promise<string | null> => {
        try {
            const key = apiKey || process.env.API_KEY;
            // Calls client lib which is already using GoogleGenAI SDK correctly
            const result = await generateImageFromPrompt(prompt, key);
            return result;
        } catch (error) {
            console.error("Gemini Error (Image):", error);
            return null;
        }
    }
};
