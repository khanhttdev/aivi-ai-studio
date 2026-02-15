/**
 * Zod validation schemas for API request/response validation.
 * Centralizes all API validation logic.
 */

import { z } from 'zod';

// === Image Generation Schemas ===

// === Image Generation Schemas ===

export const imageProcessingSchema = z.object({
    image: z.string().min(1, 'Image data is required'),
    mode: z.enum(['EXTRACT', 'RECOLOR', 'BATCH']),
    clothingType: z.string().min(1, 'Clothing type is required'),
    apiKey: z.string().optional(),
    colorConfig: z.object({
        referenceImage: z.string().optional(),
        colorName: z.string().optional(),
        colorHex: z.string().optional(),
    }).optional(),
    customPrompt: z.string().optional(),
});

export const sceneGenerationSchema = z.object({
    sourceImage: z.string().min(1, 'Source image is required'),
    modelPreset: z.union([
        z.string(),
        z.object({ id: z.string(), name: z.string().optional() }).passthrough()
    ]).nullable().optional(),
    modelImage: z.string().nullable().optional(),
    environment: z.union([
        z.string(),
        z.object({ id: z.string(), prompt: z.string().optional() }).passthrough()
    ]),
    apiKey: z.string().optional(),
}).refine(data => data.modelPreset || data.modelImage, {
    message: "Either modelPreset or modelImage must be provided",
    path: ["modelPreset"]
});

export const batchSceneSchema = z.object({
    sourceImage: z.string().min(1, 'Source image is required'),
    modelDescription: z.string().min(1, 'Model description is required'),
    scenes: z.array(z.object({
        id: z.string(),
        environmentPrompt: z.string(),
        overlayText: z.string().optional(),
    })).min(1, 'At least one scene is required'),
    apiKey: z.string().optional(),
});

export const kolBaseSchema = z.object({
    prompt: z.string().min(1, 'Prompt is required'),
    apiKey: z.string().optional(),
});

export const kolCloneSchema = z.object({
    prompt: z.string().min(1, 'Prompt is required'),
    referenceImage: z.string().min(1, 'Reference image is required'),
    apiKey: z.string().optional(),
});

// === Text-to-Speech Schemas ===

export const ttsRequestSchema = z.object({
    text: z.string().min(1, 'Text is required'),
    voiceId: z.string().min(1, 'Voice ID is required'),
});

// === Voice Studio Schemas ===

export const voiceStudioSchema = z.object({
    text: z.string().min(1, 'Text is required'),
    voiceName: z.string().min(1, 'Voice name is required'),
    apiKey: z.string().optional(),
});

// === Mei Chat Schema ===

export const meiChatSchema = z.object({
    messages: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
    })).min(1, 'At least one message is required'),
    apiKey: z.string().optional(),
});

// === Video Analyzer Schema ===

export const videoAnalyzeSchema = z.object({
    sourceType: z.enum(['url', 'upload']),
    sourceUrl: z.string().url().optional(),
    videoBase64: z.string().optional(),
    fileName: z.string().optional(),
    locale: z.enum(['vi', 'en']).default('vi'),
}).refine(
    (data) => {
        if (data.sourceType === 'url') return !!data.sourceUrl;
        if (data.sourceType === 'upload') return !!data.videoBase64;
        return false;
    },
    { message: 'Either sourceUrl (for url type) or videoBase64 (for upload type) is required' }
);

// === KOL Profile/Script Schema ===

export const kolPromptSchema = z.object({
    prompt: z.string().min(1, 'Prompt is required'),
    apiKey: z.string().optional(),
    locale: z.enum(['vi', 'en']).default('vi'),
});

// === Helper to validate and return typed result ===

export type ValidationResult<T> =
    | { success: true; data: T }
    | { success: false; error: string };

export function validateRequest<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): ValidationResult<T> {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }

    const errorMessages = result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');

    return { success: false, error: errorMessages };
}
