import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {desktopPackageOptions, trimMenuTranslations} from '../scripts/package-desktop.mjs';

const root = await fs.mkdtemp(path.join(os.tmpdir(), 'liqu3d-package-test-'));
try {
  for (const platform of ['darwin', 'win32', 'linux']) {
    const buildPath = path.join(root, platform);
    const directories = platform === 'darwin' ? [
      'Electron.app/Contents/Resources',
      'Electron.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Resources'
    ] : ['locales'];
    for (const relative of directories) {
      const directory = path.join(buildPath, relative);
      const names = platform === 'darwin'
        ? ['en.lproj/locale.pak', 'en_GB.lproj/locale.pak', 'Base.lproj/menu.nib', 'de.lproj/locale.pak', 'zh_CN.lproj/locale.pak', 'icudtl.dat', 'chrome_200_percent.pak']
        : ['en-US.pak', 'en-GB.pak', 'de.pak', 'zh-CN.pak', 'keep.dat'];
      for (const name of names) {
        const file = path.join(directory, name);
        await fs.mkdir(path.dirname(file), {recursive: true});
        await fs.writeFile(file, 'fixture');
      }
    }
    await trimMenuTranslations({buildPath, platform});
    for (const relative of directories) {
      const entries = await fs.readdir(path.join(buildPath, relative));
      assert.deepEqual(entries.sort(), (platform === 'darwin'
        ? ['en.lproj', 'en_GB.lproj', 'Base.lproj', 'icudtl.dat', 'chrome_200_percent.pak']
        : ['en-US.pak', 'en-GB.pak', 'keep.dat']).sort());
    }
    const options = desktopPackageOptions(['--platform', platform, '--arch', 'x64']);
    assert.equal(options.platform, platform);
    assert.equal(options.arch, 'x64');
    const excluded = name => options.ignore.some(pattern => pattern.test(name));
    for (const name of ['/data/accounts.sqlite', '/.env.local', '/scripts/package-desktop.mjs', '/desktop/icons/App.iconset/icon_512x512.png']) assert.equal(excluded(name), true);
    for (const name of ['/desktop/main.cjs', '/desktop/icons/app.png', '/fonts/bundled/font.ttf', '/public/app.js', '/profiles/default.json', '/LICENSE', '/THIRD_PARTY_NOTICES.md']) assert.equal(excluded(name), false);
  }
  assert.throws(() => desktopPackageOptions(['--platform', 'unknown']));
  console.log('Desktop packaging passed: platform targets, English fallback, required assets and private-file exclusions.');
} finally {
  await fs.rm(root, {recursive: true});
}
