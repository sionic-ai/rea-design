// Motion shared by all pages — the original is built without GSAP, using CSS keyframes + IntersectionObserver + Lenis (1.1.21, duration 1). Rebuilt in the same structure.
(() => {
  const SIDE = matchMedia("(min-width:782px) and (max-aspect-ratio:3/1)");
  const MD = matchMedia("(min-width:782px)");
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)");
  const body = document.body;
  const root = document.documentElement;
  const horizontalPage = body.classList.contains("dk-horizontal");
  const st = { side: SIDE.matches, horiz: SIDE.matches && horizontalPage, fixed: false, lenis: null };
  const norm = (v, a, b) => (v - a) / (b - a);
  const r2 = (v) => Math.round(v * 100) / 100;

  // Like the original, section height is set to the window height (--win-height) — one screen even on phones where the address bar collapses
  const setWin = () => root.style.setProperty("--win-height", `${root.clientHeight}px`);
  setWin();
  addEventListener("resize", setWin);

  // On wide screens the first page takes the wheel as horizontal scroll (orientation: horizontal) — phones and very wide screens stay vertical
  function lenisInit() {
    if (!horizontalPage) { st.lenis = new Lenis({ autoRaf: true, duration: 1 }); return; }
    const on = (m) => {
      st.side = m.matches;
      st.horiz = m.matches;
      if (m.matches) st.lenis = new Lenis({ autoRaf: true, orientation: "horizontal", duration: 1 });
      else if (st.lenis) { st.lenis.destroy(); st.lenis = null; }
    };
    SIDE.addEventListener("change", on);
    on(SIDE);
  }
  SIDE.addEventListener("change", (m) => { st.side = m.matches; });

  function lock(on) {
    st.fixed = on;
    if (on) st.lenis?.stop();
    else st.lenis?.start();
    root.style.overflow = on ? "hidden" : "";
  }

  // ───────── Reveal — when a .dk-anime box enters the screen, .is-anime is added to the .dk-a inside it (horizontal pages: inside 20% of both sides, vertical: above the bottom 20%) ─────────
  function fire(box) {
    const list = box.classList.contains("dk-a") ? [box] : [...box.querySelectorAll(".dk-a:not(.dk-rows__item)")].filter((el) => el.closest(".dk-anime") === box);
    list.forEach((el) => { if (!el.closest(".is-manual")) el.classList.add("is-anime"); });
  }
  function observe(scope = document) {
    scope.querySelectorAll(".dk-anime:not(.is-anime-init)").forEach((box) => {
      const only = box.dataset.anime;
      if ((only === "side" && !st.side) || (only === "mobile" && st.side)) return;
      box.classList.add("is-anime-init");
      const margin = box.classList.contains("dk-anime--root0") ? "0px" : st.horiz ? "0px -20%" : "0px 0px -20% 0px";
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { fire(box); io.disconnect(); } }), { rootMargin: margin });
      io.observe(box);
    });
  }

  // ───────── Line rise ─────────
  function setUpRows(t, html) {
    t.classList.remove("is-setup");
    t.innerHTML = html;
    const h = t.clientHeight;
    const cs = getComputedStyle(t);
    let lh = parseFloat(cs.lineHeight);
    if (Number.isNaN(lh)) lh = parseFloat(cs.fontSize) * 1.2;
    const n = Math.max(1, Math.ceil(h / lh - 0.05));
    const base = (+(t.dataset.delay ?? 0)) * 1000;
    const y = r2(lh + 20);
    let out = `<span class="dk-rows__base" aria-hidden="true">${html}</span><span class="dk-sr">${t.textContent}</span>`;
    for (let i = 0; i < n; i++) {
      const top = r2(lh * i), bot = Math.max(0, r2(h - lh * (i + 1)));
      out += `<span class="dk-rows__line" aria-hidden="true" inert style="--ct:${top}px;--cb:${bot}px"><span class="dk-rows__item" style="--d:${base + 80 * i}ms;--y:${y}px">${html}</span></span>`;
    }
    t.innerHTML = out;
    t.classList.add("is-setup");
  }
  function playRows(t) {
    const items = t.querySelectorAll(".dk-rows__item");
    items.forEach((it, i) => {
      it.classList.add("is-anime");
      if (i === items.length - 1) it.addEventListener("animationend", () => { const b = t.querySelector(".dk-rows__base"); if (b) t.innerHTML = b.innerHTML; }, { once: true });
    });
    t.classList.add("is-rows-end");
  }
  function rows(scope = document) {
    scope.querySelectorAll(".dk-rows:not(.is-rows-init)").forEach((t) => {
      t.classList.add("is-rows-init");
      const html = t.innerHTML;
      t.dataset.html = html;
      setUpRows(t, html);
      const ro = new ResizeObserver(() => { if (t.classList.contains("is-rows-end")) ro.unobserve(t); else if (!t.closest(".is-rows-manual")) setUpRows(t, html); });
      ro.observe(t);
      if (t.closest(".is-rows-manual")) return;
      const margin = t.classList.contains("dk-anime--root0") ? "0px" : st.horiz ? "0px -20%" : "0px 0px -20% 0px";
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { playRows(t); io.disconnect(); } }), { rootMargin: margin });
      io.observe(t);
    });
  }

  // ───────── Scroll ticks on the rail — a vertical line fills from the top as progress advances ─────────
  function meter() {
    const m = document.querySelector(".dk-rail__meter-main");
    if (!m) return;
    const upd = () => requestAnimationFrame(() => {
      if (st.fixed || (!st.side && !MD.matches)) return;
      const lim = st.horiz && st.lenis ? st.lenis.limit : body.offsetHeight - innerHeight;
      const pos = st.horiz && st.lenis ? st.lenis.scroll : scrollY;
      const v = (1000 - Math.round(Math.min(1, Math.max(0, norm(pos, 0, lim || 1))) * 1000)) / 10;
      m.style.setProperty("--pos", `-${v}%`);
    });
    addEventListener("scroll", upd);
    addEventListener("resize", upd);
    new ResizeObserver(upd).observe(body);
    upd();
  }

  // ───────── Per-section tone — when the head of a data-tone section crosses the rail (rail reference) · screen center (background reference), it flips ─────────
  function tone() {
    const groups = [...document.querySelectorAll("[data-tone]")];
    if (!groups.length) return;
    const rail = document.querySelector(".dk-rail");
    const clear = document.querySelector("[data-tone-clear]");
    const rev = groups.map((g) => /\brev\b/.test(g.dataset.tone));
    const nav = groups.map((g) => /\bnav\b/.test(g.dataset.tone));
    let revAt = [], navAt = [], clearAt = 0;
    const measure = () => {
      revAt = []; navAt = [];
      const hw = rail ? rail.offsetWidth : 0, hh = rail ? rail.offsetHeight : 0;
      if (clear) clearAt = clear.offsetHeight - (st.horiz ? 0 : hh);
      groups.forEach((g, i) => {
        const r = g.getBoundingClientRect();
        let p = st.horiz ? r.left + scrollX + (i === groups.length - 1 ? -20 : 0) : r.top + scrollY;
        p = st.horiz ? p - hw : p - hh;
        navAt.push(p);
        if (/\bfade\b/.test(g.dataset.tone)) p = st.horiz ? p - innerWidth / 2 : hw > hh ? p - innerHeight / 2 : p + innerHeight / 2;
        if (g.hasAttribute("data-tone-last") && body.offsetHeight - innerHeight < p) p -= innerHeight / 4;
        revAt.push(p);
      });
    };
    const pick = (flags, at, cls) => {
      const s = st.horiz ? scrollX : scrollY;
      let on = false;
      for (let i = 0; i < at.length; i++) if (at[i] <= s) on = flags[i];
      body.classList.toggle(cls, on);
    };
    const upd = () => requestAnimationFrame(() => {
      if (st.fixed) return;
      pick(rev, revAt, "is-rev");
      pick(nav, navAt, "is-rev-nav");
      if (clear) body.classList.toggle("is-clear-nav", scrollY <= clearAt);
    });
    measure();
    new ResizeObserver(() => { measure(); upd(); }).observe(body);
    addEventListener("resize", measure);
    addEventListener("scroll", upd);
    SIDE.addEventListener("change", () => { measure(); upd(); });
    upd();
  }

  // ───────── Table of contents menu panel ─────────
  function menu() {
    const dlg = document.getElementById("dk-nav");
    if (!dlg) return;
    const openers = [...document.querySelectorAll('[data-dk-open="dk-nav"]')];
    const closers = [...dlg.querySelectorAll("[data-dk-close]")];
    let busy = false, from = null;
    const settle = () => Promise.allSettled(dlg.getAnimations().map((a) => a.finished));
    const expanded = (v) => [...openers, ...closers].forEach((b) => b.setAttribute("aria-expanded", String(v)));
    const onKey = (e) => { if (e.key === "Escape") { e.preventDefault(); close(); } };
    const onBackdrop = (e) => { if (e.target === dlg.querySelector(".dk-nav__in")) close(); };
    const open = () => {
      if (busy) return;
      busy = true;
      dlg.showModal();
      lock(true);
      expanded(true);
      addEventListener("keydown", onKey);
      dlg.addEventListener("click", onBackdrop);
      requestAnimationFrame(async () => { dlg.setAttribute("data-active", "true"); await settle(); busy = false; });
    };
    const close = async () => {
      if (busy) return;
      busy = true;
      dlg.setAttribute("data-active", "false");
      expanded(false);
      removeEventListener("keydown", onKey);
      dlg.removeEventListener("click", onBackdrop);
      if (REDUCE.matches) lock(false);
      else { setTimeout(() => lock(false), 200); await settle(); }
      dlg.close();
      from?.focus();
      from = null;
      busy = false;
    };
    dlg.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
    openers.forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); from = b; open(); }));
    closers.forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); close(); }));
    dlg.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", () => { lock(false); dlg.setAttribute("data-active", "false"); expanded(false); dlg.close(); busy = false; }));
    const reset = () => { if (dlg.getAttribute("data-active") === "true") { dlg.close(); close(); } };
    MD.addEventListener("change", reset);
    SIDE.addEventListener("change", reset);
  }

  // ───────── Move within the same page — 600ms easeInOutQuad ─────────
  function anchors() {
    const ease = (i) => (i < 0.5 ? 2 * i * i : 1 - Math.pow(-2 * i + 2, 2) / 2);
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        const el = id === "#" || id === "#top" ? body : document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        setTimeout(() => {
          const cs = getComputedStyle(el);
          const m = Math.round(parseFloat(cs.scrollMarginLeft || cs.scrollMargin) || 0);
          const r = el.getBoundingClientRect();
          const delta = Math.ceil(st.horiz ? r.left : r.top) - (st.horiz ? m : Math.round(parseFloat(cs.scrollMarginTop) || 0));
          if (REDUCE.matches) { st.horiz ? scrollTo(scrollX + delta, 0) : scrollTo(0, scrollY + delta); return; }
          // While moving, sections that stick to the screen are released too (original is-scroll-busy)
          body.classList.add("is-scroll-busy");
          setTimeout(() => body.classList.remove("is-scroll-busy"), 600);
          if (st.lenis) st.lenis.scrollTo((st.horiz ? scrollX : scrollY) + delta, { duration: 0.6, easing: ease });
          else {
            const from = st.horiz ? scrollX : scrollY;
            let t0;
            const step = (t) => { t0 ??= t; const k = Math.min(1, (t - t0) / 600); const v = from + delta * ease(k); st.horiz ? scrollTo(v, 0) : scrollTo(0, v); if (k < 1) requestAnimationFrame(step); };
            requestAnimationFrame(step);
          }
        }, 10);
      });
    });
  }

  // ───────── Page transition curtain ─────────
  function pageLeave() {
    const veil = document.querySelector(".dk-veil");
    if (!veil) return;
    document.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || a.target === "_blank" || /^(tel|mailto):/.test(href) || a.classList.contains("dk-nolink")) return;
      a.addEventListener("click", (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        if (REDUCE.matches) { location.href = a.href; return; }
        veil.hidden = false;
        veil.classList.add("dk-a", "is-mask", "is-mask-lg");
        veil.style.setProperty("--dur", "1.5s");
        void veil.offsetWidth;
        veil.classList.add("is-anime");
        setTimeout(() => { location.href = a.href; }, 1500);
      });
    });
    addEventListener("pageshow", (e) => { if (e.persisted) location.reload(); });
  }

  // ───────── Follower View badge — mouse movement accumulates as velocity, shrinks by .85 each frame, and trails behind the cursor (capped at 60fps) ─────────
  function badge() {
    if (!matchMedia("(pointer: fine)").matches) return;
    document.querySelectorAll("[data-dk-cursor]").forEach((area) => {
      const b = document.querySelector(area.dataset.dkCursor);
      if (!b) return;
      const cl = b.classList;
      const pos = { x: 0, y: 0 }, last = { x: 0, y: 0 }, vel = { x: 0, y: 0 };
      const k = 0.85, gap = Math.floor(1000 / 60);
      let still = false, raf = 0, prev = performance.now();
      const loop = () => { raf = requestAnimationFrame(step); };
      const step = (t) => {
        if (still) return;
        const dt = t - prev;
        if (dt <= gap) { loop(); return; }
        prev = t - (dt % gap);
        vel.x *= k; vel.y *= k;
        const x = pos.x + r2(vel.x), y = pos.y + r2(vel.y);
        b.style.transform = `translate3d(${x}px, ${y}px, 0px)`;
        if (pos.x === x) still = true;
        loop();
      };
      area.addEventListener("mouseenter", (e) => { last.x = e.clientX; last.y = e.clientY; loop(); });
      area.addEventListener("mouseleave", () => { cl.remove("is-active", "is-hidden"); cancelAnimationFrame(raf); });
      area.addEventListener("mousemove", (e) => {
        if (pos.x && pos.y && !cl.contains("is-active")) cl.add("is-active");
        if (still) { loop(); still = false; }
        pos.x = e.clientX; pos.y = e.clientY;
        vel.x += last.x - pos.x; vel.y += last.y - pos.y;
        last.x = pos.x; last.y = pos.y;
      });
      area.querySelectorAll(".dk-cursor-hide").forEach((h) => {
        h.addEventListener("mouseenter", () => cl.add("is-hidden"));
        h.addEventListener("mouseleave", () => cl.remove("is-hidden"));
      });
    });
  }

  const ready = [];
  const site = { st, observe, rows, setUpRows, playRows, norm, lock, onInit: (fn) => ready.push(fn) };
  window.dkSite = site;

  function init() {
    rows();
    anchors();
    pageLeave();
    tone();
    ready.forEach((fn) => fn());
    setTimeout(() => { observe(); menu(); badge(); meter(); }, 10);
  }

  // Opening curtain (first page, once per session) — rewinds to the front and locks at 200ms, lifts over .6s starting at 1.2s, then turns on the reveal after .2s
  function opening() {
    const op = document.querySelector(".dk-opening");
    if (!op) { init(); return; }
    if (REDUCE.matches) { op.remove(); init(); return; }
    setTimeout(() => { scrollTo(0, 0); lock(true); }, 200);
    setTimeout(async () => {
      await op.animate({ opacity: [1, 0] }, { duration: 600 }).finished;
      op.remove();
      lock(false);
      setTimeout(init, 200);
    }, 1200);
  }

  lenisInit();
  // Runs after the page script (index.js etc.) has hooked onInit
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", opening);
  else opening();
})();
