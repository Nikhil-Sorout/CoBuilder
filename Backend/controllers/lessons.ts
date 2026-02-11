import { Request, Response } from 'express';
import { getPool } from '../config/dbconfig';

/**
 * GET /lessons/:id
 * Query: ?version=N to get a specific content version (from lesson_content_versions).
 * When generation_status is pending or generating, returns { status: 'generating' }.
 * When ready (and no version param), returns lesson with content (current from lessons.content).
 * When version param, returns lesson with content from lesson_content_versions.
 */
export const getLesson = async (req: Request, res: Response): Promise<void> => {
  const pool = getPool();
  if (!pool) {
    res.status(500).json({ error: 'Database connection not available' });
    return;
  }

  const { id } = req.params;
  const versionParam = req.query.version;

  if (!id) {
    res.status(400).json({ error: 'Lesson id is required' });
    return;
  }

  try {
    const lessonResult = await pool.query(
      `SELECT l.id, l.chapter_id, l.title, l.sort_order, l.generation_status,
              l.content, l.estimated_minutes, l.created_at, l.updated_at
       FROM lessons l
       WHERE l.id = $1`,
      [id]
    );

    if (lessonResult.rows.length === 0) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    const row = lessonResult.rows[0];
    const status = row.generation_status;

    if (status === 'pending' || status === 'generating') {
      res.status(200).json({
        id: row.id,
        chapter_id: row.chapter_id,
        title: row.title,
        order: row.sort_order,
        generation_status: status,
        status: 'generating',
      });
      return;
    }

    let content = row.content;

    if (versionParam !== undefined) {
      const v = Number(versionParam);
      if (!Number.isInteger(v) || v < 1) {
        res.status(400).json({ error: 'version must be a positive integer' });
        return;
      }
      const versionResult = await pool.query(
        `SELECT content, version, created_at
         FROM lesson_content_versions
         WHERE lesson_id = $1 AND version = $2`,
        [id, v]
      );
      if (versionResult.rows.length === 0) {
        res.status(404).json({ error: 'Version not found' });
        return;
      }
      content = versionResult.rows[0].content;
    }

    res.status(200).json({
      id: row.id,
      chapter_id: row.chapter_id,
      title: row.title,
      order: row.sort_order,
      generation_status: row.generation_status,
      content,
      estimated_minutes: row.estimated_minutes,
      created_at: row.created_at,
      updated_at: row.updated_at,
    });
  } catch (e) {
    console.error('getLesson error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /lessons/:id/versions
 * List available content versions for a lesson (for "revisit older version" UI).
 */
export const getLessonVersions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const pool = getPool();
  if (!pool) {
    res.status(500).json({ error: 'Database connection not available' });
    return;
  }

  const { id } = req.params;
  if (!id) {
    res.status(400).json({ error: 'Lesson id is required' });
    return;
  }

  try {
    const lessonCheck = await pool.query(
      'SELECT id FROM lessons WHERE id = $1',
      [id]
    );
    if (lessonCheck.rows.length === 0) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    const versionsResult = await pool.query(
      `SELECT version, created_at, metadata
       FROM lesson_content_versions
       WHERE lesson_id = $1
       ORDER BY version DESC`,
      [id]
    );

    res.status(200).json({
      lesson_id: id,
      versions: versionsResult.rows.map((r) => ({
        version: r.version,
        created_at: r.created_at,
        metadata: r.metadata,
      })),
    });
  } catch (e) {
    console.error('getLessonVersions error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
};
