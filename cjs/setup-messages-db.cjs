const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

async function setup() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'uco_system',
    port: parseInt(process.env.DB_PORT || '3306')
  });

  console.log('Connected to database. Creating submission_messages table...');

  await connection.query(`
    CREATE TABLE IF NOT EXISTS submission_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      submission_id INT NOT NULL,
      sender_role ENUM('admin', 'user') NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (submission_id)
    )
  `);
  
  console.log('Table created successfully.');
  await connection.end();
}

setup().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
