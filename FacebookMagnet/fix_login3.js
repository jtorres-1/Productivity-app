const fs = require('fs');
let code = fs.readFileSync('./fb_magnet.cjs', 'utf8');
code = code.replace(
  `await page.click('button[type="submit"]');`,
  `await page.click('input[type="submit"]');`
);
fs.writeFileSync('./fb_magnet.cjs', code);
console.log('Fixed');
