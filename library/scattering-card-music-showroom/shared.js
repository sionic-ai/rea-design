// Shared by both pages — smooth scroll (Lenis 1.3.23 lerp .1), dot+ring cursor, thin bar on the right, header menu·search curtain, first loading curtain, white flash transition.
(() => {
  const KT = (window.KT = window.KT || {});
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine) and (hover: hover)").matches;
  KT.reduce = reduce;
  KT.mobile = () => matchMedia("(max-width: 640px)").matches;
  gsap.registerPlugin(ScrollTrigger);

  // Skin variable to 0~1 rgb used by the shader — relative colors like oklch(from …) are also resolved by a 1px canvas
  const probe = document.createElement("span");
  probe.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;visibility:hidden";
  const px = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  KT.readColor = (name, alpha) => {
    if (!probe.isConnected) document.body.appendChild(probe);
    probe.style.color = `var(${name})`;
    const c = getComputedStyle(probe).color;
    px.clearRect(0, 0, 1, 1);
    px.fillStyle = c;
    px.fillRect(0, 0, 1, 1);
    const d = px.getImageData(0, 0, 1, 1).data;
    return alpha ? [d[0] / 255, d[1] / 255, d[2] / 255, d[3] / 255] : [d[0] / 255, d[1] / 255, d[2] / 255];
  };
  KT.cssVar = (name) => getComputedStyle(root).getPropertyValue(name).trim();
  KT.clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  KT.easeOutCubic = (t) => 1 - Math.pow(1 - KT.clamp(t, 0, 1), 3);
  KT.smooth = (a, b, x) => { const t = KT.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  // Follow at the same rate regardless of frame count — original rh(k, dt) = 1 − (1 − k)^(60·dt)
  KT.rh = (k, dt) => 1 - Math.pow(1 - k, 60 * dt);

  // ── Smooth scroll ──
  if (!reduce && window.Lenis) {
    const lenis = new Lenis({
      lerp: 0.1, smoothWheel: true, syncTouch: true, touchMultiplier: 2,
      prevent: (n) => n instanceof Element && !!n.closest("[data-lenis-prevent]"),
    });
    KT.lenis = lenis;
    lenis.on("scroll", () => ScrollTrigger.update());
    ScrollTrigger.addEventListener("refresh", () => lenis.resize());
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  KT.scrollTo = (y, immediate) => (KT.lenis ? KT.lenis.scrollTo(y, { immediate }) : window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" }));
  let locks = 0;
  KT.lockScroll = () => {
    locks++;
    KT.lenis ? KT.lenis.stop() : (document.body.style.overflow = "hidden");
    return () => {
      if (--locks > 0) return;
      KT.lenis ? KT.lenis.start() : (document.body.style.overflow = "");
    };
  };

  const chrome = `
    <div class="kt-flash" aria-hidden="true"></div>
    <div class="k-rail" aria-hidden="true"><div class="k-rail-thumb"></div></div>
    <div class="kc-root" aria-hidden="true">
      <div class="kc-ring"><div class="kc-ring-i"><span class="kc-label"></span></div></div>
      <div class="kc-dot"><div class="kc-dot-i"></div></div>
    </div>`;
  document.body.insertAdjacentHTML("beforeend", chrome);

  // ── Cursor: the dot stays in place, the ring lags by 1 − 0.84^(frame). 52px over a link, a pill if the scene gives a label ──
  const cur = { label: () => {}, bare: () => {} };
  KT.cursor = cur;
  (() => {
    const el = document.querySelector(".kc-root");
    if (!fine || !el) return;
    root.classList.add("has-custom-cursor");
    const ring = el.querySelector(".kc-ring"), dot = el.querySelector(".kc-dot"), label = el.querySelector(".kc-label");
    let tx = -100, ty = -100, rx = -100, ry = -100, seen = false, hot = false, text = false, sceneHot = false;
    const tog = (c, on) => el.classList.toggle(c, on);
    const isHot = (n) => {
      for (let e = n instanceof Element ? n : null, i = 0; e && i < 12; i++, e = e.parentElement)
        if (e.matches("a,button,[role=button],label,select,summary,[data-cursor=hover]")) return true;
      return false;
    };
    document.addEventListener("mousemove", (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!seen) { seen = true; rx = tx; ry = ty; el.style.opacity = "1"; }
      hot = isHot(e.target);
      text = e.target instanceof Element && e.target.matches("input:not([type=button]):not([type=submit]),textarea,[contenteditable=true]");
      tog("is-text", text);
    }, { passive: true });
    root.addEventListener("mouseleave", () => { seen = false; el.style.opacity = "0"; });
    document.addEventListener("mousedown", () => tog("is-down", true));
    document.addEventListener("mouseup", () => tog("is-down", false));
    cur.label = (t) => {
      if (t) { label.textContent = t; ring.style.setProperty("--kc-label-w", `${label.scrollWidth + 24}px`); }
      tog("is-label", !!t);
    };
    cur.bare = (on) => tog("is-bare", on);
    cur.hot = (on) => { sceneHot = on; };
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.max(1, Math.min(now - last, 50));
      last = now;
      const k = 1 - Math.pow(0.84, dt / 16.667);
      rx += (tx - rx) * k; ry += (ty - ry) * k;
      dot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      tog("is-hover", (hot || sceneHot) && !text);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  })();

  // ── Right bar: length = Screen/document ratio (min 28px), can be turned off ──
  (() => {
    const rail = document.querySelector(".k-rail"), thumb = rail?.querySelector(".k-rail-thumb");
    if (!rail || !matchMedia("(pointer: fine)").matches) return;
    root.classList.add("has-rail");
    let h = 28, max = 0, raf = 0, idle = 0, drag = false, grab = 0;
    const measure = () => {
      const vh = innerHeight, dh = root.scrollHeight;
      max = Math.max(0, dh - vh);
      const on = max > 4;
      rail.classList.toggle("is-on", on);
      if (!on) return;
      h = Math.max(28, (vh / dh) * vh);
      thumb.style.height = `${h}px`;
      thumb.style.transform = `translate3d(0, ${KT.clamp(scrollY / max, 0, 1) * (vh - h)}px, 0)`;
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; measure(); }); };
    addEventListener("scroll", () => {
      queue();
      rail.classList.add("is-active");
      clearTimeout(idle);
      idle = setTimeout(() => rail.classList.remove("is-active"), 1100);
    }, { passive: true });
    addEventListener("resize", queue);
    new ResizeObserver(queue).observe(document.body);
    measure();
    const at = (y) => (KT.clamp(y - grab, 0, innerHeight - h) / (innerHeight - h)) * max;
    rail.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || max <= 4) return;
      e.preventDefault();
      const r = thumb.getBoundingClientRect();
      grab = e.clientY >= r.top && e.clientY <= r.bottom ? e.clientY - r.top : h / 2;
      drag = true;
      rail.classList.add("is-drag");
      rail.setPointerCapture(e.pointerId);
      KT.scrollTo(at(e.clientY), true);
    });
    rail.addEventListener("pointermove", (e) => drag && KT.scrollTo(at(e.clientY), true));
    const up = () => { drag = false; rail.classList.remove("is-drag"); };
    rail.addEventListener("pointerup", up);
    rail.addEventListener("pointercancel", up);
  })();

  // ── First loading cover: a 2:3 Lissajous spins at 0.5rad/s, and once everything is loaded it lifts away for 500ms after 180ms ──
  const boot = { total: 1, done: 0, finished: false };
  let bootResolve;
  KT.booted = new Promise((r) => (bootResolve = r));
  KT.bootTask = (p) => {
    boot.total++;
    Promise.resolve(p).catch(() => {}).finally(() => { boot.done++; if (boot.done >= boot.total) boot.finished = true; });
  };
  (() => {
    const cover = document.querySelector(".kt-boot");
    const finish = () => { boot.done++; if (boot.done >= boot.total) boot.finished = true; };
    if (document.readyState === "complete") setTimeout(finish, 0);
    else addEventListener("load", finish, { once: true });
    if (!cover) {
      const wait = () => (boot.finished ? bootResolve() : requestAnimationFrame(wait));
      return wait();
    }
    const cv = cover.querySelector("canvas"), bar = cover.querySelector(".kt-boot__bar i");
    // The original curtain stays up until all card materials are warmed up (values tuned by headless measurement — 2.2s first page, 1.7s list) — set per page with data-boot-min(ms)
    const minShow = +(cover.dataset.bootMin || 0);
    const dpr = Math.min(2, devicePixelRatio || 1), W = 300 * dpr, H = 150 * dpr;
    cv.width = W; cv.height = H;
    const g = cv.getContext("2d");
    const ink = KT.readColor("--kf-ink");
    const inkA = (a) => `rgba(${ink.map((v) => Math.round(v * 255)).join(",")},${a})`;
    const path = (ph) => {
      g.beginPath();
      for (let i = 0; i <= 1400; i++) {
        const t = (i / 1400) * Math.PI * 2;
        const x = W / 2 + 0.4 * W * Math.cos(2 * t + ph), y = H / 2 + 0.34 * H * Math.sin(3 * t);
        i ? g.lineTo(x, y) : g.moveTo(x, y);
      }
    };
    let t0 = 0, fin = 0, closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      cover.classList.add("is-done");
      bootResolve();
      setTimeout(() => cover.remove(), 520);
    };
    setTimeout(close, 20000);
    const draw = (now) => {
      if (closed && !cover.isConnected) return;
      t0 ||= now;
      const ph = ((now - t0) / 1000) * 0.5;
      g.clearRect(0, 0, W, H);
      g.lineJoin = g.lineCap = "round";
      g.save(); g.shadowColor = inkA(0.9); g.shadowBlur = 16 * dpr; g.strokeStyle = inkA(0.55); g.lineWidth = 3.2 * dpr; path(ph); g.stroke(); g.restore();
      g.strokeStyle = inkA(1); g.lineWidth = 1.7 * dpr; path(ph); g.stroke();
      bar.style.transform = `scaleX(${boot.finished ? 1 : Math.min(1, boot.done / boot.total)})`;
      if (boot.finished && !fin) fin = now;
      if (fin && now - fin > 180 && now > minShow) close();
      requestAnimationFrame(draw);
    };
    if (reduce) { const w = () => (boot.finished ? close() : requestAnimationFrame(w)); return w(); }
    requestAnimationFrame(draw);
  })();

  // ── White flash transition: 0→1 in .55s power2.in, next page at 440ms. The incoming side goes 1→0 in .5s (delay .08) power2.out ──
  const flash = document.querySelector(".kt-flash");
  const bang = { v: 0 };
  const paint = () => {
    flash.style.opacity = String(bang.v);
    flash.style.transform = `scale(${0.2 + 1.4 * bang.v})`;
    flash.style.pointerEvents = bang.v > 0.05 ? "auto" : "none";
  };
  KT.bang = bang;
  KT.flashTo = (url, { dur = 0.55, at = 440 } = {}) => {
    sessionStorage.setItem("kt:bang", "1");
    if (reduce) return (location.href = url);
    gsap.to(bang, { v: 1, duration: dur, ease: "power2.in", onUpdate: paint });
    setTimeout(() => (location.href = url), at);
  };
  if (sessionStorage.getItem("kt:bang") === "1") {
    sessionStorage.removeItem("kt:bang");
    bang.v = 1; paint();
    KT.booted.then(() => gsap.to(bang, { v: 0, duration: reduce ? 0 : 0.5, delay: 0.08, ease: "power2.out", onUpdate: paint }));
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-flash]");
    if (!a) return;
    e.preventDefault();
    KT.flashTo(a.getAttribute("href") || a.dataset.flash);
  });

  // ── Header: hamburger curtain (open 320ms, close 240ms, each line rises 60+70n ms later), search curtain (⌘K) ──
  const head = document.querySelector(".kt-head");
  const search = document.querySelector(".kt-search");
  let unlockMenu = null, unlockSearch = null;
  const setMenu = (open) => {
    if (!head) return;
    head.toggleAttribute("data-menu-open", open);
    // As in the original, the line height changes immediately (8·14 → 11) and only the slant turns over 220ms
    head.querySelectorAll(".kt-burger line").forEach((l, i) => { const y = open ? 11 : i ? 14 : 8; l.setAttribute("y1", y); l.setAttribute("y2", y); });
    head.querySelector(".kt-burger")?.setAttribute("aria-expanded", String(open));
    head.querySelector(".kt-menu")?.setAttribute("aria-hidden", String(!open));
    if (open && !unlockMenu) unlockMenu = KT.lockScroll();
    if (!open && unlockMenu) { unlockMenu(); unlockMenu = null; }
  };
  const setSearch = (open) => {
    if (!search) return;
    search.classList.toggle("is-open", open);
    search.setAttribute("aria-hidden", String(!open));
    if (open) {
      if (!unlockSearch) unlockSearch = KT.lockScroll();
      setTimeout(() => search.querySelector("input")?.focus(), 120);
    } else if (unlockSearch) { unlockSearch(); unlockSearch = null; }
  };
  KT.openSearch = () => setSearch(true);
  head?.querySelector(".kt-burger")?.addEventListener("click", () => setMenu(!head.hasAttribute("data-menu-open")));
  head?.querySelector(".kt-menu")?.addEventListener("click", (e) => { if (e.target === e.currentTarget) setMenu(false); });
  head?.querySelectorAll("[data-go]").forEach((b) =>
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      setMenu(false);
      const go = b.dataset.go;
      if (go === "search") return setSearch(true);
      const id = document.getElementById(go);
      if (id) return KT.scrollTo(go === "collections" ? innerHeight * 1.176 : id.offsetTop);
      if (b.dataset.href) b.hasAttribute("data-flash-go") ? KT.flashTo(b.dataset.href) : (location.href = b.dataset.href);
    }),
  );
  if (search) {
    const input = search.querySelector("input"), go = search.querySelector(".kt-search__go");
    search.addEventListener("click", (e) => { if (e.target === search) setSearch(false); });
    input.addEventListener("input", () => go.classList.toggle("is-ready", input.value.trim().length > 0));
    const submit = () => { if (input.value.trim()) { setSearch(false); KT.flashTo(`works.html?q=${encodeURIComponent(input.value.trim())}`); } };
    input.addEventListener("keydown", (e) => e.key === "Enter" && submit());
    go.addEventListener("click", submit);
  }
  addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearch(true); }
    if (e.key === "Escape") { setMenu(false); setSearch(false); }
  });

  // Card detail panel — number, title, date and tags of the pressed card. Closes with Esc, the close button, or an outside click
  KT.inspect = (i) => {
    const panel = document.querySelector(".kf-inspect"), hint = document.querySelector(".kf-hint");
    if (!panel) return;
    const on = i >= 0;
    panel.classList.toggle("is-open", on);
    panel.setAttribute("aria-hidden", String(!on));
    hint?.classList.toggle("is-on", on);
    if (!on) return KT.onInspectClose?.();
    const t = KT.brand[i], q = (s) => panel.querySelector(s);
    q(".kf-inspect__no").textContent = t.no;
    q(".kf-inspect__title").textContent = t.title;
    q(".kf-inspect__date").textContent = t.date;
    q(".kf-inspect__tags").innerHTML = t.tags.map((g) => `<li>${g}</li>`).join("");
  };
  document.addEventListener("click", (e) => { if (e.target.closest("[data-inspect-close]")) { e.stopPropagation(); KT.inspect(-1); } });
  addEventListener("keydown", (e) => e.key === "Escape" && KT.inspect(-1));

  // Word split — spaces between word chunks are left as they are (so Korean line breaks don’t cut mid-word)
  KT.splitWords = (el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    el.classList.add("kt-words");
    return words.map((w, i) => {
      const s = document.createElement("span");
      s.textContent = w;
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
      return s;
    });
  };
  KT.wordsAt = (spans, p, at, step, dur) => {
    spans.forEach((s, i) => {
      const e = KT.easeOutCubic((p - (at + i * step)) / dur);
      s.style.opacity = String(e);
      s.style.filter = `blur(${(1 - e) * 6}px)`;
      s.style.transform = `translateY(${(1 - e) * 0.35}em)`;
    });
  };
})();
