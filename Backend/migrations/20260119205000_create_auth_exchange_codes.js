/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = async function (knex) {
    // To enable gen_random_uuid()
    await knex.raw(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
    
    // Auth exchange codes table
    await knex.schema.createTable("auth_exchange_codes", (table) => {
        table
            .uuid("id")
            .primary()
            .defaultTo(knex.raw("gen_random_uuid()"));

        table
            .uuid("user_id")
            .notNullable()
            .references("id")
            .inTable("users")
            .onDelete("CASCADE");

        table.text("code_hash").notNullable();
        table.timestamp("expires_at").notNullable();
        table.boolean("used").defaultTo(false);
        table.timestamp("created_at").defaultTo(knex.fn.now());

        table.index("user_id");
        table.index("code_hash");
        table.index("expires_at");
        table.index("used");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("auth_exchange_codes");
};
