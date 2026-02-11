/**
 * Store every version of lesson content so users can revisit older versions.
 * lessons.content = current (latest); this table = full history.
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto');

  await knex.schema.createTable('lesson_content_versions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('lesson_id')
      .notNullable()
      .references('id')
      .inTable('lessons')
      .onDelete('CASCADE');
    table.integer('version').notNullable(); // 1-based per lesson
    table.jsonb('content').notNullable(); // full block-format payload
    table.jsonb('metadata').nullable(); // { generatedAt, model, estimatedMinutes }
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.unique(['lesson_id', 'version']);
    table.index('lesson_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('lesson_content_versions');
};
