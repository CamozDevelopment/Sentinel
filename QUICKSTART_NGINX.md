# ⚡ QUICK START - Nginx & Enhanced Dashboard

## 🚀 Fast Track Setup (5 Minutes)

### 1️⃣ Install Nginx
```bash
sudo apt update && sudo apt install nginx -y
```

### 2️⃣ Create Nginx Config
```bash
sudo nano /etc/nginx/sites-available/bot-dashboard
```

Paste this:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name vmi3007350.contaboserver.net;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Save: `Ctrl+X`, then `Y`, then `Enter`

### 3️⃣ Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/bot-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4️⃣ Test It!
Open: `http://vmi3007350.contaboserver.net` (NO :3000 needed!)

---

## 🔒 Add SSL (HTTPS) - Optional but Recommended

### 1️⃣ Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 2️⃣ Get SSL Certificate
```bash
sudo certbot --nginx -d vmi3007350.contaboserver.net
```

Follow prompts:
- Enter email
- Agree to terms
- Choose: Redirect HTTP to HTTPS (option 2)

### 3️⃣ Done!
Access: `https://vmi3007350.contaboserver.net` 🔒

---

## ⚙️ Update Discord OAuth

**CRITICAL**: Update your Discord app redirect URL!

1. Go to: https://discord.com/developers/applications
2. Select your bot
3. OAuth2 → Redirects
4. Change to: `https://vmi3007350.contaboserver.net/callback`
5. Save

Update your `.env` file:
```bash
nano .env
```

Change:
```env
CALLBACK_URL=https://vmi3007350.contaboserver.net/callback
```

Restart:
```bash
pm2 restart dashboard
```

---

## ✅ Verification Checklist

- [ ] Nginx installed and running
- [ ] Config file created and enabled
- [ ] Dashboard accessible without :3000
- [ ] SSL certificate installed (optional)
- [ ] HTTPS working (if SSL installed)
- [ ] Discord OAuth URL updated
- [ ] Dashboard restarted
- [ ] Can login successfully

---

## 🎯 Quick Commands Reference

```bash
# Check nginx status
sudo systemctl status nginx

# Restart nginx
sudo systemctl restart nginx

# Test nginx config
sudo nginx -t

# View nginx logs
sudo tail -f /var/log/nginx/error.log

# Check dashboard status
pm2 status

# Restart dashboard
pm2 restart dashboard

# View dashboard logs
pm2 logs dashboard

# Check if port 3000 is listening
netstat -tulpn | grep 3000
```

---

## 🆘 Troubleshooting

### Dashboard not accessible?
```bash
# Check if dashboard is running
pm2 status

# Start if stopped
cd ~/sentinel
pm2 start dashboard.js --name dashboard
```

### Nginx not working?
```bash
# Check nginx status
sudo systemctl status nginx

# Check for port conflicts
sudo lsof -i :80
sudo lsof -i :443
```

### SSL issues?
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew
```

### Can't login?
- Make sure Discord OAuth callback URL matches exactly
- Check .env file has correct CALLBACK_URL
- Restart dashboard after changing .env

---

## 🎨 Enhanced Dashboard Features

Your dashboard now has:

✨ **Beautiful Modern Design**
- Glass morphism effects
- Smooth animations
- Gradient backgrounds
- Professional colors

⚡ **New Features**
- Search servers (top bar)
- Filter servers (All/Protected/Recent)
- Grid/List view toggle
- Toast notifications
- Quick actions panel
- Keyboard shortcuts (Ctrl+S to save!)

📱 **Fully Responsive**
- Works on phone, tablet, desktop
- Touch-optimized
- Print-friendly

---

## 📚 More Help

- Full guide: `NGINX_SSL_SETUP.md`
- Features list: `DASHBOARD_ENHANCEMENTS.md`
- Original nginx config: `nginx-config`

---

**That's it! Your dashboard is now professional-grade! 🎉**
