/**
 * Video Analyzer - AI Analysis & Prompt Generation
 * Uses Gemini multimodal to analyze video content
 */

import { GoogleGenAI } from '@google/genai';
import {
    AnalysisResult,
    VisualAnalysis,
    AudioAnalysis,
    ViralFactors,
    TechnicalAnalysis,
    SceneBreakdown,
    GeneratedPrompts,
    GrokImaginePrompts,
    Veo3Prompts,
} from './types';

const TEXT_MODEL = 'gemini-3-flash-preview';

const getClient = () => {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY is missing');
    return new GoogleGenAI({ apiKey: key });
};

/**
 * Main analysis prompt for video understanding
 */
const VIDEO_ANALYSIS_PROMPT = `You are an expert video analyst specializing in viral content optimization.

Analyze the provided video and return a DETAILED JSON analysis with the following structure:

{
  "visual": {
    "mainSubjects": ["list of main subjects/objects in the video"],
    "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
    "lightingStyle": "indoor/outdoor/studio/natural/dramatic/etc",
    "compositionStyle": "centered/rule-of-thirds/dynamic/symmetrical/etc",
    "dominantColors": ["top 3 most prominent colors"],
    "sceneType": "interview/product/lifestyle/action/narrative/etc",
    "visualQuality": 0-100
  },
  "audio": {
    "hasMusicBackground": true/false,
    "musicMood": "upbeat/calm/dramatic/energetic/null if no music",
    "hasVoiceover": true/false,
    "voiceoverTone": "professional/casual/energetic/null if no voiceover",
    "hasSoundEffects": true/false,
    "soundEffectTypes": ["whoosh", "click", etc],
    "overallAudioQuality": 0-100
  },
  "viralFactors": {
    "hookStrength": 0-100 (how captivating are the first 3 seconds?),
    "emotionalResonance": 0-100 (does it trigger emotions: joy, surprise, curiosity?),
    "pacing": 0-100 (is the rhythm engaging? not too slow, not too rushed?),
    "uniqueness": 0-100 (how different is this from typical content?),
    "shareability": 0-100 (would people want to share this?),
    "trendAlignment": 0-100 (does it match current social media trends?),
    "suggestions": ["specific actionable tips to improve viral potential"]
  },
  "technical": {
    "estimatedResolution": "720p/1080p/4K",
    "aspectRatio": "16:9/9:16/1:1/4:5",
    "stability": 0-100,
    "colorGrading": "professional/amateur/raw",
    "transitionQuality": 0-100,
    "overallTechnicalScore": 0-100
  },
  "scenes": [
    {
      "index": 1,
      "timestampStart": "00:00",
      "timestampEnd": "00:03",
      "description": "what happens in this scene",
      "keyElements": ["element1", "element2"],
      "suggestedImprovement": "how to make this scene better",
      "viralPotential": 0-100
    }
  ],
  "summary": "A comprehensive 2-3 sentence summary of the video's strengths and areas for improvement"
}

IMPORTANT:
- Be specific and actionable in your suggestions
- Focus on VIRAL POTENTIAL and engagement metrics
- Score conservatively - 70+ should be genuinely good
- Identify the "hook" moment and how effective it is
- Note any missed opportunities for viral elements

Return ONLY valid JSON, no markdown or explanations.`;

/**
 * Prompt generation for Grok AI Imagine & Veo 3
 */
const PROMPT_GENERATION_TEMPLATE = `Based on this video analysis, generate enhancement prompts:

ANALYSIS:
{analysis}

Generate prompts to recreate/enhance this video with these tools:

1. **GROK AI IMAGINE** (Image-to-Video):
   - imagePrompt: Describe the perfect starting frame/image optimized for motion
   - motionPrompt: Describe camera movement, subject motion, speed, transitions
   - styleNotes: Visual style guidance
   - suggestedDuration: Recommended length in seconds

2. **VEO 3** (Text-to-Video):
   - videoPrompt: Complete video description
   - cameraDirections: Specific camera movements
   - motionGuidance: Subject and scene motion details  
   - audioSuggestions: Music and sound recommendations

3. **Enhancement Notes**: List 3-5 specific improvements over the original
4. **Viral Tips**: List 3-5 specific tips to make this go viral

Return as JSON:
{
  "grokImagine": {
    "imagePrompt": "...",
    "motionPrompt": "...",
    "styleNotes": "...",
    "suggestedDuration": 8
  },
  "veo3": {
    "videoPrompt": "...",
    "cameraDirections": "...",
    "motionGuidance": "...",
    "audioSuggestions": "..."
  },
  "enhancementNotes": ["note1", "note2", ...],
  "viralTips": ["tip1", "tip2", ...]
}

Make prompts:
- SPECIFIC and detailed
- Optimized for viral engagement
- Include the first 3 second HOOK
- Match the original's strengths while fixing weaknesses

Return ONLY valid JSON.`;

/**
 * Helper to normalize MIME types for Gemini compatibility
 */
function normalizeMimeType(mimeType: string): string {
    // Gemini prefers standard MIME types
    if (mimeType === 'video/quicktime') return 'video/mp4'; // Treat .mov as mp4
    if (mimeType.includes('x-matroska')) return 'video/webm';
    return mimeType;
}

/**
 * Analyze video content using Gemini
 */
export async function analyzeVideoContent(
    videoBase64: string,
    mimeType: string = 'video/mp4',
    locale: string = 'vi'
): Promise<AnalysisResult> {
    const ai = getClient();
    const cleanMimeType = normalizeMimeType(mimeType);

    // Ensure no header in data
    const cleanData = videoBase64.replace(/^data:video\/\w+;base64,/, '');

    console.log(`Analyzing video with model: ${TEXT_MODEL}, MimeType: ${cleanMimeType}`);

    const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: [
            {
                role: 'user',
                parts: [
                    { text: VIDEO_ANALYSIS_PROMPT + `\n\nANSWER IN THE FOLLOWING LANGUAGE: ${locale === 'vi' ? 'VIETNAMESE' : 'ENGLISH'}. Ensure all descriptions, summaries, and suggestions are in this language.` },
                    {
                        inlineData: {
                            data: cleanData,
                            mimeType: cleanMimeType,
                        },
                    },
                ],
            },
        ],
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No analysis response from Gemini');

    // Parse JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/({[\s\S]*})/);
    if (!jsonMatch) throw new Error('Failed to parse analysis JSON');

    const parsed = JSON.parse(jsonMatch[1]);

    return {
        visual: parsed.visual as VisualAnalysis,
        audio: parsed.audio as AudioAnalysis,
        viralFactors: parsed.viralFactors as ViralFactors,
        technical: parsed.technical as TechnicalAnalysis,
        scenes: parsed.scenes as SceneBreakdown[],
        summary: parsed.summary,
    };
}

/**
 * Calculate overall viral score from factors
 */
export function calculateViralScore(factors: ViralFactors): number {
    // Weighted average with higher emphasis on hook and shareability
    const weights = {
        hookStrength: 0.25,
        emotionalResonance: 0.20,
        pacing: 0.15,
        uniqueness: 0.15,
        shareability: 0.15,
        trendAlignment: 0.10,
    };

    return Math.round(
        factors.hookStrength * weights.hookStrength +
        factors.emotionalResonance * weights.emotionalResonance +
        factors.pacing * weights.pacing +
        factors.uniqueness * weights.uniqueness +
        factors.shareability * weights.shareability +
        factors.trendAlignment * weights.trendAlignment
    );
}

/**
 * Generate prompts for Grok AI Imagine and Veo 3
 */
export async function generateEnhancementPrompts(
    analysis: AnalysisResult,
    locale: string = 'vi'
): Promise<GeneratedPrompts> {
    const ai = getClient();

    const basePrompt = PROMPT_GENERATION_TEMPLATE + `\n\nANSWER IN THE FOLLOWING LANGUAGE: ${locale === 'vi' ? 'VIETNAMESE' : 'ENGLISH'}. All generated prompts, notes, and tips must be in this language.`;
    const prompt = basePrompt.replace('{analysis}', JSON.stringify(analysis, null, 2));

    const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No prompt generation response');

    // Parse JSON
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/({[\s\S]*})/);
    if (!jsonMatch) throw new Error('Failed to parse prompts JSON');

    const parsed = JSON.parse(jsonMatch[1]);

    return {
        grokImagine: parsed.grokImagine as GrokImaginePrompts,
        veo3: parsed.veo3 as Veo3Prompts,
        enhancementNotes: parsed.enhancementNotes || [],
        viralTips: parsed.viralTips || [],
    };
}

/**
 * Full analysis pipeline
 */
export async function analyzeAndGeneratePrompts(
    videoBase64: string,
    mimeType: string = 'video/mp4',
    locale: string = 'vi'
): Promise<{
    analysis: AnalysisResult;
    viralScore: number;
    prompts: GeneratedPrompts;
}> {
    // Step 1: Analyze video content
    const analysis = await analyzeVideoContent(videoBase64, mimeType, locale);

    // Step 2: Calculate viral score
    const viralScore = calculateViralScore(analysis.viralFactors);

    // Step 3: Generate enhancement prompts
    const prompts = await generateEnhancementPrompts(analysis, locale);

    return { analysis, viralScore, prompts };
}
