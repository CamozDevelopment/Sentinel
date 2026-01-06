require('dotenv').config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder, PermissionFlagsBits, AuditLogEvent } = require('discord.js');
const fs = require('fs');
const serverConfig = require('./utils/serverConfig');

// Load config from environment variables or fallback to config.json
let config;
try {
    config = require('./config.json');
} catch (e) {
    config = {};
}

// Override with environment variables if they exist
config.token = process.env.DISCORD_TOKEN || config.token;
config.clientId = process.env.CLIENT_ID || config.clientId;
config.ownerId = process.env.OWNER_ID || config.ownerId;

// Dashboard config
if (!config.dashboard) config.dashboard = {};
config.dashboard.enabled = process.env.DASHBOARD_ENABLED === 'true' || config.dashboard.enabled !== false;
config.dashboard.port = process.env.DASHBOARD_PORT || config.dashboard.port || 3000;
config.dashboard.clientSecret = process.env.CLIENT_SECRET || config.dashboard.clientSecret;
config.dashboard.callbackURL = process.env.CALLBACK_URL || config.dashboard.callbackURL;
config.dashboard.sessionSecret = process.env.SESSION_SECRET || config.dashboard.sessionSecret;

// Global ban config
if (!config.globalBan) config.globalBan = {};
config.globalBan.enabled = process.env.GLOBALBAN_ENABLED === 'true' || config.globalBan.enabled !== false;
config.globalBan.defaultPunishment = process.env.GLOBALBAN_PUNISHMENT || config.globalBan.defaultPunishment || 'ban';
config.globalBan.appealChannelId = process.env.APPEAL_CHANNEL_ID || config.globalBan.appealChannelId || '';
config.globalBan.logChannelId = process.env.LOG_CHANNEL_ID || config.globalBan.logChannelId || '';

// Ensure whitelist exists
if (!config.whitelist) config.whitelist = [];
if (!config.antiNuke) config.antiNuke = { enabled: true, maxChannelDeletes: 3, maxRoleDeletes: 3, maxBans: 5, maxKicks: 5, timeWindow: 10000 };

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildWebhooks
    ]
});

// Collections
client.commands = new Collection();
client.warnings = new Collection();
client.messageCache = new Collection();
client.antiNukeData = new Collection();

// Load command files
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// Load event handlers
const antiSpamHandler = require('./handlers/antiSpam');
const autoModHandler = require('./handlers/autoMod');
const antiNukeHandler = require('./handlers/antiNuke');

client.once('ready', () => {
    console.log(`✅ Sentinel is online!`);
    console.log(`📊 Logged in as ${client.user.tag}`);
    console.log(`🔧 Serving ${client.guilds.cache.size} servers`);
    
    // Initialize server configs for all guilds
    client.guilds.cache.forEach(guild => {
        serverConfig.loadServerConfig(guild.id, guild.name);
        console.log(`✓ Loaded config for: ${guild.name}`);
    });
    
    client.user.setActivity('🛡️ Protecting servers', { type: 'WATCHING' });
});

// Handle bot joining a new guild
client.on('guildCreate', guild => {
    console.log(`📥 Joined new server: ${guild.name} (${guild.id})`);
    serverConfig.loadServerConfig(guild.id, guild.name);
    console.log(`✓ Created config for: ${guild.name}`);
});

// Handle bot leaving a guild
client.on('guildDelete', guild => {
    console.log(`📤 Left server: ${guild.name} (${guild.id})`);
    serverConfig.deleteServerConfig(guild.id);
    console.log(`✓ Deleted config for: ${guild.name}`);
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    // Anti-spam check (now controlled per-server)
    const spamResult = await antiSpamHandler.checkSpam(message, client, config);
    if (spamResult) return;

    // Auto-moderation check (now controlled per-server)
    const autoModResult = await autoModHandler.checkMessage(message, config);
    if (autoModResult) return;
});

// Slash command interaction handler
client.on('interactionCreate', async interaction => {
    // Handle modal submissions
    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'appeal_modal') {
            const fs = require('fs');
            const path = require('path');
            const globalBansPath = path.join(__dirname, 'globalBans.json');
            
            function loadGlobalBans() {
                if (!fs.existsSync(globalBansPath)) {
                    fs.writeFileSync(globalBansPath, JSON.stringify({ bans: {}, appeals: {} }, null, 2));
                }
                return JSON.parse(fs.readFileSync(globalBansPath, 'utf-8'));
            }
            
            function saveGlobalBans(data) {
                fs.writeFileSync(globalBansPath, JSON.stringify(data, null, 2));
            }

            const whyAppeal = interaction.fields.getTextInputValue('why_appeal');
            const whatLearned = interaction.fields.getTextInputValue('what_learned');
            const willRepeat = interaction.fields.getTextInputValue('will_repeat');
            const additionalInfo = interaction.fields.getTextInputValue('additional_info') || 'None';

            const globalBansData = loadGlobalBans();

            // Store the appeal
            globalBansData.appeals[interaction.user.id] = {
                userId: interaction.user.id,
                username: interaction.user.tag,
                whyAppeal: whyAppeal,
                whatLearned: whatLearned,
                willRepeat: willRepeat,
                additionalInfo: additionalInfo,
                status: 'pending',
                timestamp: Date.now()
            };

            saveGlobalBans(globalBansData);

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Appeal Submitted')
                .setDescription('Your appeal has been submitted and is pending review.')
                .addFields(
                    { name: 'Status', value: 'Pending', inline: true },
                    { name: 'Submitted', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
                )
                .setFooter({ text: 'You will be notified when your appeal is reviewed' });

            await interaction.reply({ embeds: [embed], ephemeral: true });

            // Notify bot owner if appealChannelId is set
            if (config.globalBan && config.globalBan.appealChannelId) {
                try {
                    const appealChannel = await client.channels.fetch(config.globalBan.appealChannelId);
                    const notificationEmbed = new EmbedBuilder()
                        .setColor('#FFA500')
                        .setTitle('🔔 New Appeal Submitted')
                        .addFields(
                            { name: '👤 User', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                            { name: '📅 Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                        )
                        .setDescription(`Use \`/reviewappeal userid:${interaction.user.id}\` to review this appeal.`);
                    
                    await appealChannel.send({ embeds: [notificationEmbed] });
                } catch (error) {
                    console.error('Could not send appeal notification:', error);
                }
            }
        }
        return;
    }

    // Handle button interactions
    if (interaction.isButton()) {
        if (interaction.customId.startsWith('accept_appeal_') || interaction.customId.startsWith('deny_appeal_')) {
            const fs = require('fs');
            const path = require('path');
            const globalBansPath = path.join(__dirname, 'globalBans.json');
            
            function loadGlobalBans() {
                if (!fs.existsSync(globalBansPath)) {
                    fs.writeFileSync(globalBansPath, JSON.stringify({ bans: {}, appeals: {} }, null, 2));
                }
                return JSON.parse(fs.readFileSync(globalBansPath, 'utf-8'));
            }
            
            function saveGlobalBans(data) {
                fs.writeFileSync(globalBansPath, JSON.stringify(data, null, 2));
            }

            // Check if user is owner of any server the bot is in
            const isServerOwner = client.guilds.cache.some(guild => guild.ownerId === interaction.user.id);
            
            if (!isServerOwner) {
                return interaction.reply({ content: '❌ Only server owners can review appeals!', ephemeral: true });
            }

            const userId = interaction.customId.split('_')[2];
            const action = interaction.customId.split('_')[0]; // 'accept' or 'deny'
            
            await interaction.deferReply();

            const globalBansData = loadGlobalBans();
            const appeal = globalBansData.appeals[userId];
            const ban = globalBansData.bans[userId];

            if (!appeal) {
                return interaction.editReply({ content: '❌ Appeal not found!' });
            }

            if (appeal.status !== 'pending') {
                return interaction.editReply({ content: `❌ This appeal has already been ${appeal.status}!` });
            }

            if (action === 'accept') {
                // Accept the appeal
                appeal.status = 'accepted';
                appeal.reviewedBy = interaction.user.id;
                appeal.reviewedAt = Date.now();

                // Create invites for all affected guilds and unban user
                const inviteLinks = [];
                
                if (ban && ban.affectedGuilds) {
                    for (const guildData of ban.affectedGuilds) {
                        try {
                            const guild = await client.guilds.fetch(guildData.guildId);
                            
                            // Unban if they were banned
                            if (guildData.punishment === 'ban') {
                                try {
                                    await guild.bans.remove(userId, 'Appeal accepted');
                                } catch (err) {
                                    console.log(`Could not unban user from ${guild.name}`);
                                }
                            }

                            // Create invite
                            const channels = guild.channels.cache.filter(c => 
                                c.isTextBased() && 
                                c.permissionsFor(guild.members.me).has(PermissionFlagsBits.CreateInstantInvite)
                            );
                            
                            if (channels.size > 0) {
                                const channel = channels.first();
                                const invite = await channel.createInvite({
                                    maxAge: 604800, // 7 days
                                    maxUses: 1,
                                    unique: true,
                                    reason: 'Global ban appeal accepted'
                                });
                                inviteLinks.push({ guildName: guild.name, invite: invite.url });
                            }
                        } catch (error) {
                            console.error(`Failed to process guild ${guildData.guildId}:`, error);
                        }
                    }
                }

                // Remove from global ban list
                delete globalBansData.bans[userId];

                saveGlobalBans(globalBansData);

                // Notify user
                try {
                    const user = await client.users.fetch(userId);
                    const dmEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle('✅ Appeal Accepted')
                        .setDescription('Your global ban appeal has been accepted!')
                        .setTimestamp();

                    if (inviteLinks.length > 0) {
                        const inviteText = inviteLinks.map(i => `**${i.guildName}:** ${i.invite}`).join('\n');
                        dmEmbed.addFields({ name: '🎟️ Server Invites', value: inviteText });
                        dmEmbed.setFooter({ text: 'These invites expire in 7 days and can only be used once' });
                    }

                    await user.send({ embeds: [dmEmbed] });
                } catch (error) {
                    console.log('Could not DM user about accepted appeal');
                }

                const responseEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('✅ Appeal Accepted')
                    .setDescription(`Appeal from <@${userId}> has been accepted.`)
                    .addFields(
                        { name: 'Invites Created', value: inviteLinks.length.toString(), inline: true },
                        { name: 'Reviewed By', value: interaction.user.tag, inline: true }
                    )
                    .setTimestamp();

                await interaction.editReply({ embeds: [responseEmbed], components: [] });

            } else if (action === 'deny') {
                // Deny the appeal
                appeal.status = 'denied';
                appeal.reviewedBy = interaction.user.id;
                appeal.reviewedAt = Date.now();

                saveGlobalBans(globalBansData);

                // Notify user
                try {
                    const user = await client.users.fetch(userId);
                    const dmEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('❌ Appeal Denied')
                        .setDescription('Your global ban appeal has been denied.')
                        .setTimestamp();

                    await user.send({ embeds: [dmEmbed] });
                } catch (error) {
                    console.log('Could not DM user about denied appeal');
                }

                const responseEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Appeal Denied')
                    .setDescription(`Appeal from <@${userId}> has been denied.`)
                    .addFields(
                        { name: 'Reviewed By', value: interaction.user.tag, inline: true }
                    )
                    .setTimestamp();

                await interaction.editReply({ embeds: [responseEmbed], components: [] });
            }
        }
        return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.executeSlash(interaction, client, config);
    } catch (error) {
        console.error(error);
        const errorMessage = '❌ There was an error executing that command!';
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
    }
});

// Anti-nuke event handlers
if (config.antiNuke.enabled) {
    client.on('channelDelete', async channel => {
        await antiNukeHandler.handleChannelDelete(channel, client, config);
    });

    client.on('roleDelete', async role => {
        await antiNukeHandler.handleRoleDelete(role, client, config);
    });

    client.on('guildBanAdd', async ban => {
        await antiNukeHandler.handleBan(ban, client, config);
    });

    client.on('guildMemberRemove', async member => {
        await antiNukeHandler.handleKick(member, client, config);
    });

    client.on('webhookUpdate', async channel => {
        await antiNukeHandler.handleWebhook(channel, client, config);
    });
}

client.login(config.token);
