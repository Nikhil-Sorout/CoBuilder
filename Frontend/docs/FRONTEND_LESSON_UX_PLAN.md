# Frontend implementation plan: course & lesson UX

Use this plan to wire the frontend to the backend’s course structure, async lesson generation, and block-based content. The goal is a smooth UX: structure first, “Preparing lesson…” for pending content, then view and render blocks (with optional version history).

---

## 1. Data you get from the backend

### After course generation (`POST /generation/generateCourse`)

- **Course**: `id`, `title`, `topic`, `skill_level`, `learning_goal`, `duration_type`, `created_at`, `modules[]`.
- **Each lesson** (inside modules → chapters → lessons):
  - `id`, `title`, `order`
  - **`generation_status`**: `"pending"` | `"generating"` | `"ready"` | `"failed"`
  - **`content`**: `null` until status is `"ready"` (then it’s the block payload).

**UX rule:** Show the full course structure immediately. For each lesson, show status; only allow “View” (or equivalent) when `generation_status === 'ready'`. Never block the whole UI waiting for lesson content.

---

### When user opens a lesson (`GET /lessons/:id`)

- **If status is still pending/generating**  
  Response includes **`status: "generating"`** and no `content`.  
  **UX:** Show “Preparing lesson…” (and optionally a spinner). **Poll** the same endpoint every 3–5 seconds until you get content or `generation_status === 'failed'`.

- **If status is ready (no `?version=`)**  
  Response includes **`content`** (current version, same as in course response).  
  **UX:** Render the block-based content (heading, paragraph, code, quiz).

- **If user picks an old version**  
  Call **`GET /lessons/:id?version=N`**.  
  Response includes **`content`** for that version.  
  **UX:** Render the same block format; optionally show “Viewing version N” and a version selector.

### Version list (`GET /lessons/:id/versions`)

- Returns **`versions[]`**: `{ version, created_at, metadata }`.  
  **UX:** Use for a “Version” dropdown or list so the user can revisit older content.

---

## 2. Implementation steps (in order)

### Step 1 – Types and API types

- **Frontend lesson type** (e.g. in `CourseGenerator/types.ts` or `types/lesson.ts`):
  - Add **`order`** and **`generation_status`** to `Lesson`.
  - Add **`content`**: `LessonContentPayload | null` (only when ready).
- **Lesson content types** (match backend block format):
  - `LessonContentPayload`: `{ version: number; metadata?: {...}; blocks: LessonBlock[] }`.
  - `LessonBlock`: `{ id: string; type: 'heading' | 'paragraph' | 'code' | 'quiz'; data: ... }` (discriminated by `type`).
- **API layer** (`utils/api.ts`):
  - **`ApiLesson`**: ensure `generation_status: string`, `content: object | null` (not `string`).
  - Add **`getLesson(lessonId: string, version?: number)`** → returns lesson + content or `{ status: 'generating', ... }`.
  - Add **`getLessonVersions(lessonId: string)`** → returns `{ versions: { version, created_at, metadata }[] }`.

This keeps the rest of the app type-safe and aligned with the backend.

---

### Step 2 – Map backend course response to include status

- In **`apiMapper.ts`** (or wherever you map API → UI):
  - Map **`generation_status`** and **`order`** from each backend lesson to your frontend `Lesson` type.
  - Leave **`content`** as `null` in the list view (you only need it on the lesson view screen when status is `ready` or when loading a specific version).

So after generation, the course state in the UI has every lesson’s `id`, `title`, `order`, and **`generation_status`**. Use that everywhere in the course preview and navigation.

---

### Step 3 – Course preview: show lesson status and “View”

- In **CoursePreview** (or wherever you render modules → chapters → lessons):
  - For each lesson row, show:
    - **Title** (already have it).
    - **Status** (for UX clarity and to avoid opening not-ready lessons):
      - `pending` or `generating` → e.g. “Preparing lesson…” with a small spinner or pulse.
      - `ready` → “View” (or a chevron) and make the row tappable.
      - `failed` → “Unavailable” or “Failed” (no navigation, or “Retry” later if you add that).
  - **Navigation:** On press, only navigate to the lesson screen when `generation_status === 'ready'`. For pending/generating, either do nothing or show a toast: “Lesson is still being prepared.”
  - Pass **`lessonId`** (and optionally `courseId` for breadcrumbs or back navigation) into the lesson screen.

This keeps the UX smooth: structure is visible immediately, and users only open lessons that are ready (or you open and show “Preparing…” there).

---

### Step 4 – Lesson view screen and polling

- **New route:** e.g. **`app/lesson/[id].tsx`** (Expo Router) so URL is `/lesson/:id`.
- **State:** `lessonId` from route params; local state for:
  - `status: 'loading' | 'generating' | 'ready' | 'failed'`
  - `content: LessonContentPayload | null`
  - `lessonMeta`: `{ title, order, ... }` from the first successful response.
- **Initial fetch:** On mount, call **`getLesson(lessonId)`**.
  - If response has **`status === 'generating'`** (and no `content`):
    - Set UI state to **“Preparing lesson…”** (and optionally spinner).
    - **Poll:** `getLesson(lessonId)` every **3–5 seconds** (e.g. 4000 ms). When the response has **`content`** and no `status: 'generating'`, set `content` and `status: 'ready'`, stop polling, and render blocks.
    - If after many polls you get **`generation_status === 'failed'`**, set `status: 'failed'` and stop polling; show “This lesson couldn’t be generated.”
  - If response already has **`content`**:
    - Set `content` and `status: 'ready'`, render blocks, no polling.
- **Don’t block UI:** While status is `generating` or `loading`, show a single clear message and optional spinner; avoid layout jumps when content appears by reserving a sensible min-height or skeleton if you like.

This matches backend behavior: lesson content may arrive later; the frontend just polls until ready or failed.

---

### Step 5 – Block-based lesson renderer

- **Single component:** e.g. **`LessonContent`** that takes **`content: LessonContentPayload`** and maps **`content.blocks`** to block components.
- **Block components** (one per type):
  - **`BlockHeading`** – `data.level` (1–6), `data.text`; render as heading (e.g. `<Text style={headingStyle}>`).
  - **`BlockParagraph`** – `data.text`; render as body text.
  - **`BlockCode`** – `data.language`, `data.code`; render in a monospace block (optionally with syntax highlight later).
  - **`BlockQuiz`** – `data.question`, `data.options`, `data.answerIndex`, `data.explanation`; render as simple radio list + “Show explanation” (or reveal after selection).
- **Key:** Use **`block.id`** for list key; use **`block.type`** to choose the component. Same structure works for React Native and Web.

Do **not** render raw markdown or HTML; only use the structured blocks so behavior is consistent and future features (e.g. interactive quiz, code runner) are easy to add.

---

### Step 6 – Optional: version selector and “revisit older version”

- On the lesson screen, if you want “View older version”:
  - Call **`getLessonVersions(lessonId)`** when the lesson is ready (or on mount).
  - Show a small **Version** control (dropdown or list): “Current” + “Version 2”, “Version 1”, etc. (using `version` and maybe `created_at` from the list).
  - When user selects a version **N** (N ≥ 1):
    - Call **`getLesson(lessonId, N)`**.
    - Replace `content` in state with the response `content` and re-render the same **LessonContent** block renderer.
  - Optional: show “Viewing version N” near the version selector so the user knows they’re not on the latest.

This uses the backend’s versioned content and keeps UX clear.

---

### Step 7 – API client and errors

- **Timeouts:** Use a normal timeout for **`getLesson`** (e.g. 10s). Polling is short requests; no need for 90s.
- **Errors:** On 404, show “Lesson not found.” On 5xx or network error, show a retry option and optionally retry once after a short delay.
- **Credentials:** Use the same `apiClient` (with cookies on web) so authenticated users get the same behavior.

---

### Step 8 – Navigation and back behavior

- **To lesson:** From course preview, navigate to **`/lesson/[lessonId]`** (only when status is `ready`, or allow opening and show “Preparing…” on the lesson screen as above).
- **Back:** From lesson screen, go back to generator/course (e.g. `router.back()` or link to `/generator` with course in state/context so the preview is still there).
- If you store the **generated course** in context or state, returning to the generator can show the same course and updated lesson statuses if you ever refetch; for now, keeping course in generator screen state is enough.

---

## 3. UX summary

| Scenario | What to show | What to do |
|----------|----------------|------------|
| Course just generated | Full structure; each lesson shows status (Preparing… / View / Failed) | Only allow “View” when `generation_status === 'ready'` |
| User taps “View” on ready lesson | Navigate to lesson screen | Fetch `GET /lessons/:id`, render blocks |
| User opens lesson that’s still pending/generating | “Preparing lesson…” + optional spinner | Poll `GET /lessons/:id` every 3–5s until content or failed |
| Lesson content loaded | Render heading, paragraph, code, quiz blocks | Use block IDs as keys; no markdown/HTML |
| User selects older version | Same block renderer with different content | `GET /lessons/:id?version=N`, set content and re-render |
| Lesson failed | “This lesson couldn’t be generated” (and optionally “Retry” later) | No polling; stop spinner |

---

## 4. File checklist (suggested)

- **Types:** `types/lesson.ts` or extend `CourseGenerator/types.ts` (Lesson + `LessonContentPayload`, `LessonBlock`, etc.)
- **API:** `utils/api.ts` – `getLesson(id, version?)`, `getLessonVersions(id)`, and ensure `ApiLesson` has `generation_status`, `content` as object | null
- **Mapper:** `CourseGenerator/apiMapper.ts` – map `generation_status` and `order` onto `Lesson`
- **Preview:** `CourseGenerator/CoursePreview.tsx` – per-lesson status, “View” only when ready, navigate to `/lesson/[id]`
- **Lesson screen:** `app/lesson/[id].tsx` – fetch, polling when `status === 'generating'`, then render blocks
- **Block renderers:** e.g. `components/LessonBlocks/` – `LessonContent.tsx`, `BlockHeading.tsx`, `BlockParagraph.tsx`, `BlockCode.tsx`, `BlockQuiz.tsx`
- **Optional:** Version selector on lesson screen using `getLessonVersions` and `getLesson(id, version)`

---

## 5. Order of implementation

1. Types + API (`getLesson`, `getLessonVersions`, `ApiLesson` / lesson content types).  
2. apiMapper: include `generation_status` and `order`.  
3. CoursePreview: show status per lesson, “View” only when ready, navigate to `/lesson/[id]`.  
4. Lesson screen: route, fetch, polling, then block renderer.  
5. Block components: heading, paragraph, code, quiz.  
6. Optional: version selector and `?version=N` fetch.

This keeps the UX smooth: use the data returned by the backend as-is (structure first, status per lesson, content only when ready or when requesting a version), and avoid blocking the UI on lesson generation.
