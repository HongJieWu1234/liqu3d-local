import './setup.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const [html, app, dashboard] = await Promise.all([
  fs.readFile(new URL('../public/index.html', import.meta.url), 'utf8'),
  fs.readFile(new URL('../public/app.js', import.meta.url), 'utf8'),
  fs.readFile(new URL('../public/production-dashboard.js', import.meta.url), 'utf8')
]);
assert.match(html, /id="parametricRulesPanel"/);
assert.match(html, /Deterministic if\/then constraints\. No AI\./);
assert.match(app, /productionRules: structuredClone\(parametricRules\)/);
assert.match(app, /parametricRuleFailures\(\)/);
assert.match(app, /setStatus\(`Rule: \$\{ruleFailures\[0\]\}`/);
assert.match(dashboard, /getProductionRules/);
assert.doesNotMatch(html, /Parameterized BOM|Quote rules|Advanced production rules/);
console.log('Workspace rule UX tests passed: minimalist rules live with the parametric workspace; BOM/quote UI retired.');
