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
  await new Promise(r => setTimeout(r, 5000));

  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.scrollBy(0, 1200));
    await new Promise(r => setTimeout(r, 2000));
  }

  const debug = await page.evaluate(() => {
    const articles = document.querySelectorAll('[role="article"]');
    const results = [];
    articles.forEach((a, i) => {
      if (i > 4) return;
      const links = Array.from(a.querySelectorAll('a')).slice(0, 5).map(l => ({
        href: l.href,
        text: l.innerText?.substring(0, 40)
      }));
      results.push({
        index: i,
        textSnippet: a.innerText?.substring(0, 150),
        linkCount: links.length,
        links
      });
    });
    return { count: articles.length, results };
  });

  console.log("Articles found:", debug.count);
  console.log(JSON.stringify(debug.results, null, 2));
  await browser.close();
})();
