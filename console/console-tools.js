// ===== Support Console – tools: customer profile, knowledge base, macros, known issues, new case =====
// Loaded BEFORE console.js; only definitions here. console.js uses them via EXTRA_VIEW / EXTRA_ACT.
let KB = [], MACROS = [], ISSUES = [], KBCAT = 'all', KBQ = '', KBSEL = null, CUSTID = null, NEWC = null, PTAB = 'profile';
const META = {}, ADJ = {}, COMMENTS = {}, SIGNINS = {}, DSARS = {};
const KB_CATS = [['pradzia', '🚀', 'Getting started'], ['paskyra', '🔐', 'Account & privacy'], ['kalendorius', '📅', 'Calendar & time'], ['sportas', '🏋️', 'Sport'], ['mityba', '🍽️', 'Nutrition'], ['xp', '⭐', 'Levels & XP'], ['klaidos', '🐞', 'Bugs & fixes'], ['vidine', '🛠️', 'Internal procedures'], ['kita', '📁', 'Other']];
const catOf = k => KB_CATS.find(c => c[0] === k) || KB_CATS[KB_CATS.length - 1];
const val = id => (document.getElementById(id)?.value || '').trim();

async function loadExtra(which) {
  try {
    if (!which || which === 'kb') KB = await DB.list('kb_articles', 'order=updated_at.desc');
    if (!which || which === 'macros') MACROS = await DB.list('macros', 'order=created_at.asc');
    if (!which || which === 'issues') ISSUES = await DB.list('known_issues', 'order=created_at.desc');
  } catch (e) { if (which) toast('⚠️ ' + esc(e.message)); }
}
async function loadMeta(uid) {
  if (!uid) return;
  await Promise.all([
    DB.list('user_meta', `user_id=eq.${uid}`).then(r => META[uid] = r[0] || null).catch(() => META[uid] = null),
    DB.list('sign_ins', `user_id=eq.${uid}&order=last_seen.desc&limit=30`).then(r => SIGNINS[uid] = r).catch(() => SIGNINS[uid] = [])]);
}
// Latest known place: sign-in (IP) -> otherwise device time zone
const placeOf = uid => { const s = (SIGNINS[uid] || [])[0]; return s?.country ? [s.country, s.city].filter(Boolean).join(' · ') : META[uid]?.place || '–'; };
const deviceName = d => { d = String(d || '').trim(); if (!d) return '–'; const phone = /telefonas|iphone|android|mobi/i.test(d); return (phone ? '📱 ' : '💻 ') + d.replace(/^telefonas/i, 'Phone').replace(/^kompiuteris/i, 'Computer').slice(0, 60); };

// Plain text -> HTML: # heading, - list, **bold**, links
function md(s) {
  // Line by line: "# " heading, "- " list, "1. " steps, "! " internal info box, rest – paragraphs (blank line = new paragraph)
  const inl = x => esc(x).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  const kind = l => /^\s*$/.test(l) ? 'blank' : /^#{1,3}\s/.test(l) ? 'h' : /^\s*!/.test(l) ? 'note' : /^\s*[-•]\s+/.test(l) ? 'ul' : /^\s*\d+[.)]\s+/.test(l) ? 'ol' : 'p';
  const strip = {h: l => l.replace(/^#{1,3}\s/, ''), note: l => l.replace(/^\s*!\s?/, ''), ul: l => l.replace(/^\s*[-•]\s+/, ''), ol: l => l.replace(/^\s*\d+[.)]\s+/, ''), p: l => l};
  const groups = [];
  for (const l of String(s || '').split('\n')) { const k = kind(l), g = groups[groups.length - 1]; if (k === 'blank') { groups.push({k: 'blank'}); continue; } if (g && g.k === k && k !== 'h') g.lines.push(strip[k](l)); else groups.push({k, lines: [strip[k](l)]}); }
  return groups.filter(g => g.k !== 'blank').map(({k, lines}) => k === 'h' ? `<h3>${inl(lines[0])}</h3>`
    : k === 'note' ? `<div class="kbnote"><span class="kbnt">⚠️ Internal info</span>${lines.map(l => `<div>${inl(l)}</div>`).join('')}</div>`
    : k === 'ul' || k === 'ol' ? `<${k}>${lines.map(l => `<li>${inl(l)}</li>`).join('')}</${k}>` : `<p>${lines.map(inl).join('<br>')}</p>`).join('');
}
// Comment text: case links (#case/12 or a full console link) become clickable
const linkify = s => esc(s).replace(/https?:\/\/[^\s<]*\?customer=([\w-]+)[^\s<]*/g, (m, id) => `<a href="./?customer=${id}" target="_blank">👤 Customer profile ↗</a>`).replace(/(https?:\/\/[^\s<]*#case\/(\d+))|#case\/(\d+)/g, (m, url, n1, n2) => `<a href="./#case/${n1 || n2}" target="_blank">Case #${n1 || n2} ↗</a>`)
  .replace(/(^|\s)(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');

// Approximate XP from customer data (same rules as the app)
const XP_W = {daysLogged: 5, tasksDone: 10, sleepGood: 10, checkins: 30, workouts: 25, weights: 5, cooks: 15};
const XP_RULES = [['daysLogged', 'Days with anything logged'], ['tasksDone', 'Tasks done'], ['sleepGood', 'Nights close to the sleep goal'], ['checkins', 'Weekly / monthly check-ins'], ['workouts', 'Workouts'], ['weights', 'Weigh-ins'], ['cooks', 'Meals cooked']];
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
  const W = XP_W;
  const bonus = (d.xpAdjust || []).reduce((s, a) => s + (+a.amount || 0), 0);
  const xp = Math.max(0, Object.keys(W).reduce((s, k) => s + parts[k] * W[k], 0) + bonus);
  return {xp, bonus, level: Math.floor(Math.sqrt(xp / 40)) + 1, parts};
}
const modesTxt = d => d.settings?.modes ? [d.settings.modes.sport && 'sport', d.settings.modes.food && 'nutrition'].filter(Boolean).join(', ') || 'tracking only' : '–';

// ===================== CUSTOMER PROFILE (separate window: ?customer=<id>) =====================
async function loadDsar(uid) { try { DSARS[uid] = await DB.list('dsar_requests', `user_id=eq.${uid}&order=created_at.desc`); } catch (e) { DSARS[uid] = []; } }
async function openCustomer(uid, inAdmin) {
  CUSTID = uid; if (!inAdmin) VIEW = 'customer'; render();
  delete CUST[uid];
  await Promise.all([loadCustomer(uid), loadDsar(uid),
    DB.list('account_adjustments', `user_id=eq.${uid}&order=created_at.desc`).then(r => ADJ[uid] = r).catch(() => ADJ[uid] = []),
    DB.list('customer_comments', `user_id=eq.${uid}&order=created_at.desc`).then(r => COMMENTS[uid] = r).catch(() => COMMENTS[uid] = []),
    DB.list('tickets', `user_id=eq.${uid}&order=created_at.desc`).then(r => { for (const t of r) if (!T.some(x => x.id === t.id)) T.push(t); }).catch(() => {})]);
  render();
}
const PTABS = [['profile', 'Profile'], ['scores', 'Scores'], ['comments', 'Comments'], ['devices', 'Devices'], ['security', 'Activity & security'], ['cases', 'Cases']];
const pendingDeletion = uid => (DSARS[uid] || []).find(r => r.type === 'delete' && r.status === 'pending');
function customerView() {
  const uid = CUSTID, c = CUST[uid];
  if (!c) return `<div class="page"><div class="empty">Loading…</div></div>`;
  if (c.error) return `<div class="page"><div class="empty">⚠️ ${esc(c.error)}</div></div>`;
  const d = c.data || {}, p = d.profile || {}, name = p.name || (c.email || '').split('@')[0] || '—', g = xpOf(d), del = pendingDeletion(uid);
  return `<div class="page"><div class="pwrap">
    <div class="phero"><div class="avatar big">${esc(name[0]?.toUpperCase() || '?')}</div>
      <div class="grow"><h1>${esc(name)} <span class="cno">#${esc(c.num ?? '–')}</span></h1><div class="muted">${esc(c.email || '')} ${verifiedChip(c)}</div></div>
      <button class="btn" data-act="copyprof" data-u="${esc(uid)}" title="Copy a link to this profile – paste it into internal notes">${ICON.copy} Copy profile link</button>
      <div class="lvl"><b>${g.level}</b><small>level</small></div><div class="lvl"><b>${g.xp}</b><small>XP</small></div>
      ${del ? '' : `<button class="btn danger-o" data-act="deluser">${ICON.trash} Delete account</button>`}</div>
    ${del ? `<div class="delbanner"><div class="grow"><b>🗑️ Scheduled for deletion</b><div>Requested ${dt(del.created_at)} by <b>${del.requested_by_name ? esc(del.requested_by_name) + ' (team)' : 'the customer'}</b> · deleted on <b>${dt(del.delete_at)}</b></div></div>
      <button class="btn" data-act="canceldel" data-id="${del.id}">Cancel deletion</button></div>` : ''}
    <div class="ptabs">${PTABS.map(([k, l]) => `<button class="${PTAB === k ? 'on' : ''}" data-act="ptab" data-k="${k}">${l}${k === 'comments' && (COMMENTS[uid] || []).length ? ` <i>${COMMENTS[uid].length}</i>` : ''}</button>`).join('')}</div>
    <div class="pbody">${(PVIEW[PTAB] || PVIEW.profile)(uid, c, d, p, g)}</div></div></div>`;
}
const verifiedChip = c => !('email_confirmed_at' in c) ? '' : c.email_confirmed_at ? '<span class="chip c-good">✓ Verified</span>' : '<span class="chip c-bad">Not verified</span>';
const profileLink = uid => `${location.origin}${location.pathname.replace(/[^/]*$/, '')}?customer=${uid}`;
const kv = rows => `<div class="kv">${rows.map(([k, v]) => `<span>${k}</span><b>${v}</b>`).join('')}</div>`;
const PVIEW = {
  profile: (uid, c, d, p) => {
    const age = p.birthYear ? new Date().getFullYear() - +p.birthYear : null;
    return `<div class="pgrid"><div class="card"><h3>Basic info</h3>${kv([['Name', esc(p.name || '–')], ['Birth year', p.birthYear ? `${esc(p.birthYear)} <small>(≈ ${age})</small>` : '–'], ['Email', `${esc(c.email || '–')} ${verifiedChip(c)}`],
        ['Customer #', esc(c.num ?? '–')], ['Internal ID', `<code class="idlink" data-act="copyuid" data-u="${esc(uid)}" title="Copy">${esc(uid)}</code>`], ['Customer since', dt(c.created_at)], ['Modes', modesTxt(d)], ['Time zone', esc(d.settings?.tz || '–')]])}</div>
      <div class="card"><h3>Edit profile</h3><div class="frm">
        <label>Name<input id="p_name" value="${esc(p.name || '')}" maxlength="60"></label>
        <label>Birth year<input id="p_by" type="number" min="1920" max="2020" value="${esc(p.birthYear || '')}"></label>
        <label class="wide">Reason<input id="p_reason" placeholder="Customer asked to fix the name"></label></div>
        <div class="row"><span class="sp"></span><button class="btn primary" data-act="saveprof">Save</button></div></div></div>`;
  },
  scores: (uid, c, d, p, g) => {
    const adj = ADJ[uid] || [], pendXp = adj.filter(a => !a.applied && a.kind === 'xp').reduce((s, a) => s + (+a.payload?.amount || 0), 0);
    return `<div class="pgrid"><div class="card"><h3>XP</h3>${kv([['Now', `${g.xp} XP · level ${g.level}`], ['From the team', `${g.bonus > 0 ? '+' : ''}${g.bonus} XP`], ...(pendXp ? [['Waiting to apply', `${pendXp > 0 ? '+' : ''}${pendXp} XP`]] : [])])}
        <div class="frm"><label>Amount (can be negative)<input id="x_amt" type="number" step="5" placeholder="50"></label><label class="wide">Reason – the customer sees it (their language)<input id="x_reason" placeholder="Ačiū, kad pranešei apie klaidą!"></label></div>
        <div class="row">${[25, 50, 100].map(n => `<button class="btn sm" data-act="xpq" data-n="${n}">+${n}</button>`).join('')}<span class="sp"></span><button class="btn primary" data-act="savexp">Add</button></div></div>
      <div class="card"><h3>Where the XP came from</h3><table class="tbl xpt"><tr><th>For</th><th>Count</th><th>XP each</th><th>XP</th></tr>
        ${XP_RULES.map(([k, l]) => `<tr><td>${l}</td><td>${g.parts[k]}</td><td>${XP_W[k]}</td><td><b>${g.parts[k] * XP_W[k]}</b></td></tr>`).join('')}
        <tr><td>From the team</td><td colspan="2"><small>${(d.xpAdjust || []).length} change(s)</small></td><td><b>${g.bonus > 0 ? '+' : ''}${g.bonus}</b></td></tr>
        <tr class="tot"><td>Total</td><td colspan="2"><small>level ${g.level} · next level at ${Math.pow(g.level, 2) * 40} XP</small></td><td><b>${g.xp}</b></td></tr></table></div>
      <div class="card"><h3>Stats</h3>${kv([['Days logged', g.parts.daysLogged], ['Tasks done', g.parts.tasksDone], ['Workouts', g.parts.workouts], ['Meals', (d.meals || []).length], ['Activities', (d.events || []).length], ['Check-ins', g.parts.checkins], ['Recipes', (d.recipes || []).length]])}</div>
      <div class="card wide"><h3>Team changes</h3>${adjList(adj)}</div></div>`;
  },
  comments: uid => `<div class="card"><div class="crow2"><textarea id="cm_body" rows="2" placeholder="What was done? Paste a case link to reference it."></textarea><button class="btn primary" data-act="addcomment">Add</button></div>
    ${(COMMENTS[uid] || []).map(x => `<div class="comment"><div>${linkify(x.body)}</div><small>${esc(x.author_name || '')} · ${dt(x.created_at)}</small></div>`).join('') || '<div class="empty sm">No comments yet</div>'}</div>`,
  devices: uid => {
    const m = META[uid], devs = {};
    for (const s of SIGNINS[uid] || []) { const k = s.device || '?'; if (!devs[k] || devs[k].last_seen < s.last_seen) devs[k] = s; }
    return `<div class="pgrid"><div class="card"><h3>Last used</h3>${kv([['Device', deviceName(m?.device)], ['App version', esc(m?.version || '–')], ['Screen', esc(m?.screen || '–')], ['Last seen', m ? dt(m.last_seen) : '–'], ['Place', esc(placeOf(uid))]])}</div>
      <div class="card"><h3>All devices</h3>${Object.values(devs).map(s => `<div class="li"><span>${deviceName(s.device)}<small>${esc([s.country, s.city].filter(Boolean).join(' · ') || '–')} · ${esc(s.app || '')}</small></span><small>${dt(s.last_seen)}</small></div>`).join('') || '<div class="empty sm">No data yet</div>'}</div></div>`;
  },
  security: (uid, c) => {
    const s = SIGNINS[uid] || [], countries = [...new Set(s.map(x => x.country).filter(Boolean))];
    return `<div class="pgrid"><div class="card"><h3>Account</h3>${kv([['Created', dt(c.created_at)], ['Last sign-in', dt(c.last_sign_in_at)], ['Countries (12 mo.)', esc(countries.join(', ') || '–')]])}
        ${countries.length > 1 ? '<div class="warnbox">⚠️ Signed in from more than one country – check the list below.</div>' : ''}</div>
      <div class="card"><h3>Deletion requests</h3>${(DSARS[uid] || []).filter(r => r.type === 'delete').map(r => `<div class="li"><span>${{pending: '⏳ Scheduled', cancelled: '↩️ Cancelled', done: '✅ Done'}[r.status] || esc(r.status)}<small>${dt(r.created_at)} · by ${r.requested_by_name ? esc(r.requested_by_name) : 'customer'}${r.cancelled_by_name ? ` · cancelled by ${esc(r.cancelled_by_name)}` : ''}</small></span></div>`).join('') || '<div class="empty sm">None</div>'}</div>
      <div class="card wide"><h3>Sign-ins</h3><table class="tbl"><tr><th>When</th><th>Device</th><th>Location</th><th>IP</th></tr>
        ${s.map(x => `<tr><td>${dt(x.last_seen)}${x.created_at !== x.last_seen ? `<small>since ${dt(x.created_at)}</small>` : ''}</td><td>${deviceName(x.device)}</td><td>${esc([x.country, x.city].filter(Boolean).join(' · ') || '–')}</td><td><code>${esc(x.ip || '–')}</code></td></tr>`).join('') || '<tr><td colspan="4" class="empty sm">No sign-ins recorded yet</td></tr>'}</table></div>
      <div class="card wide"><h3>Changes made by the team</h3>${adjList(ADJ[uid] || [])}</div></div>`;
  },
  cases: uid => { const tix = T.filter(x => x.user_id === uid).sort((a, b) => a.created_at < b.created_at ? 1 : -1);
    return `<div class="card">${tix.map(x => `<a class="li caselink" href="./#case/${x.case_no}" target="_blank"><span>${ticketIcon(x)} ${esc(caseTitle(x))}<small>${dt(x.created_at)}</small></span>${stChip(x.status)}</a>`).join('') || '<div class="empty sm">None</div>'}</div>`; },
};
const adjList = adj => adj.length ? adj.map(a => `<div class="li"><span>${a.kind === 'xp' ? `⭐ ${+a.payload?.amount > 0 ? '+' : ''}${esc(a.payload?.amount)} XP` : `👤 ${esc(Object.entries(a.payload || {}).map(([k, v]) => `${k === 'name' ? 'name' : 'birth year'}: ${v}`).join(', '))}`}
  <small>${esc(a.reason || '')} · ${esc(a.actor_name || '')} · ${dt(a.created_at)}</small></span>${a.applied ? '<span class="chip c-good">applied</span>' : `<span class="chip c-blue">waiting</span><b class="x" data-act="deladj" data-id="${a.id}" title="Cancel">✕</b>`}</div>`).join('') : '<div class="empty sm">No changes</div>';
async function addAdj(kind, payload, reason, label) {
  try {
    await DB.insert('account_adjustments', {user_id: CUSTID, kind, payload, reason: reason || null, actor_id: ME.id, actor_name: ME.name});
    await audit(label, {user_id: CUSTID}, {...payload, reason});
    ADJ[CUSTID] = await DB.list('account_adjustments', `user_id=eq.${CUSTID}&order=created_at.desc`);
    render(); toast('Saved');
  } catch (e) { toast('⚠️ ' + esc(e.message)); }
}

// ===================== KNOWLEDGE BASE =====================
function kbList() {
  const q = KBQ.toLowerCase();
  return KB.filter(a => (KBCAT === 'all' || a.category === KBCAT) && (!q || (a.title + ' ' + a.body + ' ' + (a.tags || []).join(' ')).toLowerCase().includes(q)));
}
const kbCats = () => `<div class="cats"><button class="${KBCAT === 'all' ? 'on' : ''}" data-act="kbcat" data-k="all">📚 All</button>${KB_CATS.map(([k, e, l]) => `<button class="${KBCAT === k ? 'on' : ''}" data-act="kbcat" data-k="${k}">${e} ${l}</button>`).join('')}</div>`;
const kbItems = list => list.map(x => `<div class="kbi ${x.id === KBSEL ? 'on' : ''}" data-act="kbopen" data-id="${x.id}"><b>${catOf(x.category)[1]} ${esc(x.title)}</b><small>${esc(x.body.replace(/\s+/g, ' ').slice(0, 90))}</small></div>`).join('') || `<div class="empty">${KB.length ? 'Nothing found' : 'No articles yet'}</div>`;
const kbArticle = (a, tools) => `<div class="kbhead"><span class="chip">${catOf(a.category)[1]} ${catOf(a.category)[2]}</span>${(a.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('')}<span class="sp"></span>${tools}</div>
  <h1>${esc(a.title)}</h1><div class="kbbody">${md(a.body)}</div><small>Updated ${dt(a.updated_at)}${a.author_name ? ' · ' + esc(a.author_name) : ''}</small>`;
// Full page (separate window: ?view=kb)
function kbPage() {
  const a = KB.find(x => x.id === KBSEL);
  return `<div class="kbm"><div class="kbnav"><input id="kbq" placeholder="Search articles" value="${esc(KBQ)}"><button class="btn primary" data-act="kbnew">＋ New article</button>${kbCats()}</div>
    <div class="kblist">${kbItems(kbList())}</div>
    <div class="kbart">${a ? kbArticle(a, `<button class="btn sm" data-act="kbedit">Edit</button><button class="btn sm" data-act="kbdel">Delete</button>`) : '<div class="empty" style="margin:auto">Select an article</div>'}</div></div>`;
}
// Right panel inside a case (instead of customer info)
function kbSide() {
  const a = KB.find(x => x.id === KBSEL);
  return `<div class="side kbside"><div class="kbsh"><b>📚 Knowledge base</b><span class="sp"></span><button class="ib sm" data-act="kbwin" title="Open in a new window">⤢</button><button class="ib sm" data-act="kbside" title="Back to customer">✕</button></div>
    ${a ? `<button class="btn sm" data-act="kbback">← All articles</button><div class="kbart in">${kbArticle(a, '')}</div><button class="btn primary" data-act="kbinsert" data-id="${a.id}">Insert into reply</button>`
      : `<input id="kbsq" placeholder="Search articles" value="${esc(KBQ)}">${kbCats()}<div class="kblist in">${kbItems(kbList())}</div>`}</div>`;
}
function kbEdit(a = {}) {
  modal(`<h3>${a.id ? 'Edit article' : 'New article'}</h3><div class="frm">
    <label class="wide">Title<input id="k_title" value="${esc(a.title || '')}"></label>
    <label>Category<select id="k_cat">${KB_CATS.map(([k, e, l]) => `<option value="${k}" ${a.category === k || (!a.id && KBCAT === k) ? 'selected' : ''}>${e} ${l}</option>`).join('')}</select></label>
    <label>Issue tags (comma separated – same tags you put on cases)<input id="k_tags" value="${esc((a.tags || []).join(', '))}"></label>
    <label class="wide">Text <small># heading · - list · 1. steps · **bold** · ! internal info box</small><textarea id="k_body" rows="14">${esc(a.body || '')}</textarea></label></div>
    <div class="row"><span class="sp"></span><button class="btn" data-act="mclose">Cancel</button><button class="btn primary" data-act="kbsave" data-id="${a.id || ''}">Save</button></div>`);
  $('#k_title').focus();
}

// ===================== MACROS =====================
function macrosView() {
  return `<div class="row"><h2>Macros</h2><span class="sp"></span><button class="btn primary" data-act="macnew">＋ New macro</button></div>
    ${[...MACROS].sort((a, b) => (a.language || 'lt').localeCompare(b.language || 'lt')).map(m => `<div class="card mac"><div class="row"><span class="chip">${(m.language || 'lt') === 'en' ? '🇬🇧' : '🇱🇹'}</span><b>${esc(m.title)}</b><span class="chip ${m.kind === 'internal' ? 'c-warn' : ''}">${m.kind === 'internal' ? 'internal note' : 'reply'}</span><span class="sp"></span>
      <button class="btn sm" data-act="macedit" data-id="${m.id}">Edit</button><button class="btn sm" data-act="macdel" data-id="${m.id}">Delete</button></div><pre>${esc(m.body)}</pre></div>`).join('') || '<div class="empty">No macros</div>'}`;
}
function macEdit(m = {}) {
  modal(`<h3>${m.id ? 'Edit macro' : 'New macro'}</h3><div class="frm">
    <label class="wide">Title<input id="m_title" value="${esc(m.title || '')}"></label>
    <label>Language<select id="m_lang"><option value="lt" ${(m.language || 'lt') === 'lt' ? 'selected' : ''}>🇱🇹 Lithuanian</option><option value="en" ${m.language === 'en' ? 'selected' : ''}>🇬🇧 English</option></select></label>
    <label>Type<select id="m_kind"><option value="public" ${m.kind !== 'internal' ? 'selected' : ''}>Reply to customer</option><option value="internal" ${m.kind === 'internal' ? 'selected' : ''}>Internal note</option></select></label>
    <label class="wide">Text <small>{vardas} {agentas} {nr}</small><textarea id="m_body" rows="10">${esc(m.body || '')}</textarea></label></div>
    <div class="row"><span class="sp"></span><button class="btn" data-act="mclose">Cancel</button><button class="btn primary" data-act="macsave" data-id="${m.id || ''}">Save</button></div>`);
}
function fillMacro(text, t) {
  const p = CUST[t.user_id]?.data?.profile || {}, nm = p.name || (t.email || '').split('@')[0] || '';
  return text.replace(/\{vardas\}/g, nm).replace(/\{agentas\}/g, (ME.name || '').split(' ')[0]).replace(/\{nr\}/g, String(t.case_no ?? ''));
}
// Macros in the case language (internal notes – English); other language listed below
const macroLang = (t, note) => note ? 'en' : ['lt', 'en'].includes(t.language || 'lt') ? (t.language || 'lt') : 'en';
const composerTools = (t, note) => { const L = macroLang(t, note), list = MACROS.filter(m => (m.kind === 'internal') === note), opt = m => `<option value="${m.id}">${esc(m.title)}</option>`;
  const mine = list.filter(m => (m.language || 'lt') === L), rest = list.filter(m => (m.language || 'lt') !== L);
  return `<select id="macro" title="Insert a macro"><option value="">⚡ Macro</option>${mine.map(opt).join('')}${rest.length ? `<optgroup label="${L === 'lt' ? '🇬🇧 English' : '🇱🇹 Lithuanian'}">${rest.map(opt).join('')}</optgroup>` : ''}</select>`; };
function insertText(txt) {
  const r = $('#reply'); if (!r) return;
  const s = r.selectionStart ?? r.value.length, before = r.value.slice(0, s), after = r.value.slice(r.selectionEnd ?? s);
  r.value = before + (before && !before.endsWith('\n') ? '\n' : '') + txt + after; DRAFT[r.dataset.tid] = r.value; r.focus();
}

// ===================== KNOWN ISSUES =====================
function issuesView() {
  const open = ISSUES.filter(i => i.status !== 'fixed'), fixed = ISSUES.filter(i => i.status === 'fixed');
  const card = i => { const linked = T.filter(x => x.issue_id === i.id), waiting = linked.filter(x => !['solved', 'closed'].includes(x.status));
    return `<div class="card issue ${i.status}"><div class="row"><b>${i.status === 'fixed' ? '✅' : '🧯'} ${esc(i.title)}</b><span class="chip">${linked.length} cases</span>${i.fixed_in ? `<span class="chip c-good">fixed in v${esc(i.fixed_in)}</span>` : ''}<span class="sp"></span>
      ${i.status !== 'fixed' ? `<button class="btn sm primary" data-act="issfix" data-id="${i.id}">Mark fixed</button>` : waiting.length ? `<button class="btn sm primary" data-act="issnotify" data-id="${i.id}">Notify customers (${waiting.length})</button>` : ''}
      <button class="btn sm" data-act="issedit" data-id="${i.id}">Edit</button></div>${i.description ? `<p>${esc(i.description)}</p>` : ''}
      ${linked.length ? `<div class="links">${linked.map(x => `<span class="lchip" data-t="${x.id}">${ticketIcon(x)} ${esc(caseTitle(x))} ${stChip(x.status)}</span>`).join('')}</div>` : ''}</div>`; };
  return `<div class="row"><h2>Known issues</h2><span class="sp"></span><button class="btn primary" data-act="issnew">＋ New issue</button></div>
    <h4>Open (${open.length})</h4>${open.map(card).join('') || '<div class="empty sm">No open issues 🎉</div>'}
    ${fixed.length ? `<h4>Fixed (${fixed.length})</h4>${fixed.map(card).join('')}` : ''}`;
}
function issEdit(i = {}, ticket) {
  modal(`<h3>${i.id ? 'Edit issue' : 'New known issue'}</h3><div class="frm">
    <label class="wide">Title<input id="i_title" value="${esc(i.title || '')}" placeholder="Timer shows zeros after pause"></label>
    <label class="wide">Description (what, when, workaround)<textarea id="i_desc" rows="5">${esc(i.description || '')}</textarea></label></div>
    <div class="row"><span class="sp"></span><button class="btn" data-act="mclose">Cancel</button><button class="btn primary" data-act="isssave" data-id="${i.id || ''}" data-tk="${ticket?.id || ''}">Save</button></div>`);
  $('#i_title').focus();
}
function notifyIssue(i) {
  const tx = T.filter(x => x.issue_id === i.id && !['solved', 'closed'].includes(x.status));
  const mac = MACROS.find(m => /pataisyta/i.test(m.title));
  modal(`<h3>Notify ${tx.length} customers</h3><p class="muted">Sent via each case's channel. Cases are assigned to you and solved; cases assigned to others are skipped.</p>
    <textarea id="n_body" rows="9" style="width:100%">${esc(mac?.body || `Sveiki, {vardas}!\n\nGera žinia – problemą pataisėme${i.fixed_in ? ` (versija ${i.fixed_in})` : ''}. Atnaujinkite programėlę.\n\nAčiū už kantrybę!\n{agentas}, Life Schedule`)}</textarea>
    <div class="row"><span class="sp"></span><button class="btn" data-act="mclose">Cancel</button><button class="btn primary" data-act="issgo" data-id="${i.id}">Send to all</button></div>`);
}
async function runNotify(i, body) {
  let ok = 0, skip = 0, fail = 0;
  for (const t of T.filter(x => x.issue_id === i.id && !['solved', 'closed'].includes(x.status))) {
    if (t.assignee && t.assignee !== ME.id) { skip++; continue; }
    try {
      if (!t.assignee) { await DB.update('tickets', `id=eq.${t.id}`, {assignee: ME.id, assignee_name: ME.name}); t.assignee = ME.id; t.assignee_name = ME.name; }
      await loadCustomer(t.user_id);
      const text = fillMacro(body, t);
      const [m] = await DB.insert('ticket_messages', {ticket_id: t.id, author_id: ME.id, author_name: ME.name, author_role: 'agent', kind: 'public', body: text, attachments: []});
      if (t.channel === 'email' && t.email) { const r = await sendMail(m.id); if (!r.ok) fail++; }
      else if (t.type === 'feedback' && t.source_id) DB.update('feedback', `id=eq.${t.source_id}`, {reply: text, status: 'done'}).catch(() => {});
      const [r2] = await DB.update('tickets', `id=eq.${t.id}`, {status: 'solved', status_at: nowIso(), solved_at: nowIso(), updated_at: nowIso()}); Object.assign(t, r2 || {status: 'solved'});
      await logEvent(t, `Customer notified: issue "${i.title}" fixed`); await audit('notified about fixed issue', t, {issue: i.title}); ok++;
    } catch (e) { fail++; }
  }
  closeModal(true); render();
  toast(`📣 Notified: ${ok}${skip ? ` · skipped: ${skip}` : ''}${fail ? ` · ⚠️ failed: ${fail}` : ''}`);
}

// ===================== NEW (OUTGOING) CASE – own page =====================
function newCaseView() {
  return `<div class="page"><div class="pwrap narrow"><h1>New case</h1><p class="muted">Write to a customer first. The case is created as Pending and assigned to you.</p>
    <div class="card"><div class="frm">
      <label>Customer #<input id="n_num" type="number" min="1" placeholder="1"></label><div class="whomini" id="n_who">${NEWC ? `✅ <b>${esc(NEWC.name || '(no name)')}</b> · ${esc(NEWC.email || '')}` : 'Enter the customer number'}</div>
      <label>Channel<select id="n_chan"><option value="app">📱 In app</option><option value="email">✉️ Email</option></select></label>
      <label>Language<select id="n_lang">${LANGS.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select></label>
      <label class="wide">Subject<input id="n_subj" maxlength="120" placeholder="Attention needed"></label>
      <label class="wide">Message to customer<textarea id="n_msg" rows="7"></textarea></label>
      <label class="wide reasonlbl">Internal reason <small>– never shown to the customer</small><textarea id="n_reason" rows="2"></textarea></label></div>
    <div class="row"><span class="sp"></span><button class="btn" data-act="home">Cancel</button><button class="btn primary" data-act="newcasego">Create and send</button></div></div></div></div>`;
}
let NEWC_T = null;
async function lookupCustomer(n) {
  const box = $('#n_who'); if (!box) return;
  if (!n) { NEWC = null; box.textContent = 'Enter the customer number'; return; }
  box.textContent = 'Searching…';
  try { NEWC = await DB.rpc('console_find_customer', {n: +n}); } catch (e) { NEWC = null; }
  if (val('n_num') !== String(n)) return;
  box.innerHTML = NEWC ? `✅ <b>${esc(NEWC.name || '(no name)')}</b> · ${esc(NEWC.email || '')}` : '❌ Customer not found';
}
async function createCase() {
  const subject = val('n_subj'), body = $('#n_msg').value.trim(), reason = val('n_reason'), channel = val('n_chan'), language = val('n_lang');
  if (!NEWC) return toast('Choose a customer');
  if (!subject || !body) return toast('Subject and message are required');
  if (!reason) return toast('Write the internal reason');
  if (channel === 'email' && !NEWC.email) return toast('Customer has no email');
  try {
    const now = nowIso();
    const [t] = await DB.insert('tickets', {user_id: NEWC.id, email: NEWC.email, type: 'outgoing', outgoing: true, subject, channel, language, priority: 'normal', tags: ['outgoing'],
      status: 'pending', status_at: now, status_until: inHours(48), assignee: ME.id, assignee_name: ME.name,
      created_reason: reason, created_by: ME.id, created_by_name: ME.name, updated_at: now});
    T.unshift(t);
    await logEvent(t, `Outgoing case created by ${ME.name}`);
    const [m] = await DB.insert('ticket_messages', {ticket_id: t.id, author_id: ME.id, author_name: ME.name, author_role: 'agent', kind: 'public', body, attachments: []});
    (MSGS[t.id] = MSGS[t.id] || []).push(m);
    if (channel === 'email') { const r = await sendMail(m.id); Object.assign(m, r.ok ? {mail_status: 'sent', sent_at: now} : {mail_status: 'failed', mail_error: r.error}); if (!r.ok) toast('⚠️ Email not sent: ' + esc(r.error)); }
    await audit('created outgoing case', t, {reason});
    NEWC = null; await selectCase(t.id);
  } catch (e) { toast('⚠️ ' + esc(e.message)); }
}

// ===================== ADMIN PANEL: tabs on the left, search on top =====================
const ADM = {tab: 'users', q: '', rows: null, busy: false, uid: null, dels: null};
const ADMTABS = [['users', '👥', 'Users'], ['deletions', '🗑️', 'Scheduled deletions']];
function adminView() {
  return `<div class="admin"><div class="anav"><h3>Admin</h3>${ADMTABS.map(([k, e, l]) => `<button class="${ADM.tab === k ? 'on' : ''}" data-act="admtab" data-k="${k}">${e} ${l}</button>`).join('')}</div>
    <div class="amain">${ADM.uid ? `<div class="aback"><button class="btn sm" data-act="admback">← Back</button></div>${customerView()}` : ADM.tab === 'users' ? admUsers() : admDeletions()}</div></div>`;
}
function admUsers() {
  return `<div class="page"><div class="pwrap"><h1>Users</h1><div class="sbar"><input id="aq" placeholder="Email, customer # or ID" value="${esc(ADM.q)}"><button class="btn primary" data-act="admsearch">${ICON.search} Search</button></div>
    ${ADM.busy ? '<div class="empty">Searching…</div>' : ADM.rows == null ? '<div class="empty">Search for a customer by email, number or ID.</div>' : !ADM.rows.length ? '<div class="empty">No user found</div>'
      : `<div class="card flush"><table class="tbl"><tr><th>Customer</th><th>Email</th><th>Created</th><th>Last sign-in</th><th></th></tr>${ADM.rows.map(u => `<tr><td><b>${esc(u.name || '–')}</b> <small>#${esc(u.num ?? '–')}</small></td>
        <td>${esc(u.email || '')} ${verifiedChip(u)}</td><td>${dt(u.created_at)}</td><td>${dt(u.last_sign_in_at)}</td><td><button class="ib sm" data-act="admopen" data-u="${esc(u.id)}" title="View account">${ICON.edit}</button></td></tr>`).join('')}</table></div>`}</div></div>`;
}
function admDeletions() {
  const r = ADM.dels;
  return `<div class="page"><div class="pwrap"><h1>Scheduled deletions</h1>${r == null ? '<div class="empty">Loading…</div>' : !r.length ? '<div class="empty">No accounts are scheduled for deletion</div>'
    : `<div class="card flush"><table class="tbl"><tr><th>Email</th><th>Requested</th><th>By</th><th>Deleted on</th><th></th></tr>${r.map(x => `<tr><td>${esc(x.email || '–')}</td><td>${dt(x.created_at)}</td><td>${x.requested_by_name ? esc(x.requested_by_name) + ' (team)' : 'customer'}</td><td>${dt(x.delete_at)}</td>
      <td>${x.user_id ? `<button class="ib sm" data-act="admopen" data-u="${esc(x.user_id)}" title="View account">${ICON.edit}</button>` : ''}</td></tr>`).join('')}</table></div>`}</div></div>`;
}
async function admSearch() {
  ADM.q = val('aq'); if (ADM.q.length < 2) return toast('Type at least 2 characters');
  ADM.busy = true; render();
  try { ADM.rows = await DB.rpc('console_find_users', {q: ADM.q}) || []; } catch (e) { ADM.rows = []; toast('⚠️ Search is not available yet – run SQL 10 in Supabase'); }
  ADM.busy = false; render(); const i = $('#aq'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
}
async function loadDeletions() { try { ADM.dels = await DB.list('dsar_requests', 'type=eq.delete&status=eq.pending&order=delete_at.asc'); } catch (e) { ADM.dels = []; } render(); }

// Quick comment on the customer's profile from a case (case link added at the end)
function quickComment(t) {
  modal(`<h3>Comment on ${esc(customerName(t))}'s profile</h3><p class="muted">A link to case #${t.case_no} is added automatically.</p>
    <textarea id="qc_body" rows="4" style="width:100%" placeholder="What was done?"></textarea>
    <div class="row"><span class="sp"></span><button class="btn" data-act="mclose">Cancel</button><button class="btn primary" data-act="qcsave">Save comment</button></div>`);
  $('#qc_body').focus();
}

// ===================== Wiring =====================
const EXTRA_VIEW = {customer: customerView, newcase: newCaseView};
const EXTRA_ACT = {
  profile: el => window.open(`./?customer=${encodeURIComponent(el.dataset.u)}`, '_blank'),
  copyprof: el => { navigator.clipboard?.writeText(profileLink(el.dataset.u)); toast('🔗 Profile link copied – paste it into an internal note'); },
  copyuid: el => { navigator.clipboard?.writeText(el.dataset.u); toast('ID copied'); },
  mclose: () => closeModal(true),
  ptab: el => { PTAB = el.dataset.k; render(); },
  admtab: el => { ADM.tab = el.dataset.k; ADM.uid = null; render(); if (ADM.tab === 'deletions') loadDeletions(); },
  admsearch: () => admSearch(),
  admopen: el => { ADM.uid = el.dataset.u; PTAB = 'profile'; openCustomer(el.dataset.u, true); },
  admback: () => { ADM.uid = null; CUSTID = null; render(); },
  saveprof: () => {
    const p = CUST[CUSTID]?.data?.profile || {}, name = val('p_name'), by = val('p_by'), payload = {};
    if (name && name !== (p.name || '')) payload.name = name;
    if (by && +by !== +(p.birthYear || 0)) { if (+by < 1920 || +by > new Date().getFullYear() - 5) return toast('Invalid birth year'); payload.birthYear = +by; }
    if (!Object.keys(payload).length) return toast('Nothing changed');
    addAdj('profile', payload, val('p_reason'), 'changed customer profile');
  },
  xpq: el => { $('#x_amt').value = el.dataset.n; $('#x_reason').focus(); },
  savexp: () => {
    const n = Math.round(+val('x_amt')); if (!n || Math.abs(n) > 5000) return toast('Enter an amount (50 or -20)');
    if (!val('x_reason')) return toast('Write a reason – the customer sees it');
    addAdj('xp', {amount: n}, val('x_reason'), n > 0 ? `added ${n} XP` : `removed ${-n} XP`);
  },
  deladj: async el => { try { await DB.req('DELETE', 'account_adjustments', `id=eq.${el.dataset.id}&applied=eq.false`); await audit('cancelled adjustment', {user_id: CUSTID}); ADJ[CUSTID] = ADJ[CUSTID].filter(a => a.id !== el.dataset.id); render(); } catch (e) { toast('⚠️ ' + esc(e.message)); } },
  addcomment: async () => {
    const body = $('#cm_body').value.trim(); if (!body) return;
    try { const [c] = await DB.insert('customer_comments', {user_id: CUSTID, author_id: ME.id, author_name: ME.name, body}); (COMMENTS[CUSTID] = COMMENTS[CUSTID] || []).unshift(c); render(); }
    catch (e) { toast('⚠️ ' + esc(e.message)); }
  },
  quickcomment: () => { const t = T.find(x => x.id === SEL); if (t) quickComment(t); },
  qcsave: async () => {
    const t = T.find(x => x.id === SEL), body = $('#qc_body').value.trimEnd(); if (!t || !body.trim()) return;
    try { await DB.insert('customer_comments', {user_id: t.user_id, author_id: ME.id, author_name: ME.name, body: body + ' ' + caseLink(t)}); delete COMMENTS[t.user_id]; closeModal(true); toast('💬 Comment saved'); }
    catch (e) { toast('⚠️ ' + esc(e.message)); }
  },
  deluser: async () => {
    const c = CUST[CUSTID]; if (!c) return;
    if (!await ask('Delete this account?', `All of ${esc(c.data?.profile?.name || c.email || 'the customer')}'s data will be deleted in 20 days. You can cancel until then.`, {icon: '🗑️', danger: true, yes: 'Schedule deletion'})) return;
    try {
      await DB.insert('dsar_requests', {user_id: CUSTID, email: c.email, type: 'delete', status: 'pending', delete_at: new Date(Date.now() + 20 * 864e5).toISOString(), due_at: new Date(Date.now() + 20 * 864e5).toISOString(), requested_by: ME.id, requested_by_name: ME.name});
      await audit('scheduled account deletion', {user_id: CUSTID}); await loadDsar(CUSTID); render();
    } catch (e) { toast('⚠️ ' + esc(e.message)); }
  },
  canceldel: async el => {
    try { await DB.update('dsar_requests', `id=eq.${el.dataset.id}`, {status: 'cancelled', done_at: nowIso(), cancelled_by_name: ME.name}); await audit('cancelled account deletion', {user_id: CUSTID}); await loadDsar(CUSTID); render(); toast('Deletion cancelled'); }
    catch (e) { toast('⚠️ ' + esc(e.message)); }
  },
  // knowledge base
  kbcat: el => { KBCAT = el.dataset.k; render(true); },
  kbopen: el => { KBSEL = el.dataset.id; render(true); },
  kbback: () => { KBSEL = null; render(true); },
  kbside: async () => { SIDE = SIDE === 'kb' ? 'customer' : 'kb'; if (SIDE === 'kb' && !KB.length) await loadExtra('kb'); render(true); },
  kbwin: () => window.open('./?view=kb', 'lskb', 'width=1150,height=820'),
  kbnew: () => kbEdit(),
  kbedit: () => kbEdit(KB.find(x => x.id === KBSEL)),
  kbdel: async () => {
    const a = KB.find(x => x.id === KBSEL); if (!a || !await ask('Delete article?', `"${esc(a.title)}" will be deleted permanently.`, {danger: true, icon: '🗑️', yes: 'Delete'})) return;
    try { await DB.req('DELETE', 'kb_articles', `id=eq.${a.id}`); await audit('deleted KB article', null, {title: a.title}); KB = KB.filter(x => x.id !== a.id); KBSEL = null; render(); } catch (e) { toast('⚠️ ' + esc(e.message)); }
  },
  kbsave: async el => {
    const row = {title: val('k_title'), category: val('k_cat'), body: $('#k_body').value.trim(), tags: val('k_tags').split(',').map(s => s.trim().toLowerCase()).filter(Boolean), author_name: ME.name, updated_at: nowIso()};
    if (!row.title) return toast('Title is required');
    try {
      const [r] = el.dataset.id ? await DB.update('kb_articles', `id=eq.${el.dataset.id}`, row) : await DB.insert('kb_articles', row);
      await loadExtra('kb'); KBSEL = r?.id || el.dataset.id; await audit(el.dataset.id ? 'edited KB article' : 'created KB article', null, {title: row.title}); closeModal(true); render();
    } catch (e) { toast('⚠️ ' + esc(e.message)); }
  },
  kbinsert: el => { const a = KB.find(x => x.id === el.dataset.id); if (a) insertText(a.body); },
  // macros
  macnew: () => macEdit(),
  macedit: el => macEdit(MACROS.find(m => m.id === el.dataset.id)),
  macdel: async el => { const m = MACROS.find(x => x.id === el.dataset.id); if (!m || !await ask('Delete macro?', `"${esc(m.title)}"`, {danger: true, icon: '🗑️', yes: 'Delete'})) return; try { await DB.req('DELETE', 'macros', `id=eq.${m.id}`); MACROS = MACROS.filter(x => x.id !== m.id); render(); } catch (e) { toast('⚠️ ' + esc(e.message)); } },
  macsave: async el => {
    const row = {title: val('m_title'), language: val('m_lang'), kind: val('m_kind'), set_status: null, body: $('#m_body').value.trim()};
    if (!row.title || !row.body) return toast('Title and text are required');
    try { el.dataset.id ? await DB.update('macros', `id=eq.${el.dataset.id}`, row) : await DB.insert('macros', row); await loadExtra('macros'); closeModal(true); render(); } catch (e) { toast('⚠️ ' + esc(e.message)); }
  },
  // issues
  issnew: () => issEdit(),
  issedit: el => issEdit(ISSUES.find(i => i.id === el.dataset.id)),
  isssave: async el => {
    const row = {title: val('i_title'), description: $('#i_desc').value.trim()}; if (!row.title) return toast('Title is required');
    try {
      const [r] = el.dataset.id ? await DB.update('known_issues', `id=eq.${el.dataset.id}`, row) : await DB.insert('known_issues', row);
      await audit(el.dataset.id ? 'edited issue' : 'created known issue', null, {title: row.title});
      await loadExtra('issues'); closeModal(true);
      const tk = T.find(x => x.id === el.dataset.tk); if (tk && r) return updTicket(tk, {issue_id: r.id}, 'linked to issue', `Linked to known issue "${row.title}"`);
      render();
    } catch (e) { toast('⚠️ ' + esc(e.message)); }
  },
  issfix: el => {
    const i = ISSUES.find(x => x.id === el.dataset.id);
    modal(`<h3>Mark as fixed</h3><p>${esc(i.title)}</p><div class="frm"><label>Fixed in version<input id="f_ver" placeholder="1.2.1"></label></div>
      <div class="row"><span class="sp"></span><button class="btn" data-act="mclose">Cancel</button><button class="btn primary" data-act="issfixgo" data-id="${i.id}">Mark fixed</button></div>`);
  },
  issfixgo: async el => {
    try { await DB.update('known_issues', `id=eq.${el.dataset.id}`, {status: 'fixed', fixed_in: val('f_ver') || null, fixed_at: nowIso()}); await audit('marked issue fixed', null, {version: val('f_ver')});
      await loadExtra('issues'); closeModal(true); render(); const i = ISSUES.find(x => x.id === el.dataset.id); if (i && T.some(x => x.issue_id === i.id && !['solved', 'closed'].includes(x.status))) notifyIssue(i); }
    catch (e) { toast('⚠️ ' + esc(e.message)); }
  },
  issnotify: el => notifyIssue(ISSUES.find(i => i.id === el.dataset.id)),
  issgo: el => { const i = ISSUES.find(x => x.id === el.dataset.id), body = $('#n_body').value.trim(); if (i && body) { el.disabled = true; el.textContent = 'Sending…'; runNotify(i, body); } },
  // new case
  newcase: () => { NEWC = null; VIEW = 'newcase'; POP = null; render(); $('#n_num')?.focus(); },
  newcasego: el => { el.disabled = true; createCase().finally(() => { el.disabled = false; }); },
};
document.addEventListener('change', e => {
  if (e.target.id !== 'macro' || !e.target.value) return;
  const m = MACROS.find(x => x.id === e.target.value), t = T.find(x => x.id === SEL); e.target.value = '';
  if (!m || !t) return;
  insertText(fillMacro(m.body, t));
});
document.addEventListener('input', e => {
  const id = e.target.id;
  if (id === 'kbq' || id === 'kbsq') { KBQ = e.target.value; KBSEL = null; const pos = e.target.selectionStart; render(true); const q = $('#' + id); if (q) { q.focus(); q.setSelectionRange(pos, pos); } }
  if (id === 'n_num') { clearTimeout(NEWC_T); const v = e.target.value.trim(); NEWC_T = setTimeout(() => lookupCustomer(v), 350); }
});
