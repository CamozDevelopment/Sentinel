/* ========================================
   SENTINEL DASHBOARD - ENHANCED JAVASCRIPT
   Feature-Rich Client-Side Functionality
   ======================================== */

// ========================================
// GLOBAL VARIABLES & STATE
// ========================================

let currentGuildId = null;
let currentTheme = localStorage.getItem('theme') || 'dark';
let notificationQueue = [];

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeTheme();
    initializeNotifications();
    initializeAnimations();
    initializeKeyboardShortcuts();
    
    console.log('%c🛡️ Sentinel Dashboard Loaded', 'color: #5865f2; font-size: 20px; font-weight: bold;');
    console.log('%cVersion: 2.0 Enhanced', 'color: #43b581; font-size: 14px;');
});

// ========================================
// NAVIGATION SYSTEM
// ========================================

function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show corresponding section with animation
            const section = link.dataset.section;
            const sections = document.querySelectorAll('.setting-section');
            
            sections.forEach(s => {
                s.classList.remove('active');
                s.style.opacity = '0';
            });
            
            const targetSection = document.getElementById(section + '-section');
            if (targetSection) {
                setTimeout(() => {
                    targetSection.classList.add('active');
                    setTimeout(() => {
                        targetSection.style.opacity = '1';
                    }, 50);
                }, 200);
            }
            
            // Update URL hash
            window.location.hash = section;
            
            // Save last viewed section
            localStorage.setItem('lastSection', section);
        });
    });
    
    // Restore last viewed section
    const lastSection = localStorage.getItem('lastSection') || window.location.hash.substring(1);
    if (lastSection) {
        const link = document.querySelector(`[data-section="${lastSection}"]`);
        if (link) {
            link.click();
        }
    }
}

// ========================================
// THEME SYSTEM
// ========================================

function initializeTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    applyTheme(currentTheme);
}

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
    applyTheme(currentTheme);
    showNotification(`Switched to ${currentTheme} theme`, 'info');
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

// ========================================
// NOTIFICATION SYSTEM
// ========================================

function initializeNotifications() {
    // Create notification container if it doesn't exist
    if (!document.getElementById('notification-container')) {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
}

function showNotification(message, type = 'success', duration = 3000) {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = getNotificationIcon(type);
    
    notification.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto remove
    if (duration > 0) {
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
    
    return notification;
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    return icons[type] || icons.info;
}

// ========================================
// ALERT SYSTEM (Legacy Support)
// ========================================

function showAlert(message, type = 'success') {
    const alert = document.getElementById('alert');
    if (!alert) {
        // Fallback to notification system
        showNotification(message, type);
        return;
    }
    
    alert.innerHTML = `
        <i class="${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    alert.className = `alert alert-${type} show`;
    
    setTimeout(() => {
        alert.classList.remove('show');
    }, 3000);
}

// ========================================
// API HELPER FUNCTIONS
// ========================================

async function updateSetting(setting, value) {
    try {
        showNotification('Saving...', 'info', 1000);
        
        const response = await fetch(`/api/server/${guildId}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ setting, value })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('✓ Setting saved successfully!', 'success');
            return true;
        } else {
            throw new Error(data.error || 'Failed to update setting');
        }
    } catch (error) {
        console.error('Update error:', error);
        showNotification('✗ ' + error.message, 'error');
        return false;
    }
}

async function bulkUpdateSettings(settings) {
    const results = [];
    
    for (const [key, value] of Object.entries(settings)) {
        const result = await updateSetting(key, value);
        results.push(result);
    }
    
    const successCount = results.filter(r => r).length;
    const totalCount = results.length;
    
    if (successCount === totalCount) {
        showNotification(`✓ All ${totalCount} settings saved successfully!`, 'success');
    } else {
        showNotification(`⚠ ${successCount}/${totalCount} settings saved`, 'warning');
    }
    
    return results;
}

// ========================================
// AUTO-MODERATION FUNCTIONS
// ========================================

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
    const settings = {
        'autoMod.maxCapsPercent': parseInt(document.getElementById('automod-maxCapsPercent')?.value || 0),
        'autoMod.maxCapsMinLength': parseInt(document.getElementById('automod-maxCapsMinLength')?.value || 0),
        'autoMod.maxEmojis': parseInt(document.getElementById('automod-maxEmojis')?.value || 0),
        'autoMod.maxMentions': parseInt(document.getElementById('automod-maxMentions')?.value || 0),
        'autoMod.maxDuplicates': parseInt(document.getElementById('automod-maxDuplicates')?.value || 0),
        'autoMod.maxNewlines': parseInt(document.getElementById('automod-maxNewlines')?.value || 0),
        'autoMod.repeatedChars': parseInt(document.getElementById('automod-repeatedChars')?.value || 0)
    };
    
    await bulkUpdateSettings(settings);
}

// ========================================
// ANTI-SPAM FUNCTIONS
// ========================================

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
    const settings = {
        'antiSpam.maxMessages': parseInt(document.getElementById('antispam-maxMessages')?.value || 0),
        'antiSpam.timeWindow': parseInt(document.getElementById('antispam-timeWindow')?.value || 0),
        'antiSpam.muteTime': parseInt(document.getElementById('antispam-muteTime')?.value || 0),
        'antiSpam.maxImages': parseInt(document.getElementById('antispam-maxImages')?.value || 0),
        'antiSpam.maxFiles': parseInt(document.getElementById('antispam-maxFiles')?.value || 0)
    };
    
    await bulkUpdateSettings(settings);
}

// ========================================
// ANTI-NUKE FUNCTIONS
// ========================================

document.getElementById('antinuke-enabled')?.addEventListener('change', (e) => {
    updateSetting('antiNuke.enabled', e.target.checked);
});

document.getElementById('antinuke-notifyUser')?.addEventListener('change', (e) => {
    updateSetting('antiNuke.notifyUser', e.target.checked);
});

document.getElementById('antinuke-removeRoles')?.addEventListener('change', (e) => {
    updateSetting('antiNuke.removeRoles', e.target.checked);
});

async function saveAntiNuke() {
    const settings = {
        'antiNuke.maxChannelDeletes': parseInt(document.getElementById('antinuke-maxChannelDeletes')?.value || 0),
        'antiNuke.maxRoleDeletes': parseInt(document.getElementById('antinuke-maxRoleDeletes')?.value || 0),
        'antiNuke.maxBans': parseInt(document.getElementById('antinuke-maxBans')?.value || 0),
        'antiNuke.maxKicks': parseInt(document.getElementById('antinuke-maxKicks')?.value || 0),
        'antiNuke.timeWindow': parseInt(document.getElementById('antinuke-timeWindow')?.value || 0),
        'antiNuke.punishment': document.getElementById('antinuke-punishment')?.value || 'ban',
        'antiNuke.muteTime': parseInt(document.getElementById('antinuke-muteTime')?.value || 3600000)
    };
    
    await bulkUpdateSettings(settings);
}

// ========================================
// LOGGING FUNCTIONS
// ========================================

document.getElementById('logging-enabled')?.addEventListener('change', (e) => {
    updateSetting('logging.enabled', e.target.checked);
});

['messageDelete', 'messageEdit', 'memberJoin', 'memberLeave', 'memberBan', 
 'roleUpdate', 'channelUpdate', 'nicknameChange', 'voiceActivity'].forEach(event => {
    document.getElementById(`logging-${event}`)?.addEventListener('change', (e) => {
        updateSetting(`logging.${event}`, e.target.checked);
    });
});

async function saveLogging() {
    const settings = {
        'logging.logChannel': document.getElementById('logging-logChannel')?.value || ''
    };
    
    await bulkUpdateSettings(settings);
}

// ========================================
// WELCOME/LEAVE FUNCTIONS
// ========================================

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
    const settings = {
        'welcome.channel': document.getElementById('welcome-channel')?.value || '',
        'welcome.message': document.getElementById('welcome-message')?.value || '',
        'welcome.embedColor': document.getElementById('welcome-embedColor')?.value || '#5865F2',
        'welcome.dmMessage': document.getElementById('welcome-dmMessage')?.value || ''
    };
    
    await bulkUpdateSettings(settings);
}

document.getElementById('leave-enabled')?.addEventListener('change', (e) => {
    updateSetting('leave.enabled', e.target.checked);
});

document.getElementById('leave-embedEnabled')?.addEventListener('change', (e) => {
    updateSetting('leave.embedEnabled', e.target.checked);
});

async function saveLeave() {
    const settings = {
        'leave.channel': document.getElementById('leave-channel')?.value || '',
        'leave.message': document.getElementById('leave-message')?.value || '',
        'leave.embedColor': document.getElementById('leave-embedColor')?.value || '#ED4245'
    };
    
    await bulkUpdateSettings(settings);
}

// ========================================
// AUTO-ROLE FUNCTIONS
// ========================================

document.getElementById('autorole-enabled')?.addEventListener('change', (e) => {
    updateSetting('autoRole.enabled', e.target.checked);
});

async function saveAutoRole() {
    const rolesSelect = document.getElementById('autorole-roles');
    const botRolesSelect = document.getElementById('autorole-botRoles');
    
    const roles = Array.from(rolesSelect?.selectedOptions || []).map(opt => opt.value);
    const botRoles = Array.from(botRolesSelect?.selectedOptions || []).map(opt => opt.value);
    const verificationRole = document.getElementById('autorole-verificationRole')?.value || '';
    
    const settings = {
        'autoRole.roles': roles,
        'autoRole.botRoles': botRoles,
        'autoRole.verificationRole': verificationRole
    };
    
    await bulkUpdateSettings(settings);
}

// ========================================
// MODERATION FUNCTIONS
// ========================================

async function saveModeration() {
    const settings = {
        'moderation.warnThresholdMute': parseInt(document.getElementById('moderation-warnThresholdMute')?.value || 0),
        'moderation.warnThresholdKick': parseInt(document.getElementById('moderation-warnThresholdKick')?.value || 0),
        'moderation.warnThresholdBan': parseInt(document.getElementById('moderation-warnThresholdBan')?.value || 0),
        'moderation.warnExpiry': parseInt(document.getElementById('moderation-warnExpiry')?.value || 2592000000),
        'moderation.muteRole': document.getElementById('moderation-muteRole')?.value || '',
        'moderation.modLogChannel': document.getElementById('moderation-modLogChannel')?.value || ''
    };
    
    await bulkUpdateSettings(settings);
}

// ========================================
// SECURITY FUNCTIONS
// ========================================

document.getElementById('security-raidMode')?.addEventListener('change', (e) => {
    updateSetting('security.raidMode', e.target.checked);
    if (e.target.checked) {
        showNotification('⚠ RAID MODE ACTIVATED - All new joins will be blocked!', 'warning', 5000);
    }
});

document.getElementById('security-antiRaid-enabled')?.addEventListener('change', (e) => {
    updateSetting('security.antiRaid.enabled', e.target.checked);
});

async function saveSecurity() {
    const settings = {
        'security.minAccountAge': parseInt(document.getElementById('security-minAccountAge')?.value || 0),
        'security.verificationLevel': document.getElementById('security-verificationLevel')?.value || 'none',
        'security.antiRaid.joinThreshold': parseInt(document.getElementById('security-antiRaid-joinThreshold')?.value || 0),
        'security.antiRaid.joinTimeWindow': parseInt(document.getElementById('security-antiRaid-joinTimeWindow')?.value || 0),
        'security.antiRaid.action': document.getElementById('security-antiRaid-action')?.value || 'kick'
    };
    
    await bulkUpdateSettings(settings);
}

// ========================================
// BLOCKED WORDS MANAGEMENT
// ========================================

async function addWord() {
    const input = document.getElementById('word-input');
    const word = input?.value.trim();
    
    if (!word) {
        showNotification('Please enter a word', 'warning');
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
            refreshWordsList(data.words);
            input.value = '';
            showNotification(`✓ Added "${word}" to blocked words`, 'success');
        } else {
            showNotification('Word already exists or failed to add', 'warning');
        }
    } catch (error) {
        console.error('Add word error:', error);
        showNotification('Error adding word', 'error');
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
            refreshWordsList(data.words);
            showNotification(`✓ Removed "${word}" from blocked words`, 'success');
        }
    } catch (error) {
        console.error('Remove word error:', error);
        showNotification('Error removing word', 'error');
    }
}

async function bulkAddWords() {
    const textarea = document.getElementById('bulk-input');
    const text = textarea?.value.trim();
    
    if (!text) {
        showNotification('Please enter words separated by commas', 'warning');
        return;
    }
    
    const words = text.split(',').map(w => w.trim()).filter(w => w);
    
    try {
        const response = await fetch(`/api/server/${guildId}/blockedwords/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ words })
        });
        
        const data = await response.json();
        
        if (data.success) {
            refreshWordsList(data.words);
            textarea.value = '';
            showNotification(`✓ Added ${data.added} words (${data.skipped} duplicates skipped)`, 'success');
        }
    } catch (error) {
        console.error('Bulk add error:', error);
        showNotification('Error adding words', 'error');
    }
}

async function addPreset(preset) {
    if (!window.presets || !window.presets[preset]) {
        showNotification('Preset not found', 'error');
        return;
    }
    
    const words = window.presets[preset];
    
    try {
        const response = await fetch(`/api/server/${guildId}/blockedwords/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ words })
        });
        
        const data = await response.json();
        
        if (data.success) {
            refreshWordsList(data.words);
            showNotification(`✓ Added ${data.added} words from ${preset} preset`, 'success');
        }
    } catch (error) {
        console.error('Add preset error:', error);
        showNotification('Error adding preset', 'error');
    }
}

async function clearWords() {
    if (!confirm('Are you sure you want to clear ALL blocked words? This action cannot be undone!')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/server/${guildId}/blockedwords/clear`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        
        if (data.success) {
            refreshWordsList(data.words);
            showNotification('✓ All blocked words cleared', 'success');
        }
    } catch (error) {
        console.error('Clear words error:', error);
        showNotification('Error clearing words', 'error');
    }
}

function refreshWordsList(words) {
    const list = document.getElementById('words-list');
    if (!list) return;
    
    list.innerHTML = words.map(word => `
        <div class="word-tag">
            <span>${escapeHtml(word)}</span>
            <span class="remove" onclick="removeWord('${escapeHtml(word)}')">×</span>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ========================================
// KEYBOARD SHORTCUTS
// ========================================

function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + S to save current section
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            const activeSection = document.querySelector('.nav-link.active')?.dataset.section;
            if (activeSection) {
                const saveBtn = document.querySelector(`#${activeSection}-section .btn-success`);
                if (saveBtn) {
                    saveBtn.click();
                    showNotification('⌨ Quick save triggered', 'info', 1500);
                }
            }
        }
        
        // Escape to close modals/panels
        if (e.key === 'Escape') {
            closeQuickPanel();
        }
    });
}

// ========================================
// ANIMATIONS
// ========================================

function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.server-card, .setting-item, .feature-card').forEach(el => {
        observer.observe(el);
    });
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('✓ Copied to clipboard', 'success', 1500);
    }).catch(err => {
        showNotification('✗ Failed to copy', 'error');
    });
}

// Export functions for global use
window.showNotification = showNotification;
window.showAlert = showAlert;
window.updateSetting = updateSetting;
window.saveAutoMod = saveAutoMod;
window.saveAntiSpam = saveAntiSpam;
window.saveAntiNuke = saveAntiNuke;
window.saveLogging = saveLogging;
window.saveWelcome = saveWelcome;
window.saveLeave = saveLeave;
window.saveAutoRole = saveAutoRole;
window.saveModeration = saveModeration;
window.saveSecurity = saveSecurity;
window.addWord = addWord;
window.removeWord = removeWord;
window.bulkAddWords = bulkAddWords;
window.addPreset = addPreset;
window.clearWords = clearWords;
window.copyToClipboard = copyToClipboard;

console.log('%c✓ All functions loaded', 'color: #43b581; font-size: 12px;');
