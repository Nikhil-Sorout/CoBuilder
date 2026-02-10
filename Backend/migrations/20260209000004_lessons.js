/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable('lessons', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('chapter_id')
      .notNullable()
      .references('id')
      .inTable('chapters')
      .onDelete('CASCADE');
    table.text('title').notNullable();
    table.integer('sort_order').notNullable();

    table
      .text('generation_status')
      .notNullable()
      .defaultTo('pending'); // pending | generating | ready | failed
    table.jsonb('content').nullable(); // structured blocks: { blocks: [{ type, data }] }

    table.integer('estimated_minutes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('chapter_id');
    table.index(['chapter_id', 'sort_order']);
    table.index('generation_status');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('lessons');
};
