import crypto from 'crypto';
import { ConfigStore } from './ConfigStore';
import { Account } from '../../src/types';

export class AuthManager {
  private configStore: ConfigStore;
  private activePollingInterval: NodeJS.Timeout | null = null;

  constructor(configStore: ConfigStore) {
    this.configStore = configStore;
  }

  /**
   * Generates a deterministic Minecraft offline UUID (Version 3 UUID from MD5)
   */
  public generateOfflineUUID(username: string): string {
    const hash = crypto.createHash('md5').update('OfflinePlayer:' + username).digest();
    // Set version to 3 (UUID v3)
    hash[6] = (hash[6] & 0x0f) | 0x30;
    // Set variant to IETF
    hash[8] = (hash[8] & 0x3f) | 0x80;

    const hex = hash.toString('hex');
    return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`;
  }

  /**
   * Login or register an offline account
   */
  public loginOffline(username: string): Account {
    const cleanName = username.trim() || 'Player';
    const uuid = this.generateOfflineUUID(cleanName);
    const account: Account = {
      id: `offline-${cleanName.toLowerCase()}`,
      username: cleanName,
      uuid,
      type: 'offline',
      skinUrl: `https://mc-heads.net/avatar/${encodeURIComponent(cleanName)}/128`,
    };

    return this.configStore.saveAccount(account);
  }

  /**
   * Starts Microsoft Device Code authentication flow
   */
  public async startMicrosoftLogin(
    onDeviceCode: (data: { userCode: string; verificationUri: string }) => void
  ): Promise<Account> {
    if (this.activePollingInterval) {
      clearInterval(this.activePollingInterval);
      this.activePollingInterval = null;
    }

    // Azure Client ID for Minecraft / Xbox Live
    const clientId = '00000000402b5328';
    const scope = 'service::user.auth.xboxlive.com::MBI_SSL';

    const deviceCodeResponse = await fetch('https://login.live.com/oauth20_connect.srf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        scope: scope,
        response_type: 'device_code',
      }),
    });

    if (!deviceCodeResponse.ok) {
      throw new Error(`Failed to request device code: ${deviceCodeResponse.statusText}`);
    }

    const deviceData = (await deviceCodeResponse.json()) as {
      device_code: string;
      user_code: string;
      verification_uri: string;
      expires_in: number;
      interval: number;
    };

    onDeviceCode({
      userCode: deviceData.user_code,
      verificationUri: deviceData.verification_uri,
    });

    return new Promise<Account>((resolve, reject) => {
      const intervalSec = Math.max(deviceData.interval || 5, 5);
      const expiresAt = Date.now() + (deviceData.expires_in || 900) * 1000;

      this.activePollingInterval = setInterval(async () => {
        if (Date.now() > expiresAt) {
          if (this.activePollingInterval) clearInterval(this.activePollingInterval);
          reject(new Error('Microsoft login timed out.'));
          return;
        }

        try {
          const pollRes = await fetch('https://login.live.com/oauth20_token.srf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: clientId,
              grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
              device_code: deviceData.device_code,
            }),
          });

          const pollData = (await pollRes.json()) as any;

          if (pollData.error) {
            if (pollData.error === 'authorization_pending') {
              // User has not finished entering code yet; keep polling
              return;
            }
            if (this.activePollingInterval) clearInterval(this.activePollingInterval);
            reject(new Error(`Login error: ${pollData.error_description || pollData.error}`));
            return;
          }

          if (pollData.access_token) {
            if (this.activePollingInterval) clearInterval(this.activePollingInterval);

            // Step 2: Authenticate with Xbox Live
            const xblRes = await fetch('https://user.auth.xboxlive.com/user/authenticate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              body: JSON.stringify({
                Properties: {
                  AuthMethod: 'RPS',
                  SiteName: 'user.auth.xboxlive.com',
                  RpsTicket: `d=${pollData.access_token}`,
                },
                RelyingParty: 'http://auth.xboxlive.com',
                TokenType: 'JWT',
              }),
            });

            const xblData = (await xblRes.json()) as any;
            const xblToken = xblData.Token;
            const uhs = xblData.DisplayClaims?.xui?.[0]?.uhs;

            // Step 3: XSTS
            const xstsRes = await fetch('https://xsts.auth.xboxlive.com/xsts/authorize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              body: JSON.stringify({
                Properties: {
                  SandboxId: 'RETAIL',
                  UserTokens: [xblToken],
                },
                RelyingParty: 'rp://api.minecraftservices.com/',
                TokenType: 'JWT',
              }),
            });

            const xstsData = (await xstsRes.json()) as any;
            const xstsToken = xstsData.Token;

            // Step 4: Login with Xbox to Minecraft Services
            const mcLoginRes = await fetch('https://api.minecraftservices.com/authentication/login_with_xbox', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                identityToken: `XBL3.0 x=${uhs};${xstsToken}`,
              }),
            });

            const mcLoginData = (await mcLoginRes.json()) as any;
            const mcAccessToken = mcLoginData.access_token;

            // Step 5: Fetch Minecraft Profile
            const profileRes = await fetch('https://api.minecraftservices.com/minecraft/profile', {
              headers: { Authorization: `Bearer ${mcAccessToken}` },
            });

            const profileData = (await profileRes.json()) as any;

            const account: Account = {
              id: `ms-${profileData.id}`,
              username: profileData.name || 'MinecraftPlayer',
              uuid: profileData.id,
              type: 'microsoft',
              accessToken: mcAccessToken,
              refreshToken: pollData.refresh_token,
              expiresAt: Date.now() + (pollData.expires_in || 86400) * 1000,
              skinUrl: profileData.skins?.[0]?.url || `https://mc-heads.net/avatar/${profileData.name}/128`,
            };

            this.configStore.saveAccount(account);
            resolve(account);
          }
        } catch (err) {
          console.error('[AuthManager] Error during polling', err);
        }
      }, intervalSec * 1000);
    });
  }
}
