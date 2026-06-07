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

  // Scroll to load posts
  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => window.scrollBy(0, 1200));
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log("Dumping all selectors now...");

  const selectors = await page.evaluate(() => {
    const results = {};

    // All elements with role
    const roles = {};
    document.querySelectorAll('[role]').forEach(el => {
      const role = el.getAttribute('role');
      if (!roles[role]) roles[role] = [];
      if (roles[role].length < 3) {
        roles[role].push({
          tag: el.tagName,
          classes: String(el.className || "").substring(0, 80),
          text: el.innerText?.substring(0, 100),
          ariaLabel: el.getAttribute('aria-label')
        });
      }
    });
    results.roles = roles;

    // All aria-labels
    const ariaLabels = [];
    document.querySelectorAll('[aria-label]').forEach(el => {
      const label = el.getAttribute('aria-label');
      if (label && label.length < 50) {
        ariaLabels.push({
          label,
          tag: el.tagName,
          text: el.innerText?.substring(0, 50)
        });
      }
    });
    results.ariaLabels = [...new Set(ariaLabels.map(a => a.label))];

    // Post containers — find divs with substantial text
    const postCandidates = [];
    document.querySelectorAll('div').forEach(div => {
      const text = div.innerText?.trim();
      if (!text || text.length < 100 || text.length > 2000) return;
      if (div.children.length < 2) return;
      const links = div.querySelectorAll('a[href*="facebook.com"]');
      if (links.length < 1) return;
      if (postCandidates.length < 5) {
        postCandidates.push({
          tag: div.tagName,
          role: div.getAttribute('role'),
          dataTestId: div.getAttribute('data-testid'),
          ariaLabel: div.getAttribute('aria-label'),
          text: text.substring(0, 150),
          linkCount: links.length,
          firstLink: links[0]?.href?.substring(0, 80),
          firstLinkText: links[0]?.innerText?.substring(0, 30)
        });
      }
    });
    results.postCandidates = postCandidates;

    // Profile links
    const profileLinks = [];
    document.querySelectorAll('a[href*="facebook.com"]').forEach(a => {
      const href = a.href.split('?')[0];
      if (!href.match(/facebook\.com\/[a-zA-Z0-9._]{3,}$/) &&
          !href.match(/facebook\.com\/profile\.php/)) return;
      if (href.includes('/groups/') || href.includes('/events/')) return;
      const name = a.innerText?.trim();
      if (!name || name === 'Facebook' || name.length < 2) return;
      if (profileLinks.length < 10) {
        profileLinks.push({ href, name });
      }
    });
    results.profileLinks = profileLinks;

    return results;
  });

  fs.writeFileSync('./selectors.json', JSON.stringify(selectors, null, 2));
  console.log("Saved to selectors.json");
  console.log("ARIA LABELS:", selectors.ariaLabels);
  console.log("PROFILE LINKS FOUND:", selectors.profileLinks.length);
  console.log("POST CANDIDATES:", selectors.postCandidates.length);
  console.log(JSON.stringify(selectors.postCandidates, null, 2));

  await browser.close();
})();
