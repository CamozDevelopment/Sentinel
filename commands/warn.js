const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'warn',
    description: 'Warn a user',
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to warn')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the warning')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(message, args, client, config) {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply('❌ You need Moderate Members permission!');
        }

        const member = message.mentions.members.first();
        if (!member) return message.reply('❌ Please mention a user to warn!');

        const reason = args.slice(1).join(' ') || 'No reason provided';

        // Store warning
        if (!client.warnings.has(member.id)) {
            client.warnings.set(member.id, []);
        }
        
        const warnings = client.warnings.get(member.id);
        warnings.push({
            moderator: message.author.id,
            reason: reason,
            timestamp: Date.now()
        });

        const embed = new EmbedBuilder()
            .setColor('#FFAA00')
            .setTitle('⚠️ User Warned')
            .addFields(
                { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
                { name: 'Warnings', value: `${warnings.length}`, inline: true },
                { name: 'Moderator', value: message.author.tag, inline: true },
                { name: 'Reason', value: reason }
            )
            .setTimestamp();

        message.channel.send({ embeds: [embed] });

        // Auto-timeout after 3 warnings
        if (warnings.length >= 3) {
            try {
                await member.timeout(3600000, 'Automatic timeout: 3 warnings reached');
                message.channel.send(`⏱️ ${member.user.tag} has been automatically timed out for 1 hour (3 warnings).`);
            } catch (error) {
                console.error('Failed to auto-timeout user:', error);
            }
        }
    },
    async executeSlash(interaction, client, config) {
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!member) {
            return interaction.reply({ content: '❌ User not found in server!', ephemeral: true });
        }

        if (!client.warnings.has(member.id)) {
            client.warnings.set(member.id, []);
        }
        
        const warnings = client.warnings.get(member.id);
        warnings.push({
            moderator: interaction.user.id,
            reason: reason,
            timestamp: Date.now()
        });

        const embed = new EmbedBuilder()
            .setColor('#FFAA00')
            .setTitle('⚠️ User Warned')
            .addFields(
                { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                { name: 'Warnings', value: `${warnings.length}`, inline: true },
                { name: 'Moderator', value: interaction.user.tag, inline: true },
                { name: 'Reason', value: reason }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        if (warnings.length >= 3) {
            try {
                await member.timeout(3600000, 'Automatic timeout: 3 warnings reached');
                await interaction.followUp(`⏱️ ${user.tag} has been automatically timed out for 1 hour (3 warnings).`);
            } catch (error) {
                console.error('Failed to auto-timeout user:', error);
            }
        }
    }
};
