import './setup.mjs';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { createExportHistory } from '../lib/export-history.mjs';
import { historyDateRange,normalizeHistoryFilter,historyReportCsv } from '../public/export-history-report.js';

process.env.TZ='America/New_York';
const now=new Date(2026,2,9,12),range=historyDateRange('days',7,now);
assert.equal(range.from,new Date(2026,2,3).getTime());assert.equal(range.to-range.from,7*86400000-3600000,'Calendar-day ranges survive DST');
assert.equal(historyDateRange('week',7,new Date(2026,8,6)).from,new Date(2026,7,31).getTime(),'Sunday belongs to the week starting Monday');
assert.equal(historyDateRange('month',7,now).from,new Date(2026,2,1).getTime());
assert.equal(historyDateRange('today',7,now).to,new Date(2026,2,10).getTime());
assert.throws(()=>historyDateRange('days',1.5,now));assert.throws(()=>normalizeHistoryFilter({from:10,to:1}));assert.throws(()=>normalizeHistoryFilter({timeZone:'bad zone'}));
const db=new DatabaseSync(':memory:');db.exec('PRAGMA foreign_keys=ON;CREATE TABLE users(id INTEGER PRIMARY KEY);INSERT INTO users VALUES(1),(2)');
const store=createExportHistory(db,{}),snapshot=randomUUID(),other=randomUUID();
const info={title:'=HYPERLINK("bad")',profile:{printer:'p1s',nozzleDiameter:.4,settings:{layer_height:.2}},plateIds:['A'],objectCount:1,estimate:{version:1,modelGrams:1,purgeGrams:2,totalGrams:3,changes:4}};
for(const [id,user] of [[snapshot,1],[other,2]])db.prepare('INSERT INTO export_snapshots VALUES(?,?,?,?,?,?,?,?)').run(id,user,'{}',Buffer.from('png'),JSON.stringify(info),'hash',id,now.getTime());
const ids=Array.from({length:35},()=>randomUUID());
for(const [i,id] of ids.entries())db.prepare('INSERT INTO export_history VALUES(?,?,?,?)').run(id,1,snapshot,range.from+i);
const foreign=randomUUID();db.prepare('INSERT INTO export_history VALUES(?,?,?,?)').run(foreign,2,other,range.from);
const end=randomUUID();db.prepare('INSERT INTO export_history VALUES(?,?,?,?)').run(end,1,snapshot,range.to);
db.prepare('INSERT INTO export_history_estimates VALUES(?,?)').run(ids[0],JSON.stringify({...info.estimate,version:2,totalGrams:5,wasteGrams:4,primeTowerGrams:2,flushGrams:2}));
assert.equal(store.list(1,{...range}).length,30);assert.equal(store.stats(1,range).count,35);assert.equal(store.stats(1,range).legacyCount,34);
assert.equal(store.stats(1,range).totalGrams,107);assert.equal(store.stats(1,range).wasteGrams,4);
const report=store.report(1,{...range,timeZone:'America/New_York'});
assert.equal(report.trim().split('\r\n').length,36,'Reports include more than the visible page');assert.ok(report.includes('"\'=HYPERLINK('));
assert.ok(!report.includes(foreign));assert.ok(!report.includes(end));assert.ok(report.includes('Prime tower (g, estimated)'));
assert.equal(store.report(1,{ids:[ids[0]]}).trim().split('\r\n').length,2);
assert.throws(()=>store.removeMany(1,[ids[0],foreign]),error=>error.status===404);
assert.equal(store.stats(1,range).count,35,'Mixed ownership never partially deletes');
assert.throws(()=>store.removeMany(1,undefined),error=>error.status===400);
assert.deepEqual(store.removeMany(1,ids.slice(0,3)),{deleted:3});assert.equal(store.stats(1,range).count,32);
assert.ok(store.preview(1,ids[3]));assert.equal(db.prepare('SELECT count(*) AS n FROM export_history_estimates').get().n,0,'Deletion removes the per-export estimate');
store.removeMany(1,[...ids.slice(3),end]);assert.equal(store.stats(1).count,0);assert.equal(store.stats(2).count,1);
assert.equal(db.prepare('SELECT count(*) AS n FROM export_snapshots WHERE user_id=1').get().n,0);
assert.equal(historyReportCsv([]).trim().split('\r\n').length,1);db.close();
const towerReport=historyReportCsv([{...info,id:randomUUID(),createdAt:now.getTime(),estimate:{version:4,primeTowerCount:1,primeTowers:[{
  plateId:'A',width:40,depth:20,height:10.2,brim:3,shape:'ribbed',rounded:true,ribWidth:8,extraRibLength:12,
  infillGap:150,primeVolumeMode:'Saving',sparseLayers:false,printedLayers:51,grams:1.234
}]}}]);
assert.ok(towerReport.includes('40 × 20 × 10.2 mm'));assert.ok(towerReport.includes('ribbed'));
assert.ok(towerReport.includes('3 mm brim'));assert.ok(towerReport.includes('12 mm extra rib length'));
assert.ok(towerReport.includes('Saving priming'));assert.ok(towerReport.includes('sparse layers skipped'));
console.log('History reports passed: local calendar dates/DST, full pagination, CSV formula protection, totals, per-event estimates, selections, atomic deletion and account isolation.');
