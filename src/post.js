import "dotenv/config";
import { generateResponse } from "./claude.js";
import { SYSTEM_PROMPT, POST_PROMPT, STORY_PROMPT } from "./prompt.js";
import { postTweet, postThread } from "./twitter.js";

async function makePost() {
  const isStory = Math.random() < 0.15; // 15% chance of story thread

  if (isStory) {
    const storyText = await generateResponse(SYSTEM_PROMPT, STORY_PROMPT);
    const tweets = storyText
      .split("---")
      .map((t) => t.trim())
      .filter(Boolean);
    await postThread(tweets);
    console.log(`[STORY] Posted thread with ${tweets.length} tweets`);
  } else {
    const tweet = await generateResponse(SYSTEM_PROMPT, POST_PROMPT);
    await postTweet(tweet);
  }
}

makePost().catch(console.error);
