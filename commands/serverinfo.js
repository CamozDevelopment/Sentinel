const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'serverinfo',
    description: 'Get server information',
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Get server information'),
    async execute(message, args, client, config) {
        const guild = message.guild;

        const channels = guild.channels.cache;
        const members = guild.members.cache;
        const roles = guild.roles.cache;

        const embed = new EmbedBuilder()
            .setColor('#00AAFF')
            .setTitle(`📊 Server Information`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: 'Server Name', value: guild.name, inline: true },
                { name: 'Server ID', value: guild.id, inline: true },
                { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
                { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
                { name: 'Members', value: `${members.size}`, inline: true },
                { name: 'Bots', value: `${members.filter(m => m.user.bot).size}`, inline: true },
                { name: 'Channels', value: `${channels.size}`, inline: true },
                { name: 'Roles', value: `${roles.size}`, inline: true },
                { name: 'Boost Tier', value: `Level ${guild.premiumTier}`, inline: true },
                { name: 'Boosts', value: `${guild.premiumSubscriptionCount || 0}`, inline: true },
                { name: 'Verification Level', value: guild.verificationLevel.toString(), inline: true }
            )
            .setTimestamp();

        if (guild.description) {
            embed.setDescription(guild.description);
        }

        message.channel.send({ embeds: [embed] });
    },
    async executeSlash(interaction, client, config) {
        const guild = interaction.guild;

        const channels = guild.channels.cache;
        const members = guild.members.cache;
        const roles = guild.roles.cache;

        const embed = new EmbedBuilder()
            .setColor('#00AAFF')
            .setTitle(`📊 Server Information`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: 'Server Name', value: guild.name, inline: true },
                { name: 'Server ID', value: guild.id, inline: true },
                { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
                { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
                { name: 'Members', value: `${members.size}`, inline: true },
                { name: 'Bots', value: `${members.filter(m => m.user.bot).size}`, inline: true },
                { name: 'Channels', value: `${channels.size}`, inline: true },
                { name: 'Roles', value: `${roles.size}`, inline: true },
                { name: 'Boost Tier', value: `Level ${guild.premiumTier}`, inline: true },
                { name: 'Boosts', value: `${guild.premiumSubscriptionCount || 0}`, inline: true },
                { name: 'Verification Level', value: guild.verificationLevel.toString(), inline: true }
            )
            .setTimestamp();

        if (guild.description) {
            embed.setDescription(guild.description);
        }

        await interaction.reply({ embeds: [embed] });
    }
};
