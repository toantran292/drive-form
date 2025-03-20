const fs = require('fs');
const path = require('path');

const workerPath = path.join(__dirname, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');
const destPath = path.join(__dirname, 'public', 'pdf.worker.min.mjs');

// Ensure public directory exists
if (!fs.existsSync(path.join(__dirname, 'public'))) {
    fs.mkdirSync(path.join(__dirname, 'public'));
}

// Copy worker file
fs.copyFileSync(workerPath, destPath);
console.log('PDF worker copied successfully!'); 