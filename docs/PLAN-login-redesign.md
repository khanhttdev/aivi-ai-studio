# Kế hoạch Thiết kế lại Trang Đăng nhập & Tối ưu Đăng xuất (Login Redesign)

## 📌 Tổng quan Yêu cầu
- Đăng xuất: Chuyển hướng người dùng về trang chủ (`/[locale]`) ngay khi bấm log out.
- Lựa chọn Xác thực (Auth Methods):
  - Đăng nhập / Đăng ký bằng **Email & Mật khẩu** (Password).
  - Có thể Đăng nhập với **Magic Link** (Link xác thực gửi qua Email).
  - Xử lý Đăng ký & Đăng nhập bằng tài khoản **Google** (OAuth).
- Xác thực form (Input Validation) đầy đủ: Check email đúng chuẩn, mật khẩu đủ độ dài tối thiểu (VD: 6 ký tự).
- UI/UX & Toast Notifications: Hiển thị thông báo khi thành công (Đăng nhập, Đăng ký, Gửi Magic Link) hoặc bắt lỗi (Sai mật khẩu, Email đã tồn tại, Lỗi hệ thống).

## 📝 Phân tích Luồng Hoạt động (Workflow)
1. **Trạng thái: Nhập Form Đăng nhập / Đăng ký**
   - Hỗ trợ chuyển đổi giữa hai chế độ "Sign In" và "Sign Up".
   - Input Email & Password: 
     - Validation: Email hợp lệ, Password tối thiểu 6 ký tự.
   - Group Action:
     - Nút "Sign In / Sign Up": Gửi request đăng nhập (`signInWithPassword`) hoặc đăng ký (`signUp`) lên Supabase.
     - Nút "Send Magic Link": Gửi link đăng nhập qua email (`signInWithOtp`), chỉ cần nhập Email.
   - Social Login:
     - Nút "Continue with Google": Trực tiếp gọi hàm OAuth `signInWithOAuth({ provider: 'google' })`.
2. **Xử lý Kết quả (Supabase Auth)**
     - 🟢 Thành công: Chuyển vào luồng `/[locale]` (Home/Dashboard). Hiện Toast thông báo.
     - 🔴 Lỗi: Gọi Toast notification báo lỗi cụ thể (Invalid credentials, Email already in use, v.v.).
3. **Cập nhật tính năng Đăng xuất**
   - Rà soát hàm handle Logout ở các thành phần Layout (Header/Sidebar).
   - Đảm bảo gọi logic `supabase.auth.signOut()` kèm `router.push('/')` (chuyển hướng về Home) và `router.refresh()`.

## 🛠 Phân công Kỹ năng (Agents/Skills)
- `modern-web-architect`: Sử dụng React Hook Form + Zod (nếu có) hoặc custom state để quản lý Form và validation.
- `ui-ux-pro-max`: Xây dựng layout Login mượt mà, chuyên nghiệp.
- `security-armor`: Đảm bảo validation client-side và xử lý lỗi an toàn từ API Supabase.

## 🚀 Tasks Breakdown (Danh sách Công việc)
- [ ] Xây dựng lại layout `app/[locale]/login/page.tsx` hỗ trợ mode Đăng nhập và Đăng ký.
- [ ] Tích hợp logic xử lý Supabase: `signInWithPassword`, `signUp`, `signInWithOtp` (cho Magic Link) và `signInWithOAuth` (cho Google).
- [ ] Thêm validation cho form inputs (Email, Password).
- [ ] Thêm `toast` notification (Sử dụng `sonner`) cho các hành động và lỗi.
- [ ] Tìm và sửa logic hàm Đăng xuất (`handleSignOut`) để bắt buộc redirect về trang chủ (`/`).
- [ ] Kiểm thử toàn diện các luồng đăng nhập, đăng ký, đăng xuất.
