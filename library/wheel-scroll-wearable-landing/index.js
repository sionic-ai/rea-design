/* Home — everything is a function of the clock p (shared.js). The original map (raw p): 
     0        Hero: a glowing skull on the left board, a dot-halftone model in the right viewer, a big title
     0 → 1    Hero melts upward and the mask moves to the center (checker halftone)
     1 → 4.3  A giant statement rises behind the mask and the top lines blur out first
     4.3 → 5.3 dive into the mask (grows and spreads while the colors split)
     5.3 → 6.2 Hyperspace stripes
     6.2 → 9.6 three filter-layer discs and airflow (at sections 6.6·7.8·9.0 the disc spacing widens and the viewpoint turns), legend strip below
     9.6 → 10.2 cream flash → X-ray skeleton (four poses 10.6·11.4·12.1·12.8·13.5, center card and green progress bar)
     13.3 → 14.3 the red section rises from below and covers
     14.3 → 16.6 The product name group rises, a huge blurred word grows behind it and vanishes, and the group moves up
     16.9 → 18.6 body · label row · edition card · faded word column · 2026 row
     18.6 → 19.6 only the card remains and grows while ‹/› fills the screen
     19.6 → 20.6 The / blurs into a pillar of light and, after the skeleton turns back in, the footer text
   Phone (720px and below) is a one-screen gate (shared.js) like the original, so it doesn’t spin here. */
(() => {
  const NF = window.NF;
  if (!NF || NF.phone) return;
  const root = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const { seg, mix, sm, band, reduce } = NF;
  const eio = NF.ease("power3.inOut"), eo = NF.ease("power3.out"), exio = NF.ease("expo.inOut"), sio = NF.ease("sine.inOut");
  const W = window.NFWorld;

  /* ---- 3D ---- */
  const w = W.create($("#gl"));
  const T = W.T;
  const skull = W.skull(); w.scene.add(skull);
  const skullMats = new Set(); skull.traverse((o) => o.material && skullMats.add(o.material));
  skullMats.forEach((m) => { m.transparent = true; });
  const mask = W.mask(); w.scene.add(mask);
  const fl = W.filters(); w.scene.add(fl);
  const air = W.streams(); w.scene.add(air);
  const warp = W.warp(); w.scene.add(warp);
  const skel = W.skeleton(W.xrayMat(W.color("--kf-line", 0.45), 1.15, 1, T.NormalBlending)); w.scene.add(skel);
  const models = [W.mask(), W.mask(), W.canisters()];
  models[1].rotation.y = -1.1;
  const holders = models.map((m) => { const g = new T.Group(); g.add(m); g.visible = false; w.view.add(g); return g; });
  holders[0].scale.setScalar(1.05); holders[1].scale.setScalar(1.05); holders[2].scale.setScalar(0.95);
  w.warm();

  /* ---- Hero device: model picker (next every 6s, red line fills) · crosshair follows the cursor · scan button is p 1 ---- */
  const hero = $(".hero"), hud = $(".hud"), col = $(".col"), viewer = $(".viewer");
  const thumbs = $$(".thumb");
  let active = Math.max(0, thumbs.findIndex((t) => t.classList.contains("is-active"))), cyc = 0, swapAt = -9;
  const select = (i) => {
    active = (i + thumbs.length) % thumbs.length; cyc = 0; swapAt = performance.now() / 1000;
    thumbs.forEach((t, k) => { t.classList.toggle("is-active", k === active); t.setAttribute("aria-pressed", String(k === active)); });
  };
  thumbs.forEach((t, i) => t.addEventListener("click", () => select(i)));
  $(".scan").addEventListener("click", () => NF.go(1));
  const cross = { x: null, y: null, tx: null, ty: null };
  addEventListener("pointermove", (e) => { cross.tx = e.clientX; cross.ty = e.clientY; });
  const tilt = { x: 0, y: 0 }, par = { x: 0, y: 0 };
  let smearAt = null;
  const lx = $(".coord--x .t:last-child"), ly = $(".coord--y .t:first-child");
  const crossX = $$(".rule--v, .tee--top, .tee--bottom", hud), crossY = $$(".rule--h, .tee--left, .tee--right, .coord", hud);

  /* ---- Story DOM ---- */
  const bigs = $$(".st-big"), bigTex = $(".st-big--tex"), bigLines = $$(".st-big:not(.st-big--tex) span"), texLines = $$(".st-big--tex span");
  const xbg = $(".st-xbg"), tag = $(".st-tag"), legend = $(".st-legend"), scrollL = $(".st-scroll--l"), scrollC = $(".st-scroll--c");
  const rings = $(".st-rings"), body = $(".st-body"), bodyTxt = $(".st-body__txt"), bar = $(".st-body__bar"), pic = $(".st-body__pic");
  bar.innerHTML = "<i></i>".repeat(65);
  const ticks = $$("i", bar);
  const POSES = ["Active support layer engaged", "Adaptive air support", "Product shell", "Wearable series"];
  const red = $(".st-red"), giant = $(".st-giant"), lock = $(".st-lockup"), lede = $(".st-lede"), divs = $$(".st-div"), labs = $$(".st-lab");
  const card = $(".st-card"), cardSkin = $$(".st-card__title, .st-card__list, .st-card .st-brk"), foot = $(".st-foot");
  const WORDS = ["Lightweight", "Sensor ready", "Field tested", "Low profile", "Modular", "Adaptive", "Breathable", "Washable", "Quiet flow", "Long range", "Daily wear", "Fast fit", "Soft seal", "Clear view", "Fresh air", "Calm mode"];
  const column = (n, o) => Array.from({ length: n }, (_, i) => `<p>${WORDS[(i + o) % WORDS.length]}</p>`).join("");
  $(".st-cols").innerHTML = `<div class="st-cmove"><div class="st-col st-col--1">${column(140, 0)}</div><div class="st-col st-col--2">${column(140, 5)}</div><div class="st-col st-col--3">${column(140, 9)}</div><div class="st-col st-col--4">${column(140, 13)}</div></div>`;
  const cols = $(".st-cols"), cmove = $(".st-cmove");
  const textEls = [scrollL, scrollC, ...$$(".st-lab .t"), ...$$(".st-foot .t"), ...$$(".st-card__list li > span"), lede];
  textEls.forEach((el) => NF.lines.prime(el));
  const fin = NF.footer($(".fin-host"));
  const nav = $(".nf-nav");

  /* The scale at which the card ”/” matches the footer light pillar’s ”/”: pillar 67px → 473px */
  const CARD_MAX = 473 / 67;

  /* ---- Loader → entry: block skull 3.4s, then after 0.15s the skull moves to the left panel (1s, blocks get finer), 0.5s header row, 0.8s HUD frame, 1.1s text ---- */
  const intro = { start: performance.now() / 1000 + (reduce ? -10 : 0), go: reduce ? -10 : 4.9 };
  const E = "cubic-bezier(.215,.61,.355,1)";
  const heroLabels = $$(".hero .lbl, .hero .v-lbl--1, .hero .v-lbl--2, .hero .v-lbl--range, .hero .v-lbl--mid, .hero .v-lbl--max");
  heroLabels.forEach((el) => NF.lines.prime(el));
  const title = $(".title"), tLines = $$(".title__type > *");
  let liquid = null;
  function liquidReveal() {
    if (reduce) return;
    const fs = parseFloat(getComputedStyle($(".title__type")).fontSize);
    const C = { delay: 0.2, gap: 0.32, dur: 0.8, blur: 0.12 };
    const t0 = performance.now() / 1000;
    title.classList.add("is-liquid");
    liquid = (now) => {
      let done = true;
      tLines.forEach((el, i) => {
        const row = Math.min(i, 2);
        const t = seg(0, C.dur, now - t0 - C.delay - row * C.gap);
        if (t < 1) done = false;
        const left = 1 - eo(t);
        el.style.opacity = t > 0 ? 1 : 0;
        el.style.filter = t > 0 && t < 1 ? `blur(${(left * C.blur * fs).toFixed(2)}px)` : "";
        el.style.transform = t < 1 && el.classList.contains("ln") ? `scaleX(${mix(0.92, 1, eo(t))})` : "";
      });
      if (done) { title.classList.remove("is-liquid"); tLines.forEach((el) => { el.style.filter = el.style.transform = ""; el.style.opacity = ""; }); liquid = null; }
    };
    tLines.forEach((el) => { el.style.opacity = 0; });
  }
  function enter() {
    if (!reduce) tLines.forEach((el) => { el.style.opacity = 0; });
    root.classList.remove("is-booting");
    const ldr = $(".nf-ldr");
    if (reduce) { ldr.remove(); heroLabels.forEach((el) => NF.lines.show(el)); return; }
    ldr.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350, easing: "ease", fill: "forwards" }).finished.then(() => ldr.remove());
    $(".hero-grad").animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, easing: "ease" });
    nav.animate([{ opacity: 0, transform: "translate3d(0,-10px,0)" }, { opacity: 1, transform: "none" }], { duration: 700, delay: 500, easing: E, fill: "backwards" });
    $$(".brk, .tee, .rule, .coord", hud).forEach((el, i) => el.animate([{ opacity: 0 }, { opacity: el.classList.contains("rule") ? 0.2 : 1 }], { duration: 600, delay: 800 + i * 40, easing: E, fill: "backwards" }));
    viewer.animate([{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0 0)" }], { duration: 700, easing: E });
    $$(".thumbs, .scan, .tick", viewer).forEach((el, i) => el.animate([{ opacity: 0, transform: el.classList.contains("scan") ? "translateX(-50%) translate3d(0,10px,0)" : "translate3d(0,10px,0)" }, { opacity: 1, transform: el.classList.contains("scan") ? "translateX(-50%)" : "none" }], { duration: 700, delay: 1100 + i * 60, easing: E, fill: "backwards" }));
    $$(".title__icon").forEach((el, i) => el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 1600 + i * 80, easing: E, fill: "backwards" }));
    setTimeout(liquidReveal, 1100);
    setTimeout(() => heroLabels.forEach((el, i) => NF.lines.show(el, i * 0.06)), 1100);
  }
  if (reduce) enter(); else setTimeout(enter, intro.go * 1000);

  /* ---- Skeleton pose: [rotate y, camera z, height, tilt] ---- */
  const POSE = [[Math.PI, 4.4, -0.95, 0], [0.05, 7.4, -0.2, 0], [Math.PI + 0.45, 4.6, -0.8, 0.08], [Math.PI - 0.35, 4.1, -1.2, -0.06]];
  const POSE_AT = [10.6, 11.4, 12.1, 12.8];
  function poseAt(p) {
    let i = 0; while (i < POSE_AT.length - 1 && p > POSE_AT[i + 1]) i++;
    const a = POSE[i], b = POSE[Math.min(i + 1, POSE.length - 1)];
    const k = i < POSE_AT.length - 1 ? eio(seg(POSE_AT[i] + 0.15, POSE_AT[i + 1], p)) : 0;
    return a.map((v, j) => mix(v, b[j], k));
  }
  let poseShown = -1;

  /* ---- One frame ---- */
  const vR = new T.Vector3();
  NF.onFrame((p, dt, now) => {
    const t = now - intro.start;
    const H = innerHeight, Wd = innerWidth;
    if (liquid) liquid(now);

    /* Model selection progress line */
    if (!reduce && p < 1) { cyc += dt / 6; if (cyc >= 1) select(active + 1); }
    const th = thumbs[active]; if (th) th.style.setProperty("--progress", cyc.toFixed(4));

    /* Crosshair — confined inside the panel and follows with exponential decay (12/s). Within 1px it snaps in place and stops, and it writes only when the value changes (nothing changes while idle) */
    if (cross.tx != null) {
      const R = Wd * 0.598611;
      const tx = Math.min(R - 41, Math.max(46, cross.tx)), ty = Math.min(H - 14, Math.max(95, cross.ty));
      const k = reduce ? 1 : 1 - Math.exp(-dt * 12);
      cross.x = cross.x == null ? tx : mix(cross.x, tx, k); cross.y = cross.y == null ? ty : mix(cross.y, ty, k);
      if (Math.abs(tx - cross.x) < 1) cross.x = tx;
      if (Math.abs(ty - cross.y) < 1) cross.y = ty;
      const key = cross.x.toFixed(1) + "," + cross.y.toFixed(1) + "," + R.toFixed(0) + "," + H;
      if (key !== cross.key) {
        cross.key = key;
        const dxp = cross.x - (5 + R) / 2, dyp = cross.y - H / 2;
        crossX.forEach((el) => { el.style.transform = `translate3d(${dxp.toFixed(1)}px,0,0)`; });
        crossY.forEach((el) => { el.style.transform = `translate3d(0,${dyp.toFixed(1)}px,0)`; });
        hud.style.setProperty("--fade-v", (((cross.y - 95) / (H - 109)) * 100).toFixed(1) + "%");
        hud.style.setProperty("--fade-h", (((cross.x - 46) / (R - 87)) * 100).toFixed(1) + "%");
        lx.textContent = Math.round(cross.x); ly.textContent = Math.round(cross.y);
      }
    }

    /* 0 → 1 Hero drops out */
    const out = eio(seg(0, 1, p));
    root.style.setProperty("--grad-o", (1 - Math.min(1, out * 1.4)).toFixed(3));
    /* The hero lifts up a full screen as a whole (original: going to p 1 via the scan button, 0 → -900 for .48s after .29s) */
    const lk = seg(0.005, 0.995, p);
    const lift = `translate3d(0,${(-lk * H).toFixed(1)}px,0)`;
    hud.style.transform = lift; col.style.transform = lift;
    /* The speckle board moves down 450px per line (original: background-position 0 → 450 during the .48s the hero slides out) */
    const tpy = (lk * 450).toFixed(1) + "px";
    texLines.forEach((el) => el.style.setProperty("--tpy", tpy));
    nav.style.opacity = 1 - sm(seg(19.35, 19.6, p));
    nav.style.visibility = p < 19.6 ? "" : "hidden";

    /* 1 → 4.3 Giant statement — when the hero has almost left (p .874) the lines on screen appear all at once, and each line flashes a 7px blur smear for .167s and then clears
       (original jam: going to p 1 with the scan button, first line at .67s, second line .15s later). Scrolling back up blurs it again */
    const bigOn = p < 4.4;
    bigs.forEach((b) => { b.style.visibility = bigOn ? "visible" : "hidden"; });
    bigTex.style.opacity = sm(seg(1.25, 1.5, p)).toFixed(3);
    if (bigOn) {
      const y = mix(H * 0.8, H * 0.8 - 3.2 * H, sio(seg(1.0, 4.3, p)));
      bigs.forEach((b) => { b.style.transform = `translate3d(0,${y.toFixed(1)}px,0)`; });
      const appear = p >= 0.874;
      if (appear && smearAt == null) smearAt = now;
      if (!appear) smearAt = null;
      bigLines.forEach((el, i) => {
        const top = y + el.offsetTop, cy = top + el.offsetHeight / 2;
        const k = sm(seg(H * 0.55, H * 0.05, cy));
        const shown = appear && top < H;
        const since = smearAt == null ? -1 : now - smearAt - i * 0.15;
        const blur = !reduce && i < 2 && since >= 0 && since < 0.167 ? 7 : 0;
        const b = Math.max(blur, k * 16);
        el.style.setProperty("--lk", lk.toFixed(3));
        el.style.filter = shown && b > 0.01 ? `blur(${b.toFixed(1)}px)` : "";
        el.style.opacity = shown ? (1 - k * 0.45).toFixed(3) : 0;
      });
    }

    /* UI of the filter-layer dive */
    const fab = band(6.2, 6.5, 9.4, 9.6, p);
    legend.style.visibility = fab > 0.01 ? "visible" : "hidden";
    legend.style.transform = `translate3d(0,${((1 - fab) * 30).toFixed(1)}px,0)`;
    legend.style.opacity = fab;
    scrollL.style.visibility = legend.style.visibility;
    NF.lines.set(scrollL, fab > 0.5);

    /* X-ray */
    const xr = band(9.85, 10.2, 13.6, 14.3, p);
    xbg.style.visibility = xr > 0.01 ? "visible" : "hidden"; xbg.style.opacity = xr;
    rings.style.visibility = xbg.style.visibility; rings.style.opacity = band(10.2, 10.6, 13.3, 13.6, p);
    const bo = band(10.9, 11.2, 13.3, 13.6, p);
    body.style.visibility = bo > 0.01 ? "visible" : "hidden";
    body.style.opacity = bo; body.style.transform = `scale(${mix(0.92, 1, eo(bo))})`;
    pic.style.clipPath = `inset(0 ${((1 - sm(seg(10.95, 11.4, p))) * 100).toFixed(1)}% 0 0)`;
    const pi = p < 11.75 ? 0 : p < 12.45 ? 1 : p < 13.15 ? 2 : 3;
    if (pi !== poseShown && bo > 0.5) { poseShown = pi; bodyTxt._lines = null; bodyTxt._lt0 = null; bodyTxt.textContent = POSES[pi]; NF.lines.show(bodyTxt); }
    if (bo <= 0.5 && poseShown !== -1) { poseShown = -1; NF.lines.hide(bodyTxt); }
    const on = Math.round(seg(10.9, 13.5, p) * ticks.length);
    ticks.forEach((el, i) => el.classList.toggle("on", i < on));
    scrollC.style.visibility = rings.style.visibility;
    NF.lines.set(scrollC, xr > 0.5 && p < 13.3);

    /* 13.3 → red section */
    const rIn = eio(seg(13.3, 14.3, p));
    red.style.visibility = p > 13.3 && p < 19.62 ? "visible" : "hidden";
    red.style.transform = `translate3d(0,${((1 - rIn) * 100).toFixed(2)}%,0)`;
    if (p > 13.3 && p < 19.62) {
      const up = eo(seg(14.3, 15.3, p)), top = eio(seg(16.0, 16.6, p));
      const leave = sm(seg(18.6, 18.9, p));
      const s = mix(1.75, 0.87, top);
      const ly0 = mix(H + 20, H / 2 - 58 * 1.75, up);
      lock.style.transform = `translate3d(0,${mix(ly0, 30, top).toFixed(1)}px,0) scale(${s.toFixed(3)})`;
      lock.style.opacity = 1 - leave;
      const gk = seg(15.0, 16.3, p);
      giant.style.opacity = band(15.0, 15.4, 16.0, 16.5, p);
      giant.style.top = (H * 0.62 - giant.offsetHeight) + "px";
      giant.style.transform = `scaleY(${mix(0.2, 2.6, eo(gk)).toFixed(3)})`;
      lede.style.transform = `translate3d(0,${(30 + 116 * 0.87 + 10).toFixed(1)}px,0)`;
      lede.style.opacity = 1 - leave;
      NF.lines.set(lede, p > 16.9 && p < 18.9);
      const lab = sm(seg(17.3, 17.6, p)), spread = eio(seg(17.9, 18.4, p));
      divs.forEach((d) => { d.style.opacity = lab * (1 - leave); });
      labs.forEach((el) => {
        const k = el.dataset.k;
        const y = k === "class" || k === "state" ? mix(334, 40, spread) : k === "layer" || k === "terrain" ? mix(334, 440, spread) : 334;
        el.style.transform = `translate3d(0,${y}px,0)`;
        el.style.opacity = (k === "status" ? lab * (1 - spread) : lab) * (1 - leave);
        $$(".t", el).forEach((s) => NF.lines.set(s, lab > 0.3 && p < 18.9));
      });
      cols.style.opacity = sm(seg(17.9, 18.2, p)) * (1 - leave);
      cmove.style.transform = `translate3d(0,${mix(H * 0.7, -1350, seg(17.9, 18.9, p)).toFixed(1)}px,0)`;
      foot.style.opacity = sm(seg(18.0, 18.3, p)) * (1 - leave);
      $$(".t", foot).forEach((s) => NF.lines.set(s, p > 18.0 && p < 18.9));
      const ci = eo(seg(17.6, 18.1, p)), cx = exio(seg(18.9, 19.6, p));
      card.style.visibility = p > 17.6 ? "visible" : "hidden";
      const cy = mix(H + 20, H / 2 - 210, ci);
      card.style.transform = `translate3d(0,${cy.toFixed(1)}px,0) scale(${mix(1, CARD_MAX, cx).toFixed(4)})`;
      cardSkin.forEach((el) => { el.style.opacity = 1 - sm(seg(19.15, 19.45, p)); });
      card.style.background = p > 19.3 ? "transparent" : "";
      $$(".st-card__list li > span").forEach((s) => NF.lines.set(s, ci > 0.6));
    }

    /* 19.6 → Footer */
    fin(p >= 19.6, seg(19.6, 20.1, p), seg(20.1, 20.6, p), now);

    /* ---- 3D state ---- */
    const show3d = p < 14.3 || reduce;
    $("#gl").style.visibility = show3d ? "visible" : "hidden";
    if (!show3d) return;
    const U = w.U;
    /* Skull: loader (center · small · 10px blocks) → left panel (blocks get finer) → rises up as the Hero leaves */
    const ti = reduce ? 1 : eo(seg(intro.go + 0.15, intro.go + 1.15, t));
    const fx = mix(0.5, 0.3, ti), sc = mix(0.24, 1.0, ti);
    skull.position.set(w.worldX(fx), w.worldY(0.5) + out * 3.2, 0);
    skull.scale.setScalar(sc * (1 - out * 0.3));
    /* Cursor: the loader skull follows 5% per frame (.08·.05 rad), the hero skull follows with damping 40/s, rotating .12·.06 rad, and the camera shifts .35·.25 (original engine parallax 1) */
    const px = cross.tx == null ? 0 : cross.tx / Wd * 2 - 1, py = cross.ty == null ? 0 : cross.ty / H * 2 - 1;
    tilt.x += (px - tilt.x) * 0.05; tilt.y += (py - tilt.y) * 0.05;
    const kd = 1 - Math.exp(-40 * dt);
    par.x += (px - par.x) * kd; par.y += (-py - par.y) * kd;
    const live = t > intro.go ? 1 : 0;
    skull.rotation.y = reduce ? 0.15 : 0.15 + (live ? par.x * 0.6 : tilt.x * 0.08) + Math.sin(now * 0.6) * 0.04;
    skull.rotation.x = reduce ? 0 : (live ? -par.y * 0.25 : tilt.y * 0.05) + Math.sin(now * 0.8) * 0.02;
    w.cam.position.x = reduce || p > 1 ? 0 : par.x * 0.35 * live * (1 - out);
    w.cam.position.y = reduce || p > 1 ? 0 : par.y * 0.25 * live * (1 - out);
    const so = 1 - sm(seg(0, 0.5, p));
    skullMats.forEach((m) => { m.opacity = so; });
    skull.visible = so > 0.01;
    U.uPix.value = reduce ? 0 : t < intro.go ? 10 : mix(10, 0, ti) < 1.2 ? 0 : mix(10, 0, ti);

    /* Mask: 0 → 1 grows from the viewer spot to the center, 4.3 → 5.3 dives toward the camera */
    const dive = eio(seg(4.3, 5.3, p));
    mask.visible = p > 0.02 && p < 5.4;
    const vr = viewer.getBoundingClientRect();
    const mfx = mix((vr.left + vr.width / 2) / Wd, 0.5, out), mfy = mix((vr.top + vr.height / 2) / H, 0.48, out);
    mask.position.set(w.worldX(mfx), w.worldY(mfy), mix(0, 5.6, dive));
    mask.scale.setScalar(mix(0.55, 1.32, out));
    mask.rotation.set(mix(0.2, 0.05, out) + dive * 0.3, mix(-0.9, 0, out) + dive * 0.5 + (reduce ? 0 : Math.sin(now * 0.4) * 0.04), 0);

    /* Hyperspace · filter layer */
    const wp = band(5.1, 5.4, 6.0, 6.3, p);
    warp.visible = wp > 0.01;
    if (warp.visible) { warp.userData.step(reduce ? 0 : dt, 0.3 + wp * 1.2); warp.material.opacity = wp; }
    const fo = band(6.0, 6.4, 9.5, 9.75, p);
    fl.visible = air.visible = fo > 0.01;
    if (fl.visible) {
      const st = p < 7.8 ? mix(0.95, 1.25, eio(seg(6.6, 7.8, p))) : mix(1.25, 1.6, eio(seg(7.8, 9.0, p)));
      fl.userData.discs.forEach((d, i) => { d.position.x = (i - 1) * st; });
      const ang = p < 7.8 ? mix(0.62, 0.35, eio(seg(6.6, 7.8, p))) : mix(0.35, -0.12, eio(seg(7.8, 9.0, p)));
      fl.rotation.set(0.12, ang, -0.08);
      air.rotation.copy(fl.rotation);
      fl.scale.setScalar(mix(0.6, 1, eo(seg(6.0, 6.6, p))));
      air.scale.copy(fl.scale);
      air.userData.step(reduce ? 0 : dt, st - 0.95);
      air.material.opacity = fo;
      const mid = fl.userData.discs[1];
      vR.set(0, 0.35, 0.6); mid.localToWorld(vR); vR.project(w.cam);
      tag.style.visibility = fo > 0.3 && p > 6.5 ? "visible" : "hidden";
      tag.style.left = ((vR.x * 0.5 + 0.5) * Wd).toFixed(1) + "px"; tag.style.top = ((-vR.y * 0.5 + 0.5) * H).toFixed(1) + "px";
    } else tag.style.visibility = "hidden";

    /* Skeleton */
    skel.visible = p > 9.85 && p < 14.3;
    if (skel.visible) {
      const [ry, cz, yy, rz] = poseAt(p);
      skel.rotation.set(0, ry + (reduce ? 0 : Math.sin(now * 0.3) * 0.03), rz);
      skel.position.set(0, yy, 0);
      w.cam.position.z = cz;
    } else w.cam.position.z = 8;

    /* Screen effects: skull halo and drag trail → mask checker → dive bleed and split → flash → skeleton checker */
    const heroFx = (1 - out) * (t > intro.go ? 1 : 0);
    const diveFx = dive * (1 - seg(5.1, 5.4, p));
    U.uGlow.value = heroFx * 1.0 + diveFx * 1.6;
    U.uSmear.value = heroFx * (reduce ? 0 : 1);
    U.uAberr.value = mix(3, 2, out) * (1 - fo) + diveFx * 10 + fo * 1.2;
    U.uHalf.value = (out > 0 ? out * 0.85 : 0) * (1 - dive) + (skel.visible ? 0.55 : 0);
    U.uCell.value = 3;
    U.uFlash.value = band(9.55, 9.85, 9.95, 10.25, p);
    U.uFade.value = 1;
    const vOn = (1 - sm(seg(0, 0.25, p))) * (t > intro.go ? 1 : 0);
    U.uViewOn.value = vOn;
    if (vOn > 0) {
      w.setView(vr);
      holders.forEach((h, i) => { h.visible = i === active; });
      const hd = holders[active];
      hd.rotation.y = reduce ? 0.5 : now * 0.5 + par.x * 0.5;
      hd.rotation.x = 0.2;
      const since = now - swapAt, ip = t - intro.go;
      U.uViewPix.value = Math.max(5, mix(22, 5, eo(seg(0, 0.6, Math.min(since, ip)))));
    }
    w.render(now);
  });
})();
