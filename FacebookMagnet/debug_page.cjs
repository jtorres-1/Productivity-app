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

  await page.goto("https://www.facebook.com/groups/ineedawebsite", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 8000));

  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.scrollBy(0, 1200));
    await new Promise(r => setTimeout(r, 2000));
  }

  const debug = await page.evaluate(() => {
    const all = document.querySelectorAll('div[data-pagelet]');
    const roles = new Set();
    document.querySelectorAll('*').forEach(el => {
      if (el.getAttribute('role')) roles.add(el.getAttribute('role'));
    });
    return {
      pagelets: Array.from(all).slice(0, 10).map(d => d.getAttribute('data-pagelet')),
      roles: Array.from(roles),
      bodyText: document.body.innerText.substring(0, 500)
    };
  });

  console.log(JSON.stringify(debug, null, 2));
  fs.writeFileSync('./page_debug.json', JSON.stringify(debug, null, 2));
  await browser.close();
})();
