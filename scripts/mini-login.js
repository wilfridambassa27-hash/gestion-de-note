// Mini login - absolute smallest sizes for login page
// Run: node scripts/mini-login.js

const fs = require('fs');
const path = require('path');

const loginPath = path.join(__dirname, '../src/app/(auth)/login/page.tsx');
let content = fs.readFileSync(loginPath, 'utf8');

// Final extreme compact for login
content = content.replace(/text-3xl|lg:text-4xl/g, 'text-xl lg:text-2xl');
content = content.replace(/text-2xl/g, 'text-lg');
content = content.replace(/text-xl/g, 'text-base');
content = content.replace(/text-base/g, 'text-sm');
content = content.replace(/text-sm/g, 'text-xs');

content = content.replace(/py-12/g, 'py-6');
content = content.replace(/py-8|py-6/g, 'py-4');
content = content.replace(/p-12|p-10|p-8/g, 'p-6');
content = content.replace(/p-6/g, 'p-4');

content = content.replace(/gap-16/g, 'gap-4');
content = content.replace(/gap-12|gap-8/g, 'gap-3');
content = content.replace(/gap-6|gap-4/g, 'gap-2');

content = content.replace(/w-14 h-14|w-12 h-12/g, 'w-10 h-10');
content = content.replace(/w-10 h-10|w-8 h-8/g, 'w-6 h-6');
content = content.replace(/w-6 h-6/g, 'w-5 h-5');

content = content.replace(/h-\\[500px\\]/g, 'h-48');
content = content.replace(/h-\\[300px\\]/g, 'h-32');

content = content.replace(/max-w-7xl/g, 'max-w-2xl');
content = content.replace(/max-w-6xl/g, 'max-w-md');
content = content.replace(/max-w-4xl/g, 'max-w-sm');

fs.writeFileSync(loginPath, content);
console.log('✅ LOGIN PAGE MINI-COMPACT - tiniest!');
console.log('View: localhost:3001/login');

