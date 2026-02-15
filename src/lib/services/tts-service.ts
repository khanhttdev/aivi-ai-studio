// Gemini 2.5 Flash TTS Speakers (Multi-modal)
export const AVAILABLE_VOICES = [
    { id: 'Aoede', name: 'Aoede (Expressive - Female)', lang: 'vi-VN', preview: '' },
    { id: 'Kore', name: 'Kore (Clear - Female)', lang: 'vi-VN', preview: '' },
    { id: 'Charon', name: 'Charon (Deep - Male)', lang: 'en-US', preview: '' },
    { id: 'Callirrhoe', name: 'Callirrhoe (Friendly - Male)', lang: 'en-US', preview: '' },
    // Legacy / Fallback
    { id: 'Thi', name: 'Như Quỳnh (Legacy VN)', lang: 'vi-VN', preview: 'https://api.streamelements.com/kappa/v2/speech?voice=Thi&text=Xin%20ch%C3%A0o%2C%20t%C3%B4i%20l%C3%A0%20Nh%C6%B0%20Qu%E1%BB%B3nh' },
    { id: 'Brian', name: 'James (Legacy US)', lang: 'en-US', preview: 'https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=Hello%20there%2C%20I%20am%20James' },
];

export interface TTSRequest {
    text: string;
    voiceId?: string;
    stylePrompt?: string;
}

/**
 * Generates speech using Google Cloud Gemini 2.5 Flash TTS
 * Documentation: https://cloud.google.com/text-to-speech/docs/gemini-tts
 */
export async function generateSpeech(
    text: string,
    voiceId: string = 'Aoede',
    stylePrompt: string = "Say the following clearly and naturally."
): Promise<string> {
    console.log(`Generating Gemini TTS for: "${text}" with speaker ${voiceId}`);

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("Missing Gemini API Key. Falling back to StreamElements.");
        return `https://api.streamelements.com/kappa/v2/speech?voice=${voiceId === 'Charon' ? 'Brian' : 'Thi'}&text=${encodeURIComponent(text)}`;
    }

    // List of Gemini Speakers
    const geminiSpeakers = ['Aoede', 'Kore', 'Charon', 'Callirrhoe'];
    const isGeminiVoice = geminiSpeakers.includes(voiceId);

    if (!isGeminiVoice) {
        // Fallback to StreamElements for non-gemini IDs
        return `https://api.streamelements.com/kappa/v2/speech?voice=${voiceId}&text=${encodeURIComponent(text)}`;
    }

    try {
        const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                input: {
                    prompt: stylePrompt,
                    text: text
                },
                voice: {
                    languageCode: voiceId === 'Charon' || voiceId === 'Callirrhoe' ? 'en-US' : 'vi-VN', // Ideally multi-lingual
                    modelName: "gemini-2.5-flash-tts",
                    name: voiceId // This is the speakerId/name per docs
                },
                audioConfig: {
                    audioEncoding: "MP3",
                    sampleRateHertz: 24000
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.warn("Gemini TTS API error, falling back:", errorData);
            // Fallback to StreamElements
            return `https://api.streamelements.com/kappa/v2/speech?voice=${voiceId === 'Charon' || voiceId === 'Callirrhoe' ? 'Brian' : 'Thi'}&text=${encodeURIComponent(text)}`;
        }

        const data = await response.json();

        if (!data.audioContent) {
            console.warn("No audio content in response, falling back.");
            return `https://api.streamelements.com/kappa/v2/speech?voice=${voiceId === 'Charon' || voiceId === 'Callirrhoe' ? 'Brian' : 'Thi'}&text=${encodeURIComponent(text)}`;
        }

        // Convert base64 to Blob URL
        const binaryString = window.atob(data.audioContent);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([bytes], { type: 'audio/mp3' });
        return URL.createObjectURL(blob);

    } catch (e) {
        console.error("Gemini TTS system error:", e);
        return `https://api.streamelements.com/kappa/v2/speech?voice=${voiceId === 'Charon' || voiceId === 'Callirrhoe' ? 'Brian' : 'Thi'}&text=${encodeURIComponent(text)}`;
    }
}
