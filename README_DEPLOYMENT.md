# Sentinel Bot - Deployment Guide

## 🚀 Quick Deploy to Railway

1. **Fork/Push this repo to GitHub**

2. **Create a Railway account** at [railway.app](https://railway.app)

3. **Create a new project** → Deploy from GitHub repo

4. **Add environment variables** in Railway dashboard:
   ```
   DISCORD_TOKEN=your_bot_token
   CLIENT_ID=your_client_id
   OWNER_ID=your_discord_user_id
   CLIENT_SECRET=your_oauth_client_secret
   CALLBACK_URL=https://your-app.railway.app/callback
   SESSION_SECRET=random_secure_string_here
   ```

5. **Railway will automatically**:
   - Install dependencies (`npm install`)
   - Run `npm start` (starts both bot and dashboard)

## 📝 Environment Variables

Required variables:
- `DISCORD_TOKEN` - Your bot token from Discord Developer Portal
- `CLIENT_ID` - Your bot's application ID
- `OWNER_ID` - Your Discord user ID
- `CLIENT_SECRET` - OAuth2 client secret from Discord Developer Portal
- `CALLBACK_URL` - Full URL for OAuth callback (e.g., `https://your-app.railway.app/callback`)
- `SESSION_SECRET` - Random string for session security

Optional variables:
- `DASHBOARD_PORT` - Port for dashboard (default: 3000)
- `GLOBALBAN_ENABLED` - Enable global ban system (default: true)
- `GLOBALBAN_PUNISHMENT` - Default punishment type (default: ban)
- `APPEAL_CHANNEL_ID` - Channel ID for appeals
- `LOG_CHANNEL_ID` - Channel ID for logs

## 🔧 Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your values in `.env`

3. Install dependencies:
   ```bash
   npm install
   ```

4. Deploy slash commands:
   ```bash
   npm run deploy
   ```

5. Start the bot and dashboard:
   ```bash
   npm start
   ```

## 🌐 Update Discord OAuth2 Settings

In [Discord Developer Portal](https://discord.com/developers/applications):
1. Go to your application
2. Click "OAuth2" → "General"
3. Add redirect URL: `https://your-app.railway.app/callback`
4. Save changes

## 📦 Other Hosting Options

### Render.com
- Deploy from GitHub
- Add environment variables in dashboard
- Uses `npm start` automatically

### Heroku
- Connect GitHub repo
- Add Config Vars (environment variables)
- Uses `npm start` from package.json

### VPS (DigitalOcean, Vultr, etc.)
- Install Node.js 18+
- Clone repo
- Create `.env` file with your values
- Run `npm install`
- Run `npm run deploy` (one time)
- Use PM2 to keep bot running: `pm2 start npm --name sentinel -- start`
