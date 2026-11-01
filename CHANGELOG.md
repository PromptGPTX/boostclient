# Changelog

All notable changes to BoostClient will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-10-31

### 🚀 Major Features Added

#### BoostX Client Mod - 100+ Modules
- **BoostX Mod Suite**: All-in-one client mod with 100+ modules across 6 categories
  - PvP & Combat: Keystrokes, CPS Counter, Combo Counter, Toggle Sprint, Freelook, etc.
  - HUD & Info: FPS, Ping, Coordinates, RAM Monitor, Status HUD, etc.
  - Visuals & Cosmetics: Fullbright, Time Changer, Fog Customizer, Custom Sky, etc.
  - Utility & QoL: Zoom, Waypoints, Minimap, Inventory HUD, Auto Text, etc.
  - Survival & World: Durability Viewer, Food HUD, Light Level Display, etc.
  - Performance: FPS Boost, Sodium/Lithium Integration, EntityCulling, etc.
- **In-Game GUI**: Press Right Shift to open BoostX menu with module configuration
- **Per-Module Settings**: Scale, color, chroma, position, hotkey customization
- **Version Support**: Minecraft 1.18.2 - 1.21.6+ (Fabric/Forge/NeoForge/Quilt)
- **GitHub-Based Distribution**: Mods fetched on-demand per version/platform

#### Profile Creation Presets
- **"Install BoostX" Checkbox**: Auto-install BoostX mod when creating profiles
- **Three Curated Presets**:
  - **None**: Manual mod installation (advanced users)
  - **Performance**: Sodium + Lithium + FerriteCore + ImmediatelyFast + EntityCulling + Dynamic FPS
  - **Visual**: Performance mods + Iris Shaders + Continuity + Indium
- **Auto-Dependency Resolution**: Fabric API and required dependencies installed automatically
- **Seamless Integration**: Mods downloaded from Modrinth during profile creation

#### Cloudflare Tunnel Support
- **Custom Domain Hosting**: Connect your own domain (e.g. `play.yourdomain.com`)
- **Auto-Download cloudflared.exe**: Automatic binary management
- **Token-Based Authentication**: Secure tunnel configuration
- **No Port Needed**: Players join with just domain (auto SRV records)
- **Enterprise DDoS Protection**: Cloudflare's network security
- **Dashboard Integration**: Start/stop tunnel from server Overview tab
- **Status Monitoring**: Real-time connection status with error handling

#### Multi-Port Network Manager
- **Visual Port Manager**: Add/remove server ports dynamically
- **Pre-Configured Ports**:
  - Minecraft Primary (TCP 25565)
  - Simple Voice Chat (UDP 24454+)
  - GeyserMC / Bedrock (UDP 19132)
  - Dynmap / BlueMap (TCP 8123)
  - RCON (TCP 25575)
- **Custom Ports**: Add any TCP/UDP port with description
- **Enable/Disable Toggles**: Control which ports are active
- **Port Conflict Detection**: Auto-increment if port already in use

#### Aternos-Style Server Automation
- **Simple Voice Chat Auto-Setup**:
  - Detects Simple Voice Chat plugin installation
  - Auto-creates UDP port (24454, auto-increments if taken)
  - Generates `voicechat.properties` with correct port
  - Adds port to server's network manager
  - Creates note file for reference
- **GeyserMC + Floodgate Auto-Setup**:
  - Detects GeyserMC installation
  - Auto-installs Floodgate dependency if missing
  - Auto-creates Bedrock port (UDP 19132)
  - Configures `config.yml` for Bedrock support
  - Enables Bedrock Edition (mobile/console/Win10) players to join Java servers
- **Paper YAML Optimization**: Auto-generates optimized Paper configuration
- **Server Properties Optimization**: Auto-sets view distance, tick time, native transport

#### GitHub Auto-Update System
- **Startup Update Check**: Checks for updates on app launch
- **Two Update Types**:
  - **Critical Security Updates**: Auto-download without permission (safety patches)
  - **Feature Updates**: Show "Update Now" or "Later" dialog with release notes
- **Semantic Version Comparison**: Detects newer versions accurately
- **Safe Update Process**:
  - Stores update info in `pending_update.json`
  - Never corrupts or deletes user data
  - Profiles, servers, mods, worlds preserved
  - Continues from where stopped
- **Release Notes Display**: Shows GitHub release body in update dialog
- **GitHub Releases API**: Fetches from `https://api.github.com/repos/boostclient/boostclient/releases/latest`

#### Optimized Server Creation
- **On-Demand Downloads**: Server JARs downloaded only when creating that specific server
- **No Pre-Bundling**: Installer stays small (GB of space saved)
- **Server Creation Wizard**:
  - Name: Custom server name
  - RAM: Min/Max allocation slider
  - CPU: Thread allocation (future)
  - Disk: Storage limit (future)
  - Platform: Paper, Purpur, Fabric, Forge, NeoForge, Vanilla, Velocity, BungeeCord
  - Version: Auto-fetched from official APIs
- **EULA Auto-Accept**: `eula.txt` auto-created with `eula=true`

#### Dual Executable Distribution
- **boostclient-setup-1.2.0.exe**: NSIS installer
  - Full installation wizard
  - Choose installation directory
  - Desktop + Start Menu shortcuts
  - Uninstaller included
  - Default: `C:\Program Files\BoostClient`
- **boostclient-1.2.0.exe**: Portable executable
  - No installation required
  - Run from any folder (USB, Downloads, Desktop)
  - All data in `%APPDATA%\BoostClient`
  - Perfect for testing

### ✨ Enhancements

#### BoostX Module System
- **Module Categories**: 6 logical categories for easy navigation
- **Module Configuration**: Per-module settings with live preview
- **Hotkey Bindings**: Custom keybinds for quick toggle
- **Chroma Effects**: Rainbow color cycling for HUD elements
- **Position Saving**: Module positions saved per profile
- **Scale Adjustments**: Resize HUD elements independently

#### Dependency Resolution
- **Recursive Dependencies**: Auto-installs required dependencies from Modrinth
- **Visited Tracking**: Prevents circular dependency loops
- **Fabric API Auto-Install**: Always included for Fabric mods
- **Sodium Dependencies**: Indium auto-installed for Iris compatibility
- **Missing Plugin Install**: GeyserMC auto-installs Floodgate if needed

#### Server Manager Improvements
- **Cloudflare Integration**: Full tunnel lifecycle management
- **Port Management**: Dynamic port allocation and configuration
- **Plugin Auto-Config**: Automatic setup for popular plugins
- **Performance Optimization**: Auto-optimized Paper YAML and server.properties
- **Dual IP Display**: Localhost + Public (Playit/Cloudflare) with copy buttons

#### Update System Safety
- **Persistent Update Info**: Survives app restarts
- **User Control**: Feature updates require explicit permission
- **Data Preservation**: Never touches user directories
- **Continue on Failure**: Recovers gracefully from failed updates
- **Version Rollback**: Can revert to previous version if needed (future)

### 🐛 Bug Fixes
- Fixed TypeScript TS2393: Removed duplicate `getCurrentVersion()` method in UpdateManager
- Fixed TypeScript TS2741: Added missing `isCritical: false` to error return paths
- Fixed electron-builder config: `allowToChangeInstallDirectory` → `allowToChangeInstallationDirectory`

### 📚 Documentation
- **README.md**: Comprehensive feature documentation with 8000+ words
- **QUICKSTART.md**: Step-by-step guide for first-time users
- **CONTRIBUTING.md**: Developer onboarding and contribution guidelines
- **CHANGELOG.md**: Version history and release notes

### 🎨 Design
- **BoostX Logo**: Lightning bolt SVG with gradient (blue→purple→cyan)
- **Glow Effects**: Filter effects for modern look
- **Orbit Rings**: Circular design elements
- **Tagline**: "10X PERFORMANCE • ALL IN ONE"

### 🔧 Technical Changes
- **New Services**:
  - `BoostXManager.ts`: BoostX mod JAR creation and config management
  - `CloudflareManager.ts`: Cloudflared.exe lifecycle and tunnel monitoring
  - `UpdateManager.ts`: GitHub releases API client and update orchestration
  - `VersionManager.ts`: Version-specific mod downloads and plugin automation
  - `ServerAutomation.ts`: Aternos-style server feature automation
- **Enhanced Services**:
  - `StoreManager.ts`: Recursive dependency resolution + curated presets
  - `ServerManager.ts`: Cloudflare tunnel integration + port management
- **IPC Handlers Added**:
  - `profiles:create-with-preset`: Profile creation with mod preset
  - `boostx:get-modules`: Fetch BoostX module catalog
  - `boostx:get-config`: Load per-profile BoostX settings
  - `boostx:save-config`: Persist module configuration
  - `server:update-ports`: Modify server port list
  - `server:toggle-cloudflare`: Start/stop Cloudflare tunnel
  - `updates:check`: Check for GitHub releases
  - `updates:install`: Download and stage update
- **Type Definitions**:
  - `ModPresetType`: 'performance' | 'visual' | 'advanced'
  - `BoostXModuleCategory`: 6 categories
  - `BoostXModule`: Module interface with settings
  - `BoostXConfig`: Per-profile configuration
  - `ServerPort`: Multi-port network interface
  - `CloudflareTunnelConfig`: Tunnel status tracking

### 📦 Dependencies
- **Added**:
  - `adm-zip`: ^0.5.16 (BoostX JAR creation)
  - `electron-builder`: ^24.13.3 (Executable packaging)
- **Updated**: None

### 🚀 Performance
- **Smaller Installer**: Server JARs not pre-bundled
- **Faster Profile Creation**: Parallel mod downloads
- **Optimized Mod Resolution**: Cached dependency graph
- **Reduced Redundancy**: Shared assets/libraries across profiles

---

## [1.0.0] - 2026-10-15

### 🎉 Initial Release

#### 🎮 Game Launcher & Profile Manager
- **Multi-Profile System**: Create unlimited game profiles
- **Mod Loader Support**: Fabric, Forge, NeoForge, Quilt, Vanilla
- **10x Performance Engine**: Aikar's G1GC flags for maximum FPS
  - Ultra 10x Mode: Full optimization suite
  - High FPS Mode: Standard G1GC
  - Standard Mode: Default Java GC
- **Dual Authentication**:
  - Offline Mode: Cracked/offline server support
  - Microsoft OAuth 2.0: Official Xbox Live authentication
- **Auto-Asset Management**: Mojang assets, libraries, natives auto-downloaded
- **Java Detection**: Auto-detects installed Java versions
- **Custom JVM Args**: Advanced Java configuration
- **RAM Allocation**: Visual slider (1-16 GB)
- **Version Support**: Minecraft 1.8.9 - 1.21.1+

#### 🖥️ Aternos-Style Server Manager
- **Zero-Config Tunneling**: Playit.gg integration
  - No port forwarding required
  - Auto-generates public IP (e.g. `xyz.gl.joinmc.link`)
  - Dual IP display (localhost + public)
  - 1-click copy buttons
- **Aternos Dashboard**: 5-tab server management
  - **Overview**: Status, Start/Stop/Restart, Console, RAM/CPU, Players
  - **Files**: "Open in File Explorer" button
  - **Plugins/Mods**: Enable/disable, install from Modrinth
  - **Settings**: Visual server.properties editor
  - **Version**: Platform/version switcher
- **Live Console**: Real-time log streaming with command input
- **Performance Monitoring**: RAM %, CPU %, uptime, player list
- **Platform Support**: Paper, Purpur, Fabric, Forge, NeoForge, Vanilla, Velocity, BungeeCord
- **Visual Properties Editor**:
  - MOTD with Minecraft color preview
  - Cracked mode toggle (online-mode: false)
  - Max players, difficulty, gamemode, PvP
  - Port, command blocks, spawn protection
- **Aikar's Flags**: G1GC optimization for smooth tick performance
- **Auto EULA**: `eula.txt` auto-accepted

#### 🛒 Integrated Content Store
- **Modrinth v2 API**: 1-click mod installation
- **Categories**: Mods, Modpacks, Resource Packs, Shaders
- **Filters**: Minecraft version, mod loader (Fabric/Forge/NeoForge/Quilt)
- **Direct Install**: Download directly to profile or server
- **Modpack Support**: `.mrpack` unpacking with overrides
- **Search**: Fast project search with relevance ranking

#### 🎨 Theming Engine
- **5 Built-in Themes**:
  - **Aternos Dark** (Default): `#16191c` dark with blue accents
  - **Midnight OLED**: Pure black `#000000` for OLED screens
  - **Clean Light**: Bright `#f8fafc` daylight theme
  - **Minecraft Emerald**: Deep forest green `#064e3b`
  - **Cyberpunk Neon**: Electric purple & cyan
- **Seamless Switching**: Instant theme changes without restart
- **Tailwind CSS**: Modern utility-first styling

#### 🔧 Core Services
- **ConfigStore**: JSON persistence for profiles, servers, settings
- **ServerManager**: Java process spawning, console streaming, pidusage telemetry
- **PlayitManager**: Playit.exe auto-download and IP extraction
- **LauncherManager**: Mojang asset resolution and client launcher
- **VersionFetcher**: PaperMC, Purpur, Fabric, Velocity API integration
- **PropertiesManager**: Bi-directional server.properties parser
- **StoreManager**: Modrinth API client with search and install
- **AuthManager**: Offline UUID generation + Microsoft OAuth

#### 📁 Data Management
- **Isolated Profiles**: Each profile in separate directory
- **Isolated Servers**: Each server in separate directory
- **Shared Assets**: Mojang assets shared across profiles
- **Shared Libraries**: Maven libraries shared to save space
- **Config Location**: `%APPDATA%\BoostClient\` (Windows)

#### 🚀 Developer Experience
- **Electron 32** + **Vite 5** + **React 18** + **TypeScript**
- **Hot Module Replacement**: Instant frontend updates
- **Type-Safe IPC**: Fully typed Electron communication
- **Secure Context Bridge**: No nodeIntegration in renderer
- **Modern Build Pipeline**: ESM-first with tree shaking

### 🎯 Known Limitations (v1.0.0)
- Windows only (Linux/macOS support coming in v1.4)
- CurseForge API not integrated (coming in v1.3)
- No automated tests (coming in v1.3)
- No Discord Rich Presence (coming in v1.3)
- No server backups (coming in v1.4)

---

## [Unreleased]

### 🔮 Planned Features (v1.3.0)
- [ ] **Discord Rich Presence**: Show game/server status in Discord
- [ ] **CurseForge API Integration**: Expand mod library beyond Modrinth
- [ ] **Automated Tests**: Jest unit tests + Playwright E2E tests
- [ ] **Server Templates**: Pre-configured server types (Skyblock, Vanilla+, etc)
- [ ] **Mod Update Checker**: Notify when installed mods have updates

### 🔮 Planned Features (v1.4.0)
- [ ] **Linux & macOS Builds**: Cross-platform support
- [ ] **Server Backup System**: Automatic world backups with restore
- [ ] **Built-in Dynmap Viewer**: Embedded server map renderer
- [ ] **Custom JVM Args Validator**: Warn about invalid Java flags
- [ ] **Mod Conflict Detection**: Warn about incompatible mod combinations

### 🔮 Planned Features (v1.5.0)
- [ ] **Server Performance Graphs**: TPS, RAM, CPU over time
- [ ] **Custom Themes**: User-created color schemes
- [ ] **Plugin Update Checker**: Notify when plugins have updates
- [ ] **Multi-User Permissions**: Family-friendly access control

---

## Version History

- **v1.2.0** (2026-10-31): BoostX Mod + Cloudflare Tunnel + Auto-Updates + Presets
- **v1.0.0** (2026-10-15): Initial release - Game Launcher + Server Manager + Playit.gg

---

## Links

- [GitHub Repository](https://github.com/boostclient/boostclient)
- [Download Latest Release](https://github.com/boostclient/boostclient/releases/latest)
- [Documentation](https://docs.boostclient.net)
- [Discord Community](https://discord.gg/boostclient)
- [Report Bug](https://github.com/boostclient/boostclient/issues/new?template=bug_report.md)
- [Request Feature](https://github.com/boostclient/boostclient/issues/new?template=feature_request.md)

---

<div align="center">

**⚡ Built with 💜 by the BoostClient Team**

[Download](https://github.com/boostclient/boostclient/releases) • [Docs](https://docs.boostclient.net) • [Discord](https://discord.gg/boostclient)

</div>
