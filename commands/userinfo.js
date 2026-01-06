const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'userinfo',
    description: 'Get user information',
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Get user information')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to get information about (leave empty for yourself)')
                .setRequired(false)),
    async execute(message, args, client, config) {
        const member = message.mentions.members.first() || message.member;
        const user = member.user;

        const roles = member.roles.cache
            .filter(role => role.id !== message.guild.id)
            .sort((a, b) => b.position - a.position)
            .map(role => role.toString())
            .slice(0, 10);

        const embed = new EmbedBuilder()
            .setColor(member.displayHexColor || '#00AAFF')
            .setTitle(`📋 User Information`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Username', value: user.tag, inline: true },
                { name: 'ID', value: user.id, inline: true },
                { name: 'Nickname', value: member.nickname || 'None', inline: true },
                { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: 'Bot', value: user.bot ? 'Yes' : 'No', inline: true },
                { name: `Roles [${member.roles.cache.size - 1}]`, value: roles.length ? roles.join(', ') : 'None', inline: false }
            )
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    },
    async executeSlash(interaction, client, config) {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return interaction.reply({ content: '❌ User not found in server!', ephemeral: true });
        }

        const roles = member.roles.cache
            .filter(role => role.id !== interaction.guild.id)
            .sort((a, b) => b.position - a.position)
            .map(role => role.toString())
            .slice(0, 10);

        const embed = new EmbedBuilder()
            .setColor(member.displayHexColor || '#00AAFF')
            .setTitle(`📋 User Information`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Username', value: user.tag, inline: true },
                { name: 'ID', value: user.id, inline: true },
                { name: 'Nickname', value: member.nickname || 'None', inline: true },
                { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: 'Bot', value: user.bot ? 'Yes' : 'No', inline: true },
                { name: `Roles [${member.roles.cache.size - 1}]`, value: roles.length ? roles.join(', ') : 'None', inline: false }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
