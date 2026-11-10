// ===== Pagalbinės funkcijos, būsena, sinchronizacija, skaičiavimai, grafikai =====
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pad = n => String(n).padStart(2, '0');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const round = (v, d = 0) => { const m = 10 ** d; return Math.round(v * m) / m; };
const sum = a => a.reduce((x, y) => x + (+y || 0), 0);
const pick = (arr, seed) => arr[Math.abs(seed ?? Math.floor(Math.random() * 1e6)) % arr.length];
const fill = (t, x) => t.replace('{x}', x);

// Datos (vietinis laikas, formatas YYYY-MM-DD)
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseD = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
// Laiko juosta: programėlė skaičiuoja „dabar“ pagal pasirinktą zoną, todėl VPN ar naršyklės plėtiniai laiko nepakeičia
const deviceTZ = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return ''; } };
const appTZ = () => (S && S.settings && S.settings.tz) || deviceTZ();
let _tzFmt = null, _tzName = null;
function zonedParts(t = Date.now()) {
  const tz = appTZ();
  try {
    if (_tzName !== tz) { _tzFmt = new Intl.DateTimeFormat('en-CA', {timeZone: tz || undefined, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'}); _tzName = tz; }
    const o = {}; for (const x of _tzFmt.formatToParts(new Date(t))) o[x.type] = x.value;
    return {date: `${o.year}-${o.month}-${o.day}`, min: (+o.hour % 24) * 60 + +o.minute};
  } catch (e) { const d = new Date(t); return {date: ymd(d), min: d.getHours() * 60 + d.getMinutes()}; }
}
const today = () => zonedParts().date;
const addDays = (s, n) => { const d = parseD(s); d.setDate(d.getDate() + n); return ymd(d); };
const dow = s => ((parseD(s).getDay() + 6) % 7) + 1; // 1=Pr ... 7=Sk
const weekStart = s => addDays(s, 1 - dow(s));
const monthStart = s => s.slice(0, 8) + '01';
const daysInMonth = s => { const d = parseD(s); return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); };
const diffDays = (a, b) => Math.round((parseD(b) - parseD(a)) / 864e5);
const range = (from, n) => Array.from({length: n}, (_, i) => addDays(from, i));
const toMin = t => { if (!t) return 0; const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); };
const fromMin = m => { m = Math.round(m); m = ((m % 1440) + 1440) % 1440; return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`; };
const nowMin = () => zonedParts().min;
const nowHM = () => fromMin(nowMin());
const fmtDur = m => { m = Math.round(m); if (m < 60) return `${m} min`; const h = Math.floor(m / 60), r = m % 60; return r ? `${h} val ${r} min` : `${h} val`; };
const fmtH = m => `${round(m / 60, 1)} val`;
const DOW = ['Pr','An','Tr','Kt','Pn','Št','Sk'];
const DOW_LONG = ['Pirmadienis','Antradienis','Trečiadienis','Ketvirtadienis','Penktadienis','Šeštadienis','Sekmadienis'];
const MONTHS = ['sausis','vasaris','kovas','balandis','gegužė','birželis','liepa','rugpjūtis','rugsėjis','spalis','lapkritis','gruodis'];
const MONTHS_G = ['sausio','vasario','kovo','balandžio','gegužės','birželio','liepos','rugpjūčio','rugsėjo','spalio','lapkričio','gruodžio'];
const fmtDate = s => { const d = parseD(s); return `${MONTHS_G[d.getMonth()]} ${d.getDate()} d.`; };
const fmtDateDow = s => `${DOW_LONG[dow(s) - 1]}, ${fmtDate(s)}`;
const relDay = s => { const n = diffDays(today(), s); if (n === 0) return 'šiandien'; if (n === 1) return 'rytoj'; if (n === -1) return 'vakar'; if (n > 1 && n < 7) return `po ${n} d.`; if (n < 0) return `prieš ${-n} d.`; return fmtDate(s); };

// ===== Numatyti duomenys =====
const DEFAULT_CATS = [
  {id:'darbas', name:'Darbas', emoji:'💼', color:'#4f8cff', type:1},
  {id:'paskaitos', name:'Paskaitos', emoji:'🎓', color:'#8b6cff', type:1},
  {id:'mokslai', name:'Mokslai / namų darbai', emoji:'📚', color:'#a78bfa', type:1},
  {id:'sportas', name:'Sportas', emoji:'💪', color:'#22c55e', type:1},
  {id:'projektai', name:'Asmeniniai projektai', emoji:'🚀', color:'#06b6d4', type:1},
  {id:'gaminimas', name:'Gaminimas', emoji:'🍳', color:'#f97316', type:0},
  {id:'buitis', name:'Buitis / pirkiniai', emoji:'🧺', color:'#94a3b8', type:0},
  {id:'kelione', name:'Kelionė', emoji:'🚌', color:'#64748b', type:0},
  {id:'draugai', name:'Draugai / šeima', emoji:'🫶', color:'#ec4899', type:0},
  {id:'poilsis', name:'Poilsis', emoji:'🌿', color:'#10b981', type:0},
  {id:'hobiai', name:'Hobiai / laisvalaikis', emoji:'🎨', color:'#facc15', type:0},
  {id:'netflix', name:'Serialai / filmai', emoji:'📺', color:'#ef4444', type:-1},
  {id:'telefonas', name:'Telefonas / soc. tinklai', emoji:'📱', color:'#f43f5e', type:-1},
  {id:'zaidimai', name:'Žaidimai', emoji:'🎮', color:'#e11d48', type:-1},
];
const defaultData = () => ({
  ver: 1,
  profile: { name:'', sex:'m', birthYear:'', height:'', startWeight:'', targetWeight:'', activity:1.375, goalRate:0.5,
    wake:'07:30', bed:'23:30', sleepGoal:8, workoutMin:40, showerMin:20, travelMin:0, workoutsPerWeek:3,
    prodGoalH:6, screenLimitMin:90, budgetWeek:40, cookDay:7 },
  categories: DEFAULT_CATS.map(c => ({...c})),
  events: [], skips: {}, tasks: [], timelog: [], timer: null, sleep: [], weights: [],
  foods: [], recipes: BUILTIN_RECIPES.map(r => JSON.parse(JSON.stringify(r))),
  freezer: [], cooks: [], meals: [], workouts: [], checkins: [], notes: [], shopping: [], plan: [],
  plans: [], active: null, sportPrefs: {}, sportReviews: [],
  foodPrefs: {done: false, mealSuggest: false, cookTimes: 2, cookMax: 60, budget: 40, cookDays: [7], mealsPerDay: 3, skill: 2, equip: ['puodas', 'keptuvė', 'orkaitė', 'mikrobangė'], dislikes: [], allergies: [], dislikeText: ''},
  ratings: {}, priceOverrides: {}, priceMeta: {}, deletedRecipes: [], spend: [], mealPlans: [], receiptFoods: [],
  settings: { theme:'dark', tz: '', onboarded: false, modes: {sport: false, food: false}, review: 'week', dismissed: {}, intro: {} },
  reviews: [],
});
// Režimai: ką žmogus nori daryti su programėle
const sportOn = () => !!S?.settings?.modes?.sport;
const foodOn = () => !!S?.settings?.modes?.food;
// Veiklos, per kurias valgyti galima tik pasiėmus maistą su savimi (kitur – valgymą perkeliam prieš/po)
const PACK_CATS = ['darbas', 'paskaitos', 'mokslai', 'kelione', 'projektai'];

// ===== Būsena ir sinchronizacija su serveriu =====
let S = null, REV = 0, ONLINE = false, DIRTY = false, saveTimer = null, PUSHING = false;
const cloudOn = () => !!(window.CLOUD && CLOUD.url && CLOUD.key);
const lsKey = () => cloudOn() ? 'manogyv_cloud_' + (Auth.user()?.id || 'x') : 'manogyv_v1';

// ===== Kūrėjo režimas =====
// Rolė saugoma Supabase lentelėje user_roles (keisti gali tik projekto savininkas SQL redaktoriuje).
// Kūrėjo režime dirbama su atskira „smėlio dėže“: tikri duomenys lieka atmintyje, niekas nesiunčiama į debesį.
let ROLE = 'user', DEV = false, REAL = null;
const DEV_KEY = 'ls_dev_sandbox';
const isDeveloper = () => ROLE === 'developer';
async function loadRole() {
  if (!cloudOn()) { ROLE = window.CLOUD?.test ? 'developer' : 'user'; return; }
  try {
    const r = await fetch(`${CLOUD.url}/rest/v1/user_roles?select=role&user_id=eq.${Auth.user().id}`, {headers: {apikey: CLOUD.key, Authorization: 'Bearer ' + await Auth.token()}, cache: 'no-store'});
    ROLE = r.ok ? ((await r.json())[0]?.role || 'user') : 'user';
    localStorage.setItem('ls_role_' + Auth.user().id, ROLE);
  } catch (e) { ROLE = localStorage.getItem('ls_role_' + (Auth.user()?.id || '')) || 'user'; }
}
function storeLocal() {
  if (DEV) { try { sessionStorage.setItem(DEV_KEY, JSON.stringify(S)); } catch (e) {} return; }
  try { localStorage.setItem(lsKey(), JSON.stringify({S, REV, DIRTY})); } catch (e) {}
}
function migrate(d) {
  const def = defaultData();
  for (const k in def) if (d[k] === undefined) d[k] = def[k];
  d.profile = {...def.profile, ...d.profile};
  // seni naudotojai (jau turėjo profilį) – abu režimai įjungti, pirmo paleidimo vedlio nerodom
  const legacy = d.settings && d.settings.modes === undefined && d.profile && d.profile.height;
  d.settings = {...def.settings, ...d.settings};
  if (legacy) { d.settings.onboarded = true; d.settings.modes = {sport: true, food: true}; d.settings.tz = d.settings.tz || 'Europe/Vilnius'; }
  d.settings.modes = {...def.settings.modes, ...d.settings.modes};
  if (d.settings.review === '2w') d.settings.review = 'week';
  d.settings.dismissed = d.settings.dismissed || {}; d.settings.intro = d.settings.intro || {};
  // kategorijos: „Netflix / serialai“ → „Serialai / filmai“, pridedam „Hobiai“, nenaudojamą „Švedų kalba“ išimam
  const nf = d.categories.find(c => c.id === 'netflix'); if (nf && nf.name === 'Netflix / serialai') nf.name = 'Serialai / filmai';
  if (!d.categories.some(c => c.id === 'hobiai')) { const i = d.categories.findIndex(c => c.id === 'poilsis'); d.categories.splice(i < 0 ? d.categories.length : i + 1, 0, {...DEFAULT_CATS.find(c => c.id === 'hobiai')}); }
  const svUsed = (d.events || []).some(e => e.cat === 'svedu') || (d.timelog || []).some(t => t.cat === 'svedu') || (d.tasks || []).some(t => t.cat === 'svedu');
  if (!svUsed) d.categories = d.categories.filter(c => !(c.id === 'svedu' && c.name === 'Švedų kalba'));
  if (d.foodPrefs && !d.foodPrefs.done && d.profile.budgetWeek && d.foodPrefs.budget === def.foodPrefs.budget) d.foodPrefs.budget = +d.profile.budgetWeek;
  d.foodPrefs = {...def.foodPrefs, ...d.foodPrefs};
  // nauji įdėti receptai atsiranda ir seniems naudotojams; seniems užpildom lygį/techniką
  for (const b of BUILTIN_RECIPES) {
    const r = d.recipes.find(x => x.id === b.id);
    if (!r && !d.deletedRecipes.includes(b.id)) d.recipes.push(JSON.parse(JSON.stringify(b)));
    else if (r) { if (r.skill == null) r.skill = b.skill; if (!r.equip) r.equip = [...b.equip]; }
  }
  for (const r of d.recipes) { r.skill = r.skill || 1; r.equip = r.equip || []; r.tags = r.tags || []; }
  // mėsos patiekalams – ne žalios/mėlynos ikonos
  const EMO = {r_kalak_kotl: ['🧆', '🍖'], r_tingus_balandeliai: ['🥬', '🥘'], r_tuno_makaronai: ['🐠', '🍝']};
  for (const r of d.recipes) if (EMO[r.id] && r.emoji === EMO[r.id][0]) r.emoji = EMO[r.id][1];
  for (const f of d.freezer) { if (!f.place) f.place = 'freezer'; if (!f.until) f.until = addDays(f.date || today(), 90); }
  delete d.rev;
  return d;
}
async function api(method, path, body) {
  return fetch(path, {method, headers: {'Content-Type':'application/json'}, body: body ? JSON.stringify(body) : undefined, cache:'no-store'});
}

// ----- Prisijungimas (Supabase Auth per paprastą REST) -----
const Auth = {
  KEY: 'manogyv_auth',
  get() { try { return JSON.parse(localStorage.getItem(this.KEY)); } catch (e) { return null; } },
  user() { return this.get()?.user || null; },
  save(j) { localStorage.setItem(this.KEY, JSON.stringify({access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() + (j.expires_in || 3600) * 1000, user: {id: j.user.id, email: j.user.email}})); },
  logout() { localStorage.removeItem(this.KEY); },
  async call(path, body) {
    const r = await fetch(CLOUD.url + '/auth/v1/' + path, {method: 'POST', headers: {apikey: CLOUD.key, 'Content-Type': 'application/json'}, body: JSON.stringify(body)});
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error_description || j.msg || j.message || ('Klaida ' + r.status));
    return j;
  },
  async login(email, password) { const j = await this.call('token?grant_type=password', {email, password}); this.save(j); },
  async signup(email, password) { const j = await this.call('signup', {email, password}); if (j.access_token) { this.save(j); return true; } return false; },
  async token() {
    const s = this.get(); if (!s) throw new Error('nėra sesijos');
    if (s.expires_at - Date.now() > 60000) return s.access_token;
    try { const j = await this.call('token?grant_type=refresh_token', {refresh_token: s.refresh_token}); this.save(j); return j.access_token; }
    catch (e) { if (navigator.onLine) { this.logout(); location.reload(); } throw e; }
  },
};

// ----- Saugyklos: vietinis serveris arba debesis -----
const LocalBK = {
  async get() { const srv = await (await api('GET', '/api/data')).json(); return {rev: srv.rev || 0, data: srv.profile ? srv : null}; },
  async rev() { return (await (await api('GET', '/api/rev')).json()).rev; },
  async put(data, baseRev, force) {
    const r = await api('PUT', '/api/data', {baseRev, data, force: !!force});
    if (r.status === 409) return {conflict: true};
    if (!r.ok) throw new Error('save ' + r.status);
    return {rev: (await r.json()).rev};
  },
};
const CloudBK = {
  async req(method, q, body, prefer) {
    const h = {apikey: CLOUD.key, Authorization: 'Bearer ' + await Auth.token(), 'Content-Type': 'application/json'};
    if (prefer) h.Prefer = prefer;
    const r = await fetch(`${CLOUD.url}/rest/v1/user_data${q}`, {method, headers: h, body: body ? JSON.stringify(body) : undefined, cache: 'no-store'});
    if (!r.ok) throw new Error('cloud ' + r.status + ' ' + await r.text());
    return r.status === 204 ? null : r.json();
  },
  uid() { return Auth.user().id; },
  async get() { const rows = await this.req('GET', `?select=data,rev&user_id=eq.${this.uid()}`); return rows.length ? {rev: rows[0].rev, data: rows[0].data} : {rev: 0, data: null}; },
  async rev() { const rows = await this.req('GET', `?select=rev&user_id=eq.${this.uid()}`); return rows.length ? rows[0].rev : 0; },
  async put(data, baseRev, force) {
    if (!baseRev) {
      const exists = (await this.req('GET', `?select=rev&user_id=eq.${this.uid()}`)).length;
      if (!exists) { await this.req('POST', '', {user_id: this.uid(), data, rev: 1}, 'return=minimal'); return {rev: 1}; }
      if (!force) return {conflict: true};
    }
    const cur = force ? await this.rev() : baseRev;
    const rows = await this.req('PATCH', `?user_id=eq.${this.uid()}&rev=eq.${cur}`, {data, rev: cur + 1, updated_at: new Date().toISOString()}, 'return=representation');
    if (!rows.length) return {conflict: true};
    return {rev: cur + 1};
  },
};
const BK = () => cloudOn() ? CloudBK : LocalBK;

// ===== Kitos lentelės (atsiliepimai, užklausos, nustatymai): debesyje – Supabase, testuojant – vietinis serveris =====
const DB = {
  uid: () => cloudOn() ? Auth.user()?.id : 'local-user',
  email: () => cloudOn() ? Auth.user()?.email : 'testas@vietinis.lt',
  async req(method, table, query = '', body, prefer) {
    const q = query ? '?' + query : '';
    let r;
    if (cloudOn()) {
      const h = {apikey: CLOUD.key, Authorization: 'Bearer ' + await Auth.token(), 'Content-Type': 'application/json'};
      if (prefer) h.Prefer = prefer;
      r = await fetch(`${CLOUD.url}/rest/v1/${table}${q}`, {method, headers: h, body: body ? JSON.stringify(body) : undefined, cache: 'no-store'});
    } else r = await fetch(`/api/t/${table}${q}`, {method, headers: {'Content-Type': 'application/json'}, body: body ? JSON.stringify(body) : undefined, cache: 'no-store'});
    if (!r.ok) throw new Error(`${table}: ${r.status} ${(await r.text()).slice(0, 120)}`);
    return r.status === 204 ? [] : r.json();
  },
  list(table, query) { return this.req('GET', table, query); },
  insert(table, row) { return this.req('POST', table, '', row, 'return=representation'); },
  update(table, query, patch) { return this.req('PATCH', table, query, patch, 'return=representation'); },
  upsert(table, row, key) { return this.req('POST', table, `on_conflict=${key}`, row, 'resolution=merge-duplicates,return=representation'); },
};
// Paskyros trynimo būsena: kol laukiama trynimo – programėlė tik skaitoma
let DELREQ = null, SNAP = null;
const readOnly = () => !!DELREQ && !DEV;

// Grąžina false, jei reikia prisijungti
async function loadData() {
  if (cloudOn() && !Auth.get()) return false;
  let cached = null;
  try { cached = JSON.parse(localStorage.getItem(lsKey())); } catch (e) {}
  try {
    const srv = await BK().get();
    ONLINE = true;
    if (cached && cached.DIRTY && cached.S && srv.data) {
      if (srv.rev === cached.REV) { S = migrate(cached.S); REV = srv.rev; DIRTY = true; await push(); return true; }
      const useLocal = confirm('Šiame įrenginyje yra neišsaugotų pakeitimų, bet kitas įrenginys jau pakeitė duomenis.\n\nOK = palikti ŠIO įrenginio versiją\nAtšaukti = paimti naujausią versiją');
      if (useLocal) { S = migrate(cached.S); REV = srv.rev; DIRTY = true; await push(true); return true; }
    }
    if (srv.data) { S = migrate(srv.data); REV = srv.rev; DIRTY = false; storeLocal(); return true; }
    // Debesyje dar nieko nėra – perkeliam esamus duomenis (iš kompiuterio serverio arba šios naršyklės)
    let found = cached && cached.S ? cached.S : null;
    if (cloudOn() && !found) {
      try { const loc = await (await api('GET', '/api/data')).json(); if (loc && loc.profile) found = loc; } catch (e) {}
      if (!found) try { const old = JSON.parse(localStorage.getItem('manogyv_v1')); if (old && old.S) found = old.S; } catch (e) {}
      if (found && !confirm('Radau šiame įrenginyje esančius duomenis. Perkelti juos į debesį?\n\nOK = perkelti\nAtšaukti = pradėti iš naujo')) found = null;
    }
    S = found ? migrate(JSON.parse(JSON.stringify(found))) : defaultData(); REV = srv.rev; DIRTY = true; await push();
  } catch (e) {
    console.warn('loadData', e);
    ONLINE = false;
    S = cached && cached.S ? migrate(cached.S) : defaultData();
    REV = cached ? cached.REV : 0; DIRTY = cached ? cached.DIRTY : false;
  }
  return true;
}
function commit(opts = {}) {
  if (readOnly()) { if (SNAP) S = migrate(JSON.parse(SNAP)); if (typeof toast === 'function') toast('🗑️ Paskyra trinama – pakeitimai negalimi. Gali atšaukti trynimą Profilyje.'); render(); return; }
  if (DEV) { storeLocal(); if (!opts.noRender) render(); return; } // smėlio dėžė – į debesį nesiunčiama
  DIRTY = true; storeLocal();
  clearTimeout(saveTimer); saveTimer = setTimeout(push, 400);
  if (!opts.noRender) render();
}
async function push(force) {
  if (DEV || !DIRTY || PUSHING) return;
  PUSHING = true;
  try {
    const snapshot = JSON.stringify(S);
    const res = await BK().put(JSON.parse(snapshot), REV, force);
    if (res.conflict) {
      PUSHING = false;
      const useLocal = confirm('Duomenys buvo pakeisti kitame įrenginyje.\n\nOK = perrašyti ŠIO įrenginio versija\nAtšaukti = įkelti naujausią (šio įrenginio paskutinis pakeitimas bus prarastas)');
      if (useLocal) return push(true);
      const srv = await BK().get(); S = migrate(srv.data || defaultData()); REV = srv.rev; DIRTY = false; storeLocal(); render(); return;
    }
    REV = res.rev; ONLINE = true;
    if (JSON.stringify(S) === snapshot) DIRTY = false; else setTimeout(push, 100);
    storeLocal();
  } catch (e) { console.warn('push', e); ONLINE = false; }
  PUSHING = false; updateSyncBadge();
}
async function pullIfChanged() {
  if (!S || DEV) return;
  if (DIRTY) { push(); return; }
  try {
    const rev = await BK().rev();
    ONLINE = true;
    if (rev !== REV) { const srv = await BK().get(); if (srv.data) { S = migrate(srv.data); REV = srv.rev; storeLocal(); if (!$('#modal.open') && document.activeElement?.tagName !== 'TEXTAREA') render(); } }
  } catch (e) { ONLINE = false; }
  updateSyncBadge();
}
function updateSyncBadge() {
  const el = $('#sync'); if (!el) return;
  const where = cloudOn() ? 'debesyje' : 'kompiuteryje';
  el.className = 'sync ' + (ONLINE ? (DIRTY ? 'pending' : 'ok') : 'off');
  el.title = ONLINE ? (DIRTY ? 'Saugoma…' : 'Išsaugota ' + where) : 'Nėra interneto – rodoma paskutinė versija, pakeitimai bus išsiųsti vėliau';
  el.textContent = ONLINE ? (DIRTY ? '⏳' : '☁️') : '📴';
}

// ===== Prieigos funkcijos =====
const cat = id => S.categories.find(c => c.id === id) || {id, name: id || 'Kita', emoji:'•', color:'#888', type:0};
// Tavo kaina (iš čekio ar įrašyta) laikoma tikra 31 d., po to – vėl „~“ (pasenusi)
const PRICE_FRESH_DAYS = 31;
const priceAge = id => { const m = (S.priceMeta || {})[id]; return m ? diffDays(m.date, today()) : 0; };
const allFoods = () => { const po = S.priceOverrides || {}; return [...BUILTIN_FOODS, ...S.foods].map(f => po[f.id] != null ? {...f, price: po[f.id], priceMine: priceAge(f.id) <= PRICE_FRESH_DAYS, priceStale: priceAge(f.id) > PRICE_FRESH_DAYS} : f); };
// Produktai, kurių kaina pasenusi ir kuriuos realiai naudoji (gaminai per 45 d. ar yra pirkinių sąraše)
function stalePrices() {
  const used = new Set(), from = addDays(today(), -45);
  for (const c of S.cooks) if (c.date >= from) for (const [fid] of recipe(c.recipeId)?.ing || []) used.add(fid);
  for (const p of S.plan) for (const [fid] of recipe(p.rid)?.ing || []) used.add(fid);
  return allFoods().filter(f => f.priceStale && used.has(f.id) && f.id !== 'prieskoniai');
}
const food = id => allFoods().find(f => f.id === id);
const recipe = id => S.recipes.find(r => r.id === id);
const exercise = id => EXERCISES.find(e => e.id === id);

// ===== Profilis ir kalorijos =====
function currentWeight() {
  const w = [...S.weights].sort((a, b) => a.date < b.date ? -1 : 1);
  return w.length ? +w[w.length - 1].kg : (+S.profile.startWeight || 0);
}
function age() { const y = +S.profile.birthYear; return y ? new Date().getFullYear() - y : 25; }
function targets() {
  const p = S.profile, kg = currentWeight(), h = +p.height || 175;
  if (!kg) return {kcal: 2000, protein: 140, bmr: 0, tdee: 0, water: 2.5, bmi: 0};
  const bmr = 10 * kg + 6.25 * h - 5 * age() + (p.sex === 'f' ? -161 : 5);
  const tdee = bmr * (+p.activity || 1.375);
  const deficit = (+p.goalRate || 0) * 7700 / 7;
  const minK = p.sex === 'f' ? 1300 : 1600;
  const kcal = Math.round(Math.max(minK, tdee - deficit) / 10) * 10;
  const refKg = +p.targetWeight && +p.targetWeight < kg ? (+p.targetWeight + kg) / 2 : kg;
  const protein = Math.round(refKg * 2.0);
  const bmi = kg / ((h / 100) ** 2);
  return {kcal, protein, bmr: Math.round(bmr), tdee: Math.round(tdee), water: round(kg * 0.035, 1), bmi: round(bmi, 1), deficit: Math.round(tdee - kcal)};
}

// ===== Receptų maistinė vertė =====
// Grąžina maistinę vertę porcijai: kcal, p (baltymai), c (angliav.), s (cukrūs), f (riebalai), sat (sotieji), fi (skaidulos), salt (druska)
const NUTR_KEYS = ['kcal', 'p', 'c', 's', 'f', 'sat', 'fi', 'salt'];
function recipeStats(r) {
  const t = Object.fromEntries(NUTR_KEYS.map(k => [k, 0])); let cost = 0, mine = 0; const missing = [];
  for (const [fid, g] of r.ing) {
    const fd = food(fid); if (!fd) { missing.push(fid); continue; }
    for (const k of NUTR_KEYS) t[k] += (+fd[k] || 0) * g / 100;
    const c = (fd.price || 0) * g / 1000; cost += c; if (fd.priceMine) mine += c;
  }
  const n = r.portions || 1, out = {};
  for (const k of NUTR_KEYS) out[k] = k === 'kcal' ? Math.round(t[k] / n) : round(t[k] / n, 1);
  if (r.nutri) for (const k of NUTR_KEYS) if (r.nutri[k] != null) out[k] = k === 'kcal' ? Math.round(r.nutri[k]) : round(r.nutri[k], 1); // iš svetainės
  return {...out, cost: round(cost / n, 2), total: round(cost, 2), missing, fromSite: !!r.nutri, priceReal: cost ? Math.round(mine / cost * 100) : 0};
}

// ===== Dienos duomenys =====
const mealsOn = d => S.meals.filter(m => m.date === d);
const dayNutrition = d => { const ms = mealsOn(d), o = {n: ms.length}; for (const k of NUTR_KEYS) o[k] = k === 'kcal' ? Math.round(sum(ms.map(m => m[k]))) : round(sum(ms.map(m => m[k])), 1); return o; };
// Maistinė vertė valgiui (iš recepto ar produkto)
const nutrOf = (st, mult) => Object.fromEntries(NUTR_KEYS.map(k => [k, (+st[k] || 0) * mult]));
const workoutsOn = d => S.workouts.filter(w => w.date === d);
const sleepOn = d => S.sleep.find(s => s.date === d);
const sleepMinutes = s => { if (!s) return 0; let m = toMin(s.wake) - toMin(s.bed); if (m <= 0) m += 1440; return m; };
// Ar įvykis vyksta (prasideda) dieną d. Tipai: once, weekly, biweekly, monthly
function eventOccurs(e, d) {
  if (S.skips[e.id + '|' + d]) return false;
  if (e.type === 'once') return e.date === d;
  if (e.from && d < e.from) return false;
  if (e.until && d > e.until) return false;
  if (e.type === 'monthly') { const md = +e.mday || 1, dd = parseD(d).getDate(); return dd === Math.min(md, daysInMonth(d)); }
  if (!(e.days || []).includes(dow(d))) return false;
  if (e.type === 'biweekly') return (Math.round(diffDays(weekStart(e.from || d), weekStart(d)) / 7) % 2 + 2) % 2 === 0;
  return true;
}
const eventsOn = d => S.events.filter(e => eventOccurs(e, d)).sort((a, b) => toMin(a.start) - toMin(b.start));
const overnight = e => toMin(e.end) <= toMin(e.start);
// Įvykių atkarpos dienoje d (įskaitant naktinių įvykių „uodegas“ iš vakar)
function eventSegs(d) {
  const out = [];
  for (const e of eventsOn(d)) out.push({e, s: toMin(e.start), en: overnight(e) ? 1440 : toMin(e.end), head: overnight(e)});
  for (const e of eventsOn(addDays(d, -1))) if (overnight(e) && toMin(e.end) > 0) out.push({e, s: 0, en: toMin(e.end), tail: true});
  return out.sort((a, b) => a.s - b.s);
}
const timelogOn = d => S.timelog.filter(t => t.date === d).sort((a, b) => toMin(a.start) - toMin(b.start));
const plansOn = d => (S.plans || []).filter(p => p.date === d && p.status === 'planned');

// Laikas pagal kategorijas per dieną (įvykiai + laiko įrašai, be dubliavimo)
function dayTime(d) {
  const isToday = d === today(), cut = isToday ? nowMin() : 1440;
  const ivs = [];
  for (const g of eventSegs(d)) { const en = Math.min(g.en, cut); if (en > g.s) ivs.push({s: g.s, e: en, cat: g.e.cat, src: 'ev'}); }
  for (const t of timelogOn(d)) { const s = toMin(t.start); let en = toMin(t.end); if (en <= s) en = 1440; ivs.push({s, e: en, cat: t.cat, src: 'log'}); }
  for (const w of workoutsOn(d)) if (w.start) ivs.push({s: toMin(w.start), e: Math.min(1440, toMin(w.start) + (+w.duration || 30)), cat: 'sportas', src: 'log'});
  if (S.active && S.active.date === d) ivs.push({s: toMin(S.active.start), e: Math.max(toMin(S.active.start) + 1, nowMin()), cat: 'sportas', src: 'log'});
  if (S.timer && S.timer.date === d) ivs.push({s: toMin(S.timer.start), e: Math.max(toMin(S.timer.start) + 1, nowMin()), cat: S.timer.cat, src: 'log'});
  // laiko įrašai turi pirmenybę prieš suplanuotus įvykius toje pačioje vietoje
  const per = {};
  const minuteCat = new Array(1440).fill(null);
  for (const iv of ivs.filter(i => i.src === 'ev')) for (let m = iv.s; m < iv.e && m < 1440; m++) minuteCat[m] = iv.cat;
  for (const iv of ivs.filter(i => i.src === 'log')) for (let m = iv.s; m < iv.e && m < 1440; m++) minuteCat[m] = iv.cat;
  for (const c of minuteCat) if (c) per[c] = (per[c] || 0) + 1;
  let prod = 0, screen = 0, neutral = 0;
  for (const [c, m] of Object.entries(per)) { const t = cat(c).type; if (t === 1) prod += m; else if (t === -1) screen += m; else neutral += m; }
  return {per, prod, screen, neutral, logged: ivs.length > 0};
}

// Laisvi langai
function busyBlocks(d) {
  const b = [];
  for (const g of eventSegs(d)) b.push([g.tail ? 0 : g.s - (+g.e.travel || 0), g.head ? 1440 : g.en + (+g.e.travel || 0)]);
  for (const t of timelogOn(d)) { let en = toMin(t.end); if (en <= toMin(t.start)) en = 1440; b.push([toMin(t.start), en]); }
  for (const w of workoutsOn(d)) if (w.start) b.push([toMin(w.start), toMin(w.start) + (+w.duration || 30) + (+S.profile.showerMin || 0)]);
  for (const p of plansOn(d)) b.push([toMin(p.start), toMin(p.start) + (+p.duration || 40) + (+S.profile.showerMin || 0)]);
  return b.sort((x, y) => x[0] - y[0]);
}
// Užimtumas su kategorija (valgymo laikams parinkti)
function busyDetail(d) {
  const b = [];
  for (const g of eventSegs(d)) b.push({s: g.tail ? 0 : g.s - (+g.e.travel || 0), e: g.head ? 1440 : g.en + (+g.e.travel || 0), cat: g.e.cat, name: g.e.title});
  for (const t of timelogOn(d)) { let en = toMin(t.end); if (en <= toMin(t.start)) en = 1440; b.push({s: toMin(t.start), e: en, cat: t.cat, name: cat(t.cat).name}); }
  for (const w of workoutsOn(d)) if (w.start) b.push({s: toMin(w.start), e: toMin(w.start) + (+w.duration || 30) + (+S.profile.showerMin || 0), cat: 'sportas', name: 'treniruotė'});
  for (const p of plansOn(d)) b.push({s: toMin(p.start), e: toMin(p.start) + (+p.duration || 40) + (+S.profile.showerMin || 0), cat: 'sportas', name: 'treniruotė'});
  const sl = sleepOn(d); if (sl) { const bb = toMin(sl.bed), ww = toMin(sl.wake); b.push({s: bb < ww ? bb : 0, e: ww, cat: 'miegas', name: 'miegas'}); }
  return b.sort((x, y) => x.s - y.s);
}
// Įpročiai: kada dažniausiai valgai (paskutinės 3 sav.)
function mealHabits(defaults) {
  const from = addDays(today(), -21), ms = S.meals.filter(m => m.date >= from && m.time && !m.snack), ts = ms.map(m => toMin(m.time));
  if (ts.length < 8 || new Set(ms.map(m => m.date)).size < 4) return null;
  let c = [...defaults];
  for (let it = 0; it < 12; it++) {
    const g = c.map(() => []);
    for (const t of ts) { let bi = 0; c.forEach((x, i) => { if (Math.abs(t - x) < Math.abs(t - c[bi])) bi = i; }); g[bi].push(t); }
    c = c.map((x, i) => g[i].length >= 2 ? sum(g[i]) / g[i].length : x);
  }
  return c;
}
// Įpročiai: kada dažniausiai sportuoji
function sportHabit() {
  const from = addDays(today(), -45), ts = S.workouts.filter(w => w.date >= from && w.start).map(w => toMin(w.start)).sort((a, b) => a - b);
  return ts.length >= 3 ? ts[Math.floor(ts.length / 2)] : null;
}
function freeSlots(d, fromM) {
  const p = S.profile;
  let start = toMin(p.wake), end = toMin(p.bed); if (end <= start) end = 1440;
  if (fromM != null) start = Math.max(start, fromM);
  const slots = []; let cur = start;
  for (const [s, e] of busyBlocks(d)) {
    if (e <= cur) continue;
    if (s > cur) slots.push([cur, Math.min(s, end)]);
    cur = Math.max(cur, e);
    if (cur >= end) break;
  }
  if (cur < end) slots.push([cur, end]);
  return slots.filter(([s, e]) => e - s >= 15);
}

// Kada paskutinį kartą treniruota kiekviena grupė
function muscleLastTrained() {
  const last = {};
  for (const w of S.workouts) for (const ex of w.exercises || []) {
    const e = exercise(ex.id); if (!e) continue;
    for (const g of e.g) if (!last[g] || last[g] < w.date) last[g] = w.date;
  }
  return last;
}

// ===== Treniruotės: pratimų parinkimas, progresija, balansas =====
const MAJOR = ['kru','nug','pec','ket','sed','uzp','pre','bic','tri'];
const prefOf = g => { const p = (S.sportPrefs || {})[g]; return p && diffDays(p.date, today()) <= 28 ? p : null; };
const injured = g => { const p = prefOf(g); return p && p.reason === 'skauda' && diffDays(p.date, today()) < 14; };
function lastPerf(exId) {
  const ws = [...S.workouts].sort((a, b) => a.date < b.date ? 1 : -1);
  for (const w of ws) { const ex = (w.exercises || []).find(x => x.id === exId); if (ex && ex.sets && ex.sets.length) return {date: w.date, sets: ex.sets, max: Math.max(...ex.sets)}; }
  return null;
}
function pickExercise(g, chosen = []) {
  const pr = prefOf(g) || {};
  let opts = EXERCISES.filter(e => e.g.includes(g) && !chosen.some(c => c && c.id === e.id));
  if (pr.reason === 'iranga') { const f = opts.filter(e => !e.eq); if (f.length) opts = f; }
  if (pr.reason === 'nepatinka' && pr.used) { const f = opts.filter(e => !pr.used.includes(e.id)); if (f.length) opts = f; }
  if (!opts.length) return null;
  opts.sort((a, b) => (a.g[0] === g ? 0 : 1) - (b.g[0] === g ? 0 : 1) || a.lvl - b.lvl);
  if (pr.reason === 'sunku') return opts.find(e => e.lvl === 1) || opts[0];
  let best = opts.find(e => e.g[0] === g && lastPerf(e.id)) || opts.find(e => e.lvl === 1) || opts[0];
  const lp = lastPerf(best.id);
  if (lp && best.next && lp.max >= (best.sec ? 60 : 15)) { const n = exercise(best.next); if (n && !chosen.some(c => c && c.id === n.id)) best = n; }
  return best;
}
function targetSets(e, mini) {
  const lp = lastPerf(e.id), easy = prefOf(e.g[0])?.reason === 'sunku';
  let reps = lp ? lp.max + (e.sec ? 5 : 1) : (e.sec ? 30 : e.lvl === 1 ? 10 : 8);
  if (easy && !lp) reps = e.sec ? 20 : 6;
  if (e.id === 'kaklas_izo') reps = 10;
  return Array(mini ? 2 : 3).fill(reps);
}
function buildWorkout(groups, minutes) {
  groups = (groups || []).filter(g => !injured(g));
  const count = clamp(Math.round((minutes || +S.profile.workoutMin || 40) / 7), 3, 8), chosen = [];
  for (let i = 0; chosen.length < count && i < count * 3 && groups.length; i++) { const ex = pickExercise(groups[i % groups.length], chosen); if (ex) chosen.push(ex); }
  // praleistos grupės, kurias žadėjai įtraukti ("pamiršau"/"nėra noro" – mini)
  const last = muscleLastTrained();
  for (const g of Object.keys(S.sportPrefs || {})) {
    const p = prefOf(g); if (!p || groups.includes(g) || injured(g)) continue;
    if ((p.reason === 'pamirsau' || p.reason === 'noro') && (!last[g] || diffDays(last[g], today()) >= 7)) { const ex = pickExercise(g, chosen); if (ex) chosen.push({...ex, mini: p.reason === 'noro'}); }
  }
  return chosen.map(e => ({id: e.id, sets: targetSets(e, e.mini), mini: !!e.mini}));
}
function suggestWorkout(minutes) {
  const last = muscleLastTrained(), t = today();
  const focus = Object.keys(MUSCLES).filter(g => MAJOR.includes(g) && !injured(g))
    .map(g => ({g, days: last[g] ? diffDays(last[g], t) : 99})).sort((a, b) => b.days - a.days).slice(0, 3).map(x => x.g);
  const list = buildWorkout(focus, minutes).map(x => ({...x, target: `${x.sets.length} × ${x.sets[0]}`}));
  return {focus, list};
}
function targetFor(e) { const s = targetSets(e); return `${s.length} × ${s[0]}${e.sec ? ' s' : ''}`; }
// Serijos pagal raumenų grupes per laikotarpį (pagrindinė grupė 1, kitos 0,5)
function muscleVolume(from, to) {
  const v = {};
  for (const w of S.workouts) if (w.date >= from && w.date <= to) for (const x of w.exercises || []) {
    const e = exercise(x.id); if (!e) continue; const n = (x.sets || []).length || 1;
    e.g.forEach((g, i) => v[g] = (v[g] || 0) + n * (i ? 0.5 : 1));
  }
  return v;
}
// Apleistos grupės per 14 d.: nedarytos arba < pusės vidurkio
function neglected(days = 14) {
  const t = today(), from = addDays(t, -days + 1);
  if (!S.workouts.some(w => w.date >= from)) return [];
  const v = muscleVolume(from, t), last = muscleLastTrained();
  const gs = Object.keys(MUSCLES).filter(g => g !== 'kar' && (MAJOR.includes(g) || last[g]));
  const avg = sum(gs.map(g => v[g] || 0)) / gs.length;
  return gs.filter(g => !injured(g) && (!last[g] || diffDays(last[g], t) >= days || (v[g] || 0) < avg * 0.5))
    .map(g => ({g, sets: round(v[g] || 0, 1), days: last[g] ? diffDays(last[g], t) : null}));
}

// Receptų įvairovė
function recipeUsage(days = 14) {
  const from = addDays(today(), -days), u = {};
  for (const m of S.meals) if (m.recipeId && m.date >= from) u[m.recipeId] = (u[m.recipeId] || 0) + (m.portions || 1);
  for (const c of S.cooks) if (c.date >= from) u[c.recipeId] = (u[c.recipeId] || 0) + 1;
  return u;
}
function freezerPortions(rid, place) { return sum(S.freezer.filter(f => (!rid || f.recipeId === rid) && (!place || (f.place || 'freezer') === place)).map(f => f.portions)); }
// ===== Laikymas: šaldytuvas / šaldiklis =====
// Kiek dienų laikosi pagaminto patiekalo porcija (maisto saugos rekomendacijos)
function shelfDays(r, place) {
  if (!r) return place === 'fridge' ? 3 : 90;
  const fl = recipeFlags(r), fish = fl.has('žuvis') || fl.has('jūros gėrybės'), rice = r.ing.some(([f]) => f === 'ryziai' || f === 'ryziai_rudi');
  if (place === 'fridge') return fish ? 2 : rice ? 3 : 4;
  return fish ? 60 : 90;
}
function addStorage(recipeId, place, portions, date = today()) {
  if (!(portions > 0)) return;
  const ex = S.freezer.find(f => f.recipeId === recipeId && (f.place || 'freezer') === place && f.date === date);
  if (ex) ex.portions += portions;
  else S.freezer.push({id: uid(), recipeId, place, portions, date, until: addDays(date, shelfDays(recipe(recipeId), place))});
}
// Visos porcijos, pirmiausia tos, kurios greičiau genda
const storageItems = () => S.freezer.filter(f => f.portions > 0).map(f => ({...f, place: f.place || 'freezer', r: recipe(f.recipeId), left: diffDays(today(), f.until || addDays(f.date, 90))})).sort((a, b) => a.left - b.left);
function takePortion(id, n = 1) { const f = S.freezer.find(x => x.id === id); if (!f) return; f.portions = round(f.portions - n, 2); if (f.portions <= 0) S.freezer = S.freezer.filter(x => x !== f); }
const leftText = x => x.left < 0 ? `<b class="red">pasibaigė prieš ${-x.left} d.</b>` : x.left === 0 ? '<b class="red">suvalgyk šiandien</b>' : x.left === 1 ? '<b class="warnc">iki rytojaus</b>' : x.place === 'fridge' ? `dar ${x.left} d.` : `iki ${fmtDate(x.until)}`;
// ===== Kainos: kiek jų „tikros“ (iš tavo čekių) =====
const priceIsMine = id => (S.priceOverrides || {})[id] != null;
function budgetWeek(d = today()) {
  const ws = weekStart(d), we = addDays(ws, 6);
  // jei šią savaitę nuskaitei čekių – skaičiuojam tikras išlaidas, kitaip – pagal pagamintus receptus
  const receipts = sum((S.spend || []).filter(c => c.date >= ws && c.date <= we).map(c => c.amount));
  const spent = round(receipts || sum(S.cooks.filter(c => c.date >= ws && c.date <= we).map(c => c.cost)), 2);
  const budget = +S.foodPrefs?.budget || +S.profile.budgetWeek || 0;
  return {spent, budget, left: round(budget - spent, 2), fromReceipts: receipts > 0};
}
// ===== Mitybos pageidavimai: ką receptas turi ir ar jis tinka =====
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function recipeFlags(r) {
  const f = new Set(r.tags || []);
  for (const [fid] of r.ing) for (const x of FOOD_FLAGS[fid] || []) f.add(x);
  return f;
}
// Grąžina null, jei tinka, arba priežastį, kodėl ne
function recipeBlock(r) {
  const fp = S.foodPrefs || {}, flags = recipeFlags(r);
  if ((S.ratings || {})[r.id] === -1) return '👎 pažymėjai, kad nepatinka';
  const al = (fp.allergies || []).find(a => flags.has(a)); if (al) return `alergija: ${al}`;
  const dl = (fp.dislikes || []).find(a => flags.has(a)); if (dl) return `nevalgai: ${dl}`;
  const words = (fp.dislikeText || '').split(',').map(w => norm(w).trim()).filter(w => w.length >= 3);
  if (words.length) { const hay = norm([r.name, ...r.tags, ...r.ing.map(([fid]) => food(fid)?.name || '')].join(' ')); const w = words.find(w => hay.includes(w.slice(0, Math.max(3, w.length - 2)))); if (w) return `nevalgai: ${w}`; }
  if (fp.equip && fp.equip.length) { const miss = (r.equip || []).filter(e => !fp.equip.includes(e)); if (miss.length) return `reikia: ${miss.join(', ')}`; }
  if (fp.skill && (r.skill || 1) > fp.skill) return 'sudėtingesnis nei pasirinkai';
  if (fp.cookMax && r.time > fp.cookMax && r.time > 20) return `užtrunka ${r.time} min`;
  return null;
}
// Kokie skoniai tau patinka: iš to, ką gamini, valgai ir pažymi ❤️
function tagAffinity() {
  const a = {}, add = (r, w) => { if (r) for (const t of r.tags) a[t] = (a[t] || 0) + w; };
  for (const c of S.cooks) add(recipe(c.recipeId), 1);
  for (const m of S.meals) if (m.recipeId) add(recipe(m.recipeId), 0.3);
  for (const [rid, v] of Object.entries(S.ratings || {})) add(recipe(rid), v * 3);
  return a;
}
const jaccard = (a, b) => { const A = new Set(a), B = new Set(b); const i = [...A].filter(x => B.has(x)).length; return i / (new Set([...A, ...B]).size || 1); };
function suggestRecipes(opts = {}) {
  const u = recipeUsage(), maxTime = opts.maxTime || 999, bw = budgetWeek(), aff = tagAffinity();
  const top = Object.entries(u).sort((a, b) => b[1] - a[1])[0];
  const tired = top && top[1] >= 5 ? recipe(top[0]) : null; // tai, ko jau per daug
  return S.recipes.filter(r => (opts.freezableOnly ? r.freezable : true) && r.time <= maxTime && (opts.all || !recipeBlock(r)))
    .map(r => {
      const st = recipeStats(r), why = [];
      let score = 0;
      score -= (u[r.id] || 0) * 3;
      score -= freezerPortions(r.id) * 2;
      score += st.p / 10;
      const af = sum(r.tags.map(t => aff[t] || 0)); score += Math.min(af, 8) * 0.4;
      if ((S.ratings || {})[r.id] === 1) { score += 4; why.push('❤️ patinka'); }
      if (tired && r.id !== tired.id && jaccard(r.tags, tired.tags) >= 0.2) { score += 3; why.push(`panašu į ${tired.name}, bet kitaip`); }
      else if (af > 2) why.push('pagal tavo skonį');
      if (bw.budget && st.total > bw.left && bw.left > 0) { score -= 6; why.push('⚠️ viršys biudžetą'); }
      else if (st.cost && st.cost < 1.5) why.push('pigu');
      if (!u[r.id]) why.push('seniai valgei'); else why.push(`valgyta ${u[r.id]}× per 14 d.`);
      if (S.foodPrefs?.equip?.includes('airfryer') && r.equip?.includes('airfryer')) why.push('🌀 air fryer');
      score += (r.id.charCodeAt(r.id.length - 1) + new Date().getDate()) % 3 * 0.2;
      return {r, st, score, used: u[r.id] || 0, why: why.slice(0, 3), block: recipeBlock(r)};
    }).sort((a, b) => b.score - a.score);
}
// Panašūs receptai (įvairovei)
function similarRecipes(r, n = 3) {
  return S.recipes.filter(x => x.id !== r.id && !recipeBlock(x)).map(x => ({x, s: jaccard(x.tags, r.tags)})).filter(o => o.s > 0).sort((a, b) => b.s - a.s).slice(0, n).map(o => o.x);
}

// ===== Ingredientų atpažinimas iš teksto (LT / EN / SV / DE vienetai) =====
const FRACT = {'½':'.5','¼':'.25','¾':'.75','⅓':'.33','⅔':'.67','⅛':'.125','⅜':'.375','⅝':'.625','⅞':'.875'};
// [taisyklė, tipas: w = svoris (g), v = tūris (ml), pc = vienetas, fix = fiksuotas svoris (g), kiekis]
const UNIT_RULES = [
  [/^(kg|kilos?|kilogram\w*)$/, 'w', 1000], [/^(g|gr|g\.|grams?|grammes?|gram\w*)$/, 'w', 1], [/^(mg)$/, 'w', 0.001],
  [/^(oz|ounces?|uncij\w*)$/, 'w', 28.35], [/^(lbs?|pounds?|svar\w*)$/, 'w', 453.6], [/^(hg|hekto)$/, 'w', 100],
  [/^(ml|millilit\w*|mililitr\w*)$/, 'v', 1], [/^(l|lit(er|re)s?|litr\w*)$/, 'v', 1000], [/^(dl|decilit\w*)$/, 'v', 100], [/^(cl)$/, 'v', 10],
  [/^(fl\.?\s?oz|fluid)$/, 'v', 29.57], [/^(pints?|pt)$/, 'v', 473], [/^(quarts?|qt)$/, 'v', 946], [/^(gallons?|gal)$/, 'v', 3785],
  [/^(cups?|c\.|stiklin\w*|puodel\w*|kopp\w*|tasse\w*)$/, 'v', 240],
  [/^(saukstel\w*|arb\w*|tsp|teaspoons?|tsk|tesked\w*|tl|teeloffel)$/, 'v', 5], [/^(sauks\w*|valg\w*|tbsp|tbs|tablespoons?|msk|matsked\w*|el|essloffel)$/, 'v', 15],
  [/^(krm|kryddmatt|ziupsn\w*|pinch\w*|dash\w*|prise)$/, 'fix', 1], [/^(skiltel\w*|cloves?|klyft\w*)$/, 'fix', 5], [/^(sticks?)$/, 'fix', 113],
  [/^(skardin\w*|cans?|tins?|burk\w*|dose)$/, 'fix', 400], [/^(pakel\w*|pak\.?|packs?|packages?|paket\w*)$/, 'fix', 200],
  [/^(vnt\.?|vienet\w*|pcs|pieces?|whole|gabal\w*|st|styck\w*|stk)$/, 'pc', 1], [/^(rieke\w*|slices?|skiv\w*)$/, 'pc', 1],
];
// Tankis g/ml – kad „1 cup miltų“ ≠ „1 cup pieno“
const DENSITY = {miltai:0.53, cukrus:0.85, ryziai:0.78, ryziai_rudi:0.78, avizos:0.38, grikiai:0.73, kuskusas:0.73, bulguras:0.7, kinva:0.72, lesiai:0.8, perlines:0.8,
  sviestas:0.96, alyv_al:0.91, saul_al:0.92, medus:1.42, suris:0.45, mozzarella:0.45, spinatai:0.13, salotos:0.2, uogos:0.6, kukuruzai:0.7, zirneliai:0.6, darz_mix:0.55,
  migdolai:0.6, graikiniai:0.45, saulegrazos:0.6, chia:0.7, makaronai:0.42, makaronai_pg:0.42, majonezas:0.95, kecupas:1.1, sojos:1.15, pienas:1.03, kefyras:1.03,
  jogurtas:1.03, graik_jog:1.05, skyr:1.05, varske_0:1.0, grietine20:1.0, grietine10:1.0, grietinele:1.0, kok_pienas:1.0, pom_konserv:1.0, pom_pasta:1.1, baltymai:0.4,
  pup_raud:0.75, pup_balt:0.75, avinz:0.7, prieskoniai:0.5, riesut_sv:1.1, kakava:0.45, humusas:1.0, pesto:1.0};
function unitOf(word) { const w = norm(word).replace(/\.$/, ''); for (const [re, kind, k] of UNIT_RULES) if (re.test(w) || re.test(norm(word))) return {kind, k}; return null; }
function matchFood(text) {
  const t = norm(text).replace(/\(.*?\)/g, ' ').replace(/[^a-z0-9 ]/g, ' ');
  const toks = t.split(/\s+/).filter(w => w.length >= 3);
  const hit = (stem) => toks.some(w => w.startsWith(stem) || (stem.startsWith(w) && w.length >= 4));
  let best = null, bestS = 0;
  for (const f of allFoods()) {
    const phrases = [f.name.replace(/\(.*?\)/g, ''), ...(FOOD_SYN[f.id] || [])];
    for (const ph of phrases) {
      const words = norm(ph).replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length >= 3), stems = words.map(w => w.slice(0, 5));
      if (!stems.length || !stems.every(hit)) continue;
      // premija už ilgesnį sutapimą (grietinėlė ≠ grietinė)
      const bonus = sum(words.map(w => { const b = w.slice(0, Math.max(3, w.length - 1)); return toks.some(t => t.startsWith(b)) ? b.length : 0; }));
      // pagrindinis žodis dažniausiai paskutinis („avokadų ALIEJUS“, „olive OIL“)
      const last = toks[toks.length - 1] || '', head = stems.some(st => last.startsWith(st) || (st.startsWith(last) && last.length >= 4)) ? 4 : 0;
      const s = sum(stems.map(x => x.length)) + stems.length * 3 + bonus + head;
      if (s > bestS) { bestS = s; best = f; }
    }
  }
  return bestS >= 4 ? best : null;
}
const toNum = x => { x = String(x).replace(',', '.').trim(); if (x.includes('/')) { const p = x.split(/\s+/); return p.reduce((a, v) => { if (v.includes('/')) { const [q, w] = v.split('/'); return a + +q / +w; } return a + +v; }, 0); } return x.split(/\s+/).reduce((acc, v) => acc + +v, 0); };
function parseIngredient(line) {
  let s = String(line); for (const [k, v] of Object.entries(FRACT)) s = s.replaceAll(k, ' ' + v);
  s = s.trim().replace(/^[-•*·▪]\s*/, '').replace(/(\d)\s+\.(\d)/, '$1.$2').replace(/^\.(\d)/, '0.$1').replace(/(\d)\s*-\s*(?=[a-z])/i, '$1 ');
  let qty = null, unit = null, rest = s, extraG = 0;
  // „1 lb 2 oz …“, „1 kg 200 g …“
  const two = s.match(/^(\d+(?:[.,]\d+)?)\s*(lbs?|pounds?|kg)\s+(\d+(?:[.,]\d+)?)\s*(oz|ounces?|g)\b\s*(.*)$/i);
  if (two) { const a = unitOf(two[2]), b = unitOf(two[4]); qty = 1; unit = {kind: 'w', k: toNum(two[1]) * a.k + toNum(two[3]) * b.k}; rest = two[5]; }
  const m = !two && s.match(/^(\d+(?:[.,]\d+)?(?:\s+\d+\/\d+)?|\d+\/\d+|\d*\.\d+)(?:\s*(?:[-–]|to|iki)\s*(\d+(?:[.,]\d+)?))?\s*(.*)$/i);
  if (m) {
    qty = toNum(m[1]); if (m[2]) qty = (qty + toNum(m[2])) / 2; rest = m[3];
    rest = rest.replace(/^((heaped|level|large|small|medium|big|rounded|scant|generous|good|heaping|apie|about|approx\w*|didel\w*|maz\w*|maž\w*|vidutin\w*|nedidel\w*|pilnas|pilno|kupin\w*|stor\w*|liten|stor)\s+)+/i, '');
    // „1 (14 oz) can …“ – skliaustuose tikslesnis kiekis
    const par = rest.match(/^\((\d+(?:[.,]\d+)?)\s*([a-z.]+)\)\s*(?:[a-z]+\s+)?(.*)$/i);
    if (par && unitOf(par[2])) { const u = unitOf(par[2]); qty = qty * toNum(par[1]); unit = u; rest = par[3]; }
    else {
      const w = rest.match(/^(fl\.?\s?oz|[a-ząčęėįšųūžäöå.]+)\s*(.*)$/i);
      if (w) { const u = unitOf(w[1]); if (u) { unit = u; rest = w[2]; } }
    }
  } else if (!two) {
    // „Druska – 1 šaukštelis“ / „Vištiena 500 g“ – kiekis gale
    const e = s.match(/^(.*?)[\s:–-]+(\d+(?:[.,]\d+)?)\s*([a-ząčęėįšųūžäöå.]+)?\s*$/i);
    if (e) { rest = e[1]; qty = toNum(e[2]); if (e[3]) unit = unitOf(e[3]); }
  }
  rest = rest.replace(/^(of|su|av|von)\s+/i, '');
  const f = matchFood(rest || s);
  let grams = 0;
  if (qty != null) {
    if (!unit || unit.kind === 'pc') grams = f ? qty * (PIECE_G[f.id] || 100) : 0;
    else if (unit.kind === 'v') grams = qty * unit.k * (f ? (DENSITY[f.id] ?? 1) : 1);
    else grams = qty * unit.k; // svoris arba fiksuotas
  } else if (f && f.id === 'prieskoniai') grams = 3;
  if (f && f.id === 'prieskoniai') grams = Math.min(grams, 15);
  // „virtų ryžių“ – bazėje sausi, todėl ~÷3
  if (f && /cooked|boiled|virt|kokt/.test(norm(s)) && ['ryziai', 'ryziai_rudi', 'grikiai', 'makaronai', 'makaronai_pg', 'kuskusas', 'bulguras', 'kinva', 'perlines', 'lesiai'].includes(f.id)) grams /= 3;
  return {raw: line, foodId: f ? f.id : '', grams: Math.round(grams), qtyKnown: qty != null};
}

// ===== Dienos įvertinimas =====
// Principai: (1) ateities dienos nevertinamos; (2) šiandiena vertinama tik pagal tai, kas JAU įvyko;
// (3) neišvengiami dalykai (darbas, paskaitos, naktinė pamaina) nebaudžiami; (4) poilsio diena – ne nuodėmė, žiūrim savaitę.
function dayScore(d) {
  const td = today();
  if (d > td) return null;
  const p = S.profile, parts = [], live = d === td;
  const t = dayTime(d);
  // kokia dalis „budraus“ laiko jau praėjo (šiandien)
  const wake = toMin(p.wake), bed = toMin(p.bed) > wake ? toMin(p.bed) : 1440;
  const frac = live ? clamp((nowMin() - wake) / (bed - wake), 0.05, 1) : 1;
  const goal = (+p.prodGoalH || 6) * 60 * frac;
  if (t.logged) parts.push({k:'Produktyvus laikas', w:25, v: clamp(t.prod / goal, 0, 1), txt: fmtH(t.prod) + (live ? ` (iki dabar tikėtina ~${fmtH(goal)})` : ''),
    why: 'Darbas, paskaitos, mokslai ir kt. „produktyvios“ kategorijos – ir iš kalendoriaus, ir laikmačio.'});
  const tasksDone = S.tasks.filter(x => x.done && x.doneAt === d).length;
  const tasksMissed = S.tasks.filter(x => !x.done && x.due === d && d < td).length;
  if (tasksDone + tasksMissed) parts.push({k:'Užduotys', w:15, v: tasksDone / (tasksDone + tasksMissed), txt: `${tasksDone} atlikta${tasksMissed ? `, ${tasksMissed} praleista` : ''}`, why: 'Tik tos, kurių terminas buvo tą dieną.'});
  const sl = sleepOn(d);
  if (sl) {
    const h = sleepMinutes(sl) / 60, g = +p.sleepGoal || 8;
    let v = h >= g - 0.5 ? 1 : clamp(0.3 + 0.7 * (h - (g - 3)) / 2.5, 0.3, 1);
    // jei vakar vakare/naktį buvo įvykis (darbas, paskaitos), trumpesnis miegas – aplinkybės, ne kaltė
    const forced = eventSegs(d).some(x => x.tail) || eventsOn(addDays(d, -1)).some(e => toMin(e.end) > toMin(p.bed) || overnight(e));
    if (forced && v < 0.8) v = 0.8;
    parts.push({k:'Miegas', w:20, v, txt: `${round(h, 1)} val${forced && h < g - 0.5 ? ' (dėl įsipareigojimų – nebaudžiama)' : ''}`, why: 'Iki 30 min mažiau nei tikslas – vis tiek pilnas balas. Trumpa naktis dėl darbo nebaudžiama.'});
  }
  // judėjimas vertinamas per paskutines 7 d., todėl poilsio diena nemažina balo, jei savaitė gera
  const w7 = S.workouts.filter(x => x.date <= d && x.date > addDays(d, -7)).length, wGoal = +p.workoutsPerWeek || 3, wToday = workoutsOn(d).length;
  if (t.logged || wToday || sl) parts.push({k:'Judėjimas', w:15, v: wToday ? 1 : clamp(w7 / wGoal, 0, 1), txt: wToday ? 'treniruotė ✓' : `${w7}/${wGoal} treniruotės per 7 d.`, why: 'Poilsio diena nebaudžiama, jei per savaitę treniruočių pakanka.'});
  const n = dayNutrition(d), tg = targets();
  if (foodOn() && n.n) {
    const over = (n.kcal - tg.kcal) / tg.kcal;
    let v;
    if (live) v = (over > 0.08 ? clamp(1 - (over - 0.08) * 3, 0, 1) : 1); // šiandien „per mažai“ nebaudžiama – diena dar nesibaigė
    else v = clamp(1 - Math.max(0, Math.abs(over) - 0.1) * 2.5, 0, 1) * 0.7 + clamp(n.p / tg.protein, 0, 1) * 0.3;
    parts.push({k:'Mityba', w:15, v, txt: `${n.kcal} kcal, ${Math.round(n.p)} g B`, why: live ? 'Šiandien baudžiama tik už viršijimą – likusius valgius dar suvalgysi.' : '±10% nuo tikslo – pilnas balas, plius baltymai.'});
  }
  if (t.logged) { const lim = +p.screenLimitMin || 90; parts.push({k:'Ekrano laikas', w:10, v: t.screen <= lim ? 1 : clamp(1 - (t.screen - lim) / lim, 0, 1), txt: fmtDur(t.screen), why: 'Tik tai, ką pats pažymėjai kaip ekraną (serialai, telefonas, žaidimai).'}); }
  if (!parts.length) return null;
  const score = Math.round(sum(parts.map(x => x.w * x.v)) / sum(parts.map(x => x.w)) * 100);
  return {score, parts, live};
}
const scoreColor = s => s == null ? 'var(--muted2)' : s >= 75 ? '#22c55e' : s >= 50 ? '#facc15' : s >= 30 ? '#f97316' : '#ef4444';

// Periodo suvestinė (savaitė/mėnuo)
function periodStats(from, n) {
  const days = range(from, n).filter(d => d <= today());
  const st = {days: days.length, prod: 0, screen: 0, sleep: [], kcal: [], protein: [], workouts: 0, workoutMin: 0, tasksDone: 0, scores: []};
  for (const d of days) {
    const t = dayTime(d); st.prod += t.prod; st.screen += t.screen;
    const sl = sleepOn(d); if (sl) st.sleep.push(sleepMinutes(sl));
    const nu = dayNutrition(d); if (nu.n) { st.kcal.push(nu.kcal); st.protein.push(nu.p); }
    const ws = workoutsOn(d); st.workouts += ws.length; st.workoutMin += sum(ws.map(w => w.duration));
    st.tasksDone += S.tasks.filter(x => x.done && x.doneAt === d).length;
    const sc = dayScore(d); if (sc) st.scores.push(sc.score);
  }
  const avg = a => a.length ? sum(a) / a.length : null;
  st.avgSleep = avg(st.sleep); st.avgKcal = avg(st.kcal); st.avgProtein = avg(st.protein); st.avgScore = avg(st.scores);
  const ws = S.weights.filter(w => w.date >= from && w.date <= addDays(from, n - 1)).sort((a, b) => a.date < b.date ? -1 : 1);
  st.weightStart = ws.length ? +ws[0].kg : null; st.weightEnd = ws.length ? +ws[ws.length - 1].kg : null;
  const sp = (S.spend || []).filter(x => x.date >= from && x.date <= addDays(from, n - 1));
  st.spendTotal = round(sum(sp.map(x => x.amount)), 2); st.snackSpend = round(sum(sp.map(x => x.snack || 0)), 2);
  return st;
}

// Svorio pokytis per N dienų (pagal įrašus)
function weightChange(days) {
  const w = [...S.weights].sort((a, b) => a.date < b.date ? -1 : 1);
  if (w.length < 2) return null;
  const last = w[w.length - 1], from = addDays(last.date, -days);
  const base = [...w].reverse().find(x => x.date <= from) || w[0];
  if (base === last) return null;
  return round(last.kg - base.kg, 1);
}
function weightTrend() {
  const w = [...S.weights].sort((a, b) => a.date < b.date ? -1 : 1).filter(x => diffDays(x.date, today()) <= 42);
  if (w.length < 3) return null;
  const xs = w.map(x => diffDays(w[0].date, x.date)), ys = w.map(x => +x.kg);
  const mx = sum(xs) / xs.length, my = sum(ys) / ys.length;
  const k = sum(xs.map((x, i) => (x - mx) * (ys[i] - my))) / (sum(xs.map(x => (x - mx) ** 2)) || 1);
  return k * 7; // kg per savaitę
}

// ===== Motyvacija =====
function motivation() {
  const seed = parseD(today()).getDate();
  const out = [];
  const wc = weightChange(7), w30 = weightChange(30);
  if (w30 != null && w30 <= -0.5) out.push({t: fill(pick(MOTIVATION.weightDown, seed), Math.abs(w30)), good: true});
  else if (wc != null && wc <= -0.3) out.push({t: fill(pick(MOTIVATION.weightDown, seed), Math.abs(wc)), good: true});
  else if (wc != null && wc >= 0.5) out.push({t: pick(MOTIVATION.weightUp, seed)});
  else if (wc != null) out.push({t: pick(MOTIVATION.weightFlat, seed)});
  const ws = weekStart(today()), thisW = periodStats(ws, 7), lastW = periodStats(addDays(ws, -7), 7);
  const dScreen = (thisW.screen / thisW.days - lastW.screen / (lastW.days || 1)) * 7 / 60;
  if (lastW.screen > 0 && thisW.days >= 2) {
    if (dScreen <= -1) out.push({t: fill(pick(MOTIVATION.screenDown, seed), round(-dScreen, 1)), good: true});
    else if (dScreen >= 1) out.push({t: fill(pick(MOTIVATION.screenUp, seed), round(dScreen, 1))});
  }
  const dProd = (thisW.prod / thisW.days - lastW.prod / (lastW.days || 1)) * 7 / 60;
  if (lastW.prod > 0 && thisW.days >= 2) {
    if (dProd >= 1) out.push({t: fill(pick(MOTIVATION.prodUp, seed), round(dProd, 1)), good: true});
    else if (dProd <= -2) out.push({t: pick(MOTIVATION.prodDown, seed)});
  }
  if (thisW.workouts >= 2) out.push({t: fill(pick(MOTIVATION.workoutStreak, seed), thisW.workouts), good: true});
  if (!out.length) out.push({t: S.meals.length + S.timelog.length + S.weights.length ? pick(MOTIVATION.general, seed) : pick(MOTIVATION.noData, seed)});
  return out;
}

// ===== XP / lygiai / ženkleliai =====
// Patikrinimo laikotarpis: savaitė (nuo pirmadienio) arba kalendorinis mėnuo
const periodKey = (type, d) => type === 'week' ? weekStart(d) : d.slice(0, 7);
// XP skaičiuojam tik už vieną patikrinimą per laikotarpį ir tik su serverio patvirtinta data
const countedCheckins = () => new Set(S.checkins.filter(c => c.verified !== false).map(c => c.type + '|' + (c.period || periodKey(c.type, c.date)))).size;
function gamification() {
  const tasksDone = S.tasks.filter(t => t.done).length;
  const daysLogged = new Set([...S.meals.map(m => m.date), ...S.timelog.map(t => t.date), ...S.sleep.map(s => s.date), ...S.workouts.map(w => w.date)]).size;
  const sleepGood = S.sleep.filter(s => Math.abs(sleepMinutes(s) / 60 - (+S.profile.sleepGoal || 8)) <= 0.75).length;
  const checkins = countedCheckins();
  const parts = {tasksDone, workouts: S.workouts.length, daysLogged, sleepGood, checkins, weights: S.weights.length, cooks: S.cooks.length};
  const xp = sum(XP_RULES.map(([k, , x]) => (parts[k] || 0) * x));
  const level = Math.floor(Math.sqrt(xp / 40)) + 1;
  const cur = (level - 1) ** 2 * 40, next = level ** 2 * 40;
  const lost = S.weights.length ? round((+S.profile.startWeight || S.weights[0].kg) - currentWeight(), 1) : 0;
  // serija: kiek dienų iš eilės kažkas įrašyta
  const logged = new Set([...S.meals.map(m => m.date), ...S.timelog.map(t => t.date), ...S.workouts.map(w => w.date), ...S.sleep.map(s => s.date)]);
  let streak = 0; for (let d = today(), i = 0; i < 1000; d = addDays(d, -1), i++) { if (logged.has(d)) streak++; else if (d !== today()) break; }
  const timeLogged = sum(S.timelog.map(t => { let m = toMin(t.end) - toMin(t.start); if (m <= 0) m += 1440; return m; }));
  const recipesEaten = new Set(S.meals.filter(m => m.recipeId).map(m => m.recipeId)).size;
  const sp = sportOn(), fo = foodOn(), body = sp || fo || S.weights.length;
  // [emoji, pavadinimas, aprašymas, gautas?, kada rodyti]
  const all = [
    ['📝','Pirmas įrašas','Įrašei pirmą dalyką', daysLogged >= 1, true],
    ['📅','Savaitės serija','7 dienos iš eilės su įrašais', streak >= 7, true],
    ['🗓️','Mėnesio serija','30 dienų iš eilės', streak >= 30, true],
    ['✅','Darbštuolis','10 padarytų reikalų', tasksDone >= 10, true],
    ['😴','Išsimiegojęs','10 naktų pagal miego tikslą', sleepGood >= 10, true],
    ['⏱️','Laiko meistras','20 val. užfiksuoto laiko', timeLogged >= 1200, true],
    ['🗂️','Planuotojas','5 įvykiai kalendoriuje', S.events.length >= 5, true],
    ['🪞','Refleksija','Pirmasis patikrinimas', checkins >= 1, true],
    ['💪','Pirmoji treniruotė','Įrašei treniruotę', S.workouts.length >= 1, sp],
    ['🏋️','Dešimtukas','10 treniruočių', S.workouts.length >= 10, sp],
    ['🦾','Geležinis','30 treniruočių', S.workouts.length >= 30, sp],
    ['🌱','Pirmas pasisvėrimas','Įrašei svorį', S.weights.length >= 1, body],
    ['📉','−1 kg','Numetei 1 kg', lost >= 1, body && +S.profile.goalRate > 0],
    ['🔥','−5 kg','Numetei 5 kg', lost >= 5, body && +S.profile.goalRate > 0],
    ['🏆','−10 kg','Numetei 10 kg', lost >= 10, body && +S.profile.goalRate > 0],
    ['🧊','Šaldiklio meistras','5 kartus pagaminai porcijų', S.cooks.length >= 5, fo],
    ['🌈','Įvairovė','Valgei 10 skirtingų receptų', recipesEaten >= 10, fo],
  ];
  const badges = all.filter(b => b[4] || b[3]).map(b => b.slice(0, 4));
  const title = [...LEVEL_TITLES].reverse().find(t => level >= t[0]);
  return {xp, level, cur, next, streak, badges, lost, title, parts};
}
const LEVEL_TITLES = [[1, '🌱', 'Pradedantysis'], [3, '🚶', 'Įsivažiuojantis'], [5, '🏃', 'Nuoseklus'], [8, '💪', 'Disciplinuotas'], [12, '🔥', 'Nesustabdomas'], [17, '🦾', 'Mašina'], [25, '👑', 'Legenda']];
// [raktas, pavadinimas, XP, kada rodyti]
const XP_RULES = [['daysLogged', '📖 Diena su įrašais', 5, 'all'], ['tasksDone', '✅ Padarytas reikalas', 10, 'all'], ['sleepGood', '😴 Naktis pagal miego tikslą (±45 min)', 10, 'all'], ['checkins', '🪞 Savaitės / mėnesio patikrinimas (1 per laikotarpį)', 30, 'all'], ['workouts', '💪 Treniruotė', 25, 'sport'], ['weights', '⚖️ Pasisvėrimas', 5, 'body'], ['cooks', '👨‍🍳 Pagamintas maistas', 15, 'food']];

// ===== SVG grafikai =====
function svgLine(series, opts = {}) {
  // series: [{points:[[x,y]], color, dashed}]
  const W = opts.w || 600, H = opts.h || 200, P = {l: 38, r: 10, t: 10, b: 24};
  const all = series.flatMap(s => s.points);
  if (all.length < 1) return `<div class="empty">Dar nėra duomenų grafikui</div>`;
  let xs = all.map(p => p[0]), ys = all.map(p => p[1]);
  let x0 = Math.min(...xs), x1 = Math.max(...xs); if (x0 === x1) { x0 -= 1; x1 += 1; }
  let y0 = Math.min(...ys), y1 = Math.max(...ys); const pd = (y1 - y0) * 0.15 || 1; y0 -= pd; y1 += pd;
  const X = x => P.l + (x - x0) / (x1 - x0) * (W - P.l - P.r), Y = y => H - P.b - (y - y0) / (y1 - y0) * (H - P.t - P.b);
  let g = '';
  for (let i = 0; i <= 4; i++) { const v = y0 + (y1 - y0) * i / 4; g += `<line x1="${P.l}" x2="${W - P.r}" y1="${Y(v)}" y2="${Y(v)}" class="grid"/><text x="${P.l - 5}" y="${Y(v) + 4}" class="ax" text-anchor="end">${round(v, 1)}</text>`; }
  if (opts.xLabels) for (const [x, l] of opts.xLabels) g += `<text x="${X(x)}" y="${H - 6}" class="ax" text-anchor="middle">${esc(l)}</text>`;
  for (const s of series) {
    if (!s.points.length) continue;
    const d = s.points.map((p, i) => `${i ? 'L' : 'M'}${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join('');
    if (s.area) g += `<path d="${d}L${X(s.points[s.points.length - 1][0])},${H - P.b}L${X(s.points[0][0])},${H - P.b}Z" fill="${s.color}" opacity=".12"/>`;
    g += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.width || 2.5}" ${s.dashed ? 'stroke-dasharray="6 5"' : ''} stroke-linejoin="round" stroke-linecap="round"/>`;
    if (s.dots !== false) for (const p of s.points) g += `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="3.5" fill="${s.color}"><title>${esc(p[2] || '')} ${p[1]}</title></circle>`;
  }
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" preserveAspectRatio="none">${g}</svg>`;
}
function svgBars(days, opts = {}) {
  // days: [{label, segs:[{v, color, name}], goal}]
  const W = opts.w || 600, H = opts.h || 200, P = {l: 34, r: 8, t: 10, b: 24};
  const max = Math.max(1, ...days.map(d => sum(d.segs.map(s => s.v))), opts.goal || 0) * 1.1;
  const bw = (W - P.l - P.r) / days.length;
  let g = '';
  for (let i = 0; i <= 4; i++) { const v = max * i / 4, y = H - P.b - v / max * (H - P.t - P.b); g += `<line x1="${P.l}" x2="${W - P.r}" y1="${y}" y2="${y}" class="grid"/><text x="${P.l - 4}" y="${y + 4}" class="ax" text-anchor="end">${opts.fmt ? opts.fmt(v) : round(v)}</text>`; }
  days.forEach((d, i) => {
    let y = H - P.b; const x = P.l + i * bw + bw * 0.15, w = bw * 0.7;
    for (const s of d.segs) { if (!s.v) continue; const h = s.v / max * (H - P.t - P.b); y -= h; g += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${s.color}"><title>${esc(d.label)} · ${esc(s.name || '')}: ${opts.fmt ? opts.fmt(s.v) : s.v}</title></rect>`; }
    if (days.length <= 31 && (days.length <= 14 || i % 2 === 0)) g += `<text x="${x + w / 2}" y="${H - 7}" class="ax" text-anchor="middle">${esc(d.label)}</text>`;
    if (d.click) g += `<rect x="${P.l + i * bw}" y="${P.t}" width="${bw}" height="${H - P.t - P.b}" fill="transparent" data-a="${d.click.a}" data-d="${d.click.d}" style="cursor:pointer"/>`;
  });
  if (opts.goal) { const y = H - P.b - opts.goal / max * (H - P.t - P.b); g += `<line x1="${P.l}" x2="${W - P.r}" y1="${y}" y2="${y}" stroke="var(--accent)" stroke-dasharray="5 4" stroke-width="1.5"/>`; }
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" preserveAspectRatio="none">${g}</svg>`;
}
function svgDonut(segs, center = '', sub = '') {
  const total = sum(segs.map(s => s.v)); const R = 60, C = 2 * Math.PI * R; let off = 0, g = '';
  if (!total) g = `<circle r="${R}" cx="80" cy="80" fill="none" stroke="var(--line)" stroke-width="22"/>`;
  for (const s of segs) { if (!s.v) continue; const L = s.v / total * C; g += `<circle r="${R}" cx="80" cy="80" fill="none" stroke="${s.color}" stroke-width="22" stroke-dasharray="${L} ${C - L}" stroke-dashoffset="${-off}" transform="rotate(-90 80 80)"><title>${esc(s.name)}: ${fmtDur(s.v)}</title></circle>`; off += L; }
  return `<svg viewBox="0 0 160 160" class="donut">${g}<text x="80" y="80" text-anchor="middle" class="dc">${esc(center)}</text><text x="80" y="100" text-anchor="middle" class="ds">${esc(sub)}</text></svg>`;
}
function ring(value, max, color, label, sub) {
  const R = 42, C = 2 * Math.PI * R, f = clamp(max ? value / max : 0, 0, 1);
  const over = max && value > max * 1.08;
  return `<div class="ring"><svg viewBox="0 0 100 100"><circle r="${R}" cx="50" cy="50" class="rbg"/><circle r="${R}" cx="50" cy="50" fill="none" stroke="${over ? '#f97316' : color}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${f * C} ${C}" transform="rotate(-90 50 50)" class="rfg"/></svg><div class="rin"><b>${esc(label)}</b><small>${esc(sub)}</small></div></div>`;
}
