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

  // Test searching for a person by name
  const testName = "Michael Anderson";
  const searchUrl = `https://www.facebook.com/search/people/?q=${encodeURIComponent(testName)}`;
  
  await page.goto(searchUrl, { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 5000));

  const results = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="facebook.com"]'));
    const profiles = [];
    links.forEach(a => {
      const href = a.href.split('?')[0];
      if (!href.match(/facebook\.com\/[a-zA-Z0-9._]{3,}$/) &&
          !href.match(/facebook\.com\/profile\.php/)) return;
      if (href.includes('/groups/') || href.includes('/search/')) return;
      const name = a.innerText?.trim();
      if (!name || name === 'Facebook' || name.length < 2) return;
      profiles.push({ href, name });
    });
    return profiles.slice(0, 5);
  });

  console.log("Search results for:", testName);
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();
