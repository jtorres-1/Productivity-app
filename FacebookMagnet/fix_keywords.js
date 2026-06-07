const fs = require('fs');
let code = fs.readFileSync('./fb_magnet.cjs', 'utf8');
code = code.replace(
  `}, keywords);`,
  `}, KEYWORDS);`
);
fs.writeFileSync('./fb_magnet.cjs', code);
console.log('Fixed');
