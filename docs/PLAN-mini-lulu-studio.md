# 🐱🐶 Kế hoạch Dự án: Mini-Lulu Creative Studio

## Tổng quan

Xây dựng **Mini-Lulu Creative Studio** - một ứng dụng web sáng tạo nội dung AI đa lĩnh vực từ góc nhìn của hai nhân vật động vật **Mini** và **Lulu**, tích hợp khả năng lồng ghép sản phẩm affiliate. Dự án lấy cảm hứng từ [Elite Animal Kitchen](https://appmeovat.tangstudio.store/) nhưng mở rộng phạm vi ra **toàn bộ đời sống xã hội**, không chỉ nấu ăn.

---

## 📊 Phân tích Website Tham chiếu (Elite Animal Kitchen)

### Điểm sáng đáng học hỏi

| # | Điểm sáng | Mô tả | Áp dụng cho Mini-Lulu |
|---|-----------|-------|----------------------|
| 1 | **Animal POV Protocol** | Kể chuyện qua góc nhìn động vật, nhân cách hóa với tính cách riêng | ✅ Mở rộng: Mini (tinh quái, thông minh) + Lulu (đáng yêu, hậu đậu) |
| 2 | **Product Placement Module** | Lồng ghép quảng cáo sản phẩm tự nhiên vào kịch bản (tên, công dụng, ảnh) | ✅ Tối ưu hóa thành **Affiliate Engine** với link tracking |
| 3 | **Multi-style Visuals** | 3 phong cách: Hyperrealistic, Pixar 3D, Real Person | ✅ Giữ nguyên + thêm phong cách **Chibi/Kawaii** cho Mini-Lulu |
| 4 | **Multi-language Engine** | Hỗ trợ 4 ngôn ngữ: Việt, Anh, Hàn, Nhật | ✅ Giữ nguyên, mở rộng thị trường quốc tế |
| 5 | **Dark Premium UI** | Giao diện đen + cam, hiệu ứng glow, card-based layout | ✅ Tùy chỉnh palette riêng cho Mini-Lulu (pastel/cute kết hợp dark) |
| 6 | **Viral Title Generator** | Tạo 3 tiêu đề viral kèm kịch bản | ✅ Mở rộng thêm hashtag, caption cho nhiều nền tảng |
| 7 | **Storyboard Pipeline** | Quy trình: Kịch bản → Scene → Hình ảnh → Video Motion Prompt | ✅ Giữ nguyên pipeline, tối ưu UX |

### Điểm cần cải thiện từ website gốc

| Vấn đề | Giải pháp cho Mini-Lulu |
|--------|------------------------|
| Chỉ tập trung vào nấu ăn | Mở rộng ra **10+ lĩnh vực** đời sống |
| Nhân vật chung chung (chó, mèo, gà...) | 2 nhân vật cố định **Mini & Lulu** với tính cách nhất quán |
| Không có hệ thống affiliate tracking | Xây dựng **Affiliate Engine** chuyên nghiệp |
| Không lưu trữ lịch sử | Tích hợp **Supabase** lưu trữ dự án |
| UI đẹp nhưng không responsive tối ưu | Mobile-first, responsive hoàn hảo |

---

## 🎭 Thiết kế Nhân vật

### Mini 🐱 (Mèo)
- **Tính cách**: Tinh quái, thông minh, hay đưa ra nhận xét sắc sảo
- **Giọng điệu**: Châm biếm nhẹ, quan sát tinh tế, mỉa mai dí dỏm
- **Vai trò**: "Reviewer nghiêm túc" - Đánh giá, phân tích, so sánh
- **Phù hợp cho**: Review sản phẩm, mẹo vặt, công nghệ, tài chính

### Lulu 🐶 (Chó)
- **Tính cách**: Hồn nhiên, lạc quan, hay gây "tai nạn" đáng yêu
- **Giọng điệu**: Vui vẻ, nhiệt tình, đôi khi ngây ngô hài hước
- **Vai trò**: "Người trải nghiệm" - Thử nghiệm, khám phá, chia sẻ
- **Phù hợp cho**: Du lịch, ẩm thực, thể thao, thời trang

---

## 🌍 Lĩnh vực Nội dung (Mở rộng từ nấu ăn)

| # | Lĩnh vực | Ví dụ nội dung | Affiliate tiềm năng |
|---|----------|----------------|---------------------|
| 1 | 🍳 **Ẩm thực** | Mini phê bình món ăn, Lulu thử nấu | Gia vị, dụng cụ bếp, thực phẩm |
| 2 | 🏠 **Nhà cửa & Mẹo vặt** | Mini review robot hút bụi, Lulu dọn dẹp | Đồ gia dụng, nội thất |
| 3 | 💻 **Công nghệ** | "Cái máy này bạn hay thù?" | Gadgets, phụ kiện điện tử |
| 4 | 💰 **Tài chính** | Mini dạy Lulu "tiết kiệm hạt" | App tài chính, sách |
| 5 | ✈️ **Du lịch** | Lulu khám phá địa điểm mới | Booking, đồ du lịch |
| 6 | 👗 **Thời trang** | Mini nhận xét outfit, Lulu thử đồ | Quần áo, phụ kiện |
| 7 | 💪 **Sức khỏe** | "Tại sao sen lại ăn cỏ?" | Thực phẩm chức năng |
| 8 | 📚 **Giáo dục** | Mini giải thích khoa học cho Lulu | Sách, khóa học online |
| 9 | 🎮 **Giải trí** | Cả hai chơi game/xem phim và react | Gaming gear, subscription |
| 10 | 🌿 **Lifestyle** | "Thế giới qua cửa sổ" | Cây cảnh, decor, nến thơm |

---

## 🏗️ Kiến trúc Kỹ thuật

### Tích hợp vào AIVI AI Studio

Dự án sẽ được xây dựng dưới dạng **module mới** trong ứng dụng Next.js hiện tại (`aivi-ai-studio`).

### Cấu trúc thư mục đề xuất

```
src/app/[locale]/mini-lulu/
├── page.tsx                    # Landing page Mini-Lulu Studio
├── layout.tsx                  # Layout riêng với theme Mini-Lulu 
├── create/
│   ├── page.tsx                # Trang tạo nội dung (multi-step wizard)
│   └── components/
│       ├── StepTopicInput.tsx   # Bước 1: Chọn lĩnh vực + nhập chủ đề
│       ├── StepCharacter.tsx    # Bước 2: Chọn góc nhìn (Mini/Lulu/Cả hai)
│       ├── StepAffiliate.tsx    # Bước 3: Cấu hình sản phẩm affiliate
│       ├── StepScriptPick.tsx   # Bước 4: Chọn kịch bản AI gợi ý
│       ├── StepStoryboard.tsx   # Bước 5: Xem storyboard chi tiết
│       └── StepExport.tsx       # Bước 6: Xuất & chia sẻ
├── history/
│   └── page.tsx                # Lịch sử dự án đã tạo
└── components/
    ├── CharacterAvatar.tsx      # Avatar Mini/Lulu với animation
    ├── CategorySelector.tsx     # Grid chọn lĩnh vực
    ├── AffiliatePanel.tsx       # Panel cấu hình sản phẩm
    ├── ScriptCard.tsx           # Card kịch bản
    ├── SceneFrame.tsx           # Khung hình storyboard
    └── ViralTitleBar.tsx        # Thanh tiêu đề viral
```

### API Routes

```
src/app/api/mini-lulu/
├── generate-scripts/route.ts   # Tạo kịch bản từ Gemini
├── generate-scenes/route.ts    # Tạo chi tiết scene
├── generate-image/route.ts     # Tạo hình ảnh AI
└── save-project/route.ts       # Lưu dự án vào Supabase
```

### Database (Supabase)

```sql
-- Bảng lưu dự án
CREATE TABLE mini_lulu_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  topic TEXT NOT NULL,
  category TEXT NOT NULL,
  character_pov TEXT NOT NULL,         -- 'mini' | 'lulu' | 'both'
  language TEXT DEFAULT 'Tiếng Việt',
  image_style TEXT DEFAULT 'Cartoon',
  affiliate_product TEXT,
  affiliate_utility TEXT,
  affiliate_image_url TEXT,
  scripts JSONB,
  selected_script_id INT,
  scenes JSONB,
  thumbnails JSONB,
  viral_titles JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng tracking affiliate
CREATE TABLE mini_lulu_affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES mini_lulu_projects(id),
  product_name TEXT,
  click_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🎨 Thiết kế UI/UX

### Palette màu Mini-Lulu

| Element | Màu | Hex |
|---------|-----|-----|
| Background | Đen than | `#0A0A0A` |
| Card | Xám đậm | `#141414` |
| Mini accent | Tím pastel | `#A78BFA` (violet-400) |
| Lulu accent | Cam ấm | `#FB923C` (orange-400) |
| Cả hai accent | Gradient tím→cam | `linear-gradient(135deg, #A78BFA, #FB923C)` |
| Text primary | Trắng | `#F8FAFC` |
| Text secondary | Xám nhạt | `#94A3B8` |

### Phong cách thiết kế
- **Dark Mode** premium như website tham chiếu
- **Card-based layout** với bo góc mềm mại
- **Glow effect** trên hover (tím cho Mini, cam cho Lulu)
- **Micro-animations**: Avatar Mini/Lulu phản ứng theo trạng thái
- **Step wizard** trực quan hơn (progress bar có icon Mini-Lulu)

---

## 📋 Phân rã Task (Theo thứ tự)

### Phase 1: Foundation (Nền tảng)
- [ ] Thiết kế và tạo Landing page Mini-Lulu Studio
- [ ] Xây dựng layout, theme, palette màu riêng
- [ ] Tạo component `CharacterAvatar` với animation
- [ ] Tạo component `CategorySelector` (10 lĩnh vực)

### Phase 2: Core Features (Tính năng cốt lõi)
- [ ] Xây dựng Step 1: Topic Input + Category Selection
- [ ] Xây dựng Step 2: Character POV Selection (Mini/Lulu/Both)
- [ ] Xây dựng Step 3: Affiliate Product Configuration
- [ ] Xây dựng API: Generate Scripts (Gemini AI)
- [ ] Xây dựng Step 4: Script Selection UI
- [ ] Xây dựng API: Generate Detailed Scenes
- [ ] Xây dựng Step 5: Storyboard View + Image Generation
- [ ] Xây dựng Step 6: Export & Share

### Phase 3: Database & Persistence (Lưu trữ)
- [ ] Tạo migration Supabase cho `mini_lulu_projects`
- [ ] Tạo migration cho `mini_lulu_affiliate_clicks`
- [ ] Xây dựng trang History (lịch sử dự án)
- [ ] API lưu/tải dự án

### Phase 4: Polish & i18n (Hoàn thiện)
- [ ] Thêm translation keys (vi.json, en.json)
- [ ] Responsive design (mobile-first)
- [ ] Micro-animations và transitions
- [ ] SEO meta tags cho trang Mini-Lulu

### Phase 5: Affiliate Engine (Mở rộng)
- [ ] Hệ thống tracking click affiliate
- [ ] Dashboard thống kê affiliate
- [ ] Template sản phẩm theo lĩnh vực

---

## ✅ Kế hoạch Xác minh (Verification)

### Kiểm tra tự động
- Build thành công: `npm run build`
- Lint check: `npm run lint`

### Kiểm tra thủ công
1. Truy cập `/vi/mini-lulu` → Kiểm tra landing page hiển thị đúng
2. Thực hiện full flow tạo nội dung từ Step 1 → Step 6
3. Kiểm tra responsive trên mobile (DevTools)
4. Kiểm tra i18n chuyển đổi VI/EN
5. Kiểm tra lưu/tải dự án từ Supabase

---

## ⚠️ Yêu cầu Xác nhận từ User

> [!IMPORTANT]
> Trước khi bắt tay vào code, cần xác nhận:
> 1. **Mini là con gì? Lulu là con gì?** (Tôi đề xuất Mini = Mèo 🐱, Lulu = Chó 🐶, nhưng bạn có thể thay đổi)
> 2. **Phong cách hình ảnh mặc định**: Pixar 3D hay Hyperrealistic?
> 3. **Bắt đầu từ Phase nào?** Đề xuất Phase 1 + 2 trước
> 4. **Trang Mini-Lulu nằm ở đâu trong navigation?** Thêm vào sidebar/menu chính?
> 5. **Có cần tạo logo/mascot riêng cho Mini và Lulu không?**
