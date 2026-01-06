const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'unlockdown',
    description: 'Unlock all channels in the server',
    data: new SlashCommandBuilder()
        .setName('unlockdown')
        .setDescription('Unlock all channels in the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(message, args, client, config) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ You need Administrator permission!');
        }

        const msg = await message.reply('🔓 Unlocking all channels...');

        let unlocked = 0;
        const channels = message.guild.channels.cache.filter(c => c.isTextBased());

        for (const [id, channel] of channels) {
            try {
                await channel.permissionOverwrites.edit(message.guild.id, {
                    SendMessages: null
                });
                unlocked++;
            } catch (error) {
                console.error(`Failed to unlock ${channel.name}:`, error);
            }
        }

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🔓 Server Unlocked')
            .setDescription(`Unlocked ${unlocked}/${channels.size} channels`)
            .addFields({ name: 'Moderator', value: message.author.tag })
            .setTimestamp();

        msg.edit({ content: null, embeds: [embed] });
    },
    async executeSlash(interaction, client, config) {
        await interaction.deferReply();

        let unlocked = 0;
        const channels = interaction.guild.channels.cache.filter(c => c.isTextBased());

        for (const [id, channel] of channels) {
            try {
                await channel.permissionOverwrites.edit(interaction.guild.id, {
                    SendMessages: null
                });
                unlocked++;
            } catch (error) {
                console.error(`Failed to unlock ${channel.name}:`, error);
            }
        }

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🔓 Server Unlocked')
            .setDescription(`Unlocked ${unlocked}/${channels.size} channels`)
            .addFields({ name: 'Moderator', value: interaction.user.tag })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};
