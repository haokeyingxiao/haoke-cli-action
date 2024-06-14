import { renameSync } from 'fs';
import { join } from 'path';
import { info, debug, exportVariable } from '@actions/core';
import {
  extractZip, extractTar, downloadTool, cacheDir,
} from '@actions/tool-cache';
import { osArch, osPlat } from './context';

import { getRelease } from './github';
import globalCacheDir from 'global-cache-dir'
import { restoreCache, isFeatureAvailable } from '@actions/cache';
import { getCacheKeys } from '../shared/cache';

function getFilename() {
  let arch: string;
  switch (osArch) {
    case 'x64': {
      arch = 'x86_64';
      break;
    }
    case 'x32': {
      arch = 'i386';
      break;
    }
    case 'arm': {
      const { arm_version: armVersion } = process.config.variables as { arm_version?: string };
      arch = armVersion ? `armv${armVersion}` : 'arm';
      break;
    }
    default: {
      arch = osArch;
      break;
    }
  }
  if (osPlat === 'darwin') {
    arch = 'all';
  }

  switch (osPlat) {
    case 'win32': {
      return `haoke-cli_windows_${arch}.zip`;
    }
    case 'darwin': {
      return `haoke-cli_warwin_${arch}.tar.gz`;
    }
    default: {
      return `haoke-cli_linux_${arch}.tar.gz`;
    }
  }
}

async function extractArchive(path: string): Promise<string> {
  if (osPlat === 'win32') {
    if (!path.endsWith('.zip')) {
      const newPath = `${path}.zip`;
      renameSync(path, newPath);
      return extractZip(newPath);
    }
    return extractZip(path);
  }
  return extractTar(path);
}

export async function install(version: string) {
  const release = await getRelease(version);
  info(`Versoin: ${version}`);

  if (release.prerelease) {
    debug(`Release ${version} is a pre-release`);
  }

  exportVariable("HAOKE_CLI_VERSION", release.tag_name)
  process.env.HAOKE_CLI_VERSION = release.tag_name;

  const haokeCliCacheDir = await globalCacheDir('haoke-cli');

  if (isFeatureAvailable()) {
    const cacheKeys = getCacheKeys();

    await restoreCache([
      haokeCliCacheDir
    ],
    cacheKeys.shift() as string,
    cacheKeys
    )
  }
  const filename = getFilename();

  const downloadUrl = release.assets.find((asset:any) => asset.name === filename)?.browser_download_url;

  if (!downloadUrl) {
    throw new Error(`No asset found with the filename: ${filename}`);
  }

  info(`Downloading ${downloadUrl}`);
  const downloadPath = await downloadTool(downloadUrl);
  debug(`Downloaded to ${downloadPath}`);

  info('Extracting haoke-cli');
  const extPath = await extractArchive(downloadPath);
  debug(`Extracted to ${extPath}`);

  const cachePath = await cacheDir(
    extPath,
    'haoke-cli-action',
    release.tag_name.replace(/^v/, ''),
  );
  debug(`Cached to ${cachePath}`);

  const exePath = join(
    cachePath,
    `haoke-cli${osPlat === 'win32' ? '.exe' : ''}`,
  );
  debug(`Exe path is ${exePath}`);

  return { bin: exePath, version: release.tag_name };
}

