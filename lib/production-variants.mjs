import { randomUUID } from 'node:crypto';
import { variantDifferences, resolveSkuVariant, boundRecord } from '../public/sku-model.js';

export function createVariantStore(db, { skuRow, enforceStorage, badRequest }) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sku_revisions (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      sku_id TEXT NOT NULL, revision INTEGER NOT NULL, data_json TEXT NOT NULL,
      PRIMARY KEY(user_id, sku_id, revision)
    );
    CREATE TABLE IF NOT EXISTS production_variants (
      id TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      sku_id TEXT NOT NULL REFERENCES production_skus(id) ON DELETE CASCADE,
      revision INTEGER NOT NULL, data_json TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS variant_revisions (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      variant_id TEXT NOT NULL, revision INTEGER NOT NULL, data_json TEXT NOT NULL,
      PRIMARY KEY(user_id, variant_id, revision)
    );
    CREATE TABLE IF NOT EXISTS configurator_variants (
      configurator_id TEXT PRIMARY KEY REFERENCES customer_configurators(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, data_json TEXT NOT NULL
    );
  `);
  const archive = row => {
    if (!row) return;
    const data = skuRow(row, { includeSnapshot: true });
    db.prepare('INSERT OR IGNORE INTO sku_revisions VALUES (?,?,?,?)').run(row.user_id, row.id, data.revision, JSON.stringify(data));
  };
  for (const row of db.prepare('SELECT * FROM production_skus').all()) archive(row);
  const getSku = (userId, id, revision) => {
    const live = db.prepare('SELECT * FROM production_skus WHERE user_id=? AND id=?').get(userId, id);
    if (!live) throw badRequest('SKU not found.');
    const stored = db.prepare('SELECT data_json FROM sku_revisions WHERE user_id=? AND sku_id=? AND revision=?').get(userId, id, Number(revision || live.revision));
    if (!stored) throw badRequest('SKU revision not found.');
    return JSON.parse(stored.data_json);
  };
  const getVariant = (userId, id, revision) => {
    const live = db.prepare('SELECT * FROM production_variants WHERE user_id=? AND id=?').get(userId, id);
    if (!live) throw badRequest('Variant not found.');
    const stored = db.prepare('SELECT data_json FROM variant_revisions WHERE user_id=? AND variant_id=? AND revision=?').get(userId, id, Number(revision || live.revision));
    if (!stored) throw badRequest('Variant revision not found.');
    return JSON.parse(stored.data_json);
  };
  const list = userId => db.prepare('SELECT data_json FROM production_variants WHERE user_id=? ORDER BY rowid DESC').all(userId).map(row => JSON.parse(row.data_json));
  const resolve = (userId, skuId, body = {}) => {
    const variant = body.variantId ? getVariant(userId, String(body.variantId), body.variantRevision) : null;
    if (variant && variant.skuId !== skuId) throw badRequest('Variant does not belong to this SKU.');
    if (variant && body.skuRevision && Number(body.skuRevision) !== variant.skuRevision) throw badRequest('Variant and SKU revisions do not match.');
    const sku = getSku(userId, skuId, variant?.skuRevision || body.skuRevision);
    try { return resolveSkuVariant(sku, variant); } catch (error) { throw badRequest(error.message); }
  };
  const save = (userId, body) => {
    const existing = body.id ? getVariant(userId, String(body.id)) : null;
    if (existing && existing.skuId !== body.skuId) throw badRequest('A variant cannot change SKU.');
    if (existing && Number(body.expectedRevision) !== existing.revision) throw badRequest('This variant changed. Reload it before saving.');
    const sku = getSku(userId, String(body.skuId), body.skuRevision);
    if (!boundRecord(sku.workspaceSnapshot)) throw badRequest('Choose an object and revise this legacy SKU before linking a variant.');
    let differences;
    try { differences = variantDifferences(sku, body.design, body.print); } catch (error) { throw badRequest(error.message); }
    const name = String(body.name || '').trim().slice(0, 120);
    if (!name) throw badRequest('Enter a variant name.');
    const data = { id: existing?.id || randomUUID(), skuId: sku.id, skuRevision: sku.revision, revision: (existing?.revision || 0) + 1,
      name, group: String(body.group || 'General').trim().slice(0, 80), ...differences,
      createdAt: existing?.createdAt || Date.now(), updatedAt: Date.now() };
    const encoded = JSON.stringify(data);
    enforceStorage(userId, Buffer.byteLength(encoded) * 2, existing ? Buffer.byteLength(JSON.stringify(existing)) : 0);
    db.exec('BEGIN');
    try {
      db.prepare('INSERT INTO production_variants VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET revision=excluded.revision,data_json=excluded.data_json').run(data.id, userId, sku.id, data.revision, encoded);
      db.prepare('INSERT INTO variant_revisions VALUES (?,?,?,?)').run(userId, data.id, data.revision, encoded);
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); throw error; }
    return data;
  };
  return {
    archive, getSku, getVariant, list, resolve, save,
    deleteVariant(userId, id) {
      const live = db.prepare('SELECT id FROM production_variants WHERE user_id=? AND id=?').get(userId, id);
      if (!live) return 0;
      const linked = db.prepare("SELECT 1 FROM configurator_variants WHERE user_id=? AND json_extract(data_json,'$.variantId')=? LIMIT 1").get(userId, id);
      if (linked) throw badRequest('Remove customer links using this variant before deleting it.');
      db.exec('BEGIN');
      try {
        db.prepare('DELETE FROM variant_revisions WHERE user_id=? AND variant_id=?').run(userId, id);
        const changed = Number(db.prepare('DELETE FROM production_variants WHERE user_id=? AND id=?').run(userId, id).changes);
        db.exec('COMMIT');
        return changed;
      } catch (error) { db.exec('ROLLBACK'); throw error; }
    },
    deleteSku(userId, id) {
      db.exec('BEGIN');
      try {
        db.prepare('DELETE FROM variant_revisions WHERE user_id=? AND variant_id IN (SELECT id FROM production_variants WHERE user_id=? AND sku_id=?)').run(userId, userId, id);
        db.prepare('DELETE FROM sku_revisions WHERE user_id=? AND sku_id=?').run(userId, id);
        const changed = Number(db.prepare('DELETE FROM production_skus WHERE user_id=? AND id=?').run(userId, id).changes);
        db.exec('COMMIT');
        return changed;
      } catch (error) { db.exec('ROLLBACK'); throw error; }
    },
    storageBytes(userId) {
      return ['sku_revisions','production_variants','variant_revisions','configurator_variants'].reduce((sum, table) => sum + Number(db.prepare(`SELECT COALESCE(SUM(length(CAST(data_json AS BLOB))),0) AS bytes FROM ${table} WHERE user_id=?`).get(userId).bytes), 0);
    },
    export(userId) {
      return Object.fromEntries(['sku_revisions','production_variants','variant_revisions','configurator_variants'].map(table => [table, db.prepare(`SELECT * FROM ${table} WHERE user_id=?`).all(userId).map(row => ({ ...row, data: JSON.parse(row.data_json), data_json: undefined }))]));
    },
    clear(userId) { for (const table of ['configurator_variants','production_variants','variant_revisions','sku_revisions']) db.prepare(`DELETE FROM ${table} WHERE user_id=?`).run(userId); },
    link(userId, id, resolved) {
      const body = { skuId: resolved.id, skuRevision: resolved.revision, variantId: resolved.variant?.id, variantRevision: resolved.variant?.revision };
      const encoded = JSON.stringify(body); enforceStorage(userId, Buffer.byteLength(encoded));
      db.prepare('INSERT INTO configurator_variants VALUES (?,?,?)').run(id, userId, encoded);
    },
    linkBody(id) { const row = db.prepare('SELECT data_json FROM configurator_variants WHERE configurator_id=?').get(id); return row ? JSON.parse(row.data_json) : {}; }
  };
}
