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
  'jobsearchhacks',
  'careerguidance',
  'jobs',
  'cscareerquestions',
  'getemployed',
  'resumes',
  'careerchange',
  'remotework',
  'jobopenings',
  'techjobs',
  'jobhunt',
  'getthatjob',
  'jobsearch',
  'remotejobs',        // people looking for remote work
  'entrylevel',        // new grads & first-job seekers
  'internships',       // students needing fast applications
  'interview',         // prep + people frustrated after applying
  'hiring'             // posts often from employers/recruiters
];


const messages = [
  `Hey, I know job hunting sucks right now. I built something that applies automatically so you don’t have to grind 50+ apps a day: https://jobbotpro.carrd.co`,

  `Saw your post — I’ve been through the same endless applications. This bot auto-applies for you and actually saves time: https://jobbotpro.carrd.co`,

  `Most people spend hours copy/pasting into job portals. This tool does it in the background for you: https://jobbotpro.carrd.co`,

  `If you’re still sending tons of applications, this might help: https://jobbotpro.carrd.co\n\nIt’s an auto apply bot, frees up hours every week.`,

  `Quick tip: instead of applying manually, this bot applies for you. I’ve seen it save people a lot of stress: https://jobbotpro.carrd.co`
];


const getRandomMessage = () => messages[Math.floor(Math.random() * messages.length)];
const wait = ms => new Promise(res => setTimeout(res, ms));
const MAX_DMS_PER_DAY = 30;
let dmCount = 0;

// Bot main
async function runBot() {
  try {
    for (const sub of subreddits) {
      if (dmCount >= MAX_DMS_PER_DAY) {
        console.log('🔒 Daily DM limit reached. Exiting.');
        return;
      }

      console.log(`\n📂 Scanning r/${sub}`);
      const posts = await r.getSubreddit(sub).getHot({ limit: 5 });

      for (const post of posts) {
        if (dmCount >= MAX_DMS_PER_DAY) {
          console.log('🔒 Daily DM limit reached. Exiting.');
          return;
        }

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

            console.log(`✅ DM sent to u/${username}`);
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

        await wait(30000); // 30 sec delay to reduce ban risk
      }
    }
  } catch (err) {
    console.error('❌ Bot error:', err.message);
  }

  console.log('🔁 Scan complete. Waiting 10 minutes before restarting...');
  setTimeout(runBot, 10 * 60 * 1000); // wait 10 minutes before restarting
}

runBot();
