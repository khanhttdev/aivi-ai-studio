
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Step4Studio from './page';

// Hoist the store mock function
const { mockedUseAiviStoryStore } = vi.hoisted(() => {
    return { mockedUseAiviStoryStore: vi.fn() };
});

// Mock dependencies
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
    }),
}));

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

// Mock UI Components
vi.mock('lucide-react', () => ({
    Loader2: () => <div data-testid="loader">Loader</div>,
    Clapperboard: () => <div data-testid="icon-clapperboard" />,
    Check: () => <div data-testid="icon-check" />,
    Image: () => <div data-testid="icon-image" />,
    Wand2: () => <div data-testid="icon-wand2" />,
    ArrowRight: () => <div data-testid="icon-arrow-right" />,
    Plus: () => <div data-testid="icon-plus" />,
    Mic: () => <div data-testid="icon-mic" />,
    Volume2: () => <div data-testid="icon-volume2" />,
    Settings2: () => <div data-testid="icon-settings" />,
    X: () => <div data-testid="icon-x" />,
    Video: () => <div data-testid="icon-video" />,
}));

vi.mock('./components/ScriptPanel', () => ({
    ScriptPanel: () => <div data-testid="script-panel" />,
}));

vi.mock('./components/VisualBoard', () => ({
    VisualBoard: () => <div data-testid="visual-board" />,
}));

vi.mock('./components/VoiceSettingsPanel', () => ({
    VoiceSettingsPanel: () => <div data-testid="voice-settings-panel" />,
}));

// Mock Custom Hook
const mockUseStoryGeneration = {
    generateFrame: vi.fn(),
    generateVoiceAudio: vi.fn(),
    generateAllFrames: vi.fn(),
    generateAllAudio: vi.fn(),
    saveAndExport: vi.fn(),
};

vi.mock('./hooks/useStoryGeneration', () => ({
    useStoryGeneration: () => mockUseStoryGeneration,
}));

// Mock Store using the hoisted function
vi.mock('@/stores/useAiviStoryStore', () => ({
    useAiviStoryStore: mockedUseAiviStoryStore,
}));

// Define default store state
const defaultStore: Record<string, unknown> = {
    script: null,
    contentIdeas: [],
    selectedIdea: null,
    isGeneratingIdeas: false,
    isGeneratingScript: false,
    setIsGeneratingIdeas: vi.fn(),
    setIsGeneratingScript: vi.fn(),
    setContentIdeas: vi.fn(),
    setSelectedIdea: vi.fn(),
    character1: { image: 'char1.png', role: 'hero' },
    character2: { image: 'char2.png', role: 'villain' },
    mainTopic: 'Test Topic',
    // Mock other used functions/state
    saveStory: vi.fn(),
    isSaving: false,
    backgroundRef: null,
    setBackgroundRef: vi.fn(),
    setGeneratingScene: vi.fn(),
    setSceneImage: vi.fn(),
    setGeneratingAudio: vi.fn(),
    setSceneAudio: vi.fn(),
    narratorVoice: 'voice1',
    character1Voice: 'voice2',
    character2Voice: 'voice3',
    selectedPlot: 'plot',
};

describe('Step4Studio Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseAiviStoryStore.mockReturnValue(defaultStore);
    });

    it('renders loading state when generating ideas', () => {
        const state = {
            ...defaultStore,
            isGeneratingIdeas: true,
            contentIdeas: [],
        };
        mockedUseAiviStoryStore.mockReturnValue(state);

        render(<Step4Studio />);
        expect(screen.getByText('analyzing')).toBeDefined();
        expect(screen.getByTestId('loader')).toBeDefined();
    });

    it('renders idea selection when ideas are present', () => {
        const ideas = [
            { id: 1, title: 'Idea 1', brief: 'Brief 1' },
            { id: 2, title: 'Idea 2', brief: 'Brief 2' },
        ];
        mockedUseAiviStoryStore.mockReturnValue({
            ...defaultStore,
            contentIdeas: ideas,
            isGeneratingIdeas: false,
            selectedIdea: null,
        });

        render(<Step4Studio />);
        expect(screen.getByText('choose_concept')).toBeDefined();
        expect(screen.getByText('Idea 1')).toBeDefined();
    });

    it('renders loading script state when script is generating', () => {
        mockedUseAiviStoryStore.mockReturnValue({
            ...defaultStore,
            contentIdeas: [],
            isGeneratingIdeas: false,
            selectedIdea: { id: 1 },
            isGeneratingScript: true,
            script: null,
        });

        render(<Step4Studio />);
        expect(screen.getByText('writing_script')).toBeDefined();
    });

    it('renders main specific studio components when script is ready', () => {
        mockedUseAiviStoryStore.mockReturnValue({
            ...defaultStore,
            contentIdeas: [],
            isGeneratingIdeas: false,
            selectedIdea: { id: 1 },
            isGeneratingScript: false,
            script: { frames: [] },
        });

        render(<Step4Studio />);
        expect(screen.getByTestId('script-panel')).toBeDefined();
        expect(screen.getByTestId('visual-board')).toBeDefined();
        expect(screen.getByTestId('voice-settings-panel')).toBeDefined();
    });
});
