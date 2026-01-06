const { EmbedBuilder } = require('discord.js');
const serverConfig = require('../utils/serverConfig');

module.exports = {
    checkSpam: async (message, client, config) => {
        // Load server-specific config
        const serverCfg = serverConfig.loadServerConfig(message.guild.id, message.guild.name);
        
        // Check if anti-spam is enabled for this server
        if (!serverCfg.antiSpam.enabled) {
            return false;
        }

        // Check if user is whitelisted
        if (config.whitelist && config.whitelist.includes(message.author.id)) {
            return false;
        }

        // Check if user has administrator permission
        if (message.member.permissions.has('Administrator')) {
            return false;
        }

        const userId = message.author.id;
        const guildId = message.guild.id;
        const key = `${guildId}-${userId}`;

        // Initialize message cache for user
        if (!client.messageCache.has(key)) {
            client.messageCache.set(key, []);
        }

        const userMessages = client.messageCache.get(key);
        const now = Date.now();

        // Add current message
        userMessages.push({
            content: message.content,
            timestamp: now,
            mentions: message.mentions.users.size,
            emojis: (message.content.match(/<a?:\w+:\d+>|[\u{1F300}-\u{1F9FF}]/gu) || []).length
        });

        // Remove old messages outside time window (from server-specific config)
        const filtered = userMessages.filter(msg => now - msg.timestamp < serverCfg.antiSpam.timeWindow);
        client.messageCache.set(key, filtered);

        // Check message spam (from server-specific config)
        if (filtered.length >= serverCfg.antiSpam.maxMessages) {
            await handleSpam(message, 'Message spam detected', serverCfg);
            client.messageCache.set(key, []);
            return true;
        }

        // Check duplicate messages (from server-specific config)
        const duplicates = filtered.filter(msg => msg.content === message.content);
        if (duplicates.length >= serverCfg.antiSpam.maxDuplicates) {
            await handleSpam(message, 'Duplicate message spam detected', serverCfg);
            client.messageCache.set(key, []);
            return true;
        }

        // Check mention spam (from server-specific config)
        if (message.mentions.users.size >= serverCfg.antiSpam.maxMentions) {
            await handleSpam(message, 'Mention spam detected', serverCfg);
            return true;
        }

        // Check emoji spam (from server-specific config)
        const currentEmojis = (message.content.match(/<a?:\w+:\d+>|[\u{1F300}-\u{1F9FF}]/gu) || []).length;
        if (currentEmojis >= serverCfg.antiSpam.maxEmojis) {
            await handleSpam(message, 'Emoji spam detected', serverCfg);
            return true;
        }

        return false;
    }
};

async function handleSpam(message, reason, serverCfg) {
    try {
        // Delete the spam message
        await message.delete().catch(() => {});

        // Timeout the user
        await message.member.timeout(serverCfg.antiSpam.muteTime, reason);

        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('🚫 Anti-Spam Action')
            .addFields(
                { name: 'User', value: `${message.author.tag} (${message.author.id})`, inline: true },
                { name: 'Action', value: 'Timed Out', inline: true },
                { name: 'Duration', value: `${serverCfg.antiSpam.muteTime / 1000}s`, inline: true },
                { name: 'Reason', value: reason }
            )
            .setTimestamp();

        message.channel.send({ embeds: [embed] }).then(msg => {
            setTimeout(() => msg.delete().catch(() => {}), 10000);
        });
    } catch (error) {
        console.error('Anti-spam action failed:', error);
    }
}
