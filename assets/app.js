/* App shell: hash routing, page transitions, theme, command palette, scroll storytelling. */
(function (g) {
  "use strict";
  const SITE = g.SITE, V = SITE.views, D = SITE.demos, pad2 = SITE.pad2;
  const doc = document, root = doc.documentElement;
  const main = doc.getElementById("view");
  const header = doc.getElementById("site-header");
  const progress = doc.getElementById("progress");
  const progressBar = progress.querySelector("span");
  const reduceMQ = g.matchMedia("(prefers-reduced-motion: reduce)");
  const darkMQ = g.matchMedia("(prefers-color-scheme: dark)");
  const reduced = () => reduceMQ.matches;
  const canVT = () => typeof doc.startViewTransition === "function" && !reduced();
  const NAME = SITE.person.name;
  const PAGES = { home: "Home", work: "Work", thinking: "Thinking", poems: "Poems", photography: "Photography", about: "About", contact: "Contact" };
  const PROJECTS = Object.fromEntries(SITE.projects.map(p => [p.id, p]));
  const NOTES = Object.fromEntries(SITE.notes.map(n => [n.id, n]));
  const POEMS = Object.fromEntries((SITE.poems || []).map(p => [p.id, p]));

  let cleanups = [], instances = [], currentKey = null, first = true, pendingStep = null;

  /* ---------------- Routing ---------------- */
  function resolve(key) {
    if (!key || key === "home") return { key: "home", view: "home", html: () => V.home(), title: NAME };
    if (Object.prototype.hasOwnProperty.call(PAGES, key)) return { key, view: key, html: () => V[key](), title: `${PAGES[key]} · ${NAME}` };
    if (PROJECTS[key]) return { key, view: "project", html: () => V.project(PROJECTS[key]), title: `${PROJECTS[key].title} · ${NAME}` };
    if (NOTES[key]) return { key, view: "note", html: () => V.note(NOTES[key]), title: `${NOTES[key].title} · ${NAME}` };
    if (POEMS[key]) return { key, view: "poem", html: () => V.poem(POEMS[key]), title: `${POEMS[key].title} · ${NAME}` };
    return null;
  }
  function hashKey() { try { return decodeURIComponent(location.hash.replace(/^#/, "")); } catch (e) { return ""; } }

  function teardown() {
    cleanups.forEach(fn => { try { fn(); } catch (e) { /* ignore */ } });
    instances.forEach(i => { try { i.destroy(); } catch (e) { /* ignore */ } });
    cleanups = []; instances = [];
  }
  function setNav(key) {
    doc.querySelectorAll("[data-nav]").forEach(a => {
      if (a.dataset.nav === key) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }
  function focusHeading() { const h = main.querySelector("h1"); if (h) h.focus({ preventScroll: true }); }

  function route() {
    let r = resolve(hashKey());
    if (!r) { if (!first) return; r = resolve("home"); }
    if (r.key === currentKey) return;
    currentKey = r.key;
    const isFirst = first;
    first = false;
    closeMenu();
    const swap = () => {
      teardown();
      main.innerHTML = r.html();
      main.dataset.view = r.view;
      doc.title = r.title;
      setNav(r.view === "project" ? "work" : r.view === "note" ? "thinking" : r.view === "poem" ? "poems" : r.view);
      g.scrollTo(0, 0);
      enhance(r);
    };
    if (!isFirst && canVT()) {
      const vt = doc.startViewTransition(swap);
      vt.updateCallbackDone.then(focusHeading, focusHeading);
    } else {
      swap();
      if (!isFirst) {
        if (!reduced()) { main.classList.remove("fade-in"); void main.offsetWidth; main.classList.add("fade-in"); }
        focusHeading();
      }
    }
  }

  function safe(fn) { try { fn(); } catch (e) { if (g.console) console.error(e); } }

  function enhance(r) {
    if (!reduced()) {
      main.classList.add("entering");
      const t = setTimeout(() => main.classList.remove("entering"), 1700);
      cleanups.push(() => { clearTimeout(t); main.classList.remove("entering"); });
    }
    if (r.view === "photography") safe(setupMasonry);
    safe(setupReveals);
    safe(setupCounters);
    safe(setupArticle);
    safe(setupAppreciate);
    if (r.view === "photography") safe(setupViewer);
    if (r.view === "home") safe(() => { const card = main.querySelector('[data-map="hero"]'); if (card) instances.push(D.mountHeroMap(card)); });
    if (r.view === "home" && SITE.learnMap) safe(() => { const shell = main.querySelector("[data-learn-hero]"); if (shell) instances.push(SITE.learnMap.mount(shell)); });
    main.querySelectorAll('[data-demo="route"]').forEach(el => safe(() => instances.push(D.mountRouteDemo(el))));
    main.querySelectorAll('[data-demo="dispatch"]').forEach(el => safe(() => instances.push(D.mountDispatch(el))));
    main.querySelectorAll('[data-demo="checker"]').forEach(el => safe(() => instances.push(D.mountChecker(el))));
    if (r.view === "work") safe(setupFilters);
    if (r.view === "thinking") safe(setupProcess);
    if (r.view === "about") safe(setupTimeline);
  }

  /* ---------------- Scroll reveals & counters ---------------- */
  function setupReveals() {
    if (reduced() || !("IntersectionObserver" in g)) return;
    const vh = g.innerHeight;
    const els = [...main.querySelectorAll(".rv")].filter(el => el.getBoundingClientRect().top > vh * 0.95);
    if (!els.length) return;
    els.forEach(el => el.classList.add("rv-pending"));
    const io = new IntersectionObserver(entries => {
      let k = 0;
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target, delay = k++ * 70;
        io.unobserve(el);
        el.style.transitionDelay = delay + "ms";
        el.classList.add("rv-in");
        el.classList.remove("rv-pending");
        setTimeout(() => { el.classList.remove("rv-in"); el.style.transitionDelay = ""; }, 1100 + delay);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.01 });
    els.forEach(el => io.observe(el));
    cleanups.push(() => io.disconnect());
  }

  function setupCounters() {
    if (reduced() || !("IntersectionObserver" in g)) return;
    const vh = g.innerHeight;
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { io.unobserve(en.target); animateCount(en.target); }
    }), { threshold: 0.4 });
    main.querySelectorAll("[data-count]").forEach(el => {
      if (el.getBoundingClientRect().top < vh * 0.95) return;
      const raw = el.textContent.trim();
      const m = raw.match(/^([^\d]*)(\d[\d,]*(?:\.\d+)?)(.*)$/);
      if (!m || /^(19|20)\d\d$/.test(m[2])) return;
      const dec = (m[2].split(".")[1] || "").length;
      Object.assign(el.dataset, { final: raw, pre: m[1], num: m[2].replace(/,/g, ""), suf: m[3], dec: String(dec) });
      el.textContent = m[1] + (0).toFixed(dec) + m[3];
      io.observe(el);
    });
    cleanups.push(() => io.disconnect());
  }
  function animateCount(el) {
    const target = parseFloat(el.dataset.num), dec = +el.dataset.dec, pre = el.dataset.pre, suf = el.dataset.suf;
    const t0 = performance.now(), dur = 1300;
    const tick = now => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = p < 1 ? pre + (target * e).toFixed(dec) + suf : el.dataset.final;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------------- Articles: reading progress + section index ---------------- */
  function setupArticle() {
    const art = main.querySelector("[data-article]");
    progress.classList.toggle("on", !!art);
    progressBar.style.transform = "scaleX(0)";
    if (!art) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = art.getBoundingClientRect(), total = r.height - g.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
      progressBar.style.transform = `scaleX(${p.toFixed(4)})`;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    g.addEventListener("scroll", on, { passive: true });
    g.addEventListener("resize", on);
    update();
    cleanups.push(() => { g.removeEventListener("scroll", on); g.removeEventListener("resize", on); cancelAnimationFrame(raf); });

    const secs = [...art.querySelectorAll("[data-sec]")], btns = [...art.querySelectorAll(".cs-index [data-goto]")];
    if (secs.length && btns.length && "IntersectionObserver" in g) {
      btns[0].classList.add("active");
      const io = new IntersectionObserver(entries => entries.forEach(en => {
        if (en.isIntersecting) btns.forEach(b => b.classList.toggle("active", b.dataset.goto === en.target.id));
      }), { rootMargin: "-30% 0px -60% 0px" });
      secs.forEach(s => io.observe(s));
      cleanups.push(() => io.disconnect());
    }
  }

  /* ---------------- Work filters ---------------- */
  function setupFilters() {
    const btns = [...main.querySelectorAll("[data-filter]")], rows = [...main.querySelectorAll(".work-row")];
    const status = main.querySelector("[data-filter-status]");
    btns.forEach(b => b.addEventListener("click", () => {
      if (b.getAttribute("aria-pressed") === "true") return;
      const f = b.dataset.filter;
      const apply = () => {
        btns.forEach(x => x.setAttribute("aria-pressed", String(x === b)));
        let n = 0;
        rows.forEach(r => {
          const show = f === "All" || r.dataset.type === f;
          r.hidden = !show;
          if (show) { n++; r.classList.remove("rv-pending"); }
        });
        status.textContent = f === "All" ? `Showing all ${n} projects` : `Showing ${n} ${f.toLowerCase()} project${n === 1 ? "" : "s"}`;
      };
      if (canVT()) {
        rows.forEach(r => { r.style.viewTransitionName = "row-" + r.dataset.id; });
        root.classList.add("vt-filter");
        const vt = doc.startViewTransition(apply);
        vt.finished.finally(() => { root.classList.remove("vt-filter"); rows.forEach(r => { r.style.viewTransitionName = ""; }); });
      } else apply();
    }));
  }

  /* ---------------- Thinking: sticky step counter ---------------- */
  function setupProcess() {
    const steps = [...main.querySelectorAll(".process-step")], big = main.querySelector("[data-bignum]");
    const minis = [...main.querySelectorAll("[data-mini]")];
    if (pendingStep != null) {
      const target = main.querySelector("#step-" + pendingStep);
      pendingStep = null;
      if (target) requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
    }
    if (!steps.length || !big || !("IntersectionObserver" in g)) return;
    let cur = 0;
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      const k = +en.target.dataset.step;
      if (k === cur) return;
      cur = k;
      big.textContent = pad2(k + 1);
      if (!reduced()) { big.classList.remove("bump"); void big.offsetWidth; big.classList.add("bump"); }
      minis.forEach(m => m.classList.toggle("active", +m.dataset.mini === k));
    }), { rootMargin: "-40% 0px -55% 0px" });
    steps.forEach(s => io.observe(s));
    cleanups.push(() => io.disconnect());
  }

  /* ---------------- About: timeline drawn by scroll ---------------- */
  function setupTimeline() {
    const wrap = main.querySelector(".timeline-wrap");
    if (!wrap) return;
    const bar = wrap.querySelector(".timeline-progress"), items = [...wrap.querySelectorAll(".tl-item")];
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = wrap.getBoundingClientRect(), mid = g.innerHeight * 0.6;
      const p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
      bar.style.transform = `scaleY(${p.toFixed(4)})`;
      items.forEach(it => it.classList.toggle("passed", it.getBoundingClientRect().top + 14 < mid));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    g.addEventListener("scroll", on, { passive: true });
    g.addEventListener("resize", on);
    update();
    cleanups.push(() => { g.removeEventListener("scroll", on); g.removeEventListener("resize", on); cancelAnimationFrame(raf); });
  }

  /* ---------------- Photography: justified collage ----------------
     Without JavaScript the grid falls back to CSS columns. With it, photos are laid out in rows,
     left to right: every photo keeps its shape, and each row is scaled so its photos share one
     height and exactly fill the width, so the whole collage is a clean rectangle. Wide photos come
     out wider than tall ones at the same height (about a third of a row on desktop). Which photos
     share a row is chosen by a small search (dynamic programming) that keeps every row, the last
     one included, close to the target height. */
  function setupMasonry() {
    const grid = main.querySelector("[data-masonry]");
    if (!grid) return;
    const items = [...grid.children];
    const ar = items.map(it => parseFloat(it.dataset.ar) || 1);   // width / height of each photo
    grid.classList.add("is-js");
    let raf = 0, lastW = -1, readyT = 0;
    const layout = force => {
      raf = 0;
      const W = grid.clientWidth;
      if (!W || (W === lastW && !force)) return;
      lastW = W;
      // Read the gaps the browser has already resolved (the CSS sets them with clamp(), which
      // parseFloat can't read from the raw custom property).
      const cs = getComputedStyle(grid);
      const gapX = parseFloat(cs.columnGap) || 8, gapY = parseFloat(cs.rowGap) || 8;
      const target = W < 560 ? 170 : W < 1000 ? 230 : 290;   // ideal row height in px (same as rowGuess in views.js)
      // best[i]: lowest total cost of laying out photos i..n-1; next[i]: where the row starting at i ends.
      const n = ar.length, best = new Array(n + 1).fill(Infinity), next = new Array(n + 1).fill(n);
      best[n] = 0;
      for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i; j < n && j < i + 8; j++) {
          sum += ar[j];
          const h = (W - gapX * (j - i)) / sum;               // the row's height if photos i..j share it
          if (h < target * 0.5) break;                         // more photos would make the row too thin
          const c = Math.pow((h - target) / target, 2) + best[j + 1];
          if (c < best[i]) { best[i] = c; next[i] = j + 1; }
        }
      }
      let y = 0;
      for (let i = 0; i < n; i = next[i]) {
        const j = next[i];
        let sum = 0;
        for (let k = i; k < j; k++) sum += ar[k];
        const h = (W - gapX * (j - i - 1)) / sum;
        let x = 0;
        for (let k = i; k < j; k++) {
          const w = ar[k] * h;
          items[k].style.width = w + "px";
          items[k].style.transform = `translate(${x}px, ${y}px)`;
          x += w + gapX;
        }
        y += h + gapY;
      }
      grid.style.height = Math.max(0, y - gapY) + "px";
    };
    const schedule = force => { if (!raf) raf = requestAnimationFrame(() => layout(force)); };
    layout(true);
    readyT = setTimeout(() => grid.classList.add("ready"), 60);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(() => schedule(true));
    grid.querySelectorAll("img").forEach(img => { if (!img.complete) img.addEventListener("load", () => schedule(true), { once: true }); });
    let ro = null;
    const onResize = () => schedule(false);
    if ("ResizeObserver" in g) { ro = new ResizeObserver(onResize); ro.observe(grid); }
    else g.addEventListener("resize", onResize);
    cleanups.push(() => { clearTimeout(readyT); cancelAnimationFrame(raf); if (ro) ro.disconnect(); else g.removeEventListener("resize", onResize); });
  }

  /* ---------------- Photography: full-screen viewer ---------------- */
  function setupViewer() {
    const box = main.querySelector("#photo-viewer"), grid = main.querySelector("[data-masonry]");
    if (!box || !grid) return;
    const photos = SITE.photos, PV = SITE.photoView, n = photos.length;
    const q = sel => box.querySelector(sel);
    const frame = q("[data-viewer-frame]"), count = q("[data-viewer-count]"), title = q("[data-viewer-title]");
    const meta = q("[data-viewer-meta]"), note = q("[data-viewer-note]"), like = q("[data-viewer-like]"), stage = q("[data-viewer-stage]");
    const ratioNum = s => { const m = String(s).split("/").map(parseFloat); return m.length === 2 && m[0] && m[1] ? m[0] / m[1] : 1.5; };
    const setRatio = (ar, r) => { frame.style.setProperty("--ar", ar); frame.style.setProperty("--r", String(r)); };
    let idx = 0, opener = null;

    function show(i) {
      idx = (i + n) % n;
      const ph = photos[idx];
      setRatio(ph.ratio || "3 / 2", ratioNum(ph.ratio || "3 / 2"));
      frame.innerHTML = PV.frame(ph, idx, true, true);
      const img = frame.querySelector("img");
      if (img && !ph.ratio) {
        const fit = () => { if (img.naturalWidth) setRatio(`${img.naturalWidth} / ${img.naturalHeight}`, img.naturalWidth / img.naturalHeight); };
        if (img.complete) fit(); else img.addEventListener("load", fit, { once: true });
      }
      count.textContent = `${pad2(idx + 1)} / ${pad2(n)}`;
      title.textContent = PV.title(ph);
      meta.textContent = PV.meta(ph);
      note.textContent = ph.note || (ph.src ? "" : "[A line or two about this photo: where you were, what caught your eye.]");
      [title, meta, note].forEach(el => { el.hidden = !el.textContent; });
      like.dataset.appreciate = ph.id;
      paintLike(like);
    }
    function open(i, from) {
      opener = from;
      show(i);
      try { box.showModal(); } catch (e) { box.setAttribute("open", ""); }
    }
    function close() { if (box.open) box.close(); }

    grid.addEventListener("click", e => { const b = e.target.closest("[data-photo]"); if (b) open(+b.dataset.photo, b); });
    box.addEventListener("click", e => {
      if (e.target.closest("[data-viewer-close]")) close();
      else if (e.target.closest("[data-viewer-prev]")) show(idx - 1);
      else if (e.target.closest("[data-viewer-next]")) show(idx + 1);
    });
    box.addEventListener("keydown", e => {
      if (e.key === "ArrowLeft") { e.preventDefault(); show(idx - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); show(idx + 1); }
    });
    box.addEventListener("close", () => { if (opener && opener.isConnected) opener.focus(); });
    let sx = null, sy = 0;
    stage.addEventListener("pointerdown", e => { sx = e.clientX; sy = e.clientY; });
    stage.addEventListener("pointerup", e => {
      if (sx == null) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      sx = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) show(idx + (dx < 0 ? 1 : -1));
    });
    cleanups.push(close);
  }

  /* ---------------- Appreciate (saved in this visitor's browser only) ---------------- */
  const likeKey = id => "ms-appreciate-" + id;
  function readLike(id) { try { return !!id && g.localStorage.getItem(likeKey(id)) === "1"; } catch (e) { return false; } }
  function writeLike(id, on) {
    try { if (on) g.localStorage.setItem(likeKey(id), "1"); else g.localStorage.removeItem(likeKey(id)); } catch (e) { /* storage unavailable */ }
  }
  function paintLike(btn, on) {
    const state = on === undefined ? readLike(btn.dataset.appreciate) : on;
    btn.setAttribute("aria-pressed", String(state));
    const label = btn.querySelector("[data-appreciate-label]");
    if (label) label.textContent = state ? "Appreciated" : "Appreciate";
  }
  function setupAppreciate() { main.querySelectorAll("[data-appreciate]").forEach(b => paintLike(b)); }

  /* ---------------- Copy + toast ---------------- */
  const toastEl = doc.getElementById("toast");
  let toastT = 0;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("show"), 2600);
  }
  function copyText(text) {
    const fail = () => toast("Couldn't copy automatically. Select the address and copy it.");
    try { navigator.clipboard.writeText(text).then(() => toast("Copied " + text), fail); } catch (e) { fail(); }
  }

  /* ---------------- Theme ---------------- */
  const themeBtn = doc.getElementById("theme-toggle");
  const effectiveTheme = () => {
    const a = root.getAttribute("data-theme");
    return a === "dark" || a === "light" ? a : darkMQ.matches ? "dark" : "light";
  };
  function syncTheme() {
    const t = effectiveTheme();
    themeBtn.dataset.mode = t;
    themeBtn.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
    instances.forEach(i => { try { i.repaint(); } catch (e) { /* ignore */ } });
  }
  function toggleTheme(origin) {
    const next = effectiveTheme() === "dark" ? "light" : "dark";
    const apply = () => {
      root.setAttribute("data-theme", next);
      try { g.localStorage.setItem("ms-theme", next); } catch (e) { /* storage unavailable */ }
      syncTheme();
    };
    if (canVT()) {
      const r = (origin || themeBtn).getBoundingClientRect();
      root.style.setProperty("--vx", Math.round(r.left + r.width / 2) + "px");
      root.style.setProperty("--vy", Math.round(r.top + r.height / 2) + "px");
      root.classList.add("vt-theme");
      const vt = doc.startViewTransition(apply);
      vt.finished.finally(() => root.classList.remove("vt-theme"));
    } else apply();
  }
  themeBtn.addEventListener("click", () => toggleTheme(themeBtn));
  if (darkMQ.addEventListener) darkMQ.addEventListener("change", syncTheme);
  new MutationObserver(syncTheme).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  /* ---------------- Mobile menu ---------------- */
  const menuBtn = doc.getElementById("menu-toggle"), menu = doc.getElementById("mobile-menu");
  function openMenu() {
    menu.hidden = false;
    menuBtn.setAttribute("aria-expanded", "true");
    menuBtn.setAttribute("aria-label", "Close menu");
    doc.body.classList.add("menu-open");
    const a = menu.querySelector("a");
    if (a) a.focus();
  }
  function closeMenu() {
    if (menu.hidden) return;
    menu.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open menu");
    doc.body.classList.remove("menu-open");
  }
  menuBtn.addEventListener("click", () => (menu.hidden ? openMenu() : closeMenu()));
  menu.addEventListener("click", e => { if (e.target.closest("a")) closeMenu(); });

  /* ---------------- Command palette ---------------- */
  const dlg = doc.getElementById("palette"), pInput = doc.getElementById("palette-input"), pList = doc.getElementById("palette-list");
  const ITEMS = [].concat(
    Object.keys(PAGES).map(k => ({ group: "Pages", label: PAGES[k], hint: "Page", go: k, kw: k })),
    SITE.projects.map(p => ({ group: "Projects", label: p.title, hint: `${p.type} · ${p.years}`, go: p.id, kw: [p.tagline, p.hook, p.tags.join(" ")].join(" ") })),
    SITE.notes.map(n => ({ group: "Notes", label: n.title, hint: "Note", go: n.id, kw: n.tags.join(" ") + " " + n.dek })),
    (SITE.poems || []).map(p => ({ group: "Poems", label: p.title, hint: "Poem", go: p.id, kw: "poem poetry writing " + p.stanzas[0] })),
    [
      { group: "Actions", label: "Switch light or dark mode", hint: "Theme", run: () => toggleTheme(), kw: "theme dark light mode colour color" },
      { group: "Actions", label: "Copy email address", hint: SITE.person.email, run: () => copyText(SITE.person.email), kw: "email contact mail" },
      { group: "Actions", label: "Open LinkedIn", hint: SITE.person.linkedinLabel, href: SITE.person.linkedin, kw: "linkedin social profile" },
      { group: "Actions", label: "Open GitHub", hint: SITE.person.githubLabel, href: SITE.person.github, kw: "github code repositories" }
    ]
  );
  let shown = [], active = 0, lastFocus = null;

  function renderPalette() {
    const words = pInput.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    shown = ITEMS.filter(it => { const hay = `${it.label} ${it.kw} ${it.group}`.toLowerCase(); return words.every(w => hay.includes(w)); });
    active = Math.min(active, Math.max(0, shown.length - 1));
    if (!shown.length) {
      pList.innerHTML = '<li class="pal-empty" role="presentation">No matches. Try "ETA", "LLM" or "contact".</li>';
      pInput.removeAttribute("aria-activedescendant");
      return;
    }
    let html = "", group = "";
    shown.forEach((it, i) => {
      if (it.group !== group) { group = it.group; html += `<li class="pal-group" role="presentation">${group}</li>`; }
      const label = it.href ? `<a class="pal-link" href="${it.href}" target="_blank" rel="noopener" tabindex="-1">${it.label}</a>` : `<span>${it.label}</span>`;
      html += `<li class="pal-item" role="option" id="pal-${i}" data-i="${i}" aria-selected="${i === active}">${label}<span class="pal-hint">${it.hint}</span></li>`;
    });
    pList.innerHTML = html;
    pInput.setAttribute("aria-activedescendant", "pal-" + active);
  }
  function highlight() {
    pList.querySelectorAll(".pal-item").forEach(li => li.setAttribute("aria-selected", String(+li.dataset.i === active)));
    pInput.setAttribute("aria-activedescendant", "pal-" + active);
    const el = doc.getElementById("pal-" + active);
    if (el) el.scrollIntoView({ block: "nearest" });
  }
  function openPalette() {
    if (dlg.open) return;
    lastFocus = doc.activeElement;
    pInput.value = ""; active = 0;
    renderPalette();
    try { dlg.showModal(); } catch (e) { dlg.setAttribute("open", ""); }
    pInput.focus();
  }
  function closePalette(restore) {
    if (dlg.open) dlg.close();
    if (restore !== false && lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function choose(i) {
    const it = shown[i];
    if (!it) return;
    if (it.href) { const a = pList.querySelector(`#pal-${i} a`); closePalette(false); if (a) a.click(); return; }
    closePalette(false);
    if (it.run) { it.run(); return; }
    const here = currentKey === it.go;
    if (here) g.scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" });
    else location.hash = it.go;
  }
  pInput.addEventListener("input", () => { active = 0; renderPalette(); });
  pInput.addEventListener("keydown", e => {
    if (e.key === "ArrowDown" && shown.length) { e.preventDefault(); active = (active + 1) % shown.length; highlight(); }
    else if (e.key === "ArrowUp" && shown.length) { e.preventDefault(); active = (active - 1 + shown.length) % shown.length; highlight(); }
    else if (e.key === "Enter") { e.preventDefault(); choose(active); }
  });
  pList.addEventListener("click", e => {
    if (!e.isTrusted) return;
    const li = e.target.closest(".pal-item");
    if (!li) return;
    const i = +li.dataset.i, it = shown[i];
    if (it && it.href) {
      if (e.target.closest("a")) { closePalette(false); return; }
      e.preventDefault();
      choose(i);
      return;
    }
    e.preventDefault();
    choose(i);
  });
  pList.addEventListener("mousemove", e => {
    const li = e.target.closest(".pal-item");
    if (li && +li.dataset.i !== active) { active = +li.dataset.i; highlight(); }
  });
  dlg.addEventListener("click", e => { if (e.target === dlg) closePalette(); });
  doc.getElementById("open-palette").addEventListener("click", openPalette);

  const isTyping = el => el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
  doc.addEventListener("keydown", e => {
    const k = (e.key || "").toLowerCase();
    if ((e.ctrlKey || e.metaKey) && k === "k") { e.preventDefault(); if (dlg.open) closePalette(); else openPalette(); return; }
    if (e.key === "/" && !dlg.open && !isTyping(e.target) && !doc.querySelector("dialog.viewer[open]")) { e.preventDefault(); openPalette(); return; }
    if (e.key === "Escape" && !menu.hidden) { closeMenu(); menuBtn.focus(); }
  });

  /* ---------------- Photo protection ----------------
     Deterrents only (a browser has to download an image to show it, so nothing can make saving
     impossible): no right-click / long-press "Save image" menu and no dragging photos out of the page. */
  const onPhoto = e => e.target.closest && e.target.closest(".ph-frame, .viewer-frame");
  doc.addEventListener("contextmenu", e => { if (onPhoto(e)) { e.preventDefault(); toast("Photos © Mubarak Shikalgar"); } });
  doc.addEventListener("dragstart", e => { if (onPhoto(e)) e.preventDefault(); });

  /* ---------------- Global clicks ---------------- */
  doc.addEventListener("click", e => {
    const c = e.target.closest("[data-copy]");
    if (c) { copyText(c.dataset.copy); return; }
    const lk = e.target.closest("[data-appreciate]");
    if (lk && lk.dataset.appreciate) {
      const on = !readLike(lk.dataset.appreciate);
      writeLike(lk.dataset.appreciate, on);
      paintLike(lk, on);
      return;
    }
    if (e.target.closest("[data-copy-link]")) {
      const fail = () => toast("Couldn't copy automatically. Copy the address from your browser.");
      try { navigator.clipboard.writeText(location.href).then(() => toast("Link copied"), fail); } catch (err) { fail(); }
      return;
    }
    const gto = e.target.closest("[data-goto]");
    if (gto) {
      const el = doc.getElementById(gto.dataset.goto);
      if (el) el.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
      return;
    }
    const sl = e.target.closest("[data-step-link]");
    if (sl) pendingStep = +sl.dataset.stepLink;
    if (e.target.closest("[data-top]")) g.scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" });
  });

  /* ---------------- Header state ---------------- */
  const onHeaderScroll = () => header.classList.toggle("scrolled", g.scrollY > 8);
  g.addEventListener("scroll", onHeaderScroll, { passive: true });
  onHeaderScroll();

  /* ---------------- Start ---------------- */
  if (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || "")) {
    doc.querySelectorAll("[data-kbd-mod]").forEach(el => { el.textContent = "⌘"; });
  }
  syncTheme();
  g.addEventListener("hashchange", route);
  route();
})(window);
