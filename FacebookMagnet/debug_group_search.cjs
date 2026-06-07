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

  await page.goto("https://www.facebook.com/search/groups/?q=freelance+web+developer", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 6000));

  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.scrollBy(0, 1200));
    await new Promise(r => setTimeout(r, 2000));
  }

  const debug = await page.evaluate(() => {
    const allLinks = Array.from(document.querySelectorAll('a')).map(a => ({
      href: a.href?.substring(0, 100),
      text: a.innerText?.trim().substring(0, 50)
    })).filter(a => a.href && a.text);
    
    const bodyText = document.body.innerText.substring(0, 2000);
    return { links: allLinks.slice(0, 30), bodyText };
  });

  console.log("BODY:", debug.bodyText);
  console.log("LINKS:", JSON.stringify(debug.links, null, 2));
  await browser.close();
})();
