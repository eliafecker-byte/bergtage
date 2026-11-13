'use strict';
/* Bergtage – Oberfläche. Ansichten werden als HTML-Text gebaut; Klicks laufen über data-act. */

const $ = (s, r = document) => r.querySelector(s);

/* ---------- Icons (eine Linienstärke, 24er-Raster) ---------- */
const CLOUD_HI = '<path d="M7 14h10a4 4 0 0 0 .6-7.96A6 6 0 0 0 6.1 5.6 4.2 4.2 0 0 0 7 14z"/>';
const ICON = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  partly: '<path d="M8 3v1.5M3.3 5.3l1 1M1.5 10H3M12.7 5.3l-1 1M5.3 12.2A3.6 3.6 0 1 1 11.4 9"/><path d="M9.5 20h8a3.5 3.5 0 0 0 .5-6.96A5 5 0 0 0 8.6 12.6 3.7 3.7 0 0 0 9.5 20z"/>',
  cloud: '<path d="M7 18h10a4 4 0 0 0 .6-7.96A6 6 0 0 0 6.1 9.6 4.2 4.2 0 0 0 7 18z"/>',
  rain: CLOUD_HI + '<path d="M8.5 17l-1 3M12.5 17l-1 3M16.5 17l-1 3"/>',
  snow: CLOUD_HI + '<path d="M8 17.5v.01M12 17.5v.01M16 17.5v.01M10 21v.01M14 21v.01" stroke-width="2.4"/>',
  storm: CLOUD_HI + '<path d="M13 15l-3 3.5h3.5L11 22"/>',
  fog: '<path d="M5 8h14M3 12h18M6 16h12M9 20h6"/>',
  wind: '<path d="M3 9h10a2.5 2.5 0 1 0-2.5-2.5M3 13h15a2.5 2.5 0 1 1-2.5 2.5M3 17h7"/>',
  ski: '<path d="M5 3l12 17a2 2 0 0 0 2.6.5M19 3L7 20a2 2 0 0 1-2.6.5"/>',
  bike: '<circle cx="5.5" cy="16.5" r="3.5"/><circle cx="18.5" cy="16.5" r="3.5"/><path d="M5.5 16.5l4-8h6l3 8M5.5 16.5H12l3.5-8M9.5 8.5l2.5 8M9.5 8.5l-.8-3M7.5 5.5h3M15.5 8.5l-1-3H17"/>',
  peak: '<path d="M2 19l6.5-11 3.5 5 2.5-3.5L22 19z"/>',
  calendar: '<path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4"/>',
  ticket: '<path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4zM14 7v10" />',
  users: '<path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3 2.7-5 6-5s6 2 6 5M16 5.2a3 3 0 0 1 0 5.6M18 15.3c1.8.7 3 2.3 3 4.7"/>',
  chart: '<path d="M4 4v16h16M8 16v-4M12 16V8M16 16v-6"/>',
  sliders: '<path d="M4 7h8M16 7h4M4 17h4M12 17h8"/><circle cx="14" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  right: '<path d="M9 5l7 7-7 7"/>', left: '<path d="M15 5l-7 7 7 7"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
  star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.8z"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5"/>',
  copy: '<path d="M9 9h11v11H9zM5 15H4V4h11v1"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
  download: '<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/>',
};
const ic = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON[n] || ''}</svg>`;
const TRI_UP = '<svg viewBox="0 0 8 8" aria-hidden="true"><path d="M4 0l4 8H0z"/></svg>';
const TRI_DOWN = '<svg viewBox="0 0 8 8" aria-hidden="true"><path d="M4 8L0 0h8z"/></svg>';

/* ---------- kleine Bausteine ---------- */
const tf = v => v == null ? '–' : `${Math.round(v) < 0 ? '−' : ''}${Math.abs(Math.round(v))}°`;
const sign = (lvl, sm) => `<span class="sign ${lvl ? 'sign--' + lvl : ''} ${sm ? 'sign--sm' : ''}">${lvl ? RATE_LABEL[lvl] : '…'}</span>`;
const crowdTag = c => `<span class="crowd"><span class="pdot pdot--${c.level}"></span>${CROWD_LABEL[c.level]}</span>`;
const typeIc = t => `<span class="type-ic ${t === 'bike' ? 'bike' : ''}">${ic(t === 'bike' ? 'bike' : 'ski')}</span>`;
const safeColor = c => /^#[0-9a-f]{6}$/i.test(c || '') ? c : '#5D6D7E';
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const relDay = d => d === todayISO() ? 'Heute' : d === addDays(todayISO(), 1) ? 'Morgen' : d === addDays(todayISO(), -1) ? 'Gestern' : fmtDate(d);
const elev = r => `${num(r.base)}–${num(r.top)} m`;

/* ---------- Zustand der Oberfläche ---------- */
const TABS = [['gebiete', 'Gebiete', 'peak'], ['kalender', 'Kalender', 'calendar'], ['topcard', 'TopCard', 'ticket'], ['gruppen', 'Gruppen', 'users'], ['statistik', 'Statistik', 'chart']];
const UI = { tab: 'gebiete', sheet: null, sheetAnim: false, calMonth: todayISO().slice(0, 7), group: null, groups: {}, groupSort: 'ski',
  groupMsg: '', joinCode: '', tcAnim: true, statSeason: null, syncErr: '', groupsAt: 0, toastFn: null, leaveArm: false };
const NEED = new Set();
const need = r => { (Array.isArray(r) ? r : [r]).forEach(x => x && NEED.add(x)); };

/* ---------- Zeichnen ---------- */
let lastLook = '';
function applyLook() {
  const root = document.documentElement;
  const theme = S.theme === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : S.theme;
  root.dataset.theme = theme; root.dataset.mode = S.mode;
  const key = theme + S.mode;
  if (key !== lastLook) { lastLook = key; drawTopo(); const m = $('meta[name="theme-color"]'); if (m) m.content = getComputedStyle(root).getPropertyValue('--bar').trim(); }
}
function render() {
  applyLook();
  $('#mode').innerHTML = ['ski', 'bike'].map(m => `<button data-act="mode" data-m="${m}" aria-pressed="${S.mode === m}">${ic(m)}${m === 'ski' ? 'Ski' : 'Bike'}</button>`).join('');
  $('#tabs').innerHTML = TABS.map(([k, l, i]) => `<button data-act="tab" data-t="${k}" ${UI.tab === k ? 'aria-current="page"' : ''}>${ic(i)}<span>${l}</span></button>`).join('');
  $('#view').innerHTML = VIEW[UI.tab]();
  after();
}
function after() {
  const sc = $('.scale');
  if (sc && UI.tcAnim) { UI.tcAnim = false; setTimeout(() => sc.classList.add('is-in'), 60); }
  ensureWeather([...NEED]); NEED.clear();
}
function ensureWeather(list) {
  for (const r of list) {
    if (Weather.isFresh(r) || Weather.pending[r.id] || Weather.failed[r.id]) continue;
    Weather.load(r).then(soon, soon);
  }
}
let soonT = null;
function soon() {
  clearTimeout(soonT);
  soonT = setTimeout(() => {
    const a = document.activeElement;
    if (a && /INPUT|SELECT|TEXTAREA/.test(a.tagName) && $('#view').contains(a)) { soon(); return; }   // nicht mitten im Tippen neu zeichnen
    render();
    if (UI.sheet && (UI.sheet.type === 'resort' || UI.sheet.type === 'day' || UI.sheet.type === 'member')) renderSheet();
  }, a11yDelay());
}
const a11yDelay = () => 90;

function toast(msg, actLabel, fn) {
  UI.toastFn = fn || null;
  $('#toast').innerHTML = `<div class="t"><span>${esc(msg)}</span>${actLabel ? `<button data-act="toast-act">${esc(actLabel)}</button>` : ''}</div>`;
  clearTimeout(toast.t); toast.t = setTimeout(() => { $('#toast').innerHTML = ''; }, fn ? 6500 : 3200);
}

/* ---------- Blätter ---------- */
const SHEET = {};
function openSheet(type, data = {}) { UI.sheet = { type, ...data }; UI.sheetAnim = true; renderSheet(); }
function closeSheet() { UI.sheet = null; renderSheet(); render(); }
function renderSheet() {
  const root = $('#sheet-root');
  if (!UI.sheet) { root.innerHTML = ''; document.body.classList.remove('sheet-open'); return; }
  const old = $('.sheet-body', root), top = old ? old.scrollTop : 0;
  const { title, body, foot } = SHEET[UI.sheet.type](UI.sheet);
  root.innerHTML = `<div class="scrim" data-act="close-sheet"></div>
    <section class="sheet ${UI.sheetAnim ? 'anim' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <header class="sheet-head"><h2>${esc(title)}</h2><button class="icon-btn" data-act="close-sheet" aria-label="Schliessen">${ic('x')}</button></header>
      <div class="sheet-body">${body}</div>${foot ? `<footer class="sheet-foot">${foot}</footer>` : ''}
    </section>`;
  document.body.classList.add('sheet-open');
  if (!UI.sheetAnim) $('.sheet-body', root).scrollTop = top;
  UI.sheetAnim = false;
  ensureWeather([...NEED]); NEED.clear();
}

/* =====================================================================
   1 · Gebiete mit Wetter, Schnee, Andrang und Ampel
   ===================================================================== */
const VIEW = {};
VIEW.gebiete = () => {
  const favs = favResorts(S.mode), t = todayISO(), d = new Date();
  need(favs);
  let best = null;
  for (const r of favs) {
    const w = Weather.cached(r); if (!w) continue;
    for (let i = 0; i < 7; i++) { const dd = addDays(t, i), rt = rate(r, dd, w); if (rt && (!best || rt.score > best.rt.score)) best = { r, d: dd, rt }; }
  }
  const line = !favs.length ? '' : !best ? 'Wetter wird geladen …'
    : best.rt.level === 'no' ? 'In den nächsten sieben Tagen ist bei deinen Favoriten kein guter Tag in Sicht.'
    : `Beste Aussicht: <b>${best.d === t ? 'heute' : WD_LONG[parseISO(best.d).getDay()]} in ${esc(best.r.name)}</b> – ${RATE_LABEL[best.rt.level]}.`;
  const hol = holidayName(t), fer = schoolHoliday(t);
  return `<section class="lead">
      <p class="eyebrow">${WD[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()} · KW ${isoWeek(d)}${hol ? ' · ' + hol : fer && fer.w >= .5 ? ' · ' + fer.name : ''}</p>
      <h1>${S.mode === 'ski' ? 'Skigebiete' : 'Bikeparks'}</h1>
      <p class="lead-note">${line}</p>
    </section>
    ${favs.length ? `<div class="resorts">${favs.map(resortCard).join('')}</div>` : `<div class="empty"><h3>Noch keine ${S.mode === 'ski' ? 'Skigebiete' : 'Bikeparks'} gewählt</h3><p>Wähle deine Gebiete aus der Liste. Für jedes siehst du hier Wetter, ${S.mode === 'ski' ? 'Schnee' : 'Trail-Zustand'}, Andrang und die Ampel.</p></div>`}
    <button class="add-tile" data-act="picker">${ic('plus')} Gebiet hinzufügen</button>
    <p class="fine">Wetter und Schnee sind Modellwerte von Open-Meteo, keine Messungen der Bergbahnen. Der Andrang ist eine Schätzung aus Wochentag, Ferien, Feiertagen, Wetter und Gebietsgrösse. Ob Anlagen geöffnet sind, weiss die App nicht.</p>`;
};

function kpisFor(r, w, d) {
  const x = wxDay(w, d), cr = crowd(r, d, w);
  const crowdKpi = `<span class="kpi"><b class="fig fig--word"><span class="pdot pdot--${cr.level}"></span>${{ low: 'wenig', mid: 'mittel', high: 'viel' }[cr.level]}</b><i class="lab">Andrang, geschätzt</i></span>`;
  if (r.type === 'ski') return `
    <span class="kpi"><b class="fig">${tf(x.tTopMax)}</b><i class="lab">Berg</i></span>
    <span class="kpi"><b class="fig">${x.depth == null ? '–' : num(x.depth)}<small>cm</small></b><i class="lab">Schnee</i></span>
    <span class="kpi"><b class="fig">${num(freshSnow(w, d, 2))}<small>cm</small></b><i class="lab">Neu 48 h</i></span>${crowdKpi}`;
  const tr = trailState(w, d);
  return `
    <span class="kpi"><b class="fig">${tf(x.tTopMax)}</b><i class="lab">Berg</i></span>
    <span class="kpi"><b class="fig">${num(rainPast(w, d, 3) + x.precip)}<small>mm</small></b><i class="lab">Regen 3 Tage</i></span>
    <span class="kpi"><b class="fig fig--word">${tr.label}</b><i class="lab">Trails</i></span>${crowdKpi}`;
}
function stripDay(r, w, d, tag = 'span', extra = '') {
  const x = wxDay(w, d), rt = rate(r, d, w), dow = parseISO(d).getDay();
  if (!x) return '';
  return `<${tag} class="sd sd--${rt.level} ${dow === 0 || dow === 6 ? 'is-we' : ''}" ${extra} title="${RATE_LABEL[rt.level]} · ${WMO(x.code)[1]}"><i>${WD[dow]}</i>${ic(WMO(x.code)[0])}<b>${tf(x.tTopMax)}</b></${tag}>`;
}
function resortCard(r) {
  const w = Weather.cached(r), t = todayISO(), x = wxDay(w, t), rt = x ? rate(r, t, w) : null;
  const mine = S.days.find(e => e.resortId === r.id && e.date === t && e.status === 'done');
  let mid;
  if (x) mid = `<span class="kpis">${kpisFor(r, w, t)}</span><span class="strip">${Array.from({ length: 7 }, (_, i) => stripDay(r, w, addDays(t, i))).join('')}</span>`;
  else if (Weather.failed[r.id]) mid = `<span class="rc-state">Wetter nicht erreichbar. Prüfe die Internetverbindung.</span>`;
  else mid = `<span class="rc-state">Wetter wird geladen …</span>`;
  return `<article class="rc">
    <button class="rc-main" data-act="open-resort" data-id="${esc(r.id)}" aria-label="${esc(r.name)}: Details öffnen">
      <span class="rc-head">
        <span class="rc-title">${sign(rt && rt.level)}<span class="rc-name">${esc(r.name)}</span>
          <span class="rc-sub">${esc(r.region)} · ${esc(r.cc)}${r.topcard ? ' <span class="tag">TopCard</span>' : ''}</span></span>
        <span class="rc-elev"><span>${TRI_UP}${num(r.top)} m</span><span>${TRI_DOWN}${num(r.base)} m</span></span>
      </span>${mid}
    </button>
    <div class="rc-actions">
      ${mine ? `<button class="btn btn--solid" data-act="edit-entry" data-id="${mine.id}">${ic('check')} Heute eingetragen</button>`
        : `<button class="btn btn--primary" data-act="was-there" data-id="${esc(r.id)}">${ic('check')} War da</button>`}
      <button class="btn" data-act="plan" data-id="${esc(r.id)}">${ic('calendar')} Planen</button>
      <span class="spacer"></span>
      ${Weather.failed[r.id] ? `<button class="btn btn--ghost" data-act="retry-wx" data-id="${esc(r.id)}">Erneut laden</button>` : `<button class="icon-btn" data-act="open-resort" data-id="${esc(r.id)}" aria-label="Details zu ${esc(r.name)}">${ic('right')}</button>`}
    </div>
  </article>`;
}

SHEET.resort = sh => {
  const r = resortById(sh.id), w = Weather.cached(r), t = todayISO(), d = sh.d || t;
  need(r);
  const x = wxDay(w, d);
  if (!x) return { title: r.name, body: `<p class="muted">${Weather.failed[r.id] ? 'Wetter nicht erreichbar.' : 'Wetter wird geladen …'}</p>${removeFavBtn(r)}` };
  const rt = rate(r, d, w), cr = rt.crowd, pr = pricesFor(r), cat = priceCat(d, r.type);
  const dates = Object.keys(w.days).filter(k => k >= t).slice(0, 14);
  const f = (v, l) => `<div class="f"><b class="fig">${v}</b><i class="lab">${l}</i></div>`;
  const fw = (v, l) => `<div class="f"><b class="fig fig--word">${v}</b><i class="lab">${l}</i></div>`;
  let figs = f(`${tf(x.tTopMax)}<small>/ ${tf(x.tTopMin)}</small>`, `Berg ${num(r.top)} m`) + f(`${tf(x.tBaseMax)}<small>/ ${tf(x.tBaseMin)}</small>`, `Tal ${num(r.base)} m`);
  if (r.type === 'ski') {
    figs += f(`${x.depth == null ? '–' : num(x.depth)}<small>cm</small>`, 'Schneehöhe') + f(`${num(x.snow)}<small>cm</small>`, d === t ? 'Neuschnee heute' : 'Neuschnee am Tag')
      + f(`${num(freshSnow(w, d, 2))}<small>cm</small>`, 'Neuschnee 48 h') + f(`${num(freshSnow(w, d, 3))}<small>cm</small>`, 'Neuschnee 72 h');
  } else {
    const tr = trailState(w, d);
    figs += f(`${num(x.precip, 1)}<small>mm</small>`, d === t ? 'Regen heute' : 'Regen am Tag') + f(`${num(rainPast(w, d, 3), 1)}<small>mm</small>`, 'Regen 3 Vortage') + fw(tr.label, 'Trail-Zustand');
  }
  figs += f(`${num(x.sunH, 1)}<small>h</small>`, 'Sonne') + f(`${x.cloud == null ? '–' : num(x.cloud)}<small>%</small>`, 'Bewölkung')
    + f(`${num(x.wind)}<small>km/h</small>`, 'Wind') + f(`${num(x.gust)}<small>km/h</small>`, 'Böen')
    + (r.type === 'ski' ? f(`${num(x.precip, 1)}<small>mm</small>`, 'Niederschlag') : '');
  const priceCell = k => `<div class="${k === cat ? 'is-now' : ''}"><i class="lab">${PRICE_CAT[k]}</i><b class="fig">${num(pr[k])}</b>${pr.src[k] === 'est' ? '<span class="tag tag--est">geschätzt</span>' : pr.src[k] === 'user' ? '<span class="tag">angepasst</span>' : '<span class="tag">recherchiert</span>'}</div>`;
  const body = `
    <div class="sect">
      <div class="d-top">${sign(rt.level)}${crowdTag(cr)}<span class="muted">${WMO(x.code)[1]}</span>${r.topcard ? '<span class="tag">TopCard</span>' : r.partner ? '<span class="tag tag--est">TopCard-Wahltage prüfen</span>' : ''}</div>
      <p class="d-meta">${esc(r.region)} · ${esc(COUNTRY_NAMES[r.cc] || r.cc)} · ${r.lat.toFixed(2)}° N, ${r.lon.toFixed(2)}° O</p>
    </div>
    <div class="daypick" role="group" aria-label="Tag wählen">${dates.map(k => stripDay(r, w, k, 'button', `data-act="pick-day" data-d="${k}" aria-pressed="${k === d}"`)).join('')}</div>
    <section class="sect">
      <h3>${relDay(d)}${d === t && w.now.tTop != null ? ` · jetzt ${tf(w.now.tTop)} am Berg` : ''}</h3>
      <div class="figs">${figs}</div>
    </section>
    <section class="sect">
      <h3>Warum ${RATE_LABEL[rt.level]}?</h3>
      <ul class="why">${rt.why.length ? rt.why.map(y => `<li><span class="pm ${y.n > 0 ? 'plus' : 'minus'}">${y.n > 0 ? '+' : '−'}</span>${esc(y.t)}</li>`).join('') : '<li>Durchschnittliche Bedingungen ohne Ausreisser.</li>'}</ul>
    </section>
    <section class="sect">
      <div class="sect-head"><h3>Andrang</h3><span class="tag tag--est">Schätzung</span></div>
      <div class="d-top">${crowdTag(cr)}</div>
      <div class="meter" aria-hidden="true"><span style="width:${cr.score}%"></span></div>
      <div class="chips">${cr.why.map(y => `<span class="chip chip--static">${esc(y)}</span>`).join('')}</div>
      <p class="fine">Berechnet aus Wochentag, Schweizer Feiertagen und Schulferien, Wetter und Grösse des Gebiets. Es sind keine echten Besucherzahlen.</p>
    </section>
    <section class="sect">
      <div class="sect-head"><h3>Tageskarte · Richtpreis CHF</h3><button class="link" data-act="settings">Preise anpassen</button></div>
      <div class="ptable">${['wd', 'we', 'hs'].map(priceCell).join('')}</div>
      <p class="fine">${relDay(d)} gilt: ${PRICE_CAT[cat]}, ${chf(pr[cat])}.${pr.note ? ' Quelle: ' + esc(pr.note) + '.' : ''}</p>
    </section>
    <p class="fine">Wetterdaten: Open-Meteo, Stand ${new Date(w.at).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })} Uhr. Schneehöhe ist ein Modellwert für die Gitterzelle des Gebiets.</p>
    ${removeFavBtn(r)}`;
  const foot = d <= t
    ? `<button class="btn btn--primary grow" data-act="was-there" data-id="${esc(r.id)}" data-d="${d}">${ic('check')} War da</button><button class="btn" data-act="plan" data-id="${esc(r.id)}">${ic('calendar')} Planen</button>`
    : `<button class="btn btn--primary grow" data-act="plan" data-id="${esc(r.id)}" data-d="${d}">${ic('calendar')} ${fmtDate(d)} planen</button>`;
  return { title: r.name, body, foot };
};
const removeFavBtn = r => `<div><button class="btn btn--danger" data-act="unfav" data-id="${esc(r.id)}">${ic('trash')} Aus Favoriten entfernen</button></div>`;

/* ---------- Gebietsauswahl ---------- */
SHEET.picker = sh => ({
  title: 'Gebiete auswählen',
  body: `
    <div class="field"><label for="pq">Suche</label><input id="pq" type="search" placeholder="Name, Region oder Land" value="${esc(sh.q)}" data-in="picker-q" autocomplete="off"></div>
    <div class="seg seg--wide">${['ski', 'bike'].map(m => `<button data-act="picker-type" data-m="${m}" aria-pressed="${sh.ptype === m}">${ic(m)} ${m === 'ski' ? 'Skigebiete' : 'Bikeparks'}</button>`).join('')}</div>
    <div class="chips">${[['', 'Alle'], ['CH', 'Schweiz'], ['AT', 'Österreich'], ['DE', 'Deutschland'], ['FR', 'Frankreich'], ['IT', 'Italien'], ['XX', 'Weitere']].map(([k, l]) => `<button class="chip" data-act="picker-cc" data-cc="${k}" aria-pressed="${sh.cc === k}">${l}</button>`).join('')}</div>
    <div id="picker-list">${pickerList(sh)}</div>`,
  foot: `<button class="btn btn--primary grow" data-act="close-sheet">Fertig</button>`,
});
function pickerList(sh) {
  const q = norm(sh.q.trim()), main5 = ['CH', 'AT', 'DE', 'FR', 'IT'];
  let list = allResorts().filter(r => r.type === sh.ptype
    && (!sh.cc || (sh.cc === 'XX' ? !main5.includes(r.cc) : r.cc === sh.cc))
    && (!q || norm(`${r.name} ${r.region} ${COUNTRY_NAMES[r.cc] || ''}`).includes(q)));
  const total = list.length; list = list.slice(0, 80);
  const rows = list.map(r => { const on = S.favs.includes(r.id); return `<div class="prow"><div><b>${esc(r.name)}</b><span>${esc(r.region)} · ${esc(COUNTRY_NAMES[r.cc] || r.cc)} · ${elev(r)}${r.topcard ? ' · TopCard' : ''}${r.custom ? ' · eigenes Gebiet' : ''}</span></div>
      <button class="icon-btn star" data-act="toggle-fav" data-id="${esc(r.id)}" aria-pressed="${on}" aria-label="${on ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}">${ic('star')}</button></div>`; }).join('');
  let geo = '';
  if (sh.geo === 'loading') geo = '<p class="hint">Suche läuft …</p>';
  else if (sh.geo && sh.geo.error) geo = `<p class="note note--bad">${esc(sh.geo.error)}</p>`;
  else if (sh.geo && sh.geo.results) geo = sh.geo.results.length ? `<div class="list">${sh.geo.results.map((g, i) => `<div class="prow"><div><b>${esc(g.name)}</b><span>${esc([g.admin1, g.country].filter(Boolean).join(' · '))}${g.elevation != null ? ' · ' + num(g.elevation) + ' m' : ''}</span></div><button class="btn" data-act="geo-pick" data-i="${i}">Hinzufügen</button></div>`).join('')}</div>` : '<p class="hint">Kein Ort mit diesem Namen gefunden.</p>';
  return `<div class="sect">
      <p class="eyebrow">${total} ${sh.ptype === 'ski' ? (total === 1 ? 'Skigebiet' : 'Skigebiete') : (total === 1 ? 'Bikepark' : 'Bikeparks')}${total > 80 ? ' · die ersten 80, Suche verfeinern' : ''}</p>
      ${rows ? `<div class="list">${rows}</div>` : '<p class="hint">Kein Gebiet in der Liste passt zur Suche.</p>'}
    </div>
    <div class="sect" style="margin-top:18px">
      <h3>Nicht in der Liste?</h3>
      <p class="hint">Suche den Ort oder Berg weltweit und füge ihn als eigenes Gebiet hinzu. Höhe und Typ kannst du danach anpassen.</p>
      <div><button class="btn" data-act="geo-search" ${sh.q.trim().length < 2 ? 'disabled' : ''}>${ic('search')} ${sh.q.trim().length < 2 ? 'Erst oben einen Namen eingeben' : `„${esc(sh.q.trim())}“ als Ort suchen`}</button></div>
      ${geo}
    </div>`;
}
SHEET.custom = sh => {
  const c = sh.c;
  return { title: 'Eigenes Gebiet', body: `
    <div class="field"><label for="cn">Name</label><input id="cn" type="text" value="${esc(c.name)}" data-in="c" data-k="name"></div>
    <div class="field"><span class="flabel">Typ</span><div class="seg seg--wide">${['ski', 'bike'].map(m => `<button data-act="c-type" data-m="${m}" aria-pressed="${c.type === m}">${ic(m)} ${m === 'ski' ? 'Skigebiet' : 'Bikepark'}</button>`).join('')}</div></div>
    <div class="row2">
      <div class="field"><label for="cb">Höhe Tal (m)</label><input id="cb" type="number" inputmode="numeric" value="${esc(c.base)}" data-in="c" data-k="base"></div>
      <div class="field"><label for="ct">Höhe Berg (m)</label><input id="ct" type="number" inputmode="numeric" value="${esc(c.top)}" data-in="c" data-k="top"></div>
    </div>
    <div class="field"><label for="cs">Grösse und Beliebtheit</label><select id="cs" data-in="c" data-k="size">${[[1, 'klein, lokal'], [2, 'eher klein'], [3, 'mittel'], [4, 'gross'], [5, 'sehr gross, sehr beliebt']].map(([v, l]) => `<option value="${v}" ${+c.size === v ? 'selected' : ''}>${l}</option>`).join('')}</select><span class="hint">Fliesst in die Andrang-Schätzung ein.</span></div>
    <p class="d-meta">${(+c.lat).toFixed(3)}° N, ${(+c.lon).toFixed(3)}° O · ${esc([c.region, c.cc].filter(Boolean).join(' · '))}</p>
    ${sh.err ? `<p class="note note--bad">${esc(sh.err)}</p>` : ''}`,
    foot: `<button class="btn btn--primary grow" data-act="c-save">${ic('plus')} Zu Favoriten hinzufügen</button>` };
};

/* =====================================================================
   Tageseintrag (geplant oder „War da“), inkl. Kilometer und GPX
   ===================================================================== */
const newDraft = (o = {}) => ({ id: null, date: todayISO(), resortId: null, type: S.mode, status: 'done', topcard: false, price: null, km: '', hm: '', runs: '', note: '', ...o });
function openEntry(e, extra = {}) {
  const d = { ...newDraft(), ...e };
  ['km', 'hm', 'runs'].forEach(k => { if (!d[k]) d[k] = ''; });
  openSheet('entry', { e: d, isNew: !e.id, ...extra });
}
function applyGpx(e, g, isNew) {
  const r0 = resortById(e.resortId), type = r0 ? r0.type : e.type;
  if (isNew && g.date) e.date = g.date;
  if (!e.resortId) { const nr = nearestResort(g.lat, g.lon, type) || nearestResort(g.lat, g.lon); if (nr) { e.resortId = nr.id; e.type = nr.type; e.topcard = nr.topcard; } }
  const t = (resortById(e.resortId) || {}).type || type;
  e.km = ((t === 'ski' ? g.kmDown : g.km)).toFixed(1); e.hm = String(Math.round(g.down)); e.runs = String(g.runs); e.status = 'done';
  return g;
}
SHEET.entry = sh => {
  const e = sh.e, r = resortById(e.resortId), t = todayISO();
  const favs = favResorts(), opt = x => `<option value="${esc(x.id)}" ${x.id === e.resortId ? 'selected' : ''}>${esc(x.name)}</option>`;
  const extra = r && !favs.includes(r) ? [r] : [];
  const auto = r ? dayPrice(r, e.date) : null;
  let fc = '';
  if (r && e.date >= t) {
    need(r); const w = Weather.cached(r), x = wxDay(w, e.date);
    if (x) { const rt = rate(r, e.date, w); fc = `<div class="note"><span class="fc">${sign(rt.level, true)} ${ic(WMO(x.code)[0])} ${tf(x.tTopMax)} am Berg ${crowdTag(rt.crowd)}</span><span class="hint">Vorschau für ${fmtDate(e.date)}. Andrang ist eine Schätzung.</span></div>`; }
    else { const cr = crowd(r, e.date, null); fc = `<div class="note"><span class="fc">${crowdTag(cr)}</span><span class="hint">Andrang-Schätzung nach Kalender. Die Wettervorschau reicht 14 Tage weit.</span></div>`; }
  }
  const g = sh.gpx;
  const done = e.status === 'done';
  const body = `
    <div class="seg seg--wide">${[['plan', 'Geplant', 'calendar'], ['done', 'War da', 'check']].map(([k, l, i]) => `<button data-act="e-status" data-s="${k}" aria-pressed="${e.status === k}">${ic(i)} ${l}</button>`).join('')}</div>
    <div class="row2">
      <div class="field"><label for="ed">Datum</label><input id="ed" type="date" value="${esc(e.date)}" data-ch="e" data-k="date"></div>
      <div class="field"><label for="er">Gebiet</label><select id="er" data-ch="e-resort">
        ${r ? '' : '<option value="">Gebiet wählen …</option>'}
        ${extra.map(opt).join('')}
        <optgroup label="Ski">${favs.filter(x => x.type === 'ski').map(opt).join('')}</optgroup>
        <optgroup label="Bike">${favs.filter(x => x.type === 'bike').map(opt).join('')}</optgroup>
      </select></div>
    </div>
    ${fc}
    ${done ? `
    <section class="sect">
      <label class="switch"><input type="checkbox" ${e.topcard ? 'checked' : ''} data-ch="e-topcard"> Mit TopCard gefahren</label>
      ${e.topcard ? `<div class="field"><label for="ep">Wert der Tageskarte (CHF)</label>
        <input id="ep" type="number" inputmode="decimal" min="0" step="1" value="${e.price != null ? esc(e.price) : ''}" placeholder="${auto ? auto.price : ''}" data-in="e" data-k="price">
        <span class="hint">${auto ? `Automatisch: ${PRICE_CAT[auto.cat]}, ${chf(auto.price)}${auto.src === 'est' ? ' (geschätzt)' : ''}. Leer lassen übernimmt diesen Wert.` : 'Wähle ein Gebiet, dann schlägt die App den Preis vor.'}</span></div>`
        : `<span class="hint">${r && r.partner ? 'Partnergebiet: Wenn du hier einen TopCard-Wahltag eingelöst hast, schalte die Option ein.' : 'Eingeschaltet zählt der Tag für den TopCard-Rechner.'}</span>`}
    </section>
    <section class="sect">
      <h3>Kilometer und Höhenmeter</h3>
      <div class="row3">
        <div class="field"><label for="ekm">${(r ? r.type : e.type) === 'ski' ? 'Pisten-km' : 'Kilometer'}</label><input id="ekm" type="number" inputmode="decimal" min="0" step="0.1" value="${esc(e.km)}" data-in="e" data-k="km"></div>
        <div class="field"><label for="ehm">Hm Abfahrt</label><input id="ehm" type="number" inputmode="numeric" min="0" step="10" value="${esc(e.hm)}" data-in="e" data-k="hm"></div>
        <div class="field"><label for="eru">Abfahrten</label><input id="eru" type="number" inputmode="numeric" min="0" step="1" value="${esc(e.runs)}" data-in="e" data-k="runs"></div>
      </div>
      ${g ? `<div class="gpx-box"><b>GPX ausgewertet${sh.gpxName ? ': ' + esc(sh.gpxName) : ''}</b><span>${num(g.km, 1)} km Strecke, davon ${num(g.kmDown, 1)} km bergab · ${num(g.down)} Hm Abfahrt · ${num(g.up)} Hm Aufstieg/Lift · ${g.runs} Abfahrten${g.maxSpeed ? ` · max. ${num(g.maxSpeed)} km/h` : ''}${g.maxEle != null ? ` · höchster Punkt ${num(g.maxEle)} m` : ''}</span><span class="hint">Die Werte stehen in den Feldern und lassen sich korrigieren.</span></div>` : ''}
      ${sh.gpxErr ? `<p class="note note--bad">${esc(sh.gpxErr)}</p>` : ''}
      <div><label class="btn filebtn">${ic('upload')} GPX-Datei auswerten<input type="file" accept=".gpx,application/gpx+xml,text/xml,application/xml" data-ch="gpx" aria-label="GPX-Datei auswählen"></label></div>
    </section>` : ''}
    <div class="field"><label for="en">Notiz</label><input id="en" type="text" value="${esc(e.note)}" data-in="e" data-k="note" placeholder="${done ? 'z. B. Pulver am Rothorn' : 'z. B. erste Gondel, Treffpunkt 8 Uhr'}"></div>
    <p class="hint">Fehlt ein Gebiet in der Auswahl? Füge es zuerst unter „Gebiete“ zu den Favoriten hinzu.</p>
    ${sh.err ? `<p class="note note--bad">${esc(sh.err)}</p>` : ''}`;
  const foot = `${e.id ? `<button class="btn btn--danger" data-act="del-entry">${ic('trash')} Löschen</button>` : ''}<button class="btn btn--primary grow" data-act="save-entry">Speichern</button>`;
  return { title: e.id ? 'Tag bearbeiten' : done ? 'Tag eintragen' : 'Tag planen', body, foot };
};

/* =====================================================================
   3 · TopCard-Rechner
   ===================================================================== */
VIEW.topcard = () => {
  const sk = currentSeason(), [from, to] = seasonRange(sk), price = S.topcard.price;
  const days = S.days.filter(e => e.status === 'done' && e.topcard && e.date >= from && e.date <= to).sort((a, b) => b.date.localeCompare(a.date));
  const value = days.reduce((s, e) => s + entryPrice(e), 0), n = days.length, avg = n ? value / n : 0;
  const head = `<section class="lead"><p class="eyebrow">Saison ${seasonLabel(sk)} · 1. Mai bis 30. April</p><h1>Lohnt sich die TopCard?</h1></section>`;
  const included = `<p class="fine">In der TopCard enthalten: Arosa Lenzerheide, Davos Klosters und LAAX, im Winter und im Sommer inklusive Biketransport. Für Wahltage in Partnergebieten schaltest du beim Eintrag „Mit TopCard gefahren“ von Hand ein.</p>`;
  if (!price) return `${head}
    <div class="empty"><h3>Was hat deine TopCard gekostet?</h3>
      <p>Trage den Preis ein, den du bezahlt hast. Danach rechnet die App jeden „War da“-Tag gegen diesen Betrag.</p>
      <div class="inline" style="width:min(100%,340px)"><input id="tc-setup" type="number" inputmode="decimal" min="0" step="1" placeholder="Preis in CHF" aria-label="TopCard-Preis in CHF"><button class="btn btn--primary" data-act="tc-save">Speichern</button></div>
    </div>
    ${n ? `<p class="lead-note">Bisher ${n} ${n === 1 ? 'Tag' : 'Tage'} mit Tageskarten im Wert von <b>${chf(value)}</b>.</p>` : ''}${included}`;

  const raw = Math.max(price * 1.25, value * 1.06), stepMax = raw <= 1500 ? 250 : raw <= 4000 ? 500 : 1000;
  const max = Math.ceil(raw / stepMax) * stepMax, pct = v => (v / max * 100).toFixed(2) + '%';
  const ticks = []; for (let v = 0; v <= max; v += stepMax) ticks.push(`<span style="left:${pct(v)}">${num(v)}</span>`);
  const diff = value - price;
  const verdict = diff >= 0
    ? `Die Karte hat sich gelohnt. <b class="won">${chf(diff)} gespart</b>`
    : `Noch <b>${chf(-diff)}</b> bis zum Break-even${n ? `, das ist etwa ${Math.ceil(-diff / avg) === 1 ? 'ein weiterer Tag' : Math.ceil(-diff / avg) + ' weitere Tage'}` : ''}.`;
  const byRes = {};
  days.forEach(e => { const r = resortById(e.resortId), k = r ? r.name : (e.resortName || 'Unbekannt'); (byRes[k] = byRes[k] || { n: 0, v: 0, type: e.type }).n++; byRes[k].v += entryPrice(e); });
  const resRows = Object.entries(byRes).sort((a, b) => b[1].v - a[1].v);
  return `${head}
    <section class="tc-hero">
      <p class="tc-of">Wert deiner Tageskarten</p>
      <div class="tc-big"><small>CHF</small>${num(value)}</div>
      <p class="tc-of">von CHF ${num(price)} TopCard-Preis</p>
      <p class="tc-verdict">${verdict}</p>
    </section>
    <div class="scale ${UI.tcAnim ? '' : 'is-in no-anim'}" style="--fill:${pct(Math.min(value, price))};--p:${pct(Math.min(value, max))};--be:${pct(price)};--tick:${pct(100)}" role="img" aria-label="Tageskarten im Wert von ${chf(value)} bei einem TopCard-Preis von ${chf(price)}">
      <div class="scale-flag ${price / max > .62 ? 'flip' : ''}"><span>Break-even ${num(price)}</span></div>
      <div class="scale-track"><div class="scale-fill"></div><div class="scale-bonus"></div></div>
      <div class="scale-ticks">${ticks.join('')}</div>
    </div>
    <div class="statrow">
      <div><b class="fig">${n}</b><i class="lab">Tage mit TopCard</i></div>
      <div><b class="fig">${n ? num(avg) : '–'}</b><i class="lab">Ø Tageskarte CHF</i></div>
      <div><b class="fig">${n ? num(price / n) : '–'}</b><i class="lab">Kosten pro Tag CHF</i></div>
    </div>
    <div class="btn-row"><button class="btn btn--primary" data-act="new-entry" data-tc="1">${ic('plus')} Tag eintragen</button><button class="btn" data-act="settings">${ic('sliders')} Preise anpassen</button></div>
    ${n ? `<section class="sect"><h3>Nach Gebiet</h3><div class="list">${resRows.map(([k, v]) => `<div class="li">${typeIc(v.type)}<div class="li-main"><b>${esc(k)}</b><span>${v.n} ${v.n === 1 ? 'Tag' : 'Tage'}</span><div class="hbar"><span style="width:${(v.v / resRows[0][1].v * 100).toFixed(1)}%"></span></div></div><div class="li-end">${num(v.v)}<small>CHF</small></div></div>`).join('')}</div></section>
    <section class="sect"><h3>Alle Tage</h3><div class="list">${days.map(e => { const r = resortById(e.resortId), cat = priceCat(e.date, e.type);
      return `<button class="li" data-act="edit-entry" data-id="${e.id}"><span class="li-date"><b>${parseISO(e.date).getDate()}.${parseISO(e.date).getMonth() + 1}.</b>${WD[parseISO(e.date).getDay()]} ${e.date.slice(0, 4)}</span>
        <span class="li-main"><b>${esc(r ? r.name : e.resortName)}</b><span>${typeIc(e.type)} ${PRICE_CAT[cat]}${e.price != null ? ' · von Hand' : ''}</span></span>
        <span class="li-end">${num(entryPrice(e))}<small>CHF</small></span></button>`; }).join('')}</div></section>`
      : `<div class="empty"><h3>Noch kein Tag eingetragen</h3><p>Tippe bei einem Gebiet auf „War da“. Die App trägt automatisch den Preis ein, den die Tageskarte an diesem Tag etwa gekostet hätte, und füllt die Skala.</p></div>`}
    ${included}
    <p class="fine">Tageskartenpreise sind Richtwerte für Erwachsene (Wochentag, Wochenende, Hochsaison). Viele Gebiete rechnen dynamisch, der echte Preis kann abweichen. Du kannst jeden Tag und jeden Richtpreis von Hand anpassen.</p>`;
};

/* =====================================================================
   4 · Kalender
   ===================================================================== */
function othersByDate() {
  const out = {}, seen = new Set();
  for (const code in UI.groups) for (const m of UI.groups[code].members) {
    if (m.id === S.profile.id) continue;
    for (const day of (m.data.days || [])) {
      const k = m.id + '|' + day.date + '|' + day.resortId + '|' + day.status; if (seen.has(k)) continue; seen.add(k);
      (out[day.date] = out[day.date] || []).push({ m, day });
    }
  }
  return out;
}
function fcInline(r, d) {
  const t = todayISO();
  if (!r || d < t) return '';
  const w = Weather.cached(r), x = wxDay(w, d);
  if (x) { const rt = rate(r, d, w); return `<span class="fc">${sign(rt.level, true)} ${ic(WMO(x.code)[0])} ${tf(x.tTopMax)} ${crowdTag(rt.crowd)}</span>`; }
  if (d <= addDays(t, 13)) { need(r); if (!Weather.failed[r.id]) return '<span class="fc muted">Vorschau lädt …</span>'; }
  return `<span class="fc">${crowdTag(crowd(r, d, null))}<span class="muted">Wetter ab ${fmtDate(addDays(d, -13))}</span></span>`;
}
VIEW.kalender = () => {
  const [y, m] = UI.calMonth.split('-').map(Number), off = (new Date(y, m - 1, 1).getDay() + 6) % 7, n = new Date(y, m, 0).getDate(), t = todayISO();
  const others = othersByDate();
  let cells = '<div class="cd cd--blank"></div>'.repeat(off);
  for (let d = 1; d <= n; d++) {
    const s = `${y}-${pad(m)}-${pad(d)}`, dow = new Date(y, m - 1, d).getDay(), own = S.days.filter(e => e.date === s), oth = others[s] || [], fer = schoolHoliday(s);
    const marks = own.map(e => `<i class="mk ${e.type === 'bike' ? 'bike' : ''} ${e.status === 'done' ? 'done' : ''}"></i>`).join('')
      + oth.slice(0, 3).map(o => `<i class="mk-p ${o.day.status === 'plan' ? 'plan' : ''}" style="--c:${safeColor(o.m.color)}">${esc((o.m.name || '?').trim().charAt(0).toUpperCase())}</i>`).join('');
    const info = [holidayName(s), own.length ? `${own.length} eigene Einträge` : '', oth.length ? `${oth.length} aus Gruppen` : ''].filter(Boolean).join(', ');
    cells += `<button class="cd ${dow === 0 || dow === 6 ? 'is-we' : ''} ${holidayName(s) ? 'is-hol' : ''} ${fer && fer.w >= .5 ? 'is-ferien' : ''} ${s === t ? 'is-today' : ''} ${s < t ? 'is-past' : ''}" data-act="open-day" data-d="${s}" aria-label="${fmtDateLong(s)}${info ? ': ' + esc(info) : ''}"><span class="cd-n">${d}</span><span class="cd-marks">${marks}</span></button>`;
  }
  cells += '<div class="cd cd--blank"></div>'.repeat((7 - (off + n) % 7) % 7);
  const upcoming = [];
  S.days.filter(e => e.status === 'plan' && e.date >= t).forEach(e => upcoming.push({ date: e.date, r: resortById(e.resortId), name: e.resortName, type: e.type, mine: e }));
  Object.entries(others).forEach(([d, arr]) => { if (d >= t) arr.filter(o => o.day.status === 'plan').forEach(o => upcoming.push({ date: d, r: resortById(o.day.resortId), name: o.day.resortName, type: o.day.type, m: o.m })); });
  upcoming.sort((a, b) => a.date.localeCompare(b.date));
  return `<section class="lead"><p class="eyebrow">Geplant und gefahren</p><h1>Kalender</h1></section>
    <section class="sect">
      <div class="cal-head"><button class="icon-btn" data-act="cal-nav" data-n="-1" aria-label="Vorheriger Monat">${ic('left')}</button><h2>${MONTHS[m - 1]} ${y}</h2><button class="icon-btn" data-act="cal-nav" data-n="1" aria-label="Nächster Monat">${ic('right')}</button></div>
      <div><div class="cal-wd" aria-hidden="true">${['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(x => `<span>${x}</span>`).join('')}</div><div class="cal">${cells}</div></div>
      <div class="legend"><span><i class="mk"></i> Ski geplant</span><span><i class="mk done"></i> Ski gefahren</span><span><i class="mk bike"></i> Bike geplant</span><span><i class="mk bike done"></i> Bike gefahren</span><span><i class="mk-p" style="--c:#5D6D7E">A</i> Gruppe</span><span>gestrichelt: Schulferien</span></div>
    </section>
    <section class="sect">
      <div class="sect-head"><h3>Als Nächstes geplant</h3><button class="btn" data-act="new-entry" data-plan="1">${ic('plus')} Tag planen</button></div>
      ${upcoming.length ? `<div class="list">${upcoming.slice(0, 14).map(u => `<${u.mine ? `button data-act="edit-entry" data-id="${u.mine.id}"` : `button data-act="open-day" data-d="${u.date}"`} class="li">
        <span class="li-date"><b>${parseISO(u.date).getDate()}.${parseISO(u.date).getMonth() + 1}.</b>${WD[parseISO(u.date).getDay()]}</span>
        <span class="li-main"><b>${esc(u.r ? u.r.name : u.name)}</b><span>${typeIc(u.type)} ${u.m ? `<span class="who" style="--c:${safeColor(u.m.color)}"><i></i>${esc(u.m.name)}</span>` : 'du'}</span>${fcInline(u.r, u.date)}</span>
        <span class="li-end">${ic('right')}</span></button>`).join('')}</div>`
      : `<div class="empty"><p>Noch nichts geplant. Tippe auf einen Tag im Kalender oder auf „Planen“ bei einem Gebiet. Für die nächsten 14 Tage siehst du hier direkt Wetter und Andrang.</p></div>`}
    </section>`;
};
SHEET.day = sh => {
  const d = sh.d, t = todayISO(), own = S.days.filter(e => e.date === d), oth = othersByDate()[d] || [], hol = holidayName(d), fer = schoolHoliday(d);
  const ownRows = own.map(e => { const r = resortById(e.resortId);
    return `<button class="li" data-act="edit-entry" data-id="${e.id}">${typeIc(e.type)}<span class="li-main"><b>${esc(r ? r.name : e.resortName)}</b><span>${e.status === 'done' ? 'War da' : 'Geplant'}${e.note ? ' · ' + esc(e.note) : ''}</span>${e.status === 'plan' ? fcInline(r, d) : ''}</span><span class="li-end">${ic('edit')}</span></button>`; }).join('');
  const othRows = oth.map(o => { const r = resortById(o.day.resortId), joined = own.some(e => e.resortId === o.day.resortId);
    return `<div class="li">${typeIc(o.day.type)}<div class="li-main"><b>${esc(o.day.resortName)}</b><span><span class="who" style="--c:${safeColor(o.m.color)}"><i></i>${esc(o.m.name)}</span> · ${o.day.status === 'done' ? 'war da' : 'geplant'}</span>${o.day.status === 'plan' ? fcInline(r, d) : ''}
      ${o.day.status === 'plan' && d >= t && !joined ? `<div class="li-act"><button class="btn" data-act="join-plan" data-d="${d}" data-id="${esc(o.day.resortId)}" data-name="${esc(o.day.resortName)}" data-type="${o.day.type === 'bike' ? 'bike' : 'ski'}">Ich komme mit</button></div>` : ''}</div><span></span></div>`; }).join('');
  return { title: fmtDateLong(d), body: `
    ${hol || fer ? `<div class="chips">${hol ? `<span class="chip chip--static">${esc(hol)}</span>` : ''}${fer ? `<span class="chip chip--static">${fer.name}${fer.w < .5 ? ' (teilweise)' : ''}</span>` : ''}</div>` : ''}
    <section class="sect"><h3>Deine Einträge</h3>${ownRows ? `<div class="list">${ownRows}</div>` : '<p class="muted">Für diesen Tag hast du nichts eingetragen.</p>'}</section>
    ${othRows ? `<section class="sect"><h3>Aus deinen Gruppen</h3><div class="list">${othRows}</div></section>` : ''}`,
    foot: `${d >= t ? `<button class="btn btn--primary grow" data-act="new-entry" data-plan="1" data-d="${d}">${ic('calendar')} Tag planen</button>` : ''}${d <= t ? `<button class="btn ${d < t ? 'btn--primary' : ''} grow" data-act="new-entry" data-d="${d}">${ic('check')} War da eintragen</button>` : ''}` };
};

/* =====================================================================
   5 · Gruppen
   ===================================================================== */
function myMember() {
  const from = seasonRange(currentSeason())[0];
  return { id: S.profile.id, name: S.profile.name || 'Ohne Namen', color: S.profile.color, me: true,
    data: { season: currentSeason(), cardPrice: S.topcard.price || null, days: myDaysShared().filter(d => d.date >= from) } };
}
const memberStats = m => statsOf(m.data.days || [], m.data.cardPrice, currentSeason());
let pushT = null;
_onSave = () => { clearTimeout(pushT); if (S.groups.length && S.profile.name) pushT = setTimeout(pushAll, 1200); };
async function pushAll() {
  const me = myMember();
  for (const g of S.groups) { try { await Sync.pushMember(g.code, me); UI.syncErr = ''; } catch (e) { UI.syncErr = e.message; } }
}
async function refreshGroups(force) {
  if (!S.groups.length) return;
  if (!force && Date.now() - UI.groupsAt < 30000) return;
  UI.groupsAt = Date.now();
  let changed = false;
  for (const g of S.groups) {
    try { const d = await Sync.fetchGroup(g.code); if (d) { UI.groups[g.code] = d; if (d.name && d.name !== g.name) { g.name = d.name; changed = true; } } else UI.groups[g.code] = { code: g.code, name: g.name, members: [], missing: true }; UI.syncErr = ''; }
    catch (e) { UI.syncErr = e.message; }
  }
  if (changed) { try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) { /* egal */ } }
  soon();
}
const inviteLink = code => {
  const c = syncConfig(), cfg = c && !c.fixed ? '&cfg=' + encodeURIComponent(btoa(JSON.stringify([c.url, c.key]))) : '';
  return `${location.href.split('#')[0]}#join=${code}${cfg}`;
};
const syncNote = () => Sync.online()
  ? (UI.syncErr ? `<p class="note note--bad"><b>Online-Speicher nicht erreichbar</b><span>${esc(UI.syncErr)}. Prüfe die Angaben in den Einstellungen.</span></p>` : '')
  : `<div class="note note--warn"><b>Gruppen sind noch nicht online</b><span>Ohne Online-Speicher bleibt eine Gruppe auf diesem Gerät, andere können ihr nicht beitreten. Die Einrichtung dauert etwa fünf Minuten.</span><div><button class="link" data-act="settings" data-focus="sync">Online-Speicher einrichten</button></div></div>`;

VIEW.gruppen = () => {
  if (UI.group && S.groups.some(g => g.code === UI.group)) return viewGroup(UI.group);
  UI.group = null;
  const nameOk = !!S.profile.name.trim();
  return `<section class="lead"><p class="eyebrow">Freunde und Familie</p><h1>Gruppen</h1>
      <p class="lead-note">Gemeinsame Rangliste und ein Kalender, in dem alle sehen, wer wann wo geplant hat.</p></section>
    ${syncNote()}
    <section class="sect"><div class="field"><label for="pname">Dein Name in Gruppen</label>
      <div class="inline"><input id="pname" type="text" maxlength="30" value="${esc(S.profile.name)}" placeholder="z. B. Elia" autocomplete="nickname"><button class="btn" data-act="save-name">Speichern</button></div></div></section>
    ${UI.joinCode ? `<div class="note"><b>Einladung in eine Gruppe</b><span>Code <span class="mono">${esc(UI.joinCode)}</span>. ${nameOk ? '' : 'Trage zuerst oben deinen Namen ein.'}</span><div class="btn-row"><button class="btn btn--primary" data-act="join-group" data-code="${esc(UI.joinCode)}" ${nameOk ? '' : 'disabled'}>Beitreten</button><button class="btn btn--ghost" data-act="dismiss-join">Verwerfen</button></div></div>` : ''}
    ${UI.groupMsg ? `<p class="note note--bad">${esc(UI.groupMsg)}</p>` : ''}
    <section class="sect"><h3>Meine Gruppen</h3>
      ${S.groups.length ? `<div class="list">${S.groups.map(g => { const d = UI.groups[g.code]; return `<button class="li" data-act="open-group" data-code="${esc(g.code)}">${ic('users')}<span class="li-main"><b>${esc(g.name)}</b><span><span class="mono">${esc(g.code)}</span>${d ? ` · ${Math.max(1, d.members.length)} ${d.members.length <= 1 ? 'Mitglied' : 'Mitglieder'}` : ''}</span></span><span class="li-end">${ic('right')}</span></button>`; }).join('')}</div>`
      : '<p class="muted">Du bist noch in keiner Gruppe.</p>'}
    </section>
    <section class="sect"><h3>Neue Gruppe</h3><div class="inline"><input id="gname" type="text" maxlength="40" placeholder="Name, z. B. Skifamilie" aria-label="Name der neuen Gruppe"><button class="btn btn--primary" data-act="create-group" ${nameOk ? '' : 'disabled'}>Erstellen</button></div></section>
    <section class="sect"><h3>Mit Code beitreten</h3><div class="inline"><input id="gcode" type="text" maxlength="6" placeholder="6-stelliger Code" aria-label="Einladungscode" autocapitalize="characters" autocomplete="off" class="mono"><button class="btn" data-act="join-group" ${nameOk ? '' : 'disabled'}>Beitreten</button></div>
      ${nameOk ? '' : '<p class="hint">Zum Erstellen oder Beitreten brauchst du zuerst einen Namen.</p>'}</section>`;
};
function groupMembers(code) {
  const g = UI.groups[code];
  return (g ? g.members.filter(m => m.id !== S.profile.id) : []).concat([myMember()]);
}
function viewGroup(code) {
  const meta = S.groups.find(g => g.code === code), g = UI.groups[code], t = todayISO();
  const rows = groupMembers(code).map(m => ({ m, st: memberStats(m) }));
  const val = { ski: r => r.st.ski, bike: r => r.st.bike, saved: r => r.st.saved == null ? -1e9 : r.st.saved, km: r => r.st.km }[UI.groupSort];
  rows.sort((a, b) => val(b) - val(a) || a.m.name.localeCompare(b.m.name));
  const th = (k, l) => `<th><button data-act="group-sort" data-k="${k}" aria-pressed="${UI.groupSort === k}">${l}</button></th>`;
  const td = (k, v, cls = '') => `<td class="${UI.groupSort === k ? 'is-sort' : ''} ${cls}">${v}</td>`;
  const plans = {};
  rows.forEach(({ m }) => (m.data.days || []).filter(d => d.status === 'plan' && d.date >= t).forEach(d => { const k = d.date + '|' + d.resortId; (plans[k] = plans[k] || { d, who: [] }).who.push(m); }));
  const planRows = Object.values(plans).sort((a, b) => a.d.date.localeCompare(b.d.date)).slice(0, 12).map(p => { const r = resortById(p.d.resortId), iAmIn = p.who.some(m => m.me);
    return `<div class="li"><span class="li-date"><b>${parseISO(p.d.date).getDate()}.${parseISO(p.d.date).getMonth() + 1}.</b>${WD[parseISO(p.d.date).getDay()]}</span>
      <div class="li-main"><b>${esc(p.d.resortName)}</b><span>${typeIc(p.d.type)} ${p.who.map(m => `<span class="who" style="--c:${safeColor(m.color)}"><i></i>${esc(m.me ? 'du' : m.name)}</span>`).join(' ')}</span>${fcInline(r, p.d.date)}
      <div class="li-act">${iAmIn ? '<span class="tag">du bist dabei</span>' : `<button class="btn" data-act="join-plan" data-d="${p.d.date}" data-id="${esc(p.d.resortId)}" data-name="${esc(p.d.resortName)}" data-type="${p.d.type === 'bike' ? 'bike' : 'ski'}">Ich komme mit</button>`}</div></div><span></span></div>`; }).join('');
  const fileUrl = location.protocol === 'file:';
  return `<section class="lead"><div><button class="btn btn--ghost" data-act="back-groups" style="padding-left:0">${ic('left')} Alle Gruppen</button></div><h1>${esc(meta.name)}</h1></section>
    ${syncNote()}
    ${g && g.missing ? '<p class="note note--bad">Diese Gruppe wurde im Speicher nicht gefunden. Vielleicht wurde der Online-Speicher gewechselt.</p>' : ''}
    <div class="codebox"><div><p class="eyebrow">Einladungscode</p><div class="code">${esc(code)}</div></div>
      <div class="btn-row"><button class="btn" data-act="copy" data-text="${esc(code)}" data-ok="Code kopiert">${ic('copy')} Code</button><button class="btn btn--primary" data-act="copy" data-text="${esc(inviteLink(code))}" data-ok="Einladungslink kopiert">${ic('copy')} Einladungslink</button></div></div>
    ${fileUrl ? '<p class="fine">Der Einladungslink funktioniert erst, wenn die App im Internet liegt. Solange du sie als Datei öffnest, zeigt er auf deinen eigenen Computer.</p>' : ''}
    <section class="sect"><div class="sect-head"><h3>Rangliste ${seasonLabel(currentSeason())}</h3><button class="link" data-act="refresh-groups">Aktualisieren</button></div>
      <div class="tablewrap"><table class="board"><thead><tr><th>#</th><th>Name</th>${th('ski', 'Ski')}${th('bike', 'Bike')}${th('saved', 'Gespart')}${th('km', 'km')}</tr></thead>
      <tbody>${rows.map((r, i) => `<tr class="${i === 0 ? 'first' : ''}" data-act="open-member" data-id="${esc(r.m.id)}" data-code="${esc(code)}"><td class="rank">${i + 1}</td>
        <td><span class="who" style="--c:${safeColor(r.m.color)}"><i></i>${esc(r.m.name)}${r.m.me ? ' (du)' : ''}</span></td>
        ${td('ski', r.st.ski)}${td('bike', r.st.bike)}${td('saved', r.st.saved == null ? '–' : (r.st.saved < 0 ? '−' : '') + num(Math.abs(r.st.saved)), r.st.saved != null && r.st.saved < 0 ? 'neg' : '')}${td('km', num(r.st.km))}</tr>`).join('')}</tbody></table></div>
      <p class="fine">Ski und Bike zählen die gefahrenen Tage. „Gespart“ ist der Wert der Tageskarten minus der Preis der Saisonkarte in CHF. Ein Minus heisst: noch nicht am Break-even. Tippe auf eine Person für ihr Profil.</p>
    </section>
    <section class="sect"><h3>Gemeinsam geplant</h3>
      ${planRows ? `<div class="list">${planRows}</div>` : '<p class="muted">Noch hat niemand einen Tag geplant. Geplante Tage aus deinem Kalender erscheinen hier automatisch für alle.</p>'}
    </section>
    <div><button class="btn btn--danger" data-act="leave-group" data-code="${esc(code)}">${UI.leaveArm ? 'Wirklich verlassen? Nochmals tippen' : 'Gruppe verlassen'}</button></div>`;
}
SHEET.member = sh => {
  const m = groupMembers(sh.code).find(x => x.id === sh.id);
  if (!m) return { title: 'Profil', body: '<p class="muted">Diese Person ist nicht mehr in der Gruppe.</p>' };
  const st = memberStats(m), [from] = seasonRange(currentSeason()), t = todayISO();
  const days = (m.data.days || []).filter(d => d.date >= from).sort((a, b) => b.date.localeCompare(a.date));
  return { title: m.name + (m.me ? ' (du)' : ''), body: `
    <div class="statrow statrow--4"><div><b class="fig">${st.ski}</b><i class="lab">Skitage</i></div><div><b class="fig">${st.bike}</b><i class="lab">Biketage</i></div><div><b class="fig">${num(st.km)}</b><i class="lab">Kilometer</i></div><div><b class="fig">${num(st.hm)}</b><i class="lab">Höhenmeter</i></div></div>
    ${st.fav ? `<div class="fav"><div><p class="eyebrow">Lieblingsgebiet</p><b>${esc(st.fav)}</b></div><span class="muted">${st.favCount} ${st.favCount === 1 ? 'Tag' : 'Tage'}</span></div>` : ''}
    <section class="sect"><h3>Tage ${seasonLabel(currentSeason())}</h3>
    ${days.length ? `<div class="list">${days.map(d => `<div class="li"><span class="li-date"><b>${parseISO(d.date).getDate()}.${parseISO(d.date).getMonth() + 1}.</b>${WD[parseISO(d.date).getDay()]}</span><div class="li-main"><b>${esc(d.resortName)}</b><span>${typeIc(d.type)} ${d.status === 'done' ? 'war da' : d.date >= t ? 'geplant' : 'war geplant'}${d.km ? ` · ${num(d.km, 1)} km` : ''}</span></div><span></span></div>`).join('')}</div>` : '<p class="muted">Noch keine Tage in dieser Saison.</p>'}</section>` };
};

/* =====================================================================
   6 · Kilometer und Statistik
   ===================================================================== */
VIEW.statistik = () => {
  const T = S.mode, sk = UI.statSeason || currentSeason(), [from, to] = seasonRange(sk), st = myStats(sk);
  const days = S.days.filter(e => e.status === 'done' && e.type === T && e.date >= from && e.date <= to).sort((a, b) => b.date.localeCompare(a.date));
  const km = T === 'ski' ? st.kmSki : st.kmBike, hm = T === 'ski' ? st.hmSki : st.hmBike, runs = days.reduce((s, e) => s + (+e.runs || 0), 0);
  const cnt = {}; days.forEach(e => { const r = resortById(e.resortId), k = r ? r.name : e.resortName; (cnt[k] = cnt[k] || { n: 0, km: 0 }).n++; cnt[k].km += +e.km || 0; });
  const res = Object.entries(cnt).sort((a, b) => b[1].n - a[1].n || b[1].km - a[1].km);
  const seasons = [...new Set(S.days.filter(e => e.status === 'done').map(e => seasonKey(e.date)).concat([currentSeason()]))].sort((a, b) => b - a);
  const months = Array.from({ length: 12 }, (_, i) => { const mo = (4 + i) % 12, yr = sk + (mo < 4 ? 1 : 0), c = st.byMonth[`${yr}-${pad(mo + 1)}`] || { ski: 0, bike: 0 }; return { label: MONTHS_SHORT[mo], ...c }; });
  const mx = Math.max(1, ...months.map(x => x.ski + x.bike));
  const missing = days.filter(e => !(+e.km)).length;
  return `<section class="lead"><p class="eyebrow">Saison ${seasonLabel(sk)}</p><h1>${T === 'ski' ? 'Skisaison' : 'Bikesaison'}</h1></section>
    ${seasons.length > 1 ? `<div class="chips">${seasons.map(k => `<button class="chip" data-act="stat-season" data-k="${k}" aria-pressed="${k === sk}">${seasonLabel(k)}</button>`).join('')}</div>` : ''}
    <div class="statrow statrow--4">
      <div><b class="fig">${days.length}</b><i class="lab">${T === 'ski' ? 'Skitage' : 'Biketage'}</i></div>
      <div><b class="fig">${num(km)}</b><i class="lab">Kilometer</i></div>
      <div><b class="fig">${num(hm)}</b><i class="lab">Höhenmeter</i></div>
      <div><b class="fig">${num(runs)}</b><i class="lab">Abfahrten</i></div>
    </div>
    ${res.length ? `<div class="fav"><div><p class="eyebrow">Lieblingsgebiet</p><b>${esc(res[0][0])}</b></div><span class="muted">${res[0][1].n} ${res[0][1].n === 1 ? 'Tag' : 'Tage'}${res[0][1].km ? ` · ${num(res[0][1].km)} km` : ''}</span></div>` : ''}
    <div class="btn-row"><label class="btn btn--primary filebtn">${ic('upload')} GPX hochladen<input type="file" accept=".gpx,application/gpx+xml,text/xml,application/xml" data-ch="gpx-new" aria-label="GPX-Datei auswählen"></label><button class="btn" data-act="new-entry">${ic('plus')} Tag von Hand eintragen</button></div>
    <p class="fine">Skikarten geben ihre Liftdaten nicht öffentlich frei. Deshalb trägst du Kilometer, Höhenmeter und Abfahrten selbst ein oder lädst die GPX-Datei deiner Aufzeichnung hoch, zum Beispiel aus Strava oder Slopes. Die App rechnet sie aus und ordnet sie dem nächstgelegenen Gebiet zu.</p>
    <section class="sect"><h3>Tage pro Monat · Ski und Bike</h3>
      <div><div class="bars" role="img" aria-label="Tage pro Monat: ${months.filter(x => x.ski + x.bike).map(x => `${x.label} ${x.ski + x.bike}`).join(', ') || 'noch keine Tage'}">${months.map(x => `<div class="col"><div class="seg-ski" style="height:${x.ski / mx * 100}%"></div><div class="seg-bike" style="height:${x.bike / mx * 100}%"></div>${x.ski + x.bike ? `<b style="bottom:${(x.ski + x.bike) / mx * 100}%;translate:0 0;top:auto;padding-bottom:3px">${x.ski + x.bike}</b>` : ''}</div>`).join('')}</div>
      <div class="bars-x">${months.map(x => `<span>${x.label}</span>`).join('')}</div></div>
      <div class="legend"><span><i class="mk done"></i> Ski ${st.ski}</span><span><i class="mk bike done"></i> Bike ${st.bike}</span><span>zusammen ${num(st.km)} km und ${num(st.hm)} Hm</span></div>
    </section>
    ${res.length > 1 ? `<section class="sect"><h3>Nach Gebiet</h3><div class="list">${res.map(([k, v]) => `<div class="li">${typeIc(T)}<div class="li-main"><b>${esc(k)}</b><span>${v.km ? num(v.km) + ' km' : 'keine Kilometer erfasst'}</span><div class="hbar"><span style="width:${v.n / res[0][1].n * 100}%"></span></div></div><div class="li-end">${v.n}<small>${v.n === 1 ? 'Tag' : 'Tage'}</small></div></div>`).join('')}</div></section>` : ''}
    <section class="sect"><div class="sect-head"><h3>${T === 'ski' ? 'Skitage' : 'Biketage'}</h3>${missing ? `<span class="muted" style="font-size:.8rem">${missing} ohne Kilometer</span>` : ''}</div>
      ${days.length ? `<div class="list">${days.map(e => { const r = resortById(e.resortId);
        return `<button class="li" data-act="edit-entry" data-id="${e.id}"><span class="li-date"><b>${parseISO(e.date).getDate()}.${parseISO(e.date).getMonth() + 1}.</b>${WD[parseISO(e.date).getDay()]} ${e.date.slice(0, 4)}</span>
          <span class="li-main"><b>${esc(r ? r.name : e.resortName)}</b><span>${+e.km ? `${num(e.hm)} Hm · ${e.runs || 0} Abfahrten` : 'Kilometer nachtragen'}</span></span>
          <span class="li-end">${+e.km ? num(e.km, 1) : '–'}<small>km</small></span></button>`; }).join('')}</div>`
      : `<div class="empty"><p>Noch keine ${T === 'ski' ? 'Skitage' : 'Biketage'} in dieser Saison. Tippe bei einem Gebiet auf „War da“ oder lade eine GPX-Datei hoch.</p></div>`}
    </section>`;
};

/* =====================================================================
   Einstellungen
   ===================================================================== */
SHEET.settings = sh => {
  const tc = allResorts().filter(r => r.topcard), others = favResorts().filter(r => !r.topcard);
  const prow = r => { const p = pricesFor(r), srcTxt = k => p.src[k] === 'est' ? 'geschätzt' : p.src[k] === 'user' ? 'angepasst' : 'recherchiert';
    return `<div class="price-row"><b>${typeIc(r.type)} ${esc(r.name)}</b><div class="row3">${['wd', 'we', 'hs'].map(k => `<label>${PRICE_CAT[k]}<input type="number" inputmode="decimal" min="0" step="1" value="${p[k]}" data-in="price" data-id="${esc(r.id)}" data-k="${k}" aria-label="${esc(r.name)}: ${PRICE_CAT[k]} in CHF"><span class="src">${srcTxt(k)}</span></label>`).join('')}</div></div>`; };
  const cur = seasonKey(todayISO()), c = syncConfig();
  return { title: 'Einstellungen', body: `
    <section class="sect"><h3>TopCard</h3>
      <div class="row2">
        <div class="field"><label for="s-tc">Preis meiner TopCard (CHF)</label><input id="s-tc" type="number" inputmode="decimal" min="0" step="1" value="${S.topcard.price ?? ''}" placeholder="z. B. 1300" data-in="tc-price"></div>
        <div class="field"><label for="s-season">Saison</label><select id="s-season" data-ch="season">${[cur, cur - 1, cur - 2].map(k => `<option value="${k}" ${currentSeason() === k ? 'selected' : ''}>${seasonLabel(k)}${k === cur ? ' (aktuell)' : ''}</option>`).join('')}</select></div>
      </div>
    </section>
    <section class="sect"><h3>Tageskartenpreise in CHF</h3>
      <p class="hint">Richtpreise für Erwachsene. Die App wählt für jeden Tag automatisch: Hochsaison (Weihnachten/Neujahr und Sportferien, beim Biken die Sommerferien), sonst Wochenende/Feiertag oder Wochentag. Recherchiert im November 2026, alles andere ist geschätzt.</p>
      <p class="eyebrow">In der TopCard enthalten</p><div class="list">${tc.map(prow).join('')}</div>
      ${others.length ? `<p class="eyebrow">Weitere Favoriten</p><div class="list">${others.map(prow).join('')}</div>` : ''}
    </section>
    <section class="sect"><h3>Darstellung</h3>
      <div class="seg seg--wide">${[['light', 'Hell'], ['dark', 'Dunkel'], ['system', 'Wie das Gerät']].map(([k, l]) => `<button data-act="theme" data-t="${k}" aria-pressed="${S.theme === k}">${l}</button>`).join('')}</div>
    </section>
    <section class="sect"><h3>Profil</h3>
      <div class="field"><label for="s-name">Dein Name in Gruppen</label><input id="s-name" type="text" maxlength="30" value="${esc(S.profile.name)}" data-in="profile-name" autocomplete="nickname"></div>
    </section>
    <section class="sect" id="sync-sect"><h3>Online-Speicher für Gruppen</h3>
      <p class="hint">${c ? (c.fixed ? 'Der Online-Speicher ist fest in der App hinterlegt (config.js).' : 'Verbunden. Einladungslinks geben diese Verbindung automatisch weiter.') : 'Damit alle in einer Gruppe dasselbe sehen, braucht die App einen gemeinsamen Speicher. Vorgesehen ist ein kostenloses Supabase-Projekt: Konto anlegen, die Datei supabase-setup.sql im SQL-Editor ausführen, dann Adresse und öffentlichen Schlüssel hier eintragen.'}</p>
      ${c && c.fixed ? '' : `<div class="field"><label for="s-url">Projekt-Adresse</label><input id="s-url" type="url" value="${esc(S.sync.url)}" placeholder="https://….supabase.co" data-in="sync" data-k="url" autocomplete="off"></div>
      <div class="field"><label for="s-key">Öffentlicher Schlüssel (anon / publishable)</label><input id="s-key" type="text" value="${esc(S.sync.key)}" data-in="sync" data-k="key" autocomplete="off" class="mono"></div>`}
      <div class="btn-row"><button class="btn" data-act="sync-test">Verbindung prüfen</button></div>
      ${sh.syncMsg ? `<p class="note ${sh.syncOk ? '' : 'note--bad'}">${esc(sh.syncMsg)}</p>` : ''}
    </section>
    <section class="sect"><h3>Daten</h3>
      <p class="hint">Deine Tage, Favoriten und Preise liegen im Browser dieses Geräts. Mit einer Sicherung nimmst du sie auf ein anderes Gerät mit.</p>
      <div class="btn-row"><button class="btn" data-act="export">${ic('download')} Sicherung speichern</button><label class="btn filebtn">${ic('upload')} Sicherung laden<input type="file" accept=".json,application/json" data-ch="import" aria-label="Sicherungsdatei auswählen"></label></div>
      ${sh.dataMsg ? `<p class="note">${esc(sh.dataMsg)}</p>` : ''}
    </section>`,
    foot: `<button class="btn btn--primary grow" data-act="close-sheet">Fertig</button>` };
};

/* =====================================================================
   Aktionen
   ===================================================================== */
const ACT = {
  tab(el) { UI.tab = el.dataset.t; if (UI.tab === 'topcard') UI.tcAnim = true; if (UI.tab === 'gruppen' || UI.tab === 'kalender') refreshGroups(); UI.leaveArm = false; render(); scrollTo(0, 0); },
  mode(el) { S.mode = el.dataset.m; save(); if (UI.tab === 'topcard') UI.tcAnim = false; render(); },
  settings(el) { openSheet('settings'); if (el.dataset.focus === 'sync') { const s = $('#sync-sect'); if (s) s.scrollIntoView(); } },
  'close-sheet'() { closeSheet(); },
  'toast-act'() { const fn = UI.toastFn; $('#toast').innerHTML = ''; if (fn) fn(); },
  theme(el) { S.theme = el.dataset.t; save(); applyLook(); renderSheet(); },

  /* Gebiete */
  picker() { openSheet('picker', { q: '', cc: '', ptype: S.mode, geo: null }); },
  'picker-type'(el) { UI.sheet.ptype = el.dataset.m; renderSheet(); },
  'picker-cc'(el) { UI.sheet.cc = el.dataset.cc; renderSheet(); },
  'toggle-fav'(el) {
    const id = el.dataset.id, i = S.favs.indexOf(id);
    if (i >= 0) S.favs.splice(i, 1); else S.favs.push(id);
    save(); $('#picker-list').innerHTML = pickerList(UI.sheet);
  },
  unfav(el) { S.favs = S.favs.filter(x => x !== el.dataset.id); save(); closeSheet(); toast('Aus den Favoriten entfernt'); },
  async 'geo-search'() {
    const sh = UI.sheet, q = sh.q.trim(); sh.geo = 'loading'; $('#picker-list').innerHTML = pickerList(sh);
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=de&format=json`);
      if (!res.ok) throw new Error();
      sh.geo = { results: (await res.json()).results || [] };
    } catch (e) { sh.geo = { error: 'Die Ortssuche ist gerade nicht erreichbar. Prüfe die Internetverbindung.' }; }
    if (UI.sheet === sh) $('#picker-list').innerHTML = pickerList(sh);
  },
  'geo-pick'(el) {
    const g = UI.sheet.geo.results[+el.dataset.i], base = Math.round(g.elevation || 1000);
    openSheet('custom', { c: { name: g.name, cc: g.country_code || '', region: g.admin1 || g.country || '', lat: g.latitude, lon: g.longitude, base, top: base + 800, size: 2, type: UI.sheet.ptype } });
  },
  'c-type'(el) { UI.sheet.c.type = el.dataset.m; renderSheet(); },
  'c-save'() {
    const sh = UI.sheet, c = sh.c, base = Math.round(+c.base), top = Math.round(+c.top);
    if (!String(c.name).trim()) { sh.err = 'Gib dem Gebiet einen Namen.'; return renderSheet(); }
    if (!(top > base) || base < -100 || top > 6000) { sh.err = 'Die Höhe am Berg muss über der Höhe im Tal liegen (in Metern).'; return renderSheet(); }
    const r = { id: 'c-' + uid(), name: String(c.name).trim(), cc: c.cc, region: c.region, lat: +c.lat, lon: +c.lon, base, top, size: clamp(+c.size || 2, 1, 5), type: c.type, topcard: false, partner: false, custom: true };
    S.custom.push(r); S.favs.push(r.id); S.mode = r.type; save(); closeSheet(); toast(`${r.name} hinzugefügt`);
  },
  'open-resort'(el) { openSheet('resort', { id: el.dataset.id, d: null }); },
  'pick-day'(el) { UI.sheet.d = el.dataset.d; renderSheet(); },
  'retry-wx'(el) { const r = resortById(el.dataset.id); delete Weather.failed[r.id]; Weather.load(r, true).then(soon, soon); render(); },

  /* Einträge */
  'was-there'(el) {
    const r = resortById(el.dataset.id), d = el.dataset.d || todayISO(), t = todayISO();
    let e = S.days.find(x => x.resortId === r.id && x.date === d);
    if (e && e.status === 'done') return openEntry(e);
    if (e) { e.status = 'done'; e.topcard = r.topcard; }
    else { e = { id: uid(), date: d, resortId: r.id, resortName: r.name, type: r.type, status: 'done', topcard: r.topcard, price: null, km: 0, hm: 0, runs: 0, note: '' }; S.days.push(e); }
    save(); if (UI.sheet) closeSheet(); else render();
    toast(`Eingetragen: ${r.name}, ${d === t ? 'heute' : fmtDate(d)}${e.topcard ? ` · Tageskarte ${chf(entryPrice(e))}` : ''}`, 'Bearbeiten', () => openEntry(e));
  },
  plan(el) {
    const r = resortById(el.dataset.id), t = todayISO(), w = Weather.cached(r);
    let d = el.dataset.d;
    if (!d) { d = addDays(t, 1); if (w) for (let i = 1; i <= 7; i++) { const rt = rate(r, addDays(t, i), w); if (rt && rt.level === 'top') { d = addDays(t, i); break; } } }
    openEntry({ resortId: r.id, type: r.type, date: d, status: 'plan', topcard: r.topcard });
  },
  'new-entry'(el) {
    const plan = !!el.dataset.plan, d = el.dataset.d || (plan ? addDays(todayISO(), 1) : todayISO());
    const favs = favResorts(S.mode), r = favs.length === 1 ? favs[0] : (el.dataset.tc ? favs.find(x => x.topcard) : null);
    openEntry({ date: d, status: plan ? 'plan' : 'done', resortId: r ? r.id : null, type: r ? r.type : S.mode, topcard: r ? r.topcard : !!el.dataset.tc });
  },
  'edit-entry'(el) { const e = S.days.find(x => x.id === el.dataset.id); if (e) openEntry(e); },
  'e-status'(el) { const sh = UI.sheet; sh.e.status = el.dataset.s; sh.err = ''; if (sh.e.status === 'done' && sh.isNew) { const r = resortById(sh.e.resortId); if (r) sh.e.topcard = r.topcard; } renderSheet(); },
  'save-entry'() {
    const sh = UI.sheet, e = sh.e, r = resortById(e.resortId);
    if (!r) { sh.err = 'Wähle ein Gebiet.'; return renderSheet(); }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date || '')) { sh.err = 'Wähle ein Datum.'; return renderSheet(); }
    if (e.status === 'done' && e.date > todayISO()) { sh.err = 'Dieser Tag liegt in der Zukunft. Trage ihn als „Geplant“ ein.'; return renderSheet(); }
    const done = e.status === 'done', manual = done && e.topcard && e.price !== '' && e.price != null && isFinite(+e.price);
    const rec = { id: e.id || uid(), date: e.date, resortId: r.id, resortName: r.name, type: r.type, status: e.status, topcard: done && !!e.topcard,
      price: manual ? Math.max(0, +e.price) : null, km: Math.max(0, +e.km || 0), hm: Math.max(0, +e.hm || 0), runs: Math.max(0, Math.round(+e.runs || 0)), note: String(e.note || '').slice(0, 200) };
    const i = S.days.findIndex(x => x.id === rec.id);
    if (i >= 0) S.days[i] = rec; else S.days.push(rec);
    UI.calMonth = UI.tab === 'kalender' ? rec.date.slice(0, 7) : UI.calMonth;
    save(); closeSheet(); toast(done ? 'Tag gespeichert' : `Geplant: ${r.name}, ${fmtDate(rec.date)}`);
  },
  'del-entry'(el) {
    if (!UI.sheet.delArm) { UI.sheet.delArm = true; el.textContent = 'Wirklich löschen?'; return; }
    S.days = S.days.filter(x => x.id !== UI.sheet.e.id); save(); closeSheet(); toast('Eintrag gelöscht');
  },
  'join-plan'(el) {
    const id = el.dataset.id, d = el.dataset.d;
    if (!S.days.some(e => e.date === d && e.resortId === id)) {
      const r = resortById(id);
      S.days.push({ id: uid(), date: d, resortId: id, resortName: r ? r.name : el.dataset.name, type: r ? r.type : el.dataset.type, status: 'plan', topcard: r ? r.topcard : false, price: null, km: 0, hm: 0, runs: 0, note: '' });
      save();
    }
    if (UI.sheet) renderSheet(); render(); toast('Du bist dabei. Der Tag steht in deinem Kalender.');
  },

  /* TopCard */
  'tc-save'() { const v = +$('#tc-setup').value; if (v > 0) { S.topcard.price = v; save(); UI.tcAnim = true; render(); } else $('#tc-setup').focus(); },

  /* Kalender */
  'cal-nav'(el) { const [y, m] = UI.calMonth.split('-').map(Number), d = new Date(y, m - 1 + (+el.dataset.n), 1); UI.calMonth = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; render(); },
  'open-day'(el) { openSheet('day', { d: el.dataset.d }); },

  /* Gruppen */
  'save-name'() { const v = $('#pname').value.trim(); if (!v) return $('#pname').focus(); S.profile.name = v; save(); render(); toast('Name gespeichert'); },
  async 'create-group'() {
    const name = $('#gname').value.trim(); if (!name) return $('#gname').focus();
    try { const g = await Sync.createGroup(name); S.groups.push(g); save(); await Sync.pushMember(g.code, myMember()); UI.groupMsg = ''; UI.group = g.code; await refreshGroups(true); render(); toast(`Gruppe „${name}“ erstellt`); }
    catch (e) { UI.groupMsg = 'Die Gruppe konnte nicht erstellt werden. ' + e.message; render(); }
  },
  async 'join-group'(el) {
    const code = (el.dataset.code || $('#gcode').value).trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(code)) { UI.groupMsg = 'Der Code besteht aus sechs Buchstaben und Ziffern.'; return render(); }
    if (S.groups.some(g => g.code === code)) { UI.group = code; UI.joinCode = ''; return render(); }
    try {
      const g = await Sync.fetchGroup(code);
      if (!g) { UI.groupMsg = Sync.online() ? `Eine Gruppe mit dem Code ${code} gibt es nicht.` : `Den Code ${code} gibt es auf diesem Gerät nicht. Ohne Online-Speicher kannst du nur Gruppen beitreten, die auf diesem Gerät erstellt wurden.`; return render(); }
      S.groups.push({ code, name: g.name }); save(); await Sync.pushMember(code, myMember());
      UI.groupMsg = ''; UI.joinCode = ''; UI.group = code; await refreshGroups(true); render(); toast(`Du bist jetzt in „${g.name}“`);
    } catch (e) { UI.groupMsg = 'Beitreten hat nicht geklappt. ' + e.message; render(); }
  },
  'dismiss-join'() { UI.joinCode = ''; render(); },
  'open-group'(el) { UI.group = el.dataset.code; UI.leaveArm = false; refreshGroups(); render(); scrollTo(0, 0); },
  'back-groups'() { UI.group = null; UI.leaveArm = false; render(); },
  'group-sort'(el) { UI.groupSort = el.dataset.k; render(); },
  'refresh-groups'() { refreshGroups(true).then(() => toast('Aktualisiert')); },
  'open-member'(el) { openSheet('member', { id: el.dataset.id, code: el.dataset.code }); },
  async 'leave-group'(el) {
    if (!UI.leaveArm) { UI.leaveArm = true; return render(); }
    const code = el.dataset.code; UI.leaveArm = false;
    try { await Sync.leave(code, S.profile.id); } catch (e) { /* lokal trotzdem entfernen */ }
    S.groups = S.groups.filter(g => g.code !== code); delete UI.groups[code]; UI.group = null; save(); render(); toast('Gruppe verlassen');
  },
  async copy(el) {
    const txt = el.dataset.text;
    try { await navigator.clipboard.writeText(txt); toast(el.dataset.ok || 'Kopiert'); }
    catch (e) { const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (e2) { /* nichts */ } ta.remove(); toast(ok ? (el.dataset.ok || 'Kopiert') : 'Kopieren nicht möglich: ' + txt); }
  },

  /* Statistik */
  'stat-season'(el) { UI.statSeason = +el.dataset.k; render(); },

  /* Einstellungen */
  async 'sync-test'() {
    const sh = UI.sheet;
    if (!Sync.online()) { sh.syncOk = false; sh.syncMsg = 'Trage zuerst Projekt-Adresse und Schlüssel ein.'; return renderSheet(); }
    try { await Sync.rest('bt_groups?select=code&limit=1'); sh.syncOk = true; sh.syncMsg = 'Verbindung steht. Gruppen werden jetzt online gespeichert.'; UI.syncErr = ''; }
    catch (e) { sh.syncOk = false; sh.syncMsg = `Keine Verbindung: ${e.message}. Stimmen Adresse und Schlüssel, und wurde supabase-setup.sql ausgeführt?`; }
    renderSheet();
  },
  export() {
    const blob = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `bergtage-sicherung-${todayISO()}.json`; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  },
};

/* Eingaben (während des Tippens) */
const IN = {
  e(el) { UI.sheet.e[el.dataset.k] = el.value; },
  c(el) { UI.sheet.c[el.dataset.k] = el.value; },
  'picker-q'(el) { UI.sheet.q = el.value; UI.sheet.geo = null; $('#picker-list').innerHTML = pickerList(UI.sheet); },
  'tc-price'(el) { const v = +el.value; S.topcard.price = v > 0 ? v : null; save(); },
  'profile-name'(el) { S.profile.name = el.value.trim(); save(); },
  sync(el) { S.sync[el.dataset.k] = el.value.trim(); save(); },
  price(el) {
    const id = el.dataset.id, k = el.dataset.k, r = resortById(id), base = basePrices(r)[k], v = el.value === '' ? null : +el.value;
    S.prices[id] = S.prices[id] || {};
    if (v == null || !isFinite(v) || v === base) delete S.prices[id][k]; else S.prices[id][k] = Math.max(0, v);
    if (!Object.keys(S.prices[id]).length) delete S.prices[id];
    save();
    const tag = el.parentElement.querySelector('.src'); if (tag) { const p = pricesFor(r); tag.textContent = p.src[k] === 'est' ? 'geschätzt' : p.src[k] === 'user' ? 'angepasst' : 'recherchiert'; }
  },
};
/* Änderungen (Auswahl, Datum, Dateien) */
const CH = {
  e(el) { UI.sheet.e[el.dataset.k] = el.value; UI.sheet.err = ''; renderSheet(); },
  'e-resort'(el) { const sh = UI.sheet, r = resortById(el.value); sh.e.resortId = r ? r.id : null; if (r) { sh.e.type = r.type; sh.e.topcard = r.topcard; } sh.err = ''; renderSheet(); },
  'e-topcard'(el) { UI.sheet.e.topcard = el.checked; renderSheet(); },
  season(el) { const k = +el.value; S.season = k === seasonKey(todayISO()) ? null : k; save(); },
  async gpx(el) {
    const sh = UI.sheet, file = el.files[0]; if (!file) return;
    try { sh.gpx = applyGpx(sh.e, parseGPX(await file.text()), sh.isNew); sh.gpxName = file.name; sh.gpxErr = ''; }
    catch (e) { sh.gpxErr = e.message || 'Die Datei konnte nicht gelesen werden.'; }
    if (UI.sheet === sh) renderSheet();
  },
  async 'gpx-new'(el) {
    const file = el.files[0]; if (!file) return;
    try {
      const g = parseGPX(await file.text()), d = g.date || todayISO();
      const near = nearestResort(g.lat, g.lon, S.mode) || nearestResort(g.lat, g.lon);
      const ex = S.days.find(e => e.date === d && (near ? e.resortId === near.id : e.type === S.mode));
      const draft = ex ? { ...ex } : newDraft({ date: d, resortId: near ? near.id : null, type: near ? near.type : S.mode, topcard: near ? near.topcard : false });
      applyGpx(draft, g, !ex);
      openEntry(draft, { gpx: g, gpxName: file.name, isNew: !ex });
    } catch (e) { toast(e.message || 'Die GPX-Datei konnte nicht gelesen werden.'); }
    el.value = '';
  },
  async import(el) {
    const sh = UI.sheet, file = el.files[0]; if (!file) return;
    try {
      const raw = JSON.parse(await file.text());
      if (!raw || raw.v !== 1 || !Array.isArray(raw.days) || !Array.isArray(raw.favs)) throw new Error();
      S = Object.assign(DEFAULT_STATE(), raw); save(); sh.dataMsg = `Sicherung geladen: ${S.days.length} Tage, ${S.favs.length} Favoriten.`;
    } catch (e) { sh.dataMsg = 'Diese Datei ist keine Bergtage-Sicherung.'; }
    renderSheet(); render();
  },
};

document.addEventListener('click', ev => { const el = ev.target.closest('[data-act]'); if (el && ACT[el.dataset.act] && !el.disabled) ACT[el.dataset.act](el, ev); });
document.addEventListener('input', ev => { const el = ev.target.closest('[data-in]'); if (el && IN[el.dataset.in]) IN[el.dataset.in](el, ev); });
document.addEventListener('change', ev => { const el = ev.target.closest('[data-ch]'); if (el && CH[el.dataset.ch]) CH[el.dataset.ch](el, ev); });
document.addEventListener('keydown', ev => {
  if (ev.key === 'Escape' && UI.sheet) closeSheet();
  if (ev.key === 'Enter' && ev.target.matches('#gname, #gcode, #pname, #tc-setup')) { const b = ev.target.parentElement.querySelector('button'); if (b) b.click(); }
});

/* ---------- Höhenlinien im Hintergrund ---------- */
function drawTopo() {
  const c = $('#topo'); if (!c) return;
  const W = innerWidth, H = innerHeight, dpr = Math.min(devicePixelRatio || 1, 2), g = c.getContext('2d');
  c.width = W * dpr; c.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
  drawTopo.w = W; drawTopo.h = H;
  let seed = S.mode === 'ski' ? 11 : 47;
  const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const big = Math.max(W, H);
  // Ski: wenige markante Gipfel. Bike: mehr und flachere Kuppen.
  const peaks = Array.from({ length: S.mode === 'ski' ? 5 : 8 }, () => ({ x: rnd() * W, y: rnd() * H, r: (S.mode === 'ski' ? .2 + rnd() * .3 : .14 + rnd() * .2) * big, h: .5 + rnd() }));
  const f = (x, y) => { let v = 0; for (const p of peaks) { const dx = (x - p.x) / p.r, dy = (y - p.y) / p.r; v += p.h * Math.exp(-(dx * dx + dy * dy) * 2); } return v + .05 * Math.sin(x * .012 + 1) * Math.cos(y * .014); };
  const cell = 9, cols = Math.ceil(W / cell) + 1, rows = Math.ceil(H / cell) + 1, v = new Float32Array(cols * rows);
  let vmax = 0;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const z = f(i * cell, j * cell); v[j * cols + i] = z; if (z > vmax) vmax = z; }
  g.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--contour').trim() || 'rgba(0,0,0,.08)';
  const step = S.mode === 'ski' ? .085 : .07;
  for (let L = .1, li = 0; L < vmax; L += step, li++) {
    g.beginPath();
    for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) {
      const a = v[j * cols + i], b = v[j * cols + i + 1], cc = v[(j + 1) * cols + i + 1], d = v[(j + 1) * cols + i];
      const idx = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (cc > L ? 2 : 0) | (d > L ? 1 : 0);
      if (idx === 0 || idx === 15) continue;
      const x = i * cell, y = j * cell;
      const top = [x + cell * (L - a) / (b - a), y], right = [x + cell, y + cell * (L - b) / (cc - b)], bottom = [x + cell * (L - d) / (cc - d), y + cell], left = [x, y + cell * (L - a) / (d - a)];
      const seg = (p, q) => { g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); };
      switch (idx) {
        case 1: case 14: seg(left, bottom); break; case 2: case 13: seg(bottom, right); break; case 3: case 12: seg(left, right); break;
        case 4: case 11: seg(top, right); break; case 6: case 9: seg(top, bottom); break; case 7: case 8: seg(top, left); break;
        case 5: seg(top, left); seg(bottom, right); break; case 10: seg(top, right); seg(left, bottom); break;
      }
    }
    g.lineWidth = li % 5 === 0 ? 1.5 : .8;   // jede fünfte Linie als Zähllinie kräftiger, wie auf der Landeskarte
    g.stroke();
  }
}
let topoT = null;
addEventListener('resize', () => { clearTimeout(topoT); topoT = setTimeout(() => { if (innerWidth !== drawTopo.w || Math.abs(innerHeight - drawTopo.h) > 140) drawTopo(); }, 220); });

/* ---------- Start ---------- */
function readInviteHash() {
  const h = new URLSearchParams(location.hash.slice(1)), code = (h.get('join') || '').toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(code)) return;
  const cfg = h.get('cfg');
  if (cfg && !syncConfig()) { try { const [url, key] = JSON.parse(atob(cfg)); if (/^https:\/\//.test(url) && typeof key === 'string') { S.sync = { url, key }; save(); } } catch (e) { /* ungültig */ } }
  if (!S.groups.some(g => g.code === code)) UI.joinCode = code; else UI.group = code;
  UI.tab = 'gruppen';
  try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* file:// */ }
}
function start() {
  $('#btn-settings').innerHTML = ic('sliders');
  readInviteHash();
  render();
  refreshGroups(true);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (S.theme === 'system') render(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { if (UI.tab === 'gruppen' || UI.tab === 'kalender') refreshGroups(); if (!UI.sheet) render(); } });
  setInterval(() => { if (!document.hidden && (UI.tab === 'gruppen' || UI.tab === 'kalender')) refreshGroups(true); }, 60000);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { /* Schrift geladen, Layout steht */ });
}
start();
