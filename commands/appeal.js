const { EmbedBuilder, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
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
    name: 'appeal',
    description: 'Submit an appeal for your global ban',
    data: new SlashCommandBuilder()
        .setName('appeal')
        .setDescription('Submit an appeal for your global ban'),

    async executeSlash(interaction, client, config) {
        const globalBansData = loadGlobalBans();

        // Check if user is globally banned
        if (!globalBansData.bans[interaction.user.id]) {
            return interaction.reply({ 
                content: '❌ You are not globally banned!', 
                ephemeral: true 
            });
        }

        // Check if user already has a pending appeal
        const existingAppeal = globalBansData.appeals[interaction.user.id];
        if (existingAppeal && existingAppeal.status === 'pending') {
            return interaction.reply({ 
                content: '❌ You already have a pending appeal! Please wait for it to be reviewed.', 
                ephemeral: true 
            });
        }

        if (existingAppeal && existingAppeal.status === 'accepted') {
            return interaction.reply({ 
                content: '✅ Your appeal was already accepted!', 
                ephemeral: true 
            });
        }

        // Create modal for appeal form
        const modal = new ModalBuilder()
            .setCustomId('appeal_modal')
            .setTitle('Global Ban Appeal Form');

        // Create text inputs
        const whyAppealInput = new TextInputBuilder()
            .setCustomId('why_appeal')
            .setLabel('Why should we accept your appeal?')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Explain why you think the ban should be lifted...')
            .setRequired(true)
            .setMinLength(50)
            .setMaxLength(1000);

        const whatLearnedInput = new TextInputBuilder()
            .setCustomId('what_learned')
            .setLabel('What have you learned from this?')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Tell us what you learned and how you will improve...')
            .setRequired(true)
            .setMinLength(30)
            .setMaxLength(500);

        const willRepeatInput = new TextInputBuilder()
            .setCustomId('will_repeat')
            .setLabel('Will you repeat this behavior?')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Yes or No')
            .setRequired(true)
            .setMaxLength(10);

        const additionalInfoInput = new TextInputBuilder()
            .setCustomId('additional_info')
            .setLabel('Additional Information (Optional)')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Any other information you want to share...')
            .setRequired(false)
            .setMaxLength(500);

        // Add inputs to action rows
        const row1 = new ActionRowBuilder().addComponents(whyAppealInput);
        const row2 = new ActionRowBuilder().addComponents(whatLearnedInput);
        const row3 = new ActionRowBuilder().addComponents(willRepeatInput);
        const row4 = new ActionRowBuilder().addComponents(additionalInfoInput);

        modal.addComponents(row1, row2, row3, row4);

        // Show modal to user
        await interaction.showModal(modal);
    }
};
