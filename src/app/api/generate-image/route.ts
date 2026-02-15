import { NextRequest, NextResponse } from 'next/server';
import { processSourceImage, generateFinalScene, generateVideoScene } from '@/lib/gemini/client';
import { BatchSceneRequest, BatchSceneResponse, ImageProcessingRequest, SceneGenerationRequest } from '@/lib/gemini/types';
import { createClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit';
import { validateRequest, imageProcessingSchema, sceneGenerationSchema } from '@/lib/validations/schemas';

async function uploadToStorage(supabase: SupabaseClient, base64Data: string, folder: string) {
    const buffer = Buffer.from(base64Data, 'base64');
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
    const { error } = await supabase.storage
        .from('images')
        .upload(fileName, buffer, { contentType: 'image/png' });

    if (error) {
        console.error('Upload Error:', error);
        return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
    return { path: fileName, publicUrl };
}

export async function POST(request: NextRequest) {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`generate-image:${clientIp}`, RATE_LIMITS.imageGeneration);
    if (!rateCheck.allowed) {
        return rateLimitResponse(rateCheck);
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    try {
        const body = await request.json();
        const type = request.nextUrl.searchParams.get('type');

        if (type === 'process') {
            const validation = validateRequest(imageProcessingSchema, body);
            if (!validation.success) {
                return NextResponse.json(
                    { error: validation.error },
                    { status: 400 }
                );
            }
            // Type is validated by Zod schema, safe to cast
            const request = validation.data as ImageProcessingRequest;

            const processedImage = await processSourceImage(request);

            // If authenticated, save to history (optional for intermediate step?)
            // Let's save it so user can reuse processed assets
            if (user) {
                const upload = await uploadToStorage(supabase, processedImage, 'processed');
                if (upload) {
                    // We could save a project here, but 'process' is usually part of a workflow.
                    // For now just return the base64 as before, maybe return the URL too?
                    // Changing return structure might break frontend. 
                    // Let's stick to returning base64 for compatibility, but we *could* side-effect save.
                }
            }

            return NextResponse.json({ result: processedImage });
        }

        if (type === 'scene') {
            const validation = validateRequest(sceneGenerationSchema, body);
            if (!validation.success) {
                return NextResponse.json(
                    { error: validation.error },
                    { status: 400 }
                );
            }
            // Type is validated by Zod schema, safe to cast
            const request = validation.data as unknown as SceneGenerationRequest;

            const finalImage = await generateFinalScene(request);

            // SAVE HISTORY
            if (user) {
                try {
                    // 1. Upload Result
                    const resultUpload = await uploadToStorage(supabase, finalImage, 'results');

                    if (resultUpload) {
                        // 2. Create Project
                        const { data: project } = await supabase.from('projects').insert({
                            name: `Scene ${new Date().toLocaleString()}`,
                            user_id: user.id,
                            type: 'image',
                            status: 'completed',
                            metadata: {
                                model: request.modelPreset,
                                env: request.environment
                            }
                        }).select().single();

                        if (project) {
                            // 3. Create Asset Record
                            await supabase.from('assets').insert({
                                project_id: project.id,
                                url: resultUpload.publicUrl,
                                type: 'result',
                                storage_path: resultUpload.path
                            });
                        }
                    }
                } catch (saveError) {
                    console.error('Failed to save history:', saveError);
                    // Don't fail the request if saving fails
                }
            }

            return NextResponse.json({ result: finalImage });
        }

        // Batch scene generation for Video Templates (9:16 vertical)
        if (type === 'batch-scenes') {
            const batchRequest: BatchSceneRequest = body;

            // Validate request
            if (!batchRequest.sourceImage || !batchRequest.modelDescription || !batchRequest.scenes?.length) {
                return NextResponse.json(
                    { error: 'Missing required fields for batch scene generation' },
                    { status: 400 }
                );
            }

            const results: BatchSceneResponse['scenes'] = [];
            let totalGenerated = 0;
            let totalFailed = 0;

            // Generate scenes sequentially to avoid rate limiting
            for (const scene of batchRequest.scenes) {
                try {
                    const generatedImage = await generateVideoScene(
                        batchRequest.sourceImage,
                        batchRequest.modelDescription,
                        scene.environmentPrompt,
                        scene.overlayText,
                        batchRequest.apiKey
                    );

                    // Upload to storage if authenticated
                    let imageUrl = generatedImage;
                    if (user) {
                        const upload = await uploadToStorage(
                            supabase,
                            generatedImage.replace(/^data:image\/\w+;base64,/, ''),
                            'video-scenes'
                        );
                        if (upload) {
                            imageUrl = upload.publicUrl;
                        }
                    }

                    results.push({
                        id: scene.id,
                        imageUrl,
                        status: 'success',
                    });
                    totalGenerated++;
                } catch (sceneError) {
                    console.error(`Failed to generate scene ${scene.id}:`, sceneError);
                    results.push({
                        id: scene.id,
                        imageUrl: '',
                        status: 'error',
                        error: sceneError instanceof Error ? sceneError.message : 'Unknown error',
                    });
                    totalFailed++;
                }
            }

            const response: BatchSceneResponse = {
                scenes: results,
                totalGenerated,
                totalFailed,
            };

            // Save project if authenticated and at least one scene succeeded
            if (user && totalGenerated > 0) {
                try {
                    await supabase.from('projects').insert({
                        name: `Video Story ${new Date().toLocaleString()}`,
                        user_id: user.id,
                        type: 'video-story',
                        status: 'completed',
                        metadata: {
                            modelDescription: batchRequest.modelDescription,
                            sceneCount: totalGenerated,
                            scenes: results.filter(s => s.status === 'success').map(s => ({
                                id: s.id,
                                url: s.imageUrl
                            }))
                        }
                    });
                } catch (saveError) {
                    console.error('Failed to save video story project:', saveError);
                }
            }

            return NextResponse.json(response);
        }

        // KOL Base Image Generation (from text prompt only)
        if (type === 'kol-base') {
            const { prompt, apiKey } = body;

            if (!prompt) {
                return NextResponse.json(
                    { error: 'Missing prompt for KOL base generation' },
                    { status: 400 }
                );
            }

            // Import the function dynamically to avoid circular deps
            const { generateImageFromPrompt } = await import('@/lib/gemini/client');

            // Enhanced prompt for 9:16 vertical format
            const enhancedPrompt = `${prompt}

MANDATORY OUTPUT REQUIREMENTS:
- Aspect ratio: 9:16 vertical (portrait orientation like TikTok/Reels)
- High quality, professional photography style
- Full body or 3/4 body shot
- Clean, uncluttered background
- Photorealistic, not cartoon or anime`;

            const generatedImage = await generateImageFromPrompt(enhancedPrompt, undefined, apiKey);

            // Upload to storage if authenticated
            let imageUrl = generatedImage;
            if (user) {
                const upload = await uploadToStorage(
                    supabase,
                    generatedImage.replace(/^data:image\/\w+;base64,/, ''),
                    'kol-base'
                );
                if (upload) {
                    imageUrl = upload.publicUrl;
                }
            }

            return NextResponse.json({ result: imageUrl });
        }

        // KOL Clone Generation (with reference image for identity preservation)
        if (type === 'kol-clone') {
            const { prompt, referenceImage, apiKey } = body;

            if (!prompt || !referenceImage) {
                return NextResponse.json(
                    { error: 'Missing prompt or referenceImage for KOL clone generation' },
                    { status: 400 }
                );
            }

            const { generateKOLCloneImage } = await import('@/lib/gemini/client');

            // --- IDENTITY ANALYSIS HELPER ---
            async function analyzeReferenceImage(
                referenceBase64: string,
                apiKey?: string
            ): Promise<string> {
                try {
                    const { GoogleGenAI } = await import('@google/genai');
                    const key = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
                    if (!key) return "";

                    const genAI = new GoogleGenAI({ apiKey: key });
                    const model = genAI.models;

                    const prompt = `Analyze this person's face and physical appearance in detail. 
Output a concise description string covering:
1. Gender (Male/Female) - BE ACCURATE
2. Approximate Age
3. Skin Tone & Complexion
4. Face Shape & Features (Eyes, Nose, Lips)
5. Hair Style & Color
6. Body Type

Format the output as a single comma-separated descriptive string. Example: "Young adult female, approx 22 years old, fair skin, oval face, large brown eyes, long straight black hair, slim build".`;

                    const imageParts = [{
                        inlineData: {
                            data: referenceBase64.replace(/^data:image\/\w+;base64,/, ''),
                            mimeType: "image/jpeg"
                        }
                    }];

                    const result = await model.generateContent({
                        model: "gemini-3-flash-preview",
                        contents: [{
                            role: 'user',
                            parts: [{ text: prompt }, { inlineData: imageParts[0].inlineData }]
                        }]
                    });

                    return result.candidates?.[0]?.content?.parts?.[0]?.text || "";
                } catch (error) {
                    console.error("Analysis error:", error);
                    return "";
                }
            }

            // --- IDENTITY VERIFICATION HELPER ---
            // Note: In a real production environment, this should be a separate utility function
            async function verifyIdentityMatch(
                referenceBase64: string,
                generatedBase64: string,
                apiKey?: string
            ): Promise<{ score: number; passed: boolean; reason: string }> {
                try {
                    const { GoogleGenAI } = await import('@google/genai'); // Dynamically import
                    const key = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
                    if (!key) return { score: 10, passed: true, reason: "No API key for verification" };

                    const genAI = new GoogleGenAI({ apiKey: key });
                    const model = genAI.models;

                    const prompt = `You are a strict facial recognition AI. Compare Image A (Reference) and Image B (Generated).
Do they depict the EXACT SAME PERSON? Focus on:
- Facial Structure (Jawline, Cheekbones)
- Key Features (Nose shape, Eye shape/spacing, Lip fullness)
- Skin Tone & Complexion
- Apparent Age (Must be consistent)

Ignore differences in: Hairstyle, Makeup, Lighting, Pose.

Rate the identity match from 1 to 10.
- 10: Absolute twin match
- 8-9: Same person, slight variation
- 6-7: Similar person/siblings
- < 6: Different person

Return ONLY JSON:
{ "score": number, "passed": boolean (score >= 7), "reason": "brief explanation" }`;

                    const imageParts = [
                        {
                            inlineData: {
                                data: referenceBase64.replace(/^data:image\/\w+;base64,/, ''),
                                mimeType: "image/jpeg"
                            }
                        },
                        {
                            inlineData: {
                                data: generatedBase64.replace(/^data:image\/\w+;base64,/, ''),
                                mimeType: "image/jpeg"
                            }
                        }
                    ];

                    const result = await model.generateContent({
                        model: "gemini-3-flash-preview",
                        contents: [
                            {
                                role: 'user',
                                parts: [
                                    { text: prompt },
                                    ...imageParts.map(part => ({ inlineData: part.inlineData }))
                                ]
                            }
                        ]
                    });

                    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    try {
                        // Extract JSON from response
                        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            return JSON.parse(jsonMatch[0]);
                        }
                    } catch (e) {
                        console.error("Failed to parse verification JSON", e);
                    }

                    return { score: 5, passed: true, reason: "Verification parsing failed, defaulting to pass" };
                } catch (error) {
                    console.error("Identity verification error:", error);
                    return { score: 0, passed: true, reason: "Verification error" };
                }
            }


            // Enhanced prompt with STRICT identity preservation
            // 1. Analyze the reference image first
            console.log("Analyzing reference image identity...");
            const analyzedTraits = await analyzeReferenceImage(referenceImage, apiKey);
            console.log("Analyzed Traits:", analyzedTraits);

            // Enhanced prompt with STRICT identity preservation AND Analyzed Traits

            // Gender Lock Check
            const lowerTraits = analyzedTraits.toLowerCase();
            const isFemale = lowerTraits.includes('female') || lowerTraits.includes('woman') || lowerTraits.includes('girl');
            const genderLock = isFemale ? "GENDER: FEMALE (MUST BE A WOMAN)" : "GENDER: MALE (MUST BE A MAN)";

            const enhancedPrompt = `[IDENTITY-LOCKED GENERATION]
${genderLock}

THE SUBJECT IS: ${analyzedTraits}
User Prompt: ${prompt}

KỸ THUẬT GIỮ ĐỒNG NHẤT NHÂN VẬT:
👉 MỖI LẦN tạo ảnh mới – luôn tuân thủ:

Giữ nguyên 100% khuôn mặt, tỷ lệ khuôn mặt, màu da, kiểu tóc, ánh mắt và thần thái của nhân vật trong ảnh tham chiếu ban đầu.

Không thay đổi nhận dạng nhân vật.
Không tạo gương mặt mới.

Mô tả đặc điểm bắt buộc: ${analyzedTraits}
Giới tính và các đặc điểm vật lý là BẤT DI BẤT DỊCH (NON-NEGOTIABLE).

OUTPUT REQUIREMENTS:
- Aspect ratio: 9:16 vertical (portrait like TikTok/Reels)
- High quality professional photography
- Full body or 3/4 body shot
- Face clearly visible and recognizable
- Photorealistic quality

❌ CẤM: Đổi giới tính, đổi tuổi, đổi nét mặt.
✅ YÊU CẦU: Chính xác là người này trong bối cảnh/trang phục mới.`;

            let generatedImage = '';
            let attempts = 0;
            const maxAttempts = 2; // Limit retries to save cost/time

            while (attempts < maxAttempts) {
                attempts++;
                console.log(`Generating Clone - Attempt ${attempts}/${maxAttempts}`);

                try {
                    // Use new Editing Model (2.0 Flash) for High Consistency
                    generatedImage = await generateKOLCloneImage(
                        enhancedPrompt,
                        referenceImage,
                        apiKey
                    );

                    // Verify identity
                    // We only verify if we have a valid image and reference
                    if (generatedImage && referenceImage) {
                        const verification = await verifyIdentityMatch(referenceImage, generatedImage, apiKey);
                        console.log("Identity Verification Result:", verification);

                        if (verification.passed) {
                            break;
                        }

                        if (attempts < maxAttempts) {
                            console.log("Retrying generation due to poor identity match...");
                        }
                    } else {
                        break; // Should not happen but safety first
                    }
                } catch (e) {
                    console.error("Generation failed attempt:", e);
                    if (attempts === maxAttempts) throw e;
                }
            }

            // Upload to storage if authenticated
            let imageUrl = generatedImage;
            if (user) {
                const upload = await uploadToStorage(
                    supabase,
                    generatedImage.replace(/^data:image\/\w+;base64,/, ''),
                    'kol-clones'
                );
                if (upload) {
                    imageUrl = upload.publicUrl;
                }
            }

            return NextResponse.json({ result: imageUrl });
        }

        return NextResponse.json(
            { error: 'Invalid operation type. Use ?type=process, ?type=scene, ?type=batch-scenes, ?type=kol-base, or ?type=kol-clone' },
            { status: 400 }
        );

    } catch (error) {
        console.error('Image generation error:', error);

        let status = 500;
        let message = 'Unknown error';

        if (error instanceof Error) {
            message = error.message;
            if (message.includes('API Key is missing') || message.includes('API key not valid') || message.includes('401')) {
                status = 401;
            }
        }

        return NextResponse.json(
            { error: message },
            { status }
        );
    }
}
