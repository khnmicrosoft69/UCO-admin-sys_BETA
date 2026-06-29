const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'uco_system',
    port: parseInt(process.env.DB_PORT || '3306')
  });
  const [rows] = await connection.execute('SELECT image, video, audio, office_name, created_at FROM submissions LIMIT 5');
  console.log(JSON.stringify(rows, null, 2));
  await connection.end();
}
run().catch(console.error);
