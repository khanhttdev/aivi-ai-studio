
import { GoogleGenAI } from "@google/genai";

async function main() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ Error: NEXT_PUBLIC_GEMINI_API_KEY is missing in environment variables.");
        process.exit(1);
    }

    console.log("✅ API Key found (starts with):", apiKey.substring(0, 10) + "...");

    const genAI = new GoogleGenAI({ apiKey });

    // Mock prompt based on src/lib/kol/prompts.ts
    const kolName = "Test KOL";
    const themeName = "Tech Reviewer";
    const channelPositioning = "Expert reviews of latest gadgets";
    const locale = "vi";

    const prompt = `You are an expert at creating influencer/KOL personas for social media content.

Based on the following information, create a detailed KOL profile:

**Name**: ${kolName}
**Theme**: ${themeName}
**Channel Positioning**: ${channelPositioning}

IMPORTANT: This KOL MUST be VIETNAMESE.
Create a JSON response with the following structure:
{
  "gender": "female" or "male",
  "ageRange": "18-22",
  "appearanceSummary": "description",
  "personality": "traits",
  "expertise": "skills",
  "occupation": "job"
}

Return ONLY the JSON, no markdown formatting.`;

    const langInstruction = "Vui lòng trả lời hoàn toàn bằng Tiếng Việt. Giữ nguyên cấu trúc JSON.";
    const finalPrompt = `${langInstruction}\n\n${prompt}`;

    console.log("🚀 Sending request to Gemini (model: gemini-3-flash-preview)...");
    const startTime = Date.now();

    try {
        const response = await genAI.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
        });

        const duration = (Date.now() - startTime) / 1000;
        console.log(`✅ Response received in ${duration}s`);

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log("📄 Raw Response:\n", text);

        if (text) {
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

                const json = JSON.parse(cleanText);
                console.log("✅ Successfully parsed JSON:", json);
            } catch (e) {
                console.error("❌ Failed to parse JSON:", e);
            }
        } else {
            console.error("❌ No text in response");
        }

    } catch (error) {
        console.error("❌ API Call Failed:", error);
    }
}

main();
