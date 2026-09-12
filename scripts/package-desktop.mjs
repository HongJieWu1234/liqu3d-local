import { packager } from '@electron/packager';
import fs from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('../', import.meta.url));

// The app UI is English. Trim only translated Chromium menus in the temporary
// Electron copy; retain English variants, ICU, fonts and all rendering assets.
export async function trimMenuTranslations({buildPath, platform}) {
  const directories = platform === 'darwin'
    ? [
        path.join(buildPath, 'Electron.app/Contents/Resources'),
        path.join(buildPath, 'Electron.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Resources')
      ]
    : [path.join(buildPath, 'locales')];
  for (const directory of directories) {
    const entries = await fs.readdir(directory, {withFileTypes: true});
    for (const entry of entries) {
      const locale = platform === 'darwin'
        ? entry.isDirectory() && entry.name.endsWith('.lproj') && entry.name !== 'Base.lproj'
        : entry.isFile() && entry.name.endsWith('.pak');
      if (locale && !/^en(?:[-_.]|$)/.test(entry.name)) {
        await fs.rm(path.join(directory, entry.name), {recursive: entry.isDirectory()});
      }
    }
  }
}

export function desktopPackageOptions(args = process.argv.slice(2)) {
  const {values} = parseArgs({args, options: {platform: {type: 'string'}, arch: {type: 'string'}}});
  const platform = values.platform || process.platform;
  const arch = values.arch || process.arch;
  if (!['darwin', 'win32', 'linux'].includes(platform)) throw new Error('Use --platform darwin, win32, or linux.');
  if (!['arm64', 'x64'].includes(arch)) throw new Error('Use --arch arm64 or x64.');
  return {
    dir, name: 'Liqu3D Local', out: path.join(dir, 'dist'), overwrite: true, asar: false,
    platform, arch, icon: path.join(dir, 'desktop/icons/app'),
    appBundleId: 'com.liqu3d.local', appCategoryType: 'public.app-category.graphics-design',
    ignore: [
      /^\/renderer-(?:service|worker)\.mjs$/, /^\/Dockerfile$/, /^\/.*compose.*\.yml$/, /^\/Caddyfile$/,
      /^\/public\/welcome/, /^\/(?:data|cache|secrets|dist|tests|docs|scripts|\.git)(?:\/|$)/,
      /^\/\.env/, /^\/result\.json$/, /^\/(?:AGENTS|README|SECURITY)\.md$/,
      /^\/desktop\/icons\/(?:App\.iconset(?:\/|$)|app\.(?:svg|icns|ico)$)/
    ],
    afterExtract: [trimMenuTranslations], prune: true
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const paths = await packager(desktopPackageOptions());
  console.log(paths.join('\n'));
}
