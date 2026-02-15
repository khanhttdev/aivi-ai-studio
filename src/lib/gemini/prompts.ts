import { ClothingType, ColorConfig, ProcessingMode } from './types';

// 2. Chỉ dẫn theo loại trang phục (Clothing Type Directives)
const CLOTHING_DIRECTIVES: Record<ClothingType, string> = {
    FULL_OUTFIT: `The complete outfit. Preserve the layering interaction between top and bottom. Remove body parts.`,
    OUTERWEAR: `ONLY the outer layer (Jacket/Coat). Preserve zipper texture, buttons, collar structure, and cuff details. Remove inner layers and model.`,
    TOP: `ONLY the inner top. Focus on neckline stitching, fabric texture (ribbing/lace), and sleeve hems. Remove outer layers/model.`,
    BOTTOMS: `ONLY the Bottoms (Pants/Jeans/Skirt). CRITICAL: Preserve belt loops, button fly details, pocket stitching, and hem distress. Reconstruct the inside rear waistband.`,
    DRESS: `ONLY the Dress. Preserve the drape, waistline gathers, and fabric flow. Remove model completely.`,
    ACCESSORY: `ONLY the specific Accessory (Bag/Hat/Scarf). Focus on hardware (buckles, chains), leather grain, and stitching. Keep sharp edges.`,
    JEWELRY: `ONLY the Jewelry. CRITICAL: Preserve metallic luster, gemstone refraction, and specular highlights. Remove skin entirely.`,
    CUSTOM: `Follow user's custom instruction for target item selection.`,
};

// 3. Chỉ dẫn về màu sắc (Color Instructions)
const buildColorInstruction = (config: ColorConfig | null): string => {
    if (!config) return '';

    const hasRef = !!config.referenceImage;
    const hasColor = !!config.colorName || !!config.colorHex;
    const colorPrompt = config.colorName || config.colorHex || '';

    if (hasRef && hasColor) {
        return `- COLOR ACTION: Transfer texture from Ref Image + Apply Color Tone "${colorPrompt}".`;
    }
    if (hasRef) {
        return `- COLOR ACTION: Exact Color Match. Use the Ref Image's color palette for the [TARGET ITEM].`;
    }
    if (hasColor) {
        return `- COLOR ACTION: Recolor the [TARGET ITEM] to "${colorPrompt}". Keep original shadows and highlights.`;
    }
    return '';
};

// 1. Prompt Hệ thống (System Prompt)
export const buildExtractPrompt = (
    clothingType: ClothingType,
    colorConfig: ColorConfig | null,
    customPrompt?: string
): string => {
    const targetDescription = CLOTHING_DIRECTIVES[clothingType];
    const colorInstruction = buildColorInstruction(colorConfig);
    const customSection = customPrompt
        ? `\n- CUSTOM INSTRUCTION: ${customPrompt}`
        : '';

    return `Role: Expert High-End Fashion Retoucher & 3D Ghost Mannequin Specialist.
Objective: Transform the Input Image into a catalogue-ready Product Image.

[TARGET ITEM]: ${targetDescription}
${colorInstruction}${customSection}

--- EXECUTION PIPELINE ---

PHASE 1: MICRO-DETAIL ANALYSIS (Internal Step)
- Identify the Material: Is it denim, silk, leather, or cotton? -> PRESERVE the specific light reflection (matte vs glossy).
- Identify Hardware: Look for zippers, buttons, rivets, jewelry clasps. -> KEEP them sharp and metallic.
- Identify Texture: Look for ribbing, cable knits, or distress marks. -> DO NOT smooth them out.

PHASE 2: 3D GHOST MANNEQUIN RECONSTRUCTION
- Remove the model (head, limbs, skin) entirely.
- **The "Invisible Body" Rule**: The clothing must retain the shape of the body. Do not flatten it.
- **Interior Reconstruction**: 
   * For Pants: Create a realistic inner back waistband with a dark/neutral interior shade to show depth.
   * For Tops: Show the inner back neck label area.
   * For Sleeves/Cuffs: Show the opening with depth.

PHASE 3: LIGHTING & PRESERVATION
- **Texture Fidelity**: High frequency details (thread weave, stitching) must remain visible.
- **Lighting**: Soft studio lighting (Butterfly or Rembrandt). 
- **Shadows**: Add a contact shadow at the bottom for grounding.
- **Background**: Pure White (#FFFFFF).

OUTPUT:
- Return ONLY the final product image. 
- Ensure edges are crisp (no halo artifacts).`;
};

// Scene generation prompt for final image with AI model
export const buildScenePrompt = (
    modelDescription: string,
    environmentPrompt: string
): string => {
    return `PROFESSIONAL FASHION CAMPAIGN:
You are an expert fashion photographer.

SUBJECT: An AI fashion model with the following features: ${modelDescription}.
CLOTHING: The model is wearing the clothing item provided in the reference image.
ENVIRONMENT: ${environmentPrompt}.

EXECUTION:
1. Integrate the clothing item onto the model with perfect fit and photorealistic draping.
2. The model should have a natural, confident pose matching the environment.
3. Match the lighting of the environment onto the model and clothing.
4. Use a cinematic camera style with appropriate depth of field.
5. Ensure textures are incredibly high resolution (4k quality).

OUTPUT: A stunning, professional fashion editorial photograph.`;
};

// Video prompt builder for VEO 3.1
export const buildVideoPrompt = (
    sceneDescription: string,
    productDescription: string,
    style: 'cinematic' | 'commercial' | 'social' = 'commercial'
): string => {
    const styleGuide = {
        cinematic: 'Cinematic 24fps, shallow depth of field, dramatic lighting, luxury film grain',
        commercial: 'Bright studio commercial, clean lighting, professional high-end look',
        social: 'Dynamic social media style, upbeat movement, trendy fast cuts',
    };

    return `FASHION PRODUCT VIDEO:

SCENE: ${sceneDescription}
PRODUCT: ${productDescription}
STYLE: ${styleGuide[style]}

The model is wearing the clothing and performing natural movements like walking, turning, or posing.
Camera movements are smooth: orbiting, panning, or zooming to highlight product details.
Lighting must be consistent and professional.

RESOLUTION: 1080p, high quality motion.`;
};

// Mode-specific prompt wrapper
export const buildProcessingPrompt = (
    mode: ProcessingMode,
    clothingType: ClothingType,
    colorConfig: ColorConfig | null,
    customPrompt?: string
): string => {
    return buildExtractPrompt(clothingType, colorConfig, customPrompt);
};

/**
 * Video Scene prompt builder for 9:16 vertical format (TikTok/Reels/Shorts)
 * Used for batch generation of video story scenes
 */
export const buildVideoScenePrompt = (
    modelDescription: string,
    environmentPrompt: string,
    overlayText?: string
): string => {
    const textNote = overlayText
        ? `\nSCENE CONTEXT: This scene represents "${overlayText}" - ensure the mood and atmosphere match this narrative.`
        : '';

    return `VERTICAL FASHION VIDEO SCENE (STRICT 9:16 PORTRAIT FORMAT):

CRITICAL ASPECT RATIO REQUIREMENT:
- Output MUST be 9:16 vertical/portrait orientation (1080x1920 or equivalent ratio)
- This is for TikTok, Reels, and YouTube Shorts - VERTICAL ONLY
- DO NOT generate landscape or square images

SUBJECT: A fashion model with these features: ${modelDescription}
CLOTHING: The model is wearing the clothing item from the reference image.
ENVIRONMENT: ${environmentPrompt}${textNote}

EXECUTION GUIDELINES:
1. Frame the subject in a full-body or 3/4 shot to showcase the complete outfit
2. Use cinematic lighting that matches the environment (golden hour, neon, studio, etc.)
3. Model pose should be dynamic and engaging, suitable for short-form video content
4. Include environmental depth with bokeh background when appropriate
5. Maintain ultra-high quality, sharp focus on clothing details
6. Color grade to match social media aesthetic (vibrant, punchy colors)

OUTPUT:
- Single high-resolution image in STRICT 9:16 portrait format
- Professional fashion photography quality
- Ready for video slideshow use`;
};
