const fs = require('fs');
const path = require('path');

const serversDir = path.join(__dirname, '..', 'servers');

// Ensure servers directory exists
if (!fs.existsSync(serversDir)) {
    fs.mkdirSync(serversDir, { recursive: true });
}

// Default server configuration
const defaultConfig = {
    guildId: '',
    guildName: '',
    autoMod: {
        enabled: true,
        blockedWords: [],
        maxCapsPercent: 70,
        maxCapsMinLength: 10,
        blockLinks: false,
        blockInvites: true,
        maxEmojis: 10,
        maxMentions: 5,
        maxDuplicates: 3,
        blockZalgo: true,
        blockSpoilers: false,
        maxNewlines: 15,
        repeatedChars: 10
    },
    antiSpam: {
        enabled: true,
        maxMessages: 5,
        timeWindow: 5000,
        muteTime: 300000,
        maxDuplicates: 3,
        maxMentions: 5,
        maxEmojis: 10,
        imageSpam: true,
        maxImages: 3,
        fileSpam: true,
        maxFiles: 3
    },
    antiNuke: {
        enabled: true,
        maxChannelDeletes: 3,
        maxRoleDeletes: 3,
        maxBans: 5,
        maxKicks: 5,
        timeWindow: 10000,
        punishment: 'ban',
        muteTime: 3600000,
        notifyUser: true,
        removeRoles: true
    },
    logging: {
        enabled: false,
        logChannel: '',
        messageDelete: true,
        messageEdit: true,
        memberJoin: true,
        memberLeave: true,
        memberBan: true,
        memberKick: true,
        roleUpdate: true,
        channelUpdate: true,
        nicknameChange: true,
        voiceActivity: false
    },
    welcome: {
        enabled: false,
        channel: '',
        message: 'Welcome {user} to {server}!',
        embedEnabled: true,
        embedColor: '#5865F2',
        dmUser: false,
        dmMessage: 'Welcome to {server}!'
    },
    leave: {
        enabled: false,
        channel: '',
        message: '{user} has left {server}.',
        embedEnabled: true,
        embedColor: '#ED4245'
    },
    autoRole: {
        enabled: false,
        roles: [],
        botRoles: [],
        verificationRole: ''
    },
    moderation: {
        warnThresholdMute: 3,
        warnThresholdKick: 5,
        warnThresholdBan: 7,
        warnExpiry: 2592000000,
        muteRole: '',
        modLogChannel: ''
    },
    security: {
        minAccountAge: 0,
        raidMode: false,
        antiRaid: {
            enabled: false,
            joinThreshold: 10,
            joinTimeWindow: 10000,
            action: 'kick'
        },
        verificationLevel: 'none'
    },
    logChannel: '',
    modRole: '',
    mutedRole: ''
};

/**
 * Get the config file path for a guild
 */
function getConfigPath(guildId) {
    return path.join(serversDir, `${guildId}.json`);
}

/**
 * Load server configuration, create if doesn't exist
 */
function loadServerConfig(guildId, guildName = 'Unknown Server') {
    const configPath = getConfigPath(guildId);
    
    if (!fs.existsSync(configPath)) {
        // Create new config
        const config = { ...defaultConfig, guildId, guildName };
        saveServerConfig(guildId, config);
        return config;
    }
    
    try {
        const data = fs.readFileSync(configPath, 'utf-8');
        const loadedConfig = JSON.parse(data);
        
        // Merge with defaults to ensure all properties exist
        const mergedConfig = {
            ...defaultConfig,
            ...loadedConfig,
            autoMod: { ...defaultConfig.autoMod, ...loadedConfig.autoMod },
            antiSpam: { ...defaultConfig.antiSpam, ...loadedConfig.antiSpam },
            antiNuke: { ...defaultConfig.antiNuke, ...loadedConfig.antiNuke },
            logging: { ...defaultConfig.logging, ...loadedConfig.logging },
            welcome: { ...defaultConfig.welcome, ...loadedConfig.welcome },
            leave: { ...defaultConfig.leave, ...loadedConfig.leave },
            autoRole: { ...defaultConfig.autoRole, ...loadedConfig.autoRole },
            moderation: { ...defaultConfig.moderation, ...loadedConfig.moderation },
            security: { 
                ...defaultConfig.security, 
                ...loadedConfig.security,
                antiRaid: { ...defaultConfig.security.antiRaid, ...loadedConfig.security?.antiRaid }
            }
        };
        
        return mergedConfig;
    } catch (error) {
        console.error(`Error loading config for guild ${guildId}:`, error);
        return { ...defaultConfig, guildId, guildName };
    }
}

/**
 * Save server configuration
 */
function saveServerConfig(guildId, config) {
    const configPath = getConfigPath(guildId);
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        return true;
    } catch (error) {
        console.error(`Error saving config for guild ${guildId}:`, error);
        return false;
    }
}

/**
 * Update specific setting in server config
 */
function updateServerSetting(guildId, settingPath, value) {
    const config = loadServerConfig(guildId);
    const keys = settingPath.split('.');
    
    let current = config;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    return saveServerConfig(guildId, config);
}

/**
 * Get specific setting from server config
 */
function getServerSetting(guildId, settingPath) {
    const config = loadServerConfig(guildId);
    const keys = settingPath.split('.');
    
    let current = config;
    for (const key of keys) {
        if (current[key] === undefined) return undefined;
        current = current[key];
    }
    
    return current;
}

/**
 * Add a blocked word
 */
function addBlockedWord(guildId, word) {
    const config = loadServerConfig(guildId);
    if (!config.autoMod.blockedWords.includes(word.toLowerCase())) {
        config.autoMod.blockedWords.push(word.toLowerCase());
        return saveServerConfig(guildId, config);
    }
    return false; // Already exists
}

/**
 * Remove a blocked word
 */
function removeBlockedWord(guildId, word) {
    const config = loadServerConfig(guildId);
    const index = config.autoMod.blockedWords.indexOf(word.toLowerCase());
    if (index > -1) {
        config.autoMod.blockedWords.splice(index, 1);
        return saveServerConfig(guildId, config);
    }
    return false; // Doesn't exist
}

/**
 * Get all blocked words
 */
function getBlockedWords(guildId) {
    const config = loadServerConfig(guildId);
    return config.autoMod.blockedWords || [];
}

/**
 * Delete server config (when bot leaves)
 */
function deleteServerConfig(guildId) {
    const configPath = getConfigPath(guildId);
    try {
        if (fs.existsSync(configPath)) {
            fs.unlinkSync(configPath);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Error deleting config for guild ${guildId}:`, error);
        return false;
    }
}

module.exports = {
    loadServerConfig,
    saveServerConfig,
    updateServerSetting,
    getServerSetting,
    addBlockedWord,
    removeBlockedWord,
    getBlockedWords,
    deleteServerConfig,
    defaultConfig
};
