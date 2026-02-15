import { GoogleGenAI, Part } from '@google/genai';
import {
    ImageProcessingRequest,
    SceneGenerationRequest,
} from './types';
import { buildProcessingPrompt, buildScenePrompt, buildVideoScenePrompt } from './prompts';

// Initialize Google GenAI client
const getClient = (apiKey?: string) => {
    const key = apiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!key) {
        throw new Error('API Key is missing. Please configuration in Profile or .env');
    }
    return new GoogleGenAI({ apiKey: key });
};

// Image processing model - using the main multimodal model
const IMAGE_MODEL = 'gemini-3-pro-image-preview'; // For Text-to-Image (High Quality)
const EDIT_MODEL = 'gemini-2.5-flash-image'; // For Image-to-Image / Editing (High Fidelity)

/**
 * Process source image (Left Sidebar -> Middle Sidebar)
 * Uses Ghost Mannequin technique to extract clothing
 */
export async function processSourceImage(
    request: ImageProcessingRequest
): Promise<string> {
    const ai = getClient(request.apiKey);

    const prompt = buildProcessingPrompt(
        request.mode,
        request.clothingType,
        request.colorConfig ?? null,
        request.customPrompt
    );

    const mimeType = request.image.match(/data:(image\/\w+);base64/)?.[1] || 'image/jpeg';
    const imageParts: Array<{ inlineData: { data: string; mimeType: string } }> = [
        {
            inlineData: {
                data: request.image.replace(/^data:image\/\w+;base64,/, ''),
                mimeType,
            },
        },
    ];

    // Add reference image if provided for color matching
    if (request.colorConfig?.referenceImage) {
        const refMime = request.colorConfig.referenceImage.match(/data:(image\/\w+);base64/)?.[1] || 'image/jpeg';
        imageParts.push({
            inlineData: {
                data: request.colorConfig.referenceImage.replace(/^data:image\/\w+;base64,/, ''),
                mimeType: refMime,
            },
        });
    }

    const response = await ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: [
            {
                role: 'user',
                parts: [
                    { text: prompt },
                    ...imageParts.map((img) => ({ inlineData: img.inlineData })),
                ],
            },
        ],
        config: {
            responseModalities: ['image', 'text'],
        },
    });

    // Extract generated image from response
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
        throw new Error('No response from Gemini');
    }

    for (const part of parts) {
        if (part.inlineData?.data) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }

    throw new Error('No image generated');
}

/**
 * Generate final scene with AI model (Middle Sidebar -> Right Sidebar)
 */
export async function generateFinalScene(
    request: SceneGenerationRequest
): Promise<string> {
    const ai = getClient(request.apiKey);
    const mimeType = request.sourceImage.match(/data:(image\/\w+);base64/)?.[1] || 'image/png';
    const sourceImagePart = {
        inlineData: {
            data: request.sourceImage.replace(/^data:image\/\w+;base64,/, ''),
            mimeType,
        },
    };

    let prompt = "";
    const parts: any[] = [];

    const environmentPrompt =
        typeof request.environment === 'string'
            ? request.environment
            : request.environment.prompt;

    if (request.modelImage) {
        // --- Custom Model Image Mode (Try-On) ---
        const modelMime = request.modelImage.match(/data:(image\/\w+);base64/)?.[1] || 'image/jpeg';
        const modelImagePart = {
            inlineData: {
                data: request.modelImage.replace(/^data:image\/\w+;base64,/, ''),
                mimeType: modelMime,
            },
        };

        prompt = `You are a professional fashion editor and stylist. 
TASK: Digitally dress the person in the "Model Image" with the clothing shown in the "Clothing Image".

INPUTS:
- Image 1: Clothing/Outfit (Ghost Mannequin or extracted garment)
- Image 2: Model (Target Person)

INSTRUCTIONS:
1. Analyze the clothing in Image 1 (Material, texture, fit, cut).
2. Analyze the person in Image 2 (Pose, body shape, lighting).
3. Generate a photorealistic image of the person from Image 2 wearing the clothing from Image 1.
4. MAINTAIN IDENTITY: The person's face, hair, and body type must look exactly like Image 2.
5. FIT MATCHING: Adapt the clothing naturally to the person's pose and body shape.
6. LIGHTING MATCHING: Ensure the lighting on the clothing matches the scene of Image 2.
7. ENVIRONMENT: ${environmentPrompt ? `Change the background to: ${environmentPrompt}` : 'Keep the original background from Image 2 if possible, or use a neutral studio background.'}

OUTPUT QUALITY:
- Photorealistic, 8k, Ultra-High Definition.
- Perfect fabric rendering and draping.
- No artifacts or unnatural distortions.`;

        // Order: Prompt, Clothing, Model
        parts.push({ text: prompt });
        parts.push(sourceImagePart);
        parts.push(modelImagePart);

    } else if (request.modelPreset) {
        // --- Preset Model Mode (Text-to-Image with Source Control) ---
        const modelDescription = `${request.modelPreset.style} ${request.modelPreset.gender}, ${request.modelPreset.ageRange}, ${request.modelPreset.description}`;

        prompt = buildScenePrompt(modelDescription, environmentPrompt);

        parts.push({ text: prompt });
        parts.push(sourceImagePart);
    } else {
        throw new Error("Missing model configuration");
    }

    const response = await ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: [
            {
                role: 'user',
                parts: parts,
            },
        ],
        config: {
            responseModalities: ['image', 'text'],
        },
    });

    const responseParts = response.candidates?.[0]?.content?.parts;
    if (!responseParts) {
        throw new Error('No response from Gemini');
    }

    for (const part of responseParts) {
        if (part.inlineData?.data) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }

    throw new Error('No image generated');
}

/**
 * Generate a single image from a text prompt (for Script Creator)
 */
export async function generateImageFromPrompt(
    prompt: string,
    referenceImageUrl?: string,
    apiKey?: string
): Promise<string> {
    const ai = getClient(apiKey);
    const parts: Part[] = [{ text: `Masterpiece, Best Quality, 4k, 8k, Ultra-High Definition, Photorealistic. ${prompt}` }];

    if (referenceImageUrl) {
        try {
            // Handle Data URL
            if (referenceImageUrl.startsWith('data:')) {
                const mimeType = referenceImageUrl.match(/data:(image\/\w+);base64/)?.[1] || 'image/jpeg';
                const data = referenceImageUrl.replace(/^data:image\/\w+;base64,/, '');
                parts.push({ inlineData: { mimeType, data } });
            } else {
                // Handle Remote URL (Blob/Public)
                const response = await fetch(referenceImageUrl);
                const blob = await response.blob();
                const base64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                    reader.readAsDataURL(blob);
                });
                parts.push({ inlineData: { mimeType: blob.type, data: base64 } });
            }
            // Enhance prompt to ensure reference usage AND High Quality
            parts[0].text = `REFERENCE IMAGE INCLUDED. You MUST generate the image based on the character in the attached reference image. Maintain exact facial features, hair, age, and clothing style.
            
HIGH QUALITY REQUIREMENT:
Masterpiece, Best Quality, 4k, 8k, Ultra-High Definition, Sharp Focus, Highly Detailed, Photorealistic.

${prompt}`;
        } catch (e) {
            console.warn("Failed to process reference image for generation:", e);
        }
    }

    const response = await ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: [
            {
                role: 'user',
                parts: parts,
            },
        ],
        config: {
            responseModalities: ['image'],
        },
    });

    const responseParts = response.candidates?.[0]?.content?.parts;
    if (!responseParts) {
        throw new Error('No response from Gemini');
    }

    for (const part of responseParts) {
        if (part.inlineData?.data) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }

    throw new Error('No image generated');
}

/**
 * Generate a single video scene image in 9:16 format
 * Used for batch generation of video story scenes
 */
export async function generateVideoScene(
    sourceImage: string,
    modelDescription: string,
    environmentPrompt: string,
    overlayText?: string,
    apiKey?: string
): Promise<string> {
    const ai = getClient(apiKey);

    const prompt = buildVideoScenePrompt(modelDescription, environmentPrompt, overlayText);

    const mimeType = sourceImage.match(/data:(image\/\w+);base64/)?.[1] || 'image/png';
    const response = await ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: [
            {
                role: 'user',
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            data: sourceImage.replace(/^data:image\/\w+;base64,/, ''),
                            mimeType,
                        },
                    },
                ],
            },
        ],
        config: {
            responseModalities: ['image', 'text'],
        },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
        throw new Error('No response from Gemini');
    }

    for (const part of parts) {
        if (part.inlineData?.data) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }

    throw new Error('No image generated');
}


/**
 * Generate KOL clone using Editing Model (Gemini 2.0 Flash)
 * Uses Image-to-Image editing capabilities for high fidelity identity preservation
 */
export async function generateKOLCloneImage(
    prompt: string,
    referenceBase64: string,
    apiKey?: string
): Promise<string> {
    const ai = getClient(apiKey);

    // Handle both Base64 Data URL and Remote URL
    let mimeType = 'image/jpeg';
    let cleanBase64 = '';

    if (referenceBase64.startsWith('http')) {
        // Fetch remote image
        try {
            const response = await fetch(referenceBase64);
            if (!response.ok) throw new Error(`Failed to fetch reference image: ${response.statusText}`);
            const arrayBuffer = await response.arrayBuffer();
            cleanBase64 = Buffer.from(arrayBuffer).toString('base64');
            mimeType = response.headers.get('content-type') || 'image/jpeg';
        } catch (error) {
            console.error('Error fetching reference image:', error);
            throw new Error('Failed to process reference image URL');
        }
    } else {
        // Process Base64
        mimeType = referenceBase64.match(/data:(image\/\w+);base64/)?.[1] || 'image/jpeg';
        cleanBase64 = referenceBase64.replace(/^data:image\/\w+;base64,/, '');
    }

    // Construct parts: IMAGE FIRST, then TEXT
    // This activates the "Editing/Inpainting" mode in Gemini 2.0 Flash
    const parts = [
        {
            inlineData: {
                mimeType,
                data: cleanBase64
            }
        },
        {
            text: `${prompt}\n\nMaintain high fidelity to the original face and features. Photorealistic, 8k, UHD.`
        }
    ];

    const response = await ai.models.generateContent({
        model: EDIT_MODEL,
        contents: [
            {
                role: 'user',
                parts: parts,
            },
        ],
        // No explicit 'responseModalities' config needed for Edit mode typically, 
        // but let's be safe or rely on defaults.
    });

    const responseParts = response.candidates?.[0]?.content?.parts;
    if (!responseParts) {
        throw new Error('No response from Gemini');
    }

    for (const part of responseParts) {
        if (part.inlineData?.data) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }

    throw new Error('No image generated from clone request');
}
