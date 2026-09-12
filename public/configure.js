const token = location.hash.slice(1).trim();
const title = document.querySelector('#configuratorTitle');
const sku = document.querySelector('#configuratorSku');
const form = document.querySelector('#configuratorForm');
const fields = document.querySelector('#configuratorFields');
const message = document.querySelector('#configuratorMessage');
const result = document.querySelector('#configuratorResult');
const submit = document.querySelector('#submitConfiguration');
const orderRef = document.querySelector('#configOrderRef');
const customer = document.querySelector('#configCustomer');
const quantity = document.querySelector('#configQuantity');
let definition = null;

async function json(url, init = {}) {
  const response = await fetch(url, init);
  let payload = null; try { payload = await response.json(); } catch {}
  if (!response.ok) throw new Error(payload?.error || `Request failed (${response.status}).`);
  return payload;
}

function inputFor(parameter) {
  const name = String(parameter.name);
  const type = String(parameter.type || 'string');
  if (type === 'boolean') {
    const label = document.createElement('label'); label.className = 'boolean-field configurator-field';
    const text = document.createElement('span'); text.textContent = parameter.label || name;
    const input = document.createElement('input'); input.type = 'checkbox'; input.name = name; input.checked = Boolean(parameter.value);
    label.append(text, input); return label;
  }
  const label = document.createElement('label'); label.className = 'configurator-field';
  const span = document.createElement('span'); span.textContent = parameter.label || name; label.append(span);
  let input;
  if (Array.isArray(parameter.options) && parameter.options.length) {
    input = document.createElement('select');
    for (const optionValue of parameter.options) input.append(new Option(String(optionValue), String(optionValue)));
    input.value = String(parameter.value ?? parameter.options[0]);
  } else {
    input = document.createElement('input');
    if (type === 'number' || typeof parameter.value === 'number') {
      input.type = 'number'; if (Number.isFinite(parameter.min)) input.min = String(parameter.min); if (Number.isFinite(parameter.max)) input.max = String(parameter.max); if (Number.isFinite(parameter.step)) input.step = String(parameter.step); input.value = String(parameter.value ?? 0);
    } else if (/color/i.test(name) && /^#[0-9a-f]{6}$/i.test(String(parameter.value || ''))) { input.type = 'color'; input.value = String(parameter.value); }
    else { input.type = 'text'; input.value = String(parameter.value ?? ''); input.maxLength = 500; }
  }
  input.name = name; label.append(input); return label;
}

function values() {
  const params = {};
  for (const parameter of definition.parameters || []) {
    const input = form.elements.namedItem(parameter.name); if (!input) continue;
    if (input.type === 'checkbox') params[parameter.name] = input.checked;
    else if (input.type === 'number') params[parameter.name] = Number(input.value);
    else params[parameter.name] = input.value;
  }
  return params;
}

async function load() {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new Error('This configurator link is invalid.');
  definition = await json('/api/public/configurator', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({token}) });
  title.textContent = definition.skuName || definition.name || 'Product configurator';
  sku.textContent = definition.skuCode ? `SKU ${definition.skuCode}` : '';
  fields.replaceChildren(...(definition.parameters || []).map(inputFor));
  form.hidden = false;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault(); submit.disabled = true; message.textContent = '';
  try {
    const created = await json('/api/public/configurator/jobs', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ token, parameters:values(), orderRef:orderRef.value, customerLabel:customer.value, quantity:Number(quantity.value)||1 }) });
    form.hidden = true; result.hidden = false;
    result.innerHTML = `<strong>Request submitted</strong><p>Production job <code>${String(created.jobId).slice(0,8)}</code> was created for ${created.skuCode || 'this product'}. The seller will handle generation and printing.</p>`;
  } catch (error) { message.textContent = error.message; }
  finally { submit.disabled = false; }
});

load().catch((error) => { title.textContent = 'Configurator unavailable'; sku.textContent = error.message; });
