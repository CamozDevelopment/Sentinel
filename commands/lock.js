const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'lock',
    description: 'Lock a channel',
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Lock a channel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to lock (leave empty for current channel)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(message, args, client, config) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return message.reply('❌ You need Manage Channels permission!');
        }

        const channel = message.mentions.channels.first() || message.channel;

        try {
            await channel.permissionOverwrites.edit(message.guild.id, {
                SendMessages: false
            });

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔒 Channel Locked')
                .setDescription(`${channel} has been locked by ${message.author}`)
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            message.reply('❌ Failed to lock channel!');
        }
    },
    async executeSlash(interaction, client, config) {
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        try {
            await channel.permissionOverwrites.edit(interaction.guild.id, {
                SendMessages: false
            });

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔒 Channel Locked')
                .setDescription(`${channel} has been locked by ${interaction.user}`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to lock channel!', ephemeral: true });
        }
    }
};
