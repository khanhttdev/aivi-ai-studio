// Processing modes
export type ProcessingMode = 'EXTRACT' | 'RECOLOR' | 'BATCH';

// Clothing types for AI optimization
export type ClothingType =
    | 'FULL_OUTFIT'
    | 'OUTERWEAR'
    | 'TOP'
    | 'BOTTOMS'
    | 'DRESS'
    | 'ACCESSORY'
    | 'JEWELRY'
    | 'CUSTOM';

// AI Model presets for scene generation
export interface AIModelPreset {
    id: string;
    name: string;
    thumbnail: string;
    description: string;
    style: 'asian' | 'western' | 'diverse';
    gender: 'male' | 'female' | 'neutral';
    ageRange: string;
}

// Environment/background presets
export interface EnvironmentPreset {
    id: string;
    name: string;
    thumbnail: string;
    prompt: string;
}

// Image processing request
export interface ImageProcessingRequest {
    image: string; // Base64
    mode: ProcessingMode;
    clothingType: ClothingType;
    colorConfig?: ColorConfig;
    customPrompt?: string;
    apiKey?: string;
}

// Color configuration
export interface ColorConfig {
    referenceImage?: string; // Base64
    colorName?: string;
    colorHex?: string;
}

// Scene generation request
export interface SceneGenerationRequest {
    sourceImage: string; // Processed image from step 1
    modelPreset?: AIModelPreset;
    modelImage?: string; // Uploaded custom model image
    environment: EnvironmentPreset | string; // Preset or custom prompt
    apiKey?: string;
}

// Batch scene generation request for Video Templates
export interface BatchSceneRequest {
    sourceImage: string; // Base64 processed image
    modelDescription: string; // AI model description (e.g., "Asian female, 25-30, elegant style")
    scenes: Array<{
        id: string;
        environmentPrompt: string;
        overlayText?: string;
    }>;
    apiKey?: string;
}

// Batch scene generation response
export interface BatchSceneResponse {
    scenes: Array<{
        id: string;
        imageUrl: string; // Base64 or public URL
        status: 'success' | 'error';
        error?: string;
    }>;
    totalGenerated: number;
    totalFailed: number;
}


// Store state types
export interface ImageStudioState {
    // Left sidebar
    uploadedImage: string | null;
    processingMode: ProcessingMode;
    clothingType: ClothingType;
    colorConfig: ColorConfig | null;
    customPrompt: string;

    // Middle sidebar
    processedSource: string | null;
    selectedModel: AIModelPreset | null;
    selectedEnvironment: EnvironmentPreset | null;
    customEnvironmentPrompt: string;

    // Right sidebar
    finalResult: string | null;

    // Loading states
    isProcessingSource: boolean;
    isGeneratingFinal: boolean;

    // Video Template state
    generationMode: 'single' | 'video';
    selectedTemplate: VideoTemplate | null;
    generatedScenes: GeneratedScene[];
    isGeneratingBatch: boolean;
    batchProgress: number;

    // Actions
    setUploadedImage: (image: string | null) => void;
    setProcessingMode: (mode: ProcessingMode) => void;
    setClothingType: (type: ClothingType) => void;
    setColorConfig: (config: ColorConfig | null) => void;
    setCustomPrompt: (prompt: string) => void;
    setProcessedSource: (image: string | null) => void;
    setSelectedModel: (model: AIModelPreset | null) => void;
    setSelectedEnvironment: (env: EnvironmentPreset | null) => void;
    setCustomEnvironmentPrompt: (prompt: string) => void;
    setFinalResult: (image: string | null) => void;
    setIsProcessingSource: (loading: boolean) => void;
    setIsGeneratingFinal: (loading: boolean) => void;

    // Video Template actions
    setGenerationMode: (mode: 'single' | 'video') => void;
    setSelectedTemplate: (template: VideoTemplate | null) => void;
    setGeneratedScenes: (scenes: GeneratedScene[]) => void;
    setIsGeneratingBatch: (loading: boolean) => void;
    setBatchProgress: (progress: number) => void;

    // Navigation
    currentStep: number;
    setCurrentStep: (step: number) => void;
    reset: () => void;
}

// Import types for Video Template
import { VideoTemplate, GeneratedScene } from '@/lib/templates/videoTemplates';


// AIVI Story Types

export interface ContentIdea {
    id: number;
    title: string;
    brief: string;
}

export interface Frame {
    frameId: number;
    description: string;
    dialogue: string;
    speaker: number; // 0: Narrator, 1: Character 1, 2: Character 2
    imagePrompt: string;
    videoPrompt: string;
    policyCheck: string;
}

export interface ScriptResult {
    title: string;
    topic: string;
    scriptDescription: string;
    frames: Frame[];
    suggestedTitles: string[];
    thumbnailPrompts: string[];
}

export interface Cartoon3DResult {
    imageUrl: string;
}

