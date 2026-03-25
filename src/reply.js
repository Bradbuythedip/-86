import "dotenv/config";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { generateResponse } from "./claude.js";
import { SYSTEM_PROMPT, REPLY_PROMPT } from "./prompt.js";
import { getMentions, replyToTweet } from "./twitter.js";
import { parseAction, stripAction, executeAction } from "./actions.js";

const STATE_FILE = ".last_mention_id";

function getLastMentionId() {
  if (existsSync(STATE_FILE)) {
    return readFileSync(STATE_FILE, "utf8").trim();
  }
  return null;
}

function saveLastMentionId(id) {
  writeFileSync(STATE_FILE, id);
}

async function processReplies() {
  const sinceId = getLastMentionId();
  const mentions = await getMentions(sinceId);

  if (mentions.length === 0) {
    console.log("[REPLY] No new mentions");
    return;
  }

  console.log(`[REPLY] Found ${mentions.length} new mentions`);

  for (const mention of mentions.reverse()) {
    try {
      const prompt = `${REPLY_PROMPT}\n\n"${mention.text}"`;
      const response = await generateResponse(SYSTEM_PROMPT, prompt);

      const action = parseAction(response);
      const replyText = stripAction(response);

      await replyToTweet(mention.id, replyText);

      if (action) {
        const result = await executeAction(action);
        console.log(`[ACTION RESULT] ${JSON.stringify(result)}`);
      }

      saveLastMentionId(mention.id);
    } catch (err) {
      console.error(`[ERROR] Failed to reply to ${mention.id}:`, err.message);
    }
  }
}

processReplies().catch(console.error);
