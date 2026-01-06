const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'purge',
    description: 'Delete multiple messages',
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Delete multiple messages')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(message, args, client, config) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply('❌ You need Manage Messages permission!');
        }

        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply('❌ Please provide a number between 1 and 100!');
        }

        try {
            await message.delete();
            const deleted = await message.channel.bulkDelete(amount, true);
            
            const reply = await message.channel.send(`🗑️ Successfully deleted ${deleted.size} messages.`);
            setTimeout(() => reply.delete().catch(() => {}), 5000);
        } catch (error) {
            message.channel.send('❌ Failed to delete messages! Messages older than 14 days cannot be bulk deleted.');
        }
    },
    async executeSlash(interaction, client, config) {
        const amount = interaction.options.getInteger('amount');

        try {
            const deleted = await interaction.channel.bulkDelete(amount, true);
            await interaction.reply({ content: `🗑️ Successfully deleted ${deleted.size} messages.`, ephemeral: true });
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to delete messages! Messages older than 14 days cannot be bulk deleted.', ephemeral: true });
        }
    }
};
