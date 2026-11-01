# ⚡ BoostX Server Performance Engine

The **BoostX Server Performance Engine** is a high-performance Paper/Purpur server component (`boostserver-paper-1.0.0.jar`) designed to stabilize server tick rates, eliminate common Minecraft glitches, and relay multiplayer cosmetics.

---

## 🎯 Supported Server Versions

The BoostX Server Engine is supported for servers running between versions:
- **Minecraft 1.21** through **Minecraft 26.3**
- Supported platforms: **PaperMC** and **Purpur**

---

## 🚀 Key Features

1. **20.0 TPS Tick Stabilization**:
   - Reduces tick lag during entity-heavy farms, chunk generation, and redstone clocks.
2. **Asynchronous Chunk Packet Compression**:
   - Offloads chunk serialization from the main server thread to worker pools, reducing player connection rubberbanding.
3. **Ghost Block & Glitch Mitigation**:
   - Resolves ghost block desyncs caused by rapid block breaking, pistons, and boat phasing.
4. **Cosmetic Relay Network**:
   - Automatically synchronizes custom skins and animated GIF capes between BoostClient players.

---

## ⚙️ How to Enable in BoostClient

1. Open the **SERVERS** tab in BoostClient.
2. Select your server to open the dashboard.
3. Navigate to the **Settings** sub-tab.
4. Locate the **Boost Performance (BoostX Server Engine)** card.
5. Click the toggle switch:
   - BoostClient automatically downloads `boostserver-paper-1.0.0.jar` from GitHub and installs it into your server's `plugins/` directory.
6. Restart your server to apply.
