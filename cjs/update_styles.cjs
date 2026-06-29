const fs = require('fs');
const path = require('path');

const srcDir = path.join('C:', 'Users', 'ASUS', 'Desktop', 'uco system', 'admin-dashboard', 'src', 'components', 'react', 'interactive');

const filesToUpdate = [
    'MediaAnalyticsContent.jsx',
    'TeamCalendarContent.jsx',
    'ArchivedFormsContent.jsx',
    'ReportGeneratorContent.jsx'
];

filesToUpdate.forEach(filename => {
    const filepath = path.join(srcDir, filename);
    if (!fs.existsSync(filepath)) return;
    
    let content = fs.readFileSync(filepath, 'utf8');

    // Upgrade backgrounds & cards for glassmorphism
    content = content.replace(/bg-white\s+p-8\s+rounded-\[30px\]\s+shadow-\[0_18px_40px_rgba\(112,144,176,0\.12\)\]/g, 'bg-white/70 backdrop-blur-2xl border border-white/60 p-8 rounded-[30px] shadow-[0_20px_50px_rgba(112,144,176,0.15)] hover:shadow-[0_25px_60px_rgba(112,144,176,0.2)] transition-all duration-500');
    content = content.replace(/bg-white\s+p-6\s+rounded-2xl/g, 'bg-white/80 backdrop-blur-xl border border-white/50 p-6 rounded-3xl hover:-translate-y-1.5 duration-300');
    content = content.replace(/bg-white\s+rounded-\[30px\]/g, 'bg-white/80 backdrop-blur-xl border border-white/50 rounded-[30px]');
    content = content.replace(/bg-white\s+rounded-\[10px\]/g, 'bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl');

    // Upgrade buttons with gradients
    content = content.replace(/bg-\[#1B2559\] text-white/g, 'bg-gradient-to-r from-[#1B2559] to-[#3a478c] text-white hover:from-[#0f1742] hover:to-[#2d3978] shadow-lg shadow-indigo-900/20 hover:shadow-indigo-900/40 hover:-translate-y-0.5 duration-300');
    content = content.replace(/bg-indigo-600/g, 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5 duration-300');

    // Text Gradients for Headings
    content = content.replace(/text-\[#1B2559\] uppercase/g, 'bg-clip-text text-transparent bg-gradient-to-r from-[#1B2559] to-[#46549b] uppercase');
    
    // Add micro-animations to rows
    content = content.replace(/hover:bg-\[#F4F7FE\]\/50 transition-colors/g, 'hover:bg-gradient-to-r hover:from-[#F4F7FE]/80 hover:to-white hover:shadow-md hover:scale-[1.01] transition-all duration-300');

    // Make metric text vibrant
    content = content.replace(/text-3xl font-black text-\[#0075FF\]/g, 'text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500 drop-shadow-sm');
    content = content.replace(/text-3xl font-black text-\[#05CD99\]/g, 'text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-500 drop-shadow-sm');
    content = content.replace(/text-3xl font-black text-\[#FFB800\]/g, 'text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500 drop-shadow-sm');
    content = content.replace(/text-3xl font-black text-\[#EE5D50\]/g, 'text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-red-500 drop-shadow-sm');

    // Subtle table header updates
    content = content.replace(/bg-white z-10/g, 'bg-white/80 backdrop-blur-md z-10');

    fs.writeFileSync(filepath, content, 'utf8');
    console.log('Updated styles in ' + filename);
});
