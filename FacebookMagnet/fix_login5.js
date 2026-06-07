const fs = require('fs');
let code = fs.readFileSync('./fb_magnet.cjs', 'utf8');
code = code.replace(
  `await page.waitForSelector('input[type="submit"]', { visible: true });
  await page.click('input[type="submit"]');`,
  `await page.waitForSelector('[aria-label="Log In"]', { visible: true });
  await page.click('[aria-label="Log In"]');`
);
fs.writeFileSync('./fb_magnet.cjs', code);
console.log('Fixed');
