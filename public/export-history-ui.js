import { historyDateRange, historyTowerDescription } from './export-history-report.js?v=2';
import { offerBambuHandoff } from './bambu-handoff.js?v=4';

export const grams = value => Number.isFinite(value) ? `~${value.toFixed(value<10?2:1)} g` : 'Estimate unavailable';
export const estimateSummary = estimate => `${grams(estimate?.totalGrams)} filament${Number.isFinite(estimate?.wasteGrams)?` · ${grams(estimate.wasteGrams)} waste (flush + tower)`:''}`;

export async function downloadRecordedExport(url,recipe,onEstimate=()=>{},{method='POST'}={}) {
  const response=await fetch(url,{method,headers:{'Content-Type':'application/json','X-Instant-Export':'1'},
    ...(method==='GET'?{}:{body:JSON.stringify(recipe||{})})});
  if(!response.ok){const data=await response.json().catch(()=>({}));throw new Error(data.error||'Export could not be generated.');}
  const estimate=JSON.parse(response.headers.get('X-Filament-Estimate')||'null');
  onEstimate(estimate);
  const bambu=JSON.parse(response.headers.get('X-Bambu-Launch')||'null');
  const result={estimate,id:response.headers.get('X-Export-History-Id'),bambu};
  if(bambu?.opened>0&&bambu.opened===bambu.count){await response.body?.cancel();return result;}
  const blob=await response.blob(),filename=response.headers.get('Content-Disposition')?.match(/filename="([^"]+)"/)?.[1]||'export.3mf';
  const download=()=>{
    const link=document.createElement('a'),objectUrl=URL.createObjectURL(blob);link.href=objectUrl;link.download=filename;
    document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(objectUrl),1000);
  };
  if(bambu)offerBambuHandoff(bambu,{download});else download();
  return result;
}

export function initExportHistory(button) {
  if(!button)return;
  const dialog=document.createElement('dialog');dialog.className='export-history-dialog';dialog.setAttribute('aria-labelledby','exportHistoryTitle');
  dialog.innerHTML=`<header><div><h2 id="exportHistoryTitle">Export history</h2><p>Review filament estimates, download a report, or remove selected exports.</p></div><button type="button" class="history-close" aria-label="Close export history"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></header>
    <div class="export-history-content">
      <div class="history-toolbar"><div class="history-date-controls">
        <label>Export date<select class="history-period"><option value="all">All dates</option><option value="today">Today</option><option value="week">This week · Monday onward</option><option value="month">This month</option><option value="days">Last X days</option></select></label>
        <label class="history-days-label" hidden>Days, including today<input class="history-days" type="number" min="1" max="3650" step="1" value="7"></label>
        <button class="history-apply" type="button" hidden>Apply dates</button>
      </div><button type="button" class="history-report">Download CSV report</button></div>
      <p class="history-range"></p>
      <div class="history-totals" aria-label="Totals for the chosen date range"></div><p class="history-totals-note"></p>
      <div class="history-selection"><label><input type="checkbox" class="history-select-shown"> Select shown exports</label><span class="history-selection-count">None selected</span><button type="button" class="history-delete-selected" disabled>Delete selected</button></div>
      <div class="history-confirm" hidden role="alert"><p></p><div><button type="button" class="history-cancel-delete">Keep exports</button><button type="button" class="history-confirm-delete">Delete exports</button></div></div>
      <p class="history-status" role="status" aria-live="polite"></p><div class="export-history-grid"></div><div class="history-pagination"><button class="history-more" type="button" hidden>Load more</button></div>
    </div><footer>Dates record exports, not completed prints. Reports contain estimates and settings, not 3MF files. “Export again” regenerates the original model.</footer>`;
  document.body.append(dialog);
  const $=selector=>dialog.querySelector(selector),grid=$('.export-history-grid'),status=$('.history-status'),more=$('.history-more');
  const period=$('.history-period'),days=$('.history-days'),report=$('.history-report'),selectShown=$('.history-select-shown');
  const selected=new Set();let offset=0,total=0,loading=false,actionPending=false,deletingIds=[];
  let filter=historyDateRange(),timeZone=Intl.DateTimeFormat().resolvedOptions().timeZone;
  const element=(tag,className,text)=>{const el=document.createElement(tag);el.className=className;if(text!==undefined)el.textContent=text;return el;};
  const cancelDelete=()=>{deletingIds=[];$('.history-confirm').hidden=true;};
  function syncActions() {
    const busy=loading||actionPending;
    for(const control of dialog.querySelectorAll('button:not(.history-close),select,input'))control.disabled=busy;
    $('.history-delete-selected').disabled=busy||!selected.size;
    report.disabled=busy||!total;selectShown.disabled=busy||!grid.children.length;
    const checked=grid.querySelectorAll('.history-select:checked').length;
    selectShown.checked=checked>0&&checked===grid.children.length;selectShown.indeterminate=checked>0&&checked<grid.children.length;
    $('.history-selection-count').textContent=selected.size?`${selected.size} selected`:'None selected';
    report.textContent=selected.size?`Download selected (${selected.size})`:'Download CSV report';
  }
  function confirmDelete(ids) {
    deletingIds=[...ids];const count=deletingIds.length;
    $('.history-confirm p').textContent=`Delete ${count} export${count===1?'':'s'} from history? Their saved re-export records will be removed. Projects and downloaded files stay unchanged.`;
    $('.history-confirm').hidden=false;$('.history-confirm-delete').textContent=`Delete ${count} export${count===1?'':'s'}`;
    $('.history-cancel-delete').focus();$('.history-confirm').scrollIntoView({block:'nearest'});
  }
  function card(item) {
    const article=element('article','export-history-card');article.dataset.historyId=item.id;
    const top=element('div','history-card-top'),pick=element('label','history-pick'),checkbox=document.createElement('input');
    checkbox.type='checkbox';checkbox.className='history-select';checkbox.setAttribute('aria-label',`Select ${item.title}`);
    checkbox.addEventListener('change',()=>{if(checkbox.checked&&selected.size>=500){checkbox.checked=false;status.textContent='Select up to 500 exports at a time.';return;}checkbox.checked?selected.add(item.id):selected.delete(item.id);cancelDelete();syncActions();});
    pick.append(checkbox,document.createTextNode('Select'));top.append(pick,element('span','history-estimate-badge','Estimated'));
    const image=document.createElement('img');image.src=`/api/export-history/${item.id}/preview`;image.alt=`${item.title} — exported plates ${(item.plateIds||[]).join(', ')}`;image.loading='lazy';
    const body=element('div','export-history-card-body'),e=item.estimate||{},profile=item.profile||{};
    body.append(element('h3','',item.title),element('p','history-meta',new Date(item.createdAt).toLocaleString()),
      element('p','history-meta',`${(profile.printer||'Printer').toUpperCase()} · ${profile.nozzleDiameter??'—'} mm nozzle · ${profile.settings?.layer_height??'—'} mm layers`),
      element('p','history-meta',`Plates ${(item.plateIds||[]).join(', ')} · ${item.objectCount??0} designs${item.overrideCount?` · ${item.overrideCount} object overrides`:''}`),
      element('strong','history-filament',`${grams(e.totalGrams)} total filament`));
    const breakdown=element('dl','history-breakdown');
    for(const [label,value] of [['Model',e.modelGrams],['Flushed filament',e.flushGrams??e.purgeGrams],['Prime tower + brim',e.primeTowerGrams],['Total waste',e.wasteGrams]]) {
      const row=element('div','');row.append(element('dt','',label),element('dd','',Number.isFinite(value)?grams(value):'Not available'));breakdown.append(row);
    }
    body.append(breakdown,element('p','history-meta',`${Number.isFinite(e.changes)?`~${e.changes} color switches`:'Color switches unavailable'} · ${Number.isFinite(e.nozzleChanges)?`~${e.nozzleChanges} nozzle switches`:'Nozzle assignment unresolved'}`));
    if(e.primeTowers?.length) {
      const towers=element('details','history-estimate-details');
      towers.append(element('summary','',`Prime towers · ${e.primeTowers.length} · estimated size and variation`));
      towers.append(element('p','','Dimensions are width × depth × height; brim width is listed separately.'));
      for(const tower of e.primeTowers)towers.append(element('p','',historyTowerDescription(tower)));
      body.append(towers);
    }
    const colorSection=element('section','history-colors');
    colorSection.append(element('h4','','Filament per color'));
    if(e.perColor?.length)for(const color of e.perColor) {
      const row=element('div','history-color'),heading=element('div','history-color-heading'),swatch=element('span','history-color-swatch');
      if(/^#[0-9a-f]{6}$/i.test(color.color))swatch.style.backgroundColor=color.color;
      swatch.setAttribute('aria-hidden','true');
      heading.append(swatch,element('span','',color.color),element('strong','',grams(color.totalGrams)));
      row.append(heading,element('p','history-meta',`Model ${grams(color.modelGrams)} · Flush ${grams(color.flushGrams)} · Tower + brim ${grams(color.primeTowerGrams)}`));
      colorSection.append(row);
    } else colorSection.append(element('p','history-meta','This export has no saved per-color breakdown. Export again to calculate it.'));
    body.insertBefore(colorSection,breakdown);
    const details=element('details','history-estimate-details');details.append(element('summary','','How this is calculated'));
    const notes=e.notes||['Older estimate: model and purge only. Prime towers, startup purging, supports and brims were excluded. Export again to calculate the current breakdown.'];
    for(const note of notes)details.append(element('p','',note));
    body.append(details);
    const again=element('button','history-export-again','Export again');again.type='button';
    again.addEventListener('click',async()=>{
      if(loading||actionPending)return;cancelDelete();actionPending=true;syncActions();again.textContent='Generating…';status.textContent='Regenerating the original model and settings…';
      try{const result=await downloadRecordedExport(`/api/export-history/${item.id}/again`);await load(true);status.textContent=`Export ready · ${estimateSummary(result.estimate)}${result.bambu?.message?` · ${result.bambu.message}`:''}`;}
      catch(error){status.textContent=error.message;}finally{actionPending=false;syncActions();again.textContent='Export again';}
    });
    const remove=element('button','history-delete','Delete');remove.type='button';remove.setAttribute('aria-label',`Delete export ${item.title}`);
    remove.addEventListener('click',()=>{if(!loading&&!actionPending)confirmDelete([item.id]);});
    const actions=element('div','history-card-actions');actions.append(again,remove);body.append(actions);article.append(top,image,body);return article;
  }
  function showStats(stats) {
    total=stats.count;const box=$('.history-totals');box.replaceChildren();
    for(const [label,value] of [['Exports',String(total)],['Estimated filament',total&&stats.missingTotal<total?grams(stats.totalGrams):'—'],['Estimated waste',total&&stats.missingWaste<total?grams(stats.wasteGrams):'—']]) {
      const cell=element('div','');cell.append(element('span','',label),element('strong','',value));box.append(cell);
    }
    const notes=[];
    if(stats.missingTotal)notes.push(`${stats.missingTotal} exports have no total estimate`);
    if(stats.missingWaste)notes.push(`${stats.missingWaste} exports have no waste breakdown`);
    if(stats.legacyCount)notes.push(`${stats.legacyCount} older estimates exclude prime towers`);
    $('.history-totals-note').textContent=notes.length?notes.join(' · ')+'. Totals sum available values only.':'Totals cover all exports in the date range, including repeat exports.';
  }
  async function load(reset=false) {
    if(loading)return;loading=true;cancelDelete();
    if(reset){offset=0;total=0;selected.clear();grid.replaceChildren();$('.history-totals').replaceChildren();$('.history-totals-note').textContent='';}
    syncActions();status.textContent='Loading exports…';more.hidden=true;
    const params=new URLSearchParams({offset});for(const key of ['from','to'])if(filter[key]!==null)params.set(key,filter[key]);
    $('.history-range').textContent=filter.label;
    try {
      const response=await fetch(`/api/export-history?${params}`),data=await response.json();if(!response.ok)throw new Error(data.error||'Could not load export history.');
      for(const item of data.exports)grid.append(card(item));offset+=data.exports.length;
      showStats(data.stats||{count:offset,missingTotal:offset,missingWaste:offset});more.hidden=offset>=total;
      status.textContent=total?`Showing ${offset} of ${total} exports. CSV reports include every matching export unless you select specific entries.`:'No exports in this date range. Choose another range or create an export.';
    }catch(error){status.textContent=error.message;}finally{loading=false;syncActions();}
  }
  function applyDates() {
    try{filter=historyDateRange(period.value,Number(days.value));days.setCustomValidity('');void load(true);}
    catch(error){days.setCustomValidity(error.message);days.reportValidity();status.textContent=error.message;}
  }
  period.addEventListener('change',()=>{$('.history-days-label').hidden=$('.history-apply').hidden=period.value!=='days';applyDates();});
  days.addEventListener('input',()=>days.setCustomValidity(''));days.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();applyDates();}});
  $('.history-apply').addEventListener('click',applyDates);
  selectShown.addEventListener('change',()=>{
    cancelDelete();for(const checkbox of grid.querySelectorAll('.history-select')) {
      const id=checkbox.closest('article').dataset.historyId;
      if(selectShown.checked&&selected.size>=500&&!selected.has(id))continue;
      checkbox.checked=selectShown.checked;checkbox.checked?selected.add(id):selected.delete(id);
    }syncActions();
  });
  report.addEventListener('click',async()=>{
    if(loading||actionPending)return;cancelDelete();actionPending=true;syncActions();status.textContent='Preparing your CSV report…';
    try {
      const response=await fetch('/api/export-history/report',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...filter,timeZone,...(selected.size?{ids:[...selected]}:{})})});
      if(!response.ok){const data=await response.json();throw new Error(data.error||'Could not download the report.');}
      const url=URL.createObjectURL(await response.blob()),link=document.createElement('a');link.href=url;link.download=response.headers.get('Content-Disposition')?.match(/filename="([^"]+)"/)?.[1]||'export-history.csv';
      document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
      const count=selected.size||total;
      status.textContent=`Report downloaded · ${count} export${count===1?'':'s'} · includes model, flush, tower, total waste and estimate notes.`;
    }catch(error){status.textContent=error.message;}finally{actionPending=false;syncActions();}
  });
  $('.history-delete-selected').addEventListener('click',()=>confirmDelete(selected));
  $('.history-cancel-delete').addEventListener('click',cancelDelete);
  $('.history-confirm-delete').addEventListener('click',async()=>{
    if(loading||actionPending||!deletingIds.length)return;const ids=[...deletingIds];actionPending=true;syncActions();status.textContent='Deleting selected exports…';
    try {
      const response=await fetch('/api/export-history/delete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ids})}),data=await response.json();
      if(!response.ok)throw new Error(data.error||'Could not delete these exports.');
      await load(true);status.textContent=`Deleted ${data.deleted} export${data.deleted===1?'':'s'}. Projects and downloaded files are unchanged.`;
    }catch(error){status.textContent=error.message;}finally{actionPending=false;cancelDelete();syncActions();if(dialog.open)$('.history-select-shown').focus();}
  });
  button.addEventListener('click',()=>{dialog.showModal();if(!actionPending)applyDates();});
  $('.history-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',cancelDelete);
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  more.addEventListener('click',()=>{if(!actionPending)void load();});
}
