const mysql = require('mysql2/promise');

async function migrateAdmin() {
  const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: '' });

  // Create table in uco_system
  await conn.query('CREATE DATABASE IF NOT EXISTS uco_system');
  await conn.query('USE uco_system');
  await conn.query(`
    CREATE TABLE IF NOT EXISTS admin_accounts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migrate data
  await conn.query(`
    INSERT IGNORE INTO admin_accounts (email, password_hash, role, created_at)
    SELECT email, password_hash, role, created_at FROM admin_accountsdb.admin_accounts
  `);

  console.log('Migration complete.');
  
  // Clean up
  await conn.query('DROP DATABASE IF EXISTS admin_accountsdb');
  console.log('Old database dropped.');

  await conn.end();
}

migrateAdmin().catch(console.error);
