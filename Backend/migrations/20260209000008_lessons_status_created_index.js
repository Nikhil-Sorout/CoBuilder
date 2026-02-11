/**
 * Composite index for worker: SELECT ... WHERE generation_status = 'pending' ORDER BY created_at
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.alterTable('lessons', (table) => {
    table.index(['generation_status', 'created_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.alterTable('lessons', (table) => {
    table.dropIndex(['generation_status', 'created_at']);
  });
};
