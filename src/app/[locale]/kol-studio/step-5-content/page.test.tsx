
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Step5ContentPage from './page';

// Mock dependencies
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
    useLocale: () => 'vi',
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

vi.mock('@/lib/kol/prompts', () => ({
    generateTikTokScriptPrompt: () => 'tiktok-prompt',
}));

// Mock Store
const mockSetGeneratedScript = vi.fn();
const mockSetIsGeneratingScript = vi.fn();

const mockUseKOLStudioStore = vi.fn();
vi.mock('@/stores/kolStudioStore', () => ({
    useKOLStudioStore: () => mockUseKOLStudioStore(),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

const baseStoreState = {
    kolProfile: { id: '1', appearance: {}, hobbies: [] },
    selectedTheme: { id: 'fashion', nameVi: 'Thời trang' },
    customTheme: '',
    generatedScript: null,
    setGeneratedScript: mockSetGeneratedScript,
    isGeneratingScript: false,
    setIsGeneratingScript: mockSetIsGeneratingScript,
};

describe('Step5ContentPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseKOLStudioStore.mockReturnValue(baseStoreState);
    });

    it('redirects to step 2 if no profile', () => {
        mockUseKOLStudioStore.mockReturnValue({ ...baseStoreState, kolProfile: null });
        render(<Step5ContentPage />);
        expect(mockPush).toHaveBeenCalledWith('/kol-studio/step-2-profile');
    });

    it('renders topic input and quick suggestions', () => {
        render(<Step5ContentPage />);
        expect(screen.getByPlaceholderText(/Ví dụ/)).toBeDefined();
        expect(screen.getByText('Phối đồ công sở')).toBeDefined();
        expect(screen.getByText('OOTD cuối tuần')).toBeDefined();
    });

    it('fills topic from quick suggestion', () => {
        render(<Step5ContentPage />);
        fireEvent.click(screen.getByText('Tips làm đẹp'));
        // The input should now have the suggestion value (component uses useState internally)
        const input = screen.getByPlaceholderText(/Ví dụ/) as HTMLInputElement;
        expect(input.value).toBe('Tips làm đẹp');
    });

    it('generates script on button click', async () => {
        const mockScript = {
            hook: 'Test hook',
            body: 'Test body',
            cta: 'Test CTA',
            voiceTone: 'Confident',
            duration: 30,
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ result: mockScript }),
        });

        render(<Step5ContentPage />);
        const input = screen.getByPlaceholderText(/Ví dụ/) as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'Test Topic' } });

        const genBtn = screen.getByText('Viết Kịch Bản TikTok');
        fireEvent.click(genBtn);

        expect(mockSetIsGeneratingScript).toHaveBeenCalledWith(true);

        await waitFor(() => {
            expect(mockSetGeneratedScript).toHaveBeenCalledWith(mockScript);
        });
    });

    it('displays generated script sections', () => {
        mockUseKOLStudioStore.mockReturnValue({
            ...baseStoreState,
            generatedScript: {
                hook: 'Hook text',
                body: 'Body text',
                cta: 'CTA text',
                voiceTone: 'Energetic',
                duration: 60,
            },
        });

        render(<Step5ContentPage />);
        expect(screen.getByText('Hook text')).toBeDefined();
        expect(screen.getByText('Body text')).toBeDefined();
        expect(screen.getByText('CTA text')).toBeDefined();
        expect(screen.getByText('Xuất Kết Quả')).toBeDefined();
    });

    it('navigates to export page', () => {
        mockUseKOLStudioStore.mockReturnValue({
            ...baseStoreState,
            generatedScript: { hook: 'h', body: 'b', cta: 'c', voiceTone: 'v', duration: 30 },
        });

        render(<Step5ContentPage />);
        fireEvent.click(screen.getByText('Xuất Kết Quả'));
        expect(mockPush).toHaveBeenCalledWith('/kol-studio/step-6-export');
    });
});
