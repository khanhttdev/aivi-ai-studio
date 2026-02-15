# Analogic Specification - MCB AI Studio

## 1. Concept & Thiết kế (Aesthetics)
Ứng dụng được thiết kế theo phong cách **Studio DAW (Digital Audio Workstation)** chuyên nghiệp, tạo cảm giác như một trạm sản xuất âm thanh thực thụ.

- **Bảng màu (Palette):** Đỏ - Đen (Red-Black Gradient). Màu đen sâu tạo sự tập trung, màu đỏ đại diện cho năng lượng và thương hiệu MCB AI.
- **Hiệu ứng thị giác:** 
    - **Glassmorphism:** Sử dụng nền mờ (backdrop-blur) cho header và các bảng điều khiển nổi.
    - **Neon Glow:** Các nút bấm và thanh tiến độ có hiệu ứng phát sáng nhẹ (glow) màu đỏ khi hoạt động.
- **Typography:** Sử dụng font 'Inter' với độ dày (weight) biến thiên từ 300 (light) cho nội dung văn bản đến 900 (black) cho tiêu đề thương hiệu.

## 2. Ánh xạ Giọng đọc (Voice Mapping)
Trải nghiệm người dùng được xây dựng dựa trên sự tương đồng giữa tên nhân vật (BTV, MC) và đặc tính kỹ thuật của Gemini TTS:

- **Giọng "Lớn" (High Intensity):**
    - Ánh xạ tới `Charon` và `Puck`.
    - Phù hợp: Bản tin thời sự, TVC, Review bùng nổ.
- **Giọng "Vừa" (Medium Intensity):**
    - Ánh xạ tới `Zephyr`.
    - Phù hợp: Podcast, đọc báo, Vlog đời thường.
- **Giọng "Nhỏ" (Low Intensity):**
    - Ánh xạ tới `Kore` và `Fenrir` (ở mức âm lượng thấp).
    - Phù hợp: Radio tâm sự, kể chuyện đêm khuya, thiền.

## 3. Trải nghiệm Tương tác (UX)
- **Cơ chế "Floating Dashboard":** Bảng điều khiển tiến trình luôn nằm ở đáy màn hình, mô phỏng thanh điều khiển trong các phần mềm dựng phim/nhạc.
- **Trạng thái Segments:** Mỗi đoạn văn bản được hiển thị như một "track" riêng biệt trong danh sách, cho phép người dùng kiểm soát lỗi cục bộ mà không phải tạo lại toàn bộ văn bản dài.
- **Phản hồi thời gian thực:** Đếm từ và ước tính thời gian đọc ngay khi người dùng gõ phím.
