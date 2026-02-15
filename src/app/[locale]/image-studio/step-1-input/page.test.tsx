
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Step1InputPage from './page';

// Mock dependencies
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

const mockApiKey = 'test-api-key';
vi.mock('@/stores/settingsStore', () => ({
    useSettingsStore: () => ({ apiKey: mockApiKey }),
}));

const mockAddToast = vi.fn();
vi.mock('@/stores/toastStore', () => ({
    useToastStore: () => ({ addToast: mockAddToast }),
}));

vi.mock('@/hooks/useApiKeyEnforcer', () => ({
    useApiKeyEnforcer: () => ({ ApiKeyEnforcer: () => null }),
}));

// Mock Child Components
vi.mock('@/components/image-studio/ImageUploader', () => ({
    default: () => <div data-testid="image-uploader">Uploader</div>
}));

vi.mock('@/components/image-studio/ProcessingConfig', () => ({
    default: () => <div data-testid="processing-config">Config</div>
}));

// Mock Store
const mockSetProcessedSource = vi.fn();
const mockSetIsProcessingSource = vi.fn();

const mockUseImageStudioStore = vi.fn();
vi.mock('@/stores/imageStudioStore', () => ({
    useImageStudioStore: () => mockUseImageStudioStore(),
}));

// Mock Fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Step1InputPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseImageStudioStore.mockReturnValue({
            uploadedImage: null,
            processingMode: 'upscale',
            clothingType: '',
            colorConfig: null,
            customPrompt: '',
            isProcessingSource: false,
            setProcessedSource: mockSetProcessedSource,
            setIsProcessingSource: mockSetIsProcessingSource,
        });
    });

    it('renders correctly', () => {
        render(<Step1InputPage />);
        expect(screen.getByText('input_title')).toBeDefined();
        expect(screen.getByTestId('image-uploader')).toBeDefined();
        expect(screen.getByTestId('processing-config')).toBeDefined();
    });

    it('disables process button when no image uploaded', () => {
        render(<Step1InputPage />);
        const processBtn = screen.getByText('process_btn').closest('button');
        expect(processBtn).toHaveProperty('disabled', true);
    });

    it('enables process button when image is uploaded', () => {
        mockUseImageStudioStore.mockReturnValue({
            uploadedImage: 'base64image',
            processingMode: 'upscale',
            isProcessingSource: false,
            setIsProcessingSource: mockSetIsProcessingSource,
        });

        render(<Step1InputPage />);
        const processBtn = screen.getByText('process_btn').closest('button');
        expect(processBtn).toHaveProperty('disabled', false);
    });

    it('handles image processing success', async () => {
        mockUseImageStudioStore.mockReturnValue({
            uploadedImage: 'base64image',
            processingMode: 'upscale',
            isProcessingSource: false,
            setIsProcessingSource: mockSetIsProcessingSource,
            setProcessedSource: mockSetProcessedSource,
        });

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ result: 'processed-image-url' }),
        });

        render(<Step1InputPage />);
        const processBtn = screen.getByText('process_btn');
        fireEvent.click(processBtn);

        expect(mockSetIsProcessingSource).toHaveBeenCalledWith(true);

        await waitFor(() => {
            expect(mockSetProcessedSource).toHaveBeenCalledWith('processed-image-url');
        });

        expect(mockPush).toHaveBeenCalledWith('/image-studio/step-2-generation');
        expect(mockSetIsProcessingSource).toHaveBeenCalledWith(false);
    });

    it('handles image processing failure', async () => {
        mockUseImageStudioStore.mockReturnValue({
            uploadedImage: 'base64image',
            processingMode: 'upscale',
            isProcessingSource: false,
            setIsProcessingSource: mockSetIsProcessingSource,
        });

        mockFetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'Processing Failed' }),
        });

        // Mock alert
        const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => { });

        render(<Step1InputPage />);
        const processBtn = screen.getByText('process_btn');
        fireEvent.click(processBtn);

        await waitFor(() => {
            expect(mockAlert).toHaveBeenCalledWith('Processing Failed');
        });

        expect(mockSetIsProcessingSource).toHaveBeenCalledWith(false);
    });
});
