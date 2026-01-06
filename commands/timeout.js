const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
    name: 'timeout',
    description: 'Timeout a user',
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to timeout')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Duration (e.g., 10m, 1h, 1d)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the timeout')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(message, args, client, config) {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply('❌ You need Moderate Members permission!');
        }

        const member = message.mentions.members.first();
        if (!member) return message.reply('❌ Please mention a user to timeout!');

        const duration = args[1];
        if (!duration) return message.reply('❌ Please specify a duration! (e.g., 10m, 1h, 1d)');

        const time = ms(duration);
        if (!time || time > 2419200000) return message.reply('❌ Invalid duration! Maximum is 28 days.');

        const reason = args.slice(2).join(' ') || 'No reason provided';

        try {
            await member.timeout(time, `${message.author.tag}: ${reason}`);
            
            const embed = new EmbedBuilder()
                .setColor('#FFFF00')
                .setTitle('⏱️ User Timed Out')
                .addFields(
                    { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
                    { name: 'Duration', value: duration, inline: true },
                    { name: 'Moderator', value: message.author.tag, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            message.reply('❌ Failed to timeout user!');
        }
    },
    async executeSlash(interaction, client, config) {
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);
        const duration = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!member) {
            return interaction.reply({ content: '❌ User not found in server!', ephemeral: true });
        }

        const time = ms(duration);
        if (!time || time > 2419200000) {
            return interaction.reply({ content: '❌ Invalid duration! Maximum is 28 days.', ephemeral: true });
        }

        try {
            await member.timeout(time, `${interaction.user.tag}: ${reason}`);
            
            const embed = new EmbedBuilder()
                .setColor('#FFFF00')
                .setTitle('⏱️ User Timed Out')
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Duration', value: duration, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to timeout user!', ephemeral: true });
        }
    }
};
