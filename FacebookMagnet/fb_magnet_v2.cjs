require("dotenv").config();
const puppeteer = require("puppeteer");
const { createObjectCsvWriter } = require("csv-writer");
const fs = require("fs");

const SESSION_PATH = "./session.json";
const SENT_PATH = "./sent_users.json";
const LOG_PATH = "./leads.csv";

const KEYWORDS = [
  "need a website", "need website", "looking for a website",
  "want a website", "build me a website", "website for my business",
  "need a developer", "looking for a developer", "hire a developer",
  "need more customers", "grow my business", "get more clients",
  "need online presence", "no website", "don't have a website",
  "website designer", "web developer", "affordable website",
  "cheap website", "small business website", "professional website",
  "need help with website", "update my website", "redesign my website",
  "digital presence", "online booking", "booking link", "get found online"
];

const DM_MESSAGE = `Hey! I saw your post and thought I could help. I build websites for small businesses in 48 hours starting at $500. Mobile friendly, contact form, booking link, services page.

Here's recent work:
Restaurant: https://casa-fuego-demo.netlify.app
Cleaning business: https://claudiascleaningla.com
Church: https://iphavp.org

DM me if interested!`;

const GROUPS = [
  "https://www.facebook.com/groups/ineedawebsiteformybusiness",
  "https://www.facebook.com/groups/webdesignanddevelopment",
  "https://www.facebook.com/groups/websitedevelopersanddesigners",
  "https://www.facebook.com/groups/smallbusinessowners",
  "https://www.facebook.com/groups/womenentrepreneurs",
  "https://www.facebook.com/groups/cleanersconnect",
  "https://www.facebook.com/groups/commercialcleaningsupportgroup",
  "https://www.facebook.com/groups/landscapingcompanyowners",
  "https://www.facebook.com/groups/lawncareandlandscapingbusiness",
  "https://www.facebook.com/groups/autorepairshopsusa",
  "https://www.facebook.com/groups/evangelistsandpastors",
  "https://www.facebook.com/groups/supportingpastors",
  "https://www.facebook.com/groups/barbershop",
  "https://www.facebook.com/groups/hairsalonnetworking",
  "https://www.facebook.com/groups/foodmarketingrestaurantowners",
  "https://www.facebook.com/groups/dfwtrustedcontractors",
  "https://www.facebook.com/groups/houstonresidentialandcommercialcontractors",
];

const sleep = ms => new Promise(r => setTimeout(r, ms));
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function loadSent() {
  if (!fs.existsSync(SENT_PATH)) return {};
  try { return JSON.parse(fs.readFileSync(SENT_PATH)); } catch { return {}; }
}
function saveSent(data) { fs.writeFileSync(SENT_PATH, JSON.stringify(data, null, 2)); }

const csvWriter = createObjectCsvWriter({
  path: LOG_PATH,
  header: [
    { id: "time", title: "Time" },
    { id: "name", title: "Name" },
    { id: "profile", title: "Profile" },
    { id: "keyword", title: "Keyword" },
    { id: "group", title: "Group" },
  ],
  append: true
});

async function loadSession(page) {
  if (!fs.existsSync(SESSION_PATH)) throw new Error("No session file. Run manual_login.cjs first.");
  const cookies = JSON.parse(fs.readFileSync(SESSION_PATH));
  await page.setCookie(...cookies);
  await page.goto("https://www.facebook.com", { waitUntil: "networkidle2" });
  if (page.url().includes("login")) throw new Error("Session expired. Run manual_login.cjs again.");
  console.log("Session loaded. Logged in.");
}

async function scanGroup(page, groupUrl) {
  console.log(`Scanning ${groupUrl}...`);
  const leads = [];
  try {
    await page.goto(groupUrl, { waitUntil: "networkidle2", timeout: 30000 });
    await sleep(rand(5000, 8000));

    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => window.scrollBy(0, 1200));
      await sleep(rand(2000, 3000));
    }

    const posts = await page.evaluate((keywords) => {
      const results = [];
      const bodyText = document.body.innerText;
      const lines = bodyText.split('\n').filter(l => l.trim().length > 20);
      
      // Find profile links that appear near keyword matches
      const allLinks = Array.from(document.querySelectorAll('a[href*="facebook.com"]'));
      
      allLinks.forEach(link => {
        const href = link.href;
        // Skip non-profile links
        if (href.includes('/groups/') || href.includes('/photo') || 
            href.includes('/posts/') || href.includes('/permalink') ||
            href.includes('?') || href.includes('/events/') ||
            href.includes('/videos/')) return;
        
        // Only user profiles
        if (!href.match(/facebook\.com\/[a-zA-Z0-9._]+$/) && 
            !href.match(/facebook\.com\/profile\.php/)) return;

        // Check surrounding text for keywords
        const parent = link.closest('[data-testid], div[class]') || link.parentElement?.parentElement;
        if (!parent) return;
        const text = parent.innerText?.toLowerCase() || '';
        const matched = keywords.find(k => text.includes(k));
        if (!matched) return;

        const name = link.innerText?.trim();
        if (!name || name.length < 2) return;

        results.push({ href, name, keyword: matched });
      });

      return results;
    }, KEYWORDS);

    console.log(`Found ${posts.length} leads in ${groupUrl}`);
    return posts;
  } catch (err) {
    console.log(`Error scanning ${groupUrl}: ${err.message}`);
    return leads;
  }
}

async function sendDM(page, profile, name, group, keyword) {
  try {
    await page.goto(profile, { waitUntil: "networkidle2", timeout: 30000 });
    await sleep(rand(3000, 5000));

    // Try message button
    const msgBtn = await page.$('[aria-label="Message"]') ||
                   await page.$('[aria-label="Send message"]') ||
                   await page.$('a[href*="/messages/"]');

    if (!msgBtn) {
      console.log(`No message button for ${name}`);
      return false;
    }

    await msgBtn.click();
    await sleep(rand(3000, 5000));

    // Type message
    const msgBox = await page.$('[aria-label="Message"]') ||
                   await page.$('div[role="textbox"]') ||
                   await page.$('[contenteditable="true"]');

    if (!msgBox) {
      console.log(`No message box for ${name}`);
      return false;
    }

    await msgBox.click();
    await sleep(1000);
    await page.keyboard.type(DM_MESSAGE, { delay: rand(20, 50) });
    await sleep(rand(1000, 2000));
    await page.keyboard.press("Enter");
    await sleep(rand(2000, 3000));

    console.log(`SENT DM to ${name} | ${keyword}`);
    await csvWriter.writeRecords([{
      time: new Date().toISOString(), name, profile, keyword, group
    }]);
    return true;
  } catch (err) {
    console.log(`DM failed for ${name}: ${err.message}`);
    return false;
  }
}

(async () => {
  const sent = loadSent();
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

  await loadSession(page);

  let totalSent = 0;

  for (const groupUrl of GROUPS) {
    if (totalSent >= 15) {
      console.log("Hit daily DM limit of 15. Stopping to avoid ban.");
      break;
    }

    const posts = await scanGroup(page, groupUrl);

    for (const post of posts) {
      if (totalSent >= 15) break;
      const key = post.href.toLowerCase();
      if (sent[key]) {
        console.log(`Already DMed ${post.name}`);
        continue;
      }

      const success = await sendDM(page, post.href, post.name, groupUrl, post.keyword);
      if (success) {
        sent[key] = { name: post.name, sent_at: new Date().toISOString() };
        saveSent(sent);
        totalSent++;
        const delay = rand(45000, 90000);
        console.log(`Waiting ${Math.round(delay/1000)}s before next DM...`);
        await sleep(delay);
      }
    }

    await sleep(rand(8000, 15000));
  }

  console.log(`Done. Total DMs sent: ${totalSent}`);
  await browser.close();
})();
