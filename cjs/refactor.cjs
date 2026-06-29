const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const srcDir = path.join(rootDir, 'src');

// 1. Create target directories
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

// 2. Define the moves
const moves = [
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
  ['components/pages/DashboardContent.jsx', 'components/react/interactive/DashboardContent.jsx'],
  ['components/pages/DepartmentsContent.jsx', 'components/react/interactive/DepartmentsContent.jsx'],
  ['components/pages/ArchivedFormsContent.jsx', 'components/react/interactive/ArchivedFormsContent.jsx'],
  ['components/pages/ReportGeneratorContent.jsx', 'components/react/interactive/ReportGeneratorContent.jsx'],
  ['components/pages/SubmissionsContent.jsx', 'components/react/interactive/SubmissionsContent.jsx'],
  ['components/pages/SubmissionDetailContent.jsx', 'components/react/interactive/SubmissionDetailContent.jsx'],
  ['components/pages/MediaAnalyticsContent.jsx', 'components/react/interactive/MediaAnalyticsContent.jsx'],
  ['components/pages/TeamCalendarContent.jsx', 'components/react/interactive/TeamCalendarContent.jsx'],
  ['components/pages/SettingsContent.jsx', 'components/react/interactive/SettingsContent.jsx'],
  ['components/pages/LoginForm.jsx', 'components/react/interactive/LoginForm.jsx'],
  ['components/pages/SubmissionOverview.jsx', 'components/react/interactive/SubmissionOverview.jsx'],

  // Pages
  ['pages/dashboard.astro', 'pages/dashboard/index.astro'],
  ['pages/departments.astro', 'pages/dashboard/departments.astro'],
  ['pages/archived-forms.astro', 'pages/dashboard/archived-forms.astro'],
  ['pages/reports.astro', 'pages/dashboard/reports.astro'],
  ['pages/submissions.astro', 'pages/submissions/index.astro'],
  ['pages/submission/index.astro', 'pages/submissions/detail.astro'],
  ['pages/media-analytics.astro', 'pages/media-analytics/index.astro'],
  ['pages/team-calendar.astro', 'pages/team-calendar/index.astro'],
  ['pages/settings.astro', 'pages/settings/index.astro'],
  
  // Move layout to layouts
  ['layouts/Layout.astro', 'layouts/Layout.astro'] // actually it's already there!
];

// Perform moves
moves.forEach(([from, to]) => {
  const fromPath = path.join(srcDir, from);
  const toPath = path.join(srcDir, to);
  if (from !== to && fs.existsSync(fromPath)) {
    fs.renameSync(fromPath, toPath);
    console.log(`Moved: ${from} -> ${to}`);
  }
});

// Remove empty directories (ignoring errors if not empty)
const oldDirs = ['components/layout', 'components/pages', 'pages/submission', 'styles'];
oldDirs.forEach(d => {
  const p = path.join(srcDir, d);
  try { if (fs.existsSync(p)) fs.rmdirSync(p); } catch (e) {}
});

// 3. Update import paths and links
function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) walk(dirPath, callback);
    else if (/\.(js|jsx|ts|tsx|astro)$/.test(f)) callback(dirPath);
  });
}

const uiComps = ['DesktopViewing', 'MobileViewing', 'ResponsiveLayout', 'SearchBar', 'TabList', 'MessageDropdown'];
const interactiveComps = ['AdminHeader', 'AdminSidebar', 'SubmissionChat', 'DashboardContent', 'DepartmentsContent', 'ArchivedFormsContent', 'ReportGeneratorContent', 'SubmissionsContent', 'SubmissionDetailContent', 'MediaAnalyticsContent', 'TeamCalendarContent', 'SettingsContent', 'LoginForm', 'SubmissionOverview'];

walk(srcDir, (filePath) => {
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;

  // Global styles
  content = content.replace(/['"](\.\.\/)*styles\/global\.css['"]/g, "'@/assets/global.css'");
  content = content.replace(/['"](\.\.\/)*assets\/global\.css['"]/g, "'@/assets/global.css'");

  // Layouts
  content = content.replace(/['"](\.\.\/)*layouts\/Layout\.astro['"]/g, "'@/layouts/Layout.astro'");
  
  // Links util
  content = content.replace(/['"](\.\.\/)*links(\.jsx)?['"]/g, "'@/utils/links'");
  content = content.replace(/['"](\.\.\/)*components\/links(\.jsx)?['"]/g, "'@/utils/links'");

  // Astro components
  content = content.replace(/['"](\.\.\/)*components\/(MetricCard|ThemeInit|Welcome)(\.astro)?['"]/g, "'@/components/astro/$2.astro'");

  // React UI Components
  uiComps.forEach(comp => {
    let regex = new RegExp(`['"](\\.\\.\\/)*([^'"]*)${comp}(?:\\.jsx)?['"]`, 'g');
    content = content.replace(regex, `'@/components/react/ui/${comp}'`);
  });

  // React Interactive Components
  interactiveComps.forEach(comp => {
    let regex = new RegExp(`['"](\\.\\.\\/)*([^'"]*)${comp}(?:\\.jsx)?['"]`, 'g');
    content = content.replace(regex, `'@/components/react/interactive/${comp}'`);
  });

  // URL Updates in navigation components
  if (filePath.endsWith('AdminSidebar.jsx') || filePath.endsWith('links.jsx')) {
    content = content.replace(/href:\s*['"]\/departments['"]/g, "href: '/dashboard/departments'");
    content = content.replace(/href:\s*['"]\/archived-forms['"]/g, "href: '/dashboard/archived-forms'");
    content = content.replace(/href:\s*['"]\/reports['"]/g, "href: '/dashboard/reports'");
  }

  // AdminHeader.jsx internal navigation 
  if (filePath.endsWith('AdminHeader.jsx')) {
    content = content.replace(/`\/submission\?id=\$\{s\.id\}`/g, "`/submissions/detail?id=${s.id}`");
  }
  
  // Update internal window locations inside content components
  if (filePath.endsWith('DashboardContent.jsx') || filePath.endsWith('SubmissionsContent.jsx')) {
    content = content.replace(/`\/submission\?id=/g, "`/submissions/detail?id=");
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated imports in: ${path.relative(rootDir, filePath)}`);
  }
});

console.log("Refactoring complete!");
