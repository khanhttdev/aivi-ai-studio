
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Step1ThemePage from './page';
import { KOL_THEMES } from '@/lib/kol/types';

// Mock useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
    useLocale: () => 'vi',
}));

// Mock store
const mockSetSelectedTheme = vi.fn();
const mockSetCustomTheme = vi.fn();
const mockSetChannelPositioning = vi.fn();

const mockUseKOLStudioStore = vi.fn();
vi.mock('@/stores/kolStudioStore', () => ({
    useKOLStudioStore: () => mockUseKOLStudioStore(),
}));

describe('Step1ThemePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default state
        mockUseKOLStudioStore.mockReturnValue({
            selectedTheme: null,
            setSelectedTheme: mockSetSelectedTheme,
            customTheme: '',
            setCustomTheme: mockSetCustomTheme,
            channelPositioning: '',
            setChannelPositioning: mockSetChannelPositioning,
        });
    });

    it('renders all themes correctly', () => {
        render(<Step1ThemePage />);
        KOL_THEMES.forEach((theme) => {
            expect(screen.getByText(theme.nameVi)).toBeDefined();
        });
    });

    it('selects a theme when clicked', () => {
        render(<Step1ThemePage />);
        const firstTheme = KOL_THEMES[0];
        const themeButton = screen.getByText(firstTheme.nameVi);

        fireEvent.click(themeButton);

        expect(mockSetSelectedTheme).toHaveBeenCalledWith(firstTheme);
        expect(mockSetCustomTheme).toHaveBeenCalledWith('');
    });

    it('updates custom theme input', () => {
        render(<Step1ThemePage />);
        const input = screen.getByPlaceholderText('step1.customPlaceholder');

        fireEvent.change(input, { target: { value: 'New Theme' } });

        expect(mockSetCustomTheme).toHaveBeenCalledWith('New Theme');
        expect(mockSetSelectedTheme).toHaveBeenCalledWith(null); // Should clear selected theme
    });

    it('updates channel positioning input', () => {
        render(<Step1ThemePage />);
        const input = screen.getByPlaceholderText('step1.positioningPlaceholder');

        fireEvent.change(input, { target: { value: 'My Positioning' } });

        expect(mockSetChannelPositioning).toHaveBeenCalledWith('My Positioning');
    });

    it('navigates to next step when valid theme is selected', () => {
        mockUseKOLStudioStore.mockReturnValue({
            selectedTheme: KOL_THEMES[0],
            setSelectedTheme: mockSetSelectedTheme,
            customTheme: '',
            setCustomTheme: mockSetCustomTheme,
            channelPositioning: '',
            setChannelPositioning: mockSetChannelPositioning,
        });

        render(<Step1ThemePage />);
        const nextButton = screen.getByText('step1.nextBtn');

        expect(nextButton).toHaveProperty('disabled', false);
        fireEvent.click(nextButton);

        expect(mockPush).toHaveBeenCalledWith('/kol-studio/step-2-profile');
    });

    it('disables next button when no theme is selected', () => {
        render(<Step1ThemePage />);
        const nextButton = screen.getByText('step1.nextBtn');
        expect(nextButton).toHaveProperty('disabled', true);
    });
});
