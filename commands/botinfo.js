const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'botinfo',
    description: 'Get bot information',
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Get bot information'),
    async execute(message, args, client, config) {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor(uptime / 3600) % 24;
        const minutes = Math.floor(uptime / 60) % 60;
        const seconds = Math.floor(uptime) % 60;

        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        const embed = new EmbedBuilder()
            .setColor('#6366f1')
            .setTitle('🛡️ Sentinel Bot Information')
            .setDescription('The Ultimate Discord Security Bot')
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: 'Bot Name', value: client.user.tag, inline: true },
                { name: 'Bot ID', value: client.user.id, inline: true },
                { name: 'Version', value: '1.0.0', inline: true },
                { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
                { name: 'Users', value: `${client.users.cache.size}`, inline: true },
                { name: 'Commands', value: `${client.commands.size}`, inline: true },
                { name: 'Uptime', value: uptimeString, inline: true },
                { name: 'Node.js', value: process.version, inline: true },
                { name: 'Discord.js', value: require('discord.js').version, inline: true },
                {
                    name: '⚡ Features',
                    value: `🛡️ Anti-Spam Protection\n🤖 Smart Auto-Moderation\n💣 Anti-Nuke System\n🌐 Global Ban Network\n📝 Comprehensive Logging\n🎨 Web Dashboard`,
                    inline: false
                }
            )
            .setFooter({ text: 'Sentinel - Protecting Discord Communities' })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    },
    async executeSlash(interaction, client, config) {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor(uptime / 3600) % 24;
        const minutes = Math.floor(uptime / 60) % 60;
        const seconds = Math.floor(uptime) % 60;

        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        const embed = new EmbedBuilder()
            .setColor('#6366f1')
            .setTitle('🛡️ Sentinel Bot Information')
            .setDescription('The Ultimate Discord Security Bot')
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: 'Bot Name', value: client.user.tag, inline: true },
                { name: 'Bot ID', value: client.user.id, inline: true },
                { name: 'Version', value: '1.0.0', inline: true },
                { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
                { name: 'Users', value: `${client.users.cache.size}`, inline: true },
                { name: 'Commands', value: `${client.commands.size}`, inline: true },
                { name: 'Uptime', value: uptimeString, inline: true },
                { name: 'Node.js', value: process.version, inline: true },
                { name: 'Discord.js', value: require('discord.js').version, inline: true },
                {
                    name: '⚡ Features',
                    value: `🛡️ Anti-Spam Protection\n🤖 Smart Auto-Moderation\n💣 Anti-Nuke System\n🌐 Global Ban Network\n📝 Comprehensive Logging\n🎨 Web Dashboard`,
                    inline: false
                }
            )
            .setFooter({ text: 'Sentinel - Protecting Discord Communities' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
