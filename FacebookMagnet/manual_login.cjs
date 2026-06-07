require("dotenv").config();
const puppeteer = require("puppeteer");
const fs = require("fs");

const SESSION_PATH = "./session.json";

(async () => {
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

  await page.goto("https://www.facebook.com/login", { waitUntil: "networkidle2" });
  
  console.log("Log in manually in the browser window. You have 60 seconds...");
  await new Promise(r => setTimeout(r, 60000));

  const cookies = await page.cookies();
  fs.writeFileSync(SESSION_PATH, JSON.stringify(cookies, null, 2));
  console.log("Session saved. URL:", page.url());
  await browser.close();
})();
