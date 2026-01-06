const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'warnings',
    description: 'View user warnings',
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('View user warnings')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to check warnings for (leave empty for yourself)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(message, args, client, config) {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply('❌ You need Moderate Members permission!');
        }

        const member = message.mentions.members.first() || message.member;
        const warnings = client.warnings.get(member.id) || [];

        if (warnings.length === 0) {
            return message.reply(`✅ ${member.user.tag} has no warnings.`);
        }

        const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle(`⚠️ Warnings for ${member.user.tag}`)
            .setDescription(`Total warnings: ${warnings.length}`)
            .setTimestamp();

        warnings.forEach((warn, index) => {
            embed.addFields({
                name: `Warning ${index + 1}`,
                value: `**Reason:** ${warn.reason}\n**Moderator:** <@${warn.moderator}>\n**Date:** <t:${Math.floor(warn.timestamp / 1000)}:R>`,
                inline: false
            });
        });

        message.channel.send({ embeds: [embed] });
    },
    async executeSlash(interaction, client, config) {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id);
        const warnings = client.warnings.get(user.id) || [];

        if (warnings.length === 0) {
            return interaction.reply({ content: `✅ ${user.tag} has no warnings.`, ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle(`⚠️ Warnings for ${user.tag}`)
            .setDescription(`Total warnings: ${warnings.length}`)
            .setTimestamp();

        warnings.forEach((warn, index) => {
            embed.addFields({
                name: `Warning ${index + 1}`,
                value: `**Reason:** ${warn.reason}\n**Moderator:** <@${warn.moderator}>\n**Date:** <t:${Math.floor(warn.timestamp / 1000)}:R>`,
                inline: false
            });
        });

        await interaction.reply({ embeds: [embed] });
    }
};
