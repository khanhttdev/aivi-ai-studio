
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Step3GeneratePage from './page';

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

vi.mock('next/image', () => ({
    default: (props: Record<string, unknown>) => <img {...props} alt="" />, // eslint-disable-line @next/next/no-img-element
}));

// Mock Store
const mockSetBaseKOLImage = vi.fn();
const mockSetIsGeneratingBase = vi.fn();
const mockSetCurrentKOL = vi.fn();

const mockUseKOLStudioStore = vi.fn();
vi.mock('@/stores/kolStudioStore', () => ({
    useKOLStudioStore: () => mockUseKOLStudioStore(),
}));

vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        auth: { getUser: async () => ({ data: { user: { id: 'user-1' } } }) },
        from: () => ({
            insert: () => ({
                select: () => ({
                    single: async () => ({ data: { id: 'kol-1' }, error: null }),
                }),
            }),
        }),
    }),
}));

vi.mock('@/lib/kol/prompts', () => ({
    generateBaseKOLImagePrompt: () => 'test-prompt',
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

const baseStoreState = {
    kolProfile: {
        id: '1',
        appearance: { faceType: 'Oval', hairStyle: 'Long', hairColor: 'Black', skinTone: 'Fair', bodyType: 'Slim' },
        hobbies: ['Fashion'],
    },
    kolName: 'Test KOL',
    selectedTheme: { id: 'fashion' },
    customTheme: '',
    channelPositioning: '',
    baseKOLImage: null,
    setBaseKOLImage: mockSetBaseKOLImage,
    isGeneratingBase: false,
    setIsGeneratingBase: mockSetIsGeneratingBase,
    setCurrentKOL: mockSetCurrentKOL,
};

describe('Step3GeneratePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseKOLStudioStore.mockReturnValue(baseStoreState);
    });

    it('redirects to step 2 if no profile', () => {
        mockUseKOLStudioStore.mockReturnValue({ ...baseStoreState, kolProfile: null, kolName: '' });
        render(<Step3GeneratePage />);
        expect(mockPush).toHaveBeenCalledWith('/kol-studio/step-2-profile');
    });

    it('renders generate button when no base image', () => {
        render(<Step3GeneratePage />);
        expect(screen.getByText('step3.generateBtn')).toBeDefined();
    });

    it('calls API to generate image', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ result: 'generated-image-url' }),
        });

        render(<Step3GeneratePage />);
        fireEvent.click(screen.getByText('step3.generateBtn'));

        expect(mockSetIsGeneratingBase).toHaveBeenCalledWith(true);

        await waitFor(() => {
            expect(mockSetBaseKOLImage).toHaveBeenCalledWith('generated-image-url');
        });
    });

    it('shows loading state during generation', () => {
        mockUseKOLStudioStore.mockReturnValue({ ...baseStoreState, isGeneratingBase: true });
        render(<Step3GeneratePage />);
        expect(screen.getByText('step3.generating')).toBeDefined();
    });

    it('shows image and action buttons after generation', () => {
        mockUseKOLStudioStore.mockReturnValue({ ...baseStoreState, baseKOLImage: 'data:image/png;base64,test' });
        render(<Step3GeneratePage />);
        expect(screen.getByText('step3.regenerate')).toBeDefined();
        expect(screen.getByText('step3.download')).toBeDefined();
        expect(screen.getByText('step3.saveBtn')).toBeDefined();
    });
});
