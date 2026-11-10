// ===== Konsolė, 3 etapas: kliento profilis, XP, žinių bazė, makrosai, žinomos problemos =====
// Kraunama PRIEŠ console.js; čia tik apibrėžimai – console.js juos naudoja per EXTRA_VIEW / EXTRA_ACT.
let KB = [], MACROS = [], ISSUES = [], KBCAT = 'all', KBQ = '', KBSEL = null, CUSTID = null, BACK = null;
const META = {}, ADJ = {}, CAUDIT = {}, NEXT_STATUS = {};
const KB_CATS = [['pradzia', '🚀', 'Pradžia'], ['paskyra', '🔐', 'Paskyra ir privatumas'], ['kalendorius', '📅', 'Kalendorius ir laikas'], ['sportas', '🏋️', 'Sportas'], ['mityba', '🍽️', 'Mityba'], ['xp', '⭐', 'Lygiai ir XP'], ['klaidos', '🐞', 'Klaidos ir sprendimai'], ['vidine', '🛠️', 'Vidinės procedūros'], ['kita', '📁', 'Kita']];
const catOf = k => KB_CATS.find(c => c[0] === k) || KB_CATS[KB_CATS.length - 1];
const val = id => (document.getElementById(id)?.value || '').trim();

async function loadExtra(which) {
  try {
    if (!which || which === 'kb') KB = await DB.list('kb_articles', 'order=updated_at.desc');
    if (!which || which === 'macros') MACROS = await DB.list('macros', 'order=created_at.asc');
    if (!which || which === 'issues') ISSUES = await DB.list('known_issues', 'order=created_at.desc');
  } catch (e) { if (which) toast('⚠️ ' + esc(e.message) + '<br><small>Ar Supabase paleistas 06 SQL failas?</small>'); }
}
async function loadMeta(uid) {
  if (!uid) return;
  try { META[uid] = (await DB.list('user_meta', `user_id=eq.${uid}`))[0] || null; } catch (e) { META[uid] = null; }
}

// Paprastas tekstas -> HTML: # antraštė, - sąrašas, **paryškinta**, nuorodos
function md(s) {
  const inl = x => esc(x).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  return String(s || '').split(/\n{2,}/).map(b => {
    const lines = b.split('\n');
    if (lines.every(l => /^\s*[-•]\s+/.test(l))) return `<ul>${lines.map(l => `<li>${inl(l.replace(/^\s*[-•]\s+/, ''))}</li>`).join('')}</ul>`;
    if (/^#{1,3}\s/.test(b)) return `<h3>${inl(b.replace(/^#{1,3}\s/, ''))}</h3>`;
    return `<p>${lines.map(inl).join('<br>')}</p>`;
  }).join('');
}

// Apytikris XP skaičiavimas iš kliento duomenų (ta pati logika kaip programėlėje)
function xpOf(d) {
  const toM = t => /^\d{1,2}:\d{2}/.test(t || '') ? +t.slice(0, 2) * 60 + +t.slice(3, 5) : null;
  const sleepMin = s => { const a = toM(s.bed), b = toM(s.wake); if (a == null || b == null) return 0; let m = b - a; if (m <= 0) m += 1440; return m; };
  const goal = +(d.profile || {}).sleepGoal || 8, L = k => d[k] || [];
  const parts = {
    daysLogged: new Set([...L('meals'), ...L('timelog'), ...L('sleep'), ...L('workouts')].map(x => x.date)).size,
    tasksDone: L('tasks').filter(t => t.done).length,
    sleepGood: L('sleep').filter(s => Math.abs(sleepMin(s) / 60 - goal) <= 0.75).length,
    checkins: new Set(L('checkins').filter(c => c.verified !== false).map(c => c.type + '|' + (c.period || c.date))).size,
    workouts: L('workouts').length, weights: L('weights').length, cooks: L('cooks').length,
  };
  const W = {daysLogged: 5, tasksDone: 10, sleepGood: 10, checkins: 30, workouts: 25, weights: 5, cooks: 15};
  const bonus = (d.xpAdjust || []).reduce((s, a) => s + (+a.amount || 0), 0);
  const xp = Math.max(0, Object.keys(W).reduce((s, k) => s + parts[k] * W[k], 0) + bonus);
  return {xp, bonus, level: Math.floor(Math.sqrt(xp / 40)) + 1, parts};
}

// ===================== KLIENTO PROFILIS =====================
async function openCustomer(uid) {
  if (!uid) return;
  BACK = SEL; CUSTID = uid; VIEW = 'customer'; render();
  delete CUST[uid];
  await Promise.all([loadCustomer(uid), loadMeta(uid),
    DB.list('account_adjustments', `user_id=eq.${uid}&order=created_at.desc`).then(r => ADJ[uid] = r).catch(() => ADJ[uid] = []),
    DB.list('audit_log', `target_user=eq.${uid}&order=created_at.desc&limit=40`).then(r => CAUDIT[uid] = r).catch(() => CAUDIT[uid] = [])]);
  render();
}
function customerView() {
  const uid = CUSTID, c = CUST[uid], d = c?.data || {}, p = d.profile || {}, m = META[uid], adj = ADJ[uid] || [];
  const tix = T.filter(x => x.user_id === uid), any = tix[0] || {};
  const name = p.name || (c?.email || any.email || '').split('@')[0] || '—';
  if (!c) return `<div class="main full"><div class="empty">Kraunama…</div></div>`;
  if (c.error) return `<div class="main full"><div class="empty">⚠️ ${esc(c.error)}</div></div>`;
  const g = xpOf(d), pend = adj.filter(a => !a.applied), pendXp = pend.filter(a => a.kind === 'xp').reduce((s, a) => s + (+a.payload?.amount || 0), 0);
  const age = p.birthYear ? new Date().getFullYear() - +p.birthYear : null;
  return `<div class="main full"><div class="cprof">
    <div class="chero"><button class="btn sm ghost" data-act="back">← Atgal</button><div class="avatar big">${esc(name[0]?.toUpperCase() || '?')}</div>
      <div><h2>${esc(name)}</h2><small>${esc(c.email || '')}</small><br><code class="idlink" data-act="copyuid" data-u="${esc(uid)}" title="Kopijuoti">${esc(uid)}</code></div>
      <span class="sp"></span><div class="lvl"><b>${g.level}</b><small>lygis</small></div><div class="lvl"><b>${g.xp}</b><small>XP</small></div></div>
    <div class="cgrid">
      <div class="box"><h3>Paskyra</h3><div class="kv">
        <span>Klientas nuo</span><b>${dt(c.created_at)}</b><span>Paskutinis prisijungimas</span><b>${dt(c.last_sign_in_at)}</b>
        <span>Matytas programėlėje</span><b>${m ? dt(m.last_seen) : '–'}</b><span>Versija</span><b>${esc(m?.version || '–')}</b>
        <span>Įrenginys</span><b>${esc(m?.device || '–')}</b><span>Ekranas</span><b>${esc(m?.screen || '–')}</b>
        <span>Vieta</span><b>${esc(m?.place || '–')}${m?.place ? ' <small>(pagal laiko juostą)</small>' : ''}</b>
        <span>Programėlės laikas</span><b>${esc(d.settings?.tz || '–')}</b>
        <span>Režimai</span><b>${d.settings?.modes ? [d.settings.modes.sport && 'sportas', d.settings.modes.food && 'mityba'].filter(Boolean).join(', ') || 'tik sekimas' : '–'}</b></div></div>
      <div class="box"><h3>✏️ Profilis</h3><div class="frm">
        <label>Vardas<input id="p_name" value="${esc(p.name || '')}" maxlength="60"></label>
        <label>Gimimo metai<input id="p_by" type="number" min="1920" max="2020" value="${esc(p.birthYear || '')}"></label>
        <label class="wide">Priežastis (matysis žurnale)<input id="p_reason" placeholder="pvz. klientas paprašė pataisyti vardą"></label></div>
        <div class="row"><small>${age ? `Amžius ≈ ${age} m.` : ''}</small><span class="sp"></span><button class="btn primary sm" data-act="saveprof">Išsaugoti</button></div></div>
      <div class="box"><h3>⭐ XP</h3><div class="kv"><span>Dabar</span><b>${g.xp} XP · ${g.level} lygis</b><span>Iš jų komandos</span><b>${g.bonus > 0 ? '+' : ''}${g.bonus} XP</b>${pendXp ? `<span>Laukia pritaikymo</span><b>${pendXp > 0 ? '+' : ''}${pendXp} XP</b>` : ''}</div>
        <div class="frm"><label>Kiek (gali būti minusas)<input id="x_amt" type="number" step="5" placeholder="50"></label><label class="wide">Priežastis (klientas ją pamatys)<input id="x_reason" placeholder="pvz. Ačiū, kad pranešei apie klaidą!"></label></div>
        <div class="row">${[25, 50, 100].map(n => `<button class="btn sm ghost" data-act="xpq" data-n="${n}">+${n}</button>`).join('')}<span class="sp"></span><button class="btn primary sm" data-act="savexp">Pridėti</button></div></div>
      <div class="box"><h3>📊 Statistika</h3><div class="kv">
        <span>Dienos su įrašais</span><b>${g.parts.daysLogged}</b><span>Padaryti reikalai</span><b>${g.parts.tasksDone}</b><span>Treniruotės</span><b>${g.parts.workouts}</b>
        <span>Valgiai</span><b>${(d.meals || []).length}</b><span>Įvykiai</span><b>${(d.events || []).length}</b><span>Patikrinimai</span><b>${g.parts.checkins}</b><span>Receptai</span><b>${(d.recipes || []).length}</b></div></div>
      <div class="box"><h3>🕓 Komandos pakeitimai</h3>${adj.length ? adj.map(a => `<div class="li"><span>${a.kind === 'xp' ? `⭐ ${+a.payload?.amount > 0 ? '+' : ''}${esc(a.payload?.amount)} XP` : `👤 ${esc(Object.entries(a.payload || {}).map(([k, v]) => `${k === 'name' ? 'vardas' : 'gimimo m.'}: ${v}`).join(', '))}`}
        <small>${esc(a.reason || '')} · ${esc(a.actor_name || '')} · ${dt(a.created_at)}</small></span>${a.applied ? '<span class="chip st-solved">✓ pritaikyta</span>' : `<span class="chip st-pending">⏳ laukia</span><b class="x" data-act="deladj" data-id="${a.id}" title="Atšaukti">✕</b>`}</div>`).join('') : '<small>Pakeitimų nebuvo</small>'}
        <small class="note">Pakeitimai pritaikomi, kai klientas atidaro programėlę.</small></div>
      <div class="box"><h3>🎫 Bilietai (${tix.length})</h3>${tix.map(x => `<div class="qi" data-t="${x.id}" data-go="1" style="padding:6px 0;border:0"><span class="ic">${ticketIcon(x)}</span><b>${esc(x.subject)}</b><span class="chip st-${x.status}">${stName(x.status)}</span></div>`).join('') || '<small>Nėra</small>'}</div>
      <div class="box wide"><h3>📜 Veiksmai su šiuo klientu</h3>${(CAUDIT[uid] || []).map(a => `<div class="li"><span>${esc(a.action)}<small>${esc(a.actor_name || '')} · ${dt(a.created_at)}</small></span></div>`).join('') || '<small>Nėra</small>'}</div>
    </div></div></div>`;
}
async function addAdj(kind, payload, reason, label) {
  try {
    await DB.insert('account_adjustments', {user_id: CUSTID, kind, payload, reason: reason || null, actor_id: ME.id, actor_name: ME.name});
    await audit(label, {user_id: CUSTID}, {...payload, reason});
    ADJ[CUSTID] = await DB.list('account_adjustments', `user_id=eq.${CUSTID}&order=created_at.desc`);
    CAUDIT[CUSTID] = await DB.list('audit_log', `target_user=eq.${CUSTID}&order=created_at.desc&limit=40`).catch(() => CAUDIT[CUSTID]);
    render(); toast('✓ Išsaugota. Klientas pamatys atidaręs programėlę.');
  } catch (e) { toast('⚠️ ' + esc(e.message)); }
}

// ===================== ŽINIŲ BAZĖ =====================
function kbList() {
  const q = KBQ.toLowerCase();
  return KB.filter(a => (KBCAT === 'all' || a.category === KBCAT) && (!q || (a.title + ' ' + a.body + ' ' + (a.tags || []).join(' ')).toLowerCase().includes(q)));
}
function kbView() {
  const list = kbList(), a = KB.find(x => x.id === KBSEL);
  return `<div class="main kbm"><div class="kbnav"><input id="kbq" placeholder="🔍 Ieškoti straipsnių" value="${esc(KBQ)}"><button class="btn primary sm" data-act="kbnew">+ Naujas straipsnis</button>
      <div class="cats"><button class="${KBCAT === 'all' ? 'on' : ''}" data-act="kbcat" data-k="all">📚 Visi <i>${KB.length}</i></button>${KB_CATS.map(([k, e, l]) => `<button class="${KBCAT === k ? 'on' : ''}" data-act="kbcat" data-k="${k}">${e} ${l} <i>${KB.filter(x => x.category === k).length}</i></button>`).join('')}</div></div>
    <div class="kblist">${list.map(x => `<div class="kbi ${x.id === KBSEL ? 'on' : ''}" data-act="kbopen" data-id="${x.id}"><b>${catOf(x.category)[1]} ${esc(x.title)}</b><small>${esc(x.body.replace(/\s+/g, ' ').slice(0, 90))}</small></div>`).join('') || `<div class="empty">${KB.length ? 'Nieko nerasta' : 'Dar nėra straipsnių.<br>Sukurk pirmą – pvz. „Kaip atkurti slaptažodį“.'}</div>`}</div>
    <div class="kbart">${a ? kbArticle(a, false) : '<div class="empty" style="margin:auto">← Pasirink straipsnį</div>'}</div></div>`;
}
const kbArticle = (a, full) => `<div class="kbhead"><span class="chip">${catOf(a.category)[1]} ${catOf(a.category)[2]}</span>${(a.tags || []).map(t => `<span class="tag">#${esc(t)}</span>`).join('')}<span class="sp"></span>
  ${full ? '<button class="btn sm ghost" data-act="mclose">✕ Uždaryti</button>' : `<button class="btn sm ghost" data-act="kbfull" title="Per visą ekraną">⤢</button><button class="btn sm ghost" data-act="kbedit">✏️ Taisyti</button><button class="btn sm ghost" data-act="kbdel">🗑️</button>`}</div>
  <h1>${esc(a.title)}</h1><div class="kbbody">${md(a.body)}</div><small>Atnaujinta ${dt(a.updated_at)}${a.author_name ? ' · ' + esc(a.author_name) : ''}</small>`;
function kbEdit(a = {}) {
  modal(`<h3>${a.id ? '✏️ Taisyti straipsnį' : '📚 Naujas straipsnis'}</h3><div class="frm">
    <label class="wide">Pavadinimas<input id="k_title" value="${esc(a.title || '')}"></label>
    <label>Kategorija<select id="k_cat">${KB_CATS.map(([k, e, l]) => `<option value="${k}" ${a.category === k || (!a.id && KBCAT === k) ? 'selected' : ''}>${e} ${l}</option>`).join('')}</select></label>
    <label>Žymos (per kablelį)<input id="k_tags" value="${esc((a.tags || []).join(', '))}"></label>
    <label class="wide">Tekstas <small># antraštė · - sąrašas · **paryškinta**</small><textarea id="k_body" rows="14">${esc(a.body || '')}</textarea></label></div>
    <div class="row"><span class="sp"></span><button class="btn ghost" data-act="mclose">Atšaukti</button><button class="btn primary" data-act="kbsave" data-id="${a.id || ''}">Išsaugoti</button></div>`);
  $('#k_title').focus();
}

// ===================== MAKROSAI =====================
function macrosView() {
  return `<div class="main full"><div class="pagew"><div class="row"><h2>⚡ Makrosai</h2><span class="sp"></span><button class="btn primary sm" data-act="macnew">+ Naujas makrosas</button></div>
    <p class="muted">Paruošti atsakymai. Bilieto lange pasirink „⚡ Makrosas“ – tekstas įsiterps. Žymės: <code>{vardas}</code> <code>{agentas}</code> <code>{nr}</code></p>
    ${MACROS.map(m => `<div class="box mac"><div class="row"><b>${esc(m.title)}</b><span class="chip ${m.kind === 'internal' ? 'st-open' : ''}">${m.kind === 'internal' ? '📝 vidinė' : '💬 klientui'}</span>${m.set_status ? `<span class="chip st-${m.set_status}">→ ${stName(m.set_status)}</span>` : ''}<span class="sp"></span>
      <button class="btn sm ghost" data-act="macedit" data-id="${m.id}">✏️</button><button class="btn sm ghost" data-act="macdel" data-id="${m.id}">🗑️</button></div><pre>${esc(m.body)}</pre></div>`).join('') || '<div class="empty">Makrosų nėra</div>'}</div></div>`;
}
function macEdit(m = {}) {
  modal(`<h3>${m.id ? '✏️ Taisyti makrosą' : '⚡ Naujas makrosas'}</h3><div class="frm">
    <label class="wide">Pavadinimas<input id="m_title" value="${esc(m.title || '')}" placeholder="pvz. 🙏 Ačiū už pranešimą"></label>
    <label>Tipas<select id="m_kind"><option value="public" ${m.kind !== 'internal' ? 'selected' : ''}>💬 Atsakymas klientui</option><option value="internal" ${m.kind === 'internal' ? 'selected' : ''}>📝 Vidinė pastaba</option></select></label>
    <label>Po išsiuntimo būsena<select id="m_status"><option value="">– nekeisti (laukia kliento) –</option>${STATUS.map(([v, l]) => `<option value="${v}" ${m.set_status === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <label class="wide">Tekstas <small>{vardas} {agentas} {nr}</small><textarea id="m_body" rows="10">${esc(m.body || '')}</textarea></label></div>
    <div class="row"><span class="sp"></span><button class="btn ghost" data-act="mclose">Atšaukti</button><button class="btn primary" data-act="macsave" data-id="${m.id || ''}">Išsaugoti</button></div>`);
}
function fillMacro(text, t) {
  const p = CUST[t.user_id]?.data?.profile || {}, nm = p.name || (t.email || '').split('@')[0] || '';
  return text.replace(/\{vardas\}/g, nm).replace(/\{agentas\}/g, ME.name).replace(/\{nr\}/g, String(t.id).slice(0, 8).toUpperCase());
}
// Bilieto rašymo laukelio priedai: makrosai + žinių bazė
const composerTools = (t, note) => `<select id="macro" title="Įterpti paruoštą tekstą"><option value="">⚡ Makrosas…</option>${MACROS.filter(m => (m.kind === 'internal') === note).map(m => `<option value="${m.id}">${esc(m.title)}</option>`).join('')}</select><button class="btn sm ghost" data-act="kbpick" title="Įterpti iš žinių bazės">📚</button>`;
function insertText(txt) {
  const r = $('#reply'); if (!r) return;
  const s = r.selectionStart ?? r.value.length, before = r.value.slice(0, s), after = r.value.slice(r.selectionEnd ?? s);
  r.value = before + (before && !before.endsWith('\n') ? '\n' : '') + txt + after; DRAFT[r.dataset.tid] = r.value; r.focus();
}
function kbPicker(q = '') {
  const ql = q.toLowerCase(), list = KB.filter(a => !ql || (a.title + ' ' + a.body).toLowerCase().includes(ql)).slice(0, 30);
  modal(`<h3>📚 Įterpti iš žinių bazės</h3><input id="kbpq" placeholder="🔍 Ieškoti…" value="${esc(q)}" style="width:100%">
    <div class="kbpl">${list.map(a => `<div class="kbi" data-act="kbinsert" data-id="${a.id}"><b>${catOf(a.category)[1]} ${esc(a.title)}</b><small>${esc(a.body.replace(/\s+/g, ' ').slice(0, 110))}</small></div>`).join('') || '<div class="empty">Nieko nerasta</div>'}</div>`);
  const i = $('#kbpq'); i.focus(); i.setSelectionRange(q.length, q.length);
}

// ===================== ŽINOMOS PROBLEMOS =====================
function issuesView() {
  const open = ISSUES.filter(i => i.status !== 'fixed'), fixed = ISSUES.filter(i => i.status === 'fixed');
  const card = i => { const linked = T.filter(x => x.issue_id === i.id), waiting = linked.filter(x => x.status !== 'solved');
    return `<div class="box issue ${i.status}"><div class="row"><b>${i.status === 'fixed' ? '✅' : '🧯'} ${esc(i.title)}</b><span class="chip">${linked.length} bilietai</span>${i.fixed_in ? `<span class="chip st-solved">pataisyta v${esc(i.fixed_in)}</span>` : ''}<span class="sp"></span>
      ${i.status !== 'fixed' ? `<button class="btn sm primary" data-act="issfix" data-id="${i.id}">✅ Pataisyta</button>` : waiting.length ? `<button class="btn sm primary" data-act="issnotify" data-id="${i.id}">📣 Pranešti klientams (${waiting.length})</button>` : ''}
      <button class="btn sm ghost" data-act="issedit" data-id="${i.id}">✏️</button></div>${i.description ? `<p>${esc(i.description)}</p>` : ''}
      ${linked.length ? `<div class="links">${linked.map(x => `<span class="qi mini" data-t="${x.id}" data-go="1">${ticketIcon(x)} ${esc(x.subject.slice(0, 50))} <span class="chip st-${x.status}">${stName(x.status)}</span></span>`).join('')}</div>` : ''}</div>`; };
  return `<div class="main full"><div class="pagew"><div class="row"><h2>🧯 Žinomos problemos</h2><span class="sp"></span><button class="btn primary sm" data-act="issnew">+ Nauja problema</button></div>
    <p class="muted">Bilietą prie problemos priskirsi bilieto viršuje („🧯 Problema“). Kai pataisysi – vienu mygtuku pranešk visiems tiems klientams.</p>
    <h3>Atviros (${open.length})</h3>${open.map(card).join('') || '<div class="empty">Atvirų problemų nėra 🎉</div>'}
    ${fixed.length ? `<h3>Pataisytos (${fixed.length})</h3>${fixed.map(card).join('')}` : ''}</div></div>`;
}
function issEdit(i = {}, ticket) {
  modal(`<h3>${i.id ? '✏️ Taisyti problemą' : '🧯 Nauja žinoma problema'}</h3><div class="frm">
    <label class="wide">Pavadinimas<input id="i_title" value="${esc(i.title || ticket?.subject || '')}" placeholder="pvz. Laikmatis rodo nulius po pauzės"></label>
    <label class="wide">Aprašymas (kas, kada, kaip apeiti)<textarea id="i_desc" rows="5">${esc(i.description || '')}</textarea></label></div>
    <div class="row"><span class="sp"></span><button class="btn ghost" data-act="mclose">Atšaukti</button><button class="btn primary" data-act="isssave" data-id="${i.id || ''}" data-tk="${ticket?.id || ''}">Išsaugoti</button></div>`);
  $('#i_title').focus();
}
const issueSelect = t => `<select data-set="issue_id" title="Susieti su žinoma problema"><option value="">🧯 Problema: –</option>${ISSUES.filter(i => i.status !== 'fixed' || i.id === t.issue_id).map(i => `<option value="${i.id}" ${t.issue_id === i.id ? 'selected' : ''}>🧯 ${esc(i.title.slice(0, 40))}</option>`).join('')}<option value="__new">+ Nauja problema…</option></select>`;

// Pranešti visiems susietiems klientams
async function notifyIssue(i) {
  const tx = T.filter(x => x.issue_id === i.id && x.status !== 'solved');
  const mac = MACROS.find(m => /pataisyta/i.test(m.title));
  modal(`<h3>📣 Pranešti ${tx.length} klientams</h3><p class="muted">Kiekvienam bus išsiųstas šis tekstas (programėlėje arba el. paštu – pagal bilieto kanalą), bilietai bus priskirti tau ir uždaryti. Kitiems agentams priskirti bilietai praleidžiami.</p>
    <textarea id="n_body" rows="9" style="width:100%">${esc(mac?.body || `Sveiki, {vardas}!\n\nGera žinia – problemą „${i.title}“ pataisėme${i.fixed_in ? ` (versija ${i.fixed_in})` : ''}. Atnaujinkite programėlę.\n\nAčiū už kantrybę!\n{agentas}, Life Schedule`)}</textarea>
    <div class="row"><span class="sp"></span><button class="btn ghost" data-act="mclose">Atšaukti</button><button class="btn primary" data-act="issgo" data-id="${i.id}">Siųsti visiems</button></div>`);
}
async function runNotify(i, body) {
  let ok = 0, skip = 0, fail = 0;
  for (const t of T.filter(x => x.issue_id === i.id && x.status !== 'solved')) {
    if (t.assignee && t.assignee !== ME.id) { skip++; continue; }
    try {
      if (!t.assignee) { await DB.update('tickets', `id=eq.${t.id}`, {assignee: ME.id, assignee_name: ME.name}); t.assignee = ME.id; t.assignee_name = ME.name; }
      await loadCustomer(t.user_id);
      const text = fillMacro(body, t);
      const [m] = await DB.insert('ticket_messages', {ticket_id: t.id, author_id: ME.id, author_name: ME.name, author_role: 'agent', kind: 'public', body: text, attachments: []});
      if (t.channel === 'email' && t.email) { const r = await sendMail(m.id); if (!r.ok) fail++; }
      else if (t.type === 'feedback' && t.source_id) DB.update('feedback', `id=eq.${t.source_id}`, {reply: text, status: 'done'}).catch(() => {});
      await DB.update('tickets', `id=eq.${t.id}`, {status: 'solved', updated_at: new Date().toISOString()}); t.status = 'solved';
      await audit('pranešė apie pataisytą problemą', t, {issue: i.title}); ok++;
    } catch (e) { fail++; }
  }
  closeModal(); render();
  toast(`📣 Pranešta: ${ok}${skip ? ` · praleista (priskirta kitiems): ${skip}` : ''}${fail ? ` · ⚠️ klaidų: ${fail}` : ''}`);
}

// ===================== Sujungimas su console.js =====================
const EXTRA_VIEW = {customer: customerView, kb: kbView, macros: macrosView, issues: issuesView};
const EXTRA_NAV = [['kb', '📚 Žinių bazė'], ['macros', '⚡ Makrosai'], ['issues', '🧯 Problemos']];
const EXTRA_ACT = {
  back: () => { VIEW = 'inbox'; if (BACK) SEL = BACK; render(); },
  profile: el => openCustomer(el.dataset.u || T.find(x => x.id === SEL)?.user_id),
  copyuid: el => { navigator.clipboard?.writeText(el.dataset.u); toast('ID nukopijuotas'); },
  mclose: () => closeModal(),
  saveprof: () => {
    const p = CUST[CUSTID]?.data?.profile || {}, name = val('p_name'), by = val('p_by'), payload = {};
    if (name && name !== (p.name || '')) payload.name = name;
    if (by && +by !== +(p.birthYear || 0)) { if (+by < 1920 || +by > new Date().getFullYear() - 5) return toast('⚠️ Netinkami gimimo metai'); payload.birthYear = +by; }
    if (!Object.keys(payload).length) return toast('Niekas nepakeista');
    addAdj('profile', payload, val('p_reason'), 'pakeitė kliento profilį');
  },
  xpq: el => { $('#x_amt').value = el.dataset.n; $('#x_reason').focus(); },
  savexp: () => {
    const n = Math.round(+val('x_amt')); if (!n || Math.abs(n) > 5000) return toast('⚠️ Įvesk sumą (pvz. 50 arba -20)');
    if (!val('x_reason')) return toast('⚠️ Parašyk priežastį – klientas ją pamatys');
    addAdj('xp', {amount: n}, val('x_reason'), n > 0 ? `pridėjo ${n} XP` : `atėmė ${-n} XP`);
  },
  deladj: async el => { try { await DB.req('DELETE', 'account_adjustments', `id=eq.${el.dataset.id}&applied=eq.false`); await audit('atšaukė pakeitimą', {user_id: CUSTID}); ADJ[CUSTID] = ADJ[CUSTID].filter(a => a.id !== el.dataset.id); render(); } catch (e) { toast('⚠️ ' + esc(e.message)); } },
  // žinių bazė
  kbcat: el => { KBCAT = el.dataset.k; render(); },
  kbopen: el => { KBSEL = el.dataset.id; render(); },
  kbnew: () => kbEdit(),
  kbedit: () => kbEdit(KB.find(x => x.id === KBSEL)),
  kbfull: () => modal(`<div class="kbart">${kbArticle(KB.find(x => x.id === KBSEL), true)}</div>`, 'full'),
  kbdel: async () => {
    const a = KB.find(x => x.id === KBSEL); if (!a || !confirm(`Ištrinti „${a.title}“?`)) return;
    try { await DB.req('DELETE', 'kb_articles', `id=eq.${a.id}`); await audit('ištrynė KB straipsnį', null, {title: a.title}); KB = KB.filter(x => x.id !== a.id); KBSEL = null; render(); } catch (e) { toast('⚠️ ' + esc(e.message)); }
  },
  kbsave: async el => {
    const row = {title: val('k_title'), category: val('k_cat'), body: $('#k_body').value.trim(), tags: val('k_tags').split(',').map(s => s.trim().toLowerCase()).filter(Boolean), author_name: ME.name, updated_at: new Date().toISOString()};
    if (!row.title) return toast('⚠️ Įrašyk pavadinimą');
    try {
      const [r] = el.dataset.id ? await DB.update('kb_articles', `id=eq.${el.dataset.id}`, row) : await DB.insert('kb_articles', row);
      await loadExtra('kb'); KBSEL = r?.id || el.dataset.id; await audit(el.dataset.id ? 'pakeitė KB straipsnį' : 'sukūrė KB straipsnį', null, {title: row.title}); closeModal(); render();
    } catch (e) { toast('⚠️ ' + esc(e.message)); }
  },
  kbpick: () => kbPicker(),
  kbinsert: el => { const a = KB.find(x => x.id === el.dataset.id); closeModal(); if (a) insertText(a.body); },
  // makrosai
  macnew: () => macEdit(),
  macedit: el => macEdit(MACROS.find(m => m.id === el.dataset.id)),
  macdel: async el => { const m = MACROS.find(x => x.id === el.dataset.id); if (!m || !confirm(`Ištrinti „${m.title}“?`)) return; try { await DB.req('DELETE', 'macros', `id=eq.${m.id}`); MACROS = MACROS.filter(x => x.id !== m.id); render(); } catch (e) { toast('⚠️ ' + esc(e.message)); } },
  macsave: async el => {
    const row = {title: val('m_title'), kind: val('m_kind'), set_status: val('m_status') || null, body: $('#m_body').value.trim()};
    if (!row.title || !row.body) return toast('⚠️ Reikia pavadinimo ir teksto');
    try { el.dataset.id ? await DB.update('macros', `id=eq.${el.dataset.id}`, row) : await DB.insert('macros', row); await loadExtra('macros'); closeModal(); render(); } catch (e) { toast('⚠️ ' + esc(e.message)); }
  },
  // problemos
  issnew: () => issEdit(),
  issedit: el => issEdit(ISSUES.find(i => i.id === el.dataset.id)),
  isssave: async el => {
    const row = {title: val('i_title'), description: $('#i_desc').value.trim()}; if (!row.title) return toast('⚠️ Įrašyk pavadinimą');
    try {
      const [r] = el.dataset.id ? await DB.update('known_issues', `id=eq.${el.dataset.id}`, row) : await DB.insert('known_issues', row);
      await audit(el.dataset.id ? 'pakeitė problemą' : 'sukūrė žinomą problemą', null, {title: row.title});
      await loadExtra('issues'); closeModal();
      const tk = T.find(x => x.id === el.dataset.tk); if (tk && r) return updTicket(tk, {issue_id: r.id}, 'susiejo su problema');
      render();
    } catch (e) { toast('⚠️ ' + esc(e.message)); }
  },
  issfix: el => {
    const i = ISSUES.find(x => x.id === el.dataset.id);
    modal(`<h3>✅ Pažymėti pataisyta</h3><p>${esc(i.title)}</p><div class="frm"><label>Kurioje versijoje pataisyta?<input id="f_ver" placeholder="pvz. 1.2.0"></label></div>
      <div class="row"><span class="sp"></span><button class="btn ghost" data-act="mclose">Atšaukti</button><button class="btn primary" data-act="issfixgo" data-id="${i.id}">Pažymėti</button></div>`);
  },
  issfixgo: async el => {
    try { await DB.update('known_issues', `id=eq.${el.dataset.id}`, {status: 'fixed', fixed_in: val('f_ver') || null, fixed_at: new Date().toISOString()}); await audit('pažymėjo problemą pataisyta', null, {version: val('f_ver')});
      await loadExtra('issues'); closeModal(); render(); const i = ISSUES.find(x => x.id === el.dataset.id); if (i && T.some(x => x.issue_id === i.id && x.status !== 'solved')) notifyIssue(i); }
    catch (e) { toast('⚠️ ' + esc(e.message)); }
  },
  issnotify: el => notifyIssue(ISSUES.find(i => i.id === el.dataset.id)),
  issgo: el => { const i = ISSUES.find(x => x.id === el.dataset.id), body = $('#n_body').value.trim(); if (i && body) { el.disabled = true; el.textContent = 'Siunčiama…'; runNotify(i, body); } },
};
// Makroso pasirinkimas ir paieškos laukeliai
document.addEventListener('change', e => {
  if (e.target.id !== 'macro' || !e.target.value) return;
  const m = MACROS.find(x => x.id === e.target.value), t = T.find(x => x.id === SEL); e.target.value = '';
  if (!m || !t) return;
  insertText(fillMacro(m.body, t)); if (m.set_status && m.kind === 'public') { NEXT_STATUS[t.id] = m.set_status; toast(`Išsiuntus būsena bus: ${stName(m.set_status)}`); }
});
document.addEventListener('input', e => {
  if (e.target.id === 'kbq') { KBQ = e.target.value; const pos = e.target.selectionStart; render(); const q = $('#kbq'); q.focus(); q.setSelectionRange(pos, pos); }
  if (e.target.id === 'kbpq') kbPicker(e.target.value);
});
