# ⚡ BoostClient v1.2.0

> **The Ultimate 100% FREE Minecraft Desktop Client & Self-Hosted Server Manager**  
> 🚀 10x Performance Engine • Zero Paywalls • Aternos-Style Dashboard • Multi-Profile Isolation • Dual Authentication

---

## 📦 Installation & Testing

### ✅ Portable Version Ready
The portable executable is ready for testing at:
**`dist-release/win-unpacked/BoostClient.exe`** (178MB)

### 🛠️ Setup Instructions
1. Double-click `BoostClient.exe` to launch
2. First-time setup will create your data directory at `%APPDATA%\BoostClient\`
3. Create your first profile using the **Profiles** tab
4. Launch Minecraft with your profile - the game will launch automatically!

### 🔄 Discord Integration
BoostClient now includes a **Discord button** in the sidebar for easy access to our community:
- **JOIN** button in the sidebar to join [Discord Server](https://discord.gg/TUTvzCmtyD)
- **CAPE** button to upload custom skins (with boostx mod support)
- **DONE** button to confirm skin changes

### 📂 Data Location
All BoostClient data is stored in:
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

### 🚀 What's New in v1.2.0
- **BoostX Client Mod** - 100+ modules (PvP, HUD, Visuals, Utility, World, Performance)
- **Profile Creation Presets** - Performance/Visual/Advanced with auto-mod installation
- **Cloudflare Tunnel Support** - Custom domain hosting for servers
- **Multi-Port Network Manager** - Dynamic port management
- **Aternos-Style Automation** - Simple Voice Chat + GeyserMC auto-setup
- **GitHub Auto-Update System** - Safe update system with critical/feature distinction
- **Dual Executables** - Portable version ready for testing

### 🛠️ Next Steps for You
1. Test the portable executable at `dist-release/win-unpacked/BoostClient.exe`
2. Join our Discord server using the **JOIN** button in the sidebar
3. Test skin customization with the **CAPE** button
4. Report any issues in the [GitHub Issues](https://github.com/boostclient/boostclient/issues)

### 📚 Documentation
- **Quick Start Guide**: [QUICKSTART.md](QUICKSTART.md)
- **Contribution Guidelines**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Version History**: [CHANGELOG.md](CHANGELOG.md)

---

<div align="center">

**⚡ Happy Gaming with BoostClient! ⚡**

Built with 💜 by the BoostClient Team

[Download](https://github.com/boostclient/boostclient/releases) • [Docs](https://docs.boostclient.net) • [Discord](https://discord.gg/TUTvzCmtyD)

</div>