import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/rateLimit', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/lib/rateLimit')>();
    return {
        ...actual,
        checkRateLimit: vi.fn(() => ({ allowed: true })),
        getClientIp: vi.fn(() => '127.0.0.1'),
        rateLimitResponse: vi.fn(() => new Response('Too Many Requests', { status: 429 })),
        RATE_LIMITS: { imageGeneration: { limit: 10, window: 60 } }
    };
});

vi.mock('@/lib/gemini/client', () => ({
    processSourceImage: vi.fn(() => Promise.resolve('base64_processed_image')),
    generateFinalScene: vi.fn(() => Promise.resolve('base64_final_scene')),
    generateVideoScene: vi.fn(() => Promise.resolve('base64_video_scene')),
}));

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => ({
        auth: {
            getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } }, error: null })),
        },
        storage: {
            from: vi.fn(() => ({
                upload: vi.fn(() => Promise.resolve({ error: null })),
                getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/image.png' } })),
            })),
        },
        from: vi.fn(() => ({
            insert: vi.fn(() => ({
                select: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({ data: { id: 'project-123' }, error: null })),
                })),
            })),
        })),
    })),
}));

describe('API POST /api/generate-image', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 400 if image data is missing for process type', async () => {
        const req = new NextRequest('http://localhost/api/generate-image?type=process', {
            method: 'POST',
            body: JSON.stringify({ mode: 'EXTRACT', clothingType: 'TOP' }),
        });
        const res = await POST(req);
        expect(res.status).toBe(400);
        const json = await res.json();
        // Zod error format: "field: message"
        // Actual message from Zod v4-alpha(?) might be verbose
        expect(json.error).toContain('image:');
    });

    it('should return 200 and processed image for valid process request', async () => {
        const req = new NextRequest('http://localhost/api/generate-image?type=process', {
            method: 'POST',
            body: JSON.stringify({
                image: 'data:image/png;base64,fake',
                mode: 'EXTRACT',
                clothingType: 'TOP'
            }),
        });
        const res = await POST(req);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.result).toBe('base64_processed_image');
    });

    it('should return 400 if scene data is missing for scene type', async () => {
        const req = new NextRequest('http://localhost/api/generate-image?type=scene', {
            method: 'POST',
            body: JSON.stringify({ modelPreset: 'asian_female' }),
        });
        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it('should return 200 and final scene for valid scene request', async () => {
        const req = new NextRequest('http://localhost/api/generate-image?type=scene', {
            method: 'POST',
            body: JSON.stringify({
                sourceImage: 'base64_source',
                modelPreset: 'asian_female',
                environment: 'studio'
            }),
        });
        const res = await POST(req);
        expect(res.status).toBe(200);
    });
});
