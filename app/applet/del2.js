import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');
const lines = code.split('\n');

const startLine = lines.findIndex(l => l.includes('<div className="hidden">'));
const endLine = lines.findIndex(l => l.includes('{/* TAB 1: RADAR PORTAL (VISION SPECIFICATION & TRACKERS BACKLOGS) */}'));

let changes = 0;
if (startLine > 0 && endLine > startLine) {
  lines.splice(startLine, endLine - startLine);
  changes++;
} else {
  console.log('Not found', startLine, endLine);
}

const sectionCloseIdx = lines.findIndex(l => l.includes('</section>'));
if (sectionCloseIdx > 0) {
  lines.splice(sectionCloseIdx, 1);
  changes++;
}

if (changes > 0) {
  fs.writeFileSync('src/App.tsx', lines.join('\n'));
  console.log('Success, made changes');
} else {
  console.log('No changes made');
}
