// Life Schedule įkroviklis: parenka, kurią programėlės versiją užkrauti.
//  • paprastas naudotojas – viešą versiją (Supabase app_config „stable“, atsarginis variantas – releases.json)
//  • kūrėjas – gali pasirinkti kitą versiją (išsaugoma naršyklėje; ui.js patikrina rolę ir ne kūrėjui ją išvalo)
//  • testavimo serveris (Testuoti.bat) – darbinę kopiją iš src/
(async () => {
  const C = window.CLOUD || {};
  let rel = {stable: null, versions: []};
  try { rel = await (await fetch('releases.json', {cache: 'no-cache'})).json(); } catch (e) {}
  const exists = v => v === 'src' || (rel.versions || []).some(x => x.v === v);
  let pub = rel.stable;
  if (C.url && C.key && !C.test) {
    try {
      const r = await fetch(`${C.url}/rest/v1/app_config?key=eq.stable&select=value`, {headers: {apikey: C.key}, cache: 'no-store'});
      const j = r.ok ? await r.json() : [];
      const v = j[0] && j[0].value && j[0].value.version;
      if (v && exists(v)) pub = v;
    } catch (e) {}
  }
  let ver = pub;
  // ?v=1.2.0 nuorodoje – išbandyti versiją (galioja tik kūrėjui; ui.js kitiems atšaukia); ?v=public – grįžti į viešą
  try {
    const qv = new URLSearchParams(location.search).get('v');
    if (qv === 'public') localStorage.removeItem('ls_ver_override');
    else if (qv && exists(qv)) localStorage.setItem('ls_ver_override', qv);
    if (qv) history.replaceState(null, '', location.pathname);
  } catch (e) {}
  let ov = null; try { ov = localStorage.getItem('ls_ver_override'); } catch (e) {}
  if (C.test) ver = ov && exists(ov) ? ov : 'src';
  else if (ov && exists(ov)) ver = ov;
  if (!ver || !exists(ver)) ver = (rel.versions && rel.versions[0] && rel.versions[0].v) || 'src';
  window.APP_VERSION = ver; window.PUBLIC_VERSION = pub; window.RELEASES = rel;
  const base = ver === 'src' ? 'src/' : `v/${ver}/`;
  document.getElementById('appcss').href = base + 'style.css';
  for (const f of ['db.js', 'core.js', 'ui.js']) {
    await new Promise((ok, bad) => { const s = document.createElement('script'); s.src = base + f; s.onload = ok; s.onerror = bad; document.body.appendChild(s); });
  }
})().catch(e => { const m = document.getElementById('main'); if (m) m.innerHTML = '<div class="empty">Nepavyko užkrauti programėlės. Perkrauk puslapį.</div>'; console.error(e); });
