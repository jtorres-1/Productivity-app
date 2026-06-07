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

  await page.goto("https://www.facebook.com/groups/smallbusinessowners", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 10000));

  for (let i = 0; i < 8; i++) {
    await page.evaluate(() => window.scrollBy(0, 1200));
    await new Promise(r => setTimeout(r, 3000));
  }

  // Dump raw body text to see what's actually visible
  const debug = await page.evaluate(() => {
    const allText = document.body.innerText.substring(0, 3000);
    const allLinks = Array.from(document.querySelectorAll('a[href*="facebook.com"]'))
      .slice(0, 20)
      .map(a => ({ href: a.href, text: a.innerText?.substring(0, 40) }));
    return { bodyText: allText, links: allLinks };
  });

  console.log("BODY TEXT:", debug.bodyText);
  console.log("LINKS:", JSON.stringify(debug.links, null, 2));
  await browser.close();
})();
