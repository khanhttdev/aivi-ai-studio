# PLAN - Voice Studio (Trang Tạo Giọng Đọc AI Chuyên Nghiệp)

## 📋 Tổng quan

Tạo trang **Voice Studio** cho phép người dùng chuyển đổi văn bản thành giọng đọc AI sử dụng **Gemini 2.5 Flash TTS**. Trang sử dụng **theme chính của ứng dụng AIVI** (Dark theme + Cyan/Rose accents + Glassmorphism) và tham khảo UX pattern từ **MCB AI Studio** (Google AI Studio).

### Tài liệu tham chiếu
- `docs/analogic_spec.md` → Voice Mapping: Charon, Puck, Zephyr, Kore, Fenrir
- `docs/logic_spec.md` → Logic: smartSplitText (4000 chars), Rate Limiting, PCM→WAV, Master Merging
- `docs/prompts.md` → Prompt: System Instruction, User Prompt, Voice Config (Modality.AUDIO)
- **MCB AI Studio** (Google AI Studio) → UX pattern: VoiceSelector categories, AudioList, Sticky ActionBar

---

## 🎨 Thiết kế UI (Tham chiếu MCB AI Studio + AIVI Theme)

### Nguyên tắc thiết kế chính

> [!IMPORTANT]
> - Dùng **AIVI Design System** hiện có trong `globals.css` (Cyan/Rose accents, glassmorphism, dark background)
> - **KHÔNG** tạo theme riêng (không dùng Red-Black DAW theme)
> - Tất cả components dùng class CSS có sẵn: `glass-card`, `btn-primary`, `btn-secondary`, `gradient-text`...

### Layout tổng thể (Single Page, không multi-step)

```
┌──────────────────────────────────────────────────────────┐
│ [AIVI Header - existing]                                  │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  🎙️ Voice Studio (Title + Subtitle)                       │
│                                                           │
│  ┌── VOICE SELECTOR ─────────────────────────────────┐   │
│  │  [Category Tabs - scrollable]                      │   │
│  │  Bản tin │ Phim tài liệu │ Sách nói │ Review │ ...│   │
│  │                                                     │   │
│  │  [Search Bar]                         [Count Badge] │   │
│  │                                                     │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │   │
│  │  │ Voice 1 │ │ Voice 2 │ │ Voice 3 │ │ Voice 4 │ │   │
│  │  │ Style   │ │ Style   │ │ Style   │ │ Style   │ │   │
│  │  │ Name    │ │ Name    │ │ Name    │ │ Name    │ │   │
│  │  │ Engine  │ │ Engine  │ │ Engine  │ │ Engine  │ │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                           │
│  ┌── CONTROLS ───────────────────────────────────────┐   │
│  │  [Tốc độ đọc: ════●══════ 1.0x]                   │   │
│  │  [Cao độ:      ════●══════ 0  ]                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                           │
│  ┌── TEXT INPUT ─────────────────────────────────────┐   │
│  │                                                     │   │
│  │  Textarea lớn                                       │   │
│  │  (Word count + Char count hiển thị realtime)        │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                           │
│  ┌── AUDIO RESULTS ──────────────────────────────────┐   │
│  │  Phần 1 │ ... text truncated ... │  ▶ │ ⏬         │   │
│  │  Phần 2 │ ... text truncated ... │  ▶ │ ⏬         │   │
│  │  Phần 3 │ ... generating...      │  ⏳ │            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                           │
├──────────────────────────────────────────────────────────┤
│ [STICKY ACTION BAR]                                       │
│  [🚀 Bắt đầu]  [📥 Gộp & Tải xuống]  [🗑️]  [████ 67%]  │
└──────────────────────────────────────────────────────────┘
```

### Mapping Components (MCB → AIVI)

| MCB AI Studio Component | AIVI Voice Studio Component | AIVI CSS Classes |
|---|---|---|
| Category tabs (`bg-red-600`) | Category tabs | `btn-primary` (active), `btn-secondary` (inactive) |
| Voice cards (`border-red-600`, `bg-red-950/10`) | Voice cards | `glass-card`, `border-[var(--accent-primary)]` |
| Controls panel (`bg-neutral-900/60`) | Controls panel | `glass-card` |
| Textarea (`bg-neutral-900/80`) | Textarea | `.input-field` hoặc custom glass style |
| Action bar (`bg-black/80, sticky bottom-8`) | Sticky action bar | `glass-card`, `backdrop-blur`, `sticky bottom-0` |
| Audio list items (`bg-neutral-900/50`) | Audio segment items | `glass-card` |
| Generate button (`bg-red-600`) | Generate button | `btn-primary` |
| Progress bar (`bg-red-600`) | Progress bar | CSS gradient (`var(--accent-primary)`) |

---

## 🏗️ Cấu trúc file

### Route mới
```
src/app/[locale]/voice-studio/
├── page.tsx            ← Trang chính Voice Studio (Single Page, "use client")
├── layout.tsx          ← Layout wrapper đơn giản (metadata)
```

### API Route
```
src/app/api/voice-studio/
├── generate/route.ts   ← POST: text + voiceId + pitch → base64 WAV audio
```

### Store (Zustand)
```
src/stores/voiceStudioStore.ts  ← State management
```

### Services
```
src/lib/services/voice-studio-service.ts ← smartSplitText, PCM→WAV, mergeWavBlobs
```

### Constants
```
src/lib/voice-studio/constants.ts ← CATEGORIES, VOICE_PRESETS, SAMPLE_RATE
```

### I18n
```
messages/vi.json → thêm namespace "VoiceStudio"
messages/en.json → thêm namespace "VoiceStudio"
```

### Navigation
```
src/components/layout/Header.tsx → thêm link "Voice Studio" vào navItems
```

---

## ⚙️ Logic xử lý (Tham chiếu MCB AI Studio)

### 1. Voice Presets & Categories

Theo pattern MCB AI Studio, voices được tổ chức theo **categories** (use case), mỗi voice có:
- `id`: unique identifier
- `categoryId`: thuộc category nào
- `name`: tên hiển thị (tiếng Việt)
- `geminiVoiceName`: Gemini TTS voice engine (`Charon`, `Puck`, `Zephyr`, `Kore`, `Fenrir`)
- `gender`: Nam/Nữ
- `style`: phong cách đọc

**12 Categories:** Bản tin thời sự, Phim tài liệu, Sách nói, Review/Vlog, Radio tâm sự, Radio phật pháp, Kể chuyện tình cảm, Kể chuyện đêm khuya, Kể chuyện trinh thám, Quảng cáo/TVC, MC/Thuyết trình, Ngoại ngữ/Quốc tế.

**14 Voice Presets** mapping tới 5 Gemini voices: Charon, Puck, Zephyr, Kore, Fenrir.

### 2. `smartSplitText(text: string): string[]`

Theo `logic_spec.md`:
- Chia text thành segments tối đa **4000 ký tự**
- Ưu tiên tách theo **đoạn văn** (`\n\n`)
- Dự phòng: tách theo **câu** `/[^.!?]+[.!?]+(["']?)(?=\s|$)|[^.!?]+$/g`

### 3. API Route `/api/voice-studio/generate`

- Nhận: `{ text: string, voiceId: string, pitch?: number }`
- Sử dụng Gemini SDK (`@google/genai`) server-side:
  ```
  Model: gemini-2.5-flash-preview-tts
  Modality: AUDIO only
  System Instruction: TTS_SYSTEM_INSTRUCTION (từ prompts.ts)
  User Prompt: 'Read exactly: "${text}"'
  Voice: Charon | Puck | Zephyr | Kore | Fenrir
  Sample Rate: 24000Hz
  ```
- Trả về: `{ audio: base64_wav_string }`
- PCM raw → chèn 44-byte WAV header server-side

### 4. Queue Processing (Client-side)

Theo MCB AI Studio pattern:
- `MAX_CONCURRENT_REQUESTS = 1` (tuần tự xử lý)
- useEffect theo dõi `segments` array → tự động pick segment `pending` → chuyển `processing` → gọi API → `completed` hoặc `error`
- Progress = `(completed + error) / total * 100`
- Sound notification khi hoàn thành 100%

### 5. Merge & Download

- Client-side merge: gộp tất cả WAV blobs (`completed`) thành 1 master WAV
- Chèn **0.7s silence** giữa các segments
- Download file: `AIVI_Voice_Master_{timestamp}.wav`

### 6. Playback Controls
- Speed: `0.5x → 2.0x` (step 0.1)
- Pitch: `-2 → +2` (step 1)
- Từng segment Play/Pause riêng
- `audio.playbackRate = speed`

---

## 📦 Zustand Store

```typescript
// src/stores/voiceStudioStore.ts

interface AudioSegment {
  id: string;
  text: string;
  blob: Blob | null;
  url: string | null;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

enum AppState {
  IDLE = 'idle',
  PROCESSING = 'processing',
  PAUSED = 'paused',
}

interface VoiceStudioState {
  // Input
  inputText: string;
  selectedCategory: string;
  selectedVoiceId: string;
  speed: number;     // 0.5 - 2.0
  pitch: number;     // -2 to +2
  
  // Processing
  appState: AppState;
  segments: AudioSegment[];
  isMerging: boolean;
  
  // Actions
  setInputText: (text: string) => void;
  setSelectedCategory: (catId: string) => void;
  setSelectedVoiceId: (voiceId: string) => void;
  setSpeed: (speed: number) => void;
  setPitch: (pitch: number) => void;
  handleGenerate: () => void;
  handleStop: () => void;
  handleClear: () => void;
  updateSegment: (id: string, data: Partial<AudioSegment>) => void;
  setAppState: (state: AppState) => void;
}
```

---

## 🌐 I18n (Namespace `VoiceStudio`)

```json
{
  "VoiceStudio": {
    "title": "Voice Studio",
    "subtitle": "Tạo giọng đọc AI chuyên nghiệp",
    "select_voice": "Chọn giọng đọc",
    "search_voice": "Tìm kiếm...",
    "voice_count": "giọng",
    "speed_label": "Tốc độ đọc",
    "pitch_label": "Cao độ",
    "input_placeholder": "Nhập nội dung cần tạo giọng đọc...",
    "word_count": "từ",
    "char_count": "ký tự",
    "btn_start": "Bắt đầu",
    "btn_continue": "Tiếp tục",
    "btn_stop": "Dừng",
    "btn_merge_download": "Gộp & Tải xuống",
    "btn_clear": "Xóa tất cả",
    "results_title": "Kết quả xử lý",
    "segment_label": "Phần",
    "status_pending": "Đang chờ",
    "status_processing": "Đang xử lý",
    "status_completed": "Hoàn thành",
    "status_error": "Lỗi",
    "error_no_api_key": "Vui lòng cấu hình API Key",
    "error_empty_text": "Vui lòng nhập văn bản",
    "error_generate": "Lỗi khi tạo giọng đọc",
    "merging": "Đang gộp file...",
    "merge_error": "Có lỗi khi gộp file"
  }
}
```

---

## 🧭 Navigation

Thêm vào `Header.tsx` → `navItems[]`:
```typescript
{ href: '/voice-studio', label: t('voice_studio'), icon: Mic }
```

Thêm vào i18n Navigation:
```json
"voice_studio": "Voice Studio"
```

---

## ✅ Verification Checklist

### Automated
- [ ] Build thành công (`npm run build`)
- [ ] Không có lỗi TypeScript
- [ ] Không có lỗi ESLint

### Manual
- [ ] Truy cập `/voice-studio` → hiển thị giao diện đúng AIVI theme
- [ ] VoiceSelector: chọn category → lọc voices → chọn voice → hiện checkmark
- [ ] Search: nhập tên → filter realtime
- [ ] Speed/Pitch sliders: kéo → value thay đổi
- [ ] Textarea: nhập text → word/char count realtime
- [ ] Generate: nhấn → segments xuất hiện → processing tuần tự → completed
- [ ] Play từng segment → audio phát đúng speed
- [ ] Download từng segment
- [ ] Gộp & Tải xuống → master WAV file
- [ ] Clear → reset toàn bộ
- [ ] Responsive mobile
- [ ] Header nav link hoạt động
- [ ] i18n: chuyển EN/VI → text thay đổi

---

## 📊 Phân công Task

| # | Task | Ưu tiên | File |
|---|------|---------|------|
| 1 | Constants (categories, voice presets) | 🔴 | `src/lib/voice-studio/constants.ts` |
| 2 | Service (smartSplitText, PCM→WAV, merge) | 🔴 | `src/lib/services/voice-studio-service.ts` |
| 3 | API Route (Gemini TTS) | 🔴 | `src/app/api/voice-studio/generate/route.ts` |
| 4 | Zustand Store | 🔴 | `src/stores/voiceStudioStore.ts` |
| 5 | Page UI (VoiceSelector + Controls + Textarea + AudioList + ActionBar) | 🔴 | `src/app/[locale]/voice-studio/page.tsx` |
| 6 | Layout | 🟡 | `src/app/[locale]/voice-studio/layout.tsx` |
| 7 | I18n keys | 🟡 | `messages/vi.json` + `messages/en.json` |
| 8 | Navigation | 🟢 | `Header.tsx` + i18n |
| 9 | Verification | 🟡 | Build + test |

---

## ⚠️ Lưu ý quan trọng

1. **Theme**: Dùng 100% AIVI Design System hiện có, KHÔNG tạo CSS mới không cần thiết
2. **API Key**: Server-side only (`process.env.NEXT_PUBLIC_GEMINI_API_KEY`), KHÔNG expose ra client
3. **Audio**: Gemini TTS trả PCM raw → chèn WAV header (44 bytes, 16-bit LE, 24000Hz, mono)
4. **Standalone**: Trang này không phụ thuộc Story Studio hay KOL Studio
5. **UX Flow**: Theo MCB AI Studio: chọn voice → điều chỉnh speed/pitch → nhập text → Generate → nghe/tải từng segment → Merge & Download master
