/**
 * KOL AI Studio Types
 * TypeScript definitions for KOL creation and management
 */

// ============================================
// THEME TYPES
// ============================================

export interface KOLTheme {
    id: string;
    name: string;
    nameVi: string;
    description: string;
    descriptionVi: string;
    icon: string; // emoji
}

export const KOL_THEMES: KOLTheme[] = [
    {
        id: 'fashion',
        name: 'Fashion',
        nameVi: 'Thời trang',
        description: 'Outfit coordination, style tips, clothing reviews',
        descriptionVi: 'Phối đồ, tips thời trang, review quần áo',
        icon: '👗',
    },
    {
        id: 'beauty',
        name: 'Beauty & Skincare',
        nameVi: 'Làm đẹp - Skincare',
        description: 'Makeup tutorials, skincare routines, product reviews',
        descriptionVi: 'Hướng dẫn makeup, skincare routine, review sản phẩm',
        icon: '💄',
    },
    {
        id: 'lifestyle',
        name: 'Lifestyle',
        nameVi: 'Đời sống',
        description: 'Daily life, productivity, home decor, food',
        descriptionVi: 'Cuộc sống hàng ngày, năng suất, trang trí nhà, ẩm thực',
        icon: '🏠',
    },
    {
        id: 'travel',
        name: 'Travel & Review',
        nameVi: 'Review quán - Du lịch',
        description: 'Travel vlogs, cafe reviews, restaurant recommendations',
        descriptionVi: 'Vlog du lịch, review quán cafe, gợi ý nhà hàng',
        icon: '✈️',
    },
    {
        id: 'emotional',
        name: 'Emotional & Sharing',
        nameVi: 'Chia sẻ cuộc sống - Cảm xúc',
        description: 'Personal stories, motivation, relationship advice',
        descriptionVi: 'Câu chuyện cá nhân, động lực, tư vấn tình cảm',
        icon: '💭',
    },
];

// ============================================
// PROFILE TYPES
// ============================================

export interface KOLAppearance {
    faceType: string; // oval, round, heart, square
    hairStyle: string;
    hairColor: string;
    skinTone: string;
    bodyType: string;
    height?: string;
}

export interface KOLProfile {
    // Basic Info
    gender: 'male' | 'female';
    ageRange: string; // e.g., "22-25"

    // Appearance
    appearance: KOLAppearance;

    // Style & Personality
    fashionStyle: string;
    personality: string;
    dominantEmotion: string;
    expertise: string; // Added for UI consistency

    // Character
    occupation: string; // e.g., "fashion content creator"
    appearanceSummary?: string; // Optional field for UI
    hobbies: string[];
    voiceStyle: string;
    charisma: string; // expression/aura when on camera
}

// Full KOL entity (matches Supabase table)
export interface KOLEntity {
    id: string;
    user_id: string;
    name: string;
    theme: string;
    channel_positioning: string;
    profile_data: KOLProfile;
    base_image_url: string | null;
    created_at: string;
    updated_at: string;
}

// KOL Image entity (matches Supabase table)
export interface KOLImageEntity {
    id: string;
    kol_id: string;
    image_url: string;
    context: string | null;
    outfit: string | null;
    created_at: string;
}

// ============================================
// CONTENT TYPES
// ============================================

export interface TikTokScript {
    hook: string; // First 3 seconds attention grabber
    body: string; // Main content
    cta: string; // Call to action
    duration: number; // Estimated duration in seconds
    voiceTone: string; // Matching personality
}

export interface CloneContext {
    id: string;
    name: string;
    nameVi: string;
    environmentPrompt: string;
    suggestedOutfit: string;
}

export const CLONE_CONTEXTS: CloneContext[] = [
    {
        id: 'studio',
        name: 'Studio',
        nameVi: 'Studio',
        environmentPrompt: 'Professional white studio with soft lighting, clean minimal background',
        suggestedOutfit: 'Professional casual outfit',
    },
    {
        id: 'cafe',
        name: 'Coffee Shop',
        nameVi: 'Quán Cafe',
        environmentPrompt: 'Cozy aesthetic cafe interior, warm lighting, plants and wooden furniture',
        suggestedOutfit: 'Trendy casual wear, comfortable but stylish',
    },
    {
        id: 'street',
        name: 'Street Style',
        nameVi: 'Đường Phố',
        environmentPrompt: 'Urban street with modern architecture, golden hour lighting, city vibe',
        suggestedOutfit: 'Streetwear, urban fashion',
    },
    {
        id: 'beach',
        name: 'Beach',
        nameVi: 'Bãi Biển',
        environmentPrompt: 'Beautiful tropical beach at sunset, palm trees, soft waves',
        suggestedOutfit: 'Summer wear, beach outfit, flowy dress or casual resort wear',
    },
    {
        id: 'garden',
        name: 'Garden',
        nameVi: 'Vườn Hoa',
        environmentPrompt: 'Lush green garden with colorful flowers, natural light, romantic atmosphere',
        suggestedOutfit: 'Elegant feminine outfit, floral patterns',
    },
    {
        id: 'office',
        name: 'Office',
        nameVi: 'Văn Phòng',
        environmentPrompt: 'Modern minimalist office, glass windows, professional setting',
        suggestedOutfit: 'Business casual, blazer and smart pants',
    },
    {
        id: 'rooftop',
        name: 'Rooftop',
        nameVi: 'Sân Thượng',
        environmentPrompt: 'Luxury rooftop bar with city skyline, evening golden hour, sophisticated atmosphere',
        suggestedOutfit: 'Evening wear, elegant dress or smart outfit',
    },
    {
        id: 'home',
        name: 'Home',
        nameVi: 'Tại Nhà',
        environmentPrompt: 'Cozy modern home interior, warm lighting, comfortable and aesthetic',
        suggestedOutfit: 'Comfortable homewear, loungewear',
    },
];

// ============================================
// STORE STATE TYPES
// ============================================

export interface KOLStudioState {
    // Step 1: Theme
    selectedTheme: KOLTheme | null;
    customTheme: string;
    channelPositioning: string;

    // Step 2: Profile
    kolProfile: KOLProfile | null;
    kolName: string;
    isGeneratingProfile: boolean;

    // Step 3: Base Image
    baseKOLImage: string | null;
    isGeneratingBase: boolean;

    // Step 4: Clones
    selectedContexts: CloneContext[];
    generatedClones: KOLImageEntity[];
    isGeneratingClone: boolean;
    cloneProgress: number;

    // Step 5: Content
    generatedScript: TikTokScript | null;
    isGeneratingScript: boolean;

    // Current KOL (saved entity)
    currentKOL: KOLEntity | null;

    // Navigation
    currentStep: number;

    // Library
    savedKOLs: KOLEntity[];
    isLoadingLibrary: boolean;

    // Actions
    setSelectedTheme: (theme: KOLTheme | null) => void;
    setCustomTheme: (theme: string) => void;
    setChannelPositioning: (positioning: string) => void;
    setKOLProfile: (profile: KOLProfile | null) => void;
    setKOLName: (name: string) => void;
    setIsGeneratingProfile: (loading: boolean) => void;
    setBaseKOLImage: (image: string | null) => void;
    setIsGeneratingBase: (loading: boolean) => void;
    setSelectedContexts: (contexts: CloneContext[]) => void;
    addGeneratedClone: (clone: KOLImageEntity) => void;
    setGeneratedClones: (clones: KOLImageEntity[]) => void;
    setIsGeneratingClone: (loading: boolean) => void;
    setCloneProgress: (progress: number) => void;
    setGeneratedScript: (script: TikTokScript | null) => void;
    setIsGeneratingScript: (loading: boolean) => void;
    setCurrentKOL: (kol: KOLEntity | null) => void;
    setCurrentStep: (step: number) => void;
    setSavedKOLs: (kols: KOLEntity[]) => void;
    addSavedKOL: (kol: KOLEntity) => void;
    updateSavedKOL: (kol: KOLEntity) => void;
    deleteSavedKOL: (id: string) => void;
    setIsLoadingLibrary: (loading: boolean) => void;
    reset: () => void;
}
