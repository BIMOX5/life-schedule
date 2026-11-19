// ===================== LAISVĖ =====================
// Taisyklės: docs/laisve-technika.md. Pasaulio variklis: laisve-world.js (sugeneruotas iš maketo).
// Duomenys: S.free = {on, subs: [{id, k, mode, start, limit, unit, price, days: {data: 'ok'|'slip'|'over'}, counts: {data: n}}], xp, why, seen}

const FREE_SUBS = {
  cig: ['Cigaretės', 'cigarečių', 'cig', 'cigaretės'], vape: ['Elektroninė cigaretė', 'elektroninės', 'vape', 'įtraukimai'], pouch: ['Snusas, maišeliai', 'snuso', 'pouch', 'maišeliai'],
  heat: ['Kaitinamas tabakas', 'kaitinamo tabako', 'heat', 'lazdelės'], chew: ['Kramtomas tabakas', 'kramtomo tabako', 'pouch', 'porcijos'], hookah: ['Kaljanas', 'kaljano', 'wind', 'kartai'],
  alc: ['Alkoholis', 'alkoholio', 'glass', 'vnt.'], energy: ['Energetiniai', 'energetinių', 'can', 'skardinės'], fast: ['Greitas maistas', 'greito maisto', 'burger', 'kartai'], other: ['Kita', 'to, ką keiti', 'star', 'kartai']};
const freeSub = k => FREE_SUBS[k] || FREE_SUBS.other;
const FREE_MODES = {quit: 'Mesti', reduce: 'Mažinti', track: 'Stebėti'};
// kraštai pagal dienas (Stebėti – pagal mėnesius); ženkliukai – maketo MS eilė
const FREE_LANDS = [0, 14, 60, 180, 365, 730, 1825, Infinity];
const FREE_MS = [1, 3, 7, 14, 30, 90, 182, 365, 730, 1825, 3650, 9125, 18250];
const FREE_LINES = ['Tu stipresnis už norą.', 'Kiekviena diena skaičiuojasi.', 'Didžiuojuosi tavim.', 'Noras praeis. Tu liksi.', 'Šiandien – irgi tavo.', 'Dar viena gera diena.', 'Kvėpuok. Tu gali.',
  'Mažais žingsniais toli nueisi.', 'Tavo kūnas jau dėkoja.', 'Esu šalia.', 'Gera matyti tave čia.', 'Rytas be skubos – geras rytas.', 'Tu tai darai dėl savęs.', 'Lengviau nebus, bet tu stiprėsi.',
  'Kiekvienas „ne“ – tavo pergalė.', 'Ramiai. Viena diena.', 'Tu jau daug nuėjai.', 'Šiandien gali būti gera diena.', 'Tavo laisvė auga.', 'Ačiū, kad stengiesi.', 'Norai ateina ir praeina.',
  'Tu ne vienas.', 'Pasigirk sau – nusipelnei.', 'Šiandien tu – svarbiausias.', 'Gerai, kad grįžai.', 'Pamažu – irgi pirmyn.', 'Tavo valia – tavo raumuo.', 'Kiekviena minutė skaičiuojasi.'];

// tako dalis ekrane: apačia paslėpta po lapu, viršus – prie horizonto
const FREE_T0 = .24, FREE_TS = .66;
const lvIc = id => `<svg class="i"><use href="#${id}"/></svg>`;
const freeOn = () => !!S?.free?.on;
const freeData = () => (S.free = S.free || {on: false, subs: [], xp: 0, why: '', seen: []});
// dienų skaičius: iki metų „N d.“, toliau „1 m. 12 d.“
function fmtFree(n) { n = Math.max(0, Math.floor(n)); if (n < 365) return `${n} d.`; const y = Math.floor(n / 365), d = n % 365; return `${y} m.${d ? ` ${d} d.` : ''}`; }

// ---- progresas iš dienų sąrašo (perskaičiuojamas kaskart) ----
function freeProg(sub, upTo = today()) {
  const y = addDays(upTo, -1); let n = 0, resets = 0, run = 0;
  for (let d = sub.start; d <= upTo; d = addDays(d, 1)) {
    const c = (sub.counts || {})[d], st = sub.days[d] || (sub.mode === 'reduce' && c > (+sub.limit || 0) ? 'over' : sub.mode === 'track' && c != null ? 'ok' : null);
    if (sub.mode === 'quit') {
      if (st === 'ok') n++; else if (st === 'slip') { if (n || run) resets++; n = 0; } else if (d < y) { if (n) resets++; n = 0; }   // užvakar ir senesnė nepažymėta – iš naujo
    } else if (sub.mode === 'reduce') { if (st === 'ok') n++; else if (st !== 'over' && d < y) n = Math.max(freeLandFloor(n), n - 1); }
    else if (st === 'ok') n++;
    run++;
  }
  const lands = sub.mode === 'track' ? null : FREE_LANDS, li = lands ? lands.findIndex((v, i) => n < lands[i + 1]) : Math.min(6, Math.floor((Date.parse(upTo) - Date.parse(sub.start)) / (30 * 864e5)));
  return {n, resets, land: li, from: lands ? lands[li] : 0, to: lands ? lands[li + 1] : 0, today: sub.days[upTo] || null, yest: sub.start <= y ? sub.days[y] || null : 'na'};
}
// Mažinant – iš pasiekto krašto neišmeta
function freeLandFloor(n) { let f = 0; for (const v of FREE_LANDS) if (v <= n && v !== Infinity) f = v; return f; }
// pagrindinis takas – griežčiausias: Mesti > Mažinti > Stebėti
const freeMain = () => { const s = freeData().subs; return ['quit', 'reduce', 'track'].map(m => s.find(x => x.mode === m)).find(Boolean); };
const freeSeason = () => { const m = +today().slice(5, 7); return m <= 2 || m === 12 ? 'winter' : m <= 5 ? 'spring' : m <= 8 ? '' : 'autumn'; };
const freeLevel = () => { const xp = freeData().xp || 0; return {lv: 1 + Math.floor(xp / 100), xp, p: xp % 100}; };
// Daigelio sakinys – kasdien kitas, nesikartoja (paskutiniai 20 neberodomi)
function freeLine(next) {
  const F = freeData(); if (!next && F.line?.d === today()) return FREE_LINES[F.line.i] || FREE_LINES[0];
  const seen = F.seen || [], pool = FREE_LINES.map((_, i) => i).filter(i => !seen.includes(i)), i = pool.length ? pool[Math.floor(Math.random() * pool.length)] : 0;
  F.seen = [...seen, i].slice(-20); F.line = {d: today(), i}; return FREE_LINES[i];
}

// ---- pasaulio vieta: kraštas, išvaizda, padėtis take ----
function freeWorldCfg(W) {
  const sub = freeMain(), P = freeProg(sub), span = isFinite(P.to) ? P.to - P.from : 3650, k = Math.min(1, (P.n - P.from) / span);
  const look = sub.mode === 'track' ? (P.land * 7 + (+sub.start.slice(8, 10))) % 3 : P.resets % 3, t = FREE_T0 + FREE_TS * k;
  const pins = FREE_MS.map((d, i) => [d, i]).filter(([d]) => d >= P.from && d < P.to).map(([d, i]) => {
    const kk = Math.min(1, (d - P.from) / span), label = LVW.MS[i][0]; return [FREE_T0 + FREE_TS * kk, P.n >= d ? 'ok' : 'nxt', P.n >= d ? label : `<em>${label}</em>`, '', i]; });
  // ženkliukas neužlipa ant Daigelio: per arti – pastumiam toliau taku
  pins.forEach(p => { if (Math.abs(p[0] - t) < .08) p[0] = Math.min(.95, t + .08); });
  const nx = pins.findIndex(p => p[1] === 'nxt'); pins.forEach((p, i) => { if (p[1] === 'nxt' && i !== nx) { p[1] = 'dot'; p[2] = ''; } });
  const h = new Date().getHours();
  return {sub, P, o: {W, h: 440, cut: false, bio: Math.min(6, P.land), look, season: LVW.LANDS[Math.min(6, P.land)]?.snowy ? '' : freeSeason(), tod: h >= 18 || h < 5 ? 'evening' : 'day', t, ex: P.today === 'ok' ? 'proud' : 'smile', say: esc(freeLine()), sayDir: 'l', pins}};
}

// ---- ekranas ----
let LV_LOADING = null;
const loadLaisve = () => window.LVW ? Promise.resolve() : (LV_LOADING = LV_LOADING || new Promise(ok => { const v = window.APP_VERSION, s = document.createElement('script'); s.src = (!v || v === 'src' ? 'src/' : `v/${v}/`) + 'laisve-world.js'; s.onload = ok; s.onerror = ok; document.body.appendChild(s); }));
function vFree() {
  const F = freeData();
  if (!F.subs.length) return freeStart();
  if (!window.LVW) { loadLaisve().then(() => UI.view === 'free' && render()); return `<div class="lvw lv-wait">${daigelis(4)}</div>`; }
  const M = $('#main'), cs = M && getComputedStyle(M), W = Math.min(620, M ? M.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) : 343), {sub, P, o} = freeWorldCfg(W), L = freeLevel(), land = LVW.LANDS[Math.min(6, P.land)]?.n || '';
  const key = JSON.stringify([o.bio, o.look, o.season, o.tod, o.t.toFixed(3), o.ex, o.say, o.pins, W]);
  const hud = `<div class="lv-hud"><b class="lv-t">Laisvė</b><button class="lv-ib" data-a="freeMenu" aria-label="Daugiau">${ic('more')}</button>
    <div class="lv-big"><span class="n">${fmtFree(P.n).replace(' d.', '')}</span><span class="u">${P.n < 365 ? 'dienų laisvės' : 'laisvės'}<small>${land}</small></span></div>
    <div class="lv-lvl"><b>${L.lv} lygis</b><span><i style="width:${L.p}%"></i></span><small>${L.p} / 100 XP</small></div></div>`;
  return `<div class="lvw lv-page"><div class="lv-world" data-key="${esc(key)}">${LVW.world({...o, hud})}</div><div class="lv-sheet">${freeChecks()}${freeRows()}</div></div>`;
}
// po render: gyvas pasaulis (jei niekas nepasikeitė – paliekam seną, kad gyvūnai neprasidėtų iš naujo)
let LV_KEEP = null;
function freeMount() {
  const box = document.querySelector('.lv-world'); if (!box || !window.LVW) return;
  if (LV_KEEP && LV_KEEP.dataset.key === box.dataset.key) { box.replaceWith(LV_KEEP); return; }
  LVW.WORLDS.splice(0, LVW.WORLDS.length, ...LVW.WORLDS.filter(w => w.el.isConnected));
  LVW.artInit(box); requestAnimationFrame(() => { LVW.placeWorld(box); freeUnstack(box); }); LV_KEEP = box;
  if (!LV_LOOP) { LV_LOOP = 1; requestAnimationFrame(LVW.artLoop); }
}
let LV_LOOP = 0;
// ženkliukai ir Daigelis neužlipa vienas ant kito: persidengiantį ženkliuką stumiam taku toliau, kol atsilaisvina vieta ekrane
function freeUnstack(box) {
  const hit = (a, b) => { const p = a.getBoundingClientRect(), q = b.getBoundingClientRect(); return p.left < q.right - 4 && q.left < p.right - 4 && p.top < q.bottom - 4 && q.top < p.bottom - 4; };
  const busy = [box.querySelector('.walker'), box.querySelector('.say2')].filter(Boolean), pins = [...box.querySelectorAll('.pin')];
  for (let i = 0; i < 25; i++) {
    let moved = false;
    pins.forEach((p, k) => { if (busy.some(q => hit(p, q)) || pins.slice(0, k).some(q => hit(p, q))) { p.dataset.wt = Math.min(.97, +p.dataset.wt + .02); moved = true; } });
    if (!moved) break; LVW.placeWorld(box);
  }
  // burbulas neužlipa ant viršutinio užrašo (dienos, lygis): kita pusė, o jei vis tiek – po Daigeliu
  const say = box.querySelector('.say2'), hud = [...box.querySelectorAll('.lv-big, .lv-lvl, .lv-t, .lv-ib')], w = box.querySelector('.walker');
  if (say) say.classList.remove('dn');
  if (!say || !hud.some(h => hit(say, h))) return;
  const was = say.classList.contains('l'); say.classList.toggle('l', !was); say.classList.toggle('r', was); LVW.placeWorld(box);
  if (!hud.some(h => hit(say, h)) || !w) return;
  const b = box.getBoundingClientRect(), r = w.getBoundingClientRect(), wd = say.offsetParent || box, o = wd.getBoundingClientRect();
  say.classList.add('dn'); say.style.top = (r.bottom - o.top + 4) + 'px';
  say.style.left = Math.max(8, Math.min(b.width - say.offsetWidth - 8, r.left - o.left + r.width / 2 - say.offsetWidth / 2)) + 'px';
}

// dienos žymėjimas: šiandien ir (jei nepažymėta) vakar
function freeChecks() {
  const F = freeData(), d = today(), y = addDays(d, -1), out = [];
  const ask = (day, label) => {
    for (const mode of ['quit', 'reduce']) {
      const subs = F.subs.filter(s => s.start <= day && !s.days[day] && s.mode === mode); if (!subs.length) continue;
      const names = subs.map(s => freeSub(s.k)[1]), list = names.length > 1 ? names.slice(0, -1).join(', ') + ' ir ' + names.at(-1) : names[0];
      const q = mode === 'reduce' ? `${label} ${list} – pagal planą?` : `${label} be ${list}?`;
      out.push(`<div class="lv-chk"><span class="tx"><b>${q}</b>${day === y ? '<small>Vakar dar galima pažymėti</small>' : ''}</span><button class="btn sm ghost" data-a="freeMark" data-d="${day}" data-m="${mode}" data-v="slip">${mode === 'reduce' ? 'Viršijau' : 'Nepavyko'}</button><button class="btn sm primary" data-a="freeMark" data-d="${day}" data-m="${mode}" data-v="ok">Taip</button></div>`);
    }
  };
  ask(y, 'Vakar'); ask(d, 'Šiandien');
  if (!out.length && F.subs.some(s => s.days[d] === 'ok')) out.push(`<div class="lv-chk done">${ic('check')}<span class="tx"><b>Šiandien pažymėta</b><small>+10 XP</small></span></div>`);
  return out.join('');
}
// eilutės: kiekviena priklausomybė su +1 (atšaukimas toje pačioje eilutėje)
function freeRows() {
  const F = freeData(), d = today();
  return `<div class="lv-rows">${F.subs.map(s => { const [n, , icn, unit] = freeSub(s.k), P = freeProg(s), c = (s.counts || {})[d] || 0, und = UI.lvUndo?.id === s.id;
    const main = s.mode === 'quit' ? `${fmtFree(P.n)} be` : s.mode === 'reduce' ? `${c} iš ${+s.limit || 0}` : `${c} šiandien`;
    const sub2 = und ? `Įrašyta <a data-a="freeUndo">Atšaukti</a>` : s.mode === 'quit' ? FREE_MODES.quit : s.mode === 'reduce' ? `${unit} šiandien · ${fmtFree(P.n)} pagal planą` : `${unit} · ${fmtFree(P.n)} stebi`;
    const ln = s.mode === 'reduce' && +s.limit ? `<div class="ln"><i style="width:${Math.min(100, c / s.limit * 100)}%"></i></div>` : '';
    return `<div class="lv-row"><span class="ic">${lvIc(icn)}</span><span class="tx"><b>${main}</b><small>${n} · ${sub2}</small>${ln}</span><button class="lv-p1 ${und ? 'u' : ''}" data-a="freePlus" data-id="${s.id}" aria-label="+1">${und ? ic('check') : '+1'}</button></div>`; }).join('')}</div>`;
}
A.freeMark = async d => {
  const F = freeData(), subs = F.subs.filter(s => s.start <= d.d && !s.days[d.d] && s.mode === (d.m || 'quit'));
  if (d.v === 'slip' && subs.some(s => s.mode === 'quit') && !await ask('Nepavyko?', 'Nieko tokio. Takas prasidės iš naujo, o tavo daiktai ir ženkliukai liks.', {yes: 'Taip, nepavyko', no: 'Atšaukti'})) return;
  for (const s of subs) s.days[d.d] = d.v === 'ok' ? 'ok' : s.mode === 'reduce' ? 'over' : 'slip';
  if (d.v === 'ok') { F.xp = (F.xp || 0) + 10; toast(freeLine(true), 'good'); }
  commit();
};
A.freePlus = async d => {
  const F = freeData(), s = F.subs.find(x => x.id === d.id); if (!s || !tapOnce('free:' + s.id, 600)) return;
  if (s.mode === 'quit') return A.freeMark({d: today(), m: 'quit', v: 'slip'});
  s.counts = s.counts || {}; s.counts[today()] = (s.counts[today()] || 0) + 1;
  clearTimeout(UI.lvUndoT); UI.lvUndo = {id: s.id, d: today()}; UI.lvUndoT = setTimeout(() => { UI.lvUndo = null; if (UI.view === 'free') render(); }, 5000); commit();
};
A.freeUndo = () => { const u = UI.lvUndo, s = u && freeData().subs.find(x => x.id === u.id); if (s && s.counts?.[u.d] > 0) s.counts[u.d]--; UI.lvUndo = null; commit(); };
A.freeMenu = () => {
  $('#sheet').innerHTML = `<div class="dim" data-a="closeSheet"></div><div class="sh more2"><h3>Laisvė</h3><div class="mgrid">
    <button data-a="freeEdit" data-sheet="1"><i>${ic('pen')}</i>Ką keičiu</button><button data-a="freeHide" data-sheet="1"><i>${ic('eyeoff')}</i>Paslėpti Laisvę</button></div></div>`;
};
A.freeHide = async () => { if (!await ask('Paslėpti Laisvę?', 'Niekur nebesimatys. Atidaryti vėl – ilgai paspausk Savijautą.', {yes: 'Paslėpti'})) return; freeData().on = false; if (UI.view === 'free') UI.view = 'wellbeing'; commit(); };
A.freeEdit = () => { UI.lvOb = {step: 1, sel: freeData().subs.map(s => s.k), edit: true}; render(); };

// ---- pradžia: ką keisti → ko sieki → kiek → kodėl ----
function freeStart() {
  const F = freeData(), O = UI.lvOb = UI.lvOb || {step: 0, sel: []};
  const head = (t, n) => `<div class="lv-ob-h">${daigelis(n ? 4 : 5)}<div><b>${t}</b>${n ? `<small>${n}/4</small>` : ''}</div></div>`;
  if (O.step === 0) return `<div class="lvw lv-ob">${head('Laisvė')}<p class="lv-lead">Mesti, mažinti ar tiesiog stebėti – cigaretes, elektroninę, alkoholį ar ką kita. Kiekviena gera diena – žingsnis tavo take.</p><button class="btn primary big" data-a="freeOb" data-s="1">Pradėti</button></div>`;
  if (O.step === 1) return `<div class="lvw lv-ob">${head('Ką nori keisti?', 1)}<p class="lv-lead">Gali pasirinkti kelis</p><div class="st-chips">${Object.entries(FREE_SUBS).map(([k, [n]]) => `<button class="${O.sel.includes(k) ? 'on' : ''}" data-a="freeObSel" data-k="${k}">${n}</button>`).join('')}</div><button class="btn primary big" data-a="freeOb" data-s="2" ${O.sel.length ? '' : 'disabled'}>Toliau</button></div>`;
  if (O.step === 2) return `<div class="lvw lv-ob">${head('Ko sieki?', 2)}${O.sel.map(k => { const m = (O.mode || {})[k] || 'quit'; return `<div class="lv-ob-s"><b>${FREE_SUBS[k][0]}</b><div class="seg">${Object.entries(FREE_MODES).map(([v, l]) => `<button class="${m === v ? 'on' : ''}" data-a="freeObMode" data-k="${k}" data-v="${v}">${l}</button>`).join('')}</div>
    ${m === 'reduce' ? `<label class="lv-in">Ne daugiau kaip <input type="number" min="0" inputmode="numeric" data-c="freeObLim" data-k="${k}" value="${(O.lim || {})[k] ?? ''}"> ${FREE_SUBS[k][3]} per dieną</label>` : `<small>${m === 'quit' ? 'Kiekviena pažymėta diena – žingsnis. Nepavykus – nauja pradžia.' : 'Užsirašai, kiek – takas eina lėtai, be bausmių.'}</small>`}</div>`; }).join('')}<button class="btn primary big" data-a="freeOb" data-s="3">Toliau</button></div>`;
  if (O.step === 3) return `<div class="lvw lv-ob">${head('Kiek ir už kiek?', 3)}<p class="lv-lead">Nebūtina – pagal tai skaičiuosim sutaupytus pinigus</p>${O.sel.map(k => `<div class="lv-ob-s"><b>${FREE_SUBS[k][0]}</b><div class="lv-two"><label>Per dieną<input type="number" min="0" step="any" inputmode="decimal" data-c="freeObAmt" data-k="${k}" value="${(O.amt || {})[k] ?? ''}"></label><label>Kaina (€)<input type="number" min="0" step="0.01" inputmode="decimal" data-c="freeObPrice" data-k="${k}" value="${(O.price || {})[k] ?? ''}"></label></div></div>`).join('')}<button class="btn primary big" data-a="freeOb" data-s="4">Toliau</button></div>`;
  return `<div class="lvw lv-ob">${head('Kodėl?', 4)}<p class="lv-lead">Parašyk sau – parodysim, kai bus sunku</p><textarea rows="4" data-c="freeObWhy" placeholder="Pvz. noriu laisviau kvėpuoti ir daugiau laiko su vaikais">${esc(O.why ?? F.why ?? '')}</textarea><button class="btn primary big" data-a="freeObDone">Kelias prasideda</button></div>`;
}
A.freeOb = d => { UI.lvOb.step = +d.s; render(); window.scrollTo(0, 0); };
A.freeObSel = d => { const O = UI.lvOb; O.sel = O.sel.includes(d.k) ? O.sel.filter(x => x !== d.k) : [...O.sel, d.k]; render(); };
A.freeObMode = d => { const O = UI.lvOb; O.mode = {...O.mode, [d.k]: d.v}; render(); };
A.freeObDone = () => {
  const F = freeData(), O = UI.lvOb, keep = Object.fromEntries(F.subs.map(s => [s.k, s]));
  F.subs = O.sel.map(k => { const old = keep[k], mode = (O.mode || {})[k] || old?.mode || 'quit';
    return {...(old || {id: 'f' + uid(), k, start: today(), days: {}, counts: {}}), mode, limit: +((O.lim || {})[k] ?? old?.limit ?? 0) || 0, perDay: +((O.amt || {})[k] ?? old?.perDay ?? 0) || 0, price: +((O.price || {})[k] ?? old?.price ?? 0) || 0}; });
  if (O.why != null) F.why = O.why; F.on = true; UI.lvOb = null; commit(); window.scrollTo(0, 0);
};
// įvedimai be perpiešimo (kad klaviatūra neužsidarytų)
document.addEventListener('input', e => { const c = e.target.dataset?.c, O = UI.lvOb; if (!c || !c.startsWith('freeOb') || !O) return; const k = e.target.dataset.k, v = e.target.value;
  if (c === 'freeObWhy') O.why = v; else { const f = {freeObLim: 'lim', freeObAmt: 'amt', freeObPrice: 'price'}[c]; O[f] = {...O[f], [k]: v}; } });
// Daigelį paspaudus – kitas sakinys
document.addEventListener('click', e => { const w = e.target.closest('.lv-world .walker'); if (!w) return; const s = document.querySelector('.lv-world .say2'); if (s) { s.textContent = freeLine(true); s.classList.remove('l', 'r', 'dn'); s.classList.add('l'); const bx = w.closest('.lv-world'); LVW.placeWorld(bx); freeUnstack(bx); storeLocal(); } });
