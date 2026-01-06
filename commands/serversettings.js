const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const serverConfig = require('../utils/serverConfig');

module.exports = {
    name: 'serversettings',
    description: 'Manage server-specific bot settings',
    data: new SlashCommandBuilder()
        .setName('serversettings')
        .setDescription('Manage server-specific bot settings')
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View current server settings'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('automod')
                .setDescription('Toggle auto-moderation')
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Enable or disable auto-moderation')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('antispam')
                .setDescription('Toggle anti-spam')
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Enable or disable anti-spam')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('antinuke')
                .setDescription('Toggle anti-nuke protection')
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Enable or disable anti-nuke')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('blocklinks')
                .setDescription('Toggle link blocking')
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Block all links')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('blockinvites')
                .setDescription('Toggle Discord invite blocking')
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Block Discord invites')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('capslimit')
                .setDescription('Set caps lock percentage limit')
                .addIntegerOption(option =>
                    option.setName('percent')
                        .setDescription('Maximum caps percentage (0-100)')
                        .setRequired(true)
                        .setMinValue(0)
                        .setMaxValue(100)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('spamsettings')
                .setDescription('Configure spam detection')
                .addIntegerOption(option =>
                    option.setName('maxmessages')
                        .setDescription('Max messages in time window')
                        .setRequired(false)
                        .setMinValue(2)
                        .setMaxValue(20))
                .addIntegerOption(option =>
                    option.setName('timewindow')
                        .setDescription('Time window in seconds')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(60)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async executeSlash(interaction, client, config) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({ content: '❌ You need Manage Server permission!', ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        const guildName = interaction.guild.name;

        if (subcommand === 'view') {
            const serverCfg = serverConfig.loadServerConfig(guildId, guildName);
            
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`⚙️ Server Settings - ${interaction.guild.name}`)
                .addFields(
                    { 
                        name: '🤖 Auto-Moderation', 
                        value: serverCfg.autoMod.enabled ? '✅ Enabled' : '❌ Disabled',
                        inline: true 
                    },
                    { 
                        name: '🚫 Anti-Spam', 
                        value: serverCfg.antiSpam.enabled ? '✅ Enabled' : '❌ Disabled',
                        inline: true 
                    },
                    { 
                        name: '🛡️ Anti-Nuke', 
                        value: serverCfg.antiNuke.enabled ? '✅ Enabled' : '❌ Disabled',
                        inline: true 
                    },
                    { name: '\u200B', value: '\u200B', inline: true },
                    { 
                        name: '🔗 Block Links', 
                        value: serverCfg.autoMod.blockLinks ? '✅ Yes' : '❌ No',
                        inline: true 
                    },
                    { 
                        name: '📨 Block Invites', 
                        value: serverCfg.autoMod.blockInvites ? '✅ Yes' : '❌ No',
                        inline: true 
                    },
                    { 
                        name: '🔠 Caps Limit', 
                        value: `${serverCfg.autoMod.maxCapsPercent}%`,
                        inline: true 
                    },
                    {
                        name: '📊 Spam Settings',
                        value: `Max Messages: ${serverCfg.antiSpam.maxMessages}\n` +
                               `Time Window: ${serverCfg.antiSpam.timeWindow / 1000}s\n` +
                               `Max Duplicates: ${serverCfg.antiSpam.maxDuplicates}\n` +
                               `Max Mentions: ${serverCfg.antiSpam.maxMentions}`,
                        inline: false
                    },
                    {
                        name: '🛡️ Anti-Nuke Limits',
                        value: `Max Channel Deletes: ${serverCfg.antiNuke.maxChannelDeletes}\n` +
                               `Max Role Deletes: ${serverCfg.antiNuke.maxRoleDeletes}\n` +
                               `Max Bans: ${serverCfg.antiNuke.maxBans}\n` +
                               `Max Kicks: ${serverCfg.antiNuke.maxKicks}`,
                        inline: false
                    },
                    {
                        name: '🚷 Blocked Words',
                        value: serverCfg.autoMod.blockedWords.length > 0 
                            ? `${serverCfg.autoMod.blockedWords.length} words blocked\nUse \`/blockedwords list\` to view`
                            : 'None',
                        inline: false
                    }
                )
                .setFooter({ text: 'Use /serversettings <setting> to modify' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });

        } else if (subcommand === 'automod') {
            const enabled = interaction.options.getBoolean('enabled');
            serverConfig.updateServerSetting(guildId, 'autoMod.enabled', enabled);
            
            await interaction.reply({
                content: `✅ Auto-moderation ${enabled ? 'enabled' : 'disabled'} for this server!`,
                ephemeral: true
            });

        } else if (subcommand === 'antispam') {
            const enabled = interaction.options.getBoolean('enabled');
            serverConfig.updateServerSetting(guildId, 'antiSpam.enabled', enabled);
            
            await interaction.reply({
                content: `✅ Anti-spam ${enabled ? 'enabled' : 'disabled'} for this server!`,
                ephemeral: true
            });

        } else if (subcommand === 'antinuke') {
            const enabled = interaction.options.getBoolean('enabled');
            serverConfig.updateServerSetting(guildId, 'antiNuke.enabled', enabled);
            
            await interaction.reply({
                content: `✅ Anti-nuke ${enabled ? 'enabled' : 'disabled'} for this server!`,
                ephemeral: true
            });

        } else if (subcommand === 'blocklinks') {
            const enabled = interaction.options.getBoolean('enabled');
            serverConfig.updateServerSetting(guildId, 'autoMod.blockLinks', enabled);
            
            await interaction.reply({
                content: `✅ Link blocking ${enabled ? 'enabled' : 'disabled'} for this server!`,
                ephemeral: true
            });

        } else if (subcommand === 'blockinvites') {
            const enabled = interaction.options.getBoolean('enabled');
            serverConfig.updateServerSetting(guildId, 'autoMod.blockInvites', enabled);
            
            await interaction.reply({
                content: `✅ Invite blocking ${enabled ? 'enabled' : 'disabled'} for this server!`,
                ephemeral: true
            });

        } else if (subcommand === 'capslimit') {
            const percent = interaction.options.getInteger('percent');
            serverConfig.updateServerSetting(guildId, 'autoMod.maxCapsPercent', percent);
            
            await interaction.reply({
                content: `✅ Caps lock limit set to ${percent}% for this server!`,
                ephemeral: true
            });

        } else if (subcommand === 'spamsettings') {
            const maxMessages = interaction.options.getInteger('maxmessages');
            const timeWindow = interaction.options.getInteger('timewindow');
            
            if (maxMessages) {
                serverConfig.updateServerSetting(guildId, 'antiSpam.maxMessages', maxMessages);
            }
            if (timeWindow) {
                serverConfig.updateServerSetting(guildId, 'antiSpam.timeWindow', timeWindow * 1000);
            }

            const updates = [];
            if (maxMessages) updates.push(`Max messages: ${maxMessages}`);
            if (timeWindow) updates.push(`Time window: ${timeWindow}s`);
            
            await interaction.reply({
                content: `✅ Spam settings updated!\n${updates.join('\n')}`,
                ephemeral: true
            });
        }
    }
};
