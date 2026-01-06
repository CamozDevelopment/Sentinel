const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const globalBansPath = path.join(__dirname, '..', 'globalBans.json');

function loadGlobalBans() {
    if (!fs.existsSync(globalBansPath)) {
        fs.writeFileSync(globalBansPath, JSON.stringify({ bans: {}, appeals: {} }, null, 2));
    }
    return JSON.parse(fs.readFileSync(globalBansPath, 'utf-8'));
}

function saveGlobalBans(data) {
    fs.writeFileSync(globalBansPath, JSON.stringify(data, null, 2));
}

module.exports = {
    name: 'globalbans',
    description: 'Manage and view global bans',
    data: new SlashCommandBuilder()
        .setName('globalbans')
        .setDescription('Manage and view global bans')
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all active global bans'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('check')
                .setDescription('Check if a user is globally banned')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to check')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a global ban')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to unban')
                        .setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async executeSlash(interaction, client, config) {
        const subcommand = interaction.options.getSubcommand();
        const globalBansData = loadGlobalBans();

        if (subcommand === 'list') {
            const bans = Object.values(globalBansData.bans);

            if (bans.length === 0) {
                return interaction.reply({ content: '✅ No active global bans!', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🌐 Active Global Bans')
                .setDescription(`Total: ${bans.length} user(s)`)
                .setTimestamp();

            const banList = bans.slice(0, 10).map(ban => {
                return `**${ban.username}** (${ban.userId})\n` +
                       `└ Reason: ${ban.reason}\n` +
                       `└ Type: ${ban.punishment.replace('_', ' ').toUpperCase()}\n` +
                       `└ By: ${ban.bannedByTag}\n` +
                       `└ Date: <t:${Math.floor(ban.timestamp / 1000)}:R>`;
            }).join('\n\n');

            embed.addFields({ name: 'Banned Users', value: banList });

            if (bans.length > 10) {
                embed.setFooter({ text: `Showing 10 of ${bans.length} bans` });
            }

            await interaction.reply({ embeds: [embed], ephemeral: true });

        } else if (subcommand === 'check') {
            const user = interaction.options.getUser('user');
            const ban = globalBansData.bans[user.id];

            if (!ban) {
                return interaction.reply({ content: `✅ ${user.tag} is not globally banned.`, ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔍 Global Ban Information')
                .addFields(
                    { name: '👤 User', value: `${ban.username} (${ban.userId})`, inline: true },
                    { name: '⚡ Punishment', value: ban.punishment.replace('_', ' ').toUpperCase(), inline: true },
                    { name: '👮 Banned By', value: ban.bannedByTag, inline: true },
                    { name: '📝 Reason', value: ban.reason },
                    { name: '📅 Date', value: `<t:${Math.floor(ban.timestamp / 1000)}:F>` },
                    { name: '🗂️ Affected Servers', value: ban.affectedGuilds.length.toString(), inline: true }
                )
                .setTimestamp();

            if (ban.affectedGuilds.length > 0) {
                const guilds = ban.affectedGuilds.slice(0, 5).map(g => g.guildName).join(', ');
                embed.addFields({ 
                    name: 'Server List', 
                    value: guilds + (ban.affectedGuilds.length > 5 ? ` (+${ban.affectedGuilds.length - 5} more)` : '') 
                });
            }

            // Check for appeal
            const appeal = globalBansData.appeals[user.id];
            if (appeal) {
                embed.addFields({ 
                    name: '📋 Appeal Status', 
                    value: appeal.status.toUpperCase(), 
                    inline: true 
                });
            }

            await interaction.reply({ embeds: [embed], ephemeral: true });

        } else if (subcommand === 'remove') {
            // Check if user is owner of any server the bot is in
            const isServerOwner = client.guilds.cache.some(guild => guild.ownerId === interaction.user.id);
            
            if (!isServerOwner) {
                return interaction.reply({ content: '❌ Only server owners can remove global bans!', ephemeral: true });
            }

            const user = interaction.options.getUser('user');
            const ban = globalBansData.bans[user.id];

            if (!ban) {
                return interaction.reply({ content: `❌ ${user.tag} is not globally banned.`, ephemeral: true });
            }

            await interaction.deferReply();

            // Remove ban from all guilds
            let unbannedCount = 0;
            for (const guildData of ban.affectedGuilds) {
                try {
                    const guild = await client.guilds.fetch(guildData.guildId);
                    
                    if (guildData.punishment === 'ban') {
                        try {
                            await guild.bans.remove(user.id, `Global ban removed by ${interaction.user.tag}`);
                            unbannedCount++;
                        } catch (err) {
                            console.log(`Could not unban user from ${guild.name}`);
                        }
                    }
                } catch (error) {
                    console.error(`Failed to process guild ${guildData.guildId}`);
                }
            }

            // Remove from database
            delete globalBansData.bans[user.id];
            if (globalBansData.appeals[user.id]) {
                globalBansData.appeals[user.id].status = 'removed';
            }
            saveGlobalBans(globalBansData);

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Global Ban Removed')
                .addFields(
                    { name: '👤 User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: '👮 Removed By', value: interaction.user.tag, inline: true },
                    { name: '🔓 Unbanned From', value: `${unbannedCount} server(s)`, inline: true }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            // Notify user
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('🔓 Global Ban Removed')
                    .setDescription('Your global ban has been removed by an administrator.')
                    .setTimestamp();

                await user.send({ embeds: [dmEmbed] });
            } catch (error) {
                console.log('Could not DM user about ban removal');
            }
        }
    }
};
