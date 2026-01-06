const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'settings',
    description: 'View and modify global bot settings',
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('View and modify global bot settings')
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View current global bot settings'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('antinuke')
                .setDescription('Toggle anti-nuke protection')
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Enable or disable anti-nuke')
                        .setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async executeSlash(interaction, client, config) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'view') {
            const embed = new EmbedBuilder()
                .setColor('#00AAFF')
                .setTitle('⚙️ Global Bot Settings')
                .setDescription('**Note:** Auto-mod and anti-spam are controlled per-server. Use `/serversettings` for those.')
                .addFields(
                    { name: 'Anti-Nuke', value: config.antiNuke.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
                    { name: '\u200B', value: '\u200B', inline: true },
                    { name: '\u200B', value: '\u200B', inline: true },
                    {
                        name: 'Anti-Nuke Limits',
                        value: `Max Channel Deletes: ${config.antiNuke.maxChannelDeletes}\nMax Role Deletes: ${config.antiNuke.maxRoleDeletes}\nMax Bans: ${config.antiNuke.maxBans}\nMax Kicks: ${config.antiNuke.maxKicks}`,
                        inline: false
                    },
                    {
                        name: 'Whitelisted Users',
                        value: config.whitelist && config.whitelist.length > 0 
                            ? config.whitelist.map(id => `<@${id}>`).join(', ')
                            : 'None',
                        inline: false
                    },
                    {
                        name: '📋 Server-Specific Settings',
                        value: 'Use `/serversettings view` to see this server\'s auto-mod and anti-spam settings.\nUse `/blockedwords` to manage blocked words for this server.',
                        inline: false
                    }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'antinuke') {
            const enabled = interaction.options.getBoolean('enabled');
            config.antiNuke.enabled = enabled;
            saveConfig(config);
            return interaction.reply(`✅ Anti-Nuke ${enabled ? 'enabled' : 'disabled'}`);
        }
    }
};

function saveConfig(config) {
    try {
        fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
    } catch (error) {
        console.error('Failed to save config:', error);
    }
}
