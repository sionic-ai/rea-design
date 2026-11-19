// First page — original values: branch scene pinned at 200% (scrub .3), morph follows the first 60% · .1 per tick, words .05~.36 (.1 per word), sentence exit .48~.6,
// Settling .7, branch lines rise from 100vh below between .4~.85 with easeOutCubic. Recommended reel fixed 360%, front entrance top 50% → top top.
(() => {
  const KT = window.KT, T = window.THREE, GL = KT.GL;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const { clamp, easeOutCubic: eoc, smooth, rh } = KT;
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduce = KT.reduce, TAU = Math.PI * 2;

  // ── Branch scene DOM ──
  const pin = $(".kc__pin"), row = $(".kc__row"), slots = $$(".kc__slot"), refs = slots.map((s) => $(".kc__ref", s));
  const title = $(".kc__title"), count = $(".kc__count"), sentence = $(".kc__sentence"), words = KT.splitWords($(".kc__sentence p"));
  const conv = $(".kc__conv"), cue = $(".kc__cue"), worldsLbl = $(".kc__worlds"), browse = $(".kc__browse"), phone = $(".kc__phone-btns");
  const rules = $(".kc__rules"), ruleEls = $$(".kc__rules i");
  const pHead = $(".kc__panel--head"), pCount = $(".kc__panel--count");
  const sides = $$(".kc-side");
  const S = { pinP: 0, morph: 0, intro: reduce ? 1 : 0, started: reduce, hover: -1, open: 0, opening: -1 };

  document.addEventListener("click", (e) => e.target.closest("[data-search]") && KT.openSearch());

  ScrollTrigger.create({ trigger: pin, start: "top top", end: "+=200%", pin: true, pinSpacing: true, scrub: 0.3, onUpdate: (s) => (S.pinP = s.progress) });

  // First entrance — 350ms after the loading curtain lifts, 1.2s power2.out, numbers count 0→166 over 1.6s after .25
  const total = +count.dataset.count;
  const intro = () => {
    if (reduce) { count.textContent = total; return; }
    S.started = true;
    gsap.to(S, { intro: 1, duration: 1.2, ease: "power2.out" });
    const c = { v: 0 };
    gsap.to(c, { v: total, duration: 1.6, delay: 0.25, ease: "power2.out", snap: { v: 1 }, onUpdate: () => (count.textContent = c.v) });
  };
  KT.booted.then(() => setTimeout(intro, 350));

  slots.forEach((s, i) => {
    s.addEventListener("mouseenter", () => (S.hover = i));
    s.addEventListener("mouseleave", () => S.hover === i && (S.hover = -1));
    s.addEventListener("click", () => openWorld(i));
  });

  // Side magnet labels — rest positions 10% and 90%, when the mouse is within the outer 30% they follow within grab range
  const side = sides.map((el) => ({ el, left: el.dataset.side === "left", c: { x: 0, y: 0 }, u: { x: -9999, y: -9999 }, lock: false }));
  const rest = (m) => ({ x: m.left ? 0.1 * innerWidth : 0.9 * innerWidth, y: 0.5 * innerHeight });
  side.forEach((m) => { m.c = rest(m); m.u = { ...m.c }; });
  addEventListener("resize", () => side.forEach((m) => (m.c = rest(m))));
  let sideVis = 0;
  addEventListener("mousemove", (e) => {
    if (reduce) return;
    const w = innerWidth, h = innerHeight;
    for (const m of side) {
      if (!(m.left ? e.clientX < 0.3 * w : e.clientX > 0.7 * w)) { m.c = rest(m); m.lock = false; continue; }
      m.c = {
        x: Math.max(m.left ? 0.05 * w : 0.72 * w, Math.min(m.left ? 0.28 * w : 0.95 * w, e.clientX)),
        y: Math.max(0.3 * h, Math.min(0.7 * h, e.clientY)),
      };
      m.lock = sideVis > 0.5 && m.c.x === e.clientX && m.c.y === e.clientY;
    }
    KT.cursor.bare(side.some((m) => m.lock));
  });

  const ui = () => {
    const e = clamp(S.pinP / 0.6, 0, 1);
    S.morph = reduce ? e : S.morph + (e - S.morph) * 0.1;
    const n = S.morph, U = S.intro, phoneW = KT.mobile();
    // Sentence — words come in one by one, and at .48~.6 the whole sentence blurs out and leaves
    KT.wordsAt(words, n, 0.05, (0.36 - 0.05 - 0.1) / Math.max(1, words.length - 1), 0.1);
    const out = 1 - clamp((n - 0.48) / 0.12, 0, 1);
    sentence.style.opacity = out;
    sentence.style.filter = `blur(${(1 - out) * 8}px)`;
    const er = clamp(1.4 * U - 0.4, 0, 1);
    const ei = clamp(1 - n / 0.35, 0, 1) * er;
    const eo = 8 * clamp(n / 0.35, 0, 1) + 8 * clamp(1 - 1.4 * U, 0, 1);
    const el = clamp((n - 0.55) / (0.7 - 0.55), 0, 1);
    const es = clamp((n - 0.84) / (0.93 - 0.84), 0, 1);
    const ec = clamp(1.6 * U - 0.6, 0, 1) * clamp(1 - n / 0.25, 0, 1);
    title.style.opacity = ei; title.style.filter = `blur(${eo}px)`; title.style.transform = `scale(${0.92 + 0.08 * U})`;
    conv.style.opacity = 0.55 * ei; conv.style.filter = `blur(${eo}px)`; conv.classList.toggle("is-live", ei > 0.4);
    cue.style.opacity = ei; cue.style.filter = `blur(${eo}px)`;
    worldsLbl.style.opacity = 0.7 * el; worldsLbl.style.filter = `blur(${(1 - el) * 6}px)`;
    rules.style.opacity = 0.55 * el;
    const m = eoc((n - 0.4) / 0.45);
    row.style.transform = `translate(0, calc(-50% + ${(1 - m) * 100}vh))`;
    row.classList.toggle("is-live", n > 0.7);
    const settled = n > 0.7 && S.hover >= 0 && !phoneW ? KT.worlds[S.hover] : null;
    browse.style.opacity = settled ? 0 : es;
    browse.classList.toggle("is-live", es > 0.6 && !settled);
    phone.style.opacity = ec; phone.classList.toggle("is-live", ec > 0.3);
    slots.forEach((s, i) => { s.classList.toggle("is-hover", S.hover === i); s.classList.toggle("is-dim", S.hover >= 0 && S.hover !== i); });
    // Thin diagonals between cells — space is split in a ratio of 3 for the hovered cell and 1 for the rest
    const wts = [0, 1, 2, 3].map((i) => (i === S.hover ? 3 : 1)), sum = wts.reduce((a, b) => a + b, 0);
    let acc = 0;
    ruleEls.forEach((r, i) => { acc += wts[i]; r.style.left = `${(acc / sum) * 100}%`; });
    // Hover panel — name and intro above the center of that cell ((i+1.5)/6), track count below
    if (settled) {
      $("h2", pHead).textContent = settled.title;
      $("p", pHead).textContent = settled.line;
      $("span", pCount).textContent = `${settled.count} Song`;
    }
    const at = `${((S.hover < 0 ? 0 : S.hover + 1.5) / 6) * 100 || 50}%`;
    for (const p of [pHead, pCount]) { p.style.left = at; p.classList.toggle("is-on", !!settled); }
    KT.cursor.label(settled && S.open < 0.02 ? "Open Branch" : null);
    // Magnet label
    sideVis = ec;
    for (const s of side) {
      s.u.x += (s.c.x - s.u.x) * 0.18; s.u.y += (s.c.y - s.u.y) * 0.18;
      s.el.style.transform = `translate3d(${s.u.x}px, ${s.u.y}px, 0) translate(-50%, -50%)`;
      s.el.style.opacity = ec;
      s.el.style.pointerEvents = ec > 0.5 ? "auto" : "none";
    }
    if (ec <= 0.5 && side.some((m) => m.lock)) { side.forEach((m) => (m.lock = false)); KT.cursor.bare(false); }
  };
  gsap.ticker.add(ui);

  // ── Featured reel DOM ──
  const fPin = $(".kf__pin"), fLine = $(".kf__line"), fWords = KT.splitWords($(".kf__line p")), cta = $(".kf__cta");
  const REEL = Math.min(6, KT.brand.length), FEAT = KT.brand.length;
  const F = { p: 0, lead: 0, insp: -1, open: 0 };
  ScrollTrigger.create({ trigger: fPin, start: "top 50%", end: "top top", scrub: 0.3, onUpdate: (s) => (F.lead = s.progress) });
  ScrollTrigger.create({ trigger: fPin, start: "top top", end: `+=${60 * REEL}%`, pin: true, pinSpacing: true, scrub: 0.3, onUpdate: (s) => (F.p = s.progress) });
  // Toward the end the ”View all” button disappears (original computeFeaturedCtaT)
  const ctaT = (e, n) => {
    const a = clamp(e, 0, 1);
    if (!(a > 0.001 && a < 0.999) && !(a >= 0.999)) return 0;
    return clamp(clamp(a / 0.8, 0, 1) * Math.max(0, n - 1) - (n - 2), 0, 1);
  };
  gsap.ticker.add(() => {
    const l = clamp(F.lead, 0, 1), step = 0.6 / Math.max(1, fWords.length - 1);
    fWords.forEach((w, i) => {
      const o = eoc((l - (0.08 + i * step)) / 0.22);
      w.style.opacity = o; w.style.filter = `blur(${(1 - o) * 6}px)`; w.style.transform = `translateY(${(1 - o) * 0.35}em)`;
    });
    const c = 1 - ctaT(F.p, REEL);
    cta.style.opacity = c;
    cta.style.pointerEvents = c > 0.4 ? "auto" : "none";
    fLine.classList.toggle("is-hidden", F.insp >= 0);
  });
  const setInspect = (i) => { F.insp = i; KT.inspect(i); };
  KT.onInspectClose = () => (F.insp = -1);

  // ── Contact: on entering top 75%, 0.6s power2.out — first line, two lines .18 later (.08 gap), link .2 after that ──
  const lead = $(".kt-contact__lead"), body = $$(".kt-contact__body p"), links = $(".kt-contact__links");
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    [lead, ...body, links].forEach((el) => el.classList.add("kt-reveal"));
    const to = { filter: "blur(0px)", y: 0 };
    gsap.set([lead, ...body, links], { opacity: 0, filter: "blur(8px)", y: 12 });
    gsap.timeline({ scrollTrigger: { trigger: ".kt-contact", start: "top 75%", toggleActions: "play none none none" }, defaults: { duration: 0.6, ease: "power2.out" } })
      .to(lead, { opacity: 1, ...to })
      .to(body, { opacity: 1, ...to, stagger: 0.08 }, "+=0.18")
      .to(links, { opacity: 0.7, ...to }, "+=0.2");
  });

  // Category open — the chosen display case grows to the center while the others fly off to the sides, then the list (the original is /c/<Branch>)
  function openWorld(i) {
    if (S.morph <= 0.7 || S.opening >= 0) return;
    S.opening = i;
    gsap.to(S, { open: 1, duration: reduce ? 0 : 0.9, ease: "power2.inOut", onComplete: () => KT.flashTo("works.html", { dur: 0.4, at: 320 }) });
  }

  // ── 3D ──
  const build = () => {
    const stage = GL.stage($(".kt-gl"));
    const { scene, view } = stage;
    const bg = GL.backdrop(stage);
    // Hovering a branch tilts the background liquid 45% toward that branch color (follows with 1 − e^(−6dt))
    const basePal = GL.liquid("--site-liquid"), worldPal = KT.worlds.map((w) => GL.liquid(w.color)), lean = [0, 0, 0, 0];
    stage.onFrame((dt) => {
      const pal = bg.u.uPal.value, k = 1 - Math.exp(-6 * dt);
      pal.forEach((v, i) => v.copy(basePal[i]));
      lean.forEach((x, t) => {
        lean[t] += ((S.hover === t && S.morph > 0.9 ? 1 : 0) - x) * k;
        const n = 0.45 * lean[t];
        if (n > 0.003) pal.forEach((v, i) => v.lerp(worldPal[t][i], n));
      });
      bg.u.uFade.value = (1 - KT.bang.v) * (1 - clamp(F.open, 0, 1)) * (1 - clamp(S.open, 0, 1));
    });
    scene.add(new T.AmbientLight(0xffffff, 1.68)); /* Not skin: white light used only for lighting intensity */
    const key = new T.DirectionalLight(0xffffff, 1.2); /* Not skin: white light used only for lighting intensity */
    key.position.set(-0.9, 0.88, 1.24);
    scene.add(key);

    // Four showcase cases — original aV: the first slot spins once at the screen center (45% height) into its slot, the rest grow from .4
    const vit = KT.worlds.map((w) => {
      const g = GL.vitrine(w.cards.map((c) => KT.brand[c]));
      const grass = GL.grass();
      grass.position.y = -0.725;
      g.add(grass);
      g.scale.setScalar(0);
      scene.add(g);
      return { g, grass, M: 0, S: 1, T: 0, grow: 0, prev: 0, b: { x: 0, y: 0, scale: 0, rotY: 0 } };
    });
    vit[0].M = 1;
    const bounce = { value: 1 };
    let bounceTl = null;

    // Featured reel — six cards + a ‹View all› door
    const reel = new T.Group();
    scene.add(reel);
    const cards = KT.brand.slice(0, REEL).map((t, i) => {
      const holder = new T.Group(), tilt = new T.Group();
      const mesh = new T.Mesh(GL.cardGeometry, GL.cardMaterial(t));
      mesh.userData.i = i;
      tilt.add(mesh); holder.add(tilt); reel.add(holder);
      holder.scale.setScalar(0);
      return { holder, tilt, mesh, x: 0, y: 0, z: -6, rotY: 0, scale: 0, hov: 0, rx: 0, ry: 0 };
    });
    const portal = GL.portal("View all");
    const pHolder = new T.Group(), pTilt = new T.Group();
    pTilt.add(portal); pHolder.add(pTilt); reel.add(pHolder);
    pHolder.scale.setScalar(0);
    portal.userData.face.userData.portal = true;
    const P = { x: 0, y: 0, z: 0, rotY: 0, scale: 0, hov: 0, rx: 0, ry: 0 };
    let hovered = null;

    addEventListener("click", (e) => {
      if (e.target.closest("[data-inspect-panel], a, button")) return;
      if (hovered === "portal") {
        F.open = 0.0001;
        gsap.to(F, { open: 1, duration: reduce ? 0 : 0.9, ease: "power2.in" });
        setTimeout(() => (location.href = "works.html"), reduce ? 0 : 820);
        return;
      }
      if (typeof hovered === "number") return setInspect(F.insp === hovered ? -1 : hovered);
      if (F.insp >= 0) setInspect(-1);
    });

    stage.onFrame((dt, time) => {
      const s = clamp(S.morph, 0, 1), h = S.intro, d = clamp(S.open, 0, 1);
      const v = (0.45 * view.h) / 1.43;
      vit.forEach((st, t) => {
        const x = refs[t], r = x.getBoundingClientRect();
        const c = s > 0.7, f = c && S.hover === t, first = t === 0;
        // One bounce at the moment of settling — .94(.12s) → 1.03(.18s) → 1(.22s)
        if (first && s > 0.7 && st.prev <= 0.7 && bounce.value > 0.999 && !reduce) {
          bounceTl?.kill();
          bounceTl = gsap.timeline().to(bounce, { value: 0.94, duration: 0.12, ease: "power2.out" }).to(bounce, { value: 1.03, duration: 0.18, ease: "power2.out" }).to(bounce, { value: 1, duration: 0.22, ease: "power2.out" });
        }
        st.prev = s;
        const other = c && S.hover >= 0 && S.hover !== t;
        st.S = lerp(st.S, f ? 1.04 : other ? 0.82 : 1, 0.12);
        const wp = stage.world(r.left + r.width / 2, r.top + r.height / 2);
        const U = wp.y + (1 - eoc((s - 0.4) / 0.45)) * view.h;
        const D = Math.min((0.62 * ((x.offsetWidth / view.W) * view.w)) / 1.07, (0.62 * ((x.offsetHeight / view.H) * view.h)) / 1.43);
        let X, Y, SC, R;
        if (first) {
          const k = eoc(clamp(s / 0.85, 0, 1));
          X = lerp(0, wp.x, k); Y = lerp(0, U, k); SC = lerp(v, D, k) * bounce.value * st.S * h;
        } else {
          st.M = lerp(st.M, s < 0.4 ? 0 : clamp((s - 0.4) / 0.3, 0, 1), 0.18);
          X = wp.x; Y = wp.y; SC = D * st.M * st.S * h;
        }
        const rot = st.g.rotation.y;
        if (first && s < 0.7) R = eoc(clamp(s / 0.85, 0, 1)) * TAU;
        else if (f && d < 0.001) R = rot + 1.6 * dt;
        else R = lerp(rot, Math.round(rot / TAU) * TAU, 0.08);
        // Open: the chosen item goes to the large center slot, the rest slide off-screen to the side
        const pick = S.opening === t;
        const B = (X !== 0 ? Math.sign(X) : t < 2 ? -1 : 1) * view.w * 1.4;
        const WX = lerp(X, pick ? 0 : B, d), WY = lerp(Y, pick ? 0 : Y, d);
        const G = lerp(SC, pick ? v * Math.max(h, 1) : 0, d);
        let q = WY;
        if (s < 0.85 && d < 0.02) { st.T += (WY - st.T) * rh(0.22, dt); q = st.T; } else st.T = WY;
        st.g.position.set(WX, q, 0);
        st.g.scale.setScalar(Math.max(G, 0));
        st.g.rotation.y = R;
        st.g.visible = G > 0.01;
        st.g.userData.stack.rotation.y = Math.sin(time * 0.9 + t) * 0.025;
        st.grow += ((f && d < 0.02 ? 1 : 0) - st.grow) * rh(0.14, dt);
        st.grass.userData.u.uGrow.value = st.grow;
        st.grass.userData.u.uTime.value = time;
        st.grass.rotation.y = -R;
        st.grass.visible = st.grow > 0.01;
        for (const m of st.g.userData.stack.children) m.material.uniforms.uTime.value = time;
      });

      // Reel — original layout formula kept as is
      const e = clamp(F.p, 0, 1), inPin = e > 0.001 && e < 0.999, lead = clamp(F.lead, 0, 1), u = clamp(F.open, 0, 1);
      const leadOnly = !inPin && e < 0.999 && lead > 0.001;
      const n = cards.length;
      if (inPin || leadOnly || F.insp >= 0 || u > 0) {
        const r = fPin.getBoundingClientRect();
        const wp = stage.world(r.left + r.width / 2, r.top + r.height / 2);
        if (F.insp >= 0 || u > 0) { const k = rh(0.2, dt); reel.position.x += -reel.position.x * k; reel.position.y += -reel.position.y * k; }
        else reel.position.set(wp.x, wp.y, 0);
        const ci = inPin ? clamp(e / 0.8, 0, 1) * Math.max(0, n - 1) : 0;
        const dd = inPin ? smooth(0, 1.2 / n, e) : 0;
        const f0 = lerp(3, 1.9, dd), h0 = lerp(4, 2.7, dd);
        cards.forEach((st, i) => {
          let a = 1;
          if (leadOnly) a = eoc(clamp((lead - 0.07 * i) / 0.3, 0, 1));
          else if (inPin && e > 0.8) a = 1 - eoc(clamp(((e - 0.8) / 0.2 - (n - 1 - i) * 0.07) / 0.3, 0, 1));
          const off = i - ci, l = Math.abs(off), fade = 1 - smooth(f0, h0, l);
          let tx = Math.sign(off) * (0.78 * l + l * l * 0.18), ty = -0.04 * l, tz = -0.52 * l - (1 - fade) * 4, tr = -0.32 * off;
          let ts = Math.max(0.1, 1 - 0.12 * l) * fade;
          tx = lerp(0, tx, a); ty = lerp(0, ty, a); tz = lerp(tz - 6, tz, a); tr = lerp(Math.PI, tr, a); ts *= clamp(a / 0.15, 0, 1);
          if (F.insp >= 0) {
            const me = F.insp === i;
            tx = me ? -view.w * 0.17 : tx; ty = me ? 0 : ty; tz = me ? 1.1 : tz; tr = me ? 0 : tr; ts = me ? 1.15 : 0;
          }
          st.x = lerp(st.x, tx, 0.18); st.y = lerp(st.y, ty, 0.18); st.z = lerp(st.z, tz, 0.18); st.rotY = lerp(st.rotY, tr, 0.18);
          st.scale = lerp(st.scale, ts * (1 - u), 0.18);
        });
        // Door — at the spot after the last card, moves to the center during the final 20%
        let pr = n - ci;
        if (e > 0.8) pr = lerp(n - ci, 0, eoc(clamp((e - 0.8) / 0.2 / 0.55, 0, 1)));
        const pa = Math.abs(pr), near = 1 - smooth(1.15, 1.9, pa), pf = 1 - smooth(f0, h0, pa);
        const px = Math.sign(pr) * (0.78 * pa + pa * pa * 0.18), pz = -0.52 * pa - (1 - pf) * 4;
        const ps = inPin ? ctaT(e, n) * Math.max(0.1, 1 - 0.12 * pa) * pf * (1 + 4 * u) * (1 - smooth(0.62, 1, u)) * near : u > 0 ? (1 + 4 * u) * (1 - smooth(0.62, 1, u)) : 0;
        P.x = lerp(P.x, inPin ? px : 0, 0.18); P.y = lerp(P.y, inPin ? -0.04 * pa : 0, 0.18); P.z = lerp(P.z, (inPin ? pz : 0) + 4.6 * u, 0.18);
        P.rotY = lerp(P.rotY, inPin ? -0.32 * pr : 0, 0.18);
        P.scale = lerp(P.scale, F.insp >= 0 ? 0 : ps, 0.18);
      } else {
        cards.forEach((st) => (st.scale = lerp(st.scale, 0, 0.18)));
        P.scale = lerp(P.scale, 0, 0.18);
      }
      // Interaction — the pointed card comes forward .45 and scales 1.06x. The card tilts (±.3rad) toward the cursor spot on its face (uv) only while pointed at,
      // Only the ”View all” door always tilts slightly with a full-screen cursor (.045, .145 on hover)
      const list = cards.filter((c) => c.scale > 0.05).map((c) => c.mesh);
      if (P.scale > 0.05) list.push(portal.userData.face);
      const hit = stage.hasPointer && S.open < 0.01 ? stage.pick(list) : null;
      hovered = hit ? (hit.object.userData.portal ? "portal" : hit.object.userData.i) : null;
      if (typeof hovered === "number" && F.insp >= 0 && F.insp !== hovered) hovered = null;
      KT.cursor.hot(hovered !== null);
      const pt = stage.pointer, uv = hit && hit.uv;
      const apply = (st, holder, tilt, on, order, card) => {
        st.hov += ((on ? 1 : 0) - st.hov) * rh(0.12, dt);
        if (card) {
          const aim = on && uv && !reduce;
          st.rx += ((aim ? (0.5 - uv.y) * 0.6 : 0) - st.rx) * rh(0.15, dt);
          st.ry += ((aim ? (uv.x - 0.5) * 0.6 : 0) - st.ry) * rh(0.15, dt);
        } else {
          const k = reduce ? 0 : 0.045 + 0.1 * st.hov;
          st.rx += (-pt.y * k - st.rx) * rh(0.08, dt); st.ry += (pt.x * k * 1.4 - st.ry) * rh(0.08, dt);
        }
        holder.position.set(st.x, st.y, st.z + 0.45 * st.hov);
        holder.rotation.set(0, st.rotY, 0);
        holder.scale.setScalar(Math.max(0, st.scale) * (1 + 0.06 * st.hov));
        tilt.rotation.set(st.rx, st.ry, 0);
        holder.visible = st.scale > 0.002;
        holder.traverse((o) => (o.renderOrder = order));
      };
      cards.forEach((st, i) => { apply(st, st.holder, st.tilt, hovered === i, Math.round(100 - 10 * Math.abs(i - (inPin ? clamp(e / 0.8, 0, 1) * (n - 1) : 0))), true); st.mesh.material.uniforms.uTime.value = time; });
      apply(P, pHolder, pTilt, hovered === "portal", 50, false);
      const su = portal.userData.stars.uniforms;
      su.uTime.value = time;
      const ip = reduce ? 0 : 0.16;
      su.uPar.value.x += (pt.x * ip - su.uPar.value.x) * rh(0.08, dt);
      su.uPar.value.y += (pt.y * ip - su.uPar.value.y) * rh(0.08, dt);
    });
    stage.warm();
    return true;
  };
  KT.bootTask(GL.fontsReady().then(build));

  // When arriving from another page’s menu via ”Paths” · ”Picks” · ”Contact”
  const hash = location.hash.slice(1);
  if (hash) KT.booted.then(() => requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    const y = hash === "collections" ? innerHeight * 1.176 : document.getElementById(hash)?.offsetTop;
    if (y != null) KT.scrollTo(y, true);
  }));
  FEAT && (cta.textContent = `All ${FEAT} View`);
})();
