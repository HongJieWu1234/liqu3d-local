import { initExportHistory } from './export-history-ui.js?v=14';
const accountEmail = document.querySelector('#accountEmail');
const libraryMenuButton = document.querySelector('#libraryMenuButton');
const libraryMenu = document.querySelector('#libraryMenu');
const accountSettingsBtn = document.querySelector('#accountSettingsBtn');
const newWorkspaceBtn = document.querySelector('#newWorkspaceBtn');
const emptyNewWorkspaceBtn = document.querySelector('#emptyNewWorkspaceBtn');
const workspaceGrid = document.querySelector('#workspaceGrid');
const emptyState = document.querySelector('#emptyState');
const libraryMessage = document.querySelector('#libraryMessage');
const dialog = document.querySelector('#newWorkspaceDialog');
const form = document.querySelector('#newWorkspaceForm');
const nameInput = document.querySelector('#newWorkspaceName');
const createButton = document.querySelector('#createWorkspaceBtn');
const closeButton = document.querySelector('#closeNewWorkspaceBtn');
const cancelButton = document.querySelector('#cancelNewWorkspaceBtn');
let previewPollTimer = null;
let newKind = 'workspace';
const addNewDialog = document.querySelector('#addNewDialog');
let lastWorkspaceSignature = '';
const workspaceCardEntries = new Map();
const serverAppearance = {
  theme: ['light', 'dark', 'system'].includes(document.documentElement.dataset.themePreference) ? document.documentElement.dataset.themePreference : 'system',
  accent: /^#[0-9a-f]{6}$/i.test(document.documentElement.style.getPropertyValue('--accent').trim()) ? document.documentElement.style.getPropertyValue('--accent').trim() : '#00ae42',
  reduceAnimations: document.documentElement.dataset.reduceMotion === 'true',
  density: ['compact', 'comfortable'].includes(document.documentElement.dataset.density) ? document.documentElement.dataset.density : 'comfortable'
};

function applyAppearance(preferences = { appearance: serverAppearance }) {
  const appearance = preferences.appearance || serverAppearance;
  const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const theme = appearance.theme === 'system' ? (systemDark ? 'dark' : 'light') : (appearance.theme || 'dark');
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.reduceMotion = String(Boolean(appearance.reduceAnimations));
  document.documentElement.dataset.density = appearance.density || 'comfortable';
  document.documentElement.style.setProperty('--accent', appearance.accent || '#00ae42');
}

applyAppearance({ appearance: serverAppearance });

async function api(url, options = {}) {
  const response = await fetch(url, options);
  if (response.status === 401) {
    window.location.replace('/login');
    throw new Error('Your session has ended.');
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'The request could not be completed.');
  return payload;
}

function formatUpdated(timestamp) {
  const date = new Date(Number(timestamp));
  if (!Number.isFinite(date.getTime())) return 'Saved workspace';
  const sameDay = new Date().toDateString() === date.toDateString();
  return sameDay
    ? `Today at ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    : date.toLocaleDateString([], { month: 'short', day: 'numeric', year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' });
}

function workspaceRenderSignature(workspaces) {
  return JSON.stringify(workspaces.map((workspace) => [
    workspace.id,
    workspace.kind, workspace.instant,
    workspace.pinned, workspace.expiresAt,
    workspace.updatedAt,
    ['dirty', 'generating'].includes(workspace.previewStatus) ? 'pending' : workspace.previewStatus,
    workspace.previewHash,
    workspace.hasPreview
  ]));
}

function updateWorkspaceCountdowns() {
  for(const timer of workspaceGrid.querySelectorAll('[data-workspace-expiry]')) {
    const seconds=Math.max(0,Math.ceil((Number(timer.dataset.workspaceExpiry)-Date.now())/1000));
    const hours=Math.floor(seconds/3600),minutes=Math.floor(seconds%3600/60);
    timer.textContent=seconds?`${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')} left`:'Expired';
  }
}
window.setInterval(updateWorkspaceCountdowns,1000);

function updateWorkspacePin(card, workspace) {
  const pinButton = card.querySelector('.workspace-pin');
  card.classList.toggle('is-pinned', Boolean(workspace.pinned));
  pinButton.setAttribute('aria-pressed', String(Boolean(workspace.pinned)));
  pinButton.setAttribute('aria-label', `${workspace.pinned ? 'Unpin' : 'Pin'} ${workspace.name}`);
  pinButton.title = workspace.pinned ? 'Unpin from top' : 'Pin to top';
}

function workspaceCard(workspace) {
  const card = document.createElement('article');
  card.className = 'workspace-card';
  const pinButton=document.createElement('button');
  pinButton.type='button';pinButton.className='workspace-pin';
  pinButton.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 3 8 0-1 6 4 4v2H5v-2l4-4-1-6ZM12 15v6"/></svg>';
  pinButton.addEventListener('click',async()=>{
    pinButton.disabled=true;
    try { await api(`/api/workspaces/${encodeURIComponent(workspace.id)}/library`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({pinned:!workspace.pinned})});await refreshWorkspaces(); }
    catch(error){showLibraryError(error);}
    finally { pinButton.disabled=false; workspaceGrid.querySelector(`[data-pin-id="${workspace.id}"]`)?.focus({preventScroll:true}); }
  });
  pinButton.dataset.pinId=workspace.id;
  const openLink = document.createElement('a');
  openLink.className = 'workspace-card-link';
  openLink.href = workspace.kind === 'instant' ? `/instant?id=${encodeURIComponent(workspace.id)}` : `/app?workspace=${encodeURIComponent(workspace.id)}`;
  openLink.setAttribute('aria-label', `Open ${workspace.name}`);
  const preview = document.createElement('div');
  preview.className = 'workspace-preview';
  const previewStatus = workspace.kind === 'instant' ? 'instant' : String(workspace.previewStatus || 'dirty');
  const previewPending = previewStatus === 'dirty' || previewStatus === 'generating';
  preview.dataset.status = previewStatus;
  if (workspace.kind !== 'instant' && workspace.hasPreview) {
    const image = document.createElement('img');
    image.alt = '';
    preview.classList.add('awaiting-image');
    image.addEventListener('load', () => {
      preview.classList.remove('awaiting-image');
      preview.classList.add('image-ready');
    }, { once: true });
    image.src = `/api/workspaces/${encodeURIComponent(workspace.id)}/preview.webp?v=${encodeURIComponent(workspace.previewHash || workspace.updatedAt)}`;
    preview.append(image);
  }
  const stage = document.createElement('span');
  stage.className = 'workspace-stage';
  stage.setAttribute('aria-hidden', 'true');
  preview.append(stage);
  if (previewPending || (previewStatus === 'ready' && workspace.hasPreview)) {
    const loading = document.createElement('span');
    loading.className = `preview-loading${previewPending ? (workspace.hasPreview ? ' preview-updating' : '') : ' image-loader'}`;
    loading.innerHTML = `<i aria-hidden="true"></i><strong>${previewPending && workspace.hasPreview ? 'Previous preview · updating…' : 'Generating preview…'}</strong>`;
    preview.append(loading);
  } else if (previewStatus === 'failed') {
    const warning = document.createElement('button');
    warning.type = 'button';
    warning.className = 'preview-warning';
    warning.textContent = 'Retry preview';
    warning.title = workspace.previewError || 'Preview generation failed.';
    warning.addEventListener('click', async (event) => {
      event.preventDefault();
      event.stopPropagation();
      warning.disabled = true;
      warning.textContent = 'Retrying…';
      try {
        await api(`/api/workspaces/${encodeURIComponent(workspace.id)}/preview`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}'
        });
        await refreshWorkspaces();
      } catch (error) {
        showLibraryError(error);
        warning.disabled = false;
        warning.textContent = 'Retry preview';
      }
    });
    preview.append(warning);
  } else if (!workspace.hasPreview && workspace.kind !== 'instant') {
    const empty = document.createElement('span');
    empty.className = 'preview-empty';
    empty.textContent = 'Add a SCAD file to create a preview';
    preview.append(empty);
  }
  if (workspace.kind === 'instant') {
    const badge = document.createElement('span'); badge.className = 'instant-badge workspace-kind'; badge.textContent = 'Quick batch';
    const status = document.createElement('div'); status.className = 'instant-card-status';
    const heading = document.createElement('strong'), detail = document.createElement('small');
    const run = workspace.instant || {}, progress = run.progress || {};
    heading.textContent = ({ ready:'Ready to download',running:progress.stage || 'Generating',queued:'Queued',failed:'Needs attention',cancelled:'Cancelled' })[run.status] || 'Add your orders';
    detail.textContent = progress.plateCount ? `${progress.objectCount} objects · ${progress.plateCount} plates` : progress.total ? `${progress.done || 0}/${progress.total} objects` : 'Orders → SCAD → 3MF';
    status.append(heading, detail); preview.append(badge, status);
  }
  const info = document.createElement('div');
  info.className = 'workspace-info';
  const name = document.createElement('strong');
  name.textContent = workspace.name;
  name.title = workspace.name;
  const meta = document.createElement('span');
  const count = Number(workspace.scadCount) || 0;
  meta.textContent = workspace.kind === 'instant' ? `Quick batch · ${formatUpdated(workspace.updatedAt)}` : `${count} SCAD file${count === 1 ? '' : 's'} · ${formatUpdated(workspace.updatedAt)}`;

  const open = document.createElement('span');
  open.className = 'workspace-open';
  open.textContent = '→';
  open.setAttribute('aria-hidden', 'true');
  info.append(name, meta, open);
  openLink.append(preview, info);
  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'workspace-delete';
  deleteButton.textContent = 'Delete';
  deleteButton.setAttribute('aria-label', `Delete ${workspace.name}`);
  let deleteResetTimer = null;
  deleteButton.addEventListener('click', async () => {
    if (!deleteButton.classList.contains('armed')) {
      deleteButton.classList.add('armed');
      deleteButton.textContent = 'Delete again';
      deleteButton.setAttribute('aria-label', `Click again to delete ${workspace.name}`);
      window.clearTimeout(deleteResetTimer);
      deleteResetTimer = window.setTimeout(() => {
        deleteButton.classList.remove('armed');
        deleteButton.textContent = 'Delete';
        deleteButton.setAttribute('aria-label', `Delete ${workspace.name}`);
      }, 3500);
      return;
    }
    window.clearTimeout(deleteResetTimer);
    deleteButton.disabled = true;
    deleteButton.textContent = 'Deleting…';
    try {
      await api(`/api/workspaces/${encodeURIComponent(workspace.id)}`, { method: 'DELETE' });
      libraryMessage.textContent = '';
      await refreshWorkspaces({ scheduleDirty: true });
    } catch (error) {
      showLibraryError(error);
      deleteButton.disabled = false;
      deleteButton.classList.remove('armed');
      deleteButton.textContent = 'Delete';
    }
  });
  card.append(openLink, pinButton, deleteButton);
  updateWorkspacePin(card, workspace);
  if(workspace.kind==='workspace' && workspace.expiresAt) {
    const badge=document.createElement('div'),label=document.createElement('span'),timer=document.createElement('time');
    badge.className='workspace-countdown';label.textContent='Temporary - 24h';
    timer.dataset.workspaceExpiry=String(workspace.expiresAt);timer.dateTime=new Date(workspace.expiresAt).toISOString();
    timer.setAttribute('role','timer');timer.setAttribute('aria-label','Time until workspace deletion');
    badge.title=`Automatically deletes ${new Date(workspace.expiresAt).toLocaleString()}. Pinning does not extend this.`;
    badge.append(label,timer);card.append(badge);
  }
  return card;
}

function renderWorkspaces(workspaces) {
  if (lastWorkspaceSignature) workspaceGrid.classList.add('settled');
  lastWorkspaceSignature = workspaceRenderSignature(workspaces);
  const ids = new Set(workspaces.map(workspace => workspace.id));
  for (const [id, entry] of workspaceCardEntries) {
    if (!ids.has(id)) { entry.card.remove(); workspaceCardEntries.delete(id); }
  }
  workspaces.forEach((workspace, index) => {
    // Pin changes update the existing card without restarting its preview or hover effects.
    const signature = workspaceRenderSignature([{ ...workspace, pinned: false }]);
    let entry = workspaceCardEntries.get(workspace.id);
    if (!entry || entry.signature !== signature) {
      entry?.card.remove();
      entry = { card: workspaceCard(workspace), workspace, signature };
      workspaceCardEntries.set(workspace.id, entry);
    } else {
      Object.assign(entry.workspace, workspace);
      updateWorkspacePin(entry.card, entry.workspace);
    }
    const next = workspaceGrid.children[index] || null;
    if (next !== entry.card) workspaceGrid.insertBefore(entry.card, next);
  });
  updateWorkspaceCountdowns();

  workspaceGrid.hidden = workspaces.length === 0;
  emptyState.hidden = workspaces.length !== 0;
}

async function refreshWorkspaces({ scheduleDirty = false } = {}) {
  const payload = await api('/api/workspaces');
  const workspaces = Array.isArray(payload.workspaces) ? payload.workspaces : [];
  const signature = workspaceRenderSignature(workspaces);
  if (signature !== lastWorkspaceSignature) renderWorkspaces(workspaces);
  if (scheduleDirty) {
    await Promise.allSettled(workspaces
      .filter((workspace) => workspace.kind !== 'instant' && ['dirty', 'generating'].includes(workspace.previewStatus))
      .map((workspace) => api(`/api/workspaces/${encodeURIComponent(workspace.id)}/preview`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}'
      })));
  }
  const pending = workspaces.some((workspace) => workspace.kind === 'instant' ? ['queued', 'running'].includes(workspace.instant?.status) : ['dirty', 'generating'].includes(workspace.previewStatus));
  window.clearTimeout(previewPollTimer);
  if (pending) previewPollTimer = window.setTimeout(() => refreshWorkspaces({ scheduleDirty: true }).catch(showLibraryError), 800);
  else if(workspaces.some(workspace=>workspace.expiresAt))previewPollTimer=window.setTimeout(()=>refreshWorkspaces().catch(showLibraryError),30_000);
  return workspaces;
}

function showLibraryError(error) {
  libraryMessage.textContent = error?.message || 'Could not update workspace previews.';
}

function openCreateDialog() {
  libraryMessage.textContent = '';
  nameInput.value = newKind === 'instant' ? 'Untitled Quick batch' : 'Untitled workspace';
  document.querySelector('#newWorkspaceTitle').textContent = newKind === 'instant' ? 'New Quick batch' : 'New workspace';
  document.querySelector('label[for="newWorkspaceName"]').textContent = newKind === 'instant' ? 'Quick batch name' : 'Workspace name';
  document.querySelector('#newWorkspaceForm > p').textContent = newKind === 'instant' ? 'Save your model setup and generate new order batches.' : 'Add one or more SCAD files after the workspace opens.';
  document.querySelector('#newWorkspaceForm .eyebrow').textContent = newKind === 'instant' ? 'Quick batch' : 'Workspace';
  createButton.textContent = newKind === 'instant' ? 'Create Quick batch' : 'Create workspace';
  createButton.disabled = false;
  dialog.showModal();
  nameInput.select();
}

function closeCreateDialog() {
  if (dialog.open) dialog.close();
}

function setLibraryMenuOpen(open) {
  libraryMenu.hidden = !open;
  libraryMenuButton.setAttribute('aria-expanded', String(open));
}

newWorkspaceBtn.addEventListener('click', () => addNewDialog.showModal());
emptyNewWorkspaceBtn.addEventListener('click', () => addNewDialog.showModal());
for (const kind of ['Workspace','Instant']) document.querySelector(`#choose${kind}Btn`).addEventListener('click', () => { newKind = kind.toLowerCase(); addNewDialog.close(); openCreateDialog(); });
closeButton.addEventListener('click', closeCreateDialog);
cancelButton.addEventListener('click', closeCreateDialog);
dialog.addEventListener('cancel', closeCreateDialog);
libraryMenuButton.addEventListener('click', (event) => {
  event.stopPropagation();
  setLibraryMenuOpen(libraryMenu.hidden);
});
document.addEventListener('click', (event) => {
  if (!libraryMenu.hidden && !event.target.closest('.library-menu-wrap')) setLibraryMenuOpen(false);
});
let settingsOverlay;
accountSettingsBtn.addEventListener('click', async () => {
  setLibraryMenuOpen(false);
  libraryMenuButton.focus();
  accountSettingsBtn.disabled = true;
  try {
    if (!settingsOverlay) {
      const { createProjectsSettings } = await import('./projects-settings.js?v=local1');
      settingsOverlay = await createProjectsSettings({ api, applyAppearance, onStorageDelete: () => refreshWorkspaces(),
        onProfile: result => { accountEmail.textContent = result.displayName || result.email; }
      });
    }
    await settingsOverlay.open();
  } catch (error) { libraryMessage.textContent = error.message; }
  finally { accountSettingsBtn.disabled = false; }
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  createButton.disabled = true;
  createButton.textContent = 'Creating…';
  try {
    const workspace = await api('/api/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nameInput.value, kind: newKind })
    });
    window.location.assign(newKind === 'instant' ? `/instant?id=${encodeURIComponent(workspace.id)}` : `/app?workspace=${encodeURIComponent(workspace.id)}`);
  } catch (error) {
    libraryMessage.textContent = error.message;
    closeCreateDialog();
    createButton.disabled = false;
    createButton.textContent = 'Create workspace';
  }
});



async function init() {
  try {
    const session = await api('/api/auth/session');
    applyAppearance(session.user.preferences);
    accountEmail.textContent = session.user.displayName || session.user.email;
    await refreshWorkspaces({ scheduleDirty: true });
  } catch (error) {
    libraryMessage.textContent = error.message;
  }
}

init();

initExportHistory(document.querySelector("#exportHistoryBtn"));
