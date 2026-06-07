const fs = require('fs');
let code = fs.readFileSync('./fb_magnet_final.cjs', 'utf8');

const newGroups = `const GROUPS = [
  // People specifically looking for website builders or developers
  "https://www.facebook.com/groups/needwebsitedesignerordeveloper",
  "https://www.facebook.com/groups/wpwebsitexpress",
  "https://www.facebook.com/groups/modern.web.design.development",
  "https://www.facebook.com/groups/webdeveloperinusa",
  "https://www.facebook.com/groups/IT.Software.Engineer.Jobs",

  // LA and California jobs/gigs
  "https://www.facebook.com/groups/jobsandgigslosangles",
  "https://www.facebook.com/groups/losangelespaidgigs",
  "https://www.facebook.com/groups/californiatowork",

  // Freelance and developer for hire
  "https://www.facebook.com/groups/freelancer.community.of.bangladesh1971",
  "https://www.facebook.com/groups/freelancerswebsitesdesigningseosmo",
  "https://www.facebook.com/groups/1241150087607449",
  "https://www.facebook.com/groups/leadgenerationBangladesh",
  "https://www.facebook.com/groups/setflip",
  "https://www.facebook.com/groups/629437286313102",
  "https://www.facebook.com/groups/807226382339543",
  "https://www.facebook.com/groups/748333769171864",
  "https://www.facebook.com/groups/1581116555860881",
  "https://www.facebook.com/groups/542004914701764",
  "https://www.facebook.com/groups/663257602740105",
];`;

code = code.replace(/const GROUPS = \[[\s\S]*?\];/, newGroups);
fs.writeFileSync('./fb_magnet_final.cjs', code);
console.log('Done');
