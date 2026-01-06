# 🌐 Sentinel Dashboard Guide

## Overview
The Sentinel Dashboard is a powerful web interface for managing your Discord bot settings. It provides an intuitive, user-friendly way to configure auto-moderation, anti-spam, anti-nuke, and blocked words without using slash commands.

## Features

### 🔐 Discord OAuth2 Authentication
- Secure login with your Discord account
- Automatically shows only servers where you have Manage Server permission
- Session-based authentication (24-hour sessions)

### 🎛️ Real-Time Configuration
- **Auto-Moderation**: Toggle features like link blocking, invite blocking, caps limits
- **Blocked Words**: Add, remove, bulk import, and use preset lists
- **Anti-Spam**: Configure message limits, time windows, and mute durations
- **Anti-Nuke**: Set thresholds for channel/role deletion, bans, and kicks

### ✨ Advanced Features
- **Wildcard Support**: Use `*` in blocked words (e.g., `*badword*`)
- **Preset Lists**: One-click import of profanity, slurs, and spam patterns
- **Bulk Import**: Paste comma-separated lists for quick setup
- **Visual Feedback**: Real-time alerts for all actions
- **Responsive Design**: Works on desktop, tablet, and mobile

## Setup Instructions

### 1. Get Your Discord Client Secret

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your bot application
3. Go to **OAuth2** → **General**
4. Copy your **Client Secret** (click "Reset Secret" if needed)
5. **IMPORTANT**: Keep this secret secure! Never share it publicly

### 2. Configure the Dashboard

Edit `config.json` and update the dashboard section:

```json
{
  "dashboard": {
    "enabled": true,
    "port": 3000,
    "clientSecret": "YOUR_CLIENT_SECRET_HERE",
    "callbackURL": "http://localhost:3000/callback",
    "sessionSecret": "change-this-to-a-random-secure-string"
  }
}
```

**Configuration Options:**
- `enabled`: Set to `true` to enable the dashboard
- `port`: Port number for the web server (default: 3000)
- `clientSecret`: Your Discord application client secret (from step 1)
- `callbackURL`: OAuth2 callback URL (change if hosting publicly)
- `sessionSecret`: Random string for session encryption (generate a secure random string)

### 3. Add OAuth2 Redirect URL

1. Go back to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your bot application
3. Go to **OAuth2** → **General**
4. Under **Redirects**, click **Add Redirect**
5. Add: `http://localhost:3000/callback`
6. Click **Save Changes**

**For Production (if hosting publicly):**
- Use your domain: `https://yourdomain.com/callback`
- Update `callbackURL` in `config.json` to match
- Enable HTTPS for security

### 4. Start the Dashboard

```bash
npm run dashboard
```

You should see:
```
✅ Bot client connected for dashboard
🌐 Dashboard running at http://localhost:3000
📝 Login at http://localhost:3000/login
```

### 5. Access the Dashboard

1. Open your browser and go to: **http://localhost:3000**
2. Click **Login with Discord**
3. Authorize the application
4. Select a server to manage

## Using the Dashboard

### Server Selection
- Only shows servers where:
  - You have **Manage Server** permission
  - The bot is currently in the server
- Click on any server card to access its settings

### Settings Sections

#### 🤖 Auto-Moderation
- **Enable/Disable**: Master toggle for auto-moderation
- **Block Links**: Automatically delete messages with URLs
- **Block Invites**: Delete Discord invite links
- **Caps Limit**: Set maximum percentage of caps and minimum message length

#### 🚫 Blocked Words
- **Add Words**: Type or paste words with wildcard support (`*badword*`)
- **Bulk Import**: Paste comma-separated list for mass import
- **Preset Lists**: One-click presets:
  - Basic Profanity (6 words)
  - Strict Profanity (13 words)
  - Slurs & Hate Speech (10 words)
  - Common Spam (6 patterns)
- **Remove Words**: Click × on any word tag
- **Clear All**: Remove all blocked words at once

#### ⚡ Anti-Spam
- **Enable/Disable**: Toggle spam detection
- **Max Messages**: Number of messages allowed
- **Time Window**: Time period in milliseconds (e.g., 5000 = 5 seconds)
- **Mute Duration**: How long to mute spammers (in minutes)

#### 🛡️ Anti-Nuke
- **Enable/Disable**: Toggle anti-nuke protection
- **Action Limits**: Set thresholds for:
  - Channel Deletions
  - Role Deletions
  - Member Bans
  - Member Kicks
- **Time Window**: Detection period in milliseconds

### Saving Changes

- **Toggles**: Save automatically when switched
- **Number Inputs**: Click the **Save** button after making changes
- **Blocked Words**: Save automatically when added/removed

### Visual Feedback

- ✅ **Green Alert**: Action successful
- ❌ **Red Alert**: Error occurred
- Alerts auto-dismiss after 3 seconds

## Security Considerations

### 🔒 Security Best Practices

1. **Keep Secrets Secure**:
   - Never commit `config.json` with real secrets to Git
   - Use environment variables in production
   - Rotate secrets regularly

2. **Production Hosting**:
   - Always use HTTPS (SSL/TLS)
   - Use a reverse proxy (nginx, Caddy)
   - Set `NODE_ENV=production`
   - Use secure session secrets (32+ random characters)

3. **Access Control**:
   - Dashboard respects Discord permissions
   - Users can only manage servers where they have **Manage Server** permission
   - Bot owner gets access to all servers

### 🌍 Environment Variables (Production)

Instead of hardcoding secrets in `config.json`, use environment variables:

```bash
CLIENT_SECRET=your_secret_here
SESSION_SECRET=your_session_secret
CALLBACK_URL=https://yourdomain.com/callback
PORT=3000
```

Update `dashboard.js` to use `process.env` variables (already supported).

## Troubleshooting

### Dashboard won't start
- **Check**: Is the port already in use?
- **Solution**: Change port in `config.json` or stop conflicting process

### Can't login / OAuth error
- **Check**: Is `clientSecret` correct in `config.json`?
- **Check**: Did you add the redirect URL in Discord Developer Portal?
- **Solution**: Verify both match exactly (including protocol http/https)

### No servers showing
- **Check**: Is the bot invited to your server?
- **Check**: Do you have Manage Server permission?
- **Solution**: Invite bot or ask server owner for permission

### Settings not saving
- **Check**: Are there errors in browser console (F12)?
- **Check**: Is the bot running and logged in?
- **Solution**: Check `dashboard.js` console for errors

### Port 3000 already in use
```bash
# Change port in config.json, or find/kill process using port:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## Advanced Usage

### Running Bot + Dashboard Together

**Option 1: Two Terminal Windows**
```bash
# Terminal 1 - Bot
npm start

# Terminal 2 - Dashboard
npm run dashboard
```

**Option 2: Process Manager (PM2)**
```bash
npm install -g pm2
pm2 start index.js --name sentinel-bot
pm2 start dashboard.js --name sentinel-dashboard
pm2 save
```

### Custom Styling

Edit `public/css/style.css` to customize:
- Colors (CSS variables in `:root`)
- Fonts
- Layout
- Animations

### Adding New Settings

1. Add setting to `utils/serverConfig.js` defaults
2. Add UI elements in `views/server.ejs`
3. Add handler in `public/js/dashboard.js`
4. API endpoints in `dashboard.js` handle generic updates

## Support

If you encounter issues:
1. Check console logs in terminal
2. Check browser console (F12)
3. Verify `config.json` settings
4. Ensure Discord OAuth2 redirect is configured
5. Check bot permissions in server

## Commands Reference

```bash
npm start           # Start the Discord bot
npm run dashboard   # Start the web dashboard
npm run deploy      # Deploy slash commands
```

---

**Made with ❤️ for Sentinel - The Ultimate Discord Security Bot**
