const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'clearwarns',
    description: 'Clear user warnings',
    data: new SlashCommandBuilder()
        .setName('clearwarns')
        .setDescription('Clear user warnings')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to clear warnings for')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(message, args, client, config) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ You need Administrator permission!');
        }

        const member = message.mentions.members.first();
        if (!member) return message.reply('❌ Please mention a user!');

        client.warnings.delete(member.id);

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ Warnings Cleared')
            .setDescription(`Cleared all warnings for ${member.user.tag}`)
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    },
    async executeSlash(interaction, client, config) {
        const user = interaction.options.getUser('user');

        client.warnings.delete(user.id);

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ Warnings Cleared')
            .setDescription(`Cleared all warnings for ${user.tag}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
