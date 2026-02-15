import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
        RATE_LIMITS: { textToSpeech: { limit: 20, window: 60 } }
    };
});

// Mock fetch explicitly
global.fetch = vi.fn();

describe('API POST /api/text-to-speech', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv('ELEVENLABS_API_KEY', 'test-api-key');
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('should return 400 if text is missing', async () => {
        const req = new NextRequest('http://localhost/api/text-to-speech', {
            method: 'POST',
            body: JSON.stringify({ voiceId: 'voice_123' }),
        });
        const res = await POST(req);
        expect(res.status).toBe(400);
        const json = await res.json();
        // Updated expectation to match flexible validation error format
        expect(json.error).toContain('text:');
    });

    it('should return 400 if voiceId is missing', async () => {
        const req = new NextRequest('http://localhost/api/text-to-speech', {
            method: 'POST',
            body: JSON.stringify({ text: 'Hello' }),
        });
        const res = await POST(req);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toContain('voiceId:');
    });

    it('should return 500 if server API key is missing', async () => {
        vi.unstubAllEnvs(); // Remove the default stub

        const req = new NextRequest('http://localhost/api/text-to-speech', {
            method: 'POST',
            body: JSON.stringify({ text: 'Hello', voiceId: 'voice_123' }),
        });
        const res = await POST(req);

        expect(res.status).toBe(500);
        const json = await res.json();
        expect(json.error).toBe('Server missing API Key');
    });

    it('should return 200 and audio data for valid request', async () => {
        // Mock successful fetch
        (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
            ok: true,
            arrayBuffer: async () => Buffer.from('audio_data'),
        });

        const req = new NextRequest('http://localhost/api/text-to-speech', {
            method: 'POST',
            body: JSON.stringify({ text: 'Hello world', voiceId: 'voice_123' }),
        });
        const res = await POST(req);

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.audio).toBeDefined();
        expect(json.audio).toContain('data:audio/mpeg;base64,');
    });

    it('should handle ElevenLabs API error', async () => {
        // Mock failed fetch
        (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
            ok: false,
            status: 401,
            text: async () => 'Unauthorized',
        });

        const req = new NextRequest('http://localhost/api/text-to-speech', {
            method: 'POST',
            body: JSON.stringify({ text: 'Hello', voiceId: 'voice_123' }),
        });
        const res = await POST(req);

        expect(res.status).toBe(401);
        const json = await res.json();
        expect(json.error).toBe('ElevenLabs API Error');
    });
});
