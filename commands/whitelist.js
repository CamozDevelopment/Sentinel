const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'whitelist',
    description: 'Manage whitelisted users',
    data: new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('Manage whitelisted users')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a user to the whitelist')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to whitelist')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a user from the whitelist')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to remove from whitelist')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('View all whitelisted users'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('Clear all whitelisted users'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(message, args, client, config) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ You need Administrator permission!');
        }

        if (!config.whitelist) {
            config.whitelist = [];
        }

        const subcommand = args[0]?.toLowerCase();

        if (!subcommand || subcommand === 'list') {
            if (config.whitelist.length === 0) {
                return message.reply('📋 No users are whitelisted.');
            }

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Whitelisted Users')
                .setDescription(config.whitelist.map((id, index) => `${index + 1}. <@${id}> (\`${id}\`)`).join('\n'))
                .setFooter({ text: `Total: ${config.whitelist.length}` })
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });
        }

        if (subcommand === 'add') {
            const user = message.mentions.users.first() || await client.users.fetch(args[1]).catch(() => null);
            if (!user) {
                return message.reply('❌ Please mention a user or provide a valid user ID!');
            }

            if (config.whitelist.includes(user.id)) {
                return message.reply('❌ This user is already whitelisted!');
            }

            config.whitelist.push(user.id);
            saveConfig(config);

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ User Whitelisted')
                .setDescription(`${user.tag} has been added to the whitelist`)
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Added By', value: message.author.tag, inline: true }
                )
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });
        }

        if (subcommand === 'remove') {
            const user = message.mentions.users.first() || await client.users.fetch(args[1]).catch(() => null);
            if (!user) {
                return message.reply('❌ Please mention a user or provide a valid user ID!');
            }

            const index = config.whitelist.indexOf(user.id);
            if (index === -1) {
                return message.reply('❌ This user is not whitelisted!');
            }

            config.whitelist.splice(index, 1);
            saveConfig(config);

            const embed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('🗑️ User Removed from Whitelist')
                .setDescription(`${user.tag} has been removed from the whitelist`)
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Removed By', value: message.author.tag, inline: true }
                )
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });
        }

        if (subcommand === 'clear') {
            const count = config.whitelist.length;
            config.whitelist = [];
            saveConfig(config);
            return message.reply(`✅ Cleared ${count} users from the whitelist.`);
        }

        return message.reply('❌ Invalid subcommand! Use: add, remove, list, or clear');
    },
    async executeSlash(interaction, client, config) {
        if (!config.whitelist) {
            config.whitelist = [];
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'list') {
            if (config.whitelist.length === 0) {
                return interaction.reply({ content: '📋 No users are whitelisted.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Whitelisted Users')
                .setDescription(config.whitelist.map((id, index) => `${index + 1}. <@${id}> (\`${id}\`)`).join('\n'))
                .setFooter({ text: `Total: ${config.whitelist.length}` })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'add') {
            const user = interaction.options.getUser('user');

            if (config.whitelist.includes(user.id)) {
                return interaction.reply({ content: '❌ This user is already whitelisted!', ephemeral: true });
            }

            config.whitelist.push(user.id);
            saveConfig(config);

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ User Whitelisted')
                .setDescription(`${user.tag} has been added to the whitelist`)
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Added By', value: interaction.user.tag, inline: true }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'remove') {
            const user = interaction.options.getUser('user');

            const index = config.whitelist.indexOf(user.id);
            if (index === -1) {
                return interaction.reply({ content: '❌ This user is not whitelisted!', ephemeral: true });
            }

            config.whitelist.splice(index, 1);
            saveConfig(config);

            const embed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('🗑️ User Removed from Whitelist')
                .setDescription(`${user.tag} has been removed from the whitelist`)
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Removed By', value: interaction.user.tag, inline: true }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'clear') {
            const count = config.whitelist.length;
            config.whitelist = [];
            saveConfig(config);
            return interaction.reply(`✅ Cleared ${count} users from the whitelist.`);
        }
    }
};

function saveConfig(config) {
    try {
        fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
    } catch (error) {
        console.error('Failed to save config:', error);
    }
}
