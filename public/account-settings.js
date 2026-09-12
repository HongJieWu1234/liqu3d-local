import { initStorageBrowser } from './account-storage-ui.js?v=local1';

export function initAccountSettings({ root = document, state, fetchJson, saveAccountPreferences,
  applyAppearancePreferences, setOpen, onBeforeOpen = () => {}, onWorkspaceChange = () => {},
  onStorageDelete = () => {}, onClose = () => {} }) {
  const $ = selector => root.querySelector(selector);
  const modal = $('#accountSettingsModal');
  const message = $('#accountSettingsMessage');
  const appearanceForm = $('#appearanceForm');
  const workspaceForm = $('#workspacePreferencesForm');
  const theme = appearanceForm.elements.namedItem('appearanceTheme');
  const accent = $('#accentSetting');
  const density = $('#densitySetting');
  const motion = $('#reduceAnimationsSetting');
  const seconds = $('#autoRegenerateDelaySetting');
  const workspaceKeys = ['autoSave','autoRegenerate','autoPosition','instantExport'];
  const storage = initStorageBrowser({ root, fetchJson, onDelete: onStorageDelete, updateUsage });
  function updateUsage(data) {
    const bytes = data.usedBytes || 0;
    const amount = bytes < 1024 ** 2 ? `${(bytes/1024).toFixed(1)} KB` : `${(bytes/1024**2).toFixed(1)} MB`;
    $('#historyStorageUsage').textContent = `${amount} on this device`;
  }
  function showSection(section) {
    for (const button of root.querySelectorAll('[data-settings-section]')) {
      const active = button.dataset.settingsSection === section;
      button.classList.toggle('active',active);
      if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
    }
    for (const panel of root.querySelectorAll('[data-settings-panel]')) {
      panel.hidden = panel.dataset.settingsPanel !== section;
      panel.classList.toggle('active',!panel.hidden);
    }
    message.textContent='';
    if(section==='history')void storage.load();
  }
  function previewAppearance() {
    const appearance={theme:theme.value,accent:accent.value,density:density.value,reduceAnimations:motion.checked};
    applyAppearancePreferences(appearance);
    $('#densityPreviewStatus').textContent=appearance.density==='compact'?'Tighter spacing':'More space between controls';
    $('#motionPreviewStatus').textContent=appearance.reduceAnimations?'Motion kept to a minimum':'Smooth interface transitions';
    return appearance;
  }
  async function saveAppearance(event) {
    event?.preventDefault();
    message.textContent='';
    try{await saveAccountPreferences({appearance:previewAppearance()});}
    catch(error){message.textContent=error.message;}
  }
  appearanceForm.addEventListener('change',saveAppearance);
  appearanceForm.addEventListener('submit',saveAppearance);
  accent.addEventListener('input',previewAppearance);
  async function saveWorkspace(event) {
    event.preventDefault();
    if(!seconds.reportValidity())return;
    const workspace=Object.fromEntries(workspaceKeys.map(key=>[key,$(`#${key}Setting`).checked]));
    workspace.autoRegenerateDelaySeconds=seconds.valueAsNumber;
    message.textContent='';
    try{await saveAccountPreferences({workspace});onWorkspaceChange();}
    catch(error){message.textContent=error.message;}
  }
  workspaceForm.addEventListener('change',saveWorkspace);
  workspaceForm.addEventListener('submit',saveWorkspace);
  for(const button of root.querySelectorAll('[data-settings-section]'))button.addEventListener('click',()=>showSection(button.dataset.settingsSection));
  for(const button of root.querySelectorAll('[data-confirm-action]'))button.addEventListener('click',()=>{$(`[data-confirm-panel="${button.dataset.confirmAction}"]`).hidden=false;});
  for(const button of root.querySelectorAll('[data-cancel-confirm]'))button.addEventListener('click',()=>{$(`[data-confirm-panel="${button.dataset.cancelConfirm}"]`).hidden=true;});
  $('#clearHistoryBtn').addEventListener('click',async()=>{
    try{await fetchJson('/api/account/history/clear',{method:'POST',headers:{'Content-Type':'application/json'},body:'{"confirm":true}'});$('[data-confirm-panel="clear-history"]').hidden=true;await storage.load();}
    catch(error){message.textContent=error.message;}
  });
  function close(){setOpen(false);onClose();}
  $('#closeAccountSettingsBtn').addEventListener('click',close);
  modal.addEventListener('click',event=>{if(event.target.matches('[data-account-settings-close]'))close();});
  root.addEventListener('keydown',event=>{if(event.key==='Escape'&&!modal.hidden&&!event.defaultPrevented){event.preventDefault();close();}});
  async function open() {
    onBeforeOpen();setOpen(true);showSection('appearance');$('#closeAccountSettingsBtn').focus();
    try {
      const settings=await fetchJson('/api/account/settings');state.preferences=settings.preferences;
      const appearance=state.preferences.appearance;
      theme.value=appearance.theme;accent.value=appearance.accent;density.value=appearance.density;motion.checked=appearance.reduceAnimations;
      previewAppearance();
      for(const key of workspaceKeys)$(`#${key}Setting`).checked=state.preferences.workspace[key];
      seconds.value=state.preferences.workspace.autoRegenerateDelaySeconds??2;
      updateUsage(settings.storage);
    }catch(error){message.textContent=error.message;}
  }
  return {open,close};
}
