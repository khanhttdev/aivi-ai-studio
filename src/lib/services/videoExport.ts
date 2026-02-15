/**
 * Video Export Service
 * Client-side video generation using Canvas API + MediaRecorder
 * Creates MP4 slideshow from generated scene images
 */

import { GeneratedScene } from '@/lib/templates/videoTemplates';

export interface VideoExportOptions {
    width?: number;
    height?: number;
    fps?: number;
    sceneDuration?: number; // seconds per scene
    transition?: 'none' | 'fade' | 'crossfade';
    transitionDuration?: number; // seconds
    quality?: number; // 0.1 to 1.0
}

const DEFAULT_OPTIONS: Required<VideoExportOptions> = {
    width: 1080,
    height: 1920, // 9:16 aspect ratio
    fps: 30,
    sceneDuration: 3,
    transition: 'fade',
    transitionDuration: 0.5,
    quality: 0.9,
};

/**
 * Load an image from URL or base64 and return HTMLImageElement
 */
async function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

/**
 * Draw image to canvas with cover fit (fills entire canvas, crops if needed)
 */
function drawImageCover(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    canvasWidth: number,
    canvasHeight: number,
    opacity: number = 1
) {
    const imgRatio = img.width / img.height;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth: number, drawHeight: number, offsetX: number, offsetY: number;

    if (imgRatio > canvasRatio) {
        // Image is wider - fit height, crop width
        drawHeight = canvasHeight;
        drawWidth = img.width * (canvasHeight / img.height);
        offsetX = (canvasWidth - drawWidth) / 2;
        offsetY = 0;
    } else {
        // Image is taller - fit width, crop height
        drawWidth = canvasWidth;
        drawHeight = img.height * (canvasWidth / img.width);
        offsetX = 0;
        offsetY = (canvasHeight - drawHeight) / 2;
    }

    ctx.globalAlpha = opacity;
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    ctx.globalAlpha = 1;
}

/**
 * Draw text overlay on canvas
 */
function drawOverlayText(
    ctx: CanvasRenderingContext2D,
    text: string,
    canvasWidth: number,
    canvasHeight: number
) {
    const fontSize = Math.floor(canvasWidth * 0.045);
    ctx.font = `bold ${fontSize}px "Inter", "Helvetica Neue", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    // Text shadow for readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // White text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, canvasWidth / 2, canvasHeight - 80);

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
}

export type ProgressCallback = (progress: number, status: string) => void;

/**
 * Export scenes as MP4 video slideshow
 * Uses Canvas + MediaRecorder for browser-based encoding
 */
export async function exportSlideshowVideo(
    scenes: GeneratedScene[],
    options: VideoExportOptions = {},
    onProgress?: ProgressCallback
): Promise<Blob> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const totalFrames = scenes.length * opts.sceneDuration * opts.fps;
    const transitionFrames = Math.floor(opts.transitionDuration * opts.fps);

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = opts.width;
    canvas.height = opts.height;
    const ctx = canvas.getContext('2d')!;

    // Preload all images
    onProgress?.(0, 'Loading images...');
    const images: HTMLImageElement[] = [];
    for (let i = 0; i < scenes.length; i++) {
        const img = await loadImage(scenes[i].imageUrl);
        images.push(img);
        onProgress?.((i + 1) / scenes.length * 20, `Loaded image ${i + 1}/${scenes.length}`);
    }

    // Setup MediaRecorder
    const stream = canvas.captureStream(opts.fps);
    const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 8000000, // 8 Mbps for good quality
    });

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
            chunks.push(e.data);
        }
    };

    // Start recording
    mediaRecorder.start();
    onProgress?.(20, 'Recording video...');

    // Render frames
    const framesPerScene = opts.sceneDuration * opts.fps;
    let frameCount = 0;

    for (let sceneIndex = 0; sceneIndex < scenes.length; sceneIndex++) {
        const scene = scenes[sceneIndex];
        const img = images[sceneIndex];
        const nextImg = images[sceneIndex + 1];

        for (let frameInScene = 0; frameInScene < framesPerScene; frameInScene++) {
            // Clear canvas
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, opts.width, opts.height);

            // Determine opacity for transitions
            let opacity = 1;
            if (opts.transition === 'fade') {
                // Fade in at start
                if (frameInScene < transitionFrames) {
                    opacity = frameInScene / transitionFrames;
                }
                // Fade out at end (crossfade to next)
                if (frameInScene >= framesPerScene - transitionFrames && nextImg) {
                    const fadeProgress = (frameInScene - (framesPerScene - transitionFrames)) / transitionFrames;
                    opacity = 1 - fadeProgress;

                    // Draw next image behind
                    drawImageCover(ctx, nextImg, opts.width, opts.height, fadeProgress);
                }
            }

            // Draw current image
            drawImageCover(ctx, img, opts.width, opts.height, opacity);

            // Draw overlay text if present
            if (scene.overlayText) {
                drawOverlayText(ctx, scene.overlayText, opts.width, opts.height);
            }

            // Small delay to allow frame capture
            await new Promise((resolve) => setTimeout(resolve, 1000 / opts.fps / 2));

            frameCount++;
            const progress = 20 + (frameCount / totalFrames) * 70;
            onProgress?.(progress, `Rendering frame ${frameCount}/${totalFrames}`);
        }
    }

    // Stop recording
    onProgress?.(90, 'Finalizing video...');
    mediaRecorder.stop();

    // Wait for recording to complete
    return new Promise((resolve) => {
        mediaRecorder.onstop = () => {
            const webmBlob = new Blob(chunks, { type: 'video/webm' });
            onProgress?.(100, 'Complete!');
            resolve(webmBlob);
        };
    });
}

/**
 * Download video blob as file
 */
export function downloadVideo(blob: Blob, filename: string = 'video-story.webm') {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Download all scene images as individual files
 */
export async function downloadAllScenes(scenes: GeneratedScene[], prefix: string = 'scene') {
    for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        const filename = `${prefix}-${String(i + 1).padStart(2, '0')}.png`;

        // Handle base64 or URL
        if (scene.imageUrl.startsWith('data:')) {
            const a = document.createElement('a');
            a.href = scene.imageUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            // Fetch and download
            const response = await fetch(scene.imageUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // Small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 300));
    }
}
