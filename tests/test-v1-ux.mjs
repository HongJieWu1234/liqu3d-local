import './setup.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const html = await fs.readFile('./public/index.html', 'utf8');
const css = await fs.readFile('./public/styles.css', 'utf8');
const app = await fs.readFile('./public/app.js', 'utf8');

for (const label of ['Variants', 'Rules &amp; Tools']) {
  assert.match(html, new RegExp(`data-production-tab="[^"]+"[^>]*>${label}<\\/button>`));
}
assert.doesNotMatch(html, />SKUs &amp; Variants<|>Jobs<|>CSV batch<|>Customer links</);
assert.doesNotMatch(html, /id="productionDashboardBtn"|id="workflowModal"/);
assert.doesNotMatch(html, /advanced-workflow-guide/);
assert.doesNotMatch(html, /workflow-columns/);
assert.match(html, /id="filamentMenuLayer"/);
assert.match(html, /id="filamentSettingsForm"/);
assert.doesNotMatch(html, /filamentColor|bambuFilamentSwatch|filament-color-field/);
assert.doesNotMatch(app, /querySelector\('#filamentColor'\)|filamentColor\.addEventListener/);
assert.match(app, /function openFilamentMenu\(\)/);
assert.match(app, /filamentSettingsForm\.append\(groupElement\)/);
assert.doesNotMatch(app, /setActivePrintGroup\('filament'\)/);
assert.doesNotMatch(app, /advancedToolTabs|setAdvancedView/, 'Retired Advanced handlers must not block workspace startup');
assert.doesNotMatch(app, /browse\.textContent\s*=\s*['"]Browse['"]/, 'Font controls must not show a Browse button');
assert.doesNotMatch(app, /advancedToolTabs|setAdvancedView/, 'Removed Advanced navigation must not remain in startup code');

assert.match(css, /\.export-popover\s*\{[\s\S]*width:\s*min\(460px/);
assert.match(css, /\.workflow-dialog\s*\{[\s\S]*width:\s*min\(760px/);
assert.match(css, /\.filament-popover/);

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(ids).size, ids.length, 'HTML IDs must be unique');
console.log('v1 UX guards passed');
