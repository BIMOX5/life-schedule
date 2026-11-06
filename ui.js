// ===== Sąsaja =====
const UI = { view: 'today', cal: {mode: 'week', date: today()}, food: 'log', foodDate: today(), time: {mode: 'week', date: today()},
  sport: 'overview', taskFilter: 'open', noteId: null, recipeQ: '', foodQ: '', mealTab: 'freezer' };
const VIEWS = [
  ['today','🏠','Šiandien'], ['calendar','📅','Kalendorius'], ['tasks','✅','Užduotys'], ['food','🍽️','Mityba'],
  ['sport','💪','Sportas'], ['time','⏱️','Laikas'], ['progress','📈','Progresas'], ['notes','📝','Užrašai'], ['settings','⚙️','Profilis'],
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
  $('#top').innerHTML = `<div class="tl"><h1>${VIEWS.find(v => v[0] === UI.view)[2]}</h1><small>${fmtDateDow(today())}</small></div>
    <div class="tr">${S.active ? `<button class="timer" data-a="workoutMode" style="--c:#22c55e">🏋️ <span class="wClock">${clock(S.active.ts)}</span></button>` : ''}${timerWidget()}<button class="lvl" data-a="levelInfo" title="${g.xp} XP">⭐ ${g.level}${g.streak > 1 ? ` · 🔥${g.streak}` : ''}</button><span id="sync" class="sync"></span></div>`;
  const fn = {today: vToday, calendar: vCalendar, tasks: vTasks, food: vFood, sport: vSport, time: vTime, progress: vProgress, notes: vNotes, settings: vSettings}[UI.view];
  $('#main').innerHTML = fn();
  updateSyncBadge();
}
A.go = d => { A.closeModal(); UI.view = d.v; render(); window.scrollTo(0, 0); };
A.levelInfo = () => {
  const g = gamification(), nextT = LEVEL_TITLES.find(t => t[0] > g.level);
  modal(`${g.title[1]} ${g.level} lygis – ${g.title[2]}`, `<div class="xpb"><i style="width:${(g.xp - g.cur) / (g.next - g.cur) * 100}%"></i></div>
    <p class="center">${g.xp} XP · iki ${g.level + 1} lygio liko <b>${g.next - g.xp} XP</b>${nextT ? ` · titulas „${nextT[2]}“ nuo ${nextT[0]} lygio` : ''}</p>
    <h4>Kam lygiai?</h4><p>Lygiai nieko neatrakina – jie parodo, <b>kiek nuosekliai rūpiniesi savimi</b>. XP gauni už veiksmus, ne už rezultatus: net jei svoris stovi, bet treniruojiesi, miegi ir gamini – kyli. Kiekvienas lygis reikalauja vis daugiau XP, todėl aukšti lygiai = ilgalaikis įprotis, o ne vienas geras savaitgalis.</p>
    <h4>Kaip renkasi XP</h4><table class="tbl"><tbody>${XP_RULES.map(([k, l, x]) => `<tr><td>${l}</td><td>+${x}</td><td><small>${g.parts[k]}× = ${g.parts[k] * x} XP</small></td></tr>`).join('')}</tbody></table>
    <h4>Serija 🔥 ${g.streak} d.</h4><p class="hint">Kiek dienų iš eilės kažką įrašei (maistą, laiką ar treniruotę).</p>
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
    <p class="hint">Laikmatis skaičiuos laiką net uždarius programėlę. Spausk ■ viršuje, kai baigsi.</p>`);
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
function mealPlanTimes(d) {
  const p = S.profile, w = toMin(p.wake); let b = toMin(p.bed); if (b <= w) b += 1440;
  const first = w + 45, last = Math.min(b - 150, w + 13 * 60), n = (last - first) >= 11 * 60 ? 4 : 3;
  return Array.from({length: n}, (_, i) => Math.round((first + (last - first) * i / (n - 1)) / 15) * 15);
}
function busyAt(d, m) { return busyBlocks(d).find(([s, e]) => m >= s && m < e); }
function recommendations(d) {
  const p = S.profile, recs = [], isToday = d === today(), now = isToday ? nowMin() : 0;
  const slots = freeSlots(d, isToday ? now : null), bed = toMin(p.bed) || 1440;
  const ws = weekStart(d), weekW = S.workouts.filter(w => w.date >= ws && w.date <= addDays(ws, 6)).length;
  const doneToday = workoutsOn(d).length;
  const need = (+p.workoutMin || 40) + (+p.showerMin || 0) + (+p.travelMin || 0) * 2 + 10;
  let sportSlot = null;
  // --- Sportas
  const todaysPlan = plansOn(d)[0];
  if (todaysPlan) recs.push({icon:'🏋️', kind:'sport', title:`Suplanuota ${todaysPlan.start}: ${esc(wtypeName(todaysPlan.type))}`, text:`${todaysPlan.exercises.length} pratimai · ~${todaysPlan.duration} min. Priminsiu 30 min prieš.`,
    act: btn('▶ Pradėti', 'startPlan', {id: todaysPlan.id}, 'sm primary') + ' ' + btn('✓ Padariau', 'planDone', {id: todaysPlan.id}, 'sm') + ' ' + btn('✏️', 'openPlan', {id: todaysPlan.id}, 'sm')});
  else if (doneToday) recs.push({icon:'✅', kind:'good', title:'Treniruotė šiandien jau padaryta', text:'Šaunu! Nepamiršk baltymų per 2 val. po treniruotės ir gerai išsimiegoti.'});
  else if (weekW >= (+p.workoutsPerWeek || 3)) recs.push({icon:'🧘', title:'Savaitės treniruočių tikslas pasiektas', text:`${weekW}/${p.workoutsPerWeek} – šiandien gali ilsėtis arba trumpai pasivaikščioti.`});
  else {
    const cands = slots.filter(([s, e]) => e - s >= need).map(([s, e]) => {
      const st = clamp(17 * 60, s, e - need);
      let sc = -Math.abs(st - 17 * 60); if (st + need > bed - 90) sc -= 300; if (st < toMin(p.wake) + 60) sc -= 120;
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
  const times = mealPlanTimes(d).map(t => {
    if (sportSlot && t > sportSlot[0] - 60 && t < sportSlot[0]) t = sportSlot[0] - 90; // ne prieš pat sportą
    const b = busyAt(d, t);
    if (!b) return {t, txt: fromMin(t)};
    const near = slots.find(([s, e]) => e - s >= 20 && Math.abs(s - t) <= 75);
    if (near) return {t: near[0], txt: fromMin(near[0])};
    return {t, txt: `${fromMin(t)} <span class="tag warn">pasiimk su savimi</span>`, pack: true};
  }).filter(x => !isToday || x.t > now - 30);
  const packN = times.filter(x => x.pack).length;
  const frz = S.freezer.filter(f => f.portions > 0).sort((a, b) => (recipeUsage()[a.recipeId] || 0) - (recipeUsage()[b.recipeId] || 0));
  const frzTxt = frz.length ? ` Iš šaldiklio siūlau: <b>${esc(recipe(frz[0].recipeId)?.name || '')}</b>${frz[1] ? ` arba <b>${esc(recipe(frz[1].recipeId)?.name || '')}</b>` : ''}.` : '';
  if (times.length) recs.push({icon:'🍽️', title:`Valgymo laikai: ${times.map(x => x.txt).join(' · ')}`,
    text:`Liko <b>${Math.max(0, tg.kcal - nu.kcal)} kcal</b> ir <b>${Math.max(0, Math.round(tg.protein - nu.p))} g baltymų</b>.${packN ? ` ${packN} valgymas(-ai) patenka į užimtą laiką – įsidėk porciją į dėžutę.` : ''}${frzTxt}`,
    act: btn('+ Valgis', 'addMeal', {}, 'sm')});
  // --- Atšildymas rytojui
  if (isToday) {
    const tm = addDays(d, 1), longBusy = busyBlocks(tm).some(([s, e]) => e - s >= 240);
    if (longBusy && freezerPortions() > 0) recs.push({icon:'🧊', title:'Vakare išsiimk porciją rytojui', text:'Rytoj turi ilgą užimtą bloką – persikelk porciją iš šaldiklio į šaldytuvą, kad ryte tik pasiimtum.'});
  }
  // --- Gaminimas / įvairovė
  const fp = freezerPortions();
  if (fp < 5) {
    const top = suggestRecipes({freezableOnly: true})[0];
    if (top) {
      const cookSlot = slots2.find(([s, e]) => e - s >= top.r.time + 15);
      recs.push({icon:'👨‍🍳', kind: fp === 0 ? 'warn' : '', title: fp === 0 ? 'Šaldiklis tuščias – laikas gaminti!' : `Šaldiklyje liko tik ${fp} porc.`,
        text:`Siūlau: <b>${top.r.emoji} ${esc(top.r.name)}</b> – ${top.r.portions} porc., ${top.st.kcal} kcal ir ${top.st.p} g baltymų porcijai, ~${top.st.cost.toFixed(2)} €/porc. ${cookSlot ? `Laiko yra ${fromMin(cookSlot[0])}–${fromMin(cookSlot[1])}.` : `Šiandien ${top.r.time} min lango nėra – planuok ${DOW_LONG[(+p.cookDay || 7) - 1].toLowerCase()}.`}`,
        act: btn('Receptas', 'viewRecipe', {id: top.r.id}, 'sm')});
    }
  }
  const usage = Object.entries(recipeUsage()).sort((a, b) => b[1] - a[1]);
  if (usage.length && usage[0][1] >= 5) {
    const r = recipe(usage[0][0]), alt = suggestRecipes().find(x => x.r.id !== usage[0][0] && x.r.tags.some(t => r?.tags.includes(t))) || suggestRecipes().find(x => x.r.id !== usage[0][0]);
    if (r && alt) recs.push({icon:'🔄', title:`${esc(r.name)} – jau ${usage[0][1]} kartų per 2 savaites`, text:`Kad neatsibostų, kitą kartą pabandyk <b>${alt.r.emoji} ${esc(alt.r.name)}</b> – panašu, bet kitaip.`, act: btn('Žiūrėti', 'viewRecipe', {id: alt.r.id}, 'sm')});
  }
  // --- Užduotys
  const urgent = S.tasks.filter(t => !t.done && t.due && diffDays(d, t.due) <= 3).sort((a, b) => a.due < b.due ? -1 : 1);
  if (urgent.length) {
    const t = urgent[0], free = slots2.find(([s, e]) => e - s >= Math.min(+t.est || 60, 90));
    const late = diffDays(d, t.due) < 0;
    recs.push({icon: late ? '🚨' : '📌', kind: late || (+t.progress || 0) < 50 ? 'warn' : '', title: `${late ? 'Pavėluota' : 'Artėja terminas'}: ${esc(t.title)} (${relDay(t.due)})`,
      text: `${(+t.progress || 0) ? `Padaryta ${t.progress}%. ` : ''}${free ? `Laisvas langas: <b>${fromMin(free[0])}–${fromMin(free[1])}</b> – skirk ${fmtDur(Math.min(+t.est || 60, free[1] - free[0]))}.` : 'Šiandien laisvo lango beveik nėra – gal galima padaryti dalį?'}${urgent.length > 1 ? ` Dar ${urgent.length - 1} užduotis(-ys) per 3 d.` : ''}`,
      act: btn('Užduotys', 'go', {v: 'tasks'}, 'sm')});
  }
  // --- Miegas ir ekranas
  const sl = sleepOn(d);
  if (isToday && !sl) recs.push({icon:'😴', title:'Kaip miegojai?', text:'Įrašyk miegą – jis įskaičiuojamas į dienos įvertinimą.', act: btn('+ Miegas', 'addSleep', {}, 'sm')});
  else if (sl && sleepMinutes(sl) / 60 < (+p.sleepGoal || 8) - 1) recs.push({icon:'🛌', kind:'warn', title:`Miegojai tik ${round(sleepMinutes(sl) / 60, 1)} val.`, text:`Šiandien gulkis iki ${p.bed}, o 30 min prieš miegą – be ekranų. Pavargęs kūnas sunkiau atsisako užkandžių.`});
  const yt = dayTime(addDays(d, -1));
  if (yt.screen > (+p.screenLimitMin || 90)) recs.push({icon:'📺', kind:'warn', title:`Vakar ekranui – ${fmtDur(yt.screen)} (limitas ${fmtDur(+p.screenLimitMin || 90)})`, text:'Šiandien pabandyk: pirmiausia vienas svarbus darbas, Netflix – kaip prizas po jo. Paleisk laikmatį, kad matytum.'});
  return {recs, sportSlot};
}

// ================= LAIKO JUOSTA =================
function timeline(d, o = {}) {
  const p = S.profile, scale = o.scale || 0.9;
  let h0 = Math.min(6, Math.floor(toMin(p.wake) / 60)), h1 = 24;
  const top = m => (m - h0 * 60) * scale;
  const items = [];
  for (const g of eventSegs(d)) { const e = g.e, c = cat(e.cat); items.push({s: g.s, e: g.en, title: e.title + (g.tail ? ' (tęsinys)' : g.head ? ' 🌙' : ''), sub: timeText(e), color: c.color, emoji: c.emoji, a: 'eventInfo', id: e.id, cls: 'ev' + (g.head ? ' head' : '') + (g.tail ? ' tail' : '')}); }
  for (const p of plansOn(d)) items.push({s: toMin(p.start), e: toMin(p.start) + (+p.duration || 40), title: wtypeName(p.type), sub: `suplanuota · ${p.duration} min`, color: '#22c55e', emoji: '🏋️', a: 'openPlan', id: p.id, cls: 'sug plan'});
  if (o.sportSlot && plansOn(d).length) o.sportSlot = null;
  for (const t of timelogOn(d)) { const c = cat(t.cat); let en = toMin(t.end); if (en <= toMin(t.start)) en = 1440; items.push({s: toMin(t.start), e: en, title: c.name, sub: `${t.start}–${t.end}${t.note ? ' · ' + t.note : ''}`, color: c.color, emoji: c.emoji, a: 'editLog', id: t.id, cls: 'log'}); }
  for (const w of workoutsOn(d)) if (w.start) items.push({s: toMin(w.start), e: toMin(w.start) + (+w.duration || 30), title: 'Treniruotė', sub: `${w.duration} min`, color: '#22c55e', emoji: '💪', a: 'viewWorkout', id: w.id, cls: 'log'});
  if (S.timer && S.timer.date === d) { const c = cat(S.timer.cat); items.push({s: toMin(S.timer.start), e: Math.max(nowMin(), toMin(S.timer.start) + 5), title: c.name + ' (vyksta)', sub: 'laikmatis', color: c.color, emoji: c.emoji, a: 'timerStop', cls: 'log live'}); }
  if (S.active && S.active.date === d) items.push({s: toMin(S.active.start), e: Math.max(nowMin(), toMin(S.active.start) + 5), title: 'Treniruotė (vyksta)', sub: 'spausk – atidaryti', color: '#22c55e', emoji: '🏋️', a: 'workoutMode', cls: 'log live'});
  if (o.sportSlot) items.push({s: o.sportSlot[0], e: o.sportSlot[1], title: 'Siūlomas sportas – spausk planuoti', sub: `${fromMin(o.sportSlot[0])}–${fromMin(o.sportSlot[1])}`, color: '#22c55e', emoji: '💡', a: 'planWorkout', id: fromMin(o.sportSlot[0]), cls: 'sug'});
  items.sort((a, b) => a.s - b.s);
  // juostos persidengimams
  const lanes = [];
  for (const it of items) { let l = lanes.findIndex(end => end <= it.s); if (l < 0) { l = lanes.length; lanes.push(0); } lanes[l] = it.e; it.lane = l; }
  const L = Math.max(1, lanes.length);
  let html = `<div class="tlw ${o.compact ? 'compact' : ''}"><div class="tl-hours">`;
  for (let h = h0; h <= h1; h++) html += `<div class="hr" style="top:${top(h * 60)}px">${pad(h % 24)}:00</div>`;
  html += `</div><div class="tl" data-a="tlClick" data-d="${d}" data-h0="${h0}" data-sc="${scale}" style="height:${(h1 - h0) * 60 * scale}px">`;
  for (let h = h0; h < h1; h++) html += `<div class="hl" style="top:${top(h * 60)}px"></div>`;
  // miegas
  const wake = toMin(p.wake), bed = toMin(p.bed);
  if (wake > h0 * 60) html += `<div class="sleepz" style="top:0;height:${top(wake)}px">😴</div>`;
  if (bed > h0 * 60 && bed < 1440) html += `<div class="sleepz" style="top:${top(bed)}px;height:${top(1440) - top(bed)}px">😴</div>`;
  if (o.free) for (const [s, e] of freeSlots(d)) html += `<div class="freez" style="top:${top(s)}px;height:${(e - s) * scale}px"><span>laisva ${fmtDur(e - s)}</span></div>`;
  for (const it of items) {
    const hgt = Math.max(16, (it.e - it.s) * scale);
    html += `<div class="blk ${it.cls}" data-a="${it.a}" data-id="${it.id || ''}" data-d="${d}" style="top:${top(it.s)}px;height:${hgt}px;left:calc(${it.lane / L * 100}% + 2px);width:calc(${100 / L}% - 4px);--c:${it.color}" title="${esc(it.title)} ${esc(it.sub)}"><b>${it.emoji} ${esc(it.title)}</b>${hgt > 30 ? `<small>${esc(it.sub)}</small>` : ''}</div>`;
  }
  if (d === today()) html += `<div class="nowl" style="top:${top(nowMin())}px"><span>${nowHM()}</span></div>`;
  html += `</div></div>`;
  return html;
}
A.tlClick = (d, el, ev) => {
  if (ev.target !== el && !ev.target.classList.contains('hl') && !ev.target.classList.contains('freez') && !ev.target.closest('.freez')) return;
  const r = el.getBoundingClientRect(), m = Math.round(((ev.clientY - r.top) / +d.sc + +d.h0 * 60) / 15) * 15;
  modal(`${fmtDateDow(d.d)} · ${fromMin(m)}`, `<div class="choice">
    ${btn('📅 Naujas įvykis (paskaita, darbas…)', 'addEvent', {date: d.d, start: fromMin(m)}, 'big')}
    ${btn('⏱️ Įrašyti, ką veikiau', 'addLog', {date: d.d, start: fromMin(m)}, 'big')}
    ${btn('💪 Įrašyti treniruotę', 'addWorkout', {date: d.d, start: fromMin(m)}, 'big')}</div>`);
};

// ================= ŠIANDIEN =================
function vToday() {
  const d = today(), p = S.profile, tg = targets(), nu = dayNutrition(d), t = dayTime(d), sc = dayScore(d), g = gamification();
  const sl = sleepOn(d), mot = motivation(), {recs, sportSlot} = recommendations(d);
  const hour = new Date().getHours(), hi = hour < 11 ? 'Labas rytas' : hour < 17 ? 'Laba diena' : 'Labas vakaras';
  const ci = checkinDue();
  const dueTasks = S.tasks.filter(x => !x.done && x.due && x.due <= addDays(d, 7)).sort((a, b) => a.due < b.due ? -1 : 1).slice(0, 6);
  return `
  <div class="hero">
    <div><h2>${hi}${p.name ? ', ' + esc(p.name) : ''}! 👋</h2>
    <div class="mot">${mot.slice(0, 2).map(m => `<p class="${m.good ? 'good' : ''}">${m.t}</p>`).join('')}</div></div>
    <div class="xp"><div class="xpb"><i style="width:${(g.xp - g.cur) / (g.next - g.cur) * 100}%"></i></div><small>⭐ ${g.level} lygis · ${g.xp} XP · iki kito ${g.next - g.xp} XP${g.streak > 1 ? ` · 🔥 ${g.streak} d. serija` : ''}</small></div>
  </div>
  ${ci ? `<div class="banner" data-a="checkin" data-t="${ci}">🪞 <b>Laikas ${ci === 'week' ? 'savaitės' : 'mėnesio'} patikrinimui!</b> Pasisverk, pažiūrėk, kaip sekėsi, ir užsibrėžk tikslą. <span class="sp"></span><button class="btn sm primary">Pradėti</button></div>` : ''}
  <div class="rings">
    <div class="rc" data-a="go" data-v="food">${ring(nu.kcal, tg.kcal, '#4f8cff', nu.kcal, `/ ${tg.kcal} kcal`)}<span>Kalorijos</span></div>
    <div class="rc" data-a="go" data-v="food">${ring(nu.p, tg.protein, '#a78bfa', Math.round(nu.p) + ' g', `/ ${tg.protein} g`)}<span>Baltymai</span></div>
    <div class="rc" data-a="go" data-v="time">${ring(t.prod, (+p.prodGoalH || 6) * 60, '#22c55e', fmtH(t.prod).replace(' val', 'h'), `/ ${p.prodGoalH} h`)}<span>Produktyvu</span></div>
    <div class="rc" data-a="go" data-v="time">${ring(t.screen, +p.screenLimitMin || 90, '#ef4444', fmtDur(t.screen).replace(' min', 'm'), `/ ${p.screenLimitMin} min`)}<span>Ekranas</span></div>
    <div class="rc" data-a="addSleep">${ring(sl ? sleepMinutes(sl) : 0, (+p.sleepGoal || 8) * 60, '#06b6d4', sl ? round(sleepMinutes(sl) / 60, 1) + 'h' : '–', `/ ${p.sleepGoal} h`)}<span>Miegas</span></div>
    <div class="rc" data-a="scoreInfo" data-d="${d}">${ring(sc ? sc.score : 0, 100, scoreColor(sc?.score), sc ? sc.score : '–', 'balų')}<span>Dienos balas</span></div>
  </div>
  <div class="quick">
    ${btn('🍽️ Valgis', 'addMeal')}${btn('⚖️ Svoris', 'addWeight')}${btn('😴 Miegas', 'addSleep')}${btn('💪 Treniruotė', 'addWorkout')}${btn('⏱️ Ką veikiau', 'addLog')}${btn('✅ Užduotis', 'addTask')}${btn('📅 Įvykis', 'addEvent')}
  </div>
  <div class="grid2">
    <div>${card('💡 Rekomendacijos šiandienai', recs.length ? recs.map(r => `<div class="rec ${r.kind || ''}"><div class="ri">${r.icon}</div><div class="rb"><b>${r.title}</b><p>${r.text}</p>${r.act ? `<div class="ra">${r.act}</div>` : ''}</div></div>`).join('') : empty('Viskas tvarkoj!'))}
    ${card('📌 Artimiausi terminai', dueTasks.length ? dueTasks.map(taskRow).join('') : empty('Terminų nėra 🎉'), btn('+', 'addTask', {}, 'sm'))}
    ${card('🍽️ Šiandien valgyta', mealsList(d), btn('+', 'addMeal', {}, 'sm'))}</div>
    <div>${card('🕒 Dienos planas', `<p class="hint">Spausk ant tuščios vietos, kad pridėtum. Žalia punktyrinė – siūlomas sporto laikas.</p>${timeline(d, {sportSlot, free: true, scale: 0.75})}`, btn('Savaitė', 'calMode', {m: 'week'}, 'sm'))}</div>
  </div>`;
}
A.scoreInfo = d => {
  const sc = dayScore(d.d);
  modal(`Dienos balas · ${fmtDate(d.d)}`, sc ? `<div class="big-score" style="color:${scoreColor(sc.score)}">${sc.score}</div>
    ${sc.parts.map(x => `<div class="bar-row"><span>${x.k}</span><div class="pbar"><i style="width:${x.v * 100}%;background:${scoreColor(x.v * 100)}"></i></div><small>${x.txt}</small></div>`).join('')}
    <p class="hint">Balas skaičiuojamas tik iš to, ką įrašei – tuščias kalendorius nereiškia blogos dienos. Kuo daugiau įrašysi (laiką, maistą, miegą), tuo tiksliau.</p>` : empty('Šiai dienai dar nėra įrašų.'));
};

// ================= KALENDORIUS =================
function vCalendar() {
  const c = UI.cal, d = c.date;
  const nav = `<div class="seg">${[['day', 'Diena'], ['week', 'Savaitė'], ['month', 'Mėnuo']].map(([m, l]) => `<button class="${c.mode === m ? 'on' : ''}" data-a="calMode" data-m="${m}">${l}</button>`).join('')}</div>
    <div class="navd">${btn('‹', 'calNav', {n: -1}, 'sm')}${btn('Šiandien', 'calToday', {}, 'sm')}${btn('›', 'calNav', {n: 1}, 'sm')}</div>
    ${btn('+ Įvykis', 'addEvent', {date: d}, 'primary sm')}`;
  let body = '';
  if (c.mode === 'day') {
    const {recs, sportSlot} = recommendations(d);
    body = `<h2 class="dh">${fmtDateDow(d)}</h2><div class="grid2"><div>${card('', timeline(d, {free: true, sportSlot: d >= today() ? sportSlot : null}))}</div>
      <div>${card('💡 Rekomendacijos', recs.map(r => `<div class="rec ${r.kind || ''}"><div class="ri">${r.icon}</div><div class="rb"><b>${r.title}</b><p>${r.text}</p></div></div>`).join(''))}
      ${card('Laisvi langai', freeSlots(d).map(([s, e]) => `<div class="li">🟢 ${fromMin(s)}–${fromMin(e)} <small>${fmtDur(e - s)}</small></div>`).join('') || empty('Laisvų langų nėra'))}
      ${daySummaryCard(d)}</div></div>`;
  } else if (c.mode === 'week') {
    const ws = weekStart(d), days = range(ws, 7);
    body = `<h2 class="dh">${fmtDate(ws)} – ${fmtDate(addDays(ws, 6))}</h2><div class="week">${days.map(x => {
      const sc = dayScore(x);
      return `<div class="wcol ${x === today() ? 'today' : ''}"><div class="wh" data-a="calDay" data-d="${x}"><b>${DOW[dow(x) - 1]}</b> ${parseD(x).getDate()}${sc ? `<i style="background:${scoreColor(sc.score)}">${sc.score}</i>` : ''}</div>${timeline(x, {scale: 0.55, compact: true, sportSlot: x === today() ? recommendations(x).sportSlot : null})}</div>`;
    }).join('')}</div>`;
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
      <p class="hint">Spalva = dienos balas (žalia – puiki diena). Taškai – įvykiai, 📌 – terminai, 💪 – treniruotės. Spausk dieną, kad atidarytum.</p>`;
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
const REP_TYPES = [['once', 'Nesikartoja (vieną kartą)'], ['weekly', 'Kas savaitę'], ['biweekly', 'Kas dvi savaites'], ['monthly', 'Kas mėnesį']];
const LEN_OPTS = [['forever', 'Kol ištrinsiu'], ['1', '1 mėnesį'], ['2', '2 mėnesius'], ['3', '3 mėnesius (~semestras)'], ['6', 'Pusę metų'], ['date', 'Iki konkrečios datos…']];
function eventForm(e) {
  const t = e.type || 'once', len = e.until ? 'date' : 'forever';
  return `${fld('Pavadinimas', inp('title', e.title, 'text', 'required placeholder="pvz. Matematikos paskaita"'))}
  <div class="row">${fld('Kategorija', sel('cat', catOpts(), e.cat))}${fld('Kartojasi?', sel('type', REP_TYPES, t, 'data-toggle="evtype"'))}</div>
  <div class="ev-once ${t === 'once' ? '' : 'hide'}">${fld('Kurią dieną?', inp('date', e.date || today(), 'date'))}</div>
  <div class="ev-days ${['weekly', 'biweekly'].includes(t) ? '' : 'hide'}">${fld('Kuriomis dienomis?', `<div class="days">${DOW.map((x, i) => `<label><input type="checkbox" name="days[]" value="${i + 1}" ${(e.days || []).includes(i + 1) ? 'checked' : ''}><span>${x}</span></label>`).join('')}</div>`)}</div>
  <div class="ev-month ${t === 'monthly' ? '' : 'hide'}">${fld('Kurią mėnesio dieną?', inp('mday', e.mday || parseD(e.date || today()).getDate(), 'number', 'min="1" max="31"'))}</div>
  <div class="ev-rep ${t === 'once' ? 'hide' : ''}"><div class="row">${fld('Kiek laiko kartoti?', sel('len', LEN_OPTS, len, 'data-toggle="evlen"'))}
    <div class="fld ev-until ${len === 'date' ? '' : 'hide'}"><span>Paskutinė diena</span>${inp('until', e.until || addDays(today(), 90), 'date')}</div></div>
    <p class="hint">Pradės kartotis nuo ${e.from ? fmtDate(e.from) : 'šiandien'}.</p></div>
  <div class="row">${fld('Pradžia', inp('start', e.start, 'time', 'required'))}${fld('Pabaiga', inp('end', e.end, 'time', 'required'))}${fld('Kelionė į vieną pusę (min)', inp('travel', e.travel || 0, 'number', 'min="0" step="5"'))}</div>
  <p class="hint">🌙 Jei pabaiga ankstesnė už pradžią (pvz. 18:30–02:00), įvykis baigsis kitą dieną.</p>`;
}
A.addEvent = d => {
  const st = d.start || '09:00';
  const e = {type: d.weekly ? 'weekly' : 'once', cat: 'paskaitos', start: st, end: fromMin(toMin(st) + 90), date: d.date || today(), days: [dow(d.date || today())], from: d.date};
  modal('Naujas įvykis', eventForm(e), o => saveEvent(o, null, d.date));
};
A.editEvent = d => { const e = S.events.find(x => x.id === d.id); modal('Redaguoti įvykį', eventForm(e), o => saveEvent(o, e), {extra: btn('🗑 Ištrinti', 'delEvent', {id: e.id}, 'danger sm')}); };
function saveEvent(o, e, startDate) {
  if (o.end === o.start) { alert('Pradžia ir pabaiga negali sutapti'); return false; }
  const x = {title: o.title, cat: o.cat, type: o.type, start: o.start, end: o.end, travel: +o.travel || 0};
  if (o.type === 'once') x.date = o.date;
  else {
    x.from = e?.from || startDate || today();
    if (o.type === 'monthly') x.mday = clamp(+o.mday || 1, 1, 31);
    else { x.days = (o.days || []).map(Number); if (!x.days.length) { alert('Pasirink bent vieną savaitės dieną'); return false; } }
    if (o.len === 'date') x.until = o.until;
    else if (o.len !== 'forever') { const u = parseD(x.from); u.setMonth(u.getMonth() + +o.len); x.until = ymd(u); }
    else x.until = '';
  }
  if (e) { for (const k of ['date', 'days', 'mday', 'from', 'until']) delete e[k]; Object.assign(e, x); } else S.events.push({id: uid(), ...x});
  commit(); toast(overnight(x) ? '🌙 Išsaugota – baigsis kitą dieną' : 'Išsaugota ✓');
}
const repText = e => e.type === 'once' ? fmtDate(e.date) : e.type === 'monthly' ? `kas mėn. ${e.mday} d.` : `${e.type === 'biweekly' ? 'kas 2 sav.' : 'kas sav.'} ${(e.days || []).map(x => DOW[x - 1]).join(', ')}`;
const timeText = e => `${e.start}–${e.end}${overnight(e) ? ' (+1 d.)' : ''}`;
A.manageEvents = () => {
  const rec = S.events.filter(e => e.type !== 'once');
  modal('🔁 Pasikartojantys įvykiai', rec.length ? rec.map(e => `<div class="li click" data-a="editEvent" data-id="${e.id}">${chip(cat(e.cat).emoji + ' ' + esc(cat(e.cat).name), cat(e.cat).color)} <b>${esc(e.title)}</b> <small>${repText(e)} · ${timeText(e)}${e.until ? ` · iki ${fmtDate(e.until)}` : ''}</small></div>`).join('') + `<div class="choice row">${btn('+ Naujas', 'addEvent', {weekly: 1}, 'primary sm')}</div>` : empty('Dar nėra. Įrašyk paskaitas, darbą, švedų pamokas.') + btn('+ Naujas', 'addEvent', {weekly: 1}, 'primary'));
};
A.delEvent = d => { if (!confirm('Ištrinti įvykį?')) return; S.events = S.events.filter(e => e.id !== d.id); A.closeModal(); commit(); };
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
  return `<div class="toolbar"><div class="seg">${[['open', 'Neatliktos'], ['done', 'Atliktos'], ['all', 'Visos']].map(([v, l]) => `<button class="${f === v ? 'on' : ''}" data-a="taskFilter" data-f="${v}">${l}</button>`).join('')}</div>
    ${btn('📲 Į telefono kalendorių (.ics)', 'exportIcs', {}, 'sm')}${btn('+ Užduotis', 'addTask', {}, 'primary')}</div>
    <div class="stats3"><div><b>${open.length}</b><small>neatlikta</small></div><div><b class="${open.filter(t => t.due && t.due < today()).length ? 'red' : ''}">${open.filter(t => t.due && t.due < today()).length}</b><small>pavėluota</small></div><div><b class="green">${doneW}</b><small>atlikta šią savaitę</small></div></div>
    ${Object.keys(groups).length ? ['🚨 Pavėluota', 'Šiandien', 'Šią savaitę', 'Vėliau', 'Be termino', 'Atlikta'].filter(k => groups[k]).map(k => card(k, groups[k].map(taskRow).join(''))).join('') : empty('Užduočių nėra. Pridėk darbus, namų darbus, deadline\'us – programėlė primins.')}
    <p class="hint">💡 Priminimai rodomi, kai programėlė atidaryta. Kad priminimai ateitų ir į telefoną, kai ji uždaryta – spausk „Į telefono kalendorių“ ir atidaryk failą telefone (priminimai bus 1 d. ir 2 val. prieš terminą).</p>`;
}
A.taskFilter = d => { UI.taskFilter = d.f; render(); };
function taskForm(t) {
  return `${fld('Kas reikia padaryti?', inp('title', t.title, 'text', 'required placeholder="pvz. Statistikos namų darbas"'))}
  <div class="row">${fld('Terminas', inp('due', t.due, 'date'))}${fld('Laikas', inp('dueTime', t.dueTime, 'time'))}${fld('Svarba', sel('priority', [[1, '🔴 Aukšta'], [2, '🟡 Vidutinė'], [3, '🟢 Žema']], t.priority || 2))}</div>
  <div class="row">${fld('Sritis', sel('cat', [['', '—'], ...catOpts()], t.cat))}${fld('Kiek laiko užtruks? (min)', inp('est', t.est || '', 'number', 'min="0" step="15"'))}</div>
  ${fld(`Kiek padaryta: <b id="pv">${+t.progress || 0}%</b>`, `<input type="range" name="progress" min="0" max="100" step="10" value="${+t.progress || 0}" oninput="pv.textContent=this.value+'%'">`)}
  ${fld('Pastabos', `<textarea name="notes" rows="2">${esc(t.notes)}</textarea>`)}`;
}
A.addTask = () => modal('Nauja užduotis', taskForm({}), o => { S.tasks.push({id: uid(), ...o, done: false, created: today()}); commit(); toast('Užduotis pridėta'); });
A.editTask = d => { const t = S.tasks.find(x => x.id === d.id); modal('Užduotis', taskForm(t), o => { Object.assign(t, o); commit(); }, {extra: btn('🗑', 'delTask', {id: t.id}, 'danger sm')}); };
A.delTask = d => { if (!confirm('Ištrinti užduotį?')) return; S.tasks = S.tasks.filter(t => t.id !== d.id); A.closeModal(); commit(); };
A.toggleTask = d => { const t = S.tasks.find(x => x.id === d.id); t.done = !t.done; t.doneAt = t.done ? today() : null; if (t.done) { t.progress = 100; confetti(); toast(pick(MOTIVATION.taskDone) + ' +10 XP', 'good'); } commit(); };

// ICS eksportas
A.exportIcs = () => {
  const dt = (d, t) => d.replace(/-/g, '') + 'T' + (t || '09:00').replace(':', '') + '00';
  const BY = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
  let s = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//ManoGyvenimas//LT\r\nCALSCALE:GREGORIAN\r\n';
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
  const tabs = [['log', '📖 Dienynas'], ['recipes', '📗 Receptai'], ['freezer', '🧊 Šaldiklis'], ['shop', '🛒 Pirkiniai ir biudžetas'], ['foods', '🥕 Produktai']];
  const head = `<div class="tabs">${tabs.map(([v, l]) => `<button class="${UI.food === v ? 'on' : ''}" data-a="foodTab" data-v="${v}">${l}</button>`).join('')}</div>`;
  return head + ({log: fLog, recipes: fRecipes, freezer: fFreezer, shop: fShop, foods: fFoods})[UI.food]();
}
A.foodTab = d => { UI.food = d.v; render(); };
function fLog() {
  const d = UI.foodDate, tg = targets(), nu = dayNutrition(d);
  const days = range(addDays(d, -13), 14).map(x => { const n = dayNutrition(x); return {label: parseD(x).getDate() + '', segs: [{v: n.kcal, color: n.kcal > tg.kcal * 1.08 ? '#f97316' : '#4f8cff', name: 'kcal'}], click: {a: 'foodDay', d: x}}; });
  return `<div class="toolbar"><div class="navd">${btn('‹', 'foodNav', {n: -1}, 'sm')}<b>${relDay(d)} · ${fmtDate(d)}</b>${btn('›', 'foodNav', {n: 1}, 'sm')}</div>${btn('+ Valgis', 'addMeal', {d}, 'primary')}</div>
  <div class="grid2"><div>
    <div class="rings">${ring(nu.kcal, tg.kcal, '#4f8cff', nu.kcal, `/ ${tg.kcal} kcal`)}${ring(nu.p, tg.protein, '#a78bfa', Math.round(nu.p) + ' g', `/ ${tg.protein} g baltymų`)}</div>
    <p class="center">${nu.kcal <= tg.kcal ? `Liko <b>${tg.kcal - nu.kcal} kcal</b>` : `Viršyta <b class="red">${nu.kcal - tg.kcal} kcal</b>`} · Deficitas pagal TDEE: <b>${tg.tdee - nu.kcal} kcal</b></p>
    ${card('Valgiai', mealsList(d))}</div>
  <div>${card('Kalorijos per 14 d.', svgBars(days, {goal: tg.kcal, h: 180}) + '<p class="hint">Punktyras – dienos tikslas. Oranžinė – viršyta. Spausk stulpelį.</p>')}
    ${card('Tavo normos', `<div class="kv"><span>Bazinė apykaita (BMR)</span><b>${tg.bmr} kcal</b><span>Sudegini per dieną (TDEE)</span><b>${tg.tdee} kcal</b><span>Tikslas (su deficitu)</span><b>${tg.kcal} kcal</b><span>Baltymai</span><b>${tg.protein} g</b><span>Vanduo</span><b>~${tg.water} l</b></div><p class="hint">Baltymai aukšti specialiai – kad metant svorį išliktų ir augtų raumenys.</p>`)}</div></div>`;
}
A.foodNav = d => { UI.foodDate = addDays(UI.foodDate, +d.n); render(); };
A.foodDay = d => { UI.view = 'food'; UI.food = 'log'; UI.foodDate = d.d; render(); };
A.addMeal = d => { UI.mealDate = d.d || today(); mealModal(); };
function mealModal() {
  const t = UI.mealTab, tabs = [['freezer', '🧊 Iš šaldiklio'], ['recipe', '📗 Receptas'], ['food', '🥕 Produktas'], ['quick', '⚡ Greitas']];
  let body = `<div class="tabs sm">${tabs.map(([v, l]) => `<button type="button" class="${t === v ? 'on' : ''}" data-a="mealTab" data-v="${v}">${l}</button>`).join('')}</div>
    <div class="row">${fld('Data', inp('date', UI.mealDate, 'date'))}${fld('Laikas', inp('time', nowHM(), 'time'))}</div>`;
  if (t === 'freezer') {
    const fr = S.freezer.filter(f => f.portions > 0);
    body += fr.length ? fld('Ką valgai?', `<div class="radios">${fr.map((f, i) => { const r = recipe(f.recipeId), st = r ? recipeStats(r) : {}; return `<label><input type="radio" name="fid" value="${f.id}" ${i ? '' : 'checked'}><span>${r?.emoji || ''} ${esc(r?.name || '?')} <small>liko ${f.portions} porc. · ${st.kcal} kcal · ${st.p} g B</small></span></label>`; }).join('')}</div>`) + fld('Porcijos', inp('portions', 1, 'number', 'min="0.25" step="0.25"'))
      : empty('Šaldiklis tuščias. Pagamink receptą ir paspausk „Pagaminau“.');
  } else if (t === 'recipe') {
    body += fld('Receptas', sel('rid', S.recipes.map(r => [r.id, `${r.emoji} ${r.name} (${recipeStats(r).kcal} kcal/porc.)`]))) + fld('Porcijos', inp('portions', 1, 'number', 'min="0.25" step="0.25"'));
  } else if (t === 'food') {
    body += `<datalist id="foodlist">${allFoods().map(f => `<option value="${esc(f.name)}">`).join('')}</datalist>
      ${fld('Produktas', inp('fname', '', 'text', 'list="foodlist" required placeholder="Pradėk rašyti… pvz. bananai"'))}${fld('Kiekis (g)', inp('g', 100, 'number', 'min="1"'))}`;
  } else {
    body += fld('Pavadinimas', inp('name', '', 'text', 'required placeholder="pvz. Kava su pienu, kebabas…"')) + `<div class="row">${fld('Kalorijos', inp('kcal', '', 'number', 'required min="0"'))}${fld('Baltymai (g)', inp('p', '', 'number', 'min="0" step="0.1"'))}</div>`;
  }
  modal('Įrašyti valgį', body, o => {
    const m = {id: uid(), date: o.date, time: o.time};
    if (t === 'freezer') { const f = S.freezer.find(x => x.id === o.fid); if (!f) return false; const r = recipe(f.recipeId), st = recipeStats(r), n = +o.portions || 1;
      Object.assign(m, {name: r.name, recipeId: r.id, portions: n, kcal: st.kcal * n, p: st.p * n}); f.portions = round(f.portions - n, 2); if (f.portions <= 0) S.freezer = S.freezer.filter(x => x !== f); }
    else if (t === 'recipe') { const r = recipe(o.rid), st = recipeStats(r), n = +o.portions || 1; Object.assign(m, {name: r.name, recipeId: r.id, portions: n, kcal: st.kcal * n, p: st.p * n}); }
    else if (t === 'food') { const f = allFoods().find(x => x.name.toLowerCase() === o.fname.trim().toLowerCase()); if (!f) { alert('Tokio produkto nėra. Pasirink iš sąrašo arba naudok „Greitas“ / pridėk produktą skiltyje „Produktai“.'); return false; }
      const g = +o.g || 100; Object.assign(m, {name: f.name, foodId: f.id, g, kcal: f.kcal * g / 100, p: f.p * g / 100}); }
    else Object.assign(m, {name: o.name, kcal: +o.kcal || 0, p: +o.p || 0});
    S.meals.push(m); commit(); toast(`🍽️ ${esc(m.name)} – ${Math.round(m.kcal)} kcal`);
  }, {noFocus: true});
}
A.mealTab = d => { const f = $('#mform'); if (f) UI.mealDate = f.date.value; UI.mealTab = d.v; mealModal(); };
A.delMeal = d => { S.meals = S.meals.filter(m => m.id !== d.id); commit(); };

function fRecipes() {
  const q = UI.recipeQ.toLowerCase(), u = recipeUsage();
  const sug = suggestRecipes({freezableOnly: true}).slice(0, 3);
  const list = S.recipes.filter(r => !q || r.name.toLowerCase().includes(q) || r.tags.some(t => t.includes(q)));
  return `${card('✨ Rekomenduojama gaminti dabar', `<div class="sugs">${sug.map(x => `<div class="sug" data-a="viewRecipe" data-id="${x.r.id}"><div class="em">${x.r.emoji}</div><b>${esc(x.r.name)}</b><small>${x.used ? `valgyta ${x.used}× per 14 d.` : 'seniai neturėjai'} · ${x.st.cost.toFixed(2)} €/porc.</small></div>`).join('')}</div><p class="hint">Atsižvelgiama į tai, ką dažnai valgai (kad neatsibostų), kas jau yra šaldiklyje, baltymų kiekį ir savaitės biudžetą.</p>`)}
  <div class="toolbar"><input class="search" placeholder="🔍 Ieškoti recepto ar žymos (vištiena, pusryčiai…)" value="${esc(UI.recipeQ)}" data-live="recipeQ">${btn('+ Naujas receptas', 'editRecipe', {}, 'primary')}</div>
  <div class="rgrid">${list.map(r => { const st = recipeStats(r); return `<div class="rcard" data-a="viewRecipe" data-id="${r.id}"><div class="em">${r.emoji}</div><b>${esc(r.name)}</b>
    <div class="macros"><span>🔥 ${st.kcal}</span><span>🥩 ${st.p} g</span><span>💶 ${st.cost.toFixed(2)}</span><span>⏱ ${r.time}′</span></div>
    <div class="tags">${r.freezable ? '<span class="tag">🧊 šaldoma</span>' : ''}${r.tags.slice(0, 3).map(t => `<span class="tag">${esc(t)}</span>`).join('')}${u[r.id] ? `<span class="tag warn">${u[r.id]}× per 14 d.</span>` : ''}</div></div>`; }).join('')}</div>`;
}
A.viewRecipe = d => {
  const r = recipe(d.id); if (!r) return; const st = recipeStats(r), fp = freezerPortions(r.id);
  modal(`${r.emoji} ${esc(r.name)}`, `<div class="macros big"><span>🔥 ${st.kcal} kcal</span><span>🥩 ${st.p} g baltymų</span><span>🍞 ${st.c} g angl.</span><span>🧈 ${st.f} g rieb.</span></div>
    <p class="center">${r.portions} porcijos · ⏱ ${r.time} min · 💶 ${st.total.toFixed(2)} € (${st.cost.toFixed(2)} €/porc.) ${r.freezable ? '· 🧊 tinka šaldyti' : ''}${fp ? ` · šaldiklyje ${fp} porc.` : ''}</p>
    <div class="grid2"><div><h4>Ko reikia</h4><ul class="ing">${r.ing.map(([fid, g]) => { const f = food(fid); return `<li><span>${esc(f?.name || fid)}</span><b>${g} g</b></li>`; }).join('')}</ul></div>
    <div><h4>Kaip gaminti</h4><ol class="steps">${r.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol></div></div>
    <div class="choice row">${btn('✅ Pagaminau → į šaldiklį', 'cook', {id: r.id}, 'primary')}${btn('🛒 Į pirkinių sąrašą', 'planAdd', {id: r.id})}${btn('🍽️ Valgau dabar', 'eatRecipe', {id: r.id})}${btn('✏️ Redaguoti', 'editRecipe', {id: r.id})}</div>`, null, {wide: true});
};
A.cook = d => {
  const r = recipe(d.id), st = recipeStats(r);
  modal(`Pagaminau: ${esc(r.name)}`, `<div class="row">${fld('Kiek porcijų gavosi?', inp('portions', r.portions, 'number', 'min="1"'))}${fld('Kiek dedi į šaldiklį?', inp('freeze', r.freezable ? r.portions : 0, 'number', 'min="0"'))}</div>
    ${fld('Kiek kainavo produktai (€)', inp('cost', st.total.toFixed(2), 'number', 'step="0.01" min="0"'))}${fld('Data', inp('date', today(), 'date'))}`, o => {
    S.cooks.push({id: uid(), recipeId: r.id, date: o.date, portions: +o.portions, cost: +o.cost || 0});
    if (+o.freeze > 0) { const ex = S.freezer.find(f => f.recipeId === r.id); if (ex) ex.portions += +o.freeze; else S.freezer.push({id: uid(), recipeId: r.id, portions: +o.freeze, date: o.date}); }
    S.plan = S.plan.filter(p => p.rid !== r.id);
    confetti(); toast(`🧊 +${o.freeze} porc. šaldiklyje · +15 XP`, 'good'); commit();
  });
};
A.eatRecipe = d => { UI.mealTab = freezerPortions(d.id) ? 'freezer' : 'recipe'; UI.mealDate = today(); mealModal(); if (UI.mealTab === 'recipe') { const s = $('#mform [name=rid]'); if (s) s.value = d.id; } };
A.editRecipe = d => {
  const r = d.id ? recipe(d.id) : {name: '', emoji: '🍲', portions: 4, time: 30, freezable: true, tags: [], ing: [['', 100]], steps: []};
  const row = ([fid, g]) => `<div class="ingrow">${inp('ingf[]', food(fid)?.name || '', 'text', 'list="foodlist" placeholder="Produktas"')}${inp('ingg[]', g, 'number', 'min="0" placeholder="g"')}<button type="button" class="x" onclick="this.parentNode.remove()">✕</button></div>`;
  modal(d.id ? 'Redaguoti receptą' : 'Naujas receptas', `<datalist id="foodlist">${allFoods().map(f => `<option value="${esc(f.name)}">`).join('')}</datalist>
    <div class="row">${fld('Emoji', inp('emoji', r.emoji, 'text', 'maxlength="4" style="width:70px"'), 'shrink')}${fld('Pavadinimas', inp('name', r.name, 'text', 'required'))}</div>
    <div class="row">${fld('Porcijos', inp('portions', r.portions, 'number', 'min="1"'))}${fld('Laikas (min)', inp('time', r.time, 'number', 'min="1"'))}${fld('Žymos (per kablelį)', inp('tags', r.tags.join(', ')))}</div>
    <label class="cb"><input type="checkbox" name="freezable" ${r.freezable ? 'checked' : ''}> 🧊 Tinka šaldyti</label>
    <h4>Ingredientai (visam kiekiui, gramais)</h4><div id="ings">${r.ing.map(row).join('')}</div>
    <button type="button" class="btn sm" onclick="document.getElementById('ings').insertAdjacentHTML('beforeend', ${esc(JSON.stringify(row(['', 100])))})">+ ingredientas</button>
    <p class="hint">Nėra produkto sąraše? Pridėk jį skiltyje „Produktai“ (nuo pakuotės etiketės).</p>
    ${fld('Gaminimo žingsniai (kiekvienas naujoje eilutėje)', `<textarea name="steps" rows="5">${esc(r.steps.join('\n'))}</textarea>`)}`, o => {
    const ing = [], bad = [];
    (o.ingf || []).forEach((n, i) => { if (!n.trim()) return; const f = allFoods().find(x => x.name.toLowerCase() === n.trim().toLowerCase()); if (!f) bad.push(n); else ing.push([f.id, +o.ingg[i] || 0]); });
    if (bad.length) { alert('Nerasti produktai: ' + bad.join(', ') + '\nPasirink iš sąrašo arba pirma pridėk skiltyje „Produktai“.'); return false; }
    const x = {name: o.name, emoji: o.emoji || '🍲', portions: +o.portions || 1, time: +o.time || 30, freezable: !!o.freezable, tags: o.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean), ing, steps: o.steps.split('\n').map(s => s.trim()).filter(Boolean)};
    if (d.id) Object.assign(r, x); else S.recipes.push({id: 'r_' + uid(), ...x});
    commit();
  }, {wide: true, extra: d.id ? btn('🗑', 'delRecipe', {id: d.id}, 'danger sm') : ''});
};
A.delRecipe = d => { if (!confirm('Ištrinti receptą?')) return; S.recipes = S.recipes.filter(r => r.id !== d.id); A.closeModal(); commit(); };

function fFreezer() {
  const fr = S.freezer.filter(f => f.portions > 0), total = freezerPortions();
  const daysLeft = round(total / 2, 1);
  return `<div class="stats3"><div><b>${total}</b><small>porcijų šaldiklyje</small></div><div><b class="${daysLeft < 2 ? 'red' : 'green'}">${daysLeft}</b><small>dienų maisto (po 2 porc./d.)</small></div><div><b>${fr.length}</b><small>skirtingų patiekalų</small></div></div>
  ${card('🧊 Šaldiklis', fr.length ? fr.map(f => { const r = recipe(f.recipeId), st = r ? recipeStats(r) : {}; return `<div class="li"><span class="em2">${r?.emoji || '?'}</span><div><b>${esc(r?.name || 'Ištrintas receptas')}</b><br><small>užšaldyta ${relDay(f.date)} · ${st.kcal} kcal · ${st.p} g B porcijai${diffDays(f.date, today()) > 60 ? ' · <b class="red">senoka – suvalgyk greičiau</b>' : ''}</small></div><span class="sp"></span>
    <div class="stepper">${btn('−', 'frz', {id: f.id, n: -1}, 'sm')}<b>${f.portions}</b>${btn('+', 'frz', {id: f.id, n: 1}, 'sm')}</div>${btn('🍽️ Valgau', 'eatFreezer', {id: f.id}, 'sm primary')}</div>`; }).join('') : empty('Tuščia. Pasirink receptą, pagamink ir paspausk „Pagaminau“.'), btn('+ Pagaminau', 'foodTab', {v: 'recipes'}, 'sm'))}
  <p class="hint">💡 Šaldytas maistas laikosi ~2–3 mėn. Vakare persikelk rytojaus porciją į šaldytuvą – ryte tik pasiimsi.</p>`;
}
A.frz = d => { const f = S.freezer.find(x => x.id === d.id); f.portions = Math.max(0, f.portions + +d.n); if (!f.portions) S.freezer = S.freezer.filter(x => x !== f); commit(); };
A.eatFreezer = d => { UI.mealTab = 'freezer'; UI.mealDate = today(); mealModal(); const r = $(`#mform input[value="${d.id}"]`); if (r) r.checked = true; };

function fShop() {
  const bw = budgetWeek(), agg = {};
  for (const p of S.plan) { const r = recipe(p.rid); if (!r) continue; for (const [fid, g] of r.ing) agg[fid] = (agg[fid] || 0) + g * (p.mult || 1); }
  const items = Object.entries(agg).map(([fid, g]) => { const f = food(fid); return {fid, name: f?.name || fid, g: Math.round(g), cost: (f?.price || 0) * g / 1000}; }).sort((a, b) => a.name.localeCompare(b.name));
  const total = sum(items.map(i => i.cost)), checked = S.shopChecked || {};
  const pct = bw.budget ? clamp((bw.spent + total) / bw.budget * 100, 0, 100) : 0;
  const fmtG = g => g >= 1000 ? round(g / 1000, 2) + ' kg' : g + ' g';
  return `<div class="grid2"><div>
    ${card('💶 Savaitės maisto biudžetas', `<div class="budget"><div class="pbar big"><i style="width:${bw.budget ? clamp(bw.spent / bw.budget * 100, 0, 100) : 0}%"></i><i class="plan" style="width:${pct}%"></i></div>
      <div class="kv"><span>Biudžetas</span><b>${bw.budget.toFixed(2)} €</b><span>Jau išleista (pagaminta)</span><b>${bw.spent.toFixed(2)} €</b><span>Sąrašas kainuos ~</span><b>${total.toFixed(2)} €</b><span>Liks</span><b class="${bw.left - total < 0 ? 'red' : 'green'}">${(bw.left - total).toFixed(2)} €</b></div></div>
      <p class="hint">Kainos apytikslės (galima keisti produktuose). Biudžetą keisk Profilyje.</p>`)}
    ${card('📋 Ką gaminsiu šią savaitę', S.plan.length ? S.plan.map(p => { const r = recipe(p.rid); if (!r) return ''; const st = recipeStats(r); return `<div class="li"><span class="em2">${r.emoji}</span><b>${esc(r.name)}</b><small>× ${p.mult || 1} (${r.portions * (p.mult || 1)} porc.) · ${(st.total * (p.mult || 1)).toFixed(2)} €</small><span class="sp"></span>${btn('−', 'planMult', {id: p.rid, n: -1}, 'sm')}${btn('+', 'planMult', {id: p.rid, n: 1}, 'sm')}</div>`; }).join('') : empty('Pridėk receptų iš „Receptai“ → „Į pirkinių sąrašą“.'), btn('+ Receptas', 'foodTab', {v: 'recipes'}, 'sm'))}
  </div><div>
    ${card('🛒 Pirkinių sąrašas', items.length ? items.map(i => `<label class="li shop ${checked[i.fid] ? 'on' : ''}"><input type="checkbox" data-c="shopCheck" data-id="${i.fid}" ${checked[i.fid] ? 'checked' : ''}><span>${esc(i.name)}</span><span class="sp"></span><b>${fmtG(i.g)}</b><small>${i.cost.toFixed(2)} €</small></label>`).join('') + `<div class="choice row">${btn('📋 Kopijuoti sąrašą', 'copyShop', {}, 'sm')}${btn('Išvalyti', 'clearPlan', {}, 'sm ghost')}</div>` : empty('Sąrašas tuščias'))}
  </div></div>`;
}
A.planAdd = d => { const p = S.plan.find(x => x.rid === d.id); if (p) p.mult = (p.mult || 1) + 1; else S.plan.push({rid: d.id, mult: 1}); A.closeModal(); commit(); toast('🛒 Pridėta į pirkinių sąrašą'); };
A.planMult = d => { const p = S.plan.find(x => x.rid === d.id); p.mult = (p.mult || 1) + +d.n; if (p.mult <= 0) S.plan = S.plan.filter(x => x !== p); commit(); };
A.clearPlan = () => { S.plan = []; S.shopChecked = {}; commit(); };
A.copyShop = () => { const txt = [...document.querySelectorAll('.shop')].map(l => '☐ ' + l.querySelector('span').textContent + ' – ' + l.querySelector('b').textContent).join('\n'); navigator.clipboard?.writeText(txt).then(() => toast('Nukopijuota – įklijuok į žinutes ar užrašus')); };

function fFoods() {
  const q = UI.foodQ.toLowerCase(), list = allFoods().filter(f => !q || f.name.toLowerCase().includes(q));
  return `<div class="toolbar"><input class="search" placeholder="🔍 Ieškoti produkto" value="${esc(UI.foodQ)}" data-live="foodQ">${btn('+ Savas produktas', 'addFood', {}, 'primary')}</div>
  <div class="card"><table class="tbl"><thead><tr><th>Produktas</th><th>kcal</th><th>B</th><th>A</th><th>R</th><th>€/kg</th><th></th></tr></thead><tbody>${list.map(f => `<tr><td>${esc(f.name)}${f.builtin ? '' : ' <span class="tag">savas</span>'}</td><td>${f.kcal}</td><td>${f.p}</td><td>${f.c}</td><td>${f.f}</td><td>${(f.price || 0).toFixed(2)}</td><td>${f.builtin ? '' : `<button class="x" data-a="delFood" data-id="${f.id}">✕</button>`}</td></tr>`).join('')}</tbody></table>
  <p class="hint">Vertės 100 g produkto. B – baltymai, A – angliavandeniai, R – riebalai.</p></div>`;
}
A.addFood = () => modal('Naujas produktas', `<p class="hint">Vertes rasi ant pakuotės (100 g).</p>${fld('Pavadinimas', inp('name', '', 'text', 'required'))}
  <div class="row">${fld('kcal / 100 g', inp('kcal', '', 'number', 'required step="0.1"'))}${fld('Baltymai', inp('p', '', 'number', 'step="0.1"'))}${fld('Angliav.', inp('c', '', 'number', 'step="0.1"'))}${fld('Riebalai', inp('f', '', 'number', 'step="0.1"'))}</div>${fld('Kaina €/kg (nebūtina)', inp('price', '', 'number', 'step="0.01"'))}`,
  o => { S.foods.push({id: 'f_' + uid(), name: o.name, kcal: +o.kcal, p: +o.p || 0, c: +o.c || 0, f: +o.f || 0, price: +o.price || 0}); commit(); toast('Produktas pridėtas'); });
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
  const upcoming = (S.plans || []).filter(x => x.status === 'planned' && x.date >= today()).sort((a, b) => (a.date + a.start) < (b.date + b.start) ? -1 : 1);
  const neg = neglected(), rv = sportReviewDue();
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
    ${card('🧍 Kada kas treniruota', bodyMap() + '<p class="hint">Spausk raumenį arba eilutę – pamatysi pratimus. Kaklas, riešai ir kt. įspėjimuose rodomi tik jei juos kada nors treniravai.</p>')}
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
  UI.draft = {type: d.type || 'auto', date: d.d || d.date || today(), start, duration: +S.profile.workoutMin || 40};
  UI.draft.exercises = buildFor(UI.draft.type, UI.draft.duration);
  planModal();
};
A.openPlan = d => { const p = S.plans.find(x => x.id === d.id); if (!p) return; UI.draft = JSON.parse(JSON.stringify(p)); planModal(); };
function buildFor(type, minutes) { const w = WTYPES.find(x => x.id === type); return buildWorkout(w?.groups || suggestWorkout(minutes).focus, minutes); }
function syncDraft() { const f = $('#mform'); if (!f || !UI.draft) return; const o = formObj(f); if (o.date) UI.draft.date = o.date; if (o.start) UI.draft.start = o.start; if (o.duration) UI.draft.duration = +o.duration; }
function planModal() {
  const D = UI.draft, w = WTYPES.find(x => x.id === D.type), inPlan = new Set(D.exercises.flatMap(x => exercise(x.id)?.g || []));
  const neg = neglected().filter(x => !inPlan.has(x.g));
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
    <p class="hint">🔄 – pakeisti kitu tos pačios grupės pratimu. Pakartojimai paskaičiuoti pagal tavo praeitus kartus (+1 – kad progresuotum).</p>`,
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
  modal(`Kodėl ne ${MUSCLES[d.g].toLowerCase()}?`, `<p class="hint">Atsakyk sąžiningai – pagal tai pakoreguosiu pasiūlymus.</p><div class="choice">${SKIP_REASONS.map(r => btn(`${r.emoji} ${r.name}`, 'reasonSet', {g: d.g, r: r.id}, 'big')).join('')}</div>`);
};
A.reasonSet = d => {
  const r = SKIP_REASONS.find(x => x.id === d.r), used = [...new Set(S.workouts.flatMap(w => (w.exercises || []).map(x => x.id)).filter(id => exercise(id)?.g.includes(d.g)))];
  S.sportPrefs[d.g] = {reason: d.r, date: today(), used}; commit({noRender: true});
  modal('Supratau 👍', `<p><b>${MUSCLES[d.g]}:</b> ${r.fix}</p><div class="choice row">${btn('Gerai', UI.reasonBack === 'plan' && UI.draft ? 'backToPlan' : 'sportReview', {}, 'primary')}</div>`);
};
A.backToPlan = () => planModal();

// ---------- Treniruotės režimas ----------
A.startPlan = d => {
  const p = S.plans.find(x => x.id === d.id); if (!p) return;
  if (S.active && !confirm('Jau vyksta kita treniruotė. Pradėti naują?')) return;
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
    <p class="hint">Spausk seriją, kai ją padarai – prasidės 60 s poilsis. −/+ keičia likusių serijų pakartojimus.</p>
    <div class="choice row">${btn('🏁 Baigti treniruotę', 'wFinish', {}, 'primary')}${btn('Atšaukti', 'wCancel', {}, 'sm ghost')}</div>`, null, {wide: true});
  tickRest();
};
A.wSet = d => { const x = S.active.ex[+d.i]; x.done[+d.j] = !x.done[+d.j]; if (x.done[+d.j]) REST_UNTIL = Date.now() + 60000; commit({noRender: true}); A.workoutMode(); };
A.wAdj = d => { const x = S.active.ex[+d.i]; x.reps = x.reps.map((r, j) => x.done[j] ? r : Math.max(1, r + +d.n)); commit({noRender: true}); A.workoutMode(); };
A.wCancel = () => { if (!confirm('Atšaukti treniruotę? Niekas nebus įrašyta.')) return; S.active = null; REST_UNTIL = 0; A.closeModal(); commit(); };
A.wFinish = () => {
  const a = S.active, done = a.ex.map(x => ({id: x.id, sets: x.reps.filter((_, j) => x.done[j])})).filter(x => x.sets.length);
  if (!done.length && !confirm('Nepažymėjai nė vienos serijos. Įrašyti visas kaip padarytas?')) return;
  const exercises = done.length ? done : a.ex.map(x => ({id: x.id, sets: x.reps}));
  const duration = Math.max(1, Math.round((Date.now() - a.ts) / 60000));
  S.workouts.push({id: uid(), date: a.date, start: a.start, duration, exercises, type: a.type, feel: 4});
  const p = S.plans.find(x => x.id === a.planId); if (p) p.status = 'done';
  S.active = null; REST_UNTIL = 0; A.closeModal(); confetti(); toast(`${pick(MOTIVATION.workoutDone)} ${duration} min · +25 XP`, 'good'); commit();
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
A.delWorkout = d => { if (!confirm('Ištrinti treniruotę?')) return; S.workouts = S.workouts.filter(w => w.id !== d.id); A.closeModal(); commit(); };

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
  ${card('⏱️ Greitas laikmatis', `<div class="catgrid sm">${S.categories.map(c => `<button class="catbtn ${S.timer?.cat === c.id ? 'on' : ''}" style="--c:${c.color}" data-a="${S.timer?.cat === c.id ? 'timerStop' : 'timerStart'}" data-cat="${c.id}">${c.emoji}<span>${esc(c.name)}</span></button>`).join('')}</div><p class="hint">Spausk, kai pradedi kažką daryti (ir Netflix 😉). Paskaitos/darbas iš kalendoriaus skaičiuojami automatiškai.</p>`)}
  <div class="stats3"><div><b class="green">${fmtH(prod)}</b><small>produktyvu ${delta(prod, prev.prod, true)}</small></div><div><b class="red">${fmtH(screen)}</b><small>ekranai / Netflix ${delta(screen, prev.screen, false)}</small></div><div><b>${n > 1 ? fmtH(prod / Math.max(1, days.filter(d => d <= today()).length)) : fmtH(prod)}</b><small>produktyvu per dieną (vid.)</small></div></div>
  <div class="grid2"><div>
    ${n > 1 ? card('Laikas pagal dienas', svgBars(bars, {h: 220, fmt: v => round(v / 60, 1) + 'h'}) + '<p class="hint">Spausk stulpelį – atsidarys ta diena.</p>') : card('Dienos laiko juosta', timeline(T.date, {scale: 0.6}))}
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
A.addLog = d => { const st = d.start || fromMin(Math.round((nowMin() - 60) / 5) * 5); modal('Ką veikiau?', logForm({date: d.date || today(), start: st, end: fromMin(toMin(st) + 60)}) + '<p class="hint">🌙 Jei pabaiga ankstesnė už pradžią – pereis į kitą dieną.</p>', o => { if (!o.cat || o.start === o.end) return false; pushLog(o); commit(); }, {noFocus: true}); };
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
  return `<div class="toolbar">${btn('⚖️ Pasisverti', 'addWeight', {}, 'primary')}${btn('🪞 Savaitės patikrinimas', 'checkin', {t: 'week'})}${btn('📆 Mėnesio patikrinimas', 'checkin', {t: 'month'})}</div>
  <div class="stats4"><div><b>${cw || '–'} kg</b><small>dabar</small></div><div><b class="${start - cw > 0 ? 'green' : ''}">${start && cw ? (cw - start > 0 ? '+' : '') + round(cw - start, 1) : '–'} kg</b><small>nuo pradžios</small></div>
    <div><b>${toGo != null ? toGo + ' kg' : '–'}</b><small>iki tikslo${eta ? ` · ~${fmtDate(eta)}` : ''}</small></div><div><b>${trend != null ? (trend > 0 ? '+' : '') + round(trend, 2) : '–'}</b><small>kg/sav. tendencija</small></div></div>
  <div class="grid2"><div>
    ${card('⚖️ Svoris', svgLine(series, {xLabels: xl, h: 220}) + `<p class="hint">KMI ${tg.bmi || '–'} · Sveikas tempas – 0,3–0,8 kg per savaitę. Žalia linija – tikslas.</p>`)}
    ${card('📏 Liemens apimtis', waist.length ? svgLine([{points: waist, color: '#a78bfa', area: true}], {h: 160}) + '<p class="hint">Jei svoris stovi, bet liemuo mažėja – riebalai virsta raumenimis 💪</p>' : empty('Sverdamasis įrašyk ir liemens apimtį (cm, ties bambos aukščiu).'))}
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
    ${row('Svoris (pab.)', a.weightEnd, b.weightEnd, v => v + ' kg', false)}</tbody></table>`);
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
function checkinDue() {
  const t = today();
  if (parseD(t).getDate() <= 3 && !S.checkins.some(c => c.type === 'month' && c.date >= monthStart(t))) return S.meals.length + S.weights.length > 3 ? 'month' : null;
  if ([7, 1].includes(dow(t)) && !S.checkins.some(c => c.type === 'week' && c.date >= addDays(t, -5))) return 'week';
  return null;
}
A.checkin = d => {
  const isW = d.t === 'week', from = isW ? addDays(weekStart(today()), dow(today()) === 1 ? -7 : 0) : (parseD(today()).getDate() <= 3 ? monthStart(addDays(monthStart(today()), -1)) : monthStart(today()));
  const n = isW ? 7 : daysInMonth(from), st = periodStats(from, n), prev = periodStats(isW ? addDays(from, -7) : monthStart(addDays(from, -1)), n);
  const mot = motivation();
  const emo = (name, v) => `<div class="emo">${['😫', '😕', '😐', '🙂', '😁'].map((e, i) => `<label><input type="radio" name="${name}" value="${i + 1}" ${i === 2 ? 'checked' : ''}><span>${e}</span></label>`).join('')}</div>`;
  modal(isW ? '🪞 Savaitės patikrinimas' : '📆 Mėnesio patikrinimas', `
    <div class="mot">${mot.map(m => `<p class="${m.good ? 'good' : ''}">${m.t}</p>`).join('')}</div>
    ${reportCard(isW ? 'Kaip sekėsi' : 'Mėnesio suvestinė', st, prev)}
    <div class="row">${fld('Svoris dabar (kg)', inp('weight', currentWeight() || '', 'number', 'step="0.1"'))}${fld('Liemuo (cm)', inp('waist', '', 'number', 'step="0.5"'))}</div>
    ${fld('Nuotaika', emo('mood'))}${fld('Energija', emo('energy'))}${fld('Kaip vertini savo produktyvumą?', emo('prod'))}
    ${fld('Kas pavyko? 🏆', `<textarea name="wins" rows="2" placeholder="pvz. 3 treniruotės, pabaigiau referatą"></textarea>`)}
    ${fld('Kas nesisekė / ką keisti?', `<textarea name="improve" rows="2" placeholder="pvz. per daug Netflix vakarais"></textarea>`)}
    ${fld(isW ? 'Pagrindinis kitos savaitės tikslas 🎯' : 'Kito mėnesio tikslas 🎯', inp('focus', '', 'text', 'placeholder="pvz. eiti miegoti iki 23:30"'))}`, o => {
    S.checkins.push({id: uid(), type: d.t, date: today(), weight: +o.weight || null, waist: +o.waist || null, mood: +o.mood, energy: +o.energy, prod: +o.prod, wins: o.wins, improve: o.improve, focus: o.focus});
    if (+o.weight) { S.weights = S.weights.filter(w => w.date !== today()); S.weights.push({date: today(), kg: +o.weight, waist: +o.waist || null}); }
    if (o.focus) S.notes.unshift({id: uid(), title: `🎯 Tikslas: ${o.focus}`, body: `${isW ? 'Savaitės' : 'Mėnesio'} tikslas nuo ${fmtDate(today())}.\n\nKas pavyko: ${o.wins}\nKą keisti: ${o.improve}`, updated: Date.now(), pinned: true});
    confetti(); toast('Patikrinimas išsaugotas · +30 XP', 'good'); commit();
  }, {wide: true, submit: 'Užbaigti patikrinimą'});
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
A.delNote = d => { if (!confirm('Ištrinti užrašą?')) return; S.notes = S.notes.filter(n => n.id !== d.id); UI.noteId = null; commit(); };

// ================= PROFILIS / NUSTATYMAI =================
function profileFields(p) {
  return `<div class="row">${fld('Vardas', inp('name', p.name))}${fld('Lytis', sel('sex', [['m', 'Vyras'], ['f', 'Moteris']], p.sex))}${fld('Gimimo metai', inp('birthYear', p.birthYear, 'number', 'min="1940" max="2015" required'))}</div>
  <div class="row">${fld('Ūgis (cm)', inp('height', p.height, 'number', 'required min="120" max="230"'))}${fld('Dabartinis svoris (kg)', inp('weightNow', currentWeight() || p.startWeight, 'number', 'step="0.1" required'))}${fld('Tikslo svoris (kg)', inp('targetWeight', p.targetWeight, 'number', 'step="0.1"'))}</div>
  <div class="row">${fld('Aktyvumas (be treniruočių)', sel('activity', [[1.2, 'Sėdimas (mokslai, kompiuteris)'], [1.375, 'Lengvai aktyvus (1–3 treniruotės)'], [1.55, 'Vidutiniškai (3–5 treniruotės)'], [1.725, 'Labai aktyvus']], p.activity))}
    ${fld('Tempas', sel('goalRate', [[0.25, 'Lėtai: −0,25 kg/sav.'], [0.5, 'Optimaliai: −0,5 kg/sav.'], [0.75, 'Greitai: −0,75 kg/sav.'], [0, 'Palaikyti svorį']], p.goalRate))}</div>
  <h4>⏰ Dienos ritmas</h4>
  <div class="row">${fld('Keliuosi', inp('wake', p.wake, 'time'))}${fld('Einu miegoti', inp('bed', p.bed, 'time'))}${fld('Miego tikslas (val)', inp('sleepGoal', p.sleepGoal, 'number', 'step="0.5"'))}</div>
  <h4>💪 Sportas</h4>
  <div class="row">${fld('Treniruotės trukmė (min)', inp('workoutMin', p.workoutMin, 'number'))}${fld('Dušas ir susitvarkymas (min)', inp('showerMin', p.showerMin, 'number'))}${fld('Kelionė į sportą (min, namie – 0)', inp('travelMin', p.travelMin, 'number'))}${fld('Treniruočių per savaitę', inp('workoutsPerWeek', p.workoutsPerWeek, 'number', 'min="1" max="7"'))}</div>
  <h4>🎯 Tikslai ir biudžetas</h4>
  <div class="row">${fld('Produktyvių valandų per dieną', inp('prodGoalH', p.prodGoalH, 'number', 'step="0.5"'))}${fld('Ekrano limitas per dieną (min)', inp('screenLimitMin', p.screenLimitMin, 'number'))}${fld('Maisto biudžetas per savaitę (€)', inp('budgetWeek', p.budgetWeek, 'number'))}${fld('Gaminimo diena', sel('cookDay', DOW_LONG.map((x, i) => [i + 1, x]), p.cookDay))}</div>`;
}
function saveProfile(o) {
  const w = +o.weightNow; delete o.weightNow;
  for (const k of Object.keys(o)) S.profile[k] = ['name', 'sex', 'wake', 'bed'].includes(k) ? o[k] : (o[k] === '' ? '' : +o[k]);
  if (w && w !== currentWeight()) { S.weights = S.weights.filter(x => x.date !== today()); S.weights.push({date: today(), kg: w}); }
  if (!S.profile.startWeight) S.profile.startWeight = w;
}
function vSettings() {
  const tg = targets();
  return `<div class="grid2"><div>${card('👤 Mano duomenys', `<form id="pform">${profileFields(S.profile)}<div class="choice row"><button class="btn primary" type="submit">Išsaugoti</button></div></form>`)}</div>
  <div>${card('📊 Paskaičiuota', `<div class="kv"><span>Amžius</span><b>${age()} m.</b><span>KMI</span><b>${tg.bmi || '–'}</b><span>BMR</span><b>${tg.bmr} kcal</b><span>TDEE</span><b>${tg.tdee} kcal</b><span>Kalorijų tikslas</span><b>${tg.kcal} kcal (−${tg.deficit})</b><span>Baltymai</span><b>${tg.protein} g / d.</b><span>Vanduo</span><b>${tg.water} l</b></div><p class="hint">Mifflin-St Jeor formulė. Atnaujinus svorį skaičiuojama iš naujo automatiškai.</p>`)}
  ${card('🏷️ Veiklų kategorijos', S.categories.map((c, i) => `<div class="catrow"><input value="${esc(c.emoji)}" data-cat="${i}" data-k="emoji" maxlength="4"><input value="${esc(c.name)}" data-cat="${i}" data-k="name"><input type="color" value="${c.color}" data-cat="${i}" data-k="color">${sel('t', [[1, '✅ produktyvu'], [0, '⚪ neutralu'], [-1, '📺 ekranas/laisvalaikis']], c.type, `data-cat="${i}" data-k="type"`)}<button class="x" data-a="delCat" data-i="${i}">✕</button></div>`).join('') + btn('+ Kategorija', 'addCat', {}, 'sm'))}
  ${card('🔔 Priminimai', `<p>Naršyklės pranešimai: <b>${'Notification' in window ? ({granted: 'įjungti ✓', denied: 'užblokuoti', default: 'neįjungti'})[Notification.permission] : 'nepalaikoma'}</b></p>${btn('Įjungti pranešimus', 'enableNotif', {}, 'sm')} ${btn('📲 Eksportuoti į telefono kalendorių', 'exportIcs', {}, 'sm')}<p class="hint">Pranešimai veikia, kol programėlė atidaryta. Patikimiems priminimams telefone naudok kalendoriaus eksportą.</p>`)}
  ${cloudOn() ? card('👤 Paskyra', `<p>Prisijungęs kaip <b>${esc(Auth.user()?.email)}</b>. Duomenys saugomi debesyje ir sinchronizuojasi tarp įrenginių.</p>${btn('Atsijungti', 'logout', {}, 'sm danger')}`) : ''}
  ${card('💾 Duomenys', `<p class="hint">${cloudOn() ? 'Duomenys saugomi debesyje. Atsarginę kopiją kartais atsisiųsk ir pats.' : 'Duomenys saugomi kompiuterio aplanke „duomenys“ (kasdien daroma atsarginė kopija).'}</p><div class="choice row">${btn('⬇ Atsisiųsti kopiją', 'exportData', {}, 'sm')}<label class="btn sm">⬆ Įkelti kopiją<input type="file" accept=".json" data-c="importData" hidden></label>${btn(S.settings.theme === 'dark' ? '☀️ Šviesi tema' : '🌙 Tamsi tema', 'theme', {}, 'sm')}</div>`)}</div></div>`;
}
A.addCat = () => { S.categories.push({id: 'c_' + uid(), name: 'Nauja', emoji: '⭐', color: '#888888', type: 0}); commit(); };
A.delCat = d => { if (!confirm('Ištrinti kategoriją? Seni įrašai liks, bet be spalvos.')) return; S.categories.splice(+d.i, 1); commit(); };
A.enableNotif = async () => { if (!('Notification' in window)) return toast('Ši naršyklė nepalaiko pranešimų'); const r = await Notification.requestPermission(); toast(r === 'granted' ? 'Pranešimai įjungti 🔔' : 'Pranešimai neleisti'); render(); };
A.exportData = () => download(`mano-gyvenimas-${today()}.json`, JSON.stringify(S, null, 1), 'application/json');
A.theme = () => { S.settings.theme = S.settings.theme === 'dark' ? 'light' : 'dark'; applyTheme(); commit(); };
function applyTheme() { document.documentElement.dataset.theme = S?.settings?.theme || 'dark'; }
function openProfileModal(first) {
  modal(first ? '👋 Sveikas! Pradėkim nuo tavęs' : 'Profilis', `${first ? '<p class="hint">Pagal tai paskaičiuosiu kalorijų ir baltymų normas, laisvus laiko langus sportui. Viską galėsi keisti skiltyje „Profilis“.</p>' : ''}${profileFields(S.profile)}`, o => { saveProfile(o); commit(); if (first) { confetti(); toast('Profilis sukurtas! Dabar įrašyk savo tvarkaraštį kalendoriuje 📅', 'good'); } }, {wide: true, submit: first ? 'Pradėti 🚀' : 'Išsaugoti'});
}

// ================= PRIMINIMAI =================
function remindOnce(key, title, body) {
  let seen = {}; try { seen = JSON.parse(localStorage.getItem('manogyv_seen') || '{}'); } catch (e) {}
  if (seen[key]) return; seen[key] = today();
  for (const k in seen) if (seen[k] < addDays(today(), -14)) delete seen[k];
  localStorage.setItem('manogyv_seen', JSON.stringify(seen)); notify(title, body);
}
function checkReminders() {
  if (!S) return; const t = today(), now = nowMin();
  for (const e of eventsOn(t)) { const s = toMin(e.start) - (+e.travel || 0); if (s - now <= 15 && s - now > 0) remindOnce(`ev|${e.id}|${t}`, `${cat(e.cat).emoji} ${e.title}`, `Prasideda ${e.start}${+e.travel ? ' – laikas išeiti' : ''}`); }
  for (const k of S.tasks.filter(x => !x.done && x.due)) {
    const dd = diffDays(t, k.due);
    if (dd < 0) remindOnce(`late|${k.id}|${t}`, '🚨 Pavėluota užduotis', `${k.title} (terminas ${fmtDate(k.due)})`);
    else if (dd === 0) remindOnce(`today|${k.id}|${t}`, '📌 Šiandien terminas', `${k.title}${k.dueTime ? ' iki ' + k.dueTime : ''}${+k.progress ? ` · padaryta ${k.progress}%` : ''}`);
    else if (dd === 1) remindOnce(`tmr|${k.id}|${t}`, '⏰ Rytoj terminas', k.title);
    else if (dd <= 3 && (+k.progress || 0) < 50) remindOnce(`slow|${k.id}|${t}`, '🐢 Užduotis atsilieka', `${k.title}: liko ${dd} d., padaryta tik ${+k.progress || 0}%`);
  }
  const bed = toMin(S.profile.bed); if (bed - now <= 30 && bed - now > 0) remindOnce(`bed|${t}`, '🌙 Po 30 min – miegas', 'Padėk telefoną, pasiruošk rytojui (ir išsiimk porciją iš šaldiklio 🧊)');
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
  if (el.dataset.toggle === 'evtype') { const v = el.value; $('.ev-once').classList.toggle('hide', v !== 'once'); $('.ev-days').classList.toggle('hide', !['weekly', 'biweekly'].includes(v)); $('.ev-month').classList.toggle('hide', v !== 'monthly'); $('.ev-rep').classList.toggle('hide', v === 'once'); }
  if (el.dataset.toggle === 'evlen') $('.ev-until').classList.toggle('hide', el.value !== 'date');
  if (el.dataset.cat !== undefined && el.dataset.k) { const c = S.categories[+el.dataset.cat]; c[el.dataset.k] = el.dataset.k === 'type' ? +el.value : el.value; commit({noRender: true}); }
  if (el.dataset.c === 'shopCheck') { S.shopChecked = S.shopChecked || {}; S.shopChecked[el.dataset.id] = el.checked; el.closest('.shop').classList.toggle('on', el.checked); commit({noRender: true}); }
  if (el.dataset.c === 'importData') { const f = el.files[0]; if (!f) return; f.text().then(t => { try { const d = JSON.parse(t); if (!d.profile) throw 0; if (!confirm('Pakeisti VISUS dabartinius duomenis šia kopija?')) return; S = migrate(d); commit(); toast('Duomenys įkelti ✓', 'good'); } catch (x) { alert('Netinkamas failas'); } }); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') A.closeModal(); });

// ================= PALEIDIMAS =================
function loginScreen(msg = '') {
  document.body.classList.add('login');
  $('#main').innerHTML = '';
  $('#modal').classList.remove('open');
  document.querySelector('.app').innerHTML = `<div class="loginbox"><div class="logo big">🌱</div><h1>Mano gyvenimas</h1><p class="hint">Prisijunk – duomenys sinchronizuosis tarp telefono ir kompiuterio.</p>
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
    loginScreen('⚠️ ' + (m.includes('Invalid login') ? 'Neteisingas el. paštas arba slaptažodis' : m.includes('not confirmed') ? 'El. paštas dar nepatvirtintas – paspausk nuorodą laiške' : esc(m)));
  }
});
A.logout = () => { if (!confirm('Atsijungti šiame įrenginyje?')) return; Auth.logout(); location.reload(); };

(async () => {
  if (!(await loadData())) { loginScreen(); return; }
  applyTheme(); render();
  if (!S.profile.height) openProfileModal(true);
  checkReminders();
  setInterval(() => { checkReminders(); if (!$('#modal.open') && ['today', 'calendar'].includes(UI.view) && document.activeElement?.tagName !== 'INPUT') render(); }, 60000);
  setInterval(pullIfChanged, 20000);
  setInterval(() => { const el = $('#tElapsed'); if (el) el.textContent = timerElapsed(); if (S.active) document.querySelectorAll('.wClock').forEach(x => x.textContent = clock(S.active.ts)); tickRest(); }, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) pullIfChanged(); });
  window.addEventListener('online', () => pullIfChanged());
  if ('serviceWorker' in navigator && window.isSecureContext) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
