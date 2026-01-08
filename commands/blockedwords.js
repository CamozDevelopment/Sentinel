const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const serverConfig = require('../utils/serverConfig');

// Preset word lists
const PRESETS = {
    'profanity-basic': ['*fuck*', '*shit*', '*ass*', '*bitch*', '*damn*', '*crap*'],
    'profanity-strict': ['*fuck*', '*shit*', '*ass*', '*bitch*', '*damn*', '*crap*', '*bastard*', '*piss*', '*dick*', '*cock*', '*pussy*', '*whore*', '*slut*'],
    'slurs': ['*nigger*', '*nigga*', '*faggot*', '*fag*', '*retard*', '*tranny*', '*kike*', '*chink*', '*spic*', '*wetback*'],
    'spam': ['*free nitro*', '*discord.gift*', '*@everyone*', '*win prize*', '*click here*', '*dm me*']
};

module.exports = {
    name: 'blockedwords',
    description: 'Manage blocked words for this server',
    data: new SlashCommandBuilder()
        .setName('blockedwords')
        .setDescription('Manage blocked words for this server')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a word to the blocked list')
                .addStringOption(option =>
                    option.setName('word')
                        .setDescription('The word or phrase to block (use * for wildcards)')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('bulkadd')
                .setDescription('Add multiple words at once')
                .addStringOption(option =>
                    option.setName('words')
                        .setDescription('Words separated by commas (supports * wildcards)')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('addpreset')
                .setDescription('Add a preset list of blocked words')
                .addStringOption(option =>
                    option.setName('preset')
                        .setDescription('Choose a preset list')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Basic Profanity', value: 'profanity-basic' },
                            { name: 'Strict Profanity', value: 'profanity-strict' },
                            { name: 'Slurs & Hate Speech', value: 'slurs' },
                            { name: 'Common Spam', value: 'spam' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a word from the blocked list')
                .addStringOption(option =>
                    option.setName('word')
                        .setDescription('The word or phrase to unblock')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all blocked words'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('Clear all blocked words'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async executeSlash(interaction, client, config) {
        if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({ content: '❌ You need Manage Server permission!', ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        if (subcommand === 'add') {
            const word = interaction.options.getString('word');
            const added = serverConfig.addBlockedWord(guildId, word);
            
            if (added) {
                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('✅ Word Blocked')
                    .setDescription(`The word/phrase has been added to the blocked list.\n\n**Pattern:** \`${word}\``)
                    .addFields({ name: 'Total Blocked Words', value: serverConfig.getBlockedWords(guildId).length.toString() })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                await interaction.reply({ 
                    content: '⚠️ This word is already in the blocked list!', 
                    ephemeral: true 
                });
            }

        } else if (subcommand === 'bulkadd') {
            const wordsInput = interaction.options.getString('words');
            const words = wordsInput.split(',').map(w => w.trim()).filter(w => w.length > 0);
            
            let addedCount = 0;
            let skippedCount = 0;
            
            for (const word of words) {
                const added = serverConfig.addBlockedWord(guildId, word);
                if (added) {
                    addedCount++;
                } else {
                    skippedCount++;
                }
            }
            
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Bulk Import Complete')
                .setDescription(`Successfully processed ${words.length} word(s).`)
                .addFields(
                    { name: '✅ Added', value: addedCount.toString(), inline: true },
                    { name: '⚠️ Skipped (duplicates)', value: skippedCount.toString(), inline: true },
                    { name: 'Total Blocked Words', value: serverConfig.getBlockedWords(guildId).length.toString(), inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });

        } else if (subcommand === 'addpreset') {
            const preset = interaction.options.getString('preset');
            const presetWords = PRESETS[preset];
            
            if (!presetWords) {
                return interaction.reply({ content: '❌ Invalid preset!', ephemeral: true });
            }
            
            let addedCount = 0;
            let skippedCount = 0;
            
            for (const word of presetWords) {
                const added = serverConfig.addBlockedWord(guildId, word);
                if (added) {
                    addedCount++;
                } else {
                    skippedCount++;
                }
            }
            
            const presetNames = {
                'profanity-basic': 'Basic Profanity',
                'profanity-strict': 'Strict Profanity',
                'slurs': 'Slurs & Hate Speech',
                'spam': 'Common Spam'
            };
            
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Preset Added')
                .setDescription(`Added **${presetNames[preset]}** preset to blocked words.`)
                .addFields(
                    { name: '✅ Added', value: addedCount.toString(), inline: true },
                    { name: '⚠️ Skipped (duplicates)', value: skippedCount.toString(), inline: true },
                    { name: 'Total Blocked Words', value: serverConfig.getBlockedWords(guildId).length.toString(), inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });

        } else if (subcommand === 'remove') {
            const word = interaction.options.getString('word');
            const removed = serverConfig.removeBlockedWord(guildId, word);
            
            if (removed) {
                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('✅ Word Unblocked')
                    .setDescription(`The word/phrase has been removed from the blocked list.`)
                    .addFields({ name: 'Total Blocked Words', value: serverConfig.getBlockedWords(guildId).length.toString() })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                await interaction.reply({ 
                    content: '❌ This word is not in the blocked list!', 
                    ephemeral: true 
                });
            }

        } else if (subcommand === 'list') {
            const blockedWords = serverConfig.getBlockedWords(guildId);
            
            if (blockedWords.length === 0) {
                return interaction.reply({ 
                    content: '✅ No blocked words configured for this server!', 
                    ephemeral: true 
                });
            }

            const embed = new EmbedBuilder()
                .setColor('#FF9900')
                .setTitle(`🚷 Blocked Words - ${interaction.guild.name}`)
                .setDescription(`Total: ${blockedWords.length} word(s)/phrase(s)`)
                .setTimestamp();

            // Split into chunks if too many words
            const wordsPerPage = 25;
            const words = blockedWords.slice(0, wordsPerPage).map((word, index) => `${index + 1}. \`${word}\``).join('\n');
            
            embed.addFields({ 
                name: 'Blocked List', 
                value: words || 'None' 
            });

            if (blockedWords.length > wordsPerPage) {
                embed.setFooter({ text: `Showing ${wordsPerPage} of ${blockedWords.length} words` });
            }

            await interaction.reply({ embeds: [embed], ephemeral: true });

        } else if (subcommand === 'clear') {
            const cfg = serverConfig.loadServerConfig(guildId);
            const count = cfg.autoMod.blockedWords.length;
            
            cfg.autoMod.blockedWords = [];
            serverConfig.saveServerConfig(guildId, cfg);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🗑️ Blocked Words Cleared')
                .setDescription(`Removed ${count} word(s) from the blocked list.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
