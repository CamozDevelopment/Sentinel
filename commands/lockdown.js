const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'lockdown',
    description: 'Lock all channels in the server',
    data: new SlashCommandBuilder()
        .setName('lockdown')
        .setDescription('Lock all channels in the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(message, args, client, config) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ You need Administrator permission!');
        }

        const msg = await message.reply('🔒 Locking down all channels...');

        let locked = 0;
        const channels = message.guild.channels.cache.filter(c => c.isTextBased());

        for (const [id, channel] of channels) {
            try {
                await channel.permissionOverwrites.edit(message.guild.id, {
                    SendMessages: false
                });
                locked++;
            } catch (error) {
                console.error(`Failed to lock ${channel.name}:`, error);
            }
        }

        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('🔒 Server Lockdown')
            .setDescription(`Locked ${locked}/${channels.size} channels`)
            .addFields({ name: 'Moderator', value: message.author.tag })
            .setTimestamp();

        msg.edit({ content: null, embeds: [embed] });
    },
    async executeSlash(interaction, client, config) {
        await interaction.deferReply();

        let locked = 0;
        const channels = interaction.guild.channels.cache.filter(c => c.isTextBased());

        for (const [id, channel] of channels) {
            try {
                await channel.permissionOverwrites.edit(interaction.guild.id, {
                    SendMessages: false
                });
                locked++;
            } catch (error) {
                console.error(`Failed to lock ${channel.name}:`, error);
            }
        }

        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('🔒 Server Lockdown')
            .setDescription(`Locked ${locked}/${channels.size} channels`)
            .addFields({ name: 'Moderator', value: interaction.user.tag })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};
