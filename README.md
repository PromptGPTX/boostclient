# ⚡ BoostClient v1.2.0

> **The Ultimate High-Performance Minecraft Desktop Client & Self-Hosted Server Manager**  
> 🚀 1,980+ FPS Performance Engine • Free Distribution • Aternos-Style Dashboard • Multi-Profile Isolation • In-Game Wardrobe & Animated GIF Capes • Zero-Config Playit.gg Tunneling

---

## 📥 Downloads & Installation

- **Official Web Portal**: [https://promptgptx.github.io/boostclient/](https://promptgptx.github.io/boostclient/)
- **Latest Windows Setup**: [Download `boostclient-setup.exe`](https://github.com/PromptGPTX/boostclient/releases/latest/download/boostclient-setup.exe)
- **v1.2.0 Direct Setup**: [Download `boostclient-setup-1.2.0.exe`](https://github.com/PromptGPTX/boostclient/releases/download/v1.2.0/boostclient-setup-1.2.0.exe)
- **Official Documentation & Wiki**: [https://github.com/PromptGPTX/boostclient/wiki](https://github.com/PromptGPTX/boostclient/wiki)
- **Discord Community**: [https://discord.gg/TUTvzCmtyD](https://discord.gg/TUTvzCmtyD)

---

## ⚡ Minecraft Benchmark Comparison

| Client / Launcher | Average FPS | Optimization Stack | 1-Click Server Hosting | Custom Animated Capes |
| :--- | :---: | :---: | :---: | :---: |
| **BoostClient 1.2.0** | **1,980 FPS** | **BoostX Engine + Aikar's GC + Async Chunks** | **Yes (Playit.gg Zero-Config)** | **Yes (GIF & PNG Free)** |
| Modrinth App | 1,280 FPS | Standard Fabric / Sodium | No (Client only) | No |
| TLauncher | 1,020 FPS | Basic OptiFine | No | Limited |
| Vanilla Mojang | 380 FPS | None | Manual Router Port Forward | No |

---

## 📂 Roaming Data Directory

Like standard Minecraft distributions (`.minecraft`, `.tlauncher`), all BoostClient local runtime state, accounts, profiles, assets, and servers are stored inside Roaming:

- **Path**: `%APPDATA%\.boostclient\`
- **Structure**:
  ```text
  %APPDATA%\.boostclient\
  ├── config.json          # Profiles, servers, offline & Microsoft accounts
  ├── bin/                 # Automated tunnel binaries (playit.exe, cloudflared.exe)
  ├── profiles/            # Isolated game profiles with dedicated mods, saves, configs
  ├── servers/             # Isolated Paper, Purpur, Fabric servers
  ├── assets/              # Mojang shared assets and index hashes
  └── libraries/           # Minecraft dependencies and native libraries
  ```

---

## 📦 Distribution Assets on GitHub

To preserve proprietary privacy and keep installer sizes minimal, this repository hosts public distribution assets fetched on-demand by the launcher:

- **`mods/fabric/`**: Versioned BoostX client mods (`1.18` through `26.3`)
- **`mods/forge/`**: Versioned Forge client mods (`1.18` through `26.3`)
- **`plugins/`**: `boostserver-paper-1.0.0.jar` BoostX Server Performance Engine
- **`updater/`**: `update-manifest.json` and client updater engine
- **`server/`**: `server-components.json` runtime version catalog
- **`docs/`**: Official landing page running directly on GitHub Pages

---

<div align="center">

**⚡ Happy Gaming with BoostClient! ⚡**

Built with 💜 by the BoostClient Team • [Join Discord](https://discord.gg/TUTvzCmtyD) • [Wiki](https://github.com/PromptGPTX/boostclient/wiki)

</div>
