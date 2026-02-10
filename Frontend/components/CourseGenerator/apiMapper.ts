import type { ApiCourseResponse, ApiModule, ApiChapter, ApiLesson } from "@/utils/api";
import type { GeneratedCourse, Module, Chapter, Lesson } from "./types";

const DURATION_LABELS: Record<string, string> = {
  quick: "1–2 weeks",
  medium: "3–6 weeks",
  "deep dive": "8+ weeks",
};

function mapLesson(les: ApiLesson): Lesson {
  return { id: les.id, title: les.title };
}

function mapChapter(ch: ApiChapter): Chapter {
  return {
    id: ch.id,
    title: ch.title,
    lessons: (ch.lessons ?? []).map(mapLesson),
  };
}

function mapModule(mod: ApiModule): Module {
  return {
    id: mod.id,
    title: mod.title,
    chapters: (mod.chapters ?? []).map(mapChapter),
  };
}

/** Map backend course response to frontend GeneratedCourse */
export function apiCourseToGenerated(api: ApiCourseResponse): GeneratedCourse {
  return {
    id: api.id,
    title: api.title,
    topicPrompt: api.topic,
    modules: (api.modules ?? []).map(mapModule),
    estimatedDuration:
      DURATION_LABELS[api.duration_type] ?? api.duration_type,
    generatedAt: new Date(api.created_at).getTime(),
  };
}
