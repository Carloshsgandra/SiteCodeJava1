export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function formatNumber(value) {
  return new Intl.NumberFormat('pt-BR').format(Number(value) || 0);
}

export function formatDate(value, options = { day: '2-digit', month: 'short' }) {
  return new Intl.DateTimeFormat('pt-BR', options).format(new Date(value));
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function percent(value, total) {
  return total ? Math.round((value / total) * 100) : 0;
}

export function routeParts() {
  const raw = location.hash.replace(/^#\/?/, '') || 'dashboard';
  const [path, queryString = ''] = raw.split('?');
  return {
    path,
    parts: path.split('/').filter(Boolean),
    query: new URLSearchParams(queryString),
  };
}

export function go(route) {
  location.hash = `#/${String(route).replace(/^\//, '')}`;
}

export function toast(message, type = 'success') {
  const region = document.getElementById('toast-region');
  const element = document.createElement('div');
  element.className = `toast ${type}`;
  element.textContent = message;
  region.append(element);
  setTimeout(() => element.remove(), 3600);
}

export function openModal(content, onMount) {
  const root = document.getElementById('modal');
  root.innerHTML = content;
  root.hidden = false;
  root.addEventListener('click', (event) => {
    if (event.target === root || event.target.closest('[data-close-modal]')) closeModal();
  }, { once: true });
  onMount?.(root);
  root.querySelector('input, textarea, select, button')?.focus();
}

export function closeModal() {
  const root = document.getElementById('modal');
  root.hidden = true;
  root.innerHTML = '';
}

export function downloadFile(name, content, type = 'application/json') {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([content], { type }));
  link.download = name;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function copyText(text) {
  return navigator.clipboard.writeText(text);
}

export function dayKey(date = new Date()) {
  return new Date(date).toISOString().slice(0, 10);
}

export function seededIndex(seed, length) {
  let hash = 2166136261;
  for (const char of String(seed)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % Math.max(1, length);
}

export function normalizeAnswer(value) {
  return String(value ?? '')
    .trim()
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

export function daysAgo(number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - number);
  return date;
}

export function unique(values) {
  return [...new Set(values)];
}
