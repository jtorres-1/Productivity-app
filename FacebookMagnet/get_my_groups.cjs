require("dotenv").config();
const puppeteer = require("puppeteer");
const fs = require("fs");

const SESSION_PATH = "./session.json";

(async () => {
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

  const cookies = JSON.parse(fs.readFileSync(SESSION_PATH));
  await page.setCookie(...cookies);

  await page.goto("https://www.facebook.com/groups/joins/?nav_source=tab", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 5000));

  for (let i = 0; i < 20; i++) {
    await page.evaluate(() => window.scrollBy(0, 1200));
    await new Promise(r => setTimeout(r, 2000));
  }

  const groups = await page.evaluate(() => {
    const results = [];
    const seen = new Set();
    const links = Array.from(document.querySelectorAll('a[href*="/groups/"]'));
    links.forEach(a => {
      const href = a.href.split('?')[0];
      if (!href.match(/facebook\.com\/groups\/[a-zA-Z0-9._]+\/?$/)) return;
      if (href.includes('/groups/joins') || href.includes('/groups/discover')) return;
      if (seen.has(href)) return;
      seen.add(href);
      const name = a.innerText?.trim();
      results.push({ href, name: name || 'unknown' });
    });
    return results;
  });

  console.log(`Found ${groups.length} groups:`);
  groups.forEach(g => console.log(`${g.name} — ${g.href}`));
  fs.writeFileSync('./my_groups.json', JSON.stringify(groups, null, 2));
  console.log("Saved to my_groups.json");
  await browser.close();
})();
