# Quick Start: Server Settings System

## What Changed?

Your bot now supports **per-server settings**! Each server can have:
- ✅ Custom blocked words lists
- ✅ Independent auto-mod settings
- ✅ Independent anti-spam settings
- ✅ Toggle features on/off per server

## Instant Setup

### 1. Deploy New Commands
```bash
node deploy-commands.js
```

### 2. Restart Your Bot
```bash
node index.js
```

That's it! The bot will automatically:
- Create config files for all existing servers
- Generate configs when joining new servers
- Delete configs when leaving servers

## Using the New System

### For Server Admins

#### View Your Server's Settings
```
/serversettings view
```

#### Add Blocked Words
```
/blockedwords add badword
/blockedwords add "inappropriate phrase"
```

#### View Blocked Words
```
/blockedwords list
```

#### Remove a Blocked Word
```
/blockedwords remove badword
```

#### Toggle Auto-Mod On/Off
```
/serversettings automod enabled:false
```

#### Toggle Anti-Spam On/Off
```
/serversettings antispam enabled:true
```

#### Block All Links
```
/serversettings blocklinks enabled:true
```

#### Block Discord Invites
```
/serversettings blockinvites enabled:true
```

#### Change Caps Limit
```
/serversettings capslimit percent:80
```

#### Configure Spam Detection
```
/serversettings spamsettings maxmessages:4 timewindow:5
```

## File Structure

Your bot folder now has:
```
Bot/
├── servers/                    # ← NEW! Server configs directory
│   ├── 123456789.json         # Server 1 config
│   ├── 987654321.json         # Server 2 config
│   └── ...
├── commands/
│   ├── serversettings.js      # ← NEW!
│   ├── blockedwords.js        # ← NEW!
│   └── ...
├── utils/
│   └── serverConfig.js        # ← NEW! Config manager
└── ...
```

## What's Different?

### Before (Global Settings)
- All servers used same blocked words
- All servers had same settings
- Changes affected every server

### After (Server-Specific Settings)
- Each server has its own blocked words
- Each server has independent settings
- Changes only affect one server

### What's Still Global?
- Bot prefix
- Anti-nuke settings
- Bot owner ID
- Whitelist users

## Examples

### Example 1: Family-Friendly Server
```
/serversettings automod enabled:true
/serversettings blockinvites enabled:true
/serversettings blocklinks enabled:true
/blockedwords add badword1
/blockedwords add badword2
/blockedwords add badword3
```

### Example 2: Relaxed Community
```
/serversettings automod enabled:true
/serversettings blockinvites enabled:true
/serversettings blocklinks enabled:false
/serversettings capslimit percent:90
```

### Example 3: Strict Server
```
/serversettings antispam enabled:true
/serversettings spamsettings maxmessages:3 timewindow:5
/serversettings automod enabled:true
/serversettings blocklinks enabled:true
/blockedwords add word1
/blockedwords add word2
... (add more)
```

## Permissions

**Who can use these commands?**
- `/serversettings` - Requires "Manage Server" permission
- `/blockedwords` - Requires "Manage Server" permission

**Who is affected?**
- Regular members - Filtered by auto-mod
- Administrators - Bypass all filters
- Whitelisted users (global) - Bypass all filters

## Need Help?

### Check Current Settings
```
/serversettings view
```

### See All Blocked Words
```
/blockedwords list
```

### View Global Settings
```
/settings view
```

### Full Documentation
See [SERVER_SETTINGS_GUIDE.md](SERVER_SETTINGS_GUIDE.md) for complete details.

## Troubleshooting

**Commands not showing?**
- Run `node deploy-commands.js`
- Wait a few minutes for Discord to update
- Try restarting Discord

**Settings not saving?**
- Check bot has write permissions in the folder
- Verify `servers/` directory exists
- Restart the bot

**Blocked words not working?**
- Ensure auto-mod is enabled: `/serversettings automod enabled:true`
- Check the word is in the list: `/blockedwords list`
- Remember: words are case-insensitive

**Different servers showing same settings?**
- Each server has its own config file
- Settings don't sync between servers
- You need to configure each server independently

## Tips

1. **Start with defaults** - Bot creates sensible defaults automatically
2. **Test changes** - Try triggering filters after adding words
3. **Review regularly** - Use `/serversettings view` to check current setup
4. **Communicate** - Let your mod team know about blocked words
5. **Adjust as needed** - Settings can be changed anytime

## Advanced: Manual Config Editing

Server configs are in `servers/<guild_id>.json`. You can edit them directly, but it's not recommended. Use the commands instead for safety.

Example config structure:
```json
{
  "guildId": "123456789",
  "guildName": "My Server",
  "autoMod": {
    "enabled": true,
    "blockedWords": ["word1", "word2"],
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
  }
}
```
