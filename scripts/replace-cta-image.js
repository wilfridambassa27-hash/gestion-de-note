// Script to replace CTA white card image with WhatsApp Image 2026-03-17 at 09.09.43.jpeg
// First, save image as public/images/whatsapp-hero.jpg
// Then run: node scripts/replace-cta-image.js

const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/app/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Target current image link and replace with new
const oldImage = '/images/bulletin-sample.svg';
const newImage = '/images/whatsapp-hero.jpg'; // Place your WhatsApp image here

if (content.includes(oldImage)) {
  content = content.replace(new RegExp(oldImage, 'g'), newImage);
  fs.writeFileSync(pagePath, content);
  console.log(`✅ WhatsApp Image inserted in CTA white card! (${newImage})`);
  console.log('📱 Reload localhost:3001');
} else {
  console.log('❌ Current image not found. Check page.tsx for /images/bulletin-sample.svg');
}

console.log(`
🚀 Steps:
1. Save "WhatsApp Image 2026-03-17 at 09.09.43.jpeg" as public/images/whatsapp-hero.jpg
2. Run this script again
3. View updated CTA card at localhost:3001
`);

