// The scenes of one page — rewritten from the original inline script and Webflow interaction (a-*) values.
(() => {
  const NL = window.NL, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = NL.reduce;
  const clamp = gsap.utils.clamp;
  const lerp = (a, b, t) => a + (b - a) * t;
  gsap.registerPlugin(MorphSVGPlugin, Draggable);

  // ── Hero entrance — 4.5s (phone 1s) after fonts load: link row .3s, title lines .6s with .1 gap (at .2), video slot 0→1 .8s (at .4), clock·day receiving .6s (at 1) ──
  const h1 = $(".nl-h1"), flex = $(".nl-video__stick"), vwrap = $(".nl-video__wrap"), hud = $$(".nl-hero .nl-clock, .nl-hero .nl-open"), row = $(".nl-nav__row");
  let lines = [];
  const prep = () => {
    if (h1.classList.contains("is-ready")) return;
    lines = new SplitType(h1, { types: "lines", lineClass: "nl-line" }).lines || [];
    if (!reduce) gsap.set(lines, { opacity: 0, filter: "blur(10px)", y: 15 });
    h1.classList.add("is-ready");
  };
  if (!reduce) { gsap.set(flex, { scale: 0 }); gsap.set(row, { opacity: 0, y: 20 }); }
  const intro = () => {
    prep();
    if (reduce) { gsap.set(hud, { opacity: 1, y: 0 }); return; }
    const m = NL.phone();
    gsap.timeline()
      .to(row, { y: 0, opacity: 1, duration: m ? 0.6 : 0.3, ease: "power1.out", clearProps: "transform" }, 0)
      .to(lines, { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.6, ease: m ? "power3.out" : "power1.out", stagger: { each: 0.1, from: "start" } }, m ? 0 : 0.2)
      .to(flex, { scale: 1, duration: 0.8, ease: "power1.out" }, m ? 0 : 0.4)
      .to(hud, { y: 0, opacity: 1, duration: m ? 0.5 : 0.6, ease: "power1.out" }, m ? 0 : 1);
  };
  (document.fonts?.ready || Promise.resolve()).then(() => { prep(); setTimeout(intro, reduce ? 0 : (NL.phone() ? 1 : 4.5) * 1000); });

  // Original a-8: past 5% of the page, the fixed title and clock switch off in place (within 0.1%)
  const fixed = [$(".nl-hero__h1"), ...hud];
  let gone = false;
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => {
    const g = s.progress > 0.05;
    if (g === gone || !NL.desk()) return;
    gone = g;
    gsap.set(fixed, { autoAlpha: g ? 0 : 1, scale: g ? 0 : 1 });
  } });

  // Original a-69: while the marker below the hero passes the first 50%, the video scales .4→1 and moves up 100px → 0
  mmDesk();
  function mmDesk() {
    gsap.matchMedia().add("(min-width: 992px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(vwrap, { scale: 0.4, y: -100 }, { scale: 1, y: 0, ease: "none", scrollTrigger: { start: 0, end: () => (innerHeight + 20) * 0.5, scrub: 0.6 } });
    });
  }

  NL.reveal();

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Original a-7: word line width 28% → 100% (progress 15%→70%, inOutQuad)
    const sw = $(".nl-stretch");
    gsap.timeline({ scrollTrigger: { trigger: sw, start: "top bottom", end: "bottom top", scrub: 0.8 } })
      .set(sw, { width: NL.phone() ? "45%" : "28%" }, 0).to(sw, { width: "100%", ease: "power1.inOut", duration: 0.55 }, 0.15).to({}, { duration: 0.3 });
    // Original a-87·a-86·a-85: photo blur 5px → 0 (.5s), circle label opacity 0 → 1 (.3s), A → B blur 5px·15px → 0 (.3s circ.in)
    gsap.fromTo(".nl-about__img", { opacity: 0, filter: "blur(5px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.5, ease: "power1.inOut", scrollTrigger: { trigger: ".nl-about__img", start: "top bottom" } });
    $$("[data-badge]").forEach((b) => gsap.fromTo(b, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power1.inOut", scrollTrigger: { trigger: b, start: "top 90%" } }));
    gsap.fromTo(".nl-ab", { filter: "blur(5px)", y: 15 }, { filter: "blur(0px)", y: 0, duration: 0.3, ease: "circ.in", scrollTrigger: { trigger: ".nl-ab", start: "top 90%" } });
  });

  // ── Process: 400vh board — original a-64 red cell height 0→100% (01 fills at 30%, 02 at 45%, 03 at 60%, 04 at 75%) ──
  const roll = $(".nl-roll"), covers = $$(".nl-pcard__cover");
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: roll, start: "top bottom", end: "bottom top", scrub: 0.3 } });
    [0.3, 0.45, 0.6, 0.75].forEach((at, i) => tl.fromTo(covers[i], { height: "0%" }, { height: "100%", duration: at }, 0));
    tl.to({}, { duration: 0.25 }, 0.75);
    // Phone·tablet (original a-70·a-88): the card row slides sideways past
    if (!NL.desk()) {
      const cw = $(".nl-roll__cards");
      gsap.timeline({ scrollTrigger: { trigger: roll, start: "top top", end: "bottom bottom", scrub: 0.5 } })
        .to(cw, { x: () => -(cw.scrollWidth - cw.clientWidth + 32), ease: "none", duration: 0.4 }, 0.35).to({}, { duration: 0.25 });
    }
  });
  mm.add("(prefers-reduced-motion: reduce)", () => gsap.set(covers, { height: "100%" }));

  // ── Wheel: a square rolls along a catenary road, passes a 12-gon and becomes a circle, and the road flattens too (written anew from the original pw-canvas formula) ──
  (() => {
    const cv = $(".nl-roll__canvas"), host = $(".nl-roll__sticky");
    if (!cv) return;
    const g = cv.getContext("2d");
    const N0 = 4, N1 = 12, PHASE2 = 0.3, K = 0.2;
    const ss = (t) => t * t * (3 - 2 * t);
    let W = 0, Hh = 0, R = 0, xL = 0, xR = 0, tIn = 0, target = 0, cur = 0, raf = 0, mob = false;
    const ink = () => getComputedStyle(cv).getPropertyValue("--site-on-red") || getComputedStyle(document.documentElement).getPropertyValue("--site-on-red");
    // Vertices — start at the top (π/2) and divide into n equal parts
    const poly = (n, r) => Array.from({ length: n }, (_, i) => { const a = Math.PI / 2 + (2 * Math.PI * i) / n; return [Math.cos(a) * r, Math.sin(a) * r]; });
    // When n is prime: insert one point in the middle of the first edge of the n-gon below to move up to the n+1-gon above
    const verts = (nf, r) => {
      const lo = Math.floor(nf), fr = nf - lo;
      const base = poly(lo, r);
      if (fr < 1e-9) return base;
      const start = [base[0], [(base[0][0] + base[1][0]) / 2, (base[0][1] + base[1][1]) / 2], ...base.slice(1)];
      const hi = poly(lo + 1, r), ref = Math.atan2(base[0][1], base[0][0]);
      let best = 0, bd = Infinity;
      hi.forEach((p, o) => { let d = Math.abs(Math.atan2(p[1], p[0]) - ref); if (d > Math.PI) d = 2 * Math.PI - d; if (d < bd) { bd = d; best = o; } });
      const aim = hi.map((_, i) => hi[(i + best) % hi.length]);
      return start.map((p, i) => [lerp(p[0], aim[i][0], fr), lerp(p[1], aim[i][1], fr)]);
    };
    const size = () => {
      const dpr = Math.min(2, devicePixelRatio || 1);
      W = host.clientWidth; Hh = host.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(Hh * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      mob = innerWidth <= 767;
      R = Math.min(W, innerHeight) * (mob ? 0.156 : 0.13);
      xL = mob ? R : -R; xR = W - R;
      tIn = mob ? 0.05 : (2 * R) / (xR - xL);
      aim(); draw(cur);
    };
    const aim = () => {
      const r = roll.getBoundingClientRect(), span = Math.max(1, roll.offsetHeight - innerHeight);
      const raw = Math.min(1, Math.max(0, -r.top) / span), off = mob ? 0 : 0.25;
      target = Math.max(0, (raw - off) / (1 - off));
      if (reduce) { cur = target; draw(cur); return; }
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const loop = () => {
      cur = lerp(cur, target, K);
      if (Math.abs(target - cur) < 5e-4) cur = target;
      draw(cur);
      raf = Math.abs(target - cur) >= 5e-4 ? requestAnimationFrame(loop) : 0;
    };
    const draw = (p) => {
      const t = clamp(0, 1, p), col = ink().trim();
      const wx = lerp(xL, xR, t);
      const tm = ss(Math.min(1, Math.max(0, (t - tIn) / (1 - tIn))));
      const tp = Math.min(tm / PHASE2, 1), circ = ss(Math.max(0, (tm - PHASE2) / (1 - PHASE2)));
      const nf = N0 + tp * (N1 - N0), lo = Math.floor(nf), hi = Math.min(N1, lo + 1), fr = nf - lo;
      const s = lerp(2 * R * Math.sin(Math.PI / lo), 2 * R * Math.sin(Math.PI / hi), fr);
      const a = lerp(R * Math.cos(Math.PI / lo), R * Math.cos(Math.PI / hi), fr);
      const peak = (Hh - (mob ? 340 : 360)) * 0.5 + a;
      const axle = peak - (a + (R - a) * circ);
      g.clearRect(0, 0, W, Hh);
      g.lineJoin = g.lineCap = "round";
      g.strokeStyle = g.fillStyle = col;
      // Road — catenary (cosh) arches rising per side length s, flatter as it becomes a circle
      g.beginPath();
      const first = xL + Math.ceil((-xL - s) / s) * s, n = Math.ceil((W + 2 * s) / s) + 2, steps = Math.max(48, Math.round(s));
      for (let k = 0; k < n; k++) {
        const px = first + k * s, left = px - s / 2;
        for (let j = 0; j <= steps; j++) {
          const lx = left + (j / steps) * s, y = peak + a * Math.cosh((lx - px) / a) - a;
          const wy = y * (1 - circ) + peak * circ;
          j ? g.lineTo(lx, wy) : g.moveTo(lx, wy);
        }
      }
      g.lineWidth = 1.5; g.stroke();
      // Wheels — rotate by distance rolled
      const rot = ((t * (xR - xL)) / s) * ((2 * Math.PI) / nf) - Math.PI / nf;
      const v = verts(nf, R);
      g.save(); g.translate(wx, axle); g.rotate(rot); g.beginPath();
      if (circ < 0.999) {
        const S = mob ? 90 : 360, per = v.length / S;
        for (let i = 0; i <= S; i++) {
          const vi = i * per, i0 = Math.floor(vi) % v.length, i1 = (i0 + 1) % v.length, f = vi - Math.floor(vi);
          const px = lerp(v[i0][0], v[i1][0], f), py = lerp(v[i0][1], v[i1][1], f), pr = Math.hypot(px, py), k = lerp(pr, R, circ) / pr;
          i ? g.lineTo(px * k, py * k) : g.moveTo(px * k, py * k);
        }
        g.closePath();
      } else g.arc(0, 0, R, 0, Math.PI * 2);
      g.lineWidth = 1.5; g.stroke();
      g.beginPath(); g.arc(0, 0, 3, 0, Math.PI * 2); g.fill();
      g.restore();
      // Dotted line at axle height
      g.save(); g.lineWidth = 1; g.setLineDash([5, 10]); g.beginPath(); g.moveTo(0, axle); g.lineTo(W, axle); g.stroke(); g.restore();
    };
    addEventListener("resize", size, { passive: true });
    addEventListener("scroll", () => requestAnimationFrame(aim), { passive: true });
    new ResizeObserver(size).observe(host);
    size();
  })();

  // ── Work: pinned panel — 100vh per photo, a polygon clip on the bottom-right corner unfolds with .9 power2.inOut ──
  const HIDDEN = "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)", FULL = "polygon(0% 0%, 100% 0%, 100% 101%, 0% 101%)";
  const work = $(".nl-work"), pin = $(".nl-work__pin"), items = $$(".nl-witem"), masks = $$(".nl-mask"), imgs = masks.map((m) => $(".nl-mask__img", m));
  mm.add("(min-width: 992px) and (prefers-reduced-motion: no-preference)", () => {
    const TR = 0.9, FADE = 0.28, DIM = 0.28;
    gsap.set(items, { opacity: DIM });
    gsap.set(masks, { clipPath: HIDDEN });
    gsap.set(imgs, { scale: 1.1, transformOrigin: "50% 50%", force3D: true });
    const tl = gsap.timeline({ defaults: { duration: TR, ease: "power2.inOut" } });
    tl.addLabel("top", 0).to(masks[0], { clipPath: FULL }, 0).to(imgs[0], { scale: 1, ease: "none" }, 0).to(items[0], { opacity: 1, duration: FADE, ease: "none" }, 0).addLabel("s0", 1);
    for (let i = 1; i < masks.length; i++) {
      tl.to(masks[i], { clipPath: FULL }, i).to(imgs[i], { scale: 1, ease: "none" }, i).to(imgs[i - 1], { scale: 1.2, ease: "none" }, i)
        .to(items[i - 1], { opacity: DIM, duration: FADE, ease: "none" }, i).to(items[i], { opacity: 1, duration: FADE, ease: "none" }, i).addLabel(`s${i}`, i + 1);
    }
    const END = masks.length;
    tl.to({}, { duration: 0.01 }, END - 0.01);
    const dur = tl.duration(), labels = [...new Set(Object.values(tl.labels).map((t) => t / dur))].sort((a, b) => a - b);
    const st = ScrollTrigger.create({ animation: tl, trigger: work, start: "top top", end: () => `+=${Math.round(END * innerHeight)}`, pin, pinSpacing: true, anticipatePin: 1, invalidateOnRefresh: true, scrub: true });
    // On release, after 90ms it goes to the nearest section — when scrolling down, the next one at just 10% revealed, when scrolling up, the previous one only once pulled below 90% (dragged with Lenis lerp .1)
    const ease = gsap.parseEase("power2.inOut");
    const pick = (p, dir) => {
      for (let i = 0; i < labels.length - 1; i++) {
        const lo = labels[i], hi = labels[i + 1];
        if (p > hi) continue;
        const shown = ease(clamp(0, 1, (p - lo) / (hi - lo) / TR));
        return shown >= (dir > 0 ? 0.1 : dir < 0 ? 0.9 : 0.5) ? hi : lo;
      }
      return labels[labels.length - 1];
    };
    let dir = 0, lastY = scrollY, idle = 0;
    const snap = () => {
      const L = NL.lenis;
      if (!L || L.isStopped) return;
      const y = L.isScrolling === "smooth" ? L.targetScroll : st.scroll();
      if (y < st.start || y > st.end) return;
      const to = Math.round(st.start + (st.end - st.start) * pick((y - st.start) / (st.end - st.start), dir));
      if (Math.abs(to - y) >= 2) L.scrollTo(to, { lerp: 0.1 });
    };
    const onScroll = () => { const y = scrollY; if (y !== lastY) { dir = y > lastY ? 1 : -1; lastY = y; } clearTimeout(idle); idle = setTimeout(snap, 90); };
    addEventListener("scroll", onScroll, { passive: true });
    // Original a-84: name lines start 400%·300%·100% below with 15px blur, 1s inOutQuad (delay 0·.15·.45)
    gsap.from(items, { yPercent: (i) => [400, 300, 100][i] ?? 100, filter: "blur(15px)", duration: 1, ease: "power1.inOut", delay: (i) => [0, 0.15, 0.45][i] ?? 0, scrollTrigger: { trigger: $(".nl-work__list"), start: "top bottom" } });
    return () => { removeEventListener("scroll", onScroll); clearTimeout(idle); };
  });

  // Round text button — CircleType radius = Circle diameter × .9, one turn in 15 seconds. On hover over the mask the circle grows 0→1.1 (.4s delay .1) and follows the mouse by ±26vw
  $$(".nl-cta").forEach((cta) => {
    const circle = $(".nl-cta__circle", cta), text = $(".nl-cta__text", cta), arrow = $(".nl-cta__arrow", cta), mask = cta.closest(".nl-mask");
    if (window.CircleType) { const ct = new CircleType(text); const fit = () => ct.radius(circle.getBoundingClientRect().width * 0.9 || 63); fit(); addEventListener("resize", fit); }
    if (reduce) return gsap.set([text, arrow], { opacity: 1 }), gsap.set(circle, { scale: 1.1 });
    mask.addEventListener("mouseenter", () => { gsap.to(circle, { scale: 1.1, duration: 0.4, delay: 0.1, ease: "power1.inOut", overwrite: true }); gsap.to([text, arrow], { opacity: 1, duration: 0.4, delay: 0.1, ease: "power1.inOut", overwrite: true }); });
    mask.addEventListener("mouseleave", () => { gsap.to(circle, { scale: 0, duration: 0.5, ease: "power1.inOut", overwrite: true }); gsap.to([text, arrow], { opacity: 0, duration: 0.5, ease: "power1.inOut", overwrite: true }); });
    const qx = gsap.quickTo(cta, "x", { duration: 0.6, ease: "power2.out" }), qy = gsap.quickTo(cta, "y", { duration: 0.6, ease: "power2.out" });
    mask.addEventListener("mousemove", (e) => {
      const r = mask.getBoundingClientRect(), vw = innerWidth / 100;
      qx(lerp(-26 * vw, 26 * vw, (e.clientX - r.left) / r.width));
      qy(lerp(-26 * vw, 26 * vw, (e.clientY - r.top) / r.height));
    });
  });

  // ── Price: 1000vh stage — original a-6 key positions (%) mapped straight to progress ──
  const price = $(".nl-price"), pwin = $(".nl-pwin"), blob = $(".nl-blob"), tops = $$(".nl-blob__top"), blur = $(".nl-blurtext");
  const tickets = $$(".nl-ticket"), pbadge = $("[data-pbadge]"), disc = $(".nl-disclaimer"), desk = $(".nl-desk"), wall = $(".nl-wall"), bar = $(".nl-pwin > .nl-win__bar");
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const m = innerWidth <= 767;
    const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: price, start: "top bottom", end: "bottom bottom", scrub: 0.7 } });
    const at = (k) => k / 100;
    tl.set({}, {}, 1);
    tl.fromTo(blob, { height: m ? "30vh" : 0, y: m ? 300 : 200 }, { height: m ? "60vh" : "70vh", ease: "sine.inOut", duration: at(m ? 8 : 15) }, 0)
      .to(blob, { height: "300vh", y: m ? 200 : 0, ease: "sine.inOut", duration: at(m ? 12 : 15) }, at(m ? 8 : 15))
      .fromTo(pwin, { backgroundColor: css("--kf-bg") }, { backgroundColor: css("--site-sky-1"), ease: "sine.inOut", duration: at(10) }, at(m ? 10 : 20))
      .to(pwin, { backgroundColor: css("--site-sky-2"), ease: "sine.inOut", duration: at(30) }, at(30))
      .fromTo(tops, { scale: 1 }, { scale: 3, duration: at(11) }, at(m ? 15 : 20))
      .fromTo(blur, { filter: "blur(0px)" }, { filter: "blur(5px)", ease: "sine.inOut", duration: at(15) }, at(m ? 6 : 20));
    const flip = m ? [[15, 25], [30, 40], [45, 55]] : [[35, 45], [35, 52], [35, 60]];
    tickets.forEach((t, i) => {
      tl.set(t, { y: 860, rotationY: 180 }, 0)
        .to(t, { y: 0, rotationY: 0, ease: "sine.inOut", duration: at(flip[i][1] - flip[i][0]) }, at(flip[i][0]));
    });
    tl.fromTo([pbadge, disc], { opacity: 0 }, { opacity: 1, ease: "power1.inOut", duration: at(m ? 6 : 8) }, at(m ? 55 : 52))
      // 80% — the stage is revealed to have been an old monitor screen: the price window becomes a small window at bottom left, the monitor itself .3x · 6°
      .set(wall, { opacity: 1 }, at(80))
      .fromTo(pwin, { scale: 1, borderRadius: 0 }, { scale: 0.36, borderRadius: 18, duration: at(6), ease: "power1.inOut" }, at(80))
      .fromTo(bar, { opacity: 0 }, { opacity: 1, duration: at(2) }, at(82))
      .fromTo(desk, { scale: 1 }, { scale: m ? 0.2 : 0.3, ease: "power1.inOut", duration: at(6) }, at(80))
      .fromTo(desk, { rotation: 0, y: 0 }, { rotation: 6, y: m ? 150 : 100, ease: "power1.inOut", duration: at(15) }, at(80));
    gsap.set(wall, { opacity: 0 });
  });

  // Desktop icon → window (drag to move, red dot closes), review window tab (fill panel moves over in .3s inOutQuad)
  const screen = $(".nl-screen");
  $$("[data-open]").forEach((b) => b.addEventListener("click", () => {
    const w = document.getElementById(b.dataset.open);
    if (!w) return;
    w.hidden = false;
    gsap.fromTo(w, { scale: 0, transformOrigin: "100% 0" }, { scale: 1, duration: reduce ? 0 : 0.5, ease: "power2.out" });
    if (!w._drag) w._drag = Draggable.create(w, { trigger: $(".nl-win__bar", w), bounds: screen, zIndexBoost: true })[0];
  }));
  $$("[data-close]").forEach((d) => d.addEventListener("click", (e) => { e.stopPropagation(); const w = d.closest(".nl-win"); gsap.to(w, { scale: 0, duration: reduce ? 0 : 0.3, ease: "power2.in", onComplete: () => (w.hidden = true) }); }));
  if (bar) Draggable.create(pwin, { trigger: bar, bounds: screen, onPress() { if (gsap.getProperty(pwin, "scale") > 0.9) this.endDrag(); } });
  const fill = $(".nl-tabs__fill"), tabs = $$("[data-tab]"), pane = $(".nl-tabs__pane p");
  const quotes = ["Your received review here in about three lines. The feel of working together and the results.", "Write the second review here in two lines. A story of fast and careful work.", "Your three-line third review goes here. Say they would hire again, plus a short addition."];
  tabs.forEach((t, i) => t.addEventListener("click", () => {
    tabs.forEach((x) => x.classList.toggle("is-on", x === t));
    gsap.to(fill, { yPercent: i * 100, duration: reduce ? 0 : 0.3, ease: "power1.inOut" });
    pane.textContent = quotes[i] || quotes[0];
  }));

  // ── Contact: dotted path — the mouse horizontal position (drag on phones) becomes 0→1 progress and the shape passes through six types while rotating 0→450°. Past types remain as outlines and fade ──
  (() => {
    const track = $(".nl-track"), shape = $(".nl-track__shape"), path = $(".nl-track__path");
    if (!track || !path) return;
    const C = 110, r = 92;
    const ngon = (n, rr, rot = -Math.PI / 2) => "M" + Array.from({ length: n }, (_, i) => { const a = rot + (i * 2 * Math.PI) / n; return `${(C + rr * Math.cos(a)).toFixed(1)} ${(C + rr * Math.sin(a)).toFixed(1)}`; }).join("L") + "Z";
    const star = (n, ro, ri) => "M" + Array.from({ length: n * 2 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / n, rr = i % 2 ? ri : ro; return `${(C + rr * Math.cos(a)).toFixed(1)} ${(C + rr * Math.sin(a)).toFixed(1)}`; }).join("L") + "Z";
    const shapes = [ngon(4, r * 1.05), ngon(5, r), ngon(6, r), star(6, r, r * 0.72), ngon(8, r), `M${C - r} ${C}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`];
    const cps = [0, 0.2, 0.4, 0.6, 0.8, 1].map((p, i) => ({ p, rot: i * 90, d: shapes[i] }));
    path.setAttribute("d", shapes[0]);
    const tl = gsap.timeline({ paused: true });
    for (let i = 1; i < cps.length; i++) tl.to(path, { morphSVG: { shape: cps[i].d, type: "rotational", origin: "50% 50%" }, rotation: cps[i].rot, svgOrigin: `${C} ${C}`, duration: cps[i].p - cps[i - 1].p, ease: "none" }, cps[i - 1].p);
    let prog = 0, size = 220, trails = new Map();
    const measure = () => (size = shape.getBoundingClientRect().width || 220);
    const leftAt = (p) => p * (track.clientWidth - size);
    const ghost = (i) => {
      const ns = "http://www.w3.org/2000/svg", s = document.createElementNS(ns, "svg"), p = document.createElementNS(ns, "path");
      s.setAttribute("viewBox", "0 0 220 220"); s.setAttribute("class", "trail");
      p.setAttribute("d", cps[i].d); s.appendChild(p);
      s.style.left = `${leftAt(cps[i].p)}px`; s.style.transform = `rotate(${cps[i].rot}deg)`;
      track.appendChild(s);
      gsap.to(s, { opacity: 0, duration: 0.8 + trails.size * 0.15, ease: "power2.out", onComplete: () => s.remove() });
      return s;
    };
    const go = (p, soft) => {
      const prev = prog;
      prog = clamp(0, 1, p);
      tl.progress(prog);
      gsap.to(shape, { x: leftAt(prog), duration: soft ? 0.1 : 0, ease: "none", overwrite: "auto" });
      cps.forEach((c, i) => {
        const e = 0.001;
        if ((prog > prev && prev < c.p + e && prog >= c.p + e) || (prog < prev && prev > c.p - e && prog <= c.p - e)) {
          trails.get(i)?.remove();
          trails.set(i, ghost(i));
        }
      });
    };
    const fromX = (x) => { const r0 = track.getBoundingClientRect(); return (clamp(size / 2, r0.width - size / 2, x - r0.left) - size / 2) / Math.max(1, r0.width - size); };
    measure();
    if (NL.desk()) track.addEventListener("mousemove", (e) => go(fromX(e.clientX), true));
    else Draggable.create(shape, { type: "x", bounds: track, onDrag() { go(this.x / Math.max(1, track.clientWidth - size), false); } });
    addEventListener("resize", () => { measure(); go(prog, false); });
  })();

  // Footer shadow — lifts in .5s when the end of the door panel reaches 75% of the screen, and covers again when scrolling back up (original a-49·a-50)
  const shade = $(".nl-foot__shadow");
  if (!reduce) ScrollTrigger.create({ trigger: ".nl-cta-sec", start: "bottom 75%", onEnter: () => gsap.to(shade, { opacity: 0, duration: 0.5, ease: "power1.inOut" }), onLeaveBack: () => gsap.to(shade, { opacity: 1, duration: 0.5 }) });
  else gsap.set(shade, { opacity: 0 });
})();
