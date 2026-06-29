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
    const [cols] = await connection.execute('DESCRIBE submissions');
    console.log('submissions:', JSON.stringify(cols.map(c => c.Field)));
    const [msgs] = await connection.execute('DESCRIBE submission_messages');
    console.log('submission_messages:', JSON.stringify(msgs.map(c => c.Field)));
    await connection.end();
  } catch (err) {
    console.error(err);
  }
}
run();
