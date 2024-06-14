import globalCacheDir from 'global-cache-dir'
import { saveCache, isFeatureAvailable } from '@actions/cache';
import { existsSync } from 'fs';
import { getCacheKeys } from '../shared/cache';

async function run() {
  delete process.env.GITHUB_TOKEN;

  if (isFeatureAvailable()) {
    const cacheKeys = getCacheKeys();
    const haokeCliCacheDir = await globalCacheDir('haoke-cli');

    if (existsSync(haokeCliCacheDir)) {
      await saveCache(
        [
          haokeCliCacheDir
        ],
        cacheKeys.shift() as string,
        undefined,
        false
      )
    }
  }

  process.exit(0);
}

run();
