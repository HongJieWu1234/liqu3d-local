function el(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== '') node.textContent = text;
  return node;
}

function dateText(value) {
  const date = new Date(Number(value));
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date)
    : '—';
}

function copyText(value) {
  return navigator.clipboard?.writeText?.(String(value)) || Promise.resolve();
}

export function initProductionDashboard(options) {
  const modal = document.querySelector('#productionDashboardModal');
  const openBtn = document.querySelector('#workflowBtn');
  const closeBtn = document.querySelector('#closeProductionDashboardBtn');
  const tabs = [...document.querySelectorAll('[data-production-tab]')];
  const panels = [...document.querySelectorAll('[data-production-panel]')];
  const message = document.querySelector('#productionDashboardMessage');
  const templateName = document.querySelector('#productionTemplateName');
  const saveTemplateBtn = document.querySelector('#saveProductionTemplateBtn');
  const templateList = document.querySelector('#productionTemplateList');
  const componentName = document.querySelector('#productionComponentName');
  const componentDescription = document.querySelector('#productionComponentDescription');
  const componentSource = document.querySelector('#productionComponentSource');
  const saveComponentBtn = document.querySelector('#saveProductionComponentBtn');
  const componentList = document.querySelector('#productionComponentList');
  const calibrationName = document.querySelector('#productionCalibrationName');
  const calibrationMaterial = document.querySelector('#productionCalibrationMaterial');
  const calibrationHole = document.querySelector('#productionCalibrationHole');
  const calibrationContour = document.querySelector('#productionCalibrationContour');
  const calibrationFoot = document.querySelector('#productionCalibrationFoot');
  const saveCalibrationBtn = document.querySelector('#saveProductionCalibrationBtn');
  const calibrationList = document.querySelector('#productionCalibrationList');
  let state = { templates: [], components: [], calibrations: [] };
  let focusBeforeOpen = null;

  const setMessage = (text, error = false) => {
    message.textContent = text || '';
    message.hidden = !text;
    message.classList.toggle('error', error);
  };
  const request = (url, init = {}) => options.fetchJson(url, init);

  function activateTab(name, { focus = false } = {}) {
    tabs.forEach((button) => {
      const active = button.dataset.productionTab === name;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      if (active && focus) button.focus({ preventScroll: true });
    });
    panels.forEach((panel) => { panel.hidden = panel.dataset.productionPanel !== name; });
  }

  function actionButton(label, handler, className = 'mini-button') {
    const button = el('button', className, label);
    button.type = 'button';
    button.addEventListener('click', handler);
    return button;
  }

  function renderTemplates() {
    templateList.replaceChildren();
    if (!state.templates.length) templateList.append(el('div', 'production-empty compact', 'No reusable workspace templates yet.'));
    for (const template of state.templates) {
      const row = el('article', 'production-simple-row');
      const copy = el('div');
      copy.append(el('strong', '', template.name), el('span', '', `Updated ${dateText(template.updatedAt)}`));
      const actions = el('div', 'production-row-actions');
      actions.append(actionButton('Apply', async () => {
        try {
          const data = structuredClone(template.template || {});
          if (data.workspaceSnapshot && typeof options.loadTemplate === 'function') {
            if (!Array.isArray(data.workspaceSnapshot.productionRules) && Array.isArray(data.rules)) {
              data.workspaceSnapshot.productionRules = structuredClone(data.rules);
            }
            await options.loadTemplate(data);
          }
          activateTab('variants');
          setMessage(`${template.name} applied to the workspace.`);
        } catch (error) { setMessage(error.message, true); }
      }));
      actions.append(actionButton('Delete', async () => {
        await request(`/api/production/templates/${template.id}`, { method: 'DELETE' });
        await refresh();
      }, 'mini-button danger-outline'));
      row.append(copy, actions);
      templateList.append(row);
    }
  }

  function renderComponents() {
    componentList.replaceChildren();
    if (!state.components.length) componentList.append(el('div', 'production-empty compact', 'No reusable OpenSCAD components yet.'));
    for (const component of state.components) {
      const row = el('article', 'production-simple-row');
      const copy = el('div');
      copy.append(el('strong', '', component.name), el('span', '', `${component.description || 'OpenSCAD snippet'} · ${Math.max(1, String(component.source || '').split('\n').length)} lines`));
      const actions = el('div', 'production-row-actions');
      actions.append(actionButton('Copy', async () => { await copyText(component.source || ''); setMessage(`${component.name} copied.`); }));
      actions.append(actionButton('Edit', () => {
        componentName.value = component.name || '';
        componentDescription.value = component.description || '';
        componentSource.value = component.source || '';
        componentSource.dataset.componentId = component.id;
        componentSource.focus();
      }));
      actions.append(actionButton('Delete', async () => {
        await request(`/api/production/components/${component.id}`, { method: 'DELETE' });
        if (componentSource.dataset.componentId === component.id) {
          componentSource.dataset.componentId = '';
          componentName.value = componentDescription.value = componentSource.value = '';
        }
        await refresh();
      }, 'mini-button danger-outline'));
      row.append(copy, actions);
      componentList.append(row);
    }
  }

  function renderCalibrations() {
    calibrationList.replaceChildren();
    if (!state.calibrations.length) calibrationList.append(el('div', 'production-empty compact', 'No dimensional calibration profiles yet.'));
    for (const profile of state.calibrations) {
      const row = el('article', 'production-simple-row');
      const values = profile.values?.settings || {};
      const copy = el('div');
      copy.append(el('strong', '', profile.name), el('span', '', `${profile.material} · ${profile.nozzle} mm · holes ${values.xy_hole_compensation ?? 0} · contour ${values.xy_contour_compensation ?? 0}`));
      row.append(copy, actionButton('Delete', async () => {
        await request(`/api/production/calibrations/${profile.id}`, { method: 'DELETE' });
        await refresh();
      }, 'mini-button danger-outline'));
      calibrationList.append(row);
    }
  }

  function renderAll() {
    renderTemplates();
    renderComponents();
    renderCalibrations();
  }

  async function refresh() {
    state = await request('/api/production');
    renderAll();
    return state;
  }

  async function saveTemplate() {
    try {
      const template = {
        version: 1,
        workspaceSnapshot: options.getWorkspaceSnapshot(),
        printProfile: options.getPrintProfile(),
        rules: options.getProductionRules()
      };
      await request('/api/production/templates', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: templateName.value || 'Workspace template', template })
      });
      templateName.value = '';
      await refresh();
    } catch (error) { setMessage(error.message, true); }
  }

  async function saveComponent() {
    if (!componentSource.value.trim()) return setMessage('Enter OpenSCAD source for the reusable component.', true);
    saveComponentBtn.disabled = true;
    try {
      const body = {
        id: componentSource.dataset.componentId || undefined,
        name: componentName.value || 'Reusable SCAD component',
        description: componentDescription.value || '',
        source: componentSource.value
      };
      const result = await request('/api/production/components', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      });
      componentSource.value = componentName.value = componentDescription.value = '';
      componentSource.dataset.componentId = '';
      await refresh();
      setMessage(`${result.name} saved.`);
    } catch (error) { setMessage(error.message, true); }
    finally { saveComponentBtn.disabled = false; }
  }

  async function saveCalibration() {
    const profile = options.getPrintProfile();
    try {
      await request('/api/production/calibrations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: calibrationName.value || `${profile.printer} ${profile.nozzleDiameter} mm ${calibrationMaterial.value || 'PLA'}`,
          printer: profile.printer,
          nozzle: profile.nozzleDiameter,
          material: calibrationMaterial.value || profile.settings?.filament_type || 'PLA',
          values: {
            xy_hole_compensation: Number(calibrationHole.value) || 0,
            xy_contour_compensation: Number(calibrationContour.value) || 0,
            elefant_foot_compensation: Number(calibrationFoot.value) || 0
          }
        })
      });
      await refresh();
    } catch (error) { setMessage(error.message, true); }
  }

  async function open() {
    focusBeforeOpen = document.activeElement;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('production-open');
    document.querySelector('.app-shell').inert = true;
    activateTab('variants');
    options.renderLegacyVariants();
    await refresh().catch((error) => setMessage(error.message, true));
    if (!modal.hidden) tabs.find((tab) => tab.dataset.productionTab === 'variants')?.focus({ preventScroll: true });
  }

  function close() {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('production-open');
    document.querySelector('.app-shell').inert = false;
    if (focusBeforeOpen instanceof HTMLElement && document.contains(focusBeforeOpen)) focusBeforeOpen.focus({ preventScroll: true });
    focusBeforeOpen = null;
  }

  tabs.forEach((button, index) => {
    button.addEventListener('click', () => activateTab(button.dataset.productionTab));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;
      activateTab(tabs[nextIndex].dataset.productionTab, { focus: true });
    });
  });
  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', (event) => { if (event.target.matches('[data-production-close]')) close(); });
  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key !== 'Tab') return;
    const focusable = [...modal.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])')]
      .filter((element) => !element.closest('[hidden]') && element.getClientRects().length);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  saveTemplateBtn.addEventListener('click', saveTemplate);
  saveComponentBtn.addEventListener('click', saveComponent);
  saveCalibrationBtn.addEventListener('click', saveCalibration);

  return { open, close, refresh };
}
