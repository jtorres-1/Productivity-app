const fs = require('fs');
let code = fs.readFileSync('./fb_magnet_final.cjs', 'utf8');

const newGroups = `const GROUPS = [
  // Website/dev hire groups
  "https://www.facebook.com/groups/needwebsitedesignerordeveloper",
  "https://www.facebook.com/groups/wpwebsitexpress",
  "https://www.facebook.com/groups/modern.web.design.development",
  "https://www.facebook.com/groups/webdeveloperinusa",
  "https://www.facebook.com/groups/IT.Software.Engineer.Jobs",

  // Business owners — high activity
  "https://www.facebook.com/groups/757441813621424",       // Small Business Owners
  "https://www.facebook.com/groups/smallbusinessownerandentrepreneurs",
  "https://www.facebook.com/groups/usasmallbusinesscommunity",
  "https://www.facebook.com/groups/smallbizownersnetworking",
  "https://www.facebook.com/groups/CaliforniaBusinessOwners",
  "https://www.facebook.com/groups/socalbusiness",
  "https://www.facebook.com/groups/losangelesentrepreneursstartups",
  "https://www.facebook.com/groups/BusinessInUSACanada",
  "https://www.facebook.com/groups/startups.investors.entrepreneurs.mentors.founders",

  // Restaurants
  "https://www.facebook.com/groups/748711238658025",       // Restaurant Owners and Managers
  "https://www.facebook.com/groups/581853060030923",       // Restaurant Owners
  "https://www.facebook.com/groups/245646194310228",       // Restaurant Food Beverage
  "https://www.facebook.com/groups/1051251699515135",      // USA Restaurants owners
  "https://www.facebook.com/groups/TheFoodIndustry",
  "https://www.facebook.com/groups/lacountyrestaurants",

  // Contractors/trades
  "https://www.facebook.com/groups/dfwtrustedcontractors",
  "https://www.facebook.com/groups/AutoRepairShopsUSA",
  "https://www.facebook.com/groups/LawnCareandLandscapingBusiness",

  // Barbershops/salons
  "https://www.facebook.com/groups/ProfessionalBarbers",
  "https://www.facebook.com/groups/hairsalonnetworking",
  "https://www.facebook.com/groups/salonownersonly",

  // Real estate
  "https://www.facebook.com/groups/calirealestate",
  "https://www.facebook.com/groups/RealtorsGroup",
  "https://www.facebook.com/groups/SoCalRealEstateProfessionals",

  // AI/automation
  "https://www.facebook.com/groups/aiautomationagency.aaa",
  "https://www.facebook.com/groups/system.automation.ai.agents.n8n.zapier.ifttt",
  "https://www.facebook.com/groups/aichatbotsaivoice",

  // Jobs/gigs
  "https://www.facebook.com/groups/jobsandgigslosangles",
  "https://www.facebook.com/groups/losangelespaidgigs",
  "https://www.facebook.com/groups/californiatowork",
];`;

code = code.replace(/const GROUPS = \[[\s\S]*?\];/, newGroups);
fs.writeFileSync('./fb_magnet_final.cjs', code);
console.log('Groups updated with verified URLs');
