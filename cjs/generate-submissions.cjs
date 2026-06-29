const mysql = require('mysql2/promise');

async function generateSubmissions() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'uco_system'
  });

  console.log('Connected to uco_system database.');

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
      office_name VARCHAR(255) NOT NULL,
      ppTemplate VARCHAR(255),
      image VARCHAR(255),
      video VARCHAR(255),
      audio VARCHAR(255),
      user_id INT,
      status VARCHAR(50) DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const requestTypes = [
    "LOCAL MEDIA AND OTHER SERVICES",
    "OFFICIAL ADZU WEBSITE",
    "OFFICIAL ADZU SOCIAL MEDIA ACCOUNTS",
    "PRINT MEDIA",
    "PHOTO/VIDEO DOCUMENTATIONS",
    "FILE PHOTOS",
    "FACEBOOK LIVE",
    "MASCOT"
  ];

  const serviceTypes = [
    "POSTING BY OFFICIAL ADZU SOCIAL MEDIA ACCOUNTS (TEXT, PHOTOS,AND VIDEOS)",
    "LAYOUT/DESIGN AND POSTING OF GRAPHICS (SOCIAL CARDS AND INFOGRAPHICS",
    "OTHER"
  ];

  const statuses = ["Pending", "In-process", "Completed", "Rejected"];

  const offices = [
    "Office of the President",
    "Vice President for Administration",
    "Vice President for Basic Education",
    "Vice President for Higher Education",
    "Ateneo Center for Testing",
    "Data Protection Office (DPO)",
    "Human Resource Administration and Development Office (HRADO)",
    "Lantaka Administration",
    "Physical Plant Office (PPO)",
    "Purchasing & Custodial Office (PCO)",
    "University Archives",
    "University Safety Office",
    "University Security Office (USO)",
    "Ateneo Center for Culture & the Arts (ACCA)",
    "Ateneo Center for Environment & Sustainability (ACES)",
    "Ateneo Center for Leadership and Governance (ACLG)",
    "Ateneo Learning and Teaching Excellence Center (ALTEC)",
    "Ateneo Peace Institute (API)",
    "Center for Community Extensions Services (CCES)",
    "Social Awareness and Community Service Involvement (SACSI)",
    "Social Development Office",
    "Advancement Office",
    "Alumni and Career Excellence (ACE) Office",
    "Ateneo Center for Entrepreneurship, Innovation, and Development (ACEND)",
    "Ateneo Zamboanga-Mindanao Institute (AZMI)",
    "AZUL Hub",
    "Center for Digital and Blended Learning (CDBL)",
    "Ethics Review Board (ERB)",
    "Global Paths – Internationalization (GPI) Office",
    "Innovation and Technology Support Office (ITSO)",
    "Office of Mission Integration and Leadership Development (OMILD)",
    "Projects Office",
    "Quality Assurance and Strategic Management Office (QASMO)",
    "University Communications Office (UCO)",
    "University Research Office",
    "ZamPen Innohive Fabrication Laboratory (FabLab)"
  ];

  const templates = ["Template A", "Template B", "Template C", "None"];

  console.log('Fetching valid user IDs...');
  const [usersRows] = await connection.query('SELECT id FROM user_accounts');
  const userIds = usersRows.length > 0 ? usersRows.map(row => row.id) : [null];

  console.log('Generating 100 synthetic submissions...');

  for (let i = 0; i < 100; i++) {
    const email = `user${i}@example.com`;
    const mName = `User ${i}`;
    const nNo = `0912${Math.floor(1000000 + Math.random() * 9000000)}`;
    const aName = `Alternate ${i}`;
    const aNo = `0913${Math.floor(1000000 + Math.random() * 9000000)}`;
    const socMed = `@user${i}_social`;
    const requestType = requestTypes[Math.floor(Math.random() * requestTypes.length)];
    const service = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
    const eventDetails = `Details for synthetic event ${i} spanning multiple aspects of the request.`;
    const office_name = offices[Math.floor(Math.random() * offices.length)];
    const ppTemplate = templates[Math.floor(Math.random() * templates.length)];
    const image = `image_${i}.png`;
    const video = `video_${i}.mp4`;
    const audio = `audio_${i}.mp3`;
    const userId = userIds[Math.floor(Math.random() * userIds.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Generate dates mostly within the current year for dashboard relevance
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const createdAt = new Date(startOfYear.getTime() + Math.random() * (now.getTime() - startOfYear.getTime()))
      .toISOString().slice(0, 19).replace('T', ' ');

    await connection.execute(
      `INSERT INTO submissions (
        email, request_type, mName, nNo, aName, aNo, socMed, service, 
        eventDetails, office_name, ppTemplate, image, video, audio, 
        user_id, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email, requestType, mName, nNo, aName, aNo, socMed, service, 
        eventDetails, office_name, ppTemplate, image, video, audio, 
        userId, status, createdAt
      ]
    );
  }

  console.log('100 synthetic submissions inserted successfully.');
  await connection.end();
}

generateSubmissions().catch(err => {
  console.error('Generation failed:', err);
  process.exit(1);
});
