import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeAndGeneratePrompts } from '@/lib/video-analyzer/analyzer';
import { VideoAnalysis, AnalyzeVideoRequest } from '@/lib/video-analyzer/types';
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit';

export const maxDuration = 60; // Allow up to 60 seconds for video processing

export async function POST(request: NextRequest) {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`video-analyzer:${clientIp}`, RATE_LIMITS.videoAnalysis);
    if (!rateCheck.allowed) {
        return rateLimitResponse(rateCheck);
    }

    try {
        const body: AnalyzeVideoRequest = await request.json();
        const { sourceType, sourceUrl, videoBase64, fileName } = body;

        // Validate input
        if (sourceType === 'url' && !sourceUrl) {
            return NextResponse.json(
                { error: 'URL video là bắt buộc' },
                { status: 400 }
            );
        }

        if (sourceType === 'upload' && !videoBase64) {
            return NextResponse.json(
                { error: 'Video data là bắt buộc' },
                { status: 400 }
            );
        }

        // Get user
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        let videoData = '';
        let mimeType = 'video/mp4';
        let title = fileName || 'Video Analysis';

        if (sourceType === 'upload' && videoBase64) {
            // Extract mime type and data from base64
            const match = videoBase64.match(/^data:(video\/\w+);base64,(.*)$/);
            if (match) {
                mimeType = match[1];
                videoData = match[2];
            } else {
                videoData = videoBase64;
            }
        } else if (sourceType === 'url' && sourceUrl) {
            // For URL, we need to fetch and convert to base64
            // For now, we'll use a placeholder - in production, use a video processing service
            try {
                const response = await fetch(sourceUrl);
                if (!response.ok) throw new Error('Failed to fetch video');

                const blob = await response.blob();
                mimeType = blob.type;

                // Validate content type
                if (mimeType.includes('text/html')) {
                    return NextResponse.json(
                        { error: 'URL này là một trang web, không phải file video. Vui lòng sử dụng Direct Link (.mp4, .webm) hoặc tải file lên trực tiếp.' },
                        { status: 400 }
                    );
                }

                if (!mimeType.startsWith('video/')) {
                    // Fallback to mp4 if undetermined, but risk failure
                    console.warn(`Warning: Unknown content type ${mimeType}, forcing video/mp4`);
                    mimeType = 'video/mp4';
                }

                const buffer = await blob.arrayBuffer();
                videoData = Buffer.from(buffer).toString('base64');

                // Extract title from URL
                const urlParts = sourceUrl.split('/');
                title = urlParts[urlParts.length - 1].split('?')[0] || 'Video from URL';
            } catch (fetchError) {
                console.error('Error fetching video URL:', fetchError);
                return NextResponse.json(
                    { error: 'Không thể tải video từ URL. Vui lòng thử tải lên trực tiếp.' },
                    { status: 400 }
                );
            }
        }

        // Analyze video with AI
        const { analysis, viralScore, prompts } = await analyzeAndGeneratePrompts(
            videoData,
            mimeType,
            body.locale || 'vi'
        );

        // Save to database
        const { data: savedAnalysis, error: dbError } = await supabase
            .from('video_analyses')
            .insert({
                user_id: user.id,
                source_type: sourceType,
                source_url: sourceType === 'url' ? sourceUrl : `upload://${fileName}`,
                title,
                duration_seconds: null, // TODO: Extract from video metadata
                analysis_result: analysis,
                viral_score: viralScore,
                generated_prompts: prompts,
                status: 'completed',
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database error:', dbError);
            // Continue without saving - don't fail the whole request
        }

        // Transform response to camelCase
        const responseData: VideoAnalysis = {
            id: savedAnalysis?.id || crypto.randomUUID(),
            userId: user.id,
            sourceType,
            sourceUrl: sourceType === 'url' ? sourceUrl! : `upload://${fileName}`,
            title,
            durationSeconds: 0,
            thumbnailUrl: null,
            analysisResult: analysis,
            viralScore,
            generatedPrompts: prompts,
            status: 'completed',
            errorMessage: null,
            createdAt: savedAnalysis?.created_at || new Date().toISOString(),
            updatedAt: savedAnalysis?.updated_at || new Date().toISOString(),
        };

        return NextResponse.json({
            success: true,
            data: responseData,
        });

    } catch (error) {
        console.error('Video analysis error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Phân tích thất bại'
            },
            { status: 500 }
        );
    }
}
