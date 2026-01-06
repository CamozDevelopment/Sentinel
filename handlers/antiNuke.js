const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const serverConfig = require('../utils/serverConfig');

module.exports = {
    handleChannelDelete: async (channel, client, config) => {
        try {
            // Load server-specific config
            const serverCfg = serverConfig.loadServerConfig(channel.guild.id, channel.guild.name);
            
            // Check if anti-nuke is enabled for this server
            if (!serverCfg.antiNuke.enabled) {
                return;
            }

            const auditLogs = await channel.guild.fetchAuditLogs({
                type: AuditLogEvent.ChannelDelete,
                limit: 1
            });

            const deleteLog = auditLogs.entries.first();
            if (!deleteLog) return;

            const { executor } = deleteLog;
            if (executor.id === client.user.id) return;

            await trackAction(channel.guild, executor.id, 'channelDelete', client, config, serverCfg);
        } catch (error) {
            console.error('Anti-nuke channel delete handler error:', error);
        }
    },

    handleRoleDelete: async (role, client, config) => {
        try {
            // Load server-specific config
            const serverCfg = serverConfig.loadServerConfig(role.guild.id, role.guild.name);
            
            // Check if anti-nuke is enabled for this server
            if (!serverCfg.antiNuke.enabled) {
                return;
            }

            const auditLogs = await role.guild.fetchAuditLogs({
                type: AuditLogEvent.RoleDelete,
                limit: 1
            });

            const deleteLog = auditLogs.entries.first();
            if (!deleteLog) return;

            const { executor } = deleteLog;
            if (executor.id === client.user.id) return;

            await trackAction(role.guild, executor.id, 'roleDelete', client, config, serverCfg);
        } catch (error) {
            console.error('Anti-nuke role delete handler error:', error);
        }
    },

    handleBan: async (ban, client, config) => {
        try {
            // Load server-specific config
            const serverCfg = serverConfig.loadServerConfig(ban.guild.id, ban.guild.name);
            
            // Check if anti-nuke is enabled for this server
            if (!serverCfg.antiNuke.enabled) {
                return;
            }

            const auditLogs = await ban.guild.fetchAuditLogs({
                type: AuditLogEvent.MemberBanAdd,
                limit: 1
            });

            const banLog = auditLogs.entries.first();
            if (!banLog) return;

            const { executor } = banLog;
            if (executor.id === client.user.id) return;

            await trackAction(ban.guild, executor.id, 'ban', client, config, serverCfg);
        } catch (error) {
            console.error('Anti-nuke ban handler error:', error);
        }
    },

    handleKick: async (member, client, config) => {
        try {
            // Load server-specific config
            const serverCfg = serverConfig.loadServerConfig(member.guild.id, member.guild.name);
            
            // Check if anti-nuke is enabled for this server
            if (!serverCfg.antiNuke.enabled) {
                return;
            }

            const auditLogs = await member.guild.fetchAuditLogs({
                type: AuditLogEvent.MemberKick,
                limit: 1
            });

            const kickLog = auditLogs.entries.first();
            if (!kickLog) return;

            const { executor } = kickLog;
            if (executor.id === client.user.id) return;

            await trackAction(member.guild, executor.id, 'kick', client, config, serverCfg);
        } catch (error) {
            console.error('Anti-nuke kick handler error:', error);
        }
    },

    handleWebhook: async (channel, client, config) => {
        try {
            // Load server-specific config
            const serverCfg = serverConfig.loadServerConfig(channel.guild.id, channel.guild.name);
            
            // Check if anti-nuke is enabled for this server
            if (!serverCfg.antiNuke.enabled) {
                return;
            }

            const webhooks = await channel.fetchWebhooks();
            const auditLogs = await channel.guild.fetchAuditLogs({
                type: AuditLogEvent.WebhookCreate,
                limit: 5
            });

            const now = Date.now();
            const recentWebhooks = auditLogs.entries.filter(entry => 
                now - entry.createdTimestamp < serverCfg.antiNuke.timeWindow
            );

            if (recentWebhooks.size >= 3) {
                const executor = recentWebhooks.first().executor;
                await trackAction(channel.guild, executor.id, 'webhook', client, config, serverCfg);
            }
        } catch (error) {
            console.error('Anti-nuke webhook handler error:', error);
        }
    }
};

async function trackAction(guild, userId, actionType, client, config, serverCfg) {
    // Check if user is whitelisted
    if (config.whitelist && config.whitelist.includes(userId)) {
        return;
    }

    // Check if user is the guild owner
    if (userId === guild.ownerId) {
        return;
    }

    const key = `${guild.id}-${userId}`;
    
    if (!client.antiNukeData.has(key)) {
        client.antiNukeData.set(key, {
            channelDelete: [],
            roleDelete: [],
            ban: [],
            kick: [],
            webhook: []
        });
    }

    const userData = client.antiNukeData.get(key);
    const now = Date.now();

    // Add current action
    userData[actionType].push(now);

    // Remove old actions outside time window (use server-specific setting)
    userData[actionType] = userData[actionType].filter(timestamp => 
        now - timestamp < serverCfg.antiNuke.timeWindow
    );

    // Check thresholds (use server-specific settings)
    let shouldBan = false;
    let reason = '';

    if (actionType === 'channelDelete' && userData.channelDelete.length >= serverCfg.antiNuke.maxChannelDeletes) {
        shouldBan = true;
        reason = `Anti-Nuke: Deleted ${userData.channelDelete.length} channels rapidly`;
    } else if (actionType === 'roleDelete' && userData.roleDelete.length >= serverCfg.antiNuke.maxRoleDeletes) {
        shouldBan = true;
        reason = `Anti-Nuke: Deleted ${userData.roleDelete.length} roles rapidly`;
    } else if (actionType === 'ban' && userData.ban.length >= serverCfg.antiNuke.maxBans) {
        shouldBan = true;
        reason = `Anti-Nuke: Banned ${userData.ban.length} members rapidly`;
    } else if (actionType === 'kick' && userData.kick.length >= serverCfg.antiNuke.maxKicks) {
        shouldBan = true;
        reason = `Anti-Nuke: Kicked ${userData.kick.length} members rapidly`;
    } else if (actionType === 'webhook' && userData.webhook.length >= 3) {
        shouldBan = true;
        reason = 'Anti-Nuke: Created multiple webhooks rapidly';
    }

    if (shouldBan) {
        try {
            const member = await guild.members.fetch(userId).catch(() => null);
            if (member) {
                await member.ban({ reason: reason });

                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('🛡️ Anti-Nuke Protection')
                    .setDescription('Suspicious activity detected!')
                    .addFields(
                        { name: 'User Banned', value: `<@${userId}> (${userId})`, inline: true },
                        { name: 'Reason', value: reason, inline: false }
                    )
                    .setTimestamp();

                // Try to send to system channel or first available text channel
                const logChannel = guild.systemChannel || 
                                  guild.channels.cache.find(ch => ch.isTextBased() && ch.permissionsFor(guild.members.me).has('SendMessages'));
                
                if (logChannel) {
                    await logChannel.send({ embeds: [embed] });
                }
            }

            // Clear the user's data
            client.antiNukeData.delete(key);
        } catch (error) {
            console.error('Failed to ban user in anti-nuke:', error);
        }
    }
}
