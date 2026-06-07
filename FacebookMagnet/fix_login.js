const fs = require('fs');
let code = fs.readFileSync('./fb_magnet.cjs', 'utf8');
code = code.replace(
  `await page.type("input[name="email"]"`,
  `await page.type('input[name="email"]'`
);
code = code.replace(
  `await page.type("input[name="pass"]"`,
  `await page.type('input[name="pass"]'`
);
fs.writeFileSync('./fb_magnet.cjs', code);
console.log('Fixed');
