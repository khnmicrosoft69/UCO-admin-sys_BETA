const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// Create directories
const dirs = [
  'assets',
  'components/astro',
  'components/react/ui',
  'components/react/interactive',
  'layouts',
  'utils',
  'pages/dashboard',
  'pages/submissions',
  'pages/media-analytics',
  'pages/team-calendar',
  'pages/settings'
];

dirs.forEach(d => {
  const p = path.join(srcDir, d);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// Moves
const moves = [
  // Assets & Utils
  ['styles/global.css', 'assets/global.css'],
  ['components/links.jsx', 'utils/links.jsx'],
  
  // Astro components
  ['components/MetricCard.astro', 'components/astro/MetricCard.astro'],
  ['components/ThemeInit.astro', 'components/astro/ThemeInit.astro'],
  ['components/Welcome.astro', 'components/astro/Welcome.astro'],
  
  // React UI components
  ['components/layout/DesktopViewing.jsx', 'components/react/ui/DesktopViewing.jsx'],
  ['components/layout/MobileViewing.jsx', 'components/react/ui/MobileViewing.jsx'],
  ['components/layout/ResponsiveLayout.jsx', 'components/react/ui/ResponsiveLayout.jsx'],
  ['components/SearchBar.jsx', 'components/react/ui/SearchBar.jsx'],
  ['components/TabList.jsx', 'components/react/ui/TabList.jsx'],
  ['components/MessageDropdown.jsx', 'components/react/ui/MessageDropdown.jsx'],
  
  // React Interactive components
  ['components/AdminHeader.jsx', 'components/react/interactive/AdminHeader.jsx'],
  ['components/AdminSidebar.jsx', 'components/react/interactive/AdminSidebar.jsx'],
  ['components/SubmissionChat.jsx', 'components/react/interactive/SubmissionChat.jsx'],
  ['components/DashboardContent.jsx', 'components/react/interactive/DashboardContent.jsx'],
  ['components/DepartmentsContent.jsx', 'components/react/interactive/DepartmentsContent.jsx'],
  ['components/ArchivedFormsContent.jsx', 'components/react/interactive/ArchivedFormsContent.jsx'],
  ['components/ReportGeneratorContent.jsx', 'components/react/interactive/ReportGeneratorContent.jsx'],
  ['components/SubmissionsContent.jsx', 'components/react/interactive/SubmissionsContent.jsx'],
  ['components/SubmissionDetailContent.jsx', 'components/react/interactive/SubmissionDetailContent.jsx'],
  ['components/MediaAnalyticsContent.jsx', 'components/react/interactive/MediaAnalyticsContent.jsx'],
  ['components/TeamCalendarContent.jsx', 'components/react/interactive/TeamCalendarContent.jsx'],
  ['components/SettingsContent.jsx', 'components/react/interactive/SettingsContent.jsx'],
  ['components/LoginForm.jsx', 'components/react/interactive/LoginForm.jsx'],
  ['components/SubmissionOverview.jsx', 'components/react/interactive/SubmissionOverview.jsx'],

  // Pages
  ['pages/dashboard.astro', 'pages/dashboard/index.astro'],
  ['pages/departments.astro', 'pages/dashboard/departments.astro'],
  ['pages/archived-forms.astro', 'pages/dashboard/archived-forms.astro'],
  ['pages/reports.astro', 'pages/dashboard/reports.astro'],
  ['pages/submissions.astro', 'pages/submissions/index.astro'],
  ['pages/submission/index.astro', 'pages/submissions/detail.astro'],
  ['pages/media-analytics.astro', 'pages/media-analytics/index.astro'],
  ['pages/team-calendar.astro', 'pages/team-calendar/index.astro'],
  ['pages/settings.astro', 'pages/settings/index.astro']
];

moves.forEach(([from, to]) => {
  const f = path.join(srcDir, from);
  const t = path.join(srcDir, to);
  if (fs.existsSync(f)) {
    fs.renameSync(f, t);
    console.log(`Moved ${from} -> ${to}`);
  } else {
    console.warn(`File not found: ${from}`);
  }
});

// Cleanup empty dirs
['components/layout', 'pages/submission', 'styles'].forEach(d => {
  try { fs.rmdirSync(path.join(srcDir, d)); } catch(e) {}
});

// Update Imports
function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, callback);
    else if (/\.(js|jsx|ts|tsx|astro)$/.test(f)) callback(p);
  });
}

const uiComps = ['DesktopViewing', 'MobileViewing', 'ResponsiveLayout', 'SearchBar', 'TabList', 'MessageDropdown'];
const interactiveComps = ['AdminHeader', 'AdminSidebar', 'SubmissionChat', 'DashboardContent', 'DepartmentsContent', 'ArchivedFormsContent', 'ReportGeneratorContent', 'SubmissionsContent', 'SubmissionDetailContent', 'MediaAnalyticsContent', 'TeamCalendarContent', 'SettingsContent', 'LoginForm', 'SubmissionOverview'];

walk(srcDir, (filePath) => {
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;

  // Global styles
  content = content.replace(/['"](\.\.\/)*styles\/global\.css['"]/g, "'@/assets/global.css'");

  // Layouts
  content = content.replace(/['"](\.\.\/)*layouts\/Layout\.astro['"]/g, "'@/layouts/Layout.astro'");
  
  // Links util
  content = content.replace(/['"](\.\.\/)*components\/links(\.jsx)?['"]/g, "'@/utils/links'");

  // Astro components
  content = content.replace(/['"](\.\.\/)*components\/(MetricCard|ThemeInit|Welcome)(\.astro)?['"]/g, "'@/components/astro/$2.astro'");

  // UI Components
  uiComps.forEach(c => {
    const re = new RegExp(`['"](\\.\\.\\/)*(components\\/)?(layout\\/)?${c}(?:\\.jsx)?['"]`, 'g');
    content = content.replace(re, `'@/components/react/ui/${c}'`);
  });

  // Interactive Components
  interactiveComps.forEach(c => {
    const re = new RegExp(`['"](\\.\\.\\/)*(components\\/)?${c}(?:\\.jsx)?['"]`, 'g');
    content = content.replace(re, `'@/components/react/interactive/${c}'`);
  });

  // Navigation URLs
  if (filePath.endsWith('AdminSidebar.jsx') || filePath.endsWith('links.jsx')) {
    content = content.replace(/href:\s*['"]\/departments['"]/g, "href: '/dashboard/departments'");
    content = content.replace(/href:\s*['"]\/archived-forms['"]/g, "href: '/dashboard/archived-forms'");
    content = content.replace(/href:\s*['"]\/reports['"]/g, "href: '/dashboard/reports'");
  }
  if (filePath.endsWith('AdminHeader.jsx')) {
    content = content.replace(/`\/submission\?id=\$\{s\.id\}`/g, "`/submissions/detail?id=${s.id}`");
  }
  if (filePath.endsWith('DashboardContent.jsx') || filePath.endsWith('SubmissionsContent.jsx')) {
    content = content.replace(/`\/submission\?id=/g, "`/submissions/detail?id=");
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated imports in ${path.relative(__dirname, filePath)}`);
  }
});
