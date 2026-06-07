const fs = require('fs');
let code = fs.readFileSync('./fb_magnet_final.cjs', 'utf8');

const newGroups = `const GROUPS = [
  // High volume freelance/hire groups — verified from Facebook search
  "https://www.facebook.com/groups/fixwebsoft",              // WordPress Jobs 99K
  "https://www.facebook.com/groups/phpcoder",                // Web Developer Community 114K
  "https://www.facebook.com/groups/463665109636647",         // Frontend Dev Jobs 41K
  "https://www.facebook.com/groups/1813624732925093",        // Web Developer Freelancers 23K
  "https://www.facebook.com/groups/Nehasedostikaroge",       // Website Developers & Designers 35K
  "https://www.facebook.com/groups/1954217561488895",        // Freelance Web Design & Development 12K
  "https://www.facebook.com/groups/306545512812361",         // Freelance Web Developers/Employers 2.8K
  "https://www.facebook.com/groups/717415651680045",         // Freelancers IT Projects 12K
  "https://www.facebook.com/groups/web.application.dev",     // Web App Dev 22K
  "https://www.facebook.com/groups/243803078426794",         // Mobile App Dev 10K
  "https://www.facebook.com/groups/onlinefreelancergroup",   // Web Design and Development 10K
  "https://www.facebook.com/groups/wordpressai",             // WordPress AI 22K
  "https://www.facebook.com/groups/webdevelopersglobal",     // Web Developers Global 2.4K
  // From your joined groups
  "https://www.facebook.com/groups/needwebsitedesignerordeveloper",
  "https://www.facebook.com/groups/wpwebsitexpress",
  "https://www.facebook.com/groups/modern.web.design.development",
  "https://www.facebook.com/groups/webdeveloperinusa",
  "https://www.facebook.com/groups/IT.Software.Engineer.Jobs",
  "https://www.facebook.com/groups/jobsandgigslosangles",
  "https://www.facebook.com/groups/losangelespaidgigs",
  "https://www.facebook.com/groups/californiatowork",
  "https://www.facebook.com/groups/setflip",
];`;

code = code.replace(/const GROUPS = \[[\s\S]*?\];/, newGroups);
fs.writeFileSync('./fb_magnet_final.cjs', code);
console.log('Done');
