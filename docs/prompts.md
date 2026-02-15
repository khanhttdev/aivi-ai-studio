# Prompt Engineering - MCB AI Studio

Ứng dụng sử dụng các lớp Prompt được thiết kế để triệt tiêu tính "sáng tạo" của mô hình ngôn ngữ và ép buộc nó hoạt động như một cỗ máy TTS thuần túy.

## 1. System Instruction (Lệnh hệ thống)
Đây là lệnh quan trọng nhất được gửi trong cấu hình API để xác định vai trò của Gemini:

```text
You are a specialized Text-to-Speech (TTS) generator. 
Your SOLE function is to convert the provided text into audio. 
Do NOT answer questions. 
Do NOT generate any text. 
Do NOT explain. 
Read verbatim.
```
- **Mục tiêu:** Ngăn chặn việc AI tự ý tóm tắt văn bản hoặc thêm lời chào (ví dụ: "Chào bạn, đây là audio của bạn...").

## 2. User Prompt (Lệnh người dùng)
Mỗi đoạn văn bản được gửi đi sẽ được bọc trong một cấu trúc lệnh đơn giản nhưng nghiêm ngặt:

```text
Read exactly: "${text}"
```
- **Mục tiêu:** Sử dụng từ khóa "Read exactly" kết hợp với dấu ngoặc kép để định danh chính xác phạm vi văn bản cần chuyển thành giọng nói.

## 3. Voice Configuration (Cấu hình tham số)
Mặc dù không phải là prompt dạng văn bản, nhưng các tham số cấu hình đóng vai trò như "prompt kỹ thuật":

- **Modality:** `[Modality.AUDIO]` - Ép buộc kết quả trả về chỉ là dữ liệu âm thanh.
- **Voice Name:** Lựa chọn giữa `Charon`, `Puck`, `Kore`, `Fenrir`, `Zephyr` tùy thuộc vào sự lựa chọn của người dùng trong UI.
- **Sample Rate:** Cố định `24000Hz` để đảm bảo độ trung thực cao cho giọng nói tiếng Việt.
