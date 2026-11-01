# 🌐 Zero-Config Server Hosting with Playit.gg

BoostClient includes an integrated, Aternos-inspired local server manager that eliminates the need to configure router port forwarding or reveal your home IP address.

---

## 🛠️ How It Works

1. **Local Server Execution**:
   - BoostClient downloads official server jars (Paper, Purpur, Fabric, Velocity) into `%APPDATA%\.boostclient\servers\<id>\`.
   - Spawns the server process with Aikar's tuned GC parameters.
2. **Automated Playit.gg Tunneling**:
   - Manages the official `playit` Windows CLI binary (`playit.exe`).
   - Generates a secure, DDoS-protected tunnel endpoint (`*.gl.joinmc.link`).
3. **Dual Connection Cards**:
   - **Localhost IP (`127.0.0.1:25565`)**: Used by the host player on the local machine with 0 ms ping.
   - **Public Playit IP**: Copied with 1 click to send to friends anywhere in the world.

---

## 🔒 Optional Cloudflare Tunneling

For users with their own custom domain (e.g., `play.myserver.com`):
1. Navigate to the server's **Network** settings.
2. Paste your Cloudflare tunnel token and hostname.
3. BoostClient automatically establishes the cloudflared tunnel service.
