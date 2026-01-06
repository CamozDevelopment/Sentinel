const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'slowmode',
    description: 'Set channel slowmode',
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Set channel slowmode')
        .addIntegerOption(option =>
            option.setName('seconds')
                .setDescription('Slowmode duration in seconds (0-21600)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(21600))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(message, args, client, config) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return message.reply('❌ You need Manage Channels permission!');
        }

        const seconds = parseInt(args[0]);
        if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
            return message.reply('❌ Please provide a number between 0 and 21600 seconds!');
        }

        try {
            await message.channel.setRateLimitPerUser(seconds);

            const embed = new EmbedBuilder()
                .setColor('#00AAFF')
                .setTitle('⏱️ Slowmode Updated')
                .setDescription(`Slowmode set to ${seconds} seconds in ${message.channel}`)
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            message.reply('❌ Failed to set slowmode!');
        }
    },
    async executeSlash(interaction, client, config) {
        const seconds = interaction.options.getInteger('seconds');

        try {
            await interaction.channel.setRateLimitPerUser(seconds);

            const embed = new EmbedBuilder()
                .setColor('#00AAFF')
                .setTitle('⏱️ Slowmode Updated')
                .setDescription(`Slowmode set to ${seconds} seconds in ${interaction.channel}`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to set slowmode!', ephemeral: true });
        }
    }
};
