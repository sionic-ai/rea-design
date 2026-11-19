// Motion shared by all pages — loader (logo O drops), hiding logo, inversion over ink-colored sections, menu button entrance, line-chunk titles,
// Dot grid canvas, two band marquees, sticker stamping over menu and footer, footer ball sliding, cookie card, contact magnetic button, FAQ show more.
// Bubble menu · talking cursor · sticker drag · card direction cover are attached by the _fx part.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  if (window.Draggable) gsap.registerPlugin(Draggable);
  if (window.InertiaPlugin) gsap.registerPlugin(InertiaPlugin);
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const desk = () => matchMedia("(min-width: 1025px)").matches;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------- Loader: logo over a white curtain (transparent on the home page), after .3s the O bounces from −200 to +230 for .9s, shadow flattens .27s twice, stays .6s and lifts at .4s ----------
  const loader = document.querySelector(".as-loader");
  const done = () => document.dispatchEvent(new CustomEvent("as:ready"));
  if (loader) {
    const y = scrollY;
    root.classList.add("is-locked");
    const unlock = () => { root.classList.remove("is-locked"); scrollTo(0, y); };
    if (reduce) { loader.remove(); unlock(); done(); }
    else {
      const o = loader.querySelector("[data-drop]"), sh = loader.querySelector("[data-shadow]");
      gsap.set([o, sh], { opacity: 0 });
      gsap.set(o, { y: -200 });
      gsap.set(sh, { scaleX: 1, transformOrigin: "center" });
      const hide = () => { loader.classList.add("is-gone"); setTimeout(() => { loader.remove(); unlock(); done(); }, 300); };
      gsap.timeline({ defaults: { ease: "power2.out" }, onComplete: hide })
        .set(".as-loader__logo", { opacity: 1 })
        .to(loader, { backgroundColor: "transparent", duration: 0.4 }, "+=0.3")
        .to([o, sh], { opacity: 1, duration: 0.2 }, "<")
        .to(o, { y: 230, duration: 0.9, ease: "bounce.out" }, "<")
        .to(sh, { scaleX: 0.7, opacity: 0.4, duration: 0.27, yoyo: true, repeat: 1 }, "<")
        .to({}, { duration: 0.6 })
        .to([o, sh, ".as-loader__logo"], { opacity: 0, duration: 0.4, ease: "power2.inOut" });
    }
  } else done();

  // ---------- Header: scrolling down past 20px turns the logo into a cloud, and below 200px, scrolling down more than 8px hides it while scrolling up shows it. The menu button row inverts over a dark section ----------
  const head = document.querySelector(".as-head");
  if (head) {
    let lastY = scrollY, ticking = false;
    const upd = () => {
      const yy = scrollY, d = yy - lastY;
      head.classList.toggle("is-stuck", yy > 20);
      if (yy < 200) head.classList.remove("is-hidden");
      else if (d > 8) head.classList.add("is-hidden");
      else if (d < -8) head.classList.remove("is-hidden");
      if (Math.abs(d) > 8 || yy < 200) lastY = yy;
      ticking = false;
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    const burger = head.querySelector(".as-burger");
    if (burger && !reduce && desk()) gsap.fromTo(burger, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 1.3, ease: "power3.out" });
    const darks = $$("[data-dark]");
    if (darks.length) {
      let io = null;
      const on = new Set();
      const build = () => {
        io?.disconnect(); on.clear();
        const r = (burger || head).getBoundingClientRect();
        const line = Math.round(r.top + r.height / 2);
        io = new IntersectionObserver((es) => {
          es.forEach((e) => (e.isIntersecting ? on.add(e.target) : on.delete(e.target)));
          document.body.classList.toggle("is-over-dark", on.size > 0);
        }, { rootMargin: `-${line}px 0px -${Math.max(innerHeight - line - 1, 0)}px 0px`, threshold: 0 });
        darks.forEach((d) => io.observe(d));
      };
      let t; addEventListener("resize", () => { clearTimeout(t); t = setTimeout(build, 150); }, { passive: true });
      build();
    }
  }

  // ---------- Title: each line chunk rises from 30px below in .5s, .1s later than the previous — once when visible (20%, minus 10% at the bottom). With data-delay, that long after load ----------
  const titles = $$(".as-title");
  titles.forEach((t) => $$(":scope > span", t).forEach((s, i) => (s.style.transitionDelay = `${i * 0.1}s`)));
  const showTitle = (t) => {
    t.classList.add("is-in");
    const spans = $$(":scope > span", t), lastSpan = spans[spans.length - 1];
    lastSpan?.addEventListener("transitionend", function clean(e) { if (e.propertyName !== "transform") return; spans.forEach((s) => (s.style.transitionDelay = "")); lastSpan.removeEventListener("transitionend", clean); });
  };
  if (reduce) titles.forEach((t) => t.classList.add("is-in"));
  else {
    const io = new IntersectionObserver((es, obs) => es.forEach((e) => { if (!e.isIntersecting) return; obs.unobserve(e.target); showTitle(e.target); }), { threshold: 0.2, rootMargin: "0px 0px -10% 0px" });
    titles.forEach((t) => (t.dataset.delay ? setTimeout(() => requestAnimationFrame(() => showTitle(t)), +t.dataset.delay) : io.observe(t)));
    // Small images inside the title (globe, rocket) come in after 2s from .3x, −40px, −8° with a .9s bounce at .18s intervals
    const pops = $$(".as-title[data-delay] .as-icon");
    if (pops.length) { gsap.set(pops, { scale: 0.3, y: -40, rotate: -8, opacity: 0, transformOrigin: "center bottom" }); gsap.to(pops, { scale: 1, y: 0, rotate: 0, opacity: 1, duration: 0.9, ease: "bounce.out", delay: 2, stagger: { each: 0.18, from: "start" } }); }
  }

  // ---------- Dot grid: 28+4px cells, 10% of dots breathe in lime on a 4s cycle at 1.3x. When visible they spread over 1s starting .8s later (30fps) ----------
  // Skin variables are oklch so computed values also come out oklch — paint onto a one-cell canvas and read as rgb
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgb = (name) => { const p = document.createElement("i"); p.style.color = `var(${name})`; document.body.appendChild(p); const c = getComputedStyle(p).color; p.remove(); probe.clearRect(0, 0, 1, 1); probe.fillStyle = c; probe.fillRect(0, 0, 1, 1); return [...probe.getImageData(0, 0, 1, 1).data].slice(0, 3); };
  $$(".as-dots").forEach((sec) => {
    const cv = document.createElement("canvas");
    sec.prepend(cv);
    const ctx = cv.getContext("2d");
    const cfg = { size: 4, gap: 28, frac: 0.1, pulse: 4000, delay: 800, reveal: 1000 };
    let base, act, w, h, dots = [], raf = 0, t0 = 0, live = false, made = false, lastDraw = 0, wait = 0;
    const grid = () => {
      base = rgb("--site-dot"); act = rgb("--site-lime");
      const r = sec.getBoundingClientRect(), dpr = devicePixelRatio || 1;
      w = r.width; h = r.height; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cell = cfg.size + cfg.gap, cols = Math.floor(w / cell), rows = Math.floor(h / cell);
      const sx = (w - (cols - 1) * cell) / 2, sy = (h - (rows - 1) * cell) / 2;
      dots = [];
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) dots.push({ x: sx + x * cell, y: sy + y * cell, ph: Math.random() * Math.PI * 2, on: Math.random() < cfg.frac });
    };
    const draw = (now) => {
      if (!live) return;
      raf = requestAnimationFrame(draw);
      if (now - lastDraw < 33) return;
      lastDraw = now;
      ctx.clearRect(0, 0, w, h);
      if (!t0) t0 = now;
      const rev = reduce ? 1 : Math.min((now - t0) / cfg.reveal, 1), n = Math.floor(dots.length * rev);
      ctx.globalAlpha = rev;
      const bs = `rgb(${base[0]},${base[1]},${base[2]})`;
      for (let i = 0; i < n; i++) {
        const d = dots[i]; let s = cfg.size;
        ctx.beginPath();
        if (d.on && !reduce) {
          const tt = (now / cfg.pulse + d.ph / (2 * Math.PI)) % 1, k = 0.5 - Math.cos(tt * 2 * Math.PI) / 2;
          s *= 1 + 0.3 * k;
          ctx.fillStyle = `rgb(${Math.round(base[0] + (act[0] - base[0]) * k)},${Math.round(base[1] + (act[1] - base[1]) * k)},${Math.round(base[2] + (act[2] - base[2]) * k)})`;
        } else ctx.fillStyle = bs;
        ctx.arc(d.x, d.y, s / 2, 0, Math.PI * 2); ctx.fill();
      }
    };
    let rt; new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(() => made && grid(), 150); }).observe(sec);
    new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) {
        if (!made) { grid(); made = true; wait = setTimeout(() => { wait = 0; live = true; t0 = performance.now(); raf = requestAnimationFrame(draw); }, cfg.delay); }
        else if (!wait) { live = true; raf = requestAnimationFrame(draw); }
      } else { live = false; cancelAnimationFrame(raf); if (wait) { clearTimeout(wait); wait = 0; made = false; } }
    }), { rootMargin: "150px" }).observe(sec);
  });

  // ---------- Dark strip marquee: text stretched to four copies, -25% over (one copy width/36)s — runs only while visible ----------
  const runIO = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("is-run", e.isIntersecting)), { rootMargin: "150px 0px" });
  $$(".as-ticker__run").forEach((run) => {
    const one = run.scrollWidth;
    run.style.setProperty("--dur", `${one / 36}s`);
    run.innerHTML = Array(4).fill(run.innerHTML.trim()).join(" ");
    if (!reduce) runIO.observe(run);
  });

  // ---------- Tilted band: one set in 20s, at a speed (.5~2.5) with scroll speed (px/ms)×4 added — the speed cools by .9× per frame ----------
  const tilts = $$(".as-tilt");
  if (tilts.length && !reduce) {
    let vel = 0, lastY = scrollY, lastT = performance.now(), busy = false;
    addEventListener("scroll", () => { if (busy) return; busy = true; requestAnimationFrame(() => { const now = performance.now(); vel = (scrollY - lastY) / (now - lastT || 1); lastY = scrollY; lastT = now; busy = false; }); }, { passive: true });
    gsap.ticker.add(() => { vel *= 0.9; });
    const io = new IntersectionObserver((es) => es.forEach((e) => { const b = e.target; if (e.isIntersecting) { b._anim?.play(); b._tick && gsap.ticker.add(b._tick); } else { b._anim?.pause(); b._tick && gsap.ticker.remove(b._tick); } }), { rootMargin: "150px 0px" });
    tilts.forEach((band) => {
      const track = band.querySelector(".as-tilt__track");
      track.append(...[...track.childNodes].map((n) => n.cloneNode(true)));
      requestAnimationFrame(() => {
        const dist = track.scrollWidth / 2;
        band._anim = gsap.to(track, { x: -dist, duration: 20, ease: "none", repeat: -1, paused: true, modifiers: { x: gsap.utils.unitize((x) => parseFloat(x) % -dist) } });
        band._tick = () => { const f = gsap.utils.clamp(0.5, 2.5, 1 + vel * 4); if (band._anim.timeScale() !== f) band._anim.timeScale(f); };
        io.observe(band);
      });
    });
  }

  // ---------- Sticker stamping: moving over the panel places one at the cursor every .16s — .6x and rotateX −25° with .8s back.out(1.6), fades out at 1s over .6s ----------
  const stickerIds = ["as-st-star", "as-st-bolt", "as-st-heart", "as-st-smile", "as-st-rocket", "as-st-ok"];
  let lastStamp = 0;
  const stamp = (e) => {
    const now = Date.now();
    if (now - lastStamp < 160 || e.target.closest('a, button, [role="button"]')) return;
    lastStamp = now;
    const el = document.createElement("div");
    el.className = "as-stamp";
    el.innerHTML = `<svg viewBox="0 0 200 200" aria-hidden="true"><use href="#${stickerIds[Math.floor(Math.random() * stickerIds.length)]}"/></svg>`;
    const size = Math.max(200, Math.min(innerWidth * 0.12, 260) + gsap.utils.random(-30, 30));
    Object.assign(el.style, { left: `${e.clientX}px`, top: `${e.clientY}px`, width: `${size}px` });
    document.body.appendChild(el);
    gsap.fromTo(el, { opacity: 0, scale: 0.6, rotateX: -25, rotateZ: gsap.utils.random(-10, 10), transformOrigin: "center bottom" }, { opacity: 1, scale: 1, rotateX: 0, duration: 0.8, ease: "back.out(1.6)" });
    gsap.to(el, { opacity: 0, scale: 0.5, rotateX: 30, duration: 0.6, ease: "power2.in", delay: 1, onComplete: () => el.remove() });
  };
  if (fine && !reduce) {
    $$("[data-stamp]").forEach((z) => z.addEventListener("mousemove", stamp, { passive: true }));
    const panel = document.querySelector(".as-menu [data-fx-part='panel']");
    panel?.addEventListener("mousemove", (e) => { if (!panel.hidden) stamp(e); }, { passive: true });
  }

  // ---------- Footer: when 10% visible, the cloud slides to −50px from the right edge with 1.4s elastic.out(1, .35), and on contact swaps to a smiling ball in .3s ----------
  const foot = document.querySelector(".as-foot");
  if (foot) {
    new IntersectionObserver(([e]) => document.body.classList.toggle("is-foot", e.isIntersecting), { threshold: 0 }).observe(foot);
    const ball = foot.querySelector(".as-foot__ball"), box = foot.querySelector(".as-foot__panel");
    if (ball && box) {
      const io = new IntersectionObserver((es) => {
        if (!es[0].isIntersecting) return;
        io.disconnect();
        const max = Math.max(box.getBoundingClientRect().right - ball.getBoundingClientRect().right - 50, 0);
        if (reduce) { gsap.set(ball, { x: max }); foot.classList.add("is-landed"); return; }
        gsap.to(ball, { x: max, duration: 1.4, ease: "elastic.out(1, 0.35)", onComplete: () => foot.classList.add("is-landed") });
      }, { threshold: 0.1 });
      io.observe(foot);
    }
  }

  // ---------- Cookie card: choosing makes it vanish at once, and viewing settings expands the items ----------
  $$(".as-cookie [data-close]").forEach((b) => b.addEventListener("click", () => b.closest(".as-cookie").classList.add("is-gone")));
  $$(".as-cookie [data-pref]").forEach((b) => b.addEventListener("click", () => b.closest(".as-cookie").classList.add("is-pref")));

  // ---------- Contact button: inside the area it is pulled by .5 of the cursor offset (from center) in .4s power2.out, on leave .7s elastic.out(1, .4) ----------
  if (fine && !reduce) $$("[data-magnet-zone]").forEach((zone) => {
    const btn = zone.querySelector("[data-magnet]");
    if (!btn) return;
    zone.addEventListener("mousemove", (e) => {
      const r = zone.getBoundingClientRect();
      const x = gsap.utils.mapRange(r.left, r.right, -r.width / 2, r.width / 2, e.clientX), y = gsap.utils.mapRange(r.top, r.bottom, -r.height / 2, r.height / 2, e.clientY);
      gsap.to(btn, { x: x * 0.5, y: y * 0.5, duration: 0.4, ease: "power2.out", overwrite: "auto" });
    });
    zone.addEventListener("mouseleave", () => gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)", overwrite: "auto" }));
  });

  // ---------- FAQ: over five items shows ”Show more” — opening staggers .06s apart from 14px below in .45s, closing retracts in .3s and returns to the top ----------
  $$("[data-faq]").forEach((faq) => {
    const items = $$(":scope > details", faq);
    const btn = faq.parentElement.querySelector("[data-faq-more]");
    if (items.length <= 5 || !btn) { btn?.remove(); return; }
    let busy = false;
    btn.addEventListener("click", () => {
      if (busy) return;
      if (!faq.classList.contains("is-more")) { faq.classList.add("is-more"); btn.textContent = btn.dataset.less; btn.setAttribute("aria-expanded", "true"); return; }
      busy = true; faq.classList.add("is-closing");
      setTimeout(() => { faq.classList.remove("is-more", "is-closing"); btn.textContent = btn.dataset.more; btn.setAttribute("aria-expanded", "false"); items.slice(5).forEach((d) => d.removeAttribute("open")); faq.scrollIntoView({ behavior: "smooth", block: "start" }); busy = false; }, 300);
    });
  });

  // ---------- Horizontal row cards: on wide screens (1250px+) the wheel is taken as horizontal scroll ----------
  $$("[data-hwheel]").forEach((row) => row.addEventListener("wheel", (e) => {
    if (!matchMedia("(min-width: 1250px)").matches || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    const prev = row.scrollLeft; row.scrollLeft += e.deltaY;
    if (row.scrollLeft !== prev) e.preventDefault();
  }, { passive: false }));

  // ---------- One-time rising card group: when visible, from 40px · .98 over .8s, items appearing together .08s apart ----------
  const riseIO = new IntersectionObserver((es, obs) => {
    let k = 0;
    es.forEach((e) => { if (!e.isIntersecting) return; const el = e.target; if (k) el.style.transitionDelay = `${k * 0.08}s`; el.classList.add("is-in"); el.addEventListener("transitionend", () => (el.style.transitionDelay = ""), { once: true }); obs.unobserve(el); k++; });
  }, { rootMargin: "0px 0px -15% 0px" });
  $$("[data-rise]").forEach((el) => (reduce ? el.classList.add("is-in") : riseIO.observe(el)));

  // ---------- Mouse tracking (page builder motion fx mouseTrack): the cursor position on screen (%) − 50 times the speed in px, moving the opposite way (the same way if negative) ----------
  // Follows only what is visible, like a page builder — if the original scrolls down and the head sticker is out of view, moving the cursor changes nothing
  const trackers = $$("[data-mouse-track]");
  if (trackers.length && fine && !reduce) {
    let busyT = false;
    const shown = new Set();
    const tio = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? shown.add(e.target) : shown.delete(e.target))));
    trackers.forEach((el) => tio.observe(el));
    addEventListener("mousemove", (e) => {
      if (busyT) return; busyT = true;
      requestAnimationFrame(() => {
        const px = (e.clientX / innerWidth) * 100 - 50, py = (e.clientY / innerHeight) * 100 - 50;
        shown.forEach((el) => { const k = (parseFloat(el.dataset.mouseTrack) || 0) * (el.dataset.mouseDir === "negative" ? 1 : -1); el.style.transform = `translate(${(px * k).toFixed(1)}px, ${(py * k).toFixed(1)}px)`; });
        busyT = false;
      });
    }, { passive: true });
  }

  // ---------- Hand-drawn arrow: drawn from the left while passing screen 80% → 50% ----------
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    $$("[data-draw]").forEach((svg) => gsap.fromTo(svg, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", ease: "none", scrollTrigger: { trigger: svg, start: "top 80%", end: "top 50%", scrub: true, invalidateOnRefresh: true } }));
  });
})();
