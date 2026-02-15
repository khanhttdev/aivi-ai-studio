import { createBrowserClient } from '@supabase/ssr';
import { Database } from './types';

export const createClient = () =>
    createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

// Singleton instance for client-side usage
export const supabase = createClient();

// Storage helpers
export const uploadImage = async (file: File, bucket: string = 'images') => {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

    return { path: data.path, publicUrl: urlData.publicUrl };
};

export const uploadBase64File = async (
    base64: string,
    fileName: string,
    bucket: string = 'processed-images'
) => {
    // Detect MIME type and base64 data
    const match = base64.match(/^data:(.*?);base64,(.*)$/);
    if (!match) {
        // Fallback for raw base64 without prefix (assume png)
        const contentType = 'image/png';
        const base64Data = base64;
        const ext = 'png';
        return await performUpload(base64Data, contentType, ext, fileName, bucket);
    }

    const contentType = match[1];
    const base64Data = match[2];
    const ext = contentType.split('/')[1] || 'bin';
    return await performUpload(base64Data, contentType, ext, fileName, bucket);
};

const performUpload = async (base64Data: string, contentType: string, ext: string, fileName: string, bucket: string) => {
    let fileBody: Blob | Buffer;
    if (typeof window !== 'undefined') {
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        fileBody = new Blob([byteArray], { type: contentType });
    } else {
        fileBody = Buffer.from(base64Data, 'base64');
    }

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(`${Date.now()}-${fileName}.${ext}`, fileBody, {
            contentType,
        });

    if (error) throw error;

    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

    return { path: data.path, publicUrl: urlData.publicUrl };
};

// Re-export old name for compatibility if needed, but we'll update the callers
export const uploadBase64Image = uploadBase64File;

export const getProcessedImages = async (bucket: string = 'processed-images') => {
    const { data, error } = await supabase.storage.from(bucket).list();
    if (error) throw error;

    return data.map((file) => ({
        name: file.name,
        url: supabase.storage.from(bucket).getPublicUrl(file.name).data.publicUrl,
    }));
};
