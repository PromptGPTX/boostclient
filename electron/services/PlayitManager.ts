import fs from 'fs';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { ConfigStore } from './ConfigStore';

export interface PlayitStatusData {
  status: 'idle' | 'starting' | 'connected' | 'error';
  publicAddress?: string;
  claimUrl?: string;
  error?: string;
}

export class PlayitManager {
  private configStore: ConfigStore;
  private runningProcesses: Map<string, ChildProcess> = new Map();
  private tunnelStatuses: Map<string, PlayitStatusData> = new Map();
  private onStatusChangeCallback?: (serverId: string, data: PlayitStatusData) => void;

  constructor(configStore: ConfigStore) {
    this.configStore = configStore;
  }

  public setStatusCallback(callback: (serverId: string, data: PlayitStatusData) => void): void {
    this.onStatusChangeCallback = callback;
  }

  public getStatus(serverId: string): PlayitStatusData {
    return this.tunnelStatuses.get(serverId) || { status: 'idle' };
  }

  /**
   * Returns the path to the playit.exe executable, downloading it if necessary
   */
  public async ensureBinary(): Promise<string> {
    const binDir = this.configStore.getBinDir();
    const playitPath = path.join(binDir, 'playit.exe');

    if (fs.existsSync(playitPath)) {
      return playitPath;
    }

    console.log('[PlayitManager] playit.exe not found. Downloading latest release...');
    const downloadUrl = 'https://github.com/playit-cloud/playit-agent/releases/latest/download/playit-windows-x86_64.exe';

    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to download playit.exe: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(playitPath, buffer);
      console.log('[PlayitManager] playit.exe downloaded successfully to:', playitPath);
      return playitPath;
    } catch (err) {
      console.error('[PlayitManager] Error downloading playit.exe:', err);
      // In case download fails (e.g. offline), we still return the path
      return playitPath;
    }
  }

  /**
   * Starts a playit.gg tunnel mapped to a server's port
   */
  public async startTunnel(serverId: string, serverPort: number, serverDir: string): Promise<void> {
    if (this.runningProcesses.has(serverId)) {
      console.log(`[PlayitManager] Tunnel already running for server ${serverId}`);
      return;
    }

    const binaryPath = await this.ensureBinary();
    if (!fs.existsSync(binaryPath)) {
      const errStatus: PlayitStatusData = {
        status: 'error',
        error: 'Playit executable not found. Please connect to internet to download.',
      };
      this.tunnelStatuses.set(serverId, errStatus);
      this.onStatusChangeCallback?.(serverId, errStatus);
      return;
    }

    this.tunnelStatuses.set(serverId, { status: 'starting' });
    this.onStatusChangeCallback?.(serverId, { status: 'starting' });

    // Secret key file path per server or global
    const secretPath = path.join(serverDir, 'playit.secret');

    // Spawn playit process
    const playitArgs = ['--secret-key-file', secretPath, 'run'];
    console.log(`[PlayitManager] Spawning: ${binaryPath} ${playitArgs.join(' ')}`);

    const child = spawn(binaryPath, playitArgs, {
      cwd: serverDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });

    this.runningProcesses.set(serverId, child);

    let foundAddress: string | undefined;
    let foundClaimUrl: string | undefined;

    const handleOutput = (chunk: Buffer) => {
      const text = chunk.toString();
      // Look for claim url
      const claimMatch = text.match(/https:\/\/playit\.gg\/claim\/([a-zA-Z0-9_-]+)/);
      if (claimMatch) {
        foundClaimUrl = claimMatch[0];
        const statusData: PlayitStatusData = {
          status: 'starting',
          claimUrl: foundClaimUrl,
          publicAddress: foundAddress,
        };
        this.tunnelStatuses.set(serverId, statusData);
        this.onStatusChangeCallback?.(serverId, statusData);
      }

      // Look for tunnel address, e.g. *.gl.joinmc.link or *.craft.playit.gg
      const tunnelMatch = text.match(/([a-zA-Z0-9.-]+\.gl\.joinmc\.link(?::\d+)?|[a-zA-Z0-9.-]+\.craft\.playit\.gg(?::\d+)?|[a-zA-Z0-9.-]+\.playit\.gg:\d+)/i);
      if (tunnelMatch) {
        foundAddress = tunnelMatch[1];
        const statusData: PlayitStatusData = {
          status: 'connected',
          publicAddress: foundAddress,
          claimUrl: foundClaimUrl,
        };
        this.tunnelStatuses.set(serverId, statusData);
        this.onStatusChangeCallback?.(serverId, statusData);
      }

      // Also look for notice about tunnels online
      if (text.includes('tunnel running') || text.includes('tunnel active') || text.includes('registered')) {
        if (!foundAddress) {
          // If address regex didn't catch it yet, query local status API
          this.pollLocalStatus(serverId, foundClaimUrl);
        }
      }
    };

    child.stdout.on('data', handleOutput);
    child.stderr.on('data', handleOutput);

    child.on('close', (code) => {
      console.log(`[PlayitManager] Tunnel process exited with code ${code} for server ${serverId}`);
      this.runningProcesses.delete(serverId);
      const stoppedStatus: PlayitStatusData = { status: 'idle' };
      this.tunnelStatuses.set(serverId, stoppedStatus);
      this.onStatusChangeCallback?.(serverId, stoppedStatus);
    });

    child.on('error', (err) => {
      console.error(`[PlayitManager] Tunnel error for server ${serverId}:`, err);
      this.runningProcesses.delete(serverId);
      const errStatus: PlayitStatusData = { status: 'error', error: err.message };
      this.tunnelStatuses.set(serverId, errStatus);
      this.onStatusChangeCallback?.(serverId, errStatus);
    });

    // Start background poll to local API
    this.pollLocalStatus(serverId, foundClaimUrl);
  }

  /**
   * Polls the local playit agent API (127.0.0.1:5555) for active tunnels
   */
  private async pollLocalStatus(serverId: string, claimUrl?: string): Promise<void> {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > 15 || !this.runningProcesses.has(serverId)) {
        clearInterval(interval);
        return;
      }

      try {
        const res = await fetch('http://127.0.0.1:5555/api/status', { signal: AbortSignal.timeout(1000) });
        if (res.ok) {
          const data = (await res.json()) as any;
          if (data && data.tunnels && data.tunnels.length > 0) {
            const firstTunnel = data.tunnels[0];
            const publicAddress = firstTunnel.assigned_address || `${firstTunnel.subdomain || 'server'}.gl.joinmc.link`;
            const statusData: PlayitStatusData = {
              status: 'connected',
              publicAddress,
              claimUrl,
            };
            this.tunnelStatuses.set(serverId, statusData);
            this.onStatusChangeCallback?.(serverId, statusData);
            clearInterval(interval);
          }
        }
      } catch {
        // Keep waiting for daemon API to come up
      }
    }, 1500);
  }

  /**
   * Stops the tunnel for a server
   */
  public stopTunnel(serverId: string): void {
    const process = this.runningProcesses.get(serverId);
    if (process) {
      console.log(`[PlayitManager] Stopping tunnel for server ${serverId}`);
      process.kill();
      this.runningProcesses.delete(serverId);
    }
    this.tunnelStatuses.set(serverId, { status: 'idle' });
    this.onStatusChangeCallback?.(serverId, { status: 'idle' });
  }

  /**
   * Stops all active tunnels
   */
  public stopAll(): void {
    for (const [serverId, process] of this.runningProcesses.entries()) {
      try {
        process.kill();
      } catch (err) {
        console.error(`Failed to kill tunnel process for ${serverId}`, err);
      }
    }
    this.runningProcesses.clear();
    this.tunnelStatuses.clear();
  }
}
