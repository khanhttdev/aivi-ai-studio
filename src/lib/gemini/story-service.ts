import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ScriptResult, ContentIdea } from "./types";

// Helper to handle SchemaType if Type is not directly exported or renamed
// In @google/genai 1.0, typically we define schema as objects.
// Let's rely on JSON schema format directly if Type helper is missing or different.
// For now, I will use strings/objects for schema type to avoid import errors if Type is mutable.
const SchemaType = {
    STRING: "STRING",
    NUMBER: "NUMBER",
    INTEGER: "INTEGER",
    BOOLEAN: "BOOLEAN",
    ARRAY: "ARRAY",
    OBJECT: "OBJECT"
} as const;


const getMimeType = (base64: string): string => {
    const match = base64.match(/^data:([^;]+);base64,/);
    return match ? match[1] : "image/jpeg";
};

const getBase64Data = (base64: string): string => {
    return base64.split(",")[1] || base64;
};

const getApiKey = (): string => {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Gemini API Key is missing");
    return key;
}

const getText = (response: GenerateContentResponse): string => {
    if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        return response.candidates[0].content.parts[0].text;
    }
    // Fallback to response.text property
    if (response.text) {
        return response.text;
    }
    return "";
}

/**
 * PROMPT 1: PHÂN TÍCH CỐT TRUYỆN (PLOT SEEDING)
 * Mục tiêu: Tạo ra các "hạt giống" câu chuyện kịch tính từ chủ đề gốc.
 */
export const generateSubNiches = async (mainTopic: string, history: string[] = []): Promise<string[]> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const avoidList = history.length > 0 ? `KHÔNG lặp lại các ý tưởng sau: ${history.join(", ")}.` : "";

    const prompt = `Bạn là một chuyên gia sáng tạo nội dung Viral trên TikTok và YouTube. 
  Từ chủ đề: "${mainTopic}", hãy đề xuất 5 hạt giống cốt truyện (Plot Seeds) cực kỳ lôi cuốn.
  
  Yêu cầu:
  - ƯU TIÊN các thể loại: Tâm lý (Psychological), Tình cảm (Romance), Drama sâu sắc, hoặc những câu chuyện đời thường kịch tính.
  - HẠN CHẾ tối đa các yếu tố kinh dị, rùng rợn hoặc hù dọa.
  - Mỗi cốt truyện phải có một "Hook" (mở đầu gây ấn tượng mạnh về cảm xúc) và một "Twist" (nút thắt bất ngờ hoặc cảm động).
  - Ngôn ngữ: Tiếng Việt, ngắn gọn, súc tích (dưới 15 từ).
  - ${avoidList}
  
  Trả về JSON: mảng 5 chuỗi.`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING }
            }
        },
        contents: [{ parts: [{ text: prompt }] }]
    });

    try {
        return JSON.parse(getText(response) || "[]");
    } catch (e) {
        console.error("Failed to parse sub niches", e);
        return [];
    }
};

/**
 * PROMPT 2: CASTING & LOGLINE
 * Mục tiêu: Phân tích nhân vật từ ảnh thật và tạo ra 4 hướng kịch bản ĐÃ ĐỊNH HƯỚNG TỪ STEP 2.
 */
export const generateContentIdeas = async (
    image1Base64: string,
    image2Base64: string,
    topic: string,
    selectedPlot: string,
    role1: string,
    role2: string
): Promise<ContentIdea[]> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `Bạn là Đạo diễn kịch bản. Dựa trên:
  1. Hướng kịch bản đã chọn (Step 2): "${selectedPlot}"
  2. Chủ đề tổng thể: "${topic}"
  3. Ngoại hình 2 nhân vật trong ảnh (${role1} và ${role2}).
  
  Hãy đề xuất 4 ý tưởng Concept cụ thể hơn (Loglines) để phát triển thành phim:
  - Yêu cầu: 4 Concept này PHẢI là các biến thể hoặc các góc nhìn khác nhau dựa trên hướng kịch bản "${selectedPlot}". KHÔNG ĐƯỢC đi lệch khỏi hướng kịch bản này.
  - Concept 1: Tập trung vào Drama tâm lý.
  - Concept 2: Tập trung vào Sự kịch tính/Giật gân.
  - Concept 3: Tập trung vào Chiều sâu cảm xúc.
  - Concept 4: Tập trung vào Hành động hoặc Sự bất ngờ.
  
  Trả về JSON mảng 4 đối tượng: id, title, brief.`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
            {
                parts: [
                    { inlineData: { mimeType: getMimeType(image1Base64), data: getBase64Data(image1Base64) } },
                    { inlineData: { mimeType: getMimeType(image2Base64), data: getBase64Data(image2Base64) } },
                    { text: prompt }
                ]
            }
        ],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.ARRAY,
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        id: { type: SchemaType.NUMBER },
                        title: { type: SchemaType.STRING },
                        brief: { type: SchemaType.STRING }
                    },
                    required: ["id", "title", "brief"]
                }
            }
        }
    });

    try {
        return JSON.parse(getText(response) || "[]");
    } catch (e) {
        console.error("Failed to parse content ideas", e);
        return [];
    }
};

/**
 * PROMPT 3: BIÊN KỊCH CHI TIẾT (CINEMATIC SCRIPTWRITING)
 * Mục tiêu: Tạo kịch bản chuyên nghiệp với đầy đủ chỉ dẫn góc máy và cảm xúc.
 */
export const generateViralScript = async (
    image1Base64: string,
    image2Base64: string,
    topic: string,
    selectedIdea: ContentIdea,
    role1: string,
    role2: string,
    frameCount: number
): Promise<ScriptResult> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    const prompt = `Hãy viết một kịch bản phim ngắn điện ảnh chuyên nghiệp gồm ĐÚNG ${frameCount} phân cảnh.
  Chủ đề: ${topic}. Tiêu đề: ${selectedIdea.title}.
  
  HƯỚNG DẪN BIÊN KỊCH:
  - Cấu trúc: 01-Giới thiệu, 02-Nút thắt, 03-Cao trào, 04-Kết thúc bất ngờ.
  - Lời thoại: Sâu sắc, mang tính ẩn dụ, phù hợp với lứa tuổi và ngoại hình của ${role1} và ${role2}.
  - Người nói: Xác định rõ ai là người nói (1 cho ${role1}, 2 cho ${role2}, 0 cho người dẫn truyện/narrator).
  - Biểu cảm: Mô tả cực chi tiết (ví dụ: 'đồng tử co lại', 'mồ hôi rịn trên trán').

  HƯỚNG DẪN HÌNH ẢNH (DÀNH CHO STORYBOARD):
  - Chỉ định góc máy: Extreme Close-up, Bird's eye view, Over-the-shoulder.
  - Ánh sáng: Rembrandt lighting, Teal and Orange, Noir shadows.
  - Video Prompt: Mô tả chuyển động máy quay cho AI Video (VD: 'Dolly zoom into character's eyes').

  Trả về JSON: title, scriptDescription, frames[], suggestedTitles, thumbnailPrompts.`;

    const scriptResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
            {
                parts: [
                    { inlineData: { mimeType: getMimeType(image1Base64), data: getBase64Data(image1Base64) } },
                    { inlineData: { mimeType: getMimeType(image2Base64), data: getBase64Data(image2Base64) } },
                    { text: prompt }
                ]
            }
        ],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.OBJECT,
                properties: {
                    title: { type: SchemaType.STRING },
                    topic: { type: SchemaType.STRING },
                    scriptDescription: { type: SchemaType.STRING },
                    frames: {
                        type: SchemaType.ARRAY,
                        items: {
                            type: SchemaType.OBJECT,
                            properties: {
                                frameId: { type: SchemaType.NUMBER },
                                description: { type: SchemaType.STRING },
                                dialogue: { type: SchemaType.STRING },
                                speaker: { type: SchemaType.NUMBER, description: "0: Narrator, 1: Character 1, 2: Character 2" },
                                imagePrompt: { type: SchemaType.STRING },
                                videoPrompt: { type: SchemaType.STRING },
                                policyCheck: { type: SchemaType.STRING }
                            },
                            required: ["frameId", "description", "dialogue", "speaker", "imagePrompt", "videoPrompt", "policyCheck"]
                        }
                    },
                    suggestedTitles: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                    thumbnailPrompts: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                },
                required: ["title", "topic", "frames", "suggestedTitles", "thumbnailPrompts"]
            }
        }
    });

    try {
        return JSON.parse(getText(scriptResponse) || "{}");
    } catch (e) {
        throw new Error("Lỗi phân tích kịch bản: " + e);
    }
};

/**
 * PROMPT 4: RENDER STORYBOARD (VISUAL CONSISTENCY)
 * Mục tiêu: Tạo ảnh minh họa đồng nhất với nhân vật gốc.
 */
export const generateSingleFrameImage = async (
    image1Base64: string,
    image2Base64: string,
    backgroundBase64: string,
    imagePrompt: string,
    role1: string,
    role2: string
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `Siêu thực, chất lượng điện ảnh 8K, RAW photo.
  QUY TẮC NHẤT QUÁN NHÂN VẬT:
  1. Nhân vật ${role1} và ${role2} PHẢI GIỮ NGUYÊN gương mặt, trang phục và phụ kiện từ ảnh tham chiếu.
  2. Bối cảnh: Hòa trộn hoàn hảo vào không gian trong ảnh nền.
  3. Mô tả cảnh: ${imagePrompt}.
  4. Ánh sáng: Volumetric lighting, cinematic grain. 
  Tỉ lệ 9:16. KHÔNG CHỮ.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
            role: 'user',
            parts: [
                { inlineData: { mimeType: getMimeType(image1Base64), data: getBase64Data(image1Base64) } },
                { inlineData: { mimeType: getMimeType(image2Base64), data: getBase64Data(image2Base64) } },
                { inlineData: { mimeType: getMimeType(backgroundBase64), data: getBase64Data(backgroundBase64) } },
                { text: prompt }
            ]
        },
        config: {
            responseModalities: ['image']
        }
    });

    // Handle image response
    // Note: The structure depends on the SDK version, for generateContent with image it might be different
    // but let's assume standard parts access.
    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Render thất bại.");
};

export const generateCommonBackground = async (sceneContext: string, topic: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `Cinematic wide shot, architectural photography. Scene: ${sceneContext || topic}. Mood: Atmospheric, deep depth of field, 8k. NO PEOPLE. NO TEXT. Aspect ratio 9:16.`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            responseModalities: ['image']
        }
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    return "";
};

export const generate3DCartoonImage = async (gender: string, age: string, outfit: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `High-end 3D Character Design, Pixar style. Gender: ${gender}, Age: ${age}, Outfit: ${outfit}. Unreal Engine 5 render, soft studio lighting, cute expression. 9:16.`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            responseModalities: ['image']
        }
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    return "";
};

export const generateThumbnailImage = async (i1: string, i2: string, bg: string, promptText: string, r1: string, r2: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `Movie Poster Masterpiece. Characters ${r1} and ${r2} looking dramatic. ${promptText}. Cinematic lighting, 8k. 9:16. NO TEXT.`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
            role: 'user',
            parts: [
                { inlineData: { mimeType: getMimeType(i1), data: getBase64Data(i1) } },
                { inlineData: { mimeType: getMimeType(i2), data: getBase64Data(i2) } },
                { inlineData: { mimeType: getMimeType(bg), data: getBase64Data(bg) } },
                { text: prompt }
            ]
        },
        config: {
            responseModalities: ['image']
        }
    });
    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    return "";
};

/**
 * Đề xuất ngoại hình nhân vật dựa trên cốt truyện
 */
export const generateCastingPrompts = async (selectedPlot: string): Promise<{ char1Prompt: string, char2Prompt: string }> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `Dựa trên cốt truyện: "${selectedPlot}", hãy đề xuất mô tả ngoại hình ngắn gọn bằng TIẾNG ANH cho 2 nhân vật chính (Protagonist và Antagonist/Partner).
    
    Yêu cầu ĐẶC BIỆT:
    - CẢ HAI nhân vật PHẢI là người VIỆT NAM hoặc CHÂU Á (Vietnamese or East Asian ethnicity).
    - Mô tả tập trung vào độ tuổi, phong cách quần áo hiện đại/phù hợp kịch bản và biểu cảm đặc trưng.
    - Ngôn ngữ: Chỉ trả về Tiếng Anh.
    - Trả về JSON: { "char1Prompt": "mô tả 1", "char2Prompt": "mô tả 2" }`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.OBJECT,
                properties: {
                    char1Prompt: { type: SchemaType.STRING },
                    char2Prompt: { type: SchemaType.STRING }
                },
                required: ["char1Prompt", "char2Prompt"]
            }
        },
        contents: [{ parts: [{ text: prompt }] }]
    });

    try {
        return JSON.parse(getText(response) || "{}");
    } catch (e) {
        console.error("Failed to parse casting prompts", e);
        return { char1Prompt: "", char2Prompt: "" };
    }
};

/**
 * Tạo ảnh nhân vật phong cách 3D Pixar (High-end Animation)
 */
export const generateRealisticActor = async (appearancePrompt: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `High-end 3D character design, Disney Pixar style. 
    Character: Vietnamese or East Asian person, ${appearancePrompt}. 
    Features: Iconic Pixar-style large expressive eyes, stylized proportional features, smooth skin with subsurface scattering.
    Visual: Unreal Engine 5 render, soft clay-like texture, vibrant cinematic studio lighting.
    Professional character model sheet look. 9:16 aspect ratio. NO TEXT.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            responseModalities: ['image']
        }
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    return "";
};

/**
 * SEO & Marketing Assets Generator
 * Tạo tiêu đề viral, mô tả, hashtags, keywords và thumbnail prompt
 */
export interface SEOAssets {
    viralTitles: string[];
    description: string;
    hashtags: string[];
    keywords: string[];
    thumbnailPrompts: string[];
}

export const generateSEOAssets = async (
    scriptTitle: string,
    scriptDescription: string,
    topic: string,
    frames: { description: string; dialogue: string }[]
): Promise<SEOAssets> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    const framesSummary = frames.slice(0, 3).map(f => f.description).join(". ");

    const prompt = `Bạn là chuyên gia SEO và Marketing viral content cho TikTok, YouTube Shorts và Instagram Reels.

Dựa trên thông tin video sau:
- Tiêu đề: "${scriptTitle}"
- Mô tả kịch bản: "${scriptDescription}"
- Chủ đề: "${topic}"
- Tóm tắt cảnh: "${framesSummary}"

Hãy tạo:

1. **viralTitles** (5 tiêu đề): Tiêu đề cực kỳ thu hút click (CTR 40%+). Sử dụng công thức: Hook + Emotion + Curiosity Gap. Ví dụ: "Cô gái này đã làm điều không ai ngờ tới...", "99% người xem khóc ở giây cuối".

2. **description** (1 đoạn): Mô tả video tối ưu SEO (150-200 ký tự), chứa từ khóa chính, call-to-action.

3. **hashtags** (15 hashtags): Mix giữa trending hashtags (#fyp #viral) và niche hashtags liên quan nội dung. Bao gồm cả tiếng Việt và tiếng Anh.

4. **keywords** (10 từ khóa): Từ khóa SEO chính cho video, ưu tiên long-tail keywords.

5. **thumbnailPrompts** (3 prompts): Mô tả chi tiết cho AI tạo thumbnail có CTR cao. Yêu cầu: biểu cảm mạnh, màu sắc nổi bật, có yếu tố gây tò mò.

Trả về JSON theo schema.`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.OBJECT,
                properties: {
                    viralTitles: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                    description: { type: SchemaType.STRING },
                    hashtags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                    keywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                    thumbnailPrompts: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                },
                required: ["viralTitles", "description", "hashtags", "keywords", "thumbnailPrompts"]
            }
        },
        contents: [{ parts: [{ text: prompt }] }]
    });

    try {
        return JSON.parse(getText(response) || "{}");
    } catch (e) {
        console.error("Failed to parse SEO assets", e);
        return {
            viralTitles: [],
            description: "",
            hashtags: [],
            keywords: [],
            thumbnailPrompts: []
        };
    }
};

// Helper to create WAV header for raw PCM
const addWavHeader = (base64PCM: string, sampleRate: number = 24000, numChannels: number = 1): string => {
    const binaryString = atob(base64PCM);
    const dataLength = binaryString.length;
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);

    // RIFF identifier
    writeString(view, 0, 'RIFF');
    // file length
    view.setUint32(4, 36 + dataLength, true);
    // RIFF type
    writeString(view, 8, 'WAVE');
    // format chunk identifier
    writeString(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, 1, true);
    // channel count
    view.setUint16(22, numChannels, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sampleRate * blockAlign)
    view.setUint32(28, sampleRate * numChannels * 2, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, numChannels * 2, true);
    // bits per sample
    view.setUint16(34, 16, true);
    // data chunk identifier
    writeString(view, 36, 'data');
    // data chunk length
    view.setUint32(40, dataLength, true);

    // Write PCM data
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < dataLength; i++) {
        bytes[44 + i] = binaryString.charCodeAt(i);
    }

    // Convert back to base64
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
};

/**
 * AI Voice Over Generator (TTS)
 * Sử dụng gemini-2.0-flash để tạo giọng đọc chất lượng cao
 */
export const generateVoice = async (text: string, voiceName: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{
                role: "user",
                parts: [{ text: text }]
            }],
            config: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName: voiceName
                        }
                    }
                }
            }
        });


        const part = result.candidates?.[0]?.content?.parts?.[0];
        if (part && part.inlineData && part.inlineData.data) {
            let mimeType = part.inlineData.mimeType || "audio/mp3";
            let base64Data = part.inlineData.data;

            if (!base64Data || base64Data === 'undefined') {
                throw new Error("Invalid base64 data received");
            }

            // Handle Raw PCM (L16)
            if (mimeType.includes('audio/L16') || mimeType.includes('pcm')) {
                console.log("Converting Raw PCM to WAV...");
                base64Data = addWavHeader(base64Data, 24000);
                mimeType = 'audio/wav';
            }

            // Enhanced MIME detection
            if (base64Data.startsWith('UklGR')) mimeType = 'audio/wav';
            else if (base64Data.startsWith('SUQz') || base64Data.startsWith('//uQ') || base64Data.startsWith('//tQ')) mimeType = 'audio/mp3';
            else if (base64Data.startsWith('T2dnUw')) mimeType = 'audio/ogg'; // Ogg signature

            console.log("Audio Gen: Detected MIME", mimeType, "Signature:", base64Data.substring(0, 10));

            return `data:${mimeType};base64,${base64Data}`;
        }

        throw new Error("No audio data received from Gemini TTS");
    } catch (e) {
        console.error("Gemini TTS Generation failed", e);
        throw e;
    }
};

/**
 * AI Background Music Generator
 * Sử dụng Lyria RealTime (hoặc model music của Gemini) để tạo nhạc nền
 */
export const generateBackgroundMusic = async (prompt: string, durationSeconds: number = 15): Promise<string> => {
    // Use v1alpha for Lyria
    const client = new GoogleGenAI({
        apiKey: getApiKey(),
        apiVersion: "v1alpha"
    });

    return new Promise((resolve, reject) => {
        (async () => {
            const audioChunks: Uint8Array[] = [];
            let hasResolved = false;

            try {
                const session = await client.live.music.connect({
                    model: "models/lyria-realtime-exp",
                    callbacks: {
                        onmessage: (message) => {
                            if (message.serverContent?.audioChunks) {
                                console.log("Lyria: Received audio chunks", message.serverContent.audioChunks.length);
                                for (const chunk of message.serverContent.audioChunks) {
                                    if (!chunk.data) continue;
                                    // Accumulate raw PCM data (base64 decode)
                                    const binaryString = atob(chunk.data);
                                    const len = binaryString.length;
                                    const bytes = new Uint8Array(len);
                                    for (let i = 0; i < len; i++) {
                                        bytes[i] = binaryString.charCodeAt(i);
                                    }
                                    audioChunks.push(bytes);
                                }
                            }
                        },
                        onerror: (error) => {
                            console.error("Music session error:", error);
                            if (!hasResolved) {
                                hasResolved = true;
                                reject(error);
                            }
                        },
                        onclose: () => console.log("Lyria RealTime stream closed."),
                    },
                });
                console.log("Lyria: Connected");

                // Config
                await session.setMusicGenerationConfig({
                    musicGenerationConfig: {
                        bpm: 90,
                        temperature: 1.0,
                    },
                });
                console.log("Lyria: Config Sent");

                await session.setWeightedPrompts({
                    weightedPrompts: [
                        { text: prompt, weight: 1.0 },
                    ],
                });
                console.log("Lyria: Prompts Sent");

                await session.play();
                console.log("Lyria: Play Called");

                // Record for durationSeconds
                setTimeout(async () => {
                    try {
                        // Close session if method exists
                        if (session.close) session.close();

                        // Combine chunks
                        const totalLength = audioChunks.reduce((acc, chunk) => acc + chunk.length, 0);
                        const combinedBuffer = new Uint8Array(totalLength);
                        let offset = 0;
                        for (const chunk of audioChunks) {
                            combinedBuffer.set(chunk, offset);
                            offset += chunk.length;
                        }

                        // Convert Uint8Array back to Base64 for addWavHeader
                        // Chunk processing to avoid stack overflow with large arrays
                        let binary = '';
                        const len = combinedBuffer.byteLength;
                        for (let i = 0; i < len; i += 32768) {
                            binary += String.fromCharCode(...combinedBuffer.subarray(i, i + 32768));
                        }
                        const base64PCM = btoa(binary);

                        // Add WAV Header (PCM16, 44100Hz)
                        const wavBase64 = addWavHeader(base64PCM, 44100);

                        if (!hasResolved) {
                            hasResolved = true;
                            resolve(`data:audio/wav;base64,${wavBase64}`);
                        }
                    } catch (err) {
                        if (!hasResolved) {
                            hasResolved = true;
                            reject(err);
                        }
                    }
                }, durationSeconds * 1000);

            } catch (e) {
                console.error("Gemini Music Generation failed", e);
                if (!hasResolved) resolve(""); // Fail gracefully
            }
        })();
    });
};
