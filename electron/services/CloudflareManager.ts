import fs from 'fs';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { ConfigStore } from './ConfigStore';
import { CloudflareTunnelConfig } from '../../src/types';

export class CloudflareManager {
  private configStore: ConfigStore;
  private runningProcesses: Map<string, ChildProcess> = new Map();
  private tunnelConfigs: Map<string, CloudflareTunnelConfig> = new Map();
  private onStatusChangeCallback?: (serverId: string, status: CloudflareTunnelConfig['status'], domain?: string, log?: string) => void;

  constructor(configStore: ConfigStore) {
    this.configStore = configStore;
  }

  public setStatusCallback(callback: (serverId: string, status: CloudflareTunnelConfig['status'], domain?: string, log?: string) => void): void {
    this.onStatusChangeCallback = callback;
  }

  public getStatus(serverId: string): CloudflareTunnelConfig {
    return this.tunnelConfigs.get(serverId) || {
      enabled: false,
      status: 'idle',
      logs: [],
    };
  }

  /**
   * Ensures the cloudflared executable exists on Windows
   */
  public async ensureBinary(): Promise<string> {
    const binDir = this.configStore.getBinDir();
    const exePath = path.join(binDir, 'cloudflared.exe');

    if (fs.existsSync(exePath)) {
      return exePath;
    }

    console.log('[CloudflareManager] Downloading cloudflared.exe from GitHub...');
    const downloadUrl = 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe';

    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to download cloudflared: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      fs.writeFileSync(exePath, Buffer.from(arrayBuffer));
      console.log('[CloudflareManager] cloudflared.exe downloaded to:', exePath);
      return exePath;
    } catch (err) {
      console.error('[CloudflareManager] Failed downloading cloudflared.exe:', err);
      return exePath;
    }
  }

  /**
   * Starts a Cloudflare Tunnel for a server instance using a Tunnel Token
   */
  public async startTunnel(serverId: string, token: string, domain?: string): Promise<void> {
    if (this.runningProcesses.has(serverId)) {
      console.log(`[CloudflareManager] Tunnel already active for server ${serverId}`);
      return;
    }

    const currentConfig: CloudflareTunnelConfig = {
      enabled: true,
      token,
      domain,
      status: 'starting',
      publicAddress: domain,
      logs: [],
    };
    this.tunnelConfigs.set(serverId, currentConfig);
    this.onStatusChangeCallback?.(serverId, 'starting', domain, 'Starting Cloudflare tunnel process...');

    const binaryPath = await this.ensureBinary();
    if (!fs.existsSync(binaryPath)) {
      currentConfig.status = 'error';
      this.onStatusChangeCallback?.(serverId, 'error', domain, 'Cloudflare binary could not be found.');
      return;
    }

    const args = ['tunnel', 'run', '--token', token.trim()];
    console.log(`[CloudflareManager] Spawning: ${binaryPath} tunnel run --token [HIDDEN]`);

    const child = spawn(binaryPath, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });

    this.runningProcesses.set(serverId, child);

    const handleOutput = (chunk: Buffer) => {
      const text = chunk.toString();
      const lines = text.split(/\r?\n/).filter(Boolean);

      for (const line of lines) {
        currentConfig.logs = (currentConfig.logs || []).slice(-100);
        currentConfig.logs.push(line);

        // Detect successful registration
        if (/Registered tunnel connection/i.test(line) || /Connection .* registered/i.test(line) || /Connected/i.test(line)) {
          currentConfig.status = 'connected';
          this.onStatusChangeCallback?.(serverId, 'connected', domain, line);
        } else {
          this.onStatusChangeCallback?.(serverId, currentConfig.status, domain, line);
        }
      }
    };

    child.stdout.on('data', handleOutput);
    child.stderr.on('data', handleOutput);

    child.on('close', (code) => {
      console.log(`[CloudflareManager] Tunnel closed with code ${code} for server ${serverId}`);
      this.runningProcesses.delete(serverId);
      currentConfig.status = 'idle';
      this.onStatusChangeCallback?.(serverId, 'idle', domain, `Tunnel stopped with exit code ${code}`);
    });

    child.on('error', (err) => {
      console.error(`[CloudflareManager] Tunnel error:`, err);
      this.runningProcesses.delete(serverId);
      currentConfig.status = 'error';
      this.onStatusChangeCallback?.(serverId, 'error', domain, `Error: ${err.message}`);
    });
  }

  /**
   * Stops the Cloudflare Tunnel for a server
   */
  public stopTunnel(serverId: string): void {
    const process = this.runningProcesses.get(serverId);
    if (process) {
      console.log(`[CloudflareManager] Stopping Cloudflare tunnel for ${serverId}`);
      process.kill();
      this.runningProcesses.delete(serverId);
    }
    const current = this.tunnelConfigs.get(serverId);
    if (current) {
      current.status = 'idle';
      current.enabled = false;
      this.onStatusChangeCallback?.(serverId, 'idle', current.domain, 'Tunnel stopped');
    }
  }

  /**
   * Stops all running Cloudflare tunnels
   */
  public stopAll(): void {
    for (const [id, process] of this.runningProcesses.entries()) {
      try {
        process.kill();
      } catch (err) {
        console.error(`Error killing cloudflared process ${id}:`, err);
      }
    }
    this.runningProcesses.clear();
    this.tunnelConfigs.clear();
  }
}
