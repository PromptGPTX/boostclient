/**
 * BoostClient Portable Updater
 * Safely fetches latest setup and mods from PromptGPTX/boostclient
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const REPO = 'PromptGPTX/boostclient';
const MANIFEST_URL = `https://raw.githubusercontent.com/${REPO}/main/updater/update-manifest.json`;

async function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'BoostClient-Updater' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function checkUpdates(currentVersion = '1.2.0') {
  console.log(`[Updater] Checking for BoostClient updates against ${REPO}...`);
  try {
    const manifest = await fetchJSON(MANIFEST_URL);
    const latestVersion = manifest.client.version;
    const hasUpdate = latestVersion !== currentVersion;
    console.log(`[Updater] Current: ${currentVersion} | Latest: ${latestVersion}`);
    if (hasUpdate) {
      console.log(`[Updater] Update available! Setup executable URL: ${manifest.client.downloadUrl}`);
    } else {
      console.log(`[Updater] You are running the latest version of BoostClient!`);
    }
    return { hasUpdate, manifest };
  } catch (err) {
    console.error('[Updater] Failed to check for updates:', err.message);
    return { hasUpdate: false, error: err.message };
  }
}

if (require.main === module) {
  checkUpdates();
}

module.exports = { checkUpdates };
