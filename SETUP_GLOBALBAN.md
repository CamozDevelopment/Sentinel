# Quick Setup Guide for Global Ban System

## Step 1: Update Config
Open `config.json` and ensure you have set your bot owner ID (optional, for other features):
```json
{
  "ownerId": "YOUR_USER_ID_HERE"
}
```

**Note:** For global bans, any server owner (of servers where the bot is in) can issue global bans and review appeals.

The global ban settings are already added. Optionally, add channel IDs for notifications:
```json
"globalBan": {
  "enabled": true,
  "defaultPunishment": "ban",
  "appealChannelId": "CHANNEL_ID_FOR_APPEAL_NOTIFICATIONS",
  "logChannelId": "CHANNEL_ID_FOR_LOGGING"
}
```

## Step 2: Deploy Commands
Run this command to register all slash commands with Discord:
```bash
node deploy-commands.js
```

## Step 3: Start Your Bot
```bash
node index.js
```

## Step 4: Test the System

### Test Global Ban
```
/globalban user:@TestUser reason:Testing the system punishment:Ban
```

### Test Appeal (as the banned user)
```
/appeal
```
Fill out the form that appears.

### Test Review Appeal (as bot owner)
```
/reviewappeal
```
You'll see the pending appeal, then:
```
/reviewappeal userid:USER_ID_HERE
```
Click Accept or Deny buttons.

### Check Ban Status
```
/globalbans list
/globalbans check user:@TestUser
```

### Remove Ban
```
/globalbans remove user:@TestUser
```

## Important Notes

1. **Server Owner Commands:**
   - `/globalban` - Any server owner where bot is in
   - `/reviewappeal` - Any server owner where bot is in
   - `/globalbans remove` - Any server owner where bot is in

2. **Anyone Can Use:**
   - `/appeal` (only if globally banned)

3. **Admin Commands:**
   - `/globalbans list`
   - `/globalbans check`

## Required Bot Permissions

Make sure your bot has these permissions in all servers:
- Ban Members (for ban punishment)
- Kick Members (for kick punishment)
- Manage Roles (for clear roles punishment)
- Create Instant Invite (for appeal acceptance)
- Send Messages
- Embed Links

## Files Created

- ✅ `globalBans.json` - Data storage
- ✅ `commands/globalban.js` - Main ban command
- ✅ `commands/appeal.js` - Appeal submission
- ✅ `commands/reviewappeal.js` - Review appeals
- ✅ `commands/globalbans.js` - Manage bans
- ✅ Updated `index.js` - Modal and button handlers
- ✅ Updated `config.json` - Settings

## Next Steps

1. Optional: Set your owner ID in config.json (for other bot features)
2. Optional: Set appeal and log channel IDs
3. Deploy commands with `node deploy-commands.js`
4. Restart your bot with `node index.js`
5. Any server owner can now use global ban commands!

Need help? Check `GLOBALBAN_README.md` for full documentation.
