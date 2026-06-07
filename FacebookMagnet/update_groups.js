const fs = require('fs');
let code = fs.readFileSync('./fb_magnet_final.cjs', 'utf8');

const newGroups = `const GROUPS = [
  // Website/dev hire groups — high member count
  "https://www.facebook.com/groups/webdesignanddevelopment",        // 163K
  "https://www.facebook.com/groups/websitedevelopersanddesigners",  // 35K
  "https://www.facebook.com/groups/wordpressjobsandprojects",       // 99K
  "https://www.facebook.com/groups/freelanceprogramming",           // large
  "https://www.facebook.com/groups/webdevelopment",                 // large
  "https://www.facebook.com/groups/reactdevelopers",                // large
  "https://www.facebook.com/groups/javascriptdevelopers",           // large
  "https://www.facebook.com/groups/pythondevelopers",               // large
  "https://www.facebook.com/groups/softwaredevelopers",             // large
  "https://www.facebook.com/groups/freelancewebdevelopers",         // large
  "https://www.facebook.com/groups/hireafreelancerdeveloper",       // large
  "https://www.facebook.com/groups/remotejobsforanyone",            // large
  "https://www.facebook.com/groups/freelancejobsboard",             // large
  "https://www.facebook.com/groups/onlinejobsfreelance",            // large
  "https://www.facebook.com/groups/aiautomationagency",             // large
  "https://www.facebook.com/groups/n8nautomation",                  // large
  // Business owner groups — 50K+
  "https://www.facebook.com/groups/smallbusinessowners",            // 57K
  "https://www.facebook.com/groups/womenentrepreneurs",             // 485K
  "https://www.facebook.com/groups/entrepreneursnetwork",           // large
  "https://www.facebook.com/groups/evangelistsandpastors",          // 218K
  "https://www.facebook.com/groups/helpinghandsformissionariesandpastors", // 136K
  "https://www.facebook.com/groups/supportingpastors",              // 62K
  "https://www.facebook.com/groups/barberscorner",                  // 746K
  "https://www.facebook.com/groups/hairsalonnetworking",            // 41K
  "https://www.facebook.com/groups/cleanersconnect",                // 41K
  "https://www.facebook.com/groups/landscapemaintenancecompanyowners", // 51K
  "https://www.facebook.com/groups/lawncareandlandscapingbusiness", // 19K
  "https://www.facebook.com/groups/dfwtrustedcontractors",          // 26K
  "https://www.facebook.com/groups/houstonresidentialandcommercialcontractors", // 39K
];`;

code = code.replace(/const GROUPS = \[[\s\S]*?\];/, newGroups);
fs.writeFileSync('./fb_magnet_final.cjs', code);
console.log('Groups updated');
