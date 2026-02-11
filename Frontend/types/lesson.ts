/**
 * Lesson content: block-based format for lesson view (matches backend).
 * Used when generation_status === 'ready' or when loading a specific version.
 */

export type BlockType = "heading" | "paragraph" | "code" | "quiz";

export interface BlockHeading {
  id: string;
  type: "heading";
  data: { level: number; text: string };
}

export interface BlockParagraph {
  id: string;
  type: "paragraph";
  data: { text: string };
}

export interface BlockCode {
  id: string;
  type: "code";
  data: { language: string; code: string };
}

export interface BlockQuiz {
  id: string;
  type: "quiz";
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
  generatedAt?: string;
  model?: string;
  estimatedMinutes?: number;
}

export interface LessonContentPayload {
  version: number;
  metadata?: LessonContentMetadata;
  blocks: LessonBlock[];
}
