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

const files = findFiles(srcDir, ['.astro', '.jsx', '.tsx', '.js', '.ts']);

let modifiedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let hasChanges = false;
    
    // Regular expression to match imports
    const importRegex = /import\s+[^"']*\s+from\s+['"]([^'"]+)['"]/g;
    
    let match;
    const replacements = [];
    
    while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        if (importPath.startsWith('@/') || importPath.startsWith('./') || importPath.startsWith('../')) {
            if (!importPath.endsWith('.jsx') && !importPath.endsWith('.astro') && !importPath.endsWith('.tsx') && !importPath.endsWith('.ts') && !importPath.endsWith('.js') && !importPath.endsWith('.css')) {
                
                let resolvedPath = '';
                if (importPath.startsWith('@/')) {
                    resolvedPath = path.join(srcDir, importPath.replace('@/', ''));
                } else {
                    resolvedPath = path.join(path.dirname(file), importPath);
                }
                
                if (fs.existsSync(resolvedPath + '.jsx')) {
                    replacements.push({ old: match[0], new: match[0].replace(importPath, importPath + '.jsx') });
                } else if (fs.existsSync(resolvedPath + '.astro')) {
                    replacements.push({ old: match[0], new: match[0].replace(importPath, importPath + '.astro') });
                } else if (fs.existsSync(resolvedPath + '.tsx')) {
                    replacements.push({ old: match[0], new: match[0].replace(importPath, importPath + '.tsx') });
                } else if (fs.existsSync(resolvedPath + '.ts')) {
                    replacements.push({ old: match[0], new: match[0].replace(importPath, importPath + '.ts') });
                } else if (fs.existsSync(path.join(resolvedPath, 'index.astro'))) {
                    replacements.push({ old: match[0], new: match[0].replace(importPath, importPath + '/index.astro') });
                } else if (fs.existsSync(path.join(resolvedPath, 'index.jsx'))) {
                    replacements.push({ old: match[0], new: match[0].replace(importPath, importPath + '/index.jsx') });
                }
            }
        }
    }
    
    replacements.forEach(rep => {
        content = content.replace(rep.old, rep.new);
        hasChanges = true;
    });
    
    if (hasChanges) {
        fs.writeFileSync(file, content, 'utf8');
        modifiedCount++;
        console.log('Updated imports in: ' + file);
    }
});

console.log('Total files modified: ' + modifiedCount);
