const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'uco_system',
      port: parseInt(process.env.DB_PORT || '3306')
    });
    const [rows] = await connection.execute('SHOW TABLES');
    console.log(rows);
    await connection.end();
  } catch (err) {
    console.error(err);
  }
}
run();
