import { initAccountSettings } from './account-settings.js?v=local1';

// Load the canonical markup without executing the editor or allocating its viewer.
export async function createProjectsSettings({ api, applyAppearance, onProfile, onStorageDelete }) {
  const response = await fetch('/app?settings=1');
  if (!response.ok || response.redirected) throw new Error('Could not load Settings. Please refresh and sign in again.');
  const template = new DOMParser().parseFromString(await response.text(), 'text/html');
  const stylesheet = template.querySelector('link[href^="/styles.css"]');
  const panels = ['accountSettingsModal'].map(id => template.getElementById(id));
  if (!stylesheet || panels.some(panel => !panel)) throw new Error('Could not load Settings.');
  const cssResponse = await fetch(stylesheet.getAttribute('href'));
  if (!cssResponse.ok) throw new Error('Could not load Settings styles.');
  const css = await cssResponse.text();
  const dialog = document.createElement('dialog');
  dialog.setAttribute('aria-label', 'Settings');
  dialog.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;max-width:none;max-height:none;margin:0;padding:0;border:0;background:transparent;overflow:hidden;';
  const host = document.createElement('div');
  const root = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  // Scope existing editor styles to the shadow host, keeping library CSS untouched.
  style.textContent = css.replace(/:root/g, ':host').replace(/html((?:\[[^\]]+\]|:not\(\[[^\]]+\]\))*)/g,
    (_, attributes) => attributes ? `:host(${attributes})` : ':host') + '\n:host { display:block; font:14px Inter, system-ui, sans-serif; color:var(--text); }';
  root.append(style, ...panels);
  dialog.append(host);
  document.body.append(dialog);
  let restoreFocus;
  let previousOverflow;
  const state = { preferences: {} };
  function applyAppearancePreferences(appearance = state.preferences.appearance) {
    applyAppearance({ appearance });
    Object.assign(host.dataset, document.documentElement.dataset);
    host.style.setProperty('--accent', appearance.accent || '#00ae42');
  }
  let preferenceSaveQueue = Promise.resolve();
  function saveAccountPreferences(changes) {
    const pending = preferenceSaveQueue.catch(() => {}).then(async () => {
      const result = await api('/api/account/preferences', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...state.preferences, ...changes })
      });
      state.preferences = result.preferences;
      if (pending === preferenceSaveQueue) applyAppearancePreferences();
      return state.preferences;
    });
    preferenceSaveQueue = pending;
    return pending;
  }
  const controls = initAccountSettings({ root, state, fetchJson: api,
    saveAccountPreferences, applyAppearancePreferences, onProfile, onStorageDelete,
    downloadBlob(blob, filename) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = filename;
      document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    setOpen(open) {
      panels[0].hidden = !open;
      panels[0].setAttribute('aria-hidden', String(!open));
      if (open) {
        restoreFocus = document.activeElement;
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        Object.assign(host.dataset, document.documentElement.dataset);
        host.style.setProperty('--accent', document.documentElement.style.getPropertyValue('--accent'));
        dialog.showModal();
        root.querySelector('#closeAccountSettingsBtn').focus();
      } else {
        dialog.close();
        document.body.style.overflow = previousOverflow;
        restoreFocus?.focus();
      }
    }
  });
  dialog.addEventListener('cancel', event => { event.preventDefault(); controls.close(); });
  return controls;
}
