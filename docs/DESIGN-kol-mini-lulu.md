# Thiết kế: KOL Mini (Mèo) & Lulu (Chó)

## 1. Hồ sơ Nhân vật (Character Profiles)

### 🐱 Mini (The Boss)
- **Giống**: Mèo Anh Lông Ngắn (British Shorthair) - Màu xám xanh (Blue) hoặc Silver.
- **Tính cách**: Chảnh chọe, thông minh, hay phán xét, thích ngủ, tham ăn nhưng giả vờ sang trọng.
- **Ngoại hình**: Mập mạp, mặt tròn, mắt to vàng đồng, lông mượt như nhung. Thường đeo nơ cổ màu đỏ hoặc kính râm.
- **Giọng**: Giọng nữ/trẻ con hơi đanh đá, kiêu kỳ.

### 🐶 Lulu (The Sidekick)
- **Giống**: Chó Golden Retriever (hoặc Corgi - *Cần user chốt, tạm chọn Golden Retriver puppy*).
- **Tính cách**: Năng động quá mức, ngốc nghếch (clumsy), yêu đời, luôn tìm cách gây chú ý với Mini.
- **Ngoại hình**: Lông vàng óng, tai cụp, mắt long lanh, luôn thè lưỡi cười. Đeo khăn quàng cổ màu xanh.
- **Giọng**: Giọng nam/trẻ con ngọng nghịu, hớn hở.

## 2. System Prompts (Image Generation)

### 🎨 Phong cách Chung (Style Consistency)
> **Base Prompt**:
> `3d disney pixar style, animated movie character, high quality 3d render, unreal engine 5, octane render, cute, fluffy texture, expressive eyes, bright cinematic lighting, soft pastel colors, 8k resolution`

### 🐱 Mini Prompt
> `[Base Prompt], chubby british shorthair cat, silver grey fur, round face, grumpy but cute expression, wearing a red bow tie, sitting elegantly, soft fur details, big yellow eyes`

### 🐶 Lulu Prompt
> `[Base Prompt], golden retriever puppy, golden fluffy fur, happy tongue out expression, wearing a blue bandana, dynamic pose, friendly eyes, wagging tail`

### 🏠 Bối cảnh (Backgrounds)
- **Living Room**: `modern cozy living room, sunlight streaming through window, wooden floor, cat tower in background, bright and airy`
- **Park**: `sunny park with green grass, blue sky, trees in background, picnic mat`

## 3. Kịch bản Mẫu (Script Templates)

### Template 1: "Buổi sáng của Boss" (Morning Routine)
- **Scene 1**: Mini đang ngủ nướng trên sofa. (Prompt: `Mini sleeping on sofa, drooling slightly`)
- **Scene 2**: Lulu lao vào liếm mặt Mini. (Prompt: `Lulu jumping on sofa, licking Mini's face, blurring motion`)
- **Scene 3**: Mini cáu kỉnh đẩy Lulu ra. (Prompt: `Mini annoyed face, pushing Lulu away with paw`)
- **Scene 4**: Cả hai cùng ngồi chờ ăn trước bát rỗng. (Prompt: `Mini and Lulu sitting side by side looking at empty food bowls, hungry eyes`)

### Template 2: "Unboxing Kì Cục" (Funny Unboxing)
- **Scene 1**: Mini đứng cạnh một hộp các-tông to. (Prompt: `Mini standing next to a delivery box, curious`)
- **Scene 2**: Lulu chui tọt vào hộp. (Prompt: `Lulu stuck inside the box, bottom sticking out`)
- **Scene 3**: Mini đóng nắp hộp lại nhốt Lulu. (Prompt: `Mini sitting on top of the closed box, triumphant`)
- **Voiceover**: "Hôm nay mình unboxing món hàng mới... Ồ, là một chú chó ngốc!"

## 4. Cấu trúc Dữ liệu (Dự kiến)

```json
{
  "character": "mini | lulu | both",
  "style": "3d_pixar",
  "scenes": [
    {
      "visual_prompt": "...",
      "audio_script": "...",
      "duration": 5
    }
  ]
}
```
