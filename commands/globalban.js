const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const globalBansPath = path.join(__dirname, '..', 'globalBans.json');

function loadGlobalBans() {
    if (!fs.existsSync(globalBansPath)) {
        fs.writeFileSync(globalBansPath, JSON.stringify({ bans: {}, appeals: {} }, null, 2));
    }
    return JSON.parse(fs.readFileSync(globalBansPath, 'utf-8'));
}

function saveGlobalBans(data) {
    fs.writeFileSync(globalBansPath, JSON.stringify(data, null, 2));
}

module.exports = {
    name: 'globalban',
    description: 'Ban a user globally across all servers',
    data: new SlashCommandBuilder()
        .setName('globalban')
        .setDescription('Ban a user globally across all servers')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to globally ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the global ban (e.g., stealing mods, leaking, etc.)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('punishment')
                .setDescription('Type of punishment to apply')
                .setRequired(true)
                .addChoices(
                    { name: 'Ban', value: 'ban' },
                    { name: 'Kick', value: 'kick' },
                    { name: 'Clear Roles', value: 'clear_roles' }
                ))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async executeSlash(interaction, client, config) {
        // Check if user is owner of any server the bot is in
        const isServerOwner = client.guilds.cache.some(guild => guild.ownerId === interaction.user.id);
        
        if (!isServerOwner) {
            return interaction.reply({ content: '❌ Only server owners can use this command!', ephemeral: true });
        }

        await interaction.deferReply();

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const punishment = interaction.options.getString('punishment');

        // Load global bans data
        const globalBansData = loadGlobalBans();

        // Check if user is already globally banned
        if (globalBansData.bans[user.id]) {
            return interaction.editReply({ content: '❌ This user is already globally banned!', ephemeral: true });
        }

        // Store the global ban
        globalBansData.bans[user.id] = {
            userId: user.id,
            username: user.tag,
            reason: reason,
            punishment: punishment,
            bannedBy: interaction.user.id,
            bannedByTag: interaction.user.tag,
            timestamp: Date.now(),
            affectedGuilds: []
        };

        const successfulGuilds = [];
        const failedGuilds = [];

        // Apply punishment to all guilds
        for (const guild of client.guilds.cache.values()) {
            try {
                const member = await guild.members.fetch(user.id).catch(() => null);
                
                if (!member) {
                    continue; // User not in this guild
                }

                switch (punishment) {
                    case 'ban':
                        await guild.members.ban(user.id, { 
                            reason: `Global Ban by ${interaction.user.tag}: ${reason}` 
                        });
                        break;
                    
                    case 'kick':
                        await member.kick(`Global Kick by ${interaction.user.tag}: ${reason}`);
                        break;
                    
                    case 'clear_roles':
                        const rolesToRemove = member.roles.cache.filter(role => 
                            role.id !== guild.id && // Don't try to remove @everyone
                            !role.managed && // Don't remove bot/integration roles
                            role.position < guild.members.me.roles.highest.position
                        );
                        await member.roles.remove(rolesToRemove, `Global Punishment by ${interaction.user.tag}: ${reason}`);
                        break;
                }

                successfulGuilds.push(guild.name);
                globalBansData.bans[user.id].affectedGuilds.push({
                    guildId: guild.id,
                    guildName: guild.name,
                    punishment: punishment
                });

            } catch (error) {
                failedGuilds.push(guild.name);
                console.error(`Failed to apply global ban in ${guild.name}:`, error);
            }
        }

        // Save updated data
        saveGlobalBans(globalBansData);

        // Create detailed embed
        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('🌐 Global Ban Applied')
            .addFields(
                { name: '👤 User', value: `${user.tag} (${user.id})`, inline: true },
                { name: '⚡ Punishment', value: punishment.replace('_', ' ').toUpperCase(), inline: true },
                { name: '👮 Moderator', value: interaction.user.tag, inline: true },
                { name: '📝 Reason', value: reason },
                { name: '✅ Successful', value: `${successfulGuilds.length} servers`, inline: true },
                { name: '❌ Failed', value: `${failedGuilds.length} servers`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'User can appeal using /appeal' });

        if (successfulGuilds.length > 0 && successfulGuilds.length <= 10) {
            embed.addFields({ name: '🗂️ Affected Servers', value: successfulGuilds.join(', ') });
        }

        // Try to DM the user
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🚫 Global Ban Notice')
                .setDescription(`You have been globally banned from all servers using this bot.`)
                .addFields(
                    { name: 'Reason', value: reason },
                    { name: 'Punishment Type', value: punishment.replace('_', ' ').toUpperCase() },
                    { name: 'Appeal', value: 'You can appeal this ban using the `/appeal` command in any server with this bot.' }
                )
                .setTimestamp();

            await user.send({ embeds: [dmEmbed] });
        } catch (error) {
            console.log(`Could not DM user ${user.tag}`);
        }

        await interaction.editReply({ embeds: [embed] });
    }
};
