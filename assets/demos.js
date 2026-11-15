/* Interactive demos: road-network ETA (hero + LinkETA), taxi dispatch (DTUMOS), request checker (Text2Simulation).
   All are illustrations of the ideas, not the research systems themselves. */
(function (g) {
  "use strict";
  const SITE = g.SITE;
  const D = (SITE.demos = {});
  const reduceMQ = g.matchMedia ? g.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  const pad2 = n => String(n).padStart(2, "0");

  function seeded(seed) {
    return function () {
      seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  function toRGB(c) {
    c = (c || "").trim();
    if (c[0] === "#") {
      let h = c.slice(1);
      if (h.length === 3) h = h.split("").map(x => x + x).join("");
      const n = parseInt(h, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    const m = c.match(/\d+(\.\d+)?/g);
    return m ? m.slice(0, 3).map(Number) : [128, 128, 128];
  }
  function mix(a, b, t) { return `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)})`; }
  function palette() {
    return {
      road: cssVar("--band-line"), ink: cssVar("--band-ink"), muted: cssVar("--band-muted"), accent: cssVar("--band-accent"),
      band: cssVar("--band"), deep: cssVar("--band-deep"),
      freeS: cssVar("--map-free"), slowS: cssVar("--map-slow"), jamS: cssVar("--map-jam"),
      free: toRGB(cssVar("--map-free")), slow: toRGB(cssVar("--map-slow")), jam: toRGB(cssVar("--map-jam"))
    };
  }
  function ramp(p, c) { return c < 0.5 ? mix(p.free, p.slow, c / 0.5) : mix(p.slow, p.jam, (c - 0.5) / 0.5); }
  function rush(h) {
    const am = Math.exp(-Math.pow(h - 8.25, 2) / 1.4), pm = Math.exp(-Math.pow(h - 17.5, 2) / 2.0);
    const night = (h < 5.5 || h > 22.5) ? -0.12 : 0;
    return Math.max(0, Math.min(1, 0.16 + 0.72 * am + 0.82 * pm + night));
  }
  function clock(h) { h = ((h % 24) + 24) % 24; return pad2(Math.floor(h)) + ":" + pad2(Math.floor((h % 1) * 60)); }
  D.clock = clock;

  /* Shared canvas lifecycle: size tracking, visibility, animation loop */
  class CanvasDemo {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.W = 0; this.H = 0;
      this.running = false; this.visible = true; this.raf = 0; this.last = 0;
      this.pal = palette();
      this._frame = now => this.frame(now);
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(canvas);
      this.io = new IntersectionObserver(es => { this.visible = es[es.length - 1].isIntersecting; this.sync(); });
      this.io.observe(canvas);
      this._vis = () => this.sync();
      document.addEventListener("visibilitychange", this._vis);
      this._rm = () => this.sync();
      if (reduceMQ.addEventListener) reduceMQ.addEventListener("change", this._rm);
    }
    resize() {
      const r = this.canvas.getBoundingClientRect();
      if (r.width < 60 || r.height < 60) return;
      if (Math.abs(r.width - this.W) < 1 && Math.abs(r.height - this.H) < 1) return;
      this.W = r.width; this.H = r.height;
      const dpr = Math.min(2, g.devicePixelRatio || 1);
      this.canvas.width = Math.round(this.W * dpr);
      this.canvas.height = Math.round(this.H * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.build();
      this.draw(1);
      this.sync();
    }
    wantsMotion() { return !reduceMQ.matches; }
    sync() {
      const go = this.visible && !document.hidden && this.W > 0 && this.wantsMotion();
      if (go && !this.running) { this.running = true; this.last = performance.now(); this.raf = requestAnimationFrame(this._frame); }
      else if (!go && this.running) { this.running = false; cancelAnimationFrame(this.raf); }
    }
    frame(now) {
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.step(dt, now);
      if (this.running) this.raf = requestAnimationFrame(this._frame);
    }
    repaint() { this.pal = palette(); if (this.W) this.draw(1); }
    destroy() {
      this.running = false; cancelAnimationFrame(this.raf);
      this.ro.disconnect(); this.io.disconnect();
      document.removeEventListener("visibilitychange", this._vis);
      if (reduceMQ.removeEventListener) reduceMQ.removeEventListener("change", this._rm);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Road network with link-level ETA                                    */
  /* ------------------------------------------------------------------ */
  class RoadNet extends CanvasDemo {
    constructor(canvas, opts) {
      super(canvas);
      this.o = Object.assign({ seed: 11, autoClock: false, hour: 8.5, daySeconds: 60, onUpdate: null }, opts || {});
      this.hour = this.o.hour;
      this.t = 0; this.A = null; this.B = null; this.pickNext = "A"; this.hover = -1;
      this.nodes = []; this.edges = []; this.adj = []; this.cars = []; this.route = []; this.routeSet = new Set();
      this.lastRoute = 0; this.lastEmit = 0;
      this._down = e => this.onDown(e);
      this._move = e => this.onMove(e);
      this._leave = () => { this.hover = -1; this.canvas.style.cursor = ""; if (!this.running) this.draw(); };
      canvas.addEventListener("pointerdown", this._down);
      canvas.addEventListener("pointermove", this._move);
      canvas.addEventListener("pointerleave", this._leave);
    }
    build() {
      const r = seeded(this.o.seed), W = this.W, H = this.H;
      const cols = W < 520 ? 7 : 10;
      const rows = Math.max(5, Math.round((cols - 1) * H / W) + 1);
      const pad = 26, cw = (W - pad * 2) / (cols - 1), ch = (H - pad * 2) / (rows - 1);
      const artRow = Math.floor(rows / 2), artCols = [Math.floor(cols / 3), Math.floor((2 * cols) / 3)];
      const nodes = [];
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const border = x === 0 || y === 0 || x === cols - 1 || y === rows - 1;
        const j = border ? 0.1 : 0.38;
        nodes.push({ x: pad + x * cw + (r() - 0.5) * cw * j, y: pad + y * ch + (r() - 0.5) * ch * j });
      }
      const edges = [], adj = nodes.map(() => []);
      const add = (a, b, art) => {
        const len = Math.hypot(nodes[b].x - nodes[a].x, nodes[b].y - nodes[a].y);
        edges.push({ a, b, len, art, sens: art ? 0.7 + r() * 0.3 : 0.2 + r() * 0.45, base: r() * 0.16 - 0.05, phase: r() * 6.283, rate: 0.25 + r() * 0.5, free: art ? 60 : 42, c: 0, speed: 42 });
        adj[a].push(edges.length - 1); adj[b].push(edges.length - 1);
      };
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        if (x < cols - 1) { const art = y === artRow; if (art || y === 0 || y === rows - 1 || r() > 0.16) add(i, i + 1, art); }
        if (y < rows - 1) { const art = artCols.indexOf(x) >= 0; if (art || x === 0 || x === cols - 1 || r() > 0.16) add(i, i + cols, art); }
        if (x < cols - 1 && y < rows - 1 && r() < 0.08) add(i, i + cols + 1, false);
      }
      this.nodes = nodes; this.edges = edges; this.adj = adj; this.cols = cols; this.rows = rows;
      this.A = (rows - 1) * cols; this.B = cols - 1; this.pickNext = "A";
      this.kmPerPx = 9 / Math.hypot(W, H);
      const count = Math.max(16, Math.min(90, Math.round((W * H) / 6500)));
      this.cars = [];
      for (let k = 0; k < count; k++) {
        const ei = Math.floor(r() * edges.length);
        this.cars.push({ ei, from: r() < 0.5 ? edges[ei].a : edges[ei].b, s: r() });
      }
      this.update(0);
      this.findRoute();
      this.emit(true);
    }
    update(dt) {
      if (this.o.autoClock && dt > 0) this.hour = (this.hour + (dt * 24) / this.o.daySeconds) % 24;
      const f = rush(this.hour);
      for (const e of this.edges) {
        const v = e.base + e.sens * f + 0.06 * Math.sin(this.t * e.rate + e.phase);
        e.c = v < 0 ? 0 : v > 1 ? 1 : v;
        e.speed = e.free * (1 - 0.8 * e.c);
      }
    }
    minutes(e) { return ((e.len * this.kmPerPx) / e.speed) * 60; }
    findRoute() {
      this.route = []; this.routeSet = new Set();
      if (this.A == null || this.B == null) return;
      const n = this.nodes.length, dist = new Array(n).fill(Infinity), prev = new Array(n).fill(-1), done = new Array(n).fill(false);
      dist[this.A] = 0;
      for (let k = 0; k < n; k++) {
        let u = -1, best = Infinity;
        for (let i = 0; i < n; i++) if (!done[i] && dist[i] < best) { best = dist[i]; u = i; }
        if (u < 0 || u === this.B) break;
        done[u] = true;
        for (const ei of this.adj[u]) {
          const e = this.edges[ei], v = e.a === u ? e.b : e.a, w = dist[u] + this.minutes(e);
          if (w < dist[v]) { dist[v] = w; prev[v] = ei; }
        }
      }
      if (dist[this.B] === Infinity) return;
      let cur = this.B;
      while (cur !== this.A) { const ei = prev[cur]; this.route.push(ei); const e = this.edges[ei]; cur = e.a === cur ? e.b : e.a; }
      this.route.reverse();
      this.routeSet = new Set(this.route);
    }
    emit(force) {
      if (!this.o.onUpdate) return;
      const now = performance.now();
      if (!force && now - this.lastEmit < 250) return;
      this.lastEmit = now;
      const segs = this.route.map(ei => ({ min: this.minutes(this.edges[ei]), c: this.edges[ei].c }));
      this.o.onUpdate({ hour: this.hour, eta: segs.reduce((s, x) => s + x.min, 0), segs, hasRoute: segs.length > 0, pickNext: this.pickNext });
    }
    local(ev) { const r = this.canvas.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; }
    nodeAt(x, y) {
      let best = -1, bd = 26 * 26;
      this.nodes.forEach((n, i) => { const d = (n.x - x) ** 2 + (n.y - y) ** 2; if (d < bd) { bd = d; best = i; } });
      return best;
    }
    onDown(ev) {
      const [x, y] = this.local(ev), i = this.nodeAt(x, y);
      if (i < 0) return;
      if (this.pickNext === "A") { this.A = i; this.B = null; this.pickNext = "B"; }
      else { if (i === this.A) return; this.B = i; this.pickNext = "A"; }
      this.findRoute(); this.draw(); this.emit(true);
    }
    onMove(ev) {
      const [x, y] = this.local(ev), i = this.nodeAt(x, y);
      if (i !== this.hover) { this.hover = i; this.canvas.style.cursor = i >= 0 ? "pointer" : ""; if (!this.running) this.draw(); }
    }
    setHour(h) { this.hour = h; this.update(0); this.findRoute(); this.draw(); this.emit(true); }
    randomTrip() {
      const n = this.nodes.length, minD = Math.min(this.W, this.H) * 0.6;
      let a = 0, b = 0, tries = 0;
      do { a = Math.floor(Math.random() * n); b = Math.floor(Math.random() * n); tries++; }
      while ((a === b || Math.hypot(this.nodes[a].x - this.nodes[b].x, this.nodes[a].y - this.nodes[b].y) < minD) && tries < 300);
      this.A = a; this.B = b; this.pickNext = "A";
      this.findRoute(); this.draw(); this.emit(true);
    }
    step(dt, now) {
      this.t += dt;
      this.update(dt);
      const pxPerKmh = 0.9 * (this.W / 600);
      for (const car of this.cars) {
        const e = this.edges[car.ei];
        car.s += (e.speed * pxPerKmh * dt) / e.len;
        if (car.s >= 1) {
          const to = e.a === car.from ? e.b : e.a;
          const opts = this.adj[to].filter(i => i !== car.ei);
          car.ei = opts.length ? opts[(Math.random() * opts.length) | 0] : car.ei;
          car.from = to; car.s = 0;
        }
      }
      if (now - this.lastRoute > 1200) { this.findRoute(); this.lastRoute = now; }
      this.draw();
      this.emit(false);
    }
    seg(e) { const p = this.nodes[e.a], q = this.nodes[e.b]; this.ctx.moveTo(p.x, p.y); this.ctx.lineTo(q.x, q.y); }
    pin(i, label) {
      const p = this.nodes[i], ctx = this.ctx;
      ctx.fillStyle = this.pal.accent;
      ctx.beginPath(); ctx.arc(p.x, p.y, 12, 0, 6.283); ctx.fill();
      ctx.fillStyle = this.pal.band;
      ctx.font = "800 12px Archivo, Arial, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(label, p.x, p.y + 0.5);
    }
    draw() {
      const ctx = this.ctx, p = this.pal;
      if (!this.W) return;
      ctx.clearRect(0, 0, this.W, this.H);
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.strokeStyle = p.road;
      ctx.lineWidth = 7; ctx.beginPath(); this.edges.forEach(e => { if (!e.art) this.seg(e); }); ctx.stroke();
      ctx.lineWidth = 11; ctx.beginPath(); this.edges.forEach(e => { if (e.art) this.seg(e); }); ctx.stroke();
      if (this.route.length) {
        ctx.strokeStyle = p.ink; ctx.lineWidth = 13;
        ctx.beginPath(); this.route.forEach(ei => this.seg(this.edges[ei])); ctx.stroke();
      }
      this.edges.forEach((e, i) => {
        const on = this.routeSet.has(i);
        ctx.strokeStyle = ramp(p, e.c);
        ctx.lineWidth = on ? 6.5 : e.art ? 4 : 2.6;
        ctx.globalAlpha = this.routeSet.size && !on ? 0.7 : 1;
        ctx.beginPath(); this.seg(e); ctx.stroke();
      });
      ctx.globalAlpha = 1;
      ctx.fillStyle = p.ink;
      for (const car of this.cars) {
        const e = this.edges[car.ei], a = this.nodes[car.from], b = this.nodes[e.a === car.from ? e.b : e.a];
        ctx.beginPath(); ctx.arc(a.x + (b.x - a.x) * car.s, a.y + (b.y - a.y) * car.s, 2.3, 0, 6.283); ctx.fill();
      }
      if (this.hover >= 0) {
        const n = this.nodes[this.hover];
        ctx.strokeStyle = p.accent; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(n.x, n.y, 10, 0, 6.283); ctx.stroke();
      }
      if (this.A != null) this.pin(this.A, "A");
      if (this.B != null) this.pin(this.B, "B");
    }
    destroy() {
      super.destroy();
      this.canvas.removeEventListener("pointerdown", this._down);
      this.canvas.removeEventListener("pointermove", this._move);
      this.canvas.removeEventListener("pointerleave", this._leave);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Real streets (home page): pick a city, drop a pickup and drop-off.  */
  /* Minimal ETA, no model: each street's travel time is its length over  */
  /* a typical speed for its road type, slowed by a simple time-of-day    */
  /* traffic pattern; the route is the fastest path (Dijkstra, heap).     */
  /* ------------------------------------------------------------------ */
  // What the panel shows of each city: its centre and how many metres fit across the panel.
  const CITY_VIEWS = {
    sf: { name: "San Francisco", lon: -122.4105, lat: 37.7835, widthM: 2600 },   // Union Square, SoMa, Civic Center
    porto: { name: "Porto", lon: -8.6150, lat: 41.1460, widthM: 3000 },          // Baixa, Ribeira and the Douro
    chengdu: { name: "Chengdu", lon: 104.0657, lat: 30.6600, widthM: 4200 },     // around Tianfu Square
    shanghai: { name: "Shanghai", lon: 121.4800, lat: 31.2300, widthM: 4200 },   // People's Square to the Bund
    annarbor: { name: "Ann Arbor", lon: -83.7430, lat: 42.2790, widthM: 3200 },  // downtown and Central Campus
    daegu: { name: "Daegu", lon: 128.5960, lat: 35.8690, widthM: 3600 }          // Jung-gu, the city centre
  };
  const cityLoads = {};
  function loadCity(key) {   // street files load only when a city is first picked
    const LM = SITE.learnMap, have = SITE.cityRoads && SITE.cityRoads[key];
    if (have) return Promise.resolve(have);
    if (key === "sf" && LM && LM.loadRoads) return LM.loadRoads();
    if (!cityLoads[key]) {
      cityLoads[key] = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = `assets/roads-${key}.js`;
        s.onload = () => (SITE.cityRoads && SITE.cityRoads[key] ? resolve(SITE.cityRoads[key]) : reject(new Error("no streets")));
        s.onerror = () => { delete cityLoads[key]; reject(new Error("streets failed to load")); };
        document.head.appendChild(s);
      });
    }
    return cityLoads[key];
  }
  function heapPush(h, item) {
    h.push(item);
    let i = h.length - 1;
    while (i > 0) { const p = (i - 1) >> 1; if (h[p][0] <= h[i][0]) break; [h[p], h[i]] = [h[i], h[p]]; i = p; }
  }
  function heapPop(h) {
    const top = h[0], last = h.pop();
    if (h.length) {
      h[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < h.length && h[l][0] < h[m][0]) m = l;
        if (r < h.length && h[r][0] < h[m][0]) m = r;
        if (m === i) break;
        [h[m], h[i]] = [h[i], h[m]]; i = m;
      }
    }
    return top;
  }
  class CityNet extends CanvasDemo {
    constructor(canvas, view, streets, data, opts) {
      super(canvas);
      this.view = view; this.streets = streets; this.data = data;
      this.o = Object.assign({ autoClock: true, hour: 7.5, daySeconds: 60, onUpdate: null }, opts || {});
      this.hour = this.o.hour;
      this.t = 0; this.A = null; this.B = null; this.pickNext = "A"; this.hover = -1;
      this.nodes = []; this.edges = []; this.adj = []; this.cars = []; this.route = []; this.routeSet = new Set();
      this.lastRoute = 0; this.lastEmit = 0;
      this.layer = document.createElement("canvas");   // the faint side streets, drawn once
      this._down = e => this.onDown(e);
      this._move = e => this.onMove(e);
      this._leave = () => { this.hover = -1; this.canvas.style.cursor = ""; if (!this.running) this.draw(); };
      canvas.addEventListener("pointerdown", this._down);
      canvas.addEventListener("pointermove", this._move);
      canvas.addEventListener("pointerleave", this._leave);
    }
    build() {
      const W = this.W, H = this.H, d = this.data, r = seeded(7);
      const [lonMin, latMin, lonMax, latMax] = d.bbox, lat0 = (latMin + latMax) / 2;
      const mx = 111320 * Math.cos((lat0 * Math.PI) / 180), my = 110540;
      const v = this.view, s = W / v.widthM;                          // px per metre
      const x0 = (v.lon - lonMin) * mx - W / s / 2, y0 = (latMax - v.lat) * my - H / s / 2, pad = 30 / s;
      const nodes = [], index = new Map(), edges = [], adj = [];
      const node = p => {
        const k = Math.round(p.x) + "," + Math.round(p.y);
        if (!index.has(k)) { index.set(k, nodes.length); nodes.push({ x: (p.x - x0) * s, y: (p.y - y0) * s }); adj.push([]); }
        return index.get(k);
      };
      for (const st of this.streets) {
        if (!st.pts.some(p => p.x > x0 - pad && p.x < x0 + W / s + pad && p.y > y0 - pad && p.y < y0 + H / s + pad)) continue;
        const a = node(st.pts[0]), b = node(st.pts[st.pts.length - 1]);
        if (a === b) continue;
        const pts = st.pts.map(p => ({ x: (p.x - x0) * s, y: (p.y - y0) * s })), cum = [0];
        for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
        const len = cum[cum.length - 1];
        edges.push({ a, b, pts, cum, len, metres: len / s, art: st.major, free: st.major ? 45 : 30,
          sens: st.major ? 0.6 + r() * 0.4 : 0.2 + r() * 0.4, base: r() * 0.16 - 0.05, phase: r() * 6.283, rate: 0.25 + r() * 0.5, c: 0, speed: 30 });
        adj[a].push(edges.length - 1); adj[b].push(edges.length - 1);
      }
      this.nodes = nodes; this.edges = edges; this.adj = adj;
      this.inView = nodes.map(n => n.x > 8 && n.y > 8 && n.x < W - 8 && n.y < H - 8 && true);
      this.drawLayer();
      // Cars: a few dozen dots driving the streets in view.
      const pool = edges.map((e, i) => (this.inView[e.a] || this.inView[e.b] ? i : -1)).filter(i => i >= 0);
      const count = Math.max(14, Math.min(48, Math.round((W * H) / 6000)));
      this.cars = [];
      for (let k = 0; k < count && pool.length; k++) {
        const ei = pool[Math.floor(r() * pool.length)];
        this.cars.push({ ei, forward: r() < 0.5, s: r() * edges[ei].len });
      }
      // Default trip, bottom-left to top-right, like the old panel.
      this.update(0);
      const a = this.nodeNear(W * 0.1, H * 0.86, 1e9), b = this.nodeNear(W * 0.9, H * 0.14, 1e9);
      this.A = a; this.B = b; this.pickNext = "A";
      this.findRoute();
      this.emit(true);
    }
    drawLayer() {
      const dpr = Math.min(2, g.devicePixelRatio || 1), c = this.layer, x = c.getContext("2d"), p = this.pal;
      c.width = Math.round(this.W * dpr); c.height = Math.round(this.H * dpr);
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      x.lineCap = "round"; x.lineJoin = "round";
      x.strokeStyle = p.road; x.lineWidth = 1.1;
      x.beginPath();
      for (const e of this.edges) if (!e.art) this.trace(x, e);
      x.stroke();
    }
    repaint() { this.pal = palette(); if (this.W) { this.drawLayer(); this.draw(1); } }
    setCity(view, streets, data) {
      this.view = view; this.streets = streets; this.data = data; this.hover = -1;
      if (this.W) { this.build(); this.draw(); }
    }
    update(dt) {
      if (this.o.autoClock && dt > 0) this.hour = (this.hour + (dt * 24) / this.o.daySeconds) % 24;
      const f = rush(this.hour);
      for (const e of this.edges) {
        const v = e.base + e.sens * f + 0.06 * Math.sin(this.t * e.rate + e.phase);
        e.c = v < 0 ? 0 : v > 1 ? 1 : v;
        e.speed = e.free * (1 - 0.75 * e.c);                      // km/h
      }
    }
    minutes(e) { return (e.metres / 1000 / e.speed) * 60; }
    findRoute() {
      this.route = []; this.routeSet = new Set();
      if (this.A == null || this.B == null || this.A === this.B) return;
      const n = this.nodes.length, dist = new Float64Array(n).fill(Infinity), prev = new Int32Array(n).fill(-1), heap = [[0, this.A]];
      dist[this.A] = 0;
      while (heap.length) {
        const [du, u] = heapPop(heap);
        if (du > dist[u]) continue;
        if (u === this.B) break;
        for (const ei of this.adj[u]) {
          const e = this.edges[ei], v = e.a === u ? e.b : e.a, w = du + this.minutes(e);
          if (w < dist[v]) { dist[v] = w; prev[v] = ei; heapPush(heap, [w, v]); }
        }
      }
      if (dist[this.B] === Infinity) return;
      for (let cur = this.B; cur !== this.A;) { const ei = prev[cur]; this.route.push(ei); const e = this.edges[ei]; cur = e.a === cur ? e.b : e.a; }
      this.route.reverse();
      this.routeSet = new Set(this.route);
    }
    emit(force) {
      if (!this.o.onUpdate) return;
      const now = performance.now();
      if (!force && now - this.lastEmit < 250) return;
      this.lastEmit = now;
      const segs = this.route.map(ei => ({ min: this.minutes(this.edges[ei]), c: this.edges[ei].c }));
      this.o.onUpdate({ hour: this.hour, eta: segs.reduce((t, x) => t + x.min, 0), segs, hasRoute: segs.length > 0, pickNext: this.pickNext });
    }
    local(ev) { const r = this.canvas.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; }
    nodeNear(x, y, maxD2) {   // nearest intersection on screen that has a street
      let best = -1, bd = maxD2;
      this.nodes.forEach((n, i) => {
        if (!this.inView[i] || !this.adj[i].length) return;
        const d = (n.x - x) ** 2 + (n.y - y) ** 2;
        if (d < bd) { bd = d; best = i; }
      });
      return best;
    }
    onDown(ev) {
      const [x, y] = this.local(ev), i = this.nodeNear(x, y, 40 * 40);
      if (i < 0) return;
      if (this.pickNext === "A") { this.A = i; this.B = null; this.pickNext = "B"; }
      else { if (i === this.A) return; this.B = i; this.pickNext = "A"; }
      this.findRoute(); this.draw(); this.emit(true);
    }
    onMove(ev) {
      const [x, y] = this.local(ev), i = this.nodeNear(x, y, 40 * 40);
      if (i !== this.hover) { this.hover = i; this.canvas.style.cursor = i >= 0 ? "pointer" : ""; if (!this.running) this.draw(); }
    }
    pointAt(e, s) {
      let i = 1;
      while (i < e.cum.length - 1 && e.cum[i] < s) i++;
      const t = Math.max(0, Math.min(1, (s - e.cum[i - 1]) / ((e.cum[i] - e.cum[i - 1]) || 1))), a = e.pts[i - 1], b = e.pts[i];
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    step(dt, now) {
      this.t += dt;
      this.update(dt);
      for (const car of this.cars) {
        const e = this.edges[car.ei];
        car.s += e.speed * 0.5 * dt;                              // time-lapse: 45 km/h is about 22 px/s
        if (car.s < e.len) continue;
        const end = car.forward ? e.b : e.a;
        const opts = this.adj[end].filter(i => i !== car.ei && (this.inView[this.edges[i].a] || this.inView[this.edges[i].b]));
        const ni = opts.length ? opts[(Math.random() * opts.length) | 0] : car.ei;
        car.s = 0; car.forward = this.edges[ni].a === end; car.ei = ni;
      }
      if (now - this.lastRoute > 1200) { this.findRoute(); this.lastRoute = now; }
      this.draw();
      this.emit(false);
    }
    trace(ctx, e) { ctx.moveTo(e.pts[0].x, e.pts[0].y); for (let i = 1; i < e.pts.length; i++) ctx.lineTo(e.pts[i].x, e.pts[i].y); }
    pin(i, label) {
      const p = this.nodes[i], ctx = this.ctx;
      ctx.fillStyle = this.pal.accent;
      ctx.beginPath(); ctx.arc(p.x, p.y, 11, 0, 6.283); ctx.fill();
      ctx.fillStyle = this.pal.band;
      ctx.font = "800 11px Archivo, Arial, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(label, p.x, p.y + 0.5);
    }
    draw() {
      const ctx = this.ctx, p = this.pal;
      if (!this.W) return;
      ctx.clearRect(0, 0, this.W, this.H);
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.drawImage(this.layer, 0, 0, this.W, this.H);
      // Main roads, coloured by traffic, kept thin and see-through so the map stays light and the route stands out.
      ctx.lineWidth = 1.3; ctx.globalAlpha = this.routeSet.size ? 0.42 : 0.6;
      for (const e of this.edges) {
        if (!e.art) continue;
        ctx.strokeStyle = ramp(p, e.c);
        ctx.beginPath(); this.trace(ctx, e); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // The fastest route: a light casing, then each street in its traffic colour.
      if (this.route.length) {
        ctx.strokeStyle = p.ink; ctx.lineWidth = 6.5;
        ctx.beginPath(); this.route.forEach(ei => this.trace(ctx, this.edges[ei])); ctx.stroke();
        ctx.lineWidth = 3.5;
        for (const ei of this.route) { const e = this.edges[ei]; ctx.strokeStyle = ramp(p, e.c); ctx.beginPath(); this.trace(ctx, e); ctx.stroke(); }
      }
      ctx.fillStyle = p.ink; ctx.globalAlpha = 0.85;
      for (const car of this.cars) {
        const e = this.edges[car.ei], q = this.pointAt(e, car.forward ? car.s : e.len - car.s);
        ctx.beginPath(); ctx.arc(q.x, q.y, 1.9, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (this.hover >= 0) {
        const n = this.nodes[this.hover];
        ctx.strokeStyle = p.accent; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(n.x, n.y, 9, 0, 6.283); ctx.stroke();
      }
      if (this.A != null) this.pin(this.A, "A");
      if (this.B != null) this.pin(this.B, "B");
    }
    destroy() {
      super.destroy();
      this.canvas.removeEventListener("pointerdown", this._down);
      this.canvas.removeEventListener("pointermove", this._move);
      this.canvas.removeEventListener("pointerleave", this._leave);
    }
  }

  function etaText(s) { return s.hasRoute ? s.eta.toFixed(1) + " min" : s.pickNext === "B" ? "Pick B" : "–"; }

  // Home page panel: real streets of the picked city when the street files load (and the new home visuals
  // are switched on), otherwise the synthetic network.
  D.mountHeroMap = function (card) {
    const q = k => card.querySelector(`[data-rn="${k}"]`), canvas = card.querySelector("canvas");
    const hint = card.querySelector(".map-hint"), picker = card.querySelector(".map-cities");
    const opts = {
      seed: 21, autoClock: true, hour: 7.5, daySeconds: 60,
      onUpdate: s => {
        q("clock").textContent = clock(s.hour);
        q("eta").textContent = etaText(s);
        q("links").textContent = s.hasRoute ? String(s.segs.length) : "–";
      }
    };
    const LM = SITE.learnMap;
    let inst = null, dead = false, city = "sf", token = 0;
    const synthetic = () => { if (!dead && !inst) inst = new RoadNet(canvas, opts); };
    function describe(view) {
      canvas.setAttribute("aria-label", `Map of central ${view.name} with live traffic colours. Click to drop a pickup point, then a drop-off point, to see the fastest route and its travel time.`);
      if (hint) hint.innerHTML = `Pick a city, then click the map to drop a pickup (A) and a drop-off (B). The clock runs through a full day, so rush hour slows the main roads. ETAs use typical speeds by road type, for illustration. Streets of ${view.name}, © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors.`;
    }
    function press(key) { picker.querySelectorAll("[data-city]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.city === key))); }
    function pick(key) {
      if (!inst || !CITY_VIEWS[key] || key === city) return;
      const mine = ++token, prev = city;
      city = key; press(key);
      q("eta").textContent = "Loading…";
      loadCity(key).then(data => {
        if (dead || mine !== token) return;
        inst.setCity(CITY_VIEWS[key], LM.decode(data), data);
        describe(CITY_VIEWS[key]);
      }, () => {
        if (dead || mine !== token) return;
        city = prev; press(prev);
        q("eta").textContent = "Couldn't load";
      });
    }
    const onPick = e => { const b = e.target.closest("[data-city]"); if (b) pick(b.dataset.city); };
    if (LM && LM.enabled && LM.loadRoads) {
      loadCity("sf").then(data => {
        if (dead) return;
        inst = new CityNet(canvas, CITY_VIEWS.sf, LM.decode(data), data, opts);
        card.classList.add("is-real");
        describe(CITY_VIEWS.sf);
        if (picker) picker.addEventListener("click", onPick);
      }, synthetic);
    } else synthetic();
    return { destroy() { dead = true; if (picker) picker.removeEventListener("click", onPick); if (inst) inst.destroy(); } };
  };

  D.mountRouteDemo = function (root) {
    const q = k => root.querySelector(`[data-rn="${k}"]`);
    const hourEl = q("hour");
    const net = new RoadNet(root.querySelector("canvas"), {
      seed: 5, autoClock: false, hour: parseFloat(hourEl.value),
      onUpdate: s => {
        q("clock").textContent = clock(s.hour);
        q("eta").textContent = etaText(s);
        q("links").textContent = s.hasRoute ? String(s.segs.length) : "–";
        const max = Math.max(0.01, ...s.segs.map(x => x.min));
        q("segs").innerHTML = s.hasRoute
          ? s.segs.map((x, i) => `<li><span>#${i + 1}</span><span class="seg-bar"><i class="${x.c < 0.34 ? "free" : x.c < 0.67 ? "slow" : "jam"}" style="width:${((x.min / max) * 100).toFixed(1)}%"></i></span><span>${x.min.toFixed(1)} min</span></li>`).join("")
          : `<li class="seg-empty">${s.pickNext === "B" ? "Now click a second intersection for B." : "Click two intersections to see the breakdown."}</li>`;
      }
    });
    const setHour = h => { hourEl.value = String(h); net.setHour(h); };
    hourEl.addEventListener("input", () => net.setHour(parseFloat(hourEl.value)));
    q("random").addEventListener("click", () => net.randomTrip());
    q("rush").addEventListener("click", () => setHour(8.25));
    q("night").addEventListener("click", () => setHour(23));
    return net;
  };

  /* ------------------------------------------------------------------ */
  /* Taxi dispatch simulation (greedy matching, for illustration)        */
  /* ------------------------------------------------------------------ */
  class DispatchSim extends CanvasDemo {
    constructor(root) {
      super(root.querySelector("canvas"));
      this.root = root;
      this.ui = k => root.querySelector(`[data-ds="${k}"]`);
      this.fleet = parseInt(this.ui("fleet").value, 10);
      this.demand = 2.4;
      this.tickMs = 380;
      this.paused = reduceMQ.matches;
      this.acc = 0;
      this.cols = 12; this.rows = 8;
      this.reset();
      this.ui("fleet").addEventListener("input", () => { this.setFleet(parseInt(this.ui("fleet").value, 10)); this.updateUI(); if (!this.running) this.draw(1); });
      root.querySelectorAll("[data-demand]").forEach(b => b.addEventListener("click", () => {
        this.demand = parseFloat(b.dataset.demand);
        root.querySelectorAll("[data-demand]").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      }));
      this.ui("play").addEventListener("click", () => { this.paused = !this.paused; this.updateUI(); this.sync(); });
      this.ui("reset").addEventListener("click", () => { this.reset(); this.draw(1); });
      this.updateUI();
    }
    wantsMotion() { return !this.paused; }
    build() {
      const W = this.W, H = this.H;
      this.cols = W < 520 ? 8 : 12;
      this.rows = Math.max(5, Math.round((this.cols * H) / W));
      const pad = 22;
      this.cell = Math.min((W - pad * 2) / this.cols, (H - pad * 2) / this.rows);
      this.ox = (W - this.cell * this.cols) / 2;
      this.oy = (H - this.cell * this.rows) / 2;
      const clampX = v => Math.max(0, Math.min(this.cols, v)), clampY = v => Math.max(0, Math.min(this.rows, v));
      this.taxis.forEach(t => { t.x = clampX(t.x); t.y = clampY(t.y); t.px = t.x; t.py = t.y; t.path = []; t.state = "idle"; if (t.pax) { t.pax.taxi = null; t.pax = null; } });
      this.pax = this.pax.filter(p => p.x <= this.cols && p.y <= this.rows && p.dx <= this.cols && p.dy <= this.rows);
    }
    rnd(n) { return Math.floor(Math.random() * (n + 1)); }
    reset() {
      this.minute = 0; this.taxis = []; this.pax = []; this.served = 0; this.gaveUp = 0; this.waitSum = 0; this.acc = 0;
      this.setFleet(this.fleet);
      this.updateUI();
    }
    setFleet(n) {
      this.fleet = n;
      while (this.taxis.length < n) { const x = this.rnd(this.cols), y = this.rnd(this.rows); this.taxis.push({ x, y, px: x, py: y, path: [], state: "idle", pax: null }); }
      while (this.taxis.length > n) {
        let k = this.taxis.findIndex(t => t.state === "idle");
        if (k < 0) k = this.taxis.length - 1;
        const t = this.taxis.splice(k, 1)[0];
        if (t.pax && t.state === "pickup") t.pax.taxi = null;
      }
      const out = this.ui("fleet-out");
      if (out) out.textContent = n + " taxis";
    }
    path(x0, y0, x1, y1) {
      const p = [];
      let x = x0, y = y0;
      const xFirst = Math.random() < 0.5;
      const stepX = () => { while (x !== x1) { x += Math.sign(x1 - x); p.push([x, y]); } };
      const stepY = () => { while (y !== y1) { y += Math.sign(y1 - y); p.push([x, y]); } };
      if (xFirst) { stepX(); stepY(); } else { stepY(); stepX(); }
      return p;
    }
    poisson(l) { const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= Math.random(); } while (p > L); return k - 1; }
    tick() {
      this.minute++;
      for (const t of this.taxis) {
        t.px = t.x; t.py = t.y;
        if (t.path.length) { const [nx, ny] = t.path.shift(); t.x = nx; t.y = ny; }
        if (t.state === "pickup" && !t.path.length) {
          const p = t.pax;
          this.served++; this.waitSum += p.wait;
          const idx = this.pax.indexOf(p);
          if (idx >= 0) this.pax.splice(idx, 1);
          t.state = "trip"; t.dest = [p.dx, p.dy];
          t.path = this.path(t.x, t.y, p.dx, p.dy);
        } else if (t.state === "trip" && !t.path.length) {
          t.state = "idle"; t.pax = null; t.dest = null;
        }
      }
      for (let i = this.pax.length - 1; i >= 0; i--) {
        const p = this.pax[i];
        p.wait++;
        if (!p.taxi && p.wait > 24) { this.pax.splice(i, 1); this.gaveUp++; }
      }
      const k = this.poisson(this.demand * (this.cols * this.rows) / 96);
      for (let j = 0; j < k; j++) {
        const x = this.rnd(this.cols), y = this.rnd(this.rows);
        let dx, dy, guard = 0;
        do { dx = this.rnd(this.cols); dy = this.rnd(this.rows); guard++; } while (Math.abs(dx - x) + Math.abs(dy - y) < 3 && guard < 50);
        this.pax.push({ x, y, dx, dy, wait: 0, taxi: null });
      }
      const idle = this.taxis.filter(t => t.state === "idle"), open = this.pax.filter(p => !p.taxi);
      const pairs = [];
      idle.forEach(t => open.forEach(p => { const d = Math.abs(t.x - p.x) + Math.abs(t.y - p.y); if (d <= 12) pairs.push([d, t, p]); }));
      pairs.sort((a, b) => a[0] - b[0]);
      for (const [, t, p] of pairs) {
        if (t.state !== "idle" || p.taxi) continue;
        t.state = "pickup"; t.pax = p; p.taxi = t;
        t.path = this.path(t.x, t.y, p.x, p.y);
      }
      this.updateUI();
    }
    updateUI() {
      const set = (k, v) => { const el = this.ui(k); if (el) el.textContent = v; };
      const busy = this.taxis.filter(t => t.state !== "idle").length;
      set("clock", clock(7 + this.minute / 60));
      set("waiting", String(this.pax.length));
      set("avg", this.served ? (this.waitSum / this.served).toFixed(1) + " min" : "–");
      set("busy", this.taxis.length ? Math.round((busy / this.taxis.length) * 100) + "%" : "0%");
      set("served", String(this.served));
      set("gaveup", String(this.gaveUp));
      set("play", this.paused ? "Play" : "Pause");
    }
    step(dt) {
      this.acc += dt * 1000;
      let guard = 0;
      while (this.acc >= this.tickMs && guard < 4) { this.acc -= this.tickMs; this.tick(); guard++; }
      if (guard >= 4) this.acc = 0;
      this.draw(this.acc / this.tickMs);
    }
    gx(x) { return this.ox + x * this.cell; }
    gy(y) { return this.oy + y * this.cell; }
    draw(f) {
      const ctx = this.ctx, p = this.pal;
      if (!this.W) return;
      if (f == null) f = 1;
      ctx.clearRect(0, 0, this.W, this.H);
      ctx.strokeStyle = p.road; ctx.lineWidth = 3; ctx.lineCap = "round";
      ctx.beginPath();
      for (let i = 0; i <= this.cols; i++) { ctx.moveTo(this.gx(i), this.gy(0)); ctx.lineTo(this.gx(i), this.gy(this.rows)); }
      for (let j = 0; j <= this.rows; j++) { ctx.moveTo(this.gx(0), this.gy(j)); ctx.lineTo(this.gx(this.cols), this.gy(j)); }
      ctx.stroke();
      const pos = t => [this.gx(t.px + (t.x - t.px) * f), this.gy(t.py + (t.y - t.py) * f)];
      ctx.setLineDash([5, 6]); ctx.lineWidth = 2;
      for (const t of this.taxis) {
        if (t.state === "pickup" && t.pax) {
          const [x, y] = pos(t);
          ctx.strokeStyle = p.accent; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(this.gx(t.pax.x), this.gy(t.pax.y)); ctx.stroke();
        } else if (t.state === "trip" && t.dest) {
          const [x, y] = pos(t);
          ctx.strokeStyle = p.muted; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(this.gx(t.dest[0]), this.gy(t.dest[1])); ctx.stroke();
          ctx.setLineDash([]); ctx.strokeRect(this.gx(t.dest[0]) - 5, this.gy(t.dest[1]) - 5, 10, 10); ctx.setLineDash([5, 6]);
        }
      }
      ctx.setLineDash([]);
      for (const q of this.pax) {
        const x = this.gx(q.x), y = this.gy(q.y);
        if (q.wait > 12 && !q.taxi) { ctx.strokeStyle = p.jamS; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, 9, 0, 6.283); ctx.stroke(); }
        ctx.fillStyle = p.ink; ctx.beginPath(); ctx.arc(x, y, 4.5, 0, 6.283); ctx.fill();
      }
      for (const t of this.taxis) {
        const [x, y] = pos(t);
        ctx.fillStyle = t.state === "idle" ? p.muted : p.accent;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x - 6, y - 6, 12, 12, 3); else ctx.rect(x - 6, y - 6, 12, 12);
        ctx.fill();
      }
    }
  }
  D.mountDispatch = root => new DispatchSim(root);

  /* ------------------------------------------------------------------ */
  /* Text2Simulation toy checker                                         */
  /* ------------------------------------------------------------------ */
  const T2S_MAX_HOURS = 24;
  const VEHICLES = [["electric bus", "bus"], ["buses", "bus"], [" bus ", "bus"], ["drone", "drone"], ["scooter", "e-scooter"], ["bicycle", "bicycle"], ["bike", "bicycle"], ["train", "train"], ["subway", "subway"], ["truck", "truck"], ["ferry", "ferry"], ["shuttle", "shuttle"]];
  const FEATURES = [
    [/snow|rain|storm|weather|fog|blizzard/, "weather effects"], [/charging|battery/, "vehicle charging"],
    [/autonomous|self-driving/, "autonomous driving"], [/pedestrian/, "pedestrians"], [/parking/, "parking search"],
    [/accident|crash|incident/, "road incidents"], [/surge|pricing/, "dynamic pricing"]
  ];

  function t2sParse(text) {
    const t = " " + String(text).toLowerCase().replace(/,(?=\d{3})/g, "").replace(/[^\w\s.:-]/g, " ") + " ";
    const cfg = { vehicle: "taxi", fleet_size: null, start_time: null, duration_hours: null, travel_time_model: "LinkETA", dispatch: "MIP (OR-Tools)", extra_features: [] };
    const notes = [];
    for (const [w, v] of VEHICLES) if (t.includes(w)) { cfg.vehicle = v; break; }
    const num = t.match(/(\d+(?:\.\d+)?)\s*(k\b|thousand)?\s*(?:electric\s+|autonomous\s+|self-driving\s+)?(taxis?|cabs?|vehicles?|cars?|buses|bus|drones?|scooters?|bikes?|trucks?|shuttles?)\b/);
    if (num) { let n = parseFloat(num[1]); if (num[2]) n *= 1000; cfg.fleet_size = Math.round(n); }
    if (/morning|rush hour|am peak/.test(t)) cfg.start_time = "07:00";
    if (/evening|pm peak/.test(t)) cfg.start_time = "16:00";
    if (/tonight|night|overnight/.test(t)) cfg.start_time = "22:00";
    const at = t.match(/\b(\d{1,2})\s*(am|pm)\b/);
    if (at) { let h = parseInt(at[1], 10) % 12; if (at[2] === "pm") h += 12; cfg.start_time = pad2(h) + ":00"; }
    const hrs = t.match(/(\d+(?:\.\d+)?)\s*(hours?|hrs?)\b/), days = t.match(/(\d+)\s*days?\b/);
    if (hrs) cfg.duration_hours = parseFloat(hrs[1]);
    if (days) cfg.duration_hours = parseInt(days[1], 10) * 24;
    if (/\bweek\b/.test(t)) cfg.duration_hours = 168;
    if (/all day|full day/.test(t)) cfg.duration_hours = 24;
    if (/rush|peak/.test(t) && cfg.duration_hours == null) cfg.duration_hours = 3;
    if (/fixed speed|constant speed|static speed/.test(t)) cfg.travel_time_model = "fixed speeds";
    if (/greedy/.test(t) && /compare|versus|\bvs\b|optimi[sz]ed|\bmip\b/.test(t)) cfg.dispatch = ["greedy", "MIP (OR-Tools)"];
    else if (/greedy/.test(t)) cfg.dispatch = "greedy";
    for (const [re, f] of FEATURES) if (re.test(t)) cfg.extra_features.push(f);
    if (cfg.fleet_size == null) { cfg.fleet_size = 500; notes.push("No fleet size given, so the default of 500 was used."); }
    if (cfg.start_time == null) { cfg.start_time = "08:00"; notes.push("No start time given, so 08:00 was used."); }
    if (cfg.duration_hours == null) { cfg.duration_hours = 2; notes.push("No duration given, so 2 hours was used."); }
    return { cfg, notes };
  }
  function t2sVerify(cfg) {
    const issues = [], bad = new Set();
    if (cfg.vehicle !== "taxi") { issues.push(`Vehicle type "${cfg.vehicle}" isn't supported. This digital twin simulates taxis.`); bad.add("vehicle"); }
    if (cfg.duration_hours > T2S_MAX_HOURS) { issues.push(`A ${cfg.duration_hours}-hour run is longer than this demo's ${T2S_MAX_HOURS}-hour limit.`); bad.add("duration_hours"); }
    if (cfg.fleet_size < 1) { issues.push("The fleet needs at least one taxi."); bad.add("fleet_size"); }
    cfg.extra_features.forEach(f => { issues.push(`"${f}" isn't something this simulator models.`); });
    if (cfg.extra_features.length) bad.add("extra_features");
    return { issues, bad };
  }
  D.t2sParse = t2sParse;
  D.t2sVerify = t2sVerify;

  function escHTML(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function configHTML(cfg, bad) {
    const val = v => Array.isArray(v) ? "[" + v.map(x => `<span class="s">"${escHTML(x)}"</span>`).join(", ") + "]"
      : typeof v === "number" ? `<span class="n">${v}</span>` : `<span class="s">"${escHTML(v)}"</span>`;
    const rows = Object.keys(cfg).map(k => {
      const line = `<span class="k">"${k}"</span>: ${val(cfg[k])}`;
      return "  " + (bad && bad.has(k) ? `<span class="bad">${line}</span>` : line);
    });
    return "{\n" + rows.join(",\n") + "\n}";
  }

  class Checker {
    constructor(root) {
      this.root = root;
      this.input = root.querySelector("#t2s-input");
      this.configEl = root.querySelector('[data-t2s="config"]');
      this.verdictEl = root.querySelector('[data-t2s="verdict"]');
      this.steps = [...root.querySelectorAll(".t2s-steps li")];
      this.timers = [];
      root.querySelector('[data-t2s="run"]').addEventListener("click", () => this.run(true));
      this.input.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); this.run(true); } });
      root.querySelectorAll("[data-t2s-example]").forEach(b => b.addEventListener("click", () => { this.input.value = b.dataset.t2sExample; this.run(true); }));
      this.run(false);
    }
    clear() { this.timers.forEach(clearTimeout); this.timers = []; }
    setStep(i, state) { this.steps.forEach((li, k) => { li.className = k < i ? "done" : k === i ? state : ""; }); }
    run(animate) {
      this.clear();
      const text = this.input.value.trim();
      if (!text) { this.verdictEl.className = "verdict no"; this.verdictEl.innerHTML = '<span class="v-icon">!</span><div><p class="v-title">Type a scenario first.</p></div>'; return; }
      const { cfg, notes } = t2sParse(text);
      const { issues, bad } = t2sVerify(cfg);
      const ok = issues.length === 0;
      const finish = () => {
        this.configEl.innerHTML = configHTML(cfg, bad);
        this.steps.forEach((li, k) => { li.className = k < 2 ? "done" : ok ? "done" : "fail"; });
        this.verdictEl.className = "verdict " + (ok ? "ok" : "no");
        this.verdictEl.innerHTML = ok
          ? `<span class="v-icon" aria-hidden="true">✓</span><div><p class="v-title">Supported. Ready to run.</p>${notes.length ? `<ul>${notes.map(n => `<li>${n}</li>`).join("")}</ul>` : ""}</div>`
          : `<span class="v-icon" aria-hidden="true">✕</span><div><p class="v-title">Refused before running.</p><ul>${issues.map(n => `<li>${escHTML(n)}</li>`).join("")}</ul></div>`;
      };
      if (!animate || reduceMQ.matches) { finish(); return; }
      this.verdictEl.className = "verdict"; this.verdictEl.innerHTML = "";
      this.configEl.textContent = "{ }";
      this.setStep(0, "active");
      this.timers.push(setTimeout(() => { this.setStep(1, "active"); this.configEl.innerHTML = configHTML(cfg, null); }, 380));
      this.timers.push(setTimeout(() => this.setStep(2, "active"), 820));
      this.timers.push(setTimeout(finish, 1300));
    }
    repaint() {}
    destroy() { this.clear(); }
  }
  D.mountChecker = root => new Checker(root);
})(typeof window !== "undefined" ? window : globalThis);
