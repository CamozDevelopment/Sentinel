const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Show all commands',
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show all commands'),
    
    async executeSlash(interaction, client, config) {
        const embed = new EmbedBuilder()
            .setColor('#00AAFF')
            .setTitle('📚 Sentinel - Command List')
            .setDescription('The Ultimate Discord Security Bot')
            .addFields(
                {
                    name: '🔨 Moderation Commands',
                    value: '`/ban` - Ban a user\n' +
                           '`/kick` - Kick a user\n' +
                           '`/timeout` - Timeout a user\n' +
                           '`/warn` - Warn a user\n' +
                           '`/warnings` - View warnings\n' +
                           '`/clearwarns` - Clear warnings\n' +
                           '`/purge` - Delete messages\n' +
                           '`/lock` - Lock a channel\n' +
                           '`/unlock` - Unlock a channel\n' +
                           '`/slowmode` - Set slowmode\n' +
                           '`/lockdown` - Lock all channels\n' +
                           '`/unlockdown` - Unlock all channels',
                    inline: false
                },
                {
                    name: '🌐 Global Security',
                    value: '`/globalban` - Ban user globally (Server Owners)\n' +
                           '`/appeal` - Submit global ban appeal\n' +
                           '`/reviewappeal` - Review appeals (Server Owners)\n' +
                           '`/globalbans` - Manage global bans',
                    inline: false
                },
                {
                    name: '⚙️ Server Settings',
                    value: '`/serversettings` - Configure this server\n' +
                           '`/blockedwords` - Manage blocked words\n' +
                           '`/settings` - View global settings',
                    inline: false
                },
                {
                    name: '🛡️ Protection Features',
                    value: '**Anti-Spam:** Message spam, mention spam, emoji spam, duplicate messages\n' +
                           '**Auto-Mod:** Blocked words, excessive caps, links, Discord invites\n' +
                           '**Anti-Nuke:** Channel/role deletion, mass bans/kicks, webhook spam\n' +
                           '**Per-Server Config:** Each server has independent settings',
                    inline: false
                },
                {
                    name: '📊 Utility Commands',
                    value: '`/help` - Show this message\n' +
                           '`/userinfo` - Get user information\n' +
                           '`/serverinfo` - Get server information\n' +
                           '`/botinfo` - Get bot information\n' +
                           '`/whitelist` - Manage whitelisted users',
                    inline: false
                }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
