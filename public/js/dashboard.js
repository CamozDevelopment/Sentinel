// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Show corresponding section
        const section = link.dataset.section;
        document.querySelectorAll('.setting-section').forEach(s => s.classList.remove('active'));
        document.getElementById(section + '-section').classList.add('active');
    });
});

// Alert System
function showAlert(message, type = 'success') {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.className = `alert alert-${type} show`;
    
    setTimeout(() => {
        alert.classList.remove('show');
    }, 3000);
}

// API Helper
async function updateSetting(setting, value) {
    try {
        const response = await fetch(`/api/server/${guildId}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ setting, value })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Setting updated successfully!', 'success');
            return true;
        } else {
            showAlert('Failed to update setting', 'danger');
            return false;
        }
    } catch (error) {
        console.error('Update error:', error);
        showAlert('Error updating setting', 'danger');
        return false;
    }
}

// Auto-Moderation
document.getElementById('automod-enabled')?.addEventListener('change', (e) => {
    updateSetting('autoMod.enabled', e.target.checked);
});

document.getElementById('automod-blockLinks')?.addEventListener('change', (e) => {
    updateSetting('autoMod.blockLinks', e.target.checked);
});

document.getElementById('automod-blockInvites')?.addEventListener('change', (e) => {
    updateSetting('autoMod.blockInvites', e.target.checked);
});

document.getElementById('automod-blockZalgo')?.addEventListener('change', (e) => {
    updateSetting('autoMod.blockZalgo', e.target.checked);
});

document.getElementById('automod-blockSpoilers')?.addEventListener('change', (e) => {
    updateSetting('autoMod.blockSpoilers', e.target.checked);
});

async function saveAutoMod() {
    const maxCapsPercent = parseInt(document.getElementById('automod-maxCapsPercent').value);
    const maxCapsMinLength = parseInt(document.getElementById('automod-maxCapsMinLength').value);
    const maxEmojis = parseInt(document.getElementById('automod-maxEmojis').value);
    const maxMentions = parseInt(document.getElementById('automod-maxMentions').value);
    const maxDuplicates = parseInt(document.getElementById('automod-maxDuplicates').value);
    const maxNewlines = parseInt(document.getElementById('automod-maxNewlines').value);
    const repeatedChars = parseInt(document.getElementById('automod-repeatedChars').value);
    
    await updateSetting('autoMod.maxCapsPercent', maxCapsPercent);
    await updateSetting('autoMod.maxCapsMinLength', maxCapsMinLength);
    await updateSetting('autoMod.maxEmojis', maxEmojis);
    await updateSetting('autoMod.maxMentions', maxMentions);
    await updateSetting('autoMod.maxDuplicates', maxDuplicates);
    await updateSetting('autoMod.maxNewlines', maxNewlines);
    await updateSetting('autoMod.repeatedChars', repeatedChars);
}

// Anti-Spam
document.getElementById('antispam-enabled')?.addEventListener('change', (e) => {
    updateSetting('antiSpam.enabled', e.target.checked);
});

document.getElementById('antispam-imageSpam')?.addEventListener('change', (e) => {
    updateSetting('antiSpam.imageSpam', e.target.checked);
});

document.getElementById('antispam-fileSpam')?.addEventListener('change', (e) => {
    updateSetting('antiSpam.fileSpam', e.target.checked);
});

async function saveAntiSpam() {
    const maxMessages = parseInt(document.getElementById('antispam-maxMessages').value);
    const timeWindow = parseInt(document.getElementById('antispam-timeWindow').value);
    const muteTime = parseInt(document.getElementById('antispam-muteTime').value);
    const maxImages = parseInt(document.getElementById('antispam-maxImages').value);
    const maxFiles = parseInt(document.getElementById('antispam-maxFiles').value);
    
    await updateSetting('antiSpam.maxMessages', maxMessages);
    await updateSetting('antiSpam.timeWindow', timeWindow);
    await updateSetting('antiSpam.muteTime', muteTime);
    await updateSetting('antiSpam.maxImages', maxImages);
    await updateSetting('antiSpam.maxFiles', maxFiles);
}

// Anti-Nuke
document.getElementById('antinuke-enabled')?.addEventListener('change', (e) => {
    updateSetting('antiNuke.enabled', e.target.checked);
});

async function saveAntiNuke() {
    const maxChannelDeletes = parseInt(document.getElementById('antinuke-maxChannelDeletes').value);
    const maxRoleDeletes = parseInt(document.getElementById('antinuke-maxRoleDeletes').value);
    const maxBans = parseInt(document.getElementById('antinuke-maxBans').value);
    const maxKicks = parseInt(document.getElementById('antinuke-maxKicks').value);
    const timeWindow = parseInt(document.getElementById('antinuke-timeWindow').value);
    const punishment = document.getElementById('antinuke-punishment').value;
    const muteTime = parseInt(document.getElementById('antinuke-muteTime').value);
    const notifyUser = document.getElementById('antinuke-notifyUser').checked;
    const removeRoles = document.getElementById('antinuke-removeRoles').checked;
    
    await updateSetting('antiNuke.maxChannelDeletes', maxChannelDeletes);
    await updateSetting('antiNuke.maxRoleDeletes', maxRoleDeletes);
    await updateSetting('antiNuke.maxBans', maxBans);
    await updateSetting('antiNuke.maxKicks', maxKicks);
    await updateSetting('antiNuke.timeWindow', timeWindow);
    await updateSetting('antiNuke.punishment', punishment);
    await updateSetting('antiNuke.muteTime', muteTime);
    await updateSetting('antiNuke.notifyUser', notifyUser);
    await updateSetting('antiNuke.removeRoles', removeRoles);
}

// Blocked Words Management
async function loadWords() {
    try {
        const response = await fetch(`/api/server/${guildId}/blockedwords`);
        const data = await response.json();
        
        const wordsList = document.getElementById('words-list');
        wordsList.innerHTML = '';
        
        data.words.forEach(word => {
            const tag = document.createElement('div');
            tag.className = 'word-tag';
            tag.innerHTML = `
                <span>${word}</span>
                <span class="remove" onclick="removeWord('${word.replace(/'/g, "\\'")}')">×</span>
            `;
            wordsList.appendChild(tag);
        });
    } catch (error) {
        console.error('Load words error:', error);
    }
}

async function addWord() {
    const input = document.getElementById('word-input');
    const word = input.value.trim();
    
    if (!word) {
        showAlert('Please enter a word', 'danger');
        return;
    }
    
    try {
        const response = await fetch(`/api/server/${guildId}/blockedwords/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Word added successfully!', 'success');
            input.value = '';
            await loadWords();
        } else {
            showAlert('Word already exists', 'danger');
        }
    } catch (error) {
        console.error('Add word error:', error);
        showAlert('Error adding word', 'danger');
    }
}

async function removeWord(word) {
    try {
        const response = await fetch(`/api/server/${guildId}/blockedwords/remove`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Word removed!', 'success');
            await loadWords();
        } else {
            showAlert('Failed to remove word', 'danger');
        }
    } catch (error) {
        console.error('Remove word error:', error);
        showAlert('Error removing word', 'danger');
    }
}

async function bulkAddWords() {
    const input = document.getElementById('bulk-input');
    const text = input.value.trim();
    
    if (!text) {
        showAlert('Please enter words', 'danger');
        return;
    }
    
    const words = text.split(',').map(w => w.trim()).filter(w => w.length > 0);
    
    if (words.length === 0) {
        showAlert('No valid words found', 'danger');
        return;
    }
    
    try {
        const response = await fetch(`/api/server/${guildId}/blockedwords/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ words })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert(`Added ${data.added} words, skipped ${data.skipped} duplicates`, 'success');
            input.value = '';
            await loadWords();
        } else {
            showAlert('Failed to add words', 'danger');
        }
    } catch (error) {
        console.error('Bulk add error:', error);
        showAlert('Error adding words', 'danger');
    }
}

async function addPreset(presetName) {
    const words = presets[presetName];
    
    if (!words) {
        showAlert('Invalid preset', 'danger');
        return;
    }
    
    try {
        const response = await fetch(`/api/server/${guildId}/blockedwords/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ words })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert(`Added preset: ${data.added} words added, ${data.skipped} skipped`, 'success');
            await loadWords();
        } else {
            showAlert('Failed to add preset', 'danger');
        }
    } catch (error) {
        console.error('Add preset error:', error);
        showAlert('Error adding preset', 'danger');
    }
}

async function clearWords() {
    if (!confirm('Are you sure you want to clear all blocked words?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/server/${guildId}/blockedwords/clear`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('All words cleared!', 'success');
            await loadWords();
        } else {
            showAlert('Failed to clear words', 'danger');
        }
    } catch (error) {
        console.error('Clear words error:', error);
        showAlert('Error clearing words', 'danger');
    }
}

// Enter key support for word input
document.getElementById('word-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addWord();
    }
});

// Logging
document.getElementById('logging-enabled')?.addEventListener('change', (e) => {
    updateSetting('logging.enabled', e.target.checked);
});

['messageDelete', 'messageEdit', 'memberJoin', 'memberLeave', 'memberBan', 'roleUpdate', 'channelUpdate', 'nicknameChange', 'voiceActivity'].forEach(event => {
    document.getElementById(`logging-${event}`)?.addEventListener('change', (e) => {
        updateSetting(`logging.${event}`, e.target.checked);
    });
});

async function saveLogging() {
    const logChannel = document.getElementById('logging-logChannel').value;
    await updateSetting('logging.logChannel', logChannel);
}

// Welcome Messages
document.getElementById('welcome-enabled')?.addEventListener('change', (e) => {
    updateSetting('welcome.enabled', e.target.checked);
});

document.getElementById('welcome-embedEnabled')?.addEventListener('change', (e) => {
    updateSetting('welcome.embedEnabled', e.target.checked);
});

document.getElementById('welcome-dmUser')?.addEventListener('change', (e) => {
    updateSetting('welcome.dmUser', e.target.checked);
});

async function saveWelcome() {
    const channel = document.getElementById('welcome-channel').value;
    const message = document.getElementById('welcome-message').value;
    const embedColor = document.getElementById('welcome-embedColor').value;
    const dmMessage = document.getElementById('welcome-dmMessage').value;
    
    await updateSetting('welcome.channel', channel);
    await updateSetting('welcome.message', message);
    await updateSetting('welcome.embedColor', embedColor);
    await updateSetting('welcome.dmMessage', dmMessage);
}

// Leave Messages
document.getElementById('leave-enabled')?.addEventListener('change', (e) => {
    updateSetting('leave.enabled', e.target.checked);
});

document.getElementById('leave-embedEnabled')?.addEventListener('change', (e) => {
    updateSetting('leave.embedEnabled', e.target.checked);
});

async function saveLeave() {
    const channel = document.getElementById('leave-channel').value;
    const message = document.getElementById('leave-message').value;
    const embedColor = document.getElementById('leave-embedColor').value;
    
    await updateSetting('leave.channel', channel);
    await updateSetting('leave.message', message);
    await updateSetting('leave.embedColor', embedColor);
}

// Auto-Role
document.getElementById('autorole-enabled')?.addEventListener('change', (e) => {
    updateSetting('autoRole.enabled', e.target.checked);
});

async function saveAutoRole() {
    const rolesSelect = document.getElementById('autorole-roles');
    const botRolesSelect = document.getElementById('autorole-botRoles');
    const verificationRole = document.getElementById('autorole-verificationRole').value;
    
    // Get selected options from multi-select
    const roles = Array.from(rolesSelect.selectedOptions).map(option => option.value);
    const botRoles = Array.from(botRolesSelect.selectedOptions).map(option => option.value);
    
    await updateSetting('autoRole.roles', roles);
    await updateSetting('autoRole.botRoles', botRoles);
    await updateSetting('autoRole.verificationRole', verificationRole);
}

// Moderation
async function saveModeration() {
    const warnThresholdMute = parseInt(document.getElementById('moderation-warnThresholdMute').value);
    const warnThresholdKick = parseInt(document.getElementById('moderation-warnThresholdKick').value);
    const warnThresholdBan = parseInt(document.getElementById('moderation-warnThresholdBan').value);
    const warnExpiry = parseInt(document.getElementById('moderation-warnExpiry').value);
    const muteRole = document.getElementById('moderation-muteRole').value;
    const modLogChannel = document.getElementById('moderation-modLogChannel').value;
    
    await updateSetting('moderation.warnThresholdMute', warnThresholdMute);
    await updateSetting('moderation.warnThresholdKick', warnThresholdKick);
    await updateSetting('moderation.warnThresholdBan', warnThresholdBan);
    await updateSetting('moderation.warnExpiry', warnExpiry);
    await updateSetting('moderation.muteRole', muteRole);
    await updateSetting('moderation.modLogChannel', modLogChannel);
}

// Security
document.getElementById('security-raidMode')?.addEventListener('change', (e) => {
    updateSetting('security.raidMode', e.target.checked);
});

document.getElementById('security-antiRaid-enabled')?.addEventListener('change', (e) => {
    updateSetting('security.antiRaid.enabled', e.target.checked);
});

async function saveSecurity() {
    const minAccountAge = parseInt(document.getElementById('security-minAccountAge').value);
    const verificationLevel = document.getElementById('security-verificationLevel').value;
    const joinThreshold = parseInt(document.getElementById('security-antiRaid-joinThreshold').value);
    const joinTimeWindow = parseInt(document.getElementById('security-antiRaid-joinTimeWindow').value);
    const action = document.getElementById('security-antiRaid-action').value;
    
    await updateSetting('security.minAccountAge', minAccountAge);
    await updateSetting('security.verificationLevel', verificationLevel);
    await updateSetting('security.antiRaid.joinThreshold', joinThreshold);
    await updateSetting('security.antiRaid.joinTimeWindow', joinTimeWindow);
    await updateSetting('security.antiRaid.action', action);
}
