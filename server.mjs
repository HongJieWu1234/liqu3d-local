import { createNativeFontIdentity } from './lib/native-font-cache.mjs';
import { createAccountStorage } from './lib/account-storage.mjs';
import { renderWorkspacePreview } from './lib/workspace-preview-worker.mjs';
import { colorOptimizationSettings } from './public/color-optimization.js';
import { isValidPlateId, plateIdAt } from './public/plate-ids.js';
import { normalizeMaxObjectsPerPlate } from './public/packing-settings.js';
import { createInstantStore } from './lib/instant-store.mjs';
import { createExportHistory } from './lib/export-history.mjs';
import { openExportInBambu, createBambuHandoffStore } from './lib/bambu-launch.mjs';
import { defaultFontParameters, applyFontDefaultsToSource } from './lib/font-defaults.mjs';
import { materializeAssets, verifyFonts, packageSource, assetPath, quarantineUpload } from './lib/instant-assets.mjs';
import { createVariantStore } from './lib/production-variants.mjs';
import { boundRecord } from './public/sku-model.js';
import http from 'node:http';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { isIP } from 'node:net';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash, randomBytes, randomInt, randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { gzip } from 'node:zlib';
import { DatabaseSync } from 'node:sqlite';
import { parseScadParameters, parseScadDocument, valueToScad } from './lib/parser.mjs';
import { inferDesignSelector, objectSelectorDefinition } from './lib/scad-object-selectors.mjs';
import { createDefaultProfile, migratePrintSettings, PRINTERS, PRINT_SETTINGS_GROUPS, SUPPORTED_NOZZLES } from './public/print-settings-schema.js';
import { RenderScheduler, SharedRenders, renderAbortError as abortError } from './lib/render-scheduler.mjs';
import { DiskRenderCache, renderInputCacheKey, canCacheRender } from './lib/render-cache.mjs';
import { supportsSolidParts, renderSolidParts } from './lib/solid-parts.mjs';
import { bambuExportProfile, bambuVendorDefaults } from './lib/bambu-export-profile.mjs';

const bambuHandoffs=createBambuHandoffStore();

const PRINT_SETTING_KEYS = new Set(PRINT_SETTINGS_GROUPS.flatMap((group) => group.settings.map((item) => item.key)));
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.umask(0o077);
const PUBLIC_DIR = path.join(__dirname, 'public');
const MODEL_PATH = path.resolve(process.env.SCAD_MODEL || path.join(__dirname, 'models', 'model.scad'));
const INTERNAL_BIND_OVERRIDE = process.env.PMM_INTERNAL_BIND === '1';
const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT ?? 4175);
const DESKTOP_TOKEN = process.env.LIQU3D_DESKTOP_TOKEN || '';
const PROXY_MODE = '0';
const TRUST_PROXY = PROXY_MODE === '1' || PROXY_MODE === 'cloudflare';
const PUBLIC_ORIGIN = '';
const ALLOWED_HOSTS = new Set(['127.0.0.1', 'localhost', '::1']);
const DATA_DIR = path.resolve(process.env.PMM_DATA_DIR || path.join(__dirname, 'data'));
const DATABASE_PATH = path.join(DATA_DIR, 'accounts.sqlite');
const WORKSPACE_PREVIEW_DIR = path.join(DATA_DIR, 'previews');
const SECURE_COOKIES = PUBLIC_ORIGIN.startsWith('https://');
const SESSION_COOKIE = SECURE_COOKIES ? '__Host-pmm_session' : 'pmm_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const REMEMBERED_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_BODY = 24 * 1024 * 1024;
const MAX_SCAD_FILE_BYTES = 8 * 1024 * 1024;
const MAX_SCAD_FILES_PER_UPLOAD = 24;
const MAX_WORKSPACE_BYTES = 20 * 1024 * 1024;
const MAX_WORKSPACES_PER_ACCOUNT = Number.MAX_SAFE_INTEGER;
const MAX_REVISIONS_PER_WORKSPACE = 25;
const MAX_PRODUCTION_JOBS_PER_ACCOUNT = Math.max(100, Math.min(20000, Number(process.env.PMM_MAX_PRODUCTION_JOBS) || 5000));
const MAX_ACCOUNT_STORAGE_BYTES = Number.MAX_SAFE_INTEGER; // Local disk, no hosted account quota.
const WORKSPACE_PREVIEW_VERSION = 14;
const AVAILABLE_PROCESSORS = Math.max(1, os.availableParallelism?.() || os.cpus().length || 1);
const GIB = 1024 ** 3;
const TOTAL_MEMORY_BYTES = Math.max(GIB, os.totalmem?.() || 8 * GIB);
// Keep enough unified memory for macOS/WindowServer, the browser, Node, GPU
// buffers and filesystem cache. On a 24 GB M4 Pro this yields a ~14 GB render
// budget instead of encouraging swap-heavy all-memory usage.
const AUTO_RENDER_MEMORY_BUDGET_BYTES = Math.max(4 * GIB, Math.min(14 * GIB, TOTAL_MEMORY_BYTES - 10 * GIB));
const RENDER_MEMORY_BUDGET_BYTES = Math.max(2 * GIB, Math.min(64 * GIB, (Number(process.env.OPENSCAD_MEMORY_BUDGET_MB) || Math.floor(AUTO_RENDER_MEMORY_BUDGET_BYTES / 1024 / 1024)) * 1024 * 1024));
const RENDER_SLOT_BYTES = Math.max(1024, Math.min(8192, Number(process.env.OPENSCAD_RENDER_SLOT_MB) || 1024)) * 1024 * 1024;
const AUTO_CPU_RENDER_SLOTS = Math.max(1, Math.floor(AVAILABLE_PROCESSORS * 2 / 3));
const AUTO_MEMORY_RENDER_SLOTS = Math.max(1, Math.floor(RENDER_MEMORY_BUDGET_BYTES / RENDER_SLOT_BYTES));
const CONFIGURED_RENDER_SLOTS = Number(process.env.OPENSCAD_MAX_JOBS);
const MANIFOLD_RENDER_SLOTS = Math.max(1, Math.min(16, CONFIGURED_RENDER_SLOTS || Math.min(8, AUTO_CPU_RENDER_SLOTS, AUTO_MEMORY_RENDER_SLOTS)));
const CONFIGURED_FULL_RENDER_WEIGHT = Number(process.env.OPENSCAD_FULL_RENDER_SLOTS);
const MAX_RENDER_CACHE_BYTES = Math.max(64, Math.min(2048, Number(process.env.OPENSCAD_CACHE_MB) || 1024)) * 1024 * 1024;
const OPENSCAD_RENDER_TIMEOUT_MS = Math.max(10_000, Math.min(10 * 60_000, Number(process.env.OPENSCAD_RENDER_TIMEOUT_MS) || 120000));
const MAX_QUEUED_OPENSCAD = Math.max(1, Math.min(1024, Number(process.env.OPENSCAD_MAX_QUEUE) || 256));
const GENERAL_RATE_LIMIT = Math.max(60, Math.min(10000, Number(process.env.PMM_RATE_LIMIT) || 1200));
const RENDER_RATE_LIMIT = Math.max(10, Math.min(5000, Number(process.env.PMM_RENDER_RATE_LIMIT) || 1200));
const AUTH_FAILURE_LIMIT = Math.max(3, Math.min(100, Number(process.env.PMM_AUTH_FAILURE_LIMIT) || 12));
const TWO_FACTOR_TTL_MS = 10 * 60 * 1000;
const TWO_FACTOR_MAX_ATTEMPTS = 5;
const RENDERER_URL = ''; // This desktop edition always uses native OpenSCAD.
const RENDERER_TOKEN = environmentSecret('PMM_RENDERER_TOKEN').trim();
const RENDERER_TRUST_INTERNAL = process.env.PMM_RENDERER_TRUST_INTERNAL === '1';

if (!Number.isInteger(PORT) || PORT < 0 || PORT > 65535) throw new Error('PORT must be an integer from 0 to 65535.');
if (!['0', '1', 'cloudflare'].includes(PROXY_MODE)) throw new Error('PMM_TRUST_PROXY must be 0, 1, or cloudflare.');
if (RENDERER_URL && !/^https?:\/\//i.test(RENDERER_URL)) throw new Error('PMM_RENDERER_URL must be an HTTP or HTTPS URL.');
if (process.env.NODE_ENV === 'production' && RENDERER_URL && !RENDERER_TRUST_INTERNAL && RENDERER_TOKEN.length < 32) throw new Error('Production remote rendering requires PMM_RENDERER_TOKEN with at least 32 characters unless PMM_RENDERER_TRUST_INTERNAL=1 is explicitly set.');
if (PUBLIC_ORIGIN && !PUBLIC_ORIGIN.startsWith('http://') && !PUBLIC_ORIGIN.startsWith('https://')) {
  throw new Error('PMM_PUBLIC_ORIGIN must be an HTTP or HTTPS origin.');
}
if (!isLoopbackHost(HOST) && (!PUBLIC_ORIGIN || ALLOWED_HOSTS.size === 0) && process.env.PMM_ALLOW_INSECURE !== '1') {
  throw new Error('Refusing a network-facing start without PMM_PUBLIC_ORIGIN and PMM_ALLOWED_HOSTS.');
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self' blob: data:; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Origin-Agent-Cluster': '?1',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=()',
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'X-Content-Type-Options': 'nosniff',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'X-Frame-Options': 'DENY'
};
if (SECURE_COOKIES) SECURITY_HEADERS['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';

function environmentSecret(name, fallbackFile = '') {
  if (process.env[name] !== undefined) return String(process.env[name]);
  const configuredFile = String(process.env[`${name}_FILE`] || '').trim();
  const filePath = configuredFile || fallbackFile;
  if (!filePath) return '';
  try {
    return fsSync.readFileSync(filePath, 'utf8').replace(/\r?\n$/, '');
  } catch (error) {
    if (!configuredFile && error?.code === 'ENOENT') return '';
    throw new Error(`Unable to read ${name}_FILE: ${error.message}`);
  }
}

function isLoopbackHost(value) {
  return ['127.0.0.1', 'localhost', '::1', '[::1]'].includes(String(value).toLowerCase());
}

function normalizedHostname(value) {
  const raw = String(value || '').split(',')[0].trim().replace(/\.$/, '');
  if (!raw) return '';
  try {
    return new URL(`http://${raw}`).hostname.toLowerCase().replace(/\.$/, '');
  } catch {
    return '';
  }
}

function normalizedOrigin(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    return url.origin;
  } catch {
    throw new Error('PMM_PUBLIC_ORIGIN is invalid.');
  }
}

fsSync.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
fsSync.chmodSync(DATA_DIR, 0o700);
const authDb = new DatabaseSync(DATABASE_PATH);
try { fsSync.chmodSync(DATABASE_PATH, 0o600); } catch {}
authDb.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA busy_timeout = 5000;
  PRAGMA trusted_schema = OFF;
  PRAGMA secure_delete = ON;
  PRAGMA temp_store = MEMORY;
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    display_name TEXT NOT NULL DEFAULT '',
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    password_version INTEGER NOT NULL DEFAULT 3,
    email_verified_at INTEGER,
    two_factor_enabled INTEGER NOT NULL DEFAULT 1,
    settings_json TEXT NOT NULL DEFAULT '{}',
    generation_defaults_version INTEGER NOT NULL DEFAULT 2,
    active_profile_id TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL,
    last_active_at INTEGER NOT NULL DEFAULT 0,
    user_agent TEXT NOT NULL DEFAULT '',
    ip_address TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    expires_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS login_challenges (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    purpose TEXT NOT NULL CHECK (purpose IN ('signup', 'login')),
    attempts INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    sent_at INTEGER NOT NULL,
    pending_password_salt TEXT,
    pending_password_hash TEXT,
    pending_password_version INTEGER
  );
  CREATE TABLE IF NOT EXISTS email_change_challenges (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pending_email TEXT NOT NULL COLLATE NOCASE,
    code_hash TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    sent_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS print_profiles (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    id TEXT NOT NULL,
    name TEXT NOT NULL,
    profile_json TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, id)
  );
  CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    data_json TEXT NOT NULL,
    scad_count INTEGER NOT NULL DEFAULT 0,
    scad_hash TEXT NOT NULL DEFAULT '',
    preview_hash TEXT,
    preview_path TEXT,
    preview_status TEXT NOT NULL DEFAULT 'dirty' CHECK (preview_status IN ('ready', 'dirty', 'generating', 'failed')),
    preview_error TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    last_opened_at INTEGER
  );
  CREATE TABLE IF NOT EXISTS workspace_revisions (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    data_json TEXT NOT NULL,
    data_hash TEXT NOT NULL,
    scad_count INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS production_skus (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code TEXT NOT NULL COLLATE NOCASE,
    name TEXT NOT NULL,
    workspace_id TEXT,
    workspace_snapshot_json TEXT NOT NULL,
    print_profile_json TEXT NOT NULL,
    openscad_version TEXT NOT NULL DEFAULT '',
    workspace_hash TEXT NOT NULL DEFAULT '',
    rules_json TEXT NOT NULL DEFAULT '[]',
    bom_json TEXT NOT NULL DEFAULT '[]',
    quote_json TEXT NOT NULL DEFAULT '{}',
    calibration_json TEXT NOT NULL DEFAULT '{}',
    revision INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    UNIQUE(user_id, code)
  );
  CREATE TABLE IF NOT EXISTS production_jobs (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sku_id TEXT REFERENCES production_skus(id) ON DELETE SET NULL,
    sku_code TEXT NOT NULL DEFAULT '',
    sku_revision INTEGER NOT NULL DEFAULT 1,
    openscad_version TEXT NOT NULL DEFAULT '',
    order_ref TEXT NOT NULL DEFAULT '',
    customer_label TEXT NOT NULL DEFAULT '',
    quantity INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','generated','failed','downloaded')),
    parameters_json TEXT NOT NULL DEFAULT '{}',
    workspace_snapshot_json TEXT NOT NULL,
    print_profile_json TEXT NOT NULL,
    plate_count INTEGER NOT NULL DEFAULT 0,
    colors_json TEXT NOT NULL DEFAULT '[]',
    materials_json TEXT NOT NULL DEFAULT '[]',
    bom_json TEXT NOT NULL DEFAULT '[]',
    quote_json TEXT NOT NULL DEFAULT '{}',
    output_name TEXT NOT NULL DEFAULT '',
    error TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    downloaded_at INTEGER
  );
  CREATE TABLE IF NOT EXISTS customer_configurators (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sku_id TEXT NOT NULL REFERENCES production_skus(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    enabled INTEGER NOT NULL DEFAULT 1,
    allowed_params_json TEXT NOT NULL DEFAULT '[]',
    created_at INTEGER NOT NULL,
    expires_at INTEGER
  );
  CREATE TABLE IF NOT EXISTS production_templates (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    template_json TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS production_components (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    scad_source TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS calibration_profiles (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    printer TEXT NOT NULL,
    nozzle REAL NOT NULL,
    material TEXT NOT NULL,
    values_json TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS order_webhooks (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    enabled INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_sessions_user_expires ON sessions(user_id, expires_at);
  CREATE INDEX IF NOT EXISTS idx_login_challenges_user_expires ON login_challenges(user_id, expires_at);
  CREATE INDEX IF NOT EXISTS idx_email_change_challenges_user_expires ON email_change_challenges(user_id, expires_at);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_email_change_pending_email ON email_change_challenges(pending_email COLLATE NOCASE);
  CREATE INDEX IF NOT EXISTS idx_print_profiles_user_name ON print_profiles(user_id, name COLLATE NOCASE);
  CREATE INDEX IF NOT EXISTS idx_workspaces_user_updated ON workspaces(user_id, updated_at DESC);
  CREATE INDEX IF NOT EXISTS idx_workspace_revisions_lookup ON workspace_revisions(user_id, workspace_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_production_skus_user_code ON production_skus(user_id, code COLLATE NOCASE);
  CREATE INDEX IF NOT EXISTS idx_production_jobs_user_status ON production_jobs(user_id, status, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_customer_configurators_user ON customer_configurators(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_production_templates_user ON production_templates(user_id, updated_at DESC);
  CREATE INDEX IF NOT EXISTS idx_production_components_user ON production_components(user_id, updated_at DESC);
  CREATE INDEX IF NOT EXISTS idx_calibration_profiles_user ON calibration_profiles(user_id, updated_at DESC);
  PRAGMA optimize;
`);

const userColumns = new Set(authDb.prepare('PRAGMA table_info(users)').all().map((column) => String(column.name)));
if (!userColumns.has('password_version')) {
  authDb.exec('ALTER TABLE users ADD COLUMN password_version INTEGER NOT NULL DEFAULT 1;');
}
if (!userColumns.has('email_verified_at')) {
  authDb.exec('ALTER TABLE users ADD COLUMN email_verified_at INTEGER; UPDATE users SET email_verified_at = created_at WHERE email_verified_at IS NULL;');
}
if (!userColumns.has('display_name')) authDb.exec("ALTER TABLE users ADD COLUMN display_name TEXT NOT NULL DEFAULT '';");
if (!userColumns.has('two_factor_enabled')) authDb.exec('ALTER TABLE users ADD COLUMN two_factor_enabled INTEGER NOT NULL DEFAULT 1;');
if (!userColumns.has('settings_json')) authDb.exec("ALTER TABLE users ADD COLUMN settings_json TEXT NOT NULL DEFAULT '{}';");
if (!userColumns.has('generation_defaults_version')) {
  authDb.exec(`
    ALTER TABLE users ADD COLUMN generation_defaults_version INTEGER NOT NULL DEFAULT 1;
    UPDATE users
    SET settings_json = json_set(
      CASE WHEN json_valid(settings_json) THEN settings_json ELSE '{}' END,
      '$.workspace.autoRegenerate', json('true')
    );
  `);
}
// Apply the workspace defaults once; subsequent user choices survive restarts.
authDb.exec(`
  UPDATE users
  SET settings_json = json_patch(
    CASE WHEN json_valid(settings_json) THEN settings_json ELSE '{}' END,
    '{"workspace":{"autoSave":true,"autoRegenerate":false,"autoPosition":true,"instantExport":false}}'
  ), generation_defaults_version = 2
  WHERE generation_defaults_version < 2;
`);
const sessionColumns = new Set(authDb.prepare('PRAGMA table_info(sessions)').all().map((column) => String(column.name)));
if (!sessionColumns.has('last_active_at')) authDb.exec('ALTER TABLE sessions ADD COLUMN last_active_at INTEGER NOT NULL DEFAULT 0; UPDATE sessions SET last_active_at = created_at WHERE last_active_at = 0;');
if (!sessionColumns.has('user_agent')) authDb.exec("ALTER TABLE sessions ADD COLUMN user_agent TEXT NOT NULL DEFAULT '';");
if (!sessionColumns.has('ip_address')) authDb.exec("ALTER TABLE sessions ADD COLUMN ip_address TEXT NOT NULL DEFAULT '';");
const productionJobColumns = new Set(authDb.prepare('PRAGMA table_info(production_jobs)').all().map((column) => String(column.name)));
if (!productionJobColumns.has('quantity')) authDb.exec('ALTER TABLE production_jobs ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1;');
if (!productionJobColumns.has('sku_revision')) authDb.exec('ALTER TABLE production_jobs ADD COLUMN sku_revision INTEGER NOT NULL DEFAULT 1;');
if (!productionJobColumns.has('openscad_version')) authDb.exec("ALTER TABLE production_jobs ADD COLUMN openscad_version TEXT NOT NULL DEFAULT '';");
if (!sessionColumns.has('location')) authDb.exec("ALTER TABLE sessions ADD COLUMN location TEXT NOT NULL DEFAULT '';");
const challengeColumns = new Set(authDb.prepare('PRAGMA table_info(login_challenges)').all().map((column) => String(column.name)));
if (!challengeColumns.has('pending_password_salt')) authDb.exec('ALTER TABLE login_challenges ADD COLUMN pending_password_salt TEXT;');
if (!challengeColumns.has('pending_password_hash')) authDb.exec('ALTER TABLE login_challenges ADD COLUMN pending_password_hash TEXT;');
if (!challengeColumns.has('pending_password_version')) authDb.exec('ALTER TABLE login_challenges ADD COLUMN pending_password_version INTEGER;');
const workspaceColumns = new Set(authDb.prepare('PRAGMA table_info(workspaces)').all().map((column) => String(column.name)));
if (!workspaceColumns.has('kind')) authDb.exec("ALTER TABLE workspaces ADD COLUMN kind TEXT NOT NULL DEFAULT 'workspace'");
if (!workspaceColumns.has('pinned')) authDb.exec('ALTER TABLE workspaces ADD COLUMN pinned INTEGER NOT NULL DEFAULT 0');
if (!workspaceColumns.has('expires_at')) authDb.exec('ALTER TABLE workspaces ADD COLUMN expires_at INTEGER');
authDb.exec("DROP INDEX IF EXISTS temporary_instant_expiry; UPDATE workspaces SET expires_at=NULL WHERE kind='instant' AND expires_at IS NOT NULL; CREATE INDEX IF NOT EXISTS temporary_workspace_expiry ON workspaces(expires_at) WHERE kind='workspace' AND expires_at IS NOT NULL");
if (!workspaceColumns.has('scad_hash')) authDb.exec("ALTER TABLE workspaces ADD COLUMN scad_hash TEXT NOT NULL DEFAULT ''; ");
if (!workspaceColumns.has('preview_hash')) authDb.exec('ALTER TABLE workspaces ADD COLUMN preview_hash TEXT;');
if (!workspaceColumns.has('preview_path')) authDb.exec('ALTER TABLE workspaces ADD COLUMN preview_path TEXT;');
if (!workspaceColumns.has('preview_status')) authDb.exec("ALTER TABLE workspaces ADD COLUMN preview_status TEXT NOT NULL DEFAULT 'dirty';");
if (!workspaceColumns.has('preview_error')) authDb.exec('ALTER TABLE workspaces ADD COLUMN preview_error TEXT;');
if (!workspaceColumns.has('last_opened_at')) authDb.exec('ALTER TABLE workspaces ADD COLUMN last_opened_at INTEGER;');
authDb.exec("UPDATE workspaces SET preview_status = 'dirty' WHERE preview_status = 'generating';");
fsSync.mkdirSync(WORKSPACE_PREVIEW_DIR, { recursive: true, mode: 0o700 });
fsSync.chmodSync(WORKSPACE_PREVIEW_DIR, 0o700);
const storedWorkspaces = authDb.prepare('SELECT id, data_json, scad_hash FROM workspaces').all();
const refreshWorkspaceHash = authDb.prepare(`
  UPDATE workspaces SET scad_hash = ?,
    preview_status = CASE WHEN preview_hash = ? AND preview_path IS NOT NULL THEN 'ready' ELSE 'dirty' END
  WHERE id = ?
`);
for (const row of storedWorkspaces) {
  try {
    const { data } = sanitizeWorkspaceData(JSON.parse(row.data_json));
    const scadHash = workspaceScadHash(data);
    if (scadHash !== row.scad_hash) refreshWorkspaceHash.run(scadHash, scadHash, row.id);
  } catch {}
}

const sql = {
  createUser: authDb.prepare('INSERT INTO users (email, password_salt, password_hash, password_version, email_verified_at, generation_defaults_version, created_at) VALUES (?, ?, ?, ?, NULL, 2, ?)'),
  userByEmail: authDb.prepare('SELECT id, email, display_name, password_salt, password_hash, password_version, email_verified_at, two_factor_enabled, settings_json, created_at FROM users WHERE email = ?'),
  userById: authDb.prepare('SELECT id, email, display_name, password_salt, password_hash, password_version, email_verified_at, two_factor_enabled, settings_json, created_at FROM users WHERE id = ?'),
  updateDisplayName: authDb.prepare('UPDATE users SET display_name = ? WHERE id = ?'),
  updateUserEmail: authDb.prepare('UPDATE users SET email = ?, email_verified_at = ? WHERE id = ?'),
  updateUserSettings: authDb.prepare('UPDATE users SET settings_json = ? WHERE id = ?'),
  updateTwoFactor: authDb.prepare('UPDATE users SET two_factor_enabled = ? WHERE id = ?'),
  deleteUser: authDb.prepare('DELETE FROM users WHERE id = ?'),
  verifyPendingUser: authDb.prepare('UPDATE users SET password_salt = ?, password_hash = ?, password_version = ?, email_verified_at = ? WHERE id = ? AND email_verified_at IS NULL'),
  updatePasswordHash: authDb.prepare('UPDATE users SET password_salt = ?, password_hash = ?, password_version = ? WHERE id = ?'),
  deleteAbandonedUnverifiedUsers: authDb.prepare('DELETE FROM users WHERE email_verified_at IS NULL AND created_at < ?'),
  createLoginChallenge: authDb.prepare('INSERT INTO login_challenges (token_hash, user_id, code_hash, purpose, attempts, created_at, expires_at, sent_at, pending_password_salt, pending_password_hash, pending_password_version) VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?)'),
  loginChallengeByHash: authDb.prepare(`
    SELECT c.token_hash, c.user_id, c.code_hash, c.purpose, c.attempts, c.expires_at, c.sent_at,
      c.pending_password_salt, c.pending_password_hash, c.pending_password_version, u.email
    FROM login_challenges c JOIN users u ON u.id = c.user_id
    WHERE c.token_hash = ? AND c.expires_at > ?
  `),
  deleteLoginChallenge: authDb.prepare('DELETE FROM login_challenges WHERE token_hash = ?'),
  deleteUserLoginChallenges: authDb.prepare('DELETE FROM login_challenges WHERE user_id = ?'),
  deleteExpiredLoginChallenges: authDb.prepare('DELETE FROM login_challenges WHERE expires_at <= ?'),
  incrementLoginChallengeAttempts: authDb.prepare('UPDATE login_challenges SET attempts = attempts + 1 WHERE token_hash = ?'),
  refreshLoginChallenge: authDb.prepare('UPDATE login_challenges SET code_hash = ?, attempts = 0, expires_at = ?, sent_at = ? WHERE token_hash = ?'),
  createEmailChangeChallenge: authDb.prepare('INSERT INTO email_change_challenges (token_hash, user_id, pending_email, code_hash, attempts, created_at, expires_at, sent_at) VALUES (?, ?, ?, ?, 0, ?, ?, ?)'),
  emailChangeChallengeByHash: authDb.prepare('SELECT token_hash, user_id, pending_email, code_hash, attempts, expires_at, sent_at FROM email_change_challenges WHERE token_hash = ? AND expires_at > ?'),
  deleteEmailChangeChallenge: authDb.prepare('DELETE FROM email_change_challenges WHERE token_hash = ?'),
  deleteUserEmailChangeChallenges: authDb.prepare('DELETE FROM email_change_challenges WHERE user_id = ?'),
  deleteExpiredEmailChangeChallenges: authDb.prepare('DELETE FROM email_change_challenges WHERE expires_at <= ?'),
  incrementEmailChangeAttempts: authDb.prepare('UPDATE email_change_challenges SET attempts = attempts + 1 WHERE token_hash = ?'),
  createSession: authDb.prepare('INSERT INTO sessions (token_hash, user_id, created_at, last_active_at, user_agent, ip_address, location, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'),
  sessionByHash: authDb.prepare(`
    SELECT s.token_hash, s.user_id, s.created_at, s.last_active_at, s.expires_at, u.email, u.display_name, u.settings_json, u.two_factor_enabled
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > ? AND u.email_verified_at IS NOT NULL
  `),
  touchSession: authDb.prepare('UPDATE sessions SET last_active_at = ? WHERE token_hash = ?'),
  listUserSessions: authDb.prepare('SELECT token_hash, created_at, last_active_at, user_agent, ip_address, location, expires_at FROM sessions WHERE user_id = ? AND expires_at > ? ORDER BY last_active_at DESC, created_at DESC'),
  deleteSession: authDb.prepare('DELETE FROM sessions WHERE token_hash = ?'),
  deleteUserSession: authDb.prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash = ?'),
  deleteExpiredSessions: authDb.prepare('DELETE FROM sessions WHERE expires_at <= ?'),
  trimUserSessions: authDb.prepare(`
    DELETE FROM sessions
    WHERE user_id = ? AND token_hash NOT IN (
      SELECT token_hash FROM sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 5
    )
  `),
  revokeOtherSessions: authDb.prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash <> ?'),
  countUserSessions: authDb.prepare('SELECT COUNT(*) AS count FROM sessions WHERE user_id = ? AND expires_at > ?'),
  profileCount: authDb.prepare('SELECT COUNT(*) AS count FROM print_profiles WHERE user_id = ?'),
  profileById: authDb.prepare('SELECT id, name, profile_json FROM print_profiles WHERE user_id = ? AND id = ?'),
  activeProfile: authDb.prepare(`
    SELECT p.id, p.name, p.profile_json
    FROM users u LEFT JOIN print_profiles p
      ON p.user_id = u.id AND p.id = u.active_profile_id
    WHERE u.id = ?
  `),
  listProfiles: authDb.prepare(`
    SELECT id, name, profile_json FROM print_profiles
    WHERE user_id = ? ORDER BY name COLLATE NOCASE, id
  `),
  upsertProfile: authDb.prepare(`
    INSERT INTO print_profiles (user_id, id, name, profile_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, id) DO UPDATE SET
      name = excluded.name,
      profile_json = excluded.profile_json,
      updated_at = excluded.updated_at
  `),
  setActiveProfile: authDb.prepare('UPDATE users SET active_profile_id = ? WHERE id = ?'),
  workspaceCount: authDb.prepare('SELECT COUNT(*) AS count FROM workspaces WHERE user_id = ?'),
  accountStorageBytes: authDb.prepare(`
    SELECT
      COALESCE((SELECT SUM(length(CAST(data_json AS BLOB))) FROM workspaces WHERE user_id = ?), 0) +
      COALESCE((SELECT SUM(length(CAST(data_json AS BLOB))) FROM workspace_revisions WHERE user_id = ?), 0) +
      COALESCE((SELECT SUM(length(CAST(profile_json AS BLOB))) FROM print_profiles WHERE user_id = ?), 0) +
      COALESCE((SELECT SUM(length(CAST(workspace_snapshot_json AS BLOB)) + length(CAST(print_profile_json AS BLOB)) + length(CAST(rules_json AS BLOB)) + length(CAST(bom_json AS BLOB)) + length(CAST(quote_json AS BLOB)) + length(CAST(calibration_json AS BLOB))) FROM production_skus WHERE user_id = ?), 0) +
      COALESCE((SELECT SUM(length(CAST(parameters_json AS BLOB)) + length(CAST(workspace_snapshot_json AS BLOB)) + length(CAST(print_profile_json AS BLOB)) + length(CAST(colors_json AS BLOB)) + length(CAST(materials_json AS BLOB)) + length(CAST(bom_json AS BLOB)) + length(CAST(quote_json AS BLOB))) FROM production_jobs WHERE user_id = ?), 0) +
      COALESCE((SELECT SUM(length(CAST(template_json AS BLOB))) FROM production_templates WHERE user_id = ?), 0) +
      COALESCE((SELECT SUM(length(CAST(scad_source AS BLOB)) + length(CAST(description AS BLOB))) FROM production_components WHERE user_id = ?), 0) +
      COALESCE((SELECT SUM(length(CAST(values_json AS BLOB))) FROM calibration_profiles WHERE user_id = ?), 0) +
      COALESCE((SELECT SUM(length(CAST(allowed_params_json AS BLOB))) FROM customer_configurators WHERE user_id = ?), 0) AS bytes
  `),
  createWorkspace: authDb.prepare(`
    INSERT INTO workspaces (id, user_id, name, data_json, scad_count, scad_hash, preview_status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'dirty', ?, ?)
  `),
  workspaceById: authDb.prepare(`
    SELECT id, name, kind, pinned, expires_at, data_json, scad_count, scad_hash, preview_hash, preview_path, preview_status, preview_error, created_at, updated_at
    FROM workspaces WHERE user_id = ? AND id = ?
  `),
  listWorkspaces: authDb.prepare(`
    SELECT id, name, kind, pinned, expires_at, scad_count, scad_hash, preview_hash, preview_path, preview_status, preview_error, created_at, updated_at, last_opened_at
    FROM workspaces WHERE user_id = ? ORDER BY pinned DESC, updated_at DESC, id
  `),
  listRecentWorkspaces: authDb.prepare(`
    SELECT id, name, scad_count, last_opened_at FROM workspaces
    WHERE user_id = ? AND last_opened_at IS NOT NULL ORDER BY last_opened_at DESC LIMIT 12
  `),
  markWorkspaceOpened: authDb.prepare('UPDATE workspaces SET last_opened_at = ? WHERE user_id = ? AND id = ?'),
  clearRecentWorkspaces: authDb.prepare('UPDATE workspaces SET last_opened_at = NULL WHERE user_id = ?'),
  clearWorkspaceHistory: authDb.prepare('DELETE FROM workspace_revisions WHERE user_id = ?'),
  deleteWorkspace: authDb.prepare('DELETE FROM workspaces WHERE user_id = ? AND id = ?'),
  deleteUserWorkspaces: authDb.prepare('DELETE FROM workspaces WHERE user_id = ?'),
  deleteUserProfiles: authDb.prepare('DELETE FROM print_profiles WHERE user_id = ?'),
  deleteUserProductionJobs: authDb.prepare('DELETE FROM production_jobs WHERE user_id = ?'),
  deleteUserConfigurators: authDb.prepare('DELETE FROM customer_configurators WHERE user_id = ?'),
  deleteUserTemplates: authDb.prepare('DELETE FROM production_templates WHERE user_id = ?'),
  deleteUserComponents: authDb.prepare('DELETE FROM production_components WHERE user_id = ?'),
  deleteUserCalibrations: authDb.prepare('DELETE FROM calibration_profiles WHERE user_id = ?'),
  deleteUserWebhooks: authDb.prepare('DELETE FROM order_webhooks WHERE user_id = ?'),
  deleteUserSkus: authDb.prepare('DELETE FROM production_skus WHERE user_id = ?'),
  exportUserWorkspaces: authDb.prepare('SELECT id, name, kind, pinned, expires_at, data_json, scad_count, created_at, updated_at, last_opened_at FROM workspaces WHERE user_id = ? ORDER BY created_at'),
  exportUserRevisions: authDb.prepare('SELECT id, workspace_id, name, data_json, scad_count, created_at FROM workspace_revisions WHERE user_id = ? ORDER BY created_at'),
  exportUserProfiles: authDb.prepare('SELECT id, name, profile_json, created_at, updated_at FROM print_profiles WHERE user_id = ? ORDER BY created_at'),
  exportProductionSkus: authDb.prepare('SELECT id,code,name,workspace_id,workspace_snapshot_json,print_profile_json,openscad_version,workspace_hash,rules_json,bom_json,quote_json,calibration_json,revision,created_at,updated_at FROM production_skus WHERE user_id = ? ORDER BY created_at'),
  exportProductionJobs: authDb.prepare('SELECT id,sku_id,sku_code,sku_revision,openscad_version,order_ref,customer_label,quantity,status,parameters_json,workspace_snapshot_json,print_profile_json,plate_count,colors_json,materials_json,bom_json,quote_json,output_name,error,created_at,updated_at,downloaded_at FROM production_jobs WHERE user_id = ? ORDER BY created_at'),
  previewPathsByUser: authDb.prepare('SELECT preview_path FROM workspaces WHERE user_id = ? AND preview_path IS NOT NULL'),
  invalidateAccentPreviews: authDb.prepare("UPDATE workspaces SET preview_hash = NULL, preview_status = 'dirty', preview_error = NULL WHERE user_id = ? AND scad_count > 0"),
  updateWorkspace: authDb.prepare(`
    UPDATE workspaces SET name = ?, data_json = ?, scad_count = ?, scad_hash = ?,
      preview_status = CASE WHEN preview_hash = ? AND preview_path IS NOT NULL THEN 'ready' ELSE 'dirty' END,
      preview_error = NULL, updated_at = ?
    WHERE user_id = ? AND id = ?
  `),
  markPreviewGenerating: authDb.prepare(`
    UPDATE workspaces SET preview_status = 'generating', preview_error = NULL
    WHERE user_id = ? AND id = ? AND preview_status IN ('dirty', 'failed')
  `),
  finishPreview: authDb.prepare(`
    UPDATE workspaces SET preview_hash = ?, preview_path = ?, preview_status = 'ready', preview_error = NULL
    WHERE user_id = ? AND id = ? AND scad_hash = ?
  `),
  finishEmptyPreview: authDb.prepare(`
    UPDATE workspaces SET preview_hash = scad_hash, preview_path = NULL, preview_status = 'ready', preview_error = NULL
    WHERE user_id = ? AND id = ? AND scad_hash = ?
  `),
  failPreview: authDb.prepare(`
    UPDATE workspaces SET preview_status = 'failed', preview_error = ?
    WHERE user_id = ? AND id = ? AND scad_hash = ?
  `),
  workspaceRevisionCount: authDb.prepare('SELECT COUNT(*) AS count FROM workspace_revisions WHERE user_id = ? AND workspace_id = ?'),
  oldestWorkspaceRevision: authDb.prepare(`
    SELECT id, length(CAST(data_json AS BLOB)) AS bytes FROM workspace_revisions
    WHERE user_id = ? AND workspace_id = ? ORDER BY created_at ASC, rowid ASC LIMIT 1
  `),
  latestWorkspaceRevision: authDb.prepare(`
    SELECT id, name, data_hash FROM workspace_revisions
    WHERE user_id = ? AND workspace_id = ? ORDER BY created_at DESC, rowid DESC LIMIT 1
  `),
  createWorkspaceRevision: authDb.prepare(`
    INSERT INTO workspace_revisions (id, workspace_id, user_id, name, data_json, data_hash, scad_count, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),
  listWorkspaceRevisions: authDb.prepare(`
    SELECT id, name, scad_count, created_at FROM workspace_revisions
    WHERE user_id = ? AND workspace_id = ? ORDER BY created_at DESC, rowid DESC LIMIT ${MAX_REVISIONS_PER_WORKSPACE}
  `),
  workspaceRevisionById: authDb.prepare(`
    SELECT id, name, data_json, scad_count, created_at FROM workspace_revisions
    WHERE user_id = ? AND workspace_id = ? AND id = ?
  `),
  trimWorkspaceRevisions: authDb.prepare(`
    DELETE FROM workspace_revisions
    WHERE user_id = ? AND workspace_id = ? AND id NOT IN (
      SELECT id FROM workspace_revisions WHERE user_id = ? AND workspace_id = ?
      ORDER BY created_at DESC, rowid DESC LIMIT ${MAX_REVISIONS_PER_WORKSPACE}
    )
  `),
  listSkus: authDb.prepare('SELECT * FROM production_skus WHERE user_id = ? ORDER BY updated_at DESC, code COLLATE NOCASE'),
  skuById: authDb.prepare('SELECT * FROM production_skus WHERE user_id = ? AND id = ?'),
  skuByCode: authDb.prepare('SELECT * FROM production_skus WHERE user_id = ? AND code = ? COLLATE NOCASE'),
  upsertSku: authDb.prepare(`
    INSERT INTO production_skus (id,user_id,code,name,workspace_id,workspace_snapshot_json,print_profile_json,openscad_version,workspace_hash,rules_json,bom_json,quote_json,calibration_json,revision,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(user_id,code) DO UPDATE SET name=excluded.name,workspace_id=excluded.workspace_id,workspace_snapshot_json=excluded.workspace_snapshot_json,print_profile_json=excluded.print_profile_json,openscad_version=excluded.openscad_version,workspace_hash=excluded.workspace_hash,rules_json=excluded.rules_json,bom_json=excluded.bom_json,quote_json=excluded.quote_json,calibration_json=excluded.calibration_json,revision=production_skus.revision+1,updated_at=excluded.updated_at
  `),
  deleteSku: authDb.prepare('DELETE FROM production_skus WHERE user_id = ? AND id = ?'),
  listJobs: authDb.prepare('SELECT * FROM production_jobs WHERE user_id = ? ORDER BY created_at DESC LIMIT 500'),
  productionJobCount: authDb.prepare('SELECT COUNT(*) AS count FROM production_jobs WHERE user_id = ?'),
  jobById: authDb.prepare('SELECT * FROM production_jobs WHERE user_id = ? AND id = ?'),
  createJob: authDb.prepare(`INSERT INTO production_jobs (id,user_id,sku_id,sku_code,sku_revision,openscad_version,order_ref,customer_label,quantity,status,parameters_json,workspace_snapshot_json,print_profile_json,plate_count,colors_json,materials_json,bom_json,quote_json,output_name,error,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`),
  updateJobStatus: authDb.prepare(`UPDATE production_jobs SET status = ?, output_name = ?, error = ?, updated_at = ?, downloaded_at = CASE WHEN ? = 'downloaded' THEN ? ELSE downloaded_at END WHERE user_id = ? AND id = ?`),
  deleteJob: authDb.prepare('DELETE FROM production_jobs WHERE user_id = ? AND id = ?'),
  listConfigurators: authDb.prepare('SELECT c.id,c.name,c.sku_id,c.enabled,c.allowed_params_json,c.created_at,c.expires_at,s.code AS sku_code,s.name AS sku_name FROM customer_configurators c JOIN production_skus s ON s.id=c.sku_id WHERE c.user_id = ? ORDER BY c.created_at DESC'),
  createConfigurator: authDb.prepare('INSERT INTO customer_configurators (id,user_id,sku_id,name,token_hash,enabled,allowed_params_json,created_at,expires_at) VALUES (?,?,?,?,?,1,?,?,?)'),
  configuratorByToken: authDb.prepare('SELECT c.*,s.code AS sku_code,s.name AS sku_name,s.workspace_snapshot_json,s.print_profile_json,s.openscad_version,s.rules_json,s.bom_json,s.quote_json,s.calibration_json FROM customer_configurators c JOIN production_skus s ON s.id=c.sku_id WHERE c.token_hash = ? AND c.enabled = 1 AND (c.expires_at IS NULL OR c.expires_at > ?)'),
  disableConfigurator: authDb.prepare('UPDATE customer_configurators SET enabled = 0 WHERE user_id = ? AND id = ?'),
  listTemplates: authDb.prepare('SELECT * FROM production_templates WHERE user_id = ? ORDER BY updated_at DESC'),
  templateById: authDb.prepare('SELECT * FROM production_templates WHERE user_id = ? AND id = ?'),
  upsertTemplate: authDb.prepare(`INSERT INTO production_templates (id,user_id,name,template_json,created_at,updated_at) VALUES (?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,template_json=excluded.template_json,updated_at=excluded.updated_at WHERE user_id=excluded.user_id`),
  deleteTemplate: authDb.prepare('DELETE FROM production_templates WHERE user_id = ? AND id = ?'),
  listComponents: authDb.prepare('SELECT * FROM production_components WHERE user_id = ? ORDER BY updated_at DESC, name COLLATE NOCASE'),
  componentById: authDb.prepare('SELECT * FROM production_components WHERE user_id = ? AND id = ?'),
  upsertComponent: authDb.prepare(`INSERT INTO production_components (id,user_id,name,description,scad_source,created_at,updated_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,description=excluded.description,scad_source=excluded.scad_source,updated_at=excluded.updated_at WHERE user_id=excluded.user_id`),
  deleteComponent: authDb.prepare('DELETE FROM production_components WHERE user_id = ? AND id = ?'),
  listCalibrations: authDb.prepare('SELECT * FROM calibration_profiles WHERE user_id = ? ORDER BY updated_at DESC'),
  calibrationById: authDb.prepare('SELECT * FROM calibration_profiles WHERE user_id = ? AND id = ?'),
  upsertCalibration: authDb.prepare(`INSERT INTO calibration_profiles (id,user_id,name,printer,nozzle,material,values_json,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,printer=excluded.printer,nozzle=excluded.nozzle,material=excluded.material,values_json=excluded.values_json,updated_at=excluded.updated_at WHERE user_id=excluded.user_id`),
  deleteCalibration: authDb.prepare('DELETE FROM calibration_profiles WHERE user_id = ? AND id = ?'),
  createWebhook: authDb.prepare('INSERT INTO order_webhooks (id,user_id,name,token_hash,enabled,created_at) VALUES (?,?,?,?,1,?)'),
  listWebhooks: authDb.prepare('SELECT id,name,enabled,created_at FROM order_webhooks WHERE user_id = ? ORDER BY created_at DESC'),
  webhookByToken: authDb.prepare('SELECT * FROM order_webhooks WHERE token_hash = ? AND enabled = 1'),
  disableWebhook: authDb.prepare('UPDATE order_webhooks SET enabled = 0 WHERE user_id = ? AND id = ?')
};

const variants = createVariantStore(authDb, { skuRow, enforceStorage: enforceAccountStorage, badRequest });
const instants = createInstantStore(authDb, { modelInfo: modelInfoFromSource, render: renderModel, renderConcurrency:async()=>renderCapacityFor(await findOpenSCAD()), profileTemplate: bambuExportProfile, sanitizeProfile, activeProfile: userId => activePrintProfile(userId).profile, enforceStorage: enforceAccountStorage, createWorkspace, exportRecipe:(userId,recipe,signal)=>exportHistory.perform(userId,recipe,{signal}) });
const exportHistory = createExportHistory(authDb, { render:renderModel, renderConcurrency:async()=>renderCapacityFor(await findOpenSCAD()), sanitizeProfile, profileTemplate:bambuExportProfile,
  runtime:currentOpenScadVersion, enforceStorage:enforceAccountStorage,
  async freezeDependencies(userId,source) {
    const files=source.packageId?structuredClone(instants.packageFiles(userId,source.packageId)):[];
    const font=await fs.readFile(path.join(__dirname,'fonts/bundled/Baloo2[wght].ttf'));
    const fontPath=`export-fonts/${createHash('sha256').update(font).digest('hex')}.ttf`;
    if(!files.some(file=>file.path===fontPath))files.push({path:fontPath,base64:font.toString('base64')});
    return files;
  }
});

const nativeRenderChildren = new Set();

const scryptAsync = promisify(scrypt);
const PASSWORD_VERSION = 3;
const DUMMY_PASSWORD_SALT = createHash('sha256').update('pmm-login-timing-pad').digest();
const DUMMY_PASSWORD_HASH = Buffer.alloc(64);
// Compatibility guards for inherited account helpers; desktop has no email service.
const resendClient = null;
const emailTransport = null;

function normalizeEmail(value) {
  const email = String(value || '').normalize('NFKC').trim().toLowerCase();
  const valid = email.length <= 254
    && !email.includes('..')
    && /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(email);
  if (!valid) throw badRequest('Enter a valid email address.');
  return email;
}

const DEFAULT_ACCOUNT_SETTINGS = Object.freeze({
  appearance: { theme: 'system', accent: '#00ae42', reduceAnimations: false, density: 'comfortable' },
  workspace: { autoSave: true, autoRegenerate: false, autoRegenerateDelaySeconds: 2, autoPosition: true, instantExport: false }
});

function sanitizeAccountSettings(value) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const appearance = source.appearance && typeof source.appearance === 'object' ? source.appearance : {};
  const workspace = source.workspace && typeof source.workspace === 'object' ? source.workspace : {};
  const theme = ['light', 'dark', 'system'].includes(appearance.theme) ? appearance.theme : DEFAULT_ACCOUNT_SETTINGS.appearance.theme;
  const density = ['compact', 'comfortable'].includes(appearance.density) ? appearance.density : DEFAULT_ACCOUNT_SETTINGS.appearance.density;
  const accent = /^#[0-9a-f]{6}$/i.test(String(appearance.accent || '')) ? String(appearance.accent).toLowerCase() : DEFAULT_ACCOUNT_SETTINGS.appearance.accent;
  return {
    appearance: { theme, accent, reduceAnimations: appearance.reduceAnimations === true, density },
    workspace: { autoSave: workspace.autoSave !== false, autoRegenerate: workspace.autoRegenerate === true,
      autoRegenerateDelaySeconds: Number.isFinite(workspace.autoRegenerateDelaySeconds) && workspace.autoRegenerateDelaySeconds >= 0 ? workspace.autoRegenerateDelaySeconds : 2,
      autoPosition: workspace.autoPosition !== false, instantExport: workspace.instantExport === true }
  };
}

function accountSettingsFromRow(row) {
  try { return sanitizeAccountSettings(JSON.parse(String(row?.settings_json || '{}'))); }
  catch { return sanitizeAccountSettings({}); }
}

function sanitizeDisplayName(value) {
  const name = String(value || '').normalize('NFKC').trim().replace(/\s+/g, ' ');
  if (name.length > 80) throw badRequest('Display name must be 80 characters or fewer.');
  return name;
}

function validateNewPassword(value) {
  if (typeof value !== 'string' || value.length < 12 || Buffer.byteLength(value, 'utf8') > 256) {
    throw badRequest('Use a password of at least 12 characters and no more than 256 bytes.');
  }
  return value;
}

async function derivePassword(password, salt, version = PASSWORD_VERSION) {
  const passwordVersion = Number(version) || 1;
  const hardened = passwordVersion >= 2;
  return Buffer.from(await scryptAsync(password, salt, 64, {
    N: hardened ? 65536 : 32768,
    r: 8,
    p: passwordVersion >= 3 ? 2 : 1,
    maxmem: hardened ? 128 * 1024 * 1024 : 64 * 1024 * 1024
  }));
}

async function createAccount(emailInput, passwordInput) {
  const email = normalizeEmail(emailInput);
  const password = validateNewPassword(passwordInput);
  sql.deleteAbandonedUnverifiedUsers.run(Date.now() - 24 * 60 * 60 * 1000);
  const existing = sql.userByEmail.get(email);
  if (existing?.email_verified_at) {
    const authenticated = await authenticateAccount(email, password);
    return authenticated ? { ...authenticated, existingVerified: true } : { fake: true, email };
  }
  const salt = randomBytes(16);
  const hash = await derivePassword(password, salt, PASSWORD_VERSION);
  if (existing) {
    return {
      id: Number(existing.id),
      email,
      pendingPassword: { salt: salt.toString('base64'), hash: hash.toString('base64'), version: PASSWORD_VERSION }
    };
  }
  try {
    const result = sql.createUser.run(email, salt.toString('base64'), hash.toString('base64'), PASSWORD_VERSION, Date.now());
    return {
      id: Number(result.lastInsertRowid),
      email,
      pendingPassword: { salt: salt.toString('base64'), hash: hash.toString('base64'), version: PASSWORD_VERSION }
    };
  } catch (error) {
    if (/UNIQUE constraint failed: users\.email/i.test(String(error?.message))) {
      const exists = new Error('An account already exists for this email.');
      exists.code = 'ACCOUNT_EXISTS';
      throw exists;
    }
    throw error;
  }
}

function fakeTwoFactorChallenge(email) {
  return {
    twoFactorRequired: true,
    challenge: randomBytes(32).toString('base64url'),
    email: maskedEmail(email),
    expiresIn: Math.floor(TWO_FACTOR_TTL_MS / 1000)
  };
}

async function authenticateAccount(emailInput, passwordInput) {
  let email;
  try { email = normalizeEmail(emailInput); } catch { email = ''; }
  const password = typeof passwordInput === 'string' && Buffer.byteLength(passwordInput, 'utf8') <= 256 ? passwordInput : '';
  const user = email ? sql.userByEmail.get(email) : null;
  const salt = user ? Buffer.from(user.password_salt, 'base64') : DUMMY_PASSWORD_SALT;
  const expected = user ? Buffer.from(user.password_hash, 'base64') : DUMMY_PASSWORD_HASH;
  const passwordVersion = Number(user?.password_version) || 1;
  const actual = await derivePassword(password, salt, passwordVersion);
  if (!user || expected.length !== actual.length || !timingSafeEqual(expected, actual) || !user.email_verified_at) return null;
  if (passwordVersion < PASSWORD_VERSION) {
    const nextSalt = randomBytes(16);
    const nextHash = await derivePassword(password, nextSalt, PASSWORD_VERSION);
    sql.updatePasswordHash.run(nextSalt.toString('base64'), nextHash.toString('base64'), PASSWORD_VERSION, user.id);
  }
  return { id: Number(user.id), email: String(user.email), twoFactorEnabled: Boolean(user.two_factor_enabled) };
}

async function reauthenticateUser(userId, passwordInput) {
  const user = sql.userById.get(userId);
  const password = typeof passwordInput === 'string' && Buffer.byteLength(passwordInput, 'utf8') <= 256 ? passwordInput : '';
  if (!user || !password) return null;
  const expected = Buffer.from(user.password_hash, 'base64');
  const actual = await derivePassword(password, Buffer.from(user.password_salt, 'base64'), Number(user.password_version) || 1);
  return expected.length === actual.length && timingSafeEqual(expected, actual) ? user : null;
}

function maskedEmail(email) {
  const [local, domain] = String(email).split('@');
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${'•'.repeat(Math.max(3, Math.min(8, local.length - visible.length)))}@${domain}`;
}

function twoFactorCodeHash(token, code) {
  return createHash('sha256').update(`${token}.${code}`).digest('hex');
}

async function sendTwoFactorEmail() {
  const error = new Error('Email verification is not available in the local app.');
  error.code = 'EMAIL_DELIVERY_FAILED';
  throw error;
}

async function beginTwoFactorChallenge(user, purpose) {
  const token = randomBytes(32).toString('base64url');
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  const now = Date.now();
  await sendTwoFactorEmail(user.email, code, purpose);
  sql.deleteExpiredLoginChallenges.run(now);
  if (purpose === 'login') sql.deleteUserLoginChallenges.run(user.id);
  const pendingPassword = purpose === 'signup' ? user.pendingPassword : null;
  sql.createLoginChallenge.run(
    sessionTokenHash(token),
    user.id,
    twoFactorCodeHash(token, code),
    purpose,
    now,
    now + TWO_FACTOR_TTL_MS,
    now,
    pendingPassword?.salt || null,
    pendingPassword?.hash || null,
    pendingPassword?.version || null
  );
  return {
    twoFactorRequired: true,
    challenge: token,
    email: maskedEmail(user.email),
    expiresIn: Math.floor(TWO_FACTOR_TTL_MS / 1000)
  };
}

function verifyTwoFactorChallenge(tokenInput, codeInput) {
  const token = typeof tokenInput === 'string' && /^[A-Za-z0-9_-]{43}$/.test(tokenInput) ? tokenInput : '';
  const code = typeof codeInput === 'string' && /^\d{6}$/.test(codeInput) ? codeInput : '';
  const tokenHash = token ? sessionTokenHash(token) : '';
  const challenge = tokenHash ? sql.loginChallengeByHash.get(tokenHash, Date.now()) : null;
  if (!challenge || !code || Number(challenge.attempts) >= TWO_FACTOR_MAX_ATTEMPTS) {
    if (challenge) sql.deleteLoginChallenge.run(tokenHash);
    return null;
  }
  sql.incrementLoginChallengeAttempts.run(tokenHash);
  const expected = Buffer.from(String(challenge.code_hash), 'hex');
  const actual = Buffer.from(twoFactorCodeHash(token, code), 'hex');
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    if (Number(challenge.attempts) + 1 >= TWO_FACTOR_MAX_ATTEMPTS) sql.deleteLoginChallenge.run(tokenHash);
    return null;
  }
  if (String(challenge.purpose) === 'signup') {
    if (!challenge.pending_password_salt || !challenge.pending_password_hash || !challenge.pending_password_version) {
      sql.deleteLoginChallenge.run(tokenHash);
      return null;
    }
    const verified = sql.verifyPendingUser.run(
      challenge.pending_password_salt,
      challenge.pending_password_hash,
      challenge.pending_password_version,
      Date.now(),
      challenge.user_id
    );
    if (!verified.changes) {
      sql.deleteLoginChallenge.run(tokenHash);
      return null;
    }
  }
  sql.deleteUserLoginChallenges.run(challenge.user_id);
  return { id: Number(challenge.user_id), email: String(challenge.email), purpose: String(challenge.purpose) };
}

async function resendTwoFactorChallenge(tokenInput) {
  const token = typeof tokenInput === 'string' && /^[A-Za-z0-9_-]{43}$/.test(tokenInput) ? tokenInput : '';
  const tokenHash = token ? sessionTokenHash(token) : '';
  const challenge = tokenHash ? sql.loginChallengeByHash.get(tokenHash, Date.now()) : null;
  if (!challenge) return null;
  const now = Date.now();
  if (now - Number(challenge.sent_at) < 30_000) return { retryAfter: Math.ceil((30_000 - (now - Number(challenge.sent_at))) / 1000) };
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  await sendTwoFactorEmail(String(challenge.email), code, String(challenge.purpose));
  sql.refreshLoginChallenge.run(twoFactorCodeHash(token, code), now + TWO_FACTOR_TTL_MS, now, tokenHash);
  return {
    twoFactorRequired: true,
    challenge: token,
    email: maskedEmail(String(challenge.email)),
    expiresIn: Math.floor(TWO_FACTOR_TTL_MS / 1000)
  };
}

async function beginEmailChangeChallenge(userId, pendingEmailInput) {
  if (!resendClient && !emailTransport) {
    const error = new Error('Email delivery must be configured before changing the account email.');
    error.code = 'EMAIL_DELIVERY_FAILED';
    throw error;
  }
  const pendingEmail = normalizeEmail(pendingEmailInput);
  const current = sql.userById.get(userId);
  if (!current) throw badRequest('Account not found.');
  if (pendingEmail === String(current.email).toLowerCase()) return null;
  const existing = sql.userByEmail.get(pendingEmail);
  if (existing && Number(existing.id) !== Number(userId)) {
    const error = new Error('That email address is already in use.');
    error.code = 'EMAIL_IN_USE';
    throw error;
  }
  const token = randomBytes(32).toString('base64url');
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  const now = Date.now();
  await sendTwoFactorEmail(pendingEmail, code, 'email-change');
  sql.deleteExpiredEmailChangeChallenges.run(now);
  sql.deleteUserEmailChangeChallenges.run(userId);
  try {
    sql.createEmailChangeChallenge.run(sessionTokenHash(token), userId, pendingEmail, twoFactorCodeHash(token, code), now, now + TWO_FACTOR_TTL_MS, now);
  } catch (error) {
    if (/UNIQUE constraint failed/i.test(String(error?.message))) {
      const conflict = new Error('That email address is already awaiting verification on another account.');
      conflict.code = 'EMAIL_IN_USE';
      throw conflict;
    }
    throw error;
  }
  return {
    emailChangeRequired: true,
    challenge: token,
    email: maskedEmail(pendingEmail),
    expiresIn: Math.floor(TWO_FACTOR_TTL_MS / 1000)
  };
}

function verifyEmailChangeChallenge(userId, tokenInput, codeInput) {
  const token = typeof tokenInput === 'string' && /^[A-Za-z0-9_-]{43}$/.test(tokenInput) ? tokenInput : '';
  const code = typeof codeInput === 'string' && /^\d{6}$/.test(codeInput) ? codeInput : '';
  const tokenHash = token ? sessionTokenHash(token) : '';
  const challenge = tokenHash ? sql.emailChangeChallengeByHash.get(tokenHash, Date.now()) : null;
  if (!challenge || Number(challenge.user_id) !== Number(userId) || !code || Number(challenge.attempts) >= TWO_FACTOR_MAX_ATTEMPTS) {
    if (challenge && Number(challenge.user_id) === Number(userId)) sql.deleteEmailChangeChallenge.run(tokenHash);
    return null;
  }
  sql.incrementEmailChangeAttempts.run(tokenHash);
  const expected = Buffer.from(String(challenge.code_hash), 'hex');
  const actual = Buffer.from(twoFactorCodeHash(token, code), 'hex');
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    if (Number(challenge.attempts) + 1 >= TWO_FACTOR_MAX_ATTEMPTS) sql.deleteEmailChangeChallenge.run(tokenHash);
    return null;
  }
  const pendingEmail = normalizeEmail(challenge.pending_email);
  try {
    sql.updateUserEmail.run(pendingEmail, Date.now(), userId);
  } catch (error) {
    if (/UNIQUE constraint failed: users\.email/i.test(String(error?.message))) {
      sql.deleteEmailChangeChallenge.run(tokenHash);
      const conflict = new Error('That email address is already in use.');
      conflict.code = 'EMAIL_IN_USE';
      throw conflict;
    }
    throw error;
  }
  sql.deleteUserEmailChangeChallenges.run(userId);
  return { email: pendingEmail };
}

function sessionTokenHash(token) {
  return createHash('sha256').update(token).digest('hex');
}

function requestSessionToken(req) {
  for (const part of String(req.headers.cookie || '').split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0 || part.slice(0, separator).trim() !== SESSION_COOKIE) continue;
    const token = part.slice(separator + 1).trim();
    return /^[A-Za-z0-9_-]{43}$/.test(token) ? token : '';
  }
  return '';
}

function requestSession(req) {
  const user = sql.userById.get(localUserId);
  return { userId: localUserId, email: user.email, displayName: 'On this device', settings: accountSettingsFromRow(user) };
}

function sessionCookie(token, maxAgeSeconds = null) {
  const expiry = Number.isInteger(maxAgeSeconds) ? `; Max-Age=${Math.max(0, maxAgeSeconds)}` : '';
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Priority=High${expiry}${SECURE_COOKIES ? '; Secure' : ''}`;
}

function sessionClientInfo(req) {
  const userAgent = String(req?.headers?.['user-agent'] || '').slice(0, 500);
  const ipAddress = clientAddress(req);
  const city = String(req?.headers?.['cf-ipcity'] || '').trim().slice(0, 80);
  const country = String(req?.headers?.['cf-ipcountry'] || '').trim().slice(0, 8);
  const location = [city, country].filter(Boolean).join(', ') || (isLoopbackHost(ipAddress) ? 'Local device' : 'Unavailable');
  return { userAgent, ipAddress, location };
}

function describeUserAgent(userAgent) {
  const ua = String(userAgent || '');
  const browser = /Edg\//.test(ua) ? 'Microsoft Edge' : /OPR\//.test(ua) ? 'Opera' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : /Firefox\//.test(ua) ? 'Firefox' : 'Unknown browser';
  const operatingSystem = /Windows NT/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS / iPadOS' : /Mac OS X/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'Unknown OS';
  const deviceType = /iPad|Tablet/.test(ua) ? 'Tablet' : /Mobile|iPhone|Android/.test(ua) ? 'Mobile' : 'Desktop';
  return { browser, operatingSystem, deviceType };
}

function createSession(res, user, remember = false, req = null) {
  const token = randomBytes(32).toString('base64url');
  const now = Date.now();
  const ttl = remember ? REMEMBERED_SESSION_TTL_MS : SESSION_TTL_MS;
  const client = sessionClientInfo(req);
  sql.deleteExpiredSessions.run(now);
  sql.createSession.run(sessionTokenHash(token), user.id, now, now, client.userAgent, client.ipAddress, client.location, now + ttl);
  sql.trimUserSessions.run(user.id, user.id);
  res.setHeader('Set-Cookie', sessionCookie(token, remember ? Math.floor(ttl / 1000) : null));
}

function clearSession(req, res) {
  const token = requestSessionToken(req);
  if (token) sql.deleteSession.run(sessionTokenHash(token));
  res.setHeader('Set-Cookie', sessionCookie('', 0));
  res.setHeader('Clear-Site-Data', '"cache", "storage"');
}

let openScadInfoPromise = null;
let localFontCatalogPromise = null;
let projectFontIndexPromise = null;
const modelInfoCache = new Map();
const sourceInfoCache = new Map();
let sourceInfoCacheBytes = 0;
const renderCache = new Map();
const diskRenderCache = new DiskRenderCache(path.join(DATA_DIR, 'geometry'));
const gzipAsync = promisify(gzip);
const staticCache = new Map();
const renderInFlight = new SharedRenders();
const nativeFontIdentity = createNativeFontIdentity();
const renderScheduler = new RenderScheduler({ concurrency: MANIFOLD_RENDER_SLOTS, maxQueued: MAX_QUEUED_OPENSCAD });
let renderCacheBytes = 0;

function renderCapacityFor(openscad) {
  const remoteSlots = Number(openscad?.renderSlots);
  return openscad?.remote && remoteSlots > 0 ? Math.max(1, Math.min(16, CONFIGURED_RENDER_SLOTS || remoteSlots, Math.floor(remoteSlots))) : MANIFOLD_RENDER_SLOTS;
}

function fullRenderWeightFor() {
  return Math.max(1, Math.min(MANIFOLD_RENDER_SLOTS, CONFIGURED_FULL_RENDER_WEIGHT || 1));
}

function syncRenderSchedulerCapacity(openscad) {
  const capacity = renderCapacityFor(openscad);
  renderScheduler.setConcurrency(capacity);
  return capacity;
}

function clearRenderCache() {
  renderCache.clear();
  renderCacheBytes = 0;
}

function cachedRender(key) {
  const data = renderCache.get(key);
  if (!data) return null;
  renderCache.delete(key);
  renderCache.set(key, data);
  return data;
}

function cacheRender(key, data) {
  if (data.length > MAX_RENDER_CACHE_BYTES) return;
  const previous = renderCache.get(key);
  if (previous) renderCacheBytes -= previous.length;
  renderCache.delete(key);
  renderCache.set(key, data);
  renderCacheBytes += data.length;
  while (renderCacheBytes > MAX_RENDER_CACHE_BYTES && renderCache.size > 1) {
    const oldestKey = renderCache.keys().next().value;
    const oldest = renderCache.get(oldestKey);
    renderCache.delete(oldestKey);
    renderCacheBytes -= oldest.length;
  }
}

const CUSTOM_FONT_DIR = path.resolve(process.env.CUSTOM_FONT_DIR || path.join(DATA_DIR, 'fonts'));
const FONTCONFIG_DIR = path.resolve(process.env.PMM_FONTCONFIG_DIR || path.join(DATA_DIR, 'fontconfig'));
const FONTCONFIG_FILE = path.join(FONTCONFIG_DIR, 'fonts.conf');
const FONTCONFIG_CACHE_DIR = path.join(FONTCONFIG_DIR, 'cache');
let fontEnvironmentPromise = null;
let fontStatsPromise = null;

function subprocessEnvironment(extra = {}) {
  const blocked = /(?:TOKEN|SECRET|PASSWORD|PASS$|API_KEY|RESEND|SMTP|DATABASE|COOKIE|SESSION|CLOUDFLARE)/i;
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !blocked.test(key)));
  return { ...env, ...extra };
}

function normalizeFontEntry(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function runCapture(command, args = [], options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { windowsHide: true, ...options });
    let stdout = '';
    child.stdout?.on('data', (chunk) => { stdout += chunk.toString(); });
    child.once('error', () => resolve(null));
    child.once('exit', (code) => resolve(code === 0 ? stdout : null));
  });
}

function xmlEscape(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

async function ensureProjectFontConfig() {
  await fs.mkdir(CUSTOM_FONT_DIR, { recursive: true });
  await fs.copyFile(path.join(__dirname,'fonts/bundled/Baloo2[wght].ttf'),path.join(CUSTOM_FONT_DIR,'Baloo2[wght].ttf'),fsSync.constants.COPYFILE_EXCL).catch(error=>{if(error.code!=='EEXIST')throw error;});
  await fs.mkdir(FONTCONFIG_CACHE_DIR, { recursive: true });
  const dirs = [CUSTOM_FONT_DIR, path.join(__dirname, 'fonts', 'bundled'), path.join(__dirname, 'fonts', 'custom')];
  const xml = [
    '<?xml version="1.0"?>',
    '<fontconfig>',
    ...dirs.map((dir) => `  <dir>${xmlEscape(dir)}</dir>`),
    `  <cachedir>${xmlEscape(FONTCONFIG_CACHE_DIR)}</cachedir>`,
    '</fontconfig>',
    ''
  ].join('\n');
  await fs.writeFile(FONTCONFIG_FILE, xml, 'utf8');
  return FONTCONFIG_FILE;
}

async function openScadFontEnv() {
  fontEnvironmentPromise ||= ensureProjectFontConfig().then((fontConfigFile) => ({
    ...subprocessEnvironment(), OPENSCAD_FONT_PATH: CUSTOM_FONT_DIR, FONTCONFIG_FILE: fontConfigFile
  })).catch((error) => { fontEnvironmentPromise = null; throw error; });
  return fontEnvironmentPromise;
}

function addFontScanOutput(values, output) {
  for (const line of String(output || '').split(/\r?\n/)) {
    const [familyRaw = '', styleRaw = ''] = line.split('|');
    const family = normalizeFontEntry(familyRaw.split(',')[0]);
    const style = normalizeFontEntry(styleRaw.split(',')[0]);
    if (!family) continue;
    values.add(family);
    if (style) values.add(`${family}:style=${style}`);
  }
}

async function walkFiles(root, predicate, { maxFiles = 25000 } = {}) {
  const output = [];
  const stack = [root];
  while (stack.length && output.length < maxFiles) {
    const current = stack.pop();
    let entries = [];
    try { entries = await fs.readdir(current, { withFileTypes: true }); } catch { continue; }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile() && predicate(full, entry.name)) output.push(full);
      if (output.length >= maxFiles) break;
    }
  }
  return output;
}

function extractProtoBlocks(text, key) {
  const blocks = [];
  const token = `${key} {`;
  let from = 0;
  while (true) {
    const start = text.indexOf(token, from);
    if (start < 0) break;
    let depth = 0;
    let quote = false;
    let escape = false;
    let bodyStart = -1;
    let end = -1;
    for (let i = start + key.length; i < text.length; i += 1) {
      const ch = text[i];
      if (quote) {
        if (escape) escape = false;
        else if (ch === '\\') escape = true;
        else if (ch === '"') quote = false;
        continue;
      }
      if (ch === '"') { quote = true; continue; }
      if (ch === '{') {
        depth += 1;
        if (depth === 1) bodyStart = i + 1;
      } else if (ch === '}') {
        depth -= 1;
        if (depth === 0 && bodyStart >= 0) { end = i; break; }
      }
    }
    if (end < 0) break;
    blocks.push(text.slice(bodyStart, end));
    from = end + 1;
  }
  return blocks;
}

function protoString(block, key) {
  const match = String(block).match(new RegExp(`^\\s*${key}:\\s*"([^"]*)"`, 'm'));
  return match ? match[1] : '';
}

function protoNumber(block, key) {
  const match = String(block).match(new RegExp(`^\\s*${key}:\\s*(-?[0-9]+(?:\\.[0-9]+)?)`, 'm'));
  return match ? Number(match[1]) : null;
}

function weightStyleName(weight, italic = false) {
  const names = {
    100: 'Thin', 200: 'ExtraLight', 300: 'Light', 400: 'Regular', 500: 'Medium',
    600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold', 900: 'Black'
  };
  const base = names[Number(weight)] || (Number(weight) === 400 ? 'Regular' : String(weight || 'Regular'));
  if (!italic) return base;
  return Number(weight) === 400 ? 'Italic' : `${base} Italic`;
}

function makeProjectFontEntry({ family, style, filePath, weight = 400, italic = false, source = 'custom' }) {
  const normalizedFamily = normalizeFontEntry(family);
  const normalizedStyle = normalizeFontEntry(style || weightStyleName(weight, italic));
  if (!normalizedFamily || !filePath) return null;
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(CUSTOM_FONT_DIR + path.sep)) return null;
  const relativePath = path.relative(__dirname, resolved);
  const id = createHash('sha256').update(relativePath).digest('hex').slice(0, 20);
  return {
    id,
    family: normalizedFamily,
    style: normalizedStyle,
    spec: normalizedStyle ? `${normalizedFamily}:style=${normalizedStyle}` : normalizedFamily,
    weight: Number(weight) || 400,
    italic: Boolean(italic),
    source,
    relativePath
  };
}

async function scanGoogleRepositoryMetadata() {
  const metadataFiles = await walkFiles(CUSTOM_FONT_DIR, (_full, name) => name === 'METADATA.pb', { maxFiles: 10000 });
  const entries = [];
  for (const metadataPath of metadataFiles) {
    let text = '';
    try { text = await fs.readFile(metadataPath, 'utf8'); } catch { continue; }
    const family = protoString(text.split(/\nfonts\s*\{/)[0], 'name') || protoString(text, 'name');
    if (!family) continue;
    const blocks = extractProtoBlocks(text, 'fonts');
    const weightAxes = extractProtoBlocks(text, 'axes')
      .filter((block) => protoString(block, 'tag') === 'wght')
      .map((block) => ({ min: protoNumber(block, 'min_value'), max: protoNumber(block, 'max_value') }))
      .filter((axis) => Number.isFinite(axis.min) && Number.isFinite(axis.max));
    const weightAxis = weightAxes[0] || null;

    for (const block of blocks) {
      const blockFamily = protoString(block, 'name') || family;
      const filename = protoString(block, 'filename');
      if (!filename) continue;
      const filePath = path.join(path.dirname(metadataPath), filename);
      if (!fsSync.existsSync(filePath)) continue;
      const fontStyle = protoString(block, 'style').toLowerCase();
      const italic = fontStyle === 'italic';
      const weight = protoNumber(block, 'weight') || 400;
      const entry = makeProjectFontEntry({ family: blockFamily, style: weightStyleName(weight, italic), filePath, weight, italic, source: 'google-repository' });
      if (entry) entries.push(entry);

      if (weightAxis && /\[[^\]]*wght[^\]]*\]/i.test(filename)) {
        for (const candidate of [100,200,300,400,500,600,700,800,900]) {
          if (candidate < weightAxis.min || candidate > weightAxis.max) continue;
          const variableEntry = makeProjectFontEntry({ family: blockFamily, style: weightStyleName(candidate, italic), filePath, weight: candidate, italic, source: 'google-repository' });
          if (variableEntry) entries.push(variableEntry);
        }
      }
    }
  }
  const bySpec = new Map();
  for (const entry of entries) if (!bySpec.has(entry.spec.toLowerCase())) bySpec.set(entry.spec.toLowerCase(), entry);
  return [...bySpec.values()].sort((a, b) => a.spec.localeCompare(b.spec));
}

async function getProjectFontIndex({ force = false } = {}) {
  if (force) projectFontIndexPromise = null;
  if (projectFontIndexPromise) return projectFontIndexPromise;
  projectFontIndexPromise = (async () => {
    const entries = await scanGoogleRepositoryMetadata();
    return entries;
  })();
  return projectFontIndexPromise;
}

async function getProjectFontStats() {
  fontStatsPromise ||= scanProjectFontStats().catch((error) => { fontStatsPromise = null; throw error; });
  return fontStatsPromise;
}

async function scanProjectFontStats() {
  const fontFiles = await walkFiles(CUSTOM_FONT_DIR, (full) => ['.ttf', '.otf', '.ttc'].includes(path.extname(full).toLowerCase()), { maxFiles: 50000 });
  const projectFonts = await getProjectFontIndex();
  return {
    customDirectory: CUSTOM_FONT_DIR,
    fontFileCount: fontFiles.length,
    indexedStyleCount: projectFonts.length,
    googleRepositoryDetected: projectFonts.some((entry) => entry.source === 'google-repository'),
    fontConfigFile: FONTCONFIG_FILE
  };
}

async function getLocalFontCatalog({ force = false } = {}) {
  if (force) localFontCatalogPromise = null;
  if (localFontCatalogPromise) return localFontCatalogPromise;
  localFontCatalogPromise = (async () => {
    const values = new Set();
    const fontEnv = await openScadFontEnv();
    const listCandidates = ['fc-list','/opt/homebrew/bin/fc-list','/usr/local/bin/fc-list','/usr/bin/fc-list'];
    for (const candidate of listCandidates) {
      const output = await runCapture(candidate, ['-f', '%{family[0]}|%{style[0]}\\n'], { env: fontEnv });
      if (output === null) continue;
      addFontScanOutput(values, output);
      break;
    }

    const scanCandidates = ['fc-scan','/opt/homebrew/bin/fc-scan','/usr/local/bin/fc-scan','/usr/bin/fc-scan'];
    for (const fontDir of [CUSTOM_FONT_DIR]) {
      if (!fsSync.existsSync(fontDir)) continue;
      for (const candidate of scanCandidates) {
        const output = await runCapture(candidate, ['-f', '%{family[0]}|%{style[0]}\\n', fontDir], { env: fontEnv });
        if (output === null) continue;
        addFontScanOutput(values, output);
        break;
      }
    }

    for (const entry of await getProjectFontIndex()) {
      if (entry.family) values.add(entry.family);
      if (entry.spec) values.add(entry.spec);
    }
    return [...values].sort((a, b) => a.localeCompare(b));
  })();
  return localFontCatalogPromise;
}

function sanitizeProfile(input) {
  const defaults = createDefaultProfile();
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const printer = Object.hasOwn(PRINTERS, source.printer) ? source.printer : defaults.printer;
  const settings = { ...defaults.settings };
  const migratedSettings = source.settings && typeof source.settings === 'object' && !Array.isArray(source.settings) ? migratePrintSettings(source.settings) : {};
  if (migratedSettings && typeof migratedSettings === 'object') {
    for (const [key, value] of Object.entries(migratedSettings)) {
      if (!PRINT_SETTING_KEYS.has(key)) continue;
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || Array.isArray(value) || value === null) settings[key] = value;
    }
  }
  const advanced = {};
  if (source.advanced && typeof source.advanced === 'object' && !Array.isArray(source.advanced)) {
    for (const [key, value] of Object.entries(source.advanced)) {
      if (!/^[A-Za-z0-9_]+$/.test(key) || key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
      if (['string', 'number', 'boolean'].includes(typeof value) || Array.isArray(value) || value === null) advanced[key] = value;
    }
  }
  const name = String(source.name || defaults.name).trim().slice(0, 120) || defaults.name;
  const nozzleDiameter = SUPPORTED_NOZZLES.includes(Number(source.nozzleDiameter)) ? Number(source.nozzleDiameter) : defaults.nozzleDiameter;
  const bedType = ['Textured PEI', 'Smooth PEI', 'Cool Plate', 'Engineering Plate'].includes(source.bedType)
    ? source.bedType : defaults.bedType;
  const filamentColor = /^#[0-9a-f]{6}$/i.test(String(source.filamentColor || '')) ? String(source.filamentColor) : defaults.filamentColor;
  return { version: 6, name, printer, nozzleDiameter, bedType, filamentColor, settings, advanced };
}


function safeJsonParse(value, fallback) {
  try { return JSON.parse(String(value ?? '')); } catch { return structuredClone(fallback); }
}

function cleanSkuCode(value) {
  const code = String(value || '').normalize('NFKC').trim().toUpperCase().replace(/[^A-Z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 64);
  if (!code) throw badRequest('Enter a SKU code.');
  return code;
}

function cleanProductionName(value, fallback = 'Production item') {
  return String(value || fallback).normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 120) || fallback;
}

function snapshotParameterCatalog(snapshot) {
  const catalog = new Map();
  for (const plate of Array.isArray(snapshot?.plates) ? snapshot.plates : []) {
    let parsed = [];
    try { parsed = parseScadParameters(String(plate.source || '')); } catch {}
    for (const parameter of parsed) {
      if (!parameter?.name || catalog.has(parameter.name)) continue;
      catalog.set(parameter.name, {
        name: parameter.name,
        label: parameter.label || parameter.name,
        type: parameter.type || typeof plate.values?.[parameter.name],
        value: plate.values?.[parameter.name] ?? parameter.value ?? parameter.default,
        options: Array.isArray(parameter.options) ? parameter.options : undefined,
        min: Number.isFinite(parameter.min) ? parameter.min : undefined,
        max: Number.isFinite(parameter.max) ? parameter.max : undefined,
        step: Number.isFinite(parameter.step) ? parameter.step : undefined
      });
    }
    for (const [name, value] of Object.entries(plate.values || {})) if (!catalog.has(name)) catalog.set(name, { name, label: name, type: typeof value, value });
  }
  return [...catalog.values()];
}

function parameterNamesInSnapshot(snapshot) {
  return new Set(snapshotParameterCatalog(snapshot).map((item) => item.name));
}

function sanitizeJobParameters(snapshot, input, allowed = null) {
  const names = parameterNamesInSnapshot(snapshot);
  const allow = Array.isArray(allowed) && allowed.length ? new Set(allowed.map(String)) : names;
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const result = {};
  for (const [key, value] of Object.entries(source)) {
    if (!names.has(key) || !allow.has(key)) continue;
    if (typeof value === 'string') result[key] = value.slice(0, 1000);
    else if (typeof value === 'number' && Number.isFinite(value)) result[key] = value;
    else if (typeof value === 'boolean') result[key] = value;
    else if (Array.isArray(value) && value.length <= 100) result[key] = value.slice(0, 100);
  }
  return result;
}

function applyParametersToSnapshot(snapshot, parameters) {
  const result = structuredClone(snapshot || {});
  for (const plate of Array.isArray(result.plates) ? result.plates : []) {
    plate.values ||= {};
    for (const [key, value] of Object.entries(parameters || {})) if (Object.hasOwn(plate.values, key) || Object.hasOwn(plate.baseValues || {}, key)) plate.values[key] = structuredClone(value);
    if (plate.objectBinding) {
      plate.baseValues = structuredClone(plate.values);
      const record = plate.objectRecords?.[plate.objectBinding.selectionKey];
      if (record) {
        for (const key of Object.keys(parameters || {})) if (record.parameterOverrides) delete record.parameterOverrides[key];
        record.configuration = { ...record.configuration, parameters: { ...structuredClone(plate.values), ...record.parameterOverrides } };
      }
    }
    plate.lastGeneratedValues = null;
  }
  return result;
}

function conditionMatches(condition, parameters) {
  if (!condition || typeof condition !== 'object') return true;
  if (Array.isArray(condition.all)) return condition.all.slice(0, 50).every((entry) => conditionMatches(entry, parameters));
  if (Array.isArray(condition.any)) return condition.any.slice(0, 50).some((entry) => conditionMatches(entry, parameters));
  if (condition.not && typeof condition.not === 'object') return !conditionMatches(condition.not, parameters);
  const actual = parameters?.[condition.param];
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

function validateProductionRules(rules, parameters) {
  const failures = [];
  for (const rule of Array.isArray(rules) ? rules.slice(0, 200) : []) {
    if (!rule || typeof rule !== 'object') continue;
    if (rule.when && !conditionMatches(rule.when, parameters)) continue;
    const requirement = rule.require || (rule.param ? rule : null);
    if (requirement && !conditionMatches(requirement, parameters)) failures.push(String(rule.message || `${requirement.param} violates a production constraint.`).slice(0, 240));
  }
  return failures;
}

function comparableChanges(before, after, prefix = '') {
  const changes = [];
  const walk = (left, right, path, depth = 0) => {
    if (changes.length >= 300) return;
    if (JSON.stringify(left) === JSON.stringify(right)) return;
    const leftObject = left && typeof left === 'object' && !Array.isArray(left);
    const rightObject = right && typeof right === 'object' && !Array.isArray(right);
    if (depth < 5 && (leftObject || rightObject)) {
      const keys = [...new Set([...Object.keys(leftObject ? left : {}), ...Object.keys(rightObject ? right : {})])].sort();
      for (const key of keys) walk(leftObject ? left[key] : undefined, rightObject ? right[key] : undefined, path ? `${path}.${key}` : key, depth + 1);
      return;
    }
    changes.push({ path: path || prefix || 'value', from: left, to: right });
  };
  walk(before, after, prefix, 0);
  return changes;
}

function snapshotSourceDiff(beforeSnapshot, afterSnapshot) {
  const summarize = (snapshot) => (Array.isArray(snapshot?.plates) ? snapshot.plates : []).map((plate, index) => ({
    key: String(plate.sourceInstanceId || plate.sourceName || `source-${index + 1}`),
    name: String(plate.sourceName || `Source ${index + 1}`),
    defaultPlateId: String(plate.defaultPlateId || 'A'),
    hash: createHash('sha256').update(String(plate.source || '')).digest('hex')
  }));
  const before = new Map(summarize(beforeSnapshot).map((entry) => [entry.key, entry]));
  const after = new Map(summarize(afterSnapshot).map((entry) => [entry.key, entry]));
  const result = [];
  for (const key of [...new Set([...before.keys(), ...after.keys()])]) {
    const left = before.get(key); const right = after.get(key);
    if (!left) result.push({ source: right.name, status: 'added', fromHash: null, toHash: right.hash });
    else if (!right) result.push({ source: left.name, status: 'removed', fromHash: left.hash, toHash: null });
    else if (left.hash !== right.hash || left.defaultPlateId !== right.defaultPlateId) result.push({ source: right.name, status: left.hash !== right.hash ? 'source-changed' : 'plate-changed', fromHash: left.hash, toHash: right.hash, fromPlate: left.defaultPlateId, toPlate: right.defaultPlateId });
  }
  return result.slice(0, 200);
}

function snapshotPlateCount(snapshot) {
  const ids = new Set();
  for (const plate of Array.isArray(snapshot?.plates) ? snapshot.plates : []) {
    ids.add(String(plate.defaultPlateId || 'A'));
    for (const record of Object.values(plate.objectRecords || {})) ids.add(String(record?.plateId || plate.defaultPlateId || 'A'));
    for (const instance of plate.batchInstances || []) ids.add(String(instance?.plateId || plate.defaultPlateId || 'A'));
  }
  return Math.max(1, ids.size);
}

function snapshotColors(snapshot, profile) {
  const colors = new Set();
  for (const plate of Array.isArray(snapshot?.plates) ? snapshot.plates : []) for (const value of Object.values(plate.values || {})) {
    if (typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)) colors.add(value.toUpperCase());
  }
  if (!colors.size && /^#[0-9a-f]{6}$/i.test(String(profile?.filamentColor || ''))) colors.add(String(profile.filamentColor).toUpperCase());
  return [...colors];
}

function skuRow(row, { includeSnapshot = false, includeParameters = false } = {}) {
  if (!row) return null;
  const result = { id: row.id, code: row.code, name: row.name, workspaceId: row.workspace_id || null, openscadVersion: row.openscad_version || '', workspaceHash: row.workspace_hash || '', revision: Number(row.revision) || 1, rules: safeJsonParse(row.rules_json, []), calibration: safeJsonParse(row.calibration_json, {}), createdAt: row.created_at, updatedAt: row.updated_at };
  result.objectSku = Boolean(boundRecord(safeJsonParse(row.workspace_snapshot_json, {})));
  const snapshot = (includeSnapshot || includeParameters) ? safeJsonParse(row.workspace_snapshot_json, {}) : null;
  if (includeParameters) result.parameters = snapshotParameterCatalog(snapshot);
  if (includeSnapshot) { result.workspaceSnapshot = snapshot; result.printProfile = sanitizeProfile(safeJsonParse(row.print_profile_json, {})); if (!result.parameters) result.parameters = snapshotParameterCatalog(snapshot); }
  return result;
}

function jobRow(row, { includeSnapshot = false } = {}) {
  if (!row) return null;
  const result = { id: row.id, skuId: row.sku_id || null, skuCode: row.sku_code || '', skuRevision: Math.max(1, Number(row.sku_revision) || 1), openscadVersion: row.openscad_version || '', orderRef: row.order_ref || '', customerLabel: row.customer_label || '', quantity: Math.max(1, Number(row.quantity) || 1), status: row.status, parameters: safeJsonParse(row.parameters_json, {}), plateCount: Number(row.plate_count) || 0, colors: safeJsonParse(row.colors_json, []), materials: safeJsonParse(row.materials_json, []), outputName: row.output_name || '', error: row.error || '', createdAt: row.created_at, updatedAt: row.updated_at, downloadedAt: row.downloaded_at || null };
  const productionSelection = safeJsonParse(row.workspace_snapshot_json, {}).productionSelection;
  if (productionSelection) Object.assign(result, productionSelection);
  if (includeSnapshot) { result.workspaceSnapshot = safeJsonParse(row.workspace_snapshot_json, {}); result.printProfile = sanitizeProfile(safeJsonParse(row.print_profile_json, {})); }
  return result;
}

async function currentOpenScadVersion() {
  try { return String((await findOpenSCAD())?.version || ''); } catch { return ''; }
}

async function createProductionJobFromSku(userId, sku, body = {}, { publicRequest = false, allowedParams = null } = {}) {
  const jobCount = Number(sql.productionJobCount.get(userId)?.count) || 0;
  if (jobCount >= MAX_PRODUCTION_JOBS_PER_ACCOUNT) throw badRequest(`Production job limit reached (${MAX_PRODUCTION_JOBS_PER_ACCOUNT}). Delete old generation-history records before creating more.`);
  let resolved = null;
  if (body.variantId || body.skuRevision || boundRecord(safeJsonParse(sku.workspace_snapshot_json, {}))) {
    resolved = variants.resolve(userId, sku.id, body);
    sku = { ...sku, revision: resolved.revision, openscad_version: resolved.openscadVersion,
      workspace_snapshot_json: JSON.stringify(resolved.workspaceSnapshot), print_profile_json: JSON.stringify(resolved.printProfile),
      rules_json: JSON.stringify(resolved.rules), calibration_json: JSON.stringify(resolved.calibration) };
  }
  const runtimeVersion = await currentOpenScadVersion();
  if (sku.openscad_version && runtimeVersion && sku.openscad_version !== runtimeVersion && body.allowVersionMismatch !== true) {
    throw badRequest(`SKU is locked to OpenSCAD ${sku.openscad_version}; this server is running ${runtimeVersion}. Revise the SKU intentionally before production.`);
  }
  const baseSnapshot = safeJsonParse(sku.workspace_snapshot_json, {});
  const profile = sanitizeProfile(safeJsonParse(sku.print_profile_json, {}));
  const parameters = sanitizeJobParameters(baseSnapshot, body.parameters, allowedParams);
  const mergedParameters = Object.assign({}, ...((baseSnapshot.plates || []).map((plate) => plate.values || {})), parameters);
  const rules = safeJsonParse(sku.rules_json, []);
  const failures = validateProductionRules(rules, mergedParameters);
  if (failures.length) throw badRequest(failures[0]);
  const snapshot = applyParametersToSnapshot(baseSnapshot, parameters);
  if (resolved) snapshot.productionSelection = { skuRevision: resolved.revision, variantId: resolved.variant?.id || null, variantRevision: resolved.variant?.revision || null, variantName: resolved.variant?.name || '' };
  const calibration = safeJsonParse(sku.calibration_json, {});
  profile.settings = { ...profile.settings, ...(calibration.settings || calibration) };
  const plateCount = snapshotPlateCount(snapshot);
  const colors = snapshotColors(snapshot, profile);
  const filamentTypes = Array.isArray(profile.settings?.filament_type) ? profile.settings.filament_type : [profile.settings?.filament_type || 'PLA'];
  const materials = [...new Set(filamentTypes.map((value) => String(value || '').trim()).filter(Boolean))].slice(0, 32);
  const quantity = Math.max(1, Math.min(10000, Math.floor(Number(body.quantity) || 1)));
  // BOM and automatic quoting were intentionally retired in V1.
  // Keep the legacy columns empty for database compatibility.
  const bom = [];
  const quote = {};
  const now = Date.now();
  const id = randomUUID();
  enforceAccountStorage(userId, jobStorageBytes({ parameters, snapshot, profile, colors, materials, bom, quote }));
  const lockedOpenScadVersion = sku.openscad_version || runtimeVersion || '';
  sql.createJob.run(id, userId, sku.id, sku.code, Math.max(1, Number(sku.revision) || 1), lockedOpenScadVersion, String(body.orderRef || '').slice(0, 120), cleanProductionName(body.customerLabel || '', ''), quantity, 'pending', JSON.stringify(parameters), JSON.stringify(snapshot), JSON.stringify(profile), plateCount, JSON.stringify(colors), JSON.stringify(materials), JSON.stringify(bom), JSON.stringify(quote), '', '', now, now);
  return jobRow(sql.jobById.get(userId, id), { includeSnapshot: !publicRequest });
}

function profileIdForName(name) {
  const normalized = String(name || 'Profile').normalize('NFKC').trim().toLowerCase();
  const slug = normalized
    .replace(/[^a-z0-9 _-]+/g, '')
    .replace(/[ _]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 58) || 'profile';
  return `${slug}-${createHash('sha256').update(normalized).digest('hex').slice(0, 10)}`;
}

function validateProfileId(id) {
  const clean = String(id || '');
  if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(clean)) throw badRequest('Invalid saved profile.');
  return clean;
}

function storedProfile(row) {
  if (!row?.profile_json) return null;
  try {
    return sanitizeProfile(JSON.parse(row.profile_json));
  } catch {
    return null;
  }
}

function activePrintProfile(userId) {
  const row = sql.activeProfile.get(userId);
  const profile = storedProfile(row);
  return profile
    ? { id: String(row.id), profile, profileFile: 'Private account storage' }
    : { id: null, profile: createDefaultProfile(), profileFile: 'Unsaved defaults' };
}

function listPrintProfiles(userId) {
  const active = sql.activeProfile.get(userId);
  const profiles = [];
  for (const row of sql.listProfiles.all(userId)) {
    try {
      const profile = storedProfile(row);
      if (!profile) continue;
      profiles.push({
        id: String(row.id),
        name: profile.name,
        printer: profile.printer,
        bedType: profile.bedType,
        profileFile: 'Private account storage'
      });
    } catch {}
  }
  return { profiles, selectedId: active?.id ? String(active.id) : null };
}

function saveNamedPrintProfile(userId, input) {
  const profile = sanitizeProfile(input);
  const id = profileIdForName(profile.name);
  const exists = sql.profileById.get(userId, id);
  if (!exists && Number(sql.profileCount.get(userId).count) >= 100) {
    throw badRequest('Each account can save up to 100 print presets.');
  }
  const now = Date.now();
  sql.upsertProfile.run(userId, id, profile.name, JSON.stringify(profile), now, now);
  sql.setActiveProfile.run(id, userId);
  return { id, profile, profileFile: 'Private account storage' };
}

function selectNamedPrintProfile(userId, idInput) {
  const id = validateProfileId(idInput);
  const row = sql.profileById.get(userId, id);
  const profile = storedProfile(row);
  if (!profile) throw badRequest('Saved profile was not found.');
  sql.setActiveProfile.run(id, userId);
  return { id, profile, profileFile: 'Private account storage' };
}

function workspaceNotFound() {
  const error = new Error('Workspace was not found.');
  error.code = 'WORKSPACE_NOT_FOUND';
  return error;
}

function validateWorkspaceId(value) {
  const id = String(value || '').toLowerCase();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id)) {
    throw workspaceNotFound();
  }
  return id;
}

function sanitizeWorkspaceName(value) {
  const name = String(value || 'Untitled workspace').normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g, '').trim();
  return name.slice(0, 120) || 'Untitled workspace';
}

function safeWorkspaceValue(value, depth = 0) {
  if (depth > 14) throw badRequest('Workspace data is nested too deeply.');
  if (value === null || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw badRequest('Workspace contains an invalid number.');
    return value;
  }
  if (typeof value === 'string') {
    if (Buffer.byteLength(value, 'utf8') > 1024 * 1024) throw badRequest('A workspace value is too large.');
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length > 10000) throw badRequest('A workspace list is too large.');
    return value.map((item) => safeWorkspaceValue(item, depth + 1));
  }
  if (!value || typeof value !== 'object') throw badRequest('Workspace contains an unsupported value.');
  const entries = Object.entries(value);
  if (entries.length > 5000) throw badRequest('A workspace object has too many values.');
  const result = {};
  for (const [key, item] of entries) {
    if (key === '__proto__' || key === 'prototype' || key === 'constructor' || key.length > 200) {
      throw badRequest('Workspace contains an invalid key.');
    }
    result[key] = safeWorkspaceValue(item, depth + 1);
  }
  return result;
}

function sanitizeWorkspaceData(input) {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  let colorOptimization, maxObjectsPerPlate;
  try { colorOptimization=colorOptimizationSettings(source.colorOptimization || {enabled:false}); maxObjectsPerPlate=normalizeMaxObjectsPerPlate(source.maxObjectsPerPlate); }
  catch(error) { throw badRequest(error.message); }
  const rawPlates = Array.isArray(source.plates) ? source.plates : [];
  if (rawPlates.length > MAX_SCAD_FILES_PER_UPLOAD) {
    throw badRequest(`A workspace can contain up to ${MAX_SCAD_FILES_PER_UPLOAD} SCAD files.`);
  }
  let sourceBytes = 0;
  const plates = rawPlates.map((candidate, index) => {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) throw badRequest('Workspace plate is invalid.');
    const sourceName = safeScadName(candidate.sourceName || candidate.name || `model-${index + 1}.scad`);
    if (!/\.scad$/i.test(sourceName)) throw badRequest(`${sourceName} is not a .scad file.`);
    const scadSource = typeof candidate.source === 'string' ? candidate.source : '';
    const bytes = Buffer.byteLength(scadSource, 'utf8');
    if (!scadSource.trim()) throw badRequest(`${sourceName} is empty.`);
    if (bytes > MAX_SCAD_FILE_BYTES) throw badRequest(`${sourceName} is larger than the 8 MB limit.`);
    if (scadSource.includes('\u0000')) throw badRequest(`${sourceName} is not a text SCAD file.`);
    sourceBytes += bytes;
    const sourceInstanceId = /^[A-Za-z0-9_-]{1,100}$/.test(String(candidate.sourceInstanceId || ''))
      ? String(candidate.sourceInstanceId) : `source_${index + 1}`;
    const defaultPlateId = isValidPlateId(String(candidate.defaultPlateId || '').toUpperCase())
      ? String(candidate.defaultPlateId).toUpperCase() : plateIdAt(index);
    if (candidate.objectBinding && (typeof candidate.objectBinding.selectionKey !== 'string'
      || !Array.isArray(candidate.objectBinding.memberIds)
      || candidate.objectBinding.memberIds.some(id => !Number.isInteger(id))
      || !candidate.objectRecords?.[candidate.objectBinding.selectionKey])) throw badRequest('Invalid object binding.');
    return {
      sourceInstanceId,
      sourceName,
      source: scadSource,
      packageId: candidate.packageId ? String(candidate.packageId) : null,
      packageEntry: candidate.packageEntry ? assetPath(candidate.packageEntry) : null,
      defaultPlateId,
      baseValues: safeWorkspaceValue(candidate.baseValues || {}),
      values: safeWorkspaceValue(candidate.values || {}),
      objectTransforms: safeWorkspaceValue(candidate.objectTransforms || {}),
      objectBinding: candidate.objectBinding ? safeWorkspaceValue(candidate.objectBinding) : null,
      objectRecords: safeWorkspaceValue(candidate.objectRecords || {}),
      batchInstances: safeWorkspaceValue(Array.isArray(candidate.batchInstances) ? candidate.batchInstances : []),
      selectedObjectId: String(candidate.selectedObjectId || 'all').slice(0, 200)
    };
  });
  if (sourceBytes > MAX_WORKSPACE_BYTES) throw badRequest('The saved SCAD sources are too large for one workspace.');

  const loadedPlateIds = [...new Set((Array.isArray(source.loadedPlateIds) ? source.loadedPlateIds : [])
    .map((id) => String(id).toUpperCase()).filter(isValidPlateId))];
  const batchPlateMeta = {};
  if (source.batchPlateMeta && typeof source.batchPlateMeta === 'object' && !Array.isArray(source.batchPlateMeta)) {
    for (const [rawId, rawMeta] of Object.entries(source.batchPlateMeta)) {
      const id = String(rawId).toUpperCase();
      if (!isValidPlateId(id) || !rawMeta || typeof rawMeta !== 'object' || Array.isArray(rawMeta)) continue;
      batchPlateMeta[id] = {
        name: String(rawMeta.name || `Plate ${id}`).normalize('NFKC').trim().slice(0, 80) || `Plate ${id}`,
        hidden: Boolean(rawMeta.hidden)
      };
    }
  }
  if (!batchPlateMeta.A) batchPlateMeta.A = { name: 'Plate A', hidden: false };

  const activeViewPlateId = isValidPlateId(String(source.activeViewPlateId || '').toUpperCase())
    ? String(source.activeViewPlateId).toUpperCase() : 'A';
  const activeSourceInstanceId = /^[A-Za-z0-9_-]{1,100}$/.test(String(source.activeSourceInstanceId || ''))
    ? String(source.activeSourceInstanceId) : null;
  const cameraSource = source.camera && typeof source.camera === 'object' && !Array.isArray(source.camera) ? source.camera : {};
  const safeVector = (value) => Array.isArray(value) && value.length === 3 && value.every(Number.isFinite)
    ? value.map(Number) : null;
  const data = {
    version: 1,
    printProfile: source.printProfile ? sanitizeProfile(source.printProfile) : null,
    colorOptimization,
    maxObjectsPerPlate,
    primeTowers: safeWorkspaceValue(Array.isArray(source.primeTowers) ? source.primeTowers.filter(tower => isValidPlateId(tower?.plateId)) : []),
    activeSourceInstanceId,
    activeViewPlateId,
    loadedPlateIds,
    batchPlateMeta,
    objectIdentityStore: safeWorkspaceValue(source.objectIdentityStore || {}),
    parametricPresets: safeWorkspaceValue(Array.isArray(source.parametricPresets) ? source.parametricPresets : []),
    activePresetIds: safeWorkspaceValue(Array.isArray(source.activePresetIds) ? source.activePresetIds : []),
    productionPlan: {
      quantity: Math.max(1, Math.min(100, Number(source.productionPlan?.quantity) || 4)),
      perPlate: Math.max(1, Math.min(100, Number(source.productionPlan?.perPlate) || 4))
    },
    productionRules: safeWorkspaceValue(Array.isArray(source.productionRules) ? source.productionRules.slice(0, 200) : []),
    camera: { position: safeVector(cameraSource.position), target: safeVector(cameraSource.target) },
    plates
  };
  const encoded = JSON.stringify(data);
  if (Buffer.byteLength(encoded, 'utf8') > MAX_WORKSPACE_BYTES) throw badRequest('Workspace is larger than the 20 MB save limit.');
  return { data, encoded, scadCount: plates.length };
}

function workspaceSummary(row) {
  return {
    id: String(row.id),
    name: String(row.name),
    kind: row.kind || 'workspace',
    pinned: Boolean(row.pinned),
    expiresAt: row.expires_at == null ? null : Number(row.expires_at),
    ...(row.kind === 'instant' ? { instant: instants.summary(row.user_id, row.id) } : {}),
    scadCount: Number(row.scad_count) || 0,
    previewStatus: ['ready', 'dirty', 'generating', 'failed'].includes(String(row.preview_status)) ? String(row.preview_status) : 'dirty',
    previewHash: row.preview_path ? createHash('sha256').update(String(row.preview_path)).digest('hex') : (row.preview_hash ? String(row.preview_hash) : null),
    hasPreview: Boolean(row.preview_path),
    previewOutdated: Boolean(row.preview_path) && row.preview_hash !== row.scad_hash,
    previewError: row.preview_error ? String(row.preview_error) : null,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at)
  };
}

function workspaceScadHash(data) {
  const plates = (Array.isArray(data?.plates) ? data.plates : []).map((plate) => ({
    sourceInstanceId: plate.sourceInstanceId,
    sourceName: plate.sourceName,
    source: plate.source,
    packageId: plate.packageId,
    packageEntry: plate.packageEntry,
    defaultPlateId: plate.defaultPlateId,
    values: plate.values,
    objectTransforms: plate.objectTransforms,
    objectBinding: plate.objectBinding,
    objectRecords: plate.objectRecords,
    batchInstances: plate.batchInstances
  }));
  return createHash('sha256').update(JSON.stringify({ previewVersion: WORKSPACE_PREVIEW_VERSION, loadedPlateIds: data?.loadedPlateIds, printProfile: data?.printProfile, primeTowers: data?.primeTowers, plates })).digest('hex');
}

function workspaceRevisionSummary(row) {
  return {
    id: String(row.id),
    name: String(row.name),
    scadCount: Number(row.scad_count) || 0,
    createdAt: Number(row.created_at)
  };
}

function accountStorageBytes(userId) {
  const args = Array(9).fill(userId);
  return (Number(sql.accountStorageBytes.get(...args)?.bytes) || 0) + variants.storageBytes(userId) + instants.storageBytes(userId) + exportHistory.storageBytes(userId);
}

function jsonStorageBytes(...values) {
  return values.reduce((sum, value) => sum + Buffer.byteLength(typeof value === 'string' ? value : JSON.stringify(value ?? null)), 0);
}

function skuStorageBytes(row) {
  if (!row) return 0;
  return jsonStorageBytes(row.workspace_snapshot_json, row.print_profile_json, row.rules_json, row.bom_json, row.quote_json, row.calibration_json);
}

function jobStorageBytes({ parameters, snapshot, profile, colors, materials, bom, quote }) {
  return jsonStorageBytes(parameters, snapshot, profile, colors, materials, bom, quote);
}

function enforceAccountStorage(userId, additionalBytes = 0, replacedBytes = 0) {
  const current = accountStorageBytes(userId);
  const projected = Math.max(0, current - Math.max(0, Number(replacedBytes) || 0)) + Math.max(0, Number(additionalBytes) || 0);
  if (projected > MAX_ACCOUNT_STORAGE_BYTES) {
    const limitGb = (MAX_ACCOUNT_STORAGE_BYTES / (1024 ** 3)).toFixed(MAX_ACCOUNT_STORAGE_BYTES >= 1024 ** 3 ? 1 : 2);
    throw badRequest(`Account storage limit reached (${limitGb} GB). Delete old workspaces, revisions, SKUs, templates, or production history before saving more data.`);
  }
  return projected;
}

function revisionReclaimBytes(userId, workspaceId) {
  const count = Number(sql.workspaceRevisionCount.get(userId, workspaceId)?.count) || 0;
  if (count < MAX_REVISIONS_PER_WORKSPACE) return 0;
  return Number(sql.oldestWorkspaceRevision.get(userId, workspaceId)?.bytes) || 0;
}

function storeWorkspaceRevision(userId, workspaceId, name, encoded, scadCount, createdAt = Date.now()) {
  const dataHash = createHash('sha256').update(name).update('\0').update(encoded).digest('hex');
  const latest = sql.latestWorkspaceRevision.get(userId, workspaceId);
  if (latest?.data_hash === dataHash && latest?.name === name) return String(latest.id);
  const revisionBytes = Buffer.byteLength(encoded, 'utf8');
  const count = Number(sql.workspaceRevisionCount.get(userId, workspaceId)?.count) || 0;
  const oldest = count >= MAX_REVISIONS_PER_WORKSPACE ? sql.oldestWorkspaceRevision.get(userId, workspaceId) : null;
  enforceAccountStorage(userId, revisionBytes, Number(oldest?.bytes) || 0);
  const revisionId = randomUUID();
  sql.createWorkspaceRevision.run(revisionId, workspaceId, userId, name, encoded, dataHash, scadCount, createdAt);
  sql.trimWorkspaceRevisions.run(userId, workspaceId, userId, workspaceId);
  return revisionId;
}

function listWorkspaceRevisions(userId, idInput) {
  const id = validateWorkspaceId(idInput);
  if (!sql.workspaceById.get(userId, id)) throw workspaceNotFound();
  return { revisions: sql.listWorkspaceRevisions.all(userId, id).map(workspaceRevisionSummary) };
}

function restoreWorkspaceRevision(userId, workspaceIdInput, revisionIdInput) {
  const workspaceId = validateWorkspaceId(workspaceIdInput);
  const revisionId = validateWorkspaceId(revisionIdInput);
  const row = sql.workspaceRevisionById.get(userId, workspaceId, revisionId);
  if (!row) throw workspaceNotFound();
  const { data, encoded, scadCount } = sanitizeWorkspaceData(JSON.parse(row.data_json));
  const name = sanitizeWorkspaceName(row.name);
  const now = Date.now();
  const scadHash = workspaceScadHash(data);
  const existingWorkspace = sql.workspaceById.get(userId, workspaceId);
  const oldBytes = Buffer.byteLength(String(existingWorkspace?.data_json || ''), 'utf8');
  const newBytes = Buffer.byteLength(encoded, 'utf8');
  enforceAccountStorage(userId, newBytes * 2, oldBytes + revisionReclaimBytes(userId, workspaceId));
  const result = sql.updateWorkspace.run(name, encoded, scadCount, scadHash, scadHash, now, userId, workspaceId);
  if (!result.changes) throw workspaceNotFound();
  const revisionIdCreated = storeWorkspaceRevision(userId, workspaceId, name, encoded, scadCount, now);
  return { id: workspaceId, name, scadCount, updatedAt: now, revisionId: revisionIdCreated, data };
}

function listWorkspaces(userId) {
  return { workspaces: sql.listWorkspaces.all(userId).map(row => workspaceSummary({ ...row, user_id: userId })) };
}

async function deleteWorkspace(userId, workspaceIdInput) {
  const workspaceId = validateWorkspaceId(workspaceIdInput);
  const row = sql.workspaceById.get(userId, workspaceId);
  if (!row) throw workspaceNotFound();
  const previewPath = safePreviewFilePath(row.preview_path);
  instants.remove(userId, workspaceId);
  const result = sql.deleteWorkspace.run(userId, workspaceId);
  if (!result.changes) throw workspaceNotFound();
  instants.prune(userId);
  if (previewPath) await fs.rm(previewPath, { force: true }).catch(() => {});
  return { deleted: true, id: workspaceId };
}

function updateLibraryOptions(userId, idInput, input) {
  const id=validateWorkspaceId(idInput),row=sql.workspaceById.get(userId,id);
  if(!row) throw workspaceNotFound();
  if(!input || Object.keys(input).length!==1 || typeof input.pinned!=='boolean') throw badRequest('Choose whether to pin this project.');
  authDb.prepare('UPDATE workspaces SET pinned=? WHERE user_id=? AND id=?').run(Number(input.pinned),userId,id);
  return workspaceSummary({...sql.workspaceById.get(userId,id),user_id:userId});
}

let expiryCleanup=null,expiryTimer;
function expireTemporaryWorkspaces() {
  if(expiryCleanup) return expiryCleanup;
  expiryCleanup=(async()=>{
    const expired=authDb.prepare("SELECT id,user_id FROM workspaces WHERE kind='workspace' AND expires_at<=?").all(Date.now());
    for(const row of expired) {
      const current=sql.workspaceById.get(row.user_id,row.id);
      if(current?.expires_at!=null && current.expires_at<=Date.now()) await deleteWorkspace(row.user_id,row.id);
    }
  })().finally(()=>{expiryCleanup=null;});
  return expiryCleanup;
}

function createWorkspace(userId, nameInput, dataInput = {}) {
  if (Number(sql.workspaceCount.get(userId).count) >= MAX_WORKSPACES_PER_ACCOUNT) {
    throw badRequest(`Each account can save up to ${MAX_WORKSPACES_PER_ACCOUNT} workspaces.`);
  }
  const id = randomUUID();
  const name = sanitizeWorkspaceName(nameInput);
  const { data, encoded, scadCount } = sanitizeWorkspaceData(dataInput);
  for (const plate of data.plates) if (plate.packageId) packageSource(instants.packageFiles(userId, plate.packageId), plate.packageEntry);
  const scadHash = workspaceScadHash(data);
  const now = Date.now();
  const bytes = Buffer.byteLength(encoded, 'utf8');
  enforceAccountStorage(userId, bytes * 2);
  sql.createWorkspace.run(id, userId, name, encoded, scadCount, scadHash, now, now);
  const revisionId = storeWorkspaceRevision(userId, id, name, encoded, scadCount, now);
  return { ...workspaceSummary({ id, name, scad_count: scadCount, created_at: now, updated_at: now }), revisionId, data };
}

function getWorkspace(userId, idInput) {
  const id = validateWorkspaceId(idInput);
  const row = sql.workspaceById.get(userId, id);
  if (!row) throw workspaceNotFound();
  sql.markWorkspaceOpened.run(Date.now(), userId, id);
  let data;
  try { data = sanitizeWorkspaceData(JSON.parse(row.data_json)).data; } catch { data = sanitizeWorkspaceData({}).data; }
  return { ...workspaceSummary({ ...row, user_id: userId }), data };
}

function saveWorkspace(userId, idInput, input) {
  const id = validateWorkspaceId(idInput);
  const existingWorkspace = sql.workspaceById.get(userId, id);
  if (!existingWorkspace) throw workspaceNotFound();
  const name = sanitizeWorkspaceName(input?.name);
  const { data, encoded, scadCount } = sanitizeWorkspaceData(input?.data);
  for (const plate of data.plates) if (plate.packageId) packageSource(instants.packageFiles(userId, plate.packageId), plate.packageEntry);
  const scadHash = workspaceScadHash(data);
  const now = Date.now();
  const newBytes = Buffer.byteLength(encoded, 'utf8');
  const oldBytes = Buffer.byteLength(String(existingWorkspace.data_json || ''), 'utf8');
  enforceAccountStorage(userId, newBytes * 2, oldBytes + revisionReclaimBytes(userId, id));
  const result = sql.updateWorkspace.run(name, encoded, scadCount, scadHash, scadHash, now, userId, id);
  if (!result.changes) throw workspaceNotFound();
  const revisionId = storeWorkspaceRevision(userId, id, name, encoded, scadCount, now);
  return { id, name, scadCount, updatedAt: now, revisionId, data };
}

async function probeOpenSCAD(candidate) {
  if ((candidate.includes('/') || candidate.includes('\\')) && !fsSync.existsSync(candidate)) return null;
  const versionWorks = await new Promise((resolve) => {
    const child = spawn(candidate, ['--version'], { windowsHide: true });
    let output = '';
    child.stdout.on('data', (chunk) => { output += chunk.toString(); });
    child.stderr.on('data', (chunk) => { output += chunk.toString(); });
    child.once('error', () => resolve(null));
    child.once('exit', (code) => resolve(code === 0 ? output.trim() : null));
  });
  if (versionWorks === null) return null;

  const help = await new Promise((resolve) => {
    const child = spawn(candidate, ['--help'], { windowsHide: true });
    let output = '';
    child.stdout.on('data', (chunk) => { output += chunk.toString(); });
    child.stderr.on('data', (chunk) => { output += chunk.toString(); });
    child.once('error', () => resolve(''));
    child.once('exit', () => resolve(output));
  });
  const backendFlag = /--backend\b/i.test(help);
  let manifoldBackend = false;
  if (backendFlag) {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pmm-openscad-probe-'));
    try {
      const scad = path.join(tempDir, 'probe.scad');
      const out = path.join(tempDir, 'probe.stl');
      await fs.writeFile(scad, 'cube([1,1,1]);\n', 'utf8');
      const result = await new Promise((resolve) => {
        const child = spawn(candidate, ['--backend', 'Manifold', '--export-format', 'binstl', '-o', out, scad], { cwd: tempDir, windowsHide: true });
        child.once('error', () => resolve(false));
        child.once('exit', (code) => resolve(code === 0));
      });
      manifoldBackend = result && fsSync.existsSync(out) && fsSync.statSync(out).size > 84;
    } catch {} finally {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  }
  if (!backendFlag || !manifoldBackend) return null;
  return {
    bin: candidate,
    version: versionWorks,
    remote: false,
    backendFlag: true,
    manifoldBackend: true,
    enableTextmetrics: /--enable\b/.test(help) && /textmetrics/.test(help),
    enableLazyUnion: /--enable\b/.test(help) && /lazy-union/.test(help)
  };
}

async function probeRemoteRenderer() {
  if (!RENDERER_URL) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`${RENDERER_URL}/healthz`, { signal: controller.signal, headers: RENDERER_TOKEN ? { 'x-pmm-renderer-token': RENDERER_TOKEN } : {} });
    if (!response.ok) return null;
    const info = await response.json();
    if (!info?.ready || !info?.manifoldBackend) return null;
    return { ...info, manifoldBackend: true, remote: true, bin: null };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function findOpenSCAD() {
  if (openScadInfoPromise) return openScadInfoPromise;
  openScadInfoPromise = (async () => {
    if (RENDERER_URL) return probeRemoteRenderer();
    const explicit = process.env.OPENSCAD_BIN;
    const candidates = [
      explicit,
      '/Applications/OpenSCAD Nightly.app/Contents/MacOS/OpenSCAD',
      '/Applications/OpenSCAD-Dev.app/Contents/MacOS/OpenSCAD',
      'C:\\Program Files\\OpenSCAD (Nightly)\\openscad.exe',
      'C:\\Program Files (x86)\\OpenSCAD (Nightly)\\openscad.exe',
      process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'OpenSCAD (Nightly)', 'openscad.exe'),
      process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'OpenSCAD', 'openscad.exe'),
      '/Applications/OpenSCAD.app/Contents/MacOS/OpenSCAD',
      'openscad',
      'C:\\Program Files\\OpenSCAD\\openscad.exe',
      'C:\\Program Files (x86)\\OpenSCAD\\openscad.exe'
    ].filter(Boolean);

    for (const candidate of candidates) {
      const info = await probeOpenSCAD(candidate);
      if (info) return info;
    }
    return null;
  })();
  return openScadInfoPromise;
}

async function remoteRendererRequest(endpoint, payload, signal = undefined) {
  if (!RENDERER_URL) throw new Error('Remote renderer is not configured.');
  const response = await fetch(`${RENDERER_URL}${endpoint}`, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json', ...(RENDERER_TOKEN ? { 'x-pmm-renderer-token': RENDERER_TOKEN } : {}) },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    let message = `Renderer request failed (${response.status}).`;
    try { message = (await response.json())?.error || message; } catch {}
    const error = new Error(message);
    error.code = response.status === 503 ? 'OPENSCAD_NOT_FOUND' : [400,413,422].includes(response.status) ? 'RENDER_INPUT_ERROR' : 'RENDERER_FAILED';
    throw error;
  }
  return { data: Buffer.from(await response.arrayBuffer()), renderCacheIdentity: response.headers.get('x-render-identity') };
}

function sendJson(res, status, body) {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(text),
    'Cache-Control': 'no-store'
  });
  res.end(text);
}

async function sendCompressedJson(req, res, body) {
  let data = Buffer.from(JSON.stringify(body));
  if (data.length > 1024 && acceptsGzip(req)) {
    data = await gzipAsync(data, { level: 4 });
    res.setHeader('Content-Encoding', 'gzip');
  }
  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8', 'Content-Length': data.length,
    'Cache-Control': 'no-store', 'Vary': 'Cookie, Accept-Encoding'
  });
  res.end(data);
}

function acceptsGzip(req) {
  return String(req.headers['accept-encoding'] || '').split(',').some((part) => {
    const [encoding, ...parameters] = part.trim().toLowerCase().split(';');
    const quality = parameters.find((parameter) => parameter.trim().startsWith('q='));
    return encoding === 'gzip' && (!quality || Number(quality.trim().slice(2)) > 0);
  });
}

function setSecurityHeaders(res) {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) res.setHeader(name, value);
}

const rateBuckets = new Map();
let lastRateCleanup = Date.now();

function clientAddress(req) {
  if (PROXY_MODE === 'cloudflare') {
    const address = String(req.headers['cf-connecting-ip'] || '').trim();
    return isIP(address) ? address : 'unknown';
  }
  const forwarded = TRUST_PROXY ? String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() : '';
  return (forwarded || req.socket.remoteAddress || 'unknown').replace(/^::ffff:/, '');
}

function workspaceIdFromReferer(req) {
  try {
    const id = new URL(String(req.headers.referer || ''), 'http://localhost').searchParams.get('workspace') || '';
    return /^[0-9a-f-]{36}$/i.test(id) ? id : '';
  } catch { return ''; }
}

function authIdentityKey(value) {
  const normalized = String(value || '').normalize('NFKC').trim().toLowerCase().slice(0, 254);
  return createHash('sha256').update(normalized).digest('hex');
}

function proxyRequestAllowed(req) {
  if (PROXY_MODE !== 'cloudflare') return true;
  return isIP(String(req.headers['cf-connecting-ip'] || '').trim()) > 0;
}

function rateAllowed(scope, key, limit, windowMs) {
  const now = Date.now();
  if (now - lastRateCleanup > 60_000) {
    for (const [bucketKey, bucket] of rateBuckets) {
      if (bucket.resetAt <= now) rateBuckets.delete(bucketKey);
    }
    lastRateCleanup = now;
  }
  const bucketKey = `${scope}:${key}`;
  let bucket = rateBuckets.get(bucketKey);
  if (!bucket || bucket.resetAt <= now) {
    if (!bucket && rateBuckets.size >= 20_000) rateBuckets.delete(rateBuckets.keys().next().value);
    bucket = { count: 0, resetAt: now + windowMs };
    rateBuckets.set(bucketKey, bucket);
  }
  bucket.count += 1;
  return bucket.count <= limit ? { allowed: true, retryAfter: 0 } : {
    allowed: false,
    retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
  };
}

function requestHostAllowed(req) {
  return ALLOWED_HOSTS.size === 0 || ALLOWED_HOSTS.has(normalizedHostname(req.headers.host));
}

function requestOriginAllowed(req) {
  if (req.method === 'GET' || req.method === 'HEAD') return true;
  const origin = String(req.headers.origin || '').trim();
  try {
    if (PUBLIC_ORIGIN) return Boolean(origin) && normalizedOrigin(origin) === PUBLIC_ORIGIN;
    if (!origin) return true;
    return new URL(origin).hostname.toLowerCase() === normalizedHostname(req.headers.host);
  } catch {
    return false;
  }
}

function sendRateLimited(res, retryAfter) {
  res.setHeader('Retry-After', String(retryAfter));
  return sendJson(res, 429, { error: 'Too many requests. Wait before trying again.' });
}

function badRequest(message) {
  const error = new Error(message);
  error.code = 'BAD_REQUEST';
  return error;
}

async function readJson(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw badRequest('Request too large. Upload fewer or smaller SCAD files.');
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function literalAssignment(assignments, name) {
  const literal = assignments.get(name)?.literal;
  return literal && literal.type !== 'raw' ? literal.value : null;
}

function validSelectorName(assignments, value, fallback) {
  const name = typeof value === 'string' && /^[A-Za-z_$][A-Za-z0-9_]*$/.test(value) ? value : fallback;
  return name && assignments.has(name) ? name : null;
}

function detectObjects(source, parameters, document = parseScadDocument(source)) {
  const assignments = new Map(document.assignments.map(item => [item.name, item]));
  const names = new Map(parameters.map((p) => [p.name, p]));
  const manifest = literalAssignment(assignments, 'pmm_objects');
  const objectSelectorParam = validSelectorName(
    assignments,
    literalAssignment(assignments, 'pmm_object_selector_param'),
    assignments.has('export_single_design') ? 'export_single_design' : null
  );
  const partSelectorParam = validSelectorName(
    assignments,
    literalAssignment(assignments, 'pmm_part_selector_param'),
    assignments.has('render_part') ? 'render_part' : null
  );

  if (Array.isArray(manifest) && objectSelectorParam) {
    const seen = new Set();
    const objects = [];
    for (const row of manifest) {
      if (!Array.isArray(row) || row.length < 1) continue;
      const id = Number(row[0]);
      if (!Number.isInteger(id) || id < 1 || id > 1000 || seen.has(id)) continue;
      seen.add(id);
      const label = typeof row[1] === 'string' && row[1].trim() ? row[1].trim() : `Object ${id}`;
      const labelParam = typeof row[2] === 'string' && names.has(row[2]) ? row[2] : null;
      const mergeKey = typeof row[3] === 'string' && row[3].trim() ? row[3].trim() : `object_${id}`;
      objects.push({ id, label, labelParam, mergeKey });
    }
    if (objects.length) {
      return { objects, objectSelectorParam, partSelectorParam, manifest: true };
    }
  }

  if (!objectSelectorParam) return { objects: [], objectSelectorParam: null, partSelectorParam, manifest: false, ...inferDesignSelector(parameters) };
  const ids = [...assignments.keys()].map(name => Number(name.match(/^design(\d+)_name_text$/)?.[1])).filter(id => Number.isInteger(id) && id > 0);
  const objects = [...new Set(ids)].sort((a, b) => a - b).map((id) => ({
    id,
    label: `Design ${id}`,
    labelParam: names.has(`design${id}_name_text`) ? `design${id}_name_text` : null,
    mergeKey: `object_${id}`
  }));
  return { objects, objectSelectorParam, partSelectorParam, manifest: false };
}


async function modelPathForId(modelId = 'default') {
  const id = String(modelId || 'default');
  if (id === 'default') return MODEL_PATH;
  const error = new Error('Uploaded SCAD files are session-only. Add the file again.');
  error.code = 'MODEL_NOT_FOUND';
  throw error;
}

function safeScadName(value) {
  const base = path.basename(String(value || 'model.scad')).replace(/[\u0000-\u001f\u007f]/g, '').trim();
  return (base || 'model.scad').slice(0, 180);
}

async function storeUploadedModels(input) {
  if (!Array.isArray(input) || !input.length) throw badRequest('Choose at least one .scad file.');
  if (input.length > MAX_SCAD_FILES_PER_UPLOAD) throw badRequest(`Upload no more than ${MAX_SCAD_FILES_PER_UPLOAD} SCAD files at once.`);
  const stored = [];
  for (const candidate of input) {
    const name = safeScadName(candidate?.name);
    if (!/\.scad$/i.test(name)) throw badRequest(`${name} is not a .scad file.`);
    const source = typeof candidate?.source === 'string' ? candidate.source : '';
    const bytes = Buffer.byteLength(source);
    if (!source.trim()) throw badRequest(`${name} is empty.`);
    if (bytes > MAX_SCAD_FILE_BYTES) throw badRequest(`${name} is larger than the 8 MB upload limit.`);
    if (source.includes('\u0000')) throw badRequest(`${name} is not a text SCAD file.`);
    const id = createHash('sha256').update(name).update('\0').update(source).digest('hex').slice(0, 24);
    stored.push({ id, name, source });
  }
  return stored;
}

function modelInfoFromSource(source, modelPath = null) {
  source = applyFontDefaultsToSource(source);
  const sourceHash = createHash('sha256').update(source).digest('hex');
  const cached = sourceInfoCache.get(sourceHash);
  if (cached) {
    sourceInfoCache.delete(sourceHash);
    sourceInfoCache.set(sourceHash, cached);
    return { ...cached.info, modelPath };
  }
  const document = parseScadDocument(source);
  const parameters = defaultFontParameters(document.parameters);
  const objectMetadata = detectObjects(source, parameters, document);
  const info = {
    source,
    sourceHash,
    modelPath,
    parameters,
    previewFacetDefinition: previewFacetCap(document),
    fastPartExport: document.assignments.some(item => item.name === 'pmm_export_parts' && item.literal.type === 'boolean'),
    components: document.components,
    parserDiagnostics: document.diagnostics,
    ...objectMetadata
  };
  info.solidPartsExport = supportsSolidParts(source, info);
  const bytes = Buffer.byteLength(source) * 2;
  sourceInfoCache.set(sourceHash, { info, bytes });
  sourceInfoCacheBytes += bytes;
  while (sourceInfoCacheBytes > 64 * 1024 * 1024 || sourceInfoCache.size > 128) {
    const oldestKey = sourceInfoCache.keys().next().value;
    sourceInfoCacheBytes -= sourceInfoCache.get(oldestKey).bytes;
    sourceInfoCache.delete(oldestKey);
  }
  return info;
}

async function modelInfo(modelId = 'default') {
  const modelPath = await modelPathForId(modelId);
  const stat = await fs.stat(modelPath);
  const cached = modelInfoCache.get(modelPath);
  if (cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) return cached.info;
  const source = await fs.readFile(modelPath, 'utf8');
  const info = modelInfoFromSource(source, modelPath);
  modelInfoCache.set(modelPath, { mtimeMs: stat.mtimeMs, size: stat.size, info });
  return info;
}

async function publicModelInfoFromSource(item, shared = null) {
  const { parameters, objects, objectSelectorParam, partSelectorParam, manifest, fastPartExport, solidPartsExport, components, parserDiagnostics } = modelInfoFromSource(item.source);
  const common = shared || await Promise.all([
    findOpenSCAD(),
    getLocalFontCatalog(),
    getProjectFontIndex(),
    getProjectFontStats()
  ]);
  const [openscad, localFonts, projectFonts, fontStats] = common;
  return {
    id: item.id,
    model: item.name,
    parameters,
    objects,
    components,
    parserDiagnostics,
    objectSelectorParam,
    partSelectorParam,
    fastPartExport,
    solidPartsExport,
    objectManifest: manifest,
    localFonts,
    projectFonts,
    fontStats,
    openscadReady: Boolean(openscad),
    openscadVersion: openscad?.version || null,
    textmetricsCliEnabled: Boolean(openscad?.enableTextmetrics)
  };
}

async function workspaceBootstrap(session, id) {
  const workspace = getWorkspace(session.userId, id);
  const openscad = await findOpenSCAD();
  const files = workspace.data.plates.length ? await storeUploadedModels(workspace.data.plates.map((plate) => ({ name: plate.sourceName, source: plate.source }))) : [];
  // Font discovery is independent of rendering and must not delay opening a workspace.
  const models = await Promise.all(files.map((item) => publicModelInfoFromSource(item, [openscad])));
  return {
    user: { email: session.email, displayName: session.displayName, preferences: session.settings },
    workspace, models, runtime: {
      openscadReady: Boolean(openscad),
      renderSlots: syncRenderSchedulerCapacity(openscad),
      fullRenderSlots: fullRenderWeightFor(openscad),
      renderMemoryBudgetMb: Math.round(RENDER_MEMORY_BUDGET_BYTES / 1024 / 1024)
    },
    printProfile: activePrintProfile(session.userId), printProfiles: listPrintProfiles(session.userId)
  };
}

async function publicModelInfo(modelId = 'default', displayName = null, shared = null) {
  const { parameters, objects, objectSelectorParam, partSelectorParam, manifest, modelPath, fastPartExport, components, parserDiagnostics } = await modelInfo(modelId);
  const common = shared || await Promise.all([
    findOpenSCAD(),
    getLocalFontCatalog(),
    getProjectFontIndex(),
    getProjectFontStats()
  ]);
  const [openscad, localFonts, projectFonts, fontStats] = common;
  return {
    id: modelId,
    model: displayName || path.basename(modelPath),
    parameters,
    objects,
    components,
    parserDiagnostics,
    objectSelectorParam,
    partSelectorParam,
    fastPartExport,
    objectManifest: manifest,
    localFonts,
    projectFonts,
    fontStats,
    openscadReady: Boolean(openscad),
    openscadVersion: openscad?.version || null,
    textmetricsCliEnabled: Boolean(openscad?.enableTextmetrics)
  };
}

function normalizeValues(input, params) {
  const allowed = new Map(params.map((p) => [p.name, p]));
  const values = input && typeof input === 'object' ? input : {};
  const definitions = [];

  for (const [name, value] of Object.entries(values)) {
    const param = allowed.get(name);
    if (!param) continue;
    definitions.push(`${name}=${valueToScad(value, param)}`);
  }
  return definitions;
}

const PREVIEW_RENDER_PARTS = new Set(['base', 'tag_shadow', 'tag_text', 'symbol_base', 'symbol_shadow', 'symbol_top']);

function previewFacetCap(document) {
  const literal = document.assignments.find(item => item.name === '$fn')?.literal;
  return literal?.type === 'number' && literal.value > 24 ? '$fn=24' : null;
}

function trustedInternalDefinitions(extra = {}, metadata = {}) {
  const definitions = [];
  const facetCap = extra.previewQuality ? metadata.previewFacetDefinition : null;
  if (facetCap) definitions.push(facetCap);
  if (extra.objectId !== undefined) {
    definitions.push(objectSelectorDefinition(extra.objectId, metadata));
  }
  if (extra.part !== undefined) {
    const part = String(extra.part);
    if (!PREVIEW_RENDER_PARTS.has(part)) throw new Error('Invalid preview part.');
    if (!metadata.partSelectorParam) throw new Error('This SCAD does not declare a part selector parameter.');
    definitions.push(`${metadata.partSelectorParam}=${JSON.stringify(part)}`);
  }
  if (extra.exportParts) {
    if (!metadata.fastPartExport) {
      throw new Error('This SCAD does not support batched part export.');
    }
    definitions.push('pmm_export_parts=true');
  }
  return definitions;
}

async function renderModel(values, format, extra = {}) {
  if (!['stl', '3mf'].includes(format)) throw new Error('Unsupported export format.');
  const signal = extra.signal;
  if (signal?.aborted) throw abortError();
  // Recheck the private manager before cache lookup: it may have restarted
  // with a different image or a mutable font volume since the app booted.
  const openscad = RENDERER_URL ? await probeRemoteRenderer() : await findOpenSCAD();
  if (!openscad) {
    const error = new Error('A current OpenSCAD runtime with a working Manifold backend was not found. Install the current OpenSCAD development build or set OPENSCAD_BIN.');
    error.code = 'OPENSCAD_NOT_FOUND';
    throw error;
  }
  syncRenderSchedulerCapacity(openscad);

  const modelId = String(extra.modelId || 'default');
  const inlineSource = typeof extra.source === 'string' && extra.source.trim() ? extra.source : null;
  if (inlineSource && Buffer.byteLength(inlineSource) > MAX_SCAD_FILE_BYTES) throw badRequest('SCAD source is larger than the 8 MB limit.');
  let dependencyFiles = extra.dependencies || (extra.packageId ? instants.packageFiles(String(extra.owner || '').replace(/^user:/, ''), extra.packageId) : null);
  let frozenFonts = Boolean(extra.frozenFonts);
  if (extra.packageId && !extra.dependencies) {
    const font = await fs.readFile(path.join(__dirname, 'fonts/bundled/Baloo2[wght].ttf'));
    const fontPath = `export-fonts/${createHash('sha256').update(font).digest('hex')}.ttf`;
    dependencyFiles = [...dependencyFiles];
    if (!dependencyFiles.some(file => file.path === fontPath)) dependencyFiles.push({ path: fontPath, base64: font.toString('base64') });
    frozenFonts = true;
  }
  const metadata = inlineSource ? modelInfoFromSource(inlineSource) : await modelInfo(modelId);
  const solidParts = extra.solidParts;
  if (solidParts && (format !== '3mf' || !inlineSource || !metadata.solidPartsExport
    || extra.objectId === undefined || !Array.isArray(solidParts) || !solidParts.length || solidParts.length > 8
    || solidParts.some((part) => !PREVIEW_RENDER_PARTS.has(part)))) throw badRequest('Invalid batched solid export request.');
  if (solidParts) {
    return renderSolidParts(solidParts, (part, partSignal) => renderModel(values, format, {
      ...extra, solidParts: undefined, part, signal: partSignal, allowEmpty: true, onCacheHit: undefined
    }), { concurrency: renderCapacityFor(openscad), signal });
  }
  let modelPath = metadata.modelPath;
  const { parameters, objects } = metadata;
  if (extra.objectId !== undefined && !objects.some((o) => o.id === Number(extra.objectId))) {
    throw new Error('This SCAD does not expose that object.');
  }
  const definitions = [
    ...normalizeValues({ ...Object.fromEntries(parameters.filter(p=>p.type==='string'&&(p.fontPicker||/(?:^|_)font(?:_preset|_family)?$/.test(p.name))).map(p=>[p.name,p.default])), ...values }, parameters).sort(),
    ...trustedInternalDefinitions(extra, metadata)
  ];
  const owner = extra.owner || 'system';
  const cacheToken = diskRenderCache.token(owner);
  let fontIdentity = openscad.remote && /^sha256:[a-f0-9]{64}$/.test(openscad.renderCacheIdentity || '') ? openscad.renderCacheIdentity : null;
  let nativeFonts;
  const hasText = [metadata.source || '', ...(dependencyFiles || []).filter(file => /\.scad$/i.test(file.path)).map(file => Buffer.from(file.base64, 'base64').toString('utf8'))].some(source => /\btext\s*\(/.test(source));
  if (!openscad.remote && !frozenFonts && !extra.noCache && hasText) {
    await openScadFontEnv();
    nativeFonts = { binary: openscad.bin, config: FONTCONFIG_FILE,
      directories: [CUSTOM_FONT_DIR, path.join(__dirname, 'fonts', 'bundled'), path.join(__dirname, 'fonts', 'custom')] };
    fontIdentity = await nativeFontIdentity(nativeFonts);
  }
  const nativeFontsUnchanged = async () => !nativeFonts || (fontIdentity !== null && await nativeFontIdentity(nativeFonts) === fontIdentity);
  const selfContained = canCacheRender(metadata.source || '', { dependencies: dependencyFiles, frozenFonts, fontIdentity, noCache: extra.noCache });
  const cacheKey = renderInputCacheKey({
      owner,
      source: metadata.sourceHash,
      sourcePath: metadata.modelPath,
      packageEntry: extra.packageEntry || extra.sourceName || null,
      dependencies: dependencyFiles,
      frozenFonts,
      fontIdentity,
      openscad: openscad.version || openscad.bin,
      previewQuality: Boolean(extra.previewQuality),
      format,
      ...(extra.allowEmpty ? { allowEmpty: true } : {}),
      definitions
    });
  const cached = selfContained ? cachedRender(cacheKey) : null;
  if (cached) { extra.onCacheHit?.('memory'); return cached; }
  // Identical frozen full-quality requests share work; preview quality has its
  // own key and can never satisfy an export.
  const flightKey = `${cacheToken}:${cacheKey}${extra.noCache ? `:${randomUUID()}` : ''}`;
  return renderInFlight.run(flightKey, async (signal) => {
  if (selfContained) {
    const saved = await diskRenderCache.get(owner, cacheKey).catch(() => null);
    if (signal.aborted) throw abortError();
    if (saved !== null && cacheToken === diskRenderCache.token(owner)) {
      cacheRender(cacheKey, saved);
      extra.onCacheHit?.('disk');
      return saved;
    }
  }
  const release = await renderScheduler.acquire({
    signal,
    owner: extra.owner,
    priority: extra.background ? 1 : (extra.previewQuality ? 0 : -1),
    weight: extra.previewQuality ? 1 : fullRenderWeightFor()
  });
  let tempDir = null;
  try {
    const queuedCached = selfContained ? cachedRender(cacheKey) : null;
    if (queuedCached) { extra.onCacheHit?.('memory'); return queuedCached; }
    if (signal?.aborted) throw abortError();
    if (openscad.remote) {
      const renderSource = metadata.source;
      const { data, renderCacheIdentity } = await remoteRendererRequest('/render', {
        source: renderSource,
        sourceName: safeScadName(extra.sourceName || path.basename(metadata.modelPath || 'model.scad')),
        format,
        definitions,
        dependencies: dependencyFiles,
        frozenFonts,
        packageEntry: extra.packageEntry || extra.sourceName,
        values,
        enableLazyUnion: false,
        allowEmpty: Boolean(extra.allowEmpty),
        requireSandbox: Boolean(extra.requireSandbox || extra.packageId),
        background: Boolean(extra.background)
      }, signal);
      // A manager restart between health and render must not put new-image
      // geometry under the old image's cache key.
      if (cacheToken === diskRenderCache.token(owner) && selfContained && (!fontIdentity || renderCacheIdentity === fontIdentity)) {
        cacheRender(cacheKey, data);
        void diskRenderCache.put(owner, cacheKey, data, cacheToken).catch(() => {});
      }
      return data;
    }
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'scad-customizer-'));
    let fontEnv = await openScadFontEnv();
    if (dependencyFiles) fontEnv = await materializeAssets(tempDir, dependencyFiles, fontEnv, { exclusiveFonts: frozenFonts });
    if (inlineSource) {
      modelPath = path.join(tempDir, dependencyFiles ? assetPath(extra.packageEntry || extra.sourceName) : safeScadName(extra.sourceName));
      await fs.mkdir(path.dirname(modelPath), { recursive: true });
      await fs.writeFile(modelPath, inlineSource, 'utf8');
    }
    const outPath = path.join(tempDir, `model.${format}`);
    const args = [];
    if (openscad.enableTextmetrics) args.push('--enable', 'textmetrics');
    args.push('--backend', 'Manifold');
    if (format === 'stl') args.push('--export-format', 'binstl');
    args.push('-o', outPath);
    for (const definition of definitions) args.push('-D', definition);
    args.push(modelPath);
    if (dependencyFiles) await verifyFonts(metadata.source, values, fontEnv);
    if (signal.aborted) throw abortError();
    await new Promise((resolve, reject) => {
      const child = spawn(openscad.bin, args, { cwd: path.dirname(modelPath), windowsHide: true, env: fontEnv });
      nativeRenderChildren.add(child);
      child.once('close', () => nativeRenderChildren.delete(child));
      // Background card/thumbnail work should yield immediately to interactive
      // renders while still using otherwise-idle CPU time.
      if (extra.background && Number.isInteger(child.pid)) {
        try { os.setPriority(child.pid, 5); } catch {}
      }
      let stderr = '';
      let settled = false;
      let timeout = null;
      const cleanup = () => {
        if (timeout) clearTimeout(timeout);
        signal?.removeEventListener('abort', onAbort);
      };
      const settle = (callback, value) => {
        if (settled) return;
        settled = true;
        cleanup();
        callback(value);
      };
      const onAbort = () => {
        child.kill('SIGTERM');
        settle(reject, abortError());
      };
      signal?.addEventListener('abort', onAbort, { once: true });
      timeout = setTimeout(() => {
        child.kill('SIGTERM');
        settle(reject, new Error(`OpenSCAD rendering timed out after ${Math.round(OPENSCAD_RENDER_TIMEOUT_MS / 1000)} seconds. Reduce model complexity and try again.`));
      }, OPENSCAD_RENDER_TIMEOUT_MS);
      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
        if (stderr.length > 30000) stderr = stderr.slice(-30000);
      });
      child.once('error', (error) => {
        settle(reject, error);
      });
      child.once('exit', (code) => {
        if (settled) return;
        const message = stderr.trim() || `OpenSCAD exited with code ${code}.`;
        const emptyGeometry = /top level object is empty|no top level geometry|nothing to render/i.test(message);
        if (message.includes('textmetrics')) {
          settle(reject, new Error('This SCAD requires an OpenSCAD build with textmetrics enabled. Set OPENSCAD_BIN to the development/nightly OpenSCAD executable you use for this model.'));
        } else if (dependencyFiles && /(?:can(?:not|'t)|could not) (?:open|find)|unable to (?:open|load)/i.test(message)) {
          settle(reject, new Error(message));
        } else if (extra.allowEmpty && emptyGeometry && !/\bERROR\b|(?:can(?:not|'t)|could not) (?:open|find)|unable to (?:open|load)/i.test(message)) {
          settle(resolve);
        } else if (code === 0 && !/\bERROR\b/i.test(message)) {
          settle(resolve);
        } else {
          settle(reject, Object.assign(new Error(message), {code:'RENDER_INPUT_ERROR'}));
        }
      });
    });
    if (signal?.aborted) throw abortError();
    try {
      const data = await fs.readFile(outPath);
      if (cacheToken === diskRenderCache.token(owner) && selfContained && await nativeFontsUnchanged()) {
        cacheRender(cacheKey, data);
        void diskRenderCache.put(owner, cacheKey, data, cacheToken).catch(() => {});
      }
      return data;
    } catch (error) {
      if (extra.allowEmpty && error?.code === 'ENOENT') {
        const empty = Buffer.alloc(0);
        if (cacheToken === diskRenderCache.token(owner) && selfContained && await nativeFontsUnchanged()) {
          cacheRender(cacheKey, empty);
          void diskRenderCache.put(owner, cacheKey, empty, cacheToken).catch(() => {});
        }
        return empty;
      }
      throw error;
    }
  } catch (error) {
    const empty = /top level object is empty|no top level geometry|nothing to render/i.test(error.message || '') && !/\bERROR\b/i.test(error.message || '');
    if (error.code === 'RENDER_INPUT_ERROR' || empty) {
      const file = safeScadName(extra.sourceName || path.basename(metadata.modelPath || 'model.scad'));
      const object = extra.objectId === undefined ? '' : ` · ${objects.find(item=>item.id===Number(extra.objectId))?.label || `Design ${extra.objectId}`}`;
      error.message = `${file}${object}: ${empty ? 'No printable geometry was produced with these settings. Check that the selected design is enabled and its parameters create a solid.' : error.message}`;
      error.code = 'RENDER_INPUT_ERROR';
    }
    throw error;
  } finally {
    release();
    if (tempDir) await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
  }, signal);
}

const workspacePreviewJobs = new Map();

function safePreviewFilePath(filename) {
  if (!/^[0-9a-f-]{36}-[0-9a-f]{16}\.(?:webp|png)$/i.test(String(filename || ''))) return null;
  const filePath = path.resolve(WORKSPACE_PREVIEW_DIR, filename);
  return filePath.startsWith(WORKSPACE_PREVIEW_DIR + path.sep) ? filePath : null;
}

async function generateWorkspacePreview(userId, workspaceId) {
  const row = sql.workspaceById.get(userId, workspaceId);
  if (!row || row.preview_status !== 'generating') return;
  const scadHash = String(row.scad_hash || '');
  const accent = accountSettingsFromRow(sql.userById.get(userId)).appearance.accent;
  const imageHash = createHash('sha256').update(`${scadHash}:${accent}`).digest('hex');
  const oldPreviewPath = safePreviewFilePath(row.preview_path);
  let generatedPath = null;
  try {
    const { data } = sanitizeWorkspaceData(JSON.parse(row.data_json));
    const plates = Array.isArray(data.plates) ? data.plates : [];
    if (!plates.length) {
      const finished = sql.finishEmptyPreview.run(userId, workspaceId, scadHash);
      if (finished.changes && oldPreviewPath) await fs.rm(oldPreviewPath, { force: true }).catch(() => {});
      return;
    }
    const png = await renderWorkspacePreview(data, {
      accent, metadata: source => modelInfoFromSource(source),
      render: (values, format, extra) => renderModel(values, format, { ...extra, owner: `user:${userId}` })
    });
    // An accent changed during rendering must not publish the previous color.
    if (accountSettingsFromRow(sql.userById.get(userId)).appearance.accent !== accent) return;
    const filename = `${workspaceId}-${imageHash.slice(0, 16)}.png`;
    generatedPath = safePreviewFilePath(filename);
    if (!generatedPath) throw new Error('Preview filename was invalid.');
    await fs.writeFile(generatedPath, png, { mode: 0o600 });
    await fs.chmod(generatedPath, 0o600);
    if (accountSettingsFromRow(sql.userById.get(userId)).appearance.accent !== accent) {
      await fs.rm(generatedPath, { force: true }).catch(() => {});
      generatedPath = null;
      return;
    }
    const finished = sql.finishPreview.run(scadHash, filename, userId, workspaceId, scadHash);
    if (!finished.changes) {
      await fs.rm(generatedPath, { force: true }).catch(() => {});
      generatedPath = null;
      return;
    }
    if (oldPreviewPath && oldPreviewPath !== generatedPath) await fs.rm(oldPreviewPath, { force: true }).catch(() => {});
  } catch (error) {
    if (generatedPath) await fs.rm(generatedPath, { force: true }).catch(() => {});
    const detail = String(error?.message || 'Preview generation failed.').replace(/\s+/g, ' ').slice(0, 240);
    console.error(`Workspace preview failed for ${workspaceId}: ${detail}`);
    if (accountSettingsFromRow(sql.userById.get(userId)).appearance.accent === accent) {
      sql.failPreview.run(detail, userId, workspaceId, scadHash);
    }
  }
}

function scheduleWorkspacePreview(userId, workspaceIdInput) {
  const workspaceId = validateWorkspaceId(workspaceIdInput);
  const row = sql.workspaceById.get(userId, workspaceId);
  if (!row) throw workspaceNotFound();
  if (row.preview_status === 'ready' && row.preview_hash === row.scad_hash) return workspaceSummary(row);
  const key = `${userId}:${workspaceId}`;
  if (!workspacePreviewJobs.has(key)) {
    sql.markPreviewGenerating.run(userId, workspaceId);
    const job = generateWorkspacePreview(userId, workspaceId)
      .catch(() => {})
      .finally(() => workspacePreviewJobs.delete(key));
    workspacePreviewJobs.set(key, job);
  }
  return workspaceSummary(sql.workspaceById.get(userId, workspaceId));
}

async function serveWorkspacePreview(res, userId, workspaceIdInput) {
  const workspaceId = validateWorkspaceId(workspaceIdInput);
  const row = sql.workspaceById.get(userId, workspaceId);
  const filePath = row ? safePreviewFilePath(row.preview_path) : null;
  if (!row || !filePath) return sendJson(res, 404, { error: 'Preview is not available.' });
  try {
    const data = await fs.readFile(filePath);
    res.writeHead(200, {
      'Content-Type': filePath.endsWith('.png') ? 'image/png' : 'image/webp',
      'Content-Length': data.length,
      'Cache-Control': 'private, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Vary': 'Cookie'
    });
    return res.end(data);
  } catch {
    return sendJson(res, 404, { error: 'Preview is not available.' });
  }
}

async function serveStatic(req, res, pathname) {
  const requested = pathname;
  const filePath = path.resolve(PUBLIC_DIR, `.${requested}`);
  if (!filePath.startsWith(PUBLIC_DIR + path.sep) && filePath !== path.join(PUBLIC_DIR, 'index.html')) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) throw new Error('not file');
    const extension = path.extname(filePath);
    const compressed = ['.js', '.mjs', '.css', '.html', '.json', '.svg'].includes(extension) && stat.size > 1024 && acceptsGzip(req);
    const etag = `W/"${stat.size}-${stat.mtimeMs}-${compressed ? 'gzip' : 'raw'}"`;
    const versionedAsset = extension !== '.html' && /[?&]v=[A-Za-z0-9._-]+(?:&|$)/.test(String(req.url || ''));
    const headers = {
      'Content-Type': MIME[extension] || 'application/octet-stream',
      'Cache-Control': extension === '.html' ? 'no-store' : (versionedAsset ? 'private, max-age=31536000, immutable' : 'private, max-age=3600'),
      'Vary': 'Cookie, Accept-Encoding', 'ETag': etag,
      ...(compressed ? { 'Content-Encoding': 'gzip' } : {})
    };
    if (extension !== '.html' && String(req.headers['if-none-match'] || '').split(',').map((tag) => tag.trim()).includes(etag)) {
      res.writeHead(304, headers);
      return res.end();
    }
    let data;
    if (compressed) {
      const key = `${filePath}:${etag}`;
      if (!staticCache.has(key)) {
        staticCache.set(key, fs.readFile(filePath).then((raw) => gzipAsync(raw, { level: 6 })).catch((error) => { staticCache.delete(key); throw error; }));
        if (staticCache.size > 64) staticCache.delete(staticCache.keys().next().value);
      }
      data = await staticCache.get(key);
    } else data = await fs.readFile(filePath);
    res.writeHead(200, { ...headers, 'Content-Length': data.length });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

async function serveAccountPage(req, res, pathname, session, { settingsOnly = false } = {}) {
  const appearance = session.settings.appearance;
  const filePath = path.join(PUBLIC_DIR, pathname);
  let html = await fs.readFile(filePath, 'utf8');
  const theme = appearance.theme === 'system' ? '' : ` data-theme="${appearance.theme}"`;
  html = html.replace(
    '<html lang="en">',
    `<html lang="en"${theme} data-theme-preference="${appearance.theme}" data-reduce-motion="${appearance.reduceAnimations}" data-density="${appearance.density}" style="--accent:${appearance.accent}">`
  );
  if (settingsOnly) {
    html = html
      .replace('<title>Workspace · Liqu3D</title>', '<title>Settings · Liqu3D</title>')
      .replace('<body>', '<body class="settings-only settings-open">');
  }
  let data = Buffer.from(html);
  if (data.length > 1024 && acceptsGzip(req)) {
    data = await gzipAsync(data, { level: 4 });
    res.setHeader('Content-Encoding', 'gzip');
  }
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': data.length,
    'Cache-Control': 'no-store',
    'Vary': 'Cookie, Accept-Encoding'
  });
  res.end(data);
}

function sendRedirect(res, location) {
  res.writeHead(302, { Location: location, 'Cache-Control': 'no-store', Vary: 'Cookie' });
  res.end();
}

function renderAbortSignal(req, res) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  req.once('aborted', abort);
  res.once('close', () => {
    if (!res.writableEnded) abort();
  });
  return controller.signal;
}

// A single internal owner keeps existing workspace foreign keys and preferences compatible.
const localIdentity = 'local@liqu3d.invalid';
authDb.prepare(`INSERT OR IGNORE INTO users (email, display_name, password_salt, password_hash, email_verified_at, two_factor_enabled, settings_json, created_at) VALUES (?, 'On this device', ?, ?, ?, 0, ?, ?)`)
  .run(localIdentity, randomBytes(32).toString('hex'), randomBytes(64).toString('hex'), Date.now(), JSON.stringify(DEFAULT_ACCOUNT_SETTINGS), Date.now());
const localUserId = Number(authDb.prepare('SELECT id FROM users WHERE email=?').get(localIdentity).id);
const server = http.createServer({
  requestTimeout: 130_000,
  headersTimeout: 10_000,
  keepAliveTimeout: 5_000,
  connectionsCheckingInterval: 1_000,
  maxHeaderSize: 16 * 1024
}, async (req, res) => {
  setSecurityHeaders(res);
  try {
    if (String(req.url || '').length > 4096) {
      res.writeHead(414);
      return res.end('URI too long');
    }
    const url = new URL(req.url, 'http://localhost');
    if (req.method === 'GET' && url.pathname === '/healthz') {
      const healthHost = normalizedHostname(req.headers.host);
      if (!isLoopbackHost(healthHost) && healthHost !== 'app') {
        res.writeHead(404);
        return res.end();
      }
      const renderer = await findOpenSCAD();
      if (!renderer) return sendJson(res, 503, { ok: false, renderer: false });
      return sendJson(res, 200, { ok: true, renderer: true, openscadVersion: renderer.version || null, manifold: Boolean(renderer.manifoldBackend) });
    }
    if (!proxyRequestAllowed(req)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Cloudflare Tunnel required');
    }
    if (DESKTOP_TOKEN && req.headers['x-liqu3d-desktop'] !== DESKTOP_TOKEN) return sendJson(res, 403, { error: 'Open this project in Liqu3D Local.' });
    const address = clientAddress(req);
    const generalRate = rateAllowed('general', address, GENERAL_RATE_LIMIT, 5 * 60_000);
    if (!generalRate.allowed) return sendRateLimited(res, generalRate.retryAfter);
    if (!requestHostAllowed(req)) {
      res.writeHead(421, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Misdirected request');
    }
    if (!requestOriginAllowed(req)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Origin not allowed');
    }
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && !String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
      res.writeHead(415, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Content-Type must be application/json');
    }
    const bambuHandoff=url.pathname.match(/^\/api\/bambu-handoff\/([A-Za-z0-9_-]{43})\/([^/]+)$/);
    if(bambuHandoff&&['GET','HEAD'].includes(req.method)) {
      let filename;try{filename=decodeURIComponent(bambuHandoff[2]);}catch{return sendJson(res,404,{error:'Export link expired or not found.'});}
      const file=bambuHandoffs.get(bambuHandoff[1],filename);
      if(!file)return sendJson(res,404,{error:'Export link expired or not found.'});
      res.writeHead(200,{'Content-Type':'model/3mf','Content-Length':file.bytes.length,'Cache-Control':'no-store',
        'Content-Disposition':`attachment; filename="${file.name.replace(/[^A-Za-z0-9._ -]/g,'_')}"`});
      return res.end(req.method==='HEAD'?undefined:file.bytes);
    }
    const session = requestSession(req);

    if (req.method === 'GET' && url.pathname === '/api/auth/session') {
      res.setHeader('Vary', 'Cookie');
      return sendJson(res, 200, session
        ? { authenticated: true, user: { email: session.email, displayName: session.displayName, preferences: session.settings } }
        : { authenticated: false, user: null });
    }

    if (url.pathname.startsWith('/api/auth/') || ['/api/account/profile','/api/account/password','/api/account/2fa','/api/account/sessions','/api/account/sessions/revoke','/api/account/sessions/revoke-others','/api/account/data/delete','/api/account'].includes(url.pathname) || url.pathname.startsWith('/api/public/') || url.pathname.startsWith('/api/webhooks/') || url.pathname.startsWith('/configure')) {
      return sendJson(res, 404, { error: 'This feature is not used in the local app.' });
    }
    if (req.method === 'GET' && ['/', '/login', '/signup', '/welcome.html'].includes(url.pathname)) {
      const workspace = sql.listWorkspaces.all(localUserId)[0] || createWorkspace(localUserId, 'Untitled workspace');
      return sendRedirect(res, workspace.kind === 'instant' ? `/instant?id=${workspace.id}` : `/app?workspace=${workspace.id}`);
    }

    if (req.method === 'GET' && ['/welcome.css', '/welcome.js', '/welcome-scene.js', '/welcome-tag-geometry.js', '/vendor/three/three.module.js', '/vendor/three/three.core.js', '/scad-maker-mark.svg', '/favicon.svg', '/favicon.ico', '/apple-touch-icon.png', '/scad-maker-tab.png', '/scad-maker-tab-large.png', '/scad-maker-tab-tall.png', '/scad-maker-tab-24x28.png', '/scad-maker-tab-20x24.png', '/scad-maker-tab-20x28.png', '/scad-maker-touch.png'].includes(url.pathname)) {
      return serveStatic(req, res, url.pathname);
    }

    if (req.method === 'GET' && url.pathname === '/configure') return serveStatic(req, res, '/configure.html');
    if (req.method === 'GET' && ['/configure.css', '/configure.js'].includes(url.pathname)) return serveStatic(req, res, url.pathname);

    if (req.method === 'POST' && url.pathname === '/api/public/configurator') {
      const publicRate = rateAllowed('public-configurator', address, 120, 10 * 60_000);
      if (!publicRate.allowed) return sendRateLimited(res, publicRate.retryAfter);
      const body = await readJson(req);
      const token = String(body.token || '');
      if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return sendJson(res, 404, { error: 'Configurator link is invalid or expired.' });
      const row = sql.configuratorByToken.get(sessionTokenHash(token), Date.now());
      if (!row) return sendJson(res, 404, { error: 'Configurator link is invalid or expired.' });
      const binding = variants.linkBody(row.id);
      const snapshot = binding.skuId ? variants.resolve(row.user_id, row.sku_id, binding).workspaceSnapshot : safeJsonParse(row.workspace_snapshot_json, {});
      const allowed = safeJsonParse(row.allowed_params_json, []);
      const allowedSet = new Set(allowed.map(String));
      const parameters = snapshotParameterCatalog(snapshot).filter((item) => !allowedSet.size || allowedSet.has(item.name)).map((item) => ({ ...item, value: item.value }));
      return sendJson(res, 200, { name: row.name, skuCode: row.sku_code, skuName: row.sku_name, parameters });
    }

    if (req.method === 'POST' && url.pathname === '/api/public/configurator/jobs') {
      const publicRate = rateAllowed('public-configurator-submit', address, 30, 60 * 60_000);
      if (!publicRate.allowed) return sendRateLimited(res, publicRate.retryAfter);
      const body = await readJson(req);
      const token = String(body.token || '');
      if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return sendJson(res, 404, { error: 'Configurator link is invalid or expired.' });
      const row = sql.configuratorByToken.get(sessionTokenHash(token), Date.now());
      if (!row) return sendJson(res, 404, { error: 'Configurator link is invalid or expired.' });
      const sku = sql.skuById.get(row.user_id, row.sku_id);
      if (!sku) return sendJson(res, 410, { error: 'This product is no longer available.' });
      const job = await createProductionJobFromSku(row.user_id, sku, { ...body, variantId: null, variantRevision: null, skuRevision: null, ...variants.linkBody(row.id) }, { publicRequest: true, allowedParams: safeJsonParse(row.allowed_params_json, []) });
      return sendJson(res, 201, { jobId: job.id, status: job.status, skuCode: job.skuCode });
    }

    if (req.method === 'POST' && url.pathname === '/api/webhooks/order') {
      const publicRate = rateAllowed('order-webhook', address, 240, 10 * 60_000);
      if (!publicRate.allowed) return sendRateLimited(res, publicRate.retryAfter);
      const body = await readJson(req);
      const bearer = String(req.headers.authorization || '').match(/^Bearer\s+([A-Za-z0-9_-]{43})$/i)?.[1];
      const token = bearer || String(body.token || '');
      if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return sendJson(res, 401, { error: 'Invalid webhook token.' });
      const hook = sql.webhookByToken.get(sessionTokenHash(token));
      if (!hook) return sendJson(res, 401, { error: 'Invalid webhook token.' });
      const sku = sql.skuByCode.get(hook.user_id, cleanSkuCode(body.skuCode));
      if (!sku) return sendJson(res, 404, { error: 'SKU not found.' });
      const job = await createProductionJobFromSku(hook.user_id, sku, body, { publicRequest: true });
      return sendJson(res, 201, { jobId: job.id, status: job.status });
    }

    if (!session) {
      if (req.method === 'GET' && ['/app', '/app/', '/index.html', '/projects', '/projects/', '/projects.html', '/instant'].includes(url.pathname)) {
        return sendRedirect(res, '/login');
      }
      return sendJson(res, 401, { error: 'Sign in to continue.' });
    }
    await expireTemporaryWorkspaces();

    if (req.method === 'GET' && url.pathname === '/api/account/settings') {
      const user = sql.userById.get(session.userId);
      const preferences = accountSettingsFromRow(user);
      return sendJson(res, 200, {
        displayName: String(user.display_name || ''),
        email: String(user.email),
        twoFactor: { method: 'email', enabled: Boolean(user.two_factor_enabled) },
        emailDelivery: resendClient ? 'resend' : (emailTransport ? 'smtp' : 'unconfigured'),
        preferences,
        lastSavedAt: Number(sql.workspaceById.get(session.userId, workspaceIdFromReferer(req))?.updated_at || 0) || null,
        activeSessions: Number(sql.countUserSessions.get(session.userId, Date.now()).count),
        storage: { usedBytes: accountStorageBytes(session.userId), limitBytes: MAX_ACCOUNT_STORAGE_BYTES }
      });
    }

    if (req.method === 'PATCH' && url.pathname === '/api/account/profile') {
      const body = await readJson(req);
      const user = sql.userById.get(session.userId);
      const displayName = sanitizeDisplayName(body.displayName);
      const email = normalizeEmail(body.email || user.email);
      sql.updateDisplayName.run(displayName, session.userId);
      if (email !== String(user.email).toLowerCase()) {
        if (!await reauthenticateUser(session.userId, body.password)) return sendJson(res, 401, { error: 'Enter your current password to change the email address.' });
        try {
          const pending = await beginEmailChangeChallenge(session.userId, email);
          return sendJson(res, 202, { displayName, currentEmail: String(user.email), ...pending });
        } catch (error) {
          if (error?.code === 'EMAIL_IN_USE') return sendJson(res, 409, { error: error.message });
          if (error?.code === 'EMAIL_DELIVERY_FAILED') return sendJson(res, 503, { error: error.message });
          throw error;
        }
      }
      return sendJson(res, 200, { displayName, email: String(user.email) });
    }

    if (req.method === 'POST' && url.pathname === '/api/account/verify-email-change') {
      const body = await readJson(req);
      try {
        const changed = verifyEmailChangeChallenge(session.userId, body.challenge, body.code);
        if (!changed) return sendJson(res, 401, { error: 'That verification code is invalid or expired.' });
        const revoked = sql.revokeOtherSessions.run(session.userId, session.tokenHash);
        return sendJson(res, 200, { changed: true, email: changed.email, revoked: Number(revoked.changes) });
      } catch (error) {
        if (error?.code === 'EMAIL_IN_USE') return sendJson(res, 409, { error: error.message });
        throw error;
      }
    }

    if (req.method === 'POST' && url.pathname === '/api/account/password') {
      const body = await readJson(req);
      if (!await reauthenticateUser(session.userId, body.currentPassword)) return sendJson(res, 401, { error: 'Current password is incorrect.' });
      const nextPassword = validateNewPassword(body.newPassword);
      const salt = randomBytes(16);
      const hash = await derivePassword(nextPassword, salt, PASSWORD_VERSION);
      sql.updatePasswordHash.run(salt.toString('base64'), hash.toString('base64'), PASSWORD_VERSION, session.userId);
      const revoked = sql.revokeOtherSessions.run(session.userId, session.tokenHash);
      return sendJson(res, 200, { changed: true, revoked: Number(revoked.changes) });
    }

    if (req.method === 'POST' && url.pathname === '/api/account/2fa') {
      const body = await readJson(req);
      if (!await reauthenticateUser(session.userId, body.password)) return sendJson(res, 401, { error: 'Current password is incorrect.' });
      const enabled = body.enabled === true;
      if (enabled && !resendClient && !emailTransport) return sendJson(res, 503, { error: 'Email delivery must be configured before two-factor authentication can be enabled.' });
      sql.updateTwoFactor.run(enabled ? 1 : 0, session.userId);
      return sendJson(res, 200, { enabled });
    }

    if (req.method === 'PATCH' && url.pathname === '/api/account/preferences') {
      const body = await readJson(req);
      const preferences = sanitizeAccountSettings(body);
      sql.updateUserSettings.run(JSON.stringify(preferences), session.userId);
      if (preferences.appearance.accent !== session.settings.appearance.accent) {
        sql.invalidateAccentPreviews.run(session.userId);
      }
      return sendJson(res, 200, { preferences });
    }

    if (req.method === 'GET' && url.pathname === '/api/account/sessions') {
      const sessions = sql.listUserSessions.all(session.userId, Date.now()).map((row) => ({
        id: String(row.token_hash),
        ...describeUserAgent(row.user_agent),
        userAgent: String(row.user_agent || ''),
        ipAddress: String(row.ip_address || 'Unavailable'),
        location: String(row.location || 'Unavailable'),
        firstSignedIn: Number(row.created_at),
        lastActive: Number(row.last_active_at || row.created_at),
        expiresAt: Number(row.expires_at),
        current: String(row.token_hash) === session.tokenHash
      }));
      return sendJson(res, 200, { sessions });
    }

    if (req.method === 'POST' && url.pathname === '/api/account/sessions/revoke') {
      const body = await readJson(req);
      if (!await reauthenticateUser(session.userId, body.password)) return sendJson(res, 401, { error: 'Current password is incorrect.' });
      const tokenHash = /^[0-9a-f]{64}$/i.test(String(body.id || '')) ? String(body.id) : '';
      if (!tokenHash || tokenHash === session.tokenHash) return sendJson(res, 400, { error: 'Choose another active session.' });
      const result = sql.deleteUserSession.run(session.userId, tokenHash);
      return sendJson(res, 200, { revoked: Number(result.changes) });
    }

    if (req.method === 'POST' && url.pathname === '/api/account/sessions/revoke-others') {
      const body = await readJson(req);
      if (!await reauthenticateUser(session.userId, body.password)) return sendJson(res, 401, { error: 'Current password is incorrect.' });
      const result = sql.revokeOtherSessions.run(session.userId, session.tokenHash);
      return sendJson(res, 200, { revoked: Number(result.changes) });
    }

    if (req.method === 'GET' && url.pathname === '/api/account/recent') {
      return sendJson(res, 200, { recent: sql.listRecentWorkspaces.all(session.userId).map((row) => ({ id: String(row.id), name: String(row.name), scadCount: Number(row.scad_count) || 0, lastOpenedAt: Number(row.last_opened_at) })) });
    }

    if (req.method === 'POST' && url.pathname === '/api/account/recent/clear') {
      const body = await readJson(req);
      if (body.confirm !== true) return sendJson(res, 400, { error: 'Confirmation is required.' });
      const result = sql.clearRecentWorkspaces.run(session.userId);
      return sendJson(res, 200, { cleared: Number(result.changes) });
    }

    if (req.method === 'POST' && url.pathname === '/api/account/history/clear') {
      const body = await readJson(req);
      if (body.confirm !== true) return sendJson(res, 400, { error: 'Confirmation is required.' });
      const result = sql.clearWorkspaceHistory.run(session.userId);
      const exports = exportHistory.clear(session.userId);
      return sendJson(res, 200, { cleared: Number(result.changes) + Number(exports) });
    }

    if (url.pathname === '/api/account/storage' && ['GET', 'POST'].includes(req.method)) {
      const storage = createAccountStorage(authDb, { deleteWorkspace, variants, exportHistory, badRequest });
      if (req.method === 'POST') {
        try { await storage.remove(session.userId, await readJson(req)); }
        catch (error) { if (error.status) return sendJson(res, error.status, { error: error.message }); throw error; }
      }
      return sendJson(res, 200, { usedBytes: accountStorageBytes(session.userId), limitBytes: MAX_ACCOUNT_STORAGE_BYTES, groups: storage.list(session.userId) });
    }

    if (req.method === 'GET' && url.pathname === '/api/account/export') {
      const user = sql.userById.get(session.userId);
      const workspaces = sql.exportUserWorkspaces.all(session.userId).map((row) => ({ ...row, data: JSON.parse(row.data_json), data_json: undefined }));
      const revisions = sql.exportUserRevisions.all(session.userId).map((row) => ({ ...row, data: JSON.parse(row.data_json), data_json: undefined }));
      const presets = sql.exportUserProfiles.all(session.userId).map((row) => ({ ...row, profile: safeJsonParse(row.profile_json, {}), profile_json: undefined }));
      const production = {
        variantData: variants.export(session.userId),
        skus: sql.exportProductionSkus.all(session.userId).map((row) => ({ ...row, workspaceSnapshot: safeJsonParse(row.workspace_snapshot_json, {}), printProfile: safeJsonParse(row.print_profile_json, {}), rules: safeJsonParse(row.rules_json, []), bom: safeJsonParse(row.bom_json, []), quote: safeJsonParse(row.quote_json, {}), calibration: safeJsonParse(row.calibration_json, {}), workspace_snapshot_json: undefined, print_profile_json: undefined, rules_json: undefined, bom_json: undefined, quote_json: undefined, calibration_json: undefined })),
        jobs: sql.exportProductionJobs.all(session.userId).map((row) => ({ ...row, parameters: safeJsonParse(row.parameters_json, {}), workspaceSnapshot: safeJsonParse(row.workspace_snapshot_json, {}), printProfile: safeJsonParse(row.print_profile_json, {}), colors: safeJsonParse(row.colors_json, []), materials: safeJsonParse(row.materials_json, []), bom: safeJsonParse(row.bom_json, []), quote: safeJsonParse(row.quote_json, {}), parameters_json: undefined, workspace_snapshot_json: undefined, print_profile_json: undefined, colors_json: undefined, materials_json: undefined, bom_json: undefined, quote_json: undefined })),
        configurators: sql.listConfigurators.all(session.userId).map((row) => ({ id: row.id, name: row.name, skuId: row.sku_id, skuCode: row.sku_code, skuName: row.sku_name, enabled: Boolean(row.enabled), allowedParams: safeJsonParse(row.allowed_params_json, []), createdAt: row.created_at, expiresAt: row.expires_at || null })),
        templates: sql.listTemplates.all(session.userId).map((row) => ({ id: row.id, name: row.name, template: safeJsonParse(row.template_json, {}), createdAt: row.created_at, updatedAt: row.updated_at })),
        components: sql.listComponents.all(session.userId).map((row) => ({ id: row.id, name: row.name, description: row.description || '', source: row.scad_source || '', createdAt: row.created_at, updatedAt: row.updated_at })),
        calibrations: sql.listCalibrations.all(session.userId).map((row) => ({ id: row.id, name: row.name, printer: row.printer, nozzle: Number(row.nozzle), material: row.material, values: safeJsonParse(row.values_json, {}), createdAt: row.created_at, updatedAt: row.updated_at })),
        webhooks: sql.listWebhooks.all(session.userId).map((row) => ({ id: row.id, name: row.name, enabled: Boolean(row.enabled), createdAt: row.created_at }))
      };
      return sendJson(res, 200, {
        exportedAt: Date.now(),
        account: { displayName: String(user.display_name || ''), email: String(user.email), createdAt: Number(user.created_at), twoFactorEnabled: Boolean(user.two_factor_enabled) },
        preferences: accountSettingsFromRow(user), workspaces, revisions, presets, production, instant: instants.export(session.userId), exportHistory:exportHistory.export(session.userId)
      });
    }

    if (req.method === 'POST' && url.pathname === '/api/account/data/delete') {
      const body = await readJson(req);
      if (body.confirm !== true) return sendJson(res, 400, { error: 'Confirmation is required.' });
      if (!await reauthenticateUser(session.userId, body.password)) return sendJson(res, 401, { error: 'Current password is incorrect.' });
      const selected = new Set(Array.isArray(body.selected) ? body.selected.map(String) : []);
      const allowed = new Set(['workspaces', 'history', 'presets', 'production', 'preferences']);
      if (!selected.size || [...selected].some((item) => !allowed.has(item))) return sendJson(res, 400, { error: 'Choose the data to delete.' });
      const removed = {};
      if (selected.has('workspaces')) {
        const previewPaths = sql.previewPathsByUser.all(session.userId).map((row) => String(row.preview_path || '')).filter(Boolean);
        instants.clear(session.userId);
        removed.workspaces = Number(sql.deleteUserWorkspaces.run(session.userId).changes);
        await diskRenderCache.clear(`user:${session.userId}`);
        clearRenderCache();
        for (const previewPath of previewPaths) fs.unlink(previewPath).catch(() => {});
      }
      if (selected.has('history')) removed.history = Number(sql.clearWorkspaceHistory.run(session.userId).changes) + Number(exportHistory.clear(session.userId));
      if (selected.has('presets')) removed.presets = Number(sql.deleteUserProfiles.run(session.userId).changes);
      if (selected.has('production')) {
        variants.clear(session.userId);
        removed.production = {
          jobs: Number(sql.deleteUserProductionJobs.run(session.userId).changes),
          configurators: Number(sql.deleteUserConfigurators.run(session.userId).changes),
          templates: Number(sql.deleteUserTemplates.run(session.userId).changes),
          components: Number(sql.deleteUserComponents.run(session.userId).changes),
          calibrations: Number(sql.deleteUserCalibrations.run(session.userId).changes),
          webhooks: Number(sql.deleteUserWebhooks.run(session.userId).changes),
          skus: Number(sql.deleteUserSkus.run(session.userId).changes)
        };
      }
      if (selected.has('preferences')) {
        sql.updateUserSettings.run(JSON.stringify(DEFAULT_ACCOUNT_SETTINGS), session.userId);
        if (session.settings.appearance.accent !== DEFAULT_ACCOUNT_SETTINGS.appearance.accent) {
          sql.invalidateAccentPreviews.run(session.userId);
        }
        removed.preferences = 1;
      }
      return sendJson(res, 200, { removed });
    }

    if (req.method === 'DELETE' && url.pathname === '/api/account') {
      const body = await readJson(req);
      if (String(body.confirm || '') !== 'DELETE') return sendJson(res, 400, { error: 'Type DELETE to confirm account deletion.' });
      if (!await reauthenticateUser(session.userId, body.password)) return sendJson(res, 401, { error: 'Current password is incorrect.' });
      const previewPaths = sql.previewPathsByUser.all(session.userId).map((row) => String(row.preview_path || '')).filter(Boolean);
      sql.deleteUserLoginChallenges.run(session.userId);
      instants.clear(session.userId);
      sql.deleteUser.run(session.userId);
      await diskRenderCache.clear(`user:${session.userId}`);
      clearRenderCache();
      for (const previewPath of previewPaths) fs.unlink(previewPath).catch(() => {});
      res.setHeader('Set-Cookie', sessionCookie('', 0));
      res.setHeader('Clear-Site-Data', '"cache", "storage"');
      return sendJson(res, 200, { deleted: true });
    }

    if (req.method === 'GET' && url.pathname === '/app/') return sendRedirect(res, '/app');
    if (req.method === 'GET' && url.pathname === '/index.html') return sendRedirect(res, '/app');
    if (req.method === 'GET' && ['/projects/', '/projects.html'].includes(url.pathname)) return sendRedirect(res, '/projects');
    if (req.method === 'GET' && url.pathname === '/app' && !url.searchParams.get('workspace') && url.searchParams.get('settings') !== '1') return sendRedirect(res, '/projects');
    if (req.method === 'POST' && ['/api/render', '/api/render-object', '/api/export'].includes(url.pathname)) {
      const renderRate = rateAllowed('render', session.userId, RENDER_RATE_LIMIT, 10 * 60_000);
      if (!renderRate.allowed) return sendRateLimited(res, renderRate.retryAfter);
    }

    if (req.method === 'GET' && url.pathname === '/api/export-history') {
      const offset=Number(url.searchParams.get('offset')||0);
      if(!Number.isSafeInteger(offset)||offset<0)throw badRequest('Invalid history page.');
      const filter={from:url.searchParams.get('from'),to:url.searchParams.get('to')};
      return sendJson(res,200,{exports:exportHistory.list(session.userId,{...filter,offset,limit:30}),stats:exportHistory.stats(session.userId,filter)});
    }
    if(req.method==='POST'&&url.pathname==='/api/export-history/report') {
      const csv=exportHistory.report(session.userId,await readJson(req));
      res.writeHead(200,{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="export-history-${new Date().toISOString().slice(0,10)}.csv"`,'Cache-Control':'no-store'});
      return res.end(csv);
    }
    if(req.method==='POST'&&url.pathname==='/api/export-history/delete') {
      const body=await readJson(req);return sendJson(res,200,exportHistory.removeMany(session.userId,body.ids));
    }
    const exportHistoryRoute=url.pathname.match(/^\/api\/export-history\/([0-9a-f-]{36})(?:\/(preview|again))?$/i);
    if(exportHistoryRoute&&!exportHistoryRoute[2]&&req.method==='DELETE') {
      try {return sendJson(res,200,exportHistory.remove(session.userId,exportHistoryRoute[1]));}
      catch(error) {if(error.status)return sendJson(res,error.status,{error:error.message});throw error;}
    }
    if(exportHistoryRoute?.[2]==='preview'&&req.method==='GET') {
      const image=exportHistory.preview(session.userId,exportHistoryRoute[1]);
      res.writeHead(200,{'Content-Type':'image/png','Content-Length':image.length,'Cache-Control':'private, max-age=31536000, immutable'});return res.end(image);
    }
    if(req.method==='POST'&&(url.pathname==='/api/export-history'||exportHistoryRoute?.[2]==='again')) {
      const rate=rateAllowed('render',session.userId,RENDER_RATE_LIMIT,10*60_000);
      if(!rate.allowed)return sendRateLimited(res,rate.retryAfter);
      try {
        const result=await exportHistory.perform(session.userId,exportHistoryRoute?null:await readJson(req),{id:exportHistoryRoute?.[1],signal:renderAbortSignal(req,res)});
        const bambu=await openExportInBambu(result,{enabled:session.settings.workspace.instantExport,request:req,
          createHandoff:exported=>bambuHandoffs.create(exported,session.userId),
          allowLocal:isLoopbackHost(HOST)&&!TRUST_PROXY&&(!PUBLIC_ORIGIN||isLoopbackHost(new URL(PUBLIC_ORIGIN).hostname))});
        if(bambu)res.setHeader('X-Bambu-Launch',JSON.stringify(bambu));
        res.writeHead(200,{'Content-Type':result.mimeType||'model/3mf','Content-Length':result.archive.length,'Cache-Control':'no-store',
          'Content-Disposition':`attachment; filename="${result.filename}"`,'X-Export-History-Id':result.summary.id,
          'X-Filament-Estimate':JSON.stringify({...result.estimate,primeTowers:undefined})});
        return res.end(result.archive);
      } catch(error) {return sendJson(res,error.status||422,{error:error.message});}
    }

    if (req.method === 'GET' && url.pathname === '/api/production') {
      const jobs = sql.listJobs.all(session.userId).map((row) => jobRow(row));
      const groups = new Map();
      for (const job of jobs.filter((item) => item.status === 'pending' || item.status === 'generated')) {
        const key = JSON.stringify({ colors: [...job.colors].sort(), materials: [...job.materials].sort() });
        const group = groups.get(key) || { colors: [...job.colors].sort(), materials: [...job.materials].sort(), jobs: [], count: 0 };
        group.jobs.push(job.id); group.count += 1; groups.set(key, group);
      }
      return sendJson(res, 200, {
        jobs,
        variants: variants.list(session.userId),
        skus: sql.listSkus.all(session.userId).map((row) => skuRow(row, { includeParameters: true })),
        configurators: sql.listConfigurators.all(session.userId).map((row) => ({ id: row.id, name: row.name, skuId: row.sku_id, skuCode: row.sku_code, skuName: row.sku_name, enabled: Boolean(row.enabled), allowedParams: safeJsonParse(row.allowed_params_json, []), createdAt: row.created_at, expiresAt: row.expires_at || null })),
        templates: sql.listTemplates.all(session.userId).map((row) => ({ id: row.id, name: row.name, template: safeJsonParse(row.template_json, {}), createdAt: row.created_at, updatedAt: row.updated_at })),
        components: sql.listComponents.all(session.userId).map((row) => ({ id: row.id, name: row.name, description: row.description || '', source: row.scad_source || '', createdAt: row.created_at, updatedAt: row.updated_at })),
        calibrations: sql.listCalibrations.all(session.userId).map((row) => ({ id: row.id, name: row.name, printer: row.printer, nozzle: Number(row.nozzle), material: row.material, values: safeJsonParse(row.values_json, {}), createdAt: row.created_at, updatedAt: row.updated_at })),
        webhooks: sql.listWebhooks.all(session.userId).map((row) => ({ id: row.id, name: row.name, enabled: Boolean(row.enabled), createdAt: row.created_at })),
        groups: [...groups.values()],
        openscadVersion: await currentOpenScadVersion()
      });
    }

    if (req.method === 'POST' && url.pathname === '/api/production/variants') {
      return sendJson(res, 201, variants.save(session.userId, await readJson(req)));
    }
    const variantRoute = url.pathname.match(/^\/api\/production\/variants\/([0-9a-f-]{36})$/i);
    if (variantRoute && req.method === 'GET') return sendJson(res, 200, variants.getVariant(session.userId, variantRoute[1], url.searchParams.get('revision')));
    if (variantRoute && req.method === 'DELETE') {
      const changed = variants.deleteVariant(session.userId, variantRoute[1]);
      return sendJson(res, changed ? 200 : 404, changed ? { deleted: true } : { error: 'Variant not found.' });
    }
    if (req.method === 'POST' && url.pathname === '/api/production/resolve') {
      const body = await readJson(req);
      return sendJson(res, 200, variants.resolve(session.userId, String(body.skuId), body));
    }

    if (req.method === 'POST' && url.pathname === '/api/production/skus') {
      const body = await readJson(req);
      const code = cleanSkuCode(body.code);
      const name = cleanProductionName(body.name || code, code);
      const workspaceSnapshot = body.workspaceSnapshot && typeof body.workspaceSnapshot === 'object' ? body.workspaceSnapshot : {};
      if (body.objectOnly || workspaceSnapshot.plates?.some(plate => plate.objectBinding)) {
        if (workspaceSnapshot.plates?.length !== 1 || !boundRecord(workspaceSnapshot)) throw badRequest('Select one object to save as a SKU.');
        const plate = workspaceSnapshot.plates[0];
        const binding = plate.objectBinding;
        if (!Array.isArray(binding.memberIds) || binding.memberIds.some(id => !Number.isInteger(id))) throw badRequest('Invalid object members.');
        const defs = detectObjects(String(plate.source || ''), parseScadParameters(String(plate.source || ''))).objects;
        if (binding.selectionKey !== 'model') {
          const members = defs.filter(def => `group:${def.mergeKey || `object_${def.id}`}` === binding.selectionKey).map(def => Number(def.id)).sort((a,b) => a-b);
          if (!members.length || JSON.stringify(members) !== JSON.stringify([...(binding.memberIds || [])].sort((a,b) => a-b))) throw badRequest('The selected object does not match its SCAD source.');
        } else if (defs.length) throw badRequest('Select a logical object from this source.');
        if (plate.batchInstances?.length || Object.keys(plate.objectRecords).some(key => key !== binding.selectionKey)) throw badRequest('A SKU must contain only its selected object.');
      }
      if (!Array.isArray(workspaceSnapshot.plates) || !workspaceSnapshot.plates.length) throw badRequest('A SKU needs at least one SCAD source.');
      const profile = sanitizeProfile(body.printProfile);
      const rules = Array.isArray(body.rules) ? body.rules.slice(0, 200) : (Array.isArray(workspaceSnapshot.productionRules) ? workspaceSnapshot.productionRules.slice(0, 200) : []);
      const bom = [];
      const quote = {};
      const calibration = body.calibration && typeof body.calibration === 'object' && !Array.isArray(body.calibration) ? body.calibration : {};
      const encodedSnapshot = JSON.stringify(workspaceSnapshot);
      if (Buffer.byteLength(encodedSnapshot) > MAX_WORKSPACE_BYTES) throw badRequest('SKU snapshot is too large.');
      const encodedProfile = JSON.stringify(profile);
      const encodedRules = JSON.stringify(rules);
      const encodedBom = JSON.stringify(bom);
      const encodedQuote = JSON.stringify(quote);
      const encodedCalibration = JSON.stringify(calibration);
      const now = Date.now();
      const existing = sql.skuByCode.get(session.userId, code);
      enforceAccountStorage(session.userId, jsonStorageBytes(encodedSnapshot, encodedProfile, encodedRules, encodedBom, encodedQuote, encodedCalibration) * 2 + 4096, skuStorageBytes(existing));
      const id = existing?.id || randomUUID();
      const createdAt = existing?.created_at || now;
      const version = await currentOpenScadVersion();
      const workspaceHash = createHash('sha256').update(encodedSnapshot).digest('hex');
      variants.archive(existing);
      sql.upsertSku.run(id, session.userId, code, name, String(body.workspaceId || '').slice(0, 80) || null, encodedSnapshot, encodedProfile, version, workspaceHash, encodedRules, encodedBom, encodedQuote, encodedCalibration, Number(existing?.revision || 1), createdAt, now);
      variants.archive(sql.skuById.get(session.userId, id));
      return sendJson(res, existing ? 200 : 201, skuRow(sql.skuById.get(session.userId, id), { includeSnapshot: true }));
    }

    const skuRoute = url.pathname.match(/^\/api\/production\/skus\/([0-9a-f-]{36})$/i);
    if (skuRoute && req.method === 'GET') {
      const row = sql.skuById.get(session.userId, skuRoute[1]);
      if (!row) return sendJson(res, 404, { error: 'SKU not found.' });
      const result = skuRow(row, { includeSnapshot: true });
      result.runtimeVersion = await currentOpenScadVersion();
      result.versionMatch = !result.openscadVersion || !result.runtimeVersion || result.openscadVersion === result.runtimeVersion;
      return sendJson(res, 200, result);
    }
    if (skuRoute && req.method === 'DELETE') {
      const changed = variants.deleteSku(session.userId, skuRoute[1]);
      return sendJson(res, changed ? 200 : 404, changed ? { deleted: true } : { error: 'SKU not found.' });
    }

    if (req.method === 'POST' && url.pathname === '/api/production/jobs') {
      const body = await readJson(req);
      const sku = body.skuId ? sql.skuById.get(session.userId, String(body.skuId)) : sql.skuByCode.get(session.userId, cleanSkuCode(body.skuCode));
      if (!sku) return sendJson(res, 404, { error: 'SKU not found.' });
      const runtimeVersion = await currentOpenScadVersion();
      if (!body.variantId && !body.skuRevision && sku.openscad_version && runtimeVersion && sku.openscad_version !== runtimeVersion && body.allowVersionMismatch !== true) {
        return sendJson(res, 409, { error: `SKU is locked to OpenSCAD ${sku.openscad_version}; this server is running ${runtimeVersion}.`, code: 'OPENSCAD_VERSION_MISMATCH' });
      }
      const job = await createProductionJobFromSku(session.userId, sku, body);
      return sendJson(res, 201, job);
    }

    if (req.method === 'POST' && url.pathname === '/api/production/jobs/batch') {
      const body = await readJson(req);
      const sku = body.skuId ? sql.skuById.get(session.userId, String(body.skuId)) : sql.skuByCode.get(session.userId, cleanSkuCode(body.skuCode));
      if (!sku) return sendJson(res, 404, { error: 'SKU not found.' });
      const rows = Array.isArray(body.rows) ? body.rows.slice(0, 500) : [];
      if (!rows.length) throw badRequest('CSV batch contains no rows.');
      const created = [];
      const failures = [];
      for (let index = 0; index < rows.length; index += 1) {
        try { created.push(await createProductionJobFromSku(session.userId, sku, rows[index] || {})); }
        catch (error) { failures.push({ row: index + 1, error: error.message }); }
      }
      return sendJson(res, 200, { created, failures });
    }

    const jobRoute = url.pathname.match(/^\/api\/production\/jobs\/([0-9a-f-]{36})$/i);
    if (jobRoute && req.method === 'GET') {
      const row = sql.jobById.get(session.userId, jobRoute[1]);
      if (!row) return sendJson(res, 404, { error: 'Production job not found.' });
      const result = jobRow(row, { includeSnapshot: true });
      result.runtimeOpenScadVersion = await currentOpenScadVersion();
      result.versionMatch = !result.openscadVersion || !result.runtimeOpenScadVersion || result.openscadVersion === result.runtimeOpenScadVersion;
      return sendJson(res, 200, result);
    }
    if (jobRoute && req.method === 'PATCH') {
      const body = await readJson(req);
      const status = ['pending','generated','failed','downloaded'].includes(body.status) ? body.status : null;
      if (!status) throw badRequest('Invalid production job status.');
      const now = Date.now();
      const changed = Number(sql.updateJobStatus.run(status, String(body.outputName || '').slice(0, 200), String(body.error || '').slice(0, 1000), now, status, now, session.userId, jobRoute[1]).changes);
      return changed ? sendJson(res, 200, jobRow(sql.jobById.get(session.userId, jobRoute[1]))) : sendJson(res, 404, { error: 'Production job not found.' });
    }
    if (jobRoute && req.method === 'DELETE') {
      const changed = Number(sql.deleteJob.run(session.userId, jobRoute[1]).changes);
      return sendJson(res, changed ? 200 : 404, changed ? { deleted: true } : { error: 'Production job not found.' });
    }

    if (req.method === 'POST' && url.pathname === '/api/production/configurators') {
      const body = await readJson(req);
      const sku = sql.skuById.get(session.userId, String(body.skuId || ''));
      if (!sku) return sendJson(res, 404, { error: 'SKU not found.' });
      const token = randomBytes(32).toString('base64url');
      const id = randomUUID();
      const resolved = body.variantId || body.skuRevision || boundRecord(safeJsonParse(sku.workspace_snapshot_json, {})) ? variants.resolve(session.userId, sku.id, body) : null;
      const snapshot = resolved?.workspaceSnapshot || safeJsonParse(sku.workspace_snapshot_json, {});
      const allNames = snapshotParameterCatalog(snapshot).map((item) => item.name);
      const allowedParams = Array.isArray(body.allowedParams) && body.allowedParams.length ? body.allowedParams.map(String).filter((name) => allNames.includes(name)).slice(0, 200) : allNames;
      const expiresAt = body.expiresAt ? Number(body.expiresAt) : null;
      sql.createConfigurator.run(id, session.userId, sku.id, cleanProductionName(body.name || `${sku.code} configurator`), sessionTokenHash(token), JSON.stringify(allowedParams), Date.now(), Number.isFinite(expiresAt) ? expiresAt : null);
      if (resolved) variants.link(session.userId, id, resolved);
      return sendJson(res, 201, { id, token, url: `/configure#${token}`, allowedParams });
    }
    const configuratorRoute = url.pathname.match(/^\/api\/production\/configurators\/([0-9a-f-]{36})$/i);
    if (configuratorRoute && req.method === 'DELETE') {
      const changed = Number(sql.disableConfigurator.run(session.userId, configuratorRoute[1]).changes);
      return sendJson(res, changed ? 200 : 404, changed ? { disabled: true } : { error: 'Configurator not found.' });
    }

    if (req.method === 'POST' && url.pathname === '/api/production/templates') {
      const body = await readJson(req);
      const id = /^[0-9a-f-]{36}$/i.test(String(body.id || '')) ? String(body.id) : randomUUID();
      const now = Date.now();
      const template = body.template && typeof body.template === 'object' ? body.template : {};
      const encodedTemplate = JSON.stringify(template);
      if (Buffer.byteLength(encodedTemplate) > MAX_WORKSPACE_BYTES) throw badRequest('Production template is too large.');
      const existingTemplate = sql.templateById.get(session.userId, id);
      enforceAccountStorage(session.userId, Buffer.byteLength(encodedTemplate), existingTemplate ? Buffer.byteLength(existingTemplate.template_json) : 0);
      sql.upsertTemplate.run(id, session.userId, cleanProductionName(body.name || 'Production template'), encodedTemplate, existingTemplate?.created_at || now, now);
      return sendJson(res, existingTemplate ? 200 : 201, { id, name: cleanProductionName(body.name || 'Production template'), template });
    }
    const templateRoute = url.pathname.match(/^\/api\/production\/templates\/([0-9a-f-]{36})$/i);
    if (templateRoute && req.method === 'DELETE') {
      const changed = Number(sql.deleteTemplate.run(session.userId, templateRoute[1]).changes);
      return sendJson(res, changed ? 200 : 404, changed ? { deleted: true } : { error: 'Template not found.' });
    }

    if (req.method === 'POST' && url.pathname === '/api/production/components') {
      const body = await readJson(req);
      const source = String(body.source || '').replace(/\r\n?/g, '\n');
      if (!source.trim()) throw badRequest('A reusable component needs OpenSCAD source.');
      if (Buffer.byteLength(source, 'utf8') > 512 * 1024) throw badRequest('Reusable component source is limited to 512 KB.');
      const description = String(body.description || '').normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 500);
      const id = /^[0-9a-f-]{36}$/i.test(String(body.id || '')) ? String(body.id) : randomUUID();
      const now = Date.now();
      const existing = sql.componentById.get(session.userId, id);
      const newBytes = Buffer.byteLength(source) + Buffer.byteLength(description);
      const oldBytes = existing ? Buffer.byteLength(existing.scad_source || '') + Buffer.byteLength(existing.description || '') : 0;
      enforceAccountStorage(session.userId, newBytes, oldBytes);
      const name = cleanProductionName(body.name || 'Reusable SCAD component');
      sql.upsertComponent.run(id, session.userId, name, description, source, existing?.created_at || now, now);
      const saved = sql.componentById.get(session.userId, id);
      return sendJson(res, existing ? 200 : 201, { id: saved.id, name: saved.name, description: saved.description || '', source: saved.scad_source || '', createdAt: saved.created_at, updatedAt: saved.updated_at });
    }
    const componentRoute = url.pathname.match(/^\/api\/production\/components\/([0-9a-f-]{36})$/i);
    if (componentRoute && req.method === 'DELETE') {
      const changed = Number(sql.deleteComponent.run(session.userId, componentRoute[1]).changes);
      return sendJson(res, changed ? 200 : 404, changed ? { deleted: true } : { error: 'Reusable component not found.' });
    }

    if (req.method === 'POST' && url.pathname === '/api/production/calibrations') {
      const body = await readJson(req);
      if (!Object.hasOwn(PRINTERS, body.printer)) throw badRequest('Unknown printer calibration target.');
      const nozzle = Number(body.nozzle);
      if (!SUPPORTED_NOZZLES.includes(nozzle)) throw badRequest('Unsupported calibration nozzle.');
      const id = /^[0-9a-f-]{36}$/i.test(String(body.id || '')) ? String(body.id) : randomUUID();
      const now = Date.now();
      const values = body.values && typeof body.values === 'object' && !Array.isArray(body.values) ? body.values : {};
      const allowed = ['xy_hole_compensation','xy_contour_compensation','elefant_foot_compensation'];
      const cleanValues = Object.fromEntries(Object.entries(values).filter(([key, value]) => allowed.includes(key) && Number.isFinite(Number(value))).map(([key, value]) => [key, Number(value)]));
      const encodedValues = JSON.stringify({ settings: cleanValues });
      const existingCalibration = sql.calibrationById.get(session.userId, id);
      enforceAccountStorage(session.userId, Buffer.byteLength(encodedValues), existingCalibration ? Buffer.byteLength(existingCalibration.values_json) : 0);
      sql.upsertCalibration.run(id, session.userId, cleanProductionName(body.name || 'Calibration'), body.printer, nozzle, String(body.material || 'PLA').slice(0, 40), encodedValues, existingCalibration?.created_at || now, now);
      return sendJson(res, 201, { id, values: { settings: cleanValues } });
    }
    const calibrationRoute = url.pathname.match(/^\/api\/production\/calibrations\/([0-9a-f-]{36})$/i);
    if (calibrationRoute && req.method === 'DELETE') {
      const changed = Number(sql.deleteCalibration.run(session.userId, calibrationRoute[1]).changes);
      return sendJson(res, changed ? 200 : 404, changed ? { deleted: true } : { error: 'Calibration not found.' });
    }

    if (req.method === 'POST' && url.pathname === '/api/production/webhooks') {
      const body = await readJson(req);
      const token = randomBytes(32).toString('base64url');
      const id = randomUUID();
      sql.createWebhook.run(id, session.userId, cleanProductionName(body.name || 'Order webhook'), sessionTokenHash(token), Date.now());
      return sendJson(res, 201, { id, token, endpoint: '/api/webhooks/order' });
    }
    const webhookRoute = url.pathname.match(/^\/api\/production\/webhooks\/([0-9a-f-]{36})$/i);
    if (webhookRoute && req.method === 'DELETE') {
      const changed = Number(sql.disableWebhook.run(session.userId, webhookRoute[1]).changes);
      return sendJson(res, changed ? 200 : 404, changed ? { disabled: true } : { error: 'Webhook not found.' });
    }

    if (req.method === 'POST' && url.pathname === '/api/production/diff') {
      const body = await readJson(req);
      const sku = sql.skuById.get(session.userId, String(body.skuId || ''));
      if (!sku) return sendJson(res, 404, { error: 'SKU not found.' });
      const beforeSnapshot = safeJsonParse(sku.workspace_snapshot_json, {});
      const afterSnapshot = body.workspaceSnapshot && typeof body.workspaceSnapshot === 'object' ? body.workspaceSnapshot : {};
      const beforeParameters = Object.assign({}, ...((beforeSnapshot.plates || []).map((plate) => plate.values || {})));
      const afterParameters = Object.assign({}, ...((afterSnapshot.plates || []).map((plate) => plate.values || {})));
      const keys = [...new Set([...Object.keys(beforeParameters), ...Object.keys(afterParameters)])].sort();
      const parameterChanges = keys.filter((key) => JSON.stringify(beforeParameters[key]) !== JSON.stringify(afterParameters[key])).map((key) => ({ parameter: key, from: beforeParameters[key], to: afterParameters[key] }));
      const beforeProfile = sanitizeProfile(safeJsonParse(sku.print_profile_json, {}));
      const afterProfile = sanitizeProfile(body.printProfile || beforeProfile);
      const printProfileChanges = comparableChanges(beforeProfile, afterProfile, 'profile');
      const sourceChanges = snapshotSourceDiff(beforeSnapshot, afterSnapshot);
      const structureChanges = [];
      const beforePlateCount = snapshotPlateCount(beforeSnapshot);
      const afterPlateCount = snapshotPlateCount(afterSnapshot);
      if (beforePlateCount !== afterPlateCount) structureChanges.push({ path: 'plateCount', from: beforePlateCount, to: afterPlateCount });
      const beforeSourceCount = Array.isArray(beforeSnapshot.plates) ? beforeSnapshot.plates.length : 0;
      const afterSourceCount = Array.isArray(afterSnapshot.plates) ? afterSnapshot.plates.length : 0;
      if (beforeSourceCount !== afterSourceCount) structureChanges.push({ path: 'sourceCount', from: beforeSourceCount, to: afterSourceCount });
      const currentSnapshotHash = createHash('sha256').update(JSON.stringify(afterSnapshot)).digest('hex');
      const productionChanges = [];
      const productionPairs = [
        ['rules', safeJsonParse(sku.rules_json, []), Array.isArray(body.rules) ? body.rules : safeJsonParse(sku.rules_json, [])]
      ];
      for (const [name, left, right] of productionPairs) if (JSON.stringify(left) !== JSON.stringify(right)) productionChanges.push({ path: name, from: left, to: right });
      const runtimeVersion = await currentOpenScadVersion();
      return sendJson(res, 200, {
        skuRevision: Number(sku.revision) || 1,
        skuWorkspaceHash: sku.workspace_hash || '',
        currentWorkspaceHash: currentSnapshotHash,
        workspaceChanged: Boolean(sku.workspace_hash && sku.workspace_hash !== currentSnapshotHash),
        skuOpenScadVersion: sku.openscad_version || '',
        runtimeOpenScadVersion: runtimeVersion,
        versionMatch: !sku.openscad_version || !runtimeVersion || sku.openscad_version === runtimeVersion,
        changes: parameterChanges,
        parameterChanges,
        printProfileChanges,
        sourceChanges,
        structureChanges,
        productionChanges
      });
    }

    if (req.method === 'POST' && url.pathname === '/api/export-profile') {
      const body = await readJson(req);
      try { return sendJson(res, 200, { template: await bambuExportProfile(sanitizeProfile(body.profile)) }); }
      catch (error) { return sendJson(res, 422, { error: `Print settings could not be prepared: ${error.message}` }); }
    }

    if (req.method === 'POST' && url.pathname === '/api/bambu-defaults') {
      const body = await readJson(req);
      try { return sendJson(res, 200, await bambuVendorDefaults(sanitizeProfile(body.profile))); }
      catch (error) { return sendJson(res, 404, { error: error.code === 'ENOENT' ? 'Bambu Studio vendor presets were not found on this server.' : error.message }); }
    }

    if (req.method === 'GET' && url.pathname === '/api/print-profile') {
      return sendJson(res, 200, activePrintProfile(session.userId));
    }

    if (req.method === 'POST' && url.pathname === '/api/print-profile') {
      const body = await readJson(req);
      const saved = saveNamedPrintProfile(session.userId, body.profile);
      return sendJson(res, 200, { ...saved, ...listPrintProfiles(session.userId) });
    }

    if (req.method === 'GET' && url.pathname === '/api/print-profiles') {
      return sendJson(res, 200, listPrintProfiles(session.userId));
    }

    if (req.method === 'POST' && url.pathname === '/api/print-profiles') {
      const body = await readJson(req);
      const saved = saveNamedPrintProfile(session.userId, body.profile);
      return sendJson(res, 200, { ...saved, ...listPrintProfiles(session.userId) });
    }

    if (req.method === 'POST' && url.pathname === '/api/print-profiles/select') {
      const body = await readJson(req);
      const selected = selectNamedPrintProfile(session.userId, body.id);
      return sendJson(res, 200, { ...selected, ...listPrintProfiles(session.userId) });
    }


    if (req.method === 'GET' && url.pathname === '/instant') return serveAccountPage(req, res, 'instant.html', session);
    const instantRoute = url.pathname.match(/^\/api\/instants\/([0-9a-f-]{36})(?:\/(files|runs|cancel|convert|result))?$/i);
    if (instantRoute) {
      try {
      const [, id, action] = instantRoute;
      if (req.method === 'GET' && !action) return sendJson(res, 200, instants.get(session.userId, id));
      if (req.method === 'PUT' && !action) return sendJson(res, 200, instants.save(session.userId, id, await readJson(req)));
      if (req.method === 'POST' && action === 'files') return sendJson(res, 200, await quarantineUpload(await readJson(req), body => instants.files(session.userId, id, body)));
      if (req.method === 'POST' && action === 'runs') return sendJson(res, 202, instants.retry(session.userId, id));
      if (req.method === 'POST' && action === 'cancel') return sendJson(res, 200, instants.cancel(session.userId, id));
      if (req.method === 'POST' && action === 'convert') return sendJson(res, 200, instants.convert(session.userId, id, await readJson(req)));
      if (req.method === 'GET' && action === 'result') {
        const result = await instants.result(session.userId, id, renderAbortSignal(req,res));
        const bambu=await openExportInBambu(result,{enabled:session.settings.workspace.instantExport,request:req,
          createHandoff:exported=>bambuHandoffs.create(exported,session.userId),
          allowLocal:isLoopbackHost(HOST)&&!TRUST_PROXY&&(!PUBLIC_ORIGIN||isLoopbackHost(new URL(PUBLIC_ORIGIN).hostname))});
        if(bambu)res.setHeader('X-Bambu-Launch',JSON.stringify(bambu));
        res.writeHead(200, {'Content-Type':result.mimeType||'model/3mf','Content-Length':result.archive.length,'Content-Disposition':`attachment; filename="${result.filename || `quick-batch-${id}.${result.extension || '3mf'}`}"`,'Cache-Control':'no-store','X-Export-History-Id':result.summary.id,'X-Filament-Estimate':JSON.stringify({...result.estimate,primeTowers:undefined})});
        return res.end(result.archive);
      }
      return sendJson(res, 405, {error:'Unsupported Quick batch action.'});
      } catch (error) { if (!error.code) error.code = 'BAD_REQUEST'; throw error; }
    }

    if (req.method === 'GET' && url.pathname === '/api/workspaces') {
      return sendJson(res, 200, listWorkspaces(session.userId));
    }

    if (req.method === 'POST' && url.pathname === '/api/workspaces') {
      const body = await readJson(req);
      authDb.exec('SAVEPOINT new_library_record');
      try {
        const workspace = createWorkspace(session.userId, body.name || (body.kind === 'instant' ? 'Untitled Quick batch' : undefined));
        if (body.kind === 'instant') { instants.create(session.userId, workspace.id); workspace.kind = 'instant'; }
        if (Object.hasOwn(body,'retention')) throw badRequest('Choose Temporary - 24h when creating a workspace copy from Quick batch.');
        authDb.exec('RELEASE new_library_record');
        return sendJson(res, 201, workspace);
      } catch(error) { authDb.exec('ROLLBACK TO new_library_record; RELEASE new_library_record');throw error; }
    }

    const libraryOptionsRoute=url.pathname.match(/^\/api\/workspaces\/([0-9a-f-]{36})\/library$/i);
    if(libraryOptionsRoute && req.method==='PUT') return sendJson(res,200,updateLibraryOptions(session.userId,libraryOptionsRoute[1],await readJson(req)));

    const workspaceRevisionsRoute = url.pathname.match(/^\/api\/workspaces\/([0-9a-f-]{36})\/revisions$/i);
    if (workspaceRevisionsRoute && req.method === 'GET') {
      return sendJson(res, 200, listWorkspaceRevisions(session.userId, workspaceRevisionsRoute[1]));
    }

    const restoreWorkspaceRevisionRoute = url.pathname.match(/^\/api\/workspaces\/([0-9a-f-]{36})\/revisions\/([0-9a-f-]{36})\/restore$/i);
    if (restoreWorkspaceRevisionRoute && req.method === 'POST') {
      return sendJson(res, 200, restoreWorkspaceRevision(session.userId, restoreWorkspaceRevisionRoute[1], restoreWorkspaceRevisionRoute[2]));
    }

    const workspacePreviewRoute = url.pathname.match(/^\/api\/workspaces\/([0-9a-f-]{36})\/preview$/i);
    if (workspacePreviewRoute && req.method === 'POST') {
      await readJson(req);
      return sendJson(res, 202, scheduleWorkspacePreview(session.userId, workspacePreviewRoute[1]));
    }

    const workspacePreviewFileRoute = url.pathname.match(/^\/api\/workspaces\/([0-9a-f-]{36})\/preview\.webp$/i);
    if (workspacePreviewFileRoute && req.method === 'GET') {
      return serveWorkspacePreview(res, session.userId, workspacePreviewFileRoute[1]);
    }

    const bootstrapRoute = url.pathname.match(/^\/api\/workspaces\/([0-9a-f-]{36})\/bootstrap$/i);
    if (bootstrapRoute && req.method === 'GET') {
      return sendCompressedJson(req, res, await workspaceBootstrap(session, bootstrapRoute[1]));
    }

    const workspaceRoute = url.pathname.match(/^\/api\/workspaces\/([0-9a-f-]{36})$/i);
    if (workspaceRoute && req.method === 'GET') {
      return sendJson(res, 200, getWorkspace(session.userId, workspaceRoute[1]));
    }

    if (workspaceRoute && req.method === 'PUT') {
      if (sql.workspaceById.get(session.userId, workspaceRoute[1])?.kind === 'instant') throw badRequest('Use the Quick batch workflow or create a workspace copy.');
      const body = await readJson(req);
      return sendJson(res, 200, saveWorkspace(session.userId, workspaceRoute[1], body));
    }

    if (workspaceRoute && req.method === 'DELETE') {
      return sendJson(res, 200, await deleteWorkspace(session.userId, workspaceRoute[1]));
    }

    if (req.method === 'POST' && url.pathname === '/api/fonts/rescan') {
      localFontCatalogPromise = null;
      projectFontIndexPromise = null;
      fontStatsPromise = null;
      fontEnvironmentPromise = null;
      await diskRenderCache.clear();
      clearRenderCache();
      await ensureProjectFontConfig();
      const [localFonts, projectFonts, fontStats] = await Promise.all([
        getLocalFontCatalog({ force: true }),
        getProjectFontIndex({ force: true }),
        getProjectFontStats()
      ]);
      return sendJson(res, 200, { localFonts, projectFonts, fontStats });
    }

    if (req.method === 'GET' && url.pathname === '/api/fonts') {
      const [localFonts, projectFonts, fontStats] = await Promise.all([getLocalFontCatalog(), getProjectFontIndex(), getProjectFontStats()]);
      return sendCompressedJson(req, res, { localFonts, projectFonts, fontStats });
    }

    if (req.method === 'GET' && url.pathname === '/api/fonts/file') {
      const id = String(url.searchParams.get('id') || '');
      const entry = (await getProjectFontIndex()).find((font) => font.id === id);
      if (!entry) return sendJson(res, 404, { error: 'Project font file not found.' });
      const filePath = path.resolve(__dirname, entry.relativePath || '');
      if (!filePath.startsWith(CUSTOM_FONT_DIR + path.sep)) return sendJson(res, 403, { error: 'Invalid project font path.' });
      const data = await fs.readFile(filePath);
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'font/ttf',
        'Content-Length': data.length,
        'Cache-Control': 'private, max-age=86400'
      });
      return res.end(data);
    }

    if (req.method === 'GET' && url.pathname === '/api/model') {
      const modelId = String(url.searchParams.get('id') || 'default');
      return sendJson(res, 200, await publicModelInfo(modelId));
    }

    if (req.method === 'POST' && url.pathname === '/api/models/upload') {
      const body = await readJson(req);
      const stored = await storeUploadedModels(body.files);
      const shared = await Promise.all([
        findOpenSCAD(),
        getLocalFontCatalog(),
        getProjectFontIndex(),
        getProjectFontStats()
      ]);
      const models = [];
      for (const item of stored) models.push(await publicModelInfoFromSource(item, shared));
      return sendJson(res, 200, { models });
    }

    if (req.method === 'POST' && url.pathname === '/api/render') {
      const body = await readJson(req);
      const data = await renderModel(body.values, 'stl', {
        owner: `user:${session.userId}`,
        onCacheHit: (kind) => res.setHeader('X-Render-Cache', kind),
        modelId: body.modelId, source: body.source, sourceName: body.sourceName, packageId: body.packageId, packageEntry: body.packageEntry, signal: renderAbortSignal(req, res), previewQuality: true
      });
      res.writeHead(200, {
        'Content-Type': 'model/stl',
        'Content-Length': data.length,
        'Cache-Control': 'no-store'
      });
      return res.end(data);
    }

    if (req.method === 'POST' && url.pathname === '/api/render-object') {
      const objectId = Number(url.searchParams.get('id'));
      const part = url.searchParams.get('part');
      const exportParts = url.searchParams.get('parts') === '1';
      const format = (url.searchParams.get('format') || 'stl').toLowerCase();
      const body = await readJson(req);
      const data = await renderModel(body.values, format, {
        owner: `user:${session.userId}`,
        onCacheHit: (kind) => res.setHeader('X-Render-Cache', kind),
        modelId: body.modelId,
        source: body.source,
        sourceName: body.sourceName,
        packageId: body.packageId, packageEntry: body.packageEntry,
        objectId,
        exportParts,
        solidParts: body.solidParts,
        previewQuality: url.searchParams.get('preview') === '1',
        // Manifest entries may be conditionally inactive. Preview only the solids
        // they produce; required exports must still reject empty geometry.
        allowEmpty: url.searchParams.get('preview') === '1',
        signal: renderAbortSignal(req, res),
        ...(part ? { part, allowEmpty: true } : {})
      });
      res.writeHead(200, {
        'Content-Type': format === '3mf' ? 'model/3mf' : 'model/stl',
        'Content-Length': data.length,
        'Cache-Control': 'no-store'
      });
      return res.end(data);
    }

    if (req.method === 'POST' && url.pathname === '/api/export') {
      const format = (url.searchParams.get('format') || 'stl').toLowerCase();
      const object = url.searchParams.get('object');
      const body = await readJson(req);
      const data = await renderModel(body.values, format, {
        owner: `user:${session.userId}`,
        modelId: body.modelId, source: body.source, sourceName: body.sourceName, packageId: body.packageId, packageEntry: body.packageEntry,
        previewQuality: url.searchParams.get('preview') === '1',
        allowEmpty: url.searchParams.get('preview') === '1',
        signal: renderAbortSignal(req, res), ...(object ? { objectId: Number(object) } : {})
      });
      res.writeHead(200, {
        'Content-Type': format === '3mf' ? 'model/3mf' : 'model/stl',
        'Content-Disposition': `attachment; filename="custom-model.${format}"`,
        'Content-Length': data.length,
        'Cache-Control': 'no-store'
      });
      return res.end(data);
    }

    if (req.method === 'GET' && ['/projects', '/projects.html'].includes(url.pathname)) {
      return serveAccountPage(req, res, 'projects.html', session);
    }
    if (req.method === 'GET' && ['/app', '/index.html'].includes(url.pathname)) {
      const selected = sql.workspaceById.get(session.userId, url.searchParams.get('workspace') || '');
      if (selected?.kind === 'instant') return sendRedirect(res, `/instant?id=${encodeURIComponent(selected.id)}`);
      return serveAccountPage(req, res, 'index.html', session, { settingsOnly: url.searchParams.get('settings') === '1' });
    }
    if (req.method === 'GET') return serveStatic(req, res, url.pathname);
    res.writeHead(405, { Allow: 'GET, POST, PUT' });
    res.end('Method not allowed');
  } catch (error) {
    if (error?.name === 'AbortError' || req.aborted || res.destroyed) return;
    const status = error instanceof SyntaxError ? 400
      : error.code === 'BAD_REQUEST' ? 400
      : error.code === 'ACCOUNT_EXISTS' ? 409
      : error.code === 'WORKSPACE_NOT_FOUND' ? 404
      : error.code === 'MODEL_NOT_FOUND' ? 404
      : error.code === 'OPENSCAD_NOT_FOUND' ? 503
      : error.code === 'UNSUPPORTED_RUNTIME' || error.code === 'RENDER_INPUT_ERROR' ? 422
      : error.code === 'SERVER_BUSY' ? 503
      : error.code === 'EMAIL_DELIVERY_FAILED' ? 503
      : 500;
    if (status >= 500) console.error(error);
    const message = status === 500 ? 'Unexpected server error.' : (error.message || 'Request failed.');
    return sendJson(res, status, { error: message });
  }
});

server.maxHeadersCount = 64;
server.maxRequestsPerSocket = 100;
server.on('clientError', (_error, socket) => {
  if (socket.writable) socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');
});

server.listen(PORT, HOST, async () => {
  const url = `http://${HOST}:${server.address().port}`;
  console.log(`Liqu3D Local: ${url}`);
  process.parentPort?.postMessage({ type: 'ready', url });
  process.send?.({ type: 'ready', url });
  console.log(`Model: ${MODEL_PATH}`);
  console.log(`Accounts database: ${DATABASE_PATH}`);
  const slots = RENDERER_URL ? syncRenderSchedulerCapacity(await findOpenSCAD()) : MANIFOLD_RENDER_SLOTS;
  console.log(`Render performance: Manifold-only ${slots} slot${slots === 1 ? '' : 's'} · ${Math.round(RENDER_MEMORY_BUDGET_BYTES / 1024 / 1024)} MB memory budget · ${AVAILABLE_PROCESSORS} logical CPUs`);
});

let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  clearInterval(expiryTimer);
  console.log(`${signal} received; stopping cleanly.`);
  const instantShutdown = instants.shutdown();
  for (const child of nativeRenderChildren) child.kill('SIGTERM');
  server.close(async () => {
    await instantShutdown;
    await expiryCleanup;
    await diskRenderCache.flush().catch(() => {});
    emailTransport?.close();
    try { authDb.exec('PRAGMA wal_checkpoint(TRUNCATE); PRAGMA optimize;'); } catch {}
    authDb.close();
    process.exit(0);
  });
  server.closeIdleConnections?.();
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));

await expireTemporaryWorkspaces();
instants.recover();
expiryTimer=setInterval(()=>expireTemporaryWorkspaces().catch(error=>console.error('Temporary workspace cleanup failed:',error)),60_000);
expiryTimer.unref();
