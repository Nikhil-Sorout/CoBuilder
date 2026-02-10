/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable('chapters', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('module_id')
      .notNullable()
      .references('id')
      .inTable('modules')
      .onDelete('CASCADE');
    table.text('title').notNullable();
    table.integer('sort_order').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('module_id');
    table.index(['module_id', 'sort_order']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('chapters');
};
