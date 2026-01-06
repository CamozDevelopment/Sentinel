# Global Ban System Documentation

## Overview
The global ban system allows bot administrators to ban users across all servers the bot is in, with an integrated appeal system using Discord modals.

## Features
- ✅ Ban users globally across all servers
- ✅ Three punishment types: Ban, Kick, or Clear Roles
- ✅ Appeal system with Discord forms (modals)
- ✅ Automatic server invites when appeals are accepted
- ✅ Manage and review global bans

## Setup

### 1. Configuration
Update your `config.json` with the global ban settings:
```json
"globalBan": {
  "enabled": true,
  "defaultPunishment": "ban",
  "appealChannelId": "YOUR_CHANNEL_ID",
  "logChannelId": "YOUR_LOG_CHANNEL_ID"
}
```

- `appealChannelId`: (Optional) Channel ID where appeal notifications will be sent
- `logChannelId`: (Optional) Channel ID for logging global ban actions

### 2. Deploy Commands
Run the deploy script to register the new slash commands:
```bash
node deploy-commands.js
```

## Commands

### `/globalban`
**Permission Required:** Server Owner (any server the bot is in)  
**Description:** Ban a user globally across all servers

**Options:**
- `user` - The user to globally ban
- `reason` - Reason for the ban (e.g., "stealing mods", "leaking")
- `punishment` - Choose from:
  - `Ban` - Permanently ban from all servers
  - `Kick` - Kick from all servers
  - `Clear Roles` - Remove all roles from the user

**Example:**
```
/globalban user:@BadUser reason:Stealing moderators punishment:Ban
```

### `/appeal`
**Permission Required:** None (but must be globally banned)  
**Description:** Submit an appeal for your global ban

Opens a Discord modal form with the following fields:
1. Why should we accept your appeal? (Required, 50-1000 characters)
2. What have you learned from this? (Required, 30-500 characters)
3. Will you repeat this behavior? (Required, max 10 characters)
4. Additional Information (Optional, max 500 characters)

**Example:**
```
/appeal
```

### `/reviewappeal`
**Permission Required:** Server Owner (any server the bot is in)  
**Description:** Review and manage pending appeals

**Options:**
- `userid` - (Optional) Specific user ID to review

**Examples:**
```
/reviewappeal                    # List all pending appeals
/reviewappeal userid:123456789   # Review specific appeal
```

When reviewing a specific appeal, you'll see buttons to:
- ✅ **Accept Appeal** - Unbans user and sends server invites
- ❌ **Deny Appeal** - Keeps the ban active

### `/globalbans`
**Permission Required:** Administrator  
**Description:** Manage and view global bans

**Subcommands:**

#### `/globalbans list`
Lists all active global bans

#### `/globalbans check`
Check if a specific user is globally banned
- `user` - The user to check

#### `/globalbans remove`
Remove a global ban (Server Owners Only)
- `user` - The user to unban

## Appeal Process Flow

1. **User Submits Appeal**
   - User runs `/appeal` command
   - Fills out the Discord modal form
   - Appeal is saved as "pending"
   - Optional: Notification sent to appeal channel

2. **Admin Reviews Appeal**
   - Admin runs `/reviewappeal`
   - Views list of pending appeals
   - Reviews specific appeal with `/reviewappeal userid:<user_id>`
   - Sees detailed information about the ban and appeal

3. **Decision**
   
   **If Accepted:**
   - User is unbanned from all affected servers
   - Server invites are automatically created
   - User receives DM with invite links
   - Global ban is removed from database
   - Invites expire in 7 days and are single-use
   
   **If Denied:**
   - Appeal status is updated to "denied"
   - User receives DM notification
   - Global ban remains active

## Data Storage

All data is stored in `globalBans.json`:

```json
{
  "bans": {
    "userId": {
      "userId": "123456789",
      "username": "User#1234",
      "reason": "Stealing moderators",
      "punishment": "ban",
      "bannedBy": "ownerId",
      "bannedByTag": "Owner#0001",
      "timestamp": 1234567890,
      "affectedGuilds": [
        {
          "guildId": "987654321",
          "guildName": "Server Name",
          "punishment": "ban"
        }
      ]
    }
  },
  "appeals": {
    "userId": {
      "userId": "123456789",
      "username": "User#1234",
      "whyAppeal": "...",
      "whatLearned": "...",
      "willRepeat": "No",
      "additionalInfo": "...",
      "status": "pending",
      "timestamp": 1234567890
    }
  }
}
```

## Punishment Types

### Ban
- Permanently bans the user from all servers
- User cannot rejoin unless unbanned
- Most severe punishment

### Kick
- Removes user from all servers
- User can rejoin if they have an invite
- Moderate punishment

### Clear Roles
- Removes all roles from the user in all servers
- User remains in servers but loses permissions
- Lightest punishment option

## Security Features

- Only server owners (of servers the bot is in) can issue global bans
- Only server owners can review and manage appeals
- Banned users are notified via DM
- All actions are timestamped and logged
- Affected servers are tracked per ban

## Notifications

### User Notifications (DM)
- When globally banned
- When appeal is accepted
- When appeal is denied
- When ban is manually removed

### Admin Notifications
- New appeal submitted (if appeal channel configured)
- Configurable logging channel for all actions

## Best Practices

1. **Always provide detailed reasons** for global bans
2. **Review appeals thoroughly** before making decisions
3. **Set up an appeal channel** for better tracking
4. **Regularly check** `/globalbans list` to review active bans
5. **Document your decisions** when reviewing appeals

## Troubleshooting

### User didn't receive DM
- User may have DMs disabled
- Bot may be blocked by user
- Check bot's DM permissions

### Invites not working
- Ensure bot has "Create Instant Invite" permission
- Check if server has invite creation disabled
- Verify bot has access to at least one text channel

### Command not appearing
- Ensure commands are deployed with `node deploy-commands.js`
- Check bot has application.commands scope
- Wait a few minutes for Discord to update commands

## Notes

- Global bans affect **all servers** the bot is in
- Appeals can only be submitted once per ban
- Server invites are single-use and expire in 7 days
- The bot must have appropriate permissions in all servers to apply punishments
