/**
 * Course structure for the generator preview and future API.
 */

import type { LessonContentPayload } from "@/types/lesson";

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type LearningGoal = 'interview' | 'practical' | 'academic';
export type TimeCommitment = 'short' | 'medium' | 'deep';

export type LessonGenerationStatus = 'pending' | 'generating' | 'ready' | 'failed';

export interface Lesson {
  id: string;
  title: string;
  order: number;
  generation_status: LessonGenerationStatus;
  /** Only set when generation_status === 'ready' (e.g. from lesson view fetch) */
  content?: LessonContentPayload | null;
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Module {
  id: string;
  title: string;
  chapters: Chapter[];
}

export interface GeneratedCourse {
  id: string;
  title: string;
  topicPrompt: string;
  options?: {
    skillLevel?: SkillLevel;
    timeCommitment?: TimeCommitment;
    learningGoal?: LearningGoal;
  };
  modules: Module[];
  estimatedDuration?: string;
  generatedAt: number;
}

export interface GeneratorOptions {
  skillLevel?: SkillLevel;
  timeCommitment?: TimeCommitment;
  learningGoal?: LearningGoal;
}
