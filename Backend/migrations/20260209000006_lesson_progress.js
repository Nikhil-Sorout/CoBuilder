/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable('lesson_progress', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table
      .uuid('lesson_id')
      .notNullable()
      .references('id')
      .inTable('lessons')
      .onDelete('CASCADE');
    table
      .text('status')
      .notNullable()
      .defaultTo('not_started'); // not_started | in_progress | completed
    table.decimal('progress_percent', 5, 2).defaultTo(0);
    table.timestamp('started_at').nullable();
    table.timestamp('completed_at').nullable();
    table.jsonb('last_position').nullable(); // scroll/video position
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique(['user_id', 'lesson_id']);
    table.index('user_id');
    table.index('lesson_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('lesson_progress');
};
