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

  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => window.scrollBy(0, 1200));
    await new Promise(r => setTimeout(r, 2000));
  }

  const posts = await page.evaluate(() => {
    const results = [];

    // Find all post action buttons — each one = one post
    const actionBtns = Array.from(document.querySelectorAll('[aria-label^="Actions for this post by"]'));

    actionBtns.forEach(btn => {
      const authorName = btn.getAttribute('aria-label').replace('Actions for this post by ', '').trim();

      // Walk up to find the post container
      let container = btn;
      for (let i = 0; i < 10; i++) {
        container = container.parentElement;
        if (!container) break;
        if (container.innerText?.length > 200) break;
      }
      if (!container) return;

      const text = container.innerText || '';

      // Find profile link for this author
      const links = Array.from(container.querySelectorAll('a[href*="facebook.com"]'));
      const profileLink = links.find(a => {
        const href = a.href.split('?')[0];
        return (href.match(/facebook\.com\/[a-zA-Z0-9._]{3,}$/) ||
                href.match(/facebook\.com\/profile\.php/)) &&
               !href.includes('/groups/') &&
               !href.includes('/events/') &&
               !href.includes('/photo') &&
               !href.includes('/posts/');
      });

      results.push({
        author: authorName,
        profileHref: profileLink?.href || null,
        textSnippet: text.substring(0, 300),
        timestamp: text.match(/\b(\d+[hmd]|just now|yesterday|minutes? ago|hours? ago)\b/i)?.[0] || 'unknown'
      });
    });

    return results;
  });

  console.log(`Found ${posts.length} posts`);
  console.log(JSON.stringify(posts, null, 2));
  await browser.close();
})();
