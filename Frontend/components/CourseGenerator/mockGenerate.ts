/**
 * Simulates progressive course generation for UX.
 * Replace with real API call that streams modules when backend is ready.
 */

import type { GeneratedCourse, GeneratorOptions, Module } from './types';

const MODULE_DELAY_MS = 600;
const CHAPTER_DELAY_MS = 200;

function slug(): string {
  return Math.random().toString(36).slice(2, 11);
}

function titleFromTopic(topic: string): string {
  const t = topic.trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/**
 * Builds a mock course structure from topic and options.
 * In production this would be the first chunk from the API.
 */
function buildMockModules(topic: string, _options?: GeneratorOptions): Module[] {
  const base = topic.trim() || 'Your topic';
  const level = _options?.skillLevel ?? 'intermediate';
  const prefix = level === 'beginner' ? 'Intro to ' : level === 'advanced' ? 'Advanced ' : '';

  return [
    {
      id: slug(),
      title: `${prefix}Foundations`,
      chapters: [
        { id: slug(), title: 'Core concepts', lessons: [{ id: slug(), title: 'Overview' }, { id: slug(), title: 'Key terms' }] },
        { id: slug(), title: 'Setup & context', lessons: [{ id: slug(), title: 'Getting started' }, { id: slug(), title: 'Environment' }] },
      ],
    },
    {
      id: slug(),
      title: `${prefix}Core ${base.split(' ')[0] || 'Skills'}`,
      chapters: [
        { id: slug(), title: 'Main techniques', lessons: [{ id: slug(), title: 'Technique 1' }, { id: slug(), title: 'Technique 2' }, { id: slug(), title: 'Practice' }] },
        { id: slug(), title: 'Patterns & best practices', lessons: [{ id: slug(), title: 'Patterns' }, { id: slug(), title: 'Common pitfalls' }] },
      ],
    },
    {
      id: slug(),
      title: `${prefix}Applied ${base.split(' ')[0] || 'Topics'}`,
      chapters: [
        { id: slug(), title: 'Real-world use', lessons: [{ id: slug(), title: 'Case study' }, { id: slug(), title: 'Project' }] },
        { id: slug(), title: 'Next steps', lessons: [{ id: slug(), title: 'Resources' }, { id: slug(), title: 'Further learning' }] },
      ],
    },
  ];
}

export type OnModuleReady = (module: Module, index: number) => void;

/**
 * Simulates progressive reveal: emits one module at a time.
 * Returns the full course when done.
 */
export async function generateCourseProgressive(
  topic: string,
  options: GeneratorOptions | undefined,
  onModule: OnModuleReady
): Promise<GeneratedCourse> {
  const modules = buildMockModules(topic, options);
  const course: GeneratedCourse = {
    id: slug(),
    title: titleFromTopic(topic),
    topicPrompt: topic.trim(),
    options,
    modules: [],
    estimatedDuration: '4–6 weeks',
    generatedAt: Date.now(),
  };

  for (let i = 0; i < modules.length; i++) {
    await new Promise((r) => setTimeout(r, MODULE_DELAY_MS));
    course.modules.push(modules[i]);
    onModule(modules[i], i);
  }

  return course;
}
