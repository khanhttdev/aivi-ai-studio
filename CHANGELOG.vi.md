# Nhật ký Thay đổi (CHANGELOG)

Tất cả các thay đổi đáng chú ý đối với dự án Mimi & Lulu sẽ được ghi lại trong tệp này.

## [0.2.1] - 2026-02-18

### 🐛 Vá lỗi & Cải thiện (Audit Fixes)
- **Fix Bug Locale Prefix**: Sửa lỗi `handleNewProject` trong `step-5-export` thiếu `/${locale}` prefix gây lỗi 404 khi nhấn "Dự án mới".
- **i18n Hoàn thiện**: Thay thế 8 hardcoded strings tiếng Việt trong `step-2-casting` và Dashboard bằng i18n keys chuẩn (hỗ trợ đầy đủ EN/VI).
- **Accessibility**: Thêm `aria-label` cho button xóa dự án và link tải ảnh.
- **Security**: Chạy `npm audit fix`, vá 12 packages có lỗ hổng.

---

## [0.2.0] - 2026-02-18

### ✨ Tính năng mới
- **Auto-Generate Thumbnails**: Tự động tạo ảnh thumbnail cho dự án nếu chưa có (dựa trên story idea), kèm trạng thái loading trực quan trên Dashboard.
- **Category Selection**: Tích hợp chọn danh mục vào luồng tạo dự án, thêm Step Progress Bar vào layout, và template theo danh mục ở Bước 1.
- **KOL Mini-Lulu Dashboard**: Giao diện quản lý dự án mới với lưu trữ đám mây Supabase, hỗ trợ đa ngôn ngữ (VI/EN).

### 🐛 Vá lỗi & Cải thiện
- **Sửa lỗi `auto-release.js`**: Khắc phục `TypeError: Assignment to constant variable` (đổi `const` thành `let`).
- **Đồng bộ Stats**: Cập nhật số liệu chính xác (11 Skills, 23 Agents, 22 Workflows, 12 Rules) vào README.

---

## [1.1.0] - 2026-02-16


### ✨ Tính năng mới (Mimi & Lulu)
- **Dashboard Dự án**: Giao diện mới chuyên nghiệp để quản lý tất cả các dự án Mimi & Lulu.
- **Lưu trữ Đám mây (Supabase)**: Tự động lưu và đồng bộ hóa tiến độ dự án trên mọi thiết bị.
- **Marketing Kit (ZIP)**: Hỗ trợ nén và tải về trọn bộ ảnh bìa, tiêu đề, và mô tả SEO tối ưu chỉ với 1 cú nhấp.
- **Hỗ trợ Đa ngôn ngữ**: Hoàn thiện bản dịch tiếng Việt và tiếng Anh cho toàn bộ quy trình.

### 🐛 Vá lỗi & Cải thiện
- **Sửa lỗi Nhân vật**: Thay thế các mô hình người mẫu bằng hình ảnh nhân vật Mimi (Mèo) và Lulu (Chó) nguyên bản.
- **Tự động lưu (Auto-save)**: Fix lỗi không kích hoạt lưu khi chuyển bước, thêm chỉ báo "Auto-Saving...".
- **Tối ưu Mobile**: 
  - Điều chỉnh vị trí trợ lý Mei để không đè lên các nút hành động.
  - Cải thiện nút Thông báo trên di động: Dẫn trực tiếp đến trang Profile để có trải nghiệm tốt hơn.
- **Bảo mật**: Khắc phục lỗi CSP liên quan đến hình ảnh từ Unsplash.
- **Avatar Trợ lý**: Thiết kế mới Avatar cho Mei với phong cách "cute" và hiện đại.

---
*Tổng hợp bởi Karo - Trợ lý AI của bạn.*
