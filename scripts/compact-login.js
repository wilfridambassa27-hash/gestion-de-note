// Script to reduce size of ALL login/register/reset-password interfaces
// Run: node scripts/compact-login.js

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const loginFiles = glob.sync('src/app/(auth)/*page.tsx');

loginFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Reduce headings
  content = content.replace(/text-5xl/g, 'text-3xl');
  content = content.replace(/text-4xl/g, 'text-2xl');
  content = content.replace(/text-3xl/g, 'text-xl');
  content = content.replace(/text-xl/g, 'text-base');
  content = content.replace(/text-lg/g, 'text-sm');

  // Compact padding/margins
  content = content.replace(/py-20|py-24/g, 'py-12');
  content = content.replace(/py-12|py-16/g, 'py-8');
  content = content.replace(/p-10| p-12/g, 'p-6');
  content = content.replace(/gap-16|gap-20/g, 'gap-8');
  content = content.replace(/gap-8/g, 'gap-4');
  content = content.replace(/max-w-7xl/g, 'max-w-4xl');
  content = content.replace(/max-w-6xl/g, 'max-w-3xl');
  content = content.replace(/max-w-4xl/g, 'max-w-2xl');
  content = content.replace(/w-20 h-20|w-16 h-16/g, 'w-14 h-14');
  content = content.replace(/w-10 h-10|w-12 h-12/g, 'w-8 h-8');
  content = content.replace(/w-8 h-8|w-6 h-6/g, 'w-6 h-6');
  content = content.replace(/w-32 h-32/g, 'w-24 h-24');
  content = content.replace(/h-\\[300px\\]/g, 'h-48');

  // Buttons/inputs compact
  content = content.replace(/py-6 px-12/g, 'py-4 px-8');
  content = content.replace(/py-5 px-10/g, 'py-3 px-6');
  content = content.replace(/text-xl text-lg/g, 'text-base text-sm');

  fs.writeFileSync(file, content);
  console.log(`✅ Compacted ${path.basename(file)}`);
});

console.log('\n🎉 All login interfaces compacted to 14px scale!');
console.log('📱 Reload localhost:3001/login, /register');

