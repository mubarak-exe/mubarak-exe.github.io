/* "The map learns itself": the home page hero animation, drawn faintly behind the headline.
   It uses the real street network of central San Francisco (OpenStreetMap, loaded from sf-roads.js only on
   the home page), three neighbourhoods in a fixed order, one per loop. One loop of the research pipeline:
     1. GPS pings    - on an empty background, taxi trips report their position, scattered by GPS noise
     2. Roads        - map matching: each ping slides onto the street it came from while the complete
                       street map draws itself in; the travelled streets stand out
     3. Travel times - a sweep passes; each travelled street thickens by how slow it is, a few show a
                       travel time, then taxis drive the map
   The taxis are REAL: 2-minute slices of San Francisco cab trips on busy Saturday evenings (Cabspotting,
   map-matched to the same streets; built by scripts/build-sf-taxis.py into sf-taxis.js), replayed 12x faster:
   each neighbourhood plays the moment that was busiest there. The pings, lit streets and travel-time
   labels are illustrative. If the trips can't load, taxis wander the streets instead; if the streets can't
   load, a synthetic city is used. No pointer interaction. Reduced motion: one still frame.
   SHOW_ON_LIVE keeps it off mubarak.sh until approved; it always runs in previews and local tests. */
(function (g) {
  "use strict";
  const SITE = g.SITE, doc = document, root = doc.documentElement;
  const SHOW_ON_LIVE = true;   // approved by him on 2026-11-14
  const isLive = /(^|\.)mubarak\.sh$/i.test(location.hostname);
  const ROADS_SRC = "assets/sf-roads.js";
  const TAXIS_SRC = "assets/sf-taxis.js";
  const SPEEDUP = 12;   // real taxi time runs 12x faster than the animation clock
  const TRAIL_S = 8;    // each taxi trails its last 8 real seconds of road

  // Timeline of one loop, in ms.
  const T = { pings: 200, match: 4200, learn: 6800, ride: 7600, fade: 15500, end: 17000 };
  const STEP_AT = [T.pings, T.match, T.learn];   // when each caption step lights up
  const REVEAL_END = T.match + 1300 + 250 + 700; // by now the complete street map has drawn itself in
  // Neighbourhoods (view centres). The loops show SEQUENCE in this fixed order, then repeat (chosen
  // 2026-11-17): the Mission (the curving freeway), the Financial District (the bay beside it), Hayes Valley
  // (the mesh of diagonal streets). The other places are kept here to add later.
  const PLACES = {
    mission: [-122.4148, 37.7599], financialDistrict: [-122.3999, 37.7946], hayesValley: [-122.4245, 37.7759],
    soma: [-122.4056, 37.7785], nobHill: [-122.4161, 37.7930], westernAddition: [-122.4330, 37.7816], civicCenter: [-122.4180, 37.7793]
  };
  const SEQUENCE = ["mission", "financialDistrict", "hayesValley"];

  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const ease = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  function rgb(value) {
    const m = String(value).trim().match(/^#?([0-9a-f]{6})$/i);
    if (!m) return [245, 165, 36];
    const n = parseInt(m[1], 16);
    return [n >> 16, (n >> 8) & 255, n & 255];
  }
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${clamp01(a).toFixed(3)})`;
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

  function cumulative(pts) {
    const d = [0];
    for (let i = 1; i < pts.length; i++) d.push(d[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    return d;
  }
  function at(pts, d, s) {   // point at distance s along a polyline
    let i = 1;
    while (i < d.length - 1 && d[i] < s) i++;
    const t = clamp01((s - d[i - 1]) / ((d[i] - d[i - 1]) || 1));
    return { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * t, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * t };
  }
  function finishEdge(e) {   // derived fields every street needs
    e.d = cumulative(e.pts);
    e.len = e.d[e.d.length - 1];
    e.mid = at(e.pts, e.d, e.len / 2);
    e.minX = Math.min(...e.pts.map(p => p.x));
    e.used = false; e.drawAt = 0; e.learnAt = 0; e.label = null;
    return e;
  }

  /* ---------------- San Francisco streets ---------------- */
  let roadsPromise = null;
  function loadRoads() {
    if (SITE.sfRoads) return Promise.resolve(SITE.sfRoads);
    if (!roadsPromise) {
      roadsPromise = new Promise((resolve, reject) => {
        const s = doc.createElement("script");
        s.src = ROADS_SRC;
        s.onload = () => (SITE.sfRoads ? resolve(SITE.sfRoads) : reject(new Error("no streets")));
        s.onerror = () => reject(new Error("streets failed to load"));
        doc.head.appendChild(s);
      });
    }
    return roadsPromise;
  }
  let taxisPromise = null;
  function loadTaxis() {
    if (SITE.sfTaxis) return Promise.resolve(SITE.sfTaxis);
    if (!taxisPromise) {
      taxisPromise = new Promise((resolve, reject) => {
        const s = doc.createElement("script");
        s.src = TAXIS_SRC;
        s.onload = () => (SITE.sfTaxis ? resolve(SITE.sfTaxis) : reject(new Error("no taxis")));
        s.onerror = () => reject(new Error("taxis failed to load"));
        doc.head.appendChild(s);
      });
    }
    return taxisPromise;
  }
  // Decode once: each trip slice as times (real seconds from the start of its moment) and points (metres).
  function decodeTaxis(data) {
    if (data._moments) return data._moments;
    data._moments = data.moments.map(m => ({
      label: m.label,
      trips: m.trips.map(f => {
        let t = f[0], x = f[1], y = f[2];
        const ts = [t / 10], xs = [x], ys = [y];
        for (let i = 3; i < f.length; i += 3) { t += f[i]; x += f[i + 1]; y += f[i + 2]; ts.push(t / 10); xs.push(x); ys.push(y); }
        return { ts, xs, ys };
      })
    }));
    return data._moments;
  }
  const SCALE = w => (w < 700 ? 0.42 : 0.34);   // pixels per metre
  // Decode once: streets in metres from the north-west corner of the data's bounding box.
  function decode(data) {
    if (data._streets) return data._streets;
    data._streets = data.edges.map(f => {
      let x = f[1], y = f[2];
      const pts = [{ x, y }];
      for (let i = 3; i < f.length; i += 2) { x += f[i]; y += f[i + 1]; pts.push({ x, y }); }
      return { major: f[0] === 1, pts };
    });
    return data._streets;
  }
  // The part of San Francisco that fits the hero, at s px per metre, centred on a neighbourhood (moved only
  // as far as needed to stay inside the street data).
  function makeCitySF(data, w, h, [alon, alat]) {
    const streets = decode(data), s = SCALE(w);
    const [lonMin, latMin, lonMax, latMax] = data.bbox, lat0 = (latMin + latMax) / 2;
    const mx = 111320 * Math.cos(lat0 * Math.PI / 180), my = 110540;
    const vw = w / s, vh = h / s;
    let cx = (alon - lonMin) * mx, cy = (latMax - alat) * my;
    cx = vw >= data.w ? data.w / 2 : Math.max(vw / 2, Math.min(data.w - vw / 2, cx));
    cy = vh >= data.h ? data.h / 2 : Math.max(vh / 2, Math.min(data.h - vh / 2, cy));
    const x0 = cx - vw / 2, y0 = cy - vh / 2, pad = 60 / s;
    const nodes = [], index = new Map(), edges = [];
    const node = p => {
      const k = Math.round(p.x) + "," + Math.round(p.y);
      if (!index.has(k)) { index.set(k, nodes.length); nodes.push({ x: (p.x - x0) * s, y: (p.y - y0) * s, adj: [] }); }
      return index.get(k);
    };
    for (const st of streets) {
      if (!st.pts.some(p => p.x > x0 - pad && p.x < x0 + vw + pad && p.y > y0 - pad && p.y < y0 + vh + pad)) continue;
      const a = node(st.pts[0]), b = node(st.pts[st.pts.length - 1]);
      const e = finishEdge({ a, b, major: st.major, pts: st.pts.map(p => ({ x: (p.x - x0) * s, y: (p.y - y0) * s })),
        speed: st.major ? rand(0.45, 1) : rand(0.12, 0.85) });
      e.metres = e.len / s;
      edges.push(e);
      nodes[a].adj.push({ e: edges.length - 1, to: b });
      nodes[b].adj.push({ e: edges.length - 1, to: a });
    }
    return { nodes, edges, w, h, view: { x0, y0, s } };
  }

  // Real taxis for this view: every trip slice of the moment that passes through it, in screen pixels.
  function realRiders(city, moment, windowS) {
    const { x0, y0, s } = city.view, { w, h } = city, out = [];
    for (const tr of moment.trips) {
      const xs = tr.xs.map(x => (x - x0) * s), ys = tr.ys.map(y => (y - y0) * s);
      if (!xs.some((x, i) => x > -40 && x < w + 40 && ys[i] > -40 && ys[i] < h + 40)) continue;
      const n = tr.ts.length;
      // Fade in only if the trip really starts inside the moment, out only if it really ends there.
      out.push({ ts: tr.ts, xs, ys, k: 0, fadeIn: tr.ts[0] > -5, fadeOut: tr.ts[n - 1] < windowS + 5 });
    }
    return out;
  }
  // The moment with the most real taxis in this view (a random one of the near-busiest, for variety).
  function busiestMoment(city, moments, windowS) {
    const options = moments.map(m => ({ m, riders: realRiders(city, m, windowS) }));
    const top = Math.max(...options.map(o => o.riders.length)), good = options.filter(o => o.riders.length >= 0.8 * top);
    return good[Math.floor(Math.random() * good.length)];
  }
  // Position of a real taxi at real time rt (seconds); r.k remembers the segment, as time only moves forward.
  function taxiAt(r, rt) {
    const { ts, xs, ys } = r;
    if (r.k > 0 && ts[r.k] > rt) r.k = 0;
    while (r.k < ts.length - 2 && ts[r.k + 1] < rt) r.k++;
    const i = r.k, f = clamp01((rt - ts[i]) / ((ts[i + 1] - ts[i]) || 1e-6));
    return { x: xs[i] + (xs[i + 1] - xs[i]) * f, y: ys[i] + (ys[i + 1] - ys[i]) * f };
  }

  /* ---------------- Fallback: a synthetic city ---------------- */
  function makeCitySynthetic(w, h) {
    const sp = w < 700 ? 46 : 58, cols = Math.ceil(w / sp) + 4, rows = Math.ceil(h / sp) + 4;
    const k1 = rand(0.0018, 0.0034), k2 = rand(0.0018, 0.0034), p1 = rand(0, 6.3), p2 = rand(0, 6.3), A = sp * 0.6;
    const warp = (x, y) => ({ x: x + A * Math.sin(y * k1 + p1) + A * 0.45 * Math.sin((x + y) * k2 + p2),
      y: y + A * Math.sin(x * k2 + p2) + A * 0.45 * Math.cos((x - y) * k1 + p1) });
    const nodes = [], edges = [], id = (c, r) => r * cols + c;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const p = warp(-2 * sp + c * sp + rand(-0.12, 0.12) * sp, -2 * sp + r * sp + rand(-0.12, 0.12) * sp);
      nodes.push({ x: p.x, y: p.y, adj: [] });
    }
    const mc = Math.floor(rand(0, 4)), mr = Math.floor(rand(0, 4));
    const link = (a, b, major) => {
      const e = finishEdge({ a, b, major, pts: [nodes[a], nodes[b]], speed: major ? rand(0.45, 1) : rand(0.12, 0.85) });
      e.metres = e.len * 2.5;
      edges.push(e);
      nodes[a].adj.push({ e: edges.length - 1, to: b });
      nodes[b].adj.push({ e: edges.length - 1, to: a });
    };
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (c < cols - 1 && (r % 4 === mr || Math.random() < 0.86)) link(id(c, r), id(c + 1, r), r % 4 === mr);
      if (r < rows - 1 && (c % 4 === mc || Math.random() < 0.84)) link(id(c, r), id(c, r + 1), c % 4 === mc);
    }
    return { nodes, edges, w, h };
  }

  /* ---------------- Trips, pings, labels, vehicles ---------------- */
  function makeTrips(city) {
    const { nodes, edges, w, h } = city, pings = [];
    const count = Math.round((w * h) / 9000);
    const starts = nodes.map((n, i) => (n.adj.length && n.x > 0 && n.y > 0 && n.x < w && n.y < h ? i : -1)).filter(i => i >= 0);
    for (let i = 0; i < count && starts.length; i++) {
      let cur = starts[Math.floor(Math.random() * starts.length)], prev = -1, dir = null;
      const legs = [];
      for (let s = 0, n = 5 + Math.floor(Math.random() * 6); s < n; s++) {
        const opts = nodes[cur].adj.filter(o => o.to !== prev);
        if (!opts.length) break;
        let pick = opts[Math.floor(Math.random() * opts.length)];
        if (dir && Math.random() < 0.6) {   // prefer carrying on roughly straight, and main roads
          let best = -9;
          for (const o of opts) {
            const vx = nodes[o.to].x - nodes[cur].x, vy = nodes[o.to].y - nodes[cur].y, l = Math.hypot(vx, vy) || 1;
            const score = (vx * dir.x + vy * dir.y) / l + (edges[o.e].major ? 0.35 : 0);
            if (score > best) { best = score; pick = o; }
          }
        }
        const vx = nodes[pick.to].x - nodes[cur].x, vy = nodes[pick.to].y - nodes[cur].y, l = Math.hypot(vx, vy) || 1;
        dir = { x: vx / l, y: vy / l };
        legs.push({ e: pick.e, forward: edges[pick.e].a === cur });
        prev = cur; cur = pick.to;
      }
      if (legs.length < 3) continue;
      const start = T.pings + rand(0, 2400), speed = rand(0.24, 0.38);
      let along = 0, next = rand(0, 12);
      outer: for (const leg of legs) {
        const e = edges[leg.e];
        e.used = true;
        for (; next < along + e.len; next += rand(16, 24)) {
          const sAlong = next - along, p = at(e.pts, e.d, leg.forward ? sAlong : e.len - sAlong);
          const t = start + next / speed;
          if (t > T.match - 300) break outer;
          pings.push({ x0: p.x + rand(-6, 6), y0: p.y + rand(-6, 6), x1: p.x, y1: p.y, t, snap: 0 });
        }
        along += e.len;
      }
    }
    return pings;
  }
  function schedule(city, pings) {
    const { edges, w } = city;
    for (const p of pings) p.snap = T.match + clamp01(p.x1 / w) * 1300 + rand(0, 300);
    for (const e of edges) {
      // Every street draws itself in, left to right, as the pings snap onto the map.
      e.revealAt = T.match + clamp01(e.minX / w) * 1300 + rand(0, 250);
      if (!e.used) continue;
      e.drawAt = e.revealAt;
      e.learnAt = T.learn + clamp01(e.mid.x / w) * 1800 + rand(0, 200);
    }
  }
  // A few street travel times, spread apart and never on top of the page's text.
  function pickLabels(city, avoid) {
    const { edges, w, h } = city, wide = w >= 1000, picks = [];
    edges.forEach(e => { e.label = null; });
    const clear = p => !avoid.some(r => p.x > r.x - 30 && p.x < r.x + r.w + 30 && p.y > r.y - 22 && p.y < r.y + r.h + 22);
    const cands = edges.filter(e => e.used && e.len > 40 && e.mid.x > 30 && e.mid.x < w - 40 && e.mid.y > 30 && e.mid.y < h * 0.7 && clear(e.mid))
      .sort((a, b) => (b.major - a.major) || Math.random() - 0.5);
    for (const e of cands) {
      if (picks.length >= (wide ? 7 : 3)) break;
      if (picks.every(o => Math.hypot(o.mid.x - e.mid.x, o.mid.y - e.mid.y) > 170)) {
        e.label = fmt(e.metres / (4 + 12 * e.speed));   // synthetic speed: 4 to 16 m/s
        picks.push(e);
      }
    }
  }
  // Taxis start spread out across the visible map (not under text or the map panel) and, at every
  // intersection, take a street no taxi has driven yet, so together they cover as much of the city as they can.
  function makeRiders(city, n, avoid) {
    const { edges, w, h } = city;
    const inView = e => e.mid.x > 20 && e.mid.y > 20 && e.mid.x < w - 20 && e.mid.y < h * 0.85;
    const clear = e => !avoid.some(r => e.mid.x > r.x && e.mid.x < r.x + r.w && e.mid.y > r.y && e.mid.y < r.y + r.h);
    let pool = edges.map((e, i) => (inView(e) && clear(e) ? i : -1)).filter(i => i >= 0);
    if (!pool.length) pool = edges.map((e, i) => i);
    pool.sort(() => Math.random() - 0.5);
    city.visited = new Set();
    const riders = [];
    for (const i of pool) {
      if (riders.length >= n) break;
      const e = edges[i];
      if (riders.some(r => Math.hypot(edges[r.e].mid.x - e.mid.x, edges[r.e].mid.y - e.mid.y) < 140)) continue;
      riders.push({ e: i, forward: Math.random() < 0.5, s: rand(0, e.len) });
      city.visited.add(i);
    }
    return riders;
  }
  function advance(city, r, dt) {
    const { edges, nodes, w, h, visited } = city, e = edges[r.e];
    r.s += dt * (0.022 + 0.05 * e.speed);   // about 22 to 72 px per second, faster on quicker streets
    if (r.s < e.len) return;
    const end = r.forward ? e.b : e.a;
    const inView = o => { const m = edges[o.e].mid; return m.x > -10 && m.y > -10 && m.x < w + 10 && m.y < h + 10; };
    const opts = nodes[end].adj.filter(o => o.e !== r.e && inView(o));
    const fresh = opts.filter(o => !visited.has(o.e));
    const pool = fresh.length ? fresh : opts;
    const o = pool.length ? pool[Math.floor(Math.random() * pool.length)] : { e: r.e };   // dead end: turn back
    r.s -= e.len;
    r.forward = edges[o.e].a === end;
    r.e = o.e;
    visited.add(o.e);
  }

  /* ---------------- Mount on the hero ---------------- */
  function mount(shell) {
    const canvas = shell.querySelector(".learn-field");
    const ctx = canvas && canvas.getContext && canvas.getContext("2d");
    if (!ctx || (isLive && !SHOW_ON_LIVE)) return { destroy() {} };
    shell.classList.add("is-learning");
    const steps = [...shell.querySelectorAll("[data-learn-step]")];
    const reduceMQ = g.matchMedia("(prefers-reduced-motion: reduce)");
    const base = doc.createElement("canvas"), bctx = base.getContext("2d");   // the faint city, drawn once per city
    let w = 0, h = 0, dpr = 1, city = null, pings = [], riders = [], textRects = [], roads = null, dead = false;
    let place = 0;   // index into SEQUENCE: moves on at the end of each loop (a resize redraws the same place)
    let taxis = null, taxiWindow = 120;   // decoded real-trip moments, when they loaded
    const when = shell.querySelector("[data-taxi-when]"), whenLabel = shell.querySelector("[data-taxi-label]");
    function showWhen(label) {   // credit line: which real evening the taxis are from
      if (!when || !whenLabel) return;
      when.hidden = !label;
      if (label) whenLabel.textContent = label;
    }
    let raf = 0, last = 0, t = 0, onScreen = true, colorsAt = -1e9, step = -1, baseTone = "";
    let ink = [232, 238, 244], accent = [245, 165, 36], muted = [154, 170, 187];

    function readColors() {
      const cs = getComputedStyle(root);
      ink = rgb(cs.getPropertyValue("--ink"));
      accent = rgb(cs.getPropertyValue("--accent"));
      muted = rgb(cs.getPropertyValue("--muted"));
      if (city && muted.join(",") !== baseTone) drawBase();
    }
    // Slightly lighter on the text side (left), fuller on the open right side.
    const fade = x => (w >= 1000 ? 0.75 + 0.25 * smooth(w * 0.3, w * 0.62, x) : 0.8);

    // Where the hero's text sits. Labels stay off all of it (and off the map panel); under the small text
    // the streets are dimmed to about half, never removed, so the network stays continuous.
    const SMALL = ".kicker, .learn-steps, .lede, .now-list, .actions .btn, .learn-credit";
    const AVOID = SMALL + ", .hero-title, .map-card";
    const dim = doc.createElement("canvas"), dctx = dim.getContext("2d"), DS = 0.125;
    // lines = true: one rectangle per line of text (tight, for dimming); false: the whole block (for labels).
    function rectsOf(sel, lines) {
      const b = shell.getBoundingClientRect(), range = doc.createRange(), out = [];
      shell.querySelectorAll(sel).forEach(el => {
        let rects;
        if (!lines || el.classList.contains("btn")) rects = el.getClientRects();
        else { range.selectNodeContents(el); rects = range.getClientRects(); }
        for (const r of rects) if (r.width && r.height) out.push({ x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height });
      });
      return out;
    }
    function measureText() {
      textRects = rectsOf(AVOID, false);
      dim.width = Math.max(1, Math.ceil(w * DS));
      dim.height = Math.max(1, Math.ceil(h * DS));
      dctx.setTransform(DS, 0, 0, DS, 0, 0);
      dctx.clearRect(0, 0, w, h);
      dctx.fillStyle = "#000";
      for (const r of rectsOf(SMALL, true)) dctx.fillRect(r.x - 12, r.y - 10, r.w + 24, r.h + 20);
    }
    function dimUnderText() {   // drawn at 1/8 size and scaled up, so the dimmed areas have soft edges
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = 0.5;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(dim, 0, 0, w, h);
      ctx.restore();
    }
    function path(c, e, p) {   // trace the first fraction p of a street
      const target = e.len * p;
      c.moveTo(e.pts[0].x, e.pts[0].y);
      for (let i = 1; i < e.pts.length; i++) {
        if (e.d[i] <= target) { c.lineTo(e.pts[i].x, e.pts[i].y); continue; }
        const q = at(e.pts, e.d, target);
        c.lineTo(q.x, q.y);
        break;
      }
    }
    function drawBase() {
      base.width = Math.round(w * dpr);
      base.height = Math.round(h * dpr);
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bctx.clearRect(0, 0, w, h);
      bctx.lineCap = "round";
      bctx.lineJoin = "round";
      for (const major of [false, true]) {
        bctx.beginPath();
        for (const e of city.edges) if (e.major === major) path(bctx, e, 1);
        bctx.strokeStyle = rgba(muted, major ? 0.26 : 0.14);
        bctx.lineWidth = major ? 1.3 : 0.8;
        bctx.stroke();
      }
      baseTone = muted.join(",");
    }
    function newCity() {
      // The current neighbourhood of the sequence, with the Saturday-evening moment that has the most real
      // taxis in its view.
      let pick = null;
      if (roads) {
        city = makeCitySF(roads, w, h, PLACES[SEQUENCE[place]]);
        pick = taxis ? busiestMoment(city, taxis, taxiWindow) : null;
      } else city = makeCitySynthetic(w, h);
      if (pick) { showWhen(pick.m.label); measureText(); } else showWhen(null);
      pings = makeTrips(city);
      schedule(city, pings);
      pickLabels(city, textRects);
      city.real = !!pick;
      riders = pick ? pick.riders : makeRiders(city, w >= 1000 ? 14 : 6, textRects);
      readColors();
      drawBase();
    }
    function measure() {
      const r = shell.getBoundingClientRect(), nw = Math.max(1, Math.round(r.width)), nh = Math.max(1, Math.round(r.height));
      const rebuild = !city || Math.abs(nw - w) > 40 || Math.abs(nh - h) > 60;
      w = nw; h = nh;
      dpr = Math.min(2, g.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      measureText();
      if (!roads && !city) return;   // wait for the streets (or the fallback) before building a city
      if (rebuild) { newCity(); t = 0; } else { pickLabels(city, textRects); drawBase(); }
    }
    function setStep(i) {
      if (i === step) return;
      step = i;
      steps.forEach((el, k) => el.classList.toggle("on", k === i));
    }

    function draw(now, still) {
      const master = still ? 1 : clamp01(now / 500) * (1 - smooth(T.fade, T.end, now));
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      // The complete street map: absent while the GPS pings arrive, then it draws itself in (left to right)
      // as the pings snap onto it. Once fully drawn, the cached image of it is used.
      const baseA = master * (w >= 1000 ? 0.9 : 0.8);
      if (still || now >= REVEAL_END) {
        ctx.globalAlpha = baseA;
        ctx.drawImage(base, 0, 0, w, h);
      } else if (now >= T.match) {
        ctx.globalAlpha = baseA;
        for (const major of [false, true]) {
          ctx.beginPath();
          for (const e of city.edges) {
            if (e.major !== major || now < e.revealAt) continue;
            path(ctx, e, ease(clamp01((now - e.revealAt) / 700)));
          }
          ctx.strokeStyle = rgba(muted, major ? 0.26 : 0.14);
          ctx.lineWidth = major ? 1.3 : 0.8;
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      // Streets found by map matching light up, then thicken by how slow they are once learned.
      // One colour for all of them; only the transparency changes per street (cheaper than new colours).
      ctx.strokeStyle = rgba(muted, 1);
      for (const e of city.edges) {
        if (!e.used || (!still && now < e.drawAt)) continue;
        const f = fade(e.mid.x) * master, p = still ? 1 : ease(clamp01((now - e.drawAt) / 700));
        const learned = still ? 1 : ease(clamp01((now - e.learnAt) / 500)), slow = 1 - e.speed;
        ctx.globalAlpha = clamp01((0.34 + 0.3 * slow * learned) * f);
        ctx.lineWidth = (e.major ? 1.3 : 1) + 1.4 * slow * learned;
        ctx.beginPath(); path(ctx, e, p); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // GPS pings: scattered, then snapped onto their street, then gone.
      if (!still && now < T.learn + 900) {
        ctx.fillStyle = rgba(ink, 1);
        for (const pg of pings) {
          if (now < pg.t) continue;
          let x = pg.x0, y = pg.y0, a = 0.78 * clamp01((now - pg.t) / 150);
          if (now > pg.snap) {
            const q = ease(clamp01((now - pg.snap) / 500));
            x = pg.x0 + (pg.x1 - pg.x0) * q; y = pg.y0 + (pg.y1 - pg.y0) * q;
            a *= 1 - clamp01((now - pg.snap - 500) / 600);
          }
          if (a <= 0.01) continue;
          ctx.globalAlpha = clamp01(a * fade(x) * master);
          ctx.fillRect(x - 1, y - 1, 2, 2);
        }
        ctx.globalAlpha = 1;
      }
      // A few street travel times.
      ctx.font = '500 11px "JetBrains Mono", ui-monospace, monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      for (const e of city.edges) {
        if (!e.label) continue;
        const a = still ? 1 : clamp01((now - e.learnAt - 200) / 400);
        if (a <= 0) continue;
        ctx.fillStyle = rgba(muted, 0.9 * a * master);
        ctx.fillText(e.label, e.mid.x, e.mid.y - 6);
      }
      // Taxis (the only touch of amber). Real trips: each taxi is where it really was at that moment of the
      // evening, with a faint trail of the road it just drove.
      if (!still && now > T.ride && city.real) {
        const rt = ((now - T.ride) / 1000) * SPEEDUP, base = 0.9 * clamp01((now - T.ride) / 400) * master;
        ctx.fillStyle = rgba(accent, 1);
        ctx.strokeStyle = rgba(accent, 1);
        ctx.lineWidth = 1.6;
        for (const r of riders) {
          const n = r.ts.length;
          if (rt < r.ts[0] || rt > r.ts[n - 1]) continue;
          let a = base;
          if (r.fadeIn) a *= clamp01((rt - r.ts[0]) / 2);
          if (r.fadeOut) a *= clamp01((r.ts[n - 1] - rt) / 2);
          if (a <= 0.01) continue;
          const p = taxiAt(r, rt), from = Math.max(r.ts[0], rt - TRAIL_S);
          ctx.globalAlpha = a * 0.32;
          ctx.beginPath();
          const q = taxiAt({ ts: r.ts, xs: r.xs, ys: r.ys, k: 0 }, from);
          ctx.moveTo(q.x, q.y);
          for (let i = 0; i < n; i++) if (r.ts[i] > from && r.ts[i] < rt) ctx.lineTo(r.xs[i], r.ys[i]);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          ctx.globalAlpha = a;
          ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
      } else if (!still && now > T.ride) {   // fallback: taxis wander the streets at the learned speeds
        ctx.fillStyle = rgba(accent, 0.9 * clamp01((now - T.ride) / 400) * master);
        for (const r of riders) {
          const e = city.edges[r.e], p = at(e.pts, e.d, r.forward ? r.s : e.len - r.s);
          ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2); ctx.fill();
        }
      }
      dimUnderText();
    }

    function frame(ts) {
      raf = 0;
      if (!onScreen || doc.hidden || !city) { last = 0; return; }
      const dt = last ? Math.min(50, ts - last) : 16;
      last = ts;
      if (ts - colorsAt > 1000) { readColors(); colorsAt = ts; }
      t += dt;
      if (t >= T.end) { place = (place + 1) % SEQUENCE.length; newCity(); t = 0; }
      if (t > T.ride && !city.real) riders.forEach(r => advance(city, r, dt));
      setStep(t >= T.fade ? -1 : t >= STEP_AT[2] ? 2 : t >= STEP_AT[1] ? 1 : t >= STEP_AT[0] ? 0 : -1);
      draw(t, false);
      raf = g.requestAnimationFrame(frame);
    }
    function still() {
      if (raf) { g.cancelAnimationFrame(raf); raf = 0; }
      if (!city) return;
      readColors();
      steps.forEach(el => el.classList.add("on"));
      draw(0, true);
    }
    function render() {
      if (!city) return;
      if (reduceMQ.matches) { still(); return; }
      steps.forEach(el => el.classList.remove("on")); step = -1;
      if (!raf && onScreen && !doc.hidden) raf = g.requestAnimationFrame(frame);
    }
    function start(data) {
      if (dead) return;
      roads = data;
      measure();
      if (!city) { newCity(); t = 0; }
      render();
    }

    measure();
    // Streets first; the real taxi trips are fetched with them (the taxis wander instead if they fail).
    loadRoads().then(data => loadTaxis().then(td => { taxis = decodeTaxis(td); taxiWindow = td.windowS || 120; }, () => {})
      .then(() => start(data)), () => start(null));
    const ro = "ResizeObserver" in g ? new ResizeObserver(() => { measure(); if (reduceMQ.matches) still(); }) : null;
    if (ro) ro.observe(shell);
    const io = "IntersectionObserver" in g ? new IntersectionObserver(es => { onScreen = es[0].isIntersecting; if (!reduceMQ.matches) render(); }) : null;
    if (io) io.observe(shell);
    const mo = new MutationObserver(() => { colorsAt = -1e9; if (reduceMQ.matches) still(); });
    mo.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    const onVisibility = () => { if (!reduceMQ.matches) render(); };
    doc.addEventListener("visibilitychange", onVisibility);
    // Text moves while the headline's entrance animation plays and when web fonts arrive; re-place labels after both.
    const relabel = () => { if (dead) return; measureText(); if (city) pickLabels(city, textRects); if (reduceMQ.matches) still(); };
    const settle = g.setTimeout(relabel, 1900);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(relabel);
    if (doc.fonts && doc.fonts.addEventListener) doc.fonts.addEventListener("loadingdone", relabel);
    if (reduceMQ.addEventListener) reduceMQ.addEventListener("change", render);

    return {
      destroy() {
        dead = true;
        if (raf) g.cancelAnimationFrame(raf);
        raf = 0;
        g.clearTimeout(settle);
        if (ro) ro.disconnect();
        if (io) io.disconnect();
        mo.disconnect();
        doc.removeEventListener("visibilitychange", onVisibility);
        if (reduceMQ.removeEventListener) reduceMQ.removeEventListener("change", render);
        if (doc.fonts && doc.fonts.removeEventListener) doc.fonts.removeEventListener("loadingdone", relabel);
        shell.classList.remove("is-learning");
      }
    };
  }

  // enabled: whether the new home page visuals (this animation and the real-street map panel in demos.js)
  // are switched on here. Shared so one switch, SHOW_ON_LIVE, controls both on mubarak.sh.
  SITE.learnMap = { mount, loadRoads, decode, enabled: !isLive || SHOW_ON_LIVE };
})(typeof window !== "undefined" ? window : globalThis);
