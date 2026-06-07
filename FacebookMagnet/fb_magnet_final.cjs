require("dotenv").config();
const puppeteer = require("puppeteer");
const { createObjectCsvWriter } = require("csv-writer");
const fs = require("fs");

const SESSION_PATH = "./session.json";
const SENT_PATH = "./sent_users.json";
const LOG_PATH = "./leads.csv";

const KEYWORDS = [
  // Website — explicit buyer intent
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
  "need a wordpress developer", "need a shopify developer",

  // Developer/programmer — explicit hire intent
  "need a developer", "looking for a developer", "hire a developer",
  "need a programmer", "looking for a programmer", "hire a programmer",
  "need a coder", "looking for a coder", "need someone to code",
  "need a software developer", "looking for software developer",
  "need a full stack developer", "need a backend developer",
  "need a frontend developer", "need a python developer",
  "need a react developer", "need a node developer",
  "need a javascript developer", "need a php developer",

  // Freelancer — hire intent
  "looking for a freelancer", "need a freelancer", "hire a freelancer",
  "looking to hire a developer", "need to hire a developer",
  "need contract developer", "need freelance developer",
  "looking for freelance developer",

  // App
  "need an app built", "need a mobile app", "build me an app",
  "need an ios app", "need an android app", "need a web app",
  "need app developer", "looking for app developer",

  // Automation and bots
  "need automation built", "need a bot built", "need a scraper built",
  "need web scraping", "need a python script", "need api integration",
  "need a chatbot built", "need ai integration", "need ai tool built",
  "need workflow automation",

  // Budget signals — highest intent
  "have a budget", "budget is", "willing to pay", "will pay",
  "paying well", "good pay", "competitive pay", "urgent project",
  "need asap", "need this week", "need immediately",
];

const RECENCY = [
  "just now", "1 min", "2 min", "3 min", "4 min", "5 min",
  "6 min", "7 min", "8 min", "9 min", "10 min",
  "minutes ago", "1 hour", "2 hour", "3 hour", "4 hour",
  "5 hour", "6 hour", "7 hour", "8 hour", "9 hour", "10 hour",
  "11 hour", "12 hour", "hours ago",
  "1h", "2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "10h", "11h", "12h",
  "yesterday", "1d", "2d", "3d"
];

const SELLER_SIGNALS = [
  "i offer", "i build", "i provide", "my services", "check out my",
  "i am a developer", "i am a web", "i specialize", "hire me",
  "my portfolio", "i can build", "i develop", "i design",
  "years of experience", "dm me for", "contact me for",
  "i am available", "i am offering", "my work", "my rates",
  "i am an expert", "i have experience", "get in touch with me",
  "message me for", "whatsapp me", "i do freelance"
];

const DM_MESSAGE = `hey! saw your post. i'm a python developer based in LA available immediately. i build websites, scrapers, bots, ai integrations, and automation pipelines. 48 hour delivery, flat fee.

recent work:
restaurant site: https://casa-fuego-demo.netlify.app
cleaning business: https://claudiascleaningla.com
church site: https://iphavp.org
lead scraper saas: https://mapzap.org

linkedin: https://www.linkedin.com/in/jesse-torres11/
github: https://github.com/jtorres-1

dm me a scope.`;

// TIER 1 — Pure hire boards, 20+ posts/day, buyers with money
// TIER 2 — Active entrepreneur groups, dev requests common
// TIER 3 — Local high money buyers
const GROUPS = [
  // TIER 1 — Pure hire/freelance boards
  "https://www.facebook.com/groups/fixwebsoft",              // WordPress Jobs 99K 60+/day
  "https://www.facebook.com/groups/phpcoder",                // Web Developer Community 114K
  "https://www.facebook.com/groups/463665109636647",         // Frontend Dev Jobs 41K 20+/day
  "https://www.facebook.com/groups/1813624732925093",        // Web Developer Freelancers 23K 50+/day
  "https://www.facebook.com/groups/Nehasedostikaroge",       // Website Developers & Designers 35K 40+/day
  "https://www.facebook.com/groups/243803078426794",         // Mobile App Dev 10K 80/day
  "https://www.facebook.com/groups/web.application.dev",     // Web App Dev 22K 20+/day
  "https://www.facebook.com/groups/717415651680045",         // Freelancers IT Projects 12K
  "https://www.facebook.com/groups/1954217561488895",        // Freelance Web Design 12K
  "https://www.facebook.com/groups/wordpressai",             // WordPress AI Dev 22K 70+/day
  "https://www.facebook.com/groups/306545512812361",         // Freelance Web Devs/Employers
  "https://www.facebook.com/groups/onlinefreelancergroup",   // Web Design and Dev 10K
  "https://www.facebook.com/groups/needwebsitedesignerordeveloper",
  "https://www.facebook.com/groups/wpwebsitexpress",
  "https://www.facebook.com/groups/modern.web.design.development",
  "https://www.facebook.com/groups/webdeveloperinusa",
  "https://www.facebook.com/groups/IT.Software.Engineer.Jobs",
  "https://www.facebook.com/groups/setflip",
  "https://www.facebook.com/groups/1376252454149889",        // Freelancer WordPress Dev
  "https://www.facebook.com/groups/919732611373456",         // Freelance Web Design Dev
  "https://www.facebook.com/groups/654046659934482",         // Webflow Designers & Devs
  "https://www.facebook.com/groups/1562283074220912",        // Freelance Web Designer Philippines
  "https://www.facebook.com/groups/fullstackdevelopersgroup",
  "https://www.facebook.com/groups/webdevelopersglobal",
  "https://www.facebook.com/groups/1360340388701123",        // Programming and Web Dev
  "https://www.facebook.com/groups/257230967082904",         // Full Stack Developer
  "https://www.facebook.com/groups/1183160386911574",        // Web Developer

  // TIER 2 — Entrepreneur/startup/agency buyers
  "https://www.facebook.com/groups/aiautomationagency.aaa",
  "https://www.facebook.com/groups/gohighlevelagencyowners",
  "https://www.facebook.com/groups/gohighlevel1",
  "https://www.facebook.com/groups/highlevelagencyowner",
  "https://www.facebook.com/groups/system.automation.ai.agents.n8n.zapier.ifttt",
  "https://www.facebook.com/groups/aichatbotsaivoice",
  "https://www.facebook.com/groups/agenticly",
  "https://www.facebook.com/groups/aibusinesstools",
  "https://www.facebook.com/groups/startups.investors.entrepreneurs.mentors.founders",
  "https://www.facebook.com/groups/smallbusinessownerandentrepreneurs",
  "https://www.facebook.com/groups/757441813621424",
  "https://www.facebook.com/groups/usasmallbusinesscommunity",

  // TIER 3 — Local LA/SoCal high money buyers
  "https://www.facebook.com/groups/jobsandgigslosangles",
  "https://www.facebook.com/groups/losangelespaidgigs",
  "https://www.facebook.com/groups/californiatowork",
  "https://www.facebook.com/groups/LongBeachSBG",
  "https://www.facebook.com/groups/socalbusiness",
  "https://www.facebook.com/groups/losangelesentrepreneursstartups",
  "https://www.facebook.com/groups/CaliforniaBusinessOwners",
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
    { id: "score", title: "Score" },
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

    const leads = {};

    for (let i = 0; i < 15; i++) {
      await page.evaluate(() => window.scrollBy(0, 800));
      await sleep(rand(2000, 3000));

      const found = await page.evaluate((keywords, recency, sellerSignals) => {
        const results = {};
        const actionBtns = Array.from(document.querySelectorAll('[aria-label^="Actions for this post by"]'));

        actionBtns.forEach(btn => {
          const authorName = btn.getAttribute('aria-label').replace('Actions for this post by ', '').trim();
          if (!authorName || authorName.length < 2) return;

          let container = btn;
          for (let i = 0; i < 15; i++) {
            container = container.parentElement;
            if (!container) break;
            if (container.innerText?.length > 200) break;
          }
          if (!container) return;

          const text = (container.innerText || '').toLowerCase();

          // Must match keyword
          const matchedKeyword = keywords.find(k => text.includes(k));
          if (!matchedKeyword) return;

          // Must be recent
          const isRecent = recency.some(r => text.includes(r));
          if (!isRecent) return;

          // Skip sellers
          const isSeller = sellerSignals.some(s => text.includes(s));
          if (isSeller) return;

          // Score the lead
          let score = 1;
          if (text.includes("budget")) score += 5;
          if (text.includes("will pay")) score += 5;
          if (text.includes("paying")) score += 4;
          if (text.includes("urgent") || text.includes("asap")) score += 4;
          if (text.includes("how much")) score += 3;
          if (text.includes("quote") || text.includes("price")) score += 3;
          if (text.includes("this week") || text.includes("today")) score += 3;
          if (text.includes("immediately") || text.includes("right away")) score += 3;
          if (text.includes("hire")) score += 2;
          if (text.includes("project")) score += 2;
          if (text.includes("paid") || text.includes("payment")) score += 2;

          // Get profile link
          const anchors = Array.from(container.querySelectorAll('a[href*="facebook.com"]'));
          const profileAnchor = anchors.find(a => {
            const href = a.href.split('?')[0];
            return (href.match(/facebook\.com\/[a-zA-Z0-9._]{3,}$/) ||
                    href.match(/facebook\.com\/profile\.php\?id=/)) &&
                   !href.includes('/groups/') &&
                   !href.includes('/events/') &&
                   !href.includes('/photo') &&
                   !href.includes('/posts/');
          });

          const profileHref = profileAnchor ?
            profileAnchor.href.split('&__cft__')[0].split('&__tn__')[0] : null;

          if (!results[authorName] || score > results[authorName].score) {
            results[authorName] = {
              author: authorName,
              profile: profileHref,
              keyword: matchedKeyword,
              score
            };
          }
        });

        return results;
      }, KEYWORDS, RECENCY, SELLER_SIGNALS);

      Object.assign(leads, found);
    }

    const sorted = Object.values(leads).sort((a, b) => b.score - a.score);
    console.log(`Found ${sorted.length} leads in ${groupUrl} (top score: ${sorted[0]?.score || 0})`);
    return sorted;
  } catch (err) {
    console.log(`Error scanning ${groupUrl}: ${err.message}`);
    return [];
  }
}

async function getProfileFromSearch(page, name) {
  try {
    const searchUrl = `https://www.facebook.com/search/people/?q=${encodeURIComponent(name)}`;
    await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });
    await sleep(rand(3000, 5000));

    const profile = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="facebook.com"]'));
      for (const a of links) {
        const href = a.href.split('&__cft__')[0].split('&__tn__')[0];
        if ((href.match(/facebook\.com\/[a-zA-Z0-9._]{3,}$/) ||
             href.match(/facebook\.com\/profile\.php\?id=/)) &&
            !href.includes('/groups/') &&
            !href.includes('/search/') &&
            !href.includes('/events/')) {
          const name = a.innerText?.trim();
          if (name && name !== 'Facebook' && name.length > 1) return href;
        }
      }
      return null;
    });

    return profile;
  } catch (err) {
    console.log(`Search failed for ${name}: ${err.message}`);
    return null;
  }
}

async function sendDM(page, profile, name, group, keyword, score) {
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

    console.log(`SENT to ${name} | ${keyword} | score:${score}`);
    await csvWriter.writeRecords([{
      time: new Date().toISOString(), name, profile, keyword, group, score
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

      const key = lead.author.toLowerCase();
      if (sent[key]) {
        console.log(`Already DMed ${lead.author}`);
        continue;
      }

      let profileUrl = lead.profile;
      if (!profileUrl) {
        console.log(`Searching for ${lead.author}...`);
        profileUrl = await getProfileFromSearch(page, lead.author);
        await sleep(rand(3000, 5000));
      }

      if (!profileUrl) {
        console.log(`Could not find profile for ${lead.author}`);
        continue;
      }

      const success = await sendDM(page, profileUrl, lead.author, groupUrl, lead.keyword, lead.score);
      if (success) {
        sent[key] = { name: lead.author, profile: profileUrl, sent_at: new Date().toISOString() };
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
