import { GoogleGenAI } from '@google/genai';
import {
  LessonContentPayload,
  LESSON_CONTENT_VERSION,
  validateLessonContent,
} from '../types/lessonContent';
import { randomUUID } from 'crypto';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = process.env.GEMINI_LESSON_MODEL || 'gemini-2.0-flash';

export interface LessonContext {
  lessonTitle: string;
  chapterTitle?: string;
  moduleTitle?: string;
  courseTopic?: string;
}

function buildPrompt(ctx: LessonContext): string {
  const { lessonTitle, chapterTitle, moduleTitle, courseTopic } = ctx;
  const context = [courseTopic, moduleTitle, chapterTitle].filter(Boolean).join(' → ');
  return `
You are an expert instructional designer. Generate a single lesson's content as structured JSON.

Lesson title: ${lessonTitle}
${context ? `Context: ${context}` : ''}

Requirements:
- Output ONLY valid JSON. No markdown, no code fences, no explanation.
- Use this exact structure (version 1, block-based format).
- Each block must have a unique "id" (UUID v4 style string).
- Include 4–10 blocks: mix of heading, paragraph, and at least one code block if the topic is technical; optionally one quiz block.
- Headings: use "heading" with data.level 1–3 and data.text.
- Paragraphs: use "paragraph" with data.text (clear, concise).
- Code: use "code" with data.language and data.code (short, relevant snippet).
- Quiz (optional): use "quiz" with data.question, data.options (array of strings), data.answerIndex (0-based), data.explanation (optional).

Output format (copy this structure exactly):

{
  "version": 1,
  "metadata": {
    "generatedAt": "<ISO8601 date>",
    "model": "${MODEL}",
    "estimatedMinutes": 10
  },
  "blocks": [
    {
      "id": "<uuid>",
      "type": "heading",
      "data": { "level": 2, "text": "Section title" }
    },
    {
      "id": "<uuid>",
      "type": "paragraph",
      "data": { "text": "Explanation..." }
    },
    {
      "id": "<uuid>",
      "type": "code",
      "data": { "language": "javascript", "code": "// example" }
    },
    {
      "id": "<uuid>",
      "type": "quiz",
      "data": {
        "question": "What is...?",
        "options": ["A", "B", "C"],
        "answerIndex": 0,
        "explanation": "Because..."
      }
    }
  ]
}
`;
}

/** Ensure every block has a valid id (UUID). */
function ensureBlockIds(payload: LessonContentPayload): LessonContentPayload {
  const blocks = payload.blocks.map((b) => ({
    ...b,
    id: typeof b.id === 'string' && b.id.length > 0 ? b.id : randomUUID(),
  }));
  return { ...payload, blocks };
}

/**
 * Generate lesson content via LLM. Returns validated payload or null on parse/validation failure.
 */
export async function generateLessonContent(
  ctx: LessonContext
): Promise<LessonContentPayload | null> {
  const prompt = buildPrompt(ctx);
  const result = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });
  const text = (result as { text?: string })?.text ?? '';
  let parsed: unknown;
  try {
    parsed = JSON.parse(text || '{}');
  } catch {
    return null;
  }
  const validated = validateLessonContent(parsed);
  if (!validated) return null;
  if (validated.version !== LESSON_CONTENT_VERSION) return null;
  return ensureBlockIds(validated);
}
