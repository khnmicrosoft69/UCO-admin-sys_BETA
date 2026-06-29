const crypto = require('crypto');
const mysql = require('mysql2/promise');

async function reseedAdmin() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'uco_system'
  });

  const email = 'admin@adzu.edu.ph';
  const password = 'securepassword123';
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

  await connection.execute(
    'UPDATE admin_accounts SET password_hash = ? WHERE email = ?',
    [hashedPassword, email]
  );
  console.log('Admin password updated to SHA-256 hash.');

  await connection.end();
}

reseedAdmin().catch(console.error);
