// Script to open tag and insert image link in CTA card (gros cadre blanc)
// Usage: node scripts/insert-image-tag.js

const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/app/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Find CTA motion.div (gros cadre blanc)
const ctaMatch = content.match(/<motion\.div\s+initial=\{\{ opacity: 0, y: 30 \}\} \s+whileInView=\{\{ opacity: 1, y: 0 \}\} \s+className="bg-white[^"]*"[^>]*>/);
if (!ctaMatch) {
  console.log('❌ CTA div not found. Check page.tsx structure.');
  process.exit(1);
}

const ctaStart = ctaMatch[0];
const newCTAStart = `${ctaStart.slice(0, -1)} style={{ backgroundImage: 'url(/images/bulletin-sample.svg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>`;

// Replace
content = content.replace(ctaStart, newCTAStart);

fs.writeFileSync(pagePath, content);
console.log('✅ Image tag opened & link inserted in CTA white card!');
console.log('📱 Reload localhost:3001');

