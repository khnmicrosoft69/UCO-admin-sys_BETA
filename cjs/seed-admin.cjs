const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function seedAdmin() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'admin_accountsdb'
  });

  const email = 'admin@adzu.edu.ph';
  const password = 'securepassword123';
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await connection.execute(
      'INSERT INTO admin_accounts (email, password_hash) VALUES (?, ?)',
      [email, hashedPassword]
    );
    console.log('Admin user seeded successfully.');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.log('Admin user already exists.');
    } else {
      console.error(err);
    }
  }

  await connection.end();
}

seedAdmin();
