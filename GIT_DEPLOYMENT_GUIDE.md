# 🚀 GitHub Deployment Guide

## Step 1: Commit & Push from Windows

Run these commands in your terminal:

```powershell
# Navigate to your project
cd C:\Users\dylan\Desktop\Bot

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit with a message
git commit -m "Enhanced dashboard with nginx support, modern UI, and new features"

# Add your GitHub repository (replace with your actual repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

If you get an error about "main" vs "master", try:
```powershell
git branch -M main
git push -u origin main
```

---

## Step 2: Pull on VPS (No Nano Needed!)

SSH into your VPS, then:

```bash
# Navigate to your project directory
cd ~/sentinel

# If this is the first time, clone the repo:
# git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git .

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Restart the bot and dashboard
pm2 restart all

# Or restart individually:
pm2 restart bot
pm2 restart dashboard
```

---

## Step 3: Future Updates (Easy Workflow)

### On Windows (Make Changes):
```powershell
cd C:\Users\dylan\Desktop\Bot
git add .
git commit -m "Description of changes"
git push origin main
```

### On VPS (Update):
```bash
cd ~/sentinel
git pull origin main
npm install
pm2 restart all
```

That's it! No more nano! 🎉

---

## 🔐 Important: Environment Variables

Your `.env` file is NOT pushed to GitHub (it's in .gitignore).

**On the VPS, create/update your .env manually ONE TIME:**

```bash
cd ~/sentinel
nano .env
```

Paste your environment variables:
```env
TOKEN=your_discord_bot_token
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
CALLBACK_URL=https://vmi3007350.contaboserver.net/callback
SESSION_SECRET=your_random_secret_key
DASHBOARD_PORT=3000
```

Save and exit (Ctrl+X, Y, Enter).

**You only need to do this ONCE.** Future git pulls won't overwrite it!

---

## 📦 Files That Are Safe (Not Pushed to GitHub)

These files are in `.gitignore` and won't be pushed:
- ✅ `.env` (secrets)
- ✅ `config.json` (sensitive config)
- ✅ `servers/` (server data)
- ✅ `globalBans.json` (ban data)
- ✅ `node_modules/` (dependencies)
- ✅ `*.backup` files
- ✅ Log files

---

## 🆘 Troubleshooting

### "Permission denied" or "Authentication failed"
Use a personal access token instead of password:
1. Go to GitHub → Settings → Developer Settings → Personal Access Tokens
2. Generate new token (classic)
3. Use token as password when pushing

Or set up SSH keys:
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
cat ~/.ssh/id_ed25519.pub
# Copy this and add to GitHub → Settings → SSH Keys
```

### "fatal: not a git repository"
```bash
git init
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### Merge conflicts on pull
```bash
# Keep remote version (GitHub)
git pull origin main --strategy-option theirs

# Or keep local version
git pull origin main --strategy-option ours
```

### Need to undo last commit
```bash
git reset --soft HEAD~1
```

---

## 🎯 Best Practices

1. **Always commit before major changes**
   ```bash
   git add .
   git commit -m "Backup before trying X"
   ```

2. **Use descriptive commit messages**
   - ✅ "Add nginx config and SSL support"
   - ✅ "Fix notification system bug"
   - ❌ "update"
   - ❌ "changes"

3. **Pull before you edit on VPS**
   ```bash
   git pull origin main
   ```

4. **Test locally before pushing**
   ```bash
   npm test  # if you have tests
   node index.js  # quick test
   ```

---

## 🔄 Complete Workflow Example

**Scenario: You updated the dashboard on Windows**

**On Windows:**
```powershell
cd C:\Users\dylan\Desktop\Bot
git status  # See what changed
git add .
git commit -m "Updated dashboard UI with new features"
git push origin main
```

**On VPS:**
```bash
cd ~/sentinel
git pull origin main
npm install  # In case you added new packages
pm2 restart dashboard
pm2 logs dashboard  # Check if it started correctly
```

**Done!** Your VPS now has the latest code! 🚀

---

## 📝 Quick Reference

```bash
# Common Git Commands
git status          # See what changed
git add .           # Stage all changes
git add file.js     # Stage specific file
git commit -m "msg" # Commit with message
git push            # Push to GitHub
git pull            # Pull from GitHub
git log             # See commit history
git diff            # See changes

# PM2 Commands
pm2 list            # List all processes
pm2 restart all     # Restart everything
pm2 restart bot     # Restart specific process
pm2 logs            # View logs
pm2 logs dashboard  # View specific logs
pm2 stop all        # Stop all
pm2 delete all      # Remove all processes
```

---

**No more nano for code updates! Just edit locally and push to GitHub! 🎉**
