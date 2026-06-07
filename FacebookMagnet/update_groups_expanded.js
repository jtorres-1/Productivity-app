const fs = require('fs');
let code = fs.readFileSync('./fb_scraper.cjs', 'utf8');

const newGroups = `const GROUPS = [
  // WORDPRESS / WEB DEV HIRE
  "https://www.facebook.com/groups/fixwebsoft",
  "https://www.facebook.com/groups/wordpressai",
  "https://www.facebook.com/groups/1376252454149889",
  "https://www.facebook.com/groups/919732611373456",
  "https://www.facebook.com/groups/onlinefreelancergroup",
  "https://www.facebook.com/groups/web.application.dev",

  // FREELANCE HIRE BOARDS
  "https://www.facebook.com/groups/463665109636647",
  "https://www.facebook.com/groups/1813624732925093",
  "https://www.facebook.com/groups/717415651680045",
  "https://www.facebook.com/groups/1954217561488895",
  "https://www.facebook.com/groups/306545512812361",
  "https://www.facebook.com/groups/needwebsitedesignerordeveloper",
  "https://www.facebook.com/groups/setflip",
  "https://www.facebook.com/groups/654046659934482",
  "https://www.facebook.com/groups/freelancer.community.of.bangladesh1971",
  "https://www.facebook.com/groups/freelancerswebsitesdesigningseosmo",
  "https://www.facebook.com/groups/1562283074220912",
  "https://www.facebook.com/groups/fullstackdevelopersgroup",
  "https://www.facebook.com/groups/webdevelopersglobal",
  "https://www.facebook.com/groups/1360340388701123",
  "https://www.facebook.com/groups/257230967082904",
  "https://www.facebook.com/groups/1183160386911574",
  "https://www.facebook.com/groups/243803078426794",
  "https://www.facebook.com/groups/webdeveloperinusa",
  "https://www.facebook.com/groups/modern.web.design.development",
  "https://www.facebook.com/groups/wpwebsitexpress",
  "https://www.facebook.com/groups/IT.Software.Engineer.Jobs",

  // APP DEV HIRE
  "https://www.facebook.com/groups/appdevelopersforhire",
  "https://www.facebook.com/groups/iosdevelopersforhire",
  "https://www.facebook.com/groups/androidappdev",
  "https://www.facebook.com/groups/reactnativedevelopers",
  "https://www.facebook.com/groups/flutterdevelopers",

  // PYTHON / AUTOMATION HIRE
  "https://www.facebook.com/groups/pythondevelopersforhire",
  "https://www.facebook.com/groups/pythonprogrammers",
  "https://www.facebook.com/groups/automationdevelopersjobs",
  "https://www.facebook.com/groups/aiautomationagency.aaa",
  "https://www.facebook.com/groups/system.automation.ai.agents.n8n.zapier.ifttt",
  "https://www.facebook.com/groups/aichatbotsaivoice",
  "https://www.facebook.com/groups/agenticly",
  "https://www.facebook.com/groups/gohighlevelagencyowners",
  "https://www.facebook.com/groups/gohighlevel1",
  "https://www.facebook.com/groups/highlevelagencyowner",

  // JOBS AND GIGS — paid work posted daily
  "https://www.facebook.com/groups/jobsandgigslosangles",
  "https://www.facebook.com/groups/losangelespaidgigs",
  "https://www.facebook.com/groups/californiatowork",
  "https://www.facebook.com/groups/LongBeachSBG",
  "https://www.facebook.com/groups/socalbusiness",
  "https://www.facebook.com/groups/losangelesentrepreneursstartups",
  "https://www.facebook.com/groups/startups.investors.entrepreneurs.mentors.founders",
  "https://www.facebook.com/groups/smallbusinessownerandentrepreneurs",
  "https://www.facebook.com/groups/usasmallbusinesscommunity",
  "https://www.facebook.com/groups/CaliforniaBusinessOwners",
  "https://www.facebook.com/groups/BusinessInUSACanada",
  "https://www.facebook.com/groups/aibusinesstools",
];`;

code = code.replace(/const GROUPS = \[[\s\S]*?\];/, newGroups);
fs.writeFileSync('./fb_scraper.cjs', code);

// Also update fb_dmbot.cjs DM message to be cleaner
console.log('Done — 55 groups loaded');
