require("dotenv").config();
const { spawn } = require("child_process");
const fs = require("fs");

const SCRAPE_INTERVAL_MS = 4 * 60 * 60 * 1000;
const LOG_PATH = "./runner.log";

function log(msg) {
  const line = `[${new Date().toLocaleString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_PATH, line + "\n");
}

function runScript(script) {
  return new Promise((resolve) => {
    log(`Starting ${script}...`);
    const proc = spawn("node", [script], { stdio: "inherit" });
    proc.on("close", code => { log(`${script} done (code ${code})`); resolve(code); });
    proc.on("error", err => { log(`${script} error: ${err.message}`); resolve(1); });
  });
}

async function cycle() {
  log("=== Cycle start ===");
  await runScript("fb_scraper.cjs");
  await new Promise(r => setTimeout(r, 5000));
  await runScript("fb_dmbot.cjs");
  log(`=== Cycle complete. Next in 4 hours ===`);
}

(async () => {
  log("FacebookMagnet runner started");
  await cycle();
  setInterval(cycle, SCRAPE_INTERVAL_MS);
})();
