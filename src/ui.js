// ===== Sąsaja =====
const UI = { view: 'today', cal: {mode: 'week', date: today()}, food: 'log', foodDate: today(), time: {mode: 'week', date: today()},
  sport: 'overview', taskFilter: 'open', noteId: null, recipeQ: '', foodQ: '', mealTab: 'freezer' };
const VIEWS = [
  ['today','🏠','Šiandien'], ['calendar','📅','Kalendorius'], ['tasks','✅','Užduotys'], ['food','🍽️','Mityba'],
  ['sport','💪','Sportas'], ['time','⏱️','Laikas'], ['progress','📈','Progresas'], ['wellbeing','💚','Savijauta'], ['notes','📝','Užrašai'], ['settings','⚙️','Profilis'],
];
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
const catOpts = () => S.categories.map(c => [c.id, `${c.emoji} ${c.name}`]);
const chip = (txt, color) => `<span class="chip" style="--c:${color}">${txt}</span>`;
const card = (title, body, extra = '', cls = '') => `<section class="card ${cls}">${title ? `<div class="ch"><h3>${title}</h3><div>${extra}</div></div>` : ''}${body}</section>`;
const btn = (label, a, data = {}, cls = '') => `<button class="btn ${cls}" data-a="${a}" ${Object.entries(data).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ')}>${label}</button>`;
const empty = t => `<div class="empty">${t}</div>`;

// ---------- Modalas ----------
let MODAL_SUBMIT = null;
function modal(title, body, onSubmit, o = {}) {
  const m = $('#modal');
  m.innerHTML = `<div class="mbox ${o.wide ? 'wide' : ''}"><div class="mhead"><h3>${title}</h3><button type="button" class="x" data-a="closeModal">✕</button></div>
    <form id="mform" autocomplete="off">${body}${onSubmit ? `<div class="mfoot">${o.extra || ''}<span class="sp"></span><button type="button" class="btn ghost" data-a="closeModal">Atšaukti</button><button class="btn primary" type="submit">${o.submit || 'Išsaugoti'}</button></div>` : ''}</form></div>`;
  m.classList.add('open'); MODAL_SUBMIT = onSubmit;
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
    el.innerHTML = `<div class="askbox ${o.danger ? 'danger' : ''}" role="dialog" aria-modal="true"><div class="askic">${o.icon || (o.danger ? '⚠️' : '❓')}</div><h3>${title}</h3>${text ? `<div class="asktxt">${text}</div>` : ''}${o.input != null ? `<${o.multi ? 'textarea rows="5"' : 'input'} class="askin" placeholder="${esc(o.placeholder || '')}" ${o.multi ? `>${esc(o.input)}</textarea>` : `value="${esc(o.input)}">`}` : ''}
      <div class="askbtns">${o.no === false ? '' : `<button type="button" class="btn ghost" data-r="0">${o.no || 'Atšaukti'}</button>`}<button type="button" class="btn ${o.danger ? 'danger' : 'primary'}" data-r="1">${o.yes || 'Taip'}</button></div></div>`;
    document.body.appendChild(el);
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
function toast(msg, type = '') {
  const t = document.createElement('div'); t.className = 'toast ' + type; t.innerHTML = msg;
  $('#toasts').appendChild(t); setTimeout(() => t.classList.add('out'), 4200); setTimeout(() => t.remove(), 4800);
}
function confetti() {
  const c = $('#confetti'); const cols = ['#22c55e','#4f8cff','#facc15','#ec4899','#a78bfa','#f97316'];
  for (let i = 0; i < 40; i++) { const p = document.createElement('i'); p.style.left = Math.random() * 100 + 'vw'; p.style.background = cols[i % cols.length]; p.style.animationDelay = Math.random() * 0.3 + 's'; p.style.transform = `rotate(${Math.random() * 360}deg)`; c.appendChild(p); setTimeout(() => p.remove(), 1800); }
}
function notify(title, body) {
  toast(`<b>${esc(title)}</b><br>${esc(body)}`, 'info');
  try { if ('Notification' in window && Notification.permission === 'granted') new Notification(title, {body, icon: 'icon.svg'}); } catch (e) {}
}

// ---------- Pagrindinis renderis ----------
function render() {
  if (!S) return;
  $('#nav').innerHTML = VIEWS.map(([id, ic, l]) => `<button class="nav ${UI.view === id ? 'on' : ''}" data-a="go" data-v="${id}"><span>${ic}</span><em>${l}</em></button>`).join('');
  const g = gamification();
  $('#top').innerHTML = `<div class="tl"><h1>${window.CLOUD?.test ? '<span class="testbadge" title="Bandomoji versija – tikri duomenys neliečiami">🧪 TESTAS</span> ' : ''}${VIEWS.find(v => v[0] === UI.view)[2]}</h1><small>${fmtDateDow(today())}</small></div>
    <div class="tr">${S.active ? `<button class="timer" data-a="workoutMode" style="--c:#22c55e">🏋️ <span class="wClock">${clock(S.active.ts)}</span></button>` : ''}${timerWidget()}<button class="lvl" data-a="levelInfo" title="${g.xp} XP">⭐ ${g.level}${g.streak > 1 ? ` · 🔥${g.streak}` : ''}</button><span id="sync" class="sync"></span><button class="fbbtn" data-a="feedback" title="Atsiliepimas">💬</button>${isDeveloper() ? `<button class="bug ${DEV ? 'on' : ''}" data-a="toggleDev" title="${DEV ? 'Išjungti kūrėjo režimą' : 'Kūrėjo režimas'}">🐞${inboxCount() ? `<i class="bugn">${inboxCount()}</i>` : ''}</button>` : ''}${isDeveloper() && window.APP_VERSION && window.APP_VERSION !== window.PUBLIC_VERSION ? `<span class="verbadge" title="Bandoma versija">v${esc(window.APP_VERSION)}</span>` : ''}</div>`;
  document.body.classList.toggle('devmode', DEV);
  const fn = {today: vToday, calendar: vCalendar, tasks: vTasks, food: vFood, sport: vSport, time: vTime, progress: vProgress, wellbeing: vWellbeing, notes: vNotes, settings: vSettings}[UI.view];
  $('#main').innerHTML = updateBanner() + deletionBanner() + fn();
  scrollTimelines();
  updateSyncBadge();
}
A.go = d => { A.closeModal(); UI.view = d.v; render(); window.scrollTo(0, 0); };
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
  if (!S.timer) return `<button class="btn sm" data-a="timerStart">▶ Laikmatis</button>`;
  const c = cat(S.timer.cat);
  return `<button class="timer" data-a="timerStop" style="--c:${c.color}">${c.emoji} <span id="tElapsed">${timerElapsed()}</span> ■</button>`;
}
const clock = ts => { const s = Math.max(0, Math.floor((Date.now() - ts) / 1000)), h = Math.floor(s / 3600); return `${h ? h + ':' : ''}${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`; };
function timerElapsed() { return S.timer ? clock(S.timer.ts) : ''; }
A.timerStart = d => {
  if (d.cat) { S.timer = {cat: d.cat, start: nowHM(), date: today(), ts: Date.now()}; commit(); toast(`${cat(d.cat).emoji} Laikmatis paleistas`); return; }
  modal('Ką dabar veiki?', `<div class="catgrid">${S.categories.map(c => `<button type="button" class="catbtn" style="--c:${c.color}" data-a="timerStart" data-cat="${c.id}">${c.emoji}<span>${esc(c.name)}</span></button>`).join('')}</div>
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
  toast(`${cat(t.cat).emoji} Įrašyta: ${fmtDur(mins)} – ${esc(cat(t.cat).name)}`, cat(t.cat).type === 1 ? 'good' : '');
};

// ================= REKOMENDACIJOS =================
// Baziniai valgymo laikai: tolygiai per dieną, pamažu pritaikomi prie tavo įpročių
function mealPlanTimes(d) {
  const p = S.profile, w = toMin(p.wake); let b = toMin(p.bed); if (b <= w) b += 1440;
  const first = w + 45, last = Math.min(b - 150, 1380), n = clamp(+S.foodPrefs.mealsPerDay || 3, 2, 6);
  const def = Array.from({length: n}, (_, i) => first + (last - first) * i / Math.max(1, n - 1));
  const h = mealHabits(def), r15 = x => Math.round(x / 15) * 15;
  return {times: def.map((x, i) => r15(h ? x * 0.3 + h[i] * 0.7 : x)), learned: !!h};
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
  return {list: out.filter(x => !isToday || x.t > now - 30), learned};
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
  if (todaysPlan) recs.push({icon:'🏋️', kind:'sport', title:`Suplanuota ${todaysPlan.start}: ${esc(wtypeName(todaysPlan.type))}`, text:`${todaysPlan.exercises.length} pratimai · ~${todaysPlan.duration} min. Priminsiu 30 min prieš.`,
    act: btn('▶ Pradėti', 'startPlan', {id: todaysPlan.id}, 'sm primary') + ' ' + btn('✓ Padariau', 'planDone', {id: todaysPlan.id}, 'sm') + ' ' + btn('✏️', 'openPlan', {id: todaysPlan.id}, 'sm')});
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
        act: btn('📅 Suplanuoti šiam laikui', 'planWorkout', {start: fromMin(st), date: d}, 'sm primary'), slot: sportSlot});
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
    text:`${times.filter(x => x.note).map(x => `<b>${x.txt}</b> – ${esc(x.note)}`).join('; ')}${times.some(x => x.note) ? '. ' : ''}Liko <b>${Math.max(0, tg.kcal - nu.kcal)} kcal</b> ir <b>${Math.max(0, Math.round(tg.protein - nu.p))} g baltymų</b>.${mt.learned ? ' <small>Laikai pritaikyti prie tavo įpročių.</small>' : ''}`,
    act: btn('+ Maistas', 'addMeal', {}, 'sm')});
  // --- Pasiūlymas įjungti režimą, jei kažką naudoji daug
  const m14 = addDays(today(), -14);
  if (isToday && !foodOn() && !S.settings.dismissed.foodSuggest && S.meals.filter(m => m.date >= m14).length >= 10)
    recs.push({icon:'🍽️', title:'Daug įrašinėji maistą', text:'Nori, kad programėlė siūlytų, kada ir ką valgyti, ir skaičiuotų kalorijas pagal tikslą?', act: btn('Įjungti', 'enableMode', {k: 'food'}, 'sm primary') + ' ' + btn('Ne, ačiū', 'dismiss', {key: 'foodSuggest'}, 'sm ghost')});
  if (isToday && !sportOn() && !S.settings.dismissed.sportSuggest && S.workouts.filter(w => w.date >= m14).length >= 4)
    recs.push({icon:'💪', title:'Dažnai sportuoji', text:'Nori, kad programėlė siūlytų laiką sportui ir sudarytų treniruotes?', act: btn('Įjungti', 'enableMode', {k: 'sport'}, 'sm primary') + ' ' + btn('Ne, ačiū', 'dismiss', {key: 'sportSuggest'}, 'sm ghost')});
  // --- Kas greitai genda šaldytuve
  const soon = storageItems().filter(x => x.place === 'fridge' && x.left <= 1);
  if (isToday && soon.length) recs.push({icon:'⏰', kind:'warn', title: soon.length === 1 ? `Šaldytuve: ${esc(soon[0].r?.name || '')} – ${soon[0].left < 0 ? 'jau pasibaigė' : soon[0].left === 0 ? 'suvalgyk šiandien' : 'suvalgyk iki rytojaus'}` : `${soon.length} patiekalai šaldytuve greitai baigs galioti`,
    text: soon.map(x => `${x.r?.emoji || ''} ${esc(x.r?.name || '')} (${x.portions} porc., pagaminta ${relDay(x.date)})`).join(', ') + '. Jei nespėsi – užšaldyk, jei tinka.', act: btn('Atsargos', 'foodGo', {v: 'freezer'}, 'sm')});
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
        text:`Siūlau: <b>${top.r.emoji} ${esc(top.r.name)}</b> – ${top.r.portions} porc., ${top.st.kcal} kcal ir ${top.st.p} g baltymų porcijai, ~${top.st.cost.toFixed(2)} €/porc. ${cookSlot ? `Laiko yra ${fromMin(cookSlot[0])}–${fromMin(cookSlot[1])}.` : `Šiandien ${top.r.time} min lango nėra – planuok ${(() => { const cd = S.foodPrefs.cookDays?.length ? S.foodPrefs.cookDays : [7]; for (let i = 1; i <= 7; i++) { const x = addDays(d, i); if (cd.includes(dow(x))) return i === 1 ? 'rytoj' : DOW_LONG[dow(x) - 1].toLowerCase(); } return 'savaitgalį'; })()}.`}`,
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
      act: btn('✓ Padaryta', 'toggleTask', {id: t.id}, 'sm') + ' ' + btn('Užduotys', 'go', {v: 'tasks'}, 'sm')});
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
      let s = -x.left * 3, w = x.left <= 1 ? 'greitai genda' : '';
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
    ${x.r ? `<span class="grow">${x.r.emoji} ${esc(x.r.name)} <small>${x.planned ? '📅 suplanuota' : `${x.item.place === 'fridge' ? '🧊' : '❄️'} ${x.why ? '· ' + x.why : ''}`}</small></span>${btn('Valgau', 'eatSuggested', {i, d}, 'sm primary')}`
      : `<span class="grow muted">${storageItems().length ? 'atsargų nebeliko' : 'atsargų nėra – greitas valgis'}</span>${btn('+', 'addMeal', {}, 'sm')}`}</div>`).join('');
  return card('🍽️ Ką valgyti šiandien', body + `<div class="choice row">${btn('📅 Įdėti į dienos planą', 'planMeals', {d}, 'sm')}${btn('Išjungti pasiūlymus', 'mealSuggestOff', {}, 'sm ghost')}</div>`);
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
  modal(`🍽️ ${esc(r.name)}`, `<p>Suplanuota ${p.time}.</p><div class="choice">${btn('✓ Suvalgiau', 'eatPlannedGo', {id: p.id}, 'primary big')}${btn('🗑 Pašalinti iš plano', 'unplanMeal', {id: p.id}, 'big')}</div>`); };
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
  for (const g of eventSegs(d)) { const e = g.e, c = cat(e.cat); items.push({s: g.s, e: g.en, title: e.title + (g.tail ? ' (tęsinys)' : g.head ? ' 🌙' : ''), sub: timeText(e), color: c.color, emoji: c.emoji, a: 'eventInfo', id: e.id, cls: 'ev' + (g.head ? ' head' : '') + (g.tail ? ' tail' : '')}); }
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
    html += `<div class="blk ${it.cls}" data-a="${it.a}" data-id="${it.id || ''}" data-d="${d}" style="top:${top(it.s)}px;height:${hgt}px;left:calc(${it.lane / L * 100}% + 2px);width:calc(${100 / L}% - 4px);--c:${it.color}" title="${esc(it.title)} ${esc(it.sub)}"><b>${it.emoji} ${esc(it.title)}</b>${hgt > 30 ? `<small>${esc(it.sub)}</small>` : ''}</div>`;
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
    ${btn('📅 Nauja veikla (paskaita, darbas…)', 'addEvent', {date: d.d, start: fromMin(m)}, 'big')}
    ${btn('⏱️ Įrašyti, ką veikiau', 'addLog', {date: d.d, start: fromMin(m)}, 'big')}
    ${btn('💪 Įrašyti treniruotę', 'addWorkout', {date: d.d, start: fromMin(m)}, 'big')}</div>`);
};

// ================= ŠIANDIEN =================
function vToday() {
  const d = today(), p = S.profile, tg = targets(), nu = dayNutrition(d), t = dayTime(d), sc = dayScore(d), g = gamification();
  const sl = sleepOn(d), mot = motivation(), {recs, sportSlot, mealTimes} = recommendations(d);
  const hour = Math.floor(nowMin() / 60), hi = hour < 11 ? 'Labas rytas' : hour < 17 ? 'Laba diena' : 'Labas vakaras';
  const ci = checkinDue();
  const dueTasks = S.tasks.filter(x => !x.done && x.due && x.due <= addDays(d, 7)).sort((a, b) => a.due < b.due ? -1 : 1).slice(0, 6);
  return `
  <div class="hero">
    <div><h2>${hi}${p.name ? ', ' + esc(p.name) : ''}! 👋</h2>
    <div class="mot">${mot.slice(0, 2).map(m => `<p class="${m.good ? 'good' : ''}">${m.t}</p>`).join('')}</div></div>
    <div class="xp"><div class="xpb"><i style="width:${(g.xp - g.cur) / (g.next - g.cur) * 100}%"></i></div><small>⭐ ${g.level} lygis · ${g.xp} XP · iki kito ${g.next - g.xp} XP${g.streak > 1 ? ` · 🔥 ${g.streak} d. serija` : ''}</small></div>
  </div>
  ${ci ? `<div class="banner" data-a="checkin" data-t="${ci}">🪞 <b>${ci === 'week' ? 'Kaip praėjo savaitė?' : 'Kaip praėjo mėnuo?'}</b> Trumpa apžvalga su tavo statistika. <span class="sp"></span><button class="btn sm primary">Pradėti</button></div>` : ''}
  <div class="rings">
    ${!(foodOn() || sportOn()) ? '' : tg.missing.length ? `<div class="rc missing" data-a="go" data-v="settings" title="Kalorijos apskaičiuojamos automatiškai pagal tavo duomenis">${ring(0, 1, '#4f8cff', '?', 'kcal')}<span>Įrašyk: ${esc(tg.missing.join(', '))}</span></div>`
      : `<div class="rc" data-a="go" data-v="food">${ring(nu.kcal, tg.kcal, '#4f8cff', nu.kcal, `/ ${tg.kcal} kcal`)}<span>Kalorijos</span></div>
    <div class="rc" data-a="go" data-v="food">${ring(nu.p, tg.protein, '#a78bfa', Math.round(nu.p) + ' g', `/ ${tg.protein} g`)}<span>Baltymai</span></div>`}
    <div class="rc" data-a="go" data-v="time">${ring(t.prod, (+p.prodGoalH || 6) * 60, '#22c55e', fmtH(t.prod).replace(' val', 'h'), `/ ${p.prodGoalH} h`)}<span>Produktyvu</span></div>
    <div class="rc" data-a="go" data-v="time">${ring(t.screen, +p.screenLimitMin || 90, '#ef4444', fmtDur(t.screen).replace(' min', 'm'), `/ ${p.screenLimitMin} min`)}<span>Ekranas</span></div>
    <div class="rc" data-a="addSleep">${ring(sl ? sleepMinutes(sl) : 0, (+p.sleepGoal || 8) * 60, '#06b6d4', sl ? round(sleepMinutes(sl) / 60, 1) + 'h' : '–', `/ ${p.sleepGoal} h`)}<span>Miegas</span></div>
    <div class="rc" data-a="scoreInfo" data-d="${d}">${ring(sc ? sc.score : 0, 100, scoreColor(sc?.score), sc ? sc.score : '–', 'balų')}<span>${sc?.live ? 'Balas kol kas' : 'Dienos balas'}</span></div>
  </div>
  <div class="quick">
    ${btn('⏱️ Ką veikiau', 'addLog')}${btn('💚 Savijauta', 'addWell')}${btn('✅ Užduotis', 'addTask')}${btn('📅 Veikla', 'addEvent')}${btn('😴 Miegas', 'addSleep')}${foodOn() || S.meals.length ? btn('🍽️ Maistas', 'addMeal') : ''}${sportOn() || S.workouts.length ? btn('💪 Treniruotė', 'addWorkout') : ''}${sportOn() || foodOn() ? btn('⚖️ Svoris', 'addWeight') : ''}
  </div>
  <div class="grid2">
    <div>${card('💡 Rekomendacijos šiandienai', recs.length ? recs.map(r => `<div class="rec ${r.kind || ''}"><div class="ri">${r.icon}</div><div class="rb"><b>${r.title}</b><p>${r.text}</p>${r.act ? `<div class="ra">${r.act}</div>` : ''}</div></div>`).join('') : empty('Viskas tvarkoj!'))}
    ${S.foodPrefs.mealSuggest ? mealSuggestCard(d, mealTimes, sportSlot) : ''}
    ${card('📌 Artimiausi terminai', dueTasks.length ? dueTasks.map(taskRow).join('') : empty('Terminų nėra 🎉'), btn('+', 'addTask', {}, 'sm'))}
    ${card('🍽️ Šiandien valgyta', mealsList(d), btn('+', 'addMeal', {}, 'sm'))}</div>
    <div>${card('🕒 Dienos planas', `${timeline(d, {sportSlot, free: true, scale: 0.75})}`, btn('Savaitė', 'calMode', {m: 'week'}, 'sm'))}</div>
  </div>`;
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
      <div>${card('💡 Rekomendacijos', recs.map(r => `<div class="rec ${r.kind || ''}"><div class="ri">${r.icon}</div><div class="rb"><b>${r.title}</b><p>${r.text}</p></div></div>`).join(''))}
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
    const ms = monthStart(d), n = daysInMonth(d), pre = dow(ms) - 1;
    let cells = '';
    for (let i = 0; i < pre; i++) cells += '<div class="mc out"></div>';
    for (const x of range(ms, n)) {
      const sc = dayScore(x), evs = eventsOn(x), tasks = S.tasks.filter(t => t.due === x && !t.done), w = workoutsOn(x).length;
      cells += `<div class="mc ${x === today() ? 'today' : ''}" data-a="calDay" data-d="${x}" style="${sc ? `--sc:${scoreColor(sc.score)}` : ''}"><div class="mn">${parseD(x).getDate()}${sc ? `<i>${sc.score}</i>` : ''}</div>
        <div class="md">${evs.slice(0, 3).map(e => `<span style="background:${cat(e.cat).color}" title="${esc(e.title)}"></span>`).join('')}</div>
        ${tasks.length ? `<div class="mt">📌 ${tasks.length}</div>` : ''}${w ? '<div class="mt">💪</div>' : ''}</div>`;
    }
    body = `<h2 class="dh">${MONTHS[parseD(d).getMonth()]} ${parseD(d).getFullYear()}</h2><div class="month">${DOW.map(x => `<div class="mhd">${x}</div>`).join('')}${cells}</div>
      `;
  }
  return `<div class="toolbar">${nav}${btn('🔁 Pasikartojantys', 'manageEvents', {}, 'sm')}</div>${body}`;
}
function daySummaryCard(d) {
  const t = dayTime(d), nu = dayNutrition(d), sl = sleepOn(d), w = workoutsOn(d);
  return card('Dienos suvestinė', `<div class="kv"><span>Produktyvu</span><b>${fmtH(t.prod)}</b><span>Ekranas</span><b>${fmtDur(t.screen)}</b><span>Suvalgyta</span><b>${nu.kcal} kcal · ${Math.round(nu.p)} g B</b><span>Miegas</span><b>${sl ? round(sleepMinutes(sl) / 60, 1) + ' val' : '–'}</b><span>Treniruotės</span><b>${w.length ? w.map(x => x.duration + ' min').join(', ') : '–'}</b></div>`);
}
A.calMode = d => { UI.view = 'calendar'; UI.cal.mode = d.m; render(); };
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
    () => { evSync(); return saveEvent(); }, {noFocus: true, extra: E.id ? btn('🗑 Ištrinti', 'delEvent', {id: E.id}, 'danger sm') : ''});
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
  modal('🔁 Pasikartojančios veiklos', rec.length ? rec.map(e => `<div class="li click" data-a="editEvent" data-id="${e.id}">${chip(cat(e.cat).emoji + ' ' + esc(cat(e.cat).name), cat(e.cat).color)} <b>${esc(e.title)}</b> <small>${repText(e)} · ${timeText(e)}${e.until ? ` · iki ${fmtDate(e.until)}` : ''}</small></div>`).join('') + `<div class="choice row">${btn('+ Naujas', 'addEvent', {weekly: 1}, 'primary sm')}</div>` : empty('Dar nėra. Įrašyk paskaitas, darbą, švedų pamokas.') + btn('+ Naujas', 'addEvent', {weekly: 1}, 'primary'));
};
A.delEvent = async d => { if (!await ask('Ištrinti veiklą?', '', {danger: true, icon: '🗑️', yes: 'Ištrinti'})) return; S.events = S.events.filter(e => e.id !== d.id); A.closeModal(); commit(); };
A.eventInfo = d => {
  const e = S.events.find(x => x.id === d.id); if (!e) return; const c = cat(e.cat);
  const occ = eventOccurs(e, d.d) ? d.d : addDays(d.d, -1);
  modal(`${c.emoji} ${esc(e.title)}`, `<p>${fmtDateDow(occ)} · ${timeText(e)}${+e.travel ? ` · kelionė ${e.travel} min` : ''}</p><p>${chip(esc(c.name), c.color)} ${e.type === 'once' ? 'vienkartinis' : '🔁 ' + repText(e)}${e.until ? ` · iki ${fmtDate(e.until)}` : ''}</p>
    <div class="choice">${btn('✏️ Redaguoti', 'editEvent', {id: e.id})}${e.type !== 'once' ? btn('🚫 Šį kartą neįvyko / praleidau', 'skipEvent', {id: e.id, d: occ}) : ''}${btn('🗑 Ištrinti', 'delEvent', {id: e.id}, 'danger')}</div>`);
};
A.skipEvent = d => { S.skips[d.id + '|' + d.d] = 1; A.closeModal(); commit(); toast('Pažymėta kaip praleista'); };

// ================= UŽDUOTYS =================
function taskRow(t) {
  const late = t.due && !t.done && t.due < today(), soon = t.due && !t.done && diffDays(today(), t.due) <= 2;
  const pr = ['', '🔴', '🟡', '🟢'][+t.priority || 2];
  return `<div class="task ${t.done ? 'done' : ''} ${late ? 'late' : soon ? 'soon' : ''}">
    <button class="chk" data-a="toggleTask" data-id="${t.id}">${t.done ? '✓' : ''}</button>
    <div class="tb" data-a="editTask" data-id="${t.id}"><b>${pr} ${esc(t.title)}</b>
      <small>${t.due ? `📅 ${relDay(t.due)}${t.dueTime ? ' ' + t.dueTime : ''}` : 'be termino'}${t.cat ? ' · ' + cat(t.cat).emoji + ' ' + esc(cat(t.cat).name) : ''}${+t.est ? ' · ~' + fmtDur(+t.est) : ''}${late ? ' · <b class="red">PAVĖLUOTA</b>' : ''}</small>
      ${!t.done && +t.progress ? `<div class="pbar sm"><i style="width:${t.progress}%"></i></div>` : ''}</div></div>`;
}
function vTasks() {
  const f = UI.taskFilter;
  let list = S.tasks.filter(t => f === 'open' ? !t.done : f === 'done' ? t.done : true);
  list.sort((a, b) => (a.done - b.done) || ((a.due || '9999') < (b.due || '9999') ? -1 : (a.due || '9999') > (b.due || '9999') ? 1 : (+a.priority || 2) - (+b.priority || 2)));
  const groups = {};
  for (const t of list) { const k = t.done ? 'Atlikta' : !t.due ? 'Be termino' : t.due < today() ? '🚨 Pavėluota' : t.due === today() ? 'Šiandien' : diffDays(today(), t.due) <= 7 ? 'Šią savaitę' : 'Vėliau'; (groups[k] = groups[k] || []).push(t); }
  const open = S.tasks.filter(t => !t.done), doneW = S.tasks.filter(t => t.done && t.doneAt >= weekStart(today())).length;
  return `<form id="qtask" class="qadd card"><input name="title" placeholder="Ką reikia nepamiršti? pvz. Pasiimti siuntą" required><input type="date" name="due" value="${addDays(today(), 1)}" min="2000-01-01" max="2099-12-31"><button class="btn primary" type="submit">Pridėti</button></form>
  <div class="toolbar"><div class="seg">${[['open', 'Neatlikti'], ['done', 'Atlikti'], ['all', 'Visi']].map(([v, l]) => `<button class="${f === v ? 'on' : ''}" data-a="taskFilter" data-f="${v}">${l}</button>`).join('')}</div>
    <span class="sp"></span>${btn('📲 Į telefono kalendorių', 'exportIcs', {}, 'sm ghost')}${btn('+ Su detalėmis', 'addTask', {}, 'sm')}</div>
    <div class="stats3"><div><b>${open.length}</b><small>neatlikta</small></div><div><b class="${open.filter(t => t.due && t.due < today()).length ? 'red' : ''}">${open.filter(t => t.due && t.due < today()).length}</b><small>pavėluota</small></div><div><b class="green">${doneW}</b><small>atlikta šią savaitę</small></div></div>
    ${Object.keys(groups).length ? ['🚨 Pavėluota', 'Šiandien', 'Šią savaitę', 'Vėliau', 'Be termino', 'Atlikta'].filter(k => groups[k]).map(k => card(k, groups[k].map(taskRow).join(''))).join('') : empty('Nieko nėra – viskas padaryta 🎉')}`;
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
  return ms.map(m => `<div class="li"><span class="mt2">${m.time || ''}</span> <b>${esc(m.name)}</b> <small>${m.portions ? m.portions + ' porc.' : m.g ? m.g + ' g' : ''}</small><span class="sp"></span><small>${Math.round(m.kcal)} kcal · ${Math.round(m.p)} g B</small><button class="x" data-a="delMeal" data-id="${m.id}">✕</button></div>`).join('');
}
function vFood() {
  const tabs = [['log', '📖 Dienynas'], ['recipes', '📗 Receptai'], ['freezer', '🧊 Atsargos'], ['shop', '🛒 Pirkiniai'], ['foods', '🥕 Produktai']];
  const head = `<div class="toolbar"><div class="tabs" style="margin:0">${tabs.map(([v, l]) => `<button class="${UI.food === v ? 'on' : ''}" data-a="foodTab" data-v="${v}">${l}</button>`).join('')}</div><span class="sp"></span>${foodOn() ? btn('⚙️ Mano mityba', 'foodSetup', {}, 'sm') : btn('💡 Įjungti rekomendacijas', 'enableMode', {k: 'food'}, 'sm ghost')}</div>`;
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
    modal('✅ Paruošta!', `<p class="center">Iš ${S.recipes.length} receptų tau tinka <b>${ok}</b>. Štai nuo ko siūlau pradėti:</p>
      <div class="sugs">${sug.map(x => `<div class="sug"><div class="em">${x.r.emoji}</div><b>${esc(x.r.name)}</b><small>⏱ ${x.r.time} min · ${x.st.cost.toFixed(2)} €/porc.</small></div>`).join('')}</div>
      `,
      () => { S.foodPrefs = {...F, done: true}; S.profile.budgetWeek = F.budget; commit(); UI.food = 'recipes'; render(); }, {submit: 'Rodyti receptus →', wide: true});
    return;
  }
  const [title, body] = steps[st];
  modal(`${title} <small class="stepno">${st + 1}/${N}</small>`, `<div class="dots">${Array.from({length: N}, (_, i) => `<i class="${i <= st ? 'on' : ''}"></i>`).join('')}</div>${body}
    <div class="mfoot">${st ? btn('← Atgal', 'fpNav', {n: -1}, 'ghost') : ''}<span class="sp"></span>${btn(st === N - 1 ? 'Baigti ✓' : 'Toliau →', 'fpNav', {n: 1}, 'primary')}</div>`, null, {wide: true, noFocus: true});
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
  const d = UI.foodDate, tg = targets(), nu = dayNutrition(d);
  const days = range(addDays(d, -13), 14).map(x => { const n = dayNutrition(x); return {label: parseD(x).getDate() + '', segs: [{v: n.kcal, color: n.kcal > tg.kcal * 1.08 ? '#f97316' : '#4f8cff', name: 'kcal'}], click: {a: 'foodDay', d: x}}; });
  // gairės: cukrūs ≤ 10% kcal, sotieji ≤ 10% kcal, skaidulos ≥ 30 g, druska ≤ 5 g, riebalai 25–35% kcal
  const lim = [['Angliavandeniai', nu.c, Math.round(tg.kcal * 0.45 / 4), 'g', 'apie'], ['– iš jų cukrūs', nu.s, Math.round(tg.kcal * 0.1 / 4), 'g', 'ne daugiau'], ['Riebalai', nu.f, Math.round(tg.kcal * 0.3 / 9), 'g', 'apie'], ['– iš jų sotieji', nu.sat, Math.round(tg.kcal * 0.1 / 9), 'g', 'ne daugiau'], ['Skaidulos', nu.fi, 30, 'g', 'bent'], ['Druska', nu.salt, 5, 'g', 'ne daugiau']];
  return `<div class="toolbar"><div class="navd">${btn('‹', 'foodNav', {n: -1}, 'sm')}<b>${relDay(d)} · ${fmtDate(d)}</b>${btn('›', 'foodNav', {n: 1}, 'sm')}</div>${btn('+ Maistas', 'addMeal', {d}, 'primary')}</div>
  <div class="grid2"><div>
    <div class="rings">${ring(nu.kcal, tg.kcal, '#4f8cff', nu.kcal, `/ ${tg.kcal} kcal`)}${ring(nu.p, tg.protein, '#a78bfa', Math.round(nu.p) + ' g', `/ ${tg.protein} g baltymų`)}</div>
    <p class="center">${nu.kcal <= tg.kcal ? `Liko <b>${tg.kcal - nu.kcal} kcal</b>` : `Viršyta <b class="red">${nu.kcal - tg.kcal} kcal</b>`}</p>
    ${card('Maistas', mealsList(d))}
    ${card('Kiti rodikliai', lim.map(([n, v, g, u, kind]) => { const bad = kind === 'ne daugiau' ? v > g : kind === 'bent' ? false : v > g * 1.3; const good = kind === 'bent' ? v >= g : !bad; return `<div class="bar-row"><span>${n}</span><div class="pbar"><i style="width:${clamp(v / g * 100, 0, 100)}%;background:${bad ? '#f97316' : good && kind === 'bent' ? '#22c55e' : '#4f8cff'}"></i></div><small>${round(v || 0)} / ${kind} ${g} ${u}</small></div>`; }).join('') + '')}
  </div>
  <div>${card('Kalorijos per 14 d.', svgBars(days, {goal: tg.kcal, h: 180}) + '')}
    ${card('Tavo normos', `<div class="kv"><span>Sudegini per dieną (TDEE)</span><b>${tg.tdee} kcal</b><span>Tikslas (su deficitu)</span><b>${tg.kcal} kcal</b><span>Baltymai</span><b>${tg.protein} g</b><span>Vanduo</span><b>~${tg.water} l</b></div>`)}</div></div>`;
}
A.foodNav = d => { UI.foodDate = addDays(UI.foodDate, +d.n); render(); };
A.foodDay = d => { UI.view = 'food'; UI.food = 'log'; UI.foodDate = d.d; render(); };
A.addMeal = d => { UI.mealDate = d.d || today(); UI.mealTime = null; mealModal(); };
function mealModal() {
  const t = UI.mealTab, tabs = [['freezer', '🧊 Iš atsargų'], ['recipe', '📗 Receptas'], ['snack', '🍎 Užkandis'], ['food', '🥕 Produktas'], ['quick', '⚡ Greitas']];
  let body = `<div class="tabs sm">${tabs.map(([v, l]) => `<button type="button" class="${t === v ? 'on' : ''}" data-a="mealTab" data-v="${v}">${l}</button>`).join('')}</div>
    <div class="row">${fld('Data', inp('date', UI.mealDate, 'date'))}${fld('Laikas', inp('time', UI.mealTime || nowHM(), 'time'))}</div>`;
  if (t === 'freezer') {
    const fr = storageItems();
    body += fr.length ? fld('Ką valgai?', `<div class="radios">${fr.map((f, i) => { const r = f.r, st = r ? recipeStats(r) : {}; return `<label><input type="radio" name="fid" value="${f.id}" ${i ? '' : 'checked'}><span>${f.place === 'fridge' ? '🧊' : '❄️'} ${r?.emoji || ''} ${esc(r?.name || '?')} <small>liko ${f.portions} porc. · ${leftText(f)} · ${st.kcal} kcal · ${st.p} g B</small></span></label>`; }).join('')}</div>`) + fld('Porcijos', inp('portions', 1, 'number', 'min="0.25" step="0.25"'))
      : empty('Atsargų nėra. Pagamink receptą ir paspausk „Pagaminau“.');
  } else if (t === 'recipe') {
    body += fld('Receptas', sel('rid', S.recipes.map(r => [r.id, `${r.emoji} ${r.name} (${recipeStats(r).kcal} kcal/porc.)`]))) + fld('Porcijos', inp('portions', 1, 'number', 'min="0.25" step="0.25"'));
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
  const q = norm(UI.recipeQ), u = recipeUsage(), showAll = UI.showAllRecipes;
  const sug = suggestRecipes().slice(0, 3);
  const all = suggestRecipes({all: true});
  const list = all.filter(x => (showAll || !x.block) && (!q || norm(x.r.name).includes(q) || x.r.tags.some(t => norm(t).includes(q))));
  const hidden = all.filter(x => x.block).length;
  return `${card('✨ Tau rekomenduojama', sug.length ? `<div class="sugs">${sug.map(x => `<div class="sug" data-a="viewRecipe" data-id="${x.r.id}"><div class="em">${x.r.emoji}</div><b>${esc(x.r.name)}</b><small>⏱ ${x.r.time} min · ${x.st.cost.toFixed(2)} €/porc.</small><div class="why">${x.why.map(w => `<span>${esc(w)}</span>`).join('')}</div></div>`).join('')}</div>` : empty('Pagal tavo nustatymus tinkančių receptų nėra – pakeisk „⚙️ Mano mityba“ arba pridėk savo receptą.'))}
  <div class="toolbar"><input class="search" placeholder="🔍 Ieškoti (vištiena, wrap, pusryčiai…)" value="${esc(UI.recipeQ)}" data-live="recipeQ">${btn('🔗 Pridėti receptą', 'importRecipe', {}, 'primary')}</div>
  <div class="rgrid">${list.map(x => { const r = x.r, st = x.st, rt = (S.ratings || {})[r.id]; return `<div class="rcard ${x.block ? 'blocked' : ''}" data-a="viewRecipe" data-id="${r.id}"><div class="em">${r.emoji}${rt === 1 ? '<i>❤️</i>' : ''}</div><b>${esc(r.name)}</b>
    <div class="macros"><span>🔥 ${st.kcal}</span><span>🥩 ${st.p} g</span><span>💶 ${st.priceReal < 100 ? '~' : ''}${st.cost.toFixed(2)}</span><span>⏱ ${r.time}′</span></div>
    <div class="tags">${x.block ? `<span class="tag warn">${esc(x.block)}</span>` : ''}${r.freezable ? '<span class="tag">🧊</span>' : ''}${'⭐'.repeat(r.skill || 1) ? `<span class="tag">${['', 'lengva', 'vidutinė', 'sudėtinga'][r.skill || 1]}</span>` : ''}${r.tags.slice(0, 2).map(t => `<span class="tag">${esc(t)}</span>`).join('')}${u[r.id] ? `<span class="tag warn">${u[r.id]}× per 14 d.</span>` : ''}</div></div>`; }).join('')}</div>
  ${hidden ? `<p class="center">${btn(showAll ? 'Slėpti netinkančius' : `Rodyti ir netinkančius (${hidden})`, 'toggleAllRecipes', {}, 'sm ghost')}</p>` : ''}`;
}
A.toggleAllRecipes = () => { UI.showAllRecipes = !UI.showAllRecipes; render(); };
const NUTR_LABELS = [['kcal', 'Kalorijos', 'kcal'], ['p', 'Baltymai', 'g'], ['c', 'Angliavandeniai', 'g'], ['s', '– iš jų cukrūs', 'g'], ['f', 'Riebalai', 'g'], ['sat', '– iš jų sotieji', 'g'], ['fi', 'Skaidulos', 'g'], ['salt', 'Druska', 'g']];
A.viewRecipe = d => {
  const r = recipe(d.id); if (!r) return; const st = recipeStats(r), fp = freezerPortions(r.id), rt = (S.ratings || {})[r.id], blk = recipeBlock(r), sim = similarRecipes(r);
  const lastCook = [...S.cooks].reverse().find(c => c.recipeId === r.id);
  modal(`${r.emoji} ${esc(r.name)}`, `${blk ? `<div class="warnbox">⚠️ Pagal tavo nustatymus netinka: ${esc(blk)}</div>` : ''}
    <div class="macros big"><span>🔥 ${st.kcal} kcal</span><span>🥩 ${st.p} g baltymų</span><span>⏱ ${r.time} min</span><span title="${st.priceReal}% kainos – iš tavo čekių">💶 ${st.priceReal < 100 ? '~' : ''}${st.cost.toFixed(2)} €/porc.</span></div>
    <p class="center hint">${r.portions} porcijos · viso ${st.priceReal < 100 ? '~' : ''}${st.total.toFixed(2)} € (${st.priceReal ? `${st.priceReal}% kainų iš tavo čekių` : 'kainos apytikslės'})${lastCook ? ` (paskutinį kartą kainavo ${lastCook.cost.toFixed(2)} €)` : ''} · ${['', 'lengva', 'vidutinė', 'sudėtinga'][r.skill || 1]}${r.equip?.length ? ' · ' + r.equip.join(', ') : ''}${r.freezable ? ' · 🧊 tinka šaldyti' : ''}${fp ? ` · šaldiklyje ${fp} porc.` : ''}</p>
    <div class="rate">${btn(rt === 1 ? '❤️ Patinka' : '🤍 Patinka', 'rate', {id: r.id, v: 1}, 'sm ' + (rt === 1 ? 'on' : ''))}${btn('👎 Nepatinka', 'rate', {id: r.id, v: -1}, 'sm ' + (rt === -1 ? 'on' : ''))}${r.source ? `<a class="btn sm" href="${esc(r.source)}" target="_blank" rel="noopener">🔗 Originalas</a>` : ''}</div>
    <div class="grid2"><div><h4>Ko reikia</h4><ul class="ing">${r.ing.map(([fid, g]) => { const f = food(fid); return `<li><span>${esc(f?.name || fid)}</span><b>${g >= 1000 ? round(g / 1000, 2) + ' kg' : g + ' g'}</b></li>`; }).join('')}</ul>
      <h4>Maistinė vertė porcijai ${st.fromSite ? '<small>(iš svetainės)</small>' : ''}</h4><table class="tbl nutri">${NUTR_LABELS.map(([k, l, u]) => `<tr><td>${l}</td><td><b>${st[k] ?? '–'}</b> ${u}</td></tr>`).join('')}</table></div>
    <div><h4>Kaip gaminti ${r.stepsOrig ? btn(UI.showOrig?.[r.id] ? '🌐 Rodyti vertimą' : `🌐 Originalas (${LANG_NAMES[r.lang] || r.lang || 'kita kalba'})`, 'toggleOrig', {id: r.id}, 'sm ghost') : !isLithuanian(r.steps.join(' ')) ? btn('🌐 Išversti į lietuvių', 'translateRecipe', {id: r.id}, 'sm') : ''}</h4>
      ${UI.showOrig?.[r.id] && r.nameOrig ? `<p class="hint">Originalus pavadinimas: ${esc(r.nameOrig)}</p>` : ''}
      <ol class="steps">${(UI.showOrig?.[r.id] && r.stepsOrig ? r.stepsOrig : r.steps).map(s => `<li>${esc(s)}</li>`).join('')}</ol>
      ${sim.length ? `<h4>Panašūs (įvairovei)</h4>${sim.map(x => `<div class="li click" data-a="viewRecipe" data-id="${x.id}">${x.emoji} ${esc(x.name)}</div>`).join('')}` : ''}</div></div>
    <div class="choice row">${btn('✅ Pagaminau → į šaldiklį', 'cook', {id: r.id}, 'primary')}${btn('🛒 Į pirkinių sąrašą', 'planAdd', {id: r.id})}${btn('🍽️ Valgau dabar', 'eatRecipe', {id: r.id})}${btn('✏️ Redaguoti', 'editRecipe', {id: r.id})}</div>`, null, {wide: true});
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
  const row = ([fid, g]) => `<div class="ingrow">${inp('ingf[]', food(fid)?.name || '', 'text', 'list="foodlist" placeholder="Produktas"')}${inp('ingg[]', g, 'number', 'min="0" placeholder="g"')}<button type="button" class="x" onclick="this.parentNode.remove()">✕</button></div>`;
  modal(d.id ? 'Redaguoti receptą' : 'Naujas receptas', `<datalist id="foodlist">${allFoods().map(f => `<option value="${esc(f.name)}">`).join('')}</datalist>
    <div class="row">${fld('Emoji', inp('emoji', r.emoji, 'text', 'maxlength="4"'), 'emojif')}${fld('Pavadinimas', inp('name', r.name, 'text', 'required'))}</div>
    <div class="row">${fld('Porcijos', inp('portions', r.portions, 'number', 'min="1"'))}${fld('Laikas (min)', inp('time', r.time, 'number', 'min="1"'))}${fld('Sudėtingumas', sel('skill', [[1, 'Lengva'], [2, 'Vidutinė'], [3, 'Sudėtinga']], r.skill || 1))}</div>
    ${fld('Žymos (per kablelį)', inp('tags', r.tags.join(', '), 'text', 'placeholder="pvz. wrap, vištiena, greita"'))}
    ${fld('Reikalinga technika', `<div class="chips">${EQUIP_OPTS.map(([v, l]) => `<label class="chipbtn"><input type="checkbox" name="equip[]" value="${v}" ${(r.equip || []).includes(v) ? 'checked' : ''}>${l}</label>`).join('')}</div>`)}
    <label class="cb"><input type="checkbox" name="freezable" ${r.freezable ? 'checked' : ''}> 🧊 Tinka šaldyti</label>
    <h4>Ingredientai (visam kiekiui, gramais)</h4><div id="ings">${r.ing.map(row).join('')}</div>
    <button type="button" class="btn sm" onclick="document.getElementById('ings').insertAdjacentHTML('beforeend', ${esc(JSON.stringify(row(['', 100])))})">+ ingredientas</button>
    ${fld('Gaminimo žingsniai (kiekvienas naujoje eilutėje)', `<textarea name="steps" rows="5">${esc(r.steps.join('\n'))}</textarea>`)}`, o => {
    const ing = [], bad = [];
    (o.ingf || []).forEach((n, i) => { if (!n.trim()) return; const f = allFoods().find(x => x.name.toLowerCase() === n.trim().toLowerCase()) || matchFood(n); if (!f) bad.push(n); else ing.push([f.id, +o.ingg[i] || 0]); });
    if (bad.length) { warn('Nerasti produktai: ' + bad.join(', ') + '\nPasirink iš sąrašo arba pirma pridėk skiltyje „Produktai“.'); return false; }
    const x = {name: o.name, emoji: o.emoji || '🍲', portions: +o.portions || 1, time: +o.time || 30, freezable: !!o.freezable, skill: +o.skill || 1, equip: o.equip || [], tags: o.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean), ing, steps: o.steps.split('\n').map(s => s.trim()).filter(Boolean)};
    if (d.id) { Object.assign(r, x); delete r.nutri; } else S.recipes.push({id: 'r_' + uid(), ...x});
    commit();
  }, {wide: true, extra: d.id ? btn('🗑', 'delRecipe', {id: d.id}, 'danger sm') : ''});
};
A.delRecipe = async d => { if (!await ask('Ištrinti receptą?', '', {danger: true, icon: '🗑️', yes: 'Ištrinti'})) return; S.recipes = S.recipes.filter(r => r.id !== d.id); if (!S.deletedRecipes.includes(d.id)) S.deletedRecipes.push(d.id); A.closeModal(); commit(); };

// ---------- Recepto importas ----------
A.importRecipe = () => {
  modal('🔗 Pridėti receptą', `<p>Įklijuok recepto nuorodą – ištrauksiu ingredientus, žingsnius ir maistinę vertę.</p>
    <div class="row"><input id="impurl" class="search" placeholder="https://…" style="flex:1">${btn('Importuoti', 'importGo', {}, 'primary')}</div>
    <p id="impmsg" class="hint"></p>
    <details class="impalt"><summary>Nėra nuorodos arba neveikia? Įklijuok recepto tekstą</summary>
      <textarea id="imptext" rows="8" placeholder="Pvz.:&#10;Vištienos makaronai&#10;Ingredientai:&#10;500 g vištienos krūtinėlės&#10;300 g makaronų&#10;1 svogūnas&#10;Gaminimas:&#10;Išvirk makaronus…"></textarea>
      <div class="choice row">${btn('Atpažinti tekstą', 'importText', {}, 'sm')}${btn('📋 Įklijuoti iš iškarpinės', 'pasteRecipe', {}, 'sm')}</div></details>
    <p class="center">${btn('✍️ Rašyti ranka', 'editRecipe', {}, 'sm ghost')}</p>`, null, {noFocus: true});
  setTimeout(() => $('#impurl')?.focus(), 50);
};
A.importGo = async () => {
  const url = $('#impurl').value.trim(), msg = $('#impmsg');
  if (!/^https?:\/\//.test(url)) { msg.textContent = '⚠️ Įklijuok pilną nuorodą (prasideda https://)'; return; }
  msg.textContent = '⏳ Skaitau receptą…';
  try {
    let j;
    if (cloudOn()) {
      const tok = await Auth.token(); let r;
      for (const fn of [...new Set([CLOUD.importFn, 'recipe-import'].filter(Boolean))]) {
        r = await fetch(`${CLOUD.url}/functions/v1/${fn}`, {method: 'POST', headers: {apikey: CLOUD.key, Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json'}, body: JSON.stringify({url})});
        if (r.status !== 404) break;
      }
      if (r.status === 404) throw new Error('Supabase nerado importo funkcijos – patikrink Edge Functions sąrašą. Kol kas gali įklijuoti recepto tekstą žemiau.');
      if (r.status === 401) throw new Error('Supabase atmetė užklausą (401) – prisijunk iš naujo.');
      j = await r.json();
    } else j = await (await fetch('/api/import?url=' + encodeURIComponent(url))).json();
    if (!j.ok) {
      const blocked = /just a moment|attention required|cloudflare|access denied|simple page|robot|captcha|forbidden/i.test(j.name || '');
      msg.innerHTML = `<div class="warnbox">${blocked ? '🛡️ Ši svetainė blokuoja automatinį skaitymą.' : `⚠️ ${esc(j.error || 'Nepavyko perskaityti recepto.')}`}<br>
        <small>Atidaryk receptą, pažymėk ingredientus ir žingsnius, nukopijuok – ir spausk „Įklijuoti iš iškarpinės“.</small>
        <div class="choice row"><a class="btn sm" href="${esc(url)}" target="_blank" rel="noopener">🔗 Atidaryti receptą</a>${btn('📋 Įklijuoti iš iškarpinės', 'pasteRecipe', {}, 'sm primary')}</div></div>`;
      $('.impalt').open = true; return;
    }
    impOpen({...j, source: url});
  } catch (e) { msg.textContent = '⚠️ ' + e.message; }
};
A.pasteRecipe = async () => {
  try { const t = await navigator.clipboard.readText(); if (!t.trim()) throw 0; $('#imptext').value = t; A.importText(); }
  catch (e) { $('.impalt').open = true; $('#imptext').focus(); toast('Įklijuok tekstą į laukelį (Ctrl+V arba ilgai paspaudus → Įklijuoti)'); }
};
A.importText = () => {
  const lines = $('#imptext').value.split('\n').map(s => s.trim()).filter(Boolean);
  if (!lines.length) return;
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
    const ing = parseIngredient(l), looksIng = l.length < 90 && (/^[\d½¼¾⅓⅔]/.test(l) || (ing.foodId && l.split(/\s+/).length <= 4 && !/[.!]\s*$/.test(l)));
    if ((mode === 'ing' || (!hasHeaders && mode !== 'steps')) && looksIng) { ingredients.push(l); if (!mode) mode = 'ing'; continue; }
    if (mode === 'ing' && !looksIng && l.length >= 30) mode = 'steps';
    if ((mode === 'steps' || (!hasHeaders && ingredients.length)) && l.length >= 25) steps.push(l.replace(/^(\d+[.)]|step \d+:?|žingsnis \d+:?)\s*/i, ''));
  }
  if (!ingredients.length) { toast('Neradau ingredientų – nukopijuok ingredientų sąrašą (su kiekiais)'); return; }
  // pavadinimas: paskutinė „normali“ eilutė prieš ingredientus (ne meniu, ne reklama)
  const JUNK = /^(pradzia|receptai|prisijungti|registruotis|paieska|ieskoti|reklama|home|recipes?|menu|log ?in|sign ?in|search|advertisement|jump to recipe|print|share|dalintis|komentarai|subscribe|newsletter|skip to content)$/;
  const firstIng = lines.findIndex(l => ING_H.test(norm(l)) || l === ingredients[0]);
  const cands = lines.slice(0, firstIng < 0 ? 8 : firstIng).filter(l => !/\d/.test(l) && !JUNK.test(norm(l)) && l.length >= 5 && l.length < 90 && !ING_H.test(norm(l)));
  name = cands[cands.length - 1] || name;
  impOpen({name: name || 'Naujas receptas', ingredients, steps, portions, time, nutrition: null});
};
function impOpen(j) {
  const lines = (j.ingredients || []).map(parseIngredient);
  const text = norm((j.steps || []).join(' ') + ' ' + j.name);
  const equip = [['orkait', 'orkaitė'], ['oven', 'orkaitė'], ['air fryer', 'airfryer'], ['airfryer', 'airfryer'], ['gruzdintuv', 'airfryer'], ['slow cooker', 'lėtpuodis'], ['letpuod', 'lėtpuodis'], ['blender', 'blenderis'], ['blenderi', 'blenderis'], ['trintuv', 'blenderis'], ['keptuv', 'keptuvė'], ['pan ', 'keptuvė'], ['skillet', 'keptuvė'], ['puod', 'puodas'], ['boil', 'puodas'], ['virk', 'puodas'], ['pot ', 'puodas']].filter(([k]) => text.includes(k)).map(([, v]) => v);
  UI.imp = {name: j.name || 'Receptas', portions: j.portions || 4, time: j.time || 30, lines, steps: j.steps || [], nutri: j.nutrition, useSite: !!j.nutrition, source: j.source || '',
    equip: [...new Set(equip)], skill: (j.steps || []).length > 8 || (j.time || 0) > 75 ? 2 : 1, emoji: '🍲'};
  // kita kalba → verčiam į lietuvių (originalas išsaugomas)
  if (!isLithuanian([UI.imp.name, ...UI.imp.steps].join(' '))) { UI.imp.tr = {state: 'busy'}; impModal(); translateImp(); }
  else impModal();
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
  return `<div class="okbox">🌐 Išversta iš ${LANG_NAMES[t.from] || t.from} kalbos (DeepL). Kiekiai ir produktai paimti iš originalo. ${btn(I.showOrig ? 'Rodyti vertimą' : 'Rodyti originalą', 'toggleOrigImp', {}, 'sm ghost')}</div>`;
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
    <div class="row">${fld('Emoji', `<input data-imp="emoji" value="${esc(I.emoji)}" maxlength="4">`, 'emojif')}${fld('Pavadinimas', `<input data-imp="name" value="${esc(I.name)}">`)}</div>
    <div class="row">${fld('Porcijos', `<input type="number" min="1" data-imp="portions" value="${I.portions}">`)}${fld('Laikas (min)', `<input type="number" min="1" data-imp="time" value="${I.time}">`)}</div>
    <h4>Ingredientai ${unk ? `<small class="red">· ${unk} neatpažinti – pasirink arba palik (bus praleisti)</small>` : '<small class="green">· visi atpažinti ✓</small>'}</h4>
    <div class="implines">${I.lines.map((l, i) => `<div class="impl ${l.foodId ? '' : 'unk'}"><small>${esc(l.raw)}</small><div class="row"><input list="foodlist" data-impf="${i}" value="${esc(food(l.foodId)?.name || '')}" placeholder="— neatpažinta —"><input type="number" min="0" data-impg="${i}" value="${l.grams}"><span class="u">g</span><button type="button" class="x" data-a="impDel" data-i="${i}">✕</button></div></div>`).join('') || empty('Ingredientų nerasta')}</div>
    <h4>Porcijai: ${st.kcal} kcal · ${st.p} g baltymų · ~${st.cost.toFixed(2)} € ${I.nutri ? `<label class="cb inl"><input type="checkbox" data-imp="useSite" ${I.useSite ? 'checked' : ''}> naudoti svetainės maistinę vertę</label>` : ''}</h4>
    ${trBox(I)}
    <h4>Žingsniai (${I.steps.length})</h4><ol class="steps small">${(I.showOrig && I.stepsOrig ? I.stepsOrig : I.steps).map(s => `<li>${esc(s)}</li>`).join('')}</ol>`,
    () => { impSync(); const I = UI.imp; const ing = I.lines.filter(l => l.foodId && l.grams > 0).map(l => [l.foodId, l.grams]);
      if (!ing.length && !(I.useSite && I.nutri)) { warn('Bent vienas ingredientas turi būti atpažintas'); return false; }
      const flags = new Set(); ing.forEach(([f]) => (FOOD_FLAGS[f] || []).forEach(x => flags.add(x)));
      const tags = [...new Set([...['paukštiena', 'kiauliena', 'jautiena', 'žuvis', 'ankštiniai'].filter(x => flags.has(x)).map(x => x === 'paukštiena' ? 'vištiena' : x), ...(norm(I.name).includes('wrap') ? ['wrap'] : []), ...(norm(I.name).includes('sriub') || norm(I.name).includes('soup') ? ['sriuba'] : [])])];
      const r = {id: 'r_' + uid(), name: I.name, emoji: I.emoji || '🍲', portions: +I.portions || 1, time: +I.time || 30, freezable: true, skill: I.skill, equip: I.equip, tags, ing, steps: I.steps, source: I.source};
      if (I.stepsOrig) { r.stepsOrig = I.stepsOrig; r.nameOrig = I.nameOrig; r.lang = I.lang; }
      if (I.useSite && I.nutri) r.nutri = I.nutri;
      S.recipes.push(r); UI.imp = null; commit(); toast('📗 Receptas pridėtas!', 'good'); setTimeout(() => A.viewRecipe({id: r.id}), 100); },
    {wide: true, submit: '✓ Išsaugoti receptą', noFocus: true});
}
function impSync() {
  const I = UI.imp; if (!I) return;
  document.querySelectorAll('[data-imp]').forEach(el => { const k = el.dataset.imp; I[k] = el.type === 'checkbox' ? el.checked : el.type === 'number' ? +el.value : el.value; });
  document.querySelectorAll('[data-impf]').forEach(el => { const l = I.lines[+el.dataset.impf]; const f = allFoods().find(x => x.name === el.value) || (el.value ? matchFood(el.value) : null); l.foodId = f ? f.id : ''; });
  document.querySelectorAll('[data-impg]').forEach(el => { I.lines[+el.dataset.impg].grams = +el.value || 0; });
}
A.impDel = d => { impSync(); UI.imp.lines.splice(+d.i, 1); impModal(); };

function fFreezer() {
  const items = storageItems(), fridge = items.filter(x => x.place === 'fridge'), frz = items.filter(x => x.place === 'freezer');
  const total = sum(items.map(x => x.portions)), perDay = Math.max(1, (+S.foodPrefs.mealsPerDay || 3) - 1), daysLeft = round(total / perDay, 1);
  const row = x => { const r = x.r, st = r ? recipeStats(r) : {};
    return `<div class="li ${x.left <= 1 ? 'soonx' : ''}"><span class="em2">${r?.emoji || '?'}</span><div class="grow"><b>${esc(r?.name || 'Ištrintas receptas')}</b><br><small>pagaminta ${relDay(x.date)} · ${leftText(x)} · ${st.kcal} kcal · ${st.p} g B</small></div>
    <div class="stepper">${btn('−', 'frz', {id: x.id, n: -1}, 'sm')}<b>${x.portions}</b>${btn('+', 'frz', {id: x.id, n: 1}, 'sm')}</div>
    ${x.place === 'freezer' ? btn('❄️→🧊 Atšildyti 1', 'thaw', {id: x.id}, 'sm', ) : r?.freezable && x.left >= 1 ? btn('🧊→❄️ Užšaldyti', 'refreeze', {id: x.id}, 'sm') : ''}${btn('🍽️ Valgau', 'eatFreezer', {id: x.id}, 'sm primary')}</div>`; };
  return `<div class="stats3"><div><b>${total}</b><small>porcijų iš viso</small></div><div><b class="${daysLeft < 2 ? 'red' : 'green'}">${daysLeft}</b><small>dienų maisto (po ${perDay} porc./d.)</small></div><div><b class="${fridge.some(x => x.left <= 1) ? 'red' : ''}">${fridge.filter(x => x.left <= 1).length}</b><small>greitai baigs galioti</small></div></div>
  <label class="switch card"><input type="checkbox" data-c="mealSuggest" ${S.foodPrefs.mealSuggest ? 'checked' : ''}><span></span><div><b>🍽️ Siūlyk, ką valgyti kada</b><small>Pagal tai, kas greičiau genda, sportą ir dienos ritmą „Šiandien“ skiltyje pasiūlys, kurią porciją valgyti kuriam valgymui. Išjungus – rodomi tik valgymo laikai.</small></div></label>
  ${card('🧊 Šaldytuvas', fridge.length ? fridge.map(row).join('') : empty('Tuščia'), '', '')}
  ${card('❄️ Šaldiklis', frz.length ? frz.map(row).join('') : empty('Tuščia. Pagamink receptą ir paspausk „Pagaminau“.'), btn('+ Pagaminau', 'foodTab', {v: 'recipes'}, 'sm'))}
  `;
}
A.frz = d => { const f = S.freezer.find(x => x.id === d.id); f.portions = Math.max(0, f.portions + +d.n); if (!f.portions) S.freezer = S.freezer.filter(x => x !== f); commit(); };
A.thaw = d => { const f = S.freezer.find(x => x.id === d.id); if (!f) return; takePortion(f.id, 1); S.freezer.push({id: uid(), recipeId: f.recipeId, place: 'fridge', portions: 1, date: f.date, until: addDays(today(), 2), thawed: true}); commit(); toast('🧊 Perkelta į šaldytuvą – suvalgyk per 2 d.'); };
A.refreeze = d => { const f = S.freezer.find(x => x.id === d.id); if (!f) return; const n = f.portions; S.freezer = S.freezer.filter(x => x !== f); addStorage(f.recipeId, 'freezer', n, f.date); commit(); toast(`❄️ ${n} porc. užšaldyta`); };
A.eatFreezer = d => { UI.mealTab = 'freezer'; UI.mealDate = today(); mealModal(); const r = $(`#mform input[value="${d.id}"]`); if (r) r.checked = true; };

function fShop() {
  const bw = budgetWeek(), agg = {};
  for (const p of S.plan) { const r = recipe(p.rid); if (!r) continue; for (const [fid, g] of r.ing) agg[fid] = (agg[fid] || 0) + g * (p.mult || 1); }
  const items = Object.entries(agg).map(([fid, g]) => { const f = food(fid); return {fid, name: f?.name || fid, g: Math.round(g), cost: (f?.price || 0) * g / 1000, mine: f?.priceMine}; }).sort((a, b) => a.name.localeCompare(b.name));
  const total = sum(items.map(i => i.cost)), checked = S.shopChecked || {};
  const pct = bw.budget ? clamp((bw.spent + total) / bw.budget * 100, 0, 100) : 0;
  const fmtG = g => g >= 1000 ? round(g / 1000, 2) + ' kg' : g + ' g';
  const ws = weekStart(today()), rcpts = (S.spend || []).filter(s => s.date >= ws);
  return `<div class="grid2"><div>
    ${card('💶 Savaitės maisto biudžetas', `<div class="budget"><div class="pbar big"><i style="width:${bw.budget ? clamp(bw.spent / bw.budget * 100, 0, 100) : 0}%"></i><i class="plan" style="width:${pct}%"></i></div>
      <div class="kv"><span>Biudžetas</span><b>${bw.budget.toFixed(2)} €</b><span>Jau išleista ${bw.fromReceipts ? '(pagal čekius)' : '(pagal pagamintus)'}</span><b>${bw.spent.toFixed(2)} €</b><span>Sąrašas kainuos ~</span><b>${total.toFixed(2)} €</b><span>Liks</span><b class="${bw.left - total < 0 ? 'red' : 'green'}">${(bw.left - total).toFixed(2)} €</b></div></div>
      ${rcpts.length ? `<p class="hint">Šios savaitės čekiai: ${rcpts.map(s => `${fmtDate(s.date)} – ${s.amount.toFixed(2)} €${s.note ? ' (' + esc(s.note) + ')' : ''}`).join(', ')}</p>` : ''}
      <div class="choice row">${btn('🧾 Nuskaityti čekį', 'scanReceipt', {}, 'primary sm')}</div>
      `)}
    ${card('📋 Ką gaminsiu šią savaitę', S.plan.length ? S.plan.map(p => { const r = recipe(p.rid); if (!r) return ''; const st = recipeStats(r); return `<div class="li"><span class="em2">${r.emoji}</span><b>${esc(r.name)}</b><small>× ${p.mult || 1} (${r.portions * (p.mult || 1)} porc.) · ${st.priceReal < 100 ? '~' : ''}${(st.total * (p.mult || 1)).toFixed(2)} €</small><span class="sp"></span>${btn('−', 'planMult', {id: p.rid, n: -1}, 'sm')}${btn('+', 'planMult', {id: p.rid, n: 1}, 'sm')}</div>`; }).join('') : empty('Pridėk receptų iš „Receptai“ → „Į pirkinių sąrašą“.'), btn('+ Receptas', 'foodTab', {v: 'recipes'}, 'sm'))}
  </div><div>
    ${card('🛒 Pirkinių sąrašas', items.length ? items.map(i => `<label class="li shop ${checked[i.fid] ? 'on' : ''}"><input type="checkbox" data-c="shopCheck" data-id="${i.fid}" ${checked[i.fid] ? 'checked' : ''}><span>${esc(i.name)}</span><span class="sp"></span><b>${fmtG(i.g)}</b><small>${i.mine ? '' : '~'}${i.cost.toFixed(2)} €</small></label>`).join('') + `<div class="choice row">${btn('📋 Kopijuoti sąrašą', 'copyShop', {}, 'sm')}${btn('Išvalyti', 'clearPlan', {}, 'sm ghost')}</div>` : empty('Sąrašas tuščias'))}
  </div></div>`;
}

// ---------- Čekio nuskaitymas ----------
// Įprasti pakuočių dydžiai (g), kai čekyje svoris neparašytas
const PACK_G = {sviestas:200, pienas:1000, kefyras:1000, jogurtas:400, graik_jog:400, skyr:400, varske_0:400, varske_9:400, suris:250, mozzarella:125, grietine20:400, grietine10:400, grietinele:200,
  makaronai:500, makaronai_pg:500, ryziai:1000, ryziai_rudi:1000, grikiai:1000, avizos:500, miltai:1000, cukrus:1000, kiausiniai:600, duona_rug:800, duona_pg:500, lavasas:360, kuskusas:500, bulguras:500, kinva:500, lesiai:500, perlines:1000,
  pom_konserv:400, pom_pasta:140, pup_raud:400, pup_balt:400, avinz:400, kukuruzai:340, tunas:160, kok_pienas:400, sojos:150, majonezas:400, kecupas:500, medus:400, pesto:190, humusas:200, tofu:300,
  alyv_al:500, saul_al:1000, riesut_sv:350, chia:200, migdolai:200, graikiniai:200, saulegrazos:200, baltymai:1000, kumpis:200, desreles:400, krevetes:250, darz_mix:400, zirneliai:400, uogos:400, spinatai:200, salotos:150, sokoladas:100, batonelis:60};
A.scanReceipt = () => {
  modal('🧾 Čekio nuskaitymas', `<p>Nufotografuok visą čekį (gerai apšviestą, tiesiai) arba įkelk nuotrauką.</p>
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
    ${kind === 'label' ? btn('➕ Sukurti produktą iš etiketės', 'addFood', {label: 1}, 'sm') : ''}${btn('✍️ Įvesti ranka', 'rcManual', {}, 'sm ghost')}</div></div>`;
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
const inCur = (v, R) => R.currency && R.currency !== 'EUR' ? `${(+v).toFixed(2)} ${CUR_SIGN[R.currency] || R.currency}${R.rate ? `<br><small>≈ ${(v * R.rate).toFixed(2)} €</small>` : ''}` : `${(+v).toFixed(2)} €`;
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
  modal('🧾 Patikrink čekį', `<datalist id="foodlist">${allFoods().map(f => `<option value="${esc(f.name)}">`).join('')}</datalist>
    ${rcQuality()}
    ${R.currency && R.currency !== 'EUR' ? (R.rate ? `<div class="okbox">💱 Čekis valiuta <b>${R.currency}</b>. Perskaičiuosiu į eurus pagal ECB kursą: 1 ${R.currency} = ${R.rate.toFixed(4)} €. Kainos ir biudžetas bus eurais.</div>`
      : `<div class="warnbox">💱 Čekis valiuta <b>${R.currency}</b>, bet nepavyko gauti kurso (reikia interneto). Kainų neatnaujinsiu, kad nesusimaišytų.</div>`) : ''}
    <p class="hint">Pažymėtiems produktams atnaujinsiu kainą.</p>
    <div class="implines">${R.items.map((x, i) => { const ppk = x.grams ? x.total / x.grams * 1000 : 0; return `<div class="impl ${x.kind === 'ne' ? 'nef' : x.foodId ? '' : 'unk'} ${x.doubt ? 'doubt' : ''}"><small>${x.doubt ? '<b class="warnc" title="Neaiškiai perskaityta – patikrink kainą">? </b>' : ''}${esc(x.raw)}</small><div class="row">
      <select data-rck="${i}" class="rck">${RC_KINDS.map(([v, l]) => opt(v, l, x.kind)).join('')}</select>
      ${x.kind === 'ne' ? '<span class="grow muted">nebus skaičiuojama</span>' : `<input type="checkbox" data-rca="${i}" ${x.apply ? 'checked' : ''} title="Atnaujinti kainą"><input list="foodlist" data-rcf="${i}" value="${esc(food(x.foodId)?.name || (x.manual ? x.name : ''))}" placeholder="${x.manual ? 'produktas (pvz. Bananai)' : x.kind === 'snack' ? 'užkandis (nebūtina)' : 'naujas produktas – bus išsaugotas'}">
      <input type="number" data-rcg="${i}" value="${x.grams || ''}" placeholder="g" title="Kiekis gramais"><span class="u">g${x.sizeGuess && x.grams ? '~' : ''}</span>`}
      ${x.manual || x.doubt ? `<span class="rcp"><input type="number" step="0.01" min="0" data-rcp="${i}" value="${x.total || ''}" placeholder="€" class="rcpi">${ppk && x.kind !== 'ne' ? `<br><small>${ppk.toFixed(2)} €/kg</small>` : ''}</span>`
        : `<span class="rcp">${inCur(x.total, R)}${ppk && x.kind !== 'ne' ? `<br><small>${(ppk * (R.rate || 1)).toFixed(2)} €/kg</small>` : ''}</span>`}</div></div>`; }).join('')}</div>
    <div class="choice row">${btn('+ Pridėti eilutę ranka', 'rcAdd', {}, 'sm')}</div>
    <div class="kv rcsum"><span>🥕 Maistas</span><b>${(foodSum * (R.rate || 1)).toFixed(2)} €</b><span>🍫 Užkandžiai</span><b>${(snackSum * (R.rate || 1)).toFixed(2)} €</b><span>🚫 Ne maistas (neskaičiuojama)</span><b>${(neSum * (R.rate || 1)).toFixed(2)} €</b></div>
    <div class="row" style="margin-top:8px">${fld('Data', `<input type="date" data-rct="date" value="${R.date}" min="2000-01-01" max="2099-12-31">`)}</div>
    <label class="cb"><input type="checkbox" data-rct="addSpend" ${R.addSpend ? 'checked' : ''}> Įrašyti ${((foodSum + snackSum) * (R.rate || 1)).toFixed(2)} € į savaitės maisto išlaidas</label>`,
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
      UI.rc = null; commit(); toast(`🧾 Atnaujinta ${upd} kainų${saved ? ` · ${saved} nauji produktai išsaugoti` : ''}${R.addSpend ? ` · išlaidos +${(fs + ss).toFixed(2)} €` : ''}`, 'good'); },
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
  return `${stale.length ? `<div class="warnbox">🕒 Senesnės nei mėnesio kainos produktų, kuriuos naudoji: <b>${stale.map(f => esc(f.name)).join(', ')}</b>. ${btn('🧾 Nuskaityti čekį', 'scanReceipt', {}, 'sm')} arba spausk kainą ir įrašyk.</div>` : ''}
  <div class="toolbar"><input class="search" placeholder="🔍 Ieškoti produkto" value="${esc(UI.foodQ)}" data-live="foodQ">${btn('🧾 Čekis', 'scanReceipt', {}, 'sm')}${btn('+ Savas produktas', 'addFood', {}, 'primary')}</div>
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
function receiptFoodsCard() {
  const rf = (S.receiptFoods || []).filter(x => x.kind !== 'snack'), sn = (S.receiptFoods || []).filter(x => x.kind === 'snack');
  if (!rf.length && !sn.length) return '';
  return card('🧾 Iš čekių (dar be maistinės vertės)', `${rf.map(x => `<div class="li"><b>${esc(x.name)}</b><small>${x.price.toFixed(2)} €/kg · ${fmtDate(x.date)}</small><span class="sp"></span>${btn('+ Papildyti', 'addFood', {rf: x.id}, 'sm')}${btn('✕', 'delRf', {id: x.id}, 'sm ghost')}</div>`).join('')}
    ${sn.length ? `<details class="impalt"><summary>🍫 Užkandžiai (${sn.length}) – kainos išsaugotos</summary>${sn.map(x => `<div class="li"><span>${esc(x.name)}</span><span class="sp"></span><small>${x.price.toFixed(2)} €/kg</small>${btn('✕', 'delRf', {id: x.id}, 'sm ghost')}</div>`).join('')}</details>` : ''}
    `);
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
function bodyMap() {
  const last = muscleLastTrained(), t = today();
  const col = g => { const dd = last[g] ? diffDays(last[g], t) : 99; return dd <= 3 ? '#22c55e' : dd <= 7 ? '#facc15' : '#ef4444'; };
  const sh = (g, shape) => `<g data-a="muscleInfo" data-g="${g}" class="mus" style="--c:${col(g)}"><title>${MUSCLES[g]}: ${last[g] ? relDay(last[g]) : 'dar nedaryta'}</title>${shape}</g>`;
  const E = (cx, cy, rx, ry, rot = 0) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${rot ? `transform="rotate(${rot} ${cx} ${cy})"` : ''}/>`;
  const P = d => `<path d="${d}"/>`;
  const M = (d) => P(d) + P(d.replace(/(-?\d+(\.\d+)?),(-?\d+(\.\d+)?)/g, (_, x, __, y) => `${200 - x},${y}`)); // veidrodinis atspindys
  const EE = (cx, cy, rx, ry, rot = 0) => E(cx, cy, rx, ry, rot) + E(200 - cx, cy, rx, ry, -rot);
  // kūno silueto „oda“
  const skin = `<g class="skin"><ellipse cx="100" cy="36" rx="20" ry="24"/>${P('M90,56 L110,56 L112,74 L88,74 Z')}
    ${P('M64,80 Q100,70 136,80 L146,96 L140,140 Q132,180 128,200 L72,200 Q68,180 60,140 L54,96 Z')}
    ${P('M72,196 L128,196 L132,224 L68,224 Z')}${M('M68,218 L98,218 L96,300 L94,380 L78,380 L72,300 Z')}
    ${EE(46, 228, 7, 11)}${EE(86, 390, 12, 6)}${M('M54,92 L40,120 L36,180 L44,208 L52,206 L56,170 L62,120 Z')}</g>`;
  const front = skin
    + sh('kak', P('M91,58 L109,58 L111,76 L100,80 L89,76 Z'))
    + sh('tra', M('M89,70 Q78,78 66,82 L88,82 Z'))
    + sh('pec', EE(60, 94, 13, 15, -15))
    + sh('kru', M('M100,86 L76,86 Q68,100 73,116 Q87,124 100,119 Z'))
    + sh('bic', EE(52, 130, 9, 19, 12))
    + sh('dil', EE(43, 180, 8, 24, 6))
    + sh('pre', [0, 1, 2].map(i => `<rect x="88" y="${124 + i * 21}" width="11" height="18" rx="4"/><rect x="101" y="${124 + i * 21}" width="11" height="18" rx="4"/>`).join('') + '<rect x="89" y="187" width="22" height="12" rx="5"/>')
    + sh('son', M('M76,122 Q71,152 79,190 L86,192 L86,124 Z'))
    + sh('ket', EE(84, 254, 14, 40, 4))
    + sh('bla', EE(84, 336, 8, 28, 2));
  const back = skin
    + sh('kak', P('M91,56 L109,56 L110,72 L90,72 Z'))
    + sh('nug', M('M75,98 Q66,128 80,168 L97,160 L93,108 Z'))
    + sh('tra', P('M100,64 L70,84 L86,100 L100,138 L114,100 L130,84 Z'))
    + sh('pec', EE(60, 94, 13, 15, -15))
    + sh('apn', P('M88,160 L112,160 L116,196 L84,196 Z'))
    + sh('tri', EE(52, 130, 9, 19, 12))
    + sh('dil', EE(43, 180, 8, 24, 6))
    + sh('sed', EE(87, 214, 15, 17))
    + sh('uzp', EE(84, 264, 13, 36, 4))
    + sh('bla', EE(84, 334, 11, 27, 2));
  const groups = Object.keys(MUSCLES).filter(g => g !== 'kar').map(g => ({g, d: last[g] ? diffDays(last[g], t) : null})).sort((a, b) => (b.d ?? 999) - (a.d ?? 999));
  return `<div class="body"><div><svg viewBox="20 0 160 400">${front}</svg><small>Priekis</small></div><div><svg viewBox="20 0 160 400">${back}</svg><small>Nugara</small></div>
    <div class="glist">${groups.map(x => `<div data-a="muscleInfo" data-g="${x.g}"><i style="background:${col(x.g)}"></i>${MUSCLES[x.g]}<span class="sp"></span><small>${x.d == null ? 'niekada' : x.d === 0 ? 'šiandien' : x.d + ' d.'}</small></div>`).join('')}</div></div>
    <div class="legend"><span style="--c:#22c55e">≤3 d.</span><span style="--c:#facc15">4–7 d.</span><span style="--c:#ef4444">&gt;7 d. / niekada</span></div>`;
}
A.muscleInfo = d => {
  const last = muscleLastTrained()[d.g];
  modal(MUSCLES[d.g], `<p>Paskutinį kartą: <b>${last ? relDay(last) : 'dar nedaryta'}</b></p>${EXERCISES.filter(e => e.g.includes(d.g)).map(exRow).join('')}`);
};
function exRow(e) { const lp = lastPerf(e.id); return `<div class="ex"><b>${esc(e.name)}</b> <span class="lvl l${e.lvl}">${['', 'lengvas', 'vidutinis', 'sunkus'][e.lvl]}</span><p>${esc(e.how)}</p><small>${e.g.map(g => MUSCLES[g]).join(', ')}${lp ? ` · paskutinį kartą: ${lp.sets.join(', ')}${e.sec ? ' s' : ''}` : ''}${e.next ? ` · sunkesnis: ${esc(exercise(e.next).name)}` : ''}</small></div>`; }
function vSport() {
  const p = S.profile, ws = weekStart(today()), weekW = S.workouts.filter(w => w.date >= ws).length;
  const weeks = Array.from({length: 8}, (_, i) => { const s = addDays(ws, -7 * (7 - i)); const m = sum(S.workouts.filter(w => w.date >= s && w.date <= addDays(s, 6)).map(w => +w.duration || 0)); return {label: parseD(s).getDate() + ' ' + MONTHS_G[parseD(s).getMonth()].slice(0, 3), segs: [{v: m, color: '#22c55e', name: 'min'}]}; });
  const hist = [...S.workouts].sort((a, b) => a.date < b.date ? 1 : -1).slice(0, 12);
  if (UI.sport === 'lib') return `<div class="tabs">${btn('← Atgal', 'sportTab', {v: 'overview'})}</div>${Object.keys(MUSCLES).map(g => card(MUSCLES[g], EXERCISES.filter(e => e.g[0] === g).map(exRow).join('') || empty('—'))).join('')}`;
  const full = sportOn();
  if (!full && S.settings.intro.sport !== 'log' && !S.workouts.length) return introCard('sport');
  const upcoming = (S.plans || []).filter(x => x.status === 'planned' && x.date >= today()).sort((a, b) => (a.date + a.start) < (b.date + b.start) ? -1 : 1);
  const neg = full ? neglected() : [], rv = full && sportReviewDue();
  if (!full) return `<div class="toolbar">${btn('📅 Susiplanuoti', 'planWorkout', {}, 'primary')}${btn('⚡ Įrašyti atliktą', 'addWorkout', {}, 'sm')}${btn('📚 Pratimai', 'sportTab', {v: 'lib'}, 'sm')}<span class="sp"></span>${btn('💡 Įjungti rekomendacijas', 'enableMode', {k: 'sport'}, 'sm ghost')}</div>
  <div class="grid2"><div>
    ${S.active ? card('🏋️ Treniruotė vyksta', `<p class="bigclock wClock">${clock(S.active.ts)}</p>${btn('Atidaryti', 'workoutMode', {}, 'primary')}`) : ''}
    ${upcoming.length ? upcoming.slice(0, 3).map(planCard).join('') : card('Ką nori treniruoti?', `<div class="wtypes">${WTYPES.filter(w => w.id !== 'auto').map(w => `<button class="wtype" data-a="planWorkout" data-type="${w.id}"><span>${w.emoji}</span>${w.name}</button>`).join('')}</div>`)}
    ${card('📜 Treniruotės', hist.length ? hist.map(w => `<div class="li click" data-a="viewWorkout" data-id="${w.id}">${WTYPES.find(x => x.id === w.type)?.emoji || '💪'} <b>${relDay(w.date)}</b> <small>${w.type ? wtypeName(w.type) + ' · ' : ''}${w.duration} min</small></div>`).join('') : empty('Dar nėra treniruočių'))}
    ${hist.length ? card('📊 Minutės per savaitę', svgBars(weeks, {h: 150})) : ''}</div>
    <div>${card('📚 Pratimai pagal raumenis', `<div class="chips">${Object.keys(MUSCLES).map(g => `<button class="chipbtn" data-a="muscleInfo" data-g="${g}">${MUSCLES[g]}</button>`).join('')}</div>`)}
    ${card('🧍 Kada kas treniruota', bodyMap())}</div></div>`;
  return `${rv ? `<div class="banner" data-a="sportReview">📊 <b>2 savaičių sporto apžvalga</b> – pažiūrėk, ką treniravai, o ką praleidai. <span class="sp"></span><button class="btn sm primary">Žiūrėti</button></div>` : ''}
  <div class="toolbar">${btn('📅 Suplanuoti treniruotę', 'planWorkout', {}, 'primary')}${btn('⚡ Įrašyti atliktą', 'addWorkout', {}, 'sm')}${btn('📊 Apžvalga', 'sportReview', {}, 'sm')}${btn('📚 Pratimai', 'sportTab', {v: 'lib'}, 'sm')}</div>
  <div class="grid2"><div>
    ${S.active ? card('🏋️ Treniruotė vyksta', `<p class="bigclock wClock">${clock(S.active.ts)}</p>${btn('Atidaryti', 'workoutMode', {}, 'primary')}`) : ''}
    ${upcoming.length ? upcoming.slice(0, 3).map(planCard).join('') : card('Kas toliau?', `<p>Pasirink, ką nori treniruoti – programa sudės pratimus:</p><div class="wtypes">${WTYPES.map(w => `<button class="wtype" data-a="planWorkout" data-type="${w.id}"><span>${w.emoji}</span>${w.name}</button>`).join('')}</div>`)}
    ${card('📊 Minutės per savaitę', svgBars(weeks, {h: 150, goal: (+p.workoutsPerWeek || 3) * (+p.workoutMin || 40)}))}
    ${card('📜 Istorija', hist.length ? hist.map(w => `<div class="li click" data-a="viewWorkout" data-id="${w.id}">${WTYPES.find(x => x.id === w.type)?.emoji || '💪'} <b>${relDay(w.date)}</b> <small>${w.type ? wtypeName(w.type) + ' · ' : ''}${w.duration} min · ${(w.exercises || []).length} pratimai</small></div>`).join('') : empty('Dar nėra treniruočių'))}
  </div><div>
    ${card(`Šią savaitę: ${weekW} / ${p.workoutsPerWeek} treniruotės`, `<div class="pbar big"><i style="width:${clamp(weekW / (+p.workoutsPerWeek || 3) * 100, 0, 100)}%;background:#22c55e"></i></div>
      ${neg.length ? `<div class="warnbox">⚠️ Per 2 savaites mažai arba visai nedaryta: <b>${neg.map(x => MUSCLES[x.g]).join(', ')}</b>. ${btn('Kodėl?', 'sportReview', {}, 'sm')}</div>` : ''}`)}
    ${card('🧍 Kada kas treniruota', bodyMap())}
  </div></div>`;
}
const wtypeName = id => WTYPES.find(w => w.id === id)?.name || 'Treniruotė';
function planCard(pl) {
  const n = pl.exercises.length, isToday = pl.date === today();
  return card(`${WTYPES.find(w => w.id === pl.type)?.emoji || '🏋️'} ${isToday ? 'Šiandien' : relDay(pl.date)} ${pl.start} – ${esc(wtypeName(pl.type))}`,
    `<ol class="wlist compact">${pl.exercises.map(x => { const e = exercise(x.id); return e ? `<li><b>${esc(e.name)}</b> <small>${x.sets.length} × ${x.sets[0]}${e.sec ? ' s' : ''}</small></li>` : ''; }).join('')}</ol>
    <p class="hint">${n} pratimai · ~${pl.duration} min · ⏰ priminsiu 30 min prieš</p>
    <div class="choice row">${isToday ? btn('▶ Pradėti', 'startPlan', {id: pl.id}, 'primary') + btn('✓ Padariau kaip suplanuota', 'planDone', {id: pl.id}) : ''}${btn('✏️ Keisti', 'openPlan', {id: pl.id}, 'sm')}${btn('Praleisti', 'planSkip', {id: pl.id}, 'sm ghost')}</div>`, '', 'plancard');
}

// ---------- Planavimas ----------
A.planWorkout = d => {
  const start = d.start || (d.id && String(d.id).includes(':') ? d.id : null) || (() => { const r = recommendations(d.d || today()); return r.sportSlot ? fromMin(r.sportSlot[0]) : fromMin(Math.round((nowMin() + 60) / 15) * 15); })();
  UI.draft = {type: d.type || (sportOn() ? 'auto' : 'visas'), date: d.d || d.date || today(), start, duration: +S.profile.workoutMin || 40};
  UI.draft.exercises = buildFor(UI.draft.type, UI.draft.duration);
  planModal();
};
A.openPlan = d => { const p = S.plans.find(x => x.id === d.id); if (!p) return; UI.draft = JSON.parse(JSON.stringify(p)); planModal(); };
function buildFor(type, minutes) { const w = WTYPES.find(x => x.id === type); return buildWorkout(w?.groups || suggestWorkout(minutes).focus, minutes); }
function syncDraft() { const f = $('#mform'); if (!f || !UI.draft) return; const o = formObj(f); if (o.date) UI.draft.date = o.date; if (o.start) UI.draft.start = o.start; if (o.duration) UI.draft.duration = +o.duration; }
function planModal() {
  const D = UI.draft, w = WTYPES.find(x => x.id === D.type), inPlan = new Set(D.exercises.flatMap(x => exercise(x.id)?.g || []));
  const neg = sportOn() ? neglected().filter(x => !inPlan.has(x.g)) : [];
  const exOpts = Object.keys(MUSCLES).map(g => [g, MUSCLES[g]]);
  modal(D.id ? 'Keisti treniruotę' : '📅 Suplanuoti treniruotę', `
    <div class="wtypes sm">${WTYPES.map(x => `<button type="button" class="wtype ${x.id === D.type ? 'on' : ''}" data-a="pType" data-t="${x.id}"><span>${x.emoji}</span>${x.name}</button>`).join('')}</div>
    <div class="row">${fld('Data', inp('date', D.date, 'date'))}${fld('Pradžia', inp('start', D.start, 'time'))}${fld('Trukmė (min)', inp('duration', D.duration, 'number', 'min="10" step="5"'))}</div>
    ${neg.length ? `<div class="warnbox"><b>⚠️ Seniai nedaryta:</b> ${neg.map(x => `<div class="negrow"><span>${MUSCLES[x.g]} <small>${x.days == null ? 'per 2 sav. nė karto' : x.days + ' d. nedaryta'}</small></span>${btn('+ Įtraukti', 'pAdd', {g: x.g}, 'sm')}${btn('Ne, nes…', 'reasonAsk', {g: x.g}, 'sm ghost')}</div>`).join('')}</div>` : ''}
    <h4>Pratimai ${w?.groups ? '' : `<small>(fokusas: ${suggestWorkout().focus.map(g => MUSCLES[g]).join(', ')})</small>`}</h4>
    <div class="plist">${D.exercises.map((x, i) => { const e = exercise(x.id); if (!e) return ''; return `<div class="pex"><div><b>${esc(e.name)}</b><small>${e.g.map(g => MUSCLES[g]).join(', ')}${x.mini ? ' · mini' : ''}</small></div>
      <div class="stepper">${btn('−', 'pReps', {i, n: e.sec ? -5 : -1}, 'sm')}<b>${x.sets.length} × ${x.sets[0]}${e.sec ? ' s' : ''}</b>${btn('+', 'pReps', {i, n: e.sec ? 5 : 1}, 'sm')}</div>
      <div>${btn('🔄', 'pSwap', {i}, 'sm')}${btn('✕', 'pDel', {i}, 'sm ghost')}</div></div>`; }).join('') || empty('Nėra pratimų')}</div>
    <div class="row addrow">${sel('addg', exOpts, '', 'id="addg"')}${btn('+ Pridėti pratimą', 'pAddSel', {}, 'sm')}</div>
    `,
    () => { syncDraft(); const D = UI.draft; D.status = 'planned';
      if (D.id) { const i = S.plans.findIndex(x => x.id === D.id); S.plans[i] = D; } else { D.id = uid(); S.plans.push(D); }
      UI.draft = null; commit(); toast(`📅 Suplanuota: ${fmtDate(D.date)} ${D.start}. Priminsiu 30 min prieš!`, 'good'); },
    {wide: true, submit: D.id ? 'Išsaugoti' : '✓ Patvirtinti', noFocus: true, extra: D.id ? btn('🗑', 'planDel', {id: D.id}, 'danger sm') : ''});
}
A.pType = d => { syncDraft(); UI.draft.type = d.t; UI.draft.exercises = buildFor(d.t, UI.draft.duration); planModal(); };
A.pReps = d => { syncDraft(); const x = UI.draft.exercises[+d.i]; x.sets = x.sets.map(r => Math.max(1, r + +d.n)); planModal(); };
A.pDel = d => { syncDraft(); UI.draft.exercises.splice(+d.i, 1); planModal(); };
A.pSwap = d => {
  syncDraft(); const x = UI.draft.exercises[+d.i], e = exercise(x.id), g = e.g[0];
  const opts = EXERCISES.filter(o => o.g.includes(g) && !UI.draft.exercises.some(y => y.id === o.id));
  if (!opts.length) return toast('Kitų pratimų šiai grupei nėra');
  const n = opts[(opts.findIndex(o => o.lvl >= e.lvl) + 1) % opts.length] || opts[0];
  UI.draft.exercises[+d.i] = {id: n.id, sets: targetSets(n)}; planModal();
};
A.pAdd = d => { syncDraft(); const ex = pickExercise(d.g, UI.draft.exercises.map(x => exercise(x.id))); if (ex) UI.draft.exercises.push({id: ex.id, sets: targetSets(ex)}); planModal(); };
A.pAddSel = () => { const g = $('#addg').value; A.pAdd({g}); };
A.planDel = d => { S.plans = S.plans.filter(x => x.id !== d.id); A.closeModal(); commit(); };
A.planSkip = d => { const p = S.plans.find(x => x.id === d.id); p.status = 'skipped'; commit(); toast('Praleista. Nieko tokio – kitą kartą! 💪'); };

// Priežastis, kodėl grupė praleidžiama
A.reasonAsk = d => {
  const back = UI.draft ? 'plan' : 'review'; UI.reasonBack = back;
  modal(`Kodėl ne ${MUSCLES[d.g].toLowerCase()}?`, `<div class="choice">${SKIP_REASONS.map(r => btn(`${r.emoji} ${r.name}`, 'reasonSet', {g: d.g, r: r.id}, 'big')).join('')}</div>`);
};
A.reasonSet = d => {
  const r = SKIP_REASONS.find(x => x.id === d.r), used = [...new Set(S.workouts.flatMap(w => (w.exercises || []).map(x => x.id)).filter(id => exercise(id)?.g.includes(d.g)))];
  S.sportPrefs[d.g] = {reason: d.r, date: today(), used}; commit({noRender: true});
  modal('Supratau 👍', `<p><b>${MUSCLES[d.g]}:</b> ${r.fix}</p><div class="choice row">${btn('Gerai', UI.reasonBack === 'plan' && UI.draft ? 'backToPlan' : 'sportReview', {}, 'primary')}</div>`);
};
A.backToPlan = () => planModal();

// ---------- Treniruotės režimas ----------
A.startPlan = async d => {
  const p = S.plans.find(x => x.id === d.id); if (!p) return;
  if (S.active && !await ask('Pradėti naują treniruotę?', 'Jau vyksta kita treniruotė – ji bus nutraukta.', {icon: '🏋️', yes: 'Pradėti naują'})) return;
  S.active = {planId: p.id, type: p.type, date: today(), start: nowHM(), ts: Date.now(), ex: p.exercises.map(x => ({id: x.id, reps: [...x.sets], done: x.sets.map(() => false)}))};
  commit({noRender: true}); render(); A.workoutMode();
};
let REST_UNTIL = 0;
function tickRest() {
  const el = $('#rest'); if (!el) return;
  const s = Math.ceil((REST_UNTIL - Date.now()) / 1000);
  if (s > 0) { el.textContent = `⏸ Poilsis ${s} s`; el.className = 'rest on'; }
  else if (REST_UNTIL) { el.textContent = '💥 Kita serija!'; el.className = 'rest go'; if (s === 0) { try { navigator.vibrate?.(300); } catch (e) {} } if (s < -5) { REST_UNTIL = 0; el.className = 'rest'; el.textContent = ''; } }
}
A.workoutMode = () => {
  const a = S.active; if (!a) return;
  const doneN = sum(a.ex.map(x => x.done.filter(Boolean).length)), allN = sum(a.ex.map(x => x.done.length));
  modal(`🏋️ ${esc(wtypeName(a.type))}`, `<div class="wm-top"><div class="bigclock wClock">${clock(a.ts)}</div><div id="rest" class="rest"></div>
    <div class="pbar big"><i style="width:${allN ? doneN / allN * 100 : 0}%;background:#22c55e"></i></div><small>${doneN} / ${allN} serijų</small></div>
    ${a.ex.map((x, i) => { const e = exercise(x.id); return `<div class="wm-ex ${x.done.every(Boolean) ? 'fin' : ''}"><div class="wm-h"><b>${esc(e.name)}</b>${btn('−', 'wAdj', {i, n: e.sec ? -5 : -1}, 'sm')}${btn('+', 'wAdj', {i, n: e.sec ? 5 : 1}, 'sm')}</div>
      <small class="hint">${esc(e.how)}</small>
      <div class="sets">${x.reps.map((r, j) => `<button type="button" class="set ${x.done[j] ? 'on' : ''}" data-a="wSet" data-i="${i}" data-j="${j}">${x.done[j] ? '✓ ' : ''}${r}${e.sec ? ' s' : ''}</button>`).join('')}</div></div>`; }).join('')}
    <p class="hint">Paspausk seriją, kai ją padarai.</p>
    <div class="choice row">${btn('🏁 Baigti treniruotę', 'wFinish', {}, 'primary')}${btn('Atšaukti', 'wCancel', {}, 'sm ghost')}</div>`, null, {wide: true});
  tickRest();
};
A.wSet = d => { const x = S.active.ex[+d.i]; x.done[+d.j] = !x.done[+d.j]; if (x.done[+d.j]) REST_UNTIL = Date.now() + 60000; commit({noRender: true}); A.workoutMode(); };
A.wAdj = d => { const x = S.active.ex[+d.i]; x.reps = x.reps.map((r, j) => x.done[j] ? r : Math.max(1, r + +d.n)); commit({noRender: true}); A.workoutMode(); };
A.wCancel = async () => { if (!await ask('Atšaukti treniruotę?', 'Niekas nebus įrašyta.', {danger: true, yes: 'Atšaukti treniruotę', no: 'Tęsti'})) return; S.active = null; REST_UNTIL = 0; A.closeModal(); commit(); };
A.wFinish = async () => {
  const a = S.active, done = a.ex.map(x => ({id: x.id, sets: x.reps.filter((_, j) => x.done[j])})).filter(x => x.sets.length);
  if (!done.length && !await ask('Įrašyti visas serijas?', 'Nepažymėjai nė vienos serijos. Įrašyti visas kaip padarytas?', {icon: '✅', yes: 'Įrašyti visas'})) return;
  const exercises = done.length ? done : a.ex.map(x => ({id: x.id, sets: x.reps}));
  const duration = Math.max(1, Math.round((Date.now() - a.ts) / 60000));
  S.workouts.push({id: uid(), date: a.date, start: a.start, duration, exercises, type: a.type, feel: 4});
  const p = S.plans.find(x => x.id === a.planId); if (p) p.status = 'done';
  S.active = null; REST_UNTIL = 0; A.closeModal(); confetti(); toast(`${pick(MOTIVATION.workoutDone)} ${duration} min · +25 XP`, 'good'); commit();
  setTimeout(() => A.addWell({ctx: 'workout'}), 900);
};
A.planDone = d => {
  const p = S.plans.find(x => x.id === d.id); if (!p) return;
  S.workouts.push({id: uid(), date: p.date, start: p.start, duration: +p.duration || 40, exercises: p.exercises.map(x => ({id: x.id, sets: [...x.sets]})), type: p.type, feel: 4});
  p.status = 'done'; confetti(); toast(pick(MOTIVATION.workoutDone) + ' +25 XP', 'good'); commit();
};

// ---------- 2 savaičių apžvalga ----------
function sportReviewDue() {
  if (S.workouts.length < 3) return false;
  const last = (S.sportReviews || []).map(r => r.date).sort().pop();
  return !last || diffDays(last, today()) >= 14;
}
A.sportReview = () => {
  const t = today(), cur = muscleVolume(addDays(t, -13), t), prev = muscleVolume(addDays(t, -27), addDays(t, -14)), neg = neglected();
  const gs = Object.keys(MUSCLES).filter(g => g !== 'kar' && (cur[g] || prev[g] || ['kru', 'nug', 'pec', 'ket', 'sed', 'uzp', 'pre', 'bic', 'tri'].includes(g)));
  const max = Math.max(1, ...gs.map(g => Math.max(cur[g] || 0, prev[g] || 0)));
  const ws = S.workouts.filter(w => w.date > addDays(t, -14)), wp = S.workouts.filter(w => w.date > addDays(t, -28) && w.date <= addDays(t, -14));
  modal('📊 2 savaičių sporto apžvalga', `<div class="stats3"><div><b>${ws.length}</b><small>treniruotės (anksčiau ${wp.length})</small></div><div><b>${sum(ws.map(w => +w.duration || 0))}</b><small>minučių (anksčiau ${sum(wp.map(w => +w.duration || 0))})</small></div><div><b class="${neg.length ? 'red' : 'green'}">${neg.length}</b><small>apleistos grupės</small></div></div>
    <h4>Serijos pagal raumenis <small>(žalia – dabar, pilka – prieš tai buvusios 2 sav.)</small></h4>
    ${gs.map(g => `<div class="vrow ${neg.some(x => x.g === g) ? 'neg' : ''}"><span>${MUSCLES[g]}</span><div class="vb"><i style="width:${(cur[g] || 0) / max * 100}%"></i><i class="p" style="width:${(prev[g] || 0) / max * 100}%"></i></div><small>${round(cur[g] || 0)}</small></div>`).join('')}
    ${neg.length ? `<h4>Ką praleidai – ir kodėl?</h4>${neg.map(x => { const pr = S.sportPrefs[x.g]; const r = pr && SKIP_REASONS.find(y => y.id === pr.reason); return `<div class="negrow"><span><b>${MUSCLES[x.g]}</b> <small>${x.days == null ? 'nė karto' : x.days + ' d.'}${r ? ` · ${r.emoji} ${r.name}` : ''}</small></span>${btn(r ? 'Keisti' : 'Pasakyk kodėl', 'reasonAsk', {g: x.g}, 'sm')}${btn('+ Kitą kartą', 'reasonSet', {g: x.g, r: 'pamirsau'}, 'sm ghost')}</div>`; }).join('')}` : '<p class="green">✅ Visos pagrindinės grupės treniruotos – puikus balansas!</p>'}
    <div class="choice row">${btn('Uždaryti apžvalgą', 'reviewDone', {}, 'primary')}</div>`, null, {wide: true});
};
A.reviewDone = () => { S.sportReviews.push({date: today(), neglected: neglected().map(x => x.g)}); A.closeModal(); commit(); };
A.sportTab = d => { UI.sport = d.v; render(); };
A.showSuggested = () => { A.closeModal(); UI.view = 'sport'; UI.sport = 'overview'; render(); };
A.addWorkout = d => workoutModal(null, d);
A.viewWorkout = d => workoutModal(S.workouts.find(w => w.id === d.id));
function workoutModal(w, d = {}) {
  const exs = w ? w.exercises : d.sug ? suggestWorkout().list.map(x => ({id: x.id, sets: []})) : [{id: '', sets: []}, {id: '', sets: []}, {id: '', sets: []}];
  const exOpts = [['', '— pasirink pratimą —'], ...Object.keys(MUSCLES).flatMap(g => EXERCISES.filter(e => e.g[0] === g).map(e => [e.id, `${MUSCLES[g]} · ${e.name}`]))];
  const row = x => `<div class="exrow">${sel('ex[]', exOpts, x.id)}${inp('sets[]', (x.sets || []).join(', '), 'text', 'placeholder="pvz. 12, 10, 10"')}<button type="button" class="x" onclick="this.parentNode.remove()">✕</button></div>`;
  modal(w ? 'Treniruotė' : 'Įrašyti treniruotę', `<div class="row">${fld('Data', inp('date', w?.date || d.date || today(), 'date'))}${fld('Pradžia', inp('start', w?.start || d.start || nowHM(), 'time'))}${fld('Trukmė (min)', inp('duration', w?.duration || S.profile.workoutMin, 'number', 'min="1"'))}</div>
    <h4>Pratimai ir serijos <small>(pakartojimai arba sekundės per kablelį)</small></h4><div id="exs">${exs.map(row).join('')}</div>
    <button type="button" class="btn sm" onclick="document.getElementById('exs').insertAdjacentHTML('beforeend', ${esc(JSON.stringify(row({id: ''})))})">+ pratimas</button>
    ${fld('Savijauta', sel('feel', [[3, '😐 Normaliai'], [5, '🔥 Super'], [4, '🙂 Gerai'], [2, '😮‍💨 Sunku'], [1, '😩 Labai sunku']], w?.feel || 3))}
    ${fld('Pastaba', inp('note', w?.note || ''))}`, o => {
    const exercises = (o.ex || []).map((id, i) => ({id, sets: (o.sets[i] || '').split(/[,\s]+/).map(Number).filter(n => n > 0)})).filter(x => x.id);
    const x = {date: o.date, start: o.start, duration: +o.duration || 30, exercises, feel: +o.feel, note: o.note};
    if (w) Object.assign(w, x); else { S.workouts.push({id: uid(), ...x}); confetti(); toast(pick(MOTIVATION.workoutDone) + ' +25 XP', 'good'); }
    commit();
  }, {wide: true, extra: w ? btn('🗑', 'delWorkout', {id: w.id}, 'danger sm') : ''});
}
A.delWorkout = async d => { if (!await ask('Ištrinti treniruotę?', '', {danger: true, icon: '🗑️', yes: 'Ištrinti'})) return; S.workouts = S.workouts.filter(w => w.id !== d.id); A.closeModal(); commit(); };

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
  const delta = (a, b, good) => { if (!b) return ''; const x = round((a - b) / 60, 1); if (!x) return ''; const up = x > 0; return `<em class="${up === good ? 'green' : 'red'}">${up ? '▲' : '▼'} ${Math.abs(x)} val</em>`; };
  const sleepBars = days.map(d => { const s = sleepOn(d); return {label: mode === 'week' ? DOW[dow(d) - 1] : parseD(d).getDate() + '', segs: [{v: s ? round(sleepMinutes(s) / 60, 1) : 0, color: '#06b6d4', name: 'miegas val'}]}; });
  return `<div class="toolbar"><div class="seg">${[['day', 'Diena'], ['week', 'Savaitė'], ['month', 'Mėnuo']].map(([m, l]) => `<button class="${mode === m ? 'on' : ''}" data-a="timeMode" data-m="${m}">${l}</button>`).join('')}</div>
    <div class="navd">${btn('‹', 'timeNav', {n: -1}, 'sm')}<b>${title}</b>${btn('›', 'timeNav', {n: 1}, 'sm')}</div>${btn('+ Ką veikiau', 'addLog', {date: mode === 'day' ? T.date : today()}, 'primary sm')}</div>
  ${card('⏱️ Greitas laikmatis', `<div class="catgrid sm">${S.categories.map(c => `<button class="catbtn ${S.timer?.cat === c.id ? 'on' : ''}" style="--c:${c.color}" data-a="${S.timer?.cat === c.id ? 'timerStop' : 'timerStart'}" data-cat="${c.id}">${c.emoji}<span>${esc(c.name)}</span></button>`).join('')}</div>`)}
  <div class="stats3"><div><b class="green">${fmtH(prod)}</b><small>produktyvu ${delta(prod, prev.prod, true)}</small></div><div><b class="red">${fmtH(screen)}</b><small>ekranai ir serialai ${delta(screen, prev.screen, false)}</small></div><div><b>${n > 1 ? fmtH(prod / Math.max(1, days.filter(d => d <= today()).length)) : fmtH(prod)}</b><small>produktyvu per dieną (vid.)</small></div></div>
  <div class="grid2"><div>
    ${n > 1 ? card('Laikas pagal dienas', svgBars(bars, {h: 220, fmt: v => round(v / 60, 1) + 'h'}) + '') : card('Dienos laiko juosta', timeline(T.date, {scale: 0.6}))}
    ${card('😴 Miegas', n > 1 ? svgBars(sleepBars, {h: 150, goal: +p.sleepGoal || 8, fmt: v => round(v, 1)}) : (sleepOn(T.date) ? `<p>${sleepOn(T.date).bed} → ${sleepOn(T.date).wake} · <b>${round(sleepMinutes(sleepOn(T.date)) / 60, 1)} val</b></p>` : empty('Neįrašyta')), btn('+ Miegas', 'addSleep', {}, 'sm'))}
  </div><div>
    ${card('Kur dingo laikas', `<div class="donutw">${svgDonut(segs, fmtH(sum(segs.map(s => s.v))), 'iš viso')}<div class="leg">${segs.map(s => `<div><i style="background:${s.color}"></i>${cat(s.c).emoji} ${esc(s.name)}<span class="sp"></span><b>${fmtDur(s.v)}</b></div>`).join('') || empty('Nėra įrašų')}</div></div>`)}
    ${mode === 'day' ? card('Įrašai', timelogOn(T.date).map(t => `<div class="li click" data-a="editLog" data-id="${t.id}">${cat(t.cat).emoji} <b>${t.start}–${t.end}</b> ${esc(cat(t.cat).name)} <small>${esc(t.note || '')}</small></div>`).join('') || empty('Nėra rankinių įrašų')) : ''}
  </div></div>`;
}
A.timeMode = d => { UI.time.mode = d.m; render(); };
A.timeNav = d => { const T = UI.time; T.date = T.mode === 'day' ? addDays(T.date, +d.n) : T.mode === 'week' ? addDays(T.date, 7 * d.n) : (() => { const x = parseD(T.date); x.setDate(1); x.setMonth(x.getMonth() + +d.n); return ymd(x); })(); render(); };
A.timeDay = d => { UI.view = 'time'; UI.time = {mode: 'day', date: d.d}; render(); };
function logForm(t) {
  return `<div class="row">${fld('Data', inp('date', t.date, 'date'))}${fld('Nuo', inp('start', t.start, 'time', 'required'))}${fld('Iki', inp('end', t.end, 'time', 'required'))}</div>
  ${fld('Ką veikei?', `<div class="catgrid sm radio">${S.categories.map(c => `<label class="catbtn" style="--c:${c.color}"><input type="radio" name="cat" value="${c.id}" ${t.cat === c.id ? 'checked' : ''} required>${c.emoji}<span>${esc(c.name)}</span></label>`).join('')}</div>`)}
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
  modal('😴 Miegas', `<p class="hint">Data – diena, kurią pabudai.</p><div class="row">${fld('Data', inp('date', s.date, 'date'))}${fld('Užmigau', inp('bed', s.bed, 'time'))}${fld('Pabudau', inp('wake', s.wake, 'time'))}</div>
    ${fld('Kokybė', `<div class="emo">${['😫', '😕', '😐', '🙂', '😁'].map((e, i) => `<label><input type="radio" name="q" value="${i + 1}" ${+s.q === i + 1 ? 'checked' : ''}><span>${e}</span></label>`).join('')}</div>`)}`, o => {
    S.sleep = S.sleep.filter(x => x.date !== o.date); S.sleep.push({date: o.date, bed: o.bed, wake: o.wake, q: +o.q || 3}); commit();
    const h = sleepMinutes(o) / 60; toast(h >= (+S.profile.sleepGoal || 8) - 0.5 ? `😴 ${round(h, 1)} val – puikiai išsimiegojai!` : `😴 ${round(h, 1)} val – šiandien gulkis anksčiau`, h >= 7 ? 'good' : '');
  }, {noFocus: true});
};

// ================= PROGRESAS =================
function vProgress() {
  const p = S.profile, tg = targets(), g = gamification();
  const ws = [...S.weights].sort((a, b) => a.date < b.date ? -1 : 1);
  const d0 = ws.length ? ws[0].date : today();
  const pts = ws.map(w => [diffDays(d0, w.date), +w.kg, fmtDate(w.date)]);
  const waist = ws.filter(w => +w.waist).map(w => [diffDays(d0, w.date), +w.waist, fmtDate(w.date)]);
  const series = [{points: pts, color: '#4f8cff', area: true}];
  if (+p.targetWeight && pts.length) series.push({points: [[pts[0][0], +p.targetWeight], [pts[pts.length - 1][0] || 1, +p.targetWeight]], color: '#22c55e', dashed: true, dots: false, width: 1.5});
  const xl = pts.length ? [[pts[0][0], fmtDate(ws[0].date)], [pts[pts.length - 1][0], fmtDate(ws[ws.length - 1].date)]] : [];
  const cw = currentWeight(), start = +p.startWeight || (ws[0]?.kg ?? cw), trend = weightTrend();
  const toGo = +p.targetWeight ? round(cw - +p.targetWeight, 1) : null;
  const eta = trend && trend < -0.05 && toGo > 0 ? addDays(today(), Math.round(toGo / -trend * 7)) : null;
  const wsT = weekStart(today()), thisW = periodStats(wsT, 7), lastW = periodStats(addDays(wsT, -7), 7);
  const ms = monthStart(today()), thisM = periodStats(ms, daysInMonth(ms)), pm = monthStart(addDays(ms, -1)), lastM = periodStats(pm, daysInMonth(pm));
  const scores = range(addDays(today(), -29), 30).map(d => { const s = dayScore(d); return {label: parseD(d).getDate() + '', segs: [{v: s ? s.score : 0, color: scoreColor(s?.score), name: 'balas'}], click: {a: 'calDay', d}}; });
  const doneW = S.checkins.some(c => c.type === 'week' && (c.period || periodKey('week', c.date)) === periodKey('week', today())), doneM = S.checkins.some(c => c.type === 'month' && (c.period || periodKey('month', c.date)) === periodKey('month', today()));
  return `<div class="toolbar">${sportOn() || foodOn() || S.weights.length ? btn('⚖️ Pasisverti', 'addWeight', {}, 'primary') : ''}${btn(`🪞 Savaitės patikrinimas${doneW ? ' ✓' : ''}`, 'checkin', {t: 'week'})}${btn(`📆 Mėnesio patikrinimas${doneM ? ' ✓' : ''}`, 'checkin', {t: 'month'})}</div>
  <div class="stats4"><div><b>${cw || '–'} kg</b><small>dabar</small></div><div><b class="${start - cw > 0 ? 'green' : ''}">${start && cw ? (cw - start > 0 ? '+' : '') + round(cw - start, 1) : '–'} kg</b><small>nuo pradžios</small></div>
    <div><b>${toGo != null ? toGo + ' kg' : '–'}</b><small>iki tikslo${eta ? ` · ~${fmtDate(eta)}` : ''}</small></div><div><b>${trend != null ? (trend > 0 ? '+' : '') + round(trend, 2) : '–'}</b><small>kg/sav. tendencija</small></div></div>
  <div class="grid2"><div>
    ${card('⚖️ Svoris', svgLine(series, {xLabels: xl, h: 220}) + ``)}
    ${card('📏 Liemens apimtis', waist.length ? svgLine([{points: waist, color: '#a78bfa', area: true}], {h: 160}) + '' : empty('Sverdamasis įrašyk ir liemens apimtį (cm, ties bambos aukščiu).'))}
    ${card('📅 Dienos balas per 30 d.', svgBars(scores, {h: 150}))}
  </div><div>
    ${reportCard('🪞 Ši savaitė vs praeita', thisW, lastW)}
    ${reportCard('📆 Šis mėnuo vs praeitas', thisM, lastM)}
    ${card(`⭐ ${g.level} lygis · ${g.xp} XP`, `<div class="xpb"><i style="width:${(g.xp - g.cur) / (g.next - g.cur) * 100}%"></i></div><div class="badges">${g.badges.map(([e, n, dsc, ok]) => `<div class="badge ${ok ? 'on' : ''}" title="${esc(dsc)}"><span>${e}</span><b>${esc(n)}</b><small>${esc(dsc)}</small></div>`).join('')}</div>`)}
    ${card('📝 Patikrinimų istorija', S.checkins.length ? [...S.checkins].reverse().map(c => `<div class="li click" data-a="viewCheckin" data-id="${c.id}">${c.type === 'week' ? '🪞' : '📆'} <b>${fmtDate(c.date)}</b> <small>${c.weight ? c.weight + ' kg · ' : ''}nuotaika ${['', '😫', '😕', '😐', '🙂', '😁'][c.mood] || ''} · ${esc((c.focus || '').slice(0, 50))}</small></div>`).join('') : empty('Dar nebuvo patikrinimų.'))}
    ${card('Svorio įrašai', ws.length ? [...ws].reverse().slice(0, 10).map(w => `<div class="li">${fmtDate(w.date)} <b>${w.kg} kg</b>${w.waist ? ` <small>· ${w.waist} cm</small>` : ''}<span class="sp"></span><button class="x" data-a="delWeight" data-date="${w.date}">✕</button></div>`).join('') : empty('Nėra įrašų'))}
  </div></div>`;
}
function reportCard(title, a, b) {
  const row = (label, va, vb, fmt, goodUp) => { let ar = ''; if (va != null && vb != null && Math.abs(va - vb) > 0.01) { const up = va > vb; ar = `<em class="${up === goodUp ? 'green' : 'red'}">${up ? '▲' : '▼'}</em>`; } return `<tr><td>${label}</td><td><b>${va != null ? fmt(va) : '–'}</b> ${ar}</td><td>${vb != null ? fmt(vb) : '–'}</td></tr>`; };
  const pd = x => x.days ? x.prod / x.days : null, sd = x => x.days ? x.screen / x.days : null;
  return card(title, `<table class="tbl rep"><thead><tr><th></th><th>Dabar</th><th>Anksčiau</th></tr></thead><tbody>
    ${row('Produktyvu / d.', pd(a), b.days ? pd(b) : null, v => fmtH(v), true)}
    ${row('Ekranai / d.', sd(a), b.days ? sd(b) : null, v => fmtDur(v), false)}
    ${row('Miegas (vid.)', a.avgSleep, b.avgSleep, v => round(v / 60, 1) + ' val', true)}
    ${row('Treniruotės', a.workouts, b.workouts, v => v, true)}
    ${row('Kalorijos (vid.)', a.avgKcal, b.avgKcal, v => Math.round(v), false)}
    ${row('Baltymai (vid.)', a.avgProtein, b.avgProtein, v => Math.round(v) + ' g', true)}
    ${row('Atliktos užduotys', a.tasksDone, b.tasksDone, v => v, true)}
    ${row('Dienos balas (vid.)', a.avgScore, b.avgScore, v => Math.round(v), true)}
    ${row('Svoris (pab.)', a.weightEnd, b.weightEnd, v => v + ' kg', false)}</tbody></table>
    ${a.spendTotal ? `<p class="hint">🧾 Maistui pagal čekius: <b>${a.spendTotal.toFixed(2)} €</b>${a.snackSpend ? `, iš jų užkandžiams ${a.snackSpend.toFixed(2)} € (${Math.round(a.snackSpend / a.spendTotal * 100)}%)` : ''}.</p>` : ''}`);
}
A.addWeight = () => {
  const last = [...S.weights].sort((a, b) => a.date < b.date ? -1 : 1).pop();
  modal('⚖️ Svoris', `<p class="hint">Geriausia sverti ryte, po tualeto, prieš valgį – kas savaitę tą pačią dieną.</p><div class="row">${fld('Data', inp('date', today(), 'date'))}${fld('Svoris (kg)', inp('kg', last?.kg || S.profile.startWeight, 'number', 'step="0.1" required'))}${fld('Liemuo (cm, nebūtina)', inp('waist', '', 'number', 'step="0.5"'))}</div>`, o => {
    const prev = currentWeight();
    S.weights = S.weights.filter(w => w.date !== o.date); S.weights.push({date: o.date, kg: +o.kg, waist: +o.waist || null});
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
    if (+o.weight) { S.weights = S.weights.filter(w => w.date !== td.date); S.weights.push({date: td.date, kg: +o.weight, waist: +o.waist || null}); }
    if (o.focus) S.notes.unshift({id: uid(), title: `🎯 ${o.focus}`, body: `${isW ? 'Savaitės' : 'Mėnesio'} tikslas nuo ${fmtDate(td.date)}.${o.wins ? `\n\nKas pavyko: ${o.wins}` : ''}`, updated: Date.now(), pinned: true});
    confetti(); toast(td.verified ? 'Išsaugota · +30 XP' : 'Išsaugota', 'good'); commit();
  }, {wide: true, submit: 'Išsaugoti'});
};
A.viewCheckin = d => { const c = S.checkins.find(x => x.id === d.id); modal(`${c.type === 'week' ? 'Savaitės' : 'Mėnesio'} patikrinimas · ${fmtDate(c.date)}`, `<div class="kv"><span>Svoris</span><b>${c.weight || '–'} kg</b><span>Liemuo</span><b>${c.waist || '–'} cm</b><span>Nuotaika / energija / produkt.</span><b>${[c.mood, c.energy, c.prod].map(v => ['', '😫', '😕', '😐', '🙂', '😁'][v] || '–').join(' ')}</b></div><h4>Kas pavyko</h4><p>${esc(c.wins) || '–'}</p><h4>Ką keisti</h4><p>${esc(c.improve) || '–'}</p><h4>Tikslas</h4><p>${esc(c.focus) || '–'}</p>`); };

// ================= UŽRAŠAI =================
function vNotes() {
  const notes = [...S.notes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.updated - a.updated);
  const cur = S.notes.find(n => n.id === UI.noteId) || notes[0];
  return `<div class="notes"><div class="nlist">${btn('+ Naujas užrašas', 'addNote', {}, 'primary')}${notes.map(n => `<div class="ni ${cur && n.id === cur.id ? 'on' : ''}" data-a="openNote" data-id="${n.id}"><b>${n.pinned ? '📌 ' : ''}${esc(n.title || 'Be pavadinimo')}</b><small>${esc((n.body || '').slice(0, 60))}</small></div>`).join('')}</div>
    <div class="ned">${cur ? `<div class="row"><input class="ntitle" value="${esc(cur.title)}" data-note="title" placeholder="Pavadinimas">${btn(cur.pinned ? '📌' : '📍', 'pinNote', {id: cur.id}, 'sm')}${btn('🗑', 'delNote', {id: cur.id}, 'sm danger')}</div>
      <textarea class="nbody" data-note="body" placeholder="Rašyk čia… (išsaugoma automatiškai)">${esc(cur.body)}</textarea><small class="hint">Atnaujinta ${new Date(cur.updated).toLocaleString('lt-LT')}</small>` : empty('Užrašų dar nėra – mintys, idėjos, dienoraštis, sąrašai.')}</div></div>`;
}
A.addNote = () => { const n = {id: uid(), title: '', body: '', updated: Date.now()}; S.notes.push(n); UI.noteId = n.id; commit(); setTimeout(() => $('.ntitle')?.focus(), 50); };
A.openNote = d => { UI.noteId = d.id; render(); };
A.pinNote = d => { const n = S.notes.find(x => x.id === d.id); n.pinned = !n.pinned; commit(); };
A.delNote = async d => { if (!await ask('Ištrinti užrašą?', '', {danger: true, icon: '🗑️', yes: 'Ištrinti'})) return; S.notes = S.notes.filter(n => n.id !== d.id); UI.noteId = null; commit(); };

// ================= PROFILIS / NUSTATYMAI =================
// Profilio laukai – rodomi tik tie, kurių reikia pasirinktiems režimams
function profileFields(p, m = S.settings.modes) {
  const body = m.sport || m.food, req = body ? 'required' : '';
  return `<div class="row">${fld('Vardas', inp('name', p.name, 'text', 'placeholder="kaip į tave kreiptis"'))}</div>
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
  if (w && w !== currentWeight()) { S.weights = S.weights.filter(x => x.date !== today()); S.weights.push({date: today(), kg: w}); }
  if (!S.profile.startWeight) S.profile.startWeight = w;
}
function vSettings() {
  const tg = targets();
  const m = S.settings.modes;
  return `<div class="grid2"><div>${card('🧭 Kam naudoju programėlę', modeCards(m, 'setMode') + `<p class="hint">Gali keisti bet kada – įrašai niekur nedingsta.</p>`)}
  ${card('👤 Mano duomenys', `<form id="pform">${profileFields(S.profile)}<div class="choice row"><button class="btn primary" type="submit">Išsaugoti</button></div></form>`)}</div>
  <div>${(m.sport || m.food) && tg.missing.length ? card('📊 Tavo normos', `<p class="hint">Kalorijos ir baltymai apskaičiuojami <b>automatiškai</b>. Kad skaičiavimas būtų tikslus, kairėje įrašyk: <b>${esc(tg.missing.join(', '))}</b>.</p>`) : ''}
  ${m.sport || m.food ? card('📊 Tavo normos', `<div class="kv"><span>Kalorijų tikslas</span><b>${tg.kcal} kcal</b><span>Sudegini per dieną</span><b>~${tg.tdee} kcal</b><span>Baltymai</span><b>${tg.protein} g / d.</b><span>Vanduo</span><b>~${tg.water} l</b><span>KMI</span><b>${tg.bmi || '–'}</b></div>`) : ''}
  ${card('🕒 Laiko juosta', `${fld('Laikas skaičiuojamas pagal', sel('tz', [['', `Įrenginį (${deviceTZ() || '?'})`], ...TZ_OPTS], S.settings.tz, 'data-set="tz"'))}${S.settings.tz && deviceTZ() && S.settings.tz !== deviceTZ() ? `<p class="hint">Įrenginys šiuo metu rodo <b>${esc(deviceTZ())}</b> (gali būti dėl VPN) – programėlė naudoja tavo pasirinktą.</p>` : ''}`)}
  ${card('🪞 Patikrinimai', fld('Priminti apie apžvalgą', sel('review', [['week', 'Kas savaitę ir mėnesį'], ['month', 'Tik kas mėnesį'], ['off', 'Nepriminti']], S.settings.review, 'data-set="review"')))}
  ${card('🏷️ Veiklų kategorijos', S.categories.map((c, i) => `<div class="catrow"><input value="${esc(c.emoji)}" data-cat="${i}" data-k="emoji" maxlength="4"><input value="${esc(c.name)}" data-cat="${i}" data-k="name"><input type="color" value="${c.color}" data-cat="${i}" data-k="color">${sel('t', [[1, '✅ produktyvu'], [0, '⚪ neutralu'], [-1, '📺 ekranas/laisvalaikis']], c.type, `data-cat="${i}" data-k="type"`)}<button class="x" data-a="delCat" data-i="${i}">✕</button></div>`).join('') + btn('+ Kategorija', 'addCat', {}, 'sm'))}
  ${card('🔔 Priminimai', `<p>Naršyklės pranešimai: <b>${'Notification' in window ? ({granted: 'įjungti ✓', denied: 'užblokuoti', default: 'neįjungti'})[Notification.permission] : 'nepalaikoma'}</b></p>${btn('Įjungti pranešimus', 'enableNotif', {}, 'sm')} ${btn('📲 Eksportuoti į telefono kalendorių', 'exportIcs', {}, 'sm')}<p class="hint">Pranešimai veikia, kol programėlė atidaryta. Patikimiems priminimams telefone naudok kalendoriaus eksportą.</p>`)}
  ${cloudOn() ? card('👤 Paskyra', `<p>Prisijungęs kaip <b>${esc(Auth.user()?.email)}</b>. Duomenys saugomi debesyje ir sinchronizuojasi tarp įrenginių.</p>${btn('Atsijungti', 'logout', {}, 'sm danger')}`) : ''}
  ${privacyCard()}
  ${card('💬 Atsiliepimai', `<p>Radai klaidą ar turi idėją? Parašyk – pamatysiu.</p><div class="choice row">${btn('💬 Parašyti', 'feedback', {}, 'sm primary')}${btn('Mano pokalbiai', 'myFeedback', {}, 'sm')}</div>`)}
  ${card('🎨 Išvaizda', btn(S.settings.theme === 'dark' ? '☀️ Šviesi tema' : '🌙 Tamsi tema', 'theme', {}, 'sm'))}
  ${DEV ? card('🐞 Kūrėjo įrankiai', `<p class="hint">Dirbi su bandomaisiais duomenimis – tikri nepaliečiami ir niekur nesiunčiami. Išjungus 🐞 viskas grįš.</p>
    <div class="choice row">${btn('🧪 Užpildyti bandomaisiais', 'devSeed', {}, 'sm')}${btn('📋 Kopijuoti mano tikrus duomenis čia', 'devCopyReal', {}, 'sm')}${btn('♻️ Pradėti nuo nulio', 'devReset', {}, 'sm')}</div>
    <h4>Duomenys</h4><div class="choice row">${btn('⬇ Šių (bandomųjų) kopija', 'exportData', {}, 'sm')}${btn('⬇ Tikrų duomenų kopija', 'exportReal', {}, 'sm')}<label class="btn sm">⬆ Įkelti kopiją čia<input type="file" accept=".json" data-c="importData" hidden></label></div>
    <p class="hint">Rolė: ${ROLE} · ${cloudOn() ? 'debesis' : 'vietinis serveris'} · laiko juosta ${esc(appTZ())}</p>`) : ''}
  ${DEV ? versionsCard() + inboxCard() : ''}</div></div>`;
}
A.addCat = () => { S.categories.push({id: 'c_' + uid(), name: 'Nauja', emoji: '⭐', color: '#888888', type: 0}); commit(); };
A.delCat = async d => { if (!await ask('Ištrinti kategoriją?', 'Seni įrašai liks, bet be spalvos.', {danger: true, icon: '🗑️', yes: 'Ištrinti'})) return; S.categories.splice(+d.i, 1); commit(); };
A.enableNotif = async () => { if (!('Notification' in window)) return toast('Ši naršyklė nepalaiko pranešimų'); const r = await Notification.requestPermission(); toast(r === 'granted' ? 'Pranešimai įjungti 🔔' : 'Pranešimai neleisti'); render(); };
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
  ['sport', '💪', 'Sportas kasdienybėje', 'Pasiūlysiu, kada sportuoti, sudarysiu treniruotes, matysi progresą.'],
  ['food', '🍽️', 'Mityba', 'Kada ir ką valgyti pagal tikslą, receptai, kalorijos.'],
  ['track', '📝', 'Tiesiog sekti, ką veikiu', 'Kalendorius, laikas, užduotys, miegas – be didelių patarimų.'],
];
function modeCards(m, action) {
  const track = !m.sport && !m.food;
  return `<div class="modes">${MODE_INFO.map(([k, e, n, dsc]) => { const on = k === 'track' ? track : m[k]; return `<button type="button" class="modec ${on ? 'on' : ''}" data-a="${action}" data-k="${k}"><span>${e}</span><b>${n}</b><small>${dsc}</small>${on ? '<i>✓</i>' : ''}</button>`; }).join('')}</div>`;
}
// Pirmas paleidimas
A.onboard = () => { UI.ob = {sport: false, food: false}; obModal(); };
function obModal() {
  modal('👋 Sveikas! Kam naudosi Life Schedule?', `<p class="center">Gali pasirinkti kelis. Vėliau pakeisi nustatymuose.</p>${modeCards(UI.ob, 'obPick')}
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
    ? ['💪', 'Sportas', 'Čia gali įrašyti treniruotes ir matyti, kurias kūno dalis treniravai. Jei nori, programėlė pasiūlys, kada sportuoti, ir sudarys treniruotę.', 'Įjungti sporto rekomendacijas', 'Tik užsirašinėti treniruotes']
    : ['🍽️', 'Mityba', 'Čia gali įrašyti, ką valgai, laikyti receptus ir atsargas. Jei nori, programėlė pasiūlys, kada ir ką valgyti pagal tavo tikslą.', 'Įjungti mitybos rekomendacijas', 'Tik užsirašinėti, ką valgau'];
  return `<div class="intro"><div class="em">${t[0]}</div><h2>${t[1]}</h2><p>${t[2]}</p><div class="choice">${btn(t[3], 'enableMode', {k}, 'primary big')}${btn(t[4], 'introLog', {k}, 'big')}</div></div>`;
}

// ================= NAUJA VERSIJA: pranešimas ir „Kas naujo“ =================
const verNotes = v => ((window.RELEASES || {}).versions || []).find(x => x.v === v)?.notes || '';
const verOverride = () => { try { return localStorage.getItem('ls_ver_override'); } catch (e) { return null; } };
async function checkNewVersion() {
  if (window.CLOUD?.test || verOverride()) return;
  let rel = null; try { rel = await (await fetch('releases.json', {cache: 'no-cache'})).json(); } catch (e) { return; }
  let pub = rel.stable;
  if (cloudOn()) { try { const j = await (await fetch(`${CLOUD.url}/rest/v1/app_config?key=eq.stable&select=value`, {headers: {apikey: CLOUD.key}, cache: 'no-store'})).json(); if (j[0]?.value?.version) pub = j[0].value.version; } catch (e) {} }
  if (pub && pub !== window.APP_VERSION && rel.versions.some(x => x.v === pub)) { window.RELEASES = rel; if (UI.newVer !== pub) { UI.newVer = pub; render(); } }
}
function updateBanner() {
  if (!UI.newVer) return '';
  const n = verNotes(UI.newVer);
  return `<div class="banner update">✨ <div><b>Atsirado nauja versija ${esc(UI.newVer)}</b>${n ? `<br><small>${esc(n)}</small>` : ''}</div><span class="sp"></span>${btn('🔄 Atnaujinti', 'reloadApp', {}, 'sm primary')}</div>`;
}
A.reloadApp = () => location.reload();
// po atnaujinimo vieną kartą parodom, kas pasikeitė
function showWhatsNew() {
  if (window.CLOUD?.test || verOverride() || !window.APP_VERSION) return;
  let seen = null; try { seen = localStorage.getItem('ls_seen_ver'); localStorage.setItem('ls_seen_ver', window.APP_VERSION); } catch (e) { return; }
  if (seen && seen !== window.APP_VERSION) {
    const n = verNotes(window.APP_VERSION);
    modal(`✨ Kas naujo – versija ${esc(window.APP_VERSION)}`, `${n ? `<p>${esc(n)}</p>` : '<p>Programėlė atnaujinta.</p>'}<p class="hint">Radai klaidą? Spausk 💬 viršuje.</p>`);
  }
}

// ================= VERSIJOS (tik kūrėjui) =================
function versionsCard() {
  const rel = window.RELEASES || {versions: []}, cur = window.APP_VERSION, pub = window.PUBLIC_VERSION;
  const list = [...(window.CLOUD?.test ? [{v: 'src', date: '', notes: 'Darbinė kopija (tik testavimo serveryje)'}] : []), ...rel.versions];
  return card('🏷️ Versijos', `<p class="hint">Šiame lange: <b>${esc(cur)}</b>${cur !== pub ? ' (bandoma)' : ''} · Vieša: <b>${esc(pub || '–')}</b></p>
    ${list.map(x => `<div class="li"><b>${esc(x.v)}</b>${x.v === pub ? '<span class="tag">vieša</span>' : ''}${x.v === cur ? '<span class="tag warn">šiame lange</span>' : ''}<small>${esc(x.date || '')} ${esc(x.notes || '')}</small><span class="sp"></span>
      ${x.v !== cur ? btn('Išbandyti', 'tryVersion', {v: x.v}, 'sm') : ''}${x.v !== pub && x.v !== 'src' ? btn('🚀 Paleisti viešai', 'publishVersion', {v: x.v}, 'sm primary') : ''}</div>`).join('')}
    ${cur !== pub ? `<div class="choice row">${btn('↩ Grįžti į viešą versiją', 'tryVersion', {v: ''}, 'sm')}</div>` : ''}
    <p class="hint">„Išbandyti“ pakeičia versiją tik tavo naršyklėje. „Paleisti viešai“ – visiems, iškart. Seną versiją grąžinsi tuo pačiu mygtuku.</p>`);
}
A.tryVersion = d => { try { if (d.v && d.v !== window.PUBLIC_VERSION) { localStorage.setItem('ls_ver_override', d.v); localStorage.setItem('ls_ver_override_pub', window.PUBLIC_VERSION || ''); } else localStorage.removeItem('ls_ver_override'); } catch (e) {} location.reload(); };
A.publishVersion = async d => {
  if (!isDeveloper() || !await ask(`Paleisti ${esc(d.v)} viešai?`, 'Versija iškart atsiras visiems naudotojams.', {icon: '🚀', yes: 'Paleisti'})) return;
  try {
    await DB.upsert('app_config', {key: 'stable', value: {version: d.v}, updated_at: new Date().toISOString(), ...(cloudOn() ? {updated_by: DB.uid()} : {})}, 'key');
    window.PUBLIC_VERSION = d.v; render(); toast(`🚀 Versija ${d.v} dabar vieša`, 'good');
  } catch (e) { toast('⚠️ Nepavyko: ' + esc(e.message)); }
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
  modal('💬 Atsiliepimas', `<div class="chips">${FB_KINDS.map(([k, e, n]) => `<button type="button" class="chipbtn ${UI.fbKind === k ? 'on' : ''}" data-a="fbKind" data-k="${k}">${e} ${n}</button>`).join('')}</div>
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
        ${t.msgs.map(m => `<div class="fbmsg ${isTeam(m) ? 'agent' : 'me'}"><small>${isTeam(m) ? '🎧 Life Schedule komanda' : 'Tu'} · ${new Date(m.created_at).toLocaleString('lt-LT', {dateStyle: 'short', timeStyle: 'short', timeZone: appTZ() || undefined})}</small>${m.body === '📎' ? '' : esc(m.body)}${(m.attachments || []).map(a => `<a class="fbatt" data-a="openAtt" data-p="${esc(a.path)}">📎 ${esc(a.name)}</a>`).join('')}</div>`).join('')}
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
    if (r.kind === 'profile') {
      if (p.name != null && String(p.name).trim()) { S.profile.name = String(p.name).trim().slice(0, 60); prof = true; }
      if (p.birthYear != null && +p.birthYear > 1900) { S.profile.birthYear = +p.birthYear; prof = true; }
    }
  }
  commit();
  for (const r of rows) DB.update('account_adjustments', `id=eq.${r.id}`, {applied: true, applied_at: new Date().toISOString()}).catch(() => {});
  const tot = sum(xp.map(x => x.n));
  if (tot > 0) await ask(`🎁 Gavai +${tot} XP!`, xp.map(x => x.reason ? `<p>${esc(x.reason)}</p>` : '').join('') || '<p>Dovana nuo Life Schedule komandos.</p>', {icon: '⭐', yes: 'Ačiū!', no: false});
  else if (tot < 0) await info('XP pataisyti', `<p>Tavo XP pakeisti: <b>${tot}</b>.</p>${xp.map(x => x.reason ? `<p>${esc(x.reason)}</p>` : '').join('')}`);
  if (prof) toast('👤 Komanda atnaujino tavo profilį', 'good');
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
  const bub = x => `<div class="fbmsg ${isTeam(x) ? 'agent' : 'me'}"><small>${isTeam(x) ? '🎧 Life Schedule komanda' : 'Tu'}</small>${x.body === '📎' ? '' : esc(x.body)}</div>`;
  const r = await ask('✅ Tavo klausimas išspręstas', `<div class="replypop">${mine ? bub(mine) : ''}${team.map(bub).join('')}</div><p class="muted">${esc(caseName(t))}</p>`, {icon: '🎧', yes: 'Problema išspręsta', no: 'Rašyti daugiau', backdrop: 'later'});
  markRepliesSeen(list); markSolvedSeen([t.id]);
  if (r === true) {
    try { await DB.rpc('customer_close_case', {tid: t.id}); } catch (e) { return toast('⚠️ Nepavyko'); }
    await ratePopup(t);
  } else if (r === false) await A.fbMore({id: t.id});
}
function ratePopup(t) {
  return new Promise(res => {
    const el = document.createElement('div'); el.className = 'askov';
    el.innerHTML = `<div class="askbox" role="dialog" aria-modal="true"><div class="askic">💙</div><h3>Kaip vertini mūsų pagalbą?</h3><div class="asktxt">${rateRow(t).replace('<b>Kaip vertini mūsų pagalbą?</b>', '')}</div>
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
  const bub = x => `<div class="fbmsg ${isTeam(x) ? 'agent' : 'me'}"><small>${isTeam(x) ? '🎧 Life Schedule komanda' : 'Tu'}</small>${x.body === '📎' ? '' : esc(x.body)}${(x.attachments || []).length ? `<small>📎 Prisegta failų: ${x.attachments.length}</small>` : ''}</div>`;
  const others = fresh.length - newIds.length;
  const open = await ask('💬 Gavai atsakymą!', `<div class="replypop">${mine ? bub(mine) : ''}${t.msgs.filter(x => newIds.includes(x.id)).map(bub).join('')}${others ? `<small>Ir dar ${others} nauj${others === 1 ? 'as atsakymas' : 'i atsakymai'} kituose pokalbiuose</small>` : ''}</div>`, {icon: '🎧', yes: 'Atidaryti pokalbį', no: 'Gerai'});
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
  if (!INBOX.loaded) return card('📥 Gautieji', `<p class="hint">Neužkrauta. Ar Supabase'e paleistas 03 SQL failas?</p>${btn('Atnaujinti', 'inboxRefresh', {}, 'sm')}`);
  const fb = [...INBOX.fb].sort((a, b) => (b.urgent - a.urgent) || ((a.status === 'done') - (b.status === 'done')) || (a.created_at < b.created_at ? 1 : -1));
  const open = INBOX.req.filter(r => !['sent', 'done', 'cancelled'].includes(r.status)), closed = INBOX.req.filter(r => ['sent', 'done', 'cancelled'].includes(r.status)).slice(0, 5);
  const daysLeft = r => diffDays(today(), (r.type === 'delete' ? r.delete_at : r.due_at || '').slice(0, 10));
  const reqRow = r => { const dl = daysLeft(r); return `<div class="fbi ${dl <= 7 && !['sent', 'done', 'cancelled'].includes(r.status) ? 'urgent' : ''}"><div><b>${r.type === 'export' ? '📦 Duomenų kopija' : '🗑️ Paskyros trynimas'} · ${esc(r.email || '—')}</b>
      <small>Gauta ${fmtDate(r.created_at.slice(0, 10))} · ${r.type === 'export' ? `atsakyti iki ${fmtDate(r.due_at.slice(0, 10))}` : `trinama ${fmtDate((r.delete_at || '').slice(0, 10))}`} · ${DSAR_STATUS[r.status] || r.status}${!['sent', 'done', 'cancelled'].includes(r.status) ? ` · <b class="${dl <= 7 ? 'red' : ''}">liko ${dl} d.</b>` : ''}</small></div>
      ${r.type === 'export' && !['sent', 'done'].includes(r.status) ? `<div class="choice row">${btn('📄 Paruošti duomenis', 'dsarPrepare', {id: r.id}, 'sm primary')}${btn('✉️ Laiško šablonas', 'dsarMail', {id: r.id}, 'sm')}${btn('✅ Pažymėti išsiųsta', 'dsarSent', {id: r.id}, 'sm')}</div>` : ''}
      ${r.type === 'delete' && r.status === 'pending' && !cloudOn() ? `<div class="choice row">${btn('⏩ Įvykdyti dabar (testas)', 'devRunDeletion', {id: r.id}, 'sm danger')}</div>` : ''}</div>`; };
  return card(`📥 Gautieji${inboxCount() ? ` <span class="badge-n">${inboxCount()}</span>` : ''}`, `<div class="tabs sm">${[['fb', `💬 Atsiliepimai (${INBOX.fb.filter(f => f.status === 'new').length})`], ['req', `📦 Užklausos (${open.length})`]].map(([k, l]) => `<button type="button" class="${(UI.inbox || 'fb') === k ? 'on' : ''}" data-a="inboxTab" data-k="${k}">${l}</button>`).join('')}</div>
    ${(UI.inbox || 'fb') === 'fb' ? (fb.length ? fb.map(f => `<div class="fbi ${f.urgent ? 'urgent' : ''} ${f.status === 'done' ? 'done' : ''}"><div><b>${FB_KINDS.find(k => k[0] === f.kind)?.[1] || '💬'} ${esc(f.message)}</b>
      <small>${f.from_dev ? '🐞 <b>Kūrėjo pastaba</b>' : esc(f.email || 'naudotojas')}${f.urgent ? ' · 🔥 skubu' : ''} · ${new Date(f.created_at).toLocaleString('lt-LT')} · ${FB_STATUS[f.status] || f.status}</small>
      ${f.context ? `<small class="ctx">📍 ${esc(f.context.view || '')} · v${esc(f.context.version || '?')} · ${esc(f.context.device || '')} · ${esc(f.context.screen || '')}</small>` : ''}${f.reply ? `<div class="reply">↩ ${esc(f.reply)}</div>` : ''}</div>
      <div class="choice row">${f.status === 'new' ? btn('👀 Peržiūrėta', 'fbStatus', {id: f.id, s: 'seen'}, 'sm') : ''}${f.status !== 'done' ? btn('✅ Išspręsta', 'fbStatus', {id: f.id, s: 'done'}, 'sm') : ''}${btn('↩ Atsakyti', 'fbReply', {id: f.id}, 'sm ghost')}</div></div>`).join('') : empty('Atsiliepimų nėra'))
      : (open.length ? open.map(reqRow).join('') : empty('Atvirų užklausų nėra ✓')) + (closed.length ? `<h4>Užbaigtos</h4>${closed.map(reqRow).join('')}` : '')}
    <div class="choice row">${btn('↻ Atnaujinti', 'inboxRefresh', {}, 'sm ghost')}</div>`);
}
A.inboxTab = d => { UI.inbox = d.k; render(); };
A.inboxRefresh = async () => { await refreshInbox(); render(); };
A.fbStatus = async d => { try { await DB.update('feedback', `id=eq.${d.id}`, {status: d.s}); await refreshInbox(); render(); } catch (e) { toast('⚠️ ' + esc(e.message)); } };
A.fbReply = async d => { const t = await askText('↩ Atsakymas', 'Naudotojas jį matys „Mano atsiliepimai“.', '', {multi: true, yes: 'Siųsti'}); if (!t) return; try { await DB.update('feedback', `id=eq.${d.id}`, {reply: t, status: 'done'}); await refreshInbox(); render(); toast('Atsakyta ✓'); } catch (e) { toast('⚠️ ' + esc(e.message)); } };

// ================= PRIVATUMAS: duomenų kopija ir paskyros trynimas =================
const DSAR_STATUS = {received: '📥 Gauta', in_progress: '⏳ Ruošiama', sent: '✉️ Išsiųsta', pending: '⏳ Laukia trynimo', cancelled: '↩ Atšaukta', done: '✅ Įvykdyta'};
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
  return card('🔐 Privatumas ir paskyra', `${MYREQ.length ? MYREQ.slice(0, 4).map(r => `<div class="li"><span>${r.type === 'export' ? '📦 Duomenų kopija' : '🗑️ Paskyros trynimas'}</span><small>${fmtDate(r.created_at.slice(0, 10))} · ${DSAR_STATUS[r.status] || r.status}${r.type === 'export' && ['received', 'in_progress'].includes(r.status) ? ` · atsakymas iki ${fmtDate(r.due_at.slice(0, 10))}` : ''}</small></div>`).join('') : ''}
    <div class="choice row">${openExp ? '' : btn('📦 Gauti savo duomenų kopiją', 'dsarRequest', {}, 'sm')}${DELREQ ? btn('↩ Atšaukti paskyros trynimą', 'cancelDeletion', {}, 'sm primary') : btn('🗑️ Ištrinti paskyrą', 'requestDeletion', {}, 'sm danger')}</div>
    <p class="hint">🛡️ Paskyros saugumui saugome prisijungimų istoriją: įrenginį, IP adresą ir apytikslę vietą (šalį, miestą). Ji saugoma 12 mėn. ir naudojama tik įtartinam prisijungimui pastebėti.</p>`);
}
A.dsarRequest = async () => {
  if (!await ask('Gauti savo duomenų kopiją?', 'Paruošime visų tavo duomenų kopiją ir atsiųsime el. paštu per 30 dienų.', {icon: '📦', yes: 'Pateikti prašymą'})) return;
  try {
    const td = await trustedDate(), due = addDays(td.date, 30);
    const [r] = await DB.insert('dsar_requests', {user_id: DB.uid(), email: DB.email(), type: 'export', status: 'received', due_at: new Date(due + 'T23:59:00Z').toISOString()});
    await loadAccountState(); render();
    // automatinis patvirtinimas (kaip „macro“ įmonėse)
    modal('📦 Prašymas gautas', `<div class="okbox">Gavome tavo prašymą Nr. <b>${esc(String(r?.id || '').slice(0, 8).toUpperCase())}</b> (${fmtDate(td.date)}).</div>
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
  return `<div class="banner danger">🗑️ <b>Paskyra bus ištrinta ${fmtDate(when)}</b> (liko ${left} d.). Kol kas gali tik peržiūrėti. <span class="sp"></span>${btn('↩ Atšaukti trynimą', 'cancelDeletion', {}, 'sm primary')}</div>`;
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
  modal('✉️ Laiško šablonas', `<p class="hint">Nukopijuota. Siųsk adresu <b>${esc(r.email || '')}</b> su abiem failais.</p><pre class="mail">${esc(txt)}</pre>`);
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
<p><small>Pilni duomenys (taip pat nustatymai ir receptai) – pridėtame JSON faile.</small></p></body></html>`;
}

// ================= PRIMINIMAI =================
function remindOnce(key, title, body) {
  let seen = {}; try { seen = JSON.parse(localStorage.getItem('manogyv_seen') || '{}'); } catch (e) {}
  if (seen[key]) return; seen[key] = today();
  for (const k in seen) if (seen[k] < addDays(today(), -14)) delete seen[k];
  localStorage.setItem('manogyv_seen', JSON.stringify(seen)); notify(title, body);
}
function checkReminders() {
  if (!S || readOnly()) return; const t = today(), now = nowMin();
  for (const e of eventsOn(t)) { const s = toMin(e.start) - (+e.travel || 0); if (s - now <= 15 && s - now > 0) remindOnce(`ev|${e.id}|${t}`, `${cat(e.cat).emoji} ${e.title}`, `Prasideda ${e.start}${+e.travel ? ' – laikas išeiti' : ''}`); }
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
    if (m <= 30 && m > 5) remindOnce(`plan30|${p.id}`, `🏋️ Po ${m} min: ${wtypeName(p.type)}`, `${p.exercises.length} pratimai, ~${p.duration} min. Nori ką nors pakeisti? Atidaryk programėlę.`);
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
  if (el.tagName === 'BUTTON' || el.tagName === 'A') e.preventDefault();
  fn(el.dataset, el, e);
});
document.addEventListener('submit', e => {
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
  if (el.dataset.c === 'mealSuggest') { S.foodPrefs.mealSuggest = el.checked; commit(); toast(el.checked ? '🍽️ „Šiandien“ skiltyje siūlysiu, ką valgyti' : 'Pasiūlymai išjungti'); }
  if (el.dataset.cat !== undefined && el.dataset.k) { const c = S.categories[+el.dataset.cat]; c[el.dataset.k] = el.dataset.k === 'type' ? +el.value : el.value; commit({noRender: true}); }
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

(async () => {
  if (!(await loadData())) { loginScreen(); return; }
  await loadRole();
  // pasirinkta versija galioja tik kūrėjui
  try { if (localStorage.getItem('ls_ver_override') && !isDeveloper() && !window.CLOUD?.test) { localStorage.removeItem('ls_ver_override'); location.reload(); return; } } catch (e) {}
  await loadAccountState();
  if (isDeveloper()) { refreshInbox(); setInterval(refreshInbox, 300000); }
  checkNewVersion(); setInterval(checkNewVersion, 300000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkNewVersion(); });
  if (S.settings.onboarded) showWhatsNew();
  setTimeout(checkReplies, 2500); setInterval(checkReplies, 10000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(checkReplies, 1000); });
  // jei buvai kūrėjo režime ir perkrovei puslapį – liekam smėlio dėžėje
  try { const sb = sessionStorage.getItem(DEV_KEY); if (sb && isDeveloper()) { REAL = S; DEV = true; S = migrate(JSON.parse(sb)); } } catch (e) {}
  applyTheme(); render();
  reportMeta(); setTimeout(applyAdjustments, 1500); setInterval(applyAdjustments, 300000);
  if (!S.settings.onboarded) A.onboard();
  checkReminders();
  setInterval(() => { checkReminders(); if (!$('#modal.open') && ['today', 'calendar'].includes(UI.view) && document.activeElement?.tagName !== 'INPUT') render(); }, 60000);
  setInterval(pullIfChanged, 20000);
  setInterval(() => { const el = $('#tElapsed'); if (el) el.textContent = timerElapsed(); if (S.active) document.querySelectorAll('.wClock').forEach(x => x.textContent = clock(S.active.ts)); tickRest(); }, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) pullIfChanged(); });
  window.addEventListener('online', () => pullIfChanged());
  if ('serviceWorker' in navigator && window.isSecureContext) navigator.serviceWorker.register('sw.js').catch(() => {});
})();


// ================= SAVIJAUTA =================
// Paprasta: nuotaika jaustuku (1–5), jei reikia – simptomai paspaudimu ir pastaba. Galima kelis kartus per dieną.
const MOODS = [['😫', 'Labai blogai'], ['😕', 'Prastai'], ['😐', 'Normaliai'], ['🙂', 'Gerai'], ['😁', 'Puikiai']];
const SYMPTOMS = [['migrena', '🤯 Migrena'], ['galva', '🤕 Skauda galvą'], ['nuovargis', '🥱 Nuovargis'], ['stresas', '😣 Stresas'], ['nerimas', '😟 Nerimas'],
  ['pilvas', '🤢 Skauda pilvą'], ['raumenys', '💢 Skauda raumenis'], ['persalimas', '🤧 Peršalimas'], ['energija', '⚡ Daug energijos']];
const symName = k => (SYMPTOMS.find(x => x[0] === k) || [k, k])[1];
const wellOn = d => S.wellbeing.filter(w => w.date === d).sort((a, b) => a.time < b.time ? -1 : 1);
A.addWell = (d = {}) => {
  const w = d.id ? S.wellbeing.find(x => x.id === d.id) : null, ctx = d.ctx || w?.ctx || '';
  modal(ctx === 'workout' ? '💪 Kaip jautiesi po treniruotės?' : w ? '💚 Savijauta' : '💚 Kaip jautiesi?', `
    <div class="emo big">${MOODS.map(([e, l], i) => `<label title="${l}"><input type="radio" name="mood" value="${i + 1}" ${(w?.mood || 0) === i + 1 ? 'checked' : ''}><span>${e}</span></label>`).join('')}</div>
    <h4>Ar kas nors jaučiasi? <small>(nebūtina)</small></h4>
    <div class="chips">${SYMPTOMS.map(([k, l]) => `<label class="chipbtn"><input type="checkbox" name="sym[]" value="${k}" ${(w?.sym || []).includes(k) ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>
    <div class="row">${fld('Pastaba (nebūtina)', inp('note', w?.note || '', 'text', 'placeholder="pvz. migrena po pietų, mažai gėriau vandens"'))}${fld('Kada', inp('time', w?.time || fromMin(nowMin()), 'time'))}</div>`, o => {
    if (!o.mood) { toast('Pasirink, kaip jautiesi'); return false; }
    const rec = {date: w?.date || today(), time: o.time || fromMin(nowMin()), mood: +o.mood, sym: o.sym || [], note: (o.note || '').trim().slice(0, 300), ctx};
    if (w) Object.assign(w, rec); else S.wellbeing.push({id: uid(), ...rec});
    commit(); toast(+o.mood >= 4 ? '💚 Puiku! Įrašyta' : '💚 Įrašyta – pasirūpink savimi', 'good');
  }, {submit: 'Įrašyti', noFocus: true, extra: w ? btn('🗑', 'delWell', {id: w.id}, 'danger sm') : ''});
};
A.delWell = d => { S.wellbeing = S.wellbeing.filter(w => w.id !== d.id); A.closeModal(); commit(); };
A.quickMood = d => { S.wellbeing.push({id: uid(), date: today(), time: fromMin(nowMin()), mood: +d.m, sym: [], note: '', ctx: ''}); commit(); toast('💚 Įrašyta', 'good'); };
// Pastebėjimai: kiek kartų per 30 d., kokią savaitės dieną dažniausiai, ar mažiau miegota prieš tas dienas
function wellInsights() {
  const from = addDays(today(), -29), rec = S.wellbeing.filter(w => w.date >= from), out = [];
  const cnt = {}; rec.forEach(w => (w.sym || []).forEach(k => { if (k !== 'energija') (cnt[k] = cnt[k] || new Set()).add(w.date); }));
  const sleepH = d => { const s = sleepOn(d); return s ? sleepMinutes(s) / 60 : null; };
  for (const [k, days] of Object.entries(cnt).sort((a, b) => b[1].size - a[1].size).slice(0, 3)) {
    const ds = [...days], wd = {}; ds.forEach(d => wd[dow(d)] = (wd[dow(d)] || 0) + 1);
    const top = Object.entries(wd).sort((a, b) => b[1] - a[1])[0];
    const sOn = ds.map(sleepH).filter(x => x != null), others = range(from, 30).filter(d => !days.has(d)).map(sleepH).filter(x => x != null);
    const avg = a => a.reduce((x, y) => x + y, 0) / a.length;
    let t = `<b>${symName(k)}</b> – ${ds.length} d. per 30 d.`;
    if (ds.length >= 2 && top && top[1] >= 2) t += ` Dažniausiai – <b>${DOW_LONG[top[0] - 1].toLowerCase()}</b>.`;
    if (sOn.length >= 2 && others.length >= 3) { const a = avg(sOn), b = avg(others); if (Math.abs(a - b) >= 0.5) t += ` Tomis dienomis miegojai vidutiniškai <b>${round(a, 1)} val.</b>, kitomis – ${round(b, 1)} val.`; }
    out.push(t);
  }
  const moods = rec.filter(w => w.mood), wk = moods.filter(w => w.date >= addDays(today(), -6)), prev = moods.filter(w => w.date < addDays(today(), -6) && w.date >= addDays(today(), -13));
  const am = a => a.reduce((x, w) => x + w.mood, 0) / a.length;
  if (wk.length >= 3 && prev.length >= 3) { const a = am(wk), b = am(prev); if (Math.abs(a - b) >= 0.4) out.push(a > b ? `🙂 Ši savaitė – geresnė nei praėjusi (${round(a, 1)} vs ${round(b, 1)}).` : `😕 Ši savaitė – sunkesnė nei praėjusi (${round(a, 1)} vs ${round(b, 1)}). Pasirūpink poilsiu.`); }
  const wo = moods.filter(w => w.ctx === 'workout'); if (wo.length >= 3) out.push(`💪 Po treniruočių jautiesi vidutiniškai <b>${MOODS[Math.round(am(wo)) - 1][0]} ${MOODS[Math.round(am(wo)) - 1][1].toLowerCase()}</b>.`);
  return out;
}
function vWellbeing() {
  const d = today(), td = wellOn(d), days = range(addDays(d, -29), 30);
  const dayMood = x => { const r = wellOn(x).filter(w => w.mood); return r.length ? Math.round(r.reduce((s, w) => s + w.mood, 0) / r.length) : 0; };
  const ins = wellInsights(), recent = [...S.wellbeing].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)).slice(0, 25);
  return `<div class="grid2"><div>
    ${card('💚 Kaip jautiesi dabar?', `<div class="emo big quick">${MOODS.map(([e, l], i) => `<button type="button" class="emob" data-a="quickMood" data-m="${i + 1}" title="${l}">${e}<small>${l}</small></button>`).join('')}</div>
      <div class="choice row">${btn('+ Su simptomais ar pastaba', 'addWell', {}, 'sm')}</div>
      ${td.length ? `<p class="hint">Šiandien: ${td.map(w => `${MOODS[w.mood - 1][0]} ${w.time}`).join(' · ')}</p>` : '<p class="hint">Užtenka vieno paspaudimo. Jei skauda galvą ar kas nors kita – pažymėk simptomą, vėliau pamatysi, kada tai kartojasi.</p>'}`)}
    ${card('📅 30 dienų', `<div class="moodcal">${days.map(x => { const m = dayMood(x), sy = wellOn(x).some(w => (w.sym || []).some(k => k !== 'energija')); return `<div class="wcell m${m}" title="${fmtDate(x)}${m ? ' · ' + MOODS[m - 1][1] : ''}">${m ? MOODS[m - 1][0] : ''}${sy ? '<i></i>' : ''}<small>${parseD(x).getDate()}</small></div>`; }).join('')}</div>
      <p class="hint">Taškelis – tą dieną buvo simptomų.</p>`)}
    </div><div>
    ${card('🔎 Pastebėjimai', ins.length ? ins.map(t => `<p class="ins">${t}</p>`).join('') : empty('Įrašyk savijautą kelias dienas – čia atsiras pastebėjimai (pvz. kada dažniausiai skauda galvą).'))}
    ${card('🗒️ Įrašai', recent.length ? recent.map(w => `<div class="li click" data-a="addWell" data-id="${w.id}"><span>${MOODS[w.mood - 1]?.[0] || '•'} <b>${fmtDate(w.date)}</b> ${w.time}${w.ctx === 'workout' ? ' · po treniruotės' : ''}
      ${(w.sym || []).length ? `<small>${w.sym.map(symName).join(', ')}</small>` : ''}${w.note ? `<small>${esc(w.note)}</small>` : ''}</span></div>`).join('') : empty('Dar nėra įrašų'))}
  </div></div>`;
}
