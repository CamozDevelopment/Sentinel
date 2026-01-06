const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'unlock',
    description: 'Unlock a channel',
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlock a channel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to unlock (leave empty for current channel)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(message, args, client, config) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return message.reply('❌ You need Manage Channels permission!');
        }

        const channel = message.mentions.channels.first() || message.channel;

        try {
            await channel.permissionOverwrites.edit(message.guild.id, {
                SendMessages: null
            });

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🔓 Channel Unlocked')
                .setDescription(`${channel} has been unlocked by ${message.author}`)
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            message.reply('❌ Failed to unlock channel!');
        }
    },
    async executeSlash(interaction, client, config) {
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        try {
            await channel.permissionOverwrites.edit(interaction.guild.id, {
                SendMessages: null
            });

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🔓 Channel Unlocked')
                .setDescription(`${channel} has been unlocked by ${interaction.user}`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to unlock channel!', ephemeral: true });
        }
    }
};
