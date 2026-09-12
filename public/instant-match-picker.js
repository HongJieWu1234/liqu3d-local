let activePicker = null;
const make = (tag, text, className) => {
  const element = document.createElement(tag);
  if (text != null) element.textContent = text;
  if (className) element.className = className;
  return element;
};
const normalize = value => String(value).normalize('NFKC').toLowerCase().replace(/[\s_-]+/g, ' ').trim();

export function closeMatchPicker() {
  const header = activePicker?.header;
  activePicker?.close(false);
  return header;
}

export function createMatchPicker({ header, index, parameters, match, value, onChange }) {
  const button = make('button', null, 'match-trigger');
  button.type = 'button';
  button.dataset.matchHeader = header;
  button.setAttribute('aria-haspopup', 'listbox');
  button.setAttribute('aria-expanded', 'false');
  const popupId = `field-picker-${index}`, listId = `${popupId}-list`;
  button.setAttribute('aria-controls', listId);
  const current = parameters.find(param => param.name === value);
  const label = current?.label || (value === '@ignore' ? 'Ignore' : value === '@quantity' ? 'Copies per order' : 'Choose setting');
  button.setAttribute('aria-label', `${header}: ${label}`);
  button.append(make('span', label, 'match-name'), make('small', current?.name || '', 'match-identifier'), make('span', '⌄', 'match-arrow'));
  button.lastElementChild.setAttribute('aria-hidden', 'true');

  function open(last = false) {
    closeMatchPicker();
    const abort = new AbortController(), listeners = { signal: abort.signal };
    const popup = make('div', null, 'match-popup');
    popup.id = popupId;
    const hasPopover = typeof popup.showPopover === 'function';
    if (hasPopover) popup.setAttribute('popover', 'manual');
    const searchLabel = make('label', `Match ${header}`, 'match-search-label');
    const input = make('input', null, 'match-search');
    input.type = 'search'; input.placeholder = 'Search settings'; input.autocomplete = 'off';
    input.setAttribute('role', 'combobox'); input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', listId); input.setAttribute('aria-expanded', 'true');
    searchLabel.append(input);
    const list = make('div', null, 'match-options'); list.id = listId;
    list.setAttribute('role', 'listbox'); list.setAttribute('aria-label', `${header} settings`);
    const empty = make('p', 'No matching settings.', 'match-empty'); empty.setAttribute('role', 'status');
    popup.append(searchLabel, list, empty); document.body.append(popup);
    if (hasPopover) popup.showPopover();
    button.setAttribute('aria-expanded', 'true');
    const ordered = (match?.candidates || []).map(item => parameters.find(param => param.name === item.name)).filter(Boolean);
    for (const param of parameters) if (!ordered.includes(param)) ordered.push(param);
    const choices = [
      ...ordered.map(param => ({ value: param.name, label: param.label || param.name, identifier: param.name })),
      { value: '@quantity', label: 'Copies per order', identifier: '' },
      { value: '@ignore', label: 'Ignore', identifier: '' },
      { value: null, label: 'Detect automatically', identifier: '' }
    ];
    let visible = [], cursor = -1, closed = false;
    function close(restore) {
      if (closed) return;
      closed = true; abort.abort();
      if (hasPopover && popup.matches(':popover-open')) popup.hidePopover();
      popup.remove(); button.setAttribute('aria-expanded', 'false');
      if (activePicker?.close === close) activePicker = null;
      if (restore && button.isConnected) button.focus({ preventScroll: true });
    }
    function position() {
      if (!button.isConnected) return close(false);
      const rect = button.getBoundingClientRect(), viewport = window.visualViewport;
      const width = viewport?.width || innerWidth, height = viewport?.height || innerHeight;
      const offsetX = viewport?.offsetLeft || 0, offsetY = viewport?.offsetTop || 0;
      const panelWidth = Math.min(Math.max(rect.width, 340), width - 24);
      popup.style.width = `${panelWidth}px`;
      popup.style.maxHeight = `${Math.min(380, height - 24)}px`;
      const panelHeight = popup.getBoundingClientRect().height;
      const below = offsetY + height - rect.bottom - 12;
      const top = below >= Math.min(panelHeight, 240) ? rect.bottom + 6 : rect.top - panelHeight - 6;
      popup.style.left = `${Math.max(offsetX + 12, Math.min(rect.left, offsetX + width - panelWidth - 12))}px`;
      popup.style.top = `${Math.max(offsetY + 12, Math.min(top, offsetY + height - panelHeight - 12))}px`;
    }
    function highlight(next) {
      cursor = Math.max(0, Math.min(next, visible.length - 1));
      for (const [i, option] of [...list.children].entries()) option.classList.toggle('highlighted', i === cursor);
      const option = list.children[cursor];
      if (option) {
        input.setAttribute('aria-activedescendant', option.id);
        const top = list.scrollTop + option.getBoundingClientRect().top - list.getBoundingClientRect().top;
        if (top < list.scrollTop) list.scrollTop = top;
        else if (top + option.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = top + option.offsetHeight - list.clientHeight;
      }
      else input.removeAttribute('aria-activedescendant');
    }
    function choose(choice) { close(true); onChange(choice.value); }
    function filter(initial = false) {
      const words = normalize(input.value).split(' ').filter(Boolean);
      visible = choices.filter(choice => words.every(word => normalize(`${choice.label} ${choice.identifier}`).includes(word)));
      list.replaceChildren();
      for (const [i, choice] of visible.entries()) {
        const option = make('div', null, 'match-option'); option.id = `${listId}-${i}`;
        option.setAttribute('role', 'option'); option.setAttribute('aria-selected', String(choice.value === value));
        option.append(make('span', choice.label, 'match-name'), make('small', choice.identifier, 'match-identifier'));
        option.addEventListener('pointerdown', event => event.preventDefault());
        option.addEventListener('click', () => choose(choice)); list.append(option);
      }
      empty.hidden = visible.length > 0;
      position();
      highlight(initial ? (last ? visible.length - 1 : Math.max(0, visible.findIndex(choice => choice.value === value))) : 0);
    }
    activePicker = { header, close };
    input.addEventListener('input', () => filter(), listeners);
    input.addEventListener('keydown', event => {
      if (['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
        event.preventDefault();
        highlight(event.key === 'Home' ? 0 : event.key === 'End' ? visible.length - 1 : cursor + (event.key === 'ArrowDown' ? 1 : -1));
      } else if (event.key === 'Enter') { event.preventDefault(); if (visible[cursor]) choose(visible[cursor]); }
      else if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(true); }
      else if (event.key === 'Tab') close(true);
    }, listeners);
    document.addEventListener('pointerdown', event => { if (!popup.contains(event.target) && !button.contains(event.target)) close(false); }, listeners);
    window.addEventListener('resize', position, listeners);
    window.addEventListener('scroll', event => { if (!popup.contains(event.target)) position(); }, { ...listeners, capture: true, passive: true });
    window.visualViewport?.addEventListener('resize', position, listeners);
    filter(true); input.focus({ preventScroll: true });
  }
  button.addEventListener('click', () => activePicker?.header === header ? closeMatchPicker() : open());
  button.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); open(event.key === 'ArrowUp'); }
  });
  return button;
}
