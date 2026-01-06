const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'kick',
    description: 'Kick a user from the server',
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the kick')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async execute(message, args, client, config) {
        if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return message.reply('❌ You need Kick Members permission!');
        }

        const member = message.mentions.members.first();
        if (!member) return message.reply('❌ Please mention a user to kick!');

        if (!member.kickable) return message.reply('❌ I cannot kick this user!');

        const reason = args.slice(1).join(' ') || 'No reason provided';

        try {
            await member.kick(`${message.author.tag}: ${reason}`);
            
            const embed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('👢 User Kicked')
                .addFields(
                    { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
                    { name: 'Moderator', value: message.author.tag, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            message.reply('❌ Failed to kick user!');
        }
    },
    async executeSlash(interaction, client, config) {
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!member) {
            return interaction.reply({ content: '❌ User not found in server!', ephemeral: true });
        }

        if (!member.kickable) {
            return interaction.reply({ content: '❌ I cannot kick this user!', ephemeral: true });
        }

        try {
            await member.kick(`${interaction.user.tag}: ${reason}`);
            
            const embed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('👢 User Kicked')
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to kick user!', ephemeral: true });
        }
    }
};
