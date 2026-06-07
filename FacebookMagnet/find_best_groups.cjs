require("dotenv").config();
const puppeteer = require("puppeteer");
const fs = require("fs");

const SESSION_PATH = "./session.json";

const SEARCHES = [
  "hire web developer",
  "need website developer",
  "freelance developer for hire",
  "web design for hire",
  "hire python developer",
  "need app built",
  "looking for programmer",
  "software developer for hire",
  "need automation developer",
  "small business website help",
  "entrepreneur need website",
  "startup need developer",
  "need website for my business",
  "wordpress developer for hire",
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

  const cookies = JSON.parse(fs.readFileSync(SESSION_PATH));
  await page.setCookie(...cookies);

  const allGroups = {};

  for (const query of SEARCHES) {
    console.log(`Searching: ${query}`);
    await page.goto(`https://www.facebook.com/search/groups/?q=${encodeURIComponent(query)}`, { waitUntil: "networkidle2", timeout: 30000 });
    await sleep(4000);

    for (let i = 0; i < 8; i++) {
      await page.evaluate(() => window.scrollBy(0, 1200));
      await sleep(1500);
    }

    const groups = await page.evaluate(() => {
      const results = [];
      const seen = new Set();
      const links = Array.from(document.querySelectorAll('a[href*="/groups/"]'));
      links.forEach(a => {
        const href = a.href.split('?')[0].replace(/\/$/, '');
        if (!href.match(/facebook\.com\/groups\/[a-zA-Z0-9._]+$/)) return;
        if (href.includes('/groups/feed') || href.includes('/groups/discover') || href.includes('/groups/join') || href.includes('/groups/search')) return;
        if (seen.has(href)) return;
        seen.add(href);
        // Get member count and activity from surrounding text
        const parent = a.closest('[role="listitem"]') || a.parentElement?.parentElement;
        const text = parent?.innerText || '';
        const memberMatch = text.match(/(\d+[\.,]?\d*)\s*(K|M)?\s*members/i);
        const members = memberMatch ? memberMatch[0] : 'unknown';
        const name = a.innerText?.trim();
        if (!name || name.length < 3 || name === 'Join') return;
        results.push({ href, name, members });
      });
      return results;
    });

    groups.forEach(g => {
      if (!allGroups[g.href]) allGroups[g.href] = g;
    });

    console.log(`Found ${groups.length} groups. Total unique: ${Object.keys(allGroups).length}`);
    await sleep(2000);
  }

  const result = Object.values(allGroups);
  fs.writeFileSync('./found_groups.json', JSON.stringify(result, null, 2));
  console.log(`\nTotal: ${result.length} groups saved to found_groups.json`);
  result.forEach(g => console.log(`${g.members} — ${g.name} — ${g.href}`));
  await browser.close();
})();
