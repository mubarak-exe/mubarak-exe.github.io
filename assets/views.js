/* Page templates. Each view function returns the HTML for one page. */
(function (g) {
  "use strict";
  const SITE = g.SITE;
  const V = (SITE.views = {});

  const pad2 = n => String(n).padStart(2, "0");
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const ARR = '<span class="arr" aria-hidden="true">→</span>';
  const EXT = '<span class="arr" aria-hidden="true">↗</span>';
  const DOWN = '<span class="arr arr-down" aria-hidden="true">↓</span>';

  function seeded(seed) {
    return function () {
      seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  SITE.seeded = seeded;
  SITE.pad2 = pad2;

  function lines(arr) {
    return arr.map((l, i) => `<span class="line"><span style="--i:${i}">${l}</span></span>`).join("");
  }

  /* ---------- reading time ---------- */
  const countWords = html => String(html || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  function blockWords(b) {
    let w = countWords(b.text) + countWords(b.title);
    (b.items || []).forEach(it => { w += countWords(typeof it === "string" ? it : [it.title, it.text, it.label].join(" ")); });
    (b.steps || []).forEach(s => { w += countWords(s.title + " " + s.text); });
    return w;
  }
  function readMins(n) {
    let w = countWords(n.title) + countWords(n.dek);
    n.sections.forEach(s => { w += countWords(s.title); s.blocks.forEach(b => { w += blockWords(b); }); });
    return Math.max(2, Math.round(w / 200));
  }
  SITE.readMins = readMins;

  /* ------------------------------------------------------------------ */
  /* Generated cover art (SVG, coloured by theme tokens via classes)     */
  /* ------------------------------------------------------------------ */
  const f1 = n => n.toFixed(1);
  const ln = (p, q, c, w) => `<line x1="${f1(p[0])}" y1="${f1(p[1])}" x2="${f1(q[0])}" y2="${f1(q[1])}" class="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  const svgOpen = () => '<svg class="cover" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><rect class="cv-bg" width="800" height="500"/>';

  function coverNetwork(seed) {
    const r = seeded(seed), cols = 9, rows = 6, pad = 58;
    const cw = (800 - pad * 2) / (cols - 1), ch = (500 - pad * 2) / (rows - 1);
    const N = [];
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) N.push([pad + x * cw + (r() - 0.5) * cw * 0.4, pad + y * ch + (r() - 0.5) * ch * 0.4]);
    const E = [];
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      if (x < cols - 1 && r() > 0.1) E.push([i, i + 1]);
      if (y < rows - 1 && r() > 0.1) E.push([i, i + cols]);
      if (x < cols - 1 && y < rows - 1 && r() < 0.1) E.push([i, i + cols + 1]);
    }
    let roads = "", colored = "", cars = "";
    E.forEach(([a, b]) => {
      roads += ln(N[a], N[b], "cv-road", 10);
      const v = r();
      colored += ln(N[a], N[b], v < 0.55 ? "cv-free" : v < 0.82 ? "cv-slow" : "cv-jam", 3.5);
      if (r() < 0.45) { const t = r(); cars += `<circle class="cv-car" cx="${f1(N[a][0] + (N[b][0] - N[a][0]) * t)}" cy="${f1(N[a][1] + (N[b][1] - N[a][1]) * t)}" r="3.4"/>`; }
    });
    let x = 0, y = rows - 1;
    const path = [[x, y]];
    while (x < cols - 1 || y > 0) { if (y === 0 || (x < cols - 1 && r() < 0.55)) x++; else y--; path.push([x, y]); }
    const pts = path.map(([px, py]) => N[py * cols + px]);
    const d = "M" + pts.map(p => f1(p[0]) + " " + f1(p[1])).join(" L");
    const A = pts[0], B = pts[pts.length - 1];
    return svgOpen() + roads + colored +
      `<path d="${d}" class="cv-route-case" stroke-width="13" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="${d}" class="cv-route" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` + cars +
      `<circle class="cv-pin" cx="${f1(A[0])}" cy="${f1(A[1])}" r="15"/><text class="cv-pin-t" x="${f1(A[0])}" y="${f1(A[1] + 5)}" text-anchor="middle">A</text>` +
      `<circle class="cv-pin" cx="${f1(B[0])}" cy="${f1(B[1])}" r="15"/><text class="cv-pin-t" x="${f1(B[0])}" y="${f1(B[1] + 5)}" text-anchor="middle">B</text></svg>`;
  }

  function coverDispatch(seed) {
    const r = seeded(seed), step = 64, x0 = 48, y0 = 42, cols = 11, rows = 6;
    let s = svgOpen();
    for (let i = 0; i <= cols; i++) s += ln([x0 + i * step, y0], [x0 + i * step, y0 + rows * step], "cv-road", 4);
    for (let j = 0; j <= rows; j++) s += ln([x0, y0 + j * step], [x0 + cols * step, y0 + j * step], "cv-road", 4);
    const pt = () => [x0 + Math.floor(r() * (cols + 1)) * step, y0 + Math.floor(r() * (rows + 1)) * step];
    const taxis = Array.from({ length: 14 }, pt), pax = Array.from({ length: 10 }, pt);
    for (let k = 0; k < 6; k++) {
      const t = taxis[k], p = pax[k];
      s += `<path d="M${t[0]} ${t[1]} L${p[0]} ${t[1]} L${p[0]} ${p[1]}" class="cv-link" stroke-width="3" stroke-dasharray="7 7" stroke-linejoin="round"/>`;
    }
    pax.forEach(p => { s += `<circle class="cv-pax-ring" cx="${p[0]}" cy="${p[1]}" r="13" stroke-width="2"/><circle class="cv-pax" cx="${p[0]}" cy="${p[1]}" r="6.5"/>`; });
    taxis.forEach((t, k) => { s += `<rect class="${k < 9 ? "cv-taxi" : "cv-taxi-idle"}" x="${t[0] - 9}" y="${t[1] - 9}" width="18" height="18" rx="4"/>`; });
    return s + "</svg>";
  }

  function coverAgent() {
    let s = svgOpen();
    s += '<rect class="cv-panel" x="52" y="62" width="344" height="168" rx="22" stroke-width="2"/>';
    s += '<text class="cv-label" x="80" y="100">REQUEST</text>';
    s += '<text class="cv-text" x="80" y="140">Simulate 800 taxis</text><text class="cv-text" x="80" y="172">in the morning rush</text><text class="cv-text" x="80" y="204">with LinkETA times</text>';
    s += '<path d="M396 150 C 450 150, 420 268, 470 268" class="cv-link" stroke-width="3" stroke-linecap="round"/><path d="M458 258 L472 268 L458 278" class="cv-link" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
    s += '<rect class="cv-panel" x="440" y="196" width="312" height="236" rx="18" stroke-width="2"/>';
    s += '<text class="cv-label" x="468" y="232">CONFIG</text>';
    const rows = [["vehicle", '"taxi"', "cv-str"], ["fleet_size", "800", "cv-val"], ["start_time", '"07:00"', "cv-str"], ["eta_model", '"LinkETA"', "cv-str"], ["dispatch", '"MIP"', "cv-str"]];
    rows.forEach(([k, v, c], i) => { s += `<text class="cv-key" x="468" y="${268 + i * 30}">${k}:</text><text class="${c}" x="610" y="${268 + i * 30}">${esc(v)}</text>`; });
    s += '<circle class="cv-ok" cx="736" cy="196" r="30"/><path class="cv-ok-mark" d="M722 196 L732 206 L751 186" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>';
    s += '<text class="cv-label" x="52" y="300">VERIFY</text><text class="cv-label" x="52" y="330">→ RUN OR REFUSE</text>';
    return s + "</svg>";
  }

  function coverFacade(seed) {
    const r = seeded(seed), cols = 9, rows = 6, x0 = 34, y0 = 30, gap = 10;
    const w = (800 - x0 * 2 - gap * (cols - 1)) / cols, h = (500 - y0 * 2 - gap * (rows - 1)) / rows;
    let s = svgOpen() + `<rect class="cv-frame" x="${x0 - gap}" y="${y0 - gap}" width="${800 - 2 * (x0 - gap)}" height="${500 - 2 * (y0 - gap)}" rx="6"/>`;
    const hl = [];
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const v = r(), px = x0 + x * (w + gap), py = y0 + y * (h + gap);
      s += `<rect class="${v < 0.4 ? "cv-glass-a" : v < 0.8 ? "cv-glass-b" : "cv-glass-c"}" x="${f1(px)}" y="${f1(py)}" width="${f1(w)}" height="${f1(h)}" rx="3"/>`;
      s += ln([px + w * 0.15, py + h * 0.85], [px + w * 0.55, py + h * 0.15], "cv-reflect", 6);
      if (r() < 0.12) hl.push([px, py]);
    }
    hl.forEach(([px, py]) => { s += `<rect class="cv-hl" x="${f1(px + 3)}" y="${f1(py + 3)}" width="${f1(w - 6)}" height="${f1(h - 6)}" rx="3" stroke-width="3"/>`; });
    return s + "</svg>";
  }

  function coverSignals(seed) {
    const r = seeded(seed);
    const labels = ["FACE", "SPEECH", "PHYSIO", "MOVEMENT"];
    let s = svgOpen();
    labels.forEach((lab, k) => {
      const base = 80 + k * 112, ph = r() * 6, amp = 26;
      if (k > 0) s += ln([40, base - 56], [760, base - 56], "cv-road", 2);
      s += `<text class="cv-label" x="40" y="${base + 5}">${lab}</text>`;
      const pts = [];
      for (let i = 0; i <= 140; i++) {
        const x = 200 + i * 4, t = i / 140;
        let v;
        if (k === 0) v = Math.sign(Math.sin(t * 14 + ph)) * 0.6 + Math.sin(t * 40) * 0.12;
        else if (k === 1) v = Math.sin(t * 90 + ph) * Math.max(0, Math.sin(t * 9 + ph)) * 1.1;
        else if (k === 2) { const c = (t * 7 + ph) % 1; v = c < 0.06 ? -1.2 : c < 0.1 ? 0.9 : Math.sin(t * 6) * 0.15; }
        else v = Math.sin(t * 5 + ph) * 0.8 + Math.sin(t * 17) * 0.15;
        pts.push(f1(x) + "," + f1(base - v * amp));
      }
      s += `<polyline class="cv-w${k + 1}" points="${pts.join(" ")}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>`;
    });
    return s + "</svg>";
  }

  function coverAttention(seed) {
    const r = seeded(seed);
    const tokens = ["the", "claim", "was", "never", "confirmed", "by", "any", "official", "source"];
    const widths = tokens.map(t => t.length * 11 + 26);
    const total = widths.reduce((a, b) => a + b, 0) + 10 * (tokens.length - 1);
    const scale = Math.min(1, 720 / total);
    let x = (800 - total * scale) / 2, s = svgOpen();
    s += '<text class="cv-label" x="40" y="56">ATTENTION WEIGHTS</text>';
    const weights = tokens.map(() => 0.15 + r() * 0.5);
    [1, 3, 7].forEach(i => { weights[i] = 0.8 + r() * 0.2; });
    tokens.forEach((t, i) => {
      const w = widths[i] * scale, hi = weights[i] > 0.75, bh = weights[i] * 250;
      s += `<rect class="${hi ? "cv-bar-hi" : "cv-bar"}" x="${f1(x + w * 0.2)}" y="${f1(360 - bh)}" width="${f1(w * 0.6)}" height="${f1(bh)}" rx="4"/>`;
      s += `<rect class="${hi ? "cv-token-hi" : "cv-token"}" x="${f1(x)}" y="380" width="${f1(w)}" height="46" rx="10" stroke-width="2"/>`;
      s += `<text class="cv-token-t" x="${f1(x + w / 2)}" y="409" text-anchor="middle">${t}</text>`;
      x += w + 10 * scale;
    });
    return s + "</svg>";
  }

  function cover(kind, seed) {
    switch (kind) {
      case "network": return coverNetwork(seed);
      case "dispatch": return coverDispatch(seed);
      case "agent": return coverAgent(seed);
      case "facade": return coverFacade(seed);
      case "signals": return coverSignals(seed);
      case "attention": return coverAttention(seed);
      default: return svgOpen() + "</svg>";
    }
  }
  SITE.cover = cover;

  /* ------------------------------------------------------------------ */
  /* Content blocks                                                      */
  /* ------------------------------------------------------------------ */
  function demoShell(b) {
    const head = `<div class="demo-head"><div><p class="demo-tag">Interactive demo</p><p class="demo-title">${b.title}</p></div>`;
    const legend = '<ul class="legend" aria-label="Legend"><li><i class="sw sw-free"></i>Free flow</li><li><i class="sw sw-slow"></i>Slow</li><li><i class="sw sw-jam"></i>Congested</li></ul>';
    const note = `<p class="demo-note">${b.note}</p>`;
    if (b.kind === "route") {
      return `<div class="demo" data-demo="route">${head}${legend}</div>
        <div class="demo-body">
          <div class="demo-canvas"><canvas role="img" aria-label="Interactive road network. Click two intersections to set a trip from A to B; each road is colored by its current travel time."></canvas></div>
          <div class="demo-side">
            <div class="demo-readout">
              <div><span class="mf-label">Trip ETA</span><span class="mf-value" data-rn="eta">–</span></div>
              <div><span class="mf-label">Segments</span><span class="mf-value" data-rn="links">–</span></div>
            </div>
            <label class="range-field" for="rn-hour"><span class="mf-label"><span>Time of day</span><output data-rn="clock">08:30</output></span>
              <input id="rn-hour" type="range" min="0" max="23.75" step="0.25" value="8.5" data-rn="hour"></label>
            <div class="demo-btns">
              <button class="chip-btn" type="button" data-rn="random">New random trip</button>
              <button class="chip-btn" type="button" data-rn="rush">Morning rush</button>
              <button class="chip-btn" type="button" data-rn="night">Late night</button>
            </div>
            <div><p class="mf-label">Travel time by segment</p><ol class="seg-list" data-rn="segs"></ol></div>
          </div>
        </div>${note}</div>`;
    }
    if (b.kind === "dispatch") {
      return `<div class="demo" data-demo="dispatch">${head}<ul class="legend" aria-label="Legend"><li><i class="sw sw-slow"></i>Busy taxi</li><li><i class="sw" style="background:var(--band-muted)"></i>Idle taxi</li><li><i class="sw" style="background:var(--band-ink)"></i>Passenger</li></ul></div>
        <div class="demo-body">
          <div class="demo-canvas"><canvas role="img" aria-label="Taxi dispatch simulation on a city grid. Taxis move to waiting passengers each simulated minute."></canvas></div>
          <div class="demo-side">
            <div class="ds-stats">
              <div><span class="mf-label">Sim clock</span><span class="mf-value" data-ds="clock">07:00</span></div>
              <div><span class="mf-label">Waiting now</span><span class="mf-value" data-ds="waiting">0</span></div>
              <div><span class="mf-label">Avg wait</span><span class="mf-value" data-ds="avg">–</span></div>
              <div><span class="mf-label">Fleet busy</span><span class="mf-value" data-ds="busy">0%</span></div>
              <div><span class="mf-label">Served</span><span class="mf-value" data-ds="served">0</span></div>
              <div><span class="mf-label">Gave up</span><span class="mf-value" data-ds="gaveup">0</span></div>
            </div>
            <label class="range-field" for="ds-fleet"><span class="mf-label"><span>Fleet size</span><output data-ds="fleet-out">20 taxis</output></span>
              <input id="ds-fleet" type="range" min="4" max="60" step="1" value="20" data-ds="fleet"></label>
            <div><p class="mf-label" id="ds-demand-label">Demand</p>
              <div class="seg-ctrl" role="group" aria-labelledby="ds-demand-label">
                <button class="chip-btn" type="button" data-demand="1.2" aria-pressed="false">Quiet</button>
                <button class="chip-btn" type="button" data-demand="2.4" aria-pressed="true">Normal</button>
                <button class="chip-btn" type="button" data-demand="4.2" aria-pressed="false">Rush</button>
              </div></div>
            <div class="demo-btns">
              <button class="chip-btn" type="button" data-ds="play">Pause</button>
              <button class="chip-btn" type="button" data-ds="reset">Reset</button>
            </div>
          </div>
        </div>${note}</div>`;
    }
    if (b.kind === "checker") {
      const examples = [
        "Simulate 800 taxis in the morning rush with LinkETA travel times",
        "Run 2,000 taxis for 6 hours and compare greedy and optimized dispatch",
        "Add 50 electric buses and simulate charging",
        "Simulate taxis during a snowstorm tonight",
        "Run 300 taxis for 3 days"
      ];
      return `<div class="demo" data-demo="checker">${head}</div>
        <div class="demo-body demo-checker">
          <div class="demo-side">
            <label class="mf-label" for="t2s-input">Describe a scenario</label>
            <div class="t2s-row"><input id="t2s-input" type="text" autocomplete="off" spellcheck="false" value="${esc(examples[0])}"><button class="btn btn-amber" type="button" data-t2s="run">Check</button></div>
            <p class="mf-label">Or try one</p>
            <div class="t2s-examples">${examples.map(e => `<button class="chip-btn" type="button" data-t2s-example="${esc(e)}">${esc(e)}</button>`).join("")}</div>
            <ol class="t2s-steps" aria-label="Pipeline steps">
              <li data-step="read">Read the request</li>
              <li data-step="config">Build the configuration</li>
              <li data-step="verify">Verify against capabilities</li>
              <li data-step="result">Run or refuse</li>
            </ol>
          </div>
          <div class="demo-side">
            <p class="mf-label">Configuration</p>
            <pre class="t2s-config" data-t2s="config">{ }</pre>
            <div class="verdict" data-t2s="verdict" role="status" aria-live="polite"></div>
          </div>
        </div>${note}</div>`;
    }
    return "";
  }

  function linkCard(l) {
    const inner = `<span class="kicker">${l.kicker}</span><span class="link-card-title">${l.title}</span>${l.text ? `<span class="link-card-text">${l.text}</span>` : ""}`;
    if (l.href) return `<a class="link-card rv" href="${esc(l.href)}" target="_blank" rel="noopener">${inner}<span class="link-card-arr" aria-hidden="true">↗</span></a>`;
    if (l.view) return `<a class="link-card rv" href="#${l.view}">${inner}<span class="link-card-arr" aria-hidden="true">→</span></a>`;
    return `<div class="link-card rv">${inner}</div>`;
  }

  function block(b) {
    switch (b.t) {
      case "p": return `<p>${b.text}</p>`;
      case "h3": return `<h3 class="blk-h3">${b.text}</h3>`;
      case "quote": return `<blockquote class="pull rv"><p>${b.text}</p>${b.cite ? `<cite>${b.cite}</cite>` : ""}</blockquote>`;
      case "list": {
        const tag = b.ordered ? "ol" : "ul";
        return `<${tag} class="blk-list">${b.items.map(it => typeof it === "string" ? `<li>${it}</li>` : `<li><strong>${it.title}.</strong> ${it.text}</li>`).join("")}</${tag}>`;
      }
      case "flow": return `<div class="flow rv" role="list" aria-label="${esc(b.label || "Steps")}">${b.steps.map((s, i) => `<div class="flow-step" role="listitem" style="--i:${i}"><span class="n">${pad2(i + 1)}</span><h4>${s.title}</h4><p>${s.text}</p></div>`).join("")}</div>`;
      case "stats": return `<div class="stat-grid">${b.items.map(s => `<div class="stat-tile rv"><span class="stat-tile-value" data-count>${s.value}</span><span class="stat-tile-label">${s.label}</span></div>`).join("")}</div>`;
      case "bars": {
        const ticks = (b.ticks || []).map(t => `<span style="left:${(t / b.max * 100).toFixed(2)}%">${t}${b.unit}</span>`).join("");
        return `<figure class="bars rv"><figcaption class="bars-title">${b.title}</figcaption>${b.items.map(it => `<div class="bar-row"><span class="bar-label">${it.label}</span><span class="bar-track"><span class="bar-fill" style="width:${(it.value / b.max * 100).toFixed(2)}%"></span></span><span class="bar-value">${it.value}${b.unit}</span></div>`).join("")}<div class="bar-axis" aria-hidden="true"><span></span><span class="bar-ticks">${ticks}</span><span></span></div>${b.note ? `<p class="bars-note">${b.note}</p>` : ""}</figure>`;
      }
      case "cards": return `<div class="info-cards">${b.items.map(c => `<div class="info-card rv">${c.kicker ? `<p class="kicker">${c.kicker}</p>` : ""}<h4>${c.title}</h4><p>${c.text}</p></div>`).join("")}</div>`;
      case "callout": return `<aside class="callout rv"><p class="callout-title">${b.title}</p><p>${b.text}</p></aside>`;
      case "links": return `<div class="link-cards">${b.items.map(linkCard).join("")}</div>`;
      case "demo": return demoShell(b);
      default: return "";
    }
  }
  const blocks = list => list.map(block).join("");

  function sectionIndex(sections, label) {
    return `<nav class="cs-index" aria-label="${label}"><p class="kicker">${label}</p><ol>${sections.map((s, k) => `<li><button type="button" data-goto="sec-${s.id}"><span class="num">${pad2(k + 1)}</span><span>${s.title}</span></button></li>`).join("")}</ol></nav>`;
  }
  function sectionsHTML(sections) {
    return sections.map((s, k) => `<section class="cs-section" id="sec-${s.id}" data-sec aria-labelledby="h-${s.id}"><p class="sec-kicker">${pad2(k + 1)} / ${s.id.replace(/-/g, " ")}</p><h2 class="display" id="h-${s.id}">${s.title}</h2>${blocks(s.blocks)}</section>`).join("");
  }

  /* ------------------------------------------------------------------ */
  /* Shared cards                                                        */
  /* ------------------------------------------------------------------ */
  function workRow(p) {
    const i = SITE.projects.indexOf(p);
    return `<a class="work-row rv" href="#${p.id}" data-type="${p.type}" data-id="${p.id}">
      <span class="work-idx">${pad2(i + 1)}</span>
      <span class="work-cover">${cover(p.cover, p.seed)}</span>
      <span class="work-body">
        <span class="work-meta"><span>${p.type}</span><span>${p.tagline}</span><span>${p.years}</span></span>
        <h3 class="work-title">${p.title}</h3>
        <span class="work-hook">${p.hook}</span>
        <span class="work-foot"><span class="work-metric"><strong>${p.metric.value}</strong><small>${p.metric.label}</small></span><span class="work-cta">${p.role} · Case study ${ARR}</span></span>
      </span>
    </a>`;
  }
  function miniCard(p) {
    return `<a class="mini-card rv" href="#${p.id}"><span class="work-cover">${cover(p.cover, p.seed)}</span><span class="work-meta"><span>${p.type}</span><span>${p.years}</span></span><span class="mini-card-title">${p.title}</span></a>`;
  }
  function noteCard(n) {
    const i = SITE.notes.indexOf(n);
    return `<a class="note-card rv" href="#${n.id}">
      <span class="note-card-top"><span class="kicker">Note ${pad2(i + 1)}</span><span class="note-time">${readMins(n)} min read</span></span>
      <h3>${n.title}</h3>
      <p>${n.dek}</p>
      <span class="tag-row">${n.tags.map(t => `<span>${t}</span>`).join("")}</span>
      <span class="note-card-cta">Read the note ${ARR}</span>
    </a>`;
  }

  /* ------------------------------------------------------------------ */
  /* Views                                                               */
  /* ------------------------------------------------------------------ */
  V.home = function () {
    const P = SITE.person;
    const featured = SITE.projects.filter(p => p.featured);
    const toolkit = SITE.toolkit.map(t => `<span>${t}</span>`).join("");
    return `
<div class="hero-shell" data-learn-hero><canvas class="learn-field" aria-hidden="true"></canvas>
<section class="wrap hero" aria-labelledby="hero-title">
  <p class="kicker dash">Machine learning · Urban mobility · Research</p>
  <p class="learn-steps" aria-hidden="true"><span data-learn-step>GPS pings</span><i>→</i><span data-learn-step>Roads</span><i>→</i><span data-learn-step>Travel times</span></p>
  <h1 class="display hero-title lines" id="hero-title" tabindex="-1">${lines(["Predicting how", "cities move,", "<em>one road</em>", "at a time."])}</h1>
  <div class="hero-grid">
    <div class="hero-intro">
      <p class="lede">I'm ${P.name}, a machine learning researcher in Waterloo, Ontario. I build travel-time models, digital twins and LLM agents for urban mobility.</p>
      <dl class="now-list">
        <div><dt>Now</dt><dd>Research Assistant, SPIN Lab, Wilfrid Laurier University</dd></div>
        <div><dt>Degree</dt><dd>Master of Applied Computing, 2026, with the Award for Outstanding Graduate Work</dd></div>
        <div><dt>Before</dt><dd>IT Consultant, Glazingshopee, Mumbai</dd></div>
      </dl>
      <div class="actions"><a class="btn btn-primary" href="#work">See the work ${ARR}</a><a class="btn" href="#thinking">How I think ${ARR}</a></div>
      <p class="learn-credit">Background: streets of San Francisco, © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors</p>
    </div>
    <figure class="map-card" data-map="hero">
      <div class="map-head"><span class="map-live"><span class="live-dot"></span>Live demo network</span>
        <ul class="legend" aria-label="Legend"><li><i class="sw sw-free"></i>Free flow</li><li><i class="sw sw-slow"></i>Slow</li><li><i class="sw sw-jam"></i>Congested</li></ul></div>
      <div class="map-cities" role="group" aria-label="Choose a city">${[["sf", "San Francisco"], ["porto", "Porto"], ["chengdu", "Chengdu"], ["shanghai", "Shanghai"], ["annarbor", "Ann Arbor"], ["daegu", "Daegu"]].map(([k, n], i) => `<button class="chip-btn" type="button" data-city="${k}" aria-pressed="${i === 0}">${n}</button>`).join("")}</div>
      <div class="map-canvas"><canvas role="img" aria-label="Animated road network. Roads change color with traffic through the day, and the fastest route from A to B is highlighted. Click two intersections to set a new trip."></canvas></div>
      <div class="map-foot">
        <div><span class="mf-label">Clock</span><span class="mf-value" data-rn="clock">07:30</span></div>
        <div><span class="mf-label">ETA A → B</span><span class="mf-value" data-rn="eta">–</span></div>
        <div><span class="mf-label">Segments</span><span class="mf-value" data-rn="links">–</span></div>
      </div>
      <figcaption class="map-hint">Click any two intersections to plan a trip. The clock runs through a full day, so you can watch rush hour build and clear. Synthetic network, for illustration.</figcaption>
    </figure>
  </div>
</section>
</div>

<section class="band stats-band" aria-label="Highlights">
  <div class="wrap stats-grid">${SITE.stats.map(s => `<a class="stat rv" href="#${s.view}"><span class="stat-value" data-count>${s.value}</span><span class="stat-label">${s.label}</span></a>`).join("")}</div>
</section>

<div class="marquee" aria-hidden="true"><div class="marquee-track">${toolkit}${toolkit}</div></div>

<section class="wrap section" aria-labelledby="sel-title">
  <div class="section-head">
    <div><p class="kicker dash">Selected work</p><h2 class="display section-title" id="sel-title">Research that ends<br>in working systems.</h2></div>
    <a class="more-link" href="#work">All ${SITE.projects.length} projects ${ARR}</a>
  </div>
  <div class="work-list">${featured.map(workRow).join("")}</div>
</section>

<section class="wrap section" aria-labelledby="think-title">
  <div class="think-grid">
    <div class="think-intro">
      <p class="kicker dash">Thinking</p>
      <h2 class="display section-title" id="think-title">How I do research.</h2>
      <p class="section-lede">Five rules I work by, each backed by a result from a real project. Then notes that go deeper.</p>
      <a class="more-link" href="#thinking">Read the method ${ARR}</a>
    </div>
    <ol class="steps-mini">${SITE.process.map((s, k) => `<li><a href="#thinking" data-step-link="${k}"><span class="n">${pad2(k + 1)}</span><span class="t">${s.title}</span>${ARR}</a></li>`).join("")}</ol>
  </div>
  <div class="note-cards home-notes">${SITE.notes.slice(0, 2).map(noteCard).join("")}</div>
</section>
<div class="section"></div>`;
  };

  V.work = function () {
    const types = ["All"].concat([...new Set(SITE.projects.map(p => p.type))]);
    const count = t => t === "All" ? SITE.projects.length : SITE.projects.filter(p => p.type === t).length;
    return `
<section class="wrap page-hero" aria-labelledby="work-title">
  <p class="kicker dash">Work</p>
  <h1 class="display page-title lines" id="work-title" tabindex="-1">${lines(["Six projects.", "Research, systems", "and product."])}</h1>
  <p class="page-lede">From a graph model of city traffic to a quotation tool for glass façades. Each project opens a case study with the problem, the method, and the results.</p>
</section>
<section class="wrap" aria-label="Project list">
  <div class="filters" role="group" aria-label="Filter projects">${types.map(t => `<button class="filter" type="button" data-filter="${t}" aria-pressed="${t === "All"}">${t}<span class="count">${count(t)}</span></button>`).join("")}</div>
  <p class="filter-status" data-filter-status aria-live="polite">Showing all ${SITE.projects.length} projects</p>
  <div class="work-list">${SITE.projects.map(workRow).join("")}</div>
</section>
<div class="section"></div>`;
  };

  V.project = function (p) {
    const i = SITE.projects.indexOf(p), n = SITE.projects.length;
    const prev = SITE.projects[(i - 1 + n) % n], next = SITE.projects[(i + 1) % n];
    const related = (p.related || []).map(id => SITE.projects.find(x => x.id === id)).filter(Boolean);
    return `
<article data-article>
  <header class="wrap cs-hero">
    <a class="back-link" href="#work"><span aria-hidden="true">←</span> All work</a>
    <p class="kicker dash">${pad2(i + 1)} · ${p.type} · ${p.tagline}</p>
    <h1 class="display cs-title lines" tabindex="-1">${lines(p.titleLines || [p.title])}</h1>
    <p class="cs-thesis">${p.thesis}</p>
    <dl class="cs-meta">
      <div><dt>Role</dt><dd>${p.role}</dd></div>
      <div><dt>Where</dt><dd>${p.org}</dd></div>
      <div><dt>When</dt><dd>${p.when}</dd></div>
      <div><dt>Methods and tools</dt><dd>${p.tools.join(", ")}</dd></div>
    </dl>
  </header>
  <div class="wrap"><div class="cs-cover">${cover(p.cover, p.seed + 101)}</div></div>
  <section class="band cs-outcomes" aria-label="Outcomes">
    <div class="wrap"><p class="kicker dash">Outcomes</p><div class="stats-grid">${p.outcomes.map(o => `<div class="stat rv"><span class="stat-value" data-count>${o.value}</span><span class="stat-label">${o.label}</span></div>`).join("")}</div></div>
  </section>
  <div class="wrap cs-layout">
    ${sectionIndex(p.sections, "On this page")}
    <div class="cs-body">
      ${sectionsHTML(p.sections)}
      ${p.glossary ? `<details class="glossary rv"><summary><span><span class="kicker">Deeper</span><span class="glossary-title">Terms used on this page</span></span><span class="plus" aria-hidden="true"></span></summary><dl>${p.glossary.map(t => `<div><dt>${t.term}</dt><dd>${t.def}</dd></div>`).join("")}</dl></details>` : ""}
    </div>
  </div>
  <nav class="wrap pager" aria-label="More projects">
    <a href="#${prev.id}"><span class="pager-dir">← Previous</span><span class="pager-name">${prev.title}</span></a>
    <a class="next" href="#${next.id}"><span class="pager-dir">Next →</span><span class="pager-name">${next.title}</span></a>
  </nav>
  <section class="wrap related" aria-labelledby="related-title">
    <div class="section-head"><div><p class="kicker dash">Keep reading</p><h2 class="display section-title" id="related-title">Related work.</h2></div></div>
    <div class="related-grid">${related.map(miniCard).join("")}</div>
  </section>
</article>`;
  };

  V.thinking = function () {
    const steps = SITE.process;
    return `
<section class="wrap page-hero" aria-labelledby="thinking-title">
  <p class="kicker dash">Thinking</p>
  <h1 class="display page-title lines" id="thinking-title" tabindex="-1">${lines(["How I do", "research, and", "what it taught me."])}</h1>
  <p class="page-lede">First, the method: five rules I work by, each backed by a result from a real project. Then research notes that go deeper into individual findings.</p>
  <div class="jump-row"><button class="btn" type="button" data-goto="process">The method ${DOWN}</button><button class="btn" type="button" data-goto="notes">Research notes ${DOWN}</button></div>
</section>

<section class="wrap" id="process" aria-labelledby="process-title" style="scroll-margin-top:90px">
  <h2 class="visually-hidden" id="process-title">The method</h2>
  <div class="process">
    <aside class="process-aside" aria-label="Method steps">
      <div class="big-num-wrap" aria-hidden="true"><span class="big-num" data-bignum>01</span><span class="big-of">/ ${pad2(steps.length)}</span></div>
      <ol class="process-mini">${steps.map((s, k) => `<li><button type="button" data-goto="step-${k}" data-mini="${k}"${k === 0 ? ' class="active"' : ""}>${s.title}</button></li>`).join("")}</ol>
    </aside>
    <div class="process-steps">${steps.map((s, k) => `
      <article class="process-step" id="step-${k}" data-step="${k}" aria-labelledby="step-title-${k}">
        <p class="step-num" aria-hidden="true">${pad2(k + 1)}</p>
        <p class="kicker">Step ${pad2(k + 1)}</p>
        <h3 class="display step-title" id="step-title-${k}">${s.title}</h3>
        <p class="step-rule">${s.rule}</p>
        <div class="step-proof rv">
          <div class="proof-head"><span class="mf-label">Evidence · ${s.project}</span></div>
          <span class="proof-value" data-count>${s.value}</span>
          <p class="proof-text">${s.proof}</p>
          <a href="#${s.link}">${s.linkLabel} ${ARR}</a>
        </div>
      </article>`).join("")}
    </div>
  </div>
</section>

<section class="wrap section" id="notes" aria-labelledby="notes-title" style="scroll-margin-top:90px">
  <div class="section-head"><div><p class="kicker dash">Research notes</p><h2 class="display section-title" id="notes-title">Notes from the work.</h2></div>
    <p class="section-lede">Short essays on single ideas from my projects, written for readers outside the field.</p></div>
  <div class="note-cards">${SITE.notes.map(noteCard).join("")}</div>
</section>
<div class="section"></div>`;
  };

  V.note = function (n) {
    const i = SITE.notes.indexOf(n), count = SITE.notes.length;
    const prev = SITE.notes[(i - 1 + count) % count], next = SITE.notes[(i + 1) % count];
    const p = SITE.projects.find(x => x.id === n.project);
    return `
<article data-article>
  <header class="wrap note-hero">
    <a class="back-link" href="#thinking"><span aria-hidden="true">←</span> Thinking</a>
    <p class="kicker dash">Note ${pad2(i + 1)} · ${readMins(n)} min read</p>
    <h1 class="display note-title lines" tabindex="-1">${lines(n.titleLines || [n.title])}</h1>
    <p class="note-dek">${n.dek}</p>
    <ul class="tag-row" aria-label="Topics">${n.tags.map(t => `<li>${t}</li>`).join("")}</ul>
  </header>
  <div class="wrap note-layout">
    ${sectionIndex(n.sections, "In this note")}
    <div class="prose">${sectionsHTML(n.sections)}</div>
  </div>
  ${p ? `<div class="wrap from-project"><a href="#${p.id}" class="rv"><span class="work-cover">${cover(p.cover, p.seed)}</span><span class="from-project-body"><span class="kicker">From the project</span><span class="mini-card-title">${p.title}</span><span class="work-hook">${p.hook}</span><span class="work-cta">Read the case study ${ARR}</span></span></a></div>` : ""}
  <nav class="wrap pager" aria-label="More notes">
    <a href="#${prev.id}"><span class="pager-dir">← Previous note</span><span class="pager-name">${prev.title}</span></a>
    <a class="next" href="#${next.id}"><span class="pager-dir">Next note →</span><span class="pager-name">${next.title}</span></a>
  </nav>
  <div class="section" style="padding-top:clamp(40px,6vw,80px)"></div>
</article>`;
  };

  V.about = function () {
    const P = SITE.person;
    return `
<section class="wrap page-hero" aria-labelledby="about-title">
  <p class="kicker dash">About</p>
  <h1 class="display page-title lines" id="about-title" tabindex="-1">${lines(["From raw data", "to working", "systems."])}</h1>
</section>
<section class="wrap about-intro" aria-label="Biography">
  <div class="about-bio">${SITE.bio.map(t => `<p>${t}</p>`).join("")}</div>
  <aside class="band-card" aria-label="At a glance">
    <p class="kicker">At a glance</p>
    <dl>
      <div><dt>Based in</dt><dd>${P.location}<br><span class="mono-sm">${P.coords}</span></dd></div>
      <div><dt>Now</dt><dd>Research Assistant, SPIN Lab, Wilfrid Laurier University</dd></div>
      <div><dt>Focus</dt><dd>Travel-time estimation, digital twins, LLM agents</dd></div>
      <div><dt>Open to</dt><dd>Machine learning and research roles in Canada</dd></div>
    </dl>
    <a class="btn btn-amber" href="#contact">Get in touch ${ARR}</a>
  </aside>
</section>

<section class="wrap about-block" aria-labelledby="path-title">
  <div class="section-head"><div><p class="kicker dash">Path</p><h2 class="display section-title" id="path-title">Experience and education.</h2></div></div>
  <div class="timeline-wrap"><span class="timeline-progress" aria-hidden="true"></span>
    <ol class="timeline">${SITE.timeline.map(t => `<li class="tl-item"><span class="tl-when">${t.when}</span><div class="tl-main"><p class="tl-type">${t.type}</p><h3 class="tl-role">${t.role}</h3><p class="tl-org">${t.org}</p><p>${t.text}</p></div></li>`).join("")}</ol>
  </div>
</section>

<section class="wrap about-block" aria-labelledby="awards-title">
  <div class="section-head"><div><p class="kicker dash">Recognition</p><h2 class="display section-title" id="awards-title">Awards and funding.</h2></div></div>
  <div class="awards">${SITE.awards.map(a => `<div class="award rv"><span class="award-value" data-count>${a.value}</span><div><p class="award-title">${a.title}</p><p class="award-text">${a.text}</p></div></div>`).join("")}</div>
</section>

<section class="wrap about-block" aria-labelledby="pubs-title">
  <div class="section-head"><div><p class="kicker dash">Publications</p><h2 class="display section-title" id="pubs-title">Papers and thesis.</h2></div></div>
  <ul class="pubs">${SITE.publications.map(p => `<li class="rv">${p.href ? `<a class="pub-title" href="${esc(p.href)}" target="_blank" rel="noopener">${p.title} ${EXT}</a>` : `<span class="pub-title">${p.title}</span>`}<span class="pub-meta">${p.meta}</span></li>`).join("")}</ul>
</section>

<section class="wrap about-block" aria-labelledby="skills-title">
  <div class="section-head"><div><p class="kicker dash">Capabilities</p><h2 class="display section-title" id="skills-title">Toolkit.</h2></div></div>
  <div class="skills">${SITE.skills.map(s => `<div class="skill-group rv"><h3>${s.group}</h3><ul class="chips">${s.items.map(x => `<li>${x}</li>`).join("")}</ul></div>`).join("")}</div>
</section>`;
  };

  V.contact = function () {
    const P = SITE.person;
    return `
<section class="wrap page-hero" aria-labelledby="contact-title">
  <p class="kicker dash">Contact</p>
  <h1 class="display page-title contact-title lines" id="contact-title" tabindex="-1">${lines(["Let's talk."])}</h1>
  <p class="page-lede">${P.status} Email is the fastest way to reach me.</p>
  <div class="big-email"><span class="big-email-text">${P.email}</span><button class="btn btn-primary" type="button" data-copy="${P.email}">Copy email</button><a class="btn" href="mailto:${P.email}">Open mail app</a></div>
</section>
<section class="wrap contact-grid" aria-label="Elsewhere">
  <a class="contact-card rv" href="${esc(P.linkedin)}" target="_blank" rel="noopener"><span class="kicker">LinkedIn</span><span class="contact-card-title">${P.linkedinLabel}</span>${EXT}</a>
  <a class="contact-card rv" href="${esc(P.github)}" target="_blank" rel="noopener"><span class="kicker">GitHub</span><span class="contact-card-title">${P.githubLabel}</span>${EXT}</a>
  <div class="contact-card rv"><span class="kicker">Based in</span><span class="contact-card-title">${P.location}</span><span class="mono-sm">${P.coords}</span></div>
</section>
<section class="wrap section reasons" aria-labelledby="reasons-title">
  <div class="section-head"><div><p class="kicker dash">Good reasons to write</p><h2 class="display section-title" id="reasons-title">What I'm open to.</h2></div></div>
  <div class="info-cards">
    <div class="info-card rv"><p class="kicker">Roles</p><h4>Machine learning and research</h4><p>Full-time roles in Canada where models have to work in real systems.</p></div>
    <div class="info-card rv"><p class="kicker">Collaboration</p><h4>Mobility research</h4><p>Travel-time estimation, digital twins for urban mobility, and LLM agents for simulation.</p></div>
    <div class="info-card rv"><p class="kicker">Questions</p><h4>About the work</h4><p>Any project or note on this site. I'm happy to explain the details.</p></div>
  </div>
</section>`;
  };

  /* ------------------------------------------------------------------ */
  /* Poems and Photography: calm pages, serif titles, no dot grid        */
  /* ------------------------------------------------------------------ */
  const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
  const LINK_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>';
  const CAMERA = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>';
  const ICON = d => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const TONES = ["#1F3349", "#2A4560", "#344F6B", "#3B4D61", "#22384F", "#4A5868", "#30465E", "#2B3A4A", "#3E5A78"];

  function appreciateBtn(id) {
    return `<button class="appreciate" type="button" data-appreciate="${esc(id)}" aria-pressed="false">${HEART}<span data-appreciate-label>Appreciate</span></button>`;
  }

  const poemLineCount = p => p.stanzas.join("\n").split("\n").length;
  function poemMeta(p) {
    const s = p.stanzas.length;
    return `${poemLineCount(p)} lines · ${s} ${s === 1 ? "stanza" : "stanzas"}`;
  }

  V.poems = function () {
    const P = SITE.poems, page = SITE.poemsPage;
    const f = P.find(p => p.featured) || P[0];
    const excerpt = f.stanzas[0].split("\n").slice(0, 4).join("\n");
    return `
<section class="wrap page-hero calm-hero" aria-labelledby="poems-title">
  <p class="kicker dash">${page.kicker}</p>
  <h1 class="serif-title lines" id="poems-title" tabindex="-1">${lines([page.title])}</h1>
  ${page.lede ? `<p class="calm-lede">${page.lede}</p>` : ""}
</section>
<section class="wrap" aria-label="Featured poem">
  <div class="poem-feature rv">
    <div class="poem-feature-body">
      <p class="kicker">Featured · ${esc(f.title)}</p>
      <blockquote class="poem-feature-text">${esc(excerpt)}</blockquote>
    </div>
    <a class="btn calm-btn" href="#${f.id}">Read the poem ${ARR}</a>
  </div>
</section>
<section class="wrap calm-section" aria-labelledby="all-poems-title">
  <div class="list-head"><h2 id="all-poems-title">All poems</h2><p class="mono-sm">${P.length} poems</p></div>
  <ol class="poem-list">${P.map((p, i) => {
    // Skip the first-line preview when the title already is the first line (untitled poems).
    const first = p.stanzas[0].split("\n")[0];
    const showFirst = !first.toLowerCase().startsWith(p.title.toLowerCase());
    return `<li class="rv"><a class="poem-row" href="#${p.id}"><span class="poem-num">${pad2(i + 1)}</span><span class="poem-row-main"><span class="poem-row-title">${esc(p.title)}</span>${showFirst ? `<span class="poem-row-first">${esc(first)}</span>` : ""}</span><span class="poem-row-meta">${poemLineCount(p)} lines</span></a></li>`;
  }).join("")}</ol>
  <p class="rights-note">Poems © 2026 Mubarak Shikalgar, except lines credited to other authors. All rights reserved. Please don't reuse or reproduce them without permission.</p>
</section>
<div class="calm-end"></div>`;
  };

  V.poem = function (p) {
    const P = SITE.poems, i = P.indexOf(p), n = P.length;
    // Wrap around only with 3+ poems; with 2, "previous" and "next" would be the same poem.
    const prev = n > 2 || i > 0 ? P[(i - 1 + n) % n] : null;
    const next = n > 2 || i < n - 1 ? P[(i + 1) % n] : null;
    const pager = prev || next ? `<nav class="poem-pager" aria-label="More poems">
    ${prev ? `<a href="#${prev.id}"><span class="pager-dir">Previous poem</span><span class="poem-pager-name">${esc(prev.title)}</span></a>` : ""}
    ${next ? `<a class="next" href="#${next.id}"><span class="pager-dir">Next poem</span><span class="poem-pager-name">${esc(next.title)}</span></a>` : ""}
  </nav>` : "";
    return `
<article class="wrap poem-page" aria-labelledby="poem-title">
  <a class="back-link" href="#poems"><span aria-hidden="true">←</span> All poems</a>
  <div class="poem-col">
    <p class="kicker poem-kicker">Poem ${pad2(i + 1)} of ${pad2(n)}</p>
    <h1 class="serif-title poem-title" id="poem-title" tabindex="-1">${esc(p.title)}</h1>
    <p class="poem-meta">${poemMeta(p)}</p>
    ${p.sample ? `<p class="poem-sample">Sample poem by ${esc(p.sample)}, public domain.</p>` : ""}
    ${p.credit ? `<p class="poem-sample">${esc(p.credit)}</p>` : ""}
    <span class="poem-rule" aria-hidden="true"></span>
    <div class="poem-text">${p.stanzas.map(s => `<p>${esc(s)}</p>`).join("")}</div>
    <div class="poem-actions">${appreciateBtn(p.id)}<button class="appreciate" type="button" data-copy-link>${LINK_ICON}<span>Copy link</span></button></div>
    <p class="rights-note">© 2026 Mubarak Shikalgar${p.credit ? ", except lines credited to other authors" : ""}. All rights reserved.</p>
  </div>
  ${pager}
</article>`;
  };

  // Placeholder frames (no src) show [bracket] prompts; real photos show only the details filled in.
  const photoTitle = ph => ph.title || (ph.src ? "" : "[Photo title]");
  const photoMeta = ph => ph.src ? [ph.place, ph.year].filter(Boolean).join(" · ") : `${ph.place || "[Place]"} · ${ph.year || "[Year]"}`;
  const photoAspect = ph => { const [a, b] = String(ph.ratio || "1 / 1").split("/").map(parseFloat); return a && b ? a / b : 1; };
  // Grid tiles let the browser pick the small copy (thumb) or the full one; the viewer (full) always loads the full one.
  const TILE_SIZES = "(max-width: 560px) 60vw, (max-width: 1100px) 35vw, 340px";
  function photoFrame(ph, i, eager, full) {
    if (ph.src) {
      const alt = ` alt="${esc(ph.alt || ph.title || "")}"`, lazy = eager ? "" : ' loading="lazy"';
      if (!full && ph.thumb && ph.tw && ph.w) {
        return `<img src="${esc(ph.thumb)}" srcset="${esc(ph.thumb)} ${ph.tw}w, ${esc(ph.src)} ${ph.w}w" sizes="${TILE_SIZES}"${alt}${lazy} decoding="async">`;
      }
      return `<img src="${esc(ph.src)}"${alt}${lazy} decoding="async">`;
    }
    return `<span class="ph-placeholder" style="background:${TONES[i % TONES.length]}">${CAMERA}<span>Photo ${pad2(i + 1)}</span></span>`;
  }
  SITE.photoView = { frame: photoFrame, title: photoTitle, meta: photoMeta };

  function photoTile(ph, i) {
    const ratio = ph.ratio ? ` style="aspect-ratio:${esc(ph.ratio)}"` : "";
    const name = ph.title || `photo ${i + 1}`;
    const t = photoTitle(ph), m = photoMeta(ph);
    const cap = t || m ? `<span class="ph-cap">${t ? `<span class="ph-title">${esc(t)}</span>` : ""}${m ? `<span class="ph-meta">${esc(m)}</span>` : ""}</span>` : "";
    // The caption sits on the photo itself (bottom, over a soft fade), so tiles pack tightly like a collage.
    // data-ar (width / height) lets the grid size each tile (setupMasonry in app.js).
    return `<li class="ph-item" data-ar="${photoAspect(ph).toFixed(4)}"><button class="ph-card rv" type="button" data-photo="${i}" aria-label="Open ${esc(name)}"><span class="ph-frame"${ratio}>${photoFrame(ph, i)}${cap}</span></button></li>`;
  }

  // Collage order: a fresh mix on every visit that keeps neighbouring photos different in colour,
  // brightness and shape, so similar shots (two moons, two autumn trees) never sit side by side.
  // Each photo's tone ([hue, saturation, brightness]) is measured by scripts/add-photos.py.
  function mixPhotos(list) {
    const real = list.filter(p => p.src), rest = list.filter(p => !p.src);
    if (real.length < 3) return list;
    // Each photo's numbers, worked out once: hue, saturation, brightness and log of its shape.
    const feat = new Map(real.map(p => {
      const [h, s, v] = p.tone || [0, 0, 0.5];
      return [p, { h, s, v, r: Math.log(photoAspect(p)) }];
    }));
    const diff = (p, q) => {
      const A = feat.get(p), B = feat.get(q), dh = Math.min(Math.abs(A.h - B.h), 360 - Math.abs(A.h - B.h)) / 180;
      return 1.6 * dh * Math.min(A.s, B.s) + 1.4 * Math.abs(A.v - B.v) + 0.6 * Math.abs(A.s - B.s) + 0.5 * Math.abs(A.r - B.r);
    };
    // Plan with the same packer the page uses (SITE.collage, below), at this screen's expected width:
    // each photo goes where the packer will put it, and is picked to fit that spot neatly, to differ
    // from the photos it will touch, and not to sit right on top of another wide photo.
    const vw = typeof window !== "undefined" && window.innerWidth ? window.innerWidth : 1280;
    const gutter = vw >= 1100 ? 48 : vw >= 720 ? 32 : 16, W = Math.min(vw, 1280) - 2 * gutter;
    const gap = Math.min(10, Math.max(6, 0.008 * vw));   // same as --gap-x / --gap-y in site.css
    const wideP = p => photoAspect(p) >= 1.2;
    function arrange() {
      const pk = COLLAGE.packer(W, gap, gap), pool = real.slice(), out = [];
      let clash = 0;
      while (pool.length) {
        const fits = pool.map(p => pk.fit(photoAspect(p)));
        const lowest = Math.min(...fits.map(f => f.score));
        const scored = pool.map((p, j) => {
          const f = fits[j], near = pk.around(f);
          let d = 1;
          near.forEach(q => { d = Math.min(d, diff(p, q)); });
          const onWide = wideP(p) && pk.under(f).some(wideP);
          return { j, f, near, s: d - (f.score - lowest) / (3 * pk.pitch) - (onWide ? 2 : 0) };
        }).sort((a, b) => b.s - a.s);
        const pick = scored[Math.floor(Math.random() * Math.min(3, scored.length))];
        const p = pool.splice(pick.j, 1)[0];
        pick.near.forEach(q => { clash += Math.exp(-3 * diff(p, q)); });
        clash += (pick.f.score - lowest) / (3 * pk.pitch);
        pk.place(photoAspect(p), pick.f, p);
        out.push(p);
      }
      return { out, clash };
    }
    let best = null;
    for (let k = 0; k < 8; k++) { const a = arrange(); if (!best || a.clash < best.clash) best = a; }
    return best.out.concat(rest);
  }

  // The collage packer, shared by the mix above and the page layout (setupMasonry in app.js).
  // The width is split into units: 3 per column of tall photos (4 columns on desktop, 3 on tablets,
  // 2 on phones). Each photo keeps its true shape and gets about the same area, so a tall 3:4 photo
  // spans 3 units (a quarter of a desktop row) and a wide 4:3 photo 4 units (a third); on phones wide
  // photos take the full width. To stack neatly, a photo may be one unit wider or narrower than ideal,
  // and it is never put where it would leave a gap too narrow for any photo to fill.
  const COLLAGE = SITE.collage = {
    units(W) {
      const cols = Math.max(2, Math.min(4, Math.floor((W + 8) / ((W < 560 ? 140 : 220) + 8))));
      return 3 * cols;
    },
    packer(W, gapX, gapY) {
      const U = COLLAGE.units(W), pitch = (W + gapX) / U, MIN = 3;
      const H = new Array(U).fill(0), owner = new Array(U).fill(null);
      let memo = new Map();
      const full = s => (s > U - MIN ? U : s);
      const ideal = ar => full(Math.max(MIN, Math.round(3 * Math.sqrt(ar / 0.75))));
      const options = ar => {
        const i = ideal(ar), o = [i];
        [i + 1, i - 1].forEach(s => { if (s >= MIN && s <= U && full(s) === s && !o.includes(s)) o.push(s); });
        if (i < U && !o.includes(MIN) && ar < 1.2) o.push(MIN);
        if (i === U && !o.includes(MIN)) o.push(MIN);
        return o;
      };
      // A run of units next to [p, p+sp) that is lower than both its sides and too narrow to fill.
      const sliver = (p, sp) => {
        if (p > 0) {
          let j = p - 1; const h = H[j];
          while (j > 0 && Math.abs(H[j - 1] - h) < 0.5) j--;
          if (p - j < MIN && (j === 0 || H[j - 1] > h)) return true;
        }
        if (p + sp < U) {
          let j = p + sp; const h = H[j];
          while (j < U - 1 && Math.abs(H[j + 1] - h) < 0.5) j++;
          if (j - (p + sp) + 1 < MIN && (j === U - 1 || H[j + 1] > h)) return true;
        }
        return false;
      };
      // Best spot for a photo sp units wide: as high up as possible, little empty space under it, no slivers.
      const best = sp => {
        if (memo.has(sp)) return memo.get(sp);
        let b = null;
        for (let p = 0; p + sp <= U; p++) {
          let top = 0, waste = 0;
          for (let k = p; k < p + sp; k++) top = Math.max(top, H[k]);
          for (let k = p; k < p + sp; k++) waste += top - H[k];
          const score = top + 0.6 * waste / sp + (sliver(p, sp) ? 1e6 : 0);
          if (!b || score < b.score - 1e-6) b = { p, sp, top, waste, score };
        }
        memo.set(sp, b);
        return b;
      };
      return {
        U, pitch,
        fit(ar) {   // where this photo would go, and at which width
          const i = ideal(ar);
          let f = null;
          for (const sp of options(ar)) {
            const b = best(sp), score = b.score + Math.abs(sp - i) * pitch * 1.5;
            if (!f || score < f.score - 1e-6) f = { ...b, score };
          }
          return f;
        },
        place(ar, f, tag) {   // put it there; returns the tile's position and size in px
          const w = f.sp * pitch - gapX, h = w / ar;
          for (let k = f.p; k < f.p + f.sp; k++) { H[k] = f.top + h + gapY; owner[k] = tag; }
          memo = new Map();
          return { x: f.p * pitch, y: f.top, w, h };
        },
        under(f) { return owner.slice(f.p, f.p + f.sp).filter(Boolean); },
        around(f) { return new Set(owner.slice(Math.max(0, f.p - 1), f.p + f.sp + 1).filter(Boolean)); },
        height() { return Math.max(0, Math.max.apply(null, H) - gapY); }
      };
    }
  };

  V.photography = function () {
    SITE.photos = mixPhotos(SITE.photos);
    const page = SITE.photographyPage;
    return `
<section class="wrap page-hero calm-hero" aria-labelledby="photo-title">
  <p class="kicker dash">${page.kicker}</p>
  <h1 class="serif-title lines" id="photo-title" tabindex="-1">${lines([page.title])}</h1>
  ${page.lede ? `<p class="calm-lede">${page.lede}</p>` : ""}
</section>
<section class="wrap" aria-label="Photographs">
  <ul class="masonry" data-masonry>${SITE.photos.map(photoTile).join("")}</ul>
  <p class="rights-note">All photographs © 2026 Mubarak Shikalgar. All rights reserved. Please don't reuse or reproduce them without permission.</p>
</section>
<div class="calm-end"></div>
<dialog class="viewer" id="photo-viewer" aria-label="Photo viewer">
  <div class="viewer-inner">
    <div class="viewer-top">
      <button class="viewer-back" type="button" data-viewer-close><span aria-hidden="true">←</span> All photographs</button>
      <p class="viewer-count" aria-live="polite" data-viewer-count></p>
      <button class="viewer-icon" type="button" data-viewer-close aria-label="Close viewer">${ICON('<path d="M6 6l12 12"/><path d="M18 6L6 18"/>')}</button>
    </div>
    <div class="viewer-stage" data-viewer-stage>
      <button class="viewer-icon viewer-nav" type="button" data-viewer-prev aria-label="Previous photo">${ICON('<path d="M15 6l-6 6 6 6"/>')}</button>
      <div class="viewer-frame-wrap"><div class="viewer-frame" data-viewer-frame></div></div>
      <button class="viewer-icon viewer-nav" type="button" data-viewer-next aria-label="Next photo">${ICON('<path d="M9 6l6 6-6 6"/>')}</button>
    </div>
    <div class="viewer-cap">
      <div class="viewer-cap-text">
        <h2 class="viewer-title" data-viewer-title></h2>
        <p class="viewer-meta" data-viewer-meta></p>
        <p class="viewer-note" data-viewer-note></p>
      </div>
      <button class="appreciate" type="button" data-appreciate="" aria-pressed="false" data-viewer-like>${HEART}<span data-appreciate-label>Appreciate</span></button>
    </div>
  </div>
</dialog>`;
  };
})(typeof window !== "undefined" ? window : globalThis);
