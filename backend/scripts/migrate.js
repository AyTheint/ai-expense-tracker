import fs from'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from'../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DROP_ALL = `
  DROP TABLE IF EXISTS ai_insights CASCADE;
  DROP TABLE IF EXISTS budgets CASCADE;
  DROP TABLE IF EXISTS transactions CASCADE;
  DROP TABLE IF EXISTS categories CASCADE;
  DROP TABLE IF EXISTS users CASCADE;
`;

const runMigrations = async () => {
    const shouldReset = process.argv.includes('--reset');
    const schemaPATH = path.join(__dirname, '..', 'sql', 'schema.sql');

    try {
        if (shouldReset) {
            console.log('Dropping existing tables...');
            await pool.query(DROP_ALL);
        }

        console.log(`Running schema from ${schemaPATH}`);
        const schema = await fs.readFile(schemaPATH, 'utf-8');

        console.log('Running migrations...');
        await pool.query(schema);

        console.log('Migrations completed. Tables created!');
    } catch (error) {
        console.error('Migration failed', error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
};

runMigrations();