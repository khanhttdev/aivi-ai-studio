/**
 * Video Analyzer - TypeScript Interfaces
 * Phân tích video và tạo prompt cho Grok AI Imagine / Veo 3
 */

// ==================== Core Types ====================

export type AnalysisStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
export type VideoSourceType = 'upload' | 'url';

// ==================== Visual Analysis ====================

export interface VisualAnalysis {
    mainSubjects: string[];           // Chủ thể chính trong video
    colorPalette: string[];           // Bảng màu hex
    lightingStyle: string;            // indoor, outdoor, studio, natural, etc.
    compositionStyle: string;         // centered, rule-of-thirds, dynamic, etc.
    dominantColors: string[];         // Màu chủ đạo
    sceneType: string;                // interview, product, lifestyle, etc.
    visualQuality: number;            // 0-100
}

// ==================== Audio Analysis ====================

export interface AudioAnalysis {
    hasMusicBackground: boolean;
    musicMood: string | null;         // upbeat, calm, dramatic, etc.
    hasVoiceover: boolean;
    voiceoverTone: string | null;     // professional, casual, energetic
    hasSoundEffects: boolean;
    soundEffectTypes: string[];       // whoosh, click, notification, etc.
    overallAudioQuality: number;      // 0-100
}

// ==================== Viral Factors ====================

export interface ViralFactors {
    hookStrength: number;             // 0-100: First 3s impact
    emotionalResonance: number;       // 0-100: Emotional triggers
    pacing: number;                   // 0-100: Rhythm & timing
    uniqueness: number;               // 0-100: Stand-out factor
    shareability: number;             // 0-100: Worth sharing?
    trendAlignment: number;           // 0-100: Current trends fit
    suggestions: string[];            // Improvement tips
}

// ==================== Technical Analysis ====================

export interface TechnicalAnalysis {
    estimatedResolution: string;      // 720p, 1080p, 4K
    aspectRatio: string;              // 16:9, 9:16, 1:1
    stability: number;                // 0-100: Camera stability
    colorGrading: string;             // professional, amateur, raw
    transitionQuality: number;        // 0-100
    overallTechnicalScore: number;    // 0-100
}

// ==================== Scene Breakdown ====================

export interface SceneBreakdown {
    index: number;
    timestampStart: string;           // 00:00
    timestampEnd: string;             // 00:05
    description: string;
    keyElements: string[];
    suggestedImprovement: string;
    viralPotential: number;           // 0-100
}

// ==================== Generated Prompts ====================

export interface GrokImaginePrompts {
    imagePrompt: string;              // Prompt tạo hình ảnh gốc
    motionPrompt: string;             // Prompt chuyển động video
    styleNotes: string;               // Ghi chú về style
    suggestedDuration: number;        // Độ dài khuyến nghị (giây)
}

export interface Veo3Prompts {
    videoPrompt: string;              // Prompt chính cho video
    cameraDirections: string;         // Hướng dẫn camera
    motionGuidance: string;           // Hướng dẫn chuyển động
    audioSuggestions: string;         // Gợi ý âm thanh
}

export interface GeneratedPrompts {
    grokImagine: GrokImaginePrompts;
    veo3: Veo3Prompts;
    enhancementNotes: string[];       // Gợi ý cải tiến chung
    viralTips: string[];              // Tips tăng viral
}

// ==================== Analysis Result ====================

export interface AnalysisResult {
    visual: VisualAnalysis;
    audio: AudioAnalysis;
    viralFactors: ViralFactors;
    technical: TechnicalAnalysis;
    scenes: SceneBreakdown[];
    summary: string;                  // Tóm tắt tổng quan
}

// ==================== Video Analysis Entity ====================

export interface VideoAnalysis {
    id: string;
    userId: string;
    sourceType: VideoSourceType;
    sourceUrl: string;                // URL video hoặc storage path
    title: string;
    durationSeconds: number;
    thumbnailUrl: string | null;
    analysisResult: AnalysisResult | null;
    viralScore: number;               // Điểm viral tổng (0-100)
    generatedPrompts: GeneratedPrompts | null;
    status: AnalysisStatus;
    errorMessage: string | null;
    createdAt: string;
    updatedAt: string;
}

// ==================== Store State ====================

export interface VideoAnalyzerState {
    // Current analysis
    currentAnalysis: VideoAnalysis | null;

    // UI States
    status: AnalysisStatus;
    progress: number;                 // 0-100
    progressMessage: string;
    errorMessage: string | null;

    // Form state
    videoUrl: string;
    videoFile: File | null;
    videoPreviewUrl: string | null;

    // History
    analysisHistory: VideoAnalysis[];
    isLoadingHistory: boolean;

    // Actions
    setVideoUrl: (url: string) => void;
    setVideoFile: (file: File | null) => void;
    setVideoPreviewUrl: (url: string | null) => void;
    setStatus: (status: AnalysisStatus) => void;
    setProgress: (progress: number, message?: string) => void;
    setError: (message: string | null) => void;
    setCurrentAnalysis: (analysis: VideoAnalysis | null) => void;

    // Async actions
    analyzeVideo: (locale?: string) => Promise<void>;
    fetchHistory: () => Promise<void>;
    deleteAnalysis: (id: string) => Promise<void>;

    // Reset
    reset: () => void;
}

// ==================== API Request/Response ====================

export interface AnalyzeVideoRequest {
    sourceType: VideoSourceType;
    sourceUrl?: string;               // For URL type
    videoBase64?: string;             // For upload type
    fileName?: string;
    locale?: string;
}

export interface AnalyzeVideoResponse {
    success: boolean;
    data?: VideoAnalysis;
    error?: string;
}

// ==================== Database Schema (for reference) ====================
/*
CREATE TABLE video_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('upload', 'url')),
  source_url TEXT NOT NULL,
  title TEXT NOT NULL,
  duration_seconds INTEGER,
  thumbnail_url TEXT,
  analysis_result JSONB,
  viral_score INTEGER DEFAULT 0,
  generated_prompts JSONB,
  status TEXT NOT NULL DEFAULT 'processing',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
*/
