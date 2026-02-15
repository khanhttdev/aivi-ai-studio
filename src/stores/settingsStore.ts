import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    apiKey: string;
    avatarUrl: string;
    displayName: string;
    setApiKey: (key: string) => void;
    setAvatarUrl: (url: string) => void;
    setDisplayName: (name: string) => void;
    clearApiKey: () => void;
    hasApiKey: () => boolean;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            apiKey: '',
            avatarUrl: '',
            displayName: '',
            setApiKey: (key: string) => set({ apiKey: key }),
            setAvatarUrl: (url: string) => set({ avatarUrl: url }),
            setDisplayName: (name: string) => set({ displayName: name }),
            clearApiKey: () => set({ apiKey: '' }),
            hasApiKey: () => !!get().apiKey,
        }),
        {
            name: 'aivi-settings-storage',
        }
    )
);
