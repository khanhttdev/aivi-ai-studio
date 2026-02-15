// Voice Studio Service
// Text splitting, PCM to WAV conversion, and audio merging utilities

import { MAX_CHARS_PER_SEGMENT, SAMPLE_RATE, SILENCE_DURATION_SECONDS } from '../voice-studio/constants';

/**
 * Smart split text into segments respecting natural boundaries.
 * Priority: paragraphs > sentences > max char limit
 */
export function smartSplitText(text: string): string[] {
    const trimmed = text.trim();
    if (!trimmed) return [];
    if (trimmed.length <= MAX_CHARS_PER_SEGMENT) return [trimmed];

    const segments: string[] = [];

    // First, try splitting by paragraphs
    const paragraphs = trimmed.split(/\n\s*\n/);
    let currentSegment = '';

    for (const paragraph of paragraphs) {
        const para = paragraph.trim();
        if (!para) continue;

        // If adding this paragraph would exceed the limit
        if (currentSegment && (currentSegment.length + para.length + 2) > MAX_CHARS_PER_SEGMENT) {
            if (currentSegment.trim()) {
                segments.push(currentSegment.trim());
            }
            // If single paragraph is too long, split by sentences
            if (para.length > MAX_CHARS_PER_SEGMENT) {
                segments.push(...splitBySentences(para));
                currentSegment = '';
            } else {
                currentSegment = para;
            }
        } else {
            currentSegment = currentSegment ? `${currentSegment}\n\n${para}` : para;
        }
    }

    if (currentSegment.trim()) {
        if (currentSegment.length > MAX_CHARS_PER_SEGMENT) {
            segments.push(...splitBySentences(currentSegment.trim()));
        } else {
            segments.push(currentSegment.trim());
        }
    }

    return segments.filter(s => s.length > 0);
}

/**
 * Split text by sentences when paragraph splitting isn't granular enough
 */
function splitBySentences(text: string): string[] {
    const sentencePattern = /[^.!?]+[.!?]+(["']?)(?=\s|$)|[^.!?]+$/g;
    const sentences = text.match(sentencePattern) || [text];
    const segments: string[] = [];
    let currentSegment = '';

    for (const sentence of sentences) {
        const s = sentence.trim();
        if (!s) continue;

        if (currentSegment && (currentSegment.length + s.length + 1) > MAX_CHARS_PER_SEGMENT) {
            if (currentSegment.trim()) {
                segments.push(currentSegment.trim());
            }
            currentSegment = s;
        } else {
            currentSegment = currentSegment ? `${currentSegment} ${s}` : s;
        }
    }

    if (currentSegment.trim()) {
        segments.push(currentSegment.trim());
    }

    return segments;
}

/**
 * Create WAV header for PCM data
 * 16-bit LE, mono, specified sample rate
 */
function createWavHeader(pcmDataLength: number, sampleRate: number = SAMPLE_RATE): ArrayBuffer {
    const header = new ArrayBuffer(44);
    const view = new DataView(header);

    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);

    // "RIFF" chunk descriptor
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + pcmDataLength, true); // Chunk size
    view.setUint32(8, 0x57415645, false); // "WAVE"

    // "fmt " sub-chunk
    view.setUint32(12, 0x666D7420, false); // "fmt "
    view.setUint32(16, 16, true); // Subchunk1Size (PCM = 16)
    view.setUint16(20, 1, true); // AudioFormat (PCM = 1)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);

    // "data" sub-chunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, pcmDataLength, true);

    return header;
}

/**
 * Convert base64 PCM data to WAV Blob
 */
export function pcmToWavBlob(base64Pcm: string): Blob {
    const binaryString = atob(base64Pcm);
    const pcmBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        pcmBytes[i] = binaryString.charCodeAt(i);
    }

    const wavHeader = createWavHeader(pcmBytes.length);
    return new Blob([wavHeader, pcmBytes], { type: 'audio/wav' });
}

/**
 * Merge multiple WAV blobs into a single master WAV file
 * Inserts silence between segments
 */
export async function mergeWavBlobs(
    blobs: Blob[],
    sampleRate: number = SAMPLE_RATE,
    silenceDuration: number = SILENCE_DURATION_SECONDS
): Promise<Blob> {
    if (blobs.length === 0) throw new Error('No audio blobs to merge');
    if (blobs.length === 1) return blobs[0];

    // Calculate silence buffer (16-bit LE, mono)
    const silenceSamples = Math.floor(sampleRate * silenceDuration);
    const silenceBuffer = new Uint8Array(silenceSamples * 2); // 2 bytes per sample (16-bit)

    // Extract PCM data from each WAV blob (skip 44-byte header)
    const pcmChunks: Uint8Array[] = [];
    let totalPcmLength = 0;

    for (let i = 0; i < blobs.length; i++) {
        const arrayBuffer = await blobs[i].arrayBuffer();
        const pcmData = new Uint8Array(arrayBuffer, 44); // Skip WAV header
        pcmChunks.push(pcmData);
        totalPcmLength += pcmData.length;

        // Add silence between segments (not after the last one)
        if (i < blobs.length - 1) {
            totalPcmLength += silenceBuffer.length;
        }
    }

    // Assemble master PCM
    const masterPcm = new Uint8Array(totalPcmLength);
    let offset = 0;

    for (let i = 0; i < pcmChunks.length; i++) {
        masterPcm.set(pcmChunks[i], offset);
        offset += pcmChunks[i].length;

        if (i < pcmChunks.length - 1) {
            masterPcm.set(silenceBuffer, offset);
            offset += silenceBuffer.length;
        }
    }

    // Create master WAV
    const masterHeader = createWavHeader(totalPcmLength, sampleRate);
    return new Blob([masterHeader, masterPcm], { type: 'audio/wav' });
}

/**
 * Play a success notification sound using Web Audio API
 */
export function playSuccessSound(): void {
    try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 1.5);
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 1.5);
    } catch (e) {
        console.error('Error playing success sound:', e);
    }
}
