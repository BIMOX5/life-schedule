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
const PTABS = [['profile', 'Profile'], ['body', 'Body & calories'], ['wellbeing', 'Wellbeing'], ['scores', 'Scores'], ['devices', 'Devices'], ['security', 'Activity & security'], ['cases', 'Cases'], ['comments', 'Comments']];
const pendingDeletion = uid => (DSARS[uid] || []).find(r => r.type === 'delete' && r.status === 'pending');
const pendProfile = uid => [...(ADJ[uid] || [])].filter(a => a.kind === 'profile' && !a.applied).sort((a, b) => a.created_at < b.created_at ? -1 : 1);
const effProfile = (uid, p) => Object.assign({}, p, ...pendProfile(uid).map(a => a.payload || {}));
const pendKey = (uid, k) => pendProfile(uid).some(a => k in (a.payload || {}));
const pendChip = (uid, k) => pendKey(uid, k) ? ' <span class="chip c-blue" title="Saved – the app applies it as soon as the customer has it open">⏳ pending</span>' : '';
function customerView() {
  const uid = CUSTID, c = CUST[uid];
  if (!c) return `<div class="page"><div class="empty">Loading…</div></div>`;
  if (c.error) return `<div class="page"><div class="empty">⚠️ ${esc(c.error)}</div></div>`;
  const d0 = c.data || {}, p = effProfile(uid, d0.profile || {}), d = {...d0, profile: p}, g = xpOf(d);
  return `<div class="page"><div class="pwrap">
    <div class="ptabs">${PTABS.map(([k, l]) => `<button class="${PTAB === k ? 'on' : ''}" data-act="ptab" data-k="${k}">${l}${k === 'comments' && (COMMENTS[uid] || []).length ? ` <i>${COMMENTS[uid].length}</i>` : ''}</button>`).join('')}</div>
    <div class="pbody">${(PVIEW[PTAB] || PVIEW.profile)(uid, c, d, p, g)}</div></div></div>`;
}
// One field = one bubble with a copy button
const fbub = (label, inner, copy) => `<div class="fbub"><small>${label}</small><div class="fbin">${inner}${copy != null && copy !== '' ? `<button class="cpy" data-act="copyval" data-v="${esc(copy)}" title="Copy">${ICON.copy}</button>` : ''}</div></div>`;

const verifiedChip = c => !('email_confirmed_at' in c) ? '' : c.email_confirmed_at ? '<span class="chip c-good">✓ Verified</span>' : '<span class="chip c-bad">Not verified</span>';
const profileLink = uid => `${location.origin}${location.pathname.replace(/[^/]*$/, '')}?view=admin&customer=${uid}`;
const kv = rows => `<div class="kv">${rows.map(([k, v]) => `<span>${k}</span><b>${v}</b>`).join('')}</div>`;
// Same formula as the app (Mifflin–St Jeor): shows each step so we can explain it
const ACT_NAMES = {1.2: 'Mostly sitting (×1.2)', 1.375: 'Moves a little (×1.375)', 1.55: 'Moves a lot (×1.55)', 1.725: 'Very active (×1.725)'};
const GOAL_NAMES = {0.75: 'Lose faster (~0.75 kg/week)', 0.5: 'Lose (~0.5 kg/week)', 0.25: 'Lose slowly (~0.25 kg/week)', 0: 'Keep weight', '-0.25': 'Gain (muscle)'};
function calcTargets(d) {
  const p = d.profile || {}, ws = [...(d.weights || [])].sort((a, b) => a.date < b.date ? -1 : 1), kg = ws.length ? +ws[ws.length - 1].kg : +p.startWeight || 0;
  const h = +p.height || 0, by = +p.birthYear || 0, age = by ? new Date().getFullYear() - by : 0, act = +p.activity || 1.375, rate = +p.goalRate || 0;
  const missing = [!kg && 'weight', !h && 'height', !by && 'birth year'].filter(Boolean);
  const bmr = 10 * kg + 6.25 * (h || 175) - 5 * (age || 25) + (p.sex === 'f' ? -161 : 5), tdee = bmr * act, deficit = rate * 7700 / 7, minK = p.sex === 'f' ? 1300 : 1600;
  const kcal = Math.round(Math.max(minK, tdee - deficit) / 10) * 10, refKg = +p.targetWeight && +p.targetWeight < kg ? (+p.targetWeight + kg) / 2 : kg;
  return {p, kg, kgDate: ws.length ? ws[ws.length - 1].date : null, h, age, act, rate, missing, bmr: Math.round(bmr), tdee: Math.round(tdee), deficit: Math.round(deficit), minK, kcal, floor: tdee - deficit < minK, protein: Math.round(refKg * 2), water: Math.round(kg * 0.035 * 10) / 10, bmi: h ? Math.round(kg / ((h / 100) ** 2) * 10) / 10 : 0};
}
const W_MOODS = [['😫', 'Very bad'], ['😕', 'Bad'], ['😐', 'Okay'], ['🙂', 'Good'], ['😁', 'Great']];
const W_LABELS = {energija: '⚡ Lots of energy', ramus: '😌 Calm', laimingas: '🥰 Happy', produktyvus: '🎯 Productive', issimiegojes: '😴 Well rested', stiprus: '💪 Strong',
  nuovargis: '🥱 Tired', stresas: '😣 Stressed', nerimas: '😟 Anxious', galva: '🤕 Headache', migrena: '🤯 Migraine', pilvas: '🤢 Stomach ache', raumenys: '💢 Sore muscles', persalimas: '🤧 Cold',
  miegas: '😴 Sleep', darbas: '💼 Work / studies', artimieji: '🫂 Loved ones', sportas: '🏃 Sport', maistas: '🍽️ Food', poilsis: '🌿 Rest', sveikata: '🩺 Health', oras: '🌦️ Weather', pinigai: '💶 Money', laisvalaikis: '🎉 Free time'};
const wLabel = k => String(k).startsWith('c:') ? '✏️ ' + k.slice(2) : W_LABELS[k] || k;
const PVIEW = {
  wellbeing: (uid, c, d) => {
    const all = d.wellbeing || [], byDay = {};
    all.forEach(w => (byDay[w.date] = byDay[w.date] || []).push(w));
    const days = Object.keys(byDay).sort().reverse(), dayMood = ws => { const m = ws.filter(w => w.mood); return m.length ? Math.round(m.reduce((s, w) => s + w.mood, 0) / m.length) : 0; };
    const from = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10), recent = all.filter(w => w.date >= from && w.mood);
    const count = key => { const c2 = {}; recent.forEach(w => (w[key] || []).forEach(k => c2[k] = (c2[k] || 0) + 1)); return Object.entries(c2).sort((a, b) => b[1] - a[1]).slice(0, 5); };
    const avg = recent.length ? Math.round(recent.reduce((s, w) => s + w.mood, 0) / recent.length) : 0, hard = Object.keys(byDay).filter(x => x >= from && dayMood(byDay[x]) <= 2 && dayMood(byDay[x])).length;
    if (!all.length) return '<div class="card"><div class="empty sm">The customer has not logged their wellbeing yet.</div></div>';
    return `<div class="pgrid"><div class="card"><h3>Last 30 days</h3>${kv([['Days logged', Object.keys(byDay).filter(x => x >= from).length], ['Average mood', avg ? `${W_MOODS[avg - 1][0]} ${W_MOODS[avg - 1][1]}` : '–'], ['Hard days', hard]])}</div>
      <div class="card"><h3>Most common (30 days)</h3>${kv([['Reasons', esc(count('why').map(([k, n]) => `${wLabel(k)} ×${n}`).join(', ') || '–')], ['Feelings', esc(count('sym').map(([k, n]) => `${wLabel(k)} ×${n}`).join(', ') || '–')]])}</div>
      <div class="card wide"><h3>History</h3>${days.map(x => { const ws = byDay[x].sort((a, b) => (a.time || '') < (b.time || '') ? -1 : 1), m = dayMood(ws);
        return `<div class="wday"><div class="wdh"><b>${m ? W_MOODS[m - 1][0] : '•'} ${esc(x)}</b><small>${ws.length} entr${ws.length === 1 ? 'y' : 'ies'}</small></div>
          ${ws.map(w => `<div class="wrow"><small>${esc(w.time || 'day')}</small><span>${W_MOODS[w.mood - 1]?.[0] || '•'}</span><span>${esc([...(w.why || []), ...(w.sym || [])].map(wLabel).join(' · ') || W_MOODS[w.mood - 1]?.[1] || '')}${w.ctx === 'workout' ? ' <small>(after workout)</small>' : ''}${w.note ? `<small>“${esc(w.note)}”</small>` : ''}</span></div>`).join('')}</div>`; }).join('')}</div></div>`;
  },
  body: (uid, c, d) => {   // d.profile already includes pending team changes
    const x = calcTargets(d), on = d.settings?.modes || {}, used = on.sport || on.food;
    return `<div class="pgrid"><div class="card"><h3>What the customer entered</h3>${kv([['Sex', `<span class="sexed"><select id="b_sex"><option value="m" ${x.p.sex !== 'f' ? 'selected' : ''}>Male</option><option value="f" ${x.p.sex === 'f' ? 'selected' : ''}>Female</option></select><button class="btn sm primary" data-act="savesex">Save</button></span>`], ['Birth year', x.p.birthYear ? `${esc(x.p.birthYear)} <small>(${x.age} y.)</small>` : '<b class="t-bad">missing</b>'],
        ['Height', x.h ? `${x.h} cm` : '<b class="t-bad">missing</b>'], ['Weight', x.kg ? `${x.kg} kg <small>${x.kgDate ? 'weighed ' + esc(x.kgDate) : 'start weight'}</small>` : '<b class="t-bad">missing</b>'],
        ['Target weight', x.p.targetWeight ? `${esc(x.p.targetWeight)} kg` : '–'], ['Activity', esc(ACT_NAMES[x.act] || '×' + x.act)], ['Goal', esc(GOAL_NAMES[String(x.rate)] || x.rate + ' kg/week')], ['Modes', modesTxt(d)]])}
        ${!used ? '<div class="warnbox">Sport and nutrition modes are off – the app does not show calories to this customer.</div>' : x.missing.length ? `<div class="warnbox">Missing: <b>${x.missing.join(', ')}</b> – the app asks the customer to fill them in instead of showing calories.</div>` : ''}</div>
      <div class="card"><h3>How the app calculates</h3><table class="tbl xpt">
        <tr><td>1. Calories at rest (BMR)<small>10 × ${x.kg || '?'} kg + 6.25 × ${x.h || '?'} cm − 5 × ${x.age || '?'} y. ${x.p.sex === 'f' ? '− 161' : '+ 5'}</small></td><td><b>${x.bmr} kcal</b></td></tr>
        <tr><td>2. Burns per day (TDEE)<small>BMR × activity ${x.act}</small></td><td><b>${x.tdee} kcal</b></td></tr>
        <tr><td>3. Daily deficit<small>${x.rate} kg/week × 7700 kcal ÷ 7 days</small></td><td><b>${x.deficit > 0 ? '−' : x.deficit < 0 ? '+' : ''}${Math.abs(x.deficit)} kcal</b></td></tr>
        <tr class="tot"><td>Daily calorie target<small>${x.floor ? `never below ${x.minK} kcal (safety minimum) – used here` : 'TDEE − deficit, rounded to 10'}</small></td><td><b>${x.kcal} kcal</b></td></tr>
        <tr><td>Protein<small>2 g × ${x.p.targetWeight && +x.p.targetWeight < x.kg ? 'average of current and target weight' : 'current weight'}</small></td><td><b>${x.protein} g</b></td></tr>
        <tr><td>Water<small>35 ml × kg</small></td><td><b>${x.water} l</b></td></tr><tr><td>BMI</td><td><b>${x.bmi || '–'}</b></td></tr></table></div></div>`;
  },
  profile: (uid, c, d, p) => {
    const name = p.name || (c.email || '').split('@')[0] || '—', age = p.birthYear ? new Date().getFullYear() - +p.birthYear : null, del = pendingDeletion(uid);
    return `<div class="card pbox">
      <div class="fgrid">
        ${fbub('Name', `<input id="p_name" value="${esc(p.name || '')}" maxlength="60">`, p.name || '')}
        ${fbub('Birth year' + (age ? ` <i>· ${age} y.</i>` : ''), `<input id="p_by" type="number" min="1920" max="2020" value="${esc(p.birthYear || '')}">`, p.birthYear || '')}
        ${fbub('Sex', `<select id="p_sex"><option value="m" ${p.sex !== 'f' ? 'selected' : ''}>Male</option><option value="f" ${p.sex === 'f' ? 'selected' : ''}>Female</option></select>`, p.sex === 'f' ? 'Female' : 'Male')}
        ${fbub('Email ' + verifiedChip(c), `<span class="ro">${esc(c.email || '–')}</span>`, c.email || '')}
        ${fbub('ID', `<span class="ro">${esc(c.num ?? '–')}</span>`, c.num ?? '')}
        ${fbub('Time zone', `<span class="ro">${esc(d.settings?.tz || '–')}</span>`, '')}
        ${fbub('Customer since', `<span class="ro">${dt(c.created_at)}</span>`, '')}
        ${fbub('Modes', `<span class="ro">${modesTxt(d)}</span>`, '')}
      </div></div>
    ${del ? `<div class="delbanner"><div class="grow"><b>🗑️ Scheduled for deletion</b><div>Requested ${dt(del.created_at)} by <b>${del.requested_by_name ? esc(del.requested_by_name) + ' (team)' : 'the customer'}</b> · deleted on <b>${dt(del.delete_at)}</b></div></div>
      <button class="btn" data-act="canceldel" data-id="${del.id}">Cancel deletion</button></div>` : ''}
    <div class="pfoot">${del ? '' : `<button class="btn danger-o" data-act="deluser">${ICON.trash} Delete account</button>`}<span class="sp"></span><button class="btn primary" data-act="saveprof">Save</button></div>`;
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
      ${IS_DEV() ? `<div class="card wide"><h3>Team changes</h3>${adjList(adj)}</div>` : ''}</div>`;
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
      ${IS_DEV() ? `<div class="card wide"><h3>Changes made by the team</h3>${adjList(ADJ[uid] || [])}</div>` : ''}</div>`;
  },
  cases: uid => { const tix = T.filter(x => x.user_id === uid).sort((a, b) => a.created_at < b.created_at ? 1 : -1);
    return `<div class="card">${tix.map(x => `<a class="li caselink" href="./#case/${x.case_no}" target="_blank"><span>${ticketIcon(x)} ${esc(caseTitle(x))}<small>${dt(x.created_at)}</small></span>${stChip(x.status)}</a>`).join('') || '<div class="empty sm">None</div>'}</div>`; },
};
const adjList = adj => adj.length ? adj.map(a => `<div class="li"><span>${['remove_item', 'edit_item'].includes(a.kind) ? `🧰 ${a.kind === 'remove_item' ? 'Removed' : 'Edited'}: ${esc(a.payload?.label || '')}` : a.kind === 'xp' ? `⭐ ${+a.payload?.amount > 0 ? '+' : ''}${esc(a.payload?.amount)} XP` : `👤 ${esc(Object.entries(a.payload || {}).map(([k, v]) => `${k === 'name' ? 'name' : k === 'sex' ? 'sex' : 'birth year'}: ${k === 'sex' ? (v === 'f' ? 'female' : 'male') : v}`).join(', '))}`}
  <small>${esc(a.reason || '')} · ${esc(a.actor_name || '')} · ${dt(a.created_at)}</small></span>${a.applied ? '<span class="chip c-good">applied</span>' : `<span class="chip c-blue">waiting</span><b class="x" data-act="deladj" data-id="${a.id}" title="Cancel">✕</b>`}</div>`).join('') : '<div class="empty sm">No changes</div>';
async function saveProfile(payload) {
  try {
    const r = await DB.rpc('console_update_profile', {target: CUSTID, patch: payload, reason: 'changed in console', actor_name: ME.name});
    const d = CUST[CUSTID].data = CUST[CUSTID].data || {}; d.profile = {...(d.profile || {}), ...(r || payload)};
    ADJ[CUSTID] = await DB.list('account_adjustments', `user_id=eq.${CUSTID}&order=created_at.desc`).catch(() => ADJ[CUSTID]);
    render(); toast('Saved');
  } catch (e) { addAdj('profile', payload, 'changed in console', 'changed customer profile'); }   // before SQL 16: applied when the app opens
}
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
  return `<div class="kbm"><div class="kbnav"><input id="kbq" placeholder="Search articles" value="${esc(KBQ)}">${IS_DEV() ? '<button class="btn primary" data-act="kbnew">＋ New article</button>' : ''}${kbCats()}</div>
    <div class="kblist">${kbItems(kbList())}</div>
    <div class="kbart">${a ? kbArticle(a, IS_DEV() ? `<button class="btn sm" data-act="kbedit">Edit</button><button class="btn sm" data-act="kbdel">Delete</button>` : '') : '<div class="empty" style="margin:auto">Select an article</div>'}</div></div>`;
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
  r.value = before + (before && !before.endsWith('\n') ? '\n' : '') + txt + after; DRAFT[r.dataset.tid] = r.value; autoGrow(r); r.focus();
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

// ===================== ADMIN PANEL (own page: ?view=admin) – tools on the left, tool search on top =====================
const ADM = {tab: 'consumers', tq: '', rows: null, busy: false, uid: null, dels: null, col: (() => { try { return localStorage.getItem('console_admcol') === '1'; } catch (e) { return false; } })()};
const ADMTABS = [['consumers', '👥', 'Consumers'], ['tools', '🧰', 'Account tools'], ['scores', '⭐', 'Scores'], ['deletions', '🗑️', 'Scheduled deletions'], ['suggestions', '💡', 'Suggestions', 'dev']];
const admTabsFiltered = () => ADMTABS.filter(([, , l, only]) => (!only || ROLE === 'developer') && (!ADM.tq || l.toLowerCase().includes(ADM.tq.toLowerCase())));
function adminView() {
  const main = ADM.uid && ADM.tab === 'tools' ? toolsView() : ADM.uid && ADM.tab === 'scores' ? admScores() : ADM.uid ? customerView() : ADM.tab === 'deletions' ? admDeletions() : ADM.tab === 'suggestions' ? admSuggestions() : admFind();
  return `<div class="admin ${ADM.col ? 'col' : ''}"><div class="anav"><div class="anavtop">${ADM.col ? '' : `<input id="atool" placeholder="🔍 Search tools" value="${esc(ADM.tq)}">`}<button class="ib sm" data-act="admcol" title="${ADM.col ? 'Show tools' : 'Hide tools'}">${ADM.col ? '»' : '«'}</button></div>
    ${admTabsFiltered().map(([k, e, l]) => `<button class="${ADM.tab === k ? 'on' : ''}" data-act="admtab" data-k="${k}" title="${l}">${e}${ADM.col ? '' : ' ' + l}</button>`).join('') || '<small class="muted">No tool found</small>'}</div>
    <div class="amain">${main}</div></div>`;
}
// Find a customer: by ID, email or phone (phone – later)
function admFind() {
  const title = ADM.tab === 'scores' ? 'Scores' : ADM.tab === 'tools' ? '🧰 Account tools' : 'Consumers', hint = ADM.tab === 'scores' ? 'Find the customer to check and add XP.' : ADM.tab === 'tools' ? 'Find the customer – see everything in their account and fix or remove items.' : 'Find a customer by any of the fields.';
  return `<div class="page"><div class="pwrap"><h1>${title}</h1><p class="muted">${hint}</p>
    <div class="card afind"><label>Customer ID<input id="aq_id" placeholder="12" value="${esc(ADM.qf === 'id' ? ADM.q : '')}"></label>
      <label>Email<input id="aq_email" placeholder="name@email.com" value="${esc(ADM.qf === 'email' ? ADM.q : '')}"></label>
      <label>Phone<input id="aq_phone" placeholder="Coming later" disabled></label>
      <button class="btn primary" data-act="admsearch">${ICON.search} Search</button></div>
    ${ADM.busy ? '<div class="empty">Searching…</div>' : ADM.rows == null ? '' : !ADM.rows.length ? '<div class="empty">No user found</div>'
      : `<div class="card flush"><table class="tbl"><tr><th>Customer</th><th>Email</th><th>Created</th><th>Last sign-in</th><th></th></tr>${ADM.rows.map(u => `<tr><td><b>${esc(u.name || '–')}</b> <small>ID ${esc(u.num ?? '–')}</small></td>
        <td>${esc(u.email || '')} ${verifiedChip(u)}</td><td>${dt(u.created_at)}</td><td>${dt(u.last_sign_in_at)}</td><td><button class="ib sm" data-act="admopen" data-u="${esc(u.id)}" title="${ADM.tab === 'scores' ? 'Open scores' : ADM.tab === 'tools' ? 'Open account tools' : 'View account'}">${ICON.edit}</button></td></tr>`).join('')}</table></div>`}</div></div>`;
}
function admScores() {
  const c = CUST[ADM.uid];
  if (!c) return '<div class="page"><div class="empty">Loading…</div></div>';
  const d = c.data || {}, p = d.profile || {}, g = xpOf(d);
  return `<div class="page"><div class="pwrap"><h1>⭐ ${esc(p.name || c.email || '')} ${idChip(c.num)}</h1>
    ${PVIEW.scores(ADM.uid, c, d, p, g)}</div></div>`;
}
function admDeletions() {
  const r = ADM.dels;
  return `<div class="page"><div class="pwrap"><h1>Scheduled deletions</h1>${r == null ? '<div class="empty">Loading…</div>' : !r.length ? '<div class="empty">No accounts are scheduled for deletion</div>'
    : `<div class="card flush"><table class="tbl"><tr><th>Email</th><th>Requested</th><th>By</th><th>Deleted on</th><th></th></tr>${r.map(x => `<tr><td>${esc(x.email || '–')}</td><td>${dt(x.created_at)}</td><td>${x.requested_by_name ? esc(x.requested_by_name) + ' (team)' : 'customer'}</td><td>${dt(x.delete_at)}</td>
      <td>${x.user_id ? `<button class="ib sm" data-act="admopen" data-u="${esc(x.user_id)}" title="View account">${ICON.edit}</button>` : ''}</td></tr>`).join('')}</table></div>`}</div></div>`;
}
async function admSearch(field) {
  if (!field) field = val('aq_id') ? 'id' : 'email';
  const q = val('aq_' + field); if (q.length < 1) return toast('Type an ID, # or email');
  ADM.q = q; ADM.qf = field; ADM.busy = true; render();
  try { ADM.rows = await DB.rpc('console_find_users', {q}) || []; } catch (e) { ADM.rows = []; toast('⚠️ Search is not available – run SQL 10 in Supabase'); }
  ADM.busy = false; render();
  if (['scores', 'tools'].includes(ADM.tab) && ADM.rows.length === 1) EXTRA_ACT.admopen({dataset: {u: ADM.rows[0].id}});
}
const SG_ST = [['new', '🆕 New'], ['reviewed', '✔️ Reviewed'], ['planned', '🗓️ Planned'], ['done', '✅ Built'], ['declined', '🚫 Declined']];
function admSuggestions() {
  const r = SUGG;
  return `<div class="page"><div class="pwrap"><h1>Suggestions</h1><p class="muted">Ideas from customers. They arrive when a case is escalated as a suggestion (or ☰ → Add to suggestions list). When the case is closed, a new idea becomes <b>Reviewed</b>; <b>Built</b> – when it's in the app.</p>
    ${r == null ? '<div class="empty">Loading…</div>' : !r.length ? '<div class="empty">No suggestions yet</div>' : `<div class="card flush"><table class="tbl"><tr><th>Idea</th><th>Asked</th><th>Status</th><th>Case</th></tr>
      ${r.map(x => `<tr><td><b>${esc(x.title)}</b><small>${esc((x.body || '').slice(0, 160))}</small></td><td><b>${x.votes}×</b></td>
        <td><select data-sgst="${x.id}">${SG_ST.map(([v, l]) => `<option value="${v}" ${x.status === v ? 'selected' : ''}>${l}</option>`).join('')}</select></td>
        <td>${x.case_no ? `<a class="idlink" href="./#case/${esc(x.case_no)}" target="_blank">Case #${esc(x.case_no)} ↗</a>` : '–'}<small>${dt(x.created_at)}</small></td></tr>`).join('')}</table></div>`}</div></div>`;
}
async function loadDeletions() { try { ADM.dels = await DB.list('dsar_requests', 'type=eq.delete&status=eq.pending&order=delete_at.asc'); } catch (e) { ADM.dels = []; } render(); }
const adminLink = uid => `./?view=admin&customer=${encodeURIComponent(uid)}`;

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
  profile: el => window.open(adminLink(el.dataset.u), '_blank'),
  copyprof: el => { navigator.clipboard?.writeText(profileLink(el.dataset.u)); toast('🔗 Profile link copied – paste it into an internal note'); },
  copyuid: el => { navigator.clipboard?.writeText(el.dataset.u); toast('ID copied'); },
  mclose: () => closeModal(true),
  ptab: el => { PTAB = el.dataset.k; render(); },
  admcol: () => { ADM.col = !ADM.col; try { localStorage.setItem('console_admcol', ADM.col ? '1' : '0'); } catch (e) {} render(); },
  admtab: async el => { ADM.tab = el.dataset.k; ADM.uid = null; CUSTID = null; ADM.rows = null; history.replaceState(null, '', './?view=admin'); render(); if (ADM.tab === 'deletions') loadDeletions(); if (ADM.tab === 'suggestions') { await loadSugg(); render(); } },
  sgsave: async () => {
    const t = T.find(x => x.id === SEL), ex = val('sg_existing'), title = val('sg_title'), body = $('#sg_body').value.trim();
    try {
      if (ex) { const s = SUGG.find(x => x.id === ex); await DB.update('suggestions', `id=eq.${ex}`, {votes: (s?.votes || 1) + 1, updated_at: nowIso()}); }
      else { if (!title) return toast('Write a short title'); await DB.insert('suggestions', {title, body, ticket_id: t?.id || null, user_id: t?.user_id || null, created_by_name: ME.name}); }
      if (t) await logEvent(t, ex ? 'Added +1 to an existing suggestion' : `Added to suggestions list: ${title}`);
      SUGG = null; closeModal(true); toast('💡 Saved to the suggestions list'); render(true);
    } catch (e) { toast('⚠️ Run SQL 14 in Supabase (' + esc(e.message) + ')'); }
  },
  admsearch: () => admSearch(),
  admopen: el => { ADM.uid = el.dataset.u; PTAB = 'profile'; history.replaceState(null, '', adminLink(el.dataset.u)); openCustomer(el.dataset.u, true); },
  admback: () => { ADM.uid = null; CUSTID = null; history.replaceState(null, '', './?view=admin'); render(); },
  copyval: el => { navigator.clipboard?.writeText(el.dataset.v); toast('Copied'); },
  savesex: () => {
    const p = effProfile(CUSTID, CUST[CUSTID]?.data?.profile || {}), sex = val('b_sex');
    if (sex === (p.sex || 'm')) return toast('Nothing changed');
    saveProfile({sex});
  },
  saveprof: () => {
    const p = effProfile(CUSTID, CUST[CUSTID]?.data?.profile || {}), name = val('p_name'), by = val('p_by'), sex = val('p_sex'), payload = {};
    if (name && name !== (p.name || '')) payload.name = name;
    if (sex && sex !== (p.sex || 'm')) payload.sex = sex;
    if (by && +by !== +(p.birthYear || 0)) { if (+by < 1920 || +by > new Date().getFullYear() - 5) return toast('Invalid birth year'); payload.birthYear = +by; }
    if (!Object.keys(payload).length) return toast('Nothing changed');
    saveProfile(payload);
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
  kbwin: () => window.open('./?view=kb', '_blank'),
  kbnew: () => IS_DEV() && kbEdit(),
  kbedit: () => IS_DEV() && kbEdit(KB.find(x => x.id === KBSEL)),
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

document.addEventListener('change', async e => {
  const id = e.target.dataset?.sgst; if (!id) return;
  try { await DB.update('suggestions', `id=eq.${id}`, {status: e.target.value, updated_at: nowIso()}); const x = (SUGG || []).find(y => y.id === id); if (x) x.status = e.target.value; toast('Status saved'); }
  catch (er) { toast('⚠️ ' + esc(er.message)); }
});

document.addEventListener('input', e => markDirty(e.target));
document.addEventListener('change', e => markDirty(e.target));
function markDirty(el) {
  const act = ['p_name', 'p_by', 'p_sex'].includes(el.id) ? 'saveprof' : el.id === 'b_sex' ? 'savesex' : null;
  if (act) document.querySelector(`[data-act="${act}"]`)?.classList.add('dirty');
}

// ===================== 🧰 ACCOUNT TOOLS – everything in the customer's account; fix or remove items =====================
// Changes are sent as "account adjustments" – the app applies them the next time the customer opens it.
const idChip = n => n == null ? '' : `<span class="idchip">ID ${esc(n)}<button class="cpy" data-act="copyval" data-v="${esc(n)}" title="Copy ID">${ICON.copy}</button></span>`;
const TOOLS = {open: 'recipes', q: ''};
const daysAgo = n => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
const itemKey = x => String(x?.id ?? JSON.stringify(x));
const byDateDesc = (a, b) => `${b.date || ''}${b.time || b.start || ''}`.localeCompare(`${a.date || ''}${a.time || a.start || ''}`);
const MOOD_E = ['', '😫', '😕', '😐', '🙂', '😁'];
// [collection, title, list(d), row(x, d) -> [main, details]]
const TOOL_SECS = [
  ['recipes', '📗 Recipes', d => d.recipes || [], x => [`${x.emoji || '🍲'} ${x.name || 'Recipe'}`, `${x.portions || '?'} portions · ${(x.ing || []).length} ingredients · ${(x.steps || []).length} steps${x.source ? ' · imported' : ''}`]],
  ['meals', '🍽️ Meals (30 days)', d => (d.meals || []).filter(m => (m.date || '') >= daysAgo(30)).sort(byDateDesc), m => [m.name || 'Meal', `${m.date} ${m.time || ''} · ${Math.round(+m.kcal || 0)} kcal · ${Math.round(+m.p || 0)} g protein${m.ai ? ' · written' : ''}${m.snack ? ' · snack' : ''}`]],
  ['freezer', '🧊 Fridge & freezer', d => d.freezer || [], (x, d) => [(d.recipes || []).find(r => r.id === x.recipeId)?.name || 'Deleted recipe', `${x.place === 'freezer' ? 'Freezer' : 'Fridge'} · ${x.portions} portions · made ${x.date || '?'}`]],
  ['foods', '🥕 Own products', d => d.foods || [], f => [f.name, `${f.kcal} kcal · ${f.p} g protein per 100 g${f.ai ? ' · added automatically' : ''}`]],
  ['spend', '🧾 Receipts', d => [...(d.spend || [])].sort(byDateDesc), x => [`${(+x.amount || 0).toFixed(2)} €`, `${x.date} · ${x.note || ''}`]],
  ['checkins', '🪞 Check-ins', d => [...(d.checkins || [])].sort(byDateDesc), c => [`${c.type === 'month' ? 'Monthly' : 'Weekly'} check-in`, `${c.date || ''}${c.weight ? ` · ${c.weight} kg` : ''}${c.mood ? ` · mood ${c.mood}` : ''}`]],
  ['weights', '⚖️ Weight', d => [...(d.weights || [])].sort(byDateDesc), w => [`${w.kg} kg`, w.date]],
  ['workouts', '💪 Workouts', d => [...(d.workouts || [])].sort(byDateDesc), w => [w.type || 'Workout', `${w.date} ${w.start || ''} · ${w.duration || '?'} min · ${(w.exercises || []).length} exercises`]],
  ['plans', '🏋️ Planned workouts', d => [...(d.plans || [])].sort(byDateDesc), x => [x.type || 'Planned workout', `${x.date} ${x.start || ''} · ${x.status || ''}`]],
  ['events', '📅 Activities', d => d.events || [], e => [e.title || 'Activity', `${e.type && e.type !== 'once' ? e.type : e.date || ''} · ${e.start || ''}${e.end ? '–' + e.end : ''}${e.cat ? ' · ' + e.cat : ''}`]],
  ['tasks', '✅ Tasks', d => d.tasks || [], t => [t.title || 'Task', `${t.done ? 'done' : 'open'}${t.due ? ' · due ' + t.due : ''}${+t.progress ? ` · ${t.progress}%` : ''}`]],
  ['wellbeing', '💚 Wellbeing', d => [...(d.wellbeing || [])].sort(byDateDesc), w => [`${MOOD_E[w.mood] || '•'} ${w.kind === 'day' ? 'Day' : 'Moment'}`, `${w.date} ${w.time || ''}${w.note ? ' · ' + String(w.note).slice(0, 60) : ''}`]],
  ['sleep', '😴 Sleep', d => [...(d.sleep || [])].sort(byDateDesc), x => [`${x.bed || '?'} – ${x.wake || '?'}`, x.date]],
  ['timelog', '⏱️ Time log (14 days)', d => (d.timelog || []).filter(x => (x.date || '') >= daysAgo(14)).sort(byDateDesc), x => [x.cat || 'Time', `${x.date} ${x.start || ''}–${x.end || ''}`]],
];
function toolsView() {
  const uid = ADM.uid, c = CUST[uid];
  if (!c) return '<div class="page"><div class="empty">Loading…</div></div>';
  if (c.error) return `<div class="page"><div class="empty">⚠️ ${esc(c.error)}</div></div>`;
  const d = c.data || {}, p = d.profile || {}, adj = ADJ[uid] || [];
  const pend = adj.filter(a => !a.applied && ['remove_item', 'edit_item'].includes(a.kind));
  const sec = TOOL_SECS.find(x => x[0] === TOOLS.open) || TOOL_SECS[0], [coll, title, list, row] = sec;
  const q = TOOLS.q.toLowerCase(), items = list(d).filter(x => !q || row(x, d).join(' ').toLowerCase().includes(q));
  const pendOf = x => pend.find(a => a.payload?.coll === coll && a.payload?.key === itemKey(x));
  return `<div class="page"><div class="pwrap"><h1>🧰 ${esc(p.name || c.email || '')} ${idChip(c.num)}</h1>
    <p class="muted">${esc(c.email || '')} · last sign-in ${dt(c.last_sign_in_at)}</p>
    <div class="infobox">Changes are applied the next time the customer opens the app. Always write why (it goes to the audit log) and tell the customer what you changed.${pend.length ? ` <b>${pend.length} change(s) waiting.</b>` : ''}</div>
    <div class="tsecs">${TOOL_SECS.map(([k, l, f]) => `<button class="${k === coll ? 'on' : ''}" data-act="toolsec" data-k="${k}">${l} <i>${f(d).length}</i></button>`).join('')}</div>
    <div class="card flush"><div class="trow head"><b>${title}</b><span class="sp"></span><input id="toolq" placeholder="Filter" value="${esc(TOOLS.q)}"></div>
      ${items.slice(0, 150).map(x => { const [m, det] = row(x, d), pa = pendOf(x), k = esc(itemKey(x));
        return `<div class="trow ${pa ? 'pend' : ''}"><div class="grow"><b>${esc(m)}</b><small>${esc(det)}</small>${pa ? `<small class="t-warn">⏳ ${pa.kind === 'remove_item' ? 'Removal' : 'Edit'} waiting – ${esc(pa.reason || '')}</small>` : ''}</div>
          <button class="ib sm" data-act="toolview" data-k="${k}" title="View all fields">${ICON.search}</button>${pa ? '' : `<button class="ib sm" data-act="tooledit" data-k="${k}" title="Fix">${ICON.edit}</button><button class="ib sm" data-act="toolrm" data-k="${k}" title="Remove">${ICON.trash}</button>`}</div>`; }).join('') || '<div class="empty sm">Nothing here</div>'}
      ${items.length > 150 ? `<div class="empty sm">Showing 150 of ${items.length} – use the filter</div>` : ''}</div></div></div>`;
}
const toolItem = k => { const sec = TOOL_SECS.find(x => x[0] === TOOLS.open), d = CUST[ADM.uid]?.data || {}; return (d[sec[0]] || []).find(x => itemKey(x) === k); };
const toolLabel = x => { const sec = TOOL_SECS.find(s => s[0] === TOOLS.open), [m, det] = sec[3](x, CUST[ADM.uid]?.data || {}); return `${sec[1].replace(/\s*\(.*\)$/, '')}: ${m} (${det})`.slice(0, 160); };
const fieldVal = v => typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v ?? '');
async function sendFix(kind, x, extra, reason) {
  const uid = ADM.uid, label = toolLabel(x), payload = {coll: TOOLS.open, key: itemKey(x), label, ...extra};
  try {
    await DB.insert('account_adjustments', {user_id: uid, kind, payload, reason, actor_id: ME.id, actor_name: ME.name});
    await audit(kind === 'remove_item' ? 'removed item from account' : 'edited item in account', {user_id: uid}, {item: label, reason, ...(extra.patch ? {patch: extra.patch} : {})});
    ADJ[uid] = await DB.list('account_adjustments', `user_id=eq.${uid}&order=created_at.desc`).catch(() => ADJ[uid]);
    closeModal(true); render(); toast(kind === 'remove_item' ? '🗑️ Removal sent – applied when the customer opens the app' : '✏️ Fix sent – applied when the customer opens the app');
  } catch (e) { toast('⚠️ ' + esc(e.message)); }
}
Object.assign(EXTRA_ACT, {
  toolsec: el => { TOOLS.open = el.dataset.k; TOOLS.q = ''; render(); },
  toolview: el => { const x = toolItem(el.dataset.k); if (!x) return;
    modal(`<h3>${esc(toolLabel(x))}</h3><table class="tbl kvt">${Object.entries(x).map(([k, v]) => `<tr><td><code>${esc(k)}</code></td><td>${esc(fieldVal(v)).slice(0, 2000)}</td></tr>`).join('')}</table>
      <div class="row"><span class="sp"></span><button class="btn" data-act="mclose">Close</button></div>`); },
  tooledit: el => { const x = toolItem(el.dataset.k); if (!x) return;
    const f = Object.entries(x).filter(([k, v]) => k !== 'id' && ['string', 'number', 'boolean'].includes(typeof v));
    modal(`<h3>Fix: ${esc(toolLabel(x))}</h3><div class="frm">${f.map(([k, v]) => typeof v === 'boolean'
        ? `<label class="cbx"><input type="checkbox" data-tf="${esc(k)}" data-ty="boolean" ${v ? 'checked' : ''}> ${esc(k)}</label>`
        : `<label>${esc(k)}<input data-tf="${esc(k)}" data-ty="${typeof v}" value="${esc(v)}"></label>`).join('') || '<p class="muted">This item has no simple fields to fix – remove it instead.</p>'}
      <label class="wide">Why? (required, internal)<input id="tf_reason" placeholder="e.g. Customer asked in case 123 – wrong kcal"></label></div>
      <div class="row"><span class="sp"></span><button class="btn" data-act="mclose">Cancel</button><button class="btn primary" data-act="toolsave" data-k="${esc(el.dataset.k)}">Send fix</button></div>`); },
  toolsave: el => { const x = toolItem(el.dataset.k); if (!x) return; const reason = val('tf_reason'); if (!reason) return toast('Write why');
    const patch = {}; document.querySelectorAll('[data-tf]').forEach(i => { const k = i.dataset.tf, ty = i.dataset.ty, v = ty === 'boolean' ? i.checked : ty === 'number' ? +String(i.value).replace(',', '.') : i.value;
      if (ty === 'number' && !Number.isFinite(v)) return; if (v !== x[k]) patch[k] = v; });
    if (!Object.keys(patch).length) return toast('Nothing changed');
    sendFix('edit_item', x, {patch}, reason); },
  toolrm: el => { const x = toolItem(el.dataset.k); if (!x) return;
    modal(`<h3>Remove from the account?</h3><p><b>${esc(toolLabel(x))}</b></p><p class="muted">It disappears from the customer's app the next time they open it. This can't be undone from here.</p>
      <div class="frm"><label class="wide">Why? (required, internal)<input id="tf_reason" placeholder="e.g. Duplicate recipe – customer asked in case 123"></label></div>
      <div class="row"><span class="sp"></span><button class="btn" data-act="mclose">Cancel</button><button class="btn danger" data-act="toolrmgo" data-k="${esc(el.dataset.k)}">Remove</button></div>`); },
  toolrmgo: el => { const x = toolItem(el.dataset.k); if (!x) return; const reason = val('tf_reason'); if (!reason) return toast('Write why'); sendFix('remove_item', x, {}, reason); },
});
document.addEventListener('input', e => { if (e.target.id === 'toolq') { TOOLS.q = e.target.value; render(); } });
