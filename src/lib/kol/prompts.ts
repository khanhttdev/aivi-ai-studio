/**
 * KOL AI Prompts
 * Specialized prompts for KOL creation, cloning, and content generation
 */

import { KOLProfile, KOLTheme, CloneContext } from '@/lib/kol/types';

// ============================================
// PROFILE GENERATION PROMPTS
// ============================================

/**
 * Generate a KOL profile based on theme
 */
export function generateKOLProfilePrompt(
    kolName: string,
    themeName: string,
    channelPositioning: string
): string {
    return `You are an expert at creating influencer/KOL personas for social media content.

Based on the following information, create a detailed KOL profile:

**Name**: ${kolName}
**Theme**: ${themeName}
**Channel Positioning**: ${channelPositioning || 'Not specified - create a suitable positioning'}

IMPORTANT: This KOL MUST be VIETNAMESE (Vietnamese ethnicity, Vietnamese name, Vietnamese cultural context).
This KOL should be YOUNG (18-22 years old) to appeal to young audiences on TikTok.

STRICT GENDER CONSISTENCY RULES:
1. IF GENDER IS MALE:
   - Hair MUST be masculine styles (Short, Undercut, Side Part, Texture Crop, Mullet). 
   - DO NOT use female terms like "tóc dài xõa" (long hair let down), "kẹp càng cua" (claw clip), "thanh thoát" (delicate).
   - Face: Masculine structure.
2. IF GENDER IS FEMALE:
   - Hair can be long, medium, or short feminine styles.
   - Makeup and styling should be appropriate.

Create a JSON response with the following structure:
{
  "gender": "female" or "male",
  "ageRange": "18-22",
  "appearanceSummary": "a 1-2 sentence description of their overall look",
  "appearance": {
    "faceType": "oval/round/heart/square",
    "hairStyle": "detailed description (MUST match gender)",
    "hairColor": "color",
    "skinTone": "description",
    "bodyType": "description",
    "height": "approximate height"
  },
  "fashionStyle": "detailed description of fashion style (MUST match gender)",
  "personality": "personality traits",
  "dominantEmotion": "main emotional vibe when on camera",
  "expertise": "skills and knowledge they demonstrate on camera",
  "occupation": "influencer persona occupation",
  "hobbies": ["hobby1", "hobby2", "hobby3"],
  "voiceStyle": "how they speak - tone, pace, style",
  "charisma": "their presence and aura on camera"
}

Make the persona feel authentic and relatable for the niche.
Ensure ALL physical & fashion descriptions are logically consistent with the chosen Gender.
Return ONLY the JSON, no markdown formatting.`;
}

// ============================================
// BASE IMAGE GENERATION PROMPTS
// ============================================

/**
 * Generate the base/reference KOL image from profile
 */
export function generateBaseKOLImagePrompt(profile: KOLProfile): string {
    const { appearance, fashionStyle, dominantEmotion, charisma, gender, ageRange } = profile;

    return `Create a highly realistic portrait photo of a young Vietnamese ${gender === 'female' ? 'woman' : 'man'} KOL/influencer for social media content.

**Subject Details (VIETNAMESE ETHNICITY):**
- Age: ${ageRange} years old
- Face: ${appearance.faceType} face shape
- Hair: ${appearance.hairStyle}, ${appearance.hairColor}
- Skin: ${appearance.skinTone}
- Body: ${appearance.bodyType}
- Height: ${appearance.height || 'average'}

**Style & Vibe:**
- Fashion: ${fashionStyle}
- Expression: ${dominantEmotion}
- Charisma: ${charisma}

**Technical Requirements:**
- Portrait orientation (9:16 aspect ratio)
- Half-body or upper body shot
- Professional soft studio lighting
- Natural, smooth skin texture
- Expressive eyes with emotional depth
- Social media influencer photography style
- Highly realistic, NOT cartoon or anime
- High detail, crisp quality
- Clean white or neutral studio background

The result should look like a real person who could be a popular KOL on TikTok or Instagram.`;
}

// ============================================
// CLONE/CONTEXT IMAGE PROMPTS
// ============================================

/**
 * Generate identity-locked clone in new context
 * CRITICAL: Must maintain face consistency
 */
export function generateKOLClonePrompt(
    profile: KOLProfile,
    context: CloneContext,
    customOutfit?: string
): string {
    const outfit = customOutfit || context.suggestedOutfit;

    return `[IDENTITY-LOCKED GENERATION] Generate a new image of the EXACT SAME PERSON from the reference image.

⚠️ CRITICAL - ABSOLUTE IDENTITY PRESERVATION:
You MUST keep these elements 100% IDENTICAL to the reference:
- EXACT same face: eye shape, nose, lips, jawline, cheekbones
- EXACT same skin tone and complexion
- EXACT same hair color and style
- EXACT same facial proportions and distance between features
- The person must be INSTANTLY recognizable - like photographing the same person twice

**DO NOT:**
- Change any facial feature
- Alter skin tone
- Modify hair color or texture
- Make the person look older or younger
- Generate a "similar-looking" person - it MUST be the SAME person

**New Scene:**
- Environment: ${context.environmentPrompt}
- Outfit: ${outfit}
- Pose: Natural, confident, suitable for ${context.name}
- Expression: ${profile.dominantEmotion}

**Technical Requirements:**
- Portrait orientation (9:16 aspect ratio)
- Professional photography quality
- Natural lighting matching the environment
- Face should be clearly visible

🔒 FINAL CHECK: Before generating, ensure the face is IDENTICAL to the reference. This is the same person in a different outfit/location - NOT a new person.`;
}

/**
 * Identity lock prompt - append to every clone generation
 */
export const IDENTITY_LOCK_SUFFIX = `

⚠️ MANDATORY IDENTITY LOCK - DO NOT IGNORE:
This is a face-consistency critical task. The person in the generated image MUST be the EXACT SAME individual as the reference image.

1. FACE: Copy EXACTLY - same eye shape, nose bridge, lip fullness, jaw angle, cheekbones
2. SKIN: IDENTICAL tone, texture, and complexion - no alterations
3. HAIR: SAME color (not similar!), SAME style, SAME texture
4. AGE: SAME apparent age (18-22) - do not age up or down
5. RECOGNITION TEST: Anyone who knows this person should instantly recognize them

❌ UNACCEPTABLE: Generating a "similar looking" or "same type" person
✅ REQUIRED: The EXACT SAME INDIVIDUAL, just in a new setting/outfit

Think of it as: You're a photographer taking multiple photos of the SAME model in different outfits.`;

// ============================================
// TIKTOK SCRIPT PROMPTS
// ============================================

/**
 * Generate TikTok script based on KOL profile
 */
export function generateTikTokScriptPrompt(
    profile: KOLProfile,
    theme: KOLTheme,
    topic: string
): string {
    return `You are a viral TikTok content writer. Write a 20-30 second TikTok video script.

**KOL Persona:**
- Personality: ${profile.personality}
- Voice Style: ${profile.voiceStyle}
- Occupation: ${profile.occupation}
- Content Theme: ${theme.nameVi}

**Video Topic:** ${topic}

**Requirements:**
1. **Hook (0-3s)**: Start with an attention-grabbing line that stops scrolling
2. **Body (4-25s)**: Main content in the KOL's authentic voice
3. **CTA (26-30s)**: Soft call-to-action (follow, comment, or share)

**Rules:**
- Match the KOL's personality and speaking style
- Sound natural, like a real person talking
- Use casual, conversational Vietnamese
- Include emotional beats for engagement
- Keep it relatable and authentic

Return a JSON response:
{
  "hook": "Opening hook line",
  "body": "Main script content",
  "cta": "Call to action",
  "duration": 25,
  "voiceTone": "How to deliver this script"
}

Return ONLY the JSON, no markdown.`;
}

// ============================================
// PRODUCT INTEGRATION PROMPTS
// ============================================

/**
 * Generate KOL holding/wearing product
 * Used for Image Studio integration
 */
export function generateKOLWithProductPrompt(
    profile: KOLProfile,
    productDescription: string,
    environment: string
): string {
    return `Generate an image of the SAME person from the reference image featuring a product.

**CRITICAL - IDENTITY PRESERVATION:**
Keep 100% identical: face, skin, hair, body type. Must be recognizable.

**Product Integration:**
- Product: ${productDescription}
- Interaction: Natural product showcase (wearing/holding/using)
- Expression: ${profile.dominantEmotion}, confident with the product

**Scene:**
- Environment: ${environment}
- Lighting: Professional, flattering
- Composition: Product visible but person is the focus

**Technical Requirements:**
- Portrait orientation (9:16 aspect ratio)
- E-commerce/influencer marketing style
- Highly realistic, photographic quality

${IDENTITY_LOCK_SUFFIX}`;
}
