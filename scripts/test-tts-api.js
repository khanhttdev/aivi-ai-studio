/* eslint-disable @typescript-eslint/no-require-imports */
const { GoogleGenAI } = require('@google/genai');
// const https = require('https');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
let apiKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/NEXT_PUBLIC_GEMINI_API_KEY=(.*)/);
    if (match) apiKey = match[1].trim();
} catch {
    console.error("Could not read .env.local");
    process.exit(1);
}

if (!apiKey) {
    console.error("API Key not found");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

(async () => {
    console.log("Testing TTS generation with 'gemini-2.5-flash-preview-tts'...");
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [
                {
                    parts: [{ text: "Hello, this is a test of the Google Gemini TTS system." }],
                },
            ],
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName: 'Puck', // Using a standard voice
                        },
                    },
                },
            },
        });

        // Check for audio data
        const parts = response.candidates?.[0]?.content?.parts;
        const audioPart = parts?.find(p => p.inlineData?.mimeType?.startsWith('audio'));

        if (audioPart) {
            console.log("✅ SUCCESS! Audio data received.");
            console.log(`MimeType: ${audioPart.inlineData.mimeType}`);
            console.log(`Data length: ${audioPart.inlineData.data.length} bytes`);
        } else {
            console.error("❌ FAILED: No audio in response.");
            console.log("Full Response:", JSON.stringify(response, null, 2));
        }

    } catch (error) {
        console.error("❌ ERROR:", error.message);
        if (error.response) {
            console.error("Response:", JSON.stringify(error.response, null, 2));
        }
    }
})();
