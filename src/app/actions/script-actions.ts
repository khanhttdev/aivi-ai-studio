"use server";

import { geminiService } from "@/services/gemini/geminiService";
import { ContentIdea } from "@/lib/gemini/types";

export async function generateSubNichesAction(topic: string, apiKey?: string) {
    return await geminiService.generateSubNiches(topic, [], apiKey);
}

export async function generateIdeasAction(topic: string, images: string[], apiKey?: string) {
    // In a real app, we might upload images to storage here instead of passing base64 heavily
    // But for now, we pass through following the analysis
    return await geminiService.generateIdeas(topic, images, apiKey);
}

export async function generateScriptAction(idea: ContentIdea, apiKey?: string) {
    return await geminiService.generateScript(idea, apiKey);
}

export async function generateImageAction(prompt: string, apiKey?: string) {
    return await geminiService.generateImage(prompt, apiKey);
}
