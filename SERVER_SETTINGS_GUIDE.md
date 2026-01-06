# Server-Specific Settings System

## Overview
Each server now has its own configuration file with customizable settings for auto-moderation, anti-spam, and blocked words.

## Features
✅ Individual JSON config file for each server  
✅ Automatic config creation when bot joins a server  
✅ Automatic config deletion when bot leaves a server  
✅ Server-specific blocked words lists  
✅ Easy-to-use management commands  
✅ Independent settings per server  

## How It Works

### Automatic Config Management
- When bot joins a server → Creates `servers/<guild_id>.json`
- When bot leaves a server → Deletes the config file
- On bot startup → Loads configs for all existing servers

### Config File Location
All server configs are stored in: `servers/<guild_id>.json`

Example: `servers/123456789012345678.json`

## Commands

### `/serversettings`
**Permission Required:** Manage Server

Manage all server-specific bot settings.

#### Subcommands:

**`/serversettings view`**
View all current settings for this server
- Auto-moderation status
- Anti-spam status
- Link/invite blocking
- Caps limits
- Spam thresholds
- Blocked words count

**`/serversettings automod <enabled:true/false>`**
Toggle auto-moderation on/off for this server

**`/serversettings antispam <enabled:true/false>`**
Toggle anti-spam on/off for this server

**`/serversettings blocklinks <enabled:true/false>`**
Toggle blocking of all links

**`/serversettings blockinvites <enabled:true/false>`**
Toggle blocking of Discord invites

**`/serversettings capslimit <percent:0-100>`**
Set maximum caps lock percentage (e.g., 70 = 70%)

**`/serversettings spamsettings <maxmessages> <timewindow>`**
Configure spam detection thresholds
- `maxmessages` - Max messages allowed (2-20)
- `timewindow` - Time window in seconds (1-60)

### `/blockedwords`
**Permission Required:** Manage Server

Manage server-specific blocked words list.

#### Subcommands:

**`/blockedwords add <word>`**
Add a word or phrase to the blocked list
- Case-insensitive
- Checks if word already exists

**`/blockedwords remove <word>`**
Remove a word or phrase from the blocked list

**`/blockedwords list`**
View all blocked words for this server
- Shows up to 25 words per page
- Words are hidden from non-moderators for security

**`/blockedwords clear`**
Remove all blocked words from this server

## Default Server Settings

When a server config is created, these are the default values:

```json
{
  "guildId": "server_id",
  "guildName": "Server Name",
  "autoMod": {
    "enabled": true,
    "blockedWords": [],
    "maxCapsPercent": 70,
    "maxCapsMinLength": 10,
    "blockLinks": false,
    "blockInvites": true
  },
  "antiSpam": {
    "enabled": true,
    "maxMessages": 5,
    "timeWindow": 5000,
    "muteTime": 300000,
    "maxDuplicates": 3,
    "maxMentions": 5,
    "maxEmojis": 10
  },
  "logChannel": "",
  "modRole": "",
  "mutedRole": ""
}
```

## Examples

### Basic Setup for a New Server

1. **View current settings:**
   ```
   /serversettings view
   ```

2. **Add blocked words:**
   ```
   /blockedwords add badword1
   /blockedwords add badword2
   /blockedwords add "inappropriate phrase"
   ```

3. **Configure spam protection:**
   ```
   /serversettings spamsettings maxmessages:4 timewindow:5
   ```

4. **Block all links:**
   ```
   /serversettings blocklinks enabled:true
   ```

5. **Adjust caps limit:**
   ```
   /serversettings capslimit percent:80
   ```

### Temporarily Disable Auto-Mod

```
/serversettings automod enabled:false
```

Later, re-enable:
```
/serversettings automod enabled:true
```

### View Blocked Words

```
/blockedwords list
```

### Clear All Blocked Words

```
/blockedwords clear
```

## Migration Notes

### Old Global Config vs New Server Configs

**Before (Global):**
- One `config.json` for all servers
- Same blocked words across all servers
- Same settings for everyone

**After (Server-Specific):**
- Individual JSON file per server
- Each server has its own blocked words
- Independent settings per server
- Global `config.json` still exists for bot-wide settings (anti-nuke, prefix, etc.)

### What Stays Global?

These settings remain in the main `config.json` and apply to all servers:
- Bot prefix
- Anti-nuke protection settings
- Bot owner ID
- Whitelist (users who bypass all filters)
- Global ban system settings

### What's Server-Specific?

These settings are now per-server in `servers/<guild_id>.json`:
- Auto-moderation (enabled/disabled)
- Anti-spam (enabled/disabled)
- Blocked words list
- Link blocking
- Invite blocking
- Caps limits
- Spam thresholds

## Troubleshooting

### Config not loading?
The bot automatically creates configs. If issues occur:
1. Check `servers/` directory exists
2. Restart the bot
3. Bot will recreate configs on startup

### Settings not applying?
1. Verify settings with `/serversettings view`
2. Check if feature is enabled
3. Ensure bot has proper permissions

### Lost all blocked words?
Each server has independent blocked words. If you switch servers, you need to add words per server.

## File Structure

```
Bot/
├── config.json              # Global bot settings
├── globalBans.json          # Global ban data
├── servers/                 # Server configs directory
│   ├── 123456789.json      # Server 1 config
│   ├── 987654321.json      # Server 2 config
│   └── ...                  # More server configs
├── commands/
│   ├── serversettings.js   # Server settings command
│   ├── blockedwords.js     # Blocked words command
│   └── ...
└── utils/
    └── serverConfig.js      # Config management utility
```

## API Reference (for developers)

### serverConfig.js Functions

```javascript
const serverConfig = require('./utils/serverConfig');

// Load server config (creates if doesn't exist)
const config = serverConfig.loadServerConfig(guildId, guildName);

// Save server config
serverConfig.saveServerConfig(guildId, config);

// Update specific setting
serverConfig.updateServerSetting(guildId, 'autoMod.enabled', true);

// Get specific setting
const enabled = serverConfig.getServerSetting(guildId, 'autoMod.enabled');

// Blocked words management
serverConfig.addBlockedWord(guildId, 'word');
serverConfig.removeBlockedWord(guildId, 'word');
const words = serverConfig.getBlockedWords(guildId);

// Delete server config
serverConfig.deleteServerConfig(guildId);
```

## Best Practices

1. **Review settings regularly** - Use `/serversettings view` periodically
2. **Test changes** - Verify settings work as expected after changes
3. **Communicate with your team** - Let moderators know about blocked words
4. **Start conservative** - Enable features gradually
5. **Monitor logs** - Watch for false positives
6. **Adjust thresholds** - Fine-tune based on your server's activity

## Need Help?

- View current settings: `/serversettings view`
- Check blocked words: `/blockedwords list`
- See global settings: `/settings view`
