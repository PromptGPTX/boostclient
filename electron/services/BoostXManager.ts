import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { ConfigStore } from './ConfigStore';
import { BoostXModule, BoostXConfig } from '../../src/types';

export const BOOSTX_MODULES_CATALOG: BoostXModule[] = [
  // Performance
  { id: 'fps_boost', name: 'FPS Boost', category: 'performance', description: 'Improves game FPS via advanced rendering optimizations', enabled: true },
  { id: 'sodium_integration', name: 'Sodium Integration', category: 'performance', description: 'Optimizes chunk and geometry rendering', enabled: true },
  { id: 'optifine_support', name: 'OptiFine Support', category: 'performance', description: 'Graphics optimization compatibility layer', enabled: true },
  { id: 'lithium', name: 'Lithium', category: 'performance', description: 'Optimizes game physics and server-client logic', enabled: true },
  { id: 'ferrite_core', name: 'FerriteCore', category: 'performance', description: 'Reduces memory usage significantly', enabled: true },
  { id: 'immediately_fast', name: 'ImmediatelyFast', category: 'performance', description: 'Improves immediate-mode rendering performance', enabled: true },
  { id: 'entity_culling', name: 'Entity Culling', category: 'performance', description: "Doesn't render entities hidden behind blocks", enabled: true },
  { id: 'more_culling', name: 'More Culling', category: 'performance', description: 'Culls unnecessary block states and objects', enabled: true },
  { id: 'dynamic_fps', name: 'Dynamic FPS', category: 'performance', description: 'Reduces CPU/GPU usage when Minecraft is unfocused', enabled: true },
  { id: 'memory_optimizer', name: 'Memory Optimizer', category: 'performance', description: 'Cleans garbage collection overhead', enabled: true },
  { id: 'fast_chunk_loading', name: 'Fast Chunk Loading', category: 'performance', description: 'Speeds up world chunk packet handling', enabled: true },
  { id: 'chunk_optimizer', name: 'Chunk Optimizer', category: 'performance', description: 'Optimizes chunk mesh building', enabled: true },
  { id: 'particle_optimizer', name: 'Particle Optimizer', category: 'performance', description: 'Reduces heavy particle rendering lag', enabled: true },
  { id: 'animation_optimizer', name: 'Animation Optimizer', category: 'performance', description: 'Disables or optimizes invisible animations', enabled: true },
  { id: 'lazy_dfu', name: 'LazyDFU', category: 'performance', description: 'Improves startup time by lazy-loading DataFixerUpper', enabled: true },
  { id: 'fast_boot', name: 'Fast Boot', category: 'performance', description: 'Accelerates game startup sequence', enabled: true },
  { id: 'fast_world_load', name: 'Fast World Loading', category: 'performance', description: 'Optimizes singleplayer and multiplayer world loading', enabled: true },
  { id: 'reduced_entity_rendering', name: 'Reduced Entity Rendering', category: 'performance', description: 'Limits unnecessary entity rendering updates', enabled: false },
  { id: 'background_fps_limiter', name: 'Background FPS Limiter', category: 'performance', description: 'Limits FPS when game is in background', enabled: true },
  { id: 'vsync_control', name: 'VSync Control', category: 'performance', description: 'Advanced vertical synchronization controls', enabled: false },

  // PvP & Combat
  { id: 'keystrokes', name: 'Keystrokes', category: 'pvp', description: 'Shows WASD and mouse clicks on screen', enabled: true, settings: { scale: 1.0, color: '#2563eb' } },
  { id: 'cps_counter', name: 'CPS Counter', category: 'pvp', description: 'Shows clicks per second for left and right click', enabled: true },
  { id: 'combo_counter', name: 'Combo Counter', category: 'pvp', description: 'Counts consecutive hits landed on targets', enabled: true },
  { id: 'reach_display', name: 'Reach Display', category: 'pvp', description: 'Displays attack reach distance in blocks', enabled: false },
  { id: 'hit_delay_display', name: 'Hit Delay Display', category: 'pvp', description: 'Shows attack cooldown progress bar', enabled: true },
  { id: 'armor_status', name: 'Armor Status', category: 'pvp', description: 'Displays equipped armor and durability', enabled: true },
  { id: 'potion_status', name: 'Potion Status', category: 'pvp', description: 'Shows active potion effects and duration', enabled: true },
  { id: 'crosshair_customizer', name: 'Crosshair Customizer', category: 'pvp', description: 'Custom dynamic crosshair styling', enabled: true },
  { id: 'hit_color', name: 'Hit Color', category: 'pvp', description: 'Changes damage hurt indicator color', enabled: true, settings: { color: '#ff0000' } },
  { id: 'hitbox_display', name: 'Hitbox Display', category: 'pvp', description: 'Shows entity collision bounding boxes', enabled: false },
  { id: 'block_hit_animation', name: 'Block Hit Animation', category: 'pvp', description: 'Classic blocking animation with sword', enabled: true },
  { id: 'old_animations', name: '1.7 Animations', category: 'pvp', description: 'Classic 1.7 hit and block animations', enabled: true },
  { id: 'toggle_sprint', name: 'Toggle Sprint', category: 'pvp', description: 'Toggles sprinting without holding key', enabled: true },
  { id: 'toggle_sneak', name: 'Toggle Sneak', category: 'pvp', description: 'Toggles crouching without holding key', enabled: false },
  { id: 'freelook', name: 'Freelook', category: 'pvp', description: 'Look around independently without changing direction', enabled: true, hotkey: 'F' },
  { id: 'snaplook', name: 'Snaplook', category: 'pvp', description: 'Quick 180-degree perspective change', enabled: false },
  { id: 'fov_changer', name: 'FOV Changer', category: 'pvp', description: 'Custom field of view adjustments on speed', enabled: true },
  { id: 'perspective_mod', name: 'Perspective Mod', category: 'pvp', description: 'Advanced third-person camera controls', enabled: true },
  { id: 'motion_blur', name: 'Motion Blur', category: 'pvp', description: 'Adds smooth motion blur during movement', enabled: true, settings: { intensity: 50 } },
  { id: 'damage_indicator', name: 'Damage Indicator', category: 'pvp', description: 'Shows damage numbers and health bars', enabled: true },
  { id: 'target_hud', name: 'Target HUD', category: 'pvp', description: 'Displays looked-at player health and armor', enabled: true },
  { id: 'kill_counter', name: 'Kill Counter', category: 'pvp', description: 'Tracks session kills', enabled: true },
  { id: 'death_counter', name: 'Death Counter', category: 'pvp', description: 'Tracks session deaths', enabled: true },
  { id: 'win_counter', name: 'Win Counter', category: 'pvp', description: 'Tracks game wins', enabled: true },
  { id: 'wtap_trainer', name: 'W-Tap / S-Tap Trainer', category: 'pvp', description: 'Practices PvP movement timing', enabled: false },
  { id: 'block_overlay', name: 'Block Overlay', category: 'pvp', description: 'Highlights selected blocks with custom lines', enabled: true },
  { id: 'projectile_trajectory', name: 'Projectile Trajectory', category: 'pvp', description: 'Shows arrow and pearl landing paths', enabled: true },
  { id: 'arrow_counter', name: 'Arrow Counter', category: 'pvp', description: 'Tracks remaining arrows in inventory', enabled: true },
  { id: 'totem_counter', name: 'Totem Counter', category: 'pvp', description: 'Tracks remaining totems of undying', enabled: true },
  { id: 'cooldown_display', name: 'Cooldown Display', category: 'pvp', description: 'Displays item and pearl cooldown timers', enabled: true },
  { id: 'combo_animation', name: 'Combo Animation', category: 'pvp', description: 'Custom combo particle and hit effects', enabled: true },

  // HUD & Info
  { id: 'fps_hud', name: 'FPS HUD', category: 'hud', description: 'Shows current frames per second', enabled: true },
  { id: 'ping_hud', name: 'Ping HUD', category: 'hud', description: 'Shows network latency in milliseconds', enabled: true },
  { id: 'coordinates_hud', name: 'Coordinates (XYZ)', category: 'hud', description: 'Shows exact player coordinates', enabled: true },
  { id: 'direction_hud', name: 'Direction HUD', category: 'hud', description: 'Compass direction display', enabled: true },
  { id: 'biome_hud', name: 'Biome HUD', category: 'hud', description: 'Shows current biome name', enabled: true },
  { id: 'clock_hud', name: 'Clock HUD', category: 'hud', description: 'Shows real-world time', enabled: true },
  { id: 'world_time_hud', name: 'World Time HUD', category: 'hud', description: 'Shows Minecraft day time', enabled: true },
  { id: 'memory_hud', name: 'Memory HUD', category: 'hud', description: 'Shows RAM usage percentage and megabytes', enabled: true },
  { id: 'cpu_hud', name: 'CPU HUD', category: 'hud', description: 'Shows CPU usage percentage', enabled: false },
  { id: 'gpu_hud', name: 'GPU HUD', category: 'hud', description: 'Shows GPU stats', enabled: false },
  { id: 'playtime_hud', name: 'Playtime HUD', category: 'hud', description: 'Shows session duration', enabled: true },
  { id: 'server_address_hud', name: 'Server Address HUD', category: 'hud', description: 'Shows connected server IP', enabled: true },
  { id: 'server_tps_hud', name: 'Server TPS HUD', category: 'hud', description: 'Shows server ticks per second', enabled: true },
  { id: 'speedometer', name: 'Speedometer', category: 'hud', description: 'Shows movement speed in blocks/sec', enabled: true },
  { id: 'durability_hud', name: 'Durability HUD', category: 'hud', description: 'Armor & tool durability warning display', enabled: true },
  { id: 'boss_bar_hud', name: 'Boss Bar Customizer', category: 'hud', description: 'Custom boss health bar styling', enabled: true },
  { id: 'scoreboard_customizer', name: 'Scoreboard Customizer', category: 'hud', description: 'Cleans up and customizes server scoreboard', enabled: true },
  { id: 'tab_customizer', name: 'Tab Customizer', category: 'hud', description: 'Enhances player tab list', enabled: true },
  { id: 'player_counter', name: 'Player Counter', category: 'hud', description: 'Shows online player count', enabled: true },
  { id: 'entity_counter', name: 'Entity Counter', category: 'hud', description: 'Shows nearby entity count', enabled: false },
  { id: 'item_counter', name: 'Item Counter', category: 'hud', description: 'Counts selected stack quantity', enabled: true },
  { id: 'day_counter', name: 'Day Counter', category: 'hud', description: 'Tracks Minecraft days elapsed', enabled: true },
  { id: 'stopwatch', name: 'Stopwatch', category: 'hud', description: 'In-game stopwatch timer', enabled: false },
  { id: 'status_hud', name: 'Status HUD', category: 'hud', description: 'Displays player status and buffs', enabled: true },

  // Visuals & Cosmetics
  { id: 'time_changer', name: 'Time Changer', category: 'visual', description: 'Changes client-side visual time of day', enabled: false },
  { id: 'weather_changer', name: 'Weather Changer', category: 'visual', description: 'Changes client-side weather', enabled: false },
  { id: 'fog_customizer', name: 'Fog Customizer', category: 'visual', description: 'Customizes fog density and distance', enabled: true },
  { id: 'fullbright', name: 'Fullbright', category: 'visual', description: 'Brightens dark areas and caves instantly', enabled: true, hotkey: 'B' },
  { id: 'custom_sky', name: 'Custom Sky', category: 'visual', description: 'Custom galaxy and celestial sky textures', enabled: true },
  { id: 'custom_sun_moon', name: 'Custom Sun & Moon', category: 'visual', description: 'Custom celestial body textures', enabled: true },
  { id: 'custom_particles', name: 'Custom Particles', category: 'visual', description: 'Enhanced particle effects', enabled: true },
  { id: 'particle_multiplier', name: 'Particle Multiplier', category: 'visual', description: 'Adjusts particle quantity', enabled: true },
  { id: 'item_physics', name: 'Item Physics', category: 'visual', description: 'Realistic 3D dropped item physics on ground', enabled: true },
  { id: '3d_items', name: '3D Items', category: 'visual', description: 'Displays inventory items in 3D', enabled: true },
  { id: '3d_skins', name: '3D Skins', category: 'visual', description: 'Enhances player skin rendering with 3D layers', enabled: true },
  { id: 'glint_colorizer', name: 'Glint Colorizer', category: 'visual', description: 'Changes enchantment glint color', enabled: true, settings: { color: '#9333ea' } },
  { id: 'shiny_pots', name: 'Shiny Pots', category: 'visual', description: 'Enhanced potion bottle appearance', enabled: true },
  { id: 'block_outline', name: 'Block Outline', category: 'visual', description: 'Custom block selection outline color', enabled: true },
  { id: 'custom_damage_effects', name: 'Custom Damage Effects', category: 'visual', description: 'Custom hit flash and blood/crit effects', enabled: true },
  { id: 'custom_explosion_effects', name: 'Custom Explosion Effects', category: 'visual', description: 'Enhanced explosion visuals', enabled: true },
  { id: 'menu_blur', name: 'Menu Blur', category: 'visual', description: 'Blurs background when opening inventory or pause menu', enabled: true },
  { id: 'custom_animations', name: 'Custom Animations', category: 'visual', description: 'Smooth eating, drinking, and bow animations', enabled: true },
  { id: 'custom_nametags', name: 'Custom NameTags', category: 'visual', description: 'Customizes player name tag fonts and backgrounds', enabled: true },
  { id: 'custom_enchantments', name: 'Custom Enchantments', category: 'visual', description: 'Visual enchantment effects', enabled: true },
  { id: 'custom_fire', name: 'Custom Fire', category: 'visual', description: 'Low fire overlay so you can see while burning', enabled: true },
  { id: 'custom_water', name: 'Custom Water', category: 'visual', description: 'Clear transparent water', enabled: true },
  { id: 'custom_gui', name: 'Custom GUI', category: 'visual', description: 'Sleek dark interface styling', enabled: true },
  { id: 'custom_panorama', name: 'Custom Panorama', category: 'visual', description: 'Custom main menu background panorama', enabled: true },

  // Utility & QoL
  { id: 'zoom', name: 'Zoom', category: 'utility', description: 'Smooth optical zoom into the game', enabled: true, hotkey: 'C' },
  { id: 'waypoints', name: 'Waypoints', category: 'utility', description: 'Save and navigate to important locations', enabled: true },
  { id: 'world_map', name: 'World Map', category: 'utility', description: 'Full screen explored world map', enabled: true },
  { id: 'minimap', name: 'Minimap', category: 'utility', description: 'Shows nearby surroundings and entities on HUD', enabled: true },
  { id: 'item_tracker', name: 'Item Tracker', category: 'utility', description: 'Tracks specific items in inventory', enabled: true },
  { id: 'inventory_hud', name: 'Inventory HUD', category: 'utility', description: 'Shows inventory items on screen without opening inventory', enabled: true },
  { id: 'inventory_profiles', name: 'Inventory Profiles', category: 'utility', description: 'Automated inventory sorting and organization', enabled: true },
  { id: 'sort_inventory', name: 'Sort Inventory', category: 'utility', description: '1-click inventory sorting', enabled: true },
  { id: 'mouse_wheelie', name: 'Mouse Wheelie', category: 'utility', description: 'Fast item moving with scroll wheel', enabled: true },
  { id: 'scrollable_tooltips', name: 'Scrollable Tooltips', category: 'utility', description: 'Scroll long item descriptions and NBT data', enabled: true },
  { id: 'better_sounds', name: 'Better Sounds', category: 'utility', description: 'Improves sound customization and attenuation', enabled: true },
  { id: 'sound_changer', name: 'Sound Changer', category: 'utility', description: 'Custom sound profile manager', enabled: true },
  { id: 'auto_text_hotkey', name: 'Auto Text Hotkey', category: 'utility', description: 'Sends saved chat messages instantly on key press', enabled: false },
  { id: 'chat_customizer', name: 'Chat Customizer', category: 'utility', description: 'Custom chat background, fonts, and opacity', enabled: true },
  { id: 'chat_timestamps', name: 'Chat Timestamps', category: 'utility', description: 'Shows message timestamps in chat', enabled: true },
  { id: 'chat_notifications', name: 'Chat Notifications', category: 'utility', description: 'Notifies when your username is mentioned', enabled: true },
  { id: 'nick_hider', name: 'Nick Hider', category: 'utility', description: 'Hides your username for streaming/recording', enabled: false },
  { id: 'screenshot_uploader', name: 'Screenshot Uploader', category: 'utility', description: 'Instantly uploads screenshots to cloud', enabled: false },
  { id: 'screenshot_manager', name: 'Screenshot Manager', category: 'utility', description: 'In-game screenshot gallery and manager', enabled: true },
  { id: 'pack_organizer', name: 'Pack Organizer', category: 'utility', description: 'Organizes resource packs and shaders', enabled: true },
  { id: 'resource_pack_display', name: 'Resource Pack Display', category: 'utility', description: 'Shows active resource pack info', enabled: true },
  { id: 'server_address_display', name: 'Server Address Display', category: 'utility', description: 'Displays server IP on HUD', enabled: true },
  { id: 'disconnect_screen', name: 'Disconnect Screen', category: 'utility', description: 'Custom disconnect interface with reconnect button', enabled: true },
  { id: 'quick_join', name: 'Quick Join', category: 'utility', description: 'Quickly joins favorite servers', enabled: true },
  { id: 'server_switcher', name: 'Server Switcher', category: 'utility', description: 'Switch between servers without returning to title', enabled: true },
  { id: 'auto_reconnect', name: 'Auto Reconnect', category: 'utility', description: 'Automatically reconnects after server disconnect/kick', enabled: true },
  { id: 'friend_notifications', name: 'Friend Notifications', category: 'utility', description: 'Notifies when friends join', enabled: true },
  { id: 'item_search', name: 'Item Search', category: 'utility', description: 'Searches inventory and recipe items', enabled: true },
  { id: 'recipe_book_improvements', name: 'Recipe Book Improvements', category: 'utility', description: 'Improves recipe browsing and crafting', enabled: true },
  { id: 'container_search', name: 'Container Search', category: 'utility', description: 'Searches chest and container contents', enabled: true },
  { id: 'death_coordinates', name: 'Death Coordinates', category: 'utility', description: 'Saves death location waypoint automatically', enabled: true },
  { id: 'chat_translator', name: 'Chat Translator', category: 'utility', description: 'Translates foreign chat messages in real time', enabled: false },
  { id: 'screenshot_preview', name: 'Screenshot Preview', category: 'utility', description: 'Previews screenshots instantly after capture', enabled: true },

  // Survival & World
  { id: 'durability_viewer', name: 'Durability Viewer', category: 'world', description: 'Shows tool and armor durability numbers', enabled: true },
  { id: 'food_hud', name: 'Food & Saturation HUD', category: 'world', description: 'Shows food hunger and exact saturation values', enabled: true },
  { id: 'health_indicators', name: 'Health Indicators', category: 'world', description: 'Displays exact health numbers on entities', enabled: true },
  { id: 'armor_durability_warning', name: 'Armor Durability Warning', category: 'world', description: 'Warns when armor is about to break', enabled: true },
  { id: 'crop_information', name: 'Crop Information', category: 'world', description: 'Displays crop growth stage and timing', enabled: true },
  { id: 'harvest_timer', name: 'Harvest Timer', category: 'world', description: 'Shows crop maturity timers', enabled: true },
  { id: 'light_level_display', name: 'Light Level Display', category: 'world', description: 'Shows block light levels to prevent mob spawns', enabled: true },
  { id: 'spawn_indicator', name: 'Spawn Indicator', category: 'world', description: 'Shows where mobs can spawn on blocks', enabled: true },
  { id: 'slime_chunk_finder', name: 'Slime Chunk Finder', category: 'world', description: 'Identifies slime chunks on map', enabled: true },
  { id: 'chunk_borders', name: 'Chunk Borders', category: 'world', description: 'Displays chunk boundaries (F3+G equivalent)', enabled: true, hotkey: 'F9' },
  { id: 'light_overlay', name: 'Light Overlay', category: 'world', description: 'Color-coded light level indicators', enabled: true },
  { id: 'block_information', name: 'Block Information', category: 'world', description: 'Detailed block NBT and state information', enabled: true },
  { id: 'waila', name: 'WAILA (What Am I Looking At)', category: 'world', description: 'Displays block and entity info on hover', enabled: true },
  { id: 'mob_health', name: 'Mob Health Bar', category: 'world', description: 'Floating health bars above mobs', enabled: true },
  { id: 'fishing_timer', name: 'Fishing Timer', category: 'world', description: 'Helps track and time fishing bites', enabled: true },
  { id: 'compass_navigation', name: 'Compass Navigation', category: 'world', description: 'Navigation assistance bar', enabled: true },
  { id: 'bed_indicator', name: 'Bed Indicator', category: 'world', description: 'Displays spawn point status and distance', enabled: true },
];

export class BoostXManager {
  private configStore: ConfigStore;

  constructor(configStore: ConfigStore) {
    this.configStore = configStore;
  }

  public getModules(): BoostXModule[] {
    return BOOSTX_MODULES_CATALOG;
  }

  public async ensureBoostXMod(profileId: string): Promise<string> {
    const profilesDir = this.configStore.getProfilesDir();
    const profileFolder = path.join(profilesDir, profileId);
    const modsDir = path.join(profileFolder, 'mods');
    const configDir = path.join(profileFolder, 'config', 'boostx');

    if (!fs.existsSync(modsDir)) fs.mkdirSync(modsDir, { recursive: true });
    if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });

    const modFilename = 'boostx-1.0.0.jar';
    const modFilePath = path.join(modsDir, modFilename);

    if (!fs.existsSync(modFilePath)) {
      this.createBoostXJar(modFilePath);
    }

    const configFile = path.join(configDir, 'config.json');
    if (!fs.existsSync(configFile)) {
      const defaultModules: Record<string, any> = {};
      for (const mod of BOOSTX_MODULES_CATALOG) {
        defaultModules[mod.id] = {
          enabled: mod.enabled,
          hotkey: mod.hotkey,
          settings: mod.settings || {},
        };
      }
      const initialConfig: BoostXConfig = {
        version: '1.0.0',
        guiKey: 'Right Shift',
        modules: defaultModules,
      };
      fs.writeFileSync(configFile, JSON.stringify(initialConfig, null, 2), 'utf-8');
    }

    return modFilePath;
  }

  private createBoostXJar(targetPath: string): void {
    try {
      const zip = new AdmZip();

      const fabricModJson = {
        schemaVersion: 1,
        id: 'boostx',
        version: '1.0.0',
        name: 'BoostX Client Mod',
        description: "BoostClient's all-in-one performance and HUD suite with Right-Shift Client GUI, FPS boosts, Sodium integration, PvP HUDs, visuals, and utilities.",
        authors: ['BoostClient Team'],
        contact: {
          homepage: 'https://github.com/PromptGPTX/boostclient',
          sources: 'https://github.com/PromptGPTX/boostclient',
          discord: 'https://discord.gg/TUTvzCmtyD',
        },
        license: 'MIT',
        icon: 'assets/boostx/icon.png',
        environment: 'client',
        entrypoints: {
          client: ['com.boostclient.boostx.BoostXClientMod'],
        },
        depends: {
          fabricloader: '>=0.14.0',
          minecraft: '>=1.16.5',
          sodium: '*',
          'fabric-api': '*',
        },
      };

      zip.addFile('fabric.mod.json', Buffer.from(JSON.stringify(fabricModJson, null, 2), 'utf-8'));
      zip.addFile('pack.mcmeta', Buffer.from(JSON.stringify({ pack: { pack_format: 9, description: 'BoostX Client Resources' } }, null, 2), 'utf-8'));

      zip.writeZip(targetPath);
      console.log('[BoostXManager] Created BoostX mod jar at:', targetPath);
    } catch (err) {
      console.error('[BoostXManager] Failed to create BoostX jar:', err);
    }
  }

  public getProfileConfig(profileId: string): BoostXConfig {
    const profilesDir = this.configStore.getProfilesDir();
    const configFile = path.join(profilesDir, profileId, 'config', 'boostx', 'config.json');

    try {
      if (fs.existsSync(configFile)) {
        return JSON.parse(fs.readFileSync(configFile, 'utf-8')) as BoostXConfig;
      }
    } catch (err) {
      console.error('Failed to read BoostX config:', err);
    }

    const defaultModules: Record<string, any> = {};
    for (const mod of BOOSTX_MODULES_CATALOG) {
      defaultModules[mod.id] = { enabled: mod.enabled, hotkey: mod.hotkey, settings: mod.settings || {} };
    }
    return { version: '1.0.0', guiKey: 'Right Shift', modules: defaultModules };
  }

  public saveProfileConfig(profileId: string, config: BoostXConfig): boolean {
    try {
      const profilesDir = this.configStore.getProfilesDir();
      const configDir = path.join(profilesDir, profileId, 'config', 'boostx');
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      const configFile = path.join(configDir, 'config.json');
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Failed to save BoostX config:', err);
      return false;
    }
  }
}
