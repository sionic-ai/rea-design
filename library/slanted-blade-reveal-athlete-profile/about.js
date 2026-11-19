/* Inside the field — values read from the original on-field bundle */
(() => {
  const JJ = window.JJ, reduce = JJ.reduce;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = (v, dec = 0) => v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

  // ── Hero video slot: a canvas spins a smoky purple-and-blue tunnel, and the R·B channels shift apart by the mouse intensity (original #crt-rgb filter) ──
  const video = $("[data-of-video]"), cv = $("[data-of-crt]"), cx = cv.getContext("2d");
  const imp = { v: 0, tx: 0, ty: 0, x: 0, y: 0 };
  let lastX = null, raf = 0;
  const C = { bg: JJ.color("--kf-bg"), a: JJ.color("--kf-accent"), s: JJ.color("--kf-accent-soft") };
  const draw = (t) => {
    const w = (cv.width = Math.round(innerWidth / 2)), h = (cv.height = Math.round(innerHeight / 2));
    imp.v *= 0.94;
    imp.x += (imp.tx - imp.x) * 0.06; imp.y += (imp.ty - imp.y) * 0.06;
    const shift = 1.5 + imp.v * 9;
    const layer = (col, dx) => {
      cx.globalCompositeOperation = "lighter";
      const g = cx.createRadialGradient(w * (0.5 + imp.x * 0.02) + dx, h * 0.45, h * 0.05, w * 0.5 + dx, h * 0.5, h * 0.9);
      g.addColorStop(0, col); g.addColorStop(1, "transparent");
      cx.fillStyle = g; cx.fillRect(0, 0, w, h);
      cx.fillStyle = col;
      const s = Math.sin(t / 700) * 6;
      cx.globalAlpha = 0.55;
      cx.beginPath(); cx.ellipse(w * 0.52 + dx + s, h * 0.42, w * 0.05, h * 0.12, 0.1, 0, 7); cx.fill();
      cx.beginPath(); cx.roundRect(w * 0.45 + dx + s, h * 0.5, w * 0.14, h * 0.5, 30); cx.fill();
      cx.globalAlpha = 1;
    };
    cx.globalCompositeOperation = "source-over";
    cx.fillStyle = C.bg; cx.fillRect(0, 0, w, h);
    layer(C.a, -shift);
    layer(C.s, shift);
    cx.globalCompositeOperation = "source-over";
    if (!reduce) raf = requestAnimationFrame(draw);
  };
  raf = requestAnimationFrame(draw);
  const hero = $("[data-of-hero]");
  hero.addEventListener("pointermove", (e) => {
    if (lastX != null) imp.v = Math.min(1, imp.v + Math.abs(e.clientX - lastX) / 42);
    lastX = e.clientX;
    imp.tx = (e.clientX / innerWidth - 0.5) * 3.6; imp.ty = (e.clientY / innerHeight - 0.5) * 2.4;
  });
  hero.addEventListener("pointerleave", () => { imp.tx = imp.ty = 0; lastX = null; });
  ScrollTrigger.create({ trigger: hero, start: "top top", end: "bottom top", onToggle: (s) => { if (s.isActive && !raf && !reduce) raf = requestAnimationFrame(draw); else if (!s.isActive) { cancelAnimationFrame(raf); raf = 0; } } });
  if (!reduce) {
    gsap.to(video, { scale: 1.07, duration: 22, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.set("[data-hero-mark]", { autoAlpha: 0, y: 36 });
    JJ.onReveal(() => gsap.to("[data-hero-mark]", { autoAlpha: 1, y: 0, duration: 1.1, ease: "power3.out", delay: 0.2 }));
  }

  // ── Sentence: each word fills in with scroll — first 40% in accent color, the rest in bone color ──
  const say = $("[data-say]"), words = say.textContent.trim().split(/\s+/);
  say.innerHTML = words.map((w, i) => `<span class="w${i >= words.length * 0.4 ? " is-late" : ""}">${w}</span>`).join(" ");
  const ws = $$(".w", say);
  if (reduce) ws.forEach((w) => w.classList.add("is-on"));
  else ScrollTrigger.create({ trigger: ".of-say", start: "top 60%", end: "bottom 80%", scrub: true, onUpdate: (s) => ws.forEach((w, i) => w.classList.toggle("is-on", i < s.progress * ws.length)) });

  // ── Season: each time it passes a year tick the four numbers go to that year’s values in .55s power3.out (.1s delay) ──
  const stats = $$("[data-stats] b"), years = $$("[data-years] span"), curEl = $("[data-year-cur]");
  const vals = stats.map((b) => b.dataset.v.split(",").map(Number));
  const shownV = stats.map(() => ({ v: 0 }));
  let yi = -1;
  const setYear = (i) => {
    if (i === yi) return;
    yi = i;
    years.forEach((y, k) => y.classList.toggle("is-on", k === i));
    stats.forEach((b, k) => {
      const to = vals[k][i] || 0, dec = String(b.dataset.v.split(",")[0]).includes(".") ? 1 : 0;
      gsap.to(shownV[k], { v: to, duration: reduce ? 0 : 0.55, delay: reduce ? 0 : 0.1, ease: "power3.out", overwrite: true, onUpdate: () => (b.textContent = fmt(shownV[k].v, dec)) });
    });
  };
  setYear(0);
  ScrollTrigger.create({
    trigger: ".of-seasons", start: "top top", end: "bottom bottom",
    onUpdate: (s) => {
      const f = s.progress * (years.length - 1);
      setYear(Math.round(f));
      const a = years[0].offsetLeft + years[0].offsetWidth / 2, b = years[years.length - 1].offsetLeft + years[years.length - 1].offsetWidth / 2;
      curEl.style.transform = `translateX(${a + (b - a) * s.progress}px)`;
    },
  });

  // ── Number rolling: total yards 1.8s power2.out (at 70% visible), total four 1.6s power3.out · .08s stagger (60%) ──
  const roll = (el, to, dur, ease, delay = 0) => {
    const o = { v: 0 };
    if (reduce) return (el.textContent = fmt(to));
    el.textContent = fmt(0);
    gsap.to(o, { v: to, duration: dur, delay, ease, onUpdate: () => (el.textContent = fmt(Math.round(o.v))) });
  };
  const total = $("[data-total]");
  ScrollTrigger.create({ trigger: total, start: "top 70%", once: true, onEnter: () => roll(total, +total.dataset.total, 1.8, "power2.out") });

  // ── Career total number dot cloud: the number is sampled into a 4px grid of dots, and dots within 130px of the cursor are pushed outward up to 18px (.16 per frame) and glow (.2 · opacity .85).
  //    Dot radius 4×(.179+.057×light). Original TotalYards — absent with fingers or reduced motion ──
  if (!reduce && JJ.fine) {
    const sec = total.closest(".of-total"), cv = document.createElement("canvas"), g2 = cv.getContext("2d"), U = 4, R = 130;
    cv.setAttribute("aria-hidden", "true");
    cv.style.cssText = "position:absolute;pointer-events:none;z-index:2";
    sec.append(cv);
    let dots = [], W = 0, H = 0, raf = 0;
    const ptr = { x: -9999, y: -9999 };
    const sample = () => {
      const r = total.getBoundingClientRect(), s = sec.getBoundingClientRect(), cs = getComputedStyle(total), dpr = Math.min(2, devicePixelRatio || 1), pad = Math.round(r.height * 0.15);
      W = Math.max(10, Math.round(r.width)); H = Math.max(10, Math.round(r.height)) + 2 * pad;
      Object.assign(cv.style, { left: `${r.left - s.left}px`, top: `${r.top - s.top - pad}px`, width: `${W}px`, height: `${H}px` });
      cv.width = W * dpr; cv.height = H * dpr;
      const probe = document.createElement("span");
      probe.style.cssText = "display:inline-block;width:0;height:0;overflow:hidden";
      total.append(probe);
      const base = probe.getBoundingClientRect().bottom - r.top + pad;
      probe.remove();
      const off = document.createElement("canvas"), o = off.getContext("2d", { willReadFrequently: true }), str = fmt(+total.dataset.total);
      off.width = W; off.height = H;
      o.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; o.fillStyle = JJ.color("--kf-ink"); o.textBaseline = "alphabetic";
      const mw = o.measureText(str).width || W;
      o.save(); o.translate(W / 2, base); o.scale(W / mw, 1); o.textAlign = "center"; o.fillText(str, 0, 0); o.restore();
      const data = o.getImageData(0, 0, W, H).data;
      dots = [];
      for (let y = U / 2; y < H; y += U) for (let x = U / 2; x < W; x += U) if (data[(Math.round(y) * W + Math.round(x)) * 4 + 3] > 128) dots.push({ x, y, ox: 0, oy: 0, g: 0 });
    };
    const ink = JJ.color("--kf-ink");
    const draw = () => {
      raf = requestAnimationFrame(draw);
      g2.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0);
      g2.clearRect(0, 0, W, H);
      const buckets = new Array(15).fill(null);
      for (const d of dots) {
        let tx = 0, ty = 0, tg = 0;
        const dx = d.x - ptr.x, dy = d.y - ptr.y, s = Math.hypot(dx, dy);
        if (s < R && s > 0.001) { const a = 1 - s / R; tx = (dx / s) * a * 18; ty = (dy / s) * a * 18; tg = a; }
        d.ox += (tx - d.ox) * 0.16; d.oy += (ty - d.oy) * 0.16; d.g += (tg - d.g) * 0.2;
        const k = Math.round(0.85 * d.g * 14);
        if (k <= 0) continue;
        const rad = U * (0.179 + 0.057 * d.g), p = buckets[k] || (buckets[k] = new Path2D());
        p.moveTo(d.x + d.ox + rad, d.y + d.oy); p.arc(d.x + d.ox, d.y + d.oy, rad, 0, Math.PI * 2);
      }
      g2.fillStyle = ink;
      for (let k = 1; k <= 14; k++) if (buckets[k]) { g2.globalAlpha = k / 14; g2.fill(buckets[k]); }
      g2.globalAlpha = 1;
    };
    sec.addEventListener("pointermove", (e) => { const r = cv.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; });
    sec.addEventListener("pointerleave", () => { ptr.x = ptr.y = -9999; });
    new IntersectionObserver(([e]) => { cancelAnimationFrame(raf); raf = 0; if (e.isIntersecting) { sample(); raf = requestAnimationFrame(draw); } }, { rootMargin: "15% 0px" }).observe(sec);
    addEventListener("resize", () => raf && sample());
    document.fonts?.ready.then(() => raf && sample());
  }
  $$("[data-count]").forEach((el, i) => ScrollTrigger.create({ trigger: ".of-career__nums", start: "top 60%", once: true, onEnter: () => roll(el, +el.dataset.count, 1.6, "power3.out", 0.08 * i) }));
  const rows = $("[data-rows]");
  rows.innerHTML = Array.from({ length: 7 }, (_, i) => `<tr style="animation-delay:${0.06 * i}s"><td>${String(6 - i).padStart(4, "0")}</td><td>Team name</td><td>00</td><td>0,000</td><td>00.0</td><td>0</td><td>00</td><td>0</td><td>00.0</td></tr>`).join("");
  ScrollTrigger.create({ trigger: ".of-table", start: "top 80%", once: true, onEnter: () => $(".of-table").classList.add("is-in") });

  // ── Record card: click to bring it to the center, click the center card again to expand (height .42s power3.inOut · short text leaves in .16s power2.in · long text enters in .3s (delayed .1)) ──
  const recs = $$("[data-rec]");
  recs.forEach((r) => r.addEventListener("click", () => {
    if (!r.classList.contains("is-on")) {
      const open = recs.find((x) => x.classList.contains("is-on"));
      const more = open?.querySelector(".of-rec__more");
      if (more) { r.append(more); more.dataset.open = ""; gsap.set(more, { height: 28 }); gsap.set(more.querySelector(".is-s"), { autoAlpha: 1 }); gsap.set(more.querySelector(".is-f"), { autoAlpha: 0 }); }
      recs.forEach((x) => x.classList.toggle("is-on", x === r));
      return;
    }
    const more = r.querySelector(".of-rec__more");
    if (!more) return;
    const open = more.dataset.open !== "1";
    more.dataset.open = open ? "1" : "";
    const s = more.querySelector(".is-s"), f = more.querySelector(".is-f"), out = open ? s : f, inn = open ? f : s;
    if (reduce) { gsap.set(more, { height: open ? 80 : 28 }); gsap.set(out, { autoAlpha: 0 }); gsap.set(inn, { autoAlpha: 1 }); return; }
    gsap.to(more, { height: open ? 80 : 28, duration: 0.42, ease: "power3.inOut", overwrite: true });
    gsap.to(out, { autoAlpha: 0, duration: 0.16, ease: "power2.in", overwrite: true });
    gsap.to(inn, { autoAlpha: 1, duration: 0.3, delay: 0.1, ease: "power2.out", overwrite: true });
  }));

  // ── Pick a record: pressing a tab scatters cards downward (.3s, ±18°) then they spin above and settle again (.5s power3.out, .06s stagger) ──
  const tabs = $$("[data-rec-tabs] button");
  tabs.forEach((t) => t.addEventListener("click", () => {
    tabs.forEach((x) => x.classList.toggle("is-on", x === t));
    if (reduce) return;
    const cards = $$("[data-rec]");
    gsap.timeline()
      .to(cards, { y: 64, rotate: () => gsap.utils.random(-18, 18), opacity: 0, duration: 0.3, ease: "power2.in", stagger: 0.04 })
      .fromTo(cards, { y: -20, rotate: 17.5, opacity: 0 }, { y: 0, rotate: 0, opacity: 1, duration: 0.5, ease: "power3.out", stagger: 0.06, clearProps: "transform,opacity" });
  }));

  // ── Cleat rows: the name-tag strip and the cleat row flow in opposite directions per row (CSS animation, about.css) ──
  const TAGS = ["Your one-line phrase here", "Your short pledge here", "One and only", "Your football boots story here"];
  $$("[data-tag-row]").forEach((row) => {
    const one = TAGS.concat(TAGS).map((t, i) => `<span style="transform:rotate(${[-2, 1.5, -1, 2.5][i % 4]}deg)">${t}</span>`).join("");
    row.innerHTML = one + one;
  });
  $$("[data-cleat-row]").forEach((row, r) => {
    const one = Array.from({ length: 6 }, (_, i) => `<a class="of-cleat" href="#" aria-label="Soccer Shoes ${i + 1}" data-sfx><canvas width="520" height="360" data-art="cleat" data-label="${["Golden glow", "Purple", "White", "Silver light", "Red", "Blue"][i]} One soccer cleat · side cutout"></canvas><span class="of-cleat__go"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M7 17 17 7M8 7h9v9"/></svg></span></a>`).join("");
    row.innerHTML = one + one;
    row.querySelectorAll("canvas").forEach((c) => window.JJArt?.paint(c));
  });
  // ── Face video strip: flows sideways as far as you scroll (stands still when idle) ──
  if (!reduce) gsap.fromTo("[data-pace-track]", { xPercent: 0 }, { xPercent: -22, ease: "none", scrollTrigger: { trigger: ".of-pace", start: "top bottom", end: "bottom top", scrub: true } });

  // ── Influence: the cutout floats (y −16 · 1.2° · 2.8s sine.inOut back and forth), mouse x (x−.5)×18 over .9s power2.out, drops in from 15vh on entry ──
  const cut = $("[data-infl-cut]"), flo = $("[data-infl-float]");
  if (!reduce) {
    const bob = gsap.to(flo, { y: -16, rotate: 1.2, duration: 2.8, ease: "sine.inOut", yoyo: true, repeat: -1 });
    new IntersectionObserver(([e]) => (e.isIntersecting ? bob.resume() : bob.pause()), { rootMargin: "10% 0px" }).observe(cut);
    if (JJ.fine) {
      const qx = gsap.quickTo(cut, "x", { duration: 0.9, ease: "power2.out" });
      let seen = false;
      ScrollTrigger.create({ trigger: ".of-infl", start: "top bottom", end: "bottom top", onToggle: (s) => (seen = s.isActive) });
      addEventListener("mousemove", (e) => seen && qx((e.clientX / innerWidth - 0.5) * 18), { passive: true });
    }
    gsap.fromTo(cut, { yPercent: 0, y: () => innerHeight * 0.15 }, { y: 0, ease: "none", scrollTrigger: { trigger: ".of-infl", start: "top bottom", end: "top top", scrub: true } });
  }
})();
