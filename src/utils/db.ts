import postgres from 'postgres';

const databaseUrl = import.meta.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is missing.');
}

const sql = postgres(databaseUrl, {
  ssl: 'require',
  prepare: false 
});

export default sql;
