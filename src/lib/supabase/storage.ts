import { supabase } from './client';

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

export const uploadBase64Image = async (
    base64: string,
    fileName: string,
    bucket: string = 'processed-images'
) => {
    // Remove data URL prefix if present
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');

    // Convert base64 to Blob/Buffer depending on environment
    let fileBody: Blob | Buffer;
    const contentType = 'image/png';

    if (typeof window !== 'undefined') {
        // Client-side: use Blob
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        fileBody = new Blob([byteArray], { type: contentType });
    } else {
        // Server-side: use Buffer
        fileBody = Buffer.from(base64Data, 'base64');
    }

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(`${Date.now()}-${fileName}.png`, fileBody, {
            contentType,
        });

    if (error) throw error;

    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

    return { path: data.path, publicUrl: urlData.publicUrl };
};

export const getProcessedImages = async (bucket: string = 'processed-images') => {
    const { data, error } = await supabase.storage.from(bucket).list();
    if (error) throw error;

    return data.map((file) => ({
        name: file.name,
        url: supabase.storage.from(bucket).getPublicUrl(file.name).data.publicUrl,
    }));
};
