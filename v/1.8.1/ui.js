// ===== Sąsaja =====
const UI = { view: 'today', cal: {mode: 'week', date: today()}, food: 'log', foodDate: today(), time: {mode: 'week', date: today()},
  sport: 'overview', taskFilter: 'open', noteId: null, recipeQ: '', foodQ: '', mealTab: 'ai' };
const VIEWS = [
  ['today','home','Šiandien'], ['calendar','cal','Kalendorius'], ['tasks','check','Užduotys'], ['food','food','Mityba'],
  ['sport','gym','Sportas'], ['time','clock','Laikas'], ['progress','chart','Progresas'], ['wellbeing','heart','Savijauta'], ['notes','note','Užrašai'], ['settings','user','Profilis'],
];
// ---------- Savos linijinės ikonos (vietoj emoji) ----------
const ICONS = {
  srch: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>', vid: '<rect x="3" y="6" width="13" height="12" rx="3"/><path d="M16 10l5-3v10l-5-3"/>',
  pause: '<path d="M8 5v14M16 5v14"/>', stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>', srun: '<circle cx="14" cy="4.5" r="2"/><path d="M8 21l3-6 3 2v5M6 12l3-4 4 1 2 4 3 1M11 15l-2-3"/>',
  sbike: '<circle cx="6" cy="16" r="4"/><circle cx="18" cy="16" r="4"/><path d="M6 16l4-7h5l3 7M10 9l2 7M14 5h3"/>', sswim: '<path d="M3 18c2 0 2-1.5 4.5-1.5S9.5 18 12 18s2-1.5 4.5-1.5S19 18 21 18"/><circle cx="16" cy="7" r="2"/><path d="M6 14l4-5 4 3"/>',
  sball: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>', syoga: '<circle cx="12" cy="5" r="2"/><path d="M4 20h16M7 20l5-6 5 6M5 11l7 2 7-2"/>',
  swalk: '<circle cx="13" cy="4.5" r="2"/><path d="M9 21l2-6 3 3v3M8 12l2-4h3l2 4 2 1M11 15l-1-4"/>', shome: '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M10 20v-5h4v5"/>',
  stree: '<path d="M12 3l6 9h-3l4 6H5l4-6H6z"/><path d="M12 18v3"/>', sphone: '<rect x="7" y="3" width="10" height="18" rx="3"/><path d="M11 18h2"/>', swatch: '<rect x="6" y="7" width="12" height="10" rx="3"/><path d="M9 7l1-4h4l1 4M9 17l1 4h4l1-4M12 10v2l1.5 1"/>',
  home: '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>',
  cal: '<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M4 10h16"/>',
  food: '<path d="M7 3v8a2 2 0 0 0 4 0V3M9 11v10M16 3c-1.7 1-3 3.2-3 6v4h3v8"/>',
  gym: '<path d="M6 8v8M3 10v4M18 8v8M21 10v4M6 12h12"/>',
  more: '<circle cx="6" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18" cy="12" r="1.3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<rect x="4" y="4" width="16" height="16" rx="5"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  scale: '<rect x="4" y="4" width="16" height="16" rx="5"/><path d="M9 9a4 4 0 0 1 6 0M12 9.5l1-1.5"/>',
  chart: '<path d="M5 19V9M12 19V5M19 19v-7"/>',
  note: '<path d="M6 4h9l4 4v12H6z M14 4v5h5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  chat: '<path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  bug: '<rect x="7" y="8" width="10" height="12" rx="5"/><path d="M9 8a3 3 0 0 1 6 0M4 12h3M17 12h3M5 17l2.5-1.5M19 17l-2.5-1.5M5 7l2.5 2M19 7l-2.5 2M12 11v8"/>',
  event: '<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M4 10h16M9 15h6"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z"/>',
  fridge: '<rect x="6" y="3" width="12" height="18" rx="3"/><path d="M6 10h12M9 6v2M9 13v3"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  arrow: '<path d="M9 6l6 6-6 6"/>',
  pin: '<path d="M9 4h6l-1 6 3 3H7l3-3z"/><path d="M12 16v5"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', back: '<path d="M15 6l-6 6 6 6"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="3"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  wdumb: '<path d="M3 10v4M6 7v10M18 7v10M21 10v4M6 12h12"/>', wleg: '<path d="M10 3v7c0 2 1 3 1 5l-1 4h6"/><path d="M14 3v6c0 3 1 4 1 6"/>',
  warm: '<path d="M4 18c3 0 5-1 7-3 2 0 4-1 5-3 1-2 0-5-2-6l-2 2 1 2c-1 1-3 2-4 2L4 14"/>', wfire: '<path d="M12 21a6 6 0 0 0 6-6c0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-3-2 2-3 4-3 7a6 6 0 0 0 6 6z"/>',
  wcore: '<rect x="7" y="4" width="10" height="16" rx="4"/><path d="M12 4v16M7 9.5h10M7 14.5h10"/>', wrun: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/><path d="M7 12h3l1.5-2.5 2 5L15 12h2"/>',
  wup: '<path d="M6 20c0-5 2-8 6-8s6 3 6 8"/><circle cx="12" cy="7" r="3"/><path d="M4 12l3-2M20 12l-3-2"/>', wauto: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M18 16l.8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8z"/>',
  wsmall: '<circle cx="12" cy="6" r="3"/><path d="M12 9v6M8 21l4-6 4 6M7 12h10"/>', pen: '<path d="M4 20l4-1 11-11-3-3L5 16z"/>', swap: '<path d="M5 9h13l-3-3M19 15H6l3 3"/>',
  play: '<path d="M7 4.5v15l13-7.5z"/>',
};
const ic = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24">${ICONS[n] || ICONS.spark}</svg>`;
// ---------- Daigelis – mūsų personažas (nuotaika 1..5 keičia akis, burną ir lapelius) ----------
function daigelis(mood = 4, cls = '') {
  const K = '#1a0b00', m = Math.min(5, Math.max(1, Math.round(+mood) || 4)), leaf = [0, 34, 22, 8, 0, -6][m];
  const open = `<ellipse cx="47" cy="72" rx="6.5" ry="8" fill="${K}"/><ellipse cx="73" cy="72" rx="6.5" ry="8" fill="${K}"/><circle cx="49" cy="69" r="2.3" fill="#fff"/><circle cx="75" cy="69" r="2.3" fill="#fff"/>`;
  const face = m === 5 ? `<path d="M40 72 Q47 64 54 72" stroke="${K}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M66 72 Q73 64 80 72" stroke="${K}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M48 84 Q60 100 72 84 Z" stroke="${K}" stroke-width="4" fill="${K}" stroke-linejoin="round"/>`
    : m === 4 ? open + `<path d="M51 86 Q60 95 69 86" stroke="${K}" stroke-width="4" fill="none" stroke-linecap="round"/>`
    : m === 3 ? open + `<path d="M51 88 L69 88" stroke="${K}" stroke-width="4" stroke-linecap="round"/>`
    : `<path d="M40 70 Q47 76 54 70" stroke="${K}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M66 70 Q73 76 80 70" stroke="${K}" stroke-width="4" fill="none" stroke-linecap="round"/>`
      + (m === 1 ? '<path d="M41 80 q-4 7 0 10 q4-3 0-10z" fill="#8fd0ff"/>' : '') + `<path d="M51 ${m === 1 ? 92 : 90} Q60 ${m === 1 ? 86 : 84} 69 ${m === 1 ? 92 : 90}" stroke="${K}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  return `<svg class="dg ${cls}" viewBox="0 0 120 120" aria-hidden="true"><g transform="rotate(${leaf * -0.5} 60 46)"><path d="M60 46 C60 36 60 30 60 22" stroke="var(--stem)" stroke-width="5" stroke-linecap="round" fill="none"/>
    <g transform="rotate(${-leaf} 60 30)"><path d="M60 30 C46 14 30 18 28 26 C40 34 52 34 60 30z" fill="var(--leaf)"/></g><g transform="rotate(${leaf} 60 26)"><path d="M60 26 C72 8 92 10 95 19 C82 30 68 30 60 26z" fill="var(--leaf)"/></g></g>
    <rect x="22" y="44" width="76" height="62" rx="30" fill="var(--masc)"/><rect x="30" y="52" width="60" height="48" rx="24" fill="var(--masc2)"/>
    <circle cx="36" cy="86" r="5" fill="#ff7f8f" opacity="${m <= 2 ? .25 : .45}"/><circle cx="84" cy="86" r="5" fill="#ff7f8f" opacity="${m <= 2 ? .25 : .45}"/>${face}</svg>`;
}
// Apatinės juostos skirtukai (3 + ＋ + Daugiau); kuriuos 3 rodyti – pasirenkama Profilyje
const barTabs = () => { const t = (S.settings.tabs || []).filter(v => VIEWS.some(x => x[0] === v && v !== 'settings')); return t.length === 3 ? t : ['today', 'calendar', 'food']; };
const A = {}; // veiksmai (data-a)

// ---------- Formų pagalbininkai ----------
const opt = (v, l, cur) => `<option value="${esc(v)}" ${String(v) === String(cur) ? 'selected' : ''}>${esc(l)}</option>`;
const sel = (name, opts, cur, attrs = '') => `<select name="${name}" ${attrs}>${opts.map(([v, l]) => opt(v, l, cur)).join('')}</select>`;
const inp = (name, val = '', type = 'text', attrs = '') => type === 'time' ? timeSel(name, val, attrs)
  : `<input name="${name}" type="${type}" value="${esc(val)}" ${type === 'date' ? 'min="2000-01-01" max="2099-12-31"' : ''} ${attrs}>`;
// Laiko pasirinkimas: valandos 0–23 ir minutės kas 5 (be „sukimo rato“)
function timeSel(name, val = '', attrs = '') {
  let h = '', m = '';
  if (val) { const t = toMin(val), r = Math.round(t / 5) * 5; h = Math.floor(r / 60) % 24; m = r % 60; }
  const req = attrs.includes('required') ? 'required' : '';
  return `<span class="tsel"><select name="${name}__h" ${req}>${req ? '' : opt('', '--', h)}${Array.from({length: 24}, (_, i) => opt(i, pad(i), h)).join('')}</select><b>:</b><select name="${name}__m">${Array.from({length: 12}, (_, i) => opt(i * 5, pad(i * 5), m === '' ? 0 : m)).join('')}</select></span>`;
}
const fld = (label, html, cls = '') => `<label class="fld ${cls}"><span>${label}</span>${html}</label>`;
const catOpts = () => S.categories.map(c => [c.id, c.name]);
const chip = (txt, color) => `<span class="chip" style="--c:${color}">${txt}</span>`;
const card = (title, body, extra = '', cls = '') => `<section class="card ${cls}">${title ? `<div class="ch"><h3>${title}</h3><div>${extra}</div></div>` : ''}${body}</section>`;
const btn = (label, a, data = {}, cls = '') => `<button class="btn ${cls}" data-a="${a}" ${Object.entries(data).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ')}>${label}</button>`;
const empty = t => `<div class="empty">${t}</div>`;

// ---------- Modalas ----------
let MODAL_SUBMIT = null;
// tekstuose (ne įvedimo laukuose – vartotojo duomenys lieka) emoji nerodom
const EMO_RE = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]\u{FE0F}?\u{200D}?\s?/gu;
const keepMark = m => /[✓-✖]/.test(m) ? m : '';   // ✓ ✕ paliekam
function stripEmoDom(root) {
  if (!root) return; const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) { if (n.parentElement?.closest('textarea,option,[contenteditable],.dg')) continue; const v = n.nodeValue; if (EMO_RE.test(v)) { EMO_RE.lastIndex = 0; n.nodeValue = v.replace(EMO_RE, keepMark); } EMO_RE.lastIndex = 0; }
}
function modal(title, body, onSubmit, o = {}) {
  const m = $('#modal');
  m.innerHTML = `<div class="mbox ${o.wide ? 'wide' : ''}"><div class="mhead"><h3>${title}</h3><button type="button" class="x" data-a="closeModal">✕</button></div>
    <form id="mform" autocomplete="off">${body}${onSubmit ? `<div class="mfoot">${o.extra || ''}<span class="sp"></span><button type="button" class="btn ghost" data-a="closeModal">Atšaukti</button><button class="btn primary" type="submit">${o.submit || 'Išsaugoti'}</button></div>` : ''}</form></div>`;
  stripEmoDom(m); m.classList.add('open'); MODAL_SUBMIT = onSubmit;
  const f = m.querySelector('input:not([type=hidden]):not([type=checkbox]):not([type=radio]),textarea'); if (f && !o.noFocus && window.innerWidth > 700) f.focus();
}
A.closeModal = () => { $('#modal').classList.remove('open'); $('#modal').innerHTML = ''; MODAL_SUBMIT = null; };
// Gražus patvirtinimo langas ekrano viduryje (vietoj naršyklės confirm). Grąžina true/false.
// langai rodomi po vieną (jei vienu metu ateina keli – eilė)
let ASKQ = Promise.resolve();
function ask(title, text = '', o = {}) { const p = ASKQ.then(() => askNow(title, text, o)); ASKQ = p.catch(() => {}); return p; }
function askNow(title, text, o) {
  return new Promise(res => {
    const el = document.createElement('div'); el.className = 'askov';
    el.innerHTML = `<div class="askbox ${o.danger ? 'danger' : ''}" role="dialog" aria-modal="true"><div class="askic">${String(o.icon || '').startsWith('<') ? o.icon : daigelis(o.danger ? 2 : o.mood || 4)}</div><h3>${noEmo(title)}</h3>${text ? `<div class="asktxt">${text}</div>` : ''}${o.input != null ? `<${o.multi ? 'textarea rows="5"' : 'input'} class="askin" placeholder="${esc(o.placeholder || '')}" ${o.multi ? `>${esc(o.input)}</textarea>` : `value="${esc(o.input)}">`}` : ''}
      <div class="askbtns">${o.no === false ? '' : `<button type="button" class="btn ghost" data-r="0">${o.no || 'Atšaukti'}</button>`}<button type="button" class="btn ${o.danger ? 'danger' : 'primary'}" data-r="1">${o.yes || 'Taip'}</button></div></div>`;
    stripEmoDom(el.querySelector('.asktxt')); document.body.appendChild(el);
    const inp = el.querySelector('.askin');
    const done = v => { el.classList.add('out'); document.removeEventListener('keydown', kd, true); setTimeout(() => el.remove(), 150); res(inp ? (v ? inp.value : null) : v); };
    const kd = e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); done(o.backdrop ?? false); } else if (e.key === 'Enter' && !(o.multi && !e.ctrlKey)) { e.preventDefault(); e.stopPropagation(); done(true); } };
    document.addEventListener('keydown', kd, true);
    el.addEventListener('click', e => { e.stopPropagation(); const b = e.target.closest('[data-r]'); if (b) done(b.dataset.r === '1'); else if (e.target === el && o.no !== false) done(o.backdrop ?? false); });
    if (inp) { inp.focus(); inp.select?.(); } else el.querySelector(o.danger ? '[data-r="0"]' : '[data-r="1"]')?.focus();
  });
}
const info = (title, text, o = {}) => ask(title, text, {no: false, yes: 'Gerai', icon: 'ℹ️', ...o});
// vietoj naršyklės alert / prompt
const warn = msg => { info('Patikrink', esc(msg).replace(/\n/g, '<br>'), {icon: '⚠️'}); };
const askText = (title, text, value = '', o = {}) => ask(title, text, {icon: '✏️', yes: 'Išsaugoti', input: value ?? '', ...o});
function formObj(form) {
  const o = {}; const fd = new FormData(form);
  for (const [k, v] of fd.entries()) { if (k.endsWith('[]')) (o[k.slice(0, -2)] = o[k.slice(0, -2)] || []).push(v); else o[k] = v; }
  for (const k of Object.keys(o)) if (k.endsWith('__h')) { const b = k.slice(0, -3); o[b] = o[k] === '' ? '' : `${pad(+o[k])}:${pad(+o[b + '__m'] || 0)}`; delete o[k]; delete o[b + '__m']; }
  return o;
}

// ---------- Pranešimai ----------
// emoji nerodom (1.7 dizainas): nuimam iš tekstų, kurie dar juos turi
const noEmo = t => String(t).replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, m => /[✓-✖]/.test(m) ? m : '').replace(/\s+([!.,?])/g, '$1').replace(/\s{2,}/g, ' ').trim();
function toast(msg, type = '') {
  const t = document.createElement('div'); t.className = 'toast ' + type; t.innerHTML = noEmo(msg);
  $('#toasts').appendChild(t); setTimeout(() => t.classList.add('out'), 4200); setTimeout(() => t.remove(), 4800);
}
function confetti() {
  const c = $('#confetti'); const cs = getComputedStyle(document.documentElement), cols = ['--br', '--s2', '--s3', '--leaf'].map(v => cs.getPropertyValue(v).trim() || '#ff8040');
  for (let i = 0; i < 40; i++) { const p = document.createElement('i'); p.style.left = Math.random() * 100 + 'vw'; p.style.background = cols[i % cols.length]; p.style.animationDelay = Math.random() * 0.3 + 's'; p.style.transform = `rotate(${Math.random() * 360}deg)`; c.appendChild(p); setTimeout(() => p.remove(), 1800); }
}
function notify(title, body, tag) {
  toast(`<b>${esc(title)}</b><br>${esc(body)}`, 'info');
  if (document.visibilityState === 'visible') return; // matai programėlę – užtenka pranešimo ekrane
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const o = {body, icon: 'icon.svg', badge: 'icon.svg', tag: tag || undefined};
    if (navigator.serviceWorker?.controller) navigator.serviceWorker.ready.then(r => r.showNotification(title, o)).catch(() => {});
    else new Notification(title, o);
  } catch (e) {}
}

// ---------- Pagrindinis renderis ----------
function render() {
  if (!S) return;
  const g = gamification();
  $('#logo').innerHTML = `${daigelis(dayMood(today()) || 4)}<b>Life Schedule</b>`;
  $('#nav').innerHTML = VIEWS.map(([id, icn, l]) => `<button class="nav ${UI.view === id ? 'on' : ''}" data-a="go" data-v="${id}">${ic(icn)}<em>${l}</em></button>`).join('')
    + `<button class="nav" data-a="feedback">${ic('chat')}<em>Atsiliepimai</em></button>`;
  $('#sidenew').innerHTML = btn(`${ic('plus', 'sm')} Įrašyti`, 'quickSheet', {}, 'primary');
  const bt = barTabs();
  $('#tabbar').innerHTML = bt.slice(0, 2).map(v => tabBtn(v)).join('') + `<button class="plus" data-a="quickSheet" aria-label="Įrašyti">${ic('plus')}</button>` + tabBtn(bt[2])
    + `<button class="${bt.includes(UI.view) ? '' : 'on'}" data-a="moreSheet">${ic('more')}Daugiau</button>`;
  const title = UI.view === 'today' ? '' : VIEWS.find(v => v[0] === UI.view)[2];
  $('#top').innerHTML = `<div class="hd">${window.CLOUD?.test ? '<span class="testbadge" title="Bandomoji versija – tikri duomenys neliečiami">TESTAS</span> ' : ''}${title ? `<h1>${title}</h1>` : ''}<small>${fmtDateDow(today())}</small></div>
    <div class="tr">${S.active ? `<button class="tpill wk" data-a="workoutMode"><span class="rec"></span>Treniruotė · <span class="wClock">${clock(S.active.ts)}</span></button>` : ''}${timerWidget()}<button class="lvchip" data-a="levelInfo" title="${g.xp} XP">${g.level} lygis · ${g.xp} XP${g.streak > 1 ? ` · ${g.streak} d. serija` : ''}</button><span id="sync" class="sync"></span></div>`;
  document.body.classList.toggle('devmode', DEV);
  devBubble();
  const fn = {today: vToday, calendar: vCalendar, tasks: vTasks, food: vFood, sport: vSport, time: vTime, progress: vProgress, wellbeing: vWellbeing, notes: vNotes, settings: vSettings}[UI.view];
  $('#main').innerHTML = updateBanner() + deletionBanner() + fn();
  const spP = UI.view === 'sport' && UI.sp?.p && UI.sp.p !== 'home' ? UI.sp.p : '';
  document.body.classList.toggle('spsub', !!spP); document.body.classList.toggle('spfull', ['live', 'run', 'done', 'draft', 'act', 'wv', 'ex'].includes(spP));
  mountMaps();
  scrollTimelines();
  updateSyncBadge();
}
const tabBtn = v => { const x = VIEWS.find(y => y[0] === v); return `<button class="${UI.view === v ? 'on' : ''}" data-a="go" data-v="${v}">${ic(x[1])}${x[2]}</button>`; };
// ＋ – greitas įrašas
A.quickSheet = () => {
  const it = [['addMeal', 'food', 'Maistas', 'Parašyk, ką valgei', foodOn() || S.meals.length || true], ['timerStart', 'clock', 'Ką veikiu', 'Paleisti laikmatį', true], ['addLog', 'clock', 'Ką veikiau', 'Įrašyti praėjusį laiką', true],
    ['addWorkout', 'gym', 'Treniruotė', 'Pradėti arba įrašyti', true], ['addWell', 'heart', 'Savijauta', 'Kaip jautiesi dabar', true], ['addSleep', 'moon', 'Miegas', 'Kada atsigulei ir kėlei', true],
    ['addTask', 'check', 'Užduotis', 'Ką reikia padaryti', true], ['addEvent', 'event', 'Veikla', 'Į kalendorių', true], ['addWeight', 'scale', 'Svoris', 'Pasisverti', true]];
  $('#sheet').innerHTML = `<div class="dim" data-a="closeSheet"></div><div class="sh qadd2">${it.map(([a, i, t, d], k) => `<button class="qa ${k ? '' : 'first'}" data-a="${a}" data-sheet="1"><span class="ic">${ic(i)}</span><span class="grow"><b>${t}</b><small>${d}</small></span></button>`).join('')}</div>`;
};
// Daugiau – visi kiti skirtukai + Atsiliepimai
A.moreSheet = () => {
  const bt = barTabs(), rest = VIEWS.filter(v => !bt.includes(v[0]));
  $('#sheet').innerHTML = `<div class="dim" data-a="closeSheet"></div><div class="sh more2"><h3>Daugiau</h3><div class="mgrid">
    ${rest.map(([id, i, l]) => `<button class="${UI.view === id ? 'on' : ''}" data-a="go" data-v="${id}" data-sheet="1"><i>${ic(i)}</i>${l}</button>`).join('')}
    <button data-a="feedback" data-sheet="1"><i>${ic('chat')}</i>Atsiliepimai</button></div>
    <p>Kuriuos 3 skirtukus rodyti apačioje – pasirenki Profilyje.</p></div>`;
};
A.closeSheet = () => { $('#sheet').innerHTML = ''; };
// Kūrėjo burbulas – tik kūrėjui, matomas visur; galima nutempti prie bet kurio krašto
function devBubble() {
  const el = $('#devb'); if (!el) return;
  if (!isDeveloper()) { el.className = ''; el.innerHTML = ''; return; }
  const n = inboxCount(), v = window.APP_VERSION, pub = v === window.PUBLIC_VERSION;
  el.className = `show ${DEV ? 'on' : ''}`;
  el.title = DEV ? 'Išjungti kūrėjo režimą' : 'Kūrėjo režimas (galima tempti)';
  el.innerHTML = `${ic('bug')}${n ? `<em>${n}</em>` : ''}${v ? `<small class="${pub ? '' : 'beta'}">v${esc(v)}</small>` : ''}`;
  let pos = null; try { pos = JSON.parse(localStorage.getItem('ls_devb') || 'null'); } catch (e) {}
  const p = pos || {x: 0, y: 0.46};
  el.style.left = `${Math.round(p.x * (innerWidth - 46))}px`; el.style.top = `${Math.round(p.y * (innerHeight - 46))}px`;
}
(() => {
  let drag = null;
  document.addEventListener('pointerdown', e => { const el = e.target.closest('#devb.show'); if (!el) return; drag = {el, sx: e.clientX, sy: e.clientY, ox: el.offsetLeft, oy: el.offsetTop, moved: false}; el.setPointerCapture?.(e.pointerId); });
  document.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy; if (Math.abs(dx) + Math.abs(dy) > 6) drag.moved = true;
    if (drag.moved) { drag.el.style.left = `${Math.min(innerWidth - 46, Math.max(0, drag.ox + dx))}px`; drag.el.style.top = `${Math.min(innerHeight - 46, Math.max(0, drag.oy + dy))}px`; } });
  document.addEventListener('pointerup', () => { if (!drag) return; const {el, moved} = drag; drag = null;
    if (!moved) return A.toggleDev();
    const x = el.offsetLeft + 23 < innerWidth / 2 ? 0 : 1, y = Math.min(1, Math.max(0, el.offsetTop / Math.max(1, innerHeight - 46)));   // prie artimiausio šono
    try { localStorage.setItem('ls_devb', JSON.stringify({x, y})); } catch (err) {}
    el.style.left = `${Math.round(x * (innerWidth - 46))}px`; });
  window.addEventListener('resize', () => { if (S) devBubble(); });
})();
// ===== Atgal: telefono mygtukas, šoninis perbraukimas ir naršyklės „atgal“ =====
// Kiekvienas ekranas ir atidarytas langas palieka žymę naršyklės istorijoje, todėl „atgal“ pirmiausia uždaro langą,
// paskui grąžina į ankstesnį ekraną, o ne išjungia programos.
const NAV = {depth: 0, restoring: false, silentPops: 0, ov: {sheet: false, modal: false, ask: false}};
const navState = () => ({ls: 1, v: UI.view, sp: UI.view === 'sport' && UI.sp ? {p: UI.sp.p, id: UI.sp.id, g: UI.sp.g, from: UI.sp.from, back: UI.sp.back} : null});
function navPush(ov) { if (NAV.restoring) return; try { history.pushState({...navState(), ov: ov || null}, ''); NAV.depth++; } catch (e) {} }
// lango uždarymas mygtuku – istorijos žymę paverčiam įprastu ekranu (kitas „atgal“ ją praleis)
function navOverlayClosed() { if (NAV.restoring) return; try { if (history.state?.ov) history.replaceState({...navState(), ov: null, dup: 1}, ''); } catch (e) {} }
function navWatch() {
  const check = () => {
    const now = {sheet: !!$('#sheet')?.firstElementChild, modal: !!$('#modal')?.classList.contains('open'), ask: !!document.querySelector('.askov:not(.out)')};
    for (const k of ['ask', 'modal', 'sheet']) { if (now[k] && !NAV.ov[k]) navPush(k); else if (!now[k] && NAV.ov[k]) navOverlayClosed(); }
    NAV.ov = now;
  };
  const mo = new MutationObserver(check);
  mo.observe($('#sheet'), {childList: true}); mo.observe($('#modal'), {attributes: true, attributeFilter: ['class']}); mo.observe(document.body, {childList: true});
  try { history.replaceState(navState(), ''); } catch (e) {}
  window.addEventListener('popstate', e => {
    if (NAV.silentPops > 0) { NAV.silentPops--; return; }
    NAV.depth = Math.max(0, NAV.depth - 1); NAV.restoring = true;
    try {
      const ask = document.querySelector('.askov:not(.out)');
      if (ask) { (ask.querySelector('[data-r="0"]') || ask.querySelector('[data-skip]') || ask).click(); return; }
      if ($('#modal').classList.contains('open')) { A.closeModal(); return; }
      if ($('#sheet').firstElementChild) { A.closeSheet(); return; }
      const st = e.state;
      if (!st || !st.ls) return;
      const same = st.v === UI.view && (st.sp?.p || null) === (UI.view === 'sport' ? UI.sp?.p || null : null) && (st.sp?.id || null) === (UI.view === 'sport' ? UI.sp?.id || null : null);
      if (same && st.dup) { NAV.restoring = false; history.back(); return; }
      UI.view = st.v; if (st.sp) UI.sp = {...st.sp};
      render(); window.scrollTo(0, 0);
    } finally { NAV.restoring = false; NAV.ov = {sheet: !!$('#sheet')?.firstElementChild, modal: !!$('#modal')?.classList.contains('open'), ask: !!document.querySelector('.askov:not(.out)')}; }
  });
}
A.go = d => { A.closeModal(); A.closeSheet(); const ch = UI.view !== d.v; if (d.v === 'sport' && UI.view !== 'sport') UI.sp = S.active ? {p: 'live'} : S.run ? {p: 'run'} : {p: 'home'}; UI.view = d.v; render(); window.scrollTo(0, 0); if (ch) navPush(); };
// ===== Kūrėjo režimas (🐞) =====
A.toggleDev = async () => {
  if (!isDeveloper()) return;
  if (!DEV) {
    REAL = S; DEV = true;
    S = migrate(defaultData()); S.settings.tz = REAL.settings.tz; S.settings.theme = REAL.settings.theme;
    storeLocal(); UI.view = 'today'; render(); toast('🐞 Kūrėjo režimas – pradedi nuo nulio. Tikri duomenys saugūs.');
    A.onboard();
  } else {
    DEV = false; try { sessionStorage.removeItem(DEV_KEY); } catch (e) {}
    if (REAL) S = REAL; else await loadData();
    REAL = null; A.closeModal(); UI.view = 'today'; render(); pullIfChanged(); toast('Grįžai į savo tikrus duomenis ✓', 'good');
  }
};
A.devReset = async () => { if (!DEV || !await ask('Pradėti nuo nulio?', 'Bandomieji duomenys bus ištrinti.', {danger: true, yes: 'Ištrinti'})) return; S = migrate(defaultData()); storeLocal(); UI.view = 'today'; render(); A.onboard(); };
A.devCopyReal = () => { if (!DEV || !REAL) return; S = migrate(JSON.parse(JSON.stringify(REAL))); storeLocal(); render(); toast('Nukopijuota – keisk drąsiai, tikri duomenys nepasikeis'); };
A.exportReal = () => { if (REAL) download(`life-schedule-tikri-${today()}.json`, JSON.stringify(REAL, null, 1), 'application/json'); };
A.devSeed = () => {
  if (!DEV) return;
  const t = today(), d = n => addDays(t, n);
  S.settings.onboarded = true; S.settings.modes = {sport: true, food: true};
  Object.assign(S.profile, {name: 'Testas', birthYear: 2000, height: 180, startWeight: 92, targetWeight: 82});
  S.events.push({id: uid(), title: 'Paskaita', cat: 'paskaitos', type: 'weekly', days: [1, 3, 5], start: '10:00', end: '13:00', travel: 20, from: d(-30)},
    {id: uid(), title: 'Darbas', cat: 'darbas', type: 'weekly', days: [2, 4], start: '14:00', end: '18:00', from: d(-30)},
    {id: uid(), title: 'Susitikimas su draugais', cat: 'draugai', type: 'once', date: t, start: '18:30', end: '21:00'});
  S.tasks.push({id: uid(), title: 'Pasiimti siuntą', due: d(2), remind: '1,0', done: false}, {id: uid(), title: 'Referatas', due: d(5), est: 120, progress: 30, remind: '2,0', done: false});
  for (let i = 21; i >= 0; i -= 3) S.weights.push({date: d(-i), kg: round(90 + i * 0.1, 1)});
  S.steps = Array.from({length: 13}, (_, i) => ({date: d(-i - 1), steps: [6200, 9400, 4100, 11250, 7800, 3050, 8650, 10200, 5600, 7300, 12400, 2900, 8100][i], src: 'manual'}));
  for (let i = 10; i >= 1; i--) { S.sleep.push({date: d(-i), bed: '23:40', wake: '07:30', q: 3}); S.timelog.push({id: uid(), date: d(-i), start: '20:00', end: '21:30', cat: 'netflix'}, {id: uid(), date: d(-i), start: '08:30', end: '10:00', cat: 'mokslai'}); S.meals.push({id: uid(), date: d(-i), time: '13:00', name: 'Pietūs', kcal: 650, p: 40}); }
  S.workouts.push({id: uid(), date: d(-3), start: '17:00', duration: 40, exercises: [{id: 'atsp_kel', sets: [12, 10, 10]}, {id: 'pritup', sets: [15, 15]}]});
  addStorage('r_cili', 'fridge', 2, d(-2)); addStorage('r_vist_ryz', 'freezer', 4, d(-5));
  storeLocal(); A.closeModal(); render(); toast('🧪 Bandomieji duomenys sudėti');
};
A.levelInfo = () => {
  const g = gamification(), nextT = LEVEL_TITLES.find(t => t[0] > g.level);
  modal(`${g.title[1]} ${g.level} lygis – ${g.title[2]}`, `<div class="xpb"><i style="width:${(g.xp - g.cur) / (g.next - g.cur) * 100}%"></i></div>
    <p class="center">${g.xp} XP · iki ${g.level + 1} lygio liko <b>${g.next - g.xp} XP</b>${nextT ? ` · titulas „${nextT[2]}“ nuo ${nextT[0]} lygio` : ''}</p>
    <h4>Kam lygiai?</h4><p>Lygiai neturi didelės įtakos kasdieniam gyvenimui – jie parodo, <b>kiek nuosekliai rūpiniesi savimi</b>. XP gauni už veiksmus, ne už rezultatus: net jei ne viskas pavyksta, bet vis tiek įrašinėji, išsimiegi ir padarai, ką buvai numatęs – kyli. Kiekvienas lygis reikalauja vis daugiau XP, todėl aukštas lygis reiškia ilgalaikį įprotį, o ne vieną gerą savaitgalį.</p>
    <h4>Kaip renkasi XP</h4><table class="tbl"><tbody>${XP_RULES.filter(([k, , , m]) => m === 'all' || (m === 'sport' && sportOn()) || (m === 'food' && foodOn()) || (m === 'body' && (sportOn() || foodOn())) || g.parts[k]).map(([k, l, x]) => `<tr><td>${l}</td><td>+${x}</td><td><small>${g.parts[k]}× = ${g.parts[k] * x} XP</small></td></tr>`).join('')}${g.bonus ? `<tr><td>🎁 Komandos dovanos / pataisymai</td><td>${g.bonus > 0 ? '+' : ''}${g.bonus}</td><td><small>${(S.xpAdjust || []).map(a => esc(a.reason || '')).filter(Boolean).slice(-3).join(' · ')}</small></td></tr>` : ''}</tbody></table>
    <h4>Serija 🔥 ${g.streak} d.</h4><p class="hint">Kiek dienų iš eilės kažką įrašei.</p>
    <h4>Titulai</h4><div class="badges">${LEVEL_TITLES.map(([l, e, n]) => `<div class="badge ${g.level >= l ? 'on' : ''}"><span>${e}</span><b>${n}</b><small>${l} lygis</small></div>`).join('')}</div>
    <div class="choice row">${btn('Ženkleliai ir progresas →', 'go', {v: 'progress'}, 'sm')}</div>`);
};

// ---------- Laikmatis ----------
function timerWidget() {
  if (!S.timer) return '';
  const c = cat(S.timer.cat);
  return `<button class="tpill" data-a="timerStop" title="Sustabdyti"><span class="rec" style="background:${c.color}"></span>${esc(c.name)} · <span id="tElapsed">${timerElapsed()}</span><span class="stop"><i></i></span></button>`;
}
const clock = ts => { const s = Math.max(0, Math.floor((Date.now() - ts) / 1000)), h = Math.floor(s / 3600); return `${h ? h + ':' : ''}${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`; };
function timerElapsed() { return S.timer ? clock(S.timer.ts) : ''; }
A.timerStart = d => {
  if (d.cat) { S.timer = {cat: d.cat, start: nowHM(), date: today(), ts: Date.now()}; commit(); toast(`Laikmatis paleistas: ${esc(cat(d.cat).name)}`); return; }
  modal('Ką dabar veiki?', `<div class="catgrid">${S.categories.map(c => `<button type="button" class="catbtn" style="--c:${c.color}" data-a="timerStart" data-cat="${c.id}">${catDot(c)}<span>${esc(c.name)}</span></button>`).join('')}</div>
    `);
};
A.timerStart_orig = A.timerStart;
A.timerStart = d => { if (d.cat) A.closeModal(); A.timerStart_orig(d); };
A.timerStop = () => {
  const t = S.timer; if (!t) return;
  const end = nowHM();
  if (t.date === today()) S.timelog.push({id: uid(), date: t.date, start: t.start, end: toMin(end) > toMin(t.start) ? end : fromMin(toMin(t.start) + 1), cat: t.cat});
  else { S.timelog.push({id: uid(), date: t.date, start: t.start, end: '23:59', cat: t.cat}); S.timelog.push({id: uid(), date: today(), start: '00:00', end, cat: t.cat}); }
  const mins = Math.round((Date.now() - t.ts) / 60000);
  S.timer = null; commit();
  toast(`Įrašyta: ${fmtDur(mins)} – ${esc(cat(t.cat).name)}`, cat(t.cat).type === 1 ? 'good' : '');
};

// ================= REKOMENDACIJOS =================
// Baziniai valgymo laikai: tolygiai per dieną, pamažu pritaikomi prie tavo įpročių
function mealPlanTimes(d) {
  const p = S.profile, w = toMin(p.wake); let b = toMin(p.bed); if (b <= w) b += 1440;
  const first = w + 45, last = Math.min(b - 150, 1380), n = clamp(+S.foodPrefs.mealsPerDay || 3, 2, 6);
  const def = Array.from({length: n}, (_, i) => first + (last - first) * i / Math.max(1, n - 1));
  const h = mealHabits(def, d), r15 = x => Math.round(x / 15) * 15;
  let times = def.map((x, i) => r15(h ? x * 0.3 + h.c[i] * 0.7 : x)), skipped = [];
  if (h) { const keep = times.filter((t, i) => h.use[i] >= 0.35); if (keep.length >= 1) { skipped = times.filter((t, i) => h.use[i] < 0.35); times = keep; } }
  return {times, learned: !!h, skipped};
}
// Protingi valgymo laikai: darbe/paskaitose – „pasiimk su savimi“, su draugais/miegant – perkeliam prieš ar po
function mealTimes(d, sportSlot) {
  const {times, learned} = mealPlanTimes(d), busy = busyDetail(d), isToday = d === today(), now = nowMin();
  const free = (a, b) => a >= 0 && b <= 1440 && !busy.some(x => x.s < b && x.e > a) && !(sportSlot && sportSlot[0] < b && sportSlot[1] > a);
  const out = [];
  for (let t of times) {
    let note = '', kind = 'ok';
    if (sportSlot && t > sportSlot[0] - 60 && t < sportSlot[1]) {
      const pre = sportSlot[0] - 90, post = sportSlot[1] + 15;
      t = t - pre < post - t && free(pre, pre + 20) ? pre : post; note = t < sportSlot[0] ? 'prieš sportą' : 'po sporto – baltymų';
    }
    const b = busy.find(x => t >= x.s && t < x.e);
    if (b) {
      if (PACK_CATS.includes(b.cat)) {
        const dt = [-45, 45, -60, 60, -30, 30].find(x => free(t + x, t + x + 20));
        if (dt != null && b.e - b.s < 300) { t += dt; note = dt < 0 ? `prieš: ${b.name}` : `po: ${b.name}`; }
        else { kind = 'pack'; note = 'pasiimk su savimi'; }
      } else {
        const before = b.s - 30, after = b.e + 15, prev = out.length ? out[out.length - 1].t : -999;
        if (t - before <= 150 && before - prev >= 90 && free(before, before + 20)) { t = before; note = `prieš: ${b.name}`; }
        else if (after - t <= 150 && free(after, after + 20)) { t = after; note = `po: ${b.name}`; }
        else { kind = 'remind'; t = Math.max(b.s - 15, 0); note = `nepamiršk pavalgyti prieš: ${b.name}`; }
      }
    }
    if (out.length && t - out[out.length - 1].t < 90) continue;
    out.push({t: Math.round(t / 5) * 5, note, kind, pack: kind === 'pack', txt: fromMin(Math.round(t / 5) * 5)});
  }
  const bedM = toMin(S.profile.bed) <= toMin(S.profile.wake) ? toMin(S.profile.bed) + 1440 : toMin(S.profile.bed);
  const eaten = isToday ? S.meals.filter(m => m.date === d && m.time && !m.snack).map(m => toMin(m.time)) : [];
  return {list: out.filter(x => x.t <= bedM - 120 && (!isToday || (x.t > now - 30 && now < bedM - 120)) && !eaten.some(e => Math.abs(e - x.t) <= 75)), learned};
}
A.addMealAt = d => { UI.mealDate = d.d || today(); UI.mealTime = d.id; mealModal(); };
function busyAt(d, m) { return busyBlocks(d).find(([s, e]) => m >= s && m < e); }
function recommendations(d) {
  const p = S.profile, recs = [], isToday = d === today(), now = isToday ? nowMin() : 0;
  const slots = freeSlots(d, isToday ? now : null), bed = toMin(p.bed) || 1440;
  const ws = weekStart(d), weekW = S.workouts.filter(w => w.date >= ws && w.date <= addDays(ws, 6)).length;
  const doneToday = workoutsOn(d).length;
  const need = (+p.workoutMin || 40) + (+p.showerMin || 0) + (+p.travelMin || 0) * 2 + 10;
  let sportSlot = null;
  // --- Sportas
  const todaysPlan = plansOn(d)[0], target = sportHabit() ?? 17 * 60;
  if (todaysPlan) recs.push({icon:'🏋️', kind:'sport', title:`Suplanuota ${todaysPlan.start}: ${esc(wtypeName(todaysPlan.type))}`, text:`${todaysPlan.exercises?.length ? todaysPlan.exercises.length + ' pratimai · ' : ''}~${todaysPlan.duration} min.${todaysPlan.remind === false ? '' : ' Priminsiu 30 min prieš.'}`,
    act: btn('Pradėti', 'startPlan', {id: todaysPlan.id}, 'sm primary') + ' ' + btn('Padariau', 'planDone', {id: todaysPlan.id}, 'sm') + ' ' + btn('✏️', 'openPlan', {id: todaysPlan.id}, 'sm')});
  else if (!sportOn()) {
    // be sporto režimo – tik švelnus priminimas, jei anksčiau sportavai
    const last = [...S.workouts].sort((a, b) => a.date < b.date ? 1 : -1)[0], ago = last ? diffDays(last.date, d) : 0, slot = slots.find(([s, e]) => e - s >= 45);
    if (last && ago >= 7 && slot) recs.push({icon:'🚶', title:`Paskutinė treniruotė – prieš ${ago} d.`, text:`Jei norisi pajudėti, laisva ${fromMin(slot[0])}–${fromMin(slot[1])}.`});
  }
  else if (doneToday) recs.push({icon:'✅', kind:'good', title:'Treniruotė šiandien jau padaryta', text:'Šaunu! Nepamiršk baltymų per 2 val. po treniruotės ir gerai išsimiegoti.'});
  else if (weekW >= (+p.workoutsPerWeek || 3)) recs.push({icon:'🧘', title:'Savaitės treniruočių tikslas pasiektas', text:`${weekW}/${p.workoutsPerWeek} – šiandien gali ilsėtis arba trumpai pasivaikščioti.`});
  else {
    const cands = slots.filter(([s, e]) => e - s >= need).map(([s, e]) => {
      const st = clamp(target, s, e - need);
      let sc = -Math.abs(st - target); if (st + need > bed - 90) sc -= 300; if (st < toMin(p.wake) + 60) sc -= 120;
      return {st, sc};
    }).sort((a, b) => b.sc - a.sc);
    const sug = suggestWorkout(); const focus = sug.focus.map(g => MUSCLES[g]).join(', ');
    if (cands.length) {
      const st = cands[0].st; sportSlot = [st, st + need];
      recs.push({icon:'💪', kind:'sport', title:`Sportui: ${fromMin(st)}–${fromMin(st + need)}`,
        text:`${p.workoutMin} min treniruotė${+p.travelMin ? ` + ${p.travelMin * 2} min kelionė` : ''} + ${p.showerMin} min dušas + 10 min atsargai. Siūlomas fokusas: <b>${focus}</b> (seniausiai treniruota).`,
        act: btn('Suplanuoti šiam laikui', 'planWorkout', {start: fromMin(st), date: d}, 'sm primary'), slot: sportSlot});
    } else {
      const mini = slots.find(([s, e]) => e - s >= 25 + (+p.showerMin || 0) * 0.5);
      recs.push({icon:'⏳', kind:'warn', title: mini ? `Ilgam sportui laiko nėra – ${fromMin(mini[0])} tilptų 15 min mini treniruotė` : 'Šiandien sportui laiko nėra',
        text: `Reikia ~${need} min (su dušu). ${mini ? 'Greita: 3 ratai – 10 pritūpimų, 8 atsispaudimų, 30 s lenta.' : 'Pažiūrėk rytojaus laisvus langus kalendoriuje.'}`});
    }
  }
  // laisvi langai be suplanuoto sporto (gaminimui, užduotims)
  const slots2 = !sportSlot ? slots : slots.flatMap(([s, e]) => e <= sportSlot[0] || s >= sportSlot[1] ? [[s, e]] : [[s, sportSlot[0]], [sportSlot[1], e]]).filter(([s, e]) => e - s >= 15);
  // --- Valgymas
  const tg = targets(), nu = dayNutrition(d);
  const mt = foodOn() ? mealTimes(d, sportSlot) : {list: [], learned: false}, times = mt.list;
  if (times.length && !(isToday && S.foodPrefs.mealSuggest)) recs.push({icon:'🍽️', title:`Valgymo laikai: ${times.map(x => x.txt).join(' · ')}`,
    text:`${times.filter(x => x.note).map(x => `<b>${x.txt}</b> – ${esc(x.note)}`).join('; ')}${times.some(x => x.note) ? '. ' : ''}Liko <b>${Math.max(0, tg.kcal - netKcal(d))} kcal</b> ir <b>${Math.max(0, Math.round(tg.protein - nu.p))} g baltymų</b>.${mt.learned ? ' <small>Laikai pritaikyti prie tavo įpročių.</small>' : ''}`,
    act: btn('+ Maistas', 'addMeal', {}, 'sm')});
  // --- Pasiūlymas įjungti režimą, jei kažką naudoji daug
  const m14 = addDays(today(), -14);
  if (isToday && !foodOn() && !S.settings.dismissed.foodSuggest && S.meals.filter(m => m.date >= m14).length >= 10)
    recs.push({icon:'🍽️', title:'Daug įrašinėji maistą', text:'Nori, kad programėlė siūlytų, kada ir ką valgyti, ir skaičiuotų kalorijas pagal tikslą?', act: btn('Įjungti', 'enableMode', {k: 'food'}, 'sm primary') + ' ' + btn('Ne, ačiū', 'dismiss', {key: 'foodSuggest'}, 'sm ghost')});
  if (isToday && !sportOn() && !S.settings.dismissed.sportSuggest && S.workouts.filter(w => w.date >= m14).length >= 4)
    recs.push({icon:'💪', title:'Dažnai sportuoji', text:'Nori, kad programėlė siūlytų laiką sportui ir sudarytų treniruotes?', act: btn('Įjungti', 'enableMode', {k: 'sport'}, 'sm primary') + ' ' + btn('Ne, ačiū', 'dismiss', {key: 'sportSuggest'}, 'sm ghost')});
  // --- Kas greitai genda šaldytuve
  const soon = storageItems().filter(x => x.place === 'fridge' && x.left <= 1);
  if (isToday && soon.length && UI.view !== 'today') recs.push({icon:'⏰', kind:'warn', title: soon.length === 1 ? `Šaldytuve: ${esc(soon[0].r?.name || '')} – ${soon[0].left < 0 ? 'jau pasibaigė' : soon[0].left === 0 ? 'suvalgyk šiandien' : 'suvalgyk iki rytojaus'}` : `${soon.length} patiekalai šaldytuve greitai baigs galioti`,
    text: soon.map(x => `${esc(x.r?.name || '')} (${x.portions} porc., pagaminta ${relDay(x.date)})`).join(', ') + '. Jei nespėsi – užšaldyk, jei tinka.', act: btn('Atsargos', 'foodGo', {v: 'freezer'}, 'sm')});
  // --- Atšildymas rytojui
  if (isToday) {
    const tm = addDays(d, 1), longBusy = busyBlocks(tm).some(([s, e]) => e - s >= 240);
    if (longBusy && freezerPortions(null, 'freezer') > 0 && freezerPortions(null, 'fridge') === 0) recs.push({icon:'🧊', title:'Vakare išsiimk porciją rytojui', text:'Rytoj turi ilgą užimtą bloką, o šaldytuve tuščia – persikelk porciją iš šaldiklio, kad ryte tik pasiimtum.', act: btn('Atsargos', 'foodGo', {v: 'freezer'}, 'sm')});
  }
  // --- Gaminimas / įvairovė
  const fp = freezerPortions();
  if (foodOn() && fp < 5) {
    const top = suggestRecipes({freezableOnly: true})[0];
    if (top) {
      const cookSlot = slots2.find(([s, e]) => e - s >= top.r.time + 15);
      recs.push({icon:'👨‍🍳', kind: fp === 0 ? 'warn' : '', title: fp === 0 ? 'Šaldiklis tuščias – laikas gaminti!' : `Šaldiklyje liko tik ${fp} porc.`,
        text:`Siūlau: <b>${esc(top.r.name)}</b> – ${top.r.portions} porc., ${top.st.kcal} kcal ir ${top.st.p} g baltymų porcijai, ~${top.st.cost.toFixed(2).replace('.', ',')} €/porc. ${cookSlot ? `Laiko yra ${fromMin(cookSlot[0])}–${fromMin(cookSlot[1])}.` : `Šiandien ${top.r.time} min lango nėra – planuok ${(() => { const cd = S.foodPrefs.cookDays?.length ? S.foodPrefs.cookDays : [7]; for (let i = 1; i <= 7; i++) { const x = addDays(d, i); if (cd.includes(dow(x))) return i === 1 ? 'rytoj' : DOW_LONG[dow(x) - 1].toLowerCase(); } return 'savaitgalį'; })()}.`}`,
        act: btn('Receptas', 'viewRecipe', {id: top.r.id}, 'sm')});
    }
  }
  const usage = Object.entries(recipeUsage()).sort((a, b) => b[1] - a[1]);
  if (foodOn() && usage.length && usage[0][1] >= 5) {
    const r = recipe(usage[0][0]), alt = suggestRecipes().find(x => x.r.id !== usage[0][0] && x.r.tags.some(t => r?.tags.includes(t))) || suggestRecipes().find(x => x.r.id !== usage[0][0]);
    if (r && alt) recs.push({icon:'🔄', title:`${esc(r.name)} – jau ${usage[0][1]} kartų per 2 savaites`, text:`Kad neatsibostų, kitą kartą pabandyk <b>${alt.r.emoji} ${esc(alt.r.name)}</b> – panašu, bet kitaip.`, act: btn('Žiūrėti', 'viewRecipe', {id: alt.r.id}, 'sm')});
  }
  // --- Užduotys
  const urgent = S.tasks.filter(t => !t.done && t.due && diffDays(d, t.due) <= 3).sort((a, b) => a.due < b.due ? -1 : 1);
  if (urgent.length) {
    const t = urgent[0], free = slots2.find(([s, e]) => e - s >= Math.min(+t.est || 60, 90));
    const late = diffDays(d, t.due) < 0;
    recs.push({icon: late ? '🚨' : '📌', kind: late || (+t.progress || 0) < 50 ? 'warn' : '', title: `${late ? 'Pavėluota' : 'Artėja terminas'}: ${esc(t.title)} (${relDay(t.due)})`,
      text: !+t.est ? `Terminas ${relDay(t.due)}${t.dueTime ? ' ' + t.dueTime : ''}.${urgent.length > 1 ? ` Dar ${urgent.length - 1} užduotys per 3 d.` : ''}` : `${(+t.progress || 0) ? `Padaryta ${t.progress}%. ` : ''}${free ? `Laisvas langas: <b>${fromMin(free[0])}–${fromMin(free[1])}</b> – skirk ${fmtDur(Math.min(+t.est || 60, free[1] - free[0]))}.` : 'Šiandien laisvo lango beveik nėra – gal galima padaryti dalį?'}${urgent.length > 1 ? ` Dar ${urgent.length - 1} užduotis(-ys) per 3 d.` : ''}`,
      act: btn('Padaryta', 'toggleTask', {id: t.id}, 'sm') + ' ' + btn('Užduotys', 'go', {v: 'tasks'}, 'sm')});
  }
  // --- Miegas ir ekranas
  const sl = sleepOn(d);
  if (isToday && !sl) recs.push({icon:'😴', title:'Kaip miegojai?', text:'Įrašyk miegą – jis įskaičiuojamas į dienos įvertinimą.', act: btn('+ Miegas', 'addSleep', {}, 'sm')});
  else if (sl && sleepMinutes(sl) / 60 < (+p.sleepGoal || 8) - 1) recs.push({icon:'🛌', kind:'warn', title:`Miegojai tik ${round(sleepMinutes(sl) / 60, 1)} val.`, text:`Šiandien gulkis iki ${p.bed}, o 30 min prieš miegą – be ekranų. Pavargęs kūnas sunkiau atsisako užkandžių.`});
  const yt = dayTime(addDays(d, -1));
  if (yt.screen > (+p.screenLimitMin || 90)) recs.push({icon:'📺', kind:'warn', title:`Vakar ekranui – ${fmtDur(yt.screen)} (limitas ${fmtDur(+p.screenLimitMin || 90)})`, text:'Šiandien pabandyk: pirmiausia vienas svarbus darbas, serialai – kaip prizas po jo.'});
  return {recs, sportSlot, mealTimes: times};
}
A.foodGo = d => { A.closeModal(); UI.view = 'food'; UI.food = d.v; render(); window.scrollTo(0, 0); };

// ================= KĄ VALGYTI KADA (pasirenkama) =================
// Paskirsto atsargų porcijas valgymams: pirmiausia tai, kas greičiau genda; prieš sportą – lengviau, po sporto – baltymai,
// pusryčiams – „pusryčių“ patiekalai, sunkesnis patiekalas – pietums, ne vakare prieš miegą
function mealSuggestions(d, times, sportSlot) {
  const pool = storageItems().filter(x => x.left >= 0 && x.r).map(x => ({...x, n: x.portions}));
  const planned = (S.mealPlans || []).filter(p => p.date === d);
  return times.map((slot, i) => {
    const pl = planned.find(p => Math.abs(toMin(p.time) - slot.t) <= 90);
    if (pl) return {slot, planned: pl, r: recipe(pl.recipeId)};
    let best = null, bs = -1e9, why = '';
    for (const x of pool) {
      if (x.n <= 0) continue;
      const st = recipeStats(x.r), tags = x.r.tags, heavy = st.kcal > 600 || st.f > 25;
      let s = -x.left * 3 - (x.place === 'freezer' ? 2 : 0), w = x.left <= 1 ? 'greitai genda' : x.place === 'freezer' ? 'atšildyk iš anksto' : '';
      if (i === 0) { if (tags.includes('pusryčiai')) { s += 6; w = w || 'pusryčiams'; } else if (heavy) s -= 3; }
      else if (tags.includes('pusryčiai')) s -= 4;
      if (heavy && i === times.length - 1) s -= 3;
      if (heavy && i > 0 && i < times.length - 1) { s += 2; w = w || 'sotesnis – pietums'; }
      if (sportSlot && slot.t < sportSlot[0] && sportSlot[0] - slot.t <= 180) { if (st.f > 20) s -= 4; else { s += 1; w = w || 'lengvesnis prieš sportą'; } }
      if (sportSlot && slot.t >= sportSlot[1] && slot.t - sportSlot[1] <= 150) { s += st.p / 8; w = w || 'baltymai po sporto'; }
      if (s > bs) { bs = s; best = x; why = w; }
    }
    if (best) best.n--;
    return {slot, item: best, r: best?.r, why};
  });
}
function mealSuggestCard(d, times, sportSlot) {
  const sug = mealSuggestions(d, times, sportSlot);
  if (!sug.length) return '';
  const body = sug.map((x, i) => `<div class="msug"><b class="mt3">${fromMin(x.slot.t)}</b>${x.slot.pack ? '<span class="tag warn">dėžutėje</span>' : ''}
    ${x.r ? `<span class="mf-fi sm">${foodIcon(x.r.name)}</span><span class="grow">${esc(x.r.name)} <small>${x.planned ? 'suplanuota' : `${x.item.place === 'fridge' ? 'iš šaldytuvo' : 'iš šaldiklio'} ${x.why ? '· ' + x.why : ''}`}</small></span>${btn('Valgau', 'eatSuggested', {i, d}, 'sm primary')}`
      : `<span class="grow muted">${storageItems().length ? 'atsargų nebeliko' : 'atsargų nėra – greitas valgis'}</span>${btn('+', 'addMeal', {}, 'sm')}`}</div>`).join('');
  return card('Ką valgyti šiandien', body + `<div class="choice row">${btn('Įdėti į dienos planą', 'planMeals', {d}, 'sm')}${btn('Išjungti pasiūlymus', 'mealSuggestOff', {}, 'sm ghost')}</div>`);
}
A.eatSuggested = d => {
  const {mealTimes, sportSlot} = recommendations(d.d), x = mealSuggestions(d.d, mealTimes, sportSlot)[+d.i]; if (!x || !x.r) return;
  const st = recipeStats(x.r), it = x.item || storageItems().find(s => s.recipeId === x.r.id);
  S.meals.push({id: uid(), date: today(), time: nowHM(), name: x.r.name, recipeId: x.r.id, portions: 1, ...nutrOf(st, 1)});
  if (it) takePortion(it.id, 1);
  if (x.planned) S.mealPlans = S.mealPlans.filter(p => p !== x.planned && p.id !== x.planned.id);
  commit(); toast(`🍽️ ${esc(x.r.name)} – ${st.kcal} kcal`);
};
A.planMeals = d => {
  const {mealTimes, sportSlot} = recommendations(d.d);
  for (const x of mealSuggestions(d.d, mealTimes, sportSlot)) if (x.r && !x.planned) S.mealPlans.push({id: uid(), date: d.d, time: fromMin(x.slot.t), recipeId: x.r.id});
  commit(); toast('📅 Maistas įdėtas į dienos planą');
};
A.mealSuggestOff = () => { S.foodPrefs.mealSuggest = false; commit(); toast('Išjungta. Įjungti galėsi Mityba → Atsargos.'); };
A.eatPlanned = d => { const p = (S.mealPlans || []).find(x => x.id === d.id); if (!p) return; const r = recipe(p.recipeId); if (!r) return;
  modal(`${esc(r.name)}`, `<p>Suplanuota ${p.time}.</p><div class="choice">${btn('Suvalgiau', 'eatPlannedGo', {id: p.id}, 'primary big')}${btn('Pašalinti iš plano', 'unplanMeal', {id: p.id}, 'big')}</div>`); };
A.eatPlannedGo = d => { const p = S.mealPlans.find(x => x.id === d.id), r = recipe(p.recipeId), st = recipeStats(r), it = storageItems().find(s => s.recipeId === r.id);
  S.meals.push({id: uid(), date: p.date, time: nowHM(), name: r.name, recipeId: r.id, portions: 1, ...nutrOf(st, 1)}); if (it) takePortion(it.id, 1);
  S.mealPlans = S.mealPlans.filter(x => x !== p); A.closeModal(); commit(); toast(`🍽️ ${esc(r.name)} – ${st.kcal} kcal`); };
A.unplanMeal = d => { S.mealPlans = S.mealPlans.filter(x => x.id !== d.id); A.closeModal(); commit(); };

// ================= LAIKO JUOSTA =================
function timeline(d, o = {}) {
  const p = S.profile, scale = o.scale || 0.9;
  const h0 = 0, h1 = 24; // visa para
  const top = m => (m - h0 * 60) * scale;
  const items = [];
  for (const g of eventSegs(d)) { const e = g.e, c = cat(e.cat); items.push({s: g.s, e: g.en, title: e.title + (g.tail ? ' (tęsinys)' : g.head ? ' →' : ''), sub: timeText(e), color: c.color, emoji: c.emoji, a: 'eventInfo', id: e.id, cls: 'ev' + (g.head ? ' head' : '') + (g.tail ? ' tail' : '')}); }
  for (const p of plansOn(d)) items.push({s: toMin(p.start), e: toMin(p.start) + (+p.duration || 40), title: wtypeName(p.type), sub: `suplanuota · ${p.duration} min`, color: '#22c55e', emoji: '🏋️', a: 'openPlan', id: p.id, cls: 'sug plan'});
  if (o.sportSlot && plansOn(d).length) o.sportSlot = null;
  for (const mp of (S.mealPlans || []).filter(x => x.date === d)) { const r = recipe(mp.recipeId); if (r) items.push({s: toMin(mp.time), e: toMin(mp.time) + 25, title: r.name, sub: `${mp.time} · suplanuotas valgis`, color: '#f97316', emoji: '🍽️', a: 'eatPlanned', id: mp.id, cls: 'sug meal'}); }
  for (const t of timelogOn(d)) { const c = cat(t.cat); let en = toMin(t.end); if (en <= toMin(t.start)) en = 1440; items.push({s: toMin(t.start), e: en, title: c.name, sub: `${t.start}–${t.end}${t.note ? ' · ' + t.note : ''}`, color: c.color, emoji: c.emoji, a: 'editLog', id: t.id, cls: 'log'}); }
  for (const w of workoutsOn(d)) if (w.start) items.push({s: toMin(w.start), e: toMin(w.start) + (+w.duration || 30), title: 'Treniruotė', sub: `${w.duration} min`, color: '#22c55e', emoji: '💪', a: 'viewWorkout', id: w.id, cls: 'log'});
  if (S.timer && S.timer.date === d) { const c = cat(S.timer.cat); items.push({s: toMin(S.timer.start), e: Math.max(nowMin(), toMin(S.timer.start) + 5), title: c.name + ' (vyksta)', sub: 'laikmatis', color: c.color, emoji: c.emoji, a: 'timerStop', cls: 'log live'}); }
  if (S.active && S.active.date === d) items.push({s: toMin(S.active.start), e: Math.max(nowMin(), toMin(S.active.start) + 5), title: 'Treniruotė (vyksta)', sub: 'spausk – atidaryti', color: '#22c55e', emoji: '🏋️', a: 'workoutMode', cls: 'log live'});
  if (o.sportSlot) items.push({s: o.sportSlot[0], e: o.sportSlot[1], title: 'Siūlomas sportas – spausk planuoti', sub: `${fromMin(o.sportSlot[0])}–${fromMin(o.sportSlot[1])}`, color: '#22c55e', emoji: '💡', a: 'planWorkout', id: fromMin(o.sportSlot[0]), cls: 'sug'});
  // siūlomi valgymo laikai (mitybos režime)
  if (foodOn() && d >= today()) {
    const near = (t, list) => list.some(x => Math.abs(x - t) < 60);
    const taken = [...(S.mealPlans || []).filter(x => x.date === d).map(x => toMin(x.time)), ...mealsOn(d).filter(x => x.time).map(x => toMin(x.time))];
    for (const m of mealTimes(d, o.sportSlot).list) if (!near(m.t, taken)) items.push({s: m.t, e: m.t + 20, title: m.kind === 'pack' ? 'Maistas – pasiimk' : m.kind === 'remind' ? 'Nepamiršk pavalgyti' : 'Maistas', sub: m.note || 'siūlomas laikas', color: '#f97316', emoji: '🍽️', a: 'addMealAt', id: fromMin(m.t), cls: 'sug meal'});
  }
  items.sort((a, b) => a.s - b.s);
  // juostos persidengimams
  const lanes = [];
  for (const it of items) { let l = lanes.findIndex(end => end <= it.s); if (l < 0) { l = lanes.length; lanes.push(0); } lanes[l] = it.e; it.lane = l; }
  const L = Math.max(1, lanes.length);
  // į kur nuslinkti: dabartinis laikas (šiandien) arba pirmas įvykis / kėlimasis
  const focusM = d === today() ? nowMin() - 120 : Math.min(toMin(p.wake), ...items.map(i => i.s)) - 60;
  let html = `${o.compact ? '' : `<div class="tlscroll" data-st="${Math.max(0, top(focusM))}">`}<div class="tlw ${o.compact ? 'compact' : ''}"><div class="tl-hours">`;
  for (let h = h0; h <= h1; h++) html += `<div class="hr" style="top:${top(h * 60)}px">${pad(h % 24)}:00</div>`;
  html += `</div><div class="tl" data-a="tlClick" data-d="${d}" data-h0="${h0}" data-sc="${scale}" style="height:${(h1 - h0) * 60 * scale}px">`;
  for (let h = h0; h < h1; h++) html += `<div class="hl" style="top:${top(h * 60)}px"></div>`;
  // miegas
  const wake = toMin(p.wake), bed = toMin(p.bed);
  // neutralus nakties fonas (ne „miegas“ – naktį gali ir dirbti, ir mokytis)
  const nz = (a, b) => b > a ? `<div class="nightz" style="top:${top(a)}px;height:${(b - a) * scale}px"></div>` : '';
  html += nz(0, 360) + nz(1320, 1440);
  // tikras miegas – tik jei įrašytas
  const sleepSegs = [];
  const sT = sleepOn(d); if (sT) { const b = toMin(sT.bed), w = toMin(sT.wake); sleepSegs.push(b < w ? [b, w] : [0, w]); }
  const sN = sleepOn(addDays(d, 1)); if (sN) { const b = toMin(sN.bed), w = toMin(sN.wake); if (b > w) sleepSegs.push([b, 1440]); }
  for (const [a, b] of sleepSegs) if (b > a) html += `<div class="sleepz" style="top:${top(a)}px;height:${(b - a) * scale}px" data-a="addSleep"><span>😴 Miegas</span></div>`;
  if (o.free) for (const [s, e] of freeSlots(d)) html += `<div class="freez" style="top:${top(s)}px;height:${(e - s) * scale}px"><span>laisva ${fmtDur(e - s)}</span></div>`;
  for (const it of items) {
    const hgt = Math.max(16, (it.e - it.s) * scale);
    html += `<div class="blk ${it.cls}" data-a="${it.a}" data-id="${it.id || ''}" data-d="${d}" style="top:${top(it.s)}px;height:${hgt}px;left:calc(${it.lane / L * 100}% + 2px);width:calc(${100 / L}% - 4px);--c:${it.color}" title="${esc(it.title)} ${esc(it.sub)}"><b>${esc(it.title)}</b>${hgt > 30 ? `<small>${esc(it.sub)}</small>` : ''}</div>`;
  }
  if (d === today()) html += `<div class="nowl" style="top:${top(nowMin())}px"><span>${nowHM()}</span></div>`;
  html += `</div></div>${o.compact ? '' : '</div>'}`;
  return html;
}
// po piešimo nuslenkam laiko juostas iki svarbios vietos
function scrollTimelines() {
  document.querySelectorAll('.tlscroll').forEach(el => { el.scrollTop = +el.dataset.st || 0; });
  document.querySelectorAll('.weekscroll').forEach(el => { el.scrollTop = +el.dataset.st || 0; });
}
A.tlClick = (d, el, ev) => {
  if (ev.target !== el && !ev.target.classList.contains('hl') && !ev.target.classList.contains('freez') && !ev.target.closest('.freez')) return;
  const r = el.getBoundingClientRect(), m = Math.round(((ev.clientY - r.top) / +d.sc + +d.h0 * 60) / 15) * 15;
  modal(`${fmtDateDow(d.d)} · ${fromMin(m)}`, `<div class="choice">
    ${btn('Nauja veikla (paskaita, darbas…)', 'addEvent', {date: d.d, start: fromMin(m)}, 'big')}
    ${btn('Įrašyti, ką veikiau', 'addLog', {date: d.d, start: fromMin(m)}, 'big')}
    ${btn('Įrašyti treniruotę', 'addWorkout', {date: d.d, start: fromMin(m)}, 'big')}</div>`);
};

// ================= ŠIANDIEN =================
// Mažas žiedas (vienos spalvos atspalviai)
const miniRing = (p, color) => { const r = 26, L = 2 * Math.PI * r, v = Math.max(0, Math.min(1, +p || 0)); return `<svg class="r" viewBox="0 0 62 62"><circle cx="31" cy="31" r="${r}" fill="none" stroke="var(--card2)" stroke-width="7"/>${v ? `<circle cx="31" cy="31" r="${r}" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${L * v} ${L}" transform="rotate(-90 31 31)"/>` : ''}</svg>`; };
const REC_IC = {sport: 'gym', good: 'check', warn: 'bulb', food: 'food', meal: 'food', sleep: 'moon'};
const recIcon = r => ic(REC_IC[r.kind] || (/🍽|🥗|🧊|⏰|🍳/.test(r.icon || '') ? 'food' : /😴|🛌/.test(r.icon || '') ? 'moon' : /📺|📱/.test(r.icon || '') ? 'clock' : 'bulb'));
const scoreWord = s => s == null ? '' : s >= 75 ? 'gera diena' : s >= 50 ? 'neblogai' : 'rami diena';
function vToday() {
  const d = today(), p = S.profile, tg = targets(), nu = dayNutrition(d), t = dayTime(d), sc = dayScore(d), g = gamification();
  const sl = sleepOn(d), mot = motivation(), {recs, sportSlot, mealTimes} = recommendations(d);
  const hour = Math.floor(nowMin() / 60), hi = hour < 11 ? 'Labas rytas' : hour < 17 ? 'Laba diena' : 'Labas vakaras';
  const ci = checkinDue(), mood = dayMood(d), now = nowMin();
  const dueTasks = S.tasks.filter(x => !x.done && x.due && x.due <= addDays(d, 7)).sort((a, b) => a.due < b.due ? -1 : 1).slice(0, 6);
  const next = [...eventsOn(d).filter(e => toMin(e.end || e.start) >= now).map(e => ({t: e.start, n: e.title, c: cat(e.cat).color, s: e.end ? `iki ${e.end}` : '', a: 'calDay'})),
    ...plansOn(d).filter(x => toMin(x.start) >= now - 30).map(x => ({t: x.start, n: wtypeName(x.type), c: 'var(--s1)', s: `~${x.duration} min`, a: 'go', v: 'sport'}))].sort((a, b) => toMin(a.t) - toMin(b.t)).slice(0, 5);
  const hero = `<div class="td-hero"><div class="td-talk"><span data-a="addWell">${daigelis(mood || 4)}</span><div class="td-bubble">${(mot.length ? mot.slice(0, 2) : [{t: `${hi}! Ką šiandien nuveiksim?`}]).map(m => `<p>${noEmo(m.t)}</p>`).join('')}</div></div>
    <div class="td-score" data-a="scoreInfo" data-d="${d}"><span class="num">${sc ? sc.score : '–'}</span><span>${sc?.live || !sc ? 'Balas kol kas' : 'Dienos balas'}${sc ? ' · ' + scoreWord(sc.score) : ''}</span></div>
    <div class="td-xp"><div class="pbar"><i style="width:${Math.round((g.xp - g.cur) / Math.max(1, g.next - g.cur) * 100)}%"></i></div><small>${g.level} lygis · ${g.xp} XP · iki kito ${g.next - g.xp} XP${g.streak > 1 ? ` · ${g.streak} d. serija` : ''}</small></div></div>`;
  const prodGoal = (+p.prodGoalH || 6) * 60, scrLim = +p.screenLimitMin || 90, slGoal = (+p.sleepGoal || 8) * 60;
  const day = `<section class="card td-card"><h2>Tavo diena <small>iki dabar</small></h2><div class="td-stats">
    <div class="td-st" data-a="go" data-v="time">${miniRing(t.prod / prodGoal, 'var(--s1)')}<b>${fmtH(t.prod).replace(' val', ' h')}</b><span>produktyvu iš ${+p.prodGoalH || 6}</span></div>
    <div class="td-st" data-a="go" data-v="time">${miniRing(t.screen / scrLim, 'var(--s2)')}<b>${fmtDur(t.screen)}</b><span>ekrane iš ${scrLim}</span></div>
    <div class="td-st" data-a="addSleep">${miniRing(sl ? sleepMinutes(sl) / slGoal : 0, 'var(--s3)')}<b>${sl ? fmtNum(round(sleepMinutes(sl) / 60, 1)) + ' h' : '–'}</b><span>${sl ? `miegas iš ${+p.sleepGoal || 8}` : 'miegas · įrašyk'}</span></div>
    <div class="td-st" data-a="addSteps">${miniRing(sportOn() ? stepsOn(d) / stepGoal() : stepsOn(d) ? 1 : 0, 'var(--br)')}<b>${stepsOn(d) ? fmtSteps(stepsOn(d)) : '–'}</b><span>${stepsOn(d) ? `žingsn. · ${fmtNum(stepsKm(stepsOn(d)))} km` : 'žingsniai · įrašyk'}</span></div></div></section>`;
  const moodCard = `<section class="card td-card"><div class="td-mood"><span data-a="addWell">${daigelis(mood || 3)}</span><div><b>${mood ? `Šiandien – ${MOODS[mood - 1][1].toLowerCase()}` : 'Kaip jautiesi?'}</b><p>${mood ? moodLine(d, mood) : 'Paspausk Daigelį, kuris tinka'}</p></div></div>
    <div class="td-mpick">${MOODS.map((m, i) => `<button class="${mood === i + 1 ? 'sel' : ''}" data-a="quickMood" data-m="${i + 1}">${daigelis(i + 1)}${m[1]}</button>`).join('')}</div></section>`;
  const plan = `<section class="card td-card"><h2>Šiandien toliau ${btn('Visa diena', 'calDay', {d}, 'sm ghost')}</h2>${next.length ? next.map(x => `<div class="td-ev" data-a="${x.a}" ${x.a === 'go' ? `data-v="${x.v}"` : `data-d="${d}"`}><b>${x.t}</b><i class="dot" style="background:${x.c}"></i><span>${esc(x.n)}</span><small>${x.s}</small></div>`).join('') : empty('Šiandien daugiau nieko suplanuota')}</section>`;
  const dl = `<section class="card td-card"><h2>Artimiausi terminai ${btn(ic('plus', 'sm'), 'addTask', {}, 'sm ghost')}</h2>${dueTasks.length ? dueTasks.map(x => { const dd = diffDays(d, x.due), when = dd < 0 ? `vėluoja ${-dd} d.` : dd === 0 ? 'šiandien' : dd === 1 ? 'rytoj' : `po ${dd} d.`;
    return `<div class="td-dl" data-a="editTask" data-id="${x.id}"><span>${esc(x.title)}</span>${+x.progress ? `<span class="pb"><i style="width:${+x.progress}%"></i></span>` : ''}<small class="${dd < 0 ? 'late' : ''}">${when}${+x.progress ? ` · ${+x.progress}%` : ''}</small></div>`; }).join('') : empty('Terminų nėra')}</section>`;
  const fridge = storageItems().filter(x => x.place === 'fridge' && x.left <= 1).map(x => x.r?.name).filter(Boolean);
  const food = foodOn() || S.meals.length || fridge.length ? `<section class="card td-card"><h2>Mityba ${foodOn() && !tg.missing.length ? `<small>tikslas ${tg.kcal} kcal</small>` : ''}</h2>
    ${dayBurn(d) ? `<div class="td-kcal"><span class="num">${netKcal(d)}</span><span>kcal grynai</span></div><p class="td-net">${nu.kcal} valgyta − ${dayBurn(d)} sudeginta einant</p>` : `<div class="td-kcal"><span class="num">${nu.kcal}</span><span>kcal valgyta</span></div>`}
    ${foodOn() && !tg.missing.length ? `<div class="td-macro"><i title="Baltymai"><u style="width:${Math.min(100, nu.p / Math.max(1, tg.protein) * 100)}%"></u></i><i title="Kalorijos"><u style="width:${Math.min(100, nu.kcal / Math.max(1, tg.kcal) * 100)}%;opacity:.55"></u></i></div>` : ''}
    <div class="td-ml"><span>Baltymai ${Math.round(nu.p)}${foodOn() && tg.protein ? ` / ${tg.protein}` : ''} g</span><span>Angliav. ${Math.round(nu.c)} g</span><span>Riebalai ${Math.round(nu.f)} g</span></div>
    ${fridge.length ? `<div class="td-fridge">Šaldytuve greitai baigs galioti: ${esc(fridge.slice(0, 3).join(', '))}</div>` : ''}
    ${foodOn() && tg.missing.length ? `<p class="hint">Kad apskaičiuotume normas, įrašyk: ${esc(tg.missing.join(', '))}. ${btn('Profilis', 'go', {v: 'settings'}, 'sm')}</p>` : ''}
    <div class="choice row" style="margin-top:10px">${btn(`${ic('plus', 'sm')} Įrašyti maistą`, 'addMeal', {}, 'primary sm')}</div></section>` : '';
  const tips = recs.length ? `<section class="card td-card"><h2>Patarimai šiandienai</h2>${recs.map(r => `<div class="td-tip"><span class="ic">${recIcon(r)}</span><div><b>${r.title}</b><p>${r.text}</p>${r.act ? `<div class="ra">${r.act}</div>` : ''}</div></div>`).join('')}</section>` : '';
  const checkin = ci ? `<div class="banner" data-a="checkin" data-t="${ci}"><b>${ci === 'week' ? 'Kaip praėjo savaitė?' : 'Kaip praėjo mėnuo?'}</b> Trumpa apžvalga su tavo statistika. <span class="sp"></span><button class="btn sm primary">Pradėti</button></div>` : '';
  const meals = S.foodPrefs.mealSuggest ? mealSuggestCard(d, mealTimes, sportSlot) : '';
  return `<div class="td-hello">${hi}${p.name ? ', ' + esc(p.name) : ''}</div>
  <div class="td-grid"><div>${hero}${checkin}${day}${moodCard}${tips}</div><div style="margin-top:12px">${plan}${dl}${meals}${food}</div></div>`;
}
A.scoreInfo = d => {
  const sc = dayScore(d.d);
  modal(`Dienos balas · ${fmtDate(d.d)}`, sc ? `<div class="big-score" style="color:${scoreColor(sc.score)}">${sc.score}</div>${sc.live ? '<p class="center hint">Diena dar vyksta – vertinama tik tai, kas jau įvyko.</p>' : ''}
    ${sc.parts.map(x => `<div class="sc-part"><div class="bar-row"><span>${x.k} <small>(${x.w}%)</small></span><div class="pbar"><i style="width:${x.v * 100}%;background:${scoreColor(x.v * 100)}"></i></div><b>${Math.round(x.v * 100)}</b></div><small>${x.txt} · ${x.why}</small></div>`).join('')}
    <h4>Kaip skaičiuojama</h4><p class="hint">Kiekviena dalis gauna 0–100, o balas – jų vidurkis pagal svorius (skliausteliuose). Įtraukiama tik tai, ką įrašei – tuščia diena nėra bloga diena. Ateities dienos nevertinamos, o darbas, paskaitos ar naktinė pamaina balo nemažina.</p>` : empty(d.d > today() ? 'Ateities dienos nevertinamos 🙂' : 'Šiai dienai dar nėra įrašų.'));
};

// ================= KALENDORIUS =================
function vCalendar() {
  const c = UI.cal, d = c.date;
  const nav = `<div class="seg">${[['day', 'Diena'], ['week', 'Savaitė'], ['month', 'Mėnuo']].map(([m, l]) => `<button class="${c.mode === m ? 'on' : ''}" data-a="calMode" data-m="${m}">${l}</button>`).join('')}</div>
    <div class="navd">${btn('‹', 'calNav', {n: -1}, 'sm')}${btn('Šiandien', 'calToday', {}, 'sm')}${btn('›', 'calNav', {n: 1}, 'sm')}</div>
    ${btn('+ Veikla', 'addEvent', {date: d}, 'primary sm')}`;
  let body = '';
  if (c.mode === 'day') {
    const {recs, sportSlot} = recommendations(d);
    body = `<h2 class="dh">${fmtDateDow(d)}</h2><div class="grid2"><div>${card('', timeline(d, {free: true, sportSlot: d >= today() ? sportSlot : null}))}</div>
      <div>${card('Rekomendacijos', recs.map(r => `<div class="rec ${r.kind || ''}"><div class="ri">${r.icon}</div><div class="rb"><b>${r.title}</b><p>${r.text}</p></div></div>`).join(''))}
      ${card('Laisvi langai', freeSlots(d).map(([s, e]) => `<div class="li">🟢 ${fromMin(s)}–${fromMin(e)} <small>${fmtDur(e - s)}</small></div>`).join('') || empty('Laisvų langų nėra'))}
      ${daySummaryCard(d)}</div></div>`;
  } else if (c.mode === 'week') {
    const ws = weekStart(d), days = range(ws, 7);
    const WS = 0.7, stW = Math.max(0, (Math.min(toMin(S.profile.wake), days.includes(today()) ? nowMin() - 180 : 1440) - 60) * WS);
    const gutter = `<div class="wgut"><div class="wh"></div><div class="gh" style="height:${1440 * WS}px">${Array.from({length: 24}, (_, h) => `<span style="top:${h * 60 * WS}px">${pad(h)}:00</span>`).join('')}</div></div>`;
    body = `<h2 class="dh">${fmtDate(ws)} – ${fmtDate(addDays(ws, 6))}</h2><div class="weekscroll" data-st="${stW}"><div class="week">${gutter}${days.map(x => {
      const sc = dayScore(x);
      return `<div class="wcol ${x === today() ? 'today' : ''}"><div class="wh" data-a="calDay" data-d="${x}"><span><b>${DOW[dow(x) - 1]}</b> ${parseD(x).getDate()} ${MONTHS_G[parseD(x).getMonth()].slice(0, 4)}.</span>${sc ? `<i style="background:${scoreColor(sc.score)}">${sc.score}</i>` : ''}</div>${timeline(x, {scale: WS, compact: true, sportSlot: x === today() ? recommendations(x).sportSlot : null})}</div>`;
    }).join('')}</div></div>`;
  } else {
    const ms = monthStart(d), n = daysInMonth(d), pre = dow(ms) - 1, days = range(ms, n), td = today(), mob = innerWidth < 700;
    const sel = c.sel && c.sel.slice(0, 7) === ms.slice(0, 7) ? c.sel : td.slice(0, 7) === ms.slice(0, 7) ? td : null;
    let cells = '<div class="mc out"></div>'.repeat(pre);
    for (const x of days) {
      const sc = dayScore(x), evs = eventsOn(x), tasks = S.tasks.filter(t => t.due === x && !t.done), wd = workoutsOn(x).length, pl = plansOn(x).length, mood = x <= td ? dayMood(x) : 0;
      const show = evs.slice(0, mob ? 4 : 3);
      cells += `<div class="mc ${x === td ? 'today' : ''} ${x === sel ? 'sel' : ''} ${x < td ? 'past' : ''}" data-a="calPick" data-d="${x}" style="${sc ? `--sc:${scoreColor(sc.score)}` : ''}">
        <div class="mn"><span>${parseD(x).getDate()}</span>${mood ? `<em>${MOODS[mood - 1][0]}</em>` : ''}${sc ? `<i>${sc.score}</i>` : ''}</div>
        <div class="mev">${show.map(e => `<div class="me" style="--c:${cat(e.cat).color}" title="${esc(e.start + ' ' + e.title)}"><b>${e.start}</b> ${esc(e.title)}</div>`).join('')}${evs.length > show.length ? `<div class="more">+${evs.length - show.length}</div>` : ''}</div>
        <div class="mic">${tasks.length ? `<span title="Užduotys">📌${tasks.length > 1 ? tasks.length : ''}</span>` : ''}${wd ? '<span title="Sportavai">💪</span>' : pl ? '<span title="Suplanuota treniruotė">🏋️</span>' : ''}</div></div>`;
    }
    // mėnesio suvestinė (tik praėjusios dienos ir šiandiena)
    const past = days.filter(x => x <= td), scs = past.map(dayScore).filter(Boolean), moods = past.map(dayMood).filter(Boolean);
    const wo = past.reduce((a, x) => a + workoutsOn(x).length, 0), prod = past.reduce((a, x) => a + dayTime(x).prod, 0), evN = days.reduce((a, x) => a + eventsOn(x).length, 0);
    const taskN = S.tasks.filter(t => t.due && t.due.slice(0, 7) === ms.slice(0, 7)), taskDone = taskN.filter(t => t.done).length;
    const stat = (v, l) => `<div><b>${v}</b><small>${l}</small></div>`;
    const summary = `<div class="mstats">${stat(evN, 'veiklų')}${stat(taskN.length ? `${taskDone}/${taskN.length}` : '–', 'užduočių atlikta')}${stat(wo, 'treniruočių')}${stat(fmtH(prod), 'produktyvaus laiko')}${scs.length ? stat(Math.round(sum(scs.map(x => x.score)) / scs.length), 'vid. dienos balas') : ''}${moods.length ? stat(MOODS[Math.round(sum(moods) / moods.length) - 1][0], 'vid. savijauta') : ''}</div>`;
    body = `<h2 class="dh">${MONTHS[parseD(d).getMonth()][0].toUpperCase() + MONTHS[parseD(d).getMonth()].slice(1)} ${parseD(d).getFullYear()}</h2>${summary}
      <div class="month">${DOW.map(x => `<div class="mhd">${x}</div>`).join('')}${cells}</div>${sel ? monthDayPanel(sel) : '<p class="hint center">Paspausk dieną – pamatysi, kas tą dieną vyksta.</p>'}`;
  }
  return `<div class="toolbar">${nav}${btn('Pasikartojantys', 'manageEvents', {}, 'sm')}</div>${body}`;
}
function daySummaryCard(d) {
  const t = dayTime(d), nu = dayNutrition(d), sl = sleepOn(d), w = workoutsOn(d);
  return card('Dienos suvestinė', `<div class="kv"><span>Produktyvu</span><b>${fmtH(t.prod)}</b><span>Ekranas</span><b>${fmtDur(t.screen)}</b><span>Suvalgyta</span><b>${nu.kcal} kcal · ${Math.round(nu.p)} g B</b>${stepsOn(d) ? `<span>Žingsniai</span><b>${fmtSteps(stepsOn(d))} · ${fmtNum(stepsKm(stepsOn(d)))} km · −${dayBurn(d)} kcal</b>` : ''}<span>Miegas</span><b>${sl ? round(sleepMinutes(sl) / 60, 1) + ' val' : '–'}</b><span>Treniruotės</span><b>${w.length ? w.map(x => x.duration + ' min').join(', ') : '–'}</b></div>`);
}
A.calMode = d => { UI.view = 'calendar'; UI.cal.mode = d.m; render(); };
// Mėnesio vaizde: pirmas paspaudimas – dienos santrauka apačioje, antras – atidaro dieną
A.calPick = d => { if (UI.cal.sel === d.d) return A.calDay(d); UI.cal.sel = d.d; render(); setTimeout(() => $('#mdp')?.scrollIntoView({behavior: 'smooth', block: 'nearest'}), 60); };
function monthDayPanel(x) {
  const td = today(), evs = eventsOn(x), tasks = S.tasks.filter(t => t.due === x && !t.done), done = S.tasks.filter(t => t.done && t.doneAt === x);
  const w = workoutsOn(x), pl = plansOn(x), nu = dayNutrition(x), sl = sleepOn(x), mood = dayMood(x), sc = dayScore(x), tm = dayTime(x);
  const li = (ic, main, sub = '') => `<div class="li"><span class="em2">${ic}</span><span class="grow">${main}${sub ? `<small>${sub}</small>` : ''}</span></div>`;
  const rows = [
    ...evs.map(e => li(catDot(cat(e.cat)), `<b>${e.start}${e.end ? '–' + e.end : ''}</b> ${esc(e.title)}`, +e.travel ? `kelionė ${e.travel} min` : '')),
    ...tasks.map(t => li('📌', esc(t.title), `${x < td ? 'nepadaryta' : 'terminas'}${t.dueTime ? ' ' + t.dueTime : ''}${+t.progress ? ` · ${t.progress}%` : ''}`)),
    ...done.map(t => li('✅', esc(t.title), 'atlikta')),
    ...w.map(o => li('💪', `${o.start || ''} ${wtypeName(o.type) || 'Treniruotė'}`, `${o.duration} min`)),
    ...pl.map(o => li('🏋️', `${o.start} ${wtypeName(o.type)}`, `suplanuota · ~${o.duration} min`)),
  ];
  const facts = x <= td ? [nu.kcal ? `🍽️ ${nu.kcal} kcal · ${Math.round(nu.p)} g B` : '', stepsOn(x) ? `${fmtSteps(stepsOn(x))} žingsn. · ${fmtNum(stepsKm(stepsOn(x)))} km` : '', sl ? `😴 ${round(sleepMinutes(sl) / 60, 1)} val.` : '', tm.prod ? `⏱️ ${fmtH(tm.prod)} produktyviai` : '', mood ? `${MOODS[mood - 1][0]} ${MOODS[mood - 1][1].toLowerCase()}` : '', sc ? `⭐ balas ${sc.score}` : ''].filter(Boolean) : [];
  return `<div id="mdp">${card(fmtDateDow(x), `${facts.length ? `<div class="mfacts">${facts.map(f => `<span>${f}</span>`).join('')}</div>` : ''}
    ${rows.length ? rows.join('') : empty(x < td ? 'Šią dieną įrašų nebuvo.' : 'Laisva diena 🙂')}
    <div class="choice row">${btn('Atidaryti dieną', 'calDay', {d: x}, 'sm primary')}${x >= td ? btn('+ Veikla', 'addEvent', {date: x}, 'sm') : ''}</div>`)}</div>`;
}
A.calNav = d => { const c = UI.cal; c.date = c.mode === 'day' ? addDays(c.date, +d.n) : c.mode === 'week' ? addDays(c.date, 7 * d.n) : (() => { const x = parseD(c.date); x.setDate(1); x.setMonth(x.getMonth() + +d.n); return ymd(x); })(); render(); };
A.calToday = () => { UI.cal.date = today(); render(); };
A.calDay = d => { UI.view = 'calendar'; UI.cal = {mode: 'day', date: d.d}; render(); };

// Įvykiai
const REP_TYPES = [['once', 'Nesikartoja'], ['weekly', 'Kas savaitę'], ['biweekly', 'Kas dvi savaites'], ['monthly', 'Kas mėnesį']];
const LEN_OPTS = [['1w', '1 savaitę'], ['2w', '2 savaites'], ['1m', '1 mėnesį'], ['3m', '3 mėnesius (~semestras)'], ['6m', 'Pusę metų'], ['date', 'Iki pasirinktos dienos…'], ['forever', 'Be pabaigos']];
// Laikinas įvykio objektas iš formos būsenos (skaičiavimams)
function evObj(E) {
  const x = {title: E.title, cat: E.cat, type: E.type, start: E.start, end: E.end, travel: +E.travel || 0};
  if (E.type === 'once') { x.date = E.date; return x; }
  x.from = E.date;
  if (E.type === 'monthly') x.mday = parseD(E.date).getDate(); else x.days = [...E.days].sort();
  x.until = evUntil(E, x);
  return x;
}
// Ar diena d tinka šiam pasikartojimui (be praleidimų)
const evFits = (x, d) => { const s = S.skips; S.skips = {}; const r = eventOccurs({...x, until: ''}, d); S.skips = s; return r; };
function evUntil(E, x) {
  if (E.len === 'forever') return '';
  let lim;
  if (E.len === 'date') lim = E.until || E.date;
  else { const u = parseD(E.date); if (E.len === '1w') u.setDate(u.getDate() + 6); else if (E.len === '2w') u.setDate(u.getDate() + 13); else { u.setMonth(u.getMonth() + parseInt(E.len)); u.setDate(u.getDate() - 1); } lim = ymd(u); }
  // „pritraukiam“ prie paskutinės tinkamos dienos
  for (let d = lim, i = 0; d >= E.date && i < 400; d = addDays(d, -1), i++) if (evFits(x, d)) return d;
  return E.date;
}
function evOccurrences(x, max = 60) {
  const out = []; const end = x.until || addDays(x.from, 364);
  for (let d = x.from, i = 0; d <= end && out.length < max && i < 800; d = addDays(d, 1), i++) if (evFits(x, d)) out.push(d);
  return out;
}
// Mažas kalendorius su leidžiamomis dienomis
function dpCal(name) {
  const E = UI.ev, x = evObj(E), m = E.dpMonth, first = dow(m) - 1, n = daysInMonth(m);
  const ok = d => name === 'until' ? d >= E.date && evFits(x, d) : true;
  let cells = DOW.map(w => `<i>${w}</i>`).join('') + '<b></b>'.repeat(first);
  for (const d of range(m, n)) { const can = ok(d); cells += `<button type="button" class="${d === E[name] ? 'on' : ''} ${d === today() ? 'td' : ''}" ${can ? `data-a="dpPick" data-n="${name}" data-d="${d}"` : 'disabled'}>${parseD(d).getDate()}</button>`; }
  return `<div class="dp"><div class="dph">${btn('‹', 'dpNav', {n: -1}, 'sm')}<b>${MONTHS[parseD(m).getMonth()]} ${parseD(m).getFullYear()}</b>${btn('›', 'dpNav', {n: 1}, 'sm')}</div><div class="dpg">${cells}</div>
    ${name === 'until' ? `<p class="hint">Galima rinktis tik dienas, kada veikla vyksta.</p>` : ''}</div>`;
}
const dpick = (name, label) => `<div class="fld"><span>${label}</span><button type="button" class="dpbtn ${UI.ev.dp === name ? 'open' : ''}" data-a="dpOpen" data-n="${name}">📅 ${fmtDateDow(UI.ev[name])}</button>${UI.ev.dp === name ? dpCal(name) : ''}</div>`;
function evModal() {
  const E = UI.ev, rep = E.type !== 'once', x = evObj(E);
  let summary = '';
  if (rep) {
    const occ = evOccurrences(x, 400), shown = occ.slice(0, 6).map(d => `${DOW[dow(d) - 1]} ${parseD(d).getDate()} ${MONTHS_G[parseD(d).getMonth()].slice(0, 4)}.`).join(', ');
    summary = `<div class="evsum">🔁 ${x.until ? `<b>${occ.length} kart${occ.length === 1 ? 'as' : occ.length < 10 ? 'ai' : 'ų'}</b>` : '<b>Be pabaigos</b>'}: ${shown}${occ.length > 6 ? ' …' : ''}${x.until ? ` <small>(paskutinis – ${fmtDate(x.until)})</small>` : ''}</div>`;
  }
  modal(E.id ? 'Redaguoti veiklą' : 'Nauja veikla', `
    ${fld('Pavadinimas', inp('title', E.title, 'text', 'required placeholder="pvz. Matematikos paskaita"'))}
    <div class="row">${fld('Kategorija', sel('cat', catOpts(), E.cat))}${fld('Kartojasi?', sel('type', REP_TYPES, E.type, 'data-ev="type"'))}</div>
    ${dpick('date', rep ? 'Pirmas kartas' : 'Kurią dieną?')}
    ${['weekly', 'biweekly'].includes(E.type) ? fld('Kuriomis dienomis?', `<div class="days">${DOW.map((w, i) => `<label><input type="checkbox" data-ev="day" value="${i + 1}" ${E.days.includes(i + 1) ? 'checked' : ''}><span>${w}</span></label>`).join('')}</div>`) : ''}
    ${E.type === 'monthly' ? `<p class="hint">Kartosis kiekvieno mėnesio ${parseD(E.date).getDate()} d.</p>` : ''}
    ${rep ? `<div class="row">${fld('Kiek laiko kartoti?', sel('len', LEN_OPTS, E.len, 'data-ev="len"'))}</div>${E.len === 'date' ? dpick('until', 'Paskutinis kartas') : ''}${summary}` : ''}
    <div class="row">${fld('Pradžia', inp('start', E.start, 'time', 'required'))}${fld('Pabaiga', inp('end', E.end, 'time', 'required'))}${fld('Kelionė į vieną pusę (min)', inp('travel', E.travel || 0, 'number', 'min="0" step="5"'))}</div>`,
    () => { evSync(); return saveEvent(); }, {noFocus: true, extra: E.id ? btn('Ištrinti', 'delEvent', {id: E.id}, 'danger sm') : ''});
}
// Nuskaito formos laukus į UI.ev (kad perpiešiant nedingtų)
function evSync() {
  const f = $('#mform'); if (!f || !UI.ev) return;
  const o = formObj(f);
  for (const k of ['title', 'cat', 'type', 'len', 'start', 'end', 'travel']) if (o[k] !== undefined) UI.ev[k] = o[k];
  const ds = [...f.querySelectorAll('[data-ev="day"]')];
  if (ds.length) UI.ev.days = ds.filter(c => c.checked).map(c => +c.value);
}
function evFix() {
  const E = UI.ev;
  if (['weekly', 'biweekly'].includes(E.type) && !E.days.length) E.days = [dow(E.date)];
  if (E.len === 'date') { const x = evObj({...E}); if (!E.until || E.until < E.date || !evFits(x, E.until)) E.until = evUntil({...E, len: E.until && E.until > E.date ? 'date' : '1m'}, x); }
}
A.dpOpen = d => { evSync(); const E = UI.ev; E.dp = E.dp === d.n ? null : d.n; E.dpMonth = monthStart(E[d.n] || E.date); evModal(); };
A.dpNav = d => { evSync(); const x = parseD(UI.ev.dpMonth); x.setMonth(x.getMonth() + +d.n); UI.ev.dpMonth = ymd(x); evModal(); };
A.dpPick = d => {
  evSync(); const E = UI.ev, old = E.date; E[d.n] = d.d; E.dp = null;
  // pakeitus pirmą kartą – savaitės diena seka paskui (jei pasirinkta tik viena)
  if (d.n === 'date' && ['weekly', 'biweekly'].includes(E.type)) { if (E.days.length <= 1) E.days = [dow(d.d)]; else if (!E.days.includes(dow(d.d))) E.days.push(dow(d.d)); }
  if (d.n === 'date' && E.len === 'date' && old !== d.d) E.until = '';
  evFix(); evModal();
};
function evFrom(e, d = {}) {
  if (e) return {id: e.id, title: e.title, cat: e.cat, type: e.type, date: e.type === 'once' ? e.date : (e.from || today()), days: [...(e.days || [])], len: e.type !== 'once' && e.until ? 'date' : 'forever', until: e.until || '', start: e.start, end: e.end, travel: e.travel || 0};
  const date = d.date || today(), st = d.start || '09:00';
  return {title: '', cat: 'paskaitos', type: d.weekly ? 'weekly' : 'once', date, days: [dow(date)], len: '3m', until: '', start: st, end: fromMin(toMin(st) + 90), travel: 0};
}
A.addEvent = d => { UI.ev = evFrom(null, d); evModal(); };
A.editEvent = d => { const e = S.events.find(x => x.id === d.id); if (!e) return; UI.ev = evFrom(e); evModal(); };
function saveEvent() {
  const E = UI.ev;
  if (!E.title.trim()) { warn('Įrašyk pavadinimą'); return false; }
  if (E.end === E.start) { warn('Pradžia ir pabaiga negali sutapti'); return false; }
  if (['weekly', 'biweekly'].includes(E.type) && !E.days.length) { warn('Pasirink bent vieną savaitės dieną'); return false; }
  const x = evObj(E);
  if (E.id) { const e = S.events.find(y => y.id === E.id); for (const k of ['date', 'days', 'mday', 'from', 'until']) delete e[k]; Object.assign(e, x); }
  else S.events.push({id: uid(), ...x});
  UI.ev = null; commit(); toast('Išsaugota ✓');
}
const repText = e => e.type === 'once' ? fmtDate(e.date) : e.type === 'monthly' ? `kas mėn. ${e.mday} d.` : `${e.type === 'biweekly' ? 'kas 2 sav.' : 'kas sav.'} ${(e.days || []).map(x => DOW[x - 1]).join(', ')}`;
const timeText = e => `${e.start}–${e.end}${overnight(e) ? ' (+1 d.)' : ''}`;
A.manageEvents = () => {
  const rec = S.events.filter(e => e.type !== 'once');
  modal('Pasikartojančios veiklos', rec.length ? rec.map(e => `<div class="li click" data-a="editEvent" data-id="${e.id}">${chip(esc(cat(e.cat).name), cat(e.cat).color)} <b>${esc(e.title)}</b> <small>${repText(e)} · ${timeText(e)}${e.until ? ` · iki ${fmtDate(e.until)}` : ''}</small></div>`).join('') + `<div class="choice row">${btn('+ Naujas', 'addEvent', {weekly: 1}, 'primary sm')}</div>` : empty('Dar nėra. Įrašyk paskaitas, darbą, švedų pamokas.') + btn('+ Naujas', 'addEvent', {weekly: 1}, 'primary'));
};
A.delEvent = async d => { if (!await ask('Ištrinti veiklą?', '', {danger: true, icon: '🗑️', yes: 'Ištrinti'})) return; S.events = S.events.filter(e => e.id !== d.id); A.closeModal(); commit(); };
A.eventInfo = d => {
  const e = S.events.find(x => x.id === d.id); if (!e) return; const c = cat(e.cat);
  const occ = eventOccurs(e, d.d) ? d.d : addDays(d.d, -1);
  modal(`${catDot(c)} ${esc(e.title)}`, `<p>${fmtDateDow(occ)} · ${timeText(e)}${+e.travel ? ` · kelionė ${e.travel} min` : ''}</p><p>${chip(esc(c.name), c.color)} ${e.type === 'once' ? 'vienkartinis' : '🔁 ' + repText(e)}${e.until ? ` · iki ${fmtDate(e.until)}` : ''}</p>
    <div class="choice">${btn('Redaguoti', 'editEvent', {id: e.id})}${e.type !== 'once' ? btn('Šį kartą neįvyko / praleidau', 'skipEvent', {id: e.id, d: occ}) : ''}${btn('Ištrinti', 'delEvent', {id: e.id}, 'danger')}</div>`);
};
A.skipEvent = d => { S.skips[d.id + '|' + d.d] = 1; A.closeModal(); commit(); toast('Pažymėta kaip praleista'); };

// ================= UŽDUOTYS =================
function taskRow(t) {
  const late = t.due && !t.done && t.due < today(), soon = t.due && !t.done && diffDays(today(), t.due) <= 2;
  const pr = ['', '🔴', '🟡', '🟢'][+t.priority || 2];
  return `<div class="task ${t.done ? 'done' : ''} ${late ? 'late' : soon ? 'soon' : ''}">
    <button class="chk" data-a="toggleTask" data-id="${t.id}">${t.done ? '✓' : ''}</button>
    <div class="tb" data-a="editTask" data-id="${t.id}"><b>${pr} ${esc(t.title)}</b>
      <small>${t.due ? `📅 ${relDay(t.due)}${t.dueTime ? ' ' + t.dueTime : ''}` : 'be termino'}${t.cat ? ' · ' + esc(cat(t.cat).name) : ''}${+t.est ? ' · ~' + fmtDur(+t.est) : ''}${late ? ' · <b class="red">PAVĖLUOTA</b>' : ''}</small>
      ${!t.done && +t.progress ? `<div class="pbar sm"><i style="width:${t.progress}%"></i></div>` : ''}</div></div>`;
}
function vTasks() {
  const f = UI.taskFilter;
  let list = S.tasks.filter(t => f === 'open' ? !t.done : f === 'done' ? t.done : true);
  list.sort((a, b) => (a.done - b.done) || ((a.due || '9999') < (b.due || '9999') ? -1 : (a.due || '9999') > (b.due || '9999') ? 1 : (+a.priority || 2) - (+b.priority || 2)));
  const groups = {};
  for (const t of list) { const k = t.done ? 'Atlikta' : !t.due ? 'Be termino' : t.due < today() ? 'Pavėluota' : t.due === today() ? 'Šiandien' : diffDays(today(), t.due) <= 7 ? 'Šią savaitę' : 'Vėliau'; (groups[k] = groups[k] || []).push(t); }
  const open = S.tasks.filter(t => !t.done), doneW = S.tasks.filter(t => t.done && t.doneAt >= weekStart(today())).length;
  return `<form id="qtask" class="qadd card"><input name="title" placeholder="Ką reikia nepamiršti? pvz. Pasiimti siuntą" required><input type="date" name="due" value="${addDays(today(), 1)}" min="2000-01-01" max="2099-12-31"><button class="btn primary" type="submit">Pridėti</button></form>
  <div class="toolbar"><div class="seg">${[['open', 'Neatlikti'], ['done', 'Atlikti'], ['all', 'Visi']].map(([v, l]) => `<button class="${f === v ? 'on' : ''}" data-a="taskFilter" data-f="${v}">${l}</button>`).join('')}</div>
    <span class="sp"></span>${btn('Į telefono kalendorių', 'exportIcs', {}, 'sm ghost')}${btn('+ Su detalėmis', 'addTask', {}, 'sm')}</div>
    <div class="stats3"><div><b>${open.length}</b><small>neatlikta</small></div><div><b class="${open.filter(t => t.due && t.due < today()).length ? 'red' : ''}">${open.filter(t => t.due && t.due < today()).length}</b><small>pavėluota</small></div><div><b class="green">${doneW}</b><small>atlikta šią savaitę</small></div></div>
    ${Object.keys(groups).length ? ['Pavėluota', 'Šiandien', 'Šią savaitę', 'Vėliau', 'Be termino', 'Atlikta'].filter(k => groups[k]).map(k => card(k, groups[k].map(taskRow).join(''))).join('') : empty('Nieko nėra – viskas padaryta!')}`;
}
A.taskFilter = d => { UI.taskFilter = d.f; render(); };
const REMIND_OPTS = [['1,0', 'Dieną prieš ir tą dieną'], ['0', 'Tik tą dieną'], ['2,0', '2 d. prieš ir tą dieną'], ['7,1,0', 'Savaitę prieš, dieną prieš ir tą dieną'], ['none', 'Nepriminti']];
function taskForm(t) {
  return `${fld('Ką reikia padaryti ar nepamiršti?', inp('title', t.title, 'text', 'required placeholder="pvz. Pasiimti siuntą, statistikos namų darbas"'))}
  <div class="row">${fld('Iki kada', inp('due', t.due, 'date'))}${fld('Laikas', inp('dueTime', t.dueTime, 'time'))}${fld('Priminti', sel('remind', REMIND_OPTS, t.remind || '1,0'))}</div>
  <details class="more" ${t.est || t.progress || t.notes || t.cat ? 'open' : ''}><summary>Daugiau</summary>
  <div class="row">${fld('Svarba', sel('priority', [[1, '🔴 Aukšta'], [2, '🟡 Vidutinė'], [3, '🟢 Žema']], t.priority || 2))}${fld('Sritis', sel('cat', [['', '—'], ...catOpts()], t.cat))}${fld('Kiek užtruks (min)', inp('est', t.est || '', 'number', 'min="0" step="15"'))}</div>
  ${fld(`Kiek padaryta: <b id="pv">${+t.progress || 0}%</b>`, `<input type="range" name="progress" min="0" max="100" step="10" value="${+t.progress || 0}" oninput="pv.textContent=this.value+'%'">`)}
  ${fld('Pastabos', `<textarea name="notes" rows="2">${esc(t.notes)}</textarea>`)}</details>`;
}
A.addTask = () => modal('Nauja užduotis', taskForm({due: addDays(today(), 1)}), o => { S.tasks.push({id: uid(), ...o, done: false, created: today()}); commit(); toast('Pridėta ✓'); });
A.editTask = d => { const t = S.tasks.find(x => x.id === d.id); modal('Užduotis', taskForm(t), o => { Object.assign(t, o); commit(); }, {extra: btn('🗑', 'delTask', {id: t.id}, 'danger sm')}); };
A.delTask = async d => { if (!await ask('Ištrinti užduotį?', '', {danger: true, icon: '🗑️', yes: 'Ištrinti'})) return; S.tasks = S.tasks.filter(t => t.id !== d.id); A.closeModal(); commit(); };
A.toggleTask = d => { const t = S.tasks.find(x => x.id === d.id); t.done = !t.done; t.doneAt = t.done ? today() : null; if (t.done) { t.progress = 100; confetti(); toast(pick(MOTIVATION.taskDone) + ' +10 XP', 'good'); } commit(); };

// ICS eksportas
A.exportIcs = () => {
  const dt = (d, t) => d.replace(/-/g, '') + 'T' + (t || '09:00').replace(':', '') + '00';
  const BY = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
  let s = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//LifeSchedule//LT\r\nCALSCALE:GREGORIAN\r\n';
  const stamp = dt(today(), nowHM());
  for (const t of S.tasks.filter(t => !t.done && t.due)) {
    s += `BEGIN:VEVENT\r\nUID:task-${t.id}@manogyv\r\nDTSTAMP:${stamp}\r\nDTSTART:${dt(t.due, t.dueTime)}\r\nDURATION:PT30M\r\nSUMMARY:📌 ${t.title.replace(/[,;]/g, ' ')}\r\nBEGIN:VALARM\r\nTRIGGER:-P1D\r\nACTION:DISPLAY\r\nDESCRIPTION:Rytoj terminas\r\nEND:VALARM\r\nBEGIN:VALARM\r\nTRIGGER:-PT2H\r\nACTION:DISPLAY\r\nDESCRIPTION:Terminas po 2 val.\r\nEND:VALARM\r\nEND:VEVENT\r\n`;
  }
  for (const e of S.events) {
    const endD = d => overnight(e) ? addDays(d, 1) : d;
    if (e.type === 'once') s += `BEGIN:VEVENT\r\nUID:ev-${e.id}@manogyv\r\nDTSTAMP:${stamp}\r\nDTSTART:${dt(e.date, e.start)}\r\nDTEND:${dt(endD(e.date), e.end)}\r\nSUMMARY:${e.title.replace(/[,;]/g, ' ')}\r\nEND:VEVENT\r\n`;
    else {
      let first = e.from && e.from > today() ? e.from : today(), n = 0; while (!eventOccurs(e, first) && n++ < 400) first = addDays(first, 1);
      if (n >= 400) continue;
      const rule = e.type === 'monthly' ? `FREQ=MONTHLY;BYMONTHDAY=${e.mday}` : `FREQ=WEEKLY;${e.type === 'biweekly' ? 'INTERVAL=2;' : ''}BYDAY=${e.days.map(x => BY[x - 1]).join(',')}`;
      s += `BEGIN:VEVENT\r\nUID:ev-${e.id}@manogyv\r\nDTSTAMP:${stamp}\r\nDTSTART:${dt(first, e.start)}\r\nDTEND:${dt(endD(first), e.end)}\r\nRRULE:${rule}${e.until ? ';UNTIL=' + e.until.replace(/-/g, '') + 'T235959' : ''}\r\nSUMMARY:${e.title.replace(/[,;]/g, ' ')}\r\nBEGIN:VALARM\r\nTRIGGER:-PT15M\r\nACTION:DISPLAY\r\nDESCRIPTION:Po 15 min\r\nEND:VALARM\r\nEND:VEVENT\r\n`;
    }
  }
  s += 'END:VCALENDAR\r\n';
  download('mano-kalendorius.ics', s, 'text/calendar');
  toast('Failas atsisiųstas. Atidaryk jį telefone arba importuok į Google/Apple kalendorių.');
};
function download(name, text, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], {type})); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); }

// ================= MITYBA =================
function mealsList(d) {
  const ms = mealsOn(d).sort((a, b) => (a.time || '') < (b.time || '') ? -1 : 1);
  if (!ms.length) return empty('Dar nieko neįrašyta');
  return ms.map(mealRow).join('');
}
function vFood() {
  const tabs = [['log', 'Dienynas'], ['recipes', 'Receptai'], ['freezer', 'Atsargos'], ['shop', 'Pirkiniai']].concat(UI.food === 'foods' ? [['foods', 'Produktai']] : []);
  const head = `<div class="mf-top"><div class="seg mf-seg">${tabs.map(([v, l]) => `<button class="${UI.food === v ? 'on' : ''}" data-a="foodTab" data-v="${v}">${l}</button>`).join('')}</div>${foodOn() ? `<button class="ib" data-a="foodSetup" title="Mano mityba">${ic('user', 'sm')}</button>` : ''}</div>`;
  if (!foodOn() && S.settings.intro.food !== 'log' && !S.meals.length) return introCard('food');
  if (foodOn() && !S.foodPrefs.done && !UI.fpShown) { UI.fpShown = true; setTimeout(() => A.foodSetup({}), 50); }
  return head + ({log: fLog, recipes: fRecipes, freezer: fFreezer, shop: fShop, foods: fFoods})[UI.food]();
}
A.foodTab = d => { UI.food = d.v; render(); };

// ---------- Mitybos nustatymų vedlys ----------
A.foodSetup = () => { UI.fp = JSON.parse(JSON.stringify(S.foodPrefs)); UI.fpStep = 0; fpModal(); };
function fpChips(key, opts, multi = true) {
  const cur = UI.fp[key];
  return `<div class="chips">${opts.map(([v, l]) => `<button type="button" class="chipbtn ${multi ? (cur.includes(v) ? 'on' : '') : (String(cur) === String(v) ? 'on' : '')}" data-a="fpSet" data-k="${key}" data-v="${esc(v)}" data-m="${multi ? 1 : 0}">${l}</button>`).join('')}</div>`;
}
function fpModal() {
  const F = UI.fp, st = UI.fpStep, N = 4;
  const steps = [
    ['⏱️ Laikas ir biudžetas', `
      ${fld('Kiek kartų per savaitę gali gaminti?', fpChips('cookTimes', [[1, '1 kartą'], [2, '2 kartus'], [3, '3 kartus'], [5, 'Beveik kasdien']], false))}
      ${fld('Kiek daugiausia laiko vienam gaminimui?', fpChips('cookMax', [[20, 'iki 20 min'], [30, '30 min'], [45, '45 min'], [60, '1 val.'], [120, 'Kiek reikia']], false))}
      ${fld('Kuriomis dienomis patogiausia gaminti?', `<div class="chips">${DOW.map((w, i) => `<button type="button" class="chipbtn ${F.cookDays.includes(i + 1) ? 'on' : ''}" data-a="fpSet" data-k="cookDays" data-v="${i + 1}" data-m="1" data-num="1">${w}</button>`).join('')}</div>`)}
      ${fld(`Maisto biudžetas per savaitę: <b id="bv">${F.budget} €</b>`, `<input type="range" min="15" max="150" step="5" value="${F.budget}" data-fp="budget" oninput="bv.textContent=this.value+' €'">`)}
      ${fld(`Kiek kartų per dieną nori valgyti? <small>${+S.profile.goalRate > 0 ? '(metant svorį dažniausiai 3)' : +S.profile.goalRate < 0 ? '(auginant raumenis – 4–5)' : '(dažniausiai 3–4)'}</small>`, fpChips('mealsPerDay', [[3, '3 kartus'], [4, '4 kartus'], [5, '5 kartus']], false))}
      ${fld('Ar siūlyti, ką valgyti kada?', fpChips('mealSuggest', [[true, '✅ Taip, siūlyk'], [false, '🚫 Ne, tik valgymo laikus']], false))}`],
    ['👨‍🍳 Kiek moki gaminti?', `<div class="skills">${SKILL_OPTS.map(([v, e, n, dsc]) => `<button type="button" class="skill ${+F.skill === v ? 'on' : ''}" data-a="fpSet" data-k="skill" data-v="${v}" data-m="0"><span>${e}</span><b>${n}</b><small>${dsc}</small></button>`).join('')}</div>
      `],
    ['🍳 Kas yra tavo virtuvėje?', `${fpChips('equip', EQUIP_OPTS)}`],
    ['🙅 Ko nevalgai?', `${fld('Nepatinka', fpChips('dislikes', DISLIKE_OPTS))}${fld('Alergijos / netoleravimas', fpChips('allergies', ALLERGY_OPTS))}
      ${fld('Dar kas nors (per kablelį)', `<input data-fp="dislikeText" value="${esc(F.dislikeText)}" placeholder="pvz. kalendra, alyvuogės, burokėliai">`)}`],
  ];
  if (st >= N) {
    const sug = (() => { const old = S.foodPrefs; S.foodPrefs = F; const r = suggestRecipes({freezableOnly: false}).slice(0, 3); S.foodPrefs = old; return r; })();
    const ok = (() => { const old = S.foodPrefs; S.foodPrefs = F; const n = S.recipes.filter(r => !recipeBlock(r)).length; S.foodPrefs = old; return n; })();
    modal('Paruošta!', `<p class="center">Iš ${S.recipes.length} receptų tau tinka <b>${ok}</b>. Štai nuo ko siūlau pradėti:</p>
      <div class="sugs">${sug.map(x => `<div class="sug"><div class="em">${foodIcon(x.r.name)}</div><b>${esc(x.r.name)}</b><small>⏱ ${x.r.time} min · ${x.st.cost.toFixed(2).replace('.', ',')} €/porc.</small></div>`).join('')}</div>
      `,
      () => { S.foodPrefs = {...F, done: true}; S.profile.budgetWeek = F.budget; commit(); UI.food = 'recipes'; render(); }, {submit: 'Rodyti receptus →', wide: true});
    return;
  }
  const [title, body] = steps[st];
  modal(`${title} <small class="stepno">${st + 1}/${N}</small>`, `<div class="dots">${Array.from({length: N}, (_, i) => `<i class="${i <= st ? 'on' : ''}"></i>`).join('')}</div>${body}
    <div class="mfoot">${st ? btn('Atgal', 'fpNav', {n: -1}, 'ghost') : ''}<span class="sp"></span>${btn(st === N - 1 ? 'Baigti ✓' : 'Toliau →', 'fpNav', {n: 1}, 'primary')}</div>`, null, {wide: true, noFocus: true});
}
function fpSync() { document.querySelectorAll('[data-fp]').forEach(el => { UI.fp[el.dataset.fp] = el.type === 'range' ? +el.value : el.value; }); }
A.fpSet = d => {
  fpSync(); const F = UI.fp, v = d.k === 'mealSuggest' ? d.v === 'true' : d.num || ['cookTimes', 'cookMax', 'skill', 'mealsPerDay'].includes(d.k) ? +d.v : d.v;
  if (d.m === '1') { const a = F[d.k]; F[d.k] = a.includes(v) ? a.filter(x => x !== v) : [...a, v]; } else F[d.k] = v;
  fpModal();
};
A.fpNav = d => { fpSync(); UI.fpStep = Math.max(0, UI.fpStep + +d.n); fpModal(); };

// ---------- Dienynas ----------
function fLog() {
  const d = UI.foodDate, tg = targets(), nu = dayNutrition(d), on = foodOn() && !tg.missing.length;
  const days = range(addDays(d, -13), 14).map(x => { const n = dayNutrition(x); return {label: parseD(x).getDate() + '', segs: [{v: n.kcal, color: n.kcal > tg.kcal * 1.08 ? 'var(--br)' : 'var(--s2)', name: 'kcal'}], click: {a: 'foodDay', d: x}}; });
  const lim = [['Angliavandeniai', nu.c, Math.round(tg.kcal * 0.45 / 4), 'g', 'apie'], ['– iš jų cukrūs', nu.s, Math.round(tg.kcal * 0.1 / 4), 'g', 'ne daugiau'], ['Riebalai', nu.f, Math.round(tg.kcal * 0.3 / 9), 'g', 'apie'], ['– iš jų sotieji', nu.sat, Math.round(tg.kcal * 0.1 / 9), 'g', 'ne daugiau'], ['Skaidulos', nu.fi, 30, 'g', 'bent'], ['Druska', nu.salt, 5, 'g', 'ne daugiau']];
  const carbG = Math.round(tg.kcal * 0.45 / 4), fatG = Math.round(tg.kcal * 0.3 / 9), left = tg.kcal - netKcal(d), burn = dayBurn(d);
  const ring = (pp) => { const r = 40, L = 2 * Math.PI * r, v = Math.max(0, Math.min(1, pp)); return `<svg viewBox="0 0 96 96"><circle cx="48" cy="48" r="${r}" fill="none" stroke="var(--card2)" stroke-width="7"/>${v ? `<circle cx="48" cy="48" r="${r}" fill="none" stroke="var(--br)" stroke-width="7" stroke-linecap="round" stroke-dasharray="${L * v} ${L}" transform="rotate(-90 48 48)"/>` : ''}</svg>`; };
  const mb = (lbl, v, g, c) => `<div>${lbl}<span>${Math.round(v)} / ${g} g</span><div class="mb"><i style="width:${Math.min(100, v / Math.max(1, g) * 100)}%;background:${c}"></i></div></div>`;
  const pLeft = Math.round(tg.protein - nu.p), fr = storageItems().find(x => x.place === 'fridge' && x.left <= 2 && x.r);
  const tip = !on ? '' : d !== today() ? '' : pLeft > 15 ? `Dar ${pLeft} g baltymų${fr ? ` – tiktų ${esc(fr.r.name.toLowerCase())} iš šaldytuvo` : ''}.` : left < 0 ? 'Šiandien jau viršijai tikslą – vakarienei rinkis ką nors lengvesnio.' : 'Baltymų jau užtenka – šaunu!';
  const summary = on ? `<div class="card mf-sum"><div class="mf-kc"><div class="mf-ring">${ring(netKcal(d) / Math.max(1, tg.kcal))}<b>${Math.abs(left)}<small>${left >= 0 ? 'kcal liko' : 'kcal per daug'}</small></b></div>
      <div class="mf-mac"><div>Suvalgyta<span>${nu.kcal}${burn ? ` − ${burn} einant` : ''} / ${tg.kcal}</span></div>${mb('Baltymai', nu.p, tg.protein, 'var(--s1)')}${mb('Angliavandeniai', nu.c, carbG, 'var(--s2)')}${mb('Riebalai', nu.f, fatG, 'var(--s3)')}</div></div>
      ${tip ? `<div class="mf-say">${daigelis(4)}<p>${tip}</p></div>` : ''}</div>`
    : `<div class="mf-sumt"><div><b>${burn ? netKcal(d) : nu.kcal}</b><span>${burn ? `kcal grynai<br>${nu.kcal} − ${burn} einant` : 'kcal'}</span></div><div><b>${Math.round(nu.p)} g</b><span>baltymų</span></div><div><b>${mealsOn(d).length}</b><span>valgymai</span></div></div>`;
  const rec = recentMeals().slice(0, 6);
  const ask = `<form class="mf-ask" data-f="askFood"><input name="q" placeholder="Ką valgei? pvz. „2 kiaušiniai ir kava“" autocomplete="off"><button class="go" title="Išsaugoti">${ic('arrow')}</button></form>
    ${rec.length ? `<div class="mf-chips">${rec.map(m => `<button data-a="mealRepeat" data-n="${esc(m.name)}" data-d="${d}">${esc(m.name)}<small>${Math.round(m.kcal)}</small></button>`).join('')}</div>` : ''}`;
  const ms = mealsOn(d).sort((a, b) => (a.time || '') < (b.time || '') ? -1 : 1);
  const grpOf = m => m.snack ? 3 : !m.time ? 1 : toMin(m.time) < 11 * 60 ? 0 : toMin(m.time) < 16 * 60 ? 1 : toMin(m.time) < 17 * 60 + 30 ? 3 : 2;
  const GR = ['Pusryčiai', 'Pietūs', 'Vakarienė', 'Užkandžiai'], gtime = ['08:00', '13:00', '19:00', '16:00'];
  const groups = [0, 1, 3, 2].map(g => { const list = ms.filter(m => grpOf(m) === g), k = Math.round(sum(list.map(m => m.kcal)));
    return `<div class="mf-grp">${GR[g]}${list.length ? `<em>${k} kcal</em>` : `<em class="add" data-a="addMealAt" data-d="${d}" data-id="${gtime[g]}">+ pridėti</em>`}</div>${list.length ? `<div class="card mf-list">${list.map(mealRow).join('')}</div>` : ''}`; }).join('');
  const more = `<details class="card mf-more"><summary>Daugiau rodiklių<small>cukrūs, skaidulos, druska ›</small></summary>
    ${lim.map(([n, v, g, u, kind]) => { const bad = kind === 'ne daugiau' ? v > g : kind === 'bent' ? false : v > g * 1.3; return `<div class="bar-row"><span>${n}</span><div class="pbar"><i style="width:${clamp(v / g * 100, 0, 100)}%;background:${bad ? 'var(--br)' : 'var(--s2)'}"></i></div><small>${round(v || 0)} / ${kind} ${g} ${u}</small></div>`; }).join('')}
    <h4>Kalorijos per 14 d.</h4>${svgBars(days, {goal: on ? tg.kcal : 0, h: 160})}
    ${on ? `<h4>Tavo normos</h4><div class="kv"><span>Sudegini per dieną (TDEE)</span><b>${tg.tdee} kcal</b><span>Tikslas</span><b>${tg.kcal} kcal</b><span>Baltymai</span><b>${tg.protein} g</b><span>Vanduo</span><b>~${tg.water} l</b></div>` : ''}</details>`;
  const quiet = !foodOn() ? `<div class="quiet"><span class="qi">${daigelis(4)}</span><span>Nori, kad programėlė siūlytų, kada ir ką valgyti?<small>Rekomendacijos išjungtos</small></span>${btn('Įjungti', 'enableMode', {k: 'food'}, 'sm')}</div>`
    : foodOn() && tg.missing.length ? `<div class="quiet"><span class="qi">${daigelis(3)}</span><span>Kad apskaičiuotume normas, įrašyk: ${esc(tg.missing.join(', '))}<small>Kalorijos skaičiuojamos automatiškai</small></span>${btn('Profilis', 'go', {v: 'settings'}, 'sm')}</div>` : '';
  return `<div class="mf-date">${btn('‹', 'foodNav', {n: -1}, 'ib')}<b>${cap(relDay(d))}, ${fmtDateLong(d)}</b>${btn('›', 'foodNav', {n: 1}, 'ib')}</div>
  <div class="mf-cols"><div>${summary}${ask}</div><div>${groups}${more}${quiet}</div></div>`;
}
const cap = t => String(t || '').charAt(0).toUpperCase() + String(t || '').slice(1);
const fmtDateLong = d => { const x = parseD(d); return `${MONTHS_G[x.getMonth()]} ${x.getDate()}`; };
function mealRow(m) {
  return `<div class="mf-meal"><span class="mf-fi">${foodIcon(m.name)}</span><span class="grow"><b>${esc(m.name)}</b><small>${m.time || ''}${m.portions ? ` · ${fmtNum(m.portions)} porc.` : m.g ? ` · ${m.g} g` : ''} · ${Math.round(m.p || 0)} g baltymų</small></span><span class="k">${Math.round(m.kcal)}</span><button class="x" data-a="delMeal" data-id="${m.id}" title="Ištrinti">✕</button></div>`;
}
A.askFood = async (f) => { const q = f.q.value.trim(); if (!q) return toast('Parašyk, ką valgei'); f.q.disabled = true; await saveFoodText(q, UI.foodDate, UI.foodDate === today() ? nowHM() : '12:00'); };
A.foodNav = d => { UI.foodDate = addDays(UI.foodDate, +d.n); render(); };
A.foodDay = d => { UI.view = 'food'; UI.food = 'log'; UI.foodDate = d.d; render(); };
A.addMeal = d => { UI.mealDate = d.d || today(); UI.mealTime = null; mealModal(); };
function mealModal() {
  const t = UI.mealTab, tabs = [['ai', 'Parašyk'], ['freezer', 'Iš atsargų'], ['recipe', 'Receptas'], ['snack', 'Užkandis'], ['quick', 'Greitas']];
  let body = `<div class="tabs sm">${tabs.map(([v, l]) => `<button type="button" class="${t === v ? 'on' : ''}" data-a="mealTab" data-v="${v}">${l}</button>`).join('')}</div>
    <div class="row">${fld('Data', inp('date', UI.mealDate, 'date'))}${fld('Laikas', inp('time', UI.mealTime || nowHM(), 'time'))}</div>`;
  if (t === 'ai') {
    const rec = recentMeals();
    body += `${fld('Ką valgei?', `<textarea name="aitext" rows="2" placeholder="pvz. 2 kiaušiniai, sumuštinis su sūriu, kava su pienu">${esc(UI.aiText || '')}</textarea>`)}
      <p class="hint">Spausk „Išsaugoti“ – kalorijas ir baltymus apskaičiuosim patys. Vėliau galėsi pataisyti dienyne.</p>
      ${rec.length ? `<h4>Dažnai valgai <small>– vienu paspaudimu</small></h4><div class="chips">${rec.map(m => `<button type="button" class="chipbtn" data-a="mealRepeat" data-n="${esc(m.name)}">${esc(m.name)} <small>${Math.round(m.kcal)} kcal</small></button>`).join('')}</div>` : ''}`;
  } else if (t === 'freezer') {
    const fr = storageItems();
    body += fr.length ? fld('Ką valgai?', `<div class="radios">${fr.map((f, i) => { const r = f.r, st = r ? recipeStats(r) : {}; return `<label><input type="radio" name="fid" value="${f.id}" ${i ? '' : 'checked'}><span><span class="mf-fi sm">${foodIcon(r?.name || '')}</span> ${esc(r?.name || '?')} <small>${f.place === 'fridge' ? 'šaldytuvas' : 'šaldiklis'} · liko ${f.portions} porc. · ${leftText(f)} · ${st.kcal} kcal · ${st.p} g B</small></span></label>`; }).join('')}</div>`) + fld('Porcijos', inp('portions', 1, 'number', 'min="0.25" step="0.25"'))
      : empty('Atsargų nėra. Pagamink receptą ir paspausk „Pagaminau“.');
  } else if (t === 'recipe') {
    body += fld('Receptas', sel('rid', S.recipes.map(r => [r.id, `${r.name} (${recipeStats(r).kcal} kcal/porc.)`]))) + fld('Porcijos', inp('portions', 1, 'number', 'min="0.25" step="0.25"'));
  } else if (t === 'snack') {
    body += fld('Sveikas užkandis', `<div class="radios">${HEALTHY_SNACKS.map(([n, k, p], i) => `<label><input type="radio" name="sn" value="${i}" ${i ? '' : 'checked'}><span>${esc(n)} <small>${k} kcal · ${p} g baltymų</small></span></label>`).join('')}</div>`) + '<p class="hint">Kitam užkandžiui naudok „Greitas“ arba „Produktas“.</p>';
  } else if (t === 'food') {
    body += `<datalist id="foodlist">${allFoods().map(f => `<option value="${esc(f.name)}">`).join('')}</datalist>
      ${fld('Produktas', inp('fname', '', 'text', 'list="foodlist" required placeholder="Pradėk rašyti… pvz. bananai"'))}${fld('Kiekis (g)', inp('g', 100, 'number', 'min="1"'))}`;
  } else {
    body += fld('Pavadinimas', inp('name', '', 'text', 'required placeholder="pvz. Kava su pienu, kebabas…"')) + `<div class="row">${fld('Kalorijos', inp('kcal', '', 'number', 'required min="0"'))}${fld('Baltymai (g)', inp('p', '', 'number', 'min="0" step="0.1"'))}</div>`;
  }
  modal('Įrašyti maistą', body, o => {
    const m = {id: uid(), date: o.date, time: o.time};
    if (t === 'ai') {
      if (!o.aitext?.trim()) { toast('Parašyk, ką valgei'); return false; }
      saveFoodText(o.aitext.trim(), o.date, o.time); return false;
    }
    if (t === 'freezer') { const f = S.freezer.find(x => x.id === o.fid); if (!f) return false; const r = recipe(f.recipeId), st = recipeStats(r), n = +o.portions || 1;
      Object.assign(m, {name: r.name, recipeId: r.id, portions: n}, nutrOf(st, n)); takePortion(f.id, n); }
    else if (t === 'recipe') { const r = recipe(o.rid), st = recipeStats(r), n = +o.portions || 1; Object.assign(m, {name: r.name, recipeId: r.id, portions: n}, nutrOf(st, n)); }
    else if (t === 'snack') { const [n, k, p] = HEALTHY_SNACKS[+o.sn || 0]; Object.assign(m, {name: n.replace(/^\S+\s/, ''), kcal: k, p, snack: true}); }
    else if (t === 'food') { const f = allFoods().find(x => x.name.toLowerCase() === o.fname.trim().toLowerCase()); if (!f) { warn('Tokio produkto nėra. Pasirink iš sąrašo arba naudok „Greitas“ / pridėk produktą skiltyje „Produktai“.'); return false; }
      const g = +o.g || 100; Object.assign(m, {name: f.name, foodId: f.id, g}, nutrOf(f, g / 100)); }
    else Object.assign(m, {name: o.name, kcal: +o.kcal || 0, p: +o.p || 0});
    S.meals.push(m); commit(); toast(`🍽️ ${esc(m.name)} – ${Math.round(m.kcal)} kcal`);
  }, {noFocus: true});
}
A.mealTab = d => { const f = $('#mform'); if (f) UI.mealDate = f.date.value; UI.mealTab = d.v; mealModal(); };
A.delMeal = d => { S.meals = S.meals.filter(m => m.id !== d.id); commit(); };

// ---------- Receptai ----------
function fRecipes() {
  const q = norm(UI.recipeQ), u = recipeUsage(), showAll = UI.showAllRecipes, tag = UI.recipeTag || '';
  const sug = suggestRecipes().slice(0, 3);
  const all = suggestRecipes({all: true});
  const tags = [...new Set(all.flatMap(x => x.r.tags))].sort((a, b) => all.filter(x => x.r.tags.includes(b)).length - all.filter(x => x.r.tags.includes(a)).length).slice(0, 8);
  const list = all.filter(x => (showAll || !x.block) && (!q || norm(x.r.name).includes(q) || x.r.tags.some(t => norm(t).includes(q))) && (!tag || (tag === '__frz' ? x.r.freezable : tag === '__fast' ? x.r.time <= 25 : x.r.tags.includes(tag))));
  const hidden = all.filter(x => x.block).length;
  const row = x => { const r = x.r, st = x.st, rt = (S.ratings || {})[r.id];
    return `<div class="mf-meal click ${x.block ? 'blocked' : ''}" data-a="viewRecipe" data-id="${r.id}"><span class="mf-fi">${foodIcon(r.name)}</span><span class="grow"><b>${esc(r.name)}${rt === 1 ? ' <span class="like">♥</span>' : ''}</b><small>${r.time} min · ${st.kcal} kcal · ${fmtNum(st.p)} g B · ${st.priceReal < 100 ? '~' : ''}${st.cost.toFixed(2).replace('.', ',')} €${x.block ? ` · ${esc(x.block)}` : u[r.id] ? ` · ${u[r.id]}× per 14 d.` : ''}</small></span>${ic('arrow', 'sm mu')}</div>`; };
  return `<div class="mf-search"><input class="search" placeholder="Ieškoti recepto" value="${esc(UI.recipeQ)}" data-live="recipeQ">${btn(`${ic('plus', 'sm')} Pridėti`, 'importRecipe', {}, 'primary')}</div>
  ${sug.length ? `<h3 class="mf-h">Tau rekomenduojama</h3><div class="mf-reco">${sug.map(x => `<div class="mf-rc" data-a="viewRecipe" data-id="${x.r.id}"><span class="mf-fi2">${foodIcon(x.r.name)}</span><b>${esc(x.r.name)}</b><small>${x.r.time} min · ${x.st.cost.toFixed(2).replace('.', ',')} € · ${x.st.kcal} kcal</small>${x.why.length ? `<span class="why">${esc(x.why[0])}</span>` : ''}</div>`).join('')}</div>`
    : `<div class="quiet"><span class="qi">${daigelis(3)}</span><span>Pagal tavo nustatymus tinkančių receptų nėra<small>Pakeisk „Mano mityba“ arba pridėk savo receptą</small></span></div>`}
  <div class="mf-flt">${[['', 'Visi'], ['__fast', 'Greiti'], ['__frz', 'Šaldymui'], ...tags.map(t => [t, t[0].toUpperCase() + t.slice(1)])].map(([v, l]) => `<button class="${tag === v ? 'on' : ''}" data-a="recipeTag" data-v="${esc(v)}">${esc(l)}</button>`).join('')}</div>
  <div class="card mf-list">${list.map(row).join('') || empty('Nieko nerasta')}</div>
  ${hidden ? `<p class="center">${btn(showAll ? 'Slėpti netinkančius' : `Rodyti ir netinkančius (${hidden})`, 'toggleAllRecipes', {}, 'sm ghost')}</p>` : ''}`;
}
A.recipeTag = d => { UI.recipeTag = d.v; render(); };
A.toggleAllRecipes = () => { UI.showAllRecipes = !UI.showAllRecipes; render(); };
const NUTR_LABELS = [['kcal', 'Kalorijos', 'kcal'], ['p', 'Baltymai', 'g'], ['c', 'Angliavandeniai', 'g'], ['s', '– iš jų cukrūs', 'g'], ['f', 'Riebalai', 'g'], ['sat', '– iš jų sotieji', 'g'], ['fi', 'Skaidulos', 'g'], ['salt', 'Druska', 'g']];
A.viewRecipe = d => {
  const r = recipe(d.id); if (!r) return; const st = recipeStats(r), fp = freezerPortions(r.id), rt = (S.ratings || {})[r.id], blk = recipeBlock(r), sim = similarRecipes(r);
  const lastCook = [...S.cooks].reverse().find(c => c.recipeId === r.id);
  modal(`<span class="mf-fi inl">${foodIcon(r.name)}</span> ${esc(r.name)}`, `${blk ? `<div class="warnbox">⚠️ Pagal tavo nustatymus netinka: ${esc(blk)}</div>` : ''}
    <div class="macros big"><span>${st.kcal} kcal</span><span>${fmtNum(st.p)} g baltymų</span><span>${r.time} min</span><span title="${st.priceReal}% kainos – iš tavo čekių">${st.priceReal < 100 ? '~' : ''}${st.cost.toFixed(2).replace('.', ',')} €/porc.</span></div>
    <p class="center hint">${r.portions} porcijos · viso ${st.priceReal < 100 ? '~' : ''}${st.total.toFixed(2).replace('.', ',')} € (${st.priceReal ? `${st.priceReal}% kainų iš tavo čekių` : 'kainos apytikslės'})${lastCook ? ` (paskutinį kartą kainavo ${lastCook.cost.toFixed(2).replace('.', ',')} €)` : ''} · ${['', 'lengva', 'vidutinė', 'sudėtinga'][r.skill || 1]}${r.equip?.length ? ' · ' + r.equip.join(', ') : ''}${r.freezable ? ' · 🧊 tinka šaldyti' : ''}${fp ? ` · šaldiklyje ${fp} porc.` : ''}</p>
    <div class="rate">${btn('Patinka', 'rate', {id: r.id, v: 1}, 'sm ' + (rt === 1 ? 'on' : ''))}${btn('Nepatinka', 'rate', {id: r.id, v: -1}, 'sm ' + (rt === -1 ? 'on' : ''))}${r.source ? `<a class="btn sm" href="${esc(r.source)}" target="_blank" rel="noopener">🔗 Originalas</a>` : ''}</div>
    <div class="grid2"><div><h4>Ko reikia</h4><ul class="ing">${r.ing.map(([fid, g]) => { const f = food(fid); return `<li><span>${esc(f?.name || fid)}</span><b>${fmtIng(fid, g)}</b></li>`; }).join('')}</ul>
      <h4>Maistinė vertė porcijai ${st.fromSite ? '<small>(iš svetainės)</small>' : ''}</h4><table class="tbl nutri">${NUTR_LABELS.map(([k, l, u]) => `<tr><td>${l}</td><td><b>${st[k] == null ? '–' : fmtNum(st[k])}</b> ${u}</td></tr>`).join('')}</table></div>
    <div><h4>Kaip gaminti ${r.stepsOrig ? btn(UI.showOrig?.[r.id] ? '🌐 Rodyti vertimą' : `🌐 Originalas (${LANG_NAMES[r.lang] || r.lang || 'kita kalba'})`, 'toggleOrig', {id: r.id}, 'sm ghost') : !isLithuanian(r.steps.join(' ')) ? btn('Išversti į lietuvių', 'translateRecipe', {id: r.id}, 'sm') : ''}</h4>
      ${UI.showOrig?.[r.id] && r.nameOrig ? `<p class="hint">Originalus pavadinimas: ${esc(r.nameOrig)}</p>` : ''}
      <ol class="steps">${(UI.showOrig?.[r.id] && r.stepsOrig ? r.stepsOrig : r.steps).map(s => `<li>${esc(s)}</li>`).join('')}</ol>
      ${sim.length ? `<h4>Panašūs (įvairovei)</h4>${sim.map(x => `<div class="li click" data-a="viewRecipe" data-id="${x.id}"><span class="mf-fi inl">${foodIcon(x.name)}</span> ${esc(x.name)}</div>`).join('')}` : ''}</div></div>
    <div class="choice row">${btn('Pagaminau', 'cook', {id: r.id}, 'primary')}${btn('Į pirkinių sąrašą', 'planAdd', {id: r.id})}${btn('Valgau dabar', 'eatRecipe', {id: r.id})}${btn('Redaguoti', 'editRecipe', {id: r.id})}</div>`, null, {wide: true});
};
A.rate = d => { S.ratings = S.ratings || {}; const v = +d.v; S.ratings[d.id] = S.ratings[d.id] === v ? 0 : v; commit({noRender: true}); A.viewRecipe({id: d.id}); toast(S.ratings[d.id] === 1 ? '❤️ Siūlysiu dažniau ir panašių' : S.ratings[d.id] === -1 ? '👎 Nebesiūlysiu' : 'Įvertinimas pašalintas'); };
A.cook = d => {
  const r = recipe(d.id), st = recipeStats(r);
  const fr = Math.min(r.portions, r.freezable ? 2 : r.portions), fz = r.freezable ? r.portions - fr : 0;
  modal(`Pagaminau: ${esc(r.name)}`, `${fld('Kiek porcijų gavosi?', inp('portions', r.portions, 'number', 'min="1"'))}
    <div class="row">${fld(`🧊 Į šaldytuvą <small>(laikosi ${shelfDays(r, 'fridge')} d.)</small>`, inp('fridge', fr, 'number', 'min="0"'))}${fld(`❄️ Į šaldiklį <small>(${Math.round(shelfDays(r, 'freezer') / 30)} mėn.)</small>`, inp('freeze', fz, 'number', 'min="0"'))}</div>
    <p class="hint">Likusias (jei yra) suvalgei iškart.${r.freezable ? '' : ' ⚠️ Šis patiekalas šaldymui netinka.'}</p>
    ${fld(`Kiek kainavo produktai (€) <small>${st.priceReal < 100 ? '– apytiksliai' : '– pagal tavo čekius'}</small>`, inp('cost', st.total.toFixed(2), 'number', 'step="0.01" min="0"'))}${fld('Data', inp('date', today(), 'date'))}`, o => {
    S.cooks.push({id: uid(), recipeId: r.id, date: o.date, portions: +o.portions, cost: +o.cost || 0});
    addStorage(r.id, 'fridge', +o.fridge || 0, o.date); addStorage(r.id, 'freezer', +o.freeze || 0, o.date);
    S.plan = S.plan.filter(p => p.rid !== r.id);
    confetti(); toast(`${+o.fridge ? `🧊 ${o.fridge} porc. šaldytuve` : ''}${+o.fridge && +o.freeze ? ' · ' : ''}${+o.freeze ? `❄️ ${o.freeze} šaldiklyje` : ''} · +15 XP`, 'good'); commit();
  });
};
A.eatRecipe = d => { UI.mealTab = freezerPortions(d.id) ? 'freezer' : 'recipe'; UI.mealDate = today(); mealModal(); if (UI.mealTab === 'recipe') { const s = $('#mform [name=rid]'); if (s) s.value = d.id; } };
A.editRecipe = d => {
  const r = d.id ? recipe(d.id) : {name: '', emoji: '🍲', portions: 4, time: 30, freezable: true, tags: [], ing: [['', 100]], steps: [], skill: 1, equip: []};
  const row = ([fid, g]) => `<div class="ingrow">${inp('ingf[]', food(fid)?.name || '', 'text', 'list="foodlist" placeholder="Produktas"')}${inp('ingg[]', g ? amtText(fid, g) : '', 'text', 'placeholder="kiekis" class="amt"')}<button type="button" class="x" onclick="this.parentNode.remove()">✕</button></div>`;
  modal(d.id ? 'Redaguoti receptą' : 'Naujas receptas', `<datalist id="foodlist">${allFoods().map(f => `<option value="${esc(f.name)}">`).join('')}</datalist>
    <div class="row">${fld('Pavadinimas', inp('name', r.name, 'text', 'required'))}</div>
    <div class="row">${fld('Porcijos', inp('portions', r.portions, 'number', 'min="1"'))}${fld('Laikas (min)', inp('time', r.time, 'number', 'min="1"'))}${fld('Sudėtingumas', sel('skill', [[1, 'Lengva'], [2, 'Vidutinė'], [3, 'Sudėtinga']], r.skill || 1))}</div>
    ${fld('Žymos (per kablelį)', inp('tags', r.tags.join(', '), 'text', 'placeholder="pvz. wrap, vištiena, greita"'))}
    ${fld('Reikalinga technika', `<div class="chips">${EQUIP_OPTS.map(([v, l]) => `<label class="chipbtn"><input type="checkbox" name="equip[]" value="${v}" ${(r.equip || []).includes(v) ? 'checked' : ''}>${l}</label>`).join('')}</div>`)}
    <label class="cb"><input type="checkbox" name="freezable" ${r.freezable ? 'checked' : ''}> 🧊 Tinka šaldyti</label>
    <h4>Ingredientai <small>(visam kiekiui: „3 vnt“, „200 g“, „2 šaukšt.“, „1 l“)</small></h4><div id="ings">${r.ing.map(row).join('')}</div>
    <button type="button" class="btn sm" onclick="document.getElementById('ings').insertAdjacentHTML('beforeend', ${esc(JSON.stringify(row(['', 100])))})">+ ingredientas</button>
    ${fld('Gaminimo žingsniai (kiekvienas naujoje eilutėje)', `<textarea name="steps" rows="5">${esc(r.steps.join('\n'))}</textarea>`)}`, o => {
    const ing = [], bad = [];
    (o.ingf || []).forEach((n, i) => { if (!n.trim()) return; const f = allFoods().find(x => x.name.toLowerCase() === n.trim().toLowerCase()) || matchFood(n); if (!f) bad.push(n); else ing.push([f.id, amtToG(o.ingg[i], f)]); });
    if (bad.length && !UI.aiTried) { UI.aiTried = true; toast('✨ Ieškau nežinomų produktų…');
      Promise.all(bad.map(n => aiFood(n))).then(() => { $('#mform')?.requestSubmit(); setTimeout(() => { UI.aiTried = false; }, 500); }); return false; }
    UI.aiTried = false;
    if (bad.length) { warn('Nerasti produktai: ' + bad.join(', ') + '\nPasirink iš sąrašo arba pridėk per „🛒 Pirkiniai → 🥕 Produktai ir kainos“.'); return false; }
    const x = {name: o.name, emoji: oneEmoji(o.emoji) || suggestEmoji(o.name), portions: +o.portions || 1, time: +o.time || 30, freezable: !!o.freezable, skill: +o.skill || 1, equip: o.equip || [], tags: o.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean), ing, steps: o.steps.split('\n').map(s => s.trim()).filter(Boolean)};
    if (d.id) { Object.assign(r, x); delete r.nutri; } else S.recipes.push({id: 'r_' + uid(), ...x});
    commit();
  }, {wide: true, extra: d.id ? btn('🗑', 'delRecipe', {id: d.id}, 'danger sm') : ''});
};
A.delRecipe = async d => { if (!await ask('Ištrinti receptą?', '', {danger: true, icon: '🗑️', yes: 'Ištrinti'})) return; S.recipes = S.recipes.filter(r => r.id !== d.id); if (!S.deletedRecipes.includes(d.id)) S.deletedRecipes.push(d.id); A.closeModal(); commit(); };

// ---------- Recepto importas ----------
A.importRecipe = () => {
  modal('Pridėti receptą', `<p>Įklijuok <b>nuorodą</b> arba <b>visą recepto tekstą</b> (ingredientus ir gaminimą) – sutvarkysiu pats: kiekius į g / ml, ingredientus, žingsnius lietuviškai.</p>
    <textarea id="impbox" rows="7" placeholder="https://…  arba nukopijuotas recepto tekstas"></textarea>
    <p id="impmsg" class="hint"></p>
    <div class="choice row">${btn('Pridėti', 'importAny', {}, 'primary')}${btn('Įklijuoti', 'pasteRecipe', {}, 'sm')}<span class="sp"></span>${btn('Rašyti ranka', 'editRecipe', {}, 'sm ghost')}</div>`, null, {noFocus: true});
  setTimeout(() => $('#impbox')?.focus(), 50);
};
A.importAny = async () => {
  const v = $('#impbox')?.value.trim() || '', msg = $('#impmsg'); if (!v) { msg.textContent = 'Įklijuok nuorodą arba recepto tekstą'; return; }
  if (/^https?:\/\/\S+$/.test(v)) return importUrl(v);
  return importSmart(v);
};
A.pasteRecipe = async () => {
  try { const t = await navigator.clipboard.readText(); if (!t.trim()) throw 0; $('#impbox').value = t; A.importAny(); }
  catch (e) { $('#impbox')?.focus(); toast('Įklijuok į laukelį (Ctrl+V arba ilgai paspaudus → Įklijuoti)'); }
};
// Tekstas -> Claude sutvarko; jei nepavyksta – tyliai atpažįstam patys
async function importSmart(text) {
  const msg = $('#impmsg'), bt = $('[data-a=importAny]'); if (bt) bt.disabled = true; if (msg) msg.textContent = '✨ Tvarkau receptą…';
  const r = await DB.fn('recipe_parse', {text}).catch(() => null);
  if (bt) bt.disabled = false;
  if (r?.ok && r.ingredients?.length) return impFromAI(r);
  if (DEV && r && !r.ok) console.warn('recipe_parse:', r.error);
  if (!localImport(text) && msg) msg.innerHTML = '⚠️ Neradau ingredientų. Nukopijuok receptą su kiekiais (pvz. „500 g vištienos“) ir gaminimo žingsniais.';
}
async function importUrl(url) {
  const msg = $('#impmsg'); msg.textContent = '⏳ Skaitau receptą…';
  try {
    let j;
    if (cloudOn()) {
      const tok = await Auth.token(); let r;
      for (const fn of [...new Set([CLOUD.importFn, 'recipe-import'].filter(Boolean))]) {
        r = await fetch(`${CLOUD.url}/functions/v1/${fn}`, {method: 'POST', headers: {apikey: CLOUD.key, Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json'}, body: JSON.stringify({url})});
        if (r.status !== 404) break;
      }
      if (r.status === 401) throw new Error('Prisijunk iš naujo.');
      j = await r.json();
    } else j = await (await fetch('/api/import?url=' + encodeURIComponent(url))).json();
    if (!j.ok) {
      msg.innerHTML = `<div class="warnbox">Ši svetainė neleidžia automatiškai perskaityti recepto.<br><small>Atidaryk receptą, pažymėk viską (ingredientus ir gaminimą), nukopijuok ir įklijuok čia vietoj nuorodos.</small>
        <div class="choice row"><a class="btn sm" href="${esc(url)}" target="_blank" rel="noopener">🔗 Atidaryti receptą</a></div></div>`;
      $('#impbox').value = ''; return;
    }
    // svetainės duomenys – irgi per Claude (kiekiai į g, LT pavadinimai); nepavykus – kaip anksčiau
    const txt = `${j.name}\nPortions: ${j.portions || ''}\nTime: ${j.time || ''} min\nIngredients:\n${(j.ingredients || []).join('\n')}\nSteps:\n${(j.steps || []).join('\n')}`;
    msg.textContent = '✨ Tvarkau receptą…';
    const r = await DB.fn('recipe_parse', {text: txt}).catch(() => null);
    if (r?.ok && r.ingredients?.length) return impFromAI({...r, source: url, nutrition: j.nutrition});
    impOpen({...j, source: url});
  } catch (e) { msg.textContent = '⚠️ ' + e.message; }
}
function impFromAI(r) {
  const lines = r.ingredients.map(x => {
    let f = matchFood(x.name_lt) || matchFood(x.original);
    // atpažintas, bet maistinė vertė visai kita (pvz. aštrus padažas ≠ pomidorų padažas) – kuriam savą
    if (f && x.kcal >= 0 && Math.abs((f.kcal || 0) - x.kcal) > Math.max(80, x.kcal * 0.6)) f = null;
    // tas pats produktas, bet kito dydžio vienetai (vyšniniai pomidorai ≠ pomidorai)
    if (f && +x.piece_g > 0 && PIECE_G[f.id] && Math.max(PIECE_G[f.id], x.piece_g) / Math.min(PIECE_G[f.id], x.piece_g) > 2.5) f = null;
    if (!f && x.name_lt) f = foodFromAI(x);
    return {raw: x.original, foodId: f ? f.id : '', grams: Math.round(+x.grams || 0), qtyKnown: true};
  });
  const lt = String(r.lang || '').toLowerCase() === 'lt';
  impOpen({name: lt ? r.name : r.name_lt || r.name, portions: Math.round(r.portions) || 4, time: Math.round(r.time_min) || 30, lines, steps: lt ? r.steps : (r.steps_lt?.length ? r.steps_lt : r.steps),
    emoji: oneEmoji(r.emoji), freezable: r.freezable, source: r.source || '', nutrition: r.nutrition || null,
    ...(lt ? {} : {nameOrig: r.name, stepsOrig: r.steps, lang: String(r.lang || '').toUpperCase()})});
}
// Naujas produktas iš Claude duomenų (100 g), kaina – iš čekių, jei tokį pirkai
function foodFromAI(x) {
  const name = String(x.name_lt).trim(); if (!name) return null;
  let f = allFoods().find(y => y.name.toLowerCase() === name.toLowerCase()); if (f) return f;
  f = {id: 'f_' + uid(), name, kcal: Math.round(+x.kcal || 0), p: round(+x.p || 0, 1), c: round(+x.c || 0, 1), f: round(+x.f || 0, 1), s: round(+x.s || 0, 1), sat: round(+x.sat || 0, 1), fi: round(+x.fi || 0, 1), salt: round(+x.salt || 0, 2), price: 0, ai: true};
  if (x.liquid) f.liquid = true; else if (+x.piece_g > 0) f.pieceG = Math.round(+x.piece_g);
  const rcp = (S.receiptFoods || []).find(y => { const a = norm(y.key || y.name), b = norm(name); return a && b && (a.includes(b.slice(0, 6)) || b.includes(a.slice(0, 6))); });
  S.foods.push(f);
  if (rcp) { S.priceOverrides = S.priceOverrides || {}; S.priceMeta = S.priceMeta || {}; S.priceOverrides[f.id] = rcp.price; S.priceMeta[f.id] = {date: rcp.date, src: 'čekis'}; S.receiptFoods = S.receiptFoods.filter(y => y !== rcp); }
  return f;
}
// Atpažinimas be AI (atsarginis): išvalom puslapio šiukšles ir atskiriam ingredientus nuo žingsnių
const cleanRecipeLine = l => String(l).replace(/\[([^\]]*)\]\(\s*https?:[^)]*\)/g, '$1').replace(/https?:\/\/\S+/g, '').replace(/^[\s*•·▪◦‣–—▢☐□◻■✓✔☑\-]+/u, '').replace(/\s+/g, ' ').trim();
const ingCore = l => l.split(/,\s|\s\(|\.\s+(?=[A-ZĄČĘĖĮŠŲŪŽ])/)[0].trim();
function localImport(text) {
  const lines = String(text).split('\n').filter(l => !/^\s*\[[a-z][\w-]*\s+[\w-]+\s*=/i.test(l)).map(cleanRecipeLine).filter(Boolean);
  if (!lines.length) return false;
  // Veikia ir su visu nukopijuotu puslapiu: meniu, reklamos ir kt. trumpos eilutės atmetamos
  let mode = '', name = '', ingredients = [], steps = [], portions = null, time = null;
  const ING_H = /^(ingredient|ingredienser|zutaten|produkt|reikes|reikia|ko reikia|sudetis|jums reikes)/, STEP_H = /^(gaminim|paruosim|eiga|instruk|method|direction|steps?|preparation|kaip gaminti|gor sa har|tillagning|zubereitung|gamybos)/;
  const hasHeaders = lines.some(l => ING_H.test(norm(l)));
  for (const [i, l] of lines.entries()) {
    const n = norm(l);
    if (ING_H.test(n) && l.length < 40) { mode = 'ing'; continue; }
    if (STEP_H.test(n) && l.length < 40) { mode = 'steps'; continue; }
    const pm = n.match(/(\d+)\s*(porc|serv|portion|persons?|zmon)/) || n.match(/(?:serves|porcijos?|portioner|yield|makes)\s*:?\s*(\d+)/); if (pm && l.length < 40) { portions = +pm[1]; continue; }
    const tm = n.match(/(\d+)\s*(min|minut)/); if (tm && l.length < 30 && !mode) { time = +tm[1]; continue; }
    if (!mode && !/\d/.test(l)) continue; // prieš ingredientus – pavadinimas, meniu ir pan. (pavadinimą parenkam žemiau)
    const core = /^[\d½¼¾⅓⅔⅛]/.test(l) ? ingCore(l) : l, ing = parseIngredient(core), looksIng = core.length < 90 && (/^[\d½¼¾⅓⅔⅛]/.test(core) || (ing.foodId && core.split(/\s+/).length <= 4 && !/[.!]\s*$/.test(core)));
    if ((mode === 'ing' || (!hasHeaders && mode !== 'steps')) && looksIng) { ingredients.push(core); if (!mode) mode = 'ing'; continue; }
    if (mode === 'ing' && !looksIng && l.length >= 30) mode = 'steps';
    if ((mode === 'steps' || (!hasHeaders && ingredients.length)) && l.length >= 25) steps.push(l.replace(/^(\d+[.)]|step \d+:?|žingsnis \d+:?)\s*/i, ''));
  }
  if (!ingredients.length) return false;
  // pavadinimas: paskutinė „normali“ eilutė prieš ingredientus (ne meniu, ne reklama)
  const JUNK = /^(pradzia|receptai|prisijungti|registruotis|paieska|ieskoti|reklama|home|recipes?|menu|log ?in|sign ?in|search|advertisement|jump to recipe|print|share|dalintis|komentarai|subscribe|newsletter|skip to content)$/;
  const firstIng = lines.findIndex(l => ING_H.test(norm(l)) || l === ingredients[0]);
  const cands = lines.slice(0, firstIng < 0 ? 8 : firstIng).filter(l => !/\d/.test(l) && !JUNK.test(norm(l)) && l.length >= 5 && l.length < 90 && !ING_H.test(norm(l)));
  name = cands[cands.length - 1] || name;
  impOpen({name: name || 'Naujas receptas', ingredients, steps, portions, time, nutrition: null});
  return true;
}
A.importText = () => localImport($('#impbox')?.value || '');
function impOpen(j) {
  const lines = j.lines || (j.ingredients || []).map(parseIngredient);
  const text = norm((j.steps || []).join(' ') + ' ' + j.name);
  const equip = [['orkait', 'orkaitė'], ['oven', 'orkaitė'], ['air fryer', 'airfryer'], ['airfryer', 'airfryer'], ['gruzdintuv', 'airfryer'], ['slow cooker', 'lėtpuodis'], ['letpuod', 'lėtpuodis'], ['blender', 'blenderis'], ['blenderi', 'blenderis'], ['trintuv', 'blenderis'], ['keptuv', 'keptuvė'], ['pan ', 'keptuvė'], ['skillet', 'keptuvė'], ['puod', 'puodas'], ['boil', 'puodas'], ['virk', 'puodas'], ['pot ', 'puodas']].filter(([k]) => text.includes(k)).map(([, v]) => v);
  UI.imp = {name: j.name || 'Receptas', portions: j.portions || 4, time: j.time || 30, lines, steps: j.steps || [], nutri: j.nutrition, useSite: !!j.nutrition, source: j.source || '',
    equip: [...new Set(equip)], skill: (j.steps || []).length > 8 || (j.time || 0) > 75 ? 2 : 1, emoji: j.emoji || suggestEmoji(`${j.name || ''} ${(j.steps || []).join(' ')}`), freezable: j.freezable ?? true};
  if (j.nameOrig) Object.assign(UI.imp, {nameOrig: j.nameOrig, stepsOrig: j.stepsOrig, lang: j.lang, tr: {state: 'done', from: j.lang}});
  // kita kalba → verčiam į lietuvių (originalas išsaugomas)
  if (!j.nameOrig && !isLithuanian([UI.imp.name, ...UI.imp.steps].join(' '))) { UI.imp.tr = {state: 'busy'}; impModal(); translateImp(); }
  else impModal();
  if (lines.some(l => !l.foodId)) A.impAi();
}
// ===== Vertimas į lietuvių (DeepL per Supabase funkciją) =====
function isLithuanian(t) {
  const s = ' ' + String(t).toLowerCase() + ' ', lt = (s.match(/[ąčęėįšųūž]/g) || []).length;
  const words = (s.match(/ (ir|su|kol|iki|į|po|ant|pagal|minučių|min\.|keptuvėje|orkaitėje|supjaustyk\w*|išvirk\w*|kepk\w*|sumaišyk\w*|įdėk\w*) /g) || []).length;
  return lt >= 3 || words >= 2 || String(t).trim().length < 15;
}
async function cloudFn(payload) {
  if (!cloudOn()) throw new Error('Vertimas veikia tik tikroje programėlėje (debesyje), ne testavimo versijoje.');
  const tok = await Auth.token(); let r;
  for (const fn of [...new Set([CLOUD.importFn, 'recipe-import'].filter(Boolean))]) {
    r = await fetch(`${CLOUD.url}/functions/v1/${fn}`, {method: 'POST', headers: {apikey: CLOUD.key, Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json'}, body: JSON.stringify(payload)});
    if (r.status !== 404) break;
  }
  if (!r.ok) throw new Error('Supabase funkcija atsakė ' + r.status);
  return r.json();
}
const LANG_NAMES = {EN: 'anglų', SV: 'švedų', DE: 'vokiečių', PL: 'lenkų', RU: 'rusų', FR: 'prancūzų', ES: 'ispanų', IT: 'italų', LV: 'latvių', ET: 'estų', NB: 'norvegų', DA: 'danų', FI: 'suomių'};
async function translateTexts(texts) {
  const j = await cloudFn({action: 'translate', texts, target: 'LT'});
  if (!j.ok) throw new Error(j.error || 'Vertimas nepavyko');
  return j;
}
async function translateImp() {
  const I = UI.imp; if (!I) return;
  try {
    const src = [I.name, ...I.steps], j = await translateTexts(src);
    if (UI.imp !== I) return;
    if ($('#modal.open')) impSync(); // išsaugom, ką spėjai pakeisti formoje
    I.nameOrig = I.name; I.stepsOrig = I.steps; I.name = j.texts[0]; I.steps = j.texts.slice(1); I.lang = j.from; I.tr = {state: 'done', from: j.from};
  } catch (e) { if (UI.imp === I) I.tr = {state: 'err', msg: e.message}; }
  if (UI.imp === I && $('#modal.open')) impModal();
}
A.retryTr = () => { if (!UI.imp) return; impSync(); UI.imp.tr = {state: 'busy'}; impModal(); translateImp(); };
A.toggleOrigImp = () => { impSync(); UI.imp.showOrig = !UI.imp.showOrig; impModal(); };
function trBox(I) {
  const t = I.tr; if (!t) return '';
  if (t.state === 'busy') return `<div class="okbox">🌐 Verčiu į lietuvių kalbą…</div>`;
  if (t.state === 'err') return `<div class="warnbox">🌐 Nepavyko išversti: ${esc(t.msg)} ${btn('Bandyti dar kartą', 'retryTr', {}, 'sm')}</div>`;
  return `<div class="okbox">🌐 Išversta iš ${LANG_NAMES[t.from] || t.from} kalbos. Kiekiai ir produktai paimti iš originalo. ${btn(I.showOrig ? 'Rodyti vertimą' : 'Rodyti originalą', 'toggleOrigImp', {}, 'sm ghost')}</div>`;
}
// Jau išsaugoto recepto vertimas / originalas
A.translateRecipe = async d => {
  const r = recipe(d.id); if (!r) return;
  toast('🌐 Verčiu…');
  try { const j = await translateTexts([r.name, ...r.steps]); r.nameOrig = r.name; r.stepsOrig = r.steps; r.name = j.texts[0]; r.steps = j.texts.slice(1); r.lang = j.from; commit({noRender: true}); A.viewRecipe({id: r.id}); toast('🌐 Išversta', 'good'); }
  catch (e) { toast('⚠️ ' + esc(e.message)); }
};
A.toggleOrig = d => { UI.showOrig = UI.showOrig || {}; UI.showOrig[d.id] = !UI.showOrig[d.id]; A.viewRecipe({id: d.id}); };
function impCalc() {
  const I = UI.imp, r = {ing: I.lines.filter(l => l.foodId && l.grams > 0).map(l => [l.foodId, l.grams]), portions: I.portions};
  if (I.useSite && I.nutri) r.nutri = I.nutri;
  return recipeStats(r);
}
function impModal() {
  const I = UI.imp, st = impCalc(), unk = I.lines.filter(l => !l.foodId).length;
  modal('Peržiūrėk receptą', `<datalist id="foodlist">${allFoods().map(f => `<option value="${esc(f.name)}">`).join('')}</datalist>
    <div class="row">${fld('Pavadinimas', `<input data-imp="name" value="${esc(I.name)}">`)}</div>
    <div class="row">${fld('Porcijos', `<input type="number" min="1" data-imp="portions" value="${I.portions}">`)}${fld('Laikas (min)', `<input type="number" min="1" data-imp="time" value="${I.time}">`)}</div>
    <h4>Ingredientai ${I.aiBusy ? '<small>· ✨ atpažįstu nežinomus…</small>' : unk ? `<small class="red">· ${unk} neatpažinti – pasirink arba palik (bus praleisti)</small> ${btn('Atpažinti', 'impAi', {}, 'sm')}` : '<small class="green">· visi atpažinti ✓</small>'}</h4>
    <div class="implines">${I.lines.map((l, i) => `<div class="impl ${l.foodId ? '' : 'unk'}"><small>${esc(l.raw)}</small><div class="row"><input list="foodlist" data-impf="${i}" value="${esc(food(l.foodId)?.name || '')}" placeholder="— neatpažinta —"><input class="amt" data-impg="${i}" value="${esc(l.grams ? amtText(l.foodId, l.grams) : '')}" placeholder="kiekis"><button type="button" class="x" data-a="impDel" data-i="${i}">✕</button></div></div>`).join('') || empty('Ingredientų nerasta')}</div>
    <h4>Porcijai ${I.nutri ? `<label class="cb inl"><input type="checkbox" data-imp="useSite" ${I.useSite ? 'checked' : ''}> naudoti svetainės maistinę vertę</label>` : ''}</h4><div class="nchips"><span>🔥 <b>${st.kcal}</b> kcal</span><span>🥩 <b>${st.p}</b> g baltymų</span><span>🍞 <b>${st.c}</b> g angliav.</span><span>🧈 <b>${st.f}</b> g riebalų</span><span>🍬 ${st.s} g cukrų</span><span>🌾 ${st.fi} g skaidulų</span><span>🧂 ${st.salt} g druskos</span><span>💶 ~${st.cost.toFixed(2).replace('.', ',')} €</span></div>
    ${trBox(I)}
    <h4>Žingsniai (${I.steps.length})</h4><ol class="steps small">${(I.showOrig && I.stepsOrig ? I.stepsOrig : I.steps).map(s => `<li>${esc(s)}</li>`).join('')}</ol>`,
    () => { impSync(); const I = UI.imp; const ing = I.lines.filter(l => l.foodId && l.grams > 0).map(l => [l.foodId, l.grams]);
      if (!ing.length && !(I.useSite && I.nutri)) { warn('Bent vienas ingredientas turi būti atpažintas'); return false; }
      const flags = new Set(); ing.forEach(([f]) => (FOOD_FLAGS[f] || []).forEach(x => flags.add(x)));
      const tags = [...new Set([...['paukštiena', 'kiauliena', 'jautiena', 'žuvis', 'ankštiniai'].filter(x => flags.has(x)).map(x => x === 'paukštiena' ? 'vištiena' : x), ...(norm(I.name).includes('wrap') ? ['wrap'] : []), ...(norm(I.name).includes('sriub') || norm(I.name).includes('soup') ? ['sriuba'] : [])])];
      const r = {id: 'r_' + uid(), name: I.name, emoji: oneEmoji(I.emoji) || suggestEmoji(I.name), portions: +I.portions || 1, time: +I.time || 30, freezable: I.freezable ?? true, skill: I.skill, equip: I.equip, tags, ing, steps: I.steps, source: I.source};
      if (I.stepsOrig) { r.stepsOrig = I.stepsOrig; r.nameOrig = I.nameOrig; r.lang = I.lang; }
      if (I.useSite && I.nutri) r.nutri = I.nutri;
      S.recipes.push(r); UI.imp = null; commit(); toast('📗 Receptas pridėtas!', 'good'); setTimeout(() => A.viewRecipe({id: r.id}), 100); },
    {wide: true, submit: '✓ Išsaugoti receptą', noFocus: true});
}
function impSync() {
  const I = UI.imp; if (!I) return;
  document.querySelectorAll('[data-imp]').forEach(el => { const k = el.dataset.imp; I[k] = el.type === 'checkbox' ? el.checked : el.type === 'number' ? +el.value : el.value; });
  document.querySelectorAll('[data-impf]').forEach(el => { const l = I.lines[+el.dataset.impf]; const f = allFoods().find(x => x.name === el.value) || (el.value ? matchFood(el.value) : null); l.foodId = f ? f.id : ''; });
  document.querySelectorAll('[data-impg]').forEach(el => { const l = I.lines[+el.dataset.impg]; l.grams = amtToG(el.value, food(l.foodId)); });
}
A.impDel = d => { impSync(); UI.imp.lines.splice(+d.i, 1); impModal(); };

function fFreezer() {
  const items = storageItems(), fridge = items.filter(x => x.place === 'fridge'), frz = items.filter(x => x.place === 'freezer');
  const total = sum(items.map(x => x.portions)), perDay = Math.max(1, (+S.foodPrefs.mealsPerDay || 3) - 1), daysLeft = round(total / perDay, 1);
  const row = x => { const r = x.r, st = r ? recipeStats(r) : {};
    return `<div class="mf-st"><div class="mf-meal"><span class="mf-fi">${foodIcon(r?.name || '')}</span><span class="grow"><b>${esc(r?.name || 'Ištrintas receptas')}</b><small>${x.portions} porc. · pagaminta ${relDay(x.date)} · ${st.kcal || 0} kcal</small></span><span class="mf-left ${x.left <= 1 ? 'w' : ''}">${leftText(x)}</span></div>
    <div class="mf-acts"><span class="stepper">${btn('−', 'frz', {id: x.id, n: -1}, 'sm')}<b>${x.portions}</b>${btn('+', 'frz', {id: x.id, n: 1}, 'sm')}</span><span class="sp"></span>${x.place === 'freezer' ? btn('Atšildyti 1', 'thaw', {id: x.id}, 'sm') : r?.freezable && x.left >= 1 ? btn('Užšaldyti', 'refreeze', {id: x.id}, 'sm') : ''}${btn('Valgau', 'eatFreezer', {id: x.id}, 'sm primary')}</div></div>`; };
  return `<div class="mf-sumt"><div><b>${total}</b><span>porcijos</span></div><div><b>~${fmtNum(daysLeft)} d.</b><span>maisto užteks</span></div><div><b class="${fridge.some(x => x.left <= 1) ? 'brc' : ''}">${fridge.filter(x => x.left <= 1).length}</b><span>greitai baigs galioti</span></div></div>
  <label class="switch card"><input type="checkbox" data-c="mealSuggest" ${S.foodPrefs.mealSuggest ? 'checked' : ''}><span></span><div><b>Siūlyk, ką valgyti kada</b><small>Pagal tai, kas greičiau genda, sportą ir dienos ritmą „Šiandien“ skiltyje pasiūlys, kurią porciją valgyti kuriam valgymui.</small></div></label>
  <h3 class="mf-h">Šaldytuvas</h3><div class="card mf-list">${fridge.length ? fridge.map(row).join('') : empty('Tuščia')}</div>
  <h3 class="mf-h">Šaldiklis ${btn('+ Pagaminau', 'foodTab', {v: 'recipes'}, 'sm ghost')}</h3><div class="card mf-list">${frz.length ? frz.map(row).join('') : empty('Tuščia. Pagamink receptą ir paspausk „Pagaminau“.')}</div>`;
}
A.frz = d => { const f = S.freezer.find(x => x.id === d.id); f.portions = Math.max(0, f.portions + +d.n); if (!f.portions) S.freezer = S.freezer.filter(x => x !== f); commit(); };
A.thaw = d => { const f = S.freezer.find(x => x.id === d.id); if (!f) return; takePortion(f.id, 1); S.freezer.push({id: uid(), recipeId: f.recipeId, place: 'fridge', portions: 1, date: f.date, until: addDays(today(), 2), thawed: true}); commit(); toast('🧊 Perkelta į šaldytuvą – suvalgyk per 2 d.'); };
A.refreeze = d => { const f = S.freezer.find(x => x.id === d.id); if (!f) return; const n = f.portions; S.freezer = S.freezer.filter(x => x !== f); addStorage(f.recipeId, 'freezer', n, f.date); commit(); toast(`❄️ ${n} porc. užšaldyta`); };
A.eatFreezer = d => { UI.mealTab = 'freezer'; UI.mealDate = today(); mealModal(); const r = $(`#mform input[value="${d.id}"]`); if (r) r.checked = true; };

function fShop() {
  const bw = budgetWeek(), agg = {};
  for (const p of S.plan) { const r = recipe(p.rid); if (!r) continue; for (const [fid, g] of r.ing) agg[fid] = (agg[fid] || 0) + g * (p.mult || 1); }
  const items = Object.entries(agg).map(([fid, g]) => { const f = food(fid); return {fid, name: f?.name || fid, g: Math.round(g), cost: (f?.price || 0) * g / 1000, mine: f?.priceMine}; }).sort((a, b) => a.name.localeCompare(b.name));
  const total = sum(items.map(i => i.cost)), checked = S.shopChecked || {}, done = items.filter(i => checked[i.fid]).length;
  const ws = weekStart(today()), rcpts = (S.spend || []).filter(s => s.date >= ws);
  return `<div class="card mf-sum"><div class="mf-bud">Šią savaitę <b>${bw.spent.toFixed(2).replace('.', ',')} €</b> iš ${bw.budget.toFixed(0)} €<div class="mb"><i style="width:${bw.budget ? clamp(bw.spent / bw.budget * 100, 0, 100) : 0}%;background:var(--br)"></i></div>
      <small>${bw.fromReceipts ? 'Pagal čekius' : 'Pagal pagamintus'} · sąrašas kainuos ~${total.toFixed(2).replace('.', ',')} € · liks ~<span class="${bw.left - total < 0 ? 'red' : ''}">${(bw.left - total).toFixed(2).replace('.', ',')} €</span></small></div>
    ${rcpts.length ? `<p class="hint">Šios savaitės čekiai: ${rcpts.map(s => `${fmtDate(s.date)} – ${s.amount.toFixed(2).replace('.', ',')} €${s.note ? ' (' + esc(s.note) + ')' : ''}`).join(', ')}</p>` : ''}
    <div class="choice row" style="margin-top:12px">${btn('Nuskaityti čekį', 'scanReceipt', {}, 'primary sm')}${btn('Produktai ir kainos', 'foodTab', {v: 'foods'}, 'sm')}</div></div>
  <h3 class="mf-h">Pirkinių sąrašas ${items.length ? `<small>${done} iš ${items.length}</small>` : ''}</h3>
  <div class="card mf-list">${items.length ? items.map(i => `<label class="mf-chk ${checked[i.fid] ? 'd' : ''}"><input type="checkbox" data-c="shopCheck" data-id="${i.fid}" ${checked[i.fid] ? 'checked' : ''}><span class="bx"></span><span class="grow">${esc(i.name)}</span><small>${fmtIng(i.fid, i.g)} · ${i.mine ? '' : '~'}${i.cost.toFixed(2).replace('.', ',')} €</small></label>`).join('') + `<div class="choice row" style="margin-top:8px">${btn('Kopijuoti sąrašą', 'copyShop', {}, 'sm')}${btn('Išvalyti', 'clearPlan', {}, 'sm ghost')}</div>` : empty('Sąrašas tuščias – pridėk receptų iš „Receptai“ → „Į pirkinių sąrašą“.')}</div>
  <h3 class="mf-h">Ką gaminsiu</h3>
  <div class="card mf-list">${S.plan.length ? S.plan.map(p => { const r = recipe(p.rid); if (!r) return ''; const st = recipeStats(r); return `<div class="mf-meal"><span class="mf-fi">${foodIcon(r.name)}</span><span class="grow"><b>${esc(r.name)}</b><small>× ${p.mult || 1} (${r.portions * (p.mult || 1)} porc.) · ${st.priceReal < 100 ? '~' : ''}${(st.total * (p.mult || 1)).toFixed(2).replace('.', ',')} €</small></span><span class="stepper">${btn('−', 'planMult', {id: p.rid, n: -1}, 'sm')}${btn('+', 'planMult', {id: p.rid, n: 1}, 'sm')}</span></div>`; }).join('') : empty('Pridėk receptų iš „Receptai“.')}
    <div class="choice row" style="margin-top:8px">${btn('+ Receptas', 'foodTab', {v: 'recipes'}, 'sm')}</div></div>`;
}

// ---------- Čekio nuskaitymas ----------
// Įprasti pakuočių dydžiai (g), kai čekyje svoris neparašytas
const PACK_G = {sviestas:200, pienas:1000, kefyras:1000, jogurtas:400, graik_jog:400, skyr:400, varske_0:400, varske_9:400, suris:250, mozzarella:125, grietine20:400, grietine10:400, grietinele:200,
  makaronai:500, makaronai_pg:500, ryziai:1000, ryziai_rudi:1000, grikiai:1000, avizos:500, miltai:1000, cukrus:1000, kiausiniai:600, duona_rug:800, duona_pg:500, lavasas:360, kuskusas:500, bulguras:500, kinva:500, lesiai:500, perlines:1000,
  pom_konserv:400, pom_pasta:140, pup_raud:400, pup_balt:400, avinz:400, kukuruzai:340, tunas:160, kok_pienas:400, sojos:150, majonezas:400, kecupas:500, medus:400, pesto:190, humusas:200, tofu:300,
  alyv_al:500, saul_al:1000, riesut_sv:350, chia:200, migdolai:200, graikiniai:200, saulegrazos:200, baltymai:1000, kumpis:200, desreles:400, krevetes:250, darz_mix:400, zirneliai:400, uogos:400, spinatai:200, salotos:150, sokoladas:100, batonelis:60};
A.scanReceipt = () => {
  modal('Čekio nuskaitymas', `<p>Nufotografuok visą čekį (gerai apšviestą, tiesiai) arba įkelk nuotrauką.</p>
    <label class="btn primary big center-btn">📷 Fotografuoti / įkelti čekį<input type="file" accept="image/*" capture="environment" data-c="receipt" hidden></label>
    <p id="rcmsg" class="hint">Nuotrauka apdorojama tavo įrenginyje ir niekur nesiunčiama.</p>
    <details class="impalt"><summary>Arba įklijuok čekio tekstą (pvz. iš el. čekio)</summary><textarea id="rctext" rows="8" placeholder="Bananai 1,234 kg x 1,29  1,59&#10;Pienas 2,5% 1L  1,29&#10;..."></textarea>${btn('Atpažinti', 'receiptText', {}, 'sm')}</details>`, null, {noFocus: true});
};
function loadScript(src) { return new Promise((ok, bad) => { if ([...document.scripts].some(s => s.src === src)) return ok(); const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => bad(new Error('Nepavyko įkelti atpažinimo įrankio (reikia interneto)')); document.head.appendChild(s); }); }
async function runReceiptOCR(file) {
  if (!$('#rcmsg')) A.scanReceipt();
  const msg = $('#rcmsg');
  try {
    msg.textContent = '⏳ Ruošiu teksto atpažinimą (pirmą kartą gali užtrukti ~20 s)…';
    await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js');
    const res = await Tesseract.recognize(file, 'lit+eng', {logger: m => { if (m.status === 'recognizing text' && $('#rcmsg')) $('#rcmsg').textContent = `⏳ Skaitau čekį… ${Math.round(m.progress * 100)}%`; }});
    // eilutės, kurias OCR perskaitė nedrąsiai (žemas patikimumas)
    const doubt = (res.data.lines || []).filter(l => l.confidence < 60 && /\d+[.,]\d{2}/.test(l.text)).map(l => l.text.trim());
    receiptReview(res.data.text, {conf: res.data.confidence, doubt});
  } catch (e) { if ($('#rcmsg')) $('#rcmsg').textContent = '⚠️ ' + e.message; }
}
A.receiptText = () => receiptReview($('#rctext').value, {pasted: true});
// Ar nuotraukoje čekis? (o ne etiketė, veidas ar kita)
function receiptCheck(text, conf) {
  const t = norm(text), letters = text.replace(/[^a-ząčęėįšųūž]/gi, '').length, prices = (text.match(/\d+[.,]\d{2}\b/g) || []).length;
  const rcKw = ['is viso', 'suma', 'pvm', 'kvitas', 'kasa', 'eur', 'moketi', 'moketa', 'kortel', 'grynais', 'graza', 'maxima', 'rimi', 'lidl', 'iki', 'norfa', 'aibe', 'lojalumo', 'nuolaida', 'cekis', 'total', 'subtotal', 'amount', 'cash', 'change', 'receipt', 'vat', 'kvitto', 'summa', 'moms', 'att betala', 'kassa', 'ica', 'coop', 'willys', 'hemkop', 'tesco', 'aldi', 'walmart'].filter(w => t.includes(w)).length;
  const lblKw = ['energine verte', 'energetine verte', 'maistine verte', 'maistingumas', 'kcal', 'kj', 'riebalai', 'sociosios', 'sotiosios', 'angliavandeniai', 'cukrus', 'cukru', 'baltymai', 'druska', '100 g', '100g', 'nutrition', 'per 100', 'skaidul', 'saturates', 'carbohydrate', 'protein'].filter(w => t.includes(w)).length;
  if (letters < 20) return {bad: 'empty'};
  if (lblKw >= 3 && lblKw >= rcKw) return {bad: 'label'};
  if (prices < 2 && rcKw < 1) return {bad: 'notreceipt'};
  if (conf != null && conf < 45) return {bad: 'blurry'};
  return {ok: true};
}
// Maistinės vertės etiketė → produkto reikšmės 100 g
function parseLabel(text) {
  const t = norm(text).replace(/,/g, '.');
  const g = re => { const m = t.match(re); return m ? +m[1] : null; };
  return {kcal: g(/(\d+(?:\.\d+)?)\s*kcal/), f: g(/riebal\w*\s*[:\-]?\s*(\d+(?:\.\d+)?)/) ?? g(/fat\s*[:\-]?\s*(\d+(?:\.\d+)?)/), sat: g(/(?:socios|sotios|saturates)\w*[^\d]{0,40}(\d+(?:\.\d+)?)/),
    c: g(/angliavand\w*\s*[:\-]?\s*(\d+(?:\.\d+)?)/) ?? g(/carbohydrate\w*\s*[:\-]?\s*(\d+(?:\.\d+)?)/), s: g(/cukr\w*\s*[:\-]?\s*(\d+(?:\.\d+)?)/) ?? g(/sugars?\s*[:\-]?\s*(\d+(?:\.\d+)?)/),
    fi: g(/skaidul[^\d]{0,30}(\d+(?:\.\d+)?)/) ?? g(/(?:fibre|fiber)[^\d]{0,15}(\d+(?:\.\d+)?)/), p: g(/baltym\w*\s*[:\-]?\s*(\d+(?:\.\d+)?)/) ?? g(/protein\s*[:\-]?\s*(\d+(?:\.\d+)?)/), salt: g(/druska\s*[:\-]?\s*(\d+(?:\.\d+)?)/) ?? g(/salt\s*[:\-]?\s*(\d+(?:\.\d+)?)/)};
}
const RC_BAD = {
  empty: '📷 Nuotraukoje beveik nėra teksto – nepanašu į čekį.',
  notreceipt: '🤔 Nepanašu į čekį (nerasta kainų ir čekio požymių).',
  blurry: '🌫️ Nuotrauka per neryški – tekstą sunku perskaityti.',
  label: '🏷️ Atrodo, kad tai maistinės vertės etiketė, ne čekis.',
};
function rcRetry(kind, text) {
  const m = $('#rcmsg'); if (!m) return;
  UI.lastLabel = kind === 'label' ? parseLabel(text) : null;
  m.innerHTML = `<div class="warnbox">${RC_BAD[kind]}<br><small>Patarimai: visas čekis kadre, gera šviesa, telefoną laikyk tiesiai, be šešėlių.</small>
    <div class="choice row"><label class="btn sm primary">📷 Fotografuoti iš naujo<input type="file" accept="image/*" capture="environment" data-c="receipt" hidden></label>
    ${kind === 'label' ? btn('Sukurti produktą iš etiketės', 'addFood', {label: 1}, 'sm') : ''}${btn('Įvesti ranka', 'rcManual', {}, 'sm ghost')}</div></div>`;
}
A.rcManual = () => { UI.rc = {items: [], total: '', date: today(), addSpend: true, quality: {manual: true}}; A.rcAdd(); };
const money = s => +String(s).replace(',', '.');
function parseReceipt(text) {
  const lines = String(text).split('\n').map(s => s.replace(/\s+/g, ' ').trim()).filter(s => s.length > 1);
  const items = []; let total = null, pendingName = null;
  for (const l of lines) {
    const n = norm(l);
    // LT / EN / SV čekio tarnybinės eilutės
    if (/^(is viso|viso|suma|moketi|moketa|mokejimas|total|subtotal|sub total|amount|balance|grand total|to pay|apmoketa|banko kort|mokejimo kort|kortele|grynieji|grynais|graza|change|cash|pvm|vat|tax|moms|kvitas|receipt|kvitto|kasa|kassa|kasinink|cashier|data|date|datum|laikas|time|pardav|nuolaidu suma|you saved|sutaupete|aciu|thank|tack|parduotuve|uab|adresas|imones|ak\b|card|visa\b|mastercard|kort\b|kortbetalning|kvito|cekio|lojalumo|att betala|summa|totalt|org\.?nr|tel\b)/.test(n) || /(uab|ab\b|lt,?\s*uab|pvm kodas|imones kodas|org\.? ?nr|vat no)/.test(n)) {
      const m = l.match(/(\d+[.,]\d{2})/g); if (/^(is viso|viso|suma|moketi|mokėti|total|grand total|amount due|to pay|balance due|att betala|summa|totalt)/.test(n) && m) total = money(m[m.length - 1]); continue;
    }
    const kg = l.match(/(\d+[.,]\d{2,3})\s*kg\s*(?:[x×*X@]|á|a)\s*(?:[$€£]|kr\s*)?(\d+[.,]\d{2})/i);
    const price = l.match(/(-?\d+[.,]\d{2})\s*(?:[A-Z€$£]|kr|sek|eur|usd)?\s*$/i);
    const nameOnLine = l.replace(/(\d+[.,]\d{2,3})\s*kg.*$/i, '').replace(/(-?\d+[.,]\d{2})\s*(?:[A-Z€$£]|kr|sek|eur|usd)?\s*$/i, '').replace(/[$€£]\s*$/, '').trim();
    if (kg) {
      const it = {kg: money(kg[1]), ppk: money(kg[2]), total: price ? money(price[1]) : round(money(kg[1]) * money(kg[2]), 2)};
      if (/\p{L}{3,}/u.test(nameOnLine)) items.push({...it, name: nameOnLine, raw: l});
      else if (pendingName) { items.push({...it, name: pendingName, raw: pendingName + ' ' + l}); }
      else if (items.length && !items[items.length - 1].kg) Object.assign(items[items.length - 1], it, {raw: items[items.length - 1].raw + ' ' + l});
      pendingName = null; continue;
    }
    if (price) {
      const v = money(price[1]);
      if (v < 0 || /^(nuolaida|akcija|lojal|kupon|discount|coupon|savings|rabatt|-)/.test(n)) { if (items.length) { const p = items[items.length - 1]; p.total = round(p.total + (v < 0 ? v : -v), 2); if (p.kg) p.ppk = round(p.total / p.kg, 2); } continue; }
      if (/\p{L}{3,}/u.test(nameOnLine)) { items.push({name: nameOnLine, total: v, raw: l}); pendingName = null; continue; }
      if (pendingName) { items.push({name: pendingName, total: v, raw: pendingName + ' ' + l}); pendingName = null; continue; }
    }
    if (/\p{L}{3,}/u.test(l)) pendingName = l;
  }
  // valiuta
  const tx = String(text), cur = /€|\beur\b/i.test(tx) ? 'EUR' : /\$|\busd\b/i.test(tx) ? 'USD' : /£|\bgbp\b/i.test(tx) ? 'GBP' : /\bsek\b|\bkr\b|:-/i.test(tx) ? (/\bnok\b/i.test(tx) ? 'NOK' : /\bdkk\b/i.test(tx) ? 'DKK' : 'SEK') : 'EUR';
  return {total, currency: cur, items: items.map(it => {
    const cnt = it.name.match(/(\d+)\s*[x×]\s*\d+[.,]\d{2}/); const count = cnt ? +cnt[1] : 1;
    const name = it.name.replace(/(\d+)\s*[x×]\s*\d+[.,]\d{2}/, '').trim();
    const f = matchFood(name);
    const size = name.match(/(\d+(?:[.,]\d+)?)\s*(kg|g|gr|l|ml)\b/i);
    let grams = it.kg ? it.kg * 1000 : size ? money(size[1]) * ({kg: 1000, l: 1000, g: 1, gr: 1, ml: 1}[size[2].toLowerCase()]) * count : f ? (PACK_G[f.id] || (PIECE_G[f.id] ? PIECE_G[f.id] * count : 0)) * (PACK_G[f.id] ? count : 1) : 0;
    grams = Math.round(grams);
    const nn = norm(name);
    const kind = NONFOOD_WORDS.some(w => nn.includes(w)) ? 'ne' : (f && SNACK_IDS.includes(f.id)) || SNACK_WORDS.some(w => nn.includes(w)) ? 'snack' : 'food';
    return {raw: it.raw, name, total: it.total, grams, sizeGuess: !it.kg && !size, foodId: kind === 'ne' ? '' : f ? f.id : '', apply: kind !== 'ne' && !!f && grams > 0, kind};
  }).filter(x => x.total > 0)};
}
async function receiptReview(text, meta = {}) {
  const chk = receiptCheck(text, meta.conf);
  if (!chk.ok) return rcRetry(chk.bad, text);
  const p = parseReceipt(text);
  if (!p.items.length) return rcRetry('notreceipt', text);
  // neaiškios eilutės (OCR nedrąsiai perskaitė)
  const dn = (meta.doubt || []).map(norm);
  p.items.forEach(x => { x.doubt = dn.some(d => d && norm(x.raw).includes(d.slice(0, 12))); });
  const found = round(sum(p.items.map(x => x.total)), 2);
  const foreign = p.currency !== 'EUR';
  let rate = 1;
  if (foreign) { const m = $('#rcmsg'); if (m) m.textContent = `💱 Gaunu ${p.currency} → € kursą…`; rate = await fxRate(p.currency, today()); }
  if (foreign && !rate) p.items.forEach(x => x.apply = false);
  UI.rc = {items: p.items, total: p.total ?? found, date: today(), addSpend: !foreign || !!rate, currency: p.currency, rate, quality: {total: p.total, found, conf: meta.conf, pasted: meta.pasted}};
  rcModal();
}
// Valiutų kursas (ECB per frankfurter.app, nemokamas, be rakto); talpinamas naršyklėje
const CUR_SIGN = {EUR: '€', USD: '$', GBP: '£', SEK: 'kr', NOK: 'kr', DKK: 'kr'};
async function fxRate(cur, date) {
  if (cur === 'EUR') return 1;
  const key = `fx_${cur}_${date}`, c = localStorage.getItem(key); if (c) return +c;
  for (const u of [`https://api.frankfurter.dev/v1/${date}?base=${cur}&symbols=EUR`, `https://api.frankfurter.dev/v1/latest?base=${cur}&symbols=EUR`, `https://api.frankfurter.app/latest?from=${cur}&to=EUR`]) {
    try { const j = await (await fetch(u)).json(); const r = j?.rates?.EUR; if (r) { localStorage.setItem(key, r); return r; } } catch (e) {}
  }
  return null;
}
const inCur = (v, R) => R.currency && R.currency !== 'EUR' ? `${(+v).toFixed(2)} ${CUR_SIGN[R.currency] || R.currency}${R.rate ? `<br><small>≈ ${(v * R.rate).toFixed(2).replace('.', ',')} €</small>` : ''}` : `${(+v).toFixed(2).replace('.', ',')} €`;
// Čekio kokybės juosta: kiek sumos atpažinta
function rcQuality() {
  const R = UI.rc, q = R.quality || {}, found = round(sum(R.items.map(x => +x.total || 0)), 2), tot = +R.total || q.total;
  if (q.manual) return '';
  if (!q.total) return `<div class="warnbox">⚠️ Neradau galutinės sumos („IŠ VISO“) – gal nufotografuotas ne visas čekis? Patikrink prekes, trūkstamas pridėk ranka.</div>`;
  const pct = tot ? Math.round(found / tot * 100) : 0, miss = round(tot - found, 2), doubt = R.items.filter(x => x.doubt).length;
  if (pct >= 90 && pct <= 110) return `<div class="okbox">✅ Atpažinta ${Math.min(pct, 100)}% čekio sumos (${found.toFixed(2)} iš ${tot.toFixed(2)} ${CUR_SIGN[R.currency] || '€'}).${doubt ? ` ${doubt} eilutė(s) pažymėtos „?“ – patikrink.` : ''}</div>`;
  if (pct >= 60) return `<div class="warnbox">⚠️ Atpažinta ${pct}% sumos – trūksta ~${miss.toFixed(2)} . ${pct > 100 ? 'Gal kažkas nuskaityta dvigubai?' : 'Pridėk trūkstamas eilutes ranka arba perfotografuok.'}${doubt ? ` „?“ – neaiškios eilutės.` : ''}</div>`;
  return `<div class="badbox">❌ Atpažinta tik ${pct}% čekio sumos. Rekomenduoju perfotografuoti visą čekį (gera šviesa, tiesiai) – arba papildyk ranka.<div class="choice row"><label class="btn sm primary">📷 Fotografuoti iš naujo<input type="file" accept="image/*" capture="environment" data-c="receipt" hidden></label></div></div>`;
}
A.rcAdd = () => { if (UI.rc.items.length) rcSync(); UI.rc.items.push({raw: '✍️ įvesta ranka', name: '', total: 0, grams: 0, kind: 'food', manual: true, apply: true, foodId: ''}); rcModal(); setTimeout(() => { const els = document.querySelectorAll('[data-rcf]'); els[els.length - 1]?.focus(); }, 60); };
const RC_KINDS = [['food', '🥕 Maistas'], ['snack', '🍫 Užkandis'], ['ne', '🚫 Ne maistas']];
function rcModal() {
  const R = UI.rc, foodSum = sum(R.items.filter(x => x.kind === 'food').map(x => x.total)), snackSum = sum(R.items.filter(x => x.kind === 'snack').map(x => x.total)), neSum = sum(R.items.filter(x => x.kind === 'ne').map(x => x.total));
  modal('Patikrink čekį', `<datalist id="foodlist">${allFoods().map(f => `<option value="${esc(f.name)}">`).join('')}</datalist>
    ${rcQuality()}
    ${R.currency && R.currency !== 'EUR' ? (R.rate ? `<div class="okbox">💱 Čekis valiuta <b>${R.currency}</b>. Perskaičiuosiu į eurus pagal ECB kursą: 1 ${R.currency} = ${R.rate.toFixed(4)} €. Kainos ir biudžetas bus eurais.</div>`
      : `<div class="warnbox">💱 Čekis valiuta <b>${R.currency}</b>, bet nepavyko gauti kurso (reikia interneto). Kainų neatnaujinsiu, kad nesusimaišytų.</div>`) : ''}
    <p class="hint">Pažymėtiems produktams atnaujinsiu kainą.</p>
    <div class="implines">${R.items.map((x, i) => { const ppk = x.grams ? x.total / x.grams * 1000 : 0; return `<div class="impl ${x.kind === 'ne' ? 'nef' : x.foodId ? '' : 'unk'} ${x.doubt ? 'doubt' : ''}"><small>${x.doubt ? '<b class="warnc" title="Neaiškiai perskaityta – patikrink kainą">? </b>' : ''}${esc(x.raw)}</small><div class="row">
      <select data-rck="${i}" class="rck">${RC_KINDS.map(([v, l]) => opt(v, l, x.kind)).join('')}</select>
      ${x.kind === 'ne' ? '<span class="grow muted">nebus skaičiuojama</span>' : `<input type="checkbox" data-rca="${i}" ${x.apply ? 'checked' : ''} title="Atnaujinti kainą"><input list="foodlist" data-rcf="${i}" value="${esc(food(x.foodId)?.name || (x.manual ? x.name : ''))}" placeholder="${x.manual ? 'produktas (pvz. Bananai)' : x.kind === 'snack' ? 'užkandis (nebūtina)' : 'naujas produktas – bus išsaugotas'}">
      <input type="number" data-rcg="${i}" value="${x.grams || ''}" placeholder="g" title="Kiekis gramais"><span class="u">g${x.sizeGuess && x.grams ? '~' : ''}</span>`}
      ${x.manual || x.doubt ? `<span class="rcp"><input type="number" step="0.01" min="0" data-rcp="${i}" value="${x.total || ''}" placeholder="€" class="rcpi">${ppk && x.kind !== 'ne' ? `<br><small>${ppk.toFixed(2).replace('.', ',')} €/kg</small>` : ''}</span>`
        : `<span class="rcp">${inCur(x.total, R)}${ppk && x.kind !== 'ne' ? `<br><small>${(ppk * (R.rate || 1)).toFixed(2).replace('.', ',')} €/kg</small>` : ''}</span>`}</div></div>`; }).join('')}</div>
    <div class="choice row">${btn('+ Pridėti eilutę ranka', 'rcAdd', {}, 'sm')}</div>
    <div class="kv rcsum"><span>🥕 Maistas</span><b>${(foodSum * (R.rate || 1)).toFixed(2).replace('.', ',')} €</b><span>🍫 Užkandžiai</span><b>${(snackSum * (R.rate || 1)).toFixed(2).replace('.', ',')} €</b><span>🚫 Ne maistas (neskaičiuojama)</span><b>${(neSum * (R.rate || 1)).toFixed(2).replace('.', ',')} €</b></div>
    <div class="row" style="margin-top:8px">${fld('Data', `<input type="date" data-rct="date" value="${R.date}" min="2000-01-01" max="2099-12-31">`)}</div>
    <label class="cb"><input type="checkbox" data-rct="addSpend" ${R.addSpend ? 'checked' : ''}> Įrašyti ${((foodSum + snackSum) * (R.rate || 1)).toFixed(2).replace('.', ',')} € į savaitės maisto išlaidas</label>`,
    () => { rcSync(); const R = UI.rc; let upd = 0, saved = 0;
      S.priceOverrides = S.priceOverrides || {}; S.priceMeta = S.priceMeta || {}; S.receiptFoods = S.receiptFoods || [];
      for (const x of R.items) {
        if (x.kind === 'ne' || !(x.grams > 0) || (R.currency && R.currency !== 'EUR' && !R.rate)) continue;
        const ppk = round(x.total * (R.rate || 1) / x.grams * 1000, 2);
        if (x.foodId && x.apply) { S.priceOverrides[x.foodId] = ppk; S.priceMeta[x.foodId] = {date: R.date, src: 'čekis'}; upd++; }
        else if (!x.foodId && x.name) { // naujas produktas – išsaugom kainą, kol atsiras receptas
          const key = norm(x.name).replace(/\d+([.,]\d+)?\s*(kg|g|gr|l|ml)\b/g, '').trim();
          const ex = S.receiptFoods.find(y => y.key === key);
          if (ex) Object.assign(ex, {price: ppk, date: R.date}); else S.receiptFoods.push({id: uid(), key, name: x.name, price: ppk, date: R.date, kind: x.kind});
          saved++;
        }
      }
      const k = R.currency && R.currency !== 'EUR' ? (R.rate || 0) : 1, fs = round(sum(R.items.filter(x => x.kind === 'food').map(x => x.total)) * k, 2), ss = round(sum(R.items.filter(x => x.kind === 'snack').map(x => x.total)) * k, 2);
      if (R.addSpend && fs + ss > 0) S.spend.push({id: uid(), date: R.date, amount: round(fs + ss, 2), food: fs, snack: ss, note: R.currency && R.currency !== 'EUR' ? 'čekis ' + R.currency : 'čekis'});
      UI.rc = null; commit(); toast(`🧾 Atnaujinta ${upd} kainų${saved ? ` · ${saved} nauji produktai išsaugoti` : ''}${R.addSpend ? ` · išlaidos +${(fs + ss).toFixed(2).replace('.', ',')} €` : ''}`, 'good'); },
    {wide: true, submit: `✓ Išsaugoti`, noFocus: true});
}
function rcSync() {
  const R = UI.rc; if (!R) return;
  document.querySelectorAll('[data-rck]').forEach(el => { const x = R.items[+el.dataset.rck]; if (x.kind !== el.value) { x.kind = el.value; if (x.kind === 'ne') { x.apply = false; } } });
  document.querySelectorAll('[data-rca]').forEach(el => R.items[+el.dataset.rca].apply = el.checked);
  document.querySelectorAll('[data-rcp]').forEach(el => R.items[+el.dataset.rcp].total = +el.value || 0);
  document.querySelectorAll('[data-rcf]').forEach(el => { const x = R.items[+el.dataset.rcf]; if (x.manual) { x.name = el.value; x.raw = '✍️ ' + (el.value || 'įvesta ranka'); } });
  document.querySelectorAll('[data-rcf]').forEach(el => { const x = R.items[+el.dataset.rcf]; const f = allFoods().find(y => y.name === el.value) || (el.value ? matchFood(el.value) : null); if ((f?.id || '') !== x.foodId) { x.foodId = f ? f.id : ''; if (f && !x.grams) { x.grams = PACK_G[f.id] || PIECE_G[f.id] || 0; x.sizeGuess = true; } if (f) x.apply = true; } });
  document.querySelectorAll('[data-rcg]').forEach(el => R.items[+el.dataset.rcg].grams = +el.value || 0);
  document.querySelectorAll('[data-rct]').forEach(el => R[el.dataset.rct] = el.type === 'checkbox' ? el.checked : el.value);
}
A.planAdd = d => { const p = S.plan.find(x => x.rid === d.id); if (p) p.mult = (p.mult || 1) + 1; else S.plan.push({rid: d.id, mult: 1}); A.closeModal(); commit(); toast('🛒 Pridėta į pirkinių sąrašą'); };
A.planMult = d => { const p = S.plan.find(x => x.rid === d.id); p.mult = (p.mult || 1) + +d.n; if (p.mult <= 0) S.plan = S.plan.filter(x => x !== p); commit(); };
A.clearPlan = () => { S.plan = []; S.shopChecked = {}; commit(); };
A.copyShop = () => { const txt = [...document.querySelectorAll('.shop')].map(l => '☐ ' + l.querySelector('span').textContent + ' – ' + l.querySelector('b').textContent).join('\n'); navigator.clipboard?.writeText(txt).then(() => toast('Nukopijuota – įklijuok į žinutes ar užrašus')); };

function fFoods() {
  const q = UI.foodQ.toLowerCase(), list = allFoods().filter(f => !q || f.name.toLowerCase().includes(q)), stale = stalePrices();
  return `${stale.length ? `<div class="warnbox">🕒 Senesnės nei mėnesio kainos produktų, kuriuos naudoji: <b>${stale.map(f => esc(f.name)).join(', ')}</b>. ${btn('Nuskaityti čekį', 'scanReceipt', {}, 'sm')} arba spausk kainą ir įrašyk.</div>` : ''}
  <div class="toolbar"><input class="search" placeholder="🔍 Ieškoti produkto" value="${esc(UI.foodQ)}" data-live="foodQ">${btn('Čekis', 'scanReceipt', {}, 'sm')}${btn('+ Savas produktas', 'addFood', {}, 'primary')}</div>
  ${receiptFoodsCard()}
  <div class="card tblwrap"><table class="tbl"><thead><tr><th>Produktas</th><th>kcal</th><th>Balt.</th><th>Angl.</th><th>Cukr.</th><th>Rieb.</th><th>Skaid.</th><th>€/kg</th><th></th></tr></thead><tbody>${list.map(f => `<tr><td>${esc(f.name)}${f.builtin ? '' : ' <span class="tag">savas</span>'}</td><td>${f.kcal}</td><td>${f.p}</td><td>${f.c}</td><td>${f.s ?? '–'}</td><td>${f.f}</td><td>${f.fi ?? '–'}</td><td><button class="pricebtn ${f.priceMine ? 'mine' : ''}" data-a="editPrice" data-id="${f.id}" title="${f.priceMine ? `Tavo kaina${S.priceMeta?.[f.id] ? ' (' + S.priceMeta[f.id].src + ', ' + fmtDate(S.priceMeta[f.id].date) + ')' : ''}` : 'Apytikslė kaina – spausk ir pakeisk'}">${f.priceMine ? '' : '~'}${(f.price || 0).toFixed(2)} ✏️</button></td><td>${f.builtin ? '' : `<button class="x" data-a="delFood" data-id="${f.id}">✕</button>`}</td></tr>`).join('')}</tbody></table>
  <p class="hint">Vertės 100 g. Spausk kainą, kad įrašytum savo.</p></div>`;
}
A.editPrice = async d => {
  const f = food(d.id); const v = await askText(`💶 ${esc(f.name)}`, 'Kaina už 1 kg (€). Palik tuščią – grąžinti numatytą.', f.price?.toFixed(2) ?? '', {placeholder: 'pvz. 4,99'});
  if (v === null) return; S.priceOverrides = S.priceOverrides || {};
  S.priceMeta = S.priceMeta || {};
  if (v.trim() === '') { delete S.priceOverrides[d.id]; delete S.priceMeta[d.id]; } else { const n = +v.replace(',', '.'); if (!(n >= 0)) return warn('Netinkama kaina'); S.priceOverrides[d.id] = n; S.priceMeta[d.id] = {date: today(), src: 'ranka'}; }
  commit(); toast('Kaina atnaujinta');
};
// Produktai iš čekių, kurių nėra bazėje
// Seni čekių įrašai: dabar atpažinti → kaina perkeliama į produktą; ne maistas – išmetamas; senesni nei 120 d. – pamirštami
function tidyReceiptFoods() {
  const list = S.receiptFoods || [], old = addDays(today(), -120); let ch = false;
  S.receiptFoods = list.filter(x => {
    const nn = norm(x.name);
    if (NONFOOD_WORDS.some(w => nn.includes(w)) || (x.date || '') < old) { ch = true; return false; }
    const f = x.kind === 'snack' ? null : matchFood(x.name);
    if (f) { S.priceOverrides = S.priceOverrides || {}; S.priceMeta = S.priceMeta || {}; if (!S.priceMeta[f.id] || S.priceMeta[f.id].date <= x.date) { S.priceOverrides[f.id] = x.price; S.priceMeta[f.id] = {date: x.date, src: 'čekis'}; } ch = true; return false; }
    return true;
  });
  return ch;
}
function receiptFoodsCard() {
  if (tidyReceiptFoods()) setTimeout(() => commit({noRender: true}), 0);
  const all = S.receiptFoods || [];
  if (!all.length) return '';
  // Nieko daryti nereikia: kaina saugoma tyliai ir panaudojama, kai toks produktas atsiras recepte
  return `<details class="impalt card"><summary>Kitos prekės iš čekių (${all.length}) – kainos išsaugotos, nieko daryti nereikia</summary>
    ${all.map(x => `<div class="li"><span>${x.kind === 'snack' ? '🍫 ' : ''}${esc(x.name)}</span><span class="sp"></span><small>${x.price.toFixed(2).replace('.', ',')} €/kg</small>${btn('✕', 'delRf', {id: x.id}, 'sm ghost')}</div>`).join('')}
    <p class="hint">Kai šis produktas atsiras recepte, jo kaina bus paimta iš čia. Po 120 d. įrašas pasimiršta.</p></details>`;
}
A.delRf = d => { S.receiptFoods = S.receiptFoods.filter(x => x.id !== d.id); commit(); };
A.addFood = (d = {}) => { const rf = d.rf && (S.receiptFoods || []).find(x => x.id === d.rf), L = d.label && UI.lastLabel ? UI.lastLabel : {}, lv = k => L[k] ?? ''; modal('Naujas produktas', `<p class="hint">${d.label ? '🏷️ Užpildžiau pagal etiketės nuotrauką – patikrink skaičius ir įrašyk pavadinimą.' : 'Vertes rasi ant pakuotės (100 g).'}</p>${fld('Pavadinimas', inp('name', rf ? rf.name.replace(/\d+([.,]\d+)?\s*(kg|g|gr|l|ml)\b/gi, '').trim() : '', 'text', 'required'))}
  <div class="row">${fld('kcal / 100 g', inp('kcal', lv('kcal'), 'number', 'required step="0.1"'))}${fld('Baltymai', inp('p', lv('p'), 'number', 'step="0.1"'))}${fld('Angliav.', inp('c', lv('c'), 'number', 'step="0.1"'))}${fld('iš jų cukrūs', inp('s', lv('s'), 'number', 'step="0.1"'))}</div>
  <div class="row">${fld('Riebalai', inp('f', lv('f'), 'number', 'step="0.1"'))}${fld('iš jų sotieji', inp('sat', lv('sat'), 'number', 'step="0.1"'))}${fld('Skaidulos', inp('fi', lv('fi'), 'number', 'step="0.1"'))}${fld('Druska', inp('salt', lv('salt'), 'number', 'step="0.01"'))}</div>${fld('Kaina €/kg (nebūtina)', inp('price', rf ? rf.price : '', 'number', 'step="0.01"'))}`,
  o => { const id = 'f_' + uid(); S.foods.push({id, name: o.name, ...Object.fromEntries(NUTR_KEYS.map(k => [k, +o[k] || 0])), price: +o.price || 0});
    if (rf) { S.priceOverrides[id] = +o.price || 0; S.priceMeta[id] = {date: rf.date, src: 'čekis'}; S.receiptFoods = S.receiptFoods.filter(x => x !== rf); }
    commit(); toast('Produktas pridėtas'); }); };
A.delFood = d => { S.foods = S.foods.filter(f => f.id !== d.id); commit(); };

// ================= SPORTAS =================
// ================= SPORTAS (1.8 – „programa programoje“, design/sportas-v4.html) =================
const EQ_LT = {'body only': 'be įrangos', dumbbell: 'hanteliai', barbell: 'štanga', kettlebells: 'svarstis', bands: 'gumos', cable: 'lynų treniruoklis', machine: 'treniruoklis', 'medicine ball': 'medicininis kamuolys', 'exercise ball': 'gimnastikos kamuolys', 'foam roll': 'masažo volas', 'e-z curl bar': 'EZ grifas', other: 'kita'};
const LVL_LT = ['', 'pradedančiajam', 'vidutinis lygis', 'pažengusiems'];
const G_SHORT = {kru: 'Krūtinė', nug: 'Nugara', pec: 'Pečiai', tra: 'Trapecija', kak: 'Kaklas', bic: 'Bicepsas', tri: 'Tricepsas', dil: 'Dilbiai', pre: 'Pilvas', son: 'Įstrižiniai', apn: 'Nugaros apačia', sed: 'Sėdmenys', ket: 'Keturgalvis', uzp: 'Užpakalinė šlaunis', pri: 'Šlaunies vidus', bla: 'Blauzdos', kar: 'Kardio'};
const G_SLUG = {kru: ['chest'], nug: ['upper-back'], pec: ['deltoids'], tra: ['trapezius'], kak: ['neck'], bic: ['biceps'], tri: ['triceps'], dil: ['forearm'], pre: ['abs'], son: ['obliques'], apn: ['lower-back'], sed: ['gluteal'], ket: ['quadriceps'], uzp: ['hamstring'], pri: ['adductors'], bla: ['calves', 'tibialis']};
const SLUG_G = Object.fromEntries(Object.entries(G_SLUG).flatMap(([g, ss]) => ss.map(s => [s, g])));
const MUS_PAGE = {dil: 'Dilbiai ir riešai', kak: 'Kaklas', pre: 'Pilvas', son: 'Įstrižiniai pilvo raumenys', apn: 'Nugaros apačia', bla: 'Blauzdos', pri: 'Šlaunies vidus'};
// treniruotės kryptys (ką treniruojam)
const FOCUS = [['auto', 'Parink už mane', null, 'wauto'], ['kojos', 'Kojos', ['ket', 'sed', 'uzp', 'bla'], 'wleg'], ['nugara', 'Nugara', ['nug', 'apn', 'tra'], 'wdumb'], ['kruti', 'Krūtinė', ['kru', 'tri', 'pec'], 'wdumb'], ['rankos', 'Rankos', ['bic', 'tri', 'dil'], 'warm'], ['peciai', 'Pečiai', ['pec', 'tra'], 'wup'], ['pilvas', 'Pilvas', ['pre', 'apn'], 'wcore'], ['visas', 'Visas kūnas', ['kru', 'nug', 'ket', 'sed', 'pec'], 'wfire'], ['tempimas', 'Tempimas', ['tempimas'], 'wsmall']];
const FOCUS_TITLE = {kojos: 'Kojos ir sėdmenys', nugara: 'Nugara', kruti: 'Krūtinė ir rankos', rankos: 'Rankos', peciai: 'Pečiai', pilvas: 'Pilvas ir nugaros stabilumas', visas: 'Visas kūnas', tempimas: 'Tempimas'};
const sportById = id => { for (const [, , l] of (typeof SPORTS === 'undefined' ? [] : SPORTS)) { const s = l.find(x => x[0] === id); if (s) return s; } return null; };
const sportIcon = id => { if (typeof SPORTS === 'undefined') return 'gym'; for (const [, i, l] of SPORTS) if (l.some(x => x[0] === id)) return {run: 'srun', bike: 'sbike', swim: 'sswim', ball: 'sball', yoga: 'syoga', walk: 'swalk', 'w-fire': 'wfire', 'w-up': 'wup', 'w-dumb': 'wdumb'}[i] || 'gym'; return 'gym'; };
const wtypeName = id => { const f = FOCUS.find(x => x[0] === id); if (f) return f[0] === 'auto' ? 'Treniruotė' : FOCUS_TITLE[id] || f[1]; const s = sportById(id); if (s) return s[1]; return WTYPES.find(w => w.id === id)?.name || 'Treniruotė'; };
const isGpsSport = id => !!sportById(id)?.[3];
const isStrength = w => !w.type || !sportById(w.type) || w.type === 'strength';
const workoutKcal = w => w.kcal || Math.round((sportById(w.type)?.[2] || 5) * (currentWeight() || 75) * (+w.duration || 0) / 60);
const workoutKg = w => Math.round(sum((w.exercises || []).map(x => sum((x.sets || []).map((r, j) => (+r || 0) * (+(x.kg || [])[j] || 0))))));
const exImg = (id, n = 0) => `${EX_SRC}${encodeURIComponent(exId(id))}/${n}.jpg`;
const exPh = (id, cls = 'sp-ph') => `<span class="${cls}" style="background-image:url('${exImg(id)}')"></span>`;
const fmtKm = m => String(round((m || 0) / 1000, 2)).replace('.', ',');
const fmtPace = (sec, m) => { if (!m) return '–'; const p = sec / (m / 1000); return `${Math.floor(p / 60)}:${String(Math.round(p % 60)).padStart(2, '0')}`; };
const fmtClock = s => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return h ? `${h}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}` : `${m}:${String(x).padStart(2, '0')}`; };
const spGo = (p, extra = {}) => { const prev = UI.view === 'sport' ? UI.sp?.p + '|' + (UI.sp?.id || '') : ''; UI.sp = {p, from: UI.sp?.p || 'home', ...extra}; UI.view = 'sport'; A.closeSheet?.(); render(); window.scrollTo(0, 0); if (prev !== p + '|' + (extra.id || '')) navPush(); };
A.spGo = d => spGo(d.p, {id: d.id, g: d.g});
A.spBack = () => NAV.depth > 0 && history.state?.ls ? history.back() : spGo(UI.sp?.back || (['ex', 'wv', 'act', 'mus', 'review'].includes(UI.sp?.p) && UI.sp?.from && UI.sp.from !== UI.sp.p ? UI.sp.from : 'home'));
const spBack = t => `<div class="sp-h"><button class="sp-back" data-a="spBack" aria-label="Atgal">${ic('back')}</button><h2>${t}</h2></div>`;
const spSheet = (html, cls = '') => { $('#sheet').innerHTML = `<div class="dim" data-a="closeSheet"></div><div class="sh sp-sheet ${cls}"><div class="grab"></div>${html}</div>`; };

// ----- kūno žemėlapis (18 grupių, priekis ir nugara) -----
function muscleHeat() { const last = muscleLastTrained(), t = today(), h = {}; for (const g in last) { const d = diffDays(last[g], t); h[g] = d <= 3 ? 3 : d <= 7 ? 2 : 1; } return h; }
function bodySvg(heat = {}, sel = '', click = true) {
  if (typeof BODY_MAP === 'undefined') return '';
  const side = s => { const b = BODY_MAP[s];
    return `<svg viewBox="${b.vb}" role="img"><path class="o" d="${b.outline}"/>${Object.entries(b.parts).map(([k, ps]) => { const g = SLUG_G[k];
      const c = !g ? 'skin' : g === sel ? 'sel' : 'h' + (heat[g] || 0);
      return ps.map(d => `<path class="p ${c}" d="${d}" ${g && click ? `data-a="spGo" data-p="mus" data-g="${g}"` : ''}/>`).join(''); }).join('')}</svg>`; };
  return `<div class="sp-body">${side('front')}${side('back')}</div>`;
}
const bodyLegend = `<div class="sp-mlg"><span><i style="background:var(--br)"></i>≤ 3 d.</span><span><i style="background:var(--s2)"></i>4–7 d.</span><span><i style="background:var(--s3)"></i>senokai</span><span><i style="background:var(--card2)"></i>nedaryta</span></div>`;
// Daigelis, kurį galima paspausti: mirksi, pašoka, nusišypso, sužiba žvaigždutės
function tapDaigelis(a, data = {}) {
  const sp = (x, y, r, c, k) => `<path class="sk ${k}" d="M${x} ${y - r}L${x + r * .3} ${y - r * .3}L${x + r} ${y}L${x + r * .3} ${y + r * .3}L${x} ${y + r}L${x - r * .3} ${y + r * .3}L${x - r} ${y}L${x - r * .3} ${y - r * .3}Z" fill="${c}"/>`;
  return `<button class="dg-tap" data-a="${a}" ${Object.entries(data).map(([k, v]) => `data-${k}="${v}"`).join(' ')} aria-label="Daigelis"><svg class="dg" viewBox="0 0 120 120"><g class="lv"><path d="M60 46 C60 36 60 30 60 22" stroke="var(--stem)" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M60 30 C46 14 30 18 28 26 C40 34 52 34 60 30z" fill="var(--leaf)"/><path d="M60 26 C72 8 92 10 95 19 C82 30 68 30 60 26z" fill="var(--leaf)"/></g>
    <rect x="22" y="44" width="76" height="62" rx="30" fill="var(--masc)"/><rect x="30" y="52" width="60" height="48" rx="24" fill="var(--masc2)"/>
    <g class="fn"><g class="ey"><ellipse cx="47" cy="72" rx="6.5" ry="8" fill="#1a0b00"/><ellipse cx="73" cy="72" rx="6.5" ry="8" fill="#1a0b00"/><circle cx="49" cy="69" r="2.3" fill="#fff"/><circle cx="75" cy="69" r="2.3" fill="#fff"/></g><g class="ez"><path d="M41 72 Q47 76 53 72" stroke="#1a0b00" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M67 72 Q73 76 79 72" stroke="#1a0b00" stroke-width="4" fill="none" stroke-linecap="round"/></g><path d="M51 86 Q60 95 69 86" stroke="#1a0b00" stroke-width="4" fill="none" stroke-linecap="round"/></g>
    <g class="fh"><path d="M40 74 Q47 64 54 74" stroke="#1a0b00" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M66 74 Q73 64 80 74" stroke="#1a0b00" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M47 84 Q60 101 73 84 Z" fill="#1a0b00"/><path d="M53 92 Q60 97 67 92" stroke="#ff7f8f" stroke-width="4" fill="none" stroke-linecap="round"/></g>
    <circle cx="36" cy="86" r="5" fill="#ff7f8f" opacity=".45"/><circle cx="84" cy="86" r="5" fill="#ff7f8f" opacity=".45"/>${sp(12, 40, 9, 'var(--br)', 'a')}${sp(108, 34, 7, 'var(--leaf)', 'b')}${sp(104, 70, 5, 'var(--s2)', 'c')}</svg></button>`;
}
const spRing = (p, sz = 104, w = 9) => { const r = 48 - w / 2 - 1, L = 2 * Math.PI * r; return `<svg viewBox="0 0 96 96" width="${sz}" height="${sz}"><circle cx="48" cy="48" r="${r}" fill="none" stroke="var(--card2)" stroke-width="${w}"/>${p > 0 ? `<circle cx="48" cy="48" r="${r}" fill="none" stroke="var(--br)" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${L * clamp(p, 0, 1)} ${L}" transform="rotate(-90 48 48)"/>` : ''}</svg>`; };

// ----- Daigelio žinutės: įvairios, švelnios (AI paruošia kas savaitę; jei nėra – iš bibliotekos) -----
function spMsg(kind, ctx = {}) {
  const ai = (S.dgMsgs || {})[kind]; const seed = Math.floor(Date.now() / 3.6e6) + kind.length;
  if (sportSet().aiMsgs && ai && ai.length) return noEmo(pick(ai, seed));
  const L = {
    suggest: ctx.g ? [`${cap(ctx.g)} nedarei jau ${ctx.d} d. – šiandien pats laikas.`, `${cap(ctx.g)} raumenys pailsėjo – galima dirbti.`, `${cap(ctx.g)} laukia jau ${ctx.d} d. Pradėkim nuo pirmo pratimo.`] : [ 'Trumpa treniruotė geriau nei jokios.', 'Pradėk nuo pirmo pratimo – toliau eisis lengviau.'],
    done: ['Treniruotė padaryta – puikus darbas!', 'Dar viena plyta į pamatą.', 'Rytoj gali jausti raumenis – tai normalu.', 'Smagu matyti, kad grįžti!', 'Tai buvo gera treniruotė.'],
    run: ['Gražus tempas – taip ir toliau!', 'Kiekvienas kilometras skaičiuojasi.', 'Puikus judėjimas šiandien!'],
    live: ['Puikiai judi – taip ir toliau!', 'Kiekviena minutė skaičiuojasi.', 'Smagu, kad judi!'],
    review: ['Pasižiūrėkim kartu, kaip sekėsi.', 'Gerai padirbėjai – liko tik smulkmenos.'],
  }[kind] || ['Puiku!'];
  return pick(L, seed);
}

// ----- pagrindinis Sporto ekranas -----
function weekStats() {
  const ws = weekStart(today()), days = range(ws, 7), list = S.workouts.filter(w => w.date >= ws && w.date <= addDays(ws, 6));
  return {days, list, n: list.length, min: sum(list.map(w => +w.duration || 0)), kcal: sum(list.map(workoutKcal)), goal: +S.profile.workoutsPerWeek || 3};
}
function streakWeeks() { let n = 0, w = weekStart(today()); const has = d => S.workouts.some(x => x.date >= d && x.date <= addDays(d, 6)); if (!has(w)) w = addDays(w, -7); while (has(w) && n < 200) { n++; w = addDays(w, -7); } return n; }
function spHero(withRing = true) {
  const st = weekStats(), t = today();
  const days = `<div class="sp-days">${st.days.map(d => `<span class="${workoutsOn(d).length ? 'd' : ''} ${d === t ? 't' : ''}"><i></i>${DOW[dow(d) - 1].slice(0, 1)}</span>`).join('')}</div>`;
  if (!withRing) return `<div class="sp-hero"><div class="sp-hstats"><div><b>${st.n}</b>treniruotės</div><div><b>${st.min}</b>min</div><div><b>${fmtThousands(st.kcal)}</b>kcal</div></div>${days}</div>`;
  return `<div class="sp-hero"><div class="sp-htop"><div class="sp-rg"><div class="sp-bring">${spRing(st.n / st.goal)}<b>${st.n}/${st.goal}</b></div><small>treniruotės</small></div>
    <div class="sp-stats"><div><b>${st.min}</b>min</div><div><b>${fmtThousands(st.kcal)}</b>kcal</div><div><b>${streakWeeks()}</b>sav. iš eilės</div></div></div>${days}</div>`;
}
const fmtThousands = n => String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
function todaysSuggestion() {
  const set = sportSet(), last = muscleLastTrained(), t = today();
  const pref = S.sportSugg && S.sportSugg.date === t ? S.sportSugg : null;
  const focus = pref?.focus || (() => { const by = FOCUS.filter(f => f[2] && f[0] !== 'tempimas' && f[0] !== 'visas').map(f => ({f: f[0], d: Math.min(...f[2].map(g => last[g] ? diffDays(last[g], t) : 99))})).sort((a, b) => b.d - a.d); return by[0]?.f || 'visas'; })();
  const f = FOCUS.find(x => x[0] === focus), dur = pref?.duration || +S.profile.workoutMin || 45, place = pref?.place || set.place;
  const exs = pref?.exercises || buildWorkout(f[2], dur, place);
  const g0 = f[2] ? f[2].map(g => ({g, d: last[g] ? diffDays(last[g], t) : null})).sort((a, b) => (b.d ?? 99) - (a.d ?? 99))[0] : null;
  const GEN = {kojos: 'kojų', nugara: 'nugaros', kruti: 'krūtinės', rankos: 'rankų', peciai: 'pečių', pilvas: 'pilvo', visas: 'viso kūno'};
  return {focus, title: FOCUS_TITLE[focus] || f[1], place, duration: dur, exercises: exs, why: g0 && g0.d ? {g: GEN[focus] || 'šių raumenų', d: g0.d} : {}};
}
const PLACE_LT = {gym: 'Salė', home: 'Namie', out: 'Lauke'};
function suggestCard(sg) {
  const n = sg.exercises.length, lvl = LVL_LT[sportSet().level || 1];
  return `<section class="sp-next"><span class="lb">Šiandien siūlau</span><h3>${esc(sg.title)}</h3><div class="meta">${PLACE_LT[sg.place]} · ~${sg.duration} min · ${n} pratim${n === 1 ? 'as' : n < 10 ? 'ai' : 'ų'} · ${lvl}</div>
    <div class="sp-thumbs">${sg.exercises.slice(0, 4).map(x => `<span style="background-image:url('${exImg(x.id)}')"></span>`).join('')}${n > 4 ? `<span class="more">+${n - 4}</span>` : ''}</div>
    <div class="sp-say">${daigelis(4)}<p>${esc(spMsg('suggest', sg.why))}</p></div>
    <div class="sp-acts"><button class="btn primary big" data-a="spStartSugg">${ic('play', 'sm')} Pradėti</button><button class="btn" data-a="spKita">Kita</button></div></section>`;
}
function plannedCard(p) {
  const n = p.exercises?.length || 0;
  return `<section class="sp-next"><span class="lb">Suplanuota · ${p.date === today() ? 'šiandien' : relDay(p.date)} ${p.start}</span><h3>${esc(wtypeName(p.type))}</h3><div class="meta">${PLACE_LT[p.place || sportSet().place]} · ~${p.duration} min${p.remind !== false ? ` · priminsiu ${fromMin(Math.max(0, toMin(p.start) - 30))}` : ''}</div>
    ${n ? `<div class="sp-thumbs">${p.exercises.slice(0, 4).map(x => `<span style="background-image:url('${exImg(x.id)}')"></span>`).join('')}${n > 4 ? `<span class="more">+${n - 4}</span>` : ''}</div>` : ''}
    <div class="sp-acts"><button class="btn primary big" data-a="startPlan" data-id="${p.id}">${ic('play', 'sm')} Pradėti</button><button class="btn" data-a="planDone" data-id="${p.id}">${ic('check', 'sm')} Padariau</button></div>
    <div class="sp-acts q"><button class="btn ghost sm" data-a="openPlan" data-id="${p.id}">${ic('pen', 'sm')} Keisti</button><button class="btn ghost sm" data-a="spPlanSheet" data-id="${p.id}">${ic('cal', 'sm')} Perkelti</button><button class="btn ghost sm" data-a="planSkip" data-id="${p.id}">Praleisti</button></div></section>`;
}
function topSports(n = 6) {
  const cnt = {}; for (const w of S.workouts) if (sportById(w.type)) cnt[w.type] = (cnt[w.type] || 0) + 1;
  const ids = [...new Set([...Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a]), 'run', 'bike', 'walk', 'swim', 'basketball', 'yoga'])].filter(x => x !== 'strength');
  return ids.slice(0, n).map(sportById).filter(Boolean);
}
const sportsRow = () => `<div class="sp-grp">Kitas sportas<button class="lnk" data-a="spGo" data-p="sports">visi ${typeof SPORTS === 'undefined' ? '' : SPORTS.flatMap(c => c[2]).length} ›</button></div>
  <div class="sp-sports">${topSports().map(s => `<button data-a="spSport" data-id="${s[0]}"><span class="ci">${ic(sportIcon(s[0]), 'sm')}</span>${esc(s[1])}</button>`).join('')}</div>`;
function workoutRow(w, extra = '') {
  const sp = sportById(w.type), s = isStrength(w);
  const sub = [cap(relDay(w.date)), `${w.duration} min`, w.distance ? `${fmtKm(w.distance)} km` : '', s && workoutKg(w) ? `${fmtThousands(workoutKg(w))} kg pakelta` : '', extra].filter(Boolean).join(' · ');
  return `<button class="sp-li" data-a="${s ? 'viewWorkout' : 'spAct'}" data-id="${w.id}"><span class="sp-fi">${ic(sp ? sportIcon(w.type) : 'wdumb')}</span><span class="tx"><b>${esc(s ? wtypeName(w.type) : sp?.[1] || 'Treniruotė')}</b><small>${sub}</small></span><span class="k">${fmtThousands(workoutKcal(w))} kcal</span></button>`;
}
function recentCard() {
  const ws = [...S.workouts].sort((a, b) => (b.date + (b.start || '')) > (a.date + (a.start || '')) ? 1 : -1).slice(0, 3);
  return `<section class="card sp-card"><h2 class="sp-ct">Paskutinės${ws.length ? `<button class="lnk" data-a="spGo" data-p="hist">visos ›</button>` : ''}</h2>${ws.length ? ws.map(w => workoutRow(w)).join('') : `<p class="hint">Čia atsiras tavo treniruotės.</p>`}</section>`;
}
// pratimas, kurį darai jau ilgai – pasiūlymas pakeisti (ne dažniau kaip kas 4 sav.)
function swapCandidate() {
  if (!sportSet().swaps) return null;
  const t = today(), recent = (S.exSwaps || []).some(s => diffDays(s.date, t) < 28), dis = S.swapNo || {};
  if (recent) return null;
  const cnt = {}; for (const w of S.workouts) if (w.date > addDays(t, -42)) for (const x of w.exercises || []) { const id = exId(x.id); (cnt[id] = cnt[id] || new Set()).add(weekStart(w.date)); }
  const id = Object.keys(cnt).find(k => cnt[k].size >= 5 && !(dis[k] && diffDays(dis[k], t) < 42)); if (!id) return null;
  const e = exercise(id); if (!e) return null;
  const alt = allExercises().filter(o => o.id !== id && BUILD_CATS.includes(o.cat) && o.pg[0] === e.pg[0] && placeOk(o, sportSet().place) && o.lvl <= Math.max(e.lvl, sportSet().level)).sort((a, b) => (b.common - a.common) || (b.comp - a.comp))[0];
  return alt ? {from: e, to: alt} : null;
}
function swapNudge(c) {
  return `<section class="card sp-card"><div class="sp-say" style="margin-top:0">${daigelis(4)}<p>${esc(c.from.name)} darai jau kelias savaites – kūnas priprato. Pabandom kitą variantą?</p></div>
    <div class="sp-pair">${exPh(c.from.id)}<span><small>Dabar</small><b>${esc(c.from.name)}</b></span><span class="arr">${ic('arrow', 'sm')}</span>${exPh(c.to.id)}<span><small>Siūlau</small><b>${esc(c.to.name)}</b></span></div>
    <div class="sp-acts"><button class="btn primary big" data-a="spSwapYes" data-f="${c.from.id}" data-t="${c.to.id}">Keisti</button><button class="btn" data-a="spSwapNo" data-f="${c.from.id}">Palikti</button></div></section>`;
}
A.spSwapYes = d => { S.exSwaps = S.exSwaps || []; S.exSwaps.push({from: d.f, to: d.t, date: today()}); UI.spUndo = {from: d.f, to: d.t}; commit(); };
A.spSwapNo = d => { S.swapNo = {...(S.swapNo || {}), [d.f]: today()}; commit(); };
A.spSwapUndo = d => { const s = (S.exSwaps || []).filter(x => x.from === d.f && !x.undone).pop(); if (s) s.undone = today(); UI.spUndo = null; commit(); };
const undoRow = () => { const u = UI.spUndo; if (!u) return ''; const t = exercise(u.to); return `<div class="sp-undo"><span>Pakeista į ${esc(t?.name || '')}</span><button data-a="spSwapUndo" data-f="${u.from}">Grąžinti</button></div>`; };

// ----- 1.8.1 (design/sportas-v5.html): žingsniai ir judėjimas pirmiausia -----
const APK_URL = 'https://github.com/BIMOX5/life-schedule-android/releases/latest/download/life-schedule.apk';
const activeMinToday = () => sum(workoutsOn(today()).map(w => +w.duration || 0));
function stepsHero() {
  const d = today(), n = stepsOn(d), g = stepGoal(), conn = HC.ok || n > 0, week = range(weekStart(d), 7);
  const vals = week.map(stepsOn), mx = Math.max(g, ...vals, 1);
  return `<button class="sp5-hero" data-a="spGo" data-p="steps"><div class="sp5-top"><div class="sp5-ring">${spRing(conn ? n / g : 0, 150, 10)}<b>${n ? fmtThousands(n) : '–'}<small>${n ? `iš ${fmtThousands(g)}` : 'žingsnių'}</small></b></div>
    <div class="sp5-side">${conn ? `<div><b>${n ? fmtNum(stepsKm(n)) : '0'}</b>km</div><div><b>${n ? stepsKcal(n) : 0}</b>kcal</div><div><b>${activeMinToday()}</b>aktyvios min</div>` : '<p>Žingsniai ateis patys, kai prijungsi telefoną ar laikrodį.</p>'}</div></div>
    ${conn ? `<div class="sp5-week">${week.map((x, i) => `<span class="${x === d ? 't' : ''}"><i class="${vals[i] >= g ? 'g' : ''}" style="height:${Math.max(6, vals[i] / mx * 100)}%"></i>${DOW[dow(x) - 1].slice(0, 1)}</span>`).join('')}</div>` : ''}</button>`;
}
const startGrid = () => `<div class="sp5-go">${[['walk', 'swalk', 'Ėjimas', 'su žemėlapiu'], ['run', 'srun', 'Bėgimas', 'su žemėlapiu'], ['bike', 'sbike', 'Dviratis', 'su žemėlapiu'], ['strength', 'wdumb', 'Treniruotė', 'pratimai']].map(([id, i, l, s], k) => `<button class="${k ? '' : 'm'}" data-a="spSport" data-id="${id}"><i>${ic(i)}</i><b>${l}</b><small>${s}</small></button>`).join('')}</div>
  <button class="sp5-more" data-a="spGo" data-p="sports">Kitas sportas – ${SPORTS.flatMap(c => c[2]).length} ›</button>`;
const connCard = () => `<button class="sp5-conn" data-a="spGo" data-p="conn"><span class="sp-fi">${ic('swatch')}</span><span><b>Prijunk telefoną ar laikrodį</b><small>Žingsniai, pulsas ir treniruotės ateis patys</small></span><span class="btn primary sm">Prijungti</span></button>`;
const weekSmall = () => { const st = weekStats(); return `<button class="sp5-wk" data-a="spGo" data-p="hist"><span class="r">${spRing(st.n / st.goal, 46, 7)}<b>${st.n}/${st.goal}</b></span><span><b>Treniruotės šią savaitę</b><small>${st.min} min · ${streakWeeks()} sav. iš eilės</small></span><span class="chev">${ic('arrow', 'sm')}</span></button>`; };
A.spMenu = () => spSheet(`<h3>Sportas</h3>${[['spLogSheet', 'check', 'Įrašyti atliktą'], ['spPlanSheet', 'cal', 'Suplanuoti'], ['spGoLib', 'srch', 'Pratimai'], ['spGoConn', 'swatch', 'Telefonas ir laikrodis'], ['spGoSet', 'more', 'Sporto nustatymai']].map(([a, i, l]) => `<button class="sp-opt" data-a="${a}"><span class="sp-fi">${ic(i)}</span><span><b>${l}</b></span></button>`).join('')}`);
A.spGoLib = () => spGo('lib'); A.spGoConn = () => spGo('conn'); A.spGoSet = () => spGo('set');

// ----- žingsnių ekranas -----
function spSteps() {
  const d = today(), n = stepsOn(d), g = stepGoal(), tab = UI.stepTab || 'day', left = Math.max(0, g - n);
  const days = tab === 'month' ? range(addDays(d, -29), 30) : range(weekStart(d), 7), vals = days.map(stepsOn), mx = Math.max(g, ...vals, 1), logged = vals.filter(Boolean);
  const hours = HC.hours && HC.hours.date === d ? HC.hours.h : null, hmx = hours ? Math.max(1, ...hours) : 1;
  const src = (S.steps || []).find(x => x.date === d)?.src, srcTxt = HC.ok ? (HC.src || 'Health Connect') + (HC.last ? ` · ${HC.last}` : '') : src === 'manual' ? 'Įrašyta ranka' : 'Neprijungta';
  const chart = tab === 'day' && hours ? `<section class="card sp-card"><h2 class="sp-ct">Šiandien per valandas</h2><div class="sp5-hb">${hours.map(v => `<i style="height:${Math.max(3, v / hmx * 100)}%"></i>`).join('')}</div><div class="sp5-hl"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div></section>` : '';
  const bars = `<section class="card sp-card"><h2 class="sp-ct">${tab === 'month' ? '30 dienų' : 'Savaitė'}<small>${logged.length ? `vid. ${fmtThousands(sum(logged) / logged.length)}` : ''}</small></h2><div class="sp5-bars ${tab === 'month' ? 'm' : ''}">${days.map((x, i) => `<i class="${vals[i] >= g ? 'g' : x === d ? 't' : ''}" style="height:${Math.max(4, vals[i] / mx * 100)}%"></i>`).join('')}</div>${tab === 'month' ? '' : `<div class="sp5-hl d">${days.map(x => `<span>${DOW[dow(x) - 1].slice(0, 1)}</span>`).join('')}</div>`}</section>`;
  const msg = !n ? 'Kai žingsniai atkeliaus, čia matysi visą dieną.' : left ? `Iki tikslo – ${fmtThousands(left)} žingsnių. ${left < 2500 ? 'Trumpas pasivaikščiojimas – ir būsi!' : 'Gal pasivaikščiojimas vakare?'}` : 'Dienos tikslas pasiektas – puiku!';
  return `${spBack('Žingsniai')}<div class="sp-mins sp5-tabs">${[['day', 'Diena'], ['week', 'Savaitė'], ['month', 'Mėnuo']].map(([v, l]) => `<button class="${tab === v ? 'on' : ''}" data-a="spStepTab" data-v="${v}">${l}</button>`).join('')}</div>
    <div class="sp5-hero c"><div class="sp5-ring big">${spRing(n / g, 190, 11)}<b>${n ? fmtThousands(n) : '–'}<small>iš ${fmtThousands(g)}${n && left ? ` · liko ${fmtThousands(left)}` : ''}</small></b></div>
      <div class="sp5-g3"><div><b>${n ? fmtNum(stepsKm(n)) : '0'}</b><span>km</span></div><div><b>${n ? stepsKcal(n) : 0}</b><span>kcal</span></div><div><b>${activeMinToday()}</b><span>aktyvios min</span></div></div></div>
    ${chart}${bars}<div class="sp-say">${daigelis(4)}<p>${esc(msg)}</p></div>
    <section class="card sp-card"><button class="sp-set" data-a="spStepGoal"><span>Dienos tikslas</span><span class="v">${fmtThousands(g)} ›</span></button><button class="sp-set" data-a="spGo" data-p="conn"><span>Iš kur ateina<small>${esc(srcTxt)}</small></span><span class="v">›</span></button><button class="sp-set" data-a="addStepsManual"><span>Įrašyti rankiniu būdu</span><span class="v">›</span></button></section>`;
}
A.spStepTab = d => { UI.stepTab = d.v; render(); };
A.spStepGoal = async () => { const v = await askText('Dienos žingsnių tikslas', '', String(stepGoal())); if (v == null || !(+v >= 1000) || +v > 50000) return; S.profile.stepGoal = Math.round(+v); commit(); };
// senas žingsnių langas → naujas ekranas; rankinis įrašymas – mažas lapas
A.addSteps = (dd = {}) => { if (dd.d && dd.d !== today()) return A.addStepsManual(dd); spGo('steps'); };
A.addStepsManual = (dd = {}) => {
  const o = UI.stepM && !dd.d ? UI.stepM : (UI.stepM = {date: dd.d || today(), n: stepsOn(dd.d || today()) || 0});
  const y = addDays(today(), -1);
  spSheet(`<h3>Įrašyti žingsnius</h3><div class="sp-mins">${[[today(), 'Šiandien'], [y, 'Vakar']].map(([v, l]) => `<button class="${o.date === v ? 'on' : ''}" data-a="spStepM" data-k="date" data-v="${v}">${l}</button>`).join('')}<label class="${[today(), y].includes(o.date) ? '' : 'on'}">${[today(), y].includes(o.date) ? 'Kita…' : fmtDate(o.date)}<input type="date" max="${today()}" value="${o.date}" onchange="A.spStepM({k:'date',v:this.value})"></label></div>
    <div class="sp-minin"><button data-a="spStepM" data-k="n" data-v="-500">−</button><b><input id="stepIn" type="number" inputmode="numeric" min="0" max="150000" value="${o.n || ''}" placeholder="0" oninput="UI.stepM.n=+this.value||0"> <small>žingsnių</small></b><button data-a="spStepM" data-k="n" data-v="500">+</button></div>
    <button class="btn primary sp-go" data-a="spStepSave">Išsaugoti</button>`);
};
A.spStepM = d => { const o = UI.stepM; if (d.k === 'date') { o.date = d.v; o.n = stepsOn(d.v) || 0; } else o.n = Math.max(0, (o.n || 0) + +d.v); A.addStepsManual(); };
A.spStepSave = () => { const o = UI.stepM, i = $('#stepIn'); if (i) o.n = Math.round(+i.value || 0); if (o.n > 150000) return toast('Per daug žingsnių'); setSteps(o.date, o.n, 'manual', true); UI.stepM = null; A.closeSheet(); commit(); toast(o.n ? `Įrašyta: ${fmtThousands(o.n)} žingsnių` : 'Žingsniai ištrinti', 'good'); };
A.stepsPhone = () => spGo('conn');

// ----- telefonas ir laikrodis -----
const WATCHES = [['garmin', 'Garmin', 'Garmin Connect', 'com.garmin.android.apps.connectmobile', ['Atidaryk Garmin Connect programėlę.', 'Daugiau → Nustatymai → Prijungtos programos → Health Connect.', 'Įjunk žingsnius, treniruotes ir pulsą.', 'Grįžk čia – pirmi duomenys ateis per kelias minutes.'], 'Maršrutų Garmin per Health Connect neperduoda – juos įrašo Life Schedule, kai pradedi ėjimą ar bėgimą čia.'],
  ['samsung', 'Samsung', 'Samsung Health', 'com.sec.android.app.shealth', ['Atidaryk Samsung Health.', '⋮ → Nustatymai → Health Connect.', 'Leisk dalintis žingsniais, treniruotėmis ir pulsu.', 'Grįžk čia.'], ''],
  ['fitbit', 'Fitbit / Pixel', 'Fitbit', 'com.fitbit.FitbitMobile', ['Atidaryk Fitbit programėlę.', 'Tu → Nustatymai → Health Connect.', 'Įjunk sinchronizavimą su Health Connect.', 'Grįžk čia.'], ''],
  ['xiaomi', 'Xiaomi', 'Mi Fitness', 'com.xiaomi.wearable', ['Atidaryk Mi Fitness (arba Zepp Life seniems Mi Band).', 'Profilis → Health Connect.', 'Įjunk duomenų dalinimąsi.', 'Grįžk čia.'], ''],
  ['amazfit', 'Amazfit', 'Zepp', 'com.huami.watch.hmwatchmanager', ['Atidaryk Zepp programėlę.', 'Profilis → Pridėti paskyras → Health Connect.', 'Įjunk duomenų dalinimąsi.', 'Grįžk čia.'], ''],
  ['polar', 'Polar', 'Polar Flow', 'fi.polar.polarflow', ['Atidaryk Polar Flow.', 'Daugiau → Paskyros ir programos → Health Connect.', 'Įjunk duomenų dalinimąsi.', 'Grįžk čia.'], ''],
  ['huawei', 'Huawei', 'Huawei Health', 'com.huawei.health', ['Atidaryk Huawei Health ir paieškok Health Connect nustatymuose.', 'Jei tokio nėra – Huawei duomenų į Health Connect nesiunčia; tada žingsnius skaičiuos telefonas.'], ''],
  ['phone', 'Tik telefonas', 'Google Fit', 'com.google.android.apps.fitness', ['Jei telefonas pats žingsnių nerodo – įdiek Google Fit.', 'Jis skaičiuoja žingsnius telefonu ir perduoda į Health Connect.', 'Grįžk čia.'], '']];
function spConn() {
  const nat = isNative(), s = sportSet(), hc = s.hc || {};
  if (!nat) return `${spBack('Telefonas ir laikrodis')}<div class="sp-say">${daigelis(4)}<p>Žingsniai ir laikrodis jungiasi per programėlę telefone.</p></div>
    <section class="sp-next c"><img class="sp5-appic" src="icon.svg" alt=""><h3>Life Schedule programėlė</h3><div class="meta">Android · 5 MB</div><a class="btn primary sp-go" href="${APK_URL}">Atsisiųsti</a></section>
    <section class="card sp-card"><button class="sp-set" data-a="addStepsManual"><span>Įrašyti žingsnius rankiniu būdu</span><span class="v">›</span></button></section>`;
  return `${spBack('Telefonas ir laikrodis')}<div class="sp-say">${daigelis(4)}<p>Du žingsniai – ir viskas ateis savaime.</p></div>
    <button class="sp5-stp" data-a="${HC.ok ? 'spHcSettings' : 'spHcConnect'}"><span class="n ${HC.ok ? 'd' : ''}">${HC.ok ? ic('check', 'sm') : '1'}</span><span><b>Health Connect</b><small>Leidimai: žingsniai, pulsas, treniruotės</small></span>${HC.ok ? '<span class="ok">Prijungta</span>' : '<span class="btn primary sm">Prijungti</span>'}</button>
    <div class="sp5-stp"><span class="n ${s.watch ? 'd' : ''}">${s.watch ? ic('check', 'sm') : '2'}</span><span><b>Laikrodis ar fitneso programa</b><small>Pasirink, kuo naudojiesi</small></span></div>
    <div class="sp5-brands">${WATCHES.map(([id, n]) => `<button class="${s.watch === id ? 'on' : ''}" data-a="spWatchPick" data-id="${id}">${n}</button>`).join('')}</div>
    <section class="card sp-card">${[['steps', 'Žingsniai'], ['workouts', 'Treniruotės'], ['hr', 'Pulsas'], ['sleep', 'Miegas']].map(([k, l]) => `<button class="sp-set" data-a="spHcT" data-k="${k}"><span>${l}</span><span class="tg ${hc[k] ? '' : 'off'}"></span></button>`).join('')}</section>`;
}
A.spHcConnect = () => hcConnect(); A.spHcSettings = () => window.LSNative?.openHealthConnect?.();
A.spWatchPick = d => {
  S.sportSet = {...sportSet(), watch: d.id}; commit({noRender: true}); render();
  const w = WATCHES.find(x => x[0] === d.id); if (!w) return;
  spSheet(`<h3>${esc(w[1])}</h3><ol class="sp-steps">${w[4].map(t => `<li>${esc(t)}</li>`).join('')}</ol>
    <a class="btn primary sp-go" href="https://play.google.com/store/apps/details?id=${w[3]}">Atidaryti ${esc(w[2])}</a>${w[5] ? `<p class="hint c">${esc(w[5])}</p>` : ''}`);
};
// ėjimo metu – žingsniai pagal nueitą atstumą ir tavo žingsnio ilgį
const walkSteps = r => Math.round((r.dist || 0) / Math.max(0.4, strideM()));
const isWalk = id => ['walk', 'walkf', 'hike', 'nordic', 'dog', 'trail', 'orient'].includes(id);

function vSport() {
  if (typeof EXDB === 'undefined') return empty('Kraunama…');
  UI.sp = UI.sp || {p: 'home'};
  const p = UI.sp.p, page = {lib: spLib, ex: spExPage, mus: spMuscle, hist: spHist, wv: spWorkoutView, act: spActView, review: spReview, sports: spSports, run: spRunPage, set: spSettings, watch: spConn, conn: spConn, steps: spSteps, draft: spDraft, live: spLive, done: spDone}[p];
  if (page) return `<div class="sp sp-sub">${page()}</div>`;
  if (!sportOn() && !S.workouts.length && !(S.settings.intro || {}).sport) return `<div class="sp">${spFirst()}</div>`;
  if (sportOn() && !S.workouts.length && !(S.settings.intro || {}).sportOnb) return `<div class="sp">${spFirst()}</div>`;
  const plan = (S.plans || []).filter(x => x.status === 'planned' && x.date >= today()).sort((a, b) => (a.date + a.start) < (b.date + b.start) ? -1 : 1)[0];
  const head = `<div class="sp-top"><span class="dk"><button class="btn sm" data-a="spGo" data-p="lib">${ic('srch', 'sm')} Pratimai</button><button class="btn sm" data-a="spPlanSheet">${ic('cal', 'sm')} Suplanuoti</button><button class="btn sm" data-a="spLogSheet">${ic('check', 'sm')} Įrašyti atliktą</button></span><span class="ph"><button class="ib" data-a="spGo" data-p="lib" title="Pratimai">${ic('srch')}</button><button class="ib" data-a="spMenu" title="Daugiau">${ic('more')}</button></span></div>`;
  const conn = !HC.ok && !stepsOn(today()) ? connCard() : '';
  const active = S.active ? `<button class="sp-pill" data-a="workoutMode"><span>Treniruotė vyksta · ${esc(exercise(S.active.ex[curEx(S.active)]?.id)?.name || '')}</span><b class="wClock">${clock(S.active.ts)}</b><i>Grįžti</i></button>` : '';
  const run = S.run ? `<button class="sp-pill" data-a="spGo" data-p="run"><span>${esc(sportById(S.run.sport)?.[1] || 'Sportas')} vyksta</span><b class="wClock">${fmtClock(runSec(S.run))}</b><i>Grįžti</i></button>` : '';
  if (!sportOn()) {
    return `<div class="sp">${head}<div class="sp-cols"><div>${active}${run}${stepsHero()}${conn}${startGrid()}
      <div class="sp-acts"><button class="btn big" data-a="spLogSheet">${ic('check', 'sm')} Įrašyti atliktą</button></div>${weekSmall()}</div><div>${recentCard()}
      <div class="quiet"><span class="qi">${ic('wauto')}</span><span>Nori, kad parinkčiau treniruotes?<small>Rekomendacijos išjungtos</small></span>${btn('Įjungti', 'spRecOn', {}, 'sm')}</div></div></div></div>`;
  }
  const sw = swapCandidate();
  const left = `${active}${run}${stepsHero()}${conn}${startGrid()}${plan ? plannedCard(plan) + `<div class="sp-acts"><button class="btn big" data-a="spPlanSheet">${ic('cal', 'sm')} Suplanuoti dar</button><button class="btn big" data-a="spLogSheet">${ic('check', 'sm')} Įrašyti atliktą</button></div>` : suggestCard(todaysSuggestion())}
    ${undoRow()}${sw ? swapNudge(sw) : ''}${weekSmall()}`;
  const right = `${recentCard()}<section class="card sp-card"><h2 class="sp-ct">Raumenys<small>paspausk raumenį ›</small></h2>${bodySvg(muscleHeat())}${bodyLegend}</section>`;
  return `<div class="sp">${head}<div class="sp-cols"><div>${left}</div><div>${right}</div></div></div>`;
}
const spStepsCard = () => { const n = stepsOn(today()); return `<button class="card sp-card sp-stepc" data-a="addSteps"><h2 class="sp-ct">Žingsniai šiandien</h2><div class="sp-g2"><div><b>${n ? fmtThousands(n) : '–'}</b><span>žingsnių</span></div><div><b>${n ? fmtNum(stepsKm(n)) : '–'}</b><span>km</span></div></div></button>`; };
A.spRecOn = () => { S.settings.modes.sport = true; commit(); };

// ----- pirmas kartas -----
function spFirst() {
  const o = UI.spOnb || (UI.spOnb = {place: sportSet().place || 'gym', lvl: sportSet().level || 1, n: +S.profile.workoutsPerWeek || 3});
  const ch = (k, v, l) => `<button class="${o[k] === v ? 'on' : ''}" data-a="spOnb" data-k="${k}" data-v="${v}">${l}</button>`;
  return `<div class="sp-intro">${daigelis(4, 'big')}<h2>Sportas</h2><p>Trys klausimai – ir pirmą treniruotę sudarysiu aš.</p></div>
    <div class="sp-q">Kur dažniausiai sportuosi?</div><div class="sp-where">${[['gym', 'gym', 'Salėje'], ['home', 'shome', 'Namie'], ['both', 'stree', 'Abu']].map(([v, i, l]) => `<button class="${o.place === v ? 'on' : ''}" data-a="spOnb" data-k="place" data-v="${v}"><span class="sp-fi">${ic(i)}</span>${l}</button>`).join('')}</div>
    <div class="sp-q">Kokia patirtis?</div><div class="sp-mins">${ch('lvl', 1, 'Pradedu')}${ch('lvl', 2, 'Šiek tiek')}${ch('lvl', 3, 'Daug')}</div>
    <div class="sp-q">Kiek kartų per savaitę?</div><div class="sp-mins">${[2, 3, 4, 5].map(n => ch('n', n, n === 5 ? '5+' : n)).join('')}</div>
    <button class="btn primary sp-go" data-a="spOnbDone">Pradėti</button><button class="sp-later" data-a="spOnbLog">Tik užsirašinėsiu pats ›</button>`;
}
A.spOnb = d => { UI.spOnb[d.k] = isNaN(+d.v) ? d.v : +d.v; render(); };
A.spOnbDone = () => { const o = UI.spOnb; S.sportSet = {...sportSet(), place: o.place === 'both' ? 'gym' : o.place, level: o.lvl}; S.profile.workoutsPerWeek = o.n; S.settings.modes.sport = true; S.settings.intro = {...S.settings.intro, sportOnb: true, sport: true}; UI.spOnb = null; commit(); };
A.spOnbLog = () => { S.settings.modes.sport = false; S.settings.intro = {...S.settings.intro, sportOnb: true, sport: true}; commit(); };

// ----- nauja treniruotė (lapas) -----
A.spStartSheet = (d = {}) => {
  const o = UI.spNew || (UI.spNew = {place: sportSet().place, focus: 'auto', min: +S.profile.workoutMin || 45, custom: false});
  spSheet(`<h3>Nauja treniruotė</h3>
    <div class="sp-q">Kur?</div><div class="sp-where">${[['gym', 'gym', 'Salėje'], ['home', 'shome', 'Namie'], ['out', 'stree', 'Lauke']].map(([v, i, l]) => `<button class="${o.place === v ? 'on' : ''}" data-a="spNew" data-k="place" data-v="${v}"><span class="sp-fi">${ic(i)}</span>${l}</button>`).join('')}</div>
    <div class="sp-q">Ką treniruojam?</div><div class="sp-chips">${FOCUS.map(([id, l, , i]) => `<button class="${id === 'auto' ? 'br' : ''} ${o.focus === id && id !== 'auto' ? 'on' : ''}" data-a="spNew" data-k="focus" data-v="${id}">${id === 'auto' ? ic(i, 'sm') + ' ' : ''}${l}</button>`).join('')}</div>
    <div class="sp-q">Kiek laiko?</div><div class="sp-mins">${[20, 30, 45, 60].map(m => `<button class="${!o.custom && o.min === m ? 'on' : ''}" data-a="spNew" data-k="min" data-v="${m}">${m}</button>`).join('')}<button class="${o.custom ? 'on' : ''}" data-a="spNew" data-k="custom" data-v="1" aria-label="Savas laikas">${ic('pen', 'sm')}</button></div>
    ${o.custom ? `<div class="sp-minin"><button data-a="spNewMin" data-n="-5">−</button><b>${o.min} <small>min</small></b><button data-a="spNewMin" data-n="5">+</button></div>` : ''}
    <button class="btn primary sp-go" data-a="spBuild">Sudaryti treniruotę ${ic('arrow', 'sm')}</button>`);
};
A.addWorkout = (d = {}) => d.date ? A.spLogSheet(d) : (UI.view !== 'sport' && (UI.view = 'sport', UI.sp = {p: 'home'}, render()), A.spStartSheet());
A.spNew = d => { const o = UI.spNew; if (d.k === 'min') { o.min = +d.v; o.custom = false; } else if (d.k === 'custom') o.custom = true; else o[d.k] = d.v; A.spStartSheet(); };
A.spNewMin = d => { UI.spNew.min = clamp(UI.spNew.min + +d.n, 10, 180); A.spStartSheet(); };
A.spBuild = async () => {
  const o = UI.spNew, f = o.focus === 'auto' ? todaysSuggestion().focus : o.focus, fo = FOCUS.find(x => x[0] === f);
  UI.draft = {type: f, place: o.place, duration: o.min, exercises: buildWorkout(fo[2], o.min, o.place), why: o.focus === 'auto'};
  A.closeSheet(); spGo('draft');
  aiImprove(UI.draft);
};
A.spStartSugg = () => { const sg = todaysSuggestion(); UI.draft = {type: sg.focus, place: sg.place, duration: sg.duration, exercises: sg.exercises.map(x => ({...x})), why: true}; spGo('draft'); };
A.spKita = () => {
  const sg = todaysSuggestion(), last = muscleLastTrained(), t = today();
  const opts = [[sg.focus, sg.title, `${PLACE_LT[sg.place]} · ${sg.duration} min · siūlau`, FOCUS.find(f => f[0] === sg.focus)?.[3]], ...FOCUS.filter(f => f[2] && f[0] !== sg.focus && f[0] !== 'tempimas').map(f => ({f, d: Math.min(...f[2].map(g => last[g] ? diffDays(last[g], t) : 99))})).sort((a, b) => b.d - a.d).slice(0, 2).map(({f}) => [f[0], FOCUS_TITLE[f[0]] || f[1], `${PLACE_LT[sportSet().place]} · 30 min`, f[3]]), ['run', 'Bėgimas', '30 min · su žemėlapiu', 'srun'], ['tempimas', 'Tempimas ir mankšta', 'Namie · 15 min · poilsio dienai', 'wsmall']];
  spSheet(`<h3>Ką dar galima šiandien?</h3>${opts.map(([id, l, s, i], k) => `<button class="sp-opt ${k ? '' : 'on'}" data-a="spKitaPick" data-v="${id}"><span class="sp-fi">${ic(i || 'gym')}</span><span><b>${esc(l)}</b><small>${s}</small></span></button>`).join('')}
    <button class="btn sp-go" data-a="spStartSheet">Susidaryti pačiam</button>`);
};
A.spKitaPick = d => { if (sportById(d.v)) return A.spSport({id: d.v}); const place = d.v === 'tempimas' ? 'home' : sportSet().place, min = d.v === 'tempimas' ? 15 : d.v === todaysSuggestion().focus ? todaysSuggestion().duration : 30, fo = FOCUS.find(x => x[0] === d.v); UI.draft = {type: d.v, place, duration: min, exercises: buildWorkout(fo[2], min, place), why: true}; A.closeSheet(); spGo('draft'); };

// ----- sudaryta treniruotė (planas prieš pradedant) -----
function spDraft() {
  const D = UI.draft; if (!D) return spHome();
  const kcal = Math.round(5 * (currentWeight() || 75) * D.duration / 60);
  const why = D.why ? (() => { const sg = todaysSuggestion(); return sg.why.g ? `Parinkau, nes ${sg.why.g} nedarei ${sg.why.d} d. ` : 'Parinkau pagal tai, ką seniai darei. '; })() : '';
  return `${spBack(esc(wtypeName(D.type)))}
    <div class="sp-chips static"><span>${ic(D.place === 'home' ? 'shome' : D.place === 'out' ? 'stree' : 'gym', 'sm')} ${PLACE_LT[D.place]}</span><span>${ic('clock', 'sm')} ~${D.duration} min</span><span>${ic('wfire', 'sm')} ~${kcal} kcal</span>${D.date ? `<span>${ic('cal', 'sm')} ${cap(relDay(D.date))} ${D.start}</span>` : ''}</div>
    ${D.exercises.map((x, i) => { const e = exercise(x.id); if (!e) return ''; const lp = lastPerf(e.id);
      return `<div class="sp-ex2">${exPh(e.id)}<button class="tx" data-a="spGo" data-p="ex" data-id="${e.id}"><b>${esc(e.name)}</b><small>${x.sets.length} × ${x.sets[0]}${e.sec ? ' s' : ''}${x.kg ? ` · ${fmtKg(x.kg)} kg` : ''}</small>${!lp ? '<span class="tag">naujas tau</span>' : ''}</button>
        <button class="sw" data-a="spSwapSheet" data-i="${i}" aria-label="Keisti pratimą">${ic('swap', 'sm')}</button></div>`; }).join('') || empty('Pratimų nėra')}
    <div class="sp-acts q"><button class="btn ghost sm" data-a="spAddEx">${ic('plus', 'sm')} Pridėti pratimą</button></div>
    ${D.why || D.ai ? `<div class="sp-why">${ic('bulb', 'sm')}<span>${D.ai ? esc(D.ai) + ' ' : why}Svoriai – pagal tavo paskutinius kartus. Nepatinka pratimas? Paspausk ${ic('swap', 'sm')} – rasiu kitą tiems patiems raumenims.</span></div>` : ''}
    <div class="sp-acts">${D.planEdit ? `<button class="btn primary big" data-a="spDraftSave">Išsaugoti</button>` : `<button class="btn primary big" data-a="spDraftStart">${ic('play', 'sm')} Pradėti</button>`}</div>`;
}
const spHome = () => { UI.sp = {p: 'home'}; return vSport(); };
A.spSwapSheet = d => {
  const D = UI.draft || {}, x = (D.exercises || [])[+d.i], e = x && exercise(x.id); if (!e) return;
  const alts = allExercises().filter(o => o.id !== e.id && (e.cat === 'stretching' ? o.cat === 'stretching' : BUILD_CATS.includes(o.cat)) && o.pg[0] === e.pg[0] && placeOk(o, D.place || sportSet().place) && !D.exercises.some(y => y.id === o.id) && !swappedOut().has(o.id))
    .sort((a, b) => (b.common - a.common) || (Math.abs(a.lvl - (sportSet().level || 1)) - Math.abs(b.lvl - (sportSet().level || 1))) || (b.comp - a.comp));
  UI.swapMore = UI.swapMore === +d.i ? UI.swapMore : null;
  const list = alts.slice(0, UI.swapMore === +d.i ? 12 : 3);
  spSheet(`<h3>Vietoj „${esc(e.name)}“</h3><p class="hint">Tie patys raumenys · ${PLACE_LT[D.place || sportSet().place].toLowerCase()} · tavo lygiui</p>
    ${list.map(o => `<button class="sp-ex2 btnrow" data-a="spSwapPick" data-i="${d.i}" data-id="${o.id}">${exPh(o.id)}<span class="tx"><b>${esc(o.name)}</b><small>${EQ_LT[o.eq] || o.eq} · ${LVL_LT[o.lvl]}</small></span><span class="sw">${ic('arrow', 'sm')}</span></button>`).join('') || empty('Kitų variantų nėra')}
    ${alts.length > 3 && UI.swapMore !== +d.i ? `<div class="sp-acts q"><button class="btn ghost sm" data-a="spSwapMore" data-i="${d.i}">Kiti variantai ›</button></div>` : ''}`);
};
A.spSwapMore = d => { UI.swapMore = +d.i; A.spSwapSheet(d); };
A.spSwapPick = d => { const e = exercise(d.id); UI.draft.exercises[+d.i] = {id: e.id, sets: targetSets(e), kg: targetKg(e)}; A.closeSheet(); render(); };
A.spAddEx = () => { UI.exPickFor = 'draft'; spGo('lib', {back: 'draft'}); };
A.spDraftStart = async () => {
  const D = UI.draft; if (!D || !D.exercises.length) return toast('Pridėk bent vieną pratimą');
  if (S.active && !await ask('Pradėti naują treniruotę?', 'Jau vyksta kita treniruotė – ji bus nutraukta.', {yes: 'Pradėti naują'})) return;
  S.active = {planId: D.planId || null, type: D.type, place: D.place, date: today(), start: nowHM(), ts: Date.now(), ex: D.exercises.map(x => ({id: x.id, reps: [...x.sets], kg: (x.sets || []).map(() => x.kg ?? null), done: x.sets.map(() => false), feel: null}))};
  UI.draft = null; REST_UNTIL = 0; commit({noRender: true}); spGo('live');
};
A.spDraftSave = () => { const D = UI.draft, p = S.plans.find(x => x.id === D.planId); if (p) { p.exercises = D.exercises.map(x => ({id: x.id, sets: x.sets, kg: x.kg})); p.type = D.type; p.place = D.place; p.duration = D.duration; } UI.draft = null; commit({noRender: true}); toast('Išsaugota'); spGo('home'); };
// Claude pagerina pasirinkimą (tik iš esamų pratimų bazės) – jei serveris nepasiekiamas, lieka vietinis pasirinkimas
async function aiImprove(D) {
  if (!cloudOn() || !sportOn()) return;
  const fo = FOCUS.find(x => x[0] === D.type), groups = fo?.[2] || [];
  const cand = allExercises().filter(e => (groups[0] === 'tempimas' ? e.cat === 'stretching' : BUILD_CATS.includes(e.cat) && e.g.some(g => groups.includes(g))) && placeOk(e, D.place) && !swappedOut().has(e.id) && e.lvl <= (sportSet().level || 1) + 1).slice(0, 160);
  const hist = [...S.workouts].sort((a, b) => a.date < b.date ? 1 : -1).slice(0, 8).map(w => ({date: w.date, ex: (w.exercises || []).map(x => ({id: exId(x.id), sets: x.sets, kg: x.kg, feel: x.feel}))}));
  const r = await DB.fn('workout_build', {focus: FOCUS_TITLE[D.type] || D.type, minutes: D.duration, place: D.place, level: sportSet().level || 1, candidates: cand.map(e => [e.id, e.en, EQ_LT[e.eq], e.lvl, e.pg.join(',')]), history: hist, prefs: S.sportPrefs || {}}).catch(() => null);
  if (!r || !r.ok || !Array.isArray(r.exercises) || UI.draft !== D) return;
  const ok = r.exercises.filter(x => exercise(x.id) && cand.some(c => c.id === x.id)).map(x => ({id: x.id, sets: Array(clamp(+x.sets || 3, 1, 6)).fill(clamp(+x.reps || 10, 1, 120)), kg: x.kg ? round(+x.kg, 1) : targetKg(exercise(x.id))}));
  if (ok.length >= 2) { D.exercises = ok; D.ai = r.note ? String(r.note).slice(0, 160) : ''; if (UI.view === 'sport' && UI.sp?.p === 'draft') render(); }
}

// ----- treniruotė vyksta -----
let REST_UNTIL = 0, REST_TOTAL = 90;
const curEx = a => { const i = a.ex.findIndex(x => x.done.some(v => !v)); return i < 0 ? a.ex.length - 1 : (a.cur != null && a.ex[a.cur]?.done.some(v => !v) ? a.cur : i); };
function ytPlayer(id, cls = '') {
  const v = UI.ytOn === exId(id) && UI.ytVid;
  if (v) return `<div class="sp-player ${cls} on"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}?autoplay=1&playsinline=1&rel=0" title="${esc(v.t || '')}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`;
  return `<button class="sp-player ${cls}" data-a="spYt" data-id="${exId(id)}" style="background-image:url('${exImg(id, 1)}')" aria-label="Rodyti video"><span class="pl">${ic('play')}</span>${(S.ytCache || {})[exId(id)]?.[0]?.d ? `<span class="dur">${S.ytCache[exId(id)][0].d}</span>` : ''}</button>`;
}
async function ytFind(id) {
  const k = exId(id); S.ytCache = S.ytCache || {};
  if (S.ytCache[k]?.length) return S.ytCache[k];
  const e = exercise(k), r = await DB.fn('yt_search', {q: `${e.en} exercise technique`, id: k}).catch(() => null);
  if (!r || !r.ok || !r.videos?.length) return null;
  S.ytCache[k] = r.videos.slice(0, 4); commit({noRender: true}); return S.ytCache[k];
}
A.spYt = async d => {
  if (!cloudOn()) return toast('Video veikia prisijungus');
  const vs = await ytFind(d.id); if (!vs) return toast('Video nepavyko rasti');
  UI.ytOn = d.id; UI.ytVid = {id: vs[0].id, t: vs[0].t}; render();
};
function spLive() {
  const a = S.active; if (!a) return spHome();
  if (REST_UNTIL > Date.now()) return spRest(a);
  const i = curEx(a), x = a.ex[i], e = exercise(x.id) || {name: '?', g: [], pg: []}, doneN = a.ex.filter(y => y.done.every(Boolean)).length;
  const nextSet = x.done.findIndex(v => !v), step = /barbell|machine|cable/.test(e.eq) ? 2.5 : 1, kg = x.kg?.[nextSet < 0 ? 0 : nextSet];
  return `<div class="sp-live"><div class="sp-lbar"><button class="sp-back" data-a="wFinishAsk" aria-label="Baigti">${ic('x')}</button><b class="wClock">${clock(a.ts)}</b><small>${i + 1} iš ${a.ex.length} pratimų</small></div>
    <div class="sp-prog">${a.ex.map((y, k) => `<i class="${y.done.every(Boolean) ? 'd' : k === i ? 'c' : ''}"></i>`).join('')}</div>
    <div class="sp-lcols"><div>${ytPlayer(x.id, 'main')}<h3>${esc(e.name)}</h3><div class="sp-mus">${e.g.map(g => G_SHORT[g]).filter(Boolean).join(' · ')}</div></div>
    <div><div class="sp-sets">${x.reps.map((r, j) => `<button class="${x.done[j] ? 'd' : j === nextSet ? 'c' : ''}" data-a="wSet" data-i="${i}" data-j="${j}"><b>${r}${e.sec ? ' s' : ''}</b><small>${j + 1} serija${x.done[j] ? ' ✓' : ''}</small></button>`).join('')}</div>
    ${e.eq !== 'body only' || kg ? `<div class="sp-kg"><button data-a="wKg" data-i="${i}" data-n="${-step}">−</button><b>${kg != null ? fmtKg(kg) : '–'} <small>kg</small></b><button data-a="wKg" data-i="${i}" data-n="${step}">+</button></div>` : `<div class="sp-kg"><button data-a="wAdj" data-i="${i}" data-n="${e.sec ? -5 : -1}">−</button><b>${x.reps[Math.max(0, nextSet)]} <small>${e.sec ? 's' : 'kart.'}</small></b><button data-a="wAdj" data-i="${i}" data-n="${e.sec ? 5 : 1}">+</button></div>`}
    <div class="sp-feel">${[['easy', 'Per lengva'], ['ok', 'Tinka'], ['hard', 'Per sunku']].map(([v, l]) => `<button class="${(x.feel || 'ok') === v ? 'on' : ''}" data-a="wFeel" data-i="${i}" data-v="${v}">${l}</button>`).join('')}</div>
    <button class="btn primary sp-go" data-a="wNext" data-i="${i}">${ic('check', 'sm')} Serija atlikta</button>
    <button class="sp-link" data-a="spHow" data-id="${x.id}"><span>Kaip daryti?</span>${ic('arrow', 'sm')}</button></div></div></div>`;
}
function spRest(a) {
  const left = Math.max(0, Math.ceil((REST_UNTIL - Date.now()) / 1000)), i = curEx(a), x = a.ex[i], e = exercise(x.id), setN = x.done.filter(Boolean).length;
  const nx = x.done.every(Boolean) ? a.ex[i + 1] : null, ne = nx ? exercise(nx.id) : e, nxt = nx || x;
  return `<div class="sp-rest"><div class="sp-q">Poilsis</div><div class="sp-bring big" id="restRing">${spRing(left / REST_TOTAL, 200, 7)}<b id="restClock">${fmtClock(left)}</b></div>
    <div class="sp-chips c"><button data-a="wRest" data-n="-15">−15 s</button><button data-a="wRest" data-n="15">+15 s</button><button class="br" data-a="wRest" data-n="0">Praleisti</button></div>
    <h3>Puiku – ${setN} serija!</h3><p>${nx ? 'Einam prie kito pratimo' : x.done.filter(v => !v).length === 1 ? 'Paskutinė serija – ir einam toliau' : `Liko ${x.done.filter(v => !v).length} serijos`}</p>
    <div class="sp-nextex">${exPh(nxt.id)}<span><small>Toliau</small><b>${esc(ne?.name || '')}</b><small>${nxt.reps.length} × ${nxt.reps[0]}${nxt.kg?.[0] ? ` · ${fmtKg(nxt.kg[0])} kg` : ''}</small></span></div></div>`;
}
function tickRest() {
  const a = S?.active; if (!a || UI.view !== 'sport' || UI.sp?.p !== 'live' || !REST_UNTIL) return;
  const left = Math.ceil((REST_UNTIL - Date.now()) / 1000), el = $('#restClock');
  if (left <= 0) { REST_UNTIL = 0; try { navigator.vibrate?.(300); } catch (e) {} render(); return; }
  if (el) { el.textContent = fmtClock(left); const r = $('#restRing'); if (r) r.innerHTML = spRing(left / REST_TOTAL, 200, 7) + `<b id="restClock">${fmtClock(left)}</b>`; }
}
A.workoutMode = () => spGo('live');
A.wNext = d => { const x = S.active.ex[+d.i], j = x.done.findIndex(v => !v); if (j >= 0) A.wSet({i: d.i, j}); };
A.wSet = d => {
  const a = S.active, x = a.ex[+d.i]; x.done[+d.j] = !x.done[+d.j]; a.cur = +d.i;
  if (x.done[+d.j]) { const last = a.ex.every(y => y.done.every(Boolean)); if (last) { commit({noRender: true}); return A.wFinish(); } REST_TOTAL = sportSet().rest || 90; REST_UNTIL = Date.now() + REST_TOTAL * 1000; if (x.done.every(Boolean)) a.cur = null; }
  commit({noRender: true}); render();
};
A.wRest = d => { if (+d.n === 0) REST_UNTIL = 0; else { REST_UNTIL += +d.n * 1000; REST_TOTAL = Math.max(REST_TOTAL, Math.ceil((REST_UNTIL - Date.now()) / 1000)); } render(); };
A.wKg = d => { const x = S.active.ex[+d.i]; x.kg = x.kg.map((k, j) => x.done[j] ? k : Math.max(0, round((+k || 0) + +d.n, 1))); commit({noRender: true}); render(); };
A.wAdj = d => { const x = S.active.ex[+d.i]; x.reps = x.reps.map((r, j) => x.done[j] ? r : Math.max(1, r + +d.n)); commit({noRender: true}); render(); };
A.wFeel = d => { S.active.ex[+d.i].feel = d.v; commit({noRender: true}); render(); };
A.wFinishAsk = async () => {
  const a = S.active, any = a.ex.some(x => x.done.some(Boolean));
  const r = await ask('Baigti treniruotę?', any ? 'Padarytos serijos bus išsaugotos.' : 'Dar nepadarei nė vienos serijos.', {yes: any ? 'Baigti' : 'Atšaukti treniruotę', no: 'Tęsti', danger: !any});
  if (!r) return; if (any) A.wFinish(); else { S.active = null; REST_UNTIL = 0; commit({noRender: true}); spGo('home'); }
};
A.wCancel = A.wFinishAsk;
A.wFinish = () => {
  const a = S.active; if (!a) return;
  const exercises = a.ex.map(x => ({id: x.id, sets: x.reps.filter((_, j) => x.done[j]), kg: x.kg.filter((_, j) => x.done[j]).map(k => k == null ? null : +k), feel: x.feel || 'ok'})).filter(x => x.sets.length);
  const duration = Math.max(1, Math.round((Date.now() - a.ts) / 60000)), prs = [];
  for (const x of exercises) { const lp = lastPerf(x.id), mk = Math.max(0, ...x.kg.map(Number)); if (mk && lp && lp.maxKg > 0 && mk > lp.maxKg) prs.push({id: x.id, kg: mk, was: lp.maxKg}); }
  const w = {id: uid(), date: a.date, start: a.start, duration, exercises, type: a.type, place: a.place, feel: 'ok', prs};
  S.workouts.push(w); const p = S.plans.find(x => x.id === a.planId); if (p) p.status = 'done';
  S.active = null; REST_UNTIL = 0; commit({noRender: true}); spGo('done', {id: w.id});
};
function spDone() {
  const w = S.workouts.find(x => x.id === UI.sp.id); if (!w) return spHome();
  const heat = {}; for (const x of w.exercises || []) { const e = exercise(x.id); if (e) e.g.forEach((g, k) => heat[g] = Math.max(heat[g] || 0, e.pg.includes(g) ? 3 : 2)); }
  const pr = (w.prs || [])[0], pe = pr && exercise(pr.id);
  return `<div class="sp-fin">${tapDaigelis('spNoop')}<div class="sp-bub">${esc(spMsg('done'))}</div><h2>Treniruotė baigta</h2>
    <div class="sp-sum3"><div><b>${w.duration}</b><span>min</span></div><div><b>${fmtThousands(workoutKcal(w))}</b><span>kcal</span></div><div><b>${fmtThousands(workoutKg(w))}</b><span>kg pakelta</span></div></div>
    ${pe ? `<div class="sp-pr"><span class="sp-fi br">${ic('spark')}</span><span>Rekordas: ${esc(pe.name.toLowerCase())} ${fmtKg(pr.kg)} kg<small>anksčiau ${fmtKg(pr.was)} kg</small></span></div>` : ''}
    <section class="card sp-card"><h2 class="sp-ct">Šiandien dirbo<small>+25 XP</small></h2>${bodySvg(heat, '', false)}</section>
    <div class="sp-q">Kaip jauteisi?</div><div class="sp-feel">${[['hard', 'Sunku'], ['ok', 'Gerai'], ['easy', 'Per lengva']].map(([v, l]) => `<button class="${w.feel === v ? 'on' : ''}" data-a="spDoneFeel" data-v="${v}">${l}</button>`).join('')}</div>
    <button class="btn primary sp-go" data-a="spGo" data-p="home">Išsaugoti</button></div>`;
}
A.spNoop = () => {};
A.spDoneFeel = d => { const w = S.workouts.find(x => x.id === UI.sp.id); if (w) { w.feel = d.v; commit({noRender: true}); render(); } };

// ----- Kaip daryti + patarimų video -----
async function exHow(id) {
  const k = exId(id), key = 'ls_exhow_' + k; let c = null; try { c = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) {}
  if (c) return c;
  const j = await fetch(`${EX_SRC}${encodeURIComponent(k)}.json`).then(r => r.ok ? r.json() : null).catch(() => null); if (!j) return null;
  let steps = j.instructions || [], lt = false;
  if (cloudOn() && steps.length) { const t = await DB.fn('translate', {texts: steps, target: 'LT'}).catch(() => null); if (t && t.ok && Array.isArray(t.texts) && t.texts.length === steps.length) { steps = t.texts; lt = true; } }
  c = {steps, lt}; if (lt) try { localStorage.setItem(key, JSON.stringify(c)); } catch (e) {}
  return c;
}
A.spHow = async d => {
  const e = exercise(d.id); spSheet(`<h3>Kaip daryti: ${esc(e.name.toLowerCase())}</h3><p class="hint">Kraunama…</p>`);
  const h = await exHow(d.id);
  spSheet(`<h3>Kaip daryti: ${esc(e.name.toLowerCase())}</h3>${h ? `<ol class="sp-steps">${h.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>` : '<p class="hint">Aprašymo nepavyko atsisiųsti.</p>'}
    <button class="sp-link card" data-a="spTips" data-id="${e.id}">${ic('vid', 'sm')}<span>Patarimai</span>${ic('arrow', 'sm')}</button>`);
};
A.spTips = async d => {
  const e = exercise(d.id); if (!cloudOn()) return toast('Video veikia prisijungus');
  spSheet(`<h3>Patarimai: ${esc(e.name.toLowerCase())}</h3><p class="hint">Ieškau video…</p>`);
  const vs = await ytFind(d.id); if (!vs) return spSheet(`<h3>Patarimai: ${esc(e.name.toLowerCase())}</h3><p class="hint">Video nepavyko rasti.</p>`);
  UI.tipV = UI.tipFor === d.id ? UI.tipV : 0; UI.tipFor = d.id; tipsSheet();
};
function tipsSheet() {
  const vs = S.ytCache[UI.tipFor] || [], e = exercise(UI.tipFor), v = vs[UI.tipV] || vs[0];
  spSheet(`<h3>Patarimai: ${esc(e.name.toLowerCase())}</h3>
    <div class="sp-vbox"><div class="sp-player on"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}?playsinline=1&rel=0" title="${esc(v.t || '')}" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe></div><b class="vt">${esc(v.t || '')}</b></div>
    ${vs.length > 1 ? `<div class="sp-grp">Kiti video</div>${vs.map((x, k) => k === UI.tipV ? '' : `<button class="sp-vli" data-a="spTipPick" data-k="${k}"><span class="th" style="background-image:url('https://i.ytimg.com/vi/${encodeURIComponent(x.id)}/mqdefault.jpg')"></span><span><b>${esc(x.t || '')}</b><small>${x.d || ''}</small></span></button>`).join('')}` : ''}`, 'tall');
}
A.spTipPick = d => { const box = $('.sp-vbox'); if (box) box.style.opacity = 0; setTimeout(() => { UI.tipV = +d.k; tipsSheet(); }, 200); };

// ----- pratimai: biblioteka, kortelė, raumuo -----
function spLib() {
  const L = UI.lib || (UI.lib = {q: '', g: '', place: '', n: 40});
  const q = L.q.toLowerCase(), gs = [['', 'Visi'], ['ket', 'Kojos'], ['nug', 'Nugara'], ['kru', 'Krūtinė'], ['pec', 'Pečiai'], ['bic', 'Rankos'], ['dil', 'Dilbiai'], ['pre', 'Pilvas'], ['kak', 'Kaklas']];
  const legs = ['ket', 'sed', 'uzp', 'bla', 'pri'], arms = ['bic', 'tri'];
  let list = allExercises().filter(e => (!q || e.name.toLowerCase().includes(q) || e.en.toLowerCase().includes(q)) && (!L.g || (L.g === 'ket' ? e.pg.some(g => legs.includes(g)) : L.g === 'bic' ? e.pg.some(g => arms.includes(g)) : L.g === 'nug' ? e.pg.some(g => ['nug', 'apn', 'tra'].includes(g)) : e.pg.includes(L.g)))
    && (!L.place || (L.place === 'beg' ? e.lvl === 1 : L.place === 'str' ? e.cat === 'stretching' : placeOk(e, L.place))));
  list.sort((a, b) => (b.common - a.common) || (a.lvl - b.lvl) || (a.name < b.name ? -1 : 1));
  return `${UI.sp.back ? spBack('Pridėti pratimą') : `${spBack('Pratimai')}`}<div class="sp-count">${allExercises().length}</div>
    <form class="sp-search" data-f="spLibQ"><input name="q" value="${esc(L.q)}" placeholder="Ieškoti pratimo…" autocomplete="off" oninput="clearTimeout(window._lq);window._lq=setTimeout(()=>A.spLibQ(this.form),250)"></form>
    <div class="sp-chips scroll">${gs.map(([g, l]) => `<button class="${L.g === g ? 'on' : ''}" data-a="spLibF" data-k="g" data-v="${g}">${l}</button>`).join('')}</div>
    <div class="sp-chips scroll">${[['', 'Visur'], ['home', 'Namie'], ['gym', 'Salėje'], ['beg', 'Pradedančiajam'], ['str', 'Tempimas']].map(([v, l]) => `<button class="${L.place === v ? 'on' : ''}" data-a="spLibF" data-k="place" data-v="${v}">${l}</button>`).join('')}</div>
    ${list.slice(0, L.n).map(e => `<div class="sp-ex2">${exPh(e.id)}<button class="tx" data-a="spGo" data-p="ex" data-id="${e.id}"><b>${esc(e.name)}</b><small>${e.pg.map(g => G_SHORT[g]).join(', ').toLowerCase()} · ${EQ_LT[e.eq]} · ${LVL_LT[e.lvl]}</small></button>${UI.exPickFor ? `<button class="sw" data-a="spPickEx" data-id="${e.id}" aria-label="Pridėti">${ic('plus', 'sm')}</button>` : `<button class="sw" data-a="spGo" data-p="ex" data-id="${e.id}" aria-label="Atidaryti">${ic('arrow', 'sm')}</button>`}</div>`).join('') || empty('Nieko nerasta')}
    ${list.length > L.n ? `<div class="sp-acts q"><button class="btn ghost sm" data-a="spLibMore">Rodyti daugiau (${list.length - L.n})</button></div>` : ''}`;
}
A.spLibQ = f => { UI.lib.q = f.q.value; UI.lib.n = 40; const pos = f.q.selectionStart; render(); const i = $('.sp-search input'); if (i) { i.focus(); try { i.setSelectionRange(pos, pos); } catch (e) {} } };
A.spLibF = d => { UI.lib[d.k] = d.v; UI.lib.n = 40; render(); };
A.spLibMore = () => { UI.lib.n += 40; render(); };
A.spPickEx = d => {
  const e = exercise(d.id); if (UI.exPickFor === 'draft' && UI.draft) { UI.draft.exercises.push({id: e.id, sets: targetSets(e), kg: targetKg(e)}); UI.exPickFor = null; return spGo('draft'); }
  if (UI.exPickFor === 'log' && UI.logF) { UI.logF.ex.push({id: e.id, sets: '', kg: ''}); UI.exPickFor = null; spGo('home'); return A.spLogSheet(); }
  S.nextAdd = [...new Set([...(S.nextAdd || []), e.id])]; commit({noRender: true}); toast('Įdėsiu į kitą treniruotę');
};
function spExPage() {
  const e = exercise(UI.sp.id); if (!e) return spHome();
  const hist = S.workouts.filter(w => (w.exercises || []).some(x => exId(x.id) === e.id)).sort((a, b) => a.date < b.date ? -1 : 1).slice(-8);
  const pts = hist.map(w => { const x = w.exercises.find(y => exId(y.id) === e.id); return Math.max(0, ...(x.kg || []).map(Number)) || Math.max(...x.sets); });
  const lp = lastPerf(e.id), mx = Math.max(1, ...pts), useKg = lp && lp.maxKg;
  const sw = (S.exSwaps || []).filter(s => s.from === e.id && !s.undone).pop(), swTo = sw && exercise(sw.to);
  return `${spBack(esc(e.name))}${ytPlayer(e.id, 'main')}
    <div class="sp-chips static">${e.pg.map(g => `<span>${G_SHORT[g]}</span>`).join('')}${e.g.filter(g => !e.pg.includes(g)).slice(0, 2).map(g => `<span>${G_SHORT[g]}</span>`).join('')}<span>${cap(EQ_LT[e.eq])}</span><span>${cap(LVL_LT[e.lvl])}</span></div>
    ${pts.length ? `<section class="card sp-card"><h2 class="sp-ct">${useKg ? 'Tavo svoris' : 'Tavo pakartojimai'}<small>rekordas ${useKg ? fmtKg(mx) + ' kg' : mx}</small></h2><div class="sp-hist">${pts.map(v => `<i style="height:${Math.max(8, v / mx * 100)}%"></i>`).join('')}</div><p class="hint">Paskutinį kartą: ${lp.sets.length} × ${lp.sets[0]}${lp.maxKg ? ` · ${fmtKg(lp.maxKg)} kg` : ''} · ${relDay(lp.date)}</p></section>` : ''}
    <button class="sp-link card" data-a="spHow" data-id="${e.id}"><span>Kaip daryti?</span>${ic('arrow', 'sm')}</button>
    <div class="sp-acts"><button class="btn primary big" data-a="spPickEx" data-id="${e.id}">${ic('plus', 'sm')} Į kitą treniruotę</button></div>
    ${swTo ? `<div class="sp-undo"><span>Pakeista į ${esc(swTo.name)}</span><button data-a="spSwapUndo" data-f="${e.id}">Grąžinti</button></div>` : ''}`;
}
function spMuscle() {
  const g = UI.sp.g, M = UI.mus || (UI.mus = {f: sportSet().place === 'gym' ? 'gym' : 'home'}), last = muscleLastTrained()[g];
  const list = allExercises().filter(e => e.pg.includes(g) && BUILD_CATS.includes(e.cat) && (M.f === 'beg' ? e.lvl === 1 : M.f === 'db' ? e.eq === 'dumbbell' : placeOk(e, M.f))).sort((a, b) => (b.common - a.common) || (a.lvl - b.lvl)).slice(0, 8);
  return `${spBack(MUS_PAGE[g] || MUSCLES[g] || G_SHORT[g])}<section class="card sp-card">${bodySvg({}, g, false)}</section>
    <div class="sp-chips scroll">${[['home', 'Namie'], ['gym', 'Salėje'], ['beg', 'Pradedančiajam'], ['db', 'Su hanteliais']].map(([v, l]) => `<button class="${M.f === v ? 'on' : ''}" data-a="spMusF" data-v="${v}">${l}</button>`).join('')}</div>
    ${list.map(e => `<div class="sp-ex2">${exPh(e.id)}<button class="tx" data-a="spGo" data-p="ex" data-id="${e.id}"><b>${esc(e.name)}</b><small>${EQ_LT[e.eq]} · ${LVL_LT[e.lvl]}</small></button><button class="sw" data-a="spPickEx" data-id="${e.id}" aria-label="Į kitą treniruotę">${ic('plus', 'sm')}</button></div>`).join('') || empty('Pratimų nerasta')}
    <p class="hint">${last ? `Seniai darei: ${diffDays(last, today())} d. · ` : ''}Paspausk ＋ – pridėsiu į kitą treniruotę.</p>`;
}
A.spMusF = d => { UI.mus.f = d.v; render(); };

// ----- istorija, treniruotės peržiūra, veiklos peržiūra -----
function spHist() {
  const f = UI.histF || 'all', t = today(), wk = Array.from({length: 6}, (_, i) => addDays(weekStart(t), -35 + i * 7));
  const mins = wk.map(w => sum(S.workouts.filter(x => x.date >= w && x.date <= addDays(w, 6)).map(x => +x.duration || 0))), mx = Math.max(1, ...mins), goal = (+S.profile.workoutsPerWeek || 3) * (+S.profile.workoutMin || 45);
  const list = [...S.workouts].filter(w => f === 'all' || (f === 'str' ? isStrength(w) : f === 'gps' ? !!w.route : w.source === 'hc')).sort((a, b) => (b.date + (b.start || '')) > (a.date + (a.start || '')) ? 1 : -1);
  const groups = {}; for (const w of list) (groups[weekStart(w.date)] = groups[weekStart(w.date)] || []).push(w);
  return `${spBack('Visos treniruotės')}<div class="sp-top abs"><button class="lnk" data-a="spGo" data-p="review">Apžvalga ›</button></div>
    <section class="card sp-card"><h2 class="sp-ct">Minutės per savaitę<small>tikslas ${goal}</small></h2><div class="sp-hist">${mins.map(v => `<i style="height:${Math.max(4, v / mx * 100)}%"></i>`).join('')}</div></section>
    <div class="sp-chips scroll">${[['all', 'Visos'], ['str', 'Jėga'], ['gps', 'Su žemėlapiu'], ['hc', 'Iš laikrodžio']].map(([v, l]) => `<button class="${f === v ? 'on' : ''}" data-a="spHistF" data-v="${v}">${l}</button>`).join('')}</div>
    ${Object.keys(groups).map(w => { const ws = groups[w]; return `<div class="sp-wk"><span>${w === weekStart(t) ? 'Ši savaitė' : `${fmtDate(w)} – ${fmtDate(addDays(w, 6))}`}</span><em>${ws.length} · ${sum(ws.map(x => +x.duration || 0))} min · ${fmtThousands(sum(ws.map(workoutKcal)))} kcal</em></div><section class="card sp-card">${ws.map(x => workoutRow(x)).join('')}</section>`; }).join('') || empty('Treniruočių dar nėra')}`;
}
A.spHistF = d => { UI.histF = d.v; render(); };
A.viewWorkout = d => spGo('wv', {id: d.id});
function spWorkoutView() {
  const w = S.workouts.find(x => x.id === UI.sp.id); if (!w) return spHome();
  if (!isStrength(w)) return spActView();
  const heat = {}; for (const x of w.exercises || []) { const e = exercise(x.id); if (e) e.g.forEach(g => heat[g] = Math.max(heat[g] || 0, e.pg.includes(g) ? 3 : 2)); }
  return `${spBack(esc(wtypeName(w.type)))}
    <div class="sp-sum3"><div><b>${w.duration}</b><span>min</span></div><div><b>${fmtThousands(workoutKcal(w))}</b><span>kcal</span></div><div><b>${fmtThousands(workoutKg(w))}</b><span>kg pakelta</span></div></div>
    ${(w.exercises || []).map((x, i) => { const e = exercise(x.id); if (!e) return ''; return `<div class="sp-ex2">${exPh(e.id)}<button class="tx" data-a="spGo" data-p="ex" data-id="${e.id}"><b>${esc(e.name)}</b><small>${(x.sets || []).join(' · ')}${e.sec ? ' s' : ''}${(x.kg || []).some(Boolean) ? ` × ${fmtKg(Math.max(...x.kg.map(Number)))} kg` : ''}</small></button><button class="sw" data-a="spExEdit" data-w="${w.id}" data-i="${i}" aria-label="Taisyti">${ic('pen', 'sm')}</button></div>`; }).join('')}
    ${Object.keys(heat).length ? `<section class="card sp-card"><h2 class="sp-ct">Dirbo</h2>${bodySvg(heat, '', false)}</section>` : ''}
    <div class="sp-acts"><button class="btn big" data-a="spWEdit" data-id="${w.id}">${ic('pen', 'sm')} Taisyti</button><button class="btn big" data-a="delWorkout" data-id="${w.id}">Ištrinti</button></div>`;
}
A.spExEdit = d => {
  const w = S.workouts.find(x => x.id === d.w), x = w.exercises[+d.i], e = exercise(x.id);
  modal(esc(e.name), `${fld('Pakartojimai (per kablelį)', inp('sets', (x.sets || []).join(', ')))}${fld('Svoris kg (per kablelį, nebūtina)', inp('kg', (x.kg || []).map(k => k == null ? '' : String(k).replace('.', ',')).join('; ')))}`, o => {
    x.sets = String(o.sets).split(/[,\s;]+/).map(Number).filter(n => n > 0); x.kg = String(o.kg || '').split(/[;\s]+/).filter(Boolean).map(k => +k.replace(',', '.') || null);
    if (!x.sets.length) w.exercises.splice(+d.i, 1); commit();
  });
};
A.spWEdit = d => {
  const w = S.workouts.find(x => x.id === d.id);
  modal('Taisyti treniruotę', `<div class="row">${fld('Data', inp('date', w.date, 'date'))}${fld('Pradžia', inp('start', w.start || nowHM(), 'time'))}${fld('Trukmė (min)', inp('duration', w.duration, 'number', 'min="1"'))}</div>${w.distance != null ? fld('Atstumas (km)', inp('km', fmtKm(w.distance), 'text', 'inputmode="decimal"')) : ''}${fld('Pastaba', inp('note', w.note || ''))}`, o => {
    Object.assign(w, {date: o.date, start: o.start, duration: +o.duration || w.duration, note: o.note}); if (o.km != null) w.distance = Math.round((+String(o.km).replace(',', '.') || 0) * 1000); commit();
  });
};
A.delWorkout = async d => { if (!await ask('Ištrinti treniruotę?', '', {danger: true, yes: 'Ištrinti'})) return; S.workouts = S.workouts.filter(w => w.id !== d.id); A.closeModal(); commit({noRender: true}); spGo('home'); };
A.spAct = d => spGo('act', {id: d.id});
function splits(route) {
  const out = []; let acc = 0, km = 1, t0 = route[0]?.[2] || 0;
  for (let i = 1; i < route.length; i++) { acc += geoDist(route[i - 1], route[i]); if (acc >= km * 1000) { out.push((route[i][2] - t0) / 1000); t0 = route[i][2]; km++; } }
  return out;
}
function spActView() {
  const w = S.workouts.find(x => x.id === UI.sp.id); if (!w) return spHome();
  const sp = sportById(w.type), r = w.route || [], sec = (w.duration || 0) * 60, spl = r.length ? splits(r) : [], best = spl.length ? Math.min(...spl) : null;
  const elev = r.filter(p => p[3] != null).map(p => p[3]), up = elev.reduce((a, v, i) => a + (i && v > elev[i - 1] ? v - elev[i - 1] : 0), 0) || w.elev || 0;
  const tiles = [[w.distance ? fmtKm(w.distance) : null, 'km'], [fmtClock(w.secs || sec), w.secs > 3600 || sec > 3600 ? 'val.' : 'laikas'], [w.distance ? fmtPace(w.secs || sec, w.distance) : null, '/km'], [fmtThousands(workoutKcal(w)), 'kcal'], [w.hr ? w.hr : null, 'vid. pulsas'], [up ? `${Math.round(up)} m` : null, 'pakilimas'], [w.steps ? fmtThousands(w.steps) : null, 'žingsnių']].filter(x => x[0] != null).slice(0, 6);
  const msg = best && spl.length > 1 && spl.indexOf(best) > 0 ? `${spl.indexOf(best) + 1}-as kilometras – greičiausias (${fmtPace(best, 1000)})!` : spMsg(r.length ? 'run' : 'done');
  UI.mapNeed = r.length > 1 ? [{el: 'actMap', route: r}] : [];
  return `${spBack(esc(sp?.[1] || 'Treniruotė'))}<div class="sp-acols"><div>${r.length > 1 ? `<div class="sp-map o1" id="actMap"></div>` : ''}
    ${elev.length > 2 ? `<section class="card sp-card o4"><h2 class="sp-ct">Aukštis<small>${Math.round(Math.min(...elev))}–${Math.round(Math.max(...elev))} m</small></h2>${elevSvg(elev)}</section>` : ''}</div>
    <div><div class="sp-g6 o2">${tiles.map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('')}</div>
    <div class="sp-say o3">${daigelis(4)}<p>${esc(msg)}</p></div>
    ${spl.length ? `<section class="card sp-card o5"><h2 class="sp-ct">Kilometrai</h2>${spl.map((s, k) => `<div class="sp-spl ${s === best ? 'best' : ''}"><b>${k + 1} km</b><i style="width:${Math.round(40 + (Math.max(...spl) - s) / Math.max(1, Math.max(...spl) - best) * 60)}%"></i><small>${fmtPace(s, 1000)}</small></div>`).join('')}</section>` : ''}
    <div class="sp-acts q o6"><button class="btn ghost sm" data-a="spWEdit" data-id="${w.id}">${ic('pen', 'sm')} Taisyti</button><button class="btn ghost sm" data-a="delWorkout" data-id="${w.id}">Ištrinti</button></div></div></div>`;
}
function elevSvg(e) { const mn = Math.min(...e) - 3, mx = Math.max(...e) + 3, W = 300, H = 90, step = Math.max(1, Math.floor(e.length / 120)), pts = e.filter((_, i) => i % step === 0).map((v, i, a) => [i / Math.max(1, a.length - 1) * W, H - (v - mn) / (mx - mn) * (H - 14)]);
  return `<svg class="sp-elev" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><path d="M0 ${H} ${pts.map(p => 'L' + p.map(v => v.toFixed(1)).join(' ')).join(' ')} L${W} ${H}Z" fill="var(--s3)" opacity=".55"/><polyline fill="none" stroke="var(--br)" stroke-width="2.5" points="${pts.map(p => p.join(',')).join(' ')}"/></svg>`; }

// ----- 2 savaičių apžvalga -----
function sportReviewDue() {
  if (!sportSet().review || S.workouts.length < 3) return false;
  const last = (S.sportReviews || []).map(r => r.date).sort().pop();
  return !last || diffDays(last, today()) >= 14;
}
A.sportReview = () => spGo('review');
function spReview() {
  const t = today(), cur = muscleVolume(addDays(t, -13), t), prev = muscleVolume(addDays(t, -27), addDays(t, -14)), neg = neglected();
  const rows = [['Krūtinė', ['kru']], ['Nugara', ['nug', 'apn']], ['Pečiai', ['pec', 'tra']], ['Rankos', ['bic', 'tri']], ['Pilvas', ['pre', 'son']], ['Kojos', ['ket', 'uzp', 'pri']], ['Sėdmenys', ['sed']], ['Blauzdos', ['bla']], ['Dilbiai', ['dil']]].map(([l, gs]) => [l, round(sum(gs.map(g => cur[g] || 0))), round(sum(gs.map(g => prev[g] || 0))), gs]);
  const negG = new Set(neg.map(x => x.g)), mx = Math.max(1, ...rows.flatMap(r => [r[1], r[2]])), lackRows = rows.filter(r => r[3].some(g => negG.has(g))), lack = lackRows.map(r => r[0]), good = rows.filter(r => r[1] >= r[2] && r[1] > 0 && !lackRows.includes(r)).map(r => r[0].toLowerCase());
  const msg = lack.length ? `${good.length ? cap(good.slice(0, 2).join(' ir ')) + ' – puikiai! ' : ''}${cap(lack.slice(0, 2).map(l => ({Krūtinė: 'krūtinei', Nugara: 'nugarai', Pečiai: 'pečiams', Rankos: 'rankoms', Pilvas: 'pilvui', Kojos: 'kojoms', Sėdmenys: 'sėdmenims', Blauzdos: 'blauzdoms', Dilbiai: 'dilbiams'})[l] || l).join(' ir '))} šį kartą laiko pritrūko – nieko tokio, pasižiūrėsim kartu.` : 'Visos pagrindinės grupės padarytos – puikus balansas!';
  return `${spBack('2 savaičių apžvalga')}<div class="sp-say">${lack.length ? tapDaigelis('spWhy', {g: neg[0].g}) : daigelis(5)}<p>${esc(msg)}</p></div>
    <section class="card sp-card"><h2 class="sp-ct">Serijos per 2 sav.<small>dabar / anksčiau</small></h2>${rows.filter(r => r[1] || r[2]).map(([l, a, b]) => `<div class="sp-vr"><span>${l}</span><span class="vb"><i style="width:${a / mx * 100}%"></i><i class="p" style="width:${b / mx * 100}%"></i></span><small>${a}</small></div>`).join('') || empty('Per 2 savaites treniruočių nebuvo')}</section>
    <button class="btn primary sp-go" data-a="reviewDone">Gerai, toliau</button>`;
}
const RS2 = [['noro', 'Nebuvo nuotaikos', 'Pridėsiu tik vieną trumpą pratimą pabaigoje.'], ['sunku', 'Buvo per sunku', 'Parinksiu lengvesnius variantus.'], ['iranga', 'Neturiu įrangos', 'Siūlysiu tai, ką gali daryti su savo įranga.'], ['nepatinka', 'Nepatinka pratimai', 'Pakeisiu kitais tiems patiems raumenims.'], ['skauda', 'Kažkas skauda', 'Dvi savaites jų nesiūlysiu.'], ['pamirsau', 'Tiesiog pamiršau', 'Kitą kartą įdėsiu pats.']];
A.spWhy = d => { const cur = (S.sportPrefs || {})[d.g]?.reason; spSheet(`<h3>Kaip galėčiau padėti?</h3>${RS2.map(([k, a, b]) => `<button class="sp-opt ${cur === k ? 'on' : ''}" data-a="reasonSet" data-g="${d.g}" data-r="${k}"><span><b>${a}</b><small>${b}</small></span></button>`).join('')}`); };
A.reasonAsk = A.spWhy;
A.reasonSet = d => { const used = [...new Set(S.workouts.flatMap(w => (w.exercises || []).map(x => exId(x.id))).filter(id => exercise(id)?.g.includes(d.g)))]; S.sportPrefs[d.g] = {reason: d.r, date: today(), used}; A.closeSheet(); commit(); toast('Supratau – taip ir padarysiu'); };
A.reviewDone = () => { S.sportReviews.push({date: today(), neglected: neglected().map(x => x.g)}); commit({noRender: true}); spGo('home'); };

// ----- planavimas -----
A.planWorkout = d => A.spPlanSheet({start: d.start || (d.id && String(d.id).includes(':') ? d.id : null), date: d.d || d.date});
A.spPlanSheet = (d = {}) => {
  const p = d.id ? S.plans.find(x => x.id === d.id) : null;
  const o = UI.spPlan && (!d.id || UI.spPlan.id === d.id) && !d.start && !d.date ? UI.spPlan : (UI.spPlan = {id: p?.id, date: p?.date || d.date || today(), start: p?.start || d.start || null, focus: p?.type || 'auto', remind: p ? p.remind !== false : sportSet().remind});
  const free = (() => { const r = recommendations(o.date); return r.sportSlot ? [fromMin(r.sportSlot[0]), fromMin(Math.min(r.sportSlot[1], r.sportSlot[0] + (+S.profile.workoutMin || 45) + (+S.profile.showerMin || 0) + (+S.profile.travelMin || 0) * 2))] : null; })();
  if (!o.start) o.start = free ? free[0] : fromMin(Math.round((nowMin() + 60) / 15) * 15);
  const days = [today(), addDays(today(), 1), addDays(today(), 2)];
  spSheet(`<h3>${p ? 'Perkelti treniruotę' : 'Suplanuoti treniruotę'}</h3>
    <div class="sp-q">Kada?</div><div class="sp-mins">${days.map((x, k) => `<button class="${o.date === x ? 'on' : ''}" data-a="spPlanF" data-k="date" data-v="${x}">${k === 0 ? 'Šiandien' : k === 1 ? 'Rytoj' : DOW[dow(x) - 1].slice(0, 2) + ' ' + parseD(x).getDate()}</button>`).join('')}<label class="sp-datein ${days.includes(o.date) ? '' : 'on'}">${days.includes(o.date) ? 'Kita…' : fmtDate(o.date)}<input type="date" value="${o.date}" onchange="A.spPlanF({k:'date',v:this.value})"></label></div>
    <div class="sp-q">Kelintą?</div>${free ? `<button class="sp-opt ${o.start === free[0] ? 'on' : ''}" data-a="spPlanF" data-k="start" data-v="${free[0]}"><span class="sp-fi">${ic('clock')}</span><span><b>${free[0]}–${free[1]}</b><small>Laisvas langas · su keliu ir dušu</small></span></button>` : ''}
    <div class="sp-chips">${['07:00', '12:30', '18:00', '20:00'].filter(t => t !== free?.[0]).map(t => `<button class="${o.start === t ? 'on' : ''}" data-a="spPlanF" data-k="start" data-v="${t}">${t}</button>`).join('')}<label class="sp-timein ${['07:00', '12:30', '18:00', '20:00', free?.[0]].includes(o.start) ? '' : 'on'}">${['07:00', '12:30', '18:00', '20:00', free?.[0]].includes(o.start) ? 'Kitas laikas' : o.start}<input type="time" value="${o.start}" onchange="A.spPlanF({k:'start',v:this.value})"></label></div>
    ${p ? '' : `<div class="sp-q">Ką?</div><div class="sp-chips">${[['auto', 'Parink už mane'], ['kojos', 'Kojos'], ['nugara', 'Nugara'], ['run', 'Bėgimas']].map(([v, l]) => `<button class="${v === 'auto' ? 'br' : ''} ${o.focus === v && v !== 'auto' ? 'on' : ''}" data-a="spPlanF" data-k="focus" data-v="${v}">${v === 'auto' ? ic('wauto', 'sm') + ' ' : ''}${l}</button>`).join('')}<button data-a="spPlanMore">Kita ›</button></div>`}
    <button class="sp-set" data-a="spPlanF" data-k="remind" data-v="${o.remind ? '' : '1'}"><span>Priminti 30 min prieš</span><span class="tg ${o.remind ? '' : 'off'}"></span></button>
    <button class="btn primary sp-go" data-a="spPlanSave">${p ? 'Perkelti' : 'Suplanuoti'}</button>`);
};
A.spPlanF = d => { UI.spPlan[d.k] = d.k === 'remind' ? !!d.v : d.v; A.spPlanSheet({id: UI.spPlan.id}); };
A.spPlanMore = () => { const o = UI.spPlan; spSheet(`<h3>Ką planuoji?</h3><div class="sp-chips">${FOCUS.filter(f => f[0] !== 'auto').map(([v, l]) => `<button class="${o.focus === v ? 'on' : ''}" data-a="spPlanFocus" data-v="${v}">${l}</button>`).join('')}${topSports(8).map(s => `<button class="${o.focus === s[0] ? 'on' : ''}" data-a="spPlanFocus" data-v="${s[0]}">${s[1]}</button>`).join('')}</div>`); };
A.spPlanFocus = d => { UI.spPlan.focus = d.v; A.spPlanSheet({id: UI.spPlan.id}); };
A.spPlanSave = () => {
  const o = UI.spPlan, p = o.id && S.plans.find(x => x.id === o.id);
  if (p) { p.date = o.date; p.start = o.start; p.remind = o.remind; }
  else { const focus = o.focus === 'auto' ? todaysSuggestion().focus : o.focus, fo = FOCUS.find(x => x[0] === focus), dur = +S.profile.workoutMin || 45;
    S.plans.push({id: uid(), date: o.date, start: o.start, duration: dur, type: focus, place: sportSet().place, remind: o.remind, status: 'planned', exercises: fo ? buildWorkout(fo[2], dur, sportSet().place) : []}); }
  UI.spPlan = null; A.closeSheet(); commit(); toast(`Suplanuota: ${relDay(o.date)} ${o.start}`);
};
A.openPlan = d => { const p = S.plans.find(x => x.id === d.id); if (!p) return; if (sportById(p.type)) return A.spPlanSheet({id: p.id}); UI.draft = {planId: p.id, planEdit: true, type: p.type, place: p.place || sportSet().place, duration: p.duration, date: p.date, start: p.start, exercises: (p.exercises || []).map(x => ({...x}))}; spGo('draft'); };
A.startPlan = async d => {
  const p = S.plans.find(x => x.id === d.id); if (!p) return;
  if (sportById(p.type)) { p.status = 'done'; commit({noRender: true}); return A.spSport({id: p.type}); }
  UI.draft = {planId: p.id, type: p.type, place: p.place || sportSet().place, duration: p.duration, exercises: (p.exercises || []).map(x => ({...x}))}; A.spDraftStart();
};
A.planDone = d => {
  const p = S.plans.find(x => x.id === d.id); if (!p) return;
  S.workouts.push({id: uid(), date: p.date, start: p.start, duration: +p.duration || 40, exercises: (p.exercises || []).map(x => ({id: x.id, sets: [...x.sets], kg: x.kg ? x.sets.map(() => x.kg) : []})), type: p.type, place: p.place, feel: 'ok'});
  p.status = 'done'; confetti(); toast(spMsg('done') + ' +25 XP', 'good'); commit();
};
A.planSkip = d => { const p = S.plans.find(x => x.id === d.id); p.status = 'skipped'; commit(); toast('Praleista – nieko tokio.'); };
A.planDel = d => { S.plans = S.plans.filter(x => x.id !== d.id); commit(); };

// ----- įrašyti atliktą -----
A.spLogSheet = (d = {}) => {
  const o = UI.logF && !d.date ? UI.logF : (UI.logF = {type: 'strength', date: d.date || today(), start: d.start || nowHM(), min: +S.profile.workoutMin || 45, ex: []});
  const types = [['strength', 'Jėgos treniruotė'], ...topSports(3).map(s => [s[0], s[1]])];
  spSheet(`<h3>Įrašyti atliktą</h3>
    <div class="sp-q">Kas?</div><div class="sp-chips">${types.map(([v, l]) => `<button class="${o.type === v ? 'on' : ''}" data-a="spLogF" data-k="type" data-v="${v}">${l}</button>`).join('')}<button class="${types.some(t => t[0] === o.type) ? '' : 'on'}" data-a="spLogMore">${types.some(t => t[0] === o.type) ? 'Kita ›' : esc(sportById(o.type)?.[1] || 'Kita')}</button></div>
    <div class="sp-q">Kada ir kiek?</div><form class="sp-logrow" data-f="spLogSave" id="spLogForm"><input type="date" name="date" value="${o.date}" onchange="UI.logF.date=this.value"><input type="time" name="start" value="${o.start}" onchange="UI.logF.start=this.value"><label><input type="number" name="min" value="${o.min}" min="1" onchange="UI.logF.min=+this.value"> min</label>${isGpsSport(o.type) ? `<label><input type="text" inputmode="decimal" name="km" value="${o.km || ''}" placeholder="0" onchange="UI.logF.km=this.value"> km</label>` : ''}</form>
    ${o.type === 'strength' ? `<div class="sp-q">Pratimai (nebūtina)</div>${o.ex.map((x, i) => { const e = exercise(x.id); return `<div class="sp-ex2">${exPh(x.id)}<span class="tx"><b>${esc(e?.name || '')}</b><input class="sp-setin" placeholder="pvz. 10, 10, 8" value="${esc(x.sets)}" onchange="UI.logF.ex[${i}].sets=this.value"><input class="sp-setin" placeholder="kg" inputmode="decimal" value="${esc(x.kg)}" onchange="UI.logF.ex[${i}].kg=this.value"></span><button class="sw" data-a="spLogDel" data-i="${i}" aria-label="Išimti">${ic('x', 'sm')}</button></div>`; }).join('')}
      <div class="sp-acts q"><button class="btn ghost sm" data-a="spLogAddEx">${ic('plus', 'sm')} Pridėti pratimą</button></div>` : ''}
    <button class="btn primary sp-go" data-a="spLogSave">Išsaugoti</button>`, 'tall');
};
A.spLogF = d => { UI.logF[d.k] = d.v; A.spLogSheet(); };
A.spLogMore = () => { spSheet(`<h3>Kas?</h3>${SPORTS.map(([c, , l]) => `<div class="sp-grp">${c}</div><div class="sp-chips">${l.map(s => `<button data-a="spLogF" data-k="type" data-v="${s[0]}">${s[1]}</button>`).join('')}</div>`).join('')}`, 'tall'); };
A.spLogAddEx = () => { UI.exPickFor = 'log'; A.closeSheet(); spGo('lib', {back: 'home'}); };
A.spLogDel = d => { UI.logF.ex.splice(+d.i, 1); A.spLogSheet(); };
A.spLogSave = () => {
  const o = UI.logF, f = $('#spLogForm'); if (f) { o.date = f.date.value; o.start = f.start.value; o.min = +f.min.value || o.min; if (f.km) o.km = f.km.value; }
  const exercises = o.ex.map(x => { const sets = String(x.sets).split(/[,\s;]+/).map(Number).filter(n => n > 0), kg = +String(x.kg).replace(',', '.') || null; return {id: x.id, sets, kg: sets.map(() => kg), feel: 'ok'}; }).filter(x => x.sets.length);
  const w = {id: uid(), date: o.date, start: o.start, duration: o.min, type: o.type, exercises, feel: 'ok'};
  if (o.km) w.distance = Math.round((+String(o.km).replace(',', '.') || 0) * 1000);
  S.workouts.push(w); UI.logF = null; A.closeSheet(); confetti(); toast(spMsg('done') + ' +25 XP', 'good'); commit();
};

// ----- visi sportai, laikmatis, GPS -----
function spSports() {
  const q = (UI.spQ || '').toLowerCase(), all = SPORTS.flatMap(c => c[2]);
  return `${spBack('Koks sportas?')}<form class="sp-search" data-f="spSportQ"><input name="q" value="${esc(UI.spQ || '')}" placeholder="Ieškoti iš ${all.length}…" autocomplete="off" oninput="clearTimeout(window._sq);window._sq=setTimeout(()=>A.spSportQ(this.form),250)"></form>
    ${q ? `<div class="sp-sgrid">${all.filter(s => s[1].toLowerCase().includes(q)).map(s => `<button data-a="spSport" data-id="${s[0]}">${esc(s[1])}</button>`).join('') || empty('Nerasta')}</div>`
      : `<div class="sp-grp">Dažniausi</div><div class="sp-sgrid">${[sportById('strength'), ...topSports(3)].map(s => `<button data-a="spSport" data-id="${s[0]}">${esc(s[1])}</button>`).join('')}</div>
      ${SPORTS.map(([c, , l]) => `<div class="sp-grp">${c}<em>${l.length}</em></div><div class="sp-sgrid">${l.map(s => `<button data-a="spSport" data-id="${s[0]}">${esc(s[1])}</button>`).join('')}</div>`).join('')}`}`;
}
A.spSportQ = f => { UI.spQ = f.q.value; const pos = f.q.selectionStart; render(); const i = $('.sp-search input'); if (i) { i.focus(); try { i.setSelectionRange(pos, pos); } catch (e) {} } };
A.spSport = async d => {
  A.closeSheet();
  if (d.id === 'strength') return A.spStartSheet();
  if (S.run && !await ask('Pradėti naują?', 'Jau vyksta kitas sportas – jis bus išsaugotas.', {yes: 'Pradėti naują'})) return;
  if (S.run) await spRunStop(true);
  const gps = isGpsSport(d.id) && (isNative() || (!!navigator.geolocation && !isDesktopOnly()));
  S.run = {sport: d.id, date: today(), start: nowHM(), ts: Date.now(), paused: 0, pauseAt: null, gps, pts: [], dist: 0};
  commit({noRender: true}); spGo('run'); if (gps) gpsStart();
};
const isDesktopOnly = () => !('ontouchstart' in window) && window.innerWidth > 900 && !isNative();
const runSec = r => Math.max(0, (((r.pauseAt || Date.now()) - r.ts) - (r.paused || 0)) / 1000);
const geoDist = (a, b) => { const R = 6371000, t = Math.PI / 180, dLa = (b[0] - a[0]) * t, dLo = (b[1] - a[1]) * t, x = Math.sin(dLa / 2) ** 2 + Math.cos(a[0] * t) * Math.cos(b[0] * t) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
let GPS_WATCH = null;
// GPS taškai filtruojami: blogo tikslumo (> 25 m), neįmanomi šuoliai (greičiau nei 15 m/s bėgant), stovėjimas vietoje neskaičiuojamas
function gpsStart() {
  if (GPS_WATCH != null || NAT_WATCH != null) return;
  const onPos = pos => {
    const r = S.run; if (!r || r.pauseAt) return;
    const c = pos.coords, p = [round(c.latitude, 6), round(c.longitude, 6), pos.timestamp, c.altitude != null ? round(c.altitude, 1) : null];
    if (c.accuracy > 25) return;
    const last = r.pts[r.pts.length - 1];
    if (last) { const d = geoDist(last, p), dt = (p[2] - last[2]) / 1000; if (dt <= 0 || d / dt > (/bike|ebike|mtb|ski|kite/.test(r.sport) ? 30 : 15)) return; if (d < Math.max(3, c.accuracy * 0.4)) return; r.dist += d; }
    r.pts.push(p); if (r.pts.length % 5 === 0) commit({noRender: true});
    if (UI.view === 'sport' && UI.sp?.p === 'run') updateRunTiles();
  };
  if (isNative()) { natGpsStart(onPos).then(ok => { if (!ok && navigator.geolocation) GPS_WATCH = navigator.geolocation.watchPosition(onPos, () => {}, {enableHighAccuracy: true, maximumAge: 2000, timeout: 20000}); }); return; }
  if (navigator.geolocation) GPS_WATCH = navigator.geolocation.watchPosition(onPos, () => {}, {enableHighAccuracy: true, maximumAge: 2000, timeout: 20000});
}
function gpsStop() { if (GPS_WATCH != null) navigator.geolocation.clearWatch(GPS_WATCH); GPS_WATCH = null; natGpsStop(); }
function runTiles(r) { const sec = runSec(r), kcal = Math.round((sportById(r.sport)?.[2] || 5) * (currentWeight() || 75) * sec / 3600);
  if (r.gps && isWalk(r.sport)) return [[fmtKm(r.dist), 'km'], [fmtClock(sec), 'laikas'], [fmtThousands(walkSteps(r)), 'žingsnių'], [fmtPace(sec, r.dist), 'tempas /km']];
  return r.gps ? [[fmtKm(r.dist), 'km'], [fmtClock(sec), 'laikas'], [fmtPace(sec, r.dist), 'tempas /km'], [fmtThousands(kcal), 'kcal']] : [[fmtThousands(kcal), `kcal (~${fmtNum(sportById(r.sport)?.[2] || 5)} MET)`], ['–', 'pulsas (su laikrodžiu)']]; }
function updateRunTiles() { const r = S.run; if (!r) return; const t = runTiles(r); document.querySelectorAll('.sp-rt b').forEach((b, i) => { if (t[i]) b.textContent = t[i][0]; }); const c = $('#runClock'); if (c) c.textContent = fmtClock(runSec(r)); if (r.gps && RUN_MAP) drawRoute(RUN_MAP, r.pts, true); }
function spRunPage() {
  const r = S.run; if (!r) return spHome();
  const sp = sportById(r.sport), t = runTiles(r), spl = r.gps && r.pts.length > 2 ? splits(r.pts) : [];
  UI.mapNeed = r.gps ? [{el: 'runMap', route: r.pts, live: true}] : [];
  return `<div class="sp-run ${r.gps ? 'gps' : ''}">${r.gps ? `<div class="sp-map live" id="runMap"><span class="gps"><i></i>GPS</span></div>` : `<div class="sp-rhead"><span class="sp-fi">${ic(sportIcon(r.sport))}</span><b>${esc(sp?.[1] || '')}</b></div><div class="sp-clk" id="runClock">${fmtClock(runSec(r))}</div>`}
    <div class="sp-g4 ${r.gps ? '' : 'two'}">${t.map(([v, l]) => `<div class="sp-rt"><b>${v}</b><span>${l}</span></div>`).join('')}</div>
    ${spl.length ? `<section class="card sp-card"><h2 class="sp-ct">Kilometrai</h2>${spl.map((s, k) => `<div class="sp-spl"><b>${k + 1} km</b><i style="width:70%"></i><small>${fmtPace(s, 1000)}</small></div>`).join('')}</section>` : ''}
    ${r.gps && !isWalk(r.sport) ? '' : `<div class="sp-say">${daigelis(4)}<p>${esc(isWalk(r.sport) ? (stepsOn(today()) + walkSteps(r) >= stepGoal() ? 'Su šiuo ėjimu dienos tikslas jau pasiektas!' : `Iki dienos tikslo – ${fmtThousands(stepGoal() - stepsOn(today()) - walkSteps(r))} žingsnių.`) : spMsg('live'))}</p></div>`}
    <div class="sp-runctl"><button data-a="spRunPause" aria-label="${r.pauseAt ? 'Tęsti' : 'Pauzė'}">${ic(r.pauseAt ? 'play' : 'pause')}</button><button class="main" data-a="spRunStop" aria-label="Baigti">${ic('stop')}</button></div></div>`;
}
A.spRunPause = () => { const r = S.run; if (r.pauseAt) { r.paused += Date.now() - r.pauseAt; r.pauseAt = null; } else r.pauseAt = Date.now(); commit({noRender: true}); render(); };
A.spRunStop = async () => { if (!await ask('Baigti?', '', {yes: 'Baigti ir išsaugoti', no: 'Tęsti'})) return; spRunStop(); };
async function spRunStop(silent) {
  const r = S.run; if (!r) return; gpsStop(); RUN_MAP = null;
  const secs = Math.round(runSec(r)), sp = sportById(r.sport);
  const w = {id: uid(), date: r.date, start: r.start, duration: Math.max(1, Math.round(secs / 60)), secs, type: r.sport, feel: 'ok', kcal: Math.round((sp?.[2] || 5) * (currentWeight() || 75) * secs / 3600)};
  if (r.gps && r.pts.length > 1) { w.route = simplifyRoute(r.pts); w.distance = Math.round(r.dist); }
  S.workouts.push(w); S.run = null; commit({noRender: true});
  if (!silent) { confetti(); spGo('act', {id: w.id}); }
}
// maršruto supaprastinimas (kas ~10 m) – kad duomenys būtų nedideli
function simplifyRoute(pts) { const out = [pts[0]]; for (let i = 1; i < pts.length - 1; i++) if (geoDist(out[out.length - 1], pts[i]) >= 10) out.push(pts[i]); out.push(pts[pts.length - 1]); return out; }

// ----- žemėlapiai (MapLibre + OpenFreeMap – nemokama, be rakto) -----
let RUN_MAP = null, MAPLIB = null;
const loadMapLib = () => MAPLIB || (MAPLIB = new Promise((ok, bad) => { if (window.maplibregl) return ok();
  const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/4.7.1/maplibre-gl.min.css'; document.head.appendChild(l);
  const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/4.7.1/maplibre-gl.min.js'; s.onload = ok; s.onerror = bad; document.head.appendChild(s); }));
const mapStyle = () => `https://tiles.openfreemap.org/styles/${document.documentElement.dataset.theme === 'light' ? 'positron' : 'dark'}`;
function tuneDark(m) { if (document.documentElement.dataset.theme === 'light') return; for (const l of m.getStyle().layers) { const id = l.id; try {
  if (l.type === 'background') m.setPaintProperty(id, 'background-color', '#121212');
  else if (l.type === 'line' && /road|highway|street|path|bridge|tunnel|minor|major|motorway|trunk|primary|secondary|tertiary|service|track/.test(id)) { m.setPaintProperty(id, 'line-color', /major|motorway|trunk|primary/.test(id) ? '#4f4943' : '#3a3633'); m.setPaintProperty(id, 'line-opacity', 1); }
  else if (l.type === 'fill' && /water/.test(id)) { m.setPaintProperty(id, 'fill-color', '#1a2630'); m.setPaintProperty(id, 'fill-opacity', 1); }
  else if (l.type === 'fill' && /park|wood|forest|grass|landcover|landuse/.test(id)) { m.setPaintProperty(id, 'fill-color', '#18221b'); m.setPaintProperty(id, 'fill-opacity', 1); }
  else if (l.type === 'fill' && /building/.test(id)) m.setPaintProperty(id, 'fill-color', '#1d1c1b');
  else if (l.type === 'symbol') m.setPaintProperty(id, 'text-color', '#8d8780'); } catch (e) {} } }
function drawRoute(m, route, live) {
  const pts = route.map(p => [p[1], p[0]]); if (!pts.length) return;
  const br = getComputedStyle(document.documentElement).getPropertyValue('--br').trim() || '#ff8040';
  const line = {type: 'Feature', geometry: {type: 'LineString', coordinates: pts.length > 1 ? pts : [pts[0], pts[0]]}}, ends = {type: 'FeatureCollection', features: [{type: 'Feature', properties: {c: '#5aa97c', r: 6}, geometry: {type: 'Point', coordinates: pts[0]}}, {type: 'Feature', properties: {c: br, r: live ? 8 : 6}, geometry: {type: 'Point', coordinates: pts[pts.length - 1]}}]};
  try { if (m.getSource('r')) { m.getSource('r').setData(line); m.getSource('e').setData(ends); }
  else { m.addSource('r', {type: 'geojson', data: line}); m.addLayer({id: 'r', type: 'line', source: 'r', paint: {'line-color': br, 'line-width': 5}, layout: {'line-cap': 'round', 'line-join': 'round'}});
    m.addSource('e', {type: 'geojson', data: ends}); m.addLayer({id: 'e', type: 'circle', source: 'e', paint: {'circle-color': ['get', 'c'], 'circle-radius': ['get', 'r'], 'circle-stroke-color': '#fff', 'circle-stroke-width': 2.5}}); } } catch (e) { return; }
  if (live) m.easeTo({center: pts[pts.length - 1], duration: 400});
}
async function mountMaps() {
  const need = UI.view === 'sport' ? UI.mapNeed || [] : []; UI.mapNeed = [];
  if (!need.length) return; try { await loadMapLib(); } catch (e) { return; }
  for (const n of need) { const el = document.getElementById(n.el); if (!el || el._m) continue;
    const pts = n.route.map(p => [p[1], p[0]]);
    const b = pts.length ? pts.reduce((a, p) => [[Math.min(a[0][0], p[0]), Math.min(a[0][1], p[1])], [Math.max(a[1][0], p[0]), Math.max(a[1][1], p[1])]], [[180, 90], [-180, -90]]) : null;
    const m = new maplibregl.Map({container: el, style: mapStyle(), ...(b && pts.length > 1 ? {bounds: b, fitBoundsOptions: {padding: 30, maxZoom: 16}} : {center: pts[0] || [25.28, 54.69], zoom: pts.length ? 16 : 11}), interactive: !n.live, attributionControl: {compact: true}});
    el._m = m; m.on('style.load', () => { tuneDark(m); drawRoute(m, n.route, n.live); }); m.on('load', () => { drawRoute(m, n.route, n.live); }); m.once('idle', () => el.querySelectorAll('.maplibregl-compact-show').forEach(x => x.classList.remove('maplibregl-compact-show')));
    if (n.live) RUN_MAP = m; }
}

// ----- sporto nustatymai, laikrodis -----
function spSettings() {
  const s = sportSet(), p = S.profile, row = (l, v, a, d = {}) => `<button class="sp-set" data-a="${a}" ${Object.entries(d).map(([k, x]) => `data-${k}="${x}"`).join(' ')}><span>${l}</span><span class="v">${v} ›</span></button>`;
  const tg = (l, sub, k, on) => `<button class="sp-set" data-a="spSetT" data-k="${k}"><span>${l}<small>${sub}</small></span><span class="tg ${on ? '' : 'off'}"></span></button>`;
  return `${spBack('Sporto nustatymai')}
    <section class="card sp-card">${row('Kur dažniausiai sportuoji', PLACE_LT[s.place] === 'Salė' ? 'Salėje' : PLACE_LT[s.place], 'spSetPick', {k: 'place'})}${row('Įranga namie', (s.homeEq || []).map(x => EQ_LT[x]).join(', ') || 'nėra', 'spSetEq')}${row('Lygis', cap(['', 'pradedantysis', 'vidutinis', 'pažengęs'][s.level || 1]), 'spSetPick', {k: 'level'})}
      ${row('Savaitės tikslas', `${p.workoutsPerWeek || 3} treniruotės`, 'spSetNum', {k: 'workoutsPerWeek'})}${row('Treniruotės trukmė', `${p.workoutMin || 45} min`, 'spSetNum', {k: 'workoutMin'})}${row('Dušas ir susitvarkymas', `${p.showerMin || 0} min`, 'spSetNum', {k: 'showerMin'})}${row('Kelionė į sportą', `${p.travelMin || 0} min`, 'spSetNum', {k: 'travelMin'})}${row('Poilsis tarp serijų', `${s.rest || 90} s`, 'spSetNum', {k: 'rest'})}</section>
    <section class="card sp-card">${tg('Rekomendacijos', 'Išjungus – tik užsirašinėti', 'rec', sportOn())}${tg('Įvairios Daigelio žinutės', 'Kuria AI pagal tavo dieną', 'aiMsgs', s.aiMsgs)}${tg('Siūlyti pakeisti pratimus', 'Kas 4–6 savaites', 'swaps', s.swaps)}${tg('2 savaičių apžvalga', 'Priminti kas 2 sav.', 'review', s.review)}${tg('Priminti apie treniruotę', '30 min prieš', 'remind', s.remind)}</section>
    <section class="card sp-card"><button class="sp-set" data-a="spGo" data-p="conn"><span>Telefonas ir laikrodis<small>${HC.ok ? (HC.src || 'Prijungta') : isNative() ? 'Neprijungta' : 'Veikia programėlėje'}</small></span><span class="v">›</span></button></section>`;
}
A.spSetT = d => { if (d.k === 'rec') S.settings.modes.sport = !sportOn(); else S.sportSet = {...sportSet(), [d.k]: !sportSet()[d.k]}; commit(); };
A.spSetPick = async d => {
  const o = d.k === 'place' ? [['gym', 'Salėje'], ['home', 'Namie'], ['out', 'Lauke']] : [[1, 'Pradedantysis'], [2, 'Vidutinis'], [3, 'Pažengęs']];
  spSheet(`<h3>${d.k === 'place' ? 'Kur dažniausiai sportuoji?' : 'Tavo lygis'}</h3>${o.map(([v, l]) => `<button class="sp-opt ${String(sportSet()[d.k]) === String(v) ? 'on' : ''}" data-a="spSetVal" data-k="${d.k}" data-v="${v}"><span><b>${l}</b></span></button>`).join('')}`);
};
A.spSetVal = d => { S.sportSet = {...sportSet(), [d.k]: isNaN(+d.v) ? d.v : +d.v}; A.closeSheet(); commit(); };
A.spSetEq = () => { const cur = sportSet().homeEq || []; spSheet(`<h3>Įranga namie</h3><div class="sp-chips">${['dumbbell', 'bands', 'kettlebells', 'exercise ball', 'medicine ball', 'foam roll', 'barbell'].map(k => `<button class="${cur.includes(k) ? 'on' : ''}" data-a="spEqT" data-k="${k}">${cap(EQ_LT[k])}</button>`).join('')}</div>`); };
A.spEqT = d => { const cur = sportSet().homeEq || []; S.sportSet = {...sportSet(), homeEq: cur.includes(d.k) ? cur.filter(x => x !== d.k) : [...cur, d.k]}; commit({noRender: true}); render(); A.spSetEq(); };
A.spSetNum = async d => { const isRest = d.k === 'rest', cur = isRest ? sportSet().rest || 90 : S.profile[d.k];
  const v = await askText({workoutsPerWeek: 'Treniruočių per savaitę', workoutMin: 'Treniruotės trukmė (min)', showerMin: 'Dušas ir susitvarkymas (min)', travelMin: 'Kelionė į sportą (min)', rest: 'Poilsis tarp serijų (s)'}[d.k], '', String(cur ?? ''));
  if (v == null || v === '' || isNaN(+v)) return; if (isRest) S.sportSet = {...sportSet(), rest: clamp(+v, 10, 600)}; else S.profile[d.k] = +v; commit(); };
// ----- Android programėlė (Capacitor apvalkalas): Health Connect ir GPS fone. Naršyklėje šios dalys neveikia ir nieko nedaro. -----
const isNative = () => !!window.Capacitor?.isNativePlatform?.();
const natPlugin = n => { const C = window.Capacitor; if (!C) return null; try { return C.Plugins?.[n] || (C.registerPlugin ? C.registerPlugin(n) : null); } catch (e) { return null; } };
const HC = {ok: false, src: null, last: null};
const HC_READ = ['steps', 'distance', 'calories', 'heartRate', 'workouts'];
if (isNative()) window.LSNative = {openHealthConnect: () => natPlugin('Health')?.openHealthConnectSettings?.()};
const HC_SPORT = {running: 'run', runningTreadmill: 'treadmill', walking: 'walk', hiking: 'hike', cycling: 'bike', bikingStationary: 'spin', swimming: 'swim', swimmingPool: 'swim', swimmingOpenWater: 'openwater', strengthTraining: 'strength', traditionalStrengthTraining: 'strength', functionalStrengthTraining: 'functional', weightlifting: 'strength', crossTraining: 'functional', yoga: 'yoga', pilates: 'pilates', basketball: 'basketball', soccer: 'football', tennis: 'tennis', badminton: 'badminton', tableTennis: 'tabletennis', squash: 'squash', volleyball: 'volleyball', hockey: 'icehockey', iceHockey: 'icehockey', rowing: 'rowing', rowingMachine: 'rowerg', elliptical: 'elliptical', stairClimbing: 'stairs', stairClimbingMachine: 'stairs', highIntensityIntervalTraining: 'hiit', dance: 'dance', dancing: 'dance', boxing: 'boxing', kickboxing: 'kickboxing', martialArts: 'karate', skiing: 'ski', downhillSkiing: 'ski', crossCountrySkiing: 'xcski', snowboarding: 'snowboard', iceSkating: 'iceskate', skating: 'iceskate', climbing: 'climbing', rockClimbing: 'climbing', golf: 'golf', jumpRope: 'jumprope', stretching: 'stretch', flexibility: 'stretch', handball: 'handball', rugby: 'rugby', fencing: 'fencing', wrestling: 'wrestling', taiChi: 'taichi', paddleSports: 'kayak', sailing: 'sailing', surfing: 'surf', waterPolo: 'waterpolo', calisthenics: 'calisthenics', other: 'other'};
async function hcConnect() {
  const H = natPlugin('Health'); if (!H) return false;
  try { const av = await H.isAvailable(); if (!av?.available) { info('Health Connect nėra', 'Šiame telefone Health Connect nerastas. Android 14+ jis būna įdiegtas – kitu atveju įdiek „Health Connect“ iš Play parduotuvės.'); return false; }
    const st = await H.requestAuthorization({read: HC_READ, write: [], requestHistoryAccess: true});
    HC.ok = (st?.readAuthorized || []).includes('steps') || (st?.readAuthorized || []).includes('workouts'); if (HC.ok) await hcSync(true);
    render(); return HC.ok;
  } catch (e) { toast('Nepavyko prisijungti prie Health Connect'); return false; }
}
async function hcCheck() { const H = natPlugin('Health'); if (!H) return; try { const st = await H.checkAuthorization({read: HC_READ, write: []}); HC.ok = (st?.readAuthorized || []).length > 0; } catch (e) { HC.ok = false; } }
// žingsniai per dieną (14 d.) ir treniruotės (30 d.) – iš telefono ir laikrodžio programų per Health Connect
async function hcSync(force) {
  const H = natPlugin('Health'); if (!H || !S) return; if (!force && HC.syncAt && Date.now() - HC.syncAt < 10 * 60000) return; HC.syncAt = Date.now();
  const set = sportSet().hc || {}, now = new Date(), iso = d => d.toISOString(); let changed = false;
  try {
    if (set.steps) {
      const from = new Date(parseD(addDays(today(), -13)));
      const {samples = []} = await H.queryAggregated({dataType: 'steps', startDate: iso(from), endDate: iso(now), bucket: 'day', aggregation: 'sum'});
      S.steps = S.steps || [];
      try { const t0 = new Date(parseD(today())); const {samples: hs = []} = await H.queryAggregated({dataType: 'steps', startDate: iso(t0), endDate: iso(now), bucket: 'hour', aggregation: 'sum'}); const h = Array(24).fill(0); for (const x of hs) h[new Date(x.startDate).getHours()] += Math.round(+x.value || 0); HC.hours = {date: today(), h}; } catch (e) {}
      for (const s of samples) { const d = s.startDate.slice(0, 10), n = Math.round(+s.value || 0); if (!n) continue; const ex = S.steps.find(x => x.date === d);
        if (!ex) { S.steps.push({date: d, steps: n, src: 'hc'}); changed = true; } else if (ex.src === 'hc' || n > (+ex.steps || 0)) { if (ex.steps !== n) { ex.steps = n; ex.src = 'hc'; changed = true; } } }
    }
    if (set.workouts) {
      const from = new Date(parseD(addDays(today(), -30)));
      const res = await H.queryWorkouts({startDate: iso(from), endDate: iso(now), limit: 50}); const ws = res?.workouts || [];
      for (const w of ws) {
        const id = 'hc_' + (w.platformId || w.startDate), t0 = new Date(w.startDate), date = `${t0.getFullYear()}-${String(t0.getMonth() + 1).padStart(2, '0')}-${String(t0.getDate()).padStart(2, '0')}`, start = `${String(t0.getHours()).padStart(2, '0')}:${String(t0.getMinutes()).padStart(2, '0')}`;
        if (S.workouts.some(x => x.id === id)) continue;
        // ta pati treniruotė jau įrašyta programoje (±15 min) – nedubliuojam
        if (S.workouts.some(x => x.date === date && x.start && Math.abs(toMin(x.start) - toMin(start)) <= 15)) continue;
        const dur = Math.max(1, Math.round((+w.duration || (new Date(w.endDate) - t0) / 1000) / 60)), type = HC_SPORT[w.workoutType] || 'other';
        const o = {id, date, start, duration: dur, secs: Math.round(+w.duration || dur * 60), type, source: 'hc', srcName: w.sourceName || '', feel: 'ok', exercises: []};
        if (+w.totalEnergyBurned) o.kcal = Math.round(+w.totalEnergyBurned); if (+w.totalDistance) o.distance = Math.round(+w.totalDistance);
        if (set.hr) try { const {samples: hr = []} = await H.queryAggregated({dataType: 'heartRate', startDate: w.startDate, endDate: w.endDate, bucket: 'hour', aggregation: 'average'}); const v = hr.map(x => +x.value).filter(Boolean); if (v.length) o.hr = Math.round(sum(v) / v.length); } catch (e) {}
        S.workouts.push(o); changed = true; HC.src = w.sourceName || HC.src;
      }
    }
    HC.last = nowHM(); if (changed) commit();
  } catch (e) { if (DEV) console.warn('hcSync', e); }
}
// GPS fone: programėlėje – natyvus sekimas su pranešimu (veikia ir užrakinus ekraną); naršyklėje – tik kol atidaryta
let NAT_WATCH = null;
async function natGpsStart(onPos) {
  const B = natPlugin('BackgroundGeolocation'); if (!B) return false;
  try {
    const cb = (loc, err) => { if (err) { if (err.code === 'NOT_AUTHORIZED') info('Reikia vietos leidimo', 'Leisk programėlei naudoti vietą („Visada“ arba „Kai naudojama“), kad maršrutas būtų įrašomas.'); return; } if (loc) onPos({coords: {latitude: loc.latitude, longitude: loc.longitude, altitude: loc.altitude, accuracy: loc.accuracy}, timestamp: loc.time || Date.now()}); };
    NAT_WATCH = await B.addWatcher({backgroundMessage: 'Maršrutas įrašomas', backgroundTitle: 'Life Schedule – sportas vyksta', requestPermissions: true, stale: false, distanceFilter: 3}, cb);
    return true;
  } catch (e) { return false; }
}
function natGpsStop() { const B = natPlugin('BackgroundGeolocation'); if (B && NAT_WATCH != null) try { B.removeWatcher({id: NAT_WATCH}); } catch (e) {} NAT_WATCH = null; }
function spWatch() {
  const s = sportSet(), hc = s.hc || {}, nat = !!window.LSNative;
  const st = a => `<span class="ok">${nat ? a : ''}</span>`;
  return `${spBack('Laikrodis ir žingsniai')}
    <button class="sp-conn" data-a="${nat ? 'spHcOpen' : 'spNeedApp'}"><span class="sp-fi">${ic('sphone')}</span><span>Telefono žingsniai<small>Skaičiuoja pats telefonas</small></span>${st(HC.ok ? 'Įjungta' : 'Įjungti')}</button>
    <button class="sp-conn" data-a="${nat ? 'spHcOpen' : 'spNeedApp'}"><span class="sp-fi">${ic('swatch')}</span><span>Laikrodis<small>${HC.src ? `${esc(HC.src)}${HC.last ? ' · ' + HC.last : ''}` : 'Neprijungtas'}</small></span>${st(HC.src ? 'Veikia' : '')}</button>
    <button class="sp-link card" data-a="spWatchAdd">${ic('plus', 'sm')}<span>Pridėti kitą laikrodį ar programą</span>${ic('arrow', 'sm')}</button>
    <div class="sp-q">Ką imti</div><section class="card sp-card">${[['steps', 'Žingsniai'], ['workouts', 'Treniruotės'], ['hr', 'Pulsas'], ['sleep', 'Miegas']].map(([k, l]) => `<button class="sp-set" data-a="spHcT" data-k="${k}"><span>${l}</span><span class="tg ${hc[k] ? '' : 'off'}"></span></button>`).join('')}</section>`;
}
A.spHcT = d => { const s = sportSet(); S.sportSet = {...s, hc: {...s.hc, [d.k]: !s.hc[d.k]}}; commit(); };
A.spWatchAdd = () => spSheet(`<h3>Pridėti laikrodį</h3>${['Garmin Connect', 'Samsung Health', 'Fitbit / Google', 'Xiaomi Mi Fitness', 'Amazfit (Zepp)', 'Polar Flow', 'Withings', 'Kita programa'].map(n => `<button class="sp-set" data-a="${window.LSNative ? 'spHcOpen' : 'spNeedApp'}"><span>${n}</span><span class="v">${HC.src && HC.src.startsWith(n.split(' ')[0]) ? 'Prijungta' : '›'}</span></button>`).join('')}`, 'tall');
A.spNeedApp = () => info('Reikia programėlės', 'Žingsniai ir laikrodis jungiasi per Health Connect – tai veikia Life Schedule programėlėje telefone (Android).');
A.spHcOpen = async () => { if (!HC.ok) return hcConnect(); window.LSNative?.openHealthConnect?.(); };

// ================= LAIKAS =================
function vTime() {
  const T = UI.time, mode = T.mode, p = S.profile;
  let from, n, title;
  if (mode === 'day') { from = T.date; n = 1; title = fmtDateDow(T.date); }
  else if (mode === 'week') { from = weekStart(T.date); n = 7; title = `${fmtDate(from)} – ${fmtDate(addDays(from, 6))}`; }
  else { from = monthStart(T.date); n = daysInMonth(T.date); title = `${MONTHS[parseD(T.date).getMonth()]} ${parseD(T.date).getFullYear()}`; }
  const days = range(from, n), per = {};
  let prod = 0, screen = 0;
  const bars = days.map(d => { const t = dayTime(d); prod += t.prod; screen += t.screen; for (const [c, m] of Object.entries(t.per)) per[c] = (per[c] || 0) + m;
    return {label: mode === 'week' ? DOW[dow(d) - 1] : parseD(d).getDate() + '', segs: Object.entries(t.per).sort((a, b) => cat(b[0]).type - cat(a[0]).type).map(([c, m]) => ({v: m, color: cat(c).color, name: cat(c).name})), click: {a: 'timeDay', d}}; });
  const prevFrom = mode === 'day' ? addDays(from, -1) : mode === 'week' ? addDays(from, -7) : monthStart(addDays(from, -1));
  const prev = periodStats(prevFrom, mode === 'month' ? daysInMonth(prevFrom) : n);
  const segs = Object.entries(per).sort((a, b) => b[1] - a[1]).map(([c, m]) => ({v: m, color: cat(c).color, name: cat(c).name, c}));
  const delta = (a, b, good) => { if (!b) return ''; const x = round((a - b) / 60, 1); if (!x) return ''; const up = x > 0; return `<em class="${up === good ? 'brc' : 'mu'}">${up ? '+' : '−'}${String(Math.abs(x)).replace('.', ',')} val</em>`; };
  const sleepBars = days.map(d => { const s = sleepOn(d); return {label: mode === 'week' ? DOW[dow(d) - 1] : parseD(d).getDate() + '', segs: [{v: s ? round(sleepMinutes(s) / 60, 1) : 0, color: 'var(--s3)', name: 'miegas val'}]}; });
  return `<div class="toolbar"><div class="seg">${[['day', 'Diena'], ['week', 'Savaitė'], ['month', 'Mėnuo']].map(([m, l]) => `<button class="${mode === m ? 'on' : ''}" data-a="timeMode" data-m="${m}">${l}</button>`).join('')}</div>
    <div class="navd">${btn('‹', 'timeNav', {n: -1}, 'sm')}<b>${title}</b>${btn('›', 'timeNav', {n: 1}, 'sm')}</div>${btn('+ Ką veikiau', 'addLog', {date: mode === 'day' ? T.date : today()}, 'primary sm')}</div>
  ${(() => { const from = addDays(today(), -30), cnt = {}; for (const t of S.timelog) if (t.date >= from) cnt[t.cat] = (cnt[t.cat] || 0) + 1;
    const top = [...S.categories].sort((a, b) => (cnt[b.id] || 0) - (cnt[a.id] || 0)).slice(0, 6);
    return `<section class="card td-card"><h2>Laikmatis <small>${S.timer ? 'veikia' : 'paspausk, ką veiki'}</small></h2><div class="tm-pills">${top.map(c => `<button class="${S.timer?.cat === c.id ? 'on' : ''}" data-a="${S.timer?.cat === c.id ? 'timerStop' : 'timerStart'}" data-cat="${c.id}">${catDot(c)}${esc(c.name)}</button>`).join('')}<button class="all" data-a="timerStart">visos ${S.categories.length} ›</button></div></section>`; })()}
  <div class="stats3"><div><b class="brc">${fmtH(prod)}</b><small>produktyvu ${delta(prod, prev.prod, true)}</small></div><div><b>${fmtH(screen)}</b><small>ekranai ir serialai ${delta(screen, prev.screen, false)}</small></div><div><b>${n > 1 ? fmtH(prod / Math.max(1, days.filter(d => d <= today()).length)) : fmtH(prod)}</b><small>produktyvu per dieną (vid.)</small></div></div>
  <div class="grid2"><div>
    ${n > 1 ? card('Laikas pagal dienas', svgBars(bars, {h: 220, fmt: v => round(v / 60, 1) + 'h'}) + '') : card('Dienos laiko juosta', timeline(T.date, {scale: 0.6}))}
    ${card('Miegas', n > 1 ? svgBars(sleepBars, {h: 150, goal: +p.sleepGoal || 8, fmt: v => round(v, 1)}) : (sleepOn(T.date) ? `<p>${sleepOn(T.date).bed} → ${sleepOn(T.date).wake} · <b>${round(sleepMinutes(sleepOn(T.date)) / 60, 1)} val</b></p>` : empty('Neįrašyta')), btn('+ Miegas', 'addSleep', {}, 'sm'))}
  </div><div>
    ${(() => { const tot = sum(segs.map(x => x.v)) || 1; return card(`Kur dingo laikas <small class="mu">${fmtH(sum(segs.map(x => x.v)))} iš viso</small>`, segs.length ? `<div class="tm-stk">${segs.map(x => `<i style="flex:${x.v};background:${x.color}"></i>`).join('')}</div>${segs.map(x => `<div class="tm-lg">${catDot(cat(x.c))}<span>${esc(x.name)}</span><b>${fmtDur(x.v)}</b><small>${Math.round(x.v / tot * 100)}%</small></div>`).join('')}` : empty('Dar nieko neįrašyta')); })()}
    ${mode === 'day' ? card('Įrašai', timelogOn(T.date).map(t => `<div class="li click" data-a="editLog" data-id="${t.id}">${catDot(cat(t.cat))} <b>${t.start}–${t.end}</b> ${esc(cat(t.cat).name)} <small>${esc(t.note || '')}</small></div>`).join('') || empty('Nėra rankinių įrašų')) : ''}
  </div></div>`;
}
A.timeMode = d => { UI.time.mode = d.m; render(); };
A.timeNav = d => { const T = UI.time; T.date = T.mode === 'day' ? addDays(T.date, +d.n) : T.mode === 'week' ? addDays(T.date, 7 * d.n) : (() => { const x = parseD(T.date); x.setDate(1); x.setMonth(x.getMonth() + +d.n); return ymd(x); })(); render(); };
A.timeDay = d => { UI.view = 'time'; UI.time = {mode: 'day', date: d.d}; render(); };
function logForm(t) {
  return `<div class="row">${fld('Data', inp('date', t.date, 'date'))}${fld('Nuo', inp('start', t.start, 'time', 'required'))}${fld('Iki', inp('end', t.end, 'time', 'required'))}</div>
  ${fld('Ką veikei?', `<div class="catgrid sm radio">${S.categories.map(c => `<label class="catbtn" style="--c:${c.color}"><input type="radio" name="cat" value="${c.id}" ${t.cat === c.id ? 'checked' : ''} required>${catDot(c)}<span>${esc(c.name)}</span></label>`).join('')}</div>`)}
  ${fld('Pastaba', inp('note', t.note || '', 'text', 'placeholder="pvz. žiūrėjau 3 serijas"'))}`;
}
// Jei veikla per vidurnaktį – padalinam į dvi dienas
function pushLog(o) {
  if (toMin(o.end) <= toMin(o.start) && o.end !== '00:00') { S.timelog.push({id: uid(), ...o, end: '00:00'}); S.timelog.push({id: uid(), ...o, date: addDays(o.date, 1), start: '00:00'}); }
  else S.timelog.push({id: uid(), ...o});
}
A.addLog = d => { const st = d.start || fromMin(Math.round((nowMin() - 60) / 5) * 5); modal('Ką veikiau?', logForm({date: d.date || today(), start: st, end: fromMin(toMin(st) + 60)}), o => { if (!o.cat || o.start === o.end) return false; pushLog(o); commit(); }, {noFocus: true}); };
A.editLog = d => { const t = S.timelog.find(x => x.id === d.id); if (!t) return; modal('Redaguoti įrašą', logForm(t), o => { S.timelog = S.timelog.filter(x => x !== t); pushLog(o); commit(); }, {extra: btn('🗑', 'delLog', {id: t.id}, 'danger sm')}); };
A.delLog = d => { S.timelog = S.timelog.filter(t => t.id !== d.id); A.closeModal(); commit(); };
A.addSleep = () => {
  const s = sleepOn(today()) || {date: today(), bed: S.profile.bed, wake: S.profile.wake, q: 3};
  modal('Miegas', `<p class="hint">Data – diena, kurią pabudai.</p><div class="row">${fld('Data', inp('date', s.date, 'date'))}${fld('Užmigau', inp('bed', s.bed, 'time'))}${fld('Pabudau', inp('wake', s.wake, 'time'))}</div>
    ${fld('Kokybė', `<div class="emo">${['😫', '😕', '😐', '🙂', '😁'].map((e, i) => `<label><input type="radio" name="q" value="${i + 1}" ${+s.q === i + 1 ? 'checked' : ''}><span>${e}</span></label>`).join('')}</div>`)}`, o => {
    S.sleep = S.sleep.filter(x => x.date !== o.date); S.sleep.push({date: o.date, bed: o.bed, wake: o.wake, q: +o.q || 3}); commit();
    const h = sleepMinutes(o) / 60; toast(h >= (+S.profile.sleepGoal || 8) - 0.5 ? `😴 ${round(h, 1)} val – puikiai išsimiegojai!` : `😴 ${round(h, 1)} val – šiandien gulkis anksčiau`, h >= 7 ? 'good' : '');
  }, {noFocus: true});
};

// ================= PROGRESAS =================
const fmtKg = v => v == null || v === '' || isNaN(+v) ? '–' : String(round(+v, 1)).replace('.', ',');
function vProgress() {
  const p = S.profile, tg = targets(), g = gamification(), tab = UI.progTab || 'over';
  const ws = [...S.weights].sort((a, b) => a.date < b.date ? -1 : 1), tracked = ws.length > 0 || sportOn() || foodOn();
  const d0 = ws.length ? ws[0].date : today();
  const pts = ws.map(w => [diffDays(d0, w.date), +w.kg, fmtDate(w.date)]);
  const waist = ws.filter(w => +w.waist).map(w => [diffDays(d0, w.date), +w.waist, fmtDate(w.date)]);
  const series = [{points: pts, color: 'var(--br)', area: true}];
  if (+p.targetWeight && pts.length) series.push({points: [[pts[0][0], +p.targetWeight], [pts[pts.length - 1][0] || 1, +p.targetWeight]], color: 'var(--s3)', dashed: true, dots: false, width: 1.5});
  const xl = pts.length ? [[pts[0][0], fmtDate(ws[0].date)], [pts[pts.length - 1][0], fmtDate(ws[ws.length - 1].date)]] : [];
  const cw = currentWeight(), start = ws.length >= 2 ? +ws[0].kg : (+p.startWeight || cw), trend = weightTrend();
  const toGo = +p.targetWeight && cw ? round(cw - +p.targetWeight, 1) : null;
  const eta = trend && trend < -0.05 && toGo > 0 ? addDays(today(), Math.round(toGo / -trend * 7)) : null;
  const wsT = weekStart(today()), thisW = periodStats(wsT, 7), lastW = periodStats(addDays(wsT, -7), 7);
  const ms = monthStart(today()), thisM = periodStats(ms, daysInMonth(ms)), pm = monthStart(addDays(ms, -1)), lastM = periodStats(pm, daysInMonth(pm));
  const scores = range(addDays(today(), -29), 30).map(d => { const sc = dayScore(d); return {label: parseD(d).getDate() + '', segs: [{v: sc ? sc.score : 0, color: scoreColor(sc?.score), name: 'balas'}], click: {a: 'calDay', d}}; });
  const doneW = S.checkins.some(c => c.type === 'week' && (c.period || periodKey('week', c.date)) === periodKey('week', today())), doneM = S.checkins.some(c => c.type === 'month' && (c.period || periodKey('month', c.date)) === periodKey('month', today()));
  const tabs = [['over', 'Apžvalga'], ...(tracked ? [['body', 'Kūnas']] : []), ['ach', 'Pasiekimai']];
  const seg = `<div class="mf-top"><div class="seg mf-seg">${tabs.map(([v, l]) => `<button class="${tab === v ? 'on' : ''}" data-a="progTab" data-v="${v}">${l}</button>`).join('')}</div></div>`;
  const diff = start && cw ? round(cw - start, 1) : null;
  const tempo = trend == null ? 'Pasisverk kelis kartus – pamatysi tempą.' : trend < -0.05 ? `Krenti apie ${fmtKg(-trend)} kg per savaitę – ${toGo > 0 ? `tikslą pasieksi ~${fmtDate(eta || today())}` : 'tikslas pasiektas!'}` : trend > 0.05 ? `Svoris kyla apie ${fmtKg(trend)} kg per savaitę.` : 'Svoris laikosi stabiliai.';
  const checks = `<section class="card td-card"><h2>Patikrinimai</h2>
    <div class="pg-ck"><span><b>Savaitės patikrinimas</b><small>${doneW ? 'Šią savaitę jau atlikta' : 'Pasisverk ir pažiūrėk, kaip sekėsi'}</small></span>${doneW ? '<em class="brc">Atlikta ✓</em>' : btn('Pradėti', 'checkin', {t: 'week'}, 'sm primary')}</div>
    <div class="pg-ck"><span><b>Mėnesio patikrinimas</b><small>${doneM ? 'Šį mėnesį jau atlikta' : 'Mėnesio apžvalga ir tikslai'}</small></span>${doneM ? '<em class="brc">Atlikta ✓</em>' : btn('Pradėti', 'checkin', {t: 'month'}, 'sm')}</div></section>`;
  const hist = `<section class="card td-card"><h2>Patikrinimų istorija</h2>${S.checkins.length ? [...S.checkins].reverse().map(c => `<div class="wl-row" data-a="viewCheckin" data-id="${c.id}"><b>${fmtDate(c.date)}</b>${c.mood ? daigelis(c.mood) : ''}<span>${c.type === 'week' ? 'Savaitės' : 'Mėnesio'} patikrinimas${c.weight ? ` · ${fmtKg(c.weight)} kg` : ''}${c.focus ? `<small>${esc(String(c.focus).slice(0, 60))}</small>` : ''}</span></div>`).join('') : empty('Dar nebuvo patikrinimų.')}</section>`;
  const over = `<div class="mf-cols"><div>${checks}<section class="card td-card"><h2>Dienos balas per 30 d.</h2>${svgBars(scores, {h: 150})}</section>
    <section class="card td-card"><h2>${g.level} lygis <small>${g.xp} XP · iki kito ${g.next - g.xp}</small></h2><div class="pbar" style="height:10px"><i style="width:${(g.xp - g.cur) / Math.max(1, g.next - g.cur) * 100}%"></i></div></section></div>
    <div>${reportCard('Ši savaitė ir praeita', thisW, lastW)}${reportCard('Šis mėnuo ir praeitas', thisM, lastM)}${hist}</div></div>`;
  const body = !tracked ? '' : `<div class="mf-cols"><div><div class="card mf-sum"><div class="pg-big"><b>${fmtKg(cw)}</b><span>kg dabar</span>${btn('Pasisverti', 'addWeight', {}, 'primary sm')}</div>
      <div class="mf-sumt"><div><b class="${diff < 0 ? 'brc' : ''}">${diff == null ? '–' : (diff > 0 ? '+' : '') + fmtKg(diff)}</b><span>kg nuo pradžios</span></div><div><b>${toGo != null ? fmtKg(Math.max(0, toGo)) : '–'}</b><span>kg iki tikslo${eta ? ` · ~${fmtDate(eta)}` : ''}</span></div><div><b>${trend != null ? (trend > 0 ? '+' : '') + String(round(trend, 2)).replace('.', ',') : '–'}</b><span>kg/sav. tendencija</span></div></div>
      <div class="mf-say">${daigelis(4)}<p>${tempo}</p></div></div>
    <section class="card td-card"><h2>Svoris</h2>${pts.length ? svgLine(series, {xLabels: xl, h: 220}) : empty('Dar nėra svorio įrašų')}</section></div>
    <div><section class="card td-card"><h2>Liemens apimtis</h2>${waist.length ? svgLine([{points: waist, color: 'var(--s2)', area: true}], {h: 160}) : empty('Sverdamasis įrašyk ir liemens apimtį (cm, ties bambos aukščiu).')}</section>
    <section class="card td-card"><h2>Svorio įrašai</h2>${ws.length ? [...ws].reverse().slice(0, 10).map(w => `<div class="tm-lg"><span>${fmtDate(w.date)}</span><b>${fmtKg(w.kg)} kg</b>${w.waist ? `<small>${fmtKg(w.waist)} cm</small>` : '<small></small>'}<button class="x" data-a="delWeight" data-date="${w.date}">✕</button></div>`).join('') : empty('Nėra įrašų')}</section></div></div>`;
  const ach = `<section class="card td-card"><h2>Ženkliukai <small>${g.badges.filter(x => x[3]).length} iš ${g.badges.length}</small></h2><div class="pg-badges">${g.badges.map(([, n, dsc, ok]) => `<div class="pg-b ${ok ? 'on' : ''}" title="${esc(dsc)}"><i>${ok ? ic('spark') : ic('lock')}</i><b>${esc(n)}</b><small>${esc(dsc)}</small></div>`).join('')}</div></section>`;
  const noBody = !tracked ? `<div class="quiet"><span class="qi">${daigelis(4)}</span><span>Nori sekti svorį?<small>Pasisverk – atsiras skirtukas „Kūnas“ su grafiku</small></span>${btn('Pasisverti', 'addWeight', {}, 'sm')}</div>` : '';
  return seg + (tab === 'body' && tracked ? body : tab === 'ach' ? ach : over + noBody);
}
A.progTab = d => { UI.progTab = d.v; render(); };
function reportCard(title, a, b) {
  const row = (label, va, vb, fmt, goodUp) => { let ar = ''; if (va != null && vb != null && Math.abs(va - vb) > 0.01) { const up = va > vb; ar = `<em class="${up === goodUp ? 'brc' : 'mu'}">${up ? '↑' : '↓'}</em>`; } return `<tr><td>${label}</td><td><b>${va != null ? fmt(va) : '–'}</b> ${ar}</td><td>${vb != null ? fmt(vb) : '–'}</td></tr>`; };
  const pd = x => x.days ? x.prod / x.days : null, sd = x => x.days ? x.screen / x.days : null;
  return card(title, `<table class="tbl rep"><thead><tr><th></th><th>Dabar</th><th>Anksčiau</th></tr></thead><tbody>
    ${row('Produktyvu / d.', pd(a), b.days ? pd(b) : null, v => fmtH(v), true)}
    ${row('Ekranai / d.', sd(a), b.days ? sd(b) : null, v => fmtDur(v), false)}
    ${row('Miegas (vid.)', a.avgSleep, b.avgSleep, v => String(round(v / 60, 1)).replace('.', ',') + ' val', true)}
    ${row('Treniruotės', a.workouts, b.workouts, v => v, true)}
    ${row('Kalorijos (vid.)', a.avgKcal, b.avgKcal, v => Math.round(v), false)}
    ${row('Baltymai (vid.)', a.avgProtein, b.avgProtein, v => Math.round(v) + ' g', true)}
    ${row('Atliktos užduotys', a.tasksDone, b.tasksDone, v => v, true)}
    ${row('Dienos balas (vid.)', a.avgScore, b.avgScore, v => Math.round(v), true)}
    ${row('Svoris (pab.)', a.weightEnd, b.weightEnd, v => fmtKg(v) + ' kg', false)}</tbody></table>
    ${a.spendTotal ? `<p class="hint">Maistui pagal čekius: <b>${a.spendTotal.toFixed(2).replace('.', ',')} €</b>${a.snackSpend ? `, iš jų užkandžiams ${a.snackSpend.toFixed(2).replace('.', ',')} € (${Math.round(a.snackSpend / a.spendTotal * 100)}%)` : ''}.</p>` : ''}`);
}
A.addWeight = () => {
  const last = [...S.weights].sort((a, b) => a.date < b.date ? -1 : 1).pop();
  modal('Svoris', `<p class="hint">Geriausia sverti ryte, po tualeto, prieš valgį – kas savaitę tą pačią dieną.</p><div class="row">${fld('Data', inp('date', today(), 'date'))}${fld('Svoris (kg)', inp('kg', last?.kg || S.profile.startWeight, 'number', 'step="0.1" required'))}${fld('Liemuo (cm, nebūtina)', inp('waist', '', 'number', 'step="0.5"'))}</div>`, o => {
    const prev = currentWeight();
    S.weights = S.weights.filter(w => w.date !== o.date); S.weights.push({date: o.date, kg: round(+String(o.kg).replace(',', '.'), 1), waist: +o.waist ? round(+o.waist, 1) : null});
    if (!S.profile.startWeight) S.profile.startWeight = +o.kg;
    commit(); const dlt = round(+o.kg - prev, 1);
    toast(dlt < 0 ? `📉 −${-dlt} kg nuo praeito karto! Šaunu!` : dlt > 0 ? `+${dlt} kg – nieko tokio, žiūrim į tendenciją 💪` : 'Įrašyta ✓', dlt < 0 ? 'good' : '');
    if (dlt < 0) confetti();
  });
};
A.delWeight = d => { S.weights = S.weights.filter(w => w.date !== d.date); commit(); };
// Kada priminti apie patikrinimą (pagal nustatymą); atlikti galima bet kurią laikotarpio dieną
function checkinDue() {
  const t = today(), freq = S.settings.review || 'week';
  if (freq === 'off') return null;
  const used = S.timelog.length + S.meals.length + S.sleep.length + S.tasks.length + S.workouts.length;
  const done = type => S.checkins.some(c => c.type === type && (c.period || periodKey(c.type, c.date)) === periodKey(type, t));
  if (parseD(t).getDate() <= 7 && !done('month') && used >= 20) return 'month';
  if (freq === 'week' && dow(t) >= 5 && !done('week') && used >= 5) return 'week';
  return null;
}
// Patikima data: iš serverio (kad nebūtų galima apgauti pakeitus laikrodį įrenginyje)
async function trustedDate() {
  try {
    const j = cloudOn() ? await cloudFn({action: 'now'}) : await (await fetch('/api/now', {cache: 'no-store'})).json();
    if (j && j.now) return {date: zonedParts(Date.parse(j.now)).date, verified: true};
  } catch (e) {}
  return {date: today(), verified: false};
}
// Draugiški pasiūlymai – be priekaištų, tik jei kažkas iš tikro krenta į akis
function friendlyTips(st, prev) {
  const tips = [], p = S.profile, g = +p.sleepGoal || 8;
  if (st.avgSleep != null) {
    const h = round(st.avgSleep / 60, 1);
    if (h < g - 1) tips.push(['😴', `Vidutiniškai miegojai ${h} val. Jei jautiesi pavargęs – gal pavyktų porą vakarų atsigulti kiek anksčiau?`]);
    else if (h > 9.5) tips.push(['🛌', `Miegojai vidutiniškai ${h} val. Jei tai poilsis – puiku. Jei vis tiek trūksta energijos, gal padėtų trumpas pasivaikščiojimas dieną.`]);
  }
  const wakes = S.sleep.filter(x => x.date >= addDays(today(), -st.days)).map(x => toMin(x.wake));
  if (wakes.length >= 4) { const m = sum(wakes) / wakes.length, sd = Math.sqrt(sum(wakes.map(x => (x - m) ** 2)) / wakes.length); if (sd > 90) tips.push(['⏰', `Kėlimosi laikas gana skirtingas (±${round(sd / 60, 1)} val.). Pastovesnis kėlimasis dažnai padeda jaustis žvaliau – jei tau tai aktualu.`]); }
  if (prev.screen > 0 && st.screen > prev.screen * 1.3 && st.screen - prev.screen > 120) tips.push(['📺', `Ekranams šį kartą skirta daugiau nei anksčiau (+${round((st.screen - prev.screen) / 60, 1)} val.). Jei norisi – gali pabandyti vieną vakarą be serialų.`]);
  const late = S.tasks.filter(t => !t.done && t.due && t.due < today()).length;
  if (late >= 2) tips.push(['📌', `Turi ${late} neatliktas užduotis su praėjusiu terminu – gal verta peržiūrėti, ar jie dar aktualūs?`]);
  if (sportOn()) { const goal = (+p.workoutsPerWeek || 3) * st.days / 7; if (st.workouts < goal * 0.5) tips.push(['💪', `Treniruočių buvo ${st.workouts} iš ~${Math.round(goal)} planuotų. Gal kitam laikotarpiui susiplanuoti trumpesnes?`]); }
  if (foodOn()) { const logged = st.kcal.length; if (logged < st.days * 0.5) tips.push(['🍽️', `Maistą įrašei ${logged} d. iš ${st.days}. Net ir apytikriai įrašai padeda matyti vaizdą.`]); }
  return tips.slice(0, 3);
}
function highlights(st, prev) {
  const h = [];
  if (st.prod) h.push([fmtH(st.prod), 'produktyvaus laiko']);
  if (st.avgSleep != null) h.push([round(st.avgSleep / 60, 1) + ' val', 'vid. miego']);
  if (st.tasksDone) h.push([st.tasksDone, 'atliktos užduotys']);
  if (sportOn() || st.workouts) h.push([st.workouts, 'treniruotės']);
  if (foodOn() && st.avgKcal) h.push([Math.round(st.avgKcal), 'vid. kcal']);
  if (st.screen) h.push([fmtH(st.screen), 'ekranams']);
  return h;
}
A.checkin = async d => {
  const type = d.t, isW = type === 'week', td = await trustedDate(), key = periodKey(type, td.date);
  const existing = S.checkins.find(c => c.type === type && (c.period || periodKey(c.type, c.date)) === key);
  if (existing) {
    const nextD = isW ? addDays(weekStart(td.date), 7) : (() => { const x = parseD(td.date); x.setDate(1); x.setMonth(x.getMonth() + 1); return ymd(x); })();
    modal(isW ? '🪞 Savaitės patikrinimas' : '📆 Mėnesio patikrinimas', `<div class="okbox">✅ ${isW ? 'Šios savaitės' : 'Šio mėnesio'} patikrinimą jau atlikai (${fmtDate(existing.date)}). Kitas – nuo ${fmtDate(nextD)}</div><div class="choice row">${btn('Peržiūrėti', 'viewCheckin', {id: existing.id}, 'primary')}</div>`);
    return;
  }
  const n = isW ? 7 : 30, from = addDays(td.date, -(n - 1)), st = periodStats(from, n), prev = periodStats(addDays(from, -n), n);
  const tips = friendlyTips(st, prev), hl = highlights(st, prev), body = sportOn() || foodOn();
  const emo = name => `<div class="emo">${['😫', '😕', '😐', '🙂', '😁'].map((e, i) => `<label><input type="radio" name="${name}" value="${i + 1}" ${i === 2 ? 'checked' : ''}><span>${e}</span></label>`).join('')}</div>`;
  modal(isW ? '🪞 Tavo savaitė' : '📆 Tavo mėnuo', `
    ${hl.length ? `<div class="rvhl">${hl.map(([v, l]) => `<div><b>${v}</b><small>${l}</small></div>`).join('')}</div>` : ''}
    ${motivation().slice(0, 2).map(m => `<p class="${m.good ? 'good' : ''}">${m.t}</p>`).join('')}
    ${tips.length ? `<h4>Mintys</h4>${tips.map(([e, t]) => `<div class="tip"><span>${e}</span><div>${t}</div></div>`).join('')}<p class="hint">Tai tik pasiūlymai – nieko daryti nebūtina 🙂</p>` : ''}
    <details class="more"><summary>Palyginti su ${isW ? 'praeita savaite' : 'praeitu mėnesiu'}</summary>${reportCard('', st, prev)}</details>
    ${body ? `<div class="row">${fld('Svoris dabar (kg)', inp('weight', currentWeight() || '', 'number', 'step="0.1"'))}${fld('Liemuo (cm)', inp('waist', '', 'number', 'step="0.5"'))}</div>` : ''}
    ${fld('Nuotaika', emo('mood'))}${fld('Energija', emo('energy'))}
    ${fld('Kas pavyko? 🏆', `<textarea name="wins" rows="2"></textarea>`)}
    ${fld(isW ? 'Ką norėtum kitą savaitę? 🎯' : 'Ką norėtum kitą mėnesį? 🎯', inp('focus', '', 'text', 'placeholder="nebūtina"'))}
    ${td.verified ? '' : '<p class="hint">⚠️ Nepavyko patikrinti datos internete – patikrinimas išsaugomas, bet XP už jį neskaičiuojamas.</p>'}`, o => {
    S.checkins.push({id: uid(), type, date: td.date, period: key, verified: td.verified, weight: +o.weight || null, waist: +o.waist || null, mood: +o.mood, energy: +o.energy, wins: o.wins, focus: o.focus});
    if (+o.weight) { S.weights = S.weights.filter(w => w.date !== td.date); S.weights.push({date: td.date, kg: round(+String(o.weight).replace(',', '.'), 1), waist: +o.waist ? round(+o.waist, 1) : null}); }
    if (o.focus) S.notes.unshift({id: uid(), title: `🎯 ${o.focus}`, body: `${isW ? 'Savaitės' : 'Mėnesio'} tikslas nuo ${fmtDate(td.date)}.${o.wins ? `\n\nKas pavyko: ${o.wins}` : ''}`, updated: Date.now(), pinned: true});
    confetti(); toast(td.verified ? 'Išsaugota · +30 XP' : 'Išsaugota', 'good'); commit();
  }, {wide: true, submit: 'Išsaugoti'});
};
A.viewCheckin = d => { const c = S.checkins.find(x => x.id === d.id); modal(`${c.type === 'week' ? 'Savaitės' : 'Mėnesio'} patikrinimas · ${fmtDate(c.date)}`, `<div class="kv"><span>Svoris</span><b>${c.weight || '–'} kg</b><span>Liemuo</span><b>${c.waist || '–'} cm</b><span>Nuotaika / energija / produkt.</span><b>${[c.mood, c.energy, c.prod].map(v => ['', '😫', '😕', '😐', '🙂', '😁'][v] || '–').join(' ')}</b></div><h4>Kas pavyko</h4><p>${esc(c.wins) || '–'}</p><h4>Ką keisti</h4><p>${esc(c.improve) || '–'}</p><h4>Tikslas</h4><p>${esc(c.focus) || '–'}</p>`); };

// ================= UŽRAŠAI =================
const agoTxt = ts => { const m = Math.round((Date.now() - ts) / 60000); return m < 1 ? 'ką tik' : m < 60 ? `prieš ${m} min` : m < 1440 ? `prieš ${Math.round(m / 60)} val.` : fmtDate(new Date(ts).toISOString().slice(0, 10)); };
function vNotes() {
  const notes = [...S.notes].sort((a, b) => b.updated - a.updated), pinned = notes.filter(n => n.pinned), rest = notes.filter(n => !n.pinned);
  const cur = S.notes.find(n => n.id === UI.noteId) || notes[0];
  if (!notes.length) return `<div class="intro2">${daigelis(4, 'big')}<h2>Užrašai</h2><p>Užrašų dar nėra – mintys, idėjos, dienoraštis, sąrašai.</p>${btn(`${ic('plus', 'sm')} Naujas užrašas`, 'addNote', {}, 'primary')}</div>`;
  const cardN = n => `<div class="nt-card ${cur && n.id === cur.id ? 'on' : ''}" data-a="openNote" data-id="${n.id}"><b>${n.pinned ? `<span class="nt-pin">${ic('pin', 'sm')}</span>` : ''}${esc(n.title || 'Be pavadinimo')}</b><p>${esc((n.body || '').slice(0, 140)) || '<i>Tuščia</i>'}</p><small>${agoTxt(n.updated)}</small></div>`;
  return `<div class="nt ${UI.noteOpen ? 'open' : ''}"><div class="nt-list"><div class="nt-head">${btn(`${ic('plus', 'sm')} Naujas užrašas`, 'addNote', {}, 'primary sm')}</div>
      ${pinned.length ? `<div class="mf-grp">Prisegti</div>${pinned.map(cardN).join('')}<div class="mf-grp">Kiti</div>` : ''}${rest.map(cardN).join('')}</div>
    <div class="nt-ed">${cur ? `<div class="nt-bar"><button class="nt-back" data-a="closeNote">${ic('back', 'sm')} Užrašai</button><span class="sp"></span><button class="ib ${cur.pinned ? 'on' : ''}" data-a="pinNote" data-id="${cur.id}" title="${cur.pinned ? 'Atsegti' : 'Prisegti'}">${ic('pin', 'sm')}</button><button class="ib" data-a="delNote" data-id="${cur.id}" title="Ištrinti">${ic('trash', 'sm')}</button></div>
      <input class="ntitle" value="${esc(cur.title)}" data-note="title" placeholder="Pavadinimas">
      <textarea class="nbody" data-note="body" placeholder="Rašyk čia…">${esc(cur.body)}</textarea><small class="hint">Atnaujinta ${agoTxt(cur.updated)} · išsaugoma automatiškai</small>` : ''}</div></div>`;
}
A.closeNote = () => { UI.noteOpen = false; render(); };
A.addNote = () => { const n = {id: uid(), title: '', body: '', updated: Date.now()}; S.notes.push(n); UI.noteId = n.id; UI.noteOpen = true; commit(); setTimeout(() => $('.ntitle')?.focus(), 50); };
A.openNote = d => { UI.noteId = d.id; UI.noteOpen = true; render(); window.scrollTo(0, 0); };
A.pinNote = d => { const n = S.notes.find(x => x.id === d.id); n.pinned = !n.pinned; commit(); };
A.delNote = async d => { if (!await ask('Ištrinti užrašą?', '', {danger: true, icon: '🗑️', yes: 'Ištrinti'})) return; S.notes = S.notes.filter(n => n.id !== d.id); UI.noteId = null; UI.noteOpen = false; commit(); };

// ================= PROFILIS / NUSTATYMAI =================
// Profilio laukai – rodomi tik tie, kurių reikia pasirinktiems režimams
function profileFields(p, m = S.settings.modes) {
  const body = m.sport || m.food, req = body ? 'required' : '';
  return `<div class="row">${!body ? fld('Lytis', sel('sex', [['m', 'Vyras'], ['f', 'Moteris']], p.sex)) : ''}${fld('Vardas', inp('name', p.name, 'text', 'placeholder="kaip į tave kreiptis"'))}</div>
  ${body ? `<h4>🧍 Kūnas</h4>
  <div class="row">${fld('Lytis', sel('sex', [['m', 'Vyras'], ['f', 'Moteris']], p.sex))}${fld('Gimimo metai', inp('birthYear', p.birthYear, 'number', `min="1940" max="2015" ${req}`))}${fld('Ūgis (cm)', inp('height', p.height, 'number', `min="120" max="230" ${req}`))}${fld('Svoris (kg)', inp('weightNow', currentWeight() || p.startWeight, 'number', `step="0.1" ${req}`))}</div>
  <div class="row">${fld('Tikslas', sel('goalRate', [[0.5, '📉 Numesti svorio (~0,5 kg/sav.)'], [0.25, '📉 Numesti lėtai (~0,25 kg/sav.)'], [0.75, '📉 Numesti greičiau (~0,75 kg/sav.)'], [0, '⚖️ Palaikyti svorį'], [-0.25, '📈 Priaugti (raumenims)']], p.goalRate))}${fld('Tikslo svoris (kg, nebūtina)', inp('targetWeight', p.targetWeight, 'number', 'step="0.1"'))}
    ${fld('Aktyvumas kasdien', sel('activity', [[1.2, 'Daugiausia sėdžiu'], [1.375, 'Šiek tiek judu'], [1.55, 'Daug judu'], [1.725, 'Labai aktyvus']], p.activity))}</div>` : ''}
  <h4>⏰ Dienos ritmas</h4>
  <div class="row">${fld('Keliuosi', inp('wake', p.wake, 'time'))}${fld('Einu miegoti', inp('bed', p.bed, 'time'))}${fld('Miego tikslas (val)', inp('sleepGoal', p.sleepGoal, 'number', 'step="0.5"'))}</div>
  ${m.sport ? `<h4>💪 Sportas</h4>
  <div class="row">${fld('Treniruočių per savaitę', inp('workoutsPerWeek', p.workoutsPerWeek, 'number', 'min="1" max="7"'))}${fld('Treniruotės trukmė (min)', inp('workoutMin', p.workoutMin, 'number'))}${fld('Dušas ir susitvarkymas (min)', inp('showerMin', p.showerMin, 'number'))}${fld('Kelionė į sportą (min)', inp('travelMin', p.travelMin, 'number'))}</div>` : ''}
  <h4>🎯 Dienos tikslai</h4>
  <div class="row">${fld('Produktyvių valandų per dieną', inp('prodGoalH', p.prodGoalH, 'number', 'step="0.5"'))}${fld('Ekrano limitas per dieną (min)', inp('screenLimitMin', p.screenLimitMin, 'number'))}</div>`;
}
function saveProfile(o) {
  const w = +o.weightNow; delete o.weightNow;
  for (const k of Object.keys(o)) S.profile[k] = ['name', 'sex', 'wake', 'bed'].includes(k) ? o[k] : (o[k] === '' ? '' : +o[k]);
  if (w && w !== currentWeight()) { S.weights = S.weights.filter(x => x.date !== today()); S.weights.push({date: today(), kg: round(w, 1)}); }
  if (!S.profile.startWeight) S.profile.startWeight = w;
}
const CAT_PAL = {1: ['#ff8040', '#e8692c', '#ffa766', '#ffc699', '#f2a06f', '#ffd6bb'], 0: ['#7cc79a', '#5aa97c', '#a8dcb9', '#b9b1a8', '#8c857e', '#e0cda6'], '-1': ['#ef6a5a', '#f49a8c', '#c94f5a']};
function vSettings() {
  const tg = targets(), m = S.settings.modes, p = S.profile, cw = currentWeight();
  const row = (label, val, a, data = {}) => `<button class="st-row" data-a="${a}" ${Object.entries(data).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ')}><span>${label}</span><small>${val}</small>${ic('arrow', 'sm mu')}</button>`;
  const grp = (title, body) => `<h3 class="st-h">${title}</h3><section class="card st-card">${body}</section>`;
  const goal = {0.5: 'Numesti (~0,5 kg/sav.)', 0.25: 'Numesti lėtai', 0.75: 'Numesti greičiau', 0: 'Palaikyti svorį', '-0.25': 'Priaugti'}[String(p.goalRate)] || '–';
  const bt = barTabs();
  const left = grp('Kam naudoju programėlę', modeCards(m, 'setMode') + `<p class="hint">Gali keisti bet kada – įrašai niekur nedingsta.</p>`)
    + grp('Mano duomenys', row('Vardas', esc(p.name || '–'), 'profileEdit') + (m.sport || m.food ? row('Kūnas', `${p.height ? p.height + ' cm' : '–'} · ${cw ? fmtKg(cw) + ' kg' : '–'}${p.birthYear ? ' · ' + p.birthYear : ''}`, 'profileEdit') + row('Tikslas', `${goal}${+p.targetWeight ? ' · ' + fmtKg(p.targetWeight) + ' kg' : ''}`, 'profileEdit') : '')
      + row('Dienos ritmas', `${p.wake || '–'}–${p.bed || '–'} · miegas ${fmtNum(p.sleepGoal || 8)} val.`, 'profileEdit') + row('Dienos tikslai', `${fmtNum(p.prodGoalH || 6)} val. produktyviai · ekranas ${p.screenLimitMin || 90} min`, 'profileEdit'))
    + (m.sport || m.food ? grp('Tavo normos', tg.missing.length ? `<p class="hint" style="margin:0">Kalorijos ir baltymai apskaičiuojami <b>automatiškai</b>. Įrašyk: <b>${esc(tg.missing.join(', '))}</b>.</p>`
      : `<div class="kv"><span>Kalorijų tikslas</span><b>${tg.kcal} kcal</b><span>Sudegini per dieną</span><b>~${tg.tdee} kcal</b><span>Baltymai</span><b>${tg.protein} g / d.</b><span>Vanduo</span><b>~${fmtNum(tg.water)} l</b><span>KMI</span><b>${tg.bmi ? fmtNum(tg.bmi) : '–'}</b></div>`) : '');
  const app = grp('Programėlė', `<label class="st-row sw"><span>Tamsi tema</span><span class="switch"><input type="checkbox" data-c="themeSw" ${S.settings.theme !== 'light' ? 'checked' : ''}><span></span></span></label>
      <div class="st-row col"><span>Apatinė juosta <small>3 skirtukai telefone</small></span><div class="st-chips">${VIEWS.filter(v => v[0] !== 'settings').map(([id, i, l]) => `<button class="${bt.includes(id) ? 'on' : ''}" data-a="barTab" data-v="${id}">${l}</button>`).join('')}</div></div>
      <div class="st-row col">${fld('Laiko juosta', sel('tz', [['', `Įrenginys (${deviceTZ() || '?'})`], ...TZ_OPTS], S.settings.tz, 'data-set="tz"'))}${S.settings.tz && deviceTZ() && S.settings.tz !== deviceTZ() ? `<p class="hint">Įrenginys šiuo metu rodo <b>${esc(deviceTZ())}</b> (gali būti dėl VPN) – programėlė naudoja tavo pasirinktą.</p>` : ''}</div>
      <div class="st-row col">${fld('Priminti apie apžvalgą', sel('review', [['week', 'Kas savaitę ir mėnesį'], ['month', 'Tik kas mėnesį'], ['off', 'Nepriminti']], S.settings.review, 'data-set="review"'))}</div>`)
    + grp('Veiklų kategorijos', S.categories.map((c, i) => `<button class="st-row" data-a="editCat" data-i="${i}"><span>${catDot(c)}${esc(c.name)}</span><small>${{1: 'produktyvu', 0: 'neutralu', '-1': 'ekranai'}[String(c.type)] || ''}</small>${ic('arrow', 'sm mu')}</button>`).join('') + `<div class="choice row" style="margin-top:8px">${btn('+ Nauja kategorija', 'addCat', {}, 'sm')}</div>`)
    + grp('Priminimai', pushCardHtml())
    + (cloudOn() ? grp('Paskyra', `<div class="st-row"><span>Prisijungęs</span><small>${esc(Auth.user()?.email || '')}</small></div>${privacyCard()}<div class="choice row" style="margin-top:8px">${btn('Atsijungti', 'logout', {}, 'sm danger')}</div>`) : privacyCard())
    + grp('Atsiliepimai', `<p class="hint" style="margin-top:0">Radai klaidą ar turi idėją? Parašyk – pamatysiu.</p><div class="choice row">${btn('Parašyti', 'feedback', {}, 'sm primary')}${btn('Mano pokalbiai', 'myFeedback', {}, 'sm')}</div>`);
  const dev = DEV ? grp('Kūrėjo įrankiai <small class="mu">matai tik tu</small>', `<p class="hint" style="margin-top:0">Dirbi su bandomaisiais duomenimis – tikri nepaliečiami ir niekur nesiunčiami. Išjungus kūrėjo režimą viskas grįš.</p>
    <div class="choice row">${btn('Užpildyti bandomaisiais', 'devSeed', {}, 'sm')}${btn('Kopijuoti mano tikrus duomenis čia', 'devCopyReal', {}, 'sm')}${btn('Pradėti nuo nulio', 'devReset', {}, 'sm')}</div>
    <h4>Duomenys</h4><div class="choice row">${btn('Šių (bandomųjų) kopija', 'exportData', {}, 'sm')}${btn('Tikrų duomenų kopija', 'exportReal', {}, 'sm')}<label class="btn sm">Įkelti kopiją čia<input type="file" accept=".json" data-c="importData" hidden></label></div>
    <p class="hint">Rolė: ${ROLE} · ${cloudOn() ? 'debesis' : 'vietinis serveris'} · laiko juosta ${esc(appTZ())}</p>`) + versionsCard() + inboxCard() : '';
  return `<div class="mf-cols st"><div>${left}</div><div>${app}</div></div>${dev ? `<div class="st-dev">${dev}</div>` : ''}`;
}
A.profileEdit = () => openProfileModal(false);
A.barTab = d => { let t = barTabs(); if (t.includes(d.v)) { t = t.filter(x => x !== d.v); if (t.length < 1) return; } else { if (t.length >= 3) t = t.slice(1); t.push(d.v); }
  if (t.length < 3) { const fill = ['today', 'calendar', 'food', 'tasks', 'sport'].filter(x => !t.includes(x)); while (t.length < 3) t.push(fill.shift()); }
  S.settings.tabs = t; commit(); toast('Apatinė juosta pakeista'); };
A.editCat = d => { const c = S.categories[+d.i]; if (!c) return; UI.catType = String(c.type ?? 0); UI.catCol = c.color;
  const body = () => `${fld('Pavadinimas', inp('name', c.name, 'text', 'required maxlength="40"'))}<h4>Tipas</h4><div class="seg">${[['1', 'Produktyvu'], ['0', 'Neutralu'], ['-1', 'Ekranai']].map(([v, l]) => `<button type="button" class="${UI.catType === v ? 'on' : ''}" data-a="catType" data-v="${v}">${l}</button>`).join('')}</div>
    <h4>Spalva</h4><div class="st-pal">${CAT_PAL[UI.catType].map(col => `<button type="button" class="${UI.catCol === col ? 'on' : ''}" style="background:${col}" data-a="catCol" data-v="${col}"></button>`).join('')}</div>`;
  modal('Kategorija', body(), o => { c.name = (o.name || c.name).trim(); c.type = +UI.catType; c.color = UI.catCol; commit(); }, {extra: btn(ic('trash', 'sm'), 'delCat', {i: d.i}, 'danger sm')});
  UI.catBody = body; };
A.catType = d => { UI.catType = d.v; if (!CAT_PAL[d.v].includes(UI.catCol)) UI.catCol = CAT_PAL[d.v][0]; const f = $('#mform'), name = f?.name?.value; $('#mform').firstElementChild && (f.innerHTML = UI.catBody() + f.querySelector('.mfoot').outerHTML); if (name != null) f.name.value = name; };
A.catCol = d => { UI.catCol = d.v; document.querySelectorAll('.st-pal button').forEach(b => b.classList.toggle('on', b.dataset.v === d.v)); };
A.addCat = () => { S.categories.push({id: 'c_' + uid(), name: 'Nauja', emoji: '⭐', color: '#7cc79a', type: 0}); commit(); A.editCat({i: S.categories.length - 1}); };
A.delCat = async d => { A.closeModal(); if (!await ask('Ištrinti kategoriją?', 'Seni įrašai liks, bet be spalvos.', {danger: true, icon: '🗑️', yes: 'Ištrinti'})) return; S.categories.splice(+d.i, 1); commit(); };
A.exportData = () => download(`life-schedule-${today()}.json`, JSON.stringify(S, null, 1), 'application/json');
A.theme = () => { S.settings.theme = S.settings.theme === 'dark' ? 'light' : 'dark'; applyTheme(); commit(); };
function applyTheme() { document.documentElement.dataset.theme = S?.settings?.theme || 'dark'; }
function openProfileModal(first, modes) {
  const m = modes || S.settings.modes;
  modal(first ? '👋 Keli duomenys apie tave' : 'Profilis', profileFields(S.profile, m), o => { saveProfile(o); if (modes) S.settings.modes = {...modes}; commit(); if (first) { confetti(); toast('Viskas paruošta! 🚀', 'good'); } }, {wide: true, submit: first ? 'Pradėti 🚀' : 'Išsaugoti'});
}
// ===== Režimai: sportas / mityba / tik sekimas =====
const TZ_OPTS = [['Europe/Vilnius', 'Lietuva (Vilnius)'], ['Europe/Riga', 'Latvija'], ['Europe/Tallinn', 'Estija'], ['Europe/Helsinki', 'Suomija'], ['Europe/Stockholm', 'Švedija'], ['Europe/Oslo', 'Norvegija'], ['Europe/Copenhagen', 'Danija'], ['Europe/Warsaw', 'Lenkija'], ['Europe/Berlin', 'Vokietija'], ['Europe/London', 'Jungtinė Karalystė'], ['Europe/Dublin', 'Airija'], ['America/New_York', 'JAV (Niujorkas)']];
const MODE_INFO = [
  ['sport', 'gym', 'Sportas kasdienybėje', 'Pasiūlysiu, kada sportuoti, sudarysiu treniruotes, matysi progresą.'],
  ['food', 'food', 'Mityba', 'Kada ir ką valgyti pagal tikslą, receptai, kalorijos.'],
  ['track', 'clock', 'Tiesiog sekti, ką veikiu', 'Kalendorius, laikas, užduotys, miegas – be didelių patarimų.'],
];
function modeCards(m, action) {
  const track = !m.sport && !m.food;
  return `<div class="modes">${MODE_INFO.map(([k, e, n, dsc]) => { const on = k === 'track' ? track : m[k]; return `<button type="button" class="modec ${on ? 'on' : ''}" data-a="${action}" data-k="${k}"><span class="sp-fi">${ICONS[e] ? ic(e) : e}</span><b>${n}</b><small>${dsc}</small>${on ? '<i>✓</i>' : ''}</button>`; }).join('')}</div>`;
}
// Pirmas paleidimas
A.onboard = () => { UI.ob = {sport: false, food: false}; obModal(); };
function obModal() {
  modal('Sveikas! Kam naudosi Life Schedule?', `<p class="center">Gali pasirinkti kelis. Vėliau pakeisi nustatymuose.</p>${modeCards(UI.ob, 'obPick')}
    <div class="mfoot"><span class="sp"></span>${btn('Toliau →', 'obNext', {}, 'primary')}</div>`, null, {wide: true, noFocus: true});
}
A.obPick = d => { const m = UI.ob; if (d.k === 'track') { m.sport = false; m.food = false; } else m[d.k] = !m[d.k]; obModal(); };
A.obNext = () => { const m = {...UI.ob}; S.settings.onboarded = true; S.settings.modes = m; if (!S.settings.tz) S.settings.tz = deviceTZ(); openProfileModal(true, m); };
// Režimo keitimas nustatymuose
A.setMode = d => {
  const m = {...S.settings.modes};
  if (d.k === 'track') { m.sport = false; m.food = false; } else m[d.k] = !m[d.k];
  if ((m.sport || m.food) && !(S.profile.height && currentWeight())) { toast('Užpildyk kelis duomenis apie save'); openProfileModal(false, m); return; }
  S.settings.modes = m; commit(); toast(m.sport || m.food ? 'Režimas pakeistas ✓' : 'Dabar programėlė tik padės sekti, ką veiki');
};
A.enableMode = d => { const m = {...S.settings.modes, [d.k]: true}; if (!(S.profile.height && currentWeight())) { openProfileModal(false, m); return; } S.settings.modes = m; commit(); toast(d.k === 'sport' ? '💪 Sporto rekomendacijos įjungtos' : '🍽️ Mitybos rekomendacijos įjungtos', 'good'); };
A.introLog = d => { S.settings.intro[d.k] = 'log'; commit(); };
A.dismiss = d => { S.settings.dismissed[d.key] = today(); commit(); };
// Įvadas skilčiai, kai režimas išjungtas
function introCard(k) {
  const t = k === 'sport'
    ? ['Sportas', 'Čia gali įrašyti treniruotes ir matyti, kurias kūno dalis treniravai. Jei nori, programėlė pasiūlys, kada sportuoti, ir sudarys treniruotę.', 'Įjungti sporto rekomendacijas', 'Tik užsirašinėti treniruotes',
       ['Pasiūlys, kada geriausia sportuoti tavo dienoje', 'Sudarys treniruotę ir primins apleistas kūno dalis', 'Seks savaitės tikslą'], ['Treniruočių istorija ir kūno žemėlapis', 'Jokių tikslų ir pasiūlymų']]
    : ['Mityba', 'Čia gali įrašyti, ką valgai, laikyti receptus ir atsargas. Jei nori, programėlė pasiūlys, kada ir ką valgyti pagal tavo tikslą.', 'Įjungti mitybos rekomendacijas', 'Tik užsirašinėti, ką valgau',
       ['Apskaičiuos kalorijas ir baltymus pagal tavo tikslą', 'Pasiūlys, kada ir ką valgyti', 'Parinks receptus pagal biudžetą ir laiką'], ['Dienynas, receptai, atsargos ir pirkiniai', 'Jokių tikslų ir pasiūlymų']];
  return `<div class="intro2">${daigelis(4, 'big')}<h2>${t[0]}</h2><p>${t[1]}</p><div class="picks">
    <div class="pick main"><b>Su rekomendacijomis</b><ul>${t[4].map(x => `<li>${x}</li>`).join('')}</ul>${btn(t[2], 'enableMode', {k}, 'primary')}</div>
    <div class="pick"><b>Tik užsirašinėti</b><ul>${t[5].map(x => `<li>${x}</li>`).join('')}</ul>${btn(t[3], 'introLog', {k})}</div></div>
    <div class="later">Persigalvoti galėsi bet kada.</div></div>`;
}

// ================= NAUJA VERSIJA: pranešimas ir „Kas naujo“ =================
const verNotes = v => ((window.RELEASES || {}).versions || []).find(x => x.v === v)?.notes || '';
const verOverride = () => { try { return localStorage.getItem('ls_ver_override'); } catch (e) { return null; } };
async function checkNewVersion() {
  if (window.CLOUD?.test || verOverride()) return;
  let rel = null; try { rel = await (await fetch('releases.json', {cache: 'no-cache'})).json(); } catch (e) { return; }
  let pub = rel.stable;
  let info = null;
  if (cloudOn()) { try { const j = await (await fetch(`${CLOUD.url}/rest/v1/app_config?key=eq.stable&select=value`, {headers: {apikey: CLOUD.key}, cache: 'no-store'})).json(); if (j[0]?.value?.version) { pub = j[0].value.version; info = j[0].value; } } catch (e) {} }
  // tylus atnaujinimas – nieko nerodom; persikraunam tyliai, kai naudotojas išeina iš programėlės (telefone ji retai užsidaro iki galo)
  if (info?.silent) { if (pub && pub !== window.APP_VERSION && rel.versions.some(x => x.v === pub)) { UI.silentReload = true; if (document.hidden) location.reload(); } return; }
  if (pub && pub !== window.APP_VERSION && rel.versions.some(x => x.v === pub)) { window.RELEASES = rel; UI.newInfo = info; if (UI.newVer !== pub) { UI.newVer = pub; render(); } }
}
function updateBanner() {
  if (!UI.newVer) return '';
  const n = UI.newInfo?.version === UI.newVer && UI.newInfo.notes != null ? UI.newInfo.notes : verNotes(UI.newVer);
  return `<div class="banner update">${daigelis(5)}<div><b>Atsirado nauja versija ${esc(UI.newVer)}</b>${n ? `<br><small>${esc(n.split('\n')[0])}</small>` : ''}</div><span class="sp"></span>${btn('Atnaujinti', 'reloadApp', {}, 'sm primary')}</div>`;
}
A.reloadApp = () => location.reload();
// po atnaujinimo vieną kartą parodom, kas pasikeitė
function showWhatsNew() {
  if (window.CLOUD?.test || verOverride() || !window.APP_VERSION) return;
  let seen = null; try { seen = localStorage.getItem('ls_seen_ver'); localStorage.setItem('ls_seen_ver', window.APP_VERSION); } catch (e) { return; }
  if (seen && seen !== window.APP_VERSION) {
    const info = window.PUBLIC_INFO, mine = info && info.version === window.APP_VERSION;
    if (mine && info.silent) return;
    const n = mine && info.notes != null ? info.notes : verNotes(window.APP_VERSION);
    if (!n) return;
    modal(`Kas naujo`, `${n.split('\n').filter(Boolean).map(l => `<p>${esc(l)}</p>`).join('')}<p class="hint">Radai klaidą? Spausk 💬 viršuje.</p>`);
  }
}

// ================= VERSIJOS (tik kūrėjui) =================
function versionsCard() {
  const rel = window.RELEASES || {versions: []}, cur = window.APP_VERSION, pub = window.PUBLIC_VERSION;
  const list = [...(window.CLOUD?.test ? [{v: 'src', date: '', notes: 'Darbinė kopija (tik testavimo serveryje)'}] : []), ...rel.versions];
  return card('Versijos', `<p class="hint">Šiame lange: <b>${esc(cur)}</b>${cur !== pub ? ' (bandoma)' : ''} · Vieša: <b>${esc(pub || '–')}</b></p>
    ${list.map(x => `<div class="li"><b>${esc(x.v)}</b>${x.v === pub ? '<span class="tag">vieša</span>' : ''}${x.v === cur ? '<span class="tag warn">šiame lange</span>' : ''}<small>${esc(x.date || '')} ${esc(x.notes || '')}</small><span class="sp"></span>
      ${x.v !== cur ? btn('Išbandyti', 'tryVersion', {v: x.v}, 'sm') : ''}${x.v !== pub && x.v !== 'src' ? btn('Paleisti viešai', 'publishVersion', {v: x.v}, 'sm primary') : ''}</div>`).join('')}
    <div class="choice row">${cur !== pub ? btn('Grįžti į viešą versiją', 'tryVersion', {v: ''}, 'sm') : ''}${btn('Patikrinti AI', 'aiCheck', {}, 'sm')}</div>
    <p class="hint">„Išbandyti“ pakeičia versiją tik tavo naršyklėje. „Paleisti viešai“ – visiems, iškart. Seną versiją grąžinsi tuo pačiu mygtuku.</p>`);
}
A.tryVersion = d => { try { if (d.v && d.v !== window.PUBLIC_VERSION) { localStorage.setItem('ls_ver_override', d.v); localStorage.setItem('ls_ver_override_pub', window.PUBLIC_VERSION || ''); } else localStorage.removeItem('ls_ver_override'); } catch (e) {} location.reload(); };
A.publishVersion = async d => {
  if (!isDeveloper()) return;
  // pasiūlom tekstą: visų naujesnių nei dabar vieša versijų aprašymai
  const vs = ((window.RELEASES || {}).versions || []), iNew = vs.findIndex(x => x.v === d.v), iPub = vs.findIndex(x => x.v === window.PUBLIC_VERSION);
  const draft = vs.slice(iNew, iPub < 0 ? iNew + 1 : iPub).map(x => x.notes).filter(Boolean).join('\n');
  modal(`Paleisti ${esc(d.v)} viešai`, `${fld('Ką parodyti naudotojams („Kas naujo“)', `<textarea name="notes" rows="5" placeholder="pvz. Nauja skiltis 💚 Savijauta – pažymėk, kaip jautiesi">${esc(draft)}</textarea>`)}
    <p class="hint">Rašyk naudotojams suprantamai – kiekviena eilutė bus atskira pastraipa. Juostoje „Atsirado nauja versija“ rodoma pirma eilutė.</p>
    <label class="cb"><input type="checkbox" name="silent"> 🙈 Tylus atnaujinimas – naudotojams nieko nerodyti (įsijungs kitą kartą atsidarius)</label>`, async o => {
    try {
      const value = {version: d.v, notes: o.silent ? '' : (o.notes || '').trim(), silent: !!o.silent};
      await DB.upsert('app_config', {key: 'stable', value, updated_at: new Date().toISOString(), ...(cloudOn() ? {updated_by: DB.uid()} : {})}, 'key');
      window.PUBLIC_VERSION = d.v; window.PUBLIC_INFO = value; render(); toast(`🚀 Versija ${d.v} dabar vieša${value.silent ? ' (tyliai)' : ''}`, 'good');
    } catch (e) { toast('⚠️ Nepavyko: ' + esc(e.message)); }
  }, {submit: '🚀 Paleisti viešai', wide: true});
};

// ================= ATSILIEPIMAI =================
const FB_KINDS = [['bug', '🐞', 'Klaida'], ['idea', '💡', 'Idėja'], ['question', '❓', 'Klausimas'], ['other', '💬', 'Kita']];
function fbContext() {
  const ua = navigator.userAgent, os = /iPhone|iPad/i.test(ua) ? 'iPhone/iPad' : /Android/i.test(ua) ? 'Android' : /Windows/i.test(ua) ? 'Windows' : /Mac OS/i.test(ua) ? 'Mac' : /Linux/i.test(ua) ? 'Linux' : '', dev = (/Mobi|Android|iPhone/i.test(ua) ? 'telefonas' : 'kompiuteris') + (os ? ' ' + os : '');
  const br = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : /Firefox\//.test(ua) ? 'Firefox' : 'kita';
  const sub = UI.view === 'food' ? ' → ' + UI.food : UI.view === 'sport' ? ' → ' + UI.sport : UI.view === 'calendar' ? ' → ' + UI.cal.mode : '';
  return {view: (VIEWS.find(v => v[0] === UI.view)?.[2] || UI.view) + sub, version: window.APP_VERSION || '?', device: `${dev}, ${br}`, screen: `${innerWidth}×${innerHeight}`, mode: DEV ? 'kūrėjo' : 'įprastas', at: new Date().toISOString()};
}
A.feedback = () => {
  UI.fbKind = UI.fbKind || 'bug';
  const c = fbContext();
  modal('Atsiliepimas', `<div class="chips">${FB_KINDS.map(([k, e, n]) => `<button type="button" class="chipbtn ${UI.fbKind === k ? 'on' : ''}" data-a="fbKind" data-k="${k}">${e} ${n}</button>`).join('')}</div>
    ${fld('Kas nutiko arba ką siūlai?', `<textarea name="message" rows="5" required placeholder="${UI.fbKind === 'bug' ? 'Ką darei, kas turėjo įvykti ir kas įvyko vietoj to?' : 'Parašyk savais žodžiais…'}"></textarea>`)}
    ${isDeveloper() ? `<label class="cb"><input type="checkbox" name="urgent" checked> 🔥 Skubu (kūrėjo pastaba)</label>` : ''}
    <p class="hint">Kartu išsiųsiu: skiltis „${esc(c.view)}“, versija ${esc(c.version)}, ${esc(c.device)}.</p>`, o => {
    if (!o.message.trim()) return false;
    DB.insert('feedback', {user_id: DB.uid(), email: DB.email(), kind: UI.fbKind, message: o.message.trim(), context: c, from_dev: isDeveloper(), urgent: isDeveloper() && !!o.urgent})
      .then(() => { toast('Ačiū! Atsiliepimas išsiųstas 💬', 'good'); if (isDeveloper()) refreshInbox(); })
      .catch(e => { toast('⚠️ Nepavyko išsiųsti: ' + esc(e.message)); });
  }, {submit: 'Siųsti', noFocus: true});
};
A.fbKind = d => { const t = $('#mform textarea')?.value || ''; UI.fbKind = d.k; A.feedback(); const ta = $('#mform textarea'); if (ta) ta.value = t; };
const FB_STATUS = {new: '🆕 Nauja', seen: '👀 Peržiūrėta', done: '✅ Išspręsta'};
// Mano atsiliepimai – kaip pokalbis: mano žinutė ir komandos atsakymai (iš bilietų sistemos)
const TK_STATUS = {new: '🆕 Gauta', open: '👀 Peržiūrima', pending: '💬 Atsakyta', solved: '✅ Išspręsta'};
async function myTickets() {
  // klientas mato tik paskutinių 3 mėnesių pokalbius
  const since = new Date(Date.now() - 90 * 864e5).toISOString();
  const tickets = (await DB.list('tickets', `user_id=eq.${DB.uid()}&order=updated_at.desc`)).filter(t => (t.updated_at || t.created_at) > since && t.channel !== 'email');
  const msgs = tickets.length ? await DB.list('ticket_messages', `ticket_id=in.(${tickets.map(t => t.id).join(',')})&kind=eq.public&order=created_at.asc`) : [];
  return tickets.map(t => ({...t, msgs: msgs.filter(m => m.ticket_id === t.id && m.kind === 'public')}));
}
const convSig = list => list.map(t => `${t.id}:${t.status}:${t.rating || ''}:${t.msgs.length}`).join('|');
let CONV_SIG = '';
A.myFeedback = async () => {
  let list = null;
  try { list = await myTickets(); } catch (e) { /* bilietų lentelės dar nėra – rodom senu būdu */ }
  try {
    if (list) {
      markRepliesSeen(list); markSolvedSeen(list.filter(t => t.status === 'solved').map(t => t.id));
      const typed = {}; document.querySelectorAll('.fbreply textarea').forEach(x => { if (x.value) typed[x.id] = x.value; });
      const focus = document.activeElement?.id;
      CONV_SIG = convSig(list);
      modal('Mano pokalbiai', list.length ? list.map(t => `<div class="fbconv"><div class="fbhead"><b>${caseIcon(t)} ${esc(caseName(t))}</b><small>${new Date(t.created_at).toLocaleDateString('lt-LT', {timeZone: appTZ() || undefined})}</small></div>
        ${t.msgs.map(m => `<div class="fbmsg ${isTeam(m) ? 'agent' : 'me'}"><small>${isTeam(m) ? 'Life Schedule komanda' : 'Tu'} · ${new Date(m.created_at).toLocaleString('lt-LT', {dateStyle: 'short', timeStyle: 'short', timeZone: appTZ() || undefined})}</small>${m.body === '📎' ? '' : esc(m.body)}${(m.attachments || []).map(a => `<a class="fbatt" data-a="openAtt" data-p="${esc(a.path)}">${ic('note', 'sm')} ${esc(a.name)}</a>`).join('')}</div>`).join('')}
        ${convFoot(t)}</div>`).join('') : empty('Dar nieko nesiuntei'));
      for (const [id, v] of Object.entries(typed)) { const x = document.getElementById(id); if (x) x.value = v; }
      if (focus) document.getElementById(focus)?.focus();
      return;
    }
    const rows = await DB.list('feedback', `user_id=eq.${DB.uid()}&order=created_at.desc`);
    modal('Mano atsiliepimai', rows.length ? rows.map(f => `<div class="fbi"><div><b>${FB_KINDS.find(k => k[0] === f.kind)?.[1] || '💬'} ${esc(f.message)}</b><small>${new Date(f.created_at).toLocaleString('lt-LT')}</small>${f.reply ? `<div class="reply">↩ ${esc(f.reply)}</div>` : ''}</div></div>`).join('') : empty('Dar nieko nesiuntei'));
  } catch (e) { toast('⚠️ ' + esc(e.message)); }
};
// Pokalbio apačia: atsakyti / ar išspręsta? / įvertinimas
const isTeam = m => m.author_role === 'agent' || m.author_role === 'auto';
const RATES = [['😞', 'Labai blogai'], ['🙁', 'Blogai'], ['😐', 'Vidutiniškai'], ['🙂', 'Gerai'], ['😍', 'Puikiai']];
const rateRow = t => `<div class="fbrate"><b>Kaip vertini mūsų pagalbą?</b><div>${RATES.map(([e, l], i) => `<button type="button" data-a="fbRate" data-id="${t.id}" data-s="${i + 1}" title="${l}">${e}<small>${l}</small></button>`).join('')}</div></div>`;
function convFoot(t) {
  if (t.status === 'solved') return `<div class="fbsolved"><b>✅ Komanda pažymėjo, kad klausimas išspręstas</b><div class="row"><button class="btn sm primary" data-a="fbClose" data-id="${t.id}">Problema išspręsta</button><button class="btn sm" data-a="fbMore" data-id="${t.id}">Reikia dar pagalbos</button></div></div>`;
  if (t.status === 'closed') return `<div class="fbclosed">🔒 Pokalbis uždarytas – parašyti nebegalima. Jei reikia pagalbos, parašyk naują atsiliepimą.</div>${t.rating ? `<div class="fbrated">Tavo įvertinimas: ${RATES[t.rating - 1][0]} ${RATES[t.rating - 1][1]}</div>` : rateRow(t)}`;
  return `<div class="fbreply"><textarea id="fbr_${t.id}" rows="1" placeholder="Atsakyti…"></textarea><button class="btn sm primary" data-a="fbSend" data-id="${t.id}">Siųsti</button></div>`;
}
A.fbClose = async d => {
  try { await DB.rpc('customer_close_case', {tid: d.id}); markSolvedSeen([d.id]); await A.myFeedback(); }
  catch (e) { toast('⚠️ Nepavyko'); }
};
A.fbMore = async d => {
  try { await DB.rpc('customer_more_help', {tid: d.id}); markSolvedSeen([d.id]); await A.myFeedback(); setTimeout(() => $(`#fbr_${d.id}`)?.focus(), 100); }
  catch (e) { toast('⚠️ Nepavyko'); }
};
A.fbRate = async d => {
  try { await DB.rpc('customer_rate_case', {tid: d.id, score: +d.s}); toast('Ačiū už įvertinimą! 💙', 'good'); if ($('.fbconv')) A.myFeedback(); }
  catch (e) { toast('⚠️ Nepavyko'); }
};
const KIND_EMOJI = {bug: '🐞', idea: '💡', question: '❓', other: '💬'};
// Pokalbio pavadinimas kaip konsolėje: „Klaida: 12“, „Atsiliepimas: 13“, komandos pradėtas – jo tema
const CASE_WORDS = {bug: 'Klaida', idea: 'Idėja', question: 'Klausimas', other: 'Atsiliepimas', dsar_export: 'Duomenų užklausa', dsar_delete: 'Paskyros trynimas'};
const caseKind = t => t.outgoing ? 'outgoing' : t.type === 'feedback' ? (CASE_WORDS[(t.tags || [])[0]] ? t.tags[0] : 'other') : t.type;
const caseName = t => t.outgoing ? t.subject : t.case_no ? `${CASE_WORDS[caseKind(t)] || 'Atvejis'}: ${t.case_no}` : t.subject;
const caseIcon = t => ({outgoing: '🎧', dsar_export: '🌍', dsar_delete: '🗑️'})[caseKind(t)] || KIND_EMOJI[caseKind(t)] || '💬';
A.fbSend = async d => {
  const ta = $(`#fbr_${d.id}`), body = ta?.value.trim(); if (!body) return;
  try { await DB.insert('ticket_messages', {ticket_id: d.id, author_id: DB.uid(), author_role: 'customer', kind: 'public', body, attachments: []}); toast('Išsiųsta ✓', 'good'); A.myFeedback(); }
  catch (e) { toast('⚠️ Nepavyko išsiųsti'); }
};
// ----- Pagalbai: kokia versija / įrenginys; kartą per sesiją – prisijungimo įrašas (įrenginys, IP, apytikslė vieta) saugumui -----
const TZ_COUNTRY = {Vilnius: 'Lietuva', Riga: 'Latvija', Tallinn: 'Estija', Warsaw: 'Lenkija', Stockholm: 'Švedija', Oslo: 'Norvegija', Copenhagen: 'Danija', Helsinki: 'Suomija', London: 'Jungtinė Karalystė', Dublin: 'Airija', Berlin: 'Vokietija', Paris: 'Prancūzija', Amsterdam: 'Nyderlandai', Brussels: 'Belgija', Madrid: 'Ispanija', Rome: 'Italija', Vienna: 'Austrija', Prague: 'Čekija', Kiev: 'Ukraina', Kyiv: 'Ukraina', Minsk: 'Baltarusija', Moscow: 'Rusija', New_York: 'JAV', Chicago: 'JAV', Denver: 'JAV', Los_Angeles: 'JAV', Toronto: 'Kanada'};
async function reportMeta() {
  try {
    const c = fbContext(), tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '', city = tz.split('/').pop() || '';
    if (!sessionStorage.getItem('ls_signin')) { sessionStorage.setItem('ls_signin', '1'); DB.fn('signin', {device: c.device, app: c.version}).catch(() => {}); }
    await DB.upsert('user_meta', {user_id: DB.uid(), version: c.version, device: c.device, screen: c.screen, device_tz: tz, place: city ? `${city.replace(/_/g, ' ')}${TZ_COUNTRY[city] ? ', ' + TZ_COUNTRY[city] : ''}` : '', last_seen: new Date().toISOString()}, 'user_id');
  } catch (e) { /* lentelės dar nėra – nieko baisaus */ }
}
// ----- Komandos pakeitimai (XP dovana / pataisymas, profilio taisymas) – pritaikom patys -----
const FIX_COLLS = ['steps', 'recipes', 'meals', 'freezer', 'foods', 'spend', 'checkins', 'weights', 'workouts', 'plans', 'events', 'tasks', 'wellbeing', 'sleep', 'timelog'];
async function applyAdjustments() {
  if (DEV || readOnly()) return;
  let rows; try { rows = await DB.list('account_adjustments', `user_id=eq.${DB.uid()}&applied=eq.false&order=created_at.asc`); } catch (e) { return; }
  if (!rows.length) return;
  const xp = []; let prof = false;
  for (const r of rows) {
    const p = r.payload || {};
    if (r.kind === 'xp' && Math.round(+p.amount || 0)) {
      const n = Math.round(+p.amount);
      S.xpAdjust = [...(S.xpAdjust || []).filter(a => a.id !== r.id), {id: r.id, date: today(), amount: n, reason: r.reason || ''}];
      xp.push({n, reason: r.reason || ''});
    }
    // 🧰 Komanda pašalino / pataisė įrašą (receptą, valgį, įvykį…) – tik iš leistinų sąrašų
    if ((r.kind === 'remove_item' || r.kind === 'edit_item') && FIX_COLLS.includes(p.coll) && Array.isArray(S[p.coll])) {
      const key = x => String(x?.id ?? JSON.stringify(x)), i = S[p.coll].findIndex(x => key(x) === String(p.key));
      if (i >= 0 && r.kind === 'remove_item') {
        const [x] = S[p.coll].splice(i, 1);
        if (p.coll === 'recipes' && x?.id && !(S.deletedRecipes || []).includes(x.id)) (S.deletedRecipes = S.deletedRecipes || []).push(x.id);
      }
      if (i >= 0 && r.kind === 'edit_item' && p.patch && typeof p.patch === 'object') {
        const it = S[p.coll][i];
        for (const [k, v] of Object.entries(p.patch)) if (k !== 'id' && ['string', 'number', 'boolean'].includes(typeof v) && (it[k] == null || typeof it[k] === typeof v)) it[k] = v;
      }
    }
    // 👟 Žingsniai iš telefono (asmeninė nuoroda) – visa dienos suma
    if (r.kind === 'steps' && +p.steps >= 0) setSteps(p.date || zonedParts(Date.parse(p.at || r.created_at)).date, +p.steps, 'phone', true);
    if (r.kind === 'profile') {
      if (p.name != null && String(p.name).trim()) { S.profile.name = String(p.name).trim().slice(0, 60); prof = true; }
      if (p.birthYear != null && +p.birthYear > 1900) { S.profile.birthYear = +p.birthYear; prof = true; }
      if (p.sex === 'm' || p.sex === 'f') { S.profile.sex = p.sex; prof = true; }
    }
  }
  commit();
  for (const r of rows) DB.update('account_adjustments', `id=eq.${r.id}`, {applied: true, applied_at: new Date().toISOString()}).catch(() => {});
  const tot = sum(xp.map(x => x.n));
  if (tot > 0) await ask(`🎁 Gavai +${tot} XP!`, xp.map(x => x.reason ? `<p>${esc(x.reason)}</p>` : '').join('') || '<p>Dovana nuo Life Schedule komandos.</p>', {icon: '⭐', yes: 'Ačiū!', no: false});
  else if (tot < 0) await info('XP pataisyti', `<p>Tavo XP pakeisti: <b>${tot}</b>.</p>${xp.map(x => x.reason ? `<p>${esc(x.reason)}</p>` : '').join('')}`);
}
// Komandos atsiųstas failas – trumpalaikė saugi nuoroda (5 min.)
A.openAtt = async d => {
  const w = window.open('', '_blank');
  try {
    if (!cloudOn()) { w.location = `/api/files/${d.p}`; return; }
    const r = await fetch(`${CLOUD.url}/storage/v1/object/sign/attachments/${d.p}`, {method: 'POST', headers: {apikey: CLOUD.key, Authorization: 'Bearer ' + await Auth.token(), 'Content-Type': 'application/json'}, body: JSON.stringify({expiresIn: 300})});
    const j = await r.json(); if (!r.ok) throw new Error(j.message || r.status);
    w.location = CLOUD.url + '/storage/v1' + j.signedURL;
  } catch (e) { w?.close(); toast('⚠️ Nepavyko atidaryti failo'); }
};
// Naujas komandos atsakymas -> gražus langas ekrano viduryje (vieną kartą)
const seenReplies = () => { try { return JSON.parse(localStorage.getItem('ls_seen_replies') || '[]'); } catch (e) { return []; } };
function markRepliesSeen(list) {
  const ids = list.flatMap(t => t.msgs.filter(isTeam).map(m => m.id));
  try { localStorage.setItem('ls_seen_replies', JSON.stringify([...new Set([...seenReplies(), ...ids])].slice(-300))); } catch (e) {}
}
const seenSolved = () => { try { return JSON.parse(localStorage.getItem('ls_seen_solved') || '[]'); } catch (e) { return []; } };
function markSolvedSeen(ids) { try { localStorage.setItem('ls_seen_solved', JSON.stringify([...new Set([...seenSolved(), ...ids])].slice(-300))); } catch (e) {} }
let REPLY_OPEN = false;
// Komanda uždarė pokalbį -> langas: „Problema išspręsta“ (uždaro ir leidžia įvertinti) arba „Rašyti daugiau“.
// Paspaudus šalia – nieko neverčiam: pokalbis lieka išspręstas ir po 2 d. užsidaro pats.
async function solvedPopup(t, list) {
  const mine = t.msgs.filter(x => !isTeam(x)).pop(), team = t.msgs.filter(isTeam).slice(-1);
  const bub = x => `<div class="fbmsg ${isTeam(x) ? 'agent' : 'me'}"><small>${isTeam(x) ? 'Life Schedule komanda' : 'Tu'}</small>${x.body === '📎' ? '' : esc(x.body)}</div>`;
  const r = await ask('Tavo klausimas išspręstas', `<div class="replypop">${mine ? bub(mine) : ''}${team.map(bub).join('')}</div><p class="muted">${esc(caseName(t))}</p>`, {mood: 5, yes: 'Problema išspręsta', no: 'Rašyti daugiau', backdrop: 'later'});
  markRepliesSeen(list); markSolvedSeen([t.id]);
  if (r === true) {
    try { await DB.rpc('customer_close_case', {tid: t.id}); } catch (e) { return toast('⚠️ Nepavyko'); }
    await ratePopup(t);
  } else if (r === false) await A.fbMore({id: t.id});
}
function ratePopup(t) {
  return new Promise(res => {
    const el = document.createElement('div'); el.className = 'askov';
    el.innerHTML = `<div class="askbox" role="dialog" aria-modal="true"><div class="askic">${daigelis(5)}</div><h3>Kaip vertini mūsų pagalbą?</h3><div class="asktxt">${rateRow(t).replace('<b>Kaip vertini mūsų pagalbą?</b>', '')}</div>
      <div class="askbtns"><button type="button" class="btn ghost" data-skip="1">Praleisti</button></div></div>`;
    document.body.appendChild(el);
    const done = () => { el.classList.add('out'); setTimeout(() => el.remove(), 150); res(); };
    el.addEventListener('click', async e => {
      e.stopPropagation();
      const b = e.target.closest('[data-s]');
      if (b) { done(); await A.fbRate({id: t.id, s: b.dataset.s}); }
      else if (e.target === el || e.target.closest('[data-skip]')) done();
    });
  });
}
async function checkReplies() {
  if (REPLY_OPEN || DEV || document.hidden) return;
  let list; try { list = await myTickets(); } catch (e) { return; }
  if ($('#modal.open .fbconv') || $('#modal.open h3')?.textContent === 'Mano pokalbiai') {   // conversations are open – just refresh them, no popups
    if (convSig(list) !== CONV_SIG) await A.myFeedback();
    markRepliesSeen(list); markSolvedSeen(list.filter(t => t.status === 'solved').map(t => t.id)); return;
  }
  const seen = seenReplies(), ss = seenSolved();
  const solved = list.find(t => t.status === 'solved' && !ss.includes(t.id));
  if (solved) { REPLY_OPEN = true; try { await solvedPopup(solved, list); } finally { REPLY_OPEN = false; } return; }
  const fresh = list.flatMap(t => t.msgs.filter(m => isTeam(m) && !seen.includes(m.id)).map(m => ({t, m})));
  if (!fresh.length) return;
  REPLY_OPEN = true;
  const {t, m} = fresh[fresh.length - 1];
  // trumpas pokalbis: tavo paskutinė žinutė + nauji komandos atsakymai (tik vieši – jokios vidinės info)
  const newIds = fresh.filter(f => f.t.id === t.id).map(f => f.m.id), firstNew = t.msgs.findIndex(x => newIds.includes(x.id));
  const mine = t.msgs.slice(0, firstNew).filter(x => !isTeam(x)).pop();
  const bub = x => `<div class="fbmsg ${isTeam(x) ? 'agent' : 'me'}"><small>${isTeam(x) ? 'Life Schedule komanda' : 'Tu'}</small>${x.body === '📎' ? '' : esc(x.body)}${(x.attachments || []).length ? `<small>Prisegta failų: ${x.attachments.length}</small>` : ''}</div>`;
  const others = fresh.length - newIds.length;
  const open = await ask('Gavai atsakymą!', `<div class="replypop">${mine ? bub(mine) : ''}${t.msgs.filter(x => newIds.includes(x.id)).map(bub).join('')}${others ? `<small>Ir dar ${others} nauj${others === 1 ? 'as atsakymas' : 'i atsakymai'} kituose pokalbiuose</small>` : ''}</div>`, {mood: 5, yes: 'Atidaryti pokalbį', no: 'Gerai'});
  markRepliesSeen(list); REPLY_OPEN = false;
  if (open) A.myFeedback();
}

// ----- Kūrėjo gautieji: atsiliepimai ir užklausos -----
let INBOX = {fb: [], req: [], loaded: false};
async function refreshInbox() {
  if (!isDeveloper()) return;
  try {
    const [fb, req] = await Promise.all([DB.list('feedback', 'order=created_at.desc'), DB.list('dsar_requests', 'order=created_at.desc')]);
    const before = INBOX.fb.filter(f => f.status === 'new').map(f => f.id);
    INBOX = {fb, req, loaded: true};
    const fresh = fb.filter(f => f.status === 'new' && !f.from_dev && !before.includes(f.id));
    if (fresh.length && before.length + fresh.length > 0) remindOnce(`fb|${fresh[0].id}`, '💬 Naujas atsiliepimas', fresh[0].message.slice(0, 90));
    for (const r of req.filter(r => r.type === 'export' && ['received', 'in_progress'].includes(r.status))) remindOnce(`dsar|${r.id}|${today()}`, '📦 Duomenų užklausa', `${r.email || 'naudotojas'} – atsakyti iki ${fmtDate(r.due_at.slice(0, 10))}`);
    const b = $('.bug'); if (b) render();
  } catch (e) { /* lentelių dar nėra – nieko baisaus */ }
}
const inboxCount = () => INBOX.fb.filter(f => f.status === 'new' && !f.from_dev).length + INBOX.req.filter(r => r.type === 'export' && ['received', 'in_progress'].includes(r.status)).length;
function inboxCard() {
  if (!INBOX.loaded) return card('Gautieji', `<p class="hint">Neužkrauta. Ar Supabase'e paleistas 03 SQL failas?</p>${btn('Atnaujinti', 'inboxRefresh', {}, 'sm')}`);
  const fb = [...INBOX.fb].sort((a, b) => (b.urgent - a.urgent) || ((a.status === 'done') - (b.status === 'done')) || (a.created_at < b.created_at ? 1 : -1));
  const open = INBOX.req.filter(r => !['sent', 'done', 'cancelled'].includes(r.status)), closed = INBOX.req.filter(r => ['sent', 'done', 'cancelled'].includes(r.status)).slice(0, 5);
  const daysLeft = r => diffDays(today(), (r.type === 'delete' ? r.delete_at : r.due_at || '').slice(0, 10));
  const reqRow = r => { const dl = daysLeft(r); return `<div class="fbi ${dl <= 7 && !['sent', 'done', 'cancelled'].includes(r.status) ? 'urgent' : ''}"><div><b>${r.type === 'export' ? 'Duomenų kopija' : 'Paskyros trynimas'} · ${esc(r.email || '—')}</b>
      <small>Gauta ${fmtDate(r.created_at.slice(0, 10))} · ${r.type === 'export' ? `atsakyti iki ${fmtDate(r.due_at.slice(0, 10))}` : `trinama ${fmtDate((r.delete_at || '').slice(0, 10))}`} · ${DSAR_STATUS[r.status] || r.status}${!['sent', 'done', 'cancelled'].includes(r.status) ? ` · <b class="${dl <= 7 ? 'red' : ''}">liko ${dl} d.</b>` : ''}</small></div>
      ${r.type === 'export' && !['sent', 'done'].includes(r.status) ? `<div class="choice row">${btn('Paruošti duomenis', 'dsarPrepare', {id: r.id}, 'sm primary')}${btn('Laiško šablonas', 'dsarMail', {id: r.id}, 'sm')}${btn('Pažymėti išsiųsta', 'dsarSent', {id: r.id}, 'sm')}</div>` : ''}
      ${r.type === 'delete' && r.status === 'pending' && !cloudOn() ? `<div class="choice row">${btn('Įvykdyti dabar (testas)', 'devRunDeletion', {id: r.id}, 'sm danger')}</div>` : ''}</div>`; };
  return card(`Gautieji${inboxCount() ? ` <span class="badge-n">${inboxCount()}</span>` : ''}`, `<div class="tabs sm">${[['fb', `Atsiliepimai (${INBOX.fb.filter(f => f.status === 'new').length})`], ['req', `Užklausos (${open.length})`]].map(([k, l]) => `<button type="button" class="${(UI.inbox || 'fb') === k ? 'on' : ''}" data-a="inboxTab" data-k="${k}">${l}</button>`).join('')}</div>
    ${(UI.inbox || 'fb') === 'fb' ? (fb.length ? fb.map(f => `<div class="fbi ${f.urgent ? 'urgent' : ''} ${f.status === 'done' ? 'done' : ''}"><div><b>${FB_KINDS.find(k => k[0] === f.kind)?.[1] || '💬'} ${esc(f.message)}</b>
      <small>${f.from_dev ? '🐞 <b>Kūrėjo pastaba</b>' : esc(f.email || 'naudotojas')}${f.urgent ? ' · 🔥 skubu' : ''} · ${new Date(f.created_at).toLocaleString('lt-LT')} · ${FB_STATUS[f.status] || f.status}</small>
      ${f.context ? `<small class="ctx">📍 ${esc(f.context.view || '')} · v${esc(f.context.version || '?')} · ${esc(f.context.device || '')} · ${esc(f.context.screen || '')}</small>` : ''}${f.reply ? `<div class="reply">↩ ${esc(f.reply)}</div>` : ''}</div>
      <div class="choice row">${f.status === 'new' ? btn('Peržiūrėta', 'fbStatus', {id: f.id, s: 'seen'}, 'sm') : ''}${f.status !== 'done' ? btn('Išspręsta', 'fbStatus', {id: f.id, s: 'done'}, 'sm') : ''}${btn('Atsakyti', 'fbReply', {id: f.id}, 'sm ghost')}</div></div>`).join('') : empty('Atsiliepimų nėra'))
      : (open.length ? open.map(reqRow).join('') : empty('Atvirų užklausų nėra ✓')) + (closed.length ? `<h4>Užbaigtos</h4>${closed.map(reqRow).join('')}` : '')}
    <div class="choice row">${btn('Atnaujinti', 'inboxRefresh', {}, 'sm ghost')}</div>`);
}
A.inboxTab = d => { UI.inbox = d.k; render(); };
A.inboxRefresh = async () => { await refreshInbox(); render(); };
A.fbStatus = async d => { try { await DB.update('feedback', `id=eq.${d.id}`, {status: d.s}); await refreshInbox(); render(); } catch (e) { toast('⚠️ ' + esc(e.message)); } };
A.fbReply = async d => { const t = await askText('↩ Atsakymas', 'Naudotojas jį matys „Mano atsiliepimai“.', '', {multi: true, yes: 'Siųsti'}); if (!t) return; try { await DB.update('feedback', `id=eq.${d.id}`, {reply: t, status: 'done'}); await refreshInbox(); render(); toast('Atsakyta ✓'); } catch (e) { toast('⚠️ ' + esc(e.message)); } };

// ================= PRIVATUMAS: duomenų kopija ir paskyros trynimas =================
const DSAR_STATUS = {received: 'Gauta', in_progress: 'Ruošiama', sent: 'Išsiųsta', pending: 'Laukia trynimo', cancelled: 'Atšaukta', done: 'Įvykdyta'};
let MYREQ = [];
async function loadAccountState() {
  try {
    MYREQ = await DB.list('dsar_requests', `user_id=eq.${DB.uid()}&order=created_at.desc`);
    DELREQ = MYREQ.find(r => r.type === 'delete' && r.status === 'pending') || null;
  } catch (e) { MYREQ = []; DELREQ = null; }
  SNAP = JSON.stringify(S);
}
function privacyCard() {
  const openExp = MYREQ.find(r => r.type === 'export' && ['received', 'in_progress'].includes(r.status));
  return card('Privatumas ir paskyra', `${MYREQ.length ? MYREQ.slice(0, 4).map(r => `<div class="li"><span>${r.type === 'export' ? 'Duomenų kopija' : 'Paskyros trynimas'}</span><small>${fmtDate(r.created_at.slice(0, 10))} · ${DSAR_STATUS[r.status] || r.status}${r.type === 'export' && ['received', 'in_progress'].includes(r.status) ? ` · atsakymas iki ${fmtDate(r.due_at.slice(0, 10))}` : ''}</small></div>`).join('') : ''}
    <div class="choice row">${openExp ? '' : btn('Gauti savo duomenų kopiją', 'dsarRequest', {}, 'sm')}${DELREQ ? btn('Atšaukti paskyros trynimą', 'cancelDeletion', {}, 'sm primary') : btn('Ištrinti paskyrą', 'requestDeletion', {}, 'sm danger')}</div>
    <p class="hint">Paskyros saugumui saugome prisijungimų istoriją: įrenginį, IP adresą ir apytikslę vietą (šalį, miestą). Ji saugoma 12 mėn. ir naudojama tik įtartinam prisijungimui pastebėti.</p>`);
}
A.dsarRequest = async () => {
  if (!await ask('Gauti savo duomenų kopiją?', 'Paruošime visų tavo duomenų kopiją ir atsiųsime el. paštu per 30 dienų.', {icon: '📦', yes: 'Pateikti prašymą'})) return;
  try {
    const td = await trustedDate(), due = addDays(td.date, 30);
    const [r] = await DB.insert('dsar_requests', {user_id: DB.uid(), email: DB.email(), type: 'export', status: 'received', due_at: new Date(due + 'T23:59:00Z').toISOString()});
    await loadAccountState(); render();
    // automatinis patvirtinimas (kaip „macro“ įmonėse)
    modal('Prašymas gautas', `<div class="okbox">Gavome tavo prašymą Nr. <b>${esc(String(r?.id || '').slice(0, 8).toUpperCase())}</b> (${fmtDate(td.date)}).</div>
      <p>Pagal BDAR (15 ir 20 str.) atsakysime ne vėliau kaip per <b>30 dienų – iki ${fmtDate(due)}</b>. Duomenų kopiją atsiųsime el. paštu <b>${esc(DB.email())}</b>: skaitomą ataskaitą ir mašininiu būdu nuskaitomą failą (JSON).</p>
      <p class="hint">Jei negalėtume atsakyti laiku, pranešime priežastį. Prašymo būseną matysi Profilyje.</p>`);
    if (isDeveloper()) refreshInbox();
  } catch (e) { toast('⚠️ ' + esc(e.message)); }
};
A.requestDeletion = async () => {
  if (DEV) return toast('Kūrėjo režime tikros paskyros trinti negalima – išbandyk per Testuoti.bat');
  if (!await ask('Ištrinti paskyrą?', `<p>Po <b>20 dienų</b> visi tavo duomenys bus <b>negrįžtamai</b> ištrinti.</p><ul><li>Iki tol programėlė veiks tik peržiūrai</li><li>Priminimai nebus siunčiami</li><li>Per tą laiką gali apsigalvoti ir atšaukti</li></ul>`, {danger: true, icon: '🗑️', yes: 'Toliau', no: 'Palikti paskyrą'})) return;
  if (!await ask('Paskutinis patvirtinimas', 'Tikrai pradėti paskyros trynimą?', {danger: true, icon: '⚠️', yes: 'Taip, ištrinti', no: 'Ne, palikti'})) return;
  try {
    const td = await trustedDate(), when = addDays(td.date, 20);
    await DB.insert('dsar_requests', {user_id: DB.uid(), email: DB.email(), type: 'delete', status: 'pending', delete_at: new Date(when + 'T03:00:00Z').toISOString(), due_at: new Date(when + 'T03:00:00Z').toISOString()});
    await loadAccountState(); render(); toast(`🗑️ Paskyra bus ištrinta ${fmtDate(when)}`);
  } catch (e) { toast('⚠️ ' + esc(e.message)); }
};
A.cancelDeletion = async () => {
  if (!DELREQ || !await ask('Atšaukti trynimą?', 'Paskyra liks, viskas bus kaip buvo.', {icon: '↩️', yes: 'Atšaukti trynimą', no: 'Ne'})) return;
  try { await DB.update('dsar_requests', `id=eq.${DELREQ.id}`, {status: 'cancelled'}); await loadAccountState(); render(); toast('↩ Trynimas atšauktas – sveikas sugrįžęs!', 'good'); }
  catch (e) { toast('⚠️ ' + esc(e.message)); }
};
function deletionBanner() {
  if (!readOnly()) return '';
  const when = DELREQ.delete_at.slice(0, 10), left = Math.max(0, diffDays(today(), when));
  return `<div class="banner danger"><b>Paskyra bus ištrinta ${fmtDate(when)}</b> (liko ${left} d.). Kol kas gali tik peržiūrėti. <span class="sp"></span>${btn('Atšaukti trynimą', 'cancelDeletion', {}, 'sm primary')}</div>`;
}
// ----- Kūrėjas: užklausos vykdymas -----
async function dsarUserData(r) {
  if (!cloudOn()) return await (await fetch('/api/data', {cache: 'no-store'})).json();
  const rows = await DB.list('user_data', `user_id=eq.${r.user_id}&select=data`);
  if (!rows.length) throw new Error('Duomenų nerasta (ar paleistas 03 SQL failas?)');
  return rows[0].data;
}
A.dsarPrepare = async d => {
  const r = INBOX.req.find(x => x.id === d.id); if (!r) return;
  try {
    const data = await dsarUserData(r);
    download(`duomenu-kopija-${today()}.html`, buildReport(data, r), 'text/html');
    download(`duomenu-kopija-${today()}.json`, JSON.stringify({request: {id: r.id, created_at: r.created_at}, exported_at: new Date().toISOString(), data}, null, 2), 'application/json');
    if (r.status === 'received') await DB.update('dsar_requests', `id=eq.${r.id}`, {status: 'in_progress'});
    await refreshInbox(); render(); toast('📄 Paruošta: HTML ataskaita + JSON. Išsiųsk el. paštu ir pažymėk „Išsiųsta“.');
  } catch (e) { toast('⚠️ ' + esc(e.message)); }
};
A.dsarMail = d => {
  const r = INBOX.req.find(x => x.id === d.id); if (!r) return;
  const txt = `Sveiki,\n\natsakydami į jūsų ${fmtDate(r.created_at.slice(0, 10))} pateiktą prašymą (Nr. ${String(r.id).slice(0, 8).toUpperCase()}) siunčiame visų Life Schedule programėlėje saugomų jūsų duomenų kopiją:\n• duomenu-kopija.html – skaitoma ataskaita;\n• duomenu-kopija.json – mašininiu būdu nuskaitomas failas (galite perkelti į kitą paslaugą).\n\nDuomenys naudojami tik programėlės veikimui (planavimui, rekomendacijoms), su trečiosiomis šalimis neparduodami. Bet kada galite paprašyti juos ištaisyti arba ištrinti paskyrą programėlės Profilyje.\n\nPagarbiai,\nLife Schedule`;
  navigator.clipboard?.writeText(txt).then(() => toast('✉️ Laiško šablonas nukopijuotas'));
  modal('Laiško šablonas', `<p class="hint">Nukopijuota. Siųsk adresu <b>${esc(r.email || '')}</b> su abiem failais.</p><pre class="mail">${esc(txt)}</pre>`);
};
A.dsarSent = async d => { if (!await ask('Pažymėti išsiųsta?', 'Užklausa bus užbaigta.', {icon: '✉️'})) return; try { await DB.update('dsar_requests', `id=eq.${d.id}`, {status: 'sent', done_at: new Date().toISOString()}); await refreshInbox(); render(); toast('✅ Užklausa užbaigta'); } catch (e) { toast('⚠️ ' + esc(e.message)); } };
A.devRunDeletion = async d => {
  if (cloudOn() || !await ask('TESTAS: ištrinti dabar?', 'Bus ištrinti vietiniai testiniai duomenys.', {danger: true, yes: 'Ištrinti'})) return;
  await fetch('/api/data', {method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({baseRev: REV, data: {}, force: true})});
  await DB.update('dsar_requests', `id=eq.${d.id}`, {status: 'done', done_at: new Date().toISOString(), email: null});
  localStorage.removeItem(lsKey()); sessionStorage.removeItem(DEV_KEY); location.reload();
};
// Skaitoma duomenų ataskaita (BDAR 15 str. – „suprantama forma“)
function buildReport(D, r) {
  const t = (title, head, rows) => rows.length ? `<h2>${title} <small>(${rows.length})</small></h2><table><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(x => `<tr>${x.map(c => `<td>${esc(c ?? '')}</td>`).join('')}</tr>`).join('')}</table>` : '';
  const p = D.profile || {}, cats = Object.fromEntries((D.categories || []).map(c => [c.id, c.name]));
  return `<!DOCTYPE html><html lang="lt"><head><meta charset="utf-8"><title>Duomenų kopija – Life Schedule</title><style>body{font:14px/1.5 system-ui,sans-serif;max-width:900px;margin:30px auto;padding:0 16px;color:#1c2140}h1{margin-bottom:0}h2{margin-top:28px;border-bottom:2px solid #e1e6f2;padding-bottom:4px}table{border-collapse:collapse;width:100%;font-size:13px}th,td{border:1px solid #e1e6f2;padding:5px 7px;text-align:left;vertical-align:top}th{background:#f3f5fb}.box{background:#f3f5fb;border-radius:10px;padding:12px 16px}small{color:#5d668c;font-weight:400}</style></head><body>
<h1>🌱 Life Schedule – tavo duomenų kopija</h1><p><small>Paruošta ${new Date().toLocaleString('lt-LT')} · prašymas Nr. ${esc(String(r?.id || '').slice(0, 8).toUpperCase())} · ${esc(r?.email || '')}</small></p>
<div class="box"><b>Kokie duomenys ir kam:</b> profilis (kalorijų ir miego normoms), kalendorius, laiko įrašai, užduotys, miegas, maistas, treniruotės, svoris ir užrašai – tik tam, kad programėlė galėtų planuoti ir rekomenduoti. Paskyros saugumui saugoma prisijungimų istorija (įrenginys, IP adresas, apytikslė vieta) – 12 mėn. Duomenys saugomi Supabase (ES), neparduodami ir neperduodami trečiosioms šalims. Saugomi, kol turi paskyrą; ištrynus – ištrinami per 20 dienų.<br><b>Tavo teisės:</b> gauti kopiją, ištaisyti, ištrinti, apriboti tvarkymą, perkelti duomenis (JSON failas pridėtas).</div>
${t('Profilis', ['Laukas', 'Reikšmė'], Object.entries({Vardas: p.name, Lytis: p.sex === 'f' ? 'moteris' : p.sex === 'm' ? 'vyras' : '', 'Gimimo metai': p.birthYear, 'Ūgis (cm)': p.height, 'Tikslo svoris': p.targetWeight, 'Keliuosi': p.wake, 'Einu miegoti': p.bed, 'Miego tikslas': p.sleepGoal}).filter(([, v]) => v !== '' && v != null))}
${t('Svoris', ['Data', 'kg', 'Liemuo cm'], (D.weights || []).map(w => [w.date, w.kg, w.waist]))}
${t('Miegas', ['Data', 'Užmigo', 'Pabudo', 'Kokybė'], (D.sleep || []).map(s => [s.date, s.bed, s.wake, s.q]))}
${t('Maistas', ['Data', 'Laikas', 'Kas', 'kcal', 'Baltymai g'], (D.meals || []).map(m => [m.date, m.time, m.name, Math.round(m.kcal || 0), Math.round(m.p || 0)]))}
${t('Treniruotės', ['Data', 'Pradžia', 'Trukmė min', 'Pratimai'], (D.workouts || []).map(w => [w.date, w.start, w.duration, (w.exercises || []).map(x => x.id + ' ' + (x.sets || []).join('/')).join(', ')]))}
${t('Laiko įrašai', ['Data', 'Nuo', 'Iki', 'Veikla', 'Pastaba'], (D.timelog || []).map(x => [x.date, x.start, x.end, cats[x.cat] || x.cat, x.note]))}
${t('Kalendoriaus veiklos', ['Pavadinimas', 'Kartojasi', 'Laikas', 'Data / dienos'], (D.events || []).map(e => [e.title, e.type, `${e.start}–${e.end}`, e.date || (e.days || []).join(',')]))}
${t('Užduotys', ['Ką', 'Iki', 'Atlikta'], (D.tasks || []).map(x => [x.title, x.due, x.done ? 'taip' : 'ne']))}
${t('Užrašai', ['Pavadinimas', 'Tekstas'], (D.notes || []).map(n => [n.title, n.body]))}
${t('Savijauta', ['Data', 'Laikas', 'Nuotaika (1–5)', 'Simptomai', 'Pastaba'], (D.wellbeing || []).map(w => [w.date, w.time, w.mood, (w.sym || []).join(', '), w.note]))}
${t('Patikrinimai', ['Data', 'Tipas', 'Svoris', 'Nuotaika', 'Kas pavyko', 'Tikslas'], (D.checkins || []).map(c => [c.date, c.type, c.weight, c.mood, c.wins, c.focus]))}
${t('Pagaminta', ['Data', 'Receptas', 'Porcijos', 'Kaina €'], (D.cooks || []).map(c => [c.date, c.recipeId, c.portions, c.cost]))}
${t('Išlaidos (čekiai)', ['Data', 'Suma €', 'Pastaba'], (D.spend || []).map(s => [s.date, s.amount, s.note]))}
${t('Žingsniai', ['Data', 'Žingsniai', 'Šaltinis'], (D.steps || []).map(s => [s.date, s.steps, s.src === 'phone' ? 'telefonas' : 'ranka']))}
<p><small>Pilni duomenys (taip pat nustatymai ir receptai) – pridėtame JSON faile.</small></p></body></html>`;
}

// ================= PRIMINIMAI =================
function remindOnce(key, title, body) {
  let seen = {}; try { seen = JSON.parse(localStorage.getItem('manogyv_seen') || '{}'); } catch (e) {}
  if (seen[key]) return; seen[key] = today();
  for (const k in seen) if (seen[k] < addDays(today(), -14)) delete seen[k];
  localStorage.setItem('manogyv_seen', JSON.stringify(seen)); notify(title, body, key);
}
function checkReminders() {
  if (!S || readOnly()) return; const t = today(), now = nowMin();
  for (const e of eventsOn(t)) { const s = toMin(e.start) - (+e.travel || 0); if (s - now <= 15 && s - now > 0) remindOnce(`ev|${e.id}|${t}`, e.title, `Prasideda ${e.start}${+e.travel ? ' – laikas išeiti' : ''}`); }
  for (const k of S.tasks.filter(x => !x.done && x.due)) {
    const dd = diffDays(t, k.due), offs = (k.remind || '1,0') === 'none' ? [] : (k.remind || '1,0').split(',').map(Number);
    if (!offs.length) continue;
    if (dd < 0) remindOnce(`late|${k.id}|${t}`, '🚨 Nepadaryta laiku', `${k.title} (buvo iki ${fmtDate(k.due)})`);
    else if (dd === 0 && offs.includes(0)) remindOnce(`today|${k.id}|${t}`, '📌 Šiandien', `${k.title}${k.dueTime ? ' iki ' + k.dueTime : ''}${+k.progress ? ` · padaryta ${k.progress}%` : ''}`);
    else if (offs.includes(dd)) remindOnce(`pre|${k.id}|${t}`, dd === 1 ? '⏰ Rytoj' : `⏰ Po ${dd} d.`, `Nepamiršk: ${k.title}`);
    else if (+k.est && dd <= 3 && (+k.progress || 0) < 50) remindOnce(`slow|${k.id}|${t}`, '🐢 Atsilieka', `${k.title}: liko ${dd} d., padaryta tik ${+k.progress || 0}%`);
  }
  const bed = toMin(S.profile.bed); if (bed - now <= 30 && bed - now > 0) remindOnce(`bed|${t}`, '🌙 Po 30 min – miegas', 'Padėk telefoną, pasiruošk rytojui (ir išsiimk porciją iš šaldiklio 🧊)');
  // kartą per savaitę – jei pasenusios kainos produktų, kuriuos naudoji
  const stale = stalePrices();
  if (stale.length && now >= 10 * 60) remindOnce(`stale|${weekStart(t)}`, '🧾 Laikas atnaujinti kainas', `${stale.length} produktų kainos senesnės nei mėnesis (${stale.slice(0, 3).map(f => f.name).join(', ')}${stale.length > 3 ? '…' : ''}). Nufotografuok kitą čekį.`);
  // šaldytuve greitai gendantis maistas: ryte ir vakare
  for (const x of storageItems().filter(x => x.place === 'fridge' && x.left <= 1 && x.left >= 0)) {
    if (now >= 9 * 60) remindOnce(`exp|${x.id}|${t}`, x.left === 0 ? '⏰ Suvalgyk šiandien' : '⏰ Suvalgyk iki rytojaus', `${x.r?.name || ''} šaldytuve (${x.portions} porc., pagaminta ${relDay(x.date)})${x.r?.freezable && x.left === 1 ? ' – arba užšaldyk' : ''}`);
  }
  if (S.timer && Date.now() - S.timer.ts > 3 * 3600e3) remindOnce(`timer|${S.timer.ts}`, '⏱️ Laikmatis vis dar veikia', `${cat(S.timer.cat).name} – jau daugiau nei 3 val. Gal pamiršai sustabdyti?`);
  const ci = checkinDue(); if (ci) remindOnce(`ci|${ci}|${t}`, '🪞 Laikas patikrinimui', ci === 'week' ? 'Savaitės patikrinimas – pasisverk ir pažiūrėk, kaip sekėsi' : 'Mėnesio patikrinimas laukia');
  for (const p of plansOn(t)) {
    const m = toMin(p.start) - now;
    if (m <= 30 && m > 5 && p.remind !== false) remindOnce(`plan30|${p.id}`, `Po ${m} min: ${wtypeName(p.type)}`, `${p.exercises?.length ? p.exercises.length + ' pratimai, ' : ''}~${p.duration} min.`);
    if (m <= 0 && m > -20) remindOnce(`plan0|${p.id}`, '💪 Laikas sportuoti!', `${wtypeName(p.type)} – spausk „▶ Pradėti“`);
  }
  const {recs} = recommendations(t); const sp = recs.find(r => r.kind === 'sport' && r.slot);
  if (sp && sp.slot[0] - now <= 10 && sp.slot[0] - now > 0) remindOnce(`sport|${t}`, '💪 Laisvas langas sportui!', sp.title);
  if (sportReviewDue()) remindOnce(`review|${t}`, '📊 Sporto apžvalga', 'Praėjo 2 savaitės – pažiūrėk, ką treniravai, o ką praleidai');
}

// ================= ĮVYKIŲ KLAUSYTOJAI =================
document.addEventListener('click', e => {
  if (e.target.id === 'modal') return A.closeModal();
  const el = e.target.closest('[data-a]'); if (!el) return;
  const fn = A[el.dataset.a]; if (!fn) return;
  if (el.dataset.sheet) A.closeSheet();
  if (el.tagName === 'BUTTON' || el.tagName === 'A') e.preventDefault();
  fn(el.dataset, el, e);
});
document.addEventListener('submit', e => {
  if (e.target.dataset.f && A[e.target.dataset.f]) { e.preventDefault(); return A[e.target.dataset.f](e.target); }
  if (e.target.id === 'mform') { e.preventDefault(); if (!MODAL_SUBMIT) return; const r = MODAL_SUBMIT(formObj(e.target), e.target); if (r !== false) A.closeModal(); }
  if (e.target.id === 'qtask') { e.preventDefault(); const o = formObj(e.target); if (!o.title.trim()) return; S.tasks.push({id: uid(), title: o.title.trim(), due: o.due, remind: '1,0', done: false, created: today()}); commit(); toast(`Priminsiu ${o.due ? (diffDays(today(), o.due) >= 1 ? 'dieną prieš ir ' : '') + fmtDate(o.due) : ''} ✓`); return; }
  if (e.target.id === 'pform') { e.preventDefault(); saveProfile(formObj(e.target)); commit(); toast('Profilis išsaugotas ✓', 'good'); }
});
let liveT;
document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.live) { UI[el.dataset.live] = el.value; clearTimeout(liveT); liveT = setTimeout(() => { const pos = el.selectionStart; render(); const n = $(`[data-live="${el.dataset.live}"]`); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }, 250); }
  if (el.dataset.note) { const n = S.notes.find(x => x.id === (UI.noteId || [...S.notes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.updated - a.updated)[0]?.id)); if (n) { n[el.dataset.note] = el.value; n.updated = Date.now(); UI.noteId = n.id; commit({noRender: true}); } }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.set) { S.settings[el.dataset.set] = el.value; commit({noRender: el.dataset.set !== 'tz'}); toast('Išsaugota ✓'); }
  if (el.dataset.ev && UI.ev) { evSync(); UI.ev.dp = null; evFix(); evModal(); }
  if ((el.dataset.imp !== undefined || el.dataset.impf !== undefined || el.dataset.impg !== undefined) && UI.imp) { impSync(); impModal(); }
  if ((el.dataset.rcf !== undefined || el.dataset.rcg !== undefined || el.dataset.rck !== undefined || el.dataset.rcp !== undefined || el.dataset.rct === 'addSpend') && UI.rc) { const st = $('.implines')?.scrollTop; rcSync(); rcModal(); const il = $('.implines'); if (il) il.scrollTop = st; }
  if (el.dataset.c === 'receipt' && el.files[0]) runReceiptOCR(el.files[0]);
  if (el.dataset.c === 'themeSw') { S.settings.theme = el.checked ? 'dark' : 'light'; applyTheme(); commit(); return; }
  if (el.dataset.c === 'mealSuggest') { S.foodPrefs.mealSuggest = el.checked; commit(); toast(el.checked ? '🍽️ „Šiandien“ skiltyje siūlysiu, ką valgyti' : 'Pasiūlymai išjungti'); }
  if (el.dataset.cat !== undefined && el.dataset.k) { const c = S.categories[+el.dataset.cat], v = el.dataset.k === 'emoji' ? oneEmoji(el.value) : el.value; if (el.dataset.k === 'emoji' && !v) return; c[el.dataset.k] = el.dataset.k === 'type' ? +v : v; commit({noRender: true}); }
  if (el.dataset.c === 'shopCheck') { S.shopChecked = S.shopChecked || {}; S.shopChecked[el.dataset.id] = el.checked; el.closest('.shop').classList.toggle('on', el.checked); commit({noRender: true}); }
  if (el.dataset.c === 'importData') { const f = el.files[0]; if (!f) return; f.text().then(async t => { try { const d = JSON.parse(t); if (!d.profile) throw 0; if (!await ask('Pakeisti visus duomenis?', 'Dabartiniai duomenys bus pakeisti šia kopija.', {danger: true, yes: 'Pakeisti'})) return; S = migrate(d); commit(); toast('Duomenys įkelti ✓', 'good'); } catch (x) { warn('Netinkamas failas'); } }); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') A.closeModal(); });

// ================= PALEIDIMAS =================
function loginScreen(msg = '') {
  document.body.classList.add('login');
  $('#modal')?.classList.remove('open');
  document.querySelector('.app').innerHTML = `<div class="loginbox"><div class="logo big">🌱</div><h1>Life Schedule</h1><p class="hint">Prisijunk – duomenys sinchronizuosis tarp telefono ir kompiuterio.</p>
    <form id="lform"><label class="fld"><span>El. paštas</span><input name="email" type="email" required autocomplete="email"></label>
    <label class="fld"><span>Slaptažodis</span><input name="password" type="password" required minlength="6" autocomplete="current-password"></label>
    ${msg ? `<p class="lmsg">${msg}</p>` : ''}
    <div class="choice"><button class="btn primary big" type="submit" name="act" value="login">Prisijungti</button><button class="btn big" type="submit" name="act" value="signup">Sukurti paskyrą</button></div></form></div>`;
}
document.addEventListener('submit', async e => {
  if (e.target.id !== 'lform') return;
  e.preventDefault();
  const f = e.target, act = e.submitter?.value || 'login', email = f.email.value.trim(), password = f.password.value;
  f.querySelectorAll('button').forEach(b => b.disabled = true);
  try {
    if (act === 'signup') { const ok = await Auth.signup(email, password); if (!ok) return loginScreen('✉️ Paskyra sukurta! Patvirtink el. laišką (pažiūrėk ir Spam), tada prisijunk.'); }
    else await Auth.login(email, password);
    location.reload();
  } catch (err) {
    const m = String(err.message || err);
    loginScreen('⚠️ ' + (m.includes('Invalid login') ? 'Neteisingas el. paštas arba slaptažodis' : m.includes('not confirmed') ? 'El. paštas dar nepatvirtintas – paspausk nuorodą laiške (pažiūrėk ir Spam)' : m.includes('already registered') ? 'Tokia paskyra jau yra – spausk „Prisijungti“' : m.includes('rate limit') ? 'Per daug bandymų – palauk valandą ir bandyk vėl (arba prisijunk, jei paskyra jau sukurta)' : esc(m)));
  }
});
A.logout = async () => { if (!await ask('Atsijungti?', 'Atsijungsi tik šiame įrenginyje.', {icon: '👋', yes: 'Atsijungti'})) return; Auth.logout(); location.reload(); };

// Daigelio žinutės: kartą per savaitę paprašom AI naujų (siunčiami tik skaičiai, jokių asmens duomenų)
async function refreshDgMsgs() {
  if (!cloudOn() || DEV || !sportSet().aiMsgs || !S.workouts.length || (S.dgMsgsAt && diffDays(S.dgMsgsAt, today()) < 7)) return;
  const t = today(), w14 = S.workouts.filter(w => w.date > addDays(t, -14)), last = [...S.workouts].sort((a, b) => a.date < b.date ? 1 : -1)[0];
  const ctx = {workouts_last_14_days: w14.length, goal_per_week: +S.profile.workoutsPerWeek || 3, streak_weeks: streakWeeks(), days_since_last: last ? diffDays(last.date, t) : null, activities: [...new Set(w14.map(w => sportById(w.type)?.[1] || 'jėgos treniruotė'))].slice(0, 5)};
  const r = await DB.fn('dg_msgs', {ctx}).catch(() => null);
  if (r && r.ok && r.msgs) { S.dgMsgs = r.msgs; S.dgMsgsAt = t; commit({noRender: true}); }
}
// Sporto duomenys (pratimai, sportai, kūno žemėlapis) – atskirame faile toje pačioje versijos aplanke
const loadSportData = () => typeof EXDB !== 'undefined' ? Promise.resolve() : new Promise(ok => { const v = window.APP_VERSION, s = document.createElement('script'); s.src = (!v || v === 'src' ? 'src/' : `v/${v}/`) + 'sport.js'; s.onload = ok; s.onerror = ok; document.body.appendChild(s); });
(async () => {
  await loadSportData();
  if (!(await loadData())) { loginScreen(); return; }
  await loadRole();
  // pasirinkta versija galioja tik kūrėjui
  try { if (localStorage.getItem('ls_ver_override') && !isDeveloper() && !window.CLOUD?.test) { localStorage.removeItem('ls_ver_override'); location.reload(); return; } } catch (e) {}
  await loadAccountState();
  if (isDeveloper()) { refreshInbox(); setInterval(refreshInbox, 300000); }
  stepsFromUrl();
  navWatch();
  setTimeout(refreshDgMsgs, 8000);
  if (S.run?.gps) gpsStart();
  if (isNative()) { hcCheck().then(() => { if (HC.ok) hcSync(); }); document.addEventListener('visibilitychange', () => { if (!document.hidden && HC.ok) hcSync(); }); }
  checkNewVersion(); setInterval(checkNewVersion, 300000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkNewVersion(); });
  if (S.settings.onboarded) showWhatsNew();
  setTimeout(checkReplies, 2500); setInterval(checkReplies, 10000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(checkReplies, 1000); });
  // jei buvai kūrėjo režime ir perkrovei puslapį – liekam smėlio dėžėje
  try { const sb = sessionStorage.getItem(DEV_KEY); if (sb && isDeveloper()) { REAL = S; DEV = true; S = migrate(JSON.parse(sb)); } } catch (e) {}
  applyTheme(); render();
  reportMeta(); setTimeout(applyAdjustments, 1500); setInterval(() => { if (!document.hidden) applyAdjustments(); }, 10000);
  if (!S.settings.onboarded) A.onboard();
  checkReminders();
  setInterval(() => { checkReminders(); if (!$('#modal.open') && ['today', 'calendar'].includes(UI.view) && document.activeElement?.tagName !== 'INPUT') render(); }, 60000);
  setInterval(pullIfChanged, 20000);
  setInterval(() => { const el = $('#tElapsed'); if (el) el.textContent = timerElapsed(); if (S.active) document.querySelectorAll('.wClock').forEach(x => x.textContent = clock(S.active.ts)); else if (S.run) document.querySelectorAll('.wClock').forEach(x => x.textContent = fmtClock(runSec(S.run))); if (S.run && UI.view === 'sport' && UI.sp?.p === 'run') updateRunTiles(); tickRest(); }, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) pullIfChanged(); });
  window.addEventListener('online', () => pullIfChanged());
  if ('serviceWorker' in navigator && window.isSecureContext) navigator.serviceWorker.register('sw.js').catch(() => {});
})();


// ================= SAVIJAUTA =================
// Dienos savijauta – vienas jaustukas visai dienai (paspaudus kitą – tik pasikeičia, naujas įrašas neatsiranda).
// Akimirkos – nebūtinos: „šiuo metu jaučiuosi…“. Jei paskutinė buvo < 30 min. – atnaujinama; daugiausia 6 per dieną.
const MOODS = [['😫', 'Labai blogai'], ['😕', 'Prastai'], ['😐', 'Normaliai'], ['🙂', 'Gerai'], ['😁', 'Puikiai']];
const FEEL_GOOD = [['energija', 'Daug energijos'], ['ramus', 'Ramus|Rami'], ['laimingas', 'Laimingas|Laiminga'], ['produktyvus', 'Produktyvus|Produktyvi'], ['issimiegojes', 'Išsimiegojęs|Išsimiegojusi'], ['stiprus', 'Stiprus|Stipri']];
const FEEL_BAD = [['nuovargis', 'Pavargęs|Pavargusi'], ['stresas', 'Stresas'], ['nerimas', 'Nerimas'], ['galva', 'Skauda galvą'], ['migrena', 'Migrena'], ['pilvas', 'Skauda pilvą'], ['raumenys', 'Skauda raumenis'], ['persalimas', 'Peršalęs|Peršalusi']];
const GOOD_KEYS = new Set(FEEL_GOOD.map(x => x[0]));
// „Ramus|Rami“ -> pagal lytį profilyje (Vyras / Moteris)
const gtxt = t => String(t).replace(/([^\s|]+)\|([^\s|.,!?]+)/g, (m, a, b) => S?.profile?.sex === 'f' ? b : a);
const WHY = [['miegas', 'Miegas'], ['darbas', 'Darbas / mokslai'], ['artimieji', 'Artimieji'], ['sportas', 'Sportas'], ['maistas', 'Maistas'],
  ['poilsis', 'Poilsis'], ['sveikata', 'Sveikata'], ['oras', 'Oras'], ['pinigai', 'Pinigai'], ['laisvalaikis', 'Laisvalaikis']];
const whyName = k => (WHY.find(x => x[0] === k) || [k, k])[1];
const symName = k => String(k).startsWith('c:') ? '✏️ ' + k.slice(2) : gtxt(([...FEEL_GOOD, ...FEEL_BAD].find(x => x[0] === k) || [k, k])[1]);
const MOMENT_GAP = 30, MOMENT_MAX = 6;
const wellOn = d => S.wellbeing.filter(w => w.date === d);
const dayWell = d => S.wellbeing.find(w => w.date === d && w.kind === 'day');
const moments = d => wellOn(d).filter(w => w.kind !== 'day').sort((a, b) => (a.time || '') < (b.time || '') ? -1 : 1);
// Dienos nuotaika: dienos įrašas, o jei jo nėra – akimirkų vidurkis
function dayMood(d) { const all = wellOn(d).filter(x => x.mood); return all.length ? Math.round(all.reduce((s, x) => s + x.mood, 0) / all.length) : 0; }
const curMoment = () => { const ms = moments(today()), last = ms[ms.length - 1]; return last && !UI.newMoment && Date.now() - (last.upd || 0) < MOMENT_GAP * 60e3 ? last : null; };
const lastMoment = () => { const ms = moments(today()); return ms[ms.length - 1] || null; };
function saveWell(rec) {
  const d = today(), ms = moments(d), cur = curMoment(), now = fromMin(nowMin());
  if (cur) Object.assign(cur, rec, {upd: Date.now()});
  else if (ms.length >= MOMENT_MAX) Object.assign(ms[ms.length - 1], rec, {time: now, upd: Date.now()});
  else S.wellbeing.push({id: uid(), date: d, kind: 'moment', time: now, upd: Date.now(), why: [], sym: [], note: '', ctx: '', ...rec});
  UI.newMoment = false;
}

const feelChips = (list, cur) => list.map(([k, l]) => `<label class="chipbtn"><input type="checkbox" name="sym[]" value="${k}" ${cur.includes(k) ? 'checked' : ''}><span>${gtxt(l)}</span></label>`).join('');
A.addWell = (d = {}) => {
  const w = d.id ? S.wellbeing.find(x => x.id === d.id) : (d.ctx === 'workout' ? null : curMoment()), ctx = d.ctx || w?.ctx || '', cur = w?.sym || [], own = cur.filter(k => String(k).startsWith('c:')).map(k => k.slice(2)).join(', ');
  const momentDefault = ctx === 'workout' || (w && w.kind !== 'day');
  modal(ctx === 'workout' ? '💪 Kaip jautiesi po treniruotės?' : '💚 Kaip jautiesi?', `
    <div class="emo big">${MOODS.map(([e, l], i) => `<label title="${l}"><input type="radio" name="mood" value="${i + 1}" ${(w?.mood || 0) === i + 1 ? 'checked' : ''}><span>${e}</span></label>`).join('')}</div>
    <h4>Kas lėmė? <small>(nebūtina)</small></h4>
    <div class="chips big">${WHY.map(([k, l]) => `<label class="chipbtn"><input type="checkbox" name="why[]" value="${k}" ${(w?.why || []).includes(k) ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>
    <h4>Kaip jautiesi? <small>(nebūtina)</small></h4>
    <div class="chips big">${feelChips(FEEL_GOOD, cur)}</div><div class="chips big" style="margin-top:6px">${feelChips(FEEL_BAD, cur)}</div>
    <div class="row">${fld('Savais žodžiais (nebūtina)', inp('own', own, 'text', 'placeholder="pvz. įkvėptas, liūdnas, alkanas" maxlength="60"'))}${fld('Pastaba (nebūtina)', inp('note', w?.note || '', 'text', 'placeholder="kas nutiko?" maxlength="200"'))}</div>
    <p class="hint">Įrašoma kaip akimirka su laiku. Viskas, išskyrus jaustuką, – nebūtina.</p>`, o => {
    if (!o.mood) { toast('Pasirink jaustuką'); return false; }
    const ownTags = (o.own || '').split(',').map(x => x.trim()).filter(Boolean).slice(0, 3).map(x => 'c:' + x.slice(0, 30));
    const rec = {mood: +o.mood, sym: [...(o.sym || []), ...ownTags], why: o.why || [], note: (o.note || '').trim(), ctx};
    if (w) Object.assign(w, rec, {upd: Date.now()}); else saveWell(rec);
    commit(); toast(`${MOODS[o.mood - 1][0]} ${moodLine(today(), +o.mood)}`, 'good');
  }, {submit: 'Įrašyti', noFocus: true, extra: w && d.id ? btn('🗑', 'delWell', {id: w.id}, 'danger sm') : ''});
};
A.delWell = d => { S.wellbeing = S.wellbeing.filter(w => w.id !== d.id); A.closeModal(); commit(); };
// Vienas paspaudimas – šiandienos savijauta (paspaudus kitą – tik pasikeičia)
// Jau pažymėta? Keičiasi palaipsniui – vienu laipteliu link pasirinkto (be staigių šuolių 😫 ↔ 😁)
A.quickMood = d => {
  const cur = curMoment(), want = +d.m, m = cur ? cur.mood + Math.sign(want - cur.mood) : want;
  if (cur && cur.mood === want) return toast(`Dabar jau ${MOODS[want - 1][0]}`);
  saveWell({mood: m}); commit();
  toast(m === want ? `${MOODS[m - 1][0]} ${moodLine(today(), m)}` : `${MOODS[m - 1][0]} – paspausk dar kartą, jei tikrai ${MOODS[want - 1][0]}`, 'good');
};
A.newMoment = () => { if (moments(today()).length >= MOMENT_MAX) return toast(`Šiandien jau ${MOMENT_MAX} akimirkos – paskutinė bus atnaujinta`); UI.newMoment = true; render(); toast('Pasirink, kaip jautiesi dabar'); };

// Švelnus palaikymas sunkesnei dienai / džiaugsmas geresnei
// Trumpos, šiltos žinutės – kasdien vis kitokios (be patarimų)
const MOOD_LINES = {
  hard: ['Sunkios dienos irgi praeina. Tu laikaisi 💜', 'Būti ne pačios geriausios formos – visai normalu.', 'Šiandien gali būti švelnesnis|švelnesnė sau.', 'Ačiū, kad pasidalinai, kaip jautiesi.', 'Ir tokia diena yra tavo kelio dalis.', 'Rytoj – nauja pradžia 🌱', 'Nebūtina šiandien būti stipriam|stipriai.', 'Tu darai daugiau, nei manai.'],
  ok: ['Rami diena – irgi gera diena.', 'Stabilu ir ramu – puiku 🙂', 'Ne kiekviena diena turi būti ypatinga.', 'Ramybė – irgi jėga.', 'Lygiai ir ramiai – smagu.', 'Gera, kad randi laiko pažymėti, kaip jautiesi.'],
  good: ['Smagu tai matyti! 🌞', 'Tokių dienų – daugiau!', 'Džiaugiamės kartu su tavimi 🎉', 'Puiki energija – mėgaukis!', 'Šypsena tinka tau 😊', 'Ši diena – tavo!', 'Gera nuotaika užkrečia 💛', 'Taip ir toliau!'],
};
function moodLine(d, m) {
  const set = MOOD_LINES[m <= 2 ? 'hard' : m === 3 ? 'ok' : 'good'], n = Math.round(parseD(d).getTime() / 864e5);
  return gtxt(set[((n % set.length) + set.length + (m === 5 ? 3 : m === 1 ? 2 : 0)) % set.length]);
}
function moodCard(d) {
  const m = dayMood(d); if (!m) return '';
  return `<div class="moodcard ${m <= 2 ? 'hard' : m === 3 ? 'ok' : 'good'}"><b>${MOODS[m - 1][0]} ${moodLine(d, m)}</b></div>`;
}
// Pastebėjimai: dažniausias sunkus ir geras pojūtis, savaitės diena, miegas prieš tas dienas
function wellInsights() {
  const from = addDays(today(), -29), rec = S.wellbeing.filter(w => w.date >= from), out = [];
  const daysWith = good => { const c = {}; rec.forEach(w => (w.sym || []).forEach(k => { if (GOOD_KEYS.has(k) === good && !String(k).startsWith('c:')) (c[k] = c[k] || new Set()).add(w.date); })); return Object.entries(c).sort((a, b) => b[1].size - a[1].size); };
  const sleepH = d => { const s = sleepOn(d); return s ? sleepMinutes(s) / 60 : null; }, avg = a => a.reduce((x, y) => x + y, 0) / a.length;
  const about = ([k, days]) => {
    const ds = [...days], wd = {}; ds.forEach(d => wd[dow(d)] = (wd[dow(d)] || 0) + 1);
    const top = Object.entries(wd).sort((a, b) => b[1] - a[1])[0], sOn = ds.map(sleepH).filter(x => x != null), others = range(from, 30).filter(d => !days.has(d)).map(sleepH).filter(x => x != null);
    let t = `<b>${symName(k)}</b> – ${ds.length} d. per 30 d.`;
    if (ds.length >= 2 && top && top[1] >= 2) t += ` Dažniausiai – <b>${DOW_LONG[top[0] - 1].toLowerCase()}</b>.`;
    if (sOn.length >= 2 && others.length >= 3) { const a = avg(sOn), b = avg(others); if (Math.abs(a - b) >= 0.5) t += ` Tomis dienomis miegojai vidutiniškai <b>${round(a, 1)} val.</b>, kitomis – ${round(b, 1)} val.`; }
    return t;
  };
  const good = daysWith(true), bad = daysWith(false);
  const whyTop = f => { const c = {}; rec.forEach(w => { if (w.mood && f(w.mood)) (w.why || []).forEach(k => c[k] = (c[k] || 0) + 1); }); return Object.entries(c).sort((a, b) => b[1] - a[1])[0]; };
  const gw = whyTop(m => m >= 4), bw = whyTop(m => m <= 2);
  if (gw && gw[1] >= 2) out.push(`🌞 Geras dienas dažniausiai lemia: <b>${whyName(gw[0])}</b> (${gw[1]} k.).`);
  if (bw && bw[1] >= 2) out.push(`🌧️ Sunkesnes dienas dažniausiai lemia: <b>${whyName(bw[0])}</b> (${bw[1]} k.).`);
  if (good[0]) out.push(about(good[0])); if (bad[0]) out.push(about(bad[0])); if (bad[1] && bad[1][1].size >= 2) out.push(about(bad[1]));
  const ms = range(from, 30).map(d => [d, dayMood(d)]).filter(x => x[1]), wk = ms.filter(x => x[0] >= addDays(today(), -6)).map(x => x[1]), prev = ms.filter(x => x[0] < addDays(today(), -6) && x[0] >= addDays(today(), -13)).map(x => x[1]);
  if (wk.length >= 3 && prev.length >= 3) { const a = avg(wk), b = avg(prev); if (Math.abs(a - b) >= 0.4) out.push(a > b ? `🙂 Ši savaitė – geresnė nei praėjusi (${round(a, 1)} vs ${round(b, 1)}).` : `😕 Ši savaitė – sunkesnė nei praėjusi (${round(a, 1)} vs ${round(b, 1)}). Pasirūpink poilsiu.`); }
  const wo = rec.filter(w => w.ctx === 'workout' && w.mood); if (wo.length >= 3) { const m = Math.round(avg(wo.map(w => w.mood))); out.push(`💪 Po treniruočių jautiesi vidutiniškai <b>${MOODS[m - 1][0]} ${MOODS[m - 1][1].toLowerCase()}</b>.`); }
  return out;
}
// Mažas rodiklis pagrindiniame ekrane
const wellRing = d => { const m = dayMood(d); return `<div class="rc wellrc" data-a="addWell" title="Kaip jautiesi šiandien?"><div class="wbig">${m ? MOODS[m - 1][0] : '➕'}</div><span>${m ? MOODS[m - 1][1] : 'Savijauta'}</span></div>`; };
function vWellbeing() {
  const d = today(), m = dayMood(d), cm = curMoment(), lm = lastMoment(), today_ms = wellOn(d).sort((a, b) => (a.time || '00:00') < (b.time || '00:00') ? -1 : 1);
  const mon = UI.wellMonth || d.slice(0, 7), first = mon + '-01', dim = new Date(+mon.slice(0, 4), +mon.slice(5, 7), 0).getDate(), days = range(first, dim), lead = dow(first) - 1;
  const ins = wellInsights(), tab = UI.wellTab || 'today';
  const recent = [...new Set(S.wellbeing.map(w => w.date))].sort().reverse().slice(0, 14);
  const seg = `<div class="mf-top wl-seg"><div class="seg mf-seg">${[['today', 'Šiandien'], ['month', 'Mėnuo'], ['ins', 'Pastebėjimai']].map(([v, l]) => `<button class="${tab === v ? 'on' : ''}" data-a="wellTab" data-v="${v}">${l}</button>`).join('')}</div></div>`;
  const pick = `<section class="card td-card"><h2>Kaip jautiesi?</h2><div class="td-mpick wl-pick">${MOODS.map(([, l], i) => `<button class="${cm?.mood === i + 1 ? 'sel' : ''}" data-a="quickMood" data-m="${i + 1}">${daigelis(i + 1)}${l}</button>`).join('')}</div>
    ${lm ? `<p class="hint">${lm.time} – ${cm ? 'gali dar pakeisti arba pažymėti, kas lėmė (nebūtina)' : 'paspaudus Daigelį prasidės nauja akimirka'}</p>
      <h4>Kas lėmė?</h4><div class="wl-tags">${WHY.map(([k, l]) => `<button class="${(lm.why || []).includes(k) ? 'on' : ''}" data-a="toggleWhy" data-k="${k}">${l}</button>`).join('')}</div>
      <h4>Kaip jautiesi?</h4><div class="wl-tags">${(lm.mood >= 3 ? [...FEEL_GOOD, ...FEEL_BAD] : [...FEEL_BAD, ...FEEL_GOOD]).map(([k, l]) => `<button class="${(lm.sym || []).includes(k) ? 'on' : ''}" data-a="toggleFeel" data-k="${k}">${gtxt(l)}</button>`).join('')}</div>`
      : '<p class="hint">Paspausk Daigelį – tai užtenka. Jei nori, vėliau pažymėk, kas lėmė.</p>'}
    <div class="choice row" style="margin-top:10px">${lm ? btn('＋ Nauja akimirka', 'newMoment', {}, 'sm primary') : ''}${lm ? btn(`${ic('pen', 'sm')} Pastaba`, 'addWell', {id: lm.id}, 'sm') : ''}</div>
    ${UI.newMoment ? '<p class="hint">Pasirink Daigelį – bus nauja akimirka.</p>' : ''}</section>`;
  const support = m ? `<div class="td-hero wl-hero"><div class="td-talk">${daigelis(m)}<div class="td-bubble"><p>${noEmo(moodLine(d, m))}</p></div></div></div>` : '';
  const todayList = today_ms.length ? `<section class="card td-card"><h2>Šiandien</h2>${today_ms.map(w => `<div class="wl-row" data-a="addWell" data-id="${w.id}"><b>${w.time || '–'}</b>${daigelis(w.mood || 3)}<span>${esc([...(w.why || []).map(whyName), ...(w.sym || []).map(symName)].join(' · ') || MOODS[w.mood - 1]?.[1] || '')}${w.note ? `<small>${esc(w.note)}</small>` : ''}</span></div>`).join('')}</section>` : '';
  const month = `<section class="card td-card"><h2>${cap(MONTHS[+mon.slice(5, 7) - 1])} ${mon.slice(0, 4)} <span class="sp"></span>${btn('‹', 'wellMon', {d: -1}, 'ib')}${mon < d.slice(0, 7) ? btn('›', 'wellMon', {d: 1}, 'ib') : ''}</h2>
    <div class="moodcal wl-cal">${DOW.map(x => `<b>${x}</b>`).join('')}${'<span></span>'.repeat(lead)}${days.map(x => { const mm = x > d ? 0 : dayMood(x), bad = wellOn(x).some(w => (w.sym || []).some(k => !GOOD_KEYS.has(k) && !String(k).startsWith('c:')));
      return `<div class="wcell ${x > d ? 'fut' : ''} ${x === d ? 'tod' : ''}" ${wellOn(x).length ? `data-a="wellDay" data-d="${x}"` : ''} title="${fmtDate(x)}${mm ? ' · ' + MOODS[mm - 1][1] : ''}">${mm ? daigelis(mm) : ''}${bad ? '<i></i>' : ''}<small>${parseD(x).getDate()}</small></div>`; }).join('')}</div>
    <p class="hint">Oranžinis taškelis – tą dieną buvo sunkesnių pojūčių.</p></section>`;
  const insights = `<section class="card td-card"><h2>Pastebėjimai</h2>${ins.length ? `<div class="mf-say">${daigelis(4)}<p>${ins[0]}</p></div>${ins.slice(1).map(t => `<div class="td-tip"><span class="ic">${ic('bulb')}</span><div><p style="color:var(--text)">${t}</p></div></div>`).join('')}` : empty('Pažymėk savijautą kelias dienas – čia atsiras pastebėjimai (pvz. kada jautiesi energingiausias ar kada dažniau skauda galvą).')}</section>`;
  const last = `<section class="card td-card"><h2>Paskutinės dienos</h2>${recent.length ? recent.map(x => { const mm = dayMood(x), all = wellOn(x), tags = [...new Set(all.flatMap(w => [...(w.why || []).map(whyName), ...(w.sym || []).map(symName)]))], notes = all.map(w => w.note).filter(Boolean);
      return `<div class="wl-row" data-a="wellDay" data-d="${x}"><b>${fmtDate(x)}</b>${daigelis(mm || 3)}<span>${moments(x).length ? `${moments(x).length} akimirk.` : MOODS[(mm || 3) - 1][1]}${tags.length ? `<small>${esc(tags.join(', '))}</small>` : ''}${notes.length ? `<small>${esc(notes.join(' · '))}</small>` : ''}</span></div>`; }).join('') : empty('Dar nėra įrašų')}</section>`;
  return `${seg}<div class="mf-cols wl-cols"><div class="wl-a wl-t-today ${tab === 'today' ? 'on' : ''}">${support}${pick}${todayList}</div>
    <div class="wl-b"><div class="wl-t-month ${tab === 'month' ? 'on' : ''}">${month}${last}</div><div class="wl-t-ins ${tab === 'ins' ? 'on' : ''}">${insights}</div></div></div>`;
}
A.wellTab = d => { UI.wellTab = d.v; render(); };

A.wellMon = d => { const [y, m] = (UI.wellMonth || today().slice(0, 7)).split('-').map(Number), dt = new Date(y, m - 1 + +d.d, 1); UI.wellMonth = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}`; render(); };
// Vienu paspaudimu – ką lėmė / kaip jautiesi (prie šiandienos savijautos)
const toggleIn = (arr, k) => arr.includes(k) ? arr.filter(x => x !== k) : [...arr, k];
A.toggleWhy = d => { const w = lastMoment(); if (!w) return; w.why = toggleIn(w.why || [], d.k); w.upd = Date.now(); commit(); };
A.toggleFeel = d => { const w = lastMoment(); if (!w) return; w.sym = toggleIn(w.sym || [], d.k); w.upd = Date.now(); commit(); };

// Diena kalendoriuje: visos akimirkos – redaguoti ar ištrinti (paspaudus šalia – užsidaro)
A.wellDay = d => {
  const day = d.d, list = wellOn(day).sort((a, b) => (a.time || '') < (b.time || '') ? -1 : 1);
  if (!list.length) return A.closeModal();
  modal(`${MOODS[dayMood(day) - 1]?.[0] || '💚'} ${fmtDateDow(day)}`, `<div class="tline">${list.map(w => `<div class="tl nohover"><b>${w.time || 'diena'}</b><span class="te">${MOODS[w.mood - 1]?.[0] || '•'}</span>
    <span class="grow">${esc([...(w.why || []).map(whyName), ...(w.sym || []).map(symName)].join(' · ') || MOODS[w.mood - 1]?.[1] || '')}${w.note ? `<small>${esc(w.note)}</small>` : ''}</span>
    ${btn('✏️', 'addWell', {id: w.id}, 'sm ghost')}${btn('🗑', 'delWellDay', {id: w.id, d: day}, 'sm ghost')}</div>`).join('')}</div>`);
};
A.delWellDay = async d => {
  if (!await ask('Ištrinti šį įrašą?', '', {danger: true, icon: '🗑️', yes: 'Ištrinti'})) return;
  S.wellbeing = S.wellbeing.filter(w => w.id !== d.id); commit(); A.wellDay({d: d.d});
};

// Pagrindiniame ekrane – šilta eilutė pagal šiandienos savijautą (ypač sunkesnę dieną)
const wellHomeLine = d => { const m = dayMood(d); return m ? `<div class="wellline ${m <= 2 ? 'hard' : m === 3 ? 'ok' : 'good'}" data-a="go" data-v="wellbeing">${MOODS[m - 1][0]} ${moodLine(d, m)}</div>` : ''; };

// Vienas emoji (net ir sudėtiniai, pvz. 🧑‍🍳, 🏋️‍♂️) – paimam pirmą „simbolį“ taip, kaip jį mato žmogus
function oneEmoji(v) { v = String(v || '').trim(); if (!v) return ''; try { return [...new Intl.Segmenter('lt', {granularity: 'grapheme'}).segment(v)][0].segment; } catch (e) { return [...v].slice(0, 2).join(''); } }

// Dažniausiai valgomi (60 d.) – vienu paspaudimu
function recentMeals() {
  const from = addDays(today(), -60), by = {};
  for (const m of S.meals) if (m.date >= from && m.name) { const k = m.name.toLowerCase(); (by[k] = by[k] || {n: 0, m}).n++; if (m.date >= by[k].m.date) by[k].m = m; }
  return Object.values(by).filter(x => x.n >= 1).sort((a, b) => b.n - a.n).slice(0, 8).map(x => x.m);
}
A.mealRepeat = d => {
  const src = recentMeals().find(m => m.name === d.n); if (!src) return;
  const f = $('#mform'), {id, recipeId, ...rest} = src;
  const dd = f?.date?.value || d.d || today();
  S.meals.push({...rest, id: uid(), date: dd, time: f?.time?.value || (dd === today() ? nowHM() : '12:00')});
  A.closeModal(); commit(); toast(`Įrašyta: ${esc(src.name)} – ${Math.round(src.kcal || 0)} kcal`, 'good');
};
// Kūrėjui: ar AI raktas veikia
A.aiCheck = async () => { toast('🤖 Tikrinu…'); const r = await DB.fn('ai_check').catch(e => ({ok: false, error: e.message})); r.ok ? info('🤖 AI veikia', `<p>Raktas tinkamas, modelis <b>${esc(r.model)}</b>.</p>`) : warn('AI neveikia: ' + (r.error || '?')); };

// ===== Ingredientai – kaip žmonės sako: skysčiai ml / šaukštais, skaičiuojami dalykai vienetais, kita – g =====
const LIQUID_IDS = ['pienas', 'kefyras', 'grietinele', 'alyv_al', 'saul_al', 'sojos', 'sultys', 'gazuotas', 'alus'];
const PIECE_EXTRA = {burokeliai: 150, salotos: 300, kiaus_balt: 33}, BY_WEIGHT = ['vist_krut', 'vist_slaun', 'lasisa'];
const PIECE_WORD = {cesnakai: 'skiltel.', duona_rug: 'riek.', duona_pg: 'riek.', suris: 'riek.', kumpis: 'griežin.', pom_konserv: 'skard.', pup_raud: 'skard.', pup_balt: 'skard.',
  avinz: 'skard.', kukuruzai: 'skard.', kok_pienas: 'skard.', tunas: 'skard.', brokoliai: 'galv.', ziedinis: 'galv.', kopustai: 'galv.', salotos: 'galv.'};
const fmtNum = n => String(n).replace('.', ',');
function fmtIng(fid, g) {
  const fd = food(fid) || {};
  // skysčiai: mažai – šaukštais, daugiau – ml / l
  if (LIQUID_IDS.includes(fid) || fd.liquid) {
    const ml = g / (DENSITY[fid] ?? 1);
    if (ml <= 60) { const sp = Math.round(ml / 15 * 2) / 2; if (sp >= 1 && Math.abs(sp * 15 - ml) <= 4) return `${fmtNum(sp)} šaukšt.`; const ts = Math.round(ml / 5); if (ts >= 1 && ts <= 3) return `${ts} šaukštel.`; }
    return ml >= 1000 ? `${fmtNum(round(ml / 1000, 2))} l` : `${Math.round(ml / 10) * 10 || Math.round(ml)} ml`;
  }
  // skaičiuojami: kiaušiniai, daržovės, vaisiai, konservai, riekės
  const pg = BY_WEIGHT.includes(fid) ? 0 : PIECE_G[fid] || PIECE_EXTRA[fid] || fd.pieceG, n = pg ? g / pg : 0, half = Math.round(n * 2) / 2;
  if (pg && n >= 0.5 && n <= (['suris', 'kumpis'].includes(fid) ? 4 : ['kiausiniai', 'kiaus_balt', 'cesnakai', 'datules', 'ridikeliai', 'lavasas', 'pita', 'bandele', 'trapuciai', 'batonas', 'duona_rug', 'duona_pg'].includes(fid) || fd.pieceG ? 30 : 6) && Math.abs(n - half) <= 0.25 * Math.max(1, half)) return `${fmtNum(half)} ${PIECE_WORD[fid] || fd.pieceWord || 'vnt'} <small>(~${Math.round(g)} g)</small>`;
  return g >= 1000 ? fmtNum(round(g / 1000, 2)) + ' kg' : Math.round(g) + ' g';
}
// ===== Nežinomas produktas → sukuriamas automatiškai (maistinė vertė 100 g) =====
async function aiFood(text) {
  const r = await DB.fn('food_parse', {text: /\d/.test(text) ? text : '100 g ' + text}).catch(() => null);
  const it = r?.ok && r.items?.[0]; if (!it || !(+it.grams > 0)) return null;
  const k = 100 / +it.grams, name = String(it.name || text).trim();
  let f = allFoods().find(x => x.name.toLowerCase() === name.toLowerCase());
  const rcp = (S.receiptFoods || []).find(x => { const a = norm(x.key || x.name), b = norm(name); return a && b && (a.includes(b.slice(0, 6)) || b.includes(a.slice(0, 6))); });
  if (!f) { f = {id: 'f_' + uid(), name, kcal: Math.round(it.kcal * k), p: round(it.p * k, 1), c: round(it.c * k, 1), f: round(it.f * k, 1), s: 0, sat: 0, fi: 0, salt: 0, price: 0, ai: true}; if (/^(ml|l)$/i.test(it.unit)) f.liquid = true; else if (+it.qty > 0 && !/^(g|kg)$/i.test(it.unit)) f.pieceG = Math.round(+it.grams / +it.qty); S.foods.push(f);
    if (rcp) { S.priceOverrides = S.priceOverrides || {}; S.priceMeta = S.priceMeta || {}; S.priceOverrides[f.id] = rcp.price; S.priceMeta[f.id] = {date: rcp.date, src: 'čekis'}; S.receiptFoods = S.receiptFoods.filter(x => x !== rcp); } }
  return {food: f, grams: Math.round(+it.grams)};
}
A.impAi = async () => {
  const I = UI.imp; if (!I || I.aiBusy) return; impSync();
  const todo = I.lines.filter(l => !l.foodId).slice(0, 15); if (!todo.length) return;
  I.aiBusy = true; if ($('#modal.open')) impModal();
  const res = await Promise.all(todo.map(l => aiFood(l.raw)));
  todo.forEach((l, i) => { const x = res[i]; if (x) { l.foodId = x.food.id; if (!l.grams) l.grams = x.grams; } });
  I.aiBusy = false; if (UI.imp === I && $('#modal.open')) impModal();
  const ok = res.filter(Boolean).length; if (ok) { commit({noRender: true}); toast(`✨ Atpažinta ${ok} iš ${todo.length}`); }
};

// ================= PRANEŠIMAI Į TELEFONĄ (Web Push) =================
// Programėlė apskaičiuoja artimiausių ~36 val. priminimus ir nusiunčia į Supabase; ten laikmatis kas 5 min. išsiunčia, kam laikas –
// net kai programėlė uždaryta. Tas pats „tag“ kaip programėlės priminimo, todėl telefone nebūna dviejų vienodų.
const pushOn = () => { try { return localStorage.getItem('ls_push') === '1'; } catch (e) { return false; } };
const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
const isIOS = () => /iPhone|iPad|iPod/i.test(navigator.userAgent);
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
// vietinis laikas (programėlės laiko juostoje) → tikslus momentas
function localAt(date, min) {
  const z = zonedParts(), [y, m, d] = z.date.split('-').map(Number);
  const off = Date.UTC(y, m - 1, d) + z.min * 60e3 - Math.floor(Date.now() / 60e3) * 60e3;
  const [Y, M, D] = date.split('-').map(Number);
  return new Date(Date.UTC(Y, M - 1, D) + min * 60e3 - off).toISOString();
}
function upcomingReminders() {
  const out = [], t = today(), tm = addDays(t, 1), soon = Date.now() - 5 * 60e3;
  const add = (key, date, min, title, body = '') => { const at = localAt(date, min); if (Date.parse(at) > soon) out.push({key, at, title, body, url: './'}); };
  const wake = toMin(S.profile.wake); let bed = toMin(S.profile.bed); if (bed <= wake) bed += 1440;
  for (const d of [t, tm]) {
    for (const e of eventsOn(d)) { const s = toMin(e.start) - (+e.travel || 0); add(`ev|${e.id}|${d}`, d, s - 15, e.title, `Prasideda ${e.start}${+e.travel ? ' – laikas išeiti' : ''}`); }
    for (const k of S.tasks.filter(x => !x.done && x.due)) {
      const dd = diffDays(d, k.due), offs = (k.remind || '1,0') === 'none' ? [] : (k.remind || '1,0').split(',').map(Number);
      if (!offs.length) continue;
      if (dd < 0) add(`late|${k.id}|${d}`, d, 9 * 60, '🚨 Nepadaryta laiku', `${k.title} (buvo iki ${fmtDate(k.due)})`);
      else if (dd === 0 && offs.includes(0)) add(`today|${k.id}|${d}`, d, 9 * 60, '📌 Šiandien', `${k.title}${k.dueTime ? ' iki ' + k.dueTime : ''}${+k.progress ? ` · padaryta ${k.progress}%` : ''}`);
      else if (offs.includes(dd)) add(`pre|${k.id}|${d}`, d, 9 * 60, dd === 1 ? '⏰ Rytoj' : `⏰ Po ${dd} d.`, `Nepamiršk: ${k.title}`);
      else if (+k.est && dd <= 3 && (+k.progress || 0) < 50) add(`slow|${k.id}|${d}`, d, 9 * 60, '🐢 Atsilieka', `${k.title}: liko ${dd} d., padaryta tik ${+k.progress || 0}%`);
    }
    add(`bed|${d}`, d, bed - 30, '🌙 Po 30 min – miegas', 'Padėk telefoną, pasiruošk rytojui (ir išsiimk porciją iš šaldiklio 🧊)');
    for (const p of plansOn(d)) {
      if (p.remind !== false) add(`plan30|${p.id}`, d, toMin(p.start) - 30, `Po 30 min: ${wtypeName(p.type)}`, `${p.exercises?.length ? p.exercises.length + ' pratimai, ' : ''}~${p.duration} min.`);
      add(`plan0|${p.id}`, d, toMin(p.start), '💪 Laikas sportuoti!', `${wtypeName(p.type)} – spausk „▶ Pradėti“`);
    }
    for (const x of storageItems().filter(x => x.place === 'fridge')) {
      const left = x.left - diffDays(t, d); if (left > 1 || left < 0) continue;
      add(`exp|${x.id}|${d}`, d, 9 * 60, left === 0 ? '⏰ Suvalgyk šiandien' : '⏰ Suvalgyk iki rytojaus', `${x.r?.name || ''} šaldytuve (${x.portions} porc.)${x.r?.freezable && left === 1 ? ' – arba užšaldyk' : ''}`);
    }
    if (S.foodPrefs.mealSuggest) {
      try {
        const {mealTimes: mt, sportSlot} = recommendations(d);
        for (const x of mealSuggestions(d, mt, sportSlot)) add(`meal|${d}|${x.slot.t}`, d, x.slot.pack ? x.slot.t - 60 : x.slot.t, x.slot.pack ? '🥡 Pasiimk maistą su savimi' : '🍽️ Laikas pavalgyti',
          x.r ? `${x.r.name}${x.item?.place === 'freezer' ? ' (iš šaldiklio)' : ''}` : x.slot.note || 'Atsargų nėra – greitas valgis');
      } catch (e) {}
    }
  }
  if (S.timer) { const at = new Date(S.timer.ts + 3 * 3600e3).toISOString(); if (Date.parse(at) > soon) out.push({key: `timer|${S.timer.ts}`, at, title: '⏱️ Laikmatis vis dar veikia', body: `${cat(S.timer.cat).name} – jau daugiau nei 3 val. Gal pamiršai sustabdyti?`, url: './'}); }
  const ci = checkinDue(); if (ci) add(`ci|${ci}|${t}`, t, 10 * 60, '🪞 Laikas patikrinimui', ci === 'week' ? 'Savaitės patikrinimas – pasisverk ir pažiūrėk, kaip sekėsi' : 'Mėnesio patikrinimas laukia');
  if (sportReviewDue()) add(`review|${t}`, t, 10 * 60, '📊 Sporto apžvalga', 'Praėjo 2 savaitės – pažiūrėk, ką treniravai, o ką praleidai');
  try { const sp = recommendations(t).recs.find(r => r.kind === 'sport' && r.slot); if (sp) add(`sport|${t}`, t, sp.slot[0] - 10, '💪 Laisvas langas sportui!', sp.title); } catch (e) {}
  return out.sort((a, b) => a.at < b.at ? -1 : 1).slice(0, 150);
}
let PUSH_T = null, PUSH_LAST = '';
function pushSoon(ms = 15000) { if (!pushOn()) return; clearTimeout(PUSH_T); PUSH_T = setTimeout(pushSync, ms); }
async function pushSync() {
  if (!pushOn() || DEV || readOnly() || !S) return;
  const items = upcomingReminders(), sig = JSON.stringify(items);
  if (sig === PUSH_LAST) return;
  try { await DB.rpc('push_sync', {items}); PUSH_LAST = sig; } catch (e) {}
}
setInterval(() => pushSync(), 15 * 60e3);
setTimeout(() => pushSync(), 8000);
const b64u = s => { const b = atob((s + '='.repeat((4 - s.length % 4) % 4)).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(b, c => c.charCodeAt(0)); };
function pushCardHtml() {
  const perm = 'Notification' in window ? Notification.permission : 'nepalaikoma', on = pushOn() && perm === 'granted';
  const iosHint = isIOS() && !isStandalone() ? '<div class="warnbox">📱 iPhone: pranešimai veikia tik programėlei, pridėtai į pradžios ekraną. Safari → Bendrinti → „Į pradžios ekraną“, tada atidaryk iš ten.</div>' : '';
  return `${iosHint}<p>Pranešimai telefone: <b>${on ? 'įjungti ✓' : perm === 'denied' ? 'užblokuoti naršyklėje' : 'neįjungti'}</b></p>
    <p class="hint">Primins apie įvykius, užduotis, sportą${S.foodPrefs.mealSuggest ? ', valgymą' : ''} ir miegą – net kai programėlė uždaryta.</p>
    <div class="choice row">${on ? btn('Bandomasis pranešimas', 'pushTest', {}, 'sm') + btn('Išjungti šiame įrenginyje', 'pushDisable', {}, 'sm ghost') : btn('Įjungti pranešimus', 'pushEnable', {}, 'sm primary')}${btn('Eksportuoti į kalendorių', 'exportIcs', {}, 'sm ghost')}</div>
    ${perm === 'denied' ? '<p class="hint">Naršyklė juos užblokavo – leisk naršyklės / telefono nustatymuose (svetainės leidimai → Pranešimai).</p>' : ''}
    ${DEV ? `<p class="hint">🐞 Kūrėjui: ${btn('Pranešimų raktai', 'vapidKeys', {}, 'sm ghost')}</p>` : ''}`;
}
A.enableNotif = () => A.pushEnable();
A.pushEnable = async () => {
  if (!pushSupported()) return info('📲 Pranešimai', isIOS() ? 'iPhone: pirma pridėk programėlę į pradžios ekraną (Safari → Bendrinti → „Į pradžios ekraną“), atidaryk iš ten ir bandyk dar kartą.' : 'Ši naršyklė nepalaiko pranešimų.');
  const perm = await Notification.requestPermission(); if (perm !== 'granted') { render(); return toast('Pranešimai neleisti'); }
  if (!cloudOn()) { localStorage.setItem('ls_push', '1'); render(); return toast('Testavimo režimas: pranešimai rodomi tik kol programėlė atidaryta'); }
  const k = await DB.fn('push_key');
  if (!k.ok || !k.key) return DEV ? warn('Supabase\'e nėra VAPID raktų. Spausk „🔑 Pranešimų raktai“ ir įrašyk juos į Edge Functions → Secrets.') : toast('Pranešimai dar ruošiami – pabandyk vėliau');
  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    const same = sub && sub.options?.applicationServerKey && btoa(String.fromCharCode(...new Uint8Array(sub.options.applicationServerKey))) === btoa(String.fromCharCode(...b64u(k.key)));
    if (sub && !same) { await sub.unsubscribe().catch(() => {}); sub = null; }
    sub = sub || await reg.pushManager.subscribe({userVisibleOnly: true, applicationServerKey: b64u(k.key)});
    const j = sub.toJSON();
    await DB.rpc('push_subscribe', {p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth, p_device: fbContext().device});
    localStorage.setItem('ls_push', '1'); PUSH_LAST = ''; await pushSync();
    toast('📲 Pranešimai įjungti', 'good'); render();
  } catch (e) { warn('Nepavyko įjungti pranešimų: ' + (e.message || e)); }
};
A.pushDisable = async () => {
  try { const reg = await navigator.serviceWorker.ready, sub = await reg.pushManager.getSubscription(); if (sub) { await DB.rpc('push_unsubscribe', {p_endpoint: sub.endpoint}).catch(() => {}); await sub.unsubscribe(); } } catch (e) {}
  localStorage.removeItem('ls_push'); toast('Pranešimai šiame įrenginyje išjungti'); render();
};
A.pushTest = async () => {
  if (!cloudOn()) return notify('🔔 Pranešimai veikia', 'Taip atrodys priminimai.', 'test');
  toast('Siunčiu…'); const r = await DB.fn('push_test'); r.ok ? toast('🔔 Išsiųsta – pažiūrėk į telefoną', 'good') : warn(r.error || 'Nepavyko');
};
// Kūrėjui: VAPID raktų pora sukuriama tavo naršyklėje ir niekur nesiunčiama – nukopijuok į Supabase Secrets
A.vapidKeys = async () => {
  const kp = await crypto.subtle.generateKey({name: 'ECDSA', namedCurve: 'P-256'}, true, ['sign', 'verify']);
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', kp.publicKey)), jwk = await crypto.subtle.exportKey('jwk', kp.privateKey);
  const pub = btoa(String.fromCharCode(...raw)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const row = (name, v) => `<label class="fld"><span>${name}</span><div class="row"><input readonly value="${esc(v)}" style="flex:1;font-family:monospace;font-size:12px"><button type="button" class="btn sm" onclick="navigator.clipboard.writeText(this.previousElementSibling.value);this.textContent='✓'">Kopijuoti</button></div></label>`;
  modal('Pranešimų raktai', `<p>Supabase → <b>Edge Functions → Secrets</b> → pridėk du įrašus (pavadinimas ir reikšmė):</p>${row('VAPID_PUBLIC_KEY', pub)}${row('VAPID_PRIVATE_KEY', jwk.d)}
    <p class="hint">Raktai sukurti šiame naršyklės lange ir niekur nesiunčiami. Uždarius langą jie dingsta – jei nespėjai nukopijuoti, sukurk naujus. Pakeitus raktus, pranešimus reikės įjungti iš naujo.</p>`, null, {noFocus: true});
};

// ===== „✨ Parašyk“: vienas mygtukas – apskaičiuoja ir išsaugo =====
// Pirmiausia AI; jei jis nepasiekiamas – tyliai atpažįstam iš savo produktų bazės (naudotojui jokių „AI klaidų“)
function localFoodParse(text) {
  const items = [], miss = [];
  for (const part of text.split(/[,;\n+]|\s+ir\s+|\s+su\s+(?=\d)/i).map(x => x.trim()).filter(Boolean)) {
    const r = parseIngredient(part), f = r.foodId && food(r.foodId);
    if (!f) { miss.push(part); continue; }
    const g = r.grams || PIECE_G[f.id] || 100, k = g / 100;
    items.push({name: f.name.replace(/\s*\(.*?\)\s*/g, ' ').trim(), qty: 0, unit: '', grams: g, kcal: Math.round(f.kcal * k), p: round(f.p * k, 1), c: round(f.c * k, 1), f: round(f.f * k, 1), s: round((f.s || 0) * k, 1), fi: round((f.fi || 0) * k, 1), sat: round((f.sat || 0) * k, 1), salt: round((f.salt || 0) * k, 2)});
  }
  return {items, miss};
}
async function saveFoodText(text, date, time) {
  const sb = $('#mform button[type=submit]'); if (sb) { sb.disabled = true; sb.textContent = '⏳ Skaičiuoju…'; }
  let items = [], miss = [];
  const r = await DB.fn('food_parse', {text}).catch(() => null);
  let note = '';
  if (r?.ok && r.items?.length) { items = r.items; note = String(r.note || '').trim(); }
  else { ({items, miss} = localFoodParse(text)); if (DEV && r && !r.ok) console.warn('food_parse:', r.error); }
  if (!items.length) {
    if (sb) { sb.disabled = false; sb.textContent = 'Išsaugoti'; }
    return warn('Neatpažinau, ką valgei. Parašyk paprasčiau, pvz. „2 kiaušiniai, 200 g varškės“, arba įrašyk per „⚡ Greitas“.');
  }
  for (const it of items) S.meals.push({id: uid(), date, time, name: it.name + (it.qty && it.unit && it.unit !== 'porcija' && !(it.qty == 1 && it.unit === 'vnt') ? ` (${it.qty} ${it.unit})` : ''),
    kcal: Math.round(+it.kcal || 0), p: +it.p || 0, c: +it.c || 0, f: +it.f || 0, s: +it.s || 0, fi: +it.fi || 0, sat: +it.sat || 0, salt: +it.salt || 0, g: +it.grams || undefined, ai: true});
  UI.aiText = ''; A.closeModal(); commit();
  const tot = Math.round(sum(items.map(x => +x.kcal || 0)));
  toast(`🍽️ Įrašyta: ${items.map(x => esc(x.name)).join(', ')} – ${tot} kcal${note ? `<br><small>💡 ${esc(note)}</small>` : ''}${miss.length ? `<br><small>Neatpažinau: ${esc(miss.join(', '))}</small>` : ''}`, 'good');
}

// ===== Emoji: greitas pasirinkimas + automatiškai pagal pavadinimą =====
const FOOD_EMOJI = ['🍲', '🥗', '🍝', '🍛', '🍚', '🌯', '🌮', '🥪', '🍔', '🍕', '🍗', '🥩', '🐟', '🍤', '🍳', '🥞', '🥣', '🥘', '🫕', '🥟', '🍜', '🥔', '🥦', '🍰', '🍪', '🥤'];
function emojiPicks() { return `<div class="emopick">${FOOD_EMOJI.map(e => `<button type="button" data-a="pickEmo" data-e="${e}">${e}</button>`).join('')}</div>`; }
A.pickEmo = d => { const i = document.querySelector('#mform [name=emoji], #mform [data-imp=emoji]'); if (!i) return; i.value = d.e; i.dispatchEvent(new Event('input', {bubbles: true})); document.querySelectorAll('.emopick button').forEach(b => b.classList.toggle('on', b.dataset.e === d.e)); };
function suggestEmoji(name) {
  const n = norm(name || '');
  const map = [[/wrap|burrito|lavas|tortil|kebab/, '🌯'], [/taco/, '🌮'], [/sriub|soup|bulvien|ramen/, '🍲'], [/salot|salad/, '🥗'], [/makaron|pasta|spaget|lazanij|lasagn|penne/, '🍝'], [/pic|pizza/, '🍕'],
    [/burger|mesain/, '🍔'], [/kari|curry/, '🍛'], [/ryz|rice|risot|plov/, '🍚'], [/sumust|sandwich|tost/, '🥪'], [/blyn|pancake|blynel/, '🥞'], [/aviz|oat|kose|porridge|granol/, '🥣'],
    [/kiaus|omlet|egg|kiausin/, '🍳'], [/krevet|shrimp|prawn/, '🍤'], [/zuv|lasis|fish|salmon|menk|tun/, '🐟'], [/vist|chicken|kalakut|turkey/, '🍗'], [/jaut|beef|kepsn|steak|kiaul|pork/, '🥩'],
    [/troskin|stew|goulash|gulias/, '🥘'], [/kotlet|frikadel|meatball/, '🍖'], [/virtin|cepelin|dumpl|koldun/, '🥟'], [/pyrag|cake|tort|keks|muffin/, '🍰'], [/sausain|cookie/, '🍪'], [/kokteil|smoothie|shake/, '🥤'], [/bulv|potato/, '🥔']];
  for (const [re, e] of map) if (re.test(n)) return e;
  return '🍽️';
}

// ===== Kiekis žmonių kalba ↔ gramai =====
const amtText = (fid, g) => fmtIng(fid, g).replace(/\s*<small>.*<\/small>/, '');
function amtToG(val, f) {
  const v = String(val ?? '').trim().replace(',', '.'); if (!v) return 0;
  const pg = f && !['suris', 'kumpis', 'vist_krut', 'vist_slaun', 'lasisa'].includes(f.id) ? (PIECE_G[f.id] || f.pieceG) : 0;
  if (/^\d+(\.\d+)?$/.test(v)) { const n = +v; return pg && n <= 12 ? Math.round(n * pg) : Math.round(n); } // „3“ pomidorai = 3 vnt, „500“ = 500 g
  if (!f) return Math.round(parseFloat(v) || 0);
  const r = parseIngredient(`${v} ${f.name}`);
  return r.grams || Math.round(parseFloat(v) || 0);
}
// Tylus atnaujinimas: kai programėlė paslėpta (perjungei į kitą programėlę / kortelę) – persikraunam, grįžus jau nauja versija
document.addEventListener('visibilitychange', () => { if (document.hidden && UI.silentReload && !$('#modal.open')) location.reload(); });
// grįžus į programėlę – iškart pasitikrinam, ar nėra naujos versijos
document.addEventListener('visibilitychange', () => { if (!document.hidden) checkNewVersion(); });

// ===== Maisto ikonos: savi spalvoti piešinukai, parenkami pagal pavadinimą (be emoji pasirinkimo) =====
const FC = {o:'#ff8040', o2:'#ffb07f', o3:'#ffd6bb', cr:'#fff4e8', cr2:'#f3e2cf', bread:'#f6d7a6', crust:'#e8a35a', ch:'#e38945', br2:'#8f4f2c', g:'#7cc79a', g2:'#5aa97c', r:'#ef6a5a', r2:'#c94f5a', y:'#ffc95c', yolk:'#ffad3b', w:'#ffffff'};
const FHL = 'rgba(255,255,255,.5)';
const fhl = (d, w = 3) => `<path d="${d}" stroke="${FHL}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
const fbowl = (fill, y = 30) => `<path d="M7 ${y}h50c0 13-11 22-25 22S7 ${y + 13} 7 ${y}z" fill="${fill}"/>` + fhl(`M13 ${y + 6}c2 6 7 10 13 11`);
const FOOD_IC = {
  soup: ['Sriuba', fbowl(FC.o) + `<ellipse cx="32" cy="30" rx="25" ry="6" fill="${FC.o3}"/><ellipse cx="32" cy="30" rx="21" ry="4.2" fill="${FC.y}"/><circle cx="24" cy="30" r="2.2" fill="${FC.g}"/><circle cx="35" cy="29" r="2" fill="${FC.o}"/><circle cx="41" cy="31" r="1.8" fill="${FC.g2}"/><path d="M26 21c-3-4 3-6 0-10M38 21c-3-4 3-6 0-10" stroke="${FC.o3}" stroke-width="3" stroke-linecap="round" fill="none"/>`],
  pasta: ['Makaronai', `<ellipse class="pl" cx="32" cy="40" rx="27" ry="13" fill="${FC.cr}"/><ellipse cx="32" cy="39" rx="19" ry="8.5" fill="${FC.cr2}"/><path d="M15 38c3-13 30-15 34-2c-6 9-28 10-34 2z" fill="${FC.y}"/><path d="M19 37c6-6 17-7 26-1M21 32c6-4 16-4 22 1" stroke="#e8a83e" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M23 31c4-6 15-6 18 0c-2 5-15 6-18 0z" fill="${FC.r}"/><path d="M33 26c3-4 9-3 9-3s-2 5-9 3z" fill="${FC.g}"/>` + fhl('M27 29c2-2 5-3 8-2', 2.5)],
  salad: ['Salotos', `<path d="M10 32c0-9 8-14 14-10c3-6 13-7 16-1c6-3 14 1 14 11z" fill="${FC.g}"/><path d="M17 32c2-6 8-8 12-5c2-4 9-4 11 1c3 0 7 2 8 4z" fill="${FC.g2}"/><circle cx="24" cy="27" r="4" fill="${FC.r}"/><circle cx="41" cy="26" r="3.5" fill="${FC.r}"/><circle cx="23" cy="26" r="1.2" fill="${FHL}"/>` + fbowl(FC.o2, 31)],
  chicken: ['Vištiena', `<g transform="rotate(-35 32 32)"><rect x="29" y="38" width="6" height="14" fill="${FC.cr}"/><circle cx="28" cy="53" r="4" fill="${FC.cr}"/><circle cx="36" cy="53" r="4" fill="${FC.cr}"/><path d="M32 6c11 0 17 9 15 19c-2 8-8 12-11 16h-8c-3-4-9-8-11-16C15 15 21 6 32 6z" fill="${FC.ch}"/>${fhl('M25 13c-4 4-5 10-3 15')}</g>`],
  fish: ['Žuvis', `<ellipse class="pl" cx="32" cy="46" rx="26" ry="9" fill="${FC.cr}"/><path d="M9 34c4-12 18-17 31-15c9 1 16 6 16 12c0 8-10 13-24 13C19 44 7 42 9 34z" fill="#ff9469"/><path d="M19 26c3 5 3 10 1 15M28 22c3 6 3 13 1 20M37 21c3 6 3 13 1 20M46 23c2 5 2 11 0 17" stroke="${FC.o3}" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M47 38c4-1 7 1 8 4c-4 1-7 0-8-4z" fill="${FC.g}"/>`],
  burger: ['Mėsainis', `<path d="M10 30c0-12 10-19 22-19s22 7 22 19z" fill="#f2a35e"/><ellipse cx="24" cy="20" rx="1.6" ry="1" fill="${FC.cr}"/><ellipse cx="33" cy="17" rx="1.6" ry="1" fill="${FC.cr}"/><ellipse cx="41" cy="22" rx="1.6" ry="1" fill="${FC.cr}"/>${fhl('M17 24c1-4 4-7 8-9')}<rect x="8" y="29" width="48" height="6" rx="3" fill="${FC.g}"/><rect x="9" y="36" width="46" height="8" rx="4" fill="${FC.br2}"/><path d="M11 35h42l-5 5-6-3-8 4-8-4-6 3z" fill="${FC.y}"/><path d="M11 45h42v2c0 3-3 6-6 6H17c-3 0-6-3-6-6z" fill="#f2a35e"/>`],
  pizza: ['Pica', `<path d="M32 58L10 15c14-6 30-6 44 0z" fill="${FC.y}"/><path d="M8 13c15-7 33-7 48 0l-3 6c-13-6-29-6-42 0z" fill="${FC.crust}"/><circle cx="27" cy="27" r="4.5" fill="${FC.r}"/><circle cx="38" cy="32" r="4" fill="${FC.r}"/><circle cx="31" cy="42" r="3.5" fill="${FC.r}"/><path d="M40 22c2-3 6-2 6-2s-1 4-6 2z" fill="${FC.g}"/>` + fhl('M15 22l7 14', 2.5)],
  wrap: ['Wrap', `<g transform="rotate(-30 32 32)"><rect x="22" y="10" width="20" height="46" rx="10" fill="${FC.bread}"/><path d="M26 30h12M26 38h12M26 46h12" stroke="#e0b27a" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="32" cy="14" rx="9" ry="5" fill="${FC.cr}"/><circle cx="29" cy="13" r="3" fill="${FC.g}"/><circle cx="35" cy="14" r="2.6" fill="${FC.o}"/><circle cx="32" cy="16" r="2" fill="${FC.r}"/>${fhl('M26 24v24', 2.5)}</g>`],
  egg: ['Kiaušiniai', `<path class="pl" d="M13 35c-4-10 6-18 15-15c6-8 20-4 21 6c8 4 6 16-3 17c-5 6-19 6-24 0c-7 1-12-3-9-8z" fill="${FC.w}"/><circle cx="31" cy="33" r="8" fill="${FC.yolk}"/><circle cx="28.5" cy="30.5" r="2.5" fill="${FHL}"/>`],
  yogurt: ['Jogurtas', `<path d="M14 24h36l-4 28c-1 3-3 4-6 4H24c-3 0-5-1-6-4z" fill="${FC.cr}"/><path d="M15 32h34l-1 8H16z" fill="${FC.o2}"/><ellipse cx="32" cy="24" rx="18" ry="5" fill="${FC.w}"/><circle cx="26" cy="21" r="4" fill="${FC.r}"/><circle cx="37" cy="20" r="3.5" fill="${FC.r2}"/><circle cx="31" cy="17" r="3" fill="${FC.r}"/><rect x="40" y="21" width="5" height="3" rx="1.5" fill="${FC.crust}"/>` + fhl('M20 44l1 6', 2.5)],
  porridge: ['Košė', fbowl(FC.o) + `<ellipse cx="32" cy="30" rx="25" ry="6" fill="${FC.o3}"/><ellipse cx="32" cy="30" rx="21" ry="4.2" fill="${FC.cr2}"/><circle cx="25" cy="29" r="3.4" fill="#ffe7a8"/><circle cx="25" cy="29" r="1" fill="${FC.crust}"/><circle cx="33" cy="28" r="3.4" fill="#ffe7a8"/><circle cx="33" cy="28" r="1" fill="${FC.crust}"/><circle cx="41" cy="30" r="2.4" fill="${FC.r}"/>`],
  sandwich: ['Sumuštinis', `<rect x="10" y="38" width="44" height="13" rx="6" fill="${FC.bread}" stroke="${FC.crust}" stroke-width="3"/><rect x="9" y="34" width="46" height="5" rx="2.5" fill="#f49a8c"/><path d="M10 31h44l-4 4-6-2-7 3-7-3-7 3-6-3-5 2z" fill="${FC.y}"/><rect x="8" y="27" width="48" height="5" rx="2.5" fill="${FC.g}"/><rect x="10" y="13" width="44" height="14" rx="7" fill="${FC.bread}" stroke="${FC.crust}" stroke-width="3"/>` + fhl('M17 19h12')],
  steak: ['Kepsnys', `<ellipse class="pl" cx="32" cy="44" rx="26" ry="10" fill="${FC.cr}"/><path d="M10 32c0-12 14-17 26-15c12 2 19 9 17 19c-2 9-14 13-26 11C16 45 10 40 10 32z" fill="${FC.br2}"/><path d="M20 26l7 13M30 22l8 16M41 22l6 11" stroke="#6a3519" stroke-width="3" stroke-linecap="round"/><path d="M47 18c3 2 4 6 3 9M50 20l3-1M51 24l3 0" stroke="${FC.g2}" stroke-width="2" stroke-linecap="round" fill="none"/>` + fhl('M15 30c1-4 4-7 8-8')],
  rice: ['Ryžių dubuo', `<path d="M12 31c2-11 12-15 20-15s18 4 20 15z" fill="${FC.w}"/><rect x="18" y="21" width="9" height="6" rx="2" fill="${FC.ch}"/><rect x="29" y="18" width="9" height="6" rx="2" fill="${FC.ch}"/><circle cx="43" cy="25" r="4" fill="${FC.g}"/><path d="M34 27c2-2 5-2 7 0" stroke="${FC.o}" stroke-width="3" stroke-linecap="round"/>` + fbowl(FC.o, 30)],
  pancakes: ['Blynai', `<ellipse cx="32" cy="50" rx="24" ry="6" fill="${FC.cr}" class="pl"/><ellipse cx="32" cy="44" rx="21" ry="6" fill="${FC.crust}"/><ellipse cx="32" cy="42" rx="21" ry="6" fill="${FC.bread}"/><ellipse cx="32" cy="36" rx="21" ry="6" fill="${FC.crust}"/><ellipse cx="32" cy="34" rx="21" ry="6" fill="${FC.bread}"/><ellipse cx="32" cy="28" rx="21" ry="6" fill="${FC.crust}"/><ellipse cx="32" cy="26" rx="21" ry="6" fill="${FC.bread}"/><path d="M20 26c0-4 24-4 24 0c0 3-4 2-5 6c-1 3-3 3-3 0c0-3-4-2-6 1c-2 3-4 2-4-1c0-3-6-2-6-6z" fill="${FC.o}"/><rect x="28" y="19" width="8" height="6" rx="2" fill="#ffe7a8"/><circle cx="40" cy="22" r="3" fill="${FC.r}"/>` + fhl('M14 33c1 2 3 3 5 3', 2.5)],
  dessert: ['Desertas', `<path d="M16 34h32l-4 20H20z" fill="${FC.o}"/><path d="M23 35l1 18M32 35v18M41 35l-1 18" stroke="#e8692c" stroke-width="2"/><path d="M14 34c0-6 4-8 8-8c0-6 5-9 10-9s10 3 10 9c4 0 8 2 8 8z" fill="#ffe1cc"/><circle cx="32" cy="14" r="4" fill="${FC.r}"/><path d="M33 10c1-3 3-5 6-5" stroke="${FC.g2}" stroke-width="2" fill="none" stroke-linecap="round"/>` + fhl('M20 29c1-2 3-3 5-3', 2.5)],
  fruit: ['Vaisiai', `<path d="M32 20c-6-5-20-3-20 12c0 14 10 22 16 20c2-1 6-1 8 0c6 2 16-6 16-20c0-15-14-17-20-12z" fill="${FC.r}"/><path d="M32 21c0-5 1-8 3-10" stroke="${FC.br2}" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M34 15c4-5 10-4 12-3c-3 5-8 6-12 3z" fill="${FC.g}"/>` + fhl('M18 30c0-4 2-6 5-7')],
  coffee: ['Kava / arbata', `<ellipse cx="31" cy="53" rx="22" ry="4" fill="${FC.o3}"/><path d="M46 30c8 0 8 12 0 12" stroke="${FC.cr}" stroke-width="4" fill="none"/><path d="M14 26h32v14c0 8-6 13-13 13h-6c-7 0-13-5-13-13z" fill="${FC.cr}"/><ellipse cx="30" cy="26" rx="16" ry="4" fill="${FC.br2}"/><path d="M30 28c-3-3 1-5 0-2c-1-3 3-1 0 2z" fill="${FC.cr2}"/><path d="M24 18c-2-3 2-5 0-8M34 18c-2-3 2-5 0-8" stroke="${FC.o3}" stroke-width="3" stroke-linecap="round" fill="none"/>` + fhl('M19 33v6', 2.5)],
  smoothie: ['Kokteilis', `<path d="M40 16l6-10" stroke="${FC.r}" stroke-width="3.5" stroke-linecap="round"/><path d="M18 18h28l-4 36c0 2-2 3-4 3H26c-2 0-4-1-4-3z" fill="${FC.o2}"/><path d="M18 18h28l-1 7H19z" fill="#ffe1cc"/><circle cx="18" cy="19" r="7" fill="${FC.y}"/><circle cx="18" cy="19" r="4.5" fill="#ffe08a"/>` + fhl('M24 30l1 18')],
  plate: ['Patiekalas', `<ellipse class="pl" cx="32" cy="38" rx="27" ry="14" fill="${FC.cr}"/><ellipse cx="32" cy="37" rx="19" ry="9" fill="${FC.cr2}"/><circle cx="25" cy="35" r="6" fill="${FC.ch}"/><circle cx="37" cy="33" r="5" fill="${FC.g}"/><circle cx="36" cy="40" r="4.5" fill="${FC.o}"/><path d="M8 12v12M5 12v8c0 3 6 3 6 0v-8" stroke="${FC.o3}" stroke-width="2.5" stroke-linecap="round" fill="none"/>`],
};
// dish type words win; otherwise the first ingredient mentioned
const FOOD_DISH = [['wrap', /wrap|tortilij|burit|kebab|lava[sš]/], ['burger', /burger|mėsain/], ['pizza', /pic[aoųe]|pizz/], ['soup', /sriub|soup|boršt|šaltibarš|troškin|čili|chili|guliaš/], ['rice', /kari|curry|plov|risot/], ['pancakes', /blyn|blynel|pancake|vafl/], ['pasta', /makaron|spaget|pasta|lazanij|penne|noodl/], ['salad', /salot|salad/], ['porridge', /koš|aviž|oat|granol/], ['sandwich', /sumušt|sandw|skrebut|tost/], ['smoothie', /kokteil|smoothie|glotn|sult/], ['dessert', /pyrag|tort|keks|desert|sausain|cake|muffin|ledai/], ['egg', /kiaušinien|omlet/]];
const FOOD_ING = [['fish', /laš|žuv|tun|silk|menk|krevet|salmon|fish/], ['chicken', /višt|kalakut|chicken|sparnel|šlaunel/], ['steak', /kepsn|jautien|kiaul|karbonad|steak|mės/], ['rice', /ryž|rice|poke|dubenė/], ['egg', /kiauš|egg/], ['yogurt', /jogurt|varšk|skyr|yogurt/], ['coffee', /kav[aoų]|coffee|arbat|latte|kapuč/], ['fruit', /obuol|banan|vaisi|uog|fruit|apelsin/]];
function pickFood(name) {
  const s = String(name || '').toLowerCase();
  for (const [k, re] of FOOD_DISH) if (re.test(s)) return [k, 'patiekalo tipas'];
  let best = null, at = 1e9;
  for (const [k, re] of FOOD_ING) { const m = s.search(re); if (m >= 0 && m < at) { at = m; best = k; } }
  return best ? [best, 'pagrindinis ingredientas'] : ['plate', 'neatpažinta – bendra lėkštė'];
}
const foodIcon = n => `<svg class="fd" viewBox="0 0 64 64" aria-hidden="true">${FOOD_IC[pickFood(n)[0]][1]}</svg>`;

// Treniruočių tipai – savi piešinukai vietoj emoji
const WT_IC = {auto: 'wauto', krut_nug: 'wdumb', kojos: 'wleg', rankos: 'warm', virsus: 'wup', visas: 'wfire', presas: 'wcore', smulkus: 'wsmall', kardio: 'wrun'};
const wtIcon = id => `<span class="sp-fi">${ic(WT_IC[id] || 'gym')}</span>`;

// Kategorija – spalvotas taškas + pavadinimas (vietoj emoji)
const catDot = c => `<i class="cdot" style="background:${(c && c.color) || 'var(--muted)'}"></i>`;

// ================= 👟 ŽINGSNIAI =================
// Įrašomi ranka arba atkeliauja iš telefono (asmeninė nuoroda). Nueiti km ir sudegintos kcal skaičiuojami iš ūgio, lyties ir svorio (core.js).
ICONS.steps = '<path d="M8 3c2 0 3 2 3 4.5S10 13 8 13 5 10.5 5 8s1-5 3-5zM6 15h4v2a2 2 0 0 1-4 0zM16 7c2 0 3 2.5 3 5s-1 5.5-3 5.5-3-3-3-5.5S14 7 16 7zM14 19h4v1a2 2 0 0 1-4 0z"/>';
const fmtSteps = n => Math.round(+n || 0).toLocaleString('lt-LT');
function setSteps(date, n, src = 'manual', quiet) {
  S.steps = S.steps || [];
  const ex = S.steps.find(x => x.date === date), v = Math.max(0, Math.round(+n || 0));
  // iš telefono – tik jei daugiau nei jau įrašyta (telefonas siunčia dienos sumą, ranka įrašyto nesumažinam)
  if (ex && src === 'phone' && ex.src === 'manual' && ex.steps > v) return;
  if (ex) Object.assign(ex, {steps: v, src, at: Date.now()}); else S.steps.push({id: uid(), date, steps: v, src, at: Date.now()});
  if (!v) S.steps = S.steps.filter(x => x.date !== date || x.steps);
  if (!quiet) commit();
}
const stepsLine = n => `${fmtNum(stepsKm(n))} km · ~${stepsKcal(n)} kcal`;
A.addSteps = (dd = {}) => {
  const date = dd.d || today(), cur = stepsOn(date);
  modal('Žingsniai', `<div class="row">${fld('Diena', inp('date', date, 'date', `max="${today()}" onchange="stepsDay(this.value)"`))}</div>
    ${fld('Kiek žingsnių?', `<input name="steps" type="number" inputmode="numeric" min="0" max="150000" class="bignum" value="${cur || ''}" placeholder="pvz. 8 000" oninput="stepsPrev(this.value)">`)}
    <div class="stp-prev" id="stpPrev">${cur ? stepsLine(cur) : 'Įrašyk skaičių iš telefono sveikatos programėlės'}</div>
    <div class="chips">${[2000, 5000, 8000, 10000].map(n => `<button type="button" class="chipbtn" onclick="const i=document.querySelector('#mform [name=steps]');i.value=${n};stepsPrev(${n})">${fmtSteps(n)}</button>`).join('')}</div>
    <details class="impalt"><summary>Kaip skaičiuojama?</summary><p class="hint">Žingsnio ilgis – iš tavo ūgio (${Math.round(strideM() * 100)} cm), sudegintos kalorijos ≈ 0,5 kcal × svoris (${fmtNum(bodyKg())} kg) × nueiti km.
      Jos atimamos iš tos dienos suvalgytų kalorijų, bet niekada žemiau 0.</p></details>
    ${fld('Dienos tikslas', inp('goal', stepGoal(), 'number', 'min="1000" max="50000" step="500"'))}
    <p class="center">${btn('Automatiškai iš telefono', 'stepsPhone', {}, 'sm ghost')}</p>`, o => {
    const n = Math.round(+o.steps); if (!(n >= 0) || n > 150000) { toast('Įrašyk žingsnių skaičių'); return false; }
    if (+o.goal >= 1000) S.profile.stepGoal = Math.round(+o.goal);
    setSteps(o.date || today(), n, 'manual');
    toast(n ? `Įrašyta: ${fmtSteps(n)} žingsnių · ${stepsLine(n)}` : 'Žingsniai ištrinti', 'good');
  }, {noFocus: innerWidth < 700});
};
window.stepsPrev = v => { const e = $('#stpPrev'); if (e) e.textContent = +v > 0 ? stepsLine(+v) : 'Įrašyk skaičių iš telefono sveikatos programėlės'; };
window.stepsDay = d => { const i = document.querySelector('#mform [name=steps]'); if (i) { i.value = stepsOn(d) || ''; stepsPrev(i.value); } };
// Sporto skirtukas: šiandien + savaitė
function stepsCard() {
  const d = today(), n = stepsOn(d), g = stepGoal(), goals = sportOn(), days = range(addDays(d, -6), 7);
  const vals = days.map(stepsOn), logged = vals.filter(Boolean), avg = Math.round(sum(logged) / Math.max(1, logged.length));
  const bars = days.map((x, i) => ({label: DOW[dow(x) - 1].slice(0, 2), segs: [{v: vals[i], color: goals && vals[i] >= g ? 'var(--br)' : 'var(--s3)', name: 'žingsn.'}], click: {a: 'addSteps', d: x}}));
  return `<section class="card td-card"><h2>Žingsniai${goals ? ` <small>tikslas ${fmtSteps(g)}</small>` : ''}</h2>
    <div class="stp-top" data-a="addSteps"><div class="stp-num"><b>${n ? fmtSteps(n) : '–'}</b><span>${goals ? `iš ${fmtSteps(g)} šiandien` : 'šiandien'}</span></div>
      <div class="stp-meta">${n ? `<span>${fmtNum(stepsKm(n))} km</span><span>−${stepsKcal(n)} kcal</span>` : '<span>Dar neįrašyta</span>'}</div></div>
    ${logged.length ? svgBars(bars, goals ? {h: 120, goal: g} : {h: 120}) + `<p class="hint">7 d. vidurkis: <b>${fmtSteps(avg)}</b> žingsn. per dieną</p>` : ''}
    <div class="sp-acts">${btn(`${ic('plus', 'sm')} Įrašyti žingsnius`, 'addSteps', {}, 'primary')}${btn(`${ic('steps', 'sm')} Iš telefono`, 'stepsPhone')}</div></section>`;
}
// 📲 Automatiškai iš telefono
async function stepsLink() {
  if (!cloudOn()) return 'https://…/functions/v1/super-function?action=steps_in&key=TESTAS&steps=';
  const k = await DB.rpc('step_link_new', {}); return `${CLOUD.url}/functions/v1/${CLOUD.importFn || 'super-function'}?action=steps_in&key=${k}&steps=`;
}
A.stepsPhone = () => {
  const ios = /iPhone|iPad/i.test(navigator.userAgent), and = /Android/i.test(navigator.userAgent);
  modal('Žingsniai automatiškai', `<p>Naršyklės programėlės negali pačios skaityti telefono žingsniamačio, todėl telefonas pats kartą per dieną atsiųs žingsnių skaičių.</p>
    <div class="seg stp-os">${[['ios', 'iPhone'], ['android', 'Android']].map(([k, l]) => `<button type="button" class="${(ios || !and) === (k === 'ios') ? 'on' : ''}" onclick="document.querySelectorAll('.stp-os button,.stp-how').forEach(e=>e.classList.toggle('on',e.dataset.k==='${k}'||e.textContent==='${l}'))">${l}</button>`).join('')}</div>
    <div class="stp-how ${ios || !and ? 'on' : ''}" data-k="ios"><ol class="steps small">
      <li>Spausk „Sukurti mano nuorodą“ ir nukopijuok ją.</li>
      <li>Atsidaryk <b>Shortcuts</b> (Spartieji klavišai) → <b>Automation</b> → <b>+</b> → <b>Time of Day</b>, pvz. 21:30, kasdien → <b>Run Immediately</b>.</li>
      <li>Pridėk veiksmą <b>Find Health Samples</b>: Steps, Start Date – <i>is today</i>.</li>
      <li>Pridėk <b>Calculate Statistics</b>: <i>Sum</i> iš Health Samples.</li>
      <li>Pridėk <b>Text</b>: įklijuok nuorodą, o pačiame gale įterpk kintamąjį <i>Statistics</i>.</li>
      <li>Pridėk <b>Get Contents of URL</b> su tuo tekstu. Viskas – kasdien žingsniai atkeliaus patys.</li></ol></div>
    <div class="stp-how ${and && !ios ? 'on' : ''}" data-k="android"><p class="hint">Android leidžia žingsnius skaityti tik įdiegtoms programėlėms (Health Connect), todėl kol kas paprasčiausia – įrašyti ranka: atsidaryk Google Fit / Samsung Health, pažiūrėk dienos skaičių ir įrašyk čia (užtrunka 5 s).
      Jei naudoji automatizavimo programėlę (pvz. MacroDroid), ji gali iškviesti tą pačią nuorodą su žingsnių skaičiumi gale.</p></div>
    <div class="row stp-link"><input id="stpLink" readonly placeholder="Nuoroda dar nesukurta"><button type="button" class="btn sm" onclick="navigator.clipboard.writeText(document.getElementById('stpLink').value);this.textContent='✓'">Kopijuoti</button></div>
    <div class="choice row">${btn('Sukurti mano nuorodą', 'stepsLinkNew', {}, 'sm primary')}${btn('Išjungti', 'stepsLinkOff', {}, 'sm ghost')}</div>
    <p class="hint">Nuoroda asmeninė – nesidalink ja. Sukūrus naują, senoji nustoja veikti.</p>`);
};
A.stepsLinkNew = async () => { try { const l = await stepsLink(); const i = $('#stpLink'); if (i) i.value = l; toast('Nuoroda sukurta – nukopijuok ją'); } catch (e) { warn('Nepavyko sukurti nuorodos. ' + (DEV ? e.message : '')); } };
A.stepsLinkOff = async () => { try { if (cloudOn()) await DB.rpc('step_link_off', {}); const i = $('#stpLink'); if (i) i.value = ''; toast('Automatinis siuntimas išjungtas'); } catch (e) { warn('Nepavyko'); } };
// ?steps=1234[&date=…] nuorodoje (pvz. telefono automatika atidaro programėlę)
function stepsFromUrl() {
  const q = new URLSearchParams(location.search); if (!q.has('steps')) return;
  const n = Math.round(+q.get('steps')), dt = /^\d{4}-\d{2}-\d{2}$/.test(q.get('date') || '') ? q.get('date') : today();
  history.replaceState(null, '', location.pathname);
  if (!(n >= 0 && n <= 150000) || DEV || readOnly()) return;
  setSteps(dt, n, 'phone'); toast(`Iš telefono: ${fmtSteps(n)} žingsnių · ${stepsLine(n)}`, 'good');
}
