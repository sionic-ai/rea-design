// First page: chrome bird, pinned section where a design tool cursor composes a sentence, work cards, award globe (camera flies in and a cream circle spreads),
// Service card overlap, small repeating graphics, showreel zoom.
(() => {
  const SX = window.SX, reduced = SX.reduced;
  const Q = (s, r = document) => r.querySelector(s), QA = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const split = (el) => {
    const t = el.dataset.t || el.textContent;
    el.dataset.t = t;
    el.innerHTML = [...t].map((c) => `<span style="display:inline-block">${c === " " ? "&nbsp;" : c}</span>`).join("");
    return [...el.children];
  };

  SXChrome(Q(".h-hero__obj"), "bird");

  // ---------- Sentence that sticks on stickers ----------
  // Original values: pin 560vh (360vh at 767 and below) scrub 1 · on a 0~100 timeline the line flows left from 16 · cursor per word
  // Gray word back.out(1.8) 2s · typing .32s per letter · color box scaleX 2.4s · tag dragged in over 2.6s and back.out(3) · shape .18→1 2.6s · pen curve 4s
  const gx = Q(".gx");
  const gxState = { on: false, prog: 0, end: 0, A: 16, Z: 100 };
  const buildGx = () => {
    if (reduced || !gx) return;
    gx.classList.add("on");
    const pin = Q(".gx-pin", gx), track = Q(".gx-track", gx), cur = Q(".gx-cur", gx), ico = Q(".gx-ico", gx);
    const vw = pin.clientWidth, vh = pin.clientHeight;
    const pen = Q(".gx-pen .c", gx), pen0 = "M20 110C95 12 220 -10 240 20", pen1 = "M20 110C95 12 165 118 240 20";
    pen.setAttribute("d", pen0);
    QA(".gx-w, .gx-box b", gx).forEach(split);
    const PR = pin.getBoundingClientRect();
    const R = (el) => { const r = el.getBoundingClientRect(); return { l: r.left - PR.left, t: r.top - PR.top, w: r.width, h: r.height, cx: r.left - PR.left + r.width / 2, cy: r.top - PR.top + r.height / 2 }; };
    const D = track.scrollWidth - vw, A = 16, Z = 100;
    // Since the line flows, the cursor target is set from where the word will be on screen at time t
    const sx = (x, t) => x - D * clamp((t - A) / (Z - A), 0, 1);
    const due = (r, f = 0.64) => A + ((r.l - vw * f) / D) * (Z - A);
    const tl = gsap.timeline({ defaults: { ease: "power3.out" }, scrollTrigger: { trigger: gx, start: "top top", end: "bottom bottom", scrub: 1, onToggle: (s) => (gxState.on = s.isActive), onUpdate: (s) => (gxState.prog = s.progress) } });
    const icon = (n, t) => tl.set(cur, { attr: { "data-i": n } }, t);
    const go = (x, y, t, d, e = "power2.inOut") => tl.to(cur, { x, y, duration: d, ease: e }, t);
    const click = (t) => tl.to(ico, { scale: 0.78, duration: 0.25, ease: "power1.inOut", yoyo: true, repeat: 1 }, t);
    const stA = Q(".gx-st.a", gx), stB = Q(".gx-st.b", gx), para = Q(".gx-p", gx);
    const ra = R(stA), rb = R(stB), rp = R(para);
    gsap.set(cur, { x: vw * 0.86, y: vh * 1.08 });
    tl.set(cur, { x: vw * 0.86, y: vh * 1.08 }, 0);
    icon("arrow", 0);
    go(ra.cx, ra.cy, 0, 3); click(3);
    tl.from(stA, { scale: 2.2, rotation: -14, autoAlpha: 0, duration: 3, ease: "back.out(2.2)" }, 3.25);
    go(rb.cx + rb.w * 0.2, rb.cy, 4.2, 2.4); click(6.6);
    tl.from(stB, { scale: 2.2, rotation: 14, autoAlpha: 0, duration: 3, ease: "back.out(2.2)" }, 6.85);
    go(rp.l + rp.w * 0.6, rp.t + rp.h + 20, 8, 2.5);
    tl.from(para, { y: 40, autoAlpha: 0, duration: 3 }, 8.6)
      .to(Q(".gx-intro", gx), { yPercent: -60, autoAlpha: 0, duration: 6, ease: "power2.in" }, A - 3)
      .fromTo(Q(".gx-bg", gx), { x: vw * 0.1 }, { x: -vw * 0.7, ease: "none", duration: Z }, 0)
      .to(track, { x: -D, ease: "none", duration: Z - A }, A);
    let end = 11;
    QA(".gx-i, .gx-tag > a", track).forEach((el) => {
      const r = R(el);
      if (el.classList.contains("gx-w") && el.classList.contains("g")) {
        tl.from(QA("span", el), { yPercent: 110, rotation: (i) => (i % 2 ? 8 : -8), autoAlpha: 0, duration: 2, stagger: 0.18, ease: "back.out(1.8)" }, Math.max(due(r, 0.8), end - 0.4));
        return;
      }
      const t = Math.max(due(r), end + 0.7);
      let d;
      if (el.classList.contains("gx-w")) {
        const ch = QA("span", el);
        d = Math.min(2.6, 0.32 * ch.length + 0.4);
        go(sx(r.l, t), r.cy, end, t - end); icon("text", t);
        tl.from(ch, { autoAlpha: 0, duration: 0.05, stagger: d / ch.length, ease: "none" }, t);
        tl.to(cur, { x: sx(r.l + r.w, t + d), y: r.cy, duration: d, ease: "none" }, t);
      } else if (el.classList.contains("gx-box")) {
        d = 2.4;
        go(sx(r.l, t), r.t + r.h * 0.15, end, t - end); icon("arrow", end); click(t - 0.2); icon("move", t);
        tl.from(Q("i", el), { scaleX: 0, duration: d, ease: "none" }, t);
        tl.to(cur, { x: sx(r.l + r.w, t + d), y: r.t + r.h * 0.85, duration: d, ease: "none" }, t);
        tl.from(QA("b span", el), { yPercent: 110, autoAlpha: 0, duration: 1.6, stagger: 0.14, ease: "back.out(1.8)" }, t + d * 0.45);
      } else if (el.classList.contains("gx-shape")) {
        d = 2.6;
        const sel = Q(".gx-sel", el);
        go(sx(r.l + r.w * 0.18, t), r.t + r.h * 0.18, end, t - end); icon("size", t); click(t);
        tl.to(sel, { opacity: 1, duration: 0.2 }, t);
        tl.from(el, { scale: 0.18, rotation: el.classList.contains("gx-ast") ? -140 : 0, transformOrigin: "0% 0%", duration: d, ease: "power2.inOut" }, t);
        tl.to(cur, { x: sx(r.l + r.w, t + d), y: r.t + r.h, duration: d, ease: "power2.inOut" }, t);
        tl.to(sel, { opacity: 0, duration: 0.6 }, t + d + 1.2);
      } else if (el.classList.contains("gx-pen")) {
        const s = R(Q("svg", el)), k = s.w / 260, P = (x, y, tt) => [sx(s.l + x * k, tt), s.t + y * k];
        let p = P(20, 110, t);
        go(p[0], p[1], end, t - end); icon("pen", end); click(t);
        tl.from(Q(".a1", el), { scale: 0, transformOrigin: "50% 50%", duration: 0.8, ease: "back.out(3)" }, t);
        const cx0 = [20, 95, 220, 240], cy0 = [110, 12, -10, 20], N = 8, dd = 4;
        tl.fromTo(pen, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: dd, ease: "none" }, t);
        for (let i = 1; i <= N; i++) {
          const u = i / N, m = 1 - u;
          const bx = m * m * m * cx0[0] + 3 * m * m * u * cx0[1] + 3 * m * u * u * cx0[2] + u * u * u * cx0[3];
          const by = m * m * m * cy0[0] + 3 * m * m * u * cy0[1] + 3 * m * u * u * cy0[2] + u * u * u * cy0[3];
          const q = P(bx, by, t + dd * u);
          tl.to(cur, { x: q[0], y: q[1], duration: dd / N, ease: "none" }, t + (dd * (i - 1)) / N);
        }
        tl.from(Q(".a2", el), { scale: 0, transformOrigin: "50% 50%", duration: 0.8, ease: "back.out(3)" }, t + dd);
        click(t + dd);
        tl.set(QA(".h2, .k2", el), { attr: { x2: 220, y2: -10, cx: 220, cy: -10 } }, t);
        tl.from(QA(".h, .k", el), { autoAlpha: 0, duration: 0.6 }, t + dd + 0.3);
        const t2 = t + dd + 1.2, q0 = P(220, -10, t2);
        icon("arrow", t + dd + 0.2); go(q0[0], q0[1], t + dd + 0.2, 1); click(t2); icon("move", t2);
        tl.to(pen, { attr: { d: pen1 }, duration: 2.6, ease: "power2.inOut" }, t2)
          .to(Q(".h2", el), { attr: { x2: 165, y2: 118 }, duration: 2.6, ease: "power2.inOut" }, t2)
          .to(Q(".k2", el), { attr: { cx: 165, cy: 118 }, duration: 2.6, ease: "power2.inOut" }, t2);
        const q1 = P(165, 118, t2 + 2.6);
        tl.to(cur, { x: q1[0], y: q1[1], duration: 2.6, ease: "power2.inOut" }, t2);
        d = t2 + 2.6 - t;
        icon("arrow", t + d);
      } else {
        d = 2.6;
        const ox = vw * 0.05, oy = r.h * 2.4;
        go(sx(r.cx + ox, t), r.cy + oy, end, t - end); icon("arrow", end); icon("move", t); click(t);
        tl.from(el, { autoAlpha: 0, duration: 0.2 }, t);
        tl.from(el, { x: ox, y: oy, rotation: () => -parseFloat(getComputedStyle(el).rotate) || 0, scale: 1.12, duration: d, ease: "power2.inOut" }, t);
        tl.to(cur, { x: sx(r.cx, t + d), y: r.cy, duration: d, ease: "power2.inOut" }, t);
        tl.fromTo(el, { scale: 1.12 }, { scale: 1, duration: 0.8, ease: "back.out(3)", immediateRender: false }, t + d);
        d += 0.6;
      }
      end = t + d;
    });
    go(vw * 0.8, vh * 0.82, end + 0.5, 3);
    icon("arrow", end + 0.5);
    gxState.end = end;
    gxState.total = tl.duration();
    Object.assign(gxState, { tl, track, cur, vw, vh });
  };

  // Mascot falls from the sky and lands in a crouch, when the line starts flowing it walks to the head of the sentence and walks along with the line, then exits right when the sentence ends
  // Original values: fall vh*1.15→0 2.6s power2.in · arms-up pose .35s · crouch .35s power3.out → stands up at 3.4 over 1.3s · wobble .18/.5s ·
  // At A-3.5, 5s at vw*.12 (phone .16) · 4.2s power1.in to vw*1.22 at end+.6 · walks in place at .42× as much as the row has flowed
  const gs = { x: 0, o: 0, dy: 0, fall: 0, crouch: 0, sq: 0 };
  const gxMascot = () => {
    if (reduced || !gx || !gxState.tl || !SX.salvo.ready) return;
    const { tl, vw, vh, end, A } = { ...gxState }, mob = vw < 768;
    tl.set(gs, { x: vw * (mob ? 0.74 : 0.84), o: 1, dy: vh * 1.15, fall: 1, crouch: 0, sq: 0 }, 0)
      .to(gs, { dy: 0, duration: 2.6, ease: "power2.in" }, 0)
      .to(gs, { fall: 0, duration: 0.35, ease: "power2.out" }, 2.55)
      .to(gs, { crouch: 1, duration: 0.35, ease: "power3.out" }, 2.55)
      .to(gs, { sq: 1, duration: 0.18, ease: "power2.out" }, 2.55).to(gs, { sq: 0, duration: 0.5, ease: "power2.out" }, 2.75)
      .to(gs, { crouch: 0, duration: 1.3, ease: "power2.inOut" }, 3.4)
      .to(gs, { x: vw * (mob ? 0.16 : 0.12), duration: 5, ease: "power1.inOut" }, A - 3.5)
      .to(gs, { x: vw * 1.22, duration: 4.2, ease: "power1.in" }, end + 0.6).set(gs, { o: 0 }, end + 4.8);
    const marks = QA(".gx-st, .gx-box", gx);
    let ltx = null;
    SX.scenes.push({
      active: () => gs.o > 0 && gxState.on,
      step(dt, T, f) {
        const ivh = innerHeight, S = SX.salvo.S;
        f.x = gs.x; f.y = ivh * (mob ? 0.95 : 0.965) - gs.dy; f.s = (ivh * (mob ? 0.25 : 0.36)) / (1.8 * SX.salvo.pxm); f.o = gs.o;
        T.fall = gs.fall; T.crouch = gs.crouch; T.air = clamp(gs.dy / (ivh * 0.25), 0, 1);
        if (!S._busy) S.squash = gs.sq;
        f.raw = true;
        const tx = gsap.getProperty(gxState.track, "x") || 0;
        f.gd = ltx == null ? 0 : (tx - ltx) * 0.42;
        ltx = tx;
        // Looks at the word near the cursor (within .32 of screen width)
        const cr = gxState.cur.getBoundingClientRect(), cx0 = cr.left + 10;
        let best = null, bd = innerWidth * 0.32;
        f.look = [cx0, cr.top + 10];
        marks.forEach((el) => {
          const q = el.getBoundingClientRect(), mx = q.left + q.width / 2;
          if (mx < innerWidth * 0.03 || mx > innerWidth * 0.97 || parseFloat(getComputedStyle(el).opacity) < 0.2) return;
          const d = Math.abs(mx - cx0);
          if (d < bd) { bd = d; best = [mx, q.top + q.height / 2]; }
        });
        if (best) f.look = best;
      },
    });
    addEventListener("scroll", () => !gxState.on && (ltx = null), { passive: true });
  };

  const bootGx = () => { buildGx(); gxMascot(); ScrollTrigger.refresh(); };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(bootGx);

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Card numbers: each slot rolls up from below
    QA("[data-roll-num]").forEach((el) => {
      const s = split(el);
      gsap.from(s, { yPercent: 100, duration: 0.9, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } });
    });
  });

  // Showreel (992 and up only, original Webflow scroll interaction): the 250vh cell from entering the bottom of the screen until fully exiting the top is set as 0–100, and
  // From 32 to 60 a 50vw×40vh box with 40px corners grows to 100vw×100vh with 0, the side text appears at 32~42 and moves in to 34vw from the center by 60 (linear, smoothed 90)
  mm.add("(prefers-reduced-motion: no-preference) and (min-width: 992px)", () => {
    gsap.set(".h-reel__t", { opacity: 0, x: 0, yPercent: -50 });
    gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: ".h-reel__track", start: "top bottom", end: "bottom top", scrub: 0.5 } })
      .set({}, {}, 100)
      .to(".h-reel__mask", { width: "100vw", height: "100vh", borderRadius: 0, duration: 28 }, 32)
      .to(".h-reel__t", { opacity: 1, duration: 10 }, 32)
      .to(".h-reel__t.one", { x: () => innerWidth * 0.34, duration: 28 }, 32)
      .to(".h-reel__t.two", { x: () => -innerWidth * 0.34, duration: 28 }, 32);
  });

  // Showreel video: doesn’t autoplay like the original, only loop is set. Loads metadata only when within 1.5 screens, play and pause with the button
  const reelV = Q(".h-reel__video"), reelB = Q(".h-reel__btn");
  if (reelV && reelB) {
    const io = new IntersectionObserver((e) => {
      if (!e[0].isIntersecting) return;
      io.disconnect();
      reelV.preload = "metadata";
      reelV.src = reelV.dataset.src;
    }, { rootMargin: "150% 0px" });
    io.observe(reelV);
    const sync = () => {
      const on = !reelV.paused;
      reelB.setAttribute("aria-pressed", String(on));
      reelB.setAttribute("aria-label", on ? "Video paused" : "Video playback");
      Q(".is-pause", reelB).hidden = !on;
      Q(".is-play", reelB).hidden = on;
    };
    reelV.addEventListener("play", sync);
    reelV.addEventListener("pause", sync);
    reelB.addEventListener("click", () => {
      if (!reelV.src) reelV.src = reelV.dataset.src;
      reelV.paused ? reelV.play().catch(() => {}) : reelV.pause();
    });
  }

  // Work card fan (original Webflow interaction): on desktop, when the mouse enters the photo area the outer cards spread ±44·±22px and the center one lifts 6px (.55s power3.out, reverses on leave),
  // At 991 and below, the card opens over .7s when it reaches 70% of the screen and folds back when scrolled back up
  const fanTl = (card, dur) => {
    const tl = gsap.timeline({ paused: true, defaults: { duration: dur, ease: "power3.out" } });
    [["l2", -44], ["l1", -22], ["r1", 22], ["r2", 44]].forEach(([k, x]) => { const el = Q(`.h-fan.${k} .wf-img`, card); el && tl.fromTo(el, { x: 0 }, { x }, 0); });
    const c = Q(".h-fan.c .wf-img", card);
    c && tl.fromTo(c, { y: 0 }, { y: -6 }, 0);
    return tl;
  };
  mm.add("(prefers-reduced-motion: no-preference) and (min-width: 992px)", () => {
    QA(".h-card__tray").forEach((tray) => {
      const tl = fanTl(tray, 0.55);
      tray.addEventListener("mouseenter", () => tl.play());
      tray.addEventListener("mouseleave", () => tl.reverse());
    });
  });
  mm.add("(prefers-reduced-motion: no-preference) and (max-width: 991px)", () => {
    QA(".h-card").forEach((card) => {
      const tl = fanTl(card, 0.7);
      ScrollTrigger.create({ trigger: card, start: "top 70%", end: "bottom 20%", onEnter: () => tl.play(), onLeaveBack: () => tl.reverse() });
    });
  });

  // ---------- Award globe (canvas) ----------
  // Original values: tilt 16° (phone 26°) · rotation .0028/frame × speed · perspective 1600 · 6 meridians · 4 parallels · ring letters front .25+.75cos, back .03 to .08 ·
  // Scroll 0~.25 approach (+.3) .25~.85 fly in (×13) · text .3~.5 · line .7~.88 vanish · title .18~.4 · cream circle .5~.9
  const ag = Q(".ag");
  if (ag) {
    const pin = Q(".ag-pin", ag), cv = Q(".ag-cv", ag), ctx = cv.getContext("2d"), head = Q(".ag-head", ag), portal = Q(".ag-portal", ag);
    const names = [["Award Name 01", "0x Category Name"], ["Award Name 02", "Medal Name"], ["Award Name 03", "Category Name Here"], ["Award Name 04", "0x Category Name"], ["Award Name 05", "0x Category Name"]];
    const parts = [];
    names.forEach(([n, d]) => { parts.push({ c: n, d: 0 }, { c: " ", d: 0 }, { c: d, d: 1 }, { c: "  ·  ", d: 1 }); });
    const rgb = (css) => `rgb(${SX.color(css).map((v) => Math.round(v * 255)).join(",")})`;
    const INK = rgb("var(--kf-bg)"), GOLD = rgb("var(--site-gold)"), P = 1600;
    let W = 0, H = 0, DPR = 1, Rr = 1, sc = 1, ST = 0, CT = 1, fsN = 30, fsD = 14, rot = 0, speed = 1, boost = 0, zoom = 1, aChars = 1, aLines = 1;
    const fontN = () => `400 ${fsN}px "Bebas Neue", "Do Hyeon", sans-serif`, fontD = () => `400 ${fsD}px "DM Mono", monospace`;
    const measure = () => {
      W = pin.clientWidth; H = pin.clientHeight;
      const vw = innerWidth, mob = W < 768;
      fsN = clamp(vw * 0.034, 26, 54); fsD = clamp(vw * 0.0135, 13, 20);
      ctx.font = fontN(); parts.forEach((p) => !p.d && (p.w = ctx.measureText(p.c).width));
      ctx.font = fontD(); parts.forEach((p) => p.d && (p.w = ctx.measureText(p.c).width + fsD * 0.04 * p.c.length));
      const tot = parts.reduce((a, p) => a + p.w, 0) || 1;
      Rr = tot / (2 * Math.PI);
      let acc = 0;
      parts.forEach((p) => { p.a = (acc + p.w / 2) / Rr; acc += p.w; });
      const TILT = mob ? 26 : 16;
      ST = Math.sin((TILT * Math.PI) / 180); CT = Math.cos((TILT * Math.PI) / 180);
      sc = Math.min((W * (mob ? 0.9 : 1.15)) / (2 * Rr), (H * 0.34) / Rr);
      DPR = Math.min(devicePixelRatio || 1, 2);
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    };
    const draw = () => {
      const cx = W / 2, cy = H * 0.58, k = sc * zoom, r = Rr * k;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (aLines > 0.003) {
        ctx.lineWidth = 1; ctx.strokeStyle = INK;
        ctx.globalAlpha = 0.22 * aLines; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 0.12 * aLines; ctx.beginPath();
        for (let m = 0; m < 6; m++) { const rx = Math.abs(Math.cos((m * Math.PI) / 6 - rot)) * r; if (rx > 0.5) { ctx.moveTo(cx + rx, cy); ctx.ellipse(cx, cy, rx, r, 0, 0, Math.PI * 2); } }
        [-0.66, -0.33, 0.33, 0.66].forEach((f) => { const rr = Math.sqrt(1 - f * f) * r, y = cy + f * r; ctx.moveTo(cx + rr, y); ctx.ellipse(cx, y, rr, rr * ST, 0, 0, Math.PI * 2); });
        ctx.stroke();
        ctx.globalAlpha = 0.55 * aLines; ctx.strokeStyle = GOLD; ctx.beginPath();
        for (let j = 0; j <= 120; j++) {
          const a = (j / 120) * 2 * Math.PI, zz = Rr * Math.cos(a) * CT * sc, f = P / (P - zz);
          const x = cx + Rr * Math.sin(a) * k * f, y = cy + Rr * Math.cos(a) * ST * k * f;
          j ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
      }
      if (aChars > 0.003) {
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        let curD = -1;
        parts.forEach((p) => {
          if (!p.c.trim()) return;
          const an = p.a - rot, sa = Math.sin(an), ca = Math.cos(an);
          const X = Rr * sa, Y = Rr * ca * ST, Z = Rr * ca * CT, s = k * (P / (P - Z * sc));
          const px = cx + X * s, py = cy + Y * s;
          if (px < -p.w * s || px > W + p.w * s) return;
          ctx.globalAlpha = (ca > 0 ? 0.25 + 0.75 * ca : 0.03 + 0.05 * -ca) * aChars;
          if (curD !== p.d) { curD = p.d; ctx.font = p.d ? fontD() : fontN(); ctx.fillStyle = p.d ? GOLD : INK; }
          // Narrows along the tangent direction, and squashes vertically by the tilt
          ctx.setTransform(DPR * s * ca, 0, 0, DPR * s * CT, DPR * px, DPR * py);
          ctx.fillText(p.c, 0, 0);
          ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        });
      }
      ctx.globalAlpha = 1;
    };
    const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let pS = -1;
    const readP = () => { const r = ag.getBoundingClientRect(), len = ag.offsetHeight - pin.offsetHeight; return len > 0 ? clamp(-r.top / len, 0, 1) : 0; };
    const fly = (p) => {
      const pre = seg(p, 0, 0.25), f = ease(seg(p, 0.25, 0.85));
      zoom = 1 + pre * 0.3 + f * 13;
      aChars = 1 - seg(p, 0.3, 0.5);
      aLines = 1 - seg(p, 0.7, 0.88);
      const h = seg(p, 0.18, 0.4);
      head.style.opacity = (1 - h).toFixed(3);
      head.style.transform = `translate3d(0, ${(-h * 40).toFixed(1)}px, 0)`;
      portal.style.clipPath = `circle(${(ease(seg(p, 0.5, 0.9)) * 80).toFixed(2)}% at 50% 58%)`;
    };
    measure();
    new ResizeObserver(measure).observe(pin);
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(measure);
    let vis = true;
    new IntersectionObserver((e) => (vis = e[0].isIntersecting)).observe(ag);
    let ly = scrollY;
    addEventListener("scroll", () => { const dy = scrollY - ly; ly = scrollY; boost = Math.min(8, boost + Math.abs(dy) * 0.05); }, { passive: true });
    gsap.ticker.add(() => {
      if (!vis) return;
      const pT = readP();
      pS = pS < 0 || reduced ? pT : pS + (pT - pS) * 0.22;
      fly(pS);
      if (!reduced) { speed += (1 + boost - speed) * 0.06; boost *= 0.93; rot += 0.0028 * speed; }
      draw();
    });
  }

  // ---------- Repeating graphic inside service cards: runs only while visible ----------
  const loop = (el, build) => {
    const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.6, defaults: { ease: "power3.out" } });
    build(tl, (s) => el.querySelector(s), (s) => [...el.querySelectorAll(s)], el.clientWidth, el.clientHeight);
    if (reduced) { tl.progress(tl.labels.hold / tl.duration()).pause(); return; }
    new IntersectionObserver((e) => (e[0].isIntersecting ? tl.play() : tl.pause()), { threshold: 0.2 }).observe(el);
  };
  const press = (tl, cur, t) => tl.to(cur, { scale: 0.8, duration: 0.15, yoyo: true, repeat: 1 }, t);
  const ready = () => {
    loop(Q(".v-brand"), (tl, q, qa, W, H) => {
      const mk = q(".v-mk").getBoundingClientRect(), E = q(".v-mk").parentElement.getBoundingClientRect();
      const P = (x, y) => ({ x: mk.left - E.left + (x / 200) * mk.width, y: mk.top - E.top + ((y - 30) / 140) * mk.height });
      const cur = q(".v-cur");
      tl.set(cur, { x: W * 0.9, y: H * 1.05 })
        .fromTo(qa(".g"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, stagger: 0.25, ease: "power1.inOut" }, 0)
        .to(cur, P(70, 100), 0.2); press(tl, cur, 1);
      tl.from(q(".s1"), { scale: 0, transformOrigin: "70px 100px", duration: 0.9, ease: "back.out(1.8)" }, 1.1)
        .to(cur, P(130, 100), 1.4); press(tl, cur, 2);
      tl.from(q(".s2"), { scale: 0, transformOrigin: "130px 100px", duration: 0.9, ease: "back.out(1.8)" }, 2.1)
        .from(qa(".an rect"), { scale: 0, transformOrigin: "50% 50%", duration: 0.4, stagger: 0.08, ease: "back.out(3)" }, 2.4)
        .to(qa(".gd"), { opacity: 0, duration: 0.6 }, 3.2).to(q(".an"), { opacity: 0, duration: 0.4 }, 3.3)
        .from(qa(".v-wd span"), { autoAlpha: 0, duration: 0.05, stagger: 0.06, ease: "none" }, 3.4)
        .to(cur, { x: W * 0.8, y: H * 0.34, duration: 0.8, ease: "power2.inOut" }, 3.2)
        .from(qa(".v-sw i"), { scale: 0, duration: 0.5, stagger: 0.12, ease: "back.out(2.4)" }, 4.2)
        .from(q(".v-tag"), { y: -30, autoAlpha: 0, rotation: -12, duration: 0.7, ease: "back.out(2)" }, 4.4)
        .addLabel("hold", 5.4).to({}, { duration: 2 })
        .to(qa(":scope > *"), { autoAlpha: 0, duration: 0.5 }, 7.4);
    });
    loop(Q(".v-web"), (tl, q, qa, W, H) => {
      const cur = q(".v-cur"), el = q(".v-win").parentElement, E = el.getBoundingClientRect(), bt = q(".v-bt").getBoundingClientRect();
      tl.set(cur, { x: W * 0.95, y: H * 1.05 })
        .from(q(".v-win"), { y: H * 0.15, autoAlpha: 0, duration: 0.8 }, 0)
        .from(qa(".v-nav > *"), { autoAlpha: 0, y: -10, duration: 0.5, stagger: 0.15 }, 0.6)
        .from(q(".v-pg h4"), { clipPath: "inset(0 100% 0 0)", duration: 1.1, ease: "power2.inOut" }, 0.9)
        .from(q(".v-bt"), { scale: 0, transformOrigin: "0 50%", duration: 0.6, ease: "back.out(2.2)" }, 1.8)
        .from(qa(".v-cds i"), { y: H * 0.2, autoAlpha: 0, duration: 0.6, stagger: 0.15, ease: "back.out(1.6)" }, 2.2)
        .to(cur, { x: bt.left - E.left + bt.width * 0.7, y: bt.top - E.top + bt.height * 0.6, duration: 1, ease: "power2.inOut" }, 2.4);
      press(tl, cur, 3.5);
      tl.to(q(".v-bt"), { backgroundColor: "var(--site-coral)", color: "var(--kf-ink)", duration: 0.3 }, 3.6)
        .from(q(".v-tag"), { y: -30, autoAlpha: 0, rotation: -14, duration: 0.7, ease: "back.out(2.2)" }, 3.9)
        .addLabel("hold", 4.6).to({}, { duration: 2.2 })
        .to(qa(":scope > *"), { autoAlpha: 0, duration: 0.5 }, 6.8);
    });
    loop(Q(".v-film"), (tl, q, qa) => {
      const tc = q(".v-tc"), c = { f: 0 }, pad = (n) => String(n).padStart(2, "0");
      tl.from(qa(".v-vf > i"), { scale: 1.6, autoAlpha: 0, duration: 0.6, stagger: 0.08 }, 0)
        .from(q(".v-fc"), { scale: 2.2, autoAlpha: 0, duration: 0.6 }, 0.4).to(q(".v-fc"), { scale: 0.86, duration: 0.25, yoyo: true, repeat: 3, ease: "power1.inOut" }, 1)
        .from(q(".v-hz"), { scaleX: 0, duration: 0.6 }, 0.6)
        .from(q(".v-rec"), { autoAlpha: 0, duration: 0.3 }, 1.4).to(q(".v-rec i"), { opacity: 0.2, duration: 0.4, yoyo: true, repeat: 7, ease: "steps(1)" }, 1.6)
        .to(c, { f: 130, duration: 4.8, ease: "none", onUpdate: () => { const f = Math.round(c.f); tc.textContent = `00:00:${pad(Math.floor(f / 25))}:${pad(f % 25)}`; } }, 1.4)
        .from(qa(".v-tr.a i"), { scaleX: 0, transformOrigin: "0 50%", duration: 0.5, stagger: 0.25, ease: "power2.out" }, 1.6)
        .from(qa(".v-tr.b i"), { scaleX: 0, transformOrigin: "0 50%", duration: 0.7, stagger: 0.3, ease: "power2.out" }, 2)
        .fromTo(q(".v-ph"), { left: "0%" }, { left: "96%", duration: 4.6, ease: "none" }, 1.6)
        .from(q(".v-st"), { scale: 2.4, rotation: -14, autoAlpha: 0, duration: 0.8, ease: "back.out(2)" }, 4.2)
        .addLabel("hold", 5).to({}, { duration: 1.6 })
        .to(qa(":scope > *"), { autoAlpha: 0, duration: 0.5 }, 6.6);
    });
    loop(Q(".v-plan"), (tl, q, qa, W, H) => {
      const cur = q(".v-cur"), el = cur.parentElement, E = el.getBoundingClientRect(), zl = q(".v-zl").getBoundingClientRect();
      // Each note is picked up from off-screen and stuck on at a tilt
      const off = [[-0.3, -0.2, -20], [0.3, -0.25, 18], [-0.3, 0.3, -14], [0.3, 0.35, 16]];
      tl.set(cur, { x: W * 0.95, y: H * 1.05 });
      qa(".v-n").forEach((n, i) => {
        const r = n.getBoundingClientRect(), cx = r.left - E.left + r.width / 2, cy = r.top - E.top + r.height / 2, o = off[i], t = 0.2 + i * 0.75;
        tl.to(cur, { x: cx + W * o[0], y: cy + H * o[1], duration: 0.5, ease: "power2.inOut" }, t).to(cur, { scale: 0.8, duration: 0.12, yoyo: true, repeat: 1 }, t + 0.5)
          .from(n, { x: W * o[0], y: H * o[1], rotation: o[2], autoAlpha: 0, scale: 1.1, duration: 0.6, ease: "power2.inOut" }, t + 0.6)
          .to(cur, { x: cx, y: cy, duration: 0.6, ease: "power2.inOut" }, t + 0.6);
      });
      tl.to(cur, { x: zl.left - E.left + zl.width / 2, y: zl.top - E.top + zl.height / 2, duration: 0.7, ease: "power2.inOut" }, 3.4).to(cur, { scale: 0.8, duration: 0.12, yoyo: true, repeat: 1 }, 4.1)
        .from(q(".v-zl"), { scale: 0, rotation: -60, duration: 0.8, ease: "back.out(2)" }, 4.2).to(cur, { x: W * 0.8, y: H * 0.86, duration: 0.7, ease: "power2.inOut" }, 4.6)
        .from(q(".v-tag"), { y: 30, autoAlpha: 0, duration: 0.6 }, 4.6)
        .addLabel("hold", 5.2).to({}, { duration: 2 })
        .to(qa(":scope > *"), { autoAlpha: 0, duration: 0.5 }, 7.2);
    });
  };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(ready);
})();
