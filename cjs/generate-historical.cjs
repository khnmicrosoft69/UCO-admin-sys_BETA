// generate-historical.cjs
// Seeds Jan–Dec historical submissions for 2023, 2024, and 2025.
// 2026 data is left completely untouched.

const mysql = require('mysql2/promise');

async function generateHistorical() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'uco_system'
  });

  console.log('✅ Connected to uco_system database.');

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

  // Archived statuses only (Completed or Rejected) skewed heavily toward Completed
  const statuses = [
    "Completed", "Completed", "Completed", "Completed",
    "Completed", "Completed", "Completed",
    "Rejected", "Rejected",
    "Pending", "In-process"
  ];

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

  // Fetch valid user IDs
  console.log('🔍 Fetching valid user IDs...');
  const [usersRows] = await connection.query('SELECT id FROM user_accounts');
  const userIds = usersRows.length > 0 ? usersRows.map(r => r.id) : [null];

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  // Realistic monthly submission volumes (seasonal peaks in March, August, Nov)
  // Each entry is [min, max] count per month
  const monthlyVolume = [
    [18, 35],  // Jan
    [20, 40],  // Feb
    [35, 60],  // Mar — semester peak
    [22, 42],  // Apr
    [15, 30],  // May — sembreak lull
    [12, 25],  // Jun
    [20, 38],  // Jul
    [40, 70],  // Aug — school year opening peak
    [28, 50],  // Sep
    [25, 45],  // Oct
    [38, 65],  // Nov — year-end surge
    [18, 35],  // Dec
  ];

  // Days in each month (non-leap / leap handled per year)
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  const years = [2023, 2024, 2025];
  let totalInserted = 0;

  for (const year of years) {
    console.log(`\n📅 Generating data for ${year}...`);

    for (let month = 0; month < 12; month++) {
      const [minCount, maxCount] = monthlyVolume[month];
      const count = rand(minCount, maxCount);
      const days = daysInMonth(year, month);

      for (let i = 0; i < count; i++) {
        const day = rand(1, days);
        const hour = rand(7, 18);
        const minute = rand(0, 59);
        const second = rand(0, 59);

        // Zero-pad for SQL DATETIME format
        const pad = (n) => String(n).padStart(2, '0');
        const createdAt = `${year}-${pad(month + 1)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}`;

        const idx = totalInserted + i;
        const email = `user${idx}@adzu.edu.ph`;
        const mName = `User ${idx}`;
        const nNo = `0912${Math.floor(1000000 + Math.random() * 9000000)}`;
        const aName = `Alternate ${idx}`;
        const aNo = `0913${Math.floor(1000000 + Math.random() * 9000000)}`;
        const socMed = `@user${idx}_social`;
        const requestType = pick(requestTypes);
        const service = pick(serviceTypes);
        const eventDetails = `Historical synthetic event ${idx} for ${year}.`;
        const office_name = pick(offices);
        const ppTemplate = pick(templates);
        const image = Math.random() > 0.5 ? `image_${idx}.png` : null;
        const video = Math.random() > 0.7 ? `video_${idx}.mp4` : null;
        const audio = Math.random() > 0.8 ? `audio_${idx}.mp3` : null;
        const userId = pick(userIds);
        const status = pick(statuses);

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

      totalInserted += count;
      console.log(`  ✔ ${year}-${String(month + 1).padStart(2, '0')}  →  ${count} submissions inserted`);
    }
  }

  console.log(`\n🎉 Done! ${totalInserted} historical submissions inserted across 2023–2025.`);
  await connection.end();
}

generateHistorical().catch(err => {
  console.error('❌ Generation failed:', err);
  process.exit(1);
});
