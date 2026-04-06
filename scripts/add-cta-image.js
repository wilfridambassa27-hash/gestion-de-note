// Script to insert image in CTA white card on homepage
// Run: node scripts/add-cta-image.js

const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/app/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Target CTA section (gros cadre blanc)
const ctaTarget = `
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            className="bg-white rounded-3xl p-16 shadow-2xl border border-emerald-100 max-w-4xl mx-auto"
          >`;

const newCTA = `
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            className="bg-white rounded-3xl p-8 shadow-2xl border border-emerald-100 max-w-3xl mx-auto relative overflow-hidden"
            style={{
              backgroundImage: 'url(/images/bulletin-sample.svg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundBlendMode: 'overlay',
              backgroundColor: 'rgba(255,255,255,0.9)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-orange-500/10" />
            <div className="relative z-10">`;

content = content.replace(ctaTarget, newCTA);

fs.writeFileSync(pagePath, content);
console.log('✅ Image added to CTA white card on homepage!');
console.log('Reload localhost:3001 to see changes.');

