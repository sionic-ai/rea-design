// First page scenes — like the original homeScene the stage stays stuck (sticky), and the [data-section] cells stacked behind create the scroll length.
// Progress is as in the original tracker — 0 when the cell top touches the screen bottom → 1 when the cell bottom touches the screen bottom (B) or top (T), and each cell’s share is the end including the cell height ÷ the whole of the cells.
// Cell heights are per-section values from the original style.css (index.css), and values inside sections (curves, thresholds, ratios) were read from the original scene code.
const FN_O = 'stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"';
// Layered art that existed only in the original — redrawn in the same position, size and feel (black outline + flat color)
Object.assign(FN.art, {
  // Five end-section characters (original end-chr) — round people that differ only in body color
  buddy: (n) => {
    const c = ["var(--kf-accent)", "var(--site-orange)", "var(--site-yellow)", "var(--site-sky)", "var(--site-pink)"][+n || 0];
    const hair = ["var(--site-red)", "var(--site-brown)", "var(--site-leaf-pale2)", "var(--site-yellow-warm)", "var(--site-amber-soft)"][+n || 0];
    return `<svg viewBox="0 0 120 160"><path d="M24 158c0-46 12-72 36-74 24 2 36 28 36 74z" ${FN_O} style="fill:${c}"/><path d="M28 110c-14 4-20 14-22 26M92 110c14 4 20 14 22 26" fill="none" ${FN_O} stroke-width="9" style="stroke:${c}"/><circle cx="60" cy="52" r="28" ${FN_O} style="fill:var(--site-skin)"/><path d="M32 50c-2-24 14-36 30-34 16 0 30 12 28 32-8-10-20-14-32-10-8 6-18 10-26 12z" ${FN_O} style="fill:${hair}"/><circle cx="51" cy="56" r="2.6"/><circle cx="69" cy="56" r="2.6"/><path d="M54 66c4 3 8 3 12 0" fill="none" ${FN_O}/></svg>`;
  },
  // Procurement section graph + people (original scene01-chr2 four layers: background 0 · bars 1.5 · people −2 · leaves −1)
  "graph-base": `<svg viewBox="0 0 420 300"><path d="M20 280h380M40 280V30" fill="none" ${FN_O}/><g fill="none" ${FN_O} stroke-width="1.2" opacity=".35"><path d="M40 220h360M40 160h360M40 100h360"/></g></svg>`,
  "graph-bars": `<svg viewBox="0 0 420 300"><g ${FN_O}><rect x="80" y="200" width="44" height="80" style="fill:var(--site-leaf-soft)"/><rect x="150" y="160" width="44" height="120" style="fill:var(--site-leaf-soft)"/><rect x="220" y="110" width="44" height="170" style="fill:var(--kf-accent)"/><rect x="290" y="60" width="44" height="220" style="fill:var(--kf-accent)"/></g><path d="M70 190l80-40 70-50 90-60" fill="none" ${FN_O} stroke-width="3" style="stroke:var(--site-orange)"/><path d="M296 34l18-2-6 17" fill="none" ${FN_O} stroke-width="3" style="stroke:var(--site-orange)"/></svg>`,
  "graph-man": `<svg viewBox="0 0 420 300"><path d="M330 298l2-60h40l2 60z" ${FN_O} style="fill:var(--site-leaf-deep)"/><path d="M316 250c-4-44 8-70 36-72 30 2 38 28 34 72z" ${FN_O} style="fill:var(--site-paper)"/><path d="M322 200c-20-6-34-24-38-40" fill="none" ${FN_O} stroke-width="10" style="stroke:var(--site-paper)"/><path d="M322 200c-20-6-34-24-38-40" fill="none" ${FN_O}/><circle cx="284" cy="156" r="7" ${FN_O} style="fill:var(--site-skin)"/><circle cx="352" cy="150" r="22" ${FN_O} style="fill:var(--site-skin)"/><path d="M330 146c-2-20 14-30 26-28 12 2 20 12 18 26-8-8-18-10-28-6z" ${FN_O} style="fill:var(--site-brown)"/></svg>`,
  "graph-leaf": `<svg viewBox="0 0 420 300"><g ${FN_O} style="fill:var(--site-leaf-soft)"><path d="M60 40c20-20 50-16 56 4-20 14-44 12-56-4z"/><path d="M370 110c14-18 40-16 44 0-14 12-34 12-44 0z"/></g><g ${FN_O} stroke-width="1.6" style="fill:var(--site-yellow)"><circle cx="128" cy="70" r="7"/><circle cx="392" cy="70" r="5"/></g></svg>`,
  // Manufacturing section: three flying insects (layers of the original scene03-fly: 2.5 · 2.5 · 5)
  midge: `<svg viewBox="0 0 60 40"><g ${FN_O} stroke-width="1.6"><ellipse cx="22" cy="12" rx="11" ry="8" style="fill:var(--site-ice-pale)"/><ellipse cx="36" cy="10" rx="10" ry="7" style="fill:var(--site-ice-pale)"/><ellipse cx="30" cy="24" rx="12" ry="8" style="fill:var(--kf-ink)"/></g><circle cx="20" cy="24" r="5" ${FN_O} stroke-width="1.6" style="fill:var(--kf-ink)"/></svg>`,
});

FN.onPage("home", () => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const vh = () => innerHeight;
  const head = $(".fn-head");
  const light = (on) => head?.classList.toggle("is-light", on);
  const vid = (n) => FN.videos[n];
  // Original eI·zi
  const eI = (v, a, b) => (b <= a ? 0 : Math.max(0, Math.min(1, (v - a) / (b - a))));
  const zi = (a, b, t) => (1 - t) * a + t * b;
  CustomEase.create("heo1", "M0,0 C0.18,0.06 0.23,1 1,1");
  CustomEase.create("sceneMove", "M0,0 C0.45,0.12 0.46,1 1,1");
  const ez = (n) => gsap.parseEase(n);
  const E = { heo1: ez("heo1"), move: ez("sceneMove"), p1io: ez("power1.inOut"), p2io: ez("power2.inOut"), p3io: ez("power3.inOut"), p4io: ez("power4.inOut"), p2o: ez("power2.out"), p1i: ez("power1.in"), backIO: ez("back.inOut") };
  // Original ProgressManager — reports the direction (1 · −1) when the value crosses a threshold
  const marks = () => {
    let prev = 0;
    const items = [];
    return {
      on(t, fn) { items.push([t, fn]); return this; },
      update(v) {
        if (v === prev) return;
        const dir = v > prev ? 1 : -1, was = prev;
        prev = v;
        for (const [t, fn] of items) { const a = was - t, b = v - t; if ((a <= 0 && b > 0) || (a >= 0 && b < 0) || (a !== 0 && b === 0)) fn(dir); }
      },
    };
  };
  // Original hg tracker — 0 when the cell top touches the screen bottom (viewB), 1 when the cell bottom touches the screen bottom (B) or top (T), or when the cell top touches the screen top (TT)
  const tracker = (el) => {
    const t = { el, top: 0, h: 0, ends: [] };
    t.measure = () => {
      t.h = el.offsetHeight;
      t.top = el.getBoundingClientRect().top + scrollY;
      let acc = 0;
      t.ends = $$(":scope > [data-section]", el).map((s) => {
        const cs = getComputedStyle(s);
        acc += s.offsetHeight + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom);
        return [s.dataset.section, t.h ? acc / t.h : 0];
      });
    };
    t.ratio = (mode = "B") => {
      const d = scrollY + vh() - t.top;
      return eI(d, 0, mode === "T" ? t.h + vh() : mode === "TT" ? vh() : t.h);
    };
    t.parts = (r) => { const o = {}; let a = 0; for (const [n, e] of t.ends) { o[n] = eI(r, a, e); a = e; } return o; };
    return t;
  };
  // One scene: measure (set cell height and margins first in refreshInit) → measure → draw. Drawing runs on every scroll
  const scenes = [];
  const scene = (root, s) => {
    if (!root) return;
    s.root = root;
    scenes.push(s);
  };

  // Speech bubble typing — original S2 (write ”…” at 80ms, hold 1.5s, then erase at 30ms)
  const typed = $(".hero__typed");
  if (typed) {
    const full = typed.dataset.type;
    if (FN.reduced) typed.textContent = full;
    else {
      const o = { n: 0 };
      gsap.timeline({ repeat: -1 })
        .to(o, { n: full.length, duration: full.length * 0.08, ease: "none", onUpdate: () => (typed.textContent = full.slice(0, Math.round(o.n))) })
        .to(o, { n: 0, duration: full.length * 0.03, ease: "none", delay: 1.5, onUpdate: () => (typed.textContent = full.slice(0, Math.round(o.n))) });
    }
  }

  // Cursor response — original mouseParallax depth (per layer): hero flying characters 5 · farmer 3 · graph layers [0, 1.5, −2, −1] · researcher .7 · flag group .65 ·
  // Factory person 1 · flying bug [2.5, 2.5, 5] · Footer flying character 3 · Footer five characters [5, 4, 3, 3, 2]
  [[".hero__fly", 5], [".split__art", 3], [".answer__art", 0.7], [".rnd__crowd", 0.65], [".stats__art--tall", 1], [".spiral__fly", 3]]
    .forEach(([s, d]) => FN.parallax($(s), d));
  $$(".split__graph > div").forEach((el, i) => FN.parallax(el, [0, 1.5, -2, -1][i]));
  $$(".stats__fly > div").forEach((el, i) => FN.parallax(el, [2.5, 2.5, 5][i]));
  $$(".end-chrs > div").forEach((el, i) => FN.parallax(el, [5, 4, 3, 3, 2][i]));

  // Original dinosaur: the pupil goes straight toward the cursor measured from the eye center by min(distance, 140)/10 (max 14 in original art units — scaled by the ratio of original eye radius 38 to ours 17),
  // The body (the whole figure) shifts toward the cursor, measured from the figure center, by min(distance, 20m)/20 px(m = toward the target width/250 × 15), .08 per rAF
  const blob = $(".hole__blob");
  const blobSvg = blob?.querySelector("svg");
  if (blobSvg && FN.cursorOK) {
    blob.classList.add("is-follow");
    const pupils = $$(".fn-pupil", blobSvg);
    const eyes = [[72, 62], [112, 62]], k = 17 / 38;
    const aim = { x: 0, y: 0 }, at = { x: 0, y: 0 };
    let raf = 0;
    const loop = () => {
      at.x += (aim.x - at.x) * 0.08; at.y += (aim.y - at.y) * 0.08;
      const done = Math.abs(aim.x - at.x) < 0.1 && Math.abs(aim.y - at.y) < 0.1;
      if (done) { at.x = aim.x; at.y = aim.y; }
      blobSvg.style.translate = `${at.x}px ${at.y}px`;
      raf = done ? 0 : requestAnimationFrame(loop);
    };
    const move = (e) => {
      const r = blobSvg.getBoundingClientRect();
      if (!r.width) return;
      const ux = (e.clientX - r.left) * (160 / r.width), uy = (e.clientY - r.top) * (130 / r.height);
      pupils.forEach((p, i) => {
        const dx = ux - eyes[i][0], dy = uy - eyes[i][1], d = Math.hypot(dx, dy) || 1, m = Math.min(d, 140 * k) / 10;
        p.style.translate = `${(dx / d) * m - 4}px ${(dy / d) * m - 2}px`;
      });
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1;
      const m = Math.min(d, (r.width / 250) * 15 * 20) / 20;
      aim.x = (dx / d) * m; aim.y = (dy / d) * m;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    addEventListener("pointermove", move);
    FN.cleanup(() => { removeEventListener("pointermove", move); cancelAnimationFrame(raf); });
  }

  // Original cateManagement cursor: toward the cursor measured from the diagram center, min(distance, 600)/20 px × a ratio per layer (center circle .2 · arrow .4 · step circle .2 · description card .2)
  // Chases the target by .08 per rAF. The step circle is layered with margin, separate from the scroll position shift (translate)
  const diagram = $(".cycle__diagram");
  if (diagram && FN.cursorOK) {
    const layers = [[".cycle__core", 0.2], [".cycle__arrows", 0.4], [".cycle__card", 0.2]].map(([s, f]) => [$(s, diagram), f]).filter(([el]) => el);
    const balls = $$(".cycle__ball", diagram);
    const aim = { x: 0, y: 0 }, at = { x: 0, y: 0 };
    let raf = 0;
    const loop = () => {
      at.x += (aim.x - at.x) * 0.08; at.y += (aim.y - at.y) * 0.08;
      layers.forEach(([el, f]) => (el.style.translate = `${at.x * f}px ${at.y * f}px`));
      balls.forEach((b) => (b.style.translate = `${at.x * 0.2}px ${at.y * 0.2}px`));
      raf = Math.abs(aim.x - at.x) * 0.4 > 0.1 || Math.abs(aim.y - at.y) * 0.4 > 0.1 ? requestAnimationFrame(loop) : 0;
    };
    const move = (e) => {
      const r = diagram.getBoundingClientRect();
      const dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2, d = Math.hypot(dx, dy) || 1, m = Math.min(d, 600) / 20;
      aim.x = (dx / d) * m; aim.y = (dy / d) * m;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    addEventListener("mousemove", move);
    FN.cleanup(() => { removeEventListener("mousemove", move); cancelAnimationFrame(raf); });
  }

  // Sales section sticker: like the original, one three (r176) panel rolled by a shader. The shader is ours: the distance measured at 45° from the top-left corner is
  // Parts farther than the unfold (progress) are wrapped around a leading upper cylinder (radius .15, shrinking to half toward the inside so it spirals), and the wrapped side darkens up to .7. Up to 5 turns.
  const VERT = `
    uniform float uProgress; uniform float uAngle; uniform float uRolls; uniform float uRad;
    varying vec2 vUv; varying float vShade;
    void main() {
      vUv = uv;
      vec2 dir = vec2(cos(uAngle), -sin(uAngle));
      vec2 corner = vec2(-0.5, 0.5);
      vec2 p = position.xy - corner;
      float span = abs(dir.x) + abs(dir.y);
      float along0 = dot(p, dir);
      float s = along0 / span - uProgress;
      vec3 pos = position;
      vShade = 1.0;
      if (s > 0.0) {
        float k = clamp(s / max(1.0 - uProgress, 0.001), 0.0, 1.0);
        float r = uRad * (1.0 - 0.5 * k);
        float th = min(s * span / r, uRolls * 6.2831853);
        vec2 xy = corner + (p - dir * along0) + dir * (uProgress * span + r * sin(th));
        pos = vec3(xy, r * (1.0 - cos(th)));
        vShade = mix(1.0, 0.7, smoothstep(0.0, 0.05, s));
      }
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }`;
  const FRAG = `
    uniform sampler2D uMap; varying vec2 vUv; varying float vShade;
    void main() { vec4 c = texture2D(uMap, vUv); if (c.a < 0.01) discard; gl_FragColor = vec4(c.rgb * vShade, c.a); }`;
  const drawLabel = () => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const g = c.getContext("2d");
    const probe = document.createElement("i");
    document.body.append(probe);
    const col = (v) => ((probe.style.color = `var(${v})`), getComputedStyle(probe).color);
    const ink = col("--kf-ink"), paper = col("--site-paper"), accent = col("--kf-accent"), orange = col("--site-orange"), leaf = col("--site-leaf-deep");
    probe.remove();
    const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
    rr(12, 12, 488, 488, 64); g.fillStyle = paper; g.fill(); g.lineWidth = 10; g.strokeStyle = ink; g.stroke();
    rr(48, 48, 416, 416, 40); g.fillStyle = accent; g.fill();
    g.beginPath(); g.arc(256, 228, 120, 0, Math.PI * 2); g.fillStyle = paper; g.fill(); g.lineWidth = 8; g.strokeStyle = ink; g.stroke();
    g.beginPath(); g.ellipse(226, 214, 34, 44, -0.5, 0, Math.PI * 2); g.fillStyle = orange; g.fill(); g.stroke();
    g.beginPath(); g.ellipse(292, 238, 40, 30, 0.4, 0, Math.PI * 2); g.fillStyle = leaf; g.fill(); g.stroke();
    g.fillStyle = ink; g.textAlign = "center"; g.font = `800 64px ${getComputedStyle(document.documentElement).getPropertyValue("--kf-font-display")}`;
    g.fillText("LOGO", 256, 418);
    return c;
  };
  const makeSticker = (host) => {
    if (!host || !window.THREE) return null;
    const canvas = document.createElement("canvas");
    host.append(canvas);
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, depth: false, stencil: false }); } catch { return null; }
    renderer.setClearColor(0xffffff, 0);
    const scene3 = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 1.5 / Math.tan(THREE.MathUtils.degToRad(22.5));
    const tex = new THREE.CanvasTexture(drawLabel());
    const uni = { uMap: { value: tex }, uProgress: { value: 0.1 }, uAngle: { value: Math.PI / 4 }, uRolls: { value: 5 }, uRad: { value: 0.15 } };
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 80, 80), new THREE.ShaderMaterial({ uniforms: uni, vertexShader: VERT, fragmentShader: FRAG, side: THREE.DoubleSide, transparent: true }));
    scene3.add(mesh);
    const fit = () => { const w = canvas.clientWidth || 1; renderer.setPixelRatio(Math.min(2, devicePixelRatio)); renderer.setSize(w, w, false); };
    const ro = new ResizeObserver(fit);
    ro.observe(host);
    fit();
    let raf = 0;
    const loop = () => { renderer.render(scene3, camera); raf = requestAnimationFrame(loop); };
    const api = {
      host,
      set(progress, rot) { uni.uProgress.value = progress; scene3.rotation.x = rot; scene3.rotation.y = rot; if (!raf) renderer.render(scene3, camera); },
      run(on) { if (on && !raf) raf = requestAnimationFrame(loop); else if (!on && raf) { cancelAnimationFrame(raf); raf = 0; } },
      destroy() { if (!canvas.isConnected) return; api.run(false); ro.disconnect(); mesh.geometry.dispose(); mesh.material.dispose(); tex.dispose(); renderer.dispose(); canvas.remove(); },
    };
    api.set(0.1, -0.7);
    FN.cleanup?.(api.destroy);
    return api;
  };

  // Original videoPlayer enableAutoPlayInView — plays as soon as even one pixel is on screen, and pauses on leaving (threshold 0)
  const inview = $$("video[data-inview]");
  if (inview.length) {
    const io = new IntersectionObserver((ents) => ents.forEach((en) => (en.isIntersecting ? en.target.play().catch(() => {}) : en.target.pause())), { threshold: 0 });
    inview.forEach((v) => io.observe(v));
    FN.cleanup(() => io.disconnect());
  }

  // ”Next” section title — original topSectionLabel: as the title top moves from screen bottom to top (elT_viewB_elT_viewT) it rises 30px (phone 20px) with power2.inOut (0~.8 share).
  // The title sits in a pinned stage, so measure by its pre-pin position (above the section + position inside the stage)
  $$(".fn-label__title").forEach((el) => {
    const box = el.closest(".fn-label"), stick = box.closest(".fn-stick");
    let top = 0;
    scene(box.closest("section"), {
      measure() { top = stick.parentElement.getBoundingClientRect().top + scrollY + box.offsetTop; },
      render() {
        const n = E.p2io(eI(eI(scrollY + vh() - top, 0, vh()), 0, 0.8));
        el.style.translate = `0 ${(1 - n) * (innerWidth >= 768 ? 60 : 40) * 0.5}px`;
      },
    });
  });

  // ───────── 1. Hero (original topKv) ─────────
  (() => {
    const root = $(".hero");
    if (!root) return;
    const t = tracker($(".fn-area", root));
    const inEl = $('[data-section="in"]', t.el);
    const intro = $(".hero__intro", root), slogan = $(".hero__slogan", root), copy = $(".hero__copy", root), chr = $(".hero__chr", root), bub = $(".hero__bubble", root);
    const mask = $(".hero__mask", root), clip = $(".hero__clip", root), logo = $(".hero__logo", root), v1 = $(".hero__v1", root), v2 = $(".hero__v2", root);
    const title = $(".hero__title", root), fly = $(".hero__fly", root), prog = $(".fn-progress");
    // Titles are grouped per word and each letter gets a zigzag direction, so the flying character pushes the words away
    $$(".hero__we, .hero__name", title).forEach((p) => {
      p.innerHTML = p.textContent.trim().split(/\s+/).map((w) => `<span class="fn-sp">${[...w].map((ch) => {
        const v = Math.random() < 0.5, dx = v ? 0 : Math.random() < 0.5 ? -1 : 1, dy = v ? (Math.random() < 0.5 ? -1 : 1) : 0, k = (Math.random() * 2).toFixed(3);
        return `<span><i style="--dx:${dx};--dy:${dy};--i:${k};--ri:${(2 - k).toFixed(3)}">${ch}</i></span>`;
      }).join("")}</span>`).join(" ");
    });
    const words = $$(".fn-sp", title);
    // Original top-kv__chr: seven walking images (sequence) flip one frame each time the character moves 50px (entry motion + scroll steps).
    // Our art is a single image, so both legs (shoes included) rotate from the hip in 7 poses
    const chrSvg = chr.querySelector("svg");
    const legs = [];
    if (chrSvg) {
      const [lp, sp] = chrSvg.querySelectorAll("path");
      const split = (p) => p.getAttribute("d").split(/(?=M)/);
      const [l1, l2] = split(lp), [s1, s2] = split(sp);
      [[l1, s1, "77px 300px"], [l2, s2, "111px 300px"]].forEach(([ld, sd, o]) => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.style.transformOrigin = o;
        [[lp, ld], [sp, sd]].forEach(([src, d]) => { const c = src.cloneNode(); c.setAttribute("d", d); g.append(c); });
        chrSvg.insertBefore(g, lp);
        legs.push(g);
      });
      lp.remove(); sp.remove();
    }
    const walk = { last: null, acc: 0, frame: 0 };
    const stepLegs = () => {
      if (!legs.length) return;
      const x = chrSvg.getBoundingClientRect().left;
      if (walk.last === null) walk.last = x;
      walk.acc += x - walk.last;
      walk.last = x;
      const n = Math.trunc(walk.acc / 50);
      if (!n) return;
      walk.frame = (((walk.frame + n) % 7) + 7) % 7;
      walk.acc -= n * 50;
      const a = Math.sin((walk.frame / 7) * Math.PI * 2) * 16;
      legs[0].style.transform = `rotate(${a}deg)`;
      legs[1].style.transform = `rotate(${-a}deg)`;
    };
    // Original mask-cabbage uses a data-path-w 101 · data-path-h 85 box (not the code default 306×293) — our cabbage silhouette is fit to the same box
    const PW = 101, PH = 85;
    const S = { a: 0, Z: 0, z: 0, D: { cx: 0, cy: 0, size: 0 }, RA: 0, ZA: 0, fw: 0, fh: 0, fx: 0, fy: 0, centers: [], copyW: 0, sW: 0 };
    const H = marks(), f = marks(), CA = marks();
    H.on(0, (d) => d < 0 && vid("hero")?.pause(0))
      .on(1, (d) => { if (d > 0) { vid("hero")?.play(0); intro.classList.add("is-hide"); } else intro.classList.remove("is-hide"); })
      .on(0.5, (d) => light(d > 0))
      .on(0.7, (d) => title.classList.toggle("is-on", d > 0));
    f.on(0, (d) => { if (d < 0) { vid("intro")?.pause(0); vid("hero")?.play(); } else vid("intro")?.play(0); })
      .on(1, (d) => (d > 0 ? vid("hero")?.pause(0) : vid("hero")?.play(0)));
    CA.on(0.5, (d) => light(d < 0)).on(1, (d) => (d > 0 ? vid("intro")?.pause() : vid("intro")?.play()));
    // The panel held in the hand (center 141,180 of the panel in our art viewBox 180×380) is the original mask-trace spot — size is 23/230 of the character width like the original.
    // Measure with the moving graphic (svg) box so it follows the incoming motion
    const trace = (rest) => { const r = (rest ? chr : chr.firstElementChild || chr).getBoundingClientRect(); return { cx: r.left + (r.width * 141) / 180, cy: r.top + (r.height * 180) / 380, size: (r.width * 23) / 230 }; };
    const maxScale = () => (Math.hypot(innerWidth / 2, vh() / 2) / (Math.min(PW, PH) / 2)) * 2;
    let scale = 0;
    const setMask = (p, bB) => {
      scale = bB + (maxScale() - bB) * Math.max(0, Math.min(1, p));
      clip.setAttribute("transform", `translate(${Math.round(innerWidth / 2)},${Math.round(vh() / 2)}) scale(${scale}) translate(${-PW / 2},${-PH / 2})`);
    };
    scene(root, {
      size() {
        // Original onResizeObserver: in = max(screen height × 2, slogan width) × .5
        S.sW = slogan.offsetWidth;
        inEl.style.height = `${Math.max(vh() * 2, S.sW) * 0.5}px`;
      },
      measure() {
        t.measure();
        const W = innerWidth, MD = W >= 768;
        chr.style.translate = "";
        S.Z = W - chr.offsetWidth * 2;
        S.z = W >= 1280 ? S.sW - W * 0.25 : S.sW - W + 10;
        S.copyW = copy.offsetWidth;
        // a is the share of the step where the panel is at screen center — measured at its resting place (box), regardless of the incoming motion
        S.a = MD && S.Z > 0 ? Math.max(0, Math.min(1, (W * 0.5 - trace(true).cx) / S.Z)) : 0;
        S.D = trace();
        fly.style.transform = "";
        const fr = fly.getBoundingClientRect();
        S.fw = fr.width; S.fh = fr.height; S.fx = fr.left; S.fy = fr.top;
        words.forEach((w) => (w.style.transform = ""));
        S.centers = words.map((w) => { const r = w.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      },
      render(force) {
        const W = innerWidth, Hh = vh(), MD = W >= 768;
        const p = t.parts(t.ratio("T"));
        const BA = eI(p.in, 0, 0.9), DA = W >= 1440 ? S.a + 0.05 : 0.2;
        const o = eI(BA, S.a, DA), s = MD ? eI(BA, DA, DA + 0.1) : eI(BA, 0.2, 0.25);
        const TA = eI(BA, S.a, 1), LA = E.p1io(TA);
        const VI = BA * S.Z;
        H.update(TA);
        slogan.style.translate = `${-BA * S.z}px 0`;
        if (MD) {
          chr.style.translate = `${VI}px 0`;
          copy.style.translate = `${-E.p2o(BA) * (W - S.copyW) * 0.5}px 0`;
          // The speech bubble follows the character late via a spring (stiffness .4 · damping .5)
          if (force) { S.RA = VI; S.ZA = 0; } else { S.ZA += (VI - S.RA) * 0.4; S.ZA *= 0.5; S.RA += S.ZA; }
          bub.style.translate = `${S.RA}px 0`;
        } else { chr.style.translate = ""; copy.style.translate = ""; bub.style.translate = ""; }
        stepLegs();
        v1.style.transform = `scale(${2 - LA})`;
        mask.style.opacity = s;
        const uI = Math.max(0, Math.min(1, p.stay));
        const sc = uI * 0.5 + 0.5, nC = uI * (W + S.fw * 1.1), wi = uI * (Hh + S.fh * 1.1);
        fly.style.transform = `translate3d(${-nC}px, ${wi}px, 0) scale(${sc})`;
        // Words within the flying character’s perimeter (long side × scale) are pushed up to 120px with power2.inOut and blurred
        if (uI > 0) {
          const cx = S.fx + S.fw * 0.5 * sc - nC, cy = S.fy + S.fh * 0.5 * sc + wi, R = Math.max(S.fw, S.fh) * sc;
          words.forEach((w, i) => {
            const c = S.centers[i], dx = c.x - cx, dy = c.y - cy, d2 = dx * dx + dy * dy;
            if (d2 < R * R && d2 > 0) {
              const d = Math.sqrt(d2), k = E.p2io(1 - d / R), m = k * 120;
              w.style.transform = `translate3d(${(dx / d) * m}px, ${(dy / d) * m}px, 0)`;
              w.style.opacity = 1 - k;
            } else { w.style.transform = ""; w.style.opacity = ""; }
          });
        } else words.forEach((w) => { w.style.transform = ""; w.style.opacity = ""; });
        title.style.opacity = BA * (1 - uI);
        title.style.transform = `scale(${1.5 - BA * 0.5})`;
        v2.style.opacity = uI;
        f.update(uI);
        const Ag = MD ? eI(p.out, 0, 0.45) : eI(p.out, 0.1, 1);
        if (MD) v2.style.transform = `scale(${1 + Ag * 0.5})`;
        CA.update(Ag);
        if (t.ratio("T") <= 0 || BA <= S.a || !MD) S.D = trace();
        const bB = S.D.size / PW;
        setMask(MD ? LA - Ag : LA, bB);
        mask.style.translate = MD ? `0 ${-Hh * 0.7 * E.p1i(eI(p.out, 0.2, 0.5))}px` : "";
        if (prog) prog.style.opacity = eI(LA, 0.5, 1);
        // The cabbage logo (original cabbage-logo) on the panel flies to the screen center, growing to the mask size, and hides once the mask is full
        if (BA > S.a) {
          const CI = E.p1io(o), K = Math.max(S.D.size, PW * scale), u = (K * PH) / PW;
          const x = S.D.cx + (W / 2 - S.D.cx) * CI, y = S.D.cy + (Hh / 2 - S.D.cy) * CI;
          logo.style.transform = `translate3d(${x - K / 2}px, ${y - u / 2}px, 0)`;
          logo.style.width = `${K}px`; logo.style.height = `${u}px`;
          logo.style.opacity = s === 1 ? 0 : 1;
        } else {
          const D = S.D, u = (D.size * PH) / PW;
          logo.style.transform = `translate3d(${D.cx - D.size / 2}px, ${D.cy - u / 2}px, 0)`;
          logo.style.width = `${D.size}px`; logo.style.height = `${u}px`;
          // Like the original, while on the panel the logo in the character art is visible, and the separated logo appears when it starts flying (when it passes step share a)
          logo.style.opacity = 0;
        }
      },
      reduced() { setMask(1, 0); mask.style.opacity = 1; logo.style.opacity = 0; title.classList.add("is-on"); },
    });
  })();

  // ───────── 2. Sourcing section (original homeScene01) — a truck runs left → right pulling in a rounded video panel, and during the hold the panel shrinks into the box below and a second video plays ─────────
  (() => {
    const root = $(".chapter--truck");
    if (!root) return;
    const t = tracker($(".fn-area", root));
    const stage = $(".truck-stage", root), truck = $(".truck", root), wrap = $(".tube", root), inner = $(".tube__inner", root), round = $(".tube__round", root);
    const v2 = $(".tube__v2", root), vtitle = $(".tube__text", root), label = $(".chapter__label", root);
    const split = $(".split--procure"), box = $(".split__box", split);
    const S = { tw: 0, th: 0, p: 0, M: 0, box: { left: 0, top: 0, w: 0, h: 0 }, R: 0, d: 0, K: 0 };
    const y = marks(), N = marks();
    y.on(0.1, (d) => { if (d < 0) { vid("tube")?.pause(0); vid("s1small2")?.pause(0); } })
      .on(0.95, (d) => light(d > 0))
      .on(1, (d) => { if (d > 0) { vid("tube")?.play(0); label.style.opacity = 0; } else label.style.opacity = 1; });
    N.on(0.15, (d) => { if (d > 0) { light(false); vid("tube")?.pause(); vid("s1small2")?.play(); } else { light(true); vid("tube")?.play(); vid("s1small2")?.pause(); } });
    scene(root, {
      size() {
        // Original updateSizes: pulls up the lower text group so that the moment the stage where the box is attached is released, it overlaps the spot where the video panel shrank
        // (the moment the stage releases, above the box = Height where the panel settles, min(50vh, 320px))
        split.style.marginTop = "";
        const pad = Math.min(vh() * 0.5, 320);
        const off = box.getBoundingClientRect().top - split.getBoundingClientRect().top;
        split.style.marginTop = `${pad - off - vh()}px`;
      },
      measure() {
        t.measure();
        S.tw = truck.offsetWidth; S.th = truck.offsetHeight; S.p = stage.offsetHeight;
        S.M = Math.min(vh() * 0.5, 320);
        const br = box.getBoundingClientRect();
        S.box = { left: br.left, w: br.width, h: br.height };
      },
      render(force) {
        const W = innerWidth, MD = W >= 768;
        const r = t.ratio("B"), p = t.parts(r);
        // Original follows progress lagging by .1 (R = zi(R, r, .1))
        S.R = force ? r : zi(S.R, r, 0.1);
        const ends = Object.fromEntries(t.ends);
        let cA = E.heo1(eI(S.R, t.h ? S.th / t.h : 0, ends.in));
        y.update(cA);
        truck.style.transform = `translate3d(${cA * (W + S.tw) - S.tw}px, 0, 0)`;
        const nI = 200 + W + S.tw;
        wrap.style.transform = `translate3d(${cA * nI - nI}px, 0, 0)`;
        const EI = E.p1io(eI(p.stay, 0, MD ? 0.9 : 0.95));
        N.update(EI);
        v2.style.opacity = eI(EI, 0, 0.5);
        const target = S.box.left * EI;
        S.d = force || !MD ? target : zi(S.d, target, 0.1 + 0.9 * EI);
        S.K = zi(S.K, S.M * EI, force || !MD ? 1 : 0.1);
        inner.style.width = `${W + (S.box.w - W) * EI}px`;
        inner.style.height = `${S.p + (S.box.h - S.p) * EI}px`;
        inner.style.transform = `translate3d(${Math.round(S.d)}px, ${S.K}px, 0)`;
        // Rounded panel: the 40px corners (20 on phone) flatten as the panel fully enters (.5~1) and round again as it shrinks · 1.2→1 scale
        round.style.borderRadius = `${(1 - eI(cA, 0.5, 1) * (1 - EI)) * (MD ? 40 : 20)}px`;
        round.style.transform = `scale(${1.2 - cA * 0.2})`;
        vtitle.style.opacity = 1 - eI(p.stay, 0, 0.3);
      },
      reduced() { wrap.style.transform = "none"; truck.style.display = "none"; },
    });
  })();

  // ───────── 3. Planning section (original homeScene02) — a mascot rises from the hole (oval video), the circle fills the screen → the circle shrinks to the ‹!› dot while three contents slide sideways ─────────
  (() => {
    const root = $(".plan");
    if (!root) return;
    const all = tracker($(".plan__area", root)), a1 = tracker($(".plan__a1", root)), a2 = tracker($(".plan__a2", root));
    const intro = $(".plan__intro", root), circle = $(".plan__circle", root), holeClip = $(".plan__hole", root), dino = $(".hole__blob", root);
    const video = $(".plan__circle .wf-video", root), vtitle = $(".plan__title", root), label = $(".plan__label", root), over = $(".plan__over", root);
    const track = $(".plan__track", root), wrapEl = $(".plan__wrap", root), dot = $(".answer__blob", root), desc = $(".answer__text .t-body", root);
    const chr1 = $(".answer__art", root), crowd = $(".rnd__crowd", root), cyc = $(".cycle__diagram", root);
    const pds = $$(".rnd .wf-img", root), photos = $$(".cycle__photos .wf-img", root);
    const S = { iA: 0, rI: 0, dot: null, eA: [0, 1], cA: [0, 1], ends: {} };
    const RA = 140 / 366, ZA = 370 / 250;
    const nI = marks(), gI = marks(), EI = marks(), oI = marks();
    let dotSet = false;
    nI.on(0.5, (d) => d < 0 && vid("lab")?.pause(0))
      .on(0.7, (d) => (holeClip.style.opacity = d > 0 ? 0 : 1))
      .on(0.8, (d) => light(d > 0))
      .on(1, (d) => d > 0 && vid("lab")?.play(0));
    gI.on(0, (d) => (d > 0 ? vid("s2small1")?.play(0) : vid("s2small1")?.pause(0)))
      .on(1, (d) => {
        if (d > 0) {
          vid("lab")?.pause(0); circle.style.display = "none"; holeClip.style.display = "none";
          gsap.fromTo(dot, { opacity: 0, rotate: 20, scale: 1 }, { opacity: 1, rotate: 0, scale: 1, ease: "elastic.out(0.8, 0.5)", duration: 0.9, transformOrigin: "50% 100%", overwrite: true });
        } else {
          vid("lab")?.play(); circle.style.display = "block"; holeClip.style.display = "block";
          gsap.to(dot, { opacity: 0, scale: 1, rotate: -20, duration: 0.2, ease: "power2.in", overwrite: true });
        }
      });
    oI.on(1, (d) => (d > 0 ? vid("s2small1")?.pause(0) : vid("s2small1")?.play(0)));
    EI.on(0, (d) => { wrapEl.style.visibility = d < 0 ? "hidden" : "visible"; label.style.visibility = d > 0 ? "hidden" : "visible"; })
      .on(0.8, (d) => crowd && (crowd.style.display = d < 0 ? "none" : "block"))
      .on(0.07, (d) => light(d < 0));
    // Original cateManagement fade — center circle 0→1 (power4.inOut) · arrow −45° · 1.1x → in place · step circles in the order [3,2,1,4] at .1 gaps with elastic(0.5, 1)
    const balls = $$(".cycle__ball", cyc), cards = $$(".cycle__cardin", cyc);
    const fade = gsap.timeline({ paused: true })
      .fromTo($(".cycle__core", cyc), { scale: 0 }, { scale: 1, ease: "power4.inOut" })
      // In the original the arrow plate (arrow) rotates on scroll and the image inside (arrow img) goes −45°·1.1× → in place — the copy also turns the svg on scroll, and the inner layer (g) turns separately with this entrance
      .fromTo($$(".cycle__arrows > g", cyc), { rotation: -45, scale: 1.1, svgOrigin: "260 260" }, { rotation: 0, scale: 1, svgOrigin: "260 260", ease: "power4.inOut" }, "-=0.3");
    [balls[2], balls[1], balls[0], balls[3]].forEach((b, i) => fade.fromTo(b, { scale: 0 }, { scale: 1, ease: "elastic.out(0.5, 1)" }, 0.2 + i * 0.1));
    // Original cateManagement update(T): 0~.15 the first circle grows, .2~1 is split in three and the ring turns 90° each (circle position power2.inOut · arrow power1.inOut).
    // Each circle sits at (−90° × index + start offset + rotated angle), and the closer it is to the start offset (wide screens 0° · phone 90°), the larger it is by 1 + (1 − angular distance/90°) × .5 (phone .35)
    const nodes = $$(".cycle__node", cyc);
    let front = -1;
    const cate = (T, MD) => {
      const d0 = MD ? 0 : 90, x = eI(T, 0, 0.15), Z = eI(T, 0.2, 1), z = Math.min(2, Math.floor(Z * 3)), iA = Z * 3 - z;
      const j = E.p1io(iA), nA = E.p2io(iA), lA = E.p1io(x);
      $(".cycle__arrows", cyc).style.rotate = `${(z + j) * 90 + d0}deg`;
      const R = cyc.offsetWidth * (1 - 139 / 466) * 0.5;
      let best = -1, bestK = 0;
      nodes.forEach((n, i) => {
        const ang = -90 * i + d0 + (z + nA) * 90, rad = (ang * Math.PI) / 180;
        const o = ((ang % 360) + 360) % 360, dd = Math.abs(o - d0), O = Math.min(dd, 360 - dd), k = Math.max(0, 1 - O / 90);
        n.style.transform = `translate(${Math.cos(rad) * R}px, ${Math.sin(rad) * R}px) scale(${1 + k * (MD ? 0.5 : 0.35) * (i === 0 ? lA : 1)})`;
        if (k > bestK) { bestK = k; best = i; }
      });
      cards.forEach((c, i) => (c.style.opacity = i === best ? (i === 0 ? x : 1) : 0));
      if (best !== front) {
        // Original cates-img: the photo of the earlier circle opens right away (inset 0), the photo of a later one closes downward
        photos.forEach((ph, i) => { if (i === best) ph.style.clipPath = "inset(0 0 0 0)"; else if (i > best) ph.style.clipPath = "inset(100% 0 0 0)"; });
        front = best;
      }
    };
    scene(root, {
      measure() {
        all.measure(); a1.measure(); a2.measure();
        S.eA = [(a1.top - all.top) / all.h, (a1.top - all.top + a1.h) / all.h];
        S.cA = [(a2.top - all.top) / all.h, (a2.top - all.top + a2.h) / all.h];
        S.ends = Object.fromEntries(a2.ends);
        const diag = Math.hypot(innerWidth, vh());
        S.iA = diag > 0 ? (dino.offsetWidth * ZA) / diag : 0;
        dotSet = false;
      },
      render() {
        const W = innerWidth, Hh = vh(), MD = W >= 768, Zw = W;
        const xA = all.ratio("T"), mA = eI(xA, S.eA[0], S.eA[1]), wI = eI(xA, S.cA[0], S.cA[1]);
        const H2 = a2.parts(wI);
        const uA = E.p1io(H2.in), rA = H2.move1, oA = H2.move2;
        const yA = eI(wI, (S.ends.move1 ?? 0) - 0.1, S.ends.content ?? 1);
        oI.update(rA);
        const kA = -(-Zw * 0.3 * (1 - uA) + E.p1io(rA) * Zw + E.p1io(oA) * Zw);
        if (MD) desc.style.transform = `translate3d(${60 - 60 * uA}px, 0, 0)`;
        gI.update(uA);
        const sA = E.p2o(eI(mA, 0, 0.2)), VA = E.backIO(eI(mA, 0, 0.3)), CI = E.p3io(eI(mA, 0.5, 1)), UI = E.p3io(eI(mA, 0.4, 0.8)), V = E.p3io(eI(mA, 0.4, 0.9)), HA = E.p2io(eI(mA, 0.5, 1));
        const BA = sA * S.iA + CI * (1 - S.iA), DA = RA + (1 - RA) * V;
        video.style.opacity = eI(mA, 0.5, 0.9);
        video.style.transform = `scale(${2 - HA})`;
        vtitle.style.opacity = eI(mA, 0.8, 1);
        if (over) over.style.opacity = eI(uA, 0.5, 1);
        let cx = 0.5, cy = 0.5, MI = BA, VIy = DA;
        const cw = circle.offsetWidth, ch = circle.offsetHeight;
        if (uA > 0 && dot) {
          // The circle shrinks to the spot and size of the ”!” dot (our lime circle) — the dot’s spot is measured once, before content shifts sideways
          if (!dotSet) { const r = dot.getBoundingClientRect(); S.dot = { x: r.left + r.width / 2 - kA, y: r.top + r.height / 2, w: r.width }; dotSet = true; }
          cx = zi(0.5, (S.dot.x + kA) / cw, uA); cy = zi(0.5, S.dot.y / ch, uA);
          const fx = Math.max(cx, 1 - cx) * cw, fy = Math.max(cy, 1 - cy) * ch;
          MI = zi(BA, S.dot.w / 2 / Math.hypot(fx, fy), uA); VIy = zi(DA, 1, uA);
        }
        // Original maskCircle: radius = Distance from center to the farthest corner × progress, flattened vertically by the ratio
        const px = cw * cx, py = ch * cy, far = Math.hypot(Math.max(px, cw - px), Math.max(py, ch - py)) * MI;
        circle.style.clipPath = `ellipse(${far}px ${far * VIy}px at ${px}px ${py}px)`;
        // Hole side (original mode hole): the top opens as a strip and the bottom is the same half-ellipse — the mascot shows only above the hole
        const hx = cw / 2, hy = ch / 2, hr = Math.hypot(hx, hy) * BA, hry = hr * DA;
        holeClip.style.clipPath = `path('M${hx - hr} 0 L${hx + hr} 0 L${hx + hr} ${hy} A${hr} ${hry} 0 0 1 ${hx - hr} ${hy} Z')`;
        intro.style.transform = `translate3d(0, ${30 - UI * 30}%, 0)`;
        const target = (1 - VA + V) * 100;
        S.rI = zi(S.rI, target, 0.2);
        dino.style.transform = `translate3d(0, ${S.rI + V * 100}%, 0)`;
        nI.update(mA);
        track.style.transform = `translate3d(${kA}px, 0, 0)`;
        cate(yA, MD);
        fade.progress(Math.max(0, Math.min(1, rA * 0.7 + 0.3)));
        if (chr1) chr1.style.opacity = uA;
        // The flag group appears at .8 of the second cell (on wide screens it goes transparent to visible at .8~.9) and walks out of the manufacturing section
        if (crowd) crowd.style.opacity = MD ? eI(wI, 0.8, 0.9) : "";
        cyc.style.transform = MD ? `translate3d(${-(0.06944 * Zw) * 1.5 * (1 - E.move(rA))}px, 0, 0)` : "";
        pds.forEach((el, i) => (el.style.translate = `${(i + 1) * 300 * (1 - E.move(oA))}px 0`));
        EI.update(wI);
      },
      reduced() { circle.style.display = "none"; holeClip.style.display = "none"; wrapEl.style.visibility = "visible"; cate(0, innerWidth >= 768); fade.progress(1); },
    });
  })();

  // ───────── 4. Manufacturing section (original homeScene03) — in the staying portion a diagonal (bl→tr) opens with sceneMove, and in the back half of the leaving portion 19 45° stripes thin out and clear ─────────
  (() => {
    const root = $(".chapter--diag");
    if (!root) return;
    const t = tracker($(".fn-area", root)), c = tracker($(".stats", root));
    const diag = $(".diag", root), video = $(".diag .wf-video", root), label = $(".chapter__label", root);
    const fly = $(".stats__fly", root);
    const N = marks(), J = marks(), U = marks();
    const crowd = $(".rnd__crowd");
    U.on(1, (d) => crowd && (crowd.style.display = d < 0 ? "block" : "none"));
    N.on(0, (d) => d < 0 && vid("diag")?.pause(0))
      .on(1, (d) => { if (d > 0) { vid("diag")?.play(0); label.style.display = "none"; } else label.style.display = "block"; light(d > 0); });
    J.on(1, (d) => { if (d > 0) { vid("diag")?.pause(0); light(false); } else { vid("diag")?.play(); light(true); } });
    const S = { fw: 0, fh: 0 };
    scene(root, {
      measure() { t.measure(); c.measure(); if (fly) { S.fw = fly.offsetWidth; S.fh = fly.offsetHeight; } },
      render() {
        const W = diag.offsetWidth, Hh = diag.offsetHeight;
        const p = t.parts(t.ratio("B"));
        const j = E.move(eI(p.stay, 0, 1)), nA = eI(p.out, 0.5, 1);
        if (p.out > 0) {
          // Original setStripes(1 − nA): 19 stripes, each the diagonal length ÷ 19 thick, thin out by thickness × progress (stagger 0)
          const s = 1 - nA, r = Math.hypot(W, Hh), Dd = r / 19, k = Dd * s + 1, cs = Math.SQRT1_2;
          let d = "";
          for (let i = 0; i < 19 && s > 0; i++) {
            const u = -r / 2 + Dd * (i + 0.5), x0 = W / 2 - (r * 1.5) / 2, y0 = Hh / 2 + u - k / 2;
            const P = (x, yy) => { const dx = x - W / 2, dy = yy - Hh / 2; return `${(W / 2 + dx * cs - dy * cs).toFixed(1)} ${(Hh / 2 + dx * cs + dy * cs).toFixed(1)}`; };
            d += `M${P(x0, y0)} L${P(x0 + r * 1.5, y0)} L${P(x0 + r * 1.5, y0 + k)} L${P(x0, y0 + k)} Z `;
          }
          diag.style.clipPath = d ? `path('${d}')` : "inset(50%)";
        } else {
          // Original setDiagonal(bl-tr): D = (Width + height) × progress — widens from the bottom-left corner into a triangle or trapezoid
          const D = (W + Hh) * j;
          let pts;
          if (D <= W && D <= Hh) pts = `0 ${Hh}, ${D} ${Hh}, 0 ${Hh - D}`;
          else if (D > W && D <= Hh) pts = `0 ${Hh}, ${W} ${Hh}, ${W} ${Hh - (D - W)}, 0 ${Hh - D}`;
          else if (D <= W && D > Hh) pts = `0 ${Hh}, ${D} ${Hh}, ${D - Hh} 0, 0 0`;
          else pts = `0 ${Hh}, ${W} ${Hh}, ${W} ${Hh - (D - W)}, ${D - Hh} 0, 0 0`;
          diag.style.clipPath = `polygon(${pts.split(", ").map((q) => q.split(" ").map((v) => `${v}px`).join(" ")).join(", ")})`;
        }
        video.style.transform = `scale(${1.5 - j * 0.5})`;
        J.update(nA);
        N.update(p.stay);
        // Original chr3: with the dwelling share sceneMove, wide screens go from in place → off to the right (screen width + group width × 1.2), phones enter from off left (−screen width) and exit off right
        if (crowd && t.ratio("B") > 0) {
          const W0 = innerWidth, lA = W0 + crowd.offsetWidth * 1.2, FA = E.move(eI(p.stay, 0, 1));
          crowd.style.transform = `translate(${innerWidth >= 768 ? lA * FA : -W0 + (W0 + lA) * FA}px, 0)`;
        }
        U.update(p.stay);
        // Three flies (original scene03-fly): during the .3~.6 share of the number section passing the screen, from top right → bottom left, .5→1x
        if (fly) {
          const lA = eI(c.ratio("T"), 0.3, 0.6), W0 = innerWidth, M = vh();
          const x = W0 * 1.5 + (-S.fw - W0 * 1.5) * lA, yy = -M + 2 * M * lA, sc = 0.5 + 0.5 * E.move(eI(lA, 0, 0.3));
          fly.style.transform = `translate3d(${x}px, ${yy}px, 0) scale(${sc})`;
        }
      },
      reduced() { diag.style.clipPath = "none"; },
    });
  })();

  // ───────── 5. Sales section (original homeScene04) — in part: stickers come down curled at x·y −.7rad from above (−25%, phone −15%) and unfurl (.1→1),
  // from .4~1 of progress, a 316px (phone 200) square grows with power2.inOut up to 1.5 times the screen’s long side, opening the video (appears at .1~.2). Video 1.2→1x ─────────
  (() => {
    const root = $(".fresh");
    if (!root) return;
    const t = tracker($(".fn-area", root));
    const sticker = makeSticker($(".fresh__sticker", root));
    const freshVid = $(".fresh .wf-video", root), over = $(".fresh__over", root);
    const S0 = marks(), C0 = marks(), w0 = marks();
    // Original section-content tracker (viewT): once its .5~1 portion exceeds .1 the header turns black, and at 1 the video stops
    const c = tracker($(".pb", root)), cover = $(".pb__cover", root);
    w0.on(0.1, (d) => light(d < 0)).on(1, (d) => (d > 0 ? vid("fresh")?.pause() : vid("fresh")?.play()));
    S0.on(0, (d) => d < 0 && vid("fresh")?.pause(0)).on(1, (d) => { if (d > 0) vid("fresh")?.play(); light(d > 0); });
    C0.on(1, (d) => sticker?.run(d < 0));
    scene(root, {
      measure() { t.measure(); c.measure(); },
      render() {
        const MD = innerWidth >= 768;
        const d = t.parts(t.ratio("T")).in;
        const iI = eI(c.ratio("T"), 0.5, 1);
        w0.update(iI);
        // Original mask-circle2 (invert-half): a white square minus the lower half circle, radius = Half the square’s diagonal × (1 − .2928 − power2.inOut(iI) × .2928 + 2/width), center up by 6/width
        if (cover) {
          const w = cover.offsetWidth, h = cover.offsetHeight, eA = 2 / innerWidth, k = 0.2928;
          const cx = w / 2, cy = h * (0.5 - eA * 3), r = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) * (1 - k - E.p2io(iI) * k + eA);
          // Original mode is invert-half — only half the circle (the lower half) is subtracted
          cover.style.clipPath = `path(evenodd, 'M0 0 H${w} V${h} H0 Z M${cx - r} ${cy} a${r} ${r} 0 1 0 ${r * 2} 0 Z')`;
        }
        const base = MD ? 316 : 200, T = Math.max(innerWidth, vh());
        const z = E.p2io(eI(d, 0.4, 1)), size = base + (T * 1.5 - base) * z, FA = eI(size, base, T);
        if (sticker) {
          sticker.set(E.p1io(eI(d, 0.1, 0.6)) * 0.9 + 0.1, zi(-0.7, 0, E.p1io(eI(d, 0, 0.6))));
          const k = MD ? 25 : 15;
          sticker.host.style.transform = `translate3d(0, ${-k + eI(d, 0, 0.35) * k}%, 0) scale(${size / base})`;
          sticker.run(t.ratio("T") > 0 && z < 1);
        }
        const ix = Math.max(0, (innerWidth - size) / 2), iy = Math.max(0, (vh() - size) / 2);
        freshVid.style.clipPath = `inset(${iy}px ${ix}px)`;
        freshVid.style.opacity = eI(z, 0.1, 0.2);
        if (over) { over.style.clipPath = freshVid.style.clipPath; over.style.opacity = eI(z, 0.1, 0.2) * (1 - eI(z, 0.35, 0.5)); }
        $(".fn-vid", freshVid).style.transform = `scale(${1.2 - FA * 0.2})`;
        S0.update(FA);
        C0.update(z);
      },
      reduced() { freshVid.style.opacity = 1; },
    });
  })();

  // ───────── 6. Footer section (original homeScene05) — a spear-tip mask (br→tl · curve .2) opens onto the spiral video · three texts · when the last video ends, five characters pop out ─────────
  (() => {
    const root = $(".spiral");
    if (!root) return;
    const t = tracker($(".fn-area", root));
    const maskEl = $(".spiral__mask", root), clip = $(".spiral__clip", root), fly = $(".spiral__fly", root);
    const t1 = $(".spiral__t1", root), t2 = $(".spiral__t2", root), tEnd = $(".end__text", root), v2 = $(".spiral__v2", root), cover = $(".spiral__cover", root);
    const foot = $(".fn-foot", root) || $("[data-slot='footer']", root);
    const chars = $$(".end-chrs > div", root);
    // Original maskSpear br-tl: endpoint p0 travels from bottom right to 1.8× past top left, the two sides (p1 · p3) open by a .01~1 share, and the side midpoints are pulled .2 toward the corner as a quadratic curve
    const spear = (v) => {
      const W = maskEl.offsetWidth, Hh = maskEl.offsetHeight, curve = 0.2, tt = Math.max(0, Math.min(1, v));
      const D = tt * 1.8, l = eI(tt, 0.01, 1);
      const p0 = [(1 - D) * W, (1 - D) * Hh], p1 = [W, (1 - l) * Hh], p2 = [W, Hh], p3 = [(1 - l) * W, Hh], an = [W, Hh];
      const T = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], X = [(p3[0] + p0[0]) / 2, (p3[1] + p0[1]) / 2];
      const c1 = [T[0] + (an[0] - T[0]) * curve, T[1] + (an[1] - T[1]) * curve], c2 = [X[0] + (an[0] - X[0]) * curve, X[1] + (an[1] - X[1]) * curve];
      const f = (q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`;
      clip.setAttribute("d", `M ${f(p0)} Q ${f(c1)} ${f(p1)} L ${f(p2)} L ${f(p3)} Q ${f(c2)} ${f(p0)} Z`);
    };
    // Original x.on: five characters gather from a 300px radius (first angle −50°) at 1.1× and transparent over .8s elastic(0.8, 1) (stagger × .01s), while the white panel and text color change over .8s power1.inOut
    let endTl = null;
    const buildEnd = () => {
      endTl?.kill();
      endTl = gsap.timeline({ paused: true });
      const m = (Math.PI / 180) * 50;
      [chars[1], chars[3], chars[4], chars[2], chars[0]].filter(Boolean).forEach((el, i, arr) => {
        const z = (Math.PI * 2 * i) / arr.length, dl = i * 0.01;
        endTl.fromTo(el, { x: Math.cos(z - m) * 300, y: Math.sin(z - m) * 300, scale: 1.1, opacity: 0 }, { x: 0, y: 0, scale: 1, duration: 0.8, delay: dl, ease: "elastic.out(0.8, 1)" }, 0);
        endTl.to(el, { opacity: 1, duration: 0.28, delay: dl, ease: "power2.inOut" }, 0);
      });
      endTl.fromTo(cover, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "power1.inOut" }, 0);
      endTl.fromTo(tEnd, { "--end-ink": 0 }, { "--end-ink": 1, duration: 0.8, ease: "power1.inOut" }, 0);
    };
    const on = () => { endTl?.timeScale(1).play(); light(false); foot?.classList.remove("is-light"); };
    const off = () => { light(true); foot?.classList.add("is-light"); endTl?.reverse(); };
    const v2el = $("video", v2);
    v2el?.addEventListener("ended", on);
    FN.cleanup(() => v2el?.removeEventListener("ended", on));
    const d0 = marks(), K = marks(), u = marks();
    d0.on(0, (d) => { if (d < 0) { vid("spiral")?.pause(0); light(false); } })
      .on(1, (d) => { if (d > 0) { vid("spiral")?.play(); light(true); } fly.style.opacity = d > 0 ? 0 : 1; });
    K.on(0, (d) => (d < 0 ? vid("end")?.pause(0) : vid("end")?.play(0)))
      .on(1, (d) => (d > 0 ? vid("spiral")?.pause(0) : vid("spiral")?.play(0)));
    u.on(0, (d) => d < 0 && off()).on(1, (d) => { if (d > 0) light(false); else { vid("end")?.play(); light(true); } });
    const S = { fw: 0, fh: 0 };
    scene(root, {
      measure() { t.measure(); S.fw = fly.offsetWidth; S.fh = fly.offsetHeight; buildEnd(); },
      render() {
        const W = innerWidth, Hh = vh();
        const p = t.parts(t.ratio("B"));
        const RA = eI(p.in, 0, 0.55);
        // Original chr-flying-02: from outside bottom right to top left, 1.5→1 scale
        fly.style.transform = `translate(${S.fw * 1.5 - (W + S.fw * 1.6) * RA}px, ${S.fh - (Hh + S.fh) * RA}px) scale(${1.5 - RA * 0.5})`;
        spear(eI(p.in, 0.1, 1));
        t1.style.opacity = eI(p.in, 0.7, 1) - eI(p.text1, 0.7, 1);
        t2.style.opacity = eI(p.text2, 0, 0.3) - eI(p.text3, 0, 0.3);
        const EI = eI(p.text3, 0.3, 1);
        tEnd.style.opacity = EI;
        v2.style.opacity = EI;
        u.update(p.out);
        d0.update(p.in);
        K.update(EI);
      },
      reduced() { spear(1); t1.style.opacity = 1; },
    });
  })();

  // ───────── Mount point: set the cell height → measure → draw on every scroll ─────────
  FN.scene(() => {
    const mm = gsap.matchMedia();
    mm.add({ wide: "(min-width: 768px)", motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
      const { wide, motion } = ctx.conditions;
      if (!motion) { scenes.forEach((s) => s.reduced?.()); return; }
      // When the loader clears, the Hero comes in — original topKv intro: text group x 50vw→0 2s power3.out (after .15s), characters −(character width×4)→0 1.5s power3.out (after .5s),
      // Speech bubble x −100px·transparent → in place with 1.5s elastic(0.5, 0.5) (after 1s)
      const slogan0 = $(".hero__slogan span"), chr0 = $(".hero__chr svg"), bub0 = $(".hero__typed")?.parentElement;
      if (slogan0 && wide) gsap.fromTo(slogan0, { x: innerWidth * 0.5 }, { x: 0, duration: 2, delay: 0.15, ease: "power3.out" });
      if (chr0) gsap.fromTo(chr0, { xPercent: -400 }, { xPercent: 0, duration: 1.5, delay: 0.5, ease: "power3.out" });
      if (bub0) gsap.fromTo(bub0, { x: -100, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1.5, delay: 1, ease: "elastic.out(0.5, 0.5)" });

      const sized = () => scenes.forEach((s) => s.size?.());
      // Like the original, draw the scene only when it is near the screen (a bit over half a screen above and below), and draw once more on the frame leaving range to leave it at the end state
      const measured = () => scenes.forEach((s) => {
        s.measure?.();
        const r = s.root.getBoundingClientRect();
        s.lo = r.top + scrollY - vh() * 1.5; s.hi = r.bottom + scrollY + vh() * 0.5;
        s.render(true);
      });
      ScrollTrigger.addEventListener("refreshInit", sized);
      ScrollTrigger.addEventListener("refresh", measured);
      sized();
      // Keeps drawing even after pausing, only for the 3 seconds in which the late-following values (progress .1 · bubble spring) and the hero entrance settle
      let lastY = -1, idle = 0;
      const tick = () => {
        const y = scrollY;
        idle = y === lastY ? idle + 1 : 0;
        lastY = y;
        if (idle > 180) return;
        scenes.forEach((s) => {
          const near = y >= s.lo && y <= s.hi;
          if (near || s.near) s.render(false);
          s.near = near;
        });
      };
      const st = ScrollTrigger.create({ start: 0, end: "max", onUpdate: () => { idle = 0; } });
      gsap.ticker.add(tick);

      // 3. Rings are drawn, then thick rings and dots follow spinning
      const arc = $(".statement__arc");
      if (arc) ScrollTrigger.create({
        trigger: ".statement", start: "top bottom", end: "bottom top", scrub: 1.2,
        onUpdate: (s) => {
          const p = s.progress;
          arc.setAttribute("stroke-dasharray", `${p} 1`);
          gsap.set(".statement__knob", { rotation: p * 360, svgOrigin: "220 220" });
          gsap.set(".statement__dot", { rotation: -p * 220 - 40, svgOrigin: "220 220" });
        },
      });
      // Photos flow at different speeds (original scrub 1.2 · yPercent pairs)
      [[".stats__p1", 30, -20], [".stats__p2", 15, -25]].forEach(([s, a, b]) => {
        gsap.fromTo(s, { yPercent: a }, { yPercent: b, ease: "none", scrollTrigger: { trigger: s, start: "top bottom", end: "bottom top", scrub: 1.2 } });
      });
      ScrollTrigger.refresh();
      return () => {
        ScrollTrigger.removeEventListener("refreshInit", sized);
        ScrollTrigger.removeEventListener("refresh", measured);
        gsap.ticker.remove(tick);
        st.kill();
      };
    });
  });
});
