require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');

// Load config from environment variables or fallback to config.json
let config;
try {
    config = require('./config.json');
} catch (e) {
    config = {};
}

const token = process.env.DISCORD_TOKEN || config.token;
const clientId = process.env.CLIENT_ID || config.clientId;

if (!token || !clientId) {
    console.error('❌ Error: DISCORD_TOKEN and CLIENT_ID must be set in environment variables or config.json');
    process.exit(1);
}

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.data) {
        commands.push(command.data.toJSON());
    }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log(`🔄 Started refreshing ${commands.length} application (/) commands.`);

        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error('❌ Error deploying commands:', error);
    }
})();
