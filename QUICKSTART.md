# 🚀 BoostClient Quick Start Guide

## 📦 Installation

You have **2 ways** to run BoostClient:

### Option 1: Installer (Recommended for Most Users)
1. Run `boostclient-setup-1.2.0.exe`
2. Choose installation directory (default: `C:\Program Files\BoostClient`)
3. Follow the wizard and create desktop shortcut
4. Launch from Start Menu or Desktop

### Option 2: Portable (No Installation)
1. Run `boostclient-1.2.0.exe` directly from any folder
2. All data stored in `%APPDATA%\BoostClient`
3. Perfect for USB drives or testing

---

## 🎮 First Time Setup

### 1. Add Your First Account
1. Click your profile icon (top right)
2. Choose authentication method:
   - **Offline Mode** (Cracked): Enter any username → Play instantly
   - **Microsoft Account**: Click "Login with Microsoft" → Follow device code flow

### 2. Create Your First Profile
1. Navigate to **Profiles** tab (sidebar)
2. Click **"Create New Profile"**
3. Configure:
   - **Name**: e.g. "Survival 1.20.4"
   - **Minecraft Version**: 1.20.4 (or any release)
   - **Mod Loader**: Fabric (recommended for FPS)
   - **BoostX Mod Suite**: Check "Install BoostX"
   - **Mod Preset**: Select "Performance" (installs Sodium, Lithium, FerriteCore)
   - **Performance Engine**: Ultra 10x (Aikar's flags for maximum FPS)
   - **RAM**: Slide to 4-8 GB
4. Click **Save Profile** → BoostClient auto-downloads mods!

### 3. Launch Minecraft
1. Go to **Play** tab
2. Select your profile from dropdown
3. Click the big **"Launch"** button
4. Watch the progress bar → Game launches automatically!

**In-Game**: Press **Right Shift** to open the BoostX Client Menu with 100+ modules!

---

## 🖥️ Host Your First Server (Zero Port Forwarding!)

### 1. Create a Server
1. Navigate to **Servers** tab
2. Click **"Create New Server"**
3. Configure:
   - **Name**: e.g. "Survival Server"
   - **Platform**: Paper (recommended for performance)
   - **Version**: 1.20.4
   - **Port**: 25565 (default)
   - **RAM**: 4 GB (min 2 GB for smooth gameplay)
   - **Auto-Start Playit Tunnel**: ✅ Check this!
4. Click **Create** → BoostClient downloads Paper automatically

### 2. Start Your Server
1. Click on your server card
2. **Overview Tab** opens (Aternos-style dashboard)
3. Click **Start** button
4. Watch console logs stream in real-time
5. **Playit tunnel auto-starts** and displays:
   - `localhost:25565` (for you to join)
   - `xyz.gl.joinmc.link` (public IP for friends worldwide)

### 3. Share the Server with Friends
1. Look at the **Public IP Card** (right side)
2. Click **"Copy IP"** button
3. Send the copied IP to your friends
4. They can join **instantly** without port forwarding!

### 4. Manage Your Server

**Console Commands:**
- Type commands directly in the command bar: `/op <username>`, `/gamemode creative`, `/whitelist add <name>`

**Files Tab:**
- Click **"Open Server Folder in File Explorer"** → Drag & drop plugins, worlds, configs directly!

**Plugins/Mods Tab:**
- Enable/disable plugins with toggles
- Click **"Search & Install Plugins"** → Browse Modrinth directly

**Settings Tab:**
- **Cracked Mode**: Toggle "Online Mode" OFF to allow cracked players
- **MOTD**: Customize server name with Minecraft color codes
- **Max Players**: Slide to set player limit
- **Difficulty**: Peaceful, Easy, Normal, Hard
- **PvP**: Toggle player vs player combat

**Version Tab:**
- Switch platforms: Paper → Purpur, Fabric, Forge, Vanilla
- Auto-downloads new server.jar

---

## 🛒 Install Mods from the Store

### For Game Profiles:
1. Navigate to **Store** tab
2. Use filters:
   - **Category**: Mods, Modpacks, Resource Packs, Shaders
   - **Minecraft Version**: Match your profile (e.g. 1.20.4)
   - **Loader**: Fabric, Forge, NeoForge
3. Search for a mod (e.g. "Sodium", "Iris Shaders")
4. Click **"Install to Profile"** → Select your profile
5. **Dependencies auto-install!** (e.g. Fabric API, Sodium, Indium)

### For Servers:
1. Open server dashboard → **Plugins/Mods Tab**
2. Click **"Search & Install"**
3. Same Modrinth interface → Click **"Install to Server"**

---

## ⚡ BoostX Client Mod (100+ Modules)

After installing BoostX in your profile:

1. Launch Minecraft with that profile
2. **Press Right Shift** in-game
3. Opens the BoostX GUI with categories:
   - **PvP**: Keystrokes, CPS Counter, Combo Counter, Toggle Sprint
   - **HUD**: FPS, Ping, Coordinates, RAM Monitor
   - **Visuals**: Fullbright, Time Changer, Fog Customizer
   - **Utility**: Zoom (C key), Waypoints, Minimap
   - **World**: Light Level, Chunk Borders (F9)
   - **Performance**: FPS Boost, Sodium/Lithium Integration

4. Click any module → Configure:
   - Scale, Color, Chroma, Position, Hotkey
   - Save settings (auto-synced per profile)

---

## 🌐 Advanced: Custom Domain with Cloudflare Tunnel

Want your server at `play.yourdomain.com` instead of `xyz.gl.joinmc.link`?

### Requirements:
- Own domain (e.g. from Cloudflare, Namecheap, GoDaddy)
- Cloudflare account (free)
- Cloudflare Tunnel token

### Setup:
1. Go to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/)
2. Create a new Tunnel → Copy the **Token**
3. In BoostClient server dashboard → **Settings Tab** → **Cloudflare Tunnel**:
   - Paste your **Tunnel Token**
   - Enter your **Custom Domain** (e.g. `play.yourdomain.com`)
   - Click **"Start Tunnel"**
4. BoostClient auto-configures cloudflared.exe
5. Players join with just: `play.yourdomain.com` (no port needed!)

---

## 🎨 Customize Appearance

1. Navigate to **Settings** tab
2. **Theme Selector**:
   - **Aternos Dark** (Default) - Authentic Aternos look
   - **Midnight OLED** - Pure black for OLED screens
   - **Clean Light** - Bright daylight theme
   - **Minecraft Emerald** - Forest green accents
   - **Cyberpunk Neon** - Purple & cyan vibes

---

## 🔄 Auto-Updates

BoostClient checks for updates on startup:

### Critical Security Updates:
- Auto-downloads and prompts restart
- No user permission required for safety

### Feature Updates:
- Shows update dialog: "Update Now" or "Later"
- Release notes displayed in-app
- Never forces updates

**Your data is always safe!** Profiles, servers, mods, worlds are **never deleted** on update.

---

## 📂 Data Locations

All BoostClient data stored in:
- **Windows**: `%APPDATA%\BoostClient\`
- **Directory Structure**:
  ```
  BoostClient/
  ├── config.json          # Profiles, servers, accounts
  ├── bin/
  │   ├── playit.exe       # Auto-downloaded tunnel
  │   └── cloudflared.exe  # Auto-downloaded Cloudflare
  ├── servers/
  │   └── server-<id>/     # Each server isolated
  ├── profiles/
  │   └── profile-<id>/
  │       ├── mods/        # Your installed mods
  │       ├── saves/       # Your worlds
  │       └── config/
  │           └── boostx/  # BoostX settings
  ├── assets/              # Mojang assets (shared)
  └── libraries/           # Maven libraries (shared)
  ```

---

## 🆘 Troubleshooting

### "Java not found"
- Install Java 17 or 21 from [Adoptium](https://adoptium.net/)
- BoostClient auto-detects installed Java versions

### "Server won't start"
- Check RAM allocation (min 2 GB recommended)
- Verify Java 17+ is installed
- Check console logs for errors
- Click **"Open Logs"** in server dashboard

### "Playit tunnel not connecting"
- Check if port 25565 is already in use
- Restart server → Tunnel auto-reconnects
- Visit [Playit.gg Status](https://status.playit.gg/)

### "Mod won't load"
- Verify mod version matches Minecraft version (e.g. mod 1.20.4 → MC 1.20.4)
- Check mod loader compatibility (Fabric mod needs Fabric profile)
- Install dependencies (BoostClient usually auto-installs)

### "Can't join server (cracked players)"
- Server dashboard → **Settings Tab** → Set **"Online Mode"** to **OFF**
- Restart server → Cracked players can now join!

---

## 🔑 Keyboard Shortcuts

- **Ctrl+Tab**: Switch profiles quickly
- **Ctrl+R**: Restart selected server
- **Ctrl+L**: Open server logs
- **Ctrl+,**: Open settings
- **F5**: Refresh Modrinth store
- **Esc**: Close any modal

---

## 💡 Pro Tips

### Max Performance Client:
- Use **Fabric** loader
- Install **Performance Preset** (Sodium, Lithium, FerriteCore)
- Enable **Ultra 10x** performance engine
- Allocate **6-8 GB RAM**
- Check **BoostX** mod for additional FPS modules

### Max Performance Server:
- Use **Paper** or **Purpur** platform
- Allocate **4-8 GB RAM** (more for modded)
- Let BoostClient auto-optimize `server.properties`
- Install only essential plugins

### Best Shaders Experience:
- Use **Visual Preset** (auto-installs Iris + Continuity)
- Allocate **8 GB+ RAM**
- Download shaders from **Store → Shaders** category
- Enable **BoostX → Performance → Shader Optimization**

### Multi-Version Testing:
- Create separate profiles per version (e.g. "1.20.4 Vanilla", "1.19.4 Fabric", "1.8.9 PvP")
- Assets/libraries are shared → No duplicate downloads!

---

## 🎯 What Makes BoostClient Special?

✅ **100% FREE Forever** - No premium tiers, no paywalls  
✅ **Zero Port Forwarding** - Playit.gg + Cloudflare Tunnel built-in  
✅ **Aternos-Style UI** - Familiar, intuitive server management  
✅ **10x Performance** - Aikar's flags + curated mod presets  
✅ **BoostX Mod** - 100+ modules (FPS, PvP, HUD, visuals)  
✅ **Auto-Dependency Resolution** - Install mods without manual downloads  
✅ **Dual Authentication** - Offline (cracked) + Microsoft OAuth  
✅ **Direct File Access** - "Open in File Explorer" for zero-friction management  
✅ **Auto-Plugin Setup** - Simple Voice Chat, GeyserMC auto-configured  
✅ **Safe Auto-Updates** - Never corrupts or deletes your data  

---

## 📚 Need More Help?

- **Full Documentation**: [https://docs.boostclient.net](https://docs.boostclient.net)
- **Discord Community**: [https://discord.gg/boostclient](https://discord.gg/boostclient)
- **GitHub Issues**: [https://github.com/boostclient/boostclient/issues](https://github.com/boostclient/boostclient/issues)
- **Video Tutorials**: Coming soon on YouTube!

---

<div align="center">

**⚡ Happy Gaming with BoostClient! ⚡**

Built with 💜 by the BoostClient Team

[Download](https://github.com/boostclient/boostclient/releases) • [Docs](https://docs.boostclient.net) • [Discord](https://discord.gg/boostclient)

</div>
