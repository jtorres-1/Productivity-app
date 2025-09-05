require('dotenv').config();
const snoowrap = require('snoowrap');
const fs = require('fs');

// Init Reddit client
const r = new snoowrap({
  userAgent: process.env.USER_AGENT,
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD
});

// Load or initialize messaged users
const MESSAGED_USERS_FILE = 'messaged_users.json';
let messagedUsers = [];

if (fs.existsSync(MESSAGED_USERS_FILE)) {
  try {
    messagedUsers = JSON.parse(fs.readFileSync(MESSAGED_USERS_FILE));
  } catch (e) {
    console.error('❌ Failed to load messaged_users.json:', e.message);
    messagedUsers = [];
  }
}

// Config
const subreddits = [
  'resumes', 'careerguidance', 'jobsearch', 'jobsearchhacks', 'getthatjob',
  'getemployed', 'jobhunt', 'remotework', 'remotejobs', 'techjobs',
  'cscareerquestions', 'entrylevel', 'internships', 'interview',
  'recruitinghell', 'jobs', 'jobopenings', 'hiring', 'careeradvice'
];

const messages = [
  `Quick heads up — I built an AI tool that rewrites your resume so it actually passes ATS and gets seen by recruiters. Check it out: https://linktr.ee/jtxcode`,
  `Hey, saw your post. If resumes keep getting ignored, this tool makes them recruiter- and ATS-friendly automatically: https://linktr.ee/jtxcode`,
  `Most resumes get filtered before a human even sees them. This AI fixes that — rewrite yours in seconds: https://linktr.ee/jtxcode`,
  `Job hunting is stressful enough. This tool instantly optimizes your resume so you stand out and land interviews faster: https://linktr.ee/jtxcode`,
  `Quick tip: outdated resumes get ghosted. I made an AI that refreshes yours for ATS and recruiters — takes 30 seconds: https://linktr.ee/jtxcode`
];

const getRandomMessage = () => messages[Math.floor(Math.random() * messages.length)];
const shuffle = arr => arr.sort(() => Math.random() - 0.5);
const wait = ms => new Promise(res => setTimeout(res, ms));

const MAX_DMS_PER_DAY = 25;
let dmCount = 0;

// Bot main
async function runBot() {
  try {
    const shuffledSubs = shuffle([...subreddits]);

    for (const sub of shuffledSubs) {
      if (dmCount >= MAX_DMS_PER_DAY) {
        console.log(`🔒 Daily DM limit (${MAX_DMS_PER_DAY}) reached. Exiting for today.`);
        return;
      }

      console.log(`\n📂 Scanning r/${sub}`);
      const posts = await r.getSubreddit(sub).getHot({ limit: 5 });

      for (const post of posts) {
        if (dmCount >= MAX_DMS_PER_DAY) break;

        const username = post.author.name;

        if (
          !username ||
          username === 'AutoModerator' ||
          username.toLowerCase().includes('mod') ||
          messagedUsers.includes(username)
        ) {
          continue;
        }

        console.log(`📨 Messaging u/${username} from r/${sub}`);

        let sent = false;
        while (!sent) {
          try {
            await r.composeMessage({
              to: username,
              subject: 'quick heads up',
              text: getRandomMessage()
            });

            console.log(`✅ DM sent to u/${username} (${dmCount + 1}/${MAX_DMS_PER_DAY})`);
            dmCount++;
            messagedUsers.push(username);

            fs.writeFileSync(MESSAGED_USERS_FILE, JSON.stringify(messagedUsers, null, 2));
            sent = true;
          } catch (err) {
            if (err.message.toLowerCase().includes('ratelimit')) {
              console.warn(`⏳ Ratelimit hit. Waiting 60 sec before retrying...`);
              await wait(60000);
            } else {
              console.error(`❌ DM failed to u/${username}: ${err.message}`);
              break;
            }
          }
        }

        // random delay 30–90s
        const delay = 30000 + Math.floor(Math.random() * 60000);
        console.log(`⏳ Waiting ${(delay / 1000).toFixed(0)}s before next message...`);
        await wait(delay);
      }
    }
  } catch (err) {
    console.error('❌ Bot error:', err.message);
  }

  console.log('🔁 Scan complete. Waiting 10 minutes before restarting...');
  setTimeout(runBot, 10 * 60 * 1000);
}

runBot();
