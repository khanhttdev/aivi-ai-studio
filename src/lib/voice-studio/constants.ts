// Voice Studio Constants
// Categories and Voice Presets for Gemini TTS

export interface VoiceCategory {
    id: string;
    name: string;
    nameEn: string;
}

export interface VoiceOption {
    id: string;
    categoryId: string;
    name: string;
    geminiVoiceName: string;
    gender: 'Nam' | 'Nữ';
    genderEn: 'Male' | 'Female';
    style: string;
    styleEn: string;
    description?: string;
    descriptionEn?: string;
}

export const CATEGORIES: VoiceCategory[] = [
    { id: 'news', name: 'Bản tin thời sự', nameEn: 'News Anchor' },
    { id: 'documentary', name: 'Phim tài liệu', nameEn: 'Documentary' },
    { id: 'audiobook', name: 'Sách nói', nameEn: 'Audiobook' },
    { id: 'review', name: 'Review / Vlog', nameEn: 'Review / Vlog' },
    { id: 'radio-confide', name: 'Radio tâm sự', nameEn: 'Radio Confide' },
    { id: 'buddhist', name: 'Radio phật pháp', nameEn: 'Buddhist Radio' },
    { id: 'love-story', name: 'Kể chuyện tình cảm', nameEn: 'Romance Story' },
    { id: 'late-night', name: 'Kể chuyện đêm khuya', nameEn: 'Late Night Story' },
    { id: 'detective', name: 'Kể chuyện trinh thám', nameEn: 'Detective Story' },
    { id: 'tvc', name: 'Quảng cáo / TVC', nameEn: 'Advertising / TVC' },
    { id: 'presentation', name: 'MC / Thuyết trình', nameEn: 'MC / Presentation' },
    { id: 'foreign', name: 'Ngoại ngữ / Quốc tế', nameEn: 'Foreign / International' },
];

export const VOICE_PRESETS: VoiceOption[] = [
    // News
    {
        id: 'news-1', categoryId: 'news',
        name: 'BTV Quốc Khánh', geminiVoiceName: 'Charon',
        gender: 'Nam', genderEn: 'Male',
        style: 'Uy tín', styleEn: 'Authoritative',
        description: 'Giọng nam chính luận, uy tín', descriptionEn: 'Authoritative male news anchor',
    },
    {
        id: 'news-2', categoryId: 'news',
        name: 'BTV Thu Uyên', geminiVoiceName: 'Zephyr',
        gender: 'Nữ', genderEn: 'Female',
        style: 'Sắc sảo', styleEn: 'Sharp',
        description: 'Giọng nữ sắc sảo, rõ ràng', descriptionEn: 'Sharp and clear female anchor',
    },
    {
        id: 'news-3', categoryId: 'news',
        name: 'PV Quang Minh', geminiVoiceName: 'Puck',
        gender: 'Nam', genderEn: 'Male',
        style: 'Năng động', styleEn: 'Dynamic',
        description: 'Giọng nam hiện trường, năng động', descriptionEn: 'Dynamic field reporter',
    },
    // Documentary
    {
        id: 'doc-1', categoryId: 'documentary',
        name: 'NSND Thế Anh', geminiVoiceName: 'Fenrir',
        gender: 'Nam', genderEn: 'Male',
        style: 'Huyền thoại', styleEn: 'Legendary',
        description: 'Giọng nam trầm ấm, huyền thoại', descriptionEn: 'Deep warm legendary voice',
    },
    // Audiobook
    {
        id: 'book-1', categoryId: 'audiobook',
        name: 'Bác Ba Phi', geminiVoiceName: 'Fenrir',
        gender: 'Nam', genderEn: 'Male',
        style: 'Sâu sắc', styleEn: 'Profound',
        description: 'Giọng nam sâu sắc, truyền cảm', descriptionEn: 'Profound and expressive voice',
    },
    // Review / Vlog
    {
        id: 'review-1', categoryId: 'review',
        name: 'Tùng Tech', geminiVoiceName: 'Puck',
        gender: 'Nam', genderEn: 'Male',
        style: 'Công nghệ', styleEn: 'Tech',
        description: 'Giọng nam trẻ trung, review công nghệ', descriptionEn: 'Young tech reviewer voice',
    },
    // Radio tâm sự
    {
        id: 'radio-1', categoryId: 'radio-confide',
        name: 'Chị Thanh Tâm', geminiVoiceName: 'Kore',
        gender: 'Nữ', genderEn: 'Female',
        style: 'Chữa lành', styleEn: 'Healing',
        description: 'Giọng nữ nhẹ nhàng, chữa lành', descriptionEn: 'Gentle healing female voice',
    },
    // Buddhist
    {
        id: 'bud-1', categoryId: 'buddhist',
        name: 'Thầy Thích Tâm', geminiVoiceName: 'Charon',
        gender: 'Nam', genderEn: 'Male',
        style: 'Uy nghi', styleEn: 'Solemn',
        description: 'Giọng nam uy nghi, thiền định', descriptionEn: 'Solemn meditative voice',
    },
    // Love story
    {
        id: 'love-1', categoryId: 'love-story',
        name: 'Minh Nhật', geminiVoiceName: 'Puck',
        gender: 'Nam', genderEn: 'Male',
        style: 'Lãng mạn', styleEn: 'Romantic',
        description: 'Giọng nam lãng mạn, ngọt ngào', descriptionEn: 'Romantic sweet male voice',
    },
    // Late night
    {
        id: 'night-1', categoryId: 'late-night',
        name: 'Bà Năm', geminiVoiceName: 'Fenrir',
        gender: 'Nam', genderEn: 'Male',
        style: 'Cổ kính', styleEn: 'Ancient',
        description: 'Giọng trầm cổ kính, bí ẩn', descriptionEn: 'Deep ancient mysterious voice',
    },
    // Detective
    {
        id: 'detective-1', categoryId: 'detective',
        name: 'Thám Tử Hùng', geminiVoiceName: 'Charon',
        gender: 'Nam', genderEn: 'Male',
        style: 'Sắc lạnh', styleEn: 'Sharp Cold',
        description: 'Giọng nam sắc lạnh, căng thẳng', descriptionEn: 'Sharp cold tense voice',
    },
    // TVC
    {
        id: 'tvc-1', categoryId: 'tvc',
        name: 'MC Tuấn Hưng', geminiVoiceName: 'Puck',
        gender: 'Nam', genderEn: 'Male',
        style: 'Bùng nổ', styleEn: 'Explosive',
        description: 'Giọng nam mạnh mẽ, bùng nổ', descriptionEn: 'Powerful explosive voice',
    },
    // Presentation
    {
        id: 'mc-1', categoryId: 'presentation',
        name: 'MC Quốc Bình', geminiVoiceName: 'Charon',
        gender: 'Nam', genderEn: 'Male',
        style: 'Chuẩn mực', styleEn: 'Professional',
        description: 'Giọng nam chuẩn mực, chuyên nghiệp', descriptionEn: 'Professional standard voice',
    },
    // Foreign
    {
        id: 'en-1', categoryId: 'foreign',
        name: 'Alex (Mỹ)', geminiVoiceName: 'Puck',
        gender: 'Nam', genderEn: 'Male',
        style: 'Casual', styleEn: 'Casual',
        description: 'Giọng Anh-Mỹ tự nhiên', descriptionEn: 'Natural American English voice',
    },
];

export const SAMPLE_RATE = 24000;
export const MAX_CONCURRENT_REQUESTS = 1;
export const MAX_CHARS_PER_SEGMENT = 4000;
export const SILENCE_DURATION_SECONDS = 0.7;
