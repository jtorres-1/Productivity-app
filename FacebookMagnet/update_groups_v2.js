const fs = require('fs');
let code = fs.readFileSync('./fb_magnet_final.cjs', 'utf8');

const newGroups = `const GROUPS = [
  // FREELANCE/HIRE — buyers post projects daily
  "https://www.facebook.com/groups/fixwebsoft",
  "https://www.facebook.com/groups/phpcoder",
  "https://www.facebook.com/groups/463665109636647",
  "https://www.facebook.com/groups/1813624732925093",
  "https://www.facebook.com/groups/Nehasedostikaroge",
  "https://www.facebook.com/groups/1954217561488895",
  "https://www.facebook.com/groups/717415651680045",
  "https://www.facebook.com/groups/web.application.dev",
  "https://www.facebook.com/groups/243803078426794",
  "https://www.facebook.com/groups/wordpressai",
  "https://www.facebook.com/groups/306545512812361",
  "https://www.facebook.com/groups/onlinefreelancergroup",
  "https://www.facebook.com/groups/needwebsitedesignerordeveloper",
  "https://www.facebook.com/groups/wpwebsitexpress",
  "https://www.facebook.com/groups/modern.web.design.development",
  "https://www.facebook.com/groups/webdeveloperinusa",
  "https://www.facebook.com/groups/IT.Software.Engineer.Jobs",
  "https://www.facebook.com/groups/setflip",
  "https://www.facebook.com/groups/freelancer.community.of.bangladesh1971",
  "https://www.facebook.com/groups/freelancerswebsitesdesigningseosmo",
  "https://www.facebook.com/groups/1376252454149889",
  "https://www.facebook.com/groups/919732611373456",
  "https://www.facebook.com/groups/654046659934482",
  "https://www.facebook.com/groups/1562283074220912",
  "https://www.facebook.com/groups/fullstackdevelopersgroup",
  "https://www.facebook.com/groups/webdevelopersglobal",
  "https://www.facebook.com/groups/1360340388701123",
  "https://www.facebook.com/groups/257230967082904",
  "https://www.facebook.com/groups/1183160386911574",

  // JOBS AND GIGS — people post paid work
  "https://www.facebook.com/groups/jobsandgigslosangles",
  "https://www.facebook.com/groups/losangelespaidgigs",
  "https://www.facebook.com/groups/californiatowork",
  "https://www.facebook.com/groups/LongBeachSBG",
  "https://www.facebook.com/groups/socalbusiness",
  "https://www.facebook.com/groups/losangelesentrepreneursstartups",

  // STARTUP AND ENTREPRENEUR — need tech built
  "https://www.facebook.com/groups/startups.investors.entrepreneurs.mentors.founders",
  "https://www.facebook.com/groups/smallbusinessownerandentrepreneurs",
  "https://www.facebook.com/groups/757441813621424",
  "https://www.facebook.com/groups/usasmallbusinesscommunity",
  "https://www.facebook.com/groups/CaliforniaBusinessOwners",
  "https://www.facebook.com/groups/BusinessInUSACanada",
  "https://www.facebook.com/groups/aibusinesstools",

  // AI AND AUTOMATION BUYERS
  "https://www.facebook.com/groups/aiautomationagency.aaa",
  "https://www.facebook.com/groups/system.automation.ai.agents.n8n.zapier.ifttt",
  "https://www.facebook.com/groups/aichatbotsaivoice",
  "https://www.facebook.com/groups/agenticly",
  "https://www.facebook.com/groups/gohighlevelagencyowners",
  "https://www.facebook.com/groups/gohighlevel1",
  "https://www.facebook.com/groups/highlevelagencyowner",

  // RESTAURANT OWNERS — need websites and online ordering
  "https://www.facebook.com/groups/748711238658025",
  "https://www.facebook.com/groups/581853060030923",
  "https://www.facebook.com/groups/245646194310228",
  "https://www.facebook.com/groups/1051251699515135",
  "https://www.facebook.com/groups/TheFoodIndustry",
  "https://www.facebook.com/groups/lacountyrestaurants",

  // REAL ESTATE — agents need websites and lead gen tools
  "https://www.facebook.com/groups/calirealestate",
  "https://www.facebook.com/groups/RealtorsGroup",
  "https://www.facebook.com/groups/SoCalRealEstateProfessionals",
  "https://www.facebook.com/groups/realestateleadgenerationservice",
];`;

code = code.replace(/const GROUPS = \[[\s\S]*?\];/, newGroups);
fs.writeFileSync('./fb_magnet_final.cjs', code);
console.log('Done — ' + newGroups.match(/https/g).length + ' groups loaded');
