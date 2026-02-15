import { create } from 'zustand';
import {
    ImageStudioState,
    ProcessingMode,
    ClothingType,
    ColorConfig,
    AIModelPreset,
    EnvironmentPreset,
} from '@/lib/gemini/types';
import { VideoTemplate, GeneratedScene } from '@/lib/templates/videoTemplates';

const initialState = {
    // Left sidebar
    uploadedImage: null,
    processingMode: 'EXTRACT' as ProcessingMode,
    clothingType: 'FULL_OUTFIT' as ClothingType,
    colorConfig: null,
    customPrompt: '',

    // Middle sidebar
    processedSource: null,
    selectedModel: null,
    selectedEnvironment: null,
    customEnvironmentPrompt: '',

    // Right sidebar
    finalResult: null,

    // Loading states
    isProcessingSource: false,
    isGeneratingFinal: false,

    // Video Template state
    generationMode: 'single' as 'single' | 'video',
    selectedTemplate: null as VideoTemplate | null,
    generatedScenes: [] as GeneratedScene[],
    isGeneratingBatch: false,
    batchProgress: 0,
};

export const useImageStudioStore = create<ImageStudioState>((set) => ({
    ...initialState,

    // Actions
    setUploadedImage: (image: string | null) => set({ uploadedImage: image }),
    setProcessingMode: (mode: ProcessingMode) => set({ processingMode: mode }),
    setClothingType: (type: ClothingType) => set({ clothingType: type }),
    setColorConfig: (config: ColorConfig | null) => set({ colorConfig: config }),
    setCustomPrompt: (prompt: string) => set({ customPrompt: prompt }),
    setProcessedSource: (image: string | null) => set({ processedSource: image }),
    setSelectedModel: (model: AIModelPreset | null) => set({ selectedModel: model }),
    setSelectedEnvironment: (env: EnvironmentPreset | null) =>
        set({ selectedEnvironment: env }),
    setCustomEnvironmentPrompt: (prompt: string) =>
        set({ customEnvironmentPrompt: prompt }),
    setFinalResult: (image: string | null) => set({ finalResult: image }),
    setIsProcessingSource: (loading: boolean) => set({ isProcessingSource: loading }),
    setIsGeneratingFinal: (loading: boolean) => set({ isGeneratingFinal: loading }),

    // Video Template actions
    setGenerationMode: (mode: 'single' | 'video') => set({ generationMode: mode }),
    setSelectedTemplate: (template: VideoTemplate | null) => set({ selectedTemplate: template }),
    setGeneratedScenes: (scenes: GeneratedScene[]) => set({ generatedScenes: scenes }),
    setIsGeneratingBatch: (loading: boolean) => set({ isGeneratingBatch: loading }),
    setBatchProgress: (progress: number) => set({ batchProgress: progress }),

    // Navigation
    currentStep: 1,
    setCurrentStep: (step: number) => set({ currentStep: step }),

    reset: () => set(initialState),
}));


// AI Model presets - using placeholder images
export const AI_MODEL_PRESETS: AIModelPreset[] = [
    {
        id: 'asian-female-1',
        name: 'Minh Anh',
        thumbnail: '/images/models/minh_anh.png',
        description: 'Elegant, sophisticated look with natural beauty',
        style: 'asian',
        gender: 'female',
        ageRange: '22-25',
    },
    {
        id: 'asian-female-2',
        name: 'Thu Hà',
        thumbnail: '/images/models/thu_ha.png',
        description: 'Fresh, youthful with bright smile',
        style: 'asian',
        gender: 'female',
        ageRange: '20-24',
    },
    {
        id: 'asian-male-1',
        name: 'Đức Minh',
        thumbnail: '/images/models/duc_minh.png',
        description: 'Modern, stylish Korean-inspired look',
        style: 'asian',
        gender: 'male',
        ageRange: '23-27',
    },
    {
        id: 'western-female-1',
        name: 'Emma',
        thumbnail: '/images/models/emma.png',
        description: 'Classic beauty with confident pose',
        style: 'western',
        gender: 'female',
        ageRange: '22-26',
    },
    {
        id: 'western-male-1',
        name: 'James',
        thumbnail: '/images/models/james.png',
        description: 'Casual, approachable style',
        style: 'western',
        gender: 'male',
        ageRange: '24-28',
    },
    {
        id: 'diverse-female-1',
        name: 'Aisha',
        thumbnail: '/images/models/aisha.png',
        description: 'Bold, fashion-forward aesthetic',
        style: 'diverse',
        gender: 'female',
        ageRange: '21-25',
    },
];

// Environment presets - using gradient placeholders
export const ENVIRONMENT_PRESETS: EnvironmentPreset[] = [
    {
        id: 'studio-white',
        name: 'Studio Trắng',
        thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f8f9fa" width="100" height="100"/></svg>',
        prompt:
            'Professional white studio background with soft box lighting, clean and minimal',
    },
    {
        id: 'cafe',
        name: 'Quán Cà Phê',
        thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%238B4513" width="100" height="100"/></svg>',
        prompt:
            'Cozy modern cafe interior with warm ambient lighting, wooden furniture, and plants',
    },
    {
        id: 'street-urban',
        name: 'Đường Phố',
        thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23555" width="100" height="100"/></svg>',
        prompt:
            'Urban street scene with graffiti walls, natural daylight, city vibe',
    },
    {
        id: 'beach',
        name: 'Bãi Biển',
        thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%2300CED1" width="100" height="100"/></svg>',
        prompt:
            'Beautiful beach at golden hour, soft waves, palm trees in background',
    },
    {
        id: 'garden',
        name: 'Vườn Hoa',
        thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%2390EE90" width="100" height="100"/></svg>',
        prompt:
            'Lush green garden with colorful flowers, soft natural light, romantic atmosphere',
    },
    {
        id: 'rooftop',
        name: 'Sân Thượng',
        thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23FF7F50" width="100" height="100"/></svg>',
        prompt:
            'Modern rooftop with city skyline in background, evening golden hour',
    },
];

// Clothing type labels (Vietnamese)
export const CLOTHING_TYPE_LABELS: Record<ClothingType, string> = {
    FULL_OUTFIT: 'Nguyên bộ (Set)',
    OUTERWEAR: 'Áo khoác',
    TOP: 'Áo (Sơ mi/Thun)',
    BOTTOMS: 'Quần/Váy',
    DRESS: 'Váy liền thân',
    ACCESSORY: 'Phụ kiện (Túi/Giày)',
    JEWELRY: 'Trang sức',
    CUSTOM: 'Tùy chỉnh thủ công',
};

// Processing mode labels (Vietnamese)
export const PROCESSING_MODE_LABELS: Record<ProcessingMode, string> = {
    EXTRACT: 'Tách nền (Ghost Mannequin)',
    RECOLOR: 'Đổi màu thông minh',
    BATCH: 'Xử lý hàng loạt',
};
