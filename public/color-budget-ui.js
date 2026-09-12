// Native modal focus handling with a compact popover positioned by its control.
export function initColorBudgetUi({ checkbox, button, dialog, getSettings, apply, disable, maximumDefaultsToAllColors = false, focusWorkspace = () => {}, onError = () => {} }) {
  const form = dialog.querySelector('form'), mode = form.elements.mode, maximum = form.elements.maximum;
  const filamentSlots = form.elements.filamentSlots;
  const submit = form.querySelector('[type="submit"]'), message = dialog.querySelector('[role="status"]');
  let controller = null, focusReturn = button, slotsEdited = false;
  const sync = () => {
    maximum.disabled = mode.value !== 'maximum' || Boolean(controller);
    if (filamentSlots) {
      filamentSlots.disabled = Boolean(controller);
      const settings = getSettings();
      if (!slotsEdited) {
        const value = String(maximumDefaultsToAllColors && mode.value === 'maximum' && (!settings.filamentSlotsConfigured || settings.maxColorChanges === undefined) ? 64 : settings.maxFilamentSlots);
        if (filamentSlots.options && ![...filamentSlots.options].some(option => option.value === value)) {
          const option = filamentSlots.ownerDocument.createElement('option');
          option.value=value; option.textContent=`${value} colors`; filamentSlots.add(option);
        }
        filamentSlots.value = value;
      }
    }
  };
  const close = ({cancel = true} = {}) => { if (cancel) controller?.abort(); if (dialog.open) dialog.close(); button.setAttribute('aria-expanded','false'); focusReturn.focus({preventScroll:true}); };
  const open = origin => {
    if (checkbox.disabled || controller) return;
    focusReturn = origin;
    const settings = getSettings();
    mode.value = settings.maxColorChanges === undefined ? 'minimum' : 'maximum';
    maximum.value = settings.maxColorChanges === undefined ? '' : String(settings.maxColorChanges);
    slotsEdited = false;
    message.textContent = ''; sync(); dialog.showModal(); button.setAttribute('aria-expanded','true');
    const anchor = button.getBoundingClientRect(), bounds = dialog.getBoundingClientRect();
    dialog.style.left = `${Math.max(8,Math.min(anchor.right-bounds.width,innerWidth-bounds.width-8))}px`;
    dialog.style.top = `${Math.max(8,Math.min(anchor.bottom+8,innerHeight-bounds.height-8))}px`;
  };
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) { checkbox.checked = getSettings().enabled; open(checkbox); }
    else disable();
  });
  button.addEventListener('click', () => open(button));
  form.addEventListener('change', sync);
  filamentSlots?.addEventListener('change', () => { slotsEdited = true; });
  dialog.querySelector('[data-cancel]').addEventListener('click', close);
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom) close();
  });
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (controller) return;
    const settings = { ...getSettings(), enabled:true };
    delete settings.maxColorChanges;
    if (mode.value === 'maximum') {
      const value = Number(maximum.value);
      if (!maximum.value.trim() || !Number.isSafeInteger(value) || value<0) { message.textContent='Enter a nonnegative whole number.'; maximum.focus(); return; }
      settings.maxColorChanges=value;
    }
    if (filamentSlots) {
      const value = Number(filamentSlots.value);
      if (!Number.isInteger(value) || value < 1 || value > 64) { message.textContent='Choose a color capacity from 1 to 64.'; filamentSlots.focus(); return; }
      settings.maxFilamentSlots=value;
      settings.filamentSlotsConfigured=slotsEdited || Boolean(settings.filamentSlotsConfigured);
    }
    controller=new AbortController(); const signal=controller.signal;
    submit.disabled=true; for (const input of form.querySelectorAll('[name="mode"]')) input.disabled=true; sync();
    close({cancel:false}); focusWorkspace();
    try {
      await apply(settings,signal,text=>{message.textContent=text;});
    } catch(error) { if (!signal.aborted) onError(error); }
    finally { controller=null; submit.disabled=false; for(const input of form.querySelectorAll('[name="mode"]'))input.disabled=false; sync(); }
  });
  return { close };
}
