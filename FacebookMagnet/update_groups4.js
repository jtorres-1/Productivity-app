const fs = require('fs');
let code = fs.readFileSync('./fb_magnet_final.cjs', 'utf8');

const newGroups = `const GROUPS = [
  // PURE BUYER GROUPS — people come here specifically to find developers/websites
  "https://www.facebook.com/groups/needwebsitedesignerordeveloper",
  "https://www.facebook.com/groups/wpwebsitexpress",
  "https://www.facebook.com/groups/modern.web.design.development",
  "https://www.facebook.com/groups/webdeveloperinusa",
  "https://www.facebook.com/groups/IT.Software.Engineer.Jobs",
  "https://www.facebook.com/groups/jobsandgigslosangles",
  "https://www.facebook.com/groups/losangelespaidgigs",
  "https://www.facebook.com/groups/californiatowork",
  "https://www.facebook.com/groups/542004914701764",
  "https://www.facebook.com/groups/663257602740105",
  "https://www.facebook.com/groups/629437286313102",
  "https://www.facebook.com/groups/807226382339543",
  "https://www.facebook.com/groups/748333769171864",
  "https://www.facebook.com/groups/1581116555860881",
  "https://www.facebook.com/groups/aiautomationagency.aaa",
  "https://www.facebook.com/groups/system.automation.ai.agents.n8n.zapier.ifttt",
  "https://www.facebook.com/groups/aichatbotsaivoice",
  "https://www.facebook.com/groups/agenticly",
  "https://www.facebook.com/groups/gohighlevelagencyowners",
  "https://www.facebook.com/groups/gohighlevel1",
  "https://www.facebook.com/groups/highlevelagencyowner",
];`;

code = code.replace(/const GROUPS = \[[\s\S]*?\];/, newGroups);
fs.writeFileSync('./fb_magnet_final.cjs', code);
console.log('Done');
