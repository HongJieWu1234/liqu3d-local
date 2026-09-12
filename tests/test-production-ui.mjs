import './setup.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const [html, dashboard, app, css] = await Promise.all([
  fs.readFile(new URL('../public/index.html', import.meta.url), 'utf8'),
  fs.readFile(new URL('../public/production-dashboard.js', import.meta.url), 'utf8'),
  fs.readFile(new URL('../public/app.js', import.meta.url), 'utf8'),
  fs.readFile(new URL('../public/styles.css', import.meta.url), 'utf8')
]);
const controller = `${dashboard}\n${app}`;

const requiredIds = [
  'productionDashboardModal', 'workflowBtn', 'variantSearch', 'presetStackList',
  'variantEditorDetails', 'presetTarget', 'presetName', 'presetCategory',
  'selectChangedParamsBtn', 'selectAllParamsBtn', 'clearParamsBtn',
  'variantParameterSearch', 'variantParameterEmpty', 'presetParameterList',
  'savePresetBtn', 'productionTemplateList', 'productionCalibrationList',
  'productionComponentName', 'productionComponentSource',
  'saveProductionComponentBtn', 'productionComponentList'
];
for (const id of requiredIds) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `Advanced UI is missing #${id}`);
  assert.ok(controller.includes(id), `Advanced controller is not wired to #${id}`);
}

for (const tab of ['variants', 'tools']) {
  assert.match(html, new RegExp(`data-production-tab=["']${tab}["']`));
  assert.match(html, new RegExp(`data-production-panel=["']${tab}["']`));
}
assert.doesNotMatch(html, /data-production-(?:tab|panel)=["'](?:products|jobs|batch|links)["']/);

const advancedMarkup = html.slice(html.indexOf('id="productionDashboardModal"'), html.indexOf('id="exportMenuLayer"'));
assert.doesNotMatch(advancedMarkup, /\bSKU(?:s)?\b|skuVariant|productionSku|productionDiff|productionWebhook/i);
assert.doesNotMatch(dashboard, /\/api\/production\/(?:jobs|configurators|skus|diff|webhooks)/);
for (const endpoint of ['templates', 'components', 'calibrations']) {
  assert.match(dashboard, new RegExp(`/api/production/${endpoint}`));
}
assert.doesNotMatch(dashboard, /\/api\/(?:printer|printers|ams|farm|cloud)\b/i);

for (const id of ['parametricRulesPanel', 'parametricRulesEditor', 'applyParametricRulesBtn', 'parametricRulesSummary']) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `Rule UI is missing #${id}`);
}

assert.match(app, /activePresetIds = enabled\.checked \? \[preset\.id\] : \[\]/);
assert.match(app, /preset\.values = savedValues/);
assert.match(app, /Delete variant/);
assert.match(css, /\.unified-advanced-dialog/);
assert.match(css, /\.unified-advanced-dialog[\s\S]*font-size:\s*24px/);
assert.match(css, /\.unified-advanced-dialog[\s\S]*min-height:\s*42px/);
assert.match(dashboard, /event\.key === 'Escape'/);
assert.match(dashboard, /event\.key !== 'Tab'/);
assert.match(dashboard, /document\.querySelector\('\.app-shell'\)\.inert = true/);
assert.match(dashboard, /activateTab\('variants'\)/);

console.log('Advanced UI wiring passed: standalone Variants plus Rules & Tools.');
