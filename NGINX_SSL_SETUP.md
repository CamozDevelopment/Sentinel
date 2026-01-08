# Nginx & SSL Setup Guide

This guide will help you set up Nginx as a reverse proxy and add HTTPS/SSL to your dashboard.

## Step 1: Install Nginx

```bash
sudo apt update
sudo apt install nginx -y
```

## Step 2: Configure Nginx

1. Create the nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/bot-dashboard
```

2. Copy the contents from the `nginx-config` file in this directory, or paste:
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

3. Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/bot-dashboard /etc/nginx/sites-enabled/
```

4. Test nginx configuration:
```bash
sudo nginx -t
```

5. Restart nginx:
```bash
sudo systemctl restart nginx
```

6. Now you can access your dashboard at: `http://vmi3007350.contaboserver.net` (without :3000!)

## Step 3: Install Certbot for SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
```

## Step 4: Obtain SSL Certificate

```bash
sudo certbot --nginx -d vmi3007350.contaboserver.net
```

Follow the prompts:
- Enter your email address
- Agree to terms of service
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

Certbot will automatically:
- Obtain the SSL certificate
- Update your nginx configuration
- Set up auto-renewal

## Step 5: Verify SSL is Working

Visit: `https://vmi3007350.contaboserver.net` (note the **https**)

## Step 6: Auto-Renewal Setup

SSL certificates expire after 90 days. Certbot sets up auto-renewal automatically.

Test auto-renewal:
```bash
sudo certbot renew --dry-run
```

If successful, your certificates will auto-renew!

## Step 7: Update Discord OAuth Callback URL

⚠️ **IMPORTANT**: Update your Discord application settings!

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your bot application
3. Go to OAuth2 settings
4. Update the Redirect URL to: `https://vmi3007350.contaboserver.net/callback`
5. Save changes

Also update your `.env` file or config:
```env
CALLBACK_URL=https://vmi3007350.contaboserver.net/callback
```

Then restart the dashboard:
```bash
pm2 restart dashboard
```

## Troubleshooting

### Port 80/443 Already in Use
```bash
# Check what's using the ports
sudo lsof -i :80
sudo lsof -i :443

# Stop apache2 if it's running
sudo systemctl stop apache2
sudo systemctl disable apache2
```

### Nginx Won't Start
```bash
# Check nginx status and logs
sudo systemctl status nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal
```

### Dashboard Not Loading
```bash
# Verify dashboard is running
pm2 status
pm2 logs dashboard

# Check if port 3000 is listening
netstat -tulpn | grep 3000
```

## Firewall Configuration

If you have a firewall enabled, allow HTTP and HTTPS:
```bash
sudo ufw allow 'Nginx Full'
sudo ufw reload
```

## Summary

After completing these steps:
- ✅ Access dashboard at `http://vmi3007350.contaboserver.net` (no port needed)
- ✅ Automatic redirect to HTTPS
- ✅ Secure connection with Let's Encrypt SSL
- ✅ Auto-renewal of certificates
- ✅ Professional production setup

## Notes

- SSL certificates auto-renew every 60 days
- Certbot runs twice daily to check for renewals
- Your dashboard runs on port 3000 internally, but Nginx handles external access on ports 80/443
- Keep your dashboard running with PM2 (`pm2 start dashboard.js --name dashboard`)
