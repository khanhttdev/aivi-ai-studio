
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Step2ProfilePage from './page';
import { KOL_THEMES } from '@/lib/kol/types';

// Mock dependencies
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
    useLocale: () => 'vi',
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

// Mock Store
const mockSetKOLProfile = vi.fn();
const mockSetKOLName = vi.fn();
const mockSetIsGeneratingProfile = vi.fn();

const mockUseKOLStudioStore = vi.fn();
vi.mock('@/stores/kolStudioStore', () => ({
    useKOLStudioStore: () => mockUseKOLStudioStore(),
}));

// Mock Fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Step2ProfilePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseKOLStudioStore.mockReturnValue({
            selectedTheme: KOL_THEMES[0],
            customTheme: '',
            channelPositioning: '',
            kolProfile: null,
            setKOLProfile: mockSetKOLProfile,
            kolName: '',
            setKOLName: mockSetKOLName,
            isGeneratingProfile: false,
            setIsGeneratingProfile: mockSetIsGeneratingProfile,
        });
    });

    it('redirects to step 1 if no theme is selected', () => {
        mockUseKOLStudioStore.mockReturnValue({
            selectedTheme: null,
            customTheme: '',
        });
        render(<Step2ProfilePage />);
        expect(mockPush).toHaveBeenCalledWith('/kol-studio/step-1-theme');
    });

    it('renders correctly with selected theme', () => {
        render(<Step2ProfilePage />);
        expect(screen.getByText('step2.title')).toBeDefined();
        // Check for generate button
        expect(screen.getByText('step2.generateBtn')).toBeDefined();
    });

    it('handles profile generation success', async () => {
        render(<Step2ProfilePage />);

        const mockResponseData = {
            result: {
                id: '123',
                name: 'Test KOL',
                ageRange: '20-25',
                gender: 'female',
                occupation: 'Model',
                appearance: { faceType: 'Oval', hairStyle: 'Long', hairColor: 'Black', skinTone: 'Fair', bodyType: 'Slim' },
                personality: 'Cheerful',
                fashionStyle: 'Trendy',
                hobbies: ['Fashion', 'Travel'],
            }
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponseData,
        });

        const generateBtn = screen.getByText('step2.generateBtn');
        fireEvent.click(generateBtn);

        expect(mockSetIsGeneratingProfile).toHaveBeenCalledWith(true);

        await waitFor(() => {
            expect(mockSetKOLProfile).toHaveBeenCalledWith(mockResponseData.result);
        });

        expect(mockSetIsGeneratingProfile).toHaveBeenCalledWith(false);
    });

    it('handles profile generation failure', async () => {
        render(<Step2ProfilePage />);

        mockFetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'API Error' }),
        });

        const generateBtn = screen.getByText('step2.generateBtn');
        fireEvent.click(generateBtn);

        await waitFor(() => {
            expect(screen.getByText('API Error')).toBeDefined();
        });
    });

    it('updates KOL name input', () => {
        render(<Step2ProfilePage />);
        const input = screen.getByPlaceholderText('step2.namePlaceholder');
        fireEvent.change(input, { target: { value: 'My KOL' } });
        expect(mockSetKOLName).toHaveBeenCalledWith('My KOL');
    });

    it('enables next button only when profile and name exist', () => {
        mockUseKOLStudioStore.mockReturnValue({
            selectedTheme: KOL_THEMES[0],
            customTheme: '',
            kolProfile: {
                id: '123',
                appearance: { faceType: 'Oval', hairStyle: 'Long', hairColor: 'Black', skinTone: 'Fair', bodyType: 'Slim' },
                hobbies: ['Fashion']
            } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
            kolName: 'My KOL',
            setKOLProfile: mockSetKOLProfile,
            setKOLName: mockSetKOLName,
            isGeneratingProfile: false,
            setIsGeneratingProfile: mockSetIsGeneratingProfile,
        });

        render(<Step2ProfilePage />);
        const nextButton = screen.getByText('step2.nextBtn');
        expect(nextButton).toHaveProperty('disabled', false);

        fireEvent.click(nextButton);
        expect(mockPush).toHaveBeenCalledWith('/kol-studio/step-3-generate');
    });
});
