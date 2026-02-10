/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable('modules', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('course_id')
      .notNullable()
      .references('id')
      .inTable('courses')
      .onDelete('CASCADE');
    table.text('title').notNullable();
    table.integer('sort_order').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('course_id');
    table.index(['course_id', 'sort_order']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('modules');
};
