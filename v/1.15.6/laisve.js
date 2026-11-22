// ===================== LAISVĖ =====================
// Taisyklės: docs/laisve-technika.md. Pasaulio variklis: laisve-world.js (sugeneruotas iš maketo).
// Duomenys: S.free = {on, subs: [{id, k, mode, start, limit, unit, price, days: {data: 'ok'|'slip'|'over'}, counts: {data: n}}], xp, why, seen}
// Skyriai: progresas (freeProg) → pasaulio vieta (freeWorldCfg) → ekranas (vFree, freeMount, freeAfter, freeUnstack) → dienos žymėjimas
// → DAIKTAI/DĖŽĖS/MANO PASAULIS → Laiko sustabdymas → pranešimai (naujas takas, kraštas, draugas) → seni kraštai → DOVANA (šifruota)
// → VALDIKLIS → SUNKU? (kvėpavimas, rankos, kodėl, pokalbis) → tempimas → ŽENKLIUKAI → TURAS → balsas/nuotrauka → PROGRESAS/PINIGAI/KŪNAS/
// ŽINIOS/VAKARĖLIS/SKANĖSTŲ DIENA → PAŽINTIS (pavyzdinis pasaulis UI.lvDemo) → kompiuteris, „Kas nutiko?“, laisvas režimas.
// S.free.w – pasaulis: {items, lands, cur, day, pity, wk, ts, food, drink, tour, giftSeen, ms, best, seen}. Plačiau – docs/laisve-technika.md.

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
// Laisvė matoma visiems pagal nutylėjimą; paslėpti – pasirinktinai (⋯ → Paslėpti), vėl rodyti – Nustatymuose arba ilgai paspaudus Savijautą
const freeOn = () => { const f = S?.free; if (!f) return true; if (f.hidden != null) return !f.hidden; return !(f.on === false && f.subs?.length); };
const freeData = () => UI.lvDemo || (S.free = S.free || {on: false, subs: [], xp: 0, why: '', seen: []});
// dienų skaičius: iki metų „N d.“, toliau „1 m. 12 d.“
function fmtFree(n) { n = Math.max(0, Math.floor(n)); if (n < 365) return `${n} d.`; const y = Math.floor(n / 365), d = n % 365; return `${y} m.${d ? ` ${d} d.` : ''}`; }

// ---- progresas iš dienų sąrašo (perskaičiuojamas kaskart) ----
function freeProg(sub, upTo = today()) {
  const y = addDays(upTo, -1), F0 = freeData(), pa = F0.party, tr = F0.treat; let n = 0, resets = 0, run = 0, miss = 0;
  for (let d = sub.start; d <= upTo; d = addDays(d, 1)) {
    const c = (sub.counts || {})[d], lim = pa && pa.d === d && pa.lim?.[sub.id] != null ? +pa.lim[sub.id] : +sub.limit || 0, treat = sub.k === 'fast' && tr && tr.d === d;
    const st = sub.days[d] || (treat && d < upTo ? 'ok' : null) || (sub.mode === 'reduce' && c > lim ? 'over' : sub.mode === 'track' && c != null ? 'ok' : null);
    if (sub.mode === 'quit' && sub.free && d >= sub.free) { if (st !== 'slip') n++; }   // laisvas režimas: kasdien žingsnis, paslydimas nebenuneša į pradžią
    else if (sub.mode === 'quit') {
      // Mesti: pažymėta +1; „Nepavyko“ – iš naujo; nepažymėtos dienos skaičiuojamos IŠ EILĖS.
      // Vakar ir šiandien dar „gyvos“ (galima pažymėti) – jos seriją nei didina, nei nutraukia.
      // 1 praleista diena takų nenumeta (tik žingsnio nėra); 2+ iš eilės (senesnės už vakar) – nuo 0, vieną kartą serijai.
      if (st === 'ok') { n++; miss = 0; }
      else if (st === 'slip') { if (n || run) resets++; n = 0; miss = 0; }
      else if (d < y) { miss++; if (miss === 2) { if (n) resets++; n = 0; } }
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
  const sub = freeMain(), P = freeProg(sub), track = sub.mode === 'track', span = track ? 30 : isFinite(P.to) && P.to > P.from ? P.to - P.from : 3650;
  // Stebėti: takas eina per mėnesį (kraštas keičiasi kas mėnesį), ženkliukų nėra
  const k = Math.max(0, Math.min(1, track ? (diffDays(sub.start, today()) % 30) / 30 : (P.n - P.from) / span)) || 0;
  const look = sub.mode === 'track' ? (P.land * 7 + (+sub.start.slice(8, 10))) % 3 : P.resets % 3, t = FREE_T0 + FREE_TS * k;
  const pins = track ? [] : FREE_MS.map((d, i) => [d, i]).filter(([d]) => d >= P.from && d < P.to).map(([d, i]) => {
    const kk = Math.min(1, (d - P.from) / span), label = LVW.MS[i][0]; return [FREE_T0 + FREE_TS * kk, P.n >= d ? 'ok' : 'nxt', P.n >= d ? label : `<em>${label}</em>`, '', i]; });
  // ženkliukas neužlipa ant Daigelio: per arti – pastumiam toliau taku
  pins.forEach(p => { if (Math.abs(p[0] - t) < .08) p[0] = Math.min(.95, t + .08); });
  pins.sort((a, b) => a[0] - b[0]).forEach((p, i, A) => { if (i && p[0] - A[i - 1][0] < .07) p[0] = Math.min(.97, A[i - 1][0] + .07); });   // užrašai neužlipa vienas ant kito
  const nx = pins.findIndex(p => p[1] === 'nxt'); pins.forEach((p, i) => { if (p[1] === 'nxt' && i !== nx) { p[1] = 'dot'; p[2] = ''; } });
  const h = new Date().getHours();
  return {sub, P, o: {W, h: 440, cut: false, bio: Math.min(6, P.land), look, season: LVW.LANDS[Math.min(6, P.land)]?.snowy ? '' : freeSeason(), tod: h >= 18 || h < 5 ? 'evening' : 'day', t, ex: P.today === 'ok' ? 'proud' : 'smile', say: esc(freeLine()), sayDir: 'l', pins}};
}

// ---- ekranas ----
let LV_LOADING = null;
const loadLaisve = () => window.LVW ? Promise.resolve() : (LV_LOADING = LV_LOADING || new Promise(ok => { const v = window.APP_VERSION, s = document.createElement('script'); s.src = (!v || v === 'src' ? 'src/' : `v/${v}/`) + 'laisve-world.js'; s.onload = ok; s.onerror = ok; document.body.appendChild(s); }));
function vFree() {
  if (UI.lvDemo && UI.lvTour == null) UI.lvDemo = null;   // pavyzdys – tik ture
  const F = freeData();
  if (!window.LVW) { loadLaisve().then(() => UI.view === 'free' && render()); return `<div class="lvw lv-wait">${daigelis(4)}</div>`; }
  if (!FREE_GIFT.em && cloudOn()) Promise.all([freeOwnerReset(), freeGiftInit()]).then(() => UI.view === 'free' && render());
  if (!F.subs.length && !UI.lvOb) return freeIntro();
  if (UI.lvOb) return freeStart();
  if (freeTick()) storeLocal();
  if (UI.lvMp) return UI.lvMp.tab === 'badges' ? freeBadges() : UI.lvMp.tab === 'page' ? freePage(UI.lvMp.page) : freeMp();
  const M = $('#main'), cs = M && getComputedStyle(M), avail = M ? M.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) : 343, wide = avail >= 860, W = Math.min(wide ? 1200 : 620, avail);   // kompiuteryje – pasaulis per visą plotį, po juo du stulpeliai
  if (UI.lvOld) { const v = freeOldView(W); if (v) return v; }
  const {sub, P, o} = freeWorldCfg(W), L = freeLevel(), land = LVW.LANDS[Math.min(6, P.land)]?.n || '', here = freeHere(freeLandId().id), bw = freeW().items.bowl;
  Object.assign(o, {things: here.things, pets: here.pets, nudgeAll: 1, noRefill: 1, bowlLv: bw ? Math.max(0, bowlLv(bw, 'bowl')) : null}); LV_PETN = here.names;
  const key = JSON.stringify([o.bio, o.look, o.season, o.tod, o.t.toFixed(3), o.ex, o.say, o.pins, W, here.things, here.pets, o.bowlLv, UI.lvRedraw || 0, UI.lvDrag || '']); UI.lvRedraw = 0;
  const hud = `<div class="lv-hud"><b class="lv-t">Laisvė</b><button class="lv-ib" data-a="freeMenu" aria-label="Daugiau">${ic('more')}</button>
    <div class="lv-big"><span class="n">${fmtFree(P.n).replace(' d.', '')}</span><span class="u">${sub.mode === 'track' ? (P.n < 365 ? 'dienų užrašyta' : 'užrašyta') : sub.mode === 'reduce' ? (P.n < 365 ? 'dienų pagal planą' : 'pagal planą') : P.n < 365 ? 'dienų laisvės' : 'laisvės'}<small>${land}</small></span></div>
    <div class="lv-lvl"><b>${L.lv} lygis</b><span><i style="width:${L.p}%"></i></span><small>${L.p} / 100 XP</small></div></div>`;
  const left = `${UI.lvDrag ? `<div class="lv-chk"><span class="tx"><b>Tempi: ${esc(itemName(UI.lvDrag))}</b><small>Toliau – mažesnis, arčiau – didesnis. Ant tako nepastatysi.</small></span><button class="btn sm primary" data-a="freeDragDone">Baigti</button></div>` : `<button class="lv-sos" data-a="freeHard"><span>${daigelis(4)}</span><span class="tx"><b>Sunku?</b><small>Esu čia – pakvėpuokim, pasikalbėkim</small></span>${ic('arrow', 'sm')}</button>${freeChecks()}${freeBoxes()}`}`, right = `${freeRows()}${UI.lvDrag ? '' : freeTiles()}${LSW() && !freeW().seen.widget ? `<div class="lv-chk"><span class="tx"><b>Valdiklis telefono ekrane</b><small>Takas, dienos ir +1 – neatidarius programėlės</small></span><button class="btn sm ghost" data-a="freeWidgetNo">Vėliau</button><button class="btn sm primary" data-a="freeWidget">Kaip?</button></div>` : ''}`;
  return `<div class="lvw lv-page ${wide ? 'wide' : ''}"><div class="lv-world" data-key="${esc(key)}">${LVW.world({...o, hud})}</div>${wide ? `<div class="lv-sheet two"><div class="col">${left}</div><div class="col">${right}</div></div>` : `<div class="lv-sheet">${left}${right}</div>`}</div>`;
}
// po render: gyvas pasaulis (jei niekas nepasikeitė – paliekam seną, kad gyvūnai neprasidėtų iš naujo)
let LV_KEEP = null;
function freeMount() {
  const box = document.querySelector('.lv-world'); if (!box || !window.LVW) return;
  if (LV_KEEP && LV_KEEP.dataset.key === box.dataset.key) { box.replaceWith(LV_KEEP); freeAfter(); freeWidgetTick(); return; }
  LVW.WORLDS.splice(0, LVW.WORLDS.length, ...LVW.WORLDS.filter(w => w.el.isConnected));
  LVW.artInit(box); requestAnimationFrame(() => { LVW.placeWorld(box); freeUnstack(box); }); LV_KEEP = box;
  if (!LV_LOOP) { LV_LOOP = 1; requestAnimationFrame(LVW.artLoop); }  if (UI.lvDrag) requestAnimationFrame(() => requestAnimationFrame(() => freeDragMount(box)));
  freeAfter(); freeWidgetTick();
}
function freeWidgetTick() { if (!LSW() || UI.lvDemo) return; if (!UI.lvPulled) { UI.lvPulled = 1; freeWidgetPull(); } setTimeout(() => freeWidgetSync(), 1200); }
let LV_PETN = [];
// po pasaulio: dovana (pirmą kartą), Laiko sustabdymas, naujas takas / kraštas / draugas
function freeAfter() {
  if (UI.lvDemo || !freeData().subs.length || UI.lvMp || UI.lvOld || UI.lvDrag || document.querySelector('.lv-full, .lv-gift') || $('#sheet')?.innerHTML.trim()) return;
  if (cloudOn() && !FREE_GIFT.done) return;   // dar tikrinama dovana – po to perpiešiama
  if (UI.lvWhat) return freeWhat();
  const w = freeW();
  if (!w.tour && UI.lvTour == null && !document.querySelector('.lv-tour')) { UI.lvTour = 0; return setTimeout(freeTourShow, 400); }
  if (document.querySelector('.lv-tour')) return;
  if (FREE_GIFT.on && !w.giftSeen) { UI.lvGift = 0; return freeGiftShow(); }
  const tsKey = freeMissed().map(m => m.s.id + m.miss[0]).join();
  if (tsKey && UI.lvTsAsked !== tsKey && freeTsAsk()) { UI.lvTsAsked = tsKey; return; }
  if (freeReveal()) return storeLocal();
  if (freePartyAfter() || freeTreatAfter() || freeYearOffer()) return storeLocal();
  freeNotice(); storeLocal();
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
  // burbulas: pirmiausia virš Daigelio (dešinėje, kairėje, centre), po juo – tik jei telpa; niekada už pasaulio krašto, ant užrašų ar ženkliukų
  const say = box.querySelector('.say2'), w = box.querySelector('.walker'); if (!say) return; if (!w || !w.getBoundingClientRect().width || !isFinite(w.getBoundingClientRect().top)) { say.style.display = 'none'; return; }
  const wd = say.offsetParent || box, o = wd.getBoundingClientRect(), r = w.getBoundingClientRect(), bw = say.offsetWidth, bh = say.offsetHeight, W = o.width, H = o.height;
  const block = [...box.querySelectorAll('.lv-big, .lv-lvl, .lv-t, .lv-ib, .pin')].map(e => e.getBoundingClientRect()).filter(q => q.width).map(q => ({l: q.left - o.left, t: q.top - o.top, r: q.right - o.left, b: q.bottom - o.top}));
  const cx = r.left - o.left + r.width / 2, top = r.top - o.top + r.height * .08, bot = r.bottom - o.top;
  const cands = []; for (let dy = 0; dy <= 160; dy += 8) for (const dx of [0, 40, -40, 80, -80]) cands.push([cx + r.width * .1 + dx, top - bh - 4 - dy, 'r'], [cx - r.width * .1 - bw + dx, top - bh - 4 - dy, 'l'], [cx - bw / 2 + dx, top - bh - 4 - dy, 'c']);
  cands.push([cx - bw / 2, bot + 6, 'dn']);
  const fits = ([x, y]) => x >= 6 && x + bw <= W - 6 && y >= 6 && y + bh <= H - 8 && block.every(q => x + bw < q.l + 3 || x > q.r - 3 || y + bh < q.t + 3 || y > q.b - 3);
  let c = cands.find(fits) || cands.map(([x, y, k]) => [Math.max(6, Math.min(W - bw - 6, x)), Math.max(6, Math.min(H - bh - 8, y)), k]).find(fits) || [Math.max(6, Math.min(W - bw - 6, cx - bw / 2)), Math.max(6, top - bh - 4), 'c'];
  if (c[2] !== 'dn') c[2] = cx < c[0] + 30 ? 'r' : cx > c[0] + bw - 30 ? 'l' : 'c';
  say.classList.remove('l', 'r', 'dn', 'c'); say.classList.add(c[2]);
  say.style.left = Math.round(c[0]) + 'px'; say.style.top = Math.round(c[1]) + 'px';
  say.style.setProperty('--ax', Math.round(Math.max(12, Math.min(bw - 24, cx - c[0] - 6))) + 'px');
}

// dienos žymėjimas: šiandien ir (jei nepažymėta) vakar
function freeChecks() {
  const F = freeData(), d = today(), y = addDays(d, -1), out = [];
  const ask = (day, label) => {
    for (const mode of ['quit', 'reduce']) {
      const subs = F.subs.filter(s => s.start <= day && !s.days[day] && s.mode === mode && !s.free && !(s.k === 'fast' && treatOn(day))); if (!subs.length) continue;
      const names = subs.map(s => freeSub(s.k)[1]), list = names.length > 1 ? names.slice(0, -1).join(', ') + ' ir ' + names[names.length - 1] : names[0];
      const q = mode === 'reduce' ? `${label} ${list} – pagal planą?` : `${label} be ${list}?`;
      out.push(`<div class="lv-chk"><span class="tx"><b>${q}</b>${day === y ? '<small>Vakar dar galima pažymėti</small>' : ''}</span><button class="btn sm ghost" data-a="freeMark" data-d="${day}" data-m="${mode}" data-v="slip">${mode === 'reduce' ? 'Viršijau' : 'Nepavyko'}</button><button class="btn sm primary" data-a="freeMark" data-d="${day}" data-m="${mode}" data-v="ok">Taip</button></div>`);
    }
  };
  ask(y, 'Vakar'); ask(d, 'Šiandien');
  for (const s of F.subs.filter(s => s.free && (!s.wk || diffDays(s.wk, d) >= 7))) out.push(`<div class="lv-chk"><span class="tx"><b>Praėjusi savaitė be ${freeSub(s.k)[1]}?</b><small>Laisvas režimas – žymi kartą per savaitę</small></span><button class="btn sm ghost" data-a="freeWeekMark" data-k="${s.id}" data-v="0">Buvo</button><button class="btn sm primary" data-a="freeWeekMark" data-k="${s.id}" data-v="1">Taip</button></div>`);
  // Stebėti: diena skaičiuojasi, kai užsirašai; jei nieko nebuvo – vienas paspaudimas
  for (const s of F.subs.filter(s => s.mode === 'track' && s.start <= d)) {
    const c = (s.counts || {})[d];
    out.push(c == null ? `<div class="lv-chk"><span class="tx"><b>Šiandien – ${freeSub(s.k)[1]}?</b><small>Užsirašyk +1 arba pažymėk, kad nieko</small></span><button class="btn sm primary" data-a="freeTrackNone" data-k="${s.id}">Šiandien nieko</button></div>`
      : `<div class="lv-chk done">${ic('check')}<span class="tx"><b>Šiandien užrašyta</b><small>${freeSub(s.k)[0]}: ${c} · stebi</small></span></div>`);
  }
  if (!out.length && F.subs.some(s => s.days[d] === 'ok')) out.push(`<div class="lv-chk done">${ic('check')}<span class="tx"><b>Šiandien pažymėta</b><small>+10 XP</small></span></div>`);
  return out.join('');
}
// eilutės: kiekviena priklausomybė su +1 (atšaukimas toje pačioje eilutėje)
function freeRows() {
  const F = freeData(), d = today();
  return `<div class="lv-rows">${F.subs.map(s => { const [n, , icn, unit] = freeSub(s.k), P = freeProg(s), c = (s.counts || {})[d] || 0, und = UI.lvUndo?.id === s.id;
    const main = s.mode === 'quit' ? `${fmtFree(P.n)} be` : s.mode === 'reduce' ? `${c} iš ${+s.limit || 0}` : `${c} šiandien`;
    const sub2 = und ? `Įrašyta <a data-a="freeUndo">Atšaukti</a>` : s.mode === 'quit' ? (s.free ? 'Laisvas režimas · +1 jei paslydai' : 'Mesti · +1 jei paslydai') : s.mode === 'reduce' ? `${unit} šiandien · ${fmtFree(P.n)} pagal planą` : `${unit} · ${fmtFree(P.n)} stebi`;
    const ln = s.mode === 'reduce' && +s.limit ? `<div class="ln"><i style="width:${Math.min(100, c / s.limit * 100)}%"></i></div>` : '';
    return `<div class="lv-row"><span class="ic">${lvIc(icn)}</span><span class="tx"><b>${main}</b><small>${n} · ${sub2}</small>${ln}</span><button class="lv-p1 ${und ? 'u' : ''}" data-a="freePlus" data-id="${s.id}" aria-label="+1">${und ? ic('check') : '+1'}</button></div>`; }).join('')}</div>`;
}
A.freeMark = async d => {
  // apsauga: greitas dvigubas paspaudimas nežymi dienos ir nepriduoda XP du kartus
  if (!tapOnce('mark:' + d.d + ':' + (d.m || 'quit'), 1500)) return;
  const F = freeData(), subs = F.subs.filter(s => s.start <= d.d && !s.days[d.d] && s.mode === (d.m || 'quit'));
  if (!subs.length) return;   // jau pažymėta – nieko nekeičiam (ir XP neduodam)
  if (d.v === 'slip' && subs.some(s => s.mode === 'quit') && !await ask('Nepavyko?', 'Nieko tokio. Takas prasidės iš naujo, o tavo daiktai ir ženkliukai liks.', {yes: 'Taip, nepavyko', no: 'Atšaukti'})) return;
  for (const s of subs) s.days[d.d] = d.v === 'ok' ? 'ok' : s.mode === 'reduce' ? 'over' : 'slip';
  if (d.v !== 'ok' && subs.length) UI.lvWhat = {d: d.d, ids: subs.map(s => s.id)};
  if (d.v === 'ok') { F.xp = (F.xp || 0) + 10; toast(freeLine(true), 'good'); }
  commit();
};
A.freePlus = async d => {
  const F = freeData(), s = F.subs.find(x => x.id === d.id); if (!s || !tapOnce('free:' + s.id, 600)) return;
  // Mesti: +1 = paslydau. Veikia ir tada, kai šiandien jau pažymėta „Taip“ (paslysti galima ir vėliau dieną).
  if (s.mode === 'quit' && !(s.k === 'fast' && treatOn())) {
    if (s.days[today()] === 'slip') return toast('Šiandien jau užrašyta');
    if (!await ask('Paslydai?', `${freeSub(s.k)[0]} – šiandien. Nieko tokio: takas prasidės iš naujo, o tavo daiktai ir ženkliukai liks.`, {yes: 'Taip, užrašyti', no: 'Atšaukti'})) return;
    s.days[today()] = 'slip'; UI.lvWhat = {d: today(), ids: [s.id]}; return commit();
  }
  s.counts = s.counts || {}; s.counts[today()] = (s.counts[today()] || 0) + 1;
  clearTimeout(UI.lvUndoT); UI.lvUndo = {id: s.id, d: today()}; UI.lvUndoT = setTimeout(() => { UI.lvUndo = null; if (UI.view === 'free') render(); }, 5000); commit();
};
A.freeUndo = () => { const u = UI.lvUndo, s = u && freeData().subs.find(x => x.id === u.id); if (s && s.counts?.[u.d] > 0) s.counts[u.d]--; UI.lvUndo = null; commit(); };
A.freeMenu = () => {
  $('#sheet').innerHTML = `<div class="dim" data-a="closeSheet"></div><div class="sh more2"><h3>Laisvė</h3><div class="mgrid">
    <button data-a="freeMpOpen" data-sheet="1"><i>${ic('leaf')}</i>Mano pasaulis</button><button data-a="freeMap" data-sheet="1"><i>${ic('cal')}</i>Mano kraštai</button><button data-a="freeBadgesOpen" data-sheet="1"><i>${ic('spark')}</i>Ženkliukai</button><button data-a="freeWidget" data-sheet="1"><i>${ic('plus')}</i>Valdiklis ekrane</button><button data-a="freeTourAgain" data-sheet="1"><i>${ic('bulb')}</i>Kaip veikia</button><button data-a="freeEdit" data-sheet="1"><i>${ic('pen')}</i>Ką ir kaip keičiu</button><button data-a="freeHide" data-sheet="1"><i>${ic('eyeoff')}</i>Paslėpti Laisvę</button></div></div>`;
};
A.freeHide = async () => { if (!await ask('Paslėpti Laisvę?', 'Skirtukuose nebesimatys, duomenys liks. Vėl rodyti – Nustatymai → apatinė juosta arba ilgai paspausk Savijautą.', {yes: 'Paslėpti'})) return; freeData().hidden = true; freeWidgetSync(false); if (UI.view === 'free') UI.view = 'wellbeing'; commit(); };
// „Ką ir kaip keičiu“: rodom ESAMUS pasirinkimus (režimą, ribą, kiekį, kainą), kad būtų aišku, ką keiti
A.freeEdit = () => { const subs = freeData().subs, m = f => Object.fromEntries(subs.map(x => [x.k, f(x)]));
  UI.lvOb = {step: 1, sel: subs.map(x => x.k), edit: true, mode: m(x => x.mode), lim: m(x => x.limit || ''), amt: m(x => x.perDay || ''), price: m(x => x.price || ''), why: freeData().why || ''}; render(); window.scrollTo(0, 0); };
A.freeEditCancel = () => { UI.lvOb = null; render(); window.scrollTo(0, 0); };

// ---- pradžia: ką keisti → ko sieki → kiek → kodėl ----
function freeStart() {
  const F = freeData(), O = UI.lvOb = UI.lvOb || {step: 0, sel: []};
  const head = (t, n) => `<div class="lv-ob-h">${daigelis(n ? 4 : 5)}<div style="flex:1"><b>${t}</b>${n ? `<small>${n}/4</small>` : ''}</div>${O.edit ? '<button class="btn sm ghost" data-a="freeEditCancel">Atšaukti</button>' : ''}</div>`;
  if (O.step === 0) return `<div class="lvw lv-ob">${head('Laisvė')}<p class="lv-lead">Mesti, mažinti ar tiesiog stebėti – cigaretes, elektroninę, alkoholį ar ką kita. Kiekviena gera diena – žingsnis tavo take.</p><button class="btn primary big" data-a="freeOb" data-s="1">Pradėti</button></div>`;
  if (O.step === 1) return `<div class="lvw lv-ob">${head('Ką nori keisti?', 1)}<p class="lv-lead">Gali pasirinkti kelis</p><div class="st-chips">${Object.entries(FREE_SUBS).map(([k, [n]]) => `<button class="${O.sel.includes(k) ? 'on' : ''}" data-a="freeObSel" data-k="${k}">${n}</button>`).join('')}</div><button class="btn primary big" data-a="freeOb" data-s="2" ${O.sel.length ? '' : 'disabled'}>Toliau</button></div>`;
  if (O.step === 2) return `<div class="lvw lv-ob">${head('Ko sieki?', 2)}${O.edit ? '<p class="lv-lead">Čia gali pakeisti režimą: Mesti, Mažinti ar Stebėti. Pažymėtos dienos ir daiktai lieka.</p>' : ''}${O.sel.map(k => { const m = (O.mode || {})[k] || 'quit'; return `<div class="lv-ob-s"><b>${FREE_SUBS[k][0]}</b><div class="seg">${Object.entries(FREE_MODES).map(([v, l]) => `<button class="${m === v ? 'on' : ''}" data-a="freeObMode" data-k="${k}" data-v="${v}">${l}</button>`).join('')}</div>
    ${m === 'reduce' ? `<label class="lv-in">Ne daugiau kaip <input type="number" min="0" inputmode="numeric" data-c="freeObLim" data-k="${k}" value="${(O.lim || {})[k] ?? ''}"> ${FREE_SUBS[k][3]} per dieną</label>` : `<small>${m === 'quit' ? 'Kiekviena pažymėta diena – žingsnis. Nepavykus – nauja pradžia.' : 'Užsirašai, kiek – takas eina lėtai, be bausmių.'}</small>`}</div>`; }).join('')}<button class="btn primary big" data-a="freeOb" data-s="3">Toliau</button></div>`;
  if (O.step === 3) return `<div class="lvw lv-ob">${head('Kiek ir už kiek?', 3)}<p class="lv-lead">Nebūtina – pagal tai skaičiuosim sutaupytus pinigus</p>${O.sel.map(k => `<div class="lv-ob-s"><b>${FREE_SUBS[k][0]}</b><div class="lv-two"><label>Kiek per dieną<input type="number" min="0" step="any" inputmode="decimal" data-c="freeObAmt" data-k="${k}" value="${(O.amt || {})[k] ?? ''}"></label><label>Išleidi per dieną (€)<input type="number" min="0" step="0.01" inputmode="decimal" data-c="freeObPrice" data-k="${k}" value="${(O.price || {})[k] ?? ''}"></label></div></div>`).join('')}<button class="btn primary big" data-a="freeOb" data-s="4">Toliau</button></div>`;
  return `<div class="lvw lv-ob">${head('Kodėl?', 4)}<p class="lv-lead">Parašyk sau – parodysim, kai bus sunku</p><textarea rows="4" data-c="freeObWhy" placeholder="Pvz. noriu laisviau kvėpuoti ir daugiau laiko su vaikais">${esc(O.why ?? F.why ?? '')}</textarea><div class="why5 lv-obm"><div class="media lv-media"></div></div>${(setTimeout(freeWhyMedia, 0), '')}<button class="btn primary big" data-a="freeObDone">${O.edit ? 'Išsaugoti' : 'Kelias prasideda'}</button></div>`;
}
A.freeOb = d => { UI.lvOb.step = +d.s; render(); window.scrollTo(0, 0); };
A.freeObSel = d => { const O = UI.lvOb; O.sel = O.sel.includes(d.k) ? O.sel.filter(x => x !== d.k) : [...O.sel, d.k]; render(); };
A.freeObMode = d => { const O = UI.lvOb; O.mode = {...O.mode, [d.k]: d.v}; render(); };
A.freeObDone = () => {
  const F = freeData(), O = UI.lvOb, keep = Object.fromEntries(F.subs.map(s => [s.k, s]));
  F.subs = O.sel.map(k => { const old = keep[k], mode = (O.mode || {})[k] || old?.mode || 'quit';
    return {...(old || {id: 'f' + uid(), k, start: today(), days: {}, counts: {}}), mode, limit: +((O.lim || {})[k] ?? old?.limit ?? 0) || 0, perDay: +((O.amt || {})[k] ?? old?.perDay ?? 0) || 0, price: +((O.price || {})[k] ?? old?.price ?? 0) || 0}; });
  if (O.why != null) F.why = O.why; F.on = true; F.hidden = false; freeW().tour = 1; if (O.edit) { freeW().cur = null; LV_KEEP = null; toast('Išsaugota', 'good'); } UI.lvOb = null; commit(); window.scrollTo(0, 0);
};
// įvedimai be perpiešimo (kad klaviatūra neužsidarytų)
document.addEventListener('input', e => { const c = e.target.dataset?.c, O = UI.lvOb; if (!c || !c.startsWith('freeOb') || !O) return; const k = e.target.dataset.k, v = e.target.value;
  if (c === 'freeObWhy') O.why = v; else { const f = {freeObLim: 'lim', freeObAmt: 'amt', freeObPrice: 'price'}[c]; O[f] = {...O[f], [k]: v}; } });
// Daigelį paspaudus – kitas sakinys
document.addEventListener('click', e => { const w = e.target.closest('.lv-world .walker'); if (!w) return; const s = document.querySelector('.lv-world .say2'); if (s) { s.textContent = freeLine(true); s.classList.remove('l', 'r', 'dn'); s.classList.add('l'); const bx = w.closest('.lv-world'); LVW.placeWorld(bx); freeUnstack(bx); storeLocal(); } });

// ===================== DAIKTAI, DĖŽĖS, MANO PASAULIS (docs/laisve-technika.md 3–6) =====================
// S.free.w = {items: {raktas: {at: krašto id | null, x, y, t}}, lands: {id: {li, look, sub, from, n}}, cur, day, pity, wk, ts, food, drink, tsNo, seen: {}}
// Kiekvienas daiktas ar gyvūnas – vienas egzempliorius: arba Mano pasaulyje (at: null), arba kurio nors krašto vietoje.
const FREE_RAR = (() => { const m = {}, add = (r, s) => s.split(' ').forEach(k => m[k] = r);
  add('c', 'bench lamp fence stones flowerbox carrots mailbox gnome ball bone mouse yarn bowl water flowershelf picnic birdhouse hay flowerbed stump shrooms berries cairn snowman sled tulips basket umbrella pool leaves pumpkins');
  add('r', 'lamp2 well arch bike bed cushion rope frisbee scratch birch pine apple swing sunflowers beehive tent pier campfire kite sledgift mushhouse beachumb icecream scarecrow xtree smokingas');
  add('e', 'fountain kennel oak cherry tower windmill bridge telescope hammock igloo boat biglis');
  add('l', 'sofa balloon cabin flag'); return m; })();
const RAR_N = {c: 'Paprastas', r: 'Retas', e: 'Ypatingas', l: 'Legendinis'}, RAR_BOX = {c: 'Paprasta dėžė', r: 'Reta dėžė', e: 'Ypatinga dėžė', l: 'Legendinė dėžė'};
// gyvūnai ateina patys po tiek gerų dienų (iš viso, paslydimas jų neatima); biglis ir juodai balta katė – tik iš dėžių
const FREE_PETS = {ruda: 3, haskis: 7, pilka: 14, cihuahua: 20, spicas: 30, trispalve: 45, retriveris: 60, korgis: 90, labradoras: 120};
const FREE_LIMIT = 30, DAY_MS = 864e5;
const freeW = () => { const F = freeData(); F.w = F.w || {}; const w = F.w; w.items = w.items || {}; w.lands = w.lands || {}; w.seen = w.seen || {}; ['day', 'pity', 'ts', 'food', 'drink'].forEach(k => w[k] = +w[k] || 0); return w; };
const rarTag = r => `<span class="rar r-${r}">${RAR_N[r]}</span>`;
const isPet = k => !!window.LVW?.ANIMALS?.[k];
const itemName = k => FREE_GIFT.names[k] || (isPet(k) ? LVW.ANIMALS[k].n : LVW.CAT[k]?.n || k);
const itemImg = (k, h = 44) => isPet(k) ? LVW.petImg(k, 1, h) : LVW.thImg(k, h);
// dabartinis kraštas: takas (pagrindinė priklausomybė, kelintas takas) + kraštas
function freeLandId() { const sub = freeMain(); if (!sub) return null; const P = freeProg(sub); return {id: `${sub.id}.${sub.mode === 'quit' ? P.resets : 0}.${P.land}`, li: Math.min(6, P.land), P, sub}; }
const freeGood = (s, d) => s.days[d] === 'ok' || (s.mode === 'track' && (s.counts || {})[d] != null);
const freeGoodTotal = () => Math.max(0, ...freeData().subs.map(s => Object.keys(s.days).filter(d => s.days[d] === 'ok').length + (s.mode === 'track' ? Object.keys(s.counts || {}).filter(d => s.days[d] !== 'ok').length : 0)));
const freeMarkedToday = () => freeData().subs.some(s => freeGood(s, today()));

// ---- dubenėliai ir medžiai laike ----
// dovanos dubenėliai pirmą savaitę neištuštėja, paskui – kaip visi
const giftFull = it => it.gift && Date.now() - (freeW().giftAt || 0) < 7 * DAY_MS;
function bowlLv(it, k) { if (giftFull(it)) return 1; const days = Math.floor((Date.now() - Math.max(it.t || 0, it.gift ? (freeW().giftAt || 0) + 7 * DAY_MS : 0)) / DAY_MS); return k === 'water' ? (days >= 7 ? -1 : 1) : days >= 4 ? -1 : Math.max(0, 1 - days / 3); }
function treeSt(it) {
  const sub = freeMain(); if (!sub) return 4; const d = today(), y = addDays(d, -1);
  const wilt = sub.days[d] === 'slip' || sub.days[d] === 'over' || (!freeGood(sub, d) && !freeGood(sub, y) && sub.start < y);
  let st = 0; for (let k = 1; k <= 4; k++) { const tk = (it.t || 0) + k * DAY_MS; if (tk > Date.now()) break; const day = ymd(new Date(tk)); if (freeGood(sub, day) || (day === d && !sub.days[d])) st++; }
  return wilt ? 'bare' : Math.min(4, st);
}
// laikas paima savo: tuščias dubenėlis po paros, vanduo po savaitės grįžta į Mano pasaulį
function freeTick() {
  const w = freeW(); let ch = false;
  for (const k of ['bowl', 'water']) { const it = w.items[k]; if (it?.at && bowlLv(it, k) < 0) { it.at = null; it.empty = 1; ch = true; } }
  return ch;
}

// ---- kas pasaulyje: daiktai ir gyvūnai šiame krašte (+ dovanoti šunys visur) ----
function freeHere(id) {
  const w = freeW(), things = [], pets = [], names = [];
  for (const [k, it] of Object.entries(w.items)) { if (it.at !== id) continue;
    if (isPet(k)) { pets.push([k, it.x, it.y]); names.push(itemName(k)); }
    else things.push([k, it.x, it.y, LVW.CAT[k]?.stages ? treeSt(it) : undefined]); }
  if (FREE_GIFT.on && w.giftSeen) for (const k of ['haskis', 'cihuahua']) if (!w.items[k]?.at || w.items[k].at !== id) { pets.push([k]); names.push(FREE_GIFT.names[k]); }
  return {things, pets, names};
}
const freeCount = id => Object.entries(freeW().items).filter(([k, it]) => it.at === id && !(FREE_GIFT.on && (k === 'haskis' || k === 'cihuahua'))).length;
function freePlace(k, id = freeLandId()?.id) {
  const w = freeW(), it = w.items[k], L = freeLandId(); if (!it || !id) return false;
  if (it.at === id) return true;
  if (freeCount(id) >= FREE_LIMIT) return 'full';
  const c = LVW.CAT[k]; if (c?.zone === 'water' && L.li !== 2) return 'water';
  if ((k === 'bowl' || k === 'water') && it.empty) { const f = k === 'bowl' ? 'food' : 'drink'; if (!w[f]) return 'nofood'; w[f]--; it.empty = 0; it.t = Date.now(); }
  const air = c?.zone === 'air';
  Object.assign(it, {at: id, x: c?.zone === 'water' ? .9 : .08 + Math.random() * .84, y: c?.zone === 'water' ? .27 : air ? .2 : .52 + Math.random() * .4});
  if (c?.stages && !it.t) it.t = Date.now();
  return true;
}
const PLACE_ERR = {full: `Šiame krašte vietų nebėra (${FREE_LIMIT}). Išimk kurį nors daiktą.`, water: 'Valtis plaukia tik ežere.', nofood: 'Dubenėlis tuščias – maisto ir vandens būna dėžėse.'};

// ---- dėžės ----
const lvSheet = (html, cls = '') => { $('#sheet').innerHTML = `<div class="dim" data-a="closeSheet"></div><div class="sh sp-sheet lvs ${cls}"><div class="grab"></div>${html}</div>`; };
function freeBoxState() {
  const w = freeW(); if (!freeMarkedToday()) return 'locked';
  return Date.now() - w.day < DAY_MS ? 'wait' : 'ready';
}
function freeWeekReady() {
  const w = freeW(), sub = freeMain(); if (!sub || w.wk === weekStart(today())) return false;
  let run = 0; for (let d = freeGood(sub, today()) ? today() : addDays(today(), -1); freeGood(sub, d); d = addDays(d, -1)) run++;
  return run >= 7;
}
function freePool(rar) {
  const w = freeW(), L = freeLandId(), sea = freeSeason() || 'summer';
  return Object.keys(FREE_RAR).filter(k => FREE_RAR[k] === rar && !w.items[k] && (isPet(k) || LVW.CAT[k]) && (() => {
    if (isPet(k)) return !(FREE_GIFT.on && (k === 'haskis' || k === 'cihuahua'));
    const g = LVW.CAT[k].grp; return g.startsWith('land') ? +g.slice(4) === L.li : ['winter', 'spring', 'summer', 'autumn'].includes(g) ? g === sea : true; })());
}
function freeHungry() { const w = freeW(), b = w.items.bowl, wa = w.items.water; return (b && !giftFull(b) && (b.empty || (b.at && bowlLv(b, 'bowl') <= .5))) || (wa && !giftFull(wa) && (wa.empty || (wa.at && Date.now() - wa.t > 4 * DAY_MS))); }
function freeRoll(kind) {
  const w = freeW();
  let rar = kind === 'week' ? (Math.random() < .5 ? 'e' : 'l') : w.pity >= 8 ? 'r' : (r => r < .01 ? 'l' : r < .05 ? 'e' : r < .2 ? 'r' : 'c')(Math.random());
  if (kind === 'day') w.pity = rar === 'c' ? w.pity + 1 : 0;
  const xp = {c: 15, r: 25, e: 40, l: 60}[rar];
  if (kind === 'day' && freeHungry() && w.food + w.drink < 3 && Math.random() < .45) { const f = w.items.bowl && (w.items.bowl.empty || bowlLv(w.items.bowl, 'bowl') <= .5) ? 'food' : 'drink'; w[f]++; return {rar: 'c', food: f, xp}; }
  if (rar !== 'c' && w.ts < 2 && Math.random() < (kind === 'week' ? .15 : .25)) { w.ts++; return {rar: 'e', ts: 1, xp}; }
  let pool = freePool(rar); if (!pool.length && kind === 'week') pool = freePool(rar === 'l' ? 'e' : 'l');
  if (!pool.length && kind === 'day') pool = freePool('c');
  if (!pool.length) return {rar, xp: xp + 20, dup: 1};
  const k = pool[Math.floor(Math.random() * pool.length)]; w.items[k] = {at: null, t: 0}; if (k === 'bowl' || k === 'water') w.items[k].t = Date.now();
  return {rar: FREE_RAR[k], item: k, xp};
}
A.freeBox = d => {
  const st = d.k === 'week' ? 'week' : freeBoxState(), w = freeW();
  if (st === 'locked') return lvSheet(`<div class="chestw wait">${LVW.chestImg('c', 0, 96)}</div><h3>Pažymėk šiandien</h3><p class="lead">Dienos dėžė atsidaro, kai pažymi dieną</p><button class="btn primary big" data-a="closeSheet">Gerai</button>`);
  if (st === 'wait') { const left = DAY_MS - (Date.now() - w.day), h = Math.floor(left / 36e5), m = Math.floor(left % 36e5 / 6e4);
    return lvSheet(`<div class="chestw wait">${LVW.chestImg('c', 0, 96)}</div><h3>Kita dėžė po ${h} val. ${m} min.</h3><div class="wbar3"><i style="width:${Math.round((1 - left / DAY_MS) * 100)}%"></i></div><p class="lead">Šiandienę jau atidarei</p><button class="btn big t" data-a="closeSheet">Gerai</button>`); }
  if (st === 'week') return lvSheet(`<div class="chestw shake">${LVW.chestImg('e', 0, 120)}</div><h3>Savaitės iššūkis įvykdytas</h3><p class="lead">7 dienos iš eilės</p><div class="either">${rarTag('e')}<span>arba</span>${rarTag('l')}</div><button class="btn primary big" data-a="freeBoxOpen" data-k="week">Atidaryti</button>`);
  lvSheet(`<div class="chestw shake">${LVW.chestImg('c', 0, 110)}</div><h3>Dienos dėžė</h3><p class="lead">Kartą per parą, kai pažymi dieną</p><button class="btn primary big" data-a="freeBoxOpen" data-k="day">Atidaryti</button>`);
};
A.freeBoxOpen = d => {
  const w = freeW(), F = freeData(), kind = d.k === 'week' ? 'week' : 'day';
  if (!tapOnce('box:' + kind, 1500)) return;
  if (kind === 'day' && freeBoxState() !== 'ready') return A.freeBox({});
  if (kind === 'week' && !freeWeekReady()) return A.closeSheet();
  const R = freeRoll(kind); if (kind === 'day') w.day = Date.now(); else w.wk = weekStart(today()); w.opened = (w.opened || 0) + 1;
  F.xp = (F.xp || 0) + R.xp; commit({noRender: true}); render();
  const head = (img, solo) => `<div class="chestw open r-${R.rar}"><i class="rays"></i>${solo ? '' : LVW.chestImg(R.rar, 1, 96)}<span class="won ${solo ? 'solo' : ''}">${img}</span></div>`;
  if (R.ts) return lvSheet(`${head(hourglass(104), 1)}<h3>Laiko sustabdymas</h3>${rarTag('e')}<p class="lead" style="margin-top:6px">Jei kelias dienas nepažymėsi – galėsi jas pažymėti vėliau. Turi ${w.ts} iš 2.</p><button class="btn primary big" data-a="closeSheet">Gerai</button>`);
  if (R.food) return lvSheet(`${head(LVW.aImg(LVW.spr(LVW.SH.pet, R.food === 'food' ? 1 : 5), 70), 1)}<h3>${R.food === 'food' ? 'Maistas' : 'Vanduo'}</h3>${rarTag('c')}<p class="lead" style="margin-top:6px">+${R.xp} XP · ${R.food === 'food' ? 'dubenėlis vėl bus pilnas' : 'vandens dubenėlis vėl pilnas'}</p><button class="btn primary big" data-a="freeRefill" data-k="${R.food === 'food' ? 'bowl' : 'water'}">Papildyti</button><button class="btn big t" data-a="closeSheet">Vėliau</button>`);
  if (R.dup || !R.item) return lvSheet(`${head(`<b style="font:900 34px Nunito;color:var(--br)">+${R.xp}</b>`, 1)}<h3>+${R.xp} XP</h3><p class="lead">${RAR_BOX[R.rar]} – šios rūšies daiktus jau turi, todėl XP</p><button class="btn primary big" data-a="closeSheet">Gerai</button>`);
  lvSheet(`${head(itemImg(R.item, isPet(R.item) ? 90 : 82))}<h3>${esc(itemName(R.item))}</h3>${rarTag(R.rar)}<p class="lead" style="margin-top:6px">+${R.xp} XP</p><button class="btn primary big" data-a="freePut" data-k="${R.item}">${isPet(R.item) ? 'Įleisti į pasaulį' : 'Pastatyti pasaulyje'}</button><button class="btn big t" data-a="closeSheet">Į Mano pasaulį</button>`);
};
A.freePut = d => {
  const r = freePlace(d.k);
  if (r === 'full') return freeFull(d.k);
  if (r !== true) return toast(PLACE_ERR[r] || 'Nepavyko');
  A.closeSheet(); commit();
};
function freeFull(k) {
  const L = freeLandId(), here = Object.entries(freeW().items).filter(([q, it]) => it.at === L.id && !(FREE_GIFT.on && (q === 'haskis' || q === 'cihuahua'))).map(([q]) => q);
  lvSheet(`<h3 style="margin-top:2px">${LVW.LANDS[L.li].n}: vietų nebėra</h3><p class="lead">${FREE_LIMIT} iš ${FREE_LIMIT}. Išimk kurį nors – jis liks Mano pasaulyje. Arba palik ${esc(itemName(k).toLowerCase())} dėžėje.</p>
    <div class="arow">${here.map(q => `<button data-a="freeSwap" data-k="${q}" data-n="${k}" aria-label="Išimti ${esc(itemName(q))}">${itemImg(q, 40)}</button>`).join('')}</div><button class="btn big t" data-a="closeSheet">Palikti dėžėje</button>`);
}
A.freeSwap = d => { const it = freeW().items[d.k]; if (it) it.at = null; A.freePut({k: d.n}); };
A.freeRefill = d => {
  const w = freeW(), it = w.items[d.k], f = d.k === 'bowl' ? 'food' : 'drink'; if (!w[f]) return toast('Maisto ir vandens būna dėžėse');
  if (!it) { w.items[d.k] = {at: null, t: Date.now()}; w[f]--; const r = freePlace(d.k); if (r !== true) { A.closeSheet(); commit(); return toast(PLACE_ERR[r]); } }
  else if (!it.at) { it.empty = 1; const r = freePlace(d.k); if (r !== true) return toast(PLACE_ERR[r]); }
  else { w[f]--; it.t = Date.now(); it.empty = 0; }
  lvSheet(`<div class="chestw open r-c"><i class="rays"></i><span class="won solo">${LVW.aImg(LVW.spr(LVW.SH.pet, d.k === 'bowl' ? 1 : 5), 70)}</span></div><h3>Vėl pilnas</h3><p class="lead">Tas pats dubenėlis</p><button class="btn primary big" data-a="closeSheet">Gerai</button>`);
  UI.lvRedraw = 1; commit({noRender: true}); render();
};
function freeBoxes() {
  const st = freeBoxState(), w = freeW(), wk = freeWeekReady();
  const left = DAY_MS - (Date.now() - w.day), sub = st === 'ready' ? 'Atidaryk – XP ir daiktai' : st === 'wait' ? `Kita po ${Math.floor(left / 36e5)} val. ${Math.floor(left % 36e5 / 6e4)} min.` : 'Atsidaro, kai pažymi dieną';
  return (wk ? `<button class="lv-box on" data-a="freeBox" data-k="week"><span class="ci">${LVW.chestImg('e', 0, 44)}</span><span class="tx"><b>Savaitės iššūkis įvykdytas</b><small>Ypatinga arba legendinė dėžė</small></span><span class="go1">Atidaryti</span></button>` : '')
    + `<button class="lv-box ${st === 'ready' ? 'on' : 'w'}" data-a="freeBox"><span class="ci">${LVW.chestImg('c', 0, 40)}</span><span class="tx"><b>Dienos dėžė</b><small>${sub}</small></span><span class="go1">${st === 'ready' ? 'Atidaryti' : st === 'wait' ? 'Laukti' : 'Pažymėti'}</span></button>`;
}
const hourglass = (s = 80) => `<svg viewBox="0 0 60 80" width="${s * .75}" height="${s}" style="display:block;margin:0 auto"><path d="M14 12 C14 30 26 34 26 40 C26 46 14 50 14 68 L46 68 C46 50 34 46 34 40 C34 34 46 30 46 12 Z" fill="#eaf5ff" stroke="#4a2b16" stroke-width="3" stroke-linejoin="round"/><path d="M19 17 C22 27 28 31 30 35 C32 31 38 27 41 17 Z" fill="#ffc98a"/><path d="M17 66 C20 57 27 55 30 53 C33 55 40 57 43 66 Z" fill="#ffad5c"/><path d="M30 37 V53" stroke="#ffad5c" stroke-width="2.4"/><rect x="7" y="4" width="46" height="9" rx="4.5" fill="#c47a3d" stroke="#4a2b16" stroke-width="3"/><rect x="7" y="67" width="46" height="9" rx="4.5" fill="#c47a3d" stroke="#4a2b16" stroke-width="3"/></svg>`;

// ---- Laiko sustabdymas: grįžus po 2+ nepažymėtų dienų (Mesti) ----
function freeMissed() {
  const y = addDays(today(), -1), out = [];
  // Nepažymėtos dienos per paskutines 14 d. (po paskutinio paslydimo), senesnės už vakar.
  // Mesti: siūlom tik kai yra 2+ iš eilės (tik tada takas numetamas). Mažinti: kai yra bent viena (kiekviena atima žingsnį).
  // Stebėti ir laisvas režimas – nereikia (niekas neatimama).
  for (const s of freeData().subs.filter(s => (s.mode === 'quit' || s.mode === 'reduce') && !s.free)) {
    const from = [addDays(y, -14), s.start, freeW().tsFrom || '', ...Object.keys(s.days).filter(d => s.days[d] === 'slip' || (s.mode === 'reduce' && s.days[d] === 'over')).map(d => addDays(d, 1))].sort().pop(), miss = [];
    const gone = d => !s.days[d] && !(s.k === 'fast' && treatOn(d)) && !(s.mode === 'reduce' && (s.counts || {})[d] > (+s.limit || 0));
    let runNow = 0, run2 = false;
    for (let d = from; d < y; d = addDays(d, 1)) { if (gone(d)) { miss.push(d); runNow++; if (runNow >= 2) run2 = true; } else runNow = 0; }
    if (miss.length && (s.mode === 'reduce' || run2)) { if (!s.days[y] && y >= s.start) miss.push(y); out.push({s, miss}); }
  }
  return out;
}
function freeTsAsk() {
  const w = freeW(), M = freeMissed(); if (!M.length || !w.ts) return false;
  const key = M.map(m => m.s.id + m.miss[0]).join(); if (w.tsNo === key) return false;
  const n = Math.max(...M.map(m => m.miss.length));
  lvSheet(`<div style="display:flex;gap:12px;align-items:center;text-align:left">${hourglass(46)}<span><h3 style="margin:0 0 4px">${n === 1 ? '1 diena' : n + ' dienos'} be žymos</h3><p class="lead" style="margin:0">Turi Laiko sustabdymą. Pažymėk praleistas dienas – takas liks, kur buvo.</p></span></div>
    <button class="btn primary big" data-a="freeTsDays">Pažymėti dienas</button><button class="btn big t" data-a="freeTsNo" data-k="${esc(key)}">Ne, pradėti nuo 0</button>`);
  return true;
}
A.freeTsNo = d => { const w = freeW(); w.tsNo = d.k; w.tsFrom = addDays(today(), -1); A.closeSheet(); commit(); };   // atsisakius – senesnių dienų nebesiūlom
A.freeTsDays = () => { const M = freeMissed(); UI.lvTs = {days: [...new Set(M.flatMap(m => m.miss))].sort(), v: {}}; freeTsRender(); };
function freeTsRender() {
  const T = UI.lvTs, dn = ['Sekmadienis', 'Pirmadienis', 'Antradienis', 'Trečiadienis', 'Ketvirtadienis', 'Penktadienis', 'Šeštadienis'];
  const all = T.days.every(d => T.v[d]);
  lvSheet(`<h3 style="margin-top:2px">Praleistos dienos</h3><p class="lead">Kaip sekėsi kiekvieną dieną?</p>
    ${T.days.map(d => `<div class="mday"><span><b>${dn[parseD(d).getDay()]}</b><small>${fmtDate(d)}</small></span><button class="${T.v[d] === 'ok' ? 'on' : ''}" data-a="freeTsSet" data-d="${d}" data-v="ok">Pavyko</button><button class="no ${T.v[d] === 'slip' ? 'on' : ''}" data-a="freeTsSet" data-d="${d}" data-v="slip">Nepavyko</button></div>`).join('')}
    <p class="hint2">${freeData().subs.some(s => s.mode === 'quit' && !s.free) ? 'Metant: bent viena „Nepavyko“ – kaip paslydimas. ' : ''}${freeData().subs.some(s => s.mode === 'reduce') ? 'Mažinant: „Nepavyko“ – diena be žingsnio.' : ''}</p><button class="btn primary big" data-a="freeTsSave" ${all ? '' : 'disabled'}>Išsaugoti · liks ${freeW().ts - 1} iš 2</button>`, 'lv-tsd');
}
A.freeTsSet = d => { UI.lvTs.v[d.d] = d.v; freeTsRender(); };
A.freeTsSave = () => {
  const T = UI.lvTs, w = freeW(); if (!T || !w.ts || !T.days.every(d => T.v[d])) return;
  // Mesti: Nepavyko = paslydimas; Mažinti: Nepavyko = viršijau
  for (const s of freeData().subs.filter(s => (s.mode === 'quit' || s.mode === 'reduce') && !s.free)) for (const d of T.days) if (d >= s.start && !s.days[d]) s.days[d] = T.v[d] === 'ok' ? 'ok' : s.mode === 'reduce' ? 'over' : 'slip';
  w.ts--; UI.lvTs = null; A.closeSheet(); commit(); toast('Takas liko, kur buvo', 'good');
};

// ---- pranešimai grįžus: naujas takas, takas nuslinko, naujas kraštas, naujas draugas ----
function freeNotice() {
  const w = freeW(), L = freeLandId(); if (!L) return false;
  const prev = w.cur, pn = w.seen.n ?? L.P.n, sub = L.sub;
  if (!w.lands[L.id]) w.lands[L.id] = {li: L.li, sub: sub.id, from: today(), look: 0};
  if (prev && w.lands[prev]) w.lands[prev].n = Math.max(w.lands[prev].n || 0, pn);
  w.cur = L.id; w.seen.n = L.P.n;
  // gyvūnai, kurie jau atėjo pagal gerų dienų skaičių
  const tot = freeGoodTotal(), pet = Object.keys(FREE_PETS).find(k => tot >= FREE_PETS[k] && !w.items[k] && !(FREE_GIFT.on && (k === 'haskis' || k === 'cihuahua')));
  if (pet) { w.items[pet] = {at: null, t: 0};
    lvSheet(`<div class="chestw open r-l"><i class="rays"></i><span class="won solo">${LVW.petImg(pet, 13, 104)}</span></div><h3>Naujas draugas!</h3><p class="lead">${FREE_PETS[pet]} gerų dienų – ${esc(itemName(pet).toLowerCase())} nori gyventi tavo pasaulyje</p><button class="btn primary big" data-a="freePut" data-k="${pet}">Įleisti į pasaulį</button><button class="btn big t" data-a="closeSheet">Vėliau</button>`); return true; }
  if (!prev || prev === L.id) { if (sub.mode === 'reduce' && L.P.n < pn) { lvSheet(`<h3>Takas nuslinko ${pn - L.P.n} d.</h3><p class="lead">Nepažymėtos dienos: ${pn} → ${L.P.n}. Pasiektas kraštas lieka.</p><button class="btn primary big" data-a="closeSheet">Gerai</button>`); return true; } return false; }
  const [ps, pr] = prev.split('.');
  if (ps === sub.id && +pr !== (sub.mode === 'quit' ? L.P.resets : 0)) {
    const best = Math.max(...Object.values(w.lands).filter(x => x.sub === sub.id).map(x => x.n || 0));
    freeData().xp = (freeData().xp || 0) + 20;
    lvSheet(`<h3>Naujas takas</h3><p class="lead">Metant skaičiuojama kasdien, todėl takas prasideda nuo 0. Rekordas – ${fmtFree(best)} – lieka, o tavo daiktai laukia senajame krašte (žemėlapyje).</p><button class="btn primary big" data-a="closeSheet">Pradėti naują taką</button>`); return true; }
  lvSheet(`<div class="chestw open r-l"><i class="rays"></i><span class="won solo">${daigelis(5)}</span></div><h3>${sub.mode === 'track' ? 'Naujas mėnuo – ' : ''}${LVW.LANDS[L.li].n}!</h3><p class="lead">${sub.mode === 'track' ? 'Stebint kraštas keičiasi kas mėnesį. Nepažymėta diena nieko neatima.' : 'Naujas kraštas atrakintas. Seni daiktai liko ankstesniame – juos rasi žemėlapyje.'}</p><button class="btn primary big" data-a="closeSheet">Puiku</button>`);
  return true;
}

// ---- Mano pasaulis ----
const MP_TABS = [['pets', 'Gyvūnai'], ['pet', 'Jiems'], ['thing', 'Daiktai'], ['tree', 'Medžiai'], ['land', 'Kraštų'], ['sea', 'Sezono']];
function freeMp() {
  const M = UI.lvMp, w = freeW(), L = freeLandId(), tab = M.tab || 'pets', tot = freeGoodTotal();
  const tile = k => { const it = w.items[k], gift = FREE_GIFT.on && (k === 'haskis' || k === 'cihuahua'), on = !!it || gift, here = gift || it?.at === L.id;
    const st = gift ? 'visada su tavim' : here ? (isPet(k) ? 'pasaulyje' : 'pastatyta') : it?.at ? 'kitame krašte' : it ? (it.empty ? 'tuščias' : 'turi') : FREE_PETS[k] ? `${FREE_PETS[k]} d. (${Math.min(tot, FREE_PETS[k])}/${FREE_PETS[k]})` : 'iš dėžės';
    return `<button class="atile ${on ? 'on' : ''} ${here ? 'placed' : ''}" data-a="freeItem" data-k="${k}"><span class="ai">${itemImg(k, isPet(k) ? 48 : 44)}</span><b>${esc(itemName(k))}</b><small>${st}</small></button>`; };
  const grid = ks => `<div class="agrid">${ks.map(tile).join('')}</div>`, C = Object.values(LVW.CAT);
  let body = '';
  if (tab === 'pets') body = `<div class="sec">Šunys</div>${grid(['haskis', 'cihuahua', 'spicas', 'retriveris', 'labradoras', 'biglis', 'korgis'])}<div class="sec">Katės</div>${grid(['ruda', 'trispalve', 'pilka', 'smokingas'])}`;
  else if (tab === 'pet') body = `${grid(['bowl', 'water', 'bed', 'cushion', 'kennel', 'sofa', 'ball', 'frisbee', 'bone', 'rope', 'mouse', 'yarn', 'tower', 'scratch'])}<p class="anote">Maisto: ${w.food} · vandens: ${w.drink}. Dubenėlis tuštėja kas parą, tuščias po paros grįžta čia.</p>`;
  else if (tab === 'thing') body = grid(C.filter(c => c.grp === 'thing').map(c => c.k));
  else if (tab === 'tree') body = `${grid(C.filter(c => c.grp === 'tree').map(c => c.k))}<p class="anote">Kas parą nuo pasodinimo valandos – nauja fazė. Nepažymėjus dienos medis nuvysta, kitą gerą dieną atsigauna.</p>`;
  else if (tab === 'land') body = LVW.LANDS.map((x, li) => `<div class="sec">${x.n}${li !== L.li ? '<small>gaunami tik būnant šiame krašte</small>' : '<small>dabar čia</small>'}</div>${grid(C.filter(c => c.grp === 'land' + li).map(c => c.k))}`).join('');
  else body = [['winter', 'Žiema'], ['spring', 'Pavasaris'], ['summer', 'Vasara'], ['autumn', 'Ruduo']].map(([g, n]) => `<div class="sec">${n}${(freeSeason() || 'summer') === g ? '<small>dabar</small>' : ''}</div>${grid(C.filter(c => c.grp === g).map(c => c.k))}`).join('');
  return `<div class="lv-mp">${spBackLike('Mano pasaulis')}<div class="cap"><span>${LVW.LANDS[L.li].n} · ${freeCount(L.id)} / ${FREE_LIMIT} vietų</span><span>Laiko sustabdymas: ${w.ts} iš 2</span></div>
    <div class="apills">${MP_TABS.map(([k, n]) => `<button class="${tab === k ? 'on' : ''}" data-a="freeMpTab" data-k="${k}">${n}</button>`).join('')}</div>${body}</div>`;
}
const spBackLike = t => `<div class="lv-ob-h" style="margin:4px 0 6px"><button class="lv-ib" style="position:static;background:var(--card);color:var(--text)" data-a="freeMpBack" aria-label="Atgal">${ic('back')}</button><b>${t}</b></div>`;
A.freeMpOpen = () => { A.closeSheet(); UI.lvMp = {tab: 'pets'}; UI.lvOld = null; render(); window.scrollTo(0, 0); };
A.freeMpTab = d => { UI.lvMp.tab = d.k; render(); };
A.freeMpBack = () => { UI.lvMp = null; UI.lvOld = null; render(); window.scrollTo(0, 0); };
A.freeItem = d => {
  const k = d.k, w = freeW(), it = w.items[k], L = freeLandId(), gift = FREE_GIFT.on && (k === 'haskis' || k === 'cihuahua');
  const big = `<div class="chestw"><span class="won solo" style="animation:none">${itemImg(k, isPet(k) ? 104 : 90)}</span></div><h3>${esc(itemName(k))}</h3>${FREE_RAR[k] ? rarTag(FREE_RAR[k]) : ''}`;
  if (gift) return lvSheet(`${big}<p class="lead" style="margin-top:6px">Dovana tik tau. Visada šalia – kiekviename krašte, nereikia statyti ir neužima vietos.${giftFull(freeW().items.bowl || {}) ? ' Šią savaitę jų dubenėlis neištuštės.' : ''}</p><button class="btn primary big" data-a="freeGiftOpen">Perskaityti dar kartą</button><button class="btn big t" data-a="closeSheet">Gerai</button>`);
  if (!it) return lvSheet(`${big}<p class="lead" style="margin-top:6px">${FREE_PETS[k] ? `Ateis pats po ${FREE_PETS[k]} gerų dienų` : LVW.CAT[k]?.grp?.startsWith('land') ? 'Iškrenta iš dėžių, kai esi šiame krašte' : 'Iškrenta iš dėžių'}</p><button class="btn big t" data-a="closeSheet">Gerai</button>`);
  let extra = '';
  if ((k === 'bowl' || k === 'water') && it.at) { const lv = bowlLv(it, k);
    extra = k === 'bowl' ? `<div class="astages">${['Pilnas', '2/3', '1/3', 'Tuščias'].map((n, i) => `<div class="${Math.round((1 - lv) * 3) === i ? 'now' : ''}">${LVW.aImg(LVW.spr(LVW.SH.pet, i + 1), 36)}<b>${n}</b></div>`).join('')}</div><p class="lead">Kas parą maisto mažėja. Tuščias po paros grįžta į Mano pasaulį.</p>` : `<p class="lead">Po ~7 parų išgaruoja – papildai taip pat.</p>`;
    extra += `<button class="btn primary big" data-a="freeRefill" data-k="${k}" ${w[k === 'bowl' ? 'food' : 'drink'] ? '' : 'disabled'}>Papildyti · turi ${w[k === 'bowl' ? 'food' : 'drink']}</button>`; }
  if (LVW.CAT[k]?.stages && it.at) { const st = treeSt(it); extra = `<p class="lead">${st === 'bare' ? 'Nuvytęs – kitą gerą dieną vėl sužaliuos.' : st >= 4 ? 'Užaugęs.' : `Fazė ${st + 1} iš 5 – kas parą nuo pasodinimo nauja.`}</p>`; }
  const here = it.at === L.id, other = it.at && !here;
  lvSheet(`${big}${extra || `<p class="lead" style="margin-top:6px">${here ? 'Stovi šiame krašte' : other ? 'Stovi kitame krašte' : 'Mano pasaulyje'}</p>`}
    ${here ? `<button class="btn ${extra ? '' : 'primary'} big" data-a="${isPet(k) ? 'freeMove' : 'freeDrag'}" data-k="${k}">${isPet(k) ? 'Kita vieta' : 'Perkelti'}</button><button class="btn big t" data-a="freeTake" data-k="${k}">Išimti iš pasaulio</button>` : `<button class="btn primary big" data-a="freePut" data-k="${k}">${other ? 'Perkelti į šį kraštą' : isPet(k) ? 'Įleisti į pasaulį' : 'Pastatyti pasaulyje'}</button>`}`);
};
A.freeMove = d => { const it = freeW().items[d.k], id = it?.at; if (!it) return; it.at = null; const e = it.empty; freePlace(d.k, id); it.empty = e; A.closeSheet(); commit(); };
A.freeTake = d => { const it = freeW().items[d.k]; if (it) it.at = null; A.closeSheet(); commit(); };

// ---- seni kraštai (žemėlapis) ----
function freeMapSheet() {
  const w = freeW(), L = freeLandId(), old = Object.entries(w.lands).filter(([id]) => id !== L.id).map(([id, x]) => ({id, ...x, cnt: Object.values(w.items).filter(it => it.at === id).length})).reverse();
  lvSheet(`<h3 style="margin-top:2px">Mano kraštai</h3>${old.length ? old.map(o => `<button class="lv-box" data-a="freeOld" data-id="${esc(o.id)}"><span class="ci">${daigelis(4)}</span><span class="tx"><b>${LVW.LANDS[o.li].n}</b><small>${fmtFree(o.n || 0)} · ${o.cnt} daiktai</small></span><span class="go1">Nueiti</span></button>`).join('<div style="height:8px"></div>') : '<p class="lead">Kol kas esi pirmame krašte. Kai pereisi į kitą ar pradėsi naują taką, seni kraštai su visais tavo daiktais liks čia.</p>'}<button class="btn big t" data-a="closeSheet">Uždaryti</button>`);
}
A.freeMap = () => freeMapSheet();
A.freeOld = d => { A.closeSheet(); UI.lvOld = d.id; UI.lvMp = null; render(); window.scrollTo(0, 0); };
A.freeOldTake = d => { const w = freeW(); for (const [k, it] of Object.entries(w.items)) if (it.at === UI.lvOld && (!d.k || d.k === k)) it.at = null; commit(); };
function freeOldView(W) {
  const w = freeW(), id = UI.lvOld, meta = w.lands[id]; if (!meta) { UI.lvOld = null; return ''; }
  const things = [], pets = []; for (const [k, it] of Object.entries(w.items)) if (it.at === id) (isPet(k) ? pets : things).push(isPet(k) ? [k, it.x, it.y] : [k, it.x, it.y, LVW.CAT[k]?.stages ? 4 : undefined]);
  const n = meta.n || 0, hud = `<div class="lv-hud"><b class="lv-t">Senas kraštas</b><button class="lv-ib" data-a="freeMpBack" aria-label="Atgal">${ic('back')}</button><div class="lv-big"><span class="n">${fmtFree(n).replace(' d.', '')}</span><span class="u">${n < 365 ? 'dienų' : ''}<small>${LVW.LANDS[meta.li].n} · ${things.length + pets.length} daiktai</small></span></div></div>`;
  const o = {W, h: 440, cut: false, bio: meta.li, look: meta.look || 0, season: freeSeason(), tod: 'day', t: .95, pins: [], things, pets, noRefill: 1, nudgeAll: 1, say: ''};
  const key = JSON.stringify(['old', id, things, pets, W]);
  return `<div class="lvw lv-page"><div class="lv-world" data-key="${esc(key)}">${LVW.world({...o, hud})}</div><div class="lv-sheet">
    <div class="lv-chk"><span class="tx"><b>Tavo daiktai lieka čia</b><small>Paspausk daiktą – išimk į Mano pasaulį</small></span>${things.length + pets.length ? '<button class="btn sm primary" data-a="freeOldTake">Išimti visus</button>' : ''}</div>
    <div class="lv-mp"><div class="agrid">${[...things, ...pets].map(([k]) => `<button class="atile on" data-a="freeOldTake" data-k="${k}"><span class="ai">${itemImg(k, 44)}</span><b>${esc(itemName(k))}</b><small>išimti</small></button>`).join('')}</div></div></div></div>`;
}

// ---- dovana vienai paskyrai (užšifruota: atrakina tik tos paskyros el. paštas) ----
const FREE_GIFT = {on: false, done: false, names: {}, pages: []};
const FREE_GIFT_BOX = {"s": "6CaWVk3Ya5jl+n1GEnxXjQ==", "i": "5p/gLdx2z5JVYUWj", "d": "swwk9eMOB7ItB5kcR+LaBxKpior1uAWrF3aujP4oqW6n7v+Yoo51bHrXqisrFbq9kyzVLWTSkGWJsHQfQkjhc67CwHamHci+vVJlssjM9vfOboJXlMdw1y20gehccFbPVL9bWCEuYwvPHuqWqXb8ElXbzQlxxn8kO5SR7Fw3FEyhcNVhqePCeh7Trn8QPbcIP6t2vYEv6CrL2QUNX284Hc6u5vmBfZn56hZxSR66aPpNL6c4IHrmTJ1xOmOkcX8wP2xYOMh+CvfIuOP1Xo2osWblgDH+7IJ6WUXM1lXXpitiX1mzhGT+v3ZWvjoUoaJLQdM3XajSA88VM1ltXT1GUCoq4JDiMfqq9x6ZNJt04lUNxZjNN5+P7rZoLTjhVs9SJiStOWqg8l5M96CoRGD8UKnkoRfu9vKRkcdhZo+152vtc0hatnfPiCg7gy2UzYLELinKpyoq7G738XD3zKYWAX5Y/MYk7+vKYRVyp8K62Mw/IuymIpd64OvjHivT0EhbnNUGX/LSMnMFxyRPHTnLmwlJOia70xAugrb0Ka4afvKB+N0TKL2/9E42HoCbF32w58ecari7FeBFm73oFdFHiyU8fQfq8t2v4iEJvSsWiOHHF/JiiJVMhCQ523/xA59vl6wLnKamMAAldChF0wgChbdCBVRX6TPvYOfqBmIozoI2k3Ps4oj4z5gR7nr8vxZ6KCBVLH+plfyolMx8ho/aaxBq0PoTG9oUC2AQsPYTb6/HBFHKiWvJlG+0M3YFNYL//bsWL7PPiROOxT5jCV1Ytvc/S9WCfc2tmTPSkrmagmTCu7rGydrlBCUY6NVDw8P56yRRjTUN3tIUVEw6R0YE4nJGNtb3iCWAXHBCEODNnJfvnI45ZyjFVp7wkv33kkv6kARTTIK4JvPNspjgzE4h6KowdP98DLNf5Sz2buQGXARigrXKPkyC5DSDjNwo1O5w86LiYFW+Ei9OI51SQBUPpkvcdZSdaAylc8/gPFV52FLLvweWWPF8AvhaFiJ011uKl9FiBXZx/0Owz1/Tt115ASbtzQOHvCugh1oUcqdHIXm2xqIsdshLQDfZqYJP6whla+Mn8cyLnxv4xXHNNg9/lniO6HNDChT9"};
async function freeGiftInit() {
  try { const em = (DB.email() || '').trim().toLowerCase(); if (!em || !crypto?.subtle || FREE_GIFT.em === em) { FREE_GIFT.done = true; return; } FREE_GIFT.em = em;
    const b = s => Uint8Array.from(atob(s), c => c.charCodeAt(0)), salt = b(FREE_GIFT_BOX.s), raw = new Uint8Array([...salt, ...new TextEncoder().encode(em)]);
    const key = await crypto.subtle.importKey('raw', await crypto.subtle.digest('SHA-256', raw), 'AES-GCM', false, ['decrypt']);
    const p = JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name: 'AES-GCM', iv: b(FREE_GIFT_BOX.i)}, key, b(FREE_GIFT_BOX.d))));
    Object.assign(FREE_GIFT, {on: true, names: p.names || {}, pages: p.pages || []});
  } catch (e) { FREE_GIFT.on = false; }
  FREE_GIFT.done = true;
}
function freeGiftShow() {
  const G = FREE_GIFT, i = UI.lvGift ?? 0, pg = G.pages[i]; if (!pg) return;
  let el = document.querySelector('.lv-gift'); if (!el) { el = document.createElement('div'); el.className = 'lv-gift'; document.body.appendChild(el); }
  const last = i === G.pages.length - 1;
  el.innerHTML = `<div class="card2" role="dialog" aria-modal="true"><div class="dogs">${i === 0 ? daigelis(5) : LVW.petImg('haskis', i === 2 ? 13 : 1, 118) + LVW.petImg('cihuahua', i === 2 ? 13 : 1, 78)}</div><h3>${esc(pg[0])}</h3><p>${esc(pg[1])}</p>
    <div class="dots">${G.pages.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div><button class="btn primary big" data-a="freeGiftNext">${last ? 'Pas juos' : 'Toliau'}</button></div>`;
}
A.freeGiftOpen = () => { A.closeSheet(); UI.lvGift = 0; freeGiftShow(); };
A.freeGiftNext = () => {
  UI.lvGift = (UI.lvGift ?? 0) + 1; if (UI.lvGift < FREE_GIFT.pages.length) return freeGiftShow();
  document.querySelector('.lv-gift')?.remove(); UI.lvGift = null; const w = freeW();
  if (!w.giftSeen) { w.giftSeen = 1; w.giftAt = Date.now(); w.food += 2; w.drink += 1;
    for (const k of ['bowl', 'water']) { if (!w.items[k]) w.items[k] = {at: null, t: Date.now(), gift: 1}; else w.items[k].gift = 1; freePlace(k); } }
  commit();
};
// gyvūną paspaudus – jo vardas (dovanotiems – jų tikri vardai)
document.addEventListener('click', e => { const p = e.target.closest('.lv-world .apet'); if (!p) return; const box = p.closest('.lv-world'), i = [...box.querySelectorAll('.apet')].indexOf(p), n = LV_PETN[i]; if (!n) return;
  box.querySelector('.lv-name')?.remove(); const r = p.getBoundingClientRect(), b = box.getBoundingClientRect(), el = document.createElement('div'); el.className = 'lv-name'; el.textContent = n;
  el.style.left = (r.left - b.left + r.width / 2) + 'px'; el.style.top = (r.top - b.top - 4) + 'px'; box.appendChild(el); setTimeout(() => el.remove(), 2200); });

// ===================== VALDIKLIS (Android pagrindinis ekranas) =====================
// Gimtasis valdiklis (android-app, LsWidget): rodo mažą tako vaizdą su Daigeliu, dienas ir +1 mygtukus.
// +1 valdiklyje įrašomas telefone į eilę; atidarius programėlę eilė perkeliama čia (freeWidgetPull).
const LSW = () => window.Capacitor?.Plugins?.LsWidget;
const FREE_SHORT = {cig: 'Cigaretės', vape: 'Elektroninė', pouch: 'Snusas', heat: 'Kaitinamas', chew: 'Kramtomas', hookah: 'Kaljanas', alc: 'Alkoholis', energy: 'Energetiniai', fast: 'Greitas m.', other: 'Kita'};
const freeTap = s => s.k === 'vape' ? (+s.tap || 10) : 1;   // elektroninė: vienas paspaudimas = 10 įtraukimų
const loadImg = src => new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });
async function freeWidgetImg() {
  const box = document.querySelector('.lv-page .lv-world'), svg = box?.querySelector('.wd > svg.land'), im = svg?.querySelector('image'), wk = box?.querySelector('.walker'); if (!im) return null;
  const B = box.getBoundingClientRect(), W = B.width, H = Math.round(W / 2.2), wr = wk ? wk.getBoundingClientRect() : null, cy = wr ? wr.top - B.top + wr.height / 2 : B.height / 2, top = Math.max(0, Math.min(B.height - H, cy - H * .55));
  const c = document.createElement('canvas'), k = 480 / W; c.width = 480; c.height = Math.round(H * k); const g = c.getContext('2d'); g.scale(k, k);
  const bg = await loadImg(im.getAttribute('href')); if (!bg) return null;
  g.drawImage(bg, +im.getAttribute('x') || 0, (+im.getAttribute('y') || 0) - top, +im.getAttribute('width'), +im.getAttribute('height'));
  // Daigelis – dešinėje, kur valdiklyje nėra užrašų ir mygtukų
  const di = wk?.querySelector('image'); if (di) { const d = await loadImg(di.getAttribute('href')), dh = H * .58; if (d) g.drawImage(d, W * .97 - dh * d.width / d.height, H * .06, dh * d.width / d.height, dh); }
  try { return c.toDataURL('image/png').split(',')[1]; } catch (e) { return null; }
}
let LSW_T = 0;
function freeWidgetSync(img) {
  const P = LSW(); if (!P) return; clearTimeout(LSW_T);
  LSW_T = setTimeout(async () => {
    const F = freeData(), sub = freeMain();
    if (!F.on || F.hidden || !sub) return P.update({on: false, days: 'Laisvė', sub: 'Atidaryk programėlę'}).catch(() => {});
    if (F.widgetOff) return P.update({on: false, days: 'Valdiklis išjungtas', sub: 'Įjungti: Laisvė → ⋯ → Valdiklis'}).catch(() => {});
    const Pg = freeProg(sub), d = today(), btns = F.subs.slice(0, 2).map(s => { const c = (s.counts || {})[d] || 0, u = freeSub(s.k);
      return {id: s.id, label: s.mode === 'quit' ? FREE_SHORT[s.k] || u[0] : `${FREE_SHORT[s.k] || u[0]} · ${c}${s.mode === 'reduce' ? ' iš ' + (+s.limit || 0) : ''}`, step: freeTap(s)}; });
    const data = {on: true, days: fmtFree(Pg.n), sub: sub.mode === 'quit' ? 'be ' + freeSub(sub.k)[1] : sub.mode === 'reduce' ? 'pagal planą' : 'stebi', btns};
    if (img !== false && UI.view === 'free') { const b = await freeWidgetImg(); if (b) data.img = b; }
    P.update(data).catch(() => {});
  }, 800);
}
// valdiklio +1 eilė → duomenys
async function freeWidgetPull() {
  const P = LSW(); if (!P) return; let q = [];
  try { q = (await P.pull())?.queue || []; } catch (e) { return; }
  if (!q.length) return;
  const F = freeData(); let n = 0;
  for (const e of q) { const s = F.subs.find(x => x.id === e.id); if (!s) continue; const day = ymd(new Date(+e.t || Date.now()));
    if (s.mode === 'quit') { if (!s.days[day] && await ask('Valdiklyje paspaudei +1', `${freeSub(s.k)[0]} – ${relDay(day)}. Užrašyti? Takas prasidės iš naujo, daiktai ir ženkliukai liks.`, {yes: 'Taip, užrašyti', no: 'Ne, netyčia'})) s.days[day] = 'slip'; continue; }
    s.counts = s.counts || {}; s.counts[day] = (s.counts[day] || 0) + (+e.step || 1); n += +e.step || 1; }
  commit(); if (n) toast(`Iš valdiklio: +${n}`);
}
document.addEventListener('visibilitychange', () => { if (!document.hidden && freeOn()) freeWidgetPull(); });
A.freeWidget = async () => {
  const P = LSW();
  lvSheet(`<h3 style="margin-top:2px">Valdiklis telefono ekrane</h3><p class="lead">Takas su Daigeliu, dienos ir +1 – tiesiai pagrindiniame ekrane. +1 įrašomas neatidarius programėlės${freeData().subs.some(s => s.k === 'vape') ? ' (elektroninė: vienas paspaudimas = 10 įtraukimų)' : ''}. Paspaudus taką – atsidaro Laisvė.</p>
    ${P ? `<div class="lv-lim" style="background:var(--card2);border-radius:18px;margin:8px 0"><span class="tx"><b>Valdiklis</b><small>${freeData().widgetOff ? 'išjungtas – rodo tik užrašą' : 'įjungtas – rodo taką ir +1'}</small></span><button class="lv-sw ${freeData().widgetOff ? '' : 'on'}" data-a="freeWidgetToggle" aria-label="Įjungti ar išjungti valdiklį"><i></i></button></div>
      <button class="btn primary big" data-a="freeWidgetPin">Pridėti į ekraną</button><p class="lead" style="margin-top:10px;font-size:13px;text-align:left">Pridėti ranka: ilgai paspausk tuščią vietą ekrane → Valdikliai → Life Schedule → Laisvė.<br>Nuimti iš ekrano: ilgai paspausk valdiklį → Pašalinti.</p>` : `<p class="lead">Valdiklis veikia tik Android programėlėje (life-schedule.apk). Įdiegus: ilgai paspausk tuščią vietą ekrane → Valdikliai → Life Schedule.</p>`}
    <button class="btn big t" data-a="closeSheet">Uždaryti</button>`);
};
A.freeWidgetPin = async () => { const P = LSW(); if (!P) return; freeWidgetSync(); try { const r = await P.pin(); if (!r?.ok) toast('Ilgai paspausk ekraną → Valdikliai → Life Schedule'); } catch (e) { toast('Ilgai paspausk ekraną → Valdikliai → Life Schedule'); } A.closeSheet(); };
A.freeWidgetNo = () => { freeW().seen.widget = 1; commit(); };

// ===================== „SUNKU?“ – Esu čia, kvėpavimas, Kodėl pradėjau, Užimk rankas, pokalbis (docs/laisve-technika.md 8–9) =====================
const HELP_NUMS = [['116 123', 'Vilties linija', 'suaugusiems, visą parą', '116123'], ['8 800 28888', 'Jaunimo linija', 'jauniems žmonėms', '880028888'], ['1819', 'Metimo rūkyti linija', 'padeda mesti rūkyti', '1819', 'tob']];
const TOBACCO = ['cig', 'vape', 'pouch', 'heat', 'chew', 'hookah'];
const helpRows = (danger) => (danger ? [['112', 'Skubi pagalba', 'kai gresia pavojus', '112'], ...HELP_NUMS] : HELP_NUMS).filter(n => n[4] !== 'tob' || freeData().subs.some(s => TOBACCO.includes(s.k)))
  .map(([n, t, s, tel]) => `<a class="lv-help" href="tel:${tel}"><span class="tx"><b>${t}</b><small>${s}</small></span><span class="num">${n}</span></a>`).join('');
A.freeHard = () => {
  lvSheet(`<div style="display:flex;gap:14px;align-items:center;text-align:left">${daigelis(4)}<div><h3 style="margin:0">Esu čia</h3><p class="lead" style="margin:2px 0 0">Noras praeina per kelias minutes. Pabūkim kartu.</p></div></div>
    <div class="lv-hard">${[['freeBreath', 'Pakvėpuokim kartu', '2–3 min · uždegsim žvaigždyną'], ['freeWhy', 'Kodėl pradėjau', 'tavo žodžiai ir ką jau atgavai'], ['freeHands', 'Užimk rankas', 'pienių pūtimas'], ['freeChat', 'Pasikalbėk su Daigeliu', 'parašyk, kaip jautiesi'], ['freeHuman', 'Pasikalbėti su žmogumi', 'nemokamos linijos']].map(([a, t, s]) => `<button data-a="${a}"><span class="tx"><b>${t}</b><small>${s}</small></span>${ic('arrow', 'sm')}</button>`).join('')}</div>
    <button class="btn primary big" data-a="freeHeld">Atlaikiau · +5 XP</button>`, 'lv-hardsh');
};
A.freeHuman = () => lvSheet(`<h3 style="margin-top:2px">Pasikalbėti su žmogumi</h3><p class="lead">Žmonės, kurie tam ruošti. Nemokamai, galima ir anonimiškai.</p>${helpRows(UI.lvDanger)}<button class="btn big t" data-a="freeHard">Atgal</button>`);
A.freeHeld = () => {
  const F = freeData(); F.held = (F.held || 0) + 1; F.xp = (F.xp || 0) + 5; commit({noRender: true}); lvFull(null); render();
  const left = 25 - F.held % 25;
  lvSheet(`<div class="chestw open r-l"><i class="rays"></i><span class="won solo">${daigelis(5)}</span></div><h3>Atlaikei!</h3><p class="lead">${F.held}-as kartas · +5 XP${F.held < 25 ? ` · iki ženkliuko „25 atlaikyti“ – dar ${left}` : ''}</p><button class="btn primary big" data-a="closeSheet">Ačiū</button>`);
};
// pilno ekrano Laisvės vaizdai (kvėpavimas, rankos, pokalbis, kodėl): UI.lvFull
function lvFull(kind) { UI.lvFull = kind; clearInterval(UI.lvT); UI.lvT = 0; lvAudioStop(); if (!kind) { document.querySelector('.lv-full')?.remove(); return; } A.closeSheet(); let el = document.querySelector('.lv-full'); if (!el) { el = document.createElement('div'); el.className = 'lv-full'; document.body.appendChild(el); } return el; }
A.freeFullClose = () => { lvFull(null); };

// ---- kvėpavimas: įkvėpk 4, iškvėpk 6; kas iškvėpimą – žvaigždė; 14 žvaigždžių = žvaigždynas ----
const LV_CP = [[60, 40], [104, 70], [150, 54], [190, 96], [236, 74], [282, 104], [300, 160], [256, 196], [212, 160], [176, 196], [140, 236], [96, 214], [64, 170], [110, 140]];
const LV_CL = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 3], [3, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 3]];
let LV_AC = null, LV_OSC = null;
function lvTone(up) {   // vos girdimas švelnus tonas: įkvepiant kyla, iškvepiant leidžiasi
  if (freeData().quiet === 'off') return; try {
    LV_AC = LV_AC || new (window.AudioContext || window.webkitAudioContext)(); const t = LV_AC.currentTime, o = LV_AC.createOscillator(), g = LV_AC.createGain(), d = up ? 4 : 6;
    o.type = 'sine'; o.frequency.setValueAtTime(up ? 196 : 262, t); o.frequency.linearRampToValueAtTime(up ? 262 : 196, t + d);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.025, t + .8); g.gain.linearRampToValueAtTime(.018, t + d - 1); g.gain.linearRampToValueAtTime(0, t + d);
    o.connect(g); g.connect(LV_AC.destination); o.start(t); o.stop(t + d + .05); LV_OSC = o;
  } catch (e) {}
}
function lvAudioStop() { try { LV_OSC?.stop(); } catch (e) {} LV_OSC = null; }
A.freeBreath = () => { const el = lvFull('breath'); UI.lvB = {n: 0, ph: 'in', sec: 4, t0: Date.now()}; lvBreathDraw(); lvTone(true);
  UI.lvT = setInterval(() => { const B = UI.lvB; if (!B || UI.lvFull !== 'breath') return; B.sec--; if (B.sec <= 0) { if (B.ph === 'in') { B.ph = 'out'; B.sec = 6; lvTone(false); } else { B.n++; if (B.n >= 14) { B.ph = 'done'; clearInterval(UI.lvT); } else { B.ph = 'in'; B.sec = 4; lvTone(true); } } } lvBreathDraw(); }, 1000); };
function lvBreathDraw() {
  const B = UI.lvB, el = document.querySelector('.lv-full'); if (!el || !B) return; const s = Math.round((Date.now() - B.t0) / 1000), q = freeData().quiet === 'off';
  // ta pati fazė ir žvaigždžių skaičius – keičiam tik skaičius ir klases (kad ratas ir Daigelis plėstųsi sklandžiai)
  const ring = el.querySelector('.ring2'); if (ring && B.ph !== 'done' && el.dataset.n === String(B.n)) {
    ring.className = 'ring2 ' + B.ph; ring.querySelector('b').firstChild.textContent = B.ph === 'in' ? 'Įkvėpk' : 'Iškvėpk'; ring.querySelector('small').textContent = B.sec;
    el.querySelector('.dgb').className = 'dgb ' + B.ph; el.querySelector('.bot p').textContent = B.ph === 'out' ? 'Lėtai pro burną' : 'Pro nosį, ramiai';
    el.querySelector('.hint span:last-child').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; el.querySelector('.snd').textContent = q ? 'Be garso' : 'Tyliai'; return; }
  el.dataset.n = B.n;
  const cons = `<svg class="cons" viewBox="0 0 348 280">${LV_CL.filter(([a, b]) => a < B.n && b < B.n).map(([a, b]) => `<line x1="${LV_CP[a][0]}" y1="${LV_CP[a][1]}" x2="${LV_CP[b][0]}" y2="${LV_CP[b][1]}" stroke="#ffd9a8" stroke-width="1.6" opacity=".7"/>`).join('')}${LV_CP.map(([x, y], i) => i < B.n ? `<circle cx="${x}" cy="${y}" r="4.5" fill="#fff6d8"/><circle cx="${x}" cy="${y}" r="10" fill="#ffd9a8" opacity=".25"/>` : i === B.n && B.ph !== 'done' ? `<circle cx="${x}" cy="${y}" r="7" fill="#ffc29a"><animate attributeName="r" values="5;11;5" dur="1.6s" repeatCount="indefinite"/></circle>` : `<circle cx="${x}" cy="${y}" r="2.5" fill="#fff" opacity=".3"/>`).join('')}</svg>`;
  el.innerHTML = `<div class="brz">${Array.from({length: 30}, (_, i) => `<span class="star" style="left:${(i * 71) % 96 + 2}%;top:${(i * 43) % 90 + 3}%;animation-delay:${i % 7 * .4}s"></span>`).join('')}
    <div class="hint"><span>Žvaigždynas ${B.n} / 14</span><button class="snd" data-a="freeQuiet">${q ? 'Be garso' : 'Tyliai'}</button><span>${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}</span></div>${cons}
    ${B.ph === 'done' ? '' : `<div class="ring2 ${B.ph}"><b>${B.ph === 'in' ? 'Įkvėpk' : 'Iškvėpk'}<small>${B.sec}</small></b></div>`}
    <div class="dgb ${B.ph}">${daigelis(5)}</div>
    <div class="bot">${B.ph === 'done' ? `<h2>Žvaigždynas uždegtas</h2><p>${Math.max(1, Math.round(s / 60))} min. Tu ir Daigelis.</p><button class="btn primary big" data-a="freeChat">Toliau</button>` : `<p>${B.ph === 'out' ? 'Lėtai pro burną' : 'Pro nosį, ramiai'}</p><button class="btn big t" data-a="freeFullClose">Baigti</button>`}</div></div>`;
  if (B.ph === 'in') { const r = el.querySelector('.ring2'), g = el.querySelector('.dgb'); r.className = 'ring2 out'; g.className = 'dgb out'; requestAnimationFrame(() => requestAnimationFrame(() => { r.className = 'ring2 in'; g.className = 'dgb in'; })); }
}
A.freeQuiet = () => { const F = freeData(); F.quiet = F.quiet === 'off' ? '' : 'off'; if (F.quiet === 'off') lvAudioStop(); storeLocal(); lvBreathDraw(); };

// ---- Užimk rankas: paliesk pienę – nupūsk ----
A.freeHands = () => { const el = lvFull('hands'); UI.lvH = {n: 0, t0: Date.now(), d: Array.from({length: 8}, (_, i) => ({x: 6 + (i % 4) * 23 + Math.random() * 8, y: 44 + Math.floor(i / 4) * 22 + Math.random() * 8, s: 1.2 + Math.random() * .6, b: 0}))}; lvHandsDraw(); UI.lvT = setInterval(() => { const t = document.querySelector('.dand .tm'); if (t && UI.lvH) { const s = Math.round((Date.now() - UI.lvH.t0) / 1000); t.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; } }, 1000); };
const lvDand = (blown) => `<svg viewBox="0 0 40 90"><path d="M20 90 Q18 60 20 30" stroke="#4f8a4a" stroke-width="2.5" fill="none"/>${blown ? '<circle cx="20" cy="28" r="4" fill="#c9b27a"/>' : Array.from({length: 16}, (_, i) => { const a = i / 16 * Math.PI * 2; return `<line x1="20" y1="28" x2="${20 + 14 * Math.cos(a)}" y2="${28 + 14 * Math.sin(a)}" stroke="#fff" stroke-width="1.4"/><circle cx="${20 + 14 * Math.cos(a)}" cy="${28 + 14 * Math.sin(a)}" r="2.2" fill="#fff"/>`; }).join('') + '<circle cx="20" cy="28" r="3" fill="#e9dcc0"/>'}</svg>`;
function lvHandsDraw() {
  const H = UI.lvH, el = document.querySelector('.lv-full'); if (!el || !H) return;
  el.innerHTML = `<div class="dand"><div class="top"><span>${H.n} ${H.n % 10 === 1 && H.n % 100 !== 11 ? 'pienė' : 'pienės'}</span><span class="tm">0:00</span></div><div class="dg">${daigelis(5)}</div>
    ${H.d.map((p, i) => `<button class="pn ${p.b ? 'b' : ''}" style="left:${p.x}%;top:${p.y}%;width:${40 * p.s}px" data-a="freeBlow" data-i="${i}" aria-label="Pienė">${lvDand(p.b)}</button>`).join('')}
    <div class="bot">Paliesk pienę – nupūsk<button class="btn big t" data-a="freeHandsEnd">Baigti</button></div></div>`;
}
A.freeBlow = d => { const H = UI.lvH, p = H?.d[+d.i]; if (!p || p.b) return; p.b = 1; H.n++;
  const el = document.querySelector(`.dand .pn[data-i="${d.i}"]`); if (el) { const r = el.getBoundingClientRect(); for (let k = 0; k < 10; k++) { const s = document.createElement('span'); s.className = 'seed'; s.style.left = (r.left + r.width / 2) + 'px'; s.style.top = (r.top + r.width * .7) + 'px'; s.style.setProperty('--dx', (Math.random() * 160 - 40) + 'px'); s.style.setProperty('--dy', (-80 - Math.random() * 160) + 'px'); document.body.appendChild(s); setTimeout(() => s.remove(), 2200); } }
  setTimeout(() => { if (UI.lvH === H) { p.b = 0; p.x = 6 + Math.random() * 80; p.y = 44 + Math.random() * 34; lvHandsDraw(); } }, 2600); lvHandsDraw(); };
A.freeHandsEnd = () => A.freeChat();

// ---- Kodėl pradėjau ----
A.freeWhy = () => {
  const el = lvFull('why'), F = freeData(), sub = freeMain(), P = sub ? freeProg(sub) : {n: 0}, start = F.subs.map(s => s.start).sort()[0];
  const best = F.subs.map(s => [s, freeProg(s)]).filter(([s]) => s.mode !== 'track');
  el.innerHTML = `<div class="why5"><div class="lv-ob-h" style="margin-bottom:6px"><button class="lv-ib" style="position:static;background:var(--card);color:var(--text)" data-a="freeFullClose" aria-label="Atgal">${ic('back')}</button><b>Kodėl pradėjau</b></div>
    ${F.why ? `<p class="q">${esc(F.why)}</p><div class="when">Parašei ${start ? fmtDate(start) : ''}, pirmą dieną</div>` : `<p class="lead">Dar neparašei, kodėl. Parašyk sau – parodysim, kai bus sunku.</p><button class="btn" data-a="freeEdit">Parašyti</button>`}<div class="media lv-media"></div>
    <div class="sec">Ką jau atgavai</div><div class="gained">${best.map(([s, p]) => `<div><b>${fmtFree(p.n)}</b><small>${s.mode === 'quit' ? 'be ' + freeSub(s.k)[1] : freeSub(s.k)[0] + ' pagal planą'}</small></div>`).join('')}<div><b>${F.held || 0}</b><small>atlaikyti norai</small></div><div><b>${freeLevel().lv} lygis</b><small>${F.xp || 0} XP</small></div></div></div>
    <div class="dockw"><button class="btn" data-a="freeBreath">Pakvėpuokim</button><button class="btn primary" data-a="freeHeld">Atlaikiau</button></div>`;
  freeWhyMedia();
};

// ---- pokalbis: mygtukai → rašai → Daigelis atsako (Claude); „Ar jau geriau?“, 40 žinučių riba, ~150 per dieną ----
const LV_CHIPS = ['Geriau', 'Vis dar noriu', 'Pykstu', 'Liūdna', 'Pavargau'];
const LV_LOCAL = ['Girdžiu. Pabandyk išgerti stiklinę vandens ir lėtai iškvėpti – noras po kelių minučių nuslūgsta.', 'Suprantu. Kas būtų mažas dalykas, kurį galėtum padaryti dabar vietoj to?', 'Tu jau čia ir kalbi su manim – tai jau stiprus žingsnis. Pabūkim dar minutę.', 'Pabandyk paimti ką nors į rankas ar trumpai išeiti į lauką. Aš šalia.'];
A.freeChat = () => { lvFull('chat'); const F = freeData(), d = today(); if (F.chatDay?.d !== d) F.chatDay = {d, n: 0}; UI.lvC = {msgs: [], ask: 0, no: 0, busy: false, done: false}; lvChatDraw(); };
function lvChatDraw(focus) {
  const C = UI.lvC, el = document.querySelector('.lv-full'); if (!el || !C) return; const F = freeData(), limit = C.msgs.filter(m => m.me).length >= 40 || (F.chatDay?.n || 0) >= 150;
  const prev = el.querySelector('textarea')?.value || '';
  el.innerHTML = `<div class="lv-chat"><div class="chhead"><button class="lv-ib back" data-a="freeHard" aria-label="Atgal">${ic('back')}</button><span class="who2">${daigelis(4)}Daigelis</span><button class="hum" data-a="freeHuman">Žmogus</button><button class="end" data-a="freeChatEnd">Baigti</button></div>
    <div class="chat">${!C.msgs.length ? `<div class="hello">${daigelis(4)}<h3>Kaip jautiesi dabar?</h3></div><div class="chips">${LV_CHIPS.map(x => `<button data-a="freeChatSay" data-t="${x}">${x}</button>`).join('')}</div>` : ''}
      ${C.msgs.map(m => `<div class="${m.me ? 'lv-me' : 'lv-dg'}">${esc(m.t)}</div>`).join('')}${C.danger ? `<div class="limcard">${helpRows(true)}</div>` : ''}
      ${C.busy ? '<div class="lv-dg typing"><i></i><i></i><i></i></div>' : ''}
      ${C.ask && !C.busy && !limit && !C.done ? `<div class="askb"><span>Ar jau geriau?</span><button data-a="freeChatBetter" data-v="1">Taip</button><button data-a="freeChatBetter" data-v="0">Dar ne</button></div>` : ''}
      ${limit || C.done ? `<div class="lv-dg">${limit ? 'Šiandien daugiau pakalbėti nebegalėsim, bet matau, kad jau tvirčiau stovi. Pakvėpuokim dar kartą?' : 'Ačiū, kad pasikalbėjai. Ar dar reikia ramybės?'}</div><div class="limcard"><button class="btn primary big" data-a="freeBreath">Pakvėpuokim</button><button class="btn big t" data-a="${limit ? 'freeHard' : 'freeChatEnd'}">${limit ? 'Grįžti į „Esu čia“' : 'Ne, jau gerai'}</button></div>` : ''}</div>
    <div class="micbar ${limit ? 'off' : ''}"><textarea rows="1" maxlength="600" placeholder="${limit ? 'Šiandien pokalbis baigtas' : 'Parašyk, kaip jautiesi…'}" ${limit ? 'disabled' : ''}></textarea><button class="send" data-a="freeChatSend" aria-label="Siųsti" ${limit || C.busy ? 'disabled' : ''}>${ic('arrow')}</button></div></div>`;
  const ta = el.querySelector('textarea'); if (ta) { ta.value = prev; if (focus) ta.focus(); }
  const ch = el.querySelector('.chat'); if (ch) ch.scrollTop = ch.scrollHeight;
}
A.freeChatSend = () => { const ta = document.querySelector('.lv-full textarea'), t = (ta?.value || '').trim(); if (!t) return; ta.value = ''; A.freeChatSay({t}); };
A.freeChatSay = async d => {
  const C = UI.lvC, F = freeData(), t = String(d.t || '').trim().slice(0, 600); if (!C || !t || C.busy || C.done) return;
  if (C.msgs.filter(m => m.me).length >= 40 || (F.chatDay?.n || 0) >= 150) return lvChatDraw();
  C.msgs.push({me: 1, t}); C.busy = true; F.chatDay.n++; storeLocal(); lvChatDraw();
  const sub = freeMain(), ctx = `${F.subs.map(s => `${freeSub(s.k)[0]} (${FREE_MODES[s.mode]})`).join(', ')}; ${sub ? fmtFree(freeProg(sub).n) : ''}; atlaikyta ${F.held || 0}`;
  let r = null; if (cloudOn()) r = await DB.fn('free_chat', {msgs: C.msgs.slice(-16), ctx}).catch(() => null);
  if (UI.lvC !== C) return;
  C.busy = false; C.msgs.push({t: r?.ok && r.reply ? r.reply : LV_LOCAL[C.msgs.length % LV_LOCAL.length]}); if (r?.danger) { C.danger = true; UI.lvDanger = true; }
  const mine = C.msgs.filter(m => m.me).length; if (C.no < 2 && mine >= 3 && mine % 3 === 0) C.ask = 1;
  lvChatDraw(true);
};
A.freeChatBetter = d => { const C = UI.lvC; if (!C) return; C.ask = 0; if (+d.v) C.done = true; else C.no++; lvChatDraw(); };
A.freeChatEnd = () => { lvFull(null); A.freeHard(); };
document.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && e.target.closest?.('.lv-chat textarea')) { e.preventDefault(); A.freeChatSend(); } });

// ---- daikto tempimas pirštu: Mano pasaulis → Perkelti → tempi daiktą pasaulyje ----
A.freeDrag = d => { A.closeSheet(); UI.lvMp = null; UI.lvOld = null; UI.lvDrag = d.k; render(); window.scrollTo(0, 0); };
A.freeDragDone = () => { UI.lvDrag = null; render(); };
function freeDragMount(box) {
  const k = UI.lvDrag, Wd = LVW.WORLDS.find(w => box.contains(w.el)), th = Wd && (Wd.things?.[k] || Wd.pets?.find(p => p.key === k)); if (!th) return;
  const el = th.d; el.classList.add('lv-drag'); box.classList.add('dragging'); const B = () => box.querySelector('.wd').getBoundingClientRect();
  let on = false;
  const move = e => { if (!on) return; e.preventDefault(); const b = B(), x = Math.max(10, Math.min(b.width - 10, e.clientX - b.left)), y = Math.max(b.height * .3, Math.min(b.height - 8, e.clientY - b.top));
    th.x = x; th.y = y; if (th.draw) th.draw(); else { el.style.left = x + 'px'; el.style.top = y + 'px'; } if (th.tx != null) { th.tx = x; th.ty = y; } };
  const up = () => { if (!on) return; on = false; const b = B(), it = freeW().items[k]; if (it) { it.x = +(th.x / b.width).toFixed(3); it.y = +(th.y / b.height).toFixed(3); } commit({noRender: true}); UI.lvRedraw = (UI.lvRedraw || 0) + 1; render(); };
  box.addEventListener('pointerdown', e => { const r = el.getBoundingClientRect(); if (e.clientX < r.left - 24 || e.clientX > r.right + 24 || e.clientY < r.top - 24 || e.clientY > r.bottom + 24) return; on = true; box.setPointerCapture?.(e.pointerId); move(e); });
  box.addEventListener('pointermove', move); box.addEventListener('pointerup', up); box.addEventListener('pointercancel', up);
}

// ===================== ŽENKLIUKAI (docs/laisve-technika.md, maketas „8. Ženkliukai“) =====================
const MS_XP = [5, 10, 20, 50, 100, 200, 300, 500, 800, 1000, 2000, 3000, 5000];
const MS_BG = ['#3d6b42', '#3d6b42', '#4f8a4a', '#3d6b42', '#2c5a7a', '#5a4a8a', '#5a4a8a', '#8a4a2a', '#2c3f8a', '#3a2a6a', '#2c3f8a', '#2c3f8a', '#2c3f8a'];
const SPEC_B = [['held10', '10 atlaikytų', ['#ff8fa3', '#ff4f7a'], 'heart2', F => (F.held || 0) >= 10], ['held25', '25 atlaikyti', ['#ff6f91', '#c2255c'], 'heart2', F => (F.held || 0) >= 25],
  ['week', 'Savaitės iššūkis', ['#ffb347', '#e8692c'], 'star', F => !!F.w?.wk], ['box30', '30 dėžių', ['#ffd166', '#d99a1c'], 'star', F => (F.w?.opened || 0) >= 30]];
// geriausias kada nors pasiektas dienų skaičius (rekordas) kiekvienai priklausomybei
function freeBest(s) { const w = freeW(); w.best = w.best || {}; const n = freeProg(s).n; if (n > (w.best[s.id] || 0)) w.best[s.id] = n; return w.best[s.id] || 0; }
function freeBadges() {
  const F = freeData(), L = freeLevel(), resets = Math.max(0, ...F.subs.map(s => freeProg(s).resets));
  const grid = s => { const b = freeBest(s); return `<div class="bgrid">${LVW.MS.map(([n], i) => `<div class="${b >= FREE_MS[i] ? 'on' : ''}">${LVW.badge(i, 54, {locked: b < FREE_MS[i]})}<span>${n}</span></div>`).join('')}</div>`; };
  return `<div class="lv-mp lv-bd">${spBackLike('Ženkliukai')}<div class="bdtop"><b>${F.xp || 0} XP</b><small>${L.lv} lygis · XP niekada neatimamas</small></div>
    <div class="sec">Kaip auga</div><div class="tierrow">${[[0, 'Sėkla'], [2, 'Pieva'], [4, 'Ežeras'], [7, 'Metai'], [10, '10 metų']].map(([i, n], k) => `<div>${LVW.badge(i, 40 + k * 5)}<span>${n}</span></div>`).join('')}</div>
    ${F.subs.filter(s => s.mode !== 'track').map(s => `<div class="sec">${s.mode === 'quit' ? 'Be ' + freeSub(s.k)[1] : freeSub(s.k)[0] + ' pagal planą'}<small>rekordas ${fmtFree(freeBest(s))}</small></div>${grid(s)}`).join('')}
    <div class="sec">Ypatingi</div><div class="bgrid">${resets ? `<div class="on">${LVW.badge(0, 54, {again: 1})}<span>Nauja sėkla${resets > 1 ? ' ×' + resets : ''}</span></div>` : ''}${SPEC_B.map(([, n, c, sym, ok]) => `<div class="${ok(F) ? 'on' : ''}">${LVW.badge(0, 54, {special: c, sym, locked: !ok(F)})}<span>${n}</span></div>`).join('')}</div>
    <p class="anote">Paslydus takas prasideda iš naujo, bet gauti ženkliukai lieka.</p>
    <div class="sec">Už ką XP</div><div class="xprow">${[['Pažymėta diena', '+10'], ['Atlaikytas noras', '+5'], ['Dienos dėžė', '+15…60'], ['Naujas ženkliukas', '+5…5 000'], ['Pradėti iš naujo', '+20']].map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join('')}</div></div>`;
}
A.freeBadgesOpen = () => { A.closeSheet(); UI.lvMp = {tab: 'badges'}; render(); window.scrollTo(0, 0); };
// naujas ženkliukas – šventimas (vieną kartą kiekvienam)
function freeReveal() {
  const F = freeData(), w = freeW(); w.ms = w.ms || {};
  for (const s of F.subs.filter(s => s.mode !== 'track')) {
    const b = freeBest(s), got = FREE_MS.filter(d => b >= d).length - 1, had = w.ms[s.id] ?? -1;
    if (got > had) { w.ms[s.id] = got; if (had < 0 && got > 0) w.ms[s.id] = got;   // pirmą kartą – tik paskutinis
      const i = got, xp = MS_XP[i] || 0; F.xp = (F.xp || 0) + xp;
      lvRevealShow(i, LVW.MS[i][0] === '1 d.' ? 'Pirma diena!' : LVW.MS[i][0], `${s.mode === 'quit' ? 'Be ' + freeSub(s.k)[1] : freeSub(s.k)[0] + ' pagal planą'} · +${xp} XP`, MS_BG[i] || '#3d6b42', {kind: i >= 10 ? 'Legendinis ženkliukas' : 'Naujas ženkliukas'}); return true; }
  }
  for (const [k, n, c, sym, ok] of SPEC_B) { w.sb = w.sb || {}; if (ok(F) && !w.sb[k]) { w.sb[k] = 1; F.xp = (F.xp || 0) + 25; lvRevealShow(0, n, 'Ypatingas ženkliukas · +25 XP', '#8a3a12', {special: c, sym, kind: 'Ypatingas ženkliukas'}); return true; } }
  return false;
}
function lvRevealShow(i, title, sub, bg, o = {}) {
  const el = lvFull('reveal'); const conf = ['#ff8040', '#ffc14a', '#7fd17a', '#6fb7ff', '#ff8fa3'];
  el.innerHTML = `<div class="lv-rev" style="background:radial-gradient(circle at 50% 38%, ${bg}, #0d0a07 72%)"><svg class="burst" viewBox="0 0 100 100">${Array.from({length: 18}, (_, k) => { const a = k / 18 * Math.PI * 2; return `<path d="M50 50 L${(50 + 70 * Math.cos(a - .07)).toFixed(1)} ${(50 + 70 * Math.sin(a - .07)).toFixed(1)} L${(50 + 70 * Math.cos(a + .07)).toFixed(1)} ${(50 + 70 * Math.sin(a + .07)).toFixed(1)}Z" fill="#ffc14a" opacity=".3"/>`; }).join('')}</svg>
    <div class="bigbd">${LVW.badge(i, 190, o)}</div>${Array.from({length: 16}, (_, k) => `<span class="conf" style="left:${k * 6.2 + 2}%;background:${conf[k % 5]};animation-delay:-${(k * .4).toFixed(1)}s"></span>`).join('')}
    <div class="bot"><small>${o.kind || 'Naujas ženkliukas'}</small><h2>${esc(title)}</h2><p>${esc(sub)}</p><button class="btn primary big" data-a="freeRevealOk">Ačiū!</button></div></div>`;
}
A.freeRevealOk = () => { lvFull(null); commit(); };

// ===================== TURAS (pirmą kartą po pradžios klausimų) =====================
const LV_TOUR = [
  ['.lv-world', 'joy', 'Čia tavo kelias.', 'Kiekviena gera diena – žingsnis taku. Kraštai keičiasi, o ženkliukai laukia pakeliui.'],
  ['.lv-sheet .lv-chk', 'wink', 'Kasdien – vienas paspaudimas.', 'Pažymi, kaip sekėsi. Vakar dar gali pažymėti, jei pamiršai.'],
  ['.lv-sheet .lv-box', 'grin', 'Dienos dėžė.', 'Kartą per parą, kai pažymi dieną: XP, daiktai ir gyvūnai tavo pasauliui.'],
  ['.lv-rows', 'smile', '+1 – kai paslydai ar skaičiuoji.', 'Metant +1 reiškia naują pradžią, mažinant – skaičiuoja, kiek šiandien.'],
  ['.lv-sos', 'soft', 'Kai labai norisi – „Sunku?“', 'Pakvėpuosim, pasikalbėsim, prisiminsi, kodėl pradėjai.'],
  ['.lv-world .lv-ib', 'proud', 'Daugiau – čia.', 'Mano pasaulis, ženkliukai, kraštai ir valdiklis telefono ekrane. Čia gali ir paslėpti Laisvę – vėl parodysi Nustatymuose arba ilgai paspaudęs Savijautą.'],
  ['.lv-world .lv-ib', 'wink', 'Valdiklis telefono ekrane.', 'Takas ir +1 pagrindiniame ekrane – užsirašai neatidaręs programėlės. Įjungti ar išjungti: ⋯ → Valdiklis ekrane. Nuimti iš ekrano – ilgai paspausk valdiklį.', 'w'],
  [null, 'joy', 'Na, ką – pradedam?', 'Visada galėsi sustoti ar paslėpti Laisvę.']];
function freeTourShow() {
  let i = UI.lvTour ?? 0; while (LV_TOUR[i]?.[4] === 'w' && !LSW()) i = UI.lvTour = i + 1;   // valdiklio žingsnis – tik Android programėlėje
  const st = LV_TOUR[i]; if (!st) return freeTourEnd();
  let el = document.querySelector('.lv-tour'); if (!el) { el = document.createElement('div'); el.className = 'lv-tour'; document.body.appendChild(el); }
  const t = st[0] && document.querySelector(st[0]);
  if (t) t.scrollIntoView({block: t.getBoundingClientRect().height > innerHeight * .5 ? 'start' : 'center'});
  requestAnimationFrame(() => {
    const r0 = t?.getBoundingClientRect(), H = innerHeight, r = r0 && {left: r0.left, width: r0.width, top: Math.max(8, r0.top), height: Math.min(r0.height, H * .5)}; if (r) r.bottom = r.top + r.height;
    const below = r ? r.top + r.height / 2 < H / 2 : false, last = i === LV_TOUR.length - 1;
    el.innerHTML = `${r ? `<div class="spot" style="left:${r.left - 8}px;top:${r.top - 8}px;width:${r.width + 16}px;height:${r.height + 16}px"></div>` : '<div class="tgrad"></div>'}
      <div class="tbox ${r ? (below ? 'down' : 'up') : 'mid'}" style="${r ? (below ? `top:${Math.min(H - 260, r.bottom + 18)}px` : `bottom:${Math.min(H - 260, H - r.top + 18)}px`) : ''}"><div class="dgw">${daigelis(5)}</div><div class="talk"><b>${st[2]}</b><small>${st[3]}</small></div>
      <div class="tnav"><div class="dots">${LV_TOUR.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>${last ? (UI.lvDemo ? '<button class="skp" data-a="freeDemoEnd" data-v="0">Ne dabar</button>' : '') : `<button class="skp" data-a="${UI.lvDemo ? 'freeDemoEnd' : 'freeTourEnd'}" data-v="1">Praleisti</button>`}<button class="nx" data-a="${last && UI.lvDemo ? 'freeDemoEnd' : 'freeTourNext'}" data-v="1">${last ? 'Pradėti' : 'Toliau'}</button></div></div>`;
  });
}
A.freeTourNext = () => { UI.lvTour = (UI.lvTour ?? 0) + 1; if (UI.lvTour >= LV_TOUR.length) return freeTourEnd(); freeTourShow(); };
function freeTourEnd() { if (UI.lvDemo) return A.freeDemoEnd({v: 1}); document.querySelector('.lv-tour')?.remove(); UI.lvTour = null; freeW().tour = 1; window.scrollTo(0, 0); commit(); }
A.freeTourEnd = () => freeTourEnd();
A.freeTourAgain = () => { A.closeSheet(); UI.lvTour = 0; window.scrollTo(0, 0); setTimeout(freeTourShow, 300); };
window.addEventListener('resize', () => { if (document.querySelector('.lv-tour')) freeTourShow(); });

// ===================== BALSO ŽINUTĖ IR NUOTRAUKA SAU (tik šiame įrenginyje, IndexedDB) =====================
const lvDB = () => new Promise((ok, no) => { try { const r = indexedDB.open('ls-laisve', 1); r.onupgradeneeded = () => r.result.createObjectStore('media'); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); } catch (e) { no(e); } });
const lvGet = async k => { try { const db = await lvDB(); return await new Promise(ok => { const q = db.transaction('media').objectStore('media').get(k); q.onsuccess = () => ok(q.result || null); q.onerror = () => ok(null); }); } catch (e) { return null; } };
const lvPut = async (k, v) => { const db = await lvDB(); await new Promise((ok, no) => { const tx = db.transaction('media', 'readwrite'); v == null ? tx.objectStore('media').delete(k) : tx.objectStore('media').put(v, k); tx.oncomplete = ok; tx.onerror = () => no(tx.error); }); };
let LV_REC = null, LV_AUD = null;
async function freeWhyMedia() {
  const box = document.querySelector('.lv-media'); if (!box) return;
  const [ph, vo] = await Promise.all([lvGet('photo'), lvGet('voice')]); if (!document.querySelector('.lv-media')) return;
  if (UI.lvPhotoUrl) URL.revokeObjectURL(UI.lvPhotoUrl); UI.lvPhotoUrl = ph ? URL.createObjectURL(ph.blob) : null;
  const rec = !!LV_REC, sec = vo ? Math.round(vo.sec || 0) : 0;
  box.innerHTML = `${ph ? `<div class="photo"><img src="${UI.lvPhotoUrl}" alt="Tavo nuotrauka"><button class="x2" data-a="freePhotoDel" aria-label="Ištrinti nuotrauką">${ic('trash', 'sm')}</button></div>` : `<label class="addm">${ic('plus', 'sm')}<span><b>Nuotrauka</b><small>žmogus, vieta ar daiktas – nebūtina</small></span><input type="file" accept="image/*" data-c="freePhoto" hidden></label>`}
    ${rec ? `<button class="voice rec" data-a="freeRecStop"><span class="pl2">${ic('stop')}</span><span class="wv2">${Array.from({length: 26}, (_, i) => `<i style="height:${30 + 60 * Math.abs(Math.sin(i * 1.7))}%;animation-delay:-${(i * .09).toFixed(2)}s"></i>`).join('')}</span><b class="rt">Įrašau…</b></button>`
      : vo ? `<div class="voice"><button class="pl2" data-a="freeVoicePlay" aria-label="Klausyti">${ic('play')}</button><span class="wv2">${Array.from({length: 26}, (_, i) => `<i style="height:${30 + 60 * Math.abs(Math.sin(i * 1.7))}%"></i>`).join('')}</span><b>Tu, ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}</b><button class="x2" data-a="freeVoiceDel" aria-label="Ištrinti įrašą">${ic('trash', 'sm')}</button></div>`
      : `<button class="addm" data-a="freeRecStart">${ic('mic')}<span><b>Žinutė sau</b><small>įrašyk balsu – išgirsi, kai bus sunku</small></span></button>`}`;
}
A.freeRecStart = async () => {
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return toast('Šiame įrenginyje įrašyti nepavyksta');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({audio: true}), mime = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg'].find(t => MediaRecorder.isTypeSupported?.(t)) || '';
    const r = new MediaRecorder(stream, mime ? {mimeType: mime} : undefined), chunks = [], t0 = Date.now();
    r.ondataavailable = e => e.data.size && chunks.push(e.data);
    r.onstop = async () => { stream.getTracks().forEach(t => t.stop()); clearTimeout(LV_REC?.lim); LV_REC = null; const blob = new Blob(chunks, {type: r.mimeType || mime || 'audio/webm'});
      if (blob.size > 1000) { await lvPut('voice', {blob, sec: (Date.now() - t0) / 1000, at: Date.now()}).catch(() => toast('Nepavyko išsaugoti')); toast('Žinutė sau išsaugota', 'good'); } freeWhyMedia(); };
    r.start(); LV_REC = {r, lim: setTimeout(() => { if (r.state === 'recording') r.stop(); }, 60000)}; freeWhyMedia();
  } catch (e) { toast('Leisk naudoti mikrofoną, kad galėtum įrašyti'); }
};
A.freeRecStop = () => { if (LV_REC?.r?.state === 'recording') LV_REC.r.stop(); };
A.freeVoicePlay = async () => { const v = await lvGet('voice'); if (!v) return; try { LV_AUD?.pause(); LV_AUD = new Audio(URL.createObjectURL(v.blob)); await LV_AUD.play(); } catch (e) { toast('Nepavyko paleisti'); } };
A.freeVoiceDel = async () => { if (!await ask('Ištrinti žinutę sau?', '', {danger: true, yes: 'Ištrinti'})) return; LV_AUD?.pause(); await lvPut('voice', null); freeWhyMedia(); };
A.freePhotoDel = async () => { if (!await ask('Ištrinti nuotrauką?', '', {danger: true, yes: 'Ištrinti'})) return; await lvPut('photo', null); freeWhyMedia(); };
document.addEventListener('change', async e => { if (e.target.dataset?.c !== 'freePhoto') return; const f = e.target.files?.[0]; if (!f) return;
  try { const img = await createImageBitmap(f), k = Math.min(1, 1280 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    const blob = await new Promise(ok => c.toBlob(ok, 'image/jpeg', .85)); await lvPut('photo', {blob, at: Date.now()}); freeWhyMedia(); } catch (err) { toast('Nepavyko įkelti nuotraukos'); } });
if (typeof ICONS !== 'undefined' && !ICONS.mic) ICONS.mic = '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>';
if (typeof ICONS !== 'undefined' && !ICONS.trash) ICONS.trash = '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>';

// ===================== PROGRESAS, PINIGAI, KŪNAS, ŽINIOS, SKANĖSTŲ DIENA, VAKARĖLIS =====================
// Šaltiniai patikrinti 2026-11-20 (docs/laisve-technika.md 15). Neaišku ar nepatvirtinta – nerašom.
const BODY_TL = {
  tob: ['Tabakas ir nikotinas', [[1 / 72, '20 min', 'Pulsas ir kraujospūdis mažėja'], [.5, '12 val.', 'Anglies monoksido kraujyje – kaip nerūkančio'], [14, '2 sav. – 3 mėn.', 'Gerėja kraujotaka ir plaučių veikla'], [30, '1–9 mėn.', 'Mažiau kosulio ir dusulio'], [365, '1 metai', 'Širdies ligų rizika perpus mažesnė'], [3650, '10 metų', 'Plaučių vėžio rizika maždaug perpus mažesnė']], 'Amerikos plaučių asociacija'],
  nic: ['Nikotino norai', [[1, '1–3 dienos', 'Sunkiausia – norai stipriausi'], [7, '1 savaitė', 'Norai pamažu silpnėja'], [14, '2–4 savaitės', 'Dauguma simptomų praeina'], [30, 'Po mėnesio', 'Norai reti ir trumpi']], 'Smokefree.gov (JAV nacionalinis vėžio institutas)'],
  alc: ['Alkoholis', [[1, '24 val.', 'Stabilizuojasi cukrus kraujyje'], [3, 'Pirmos dienos', 'Lengviau užmigti, geresnis miegas'], [30, '1 mėnuo', 'Žemesnis kraujospūdis, daugiau energijos'], [365, 'Ilgainiui', 'Mažesnė kepenų, širdies ligų ir kai kurių vėžio rūšių rizika']], 'Drinkaware, Alcohol Change UK'],
  caf: ['Energetiniai', [[.5, '12–24 val.', 'Gali pradėti skaudėti galvą'], [2, '1–2 dienos', 'Sunkiausia'], [9, '2–9 dienos', 'Simptomai praeina'], [30, 'Toliau', 'Tolygesnė energija, geresnis miegas']], 'Cleveland Clinic'] };
const BODY_OF = {cig: ['tob', 'nic'], vape: ['nic'], pouch: ['nic'], heat: ['tob', 'nic'], chew: ['nic'], hookah: ['tob', 'nic'], alc: ['alc'], energy: ['caf']};
const KNOW = {
  cig: [['Mesti nuo datos', 'pasirenki dieną ir ruošiesi'], ['Mažinti pamažu', 'kas savaitę mažiau'], ['Su pleistru ar guma', 'pasitark su vaistininku ar 1819']],
  vape: [['Mažinti įtraukimus', 'planas kas savaitę'], ['Silpnesnis skystis', 'pvz. 20 → 10 → 3 mg/ml'], ['Mesti nuo datos', '']],
  pouch: [['Silpnesni', 'pvz. 6 → 3 mg'], ['Po truputį mažiau', 'kas savaitę'], ['Be nikotino', 'įprotis lieka, nikotinas – ne']],
  heat: [['Mesti nuo datos', ''], ['Mažinti lazdeles', 'kas savaitę'], ['Su pleistru ar guma', 'pasitark su vaistininku']],
  chew: [['Mažinti porcijas', ''], ['Mesti nuo datos', ''], ['Pakaitalas burnai', 'guma be cukraus']],
  hookah: [['Rečiau', 'kartai per savaitę'], ['Trumpiau', 'minutės'], ['Mesti', '']],
  alc: [['Dienos be', 'pvz. 4 per savaitę'], ['Savaitės riba', 'pvz. ≤ 7 vnt.'], ['Mesti', 'jei geri daug – su gydytoju']],
  energy: [['Po vieną mažiau', 'kas kelias dienas'], ['Silpnesni', 'mažiau kofeino'], ['Mesti', '']],
  fast: [['Rečiau', 'kartai per savaitę'], ['Ne namuose', 'nelaikyti namie'], ['Pakeisti', 'gaminti pačiam']], other: [['Mažinti', ''], ['Mesti nuo datos', ''], ['Stebėti', 'vien skaičiavimas padeda']]};
const TIPS = {
  cig: ['Pakeisk rytinę rutiną – pirma cigaretė dažnai „pririšta“ prie kavos', 'Išmesk cigaretes ir peleninę dar prieš dieną X', 'Daugiau vandens ir judesio'],
  vape: ['Laikyk įrenginį ne kišenėje', 'Palaikymo žinutės tikrai padeda (žr. faktą)', 'Vien skaičiavimas jau mažina'],
  pouch: ['Sunkiausios – pirmos dienos', 'Maišeliai be nikotino padeda su įpročiu', 'Dėl nikotino pakaitalų – pas gydytoją ar vaistininką'],
  heat: ['Tai vis tiek tabakas ir nikotinas', 'Skaičiuok lazdeles per dieną', 'Prisimink, kam taupai'],
  chew: ['Įprotis susijęs su vieta ir laiku – keisk juos', 'Sunkiausios pirmos dienos', 'Nemokama pagalba – 1819'],
  hookah: ['Dažnai traukia kompanija – pasiūlyk kitą veiklą', 'Vanduo kaljane žalingų medžiagų nepašalina', 'Skaičiuok ir minutes'],
  alc: ['Prieš vakarėlį nusistatyk ribą', 'Stiklinė vandens tarp gėrimų', 'Geri daug ir kasdien? Staiga nemesk – pasitark su gydytoju'],
  energy: ['Mažink palaipsniui – staigus metimas sukelia galvos skausmą', 'Daugiau vandens ir miego', 'Galvos skausmas dažniausiai praeina per 2–9 dienas'],
  fast: ['Mažiausiai norisi to, ko nėra namuose', 'Valgyk iš lėkštės, ne iš pakuotės', 'Suplanuota skanėstų diena – ne paslydimas'], other: ['Užsirašyk, kada norisi labiausiai', 'Pakeisk situaciją, kuri sukelia norą', 'Švęsk mažas pergales']};
// tikros istorijos ir faktai (su šaltiniu)
const STORIES = [
  ['cig', 's', 'Tiffany', 'Jos mama mirė nuo plaučių vėžio, kai Tiffany buvo 16. Ji metė rūkyti, kad būtų šalia savo dukros: pakeitė rytinę rutiną, išmetė cigaretes ir naudojo pleistrą.', 'CDC „Tips From Former Smokers“'],
  ['cig', 's', 'Roosevelt', '45-erių patyrė infarktą – prireikė šešių šuntų. Jis niekada negalvojo, kad tokio amžiaus rūkymas taip pakenks širdžiai. Dabar nerūko ir pasakoja savo istoriją, kad kiti spėtų anksčiau.', 'CDC „Tips From Former Smokers“'],
  ['vape', 'f', '24 % ir 19 %', 'Tyrime su 2 588 jaunais elektroninės vartotojais po 7 mėnesių metė 24 % gavusių palaikymo žinutes ir 19 % negavusių.', 'JAMA Internal Medicine, 2021'],
  ['pouch', 'f', '1–3 d.', 'Nikotino norai stipriausi pirmomis dienomis, o per kelias savaites dauguma simptomų praeina.', 'Smokefree.gov (JAV nacionalinis vėžio institutas)'],
  ['heat', 'f', 'FDA', 'JAV vaistų agentūra leido IQOS sakyti tik tiek, kad jis sumažina kai kurių medžiagų poveikį – bet ne kad jis mažiau kenksmingas.', 'FDA, 2020'],
  ['chew', 'f', '1819', 'Nemokama Metimo rūkyti linija – padeda metantiems bet kokį tabaką.', 'SAM'],
  ['hookah', 'f', '1 įtraukimas', 'Vienas kaljano įtraukimas gali prilygti beveik visos cigaretės dūmų kiekiui.', 'PSO tabako ekspertas, 2015'],
  ['alc', 'f', '71 %', 'Mėnuo be alkoholio: 71 % dalyvių geriau miegojo, 88 % sutaupė, daugelis ir po pusmečio gėrė mažiau.', 'Sussex universitetas (R. de Visser), 2018'],
  ['energy', 's', 'Vyras, 50+', 'Sveikas, aktyvus vyras išgerdavo apie 8 energetinius per dieną ir patyrė insultą. Juos metus, per kelias savaites kraujospūdis grįžo į normą ir vaistų nebereikėjo.', 'BMJ Case Reports, 2025']];
const freeStories = () => { const ks = freeData().subs.map(s => s.k), mine = STORIES.filter(x => ks.includes(x[0])); return mine.length ? mine : STORIES; };
const freeStoryToday = () => { const L = freeStories(); return L[Math.floor(Date.parse(today()) / 864e5) % L.length]; };
const storyHtml = s => s[1] === 's' ? `<div class="lv-story"><small>Tikra istorija · ${esc(freeSub(s[0])[0].toLowerCase())}</small><b>${esc(s[2])}</b><p>${esc(s[3])}</p><span class="src">${esc(s[4])}</span></div>` : `<div class="lv-story f"><small>Faktas · ${esc(freeSub(s[0])[0].toLowerCase())}</small><div><b>${esc(s[2])}</b><p>${esc(s[3])}</p></div><span class="src">${esc(s[4])}</span></div>`;

// ---- pinigai: kiek išleidi per dieną (€) × dienos be / mažiau ----
function freeSaved(s) {
  const per = +s.price || 0; if (!per) return 0; let sum = 0;
  for (let d = s.start; d <= today(); d = addDays(d, 1)) {
    if (s.mode === 'quit') { if (s.days[d] === 'ok') sum += per; }
    else if (+s.perDay) { const c = (s.counts || {})[d]; if (c != null || s.days[d] === 'ok') sum += per * Math.max(0, 1 - (c || 0) / s.perDay); }
  }
  return Math.round(sum * 100) / 100;
}
const freeSavedAll = () => Math.round(freeData().subs.reduce((a, s) => a + freeSaved(s), 0) * 100) / 100;
const eur = n => (Math.round(n * 100) / 100).toFixed(n >= 100 ? 0 : 2).replace('.', ',') + ' €';

// ---- ekranai: Progresas (pagal priklausomybę), Pinigai, Kūnas, Žinios ----
function freePage(kind) {
  const F = freeData(), P = UI.lvMp, sub = F.subs.find(s => s.id === P.sub) || F.subs[0];
  const head = t => `<div class="lv-mp lv-pg">${spBackLike(t)}`, pills = (a) => F.subs.length > 1 ? `<div class="apills">${F.subs.map(s => `<button class="${s === sub ? 'on' : ''}" data-a="freePgSub" data-k="${s.id}">${freeSub(s.k)[0]}</button>`).join('')}</div>` : '';
  if (kind === 'prog') {
    const pr = freeProg(sub), d = today(), days = Array.from({length: 14}, (_, i) => addDays(d, i - 13)), cnt = x => (sub.counts || {})[x] || 0, mx = Math.max(1, ...days.map(cnt), +sub.limit || 0);
    const first = Object.keys(sub.counts || {}).sort().slice(0, 7).map(x => sub.counts[x]), last = days.slice(-7).map(cnt), avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
    const chg = sub.mode !== 'quit' && first.length >= 3 && avg(first) ? Math.round((avg(last) / avg(first) - 1) * 100) : null;
    const bars = sub.mode === 'quit' ? `<div class="lv-bars q">${days.map(x => `<div class="${sub.days[x] === 'ok' ? 'ok' : sub.days[x] === 'slip' ? 'no' : ''}"><i></i><small>${parseD(x).getDate()}</small></div>`).join('')}</div>`
      : `<div class="lv-bars">${days.map(x => `<div class="${x === d ? 't' : ''}"><i style="height:${Math.round(cnt(x) / mx * 100)}%"></i><small>${parseD(x).getDate()}</small></div>`).join('')}${+sub.limit ? `<span class="lim" style="bottom:${Math.round(sub.limit / mx * 100)}%"></span>` : ''}</div>`;
    const body = (BODY_OF[sub.k] || [])[0];
    return `${head('Progresas')}${pills()}<div class="pgtop"><b>${chg != null ? (chg > 0 ? '+' : '−') + Math.abs(chg) + ' %' : fmtFree(pr.n)}</b><small>${chg != null ? 'per dieną nuo pradžios' : sub.mode === 'quit' ? 'be ' + freeSub(sub.k)[1] : FREE_MODES[sub.mode].toLowerCase()} · rekordas ${fmtFree(freeBest(sub))}</small></div>
      <div class="sec">${sub.mode === 'quit' ? 'Paskutinės 2 savaitės' : freeSub(sub.k)[3] + ' per dieną'}</div>${bars}
      ${body ? `<div class="sec">Kūnas atsistato</div>${bodyTl(body, pr.n, 3)}` : ''}
      ${(ins => ins.length ? `<div class="sec">Pastebėjimai</div>${ins.map(t => `<div class="lv-tip"><i>${ic('bulb', 'sm')}</i><span>${esc(t)}</span></div>`).join('')}` : '')(freeInsights(sub))}
      <div class="sec">Daugiau</div><div class="lv-hard">${[['freePgOpen', 'money', 'Pinigai', freeSavedAll() ? eur(freeSavedAll()) + ' sutaupyta' : 'įrašyk, kiek išleidi'], ['freePgOpen', 'body', 'Kūnas atsistato', 'kas vyksta dabar'], ['freeBadgesOpen', '', 'Ženkliukai ir XP', `${freeLevel().lv} lygis`], ['freePgOpen', 'know', 'Žinios', 'istorijos ir patarimai']].map(([a, k, t, s]) => `<button data-a="${a}" data-k="${k}"><span class="tx"><b>${t}</b><small>${s}</small></span>${ic('arrow', 'sm')}</button>`).join('')}</div></div>`;
  }
  if (kind === 'money') {
    const all = freeSavedAll(), G = F.goal || {}, perYear = F.subs.reduce((a, s) => a + (+s.price || 0) * (s.mode === 'quit' ? 365 : 0), 0), daysOn = Math.max(1, ...F.subs.map(s => diffDays(s.start, today()) + 1)), rate = all / daysOn;
    const left = G.sum ? Math.max(0, G.sum - all) : 0, eta = G.sum && rate > 0 ? addDays(today(), Math.ceil(left / rate)) : null;
    return `${head('Pinigai')}<div class="pgtop"><b>${eur(all)}</b><small>sutaupyta per ${fmtFree(daysOn)}</small></div>
      <div class="sec">Tikslas</div>${G.sum ? `<div class="lv-chk"><span class="tx"><b>${esc(G.name || 'Tikslas')} – ${eur(Math.min(all, G.sum))} iš ${eur(+G.sum)}</b><small>${left ? (eta ? 'pasieksi apie ' + fmtDate(eta) : 'kaupk toliau') : 'pasiekta!'}</small><div class="ln"><i style="width:${Math.min(100, all / G.sum * 100)}%"></i></div></span><button class="btn sm ghost" data-a="freeGoal">Keisti</button></div>` : `<button class="lv-box" data-a="freeGoal"><span class="tx"><b>Kam taupai?</b><small>dviratis, kelionė, dovana…</small></span><span class="go1">Nustatyti</span></button>`}
      ${perYear ? `<div class="sec">Per metus sutaupytum ${eur(perYear)}</div>` : ''}
      <div class="sec">Iš ko</div><div class="lv-hard">${F.subs.map(s => `<button data-a="freeEdit"><span class="tx"><b>${freeSub(s.k)[0]}</b><small>${+s.price ? eur(+s.price) + ' per dieną' : 'neįrašyta, kiek išleidi'}</small></span><b>${eur(freeSaved(s))}</b></button>`).join('')}</div>
      <p class="anote">Skaičiuojam iš to, kiek išleisdavai per dieną. Pakeisti – ⋯ → Ką keičiu.</p></div>`;
  }
  if (kind === 'body') {
    const keys = [...new Set(F.subs.flatMap(s => BODY_OF[s.k] || []))], k = P.body && keys.includes(P.body) ? P.body : keys[0];
    if (!k) return `${head('Kūnas atsistato')}<p class="anote">Šiai priklausomybei patikimo laiko juostos neturim.</p></div>`;
    const s = F.subs.find(x => (BODY_OF[x.k] || []).includes(k)), n = s ? freeProg(s).n : 0;
    return `${head('Kūnas atsistato')}${keys.length > 1 ? `<div class="apills">${keys.map(x => `<button class="${x === k ? 'on' : ''}" data-a="freePgBody" data-k="${x}">${BODY_TL[x][0]}</button>`).join('')}</div>` : ''}${bodyTl(k, n)}<span class="src">Šaltinis: ${BODY_TL[k][2]}</span><p class="anote">Tai bendri etapai, ne medicininis vertinimas. Kiekvieno kūnas skirtingas.</p></div>`;
  }
  // žinios
  const ks = F.subs.map(s => s.k), st = freeStoryToday();
  return `${head('Žinios')}<div class="sec">Šiandienos istorija</div>${storyHtml(st)}
    ${ks.map(k => `<div class="sec">${freeSub(k)[0]}</div><div class="lv-way">${(KNOW[k] || KNOW.other).map(([a, b]) => `<span><b>${a}</b>${b ? `<small>${b}</small>` : ''}</span>`).join('')}</div>${(TIPS[k] || TIPS.other).map((x, i) => `<div class="lv-tip"><i>${i + 1}</i><span>${esc(x)}</span></div>`).join('')}${STORIES.filter(x => x[0] === k && x !== st).map(storyHtml).join('')}`).join('')}</div>`;
}
function bodyTl(k, n, max) {
  const L = BODY_TL[k][1], cur = L.findIndex(x => n < x[0]), list = max ? L.slice(Math.max(0, cur - 1), Math.max(0, cur - 1) + max) : L;
  return `<div class="lv-tl">${list.map(x => { const i = L.indexOf(x), s = n >= x[0] ? 'ok' : i === cur ? 'now' : ''; return `<div class="${s}"><em>${x[1]}${s === 'now' ? ' · tu čia' : ''}</em><b>${x[2]}</b></div>`; }).join('')}</div>`;
}
A.freePgOpen = d => { A.closeSheet(); UI.lvMp = {tab: 'page', page: d.k || 'prog', sub: UI.lvMp?.sub}; render(); window.scrollTo(0, 0); };
A.freePgSub = d => { UI.lvMp.sub = d.k; render(); };
A.freePgBody = d => { UI.lvMp.body = d.k; render(); };
A.freeGoal = () => { const G = freeData().goal || {}; lvSheet(`<h3 style="margin-top:2px">Kam taupai?</h3><div class="lv-two" style="text-align:left"><label>Kas<input data-c="freeGoalN" value="${esc(G.name || '')}" placeholder="pvz. dviratis" maxlength="40"></label><label>Kiek (€)<input type="number" min="0" step="1" inputmode="decimal" data-c="freeGoalS" value="${G.sum || ''}"></label></div><button class="btn primary big" data-a="freeGoalSave">Išsaugoti</button>${G.sum ? '<button class="btn big t" data-a="freeGoalDel">Pašalinti tikslą</button>' : ''}`); };
A.freeGoalSave = () => { const n = $('[data-c=freeGoalN]')?.value.trim(), s = +$('[data-c=freeGoalS]')?.value; if (!s) return toast('Įrašyk sumą'); freeData().goal = {name: n || 'Tikslas', sum: s}; A.closeSheet(); commit(); };
A.freeGoalDel = () => { delete freeData().goal; A.closeSheet(); commit(); };

// ---- vakarėlis: planas iš anksto (ribos), tą dieną – skaičiai pagal planą, kitą rytą – rezultatas (+25 XP) ----
const PARTY_TIPS = ['Vanduo tarp gėrimų', 'Neisiu su rūkančiais', 'Grįšiu iki 1 val.', 'Pirmas gėrimas – be alkoholio', 'Valgysiu prieš'];
A.freeParty = () => { const F = freeData(), P = UI.lvParty = UI.lvParty || {...(F.party && F.party.d >= today() ? F.party : {d: addDays(today(), 1), lim: Object.fromEntries(F.subs.map(s => [s.id, s.mode === 'quit' ? 0 : +s.limit || 0])), tips: [0, 1]})}; freePartyDraw(); };
function freePartyDraw() {
  const F = freeData(), P = UI.lvParty, days = Array.from({length: 7}, (_, i) => addDays(today(), i)), dn = ['Sk', 'Pr', 'An', 'Tr', 'Kt', 'Pn', 'Št'];
  lvSheet(`<h3 style="margin-top:2px">Vakarėlis</h3><p class="lead">Susitarkim iš anksto – tada lengviau laikytis.</p>
    <div class="lv-wk">${days.map(d => `<button class="${P.d === d ? 'on' : ''}" data-a="freePartyDay" data-d="${d}">${dn[parseD(d).getDay()]}<small>${parseD(d).getDate()}</small></button>`).join('')}</div>
    <div class="lv-hard" style="margin-top:10px">${F.subs.map(s => s.mode === 'quit' ? `<div class="lv-lim"><span class="tx"><b>${freeSub(s.k)[0]}</b><small>meti – ir vakarėlyje 0</small></span><b class="v">0</b></div>` : `<div class="lv-lim"><span class="tx"><b>${freeSub(s.k)[0] + ' – ne daugiau'}</b><small>${freeSub(s.k)[3]}</small></span><button data-a="freePartyLim" data-k="${s.id}" data-n="-1" aria-label="Mažiau">−</button><b class="v">${P.lim[s.id] || 0}</b><button data-a="freePartyLim" data-k="${s.id}" data-n="1" aria-label="Daugiau">+</button></div>`).join('')}</div>
    <div class="sec" style="text-align:left;margin-top:12px;font:900 14px Nunito">Kai norėsis</div><div class="st-chips" style="justify-content:flex-start;margin-top:6px">${PARTY_TIPS.map((t, i) => `<button class="${P.tips.includes(i) ? 'on' : ''}" data-a="freePartyTip" data-i="${i}">${t}</button>`).join('')}</div>
    <button class="btn primary big" data-a="freePartySave">Išsaugoti planą</button>${F.party ? '<button class="btn big t" data-a="freePartyDel">Atšaukti vakarėlį</button>' : ''}`);
}
A.freePartyDay = d => { UI.lvParty.d = d.d; freePartyDraw(); };
A.freePartyLim = d => { const P = UI.lvParty; P.lim[d.k] = Math.max(0, Math.min(99, (P.lim[d.k] || 0) + +d.n)); freePartyDraw(); };
A.freePartyTip = d => { const P = UI.lvParty, i = +d.i; P.tips = P.tips.includes(i) ? P.tips.filter(x => x !== i) : [...P.tips, i]; freePartyDraw(); };
A.freePartySave = () => { freeData().party = {...UI.lvParty, done: 0}; UI.lvParty = null; A.closeSheet(); commit(); toast('Planas išsaugotas', 'good'); };
A.freePartyDel = () => { delete freeData().party; UI.lvParty = null; A.closeSheet(); commit(); };
const partyOn = (d = today()) => { const p = freeData().party; return p && p.d === d ? p : null; };
// kitą rytą – kaip sekėsi
function freePartyAfter() {
  const F = freeData(), p = F.party; if (!p || p.done || p.d >= today()) return false;
  const res = F.subs.filter(s => !(s.k === 'fast' && treatOn(p.d))).map(s => { const c = (s.counts || {})[p.d] || 0, lim = p.lim[s.id] || 0, slip = s.days[p.d] === 'slip'; return {s, c, lim, ok: s.mode === 'quit' ? !slip : !slip && c <= lim}; }), all = res.every(r => r.ok);
  p.done = 1; if (all) F.xp = (F.xp || 0) + 25;
  lvSheet(`<div class="chestw open r-${all ? 'l' : 'c'}"><i class="rays"></i><span class="won solo">${daigelis(5)}</span></div><h3>${all ? 'Vakarėlis pagal planą!' : 'Vakarėlis praėjo'}</h3><p class="lead">${res.map(r => r.s.mode === 'quit' ? `${freeSub(r.s.k)[0]}: ${r.ok ? 'be' : 'paslydai'}` : `${freeSub(r.s.k)[0]}: ${r.c} iš ${r.lim}`).join(' · ')}</p><p class="lead">${all ? '+25 XP – susitarei ir laikeisi.' : 'Kai kur daugiau nei planavai – nieko tokio. Kitą kartą bus lengviau.'}</p><button class="btn primary big" data-a="closeSheet">Ačiū</button>`);
  return true;
}

// ---- skanėstų diena (greitam maistui): suplanuota ≠ paslydimas ----
const TREAT_ALT = {Saldaus: [['Tikras šokoladas – 4 kubeliai', 'ne visa plytelė'], ['Ledų kaušelis su uogom', 'mažame indelyje'], ['Blyneliai su varške', 'pasidaryk pats']], Sūraus: [['Saujelė riešutų', 'į dubenėlį, ne iš pakelio'], ['Traškučiai iš krosnies', 'pasidaryk pats'], ['Sūris su vynuogėmis', '']],
  'Picos ar burgerio': [['Pica namie', 'daug daržovių, plonas padas'], ['Burgeris namie', 'su salotomis'], ['Viena porcija', 'be papildomo „dideliu“']], Gazuotų: [['Gazuotas vanduo su citrina', ''], ['Mažas skardinės dydis', ''], ['Be cukraus', '']], Užkandžių: [['Popkornai', 'be sviesto'], ['Vaisiai ir jogurtas', ''], ['Daržovės su padažu', '']]};
const treatOn = (d = today()) => (freeData().treat?.d === d) ? freeData().treat : null;
A.freeTreat = () => { const F = freeData(); UI.lvTreat = UI.lvTreat || {...(F.treat && F.treat.d >= today() ? F.treat : {d: addDays(today(), 1), want: 'Saldaus'})}; freeTreatDraw(); };
function freeTreatDraw() {
  const T = UI.lvTreat, F = freeData(), days = Array.from({length: 7}, (_, i) => addDays(today(), i)), dn = ['Sk', 'Pr', 'An', 'Tr', 'Kt', 'Pn', 'Št'];
  lvSheet(`<h3 style="margin-top:2px">Skanėstų diena</h3><p class="lead">Suplanuota – be kaltės, serija nenutrūksta.</p><div class="lv-wk">${days.map(d => `<button class="${T.d === d ? 'on' : ''}" data-a="freeTreatDay" data-d="${d}">${dn[parseD(d).getDay()]}<small>${parseD(d).getDate()}</small></button>`).join('')}</div>
    <div class="st-chips" style="justify-content:flex-start;margin-top:10px">${Object.keys(TREAT_ALT).map(k => `<button class="${T.want === k ? 'on' : ''}" data-a="freeTreatWant" data-k="${k}">${k}</button>`).join('')}</div>
    <div class="lv-hard" style="margin-top:10px">${TREAT_ALT[T.want].map(([a, b]) => `<div class="lv-lim"><span class="tx"><b>${a}</b>${b ? `<small>${b}</small>` : ''}</span></div>`).join('')}</div>
    <p class="lead" style="margin-top:10px">Valgyk iš lėkštės, ne iš pakuotės – taip lengviau sustoti.</p><button class="btn primary big" data-a="freeTreatSave">Suplanuoti</button>${F.treat ? '<button class="btn big t" data-a="freeTreatDel">Atšaukti</button>' : ''}`);
}
A.freeTreatDay = d => { UI.lvTreat.d = d.d; freeTreatDraw(); };
A.freeTreatWant = d => { UI.lvTreat.want = d.k; freeTreatDraw(); };
A.freeTreatSave = () => { freeData().treat = {...UI.lvTreat, done: 0}; UI.lvTreat = null; A.closeSheet(); commit(); toast('Skanėstų diena suplanuota', 'good'); };
A.freeTreatDel = () => { delete freeData().treat; UI.lvTreat = null; A.closeSheet(); commit(); };
function freeTreatAfter() {
  const F = freeData(), t = F.treat; if (!t || t.done || t.d >= today()) return false;
  lvSheet(`<h3 style="margin-top:2px">Kaip sekėsi vakar?</h3><p class="lead">Skanėstų diena · ${esc(t.want || '')}</p><button class="btn primary big" data-a="freeTreatRes" data-v="1">Pagal planą · +15 XP</button><button class="btn big t" data-a="freeTreatRes" data-v="0">Daugiau nei planavau</button><p class="lead" style="font-size:13px">Bet kuriuo atveju – serija lieka.</p>`);
  return true;
}
A.freeTreatRes = d => { const F = freeData(); if (F.treat) F.treat.done = 1; if (+d.v) F.xp = (F.xp || 0) + 15; A.closeSheet(); commit(); toast(+d.v ? 'Šaunu! +15 XP' : 'Nieko tokio – serija lieka', 'good'); };

// skirtukų eilė po pasauliu: Progresas · Žinios · Vakarėlis · Skanėstų diena
function freeTiles() {
  const F = freeData(), p = F.party && F.party.d >= today() ? F.party : null, t = F.treat && F.treat.d >= today() ? F.treat : null, fast = F.subs.some(s => s.k === 'fast');
  const pt = p ? (p.d === today() ? 'šiandien' : relDay(p.d)) : 'planas iš anksto', tt = t ? (t.d === today() ? 'šiandien!' : relDay(t.d)) : 'be kaltės';
  return `<div class="lv-tiles"><button data-a="freePgOpen" data-k="prog"><b>Progresas</b><small>${freeSavedAll() ? eur(freeSavedAll()) + ' sutaupyta' : 'grafikai ir kūnas'}</small></button><button data-a="freePgOpen" data-k="know"><b>Žinios</b><small>istorija šiandien</small></button>
    <button data-a="freeParty" class="${p?.d === today() ? 'on' : ''}"><b>Vakarėlis</b><small>${pt}</small></button>${fast ? `<button data-a="freeTreat" class="${t?.d === today() ? 'on' : ''}"><b>Skanėstų diena</b><small>${tt}</small></button>` : ''}</div>`;
}

// ---- „Kas nutiko?“ po paslydimo (nebūtina) – vėliau padės Pastebėjimuose ----
const WHAT = ['Stresas', 'Alkoholis', 'Draugai', 'Nuobodulys', 'Po valgio', 'Nežinau'];
function freeWhat() { const W = UI.lvWhat; lvSheet(`<h3 style="margin-top:2px">Kas nutiko?</h3><p class="lead">Nebūtina. Padės pastebėti, kada sunkiausia.</p><div class="st-chips" style="justify-content:center">${WHAT.map(x => `<button data-a="freeWhatPick" data-v="${x}">${x}</button>`).join('')}</div><button class="btn big t" data-a="freeWhatPick" data-v="">Praleisti</button>`); }
A.freeWhatPick = d => { const W = UI.lvWhat; UI.lvWhat = null; if (W && d.v) for (const s of freeData().subs.filter(s => W.ids.includes(s.id))) s.what = {...(s.what || {}), [W.d]: d.v}; A.closeSheet(); commit(); };
// ---- Laisvas režimas po metų (Mesti): žymi kartą per savaitę, paslydimas nebenuneša į pradžią ----
function freeYearOffer() {
  const w = freeW(), s = freeData().subs.find(s => s.mode === 'quit' && !s.free && freeProg(s).n >= 365 && !w.seen['year' + s.id]); if (!s) return false;
  w.seen['year' + s.id] = 1;
  lvSheet(`<div class="chestw open r-l"><i class="rays"></i><span class="won solo">${LVW.badge(7, 110)}</span></div><h3>Metai laisvės!</h3><p class="lead">Toliau gali eiti laisvu režimu: žymėsi kartą per savaitę, o paslydimą užrašysi – bet jis nebenuneš į pradžią.</p><button class="btn primary big" data-a="freeFreeMode" data-k="${s.id}">Laisvas režimas</button><button class="btn big t" data-a="closeSheet">Liekam kaip yra</button>`);
  return true;
}
A.freeFreeMode = d => { const s = freeData().subs.find(x => x.id === d.k); if (s) { s.free = today(); s.wk = today(); } A.closeSheet(); commit(); toast('Laisvas režimas įjungtas', 'good'); };
A.freeWeekMark = d => { const s = freeData().subs.find(x => x.id === d.k); if (!s) return; s.wk = today(); if (!+d.v) s.days[addDays(today(), -1)] = 'slip'; else freeData().xp = (freeData().xp || 0) + 10; commit(); };

// ---- pastebėjimai (tik kai užtenka duomenų) ----
function freeInsights(sub) {
  const out = [], dn = ['sekmadieniais', 'pirmadieniais', 'antradieniais', 'trečiadieniais', 'ketvirtadieniais', 'penktadieniais', 'šeštadieniais'];
  const what = Object.values(sub.what || {}); if (what.length >= 3) { const c = {}; what.forEach(x => c[x] = (c[x] || 0) + 1); const [k, n] = Object.entries(c).sort((a, b) => b[1] - a[1])[0]; if (n >= 2) out.push(`Dažniausiai paslysti, kai ${{Stresas: 'stresas', Alkoholis: 'išgeri', Draugai: 'su draugais', Nuobodulys: 'nuobodu', 'Po valgio': 'pavalgai', 'Nežinau': 'nežinai kodėl'}[k] || k.toLowerCase()} (${n} iš ${what.length}).`); }
  const byDay = Array(7).fill(0), seen = Array(7).fill(0);
  for (const [d, c] of Object.entries(sub.counts || {})) { const w = parseD(d).getDay(); byDay[w] += c; seen[w]++; }
  for (const [d, v] of Object.entries(sub.days)) if (v === 'slip' || v === 'over') { const w = parseD(d).getDay(); byDay[w] += sub.mode === 'quit' ? 1 : 0; if (sub.mode === 'quit') seen[w]++; }
  const avg = byDay.map((x, i) => seen[i] ? x / seen[i] : 0), tot = seen.reduce((a, b) => a + b, 0);
  if (tot >= 10) { const mx = Math.max(...avg), i = avg.indexOf(mx), rest = avg.filter((_, k) => k !== i && seen[k]), ra = rest.length ? rest.reduce((a, b) => a + b, 0) / rest.length : 0; if (mx > 0 && mx >= ra * 1.3) out.push(sub.mode === 'quit' ? `Sunkiausia ${dn[i]}.` : `Daugiausia ${dn[i]} – vidutiniškai ${Math.round(mx * 10) / 10} per dieną.`); }
  const held = freeData().held || 0; if (held >= 5) out.push(`Jau ${held} kartus atlaikei norą – tai ir yra tavo stiprybė.`);
  return out;
}
A.freeWidgetToggle = () => { const F = freeData(); F.widgetOff = !F.widgetOff; commit({noRender: true}); freeWidgetSync(false); A.freeWidget(); toast(F.widgetOff ? 'Valdiklis išjungtas' : 'Valdiklis įjungtas'); };
A.freeUnhide = () => { freeData().hidden = false; commit(); A.go({v: 'free'}); };

// ===================== PAŽINTIS: kas tai → Kam tai? → turas ant pavyzdinio pasaulio → klausimai =====================
function freeIntro() {
  const M = $('#main'), cs = M && getComputedStyle(M), W = Math.min(620, M ? M.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) : 343), h = new Date().getHours();
  const o = {W, h: Math.min(420, Math.max(260, innerHeight - 540)), cut: false, bio: 0, look: 0, season: freeSeason(), tod: h >= 18 || h < 5 ? 'evening' : 'day', t: .14, ex: 'grin', say: 'Labas! Einam kartu?', sayDir: 'l', pins: [[.42, 'dot', '', '', 2], [.72, 'dot', '', '', 4]], things: [], pets: [], noRefill: 1};
  return `<div class="lvw lv-page lv-intro"><div class="lv-world" data-key="intro-${W}">${LVW.world(o)}</div>
    <div class="lv-introb"><h2>Laisvė</h2><p>Vieta, kur pamažu atsikratai to, kas tave valdo – cigarečių, elektroninės, alkoholio ar ko kito. Kiekviena gera diena – žingsnis tavo take.</p>
    <button class="btn primary big" data-a="freeIntroWhy">Pradėti</button><button class="btn big t" data-a="freeIntroWhy">Kokia nauda?</button></div></div>`;
}
A.freeIntroWhy = () => lvSheet(`<h3 style="margin-top:2px">Kam tai?</h3><p class="lead">Kad mesti ar mažinti būtų lengviau – ir nebūtum vienas.</p>
  <div class="st-chips" style="justify-content:center;margin:6px 0 10px">${Object.values(FREE_SUBS).filter(x => x[0] !== 'Kita').map(x => `<span class="lv-pill">${x[0]}</span>`).join('')}</div>
  <div class="lv-hard">${[['Prižiūri', 'kiek, kada ir kodėl – vienu paspaudimu'], ['Rodo, ką atgauni', 'pinigus, sveikatą, laiką'], ['Padeda, kai sunku', 'Daigelis tas minutes praleidžia su tavim']].map(([a, b]) => `<div class="lv-lim"><span class="tx"><b>${a}</b><small>${b}</small></span></div>`).join('')}</div>
  <button class="btn primary big" data-a="freeDemo">Parodyk, kaip veikia</button><button class="btn big t" data-a="freeDemoEnd" data-v="1">Praleisti – iškart pradėti</button>`);
A.freeDemo = () => {
  A.closeSheet(); const t = today(), days = {}; for (let i = 12; i >= 1; i--) days[addDays(t, -i)] = 'ok';
  UI.lvDemo = {on: true, demo: 1, subs: [{id: 'demo', k: 'cig', start: addDays(t, -12), days, counts: {}, mode: 'quit'}], xp: 140, why: '', seen: [],
    w: {items: {bench: {at: 'demo.0.0', x: .2, y: .62}, lamp: {at: 'demo.0.0', x: .86, y: .56}, ruda: {at: 'demo.0.0', x: .7, y: .86}}, lands: {}, seen: {}, tour: 1, day: 0, pity: 0, ts: 0, food: 0, drink: 0, ms: {demo: 3}, sb: {}, best: {}}};
  UI.lvTour = 0; render(); window.scrollTo(0, 0); setTimeout(freeTourShow, 500);
};
A.freeDemoEnd = d => { document.querySelector('.lv-tour')?.remove(); UI.lvTour = null; UI.lvDemo = null; A.closeSheet(); if (+d.v) UI.lvOb = {step: 1, sel: []}; render(); window.scrollTo(0, 0); };

// vienkartinis savininko Laisvės nunulinimas (bandymų duomenys), 2026-11-20 – kode tik el. pašto maiša
async function freeOwnerReset() {
  try { if (S.freeReset1 || UI.lvDemo) return; const em = (DB.email() || '').trim().toLowerCase(); if (!em) return;
    const h = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(em)))].map(b => b.toString(16).padStart(2, '0')).join('');
    if (h !== '5aadc00233f2297a306caf4f3bf059818ef6d5d5bc840722280c9ff5871e444c') return;
    delete S.free; S.freeReset1 = 1; LV_KEEP = null; commit({noRender: true}); toast('Laisvė nunulinta – pradedam iš naujo');
  } catch (e) {}
}
A.freeTrackNone = d => { const s = freeData().subs.find(x => x.id === d.k); if (!s) return; s.counts = s.counts || {}; if (s.counts[today()] == null) { s.counts[today()] = 0; freeData().xp = (freeData().xp || 0) + 10; toast(freeLine(true), 'good'); } commit(); };
// jei pasaulis buvo nupieštas, kai programa buvo fone (naršyklė tada stabdo kadrus), grįžus – išdėstom ženkliukus ir burbulą iš naujo
document.addEventListener('visibilitychange', () => { if (document.hidden || !window.LVW) return; const b = document.querySelector('.lv-page .lv-world'); if (b) { LVW.placeWorld(b); freeUnstack(b); } });
