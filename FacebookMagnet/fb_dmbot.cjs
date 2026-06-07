require("dotenv").config();
const puppeteer = require("puppeteer");
const csv = require("csv-parser");
const fs = require("fs");

const SESSION_PATH = "./session.json";
const LEADS_PATH = "./fb_leads.csv";
const SENT_PATH = "./fb_sent.json";

// Safety limits
const MAX_DMS_PER_SESSION = 100;        // Hard daily cap
const MIN_DELAY_MS = 30000;            // 55 seconds minimum between DMs
const MAX_DELAY_MS = 60000;           // 2 minutes maximum
const PROFILE_LOAD_WAIT = 4000;        // Wait after loading profile
const POST_CLICK_WAIT = 4000;          // Wait after clicking message button
const SEARCH_WAIT = 4000;              // Wait after searching for user

const DM_MESSAGE = `hey! saw your post. i'm a python developer based in LA available immediately. i build websites, scrapers, bots, ai integrations, and automation pipelines. 48 hour delivery, flat fee.

recent work:
restaurant site: https://casa-fuego-demo.netlify.app
cleaning business: https://claudiascleaningla.com
church site: https://iphavp.org
lead scraper saas: https://mapzap.org

linkedin: https://www.linkedin.com/in/jesse-torres11/
github: https://github.com/jtorres-1

dm me a scope.`;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function loadSent() {
  if (!fs.existsSync(SENT_PATH)) return {};
  try { return JSON.parse(fs.readFileSync(SENT_PATH)); } catch { return {}; }
}

function saveSent(data) {
  fs.writeFileSync(SENT_PATH, JSON.stringify(data, null, 2));
}

function alreadySent(sent, author) {
  if (!author) return true; return !!sent[author.toLowerCase()];
}

function loadLeads() {
  return new Promise(resolve => {
    if (!fs.existsSync(LEADS_PATH)) return resolve([]);
    const rows = [];
    fs.createReadStream(LEADS_PATH)
      .pipe(csv())
      .on('data', row => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', () => resolve(rows));
  });
}

async function loadSession(page) {
  if (!fs.existsSync(SESSION_PATH)) throw new Error("No session. Run manual_login.cjs first.");
  const cookies = JSON.parse(fs.readFileSync(SESSION_PATH));
  await page.setCookie(...cookies);
  await page.goto("https://www.facebook.com", { waitUntil: "networkidle2" });
  if (page.url().includes("login")) throw new Error("Session expired. Run manual_login.cjs again.");
  console.log("Session loaded.");
}

async function getProfileFromSearch(page, name) {
  try {
    await page.goto(
      `https://www.facebook.com/search/people/?q=${encodeURIComponent(name)}`,
      { waitUntil: "networkidle2", timeout: 30000 }
    );
    await sleep(SEARCH_WAIT);

    return await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="facebook.com"]'));
      for (const a of links) {
        const href = a.href.split('&__cft__')[0].split('&__tn__')[0];
        if (
          (href.match(/facebook\.com\/[a-zA-Z0-9._]{3,}$/) ||
           href.match(/facebook\.com\/profile\.php\?id=/)) &&
          !href.includes('/groups/') &&
          !href.includes('/search/') &&
          !href.includes('/events/')
        ) {
          const name = a.innerText?.trim();
          if (name && name !== 'Facebook' && name.length > 1) return href;
        }
      }
      return null;
    });
  } catch {
    return null;
  }
}

async function sendDM(page, profile, name, keyword, score) {
  try {
    await page.goto(profile, { waitUntil: "networkidle2", timeout: 30000 });
    await sleep(PROFILE_LOAD_WAIT + rand(0, 2000));

    // Check for message button — skip cleanly if not found
    const msgBtn = await page.$('[aria-label="Message"]') ||
                   await page.$('[aria-label="Send message"]');

    if (!msgBtn) {
      console.log(`SKIP — no message button for ${name}`);
      return 'no_button';
    }

    await msgBtn.click();
    await sleep(POST_CLICK_WAIT + rand(0, 1500));

    // Find message input
    const msgBox = await page.$('div[role="textbox"]') ||
                   await page.$('[contenteditable="true"]');

    if (!msgBox) {
      console.log(`SKIP — no message box for ${name}`);
      return 'no_box';
    }

    await msgBox.click();
    await sleep(rand(800, 1500));

    // Type message humanly
    await page.keyboard.type(DM_MESSAGE, { delay: rand(18, 45) });
    await sleep(rand(800, 1500));
    await page.keyboard.press("Enter");
    await sleep(rand(1500, 3000));

    console.log(`SENT → ${name} | ${keyword} | score:${score}`);
    return 'sent';
  } catch (err) {
    console.log(`ERROR — DM failed for ${name}: ${err.message}`);
    return 'error';
  }
}

(async () => {
  const sent = loadSent();
  const leads = await loadLeads();

  if (!leads.length) {
    console.log("No leads. Run fb_scraper.cjs first.");
    process.exit(0);
  }

  // Filter out already contacted, sort by score desc
  const unsent = leads
    .filter(l => !alreadySent(sent, l.author))
    .sort((a, b) => parseInt(b.score || 0) - parseInt(a.score || 0));

  console.log(`${unsent.length} uncontacted leads. Starting DMs (max ${MAX_DMS_PER_SESSION} today)...`);

  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  await loadSession(page);

  let totalSent = 0;
  let totalSkipped = 0;

  for (const lead of unsent) {
    if (totalSent >= MAX_DMS_PER_SESSION) {
      console.log(`\nDaily limit of ${MAX_DMS_PER_SESSION} DMs reached. Stopping safely.`);
      break;
    }

    const key = lead.author.toLowerCase();

    // Double-check not already sent (in case file updated mid-run)
    if (alreadySent(sent, lead.author)) {
      console.log(`SKIP — already DMed ${lead.author}`);
      continue;
    }

    // Get profile URL
    let profileUrl = lead.profile && lead.profile.length > 10 ? lead.profile : null;
    if (!profileUrl) {
      console.log(`Searching for ${lead.author}...`);
      profileUrl = await getProfileFromSearch(page, lead.author);
      if (!profileUrl) {
        console.log(`SKIP — could not find profile for ${lead.author}`);
        totalSkipped++;
        continue;
      }
    }

    const result = await sendDM(page, profileUrl, lead.author, lead.keyword, lead.score);

    if (result === 'sent') {
      // Mark as sent immediately to prevent double send
      sent[key] = {
        name: lead.author,
        profile: profileUrl,
        keyword: lead.keyword,
        score: lead.score,
        sent_at: new Date().toISOString()
      };
      saveSent(sent);
      totalSent++;

      // Human delay between DMs
      const delay = rand(MIN_DELAY_MS, MAX_DELAY_MS);
      console.log(`Waiting ${Math.round(delay / 1000)}s before next DM... (${totalSent}/${MAX_DMS_PER_SESSION} sent)`);
      await sleep(delay);
    } else {
      // Still mark skipped profiles to avoid retrying no-button profiles
      if (result === 'no_button') {
        sent[key] = {
          name: lead.author,
          profile: profileUrl,
          skipped: true,
          reason: 'no_message_button',
          sent_at: new Date().toISOString()
        };
        saveSent(sent);
      }
      totalSkipped++;
      await sleep(rand(3000, 6000));
    }
  }

  console.log(`\nDone. ${totalSent} DMs sent. ${totalSkipped} skipped.`);
  await browser.close();
})();
