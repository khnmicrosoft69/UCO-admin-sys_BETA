const fs = require('fs');
const path = require('path');

const srcDir = path.join('C:', 'Users', 'ASUS', 'Desktop', 'uco system', 'admin-dashboard', 'src');

function findFiles(dir, exts) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(findFiles(filePath, exts));
        } else {
            if (exts.includes(path.extname(file))) {
                results.push(filePath);
            }
        }
    });
    return results;
}

const files = findFiles(srcDir, ['.jsx', '.astro', '.tsx']);
let modifiedCount = 0;

const replacementsMap = {
    '../layout/ResponsiveLayout': '@/components/react/ui/ResponsiveLayout.jsx',
    './layout/ResponsiveLayout': '@/components/react/ui/ResponsiveLayout.jsx',
    '../../layout/ResponsiveLayout': '@/components/react/ui/ResponsiveLayout.jsx',
    
    '../layout/DesktopViewing': '@/components/react/ui/DesktopViewing.jsx',
    './layout/DesktopViewing': '@/components/react/ui/DesktopViewing.jsx',
    '../../layout/DesktopViewing': '@/components/react/ui/DesktopViewing.jsx',

    '../layout/MobileViewing': '@/components/react/ui/MobileViewing.jsx',
    './layout/MobileViewing': '@/components/react/ui/MobileViewing.jsx',
    '../../layout/MobileViewing': '@/components/react/ui/MobileViewing.jsx',

    '../TabList': '@/components/react/ui/TabList.jsx',
    '../../TabList': '@/components/react/ui/TabList.jsx',

    '../../SearchBar': '@/components/react/ui/SearchBar.jsx',

    '../links': '@/utils/links.jsx',
    '../../links': '@/utils/links.jsx',

    './MessageDropdown': '@/components/react/ui/MessageDropdown.jsx',
    './SubmissionChat.jsx': '@/components/react/interactive/SubmissionChat.jsx',
    './DesktopViewing.jsx': '@/components/react/ui/DesktopViewing.jsx',
    './MobileViewing.jsx': '@/components/react/ui/MobileViewing.jsx',
};

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let hasChanges = false;
    
    const noExt = [
        '@/components/react/ui/DesktopViewing',
        '@/components/react/ui/MobileViewing',
        '@/components/react/ui/SearchBar',
        '@/components/react/ui/TabList'
    ];
    
    noExt.forEach(imp => {
        const str1 = 'from "' + imp + '"';
        const str1rep = 'from "' + imp + '.jsx"';
        if (content.includes(str1)) {
            content = content.replace(str1, str1rep);
            hasChanges = true;
        }
        
        const str2 = "from '" + imp + "'";
        const str2rep = "from '" + imp + ".jsx'";
        if (content.includes(str2)) {
            content = content.replace(str2, str2rep);
            hasChanges = true;
        }
    });

    Object.keys(replacementsMap).forEach(key => {
        const str1 = 'from "' + key + '"';
        const str1rep = 'from "' + replacementsMap[key] + '"';
        if (content.includes(str1)) {
            content = content.split(str1).join(str1rep);
            hasChanges = true;
        }
        
        const str2 = "from '" + key + "'";
        const str2rep = "from '" + replacementsMap[key] + "'";
        if (content.includes(str2)) {
            content = content.split(str2).join(str2rep);
            hasChanges = true;
        }
    });
    
    // manual fix
    if (file.endsWith('ReportGeneratorContent.jsx')) {
        if (content.includes('import { dashboardTabs } from ".";')) {
            content = content.replace('import { dashboardTabs } from ".";', 'import { dashboardTabs } from "@/utils/links.jsx";');
            hasChanges = true;
        }
    }
    
    if (hasChanges) {
        fs.writeFileSync(file, content, 'utf8');
        modifiedCount++;
        console.log('Updated imports in: ' + file);
    }
});

console.log('Total files modified: ' + modifiedCount);
