require("dotenv").config();
const puppeteer = require("puppeteer");
const fs = require("fs");

const SESSION_PATH = "./session.json";

const SEARCHES = [
  "need a website developer",
  "hire a web developer",
  "looking for freelance developer",
  "need website built",
  "hire a programmer",
  "web developer for hire",
  "need a developer",
  "freelance web design",
  "website designer needed",
  "need app developer",
  "hire python developer",
  "need automation developer",
  "looking for coder",
  "need a software developer",
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
    const url = `https://www.facebook.com/search/groups/?q=${encodeURIComponent(query)}`;
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    await sleep(4000);

    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 1200));
      await sleep(2000);
    }

    const groups = await page.evaluate(() => {
      const results = [];
      const seen = new Set();
      const links = Array.from(document.querySelectorAll('a[href*="/groups/"]'));
      links.forEach(a => {
        const href = a.href.split('?')[0];
        if (!href.match(/facebook\.com\/groups\/[a-zA-Z0-9._]+\/?$/)) return;
        if (href.includes('/groups/feed') || href.includes('/groups/discover') || href.includes('/groups/join')) return;
        if (seen.has(href)) return;
        seen.add(href);
        const name = a.innerText?.trim();
        if (!name || name.length < 3) return;
        results.push({ href, name });
      });
      return results;
    });

    groups.forEach(g => { allGroups[g.href] = g.name; });
    console.log(`Found ${groups.length} groups. Total: ${Object.keys(allGroups).length}`);
    await sleep(3000);
  }

  const result = Object.entries(allGroups).map(([href, name]) => ({ href, name }));
  fs.writeFileSync('./found_groups.json', JSON.stringify(result, null, 2));
  console.log(`\nDone. ${result.length} unique groups saved to found_groups.json`);
  result.forEach(g => console.log(`${g.name} — ${g.href}`));
  await browser.close();
})();
