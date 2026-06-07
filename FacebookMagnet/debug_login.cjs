require("dotenv").config();
const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
  await page.goto("https://www.facebook.com/login", { waitUntil: "networkidle2" });
  
  const html = await page.content();
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, input[type="submit"]')).map(b => ({
      tag: b.tagName,
      type: b.type,
      name: b.name,
      id: b.id,
      text: b.innerText?.substring(0, 50)
    }));
  });
  console.log("Buttons found:", JSON.stringify(buttons, null, 2));
  await browser.close();
})();
