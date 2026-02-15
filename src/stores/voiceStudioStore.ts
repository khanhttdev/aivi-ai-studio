import { create } from 'zustand';
import { CATEGORIES, VOICE_PRESETS } from '@/lib/voice-studio/constants';
import { smartSplitText, pcmToWavBlob, mergeWavBlobs, playSuccessSound } from '@/lib/services/voice-studio-service';
import { useSettingsStore } from '@/stores/settingsStore';

// Types
export interface AudioSegment {
    id: string;
    text: string;
    blob: Blob | null;
    url: string | null;
    status: 'pending' | 'processing' | 'completed' | 'error';
    error?: string;
}

export enum AppState {
    IDLE = 'idle',
    PROCESSING = 'processing',
    PAUSED = 'paused',
}

interface VoiceStudioState {
    // Input
    inputText: string;
    selectedCategory: string;
    selectedVoiceId: string;
    speed: number;
    pitch: number;

    // Processing
    appState: AppState;
    segments: AudioSegment[];
    isMerging: boolean;
    prevProgress: number;

    // Actions
    setInputText: (text: string) => void;
    setSelectedCategory: (catId: string) => void;
    setSelectedVoiceId: (voiceId: string) => void;
    setSpeed: (speed: number) => void;
    setPitch: (pitch: number) => void;
    setAppState: (state: AppState) => void;

    // Core actions
    handleGenerate: () => void;
    handleStop: () => void;
    handleClear: () => void;
    handleMergeAndDownload: () => Promise<void>;

    // Segment management
    updateSegment: (id: string, data: Partial<AudioSegment>) => void;
    setSegments: (segments: AudioSegment[]) => void;
    processNextSegment: () => void;

    // Computed
    getProgress: () => number;
    getHasCompletedSegments: () => boolean;
    getCurrentVoice: () => typeof VOICE_PRESETS[0] | undefined;
}

export const useVoiceStudioStore = create<VoiceStudioState>((set, get) => ({
    // Initial state
    inputText: '',
    selectedCategory: CATEGORIES[0].id,
    selectedVoiceId: VOICE_PRESETS.find(v => v.categoryId === CATEGORIES[0].id)?.id || VOICE_PRESETS[0].id,
    speed: 1.0,
    pitch: 0,
    appState: AppState.IDLE,
    segments: [],
    isMerging: false,
    prevProgress: 0,

    // Setters
    setInputText: (inputText) => set({ inputText }),
    setSelectedCategory: (catId) => {
        const firstVoice = VOICE_PRESETS.find(v => v.categoryId === catId);
        set({
            selectedCategory: catId,
            selectedVoiceId: firstVoice?.id || get().selectedVoiceId,
        });
    },
    setSelectedVoiceId: (selectedVoiceId) => set({ selectedVoiceId }),
    setSpeed: (speed) => set({ speed }),
    setPitch: (pitch) => set({ pitch }),
    setAppState: (appState) => set({ appState }),

    // Core actions
    handleGenerate: () => {
        const { inputText, segments } = get();

        // Check if we should RESUME or START NEW
        const hasPending = segments.some(s => s.status === 'pending' || s.status === 'processing');

        if (segments.length > 0 && hasPending) {
            // Resume logic
            set({ appState: AppState.PROCESSING });
            get().processNextSegment();
        } else {
            // New Generation logic
            if (!inputText.trim()) return;

            // Cleanup old blobs to avoid memory leaks
            segments.forEach(s => {
                if (s.url) URL.revokeObjectURL(s.url);
            });

            const textChunks = smartSplitText(inputText);
            const newSegments: AudioSegment[] = textChunks.map(text => ({
                id: crypto.randomUUID(),
                text,
                blob: null,
                url: null,
                status: 'pending' as const,
            }));

            set({
                segments: newSegments,
                appState: AppState.PROCESSING,
                prevProgress: 0
            });

            // Start processing next tick
            setTimeout(() => get().processNextSegment(), 0);
        }
    },

    handleStop: () => set({ appState: AppState.PAUSED }),

    handleClear: () => {
        const { segments } = get();
        // Revoke all blob URLs
        segments.forEach(s => {
            if (s.url) URL.revokeObjectURL(s.url);
        });
        set({
            appState: AppState.IDLE,
            segments: [],
            inputText: '',
            isMerging: false,
            prevProgress: 0,
        });
    },

    handleMergeAndDownload: async () => {
        const { segments } = get();
        const completedSegments = segments.filter(s => s.status === 'completed' && s.blob);
        if (completedSegments.length === 0) return;

        set({ isMerging: true });
        try {
            const blobs = completedSegments.map(s => s.blob!);
            const mergedBlob = await mergeWavBlobs(blobs);
            const url = URL.createObjectURL(mergedBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `AIVI_Voice_Master_${Date.now()}.wav`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error('Error merging audio:', e);
        } finally {
            set({ isMerging: false });
        }
    },

    // Segment management
    updateSegment: (id, data) => {
        set(state => ({
            segments: state.segments.map(s => s.id === id ? { ...s, ...data } : s),
        }));
    },

    setSegments: (segments) => set({ segments }),

    processNextSegment: async () => {
        const { segments, appState, selectedVoiceId } = get();
        if (appState !== AppState.PROCESSING) return;

        // Count active processing
        const activeCount = segments.filter(s => s.status === 'processing').length;
        if (activeCount >= 1) return; // MAX_CONCURRENT_REQUESTS = 1

        // Find next pending segment
        const pendingIndex = segments.findIndex(s => s.status === 'pending');
        if (pendingIndex === -1) {
            // No more pending, check if all done
            const allDone = segments.every(s => s.status === 'completed' || s.status === 'error');
            if (allDone) {
                const progress = get().getProgress();
                const prevProgress = get().prevProgress;
                if (prevProgress < 100 && progress === 100) {
                    playSuccessSound();
                }
                set({ appState: AppState.IDLE, prevProgress: progress });
            }
            return;
        }

        const segment = segments[pendingIndex];
        const voice = VOICE_PRESETS.find(v => v.id === selectedVoiceId);
        if (!voice) return;

        // Mark as processing
        get().updateSegment(segment.id, { status: 'processing' });

        try {
            const response = await fetch('/api/voice-studio/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: segment.text,
                    voiceName: voice.geminiVoiceName,
                    pitch: get().pitch,
                    apiKey: useSettingsStore.getState().apiKey,
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'API request failed');
            }

            const data = await response.json();
            const blob = pcmToWavBlob(data.audio);
            const url = URL.createObjectURL(blob);

            get().updateSegment(segment.id, { status: 'completed', blob, url });
        } catch (error) {
            console.error(`Error generating segment ${segment.id}:`, error);
            get().updateSegment(segment.id, {
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }

        // Process next
        setTimeout(() => get().processNextSegment(), 100);
    },

    // Computed values
    getProgress: () => {
        const { segments } = get();
        if (segments.length === 0) return 0;
        const done = segments.filter(s => s.status === 'completed' || s.status === 'error').length;
        return Math.round((done / segments.length) * 100);
    },

    getHasCompletedSegments: () => {
        return get().segments.some(s => s.status === 'completed');
    },

    getCurrentVoice: () => {
        const { selectedVoiceId } = get();
        return VOICE_PRESETS.find(v => v.id === selectedVoiceId);
    },
}));
