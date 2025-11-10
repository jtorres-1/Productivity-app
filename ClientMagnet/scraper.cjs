require("dotenv").config();
const snoowrap = require("snoowrap");
const { createObjectCsvWriter } = require("csv-writer");

// Init Reddit client
const reddit = new snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT,
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
});

// Writers
const leadsWriter = createObjectCsvWriter({
  path: "logs/leads.csv",
  header: [
    { id: "username", title: "Username" },
    { id: "title", title: "Post Title" },
    { id: "url", title: "Post URL" },
    { id: "subreddit", title: "Subreddit" },
    { id: "time", title: "Timestamp" },
  ],
  append: true,
});

const skippedWriter = createObjectCsvWriter({
  path: "logs/skipped.csv",
  header: [
    { id: "username", title: "Username" },
    { id: "title", title: "Post Title" },
    { id: "url", title: "Post URL" },
    { id: "subreddit", title: "Subreddit" },
    { id: "time", title: "Timestamp" },
    { id: "reason", title: "Reason Skipped" },
  ],
  append: true,
});

// Subreddits focused on housing & real estate
const subreddits = [
  "RealEstate",
  "FirstTimeHomeBuyer",
  "homeowners",
  "Mortgages",
  "Housing",
  "PersonalFinance",
  "AusPropertyChat",
  "BayAreaRealEstate",
  "TorontoRealEstate",
  "Waco"
];

// Filter logic (real estate only)
function isRelevant(post) {
  const text = (post.title + " " + (post.selftext || "")).toLowerCase();

  const mustInclude = [
    "buy a house", "buying a house", "looking to buy", "buying my first home",
    "sell my house", "selling my house", "selling my home",
    "need a realtor", "find a realtor", "real estate agent", "listing agent",
    "mortgage pre approval", "closing costs", "offer accepted", "home inspection"
  ];

  return mustInclude.some((kw) => text.includes(kw));
}

async function scrapeReddit() {
  const leads = [];
  const skipped = [];

  for (const sub of subreddits) {
    console.log(`📂 Searching r/${sub}`);
    const posts = await reddit.getSubreddit(sub).search({
      query: "house OR realtor OR mortgage OR sell OR buy",
      sort: "new",
      time: "week",
      limit: 30,
    });

    posts.forEach((post) => {
      const data = {
        username: post.author ? post.author.name : "Unknown",
        title: post.title,
        url: `https://reddit.com${post.permalink}`,
        subreddit: post.subreddit.display_name,
        time: new Date(post.created_utc * 1000).toISOString(),
      };

      if (isRelevant(post)) {
        leads.push(data);
      } else {
        skipped.push({ ...data, reason: "Not real estate intent" });
      }
    });
  }

  if (leads.length > 0) {
    await leadsWriter.writeRecords(leads);
    console.log(`✅ Saved ${leads.length} HIGH-QUALITY posts to logs/leads.csv`);
  }
  if (skipped.length > 0) {
    await skippedWriter.writeRecords(skipped);
    console.log(`⚠️ Skipped ${skipped.length} posts (saved to logs/skipped.csv)`);
  }
}

scrapeReddit().catch(console.error);
