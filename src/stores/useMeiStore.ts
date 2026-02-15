import { create } from 'zustand';

export interface Message {
    id: string;
    role: 'user' | 'model';
    content: string;
    timestamp: number;
}

interface MeiState {
    isOpen: boolean;
    messages: Message[];
    isLoading: boolean;
    toggle: () => void;
    addMessage: (role: 'user' | 'model', content: string) => void;
    setLoading: (loading: boolean) => void;
    clearMessages: () => void;
}

export const useMeiStore = create<MeiState>((set) => ({
    isOpen: false,
    messages: [
        {
            id: 'welcome',
            role: 'model',
            content: "Hế lô! Mei nè ✨. Cần giúp gì hô lên nha, đừng ngại! 😘",
            timestamp: Date.now(),
        }
    ],
    isLoading: false,
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    addMessage: (role, content) => set((state) => ({
        messages: [...state.messages, {
            id: Math.random().toString(36).substring(7),
            role,
            content,
            timestamp: Date.now(),
        }]
    })),
    setLoading: (loading) => set({ isLoading: loading }),
    clearMessages: () => set({
        messages: [{
            id: 'welcome',
            role: 'model',
            content: "Hế lô! Mei nè ✨. Cần giúp gì hô lên nha, đừng ngại! 😘",
            timestamp: Date.now(),
        }]
    }),
}));
