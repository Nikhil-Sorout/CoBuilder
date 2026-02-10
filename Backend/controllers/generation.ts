import { Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { getPool } from '../config/dbconfig';
import { AuthenticatedRequest } from '../middleware/auth';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const timeCommitmentMap: Record<string, string> = {
  quick: '1-2 weeks',
  medium: '3-6 weeks',
  'deep dive': '8+ weeks',
};

/** AI-generated course shape (camelCase) */
interface AICourse {
  title: string;
  topic: string;
  skillLevel: string;
  learningGoal: string;
  durationType: string;
  modules: Array<{
    title: string;
    order: number;
    chapters: Array<{
      title: string;
      order: number;
      lessons: Array<{ title: string; order: number }>;
    }>;
  }>;
}

export const generateCourse = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const pool = getPool();
  if (!pool) {
    res.status(500).json({ error: 'Database connection not available' });
    return;
  }

  const client = await pool.connect();

  try {
    const { topic, options } = req.body;
    const opts = options ?? {};
    const skill_level = opts.skill_level ?? 'Beginner';
    const time_commitment = opts.time_commitment ?? 'quick';
    const learning_goal = opts.learning_goal ?? 'Interview prep';

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      res.status(400).json({
        error: 'topic is required',
      });
      return;
    }

    const durationLabel =
      timeCommitmentMap[time_commitment as keyof typeof timeCommitmentMap] ||
      time_commitment;

    const prompt = `
You are a senior instructional designer specializing in building structured learning curricula.

Create a complete course using the following inputs:

Topic: ${topic}
Skill level: ${skill_level}   (Beginner | Intermediate | Advanced)
Learning goal: ${learning_goal}
Course duration: ${durationLabel}

Curriculum sizing rules (STRICT):
- quick (1–2 weeks): 3–4 modules
- medium (3–6 weeks): 5–7 modules
- deep dive (8+ weeks): 8–12 modules

Structure rules:
1. Organize content strictly as modules → chapters → lessons.
2. Each module should contain 3–5 chapters.
3. Each chapter should contain 3–6 lessons.
4. Ensure the curriculum progresses logically from fundamentals to advanced topics.
5. Titles must be concise and practical.
6. Include numeric ordering fields for modules, chapters, and lessons starting from 1.
7. Keep the curriculum aligned with the requested skill level and learning goal.
8. Output ONLY valid JSON. Do not include explanations, comments, or markdown.

Output format:

{
  "title": "Course Title",
  "topic": "User topic",
  "skillLevel": "Beginner | Intermediate | Advanced",
  "learningGoal": "Learning goal",
  "durationType": "quick | medium | deep dive",
  "modules": [
    {
      "title": "Module title",
      "order": 1,
      "chapters": [
        {
          "title": "Chapter title",
          "order": 1,
          "lessons": [
            {
              "title": "Lesson title",
              "order": 1
            }
          ]
        }
      ]
    }
  ]
}
`;

    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const parsed: AICourse = JSON.parse((result as { text?: string })?.text ?? '{}');

    if (!parsed.modules?.length) {
      throw new Error('Invalid course structure generated.');
    }

    const createdBy = req.user?.userId ?? null;

    await client.query('BEGIN');

    const courseInsert = await client.query(
      `INSERT INTO courses (title, topic, skill_level, learning_goal, duration_type, created_by, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, false)
       RETURNING id, title, topic, skill_level, learning_goal, duration_type, created_at`,
      [
        parsed.title,
        parsed.topic,
        parsed.skillLevel,
        parsed.learningGoal,
        parsed.durationType,
        createdBy,
      ]
    );
    const courseRow = courseInsert.rows[0];
    const courseId = courseRow.id;

    const responseModules: Array<{
      id: string;
      title: string;
      order: number;
      chapters: Array<{
        id: string;
        title: string;
        order: number;
        lessons: Array<{
          id: string;
          title: string;
          order: number;
          generation_status: string;
          content: null;
        }>;
      }>;
    }> = [];

    for (const mod of parsed.modules) {
      const modInsert = await client.query(
        `INSERT INTO modules (course_id, title, sort_order)
         VALUES ($1, $2, $3)
         RETURNING id, title, sort_order`,
        [courseId, mod.title, mod.order]
      );
      const modRow = modInsert.rows[0];
      const moduleId = modRow.id;

      const responseChapters: Array<{
        id: string;
        title: string;
        order: number;
        lessons: Array<{
          id: string;
          title: string;
          order: number;
          generation_status: string;
          content: null;
        }>;
      }> = [];

      for (const ch of mod.chapters ?? []) {
        const chInsert = await client.query(
          `INSERT INTO chapters (module_id, title, sort_order)
           VALUES ($1, $2, $3)
           RETURNING id, title, sort_order`,
          [moduleId, ch.title, ch.order]
        );
        const chRow = chInsert.rows[0];
        const chapterId = chRow.id;

        const responseLessons: Array<{
          id: string;
          title: string;
          order: number;
          generation_status: string;
          content: null;
        }> = [];

        for (const les of ch.lessons ?? []) {
          const lesInsert = await client.query(
            `INSERT INTO lessons (chapter_id, title, sort_order, generation_status, content)
             VALUES ($1, $2, $3, 'pending', NULL)
             RETURNING id, title, sort_order, generation_status, content`,
            [chapterId, les.title, les.order]
          );
          const lesRow = lesInsert.rows[0];
          responseLessons.push({
            id: lesRow.id,
            title: lesRow.title,
            order: lesRow.sort_order,
            generation_status: lesRow.generation_status,
            content: lesRow.content,
          });
        }

        responseChapters.push({
          id: chRow.id,
          title: chRow.title,
          order: chRow.sort_order,
          lessons: responseLessons,
        });
      }

      responseModules.push({
        id: modRow.id,
        title: modRow.title,
        order: modRow.sort_order,
        chapters: responseChapters,
      });
    }

    await client.query('COMMIT');

    const course = {
      id: courseId,
      title: courseRow.title,
      topic: courseRow.topic,
      skill_level: courseRow.skill_level,
      learning_goal: courseRow.learning_goal,
      duration_type: courseRow.duration_type,
      created_at: courseRow.created_at,
      modules: responseModules,
    };

    res.status(201).json({ course });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      /* ignore */
    }
    console.error('generateCourse error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};
