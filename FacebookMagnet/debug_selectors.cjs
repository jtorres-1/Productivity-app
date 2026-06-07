require("dotenv").config();
const puppeteer = require("puppeteer");
const fs = require("fs");

const SESSION_PATH = "./session.json";

(async () => {
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

  // Load saved session if exists
  if (fs.existsSync(SESSION_PATH)) {
    console.log("Loading saved session...");
    const cookies = JSON.parse(fs.readFileSync(SESSION_PATH));
    await page.setCookie(...cookies);
    await page.goto("https://www.facebook.com", { waitUntil: "networkidle2" });
    const url = page.url();
    console.log("Current URL after session load:", url);
    if (!url.includes("login")) {
      console.log("Session valid. Already logged in.");
      await browser.close();
      return;
    }
  }

  // Login
  console.log("Logging in fresh...");
  await page.goto("https://www.facebook.com/login", { waitUntil: "networkidle2" });
  await page.type('input[name="email"]', process.env.FB_EMAIL, { delay: 100 });
  await page.type('input[name="pass"]', process.env.FB_PASSWORD, { delay: 100 });
  await page.click('[aria-label="Log In"]');
  await page.waitForNavigation({ waitUntil: "networkidle2" });
  console.log("Logged in. URL:", page.url());

  // Save session
  const cookies = await page.cookies();
  fs.writeFileSync(SESSION_PATH, JSON.stringify(cookies, null, 2));
  console.log("Session saved to session.json");

  // Now go to a group and debug selectors
  await page.goto("https://www.facebook.com/groups/ineedawebsite", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 4000));

  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => window.scrollBy(0, 1200));
    await new Promise(r => setTimeout(r, 2000));
  }

  const debug = await page.evaluate(() => {
    const articles = document.querySelectorAll('[role="article"]');
    const results = [];
    articles.forEach((a, i) => {
      if (i > 2) return;
      const links = Array.from(a.querySelectorAll('a')).slice(0, 3).map(l => ({
        href: l.href,
        text: l.innerText?.substring(0, 30)
      }));
      results.push({
        index: i,
        textSnippet: a.innerText?.substring(0, 100),
        links: links
      });
    });
    return results;
  });

  console.log("Group articles debug:", JSON.stringify(debug, null, 2));
  await browser.close();
})();
