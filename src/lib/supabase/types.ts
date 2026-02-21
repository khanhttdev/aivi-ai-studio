export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            projects: {
                Row: {
                    id: string
                    created_at: string
                    name: string
                    user_id: string
                    type: 'image' | 'marketing'
                    status: 'pending' | 'completed' | 'failed'
                    metadata: Json
                }
                Insert: {
                    id?: string
                    created_at?: string
                    name: string
                    user_id: string
                    type: 'image' | 'marketing'
                    status?: 'pending' | 'completed' | 'failed'
                    metadata?: Json
                }
                Update: {
                    id?: string
                    created_at?: string
                    name?: string
                    user_id?: string
                    type?: 'image' | 'marketing'
                    status?: 'pending' | 'completed' | 'failed'
                    metadata?: Json
                }
            }
            assets: {
                Row: {
                    id: string
                    created_at: string
                    project_id: string
                    url: string
                    type: 'source' | 'processed' | 'result'
                    storage_path: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    project_id: string
                    url: string
                    type: 'source' | 'processed' | 'result'
                    storage_path: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    project_id?: string
                    url?: string
                    type?: 'source' | 'processed' | 'result'
                    storage_path?: string
                }
            }
            stories: {
                Row: {
                    id: string
                    user_id: string
                    main_topic: string | null
                    selected_niche: string | null
                    characters: Json
                    script: Json | null
                    video_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    main_topic?: string | null
                    selected_niche?: string | null
                    characters: Json
                    script?: Json | null
                    video_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    main_topic?: string | null
                    selected_niche?: string | null
                    characters?: Json
                    script?: Json | null
                    video_url?: string | null
                    created_at?: string
                }
            }
            kols: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    theme: string | null
                    channel_positioning: string | null
                    profile_data: Json
                    base_image_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    theme?: string | null
                    channel_positioning?: string | null
                    profile_data: Json
                    base_image_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    theme?: string | null
                    channel_positioning?: string | null
                    profile_data?: Json
                    base_image_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            kol_profiles: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    theme: string | null
                    channel_positioning: string | null
                    profile_data: Json
                    base_image_url: string | null
                    created_at: string
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    theme?: string | null
                    channel_positioning?: string | null
                    profile_data: Json
                    base_image_url?: string | null
                    created_at?: string
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    theme?: string | null
                    channel_positioning?: string | null
                    profile_data?: Json
                    base_image_url?: string | null
                    created_at?: string
                    updated_at?: string | null
                }
            }
            kol_images: {
                Row: {
                    id: string
                    kol_id: string
                    image_url: string
                    context: string | null
                    outfit: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    kol_id: string
                    image_url: string
                    context?: string | null
                    outfit?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    kol_id?: string
                    image_url?: string
                    context?: string | null
                    outfit?: string | null
                    created_at?: string
                }
            }
            notifications: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    message: string
                    type: 'info' | 'success' | 'warning' | 'error'
                    link: string | null
                    is_read: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    message: string
                    type?: 'info' | 'success' | 'warning' | 'error'
                    link?: string | null
                    is_read?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    message?: string
                    type?: 'info' | 'success' | 'warning' | 'error'
                    link?: string | null
                    is_read?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            pov_scripts: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    pov_type: string
                    product_name: string | null
                    monster_description: string | null
                    scene_count: number
                    product_image_url: string | null
                    monster_image_url: string | null
                    script_data: Json
                    hook: Json | null
                    cta: Json | null
                    current_step: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    pov_type: string
                    product_name?: string | null
                    monster_description?: string | null
                    scene_count: number
                    product_image_url?: string | null
                    monster_image_url?: string | null
                    script_data: Json
                    hook?: Json | null
                    cta?: Json | null
                    current_step?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    pov_type?: string
                    product_name?: string | null
                    monster_description?: string | null
                    scene_count?: number
                    product_image_url?: string | null
                    monster_image_url?: string | null
                    script_data?: Json
                    hook?: Json | null
                    cta?: Json | null
                    current_step?: number
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
}
