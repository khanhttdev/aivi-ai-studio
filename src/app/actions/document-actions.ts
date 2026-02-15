'use server';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require('pdf-parse');

export interface DocumentData {
    text: string;
    pageCount: number;
    info?: Record<string, unknown>;
}

export async function extractTextFromPDF(formData: FormData): Promise<{ success: boolean; data?: DocumentData; error?: string }> {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            throw new Error('No file provided');
        }

        if (file.type !== 'application/pdf') {
            throw new Error('Invalid file type. Please upload a PDF.');
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const data = await pdf(buffer);

        return {
            success: true,
            data: {
                text: data.text,
                pageCount: data.numpages,
                info: data.info,
            },
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to parse PDF';
        console.error('Error parsing PDF:', error);
        return {
            success: false,
            error: message,
        };
    }
}
