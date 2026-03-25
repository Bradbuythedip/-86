import "dotenv/config";
import { CronJob } from "cron";
import { generateResponse } from "./claude.js";
import { SYSTEM_PROMPT, POST_PROMPT, STORY_PROMPT, REPLY_PROMPT } from "./prompt.js";
import { postTweet, postThread, getMentions, replyToTweet } from "./twitter.js";
import { parseAction, stripAction, executeAction } from "./actions.js";
import { readFileSync, writeFileSync, existsSync } from "fs";

const STATE_FILE = ".last_mention_id";
const POST_INTERVAL = parseInt(process.env.POST_INTERVAL_MINUTES || "60");
const REPLY_INTERVAL = parseInt(process.env.REPLY_CHECK_INTERVAL_MINUTES || "5");

function getLastMentionId() {
  if (existsSync(STATE_FILE)) return readFileSync(STATE_FILE, "utf8").trim();
  return null;
}

function saveLastMentionId(id) {
  writeFileSync(STATE_FILE, id);
}

// --- Auto-post ---
async function autoPost() {
  try {
    const isStory = Math.random() < 0.15;

    if (isStory) {
      const storyText = await generateResponse(SYSTEM_PROMPT, STORY_PROMPT);
      const tweets = storyText.split("---").map((t) => t.trim()).filter(Boolean);
      await postThread(tweets);
      console.log(`[AUTO] Story thread posted (${tweets.length} tweets)`);
    } else {
      const tweet = await generateResponse(SYSTEM_PROMPT, POST_PROMPT);
      await postTweet(tweet);
      console.log(`[AUTO] Tweet posted`);
    }
  } catch (err) {
    console.error("[AUTO ERROR]", err.message);
  }
}

// --- Auto-reply ---
async function autoReply() {
  try {
    const sinceId = getLastMentionId();
    const mentions = await getMentions(sinceId);

    if (mentions.length === 0) return;

    console.log(`[REPLY] Processing ${mentions.length} mentions`);

    for (const mention of mentions.reverse()) {
      try {
        const prompt = `${REPLY_PROMPT}\n\n"${mention.text}"`;
        const response = await generateResponse(SYSTEM_PROMPT, prompt);
        const action = parseAction(response);
        const replyText = stripAction(response);

        await replyToTweet(mention.id, replyText);

        if (action) {
          const result = await executeAction(action);
          console.log(`[ACTION] ${JSON.stringify(result)}`);
        }

        saveLastMentionId(mention.id);
      } catch (err) {
        console.error(`[REPLY ERROR] ${mention.id}:`, err.message);
      }
    }
  } catch (err) {
    console.error("[REPLY ERROR]", err.message);
  }
}

// --- Start ---
console.log("🌿 10086 bot starting... please hold. 📞");
console.log(`  Post interval: every ${POST_INTERVAL} minutes`);
console.log(`  Reply check: every ${REPLY_INTERVAL} minutes`);

// Post on startup
autoPost();

// Cron: auto-post
const postJob = new CronJob(`*/${POST_INTERVAL} * * * *`, autoPost);
postJob.start();

// Cron: check replies
const replyJob = new CronJob(`*/${REPLY_INTERVAL} * * * *`, autoReply);
replyJob.start();

console.log("🌿 Bot is live. Leek is growing. 加油");
