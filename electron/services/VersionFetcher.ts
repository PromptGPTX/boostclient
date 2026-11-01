import fs from 'fs';
import path from 'path';
import { ServerPlatform } from '../../src/types';

export class VersionFetcher {
  /**
   * Fetches supported versions for a platform
   */
  public static async getAvailableVersions(platform: ServerPlatform): Promise<string[]> {
    try {
      if (platform === 'paper') {
        const res = await fetch('https://api.papermc.io/v2/projects/paper');
        if (res.ok) {
          const data = (await res.json()) as any;
          return data.versions.reverse();
        }
      } else if (platform === 'purpur') {
        const res = await fetch('https://api.purpurmc.org/v2/purpur');
        if (res.ok) {
          const data = (await res.json()) as any;
          return data.versions.reverse();
        }
      } else if (platform === 'fabric') {
        const res = await fetch('https://meta.fabricmc.net/v2/versions/game');
        if (res.ok) {
          const data = (await res.json()) as any[];
          return data.filter((v) => v.stable).map((v) => v.version);
        }
      } else if (platform === 'velocity') {
        const res = await fetch('https://api.papermc.io/v2/projects/velocity');
        if (res.ok) {
          const data = (await res.json()) as any;
          return data.versions.reverse();
        }
      } else if (platform === 'vanilla') {
        const res = await fetch('https://piston-meta.mojang.com/mc/game/version_manifest_v2.json');
        if (res.ok) {
          const data = (await res.json()) as any;
          return data.versions.filter((v: any) => v.type === 'release').map((v: any) => v.id);
        }
      }
    } catch (err) {
      console.error(`[VersionFetcher] Failed to fetch versions for ${platform}:`, err);
    }

    // High quality fallback list if offline or rate-limited
    return ['1.21.1', '1.20.4', '1.20.2', '1.20.1', '1.19.4', '1.18.2', '1.16.5', '1.12.2', '1.8.9'];
  }

  /**
   * Downloads the server jar for the specified platform and version
   */
  public static async downloadServerJar(
    platform: ServerPlatform,
    version: string,
    targetDir: string,
    onProgress?: (text: string) => void
  ): Promise<string> {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const destJar = path.join(targetDir, 'server.jar');
    onProgress?.(`Resolving ${platform} ${version} server jar...`);

    let downloadUrl = '';

    if (platform === 'paper') {
      // 1. Get builds for version
      const buildsRes = await fetch(`https://api.papermc.io/v2/projects/paper/versions/${version}`);
      if (!buildsRes.ok) throw new Error(`Paper version ${version} not found`);
      const buildsData = (await buildsRes.json()) as any;
      const latestBuild = buildsData.builds[buildsData.builds.length - 1];

      // 2. Get download name
      const buildRes = await fetch(`https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${latestBuild}`);
      const buildData = (await buildRes.json()) as any;
      const downloadName = buildData.downloads.application.name;

      downloadUrl = `https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${latestBuild}/downloads/${downloadName}`;
    } else if (platform === 'purpur') {
      downloadUrl = `https://api.purpurmc.org/v2/purpur/${version}/latest/download`;
    } else if (platform === 'fabric') {
      // Get latest fabric loader version
      const loaderRes = await fetch('https://meta.fabricmc.net/v2/versions/loader');
      const loaderData = (await loaderRes.json()) as any[];
      const loaderVer = loaderData[0]?.version || '0.15.11';

      // Get latest installer version
      const installerRes = await fetch('https://meta.fabricmc.net/v2/versions/installer');
      const installerData = (await installerRes.json()) as any[];
      const installerVer = installerData[0]?.version || '1.0.1';

      downloadUrl = `https://meta.fabricmc.net/v2/versions/loader/${version}/${loaderVer}/${installerVer}/server/jar`;
    } else if (platform === 'velocity') {
      const buildsRes = await fetch(`https://api.papermc.io/v2/projects/velocity/versions/${version}`);
      if (!buildsRes.ok) throw new Error(`Velocity version ${version} not found`);
      const buildsData = (await buildsRes.json()) as any;
      const latestBuild = buildsData.builds[buildsData.builds.length - 1];

      const buildRes = await fetch(`https://api.papermc.io/v2/projects/velocity/versions/${version}/builds/${latestBuild}`);
      const buildData = (await buildRes.json()) as any;
      const downloadName = buildData.downloads.application.name;

      downloadUrl = `https://api.papermc.io/v2/projects/velocity/versions/${version}/builds/${latestBuild}/downloads/${downloadName}`;
    } else if (platform === 'bungeecord') {
      downloadUrl = 'https://ci.md-5.net/job/BungeeCord/lastSuccessfulBuild/artifact/bootstrap/target/BungeeCord.jar';
    } else {
      // Vanilla
      const manifestRes = await fetch('https://piston-meta.mojang.com/mc/game/version_manifest_v2.json');
      const manifestData = (await manifestRes.json()) as any;
      const verEntry = manifestData.versions.find((v: any) => v.id === version);
      if (!verEntry) throw new Error(`Vanilla version ${version} not found`);

      const verDetailsRes = await fetch(verEntry.url);
      const verDetails = (await verDetailsRes.json()) as any;
      downloadUrl = verDetails.downloads?.server?.url;
      if (!downloadUrl) throw new Error(`Vanilla server jar not available for ${version}`);
    }

    onProgress?.(`Downloading ${platform} server jar from ${downloadUrl}...`);
    console.log(`[VersionFetcher] Downloading ${downloadUrl} -> ${destJar}`);

    const jarRes = await fetch(downloadUrl);
    if (!jarRes.ok) {
      throw new Error(`Failed to download server jar (${jarRes.statusText})`);
    }

    const arrayBuffer = await jarRes.arrayBuffer();
    fs.writeFileSync(destJar, Buffer.from(arrayBuffer));
    onProgress?.('Download complete!');

    // Auto-accept EULA
    const eulaFile = path.join(targetDir, 'eula.txt');
    fs.writeFileSync(eulaFile, '# EULA auto-accepted by BoostClient\neula=true\n', 'utf-8');

    return destJar;
  }
}
