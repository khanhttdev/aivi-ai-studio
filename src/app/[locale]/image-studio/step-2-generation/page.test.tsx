
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Step2GenerationPage from './page';

// Mock dependencies
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
    useLocale: () => 'vi',
}));

vi.mock('next/dynamic', () => ({
    default: () => () => <div data-testid="kol-library">KOLLibrary</div>,
}));

vi.mock('next/image', () => ({
    default: (props: Record<string, unknown>) => <img {...props} />,
}));

vi.mock('@/stores/settingsStore', () => ({
    useSettingsStore: () => ({ apiKey: 'test-key' }),
}));

vi.mock('@/hooks/useApiKeyEnforcer', () => ({
    useApiKeyEnforcer: () => ({
        checkApiKey: () => true,
        ApiKeyEnforcer: () => null,
    }),
}));

vi.mock('@/lib/templates/videoTemplates', () => ({
    VIDEO_TEMPLATES: [
        {
            id: 'template-1',
            name: 'Lifestyle',
            nameVi: 'Phong cách sống',
            description: 'Lifestyle template',
            descriptionVi: 'Template phong cách',
            category: 'lifestyle',
            scenes: [
                { id: 's1', order: 1, environmentPrompt: 'cafe', overlayText: 'Scene 1', overlayTextVi: 'Cảnh 1' },
                { id: 's2', order: 2, environmentPrompt: 'park', overlayText: 'Scene 2', overlayTextVi: 'Cảnh 2' },
            ],
        },
    ],
}));

// Mock Store
const mockSetSelectedModel = vi.fn();
const mockSetSelectedEnvironment = vi.fn();
const mockSetCustomEnvironmentPrompt = vi.fn();
const mockSetIsGeneratingFinal = vi.fn();
const mockSetFinalResult = vi.fn();
const mockSetGenerationMode = vi.fn();
const mockSetSelectedTemplate = vi.fn();
const mockSetIsGeneratingBatch = vi.fn();
const mockSetBatchProgress = vi.fn();
const mockSetGeneratedScenes = vi.fn();

const mockUseImageStudioStore = vi.fn();
vi.mock('@/stores/imageStudioStore', () => ({
    useImageStudioStore: () => mockUseImageStudioStore(),
    AI_MODEL_PRESETS: [
        { id: 'model-1', name: 'Model A', thumbnail: '/img/a.jpg', description: 'Asian model', style: 'asian', gender: 'female', ageRange: '20-30' },
    ],
    ENVIRONMENT_PRESETS: [
        { id: 'env-1', name: 'Studio', prompt: 'professional studio' },
        { id: 'env-2', name: 'Street', prompt: 'urban street' },
    ],
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

const baseStoreState = {
    processedSource: 'data:image/png;base64,processed',
    selectedModel: null,
    setSelectedModel: mockSetSelectedModel,
    selectedEnvironment: null,
    setSelectedEnvironment: mockSetSelectedEnvironment,
    customEnvironmentPrompt: '',
    setCustomEnvironmentPrompt: mockSetCustomEnvironmentPrompt,
    isGeneratingFinal: false,
    setIsGeneratingFinal: mockSetIsGeneratingFinal,
    setFinalResult: mockSetFinalResult,
    generationMode: 'single' as const,
    setGenerationMode: mockSetGenerationMode,
    selectedTemplate: null,
    setSelectedTemplate: mockSetSelectedTemplate,
    isGeneratingBatch: false,
    setIsGeneratingBatch: mockSetIsGeneratingBatch,
    setBatchProgress: mockSetBatchProgress,
    setGeneratedScenes: mockSetGeneratedScenes,
};

describe('Step2GenerationPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseImageStudioStore.mockReturnValue(baseStoreState);
    });

    it('redirects to step 1 if no processed source', () => {
        mockUseImageStudioStore.mockReturnValue({ ...baseStoreState, processedSource: null });
        render(<Step2GenerationPage />);
        expect(mockPush).toHaveBeenCalledWith('/image-studio/step-1-input');
    });

    it('renders mode toggle buttons', () => {
        render(<Step2GenerationPage />);
        expect(screen.getByText('page.mode_single')).toBeDefined();
        expect(screen.getByText('page.mode_video')).toBeDefined();
    });

    it('switches to video mode', () => {
        render(<Step2GenerationPage />);
        fireEvent.click(screen.getByText('page.mode_video'));
        expect(mockSetGenerationMode).toHaveBeenCalledWith('video');
    });

    it('renders processed image preview', () => {
        render(<Step2GenerationPage />);
        expect(screen.getByAltText('Processed Source')).toBeDefined();
    });

    it('calls API for single image generation', async () => {
        mockUseImageStudioStore.mockReturnValue({
            ...baseStoreState,
            selectedModel: { id: 'model-1', name: 'Model A' },
            selectedEnvironment: { id: 'env-1', name: 'Studio', prompt: 'studio' },
        });

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ result: 'final-image-url' }),
        });

        render(<Step2GenerationPage />);
        const genBtn = screen.getByText('page.generate_final_btn');
        fireEvent.click(genBtn);

        expect(mockSetIsGeneratingFinal).toHaveBeenCalledWith(true);

        await waitFor(() => {
            expect(mockSetFinalResult).toHaveBeenCalledWith('final-image-url');
        });

        expect(mockPush).toHaveBeenCalledWith('/image-studio/step-3-result');
    });

    it('renders video template grid in video mode', () => {
        mockUseImageStudioStore.mockReturnValue({
            ...baseStoreState,
            generationMode: 'video',
        });

        render(<Step2GenerationPage />);
        expect(screen.getByText('Phong cách sống')).toBeDefined();
    });
});
