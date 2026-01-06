# Sentinel - The Ultimate Discord Security Bot

**Enterprise-Grade Discord Protection** with comprehensive moderation, intelligent auto-moderation, anti-spam, anti-nuke features, **global ban system with appeals**, **per-server customizable settings**, and **beautiful web dashboard**.

## Features

### 🌐 Web Dashboard (NEW!)
- **Web Interface** - Manage all bot settings from a beautiful web dashboard
- **Discord OAuth2** - Secure login with Discord authentication
- **Real-Time Updates** - Changes apply instantly
- **Bulk Management** - Import blocked words, add presets, configure all settings
- **Mobile Friendly** - Responsive design works on any device
- 📚 **[Dashboard Guide](DASHBOARD_GUIDE.md)** | 🚀 Start with: `npm run dashboard`

### 🌍 Global Ban System
- **Global Banning** - Ban users across all servers the bot is in
- **Flexible Punishments** - Choose between Ban, Kick, or Clear Roles
- **Appeal System** - Users can appeal using Discord forms (modals)
- **Automatic Invites** - When appeals are accepted, users receive invites back
- **Ban Management** - List, check, and remove global bans
- 📚 **[Full Documentation](GLOBALBAN_README.md)** | 🚀 **[Setup Guide](SETUP_GLOBALBAN.md)**

### ⚙️ Server-Specific Settings
- **Individual Configs** - Each server has its own JSON configuration
- **Custom Blocked Words** - Set unique blocked words per server with wildcard support
- **Independent Settings** - Auto-mod, anti-spam, and anti-nuke settings per server
- **Easy Management** - Configure via web dashboard or slash commands
- **Auto-Generated** - Configs created automatically when bot joins
- 📚 **[Server Settings Guide](SERVER_SETTINGS_GUIDE.md)**

### Moderation Commands
- `/ban` - Ban a user from the server
- `/kick` - Kick a user from the server
- `/timeout` - Timeout a user
- `/warn` - Warn a user
- `/purge` - Delete multiple messages
- `/lock` - Lock a channel
- `/unlock` - Unlock a channel
- `/slowmode` - Set channel slowmode
- `/lockdown` - Lock down all channels
- `/unlockdown` - Unlock all channels
- `/warnings` - View user warnings
- `/clearwarns` - Clear user warnings

### Global Moderation Commands
- `/globalban` - Ban a user globally across all servers (Server Owners)
- `/appeal` - Submit an appeal for a global ban
- `/reviewappeal` - Review and manage pending appeals (Server Owners)
- `/globalbans` - Manage and view global bans

### Server Settings Commands
- `/serversettings` - Manage server-specific bot settings
- `/blockedwords` - Manage blocked words for this server
- `/settings` - View global bot settings

### Anti-Spam Features
- Message spam detection
- Mention spam detection
- Emoji spam detection
- Duplicate message detection
- Auto-mute spammers

### Auto-Moderation
- Bad word filtering
- Caps lock filtering
- Link filtering
- Discord invite filtering
- Automatic actions on violations

### Anti-Nuke Protection
- Channel deletion protection
- Role deletion protection
- Mass ban protection
- Mass kick protection
- Webhook spam protection
- Auto-ban suspicious users

### Utility Commands
- `/help` - Show all commands
- `/userinfo` - Get user information
- `/serverinfo` - Get server information
- `/botinfo` - Get bot information

### Configuration Commands
- `/settings` - View and modify global bot settings
- `/whitelist` - Manage whitelisted users

## Whitelist System

Whitelisted users bypass:
- Anti-spam detection
- Auto-moderation filters
- Anti-nuke tracking (for trusted moderators)

Administrators automatically bypass anti-spam and auto-mod.
Server owners automatically bypass all protections.

## Setup

### Bot Setup

1. Install dependencies:
```bash
npm install
```

2. Configure the bot:
   - Add your bot token to `config.json`
   - Add your client ID to `config.json`
   - Customize global settings in `config.json`

3. Deploy slash commands:
```bash
npm run deploy
```

4. Start the bot:
```bash
npm start
```

### Dashboard Setup (Optional but Recommended)

1. Get your Discord Client Secret:
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Select your bot → OAuth2 → Copy Client Secret

2. Configure dashboard in `config.json`:
```json
{
  "dashboard": {
    "enabled": true,
    "clientSecret": "YOUR_CLIENT_SECRET_HERE",
    "callbackURL": "http://localhost:3000/callback"
  }
}
```

3. Add OAuth2 redirect in Discord Developer Portal:
   - OAuth2 → Redirects → Add: `http://localhost:3000/callback`

4. Start the dashboard:
```bash
npm run dashboard
```

5. Access at: **http://localhost:3000**

📚 **[Full Dashboard Setup Guide](DASHBOARD_GUIDE.md)**

## Commands Reference

```bash
npm start           # Start the Discord bot
npm run dashboard   # Start the web dashboard
npm run deploy      # Deploy slash commands
```

## Required Permissions

- Administrator (or specific permissions for moderation)
- Manage Channels
- Manage Roles
- Ban Members
- Kick Members
- Moderate Members
- Manage Messages
- Manage Webhooks

## Configuration

### Via Web Dashboard (Recommended)
1. Start dashboard: `npm run dashboard`
2. Login at http://localhost:3000
3. Select your server
4. Configure all settings visually

### Via config.json (Global Settings)
Edit `config.json` for global defaults:
- Anti-nuke limits (global fallback)
- Bot token and client ID
- Owner ID and whitelist
- Dashboard configuration

### Via Server Configs (Per-Server)
Each server has its own config in `servers/<guildId>.json`:
- Auto-moderation settings
- Anti-spam thresholds
- Anti-nuke limits
- Blocked words list

**Manage via:**
- 🌐 Web Dashboard (easiest)
- `/serversettings` command
- `/blockedwords` command
- Direct JSON editing
