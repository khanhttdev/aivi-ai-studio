# Kế hoạch Triển khai: KOL Mini (Mèo) & Lulu (Chó) - Lifestyle Series

## 1. Tổng quan Dự án
Tính năng mới cho phép tạo video TikTok ngắn (< 60s) với hai nhân vật chính:
- **Mini**: Mèo (Phong cách: Sang chảnh/Dễ thương?)
- **Lulu**: Chó (Phong cách: Ngốc nghếch/Năng động?)
- **Chủ đề**: Lifestyle (Daily vlog, review, funny situations)

## 2. Yêu cầu Chi tiết (Đã chốt)
> **✅ CẤU HÌNH ĐÃ CHỌN**
> 1. **Phong cách đồ họa**: **3D Animation (Pixar Style)** - Dễ thương, biểu cảm, lông mượt, ánh sáng cinematic.
> 2. **Giọng thoại**: **Có Voiceover** - Nhân vật sẽ có giọng nói (lồng tiếng hoặc AI Text-to-Speech phong cách hoạt hình/trẻ con/hài hước).
> 3. **Tương tác**: **Hybrid** - Gợi ý Concept mẫu (Templates) VÀ cho phép tự nhập ý tưởng (Custom).
> 4. **Định vị**: Tính năng tương tự KOL Studio nhưng chuyên biệt cho chủ đề **Động vật nhân cách hóa (Anthropomorphic Animals)**.

## 3. Các hạng mục triển khai

### A. Thiết kế Nhân vật (Character Design)
- **Concept Art**: 
  - Mini: Mèo Anh lông ngắn/Mèo Sphynx? Phụ kiện: Kính râm, nơ cổ...
  - Lulu: Golden Retriever/Poodle? Phụ kiện: Khăn quàng, balo...
- **Consistency**: Xây dựng System Prompt cho Image Generation để giữ nhất quán khuôn mặt và trang phục qua các khung hình.

### B. Kịch bản & Scene (Scripting)
- **Lifestyle Templates**: 
  - "Morning Routine": Mini thức dậy -> Lulu phá đám -> Ăn sáng.
  - "Unboxing": Mini mở hộp -> Lulu nhai hộp -> Mini dỗi.
  - "Reaction": Xem video hài hước -> Biểu cảm exaggerated.
- **Thời lượng**: Tối ưu video dưới 60s (Short-form content).

### C. Motion Prompt (Video Gen)
- **Prompt Engineering**: 
  - Tối ưu hóa prompt cho các engine video (Kling/Runway/Luma) để mô phỏng chuyển động tự nhiên của động vật.
  - Các keyword quan trọng: `high quality`, `fluid motion`, `cinematic lighting`, `fur texture`.

### D. Tích hợp AIVI Studio
- **Vị trí**: Tạo một module mới hoặc tích hợp vào `KOL Studio` hiện tại.
- **UI/UX**: 
  1. Chọn nhân vật (Mini/Lulu).
  2. Chọn chủ đề (Vlog/Review/Funny).
  3. Generate Scene -> Edit Script -> Generate Video.

## 4. Lộ trình dự kiến
1. **Pha 1 (Planning)**: Chốt Concept Art & Demo Prompt. (Hiện tại)
2. **Pha 2 (Design)**: Xây dựng UI chọn nhân vật và Template Script trong App.
3. **Pha 3 (Implementation)**: Tích hợp API Video Gen và Script Gen.
4. **Pha 4 (Testing)**: Testing chuyển động và tính nhất quán của nhân vật.
