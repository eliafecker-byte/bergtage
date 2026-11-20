'use strict';
/* Bergtage – interaktiver Pisten- und Trailplan.
   Daten: OpenStreetMap. Für die TopCard-Gebiete liegen sie vorab in data/pisten/<id>.json (tools/pisten.ps1),
   alle anderen Gebiete werden live über die Overpass API geladen und eine Woche im Browser gemerkt.
   Karte: Leaflet mit OpenTopoMap (Gelände und Höhenlinien). */

const PISTE_STYLE = {
  novice: ['#1D6FD1', 'leicht'], easy: ['#1D6FD1', 'leicht'],
  intermediate: ['#D7263D', 'mittel'],
  advanced: ['#15171A', 'schwer'], expert: ['#15171A', 'sehr schwer'],
  freeride: ['#F4511E', 'Freeride oder Skiroute', true], extreme: ['#F4511E', 'Freeride, extrem', true],
  unknown: ['#7C8A9B', 'Schwierigkeit unbekannt'],
};
const TRAIL_STYLE = d => {
  const n = parseInt(String(d).replace(/[^0-9]/g, ''), 10);
  if (isNaN(n)) return ['#7C8A9B', 'Schwierigkeit unbekannt'];
  if (n <= 1) return ['#1D6FD1', `S${n}, leicht`];
  if (n === 2) return ['#D7263D', 'S2, mittel'];
  return ['#15171A', `S${n}, schwer`];
};
const LIFT_NAMES = { cable_car: 'Luftseilbahn', gondola: 'Gondelbahn', mixed_lift: 'Kombibahn', chair_lift: 'Sesselbahn',
  drag_lift: 'Skilift', 't-bar': 'Bügellift', 'j-bar': 'Skilift', platter: 'Tellerlift', rope_tow: 'Seillift', magic_carpet: 'Förderband' };
const OVERPASS = ['https://lz4.overpass-api.de/api/interpreter', 'https://z.overpass-api.de/api/interpreter', 'https://overpass-api.de/api/interpreter'];

const PisteMap = {
  map: null, rid: null, mem: {}, elev: {}, layers: [], sel: null,

  html(r) {
    const bike = r.type === 'bike';
    const legend = bike
      ? '<span><i style="background:#1D6FD1"></i>S0–S1</span><span><i style="background:#D7263D"></i>S2</span><span><i style="background:#15171A"></i>S3+</span><span><i class="lift"></i>Lift</span>'
      : '<span><i style="background:#1D6FD1"></i>leicht</span><span><i style="background:#D7263D"></i>mittel</span><span><i style="background:#15171A"></i>schwer</span><span><i class="dash" style="background:repeating-linear-gradient(90deg,#F4511E 0 4px,transparent 4px 6px)"></i>Freeride</span><span><i class="lift"></i>Lift</span>';
    return `<div class="map-wrap">
        <div class="map" id="pmap" aria-label="${bike ? 'Trailplan' : 'Pistenplan'} ${esc(r.name)}"></div>
        <div class="map-legend">${legend}</div>
        <div class="map-status" id="pmap-status"><div>${bike ? 'Trails' : 'Pisten'} werden geladen …</div></div>
        <div id="pmap-info"></div>
      </div>
      <p class="fine">${bike ? 'Trails' : 'Pisten'} und Lifte aus OpenStreetMap, Karte von OpenTopoMap. Das ist kein offizieller Plan der Bergbahn: Namen oder einzelne ${bike ? 'Trails' : 'Pisten'} können fehlen, und offen oder gesperrt zeigt die Karte nicht. Tippe auf eine Linie für Details.</p>`;
  },

  status(html) { const s = $('#pmap-status'); if (s) { s.hidden = !html; s.innerHTML = html ? `<div>${html}</div>` : ''; } },

  unmount() { if (this.map) { this.map.remove(); this.map = null; } this.layers = []; this.sel = null; },

  async mount(r) {
    this.unmount();
    const el = $('#pmap');
    if (!el) return;
    if (!window.L) { this.status('Die Karte konnte nicht geladen werden. Prüfe die Internetverbindung.'); return; }
    this.rid = r.id;
    const map = this.map = L.map(el, { zoomControl: false, attributionControl: true }).setView([r.lat, r.lon], 13);
    L.control.zoom({ position: 'topright' }).addTo(map);
    L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      subdomains: 'abc', maxZoom: 17, detectRetina: false,
      attribution: 'Karte © <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA) · Daten © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    map.on('click', () => this.select(null));
    try {
      const data = await this.load(r);
      if (this.map !== map) return;          // inzwischen geschlossen oder anderes Gebiet
      this.draw(r, data);
    } catch (e) {
      if (this.map !== map) return;
      this.status(`Der ${r.type === 'bike' ? 'Trail' : 'Pisten'}plan konnte nicht geladen werden. Die Server von OpenStreetMap sind oft ausgelastet.<button class="btn" data-act="map-retry" data-id="${esc(r.id)}">Erneut versuchen</button>`);
    }
  },

  async load(r) {
    if (this.mem[r.id]) return this.mem[r.id];
    // 1. vorab gespeicherte Daten der TopCard-Gebiete
    try {
      const res = await fetch(`data/pisten/${encodeURIComponent(r.id)}.json`, { cache: 'force-cache' });
      if (res.ok) return (this.mem[r.id] = await res.json());
    } catch (e) { /* nicht vorhanden */ }
    // 2. im Browser gemerkt
    try {
      const c = JSON.parse(localStorage.getItem('bt.map.' + r.id));
      if (c && Date.now() - c.t < 7 * 864e5) return (this.mem[r.id] = c.d);
    } catch (e) { /* kein Cache */ }
    // 3. live von OpenStreetMap
    const dLat = .06, dLon = .09, bbox = [r.lat - dLat, r.lon - dLon, r.lat + dLat, r.lon + dLon].map(v => v.toFixed(4)).join(',');
    const sel = r.type === 'ski' ? `way["piste:type"="downhill"](${bbox});` : `way["mtb:scale"](${bbox});`;
    const q = `[out:json][timeout:60];(${sel}way["aerialway"](${bbox}););out geom tags;`;
    let lastErr;
    for (let i = 0; i < OVERPASS.length * 2; i++) {
      const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 75000);
      try {
        const res = await fetch(OVERPASS[i % OVERPASS.length], { method: 'POST', body: new URLSearchParams({ data: q }), signal: ctl.signal });
        clearTimeout(timer);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const d = this.convert(await res.json(), r.type);
        this.mem[r.id] = d;
        try { localStorage.setItem('bt.map.' + r.id, JSON.stringify({ t: Date.now(), d })); } catch (e) { /* zu gross oder voll: nur im Speicher */ }
        return d;
      } catch (e) { clearTimeout(timer); lastErr = e; await new Promise(ok => setTimeout(ok, 2500 * (i + 1))); }
    }
    throw lastErr || new Error('keine Daten');
  },

  convert(js, type) {
    const f = [];
    for (const e of js.elements || []) {
      if (!e.geometry || !e.tags) continue;
      const t = e.tags;
      let k, d;
      if (t.aerialway) { if (['station', 'pylon', 'goods', 'zip_line'].includes(t.aerialway)) continue; k = 'lift'; d = t.aerialway; }
      else if (type === 'ski') { k = 'piste'; d = t['piste:difficulty'] || 'unknown'; if (t['piste:grooming'] === 'backcountry' && !['freeride', 'extreme'].includes(d)) d = 'freeride'; }
      else { k = 'trail'; d = String(t['mtb:scale'] || ''); }
      f.push({ k, d, n: t['piste:name'] || t.name || '', r: t['piste:ref'] || t.ref || '', g: e.geometry.map(p => [+p.lat.toFixed(5), +p.lon.toFixed(5)]) });
    }
    return { v: 1, src: 'OpenStreetMap', f };
  },

  styleOf(ft) {
    if (ft.k === 'lift') return { color: '#0E1B2B', label: LIFT_NAMES[ft.d] || 'Lift', weight: 2.5 };
    const [color, label, dash] = ft.k === 'trail' ? TRAIL_STYLE(ft.d) : (PISTE_STYLE[ft.d] || PISTE_STYLE.unknown);
    return { color, label, dash: dash ? '6 5' : null, weight: 4 };
  },

  draw(r, data) {
    const map = this.map, order = { unknown: 0, novice: 1, easy: 1, intermediate: 2, advanced: 3, expert: 3, freeride: 4, extreme: 4 };
    const feats = (data.f || []).slice().sort((a, b) => (a.k === 'lift') - (b.k === 'lift') || (order[a.d] || 0) - (order[b.d] || 0));
    if (!feats.some(x => x.k !== 'lift')) {
      this.status(`Für dieses Gebiet sind in OpenStreetMap keine ${r.type === 'bike' ? 'Bike-Trails' : 'Pisten'} erfasst.`);
    } else this.status('');
    const bounds = [];
    for (const ft of feats) {
      const st = this.styleOf(ft);
      const line = L.polyline(ft.g, { color: st.color, weight: st.weight, opacity: .92, dashArray: st.dash, lineCap: 'round', lineJoin: 'round', interactive: false }).addTo(map);
      const hit = L.polyline(ft.g, { color: '#000', weight: 18, opacity: 0 }).addTo(map);   // breitere, unsichtbare Fläche zum Antippen
      hit.on('click', ev => { L.DomEvent.stopPropagation(ev); this.select(ft); });
      if (ft.k === 'lift') {
        for (const p of [ft.g[0], ft.g[ft.g.length - 1]]) L.circleMarker(p, { radius: 2.5, color: '#0E1B2B', weight: 1, fillColor: '#fff', fillOpacity: 1, interactive: false }).addTo(map);
      }
      ft._line = line; ft._st = st;
      this.layers.push(ft);
      ft.g.forEach(p => bounds.push(p));
    }
    if (bounds.length) map.fitBounds(bounds, { padding: [24, 24], maxZoom: 15 });
  },

  /* Antippen: alle Abschnitte mit gleichem Namen und gleicher Schwierigkeit gehören zur selben Piste. */
  async select(ft) {
    for (const x of this.layers) x._line.setStyle({ weight: x._st.weight, opacity: .92 });
    const box = $('#pmap-info');
    if (!ft) { this.sel = null; if (box) box.innerHTML = ''; return; }
    const key = ft.n || ft.r ? `${ft.k}|${ft.d}|${ft.n}|${ft.r}` : null;
    const group = key ? this.layers.filter(x => `${x.k}|${x.d}|${x.n}|${x.r}` === key) : [ft];
    for (const x of this.layers) if (!group.includes(x)) x._line.setStyle({ opacity: .35 });
    for (const x of group) { x._line.setStyle({ weight: x._st.weight + 3, opacity: 1 }); x._line.bringToFront(); }
    this.sel = ft;
    let km = 0;
    for (const x of group) for (let i = 1; i < x.g.length; i++) km += haversine(x.g[i - 1][0], x.g[i - 1][1], x.g[i][0], x.g[i][1]);
    const st = ft._st, isLift = ft.k === 'lift';
    const title = ft.n ? (ft.r && !ft.n.includes(ft.r) ? `${ft.r} · ${ft.n}` : ft.n) : ft.r ? `${isLift ? '' : ft.k === 'trail' ? 'Trail ' : 'Piste '}${ft.r}` : isLift ? st.label : (ft.k === 'trail' ? 'Trail ohne Namen' : 'Piste ohne Namen');
    const render = hm => {
      if (!box || this.sel !== ft) return;
      box.innerHTML = `<div class="map-info"><span class="dot" style="background:${st.color}"></span>
        <div><b>${esc(title)}</b><div class="sub">${esc(isLift && title !== st.label ? st.label : isLift ? 'Lift' : st.label)} · ${num(km, km < 10 ? 1 : 0)} km${hm == null ? ' · Höhenmeter werden berechnet …' : hm === false ? '' : ` · ${num(hm)} Hm`}</div></div>
        <button class="icon-btn" data-act="map-close" aria-label="Details schliessen">${ic('x')}</button></div>`;
    };
    render(null);
    render(await this.heightDiff(group));
  },

  /* Höhendifferenz aus den Endpunkten aller Abschnitte (Höhenmodell von Open-Meteo, max. 100 Punkte). */
  async heightDiff(group) {
    const pts = [];
    for (const x of group) { pts.push(x.g[0], x.g[x.g.length - 1]); }
    const uniq = [...new Map(pts.map(p => [p.join(','), p])).values()].slice(0, 100);
    const key = uniq.map(p => p.join(',')).join(';');
    if (this.elev[key] !== undefined) return this.elev[key];
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${uniq.map(p => p[0]).join(',')}&longitude=${uniq.map(p => p[1]).join(',')}`);
      const js = await res.json();
      const e = (js.elevation || []).filter(v => typeof v === 'number');
      return (this.elev[key] = e.length >= 2 ? Math.round(Math.max(...e) - Math.min(...e)) : false);
    } catch (err) { return false; }
  },
};
