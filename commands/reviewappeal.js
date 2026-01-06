const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
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
    name: 'reviewappeal',
    description: 'Review pending global ban appeals',
    data: new SlashCommandBuilder()
        .setName('reviewappeal')
        .setDescription('Review pending global ban appeals')
        .addStringOption(option =>
            option.setName('userid')
                .setDescription('The user ID of the appeal to review')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async executeSlash(interaction, client, config) {
        // Check if user is owner of any server the bot is in
        const isServerOwner = client.guilds.cache.some(guild => guild.ownerId === interaction.user.id);
        
        if (!isServerOwner) {
            return interaction.reply({ content: '❌ Only server owners can review appeals!', ephemeral: true });
        }

        const globalBansData = loadGlobalBans();
        const userId = interaction.options.getString('userid');

        // If specific user ID provided, show that appeal
        if (userId) {
            const appeal = globalBansData.appeals[userId];
            const ban = globalBansData.bans[userId];

            if (!appeal) {
                return interaction.reply({ content: '❌ No appeal found for this user!', ephemeral: true });
            }

            if (appeal.status !== 'pending') {
                return interaction.reply({ 
                    content: `❌ This appeal has already been ${appeal.status}!`, 
                    ephemeral: true 
                });
            }

            // Create detailed appeal embed
            const embed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('📋 Global Ban Appeal Review')
                .addFields(
                    { name: '👤 User', value: `<@${userId}> (${userId})`, inline: true },
                    { name: '📅 Appeal Date', value: `<t:${Math.floor(appeal.timestamp / 1000)}:F>`, inline: true },
                    { name: '\u200B', value: '\u200B', inline: true },
                    { name: '📝 Original Ban Reason', value: ban ? ban.reason : 'Unknown', inline: false },
                    { name: '⚡ Punishment Type', value: ban ? ban.punishment.replace('_', ' ').toUpperCase() : 'Unknown', inline: true },
                    { name: '🗓️ Ban Date', value: ban ? `<t:${Math.floor(ban.timestamp / 1000)}:F>` : 'Unknown', inline: true },
                    { name: '\u200B', value: '\u200B', inline: true },
                    { name: '💭 Why Accept Appeal?', value: appeal.whyAppeal || 'N/A', inline: false },
                    { name: '📚 What They Learned', value: appeal.whatLearned || 'N/A', inline: false },
                    { name: '🔄 Will Repeat?', value: appeal.willRepeat || 'N/A', inline: true }
                );

            if (appeal.additionalInfo) {
                embed.addFields({ name: 'ℹ️ Additional Info', value: appeal.additionalInfo, inline: false });
            }

            if (ban && ban.affectedGuilds && ban.affectedGuilds.length > 0) {
                const guilds = ban.affectedGuilds.slice(0, 5).map(g => g.guildName).join(', ');
                embed.addFields({ 
                    name: '🗂️ Affected Servers', 
                    value: guilds + (ban.affectedGuilds.length > 5 ? ` (+${ban.affectedGuilds.length - 5} more)` : '') 
                });
            }

            // Create action buttons
            const acceptButton = new ButtonBuilder()
                .setCustomId(`accept_appeal_${userId}`)
                .setLabel('✅ Accept Appeal')
                .setStyle(ButtonStyle.Success);

            const denyButton = new ButtonBuilder()
                .setCustomId(`deny_appeal_${userId}`)
                .setLabel('❌ Deny Appeal')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(acceptButton, denyButton);

            await interaction.reply({ embeds: [embed], components: [row] });

        } else {
            // List all pending appeals
            const pendingAppeals = Object.entries(globalBansData.appeals)
                .filter(([_, appeal]) => appeal.status === 'pending')
                .map(([userId, appeal]) => {
                    return `<@${userId}> (${userId}) - Submitted <t:${Math.floor(appeal.timestamp / 1000)}:R>`;
                });

            if (pendingAppeals.length === 0) {
                return interaction.reply({ content: '✅ No pending appeals!', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('📋 Pending Appeals')
                .setDescription(pendingAppeals.join('\n'))
                .setFooter({ text: `Use /reviewappeal userid:<user_id> to review specific appeals` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    }
};
