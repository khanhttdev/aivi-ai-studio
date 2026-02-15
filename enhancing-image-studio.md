# Enhancing Image Studio Plan

## Overview
This plan focuses on enhancing the Image Studio functionality, specifically adding user profile management for API keys, verifying the image generation flow, and resolving API errors.

## Tasks

### Phase 1: User Profile & API Keys
- [x] Create `src/app/profile/page.tsx` for user profile management.
- [x] Implement API Key input and saving (Supabase or LocalStorage).
- [x] Update API routes to use user's API key if available.

### Phase 2: Image Studio Logic Verification
- [x] Verify `LeftSidebar` -> `MiddleSidebar` -> `RightSidebar` data flow.
- [x] Ensure `generateFinalScene` uses the correct model (`gemini-3-pro-image-preview`).
- [x] Verify `finalResult` state update in Store.

### Phase 3: Error Handling (401/404)
- [x] specific error handling in `src/app/api/generate-image/route.ts`.
- [x] specific error handling in `src/lib/gemini/client.ts`.
- [x] Add loading/error states in UI components (Existing).

## Verification
- [x] Profile page loads and saves keys.
- [x] Image generation logic is connected.
- [x] Error messages are specific (401 handled).

## Status: COMPLETE
All tasks finished. API Key flow is now robust with BYOK support via LocalStorage.
