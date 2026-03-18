const { sql } = require('@vercel/postgres');

async function query(strings, ...values) {
  try {
    const result = await sql(strings, ...values);
    return result;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
}

module.exports = { sql, query };
