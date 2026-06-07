require("dotenv").config();
const puppeteer = require("puppeteer");
const { createObjectCsvWriter } = require("csv-writer");
const fs = require("fs");

const KEYWORDS = [
  "need a website", "need website", "looking for a website",
  "want a website", "build me a website", "website for my business",
  "need a developer", "looking for a developer", "hire a developer",
  "need more customers", "grow my business", "get more clients",
  "need online presence", "no website", "don't have a website",
  "website designer", "web developer", "affordable website",
  "cheap website", "small business website", "professional website",
  "need help with website", "update my website", "redesign my website"
];

const DM_MESSAGE = `Hey! I saw your post and thought I could help. I build websites for small businesses in 48 hours starting at $500. Mobile friendly, contact form, booking link, services page. Here's recent work:\n\nhttps://casa-fuego-demo.netlify.app (restaurant)\nhttps://claudiascleaningla.com (cleaning business)\nhttps://iphavp.org (church)\n\nDM me if interested!`;

const GROUPS = [
  // Direct buyer groups
  "https://www.facebook.com/groups/ineedawebsite",
  "https://www.facebook.com/groups/ineedawebsiteformybusiness",
  "https://www.facebook.com/groups/webdesignanddevelopment",
  "https://www.facebook.com/groups/websitedevelopersanddesigners",
  "https://www.facebook.com/groups/wordpressjobsandprojects",
  "https://www.facebook.com/groups/freelanceprogramming",
  "https://www.facebook.com/groups/codingjobs",

  // Small business owners
  "https://www.facebook.com/groups/smallbusinessowners",
  "https://www.facebook.com/groups/womenentrepreneurs",
  "https://www.facebook.com/groups/promoteyourbusiness",

  // Cleaning
  "https://www.facebook.com/groups/cleanersconnect",
  "https://www.facebook.com/groups/commercialcleaningsupportgroup",
  "https://www.facebook.com/groups/janitorialfacilityservicesgroup",
  "https://www.facebook.com/groups/commercialcleaninggroup",

  // Landscaping
  "https://www.facebook.com/groups/landscapingcompanyowners",
  "https://www.facebook.com/groups/lawncareandlandscapingbusiness",
  "https://www.facebook.com/groups/landscapemaintenancecompanyowners",
  "https://www.facebook.com/groups/treeservicelandscapebusinessowners",

  // Contractors and plumbers
  "https://www.facebook.com/groups/californiaplumbingcontractors",
  "https://www.facebook.com/groups/hvacandplumbingcalifornia",
  "https://www.facebook.com/groups/dfwtrustedcontractors",
  "https://www.facebook.com/groups/houstonresidentialandcommercialcontractors",
  "https://www.facebook.com/groups/contractorsandsubcontractorhoustontx",
  "https://www.facebook.com/groups/autorepairshopsusa",
  "https://www.facebook.com/groups/autobodyshoprepairowners",

  // Churches
  "https://www.facebook.com/groups/evangelistsandpastors",
  "https://www.facebook.com/groups/helpinghandsformissionariesandpastors",
  "https://www.facebook.com/groups/supportingpastors",
  "https://www.facebook.com/groups/smallchurchpastorsandministryleaders",
  "https://www.facebook.com/groups/pastorsandpreachers",

  // Barbershops
  "https://www.facebook.com/groups/barbershop",
  "https://www.facebook.com/groups/barberscorner",
  "https://www.facebook.com/groups/barbersworldafrica",

  // Hair and beauty
  "https://www.facebook.com/groups/hairsalonnetworking",
  "https://www.facebook.com/groups/spaowners",

  // Restaurants
  "https://www.facebook.com/groups/foodmarketingrestaurantowners",
  "https://www.facebook.com/groups/pizzarestaurantowners",
  "https://www.facebook.com/groups/losangelescountyrestaurants",

  // Real estate and mortgage
  "https://www.facebook.com/groups/realestatemarketingpros",
  "https://www.facebook.com/groups/realtorsofamerica",

  // Gyms and fitness
  "https://www.facebook.com/groups/gymowners",
  "https://www.facebook.com/groups/fitnessbusinessowners",

  // Photography
  "https://www.facebook.com/groups/photographybusiness",
  "https://www.facebook.com/groups/photographersnetwork",

  // Insurance and finance
  "https://www.facebook.com/groups/insuranceagents",
  "https://www.facebook.com/groups/financialadvisorsnetwork",
];

const sentPath = "./sent_users.json";
const logPath = "./leads.csv";

function loadSent() {
  if (!fs.existsSync(sentPath)) return {};
  try { return JSON.parse(fs.readFileSync(sentPath)); } catch { return {}; }
}
function saveSent(data) { fs.writeFileSync(sentPath, JSON.stringify(data, null, 2)); }

const csvWriter = createObjectCsvWriter({
  path: logPath,
  header: [
    { id: "time", title: "Time" },
    { id: "name", title: "Name" },
    { id: "profile", title: "Profile" },
    { id: "keyword", title: "Keyword" },
    { id: "group", title: "Group" },
  ],
  append: true
});

const sleep = ms => new Promise(r => setTimeout(r, ms));
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function login(page) {
  console.log("Logging into Facebook...");
  await page.goto("https://www.facebook.com/login", { waitUntil: "networkidle2" });
  await page.type('input[name="email"]', process.env.FB_EMAIL, { delay: rand(80, 150) });
  await page.type('input[name="pass"]', process.env.FB_PASSWORD, { delay: rand(80, 150) });
  await page.waitForSelector('[aria-label="Log In"]', { visible: true });
  await page.click('[aria-label="Log In"]');
  await page.waitForNavigation({ waitUntil: "networkidle2" });
  console.log("Logged in.");
  await sleep(rand(3000, 5000));
}

async function scanGroup(page, groupUrl, sent) {
  console.log(`Scanning ${groupUrl}...`);
  try {
    await page.goto(groupUrl, { waitUntil: "networkidle2", timeout: 30000 });
    await sleep(rand(3000, 5000));

    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, 1200));
      await sleep(rand(2000, 3000));
    }

    const posts = await page.evaluate((keywords) => {
      const results = [];
      const articles = document.querySelectorAll('[role="article"]');
      articles.forEach(article => {
        const text = article.innerText.toLowerCase();
        const matched = keywords.find(k => text.includes(k));
        if (!matched) return;
        const links = article.querySelectorAll('a[href*="facebook.com/"]');
        links.forEach(link => {
          const href = link.href;
          if (href.includes("/groups/") || href.includes("/posts/") || href.includes("/permalink/")) return;
          if (!href.includes("facebook.com")) return;
          results.push({
            keyword: matched,
            profile: href,
            name: link.innerText.trim() || "Unknown"
          });
        });
      });
      return results;
    }, KEYWORDS);

    console.log(`Found ${posts.length} matching posts in ${groupUrl}`);
    return posts;
  } catch (err) {
    console.log(`Error scanning ${groupUrl}: ${err.message}`);
    return [];
  }
}

async function sendDM(page, profile, name, group, keyword) {
  try {
    await page.goto(profile, { waitUntil: "networkidle2", timeout: 30000 });
    await sleep(rand(2000, 4000));

    const msgBtn = await page.$('[aria-label="Message"]');
    if (!msgBtn) {
      console.log(`No message button for ${name}`);
      return false;
    }
    await msgBtn.click();
    await sleep(rand(2000, 3000));

    await page.keyboard.type(DM_MESSAGE, { delay: rand(30, 60) });
    await sleep(rand(1000, 2000));
    await page.keyboard.press("Enter");
    await sleep(rand(2000, 3000));

    console.log(`SENT DM to ${name}`);
    await csvWriter.writeRecords([{
      time: new Date().toISOString(),
      name,
      profile,
      keyword,
      group
    }]);
    return true;
  } catch (err) {
    console.log(`DM failed for ${name}: ${err.message}`);
    return false;
  }
}

(async () => {
  const sent = loadSent();
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: null
  });

  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

  await login(page);

  let totalSent = 0;

  for (const groupUrl of GROUPS) {
    if (totalSent >= 20) {
      console.log("Hit daily DM limit of 20. Stopping to avoid ban.");
      break;
    }

    const posts = await scanGroup(page, groupUrl, sent);

    for (const post of posts) {
      if (totalSent >= 20) break;
      const key = post.profile.toLowerCase();
      if (sent[key]) {
        console.log(`Already DMed ${post.name}`);
        continue;
      }

      const success = await sendDM(page, post.profile, post.name, groupUrl, post.keyword);
      if (success) {
        sent[key] = { name: post.name, sent_at: new Date().toISOString() };
        saveSent(sent);
        totalSent++;
        await sleep(rand(30000, 60000));
      }
    }

    await sleep(rand(5000, 10000));
  }

  console.log(`Done. Total DMs sent: ${totalSent}`);
  await browser.close();
})();
