const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'DOCUMENTACIÓN');
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u;

let found = 0;
fs.readdirSync(dir).forEach(f => {
  if (f.endsWith('.md')) {
    const content = fs.readFileSync(path.join(dir, f), 'utf8');
    const matches = content.match(emojiRegex);
    if (matches) {
      console.log(`Emoji in ${f}:`, matches);
      found++;
    }
  }
});

console.log(`Scan in DOCUMENTACIÓN finished. Total emojis found: ${found}`);
