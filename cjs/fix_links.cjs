const fs = require('fs');
const path = require('path');

const srcDir = path.join('C:', 'Users', 'ASUS', 'Desktop', 'uco system', 'admin-dashboard', 'src');

const replacements = [
    {
        file: 'pages/office/[name].astro',
        old: '<a href="/departments"',
        new: '<a href="/dashboard/departments"'
    },
    {
        file: 'pages/office/index.astro',
        old: '<a href="/departments"',
        new: '<a href="/dashboard/departments"'
    },
    {
        file: 'components/react/interactive/AdminHeader.jsx',
        old: 'window.location.href = `/office?office=${encodeURIComponent(match)}`;',
        new: 'window.location.href = `/office/${encodeURIComponent(match)}`;'
    },
    {
        file: 'components/react/interactive/DashboardContent.jsx',
        old: 'window.location.href = `/office?office=${encodeURIComponent(match)}`',
        new: 'window.location.href = `/office/${encodeURIComponent(match)}`'
    },
    {
        file: 'components/react/interactive/DashboardContent.jsx',
        old: '{ label: "By Department", href: "/departments" }',
        new: '{ label: "By Department", href: "/dashboard/departments" }'
    },
    {
        file: 'components/react/interactive/DashboardContent.jsx',
        old: '{ label: "By Media Type", href: "#" }',
        new: ''
    },
    {
        file: 'components/react/interactive/DashboardContent.jsx',
        old: '{ label: "Archived Forms", href: "#" }',
        new: '{ label: "Archived Forms", href: "/dashboard/archived-forms" }'
    },
    {
        file: 'components/react/interactive/DashboardContent.jsx',
        old: '{ label: "Generate Spreadsheet", href: "#" }',
        new: '{ label: "Generate Spreadsheet", href: "/dashboard/reports" }'
    },
    {
        file: 'components/react/interactive/DepartmentsContent.jsx',
        old: 'href={`/office?office=${encodeURIComponent(office)}`}',
        new: 'href={`/office/${encodeURIComponent(office)}`}'
    },
    {
        file: 'components/react/interactive/ArchivedFormsContent.jsx',
        old: 'window.location.href = `/submission?id=${s.id}`',
        new: 'window.location.href = `/submissions/detail?id=${s.id}`'
    },
    {
        file: 'components/react/interactive/AdminSidebar.jsx',
        old: "{ label: 'Media Analytics', href: '#' }",
        new: "{ label: 'Media Analytics', href: '/media-analytics' }"
    },
    {
        file: 'components/react/interactive/AdminSidebar.jsx',
        old: "{ label: 'UCO Team Calendar', href: '#' }",
        new: "{ label: 'UCO Team Calendar', href: '/team-calendar' }"
    }
];

let modifiedCount = 0;

replacements.forEach(rep => {
    const fullPath = path.join(srcDir, rep.file);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes(rep.old)) {
            content = content.split(rep.old).join(rep.new);
            fs.writeFileSync(fullPath, content, 'utf8');
            modifiedCount++;
            console.log('Fixed link in ' + rep.file);
        }
    }
});

console.log('Total fixes applied: ' + modifiedCount);
