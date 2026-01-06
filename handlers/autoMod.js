const { EmbedBuilder } = require('discord.js');
const serverConfig = require('../utils/serverConfig');

module.exports = {
    checkMessage: async (message, config) => {
        // Load server-specific config
        const serverCfg = serverConfig.loadServerConfig(message.guild.id, message.guild.name);
        
        // Check if auto-mod is enabled for this server
        if (!serverCfg.autoMod.enabled) {
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

        const content = message.content;

        // Check for blocked words (from server-specific config) with pattern matching
        const lowerContent = content.toLowerCase();
        const containsBlockedWord = serverCfg.autoMod.blockedWords.some(word => {
            const lowerWord = word.toLowerCase();
            
            // Pattern matching with wildcards
            if (lowerWord.includes('*')) {
                const pattern = lowerWord
                    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special regex chars
                    .replace(/\\\*/g, '.*'); // Convert * to .*
                const regex = new RegExp(pattern, 'i');
                return regex.test(lowerContent);
            }
            
            // Exact match (contains)
            return lowerContent.includes(lowerWord);
        });

        if (containsBlockedWord) {
            await handleViolation(message, 'Blocked word detected');
            return true;
        }

        // Check for excessive caps (from server-specific config)
        if (content.length >= serverCfg.autoMod.maxCapsMinLength) {
            const capsCount = (content.match(/[A-Z]/g) || []).length;
            const capsPercent = (capsCount / content.length) * 100;

            if (capsPercent >= serverCfg.autoMod.maxCapsPercent) {
                await handleViolation(message, 'Excessive caps detected');
                return true;
            }
        }

        // Check for Discord invites (from server-specific config)
        if (serverCfg.autoMod.blockInvites) {
            const inviteRegex = /(discord\.gg|discord\.com\/invite|discordapp\.com\/invite)\/[a-zA-Z0-9]+/gi;
            if (inviteRegex.test(content)) {
                await handleViolation(message, 'Discord invite link detected');
                return true;
            }
        }

        // Check for links (from server-specific config)
        if (serverCfg.autoMod.blockLinks) {
            const linkRegex = /(https?:\/\/[^\s]+)/gi;
            if (linkRegex.test(content)) {
                await handleViolation(message, 'Link detected');
                return true;
            }
        }

        return false;
    }
};

async function handleViolation(message, reason) {
    try {
        await message.delete().catch(() => {});

        const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('🛡️ Auto-Moderation')
            .setDescription(`${message.author}, your message was removed.`)
            .addFields(
                { name: 'Reason', value: reason, inline: true },
                { name: 'Channel', value: message.channel.toString(), inline: true }
            )
            .setTimestamp();

        message.channel.send({ embeds: [embed] }).then(msg => {
            setTimeout(() => msg.delete().catch(() => {}), 5000);
        });
    } catch (error) {
        console.error('Auto-mod action failed:', error);
    }
}
