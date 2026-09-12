window.addEventListener('error', (event) => {
  const message = event.error?.message || event.message;
  const target = document.querySelector('#viewerMessage');
  if (target && message && target.textContent === 'Opening workspace…') target.textContent = `Startup error: ${message}`;
});
window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason?.message || String(event.reason || 'Unknown error');
  const target = document.querySelector('#viewerMessage');
  if (target && target.textContent === 'Opening workspace…') target.textContent = `Startup error: ${message}`;
});
