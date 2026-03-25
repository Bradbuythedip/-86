import { TwitterApi } from "twitter-api-v2";
import { sanitizeTweet } from "./safety.js";

let client = null;
let botUserId = null;

export function getClient() {
  if (!client) {
    client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });
  }
  return client;
}

export async function getBotUserId() {
  if (!botUserId) {
    const tw = getClient();
    const me = await tw.v2.me();
    botUserId = me.data.id;
  }
  return botUserId;
}

export async function postTweet(text) {
  const tw = getClient();
  const safe = sanitizeTweet(text);
  const result = await tw.v2.tweet(safe);
  console.log(`[POSTED] ${safe.slice(0, 60)}...`);
  return result;
}

export async function postThread(tweets) {
  const tw = getClient();
  let lastTweetId = null;

  for (const text of tweets) {
    const safe = sanitizeTweet(text);
    const options = lastTweetId
      ? { reply: { in_reply_to_tweet_id: lastTweetId } }
      : {};
    const result = await tw.v2.tweet(safe, options);
    lastTweetId = result.data.id;
    console.log(`[THREAD] ${safe.slice(0, 60)}...`);
  }

  return lastTweetId;
}

export async function replyToTweet(tweetId, text) {
  const tw = getClient();
  const safe = sanitizeTweet(text);
  const result = await tw.v2.reply(safe, tweetId);
  console.log(`[REPLY] -> ${tweetId}: ${safe.slice(0, 60)}...`);
  return result;
}

export async function getMentions(sinceId) {
  const userId = await getBotUserId();

  const tw = getClient();
  const params = {
    "tweet.fields": ["author_id", "conversation_id", "created_at", "text"],
    max_results: 20,
  };

  if (sinceId) {
    params.since_id = sinceId;
  }

  const mentions = await tw.v2.userMentionTimeline(userId, params);
  return mentions.data?.data || [];
}
