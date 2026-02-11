/**
 * Empties all application tables and restarts identity (sequences).
 * Only truncates tables that exist (safe if some migrations haven't run).
 *
 * Run from Backend: node scripts/reset-db.js
 * Or: npm run db:reset
 */

const knex = require('knex');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '..', 'knexfile.js'))[env];
if (!config) {
  console.error('No knex config for env:', env);
  process.exit(1);
}

const knexInstance = knex(config);

// Order: child tables first, then parents. All app tables from migrations.
const TABLES = [
  'lesson_content_versions',
  'lesson_generation_logs',
  'lesson_progress',
  'course_enrollments',
  'lessons',
  'chapters',
  'modules',
  'courses',
  'refresh_tokens',
  'auth_exchange_codes',
  'email_verifications',
  'users',
];

async function reset() {
  try {
    const inList = TABLES.map((t) => `'${t}'`).join(', ');
    const result = await knexInstance.raw(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public' AND tablename IN (${inList})
    `);
    const found = (result.rows || []).map((r) => r.tablename);
    const existing = TABLES.filter((t) => found.includes(t));
    if (existing.length === 0) {
      console.log('No app tables found to truncate.');
      return;
    }
    await knexInstance.raw(
      `TRUNCATE TABLE ${existing.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE`
    );
    console.log('Database reset: truncated', existing.length, 'table(s).');
  } catch (err) {
    console.error('Reset failed:', err.message);
    process.exit(1);
  } finally {
    await knexInstance.destroy();
  }
}

reset();
