'use client';

import { X } from "lucide-react";
import { m } from "framer-motion";
import { VoiceSelector } from "@/components/features/story-studio/VoiceSelector";

interface VoiceSettingsPanelProps {
    show: boolean;
    onClose: () => void;
    narratorVoice: string;
    character1Voice: string;
    character2Voice: string;
    character1Name: string;
    character2Name: string;
    onVoiceChange: (narrator: string, char1: string, char2: string) => void;
    t: (key: string) => string;
}

export function VoiceSettingsPanel({
    show,
    onClose,
    narratorVoice,
    character1Voice,
    character2Voice,
    character1Name,
    character2Name,
    onVoiceChange,
    t
}: VoiceSettingsPanelProps) {
    if (!show) return null;

    return (
        <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 right-6 w-80 bg-[var(--bg-secondary)] border border-[var(--border)] shadow-xl rounded-xl p-4 z-50 flex flex-col gap-4"
        >
            <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
                <h3 className="font-bold text-sm">{t('title_voice_settings')}</h3>
                <button onClick={onClose}><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3">
                <div className="space-y-1">
                    <label className="text-xs text-[var(--text-muted)] uppercase">{t('narrator_label')}</label>
                    <VoiceSelector
                        label={t('narrator_label')}
                        value={narratorVoice}
                        onChange={(val) => onVoiceChange(val, character1Voice, character2Voice)}
                    />

                    <VoiceSelector
                        label={character1Name || t('char1_default')}
                        value={character1Voice}
                        onChange={(val) => onVoiceChange(narratorVoice, val, character2Voice)}
                    />

                    <VoiceSelector
                        label={character2Name || t('char2_default')}
                        value={character2Voice}
                        onChange={(val) => onVoiceChange(narratorVoice, character1Voice, val)}
                    />
                </div>
            </div>
        </m.div>
    );
}
