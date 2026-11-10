// ===== Life Schedule – Support Console =====
// Access: signed in + developer/agent role + MFA (aal2). Supabase enforces the same (RLS / is_console()).
// Everyone else just sees "404".
const C = window.CLOUD || {}, TEST = !!C.test;
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const AUTH_KEY = 'manogyv_auth';
const PAGE = new URLSearchParams(location.search), PAGE_CUSTOMER = PAGE.get('customer'), PAGE_KB = PAGE.get('view') === 'kb';
const LS = {get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }};
const ago = iso => { const m = Math.round((Date.now() - Date.parse(iso)) / 60000); return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`; };
const dt = iso => iso ? new Date(iso).toLocaleString('en-GB', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'}) : '–';
const fmtLeft = ms => { const m = Math.max(0, Math.round(ms / 60000)); return m < 60 ? `${m}m` : m < 2880 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${Math.round(m / 1440)}d`; };
const nowIso = () => new Date().toISOString();
const inHours = h => new Date(Date.now() + h * 3600e3).toISOString();
function toast(t) { const e = document.createElement('div'); e.className = 'toast'; e.innerHTML = t; $('#toasts').appendChild(e); setTimeout(() => e.remove(), 4000); }
function modal(html, cls = '') { const m = $('#modal'); m.className = cls; m.innerHTML = `<div class="mbox">${html}</div>`; m.classList.add('open'); }
function closeModal(force) { const m = $('#modal'); if (m.classList.contains('locked') && !force) return; m.classList.remove('open'); }
function ask(title, text = '', o = {}) {
  return new Promise(res => {
    modal(`<div class="askc"><div class="askic">${o.icon || '⚠️'}</div><h3>${title}</h3>${text ? `<p class="muted">${text}</p>` : ''}
      <div class="row"><button class="btn ghost" id="askno">${o.no || 'Cancel'}</button><button class="btn ${o.danger ? 'danger' : 'primary'}" id="askyes">${o.yes || 'Yes'}</button></div></div>`, 'askm');
    const done = v => { closeModal(true); res(v); };
    $('#askno').onclick = () => done(false); $('#askyes').onclick = () => done(true); $('#askyes').focus();
  });
}
document.addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });

// ----- Session (shared with the app on the same site) -----
const sess = () => { try { return JSON.parse(localStorage.getItem(AUTH_KEY)); } catch (e) { return null; } };
const jwt = t => { try { return JSON.parse(decodeURIComponent(escape(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))))); } catch (e) { return {}; } };
function saveSess(j) { localStorage.setItem(AUTH_KEY, JSON.stringify({access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() + (j.expires_in || 3600) * 1000, user: {id: j.user.id, email: j.user.email}})); }
async function authCall(path, body, method = 'POST', tok) {
  const h = {apikey: C.key, 'Content-Type': 'application/json'}; if (tok) h.Authorization = 'Bearer ' + tok;
  const r = await fetch(`${C.url}/auth/v1/${path}`, {method, headers: h, body: body ? JSON.stringify(body) : undefined});
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.msg || j.error_description || j.message || 'Error ' + r.status);
  return j;
}
async function token() {
  const s = sess(); if (!s) throw new Error('no session');
  if (s.expires_at - Date.now() > 60000) return s.access_token;
  const j = await authCall('token?grant_type=refresh_token', {refresh_token: s.refresh_token}); saveSess(j); return j.access_token;
}

// ----- Data: Supabase in the cloud, local server when testing -----
const DB = {
  async req(method, table, q = '', body, prefer) {
    let r;
    if (TEST) r = await fetch(`/api/t/${table}${q ? '?' + q : ''}`, {method, headers: {'Content-Type': 'application/json'}, body: body ? JSON.stringify(body) : undefined, cache: 'no-store'});
    else { const h = {apikey: C.key, Authorization: 'Bearer ' + await token(), 'Content-Type': 'application/json'}; if (prefer) h.Prefer = prefer;
      r = await fetch(`${C.url}/rest/v1/${table}${q ? '?' + q : ''}`, {method, headers: h, body: body ? JSON.stringify(body) : undefined, cache: 'no-store'}); }
    if (!r.ok) throw new Error(`${table}: ${r.status} ${(await r.text()).slice(0, 140)}`);
    const txt = await r.text(); return txt ? JSON.parse(txt) : [];
  },
  list(t, q) { return this.req('GET', t, q); },
  insert(t, row) { return this.req('POST', t, '', row, 'return=representation'); },
  update(t, q, p) { return this.req('PATCH', t, q, p, 'return=representation'); },
  async rpc(name, args) {
    if (TEST) return (await fetch(`/api/rpc/${name}`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(args)})).json();
    const r = await fetch(`${C.url}/rest/v1/rpc/${name}`, {method: 'POST', headers: {apikey: C.key, Authorization: 'Bearer ' + await token(), 'Content-Type': 'application/json'}, body: JSON.stringify(args)});
    if (!r.ok) throw new Error(`${name}: ${r.status}`); return r.json();
  },
};

// ----- Attachments (private Supabase Storage bucket) and email (Brevo via super-function) -----
const STORE = {
  async upload(path, blob, type) {
    const h = TEST ? {} : {apikey: C.key, Authorization: 'Bearer ' + await token(), 'x-upsert': 'false'};
    const r = await fetch(TEST ? `/api/upload/${path}` : `${C.url}/storage/v1/object/attachments/${path}`, {method: 'POST', headers: {...h, 'Content-Type': type || 'application/octet-stream'}, body: blob});
    if (!r.ok) throw new Error('Upload failed: ' + r.status + ' ' + (await r.text()).slice(0, 100));
  },
  async url(path) {
    if (TEST) return `/api/files/${path}`;
    const r = await fetch(`${C.url}/storage/v1/object/sign/attachments/${path}`, {method: 'POST', headers: {apikey: C.key, Authorization: 'Bearer ' + await token(), 'Content-Type': 'application/json'}, body: JSON.stringify({expiresIn: 300})});
    const j = await r.json(); if (!r.ok) throw new Error(j.message || r.status); return C.url + '/storage/v1' + j.signedURL;
  },
};
async function sendMail(id) {
  try {
    const r = TEST ? await fetch('/api/mail', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({message_id: id})})
      : await fetch(`${C.url}/functions/v1/${C.importFn || 'super-function'}`, {method: 'POST', headers: {apikey: C.key, Authorization: 'Bearer ' + await token(), 'Content-Type': 'application/json'}, body: JSON.stringify({action: 'send_mail', message_id: id})});
    return await r.json().catch(() => ({ok: false, error: 'HTTP ' + r.status}));
  } catch (e) { return {ok: false, error: e.message}; }
}
const safeName = n => n.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w.-]+/g, '_').slice(-80);
const kb = n => n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
const mkFile = (name, text, type) => { const blob = new Blob([text], {type}); return {name, type, blob, size: blob.size}; };
const attHtml = m => (m.attachments || []).length ? `<div class="atts">${m.attachments.map(a => `<a class="att" data-file="${esc(a.path)}">📎 ${esc(a.name)} <small>${kb(a.size || 0)}</small></a>`).join('')}</div>` : '';
const mailHtml = m => m.mail_status === 'sent' ? `<small class="ms ok">✉️ Sent by email${m.sent_at ? ' ' + dt(m.sent_at) : ''}</small>`
  : m.mail_status === 'failed' ? `<small class="ms bad">⚠️ Email not sent: ${esc(m.mail_error || '')} · <b data-act="resend" data-m="${m.id}">Retry</b></small>` : '';
// Customer-facing texts (in the customer's language)
const dsarText = t => `Sveiki,\n\natsakydami į jūsų ${new Date(t.created_at).toLocaleDateString('lt-LT')} pateiktą prašymą (Nr. ${String(t.source_id || t.id).slice(0, 8).toUpperCase()}) siunčiame visų Life Schedule programėlėje saugomų jūsų duomenų kopiją:\n• duomenu-kopija.html – skaitoma ataskaita;\n• duomenu-kopija.json – mašininiu būdu nuskaitomas failas (galite perkelti į kitą paslaugą).\n\nDuomenys naudojami tik programėlės veikimui (planavimui, rekomendacijoms), su trečiosiomis šalimis neparduodami. Bet kada galite paprašyti juos ištaisyti arba ištrinti paskyrą programėlės Profilyje.\n\nPagarbiai,\nLife Schedule`;
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
${t('Patikrinimai', ['Data', 'Tipas', 'Svoris', 'Nuotaika', 'Kas pavyko', 'Tikslas'], (D.checkins || []).map(c => [c.date, c.type, c.weight, c.mood, c.wins, c.focus]))}
${t('Pagaminta', ['Data', 'Receptas', 'Porcijos', 'Kaina €'], (D.cooks || []).map(c => [c.date, c.recipeId, c.portions, c.cost]))}
${t('Išlaidos (čekiai)', ['Data', 'Suma €', 'Pastaba'], (D.spend || []).map(s => [s.date, s.amount, s.note]))}
<p><small>Pilni duomenys (taip pat nustatymai ir receptai) – pridėtame JSON faile.</small></p></body></html>`;
}

// ----- Constants -----
const STATUS = [['new', 'New'], ['open', 'Open'], ['pending', 'Pending'], ['hold', 'On hold'], ['solved', 'Solved'], ['closed', 'Closed']];
const stName = s => (STATUS.find(x => x[0] === s) || [s, s])[1];
const ST_COLOR = {new: 'good', open: 'good', pending: 'blue', hold: 'warn', solved: 'bad', closed: 'gray'};
const stChip = s => `<span class="chip c-${ST_COLOR[s] || 'gray'}"><i class="sq"></i>${stName(s)}</span>`;
const PRIO = [['low', 'Low'], ['normal', 'Normal'], ['high', 'High'], ['urgent', 'Urgent']];
const prioRank = p => PRIO.findIndex(x => x[0] === (p || 'normal'));
const stPrio = p => (PRIO.find(x => x[0] === p) || [p, p])[1];
const LANGS = [['lt', '🇱🇹 Lithuanian'], ['en', '🇬🇧 English'], ['sv', '🇸🇪 Swedish'], ['de', '🇩🇪 German'], ['pl', '🇵🇱 Polish'], ['ru', '🇷🇺 Russian'], ['other', '🌐 Other']];
const langName = l => (LANGS.find(x => x[0] === (l || 'lt')) || LANGS[0])[1];
const DEEPL = {DE: 'German', LT: 'Lithuanian', EN: 'English', SV: 'Swedish', PL: 'Polish', RU: 'Russian', FR: 'French', ES: 'Spanish', IT: 'Italian', LV: 'Latvian', ET: 'Estonian', UK: 'Ukrainian', NL: 'Dutch', FI: 'Finnish', NB: 'Norwegian', DA: 'Danish', PT: 'Portuguese', CS: 'Czech', JA: 'Japanese', ZH: 'Chinese', TR: 'Turkish'};
const HOLD_REASONS = ['Consulting with developer', 'Escalating for further review', 'Investigating the issue', 'Waiting for a release', 'Waiting for a third party'];
const UNASSIGN_REASONS = ['Escalating', 'Language not supported', "Don't know how to solve", 'Needs a developer', 'Not my area', 'End of shift'];
const FRT_H = {urgent: 2, high: 8, normal: 24, low: 48};   // first response targets (hours)
const KIND = {bug: '🐞', idea: '💡', question: '❓', other: '💬', outgoing: '📤', dsar_export: '🌍', dsar_delete: '🗑️'};
const kindOf = t => t.outgoing ? 'outgoing' : t.type === 'feedback' ? (['bug', 'idea', 'question'].includes((t.tags || [])[0]) ? t.tags[0] : 'other') : t.type;
const ticketIcon = t => KIND[kindOf(t)] || '💬';
const TITLE_WORDS = {lt: {bug: 'Klaida', idea: 'Idėja', question: 'Klausimas', other: 'Atsiliepimas', dsar_export: 'Duomenų užklausa', dsar_delete: 'Paskyros trynimas'},
  en: {bug: 'Bug report', idea: 'Idea', question: 'Question', other: 'Feedback', dsar_export: 'Data request', dsar_delete: 'Account deletion'}};
const caseTitle = t => t.outgoing && t.subject ? t.subject : `${(TITLE_WORDS[t.language || 'lt'] || {})[kindOf(t)] || 'Case'}: ${t.case_no ?? '–'}`;
// System tags (case type) are not "issue tags"
const SYS_TAGS = new Set(['bug', 'idea', 'question', 'other', 'kūrėjas', 'dsar', 'export', 'delete', 'outgoing', 'feedback']);
const issueTags = t => (t.tags || []).filter(g => !SYS_TAGS.has(g));
function sla(t) {
  if (t.outgoing || t.first_response_at || ['solved', 'closed'].includes(t.status) || !t.created_at) return null;
  const left = Date.parse(t.created_at) + (FRT_H[t.priority] || 24) * 3600e3 - Date.now();
  return {left, missed: left < 0};
}
const slaInline = x => { const s = sla(x); return s ? ` · <b class="${s.missed ? 't-bad' : s.left < 3600e3 ? 't-warn' : ''}">${s.missed ? 'SLA missed' : 'FRT ' + fmtLeft(s.left)}</b>` : ''; };
const slaChip = x => { const s = sla(x); return s ? `<span class="chip ${s.missed ? 'c-bad' : s.left < 3600e3 ? 'c-warn' : ''}" title="First response target">${s.missed ? 'SLA missed' : 'FRT ' + fmtLeft(s.left)}</span>` : ''; };
const byPrio = (a, b) => (prioRank(b.priority) - prioRank(a.priority)) || (Date.parse(a.created_at) - Date.parse(b.created_at));
const caseLink = t => `${location.origin}${location.pathname.replace(/[^/]*$/, '')}#case/${t.case_no}`;
const customerName = t => CUST[t.user_id]?.data?.profile?.name || (t.email || '').split('@')[0] || 'Customer';
const svg = p => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const ICON = {
  home: svg('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>'), plus: svg('<path d="M12 5v14M5 12h14"/>'), search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  layers: svg('<path d="m12 3 9 5-9 5-9-5 9-5z"/><path d="m3 13 9 5 9-5"/>'), code: svg('<path d="m8 7-5 5 5 5M16 7l5 5-5 5"/>'),
  eye: svg('<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>'),
  translate: svg('<path d="M4 5h8M8 3v2M6 5c0 4 3 7 6 8M10 5c0 4-3 7-6 8"/><path d="m13 21 4-9 4 9M14.5 18h5"/>'),
  menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'), book: svg('<path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM8 7h7"/>'),
  comment: svg('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M12 9v6M9 12h6"/>'), chev: svg('<path d="m6 9 6 6 6-6"/>'),
  link: svg('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
  edit: svg('<path d="M4 20h4L19 9l-4-4L4 16z"/>'), usermin: svg('<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 11h6"/>'),
  userplus: svg('<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M19 8v6M16 11h6"/>'), clip: svg('<path d="M21 11.5 12.5 20a5 5 0 0 1-7-7l8.5-8.5a3.5 3.5 0 0 1 5 5L10.5 18a2 2 0 0 1-3-3L15 7.5"/>'),
  sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  moon: svg('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'), out: svg('<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>'), user: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  users: svg('<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-5-6.7"/>'), copy: svg('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>'),
  trash: svg('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'), tag: svg('<path d="M3 12V3h9l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/>'),
};

// ----- State -----
let ME = null, ROLE = null, T = [], MSGS = {}, CUST = {}, PENDING = {}, DRAFT = {}, SENDING = false, SEL = null, MODE = 'reply', FILTER = 'backlog', QTEXT = '', VIEW = 'home', AUDIT = [], CLEAN = false, SIDE = 'customer';
let DEVVIEW = false, INBOX_ON = LS.get('console_inbox') === '1', POP = null, DEVTAB = 'macros', TP = null, MORE = {}, TR = {};
const SR = {q: '', page: 0, rows: null, more: false, busy: false}, PER = 25;
const VIEW_AS = () => ROLE === 'developer' ? (LS.get('console_viewas') || 'developer') : ROLE;   // developer can preview other roles
const CAN_TOGGLE = () => ['developer', 'lead'].includes(VIEW_AS()), IS_DEV = () => VIEW_AS() === 'developer';
const myOpen = () => T.filter(t => t.assignee === ME.id && ['new', 'open'].includes(t.status)).sort(byPrio);
const myHold = () => T.filter(t => t.assignee === ME.id && t.status === 'hold');
const myPendingRecent = () => T.filter(t => t.assignee === ME.id && t.status === 'pending' && Date.now() - Date.parse(t.status_at || t.updated_at) < 5 * 60e3);
const queue = () => T.filter(t => !t.assignee && ['new', 'open'].includes(t.status)).sort(byPrio);

// Theme: dark (black) / light (white)
const applyTheme = () => document.documentElement.dataset.theme = LS.get('console_theme') === 'light' ? 'light' : 'dark';
applyTheme();

// ===== 1. Entry: 404 -> role -> MFA =====
function notFound() { document.title = '404'; $('#root').innerHTML = `<div class="center nf"><h1>404</h1><p>Page not found.</p></div>`; }
async function boot() {
  if (TEST) { ME = {id: 'local-user', email: 'testas@vietinis.lt', name: 'Tester'}; ROLE = LS.get('console_test_role') || 'developer'; return enter(true, true); }
  const s = sess(); if (!s || !C.url) return notFound();
  try {
    const tok = await token();
    const r = await fetch(`${C.url}/rest/v1/user_roles?select=role&user_id=eq.${s.user.id}`, {headers: {apikey: C.key, Authorization: 'Bearer ' + tok}});
    ROLE = r.ok ? (await r.json())[0]?.role : null;
    if (!['developer', 'lead', 'agent'].includes(ROLE)) return notFound();
    ME = {id: s.user.id, email: s.user.email, name: s.user.email.split('@')[0]};
    try { ME.full = (await authCall('user', null, 'GET', tok)).user_metadata?.full_name || ''; } catch (e) {}
    return enter(jwt(tok).aal === 'aal2', false);
  } catch (e) { return notFound(); }
}
// ----- Console session: sign out, 2 h idle -> inbox off, 6 h idle -> code needed again -----
const IDLE_INBOX = 2 * 3600e3, IDLE_LOCK = 6 * 3600e3, IDLE_WARN = IDLE_LOCK - 5 * 60e3;
const lastActive = () => +LS.get('console_active') || 0;
const idleMs = () => Date.now() - lastActive();
let actWritten = 0;
function markActive(force) { const n = Date.now(); if (force || n - actWritten > 15000) { actWritten = n; LS.set('console_active', String(n)); } }
function enter(aal2, sim) {
  const fresh = aal2 && lastActive() && idleMs() < IDLE_LOCK;
  if (LS.get('console_signed_out') === '1') return signedOutScreen(fresh, sim);
  return fresh ? start() : mfaScreen(sim);
}
function signedOutScreen(fresh, sim) {
  document.title = 'Signed out';
  $('#root').innerHTML = `<div class="center"><div class="auth"><div class="lock">👋</div><h2>You're signed out</h2>
    <p class="muted">${fresh ? 'Sign in again to continue working.' : 'Your session has expired – you will need your authenticator code.'}</p>
    <button id="si" class="btn primary big">Sign in</button></div></div>`;
  $('#si').onclick = () => { LS.set('console_signed_out', '0'); if (fresh) { markActive(true); start(); } else mfaScreen(sim); };
}
async function returnCases(why) {
  try {
    const rows = await DB.update('tickets', `assignee=eq.${ME.id}&status=in.(new,open)`, {assignee: null, assignee_name: null, updated_at: nowIso()});
    for (const t of rows || []) { await logEvent(t, `${why} – case returned to queue`); await audit('case returned to queue', t, {why}); }
    return (rows || []).length;
  } catch (e) { return 0; }
}
async function setInbox(on) { INBOX_ON = on; LS.set('console_inbox', on ? '1' : '0'); await heartbeat(); }
async function signOut() {
  POP = null; const n = myOpen().length;
  if (!await ask('Sign out?', `${n ? `Your ${n} open case${n > 1 ? 's' : ''} will go back to the queue. ` : ''}Pending and on-hold cases stay with you.`, {icon: '👋', yes: 'Sign out'})) return render();
  await setInbox(false); await returnCases(`${ME.name} signed out`);
  try { await DB.req('POST', 'agent_presence', 'on_conflict=user_id', {user_id: ME.id, name: ME.name, inbox_on: false, last_seen: new Date(Date.now() - 864e5).toISOString()}, 'resolution=merge-duplicates'); } catch (e) {}
  LS.set('console_signed_out', '1'); location.reload();
}
let WARNED = false;
async function idleCheck() {
  if (!ME) return;
  if (LS.get('console_signed_out') === '1') return location.reload();   // signed out in another window
  const idle = idleMs();
  if (idle > IDLE_LOCK) {
    await setInbox(false); await returnCases('Session expired after 6 h of inactivity');
    LS.set('console_active', '1'); return location.reload();   // -> code needed again
  }
  if (idle > IDLE_INBOX && INBOX_ON && !PAGE_CUSTOMER && !PAGE_KB) {
    await setInbox(false); await returnCases('Inbox turned off after 2 h of inactivity');
    await loadTickets(true); SEL = null; render();
  }
  if (idle > IDLE_WARN && !WARNED) { WARNED = true; ask('Still there?', 'You will be signed out in 5 minutes because of inactivity.', {icon: '⏳', yes: "I'm here", no: 'Close'}); }
  if (idle < IDLE_WARN) WARNED = false;
}
let STARTED = false;
['pointerdown', 'keydown', 'mousemove', 'wheel', 'touchstart'].forEach(ev => document.addEventListener(ev, () => { if (STARTED && LS.get('console_signed_out') !== '1') markActive(); }, {passive: true}));
async function mfaScreen(sim) {
  document.title = 'Sign in';
  let factor = null, enroll = null;
  if (!sim) {
    try {
      const u = await authCall('user', null, 'GET', await token());
      factor = (u.factors || []).find(f => f.factor_type === 'totp' && f.status === 'verified');
      if (!factor) {
        for (const f of (u.factors || []).filter(f => f.status !== 'verified')) await authCall(`factors/${f.id}`, null, 'DELETE', await token()).catch(() => {});
        enroll = await authCall('factors', {factor_type: 'totp', friendly_name: 'Life Schedule ' + Date.now()}, 'POST', await token());
        factor = {id: enroll.id};
      }
    } catch (e) { $('#root').innerHTML = `<div class="center"><p>MFA error: ${esc(e.message)}</p></div>`; return; }
  }
  $('#root').innerHTML = `<div class="center"><div class="auth"><div class="lock">🔐</div><h2>Two-step verification</h2>
    ${sim ? '<p class="muted">TEST: any 6 digits work.</p>' : enroll ? `<p class="muted">First time: scan the QR code with <b>Google Authenticator</b> (or Microsoft Authenticator) and enter the code.</p>
      <div class="qr"><img src="${esc(enroll.totp.qr_code)}" alt="QR"></div><p class="muted">Or enter manually:</p><code>${esc(enroll.totp.secret)}</code>` : '<p class="muted">Enter the 6-digit code from your authenticator app.</p>'}
    <input id="code" class="code" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="000000">
    <button id="go" class="btn primary big">Verify</button><p id="err" class="muted"></p></div></div>`;
  const go = async () => {
    const code = $('#code').value.trim();
    if (!/^\d{6}$/.test(code)) return $('#err').textContent = 'Enter 6 digits';
    if (sim) return start();
    try {
      const ch = await authCall(`factors/${factor.id}/challenge`, {}, 'POST', await token());
      const j = await authCall(`factors/${factor.id}/verify`, {challenge_id: ch.id, code}, 'POST', await token());
      saveSess(j); start();
    } catch (e) { $('#err').textContent = 'Wrong code. Try again.'; $('#code').value = ''; }
  };
  $('#go').onclick = go; $('#code').onkeydown = e => { if (e.key === 'Enter') go(); }; $('#code').focus();
}
function askName(cur = '') {
  return new Promise(res => {
    modal(`<h3>👋 What's your name?</h3><p class="muted">First and last name – visible to the team only. Customers see your first name.</p>
      <div class="frm"><label class="wide">Full name<input id="nm" value="${esc(cur)}" maxlength="60"></label></div><div class="row"><span class="sp"></span><button class="btn primary" id="nmok">Save</button></div>`, cur ? '' : 'locked');
    const ok = async () => {
      const v = $('#nm').value.trim(); if (v.length < 3) return toast('Enter your full name');
      ME.name = v;
      if (TEST) LS.set('console_name', v); else await authCall('user', {data: {full_name: v}}, 'PUT', await token()).catch(() => toast('⚠️ Could not save the name'));
      closeModal(true); heartbeat(); res();
    };
    $('#nmok').onclick = ok; $('#nm').onkeydown = e => { if (e.key === 'Enter') ok(); }; $('#nm').focus();
  });
}

// ===== 2. Console =====
async function start() {
  document.title = PAGE_CUSTOMER ? 'Customer · Console' : PAGE_KB ? 'Knowledge base · Console' : 'Support Console';
  STARTED = true; markActive(true); setInterval(idleCheck, 30000);
  const nm = TEST ? LS.get('console_name') : ME.full;
  if (nm) ME.name = nm; else { $('#root').innerHTML = ''; await askName(); }
  DEVVIEW = CAN_TOGGLE() && LS.get('console_devview') === '1';
  if (PAGE_CUSTOMER) return openCustomer(PAGE_CUSTOMER);
  if (PAGE_KB) { VIEW = 'kbpage'; render(); await loadExtra('kb'); return render(); }
  await Promise.all([loadTickets(), loadExtra()]);
  heartbeat(); setInterval(heartbeat, 60000);
  render();
  window.addEventListener('hashchange', openFromHash);
  if (!(await openFromHash())) await pump();
  setInterval(tick, 5000);
}
async function tick() { if (document.hidden) return; await loadTickets(true); if (SEL) await loadMsgs(SEL, true); await pump(); if (VIEW === 'home' && !POP) render(true); }
async function heartbeat() {
  if (!ME || !STARTED || idleMs() > IDLE_INBOX) return;   // inactive agents look offline -> server returns their cases
  try { await DB.req('POST', 'agent_presence', 'on_conflict=user_id', {user_id: ME.id, name: ME.name, inbox_on: INBOX_ON, last_seen: nowIso()}, 'resolution=merge-duplicates'); } catch (e) {}
}
async function loadTickets(quiet) {
  try {
    const rows = await DB.list('tickets', 'status=neq.closed&order=created_at.desc');
    const keep = T.filter(t => !rows.some(r => r.id === t.id) && (t.status === 'closed' || t.id === SEL));   // closed cases opened via link / search
    T = [...rows, ...keep];
  } catch (e) { if (!quiet) toast('⚠️ Could not load cases: ' + esc(e.message)); }
}
async function loadClosed() {
  try { const rows = await DB.list('tickets', 'status=eq.closed&order=closed_at.desc&limit=200'); for (const r of rows) { const i = T.findIndex(x => x.id === r.id); if (i < 0) T.push(r); else T[i] = r; } render(); }
  catch (e) { toast('⚠️ ' + esc(e.message)); }
}
async function loadMsgs(id, quiet) {
  try { MSGS[id] = await DB.list('ticket_messages', `ticket_id=eq.${id}&order=created_at.asc`); } catch (e) { if (!quiet) toast('⚠️ ' + esc(e.message)); }
}
async function loadCustomer(uid) {
  if (!uid || CUST[uid]) return;
  try { CUST[uid] = await DB.rpc('console_get_user', {target: uid}); } catch (e) { CUST[uid] = {error: e.message}; }
  if (!(uid in META)) await loadMeta(uid);
}
async function audit(action, t, details) {
  try { await DB.insert('audit_log', {actor_id: ME.id, actor_name: ME.name, action, target_user: t?.user_id || null, ticket_id: t?.id || null, details: details || null}); } catch (e) {}
}
async function logEvent(t, body, devNote) {
  try { const [m] = await DB.insert('ticket_messages', {ticket_id: t.id, author_id: ME.id, author_name: ME.name, author_role: 'agent', kind: 'event', body, attachments: [], ...(devNote ? {dev_note: devNote} : {})}); (MSGS[t.id] = MSGS[t.id] || []).push(m); } catch (e) {}
}
async function openFromHash() {
  const m = location.hash.match(/^#case\/(\d+)/); if (!m) return false;
  let t = T.find(x => String(x.case_no) === m[1]);
  if (!t) { try { t = (await DB.list('tickets', `case_no=eq.${m[1]}`))[0]; if (t) T.push(t); } catch (e) {} }
  if (!t) { toast(`Case #${m[1]} not found`); return false; }
  await selectCase(t.id); return true;
}
async function selectCase(id) {
  const t = T.find(x => x.id === id); if (!t) return;
  SEL = id; MODE = 'reply'; SIDE = 'customer'; VIEW = 'home'; POP = null; closeModal(true);
  history.replaceState(null, '', `${location.pathname}${location.search}#case/${t.case_no ?? ''}`);
  render(); await Promise.all([loadMsgs(id), loadCustomer(t.user_id)]);
  if (t.status === 'new' && t.assignee === ME.id) { t.status = 'open'; DB.update('tickets', `id=eq.${t.id}`, {status: 'open', status_at: nowIso(), updated_at: nowIso()}).catch(() => {}); }
  render();
}
function goHome() {
  VIEW = 'home'; POP = null;
  if (SEL && !T.some(x => x.id === SEL)) SEL = null;
  if (!SEL) history.replaceState(null, '', location.pathname + location.search);
  render(); pump().then(() => render(true));
}
// Cases I unassigned myself never come back to me through the inbox
const SKIPPED = () => { try { return JSON.parse(LS.get('console_skip') || '[]'); } catch (e) { return []; } };
const skipCase = id => LS.set('console_skip', JSON.stringify([...SKIPPED(), id].slice(-200)));
// Automatic inbox: one case at a time, most important first (only while the inbox is on)
let PUMPING = false;
async function pump() {
  if (DEVVIEW || PUMPING || PAGE_CUSTOMER || PAGE_KB || !INBOX_ON || VIEW !== 'home') return;
  PUMPING = true;
  try {
    const mine = myOpen();
    if (mine.length) { if (!SEL || !T.some(x => x.id === SEL && x.assignee === ME.id && ['new', 'open'].includes(x.status))) await selectCase(mine[0].id); return; }
    for (const t of queue().filter(x => !SKIPPED().includes(x.id))) {
      const r = await DB.update('tickets', `id=eq.${t.id}&assignee=is.null`, {assignee: ME.id, assignee_name: ME.name, status: 'open', status_at: nowIso(), updated_at: nowIso()}).catch(() => []);
      if (r && r.length) { Object.assign(t, r[0]); await logEvent(t, `Assigned to ${ME.name} (inbox)`); await audit('assigned from inbox', t); await selectCase(t.id); return; }
    }
    if (SEL && !T.some(x => x.id === SEL && x.assignee === ME.id)) SEL = null;
  } finally { PUMPING = false; }
}

// ----- Rendering -----
function render(keepScroll) {
  const t = T.find(x => x.id === SEL), standalone = PAGE_CUSTOMER || PAGE_KB;
  const th = $('.thread'), st = th ? th.scrollTop : null, nearBottom = th ? th.scrollHeight - th.scrollTop - th.clientHeight < 80 : true, prevN = th?.dataset.n, prevT = th?.dataset.t;
  const rp = $('#reply'); if (rp) DRAFT[rp.dataset.tid] = rp.value;
  const body = PAGE_KB ? kbPage() : PAGE_CUSTOMER ? customerView() : EXTRA_VIEW[VIEW] ? EXTRA_VIEW[VIEW]() : VIEW === 'search' ? searchView() : VIEW === 'admin' ? adminView() : VIEW === 'dev' ? devPage() : homeView(t);
  $('#root').innerHTML = standalone ? `<div class="solo"><div class="solohead"><b>🎧 Support Console</b>${TEST ? '<span class="test">TEST</span>' : ''}<span class="sp"></span><span class="muted">${PAGE_KB ? 'Knowledge base' : 'Customer profile'}</span></div>${body}</div>`
    : `<div class="app">${rail()}<div class="content">${body}</div></div>`;
  if ($('#reply') && t) $('#reply').value = DRAFT[t.id] || '';
  const th2 = $('.thread');
  if (th2) th2.scrollTop = keepScroll && st != null && !nearBottom && th2.dataset.n === prevN && th2.dataset.t === prevT ? st : th2.scrollHeight;
}
const ROLE_NAMES = {agent: 'Agent', lead: 'Lead', developer: 'Developer'};
const rb = (act, icon, title, on, extra = '') => `<button class="rb ${on ? 'on' : ''}" data-act="${act}" title="${title}" aria-label="${title}" ${extra}>${icon}</button>`;
function rail() {
  const initials = (ME.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return `<nav class="rail">${rb('home', ICON.home, 'Home', VIEW === 'home')}${rb('newcase', ICON.plus, 'New case', VIEW === 'newcase')}${rb('search', ICON.search, 'Search cases', VIEW === 'search')}${rb('admin', ICON.users, 'Admin panel', VIEW === 'admin')}
    ${CAN_TOGGLE() ? rb('devview', ICON.layers, DEVVIEW ? 'All cases view (on)' : 'All cases view (off)', DEVVIEW) : ''}${IS_DEV() ? rb('devpage', ICON.code, 'Developer tools', VIEW === 'dev') : ''}
    <span class="sp"></span>${VIEW_AS() !== ROLE ? `<span class="asbadge" title="You are previewing the console as ${ROLE_NAMES[VIEW_AS()]}">as ${ROLE_NAMES[VIEW_AS()]}</span>` : ''}${TEST ? '<span class="test">TEST</span>' : ''}
    <div class="popwrap"><button class="avatar sm" data-act="pop" data-p="me" title="${esc(ME.name)}">${esc(initials)}</button>
    ${POP === 'me' ? `<div class="pop up"><div class="pophead"><b>${esc(ME.name)}</b><small>${esc(ROLE_NAMES[ROLE] || ROLE)} · 🔐 MFA</small></div>
      ${ROLE === 'developer' ? `<div class="viewas"><small>View console as</small><div>${Object.entries(ROLE_NAMES).map(([k, l]) => `<button class="${VIEW_AS() === k ? 'on' : ''}" data-act="viewas" data-r="${k}">${l}</button>`).join('')}</div></div>` : ''}
      <button data-act="rename">${ICON.user} Change name</button>
      <button data-act="theme">${document.documentElement.dataset.theme === 'light' ? ICON.moon + ' Dark mode' : ICON.sun + ' Light mode'}</button>
      <button data-act="signout" class="t-bad">${ICON.out} Sign out</button></div>` : ''}</div></nav>`;
}
function homeView(t) {
  return `<div class="home">${DEVVIEW ? devQueue() : agentQueue()}${t ? convHtml(t) + (SIDE === 'kb' ? kbSide() : sideHtml(t)) : `<div class="bgmsg">${idleHtml()}</div>`}</div>`;
}
const qi = (x, extra = '') => `<div class="qi ${x.id === SEL ? 'on' : ''} ${x.status === 'new' ? 'new' : ''}" data-t="${x.id}"><span class="ic">${ticketIcon(x)}</span><div class="qt"><b>${esc(caseTitle(x))}</b>
  <small class="pv">${esc((x.subject || '').slice(0, 70))}</small><small>${ago(x.created_at)}${extra}</small></div>${stChip(x.status)}</div>`;
function agentQueue() {
  const mo = myOpen(), mh = myHold(), mp = myPendingRecent();
  return `<div class="queue"><div class="inboxsw"><button class="switch ${INBOX_ON ? 'on' : ''}" data-act="inbox" aria-label="Inbox"><i></i></button><div><b>Inbox ${INBOX_ON ? 'on' : 'off'}</b><small>${INBOX_ON ? `${queue().length} waiting` : 'Not receiving cases'}</small></div></div>
    ${INBOX_ON ? `<div class="qlist"><h4>Working on</h4>${mo.map(x => qi(x, slaInline(x))).join('') || '<div class="empty sm">—</div>'}
    ${mh.length ? `<h4>On hold</h4>${mh.map(x => qi(x, x.hold_reason ? ` · ${esc(x.hold_reason)}` : '')).join('')}` : ''}
    ${mp.length ? `<h4>Pending</h4>${mp.map(x => qi(x, ' · waiting for reply')).join('')}` : ''}</div>` : '<div class="qlist"></div>'}</div>`;
}
const FILTERS = [['backlog', 'Backlog', t => !t.assignee && ['new', 'open'].includes(t.status)], ['mine', 'Mine', t => t.assignee === ME.id && ['new', 'open', 'pending', 'hold'].includes(t.status)],
  ['waiting', 'Pending / On hold', t => ['pending', 'hold'].includes(t.status)], ['solved', 'Solved', t => t.status === 'solved'], ['outgoing', 'Outgoing', t => t.outgoing && t.status !== 'closed'], ['all', 'All', t => t.status !== 'closed'], ['closed', 'Closed', t => t.status === 'closed', 'dev']];
function devQueue() {
  const q = QTEXT.toLowerCase(), fl = FILTERS.filter(x => !x[3] || IS_DEV()), f = fl.find(x => x[0] === FILTER) || fl[0];
  const list = T.filter(f[2]).filter(t => !q || [caseTitle(t), t.subject, t.email, (t.tags || []).join(' '), '#' + t.case_no].join(' ').toLowerCase().includes(q)).sort(FILTER === 'backlog' ? byPrio : (a, b) => a.created_at < b.created_at ? 1 : -1);
  return `<div class="queue"><div class="qhead"><input id="q" placeholder="Filter" value="${esc(QTEXT)}">
    <div class="filters">${fl.map(([k, l, fn]) => `<button class="${FILTER === k ? 'on' : ''}" data-f="${k}">${l} <i>${T.filter(fn).length}</i></button>`).join('')}</div></div>
    <div class="qlist">${list.map(x => qi(x, `${x.assignee ? ` · ${esc(x.assignee === ME.id ? 'you' : x.assignee_name || '')}` : ''}${slaInline(x)}`)).join('') || '<div class="empty">Nothing here 🎉</div>'}</div></div>`;
}
function idleHtml() {
  const first = esc((ME.name || '').split(' ')[0]);
  const small = DEVVIEW ? 'Select a case on the left.' : !INBOX_ON ? '' : queue().some(x => !SKIPPED().includes(x.id)) ? 'Getting your next case…' : 'All caught up – new cases appear here automatically.';
  return `<div class="wv">👋</div><h1>Welcome back, ${first}!</h1><p>Let's give the best support to everyone today 💙</p>${small ? `<small>${small}</small>` : ''}`;
}
const RATE_EMO = ['😞', '🙁', '😐', '🙂', '😍'];
function msgHtml(m, t) {
  const rt = m.author_role === 'system' && /^Customer rated the support: (\d)\/5 \((.+)\)/.exec(m.body || '');
  if (rt) return `<div class="msg customer rating"><small>${esc(customerName(t))} · ${dt(m.created_at)}</small><span class="stars">${'★'.repeat(+rt[1])}${'☆'.repeat(5 - +rt[1])}</span> ${RATE_EMO[rt[1] - 1] || ''} Rated the support: <b>${esc(rt[2])}</b> (${rt[1]}/5)</div>`;
  if (m.kind === 'event' || m.author_role === 'system') return CLEAN ? '' : `<div class="msg event">${esc(m.body)}${m.dev_note && VIEW_AS() !== 'agent' ? ` <span class="devnote" title="Visible to developers and leads only">${esc(m.dev_note)}</span>` : ''} <small>${m.author_name && !m.body.includes(m.author_name) ? esc(m.author_name) + ' · ' : ''}${dt(m.created_at)}</small></div>`;
  if (m.kind === 'internal') return `<div class="msg internal"><small>Internal note · ${esc(m.author_name || '')} · ${dt(m.created_at)}</small>${linkify(m.body)}${attHtml(m)}</div>`;
  const tr = TR[t.id], tx = m.author_role === 'customer' && tr?.on && tr.map[m.id];
  return `<div class="msg ${m.author_role === 'auto' ? 'agent' : m.author_role}"><small>${m.author_role === 'customer' ? esc(customerName(t)) : m.author_role === 'auto' ? 'Automatic message' : esc(m.author_name || 'Agent')} · ${dt(m.created_at)}${tx ? ` · <b class="trl">Translated from ${esc(DEEPL[tr.from] || tr.from || '?')}</b>` : ''}</small>${m.body === '📎' ? '' : esc(tx || m.body)}${attHtml(m)}${mailHtml(m)}</div>`;
}
// Status choices: never the current one; on hold can't go to on hold, etc.
function stOptions(t) {
  if (t.status === 'closed') return [];
  if (t.status === 'solved') return [['open', 'Reopen']];
  const cur = t.status === 'new' ? 'open' : t.status;
  return [['open', 'Open'], ['pending', 'Pending'], ['hold', 'On hold'], ['solved', 'Close']].filter(([s]) => s !== cur);
}
function convHtml(t) {
  const mine = t.assignee === ME.id, msgs = MSGS[t.id] || [], note = MODE === 'internal', done = ['solved', 'closed'].includes(t.status), iss = ISSUES.find(i => i.id === t.issue_id), opts = stOptions(t);
  const block = t.status === 'closed' ? 'This case is closed – only internal notes can be added.' : t.status === 'solved' ? 'This case is solved. Reopen it to reply.' : !mine ? 'assign' : '';
  const until = ['pending', 'hold'].includes(t.status) && t.status_until ? `${t.status === 'pending' ? 'Auto-solves' : 'Reopens'} ${dt(t.status_until)}` : '';
  return `<div class="conv ${note ? 'internal' : ''}"><div class="chead">
    <div class="hrow"><div class="popwrap"><button class="stpill c-${ST_COLOR[t.status]}" ${opts.length ? 'data-act="pop" data-p="status"' : ''} title="${esc(until)}"><i class="sq"></i>${stName(t.status)}${opts.length ? ICON.chev : ''}</button>
        ${POP === 'status' ? `<div class="pop">${opts.map(([s, l]) => `<button data-act="setst" data-s="${s}"><i class="sq c-${ST_COLOR[s === 'open' ? 'open' : s]}"></i>${l}</button>`).join('')}</div>` : ''}</div>
      <button class="ib ${CLEAN ? 'on' : ''}" data-act="clean" title="${CLEAN ? 'Show' : 'Hide'} activity">${ICON.eye}</button>
      <button class="ib ${TR[t.id]?.on ? 'on' : ''}" data-act="translate" title="${TR[t.id]?.on ? 'Show original' : 'Translate to English'}">${ICON.translate}</button>
      <span class="sp"></span><div class="ctitle"><b>${esc(caseTitle(t))}</b><small>#${t.case_no ?? ''}</small></div>
      ${t.priority && t.priority !== 'normal' ? `<span class="chip ${t.priority === 'urgent' ? 'c-bad' : t.priority === 'high' ? 'c-warn' : ''}">${stPrio(t.priority)}</span>` : ''}${slaChip(t)}
      <div class="popwrap"><button class="ib" data-act="pop" data-p="menu" title="More">${ICON.menu}</button>
        ${POP === 'menu' ? `<div class="pop right"><button data-act="casedata">${ICON.edit} Edit case</button>
          ${!done && !mine ? `<button data-act="assign">${ICON.userplus} Assign to me</button>` : ''}${mine && !done ? `<button data-act="unassign">${ICON.usermin} Unassign case</button>` : ''}
          <button data-act="copylink">${ICON.link} Copy case link</button></div>` : ''}</div></div>
    <div class="irow">${t.assignee ? `<span class="muted">👤 ${mine ? 'You' : esc(t.assignee_name || 'Someone')}</span>` : '<span class="muted">Unassigned</span>'}
      ${t.status === 'hold' && t.hold_reason ? `<span class="chip c-warn">${esc(t.hold_reason)}</span>` : ''}
      ${t.due_at && !done ? `<span class="chip ${Date.parse(t.due_at) - Date.now() < 7 * 864e5 ? 'c-warn' : ''}">Due ${dt(t.due_at)}</span>` : ''}
      ${iss ? `<span class="chip">🧯 ${esc(iss.title.slice(0, 40))}</span>` : ''}${t.rating ? `<span class="chip ${t.rating >= 4 ? 'c-good' : t.rating <= 2 ? 'c-bad' : 'c-warn'}" title="Customer rating">★ ${t.rating}/5 · ${['Very bad', 'Bad', 'Okay', 'Good', 'Very good'][t.rating - 1]}</span>` : ''}
      ${issueTags(t).map(g => `<span class="tag">${esc(g)}<b data-act="rmtag" data-v="${esc(g)}" title="Remove">✕</b></span>`).join('')}<button class="btn sm" data-act="tag">${ICON.tag} Tags</button></div>
    ${t.outgoing && VIEW_AS() !== 'agent' && t.created_reason ? `<div class="oreason"><b>Created by ${esc(t.created_by_name || '?')}</b> · ${esc(t.created_reason)}</div>` : ''}</div>
    <div class="thread" data-n="${msgs.length}" data-t="${t.id}">${msgs.map(m => msgHtml(m, t)).join('') || '<div class="empty">No messages</div>'}</div>
    <div class="composer ${note ? 'internal' : ''}"><div class="ctabs"><button data-mode="reply" class="${!note ? 'on' : ''}">Reply</button><button data-mode="internal" class="note ${note ? 'on' : ''}">Internal note</button></div>
      ${!note && block ? (block === 'assign' ? `<div class="lockbox">Assign the case to yourself to reply. <button class="btn primary" data-act="assign">Assign to me</button></div>`
        : `<div class="lockbox">${block}${t.status === 'solved' ? ' <button class="btn" data-act="setst" data-s="open">Reopen</button>' : ''}</div>`)
      : `<textarea id="reply" data-tid="${t.id}" placeholder="${note ? 'Internal note (in English)…' : 'Write a reply…'}"></textarea>
      ${(PENDING[t.id] || []).length ? `<div class="atts">${PENDING[t.id].map((f, i) => `<span class="att">📎 ${esc(f.name)} <small>${kb(f.size)}</small><b data-act="rmfile" data-i="${i}" title="Remove">✕</b></span>`).join('')}</div>` : ''}
      <div class="crow">${!note && t.channel === 'email' ? `<small>To: <b>${esc(t.email || '')}</b></small>` : ''}
        <span class="sp"></span>${composerTools(t, note)}<label class="ib" title="Attach file (max 10 MB)">${ICON.clip}<input type="file" id="files" multiple hidden></label><button class="btn ${note ? 'warn' : 'primary'}" data-act="send">${note ? 'Add note' : t.channel === 'email' ? 'Send email' : 'Send'}</button></div>`}</div></div>`;
}
function sideHtml(t) {
  const c = CUST[t.user_id], p = c?.data?.profile || {}, m = META[t.user_id], ctx = t.context || {};
  const email = t.channel === 'email', noAcc = !t.user_id || c?.error || (c && !c.id), name = noAcc ? (t.email || 'Unknown sender') : p.name || (t.email || '').split('@')[0] || '—';
  const unverified = !noAcc && c && 'email_confirmed_at' in c && !c.email_confirmed_at, differs = !noAcc && c?.email && t.email && c.email.toLowerCase() !== t.email.toLowerCase();
  const others = T.filter(x => x.user_id && x.user_id === t.user_id && x.id !== t.id).sort((a, b) => a.created_at < b.created_at ? 1 : -1), shown = others.slice(0, MORE[t.id] ? 10 : 4);
  return `<div class="side">${email ? '<div class="chanbar">✉️ Email case <small>– replies go to the customer\'s inbox</small></div>' : ''}
    <div class="card who"><div class="avatar">${noAcc ? '@' : esc(name[0]?.toUpperCase() || '?')}</div><div class="grow"><b>${esc(name)}</b>
      ${noAcc ? '<small class="t-bad">No user found for this email</small>' : `${c?.num ? `<a class="idlink" data-act="profile" data-u="${esc(t.user_id)}" title="Open customer profile">#${c.num} ↗</a>` : ''}<small>${esc(t.email || '')}</small>`}
      ${m?.version || ctx.version ? `<small>v${esc(m?.version || ctx.version)}</small>` : ''}</div>
      ${!noAcc && t.user_id ? `<button class="ib sm" data-act="profile" data-u="${esc(t.user_id)}" title="Open account">${ICON.user}</button>` : ''}</div>
    ${unverified ? '<div class="alertbox">⚠️ <b>Email not verified.</b> Make sure this is really the account owner before sharing or changing account details.</div>' : ''}
    ${differs ? `<div class="alertbox">⚠️ <b>Different email.</b> The case came from ${esc(t.email)}, but the account uses ${esc(c.email)}.</div>` : ''}
    <div class="sbtns"><button class="btn" data-act="kbside">${ICON.book} Knowledge base</button>${t.user_id && !noAcc ? `<button class="btn" data-act="quickcomment">${ICON.comment} Comment</button>` : ''}</div>
    ${t.type === 'dsar_export' && !['solved', 'closed'].includes(t.status) ? `<div class="card"><h3>Data copy</h3>${t.assignee === ME.id ? '<button class="btn primary full" data-act="dsarprep">📄 Prepare files</button>' : '<small>Assign to yourself first</small>'}</div>` : ''}
    <div class="card"><div class="kv"><span>Location</span><b>${esc(t.user_id ? placeOf(t.user_id) : '–')}</b><span>Language</span><b>${langName(t.language)}</b><span>Channel</span><b>${t.channel === 'email' ? '✉️ Email' : '📱 In app'}</b></div></div>
    <div class="card"><h3>Linked cases</h3>${shown.map(x => `<div class="lrow" data-t="${x.id}"><span>${ticketIcon(x)} ${esc(caseTitle(x))}</span>${stChip(x.status)}</div>`).join('') || '<small>None</small>'}
      ${others.length > 4 ? `<button class="btn sm full" data-act="more">${MORE[t.id] ? 'Show less' : `See more (${Math.min(others.length, 10) - 4})`}</button>` : ''}</div></div>`;
}
// ----- Search (all cases by customer #, case #, email, ID or subject) -----
function searchView() {
  return `<div class="page"><div class="pwrap"><h1>Search</h1><div class="sbar"><input id="sq" placeholder="Customer #, case #, email, customer ID or subject" value="${esc(SR.q)}"><button class="btn primary" data-act="dosearch">${ICON.search} Search</button></div>
    ${SR.busy ? '<div class="empty">Searching…</div>' : SR.rows == null ? '<div class="empty">Type and press Enter.</div>' : !SR.rows.length ? '<div class="empty">Nothing found</div>'
      : `<div class="card flush"><table class="tbl click"><tr><th>Case</th><th>Status</th><th>Customer</th><th>Assignee</th><th>Created</th></tr>${SR.rows.map(x => `<tr data-t="${x.id}"><td>${ticketIcon(x)} ${esc(caseTitle(x))} <small>#${x.case_no}</small></td><td>${stChip(x.status)}</td><td>${esc(x.email || '–')}</td><td>${esc(x.assignee_name || '–')}</td><td>${dt(x.created_at)}</td></tr>`).join('')}</table></div>
      ${SR.page || SR.more ? `<div class="row pager"><button class="btn" data-act="spage" data-d="-1" ${SR.page ? '' : 'disabled'}>← Previous</button><span class="muted">Page ${SR.page + 1}</span><button class="btn" data-act="spage" data-d="1" ${SR.more ? '' : 'disabled'}>Next →</button></div>` : ''}`}</div></div>`;
}
async function runSearch() {
  const q = SR.q.trim(); if (!q) { SR.rows = null; return render(); }
  SR.busy = true; render(); let rows = [];
  try {
    const n = q.replace(/^#/, '');
    if (/^\d+$/.test(n)) {
      const byCase = await DB.list('tickets', `case_no=eq.${n}`), c = await DB.rpc('console_find_customer', {n: +n}).catch(() => null);
      const byCust = c?.id ? await DB.list('tickets', `user_id=eq.${c.id}&order=created_at.desc&limit=50`) : [];
      rows = [...byCase, ...byCust.filter(x => !byCase.some(y => y.id === x.id))]; SR.more = false;
    } else {
      const f = /^[0-9a-f-]{36}$/i.test(q) ? `user_id=eq.${q}` : `${q.includes('@') ? 'email' : 'subject'}=ilike.*${encodeURIComponent(q.replace(/[*,()]/g, ' '))}*`;
      const r = await DB.list('tickets', `${f}&order=created_at.desc&limit=${PER + 1}&offset=${SR.page * PER}`);
      SR.more = r.length > PER; rows = r.slice(0, PER);
    }
  } catch (e) { toast('⚠️ ' + esc(e.message)); }
  for (const x of rows) if (!T.some(y => y.id === x.id)) T.push(x);
  SR.rows = rows; SR.busy = false; render(); const i = $('#sq'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
}
// ----- Developer tools -----
const DEVTABS = [['macros', 'Macros'], ['issues', 'Known issues'], ['audit', 'Audit log']];
function devPage() {
  return `<div class="page"><div class="pwrap"><div class="ptabs">${DEVTABS.map(([k, l]) => `<button class="${DEVTAB === k ? 'on' : ''}" data-act="devtab" data-k="${k}">${l}</button>`).join('')}<button data-act="kbwin">Knowledge base ↗</button></div>
    <div class="pbody">${DEVTAB === 'macros' ? macrosView() : DEVTAB === 'issues' ? issuesView() : auditView()}</div></div></div>`;
}
function auditView() {
  return `<div class="card flush"><table class="tbl"><tr><th>When</th><th>Who</th><th>Action</th><th>Case</th><th>Details</th></tr>
    ${AUDIT.map(a => `<tr><td>${dt(a.created_at)}</td><td>${esc(a.actor_name || '')}</td><td>${esc(a.action)}</td><td>${a.ticket_id ? esc('#' + (T.find(x => x.id === a.ticket_id)?.case_no ?? '?')) : ''}</td><td><small>${esc(a.details ? JSON.stringify(a.details) : '')}</small></td></tr>`).join('') || '<tr><td colspan="5" class="empty">No entries</td></tr>'}</table></div>`;
}

// ----- Actions -----
async function updTicket(t, patch, label, ev, devNote) {
  try { const [r] = await DB.update('tickets', `id=eq.${t.id}`, {...patch, updated_at: nowIso()}); Object.assign(t, r || patch);
    const cur = T.find(x => x.id === t.id); if (cur && cur !== t) Object.assign(cur, r || patch);   /* list may have been reloaded meanwhile */
    await audit(label, t, {...patch, ...(devNote ? {reason: devNote} : {})}); if (ev) await logEvent(t, ev, devNote); render(true); }
  catch (e) { toast('⚠️ ' + esc(e.message)); }
}
async function nextCase(t) { if (!DEVVIEW && SEL === t.id) { SEL = null; render(); await pump(); if (!SEL) history.replaceState(null, '', location.pathname + location.search); render(); } }
async function setStatus(t, s, why, extra = {}) {
  if (t.status === s) return;
  const until = s === 'pending' ? inHours(48) : s === 'hold' ? inHours(72) : null;
  const patch = {status: s, status_at: nowIso(), status_until: until, hold_reason: s === 'hold' ? extra.hold_reason || null : null, ...(s === 'solved' ? {solved_at: nowIso()} : s === 'open' ? {solved_at: null} : {})};
  if (s === 'solved' && t.type === 'feedback' && t.source_id) DB.update('feedback', `id=eq.${t.source_id}`, {status: 'done'}).catch(() => {});
  await updTicket(t, patch, `status → ${stName(s)}`, `Status: ${stName(t.status)} → ${stName(s)}${s === 'hold' && extra.hold_reason ? ` (${extra.hold_reason})` : ''}${why ? ` · ${why}` : ''}`);
  if (['pending', 'hold', 'solved'].includes(s)) await nextCase(t);
}
const noReply = t => { const pub = (MSGS[t.id] || []).filter(m => m.kind === 'public' && m.author_role !== 'system'); const last = pub[pub.length - 1]; return !last || last.author_role === 'customer'; };
async function finishClose(t) {
  if (noReply(t) && !await ask('Close without a reply?', 'The customer has not received a reply yet.', {icon: '💬', yes: 'Close anyway'})) return;
  await setStatus(t, 'solved');
}
async function chooseStatus(t, s) {
  POP = null; render(true);
  if (s === 'open') { await setStatus(t, 'open', t.status === 'solved' ? 'reopened' : null); if (!t.assignee) await updTicket(t, {assignee: ME.id, assignee_name: ME.name}, 'assigned to self', `Assigned to ${ME.name}`); return render(true); }
  if (s === 'hold') return holdModal(t);
  if (s === 'pending') { if (noReply(t) && !await ask('Set to pending without a reply?', 'The customer has not received a reply yet.', {icon: '💬', yes: 'Set pending'})) return render(true); return setStatus(t, 'pending'); }
  if (s === 'solved') { if (!issueTags(t).length) return tagPicker(t, true); return finishClose(t); }
}
const reasonModal = (title, list, act, btn, note) => modal(`<h3>${title}</h3><div class="reasons">${list.map((r, i) => `<label><input type="radio" name="hr" value="${esc(r)}" ${i ? '' : 'checked'}> ${esc(r)}</label>`).join('')}
  <label><input type="radio" name="hr" value="__other"> Other…</label><input id="hr_other" placeholder="Describe the reason" hidden></div>
  <div class="row">${note ? `<small class="muted">${note}</small>` : ''}<span class="sp"></span><button class="btn" data-act="mclose">Cancel</button><button class="btn primary" data-act="${act}">${btn}</button></div>`);
const holdModal = () => reasonModal('Put case on hold', HOLD_REASONS, 'holdgo', 'Put on hold', 'Reopens automatically in 3 days.');
const pickedReason = () => { let r = document.querySelector('input[name="hr"]:checked')?.value; if (r === '__other') r = $('#hr_other').value.trim(); return r; };
// Tags: search, tick, save. When closing without a tag – choose one or skip.
const allTags = () => [...new Set(T.flatMap(x => issueTags(x)))].sort();
function tagPicker(t, closing) { TP = {t, sel: new Set(issueTags(t)), q: '', closing}; tagModal(); }
function tagModal() {
  const q = TP.q.trim().toLowerCase().replace(/\s+/g, '-'), list = [...new Set([...allTags(), ...TP.sel])].filter(g => !q || g.includes(q));
  modal(`<h3>${TP.closing ? 'Add an issue tag before closing' : 'Tags'}</h3>
    <div class="tagsel">${[...TP.sel].map(g => `<span class="tag">${esc(g)}<b data-act="tptoggle" data-v="${esc(g)}">✕</b></span>`).join('') || '<small class="muted">No tags selected</small>'}</div>
    <input id="tpq" placeholder="Search or create a tag" value="${esc(TP.q)}">
    <div class="taglist">${list.map(g => `<label class="tli"><input type="checkbox" data-act="tptoggle" data-v="${esc(g)}" ${TP.sel.has(g) ? 'checked' : ''}> ${esc(g)}</label>`).join('')}
      ${q && !list.includes(q) ? `<button class="tli new" data-act="tptoggle" data-v="${esc(q)}">＋ Create “${esc(q)}”</button>` : ''}${!list.length && !q ? '<small class="muted">No tags yet – type to create one</small>' : ''}</div>
    <div class="row"><span class="sp"></span>${TP.closing ? '<button class="btn" data-act="tpskip">Skip</button>' : '<button class="btn" data-act="mclose">Cancel</button>'}<button class="btn primary" data-act="tpsave">${TP.closing ? 'Save and close' : 'Save'}</button></div>`);
}
async function saveTags(t, sel) {
  const old = issueTags(t), add = [...sel].filter(g => !old.includes(g)), rm = old.filter(g => !sel.has(g));
  if (!add.length && !rm.length) return;
  const tags = [...(t.tags || []).filter(g => SYS_TAGS.has(g) || sel.has(g)), ...add];
  await updTicket(t, {tags}, 'changed tags', [add.length && `Tags added: ${add.join(', ')}`, rm.length && `Tags removed: ${rm.join(', ')}`].filter(Boolean).join('; '));
}
function caseData(t) {
  modal(`<h3>Edit case</h3><div class="frm">
    <label class="wide">Subject / preview<input id="c_subj" value="${esc(t.subject)}" maxlength="120"></label>
    <label>Conversation language<select id="c_lang">${LANGS.map(([v, l]) => `<option value="${v}" ${(t.language || 'lt') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <label>Priority<select id="c_prio">${PRIO.map(([v, l]) => `<option value="${v}" ${t.priority === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <label>Channel<select id="c_chan" ${t.channel === 'email' ? 'disabled title="Email cases stay email"' : ''}>${t.channel === 'email' ? '<option value="email" selected>✉️ Email</option>' : `<option value="app" selected>📱 In app</option>${t.email ? '<option value="email">✉️ Email</option>' : ''}`}</select></label>
    <label>Known issue<select id="c_issue"><option value="">– none –</option>${ISSUES.filter(i => i.status !== 'fixed' || i.id === t.issue_id).map(i => `<option value="${i.id}" ${t.issue_id === i.id ? 'selected' : ''}>🧯 ${esc(i.title.slice(0, 50))}</option>`).join('')}<option value="__new">＋ New issue…</option></select></label></div>
    <div class="row"><span class="sp"></span><button class="btn" data-act="mclose">Cancel</button><button class="btn primary" data-act="casesave">Save</button></div>`);
}
async function saveCase(t) {
  const nv = {subject: $('#c_subj').value.trim() || t.subject, language: $('#c_lang').value, priority: $('#c_prio').value, channel: $('#c_chan').value, issue_id: $('#c_issue').value};
  const newIssue = nv.issue_id === '__new'; if (newIssue) nv.issue_id = t.issue_id || '';
  const L = {subject: 'Subject', language: 'Language', priority: 'Priority', channel: 'Channel', issue_id: 'Issue'};
  const show = (k, v) => k === 'language' ? langName(v).replace(/^\S+\s/, '') : k === 'priority' ? stPrio(v) : k === 'channel' ? (v === 'email' ? 'email' : 'in app') : k === 'issue_id' ? (ISSUES.find(i => i.id === v)?.title || '–') : v;
  const patch = {}, diff = [];
  for (const k of Object.keys(nv)) { const old = k === 'language' ? (t[k] || 'lt') : (t[k] || ''); if (nv[k] !== old) { patch[k] = nv[k] || null; diff.push(`${L[k]}: ${show(k, old)} → ${show(k, nv[k])}`); } }
  closeModal(true);
  if (diff.length) await updTicket(t, patch, 'edited case data', 'Case data changed: ' + diff.join('; '));
  if (newIssue) issEdit({}, t);
}
// Translate customer messages to English (DeepL via super-function); shown in place
async function callTranslate(texts) {
  try {
    const r = TEST ? await fetch('/api/translate', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({texts, target: 'EN-GB'})})
      : await fetch(`${C.url}/functions/v1/${C.importFn || 'super-function'}`, {method: 'POST', headers: {apikey: C.key, Authorization: 'Bearer ' + await token(), 'Content-Type': 'application/json'}, body: JSON.stringify({action: 'translate', texts, target: 'EN-GB'})});
    return await r.json();
  } catch (e) { return {ok: false, error: e.message}; }
}
async function translateCase(t) {
  const st = TR[t.id] || (TR[t.id] = {on: false, map: {}, from: ''});
  if (st.on) { st.on = false; return render(true); }
  const todo = (MSGS[t.id] || []).filter(m => m.author_role === 'customer' && m.kind === 'public' && m.body !== '📎' && !(m.id in st.map));
  if (todo.length) {
    const r = await callTranslate(todo.map(m => m.body));
    if (!r.ok) return toast('⚠️ ' + esc(r.error || 'Translation failed'));
    todo.forEach((m, i) => st.map[m.id] = r.texts[i]); st.from = r.from || st.from;
  }
  if (st.from === 'EN') toast('Already in English');
  st.on = true; render(true);
}
document.addEventListener('click', async e => {
  // Clicking anywhere outside an open menu closes it
  if (POP && !e.target.closest('.pop, [data-p]')) { POP = null; render(true); if (!e.target.closest('[data-act],[data-t],[data-f],[data-mode]')) return; }
  const el = e.target.closest('[data-t],[data-f],[data-mode],[data-act],[data-file]'); if (!el) return;
  if (el.dataset.file) { const w = window.open('', '_blank'); try { w.location = await STORE.url(el.dataset.file); } catch (x) { w?.close(); toast('⚠️ ' + esc(x.message)); } return; }
  if (el.dataset.f) { FILTER = el.dataset.f; render(); if (FILTER === 'closed') await loadClosed(); return; }
  if (el.dataset.mode) { MODE = el.dataset.mode; render(true); return; }
  if (el.dataset.t && !el.dataset.act) { if (PAGE_CUSTOMER) return; return selectCase(el.dataset.t); }
  const a = el.dataset.act;
  if (a === 'pop') { POP = POP === el.dataset.p ? null : el.dataset.p; render(true); return; }
  if (a === 'home') return goHome();
  if (a === 'search') { VIEW = 'search'; POP = null; render(); $('#sq')?.focus(); return; }
  if (a === 'dosearch') { SR.q = $('#sq').value; SR.page = 0; return runSearch(); }
  if (a === 'spage') { SR.page = Math.max(0, SR.page + +el.dataset.d); return runSearch(); }
  if (a === 'admin') { VIEW = 'admin'; POP = null; ADM.uid = null; render(); $('#aq')?.focus(); if (ADM.tab === 'deletions') loadDeletions(); return; }
  if (a === 'devpage') { VIEW = 'dev'; render(); if (DEVTAB === 'audit') await loadAudit(); return; }
  if (a === 'devtab') { DEVTAB = el.dataset.k; render(); if (DEVTAB === 'audit') await loadAudit(); else { await loadExtra(DEVTAB); render(); } return; }
  if (a === 'rename') { POP = null; render(true); return askName(ME.name).then(() => render(true)); }
  if (a === 'viewas') { LS.set('console_viewas', el.dataset.r); POP = null; DEVVIEW = CAN_TOGGLE() && LS.get('console_devview') === '1'; if (FILTER === 'closed' && !IS_DEV()) FILTER = 'backlog'; if (VIEW === 'dev' && !IS_DEV()) VIEW = 'home'; render(); await pump(); render(true); return; }
  if (a === 'theme') { LS.set('console_theme', document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'); applyTheme(); render(true); return; }
  if (a === 'signout') return signOut();
  if (a === 'devview') { DEVVIEW = !DEVVIEW; LS.set('console_devview', DEVVIEW ? '1' : '0'); VIEW = 'home'; render(); if (!DEVVIEW) { await pump(); render(); } return; }
  if (a === 'inbox') { await setInbox(!INBOX_ON); if (!INBOX_ON) SEL = null; VIEW = 'home'; render(); if (INBOX_ON) { await pump(); render(); } return; }
  if (a === 'tptoggle') { const v = el.dataset.v; TP.sel.has(v) ? TP.sel.delete(v) : TP.sel.add(v); TP.q = el.classList.contains('new') ? '' : TP.q; tagModal(); $('#tpq')?.focus(); return; }
  if (a === 'tpsave') { const {t, sel, closing} = TP; closeModal(true); await saveTags(t, sel); if (closing) { if (!issueTags(t).length && !await ask('Close without a tag?', '', {icon: '🏷️', yes: 'Close anyway'})) return; return finishClose(t); } return; }
  if (a === 'tpskip') { const {t} = TP; closeModal(true); if (await ask('Close without a tag?', 'Tags help us find similar issues later.', {icon: '🏷️', yes: 'Close anyway'})) return finishClose(t); return; }
  if (EXTRA_ACT[a]) return EXTRA_ACT[a](el);
  const t = T.find(x => x.id === SEL); if (!t) return;
  if (a === 'setst') return chooseStatus(t, el.dataset.s);
  if (a === 'assign') { POP = null; return updTicket(t, {assignee: ME.id, assignee_name: ME.name, ...(t.status === 'new' ? {status: 'open', status_at: nowIso()} : {})}, 'assigned to self', `Assigned to ${ME.name}`); }
  if (a === 'unassign') { POP = null; render(true); return reasonModal('Unassign case', UNASSIGN_REASONS, 'unassigngo', 'Unassign'); }
  if (a === 'unassigngo') {
    const r = pickedReason(); if (!r) return toast('Choose or describe a reason');
    closeModal(true); skipCase(t.id); await updTicket(t, {assignee: null, assignee_name: null}, 'unassigned', 'Unassigned manually', r); return nextCase(t);
  }
  if (a === 'holdgo') { const r = pickedReason(); if (!r) return toast('Choose or describe a reason'); closeModal(true); return setStatus(t, 'hold', null, {hold_reason: r}); }
  if (a === 'clean') { CLEAN = !CLEAN; render(true); return; }
  if (a === 'translate') return translateCase(t);
  if (a === 'more') { MORE[t.id] = !MORE[t.id]; render(true); return; }
  if (a === 'copylink') { POP = null; navigator.clipboard?.writeText(caseLink(t)); toast(`🔗 Link to case #${t.case_no} copied`); render(true); return; }
  if (a === 'casedata') { POP = null; render(true); return caseData(t); }
  if (a === 'casesave') return saveCase(t);
  if (a === 'tag') return tagPicker(t, false);
  if (a === 'rmtag') { const s = new Set(issueTags(t)); s.delete(el.dataset.v); return saveTags(t, s); }
  if (a === 'rmfile') { PENDING[t.id].splice(+el.dataset.i, 1); render(true); return; }
  if (a === 'resend') {
    const m = (MSGS[t.id] || []).find(x => x.id === el.dataset.m); if (!m) return;
    toast('✉️ Sending…'); const r = await sendMail(m.id);
    Object.assign(m, r.ok ? {mail_status: 'sent', sent_at: nowIso(), mail_error: null} : {mail_status: 'failed', mail_error: r.error});
    toast(r.ok ? '✉️ Email sent' : '⚠️ ' + esc(r.error)); render(true); return;
  }
  if (a === 'dsarprep') {
    await loadCustomer(t.user_id); const c = CUST[t.user_id];
    if (!c?.data) return toast('⚠️ Could not load customer data');
    const day = nowIso().slice(0, 10), r = {id: t.source_id || t.id, email: t.email, created_at: t.created_at};
    PENDING[t.id] = [...(PENDING[t.id] || []).filter(f => !f.name.startsWith('duomenu-kopija')),
      mkFile(`duomenu-kopija-${day}.html`, buildReport(c.data, r), 'text/html'),
      mkFile(`duomenu-kopija-${day}.json`, JSON.stringify({request: {id: r.id, created_at: r.created_at}, exported_at: nowIso(), data: c.data}, null, 2), 'application/json')];
    MODE = 'reply'; const rp = $('#reply');
    if (rp) { if (!rp.value.trim()) rp.value = dsarText(t); } else if (!DRAFT[t.id]) DRAFT[t.id] = dsarText(t);
    if (t.source_id) DB.update('dsar_requests', `id=eq.${t.source_id}&status=eq.received`, {status: 'in_progress'}).catch(() => {});
    audit('prepared data copy', t); render(); return;
  }
  if (a === 'send') {
    if (SENDING) return;
    const body = $('#reply').value.trim(), files = PENDING[t.id] || []; if (!body && !files.length) return;
    const kind = MODE === 'internal' ? 'internal' : 'public', email = kind === 'public' && t.channel === 'email';
    if (email && !t.email) return toast('Customer has no email');
    SENDING = true; el.disabled = true; el.textContent = files.length ? 'Uploading…' : 'Sending…';
    try {
      const atts = [];
      for (const f of files) { const path = `${t.id}/${kind}/${crypto.randomUUID().slice(0, 8)}-${safeName(f.name)}`; await STORE.upload(path, f.blob, f.type); atts.push({name: f.name, path, size: f.size, type: f.type}); }
      const [m] = await DB.insert('ticket_messages', {ticket_id: t.id, author_id: ME.id, author_name: ME.name, author_role: 'agent', kind, body: body || '📎', attachments: atts});
      (MSGS[t.id] = MSGS[t.id] || []).push(m);
      DRAFT[t.id] = ''; PENDING[t.id] = []; $('#reply').value = '';
      if (kind === 'public') {
        if (!t.first_response_at) t.first_response_at = nowIso();
        if (email) {
          const r = await sendMail(m.id);
          Object.assign(m, r.ok ? {mail_status: 'sent', sent_at: nowIso()} : {mail_status: 'failed', mail_error: r.error});
          if (!r.ok) toast('⚠️ Email not sent: ' + esc(r.error));
          if (r.ok && t.type === 'dsar_export' && t.source_id) {
            await DB.update('dsar_requests', `id=eq.${t.source_id}`, {status: 'sent', done_at: nowIso()}).catch(() => {});
            await loadTickets(true); await loadMsgs(t.id, true); toast('✅ Data request completed');
            SENDING = false; await nextCase(t); render(true); return;
          }
        } else if (t.type === 'feedback' && t.source_id) DB.update('feedback', `id=eq.${t.source_id}`, {reply: body, status: 'seen'}).catch(() => {});
        await audit('replied to customer', t);   // case stays open – the agent picks Pending / On hold / Close
      } else await audit('added internal note', t);
    } catch (x) { toast('⚠️ ' + esc(x.message)); }
    SENDING = false; render(true);
  }
});
async function loadAudit() { try { AUDIT = await DB.list('audit_log', 'order=created_at.desc&limit=200'); } catch (x) { AUDIT = []; } render(); }
document.addEventListener('change', e => {
  const t = T.find(x => x.id === SEL);
  if (e.target.name === 'hr') { const o = $('#hr_other'); if (o) { o.hidden = e.target.value !== '__other'; if (!o.hidden) o.focus(); } return; }
  if (e.target.id === 'files' && t) {
    const big = [...e.target.files].filter(f => f.size > 10485760);
    if (big.length) toast('⚠️ Too large (over 10 MB): ' + big.map(f => esc(f.name)).join(', '));
    PENDING[t.id] = [...(PENDING[t.id] || []), ...[...e.target.files].filter(f => f.size <= 10485760).map(f => ({name: f.name, type: f.type, blob: f, size: f.size}))];
    render(true);
  }
});
document.addEventListener('input', e => {
  if (e.target.id === 'q') { QTEXT = e.target.value; const pos = e.target.selectionStart; render(true); const q = $('#q'); q.focus(); q.setSelectionRange(pos, pos); }
  if (e.target.id === 'tpq') { TP.q = e.target.value; const pos = e.target.selectionStart; tagModal(); const q = $('#tpq'); q.focus(); q.setSelectionRange(pos, pos); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (POP) { POP = null; render(true); } closeModal(); }
  if (e.key === 'Enter' && e.target.id === 'aq') admSearch();
  if (e.key === 'Enter' && e.target.id === 'sq') { SR.q = e.target.value; SR.page = 0; runSearch(); }
  if (e.key === 'Enter' && e.target.id === 'tpq') { e.preventDefault(); const q = TP.q.trim().toLowerCase().replace(/\s+/g, '-'); if (q) { TP.sel.add(q); TP.q = ''; tagModal(); $('#tpq')?.focus(); } }
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && e.target.id === 'reply') $('[data-act="send"]')?.click();
});

boot();
