import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations, Language } from './translations';

interface I18nState {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

export const useI18nStore = create<I18nState>()(
    persist(
        (set, get) => ({
            language: 'vi', // Default to Vietnamese as per user preference in previous messages or codebase context
            setLanguage: (lang) => set({ language: lang }),
            t: (key: string) => {
                const { language } = get();
                const keys = key.split('.');
                let value: Record<string, unknown> | string | undefined = translations[language] as Record<string, unknown>;

                for (const k of keys) {
                    if (value && typeof value === 'object' && k in value) {
                        value = value[k as keyof typeof value] as Record<string, unknown> | string | undefined;
                    } else {
                        return key;
                    }
                }

                return typeof value === 'string' ? value : key;
            },
        }),
        {
            name: 'i18n-storage',
            partialize: (state) => ({ language: state.language }), // Only persist language
        }
    )
);
