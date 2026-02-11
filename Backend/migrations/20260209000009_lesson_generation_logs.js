/**
 * Log generation failures for debugging and monitoring.
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto');

  await knex.schema.createTable('lesson_generation_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('lesson_id')
      .notNullable()
      .references('id')
      .inTable('lessons')
      .onDelete('CASCADE');
    table.text('error').nullable(); // error message or stack
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('lesson_id');
    table.index('created_at');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('lesson_generation_logs');
};
