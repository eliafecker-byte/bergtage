'use strict';
/* Bergtage – Logik ohne Oberfläche: Datum, Feiertage, Speicher, Preise, Wetter, Andrang, Ampel, GPX, Gruppenspeicher. */

/* ---------- Helfer ---------- */
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseISO = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const todayISO = () => iso(new Date());
const addDays = (s, n) => { const d = parseISO(s); d.setDate(d.getDate() + n); return iso(d); };
const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const WD_LONG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (n, dec = 0) => Number(n || 0).toLocaleString('de-CH', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const chf = n => 'CHF ' + num(Math.round(n));
const fmtDate = s => { const d = parseISO(s); return `${WD[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}.`; };
const fmtDateLong = s => { const d = parseISO(s); return `${WD_LONG[d.getDay()]}, ${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function isoWeek(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t - y0) / 864e5 + 1) / 7);
}

/* ---------- Feiertage und Schulferien (Schweiz) ---------- */
function easter(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4,
    f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
    i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  return new Date(y, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1);
}
const _hol = {};
function holidaysOf(y) {
  if (_hol[y]) return _hol[y];
  const e = easter(y), map = {};
  const put = (d, n) => { map[iso(d)] = n; };
  const off = n => { const d = new Date(e); d.setDate(d.getDate() + n); return d; };
  put(new Date(y, 0, 1), 'Neujahr'); put(new Date(y, 0, 2), 'Berchtoldstag');
  put(off(-2), 'Karfreitag'); put(off(0), 'Ostern'); put(off(1), 'Ostermontag');
  put(new Date(y, 4, 1), 'Tag der Arbeit'); put(off(39), 'Auffahrt'); put(off(49), 'Pfingsten'); put(off(50), 'Pfingstmontag');
  put(new Date(y, 7, 1), 'Bundesfeier'); put(new Date(y, 11, 25), 'Weihnachten'); put(new Date(y, 11, 26), 'Stephanstag');
  return (_hol[y] = map);
}
const holidayName = s => holidaysOf(+s.slice(0, 4))[s] || null;

/* Schulferien als Modell über alle Kantone: w = Anteil der Schweiz, der ungefähr frei hat (0–1).
   Die Kantone staffeln ihre Ferien, deshalb sind das Richtwerte pro Kalenderwoche, keine exakten Daten. */
function schoolHoliday(s) {
  const d = parseISO(s), m = d.getMonth() + 1, day = d.getDate(), w = isoWeek(d);
  if ((m === 12 && day >= 21) || (m === 1 && day <= 6))
    return { kind: 'xmas', name: 'Weihnachtsferien', w: (m === 12 && day < 24) || (m === 1 && day > 4) ? 0.7 : 1 };
  if (m <= 3) { const v = { 4: .15, 5: .45, 6: .8, 7: 1, 8: .9, 9: .5, 10: .2 }[w]; if (v) return { kind: 'sport', name: 'Sportferien', w: v }; }
  if (m === 4 || (m === 3 && w >= 14) || (m === 5 && w <= 17)) { if (w >= 14 && w <= 17) return { kind: 'spring', name: 'Frühlingsferien', w: .4 }; }
  if (m >= 6 && m <= 8) { const v = { 27: .6, 28: 1, 29: 1, 30: 1, 31: 1, 32: .9, 33: .5 }[w]; if (v) return { kind: 'summer', name: 'Sommerferien', w: v }; }
  if (m >= 9 && m <= 10) { const v = { 39: .3, 40: .7, 41: .8, 42: .6, 43: .3 }[w]; if (v) return { kind: 'autumn', name: 'Herbstferien', w: v }; }
  return null;
}
function isHighSeason(s, type) {
  const h = schoolHoliday(s); if (!h) return false;
  return type === 'ski' ? (h.kind === 'xmas' || (h.kind === 'sport' && h.w >= .45)) : (h.kind === 'summer' && h.w >= .9);
}

/* ---------- Saison (1. Mai bis 30. April, wie die TopCard) ---------- */
const seasonKey = s => { const y = +s.slice(0, 4), m = +s.slice(5, 7); return m >= 5 ? y : y - 1; };
const seasonLabel = k => `${k}/${String(k + 1).slice(2)}`;
const seasonRange = k => [`${k}-05-01`, `${k + 1}-04-30`];

/* ---------- Speicher ---------- */
const LS_KEY = 'bergtage.v1';
const MEMBER_COLORS = ['#1D6FD1', '#D7263D', '#1E9E5A', '#8E44AD', '#E08A00', '#0E8C8C', '#C2185B', '#5D6D7E'];
const DEFAULT_STATE = () => ({
  v: 1, mode: 'ski', theme: 'system',
  favs: ['arosa-lenzerheide', 'laax', 'davos-parsenn', 'bike-lenzerheide', 'bike-laax', 'bike-davos'],
  custom: [], days: [],
  topcard: { price: null }, prices: {},
  profile: { id: uid(), name: '', color: MEMBER_COLORS[Math.floor(Math.random() * MEMBER_COLORS.length)] },
  groups: [], season: null, ops: {},
  owner: null,      // Konto, dem diese Daten gehören (null = vor der Anmeldung erfasst)
  dirtyAt: 0,       // Zeitpunkt der letzten noch nicht hochgeladenen Änderung
});
let S = (() => {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY));
    if (raw && raw.v === 1) { delete raw.sync; return Object.assign(DEFAULT_STATE(), raw); }
  } catch (e) { /* leer oder gesperrt */ }
  return DEFAULT_STATE();
})();
let _onSave = null;
/* save(true) schreibt nur den lokalen Zwischenspeicher, ohne die Änderung zum Hochladen vorzumerken. */
function save(clean) {
  if (!clean) S.dirtyAt = Date.now();
  try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) { /* Speicher nicht verfügbar */ }
  if (_onSave && !clean) _onSave();
}
const currentSeason = () => S.season || seasonKey(todayISO());

/* ---------- Gebiete ---------- */
const allResorts = () => RESORTS.concat(S.custom);
const resortById = id => RESORTS.find(r => r.id === id) || S.custom.find(r => r.id === id) || null;
const favResorts = type => S.favs.map(resortById).filter(r => r && (!type || r.type === type));
function nearestResort(lat, lon, type) {
  let best = null, bd = 1e9;
  for (const r of allResorts()) {
    if (type && r.type !== type) continue;
    const d = haversine(lat, lon, r.lat, r.lon) - (S.favs.includes(r.id) ? 2 : 0);
    if (d < bd) { bd = d; best = r; }
  }
  return bd <= 15 ? best : null;
}

/* ---------- Tageskartenpreise ---------- */
function basePrices(r) {
  if (PRICES[r.id]) return PRICES[r.id];
  const i = clamp(r.size, 1, 5) - 1, wd = r.type === 'ski' ? [48, 58, 68, 78, 86][i] : [32, 38, 44, 50, 56][i];
  return { wd, we: wd + (r.type === 'ski' ? 6 : 0), hs: wd + (r.type === 'ski' ? 10 : 2), est: { wd: 1, we: 1, hs: 1 } };
}
function pricesFor(r) {
  const b = basePrices(r), o = S.prices[r.id] || {}, out = { src: {}, note: b.src || '' };
  for (const k of ['wd', 'we', 'hs']) {
    out[k] = o[k] != null ? o[k] : b[k];
    out.src[k] = o[k] != null ? 'user' : (b.est && b.est[k] ? 'est' : 'ok');
  }
  return out;
}
const PRICE_CAT = { wd: 'Wochentag', we: 'Wochenende', hs: 'Hochsaison' };
function priceCat(s, type) {
  if (isHighSeason(s, type)) return 'hs';
  const dow = parseISO(s).getDay();
  return (dow === 0 || dow === 6 || holidayName(s)) ? 'we' : 'wd';
}
function dayPrice(r, s) { const cat = priceCat(s, r.type), p = pricesFor(r); return { cat, price: p[cat], src: p.src[cat] }; }
function entryPrice(e) {
  if (e.price != null) return e.price;
  const r = resortById(e.resortId);
  return r ? dayPrice(r, e.date).price : 0;
}

/* ---------- Saison und Betriebszeiten ----------
   Ein Plan, keine Live-Meldung: Die App kennt Saisonstart, Saisonende, erste Bergfahrt und letzte Talfahrt,
   aber nicht, ob eine Anlage wegen Wind oder Schneemangel steht. */
function baseOps(r) {
  if (OPS[r.id]) return OPS[r.id];
  const all = { from: 1, to: 1, first: 1, last: 1 };
  if (r.type === 'ski') {
    const [from, to] = r.top >= 2800 ? ['11-28', '04-18'] : r.top >= 2200 ? ['12-12', '04-05'] : ['12-19', '03-21'];
    return { from, to, first: '08:30', last: '16:30', est: all };
  }
  const [from, to] = r.top >= 2000 ? ['06-13', '10-18'] : ['05-01', '10-31'];
  return { from, to, first: '09:00', last: '17:00', est: all };
}
function opsFor(r) {
  const b = baseOps(r), u = (S.ops || {})[r.id] || {}, out = { src: {}, note: b.src || '', est: false };
  for (const k of ['from', 'to', 'first', 'last']) {
    out[k] = u[k] || b[k];
    out.src[k] = u[k] ? 'user' : (b.est && b.est[k] ? 'est' : 'ok');
    if (out.src[k] === 'est') out.est = true;
  }
  return out;
}
/* Die Saison, die am Tag d läuft, sonst die nächste. open sagt, ob d innerhalb liegt. */
function seasonAt(r, d) {
  const o = opsFor(r), y = +d.slice(0, 4), wrap = o.from > o.to;
  for (const Y of [y - 1, y, y + 1]) {
    const start = `${Y}-${o.from}`, end = `${wrap ? Y + 1 : Y}-${o.to}`;
    if (end >= d) return { start, end, open: d >= start, o };
  }
  return { start: d, end: d, open: true, o };
}
/* Zustand jetzt: open = in Betrieb, soon = öffnet heute noch, closed = geschlossen. */
function openState(r, now = new Date()) {
  const t = iso(now), hm = `${pad(now.getHours())}:${pad(now.getMinutes())}`, s = seasonAt(r, t), o = s.o;
  const days = Math.round((parseISO(s.start) - parseISO(t)) / 864e5);
  if (!s.open) return { state: 'closed', text: `Geschlossen · Saisonstart ${fmtDate(s.start)}${days <= 60 ? ` (in ${days} ${days === 1 ? 'Tag' : 'Tagen'})` : s.start.slice(0, 4)}`, s };
  if (hm < o.first) return { state: 'soon', text: `Öffnet heute um ${o.first} · letzte Talfahrt ${o.last}`, s };
  if (hm <= o.last) return { state: 'open', text: `Geöffnet · letzte Talfahrt ${o.last}`, s };
  return { state: 'closed', text: t < s.end ? `Für heute geschlossen · morgen ab ${o.first}` : 'Für heute geschlossen · letzter Saisontag', s };
}

/* ---------- Statistik ---------- */
function statsOf(days, cardPrice, sk) {
  const [from, to] = seasonRange(sk);
  const done = days.filter(d => d.status === 'done' && d.date >= from && d.date <= to);
  const st = { ski: 0, bike: 0, km: 0, hm: 0, runs: 0, value: 0, cardDays: 0, kmSki: 0, kmBike: 0, hmSki: 0, hmBike: 0, fav: null, favCount: 0, byMonth: {}, byResort: {} };
  for (const d of done) {
    st[d.type === 'bike' ? 'bike' : 'ski']++;
    st.km += +d.km || 0; st.hm += +d.hm || 0; st.runs += +d.runs || 0;
    st[d.type === 'bike' ? 'kmBike' : 'kmSki'] += +d.km || 0; st[d.type === 'bike' ? 'hmBike' : 'hmSki'] += +d.hm || 0;
    if (d.topcard) { st.value += +d.value || 0; st.cardDays++; }
    const mk = d.date.slice(0, 7); st.byMonth[mk] = st.byMonth[mk] || { ski: 0, bike: 0 }; st.byMonth[mk][d.type === 'bike' ? 'bike' : 'ski']++;
    const rk = d.resortName || d.resortId;
    const br = st.byResort[rk] = st.byResort[rk] || { name: rk, type: d.type, days: 0, value: 0, km: 0 };
    br.days++; br.km += +d.km || 0; if (d.topcard) br.value += +d.value || 0;
  }
  for (const k in st.byResort) if (st.byResort[k].days > st.favCount) { st.favCount = st.byResort[k].days; st.fav = st.byResort[k].name; }
  st.days = st.ski + st.bike;
  st.saved = cardPrice ? st.value - cardPrice : null;
  return st;
}
/* Eigene Tage in der Form, wie sie auch in Gruppen geteilt werden. */
function myDaysShared() {
  return S.days.map(e => {
    const r = resortById(e.resortId);
    return { id: e.id, date: e.date, resortId: e.resortId, resortName: r ? r.name : (e.resortName || 'Unbekanntes Gebiet'), type: e.type, status: e.status,
      km: +e.km || 0, hm: +e.hm || 0, runs: +e.runs || 0, topcard: !!e.topcard, value: e.status === 'done' && e.topcard ? entryPrice(e) : 0 };
  });
}
const myStats = (sk = currentSeason()) => statsOf(myDaysShared(), S.topcard.price, sk);

/* ---------- Wetter (Open-Meteo, ohne API-Key) ---------- */
const WMO = c => c === 0 ? ['sun', 'Klar'] : c === 1 ? ['partly', 'Meist sonnig'] : c === 2 ? ['partly', 'Wolkig'] : c === 3 ? ['cloud', 'Bedeckt']
  : c <= 48 ? ['fog', 'Nebel'] : c <= 57 ? ['rain', 'Nieselregen'] : c <= 67 ? ['rain', 'Regen'] : c <= 77 ? ['snow', 'Schneefall']
  : c <= 82 ? ['rain', 'Regenschauer'] : c <= 86 ? ['snow', 'Schneeschauer'] : ['storm', 'Gewitter'];

const Weather = {
  TTL: 45 * 60 * 1000, mem: {}, pending: {}, failed: {},
  cached(r) {
    if (this.mem[r.id]) return this.mem[r.id];
    try { const raw = JSON.parse(localStorage.getItem('bt.wx.' + r.id)); if (raw && raw.days) return (this.mem[r.id] = raw); } catch (e) { /* kein Cache */ }
    return null;
  },
  isFresh(r) { const w = this.cached(r); return !!w && Date.now() - w.at < this.TTL && w.key === this.key(r); },
  key: r => `${r.lat},${r.lon},${r.base},${r.top}`,
  load(r, force) {
    if (!force && this.isFresh(r)) return Promise.resolve(this.cached(r));
    if (this.pending[r.id]) return this.pending[r.id];
    const url = 'https://api.open-meteo.com/v1/forecast'
      + `?latitude=${r.lat},${r.lat}&longitude=${r.lon},${r.lon}&elevation=${r.base},${r.top}`
      + '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,snowfall_sum,sunshine_duration,daylight_duration,wind_speed_10m_max,wind_gusts_10m_max,precipitation_probability_max'
      + '&hourly=snow_depth,cloud_cover&current=temperature_2m,weather_code,wind_speed_10m,cloud_cover'
      + '&past_days=3&forecast_days=14&timezone=auto';
    const p = fetch(url).then(res => { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then(js => {
        const w = this.process(r, js);
        this.mem[r.id] = w; delete this.failed[r.id];
        try { localStorage.setItem('bt.wx.' + r.id, JSON.stringify(w)); } catch (e) { /* voll */ }
        return w;
      })
      .catch(err => { this.failed[r.id] = err.message || 'Fehler'; throw err; })
      .finally(() => { delete this.pending[r.id]; });
    return (this.pending[r.id] = p);
  },
  process(r, js) {
    const [lo, hi] = Array.isArray(js) ? js : [js, js];
    const D = hi.daily, L = lo.daily, H = hi.hourly, days = {};
    D.time.forEach((d, i) => {
      let cs = 0, cn = 0;
      for (let h = 8; h <= 17; h++) { const v = H.cloud_cover[i * 24 + h]; if (v != null) { cs += v; cn++; } }
      const depth = H.snow_depth[i * 24 + 12] ?? H.snow_depth[i * 24 + 6];
      const sun = D.sunshine_duration[i] || 0, light = D.daylight_duration[i] || 36000;
      days[d] = {
        code: D.weather_code[i],
        tTopMax: D.temperature_2m_max[i], tTopMin: D.temperature_2m_min[i],
        tBaseMax: L.temperature_2m_max[i], tBaseMin: L.temperature_2m_min[i],
        precip: D.precipitation_sum[i] || 0, rain: D.rain_sum[i] || 0, snow: D.snowfall_sum[i] || 0,
        // Sonnenstunden gegen die nutzbare Tageslänge (Berge beschatten Morgen und Abend)
        sunH: sun / 3600, sunFrac: clamp(sun / Math.max(1, light - 5400), 0, 1),
        wind: D.wind_speed_10m_max[i], gust: D.wind_gusts_10m_max[i],
        cloud: cn ? cs / cn : null, depth: depth != null ? depth * 100 : null,
        pop: D.precipitation_probability_max[i],
      };
    });
    return { at: Date.now(), key: this.key(r), days,
      now: { tTop: hi.current?.temperature_2m, tBase: lo.current?.temperature_2m, code: hi.current?.weather_code, wind: hi.current?.wind_speed_10m, cloud: hi.current?.cloud_cover } };
  },
};
const wxDay = (w, d) => (w && w.days[d]) || null;
function freshSnow(w, d, n) { let s = 0; for (let i = 0; i < n; i++) { const x = wxDay(w, addDays(d, -i)); if (x) s += x.snow; } return s; }
function rainPast(w, d, n) { let s = 0; for (let i = 1; i <= n; i++) { const x = wxDay(w, addDays(d, -i)); if (x) s += x.precip; } return s; }
/* Trail-Nässe: Niederschlag von heute zählt voll, die Vortage klingen ab. */
function trailState(w, d) {
  const wts = [1, .6, .35, .2]; let idx = 0;
  wts.forEach((k, i) => { const x = wxDay(w, addDays(d, -i)); if (x) idx += x.precip * k; });
  const label = idx < 1.5 ? 'trocken' : idx < 6 ? 'feucht' : idx < 16 ? 'nass' : 'sehr nass';
  return { idx, label, level: idx < 1.5 ? 0 : idx < 6 ? 1 : idx < 16 ? 2 : 3 };
}

/* ---------- Andrang (Schätzung) ---------- */
const CROWD_LABEL = { low: 'wenig los', mid: 'mittel', high: 'viel los' };
function crowd(r, d, w) {
  const dt = parseISO(d), dow = dt.getDay(), m = dt.getMonth() + 1, why = [];
  let s = [46, 14, 13, 15, 16, 26, 52][dow];
  why.push(WD_LONG[dow]);
  const hol = holidayName(d);
  if (hol) { s = Math.max(s, 50); why.push(hol); }
  const sh = schoolHoliday(d);
  if (sh) {
    const rel = r.type === 'ski' ? { xmas: 42, sport: 34, spring: 10 }[sh.kind] : { summer: 22, autumn: 16, spring: 12 }[sh.kind];
    if (rel) { s += rel * sh.w; why.push(sh.w < .5 ? `${sh.name} (teilweise)` : sh.name); }
  }
  const x = wxDay(w, d);
  if (x) {
    const good = x.sunFrac > .6 && x.precip < 1, bad = x.precip >= 6 || x.sunFrac < .15 || x.gust >= 70;
    if (r.type === 'ski' && freshSnow(w, d, 2) >= 10 && x.sunFrac > .5) { s += 18; why.push('Sonne nach Neuschnee'); }
    if (good) { s *= 1.2; why.push('schönes Wetter'); } else if (bad) { s *= .6; why.push('schlechtes Wetter'); }
    if (r.type === 'ski' && x.depth != null && x.depth < 15) { s *= .4; why.push('kaum Schnee'); }
    if (r.type === 'bike' && ((x.depth != null && x.depth > 10) || x.tTopMax < 2)) { s *= .3; why.push('winterliche Verhältnisse'); }
  } else {
    if (r.type === 'ski' && m >= 5 && m <= 10) { s *= .4; why.push('ausserhalb der Wintersaison'); }
    if (r.type === 'bike' && (m >= 11 || m <= 4)) { s *= .3; why.push('ausserhalb der Bikesaison'); }
  }
  const se = seasonAt(r, d);
  if (!se.open) { s *= .15; why.push(se.o.est ? 'voraussichtlich ausserhalb der Saison' : 'ausserhalb der Saison'); }
  s *= .7 + r.size * .1;
  if (r.size >= 4) why.push('grosses, beliebtes Gebiet'); else if (r.size <= 2) why.push('kleines Gebiet');
  s = clamp(Math.round(s), 0, 100);
  return { score: s, level: s < 34 ? 'low' : s < 62 ? 'mid' : 'high', why };
}

/* ---------- Gesamtbewertung (Ampel) ---------- */
const RATE_LABEL = { top: 'Top-Tag', ok: 'okay', no: 'lieber nicht' };
function rate(r, d, w) {
  const x = wxDay(w, d); if (!x) return null;
  const cr = crowd(r, d, w), why = [];
  let s;
  const add = (n, t) => { s += n; why.push({ n, t }); };
  if (r.type === 'ski') {
    s = 45 + x.sunFrac * 25;
    const f = freshSnow(w, d, 2);
    if (x.sunFrac >= .6) why.push({ n: 1, t: `${num(x.sunH)} h Sonne` });
    else if (x.sunFrac <= .2 && x.snow < 3) add(-8, 'kaum Sonne, flaches Licht');
    if (f >= 20) add(18, `${num(f)} cm Neuschnee`); else if (f >= 10) add(12, `${num(f)} cm Neuschnee`); else if (f >= 4) add(5, `${num(f)} cm Neuschnee`);
    if (x.snow >= 15 && x.sunFrac < .3) add(-6, 'starker Schneefall, schlechte Sicht');
    if (x.rain >= 2) add(-28, 'Regen bis auf den Berg'); else if (x.rain >= .5) add(-10, 'etwas Regen am Berg');
    if (x.gust >= 80) add(-35, 'Sturm, Lifte können stehen'); else if (x.gust >= 60) add(-18, 'starker Wind'); else if (x.gust >= 45) add(-6, 'windig');
    if (x.depth != null) { if (x.depth < 15) add(-35, 'kaum Schneeunterlage'); else if (x.depth < 35) add(-14, 'dünne Schneedecke'); else if (x.depth >= 100) add(5, 'gute Schneelage'); }
    if (x.tTopMax <= -15) add(-8, 'sehr kalt am Berg'); else if (x.tTopMax >= 6) add(-8, 'sehr mild, weicher Schnee');
    if (cr.level === 'high') add(-10, 'viel Andrang erwartet'); else if (cr.level === 'low') add(4, 'wenig Andrang');
  } else {
    s = 50 + x.sunFrac * 20;
    const tr = trailState(w, d), prev = tr.idx - x.precip;
    if (x.sunFrac >= .6) why.push({ n: 1, t: `${num(x.sunH)} h Sonne` });
    if (x.code >= 95) add(-30, 'Gewitter');
    if (x.precip >= 15) add(-45, 'Dauerregen'); else if (x.precip >= 5) add(-28, 'Regen'); else if (x.precip >= 1) add(-10, 'etwas Regen');
    if (prev >= 12) add(-18, 'Trails sehr nass'); else if (prev >= 5) add(-10, 'Trails nass vom Regen der Vortage'); else if (prev >= 1.5) add(-3, 'Trails noch feucht');
    else if (tr.idx < 1.5) add(6, 'Trails trocken');
    if (x.depth != null && x.depth >= 5) add(-40, 'Schnee auf den Trails'); else if (x.snow >= 2) add(-15, 'Schneefall am Berg');
    if (x.tTopMax < 2) add(-30, 'eisig am Berg'); else if (x.tTopMax < 7) add(-14, 'kalt am Berg'); else if (x.tBaseMax >= 32) add(-6, 'sehr heiss');
    if (x.gust >= 70) add(-15, 'stürmisch');
    if (cr.level === 'high') add(-6, 'viel Andrang erwartet'); else if (cr.level === 'low') add(3, 'wenig Andrang');
  }
  const se = seasonAt(r, d);
  if (!se.open) { s = Math.min(s, 20); why.unshift({ n: -1, t: `${se.o.est ? 'voraussichtlich ' : ''}ausserhalb der Saison, Start ${fmtDate(se.start)}${se.start.slice(0, 4)}` }); }
  s = clamp(Math.round(s), 0, 100);
  return { score: s, level: s >= 66 ? 'top' : s >= 42 ? 'ok' : 'no', why, crowd: cr, closed: !se.open };
}

/* ---------- GPX auswerten ---------- */
function haversine(la1, lo1, la2, lo2) {
  const R = 6371, p = Math.PI / 180, a = Math.sin((la2 - la1) * p / 2) ** 2 + Math.cos(la1 * p) * Math.cos(la2 * p) * Math.sin((lo2 - lo1) * p / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
function parseGPX(text) {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new Error('Die Datei ist kein gültiges GPX.');
  let nodes = [...doc.getElementsByTagName('trkpt')];
  if (nodes.length < 2) nodes = [...doc.getElementsByTagName('rtept')];
  const pts = nodes.map(p => {
    const e = p.getElementsByTagName('ele')[0], t = p.getElementsByTagName('time')[0];
    return { lat: +p.getAttribute('lat'), lon: +p.getAttribute('lon'), ele: e ? parseFloat(e.textContent) : NaN, t: t ? Date.parse(t.textContent) : NaN };
  }).filter(p => isFinite(p.lat) && isFinite(p.lon));
  if (pts.length < 2) throw new Error('Im GPX wurden keine Trackpunkte gefunden.');
  const hasEle = pts.filter(p => isFinite(p.ele)).length > pts.length * .8;
  // Höhe glätten (gleitendes Mittel über 5 Punkte), damit GPS-Rauschen keine Höhenmeter erfindet
  const ele = pts.map((p, i) => {
    let s = 0, n = 0;
    for (let j = Math.max(0, i - 2); j <= Math.min(pts.length - 1, i + 2); j++) if (isFinite(pts[j].ele)) { s += pts[j].ele; n++; }
    return n ? s / n : NaN;
  });
  const TH = 8;                       // erst ab 8 m zählt eine Höhenänderung
  let km = 0, kmDown = 0, up = 0, down = 0, runs = 0, runDrop = 0, climb = 0, ref = ele[0], dir = 0, maxSpeed = 0, moving = 0;
  for (let i = 1; i < pts.length; i++) {
    const seg = haversine(pts[i - 1].lat, pts[i - 1].lon, pts[i].lat, pts[i].lon);
    if (seg > 2) continue;            // GPS-Sprung
    km += seg;
    if (hasEle && isFinite(ele[i])) {
      if (!isFinite(ref)) ref = ele[i];
      const dE = ele[i] - ref;
      if (dE <= -TH) { down += -dE; runDrop += -dE; climb = 0; ref = ele[i]; dir = -1; }
      else if (dE >= TH) { up += dE; climb += dE; ref = ele[i]; dir = 1; if (climb >= 40) { if (runDrop >= 80) runs++; runDrop = 0; } }
      if (dir === -1) kmDown += seg;
    }
    const dt = (pts[i].t - pts[i - 1].t) / 1000;
    if (dt > 0 && dt < 60) { const v = seg / dt * 3600; if (v > 2) moving += dt; if (v < 150 && v > maxSpeed && i > 2) {
      // Geschwindigkeit über 4 Punkte mitteln, einzelne Ausreisser ignorieren
      const j = Math.max(0, i - 4), dd = pts.slice(j, i + 1).reduce((a, p, k, arr) => k ? a + haversine(arr[k - 1].lat, arr[k - 1].lon, p.lat, p.lon) : 0, 0), tt = (pts[i].t - pts[j].t) / 1000;
      if (tt > 0) maxSpeed = Math.max(maxSpeed, Math.min(v, dd / tt * 3600));
    } }
  }
  if (runDrop >= 80) runs++;
  const t0 = pts.find(p => isFinite(p.t)), tN = [...pts].reverse().find(p => isFinite(p.t)), els = ele.filter(isFinite);
  return {
    date: t0 ? iso(new Date(t0.t)) : null, points: pts.length,
    km, kmDown: hasEle ? kmDown : km, up, down, runs, hasEle,
    maxEle: els.length ? Math.max(...els) : null, minEle: els.length ? Math.min(...els) : null,
    maxSpeed, durationMin: t0 && tN ? (tN.t - t0.t) / 60000 : null, movingMin: moving / 60,
    lat: pts[0].lat, lon: pts[0].lon,
  };
}

