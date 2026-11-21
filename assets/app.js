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
  const PAGES = { home: "Home", work: "Work", thinking: "Methodology", creative: "Creative", poems: "Poems", photography: "Photography", about: "About", contact: "Contact" };
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
    const want = hashKey();
    if (PROJECTS[want] && PROJECTS[want].demo) { location.replace(PROJECTS[want].demo); return; }   // projects with a demo open it
    let r = resolve(want);
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
      setNav(r.view === "project" ? "work" : r.view === "note" ? "thinking" : ["poem", "poems", "photography"].includes(r.view) ? "creative" : r.view);
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
    if (r.view === "home") safe(() => { const card = main.querySelector('[data-map="linketa"]'); if (card) instances.push(mountLinketaEmbed(card)); });
    if (r.view === "home" && SITE.learnMap) safe(() => { const shell = main.querySelector("[data-learn-hero]"); if (shell) instances.push(SITE.learnMap.mount(shell)); });
    main.querySelectorAll('[data-demo="route"]').forEach(el => safe(() => instances.push(D.mountRouteDemo(el))));
    main.querySelectorAll('[data-demo="dispatch"]').forEach(el => safe(() => instances.push(D.mountDispatch(el))));
    main.querySelectorAll('[data-demo="checker"]').forEach(el => safe(() => instances.push(D.mountChecker(el))));
    if (r.view === "work") safe(setupFilters);
    if (main.querySelector("[data-view-btn]")) safe(setupViewToggle);
    if (r.view === "thinking") safe(setupProcess);
    if (r.view === "about") safe(setupTimeline);
    if (r.view === "about") safe(setupContactForm);
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

  /* ---------------- Project lists: List | Cards switch (home + Work), remembered per visitor ---------------- */
  function setupViewToggle() {
    const btns = [...main.querySelectorAll("[data-view-btn]")], lists = [...main.querySelectorAll(".work-list[data-view]")];
    btns.forEach(b => b.addEventListener("click", () => {
      const v = b.dataset.viewBtn;
      if (lists.every(l => l.dataset.view === v)) return;
      try { g.localStorage.setItem("ms-work-view", v); } catch (e) { /* storage unavailable */ }
      const rows = [...main.querySelectorAll(".work-row")];
      const apply = () => {
        lists.forEach(l => { l.dataset.view = v; });
        btns.forEach(x => x.setAttribute("aria-pressed", String(x.dataset.viewBtn === v)));
        rows.forEach(r => r.classList.remove("rv-pending"));
      };
      if (canVT()) {
        rows.forEach(r => { if (!r.hidden) r.style.viewTransitionName = "row-" + r.dataset.id; });
        root.classList.add("vt-filter");
        const vt = doc.startViewTransition(apply);
        vt.finished.finally(() => { root.classList.remove("vt-filter"); rows.forEach(r => { r.style.viewTransitionName = ""; }); });
      } else apply();
    }));
  }

  /* ---------------- Methodology: stage tracker, playable diagrams, dashboard ---------------- */
  function setupProcess() {
    const stages = [...main.querySelectorAll(".stage")], rail = main.querySelector("[data-rail]");
    const map = main.querySelector("[data-route-map]"), list = main.querySelector("[data-stages]");
    if (pendingStep != null) {
      const target = main.querySelector("#step-" + pendingStep);
      pendingStep = null;
      if (target) requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
    }
    setupKpis();
    setupFlows();
    if (!stages.length || !("IntersectionObserver" in g)) return;
    const nodes = rail ? [...rail.querySelectorAll("[data-rail-k]")] : [];
    const railN = rail && rail.querySelector("[data-rail-n]"), railT = rail && rail.querySelector("[data-rail-t]");
    let cur = -1;
    const setActive = k => {
      if (k === cur) return;
      cur = k;
      stages.forEach((s, i) => s.classList.toggle("is-active", i === k));
      nodes.forEach((b, i) => {
        b.classList.toggle("on", i === k);
        b.classList.toggle("done", i < k);
        if (i === k) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
      });
      if (railN) railN.textContent = pad2(k + 1);
      if (railT) { const t = stages[k].querySelector(".stage-title"); railT.textContent = t ? t.textContent : ""; }
    };
    setActive(0);
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) setActive(+en.target.dataset.step);
    }), { rootMargin: "-38% 0px -58% 0px" });
    stages.forEach(s => io.observe(s));
    cleanups.push(() => io.disconnect());
    // The compact tracker shows once the overview route has scrolled away, and hides again at Findings.
    if (!rail || !map || !list) return;
    let mapGone = false, inList = false;
    const paint = () => rail.classList.toggle("show", mapGone && inList);
    const top = Math.round(header.getBoundingClientRect().height) || 68;
    const ioMap = new IntersectionObserver(([en]) => { mapGone = !en.isIntersecting && en.boundingClientRect.top < top; paint(); },
      { rootMargin: `-${top}px 0px 0px 0px` });
    const ioList = new IntersectionObserver(([en]) => { inList = en.isIntersecting; paint(); },
      { rootMargin: `-${top + 90}px 0px -40% 0px` });
    ioMap.observe(map);
    ioList.observe(list);
    cleanups.push(() => { ioMap.disconnect(); ioList.disconnect(); });
  }

  // Home page panel: the LinkETA demo (mubarak.sh/demos/linketa/embed.html) in a frame. It loads only after the page
  // has settled, so the first paint and the hero animation are not slowed by the map and model.
  function mountLinketaEmbed(card) {
    const box = card.querySelector("[data-linketa-embed]");
    let dead = false, timer = 0;
    const add = () => {
      if (dead || !box || box.querySelector("iframe")) return;
      const f = document.createElement("iframe");
      f.src = "/demos/linketa/embed.html";
      f.title = "LinkETA travel time demo: click the map to set A, then B";
      f.addEventListener("load", () => box.classList.add("ready"));
      box.appendChild(f);
    };
    const later = () => { timer = setTimeout(() => ("requestIdleCallback" in window ? requestIdleCallback(add, { timeout: 2500 }) : add()), 600); };
    if (document.readyState === "complete") later(); else window.addEventListener("load", later, { once: true });
    return { destroy() { dead = true; clearTimeout(timer); } };
  }

  // Dashboard tiles: tap one to flip it and see the tests behind that check; tap again to flip back.
  function setupKpis() {
    main.querySelectorAll("[data-kpi]").forEach(board => {
      board.addEventListener("click", e => {
        const t = e.target.closest(".kpi");
        if (t) t.setAttribute("aria-pressed", String(t.getAttribute("aria-pressed") !== "true"));
      });
    });
  }

  // Story visuals: collapsed until Play; Play opens the panel and steps through the stops (classes s1, s2, ...).
  function setupFlows() {
    main.querySelectorAll("[data-flow]").forEach(fig => {
      const stops = [...fig.querySelectorAll(".fl-step")], btn = fig.querySelector("[data-flow-play]");
      const hide = fig.querySelector("[data-flow-hide]"), label = btn && btn.querySelector("span");
      const first = label ? label.textContent : "";
      const cap = fig.querySelector("[data-flow-cap]"), STEP = 1500;
      let timers = [];
      const stop = () => { timers.forEach(clearTimeout); timers = []; };
      const reach = (i, now) => {
        stops.forEach((x, j) => { x.classList.toggle("lit", j <= i); x.classList.toggle("now", now && j === i); });
        for (let j = 1; j <= stops.length; j++) fig.classList.toggle("s" + j, j <= i + 1);
        if (cap && stops[i]) cap.textContent = stops[i].dataset.cap;
      };
      const finish = () => { reach(stops.length - 1, false); fig.classList.remove("running"); };
      const open = on => {
        fig.classList.toggle("open", on);
        if (btn) btn.setAttribute("aria-expanded", String(on));
        if (hide) hide.hidden = !on;
        if (label) label.textContent = on ? (btn.dataset.again || first) : first;
      };
      const run = () => {
        stop();
        open(true);
        if (reduced()) { finish(); return; }
        // Jump back to the start without animating the reset, then play once the panel has opened.
        fig.classList.add("reset");
        reach(-1, false);
        void fig.offsetWidth;
        fig.classList.remove("reset");
        fig.classList.add("running");
        stops.forEach((s, i) => timers.push(setTimeout(() => reach(i, true), 450 + i * STEP)));
        timers.push(setTimeout(finish, 450 + stops.length * STEP));
      };
      finish(); // collapsed view shows the complete line of stops
      if (btn) btn.addEventListener("click", run);
      if (hide) hide.addEventListener("click", () => { stop(); finish(); open(false); if (btn) btn.focus(); });
      cleanups.push(stop);
    });
  }

  /* ---------------- About: compact contact form ----------------
     With a Formspree form ID (SITE.person.formspree) the message is posted there and arrives by email.
     Without one, the visitor's email app opens with the message filled in. */
  function setupContactForm() {
    const form = main.querySelector("[data-contact-form]");
    if (!form) return;
    const P = SITE.person, status = form.querySelector(".tf-status"), btn = form.querySelector("button[type=submit]");
    const say = (msg, ok) => { status.textContent = msg; status.classList.toggle("ok", !!ok); status.classList.toggle("err", ok === false); };
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const d = new FormData(form);
      if (String(d.get("_gotcha") || "")) return;   // spam trap filled in by a bot
      const name = String(d.get("name") || "").trim(), email = String(d.get("email") || "").trim(), msg = String(d.get("message") || "").trim();
      if (!name || !msg || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        say("Please add your name, a valid email and a message.", false);
        const f = form.elements;
        (!name ? f.namedItem("name") : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? f.namedItem("email") : f.namedItem("message")).focus();
        return;
      }
      if (!P.formspree) {
        const subject = `Message from ${name} via mubarak.sh`, body = `${msg}\n\n${name}\n${email}`;
        g.location.href = `mailto:${P.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        say("Your email app should open with the message ready to send.", true);
        return;
      }
      btn.disabled = true;
      say("Sending…");
      try {
        const res = await fetch(`https://formspree.io/f/${encodeURIComponent(P.formspree)}`, { method: "POST", body: d, headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        say("Thanks, your message was sent. I'll reply by email.", true);
      } catch (err) {
        say(`Sorry, it didn't send. Please email me at ${P.email}.`, false);
      } finally {
        btn.disabled = false;
      }
    });
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

  /* ---------------- Photography: collage ----------------
     Without JavaScript the grid falls back to CSS columns. With it: equal columns (SITE.collage in
     views.js), photos at their natural height. A tall photo goes into the shortest column; a wide photo
     spans two neighbouring columns, on the pair whose lower top is highest. The mix (views.js) only
     sends a wide photo when two columns end level; any small difference left is closed by making the
     last photo of the shorter column that much taller (it fills its frame, trimming a sliver), so a
     wide photo never leaves a gap under it. The bottom edge is ragged. */
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
      const C = SITE.collage, cols = C.cols(W), colW = (W - gapX * (cols - 1)) / cols;
      // Works out every tile's place; photos in `narrow` are shown one column wide.
      const plan = narrow => {
        const H = new Array(cols).fill(0), last = new Array(cols).fill(null), tiles = [];
        // Make the last photo in column k d px taller, if it is the last photo in all its columns and
        // the stretch is small (it then fills its frame, trimming a sliver off its edges).
        const canStretch = (k, d) => d <= 0.5 || (!!last[k] && d <= 0.4 * last[k].h && last[k].cols.every(c => last[c] === last[k]));
        const stretch = (k, d) => {
          const L = last[k];
          if (d <= 0.5 || !canStretch(k, d)) return;
          L.h += d; L.stretched = true;
          L.cols.forEach(c => { H[c] += d; });
        };
        // The pair a wide photo goes on (SITE.collage.pair), or, if a difference there can't be closed,
        // the best pair where it can.
        const pairFor = () => {
          const order = [];
          for (let k = 0; k < cols - 1; k++) order.push({ k, s: Math.max(H[k], H[k + 1]) + 3 * Math.abs(H[k] - H[k + 1]) });
          order.sort((a, b) => a.s - b.s);
          const ok = order.find(({ k }) => { const t = Math.max(H[k], H[k + 1]); return canStretch(k, t - H[k]) && canStretch(k + 1, t - H[k + 1]); });
          return ok ? ok.k : -1;   // -1: nowhere without a gap, so it goes in one column instead
        };
        items.forEach((it, i) => {
          let c = 0, span = 1, top;
          const pc = C.wide(ar[i]) && !narrow.has(i) ? pairFor() : -1;
          if (pc >= 0) {
            span = 2; c = pc; top = Math.max(H[c], H[c + 1]);
            for (const k of [c, c + 1]) stretch(k, top - H[k]);
            top = Math.max(H[c], H[c + 1]);
          } else {
            for (let k = 1; k < cols; k++) if (H[k] < H[c] - 0.5) c = k;
            top = H[c];
          }
          const w = span * colW + (span - 1) * gapX;
          const tile = { i, x: c * (colW + gapX), y: top, w, h: w / ar[i], cols: span === 2 ? [c, c + 1] : [c], wide: span === 2 };
          tile.cols.forEach(k => { H[k] = top + tile.h + gapY; last[k] = tile; });
          tiles.push(tile);
        });
        return { tiles, last, height: Math.max(0, Math.max.apply(null, H) - gapY) };
      };
      // A wide photo must never sit in the bottom row: if one does, show it one column wide and redo.
      const narrow = new Set();
      let res = plan(narrow);
      for (let n = 0; n < 4 && res.last.some(t => t && t.wide); n++) {
        res.last.forEach(t => { if (t && t.wide) narrow.add(t.i); });
        res = plan(narrow);
      }
      res.tiles.forEach(t => {
        const it = items[t.i], frame = it.querySelector(".ph-frame");
        if (frame) frame.style.height = t.stretched ? t.h + "px" : "";
        it.style.width = t.w + "px";
        it.style.transform = `translate(${Math.round(t.x)}px, ${Math.round(t.y)}px)`;
      });
      grid.style.height = res.height + "px";
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
    SITE.notes.map(n => ({ group: "Findings", label: n.title, hint: "Finding", go: n.id, kw: n.tags.join(" ") + " " + n.dek })),
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
  const onPhoto = e => e.target.closest && e.target.closest(".ph-frame, .viewer-frame, .photo-art");
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
