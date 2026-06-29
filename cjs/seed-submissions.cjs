const mysql = require('mysql2/promise');

async function seedSubmissions() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'uco_system'
  });

  console.log('Connected to uco_system database.');

  // Ensure table exists
  await connection.query(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255),
      request_type VARCHAR(255),
      mName VARCHAR(255),
      nNo VARCHAR(50),
      aName VARCHAR(255),
      aNo VARCHAR(50),
      socMed VARCHAR(255),
      service VARCHAR(255),
      eventDetails TEXT,
      office_name VARCHAR(255),
      ppTemplate VARCHAR(255),
      image VARCHAR(255),
      video VARCHAR(255),
      audio VARCHAR(255),
      user_id INT,
      status VARCHAR(50) DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const submissions = [
    {
      email: 'khan@gmail.com',
      request_type: 'Local Media and Other Services',
      mName: 'KHAN FERNANDEZ',
      nNo: '09123456789',
      aName: 'John Doe',
      aNo: '09876543210',
      socMed: '@khan_fernandez',
      service: 'Layout/Design and Posting of Graphics, Social Cards and Infographics',
      eventDetails: 'Annual University Festival 2026',
      office_name: 'University Communications Office',
      status: 'Pending',
      created_at: '2026-06-16 10:30:00'
    },
    {
      email: 'alice@adzu.edu.ph',
      request_type: 'Official AdZU Website',
      mName: 'Alice Margatroid',
      nNo: '09223334444',
      aName: 'Bob Builder',
      aNo: '09556667777',
      socMed: '@alice_adzu',
      service: 'Website Banner Update',
      eventDetails: 'Enrollment for SY 2026-2027',
      office_name: 'Office of the President',
      status: 'In-process',
      created_at: '2026-05-15 14:20:00'
    },
    {
      email: 'charlie@gmail.com',
      request_type: 'Print Media',
      mName: 'Charlie Brown',
      nNo: '09334445555',
      aName: 'Linus Van Pelt',
      aNo: '09667778888',
      socMed: '@charlie_print',
      service: 'Flyers and Posters',
      eventDetails: 'Charity Concert',
      office_name: 'Vice President for Administration',
      status: 'Completed',
      created_at: '2026-05-10 09:00:00'
    },
    {
      email: 'david@adzu.edu.ph',
      request_type: 'Official AdZU Social Media Accounts',
      mName: 'David Bowie',
      nNo: '09445556666',
      aName: 'Iggy Pop',
      aNo: '09778889999',
      socMed: '@david_social',
      service: 'Posting by Official AdZU Social Media Accounts (Text, Photos and Videos)',
      eventDetails: 'Music Department Recital',
      office_name: 'Ateneo Center for Culture & the Arts (ACCA)',
      status: 'Rejected',
      created_at: '2026-04-20 16:45:00'
    },
    {
      email: 'eve@gmail.com',
      request_type: 'Photo/Video Documentations',
      mName: 'Eve Online',
      nNo: '09112223333',
      aName: 'Adam Apple',
      aNo: '09445556666',
      socMed: '@eve_photos',
      service: 'Event Coverage',
      eventDetails: 'Hackathon 2026',
      office_name: 'Center for Digital and Blended Learning (CDBL)',
      status: 'Completed',
      created_at: '2026-03-05 11:15:00'
    },
    {
      email: 'frank@adzu.edu.ph',
      request_type: 'Mascot',
      mName: 'Frank Sinatra',
      nNo: '09556667777',
      aName: 'Dean Martin',
      aNo: '09889990000',
      socMed: '@frank_mascot',
      service: 'Mascot Appearance',
      eventDetails: 'Pep Rally',
      office_name: 'Vice President for Basic Education',
      status: 'Pending',
      created_at: '2026-06-12 13:00:00'
    },
    {
      email: 'grace@gmail.com',
      request_type: 'Facebook Live',
      mName: 'Grace Hopper',
      nNo: '09667778888',
      aName: 'Ada Lovelace',
      aNo: '09990001111',
      socMed: '@grace_live',
      service: 'Livestreaming',
      eventDetails: 'Tech Talk: Future of AI',
      office_name: 'Innovation and Technology Support Office (ITSO)',
      status: 'In-process',
      created_at: '2026-06-14 15:30:00'
    },
    {
      email: 'hank@adzu.edu.ph',
      request_type: 'File Photos',
      mName: 'Hank Pym',
      nNo: '09778889999',
      aName: 'Janet Van Dyne',
      aNo: '09001112222',
      socMed: '@hank_files',
      service: 'Archive Retrieval',
      eventDetails: 'Historical Exhibition',
      office_name: 'University Archives',
      status: 'Completed',
      created_at: '2026-02-28 10:00:00'
    },
    {
      email: 'ivan@gmail.com',
      request_type: 'Local Media and Other Services',
      mName: 'Ivan Drago',
      nNo: '09889990000',
      aName: 'Rocky Balboa',
      aNo: '09112223333',
      socMed: '@ivan_media',
      service: 'Press Release',
      eventDetails: 'Boxing Championship',
      office_name: 'University Safety Office',
      status: 'Pending',
      created_at: '2026-06-15 08:00:00'
    },
    {
      email: 'judy@adzu.edu.ph',
      request_type: 'Official AdZU Website',
      mName: 'Judy Garland',
      nNo: '09990001111',
      aName: 'Toto Dog',
      aNo: '09223334444',
      socMed: '@judy_web',
      service: 'Article Publication',
      eventDetails: 'Drama Club Performance',
      office_name: 'Ateneo Center for Culture & the Arts (ACCA)',
      status: 'Completed',
      created_at: '2026-01-15 17:00:00'
    }
  ];

  for (const s of submissions) {
    await connection.execute(
      `INSERT INTO submissions (email, request_type, mName, nNo, aName, aNo, socMed, service, eventDetails, office_name, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.email, s.request_type, s.mName, s.nNo, s.aName, s.aNo, s.socMed, s.service, s.eventDetails, s.office_name, s.status, s.created_at]
    );
  }

  console.log('Seed data inserted successfully.');
  await connection.end();
}

seedSubmissions().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
