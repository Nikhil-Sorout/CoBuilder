/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = async function (knex) {
    // To enable gen_random_uuid()
    await knex.raw(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
    // Refresh tokens table
    await knex.schema.createTable("refresh_tokens", (table) => {
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

        table.text("token_hash").notNullable();
        table.timestamp("expires_at").notNullable();
        table.boolean("revoked").defaultTo(false);
        table.timestamp("created_at").defaultTo(knex.fn.now());

        table.index("user_id");
        table.index("token_hash");
        table.index("expires_at");
        table.index("revoked");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("refresh_tokens");
};
