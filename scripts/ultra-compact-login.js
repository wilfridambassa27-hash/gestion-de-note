// Ultra-compact login interfaces - final size reduction
// No dependencies - pure string replace
// Run: node scripts/ultra-compact-login.js

const fs = require('fs');
const path = require('path');

const files = [
  'src/app/(auth)/login/page.tsx',
  'src/app/(auth)/register/page.tsx',
  'src/app/(auth)/reset-password/page.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Ultra compact: Headings
  content = content.replace(/text-5xl|lg:text-7xl/g, 'text-2xl');
  content = content.replace(/text-4xl|lg:text-5xl/g, 'text-xl');
  content = content.replace(/text-3xl/g, 'text-lg');
  content = content.replace(/text-xl/g, 'text-base');
  content = content.replace(/text-lg/g, 'text-sm');
  content = content.replace(/text-sm/g, 'text-xs');

  // Ultra compact: Padding/Margins
  content = content.replace(/py-24|py-20/g, 'py-8');
  content = content.replace(/py-16|py-12/g, 'py-6');
  content = content.replace(/py-10|py-8/g, 'py-4');
  content = content.replace(/p-16|p-12|p-10/g, 'p-6');
  content = content.replace(/p-8|p-6/g, 'p-4');
  content = content.replace(/gap-20|gap-16/g, 'gap-4');
  content = content.replace(/gap-12|gap-8/g, 'gap-3');
  content = content.replace(/gap-6|gap-4/g, 'gap-2');
  content = content.replace(/mb-20|mb-16|mb-12/g, 'mb-6');
  content = content.replace(/mb-10|mb-8|mb-6/g, 'mb-4');
  content = content.replace(/mb-4/g, 'mb-3');

  // Icons ultra small
  content = content.replace(/w-20 h-20|w-16 h-16/g, 'w-12 h-12');
  content = content.replace(/w-12 h-12|w-10 h-10/g, 'w-8 h-8');
  content = content.replace(/w-8 h-8|w-7 h-7|w-6 h-6/g, 'w-6 h-6');
  content = content.replace(/w-5 h-5|w-4 h-4/g, 'w-4 h-4');

  // Buttons/inputs ultra compact
  content = content.replace(/py-6 px-12|py-5 px-10/g, 'py-3 px-6');
  content = content.replace(/py-4 px-8|py-3 px-6/g, 'py-2.5 px-4');

  // Containers
  content = content.replace(/max-w-7xl/g, 'max-w-4xl');
  content = content.replace(/max-w-6xl|max-w-5xl/g, 'max-w-3xl');
  content = content.replace(/max-w-4xl|max-w-2xl/g, 'max-w-xl');

  // Heights
  content = content.replace(/h-\\[500px\\]/g, 'h-64');
  content = content.replace(/h-\\[300px\\]|h-\\[32rem\\]/g, 'h-48');
  content = content.replace(/h-\\[24rem\\]|h-\\[20rem\\]/g, 'h-40');

  fs.writeFileSync(file, content);
  console.log(`✅ Ultra-compacted ${path.basename(file)}`);
});

console.log('\n🏆 Login interfaces ULTRA-COMPACT - smallest possible!');
console.log('📱 Test: localhost:3001/login');

