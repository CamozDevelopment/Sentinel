require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const serverConfig = require('./utils/serverConfig');
const { Client, GatewayIntentBits } = require('discord.js');

// Load config from environment variables or fallback to config.json
let config;
try {
    config = require('./config.json');
} catch (e) {
    config = {};
}

// Create Express app
const app = express();
const PORT = process.env.DASHBOARD_PORT || process.env.PORT || config.dashboard?.port || 3000;

// Dashboard configuration
const DASHBOARD_CONFIG = {
    clientId: process.env.CLIENT_ID || config.clientId,
    clientSecret: process.env.CLIENT_SECRET || config.dashboard?.clientSecret || 'YOUR_CLIENT_SECRET_HERE',
    callbackURL: process.env.CALLBACK_URL || config.dashboard?.callbackURL || 'http://localhost:3000/callback',
    sessionSecret: process.env.SESSION_SECRET || config.dashboard?.sessionSecret || 'your-secret-key-change-this'
};

// Log configuration for debugging
console.log('🔧 Dashboard Configuration:');
console.log(`   Client ID: ${DASHBOARD_CONFIG.clientId}`);
console.log(`   Client Secret: ${DASHBOARD_CONFIG.clientSecret ? '***' + DASHBOARD_CONFIG.clientSecret.slice(-4) : 'NOT SET'}`);
console.log(`   Callback URL: ${DASHBOARD_CONFIG.callbackURL}`);
console.log(`   Session Secret: ${DASHBOARD_CONFIG.sessionSecret ? 'SET' : 'NOT SET'}`);

// Setup Discord client (read-only for dashboard)
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ] 
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: DASHBOARD_CONFIG.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 86400000 } // 24 hours
}));
app.use(passport.initialize());
app.use(passport.session());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Passport Discord OAuth2
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
    clientID: DASHBOARD_CONFIG.clientId,
    clientSecret: DASHBOARD_CONFIG.clientSecret,
    callbackURL: DASHBOARD_CONFIG.callbackURL,
    scope: ['identify', 'guilds']
}, (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => done(null, profile));
}));

// Auth middleware
function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

// Routes
app.get('/', (req, res) => {
    res.render('index', { user: req.user });
});

app.get('/login', passport.authenticate('discord'));

app.get('/callback', 
    passport.authenticate('discord', { 
        failureRedirect: '/',
        failureMessage: true 
    }),
    (req, res) => {
        console.log('✅ OAuth callback successful');
        res.redirect('/dashboard');
    }
);

// Error handler for OAuth failures
app.use((err, req, res, next) => {
    if (err) {
        console.error('❌ OAuth Error:', err.message);
        res.redirect('/?error=' + encodeURIComponent(err.message));
    } else {
        next();
    }
});

app.get('/logout', (req, res) => {
    req.logout(() => res.redirect('/'));
});

// Dashboard main page
app.get('/dashboard', checkAuth, async (req, res) => {
    try {
        // Get guilds the user is in
        const userGuilds = req.user.guilds || [];
        
        // Filter guilds where bot is also in and user has manage server permission
        const manageable = userGuilds.filter(guild => {
            const hasPermission = (guild.permissions & 0x20) === 0x20; // MANAGE_GUILD
            const botGuild = client.guilds.cache.get(guild.id);
            return hasPermission && botGuild;
        });

        res.render('dashboard', { 
            user: req.user,
            guilds: manageable
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).send('Error loading dashboard');
    }
});

// Server settings page
app.get('/dashboard/:guildId', checkAuth, async (req, res) => {
    try {
        const { guildId } = req.params;
        const guild = client.guilds.cache.get(guildId);
        
        if (!guild) {
            return res.status(404).send('Server not found or bot not in server');
        }

        // Check if user has permission
        const userGuilds = req.user.guilds || [];
        const userGuild = userGuilds.find(g => g.id === guildId);
        if (!userGuild || (userGuild.permissions & 0x20) !== 0x20) {
            return res.status(403).send('You do not have permission to manage this server');
        }

        // Load server config
        const serverCfg = serverConfig.loadServerConfig(guildId, guild.name);

        // Fetch guild roles and channels
        const roles = guild.roles.cache
            .filter(role => role.id !== guild.id) // Exclude @everyone
            .sort((a, b) => b.position - a.position)
            .map(role => ({
                id: role.id,
                name: role.name,
                color: role.hexColor,
                position: role.position
            }));

        const channels = guild.channels.cache
            .filter(channel => channel.type === 0) // Text channels only
            .sort((a, b) => a.position - b.position)
            .map(channel => ({
                id: channel.id,
                name: channel.name,
                type: channel.type
            }));

        res.render('server', {
            user: req.user,
            guild: {
                id: guild.id,
                name: guild.name,
                icon: guild.iconURL(),
                memberCount: guild.memberCount
            },
            config: serverCfg,
            roles: roles,
            channels: channels
        });
    } catch (error) {
        console.error('Server page error:', error);
        res.status(500).send('Error loading server settings');
    }
});

// API Routes

// Get server config
app.get('/api/server/:guildId/config', checkAuth, async (req, res) => {
    try {
        const { guildId } = req.params;
        const guild = client.guilds.cache.get(guildId);
        
        if (!guild) {
            return res.status(404).json({ error: 'Server not found' });
        }

        const serverCfg = serverConfig.loadServerConfig(guildId, guild.name);
        res.json(serverCfg);
    } catch (error) {
        console.error('Get config error:', error);
        res.status(500).json({ error: 'Failed to load configuration' });
    }
});

// Update server settings
app.post('/api/server/:guildId/settings', checkAuth, async (req, res) => {
    try {
        const { guildId } = req.params;
        const { setting, value } = req.body;
        
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).json({ error: 'Server not found' });
        }

        const serverCfg = serverConfig.loadServerConfig(guildId, guild.name);

        // Update the setting based on path
        const keys = setting.split('.');
        let current = serverCfg;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;

        serverConfig.saveServerConfig(guildId, serverCfg);
        res.json({ success: true, config: serverCfg });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Blocked words management
app.get('/api/server/:guildId/blockedwords', checkAuth, async (req, res) => {
    try {
        const { guildId } = req.params;
        const words = serverConfig.getBlockedWords(guildId);
        res.json({ words });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load blocked words' });
    }
});

app.post('/api/server/:guildId/blockedwords/add', checkAuth, async (req, res) => {
    try {
        const { guildId } = req.params;
        const { word } = req.body;
        
        const added = serverConfig.addBlockedWord(guildId, word);
        const words = serverConfig.getBlockedWords(guildId);
        
        res.json({ success: added, words });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add word' });
    }
});

app.post('/api/server/:guildId/blockedwords/remove', checkAuth, async (req, res) => {
    try {
        const { guildId } = req.params;
        const { word } = req.body;
        
        const removed = serverConfig.removeBlockedWord(guildId, word);
        const words = serverConfig.getBlockedWords(guildId);
        
        res.json({ success: removed, words });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove word' });
    }
});

app.post('/api/server/:guildId/blockedwords/bulk', checkAuth, async (req, res) => {
    try {
        const { guildId } = req.params;
        const { words } = req.body;
        
        let added = 0;
        let skipped = 0;
        
        for (const word of words) {
            if (serverConfig.addBlockedWord(guildId, word.trim())) {
                added++;
            } else {
                skipped++;
            }
        }
        
        const allWords = serverConfig.getBlockedWords(guildId);
        res.json({ success: true, added, skipped, words: allWords });
    } catch (error) {
        res.status(500).json({ error: 'Failed to bulk add words' });
    }
});

app.delete('/api/server/:guildId/blockedwords/clear', checkAuth, async (req, res) => {
    try {
        const { guildId } = req.params;
        const guild = client.guilds.cache.get(guildId);
        
        const cfg = serverConfig.loadServerConfig(guildId, guild?.name);
        cfg.autoMod.blockedWords = [];
        serverConfig.saveServerConfig(guildId, cfg);
        
        res.json({ success: true, words: [] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear words' });
    }
});

// Start bot client
client.login(config.token).then(() => {
    console.log('✅ Bot client connected for dashboard');
    
    // Start web server after bot is ready (listen on all interfaces)
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🌐 Dashboard running at http://0.0.0.0:${PORT}`);
        console.log(`📝 Access at http://vmi3007350.contaboserver.net:${PORT}`);
    });
});
