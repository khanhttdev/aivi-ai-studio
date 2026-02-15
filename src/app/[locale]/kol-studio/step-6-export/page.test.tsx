
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Step6ExportPage from './page';

// Mock dependencies
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
    useLocale: () => 'vi',
}));

vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

vi.mock('next/image', () => ({
    default: (props: Record<string, unknown>) => <img {...props} alt="" />, // eslint-disable-line @next/next/no-img-element
}));

vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        auth: { getUser: async () => ({ data: { user: null } }) },
    }),
}));

vi.mock('@/lib/services/videoExport', () => ({
    exportSlideshowVideo: vi.fn(),
    downloadVideo: vi.fn(),
}));

// Mock Store
const mockReset = vi.fn();
const mockAddSavedKOL = vi.fn();
const mockUpdateSavedKOL = vi.fn();
const mockSetCurrentKOL = vi.fn();

const mockUseKOLStudioStore = vi.fn();
vi.mock('@/stores/kolStudioStore', () => ({
    useKOLStudioStore: () => mockUseKOLStudioStore(),
}));

const baseStoreState = {
    kolName: 'Test KOL',
    baseKOLImage: 'data:image/png;base64,test',
    generatedClones: [
        { id: 'clone-1', image_url: 'clone-1-url', context: 'cafe', created_at: new Date().toISOString() },
        { id: 'clone-2', image_url: 'clone-2-url', context: 'studio', created_at: new Date().toISOString() },
    ],
    generatedScript: {
        hook: 'Hook text',
        body: 'Body text',
        cta: 'CTA text',
        voiceTone: 'Confident',
        duration: 30,
    },
    reset: mockReset,
    addSavedKOL: mockAddSavedKOL,
    updateSavedKOL: mockUpdateSavedKOL,
    currentKOL: null,
    setCurrentKOL: mockSetCurrentKOL,
    kolProfile: { id: '1' },
    selectedTheme: { id: 'fashion' },
    channelPositioning: '',
};

describe('Step6ExportPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseKOLStudioStore.mockReturnValue(baseStoreState);
    });

    it('redirects to step 3 if no base image', () => {
        mockUseKOLStudioStore.mockReturnValue({ ...baseStoreState, baseKOLImage: null });
        render(<Step6ExportPage />);
        expect(mockPush).toHaveBeenCalledWith('/kol-studio/step-3-generate');
    });

    it('renders completion title', () => {
        render(<Step6ExportPage />);
        expect(screen.getByText('step6.title')).toBeDefined();
    });

    it('displays KOL name', () => {
        render(<Step6ExportPage />);
        expect(screen.getByText('Test KOL')).toBeDefined();
    });

    it('shows script preview when available', () => {
        render(<Step6ExportPage />);
        expect(screen.getByText('Hook text')).toBeDefined();
        expect(screen.getByText('CTA text')).toBeDefined();
    });

    it('resets and navigates on new KOL click', () => {
        render(<Step6ExportPage />);
        fireEvent.click(screen.getByText('Tạo KOL mới'));
        expect(mockReset).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/kol-studio/step-1-theme');
    });

    it('shows slideshow with all images (base + clones)', () => {
        render(<Step6ExportPage />);
        // Should show slide counter: 1/3 (base + 2 clones)
        expect(screen.getByText('1 / 3')).toBeDefined();
    });
});
