import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool, types } = pg;

// Return DATE columns as plain 'YYYY-MM-DD' strings instead of JavaScript Date objects
types.setTypeParser(1082, (val) => val);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on('connect', () => {
  console.log('Connected to the Neon Postgres');
});

pool.on('error', (err) => {
    console.error('Unexpected Postgres error:', err);
    process.exit(-1);
});

export default pool;