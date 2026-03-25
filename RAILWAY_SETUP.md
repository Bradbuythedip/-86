# Deploying 10086 Bot on Railway

## Step 1: Get Your API Keys

### Twitter/X API (developer.x.com)
1. Go to https://developer.x.com and sign up for a developer account
2. Create a new Project and App
3. Under "User authentication settings", enable OAuth 1.0a with Read and Write permissions
4. Go to "Keys and tokens" tab and generate:
   - API Key (Consumer Key)
   - API Secret (Consumer Secret)
   - Access Token
   - Access Token Secret
   - Bearer Token
5. **IMPORTANT**: Make sure the Access Token has **Read and Write** permissions, not just Read

### xAI / Grok API Key
1. Go to https://console.x.ai
2. Create an API key
3. Grok 4 will be used as the LLM brain

### Solana Wallet (optional, for token actions)
1. Generate or export a Solana wallet private key (base58 encoded)
2. Fund it with a small amount of SOL for gas

---

## Step 2: Deploy on Railway

### Option A: Deploy from GitHub (Recommended)

1. Push this repo to GitHub
2. Go to https://railway.com and sign in with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select this repository
5. Railway will auto-detect Node.js and start building

### Option B: Deploy with Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

---

## Step 3: Set Environment Variables

In Railway dashboard → your project → **Variables** tab, add:

```
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_SECRET=your_access_secret_here
TWITTER_BEARER_TOKEN=your_bearer_token_here
XAI_API_KEY=xai-your_key_here
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_PRIVATE_KEY=your_base58_private_key
POST_INTERVAL_MINUTES=60
REPLY_CHECK_INTERVAL_MINUTES=5
```

**Do NOT put these in a .env file on Railway** — use the dashboard Variables tab.

---

## Step 4: Verify It's Running

1. In Railway dashboard, click on your service → **Deployments** tab
2. Click the latest deployment → **View Logs**
3. You should see:
   ```
   🌿 10086 bot starting... please hold. 📞
     Post interval: every 60 minutes
     Reply check: every 5 minutes
   🌿 Bot is live. Leek is growing. 加油
   ```
4. Check your @10086sol Twitter account — a tweet should appear within a minute

---

## Step 5: Configure Posting Frequency

Adjust these environment variables in Railway:

| Variable | Default | Description |
|----------|---------|-------------|
| `POST_INTERVAL_MINUTES` | 60 | How often to auto-post (minutes) |
| `REPLY_CHECK_INTERVAL_MINUTES` | 5 | How often to check for mentions |

**Recommended for launch:**
- Start with `POST_INTERVAL_MINUTES=120` (every 2 hours) to avoid Twitter rate limits
- Keep `REPLY_CHECK_INTERVAL_MINUTES=5`

**Twitter API Rate Limits (Free Tier):**
- 50 tweets per 24 hours (posts + replies combined)
- 1 tweet per request
- If you hit the limit, the bot logs the error and retries next cycle

---

## Troubleshooting

### "403 Forbidden" on tweet
- Your Access Token might only have **Read** permission
- Go to developer.x.com → regenerate tokens with **Read and Write**

### "429 Too Many Requests"
- You've hit the rate limit. Increase `POST_INTERVAL_MINUTES`
- Free tier Twitter API: 50 tweets/day max

### Bot not replying
- Check that Bearer Token is set
- Mentions API requires **Basic** tier ($100/mo) or higher on Twitter API
- Free tier only allows posting, not reading mentions
- Alternative: use a search query to find tweets mentioning @10086sol

### Railway keeps restarting
- Check logs for errors
- Usually a missing environment variable
- `restartPolicyMaxRetries` is set to 5 in railway.toml

---

## Cost Estimate

| Service | Tier | Cost |
|---------|------|------|
| Railway | Hobby | $5/mo + usage (usually ~$2-5/mo for a bot) |
| Twitter API | Free | $0 (50 tweets/day, post only) |
| Twitter API | Basic | $100/mo (read + write, mentions timeline) |
| xAI Grok API | Pay-as-you-go | ~$5-15/mo depending on volume |
| Solana RPC | Free tier | $0 (public RPC) |

**Total: ~$10-120/mo** depending on Twitter API tier.

---

## Running Locally (for testing)

```bash
# Install dependencies
npm install

# Copy env file and fill in your keys
cp .env.example .env

# Run the bot
npm start

# Or test a single post
npm run post

# Or test reply checking
npm run reply
```
