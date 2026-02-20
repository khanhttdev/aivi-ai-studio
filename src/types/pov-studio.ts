// POV Script Studio Types

export type POVType = 'monster' | 'bacteria' | 'object' | 'pet' | 'villain' | 'custom';

export interface POVTypeConfig {
    id: POVType;
    label: string;
    emoji: string;
    description: string;
    exampleMonster: string;
    exampleProduct: string;
}

export interface POVScriptRequest {
    productImage?: string; // base64 data URL
    monsterImage?: string; // base64 data URL
    productName: string;
    monsterDescription: string;
    sceneCount: number; // 3-12
    povType: POVType;
    locale: string;
    apiKey?: string;
}

export interface POVScene {
    sceneNumber: number;
    monsterDialogue: string;
    visualDescription: string;
    productHighlight: string;
    emotion: string; // scared, angry, desperate, etc.
}

export interface POVScriptResponse {
    scenes: POVScene[];
    hook: string;
    cta: string;
    title: string;
}

export interface POVScriptRecord {
    id: string;
    user_id: string;
    title: string;
    pov_type: POVType;
    product_name: string | null;
    monster_description: string | null;
    scene_count: number;
    product_image_url: string | null;
    monster_image_url: string | null;
    script_data: POVScene[];
    hook: string | null;
    cta: string | null;
    created_at: string;
    updated_at: string;
}
