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
  await new Promise(r => setTimeout(r, 8000));

  const allPosts = {};

  // Scroll slowly and extract after each scroll
  for (let i = 0; i < 20; i++) {
    await page.evaluate(() => window.scrollBy(0, 600));
    await new Promise(r => setTimeout(r, 3000));

    const posts = await page.evaluate(() => {
      const results = {};
      const actionBtns = Array.from(document.querySelectorAll('[aria-label^="Actions for this post by"]'));

      actionBtns.forEach(btn => {
        const authorName = btn.getAttribute('aria-label').replace('Actions for this post by ', '').trim();

        let container = btn;
        for (let i = 0; i < 15; i++) {
          container = container.parentElement;
          if (!container) break;
          if (container.innerText?.length > 200) break;
        }
        if (!container) return;

        const anchors = Array.from(container.querySelectorAll('a[href*="facebook.com"]'));
        const profileAnchor = anchors.find(a => {
          const href = a.href.split('?')[0];
          return (href.match(/facebook\.com\/[a-zA-Z0-9._]{3,}$/) ||
                  href.match(/facebook\.com\/profile\.php/)) &&
                 !href.includes('/groups/') &&
                 !href.includes('/events/') &&
                 !href.includes('/photo') &&
                 !href.includes('/posts/');
        });

        const text = container.innerText?.replace(/Facebook\n/g, '') || '';

        if (profileAnchor) {
          results[authorName] = {
            author: authorName,
            profileClean: profileAnchor.href.split('?')[0],
            text: text.substring(0, 300)
          };
        }
      });

      return results;
    });

    Object.assign(allPosts, posts);
    console.log(`Scroll ${i+1}: found ${Object.keys(allPosts).length} profiles so far`);
  }

  console.log("\nFINAL RESULTS:");
  console.log(JSON.stringify(Object.values(allPosts), null, 2));
  await browser.close();
})();
