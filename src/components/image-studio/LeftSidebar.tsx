'use client';

import { useImageStudioStore } from '@/stores/imageStudioStore';
import ImageUploader from './ImageUploader';
import ProcessingConfig from './ProcessingConfig';
import { Sparkles, Loader2 } from 'lucide-react';

export default function LeftSidebar() {
    const {
        uploadedImage,
        processingMode,
        clothingType,
        colorConfig,
        customPrompt,
        isProcessingSource,
        setProcessedSource,
        setIsProcessingSource,
    } = useImageStudioStore();

    const handleGenerate = async () => {
        if (!uploadedImage) return;

        setIsProcessingSource(true);
        try {
            const response = await fetch('/api/generate-image?type=process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: uploadedImage,
                    mode: processingMode,
                    clothingType,
                    colorConfig: colorConfig || undefined,
                    customPrompt: customPrompt || undefined,
                    apiKey: localStorage.getItem('gemini_api_key') || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to process image');
            }

            setProcessedSource(data.result);
        } catch (error) {
            console.error('Error processing image:', error);
            alert(error instanceof Error ? error.message : 'Lỗi khi xử lý ảnh. Vui lòng thử lại.');
        } finally {
            setIsProcessingSource(false);
        }
    };

    return (
        <aside className="sidebar w-full h-full overflow-y-auto pb-24">
            {/* Header */}
            <div className="sidebar-section">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                    <span className="text-[var(--accent-primary)]">📸</span>
                    Đầu vào
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Upload ảnh người mẫu gốc
                </p>
            </div>

            {/* Upload Area */}
            <div className="sidebar-section">
                <ImageUploader />
            </div>

            {/* Processing Config */}
            <div className="sidebar-section">
                <ProcessingConfig />
            </div>

            {/* Generate Button */}
            <div className="sidebar-section">
                <button
                    onClick={handleGenerate}
                    disabled={!uploadedImage || isProcessingSource}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                >
                    {isProcessingSource ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Đang xử lý...
                        </>
                    ) : (
                        <>
                            <Sparkles size={20} />
                            Generate Source
                        </>
                    )}
                </button>
                <p className="text-xs text-[var(--text-muted)] text-center mt-2">
                    Sử dụng Gemini 3 Pro Image
                </p>
            </div>
        </aside>
    );
}
