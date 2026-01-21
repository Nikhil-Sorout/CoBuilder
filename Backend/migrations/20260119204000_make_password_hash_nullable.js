/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = async function (knex) {
    // Make password_hash nullable to support Google OAuth users
    await knex.schema.alterTable("users", (table) => {
        table.text("password_hash").nullable().alter();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    // Revert password_hash back to not nullable
    // Note: This will fail if there are any NULL values in the column
    await knex.schema.alterTable("users", (table) => {
        table.text("password_hash").notNullable().alter();
    });
};
