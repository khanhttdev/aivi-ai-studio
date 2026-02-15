
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Step4ClonePage from './page';
import { CLONE_CONTEXTS } from '@/lib/kol/types';

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

vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        from: () => ({
            insert: () => ({
                select: () => ({
                    single: async () => ({ data: { id: 'img-1' }, error: null }),
                }),
            }),
        }),
    }),
}));

vi.mock('@/lib/kol/prompts', () => ({
    generateKOLClonePrompt: () => 'clone-prompt',
    IDENTITY_LOCK_SUFFIX: ' IDENTITY_LOCK',
}));

// Mock Store
const mockSetSelectedContexts = vi.fn();
const mockAddGeneratedClone = vi.fn();
const mockSetGeneratedClones = vi.fn();
const mockSetIsGeneratingClone = vi.fn();
const mockSetCloneProgress = vi.fn();

const mockUseKOLStudioStore = vi.fn();
vi.mock('@/stores/kolStudioStore', () => ({
    useKOLStudioStore: () => mockUseKOLStudioStore(),
}));

const baseStoreState = {
    kolProfile: { id: '1', appearance: {}, hobbies: [] },
    baseKOLImage: 'data:image/png;base64,test',
    currentKOL: { id: 'kol-1' },
    selectedContexts: [] as typeof CLONE_CONTEXTS,
    setSelectedContexts: mockSetSelectedContexts,
    generatedClones: [],
    addGeneratedClone: mockAddGeneratedClone,
    setGeneratedClones: mockSetGeneratedClones,
    isGeneratingClone: false,
    setIsGeneratingClone: mockSetIsGeneratingClone,
    cloneProgress: 0,
    setCloneProgress: mockSetCloneProgress,
};

describe('Step4ClonePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseKOLStudioStore.mockReturnValue(baseStoreState);
    });

    it('redirects to step 3 if no base image', () => {
        mockUseKOLStudioStore.mockReturnValue({ ...baseStoreState, baseKOLImage: null, currentKOL: null });
        render(<Step4ClonePage />);
        expect(mockPush).toHaveBeenCalledWith('/kol-studio/step-3-generate');
    });

    it('renders context selection grid', () => {
        render(<Step4ClonePage />);
        CLONE_CONTEXTS.forEach(ctx => {
            expect(screen.getByText(ctx.nameVi)).toBeDefined();
        });
    });

    it('toggles context selection', () => {
        render(<Step4ClonePage />);
        const firstCtx = CLONE_CONTEXTS[0];
        fireEvent.click(screen.getByText(firstCtx.nameVi));
        expect(mockSetSelectedContexts).toHaveBeenCalledWith([firstCtx]);
    });

    it('removes already selected context on click', () => {
        mockUseKOLStudioStore.mockReturnValue({
            ...baseStoreState,
            selectedContexts: [CLONE_CONTEXTS[0]],
        });
        render(<Step4ClonePage />);
        fireEvent.click(screen.getByText(CLONE_CONTEXTS[0].nameVi));
        expect(mockSetSelectedContexts).toHaveBeenCalledWith([]);
    });

    it('shows next button when clones are generated', () => {
        mockUseKOLStudioStore.mockReturnValue({
            ...baseStoreState,
            generatedClones: [{ id: 'clone-1', image_url: 'url', context: 'cafe' }],
        });
        render(<Step4ClonePage />);
        const nextBtn = screen.getByText('step4.nextBtn');
        expect(nextBtn).toBeDefined();
        fireEvent.click(nextBtn);
        expect(mockPush).toHaveBeenCalledWith('/kol-studio/step-5-content');
    });
});
