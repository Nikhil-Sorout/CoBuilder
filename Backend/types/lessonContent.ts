/**
 * Lesson content: versioned block-based format for RN + Web.
 * Stored in lessons.content (current) and lesson_content_versions (history).
 */

export const LESSON_CONTENT_VERSION = 1;

export type BlockType = 'heading' | 'paragraph' | 'code' | 'quiz';

export interface BlockHeading {
  id: string;
  type: 'heading';
  data: { level: number; text: string };
}

export interface BlockParagraph {
  id: string;
  type: 'paragraph';
  data: { text: string };
}

export interface BlockCode {
  id: string;
  type: 'code';
  data: { language: string; code: string };
}

export interface BlockQuiz {
  id: string;
  type: 'quiz';
  data: {
    question: string;
    options: string[];
    answerIndex: number;
    explanation?: string;
  };
}

export type LessonBlock =
  | BlockHeading
  | BlockParagraph
  | BlockCode
  | BlockQuiz;

export interface LessonContentMetadata {
  generatedAt?: string; // ISO date
  model?: string;
  estimatedMinutes?: number;
}

export interface LessonContentPayload {
  version: number;
  metadata?: LessonContentMetadata;
  blocks: LessonBlock[];
}

function isNonEmptyString(x: unknown): x is string {
  return typeof x === 'string' && x.length > 0;
}

function isBlock(obj: unknown): obj is LessonBlock {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  if (!isNonEmptyString(o.id) || !isNonEmptyString(o.type)) return false;
  if (typeof o.data !== 'object' || o.data === null) return false;
  const data = o.data as Record<string, unknown>;
  switch (o.type) {
    case 'heading':
      return (
        typeof data.level === 'number' &&
        data.level >= 1 &&
        data.level <= 6 &&
        isNonEmptyString(data.text)
      );
    case 'paragraph':
      return isNonEmptyString(data.text);
    case 'code':
      return (
        isNonEmptyString(data.language) && typeof data.code === 'string'
      );
    case 'quiz':
      return (
        isNonEmptyString(data.question) &&
        Array.isArray(data.options) &&
        data.options.every((opt: unknown) => typeof opt === 'string') &&
        typeof data.answerIndex === 'number' &&
        data.answerIndex >= 0 &&
        data.answerIndex < (data.options as string[]).length
      );
    default:
      return false;
  }
}

/**
 * Validate that payload matches LessonContentPayload. Returns the payload if valid, null otherwise.
 */
export function validateLessonContent(
  raw: unknown
): LessonContentPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const version = o.version;
  if (typeof version !== 'number' || version < 1) return null;
  if (!Array.isArray(o.blocks)) return null;
  if (!o.blocks.every(isBlock)) return null;
  const metadata = o.metadata;
  const metaOk =
    metadata === undefined ||
    (metadata !== null &&
      typeof metadata === 'object' &&
      (metadata as LessonContentMetadata).generatedAt === undefined ||
        typeof (metadata as LessonContentMetadata).generatedAt === 'string') &&
      ((metadata as LessonContentMetadata).model === undefined ||
        typeof (metadata as LessonContentMetadata).model === 'string') &&
      ((metadata as LessonContentMetadata).estimatedMinutes === undefined ||
        typeof (metadata as LessonContentMetadata).estimatedMinutes === 'number');
  if (!metaOk) return null;
  return {
    version,
    metadata: metadata as LessonContentMetadata | undefined,
    blocks: o.blocks as LessonBlock[],
  };
}
