require("dotenv").config();
const { createObjectCsvWriter } = require("csv-writer");
const puppeteer = require("puppeteer");
const fs = require("fs");

const SESSION_PATH = "./session.json";
const LEADS_PATH = "./fb_leads.csv";
const SENT_PATH = "./fb_sent.json";

// High intent search queries — each one searches Facebook posts globally
const SEARCH_QUERIES = [
  "need a website developer",
  "looking for a web developer",
  "hire a web developer",
  "need a website built",
  "need a developer",
  "looking for a developer",
  "hire a developer",
  "need a programmer",
  "looking for a programmer",
  "need a freelance developer",
  "hire a freelance developer",
  "need an app built",
  "need a mobile app developer",
  "need a python developer",
  "need automation built",
  "need a bot built",
  "need a scraper built",
  "need a chatbot built",
  "need ai integration",
  "need a shopify developer",
  "need a wordpress developer",
  "need a react developer",
  "need a full stack developer",
  "need a landing page built",
  "need someone to build my website",
  "looking for someone to build",
  "need a tech person",
  "need coding help",
  "need api integration",
  "will pay for developer",
  "paying for website",
  "budget for developer",
  "urgent need developer",
  "asap need developer",
];

const SELLER_SIGNALS = [
  "i offer", "i build", "i provide", "my services", "check out my",
  "i am a developer", "i am a web", "i specialize", "hire me",
  "my portfolio", "i can build", "i develop", "i design",
  "years of experience", "dm me for", "contact me for",
  "i am available", "i am offering", "my rates",
  "i am an expert", "message me for", "whatsapp me", "i do freelance",
];

const sleep = ms => new Promise(r => setTimeout(r, ms));
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const csvWriter = createObjectCsvWriter({
  path: LEADS_PATH,
  header: [
    { id: "time", title: "Time" },
    { id: "author", title: "Author" },
    { id: "profile", title: "Profile" },
    { id: "keyword", title: "Keyword" },
    { id: "score", title: "Score" },
    { id: "dmed", title: "DMed" },
  ],
  append: fs.existsSync(LEADS_PATH)
});

function loadSent() {
  if (!fs.existsSync(SENT_PATH)) return {};
  try { return JSON.parse(fs.readFileSync(SENT_PATH)); } catch { return {}; }
}

async function loadSession(page) {
  if (!fs.existsSync(SESSION_PATH)) throw new Error("No session. Run manual_login.cjs first.");
  const cookies = JSON.parse(fs.readFileSync(SESSION_PATH));
  await page.setCookie(...cookies);
  await page.goto("https://www.facebook.com", { waitUntil: "networkidle2" });
  if (page.url().includes("login")) throw new Error("Session expired. Run manual_login.cjs again.");
  console.log("Session loaded.");
}

async function searchPosts(page, query) {
  console.log(`\nSearching: "${query}"`);
  const leads = {};

  try {
    // Search posts, filter by recent (past week)
    const url = `https://www.facebook.com/search/posts/?q=${encodeURIComponent(query)}&filters=eyJyZWNlbnRseVNlZW4iOiJ7XCJuYW1lXCI6XCJjcmVhdGlvbl90aW1lXCIsXCJhcmdzXCI6XCIwXCJ9In0%3D`;
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    await sleep(rand(4000, 6000));

    let emptyScrolls = 0;

    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => window.scrollBy(0, 1200));
      await sleep(rand(2000, 3000));

      const found = await page.evaluate((query, sellerSignals) => {
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

          // Skip sellers
          const isSeller = sellerSignals.some(s => text.includes(s));
          if (isSeller) return;

          // Score the lead
          let score = 3; // base score — already matched the search query
          if (text.includes("budget")) score += 5;
          if (text.includes("will pay")) score += 5;
          if (text.includes("paying")) score += 4;
          if (text.includes("urgent") || text.includes("asap")) score += 4;
          if (text.includes("how much")) score += 3;
          if (text.includes("quote") || text.includes("price")) score += 3;
          if (text.includes("this week") || text.includes("today")) score += 3;
          if (text.includes("immediately")) score += 3;
          if (text.includes("hire")) score += 2;
          if (text.includes("project")) score += 2;
          if (text.includes("paid") || text.includes("payment")) score += 2;

          // Get profile
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
            results[authorName] = { author: authorName, profile: profileHref, keyword: query, score };
          }
        });

        return results;
      }, query, SELLER_SIGNALS);

      const count = Object.keys(found).length;
      Object.assign(leads, found);

      if (count === 0) {
        emptyScrolls++;
        if (emptyScrolls >= 3) {
          console.log(`No results after ${i+1} scrolls. Moving on.`);
          break;
        }
      } else {
        emptyScrolls = 0;
      }
    }

    const sorted = Object.values(leads).sort((a, b) => b.score - a.score);
    console.log(`Found ${sorted.length} leads for "${query}"`);
    return sorted;
  } catch (err) {
    console.log(`Error searching "${query}": ${err.message}`);
    return [];
  }
}

(async () => {
  const sent = loadSent();
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

  await loadSession(page);

  let totalLeads = 0;
  const allLeads = {};

  for (const query of SEARCH_QUERIES) {
    const leads = await searchPosts(page, query);

    for (const lead of leads) {
      const key = lead.author.toLowerCase();
      if (sent[key]) continue;
      if (allLeads[key]) continue;
      allLeads[key] = lead;
      totalLeads++;
    }

    await sleep(rand(3000, 5000));
  }

  // Sort all leads by score and save
  const sorted = Object.values(allLeads).sort((a, b) => b.score - a.score);

  if (sorted.length > 0) {
    await csvWriter.writeRecords(sorted.map(l => ({
      time: new Date().toISOString(),
      author: l.author,
      profile: l.profile || '',
      keyword: l.keyword,
      score: l.score,
      dmed: 'false'
    })));
  }

  console.log(`\nScrape complete. ${totalLeads} new leads saved to fb_leads.csv`);
  await browser.close();
})();
