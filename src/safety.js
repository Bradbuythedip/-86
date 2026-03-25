// Blocked handles - NEVER tag these in any tweet
const BLOCKED_HANDLES = [
  "elonmusk",
  "elon",
  "jack",
  "potus",
  "whitehouse",
  "sec_enforcement",
];

// Patterns that violate Twitter ToS
const BLOCKED_PATTERNS = [
  /\bkill\b/i,
  /\bbomb\b/i,
  /\bthreat/i,
  /\bhack\s+(into|your)/i,
  /\bdoxx/i,
  /\bswatt/i,
];

/**
 * Strip any @mentions of blocked handles from tweet text.
 * Also removes any other ToS-violating content.
 */
export function sanitizeTweet(text) {
  let clean = text;

  // Remove @mentions of blocked handles (case-insensitive)
  for (const handle of BLOCKED_HANDLES) {
    const regex = new RegExp(`@${handle}\\b`, "gi");
    clean = clean.replace(regex, "[big boss]");
  }

  // Check for blocked patterns
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(clean)) {
      console.warn(`[SAFETY] Blocked pattern detected, replacing tweet`);
      return "i was going to say something but my leek brain thought better of it. rare moment of wisdom. 🌿📞";
    }
  }

  // Ensure tweet doesn't exceed 280 chars
  if (clean.length > 280) {
    clean = clean.slice(0, 277) + "...";
  }

  return clean;
}

/**
 * Check if a mention is safe to reply to (not a bot loop, not blocked)
 */
export function isSafeToReply(mention, botUserId) {
  // Don't reply to yourself
  if (mention.author_id === botUserId) return false;

  // Don't reply to blocked handles in the mention text
  for (const handle of BLOCKED_HANDLES) {
    if (mention.text.toLowerCase().includes(`@${handle}`)) {
      console.log(`[SAFETY] Skipping mention that references blocked handle: @${handle}`);
      return false;
    }
  }

  return true;
}
