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
<div class="box"><b>Kokie duomenys ir kam:</b> profilis (kalorijų ir miego normoms), kalendorius, laiko įrašai, reikalai, miegas, maistas, treniruotės, svoris ir užrašai – tik tam, kad programėlė galėtų planuoti ir rekomenduoti. Duomenys saugomi Supabase (ES), neparduodami ir neperduodami trečiosioms šalims. Saugomi, kol turi paskyrą; ištrynus – ištrinami per 20 dienų.<br><b>Tavo teisės:</b> gauti kopiją, ištaisyti, ištrinti, apriboti tvarkymą, perkelti duomenis (JSON failas pridėtas).</div>
${t('Profilis', ['Laukas', 'Reikšmė'], Object.entries({Vardas: p.name, Lytis: p.sex === 'f' ? 'moteris' : p.sex === 'm' ? 'vyras' : '', 'Gimimo metai': p.birthYear, 'Ūgis (cm)': p.height, 'Tikslo svoris': p.targetWeight, 'Keliuosi': p.wake, 'Einu miegoti': p.bed, 'Miego tikslas': p.sleepGoal}).filter(([, v]) => v !== '' && v != null))}
${t('Svoris', ['Data', 'kg', 'Liemuo cm'], (D.weights || []).map(w => [w.date, w.kg, w.waist]))}
${t('Miegas', ['Data', 'Užmigo', 'Pabudo', 'Kokybė'], (D.sleep || []).map(s => [s.date, s.bed, s.wake, s.q]))}
${t('Valgiai', ['Data', 'Laikas', 'Kas', 'kcal', 'Baltymai g'], (D.meals || []).map(m => [m.date, m.time, m.name, Math.round(m.kcal || 0), Math.round(m.p || 0)]))}
${t('Treniruotės', ['Data', 'Pradžia', 'Trukmė min', 'Pratimai'], (D.workouts || []).map(w => [w.date, w.start, w.duration, (w.exercises || []).map(x => x.id + ' ' + (x.sets || []).join('/')).join(', ')]))}
${t('Laiko įrašai', ['Data', 'Nuo', 'Iki', 'Veikla', 'Pastaba'], (D.timelog || []).map(x => [x.date, x.start, x.end, cats[x.cat] || x.cat, x.note]))}
${t('Kalendoriaus įvykiai', ['Pavadinimas', 'Kartojasi', 'Laikas', 'Data / dienos'], (D.events || []).map(e => [e.title, e.type, `${e.start}–${e.end}`, e.date || (e.days || []).join(',')]))}
${t('Reikalai', ['Ką', 'Iki', 'Atlikta'], (D.tasks || []).map(x => [x.title, x.due, x.done ? 'taip' : 'ne']))}
${t('Užrašai', ['Pavadinimas', 'Tekstas'], (D.notes || []).map(n => [n.title, n.body]))}
${t('Patikrinimai', ['Data', 'Tipas', 'Svoris', 'Nuotaika', 'Kas pavyko', 'Tikslas'], (D.checkins || []).map(c => [c.date, c.type, c.weight, c.mood, c.wins, c.focus]))}
${t('Pagaminta', ['Data', 'Receptas', 'Porcijos', 'Kaina €'], (D.cooks || []).map(c => [c.date, c.recipeId, c.portions, c.cost]))}
${t('Išlaidos (čekiai)', ['Data', 'Suma €', 'Pastaba'], (D.spend || []).map(s => [s.date, s.amount, s.note]))}
<p><small>Pilni duomenys (taip pat nustatymai ir receptai) – pridėtame JSON faile.</small></p></body></html>`;
}

// ----- Constants -----
const STATUS = [['new', 'New'], ['open', 'Open'], ['pending', 'Pending'], ['hold', 'On hold'], ['solved', 'Solved'], ['closed', 'Closed']];
const stName = s => (STATUS.find(x => x[0] === s) || [s, s])[1];
const PRIO = [['low', 'Low'], ['normal', 'Normal'], ['high', 'High'], ['urgent', 'Urgent']];
const prioRank = p => PRIO.findIndex(x => x[0] === (p || 'normal'));
const LANGS = [['lt', '🇱🇹 Lithuanian'], ['en', '🇬🇧 English'], ['sv', '🇸🇪 Swedish'], ['de', '🇩🇪 German'], ['pl', '🇵🇱 Polish'], ['ru', '🇷🇺 Russian'], ['other', '🌐 Other']];
const langName = l => (LANGS.find(x => x[0] === (l || 'lt')) || LANGS[0])[1];
const HOLD_REASONS = ['Consulting with developer', 'Escalating for further review', 'Investigating the issue', 'Waiting for a release', 'Waiting for a third party'];
const FRT_H = {urgent: 2, high: 8, normal: 24, low: 48};   // first response targets (hours)
const KIND = {bug: '🐞', idea: '💡', question: '❓', other: '💬', outgoing: '📤', dsar_export: '🌍', dsar_delete: '🗑️'};
const kindOf = t => t.outgoing ? 'outgoing' : t.type === 'feedback' ? (['bug', 'idea', 'question'].includes((t.tags || [])[0]) ? t.tags[0] : 'other') : t.type;
const ticketIcon = t => KIND[kindOf(t)] || '💬';
const TITLE_WORDS = {lt: {bug: 'Klaida', idea: 'Idėja', question: 'Klausimas', other: 'Atsiliepimas', dsar_export: 'Duomenų užklausa', dsar_delete: 'Paskyros trynimas'},
  en: {bug: 'Bug report', idea: 'Idea', question: 'Question', other: 'Feedback', dsar_export: 'Data request', dsar_delete: 'Account deletion'}};
const caseTitle = t => t.outgoing && t.subject ? t.subject : `${(TITLE_WORDS[t.language || 'lt'] || {})[kindOf(t)] || 'Case'}: ${t.case_no ?? '–'}`;
function sla(t) {
  if (t.outgoing || t.first_response_at || ['solved', 'closed'].includes(t.status) || !t.created_at) return null;
  const left = Date.parse(t.created_at) + (FRT_H[t.priority] || 24) * 3600e3 - Date.now();
  return {left, missed: left < 0};
}
const slaInline = x => { const s = sla(x); return s ? ` · <b class="${s.missed ? 'pr-urgent' : s.left < 3600e3 ? 'pr-high' : 'muted'}">${s.missed ? 'SLA missed' : 'FRT ' + fmtLeft(s.left)}</b>` : ''; };
const slaChip = x => { const s = sla(x); return s ? `<span class="chip ${s.missed ? 'sla-miss' : s.left < 3600e3 ? 'sla-warn' : ''}" title="First response target">${s.missed ? '⏰ SLA missed' : '⏱ FRT ' + fmtLeft(s.left)}</span>` : ''; };
const byPrio = (a, b) => (prioRank(b.priority) - prioRank(a.priority)) || (Date.parse(a.created_at) - Date.parse(b.created_at));
const caseLink = t => `${location.origin}${location.pathname.replace(/[^/]*$/, '')}#case/${t.case_no}`;
const EYE = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>';

// ----- State -----
let ME = null, ROLE = null, T = [], MSGS = {}, CUST = {}, PENDING = {}, DRAFT = {}, SENDING = false, SEL = null, MODE = 'reply', FILTER = 'backlog', QTEXT = '', VIEW = 'inbox', AUDIT = [], CLEAN = false, SIDE = 'customer';
let DEVVIEW = false, INBOX_ON = LS.get('console_inbox') === '1';
const myOpen = () => T.filter(t => t.assignee === ME.id && ['new', 'open'].includes(t.status)).sort(byPrio);
const myHold = () => T.filter(t => t.assignee === ME.id && t.status === 'hold');
const myPendingRecent = () => T.filter(t => t.assignee === ME.id && t.status === 'pending' && Date.now() - Date.parse(t.status_at || t.updated_at) < 5 * 60e3);
const queue = () => T.filter(t => !t.assignee && ['new', 'open'].includes(t.status)).sort(byPrio);

// ===== 1. Entry: 404 -> role -> MFA =====
function notFound() { document.title = '404'; $('#root').innerHTML = `<div class="center nf"><h1>404</h1><p>Page not found.</p></div>`; }
async function boot() {
  if (TEST) { ME = {id: 'local-user', email: 'testas@vietinis.lt', name: 'Tester'}; ROLE = 'developer'; return mfaScreen(true); }
  const s = sess(); if (!s || !C.url) return notFound();
  try {
    const tok = await token();
    const r = await fetch(`${C.url}/rest/v1/user_roles?select=role&user_id=eq.${s.user.id}`, {headers: {apikey: C.key, Authorization: 'Bearer ' + tok}});
    ROLE = r.ok ? (await r.json())[0]?.role : null;
    if (!['developer', 'agent'].includes(ROLE)) return notFound();
    ME = {id: s.user.id, email: s.user.email, name: s.user.email.split('@')[0]};
    try { ME.full = (await authCall('user', null, 'GET', tok)).user_metadata?.full_name || ''; } catch (e) {}
    if (jwt(tok).aal === 'aal2') return start();
    return mfaScreen(false);
  } catch (e) { return notFound(); }
}
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
  $('#root').innerHTML = `<div class="auth"><div class="lock">🔐</div><h2>Two-step verification</h2>
    ${sim ? '<p class="muted">TEST: any 6 digits work.</p>' : enroll ? `<p class="muted">First time: scan the QR code with <b>Google Authenticator</b> (or Microsoft Authenticator) and enter the code.</p>
      <div class="qr"><img src="${esc(enroll.totp.qr_code)}" alt="QR"></div><p class="muted">Or enter manually:</p><code>${esc(enroll.totp.secret)}</code>` : '<p class="muted">Enter the 6-digit code from your authenticator app.</p>'}
    <input id="code" class="code" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="000000">
    <button id="go" class="btn primary">Verify</button><p id="err" class="muted"></p></div>`;
  const go = async () => {
    const code = $('#code').value.trim();
    if (!/^\d{6}$/.test(code)) return $('#err').textContent = 'Enter 6 digits';
    if (sim) return start();
    try {
      const ch = await authCall(`factors/${factor.id}/challenge`, {}, 'POST', await token());
      const j = await authCall(`factors/${factor.id}/verify`, {challenge_id: ch.id, code}, 'POST', await token());
      saveSess(j); start();
    } catch (e) { $('#err').textContent = '❌ Wrong code. Try again.'; $('#code').value = ''; }
  };
  $('#go').onclick = go; $('#code').onkeydown = e => { if (e.key === 'Enter') go(); }; $('#code').focus();
}
function askName(cur = '') {
  return new Promise(res => {
    modal(`<h3>👋 What's your name?</h3><p class="muted">First and last name – visible to the team only.</p>
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
  const nm = TEST ? LS.get('console_name') : ME.full;
  if (nm) ME.name = nm; else { $('#root').innerHTML = ''; await askName(); }
  DEVVIEW = ROLE === 'developer' && LS.get('console_devview') !== '0';
  if (PAGE_CUSTOMER) return openCustomer(PAGE_CUSTOMER);
  if (PAGE_KB) { VIEW = 'kbpage'; render(); await loadExtra('kb'); return render(); }
  await Promise.all([loadTickets(), loadExtra()]);
  heartbeat(); setInterval(heartbeat, 60000);
  render(); welcome();
  window.addEventListener('hashchange', openFromHash);
  if (!(await openFromHash())) await pump();
  setInterval(tick, 20000);
}
async function tick() { if (document.hidden) return; await loadTickets(true); if (SEL) await loadMsgs(SEL, true); await pump(); render(true); }
async function heartbeat() {
  if (!ME) return;
  try { await DB.req('POST', 'agent_presence', 'on_conflict=user_id', {user_id: ME.id, name: ME.name, inbox_on: INBOX_ON, last_seen: nowIso()}, 'resolution=merge-duplicates'); } catch (e) {}
}
function welcome() {
  const first = (ME.name || '').split(' ')[0], el = document.createElement('div'); el.className = 'welcome';
  el.innerHTML = `<div class="wbox"><div class="wv">👋</div><h1>Welcome back, ${esc(first)}!</h1><p>Let's give the best support to everyone today 💙</p></div>`;
  document.body.appendChild(el); el.onclick = () => el.remove();
  setTimeout(() => el.classList.add('out'), 2300); setTimeout(() => el.remove(), 2900);
}
async function loadTickets(quiet) {
  try {
    const rows = await DB.list('tickets', 'status=neq.closed&order=created_at.desc');
    const keep = T.filter(t => t.status === 'closed' && !rows.some(r => r.id === t.id));   // closed cases opened via link / profile
    T = [...rows, ...keep];
  } catch (e) { if (!quiet) toast('⚠️ Could not load cases: ' + esc(e.message)); }
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
async function logEvent(t, body) {
  try { const [m] = await DB.insert('ticket_messages', {ticket_id: t.id, author_id: ME.id, author_name: ME.name, author_role: 'agent', kind: 'event', body, attachments: []}); (MSGS[t.id] = MSGS[t.id] || []).push(m); } catch (e) {}
}
async function openFromHash() {
  const m = location.hash.match(/^#case\/(\d+)/); if (!m) return false;
  let t = T.find(x => String(x.case_no) === m[1]);
  if (!t) { try { t = (await DB.list('tickets', `case_no=eq.${m[1]}`))[0]; if (t) T.push(t); } catch (e) {} }
  if (!t) { toast(`Case #${m[1]} not found`); return false; }
  VIEW = 'inbox'; await selectCase(t.id); return true;
}
async function selectCase(id) {
  const t = T.find(x => x.id === id); if (!t) return;
  SEL = id; MODE = 'reply'; SIDE = 'customer'; VIEW = 'inbox'; closeModal(true);
  history.replaceState(null, '', `${location.pathname}${location.search}#case/${t.case_no ?? ''}`);
  render(); await Promise.all([loadMsgs(id), loadCustomer(t.user_id)]);
  if (t.status === 'new' && t.assignee === ME.id) { t.status = 'open'; DB.update('tickets', `id=eq.${t.id}`, {status: 'open', status_at: nowIso(), updated_at: nowIso()}).catch(() => {}); }
  render();
}
// Automatic inbox: one case at a time, most important first
let PUMPING = false;
async function pump() {
  if (DEVVIEW || PUMPING || PAGE_CUSTOMER || PAGE_KB) return;
  PUMPING = true;
  try {
    const mine = myOpen();
    if (mine.length) { if (!SEL || !T.some(x => x.id === SEL && x.assignee === ME.id && ['new', 'open'].includes(x.status))) await selectCase(mine[0].id); return; }
    if (!INBOX_ON) return;
    for (const t of queue()) {
      const rows = await DB.update('tickets', `id=eq.${t.id}&assignee=is.null`, {assignee: ME.id, assignee_name: ME.name, status: 'open', status_at: t.status === 'new' ? nowIso() : t.status_at, updated_at: nowIso()}).catch(() => []);
      if (rows.length) { Object.assign(t, rows[0]); await logEvent(t, `Assigned to ${ME.name} (inbox)`); await audit('assigned via inbox', t); await selectCase(t.id); return; }
    }
  } finally { PUMPING = false; }
}

// ----- Rendering -----
const navItems = () => [['inbox', '📥 Inbox'], ['macros', '⚡ Macros'], ['issues', '🧯 Known issues'], ...(ROLE === 'developer' ? [['audit', '📜 Audit log']] : [])];
function render(keepScroll) {
  const t = T.find(x => x.id === SEL), standalone = PAGE_CUSTOMER || PAGE_KB;
  const th = $('.thread'), st = th ? th.scrollTop : null, nearBottom = th ? th.scrollHeight - th.scrollTop - th.clientHeight < 80 : true, prevN = th?.dataset.n, prevT = th?.dataset.t;
  const rp = $('#reply'); if (rp) DRAFT[rp.dataset.tid] = rp.value;
  $('#root').innerHTML = `<div class="shell"><div class="top"><b class="logo">🎧 Support Console</b>${TEST ? '<span class="test">TEST</span>' : ''}
    ${standalone ? `<span class="crumb">${PAGE_KB ? 'Knowledge base' : 'Customer profile'}</span>` : `<nav>${navItems().map(([k, l]) => `<button class="${VIEW === k ? 'on' : ''}" data-view="${k}">${l}</button>`).join('')}</nav>`}
    <span class="sp"></span><span class="mfa">🔐 MFA</span><span class="me idlink" data-act="rename" title="Change name">👤 ${esc(ME.name)}</span>${standalone ? '' : '<a class="btn sm ghost" href="../">↩ App</a>'}</div>
    ${PAGE_KB ? kbPage() : PAGE_CUSTOMER ? customerView() : EXTRA_VIEW[VIEW] ? EXTRA_VIEW[VIEW]() : VIEW === 'audit' ? auditView() : mainView(t)}</div>
    ${!standalone && ROLE === 'developer' ? `<button class="devtoggle ${DEVVIEW ? 'on' : ''}" data-act="devview" title="Switch between developer view and agent inbox"><i></i>Developer view</button>` : ''}`;
  if ($('#reply') && t) $('#reply').value = DRAFT[t.id] || '';
  const th2 = $('.thread');
  if (th2) th2.scrollTop = keepScroll && st != null && !nearBottom && th2.dataset.n === prevN && th2.dataset.t === prevT ? st : th2.scrollHeight;
}
function auditView() {
  return `<div class="main full"><div class="audit"><h2>📜 Audit log</h2><table><tr><th>When</th><th>Who</th><th>Action</th><th>Case</th><th>Customer</th><th>Details</th></tr>
    ${AUDIT.map(a => `<tr><td>${dt(a.created_at)}</td><td>${esc(a.actor_name || '')}</td><td>${esc(a.action)}</td><td>${a.ticket_id ? esc('#' + (T.find(x => x.id === a.ticket_id)?.case_no ?? String(a.ticket_id).slice(0, 8))) : ''}</td><td>${a.target_user ? esc(String(a.target_user).slice(0, 8)) : ''}</td><td><small>${esc(a.details ? JSON.stringify(a.details) : '')}</small></td></tr>`).join('') || '<tr><td colspan="6" class="empty">No entries</td></tr>'}</table></div></div>`;
}
const qi = (x, extra = '') => `<div class="qi ${x.id === SEL ? 'on' : ''} ${x.status === 'new' ? 'new' : ''}" data-t="${x.id}"><span class="ic">${ticketIcon(x)}</span><b>${esc(caseTitle(x))}</b><span class="chip st-${x.status}">${stName(x.status)}</span>
  <small class="pv">${esc((x.subject || '').slice(0, 70))}</small><small>${esc(x.email || '—')} · ${ago(x.created_at)}${extra}</small></div>`;
function agentQueue() {
  const mo = myOpen(), mh = myHold(), mp = myPendingRecent();
  return `<div class="queue"><div class="inboxsw"><button class="switch ${INBOX_ON ? 'on' : ''}" data-act="inbox" title="Turn inbox ${INBOX_ON ? 'off' : 'on'}"><i></i></button><div><b>Inbox ${INBOX_ON ? 'on' : 'off'}</b><small>${INBOX_ON ? `${queue().length} waiting in queue` : 'Not receiving new cases'}</small></div></div>
    <div class="qlist"><h4>Working on (${mo.length})</h4>${mo.map(x => qi(x, slaInline(x))).join('') || '<div class="empty sm">—</div>'}
    ${mh.length ? `<h4>On hold (${mh.length})</h4>${mh.map(x => qi(x, x.hold_reason ? ` · ${esc(x.hold_reason)}` : '')).join('')}` : ''}
    ${mp.length ? `<h4>Pending</h4>${mp.map(x => qi(x, ' · waiting for reply')).join('')}` : ''}</div>
    <div class="qfoot"><button class="btn sm" data-act="newcase">＋ New case</button></div></div>`;
}
const FILTERS = [['backlog', 'Backlog', t => !t.assignee && ['new', 'open'].includes(t.status)], ['mine', 'My cases', t => t.assignee === ME.id && ['new', 'open', 'pending', 'hold'].includes(t.status)],
  ['waiting', 'Pending / On hold', t => ['pending', 'hold'].includes(t.status)], ['solved', 'Solved', t => t.status === 'solved'], ['outgoing', 'Outgoing', t => t.outgoing && t.status !== 'closed'], ['all', 'All', t => t.status !== 'closed']];
function devQueue() {
  const q = QTEXT.toLowerCase(), f = FILTERS.find(x => x[0] === FILTER) || FILTERS[0];
  const list = T.filter(f[2]).filter(t => !q || [caseTitle(t), t.subject, t.email, (t.tags || []).join(' '), '#' + t.case_no].join(' ').toLowerCase().includes(q)).sort(FILTER === 'backlog' ? byPrio : (a, b) => a.created_at < b.created_at ? 1 : -1);
  return `<div class="queue"><div class="qhead"><input id="q" placeholder="Search: title, email, tag, #number" value="${esc(QTEXT)}">
    <div class="filters">${FILTERS.map(([k, l, fn]) => `<button class="${FILTER === k ? 'on' : ''}" data-f="${k}">${l}<i>${T.filter(fn).length}</i></button>`).join('')}</div></div>
    <div class="qlist">${list.map(x => qi(x, `${x.assignee ? ` · 👤 ${esc(x.assignee === ME.id ? 'you' : x.assignee_name || '')}` : ''}${slaInline(x)}`)).join('') || '<div class="empty">Nothing here 🎉</div>'}</div>
    <div class="qfoot"><button class="btn sm" data-act="newcase">＋ New case</button></div></div>`;
}
function idleHtml() {
  if (DEVVIEW) return '<div class="conv"><div class="empty" style="margin:auto">← Select a case</div></div>';
  return `<div class="conv"><div class="idle">${INBOX_ON ? (queue().length ? '<div class="wv">⏳</div><h2>Getting your next case…</h2>' : '<div class="wv">🎉</div><h2>All caught up!</h2><p class="muted">New cases will appear here automatically.</p>')
    : '<div class="wv">😴</div><h2>Your inbox is off</h2><p class="muted">Turn it on to start receiving cases.</p><button class="btn primary" data-act="inbox">Turn inbox on</button>'}</div></div>`;
}
const mainView = t => `<div class="main">${DEVVIEW ? devQueue() : agentQueue()}${t ? convHtml(t) : idleHtml()}${t ? (SIDE === 'kb' ? kbSide() : sideHtml(t)) : '<div class="side"></div>'}</div>`;
function msgHtml(m, t) {
  if (m.kind === 'event' || m.author_role === 'system') return CLEAN ? '' : `<div class="msg event">${esc(m.body)} <small>${m.author_name && !m.body.includes(m.author_name) ? esc(m.author_name) + ' · ' : ''}${dt(m.created_at)}</small></div>`;
  if (m.kind === 'internal') return `<div class="msg internal"><small>📝 Internal note · ${esc(m.author_name || '')} · ${dt(m.created_at)}</small>${esc(m.body)}${attHtml(m)}</div>`;
  return `<div class="msg ${m.author_role}"><small>${m.author_role === 'customer' ? esc(t.email || 'Customer') : '🎧 ' + esc(m.author_name || 'Agent')} · ${dt(m.created_at)}</small>${m.body === '📎' ? '' : esc(m.body)}${attHtml(m)}${mailHtml(m)}</div>`;
}
function convHtml(t) {
  const mine = t.assignee === ME.id, msgs = MSGS[t.id] || [], note = MODE === 'internal', done = ['solved', 'closed'].includes(t.status), iss = ISSUES.find(i => i.id === t.issue_id);
  const until = ['pending', 'hold'].includes(t.status) && t.status_until;
  const block = t.status === 'closed' ? 'This case is closed permanently – only internal notes can be added.' : t.status === 'solved' ? 'This case is solved. Reopen it to reply to the customer.' : !mine ? 'assign' : '';
  const closesAt = t.status === 'solved' ? new Date(Date.parse(t.solved_at || t.status_at || t.updated_at) + 5 * 864e5).toISOString() : null;
  return `<div class="conv ${note ? 'internal' : ''}"><div class="chead">
    <div class="crow1"><h2>${ticketIcon(t)} ${esc(caseTitle(t))}</h2><span class="cno">#${t.case_no ?? ''}</span><span class="sp"></span>
      <button class="btn sm ghost" data-act="copylink" title="Copy case link">🔗</button>
      <button class="eye ${CLEAN ? 'on' : ''}" data-act="clean" title="${CLEAN ? 'Show' : 'Hide'} activity">${EYE}</button>
      <button class="btn sm" data-act="casedata">Edit case data</button>
      ${t.assignee ? `<span class="chip">👤 ${mine ? 'You' : esc(t.assignee_name || 'Someone')}</span>${mine && !done ? '<button class="btn sm ghost" data-act="unassign">Unassign</button>' : ''}` : (!done ? '<button class="btn sm primary" data-act="assign">Assign to me</button>' : '')}</div>
    <div class="cinfo"><span class="chip">${langName(t.language)}</span><span class="chip">${t.channel === 'email' ? '✉️ Email' : '📱 In app'}</span>
      ${t.priority && t.priority !== 'normal' ? `<span class="chip ${t.priority === 'urgent' ? 'pr-urgent' : t.priority === 'high' ? 'pr-high' : ''}">${stPrio(t.priority)}</span>` : ''}${slaChip(t)}
      ${t.due_at && !done ? `<span class="chip ${Date.parse(t.due_at) - Date.now() < 7 * 864e5 ? 'sla-warn' : ''}">📅 Due ${dt(t.due_at)}</span>` : ''}
      ${iss ? `<span class="chip" data-view="issues">🧯 ${esc(iss.title.slice(0, 40))}</span>` : ''}${t.outgoing ? '<span class="chip">📤 Outgoing</span>' : ''}</div>
    ${t.outgoing && DEVVIEW && t.created_reason ? `<div class="oreason"><b>Created by ${esc(t.created_by_name || '?')}</b> · ${esc(t.created_reason)}</div>` : ''}
    <div class="stbar"><span class="chip st-${t.status}">${stName(t.status)}</span>${t.status === 'hold' && t.hold_reason ? `<span class="hr">${esc(t.hold_reason)}</span>` : ''}
      ${until ? `<small>${t.status === 'pending' ? 'Auto-solves' : 'Reopens'} ${dt(until)}</small>` : ''}${closesAt ? `<small>Closes permanently ${dt(closesAt)}</small>` : ''}<span class="sp"></span>
      ${t.status === 'closed' ? '' : t.status === 'solved' ? '<button class="btn sm" data-act="reopen">Reopen</button>'
        : `<button class="btn sm stp ${t.status === 'pending' ? 'on' : ''}" data-act="setst" data-s="pending">Pending</button><button class="btn sm sth ${t.status === 'hold' ? 'on' : ''}" data-act="hold">On hold</button><button class="btn sm sts" data-act="setst" data-s="solved">Close</button>`}</div>
    <div class="tagrow">${(t.tags || []).map(x => `<span class="tag">#${esc(x)}<b data-act="rmtag" data-v="${esc(x)}" title="Remove">✕</b></span>`).join('')}<button class="btn sm ghost" data-act="tag">+ Tag</button></div></div>
    <div class="thread" data-n="${msgs.length}" data-t="${t.id}">${msgs.map(m => msgHtml(m, t)).join('') || '<div class="empty">No messages</div>'}</div>
    <div class="composer ${note ? 'internal' : ''}"><div class="ctabs"><button data-mode="reply" class="${!note ? 'on' : ''}">Reply</button><button data-mode="internal" class="note ${note ? 'on' : ''}">Internal note</button></div>
      ${!note && block ? (block === 'assign' ? `<div class="lockbox">🔒 Assign the case to yourself to reply.<br><br><button class="btn primary" data-act="assign">Assign to me</button></div>`
        : `<div class="lockbox">🔒 ${block}${t.status === 'solved' ? '<br><br><button class="btn" data-act="reopen">Reopen case</button>' : ''}</div>`)
      : `<textarea id="reply" data-tid="${t.id}" placeholder="${note ? 'Internal note (in English)…' : 'Write a reply…'}"></textarea>
      ${(PENDING[t.id] || []).length ? `<div class="atts">${PENDING[t.id].map((f, i) => `<span class="att">📎 ${esc(f.name)} <small>${kb(f.size)}</small><b data-act="rmfile" data-i="${i}" title="Remove">✕</b></span>`).join('')}</div>` : ''}
      <div class="crow">${!note && t.channel === 'email' ? `<small>✉️ To: <b>${esc(t.email || '')}</b></small>` : ''}
        <span class="sp"></span>${composerTools(t, note)}<label class="btn sm ghost" title="Attach file (max 10 MB)">📎<input type="file" id="files" multiple hidden></label><button class="btn ${note ? 'warn' : 'primary'}" data-act="send">${note ? 'Add note' : t.channel === 'email' ? 'Send email' : 'Send'}</button></div>`}</div></div>`;
}
const stPrio = p => (PRIO.find(x => x[0] === p) || [p, p])[1];
function sideHtml(t) {
  const c = CUST[t.user_id], d = c?.data || {}, p = d.profile || {}, ctx = t.context || {}, m = META[t.user_id];
  const name = p.name || (t.email || '').split('@')[0] || '—', others = T.filter(x => x.user_id && x.user_id === t.user_id && x.id !== t.id);
  return `<div class="side"><div class="box whobox"><div class="who"><div class="avatar">${esc(name[0]?.toUpperCase() || '?')}</div><div><b>${esc(name)}</b>${c?.num ? ` <a class="idlink" data-act="profile" data-u="${esc(t.user_id)}" title="Open customer profile">#${c.num} ↗</a>` : ''}<br><small>${esc(t.email || '')}</small></div></div>
      <button class="kbfab" data-act="kbside" title="Knowledge base">📚</button></div>
    <div class="box"><h3>Customer</h3>${!t.user_id ? '<p class="muted">Account deleted</p>' : c?.error ? `<p class="muted">⚠️ ${esc(c.error)}</p>` : !c ? '<p class="muted">Loading…</p>' : `<div class="kv">
      <span>Customer since</span><b>${dt(c.created_at)}</b><span>Last sign-in</span><b>${dt(c.last_sign_in_at)}</b>
      <span>App version</span><b>${esc(m?.version || '–')}</b><span>Device</span><b>${esc(m?.device || '–')}</b><span>Location</span><b>${esc(m?.place || '–')}</b>
      <span>Modes</span><b>${modesTxt(d)}</b><span>Time zone</span><b>${esc(d.settings?.tz || '–')}</b></div>`}</div>
    ${t.type === 'feedback' && t.context ? `<div class="box"><h3>Context</h3><div class="kv"><span>Section</span><b>${esc(ctx.view || '–')}</b><span>Version</span><b>${esc(ctx.version || '–')}</b><span>Device</span><b>${esc(ctx.device || '–')}</b><span>Screen</span><b>${esc(ctx.screen || '–')}</b></div></div>` : ''}
    ${t.type === 'dsar_export' && !['solved', 'closed'].includes(t.status) ? `<div class="box"><h3>Data copy</h3>${t.assignee === ME.id ? '<button class="btn primary" data-act="dsarprep" style="width:100%;justify-content:center">📄 Prepare files</button>' : '<small>Assign to yourself first</small>'}</div>` : ''}
    <div class="box"><h3>Other cases (${others.length})</h3>${others.map(x => `<div class="qi mini2" data-t="${x.id}"><span>${ticketIcon(x)} ${esc(caseTitle(x))}</span><span class="chip st-${x.status}">${stName(x.status)}</span></div>`).join('') || '<small>None</small>'}</div></div>`;
}

// ----- Actions -----
async function updTicket(t, patch, label, ev) {
  try { const [r] = await DB.update('tickets', `id=eq.${t.id}`, {...patch, updated_at: nowIso()}); Object.assign(t, r || patch); await audit(label, t, patch); if (ev) await logEvent(t, ev); render(true); }
  catch (e) { toast('⚠️ ' + esc(e.message)); }
}
async function setStatus(t, s, why, extra = {}) {
  if (t.status === s) return;
  const until = s === 'pending' ? inHours(48) : s === 'hold' ? inHours(72) : null;
  const patch = {status: s, status_at: nowIso(), status_until: until, hold_reason: s === 'hold' ? extra.hold_reason || null : null, ...(s === 'solved' ? {solved_at: nowIso()} : s === 'open' ? {solved_at: null} : {})};
  if (s === 'solved' && t.type === 'feedback' && t.source_id) DB.update('feedback', `id=eq.${t.source_id}`, {status: 'done'}).catch(() => {});
  await updTicket(t, patch, `status → ${stName(s)}`, `Status: ${stName(t.status)} → ${stName(s)}${s === 'hold' && extra.hold_reason ? ` (${extra.hold_reason})` : ''}${why ? ` · ${why}` : ''}`);
  if (!DEVVIEW && ['pending', 'hold', 'solved'].includes(s) && SEL === t.id) { SEL = null; render(); await pump(); render(); }
}
const noReply = t => { const pub = (MSGS[t.id] || []).filter(m => m.kind === 'public' && m.author_role !== 'system'); const last = pub[pub.length - 1]; return !last || last.author_role === 'customer'; };
function holdModal(t) {
  modal(`<h3>Put case on hold</h3><div class="reasons">${HOLD_REASONS.map((r, i) => `<label><input type="radio" name="hr" value="${esc(r)}" ${i ? '' : 'checked'}> ${esc(r)}</label>`).join('')}
    <label><input type="radio" name="hr" value="__other"> Other…</label><input id="hr_other" placeholder="Describe the reason" hidden></div>
    <div class="row"><small class="muted">Reopens automatically in 3 days.</small><span class="sp"></span><button class="btn ghost" data-act="mclose">Cancel</button><button class="btn primary" data-act="holdgo">Put on hold</button></div>`);
}
const allTags = () => { const c = {}; T.forEach(x => (x.tags || []).forEach(g => c[g] = (c[g] || 0) + 1)); return Object.entries(c).sort((a, b) => b[1] - a[1]); };
function tagPicker(t) {
  const has = new Set(t.tags || []);
  modal(`<h3>Tags</h3><div class="tagpick">${allTags().map(([g, n]) => `<button class="${has.has(g) ? 'on' : ''}" data-act="tagtoggle" data-v="${esc(g)}">#${esc(g)} <i>${n}</i></button>`).join('') || '<small>No tags yet</small>'}</div>
    <div class="row"><input id="newtag" placeholder="new tag" style="flex:1"><button class="btn primary" data-act="tagadd">Add</button><button class="btn ghost" data-act="mclose">Done</button></div>`);
  const i = $('#newtag'); i.focus(); i.onkeydown = e => { if (e.key === 'Enter') $('[data-act="tagadd"]').click(); };
}
async function toggleTag(t, g, on) {
  const tags = on ? [...new Set([...(t.tags || []), g])] : (t.tags || []).filter(x => x !== g);
  await updTicket(t, {tags}, on ? 'added tag' : 'removed tag', `Tag ${on ? 'added' : 'removed'}: #${g}`);
}
function caseData(t) {
  modal(`<h3>Edit case data</h3><div class="frm">
    <label class="wide">Subject / preview<input id="c_subj" value="${esc(t.subject)}" maxlength="120"></label>
    <label>Conversation language<select id="c_lang">${LANGS.map(([v, l]) => `<option value="${v}" ${(t.language || 'lt') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <label>Priority<select id="c_prio">${PRIO.map(([v, l]) => `<option value="${v}" ${t.priority === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <label>Channel<select id="c_chan"><option value="app" ${t.channel !== 'email' ? 'selected' : ''}>📱 In app</option>${t.email ? `<option value="email" ${t.channel === 'email' ? 'selected' : ''}>✉️ Email</option>` : ''}</select></label>
    <label>Known issue<select id="c_issue"><option value="">– none –</option>${ISSUES.filter(i => i.status !== 'fixed' || i.id === t.issue_id).map(i => `<option value="${i.id}" ${t.issue_id === i.id ? 'selected' : ''}>🧯 ${esc(i.title.slice(0, 50))}</option>`).join('')}<option value="__new">+ New issue…</option></select></label></div>
    <div class="row"><span class="sp"></span><button class="btn ghost" data-act="mclose">Cancel</button><button class="btn primary" data-act="casesave">Save</button></div>`);
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
document.addEventListener('click', async e => {
  const el = e.target.closest('[data-t],[data-f],[data-view],[data-mode],[data-act],[data-file]'); if (!el) return;
  if (el.dataset.file) { const w = window.open('', '_blank'); try { w.location = await STORE.url(el.dataset.file); } catch (x) { w?.close(); toast('⚠️ ' + esc(x.message)); } return; }
  if (el.dataset.view) {
    VIEW = el.dataset.view; render();
    if (['macros', 'issues'].includes(VIEW)) { await loadExtra(VIEW); render(); }
    if (VIEW === 'audit') { try { AUDIT = await DB.list('audit_log', 'order=created_at.desc&limit=200'); } catch (x) { AUDIT = []; } render(); }
    return;
  }
  if (el.dataset.f) { FILTER = el.dataset.f; render(); return; }
  if (el.dataset.mode) { MODE = el.dataset.mode; render(true); return; }
  if (el.dataset.t) { if (PAGE_CUSTOMER) return; return selectCase(el.dataset.t); }
  const a = el.dataset.act;
  if (a === 'rename') return askName(ME.name).then(() => render(true));
  if (a === 'devview') { DEVVIEW = !DEVVIEW; LS.set('console_devview', DEVVIEW ? '1' : '0'); render(); if (!DEVVIEW) { welcome(); await pump(); render(); } return; }
  if (a === 'inbox') { INBOX_ON = !INBOX_ON; LS.set('console_inbox', INBOX_ON ? '1' : '0'); heartbeat(); render(); if (INBOX_ON) { welcome(); await pump(); render(); } return; }
  if (EXTRA_ACT[a]) return EXTRA_ACT[a](el);
  const t = T.find(x => x.id === SEL); if (!t) return;
  if (a === 'assign') return updTicket(t, {assignee: ME.id, assignee_name: ME.name, ...(t.status === 'new' ? {status: 'open', status_at: nowIso()} : {})}, 'assigned to self', `Assigned to ${ME.name}`);
  if (a === 'unassign') return updTicket(t, {assignee: null, assignee_name: null}, 'unassigned', `${ME.name} unassigned the case`);
  if (a === 'setst') {
    const s = el.dataset.s;
    if (noReply(t) && !await ask(s === 'solved' ? 'Close without a reply?' : 'Set to pending without a reply?', 'The customer has not received a reply yet.', {icon: '💬', yes: s === 'solved' ? 'Close anyway' : 'Set pending'})) return;
    return setStatus(t, s);
  }
  if (a === 'hold') return holdModal(t);
  if (a === 'holdgo') {
    let r = document.querySelector('input[name="hr"]:checked')?.value; if (r === '__other') r = $('#hr_other').value.trim();
    if (!r) return toast('Choose or describe a reason');
    closeModal(true); return setStatus(t, 'hold', null, {hold_reason: r});
  }
  if (a === 'reopen') { await setStatus(t, 'open', 'reopened'); if (!t.assignee) await updTicket(t, {assignee: ME.id, assignee_name: ME.name}, 'assigned to self', `Assigned to ${ME.name}`); return; }
  if (a === 'clean') { CLEAN = !CLEAN; render(true); return; }
  if (a === 'copylink') { navigator.clipboard?.writeText(caseLink(t)); toast(`🔗 Link to case #${t.case_no} copied`); return; }
  if (a === 'casedata') return caseData(t);
  if (a === 'casesave') return saveCase(t);
  if (a === 'tag') return tagPicker(t);
  if (a === 'rmtag') return toggleTag(t, el.dataset.v, false);
  if (a === 'tagtoggle') { await toggleTag(t, el.dataset.v, !(t.tags || []).includes(el.dataset.v)); return tagPicker(t); }
  if (a === 'tagadd') { const v = $('#newtag').value.trim().toLowerCase().replace(/^#/, '').replace(/\s+/g, '-'); if (v && !(t.tags || []).includes(v)) await toggleTag(t, v, true); return tagPicker(t); }
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
    audit('prepared data copy', t); render(); toast('📄 Files attached'); return;
  }
  if (a === 'send') {
    if (SENDING) return;
    const body = $('#reply').value.trim(), files = PENDING[t.id] || []; if (!body && !files.length) return;
    const kind = MODE === 'internal' ? 'internal' : 'public', email = kind === 'public' && t.channel === 'email';
    if (email && !t.email) return toast('⚠️ Customer has no email');
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
          toast(r.ok ? `✉️ Email sent to ${esc(t.email)}` : '⚠️ Email not sent: ' + esc(r.error));
          if (r.ok && t.type === 'dsar_export' && t.source_id) {
            await DB.update('dsar_requests', `id=eq.${t.source_id}`, {status: 'sent', done_at: nowIso()}).catch(() => {});
            await loadTickets(true); await loadMsgs(t.id, true); toast('✅ Data request completed');
            if (!DEVVIEW) { SEL = null; await pump(); }
            SENDING = false; render(true); return;
          }
        } else {
          if (t.type === 'feedback' && t.source_id) DB.update('feedback', `id=eq.${t.source_id}`, {reply: body, status: 'seen'}).catch(() => {});
          toast('💬 Reply sent');
        }
        const ns = NEXT_STATUS[t.id] || 'pending'; delete NEXT_STATUS[t.id];
        await audit('replied to customer', t); SENDING = false; await setStatus(t, ns, 'after reply');
      } else { await audit('added internal note', t); toast('📝 Note added'); }
    } catch (x) { toast('⚠️ ' + esc(x.message)); }
    SENDING = false; render(true);
  }
});
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
document.addEventListener('input', e => { if (e.target.id === 'q') { QTEXT = e.target.value; const pos = e.target.selectionStart; render(true); const q = $('#q'); q.focus(); q.setSelectionRange(pos, pos); } });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && e.target.id === 'reply') $('[data-act="send"]')?.click(); });

boot();
