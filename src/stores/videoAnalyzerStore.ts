import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { indexedDBStorage } from '@/lib/storage';
import {
    VideoAnalyzerState,
    VideoAnalysis,
    AnalysisStatus,
} from '@/lib/video-analyzer/types';
import { supabase } from '@/lib/supabase/client';

const initialState = {
    currentAnalysis: null as VideoAnalysis | null,
    status: 'idle' as AnalysisStatus,
    progress: 0,
    progressMessage: '',
    errorMessage: null as string | null,
    videoUrl: '',
    videoFile: null as File | null,
    videoPreviewUrl: null as string | null,
    analysisHistory: [] as VideoAnalysis[],
    isLoadingHistory: false,
};

export const useVideoAnalyzerStore = create<VideoAnalyzerState>()(
    persist(
        (set, get) => ({
            ...initialState,

            // ==================== Setters ====================

            setVideoUrl: (url) => set({ videoUrl: url }),

            setVideoFile: (file) => {
                if (file) {
                    const previewUrl = URL.createObjectURL(file);
                    set({ videoFile: file, videoPreviewUrl: previewUrl });
                } else {
                    const currentPreview = get().videoPreviewUrl;
                    if (currentPreview) URL.revokeObjectURL(currentPreview);
                    set({ videoFile: null, videoPreviewUrl: null });
                }
            },

            setVideoPreviewUrl: (url) => set({ videoPreviewUrl: url }),

            setStatus: (status) => set({ status }),

            setProgress: (progress, message) => set({
                progress,
                progressMessage: message ?? get().progressMessage
            }),

            setError: (message) => set({
                errorMessage: message,
                status: message ? 'failed' : get().status
            }),

            setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),

            // ==================== Analyze Video ====================

            analyzeVideo: async (locale?: string) => {
                const { videoUrl, videoFile } = get();

                if (!videoUrl && !videoFile) {
                    set({ errorMessage: 'Vui lòng nhập URL hoặc tải lên video' });
                    return;
                }

                set({
                    status: 'uploading',
                    progress: 0,
                    progressMessage: 'Đang chuẩn bị video...',
                    errorMessage: null
                });

                try {
                    // Prepare request body
                    const body: { sourceType: 'upload' | 'url'; locale: string; videoBase64?: string; fileName?: string; sourceUrl?: string } = {
                        sourceType: videoFile ? 'upload' : 'url',
                        locale: locale || 'vi'
                    };

                    if (videoFile) {
                        set({ progress: 10, progressMessage: 'Đang tải video lên...' });
                        // Convert file to base64
                        const reader = new FileReader();
                        const base64 = await new Promise<string>((resolve, reject) => {
                            reader.onload = () => resolve(reader.result as string);
                            reader.onerror = reject;
                            reader.readAsDataURL(videoFile);
                        });
                        body.videoBase64 = base64;
                        body.fileName = videoFile.name;
                    } else {
                        body.sourceUrl = videoUrl;
                    }

                    set({
                        status: 'processing',
                        progress: 30,
                        progressMessage: 'Đang phân tích video với AI...'
                    });

                    // Call API
                    const response = await fetch('/api/video-analyzer/analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body),
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || 'Phân tích thất bại');
                    }

                    set({ progress: 80, progressMessage: 'Đang tạo prompts...' });

                    const result = await response.json();

                    set({
                        status: 'completed',
                        progress: 100,
                        progressMessage: 'Hoàn thành!',
                        currentAnalysis: result.data,
                    });

                    // Refresh history
                    get().fetchHistory();

                } catch (error) {
                    console.error('Analysis error:', error);
                    set({
                        status: 'failed',
                        errorMessage: error instanceof Error ? error.message : 'Đã xảy ra lỗi',
                    });
                }
            },

            // ==================== Fetch History ====================

            fetchHistory: async () => {
                set({ isLoadingHistory: true });

                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) {
                        set({ isLoadingHistory: false });
                        return;
                    }

                    // Define expected row type from database
                    interface VideoAnalysisRow {
                        id: string;
                        user_id: string;
                        source_type: string;
                        source_url: string;
                        title: string;
                        duration_seconds: number | null;
                        thumbnail_url: string | null;
                        analysis_result: unknown;
                        viral_score: number;
                        generated_prompts: unknown;
                        status: string;
                        error_message: string | null;
                        created_at: string;
                        updated_at: string;
                    }

                    const { data, error } = await supabase
                        .from('video_analyses')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(20) as { data: VideoAnalysisRow[] | null; error: unknown };

                    if (error) throw error;

                    // Transform snake_case to camelCase
                    const analyses: VideoAnalysis[] = (data || []).map((row) => ({
                        id: row.id,
                        userId: row.user_id,
                        sourceType: row.source_type as 'upload' | 'url',
                        sourceUrl: row.source_url,
                        title: row.title,
                        durationSeconds: row.duration_seconds ?? 0,
                        thumbnailUrl: row.thumbnail_url,
                        analysisResult: row.analysis_result as VideoAnalysis['analysisResult'],
                        viralScore: row.viral_score,
                        generatedPrompts: row.generated_prompts as VideoAnalysis['generatedPrompts'],
                        status: row.status as VideoAnalysis['status'],
                        errorMessage: row.error_message,
                        createdAt: row.created_at,
                        updatedAt: row.updated_at,
                    }));

                    set({ analysisHistory: analyses, isLoadingHistory: false });

                } catch (error) {
                    console.error('Fetch history error:', error);
                    set({ isLoadingHistory: false });
                }
            },

            // ==================== Delete Analysis ====================

            deleteAnalysis: async (id) => {
                try {
                    const { error } = await supabase
                        .from('video_analyses')
                        .delete()
                        .eq('id', id);

                    if (error) throw error;

                    // Update local state
                    set((state) => ({
                        analysisHistory: state.analysisHistory.filter((a) => a.id !== id),
                        currentAnalysis: state.currentAnalysis?.id === id ? null : state.currentAnalysis,
                    }));

                } catch (error) {
                    console.error('Delete error:', error);
                    throw error;
                }
            },

            // ==================== Reset ====================

            reset: () => {
                const { videoPreviewUrl } = get();
                if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
                set(initialState);
            },
        }),
        {
            name: 'video-analyzer-storage',
            storage: createJSONStorage(() => indexedDBStorage),
            partialize: (state) => ({
                // Only persist history, not current session data
                analysisHistory: state.analysisHistory,
            }),
        }
    )
);
