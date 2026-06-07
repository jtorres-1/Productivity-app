const fs = require('fs');
let code = fs.readFileSync('./fb_magnet_final.cjs', 'utf8');

// TIGHT keywords — only posts where someone is clearly asking for dev help
const newKeywords = `const KEYWORDS = [
  // Website
  "need a website", "need website", "want a website",
  "looking for a website", "build me a website",
  "need someone to build my website", "need a site built",
  "need a landing page", "need a web developer",
  "looking for a web developer", "hire a web developer",
  "need wordpress site", "need shopify site",
  "need an ecommerce site", "need online store built",
  "website for my business", "need a business website",
  "how much for a website", "how much does a website cost",
  "need website redesign", "redo my website",
  "fix my website", "update my website",

  // Developer/programmer
  "need a developer", "looking for a developer", "hire a developer",
  "need a programmer", "looking for a programmer", "hire a programmer",
  "need a coder", "looking for a coder", "need someone to code",
  "need a software developer", "looking for software developer",
  "need a full stack developer", "need a backend developer",
  "need a frontend developer", "need a python developer",
  "need a react developer", "need a node developer",
  "need a javascript developer", "need a php developer",
  "need a wordpress developer", "need a shopify developer",

  // Freelancer
  "looking for a freelancer", "need a freelancer", "hire a freelancer",
  "looking to hire a developer", "need to hire a developer",
  "need contract developer", "need freelance developer",
  "looking for freelance developer", "need a tech person",

  // App
  "need an app built", "need a mobile app", "build me an app",
  "need an ios app", "need an android app", "need a web app",
  "need app developer", "looking for app developer",

  // Automation and bots
  "need automation", "need a bot built", "need a scraper built",
  "need web scraping", "need a python script", "need api integration",
  "need a chatbot built", "need ai integration", "need ai tool built",
  "need workflow automation", "need zapier alternative",

  // General
  "does anyone build websites", "anyone build websites",
  "recommend a web developer", "recommend a developer",
  "recommend a programmer", "need someone who can build",
  "have a project need a developer", "looking for someone to build",
  "paid project for developer", "budget for developer",
  "willing to pay for developer", "will pay for website",
];`;

// Best public groups — 10K+ members, high buyer intent
const newGroups = `const GROUPS = [
  // Freelance/hire — buyers post projects here daily
  "https://www.facebook.com/groups/fixwebsoft",              // WordPress Jobs 99K
  "https://www.facebook.com/groups/463665109636647",         // Frontend Dev Jobs/Freelance 41K
  "https://www.facebook.com/groups/phpcoder",                // Web Developer Community 114K
  "https://www.facebook.com/groups/1813624732925093",        // Web Developer Freelancers 23K
  "https://www.facebook.com/groups/Nehasedostikaroge",       // Website Developers & Designers 35K
  "https://www.facebook.com/groups/1954217561488895",        // Freelance Web Design & Dev 12K
  "https://www.facebook.com/groups/717415651680045",         // Freelancers IT Projects 12K
  "https://www.facebook.com/groups/web.application.dev",     // Web App Dev Group 22K
  "https://www.facebook.com/groups/243803078426794",         // Mobile App Dev 10K
  "https://www.facebook.com/groups/wordpressai",             // WordPress AI Dev 22K
  "https://www.facebook.com/groups/306545512812361",         // Freelance Web Developers/Employers 2.8K
  "https://www.facebook.com/groups/onlinefreelancergroup",   // Web Design and Development 10K

  // Entrepreneur/startup — buyers who need dev help
  "https://www.facebook.com/groups/startups.investors.entrepreneurs.mentors.founders",
  "https://www.facebook.com/groups/losangelesentrepreneursstartups",
  "https://www.facebook.com/groups/smallbusinessownerandentrepreneurs",
  "https://www.facebook.com/groups/757441813621424",         // Small Business Owners 57K
  "https://www.facebook.com/groups/socalbusiness",
  "https://www.facebook.com/groups/CaliforniaBusinessOwners",
  "https://www.facebook.com/groups/usasmallbusinesscommunity",
  "https://www.facebook.com/groups/BusinessInUSACanada",

  // Local LA/SoCal — local buyers more likely to pay
  "https://www.facebook.com/groups/jobsandgigslosangles",
  "https://www.facebook.com/groups/losangelespaidgigs",
  "https://www.facebook.com/groups/californiatowork",
  "https://www.facebook.com/groups/LongBeachSBG",

  // Restaurant owners — need websites, online ordering
  "https://www.facebook.com/groups/748711238658025",         // Restaurant Owners and Managers
  "https://www.facebook.com/groups/581853060030923",         // Restaurant Owners
  "https://www.facebook.com/groups/245646194310228",         // Restaurant Food Beverage
  "https://www.facebook.com/groups/1051251699515135",        // USA Restaurants owners
  "https://www.facebook.com/groups/TheFoodIndustry",

  // AI/automation buyers
  "https://www.facebook.com/groups/aiautomationagency.aaa",
  "https://www.facebook.com/groups/system.automation.ai.agents.n8n.zapier.ifttt",
  "https://www.facebook.com/groups/aichatbotsaivoice",
];`;

// Updated DM message with all links
const newDM = `const DM_MESSAGE = \`hey! saw your post. i'm a python developer based in LA available immediately. i build websites, scrapers, bots, ai integrations, and automation pipelines. 48 hour delivery, flat fee.

recent work:
restaurant site: https://casa-fuego-demo.netlify.app
cleaning business: https://claudiascleaningla.com
church site: https://iphavp.org
lead scraper saas: https://mapzap.org

linkedin: https://www.linkedin.com/in/jesse-torres11/
github: https://github.com/jtorres-1

dm me a scope.\`;`;

code = code.replace(/const KEYWORDS = \[[\s\S]*?\];/, newKeywords);
code = code.replace(/const GROUPS = \[[\s\S]*?\];/, newGroups);
code = code.replace(/const DM_MESSAGE = `[\s\S]*?`;/, newDM);
fs.writeFileSync('./fb_magnet_final.cjs', code);
console.log('Done');
