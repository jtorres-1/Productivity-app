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

  // Use a large active group
  await page.goto("https://www.facebook.com/groups/smallbusinessowners", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 10000));

  for (let i = 0; i < 8; i++) {
    await page.evaluate(() => window.scrollBy(0, 1200));
    await new Promise(r => setTimeout(r, 2500));
  }

  const debug = await page.evaluate(() => {
    const feed = document.querySelector('[role="feed"]');
    if (!feed) return { error: "no feed" };
    const children = Array.from(feed.children).slice(0, 8);
    return {
      feedChildCount: feed.children.length,
      posts: children.map((el, i) => ({
        index: i,
        text: el.innerText?.substring(0, 200),
        links: Array.from(el.querySelectorAll('a')).slice(0, 3).map(a => ({
          href: a.href,
          text: a.innerText?.substring(0, 30)
        }))
      }))
    };
  });

  console.log(JSON.stringify(debug, null, 2));
  await browser.close();
})();
