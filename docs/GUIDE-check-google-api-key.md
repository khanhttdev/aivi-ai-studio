# Hướng dẫn Kiểm tra Google API Key

## 1. Truy cập Google Cloud Console
- Đi tới: [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
- Đảm bảo bạn đang chọn đúng **Project** (kiểm tra góc trên bên trái).

## 2. Tìm API Key
- Trong danh sách "API Keys", tìm Key bạn đang sử dụng trong file `.env.local` (thường bắt đầu bằng `AIza...`).

## 3. Kiểm tra Quyền hạn (Restrictions)
- Nhấp vào tên của API Key để mở trang chi tiết.
- Tìm phần **API restrictions**:
  - Nếu chọn **"Don't restrict key"**: Key có toàn quyền truy cập tất cả API đã bật.
  - Nếu chọn **"Restrict key"**: Hãy đảm bảo **Generative Language API** đã được tích chọn trong danh sách.
  
## 4. Kiểm tra Enable API
- Đi tới: [https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com](https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com)
- Đảm bảo trạng thái là **"API Enabled"**.

## 5. (Nâng cao) Dùng thử lệnh Curl
Bạn có thể chạy lệnh sau trong terminal để kiểm tra nhanh:
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY"
```
Nếu trả về danh sách model (JSON), key hoạt động tốt.
Nếu trả về lỗi 403, key bị chặn hoặc sai quyền.
