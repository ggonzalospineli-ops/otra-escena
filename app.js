'use strict';

/* ============================================================
   Otra Escena — consultorio personal
   Todo se guarda cifrado (AES-GCM, clave derivada con PBKDF2)
   en el propio dispositivo. No hay servidor ni nube.
   ============================================================ */

/* ---------- Personalización ---------- */
const DEDICATORIA = {
  texto: 'Nico, espero que esta herramienta junto al consultorio te sean dos potencias de gran ayuda.\nTe quiero.',
  firma: 'Tu hermano, Gonza',
};

const QUOTES = [
  { t: 'Donde Ello era, Yo debo advenir.', o: 'Wo Es war, soll Ich werden.', a: 'Freud', s: 'Nuevas conferencias de introducción al psicoanálisis, 1933' },
  { t: 'La interpretación de los sueños es la vía regia hacia el conocimiento de lo inconsciente en la vida anímica.', a: 'Freud', s: 'La interpretación de los sueños, 1900' },
  { t: 'El yo no es el amo en su propia casa.', a: 'Freud', s: 'Una dificultad del psicoanálisis, 1917' },
  { t: 'Las palabras eran originariamente ensalmos, y la palabra conserva todavía hoy mucho de su antiguo poder ensalmador.', a: 'Freud', s: 'Conferencias de introducción al psicoanálisis, 1916-17' },
  { t: 'Gobernar, educar, analizar: las tres profesiones imposibles.', a: 'Freud', s: 'Análisis terminable e interminable, 1937 (paráfrasis)' },
  { t: 'Recordar, repetir y reelaborar.', a: 'Freud', s: '1914' },
  { t: 'El psicoanálisis es, en esencia, una cura por amor.', a: 'Freud', s: 'Carta a Jung, 1906' },
  { t: 'El inconsciente está estructurado como un lenguaje.', a: 'Lacan', s: 'Seminario 11' },
  { t: 'El deseo del hombre es el deseo del Otro.', a: 'Lacan', s: 'Seminario 11' },
  { t: 'Amar es dar lo que no se tiene.', a: 'Lacan', s: 'Seminario 8, La transferencia' },
  { t: 'De lo único de lo que se puede ser culpable es de haber cedido en su deseo.', a: 'Lacan', s: 'Seminario 7, La ética del psicoanálisis' },
  { t: 'La verdad tiene estructura de ficción.', a: 'Lacan', s: 'Seminario 7' },
  { t: 'El analista no se autoriza sino de sí mismo.', a: 'Lacan', s: 'Proposición del 9 de octubre de 1967' },
  { t: 'El inconsciente es el discurso del Otro.', a: 'Lacan', s: 'Escritos' },
  { t: 'No retroceder ante la psicosis.', a: 'Lacan', s: 'Apertura de la Sección Clínica, 1977' },
  { t: 'Sólo el amor permite al goce condescender al deseo.', a: 'Lacan', s: 'Seminario 10, La angustia' },
];

const EMPTY_TODAY = [
  'Sin sesiones hoy. Buen día para releer el tomo XIII.',
  'Agenda libre. ¿Un museo?',
  'Nada agendado. El inconsciente no se toma vacaciones, vos sí.',
  'Día sin pacientes. Siempre volver a Madrid, aunque sea en un libro.',
];

const ESTADOS = { programada: 'Programada', realizada: 'Realizada', ausente: 'Ausente', cancelada: 'Cancelada' };
const ESTADO_BADGE = { programada: 'info', realizada: 'ok', ausente: 'warn', cancelada: '' };
const MEDIOS = { efectivo: 'Efectivo', transferencia: 'Transferencia', otro: 'Otro' };
const MODALIDADES = { presencial: 'Presencial', online: 'Online' };

const ICONS = {
  inicio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
  agenda: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  pacientes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17c0-2.5 2.5-4 5-4h6c3 0 5 1.5 5 4v2H3z"/><path d="M6 13V9a3 3 0 0 1 3-3h0"/><circle cx="15" cy="7.5" r="3"/></svg>',
  honorarios: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6.5 9.5v.01M17.5 14.5v.01"/></svg>',
  buscar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg>',
  ajustes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
};

const NAV = [
  ['inicio', 'Inicio'], ['agenda', 'Agenda'], ['pacientes', 'Pacientes'],
  ['honorarios', 'Honorarios'], ['buscar', 'Buscar'], ['ajustes', 'Ajustes'],
];

/* ---------- Utilidades ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYmd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const startOfWeek = d => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); return addDays(x, -((x.getDay() + 6) % 7)); };
const fmtFecha = (s, opts = { weekday: 'long', day: 'numeric', month: 'long' }) => parseYmd(s).toLocaleDateString('es-AR', opts);
const norm = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const byWhen = (a, b) => (a.fecha + (a.hora || '')).localeCompare(b.fecha + (b.hora || ''));
const byName = (a, b) => fullName(a).localeCompare(fullName(b), 'es');
const todayStr = () => ymd(new Date());

function money(n) {
  try {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: db.settings.moneda || 'ARS', maximumFractionDigits: 0 }).format(n || 0);
  } catch { return '$ ' + Math.round(n || 0); }
}
function dayOfYear(d = new Date()) { return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5); }
function quoteOfDay() { return QUOTES[dayOfYear() % QUOTES.length]; }
function quoteHTML(q, cls = 'cita') {
  return `<blockquote class="${cls}">“${esc(q.t)}”${q.o ? `<span class="orig">${esc(q.o)}</span>` : ''}<cite>${esc(q.a)} · ${esc(q.s)}</cite></blockquote>`;
}

/* ---------- Cifrado ---------- */
const te = new TextEncoder(), td = new TextDecoder();
const KDF_ITER = 600000;
function b64(buf) {
  const b = new Uint8Array(buf); let s = '';
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
  return btoa(s);
}
function unb64(s) { const bin = atob(s); const b = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i); return b; }
async function deriveKey(pass, saltB64, iter) {
  const base = await crypto.subtle.importKey('raw', te.encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: unb64(saltB64), iterations: iter, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
function newKdf() { return { name: 'PBKDF2-SHA256', iter: KDF_ITER, salt: b64(crypto.getRandomValues(new Uint8Array(16))) }; }
async function seal(obj, k, kdf) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, te.encode(JSON.stringify(obj)));
  return { app: 'otra-escena', v: 1, kdf, iv: b64(iv), ct: b64(ct), savedAt: new Date().toISOString() };
}
async function unseal(vault, pass) {
  const k = await deriveKey(pass, vault.kdf.salt, vault.kdf.iter);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(vault.iv) }, k, unb64(vault.ct));
  return { data: JSON.parse(td.decode(pt)), key: k };
}

/* ---------- Almacenamiento (IndexedDB) ---------- */
const idb = {
  _db: null,
  conn() {
    if (this._db) return Promise.resolve(this._db);
    return new Promise((res, rej) => {
      const r = indexedDB.open('otra-escena', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('kv');
      r.onsuccess = () => res(this._db = r.result);
      r.onerror = () => rej(r.error);
    });
  },
  async get(k) {
    const d = await this.conn();
    return new Promise((res, rej) => { const r = d.transaction('kv').objectStore('kv').get(k); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  },
  async set(k, v) {
    const d = await this.conn();
    return new Promise((res, rej) => { const t = d.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = () => res(); t.onerror = () => rej(t.error); });
  },
};

/* ---------- Estado ---------- */
let db = null;      // datos descifrados (solo en memoria mientras está desbloqueado)
let key = null;     // CryptoKey
let kdf = null;     // { salt, iter } del vault actual
let saveTimer = null, saving = Promise.resolve();
let lastActivity = Date.now();

function defaultDB(nombre, titulo) {
  return {
    v: 1,
    settings: { nombre, titulo, moneda: 'ARS', honorario: 0, duracion: 45, autolock: 15, iniciales: false, lastBackup: null },
    patients: [],
    sessions: [],
    borrador: null,
  };
}
function migrate(d) {
  const base = defaultDB('', '');
  d.settings = { ...base.settings, ...(d.settings || {}) };
  d.patients ||= []; d.sessions ||= [];
  if (d.borrador === undefined) d.borrador = null;
  return d;
}

function save() { clearTimeout(saveTimer); saveTimer = setTimeout(persist, 250); }
function persist() {
  clearTimeout(saveTimer);
  if (!db || !key) return saving;
  const snapshot = db, k = key, meta = kdf;
  saving = saving.then(async () => idb.set('vault', await seal(snapshot, k, meta))).catch(err => {
    console.error(err); toast('⚠️ No se pudo guardar. Exportá un backup.');
  });
  return saving;
}

/* ---------- Helpers de dominio ---------- */
const fullName = p => p ? `${p.nombre || ''} ${p.apellido || ''}`.trim() || p.alias || 'Sin nombre' : 'Paciente eliminado';
function initialsOf(p) {
  if (!p) return '?';
  const a = (p.nombre || p.alias || '?').trim()[0] || '?';
  const b = (p.apellido || '').trim()[0] || '';
  return (a + b).toUpperCase();
}
const patientById = id => db.patients.find(p => p.id === id);
const displayName = p => (db.settings.iniciales && p ? initialsOf(p).split('').join('. ') + '.' : fullName(p));
const isCobrable = s => (s.estado === 'realizada' || s.estado === 'ausente') && Number(s.honorario) > 0;
const isPendiente = s => isCobrable(s) && !s.pagado;
const sessionsOf = pid => db.sessions.filter(s => s.patientId === pid);
const sessionsOn = f => db.sessions.filter(s => s.fecha === f).sort(byWhen);
function splitSigs(str) { return [...new Set(String(str || '').split(',').map(x => x.trim()).filter(Boolean))]; }
function sigCounts(pid) {
  const m = new Map();
  for (const s of pid ? sessionsOf(pid) : db.sessions) for (const g of s.significantes || []) {
    const k = norm(g); const e = m.get(k) || { label: g, n: 0 }; e.n++; m.set(k, e);
  }
  return [...m.values()].sort((a, b) => b.n - a.n || a.label.localeCompare(b.label, 'es'));
}
function deudaDe(pid) { return sessionsOf(pid).filter(isPendiente).reduce((t, s) => t + Number(s.honorario), 0); }

/* ---------- UI genérica ---------- */
let toastTimer;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

let modalGuard = null;
function openModal(html, { narrow = false, mount, guard } = {}) {
  const root = $('#modal-root');
  root.innerHTML = `<div class="overlay"><div class="modal ${narrow ? 'narrow' : ''}" role="dialog" aria-modal="true">${html}</div></div>`;
  modalGuard = guard || null;
  const m = $('.modal', root);
  mount?.(m);
  const first = $('input:not([type=hidden]):not([type=checkbox]), select, textarea', m);
  if (first && !('ontouchstart' in window)) first.focus();
  return m;
}
function closeModal() { $('#modal-root').innerHTML = ''; modalGuard = null; }
async function requestCloseModal() {
  if (modalGuard && modalGuard() && !(await confirmDialog('Hay cambios sin guardar. ¿Descartarlos?', 'Descartar'))) return;
  closeModal();
}
function confirmDialog(msg, okText = 'Aceptar', danger = true) {
  return new Promise(resolve => {
    const prevGuard = modalGuard;
    const holder = document.createElement('div');
    holder.className = 'confirm-holder';
    holder.innerHTML = `<div class="overlay" style="z-index:70"><div class="modal narrow" role="alertdialog" aria-modal="true">
      <p style="font-family:var(--serif);font-size:1.25rem;margin:4px 0 0">${esc(msg)}</p>
      <div class="modal-foot"><span class="spacer"></span>
        <button class="btn ghost" data-r="0">Cancelar</button>
        <button class="btn ${danger ? 'danger' : 'primary'}" data-r="1">${esc(okText)}</button></div></div></div>`;
    document.body.appendChild(holder);
    holder.addEventListener('click', e => {
      const b = e.target.closest('[data-r]'); if (!b) return;
      holder.remove(); modalGuard = prevGuard; resolve(b.dataset.r === '1');
    });
  });
}
function formDirty(form) {
  return $$('input, select, textarea', form).some(el =>
    el.type === 'checkbox' ? el.checked !== el.defaultChecked
      : el.tagName === 'SELECT' ? el.selectedIndex !== Math.max(0, [...el.options].findIndex(o => o.defaultSelected))
        : el.value !== el.defaultValue);
}

async function shareOrDownload(filename, text, type) {
  const blob = new Blob([text], { type });
  const file = new File([blob], filename, { type });
  if (navigator.canShare && 'ontouchstart' in window && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: filename }); return true; } catch (e) { if (e.name === 'AbortError') return false; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  return true;
}
function pickFile(accept) {
  return new Promise(resolve => {
    const i = document.createElement('input'); i.type = 'file'; i.accept = accept;
    i.onchange = () => resolve(i.files[0] || null); i.click();
  });
}

/* ---------- Bloqueo / desbloqueo ---------- */
async function boot() {
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => { });
  }
  navigator.storage?.persist?.().catch(() => { });
  if (!window.crypto?.subtle) {
    $('#app').innerHTML = `<div class="lock"><div class="lock-card"><h1>Otra Escena</h1><p class="lock-sub">Este navegador no permite el cifrado necesario. Abrí la app desde su dirección https.</p></div></div>`;
    return;
  }
  let vault = null;
  try { vault = await idb.get('vault'); }
  catch { lockShell(`<h1>Otra Escena</h1><p class="lock-sub">No se puede acceder al almacenamiento. Si estás en modo incógnito, abrí la app en una ventana normal.</p>`); return; }
  vault ? showLock() : showWelcome();
}

function lockShell(inner) {
  $('#app').innerHTML = `<div class="lock"><div class="lock-card">${inner}</div></div>`;
}

function showWelcome() {
  lockShell(`
    <div class="lock-moon">☾</div>
    <p class="lock-sub" style="margin-bottom:18px">Un regalo para vos</p>
    <div class="dedicatoria">${esc(DEDICATORIA.texto)}</div>
    <div class="dedicatoria-firma">— ${esc(DEDICATORIA.firma)}</div>
    <div style="margin-top:34px;display:flex;flex-direction:column;gap:10px">
      <button class="btn primary" data-act="setup">Empezar</button>
    </div>`);
}

function showSetup() {
  lockShell(`
    <h1>Otra Escena</h1>
    <p class="lock-sub">Tu consultorio, cifrado y solo tuyo.</p>
    <form id="setup">
      <div class="grid2">
        <label>¿Cómo te llamo? <input name="nombre" value="Nico" required autocomplete="off"></label>
        <label>Título <input name="titulo" value="Lic. Spinelli" autocomplete="off"></label>
      </div>
      <label>Contraseña <input name="p1" type="password" minlength="8" required autocomplete="new-password" placeholder="Mínimo 8 caracteres"></label>
      <label>Repetir contraseña <input name="p2" type="password" minlength="8" required autocomplete="new-password"></label>
      <div class="warn-box">Tus notas se cifran con esta contraseña. <b>Nadie puede recuperarla</b>: si la olvidás, los datos no se pueden abrir. Anotala en un lugar seguro y hacé backups.</div>
      <label class="check"><input type="checkbox" name="ok" required> Entiendo que la contraseña no se puede recuperar.</label>
      <button class="btn primary">Crear mi consultorio</button>
      <p class="err" id="err"></p>
      <button type="button" class="btn ghost" data-act="restore-first">Tengo un backup: restaurar</button>
    </form>`);
  $('#setup').addEventListener('submit', async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    if (f.get('p1') !== f.get('p2')) { $('#err').textContent = 'Las contraseñas no coinciden.'; return; }
    $('#err').textContent = 'Preparando el cifrado…';
    kdf = newKdf();
    key = await deriveKey(f.get('p1'), kdf.salt, kdf.iter);
    db = defaultDB(f.get('nombre').trim() || 'Nico', f.get('titulo').trim());
    await persist();
    startSession();
  });
}

function showLock(msg = '') {
  const q = quoteOfDay();
  lockShell(`
    <div class="lock-moon">☾</div>
    <h1>Otra Escena</h1>
    <p class="lock-sub">${esc(msg || 'Lo que se dice acá, queda acá.')}</p>
    <form id="unlock">
      <label class="sr" for="pw">Contraseña</label>
      <input id="pw" type="password" autocomplete="current-password" placeholder="Contraseña" required>
      <button class="btn primary">Entrar</button>
      <p class="err" id="err"></p>
    </form>
    <div class="lock-quote">“${esc(q.t)}”<cite>${esc(q.a)}</cite></div>`);
  const pw = $('#pw'); setTimeout(() => pw.focus(), 50);
  $('#unlock').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('#unlock button'); btn.disabled = true; $('#err').textContent = 'Abriendo…';
    try {
      const vault = await idb.get('vault');
      const r = await unseal(vault, pw.value);
      db = migrate(r.data); key = r.key; kdf = vault.kdf;
      startSession();
    } catch {
      $('#err').textContent = 'Contraseña incorrecta.';
      $('.lock-card').classList.remove('shake'); void $('.lock-card').offsetWidth; $('.lock-card').classList.add('shake');
      pw.select(); btn.disabled = false;
    }
  });
}

function startSession() {
  lastActivity = Date.now();
  $('#app').innerHTML = `
    <div class="shell">
      <nav class="nav" aria-label="Secciones">
        <div class="brand"><span class="brand-moon">☾</span><span>Otra Escena</span></div>
        ${NAV.map(([r, l]) => `<a href="#/${r}" data-route="${r}">${ICONS[r]}<span>${l}</span></a>`).join('')}
        <button class="nav-lock" data-act="lock">${ICONS.lock}<span>Bloquear</span></button>
      </nav>
      <main id="view" tabindex="-1"></main>
    </div>`;
  if (!location.hash) location.hash = '#/inicio'; else render();
}

async function lock(reason = '') {
  if (!db) return;
  const form = $('#sform');
  if (form && formDirty(form)) db.borrador = { ...readSessionForm(form), _id: form.dataset.id || null };
  await persist();
  db = null; key = null;
  closeModal();
  $$('.confirm-holder').forEach(h => h.remove());
  showLock(reason);
}

['pointerdown', 'keydown', 'input', 'scroll', 'touchstart'].forEach(ev =>
  addEventListener(ev, () => { lastActivity = Date.now(); }, { passive: true, capture: true }));
setInterval(() => {
  if (db && db.settings.autolock > 0 && Date.now() - lastActivity > db.settings.autolock * 60000) lock('Se bloqueó por inactividad.');
}, 15000);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') persist();
  else if (db && db.settings.autolock > 0 && Date.now() - lastActivity > db.settings.autolock * 60000) lock('Se bloqueó por inactividad.');
});
addEventListener('pagehide', () => persist());

/* ---------- Router ---------- */
function parseRoute() {
  const [path, query = ''] = location.hash.replace(/^#\/?/, '').split('?');
  const [route, ...args] = (path || 'inicio').split('/');
  return { route, args: args.map(decodeURIComponent), q: new URLSearchParams(query) };
}
let lastRoute = '';
function render() {
  if (!db) return;
  const { route, args, q } = parseRoute();
  const r = VIEWS[route] ? route : 'inicio';
  $$('.nav a').forEach(a => a.classList.toggle('active', a.dataset.route === r || (r === 'paciente' && a.dataset.route === 'pacientes')));
  const view = $('#view');
  view.innerHTML = VIEWS[r].html(args, q);
  VIEWS[r].mount?.(view, args, q);
  const full = location.hash;
  if (full.split('?')[0] !== lastRoute) { window.scrollTo(0, 0); lastRoute = full.split('?')[0]; }
}
addEventListener('hashchange', render);

/* ---------- Componentes ---------- */
function sessionBadges(s, { withEstado = true } = {}) {
  const b = [];
  if (withEstado) b.push(`<span class="badge ${ESTADO_BADGE[s.estado]}">${ESTADOS[s.estado]}</span>`);
  b.push(`<span class="badge">${MODALIDADES[s.modalidad] || 'Presencial'}</span>`);
  if (isCobrable(s)) b.push(s.pagado ? `<span class="badge ok">Cobrada</span>` : `<span class="badge warn">Debe ${money(s.honorario)}</span>`);
  return b.join('');
}
function sessionRow(s, { showPatient = true, showDate = false, snippet = false, actions = true } = {}) {
  const p = patientById(s.patientId);
  const title = showPatient ? displayName(p) : fmtFecha(s.fecha, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const acts = [];
  if (actions && s.estado === 'programada' && s.modalidad === 'online' && s.link && s.fecha >= todayStr()) acts.push(`<a class="btn small" href="${esc(s.link)}" target="_blank" rel="noopener">Entrar</a>`);
  if (actions && s.estado === 'programada' && s.fecha <= todayStr()) acts.push(`<button class="btn small" data-act="mark-done" data-id="${s.id}">✓ Realizada</button>`);
  if (actions && isPendiente(s)) acts.push(`<button class="btn small" data-act="cobrar" data-id="${s.id}">Cobrar</button>`);
  const snip = snippet && (s.notas || s.suenos) ? `<span class="srow-snip">${esc((s.notas || s.suenos).slice(0, 220))}</span>` : '';
  return `<div class="srow estado-${s.estado}">
    <button class="srow-open" data-act="edit-session" data-id="${s.id}">
      <span class="srow-time">${showDate && showPatient ? `<small>${fmtFecha(s.fecha, { day: 'numeric', month: 'short' })}</small>` : ''}${esc(s.hora || '—')}</span>
      <span class="srow-main"><strong>${esc(title)}</strong><span class="srow-meta">${sessionBadges(s)}</span>${snip}</span>
    </button>
    ${acts.length ? `<div class="srow-actions">${acts.join('')}</div>` : ''}
  </div>`;
}

/* ---------- Vistas ---------- */
const VIEWS = {};

VIEWS.inicio = {
  html() {
    const now = new Date(), h = now.getHours(), today = todayStr();
    const [phase, emoji, saludo] =
      h >= 6 && h < 12 ? ['manana', '🌤️', 'Buen día'] :
        h >= 12 && h < 17 ? ['dia', '☀️', 'Buenas tardes'] :
          h >= 17 && h < 20 ? ['tarde', '🌥️', 'Buenas tardes'] : ['noche', '🌙', 'Buenas noches'];
    const hoy = sessionsOn(today);
    const sinRegistrar = db.sessions.filter(s => s.estado === 'programada' && s.fecha < today).sort(byWhen).reverse();
    const ws = ymd(startOfWeek(now)), we = ymd(addDays(startOfWeek(now), 6));
    const semana = db.sessions.filter(s => s.fecha >= ws && s.fecha <= we && s.estado !== 'cancelada').length;
    const pendiente = db.sessions.filter(isPendiente).reduce((t, s) => t + Number(s.honorario), 0);
    const activos = db.patients.filter(p => p.activo).length;
    const proximas = db.sessions.filter(s => s.fecha > today && s.estado === 'programada').sort(byWhen).slice(0, 5);
    const lb = db.settings.lastBackup;
    const needBackup = (db.sessions.length + db.patients.length) > 0 && (!lb || (Date.now() - new Date(lb)) > 14 * 864e5);

    const semanaDias = [...Array(7)].map((_, i) => addDays(startOfWeek(now), i));
    const weekPanel = `<div class="card week-mini">
        <div class="section-title" style="margin-bottom:6px"><h3>Esta semana</h3><span class="spacer"></span><a class="btn small ghost" href="#/agenda">Agenda ›</a></div>
        ${semanaDias.map(d => {
      const f = ymd(d), ss = sessionsOn(f).filter(s => s.estado !== 'cancelada');
      return `<a class="wm-day ${f === today ? 'today' : ''} ${f < today ? 'past' : ''}" href="#/agenda/${f}">
            <span class="wm-name">${d.toLocaleDateString('es-AR', { weekday: 'short' })} ${d.getDate()}</span>
            <span class="wm-list">${ss.length ? ss.map(s => `<span><b>${esc(s.hora || '—')}</b> ${esc(displayName(patientById(s.patientId)))}</span>`).join('') : '<span class="muted">—</span>'}</span>
          </a>`;
    }).join('')}
      </div>`;

    return `
      <section class="hero sky-${phase}">
        <div class="hero-top"><span class="hero-emoji">${emoji}</span>
          <button class="icon-btn" data-act="lock" title="Bloquear" aria-label="Bloquear">${ICONS.lock}</button></div>
        <h1>${saludo}, ${esc(db.settings.nombre || 'Nico')}</h1>
        <p class="fecha">${fmtFecha(today)}${db.settings.titulo ? ' · ' + esc(db.settings.titulo) : ''}</p>
      </section>

      <div class="home">
        <div class="home-top">
          ${quoteHTML(quoteOfDay())}
          ${db.borrador ? `<div class="banner"><p>Quedó un borrador de sesión sin guardar cuando se bloqueó la app.</p>
            <button class="btn small primary" data-act="restore-draft">Recuperar</button><button class="btn small ghost" data-act="discard-draft">Descartar</button></div>` : ''}
          ${needBackup ? `<div class="banner"><p>${lb ? 'Hace más de dos semanas que no hacés un backup.' : 'Todavía no hiciste ningún backup.'} Si se pierde o se rompe el dispositivo, es la única copia.</p>
            <button class="btn small primary" data-act="export">Hacer backup</button></div>` : ''}
        </div>

        <div class="home-main">
          <div class="section">
            <div class="section-title"><h2>Hoy</h2><small>${hoy.length ? hoy.length + (hoy.length === 1 ? ' sesión' : ' sesiones') : ''}</small>
              <span class="spacer"></span><button class="btn small primary" data-act="new-session" data-fecha="${today}">+ Sesión</button></div>
            ${hoy.length ? `<div class="slist">${hoy.map(s => sessionRow(s)).join('')}</div>`
        : `<p class="empty">${esc(EMPTY_TODAY[dayOfYear() % EMPTY_TODAY.length])}</p>`}
          </div>

          ${sinRegistrar.length ? `<div class="section">
            <div class="section-title"><h2>Para completar</h2><small>sesiones pasadas que siguen como programadas</small></div>
            <div class="slist">${sinRegistrar.slice(0, 6).map(s => sessionRow(s, { showDate: true })).join('')}</div></div>` : ''}

          ${proximas.length ? `<div class="section"><div class="section-title"><h2>Próximas</h2></div>
            <div class="slist">${proximas.map(s => sessionRow(s, { showDate: true })).join('')}</div></div>` : ''}

          ${!db.patients.length ? `<div class="section card"><h3>Para empezar</h3>
            <p class="muted">Cargá tu primer paciente. Después vas a poder agendar sesiones, tomar notas y llevar los honorarios.</p>
            <button class="btn primary" data-act="new-patient">+ Nuevo paciente</button></div>` : ''}
        </div>

        <div class="home-side">
          <div class="stats">
            <div class="stat"><div class="v">${semana}</div><div class="l">sesiones esta semana</div></div>
            <div class="stat"><div class="v">${activos}</div><div class="l">pacientes en tratamiento</div></div>
            <div class="stat ${pendiente ? 'warn' : 'ok'}"><div class="v">${money(pendiente)}</div><div class="l">pendiente de cobro</div></div>
          </div>
          ${weekPanel}
        </div>
      </div>
    `;
  },
};

VIEWS.agenda = {
  html(args) {
    const base = args[0] ? parseYmd(args[0]) : new Date();
    const ws = startOfWeek(base), today = todayStr();
    const days = [...Array(7)].map((_, i) => addDays(ws, i));
    const prev = ymd(addDays(ws, -7)), next = ymd(addDays(ws, 7));
    const label = `${days[0].toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} – ${days[6].toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    return `
      <div class="page-head"><h1>Agenda</h1>
        <div class="month-nav">
          <a class="icon-btn" href="#/agenda/${prev}" aria-label="Semana anterior">‹</a>
          <b style="min-width:auto;font-size:1.1rem;text-transform:none">${label}</b>
          <a class="icon-btn" href="#/agenda/${next}" aria-label="Semana siguiente">›</a>
        </div>
        <a class="btn small" href="#/agenda">Hoy</a>
      </div>
      <div class="week">
        ${days.map(d => {
      const f = ymd(d), ss = sessionsOn(f);
      return `<div class="day ${f === today ? 'today' : ''}">
            <div class="day-head"><b>${d.toLocaleDateString('es-AR', { weekday: 'short' })}</b><span>${d.getDate()}/${d.getMonth() + 1}</span></div>
            ${ss.map(s => `<button class="ev estado-${s.estado}" data-act="edit-session" data-id="${s.id}">
              <b>${esc(s.hora || '—')}</b> ${esc(displayName(patientById(s.patientId)))}
              <span class="on">${s.modalidad === 'online' ? 'Online' : 'Presencial'}${s.duracion ? ' · ' + s.duracion + "'" : ''}${s.estado !== 'programada' ? ' · ' + ESTADOS[s.estado] : ''}</span></button>`).join('')}
            <button class="btn small ghost add" data-act="new-session" data-fecha="${f}">+</button>
          </div>`;
    }).join('')}
      </div>`;
  },
};

VIEWS.pacientes = {
  html(args, q) {
    const showAlta = q.get('alta') === '1';
    const list = db.patients.filter(p => showAlta || p.activo).sort(byName);
    const today = todayStr();
    return `
      <div class="page-head"><h1>Pacientes</h1>
        <button class="btn primary" data-act="new-patient">+ Nuevo paciente</button></div>
      <input class="search" id="pfilter" type="search" placeholder="Buscar por nombre…" autocomplete="off">
      <div class="row" style="margin-top:10px">
        <a class="btn small ${showAlta ? 'primary' : 'ghost'}" href="#/pacientes${showAlta ? '' : '?alta=1'}">${showAlta ? 'Mostrando también altas' : 'Mostrar también altas'}</a>
        <span class="muted" style="font-size:.85rem">${db.patients.filter(p => p.activo).length} en tratamiento</span>
      </div>
      ${list.length ? `<div class="plist">${list.map(p => {
      const next = sessionsOf(p.id).filter(s => s.fecha >= today && s.estado === 'programada').sort(byWhen)[0];
      const deuda = deudaDe(p.id);
      return `<a class="prow ${p.activo ? '' : 'alta'}" href="#/paciente/${p.id}" data-name="${esc(norm(fullName(p) + ' ' + (p.alias || '')))}">
          <span class="avatar">${esc(initialsOf(p))}</span>
          <span class="info"><b>${esc(fullName(p))}</b>
            <small>${next ? 'Próxima: ' + fmtFecha(next.fecha, { weekday: 'short', day: 'numeric', month: 'short' }) + (next.hora ? ' ' + next.hora : '') : (p.activo ? (MODALIDADES[p.modalidad] || '') + (p.frecuencia ? ' · ' + esc(p.frecuencia) : '') : 'Alta')}</small></span>
          ${deuda ? `<span class="badge warn">${money(deuda)}</span>` : ''}
        </a>`;
    }).join('')}</div>` : `<p class="empty">${db.patients.length ? 'No hay pacientes en tratamiento.' : 'Todavía no cargaste pacientes.'}</p>`}`;
  },
  mount(view) {
    const inp = $('#pfilter', view);
    inp?.addEventListener('input', () => {
      const v = norm(inp.value.trim());
      $$('.prow', view).forEach(r => { r.hidden = v && !r.dataset.name.includes(v); });
    });
  },
};

VIEWS.paciente = {
  html([id]) {
    const p = patientById(id);
    if (!p) return `<a class="back" href="#/pacientes">‹ Pacientes</a><p class="empty">Paciente no encontrado.</p>`;
    const ss = sessionsOf(id).sort(byWhen).reverse();
    const hechas = ss.filter(s => s.estado === 'realizada').length;
    const aus = ss.filter(s => s.estado === 'ausente').length;
    const deuda = deudaDe(id);
    const sigs = sigCounts(id);
    const edad = p.nacimiento ? Math.floor((Date.now() - parseYmd(p.nacimiento)) / (365.25 * 864e5)) : null;
    const field = (l, v, cls = '') => v ? `<div class="${cls}"><small>${l}</small><span class="prewrap">${v}</span></div>` : '';
    return `
      <a class="back" href="#/pacientes">‹ Pacientes</a>
      <div class="page-head">
        <span class="avatar" style="width:56px;height:56px;font-size:1.5rem">${esc(initialsOf(p))}</span>
        <h1>${esc(fullName(p))}${p.activo ? '' : ' <span class="badge">Alta</span>'}</h1>
        <div class="row">
          <button class="btn primary" data-act="new-session" data-patient="${p.id}">+ Sesión</button>
          <button class="btn" data-act="edit-patient" data-id="${p.id}">Editar</button>
          <button class="btn ghost" data-act="export-history" data-id="${p.id}">Exportar historia</button>
        </div>
      </div>

      <div class="stats">
        <div class="stat"><div class="v">${hechas}</div><div class="l">sesiones realizadas</div></div>
        <div class="stat"><div class="v">${aus}</div><div class="l">ausencias</div></div>
        <div class="stat ${deuda ? 'warn' : 'ok'}"><div class="v">${money(deuda)}</div><div class="l">saldo pendiente</div></div>
        <div class="stat"><div class="v">${p.inicio ? esc(fmtFecha(p.inicio, { month: 'short', year: 'numeric' })) : '—'}</div><div class="l">inicio del tratamiento</div></div>
      </div>

      <div class="section card ficha">
        ${field('Cómo lo llamo', esc(p.alias))}
        ${field('Edad', edad != null ? edad + ' años' : '')}
        ${field('Teléfono', p.telefono ? `<a href="tel:${esc(p.telefono)}">${esc(p.telefono)}</a> · <a href="https://wa.me/${esc(p.telefono.replace(/\D/g, ''))}" target="_blank" rel="noopener">WhatsApp</a>` : '')}
        ${field('Email', p.email ? `<a href="mailto:${esc(p.email)}">${esc(p.email)}</a>` : '')}
        ${field('Modalidad', esc(MODALIDADES[p.modalidad] || ''))}
        ${field('Frecuencia', esc(p.frecuencia))}
        ${field('Honorario por sesión', p.honorario ? money(p.honorario) : '')}
        ${field('Derivación', esc(p.derivacion))}
        ${field('Link de videollamada', p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.link)}</a>` : '', 'full')}
        ${field('Motivo de consulta', esc(p.motivo), 'full')}
        ${field('Notas generales', esc(p.notas), 'full')}
        ${!(p.alias || edad != null || p.telefono || p.email || p.motivo || p.notas || p.frecuencia) ? '<p class="muted full" style="margin:0">Sin datos de ficha todavía. Tocá “Editar” para completarla.</p>' : ''}
      </div>

      ${sigs.length ? `<div class="section"><div class="section-title"><h2>Significantes</h2><small>tocá uno para ver dónde aparece</small></div>
        <div class="chips">${sigs.map(g => `<a class="chip" href="#/buscar?q=${encodeURIComponent(g.label)}&p=${p.id}">${esc(g.label)}<small>${g.n}</small></a>`).join('')}</div></div>` : ''}

      <div class="section"><div class="section-title"><h2>Sesiones</h2><small>${ss.length}</small></div>
        ${ss.length ? `<div class="slist">${ss.map(s => sessionRow(s, { showPatient: false, snippet: true })).join('')}</div>` : '<p class="empty">Sin sesiones registradas.</p>'}
      </div>`;
  },
};

VIEWS.honorarios = {
  html(args) {
    const now = new Date();
    const ym = args[0] || `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
    const [y, m] = ym.split('-').map(Number);
    const prev = m === 1 ? `${y - 1}-12` : `${y}-${pad(m - 1)}`;
    const next = m === 12 ? `${y + 1}-01` : `${y}-${pad(m + 1)}`;
    const mes = db.sessions.filter(s => s.fecha.startsWith(ym) && isCobrable(s));
    const sum = arr => arr.reduce((t, s) => t + Number(s.honorario), 0);
    const fact = sum(mes), cob = sum(mes.filter(s => s.pagado)), pend = fact - cob;
    const porMedio = Object.keys(MEDIOS).map(k => [k, sum(mes.filter(s => s.pagado && (s.medio || 'otro') === k))]).filter(([, v]) => v);
    const porPac = new Map();
    for (const s of mes) {
      const e = porPac.get(s.patientId) || { n: 0, f: 0, c: 0 };
      e.n++; e.f += Number(s.honorario); if (s.pagado) e.c += Number(s.honorario);
      porPac.set(s.patientId, e);
    }
    const pendientes = db.sessions.filter(isPendiente).sort(byWhen);
    const mesLabel = new Date(y, m - 1, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    return `
      <div class="page-head"><h1>Honorarios</h1>
        <div class="month-nav">
          <a class="icon-btn" href="#/honorarios/${prev}" aria-label="Mes anterior">‹</a>
          <b>${mesLabel}</b>
          <a class="icon-btn" href="#/honorarios/${next}" aria-label="Mes siguiente">›</a>
        </div></div>
      <div class="stats">
        <div class="stat"><div class="v">${money(fact)}</div><div class="l">facturado (${mes.length} ${mes.length === 1 ? 'sesión' : 'sesiones'})</div></div>
        <div class="stat ok"><div class="v">${money(cob)}</div><div class="l">cobrado</div></div>
        <div class="stat ${pend ? 'warn' : ''}"><div class="v">${money(pend)}</div><div class="l">pendiente del mes</div></div>
        ${porMedio.map(([k, v]) => `<div class="stat"><div class="v">${money(v)}</div><div class="l">${MEDIOS[k].toLowerCase()}</div></div>`).join('')}
      </div>
      <p class="muted" style="font-size:.82rem;margin:8px 2px 0">Se cuentan las sesiones realizadas y las ausencias con honorario.</p>

      ${porPac.size ? `<div class="section card"><h3 style="margin-bottom:8px">Por paciente</h3><div class="table-wrap"><table>
        <thead><tr><th>Paciente</th><th class="num">Sesiones</th><th class="num">Facturado</th><th class="num">Cobrado</th><th class="num">Pendiente</th></tr></thead>
        <tbody>${[...porPac.entries()].sort((a, b) => b[1].f - a[1].f).map(([pid, e]) => `<tr>
          <td><a href="#/paciente/${pid}">${esc(displayName(patientById(pid)))}</a></td><td class="num">${e.n}</td>
          <td class="num">${money(e.f)}</td><td class="num">${money(e.c)}</td><td class="num">${e.f - e.c ? `<span class="badge warn">${money(e.f - e.c)}</span>` : '—'}</td></tr>`).join('')}
        </tbody></table></div></div>` : `<p class="empty">Sin sesiones cobrables este mes.</p>`}

      <div class="section"><div class="section-title"><h2>Pendiente de cobro</h2><small>todos los meses · ${money(sum(pendientes))}</small></div>
        ${pendientes.length ? `<div class="slist">${pendientes.map(s => sessionRow(s, { showDate: true })).join('')}</div>` : '<p class="empty">Todo cobrado. ✨</p>'}
      </div>`;
  },
};

function findRanges(text, q) {
  const nq = norm(q.trim()); if (!nq || !text) return [];
  let ns = ''; const map = [];
  for (let i = 0; i < text.length; i++) for (const ch of norm(text[i])) { ns += ch; map.push(i); }
  const r = []; let k = ns.indexOf(nq);
  while (k >= 0) { r.push([map[k], map[k + nq.length - 1] + 1]); k = ns.indexOf(nq, k + nq.length); }
  return r;
}
function snippetHTML(text, ranges, padN = 70) {
  let start = Math.max(0, ranges[0][0] - padN), end = Math.min(text.length, ranges[0][1] + padN * 2);
  if (start > 0) { const sp = text.lastIndexOf(' ', start); start = sp > 0 && ranges[0][0] - sp < padN * 1.5 ? sp + 1 : start; }
  if (end < text.length) { const sp = text.indexOf(' ', end); if (sp > 0 && sp - end < 25) end = sp; }
  let out = start > 0 ? '…' : '', pos = start;
  for (const [a, b] of ranges) {
    if (a < pos) continue; if (a >= end) break;
    out += esc(text.slice(pos, a)) + '<mark>' + esc(text.slice(a, Math.min(b, end))) + '</mark>'; pos = Math.min(b, end);
  }
  return out + esc(text.slice(pos, end)) + (end < text.length ? '…' : '');
}
function searchResults(q, pid) {
  if (!q.trim()) return `<p class="empty">Buscá una palabra en todas las notas, sueños, lapsus y significantes. No distingue mayúsculas ni tildes.</p>`;
  const fields = [['notas', 'Notas'], ['suenos', 'Sueños'], ['lapsus', 'Lapsus / actos fallidos'], ['significantes', 'Significantes']];
  const out = []; let total = 0;
  const ss = db.sessions.filter(s => !pid || s.patientId === pid).sort(byWhen).reverse();
  for (const s of ss) {
    const hits = [];
    for (const [f, l] of fields) {
      const text = f === 'significantes' ? (s.significantes || []).join(', ') : s[f];
      const r = findRanges(text, q);
      if (r.length) { hits.push(`<p><span class="field">${l}</span> ${snippetHTML(text, r)}</p>`); total += r.length; }
    }
    if (hits.length) out.push(`<button class="result" data-act="edit-session" data-id="${s.id}">
      <div class="rhead"><b>${esc(displayName(patientById(s.patientId)))}</b><span class="muted">${fmtFecha(s.fecha, { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>${hits.join('')}</button>`);
  }
  const pats = db.patients.filter(p => !pid || p.id === pid).flatMap(p => {
    const hs = [['motivo', 'Motivo de consulta'], ['notas', 'Notas generales']].map(([f, l]) => {
      const r = findRanges(p[f], q); total += r.length;
      return r.length ? `<p><span class="field">${l}</span> ${snippetHTML(p[f], r)}</p>` : '';
    }).join('');
    const byName = findRanges(fullName(p), q).length;
    return hs || byName ? [`<a class="result" href="#/paciente/${p.id}" style="text-decoration:none;color:inherit"><div class="rhead"><b>${esc(fullName(p))}</b><span class="badge gold">Ficha</span></div>${hs}</a>`] : [];
  });
  if (!out.length && !pats.length) return `<p class="empty">Sin resultados para “${esc(q)}”.</p>`;
  return `<p class="muted" style="margin:14px 2px 0">${total} ${total === 1 ? 'aparición' : 'apariciones'} en ${out.length} ${out.length === 1 ? 'sesión' : 'sesiones'}</p>
    <div class="results">${pats.join('')}${out.join('')}</div>`;
}
VIEWS.buscar = {
  html(args, q) {
    const pid = q.get('p') || '';
    return `<div class="page-head"><h1>Buscar</h1></div>
      <div class="grid2" style="grid-template-columns:2fr 1fr">
        <input class="search" id="q" type="search" placeholder="Una palabra, un significante, un sueño…" value="${esc(q.get('q') || '')}" autocomplete="off">
        <select id="qp" class="search"><option value="">Todos los pacientes</option>${db.patients.slice().sort(byName).map(p => `<option value="${p.id}" ${p.id === pid ? 'selected' : ''}>${esc(fullName(p))}</option>`).join('')}</select>
      </div>
      ${(() => { const all = sigCounts(pid).slice(0, 24); return all.length ? `<div class="chips" style="margin-top:14px">${all.map(g => `<button class="chip" data-act="search-sig" data-sig="${esc(g.label)}">${esc(g.label)}<small>${g.n}</small></button>`).join('')}</div>` : ''; })()}
      <div id="res">${searchResults(q.get('q') || '', pid)}</div>`;
  },
  mount(view) {
    const qi = $('#q', view), qp = $('#qp', view);
    let t;
    const run = () => {
      $('#res', view).innerHTML = searchResults(qi.value, qp.value);
      const params = new URLSearchParams(); if (qi.value) params.set('q', qi.value); if (qp.value) params.set('p', qp.value);
      history.replaceState(null, '', '#/buscar' + (params.toString() ? '?' + params : ''));
    };
    qi.addEventListener('input', () => { clearTimeout(t); t = setTimeout(run, 150); });
    qp.addEventListener('change', () => {
      history.replaceState(null, '', `#/buscar?${new URLSearchParams({ q: qi.value, p: qp.value })}`);
      render();
    });
    if (!qi.value && !('ontouchstart' in window)) qi.focus();
  },
};

VIEWS.ajustes = {
  html() {
    const st = db.settings;
    const lb = st.lastBackup ? new Date(st.lastBackup).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' }) : 'nunca';
    return `<div class="page-head"><h1>Ajustes</h1></div>
      <form id="settings" class="card stack">
        <h3>Consultorio</h3>
        <div class="grid2">
          <label>Nombre <input name="nombre" value="${esc(st.nombre)}"></label>
          <label>Título <input name="titulo" value="${esc(st.titulo)}"></label>
          <label>Honorario por defecto <input name="honorario" type="number" min="0" step="any" inputmode="decimal" value="${st.honorario || ''}"></label>
          <label>Duración por defecto (min) <input name="duracion" type="number" min="0" step="5" value="${st.duracion || ''}"></label>
          <label>Moneda <select name="moneda">${['ARS', 'USD', 'EUR'].map(c => `<option ${st.moneda === c ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
          <label>Bloqueo automático <select name="autolock">${[[5, '5 minutos'], [15, '15 minutos'], [30, '30 minutos'], [60, '1 hora'], [0, 'Nunca']].map(([v, l]) => `<option value="${v}" ${Number(st.autolock) === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        </div>
        <label class="check" style="padding-top:0"><input type="checkbox" name="iniciales" ${st.iniciales ? 'checked' : ''}> Mostrar solo iniciales en agenda, inicio y honorarios (útil si alguien puede ver la pantalla)</label>
        <div><button class="btn primary">Guardar ajustes</button></div>
      </form>

      <div class="section card stack">
        <h3>Backup</h3>
        <p class="muted" style="margin:0">Los datos viven solo en este dispositivo. El backup es un archivo cifrado con tu contraseña: guardalo en iCloud, Drive o un pendrive. Sirve también para pasar todo a otro dispositivo.</p>
        <p style="margin:0">Último backup: <b>${lb}</b></p>
        <div class="row"><button class="btn primary" data-act="export">Exportar backup</button><button class="btn" data-act="import">Restaurar desde backup</button></div>
      </div>

      <div class="section card stack">
        <h3>Seguridad</h3>
        <p class="muted" style="margin:0">Cifrado AES-256-GCM con clave derivada de tu contraseña (PBKDF2, ${KDF_ITER.toLocaleString('es-AR')} iteraciones). Nada sale de este dispositivo.</p>
        <div class="row"><button class="btn" data-act="change-pass">Cambiar contraseña</button><button class="btn" data-act="lock">Bloquear ahora</button></div>
      </div>

      <div class="section card about">
        <div class="dedicatoria">${esc(DEDICATORIA.texto)}</div>
        <div class="dedicatoria-firma">— ${esc(DEDICATORIA.firma)}</div>
        <div class="estampitas">${estampita('San Freud', 'patrono de los sueños', 'F')}${estampita('San Lacan', 'patrono del significante', 'L')}</div>
        <p class="muted" style="font-size:.8rem;margin-top:18px">Otra Escena · <i>der andere Schauplatz</i></p>
      </div>`;
  },
  mount(view) {
    $('#settings', view).addEventListener('submit', e => {
      e.preventDefault();
      const f = new FormData(e.target);
      Object.assign(db.settings, {
        nombre: f.get('nombre').trim(), titulo: f.get('titulo').trim(),
        honorario: Number(f.get('honorario')) || 0, duracion: Number(f.get('duracion')) || 0,
        moneda: f.get('moneda'), autolock: Number(f.get('autolock')), iniciales: f.get('iniciales') === 'on',
      });
      save(); toast('Ajustes guardados'); render();
    });
  },
};

function estampita(nombre, sub, letra) {
  return `<div class="estampita">
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <defs><radialGradient id="g${letra}" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="#fff6d8"/><stop offset="1" stop-color="#e2c27c"/></radialGradient></defs>
      ${[...Array(24)].map((_, i) => { const a = i * Math.PI / 12; return `<line x1="${60 + Math.cos(a) * 34}" y1="${52 + Math.sin(a) * 34}" x2="${60 + Math.cos(a) * 54}" y2="${52 + Math.sin(a) * 54}" stroke="#c9a253" stroke-width="1.2" opacity=".6"/>`; }).join('')}
      <circle cx="60" cy="52" r="32" fill="url(#g${letra})" stroke="#b8924a" stroke-width="2"/>
      <ellipse cx="60" cy="22" rx="20" ry="5" fill="none" stroke="#c9a253" stroke-width="2.5"/>
      <text x="60" y="66" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="40" font-weight="600" fill="#5a4320">${letra}</text>
      <path d="M22 112c6-18 20-26 38-26s32 8 38 26" fill="#8a6a3a" opacity=".35"/>
    </svg>
    <b>${nombre}</b><small>${sub}</small></div>`;
}

/* ---------- Modales: paciente ---------- */
function openPatientModal(id = null) {
  const p = id ? patientById(id) : null;
  const d = p || { nombre: '', apellido: '', alias: '', telefono: '', email: '', nacimiento: '', inicio: todayStr(), modalidad: 'presencial', link: '', honorario: db.settings.honorario || '', frecuencia: '', derivacion: '', motivo: '', notas: '', activo: true };
  openModal(`<form id="pform" class="stack">
    <header class="modal-head"><h2>${p ? 'Editar paciente' : 'Nuevo paciente'}</h2><button type="button" class="icon-btn" data-act="close-modal" aria-label="Cerrar">✕</button></header>
    <div class="grid2">
      <label>Nombre <input name="nombre" value="${esc(d.nombre)}" required autocomplete="off"></label>
      <label>Apellido <input name="apellido" value="${esc(d.apellido)}" autocomplete="off"></label>
      <label>Cómo lo llamo <input name="alias" value="${esc(d.alias)}" autocomplete="off" placeholder="Apodo, opcional"></label>
      <label>Fecha de nacimiento <input name="nacimiento" type="date" value="${esc(d.nacimiento)}"></label>
      <label>Teléfono <input name="telefono" type="tel" value="${esc(d.telefono)}" autocomplete="off"></label>
      <label>Email <input name="email" type="email" value="${esc(d.email)}" autocomplete="off"></label>
      <label>Inicio del tratamiento <input name="inicio" type="date" value="${esc(d.inicio)}"></label>
      <label>Frecuencia <input name="frecuencia" value="${esc(d.frecuencia)}" placeholder="Ej.: 2 veces por semana"></label>
      <label>Modalidad habitual <select name="modalidad">${Object.entries(MODALIDADES).map(([k, l]) => `<option value="${k}" ${d.modalidad === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <label>Honorario por sesión <input name="honorario" type="number" min="0" step="any" inputmode="decimal" value="${esc(d.honorario)}"></label>
      <label class="full">Link de videollamada <input name="link" type="url" value="${esc(d.link)}" placeholder="https://meet.google.com/…"></label>
      <label class="full">Derivación <input name="derivacion" value="${esc(d.derivacion)}" placeholder="Quién lo derivó, obra social, etc."></label>
    </div>
    <label>Motivo de consulta <textarea name="motivo" rows="3">${esc(d.motivo)}</textarea></label>
    <label>Notas generales <textarea name="notas" rows="3">${esc(d.notas)}</textarea></label>
    <label class="check" style="padding-top:0"><input type="checkbox" name="activo" ${d.activo ? 'checked' : ''}> En tratamiento (desmarcar para dar de alta)</label>
    <footer class="modal-foot">
      ${p ? `<button type="button" class="btn ghost danger" data-act="delete-patient" data-id="${p.id}">Eliminar</button>` : ''}
      <span class="spacer"></span>
      <button type="button" class="btn ghost" data-act="close-modal">Cancelar</button>
      <button class="btn primary">Guardar</button>
    </footer></form>`, {
    guard: () => formDirty($('#pform')),
    mount(m) {
      $('#pform', m).addEventListener('submit', e => {
        e.preventDefault();
        const f = new FormData(e.target);
        const data = Object.fromEntries(['nombre', 'apellido', 'alias', 'telefono', 'email', 'nacimiento', 'inicio', 'modalidad', 'link', 'frecuencia', 'derivacion', 'motivo', 'notas'].map(k => [k, String(f.get(k) || '').trim()]));
        data.honorario = Number(f.get('honorario')) || 0;
        data.activo = f.get('activo') === 'on';
        if (p) Object.assign(p, data);
        else db.patients.push({ id: uid(), creado: new Date().toISOString(), ...data });
        save(); closeModal(); toast(p ? 'Paciente actualizado' : 'Paciente agregado');
        if (!p) location.hash = '#/paciente/' + db.patients[db.patients.length - 1].id; else render();
      });
    },
  });
}

/* ---------- Modales: sesión ---------- */
function readSessionForm(form) {
  const f = new FormData(form);
  return {
    patientId: f.get('patientId'), fecha: f.get('fecha'), hora: f.get('hora') || '',
    duracion: Number(f.get('duracion')) || 0, modalidad: f.get('modalidad'), link: String(f.get('link') || '').trim(),
    estado: f.get('estado'), honorario: Number(f.get('honorario')) || 0, pagado: f.get('pagado') === 'on',
    medio: f.get('medio'), notas: f.get('notas') || '', suenos: f.get('suenos') || '', lapsus: f.get('lapsus') || '',
    significantes: splitSigs(f.get('significantes')), repetir: Number(f.get('repetir')) || 0,
  };
}

function openSessionModal({ id = null, fecha = null, patientId = null, draft = null } = {}) {
  if (!db.patients.length) { toast('Primero cargá un paciente'); return openPatientModal(); }
  const s = id ? db.sessions.find(x => x.id === id) : null;
  if (id && !s) { toast('Esa sesión ya no existe'); return; }
  const today = todayStr();
  const f0 = fecha || today;
  const pid = draft?.patientId || s?.patientId || patientId || '';
  const p0 = patientById(pid);
  const d = draft || s || {
    patientId: pid, fecha: f0, hora: '', duracion: db.settings.duracion || '', modalidad: p0?.modalidad || 'presencial', link: p0?.link || '',
    estado: f0 < today ? 'realizada' : 'programada', honorario: p0?.honorario || db.settings.honorario || '', pagado: false, medio: 'transferencia',
    notas: '', suenos: '', lapsus: '', significantes: [],
  };
  const pats = db.patients.filter(p => p.activo || p.id === pid).sort(byName);
  const opt = (obj, val) => Object.entries(obj).map(([k, l]) => `<option value="${k}" ${val === k ? 'selected' : ''}>${l}</option>`).join('');
  const sigChips = pid => sigCounts(pid).slice(0, 14).map(g => `<button type="button" class="chip" data-add-sig="${esc(g.label)}">${esc(g.label)}<small>${g.n}</small></button>`).join('');

  openModal(`<form id="sform" class="stack" data-id="${s?.id || ''}">
    <header class="modal-head"><h2>${s ? (p0 ? esc(fullName(p0)) : 'Sesión') : 'Nueva sesión'}</h2>
      <button type="button" class="icon-btn" data-act="close-modal" aria-label="Cerrar">✕</button></header>
    <div class="grid2">
      <label class="full">Paciente <select name="patientId" required><option value="">Elegir…</option>${pats.map(p => `<option value="${p.id}" ${p.id === pid ? 'selected' : ''}>${esc(fullName(p))}</option>`).join('')}</select></label>
      <label>Fecha <input name="fecha" type="date" value="${esc(d.fecha)}" required></label>
      <label>Hora <input name="hora" type="time" value="${esc(d.hora)}"></label>
      <label>Estado <select name="estado">${opt(ESTADOS, d.estado)}</select></label>
      <label>Duración (min) <input name="duracion" type="number" min="0" step="5" value="${esc(d.duracion || '')}" placeholder="Tiempo lógico"></label>
      <label>Modalidad <select name="modalidad">${opt(MODALIDADES, d.modalidad)}</select></label>
      <label class="link-field">Link de videollamada <input name="link" type="url" value="${esc(d.link)}" placeholder="https://…"></label>
      <label>Honorario <input name="honorario" type="number" min="0" step="any" inputmode="decimal" value="${esc(d.honorario || '')}"></label>
      <label class="check"><input type="checkbox" name="pagado" ${d.pagado ? 'checked' : ''}> Cobrada</label>
      <label class="medio-field">Medio de pago <select name="medio">${opt(MEDIOS, d.medio || 'transferencia')}</select></label>
    </div>
    <label>Notas de la sesión <textarea class="notes" name="notas" rows="9" placeholder="Lo dicho, lo no dicho…">${esc(d.notas)}</textarea></label>
    <details ${d.suenos || d.lapsus ? 'open' : ''}><summary>Sueños, lapsus y actos fallidos</summary>
      <div class="stack">
        <label>Sueños <textarea class="notes" name="suenos" rows="4">${esc(d.suenos)}</textarea></label>
        <label>Lapsus, actos fallidos, chistes <textarea name="lapsus" rows="3">${esc(d.lapsus)}</textarea></label>
      </div>
    </details>
    <label>Significantes <input name="significantes" value="${esc((d.significantes || []).join(', '))}" placeholder="Separados por coma: mirada, caída, padre" autocomplete="off">
      <span class="hint">Quedan indexados para seguirlos a lo largo del tratamiento.</span></label>
    <div class="chips" id="sig-chips">${sigChips(pid)}</div>
    ${!s ? `<label>Repetir <select name="repetir"><option value="0">Solo esta sesión</option>${[4, 8, 12, 26, 52].map(n => `<option value="${n}">Semanalmente, ${n} semanas</option>`).join('')}</select></label>` : ''}
    <footer class="modal-foot">
      ${s ? `<button type="button" class="btn ghost danger" data-act="delete-session" data-id="${s.id}">Eliminar</button>` : ''}
      <span class="spacer"></span>
      <button type="button" class="btn ghost" data-act="close-modal">Cancelar</button>
      <button class="btn primary">Guardar</button>
    </footer></form>`, {
    guard: () => formDirty($('#sform')),
    mount(m) {
      const form = $('#sform', m);
      const el = n => form.elements[n];
      const sync = () => {
        $('.link-field', form).hidden = el('modalidad').value !== 'online';
        $('.medio-field', form).hidden = !el('pagado').checked;
      };
      sync();
      el('modalidad').addEventListener('change', sync);
      el('pagado').addEventListener('change', sync);
      el('fecha').addEventListener('change', () => {
        if (!s && el('estado').value !== 'cancelada' && el('estado').value !== 'ausente') el('estado').value = el('fecha').value < todayStr() ? 'realizada' : 'programada';
      });
      el('patientId').addEventListener('change', () => {
        const p = patientById(el('patientId').value);
        $('#sig-chips', form).innerHTML = sigChips(el('patientId').value);
        if (s || !p) return;
        el('modalidad').value = p.modalidad || 'presencial';
        el('link').value = p.link || '';
        if (p.honorario) el('honorario').value = p.honorario;
        sync();
      });
      form.addEventListener('click', e => {
        const c = e.target.closest('[data-add-sig]'); if (!c) return;
        const cur = splitSigs(el('significantes').value);
        if (!cur.some(x => norm(x) === norm(c.dataset.addSig))) cur.push(c.dataset.addSig);
        el('significantes').value = cur.join(', ');
      });
      form.addEventListener('submit', e => {
        e.preventDefault();
        const data = readSessionForm(form);
        const rep = data.repetir; delete data.repetir;
        if (s) Object.assign(s, data, { fechaPago: data.pagado ? (s.fechaPago || todayStr()) : null });
        else {
          const n = Math.max(1, rep);
          for (let i = 0; i < n; i++) {
            const fecha = ymd(addDays(parseYmd(data.fecha), 7 * i));
            const extra = i === 0 ? {} : { notas: '', suenos: '', lapsus: '', significantes: [], pagado: false, estado: fecha < todayStr() ? 'realizada' : 'programada' };
            db.sessions.push({ id: uid(), creado: new Date().toISOString(), ...data, fecha, fechaPago: data.pagado && i === 0 ? todayStr() : null, ...extra });
          }
        }
        if (draft) db.borrador = null;
        save(); closeModal(); render();
        toast(s ? 'Sesión guardada' : rep > 1 ? `${rep} sesiones agendadas` : 'Sesión agregada');
      });
    },
  });
}

function openCobrarModal(id) {
  const s = db.sessions.find(x => x.id === id); if (!s) return;
  openModal(`<header class="modal-head"><h2>Registrar cobro</h2><button type="button" class="icon-btn" data-act="close-modal" aria-label="Cerrar">✕</button></header>
    <p style="margin-top:0">${esc(displayName(patientById(s.patientId)))} · ${fmtFecha(s.fecha, { day: 'numeric', month: 'long' })} · <b>${money(s.honorario)}</b></p>
    <div class="stack">${Object.entries(MEDIOS).map(([k, l]) => `<button class="btn ${k === 'transferencia' ? 'primary' : ''}" data-act="cobrar-con" data-id="${s.id}" data-medio="${k}">${l}</button>`).join('')}</div>`, { narrow: true });
}

/* ---------- Backup y contraseña ---------- */
async function exportBackup() {
  const prevBackup = db.settings.lastBackup;
  db.settings.lastBackup = new Date().toISOString();
  await persist();
  const vault = await idb.get('vault');
  const ok = await shareOrDownload(`otra-escena-backup-${todayStr()}.json`, JSON.stringify(vault), 'application/json');
  if (ok) toast('Backup exportado');
  else { db.settings.lastBackup = prevBackup; save(); }
  render();
}

async function importBackup({ first = false } = {}) {
  const file = await pickFile('.json,application/json');
  if (!file) return;
  let vault;
  try { vault = JSON.parse(await file.text()); if (vault.app !== 'otra-escena') throw 0; }
  catch { toast('Ese archivo no es un backup de Otra Escena'); return; }
  openModal(`<form id="bk" class="stack">
    <header class="modal-head"><h2>Restaurar backup</h2><button type="button" class="icon-btn" data-act="close-modal" aria-label="Cerrar">✕</button></header>
    <p class="muted" style="margin:0">Backup del ${new Date(vault.savedAt).toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' })}. Ingresá la contraseña con la que se hizo.</p>
    <input name="pw" type="password" required autocomplete="off" placeholder="Contraseña del backup">
    ${first ? '' : '<div class="banner" style="margin:0"><p>Esto <b>reemplaza</b> todos los datos actuales de este dispositivo. Tu contraseña actual se mantiene.</p></div>'}
    <p class="err" id="bkerr"></p>
    <footer class="modal-foot"><span class="spacer"></span><button type="button" class="btn ghost" data-act="close-modal">Cancelar</button><button class="btn primary">Restaurar</button></footer>
  </form>`, {
    narrow: true,
    mount(m) {
      $('#bk', m).addEventListener('submit', async e => {
        e.preventDefault();
        $('#bkerr').textContent = 'Descifrando…';
        try {
          const r = await unseal(vault, e.target.elements.pw.value);
          if (first) { kdf = vault.kdf; key = r.key; }
          db = migrate(r.data);
          await persist(); closeModal();
          if (first) startSession(); else render();
          toast('Backup restaurado');
        } catch { $('#bkerr').textContent = 'Contraseña incorrecta o archivo dañado.'; }
      });
    },
  });
}

function openChangePass() {
  openModal(`<form id="cp" class="stack">
    <header class="modal-head"><h2>Cambiar contraseña</h2><button type="button" class="icon-btn" data-act="close-modal" aria-label="Cerrar">✕</button></header>
    <label>Contraseña actual <input name="cur" type="password" required autocomplete="current-password"></label>
    <label>Nueva contraseña <input name="p1" type="password" minlength="8" required autocomplete="new-password"></label>
    <label>Repetir nueva <input name="p2" type="password" minlength="8" required autocomplete="new-password"></label>
    <p class="err" id="cperr"></p>
    <footer class="modal-foot"><span class="spacer"></span><button type="button" class="btn ghost" data-act="close-modal">Cancelar</button><button class="btn primary">Cambiar</button></footer>
  </form>`, {
    narrow: true,
    mount(m) {
      $('#cp', m).addEventListener('submit', async e => {
        e.preventDefault();
        const f = new FormData(e.target);
        if (f.get('p1') !== f.get('p2')) { $('#cperr').textContent = 'Las contraseñas nuevas no coinciden.'; return; }
        $('#cperr').textContent = 'Verificando…';
        try { await persist(); await unseal(await idb.get('vault'), f.get('cur')); }
        catch { $('#cperr').textContent = 'La contraseña actual no es correcta.'; return; }
        kdf = newKdf(); key = await deriveKey(f.get('p1'), kdf.salt, kdf.iter);
        await persist(); closeModal();
        toast('Contraseña cambiada. Hacé un backup nuevo.');
      });
    },
  });
}

function exportHistory(pid) {
  const p = patientById(pid); if (!p) return;
  const ss = sessionsOf(pid).sort(byWhen);
  const L = [];
  L.push(`HISTORIA — ${fullName(p)}`, `Exportado el ${fmtFecha(todayStr(), { day: 'numeric', month: 'long', year: 'numeric' })} · ${db.settings.titulo || ''}`, '');
  const add = (l, v) => v && L.push(`${l}: ${v}`);
  add('Inicio del tratamiento', p.inicio && fmtFecha(p.inicio, { day: 'numeric', month: 'long', year: 'numeric' }));
  add('Nacimiento', p.nacimiento); add('Teléfono', p.telefono); add('Email', p.email);
  add('Frecuencia', p.frecuencia); add('Derivación', p.derivacion);
  if (p.motivo) L.push('', 'MOTIVO DE CONSULTA', p.motivo);
  if (p.notas) L.push('', 'NOTAS GENERALES', p.notas);
  const sigs = sigCounts(pid); if (sigs.length) L.push('', 'SIGNIFICANTES', sigs.map(g => `${g.label} (${g.n})`).join(', '));
  L.push('', '='.repeat(48));
  for (const s of ss) {
    L.push('', `${fmtFecha(s.fecha, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}${s.hora ? ' · ' + s.hora : ''} · ${ESTADOS[s.estado]} · ${MODALIDADES[s.modalidad] || ''}`);
    if (s.notas) L.push(s.notas);
    if (s.suenos) L.push('', 'Sueños:', s.suenos);
    if (s.lapsus) L.push('', 'Lapsus / actos fallidos:', s.lapsus);
    if (s.significantes?.length) L.push('', 'Significantes: ' + s.significantes.join(', '));
    L.push('', '-'.repeat(48));
  }
  confirmDialog('El archivo de texto NO está cifrado. Guardalo en un lugar seguro.', 'Exportar', false).then(ok => {
    if (ok) shareOrDownload(`historia-${norm(fullName(p)).replace(/[^a-z0-9]+/g, '-')}.txt`, L.join('\n'), 'text/plain');
  });
}

/* ---------- Acciones (delegación de eventos) ---------- */
document.addEventListener('click', async e => {
  const t = e.target.closest('[data-act]'); if (!t) return;
  const { act, id } = t.dataset;
  switch (act) {
    case 'setup': return showSetup();
    case 'restore-first': return importBackup({ first: true });
    case 'lock': return lock();
    case 'close-modal': return requestCloseModal();
    case 'new-session': return openSessionModal({ fecha: t.dataset.fecha, patientId: t.dataset.patient });
    case 'edit-session': return openSessionModal({ id });
    case 'new-patient': return openPatientModal();
    case 'edit-patient': return openPatientModal(id);
    case 'mark-done': {
      const s = db.sessions.find(x => x.id === id); if (!s) return;
      s.estado = 'realizada'; save(); render(); toast('Marcada como realizada'); return;
    }
    case 'cobrar': return openCobrarModal(id);
    case 'cobrar-con': {
      const s = db.sessions.find(x => x.id === id); if (!s) return;
      Object.assign(s, { pagado: true, medio: t.dataset.medio, fechaPago: todayStr() });
      save(); closeModal(); render(); toast('Cobro registrado'); return;
    }
    case 'delete-session': {
      if (!(await confirmDialog('¿Eliminar esta sesión y sus notas? No se puede deshacer.', 'Eliminar'))) return;
      db.sessions = db.sessions.filter(s => s.id !== id); save(); closeModal(); render(); toast('Sesión eliminada'); return;
    }
    case 'delete-patient': {
      const p = patientById(id); const n = sessionsOf(id).length;
      if (!(await confirmDialog(`¿Eliminar a ${fullName(p)} y sus ${n} sesiones? No se puede deshacer. Si terminó el tratamiento, mejor desmarcá “En tratamiento”.`, 'Eliminar todo'))) return;
      db.patients = db.patients.filter(x => x.id !== id); db.sessions = db.sessions.filter(s => s.patientId !== id);
      save(); closeModal(); location.hash = '#/pacientes'; toast('Paciente eliminado'); return;
    }
    case 'export-history': return exportHistory(id);
    case 'export': return exportBackup();
    case 'import': return importBackup();
    case 'change-pass': return openChangePass();
    case 'search-sig': { const qi = $('#q'); qi.value = t.dataset.sig; qi.dispatchEvent(new Event('input')); return; }
    case 'restore-draft': { const { _id, ...d } = db.borrador; return openSessionModal({ id: _id || null, draft: d }); }
    case 'discard-draft': db.borrador = null; save(); render(); return;
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('#modal-root').innerHTML && !$('.confirm-holder')) requestCloseModal();
});

boot();
