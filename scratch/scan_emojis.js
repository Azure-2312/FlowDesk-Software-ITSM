const fs = require('fs');
const path = require('path');

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/u;

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === '.next' || file === '.git') continue;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath, callback);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.sql') || file.endsWith('.css')) {
      callback(fullPath);
    }
  }
}

let emojiCount = 0;
const targetDirs = [
  path.join(__dirname, '../src'),
  path.join(__dirname, '../db'),
];

for (const dir of targetDirs) {
  if (fs.existsSync(dir)) {
    walkDir(dir, (filePath) => {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (emojiRegex.test(line)) {
          console.log(`EMOJI found at ${filePath}:${idx + 1} -> ${line.trim()}`);
          emojiCount++;
        }
      });
    });
  }
}

console.log(`Total emojis found in codebase: ${emojiCount}`);
