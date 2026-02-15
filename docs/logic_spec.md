# Logic Specification - MCB AI Studio

## 1. Xử lý Văn bản (Text Processing)
Thuật toán `smartSplitText` giải quyết vấn đề giới hạn token và độ ổn định của API:
- **Nguyên tắc:** Chia văn bản thành các Segments tối đa 4000 ký tự.
- **Ưu tiên:** Tách theo đoạn văn (`\n`). 
- **Dự phòng:** Nếu một đoạn quá dài, thuật toán sử dụng Regex `/[^.!?]+[.!?]+(["']?)(?=\s|$)|[^.!?]+$/g` để tìm điểm ngắt câu tự nhiên, tránh cắt ngang lời nói.

## 2. Quản lý API & Hàng đợi (Concurrency Control)
- **Rate Limiting:** Sử dụng `MAX_CONCURRENT_REQUESTS = 1` để đảm bảo API không bị quá tải và audio trả về được xử lý tuần tự chính xác.
- **Key Rotation (Luân chuyển khóa):** 
    - Hệ thống nhận danh sách API Keys phân tách bởi dấu phẩy.
    - Nếu gặp lỗi `429 (Too Many Requests)` hoặc `Quota Exceeded`, logic trong `geminiService.ts` sẽ tự động chuyển sang Key tiếp theo trong mảng.

## 3. Tái cấu trúc Âm thanh (Audio Recomposition)
- **PCM to WAV:** Chuyển đổi dữ liệu thô (Raw PCM 16-bit LE) từ Gemini sang định dạng WAV bằng cách chèn 44-byte Header chuẩn.
- **Master Merging:**
    - Gộp nhiều file WAV thành 1 file Master duy nhất.
    - **Inter-segment Silence:** Chèn 0.8 giây im lặng (`silenceChunk`) giữa các đoạn để tạo khoảng nghỉ tự nhiên cho người nghe.
    - **Header Update:** Tính toán lại tổng dung lượng dữ liệu (`dataLength`) để cập nhật Header cho file Master.

## 4. Đồng bộ Playback
- **Playback Rate:** Sử dụng `audio.playbackRate = speed` để đồng bộ tốc độ nghe thử trên toàn bộ danh sách audio segments.
