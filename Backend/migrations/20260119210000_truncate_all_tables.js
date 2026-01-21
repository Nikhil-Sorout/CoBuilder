/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 * 
 * WARNING: This migration truncates all authentication tables!
 * Use this to reset the database for testing purposes.
 */

exports.up = async function (knex) {
    await knex.raw(`
        TRUNCATE TABLE
            users,
            email_verifications,
            auth_exchange_codes,
            refresh_tokens
        CASCADE
    `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    // Truncate operations cannot be reversed
    // This is a one-way operation
    console.log('Truncate operation cannot be reversed');
};
