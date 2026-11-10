// ===== Life Schedule pagalbos konsolė (1 etapas) =====
// Prieiga: prisijungęs + kūrėjo rolė + MFA (aal2). Visa tai tikrina ir Supabase serveris (RLS / is_console()).
// Kitiems puslapis atrodo kaip „404“.
const C = window.CLOUD || {}, TEST = !!C.test;
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const AUTH_KEY = 'manogyv_auth';
const ago = iso => { const m = Math.round((Date.now() - Date.parse(iso)) / 60000); return m < 1 ? 'ką tik' : m < 60 ? `prieš ${m} min.` : m < 1440 ? `prieš ${Math.round(m / 60)} val.` : `prieš ${Math.round(m / 1440)} d.`; };
const dt = iso => iso ? new Date(iso).toLocaleString('lt-LT', {dateStyle: 'short', timeStyle: 'short'}) : '–';
const daysLeft = iso => Math.ceil((Date.parse(iso) - Date.now()) / 864e5);
function toast(t) { const e = document.createElement('div'); e.className = 'toast'; e.innerHTML = t; $('#toasts').appendChild(e); setTimeout(() => e.remove(), 4000); }
function modal(html, cls = '') { const m = $('#modal'); m.className = cls; m.innerHTML = `<div class="mbox">${html}</div>`; m.classList.add('open'); }
// Patvirtinimo langas ekrano viduryje (vietoj naršyklės confirm)
function ask(title, text = '', o = {}) {
  return new Promise(res => {
    modal(`<div class="askc"><div class="askic">${o.icon || '⚠️'}</div><h3>${title}</h3>${text ? `<p class="muted">${text}</p>` : ''}
      <div class="row"><button class="btn ghost" id="askno">${o.no || 'Atšaukti'}</button><button class="btn ${o.danger ? 'danger' : 'primary'}" id="askyes">${o.yes || 'Taip'}</button></div></div>`, 'askm');
    const done = v => { closeModal(true); res(v); };
    $('#askno').onclick = () => done(false); $('#askyes').onclick = () => done(true); $('#askno').focus();
  });
}
function closeModal(force) { const m = $('#modal'); if (m.classList.contains('locked') && !force) return; m.classList.remove('open'); }
document.addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });

// ----- Sesija -----
const sess = () => { try { return JSON.parse(localStorage.getItem(AUTH_KEY)); } catch (e) { return null; } };
const jwt = t => { try { return JSON.parse(decodeURIComponent(escape(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))))); } catch (e) { return {}; } };
function saveSess(j) { localStorage.setItem(AUTH_KEY, JSON.stringify({access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() + (j.expires_in || 3600) * 1000, user: {id: j.user.id, email: j.user.email}})); }
async function authCall(path, body, method = 'POST', tok) {
  const h = {apikey: C.key, 'Content-Type': 'application/json'}; if (tok) h.Authorization = 'Bearer ' + tok;
  const r = await fetch(`${C.url}/auth/v1/${path}`, {method, headers: h, body: body ? JSON.stringify(body) : undefined});
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.msg || j.error_description || j.message || 'Klaida ' + r.status);
  return j;
}
async function token() {
  const s = sess(); if (!s) throw new Error('nėra sesijos');
  if (s.expires_at - Date.now() > 60000) return s.access_token;
  const j = await authCall('token?grant_type=refresh_token', {refresh_token: s.refresh_token}); saveSess(j); return j.access_token;
}

// ----- Duomenys: debesyje – Supabase, testuojant – vietinis serveris -----
const DB = {
  async req(method, table, q = '', body, prefer) {
    let r;
    if (TEST) r = await fetch(`/api/t/${table}${q ? '?' + q : ''}`, {method, headers: {'Content-Type': 'application/json'}, body: body ? JSON.stringify(body) : undefined, cache: 'no-store'});
    else { const h = {apikey: C.key, Authorization: 'Bearer ' + await token(), 'Content-Type': 'application/json'}; if (prefer) h.Prefer = prefer;
      r = await fetch(`${C.url}/rest/v1/${table}${q ? '?' + q : ''}`, {method, headers: h, body: body ? JSON.stringify(body) : undefined, cache: 'no-store'}); }
    if (!r.ok) throw new Error(`${table}: ${r.status} ${(await r.text()).slice(0, 140)}`);
    return r.status === 204 ? [] : r.json();
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

// ----- Priedai (Supabase Storage, privatus „attachments“) ir laiškai (Brevo per super-function) -----
const STORE = {
  async upload(path, blob, type) {
    const h = TEST ? {} : {apikey: C.key, Authorization: 'Bearer ' + await token(), 'x-upsert': 'false'};
    const r = await fetch(TEST ? `/api/upload/${path}` : `${C.url}/storage/v1/object/attachments/${path}`, {method: 'POST', headers: {...h, 'Content-Type': type || 'application/octet-stream'}, body: blob});
    if (!r.ok) throw new Error('Nepavyko įkelti failo: ' + r.status + ' ' + (await r.text()).slice(0, 100));
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
const safeName = n => n.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w.-]+/g, '_').slice(-80);
const kb = n => n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
const mkFile = (name, text, type) => { const blob = new Blob([text], {type}); return {name, type, blob, size: blob.size}; };
const attHtml = m => (m.attachments || []).length ? `<div class="atts">${m.attachments.map(a => `<a class="att" data-file="${esc(a.path)}">📎 ${esc(a.name)} <small>${kb(a.size || 0)}</small></a>`).join('')}</div>` : '';
const mailHtml = m => m.mail_status === 'sent' ? `<small class="ms ok">✉️ Išsiųsta el. paštu${m.sent_at ? ' ' + dt(m.sent_at) : ''}</small>`
  : m.mail_status === 'failed' ? `<small class="ms bad">⚠️ Laiškas neišsiųstas: ${esc(m.mail_error || '')} · <b data-act="resend" data-m="${m.id}">Bandyti dar kartą</b></small>` : '';
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

// ----- Būsena -----
let ME = null, T = [], MSGS = {}, CUST = {}, PENDING = {}, DRAFT = {}, SENDING = false, SEL = null, MODE = 'reply', FILTER = 'open', QTEXT = '', VIEW = 'inbox', AUDIT = [];
const KIND = {bug: '🐞', idea: '💡', question: '❓', other: '💬'};
const ticketIcon = t => t.type === 'dsar_export' ? '🌍' : t.type === 'dsar_delete' ? '🗑️' : KIND[(t.tags || [])[0]] || '💬';
const STATUS = [['new', 'Nauja'], ['open', 'Atvira'], ['pending', 'Laukia kliento'], ['hold', 'Atidėta'], ['solved', 'Uždaryta']];
const LANGS = [['lt', '🇱🇹 Lietuvių'], ['en', '🇬🇧 Anglų'], ['sv', '🇸🇪 Švedų'], ['de', '🇩🇪 Vokiečių'], ['pl', '🇵🇱 Lenkų'], ['ru', '🇷🇺 Rusų'], ['other', '🌐 Kita']];
const langName = l => (LANGS.find(x => x[0] === (l || 'lt')) || LANGS[0])[1];
let CLEAN = false;
const inHours = h => new Date(Date.now() + h * 3600e3).toISOString();
const PRIO = [['low', 'Žemas'], ['normal', 'Įprastas'], ['high', 'Aukštas'], ['urgent', '🔥 Skubu']];
const stName = s => (STATUS.find(x => x[0] === s) || [s, s])[1];

// ===== 1. Patekimas: 404 → rolė → MFA =====
function notFound() { document.title = '404'; $('#root').innerHTML = `<div class="center nf"><h1>404</h1><p>Puslapis nerastas.</p></div>`; }
async function boot() {
  if (TEST) { ME = {id: 'local-user', email: 'testas@vietinis.lt', name: 'Testas'}; return mfaScreen(true); }
  const s = sess(); if (!s || !C.url) return notFound();
  try {
    const tok = await token();
    const r = await fetch(`${C.url}/rest/v1/user_roles?select=role&user_id=eq.${s.user.id}`, {headers: {apikey: C.key, Authorization: 'Bearer ' + tok}});
    const role = r.ok ? (await r.json())[0]?.role : null;
    if (!['developer', 'agent'].includes(role)) return notFound();
    ME = {id: s.user.id, email: s.user.email, name: s.user.email.split('@')[0]};
    try { ME.full = (await authCall('user', null, 'GET', tok)).user_metadata?.full_name || ''; } catch (e) {}
    if (jwt(tok).aal === 'aal2') return start();
    return mfaScreen(false);
  } catch (e) { return notFound(); }
}
// Antras faktorius: pirmą kartą – užsiregistruoti autentifikatoriaus programėlėje, vėliau – tik 6 skaitmenų kodas
async function mfaScreen(sim) {
  document.title = 'Prisijungimas';
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
    } catch (e) { $('#root').innerHTML = `<div class="center"><p>MFA klaida: ${esc(e.message)}</p></div>`; return; }
  }
  $('#root').innerHTML = `<div class="auth"><div class="lock">🔐</div><h2>Antras patvirtinimas</h2>
    ${sim ? '<p class="muted">🧪 TESTAS: įvesk bet kokius 6 skaitmenis.</p>' : enroll ? `<p class="muted">Pirmą kartą: nuskenuok QR kodą programėle <b>Google Authenticator</b> (arba Microsoft Authenticator) ir įvesk rodomą kodą.</p>
      <div class="qr"><img src="${esc(enroll.totp.qr_code)}" alt="QR"></div><p class="muted">Arba įvesk ranka:</p><code>${esc(enroll.totp.secret)}</code>` : '<p class="muted">Įvesk 6 skaitmenų kodą iš autentifikatoriaus programėlės.</p>'}
    <input id="code" class="code" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="000000">
    <button id="go" class="btn primary">Patvirtinti</button><p id="err" class="muted"></p></div>`;
  const go = async () => {
    const code = $('#code').value.trim();
    if (!/^\d{6}$/.test(code)) return $('#err').textContent = 'Įvesk 6 skaitmenis';
    if (sim) return start();
    try {
      const ch = await authCall(`factors/${factor.id}/challenge`, {}, 'POST', await token());
      const j = await authCall(`factors/${factor.id}/verify`, {challenge_id: ch.id, code}, 'POST', await token());
      saveSess(j); start();
    } catch (e) { $('#err').textContent = '❌ Neteisingas kodas. Pabandyk dar kartą.'; $('#code').value = ''; }
  };
  $('#go').onclick = go; $('#code').onkeydown = e => { if (e.key === 'Enter') go(); }; $('#code').focus();
}

// ===== 2. Konsolė =====
// Agento vardas ir pavardė – matosi tik komandai (klientas mato „Life Schedule komanda“)
function askName(cur = '') {
  return new Promise(res => {
    modal(`<h3>👋 Kaip tave vadinti?</h3><p class="muted">Matys tik komanda.</p>
      <div class="frm"><label class="wide">Vardas ir pavardė<input id="nm" value="${esc(cur)}" maxlength="60"></label></div><div class="row"><span class="sp"></span><button class="btn primary" id="nmok">Išsaugoti</button></div>`, cur ? '' : 'locked');
    const ok = async () => {
      const v = $('#nm').value.trim(); if (v.length < 3) return toast('Įrašyk vardą ir pavardę');
      ME.name = v;
      if (TEST) localStorage.setItem('console_name', v); else await authCall('user', {data: {full_name: v}}, 'PUT', await token()).catch(() => toast('⚠️ Nepavyko išsaugoti vardo paskyroje'));
      closeModal(true); res();
    };
    $('#nmok').onclick = ok; $('#nm').onkeydown = e => { if (e.key === 'Enter') ok(); }; $('#nm').focus();
  });
}
async function start() {
  document.title = 'Konsolė · Life Schedule';
  const nm = TEST ? localStorage.getItem('console_name') : ME.full;
  if (nm) ME.name = nm; else { $('#root').innerHTML = ''; await askName(); }
  await Promise.all([loadTickets(), loadExtra()]);
  render();
  setInterval(async () => { if (document.hidden) return; await loadTickets(true); if (SEL) await loadMsgs(SEL, true); render(true); }, 30000);
}
async function loadTickets(quiet) {
  try { T = await DB.list('tickets', 'order=created_at.desc'); }
  catch (e) { if (!quiet) toast('⚠️ Nepavyko gauti bilietų: ' + esc(e.message) + '<br><small>Ar Supabase paleistas 04 SQL failas?</small>'); }
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
const counts = () => ({open: T.filter(t => t.status !== 'solved').length, unassigned: T.filter(t => !t.assignee && t.status !== 'solved').length, mine: T.filter(t => t.assignee === ME.id && t.status !== 'solved').length, solved: T.filter(t => t.status === 'solved').length, all: T.length});
function visible() {
  const q = QTEXT.toLowerCase();
  return T.filter(t => (FILTER === 'all' || (FILTER === 'open' && t.status !== 'solved') || (FILTER === 'unassigned' && !t.assignee && t.status !== 'solved') || (FILTER === 'mine' && t.assignee === ME.id && t.status !== 'solved') || (FILTER === 'solved' && t.status === 'solved'))
    && (!q || (t.subject + ' ' + (t.email || '') + ' ' + (t.tags || []).join(' ')).toLowerCase().includes(q)))
    .sort((a, b) => (PRIO.findIndex(p => p[0] === b.priority) - PRIO.findIndex(p => p[0] === a.priority)) || (a.created_at < b.created_at ? 1 : -1));
}
function render(keepScroll) {
  const c = counts(), t = T.find(x => x.id === SEL);
  const th = $('.thread'), st = th ? th.scrollTop : null, rp = $('#reply'); if (rp) DRAFT[rp.dataset.tid] = rp.value;
  $('#root').innerHTML = `<div class="shell"><div class="top"><b class="logo">🎧 Konsolė</b>${TEST ? '<span class="test">🧪 TESTAS</span>' : ''}
    <nav>${[['inbox', '📥 Gautieji'], ...EXTRA_NAV, ['audit', '📜 Žurnalas']].map(([k, l]) => `<button class="${VIEW === k ? 'on' : ''}" data-view="${k}">${l}</button>`).join('')}</nav>
    <span class="sp"></span><span class="mfa">🔐 MFA ✓</span><span class="me idlink" data-act="rename" title="Pakeisti vardą">👤 ${esc(ME.name)}</span><a class="btn sm ghost" href="../">↩ Į programėlę</a></div>
    ${EXTRA_VIEW[VIEW] ? EXTRA_VIEW[VIEW]() : VIEW === 'audit' ? `<div class="main full"><div class="audit"><h2>📜 Veiksmų žurnalas</h2><table><tr><th>Kada</th><th>Kas</th><th>Veiksmas</th><th>Bilietas</th><th>Klientas</th><th>Detalės</th></tr>
      ${AUDIT.map(a => `<tr><td>${dt(a.created_at)}</td><td>${esc(a.actor_name || '')}</td><td>${esc(a.action)}</td><td>${a.ticket_id ? esc(String(a.ticket_id).slice(0, 8)) : ''}</td><td>${a.target_user ? esc(String(a.target_user).slice(0, 8)) : ''}</td><td><small>${esc(a.details ? JSON.stringify(a.details) : '')}</small></td></tr>`).join('') || '<tr><td colspan="6" class="empty">Įrašų nėra</td></tr>'}</table></div></div>`
    : `<div class="main">
    <div class="queue"><div class="qhead"><input id="q" placeholder="🔍 Ieškoti (tema, el. paštas, žyma)" value="${esc(QTEXT)}">
      <div class="filters">${[['open', 'Atviri', c.open], ['unassigned', 'Nepriskirti', c.unassigned], ['mine', 'Mano', c.mine], ['solved', 'Išspręsti', c.solved], ['all', 'Visi', c.all]].map(([k, l, n]) => `<button class="${FILTER === k ? 'on' : ''}" data-f="${k}">${l}<i>${n}</i></button>`).join('')}</div></div>
      <div class="qlist">${visible().map(x => `<div class="qi ${x.id === SEL ? 'on' : ''} ${x.status === 'new' ? 'new' : ''}" data-t="${x.id}"><span class="ic">${ticketIcon(x)}</span><b>${esc(x.subject)}</b><span class="chip st-${x.status}">${stName(x.status)}</span>
        <small>${esc(x.email || '—')} · ${ago(x.created_at)}${x.priority === 'urgent' ? ' · <b class="pr-urgent">skubu</b>' : x.priority === 'high' ? ' · <b class="pr-high">aukštas</b>' : ''}${x.due_at && x.status !== 'solved' ? ` · <span class="due ${daysLeft(x.due_at) <= 7 ? 'late' : ''}">liko ${daysLeft(x.due_at)} d.</span>` : ''}${x.assignee ? ` · 👤 ${esc(x.assignee === ME.id ? 'tau' : x.assignee_name || '')}` : ''}</small></div>`).join('') || '<div class="empty">Nieko nėra 🎉</div>'}</div></div>
    ${t ? convHtml(t) : '<div class="conv"><div class="empty" style="margin:auto">← Pasirink bilietą</div></div>'}
    ${t ? sideHtml(t) : '<div class="side"></div>'}</div>`}</div>`;
  if ($('#reply') && t) $('#reply').value = DRAFT[t.id] || '';
  const th2 = $('.thread'); if (th2) th2.scrollTop = keepScroll && st != null ? st : th2.scrollHeight;
}
function convHtml(t) {
  const mine = t.assignee === ME.id, msgs = MSGS[t.id] || [], note = MODE === 'internal';
  const evs = msgs.filter(m => m.kind === 'event' || m.author_role === 'system'), iss = ISSUES.find(i => i.id === t.issue_id);
  const until = ['pending', 'hold'].includes(t.status) && t.status_until;
  return `<div class="conv ${note ? 'internal' : ''}"><div class="chead">
    <div class="crow1"><h2>${ticketIcon(t)} ${esc(t.subject)}</h2><span class="sp"></span>
      <button class="btn sm ghost" data-act="clean" title="${CLEAN ? 'Rodyti' : 'Slėpti'} vidinius įvykius">${CLEAN ? '🙈' : '👁'} ${evs.length}</button>
      <button class="btn sm" data-act="casedata">✏️ Bilieto duomenys</button>
      ${t.assignee ? `<span class="chip">👤 ${mine ? 'Tau' : esc(t.assignee_name || 'kitam')}</span>${mine ? '<button class="btn sm ghost" data-act="unassign">Atsisakyti</button>' : ''}` : '<button class="btn sm primary" data-act="assign">🙋 Priskirti man</button>'}</div>
    <div class="cinfo"><span class="chip">${langName(t.language)}</span><span class="chip">${t.channel === 'email' ? '✉️ El. paštas' : '📱 Programėlė'}</span>
      ${t.priority !== 'normal' ? `<span class="chip ${t.priority === 'urgent' ? 'pr-urgent' : t.priority === 'high' ? 'pr-high' : ''}">${esc((PRIO.find(p => p[0] === t.priority) || [])[1] || t.priority)}</span>` : ''}
      ${iss ? `<span class="chip" data-view="issues">🧯 ${esc(iss.title.slice(0, 40))}</span>` : ''}</div>
    <div class="stbar"><span class="chip st-${t.status}">${stName(t.status)}</span>${until ? `<small>⏱ ${t.status === 'pending' ? 'užsidarys' : 'vėl atsidarys'} ${dt(until)}</small>` : ''}<span class="sp"></span>
      ${t.status === 'solved' ? '<button class="btn sm" data-act="setst" data-s="open">↺ Atidaryti iš naujo</button>'
        : `<button class="btn sm stp ${t.status === 'pending' ? 'on' : ''}" data-act="setst" data-s="pending" title="Užsidarys, jei klientas neatsakys per 2 d.">⏳ Laukia kliento</button><button class="btn sm sth ${t.status === 'hold' ? 'on' : ''}" data-act="setst" data-s="hold" title="Po 3 d. atsidarys automatiškai">✋ Atidėti 3 d.</button><button class="btn sm sts" data-act="setst" data-s="solved">✅ Uždaryti</button>`}</div>
    <div class="tagrow">${(t.tags || []).map(x => `<span class="tag">#${esc(x)}<b data-act="rmtag" data-v="${esc(x)}" title="Pašalinti">✕</b></span>`).join('')}<button class="btn sm ghost" data-act="tag">+ žyma</button></div></div>
    <div class="thread">${CLEAN && evs.length ? `<div class="msg event hidden" data-act="clean">🙈 Paslėpta vidinių įvykių: ${evs.length} · rodyti</div>` : ''}${msgs.map(m => m.kind === 'event' || m.author_role === 'system' ? (CLEAN ? '' : `<div class="msg event">${m.author_role === 'system' ? '⚙️' : '•'} ${esc(m.body)} <small>${m.author_name && m.body.includes(m.author_name) ? '' : esc(m.author_name || 'Sistema') + ' · '}${dt(m.created_at)}</small></div>`)
      : m.kind === 'internal' ? `<div class="msg internal"><small>📝 Vidinė pastaba · ${esc(m.author_name || '')} · ${dt(m.created_at)}</small>${esc(m.body)}${attHtml(m)}</div>`
      : `<div class="msg ${m.author_role}"><small>${m.author_role === 'customer' ? esc(t.email || 'Klientas') : '🎧 ' + esc(m.author_name || 'Agentas')} · ${dt(m.created_at)}</small>${esc(m.body)}${attHtml(m)}${mailHtml(m)}</div>`).join('') || '<div class="empty">Žinučių nėra</div>'}</div>
    <div class="composer ${note ? 'internal' : ''}"><div class="ctabs"><button data-mode="reply" class="${!note ? 'on' : ''}">💬 Atsakymas klientui</button><button data-mode="internal" class="note ${note ? 'on' : ''}">📝 Vidinė pastaba</button></div>
      ${!note && !mine ? `<div class="lockbox">🔒 Priskirk bilietą sau, kad galėtum atsakyti klientui.<br><br><button class="btn primary" data-act="assign">🙋 Priskirti man</button></div>`
      : `<textarea id="reply" data-tid="${t.id}" placeholder="${note ? 'Matoma tik iš vidaus…' : 'Rašyk atsakymą…'}"></textarea>
      ${(PENDING[t.id] || []).length ? `<div class="atts">${PENDING[t.id].map((f, i) => `<span class="att">📎 ${esc(f.name)} <small>${kb(f.size)}</small><b data-act="rmfile" data-i="${i}" title="Pašalinti">✕</b></span>`).join('')}</div>` : ''}
      <div class="crow">${!note && t.channel === 'email' ? `<small>✉️ Kam: <b>${esc(t.email || '')}</b></small>` : ''}
        <span class="sp"></span>${composerTools(t, note)}<label class="btn sm ghost" title="Pridėti failą (iki 10 MB)">📎<input type="file" id="files" multiple hidden></label><button class="btn ${note ? 'warn' : 'primary'}" data-act="send">${note ? 'Pridėti pastabą' : t.channel === 'email' ? '✉️ Siųsti laišką' : 'Siųsti'}</button></div>`}</div></div>`;
}
function sideHtml(t) {
  const c = CUST[t.user_id], d = c?.data || {}, p = d.profile || {}, ctx = t.context || {};
  const name = p.name || (t.email || '').split('@')[0] || '—';
  const others = T.filter(x => x.user_id && x.user_id === t.user_id && x.id !== t.id);
  return `<div class="side"><div class="box"><div class="who"><div class="avatar">${esc(name[0]?.toUpperCase() || '?')}</div><div><b>${esc(name)}</b><br><small>${esc(t.email || '')}</small></div></div>${t.user_id ? `<button class="btn sm ghost" style="width:100%;justify-content:center;margin-top:10px" data-act="profile" data-u="${esc(t.user_id)}">👤 Kliento profilis</button>` : ''}</div>
    <div class="box"><h3>Klientas</h3>${!t.user_id ? '<p class="muted">Paskyra ištrinta</p>' : c?.error ? `<p class="muted">⚠️ ${esc(c.error)}</p>` : !c ? '<p class="muted">Kraunama…</p>' : `<div class="kv">
      <span>ID</span><b class="idlink" data-act="profile" data-u="${esc(t.user_id)}" title="Atidaryti kliento profilį">${esc(String(t.user_id).slice(0, 8))}… ↗</b>
      <span>Versija</span><b>${esc(META[t.user_id]?.version || '–')}</b><span>Įrenginys</span><b>${esc(META[t.user_id]?.device || '–')}</b>
      <span>Vieta</span><b>${esc(META[t.user_id]?.place || '–')}</b>
      <span>Klientas nuo</span><b>${dt(c.created_at)}</b><span>Paskutinį kartą</span><b>${dt(c.last_sign_in_at)}</b>
      <span>Režimai</span><b>${d.settings?.modes ? [d.settings.modes.sport && 'sportas', d.settings.modes.food && 'mityba'].filter(Boolean).join(', ') || 'tik sekimas' : '–'}</b>
      <span>Laiko juosta</span><b>${esc(d.settings?.tz || '–')}</b>
      <span>Reikalai</span><b>${(d.tasks || []).filter(x => !x.done).length} atvirų</b><span>Įvykiai</span><b>${(d.events || []).length}</b>
      <span>Treniruotės</span><b>${(d.workouts || []).length}</b><span>Valgiai</span><b>${(d.meals || []).length}</b></div>`}</div>
    ${t.type === 'feedback' ? `<div class="box"><h3>Kontekstas</h3><div class="kv"><span>Skiltis</span><b>${esc(ctx.view || '–')}</b><span>Versija</span><b>${esc(ctx.version || '–')}</b><span>Įrenginys</span><b>${esc(ctx.device || '–')}</b><span>Ekranas</span><b>${esc(ctx.screen || '–')}</b><span>Režimas</span><b>${esc(ctx.mode || '–')}</b></div></div>` : ''}
    ${t.type === 'dsar_export' && t.status !== 'solved' ? `<div class="box"><h3>Duomenų kopija</h3>${t.assignee === ME.id ? `<button class="btn primary" data-act="dsarprep" style="width:100%;justify-content:center">📄 Paruošti failus laiškui</button>` : '<small>Pirmiau priskirk sau</small>'}</div>` : ''}
    ${t.due_at ? `<div class="box"><h3>Terminas</h3><b class="${daysLeft(t.due_at) <= 7 && t.status !== 'solved' ? 'pr-urgent' : ''}">${dt(t.due_at)}</b><br><small>${t.status === 'solved' ? 'užbaigta' : `liko ${daysLeft(t.due_at)} d.`}</small></div>` : ''}
    <div class="box"><h3>Kiti bilietai (${others.length})</h3>${others.map(x => `<div class="qi" data-t="${x.id}" style="padding:6px 0;border:0"><span class="ic">${ticketIcon(x)}</span><b>${esc(x.subject)}</b><span class="chip st-${x.status}">${stName(x.status)}</span></div>`).join('') || '<small>Nėra</small>'}</div>
    <div class="box"><h3>Bilietas</h3><div class="kv"><span>ID</span><b>${esc(String(t.id).slice(0, 8))}</b><span>Sukurta</span><b>${dt(t.created_at)}</b><span>Kanalas</span><b>${t.channel === 'email' ? '✉️ el. paštas' : '📱 programėlė'}</b></div></div></div>`;
}

// ----- Veiksmai -----
async function logEvent(t, body) {
  try { const [m] = await DB.insert('ticket_messages', {ticket_id: t.id, author_id: ME.id, author_name: ME.name, author_role: 'agent', kind: 'event', body, attachments: []}); (MSGS[t.id] = MSGS[t.id] || []).push(m); } catch (e) {}
}
async function updTicket(t, patch, label, ev) {
  try { const [r] = await DB.update('tickets', `id=eq.${t.id}`, {...patch, updated_at: new Date().toISOString()}); Object.assign(t, r || patch); await audit(label, t, patch); if (ev) await logEvent(t, ev); render(true); }
  catch (e) { toast('⚠️ ' + esc(e.message)); }
}
function setStatus(t, s, why) {
  if (t.status === s) return;
  const until = s === 'pending' ? inHours(48) : s === 'hold' ? inHours(72) : null;
  if (s === 'solved' && t.type === 'feedback' && t.source_id) DB.update('feedback', `id=eq.${t.source_id}`, {status: 'done'}).catch(() => {});
  return updTicket(t, {status: s, status_until: until}, `pakeitė būseną → ${stName(s)}`,
    `Būsena: ${stName(t.status)} → ${stName(s)}${s === 'pending' ? ' (užsidarys, jei klientas neatsakys per 2 d.)' : s === 'hold' ? ' (atsidarys po 3 d.)' : ''}${why ? ' · ' + why : ''}`);
}
const allTags = () => { const c = {}; T.forEach(x => (x.tags || []).forEach(g => c[g] = (c[g] || 0) + 1)); return Object.entries(c).sort((a, b) => b[1] - a[1]); };
function tagPicker(t) {
  const has = new Set(t.tags || []);
  modal(`<h3>🏷️ Žymos</h3>    <div class="tagpick">${allTags().map(([g, n]) => `<button class="${has.has(g) ? 'on' : ''}" data-act="tagtoggle" data-v="${esc(g)}">#${esc(g)} <i>${n}</i></button>`).join('') || '<small>Žymų dar nėra</small>'}</div>
    <div class="row"><input id="newtag" placeholder="nauja žyma, pvz. importas" style="flex:1"><button class="btn primary" data-act="tagadd">Pridėti</button><button class="btn ghost" data-act="mclose">Baigta</button></div>`);
  const i = $('#newtag'); i.focus(); i.onkeydown = e => { if (e.key === 'Enter') $('[data-act="tagadd"]').click(); };
}
async function toggleTag(t, g, on) {
  const tags = on ? [...new Set([...(t.tags || []), g])] : (t.tags || []).filter(x => x !== g);
  await updTicket(t, {tags}, on ? 'pridėjo žymą' : 'nuėmė žymą', `${on ? 'Pridėta' : 'Nuimta'} žyma #${g}`);
}
function caseData(t) {
  modal(`<h3>✏️ Bilieto duomenys</h3><div class="frm">
    <label class="wide">Tema<input id="c_subj" value="${esc(t.subject)}" maxlength="120"></label>
    <label>Bendravimo kalba<select id="c_lang">${LANGS.map(([v, l]) => `<option value="${v}" ${(t.language || 'lt') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <label>Prioritetas<select id="c_prio">${PRIO.map(([v, l]) => `<option value="${v}" ${t.priority === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <label>Kanalas<select id="c_chan"><option value="app" ${t.channel !== 'email' ? 'selected' : ''}>📱 Programėlė</option>${t.email ? `<option value="email" ${t.channel === 'email' ? 'selected' : ''}>✉️ El. paštas</option>` : ''}</select></label>
    <label>Žinoma problema<select id="c_issue"><option value="">– nėra –</option>${ISSUES.filter(i => i.status !== 'fixed' || i.id === t.issue_id).map(i => `<option value="${i.id}" ${t.issue_id === i.id ? 'selected' : ''}>🧯 ${esc(i.title.slice(0, 50))}</option>`).join('')}<option value="__new">+ Nauja problema…</option></select></label></div>
    <div class="row"><span class="sp"></span><button class="btn ghost" data-act="mclose">Atšaukti</button><button class="btn primary" data-act="casesave">Išsaugoti</button></div>`);
}
async function saveCase(t) {
  const nv = {subject: $('#c_subj').value.trim() || t.subject, language: $('#c_lang').value, priority: $('#c_prio').value, channel: $('#c_chan').value, issue_id: $('#c_issue').value};
  const newIssue = nv.issue_id === '__new'; if (newIssue) nv.issue_id = t.issue_id || '';
  const L = {subject: 'Tema', language: 'Kalba', priority: 'Prioritetas', channel: 'Kanalas', issue_id: 'Problema'};
  const show = (k, v) => k === 'language' ? langName(v) : k === 'priority' ? (PRIO.find(p => p[0] === v) || [, v])[1] : k === 'channel' ? (v === 'email' ? 'el. paštas' : 'programėlė') : k === 'issue_id' ? (ISSUES.find(i => i.id === v)?.title || '–') : v;
  const patch = {}, diff = [];
  for (const k of Object.keys(nv)) { const old = k === 'language' ? (t[k] || 'lt') : (t[k] || ''); if (nv[k] !== old) { patch[k] = nv[k] || null; diff.push(`${L[k]}: ${show(k, old)} → ${show(k, nv[k])}`); } }
  closeModal(true);
  if (diff.length) await updTicket(t, patch, 'pakeitė bilieto duomenis', 'Bilieto duomenys pakeisti: ' + diff.join('; '));
  if (newIssue) issEdit({}, t);
}
document.addEventListener('click', async e => {
  const el = e.target.closest('[data-t],[data-f],[data-view],[data-mode],[data-act],[data-file]'); if (!el) return;
  if (el.dataset.file) { const w = window.open('', '_blank'); try { w.location = await STORE.url(el.dataset.file); } catch (x) { w?.close(); toast('⚠️ ' + esc(x.message)); } return; }
  if (el.dataset.view) { VIEW = el.dataset.view; if (['kb', 'macros', 'issues'].includes(VIEW)) { render(); await loadExtra(VIEW); } if (VIEW === 'audit') { try { AUDIT = await DB.list('audit_log', 'order=created_at.desc&limit=200'); } catch (x) { AUDIT = []; } } render(); return; }
  if (el.dataset.f) { FILTER = el.dataset.f; render(); return; }
  if (el.dataset.mode) { MODE = el.dataset.mode; render(true); return; }
  if (el.dataset.t) {
    SEL = el.dataset.t; MODE = 'reply'; VIEW = 'inbox'; closeModal(); const t = T.find(x => x.id === SEL);
    render(); await Promise.all([loadMsgs(SEL), loadCustomer(t.user_id)]);
    if (t.status === 'new') { t.status = 'open'; DB.update('tickets', `id=eq.${t.id}`, {status: 'open', updated_at: new Date().toISOString()}).catch(() => {}); }
    render(); return;
  }
  if (el.dataset.act === 'rename') return askName(ME.name).then(() => render(true));
  if (EXTRA_ACT[el.dataset.act]) return EXTRA_ACT[el.dataset.act](el);
  const t = T.find(x => x.id === SEL); if (!t) return;
  const a = el.dataset.act;
  if (a === 'assign') return updTicket(t, {assignee: ME.id, assignee_name: ME.name}, 'priskyrė sau', `Priskirta: ${ME.name}`);
  if (a === 'unassign') return updTicket(t, {assignee: null, assignee_name: null}, 'atsisakė bilieto', `${ME.name} atsisakė bilieto`);
  if (a === 'setst') return setStatus(t, el.dataset.s);
  if (a === 'clean') { CLEAN = !CLEAN; render(true); return; }
  if (a === 'casedata') return caseData(t);
  if (a === 'casesave') return saveCase(t);
  if (a === 'tag') return tagPicker(t);
  if (a === 'rmtag') return toggleTag(t, el.dataset.v, false);
  if (a === 'tagtoggle') { await toggleTag(t, el.dataset.v, !(t.tags || []).includes(el.dataset.v)); return tagPicker(t); }
  if (a === 'tagadd') { const v = $('#newtag').value.trim().toLowerCase().replace(/^#/, '').replace(/\s+/g, '-'); if (v && !(t.tags || []).includes(v)) await toggleTag(t, v, true); return tagPicker(t); }
  if (a === 'copyid') { navigator.clipboard?.writeText(t.user_id); toast('ID nukopijuotas'); return; }
  if (a === 'rmfile') { PENDING[t.id].splice(+el.dataset.i, 1); render(true); return; }
  if (a === 'resend') {
    const m = (MSGS[t.id] || []).find(x => x.id === el.dataset.m); if (!m) return;
    toast('✉️ Siunčiama…'); const r = await sendMail(m.id);
    Object.assign(m, r.ok ? {mail_status: 'sent', sent_at: new Date().toISOString(), mail_error: null} : {mail_status: 'failed', mail_error: r.error});
    toast(r.ok ? '✉️ Laiškas išsiųstas' : '⚠️ ' + esc(r.error)); render(true); return;
  }
  if (a === 'dsarprep') {
    await loadCustomer(t.user_id); const c = CUST[t.user_id];
    if (!c?.data) return toast('⚠️ Nepavyko gauti kliento duomenų');
    const day = new Date().toISOString().slice(0, 10), r = {id: t.source_id || t.id, email: t.email, created_at: t.created_at};
    PENDING[t.id] = [...(PENDING[t.id] || []).filter(f => !f.name.startsWith('duomenu-kopija')),
      mkFile(`duomenu-kopija-${day}.html`, buildReport(c.data, r), 'text/html'),
      mkFile(`duomenu-kopija-${day}.json`, JSON.stringify({request: {id: r.id, created_at: r.created_at}, exported_at: new Date().toISOString(), data: c.data}, null, 2), 'application/json')];
    MODE = 'reply'; const rp = $('#reply');
    if (rp) { if (!rp.value.trim()) rp.value = dsarText(t); } else if (!DRAFT[t.id]) DRAFT[t.id] = dsarText(t);
    if (t.source_id) DB.update('dsar_requests', `id=eq.${t.source_id}&status=eq.received`, {status: 'in_progress'}).catch(() => {});
    audit('paruošė duomenų kopiją', t); render(); toast('📄 Failai prisegti'); return;
  }
  if (a === 'send') {
    if (SENDING) return;
    const body = $('#reply').value.trim(), files = PENDING[t.id] || []; if (!body && !files.length) return;
    const kind = MODE === 'internal' ? 'internal' : 'public', email = kind === 'public' && t.channel === 'email';
    if (email && !t.email) return toast('⚠️ Klientas neturi el. pašto');
    SENDING = true; el.disabled = true; el.textContent = files.length ? 'Keliami failai…' : 'Siunčiama…';
    try {
      const atts = [];
      for (const f of files) { const path = `${t.id}/${kind}/${crypto.randomUUID().slice(0, 8)}-${safeName(f.name)}`; await STORE.upload(path, f.blob, f.type); atts.push({name: f.name, path, size: f.size, type: f.type}); }
      const [m] = await DB.insert('ticket_messages', {ticket_id: t.id, author_id: ME.id, author_name: ME.name, author_role: 'agent', kind, body: body || '📎', attachments: atts});
      (MSGS[t.id] = MSGS[t.id] || []).push(m);
      DRAFT[t.id] = ''; PENDING[t.id] = []; $('#reply').value = '';
      if (kind === 'public') {
        const ns = NEXT_STATUS[t.id] || 'pending'; delete NEXT_STATUS[t.id];
        await audit('atsakė klientui', t); await setStatus(t, ns, 'po atsakymo');
        if (email) {
          const r = await sendMail(m.id);
          Object.assign(m, r.ok ? {mail_status: 'sent', sent_at: new Date().toISOString()} : {mail_status: 'failed', mail_error: r.error});
          toast(r.ok ? `✉️ Laiškas išsiųstas: ${esc(t.email)}` : '⚠️ Laiškas neišsiųstas: ' + esc(r.error));
          if (r.ok && t.type === 'dsar_export' && t.source_id) {
            await DB.update('dsar_requests', `id=eq.${t.source_id}`, {status: 'sent', done_at: new Date().toISOString()}).catch(() => {});
            await loadTickets(true); await loadMsgs(t.id, true); toast('✅ Duomenų kopijos užklausa užbaigta');
          }
        } else {
          if (t.type === 'feedback' && t.source_id) DB.update('feedback', `id=eq.${t.source_id}`, {reply: body, status: 'seen'}).catch(() => {});
          toast('💬 Atsakymas matomas programėlėje');
        }
      } else { await audit('pridėjo vidinę pastabą', t); toast('📝 Pastaba pridėta'); }
    } catch (x) { toast('⚠️ ' + esc(x.message)); }
    SENDING = false; render(true);
  }
});
document.addEventListener('change', e => {
  const t = T.find(x => x.id === SEL);
  if (e.target.id === 'files' && t) {
    const big = [...e.target.files].filter(f => f.size > 10485760);
    if (big.length) toast('⚠️ Per didelis (daugiau nei 10 MB): ' + big.map(f => esc(f.name)).join(', '));
    PENDING[t.id] = [...(PENDING[t.id] || []), ...[...e.target.files].filter(f => f.size <= 10485760).map(f => ({name: f.name, type: f.type, blob: f, size: f.size}))];
    render(true); return;
  }
  if (e.target.dataset.set && t) {
    const k = e.target.dataset.set, v = e.target.value;
    updTicket(t, {[k]: v}, k === 'status' ? `pakeitė būseną → ${stName(v)}` : k === 'channel' ? `pakeitė kanalą → ${v}` : `pakeitė prioritetą → ${v}`);
    if (k === 'status' && v === 'solved' && t.type === 'feedback' && t.source_id) DB.update('feedback', `id=eq.${t.source_id}`, {status: 'done'}).catch(() => {});
  }
});
document.addEventListener('input', e => { if (e.target.id === 'q') { QTEXT = e.target.value; const pos = e.target.selectionStart; render(true); const q = $('#q'); q.focus(); q.setSelectionRange(pos, pos); } });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && e.target.id === 'reply') $('[data-act="send"]')?.click(); });

boot();
