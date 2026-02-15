/**
 * Video Templates for Image Studio
 * Các kịch bản video mẫu để tạo video quảng cáo thời trang
 */

export interface VideoScene {
    id: string;
    order: number;
    environmentPrompt: string;
    overlayText?: string;
    overlayTextVi?: string;
    duration: number; // seconds
}

export interface VideoTemplate {
    id: string;
    name: string;
    nameVi: string;
    description: string;
    descriptionVi: string;
    thumbnail: string;
    category: 'lifestyle' | 'travel' | 'dating' | 'professional';
    scenes: VideoScene[];
}

export interface GeneratedScene {
    id: string;
    order: number;
    imageUrl: string;
    overlayText?: string;
}

// ============================================
// DEFAULT TEMPLATES
// ============================================

export const VIDEO_TEMPLATES: VideoTemplate[] = [
    {
        id: 'morning-glow',
        name: 'Morning Glow Up',
        nameVi: 'Biến Hình Buổi Sáng',
        description: 'Wake up and transform into a stunning look for the day',
        descriptionVi: 'Thức dậy và biến đổi thành diện mạo lộng lẫy cho ngày mới',
        thumbnail: '/templates/morning-glow.jpg',
        category: 'lifestyle',
        scenes: [
            {
                id: 'mg-1',
                order: 1,
                environmentPrompt: 'Cozy bedroom with morning sunlight streaming through sheer curtains, messy white bedsheets, warm golden hour lighting, peaceful morning atmosphere',
                overlayText: '7:00 AM - Nothing to wear?',
                overlayTextVi: '7:00 AM - Không có gì để mặc?',
                duration: 2,
            },
            {
                id: 'mg-2',
                order: 2,
                environmentPrompt: 'Luxurious walk-in closet with bright mirror lights, organized clothing racks, modern minimalist interior, fashion boutique vibes',
                overlayText: 'Found the perfect one!',
                overlayTextVi: 'Tìm thấy em nó rồi!',
                duration: 2,
            },
            {
                id: 'mg-3',
                order: 3,
                environmentPrompt: 'Trendy coffee shop with large windows, outdoor terrace seating, plants and greenery, Instagram-worthy aesthetic, sunny day',
                overlayText: 'Ready for the day!',
                overlayTextVi: 'Sẵn sàng cho ngày mới!',
                duration: 2,
            },
            {
                id: 'mg-4',
                order: 4,
                environmentPrompt: 'City street with modern architecture, golden hour lighting, fashion photography style, urban chic background',
                overlayText: 'Shop now ✨',
                overlayTextVi: 'Mua ngay ✨',
                duration: 2,
            },
        ],
    },
    {
        id: 'day-to-night',
        name: 'Day to Night',
        nameVi: 'Từ Ngày Đến Đêm',
        description: 'One outfit that works from office to dinner date',
        descriptionVi: 'Một bộ đồ cân được từ văn phòng đến hẹn hò tối',
        thumbnail: '/templates/day-to-night.jpg',
        category: 'professional',
        scenes: [
            {
                id: 'dtn-1',
                order: 1,
                environmentPrompt: 'Modern corporate office with glass windows, city skyline view, minimalist desk setup, professional business environment, bright daylight',
                overlayText: '9:00 AM - Office mode',
                overlayTextVi: '9:00 AM - Chế độ công sở',
                duration: 2,
            },
            {
                id: 'dtn-2',
                order: 2,
                environmentPrompt: 'Busy city street crossing during golden hour, fashion week atmosphere, urban lifestyle, stylish pedestrians in background',
                overlayText: '5:00 PM - Street style',
                overlayTextVi: '5:00 PM - Dạo phố',
                duration: 2,
            },
            {
                id: 'dtn-3',
                order: 3,
                environmentPrompt: 'Luxury rooftop bar at night, city lights bokeh background, elegant ambiance, romantic dinner setting, warm lighting',
                overlayText: '8:00 PM - Date night',
                overlayTextVi: '8:00 PM - Hẹn hò tối',
                duration: 2,
            },
        ],
    },
    {
        id: 'virtual-travel',
        name: 'Virtual Travel',
        nameVi: 'Du Lịch Ảo',
        description: 'Travel the world in one outfit',
        descriptionVi: 'Đi khắp thế giới với một bộ đồ',
        thumbnail: '/templates/virtual-travel.jpg',
        category: 'travel',
        scenes: [
            {
                id: 'vt-1',
                order: 1,
                environmentPrompt: 'Eiffel Tower Paris background, romantic French street, spring flowers, golden hour sunlight, travel photography style',
                overlayText: '📍 Paris, France',
                overlayTextVi: '📍 Paris, Pháp',
                duration: 2,
            },
            {
                id: 'vt-2',
                order: 2,
                environmentPrompt: 'Maldives tropical beach, crystal clear turquoise water, white sand, palm trees, luxury resort vibes, paradise vacation',
                overlayText: '📍 Maldives',
                overlayTextVi: '📍 Maldives',
                duration: 2,
            },
            {
                id: 'vt-3',
                order: 3,
                environmentPrompt: 'Tokyo Shibuya crossing at night, neon lights, Japanese urban aesthetic, anime vibes, cyberpunk atmosphere',
                overlayText: '📍 Tokyo, Japan',
                overlayTextVi: '📍 Tokyo, Nhật Bản',
                duration: 2,
            },
            {
                id: 'vt-4',
                order: 4,
                environmentPrompt: 'New York Times Square, bright billboards, yellow taxis, American dream vibes, fashion capital atmosphere',
                overlayText: '📍 New York, USA',
                overlayTextVi: '📍 New York, Mỹ',
                duration: 2,
            },
        ],
    },
    {
        id: 'pov-dating',
        name: 'POV Dating',
        nameVi: 'Góc Nhìn Hẹn Hò',
        description: 'First-person perspective romantic date',
        descriptionVi: 'Góc nhìn người yêu trong buổi hẹn hò',
        thumbnail: '/templates/pov-dating.jpg',
        category: 'dating',
        scenes: [
            {
                id: 'pov-1',
                order: 1,
                environmentPrompt: 'Inside luxury car passenger seat view, leather interior, city bokeh lights through window, romantic atmosphere, date pickup moment',
                overlayText: 'You look amazing today!',
                overlayTextVi: 'Hôm nay em xinh quá!',
                duration: 2,
            },
            {
                id: 'pov-2',
                order: 2,
                environmentPrompt: 'Fine dining restaurant table view, candlelight dinner, wine glasses, elegant ambiance, romantic date night setting',
                overlayText: 'Perfect dinner date',
                overlayTextVi: 'Bữa tối hoàn hảo',
                duration: 2,
            },
            {
                id: 'pov-3',
                order: 3,
                environmentPrompt: 'Night park with fairy string lights, romantic walking path, beautiful garden, dreamy atmosphere, love story vibes',
                overlayText: 'Magical night ✨',
                overlayTextVi: 'Đêm huyền diệu ✨',
                duration: 2,
            },
        ],
    },
];

// Helper function to get template by ID
export function getTemplateById(id: string): VideoTemplate | undefined {
    return VIDEO_TEMPLATES.find((t) => t.id === id);
}

// Helper function to get templates by category
export function getTemplatesByCategory(category: VideoTemplate['category']): VideoTemplate[] {
    return VIDEO_TEMPLATES.filter((t) => t.category === category);
}
