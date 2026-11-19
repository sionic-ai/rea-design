/* Home motion — hero entrance · photo progress strip, eye opening, story section zoom, color-step flip, landscape sticker slapping on, big text painted line by line, 
   Peek inside a circle, poster stack (three), agenda date swap, draggable wall, review pager, face over name. The butterfly’s perch is also decided here. */
(() => {
  const { E } = CB;
  const off = [];
  const on = (el, ev, fn, o) => { el.addEventListener(ev, fn, o); off.push(() => el.removeEventListener(ev, fn, o)); };
  const U = () => (innerWidth >= 900 ? Math.min(1920, Math.max(1440, innerWidth)) / 1920 : innerWidth / 375);

  /* Hero — once the loader lifts, the photo reveals from bottom to top with clip (240ms apart), and the title lines rise from below */
  function hero(root) {
    const imgs = [...root.querySelectorAll(".hero-card__media, .hero__field, .hero__dark, .hero__pills, .travel__recap")]
      .sort((a, b) => { const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(); return ra.left - rb.left || ra.top - rb.top; });
    const title = root.querySelector(".hero__title");
    title.querySelectorAll(":scope > span").forEach((s) => (s.innerHTML = `<b>${s.innerHTML}</b>`));
    const lines = title.querySelectorAll("b");
    swap(root);
    // Intro animation only when the first loading screen lifts (the original also stands immediately when entering via a transition)
    if (CB.reduce || CB.loaded) return;
    gsap.set(imgs, { clipPath: "inset(100% 0 0 0)" });
    gsap.set(lines, { yPercent: 110 });
    gsap.set(root.querySelector(".hero__year"), { autoAlpha: 0 });
    const play = () => {
      gsap.to(imgs, { clipPath: "inset(0% 0 0 0)", duration: 0.9, ease: E.io, stagger: 0.24 / 3 });
      gsap.to(lines, { yPercent: 0, duration: 1.1, ease: E.out, stagger: 0.1, delay: 0.25 });
      gsap.to(root.querySelector(".hero__year"), { autoAlpha: 1, duration: 0.6, delay: 0.7 });
    };
    const f = () => { play(); document.removeEventListener("cb:reveal", f); };
    document.addEventListener("cb:reveal", f); off.push(() => document.removeEventListener("cb:reveal", f));
  }

  /* Photo swap — when the progress bar fills over 6s it retracts to the right (.75s) and four cells swap staggered .24s apart from the lowest (all at once on narrow screens), then it fills again.
     Five color panels attached to each cell’s bottom-right corner and a new photo (last cell) grow diagonally to cover — head -1→.5 over
     Pushes with power3.inOut 1.481s with .1 between panels. When the first panel fully covers (head 0), the number switches to the decoded one.
     The strip is timed from when the loader ends, or from when the transition starts if entered via a transition (the original attaches the hero at the start of the transition). If the hero is off-screen, the strip pauses */
  const SWAP = { cycle: 6, retract: 0.75, stagger: 0.24, dur: 1.481, gap: 0.1, people: 12 };
  const BANDS = ["--kf-accent", "--kf-bg", "--kf-accent-text", "--kf-accent-soft", "--site-panel"];
  function swap(root) {
    const fill = root.querySelector(".hero__progress span"), hero = root.querySelector(".hero");
    const cards = [...root.querySelectorAll(".hero-card")];
    const labels = cards.map((c) => c.querySelector(".hero-card__media").dataset.label);
    gsap.set(fill, { scaleX: 0, transformOrigin: "0 50%" });
    if (CB.reduce) return;
    let tl = null, round = 0, seen = true;
    const card = (c, i) => {
      const media = c.querySelector(".hero-card__media"), warm = !media.classList.contains("ph--warm"), label = labels[(i + round) % labels.length];
      const box = document.createElement("div");
      box.className = "hero-swap"; box.setAttribute("aria-hidden", "true");
      box.innerHTML = BANDS.map((v) => `<i style="background:var(${v})"></i>`).join("") + `<b class="ph${warm ? " ph--warm" : ""}" data-label="${label}"></b>`;
      const cars = [...box.children], head = { v: -1 };
      const put = () => cars.forEach((el, k) => { const at = head.v - k * SWAP.gap, p = Math.min(1, Math.max(0, -at)) * 100; el.style.inset = `${p}% 0 0 ${p}%`; });
      const num = c.querySelector(".hero-card__cap > span");
      return gsap.timeline()
        .call(() => { put(); media.appendChild(box); })
        .to(head, { v: BANDS.length * SWAP.gap, duration: SWAP.dur, ease: "power3.inOut", onUpdate: put })
        .call(() => { num.textContent = num._code = String(((i + round * cards.length) % SWAP.people) + 1).padStart(2, "0"); CB.code(num); }, null, SWAP.dur * 0.563)
        .call(() => { media.classList.toggle("ph--warm", warm); media.dataset.label = label; media._stale = true; box.remove(); });
    };
    const next = () => {
      round++;
      const order = cards.map((c, i) => ({ i, top: c.querySelector(".hero-card__media").getBoundingClientRect().top })).sort((a, b) => b.top - a.top || b.i - a.i);
      tl = gsap.timeline({ data: "swap", onComplete: () => run(0) });
      tl.set(fill, { transformOrigin: "100% 50%" }).to(fill, { scaleX: 0, duration: SWAP.retract, ease: E.io }, 0);
      // On narrow screens (2×2 grid) all four cells change at once
      const together = innerWidth < 900;
      order.forEach(({ i }, r) => tl.add(card(cards[i], i), together ? 0 : r * SWAP.stagger));
    };
    const run = (from) => {
      gsap.set(fill, { scaleX: 0, transformOrigin: "0 50%" });
      tl = gsap.timeline({ onComplete: next }).to(fill, { scaleX: 1, duration: SWAP.cycle, ease: "none" });
      tl.time(Math.min(from, SWAP.cycle - 0.01));
      if (!seen) tl.pause();
    };
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (tl && tl.data !== "swap") seen ? tl.resume() : tl.pause(); }, { rootMargin: "10% 0px" });
    io.observe(hero);
    const begin = () => run(CB.navAt ? (performance.now() - CB.navAt) / 1000 : 0);
    if (CB.loaded) begin();
    else { document.addEventListener("cb:loaded", begin, { once: true }); off.push(() => document.removeEventListener("cb:loaded", begin)); }
    off.push(() => { io.disconnect(); tl?.kill(); root.querySelectorAll(".hero-swap").forEach((b) => b.remove()); });
  }

  /* Eye — when about 30% enters the screen the eyelid opens and the pupil looks around */
  function eye(root) {
    const lid = root.querySelector(".eye__lid"), ball = root.querySelector(".eye__ball");
    if (!lid || CB.reduce) return;
    gsap.set(lid, { attr: { d: "M2 21 Q35 48 68 21 Q35 48 2 21Z" } });
    gsap.set(lid, { attr: { d: "M2 21 Q35 -6 68 21 Q35 48 2 21Z" } });
    ScrollTrigger.create({
      trigger: root.querySelector(".hs-intro__eye"), start: "top 70%", once: true,
      onEnter: () => {
        gsap.to(lid, { attr: { d: "M2 21 Q35 -6 68 21 Q35 -6 2 21Z" }, duration: 0.5, ease: E.out });
        const look = () => gsap.to(ball, { x: gsap.utils.random(-12, 12), y: gsap.utils.random(-5, 5), duration: 0.35, ease: "power2.out", delay: gsap.utils.random(0.6, 1.8), onComplete: look });
        look();
      },
    });
    // The signal chip’s bead ripples big and small, and the mouth chip smiles with the scroll
    gsap.to(root.querySelectorAll(".chip__wave circle"), { attr: { r: 3 }, duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: { each: 0.12, from: "start" } });
    gsap.fromTo(root.querySelector(".chip__mouth path"), { attr: { d: "M10 20 Q60 20 110 20" } }, { attr: { d: "M10 14 Q60 46 110 14" }, ease: "none", scrollTrigger: { trigger: ".hs-intro", start: "top bottom", end: "center center", scrub: true } });
  }

  /* Story — when the photo frame touches the header row, the frame and text column stay pinned, and a small photo grows on a log scale to cover the frame */
  function story(root) {
    const sec = root.querySelector(".hs-story"), media = sec.querySelector(".hs-story__media"), col = sec.querySelector(".hs-story__col"), small = sec.querySelector(".hs-story__small");
    const sh = () => innerHeight - (innerWidth >= 900 ? 80 * U() : 64);
    const big = () => Math.max(media.clientWidth / small.clientWidth, media.clientHeight / small.clientHeight) * 1.02;
    gsap.set(small, { scale: 0 });
    ScrollTrigger.create({
      trigger: media, start: () => `top ${innerWidth >= 900 ? 80 * U() : 64}px`, end: () => `+=${sh()}`, scrub: true,
      onUpdate: (st) => {
        const p = st.progress;
        if (innerWidth >= 900) gsap.set([media, col], { y: p * sh() });
        else gsap.set(media, { y: p * sh() });
        const s = p < 0.08 ? (p / 0.08) : Math.exp(Math.log(1) + (Math.log(big()) - Math.log(1)) * ((p - 0.08) / 0.92));
        gsap.set(small, { scale: s });
      },
    });
  }

  /* Color steps — each row slides in along the X axis in turn */
  function scheme(root) {
    root.querySelectorAll("[data-flip3d]").forEach((s) => {
      gsap.fromTo(s.children, { rotationX: -90, transformOrigin: "50% 0%" }, { rotationX: 0, ease: "none", stagger: 0.12, scrollTrigger: { trigger: s, start: "top bottom", end: "bottom 60%", scrub: true } });
    });
  }

  /* Landscape — while pinned, one image sticks every 55svh */
  function land(root) {
    const sec = root.querySelector(".hs-land"), pieces = [...sec.querySelectorAll("[data-step]")];
    ScrollTrigger.create({
      trigger: sec, start: "top top", end: "bottom bottom",
      onUpdate: (st) => { const step = Math.floor((st.progress * (sec.offsetHeight - innerHeight)) / (innerHeight * 0.55) + 0.25); pieces.forEach((p) => p.classList.toggle("is-in", +p.dataset.step <= step)); },
    });
  }

  /* Big text — each visible line is painted from the left following scroll and the very front glows lime (start 0.94, end 0.5) */
  function titlefx(root) {
    const p = root.querySelector("[data-titlefx]");
    if (!p) return;
    p.querySelectorAll(":scope > span:not(.gap)").forEach((line) => {
      line.innerHTML = line.textContent.trim().split(/\s+/).map((w) => `<span class="w" data-t="${w.replace(/"/g, "&quot;")}">${w}</span>`).join(" ");
    });
    const ws = [...p.querySelectorAll(".w")];
    let rows = [];
    const group = () => {
      const m = new Map();
      ws.forEach((w) => { const k = Math.round(w.offsetTop); (m.get(k) || m.set(k, []).get(k)).push(w); });
      rows = [...m.values()];
    };
    group();
    const ro = new ResizeObserver(group); ro.observe(p); off.push(() => ro.disconnect());
    const paint = () => {
      const vh = innerHeight;
      rows.forEach((row) => {
        const top = row[0].getBoundingClientRect().top;
        const pr = gsap.utils.clamp(0, 1, (vh * 0.94 - top) / (vh * 0.44));
        const n = row.length;
        row.forEach((w, i) => {
          const local = gsap.utils.clamp(0, 1, pr * n - i);
          w.style.setProperty("--p", CB.reduce ? 1 : local.toFixed(3));
          w.style.setProperty("--q", CB.reduce ? 1 : gsap.utils.clamp(0, 1, pr * n - i + 0.6).toFixed(3));
        });
      });
    };
    ScrollTrigger.create({ trigger: p, start: "top bottom", end: "bottom top", onUpdate: paint, onRefresh: paint });
    paint();
  }

  /* Circle — when the mouse gets close, a round window opens there and reveals a different photo */
  function circles(root) {
    root.querySelectorAll("[data-peek]").forEach((c) => {
      const core = c.querySelector(".circle__peek");
      on(c, "pointermove", (e) => { const r = core.getBoundingClientRect(); c.style.setProperty("--mx", `${e.clientX - r.left}px`); c.style.setProperty("--my", `${e.clientY - r.top}px`); c.classList.add("is-peek"); });
      on(c, "pointerleave", () => c.classList.remove("is-peek"));
    });
  }

  /* Poster stack — three. Paper tilted -29° falls from above, bends and straightens, and the bundle falls together. When finished the ring circle grows into the agenda */
  function poster(root, mm) {
    const sec = root.querySelector(".hs-poster"), cv = sec.querySelector(".hs-poster__cv"), ring = sec.querySelector(".hs-poster__ring");
    const T3 = window.THREE;
    if (!T3) return;
    const SHEETS = [
      { x: -0.25, y: -0.106, rot: 1.5, s: 1, t: "Designers, Assemble" }, { x: -0.053, y: 0.068, rot: 3, s: 0.86, t: "Invitation" },
      { x: 0.185, y: -0.166, rot: -5.9, s: 0.72, t: "Talk 02" }, { x: 0.151, y: 0.286, rot: -5.2, s: 0.5, t: "Jury" },
      { x: -0.347, y: 0.265, rot: 10.5, s: 0.42, g: 4, t: "Stamp" }, { x: 0.397, y: -0.341, rot: -6.5, s: 0.35, g: 4, t: "Note" },
      { x: 0.365, y: 0.168, rot: -15.3, s: 0.79, g: 4, t: "Swatch" }, { x: -0.222, y: 0.179, rot: -6, s: 0.3, t: "Ticket" },
      { x: 0.423, y: -0.133, rot: 5.5, s: 0.24, g: 7, t: "Badge" }, { x: -0.446, y: 0.157, rot: -6.5, s: 0.34, g: 7, t: "Card" },
    ];
    const groups = []; SHEETS.forEach((s, i) => { const g = s.g ?? i; (groups[g] = groups[g] || []).push(s); }); const G = groups.filter(Boolean);
    const r = new T3.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    const scene = new T3.Scene();
    const cam = new T3.PerspectiveCamera(10, 1, 1, 200);
    cam.position.set(0, 0, 60);
    const az = (141 * Math.PI) / 180, el = (51 * Math.PI) / 180;
    scene.add(new T3.AmbientLight(0xffffff, 1.6));
    const key = new T3.DirectionalLight(0xffffff, 2); key.position.set(Math.cos(az) * Math.cos(el), Math.sin(az) * Math.cos(el), Math.sin(el)); scene.add(key);
    const col = (v) => { const [a, b, c] = CB.rgb(v); return `rgb(${a * 255 | 0},${b * 255 | 0},${c * 255 | 0})`; };
    const paperTex = (s, i) => {
      const c = document.createElement("canvas"); c.width = 360; c.height = 500; const g = c.getContext("2d");
      g.fillStyle = col(i % 3 === 1 ? "--site-moss" : "--site-paper"); g.fillRect(0, 0, 360, 500);
      const ink = i % 3 === 1 ? col("--site-paper") : col("--kf-accent-text");
      g.fillStyle = col("--site-chip-b"); g.fillRect(150, 30, 60, 30);
      g.fillStyle = ink; g.font = `500 44px ${getComputedStyle(document.documentElement).getPropertyValue("--kf-font-hand")}`;
      g.fillText(s.t, 34, 330);
      g.font = `600 14px ${getComputedStyle(document.documentElement).getPropertyValue("--kf-font-mono")}`;
      for (let k = 0; k < 6; k++) g.fillRect(34, 370 + k * 16, 120 + ((k * 37) % 90), 3);
      g.fillStyle = col("--kf-accent"); g.globalAlpha = 0.45; g.fillRect(34, 110, 292, 160); g.globalAlpha = 1;
      g.strokeStyle = ink; g.strokeRect(12, 12, 336, 476);
      const t = new T3.CanvasTexture(c); t.colorSpace = T3.SRGBColorSpace; return t;
    };
    const shTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d"); g.filter = "blur(9.6px)"; g.globalAlpha = 0.5; g.fillStyle = col("--kf-contrast-bg"); g.fillRect(14, 14, 36, 36); return new T3.CanvasTexture(c); })();
    const items = SHEETS.map((s, i) => {
      const geo = new T3.PlaneGeometry(1, 1.39, 16, 16);
      const base = geo.attributes.position.array.slice();
      const m = new T3.Mesh(geo, new T3.MeshStandardMaterial({ map: paperTex(s, i), roughness: 0.85, side: T3.DoubleSide }));
      const sh = new T3.Mesh(new T3.PlaneGeometry(1.5, 1.9), new T3.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false, opacity: 0 }));
      scene.add(sh, m);
      return { s, m, sh, geo, base, z0: i * 0.012 };
    });
    let W = 1, H = 1;
    const size = () => { W = cv.clientWidth; H = cv.clientHeight; r.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix(); };
    size();
    const ro = new ResizeObserver(size); ro.observe(cv); off.push(() => ro.disconnect());
    r.compile(scene, cam);
    const vh = 2 * Math.tan((10 * Math.PI) / 360) * 60;
    const place = (p) => {
      const vw = vh * cam.aspect, sz = vh * 0.8;
      items.forEach((it) => {
        const gi = G.findIndex((g) => g.includes(it.s));
        const k = gsap.utils.clamp(0, 1, p * G.length - gi);
        const land = E.out(Math.min(1, k * 1.15));
        const scl = sz * it.s.s;
        const tx = it.s.x * vw, ty = -it.s.y * vh;
        it.m.visible = it.sh.visible = k > 0;
        it.m.scale.setScalar(scl);
        it.m.position.set(tx + (1 - land) * vw * 0.15, ty + (1 - land) * vh * 1.72, it.z0 + (1 - land) * 18);
        it.m.rotation.set((-29 * Math.PI / 180) * (1 - land), 0, (it.s.rot * Math.PI) / 180 + (1 - land) * 0.4);
        const pos = it.geo.attributes.position; const bend = (1 - land) * 0.35;
        for (let v = 0; v < pos.count; v++) { const x = it.base[v * 3], y = it.base[v * 3 + 1]; pos.array[v * 3 + 2] = Math.sin((x + 0.5) * Math.PI) * bend - y * bend * 0.3; }
        pos.needsUpdate = true;
        it.sh.position.set(tx + scl * 0.06, ty - scl * 0.08, it.z0 - 0.005);
        it.sh.scale.setScalar(scl * (1 + (1 - land) * 0.4));
        it.sh.rotation.z = it.m.rotation.z;
        it.sh.material.opacity = 0.23 * 2 * land;
      });
      r.render(scene, cam);
    };
    mm.add({ all: "(min-width: 0px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      if (ctx.conditions.reduce) { place(1); return; }
      ScrollTrigger.create({ trigger: sec, start: "top top", end: "bottom bottom", scrub: true, onUpdate: (st) => {
        const p = st.progress;
        place(gsap.utils.clamp(0, 1, p / 0.82));
        gsap.set(ring, { scale: gsap.utils.clamp(0, 1, (p - 0.86) / 0.14) });
      }, onRefresh: (st) => place(gsap.utils.clamp(0, 1, st.progress / 0.82)) });
    });
    place(0);
  }

  /* Agenda — the date and days left of the reading day flip upward from both sides as they change, and the first photo strip refills every 6s */
  function agenda(root) {
    const ps = root.querySelectorAll(".agenda__dates .dc");
    let cur = "";
    root.querySelectorAll(".agenda__head").forEach((h) => {
      ScrollTrigger.create({ trigger: h, start: "top 60%", end: "bottom 60%", onToggle: (st) => {
        if (!st.isActive || cur === h.dataset.day) return;
        cur = h.dataset.day; const v = cur.split("|");
        ps.forEach((p, i) => gsap.timeline().to(p, { rotationX: 90, yPercent: -40, opacity: 0, duration: 0.25, ease: "power2.in" }).add(() => (p.textContent = v[i])).fromTo(p, { rotationX: -90, yPercent: 40, opacity: 0 }, { rotationX: 0, yPercent: 0, opacity: 1, duration: 0.45, ease: E.out }));
      } });
    });
    gsap.fromTo(root.querySelector(".agenda__prog b"), { scaleX: 0 }, { scaleX: 1, duration: 6, ease: "none", repeat: -1 });
    root.querySelectorAll(".agenda__nav").forEach((b) => on(b, "click", () => gsap.fromTo(root.querySelectorAll(".agenda__pair .ph"), { opacity: 0.2 }, { opacity: 1, duration: 0.5, ease: E.out })));
  }

  /* Wall — drag stamps around (mouse only, a finger scrolls the page). Picking one up brings it to the top */
  function wall(root) {
    let z = 10;
    root.querySelectorAll(".wall__piece").forEach((p) => {
      on(p, "pointerdown", (e) => {
        if (e.pointerType !== "mouse") return;
        e.preventDefault();
        const sx = e.clientX, sy = e.clientY, x0 = gsap.getProperty(p, "x"), y0 = gsap.getProperty(p, "y");
        p.style.zIndex = ++z; p.classList.add("is-drag");
        const mv = (ev) => gsap.set(p, { x: x0 + ev.clientX - sx, y: y0 + ev.clientY - sy });
        const up = () => { p.classList.remove("is-drag"); removeEventListener("pointermove", mv); removeEventListener("pointerup", up); };
        addEventListener("pointermove", mv); addEventListener("pointerup", up);
      });
    });
  }

  /* Reviews — when the 9s bar fills, it moves to the next review (text slides down 24 and vanishes, then returns) */
  // Each visible line of text is wrapped in a mask and rises from below (.32s power3.inOut, .033s line gap), and the signature is redrawn by 16 masking strokes staggered .25s each
  function quote(root) {
    const sec = root.querySelector(".hs-quote"), bar = sec.querySelector(".hs-quote__bar span"), text = sec.querySelector(".hs-quote__text");
    const strokes = sec.querySelectorAll(".hs-quote__sign mask path");
    const src = text.textContent.trim();
    const split = () => {
      text.innerHTML = src.split(/\s+/).map((w) => `<span class="w" style="display:inline-block">${w}</span>`).join(" ");
      const rows = new Map();
      text.querySelectorAll(".w").forEach((w) => { const k = Math.round(w.offsetTop); (rows.get(k) || rows.set(k, []).get(k)).push(w.textContent); });
      text.innerHTML = [...rows.values()].map((r) => `<span class="text-line-mask"><span class="text-line">${r.join(" ")}</span></span>`).join("");
    };
    split();
    const ro = new ResizeObserver(() => { if (Math.abs(text.clientWidth - (text._w || 0)) > 2) { text._w = text.clientWidth; split(); } }); ro.observe(text); off.push(() => ro.disconnect());
    const lines = () => text.querySelectorAll(".text-line");
    const draw = () => gsap.fromTo(strokes, { strokeDashoffset: 513 }, { strokeDashoffset: 0, duration: 0.25, ease: "sine.inOut", stagger: 0.0655, delay: 0.1 });
    const swap = () => {
      sec.classList.add("is-swap"); gsap.delayedCall(0.4, () => sec.classList.remove("is-swap"));
      if (!CB.reduce) gsap.timeline().to(lines(), { yPercent: -110, duration: 0.25, ease: "power3.in", stagger: 0.02 })
        .fromTo(lines(), { yPercent: 110 }, { yPercent: 0, duration: 0.32, ease: "power3.inOut", stagger: 0.033 })
        .add(draw, "<");
      tl.restart();
    };
    const tl = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 9, ease: "none", paused: true, onComplete: () => swap() });
    ScrollTrigger.create({ trigger: sec, start: "top bottom", end: "bottom top", onToggle: (st) => (st.isActive ? tl.play() : tl.pause()) });
    sec.querySelectorAll(".hs-quote__nav").forEach((b) => on(b, "click", swap));
  }

  /* Hero photo — the area around the mouse (7 tiles) shatters into tiles the same size as the field and gets pushed outward, with the background showing through the gaps.
     On leave it reattaches at .06 follow (about .8s). Each tile carries its photo fragment as is */
  function tiles(root) {
    if (!CB.hover || CB.reduce) return;
    root.querySelectorAll("[data-tiles] .hero-card__media").forEach((media) => {
      let layer = null, cells = [], tx = 0, ty = 0, mx = 0, my = 0, hot = 0, th = 0, raf = 0, T = 18;
      const build = () => {
        const w = media.clientWidth, h = media.clientHeight, bg = getComputedStyle(media).backgroundImage;
        T = Math.max(10, 24 * Math.min(1920, Math.max(1440, innerWidth)) / 1920);
        layer = document.createElement("div"); layer.className = "tiles"; layer.setAttribute("aria-hidden", "true");
        const cols = Math.ceil(w / T), rows = Math.ceil(h / T);
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          const d = document.createElement("i");
          d.style.cssText = `left:${c * T}px;top:${r * T}px;width:${T}px;height:${T}px;background-image:${bg};background-size:${w}px ${h}px;background-position:${-c * T}px ${-r * T}px`;
          layer.appendChild(d); cells.push({ d, x: (c + 0.5) * T, y: (r + 0.5) * T });
        }
        media.appendChild(layer);
      };
      const loop = () => {
        hot += (th - hot) * (th > hot ? 0.15 : 0.06);
        mx += (tx - mx) * 0.15; my += (ty - my) * 0.15;
        const R = 7 * T;
        for (const c of cells) {
          const dx = c.x - mx, dy = c.y - my, dist = Math.hypot(dx, dy);
          if (dist > R) { if (c.on) { c.d.style.transform = ""; c.on = false; } continue; }
          const k = (1 - dist / R) ** 2 * hot, n = dist || 1;
          c.d.style.transform = `translate(${(dx / n) * k * T * 0.72}px,${(dy / n) * k * T * 0.72}px) scale(${1 - k * 0.2})`;
          c.on = true;
        }
        layer.style.opacity = hot > 0.01 ? 1 : 0;
        raf = hot > 0.005 || th ? requestAnimationFrame(loop) : 0;
      };
      const move = (e) => {
        // If the photo has changed, re-slice the pieces from the new photo
        if (!layer || media._stale) { layer?.remove(); cells = []; build(); media._stale = false; }
        const r = media.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top;
        if (!th) { mx = tx; my = ty; }
        th = 1; if (!raf) raf = requestAnimationFrame(loop);
      };
      const out = (e) => { if (!media.contains(e.relatedTarget)) { th = 0; if (!raf) raf = requestAnimationFrame(loop); } };
      on(media, "pointermove", move); on(media, "pointerout", out);
      off.push(() => { cancelAnimationFrame(raf); layer?.remove(); });
    });
  }

  /* Video cell — pressing it opens a video window (placeholder video) */
  function recap(root) {
    const fig = root.querySelector(".travel__recap");
    if (!fig) return;
    // Colors given in oklch blend in Oklab during the transition, so the press→lime curve rises later than the original (#000, blended in sRGB) — swap the same colors into rgb() form
    fig.style.setProperty("--recap-press", `rgb(${CB.rgb("oklch(from var(--kf-contrast-bg) 0 c h)").map((c) => Math.round(c * 255)).join(", ")})`);
    let box = document.querySelector(".cb-video");
    if (!box) {
      box = document.createElement("div"); box.className = "cb-video"; box.setAttribute("aria-hidden", "true");
      box.innerHTML = '<div class="cb-video__frame ph ph--dark" data-label="Event highlight video · landscape 16:9 · autoplay"></div><button class="cb-video__close" type="button">[ Close ]</button>';
      document.body.appendChild(box);
      const close = () => { box.classList.remove("is-open"); box.setAttribute("aria-hidden", "true"); CB.lenis?.start(); };
      box.addEventListener("click", (e) => (e.target === box || e.target.closest(".cb-video__close")) && close());
      addEventListener("keydown", (e) => e.key === "Escape" && close());
    }
    on(fig, "click", () => { box.classList.add("is-open"); box.setAttribute("aria-hidden", "false"); CB.lenis?.stop(); });
  }

  /* Footer — hovering the name row opens the face cell from above, back to top */
  function foot(root) {
    const face = root.querySelector(".foot__face");
    root.querySelectorAll(".foot .names span").forEach((s) => { on(s, "pointerenter", () => face.classList.add("is-on")); on(s, "pointerleave", () => face.classList.remove("is-on")); });
    root.querySelectorAll("[data-back-top]").forEach((a) => on(a, "click", (e) => { e.preventDefault(); CB.lenis ? CB.lenis.scrollTo(0) : scrollTo({ top: 0, behavior: "smooth" }); }));
  }

  CB.page("home", {
    mount(root, mm) {
      hero(root); eye(root); story(root); scheme(root); land(root); titlefx(root); circles(root); poster(root, mm); agenda(root); wall(root); quote(root); recap(root); tiles(root); foot(root);
      // Where the butterfly lands — a set point on screen per section (horizontal · vertical ratio)
      const P = [[".hero", 0.84, 0.3], [".hs-intro", 0.9, 0.2], [".hs-story", 0.78, 0.18], [".hs-land", 0.62, 0.42], [".hs-about", 0.58, 0.72], [".hs-poster", 0.3, 0.42], [".hs-agenda", 0.12, 0.6], [".hs-wall", 0.7, 0.3], [".hs-quote", 0.56, 0.62], [".foot", 0.48, 0.5]];
      CB.perches = P.map(([s, x, y]) => ({ el: root.querySelector(s), x, y })).filter((p) => p.el);
    },
    unmount() { off.splice(0).forEach((f) => f()); },
  });
})();
