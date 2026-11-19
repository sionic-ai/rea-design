// Motion shared by all pages: load fade · is-show when visible · is-fixed once halfway down (PAGE TOP · black MENU) · is-light when a light panel is 70% or more ·
// Draggable flow strip (original marquee value s/px), a label that scrambles as it changes, and a paint-drip menu.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  // The original loads only Draggable and not InertiaPlugin — inertia: true does nothing, so on release it flows again from that spot
  gsap.registerPlugin(ScrollTrigger, Draggable);

  /* ── When visible is-show (once), when on screen is-inview ── */
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    e.target.classList.toggle("is-inview", e.isIntersecting);
    if (e.isIntersecting) e.target.classList.add("is-show");
  }), { rootMargin: "-100px 0px" });
  document.querySelectorAll("[data-inview]").forEach((el) => io.observe(el));
  document.querySelectorAll(".kn-step").forEach((g) => [...g.children].forEach((c, i) => c.style.setProperty("--i", i)));

  const fixed = () => body.classList.toggle("is-fixed", scrollY > innerHeight / 2);
  addEventListener("scroll", fixed, { passive: true });

  // When a light panel (body·footer) covers 70% or more of the screen, the white MENU turns black
  const lit = new Set();
  const lightIo = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.rootBounds) return;
      e.intersectionRect.height / e.rootBounds.height >= 0.7 ? lit.add(e.target) : lit.delete(e.target);
    });
    body.classList.toggle("is-light", lit.size > 0);
  }, { threshold: Array.from({ length: 101 }, (_, i) => i / 100) });
  document.querySelectorAll("[data-light]").forEach((el) => lightIo.observe(el));

  /* ── Flow band: runs for loop length (px) × speed (s/px), and winds or unwinds as it is dragged ── */
  const marquee = (root) => {
    const track = root.querySelector(".kn-slider__track");
    const base = [...track.children];
    const speedOf = () => {
      const w = innerWidth, d = root.dataset;
      return +(w <= 640 && d.speedSp ? d.speedSp : w <= 834 && d.speedTab ? d.speedTab : d.speed || 0.003);
    };
    const dir = root.dataset.direction === "right" ? 1 : -1;
    let anim, items, total;
    const build = () => {
      const prev = anim ? anim.progress() : 0;
      anim?.kill();
      track.querySelectorAll("[data-clone]").forEach((c) => c.remove());
      const baseW = base.reduce((s, el) => s + el.getBoundingClientRect().width, 0);
      const need = Math.ceil((root.getBoundingClientRect().width * 2) / baseW);
      for (let i = 0; i < need; i++) base.forEach((n) => { const c = n.cloneNode(true); c.dataset.clone = "1"; c.setAttribute("aria-hidden", "true"); track.append(c); });
      items = [...track.children];
      let x = 0, h = 0;
      items.forEach((el) => { gsap.set(el, { x }); x += el.getBoundingClientRect().width; h = Math.max(h, el.offsetHeight); });
      total = x;
      track.style.height = h + "px";
      const wrap = gsap.utils.wrap(0, total);
      anim = gsap.to(items, { x: (dir < 0 ? "-=" : "+=") + total, duration: Math.max(0.1, total * speedOf()), ease: "none", repeat: -1, paused: true, modifiers: { x: (v) => wrap(parseFloat(v)) + "px" } });
      anim.progress(prev);
      if (!reduce) anim.play();
    };
    build();
    let rt;
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(build, 200); });
    const proxy = document.createElement("div");
    const step = function () { if (total) anim.progress(gsap.utils.wrap(0, 1, anim.progress() + (this.deltaX * dir) / total)); };
    Draggable.create(proxy, {
      type: "x", trigger: root, inertia: true,
      onPress: () => anim.pause(), onDrag: step, onThrowUpdate: step,
      onRelease: () => !reduce && anim.play(), onThrowComplete: () => !reduce && anim.play(),
    });
  };
  addEventListener("load", () => document.querySelectorAll(".kn-slider").forEach(marquee), { once: true });

  /* ── Shuffling label: every 4s scatters into random letters for .8s then settles into the new words from the front ── */
  const WORDS = (window.KN_WORDS || ["LABEL"]);
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ_@#$%^&*+-=/?";
  document.querySelectorAll(".kn-shuffle").forEach((el) => {
    let k = (Math.random() * WORDS.length) | 0;
    el.textContent = WORDS[k];
    if (reduce) return;
    const to = (next) => {
      const from = el.textContent, len = Math.max(from.length, next.length), t0 = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - t0) / 800), fix = Math.floor(len * t);
        let out = "";
        // If the new text is shorter, the leftover space is padded with blanks and then the trailing blanks are trimmed (original padTo·trimEnd)
        for (let i = 0; i < len; i++) { const c = next[i] ?? " "; out += i < fix || c === " " ? c : CHARS[(Math.random() * CHARS.length) | 0]; }
        el.textContent = out.trimEnd();
        t < 1 ? requestAnimationFrame(tick) : (el.textContent = next);
      };
      requestAnimationFrame(tick);
    };
    setInterval(() => to(WORDS[(k = (k + 1) % WORDS.length)]), 4000);
  });

  /* ── Paint menu: one stream per 70px, falling and swaying with simplex noise (the same simplex-noise 4.0.1 as the original).
     The original stops the water stream 40px below the screen and waits for it to pass 150px before switching to ”fully open”, but it never reaches there, so
     Even while open, the off-screen bottom edge keeps rippling and being drawn — leave it as is. When closed, it is withdrawn at 30px/frame ── */
  const canvas = document.querySelector(".kn-drip");
  const btn = document.querySelector(".kn-menu-trigger");
  if (canvas && btn) {
    const ctx = canvas.getContext("2d");
    const DIST = 70, FALL = 3, RETRACT = 30, WOBBLE = 15, POWER = 0.5, OVER = 150;
    const css = getComputedStyle(document.documentElement);
    const colors = ["--site-green", "--site-purple", "--site-yellow"].map((v) => css.getPropertyValue(v).trim());
    const noise2D = SimplexNoise.createNoise2D();
    let drips = [], amount = 0, raf = 0, state = "closed", t0 = 0, fill = colors[0];
    const size = () => {
      const dpr = Math.max(1, devicePixelRatio || 1), w = innerWidth, h = innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr; canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      amount = Math.floor(w / DIST) + 3;
      if (drips.length !== amount) drips = new Array(amount).fill(0);
      if (state === "open") { ctx.fillStyle = fill; ctx.fillRect(0, 0, w, h); }
    };
    const draw = (pts) => {
      ctx.beginPath(); ctx.fillStyle = fill; ctx.moveTo(0, 0); ctx.lineTo(pts[0].x, pts[0].y);
      let p = 1;
      for (; p < pts.length - 2; p++) ctx.quadraticCurveTo(pts[p].x, pts[p].y, (pts[p].x + pts[p + 1].x) / 2, (pts[p].y + pts[p + 1].y) / 2);
      ctx.quadraticCurveTo(pts[p].x, pts[p].y, pts[p + 1].x, pts[p + 1].y);
      ctx.lineTo(innerWidth, 0); ctx.closePath(); ctx.fill();
    };
    const render = (now) => {
      const h = innerHeight, time = (now - t0) / 1200;
      ctx.clearRect(0, 0, innerWidth, h);
      const progress = Math.min(Math.max(...drips) / h, 1), ease = Math.pow(progress, POWER);
      const pts = drips.map((d, i) => {
        const n = (noise2D(i * 0.15, time) + 1) * WOBBLE * (0.6 + progress);
        if (state === "opening") drips[i] = Math.min(h + 40, d + FALL * (0.25 + ease * 1.75) + n);
        else if (state === "closing") drips[i] = Math.max(0, d - (RETRACT + n * 0.6));
        return { x: DIST * i, y: drips[i] };
      });
      draw(pts);
      const max = Math.max(...drips);
      if (state === "opening" && max >= h + OVER) { state = "open"; ctx.fillRect(0, 0, innerWidth, h); raf = 0; return; }
      if (state === "closing" && max <= 0) { state = "closed"; canvas.classList.remove("is-active"); ctx.clearRect(0, 0, innerWidth, h); raf = 0; return; }
      raf = requestAnimationFrame(render);
    };
    const run = () => { if (!raf) { t0 = performance.now(); raf = requestAnimationFrame(render); } };
    const open = () => {
      fill = colors[(Math.random() * colors.length) | 0];
      canvas.classList.add("is-active");
      drips.fill(0);
      body.classList.add("is-menu-open");
      btn.setAttribute("aria-expanded", "true");
      if (reduce) { state = "open"; size(); return; }
      state = "opening"; run();
    };
    const close = () => {
      body.classList.remove("is-menu-open");
      btn.setAttribute("aria-expanded", "false");
      if (reduce) { state = "closed"; canvas.classList.remove("is-active"); ctx.clearRect(0, 0, innerWidth, innerHeight); return; }
      state = "closing"; run();
    };
    size();
    addEventListener("resize", size);
    btn.addEventListener("click", () => (state === "closed" || state === "closing" ? open() : close()));
    document.querySelectorAll("[data-menu-close]").forEach((el) => el.addEventListener("click", close));
    addEventListener("keydown", (e) => e.key === "Escape" && body.classList.contains("is-menu-open") && close());
  }

  document.querySelectorAll('a[href="#top"]').forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    gsap.to(document.scrollingElement, { scrollTop: 0, duration: reduce ? 0 : 0.4, ease: "sine.inOut" });
  }));

  addEventListener("load", () => { body.classList.add("is-loaded"); fixed(); ScrollTrigger.refresh(); }, { once: true });
})();
