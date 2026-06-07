require("dotenv").config();
const puppeteer = require("puppeteer");
const { createObjectCsvWriter } = require("csv-writer");
const fs = require("fs");

const SESSION_PATH = "./session.json";
const SENT_PATH = "./sent_users.json";
const LOG_PATH = "./leads.csv";

// ONLY high intent — person is actively looking
const KEYWORDS = [
  "need a website",
  "need website",
  "looking for a website",
  "want a website",
  "build me a website",
  "website for my business",
  "need a web developer",
  "looking for a web developer",
  "looking for a developer",
  "hire a developer",
  "need a designer",
  "looking for someone to build",
  "can someone build",
  "who can build",
  "who builds websites",
  "need someone to make",
  "need help building",
  "need a site",
  "need landing page",
  "need a landing page",
  "how much does a website cost",
  "how much for a website",
  "affordable web",
  "cheap web design",
  "budget website",
  "anyone build websites",
  "recommend a web designer",
  "recommend a developer",
  "looking for web design",
  "need web design"
];

const DM_MESSAGE = `Hey! I saw your post — I build websites for small businesses in 48 hours starting at $500. Mobile friendly, contact form, booking link, services page.

Recent work:
Restaurant: https://casa-fuego-demo.netlify.app
Cleaning business: https://claudiascleaningla.com
Church: https://iphavp.org

DM me if you want to talk scope.`;

const GROUPS = [
  "https://www.facebook.com/groups/ineedawebsiteformybusiness",
  "https://www.facebook.com/groups/webdesignanddevelopment",
  "https://www.facebook.com/groups/websitedevelopersanddesigners",
  "https://www.facebook.com/groups/wordpressjobsandprojects",
  "https://www.facebook.com/groups/smallbusinessowners",
  "https://www.facebook.com/groups/womenentrepreneurs",
  "https://www.facebook.com/groups/promoteyourbusiness",
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

// Recency signals — post must contain one of these time markers
const RECENCY_SIGNALS = [
  "just now", "minute ago", "minutes ago", "hour ago", "hours ago",
  "1h", "2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h",
  "yesterday", "1d", "2d", "3d"
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
  if (!fs.existsSync(SESSION_PATH)) throw new Error("No session. Run manual_login.cjs first.");
  const cookies = JSON.parse(fs.readFileSync(SESSION_PATH));
  await page.setCookie(...cookies);
  await page.goto("https://www.facebook.com", { waitUntil: "networkidle2" });
  if (page.url().includes("login")) throw new Error("Session expired. Run manual_login.cjs again.");
  console.log("Session loaded.");
}

async function scanGroup(page, groupUrl) {
  console.log(`Scanning ${groupUrl}...`);
  try {
    await page.goto(groupUrl, { waitUntil: "networkidle2", timeout: 30000 });
    await sleep(rand(5000, 8000));

    for (let i = 0; i < 8; i++) {
      await page.evaluate(() => window.scrollBy(0, 1200));
      await sleep(rand(2000, 3000));
    }

    const leads = await page.evaluate((keywords, recencySignals) => {
      const results = [];
      const seen = new Set();

      // Get all links that look like user profiles
      const allLinks = Array.from(document.querySelectorAll('a[href*="facebook.com"]'));

      allLinks.forEach(link => {
        const href = link.href.split('?')[0];

        // Must be a user profile
        if (!href.match(/facebook\.com\/[a-zA-Z0-9._]{3,}$/) &&
            !href.match(/facebook\.com\/profile\.php/)) return;

        // Skip groups, pages sections, events
        if (href.includes('/groups/') || href.includes('/events/') ||
            href.includes('/pages/') || href.includes('/photo') ||
            href.includes('/videos/') || href.includes('/posts/')) return;

        if (seen.has(href)) return;

        // Walk up to find the post container
        let container = link;
        for (let i = 0; i < 8; i++) {
          container = container.parentElement;
          if (!container) break;
        }
        if (!container) return;

        const text = container.innerText?.toLowerCase() || '';
        if (text.length < 30) return;

        // Must match a high intent keyword
        const matched = keywords.find(k => text.includes(k));
        if (!matched) return;

        // Must be recent
        const isRecent = recencySignals.some(s => text.includes(s));
        if (!isRecent) return;

        const name = link.innerText?.trim();
        if (!name || name.length < 2 || name === 'Facebook') return;

        seen.add(href);
        results.push({ href, name, keyword: matched });
      });

      return results;
    }, KEYWORDS, RECENCY_SIGNALS);

    console.log(`Found ${leads.length} high intent recent leads in ${groupUrl}`);
    return leads;
  } catch (err) {
    console.log(`Error scanning ${groupUrl}: ${err.message}`);
    return [];
  }
}

async function sendDM(page, profile, name, group, keyword) {
  try {
    await page.goto(profile, { waitUntil: "networkidle2", timeout: 30000 });
    await sleep(rand(3000, 5000));

    const msgBtn = await page.$('[aria-label="Message"]') ||
                   await page.$('[aria-label="Send message"]');

    if (!msgBtn) {
      console.log(`No message button for ${name}`);
      return false;
    }

    await msgBtn.click();
    await sleep(rand(3000, 5000));

    const msgBox = await page.$('div[role="textbox"]') ||
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

    console.log(`SENT to ${name} | ${keyword}`);
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
      console.log("Hit daily limit of 15 DMs. Stopping.");
      break;
    }

    const leads = await scanGroup(page, groupUrl);

    for (const lead of leads) {
      if (totalSent >= 15) break;
      const key = lead.href.toLowerCase();
      if (sent[key]) {
        console.log(`Already DMed ${lead.name}`);
        continue;
      }

      const success = await sendDM(page, lead.href, lead.name, groupUrl, lead.keyword);
      if (success) {
        sent[key] = { name: lead.name, sent_at: new Date().toISOString() };
        saveSent(sent);
        totalSent++;
        const delay = rand(45000, 90000);
        console.log(`Waiting ${Math.round(delay/1000)}s...`);
        await sleep(delay);
      }
    }

    await sleep(rand(8000, 15000));
  }

  console.log(`Done. Total DMs sent: ${totalSent}`);
  await browser.close();
})();
