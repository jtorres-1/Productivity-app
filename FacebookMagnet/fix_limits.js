const fs = require('fs');
let code = fs.readFileSync('./fb_dmbot.cjs', 'utf8');
code = code.replace('const MAX_DMS_PER_SESSION = 15;', 'const MAX_DMS_PER_SESSION = 100;');
code = code.replace('const MIN_DELAY_MS = 55000;', 'const MIN_DELAY_MS = 30000;');
code = code.replace('const MAX_DELAY_MS = 120000;', 'const MAX_DELAY_MS = 60000;');
fs.writeFileSync('./fb_dmbot.cjs', code);
console.log('Updated — 100 DMs, 30-60s delays');
