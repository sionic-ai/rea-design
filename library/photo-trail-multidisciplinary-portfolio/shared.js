// Motion shared by all pages: Lenis (lerp .08), first-visit loader, color-curtain page transition, dropping-down menu and spotlight,
// Round button (circle fill, magnet), line marker mask (data-block), line and word rise (data-copy), handwritten sticker, dot-text footer and speech bubble.
// Register page scenes with yf.scene(fn) so they know the delay after loading and transition (yf.introDelay) when they are set up.
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  CustomEase.create("hop", "0.8, 0, 0.2, 1");
  CustomEase.create("hop2", "0.9, 0, 0.1, 1");

  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const params = new URLSearchParams(location.search);
  const COLORS = ["var(--site-navy)", "var(--site-rust)", "var(--site-pink)", "var(--kf-raised)"];
  const shuffle = (a) => { const t = [...a]; for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [t[i], t[j]] = [t[j], t[i]]; } return t; };

  const yf = (window.yf = { reduce, fine, introDelay: 1.125, scenes: [], scene: (fn) => yf.scenes.push(fn) });

  const lenis = (yf.lenis = new Lenis({ lerp: reduce ? 1 : 0.08, smoothWheel: !reduce }));
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ---------- First-visit loading (once per session on the home page) ---------- */
  const pre = document.querySelector(".yf-pre");
  const runPre = pre && !reduce && !params.has("enter") && !sessionStorage.getItem("yf-seen");
  if (pre && !runPre) pre.remove();
  if (runPre) {
    sessionStorage.setItem("yf-seen", "1");
    yf.introDelay = 7.9;
    lenis.stop();
    const imgs = pre.querySelectorAll(".yf-pre__img");
    const inner = pre.querySelectorAll(".yf-pre__img .wf-img");
    const head = pre.querySelector(".yf-pre__head h1");
    const count = pre.querySelector(".yf-pre__count p");
    const exits = [...pre.querySelectorAll(".yf-pre__exit")];
    shuffle(COLORS).forEach((c, i) => exits[i] && (exits[i].style.backgroundColor = c));
    const ROT = [7.5, -2.5, -10, 12.5, -5, 5];
    gsap.set(imgs, { xPercent: -50, yPercent: -50, scale: 0, opacity: 1, rotate: (i) => ROT[i % ROT.length] });
    gsap.set(inner, { scale: 1.5 });
    const chars = SplitText.create(head, { type: "chars", mask: "chars" }).chars;
    gsap.set(chars, { yPercent: 100 });
    gsap.set(count, { yPercent: 125, opacity: 1 });
    gsap.set(head, { opacity: 1 });
    const n = { v: 0 };
    let shown = -1;
    gsap.timeline({ delay: 1, onComplete: () => { pre.remove(); lenis.start(); ScrollTrigger.refresh(); } })
      .to(imgs, { scale: 1, duration: 1, ease: "hop", stagger: 0.2 })
      .to(inner, { scale: 1, duration: 1, ease: "hop", stagger: 0.2 }, "<")
      .to(chars, { yPercent: 0, duration: 1, ease: "hop2", stagger: { each: 0.125, from: "random" } }, 0.35)
      .to(count, { yPercent: 0, duration: 1, ease: "hop2" }, "<")
      .to(n, { v: 100, duration: 2, ease: "power2.inOut", onUpdate: () => { const v = Math.round(n.v); if (v !== shown) { shown = v; count.textContent = String(v).padStart(3, "0"); } } }, 0.85)
      .to(count, { yPercent: -100, duration: 0.75, ease: "hop2" }, 3.25)
      .to(chars, { yPercent: -100, duration: 0.75, ease: "hop2", stagger: { each: 0.1, from: "random" } }, 3.25)
      .to(imgs, { scale: 0, duration: 1, ease: "hop2", stagger: -0.075 }, 3.5)
      .set(exits, { scaleY: 1 }, 4.7)
      .set(pre, { backgroundColor: "transparent", pointerEvents: "none" }, 4.7)
      .to(exits, { scaleY: 0, duration: 1, ease: "hop2", stagger: -0.1 }, 4.75);
  }

  /* ---------- Page turn ---------- */
  const trans = document.querySelector(".yf-trans");
  const blocks = trans ? [...trans.querySelectorAll(".yf-trans__block")] : [];
  const word = trans?.querySelector(".yf-trans__text h1");
  const PHRASES = (word?.dataset.phrases || "").split("|").filter(Boolean);
  let split = null;
  const paint = () => {
    const order = shuffle(COLORS);
    blocks.forEach((b, i) => (b.style.backgroundColor = order[i]));
    const last = order[order.length - 1];
    word.style.color = last === "var(--site-pink)" ? "var(--kf-ink)" : "var(--kf-bg)";
    split?.revert();
    word.textContent = PHRASES[Math.floor(Math.random() * PHRASES.length)] || "";
    split = SplitText.create(word, { type: "lines, words", linesClass: "yf-line-mask", wordsClass: "yf-word" });
    gsap.set(split.words, { y: "115%" });
  };
  const leave = (href) => {
    paint();
    sessionStorage.setItem("yf-trans", "1");
    gsap.timeline({ onComplete: () => (location.href = href) })
      .set(trans, { pointerEvents: "all" })
      .set(blocks, { transformOrigin: "left center", scaleX: 0 })
      .to(blocks, { scaleX: 1, duration: 1.25, ease: "hop", stagger: 0.075 })
      .to(split.words, { y: "0%", duration: 1, ease: "power4.out", stagger: 0.1 }, "-=0.6");
  };
  if (trans) {
    if (sessionStorage.getItem("yf-trans") && !reduce) {
      sessionStorage.removeItem("yf-trans");
      paint();
      gsap.set(split.words, { y: "0%" });
      gsap.set(blocks, { transformOrigin: "right center", scaleX: 1 });
      root.classList.remove("yf-entering");
      gsap.timeline({ onComplete: () => { gsap.set(trans, { pointerEvents: "none" }); ScrollTrigger.refresh(); } })
        .to(split.words, { y: "115%", duration: 1, ease: "power4.out", stagger: 0.1 })
        .to(blocks, { scaleX: 0, duration: 1.25, ease: "hop", stagger: -0.075 }, "-=1");
    } else {
      sessionStorage.removeItem("yf-trans");
      root.classList.remove("yf-entering");
    }
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey) return;
      const href = a.getAttribute("href");
      if (!/\.html(\?|#|$)/.test(href) || href.startsWith("http") || a.closest(".wf-ui")) return;
      e.preventDefault();
      if (reduce) location.href = href; else leave(href);
    });
  }
  addEventListener("pageshow", (e) => e.persisted && blocks.length && gsap.set(blocks, { scaleX: 0 }));

  /* ---------- Menu: the panel moves down 90svh (75svh on phones) while scaling to .95x with 20px corners (.85s power3.inOut) ---------- */
  const page = document.querySelector(".yf-page");
  const burger = document.querySelector(".yf-burger");
  if (page && burger) {
    let open = false, busy = false, saved = 0;
    const inner = page.querySelector(".yf-page__inner");
    const spacer = document.querySelector(".yf-page-spacer");
    const lock = () => {
      saved = scrollY;
      spacer.style.height = `${page.offsetHeight}px`;
      spacer.style.display = "block";
      lenis.stop();
      inner.style.transform = `translate3d(0, ${-saved}px, 0)`;
      page.classList.add("is-locked");
    };
    const unlock = () => {
      page.classList.remove("is-locked");
      gsap.set(page, { clearProps: "transform,borderRadius" });
      inner.style.transform = "";
      spacer.style.display = "none";
      scrollTo(0, saved);
      lenis.scrollTo(saved, { immediate: true, force: true });
      lenis.start();
      ScrollTrigger.refresh();
    };
    const toggle = () => {
      if (busy) return;
      busy = true;
      open = !open;
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open);
      const narrow = matchMedia("(max-width: 999px)").matches;
      if (open) {
        lock();
        gsap.to(page, { y: narrow ? "75svh" : "90svh", scale: 0.95, borderRadius: "20px", duration: reduce ? 0 : 0.85, ease: "power3.inOut", onComplete: () => (busy = false) });
      } else {
        gsap.to(page, { y: 0, scale: 1, borderRadius: "0px", duration: reduce ? 0 : 0.75, ease: "power3.inOut", onComplete: () => { unlock(); busy = false; } });
      }
    };
    burger.addEventListener("click", toggle);
    addEventListener("keydown", (e) => e.key === "Escape" && open && toggle());
    page.addEventListener("click", (e) => { if (open && !burger.contains(e.target)) { e.preventDefault(); toggle(); } }, true);
  }

  // Spotlight: on entering the list four cards pop out with a spring (.75s elastic.out(1,.6)), and hovering a row scatters the cards to that row’s height (×.75),
  // That row grows by 50px and the other rows shrink by the same amount in inverse proportion to distance (.5s power2.out). Row height background is text height + 10px.
  const spot = document.querySelector(".yf-spot__list");
  if (spot) {
    const cards = gsap.utils.toArray(".yf-spot__card");
    const rows = [...spot.querySelectorAll(".yf-spot__item")];
    const BASE = [-10, 10, 8, -8];
    const SHIFT = rows.map((_, r) => {
      const w = rows.map((_, t) => (t === r ? 0 : 1 / Math.abs(t - r))), sum = w.reduce((a, b) => a + b, 0);
      return w.map((v, t) => (t === r ? 50 : Math.round((-50 * v) / sum)));
    });
    let base = 0;
    gsap.set(cards, { rotation: (i) => BASE[i], scale: 0 });
    new ResizeObserver(() => {
      base = Math.round(Math.max(...rows.map((r) => r.firstElementChild.offsetHeight)) + 10);
      gsap.set(rows, { height: base });
    }).observe(spot);
    spot.addEventListener("mouseenter", () => gsap.to(cards, { scale: 1, duration: 0.75, ease: "elastic.out(1, 0.6)", overwrite: "auto" }));
    spot.addEventListener("mouseleave", () => {
      gsap.to(cards, { scale: 0, duration: 0.5, ease: "power3.out", overwrite: "auto" });
      gsap.to(rows, { height: base, duration: 0.35, ease: "power3.out", overwrite: "auto" });
    });
    rows.forEach((item, e) => item.addEventListener("mouseenter", () => {
      const box = spot.getBoundingClientRect(), r = item.getBoundingClientRect();
      const dy = (r.top + r.height / 2 - box.top - box.height / 2) * 0.75;
      gsap.to(cards, {
        x: () => gsap.utils.random(-100, 100), y: () => dy + gsap.utils.random(-50, 50),
        rotation: (i) => BASE[i] + gsap.utils.random(-20, 20), duration: 1, ease: "elastic.out(1, 0.5)", overwrite: "auto",
      });
      gsap.to(rows, { height: (t) => base + SHIFT[e][t], duration: 0.5, ease: "power2.out", overwrite: "auto" });
    }));
  }

  /* ---------- Round Button ---------- */
  // The magnet is attached to the button plate itself, like the original — the wrapped cell’s box center is offset from the button center because of line height
  document.querySelectorAll(".yf-magnet").forEach((w) => {
    const m = w.firstElementChild || w;
    if (!fine || reduce) return;
    const qx = gsap.quickTo(m, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const qy = gsap.quickTo(m, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });
    m.addEventListener("mousemove", (e) => { const r = m.getBoundingClientRect(); qx(0.35 * (e.clientX - (r.left + r.width / 2))); qy(0.35 * (e.clientY - (r.top + r.height / 2))); });
    m.addEventListener("mouseleave", () => { qx(0); qy(0); });
  });
  document.querySelectorAll(".yf-btn").forEach((b) => {
    const c = b.querySelector(".yf-btn__circle");
    if (!c) return;
    const tl = gsap.timeline({ paused: true })
      .to(c, { top: "-25%", width: "150%", duration: 0.4, ease: "power3.in" }, "enter")
      .to(c, { top: "-150%", width: "125%", duration: 0.25 }, "exit");
    let t = null;
    b.addEventListener("mouseenter", () => { clearTimeout(t); tl.tweenFromTo("enter", "exit"); });
    b.addEventListener("mouseleave", () => { t = setTimeout(() => tl.play(), 300); });
  });

  /* ---------- Text Reveal ---------- */
  const reveal = (scope = document) => {
    // Line marker mask
    scope.querySelectorAll("[data-block]").forEach((el) => {
      const color = el.dataset.block || "var(--site-black)";
      const lines = SplitText.create(el, { type: "lines", linesClass: "yf-block-line__text" }).lines;
      const covers = lines.map((line) => {
        const wrap = document.createElement("span");
        wrap.className = "yf-block-line";
        line.before(wrap);
        wrap.append(line);
        const cover = document.createElement("span");
        cover.className = "yf-block-line__cover";
        cover.style.backgroundColor = color;
        wrap.append(cover);
        return cover;
      });
      if (reduce) return;
      gsap.set(lines, { opacity: 0 });
      const tl = gsap.timeline({ paused: true, delay: Number(el.dataset.delay || 0) });
      covers.forEach((cv, i) => tl.add(gsap.timeline()
        .set(cv, { scaleX: 0, transformOrigin: "left center" })
        .to(cv, { scaleX: 1, duration: 0.75, ease: "power4.inOut" })
        .set(lines[i], { opacity: 1 })
        .set(cv, { transformOrigin: "right center" })
        .to(cv, { scaleX: 0, duration: 0.75, ease: "power4.inOut" }), i * 0.15));
      if (el.hasAttribute("data-now")) tl.play();
      else ScrollTrigger.create({ trigger: el, start: "top 85%", toggleActions: "restart none none reset", animation: tl });
    });
    // Lines and words rise from under a mask (.75s power3.out), and the tags inside spring with elasticity
    scope.querySelectorAll("[data-copy]").forEach((el) => {
      const callouts = [...el.querySelectorAll(".yf-callout")];
      callouts.forEach((c) => c.remove());
      const mode = el.dataset.copy || "lines";
      const s = SplitText.create(el, { type: "lines, words", mask: mode === "words" ? "words" : "lines", linesClass: "yf-line" });
      callouts.forEach((c) => el.append(c));
      if (reduce) { gsap.set(callouts, { scale: 1 }); return; }
      const parts = mode === "words" ? s.words : s.lines;
      gsap.set(parts, { yPercent: 100 });
      const tl = gsap.timeline({ paused: true, delay: el.hasAttribute("data-intro") ? yf.introDelay + Number(el.dataset.delay || 0) : Number(el.dataset.delay || 0) })
        .to(parts, { yPercent: 0, duration: 0.75, ease: "power3.out", stagger: Number(el.dataset.stagger || 0.1) });
      if (callouts.length) tl.to(callouts, { scale: 1, duration: 1, ease: "elastic.out(1, 0.45)", stagger: 0.08 }, "-=0.55");
      if (el.hasAttribute("data-intro")) tl.play();
      else ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => tl.play() });
    });
    // Letters flicker on in shuffled order
    scope.querySelectorAll("[data-scramble]").forEach((el) => {
      if (reduce) return;
      const chars = SplitText.create(el, { type: "chars" }).chars;
      gsap.set(chars, { opacity: 0 });
      gsap.to(chars, { opacity: 1, duration: 0.05, ease: "power2.inOut", stagger: { amount: 0.5, from: "random" }, delay: yf.introDelay + Number(el.dataset.delay || 0.125) });
    });
  };

  /* ---------- Dot-letter footer wordmark + speech bubble ----------
     Reads the wordmark down to one dot per 11px cell, and stamps random characters (10px monospace, 11×12 cell) on lit cells and the cell to their right.
     Characters within 10 cells of the cursor are pushed away up to (1 - distance/10)×7 cells (each cell follows by .1). Each press runs scatter (±10 cells, .075) → fall (gravity .05, bounce -.25) → return (.05) in order. Below 1000px it becomes a whole-text logo. */
  const visual = document.querySelector(".yf-footer__visual");
  const cv = visual?.querySelector(".yf-ascii");
  if (cv) {
    const ctx = cv.getContext("2d");
    const word = cv.dataset.word || "WORDMARK";
    const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const CELL = 11, GW = 11, GH = 12, RATIO = 668 / 318;
    const wide = matchMedia("(min-width: 1000px)");
    const state = { phase: "logo", col: -999, row: -999 };
    let sprite = null, dpr = 0, p = null, W = 0, H = 0, raf = 0, seen = false;
    const css = (v) => getComputedStyle(root).getPropertyValue(v).trim();
    const makeSprite = () => {
      const sw = Math.ceil(GW * dpr), sh = Math.ceil(GH * dpr);
      const c = document.createElement("canvas");
      c.width = sw * CHARS.length; c.height = sh;
      const g = c.getContext("2d");
      g.setTransform(sw / GW, 0, 0, sh / GH, 0, 0);
      g.font = `10px ${css("--kf-font-mono")}`;
      g.textBaseline = "top";
      g.textAlign = "center";
      g.fillStyle = css("--kf-accent");
      [...CHARS].forEach((ch, i) => g.fillText(ch, GW * i + 4, 0));
      sprite = { c, sw, sh };
    };
    // The wordmark shrunk to cell size — only opaque cells are read, so the fill color does not matter
    const sample = (cols, rows) => {
      const g = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
      g.canvas.width = cols; g.canvas.height = rows;
      const lw = W, lh = W / RATIO, top = (H - lh) / 2;
      g.font = `100px ${css("--kf-font-display")}`;
      const size = Math.min((100 * lw * 0.92) / g.measureText(word).width, lh * 0.95);
      g.font = `${size / CELL}px ${css("--kf-font-display")}`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(word, lw / 2 / CELL, (top + lh / 2) / CELL);
      const d = g.getImageData(0, 0, cols, rows).data;
      const span = cols + 1, on = new Uint8Array(span * rows);
      let count = 0;
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        if (d[(y * cols + x) * 4 + 3] / 255 <= 0.5) continue;
        const k = y * span + x;
        if (!on[k]) on[k] = 1, count++;
        if (!on[k + 1]) on[k + 1] = 1, count++;
      }
      const q = { count, rows, col: new Uint16Array(count), row: new Uint16Array(count), glyph: new Uint8Array(count), x: new Float32Array(count), y: new Float32Array(count), vy: new Float32Array(count), wait: new Uint8Array(count), sx: new Float32Array(count), sy: new Float32Array(count) };
      let i = 0;
      for (let y = 0; y < rows; y++) for (let x = 0; x < span; x++) if (on[y * span + x]) {
        q.col[i] = x; q.row[i] = y; q.glyph[i] = Math.floor(Math.random() * CHARS.length);
        q.sx[i] = (Math.random() - 0.5) * 20; q.sy[i] = (Math.random() - 0.5) * 20; i++;
      }
      return q;
    };
    const step = () => {
      let moving = false, back = state.phase === "returning";
      for (let e = 0; e < p.count; e++) {
        if (p.wait[e] > 0) { p.wait[e]--; moving = true; back = false; continue; }
        if (state.phase === "scattered") {
          p.x[e] += (p.sx[e] - p.x[e]) * 0.075; p.y[e] += (p.sy[e] - p.y[e]) * 0.075;
          if (Math.abs(p.sx[e] - p.x[e]) > 0.01 || Math.abs(p.sy[e] - p.y[e]) > 0.01) moving = true;
        } else if (state.phase === "fallen") {
          const floor = p.rows - 1 - p.row[e];
          p.vy[e] += 0.05; p.y[e] += p.vy[e];
          if (p.y[e] > floor) p.y[e] = floor, p.vy[e] *= -0.25;
          if (p.y[e] < floor || Math.abs(p.vy[e]) > 0.05) moving = true;
        } else if (back) {
          p.x[e] -= 0.05 * p.x[e]; p.y[e] -= 0.05 * p.y[e];
          if (Math.abs(p.x[e]) > 0.05 || Math.abs(p.y[e]) > 0.05) back = false;
          moving = true;
        } else {
          let tx = 0, ty = 0;
          const dx = p.col[e] - state.col, dy = p.row[e] - state.row, d2 = dx * dx + dy * dy;
          if (d2 < 100 && d2 > 0) { const d = Math.sqrt(d2), k = (1 - d / 10) * 7; tx = (dx / d) * k; ty = (dy / d) * k; }
          p.x[e] += (tx - p.x[e]) * 0.1; p.y[e] += (ty - p.y[e]) * 0.1;
          if (Math.abs(tx - p.x[e]) > 0.01 || Math.abs(ty - p.y[e]) > 0.01) moving = true;
        }
      }
      if (back) state.phase = "logo";
      return moving;
    };
    const paint = () => {
      ctx.clearRect(0, 0, W, H);
      for (let e = 0; e < p.count; e++) ctx.drawImage(sprite.c, p.glyph[e] * sprite.sw, 0, sprite.sw, sprite.sh, (p.col[e] + p.x[e]) * CELL, (p.row[e] + p.y[e]) * CELL, GW, GH);
    };
    const frame = () => {
      raf = 0;
      if (!p) return;
      const moving = step();
      paint();
      if (moving && seen) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf && seen && p) raf = requestAnimationFrame(frame); };
    const build = (force) => {
      const w = visual.clientWidth, h = visual.clientHeight;
      if (!force && w === W && h === H) return;
      W = w; H = h; p = null;
      if (!wide.matches) return;
      const cols = Math.floor(W / CELL), rows = Math.floor(H / CELL);
      if (!cols || !rows) return;
      const r = devicePixelRatio || 1;
      if (r !== dpr) { dpr = r; makeSprite(); }
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      p = sample(cols, rows);
      state.phase = "logo";
      paint();
      kick();
    };
    let wait = 0;
    new ResizeObserver(() => { clearTimeout(wait); wait = setTimeout(build, 100); }).observe(visual);
    new IntersectionObserver(([e]) => { seen = e.isIntersecting; kick(); }).observe(visual);
    document.fonts.ready.then(() => build(true));

    // Speech bubble: follows to the cursor position (+10, -14) by .18 each time, hides while moving, and pops out when stopped for 140ms
    const bubble = visual.querySelector(".yf-bubble");
    const inner = bubble.querySelector(".yf-bubble__in");
    const b = { x: 0, y: 0, tx: 0, ty: 0, placed: false };
    let braf = 0, show = 0;
    const follow = () => {
      braf = 0;
      const dx = b.tx - b.x, dy = b.ty - b.y;
      b.x += 0.18 * dx; b.y += 0.18 * dy;
      bubble.style.transform = `translate3d(${b.x}px, ${b.y}px, 0)`;
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) braf = requestAnimationFrame(follow);
    };
    const visible = (v) => (bubble.dataset.visible = v ? "true" : "false");
    visual.addEventListener("mousemove", (e) => {
      const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      state.col = x / CELL; state.row = y / CELL;
      b.tx = x + 10; b.ty = y - 14;
      if (!b.placed) b.x = b.tx, b.y = b.ty, b.placed = true;
      if (!braf) braf = requestAnimationFrame(follow);
      visible(false);
      clearTimeout(show);
      show = setTimeout(() => visible(true), 140);
      if (state.phase === "logo") kick();
    });
    visual.addEventListener("mouseleave", () => {
      state.col = state.row = -999;
      clearTimeout(show);
      visible(false);
      b.placed = false;
      if (state.phase === "logo") kick();
    });
    visual.addEventListener("click", () => {
      inner.animate([{ transform: "translateY(-100%) scale(1)" }, { transform: "translateY(-100%) scale(0.82)", offset: 0.35 }, { transform: "translateY(-100%) scale(1)" }], { duration: 320, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" });
      if (!p) return;
      const next = { logo: "scattered", scattered: "fallen", fallen: "returning" }[state.phase];
      if (!next) return;
      state.phase = next;
      if (next === "fallen") p.vy.fill(0);
      else for (let e = 0; e < p.count; e++) p.wait[e] = Math.floor(18 * Math.random());
      kick();
    });
  }

  // Build the scene once, after the font loads — line splitting depends on font width
  document.fonts.ready.then(() => {
    const mm = gsap.matchMedia();
    reveal();
    yf.scenes.forEach((fn) => fn(mm));
    ScrollTrigger.refresh();
  });
})();
