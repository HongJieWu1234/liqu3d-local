import { initAccountSettings } from './account-settings.js?v=local1';
import { normalizeMaxObjectsPerPlate } from './packing-settings.js?v=1';
import { placePrimeTower } from './plate-packing.js?v=tower-free1';
import { normalizePrimeTowerSettings } from './prime-tower.js?v=tower-free1';
import { analyzeWorkspaceTowerMeshes } from './workspace-tower-analysis.js?v=tower-free1';
import { movePrimeTower } from './prime-tower-position.js?v=tower-free1';
import { snapQuarterTurn } from './quarter-turn.js';
import { createPrimeTowerPreview } from './prime-tower-preview.js?v=tower-free1';
import { PlateShortcutBuffer } from './plate-shortcut-buffer.js?v=1';
import { PreviewPrefetch } from './preview-prefetch.js?v=1';
import { effectiveObjectValues, objectRenderTargets, pendingObjectRenderTargets, objectRenderSnapshot } from './object-render-state.js?v=3';
import { initColorBudgetUi } from './color-budget-ui.js?v=4';
import { originLayout } from './origin-layout.js?v=tower-free1';
import { objectSettingsSection, settingsSectionSelection } from './object-settings.js?v=1';
import { HeldHistoryShortcut, editorShortcutAction, isMacPlatform } from './history-shortcuts.js?v=11';
import { recipeForExport } from './export-recipe.js?v=1';
import { downloadRecordedExport, grams, estimateSummary } from './export-history-ui.js?v=14';
import { syncObjectPlateLocation, moveObjectToPlate, currentObjectPlate } from './object-plate-location.js?v=1.0.0-moved-plate1';
import { optimizedEditorOffset } from './workspace-color-optimization.js?v=tower-free1';
import { colorOptimizationSettings } from './color-optimization.js?v=tower-free1';
import * as THREE from './vendor/three/three.module.js';
import { OrbitControls } from './vendor/three/addons/controls/OrbitControls.js';
import { ThreeMFLoader } from './vendor/three/addons/loaders/3MFLoader.js';
import { PRINTERS, PRINT_SETTINGS_GROUPS, SUPPORTED_NOZZLES, createDefaultProfile, migratePrintSettings } from './print-settings-schema.js?v=tower-free1';
import { geometryForPrint, placeObjectsOnBed } from './export-geometry.js?v=1.0.0';
import { readSolid3mf } from './solid-3mf.js?v=1.0.0-instant6';
import {
  PLATE_IDS, MAX_PLATES, createPersistentId, evaluatePresetStack,
  plateShortcutAction
} from './workflow-store.js?v=1.0.0-cleanup1';
import { initProductionDashboard } from './production-dashboard.js?v=1.0.0-variants-only1';

const root = document.querySelector('.app-shell');
const viewerPanel = document.querySelector('.viewer-panel');
const form = document.querySelector('#parameterForm');
const statusEl = document.querySelector('#status');
const viewer = document.querySelector('#viewer');
const viewerMessage = document.querySelector('#viewerMessage');
const selectionLabel = document.querySelector('#selectionLabel');
const selectionLabelName = document.querySelector('#selectionLabelName');
const selectionLabelDimensions = document.querySelector('#selectionLabelDimensions');
const sectionTabs = document.querySelector('#sectionTabs');
const parameterSearch = document.querySelector('#parameterSearch');
const workspaceStart = document.querySelector('#workspaceStart');
const workspaceSampleBtn = document.querySelector('#workspaceSampleBtn');
const parametricRulesPanel = document.querySelector('#parametricRulesPanel');
const parametricRulesEditor = document.querySelector('#parametricRulesEditor');
const parametricRulesSummary = document.querySelector('#parametricRulesSummary');
const parametricRulesMessage = document.querySelector('#parametricRulesMessage');
const applyParametricRulesBtn = document.querySelector('#applyParametricRulesBtn');
const generateBtn = document.querySelector('#generateBtn');
const preflightBtn = document.querySelector('#preflightBtn');
const mfBtn = document.querySelector('#mfBtn');
const exportMenuLayer = document.querySelector('#exportMenuLayer');
const exportPopover = document.querySelector('#exportPopover');
const exportChoiceView = document.querySelector('#exportChoiceView');
const exportPlateView = document.querySelector('#exportPlateView');
const exportAllBtn = document.querySelector('#exportAllBtn');
const exportChooseBtn = document.querySelector('#exportChooseBtn');
const exportBackBtn = document.querySelector('#exportBackBtn');
const exportSelectAllBtn = document.querySelector('#exportSelectAllBtn');
const exportClearBtn = document.querySelector('#exportClearBtn');
const exportPlateOptions = document.querySelector('#exportPlateOptions');
const exportSelectedBtn = document.querySelector('#exportSelectedBtn');
const filamentMenuLayer = document.querySelector('#filamentMenuLayer');
const filamentPopover = document.querySelector('#filamentPopover');
const closeFilamentMenuBtn = document.querySelector('#closeFilamentMenuBtn');
const filamentSettingsForm = document.querySelector('#filamentSettingsForm');
const controlsEdgeToggle = document.querySelector('#controlsEdgeToggle');
const plateBadge = document.querySelector('#plateBadge');
const plateZoneLegend = document.querySelector('#plateZoneLegend');
const scadFileInput = document.querySelector('#scadFileInput');
const addScadBtn = document.querySelector('#addScadBtn');
const removeActivePlateBtn = document.querySelector('#removeActivePlateBtn');
const accountEmail = document.querySelector('#accountEmail');
const accountAvatar = document.querySelector('.account-avatar');
const workspaceName = document.querySelector('#workspaceName');
const saveWorkspaceBtn = document.querySelector('#saveWorkspaceBtn');
const appMenuButton = document.querySelector('#appMenuButton');
const appMenu = document.querySelector('#appMenu');
const accountSettingsBtn = document.querySelector('#accountSettingsBtn');
const workspaceHistoryBtn = document.querySelector('#workspaceHistoryBtn');
const accountSettingsModal = document.querySelector('#accountSettingsModal');
const plateTray = document.querySelector('#plateTray');
const plateList = document.querySelector('#plateList');
const plateCount = document.querySelector('#plateCount');
const workflowModal = document.querySelector('#productionDashboardModal');
const presetTarget = document.querySelector('#presetTarget');
const presetName = document.querySelector('#presetName');
const presetCategory = document.querySelector('#presetCategory');
const presetParameterList = document.querySelector('#presetParameterList');
const selectChangedParamsBtn = document.querySelector('#selectChangedParamsBtn');
const selectAllParamsBtn = document.querySelector('#selectAllParamsBtn');
const clearParamsBtn = document.querySelector('#clearParamsBtn');
const savePresetBtn = document.querySelector('#savePresetBtn');
const presetStackList = document.querySelector('#presetStackList');
const variantEditorDetails = document.querySelector('#variantEditorDetails');
const variantSearch = document.querySelector('#variantSearch');
const variantParameterSearch = document.querySelector('#variantParameterSearch');
const variantParameterEmpty = document.querySelector('#variantParameterEmpty');
const workflowMessage = document.querySelector('#productionDashboardMessage');

const preflightModal = document.querySelector('#preflightModal');
const closePreflightBtn = document.querySelector('#closePreflightBtn');
const rerunPreflightBtn = document.querySelector('#rerunPreflightBtn');
const preflightScore = document.querySelector('#preflightScore');
const preflightSummary = document.querySelector('#preflightSummary');
const preflightResults = document.querySelector('#preflightResults');
const preflightTimestamp = document.querySelector('#preflightTimestamp');
const workspaceExitModal = document.querySelector('#workspaceExitModal');
const closeWorkspaceExitBtn = document.querySelector('#closeWorkspaceExitBtn');
const discardWorkspaceExitBtn = document.querySelector('#discardWorkspaceExitBtn');
const saveWorkspaceExitBtn = document.querySelector('#saveWorkspaceExitBtn');
const workspaceHistoryModal = document.querySelector('#workspaceHistoryModal');
const closeWorkspaceHistoryBtn = document.querySelector('#closeWorkspaceHistoryBtn');
const workspaceHistoryList = document.querySelector('#workspaceHistoryList');

const printDrawer = document.querySelector('#printDrawer');
const printSettingsEdgeToggle = document.querySelector('#printSettingsEdgeToggle');
const closePrintSettingsBtn = document.querySelector('#closePrintSettingsBtn');
const profileMenuButton = document.querySelector('#profileMenuButton');
const profileMenuLabel = document.querySelector('#profileMenuLabel');
const profileMenu = document.querySelector('#profileMenu');
const profileMenuOptions = document.querySelector('#profileMenuOptions');
const addProfileBtn = document.querySelector('#addProfileBtn');
const newProfileField = document.querySelector('#newProfileField');
const cancelNewProfileBtn = document.querySelector('#cancelNewProfileBtn');
const profileName = document.querySelector('#profileName');
const printerSelect = document.querySelector('#printerSelect');
const nozzleDiameterSelect = document.querySelector('#nozzleDiameterSelect');
const bedTypeSelect = document.querySelector('#bedTypeSelect');
const profileFileName = document.querySelector('#profileFileName');
const printTabs = document.querySelector('#printTabs');
const printSettingsForm = document.querySelector('#printSettingsForm');
const printSettingSearch = document.querySelector('#printSettingSearch');
const advancedSettings = document.querySelector('#advancedSettings');
const advancedJson = document.querySelector('#advancedJson');
const resetPrintBtn = document.querySelector('#resetPrintBtn');
const downloadProfileBtn = document.querySelector('#downloadProfileBtn');
const savePrintBtn = document.querySelector('#savePrintBtn');
const profileToast = document.querySelector('#profileToast');
const profileToastText = document.querySelector('#profileToastText');
const useBambuDefaultsBtn = document.querySelector('#useBambuDefaultsBtn');
const reduceColorChanges = document.querySelector('#reduceColorChanges');
let workspaceColorOptimization = { enabled:false, maxFilamentSlots:4 };
let workspaceMaxObjectsPerPlate = null;
let workspacePrimeTowers = [];
let workspacePrimeTowerErrors = {};
const bambuPresetSource = document.querySelector('#bambuPresetSource');
const processProfileControls = document.querySelector('#processProfileControls');
const bambuFilamentRow = document.querySelector('#bambuFilamentRow');
const bambuFilamentSummary = document.querySelector('#bambuFilamentSummary');
const bambuGlobalModeBtn = document.querySelector('#bambuGlobalModeBtn');
const bambuObjectsModeBtn = document.querySelector('#bambuObjectsModeBtn');
const objectPrintScopeNote = document.querySelector('#objectPrintScopeNote');
const objectPrintScopeName = document.querySelector('#objectPrintScopeName');

let parameters = [];
let objectDefs = [];
let plates = [];
let activePlateKey = null;
let previewController = null;
let currentMeshes = [];
let selectedObjectId = 'all';
const objectEditHistory = [];
const objectRedoHistory = [];
let objectHistoryBusy = false;
let selectionLabelWorld = null;
let lastGeneratedValues = null;
let activeSection = '';
let activePrintGroup = 'quality';
let printProfile = createDefaultProfile();
let printProfileBaseline = structuredClone(printProfile);
let printSettingsScope = 'global';
const PRINT_SETTING_ITEM_BY_KEY = new Map(PRINT_SETTINGS_GROUPS.flatMap((group) => group.settings.map((item) => [item.key, { ...item, scope: group.scope }])));
let firstPreview = true;
let bulkPreviewGenerationPromise = null;
let bulkPreviewRerunRequested = false;
let bulkPreviewNextOptions = null;
let bulkPreviewPendingKeys = new Set();
let bulkPreviewProgress = null;
let scadUploadInProgress = false;
let panelResizeFrame = null;
let panelResizeSuspended = false;
let renderWidth = 0;
let renderHeight = 0;
let selectionHelper = null;
let pointerDown = null;
let selectedPrimeTowerPlateId = null;
let lastViewerPointer = null;
let localFonts = [];
let fontLibraryReady = false;
let fontLibraryPromise = null;
let plateKeySequence = 0;
let pendingPlateRemovalKey = null;
let pendingPlateRemovalTimer = null;
let profileToastTimer = null;
let selectedPrintProfileId = null;
let parametricPresets = [];
let activePresetIds = [];
let objectIdentityStore = {};
let batchPlateMeta = {};
let batchSelectedObjectIds = new Set();
let activeViewPlateId = 'A';
let batchPlateLayouts = {};
let batchPlateReferences = {};
let loadedPlateIds = new Set();
let productionPlan = { quantity: 4, perPlate: 4 };
let parametricRules = [];
const appSearchParams = new URLSearchParams(window.location.search);
const workspaceId = appSearchParams.get('workspace') || '';
const settingsOnlyMode = !workspaceId && appSearchParams.get('settings') === '1';
document.body.classList.toggle('settings-only', settingsOnlyMode);
let workspaceHydrating = true;
let workspaceDirty = false;
let workspaceSaving = false;
let allowWorkspaceExit = false;
let workspaceRevision = 0;
let workspaceSaveFlashTimer = null;
let autoSaveTimer = null;
let autoRegenerateTimer = null;
const serverAppearancePreference = {
  theme: ['light', 'dark', 'system'].includes(document.documentElement.dataset.themePreference) ? document.documentElement.dataset.themePreference : 'system',
  accent: /^#[0-9a-f]{6}$/i.test(document.documentElement.style.getPropertyValue('--accent').trim()) ? document.documentElement.style.getPropertyValue('--accent').trim() : '#00ae42',
  reduceAnimations: document.documentElement.dataset.reduceMotion === 'true',
  density: ['compact', 'comfortable'].includes(document.documentElement.dataset.density) ? document.documentElement.dataset.density : 'comfortable'
};
let accountPreferences = {
  appearance: serverAppearancePreference,
  workspace: { autoSave: true, autoRegenerate: false, autoRegenerateDelaySeconds: 2, autoPosition: true, instantExport: false }
};
const initialResolvedTheme = document.documentElement.dataset.theme || (
  serverAppearancePreference.theme === 'system'
    ? (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : serverAppearancePreference.theme
);
let renderAppearance = {
  accent: serverAppearancePreference.accent,
  light: initialResolvedTheme === 'light'
};
let preflightRunning = false;
let previewScheduledForExit = false;
let runtimeRenderSlots = 2;

// Shared neutral filament swatches used by the SCAD customizer and 3MF export.
const FILAMENT_HEX = Object.freeze({
  'Black': '#000000',
  'White': '#FFFFFF',
  'Red': '#C12E1F',
  'Pastel Pink': '#F19CBB',
  'Lavender': '#B8ACD6',
  'Baby Blue': '#A8C6EE',
  'Mint Green': '#96DCB9',
  'Navy Blue': '#0C2340',
  'Sunshine Yellow': '#FEC600',
  'Ruby Red': '#C12E1F',
  'Royal Blue': '#2842AD',
  'Gray': '#8E9089',
  'Orange': '#F47926'
});


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 10000);
camera.position.set(220, 220, 180);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.domElement.tabIndex = 0;
renderer.domElement.setAttribute('aria-label', '3D build plates. Drag an object or prime tower to move it, or drag empty space to orbit. Press R to rotate the selected object in 90 degree steps, then click to apply.');
viewer.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.zoomSpeed = 2.4;
controls.minDistance = 3;
controls.maxDistance = 6000;
controls.target.set(0, 0, 0);
let renderFrame = null;
let renderingFrame = false;
controls.addEventListener('change', requestRender);
controls.addEventListener('end', markWorkspaceDirty);
document.addEventListener('visibilitychange', requestRender);
renderer.domElement.addEventListener('webglcontextrestored', requestRender);

scene.add(new THREE.HemisphereLight(0xffffff, 0x3f4653, 2.1));
const key = new THREE.DirectionalLight(0xffffff, 2.4);
key.position.set(3, 4, 6);
scene.add(key);
const fill = new THREE.DirectionalLight(0x9db9ff, 1.1);
fill.position.set(-4, -2, 3);
scene.add(fill);

const plateGroup = new THREE.Group();
scene.add(plateGroup);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const selectionLabelProjected = new THREE.Vector3();

function resize(force = false) {
  if (panelResizeSuspended && !force) return;
  const width = Math.max(1, Math.round(viewer.clientWidth));
  const height = Math.max(1, Math.round(viewer.clientHeight));
  if (width === renderWidth && height === renderHeight) return;
  renderWidth = width;
  renderHeight = height;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  requestRender();
}
new ResizeObserver(() => resize()).observe(viewer);
resize();

function updateSelectionLabelPosition() {
  if (!selectionLabelWorld) {
    selectionLabel.hidden = true;
    return;
  }
  const projected = selectionLabelProjected.copy(selectionLabelWorld).project(camera);
  const visible = projected.z >= -1 && projected.z <= 1
    && projected.x >= -1.1 && projected.x <= 1.1
    && projected.y >= -1.1 && projected.y <= 1.1;
  selectionLabel.hidden = !visible;
  if (!visible) return;
  selectionLabel.style.left = `${(projected.x * 0.5 + 0.5) * viewer.clientWidth}px`;
  selectionLabel.style.top = `${(-projected.y * 0.5 + 0.5) * viewer.clientHeight}px`;
}

function requestRender() {
  if (document.hidden || document.body.classList.contains('settings-open') || panelResizeSuspended) {
    if (renderFrame !== null) cancelAnimationFrame(renderFrame);
    renderFrame = null;
    return;
  }
  if (renderFrame === null && !renderingFrame) renderFrame = requestAnimationFrame(animate);
}

function animate() {
  renderFrame = null;
  if (!document.hidden && !document.body.classList.contains('settings-open') && !panelResizeSuspended) {
    // OrbitControls reports whether damping moved the camera. Keep drawing at
    // display refresh rate until it settles, then stop scheduling frames entirely.
    renderingFrame = true;
    let changed;
    try {
      changed = controls.update();
      renderer.render(scene, camera);
      updateSelectionLabelPosition();
    } finally { renderingFrame = false; }
    if (changed) requestRender();
  }
}
requestRender();

function setStatus(message, error = false) {
  const text = String(message ?? '');
  if (statusEl.textContent !== text) statusEl.textContent = text;
  statusEl.hidden = !text;
  statusEl.title = text;
  if (statusEl.classList.contains('error') !== Boolean(error)) statusEl.classList.toggle('error', Boolean(error));
}

function onNextAnimationFrame(callback) {
  let frame = null;
  return () => {
    if (frame !== null) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      callback();
    });
  };
}

function encodeValue(value) {
  if (typeof value === 'string') return value;
  return String(value);
}

function displayValue(value) {
  if (Array.isArray(value)) return JSON.stringify(value);
  return value ?? '';
}

function fontFamilyOf(spec) {
  return String(spec || '').trim().replace(/^Baloo_2_ExtraBold$/i,'Baloo 2:style=ExtraBold').split(':style=')[0].trim();
}

function localFontStatus(fontName) {
  const name = String(fontName || '').trim().replace(/^Baloo_2_ExtraBold$/i,'Baloo 2:style=ExtraBold');
  if (!name) return { text: 'Choose a font.', state: 'unknown' };
  if (!fontLibraryReady) return { text: 'Loading font library…', state: 'unknown' };
  const exact = localFonts.some((entry) => entry.toLowerCase() === name.toLowerCase());
  const family = fontFamilyOf(name).toLowerCase();
  const familyFound = localFonts.some((entry) => fontFamilyOf(entry).toLowerCase() === family);
  if (exact) return { text: 'Available to OpenSCAD.', state: 'good' };
  if (familyFound) return { text: 'Font family is available; this exact style may fall back.', state: 'unknown' };
  return { text: 'Not found. Add the font file to fonts/custom, then rescan.', state: 'unknown' };
}

function acceptFontLibrary(data) {
  localFonts = Array.isArray(data.localFonts) ? data.localFonts : [];
  fontLibraryReady = true;
  // Refresh labels only: do not rebuild controls or trigger model regeneration.
  for (const stack of form.querySelectorAll('.font-select-stack')) {
    const input = stack.querySelector('input, select');
    const meta = stack.querySelector('.font-compatibility');
    if (!input || !meta) continue;
    const status = localFontStatus(input.value);
    meta.textContent = status.text;
    meta.dataset.state = status.state;
  }
}

function loadFontLibrary() {
  fontLibraryPromise ||= fetchJson('/api/fonts').then(acceptFontLibrary).catch(() => {
    fontLibraryPromise = null;
  });
  return fontLibraryPromise;
}

async function appFetch(url, options = {}) {
  const response = await fetch(url, options);
  if (response.status === 401) {
    window.location.replace('/login');
    throw new Error('Your session has ended. Sign in again.');
  }
  return response;
}

async function fetchJson(url, options = {}) {
  const response = await appFetch(url, options);
  let payload = null;
  try { payload = await response.json(); } catch {}
  if (!response.ok) throw new Error(payload?.error || `Request failed (${response.status}).`);
  return payload;
}

function initializeWorkflowState() {
  parametricPresets = [];
  activePresetIds = [];
  objectIdentityStore = {};
  batchPlateMeta = { A: { name: 'Plate A', hidden: false } };
  productionPlan = { quantity: 4, perPlate: 4 };
}

function updateWorkspaceSaveUi() {
  saveWorkspaceBtn.classList.toggle('dirty', workspaceDirty);
  saveWorkspaceBtn.textContent = workspaceSaving ? 'Saving…' : 'Save';
  saveWorkspaceBtn.title = workspaceDirty
    ? 'Save workspace — unsaved changes (Ctrl/Command + S)'
    : 'Save workspace (Ctrl/Command + S)';
}

function applyAppearancePreferences(preferences = accountPreferences.appearance) {
  const appearance = preferences || accountPreferences.appearance;
  const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const resolvedTheme = appearance.theme === 'system' ? (systemDark ? 'dark' : 'light') : appearance.theme;
  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.dataset.themePreference = appearance.theme;
  document.documentElement.dataset.reduceMotion = String(Boolean(appearance.reduceAnimations));
  document.documentElement.dataset.density = appearance.density || 'comfortable';
  document.documentElement.style.setProperty('--accent', appearance.accent || '#00ae42');
  renderAppearance = { accent: appearance.accent || '#00ae42', light: resolvedTheme === 'light' };
  refreshRendererAppearance();
}

let preferenceSaveQueue = Promise.resolve();
function saveAccountPreferences(changes) {
  const pending = preferenceSaveQueue.catch(() => {}).then(async () => {
    const result = await fetchJson('/api/account/preferences', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...accountPreferences, ...changes })
    });
    accountPreferences = result.preferences;
    if (pending === preferenceSaveQueue) applyAppearancePreferences();
    return accountPreferences;
  });
  preferenceSaveQueue = pending;
  return pending;
}

function scheduleAutoSave() {
  clearTimeout(autoSaveTimer);
  if (!accountPreferences.workspace.autoSave || workspaceHydrating) return;
  autoSaveTimer = setTimeout(() => { if (workspaceDirty && !workspaceSaving) void saveCurrentWorkspace(); }, 1200);
}

function scheduleAutoRegenerate() {
  clearTimeout(autoRegenerateTimer);
  autoRegenerateTimer = null;
  if (!accountPreferences.workspace.autoRegenerate || workspaceHydrating) return;
  const selectedDelay = accountPreferences.workspace.autoRegenerateDelaySeconds;
  const delay = Number.isFinite(selectedDelay) && selectedDelay >= 0 ? selectedDelay : 2;
  const dueAt = performance.now() + delay * 1000;
  const generateAfterQuiet = () => {
    const remaining = dueAt - performance.now();
    if (remaining > 0) {
      autoRegenerateTimer = setTimeout(generateAfterQuiet, Math.min(remaining, 2147483647));
      return;
    }
    autoRegenerateTimer = null;
    void generatePendingPreviews({ reason: 'Updating preview' });
  };
  // Long custom delays must not overflow the browser's timer into an immediate render.
  autoRegenerateTimer = setTimeout(generateAfterQuiet, Math.min(delay * 1000, 2147483647));
}

function flashWorkspaceSaved() {
  clearTimeout(workspaceSaveFlashTimer);
  saveWorkspaceBtn.classList.remove('saved-flash');
  void saveWorkspaceBtn.offsetWidth;
  saveWorkspaceBtn.classList.add('saved-flash');
  workspaceSaveFlashTimer = setTimeout(() => saveWorkspaceBtn.classList.remove('saved-flash'), 1300);
}

function markWorkspaceDirty() {
  if (workspaceHydrating) return;
  workspaceRevision += 1;
  const wasDirty = workspaceDirty;
  workspaceDirty = true;
  if (!wasDirty) updateWorkspaceSaveUi();
  scheduleAutoSave();
}

function persistWorkflowState() {
  markWorkspaceDirty();
}

function activePlate() {
  return plates.find((plate) => plate.key === activePlateKey) || null;
}

function plateById(plateId) {
  return plates.find((plate) => plate.defaultPlateId === plateId) || null;
}

function visiblePlateIds() {
  if (!plates.length) return [];
  const ids = new Set([...loadedPlateIds].filter((id) => PLATE_IDS.includes(id)));
  for (const plate of plates) {
    ids.add(plate.defaultPlateId);
    for (const record of Object.values(plate.objectRecords || {})) if (!record.deleted) ids.add(currentObjectPlate(record, plate.defaultPlateId));
  }
  return [...ids].filter((id) => PLATE_IDS.includes(id)).sort((a, b) => PLATE_IDS.indexOf(a) - PLATE_IDS.indexOf(b));
}

function plateLayoutForId(plateId) {
  return batchPlateLayouts[plateId] || plateById(plateId)?.layoutOffset || { x: 0, z: 0 };
}

function reservedPlateIds(except = null) {
  const used = new Set();
  for (const plate of plates) {
    if (plate === except) continue;
    if (!plate.assignmentPlaceholder) used.add(plate.defaultPlateId);
    for (const record of Object.values(plate.objectRecords || {})) {
      if (!record.deleted) used.add(currentObjectPlate(record, plate.defaultPlateId));
    }
    for (const instance of plate.batchInstances || []) {
      if (!plate.objectRecords?.[`instance:${instance.id}`]?.deleted) used.add(instance.plateId || plate.defaultPlateId);
    }
  }
  return used;
}

function nextRealPlateId() {
  const used = reservedPlateIds();
  const id = PLATE_IDS.find(id => !used.has(id));
  if (!id) throw new Error(`All ${MAX_PLATES} plates are in use. Open another library to add more SCAD sources.`);
  return id;
}

function valuesFromParameters(list) {
  return Object.fromEntries(list.map((param) => [param.name, structuredClone(param.default)]));
}

function plateFromModel(data, { uploaded = false, state = {} } = {}) {
  const defaults = valuesFromParameters(Array.isArray(data.parameters) ? data.parameters : []);
  const stacked = evaluatePresetStack(data.parameters || [], parametricPresets, activePresetIds);
  const baseValues = { ...defaults, ...(state.baseValues || state.values || {}) };
  const defaultPlateId = state.defaultPlateId || nextRealPlateId();
  const objectRecords = state.objectRecords && typeof state.objectRecords === 'object' ? structuredClone(state.objectRecords) : {};
  if (!state.plateAssignmentVersion && defaultPlateId !== 'A') {
    for (const record of Object.values(objectRecords)) if (record?.plateId === 'A') record.plateId = defaultPlateId;
  }
  return {
    key: `plate-${++plateKeySequence}`,
    sourceInstanceId: state.sourceInstanceId || createPersistentId('source'),
    assignmentPlaceholder: Boolean(state.assignmentPlaceholder),
    defaultPlateId,
    modelId: String(data.id || 'default'),
    packageId: state.packageId || null,
    packageEntry: state.packageEntry || null,
    name: String(data.model || 'model.scad'),
    uploaded,
    parameters: Array.isArray(data.parameters) ? data.parameters : [],
    parserDiagnostics: Array.isArray(data.parserDiagnostics) ? data.parserDiagnostics : [],
    objectBinding: state.objectBinding ? structuredClone(state.objectBinding) : null,
    objectDefs: Array.isArray(data.objects) ? data.objects.filter(def => !state.objectBinding || state.objectBinding.memberIds.includes(Number(def.id))) : [],
    components: data.components || { modules: [], functions: [] },
    partSelectorParam: data.partSelectorParam || null,
    solidPartsExport: Boolean(data.solidPartsExport),
    baseValues,
    values: { ...baseValues, ...(state.objectBinding ? {} : stacked.values) },
    objectTransforms: state.objectTransforms && typeof state.objectTransforms === 'object' ? structuredClone(state.objectTransforms) : {},
    objectRecords,
    batchInstances: Array.isArray(state.batchInstances) ? structuredClone(state.batchInstances) : [],
    batchDirty: Boolean(state.batchInstances?.length),
    renderStates: {}, renderingObjectSnapshot: null,
    layoutOffset: { x: 0, z: 0 },
    referenceGroup: null,
    meshes: [],
    lastGeneratedValues: null,
    selectedObjectId: 'all',
    firstPreview: true,
    rendering: false,
    renderingValues: null,
    renderToken: 0,
    error: null,
    openscadReady: Boolean(data.openscadReady)
  };
}

function persistUploadedPlates() {
  persistWorkflowState();
}

function workspaceSnapshot() {
  syncActivePlateRuntime();
  return {
    version: 1,
    printProfile: printProfileSnapshotFromUi(),
    colorOptimization: structuredClone(workspaceColorOptimization),
    primeTowers: structuredClone(workspacePrimeTowers),
    maxObjectsPerPlate: workspaceMaxObjectsPerPlate,
    activeSourceInstanceId: activePlate()?.sourceInstanceId || null,
    activeViewPlateId,
    loadedPlateIds: [...loadedPlateIds],
    batchPlateMeta: structuredClone(batchPlateMeta),
    objectIdentityStore: structuredClone(objectIdentityStore),
    parametricPresets: structuredClone(parametricPresets),
    activePresetIds: [...activePresetIds],
    productionPlan: structuredClone(productionPlan),
    productionRules: structuredClone(parametricRules),
    camera: {
      position: camera.position.toArray(),
      target: controls.target.toArray()
    },
    plates: plates.filter((plate) => !plate.assignmentPlaceholder && typeof plate.source === 'string' && plate.source.trim()).map((plate) => ({
      sourceInstanceId: plate.sourceInstanceId,
      sourceName: plate.sourceName || plate.name,
      source: plate.source,
      packageId: plate.packageId, packageEntry: plate.packageEntry,
      defaultPlateId: plate.defaultPlateId,
      baseValues: structuredClone(plate.baseValues || {}),
      values: structuredClone(plate.values || {}),
      objectTransforms: structuredClone(plate.objectTransforms || {}),
      objectBinding: plate.objectBinding ? structuredClone(plate.objectBinding) : null,
      objectRecords: structuredClone(plate.objectRecords || {}),
      batchInstances: structuredClone(plate.batchInstances || []),
      selectedObjectId: plate.selectedObjectId || 'all'
    }))
  };
}

async function saveCurrentWorkspace() {
  if (workspaceSaving || !/^[0-9a-f-]{36}$/i.test(workspaceId)) return false;
  const savingRevision = workspaceRevision;
  let savedSuccessfully = false;
  workspaceSaving = true;
  saveWorkspaceBtn.disabled = true;
  updateWorkspaceSaveUi();
  try {
    const saved = await fetchJson(`/api/workspaces/${encodeURIComponent(workspaceId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: workspaceName.value, data: workspaceSnapshot() })
    });
    workspaceName.value = saved.name;
    workspaceDirty = workspaceRevision !== savingRevision;
    flashWorkspaceSaved();
    setStatus('Workspace saved.');
    savedSuccessfully = true;
  } catch (error) {
    setStatus(`Workspace save: ${error.message}`, true);
  } finally {
    workspaceSaving = false;
    saveWorkspaceBtn.disabled = false;
    updateWorkspaceSaveUi();
  }
  return savedSuccessfully;
}

function formatRevisionTime(value) {
  const date = new Date(Number(value));
  if (!Number.isFinite(date.getTime())) return 'Saved version';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
  }).format(date);
}

function renderWorkspaceHistory(revisions) {
  workspaceHistoryList.replaceChildren();
  if (!revisions.length) {
    const empty = document.createElement('div');
    empty.className = 'history-empty';
    empty.textContent = 'Save this workspace to create its first recoverable version.';
    workspaceHistoryList.append(empty);
    return;
  }
  revisions.forEach((revision, index) => {
    const row = document.createElement('article');
    row.className = 'history-item';
    const marker = document.createElement('span');
    marker.className = 'history-marker';
    marker.textContent = index === 0 ? '●' : '○';
    const copy = document.createElement('div');
    copy.className = 'history-copy';
    const title = document.createElement('strong');
    title.textContent = index === 0 ? `${revision.name} · current` : revision.name;
    const detail = document.createElement('span');
    detail.textContent = `${formatRevisionTime(revision.createdAt)} · ${revision.scadCount} SCAD file${revision.scadCount === 1 ? '' : 's'}`;
    copy.append(title, detail);
    const restore = document.createElement('button');
    restore.type = 'button';
    restore.className = 'mini-button history-restore';
    restore.textContent = index === 0 ? 'Current' : 'Restore';
    restore.disabled = index === 0;
    restore.addEventListener('click', async () => {
      if (restore.dataset.confirm !== 'true') {
        for (const button of workspaceHistoryList.querySelectorAll('.history-restore')) {
          if (!button.disabled) { button.dataset.confirm = 'false'; button.textContent = 'Restore'; }
        }
        restore.dataset.confirm = 'true';
        restore.textContent = 'Confirm restore';
        return;
      }
      for (const button of workspaceHistoryList.querySelectorAll('button')) button.disabled = true;
      restore.textContent = 'Restoring…';
      try {
        await fetchJson(`/api/workspaces/${encodeURIComponent(workspaceId)}/revisions/${encodeURIComponent(revision.id)}/restore`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}'
        });
        allowWorkspaceExit = true;
        window.location.reload();
      } catch (error) {
        restore.disabled = false;
        restore.dataset.confirm = 'false';
        restore.textContent = 'Restore';
        setStatus(`Version restore: ${error.message}`, true);
      }
    });
    row.append(marker, copy, restore);
    workspaceHistoryList.append(row);
  });
}

async function openWorkspaceHistory() {
  setAppMenuOpen(false);
  workspaceHistoryModal.hidden = false;
  workspaceHistoryModal.setAttribute('aria-hidden', 'false');
  workspaceHistoryList.innerHTML = '<div class="history-loading"><i></i><span>Loading private versions…</span></div>';
  if (workspaceDirty) {
    const saved = await saveCurrentWorkspace();
    if (!saved) {
      workspaceHistoryList.innerHTML = '<div class="history-empty error">The current workspace could not be saved, so history was not opened.</div>';
      return;
    }
  }
  try {
    const payload = await fetchJson(`/api/workspaces/${encodeURIComponent(workspaceId)}/revisions`);
    renderWorkspaceHistory(Array.isArray(payload.revisions) ? payload.revisions : []);
  } catch (error) {
    workspaceHistoryList.innerHTML = '';
    const message = document.createElement('div');
    message.className = 'history-empty error';
    message.textContent = error.message;
    workspaceHistoryList.append(message);
  }
}

function closeWorkspaceHistory() {
  workspaceHistoryModal.hidden = true;
  workspaceHistoryModal.setAttribute('aria-hidden', 'true');
}

function applySavedCamera(savedCamera) {
  const position = savedCamera?.position;
  const target = savedCamera?.target;
  if (!Array.isArray(position) || position.length !== 3 || !position.every(Number.isFinite)) return;
  if (!Array.isArray(target) || target.length !== 3 || !target.every(Number.isFinite)) return;
  camera.position.fromArray(position);
  controls.target.fromArray(target);
  controls.update();
}

async function restoreWorkspaceSession(savedData, openScadReady, preparedModels = null) {
  objectEditHistory.length = 0;
  objectRedoHistory.length = 0;
  historyShortcuts.stop();
  previewController?.abort();
  for (const plate of plates) disposePlateMeshes(plate);
  const data = savedData && typeof savedData === 'object' ? savedData : {};
  if (data.printProfile) applyPrintProfile(data.printProfile);
  workspaceColorOptimization=colorOptimizationSettings(data.colorOptimization || {enabled:false});
  reduceColorChanges.checked=workspaceColorOptimization.enabled;
  reduceColorChanges.title=`Arrange editor objects by color using up to ${workspaceColorOptimization.maxFilamentSlots} filament slots. Moving an object turns this off.`;
  parametricPresets = Array.isArray(data.parametricPresets) ? structuredClone(data.parametricPresets) : [];
  activePresetIds = Array.isArray(data.activePresetIds) ? data.activePresetIds.slice(-1) : [];
  productionPlan = data.productionPlan && typeof data.productionPlan === 'object'
    ? {
        quantity: Math.max(1, Math.min(100, Number(data.productionPlan.quantity) || 4)),
        perPlate: Math.max(1, Math.min(100, Number(data.productionPlan.perPlate) || 4))
      }
    : { quantity: 4, perPlate: 4 };
  parametricRules = Array.isArray(data.productionRules) ? structuredClone(data.productionRules).slice(0, 200) : [];
  if (parametricRulesEditor) parametricRulesEditor.value = JSON.stringify(parametricRules, null, 2);
  objectIdentityStore = data.objectIdentityStore && typeof data.objectIdentityStore === 'object'
    ? structuredClone(data.objectIdentityStore) : {};
  workspaceMaxObjectsPerPlate = normalizeMaxObjectsPerPlate(data.maxObjectsPerPlate);
  workspacePrimeTowers = Array.isArray(data.primeTowers) ? structuredClone(data.primeTowers) : [];
  workspacePrimeTowerErrors = {};
  batchPlateMeta = data.batchPlateMeta && typeof data.batchPlateMeta === 'object'
    ? structuredClone(data.batchPlateMeta) : { A: { name: 'Plate A', hidden: false } };
  if (!batchPlateMeta.A) batchPlateMeta.A = { name: 'Plate A', hidden: false };
  activeViewPlateId = PLATE_IDS.includes(data.activeViewPlateId) ? data.activeViewPlateId : 'A';
  loadedPlateIds = new Set((Array.isArray(data.loadedPlateIds) ? data.loadedPlateIds : []).filter((id) => PLATE_IDS.includes(id)));
  plates = [];

  const savedPlates = Array.isArray(data.plates) ? data.plates : [];
  if (savedPlates.length) {
    const parsed = preparedModels ? { models: preparedModels } : await fetchJson('/api/models/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: savedPlates.map((plate) => ({ name: plate.sourceName, source: plate.source })) })
    });
    const models = Array.isArray(parsed.models) ? parsed.models : [];
    for (const [index, model] of models.entries()) {
      const saved = savedPlates[index] || {};
      const plate = plateFromModel(model, {
        uploaded: true,
        state: {
          ...saved,
          plateAssignmentVersion: 1,
          sourceInstanceId: saved.sourceInstanceId,
          defaultPlateId: saved.defaultPlateId
        }
      });
      plate.source = saved.source;
      plate.sourceName = saved.sourceName || plate.name;
      plate.selectedObjectId = saved.selectedObjectId || 'all';
      plates.push(plate);
      loadedPlateIds.add(plate.defaultPlateId);
    }
    if (Array.isArray(models[0]?.localFonts)) acceptFontLibrary(models[0]);
  }

  activePlateKey = null;
  parameters = [];
  objectDefs = [];
  currentMeshes = [];
  lastGeneratedValues = null;
  form.innerHTML = '';
  sectionTabs.innerHTML = '';
  buildPlateReference();
  renderPlateList();

  if (!plates.length) {
    viewerMessage.hidden = false;
    viewerMessage.textContent = 'Add one or more .scad files to begin.';
    setStatus(openScadReady ? '' : 'Current OpenSCAD with Manifold is unavailable.', !openScadReady);
    applySavedCamera(data.camera);
    return;
  }

  const chosen = plates.find((plate) => plate.sourceInstanceId === data.activeSourceInstanceId) || plates[0];
  switchPlate(chosen.key, { generateIfEmpty: false });
  activeViewPlateId = PLATE_IDS.includes(data.activeViewPlateId) ? data.activeViewPlateId : chosen.defaultPlateId;
  buildPlateReference();
  renderPlateList();
  applySavedCamera(data.camera);
  renderParametricRulesState();
  if (!openScadReady) {
    viewerMessage.hidden = false;
    viewerMessage.textContent = 'OpenSCAD is required to generate the preview.';
  } else {
    viewerMessage.hidden = false;
    viewerMessage.textContent = accountPreferences.workspace.autoRegenerate
      ? 'Loading workspace preview…' : 'Click Generate all to preview this workspace.';
  }
}

function syncActivePlateRuntime({ captureValues = true } = {}) {
  const plate = activePlate();
  if (!plate) return;
  if (captureValues && parameters === plate.parameters && form.elements.length) plate.values = getValues();
  plate.meshes = currentMeshes;
  plate.lastGeneratedValues = lastGeneratedValues ? structuredClone(lastGeneratedValues) : null;
  plate.selectedObjectId = selectedObjectId;
  plate.firstPreview = firstPreview;
}

function setFormValues(values) {
  for (const param of parameters) {
    const input = form.elements.namedItem(param.name);
    if (!input || !Object.hasOwn(values, param.name)) continue;
    const value = values[param.name];
    if (param.type === 'boolean') {
      if (input.type === 'checkbox') input.checked = Boolean(value);
      else input.value = value ? 'true' : 'false';
    }
    else input.value = displayValue(value);
    const range = form.querySelector(`input[type="range"][data-mirror="${CSS.escape(input.id)}"]`);
    if (range) range.value = input.value;
    if (input.tagName === 'SELECT') input.dispatchEvent(new Event('change'));
  }
}

function plateStateLabel(plate) {
  if (plate.assignmentPlaceholder) return { text: 'Empty plate', className: '' };
  if (plate.rendering) return { text: 'Generating preview…', className: '' };
  if (plate.error) return { text: 'Needs attention', className: 'changed' };
  if (!plate.meshes.length) return { text: 'Not generated', className: '' };
  const changed = plate.batchDirty || JSON.stringify(plate.values) !== JSON.stringify(plate.lastGeneratedValues);
  if (changed) return { text: 'Changes not generated', className: 'changed' };
  const positioned = Object.values(plate.objectTransforms || {}).some((offset) => Math.abs(Number(offset?.x) || 0) > 0.0001 || Math.abs(Number(offset?.z) || 0) > 0.0001 || Math.abs(Number(offset?.rotation) || 0) > 0.0001);
  return positioned ? { text: 'Preview ready · positioned', className: 'ready' } : { text: 'Preview ready', className: 'ready' };
}

function clearPlateRemovalConfirmation() {
  pendingPlateRemovalKey = null;
  clearTimeout(pendingPlateRemovalTimer);
  pendingPlateRemovalTimer = null;
}

function markPlateCardDirty(plate) {
  if (!plate) return;
  const state = plateList.querySelector(`[data-plate-key="${CSS.escape(plate.key)}"] .plate-card-state`);
  if (!state) return;
  if (!state.classList.contains('changed')) state.className = 'plate-card-state changed';
  const text = plate.rendering ? 'Generating preview…' : 'Changes not generated';
  if (state.textContent !== text) state.textContent = text;
}

function renderPlateList() {
  root.dataset.hasModels = String(plates.some(plate => !plate.assignmentPlaceholder));
  workspaceStart.hidden = root.dataset.hasModels === 'true';
  const ids = visiblePlateIds();
  const objectCounts = new Map();
  for (const { record } of allObjectEntries()) {
    const id = record.plateId || 'A';
    objectCounts.set(id, (objectCounts.get(id) || 0) + 1);
  }
  plateTray.hidden = !ids.length;
  plateCount.textContent = `${ids.length} plate${ids.length === 1 ? '' : 's'}`;
  const active = activePlate();
  const pendingRemoval = activeViewPlateId === pendingPlateRemovalKey;
  removeActivePlateBtn.hidden = !active;
  removeActivePlateBtn.disabled = !active;
  removeActivePlateBtn.classList.toggle('confirm-removal', pendingRemoval);
  removeActivePlateBtn.textContent = pendingRemoval ? 'Click again to remove' : 'Remove plate';
  removeActivePlateBtn.title = pendingRemoval ? 'Click again to remove this plate' : 'Remove the selected build plate';

  const fragment = document.createDocumentFragment();
  ids.forEach((plateId) => {
    const plate = plateById(plateId);
    const objectCount = objectCounts.get(plateId) || 0;
    const card = document.createElement('div');
    card.className = 'plate-card';
    card.classList.toggle('active', plateId === activeViewPlateId);
    card.dataset.plateId = plateId;
    if (plate) card.dataset.plateKey = plate.key;
    card.role = 'button';
    card.tabIndex = 0;
    card.setAttribute('aria-label', `Open Plate ${plateId}`);

    const number = document.createElement('span');
    number.className = 'plate-number';
    number.textContent = plateId;
    const copy = document.createElement('span');
    copy.className = 'plate-card-copy';
    const name = document.createElement('span');
    name.className = 'plate-card-name';
    name.textContent = batchPlateMeta[plateId]?.name || `Plate ${plateId}`;
    name.title = name.textContent;
    const meta = document.createElement('span');
    meta.className = 'plate-card-meta';
    meta.textContent = `${objectCount} object${objectCount === 1 ? '' : 's'}${plate ? ` · ${plate.name}` : ''}`;
    const state = document.createElement('span');
    const stateInfo = plate ? plateStateLabel(plate) : { text: 'Build plate ready', className: 'ready' };
    state.className = `plate-card-state ${stateInfo.className}`.trim();
    state.textContent = stateInfo.text;
    copy.append(name, meta, state);
    const remove = document.createElement('span');
    remove.className = 'plate-remove';
    remove.role = 'button';
    remove.tabIndex = 0;
    remove.setAttribute('aria-label', `Remove Plate ${plateId}`);
    remove.title = 'Remove plate';
    remove.textContent = '×';
    remove.addEventListener('click', (event) => {
      event.stopPropagation();
      removeBuildPlate(plateId);
    });
    remove.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        removeBuildPlate(plateId);
      }
    });
    card.append(number, copy, remove);
    card.addEventListener('click', () => switchToPlateId(plateId));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        switchToPlateId(plateId);
      }
    });
    fragment.append(card);
  });
  plateList.replaceChildren(fragment);
}

function disposePlateMeshes(plate) {
  requestRender();
  if (plate === activePlate()) clearSelectionHelper();
  const meshes = new Set([
    ...plate.meshes,
    ...scene.children.filter((mesh) => mesh.isMesh && mesh.userData.plateKey === plate.key)
  ]);
  for (const mesh of meshes) {
    scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
  }
  plate.meshes = [];
}

function switchPlate(key, { generateIfEmpty = true, focus = true, preserveView = false } = {}) {
  if (key === activePlateKey) return;
  clearPlateRemovalConfirmation();
  const previousPlate = activePlate();
  if (previewController) {
    previewController.abort();
    previewController = null;
  }
  if (previousPlate) {
    previousPlate.renderToken += 1;
    previousPlate.rendering = false;
  }
  syncActivePlateRuntime();
  const plate = plates.find((candidate) => candidate.key === key);
  if (!plate) return;
  activePlateKey = key;
  if (!preserveView) activeViewPlateId = plate.defaultPlateId;
  parameters = plate.parameters;
  objectDefs = plate.objectDefs;
  currentMeshes = plate.meshes;
  lastGeneratedValues = plate.lastGeneratedValues ? structuredClone(plate.lastGeneratedValues) : null;
  selectedObjectId = plate.selectedObjectId || 'all';
  firstPreview = plate.firstPreview;
  buildForm();
  setFormValues(plate.values);
  updateObjectMenu();
  if (selectedObjectId !== 'all') setFormValues(effectiveObjectValues(plate, selectedObjectId));
  const sectionName = objectSettingsSection(plate, selectedObjectId, activeSection);
  if (sectionName) setActiveSection(sectionName);
  updateSelectionVisuals();
  updatePlatePosition();
  updatePlateFitStatus();
  if (focus) {
    if (previousPlate) centerPlateInView(plate);
    else fitPlate();
  }
  generateBtn.classList.toggle('dirty', plate.batchDirty || JSON.stringify(plate.values) !== JSON.stringify(plate.lastGeneratedValues));
  refreshViewerEmptyState();
  renderPlateList();
  plateList.querySelector(`[data-plate-id="${CSS.escape(activeViewPlateId)}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  if (generateIfEmpty && !currentMeshes.length && plate.openscadReady && accountPreferences.workspace.autoRegenerate && !workspaceHydrating) {
    void generatePendingPreviews({ reason: 'Generating preview' });
  }
  persistUploadedPlates();
}

function ensurePhysicalPlateId(plateId) {
  const id = String(plateId || '').toUpperCase();
  if (!PLATE_IDS.includes(id)) return null;
  if (!plates.length) {
    setStatus('Add a SCAD file before creating another plate.', true);
    return null;
  }
  ensureBatchPlate(id);
  loadedPlateIds.add(id);
  persistWorkflowState();
  return id;
}

function switchToPlateId(plateId) {
  const id = ensurePhysicalPlateId(plateId);
  if (!id) return;
  activeViewPlateId = id;
  buildPlateReference();
  if (bulkPreviewGenerationPromise) {
    centerPlateIdInView(id);
    renderPlateList();
    if (bulkPreviewProgress) {
      viewerMessage.hidden = false;
      viewerMessage.textContent = bulkPreviewProgress.text;
      setStatus(bulkPreviewProgress.text);
    }
    return;
  }
  const source = plateById(id);
  if (source) switchPlate(source.key, { generateIfEmpty: false });
  else {
    buildPlateReference();
    renderPlateList();
  }
  // Always move the camera target to the chosen physical plate, including
  // empty plates and plates backed by the currently active SCAD source.
  centerPlateIdInView(id);
  renderPlateList();
  setStatus(`Plate ${id} selected.`);
}

function clearActivePlateRuntime() {
  clearSelectionHelper();
  activePlateKey = null;
  parameters = [];
  objectDefs = [];
  currentMeshes = [];
  lastGeneratedValues = null;
  selectedObjectId = 'all';
  preparedExport = null;
  batchSelectedObjectIds.clear();
  form.innerHTML = '';
  sectionTabs.innerHTML = '';
  viewerMessage.hidden = false;
  viewerMessage.textContent = 'Add one or more .scad files to begin.';
}

function sourceRemovalSnapshot(sourceKeys = plates.map(plate => plate.key)) {
  syncActivePlateRuntime();
  return {
    type: 'sources', sourceKeys, activePlateKey, activeViewPlateId, primeTowers:structuredClone(workspacePrimeTowers),
    batchPlateMeta: structuredClone(batchPlateMeta), loadedPlateIds: [...loadedPlateIds],
    batchSelectedObjectIds: [...batchSelectedObjectIds],
    // History owns source data only; disposed GPU objects must never be restored.
    sources: plates.flatMap((plate, index) => {
      if (!sourceKeys.includes(plate.key)) return [];
      const { meshes, referenceGroup, ...data } = plate;
      return [{ index, data: structuredClone(data) }];
    })
  };
}

async function replaySourceRemoval(entry) {
  const inverse = sourceRemovalSnapshot(entry.sourceKeys);
  for (const plate of plates) if (entry.sourceKeys.includes(plate.key)) disposePlateMeshes(plate);
  plates = plates.filter(plate => !entry.sourceKeys.includes(plate.key));
  clearActivePlateRuntime();
  batchPlateMeta = structuredClone(entry.batchPlateMeta);
  loadedPlateIds = new Set(entry.loadedPlateIds);
  activeViewPlateId = entry.activeViewPlateId;
  batchSelectedObjectIds = new Set(entry.batchSelectedObjectIds);
  workspacePrimeTowers=structuredClone(entry.primeTowers || []); workspacePrimeTowerErrors={};
  for (const { index, data } of entry.sources) {
    plates.splice(index, 0, { ...structuredClone(data), meshes: [], referenceGroup: null,
      rendering: false, renderingValues: null, renderToken: 0, lastGeneratedValues: null, batchDirty: true });
  }
  const chosen = plates.find(plate => plate.key === entry.activePlateKey) || plates[0];
  if (chosen) switchPlate(chosen.key, { generateIfEmpty: false, focus: false, preserveView: true });
  applyBatchPlateVisibility();
  persistUploadedPlates();
  renderPlateList();
  updatePlateFitStatus();
  return inverse;
}

function removeBuildPlate(plateId) {
  if (exportInProgress || objectHistoryBusy || pointerDown) return false;
  syncActivePlateRuntime();
  for (const plate of plates) ensureObjectRecords(plate);
  const ids = visiblePlateIds();
  if (!ids.includes(plateId)) return false;
  rememberObjectEdit(sourceRemovalSnapshot());
  clearWorkspaceColorArrangement();
  clearPlateRemovalConfirmation();
  previewController?.abort();
  const fallbackId = ids.find(id => id !== plateId);
  for (const plate of plates) {
    plate.renderToken += 1;
    plate.rendering = false;
    for (const record of Object.values(plate.objectRecords || {})) {
      if (currentObjectPlate(record, plate.defaultPlateId) !== plateId) continue;
      record.deleted = true;
      batchSelectedObjectIds.delete(record.id);
    }
    plate.meshes = discardDeletedObjectMeshes(plate, plate.meshes);
    if (plate === activePlate()) { currentMeshes = plate.meshes; selectedObjectId = 'all'; }
    // A SCAD source can still own objects or copies on other physical plates.
    if (plate.defaultPlateId === plateId && fallbackId) plate.defaultPlateId = fallbackId;
  }
  const removedSources = plates.filter(plate => !Object.values(plate.objectRecords || {}).some(record => !record.deleted));
  for (const plate of removedSources) disposePlateMeshes(plate);
  plates = plates.filter(plate => !removedSources.includes(plate));
  loadedPlateIds.delete(plateId);
  delete batchPlateMeta[plateId];
  workspacePrimeTowers=workspacePrimeTowers.filter(tower=>tower.plateId!==plateId);
  delete workspacePrimeTowerErrors[plateId];
  if(selectedPrimeTowerPlateId===plateId)selectedPrimeTowerPlateId=null;
  activeViewPlateId = fallbackId || 'A';
  if (!activePlate()) {
    clearActivePlateRuntime();
    if (plates.length) switchPlate(plates[0].key, { generateIfEmpty: false, focus: false, preserveView: true });
  }
  preparedExport = null;
  applyBatchPlateVisibility();
  persistUploadedPlates();
  renderPlateList();
  updatePlateFitStatus();
  if (fallbackId) centerPlateIdInView(fallbackId);
  setStatus('');
  return true;
}

async function uploadScadFiles(fileList) {
  if (scadUploadInProgress) return;
  const files = [...fileList].filter((file) => /\.scad$/i.test(file.name));
  if (!files.length) {
    setStatus('Choose one or more .scad files.', true);
    return;
  }
  scadUploadInProgress = true;
  addScadBtn.disabled = true;
  addScadBtn.textContent = `Adding ${files.length} plate${files.length === 1 ? '' : 's'}…`;
  setStatus(`Reading ${files.length} SCAD file${files.length === 1 ? '' : 's'}…`);
  try {
    const payloadFiles = await Promise.all(files.map(async (file) => ({ name: file.name, source: await file.text() })));
    const data = await fetchJson('/api/models/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: payloadFiles })
    });
    const reserved = reservedPlateIds();
    if ((data.models || []).length > PLATE_IDS.filter(id => !reserved.has(id)).length) throw new Error('Not enough empty plates for these SCAD files. Open another workspace.');
    const added = [];
    for (const [index, model] of (data.models || []).entries()) {
      const plate = plateFromModel(model, { uploaded: true });
      plate.autoPositionPending = true;
      plate.source = payloadFiles[index]?.source || '';
      plate.sourceName = payloadFiles[index]?.name || plate.name;
      const placeholderIndex = plates.findIndex((candidate) => candidate.assignmentPlaceholder && candidate.defaultPlateId === plate.defaultPlateId);
      if (placeholderIndex >= 0) plates.splice(placeholderIndex, 1, plate);
      else plates.push(plate);
      loadedPlateIds.add(plate.defaultPlateId);
      added.push(plate);
    }
    buildPlateReference();
    if (data.models?.[0]) {
      localFonts = Array.isArray(data.models[0].localFonts) ? data.models[0].localFonts : localFonts;
    }
    persistUploadedPlates();
    renderPlateList();
    if (added.length) {
      switchPlate(added[0].key, { generateIfEmpty: false });
      const generated = await generatePendingPreviews({ reason: 'Generating new SCAD previews' });
      if (!generated.failures.length) {
        const warning=Object.values(workspacePrimeTowerErrors)[0] || '';
        setStatus(warning,Boolean(warning));
      }
    }
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    scadUploadInProgress = false;
    addScadBtn.disabled = false;
    addScadBtn.innerHTML = '<span aria-hidden="true">＋</span> Add SCAD files';
    scadFileInput.value = '';
  }
}

function controlFor(param) {
  const wrap = document.createElement('div');
  wrap.className = 'field';
  wrap.dataset.search = `${param.label} ${param.name} ${param.description || ''}`.toLowerCase();
  const id = `param-${param.name}`;

  if (param.control === 'boolean') {
    const row = document.createElement('div');
    row.className = 'toggle-row';
    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = param.label;
    const input = document.createElement('input');
    input.id = id;
    input.name = param.name;
    input.type = 'checkbox';
    input.checked = Boolean(param.default);
    input.className = 'toggle';
    input.dataset.kind = 'boolean';
    row.append(label, input);
    wrap.append(row);
  } else {
    const head = document.createElement('div');
    head.className = 'field-head';
    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = param.label;
    head.append(label);
    wrap.append(head);

    if (param.control === 'range') {
      const row = document.createElement('div');
      row.className = 'input-row';
      const range = document.createElement('input');
      range.type = 'range';
      range.min = param.min;
      range.max = param.max;
      range.step = param.step ?? 1;
      range.value = param.default;
      range.dataset.mirror = id;
      range.setAttribute('aria-label', `${param.label} slider`);
      const number = document.createElement('input');
      number.id = id;
      number.name = param.name;
      number.type = 'number';
      number.min = param.min;
      number.max = param.max;
      number.step = param.step ?? 'any';
      number.value = param.default;
      number.dataset.kind = 'number';
      range.addEventListener('input', () => {
        number.value = range.value;
        number.dispatchEvent(new Event('input', { bubbles: true }));
      });
      number.addEventListener('input', () => {
        if (number.value !== '') range.value = number.value;
      });
      row.append(range, number);
      wrap.append(row);
    } else if (param.control === 'select') {
      const select = document.createElement('select');
      select.id = id;
      select.name = param.name;
      select.dataset.kind = param.type;
      for (const option of param.options) {
        const el = document.createElement('option');
        el.value = encodeValue(option.value);
        el.textContent = option.label;
        if (String(option.value) === String(param.default)) el.selected = true;
        select.append(el);
      }
      if (/_color_preview$/.test(param.name)) {
        const row = document.createElement('div');
        row.className = 'color-select-row';
        const swatch = document.createElement('span');
        swatch.className = 'scad-color-swatch';
        const updateSwatch = () => {
          const name = String(select.value);
          const resolved = name === 'None' ? null : name === 'Default' ? null : colorHexForName(name);
          swatch.style.background = resolved || 'transparent';
          swatch.classList.toggle('empty', !resolved);
          swatch.textContent = name === 'None' ? 'None' : name === 'Default' ? 'Auto' : resolved;
          swatch.title = name === 'Default' ? 'Resolved automatically by the SCAD' : `${name}${resolved ? ` · ${resolved}` : ''}`;
        };
        select.addEventListener('change', updateSwatch);
        updateSwatch();
        row.append(select, swatch);
        wrap.append(row);
      } else if (/_font_preset$/.test(param.name)) {
        const stack = document.createElement('div');
        stack.className = 'font-select-stack';
        const meta = document.createElement('p');
        meta.className = 'font-compatibility';
        const updateFontMeta = () => {
          const status = localFontStatus(String(select.value));
          meta.textContent = status.text;
          meta.dataset.state = status.state;
        };
        select.addEventListener('change', updateFontMeta);
        updateFontMeta();
        stack.append(select, meta);
        wrap.append(stack);
      } else {
        wrap.append(select);
      }
    } else {
      const input = document.createElement('input');
      input.id = id;
      input.name = param.name;
      input.type = param.type === 'number' ? 'number' : 'text';
      input.value = displayValue(param.default);
      input.dataset.kind = param.type;
      if (param.type === 'number') input.step = param.step ?? 'any';
      if (param.control === 'font') {
        input.autocomplete = 'off';
        input.placeholder = 'Font family:style=Style';
        const stack = document.createElement('div');
        stack.className = 'font-select-stack';
        const meta = document.createElement('p');
        meta.className = 'font-compatibility';
        const updateFontMeta = () => {
          const status = localFontStatus(String(input.value));
          meta.textContent = status.text;
          meta.dataset.state = status.state;
        };
        input.addEventListener('input', updateFontMeta);
        updateFontMeta();
        stack.append(input, meta);
        wrap.append(stack);
      } else {
        wrap.append(input);
      }
    }
  }

  if (param.description) {
    const help = document.createElement('p');
    help.className = 'field-help';
    help.textContent = param.description;
    wrap.append(help);
  }
  return wrap;
}

function setActiveSection(name) {
  activeSection = name;
  for (const section of form.querySelectorAll('.section')) {
    section.classList.toggle('active', section.dataset.section === name);
  }
  for (const tab of sectionTabs.querySelectorAll('.section-tab')) {
    tab.classList.toggle('active', tab.dataset.section === name);
  }
  applySearch();
}

function selectSettingsSection(name) {
  const selection = settingsSectionSelection(activePlate(), name, selectedObjectId);
  if (selection && selection !== selectedObjectId) selectObject(selection);
  setActiveSection(name);
}

function updateSectionTabAssignmentState() {
  const plate = activePlate();
  if (!plate) return;
  const records = ensureObjectRecords(plate);
  for (const tab of sectionTabs.querySelectorAll('.section-tab')) {
    const sectionName = tab.dataset.section || '';
    const match = sectionName.match(/^DESIGN\s+(\d+)$/i);
    const def = match ? plate.objectDefs.find((item) => Number(item.id) === Number(match[1])) : null;
    const sourceKey = def ? `group:${def.mergeKey || `object_${def.id}`}` : null;
    const moved = sourceKey
      ? records.filter((record) => record.selectionKey === sourceKey || record.sourceKey === sourceKey)
        .filter((record) => Boolean(record.moved_plate))
      : [];
    tab.classList.toggle('moved-plate', moved.length > 0);
    const destinations = [...new Set(moved.map((record) => record.moved_plate))].sort();
    const origins=[...new Set(records.filter(record=>record.selectionKey===sourceKey || record.sourceKey===sourceKey).map(record=>record.originalPlateId))].sort();
    tab.title = `${sectionName}${origins.length?` · original Plate ${origins.join(', ')}`:''}${destinations.length?` · moved_plate: ${destinations.join(', ')}`:''}`;
    tab.dataset.originalPlate=origins.join(',');
    tab.dataset.movedPlate=destinations.join(',');
  }
}

function parametricConditionMatches(condition, values) {
  if (!condition || typeof condition !== 'object') return true;
  if (Array.isArray(condition.all)) return condition.all.slice(0, 50).every((entry) => parametricConditionMatches(entry, values));
  if (Array.isArray(condition.any)) return condition.any.slice(0, 50).some((entry) => parametricConditionMatches(entry, values));
  if (condition.not && typeof condition.not === 'object') return !parametricConditionMatches(condition.not, values);
  const actual = values?.[condition.param];
  let op = condition.op;
  let expected = condition.value;
  if (!op) {
    for (const [shortcut, operator] of [['eq','=='],['ne','!='],['gt','>'],['gte','>='],['lt','<'],['lte','<='],['in','in'],['notIn','notIn']]) {
      if (Object.hasOwn(condition, shortcut)) { op = operator; expected = condition[shortcut]; break; }
    }
  }
  switch (op || '==') {
    case '==': return actual === expected || String(actual) === String(expected);
    case '!=': return !(actual === expected || String(actual) === String(expected));
    case '>': return Number(actual) > Number(expected);
    case '>=': return Number(actual) >= Number(expected);
    case '<': return Number(actual) < Number(expected);
    case '<=': return Number(actual) <= Number(expected);
    case 'in': return Array.isArray(expected) && expected.map(String).includes(String(actual));
    case 'notIn': return Array.isArray(expected) && !expected.map(String).includes(String(actual));
    default: return false;
  }
}

function mergedParametricRuleValues() {
  syncActivePlateRuntime();
  return Object.assign({}, ...plates.filter((plate) => !plate.assignmentPlaceholder).map((plate) => plate.values || {}));
}

function parametricRuleFailures(values = mergedParametricRuleValues()) {
  const failures = [];
  for (const rule of parametricRules.slice(0, 200)) {
    if (!rule || typeof rule !== 'object') continue;
    if (rule.when && !parametricConditionMatches(rule.when, values)) continue;
    const requirement = rule.require || (rule.param ? rule : null);
    if (requirement && !parametricConditionMatches(requirement, values)) {
      failures.push(String(rule.message || `${requirement.param || 'Parameter'} violates a rule.`).slice(0, 240));
    }
  }
  return failures;
}

function renderParametricRulesState({ message = '' } = {}) {
  if (!parametricRulesSummary || !parametricRulesMessage) return;
  const count = parametricRules.length;
  const failures = count ? parametricRuleFailures() : [];
  parametricRulesSummary.textContent = count ? `${count} rule${count === 1 ? '' : 's'}` : 'None';
  parametricRulesPanel?.classList.toggle('has-rules', count > 0);
  parametricRulesPanel?.classList.toggle('has-rule-error', failures.length > 0);
  parametricRulesMessage.textContent = message || (failures[0] || (count ? 'Rules active · deterministic, no AI.' : 'Deterministic if/then constraints. No AI.'));
  parametricRulesMessage.classList.toggle('error', failures.length > 0 && !message);
}

function applyParametricRulesFromEditor() {
  try {
    const parsed = JSON.parse(parametricRulesEditor?.value?.trim() || '[]');
    if (!Array.isArray(parsed)) throw new Error('Rules must be a JSON array.');
    if (parsed.length > 200) throw new Error('Up to 200 rules are supported.');
    parametricRules = structuredClone(parsed);
    if (parametricRulesEditor) parametricRulesEditor.value = JSON.stringify(parametricRules, null, 2);
    markWorkspaceDirty();
    const failures = parametricRuleFailures();
    renderParametricRulesState({ message: failures[0] || `${parametricRules.length} rule${parametricRules.length === 1 ? '' : 's'} applied.` });
    parametricRulesMessage?.classList.toggle('error', failures.length > 0);
  } catch (error) {
    if (parametricRulesMessage) {
      parametricRulesMessage.textContent = error.message || 'Rules could not be parsed.';
      parametricRulesMessage.classList.add('error');
    }
  }
}

function buildForm() {
  form.innerHTML = '';
  sectionTabs.innerHTML = '';
  const diagnostic = activePlate()?.parserDiagnostics?.[0];
  if (diagnostic) {
    const note = document.createElement('p');
    note.className = 'field-help';
    note.setAttribute('role', 'status');
    note.textContent = `Settings remain in the SCAD source. Line ${diagnostic.line}: ${diagnostic.message}`;
    form.append(note);
  }
  const groups = new Map();
  for (const param of parameters) {
    if (!groups.has(param.section)) groups.set(param.section, []);
    groups.get(param.section).push(param);
  }

  for (const [sectionName, params] of groups) {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'section-tab';
    tab.dataset.section = sectionName;
    tab.textContent = sectionName.replace(/^DESIGN\s+/i, 'D');
    tab.title = sectionName;
    tab.addEventListener('click', () => selectSettingsSection(sectionName));
    sectionTabs.append(tab);

    const section = document.createElement('section');
    section.className = 'section';
    section.dataset.section = sectionName;
    const title = document.createElement('h2');
    title.textContent = sectionName;
    section.append(title);
    for (const param of params) section.append(controlFor(param));
    form.append(section);
  }

  const names = [...groups.keys()];
  setActiveSection(names.includes('DESIGN 1') ? 'DESIGN 1' : (names[0] || ''));
  updateSectionTabAssignmentState();
}

function applySearch() {
  const query = parameterSearch.value.trim().toLowerCase();
  if (!query) {
    for (const section of form.querySelectorAll('.section')) {
      section.style.display = section.dataset.section === activeSection ? 'block' : 'none';
      for (const field of section.querySelectorAll('.field')) field.classList.remove('hidden-by-search');
    }
    return;
  }

  for (const section of form.querySelectorAll('.section')) {
    let matches = 0;
    for (const field of section.querySelectorAll('.field')) {
      const hit = field.dataset.search.includes(query);
      field.classList.toggle('hidden-by-search', !hit);
      if (hit) matches += 1;
    }
    section.style.display = matches ? 'block' : 'none';
  }
}

function valueFromParameterInput(param, input) {
  if (param.type === 'boolean') return input.type === 'checkbox' ? input.checked : input.value === 'true';
  if (param.type === 'number') return Number(input.value);
  return input.value;
}

function getValues() {
  // The form can belong to one object's overrides; it must never replace source defaults.
  if (selectedObjectId !== 'all' && activePlate()?.values) return structuredClone(activePlate().values);
  const values = {};
  for (const param of parameters) {
    const input = form.elements.namedItem(param.name);
    if (!input) continue;
    values[param.name] = valueFromParameterInput(param, input);
  }
  return values;
}

function objectLabel(def, values = getValues()) {
  const fallback = String(def.label || `Object ${def.id}`);
  const value = def.labelParam ? String(values[def.labelParam] ?? '').trim() : '';
  return value ? `${fallback} — ${value}` : fallback;
}

function logicalObjectGroups(values = getValues()) {
  return logicalObjectGroupsFor(objectDefs, values);
}

function logicalObjectGroupsFor(definitions, values = {}) {
  const groups = new Map();
  for (const def of definitions || []) {
    const key = String(def.mergeKey || `object_${def.id}`);
    if (!groups.has(key)) groups.set(key, { key, defs: [], memberIds: [] });
    const group = groups.get(key);
    group.defs.push(def);
    group.memberIds.push(Number(def.id));
  }
  return [...groups.values()].map((group) => {
    const dynamicNames = group.defs
      .map((def) => def.labelParam ? String(values[def.labelParam] ?? '').trim() : '')
      .filter(Boolean);
    const label = group.defs.length === 1
      ? objectLabel(group.defs[0], values)
      : dynamicNames.length
        ? dynamicNames.join(' + ')
        : group.defs.map((def) => String(def.label || `Object ${def.id}`)).join(' + ');
    return { ...group, label };
  });
}

function ensureBatchPlate(plateId) {
  const id = PLATE_IDS.includes(plateId) ? plateId : 'A';
  if (!batchPlateMeta[id]) batchPlateMeta[id] = { name: `Plate ${id}`, hidden: false };
  return id;
}

function ensureObjectRecords(plate, { captureConfiguration = false, generatedKeys = null } = {}) {
  if (!plate) return [];
  if (plate.assignmentPlaceholder) return [];
  plate.objectRecords ||= {};
  const values = plate.lastGeneratedValues || plate.values || {};
  const groups = plate.objectDefs.length
    ? logicalObjectGroupsFor(plate.objectDefs, values)
    : [{ key: 'model', defs: [], memberIds: ['model'], label: plate.name.replace(/\.scad$/i, '') || 'Model' }];
  for (const group of groups) {
    const selectionKey = plate.objectDefs.length ? `group:${group.key}` : 'model';
    const identityKey = `${plate.sourceInstanceId}:${selectionKey}`;
    const existing = plate.objectRecords[selectionKey];
    const id = existing?.id || objectIdentityStore[identityKey] || createPersistentId('obj');
    objectIdentityStore[identityKey] = id;
    const record = plate.objectRecords[selectionKey] = Object.assign(existing || {}, {
      id,
      selectionKey,
      sourceKey: selectionKey,
      deleted: Boolean(existing?.deleted),
      skuLink: existing?.skuLink || null,
      label: group.label,
      plateId: existing?.deleted ? existing.plateId : ensureBatchPlate(existing?.plateId || existing?.moved_plate || plate.defaultPlateId || 'A'),
      originalPlateId: existing?.originalPlateId || plate.defaultPlateId,
      configuration: existing?.configuration || {
        presets: [...activePresetIds],
        presetNames: activePresetIds.map((id) => parametricPresets.find((preset) => preset.id === id)?.name).filter(Boolean),
        parameters: structuredClone(values)
      },
      printOverrides: existing?.printOverrides || {}
    });
    if (captureConfiguration && (!generatedKeys || generatedKeys.has(selectionKey))) record.configuration = {
      presets: [...activePresetIds],
      presetNames: activePresetIds.map((id) => parametricPresets.find((preset) => preset.id === id)?.name).filter(Boolean),
      parameters: structuredClone(plate.renderStates?.[selectionKey]?.values || { ...values, ...(record.parameterOverrides || {}) })
    };
    if (record.parameterOverrides && Object.keys(record.parameterOverrides).length) {
      const ownValues = plate.renderStates?.[selectionKey]?.values || { ...values, ...record.parameterOverrides };
      const ownGroup = logicalObjectGroupsFor(group.defs, ownValues)[0];
      if (ownGroup) record.label = ownGroup.label;
    }
  }
  for (const instance of plate.batchInstances || []) {
    const selectionKey = `instance:${instance.id}`;
    const existing = plate.objectRecords[selectionKey];
    plate.objectRecords[selectionKey] = Object.assign(existing || {}, {
      id: instance.id,
      selectionKey,
      sourceKey: instance.sourceKey || 'model',
      deleted: Boolean(plate.objectRecords[selectionKey]?.deleted),
      skuLink: existing?.skuLink || null,
      label: instance.label,
      plateId: existing?.deleted ? existing.plateId : ensureBatchPlate(existing?.plateId || instance.plateId || 'A'),
      originalPlateId: plate.objectRecords[selectionKey]?.originalPlateId || instance.originalPlateId || plate.defaultPlateId,
      // Each instance already owns a separate configuration. Its record describes that same copy.
      configuration: instance.configuration,
      printOverrides: existing?.printOverrides || structuredClone(plate.objectRecords[String(instance.sourceKey || 'model')]?.printOverrides || {})
    });
  }
  const records = Object.values(plate.objectRecords);
  for(const record of records)syncObjectPlateLocation(record,plate.defaultPlateId);
  return records.filter((record) => !record.deleted && !plate.emptySelectionKeys?.has(record.selectionKey));
}

function objectRecordForSelection(plate, selectionKey) {
  ensureObjectRecords(plate);
  const record = plate?.objectRecords?.[String(selectionKey)];
  return record && !record.deleted && !plate.emptySelectionKeys?.has(record.selectionKey) ? record : null;
}

function discardDeletedObjectMeshes(plate, meshes) {
  requestRender();
  return meshes.filter((mesh) => {
    if (!plate.objectRecords?.[String(mesh.userData.selectionKey)]?.deleted) return true;
    if (plate === activePlate() && String(mesh.userData.selectionKey) === String(selectedObjectId)) clearSelectionHelper();
    scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
    return false;
  });
}

function removeSelectedObject() {
  if (exportInProgress || objectHistoryBusy || pointerDown) return false;
  const entries = allObjectEntries().filter(({ plate, record }) => batchSelectedObjectIds.size
    ? batchSelectedObjectIds.has(record.id) : plate === activePlate() && record.selectionKey === selectedObjectId);
  if (!entries.length) {
    setStatus('Click an object in the preview first. Shift-click to select more.');
    return false;
  }
  // The highlighted selection is authoritative, including objects from other sources.
  if (entries.length > 1) rememberObjectEdit(sourceRemovalSnapshot([...new Set(entries.map(({ plate }) => plate.key))]));
  else rememberObjectEdit({ type: 'remove', plateKey: entries[0].plate.key, selectionKey: entries[0].record.selectionKey });
  for (const { record } of entries) {
    // Keep source records so surviving copies can still regenerate independently.
    record.deleted = true;
    batchSelectedObjectIds.delete(record.id);
  }
  for (const plate of new Set(entries.map(entry => entry.plate))) plate.meshes = discardDeletedObjectMeshes(plate, plate.meshes);
  currentMeshes = activePlate()?.meshes || [];
  preparedExport = null;
  selectObject('all');
  syncActivePlateRuntime();
  refreshWorkspacePrimeTowers();
  persistUploadedPlates();
  applyBatchPlateVisibility();
  renderPlateList();
  updatePlateFitStatus();
  setStatus(`${entries.length === 1 ? entries[0].record.label : `${entries.length} objects`} removed. Cmd/Ctrl + Z to restore; Cmd/Ctrl + Shift + Z redoes the removal after undo.`);
  return true;
}

function rememberObjectEdit(entry) {
  objectRedoHistory.length = 0;
  objectEditHistory.push(structuredClone(entry));
  if (objectEditHistory.length > 100) objectEditHistory.shift();
}

async function replayObjectEdit(from, to, action, { disableColorOptimization = false } = {}) {
  if (objectHistoryBusy || exportInProgress || pointerDown) return false;
  objectHistoryBusy = true;
  try {
    if (bulkPreviewGenerationPromise) await bulkPreviewGenerationPromise.catch(() => {});
    while (from.length) {
      const entry = from.pop();
      if (entry.type === 'prime-tower') {
        to.push({type:'prime-tower',primeTowers:structuredClone(workspacePrimeTowers)});
        workspacePrimeTowers=structuredClone(entry.primeTowers);
        refreshWorkspacePrimeTowers(); preparedExport=null;
        buildPlateReference(); persistUploadedPlates();
        setStatus(`Prime tower movement ${action}.`);
        return true;
      }
      if (entry.type === 'sources') {
        // Let an aborted pre-deletion render finish before reusing source keys.
        if (bulkPreviewGenerationPromise) await bulkPreviewGenerationPromise.catch(() => {});
        to.push(await replaySourceRemoval(entry));
        if (entry.sources.length) {
          try { await generatePendingPreviews({ plateKeys: entry.sourceKeys, throwOnFailure: true }); }
          catch (error) { setStatus(`Plate restored. Preview update failed: ${error.message}`, true); return true; }
        }
        setStatus(`Workspace edit ${action}.`);
        return true;
      }
      if (entry.type === 'move') {
        const inverse = { type: 'move', changes: [],
          ...(entry.plateRemovalId ? { plateRemovalId: entry.plateRemovalId } : {}),
          ...(entry.colorOptimization ? { colorOptimization:structuredClone(workspaceColorOptimization) } : {}),
          ...(entry.primeTowers ? { primeTowers:structuredClone(workspacePrimeTowers) } : {}),
          ...(entry.activeViewPlateId ? { activeViewPlateId } : {}),
          ...(entry.batchPlateMeta ? { batchPlateMeta: structuredClone(batchPlateMeta) } : {}),
          ...(entry.loadedPlateIds ? { loadedPlateIds: [...loadedPlateIds] } : {}),
          ...(entry.sourcePlateIds ? { sourcePlateIds: plates.map(({ key, defaultPlateId }) => ({ key, defaultPlateId })) } : {}) };
        const refreshed = new Set();
        for (const change of entry.changes) {
          const plate = plates.find(candidate => candidate.key === change.plateKey);
          if (!plate) continue;
          if (!refreshed.has(plate)) { ensureObjectRecords(plate); refreshed.add(plate); }
          const record = plate.objectRecords[change.selectionKey];
          if (!record || (record.deleted && !entry.plateRemovalId)) continue;
          inverse.changes.push({ plateKey: plate.key, selectionKey: change.selectionKey,
            ...(change.offset ? { offset: storedObjectOffset(change.selectionKey, plate) } : {}),
            ...(change.plateId ? { plateId: record.plateId } : {}) });
          if (change.offset) plate.objectTransforms[change.selectionKey] = { ...change.offset };
          if (change.plateId) {
            moveObjectToPlate(record, change.plateId, plate.defaultPlateId);
            const instance = plate.batchInstances?.find(item => item.id === record.id);
            if (instance) instance.plateId = change.plateId;
          }
        }
        if (!inverse.changes.length && !entry.plateRemovalId) continue;
        clearWorkspaceColorArrangement();
        if (entry.colorOptimization) { workspaceColorOptimization={...structuredClone(entry.colorOptimization),...(disableColorOptimization ? {enabled:false} : {})}; reduceColorChanges.checked=workspaceColorOptimization.enabled; }
        if (entry.primeTowers) workspacePrimeTowers = structuredClone(entry.primeTowers);
        if (entry.activeViewPlateId) activeViewPlateId = entry.activeViewPlateId;
        if (entry.batchPlateMeta) batchPlateMeta = structuredClone(entry.batchPlateMeta);
        if (entry.loadedPlateIds) loadedPlateIds = new Set(entry.loadedPlateIds);
        for (const saved of entry.sourcePlateIds || []) {
          const plate = plates.find(candidate => candidate.key === saved.key);
          if (plate) plate.defaultPlateId = saved.defaultPlateId;
        }
        to.push(inverse);
        preparedExport = null;
        applyBatchPlateVisibility();
        persistUploadedPlates();
        renderWorkflowUi(); renderPlateList(); updateSelectionVisuals(); updatePlateFitStatus();
        setStatus(entry.plateRemovalId ? `Plate ${entry.plateRemovalId} removal ${action}.` : entry.colorOptimization ? `Color arrangement ${action}.${disableColorOptimization ? ' Reduce color changes is off.' : ''}` : `Object movement ${action}.`);
        return true;
      }
      const plate = plates.find(candidate => candidate.key === entry.plateKey);
      const record = plate?.objectRecords?.[entry.selectionKey];
      const deleted = Boolean(entry.deleted);
      if (!record || Boolean(record.deleted) === deleted) continue;
      to.push({ ...entry, deleted: Boolean(record.deleted) });
      record.deleted = deleted;
      preparedExport = null;
      if (deleted) {
        batchSelectedObjectIds.delete(record.id);
        plate.meshes = discardDeletedObjectMeshes(plate, plate.meshes);
        if (plate === activePlate()) { currentMeshes = plate.meshes; selectObject('all'); }
      } else {
        plate.batchDirty = true;
        if (plate === activePlate()) selectObject(entry.selectionKey);
      }
      refreshWorkspacePrimeTowers();
      persistUploadedPlates();
      applyBatchPlateVisibility(); renderPlateList(); updatePlateFitStatus();
      if (!deleted) {
        try { await generatePendingPreviews({ plateKeys: [plate.key], throwOnFailure: true }); }
        catch (error) { setStatus(`Object restored. Preview update failed: ${error.message}`, true); return true; }
      }
      setStatus(`${record.label} ${deleted ? 'removed' : 'restored'}.`);
      return true;
    }
    return false;
  } finally { objectHistoryBusy = false; }
}

async function undoObjectEdit() {
  if (!objectEditHistory.length) { setStatus('Nothing to undo. History starts with edits made since this page was opened.'); return false; }
  return replayObjectEdit(objectEditHistory, objectRedoHistory, 'undone');
}

async function undoWorkspaceColorArrangement() {
  if (!objectEditHistory.at(-1)?.colorOptimization) {
    setStatus(objectEditHistory.some(entry => entry.colorOptimization) ? 'Undo newer object edits with Cmd/Ctrl + Z first.' : 'No color arrangement to undo.');
    return false;
  }
  return replayObjectEdit(objectEditHistory, objectRedoHistory, 'undone', {disableColorOptimization:true});
}

async function redoObjectEdit() {
  if (!objectRedoHistory.length) { setStatus('Nothing to redo. Undo an edit with Cmd/Ctrl + Z first.'); return false; }
  return replayObjectEdit(objectRedoHistory, objectEditHistory, 'redone');
}

function objectShortcutAllowed(target, allowButtons = false) {
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(target?.tagName) || (!allowButtons && target?.tagName === 'BUTTON') || target?.isContentEditable) return false;
  return ![...document.querySelectorAll('[role="dialog"]')].some(dialog => dialog.getClientRects().length);
}

let objectClipboard = [];
let objectClipboardPastes = 0;

function copySelectedObjects() {
  if (exportInProgress || objectHistoryBusy || pointerDown) return false;
  syncActivePlateRuntime();
  const entries = allObjectEntries().filter(({ plate, record }) => batchSelectedObjectIds.size
    ? batchSelectedObjectIds.has(record.id) : plate === activePlate() && record.selectionKey === selectedObjectId);
  if (!entries.length) return false;
  objectClipboard = entries.map(({ plate, record }) => {
    const { meshes, referenceGroup, renderStates, renderingObjectSnapshot, ...source } = plate;
    const instance = plate.batchInstances?.find(item => item.id === record.id);
    const sourceKey = record.sourceKey || record.selectionKey;
    const group = plate.objectDefs.length ? logicalObjectGroupsFor(plate.objectDefs, plate.values).find(group => `group:${group.key}` === sourceKey) : null;
    return { source: structuredClone(source), record: structuredClone(record),
      memberIds: structuredClone(instance?.memberIds || group?.memberIds || []),
      configuration: structuredClone({ ...record.configuration, parameters: effectiveObjectValues(plate, record.selectionKey) }),
      offset: storedObjectOffset(record.selectionKey, plate) };
  });
  objectClipboardPastes = 0;
  setStatus(`${entries.length} object${entries.length === 1 ? '' : 's'} copied. ${isMacPlatform() ? 'Cmd' : 'Ctrl'} + V to paste.`);
  return true;
}

async function pasteCopiedObjects() {
  if (!objectClipboard.length || exportInProgress || objectHistoryBusy || pointerDown) return false;
  objectHistoryBusy = true;
  try {
    if (bulkPreviewGenerationPromise) await bulkPreviewGenerationPromise.catch(() => {});
    const sourceKeys = [...new Set(objectClipboard.map(item => item.source.key))];
    rememberObjectEdit(sourceRemovalSnapshot(sourceKeys));
    clearWorkspaceColorArrangement();
    const targetPlate = activeViewPlateId || 'A';
    const step = 10 * ++objectClipboardPastes;
    let pastedSelection;
    batchSelectedObjectIds.clear();
    for (const item of objectClipboard) {
      let plate = plates.find(plate => plate.key === item.source.key);
      if (!plate) {
        plate = { ...structuredClone(item.source), defaultPlateId: targetPlate, meshes: [], referenceGroup: null,
          rendering: false, renderingValues: null, renderToken: 0, lastGeneratedValues: null, batchDirty: true, autoPositionPending: false };
        for (const record of Object.values(plate.objectRecords)) record.deleted = true;
        plates.push(plate);
      }
      const id = createPersistentId('obj'), selectionKey = `instance:${id}`;
      const sourceKey = item.record.sourceKey || item.record.selectionKey;
      const instance = { id, sourceKey, memberIds: structuredClone(item.memberIds), label: `${item.record.label} copy`,
        plateId: targetPlate, configuration: structuredClone(item.configuration) };
      // Clone from the native definition, never from another copy's transform.
      if (plate.objectRecords[sourceKey]) instance.productionSourceId = plate.objectRecords[sourceKey].id;
      plate.batchInstances.push(instance);
      plate.objectRecords[selectionKey] = { ...structuredClone(item.record), id, selectionKey, sourceKey,
        label: instance.label, deleted: false, skuLink: null, plateId: targetPlate, originalPlateId: targetPlate, configuration: instance.configuration };
      plate.objectTransforms[selectionKey] = { ...item.offset, x: item.offset.x + step, z: item.offset.z + step };
      plate.batchDirty = true;
      plate.emptySelectionKeys?.delete(selectionKey);
      batchSelectedObjectIds.add(id);
      pastedSelection = { plate, selectionKey };
    }
    ensureBatchPlate(targetPlate); loadedPlateIds.add(targetPlate);
    if (!activePlate()) switchPlate(sourceKeys[0], { generateIfEmpty: false, focus: false, preserveView: true });
    preparedExport = null;
    persistUploadedPlates();
    await generatePendingPreviews({ plateKeys: sourceKeys, throwOnFailure: true });
    switchPlate(pastedSelection.plate.key, { generateIfEmpty: false, focus: false, preserveView: true });
    selectObject(pastedSelection.selectionKey, false, { preserveBatch: true });
    applyBatchPlateVisibility(); renderPlateList(); updatePlateFitStatus();
    setStatus(`${objectClipboard.length} object${objectClipboard.length === 1 ? '' : 's'} pasted.`);
    return true;
  } finally { objectHistoryBusy = false; }
}

function handleObjectRemovalShortcut(event) {
  if (historyShortcuts.keyDown(event)) return;
  const action = editorShortcutAction(event);
  if (!['copy', 'paste', 'remove'].includes(action) || event.repeat) return;
  if (!objectShortcutAllowed(event.target, true) || !objectShortcutAllowed(document.activeElement, true)) return;
  if (action === 'copy' && !copySelectedObjects()) return;
  if (action === 'paste' && !objectClipboard.length) return;
  event.preventDefault();
  if (action === 'remove') removeSelectedObject();
  if (action === 'paste') void pasteCopiedObjects().catch(error => setStatus(`Paste failed: ${error.message}`, true));
}

function autoPositionOriginDesigns(plate) {
  if (!plate.autoPositionPending) return false;
  plate.autoPositionPending = false;
  if (accountPreferences.workspace.autoPosition === false) return false;
  const printer = activePrinter();
  const profile = printProfileSnapshotFromUi();
  const sources = ensureObjectRecords(plate).filter(record => !record.selectionKey.startsWith('instance:')).map(record => {
    const meshes = plate.meshes.filter(mesh => String(mesh.userData.selectionKey) === record.selectionKey);
    const box = combinedBox(meshes);
    if (!box) return null;
    const layout = plateLayoutForId(record.plateId || plate.defaultPlateId);
    return { record, name: record.label, offset: storedObjectOffset(record.selectionKey, plate),
      height:box.max.y-box.min.y,layerHeight:record.printOverrides?.layer_height || profile.settings.layer_height,
      colorAnalysis:analyzeWorkspaceTowerMeshes(meshes,{layerHeight:record.printOverrides?.layer_height || profile.settings.layer_height,firstLayerHeight:profile.settings.initial_layer_print_height || profile.settings.layer_height}),
      towerChannels:[...new Set(meshes.map(mesh=>mesh.userData.hexColor).filter(Boolean))],
      bounds: { minX: box.min.x - layout.x + printer.width / 2, maxX: box.max.x - layout.x + printer.width / 2,
        minY: printer.depth / 2 - (box.max.z - layout.z), maxY: printer.depth / 2 - (box.min.z - layout.z), minZ: box.min.y } };
  }).filter(Boolean);
  const plan = originLayout(sources, printer, {primeTower:normalizePrimeTowerSettings({...profile,settings:{...profile.settings,...profile.advanced}})});
  if (!plan) return false;
  const occupied = reservedPlateIds(plate);
  const available = [plate.defaultPlateId, ...PLATE_IDS.filter(id => id !== plate.defaultPlateId)].filter(id => !occupied.has(id));
  if (plan.plateCount > available.length) throw new Error('Not enough empty plates to arrange these designs.');
  rememberObjectEdit({ type: 'move', primeTowers:structuredClone(workspacePrimeTowers), activeViewPlateId, batchPlateMeta: structuredClone(batchPlateMeta), loadedPlateIds: [...loadedPlateIds],
    changes: sources.map(({ record, offset }) => ({ plateKey: plate.key, selectionKey: record.selectionKey, plateId: record.plateId, offset })) });
  for (const item of plan.items) {
    const record = plate.objectRecords[item.source.record.selectionKey];
    const id = available[item.placement.plateIndex];
    ensureBatchPlate(id); loadedPlateIds.add(id);
    moveObjectToPlate(record, id, plate.defaultPlateId);
    plate.objectTransforms[record.selectionKey] = item.offset;
  }
  const arrangedIds=new Set(plan.items.map(item=>available[item.placement.plateIndex]));
  workspacePrimeTowers=[...workspacePrimeTowers.filter(tower=>!arrangedIds.has(tower.plateId)),
    ...plan.primeTowers.map(({plateIndex,...tower})=>({plateId:available[plateIndex],...tower}))];
  preparedExport = null;
  applyBatchPlateVisibility(); updateSelectionVisuals(); updatePlateFitStatus(); fitAllPlates();
  return true;
}

function allObjectEntries() {
  return plates.flatMap((plate) => ensureObjectRecords(plate).map((record) => ({ plate, record })));
}

function refreshViewerEmptyState() {
  const hasMeshes = plates.some(plate => plate.meshes.some(mesh => mesh.visible));
  viewerMessage.hidden = hasMeshes;
  if (!hasMeshes) viewerMessage.textContent = !plates.length ? 'Add one or more .scad files to begin.'
    : plates.some(plate => Object.values(plate.objectRecords || {}).some(record => !record.deleted))
      ? 'Click Generate to preview this workspace.' : 'This plate is empty. Undo to restore removed objects.';
}

function applyBatchPlateVisibility() {
  buildPlateReference();
  for (const plate of plates) {
    ensureObjectRecords(plate);
    for (const mesh of plate.meshes) {
      const record = plate.objectRecords[String(mesh.userData.selectionKey)];
      mesh.visible = !record?.deleted && !batchPlateMeta[record?.plateId || 'A']?.hidden;
      applyStoredTransform(mesh, plate);
    }
  }
  updateSectionTabAssignmentState();
  updateSelectionVisuals();
  refreshViewerEmptyState();
}

function setWorkflowMessage(message, error = false) {
  const text = String(message || '').trim();
  workflowMessage.textContent = text;
  workflowMessage.hidden = !text;
  workflowMessage.classList.toggle('error', error);
}

function checkedPresetParameterNames() {
  return [...presetParameterList.querySelectorAll('input[type="checkbox"]:checked')].map((input) => input.value);
}

function renderPresetParameterList(selectedNames = null) {
  presetParameterList.innerHTML = '';
  variantParameterEmpty.hidden = true;
  if (!parameters.length) {
    presetParameterList.innerHTML = '<div class="workflow-empty">Open a SCAD file to choose parameters.</div>';
    return;
  }
  const selected = selectedNames ? new Set(selectedNames) : new Set();
  for (const param of parameters) {
    const row = document.createElement('label');
    row.className = 'workflow-check-row';
    row.title = param.name;
    row.dataset.search = `${param.name} ${param.label || ''} ${param.section || ''}`.toLocaleLowerCase();
    const input = document.createElement('input');
    input.type = 'checkbox'; input.value = param.name; input.checked = selected.has(param.name);
    const copy = document.createElement('span');
    copy.textContent = param.label || param.name;
    const key = document.createElement('small');
    key.textContent = param.name;
    row.append(input, copy, key);
    presetParameterList.append(row);
  }
  filterVariantParameters();
}

function filterVariantParameters() {
  const query = variantParameterSearch.value.trim().toLocaleLowerCase();
  const rows = [...presetParameterList.querySelectorAll('.workflow-check-row')];
  for (const row of rows) row.hidden = !row.dataset.search.includes(query);
  variantParameterEmpty.hidden = !rows.length || rows.some((row) => !row.hidden);
}

function applyActivePresetStack({ announce = true } = {}) {
  for (const plate of plates) {
    if (plate.objectBinding) continue;
    const evaluated = evaluatePresetStack(plate.parameters, parametricPresets, activePresetIds);
    plate.values = { ...(plate.baseValues || plate.values), ...evaluated.values };
    plate.batchDirty = true;
  }
  const plate = activePlate();
  if (plate) {
    setFormValues(plate.values);
    generateBtn.classList.add('dirty');
  }
  persistUploadedPlates();
  renderWorkflowUi();
  renderPlateList();
  if (accountPreferences.workspace.autoRegenerate && !workspaceHydrating) {
    if (announce) setWorkflowMessage('Variants applied.');
    scheduleAutoRegenerate();
  } else if (announce) {
    setWorkflowMessage('Variants applied.');
  }
}

function renderPresetUi() {
  const previousTarget = presetTarget.value;
  presetTarget.innerHTML = '<option value="">New variant</option>';
  for (const preset of parametricPresets) {
    const option = document.createElement('option');
    option.value = preset.id; option.textContent = `${preset.category || 'General'} · ${preset.name}`;
    presetTarget.append(option);
  }
  if (parametricPresets.some((preset) => preset.id === previousTarget)) presetTarget.value = previousTarget;

  presetStackList.innerHTML = '';
  const presetById = new Map(parametricPresets.map((preset) => [preset.id, preset]));
  const orderedPresets = [...activePresetIds.map((id) => presetById.get(id)).filter(Boolean), ...parametricPresets.filter((preset) => !activePresetIds.includes(preset.id))];
  const query = variantSearch.value.trim().toLocaleLowerCase();
  const matches = orderedPresets.filter((preset) => {
    const labels = Object.keys(preset.values || {}).map((key) => parameters.find((param) => param.name === key)?.label || '');
    return `${preset.name} ${preset.category || 'General'} ${JSON.stringify(preset.values || {})} ${labels.join(' ')}`.toLocaleLowerCase().includes(query);
  });
  if (!parametricPresets.length) presetStackList.innerHTML = '<div class="workflow-empty">No saved variants yet.</div>';
  if (parametricPresets.length && !matches.length) presetStackList.innerHTML = '<div class="workflow-empty" role="status">No matching variants.</div>';
  for (const preset of matches) {
    const active = activePresetIds.includes(preset.id);
    const card = document.createElement('article'); card.className = 'preset-stack-card';
    const enabled = document.createElement('input'); enabled.type = 'checkbox'; enabled.checked = active;
    enabled.setAttribute('aria-label', `${active ? 'Disable' : 'Apply'} ${preset.name}`);
    enabled.addEventListener('change', () => {
      activePresetIds = enabled.checked ? [preset.id] : [];
      applyActivePresetStack();
    });
    const copy = document.createElement('span'); copy.className = 'preset-stack-copy';
    const title = document.createElement('strong'); title.textContent = `${preset.category || 'General'} · ${preset.name}`;
    const info = document.createElement('small');
    info.textContent = `${preset.category || 'General'} · ${Object.keys(preset.values).length} saved value${Object.keys(preset.values).length === 1 ? '' : 's'}`;
    copy.append(title, info);
    const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'mini-button'; edit.textContent = 'Edit';
    edit.addEventListener('click', () => {
      presetTarget.value = preset.id;
      presetName.value = preset.name;
      presetCategory.value = preset.category || 'General';
      renderPresetParameterList(Object.keys(preset.values || {}));
      variantEditorDetails.open = true;
      presetName.focus();
    });
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'mini-button danger-outline'; remove.textContent = 'Delete';
    remove.addEventListener('click', () => {
      if (!window.confirm(`Delete variant ${preset.name}?`)) return;
      const wasActive = activePresetIds.includes(preset.id);
      parametricPresets = parametricPresets.filter((item) => item.id !== preset.id);
      activePresetIds = activePresetIds.filter((id) => id !== preset.id);
      if (presetTarget.value === preset.id) {
        presetTarget.value = '';
        presetName.value = '';
        presetCategory.value = '';
        renderPresetParameterList([]);
      }
      if (wasActive) applyActivePresetStack({ announce: false });
      else { persistWorkflowState(); renderWorkflowUi(); }
      setWorkflowMessage(`${preset.name} deleted.`);
    });
    card.append(enabled, copy, edit, remove); presetStackList.append(card);
  }
}


function assignObjectIdsToPlate(objectIds, plateId) {
  if (objectHistoryBusy) return;
  const id = ensureBatchPlate(plateId);
  ensurePhysicalPlateId(id);
  const selected = new Set(objectIds);
  const changes = [];
  for (const { plate, record } of allObjectEntries()) {
    if (!selected.has(record.id) || record.plateId === id) continue;
    changes.push({ plateKey: plate.key, selectionKey: record.selectionKey, plateId: record.plateId });
    moveObjectToPlate(record,id,plate.defaultPlateId);
    const instance = plate.batchInstances?.find((item) => item.id === record.id);
    if (instance) instance.plateId = id;
  }
  if (changes.length) { clearWorkspaceColorArrangement(); rememberObjectEdit({ type: 'move', changes, activeViewPlateId }); }
  preparedExport = null;
  activeViewPlateId = id;
  persistUploadedPlates();
  applyBatchPlateVisibility();
  renderWorkflowUi();
}


function renderWorkflowUi() {
  renderPresetUi();
  renderPresetParameterList(checkedPresetParameterNames());
}

function selectionKeyForGroup(group) {
  return `group:${group.key}`;
}

function logicalGroupForSelection(selection = selectedObjectId, values = getValues()) {
  if (selection === 'all' || selection === 'model') return null;
  const groups = logicalObjectGroups(values);
  if (String(selection).startsWith('group:')) {
    const key = String(selection).slice(6);
    return groups.find((group) => group.key === key) || null;
  }
  const numeric = Number(selection);
  if (Number.isInteger(numeric)) return groups.find((group) => group.memberIds.includes(numeric)) || null;
  return null;
}

function logicalGroupForObjectId(id, values = getValues()) {
  const numeric = Number(id);
  return logicalObjectGroups(values).find((group) => group.memberIds.includes(numeric)) || null;
}

function updateObjectMenu() {
  const values = getValues();
  const previousGroup = logicalGroupForSelection(selectedObjectId, values);
  const groups = logicalObjectGroups(values);
  if (previousGroup) selectedObjectId = selectionKeyForGroup(previousGroup);
  const instanceKeys = (activePlate()?.batchInstances || []).map((instance) => `instance:${instance.id}`);
  const validSelections = new Set([groups.length ? 'all' : 'model', ...groups.map(selectionKeyForGroup), ...instanceKeys]);
  if (!validSelections.has(String(selectedObjectId))) {
    selectedObjectId = groups.length ? 'all' : 'model';
  }
}

function activeObjectDefs(values) {
  if (!objectDefs.length) return [];
  const renderDesign = values.render_design;
  const match = typeof renderDesign === 'string' && renderDesign.match(/^design_(\d+)$/);
  if (match && !activePlate()?.objectBinding) return objectDefs.filter((d) => d.id === Number(match[1]));
  return objectDefs.filter((d) => {
    if (!d.labelParam) return true;
    return String(values[d.labelParam] ?? '').trim() !== '';
  });
}

function selectedMeshes() {
  const visible = currentMeshes.filter((mesh) => mesh.visible);
  if (selectedObjectId === 'all') return visible;
  return visible.filter((mesh) => String(mesh.userData.selectionKey) === String(selectedObjectId));
}

function generatedPositionFor(mesh) {
  const value = mesh.userData.generatedPosition;
  return value ? new THREE.Vector3(value.x, value.y, value.z) : new THREE.Vector3();
}

function storedObjectOffset(selectionKey, plate = activePlate()) {
  const value = plate?.objectTransforms?.[String(selectionKey)] || {};
  return {
    x: Number.isFinite(Number(value.x)) ? Number(value.x) : 0,
    z: Number.isFinite(Number(value.z)) ? Number(value.z) : 0,
    y: Number(value.y) || 0, rotation: Number(value.rotation) || 0
  };
}

function applyStoredTransform(mesh, plate = activePlate()) {
  requestRender();
  const base = generatedPositionFor(mesh);
  const offset = storedObjectOffset(mesh.userData.selectionKey, plate);
  const record = plate?.objectRecords?.[String(mesh.userData.selectionKey)];
  const layout = plateLayoutForId(record?.plateId || plate?.defaultPlateId || 'A');
  mesh.rotation.set(-Math.PI / 2, 0, 0);
  mesh.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), offset.rotation));
  base.applyAxisAngle(new THREE.Vector3(0, 1, 0), offset.rotation);
  mesh.position.set(base.x + offset.x + layout.x, base.y + offset.y, base.z + offset.z + layout.z);
}

function rememberObjectMove(plate, selectionKey, previousOffset) {
  if (!plate || !previousOffset) return;
  const offset = storedObjectOffset(selectionKey, plate);
  if (offset.x === previousOffset.x && offset.z === previousOffset.z && offset.y === (previousOffset.y || 0) && offset.rotation === (previousOffset.rotation || 0)) return;
  clearWorkspaceColorArrangement();
  rememberObjectEdit({ type: 'move', changes: [{ plateKey: plate.key, selectionKey: String(selectionKey), offset: { ...previousOffset } }] });
}

function setObjectOffset(selectionKey, x, z, { persist = true } = {}) {
  const plate = activePlate();
  if (!plate) return;
  const key = String(selectionKey);
  const previousOffset = storedObjectOffset(key, plate);
  plate.objectTransforms[key] = { ...previousOffset, x, z };
  if (persist) rememberObjectMove(plate, key, previousOffset);
  preparedExport = null;
  for (const mesh of currentMeshes) {
    if (String(mesh.userData.selectionKey) === key || (key === 'model' && mesh.userData.selectionKey === 'model')) applyStoredTransform(mesh, plate);
  }
  if (persist) persistUploadedPlates();
}

function moveSelectionBy(deltaX, deltaZ) {
  if (exportInProgress || objectHistoryBusy) return false;
  if (selectedObjectId === 'all' || !objectRecordForSelection(activePlate(), selectedObjectId)) return false;
  const offset = storedObjectOffset(selectedObjectId);
  setObjectOffset(selectedObjectId, offset.x + deltaX, offset.z + deltaZ);
  updateSelectionVisuals();
  updatePlateFitStatus();
  renderPlateList();
  return true;
}

function beginObjectRotation() {
  if(exportInProgress || objectHistoryBusy || pointerDown || selectedObjectId==='all')return false;
  const plate=activePlate(), record=objectRecordForSelection(plate,selectedObjectId);
  if(!record)return false;
  const box=combinedBox(plate.meshes.filter(mesh=>mesh.visible && String(mesh.userData.selectionKey)===String(selectedObjectId)));
  if(!box)return false;
  const center=box.getCenter(new THREE.Vector3());
  center.y=box.min.y+0.5;
  const point=lastViewerPointer ? pointAtPointerOnPlane(lastViewerPointer,center.y) : null;
  const layout=plateLayoutForId(record.plateId || plate.defaultPlateId);
  pointerDown={plateKey:plate.key,selectionKey:String(selectedObjectId),startOffset:storedObjectOffset(selectedObjectId,plate),
    planeY:center.y,center,cx:center.x-layout.x,cz:center.z-layout.z,
    lastAngle:point && point.distanceTo(center)>=1 ? Math.atan2(point.z-center.z,point.x-center.x) : null,
    angle:0,rotating:true,dragging:true};
  controls.enabled=false;
  renderer.domElement.style.cursor='crosshair';
  renderer.domElement.focus({preventScroll:true});
  setStatus('Move your mouse to rotate in 90° steps · click to apply · Esc to cancel');
  return true;
}

function dragObjectRotation(event) {
  const drag=pointerDown;
  const point=pointAtPointerOnPlane(event,drag.planeY);
  if(!point || point.distanceTo(drag.center)<1)return;
  const angle=Math.atan2(point.z-drag.center.z,point.x-drag.center.x);
  if(drag.lastAngle===null){drag.lastAngle=angle;return;}
  // Accumulate across the +/-180° boundary without jumps or a limit on turns.
  drag.angle-=Math.atan2(Math.sin(angle-drag.lastAngle),Math.cos(angle-drag.lastAngle));
  drag.lastAngle=angle;
  const offset=drag.startOffset;
  const rotation=snapQuarterTurn(offset.rotation+drag.angle), delta=rotation-offset.rotation;
  const c=Math.cos(delta), sn=Math.sin(delta);
  const plate=plates.find(candidate=>candidate.key===drag.plateKey);
  if(!plate)return;
  plate.objectTransforms[drag.selectionKey]={...offset,
    x:drag.cx+c*(offset.x-drag.cx)+sn*(offset.z-drag.cz),
    z:drag.cz-sn*(offset.x-drag.cx)+c*(offset.z-drag.cz),
    rotation};
  preparedExport=null;
  const meshes=plate.meshes.filter(mesh=>String(mesh.userData.selectionKey)===drag.selectionKey);
  for(const mesh of meshes)applyStoredTransform(mesh,plate);
  selectionHelper?.children.forEach((outline,index)=>{
    if(meshes[index]){outline.position.copy(meshes[index].position);outline.quaternion.copy(meshes[index].quaternion);}
  });
  const degrees=((plate.objectTransforms[drag.selectionKey].rotation*180/Math.PI)%360+360)%360;
  selectionLabelDimensions.textContent=`${degrees.toFixed(1)}°`;
  setStatus(`Rotation ${degrees.toFixed(1)}° · click to apply · Esc to cancel`);
  updatePlateFitStatus();
}

function handleObjectRotationShortcut(event) {
  if(event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.repeat || event.isComposing || event.defaultPrevented)return;
  if(event.target?.closest?.('input, select, textarea, [contenteditable]:not([contenteditable="false"]), [role="textbox"]'))return;
  if([...document.querySelectorAll('[role="dialog"]')].some(dialog=>dialog.getClientRects().length))return;
  if(pointerDown?.rotating && ['Escape','Enter','r','R'].includes(event.key)){
    finishObjectDrag({cancelled:event.key==='Escape'});event.preventDefault();return;
  }
  if(event.key.toLowerCase()==='r' && beginObjectRotation())event.preventDefault();
}

function handleCursorRotationMove(event) {
  if(!pointerDown?.rotating)return;
  lastViewerPointer={clientX:event.clientX,clientY:event.clientY};
  dragObjectRotation(event);
}

function handleCursorRotationClick(event) {
  if(!pointerDown?.rotating || ![0,2].includes(event.button))return;
  finishObjectDrag({cancelled:event.button===2});
  event.preventDefault();event.stopImmediatePropagation();
}

function combinedBox(meshes) {
  if (!meshes.length) return null;
  const box = new THREE.Box3();
  let initialized = false;
  for (const mesh of meshes) {
    const meshBox = new THREE.Box3().setFromObject(mesh);
    if (meshBox.isEmpty()) continue;
    if (!initialized) {
      box.copy(meshBox);
      initialized = true;
    } else {
      box.union(meshBox);
    }
  }
  return initialized ? box : null;
}

function activePrinter() {
  const base = PRINTERS[printProfile.printer] || PRINTERS.p1s;
  const nozzle = SUPPORTED_NOZZLES.includes(Number(printProfile.nozzleDiameter)) ? Number(printProfile.nozzleDiameter) : base.nozzle;
  return { ...base, nozzle };
}

function areaRectsForPrinter(areas, printer, fallbackLabel) {
  return (areas || []).map((area) => ({
    label: area.label || fallbackLabel,
    minX: Math.min(area.x1, area.x2) - printer.width / 2,
    maxX: Math.max(area.x1, area.x2) - printer.width / 2,
    // Printer Y increases away from the front edge; the Three.js plate uses
    // negative Z for that same direction after the Z-up conversion.
    minZ: printer.depth / 2 - Math.max(area.y1, area.y2),
    maxZ: printer.depth / 2 - Math.min(area.y1, area.y2)
  }));
}

function excludedRectsForPrinter(printer = activePrinter()) {
  return areaRectsForPrinter(printer.excludedAreas, printer, 'No-print area');
}

function nozzleLimitedRectsForPrinter(printer = activePrinter()) {
  return areaRectsForPrinter(printer.nozzleLimitedAreas, printer, 'Nozzle-limited area');
}

function boxIntersectsRect(box, rect, epsilon = 0.01) {
  return box.max.x > rect.minX + epsilon && box.min.x < rect.maxX - epsilon
    && box.max.z > rect.minZ + epsilon && box.min.z < rect.maxZ - epsilon;
}

function objectBoxesForMeshes(meshes, plate = null) {
  const groups = new Map();
  for (const mesh of meshes) {
    const key = String(mesh.userData.selectionKey || mesh.userData.objectId || 'model');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(mesh);
  }
  return [...groups.values()].map((groupMeshes) => {
    const box = combinedBox(groupMeshes);
    if (box && plate) {
      const selectionKey = String(groupMeshes[0]?.userData.selectionKey || 'model');
      const record = plate.objectRecords?.[selectionKey];
      const layout = plateLayoutForId(record?.plateId || plate.defaultPlateId || 'A');
      box.translate(new THREE.Vector3(-layout.x, 0, -layout.z));
    }
    return box;
  }).filter(Boolean);
}

function fitMinorPlateOverflows(printer) {
  const margin = 0.15;
  const maxAutomaticNudge = 1;
  const halfW = printer.width / 2;
  const halfD = printer.depth / 2;

  for (const plate of plates) {
    const groups = new Map();
    for (const mesh of plate.meshes) {
      const key = String(mesh.userData.selectionKey || mesh.userData.objectId || 'model');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(mesh);
    }

    for (const [key, meshes] of groups) {
      const box = localBoxForPlate(plate, meshes);
      if (!box) continue;
      if (box.max.x - box.min.x > printer.width - margin * 2 || box.max.z - box.min.z > printer.depth - margin * 2) {
        throw new Error(`Plate ${plate.defaultPlateId} contains an object larger than the printable bed.`);
      }

      let dx = 0;
      let dz = 0;
      if (box.min.x < -halfW + margin) dx += -halfW + margin - box.min.x;
      if (box.max.x + dx > halfW - margin) dx += halfW - margin - (box.max.x + dx);
      if (box.min.z < -halfD + margin) dz += -halfD + margin - box.min.z;
      if (box.max.z + dz > halfD - margin) dz += halfD - margin - (box.max.z + dz);
      if (Math.abs(dx) < 0.0001 && Math.abs(dz) < 0.0001) continue;
      if (Math.abs(dx) > maxAutomaticNudge || Math.abs(dz) > maxAutomaticNudge) {
        throw new Error(`Plate ${plate.defaultPlateId} has an object outside the printable bed. Move it inside before exporting.`);
      }

      const offset = storedObjectOffset(key, plate);
      clearWorkspaceColorArrangement();
      plate.objectTransforms[key] = { ...offset, x: offset.x + dx, z: offset.z + dz };
      for (const mesh of meshes) applyStoredTransform(mesh, plate);
    }

    const box = localBoxForPlate(plate);
    const outside = box && (
      box.min.x < -halfW - 0.01 || box.max.x > halfW + 0.01
      || box.min.z < -halfD - 0.01 || box.max.z > halfD + 0.01
    );
    const keepout = excludedRectsForPrinter(printer)
      .some((rect) => objectBoxesForMeshes(plate.meshes, plate).some((objectBox) => boxIntersectsRect(objectBox, rect)));
    if (outside || keepout) {
      const reason = keepout ? 'overlaps a no-print area' : 'has geometry outside the printable bed';
      throw new Error(`Plate ${plate.defaultPlateId} ${reason}. Move the highlighted object before exporting.`);
    }
  }

  persistUploadedPlates();
  updateSelectionVisuals();
  updatePlateFitStatus();
  renderPlateList();
}

function clearPlate() {
  requestRender();
  plateGroup.traverse((child) => {
    child.geometry?.dispose?.();
    child.material?.map?.dispose?.();
    child.material?.dispose?.();
  });
  plateGroup.clear();
  batchPlateReferences = {};
  for (const plate of plates) plate.referenceGroup = null;
}

function updatePlateLayout() {
  const printer = activePrinter();
  const gap = 42;
  const ids = visiblePlateIds();
  const columns = Math.max(1, Math.min(3, Math.ceil(Math.sqrt(Math.max(1, ids.length)))));
  const rows = Math.max(1, Math.ceil(ids.length / columns));
  batchPlateLayouts = {};
  ids.forEach((id, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    batchPlateLayouts[id] = {
      x: (column - (columns - 1) / 2) * (printer.width + gap),
      z: (row - (rows - 1) / 2) * (printer.depth + gap)
    };
  });
  for (const plate of plates) {
    plate.layoutOffset = plateLayoutForId(plate.defaultPlateId);
    for (const mesh of plate.meshes) applyStoredTransform(mesh, plate);
  }
}

function plateUiColor(role, active, exceeds = false, warning = false) {
  if (exceeds) return { surface: 0xc93939, border: 0xff6666, grid: 0x8e3030 }[role];
  if (warning) return { surface: 0xa87516, border: 0xffcc48, grid: 0xc49532 }[role];
  if (active) return renderAppearance.accent;
  return renderAppearance.light
    ? { surface: 0x667080, border: 0x647083, grid: 0x8b94a0 }[role]
    : { surface: 0x647087, border: 0x778397, grid: 0x4b5361 }[role];
}

function drawPlateLabel(canvas, plateId) {
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = renderAppearance.light ? 'rgba(255, 255, 255, 0.96)' : 'rgba(18, 21, 25, 0.94)';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = plateId === activeViewPlateId ? renderAppearance.accent : (renderAppearance.light ? '#647083' : '#78869b');
  context.lineWidth = 6;
  context.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);
  context.fillStyle = renderAppearance.light ? '#161a18' : '#f3f5f7';
  context.font = '700 42px system-ui, sans-serif';
  context.textAlign = 'center';
  context.fillText(`PLATE ${plateId}`, canvas.width / 2, 64);
}

function refreshRendererAppearance() {
  requestRender();
  for (const [plateId, reference] of Object.entries(batchPlateReferences)) {
    for (const child of reference.children) {
      const role = child.userData.plateRole;
      if (['surface', 'border', 'grid'].includes(role)) {
        child.material.color.set(plateUiColor(role, plateId === activeViewPlateId));
      } else if (role === 'prime-tower-label') {
        drawPrimeTowerLabel(child.material.map.image, child.userData.tower);
        child.material.map.needsUpdate = true;
      } else if (role === 'label') {
        drawPlateLabel(child.material.map.image, plateId);
        child.material.map.needsUpdate = true;
      }
    }
  }
  selectionHelper?.traverse((node) => { if (node.isLineSegments) node.material.color.set(renderAppearance.accent); });
  for (const plate of plates) {
    for (const mesh of plate.meshes) {
      if (mesh.material.emissiveIntensity > 0) mesh.material.emissive.set(renderAppearance.accent).multiplyScalar(0.08);
    }
  }
  if (plates.length) updatePlateFitStatus();
}

function makePlateLabel(plateId, source, width, depth) {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 96;
  drawPlateLabel(canvas, plateId);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
  sprite.scale.set(Math.min(width * 0.85, 205), 25.6, 1);
  sprite.position.set(0, 3, depth / 2 + 18);
  sprite.renderOrder = 900;
  sprite.userData.plateRole = 'label';
  sprite.userData.plateKey = source?.key || '';
  sprite.userData.batchPlateId = plateId;
  return sprite;
}

function addPlateAreaOverlay(reference, rect, plateKey, batchPlateId, style) {
  const rectWidth = rect.maxX - rect.minX;
  const rectDepth = rect.maxZ - rect.minZ;
  const centerX = (rect.minX + rect.maxX) / 2;
  const centerZ = (rect.minZ + rect.maxZ) / 2;
  const surface = new THREE.Mesh(
    new THREE.PlaneGeometry(rectWidth, rectDepth),
    new THREE.MeshBasicMaterial({ color: style.surface, transparent: true, opacity: style.opacity, side: THREE.DoubleSide, depthWrite: false })
  );
  surface.renderOrder = style.role === 'keepout' ? 30 : 20;
  surface.rotation.x = -Math.PI / 2;
  surface.position.set(centerX, 0.035, centerZ);
  surface.userData.plateRole = `${style.role}-surface`;
  surface.userData.plateKey = plateKey;
  surface.userData.batchPlateId = batchPlateId;
  surface.userData.areaLabel = rect.label;
  reference.add(surface);

  const outlinePoints = [
    new THREE.Vector3(rect.minX, 0.055, rect.minZ),
    new THREE.Vector3(rect.maxX, 0.055, rect.minZ),
    new THREE.Vector3(rect.maxX, 0.055, rect.maxZ),
    new THREE.Vector3(rect.minX, 0.055, rect.maxZ)
  ];
  const outline = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(outlinePoints),
    new THREE.LineBasicMaterial({ color: style.border, transparent: true, opacity: 0.95 })
  );
  outline.renderOrder=surface.renderOrder+2;
  outline.material.depthWrite=false;
  outline.userData.plateRole = `${style.role}-border`;
  outline.userData.plateKey = plateKey;
  outline.userData.batchPlateId = batchPlateId;
  outline.userData.areaLabel = rect.label;
  reference.add(outline);

  const hatch = [];
  for (let offset = -rectDepth; offset <= rectWidth; offset += 5) {
    const startX = Math.max(rect.minX, rect.minX + offset);
    const startZ = rect.maxZ - Math.max(0, -offset);
    const length = Math.min(rect.maxX - startX, startZ - rect.minZ);
    if (length > 0) hatch.push(new THREE.Vector3(startX, 0.06, startZ), new THREE.Vector3(startX + length, 0.06, startZ - length));
  }
  const hatchLines = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(hatch),
    new THREE.LineBasicMaterial({ color: style.hatch, transparent: true, opacity: 0.48, depthWrite:false })
  );
  hatchLines.renderOrder=surface.renderOrder+1;
  hatchLines.userData.plateRole = `${style.role}-hatch`;
  hatchLines.userData.plateKey = plateKey;
  hatchLines.userData.batchPlateId = batchPlateId;
  reference.add(hatchLines);
}

function plateGridPoints(width, depth, zones, spacing = 10) {
  const points=[];
  const addLine=(fixed,min,max,vertical)=>{
    let spans=[[min,max]];
    for(const rect of zones) {
      const crossMin=vertical?rect.minX:rect.minZ, crossMax=vertical?rect.maxX:rect.maxZ;
      if(fixed<crossMin || fixed>crossMax)continue;
      const cutMin=vertical?rect.minZ:rect.minX, cutMax=vertical?rect.maxZ:rect.maxX;
      spans=spans.flatMap(([start,end])=>{
        if(cutMax<=start || cutMin>=end)return [[start,end]];
        const remaining=[];
        if(cutMin>start)remaining.push([start,Math.min(end,cutMin)]);
        if(cutMax<end)remaining.push([Math.max(start,cutMax),end]);
        return remaining;
      });
    }
    for(const [start,end] of spans) {
      if(end-start<1e-6)continue;
      points.push(...(vertical
        ? [new THREE.Vector3(fixed,0.02,start),new THREE.Vector3(fixed,0.02,end)]
        : [new THREE.Vector3(start,0.02,fixed),new THREE.Vector3(end,0.02,fixed)]));
    }
  };
  for(let x=Math.ceil(-width/2/spacing)*spacing;x<=width/2;x+=spacing)addLine(x,-depth/2,depth/2,true);
  for(let z=Math.ceil(-depth/2/spacing)*spacing;z<=depth/2;z+=spacing)addLine(z,-width/2,width/2,false);
  return points;
}

function refreshWorkspacePrimeTowers() {
  const printer = activePrinter();
  const profile = printProfileSnapshotFromUi();
  const input = { ...profile, settings:{ ...profile.settings, ...profile.advanced } };
  const towerSettings=normalizePrimeTowerSettings(input);
  if(!towerSettings.enable_prime_tower) {workspacePrimeTowers=[];workspacePrimeTowerErrors={};return '';}
  const records = allObjectEntries();
  const byPlate = new Map();
  for (const { plate, record } of records) {
    const plateId = currentObjectPlate(record, plate.defaultPlateId);
    if (!byPlate.has(plateId)) byPlate.set(plateId, []);
    byPlate.get(plateId).push({ plate, record });
  }
  const next = [], errors = {};
  for (const [plateId, entries] of byPlate) {
    const previous = workspacePrimeTowers.find(tower => tower.plateId === plateId);
    if(entries.some(({plate,record})=>!plate.meshes.some(mesh=>String(mesh.userData.selectionKey)===record.selectionKey)))continue;
    try {
      const layout = plateLayoutForId(plateId);
      const items = entries.map(({plate,record}, index) => {
        const meshes = plate.meshes.filter(mesh => String(mesh.userData.selectionKey) === record.selectionKey);
        const box = combinedBox(meshes);
        if (!box) throw new Error('Generate every object before reserving prime tower space.');
        return { index, name:record.label, height:box.max.y-box.min.y,
          colorAnalysis:analyzeWorkspaceTowerMeshes(meshes,{layerHeight:record.printOverrides?.layer_height || input.settings.layer_height,firstLayerHeight:input.settings.initial_layer_print_height || input.settings.layer_height}),
          towerChannels:[...new Set(meshes.map(mesh=>mesh.userData.hexColor).filter(Boolean))],
          layerHeight:record.printOverrides?.layer_height || profile.settings.layer_height,
          placement:{ x:box.min.x-layout.x+printer.width/2, y:printer.depth/2-(box.max.z-layout.z), w:box.max.x-box.min.x, h:box.max.z-box.min.z } };
      });
      const tower = placePrimeTower(items, printer, towerSettings, previous);
      if (tower) next.push({plateId,...tower});
    } catch (error) { errors[plateId]=error.message; }
  }
  workspacePrimeTowers=next; workspacePrimeTowerErrors=errors;
  return Object.values(errors)[0] || '';
}

function primeTowerRect(tower, printer) {
  return { minX:tower.x-printer.width/2, maxX:tower.x+tower.w-printer.width/2,
    minZ:printer.depth/2-tower.y-tower.h, maxZ:printer.depth/2-tower.y,
    label:'Prime tower estimated' };
}

function drawPrimeTowerLabel(canvas, tower) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = renderAppearance.light ? '#362348' : '#edddff';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '600 32px sans-serif';
  ctx.fillText('Prime tower estimated', 256, 32);
}

function makePrimeTowerLabel(tower, rect) {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 64;
  drawPrimeTowerLabel(canvas, tower);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map:texture, transparent:true, depthTest:false }));
  const width = 40; sprite.scale.set(width, width/8, 1);
  sprite.position.set((rect.minX+rect.maxX)/2, tower.height+5, (rect.minZ+rect.maxZ)/2);
  sprite.userData.plateRole='prime-tower-label'; sprite.userData.tower=tower; sprite.renderOrder=900;
  return sprite;
}

function buildPlateReference() {
  clearPlate();
  updatePlateLayout();
  const printer = activePrinter();
  const width = printer.width;
  const depth = printer.depth;
  const excludedRects = excludedRectsForPrinter(printer);
  const nozzleLimitedRects = nozzleLimitedRectsForPrinter(printer);

  for (const plateId of visiblePlateIds()) {
    const plate = plateById(plateId);
    const plateKey = plate?.key || '';
    const layout = plateLayoutForId(plateId);
    const reference = new THREE.Group();
    reference.userData.plateKey = plateKey;
    reference.userData.batchPlateId = plateId;
    reference.position.set(layout.x, -0.15, layout.z);
    batchPlateReferences[plateId] = reference;
    if (plate) plate.referenceGroup = reference;
    plateGroup.add(reference);

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(width, depth),
      new THREE.MeshBasicMaterial({ color: plateUiColor('surface', plateId === activeViewPlateId), transparent: true, opacity: 0.10, side: THREE.DoubleSide, depthWrite: false })
    );
    plane.userData.plateRole = 'surface';
    plane.userData.plateKey = plateKey;
    plane.userData.batchPlateId = plateId;
    plane.rotation.x = -Math.PI / 2;
    reference.add(plane);

    const borderPoints = [
      new THREE.Vector3(-width / 2, 0, -depth / 2),
      new THREE.Vector3(width / 2, 0, -depth / 2),
      new THREE.Vector3(width / 2, 0, depth / 2),
      new THREE.Vector3(-width / 2, 0, depth / 2)
    ];
    const border = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(borderPoints),
      new THREE.LineBasicMaterial({ color: plateUiColor('border', plateId === activeViewPlateId), transparent: true, opacity: 0.95 })
    );
    border.userData.plateRole = 'border';
    border.userData.plateKey = plateKey;
    border.userData.batchPlateId = plateId;
    reference.add(border);

    const tower = workspacePrimeTowers.find(item => item.plateId === plateId && item.colorCount > 1);
    const towerRect = tower ? primeTowerRect(tower, printer) : null;
    const lines = plateGridPoints(width, depth, [...excludedRects, ...nozzleLimitedRects, ...(towerRect ? [towerRect] : [])]);
    const gridLines = new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(lines),
      new THREE.LineBasicMaterial({ color: plateUiColor('grid', plateId === activeViewPlateId), transparent: true, opacity: 0.42 })
    );
    gridLines.userData.plateRole = 'grid';
    gridLines.userData.plateKey = plateKey;
    gridLines.userData.batchPlateId = plateId;
    reference.add(gridLines);

    for (const rect of excludedRects) {
      addPlateAreaOverlay(reference, rect, plateKey, plateId, {
        role: 'keepout', surface: 0x7d2823, border: 0xff725f, hatch: 0xff8b78, opacity: 0.72
      });
    }
    for (const rect of nozzleLimitedRects) {
      addPlateAreaOverlay(reference, rect, plateKey, plateId, {
        role: 'nozzle-limit', surface: 0x715313, border: 0xf0b84c, hatch: 0xffcc67, opacity: 0.42
      });
    }
    if (towerRect) {
      const preview=createPrimeTowerPreview(tower);
      preview.position.set((towerRect.minX+towerRect.maxX)/2,.15,(towerRect.minZ+towerRect.maxZ)/2);
      preview.traverse(child=>{child.userData.plateKey=plateKey;child.userData.batchPlateId=plateId;});
      reference.add(preview);
      reference.add(makePrimeTowerLabel(tower, towerRect));
    }
    reference.add(makePlateLabel(plateId, plate, width, depth));
  }

  plateBadge.dataset.baseLabel = `${printer.shortLabel || printer.label} · ${width} × ${depth} mm`;
  const hasNozzleLimits = nozzleLimitedRects.length > 0;
  plateZoneLegend.hidden = !hasNozzleLimits;
  plateZoneLegend.querySelector('[data-zone="nozzle"]').hidden = !hasNozzleLimits;
  plateZoneLegend.title = [...excludedRects, ...nozzleLimitedRects].map((rect) => rect.label).join('\n');
  for (const plate of plates) updatePlatePosition(plate);
  updatePlateFitStatus();
}

function updatePlatePosition(plate = activePlate()) {
  requestRender();
  if (!plate?.referenceGroup) return;
  const box = combinedBox(plate.meshes);
  plate.referenceGroup.position.y = box ? box.min.y - 0.15 : -0.15;
}

function localBoxForPlate(plate, meshes = plate?.meshes || []) {
  if (!plate) return null;
  const boxes = objectBoxesForMeshes(meshes, plate);
  if (!boxes.length) return null;
  return boxes.slice(1).reduce((box, next) => box.union(next), boxes[0].clone());
}

function updatePlateFitStatus() {
  requestRender();
  const printer = activePrinter();
  const halfW = printer.width / 2;
  const halfD = printer.depth / 2;
  const bedTolerance = 0.2;
  const excludedRects = excludedRectsForPrinter(printer);
  const nozzleLimitedRects = nozzleLimitedRectsForPrinter(printer);
  let activeOutside = false;
  let activeBlocked = false;
  let activeNozzleLimited = false;
  const boundsByPlate=new Map();
  for(const source of plates) {
    const meshesByPlate=new Map();
    for(const mesh of source.meshes) {
      const record=source.objectRecords?.[String(mesh.userData.selectionKey)];
      if(record?.deleted)continue;
      const id=record?.plateId || source.defaultPlateId;
      if(!meshesByPlate.has(id))meshesByPlate.set(id,[]);
      meshesByPlate.get(id).push(mesh);
    }
    for(const [id,meshes] of meshesByPlate) {
      if(!boundsByPlate.has(id))boundsByPlate.set(id,[]);
      boundsByPlate.get(id).push(...objectBoxesForMeshes(meshes,source));
    }
  }
  for (const [plateId,reference] of Object.entries(batchPlateReferences)) {
    const objectBounds=boundsByPlate.get(plateId) || [];
    const outsidePlate=objectBounds.some(box=>!(
      box.min.x>=-halfW-bedTolerance && box.max.x<=halfW+bedTolerance
      && box.min.z>=-halfD-bedTolerance && box.max.z<=halfD+bedTolerance
    ));
    const blockedOverlap = excludedRects.some((rect) => objectBounds.some((objectBox) => boxIntersectsRect(objectBox, rect)));
    const nozzleLimitedOverlap = nozzleLimitedRects.some((rect) => objectBounds.some((objectBox) => boxIntersectsRect(objectBox, rect)));
    const exceeds = outsidePlate || blockedOverlap;
    const active = plateId === activeViewPlateId;
    if (active) {
      activeOutside = outsidePlate;
      activeBlocked = blockedOverlap;
      activeNozzleLimited = nozzleLimitedOverlap;
    }
    for (const child of reference.children || []) {
      if (child.userData.plateRole === 'surface') {
        child.material.color.set(plateUiColor('surface', active, exceeds, nozzleLimitedOverlap));
        child.material.opacity = exceeds || nozzleLimitedOverlap ? 0.25 : active ? 0.20 : 0.08;
      } else if (child.userData.plateRole === 'border') {
        child.material.color.set(plateUiColor('border', active, exceeds, nozzleLimitedOverlap));
      } else if (child.userData.plateRole === 'grid') {
        child.material.color.set(plateUiColor('grid', active, exceeds, nozzleLimitedOverlap));
        child.material.opacity = exceeds || nozzleLimitedOverlap ? 0.65 : active ? 0.58 : 0.30;
      } else if (child.userData.plateRole === 'keepout-surface') {
        child.material.color.setHex(blockedOverlap ? 0xc83d31 : 0x7d2823);
      } else if (child.userData.plateRole === 'keepout-border') {
        child.material.color.setHex(blockedOverlap ? 0xffb2a5 : 0xff725f);
      } else if (child.userData.plateRole === 'nozzle-limit-surface') {
        child.material.color.setHex(nozzleLimitedOverlap ? 0xa87516 : 0x715313);
      } else if (child.userData.plateRole === 'nozzle-limit-border') {
        child.material.color.setHex(nozzleLimitedOverlap ? 0xffdc86 : 0xf0b84c);
      }
    }
  }
  const baseLabel = plateBadge.dataset.baseLabel || `${printer.shortLabel || printer.label} · ${printer.width} × ${printer.depth} mm`;
  const prefix = activeViewPlateId ? `Plate ${activeViewPlateId} · ` : '';
  plateBadge.textContent = activeOutside ? `${prefix}${baseLabel} · outside plate`
    : activeBlocked ? `${prefix}${baseLabel} · no-print overlap`
      : activeNozzleLimited ? `${prefix}${baseLabel} · check nozzle reach`
        : `${prefix}${baseLabel}`;
  plateBadge.classList.toggle('plate-overflow', activeOutside || activeBlocked);
  plateBadge.classList.toggle('plate-warning', !activeOutside && !activeBlocked && activeNozzleLimited);
}

function meshesTopologyStats(meshes) {
  const triangleCount = meshes.reduce((total, mesh) => {
    const position = mesh.geometry?.getAttribute?.('position');
    return total + Math.floor((mesh.geometry?.index?.count || position?.count || 0) / 3);
  }, 0);
  if (!triangleCount || triangleCount > 75000) return { skipped: triangleCount > 75000, boundary: 0, nonManifold: 0 };
  const edges = new Map();
  const point = new THREE.Vector3();
  const vertexKey = (mesh, position, vertexIndex) => {
    mesh.updateMatrixWorld(true);
    point.fromBufferAttribute(position, vertexIndex).applyMatrix4(mesh.matrixWorld);
    return `${Math.round(point.x * 10000)},${Math.round(point.y * 10000)},${Math.round(point.z * 10000)}`;
  };
  const edge = (a, b) => {
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    edges.set(key, (edges.get(key) || 0) + 1);
  };
  for (const mesh of meshes) {
    const geometry = mesh.geometry;
    const position = geometry?.getAttribute?.('position');
    const index = geometry?.index;
    const count = Math.floor((index?.count || position?.count || 0) / 3);
    if (!position) continue;
    for (let triangle = 0; triangle < count; triangle += 1) {
      const base = triangle * 3;
      const a = vertexKey(mesh, position, index ? index.getX(base) : base);
      const b = vertexKey(mesh, position, index ? index.getX(base + 1) : base + 1);
      const c = vertexKey(mesh, position, index ? index.getX(base + 2) : base + 2);
      edge(a, b); edge(b, c); edge(c, a);
    }
  }
  let boundary = 0;
  let nonManifold = 0;
  for (const count of edges.values()) {
    if (count === 1) boundary += 1;
    else if (count > 2) nonManifold += 1;
  }
  return { skipped: false, boundary, nonManifold };
}

function meshOverhangStats(mesh, supportAngle, firstLayerHeight) {
  const position = mesh.geometry?.getAttribute?.('position');
  const index = mesh.geometry?.index;
  const triangleCount = Math.floor((index?.count || position?.count || 0) / 3);
  if (!position || !triangleCount || triangleCount > 100000) return { area: 0, overhangArea: 0, skipped: triangleCount > 100000 };
  mesh.updateMatrixWorld(true);
  const minY = new THREE.Box3().setFromObject(mesh).min.y;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const ab = new THREE.Vector3();
  const ac = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const threshold = -Math.cos(THREE.MathUtils.degToRad(Math.max(0, Math.min(89, supportAngle))));
  let area = 0;
  let overhangArea = 0;
  const read = (target, sourceIndex) => target.fromBufferAttribute(position, sourceIndex).applyMatrix4(mesh.matrixWorld);
  for (let triangle = 0; triangle < triangleCount; triangle += 1) {
    const base = triangle * 3;
    read(a, index ? index.getX(base) : base);
    read(b, index ? index.getX(base + 1) : base + 1);
    read(c, index ? index.getX(base + 2) : base + 2);
    normal.crossVectors(ab.subVectors(b, a), ac.subVectors(c, a));
    const twiceArea = normal.length();
    if (twiceArea < 1e-8) continue;
    const triangleArea = twiceArea / 2;
    area += triangleArea;
    const averageY = (a.y + b.y + c.y) / 3;
    if (averageY > minY + firstLayerHeight * 1.5 && normal.y / twiceArea < threshold) overhangArea += triangleArea;
  }
  return { area, overhangArea, skipped: false };
}

function meshBedContactStats(mesh, firstLayerHeight) {
  const position = mesh.geometry?.getAttribute?.('position');
  const index = mesh.geometry?.index;
  const triangleCount = Math.floor((index?.count || position?.count || 0) / 3);
  if (!position || !triangleCount || triangleCount > 120000) return { contactArea: 0, sampled: triangleCount > 120000 };
  mesh.updateMatrixWorld(true);
  const minY = new THREE.Box3().setFromObject(mesh).min.y;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  const ab = new THREE.Vector3(), ac = new THREE.Vector3(), normal = new THREE.Vector3();
  const read = (target, sourceIndex) => target.fromBufferAttribute(position, sourceIndex).applyMatrix4(mesh.matrixWorld);
  let contactArea = 0;
  for (let triangle = 0; triangle < triangleCount; triangle += 1) {
    const base = triangle * 3;
    read(a, index ? index.getX(base) : base); read(b, index ? index.getX(base + 1) : base + 1); read(c, index ? index.getX(base + 2) : base + 2);
    const highest = Math.max(a.y, b.y, c.y);
    if (highest > minY + Math.max(0.08, firstLayerHeight * 0.6)) continue;
    normal.crossVectors(ab.subVectors(b, a), ac.subVectors(c, a));
    const twiceArea = normal.length();
    if (twiceArea < 1e-8) continue;
    // Count nearly horizontal first-layer faces regardless of winding.
    if (Math.abs(normal.y / twiceArea) >= 0.72) contactArea += twiceArea / 2;
  }
  return { contactArea, sampled: false };
}

function meshLocalThicknessEstimate(mesh, lineWidth) {
  const position = mesh.geometry?.getAttribute?.('position');
  const index = mesh.geometry?.index;
  const triangleCount = Math.floor((index?.count || position?.count || 0) / 3);
  if (!position || triangleCount < 4 || triangleCount > 30000) return { minimum: Infinity, sampled: triangleCount > 30000, samples: 0 };
  mesh.updateMatrixWorld(true);
  const materialList = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  const oldSides = materialList.map((material) => material?.side);
  for (const material of materialList) if (material) material.side = THREE.DoubleSide;
  const raycaster = new THREE.Raycaster();
  raycaster.near = Math.max(0.035, lineWidth * 0.08);
  raycaster.far = Math.max(4, lineWidth * 20);
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  const ab = new THREE.Vector3(), ac = new THREE.Vector3(), normal = new THREE.Vector3(), centroid = new THREE.Vector3();
  const step = Math.max(1, Math.floor(triangleCount / 36));
  let minimum = Infinity;
  let samples = 0;
  try {
    for (let triangle = 0; triangle < triangleCount && samples < 36; triangle += step) {
      const base = triangle * 3;
      const ia = index ? index.getX(base) : base, ib = index ? index.getX(base + 1) : base + 1, ic = index ? index.getX(base + 2) : base + 2;
      a.fromBufferAttribute(position, ia).applyMatrix4(mesh.matrixWorld);
      b.fromBufferAttribute(position, ib).applyMatrix4(mesh.matrixWorld);
      c.fromBufferAttribute(position, ic).applyMatrix4(mesh.matrixWorld);
      normal.crossVectors(ab.subVectors(b, a), ac.subVectors(c, a));
      if (normal.lengthSq() < 1e-10) continue;
      normal.normalize();
      centroid.copy(a).add(b).add(c).multiplyScalar(1 / 3);
      // Start just outside this face and shoot inward. The near plane skips the source face.
      raycaster.set(centroid.clone().addScaledVector(normal, raycaster.near * 0.5), normal.clone().negate());
      const hits = raycaster.intersectObject(mesh, false).filter((hit) => hit.distance > raycaster.near * 1.2);
      if (hits.length) minimum = Math.min(minimum, hits[0].distance);
      samples += 1;
    }
  } finally {
    materialList.forEach((material, indexValue) => { if (material && oldSides[indexValue] !== undefined) material.side = oldSides[indexValue]; });
  }
  return { minimum, sampled: false, samples };
}

function parameterPrintabilityIssues(values, { lineWidth, nozzle, layerHeight }) {
  const issues = [];
  const entries = Object.entries(values && typeof values === 'object' ? values : {});
  for (const [rawName, rawValue] of entries) {
    const name = String(rawName).toLowerCase();
    const value = Number(rawValue);
    if (!Number.isFinite(value) || value <= 0) continue;
    if (/(wall|shell|thickness|web)/.test(name) && !/(top|bottom|layer)/.test(name) && value < lineWidth * 2 - 1e-6) {
      issues.push({ title: `${rawName} may be too thin`, detail: `${value.toFixed(2)} mm is under two ${lineWidth.toFixed(2)} mm extrusion lines.`, severity: 'warning' });
    }
    if (/(clearance|tolerance|gap|fit)/.test(name) && value < Math.max(0.1, nozzle * 0.22)) {
      issues.push({ title: `${rawName} has very little clearance`, detail: `${value.toFixed(2)} mm may fuse or bind after normal FDM dimensional error.`, severity: 'warning' });
    }
    if (/(hole|bore|socket).*(diam|size|width)|diameter.*(hole|bore)/.test(name) && value < nozzle * 2.2) {
      issues.push({ title: `${rawName} is a very small printed hole`, detail: `${value.toFixed(2)} mm is only ${(value / nozzle).toFixed(1)} nozzle diameters. Expect undersizing or closure without compensation.`, severity: 'warning' });
    }
    if (/(text|font|letter|label).*(size|height)/.test(name) && value < Math.max(2.2, lineWidth * 5)) {
      issues.push({ title: `${rawName} may be hard to print/read`, detail: `${value.toFixed(2)} mm text sizing is close to the selected extrusion scale.`, severity: 'info' });
    }
    if (/(emboss|engrave|text).*(depth|thickness)/.test(name) && value < layerHeight * 2) {
      issues.push({ title: `${rawName} is shallow`, detail: `${value.toFixed(2)} mm is under two ${layerHeight.toFixed(2)} mm layers.`, severity: 'info' });
    }
  }
  return issues.slice(0, 12);
}

function buildPreflightReport({ plateIds = null } = {}) {
  syncActivePlateRuntime();
  const requestedPlateIds = Array.isArray(plateIds) && plateIds.length ? new Set(plateIds.map(String)) : null;
  const printer = activePrinter();
  const halfW = printer.width / 2;
  const halfD = printer.depth / 2;
  const bedTolerance = 0.2;
  const lineWidth = Math.max(0.01, Number(printProfile.settings?.line_width) || printer.nozzle || 0.4);
  const layerHeight = Math.max(0.01, Number(printProfile.settings?.layer_height) || 0.2);
  const firstLayerHeight = Math.max(0.01, Number(printProfile.settings?.initial_layer_print_height) || layerHeight);
  const supportAngle = Number(printProfile.settings?.support_threshold_angle) || 45;
  const supportEnabled = Boolean(printProfile.settings?.enable_support);
  const excluded = excludedRectsForPrinter(printer);
  const limited = nozzleLimitedRectsForPrinter(printer);
  const issues = [];
  const objects = [];

  const addIssue = (severity, plateId, title, detail) => issues.push({ severity, plateId, title, detail });
  for (const [plateId, message] of Object.entries(workspacePrimeTowerErrors)) {
    if (!requestedPlateIds || requestedPlateIds.has(plateId)) addIssue('error', plateId, 'Prime tower needs space', message);
  }
  for (const plate of plates.filter((candidate) => !candidate.assignmentPlaceholder)) {
    for (const record of ensureObjectRecords(plate)) {
      if (requestedPlateIds && !requestedPlateIds.has(String(record.plateId || plate.defaultPlateId || 'A'))) continue;
      const meshes = plate.meshes.filter((mesh) => String(mesh.userData.selectionKey) === String(record.selectionKey));
      if (!meshes.length) {
        addIssue('error', record.plateId, `${record.label} has no generated mesh`, 'Generate this source successfully before export.');
        continue;
      }
      const worldBox = combinedBox(meshes);
      if (!worldBox) continue;
      const layout = plateLayoutForId(record.plateId || plate.defaultPlateId);
      const box = worldBox.clone().translate(new THREE.Vector3(-layout.x, 0, -layout.z));
      const size = box.getSize(new THREE.Vector3());
      const item = { plate, record, meshes, box, size, plateId: record.plateId || plate.defaultPlateId };
      objects.push(item);

      if (box.min.x < -halfW - bedTolerance || box.max.x > halfW + bedTolerance || box.min.z < -halfD - bedTolerance || box.max.z > halfD + bedTolerance) {
        addIssue('error', item.plateId, `${record.label} extends outside the bed`, `${size.x.toFixed(1)} × ${size.z.toFixed(1)} mm footprint · X ${box.min.x.toFixed(1)}…${box.max.x.toFixed(1)} · Y ${box.min.z.toFixed(1)}…${box.max.z.toFixed(1)} mm.`);
      }
      const blocked = excluded.find((rect) => boxIntersectsRect(box, rect));
      if (blocked) addIssue('error', item.plateId, `${record.label} overlaps a no-print area`, blocked.label);
      const nozzleLimited = limited.find((rect) => boxIntersectsRect(box, rect));
      if (nozzleLimited) addIssue('warning', item.plateId, `${record.label} enters a nozzle-limited area`, nozzleLimited.label);
      if (Math.min(size.x, size.z) < lineWidth - 0.001) {
        addIssue('warning', item.plateId, `${record.label} has a sub-line-width footprint`, `Its narrowest overall axis is ${Math.min(size.x, size.z).toFixed(2)} mm; the profile line width is ${lineWidth.toFixed(2)} mm.`);
      }
      if (size.y < layerHeight - 0.001) {
        addIssue('warning', item.plateId, `${record.label} is thinner than one layer`, `${size.y.toFixed(2)} mm high with a ${layerHeight.toFixed(2)} mm layer height.`);
      }

      const parameterValues = record.configuration?.parameters || plate.values || {};
      for (const issue of parameterPrintabilityIssues(parameterValues, { lineWidth, nozzle: Number(printProfile.nozzleDiameter) || printer.nozzle || 0.4, layerHeight })) {
        addIssue(issue.severity, item.plateId, `${record.label}: ${issue.title}`, issue.detail);
      }

      let contactArea = 0;
      let contactSampled = false;
      let localMinimum = Infinity;
      let localThicknessSampled = false;
      for (const mesh of meshes) {
        const contact = meshBedContactStats(mesh, firstLayerHeight);
        contactArea += contact.contactArea;
        contactSampled ||= contact.sampled;
        const thickness = meshLocalThicknessEstimate(mesh, lineWidth);
        localMinimum = Math.min(localMinimum, thickness.minimum);
        localThicknessSampled ||= thickness.sampled;
      }
      const footprintArea = Math.max(0.01, size.x * size.z);
      const contactRatio = contactArea / footprintArea;
      if (!contactSampled && size.y > 8 && contactArea < Math.max(4, footprintArea * 0.012)) {
        addIssue('warning', item.plateId, `${record.label} has limited first-layer contact`, `Estimated horizontal bed contact is ${contactArea.toFixed(1)} mm² (${Math.round(contactRatio * 100)}% of its bounding footprint). Tall/narrow parts may need a brim or a different orientation.`);
      }
      if (!localThicknessSampled && Number.isFinite(localMinimum) && localMinimum < lineWidth * 1.55) {
        addIssue('warning', item.plateId, `${record.label} has a potentially thin local section`, `Sampled opposing surfaces were about ${localMinimum.toFixed(2)} mm apart at the thinnest sample, versus ${lineWidth.toFixed(2)} mm line width. This is a geometric heuristic, not structural simulation.`);
      } else if (localThicknessSampled) {
        addIssue('info', item.plateId, `${record.label} local thickness scan was skipped`, 'The mesh is too dense for the interactive sampled thickness check; export geometry is unchanged.');
      }

      let boundary = 0;
      let nonManifold = 0;
      let topologySkipped = false;
      let totalArea = 0;
      let overhangArea = 0;
      let overhangSkipped = false;
      const topology = meshesTopologyStats(meshes);
      boundary += topology.boundary;
      nonManifold += topology.nonManifold;
      topologySkipped ||= topology.skipped;
      for (const mesh of meshes) {
        const overhang = meshOverhangStats(mesh, supportAngle, firstLayerHeight);
        totalArea += overhang.area;
        overhangArea += overhang.overhangArea;
        overhangSkipped ||= overhang.skipped;
      }
      // Material-grouped 3MF geometry is intentionally split into open surface
      // groups by the loader. Only make a watertightness claim for a single
      // complete mesh; otherwise the result would be a false warning.
      if (meshes.length === 1 && (boundary || nonManifold)) {
        addIssue('warning', item.plateId, `${record.label} may not be watertight`, `${boundary.toLocaleString()} open and ${nonManifold.toLocaleString()} non-manifold mesh edge${boundary + nonManifold === 1 ? '' : 's'} detected.`);
      } else if (meshes.length === 1 && topologySkipped) {
        addIssue('info', item.plateId, `${record.label} topology scan was sampled`, 'The mesh is very dense; bed, spacing, and overhang checks still ran.');
      }
      const overhangRatio = totalArea ? overhangArea / totalArea : 0;
      if (!supportEnabled && !overhangSkipped && overhangArea > 10 && overhangRatio > 0.015) {
        addIssue('warning', item.plateId, `${record.label} may need supports`, `${Math.round(overhangRatio * 100)}% of its surface exceeds the ${supportAngle}° support threshold while supports are disabled.`);
      }
    }
  }

  const checkedPlateIds = requestedPlateIds ? [...requestedPlateIds] : visiblePlateIds();
  for (const plateId of checkedPlateIds) {
    const onPlate = objects.filter((item) => item.plateId === plateId);
    for (let left = 0; left < onPlate.length; left += 1) {
      for (let right = left + 1; right < onPlate.length; right += 1) {
        const a = onPlate[left];
        const b = onPlate[right];
        const dx = Math.max(a.box.min.x - b.box.max.x, b.box.min.x - a.box.max.x, 0);
        const dz = Math.max(a.box.min.z - b.box.max.z, b.box.min.z - a.box.max.z, 0);
        const distance = Math.hypot(dx, dz);
        if (dx === 0 && dz === 0) {
          addIssue('warning', plateId, `${a.record.label} and ${b.record.label} have overlapping footprints`, 'Their bounding footprints intersect. Inspect the plate before printing.');
        } else {
          const selectedNozzle = Number(printProfile.nozzleDiameter) || printer.nozzle || 0.4;
          if (distance < selectedNozzle) addIssue('warning', plateId, `${a.record.label} and ${b.record.label} are tightly spaced`, `${distance.toFixed(2)} mm apart; the selected nozzle is ${selectedNozzle.toFixed(2)} mm.`);
        }
      }
    }
  }

  return { issues, objectCount: objects.length, plateCount: new Set(objects.map((item) => item.plateId)).size, printer };
}

function renderPreflightReport(report) {
  const errors = report.issues.filter((issue) => issue.severity === 'error').length;
  const warnings = report.issues.filter((issue) => issue.severity === 'warning').length;
  preflightScore.className = `preflight-score ${errors ? 'blocked' : warnings ? 'warning' : 'ready'}`;
  preflightScore.textContent = errors ? `${errors} blocking` : warnings ? `${warnings} review` : 'Ready to export';
  preflightSummary.textContent = `${report.objectCount} object${report.objectCount === 1 ? '' : 's'} across ${report.plateCount} plate${report.plateCount === 1 ? '' : 's'} · ${report.printer.shortLabel || report.printer.label}`;
  preflightResults.replaceChildren();
  if (!report.issues.length) {
    const empty = document.createElement('div');
    empty.className = 'preflight-empty';
    empty.innerHTML = '<span>✓</span><div><strong>No checked production blockers found</strong><p>Bed fit, keep-outs, spacing, topology, sampled local thickness, first-layer contact, parameter-scale clearances/text, layer-scale dimensions, and overhang heuristics passed.</p></div>';
    preflightResults.append(empty);
  } else {
    for (const issue of report.issues.sort((a, b) => ['error', 'warning', 'info'].indexOf(a.severity) - ['error', 'warning', 'info'].indexOf(b.severity))) {
      const row = document.createElement('article');
      row.className = `preflight-item ${issue.severity}`;
      const icon = document.createElement('span');
      icon.className = 'preflight-icon';
      icon.textContent = issue.severity === 'error' ? '!' : issue.severity === 'warning' ? '△' : 'i';
      const copy = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = issue.title;
      const detail = document.createElement('p');
      detail.textContent = issue.detail;
      const plate = document.createElement('span');
      plate.className = 'preflight-plate';
      plate.textContent = `Plate ${issue.plateId}`;
      copy.append(title, detail);
      row.append(icon, copy, plate);
      preflightResults.append(row);
    }
  }
  preflightTimestamp.textContent = `Checked ${new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date())}`;
}

async function runPreflight() {
  if (preflightRunning) return;
  preflightRunning = true;
  preflightBtn.disabled = true;
  rerunPreflightBtn.disabled = true;
  preflightScore.className = 'preflight-score';
  preflightScore.textContent = 'Checking…';
  preflightSummary.textContent = 'Generating every changed object before inspection.';
  preflightResults.innerHTML = '<div class="preflight-loading"><i></i><span>Inspecting generated geometry and plate placement…</span></div>';
  try {
    if (!plates.length) throw new Error('Add a SCAD file before checking plates.');
    await generatePendingPreviews({ reason: 'Preparing plate check', throwOnFailure: true });
    renderPreflightReport(buildPreflightReport());
  } catch (error) {
    renderPreflightReport({ issues: [{ severity: 'error', plateId: activeViewPlateId || 'A', title: 'Plate check could not finish', detail: error.message }], objectCount: 0, plateCount: visiblePlateIds().length, printer: activePrinter() });
  } finally {
    preflightRunning = false;
    preflightBtn.disabled = false;
    rerunPreflightBtn.disabled = false;
  }
}

function openPreflight() {
  preflightModal.hidden = false;
  preflightModal.setAttribute('aria-hidden', 'false');
  runPreflight();
}

function closePreflight() {
  preflightModal.hidden = true;
  preflightModal.setAttribute('aria-hidden', 'true');
}

function clearSelectionHelper() {
  requestRender();
  selectionLabelWorld = null;
  selectionLabel.hidden = true;
  if (!selectionHelper) return;
  scene.remove(selectionHelper);
  selectionHelper.traverse((node) => {
    node.geometry?.dispose?.();
    node.material?.map?.dispose?.();
    node.material?.dispose?.();
  });
  selectionHelper = null;
}

function updateSelectionVisuals() {
  clearSelectionHelper();
  selectionLabelWorld = null;
  selectionLabel.hidden = true;
  const batch = allObjectEntries().filter(({ record }) => batchSelectedObjectIds.has(record.id));
  const hasBatch = batch.length > 0;
  const singleSelection = hasBatch || selectedObjectId !== 'all';
  const meshes = [];
  for (const plate of plates) {
    for (const mesh of plate.meshes) {
      const record = plate.objectRecords?.[String(mesh.userData.selectionKey)];
      const selected = hasBatch ? batchSelectedObjectIds.has(record?.id) && !record?.deleted
        : plate === activePlate() && (!singleSelection || String(mesh.userData.selectionKey) === String(selectedObjectId));
      if (selected && mesh.visible) meshes.push(mesh);
      const color = new THREE.Color(mesh.userData.hexColor || '#D9DDE5');
      if (singleSelection && !selected && (hasBatch || plate === activePlate())) color.multiplyScalar(0.42);
      mesh.material.color.copy(color);
      mesh.material.emissive.set(selected && singleSelection ? renderAppearance.accent : 0x000000).multiplyScalar(0.08);
      mesh.material.emissiveIntensity = selected && singleSelection ? 0.18 : 0;
      mesh.material.opacity = 1;
      mesh.material.transparent = false;
      mesh.material.depthWrite = true;
    }
  }

  const box = combinedBox(meshes);
  if (!box) return;

  // Outline every colored child of every selected logical object.
  // This highlights the real shape instead of drawing a misleading bounding box.
  if (singleSelection) {
    const group = new THREE.Group();
    for (const mesh of meshes) {
      const edges = new THREE.EdgesGeometry(mesh.geometry, 28);
      const material = new THREE.LineBasicMaterial({
        color: renderAppearance.accent,
        transparent: true,
        opacity: 0.98,
        depthTest: false,
        depthWrite: false
      });
      const outline = new THREE.LineSegments(edges, material);
      outline.position.copy(mesh.position);
      outline.quaternion.copy(mesh.quaternion);
      outline.scale.copy(mesh.scale);
      outline.renderOrder = 1000;
      group.add(outline);
    }
    selectionHelper = group;
    scene.add(selectionHelper);
  }

  const size = box.getSize(new THREE.Vector3());
  if (singleSelection) {
    const group = logicalGroupForSelection();
    const record = objectRecordForSelection(activePlate(), selectedObjectId);
    const offset = storedObjectOffset(selectedObjectId);
    selectionLabelName.textContent = group?.defs?.[0]?.label || record?.label || 'Selected object';
    selectionLabelDimensions.textContent = `Plate ${currentObjectPlate(record)}${record?.moved_plate?` · from ${record.originalPlateId}`:''} · X ${offset.x.toFixed(1)} · Y ${offset.z.toFixed(1)}`;
    if (batch.length > 1) {
      selectionLabelName.textContent = `${batch.length} objects selected`;
      const ids = [...new Set(batch.map(({ plate, record }) => currentObjectPlate(record, plate.defaultPlateId)))].sort();
      selectionLabelDimensions.textContent = `${ids.length === 1 ? 'Plate' : 'Plates'} ${ids.join(', ')}`;
    }
    selectionLabelWorld = new THREE.Vector3(
      (box.min.x + box.max.x) / 2,
      box.max.y + Math.max(2, size.y * 0.08),
      (box.min.z + box.max.z) / 2
    );
    updateSelectionLabelPosition();
  }
  updatePlateFitStatus();
}

function fitBox(box, multiplier = 1.55) {
  if (!box || box.isEmpty()) return;
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 1);
  const fov = camera.fov * Math.PI / 180;
  const distance = (maxDim / (2 * Math.tan(fov / 2))) * multiplier;
  camera.position.set(center.x + distance * 0.85, center.y + distance * 0.75, center.z + distance * 0.85);
  camera.near = Math.max(0.01, distance / 1000);
  camera.far = Math.max(1000, distance * 100);
  camera.updateProjectionMatrix();
  controls.target.copy(center);
  controls.update();
}

function fitModel() {
  const meshes = selectedMeshes();
  fitBox(combinedBox(meshes.length ? meshes : currentMeshes), 1.55);
}

function fitPlate() {
  const printer = activePrinter();
  const plate = activePlate();
  const offset = plate?.layoutOffset || { x: 0, z: 0 };
  const plateY = plate?.referenceGroup?.position.y ?? -0.15;
  const fov = camera.fov * Math.PI / 180;
  const verticalSpan = Math.max(printer.depth, printer.width / Math.max(camera.aspect, 0.1));
  const distance = (verticalSpan / (2 * Math.tan(fov / 2))) * 1.16;
  const top = Math.max(plateY + distance, (combinedBox(currentMeshes)?.max.y || 0) + 24);
  camera.position.set(offset.x, top, offset.z + 0.001);
  camera.near = Math.max(0.01, distance / 1000);
  camera.far = Math.max(1000, distance * 100);
  camera.updateProjectionMatrix();
  controls.target.set(offset.x, plateY, offset.z);
  controls.update();
}

function fitAllPlates() {
  const ids = visiblePlateIds();
  if (!ids.length) return;
  const printer = activePrinter();
  const bounds = new THREE.Box3();
  for (const id of ids) {
    const offset = plateLayoutForId(id);
    bounds.expandByPoint(new THREE.Vector3(offset.x - printer.width / 2, -0.15, offset.z - printer.depth / 2));
    bounds.expandByPoint(new THREE.Vector3(offset.x + printer.width / 2, -0.15, offset.z + printer.depth / 2));
  }
  for (const plate of plates) for (const mesh of plate.meshes) bounds.expandByObject(mesh);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const verticalSpan = Math.max(size.z, size.x / Math.max(camera.aspect, 0.1), 1);
  const distance = (verticalSpan / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2))) * 1.12;
  camera.position.set(center.x, center.y + distance, center.z + 0.001);
  camera.near = Math.max(0.01, distance / 1000);
  camera.far = Math.max(1000, distance * 100);
  camera.updateProjectionMatrix();
  controls.target.copy(center);
  controls.update();
}

function centerPlateInView(plate = activePlate()) {
  if (!plate) return;
  centerPlateIdInView(plate.defaultPlateId);
}

function centerPlateIdInView(plateId) {
  const offset = plateLayoutForId(plateId);
  const deltaX = offset.x - controls.target.x;
  const deltaZ = offset.z - controls.target.z;
  camera.position.x += deltaX;
  camera.position.z += deltaZ;
  controls.target.x = offset.x;
  controls.target.z = offset.z;
  controls.update();
}

function colorHexForName(name, fallback = '#D9DDE5') {
  const value = String(name ?? '').trim();
  if (/^#[0-9a-f]{6}$/i.test(value)) return value.toUpperCase();
  return FILAMENT_HEX[value] || fallback;
}

function resolvedSymbolTopColor(id, values, symbolType) {
  const setting = String(values[`design${id}_symbol_top_color_preview`] ?? 'Default');
  if (setting === 'None') return 'None';
  if (setting !== 'Default') return setting;
  return symbolType === 'Heart'
    ? String(values[`design${id}_text_color_preview`] ?? 'White')
    : 'Sunshine Yellow';
}

function objectColorParts(def, values) {
  const id = Number(def.id);
  const baseKey = `design${id}_base_color_preview`;
  if (!Object.hasOwn(values, baseKey)) return null;

  const base = String(values[baseKey] ?? 'White');
  const shadow = String(values[`design${id}_shadow_color_preview`] ?? 'White');
  const text = String(values[`design${id}_text_color_preview`] ?? 'White');
  const symbolType = String(values[`design${id}_inline_symbol_type`] ?? 'None');
  const symbolActive = symbolType !== 'None';
  const symbolShadow = String(values[`design${id}_symbol_shadow_color_preview`] ?? shadow);
  const symbolTop = resolvedSymbolTopColor(id, values, symbolType);

  const spec = (part, label, colorName) => ({ part, label, colorName, hex: colorHexForName(colorName) });
  const basePart = spec('base', 'Base', base);
  const tagShadowPart = shadow !== 'None' ? spec('tag_shadow', 'Shadow', shadow) : null;
  const textPart = spec('tag_text', 'Text', text);
  const symbolBasePart = symbolActive ? spec('symbol_base', 'Symbol base', base) : null;
  const symbolShadowPart = symbolActive ? spec('symbol_shadow', 'Symbol shadow', symbolShadow) : null;
  const symbolTopPart = symbolActive && symbolTop !== 'None' && symbolType !== 'Treble Clef'
    ? spec('symbol_top', 'Symbol top', symbolTop)
    : null;

  const requested = String(values.render_part ?? 'all');
  if (requested === 'base') return [basePart];
  if (requested === 'shadow') return [tagShadowPart, symbolShadowPart].filter(Boolean);
  if (requested === 'text') return [textPart, symbolTopPart].filter(Boolean);
  if (requested === 'symbol_all') return [symbolBasePart, symbolShadowPart, symbolTopPart].filter(Boolean);
  if (requested === 'symbol_base') return [symbolBasePart].filter(Boolean);
  if (requested === 'symbol_shadow') return [symbolShadowPart].filter(Boolean);
  if (requested === 'symbol_top') return [symbolTopPart].filter(Boolean);

  // Full model: Base already includes the symbol's base footprint.
  return [basePart, tagShadowPart, textPart, symbolShadowPart, symbolTopPart].filter(Boolean);
}

function colorDistance(left, right) {
  const a = new THREE.Color(left);
  const b = new THREE.Color(right);
  return Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b);
}

function sliceGeometry(source, start, count) {
  const geometry = new THREE.BufferGeometry();
  for (const [name, attribute] of Object.entries(source.attributes)) {
    if (attribute.isInterleavedBufferAttribute) continue;
    const begin = start * attribute.itemSize;
    const end = (start + count) * attribute.itemSize;
    const values = attribute.array.slice(begin, end);
    geometry.setAttribute(name, new THREE.BufferAttribute(values, attribute.itemSize, attribute.normalized));
  }
  if (!geometry.getAttribute('normal')) geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  return geometry;
}

function createMeshesFrom3mf(arrayBuffer, def, values) {
  const root3mf = new ThreeMFLoader().parse(arrayBuffer);
  root3mf.updateMatrixWorld(true);
  const expectedParts = objectColorParts(def, values) || [];
  const meshes = [];
  let sourceIndex = 0;

  root3mf.traverse((source) => {
    if (!source.isMesh || !source.geometry) return;
    const flattened = source.geometry.index ? source.geometry.toNonIndexed() : source.geometry.clone();
    flattened.applyMatrix4(source.matrixWorld);
    const materials = Array.isArray(source.material) ? source.material : [source.material];
    const groups = flattened.groups.length
      ? flattened.groups
      : [{ start: 0, count: flattened.getAttribute('position')?.count || 0, materialIndex: 0 }];
    let reusedFlattened = false;

    for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
      const group = groups[groupIndex];
      if (!group.count) continue;
      const sourceMaterial = materials[group.materialIndex] || materials[0];
      const materialHex = sourceMaterial?.color ? `#${sourceMaterial.color.getHexString().toUpperCase()}` : '#D9DDE5';
      const part = expectedParts.length
        ? expectedParts.reduce((best, candidate) => (
          !best || colorDistance(materialHex, candidate.hex) < colorDistance(materialHex, best.hex) ? candidate : best
        ), null)
        : null;
      // The usual single-material solid already owns exactly the needed arrays.
      const geometry = groups.length === 1 && group.start === 0 && group.count === flattened.getAttribute('position').count
        ? flattened : sliceGeometry(flattened, group.start, group.count);
      reusedFlattened ||= geometry === flattened;
      if (!geometry.getAttribute('normal')) geometry.computeVertexNormals();
      if (!geometry.boundingBox) geometry.computeBoundingBox();
      const hex = part?.hex || materialHex;
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(hex),
        roughness: 0.48,
        metalness: 0.025
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.userData.objectId = def.id;
      mesh.userData.plateKey = activePlate()?.key || null;
      const logical = logicalGroupForObjectId(def.id);
      mesh.userData.selectionKey = logical ? selectionKeyForGroup(logical) : String(def.id);
      mesh.userData.part = part?.part || `material_${sourceIndex}_${groupIndex}`;
      mesh.userData.partLabel = part?.label || `Color ${groupIndex + 1}`;
      mesh.userData.colorName = part?.colorName || null;
      mesh.userData.hexColor = hex.toUpperCase();
      mesh.userData.generatedPosition = { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z };
      applyStoredTransform(mesh);
      meshes.push(mesh);
    }
    if (!reusedFlattened) flattened.dispose();
    sourceIndex += 1;
  });
  return meshes;
}

async function fetchStl(url, values, signal, modelId = activePlate()?.modelId || 'default', extraBody = {}) {
  const sourcePlate = plates.find((plate) => plate.modelId === modelId && plate.source);
  const response = await appFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ values, modelId, source: sourcePlate?.source, sourceName: sourcePlate?.sourceName || sourcePlate?.name, packageId: sourcePlate?.packageId, packageEntry: sourcePlate?.packageEntry, ...extraBody }),
    signal
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `Render failed (${response.status})`);
  }
  return response.arrayBuffer();
}

function changedValueKeys(previous, next) {
  if (!previous) return Object.keys(next);
  const keys = new Set([...Object.keys(previous), ...Object.keys(next)]);
  return [...keys].filter((key) => JSON.stringify(previous[key]) !== JSON.stringify(next[key]));
}

function applyColorOnlyPreview(values, changedKeys) {
  if (!currentMeshes.length) return false;
  const affectedIds = new Set(changedKeys.map((key) => key.match(/^design(\d+)_/)?.[1]).filter(Boolean));
  if (!affectedIds.size) return false;
  const defs = activeObjectDefs(values).filter((def) => affectedIds.has(String(def.id)));
  if (defs.length !== affectedIds.size) return false;

  const updates = [];
  for (const def of defs) {
    const parts = objectColorParts(def, values);
    if (!parts) return false;
    const meshes = currentMeshes.filter((mesh) => String(mesh.userData.objectId) === String(def.id));
    const expectedParts = parts.map((part) => part.part).sort();
    const actualParts = meshes.map((mesh) => mesh.userData.part).sort();
    if (JSON.stringify(expectedParts) !== JSON.stringify(actualParts)) return false;
    for (const part of parts) {
      const mesh = meshes.find((item) => item.userData.part === part.part);
      if (!mesh) return false;
      updates.push({ mesh, part });
    }
  }

  for (const { mesh, part } of updates) {
    mesh.userData.partLabel = part.label;
    mesh.userData.colorName = part.colorName;
    mesh.userData.hexColor = part.hex.toUpperCase();
  }
  updateSelectionVisuals();
  return true;
}

async function runRenderJobs(jobs, signal, progressLabel = 'Generating preview', silent = false) {
  const results = new Array(jobs.length);
  let nextIndex = 0;
  let complete = 0;
  const hardwareThreads = Math.max(2, Number(navigator.hardwareConcurrency) || 4);
  // Match the server's weighted OpenSCAD capacity instead of flooding it with
  // a dozen HTTP requests that only sit queued while Manifold already uses
  // multiple CPU cores per render.
  const localHint = Math.max(1, Math.min(4, Math.floor(hardwareThreads / 4) || 1));
  const workerCount = Math.max(1, Math.min(jobs.length, runtimeRenderSlots || localHint));
  const updateProgress = () => {
    const text = jobs.length > 1 ? `${progressLabel}… ${complete}/${jobs.length}` : `${progressLabel}…`;
    if (!silent) viewerMessage.textContent = text;
    if (!silent && bulkPreviewProgress) {
      bulkPreviewProgress.currentObject = complete;
      bulkPreviewProgress.totalObjects = jobs.length;
      bulkPreviewProgress.text = text;
      setStatus(text);
    }
  };
  updateProgress();
  async function worker() {
    while (nextIndex < jobs.length) {
      if (signal.aborted) throw new DOMException('Render cancelled.', 'AbortError');
      const index = nextIndex++;
      results[index] = await jobs[index]();
      complete += 1;
      updateProgress();
    }
  }
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

async function generatePreview({ manageButton = true, progressLabel = '', silent = false, prefetch = null } = {}) {
  const plate = activePlate();
  if (!plate || plate.rendering) return;
  plate.assignmentPlaceholder = false;
  if (previewController) previewController.abort();
  const controller = new AbortController();
  const cancelPrefetch = () => { void prefetch?.close(); };
  controller.signal.addEventListener('abort', cancelPrefetch, { once: true });
  const renderToken = ++plate.renderToken;
  previewController = controller;
  if (manageButton) { generateBtn.disabled = true; generateBtn.textContent = 'Generating…'; }
  generateBtn.classList.remove('dirty');
  const values = getValues();
  plate.values = structuredClone(values);
  plate.objectDefs ||= objectDefs;
  const targets = objectRenderTargets(plate, values);
  const pending = pendingObjectRenderTargets(plate, targets);
  const snapshot = objectRenderSnapshot(targets);
  plate.renderingValues = structuredClone(values);
  plate.renderingObjectSnapshot = snapshot;
  plate.rendering = true;
  plate.error = null;
  if (!silent && pending.length) {
    viewerMessage.classList.add('generating'); generateBtn.classList.add('generating');
    generateBtn.setAttribute('aria-busy', 'true');
    // Keep the rest of the plate visible while replacing only the changed objects.
    viewerMessage.hidden = currentMeshes.length > 0;
    viewerMessage.textContent = progressLabel || 'Updating objects…';
    setStatus(progressLabel || `Updating ${pending.length} object${pending.length === 1 ? '' : 's'}…`);
  }
  renderPlateList();
  updateObjectMenu();
  let stagedMeshes = [];
  try {
    if (!pending.length) { viewerMessage.hidden = currentMeshes.length > 0; plate.batchDirty = false; return; }
    const changedKeys = changedValueKeys(lastGeneratedValues, values);
    const colorsOnly = changedKeys.length > 0 && changedKeys.every(key => /_color_preview$/.test(key));
    if (colorsOnly && !plate.batchDirty && !(plate.batchInstances || []).length
      && !Object.values(plate.objectRecords || {}).some(record => Object.keys(record.parameterOverrides || {}).length)
      && applyColorOnlyPreview(values, changedKeys)) {
      plate.renderStates ||= {};
      for (const target of targets) plate.renderStates[target.key] = { signature: target.signature, values: structuredClone(target.values), empty: !currentMeshes.some(mesh => String(mesh.userData.selectionKey) === target.key) };
      lastGeneratedValues = structuredClone(values); plate.lastGeneratedValues = structuredClone(values);
      ensureObjectRecords(plate, { captureConfiguration: true });
      const towerWarning=refreshWorkspacePrimeTowers();
      applyBatchPlateVisibility();
      viewerMessage.hidden = currentMeshes.length > 0; setStatus(towerWarning || 'Colors updated instantly.',Boolean(towerWarning));
      return;
    }
    const requests = new Map();
    for (const target of pending) for (const def of target.defs) {
      const key = `${target.signature}:${def.id}`;
      if (!requests.has(key)) requests.set(key, { def, target, data: null });
    }
    let prefetched = await prefetch?.read(plate.key, snapshot);
    if (prefetched && [...requests.keys()].some(key => !prefetched.has(key))) {
      await prefetch.close();
      prefetched = null;
    }
    controller.signal.throwIfAborted();
    await runRenderJobs([...requests.values()].map(request => async () => {
      const url = request.def.id === 'model' ? '/api/export?format=3mf&preview=1'
        : `/api/render-object?id=${encodeURIComponent(request.def.id)}&format=3mf&preview=1`;
      request.data = prefetched
        ? await prefetched.get(`${request.target.signature}:${request.def.id}`)
        : await fetchStl(url, request.target.values, controller.signal, plate.modelId,
          { source: plate.source, sourceName: plate.sourceName || plate.name, packageId: plate.packageId, packageEntry: plate.packageEntry });
      return request;
    }), controller.signal, progressLabel || 'Updating objects', silent);
    if (controller.signal.aborted || activePlateKey !== plate.key || plate.renderToken !== renderToken) return;
    const currentTargets = objectRenderTargets(plate, getValues());
    if (objectRenderSnapshot(currentTargets) !== snapshot) { bulkPreviewRerunRequested = true; return { superseded: true }; }
    for (const target of pending) for (const def of target.defs) {
      const request = requests.get(`${target.signature}:${def.id}`);
      const data = request.data;
      if (!data.byteLength) continue;
      // Decode each response once. Copies keep independent geometry, materials,
      // transforms and disposal, without repeating ZIP/XML parsing and meshing.
      const meshes = request.meshes ? request.meshes.map(source => {
        const mesh = source.clone();
        mesh.geometry = source.geometry.clone();
        mesh.material = source.material.clone();
        return mesh;
      }) : (request.meshes = createMeshesFrom3mf(data, def, target.values));
      for (const mesh of meshes) {
        mesh.userData.selectionKey = target.key;
        mesh.userData.plateKey = plate.key;
        if (target.instance) mesh.userData.instanceId = target.instance.id;
        if (typeof applyStoredTransform === 'function') applyStoredTransform(mesh, plate);
        stagedMeshes.push(mesh);
      }
    }
    // All members of each changed object commit together. Unchanged meshes keep
    // their identities and transforms; failed/stale jobs leave the scene intact.
    const replaced = new Set(pending.map(target => target.key));
    const live = new Set(targets.map(target => target.key));
    const retained = currentMeshes.filter(mesh => live.has(String(mesh.userData.selectionKey)) && !replaced.has(String(mesh.userData.selectionKey)));
    for (const mesh of currentMeshes) if (!retained.includes(mesh)) {
      scene.remove(mesh); mesh.geometry.dispose();
      for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) material.dispose();
    }
    const emptySelectionKeys = new Set(plate.emptySelectionKeys || []);
    for (const key of emptySelectionKeys) if (!live.has(key)) emptySelectionKeys.delete(key);
    plate.renderStates ||= {};
    for (const target of pending) {
      const empty = !stagedMeshes.some(mesh => String(mesh.userData.selectionKey) === target.key);
      if (empty) emptySelectionKeys.add(target.key); else emptySelectionKeys.delete(target.key);
      plate.renderStates[target.key] = { signature: target.signature, values: structuredClone(target.values), revision: target.revision, empty };
    }
    plate.emptySelectionKeys = emptySelectionKeys;
    for (const mesh of stagedMeshes) scene.add(mesh);
    currentMeshes = [...retained, ...stagedMeshes]; plate.meshes = currentMeshes; stagedMeshes = [];
    if (selectedObjectId !== 'all' && !selectedMeshes().length) {
      const onlyPhysicalIds = [...new Set(currentMeshes.map(mesh => Number(mesh.userData.objectId)))];
      const onlyGroup = onlyPhysicalIds.length ? logicalGroupForObjectId(onlyPhysicalIds[0]) : null;
      selectedObjectId = onlyGroup && logicalObjectGroups().length === 1 ? selectionKeyForGroup(onlyGroup) : 'all';
      setFormValues(selectedObjectId === 'all' ? values : effectiveObjectValues(plate, selectedObjectId));
    }
    lastGeneratedValues = structuredClone(values); plate.lastGeneratedValues = structuredClone(values);
    plate.batchDirty = false;
    ensureObjectRecords(plate, { captureConfiguration: true, generatedKeys: replaced });
    updatePlatePosition(); updateSelectionVisuals(); firstPreview = false;
    let placementWarning = '';
    try { autoPositionOriginDesigns(plate); } catch (error) { placementWarning = `Preview ready. Auto position: ${error.message}`; }
    if (typeof refreshWorkspacePrimeTowers === 'function') {
      const towerWarning = refreshWorkspacePrimeTowers();
      placementWarning ||= towerWarning;
    }
    applyBatchPlateVisibility(); renderWorkflowUi();
    viewerMessage.hidden = currentMeshes.length > 0;
    if (!currentMeshes.length) {
      plate.error = 'No active designs produced printable geometry. Check the enabled designs and their settings.';
      viewerMessage.textContent = plate.error; setStatus(plate.error, true);
    } else if (placementWarning) setStatus(placementWarning, true);
    else if (!silent) setStatus(`${pending.length} object${pending.length === 1 ? '' : 's'} updated.`);
  } catch (error) {
    if (error.name === 'AbortError') return { superseded: true };
    if (activePlateKey !== plate.key || plate.renderToken !== renderToken) return;
    plate.error = error.message;
    viewerMessage.hidden = currentMeshes.length > 0;
    viewerMessage.textContent = error.message; setStatus(error.message, true);
  } finally {
    controller.signal.removeEventListener('abort', cancelPrefetch);
    for (const mesh of stagedMeshes) { mesh.geometry.dispose(); for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) material.dispose(); }
    if (previewController === controller) {
      previewController = null;
      if (manageButton) { generateBtn.disabled = false; generateBtn.textContent = 'Generate all'; }
    }
    if (plate.renderToken === renderToken) {
      plate.rendering = false; plate.renderingValues = null; plate.renderingObjectSnapshot = null;
      if (plate.key === activePlateKey) syncActivePlateRuntime();
      persistUploadedPlates(); renderPlateList();
    }
  }
}

function plateNeedsGeneration(plate) {
  return !plate.assignmentPlaceholder && pendingObjectRenderTargets(plate,
    objectRenderTargets(plate, plate.values)).length > 0;
}

async function runPendingPreviewGeneration({ reason = 'Generating previews', throwOnFailure = false, silent = false, plateKeys = null } = {}) {
  syncActivePlateRuntime();
  const requestedPlateKeys = Array.isArray(plateKeys) && plateKeys.length ? new Set(plateKeys.map(String)) : null;
  const pending = plates.filter((plate) => plateNeedsGeneration(plate) && (!requestedPlateKeys || requestedPlateKeys.has(String(plate.key))));
  // Show the plate the user opened before processing the remaining plates.
  pending.sort((a, b) => Number(b.key === activePlateKey) - Number(a.key === activePlateKey));
  bulkPreviewPendingKeys = new Set(pending.map((plate) => plate.key));
  if (!pending.length) {
    const towerWarning=refreshWorkspacePrimeTowers();
    applyBatchPlateVisibility();
    if (towerWarning || !silent) setStatus(towerWarning || 'Every plate preview is already up to date.',Boolean(towerWarning));
    return { generated: 0, failures: [] };
  }

  const originalKey = activePlateKey;
  const failures = [];
  let generated = 0;
  generateBtn.disabled = true;
  const prefetch = new PreviewPrefetch(pending.map(plate => {
    const targets = objectRenderTargets(plate, plate.values);
    const jobs = new Map();
    const changed = changedValueKeys(plate.lastGeneratedValues, plate.values);
    const mayRecolor = plate.meshes.length && changed.length && changed.every(key => /_color_preview$/.test(key));
    const body = { source: plate.source, sourceName: plate.sourceName || plate.name, packageId: plate.packageId, packageEntry: plate.packageEntry };
    const modelId = plate.modelId;
    for (const target of mayRecolor ? [] : pendingObjectRenderTargets(plate, targets)) for (const def of target.defs) {
      const key = `${target.signature}:${def.id}`;
      if (jobs.has(key)) continue;
      const url = def.id === 'model' ? '/api/export?format=3mf&preview=1'
        : `/api/render-object?id=${encodeURIComponent(def.id)}&format=3mf&preview=1`;
      jobs.set(key, { key, run: signal => fetchStl(url, target.values, signal, modelId, body) });
    }
    return { key: plate.key, signature: objectRenderSnapshot(targets), jobs: [...jobs.values()] };
  }), runtimeRenderSlots);
  try {
    for (let index = 0; index < pending.length; index += 1) {
      if (autoRegenerateTimer !== null) break;
      const plate = pending[index];
      if (!plates.includes(plate)) { await prefetch.release(plate.key); continue; }
      switchPlate(plate.key, { generateIfEmpty: false, focus: false, preserveView: true });
      const allPlateIds = [...new Set(plates.filter((candidate) => !candidate.assignmentPlaceholder).map((candidate) => candidate.defaultPlateId))];
      const plateNumber = Math.max(1, allPlateIds.indexOf(plate.defaultPlateId) + 1);
      const progressLabel = `Plate ${plate.defaultPlateId} · ${plateNumber}/${Math.max(1, allPlateIds.length)}`;
      const progressText = `${progressLabel}…`;
      if (!silent) {
        bulkPreviewProgress = { plateKey: plate.key, currentObject: 0, totalObjects: 0, text: progressText };
        generateBtn.textContent = `Generating ${plate.defaultPlateId}…`;
        setStatus(progressText);
      }
      const result = await generatePreview({ manageButton: false, progressLabel, silent, prefetch });
      await prefetch.release(plate.key);
      bulkPreviewPendingKeys.delete(plate.key);
      if (result?.superseded) continue;
      if (plate.error || !plate.meshes.length) failures.push(plate);
      else generated += 1;
    }
  } finally {
    await prefetch.close();
    if (originalKey && plates.some((plate) => plate.key === originalKey)) {
      switchPlate(originalKey, { generateIfEmpty: false, focus: false, preserveView: true });
    }
    bulkPreviewProgress = null;
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate all';
  }

  if (autoRegenerateTimer !== null) return { generated, failures };
  if (failures.length) {
    const names = failures.map((plate) => `${plate.name}${plate.error ? `: ${plate.error}` : ': no visible geometry'}`).join(', ');
    const error = new Error(`${generated} preview${generated === 1 ? '' : 's'} generated; ${failures.length} failed: ${names}.`);
    setStatus(error.message, true);
    if (throwOnFailure) throw error;
  } else {
    const towerWarning=refreshWorkspacePrimeTowers();
    applyBatchPlateVisibility();
    if (towerWarning || !silent) setStatus(towerWarning || `${generated} plate preview${generated === 1 ? '' : 's'} generated. Every plate is up to date.`,Boolean(towerWarning));
  }
  return { generated, failures };
}

async function generatePendingPreviews(options = {}) {
  clearTimeout(autoRegenerateTimer);
  autoRegenerateTimer = null;
  const ruleFailures = parametricRuleFailures();
  if (ruleFailures.length) {
    renderParametricRulesState();
    setStatus(`Rule: ${ruleFailures[0]}`, true);
    if (options.throwOnFailure) throw new Error(ruleFailures[0]);
    return { generated: 0, failures: [{ name: 'Rules', error: ruleFailures[0] }] };
  }
  if (bulkPreviewGenerationPromise) {
    const needsFreshPass = plates.some((plate) => {
      if (plate.rendering) return plate.renderingObjectSnapshot
        ? objectRenderSnapshot(objectRenderTargets(plate, plate.values)) !== plate.renderingObjectSnapshot
        : JSON.stringify(plate.values) !== JSON.stringify(plate.renderingValues);
      return !bulkPreviewPendingKeys.has(plate.key) && plateNeedsGeneration(plate);
    });
    if (!needsFreshPass) return bulkPreviewGenerationPromise;
    bulkPreviewRerunRequested = true;
    const plate = activePlate();
    if (plate?.rendering && (plate.renderingObjectSnapshot
      ? objectRenderSnapshot(objectRenderTargets(plate, plate.values)) !== plate.renderingObjectSnapshot
      : JSON.stringify(plate.values) !== JSON.stringify(plate.renderingValues))) previewController?.abort();
    const mergedPlateKeys = [...new Set([...(bulkPreviewNextOptions?.plateKeys || []), ...(options.plateKeys || [])])];
    bulkPreviewNextOptions = {
      reason: options.reason || bulkPreviewNextOptions?.reason || '',
      throwOnFailure: Boolean(options.throwOnFailure || bulkPreviewNextOptions?.throwOnFailure),
      silent: Boolean(options.silent && (bulkPreviewNextOptions?.silent ?? true)),
      plateKeys: mergedPlateKeys.length ? mergedPlateKeys : null
    };
    return bulkPreviewGenerationPromise;
  }
  const running = (async () => {
    let passOptions = options;
    let result = { generated: 0, failures: [] };
    do {
      bulkPreviewRerunRequested = false;
      result = await runPendingPreviewGeneration(passOptions);
      passOptions = bulkPreviewNextOptions || options;
      bulkPreviewNextOptions = null;
    } while (bulkPreviewRerunRequested && autoRegenerateTimer === null);
    return result;
  })();
  bulkPreviewGenerationPromise = running;
  try {
    return await running;
  } finally {
    if (bulkPreviewGenerationPromise === running) {
      bulkPreviewGenerationPromise = null;
      bulkPreviewRerunRequested = false;
      bulkPreviewNextOptions = null;
      bulkPreviewPendingKeys.clear();
      viewerMessage.classList.remove('generating');
      generateBtn.classList.remove('generating');
      generateBtn.removeAttribute('aria-busy');
    }
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function normalizedAdvanced() {
  const text = advancedJson.value.trim();
  if (!text) return {};
  const value = JSON.parse(text);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Advanced profile values must be a JSON object.');
  return value;
}

function parseRawSetting(text) {
  const trimmed = String(text ?? '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try { return JSON.parse(trimmed); } catch { return trimmed; }
  }
  return trimmed;
}

function getPrintProfileFromUi() {
  const profile = printProfileSnapshotFromUi();
  const nozzleDiameter = profile.nozzleDiameter;
  const { min, max } = layerHeightBounds(nozzleDiameter);
  const layerHeight = Number(profile.settings.layer_height);
  if (!Number.isFinite(layerHeight) || layerHeight < min || layerHeight > max) {
    throw new Error(layerHeightRangeError(layerHeight, nozzleDiameter));
  }
  return profile;
}

function printProfileSnapshotFromUi() {
  if (printSettingsScope === 'global') syncGlobalPrintProfileFromUi();
  const settings = structuredClone(printProfile.settings);
  const nozzleDiameter = Number(nozzleDiameterSelect.value) || 0.4;
  let advanced = structuredClone(printProfile.advanced || {});
  try { advanced = normalizedAdvanced(); } catch {}
  return {
    version: 6,
    name: profileName.value.trim() || 'My Print Profile',
    printer: printerSelect.value,
    nozzleDiameter,
    bedType: bedTypeSelect.value,
    filamentColor: printProfile.filamentColor || '#D9DDE5',
    settings,
    advanced
  };
}

function usedExportPlateIds() {
  const ids = new Set();
  for (const plate of plates) for (const record of ensureObjectRecords(plate)) ids.add(String(record.plateId || plate.defaultPlateId || 'A'));
  return [...ids].filter((id) => PLATE_IDS.includes(id)).sort((a, b) => PLATE_IDS.indexOf(a) - PLATE_IDS.indexOf(b));
}

function sourceKeysForExportPlateIds(plateIds) {
  const wanted = new Set(plateIds.map(String));
  return plates.filter((plate) => ensureObjectRecords(plate).some((record) => wanted.has(String(record.plateId || plate.defaultPlateId || 'A')))).map((plate) => plate.key);
}

async function ensurePlatePreviews(plateIds = null) {
  if (!plates.length) throw new Error('Add at least one SCAD plate before exporting.');
  const selected = Array.isArray(plateIds) && plateIds.length ? plateIds : usedExportPlateIds();
  if (!selected.length) throw new Error('There are no populated plates to export.');
  const plateKeys = sourceKeysForExportPlateIds(selected);
  await generatePendingPreviews({ reason: selected.length === usedExportPlateIds().length ? 'Preparing plates for export' : 'Preparing selected plates for export', throwOnFailure: true, plateKeys });
}

function renderExportPlateOptions({ reset = false } = {}) {
  const ids = usedExportPlateIds();
  const counts = Object.fromEntries(ids.map((id) => [id, 0]));
  for (const { plate, record } of allObjectEntries()) {
    const id = String(record.plateId || plate.defaultPlateId || 'A');
    if (id in counts) counts[id] += 1;
  }
  const existing = new Set([...exportPlateOptions.querySelectorAll('input:checked')].map((input) => input.value));
  exportPlateOptions.replaceChildren();
  if (!ids.length) {
    const empty = document.createElement('div'); empty.className = 'export-plate-empty'; empty.textContent = 'No populated plates yet.'; exportPlateOptions.append(empty); return;
  }
  const active = ids.includes(activeViewPlateId) ? activeViewPlateId : ids[0];
  for (const id of ids) {
    const row = document.createElement('label'); row.className = 'export-plate-option';
    const input = document.createElement('input'); input.type = 'checkbox'; input.value = id;
    input.checked = reset ? id === active : (existing.size ? existing.has(id) : id === active);
    const chip = document.createElement('span'); chip.className = 'plate-chip'; chip.textContent = id;
    const copy = document.createElement('span'); copy.className = 'export-plate-copy';
    const name = document.createElement('strong'); name.textContent = batchPlateMeta[id]?.name || `Plate ${id}`;
    const count = document.createElement('small'); count.textContent = `${counts[id]} object${counts[id] === 1 ? '' : 's'}`;
    copy.append(name, count); row.append(input, chip, copy); exportPlateOptions.append(row);
  }
}

function showExportChoice() {
  exportChoiceView.hidden = false;
  exportPlateView.hidden = true;
}

function showExportPlateChoice() {
  renderExportPlateOptions({ reset: true });
  exportChoiceView.hidden = true;
  exportPlateView.hidden = false;
}

function openExportMenu() {
  if (exportInProgress) return;
  clearExportError();
  closeFilamentMenu({ restoreFocus: false });
  exportMenuLayer.hidden = false;
  exportMenuLayer.setAttribute('aria-hidden', 'false');
  mfBtn.setAttribute('aria-expanded', 'true');
  document.body.classList.add('export-menu-open');
  const profile=printProfileSnapshotFromUi();
  const printer=PRINTERS[profile.printer] || PRINTERS.p1s;
  const overrides=allObjectEntries().filter(({record})=>Object.keys(record.printOverrides || {}).length).length;
  document.querySelector('#exportProfileSummary').textContent=`${printer.label} · ${profile.nozzleDiameter} mm nozzle · ${profile.settings.layer_height} mm layers · ${profile.bedType}${overrides ? ` · ${overrides} object override${overrides===1?'':'s'}` : ''}`;
  showExportChoice();
  requestAnimationFrame(() => exportPopover.focus({ preventScroll: true }));
}

function closeExportMenu({ restoreFocus = true } = {}) {
  exportMenuLayer.hidden = true;
  exportMenuLayer.setAttribute('aria-hidden', 'true');
  mfBtn.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('export-menu-open');
  if (restoreFocus) mfBtn.focus({ preventScroll: true });
}

function openFilamentMenu() {
  if (printSettingsScope === 'object') setPrintSettingsScope('global');
  closeExportMenu({ restoreFocus: false });
  filamentMenuLayer.hidden = false;
  filamentMenuLayer.setAttribute('aria-hidden', 'false');
  bambuFilamentRow.setAttribute('aria-expanded', 'true');
  bambuFilamentRow.setAttribute('aria-pressed', 'true');
  writePrintSettingsToForm(printProfile.settings);
  updatePrintModifiedHighlights();
  requestAnimationFrame(() => filamentPopover.focus({ preventScroll: true }));
}

function closeFilamentMenu({ restoreFocus = true } = {}) {
  if (!filamentMenuLayer || filamentMenuLayer.hidden) return;
  filamentMenuLayer.hidden = true;
  filamentMenuLayer.setAttribute('aria-hidden', 'true');
  bambuFilamentRow?.setAttribute('aria-expanded', 'false');
  bambuFilamentRow?.setAttribute('aria-pressed', 'false');
  if (restoreFocus) bambuFilamentRow?.focus({ preventScroll: true });
}

function selectedExportPlateIds() {
  return [...exportPlateOptions.querySelectorAll('input[type="checkbox"]:checked')].map((input) => input.value);
}

function exportGroupsForPlate(plate) {
  ensureObjectRecords(plate);
  const grouped = new Map();
  for (const mesh of plate.meshes) {
    const def = plate.objectDefs.find((item) => Number(item.id) === Number(mesh.userData.objectId));
    const key = String(mesh.userData.selectionKey || def?.mergeKey || `object_${mesh.userData.objectId}`);
    if (plate.objectRecords[key]?.deleted) continue;
    if (!grouped.has(key)) grouped.set(key, { key, defs: [], meshes: [], record: plate.objectRecords[key] });
    const group = grouped.get(key);
    if (def && !group.defs.includes(def)) group.defs.push(def);
    group.meshes.push(mesh);
  }
  return [...grouped.values()].map((group, index) => {
    const dynamicNames = group.defs
      .map((def) => def.labelParam ? String(plate.lastGeneratedValues?.[def.labelParam] ?? plate.values?.[def.labelParam] ?? '').trim() : '')
      .filter(Boolean);
    const label = group.record?.label || (dynamicNames.length
      ? dynamicNames.join(' + ')
      : group.defs.length
        ? group.defs.map((def) => String(def.label || `Object ${def.id}`)).join(' + ')
        : `${plate.name.replace(/\.scad$/i, '') || 'Model'} ${index + 1}`);
    return { ...group, label };
  });
}

function safeExportName(value, fallback = 'model') {
  const name = String(value || fallback)
    .normalize('NFKD')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 90);
  return name || fallback;
}

let exportInProgress = false;
let preparedExport = null;
let productionDashboard = null;
let runtimeOpenScadReady = false;

function exportSnapshotKey(profile, plateIds = null) {
  return JSON.stringify({ ...workspaceSnapshot(), camera: undefined, profile, exportPlateIds: Array.isArray(plateIds) ? [...plateIds].sort() : usedExportPlateIds() });
}


function packExportInWorker(plateModels, extras, onProgress, colorOptimization, printer, arrangeOnly = false, signal) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./export-worker.js?v=liqu3d2', import.meta.url), { type: 'module' });
    const abort = () => finish(reject, new DOMException('Arrangement cancelled.', 'AbortError'));
    const finish = (callback, result) => { clearTimeout(timeout); signal?.removeEventListener('abort',abort); worker.terminate(); callback(result); };
    const timeout = setTimeout(() => finish(reject, new Error('3MF packing timed out.')), 120000);
    if (signal?.aborted) { abort(); return; }
    signal?.addEventListener('abort',abort,{once:true});
    worker.onerror = () => finish(reject, new Error('Could not load the export packer. Refresh and try again.'));
    worker.onmessageerror = () => finish(reject, new Error('Could not read the packed 3MF result.'));
    worker.onmessage = ({ data }) => {
      if (data.progress) onProgress(data.progress);
      else if (data.error) finish(reject, new Error(data.error));
      else finish(resolve, data);
    };
    const transfers = new Set();
    const models = plateModels.map((plate) => ({ ...plate, model: { ...plate.model, objects: plate.model.objects.map((object) => ({
      ...object, parts: object.parts.map((part) => {
        const positions = part.geometry.getAttribute('position').array;
        const indices = part.geometry.index?.array;
        transfers.add(positions.buffer);
        if (indices) transfers.add(indices.buffer);
        return { ...part, geometry: { positions, indices } };
      })
    })) } }));
    try { worker.postMessage({ plates: models, extras, colorOptimization, printer, arrangeOnly, projectTitle: workspaceName.value || 'Parametric production project' }, [...transfers]); }
    catch (error) { finish(reject, error); }
  });
}

function serializeObjectPrintOverrides(overrides = {}) {
  const output = {};
  for (const [key, value] of Object.entries(overrides || {})) {
    const item = PRINT_SETTING_ITEM_BY_KEY.get(key);
    if (!item || item.scope !== 'process' || item.globalOnly) continue;
    if (item.type === 'boolean') output[key] = value ? '1' : '0';
    else if (item.type === 'percent' && ['sparse_infill_density', 'ironing_flow'].includes(key)) output[key] = `${Number(value)}%`;
    else output[key] = String(value);
  }
  return output;
}

function clearExportError() {
  if (!viewerMessage.textContent?.startsWith('Export stopped:')) return;
  viewerMessage.hidden = true;
  viewerMessage.textContent = '';
  setStatus('Ready to export.');
}

async function downloadGeneric3mf(requestedPlateIds = null, { arrangeOnly = false, arrangementSettings = null, signal, onArrangementStatus = () => {} } = {}) {
  if (exportInProgress) return;
  clearExportError();
  const availablePlateIds = usedExportPlateIds();
  const selectedPlateIds = requestedPlateIds == null
    ? availablePlateIds
    : [...new Set(requestedPlateIds.map(String))].filter((id) => availablePlateIds.includes(id));
  if (!selectedPlateIds.length) { onArrangementStatus('Add an object first.'); setStatus('Add an object first.', true); return false; }
  exportInProgress = true;
  reduceColorChanges.disabled = true;
  closeExportMenu({ restoreFocus: false });
  const old = mfBtn.textContent;
  mfBtn.disabled = true;
  mfBtn.textContent = 'Preparing…';
  const temporaryGeometries = [];
  const progress = (text) => { mfBtn.textContent = text; setStatus(text); if (arrangeOnly) onArrangementStatus(text); };
  try {
    const profile = getPrintProfileFromUi();
    const colorOptimization = { ...(arrangementSettings || workspaceColorOptimization), enabled: arrangeOnly, maxObjectsPerPlate:workspaceMaxObjectsPerPlate };
    signal?.throwIfAborted();
    const { min: minLayerHeight, max: maxLayerHeight } = layerHeightBounds(profile.nozzleDiameter);
    for (const { record } of allObjectEntries()) {
      const value = record.printOverrides?.layer_height;
      if (value === undefined) continue;
      if (!Number.isFinite(Number(value)) || Number(value) < minLayerHeight || Number(value) > maxLayerHeight) {
        throw new Error(`${record.label}: ${layerHeightRangeError(value, profile.nozzleDiameter)}`);
      }
    }
    await ensurePlatePreviews(selectedPlateIds);
    signal?.throwIfAborted();
    printProfile = profile;
    const printer = PRINTERS[profile.printer] || PRINTERS.p1s;
    if (!arrangeOnly) { fitMinorPlateOverflows(printer); refreshWorkspacePrimeTowers(); }
    const preflight = buildPreflightReport({ plateIds: selectedPlateIds });
    const blockers = preflight.issues.filter((issue) => issue.severity === 'error');
    if (!arrangeOnly && blockers.length) {
      preflightModal.hidden = false;
      preflightModal.setAttribute('aria-hidden', 'false');
      renderPreflightReport(preflight);
      throw new Error(`Export stopped by ${blockers.length} plate check blocker${blockers.length === 1 ? '' : 's'}.`);
    }

    const palette = [];
    const paletteSlot = (hex) => {
      const normalized = colorHexForName(hex, profile.filamentColor).toUpperCase();
      let index = palette.indexOf(normalized);
      if (index < 0) {
        palette.push(normalized);
        index = palette.length - 1;
      }
      return index;
    };

    const objectPlans = [];
    const requests = new Map();
    const queue = (plan, def, part, url, values, format, body = {}) => {
      const key = JSON.stringify([plan.plate.modelId, plan.plate.source, plan.plate.packageId, plan.plate.packageEntry, url, values, body]);
      if (!requests.has(key)) requests.set(key, { url, values, format, body, plate: plan.plate, targets: [] });
      requests.get(key).targets.push({ plan, def, part });
    };
    plates.forEach((plate) => {
      const groups = exportGroupsForPlate(plate);
      groups.forEach((group) => {
        const targetPlateId = group.record?.plateId || plate.defaultPlateId || 'A';
        if (!selectedPlateIds.includes(String(targetPlateId))) return;
        const references = new Map(group.meshes.map((mesh) => {
          mesh.updateMatrixWorld(true);
          return [String(mesh.userData.objectId), { matrixWorld: mesh.matrixWorld.clone(), updateMatrixWorld() {} }];
        }));
        const plan = { plate, group: { ...group, record: structuredClone(group.record) }, references, targetPlateId, layout: { ...plateLayoutForId(targetPlateId) }, rendered: [] };
        objectPlans.push(plan);
        const values = structuredClone(plate.renderStates?.[group.key]?.values || effectiveObjectValues(plate, group.key, plate.lastGeneratedValues || plate.values));
        if (group.defs.length) {
          for (const def of group.defs) {
            const parts = plate.partSelectorParam ? objectColorParts(def, values) || [] : [];
            if (parts.length && plate.solidPartsExport) {
              queue(plan, def, null, `/api/render-object?id=${encodeURIComponent(def.id)}&format=3mf`, values, '3mf', { solidParts: parts.map((part) => part.part) });
            } else {
              // Imported SCAD can use different part names. Its native color
              // groups preserve the complete model without guessed selectors.
              queue(plan, def, null, `/api/render-object?id=${encodeURIComponent(def.id)}&format=3mf`, values, '3mf');
            }
          }
        } else {
          queue(plan, { id: 'model' }, null, '/api/export?format=3mf', values, '3mf');
        }
      });
    });
    const usedPlateIds = [...new Set(objectPlans.map((plan) => plan.targetPlateId))];
    const exportPlateIds = [...new Set(usedPlateIds)].sort((a, b) => PLATE_IDS.indexOf(a) - PLATE_IDS.indexOf(b));

    if (!objectPlans.length) throw new Error('None of the selected plates contain exportable objects.');
    const snapshotKey = exportSnapshotKey(profile, selectedPlateIds);
    const workflow = {
      version: 1, format: '3MF with colour groups', plateOrder: exportPlateIds,
      plates: structuredClone(Object.fromEntries(exportPlateIds.map((id) => [id, batchPlateMeta[id] || { name: `Plate ${id}` }]))),
      colorOptimization: structuredClone(workspaceColorOptimization),
      maxObjectsPerPlate: workspaceMaxObjectsPerPlate,
      objects: structuredClone(allObjectEntries().filter(({ plate, record }) => selectedPlateIds.includes(String(record.plateId || plate.defaultPlateId || 'A'))).map(({ plate, record }) => ({ id: record.id, label: record.label, plateId: currentObjectPlate(record), originalPlateId: record.originalPlateId, moved_plate: record.moved_plate, sourceModelId: plate.modelId, configuration: record.configuration, printOverrides: record.printOverrides || {} })))
    };
    if (!arrangeOnly) {
      const recipe=recipeForExport({plans:objectPlans,requests,profile,printer,title:workspaceName.value || 'Workspace',scope:requestedPlateIds===null?'all':'selected',workflow});
      recipe.primeTowers=structuredClone(workspacePrimeTowers.filter(tower=>selectedPlateIds.includes(tower.plateId)));
      progress('Generating export and history preview…');
      const result=await downloadRecordedExport('/api/export-history',recipe,estimate=>progress(`Export ready · ${grams(estimate?.totalGrams)} filament`));
      setStatus(`Exported ${selectedPlateIds.length} plate${selectedPlateIds.length===1?'':'s'} · ${estimateSummary(result.estimate)} · added to Export history.${result.bambu?.message?` ${result.bambu.message}`:''}`);
      return;
    }
    let completed = 0;
    const renderSignal = signal || new AbortController().signal;
    progress(`Exporting 0/${requests.size}…`);
    await runRenderJobs([...requests.values()].map((request) => async () => {
      const { plate } = request;
      const data = await fetchStl(request.url, request.values, renderSignal, plate.modelId, { source: plate.source, sourceName: plate.sourceName, packageId: plate.packageId, packageEntry: plate.packageEntry, ...request.body });
      for (const target of request.targets) if (data.byteLength) target.plan.rendered.push({ ...target, data, format: request.format });
      progress(`Exporting ${++completed}/${requests.size}…`);
    }), renderSignal, 'Exporting full-quality solids', true);

    const objectsByPlate = new Map(exportPlateIds.map((plateId) => [plateId, []]));
    for (const plan of objectPlans) {
      const { group } = plan;
      const merged = group.defs.length > 1;
      const targetPlateId = plan.targetPlateId;
      const parts = plan.rendered.flatMap(({ def, part, data, format }) => {
        const solids = format === '3mf' ? readSolid3mf(data, undefined, {colorMetadata:colorOptimization.enabled}) : [{ geometry: new STLLoader().parse(data), colors: null, name: part?.label }];
        return solids.map((solid) => {
          const referenceMesh = plan.references.get(String(def.id)) || plan.references.values().next().value;
          const geometry = geometryForPrint(solid.geometry, referenceMesh, plan.layout, printer);
          solid.geometry.dispose();
          temporaryGeometries.push(geometry);
          const childName = def.label || '';
          const childPrefix = merged && childName ? `${childName} · ` : '';
          return {
            name: `${childPrefix}${part?.label || solid.name || 'Solid part'}`,
            geometry,
            colorKnown: Boolean(part?.hex || solid.colors?.length),
            colorMetadata: colorOptimization.enabled && solid.propertyTable ? {faceProperties:solid.faceProperties,propertyTable:solid.propertyTable} : undefined,
            materialIndex: paletteSlot(part?.hex || solid.colors?.[0] || profile.filamentColor),
            materialIndices: solid.colors ? Uint32Array.from(solid.colors, paletteSlot) : undefined
          };
        });
      });
      if (!parts.length) continue;
      objectsByPlate.get(targetPlateId)?.push({
        exportId: group.record?.id,
        editorRotation: storedObjectOffset(group.key,plan.plate).rotation,
        name: group.label,
        settings: serializeObjectPrintOverrides(group.record?.printOverrides || {}),
        parts
      });
      // Let input and paint run between large objects; compression runs off-thread.
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    progress('Packing 3MF…');
    const exportProfile = await fetchJson('/api/export-profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profile }) });
    if (!exportProfile.template) throw new Error('Print settings could not be embedded in the 3MF.');
    const plateModels = [];
    for (const plateId of exportPlateIds) {
      const objects = objectsByPlate.get(plateId) || [];
      if (!objects.length) continue;
      if (!arrangeOnly) placeObjectsOnBed(objects);
      const plateName = workflow.plates[plateId]?.name || `Plate ${plateId}`;
      plateModels.push({ plateId, filename: `plate-${plateId}-${safeExportName(plateName)}.3mf`, model: {
        title: plateName,
        application: 'Liqu3D',
        objects,
        palette,
        bambuTemplate: exportProfile.template,
        bedSize: { width: printer.width, depth: printer.depth }
      } });
    }
    if (arrangeOnly) {
      const {colorOptimization: report} = await packExportInWorker(plateModels, {}, progress, colorOptimization, printer, true, signal);
      signal?.throwIfAborted();
      if (snapshotKey !== exportSnapshotKey(printProfileSnapshotFromUi(), usedExportPlateIds())) throw new Error('The workspace changed while arranging. Try again.');
      applyWorkspaceColorArrangement(report, printer, colorOptimization);
      return true;
    }

  } catch (error) {
    if (arrangeOnly) { const message = signal?.aborted ? 'Color arrangement cancelled.' : `Color arrangement: ${error.message}`; onArrangementStatus(message); setStatus(message, !signal?.aborted); return false; }
    setStatus(`3MF export: ${error.message}`, true);
    viewerMessage.hidden = false;
    viewerMessage.textContent = `Export stopped: ${error.message}`;
  } finally {
    for (const geometry of temporaryGeometries) geometry.dispose();
    mfBtn.disabled = false;
    mfBtn.textContent = old;
    exportInProgress = false;
    reduceColorChanges.disabled = false;
  }
}

function selectObject(id, fit = false, { preserveBatch = false } = {}) {
  selectedPrimeTowerPlateId=null;
  if (!preserveBatch) batchSelectedObjectIds.clear();
  const raw = String(id);
  if (raw === 'all' || raw === 'model') {
    selectedObjectId = raw;
  } else if (raw.startsWith('group:') || raw.startsWith('instance:')) {
    selectedObjectId = raw;
  } else {
    const group = logicalGroupForObjectId(Number(raw));
    selectedObjectId = group ? selectionKeyForGroup(group) : 'all';
  }
  const plate = activePlate();
  if (plate) setFormValues(selectedObjectId === 'all' ? plate.values : effectiveObjectValues(plate, selectedObjectId));
  const sectionName = objectSettingsSection(activePlate(), selectedObjectId, activeSection);
  if (sectionName) setActiveSection(sectionName);
  updateSelectionVisuals();
  if (printSettingsScope === 'object') renderPrintScopeValues();
  if (fit) fitModel();
}

function populateNozzleSelector() {
  if (!nozzleDiameterSelect) return;
  const selected = Number(printProfile?.nozzleDiameter) || 0.4;
  nozzleDiameterSelect.replaceChildren();
  for (const diameter of SUPPORTED_NOZZLES) {
    const option = document.createElement('option');
    option.value = String(diameter);
    option.textContent = `${diameter.toFixed(1)} mm`;
    nozzleDiameterSelect.append(option);
  }
  nozzleDiameterSelect.value = String(SUPPORTED_NOZZLES.includes(selected) ? selected : 0.4);
}

function layerHeightBounds(nozzleInput = nozzleDiameterSelect?.value) {
  const nozzle = Number(nozzleInput) || 0.4;
  return { min: Number((nozzle * 0.2).toFixed(2)), max: Number((nozzle * 0.7).toFixed(2)) };
}

function layerHeightRangeError(value, nozzleInput) {
  const nozzle = Number(nozzleInput) || 0.4;
  const { min, max } = layerHeightBounds(nozzle);
  const suggestion = Number(value) === 0.4 && nozzle < 0.6 ? ' Use a 0.6 mm nozzle for a 0.4 mm layer.' : '';
  return `Layer height must be ${min}–${max} mm for a ${nozzle} mm nozzle.${suggestion}`;
}

function updateLayerHeightConstraint() {
  const input = printInputForKey('layer_height');
  if (!input) return;
  const nozzle = Number(nozzleDiameterSelect.value) || 0.4;
  const { min, max } = layerHeightBounds(nozzle);
  input.min = String(min);
  input.max = String(max);
  input.title = `${min}–${max} mm with the selected ${nozzle} mm nozzle`;
}

function populatePrinterSelectors() {
  printerSelect.innerHTML = '';
  for (const [id, printer] of Object.entries(PRINTERS)) {
    const option = document.createElement('option');
    option.value = id;
    const notes = [];
    if (printer.excludedAreas?.length) notes.push(`${printer.excludedAreas.map((area) => `${Math.abs(area.x2 - area.x1)} × ${Math.abs(area.y2 - area.y1)} mm`).join(', ')} no-print`);
    if (printer.nozzleLimitedAreas?.length) notes.push('amber nozzle-reach zones');
    if (!notes.length) notes.push('full rectangular area');
    option.textContent = `${printer.label} — ${printer.width} × ${printer.depth} · ${notes.join(' · ')}`;
    printerSelect.append(option);
  }
}

function printSettingControl(item) {
  const wrap = document.createElement('div');
  wrap.className = 'print-setting bambu-setting-row';
  wrap.dataset.search = `${item.label} ${item.key}`.toLowerCase();
  const id = `print-${item.key}`;

  const label = document.createElement('label');
  label.htmlFor = id;
  label.className = 'bambu-setting-label';
  label.textContent = item.label;

  const control = document.createElement('div');
  control.className = 'bambu-setting-control';

  if (item.type === 'boolean') {
    const input = document.createElement('input');
    input.id = id;
    input.name = item.key;
    input.type = 'checkbox';
    input.className = 'toggle';
    control.append(input);
    wrap.append(label, control);
    return wrap;
  }

  if (item.type === 'select') {
    const select = document.createElement('select');
    select.id = id;
    select.name = item.key;
    for (const value of item.options) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.append(option);
    }
    control.append(select);
    wrap.append(label, control);
    return wrap;
  }

  if (item.type === 'raw') {
    const input = document.createElement('input');
    input.id = id;
    input.name = item.key;
    input.type = 'text';
    input.autocomplete = 'off';
    input.placeholder = 'Optional profile value';
    input.title = item.key;
    control.append(input);
    wrap.append(label, control);
    return wrap;
  }

  const number = document.createElement('input');
  number.id = id;
  number.name = item.key;
  number.type = 'number';
  number.min = item.min;
  number.max = item.max;
  number.step = item.step;
  control.append(number);
  if (item.unit) {
    const unit = document.createElement('span');
    unit.className = 'bambu-setting-unit';
    unit.textContent = item.unit;
    control.append(unit);
  }
  wrap.append(label, control);
  return wrap;
}

function buildPrintSettingsUi() {
  printTabs.innerHTML = '';
  printSettingsForm.innerHTML = '';
  filamentSettingsForm.innerHTML = '';
  for (const group of PRINT_SETTINGS_GROUPS) {
    if (group.scope === 'process') {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'print-tab';
      tab.dataset.group = group.id;
      tab.id = `printTab-${group.id}`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', `printGroup-${group.id}`);
      tab.setAttribute('aria-selected', 'false');
      tab.tabIndex = -1;
      tab.textContent = group.label;
      tab.addEventListener('click', () => setActivePrintGroup(group.id));
      printTabs.append(tab);
    }

    const groupElement = document.createElement('section');
    groupElement.className = 'print-group';
    groupElement.dataset.group = group.id;
    groupElement.id = `printGroup-${group.id}`;
    groupElement.setAttribute('role', 'tabpanel');
    groupElement.setAttribute('aria-labelledby', `printTab-${group.id}`);
    for (const subsection of group.sections || [{ label: group.label, settings: group.settings }]) {
      const section = document.createElement('section');
      section.className = 'bambu-setting-section';
      const heading = document.createElement('button');
      heading.type = 'button';
      heading.className = 'bambu-setting-section-title';
      heading.setAttribute('aria-expanded', 'true');
      heading.textContent = subsection.label;
      heading.addEventListener('click', () => {
        const collapsed = section.classList.toggle('collapsed');
        heading.setAttribute('aria-expanded', String(!collapsed));
      });
      section.append(heading);
      for (const item of subsection.settings) section.append(printSettingControl(item));
      groupElement.append(section);
    }
    if (group.scope === 'filament') {
      groupElement.removeAttribute('aria-labelledby');
      groupElement.setAttribute('aria-label', 'Filament settings');
      groupElement.classList.add('active');
      groupElement.setAttribute('aria-hidden', 'false');
      filamentSettingsForm.append(groupElement);
    } else {
      printSettingsForm.append(groupElement);
    }
  }
  const advancedTab = document.createElement('button');
  advancedTab.type = 'button';
  advancedTab.className = 'print-tab';
  advancedTab.dataset.group = 'advanced';
  advancedTab.id = 'printTab-advanced';
  advancedTab.setAttribute('role', 'tab');
  advancedTab.setAttribute('aria-controls', 'advancedSettings');
  advancedTab.setAttribute('aria-selected', 'false');
  advancedTab.tabIndex = -1;
  advancedTab.textContent = 'Advanced';
  advancedTab.addEventListener('click', () => setActivePrintGroup('advanced'));
  printTabs.append(advancedTab);
  printTabs.setAttribute('role', 'tablist');
  printTabs.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const tabs = [...printTabs.querySelectorAll('.print-tab')];
    const index = tabs.indexOf(document.activeElement);
    if (index < 0) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;
    setActivePrintGroup(tabs[nextIndex].dataset.group);
    tabs[nextIndex].focus({ preventScroll: true });
  });
  advancedSettings.setAttribute('role', 'tabpanel');
  advancedSettings.setAttribute('aria-labelledby', 'printTab-advanced');
  setActivePrintGroup('quality');
}

function setActivePrintGroup(groupId) {
  activePrintGroup = groupId;
  for (const tab of printTabs.querySelectorAll('.print-tab')) {
    const active = tab.dataset.group === groupId;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  }
  for (const group of printSettingsForm.querySelectorAll('.print-group')) {
    const active = group.dataset.group === groupId;
    group.classList.toggle('active', active);
    group.setAttribute('aria-hidden', String(!active));
  }
  advancedSettings.hidden = groupId !== 'advanced';
  applyPrintSearch();
}

function applyPrintSearch() {
  const query = printSettingSearch.value.trim().toLowerCase();
  if (!query) {
    for (const group of printSettingsForm.querySelectorAll('.print-group')) {
      group.style.display = group.dataset.group === activePrintGroup ? 'block' : 'none';
      for (const field of group.querySelectorAll('.print-setting')) field.classList.remove('hidden-by-search');
    }
    advancedSettings.hidden = activePrintGroup !== 'advanced';
    return;
  }
  advancedSettings.hidden = true;
  for (const group of printSettingsForm.querySelectorAll('.print-group')) {
    let hits = 0;
    for (const field of group.querySelectorAll('.print-setting')) {
      const match = field.dataset.search.includes(query);
      field.classList.toggle('hidden-by-search', !match);
      if (match) hits += 1;
    }
    if (hits) {
      for (const section of group.querySelectorAll('.bambu-setting-section')) {
        if (!section.querySelector('.print-setting:not(.hidden-by-search)')) continue;
        section.classList.remove('collapsed');
        section.querySelector('.bambu-setting-section-title')?.setAttribute('aria-expanded', 'true');
      }
    }
    group.style.display = hits ? 'block' : 'none';
  }
}

function printValueFromInput(item, input) {
  if (item.type === 'boolean') return Boolean(input.checked);
  if (item.type === 'number' || item.type === 'percent') return Number(input.value);
  const value = input.value;
  if (item.optional && value.trim() === '') return undefined;
  return item.type === 'raw' ? parseRawSetting(value) : value;
}

function samePrintValue(a, b) {
  if (Number.isFinite(a) && Number.isFinite(b)) return Math.abs(Number(a) - Number(b)) < 1e-9;
  return JSON.stringify(a) === JSON.stringify(b);
}

function activeObjectPrintRecord() {
  const plate = activePlate();
  if (!plate || selectedObjectId === 'all') return null;
  return objectRecordForSelection(plate, selectedObjectId);
}

function printInputForKey(key) {
  return printSettingsForm.elements.namedItem(key) || filamentSettingsForm.elements.namedItem(key);
}

function writePrintSettingsToForm(settings) {
  for (const group of PRINT_SETTINGS_GROUPS) {
    for (const item of group.settings) {
      const input = printInputForKey(item.key);
      if (!input) continue;
      const value = settings[item.key];
      if (item.type === 'boolean') input.checked = [true,1,'1','true'].includes(Array.isArray(value)?value[0]:value);
      else if (item.type === 'raw' && value !== undefined && typeof value === 'object') input.value = JSON.stringify(value);
      else input.value = value ?? '';
    }
  }
  const towerToggle=document.querySelector('#primeTowerToggle');
  if(towerToggle)towerToggle.checked=printInputForKey('enable_prime_tower')?.checked || false;
}

function updatePrintModifiedHighlights() {
  const baselineSettings = printSettingsScope === 'object' ? printProfile.settings : printProfileBaseline.settings;
  for (const row of [...printSettingsForm.querySelectorAll('.print-setting'), ...filamentSettingsForm.querySelectorAll('.print-setting')]) {
    const input = row.querySelector('[name]');
    const item = input ? PRINT_SETTING_ITEM_BY_KEY.get(input.name) : null;
    if (!input || !item) continue;
    const current = printValueFromInput(item, input);
    const modified = item.scope === 'process' || printSettingsScope === 'global'
      ? !samePrintValue(current, baselineSettings[item.key])
      : false;
    row.classList.toggle('modified-setting', modified);
  }
  for (const tab of printTabs.querySelectorAll('.print-tab[data-group]')) {
    const group = printSettingsForm.querySelector(`.print-group[data-group="${tab.dataset.group}"]`);
    tab.classList.toggle('has-modified', Boolean(group?.querySelector('.modified-setting')));
  }
  const contextSections = [...printDrawer.querySelectorAll('.bambu-context-section')];
  const printerSection = contextSections[0];
  const filamentSection = contextSections[1];
  const processSection = contextSections[2];
  if (printerSection) printerSection.classList.toggle('modified-context', printSettingsScope === 'global' && (
    printProfile.printer !== printProfileBaseline.printer ||
    Number(printProfile.nozzleDiameter) !== Number(printProfileBaseline.nozzleDiameter) ||
    printProfile.bedType !== printProfileBaseline.bedType
  ));
  if (filamentSection) filamentSection.classList.toggle('modified-context', printSettingsScope === 'global' && (
    printProfile.filamentColor !== printProfileBaseline.filamentColor ||
    PRINT_SETTINGS_GROUPS.find((group) => group.id === 'filament')?.settings.some((item) => !samePrintValue(printProfile.settings[item.key], printProfileBaseline.settings[item.key]))
  ));
  const objectOverrides = activeObjectPrintRecord()?.printOverrides || {};
  if (processSection) processSection.classList.toggle('modified-context', printSettingsScope === 'object' && Object.keys(objectOverrides).length > 0);
  let advancedChanged = false;
  if (printSettingsScope === 'global') {
    try { advancedChanged = JSON.stringify(normalizedAdvanced()) !== JSON.stringify(printProfileBaseline.advanced || {}); }
    catch { advancedChanged = advancedJson.value.trim().length > 0; }
  }
  advancedSettings.classList.toggle('modified-setting', advancedChanged);
  const advancedTab = printTabs.querySelector('#printTab-advanced');
  advancedTab?.classList.toggle('has-modified', advancedChanged);
}

function renderPrintScopeValues() {
  const record = printSettingsScope === 'object' ? activeObjectPrintRecord() : null;
  const values = record ? { ...printProfile.settings, ...(record.printOverrides || {}) } : printProfile.settings;
  for(const item of PRINT_SETTING_ITEM_BY_KEY.values())if(item.globalOnly)values[item.key]=printProfile.settings[item.key];
  writePrintSettingsToForm(values);
  bambuGlobalModeBtn?.classList.toggle('active', printSettingsScope === 'global');
  bambuObjectsModeBtn?.classList.toggle('active', printSettingsScope === 'object');
  bambuGlobalModeBtn?.setAttribute('aria-pressed', String(printSettingsScope === 'global'));
  bambuObjectsModeBtn?.setAttribute('aria-pressed', String(printSettingsScope === 'object'));
  processProfileControls.hidden = printSettingsScope === 'object';
  if (printSettingsScope === 'object') closeProfileMenu();
  if (objectPrintScopeNote) objectPrintScopeNote.hidden = printSettingsScope !== 'object';
  if (objectPrintScopeName) objectPrintScopeName.textContent = record?.label || 'Select an object in the preview';
  printSettingsForm.classList.toggle('object-scope-empty', printSettingsScope === 'object' && !record);
  for (const input of printSettingsForm.querySelectorAll('input, select')) {
    const item = input.name ? PRINT_SETTING_ITEM_BY_KEY.get(input.name) : null;
    input.disabled = !item?.globalOnly && printSettingsScope === 'object' && (!record || item?.scope !== 'process');
  }
  // Object overrides are process-only. Filament and raw advanced profile settings remain global.
  const advancedTab = printTabs.querySelector('#printTab-advanced');
  if (advancedTab) {
    advancedTab.disabled = printSettingsScope === 'object';
    advancedTab.title = printSettingsScope === 'object' ? 'Advanced JSON overrides are global profile settings' : '';
  }
  if (printSettingsScope === 'object' && activePrintGroup === 'advanced') setActivePrintGroup('quality');
  updatePrintModifiedHighlights();
}

function syncGlobalPrintProfileFromUi() {
  if (printSettingsScope !== 'global') return;
  for (const [key, item] of PRINT_SETTING_ITEM_BY_KEY) {
    const input = printInputForKey(key);
    if (!input) continue;
    const value = printValueFromInput(item, input);
    if (value === undefined) delete printProfile.settings[key];
    else printProfile.settings[key] = value;
  }
}

function setPrintSettingsScope(scope) {
  const next = scope === 'object' ? 'object' : 'global';
  if (next === printSettingsScope) { renderPrintScopeValues(); return; }
  if (printSettingsScope === 'global') syncGlobalPrintProfileFromUi();
  printSettingsScope = next;
  if (next === 'object' && !activeObjectPrintRecord()) {
    const records = ensureObjectRecords(activePlate()).filter((record) => !String(record.selectionKey).startsWith('instance:'));
    if (records.length === 1) selectObject(records[0].selectionKey, false);
  }
  renderPrintScopeValues();
}

function applyPrintProfile(profile, { setBaseline = true } = {}) {
  const fallback = createDefaultProfile();
  printProfile = {
    ...fallback,
    ...profile,
    settings: { ...fallback.settings, ...migratePrintSettings(profile?.settings || {}) },
    advanced: profile?.advanced && typeof profile.advanced === 'object' ? profile.advanced : {}
  };
  if (!PRINTERS[printProfile.printer]) printProfile.printer = 'p1s';
  if (setBaseline) printProfileBaseline = structuredClone(printProfile);
  printSettingsScope = 'global';
  profileName.value = printProfile.name;
  printerSelect.value = printProfile.printer;
  populateNozzleSelector();
  nozzleDiameterSelect.value = String(SUPPORTED_NOZZLES.includes(Number(printProfile.nozzleDiameter)) ? Number(printProfile.nozzleDiameter) : 0.4);
  bedTypeSelect.value = printProfile.bedType;
  advancedJson.value = Object.keys(printProfile.advanced).length ? JSON.stringify(printProfile.advanced, null, 2) : '';
  renderPrintScopeValues();
  updateLayerHeightConstraint();
  if (bambuFilamentSummary) bambuFilamentSummary.textContent = `Generic ${printProfile.settings.filament_type || 'PLA'}`;
  const towerWarning=refreshWorkspacePrimeTowers();
  buildPlateReference();
  if(towerWarning)setStatus(towerWarning,true);
  persistWorkflowState();
}

function populateProfileMenu(profiles, selectedId = null) {
  profileMenuOptions.replaceChildren();
  selectedPrintProfileId = selectedId || null;
  let selectedName = '';
  for (const profile of profiles || []) {
    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'profile-menu-option';
    option.classList.toggle('active', profile.id === selectedPrintProfileId);
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', String(profile.id === selectedPrintProfileId));
    const label = document.createElement('span');
    label.textContent = profile.name;
    option.append(label);
    if (profile.id === selectedPrintProfileId) {
      selectedName = profile.name;
      const check = document.createElement('span');
      check.className = 'profile-menu-check';
      check.textContent = '✓';
      option.append(check);
    }
    option.addEventListener('click', () => selectSavedPrintProfile(profile.id));
    profileMenuOptions.append(option);
  }
  if (!profileMenuOptions.children.length) {
    const empty = document.createElement('p');
    empty.className = 'profile-menu-empty';
    empty.textContent = 'No saved print presets yet.';
    profileMenuOptions.append(empty);
  }
  profileMenuLabel.textContent = selectedName || (profiles?.length ? printProfile?.name : 'No saved presets');
  profileMenuButton.disabled = false;
}

function closeProfileMenu() {
  profileMenu.hidden = true;
  profileMenuButton.setAttribute('aria-expanded', 'false');
}

function beginNewPrintProfile() {
  closeProfileMenu();
  newProfileField.hidden = false;
  profileName.value = '';
  savePrintBtn.textContent = 'Create profile';
  profileName.focus();
}

function cancelNewPrintProfile() {
  newProfileField.hidden = true;
  profileName.value = printProfile.name;
  savePrintBtn.textContent = 'Save profile';
}

function showProfileToast(message) {
  clearTimeout(profileToastTimer);
  profileToastText.textContent = message;
  profileToast.hidden = false;
  profileToastTimer = setTimeout(() => {
    profileToast.hidden = true;
  }, 2800);
}

async function selectSavedPrintProfile(id) {
  if (!id) return;
  closeProfileMenu();
  profileMenuButton.disabled = true;
  try {
    const response = await appFetch('/api/print-profiles/select', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not load saved profile.');
    applyPrintProfile(data.profile);
    populateProfileMenu(data.profiles, data.id);
    newProfileField.hidden = true;
    savePrintBtn.textContent = 'Save profile';
    profileFileName.textContent = data.profileFile;
    showProfileToast(`${data.profile.name} loaded`);
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    profileMenuButton.disabled = false;
  }
}

async function savePrintProfile() {
  const creatingProfile = !newProfileField.hidden;
  if (creatingProfile && !profileName.value.trim()) {
    profileName.focus();
    setStatus('Enter a name for the new print profile.', true);
    return;
  }
  savePrintBtn.disabled = true;
  savePrintBtn.textContent = 'Saving…';
  try {
    const profile = getPrintProfileFromUi();
    const response = await appFetch('/api/print-profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not save profile.');
    profileFileName.textContent = data.profileFile || 'Private account storage';
    applyPrintProfile(data.profile);
    populateProfileMenu(data.profiles, data.id);
    newProfileField.hidden = true;
    showProfileToast(data.profile.name === 'Auto-Generation'
      ? 'Auto-Generation saved · new headless 3MFs will use it'
      : `${data.profile.name} saved`);
    setStatus(`${data.profile.name} saved to your private account.`);
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    savePrintBtn.disabled = false;
    savePrintBtn.textContent = creatingProfile && !newProfileField.hidden ? 'Create profile' : 'Save profile';
  }
}

function setPrinter(id, refit = true) {
  if (!PRINTERS[id]) return;
  printProfile.printer = id;
  printerSelect.value = id;
  populateNozzleSelector();
  printProfile.nozzleDiameter = Number(nozzleDiameterSelect.value) || 0.4;
  updateLayerHeightConstraint();
  buildPlateReference();
  if (refit) fitPlate();
}

function sceneHitAtPointer(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const sceneMeshes = plates.flatMap((plate) => plate.meshes).filter((mesh) => mesh.visible);
  const hits = raycaster.intersectObjects([...sceneMeshes, plateGroup], true);
  for (const hit of hits) {
    const plateKey = hit.object.userData.plateKey || hit.object.parent?.userData?.plateKey;
    const batchPlateId = hit.object.userData.batchPlateId || hit.object.parent?.userData?.batchPlateId;
    if (!plateKey && !batchPlateId) continue;
    const selectionKey = hit.object.userData.selectionKey || hit.object.userData.objectId;
    return {
      plateKey: plateKey ? String(plateKey) : null,
      batchPlateId: batchPlateId ? String(batchPlateId) : null,
      selectionKey: selectionKey == null ? null : String(selectionKey)
      , primeTower: String(hit.object.userData.plateRole || '').startsWith('prime-tower-')
    };
  }
  return null;
}

function selectSceneObject(hit, { focus = true } = {}) {
  const plate=plates.find(candidate=>candidate.key===hit?.plateKey);
  if(!plate || !hit.selectionKey)return null;
  const record=objectRecordForSelection(plate,hit.selectionKey);
  if(!record)return null;
  // Source ownership and physical plate assignment diverge after arranging.
  // Load the object's editor without navigating back to its source's default plate.
  activeViewPlateId=currentObjectPlate(record,plate.defaultPlateId);
  if(plate.key!==activePlateKey && !bulkPreviewGenerationPromise) {
    switchPlate(plate.key,{generateIfEmpty:false,focus:false,preserveView:true});
  }
  buildPlateReference();
  if (focus) centerPlateIdInView(activeViewPlateId);
  updatePlateFitStatus();
  renderPlateList();
  persistUploadedPlates();
  if(plate.key!==activePlateKey)return null;
  selectObject(hit.selectionKey,false,{preserveBatch:true});
  return hit.selectionKey;
}

function toggleSceneSelection(hit) {
  const plate = plates.find(plate => plate.key === hit?.plateKey);
  const record = plate && objectRecordForSelection(plate, hit.selectionKey);
  if (!record || bulkPreviewGenerationPromise) return;
  // Include a selection made through the editor tabs before the first Shift-click.
  if (!batchSelectedObjectIds.size && selectedObjectId !== 'all') {
    const previous = objectRecordForSelection(activePlate(), selectedObjectId);
    if (previous) batchSelectedObjectIds.add(previous.id);
  }
  if (batchSelectedObjectIds.has(record.id)) batchSelectedObjectIds.delete(record.id);
  else batchSelectedObjectIds.add(record.id);
  const selected = allObjectEntries().filter(entry => batchSelectedObjectIds.has(entry.record.id));
  const primary = selected.find(entry => entry.record.id === record.id) || selected.at(-1);
  if (primary) selectSceneObject({ plateKey: primary.plate.key, selectionKey: primary.record.selectionKey }, { focus: false });
  else selectObject('all', false);
  updateSelectionVisuals();
}

function pointAtPointerOnPlane(event, planeY) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const point = new THREE.Vector3();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeY);
  return raycaster.ray.intersectPlane(plane, point) ? point : null;
}

function finishObjectDrag({ cancelled = false } = {}) {
  if (!pointerDown) return;
  if (pointerDown.primeTower) {
    const down=pointerDown;
    controls.enabled=true;
    renderer.domElement.classList.remove('object-dragging');
    renderer.domElement.style.cursor='';
    try { renderer.domElement.releasePointerCapture(down.id); } catch {}
    pointerDown=null;
    if (cancelled) workspacePrimeTowers=down.startTowers;
    const tower=workspacePrimeTowers.find(item=>item.plateId===down.batchPlateId);
    const changed=tower && (tower.x!==down.startTower.x || tower.y!==down.startTower.y);
    if (!cancelled && changed) {
      rememberObjectEdit({type:'prime-tower',primeTowers:down.startTowers});
      preparedExport=null; delete workspacePrimeTowerErrors[down.batchPlateId];
      persistUploadedPlates();
    }
    buildPlateReference();
    setStatus(cancelled?'Prime tower movement cancelled.':changed?'Prime tower position updated. Export will use this placement.':'Drag the prime tower or use arrow keys to move it. Shift: 10 mm · Option/Alt: 0.1 mm.');
    return;
  }
  const wasDragging = pointerDown.dragging;
  const wasRotating = pointerDown.rotating;
  const key = pointerDown.selectionKey;
  const startOffset = pointerDown.startOffset;
  const plate = plates.find((candidate) => candidate.key === pointerDown.plateKey);
  if(cancelled && plate && startOffset && key){
    plate.objectTransforms[key]={...startOffset};
    for(const mesh of plate.meshes)if(String(mesh.userData.selectionKey)===String(key))applyStoredTransform(mesh,plate);
    preparedExport=null;
  }
  controls.enabled = true;
  renderer.domElement.classList.remove('object-dragging');
  if(wasRotating)renderer.domElement.style.cursor='';
  try { renderer.domElement.releasePointerCapture(pointerDown.id); } catch {}
  pointerDown = null;
  if (wasDragging && key) {
    if (!cancelled) {
      rememberObjectMove(plate, key, startOffset);
      persistUploadedPlates();
    }
    updateSelectionVisuals();
    updatePlateFitStatus();
    renderPlateList();
    setStatus(cancelled ? 'Object movement cancelled.' : wasRotating ? 'Rotation applied. Cmd/Ctrl + Z to undo.' : 'Object position updated. Export will use this placement.');
  }
}

// Consume the confirmation click before it can move an object or orbit the camera.
document.addEventListener('pointerdown',handleCursorRotationClick,true);
document.addEventListener('pointermove',handleCursorRotationMove,true);
window.addEventListener('blur',()=>{if(pointerDown?.rotating || pointerDown?.primeTower)finishObjectDrag({cancelled:true});});
document.addEventListener('keydown',event=>{
  if (event.key==='Escape' && pointerDown?.primeTower) { event.preventDefault(); finishObjectDrag({cancelled:true}); }
},true);

function primeTowerMoveContext(plateId) {
  const tower=workspacePrimeTowers.find(item=>item.plateId===plateId);
  if (!tower) return null;
  return {tower,printer:activePrinter(),objects:[]};
}

function nudgePrimeTower(deltaX, deltaZ) {
  if (pointerDown || exportInProgress || objectHistoryBusy || bulkPreviewGenerationPromise) return false;
  const context=primeTowerMoveContext(selectedPrimeTowerPlateId);
  if (!context) return false;
  const {tower,printer,objects}=context;
  const moved=movePrimeTower(tower,printer,objects,tower.x+deltaX,tower.y-deltaZ);
  if (!moved) return false;
  if (moved.x===tower.x && moved.y===tower.y) return false;
  rememberObjectEdit({type:'prime-tower',primeTowers:structuredClone(workspacePrimeTowers)});
  workspacePrimeTowers=workspacePrimeTowers.map(item=>item.plateId===selectedPrimeTowerPlateId?moved:item);
  preparedExport=null; delete workspacePrimeTowerErrors[selectedPrimeTowerPlateId];
  persistUploadedPlates(); buildPlateReference();
  setStatus(`Prime tower · X ${moved.bodyX.toFixed(1)} · Y ${moved.bodyY.toFixed(1)} mm · Cmd/Ctrl + Z to undo.`);
  return true;
}

function beginPrimeTowerDrag(event, hit) {
  if (bulkPreviewGenerationPromise) return;
  const context=primeTowerMoveContext(hit.batchPlateId);
  const reference=batchPlateReferences[hit.batchPlateId];
  const planeY=reference?.position.y ?? 0;
  const anchor=pointAtPointerOnPlane(event,planeY);
  if (!context || !anchor) return;
  const {tower,printer,objects}=context;
  selectedPrimeTowerPlateId=hit.batchPlateId;
  controls.enabled=false;
  renderer.domElement.style.cursor='grabbing';
  pointerDown={id:event.pointerId,x:event.clientX,y:event.clientY,primeTower:true,batchPlateId:hit.batchPlateId,
    anchor,planeY,printer,objects,startTower:structuredClone(tower),startTowers:structuredClone(workspacePrimeTowers),dragging:false};
  renderer.domElement.setPointerCapture(event.pointerId);
}

function movePrimeTowerDrag(event) {
  const down=pointerDown;
  if (!down?.primeTower || down.id!==event.pointerId) return;
  if (!down.dragging && Math.hypot(event.clientX-down.x,event.clientY-down.y)<3) return;
  const point=pointAtPointerOnPlane(event,down.planeY);
  if (!point) return;
  const moved=movePrimeTower(down.startTower,down.printer,down.objects,
    down.startTower.x+point.x-down.anchor.x,down.startTower.y-(point.z-down.anchor.z));
  if (!moved) return;
  const previous=workspacePrimeTowers.find(tower=>tower.plateId===down.batchPlateId);
  workspacePrimeTowers=workspacePrimeTowers.map(tower=>tower.plateId===down.batchPlateId?moved:tower);
  for (const child of batchPlateReferences[down.batchPlateId]?.children || []) {
    if (!String(child.userData.plateRole || '').startsWith('prime-tower-')) continue;
    child.position.x+=moved.x-previous.x; child.position.z-=moved.y-previous.y;
  }
  down.dragging=true;
  requestRender();
  renderer.domElement.classList.add('object-dragging');
  setStatus(`Prime tower · X ${moved.bodyX.toFixed(1)} · Y ${moved.bodyY.toFixed(1)} mm`);
}

function handleViewerPointerDown(event) {
  if (event.button !== 0 || event.defaultPrevented || exportInProgress || objectHistoryBusy || pointerDown) return;
  renderer.domElement.focus({ preventScroll: true });
  const hit = sceneHitAtPointer(event);
  if (hit?.primeTower) {
    event.preventDefault(); event.stopImmediatePropagation();
    beginPrimeTowerDrag(event,hit); return;
  }
  selectedPrimeTowerPlateId=null;
  renderer.domElement.style.cursor='';
  if (event.shiftKey || event.metaKey || event.ctrlKey) {
    // Capture the gesture before OrbitControls can interpret Shift-left as pan.
    event.preventDefault();
    event.stopImmediatePropagation();
    controls.enabled = false;
    pointerDown = { id: event.pointerId, x: event.clientX, y: event.clientY,
      additive: true, selectionKey: hit?.selectionKey || null, plateKey: hit?.plateKey || null };
    renderer.domElement.setPointerCapture(event.pointerId);
    return;
  }
  const plate = plates.find(plate => plate.key === hit?.plateKey);
  const record = plate && objectRecordForSelection(plate, hit.selectionKey);
  if (record) batchSelectedObjectIds = new Set([record.id]);
  if (hit?.batchPlateId && !hit.selectionKey) switchToPlateId(hit.batchPlateId);
  const selectionKey = selectSceneObject(hit);
  const box = selectionKey ? combinedBox(selectedMeshes()) : null;
  const planeY = box?.min.y ?? 0;
  const anchor = selectionKey ? pointAtPointerOnPlane(event, planeY) : null;
  pointerDown = {
    x: event.clientX,
    y: event.clientY,
    id: event.pointerId,
    selectionKey,
    plateKey: activePlateKey,
    planeY,
    anchor,
    startOffset: selectionKey ? storedObjectOffset(selectionKey) : null,
    dragging: false
  };
  if (selectionKey && anchor) {
    controls.enabled = false;
    renderer.domElement.setPointerCapture(event.pointerId);
  }
}

renderer.domElement.addEventListener('pointerdown', handleViewerPointerDown, true);

renderer.domElement.addEventListener('pointermove', (event) => {
  lastViewerPointer={clientX:event.clientX,clientY:event.clientY};
  if(pointerDown?.rotating)return;
  if (pointerDown?.primeTower) { movePrimeTowerDrag(event); return; }
  if (!pointerDown) renderer.domElement.style.cursor=sceneHitAtPointer(event)?.primeTower?'grab':'';
  if (!pointerDown || pointerDown.id !== event.pointerId || !pointerDown.selectionKey || !pointerDown.anchor) return;
  const distance = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
  if (!pointerDown.dragging && distance < 3) return;
  pointerDown.dragging = true;
  renderer.domElement.classList.add('object-dragging');
  const point = pointAtPointerOnPlane(event, pointerDown.planeY);
  if (!point) return;
  const deltaX = point.x - pointerDown.anchor.x;
  const deltaZ = point.z - pointerDown.anchor.z;
  setObjectOffset(
    pointerDown.selectionKey,
    pointerDown.startOffset.x + deltaX,
    pointerDown.startOffset.z + deltaZ,
    { persist: false }
  );
  if (selectionHelper) {
    const meshes = selectedMeshes();
    selectionHelper.children.forEach((outline, index) => {
      if (meshes[index]) outline.position.copy(meshes[index].position);
    });
  }
  const box = combinedBox(selectedMeshes());
  if (box) {
    const size = box.getSize(new THREE.Vector3());
    selectionLabelWorld = new THREE.Vector3((box.min.x + box.max.x) / 2, box.max.y + Math.max(2, size.y * 0.08), (box.min.z + box.max.z) / 2);
    const offset = storedObjectOffset(pointerDown.selectionKey);
    const record = objectRecordForSelection(activePlate(), pointerDown.selectionKey);
    selectionLabelDimensions.textContent = `Plate ${currentObjectPlate(record)}${record?.moved_plate?` · from ${record.originalPlateId}`:''} · X ${offset.x.toFixed(1)} · Y ${offset.z.toFixed(1)}`;
  }
  updatePlateFitStatus();
});

renderer.domElement.addEventListener('pointercancel', () => finishObjectDrag({cancelled:true}));

function handleViewerPointerUp(event) {
  if (pointerDown?.rotating) return;
  if (!pointerDown || pointerDown.id !== event.pointerId || event.button !== 0) return;
  const down = pointerDown;
  if (down.primeTower) { event.preventDefault(); event.stopImmediatePropagation(); finishObjectDrag(); return; }
  const distance = Math.hypot(event.clientX - down.x, event.clientY - down.y);
  if (down.additive) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const hit = distance <= 4 ? sceneHitAtPointer(event) : null;
    finishObjectDrag();
    if (hit?.selectionKey && hit.selectionKey === down.selectionKey && hit.plateKey === down.plateKey) toggleSceneSelection(hit);
    return;
  }
  if (down.dragging) { finishObjectDrag(); return; }
  finishObjectDrag();
  if (distance > 4) return;
  const upHit = sceneHitAtPointer(event);
  const upKey = upHit?.plateKey === activePlateKey ? upHit.selectionKey : null;
  if (down.selectionKey !== upKey) return;
  if (upKey) {
    const record = objectRecordForSelection(activePlate(), upKey);
    batchSelectedObjectIds = new Set(record ? [record.id] : []);
    selectObject(upKey, false, { preserveBatch: true });
  } else {
    batchSelectedObjectIds.clear();
    selectObject('all', false);
  }
}

renderer.domElement.addEventListener('pointerup', handleViewerPointerUp, true);

renderer.domElement.addEventListener('keydown', (event) => {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key) || event.defaultPrevented) return;
  if (!selectedPrimeTowerPlateId && selectedObjectId === 'all') return;
  event.preventDefault();
  const step = event.altKey ? 0.1 : event.shiftKey ? 10 : 1;
  const deltaX = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0;
  const deltaZ = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0;
  if (selectedPrimeTowerPlateId) { nudgePrimeTower(deltaX,deltaZ); return; }
  if (moveSelectionBy(deltaX, deltaZ)) {
    setStatus(`Object nudged ${step} mm. Hold Shift for 10 mm or Option/Alt for 0.1 mm.`);
  }
});

const historyShortcuts = new HeldHistoryShortcut(
  action => action === 'undoColorArrangement' ? undoWorkspaceColorArrangement() : action === 'undo' ? undoObjectEdit() : redoObjectEdit(),
  target => objectShortcutAllowed(target, true) && objectShortcutAllowed(document.activeElement, true),
  { onError: error => setStatus(error.message, true) }
);
document.addEventListener('keydown', handleObjectRemovalShortcut, true);
document.addEventListener('keyup', event => historyShortcuts.keyUp(event));
window.addEventListener('blur', () => historyShortcuts.stop());
document.addEventListener('visibilitychange', () => { if (document.hidden) historyShortcuts.stop(); });
document.addEventListener('focusin', event => { if (!objectShortcutAllowed(event.target, true)) historyShortcuts.stop(); });
document.addEventListener('keydown', handleObjectRotationShortcut);

form.addEventListener('input', (event) => {
  const plate = activePlate();
  const input = event.target;
  if (plate) {
    const instance = plate.batchInstances?.find(item => `instance:${item.id}` === selectedObjectId);
    const instanceParam = instance && parameters.find(item => item.name === input?.name);
    if (instanceParam) {
      instance.configuration.parameters[instanceParam.name] = valueFromParameterInput(instanceParam, input);
      if (plate.objectRecords[selectedObjectId]) {
        plate.objectRecords[selectedObjectId].configuration = structuredClone(instance.configuration);
        plate.objectRecords[selectedObjectId].parameterRevision = (plate.objectRecords[selectedObjectId].parameterRevision || 0) + 1;
      }
      plate.batchDirty = true; preparedExport = null;
      generateBtn.classList.add('dirty'); persistUploadedPlates(); markPlateCardDirty(plate); scheduleAutoRegenerate();
      return;
    }
    plate.baseValues ||= valuesFromParameters(plate.parameters);
    const name = input?.name;
    const param = name ? parameters.find((candidate) => candidate.name === name) : null;
    if (param) {
      const value = valueFromParameterInput(param, input);
      if (selectedObjectId !== 'all') {
        plate.objectRecords ||= {};
        const record = plate.objectRecords[selectedObjectId] ||= { selectionKey: selectedObjectId };
        record.parameterOverrides ||= {};
        if (JSON.stringify(value) === JSON.stringify(plate.values[name])) delete record.parameterOverrides[name];
        else record.parameterOverrides[name] = structuredClone(value);
        record.parameterRevision = (record.parameterRevision || 0) + 1;
        plate.batchDirty = true;
      } else {
        plate.values[name] = value;
        plate.baseValues[name] = structuredClone(value);
      }
      preparedExport = null;
    } else {
      // Defensive fallback for custom controls that dispatch a synthetic input
      // event without a parameter name.
      plate.values = getValues();
    }
  }
  generateBtn.classList.add('dirty');
  renderParametricRulesState();
  setStatus(accountPreferences.workspace.autoRegenerate ? 'Preview update queued.' : 'Changes ready. Click Generate all to update the preview.');
  persistUploadedPlates();
  markPlateCardDirty(plate);
  scheduleAutoRegenerate();
});
parameterSearch.addEventListener('input', onNextAnimationFrame(applySearch));
generateBtn.addEventListener('click', () => {
  generatePendingPreviews();
});
preflightBtn.addEventListener('click', openPreflight);
closePreflightBtn.addEventListener('click', closePreflight);
rerunPreflightBtn.addEventListener('click', runPreflight);
preflightModal.addEventListener('click', (event) => { if (event.target?.matches?.('[data-preflight-close]')) closePreflight(); });
mfBtn.addEventListener('click', openExportMenu);
exportMenuLayer.addEventListener('click', (event) => { if (event.target.closest('[data-export-close]')) closeExportMenu(); });
exportAllBtn.addEventListener('click', () => void downloadGeneric3mf());
exportChooseBtn.addEventListener('click', showExportPlateChoice);
exportBackBtn.addEventListener('click', showExportChoice);
exportSelectAllBtn.addEventListener('click', () => { for (const input of exportPlateOptions.querySelectorAll('input[type="checkbox"]')) input.checked = true; });
exportClearBtn.addEventListener('click', () => { for (const input of exportPlateOptions.querySelectorAll('input[type="checkbox"]')) input.checked = false; });
exportSelectedBtn.addEventListener('click', () => {
  const ids = selectedExportPlateIds();
  if (!ids.length) { setStatus('Choose at least one populated plate to export.', true); return; }
  void downloadGeneric3mf(ids);
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (!filamentMenuLayer.hidden) { event.preventDefault(); closeFilamentMenu(); return; }
  if (!exportMenuLayer.hidden) { event.preventDefault(); closeExportMenu(); }
});
function animatePanelResize(duration = 340) {
  panelResizeSuspended = true;
  requestRender();
  if (panelResizeFrame !== null) cancelAnimationFrame(panelResizeFrame);
  const started = performance.now();
  const animationDuration = document.documentElement.dataset.reduceMotion === 'true' || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : duration;
  const tick = (now) => {
    resize(true);
    controls.update();
    renderer.render(scene, camera);
    updateSelectionLabelPosition();
    if (now - started < animationDuration) {
      panelResizeFrame = requestAnimationFrame(tick);
      return;
    }
    panelResizeFrame = null;
    panelResizeSuspended = false;
    resize(true);
    requestRender();
  };
  panelResizeFrame = requestAnimationFrame(tick);
}

function setControlsOpen(open) {
  root.classList.toggle('sidebar-hidden', !open);
  controlsEdgeToggle.classList.toggle('panel-open', open);
  controlsEdgeToggle.setAttribute('aria-expanded', String(open));
  controlsEdgeToggle.setAttribute('aria-label', open ? 'Collapse controls' : 'Expand controls');
  controlsEdgeToggle.title = open ? 'Collapse controls' : 'Expand controls';
  controlsEdgeToggle.querySelector('span').textContent = open ? '‹' : '›';
  animatePanelResize();
}

function setPrintSettingsOpen(open) {
  if (!open) closeFilamentMenu({ restoreFocus: false });
  printDrawer.classList.toggle('open', open);
  viewerPanel.classList.toggle('print-settings-open', open);
  printSettingsEdgeToggle.classList.toggle('panel-open', open);
  printDrawer.setAttribute('aria-hidden', String(!open));
  printSettingsEdgeToggle.setAttribute('aria-expanded', String(open));
  printSettingsEdgeToggle.setAttribute('aria-label', open ? 'Collapse print settings' : 'Expand print settings');
  printSettingsEdgeToggle.title = open ? 'Collapse print settings' : 'Expand print settings';
  printSettingsEdgeToggle.querySelector('span').textContent = open ? '›' : '‹';
  animatePanelResize();
}

controlsEdgeToggle.addEventListener('click', () => {
  setControlsOpen(root.classList.contains('sidebar-hidden'));
});


presetTarget.addEventListener('change', () => {
  const preset = parametricPresets.find((item) => item.id === presetTarget.value);
  presetName.value = preset?.name || '';
  presetCategory.value = preset?.category || '';
  renderPresetParameterList(Object.keys(preset?.values || {}));
});
selectAllParamsBtn.addEventListener('click', () => { for (const input of presetParameterList.querySelectorAll('input[type="checkbox"]')) input.checked = true; });
clearParamsBtn.addEventListener('click', () => { for (const input of presetParameterList.querySelectorAll('input[type="checkbox"]')) input.checked = false; });
selectChangedParamsBtn.addEventListener('click', () => {
  const values = getValues();
  for (const input of presetParameterList.querySelectorAll('input[type="checkbox"]')) {
    const param = parameters.find((item) => item.name === input.value);
    input.checked = Boolean(param) && JSON.stringify(values[param.name]) !== JSON.stringify(param.default);
  }
});
savePresetBtn.addEventListener('click', () => {
  const plate = activePlate();
  const names = checkedPresetParameterNames();
  const name = presetName.value.trim();
  if (!plate || !name || !names.length) return setWorkflowMessage('Enter a name and select at least one parameter.', true);
  const values = getValues();
  const savedValues = Object.fromEntries(names.map((key) => [key, structuredClone(values[key])]));
  const parameterTypes = Object.fromEntries(names.map((key) => [key, parameters.find((param) => param.name === key)?.type || 'raw']));
  let preset = parametricPresets.find((item) => item.id === presetTarget.value);
  if (preset) {
    preset.name = name;
    preset.category = presetCategory.value.trim() || 'General';
    preset.values = savedValues;
    preset.parameterTypes = parameterTypes;
    preset.components = structuredClone(plate.components);
    preset.updatedAt = new Date().toISOString();
  } else {
    preset = {
      id: createPersistentId('preset'), name, category: presetCategory.value.trim() || 'General',
      values: savedValues, parameterTypes, components: structuredClone(plate.components),
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    parametricPresets.push(preset);
  }
  activePresetIds = [preset.id];
  persistWorkflowState();
  applyActivePresetStack({ announce: false });
  presetTarget.value = preset.id;
  presetName.value = preset.name;
  presetCategory.value = preset.category;
  renderPresetParameterList(Object.keys(preset.values));
  setWorkflowMessage(`${preset.name} saved.`);
});
applyParametricRulesBtn?.addEventListener('click', applyParametricRulesFromEditor);
parametricRulesEditor?.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') { event.preventDefault(); applyParametricRulesFromEditor(); }
});
variantSearch.addEventListener('input', renderPresetUi);
variantParameterSearch.addEventListener('input', filterVariantParameters);

addScadBtn.addEventListener('click', () => scadFileInput.click());
document.querySelector('#workspaceAddModelBtn').addEventListener('click', () => scadFileInput.click());
workspaceSampleBtn.addEventListener('click', async () => {
  if (scadUploadInProgress) return;
  workspaceSampleBtn.disabled = true;
  workspaceSampleBtn.textContent = 'Opening example…';
  try {
    const response = await fetch('/starter-name-tag.scad?v=1');
    if (!response.ok) throw new Error('The example could not be loaded. Try again or add your own model.');
    await uploadScadFiles([new File([await response.text()], 'starter-name-tag.scad', { type: 'text/plain' })]);
  } catch (error) { setStatus(error.message, true); }
  finally { workspaceSampleBtn.disabled = false; workspaceSampleBtn.textContent = 'Try a name tag'; }
});
removeActivePlateBtn.addEventListener('click', () => {
  if (!activeViewPlateId || !visiblePlateIds().includes(activeViewPlateId)) return;
  if (pendingPlateRemovalKey === activeViewPlateId) {
    removeBuildPlate(activeViewPlateId);
    return;
  }
  pendingPlateRemovalKey = activeViewPlateId;
  clearTimeout(pendingPlateRemovalTimer);
  pendingPlateRemovalTimer = setTimeout(() => {
    pendingPlateRemovalKey = null;
    pendingPlateRemovalTimer = null;
    renderPlateList();
  }, 4000);
  renderPlateList();
});
scadFileInput.addEventListener('change', () => uploadScadFiles(scadFileInput.files));
for (const eventName of ['dragenter', 'dragover']) {
  viewer.addEventListener(eventName, (event) => {
    event.preventDefault();
    if ([...event.dataTransfer.items].some((item) => item.kind === 'file')) viewer.classList.add('drag-over');
  });
}
viewer.addEventListener('dragleave', (event) => {
  if (!viewer.contains(event.relatedTarget)) viewer.classList.remove('drag-over');
});
viewer.addEventListener('drop', (event) => {
  event.preventDefault();
  viewer.classList.remove('drag-over');
  uploadScadFiles(event.dataTransfer.files);
});

printSettingsEdgeToggle.addEventListener('click', () => {
  setPrintSettingsOpen(!printDrawer.classList.contains('open'));
});
closePrintSettingsBtn.addEventListener('click', () => {
  setPrintSettingsOpen(false);
});
bambuFilamentRow?.setAttribute('aria-haspopup', 'dialog');
bambuFilamentRow?.setAttribute('aria-expanded', 'false');
bambuFilamentRow?.addEventListener('click', openFilamentMenu);
filamentMenuLayer?.addEventListener('click', (event) => { if (event.target.closest('[data-filament-close]')) closeFilamentMenu(); });
closeFilamentMenuBtn?.addEventListener('click', () => closeFilamentMenu());
filamentSettingsForm?.addEventListener('input', handlePrintSettingEdit);
filamentSettingsForm?.addEventListener('change', handlePrintSettingEdit);
bambuGlobalModeBtn?.addEventListener('click', () => setPrintSettingsScope('global'));
bambuObjectsModeBtn?.addEventListener('click', () => setPrintSettingsScope('object'));
function handlePrintSettingEdit(event) {
  const input = event.target;
  const item = input?.name ? PRINT_SETTING_ITEM_BY_KEY.get(input.name) : null;
  if (!item) return;
  const value = printValueFromInput(item, input);
  if (printSettingsScope === 'object' && item.scope === 'process' && !item.globalOnly) {
    const record = activeObjectPrintRecord();
    if (!record) return;
    record.printOverrides ||= {};
    if (samePrintValue(value, printProfile.settings[item.key])) delete record.printOverrides[item.key];
    else record.printOverrides[item.key] = structuredClone(value);
    persistUploadedPlates();
  } else {
    if (value === undefined) delete printProfile.settings[item.key];
    else printProfile.settings[item.key] = value;
    // A direct control edit supersedes a stale override of the same key in JSON.
    try {
      const advanced=normalizedAdvanced();
      if(Object.hasOwn(advanced,item.key)) {
        delete advanced[item.key];printProfile.advanced=advanced;
        advancedJson.value=Object.keys(advanced).length?JSON.stringify(advanced,null,2):'';
      }
    } catch {}
    persistWorkflowState();
  }
  preparedExport = null;
  updatePrintModifiedHighlights();
  if (bambuFilamentSummary && item.key === 'filament_type') bambuFilamentSummary.textContent = `Generic ${value || 'PLA'}`;
  if (event.type === 'change' && item.key === 'layer_height') {
    const nozzle = Number(nozzleDiameterSelect.value) || 0.4;
    const { min, max } = layerHeightBounds(nozzle);
    if (!Number.isFinite(value) || value < min || value > max) {
      setStatus(layerHeightRangeError(value, nozzle), true);
    } else {
      setStatus(`Layer height set to ${value} mm. It will be used when the exported 3MF is sliced.`);
    }
  }
  if (event.type === 'change') {
    const towerWarning=refreshWorkspacePrimeTowers();
    buildPlateReference();
    if(towerWarning)setStatus(towerWarning,true);
  }
  if(item.key==='enable_prime_tower') {
    const toggle=document.querySelector('#primeTowerToggle');if(toggle)toggle.checked=Boolean(value);
  }
}
document.querySelector('#primeTowerToggle')?.addEventListener('change',event=>{
  const input=printInputForKey('enable_prime_tower');
  input.checked=event.target.checked;
  handlePrintSettingEdit({type:'change',target:input});
});
printSettingsForm.addEventListener('input', handlePrintSettingEdit);
printSettingsForm.addEventListener('change', handlePrintSettingEdit);
advancedJson.addEventListener('input', () => { preparedExport = null; updatePrintModifiedHighlights(); persistWorkflowState(); });
advancedJson.addEventListener('change', () => {
  const towerWarning=refreshWorkspacePrimeTowers();buildPlateReference();
  if(towerWarning)setStatus(towerWarning,true);
});
printSettingSearch.addEventListener('input', onNextAnimationFrame(applyPrintSearch));
profileMenuButton.addEventListener('click', () => {
  const opening = profileMenu.hidden;
  profileMenu.hidden = !opening;
  profileMenuButton.setAttribute('aria-expanded', String(opening));
});
addProfileBtn.addEventListener('click', beginNewPrintProfile);
cancelNewProfileBtn.addEventListener('click', cancelNewPrintProfile);
document.addEventListener('click', (event) => {
  if (!profileMenu.hidden && !event.target.closest('.profile-menu-wrap')) closeProfileMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !profileMenu.hidden) closeProfileMenu();
});
function scheduleProfileSave() {
  preparedExport = null;
  refreshWorkspacePrimeTowers(); buildPlateReference();
  updatePrintModifiedHighlights();
  persistWorkflowState();
}
profileName.addEventListener('input', scheduleProfileSave);
printerSelect.addEventListener('change', () => { setPrinter(printerSelect.value); scheduleProfileSave(); });
nozzleDiameterSelect.addEventListener('change', () => {
  printProfile.nozzleDiameter = Number(nozzleDiameterSelect.value) || 0.4;
  updateLayerHeightConstraint();
  buildPlateReference();
  scheduleProfileSave();
});
bedTypeSelect.addEventListener('change', () => { printProfile.bedType = bedTypeSelect.value; scheduleProfileSave(); });
function clearWorkspaceColorArrangement() {
  const wasEnabled=workspaceColorOptimization.enabled;
  workspaceColorOptimization.enabled=false;
  reduceColorChanges.checked=false;
  preparedExport=null;
  if(wasEnabled)markWorkspaceDirty();
}

function applyWorkspaceColorArrangement(report, printer, settings = workspaceColorOptimization) {
  const nextSettings = colorOptimizationSettings({ ...settings, enabled:true });
  const entries=new Map(allObjectEntries().map(entry=>[entry.record.id,entry]));
  const changes=report.objects.map(item=>{
    const entry=entries.get(item.id);
    if(!entry)throw new Error('An object changed while arranging. Try again.');
    return {...entry,item,offset:storedObjectOffset(entry.record.selectionKey,entry.plate)};
  });
  rememberObjectEdit({type:'move',colorOptimization:structuredClone(workspaceColorOptimization),primeTowers:structuredClone(workspacePrimeTowers),activeViewPlateId,sourcePlateIds:plates.map(({key,defaultPlateId})=>({key,defaultPlateId})),batchPlateMeta:structuredClone(batchPlateMeta),loadedPlateIds:[...loadedPlateIds],changes:changes.map(({plate,record,offset})=>({plateKey:plate.key,selectionKey:record.selectionKey,plateId:record.plateId,offset}))});
  for(const {plate,record,item,offset} of changes) {
    moveObjectToPlate(record,ensureBatchPlate(item.plateId),plate.defaultPlateId);
    ensurePhysicalPlateId(item.plateId);
    plate.objectTransforms[record.selectionKey]=optimizedEditorOffset(offset,item.transform,printer);
    const instance=plate.batchInstances?.find(candidate=>candidate.id===record.id);
    if(instance)instance.plateId=record.plateId;
  }
  const occupied=new Set(allObjectEntries().map(({plate,record})=>record.plateId || plate.defaultPlateId));
  const fallback=report.objects[0]?.plateId;
  for(const plate of plates) {
    if(!occupied.has(plate.defaultPlateId)) {
      plate.defaultPlateId=Object.values(plate.objectRecords || {}).find(record=>!record.deleted && occupied.has(record.plateId))?.plateId || fallback;
    }
  }
  loadedPlateIds=new Set(occupied);
  for(const id of Object.keys(batchPlateMeta))if(!occupied.has(id))delete batchPlateMeta[id];
  clearPlateRemovalConfirmation();
  workspaceColorOptimization=nextSettings;
  workspacePrimeTowers=structuredClone(report.primeTowers || []);
  workspaceMaxObjectsPerPlate=normalizeMaxObjectsPerPlate(report.maxObjectsPerPlate ?? workspaceMaxObjectsPerPlate);
  reduceColorChanges.checked=true;
  preparedExport=null;
  activeViewPlateId=report.objects[0]?.plateId || activeViewPlateId;
  applyBatchPlateVisibility();
  persistUploadedPlates();
  renderWorkflowUi();renderPlateList();updatePlateFitStatus();fitAllPlates();
  setStatus(`Best arrangement found: ${report.plateCount} plate${report.plateCount===1?'':'s'}${report.estimatedSwaps===null?'':` · ~${report.estimatedSwaps} estimated color changes`}${nextSettings.maxColorChanges===undefined?'':` · limit ${nextSettings.maxColorChanges}`}. Cmd/Ctrl + Enter / Return to undo and turn off Reduce color changes.`);
}

initColorBudgetUi({
  checkbox:reduceColorChanges, button:document.querySelector('#colorBudgetButton'), dialog:document.querySelector('#colorBudgetDialog'),
  getSettings:()=>workspaceColorOptimization,
  maximumDefaultsToAllColors:true,
  focusWorkspace:()=>renderer.domElement.focus({preventScroll:true}),
  onError:error=>setStatus(`Color arrangement: ${error.message}`,true),
  apply:(settings,signal,onArrangementStatus)=>downloadGeneric3mf(null,{arrangeOnly:true,arrangementSettings:settings,signal,onArrangementStatus}),
  disable:()=>{clearWorkspaceColorArrangement();markWorkspaceDirty();}
});
if (useBambuDefaultsBtn) useBambuDefaultsBtn.addEventListener('click', async () => {
  useBambuDefaultsBtn.disabled = true;
  if (bambuPresetSource) {
    bambuPresetSource.hidden = false;
    bambuPresetSource.classList.remove('error');
    bambuPresetSource.title = '';
    bambuPresetSource.textContent = 'Loading defaults…';
  }
  try {
    const profile = getPrintProfileFromUi();
    const defaults = await fetchJson('/api/bambu-defaults', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profile }) });
    applyPrintProfile({ ...profile, settings: { ...profile.settings, ...defaults.settings } }, { setBaseline: false });
    if (bambuPresetSource) {
      bambuPresetSource.textContent = 'Bambu defaults applied';
      bambuPresetSource.title = `${defaults.processName} · ${defaults.filamentName}`;
    }
    showProfileToast('Bambu defaults loaded');
  } catch (error) {
    if (bambuPresetSource) {
      bambuPresetSource.textContent = error.message;
      bambuPresetSource.classList.add('error');
    }
    setStatus(error.message, true);
  } finally { useBambuDefaultsBtn.disabled = false; }
});
resetPrintBtn.addEventListener('click', () => applyPrintProfile(structuredClone(printProfileBaseline), { setBaseline: false }));
savePrintBtn.addEventListener('click', savePrintProfile);
downloadProfileBtn.addEventListener('click', () => {
  try {
    const profile = getPrintProfileFromUi();
    downloadBlob(new Blob([`${JSON.stringify(profile, null, 2)}\n`], { type: 'application/json' }), 'print-settings.json');
  } catch (error) {
    setStatus(error.message, true);
  }
});


const plateShortcutBuffer = new PlateShortcutBuffer((plateId, selectedIds) => {
  const shortcut = plateShortcutAction(plateId, true);
  if (!shortcut || !selectedIds?.size || !objectShortcutAllowed(document.activeElement, true)) return;
  const existingIds = new Set(allObjectEntries().map(({ record }) => record.id));
  const remaining = new Set([...selectedIds].filter(id => existingIds.has(id)));
  if (!remaining.size) return;
  batchSelectedObjectIds = remaining;
  assignObjectIdsToPlate(remaining, shortcut.plateId);
  const message = `${remaining.size} selected object${remaining.size === 1 ? '' : 's'} moved to Plate ${plateId}.`;
  setWorkflowMessage(message); setStatus(message); centerPlateIdInView(plateId);
}, { pending: letter => setStatus(`Plate ${letter} selected… type 0–9 to use ${letter}0–${letter}9.`) });
window.addEventListener('blur', () => plateShortcutBuffer.cancel());
document.addEventListener('focusin', event => { if (!objectShortcutAllowed(event.target, true)) plateShortcutBuffer.cancel(); });
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') { if (plateShortcutBuffer.handle(event)) event.preventDefault(); return; }
  if (!workflowModal.hidden || !objectShortcutAllowed(event.target, true)) { plateShortcutBuffer.cancel(); return; }
  if (event.metaKey || event.ctrlKey || event.altKey || event.defaultPrevented) return;
  const selectedIds = new Set(batchSelectedObjectIds);
  if (selectedObjectId !== 'all') {
    const record = objectRecordForSelection(activePlate(), selectedObjectId);
    if (record) selectedIds.add(record.id);
  }
  if (!selectedIds.size) {
    if (event.shiftKey && /^[a-z]$/i.test(event.key)) { event.preventDefault(); setStatus('Select an object before using Shift + A–Z, optionally followed by 0–9.', true); }
    return;
  }
  if (plateShortcutBuffer.handle(event, selectedIds)) event.preventDefault();
});

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && !event.altKey && String(event.key).toLowerCase() === 's') {
    event.preventDefault();
    saveCurrentWorkspace();
  }
});

workspaceName.addEventListener('input', markWorkspaceDirty);
saveWorkspaceBtn.addEventListener('click', saveCurrentWorkspace);
function setAppMenuOpen(open) {
  appMenu.hidden = !open;
  appMenuButton.setAttribute('aria-expanded', String(open));
  appMenuButton.setAttribute('aria-label', open ? 'Close workspace menu' : 'Open workspace menu');
}
function setAccountSettingsOpen(open) {
  document.body.classList.toggle('settings-open', open);
  requestRender();
  accountSettingsModal.hidden = !open;
  accountSettingsModal.setAttribute('aria-hidden', String(!open));
}

const accountSettings = initAccountSettings({
  state: { get preferences() { return accountPreferences; }, set preferences(value) { accountPreferences = value; } },
  fetchJson, saveAccountPreferences, applyAppearancePreferences, downloadBlob,
  setOpen: setAccountSettingsOpen, onBeforeOpen: () => setAppMenuOpen(false),
  onProfile: result => {
    accountEmail.textContent = result.displayName || result.email;
    accountAvatar.textContent = (result.displayName || result.email).slice(0, 1).toUpperCase();
  },
  onStorageDelete: node => {
    if (node.kind === 'workspaces' && node.id === workspaceId) { allowWorkspaceExit = true; window.location.assign('/projects'); }
  },
  onWorkspaceChange: () => { scheduleAutoSave(); scheduleAutoRegenerate(); },
  onExit: () => { allowWorkspaceExit = true; },
  onClose: () => {
    if (settingsOnlyMode) { allowWorkspaceExit = true; window.location.assign('/projects'); }
    else accountSettingsBtn.focus();
  }
});
const openAccountSettings = accountSettings.open;

appMenuButton.addEventListener('click', (event) => {
  event.stopPropagation();
  setAppMenuOpen(appMenu.hidden);
});
accountSettingsBtn.addEventListener('click', openAccountSettings);
workspaceHistoryBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  void openWorkspaceHistory();
});
closeWorkspaceHistoryBtn.addEventListener('click', closeWorkspaceHistory);
workspaceHistoryModal.addEventListener('click', (event) => { if (event.target?.matches?.('[data-history-close]')) closeWorkspaceHistory(); });
document.addEventListener('click', (event) => {
  if (!appMenu.hidden && !event.target.closest('.app-menu-wrap')) setAppMenuOpen(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (!appMenu.hidden) setAppMenuOpen(false);
  if (!preflightModal.hidden) closePreflight();
  if (!workspaceHistoryModal.hidden) closeWorkspaceHistory();
  if (!workspaceExitModal.hidden) closeWorkspaceExit();
});
window.addEventListener('beforeunload', (event) => {
  if (!workspaceDirty || allowWorkspaceExit) return;
  event.preventDefault();
  event.returnValue = '';
});

function scheduleCardPreviewOnExit() {
  if (previewScheduledForExit || !/^[0-9a-f-]{36}$/i.test(workspaceId)) return;
  previewScheduledForExit = true;
  void fetch(`/api/workspaces/${encodeURIComponent(workspaceId)}/preview`, {
    method: 'POST',
    credentials: 'same-origin',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: '{}'
  });
}

function closeWorkspaceExit() {
  workspaceExitModal.hidden = true;
  workspaceExitModal.setAttribute('aria-hidden', 'true');
}

function openWorkspaceExit() {
  setAppMenuOpen(false);
  workspaceExitModal.hidden = false;
  workspaceExitModal.setAttribute('aria-hidden', 'false');
  saveWorkspaceExitBtn.focus();
}

function returnToWorkspaces() {
  scheduleCardPreviewOnExit();
  allowWorkspaceExit = true;
  window.location.assign('/projects');
}

document.querySelector('a[href="/projects"]')?.addEventListener('click', (event) => {
  event.preventDefault();
  if (workspaceDirty) {
    openWorkspaceExit();
    return;
  }
  returnToWorkspaces();
});

closeWorkspaceExitBtn.addEventListener('click', closeWorkspaceExit);
workspaceExitModal.addEventListener('click', (event) => {
  if (event.target?.matches?.('[data-workspace-exit-close]')) closeWorkspaceExit();
});
discardWorkspaceExitBtn.addEventListener('click', returnToWorkspaces);
saveWorkspaceExitBtn.addEventListener('click', async () => {
  saveWorkspaceExitBtn.disabled = true;
  discardWorkspaceExitBtn.disabled = true;
  saveWorkspaceExitBtn.textContent = 'Saving…';
  const saved = await saveCurrentWorkspace();
  if (saved) {
    returnToWorkspaces();
    return;
  }
  saveWorkspaceExitBtn.disabled = false;
  discardWorkspaceExitBtn.disabled = false;
  saveWorkspaceExitBtn.textContent = 'Save & leave';
});

window.addEventListener('pagehide', scheduleCardPreviewOnExit);

async function init() {
  if (!/^[0-9a-f-]{36}$/i.test(workspaceId) && !settingsOnlyMode) {
    allowWorkspaceExit = true;
    window.location.replace('/projects');
    return;
  }
  try {
    const bootstrap = await fetchJson(settingsOnlyMode ? '/api/auth/session' : `/api/workspaces/${encodeURIComponent(workspaceId)}/bootstrap`);
    const user = bootstrap.user;
    if (!user) { window.location.replace('/login'); return; }
    accountPreferences = user.preferences || accountPreferences;
    applyAppearancePreferences();
    accountEmail.textContent = user.displayName || user.email;
    accountAvatar.textContent = (user.displayName || user.email).slice(0, 1).toUpperCase() || 'P';
    if (settingsOnlyMode) {
      workspaceHydrating = false;
      await openAccountSettings();
      return;
    }
    initializeWorkflowState();
    populatePrinterSelectors();
    buildPrintSettingsUi();
    profileFileName.textContent = bootstrap.printProfile.profileFile || 'Unsaved defaults';
    applyPrintProfile(bootstrap.workspace?.data?.printProfile || bootstrap.printProfile.profile);
    populateProfileMenu(bootstrap.printProfiles.profiles, bootstrap.printProfiles.selectedId);
    const { runtime, workspace, models } = bootstrap;
    runtimeOpenScadReady = Boolean(runtime.openscadReady);
    runtimeRenderSlots = Math.max(1, Math.min(16, Number(runtime.renderSlots) || runtimeRenderSlots));
    void loadFontLibrary();
    generateBtn.disabled = !runtime.openscadReady;
    mfBtn.disabled = !runtime.openscadReady;
    workspaceName.value = workspace.name;
    await restoreWorkspaceSession(workspace.data, Boolean(runtime.openscadReady), models);
    if (typeof initProductionDashboard === 'function') productionDashboard = initProductionDashboard({
      fetchJson,
      getWorkspaceSnapshot: workspaceSnapshot,
      renderLegacyVariants: renderWorkflowUi,
      getProductionRules: () => structuredClone(parametricRules),
      getPrintProfile: getPrintProfileFromUi,
      loadTemplate: async (template) => {
        await restoreWorkspaceSession(template.workspaceSnapshot, runtimeOpenScadReady);
        if (template.printProfile) applyPrintProfile(template.printProfile);
        markWorkspaceDirty();
        if (runtimeOpenScadReady && plates.length) await generatePendingPreviews({ reason: 'Applying production template' });
      }
    });
    workspaceHydrating = false;
    workspaceDirty = false;
    updateWorkspaceSaveUi();
    if (runtime.openscadReady && accountPreferences.workspace.autoRegenerate && plates.length) {
      await generatePendingPreviews({ reason: 'Opening workspace' });
    }
  } catch (error) {
    workspaceHydrating = false;
    setStatus(error.message, true);
    viewerMessage.hidden = false;
    viewerMessage.textContent = error.message;
    updateWorkspaceSaveUi();
  } finally {
    viewerMessage.classList.remove('generating');
  }
}



init();
