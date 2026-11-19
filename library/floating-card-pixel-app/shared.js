// Common motion for the whole site — accent color picking · Lenis · loader (cells scatter from the center + wordmark flies to the header) · baseline drawing and white section mask ·
// Scroll dot · header text color flip · text reveal (line mask · scramble) · footer uncover · pixel tail cursor · page transition curtain.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const narrow = matchMedia("(max-width: 1024px)");
  const root = document.documentElement;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const M = { loaderMinMs: 600, loaderOut: 0.9, markFlyAt: 0.9, markFly: 1.1, revealAtFly: 0.3, lineDraw: 1.5, lineStagger: 0.12, contentOverlap: -0.7, contentFade: 1, contentStagger: 0.08, contentRise: 28 };
  const LINES = { rise: 110, duration: 0.9, stagger: 0.08, groupStagger: 0.12 };
  const hash = (n) => { const t = Math.sin(n * 127.1 + 311.7) * 43758.5453; return t - Math.floor(t); };

  // Accent color — like the original, each tab picks one of five and keeps it within that tab
  (() => {
    let n = 0;
    try { n = Number(sessionStorage.getItem("kf-mosaic-accent")); } catch {}
    if (!(n >= 1 && n <= 5)) { n = 1 + Math.floor(Math.random() * 5); try { sessionStorage.setItem("kf-mosaic-accent", String(n)); } catch {} }
    root.style.setProperty("--site-accent", `var(--site-accent-${n})`);
    root.style.setProperty("--fx-card-accent", `var(--site-accent-${n})`);
  })();

  // Smooth scroll — original Lenis 1.3.26 · lerp .1 · wheel multiplier .9 · touch also follows with lerp .1 and releases with inertia 1.7
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9, syncTouch: true, syncTouchLerp: 0.1, touchInertiaExponent: 1.7, autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    if (root.classList.contains("is-loading")) lenis.stop();
  }
  window.kfLenis = lenis;

  // Same-width scramble — shuffles only symbols of equal glyph width so line length never jitters. Duration 1.1 + character count × .012s, shuffles every 3 frames, settles in place from the front between .25 and 1
  const POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&$@*+=/\\<>[]{}()!|:;'\",.-_^~?";
  const running = new WeakMap();
  const scramble = (el, delay = 0, dur) => {
    const prev = running.get(el);
    if (prev) { prev.tween.kill(); el.textContent = prev.text; }
    const text = el.textContent || "";
    const cs = getComputedStyle(el);
    const ctx = document.createElement("canvas").getContext("2d");
    const buckets = new Map();
    let measure = () => 0;
    if (ctx) {
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      measure = (c) => Math.round(ctx.measureText(c).width * 50) / 50;
      for (const c of POOL) { const w = measure(c); buckets.set(w, (buckets.get(w) || "") + c); }
    }
    el.textContent = "";
    const size = parseFloat(cs.fontSize) || 1;
    const chars = [...text].map((c) => {
      const s = document.createElement("span");
      s.className = "scramble__c";
      s.textContent = c;
      el.appendChild(s);
      return { s, final: c, pool: buckets.get(measure(c)) || c, blank: !c.trim() };
    });
    chars.forEach((c) => { c.s.style.width = `${c.s.getBoundingClientRect().width / size}em`; });
    const pick = (p) => p[(Math.random() * p.length) | 0];
    chars.forEach((c) => { if (!c.blank) c.s.textContent = pick(c.pool); });
    gsap.set(el, { opacity: 1 });
    const st = { p: 0 }, n = chars.length;
    let f = 0;
    const tween = gsap.to(st, {
      p: 1, duration: dur ?? 1.1 + n * 0.012, delay, ease: "none",
      onUpdate() {
        const shuffle = f++ % 3 === 0;
        for (let i = 0; i < n; i++) {
          const c = chars[i];
          if (c.blank) continue;
          if (st.p >= (i / n) * 0.75 + 0.25) { if (c.s.textContent !== c.final) c.s.textContent = c.final; }
          else if (shuffle) c.s.textContent = pick(c.pool);
        }
      },
      onComplete() { el.textContent = text; running.delete(el); },
    });
    running.set(el, { tween, text });
    return tween;
  };
  window.kfScramble = scramble;
  window.kfScrambleShort = (el, delay = 0) => scramble(el, delay, 0.6 + (el.textContent || "").length * 0.02);

  // Screen cell grid — the loader turns off from the center, the transition blocker turns on from the center (distance .55 + random .45)
  const cellPx = () => (innerWidth < 700 ? 17 : 28);
  const screenTiles = (host, invert) => {
    const c = cellPx(), cols = Math.ceil(innerWidth / c), rows = Math.ceil(innerHeight / c);
    host.textContent = "";
    host.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    host.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    const tiles = [], marks = [], cx = (cols - 1) / 2, cy = (rows - 1) / 2, far = Math.hypot(cx, cy) || 1;
    const frag = document.createDocumentFragment();
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const i = document.createElement("i");
      frag.appendChild(i); tiles.push(i);
      const v = 0.55 * (Math.hypot(x - cx, y - cy) / far) + 0.45 * Math.random();
      marks.push(0.02 + 0.96 * (invert ? 1 - v : v));
    }
    host.appendChild(frag);
    const on = tiles.map(() => false);
    return (p, cls) => { for (let i = 0; i < tiles.length; i++) { const v = p >= marks[i]; if (v !== on[i]) { on[i] = v; tiles[i].classList.toggle(cls, v); } } };
  };

  const heroReveal = () => { window.dispatchEvent(new Event("kf:hero-reveal")); document.querySelectorAll('[data-fx~="slot-card-gl"]').forEach((n) => n.dispatchEvent(new Event("fx:play"))); };
  const unlock = () => { root.classList.remove("is-loading"); lenis?.start(); ScrollTrigger.refresh(); };

  // Loader
  const runLoader = async () => {
    const loader = document.querySelector("#loader");
    const lines = gsap.utils.toArray(".rules__line");
    const heads = gsap.utils.toArray("#site-header [data-reveal], #hero [data-reveal]");
    const heroLines = gsap.utils.toArray("#hero [data-reveal-line]");
    if (reduce || !loader) {
      gsap.set(lines, { scaleY: 1 }); gsap.set(heads, { opacity: 1, y: 0 });
      if (loader) loader.style.display = "none";
      unlock(); heroReveal(); return;
    }
    // From the second page in the same tab, as in the original, hide the loader text (is-return), don’t fly the wordmark, and skip the minimum time — the wait (hold) stays the same
    const back = root.classList.contains("is-return");
    try { sessionStorage.setItem("kf-mosaic-seen", "1"); } catch {}
    loader.classList.add("is-marked");
    const fill = loader.querySelector(".loader__bar i"), count = loader.querySelector(".loader__count");
    const mark = loader.querySelector(".loader__mark"), headMark = document.querySelector("#site-header .site-header__mark");
    const others = mark ? [...mark.parentElement.children].filter((n) => n !== mark) : [];
    const canFly = !back && !!(mark && headMark && headMark.offsetParent);
    let flight = null;
    const fly = () => flight ??= new Promise((done) => {
      gsap.set(headMark, { y: 0, opacity: 0 });
      const a = mark.getBoundingClientRect(), b = headMark.getBoundingClientRect(), hs = getComputedStyle(headMark), k = b.height / a.height;
      mark.style.transition = "none";
      gsap.timeline({ onComplete: done })
        .to(mark, { x: b.left + b.width / 2 - (a.left + a.width / 2), y: b.top + b.height / 2 - (a.top + a.height / 2), scaleX: k, letterSpacing: `${parseFloat(hs.letterSpacing) / k}px`, color: hs.color, opacity: 1, duration: M.markFly, ease: "expo.inOut" })
        .to(mark, { scaleY: k * 1.18, duration: M.markFly * 0.45, ease: "power2.in" }, 0)
        .to(mark, { scaleY: k, duration: M.markFly * 0.55, ease: "back.out(2)" }, ">")
        .to(others, { opacity: 0, y: 8, duration: 0.35, ease: "power2.out" }, 0.2)
        .call(done, [], M.revealAtFly);
    });
    const st = { p: 0 };
    const progress = (v) => {
      gsap.to(fill, { scaleX: v, duration: 0.4, ease: "power2.out", overwrite: true });
      gsap.to(st, { p: v, duration: 0.4, ease: "power2.out", overwrite: true, onUpdate: () => {
        count.textContent = String(Math.round(st.p * 100)).padStart(3, "0");
        if (canFly && st.p >= M.markFlyAt) fly();
      } });
    };
    const t0 = performance.now();
    const waits = [document.fonts?.ready, new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r, { once: true })))].filter(Boolean);
    // In the original the bar fills .4s for each font, card model and first image downloaded — the copy has little to download, so the time the original took to download (data-hold) is used as
    // Split into five shares and raise the bar each time
    const hold = Math.max(back ? 0 : M.loaderMinMs, Number(loader.dataset.hold) || 420);
    const SHARES = 5;
    let got = 0, ticks = 0;
    const share = () => progress(Math.min(1, (got / waits.length) * 0.4 + (ticks / SHARES) * 0.6));
    progress(0.12);
    const timer = hold ? setInterval(() => { if (ticks < SHARES) { ticks++; share(); } }, hold / SHARES) : 0;
    await Promise.all(waits.map((w) => Promise.resolve(w).then(() => { got++; share(); })));
    const spent = performance.now() - t0;
    if (spent < hold) await new Promise((r) => setTimeout(r, hold - spent));
    clearInterval(timer);
    ticks = SHARES; share();
    await new Promise((r) => setTimeout(r, 400));
    if (canFly) await fly();
    const tl = gsap.timeline({ onComplete: () => ScrollTrigger.refresh() });
    const apply = screenTiles(loader.querySelector(".loader__tiles"), false);
    const out = { p: 0 };
    if (!flight) tl.to(loader.querySelector(".loader__inner"), { opacity: 0, y: -12, duration: 0.35, ease: "power2.out" });
    tl.to(out, {
      p: 1, duration: M.loaderOut, ease: "power1.in",
      onStart: () => { loader.style.background = "transparent"; unlock(); heroReveal(); },
      onUpdate: () => apply(out.p, "is-off"),
      onComplete: () => { if (flight) { headMark.style.transition = "none"; gsap.set(headMark, { opacity: 1, y: 0 }); headMark.offsetWidth; headMark.style.transition = ""; } loader.style.display = "none"; },
    });
    tl.to(lines, { scaleY: 1, duration: M.lineDraw, ease: "expo.out", stagger: (i, n) => ((Number(n.dataset.rule) || i + 1) - 1) * M.lineStagger }, "-=0.45");
    tl.fromTo(flight ? heads.filter((n) => n !== headMark) : heads, { opacity: 0, y: M.contentRise }, { opacity: 1, y: 0, duration: M.contentFade, ease: "power2.out", stagger: M.contentStagger }, M.contentOverlap);
    if (heroLines.length) tl.fromTo(heroLines, { yPercent: 105 }, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.09 }, "<0.1");
  };

  // Text reveal — line mask (from 110% below over .9s, line .08 · order within group .12) · other [data-reveal] 20px · scramble (sibling order .14)
  const reveals = () => {
    if (reduce) return;
    const groups = new Map();
    gsap.utils.toArray("[data-lines]").forEach((el) => {
      const g = el.closest("[data-lines-group]"), n = groups.get(g) ?? 0;
      groups.set(g, n + 1);
      let done = false;
      SplitText.create(el, {
        type: "lines", mask: "lines", linesClass: "lr__line", autoSplit: true,
        onSplit(split) {
          gsap.set(el, { opacity: 1 });
          if (done) { gsap.set(split.lines, { yPercent: 0 }); return; }
          return gsap.from(split.lines, { yPercent: LINES.rise, duration: LINES.duration, ease: "power2.out", stagger: LINES.stagger, delay: n * LINES.groupStagger, scrollTrigger: { trigger: el, start: "top 88%", once: true }, onComplete: () => { done = true; } });
        },
      });
    });
    gsap.utils.toArray("main [data-reveal]:not([data-scramble])").filter((el) => !el.closest("#hero")).forEach((el) => {
      gsap.fromTo(el, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });
    gsap.utils.toArray("[data-scramble]").forEach((el) => {
      const i = Array.prototype.indexOf.call(el.parentElement?.children ?? [], el);
      ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => scramble(el, Math.max(0, i) * 0.14) });
    });
    const inner = document.querySelector(".footer__inner"), main = document.querySelector(".stage > main");
    if (inner && main) gsap.fromTo(inner, { yPercent: 18 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: main, start: "bottom bottom", end: "max", scrub: true } });
  };

  // Baseline mask — .4 over white sections ([data-rule-dim]) (.5 when narrow), 0 behind panels ([data-rule-cover])
  const ruleMasks = () => {
    const lines = [...document.querySelectorAll(".rules__line")];
    const covers = [...document.querySelectorAll("[data-rule-cover]")], dims = [...document.querySelectorAll("[data-rule-dim]")];
    if (!lines.length || (!covers.length && !dims.length)) return;
    const last = new Map();
    let raf = 0, again = 0;
    const draw = () => {
      raf = 0;
      const vh = innerHeight, alpha = narrow.matches ? 0.5 : 0.4;
      const boxes = [...covers.map((n) => [n, 0]), ...dims.map((n) => [n, alpha])].map(([n, a]) => { const b = n.getBoundingClientRect(); return { l: b.left, r: b.right, t: Math.max(0, b.top), b: Math.min(vh, b.bottom), a }; })
        .filter((b) => b.r > b.l && b.b > b.t);
      for (const line of lines) {
        const lb = line.getBoundingClientRect(), x = lb.left + lb.width / 2;
        const hits = lb.width ? boxes.filter((b) => x >= b.l && x <= b.r && !(line.hasAttribute("data-rule-keep") && b.a === 0)) : [];
        let mask = "";
        if (hits.length) {
          const stops = [...new Set(hits.flatMap((h) => [h.t, h.b]))].sort((p, q) => p - q);
          const parts = ["black 0px"];
          let cur = 1;
          for (let i = 0; i < stops.length; i++) {
            const y = stops[i], next = stops[i + 1] ?? Infinity;
            const a = hits.filter((h) => h.t <= y && h.b >= next).reduce((m, h) => Math.min(m, h.a), 1);
            const k = (v) => `color-mix(in srgb, black ${Math.round(v * 100)}%, transparent)`;
            if (a !== cur) { parts.push(`${k(cur)} ${y}px`, `${k(a)} ${y}px`); cur = a; }
          }
          mask = `linear-gradient(to bottom, ${parts.join(", ")})`;
        }
        if ((last.get(line) ?? "") !== mask) { last.set(line, mask); line.style.maskImage = mask; line.style.webkitMaskImage = mask; }
      }
      if (--again > 0) raf = requestAnimationFrame(draw);
    };
    const ask = () => { again = 2; raf ||= requestAnimationFrame(draw); };
    addEventListener("scroll", ask, { passive: true });
    addEventListener("resize", ask, { passive: true });
    addEventListener("load", ask);
    draw();
  };

  // A scroll dot that travels down the fourth guideline, leaving a gap in the line where the dot sits
  const progressPixel = () => {
    const dot = document.querySelector("[data-scroll-pixel]"), keep = document.querySelector(".rules__line[data-rule-keep]");
    if (!dot) return;
    const set = reduce ? (v) => { dot.style.transform = `translateY(${v}px)`; } : gsap.quickSetter(dot, "y", "px");
    const update = () => {
      const max = root.scrollHeight - innerHeight, p = max > 0 ? scrollY / max : 0, h = dot.offsetHeight, y = -h + p * (innerHeight + h);
      set(y);
      keep?.style.setProperty("--gap-top", `${y}px`);
      keep?.style.setProperty("--gap-bottom", `${y + h}px`);
    };
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update, { passive: true });
    update();
  };

  // Header text color — flips when the brightness of the background beneath the text center exceeds .5
  const lum = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[,/\s]+/).filter(Boolean).map(Number);
    if (a < 0.5 || Number.isNaN(r)) return null;
    const f = (v) => { const t = v / 255; return t <= 0.03928 ? t / 12.92 : ((t + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const headerTone = () => {
    const header = document.querySelector("#site-header");
    if (!header) return;
    const probes = [...header.querySelectorAll("[data-tone-probe]")];
    const edges = [...document.querySelectorAll(".pxt")];
    const under = (x, y) => {
      for (const e of edges) {
        const b = e.getBoundingClientRect();
        if (x < b.left || x > b.right || y < b.top || y > b.bottom) continue;
        const t = document.elementsFromPoint(x, y).find((n) => n.parentElement === e);
        const tile = [...e.children].find((n) => { const r = n.getBoundingClientRect(); return n.classList.contains("is-on") && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; }) || t;
        if (tile) { const v = lum(getComputedStyle(tile).backgroundColor); if (v !== null) return v; }
      }
      for (const n of document.elementsFromPoint(x, y)) {
        if (header.contains(n)) continue;
        const v = lum(getComputedStyle(n).backgroundColor);
        if (v !== null) return v;
      }
      return null;
    };
    let raf = 0;
    const check = () => {
      raf = 0;
      for (const p of probes) { const b = p.getBoundingClientRect(), v = under(b.left + b.width / 2, b.top + b.height / 2); if (v !== null) p.classList.toggle("is-inverted", v > 0.5); }
    };
    const ask = () => { raf ||= requestAnimationFrame(check); };
    addEventListener("scroll", ask, { passive: true });
    addEventListener("resize", ask, { passive: true });
    check();
  };

  // Header menu — current section marker (same-page section links) · on touch, tap to expand
  const headerNav = () => {
    const nav = document.querySelector(".site-header__nav");
    if (!nav) return;
    const close = () => nav.classList.remove("is-open");
    nav.addEventListener("click", (e) => {
      if (fine.matches) return;
      if (nav.classList.contains("is-open")) { close(); return; }
      e.preventDefault(); nav.classList.add("is-open");
    });
    document.addEventListener("pointerdown", (e) => { if (!nav.contains(e.target)) close(); });
    addEventListener("scroll", close, { passive: true });
  };

  // Same-page section link — easeInOutCubic .8~1.8s depending on distance
  const anchors = () => {
    document.addEventListener("click", (e) => {
      const a = e.target.closest?.('a[href^="#"]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const id = a.getAttribute("href");
      const target = id === "#top" ? 0 : document.getElementById(decodeURIComponent(id.slice(1)));
      if (target === null) return;
      e.preventDefault();
      const y = target === 0 ? 0 : target.getBoundingClientRect().top + scrollY;
      const d = reduce ? 0 : gsap.utils.clamp(0.8, 1.8, 0.6 + (Math.abs(y - scrollY) / innerHeight) * 0.2);
      if (lenis) lenis.scrollTo(y, { duration: d, easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2) });
      else scrollTo({ top: y, behavior: "instant" });
    });
  };

  // Pixel tail cursor — 14px cells · 260ms × .6~1.4 per cell · 48 cells recycled · dot .18s · label .35s (power3.out) · no tail over the header and the hero
  const cursor = () => {
    if (!fine.matches || reduce) return;
    const CELL = 14, LIFE = 260, N = 48;
    const box = document.createElement("div");
    box.className = "cursor";
    box.setAttribute("aria-hidden", "true");
    box.innerHTML = '<div class="cursor__trail"></div><i class="cursor__dot"></i><span class="cursor__label"></span>';
    document.body.appendChild(box);
    const trail = box.querySelector(".cursor__trail"), dot = box.querySelector(".cursor__dot"), label = box.querySelector(".cursor__label");
    const pool = Array.from({ length: N }, () => { const i = document.createElement("i"); trail.appendChild(i); return { el: i, key: "", until: 0 }; });
    let slot = 0;
    const paint = (cx, cy, now) => {
      const k = `${cx},${cy}`, hit = pool.find((p) => p.key === k && p.until > now);
      if (hit) { hit.until = now + LIFE; return; }
      const p = pool[slot]; slot = (slot + 1) % N;
      p.key = k; p.until = now + LIFE * (0.6 + Math.random() * 0.8);
      p.el.style.transform = `translate(${cx * CELL}px, ${cy * CELL}px)`;
      p.el.classList.add("is-on");
    };
    const sync = () => { const on = !narrow.matches; root.classList.toggle("has-cursor", on); box.hidden = !on; if (!on) box.classList.remove("is-visible"); };
    sync(); narrow.addEventListener("change", sync);
    const head = document.querySelector("#site-header"), hero = document.querySelector("#hero"), main = document.querySelector("#main");
    const blocked = (x, y) => (head && y <= head.getBoundingClientRect().bottom) || (hero && main && hero.dataset.trail !== "on" && y < main.getBoundingClientRect().top);
    const xs = gsap.quickTo(dot, "x", { duration: 0.18, ease: "power3.out" }), ys = gsap.quickTo(dot, "y", { duration: 0.18, ease: "power3.out" });
    const xl = gsap.quickTo(label, "x", { duration: 0.35, ease: "power3.out" }), yl = gsap.quickTo(label, "y", { duration: 0.35, ease: "power3.out" });
    const at = { x: -1, y: -1 };
    let seen = false, over = null;
    addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse" || narrow.matches) return;
      const x = e.clientX, y = e.clientY;
      if (!seen) { seen = true; gsap.set([dot, label], { x, y }); box.classList.add("is-visible"); }
      xs(x); ys(y); xl(x); yl(y);
      const now = performance.now(), from = at.x < 0 ? { x, y } : { ...at }, steps = Math.max(1, Math.ceil(Math.hypot(x - from.x, y - from.y) / CELL));
      if (!over) for (let s = 1; s <= Math.min(steps, 12); s++) {
        const t = s / steps, px = from.x + (x - from.x) * t, py = from.y + (y - from.y) * t;
        if (!blocked(px, py)) paint(Math.floor(px / CELL), Math.floor(py / CELL), now);
      }
      at.x = x; at.y = y;
    }, { passive: true });
    const SEL = 'a, button, [role="button"], label, input, textarea, select, [data-cursor]';
    const setOver = (n) => {
      if (n === over) return;
      over = n;
      box.classList.toggle("is-hover", !!n);
      const t = n?.getAttribute("data-cursor") ?? "";
      label.textContent = t;
      box.classList.toggle("has-label", !!t);
    };
    addEventListener("pointerover", (e) => setOver(e.target.closest?.(SEL) ?? null), { passive: true });
    root.addEventListener("pointerleave", () => box.classList.remove("is-visible"));
    root.addEventListener("pointerenter", () => seen && box.classList.add("is-visible"));
    addEventListener("pointerdown", () => box.classList.add("is-down"));
    addEventListener("pointerup", () => box.classList.remove("is-down"));
    gsap.ticker.add(() => { const now = performance.now(); for (const p of pool) if (p.key && p.until <= now) { p.key = ""; p.el.classList.remove("is-on"); } });
  };

  // Page transition — clicking a link to another page makes cells cover the screen from the center in .55s (power1.out) before navigating
  const pageCover = () => {
    if (reduce) return;
    const cover = document.createElement("div");
    cover.className = "page-cover";
    cover.setAttribute("aria-hidden", "true");
    document.body.appendChild(cover);
    let busy = false;
    document.addEventListener("click", (e) => {
      if (busy || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.("a[href]");
      if (!a || a.target || a.hasAttribute("download") || a.getAttribute("href").startsWith("#")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      e.preventDefault();
      busy = true;
      const apply = screenTiles(cover, true);
      cover.classList.add("is-active");
      const s = { v: 0 };
      gsap.to(s, { v: 1, duration: 0.55, ease: "power1.out", onUpdate: () => apply(s.v, "is-on"), onComplete: () => location.assign(url.href) });
    });
    addEventListener("pageshow", (e) => { if (e.persisted) { busy = false; cover.classList.remove("is-active"); cover.textContent = ""; } });
  };

  const start = () => {
    reveals(); ruleMasks(); progressPixel(); headerTone(); headerNav(); anchors(); cursor(); pageCover();
    runLoader();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
