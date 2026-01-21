/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = async function (knex) {
    // To enable gen_random_uuid()
    await knex.raw(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);


    // Users table
    await knex.schema.createTable("users", (table) => {
        table
            .uuid("id")
            .primary()
            .defaultTo(knex.raw("gen_random_uuid()"));

        table.string("username", 255).notNullable();
        table.string("email", 255).notNullable().unique();
        table.text("password_hash").notNullable();
        table.boolean("is_verified").defaultTo(false);

        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
    });

    // email verifications table
    await knex.schema.createTable("email_verifications", (table) => {
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
        table.boolean("used").defaultTo(false);
        table.timestamp("created_at").defaultTo(knex.fn.now());

        table.unique(["user_id", "token_hash"]);
    });

    // Adding indexes
    await knex.schema.alterTable("users", (table) => {
        table.index("email");
        table.index("username");
    });

    await knex.schema.alterTable("email_verifications", (table) => {
        table.index("user_id");
        table.index("token_hash");
        table.index("expires_at");
    });

    await knex.raw(`
        CREATE OR REPLACE FUNCTION update_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        `);

    await knex.raw(`
        CREATE TRIGGER trg_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
        `);

};


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("email_verifications");
    await knex.schema.dropTableIfExists("users");
    await knex.raw(`DROP FUNCTION IF EXISTS update_updated_at`);
};
