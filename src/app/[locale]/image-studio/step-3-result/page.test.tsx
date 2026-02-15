
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Step3ResultPage from './page';

// Mock dependencies
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
    useLocale: () => 'vi',
}));

vi.mock('next/image', () => ({
    default: (props: Record<string, unknown>) => <img {...props} />,
}));

vi.mock('@/lib/services/videoExport', () => ({
    exportSlideshowVideo: vi.fn(),
    downloadVideo: vi.fn(),
}));

// Mock Store
const mockSetFinalResult = vi.fn();
const mockSetGeneratedScenes = vi.fn();
const mockReset = vi.fn();

const mockUseImageStudioStore = vi.fn();
vi.mock('@/stores/imageStudioStore', () => ({
    useImageStudioStore: () => mockUseImageStudioStore(),
}));

const singleModeState = {
    finalResult: 'data:image/png;base64,result',
    setFinalResult: mockSetFinalResult,
    generatedScenes: [],
    setGeneratedScenes: mockSetGeneratedScenes,
    reset: mockReset,
};

const videoModeState = {
    finalResult: null,
    setFinalResult: mockSetFinalResult,
    generatedScenes: [
        { id: 's1', order: 1, imageUrl: 'scene-1-url', overlayText: 'Scene 1' },
        { id: 's2', order: 2, imageUrl: 'scene-2-url', overlayText: 'Scene 2' },
        { id: 's3', order: 3, imageUrl: 'scene-3-url', overlayText: 'Scene 3' },
    ],
    setGeneratedScenes: mockSetGeneratedScenes,
    reset: mockReset,
};

describe('Step3ResultPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock window event listeners
        window.addEventListener = vi.fn();
        window.removeEventListener = vi.fn();
    });

    describe('Single Image Mode', () => {
        beforeEach(() => {
            mockUseImageStudioStore.mockReturnValue(singleModeState);
        });

        it('renders final result image', () => {
            render(<Step3ResultPage />);
            expect(screen.getByAltText('Final Result')).toBeDefined();
        });

        it('renders download button', () => {
            render(<Step3ResultPage />);
            expect(screen.getByText('download_high_res')).toBeDefined();
        });

        it('renders new creation button', () => {
            render(<Step3ResultPage />);
            expect(screen.getByText('new_creation')).toBeDefined();
        });
    });

    describe('Video Mode', () => {
        beforeEach(() => {
            mockUseImageStudioStore.mockReturnValue(videoModeState);
        });

        it('renders slideshow with scenes', () => {
            render(<Step3ResultPage />);
            // Should show slide counter
            expect(screen.getByText('1 / 3')).toBeDefined();
        });

        it('renders video badge', () => {
            render(<Step3ResultPage />);
            expect(screen.getByText('Video Story')).toBeDefined();
        });
    });

    describe('Redirects', () => {
        it('redirects to step 2 when no result', () => {
            mockUseImageStudioStore.mockReturnValue({
                ...singleModeState,
                finalResult: null,
                generatedScenes: [],
            });
            render(<Step3ResultPage />);
            expect(mockPush).toHaveBeenCalledWith('/image-studio/step-2-generation');
        });
    });
});
