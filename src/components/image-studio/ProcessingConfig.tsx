'use client';

import { useImageStudioStore } from '@/stores/imageStudioStore';
import { ClothingType, ProcessingMode } from '@/lib/gemini/types';
import { useTranslations } from 'next-intl';

export default function ProcessingConfig() {
    const {
        processingMode,
        setProcessingMode,
        clothingType,
        setClothingType,
        customPrompt,
        setCustomPrompt,
        colorConfig,
        setColorConfig,
    } = useImageStudioStore();
    const t = useTranslations('ImageStudio');

    // Define options using translations
    const processingModeOptions: { value: ProcessingMode; label: string }[] = [
        { value: 'EXTRACT', label: t('processing_modes.EXTRACT') },
        { value: 'RECOLOR', label: t('processing_modes.RECOLOR') },
        // { value: 'BATCH', label: t('processing_modes.BATCH') }, // Hidden for now if not implemented
    ];

    const clothingTypeOptions: { value: ClothingType; label: string }[] = [
        { value: 'FULL_OUTFIT', label: t('clothing_types.FULL_OUTFIT') },
        { value: 'OUTERWEAR', label: t('clothing_types.OUTERWEAR') },
        { value: 'TOP', label: t('clothing_types.TOP') },
        { value: 'BOTTOMS', label: t('clothing_types.BOTTOMS') },
        { value: 'DRESS', label: t('clothing_types.DRESS') },
        { value: 'ACCESSORY', label: t('clothing_types.ACCESSORY') },
        { value: 'JEWELRY', label: t('clothing_types.JEWELRY') },
        { value: 'CUSTOM', label: t('clothing_types.CUSTOM') },
    ];

    return (
        <div className="space-y-4">
            {/* Processing Mode */}
            <div>
                <label className="sidebar-title">{t('config.processing_mode')}</label>
                <select
                    className="select-field"
                    value={processingMode}
                    onChange={(e) => setProcessingMode(e.target.value as ProcessingMode)}
                >
                    {processingModeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Clothing Type */}
            <div>
                <label className="sidebar-title">{t('config.clothing_type')}</label>
                <select
                    className="select-field"
                    value={clothingType}
                    onChange={(e) => setClothingType(e.target.value as ClothingType)}
                >
                    {clothingTypeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Color Config for RECOLOR mode */}
            {processingMode === 'RECOLOR' && (
                <div className="space-y-3">
                    <label className="sidebar-title">{t('config.color_config')}</label>

                    <div>
                        <label className="text-sm text-[var(--text-secondary)] mb-1 block">
                            {t('config.color_name_label')}
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder={t('config.color_name_placeholder')}
                            value={colorConfig?.colorName || colorConfig?.colorHex || ''}
                            onChange={(e) =>
                                setColorConfig({
                                    ...colorConfig,
                                    colorName: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div>
                        <label className="text-sm text-[var(--text-secondary)] mb-1 block">
                            {t('config.reference_image_label')}
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            className="input-field text-sm"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                        setColorConfig({
                                            ...colorConfig,
                                            referenceImage: ev.target?.result as string,
                                        });
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Custom Prompt for CUSTOM clothing type */}
            {clothingType === 'CUSTOM' && (
                <div>
                    <label className="sidebar-title">{t('config.custom_prompt_label')}</label>
                    <textarea
                        className="input-field min-h-[100px] resize-none"
                        placeholder={t('config.custom_prompt_placeholder')}
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                    />
                </div>
            )}


        </div>
    );
}
