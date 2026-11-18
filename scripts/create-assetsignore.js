const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', '.vercel', 'output', 'static');
const targetFile = path.join(targetDir, '.assetsignore');

try {
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(targetFile, '_worker.js\n_routes.json\n', 'utf8');
  console.log('✅ Successfully created .assetsignore in .vercel/output/static');
} catch (err) {
  console.error('Failed to create .assetsignore:', err);
}
