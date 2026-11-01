import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { ConfigStore } from './ConfigStore';
import { StoreItem, StoreSearchResult } from '../../src/types';

export class StoreManager {
  private configStore: ConfigStore;

  constructor(configStore: ConfigStore) {
    this.configStore = configStore;
  }

  /**
   * Search Modrinth for mods, modpacks, resource packs, and shaders
   */
  public async searchModrinth(params: {
    query: string;
    projectType: 'mod' | 'modpack' | 'resourcepack' | 'shader';
    gameVersion?: string;
    loader?: string;
    limit?: number;
    offset?: number;
  }): Promise<StoreSearchResult> {
    const facets: string[][] = [];

    // Map internal type to Modrinth type
    const modrinthType = params.projectType === 'shader' ? 'shader' : params.projectType;
    facets.push([`project_type:${modrinthType}`]);

    if (params.gameVersion) {
      facets.push([`versions:${params.gameVersion}`]);
    }

    if (params.loader && params.projectType === 'mod') {
      facets.push([`categories:${params.loader.toLowerCase()}`]);
    }

    const searchUrl = new URL('https://api.modrinth.com/v2/search');
    if (params.query) searchUrl.searchParams.set('query', params.query);
    searchUrl.searchParams.set('facets', JSON.stringify(facets));
    searchUrl.searchParams.set('limit', String(params.limit || 24));
    searchUrl.searchParams.set('offset', String(params.offset || 0));
    searchUrl.searchParams.set('index', 'downloads');

    try {
      const res = await fetch(searchUrl.toString(), {
        headers: {
          'User-Agent': 'BoostClient/1.0.0 (https://github.com/boostclient/boostclient)',
        },
      });

      if (!res.ok) {
        throw new Error(`Modrinth search failed: ${res.statusText}`);
      }

      const data = (await res.json()) as any;
      const hits: StoreItem[] = (data.hits || []).map((hit: any) => ({
        id: hit.project_id,
        slug: hit.slug,
        title: hit.title,
        description: hit.description,
        author: hit.author,
        iconUrl: hit.icon_url,
        downloads: hit.downloads,
        follows: hit.follows,
        projectType: hit.project_type,
        categories: hit.categories || [],
        versions: hit.versions || [],
        loaders: hit.loaders || [],
        source: 'modrinth',
      }));

      return {
        hits,
        totalHits: data.total_hits || 0,
        offset: data.offset || 0,
        limit: data.limit || 24,
      };
    } catch (err) {
      console.error('[StoreManager] Modrinth search error:', err);
      return { hits: [], totalHits: 0, offset: 0, limit: 24 };
    }
  }

  /**
   * Installs an item into a target profile or server, with automated dependency resolution
   */
  public async installItem(
    item: StoreItem,
    target: { type: 'profile' | 'server'; id: string; gameVersion?: string; loader?: string },
    visitedProjects: Set<string> = new Set()
  ): Promise<{ success: boolean; filename?: string; message?: string }> {
    try {
      if (visitedProjects.has(item.id)) {
        return { success: true, message: 'Already processed' };
      }
      visitedProjects.add(item.id);

      // 1. Determine destination folder
      let destDir = '';
      if (target.type === 'profile') {
        const profilesDir = this.configStore.getProfilesDir();
        const profileFolder = path.join(profilesDir, target.id);
        if (item.projectType === 'resourcepack') {
          destDir = path.join(profileFolder, 'resourcepacks');
        } else if (item.projectType === 'shader') {
          destDir = path.join(profileFolder, 'shaderpacks');
        } else {
          destDir = path.join(profileFolder, 'mods');
        }
      } else {
        const server = this.configStore.getServer(target.id);
        if (!server) throw new Error('Target server not found');
        const isPlugin = ['paper', 'purpur', 'velocity', 'bungeecord'].includes(server.platform);
        destDir = path.join(server.path, isPlugin ? 'plugins' : 'mods');
      }

      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // 2. Fetch versions for the project
      const versionsUrl = new URL(`https://api.modrinth.com/v2/project/${item.id}/version`);
      if (target.gameVersion) {
        versionsUrl.searchParams.set('game_versions', JSON.stringify([target.gameVersion]));
      }
      if (target.loader && item.projectType === 'mod') {
        versionsUrl.searchParams.set('loaders', JSON.stringify([target.loader.toLowerCase()]));
      }

      const verRes = await fetch(versionsUrl.toString(), {
        headers: {
          'User-Agent': 'BoostClient/1.0.0 (https://github.com/boostclient/boostclient)',
        },
      });

      if (!verRes.ok) {
        throw new Error(`Failed to fetch project versions for ${item.title}`);
      }

      const versions = (await verRes.json()) as any[];
      let selectedVersion = versions && versions.length > 0 ? versions[0] : null;

      if (!selectedVersion) {
        // Fallback: fetch without filters to get latest
        const fallbackRes = await fetch(`https://api.modrinth.com/v2/project/${item.id}/version`, {
          headers: { 'User-Agent': 'BoostClient/1.0.0' },
        });
        const fallbackVersions = (await fallbackRes.json()) as any[];
        if (!fallbackVersions || fallbackVersions.length === 0) {
          throw new Error(`No downloadable versions found for ${item.title}`);
        }
        selectedVersion = fallbackVersions[0];
      }

      // 3. Resolve and install required dependencies automatically
      if (item.projectType === 'mod' && selectedVersion.dependencies && Array.isArray(selectedVersion.dependencies)) {
        for (const dep of selectedVersion.dependencies) {
          if (dep.dependency_type === 'required' && dep.project_id && !visitedProjects.has(dep.project_id)) {
            console.log(`[StoreManager] Auto-resolving required dependency: ${dep.project_id} for ${item.title}`);
            try {
              const depProjRes = await fetch(`https://api.modrinth.com/v2/project/${dep.project_id}`, {
                headers: { 'User-Agent': 'BoostClient/1.0.0' },
              });
              if (depProjRes.ok) {
                const depProjData = (await depProjRes.json()) as any;
                const depItem: StoreItem = {
                  id: depProjData.id,
                  slug: depProjData.slug,
                  title: depProjData.title,
                  description: depProjData.description || '',
                  author: '',
                  projectType: depProjData.project_type,
                  categories: depProjData.categories || [],
                  versions: depProjData.game_versions || [],
                  loaders: depProjData.loaders || [],
                  downloads: depProjData.downloads || 0,
                  follows: depProjData.follows || 0,
                  source: 'modrinth',
                };
                await this.installItem(depItem, target, visitedProjects);
              }
            } catch (depErr) {
              console.warn(`[StoreManager] Failed auto-installing dependency ${dep.project_id}:`, depErr);
            }
          }
        }
      }

      return this.downloadVersionFile(selectedVersion, destDir, item);
    } catch (err: any) {
      console.error('[StoreManager] Install error:', err);
      return { success: false, message: err.message || 'Installation failed' };
    }
  }

  /**
   * Installs curated mod presets (Performance, Visual)
   */
  public async installCuratedPreset(
    preset: 'performance' | 'visual',
    target: { id: string; gameVersion: string; loader: string },
    onProgress?: (text: string) => void
  ): Promise<string[]> {
    const installed: string[] = [];

    // Curated performance mods (5-8 top mods, not bloated)
    const performanceModSlugs = [
      'fabric-api',
      'sodium',
      'lithium',
      'ferrite-core',
      'immediatelyfast',
      'entityculling',
      'dynamic-fps',
    ];

    // Visual preset additions
    const visualModSlugs = [
      ...performanceModSlugs,
      'iris',
      'continuity',
      'indium',
    ];

    const targetSlugs = preset === 'visual' ? visualModSlugs : performanceModSlugs;

    for (const slug of targetSlugs) {
      try {
        onProgress?.(`Fetching & optimizing ${slug}...`);
        const projRes = await fetch(`https://api.modrinth.com/v2/project/${slug}`, {
          headers: { 'User-Agent': 'BoostClient/1.0.0' },
        });

        if (projRes.ok) {
          const pData = (await projRes.json()) as any;
          const storeItem: StoreItem = {
            id: pData.id,
            slug: pData.slug,
            title: pData.title,
            description: pData.description || '',
            author: '',
            projectType: 'mod',
            categories: pData.categories || [],
            versions: pData.game_versions || [],
            loaders: pData.loaders || [],
            downloads: pData.downloads || 0,
            follows: pData.follows || 0,
            source: 'modrinth',
          };

          const res = await this.installItem(storeItem, {
            type: 'profile',
            id: target.id,
            gameVersion: target.gameVersion,
            loader: target.loader,
          });

          if (res.success && res.filename) {
            installed.push(res.filename);
          }
        }
      } catch (err) {
        console.warn(`[StoreManager] Failed installing preset mod ${slug}:`, err);
      }
    }

    return installed;
  }

  private async downloadVersionFile(
    versionData: any,
    destDir: string,
    item: StoreItem
  ): Promise<{ success: boolean; filename?: string; message?: string }> {
    const file = versionData.files?.find((f: any) => f.primary) || versionData.files?.[0];
    if (!file || !file.url) {
      throw new Error('Version has no primary download file');
    }

    const filename = file.filename;
    const destPath = path.join(destDir, filename);

    // If file already exists, don't re-download
    if (fs.existsSync(destPath)) {
      return { success: true, filename, message: `${item.title} is already installed!` };
    }

    console.log(`[StoreManager] Downloading ${file.url} -> ${destPath}`);
    const downloadRes = await fetch(file.url);
    if (!downloadRes.ok) {
      throw new Error(`Failed to download ${filename}`);
    }

    const buffer = Buffer.from(await downloadRes.arrayBuffer());

    // If it's a modpack, unpack it!
    if (filename.endsWith('.mrpack') || item.projectType === 'modpack') {
      try {
        const zip = new AdmZip(buffer);
        // Extract overrides into parent directory
        const zipEntries = zip.getEntries();
        for (const entry of zipEntries) {
          if (entry.entryName.startsWith('overrides/')) {
            const relPath = entry.entryName.replace(/^overrides\//, '');
            if (relPath) {
              const fullOut = path.join(path.dirname(destDir), relPath);
              if (entry.isDirectory) {
                fs.mkdirSync(fullOut, { recursive: true });
              } else {
                fs.mkdirSync(path.dirname(fullOut), { recursive: true });
                fs.writeFileSync(fullOut, entry.getData());
              }
            }
          }
        }
      } catch (packErr) {
        console.error('Failed to unpack .mrpack overrides', packErr);
      }
    }

    fs.writeFileSync(destPath, buffer);
    return {
      success: true,
      filename,
      message: `Successfully installed ${item.title}!`,
    };
  }
}
