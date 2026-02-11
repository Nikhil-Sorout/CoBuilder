/**
 * Lesson generation worker. Run as a separate process.
 * Picks pending lessons (FOR UPDATE SKIP LOCKED), generates content via LLM,
 * saves to lesson_content_versions and lessons.content.
 */
import 'dotenv/config';
import { connectDatabase, getPool } from '../config/dbconfig';
import { generateLessonContent } from '../services/lessonGeneration';
import { PoolClient } from 'pg';

const POLL_MS = Number(process.env.LESSON_WORKER_POLL_MS) || 4000;
const MAX_ATTEMPTS = Number(process.env.LESSON_WORKER_MAX_ATTEMPTS) || 3;

interface LessonRow {
  id: string;
  title: string;
  chapter_title: string;
  module_title: string;
  course_topic: string;
}

async function pickNextLesson(client: PoolClient): Promise<LessonRow | null> {
  const q = `
    SELECT l.id, l.title, c.title AS chapter_title, m.title AS module_title, co.topic AS course_topic
    FROM lessons l
    JOIN chapters c ON l.chapter_id = c.id
    JOIN modules m ON c.module_id = m.id
    JOIN courses co ON m.course_id = co.id
    WHERE l.generation_status = 'pending'
      AND l.generation_attempts < $1
    ORDER BY l.created_at
    LIMIT 1
    FOR UPDATE OF l SKIP LOCKED
  `;
  const r = await client.query(q, [MAX_ATTEMPTS]);
  if (r.rows.length === 0) return null;
  return r.rows[0] as LessonRow;
}

async function markGenerating(
  client: PoolClient,
  lessonId: string
): Promise<void> {
  await client.query(
    `UPDATE lessons
     SET generation_status = 'generating', generation_attempts = generation_attempts + 1
     WHERE id = $1`,
    [lessonId]
  );
}

async function getNextVersion(
  client: PoolClient,
  lessonId: string
): Promise<number> {
  const r = await client.query(
    `SELECT COALESCE(MAX(version), 0) AS v FROM lesson_content_versions WHERE lesson_id = $1`,
    [lessonId]
  );
  return (r.rows[0]?.v ?? 0) + 1;
}

async function saveSuccess(
  client: PoolClient,
  lessonId: string,
  content: unknown,
  estimatedMinutes: number | null
): Promise<void> {
  const version = await getNextVersion(client, lessonId);
  await client.query(
    `INSERT INTO lesson_content_versions (lesson_id, version, content, metadata)
     VALUES ($1, $2, $3, $4)`,
    [
      lessonId,
      version,
      JSON.stringify(content),
      JSON.stringify((content as { metadata?: unknown })?.metadata ?? {}),
    ]
  );
  await client.query(
    `UPDATE lessons
     SET generation_status = 'ready', content = $1, updated_at = NOW(),
         estimated_minutes = COALESCE($2, estimated_minutes)
     WHERE id = $3`,
    [JSON.stringify(content), estimatedMinutes, lessonId]
  );
}

async function saveFailure(
  client: PoolClient,
  lessonId: string,
  errorMessage: string,
  attempts: number
): Promise<void> {
  await client.query(
    `INSERT INTO lesson_generation_logs (lesson_id, error) VALUES ($1, $2)`,
    [lessonId, errorMessage]
  );
  const newStatus = attempts >= MAX_ATTEMPTS ? 'failed' : 'pending';
  await client.query(
    `UPDATE lessons SET generation_status = $1, updated_at = NOW() WHERE id = $2`,
    [newStatus, lessonId]
  );
}

async function runOne(): Promise<boolean> {
  const pool = getPool();
  if (!pool) {
    console.error('Worker: no database pool');
    return false;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const lesson = await pickNextLesson(client);
    if (!lesson) {
      await client.query('COMMIT');
      return false;
    }

    await markGenerating(client, lesson.id);
    await client.query('COMMIT');

    // Generate outside transaction (LLM can take 10–40s)
    const ctx = {
      lessonTitle: lesson.title,
      chapterTitle: lesson.chapter_title,
      moduleTitle: lesson.module_title,
      courseTopic: lesson.course_topic,
    };
    let content: Awaited<ReturnType<typeof generateLessonContent>>;
    try {
      content = await generateLessonContent(ctx);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      const client2 = await pool.connect();
      try {
        const attemptsResult = await client2.query(
          `SELECT generation_attempts FROM lessons WHERE id = $1`,
          [lesson.id]
        );
        const attempts = attemptsResult.rows[0]?.generation_attempts ?? 1;
        await client2.query('BEGIN');
        await saveFailure(client2, lesson.id, errMsg, attempts);
        await client2.query('COMMIT');
      } catch (e2) {
        await client2.query('ROLLBACK').catch(() => {});
        console.error('Worker: failed to save failure state:', e2);
      } finally {
        client2.release();
      }
      console.error(`Worker: lesson ${lesson.id} LLM error:`, e);
      return true;
    }

    const client2 = await pool.connect();
    try {
      await client2.query('BEGIN');
      if (content) {
        const est =
          (content.metadata?.estimatedMinutes as number | undefined) ?? null;
        await saveSuccess(client2, lesson.id, content, est);
        await client2.query('COMMIT');
        console.log(`Worker: lesson ${lesson.id} ready (${lesson.title})`);
      } else {
        const attemptsResult = await client2.query(
          `SELECT generation_attempts FROM lessons WHERE id = $1`,
          [lesson.id]
        );
        const attempts = attemptsResult.rows[0]?.generation_attempts ?? 1;
        await saveFailure(
          client2,
          lesson.id,
          'Invalid or missing content from LLM',
          attempts
        );
        await client2.query('COMMIT');
        console.warn(`Worker: lesson ${lesson.id} failed validation`);
      }
    } catch (e) {
      await client2.query('ROLLBACK').catch(() => {});
      const attemptsResult = await client2.query(
        `SELECT generation_attempts FROM lessons WHERE id = $1`,
        [lesson.id]
      );
      const attempts = attemptsResult.rows[0]?.generation_attempts ?? 1;
      await client2.query('BEGIN');
      await saveFailure(
        client2,
        lesson.id,
        e instanceof Error ? e.message : String(e),
        attempts
      );
      await client2.query('COMMIT');
      console.error(`Worker: lesson ${lesson.id} error:`, e);
    } finally {
      client2.release();
    }

    return true;
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Worker runOne error:', e);
    return false;
  } finally {
    client.release();
  }
}

async function loop(): Promise<void> {
  console.log('Lesson worker started. Poll interval:', POLL_MS, 'ms');
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const hadWork = await runOne();
      if (!hadWork) {
        await new Promise((r) => setTimeout(r, POLL_MS));
      }
    } catch (e) {
      console.error('Worker loop error:', e);
      await new Promise((r) => setTimeout(r, POLL_MS));
    }
  }
}

async function main(): Promise<void> {
  try {
    await connectDatabase();
  } catch (e) {
    console.error('Cannot connect to database. Check DB_* env.', e);
    process.exit(1);
  }
  await loop();
}

main();
