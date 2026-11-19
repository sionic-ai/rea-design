// Home motion — carries over the original top.js phase structure as is. Invisible observer boxes in each section change the phase when they pass the screen center line:
// Hero [50vh+10px, 1200, 1200, 1200, 1200] · vegetables [1200, per vegetable max(panel overflow + 1200, 1200), 1200] · map [1200, 1200, 800, 1200].
// When the cell changes, the text group moves with CSS (.2s linear + .6/.8s expo) and the 3D vegetable moves with 1.2s expo.out. Text inside the vegetable panel stays with that vegetable’s cell
// After entering, from 600px it follows down by the overflow with .4s expo.out, and the cell indicator bar fills by the progress within the cell with .8s expo.out.
// Attached on each arrival via barba and detached on leaving — window.vPages.top(container) returns the detach function.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  window.vPages = window.vPages || {};
  window.vPages.top = (root) => {
  const $ = (q) => root.querySelector(q), $$ = (q) => [...root.querySelectorAll(q)];
  const off = [];
  const on = (t, type, fn, o) => { t.addEventListener(type, fn, o); off.push(() => t.removeEventListener(type, fn, o)); };
  $$("[data-star]").forEach((n) => n.insertAdjacentHTML("afterbegin", window.vIcon.star));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wideQ = () => innerWidth >= 768;
  const state = { mode: "lead", phase: 0, veg: -1 };
  let stage = null;
  const setMode = (mode, phase, veg = -1) => {
    if (state.mode === mode && state.phase === phase && state.veg === veg) return;
    Object.assign(state, { mode, phase, veg });
    stage?.place();
  };

  // ---------- Flickering-on title (original F) — each piece goes 0→1 with .1s linear 4~5 times, random delay of 0~.4s. The first piece does it once for .2s after .8s ----------
  const flash = (el, first) => {
    if (!el) return { play() {} };
    const parts = [];
    const walk = (n) => [...n.childNodes].forEach((c) => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) return frag.append(w);
          const word = document.createElement("span");
          word.className = "v-word";
          [...w].forEach((ch) => { const s = document.createElement("span"); s.className = "v-flash"; s.textContent = ch; word.append(s); parts.push(s); });
          frag.append(word);
        });
        c.replaceWith(frag);
      } else if (c.nodeType === 1 && !c.matches("svg")) walk(c);
      else if (c.nodeType === 1) { c.classList.add("v-flash"); parts.push(c); }
    });
    walk(el);
    parts.forEach((p, i) => {
      const lead = first && i === 0;
      p.style.animation = `v-flash ${lead ? 0.2 : 0.1}s linear calc(var(--v-flash-base, 0s) + ${lead ? 0.8 : Math.random() * 0.4}s) ${lead ? 1 : 4 + Math.floor(Math.random() * 2)} both paused`;
    });
    let timer = 0, played = false;
    return {
      play(delay = 0) {
        if (played) return;
        played = true;
        clearTimeout(timer);
        if (reduce) return parts.forEach((p) => (p.style.animation = "none"));
        timer = setTimeout(() => parts.forEach((p) => (p.style.animationPlayState = "running")), delay * 1000);
      },
    };
  };
  const leadTitle = flash($(".lead__title"), true);
  const vegsTitle = flash($(".vegs__head h2"));
  const mapTitle = flash($(".map__title"));

  // ---------- Sections and cells ----------
  const lead = $(".lead"), vegs = $(".vegs"), map = $(".map"), partners = $(".partners");
  const groups = $$(".lead [data-group]"), leadBars = $$(".lead__steps i");
  const panels = $$("[data-veg-panel]"), vegBars = $$(".vegs__steps i");
  const down = $(".lead__down");
  const fill = (bars, ratios) => bars.forEach((b, i) => gsap.to(b, { "--p": ratios(i), duration: reduce ? 0 : 0.8, ease: "expo.out", overwrite: true }));

  // Vegetable panel: how much the inner text overflows (original scrollHeight) and the bar handle size
  const vp = panels.map((p) => {
    const sc = p.querySelector("[data-veg-scroller]"), track = p.querySelector("[data-veg-track]");
    const bar = p.querySelector(".vpanel__bar"), knob = p.querySelector("[data-veg-bar]");
    const o = { p, sc, track, bar, knob, max: 0, travel: 0, r: { v: 0 } };
    o.measure = () => {
      const cs = getComputedStyle(sc);
      const n = sc.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom), r = track.offsetHeight;
      o.max = Math.max(0, r - n);
      knob.style.height = `${Math.min(1, n / Math.max(r, 1)) * 100}%`;
      o.travel = bar.offsetHeight * (1 - Math.min(1, n / Math.max(r, 1)));
      bar.dataset.active = o.max > 0;
      o.draw();
    };
    o.draw = () => { track.style.transform = `translateY(${-o.r.v * o.max}px)`; knob.style.transform = `translateY(${o.r.v * o.travel}px)`; };
    o.to = (v) => gsap.to(o.r, { v, duration: reduce ? 0 : 0.4, ease: "expo.out", overwrite: true, onUpdate: o.draw });
    return o;
  });

  // Observer box height (px) per section — original CSS default 1200, hero first cell 50dvh + 10px, map third 800
  const heights = {
    lead: () => [innerHeight * 0.5 + 10, 1200, 1200, 1200, 1200],
    vegs: () => [1200, ...vp.map((o) => Math.max(o.max + 600 * 2, 1200)), 1200],
    map: () => [1200, 1200, 800, 1200],
  };
  // Which box the center line is in at the current scroll, and the progress within that box
  const locate = (hs, st) => {
    const y = scrollY + innerHeight * 0.5 - st.start;
    let acc = 0;
    for (let i = 0; i < hs.length; i++) {
      if (y < acc + hs[i] || i === hs.length - 1) return { i, local: Math.max(0, y - acc), h: hs[i], y, acc };
      acc += hs[i];
    }
    return { i: 0, local: 0, h: hs[0], y, acc: 0 };
  };
  const total = (hs) => hs.reduce((a, b) => a + b, 0);
  const sts = {};

  const leadPhase = (ph) => {
    if (lead.dataset.phase === String(ph)) return;
    lead.dataset.phase = ph;
    groups.forEach((el, i) => el.classList.toggle("is-on", i + 1 === ph));
    lead.querySelector(".lead__steps").classList.toggle("is-on", ph > 0 && ph < 4);
    if (ph > 0 && !leadTitle.done) { leadTitle.done = true; leadTitle.play(0); down.style.setProperty("--d", "0s"); }
    window.vHeader("white");
    setMode("lead", ph);
  };
  const vegPhase = (ph) => {
    if (vegs.dataset.phase === String(ph)) return;
    vegs.dataset.phase = ph;
    panels.forEach((p, i) => p.classList.toggle("is-on", i + 1 === ph));
    vegs.querySelector(".vegs__steps").classList.toggle("is-on", ph >= 1 && ph <= panels.length);
    if (ph === 0) vegsTitle.play(0);
    window.vHeader(ph >= 1 && ph <= panels.length && wideQ() ? "blend" : "white");
    setMode(ph > panels.length ? "planet" : ph === 0 ? "head" : "veg", ph, ph >= 1 && ph <= panels.length ? ph - 1 : -1);
  };
  const mapPhase = (ph) => {
    if (map.dataset.phase === String(ph)) return;
    map.dataset.phase = ph;
    // Original: coming down from the Vegetable section, it waits 4s while the dot planet turns into a map, otherwise it lights up with a flicker after .4s (flickers only the first time, afterwards the whole section shows through in .2s)
    if (ph === 0) mapTitle.play(state.mode === "planet" || state.mode === "veg" ? 4 : 0.4);
    window.vHeader(ph === 0 ? "white" : "black");
    setMode("map", ph);
    mapApi.phase(ph);
  };

  const mm = gsap.matchMedia();
  const startPins = () => mm.add({ wide: "(min-width: 768px)", narrow: "(max-width: 767px)" }, (ctx) => {
    const pin = (key, el, onUpdate, extra = {}) => {
      sts[key] = ScrollTrigger.create({
        trigger: el, pin: el.querySelector("[data-pin]"), start: "top top", end: () => "+=" + total(heights[key]()),
        invalidateOnRefresh: true, onUpdate: (st) => onUpdate(locate(heights[key](), st)), ...extra,
      });
    };
    pin("lead", lead, ({ i, local, h }) => {
      leadPhase(i);
      fill(leadBars, (k) => (k + 1 < i ? 1 : k + 1 === i ? Math.min(1, local / h) : 0));
    }, { onEnterBack: () => setMode("lead", Number(lead.dataset.phase || 0)) });
    pin("vegs", vegs, ({ i, local }) => {
      vegPhase(i);
      vp.forEach((o, k) => {
        if (k + 1 !== i) return;
        const hs = heights.vegs()[i];
        o.to(Math.min(1, Math.max(0, Math.min(local, hs) - 600) / Math.max(o.max, 1)));
      });
      fill(vegBars, (k) => (k + 1 < i ? 1 : k + 1 === i ? Math.min(1, local / heights.vegs()[i]) : 0));
    });
    if (ctx.conditions.wide) {
      pin("map", map, ({ i }) => mapPhase(i), { onLeave: () => setMode("away", 0), onEnterBack: () => setMode("map", Number(map.dataset.phase || 0)) });
    } else {
      sts.map = ScrollTrigger.create({
        trigger: map.querySelector(".map__body"), start: "top 60%", end: "bottom top",
        onUpdate: (s) => mapPhase(Math.min(Math.floor(s.progress * 4) + 1, 3)),
        onLeave: () => setMode("away", 0),
      });
    }
    sts.partners = ScrollTrigger.create({ trigger: partners, start: "top center", end: "bottom top", onToggle: (s) => s.isActive && window.vHeader("black"), onLeaveBack: () => mapPhase(3) });
    return () => Object.keys(sts).forEach((k) => delete sts[k]);
  });
  const remeasure = () => { vp.forEach((o) => o.measure()); ScrollTrigger.refresh(); };
  const ro = new ResizeObserver(() => vp.forEach((o) => o.measure()));
  vp.forEach((o) => ro.observe(o.track));
  vp.forEach((o) => o.measure());
  document.fonts?.ready.then(remeasure);

  // Jump straight to that cell by the #name in the address (when arriving from another page)
  window.vJump = (hash) => {
    const m = /^#veg-(\d)$/.exec(hash);
    if (m && sts.vegs) {
      const hs = heights.vegs();
      return scrollTo(0, sts.vegs.start + total(hs.slice(0, Number(m[1]) + 1)) - innerHeight * 0.5 + 1);
    }
    const el = root.querySelector(hash);
    if (el) scrollTo(0, el.getBoundingClientRect().top + scrollY);
  };

  // On first open: 3s after loading clears the title flickers on, and the scroll hint appears at 3.4s (immediately if already scrolled down)
  down.style.setProperty("--d", "3.4s");
  window.vStarted.then(() => {
    down.dataset.on = "true";
    if (!leadTitle.done) { leadTitle.done = true; leadTitle.play(scrollY > 10 ? 0 : 3); }
  });

  // ---------- Video panel (original video-modal) — pressing the video button on the product panel opens it in .1s, and it closes via close button · backdrop · Esc ----------
  const vmodal = $("[data-vmodal]");
  $$(".vpanel__video").forEach((b) => on(b, "click", () => { vmodal.dataset.open = "true"; vmodal.removeAttribute("inert"); setTimeout(() => vmodal.focus(), 200); }));
  const vclose = () => { vmodal.dataset.open = "false"; vmodal.setAttribute("inert", ""); };
  vmodal.querySelectorAll("[data-vmodal-close]").forEach((b) => on(b, "click", vclose));
  on(window, "keydown", (e) => e.key === "Escape" && vclose());

  // Partner About panel
  const modal = $("[data-pmodal]");
  $$("[data-partner]").forEach((b) => on(b, "click", () => {
    modal.querySelector("[data-pmodal-role]").textContent = b.querySelector(".pcard__role").textContent;
    modal.querySelector("[data-pmodal-name]").textContent = b.querySelector(".pcard__name").textContent;
    modal.classList.add("is-open");
  }));
  $$("[data-pmodal-close]").forEach((b) => on(b, "click", () => modal.classList.remove("is-open")));

  // ---------- Fitted map ----------
  // The line map is several long curved islands from a seed random. The first cell hides small at .6×, then on the second cell goes to 1× in 1.2s expo.out and becomes visible at .4s,
  // The third cell is a scanning line (scan), the fourth holds an info panel and zooms 10x to the chosen vegetable’s position over 1.8s cubic.inOut, then disappears at 2s over .2s,
  // That land’s cell map (a color per value) comes in. Hover a cell to show its value, latitude and longitude in the info panel.
  const mapApi = (() => {
    let seed = 142;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
    const g = $("[data-map-lines]"), svg = $("[data-map-svg]"), wrap = $("[data-map-zoom]");
    const blob = (cx, cy, rx, ry, rot, n) => {
      const pts = [];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2, k = 1 + Math.sin(a * 3 + cx) * 0.12 + Math.sin(a * 7 + cy) * 0.05 + (rnd() - 0.5) * 0.04;
        const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k;
        pts.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
      }
      return "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join("L") + "Z";
    };
    const islands = [[440, 110, 70, 40, -0.5], [360, 230, 150, 46, -0.75], [235, 360, 120, 40, -0.35], [150, 420, 50, 30, 0.4], [110, 500, 46, 40, 0.1]];
    let html = "";
    islands.forEach(([cx, cy, rx, ry, rot]) => {
      html += `<path d="${blob(cx, cy, rx, ry, rot, 90)}"/>`;
      for (let k = 0; k < 6; k++) {
        const t = rnd() * 2 - 1, x1 = cx + t * rx * 0.8 * Math.cos(rot), y1 = cy + t * rx * 0.8 * Math.sin(rot);
        html += `<path class="is-pref" d="M${(x1 - ry * Math.sin(rot)).toFixed(1)} ${(y1 + ry * Math.cos(rot)).toFixed(1)}Q${(x1 + (rnd() - 0.5) * 30).toFixed(1)} ${(y1 + (rnd() - 0.5) * 30).toFixed(1)} ${(x1 + ry * Math.sin(rot)).toFixed(1)} ${(y1 - ry * Math.cos(rot)).toFixed(1)}"/>`;
      }
    });
    for (let i = 0; i < 18; i++) html += `<path d="${blob(80 + rnd() * 460, 60 + rnd() * 500, 4 + rnd() * 8, 3 + rnd() * 5, rnd() * 3, 14)}"/>`;
    g.innerHTML = html;

    // Each vegetable’s position (line map coordinates 0~1) and land name
    const pins = [[0.62, 0.36, "Your region name one here"], [0.47, 0.52, "Your region name two here"], [0.71, 0.21, "Your region name three here"], [0.38, 0.6, "Your region name four here"], [0.25, 0.7, "Your region name five here"]];
    const pinEl = $("[data-map-pin]");
    const z = { x: 0.5, y: 0.5, s: 0.6, o: 0 };
    const draw = () => {
      wrap.style.transform = `scale(${z.s})`;
      wrap.style.transformOrigin = `${z.x * 100}% ${z.y * 100}%`;
      wrap.style.opacity = z.o;
    };
    draw();
    let fadeTimer = 0;
    const show = (ph) => { clearTimeout(fadeTimer); gsap.to(z, { o: 1, duration: reduce ? 0 : 0.4, ease: "none", overwrite: "auto", onUpdate: draw }); gsap.to(z, { s: 1, x: 0.5, y: 0.5, duration: reduce ? 0 : 1.2, ease: "expo.out", overwrite: "auto", onUpdate: draw }); };
    const hide = (back) => { clearTimeout(fadeTimer); gsap.to(z, { o: 0, duration: reduce ? 0 : 0.4, ease: "none", overwrite: "auto", onUpdate: draw }); if (back) gsap.to(z, { s: 0.6, duration: reduce ? 0 : 1.2, ease: "expo.out", overwrite: "auto", onUpdate: draw }); };

    // The tile map of that land — values are a smooth field made from seeded random numbers (different per vegetable/data)
    const grid = $("[data-map-grid]"), N = 34;
    const types = ["score", "sun", "rain", "temp"];
    let veg = 0, type = "score", cells = [];
    const field = (x, y, k) => {
      const f = (a, b, c) => Math.sin(x * a + k * 1.7) * Math.cos(y * b - k) * c;
      return Math.max(0, Math.min(1, 0.5 + f(0.31, 0.27, 0.3) + f(0.83, 0.71, 0.15) + f(1.9, 1.6, 0.06)));
    };
    const land = (x, y, k) => Math.hypot((x - N / 2) / (N * 0.42), (y - N / 2) / (N * 0.36)) + Math.sin(x * 0.5 + k) * 0.08 + Math.cos(y * 0.6 - k) * 0.08 < 1;
    const paint = () => {
      const k = veg * 3 + types.indexOf(type);
      const [px, py] = pins[veg];
      cells = [];
      let h = "";
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        if (!land(x, y, veg)) continue;
        const v = field(x, y, k), i = cells.length;
        const lv = type === "score" ? (v > 0.68 ? "a" : v > 0.5 ? "b" : v > 0.32 ? "c" : "d") : "";
        cells.push({ v, x, y, lat: (45 - (py + (y - N / 2) / N / 10) * 20).toFixed(4), lng: (128 + (px + (x - N / 2) / N / 10) * 18).toFixed(4), lv });
        h += `<rect x="${x}" y="${y}" width=".9" height=".9" data-i="${i}" ${lv ? `class="is-${lv}"` : `style="opacity:${(0.15 + v * 0.85).toFixed(2)}"`}/>`;
      }
      grid.innerHTML = h;
      reset();
    };
    const dp = $$("[data-dp]"), place = $("[data-map-place]"), vname = $("[data-map-vname]"), vbtns = $$("[data-map-veg]");
    const reset = () => dp.forEach((d) => d.querySelectorAll("[data-v], [data-lat], [data-lng]").forEach((n) => (n.textContent = "-")));
    const setType = (t) => {
      type = t;
      map.dataset.type = t;
      dp.forEach((d) => { const open = d.dataset.dp === t; d.dataset.open = open; d.querySelector("button").setAttribute("aria-expanded", open); });
      const lg = $("[data-map-legend]");
      lg.disabled = t !== "score";
      if (lg.disabled) { map.dataset.legend = "false"; lg.setAttribute("aria-expanded", "false"); }
      paint();
    };
    const pick = (i, now) => {
      veg = i;
      vbtns.forEach((b, k) => (b.dataset.current = k === i));
      vname.textContent = vbtns[i].dataset.name;
      place.textContent = pins[i][2];
      const [x, y] = pins[i];
      pinEl.setAttribute("cx", x * 600); pinEl.setAttribute("cy", y * 600);
      map.dataset.grid = "false";
      clearTimeout(fadeTimer);
      gsap.to(z, { o: 1, duration: now || reduce ? 0 : 0.2, ease: "none", overwrite: "auto", onUpdate: draw });
      gsap.to(z, { x, y, s: 10, duration: now || reduce ? 0 : 1.8, ease: "cubic.inOut", overwrite: "auto", onUpdate: draw });
      fadeTimer = setTimeout(() => {
        gsap.to(z, { o: 0, duration: reduce ? 0 : 0.2, ease: "none", overwrite: "auto", onUpdate: draw, onComplete: () => { Object.assign(z, { x: 0.5, y: 0.5, s: 1 }); draw(); } });
        paint();
        map.dataset.grid = "true";
      }, now || reduce ? 1 : 2000);
    };
    dp.forEach((d) => on(d.querySelector("button"), "click", () => setType(d.dataset.dp)));
    vbtns.forEach((b, i) => on(b, "click", () => i !== veg && pick(i)));
    on($("[data-map-layer]"), "click", (e) => { const v = map.dataset.layer !== "true"; map.dataset.layer = v; e.currentTarget.setAttribute("aria-pressed", v); });
    on($("[data-map-legend]"), "click", (e) => { const v = map.dataset.legend !== "true"; map.dataset.legend = v; e.currentTarget.setAttribute("aria-expanded", v); e.currentTarget.setAttribute("aria-label", v ? "Close legend" : "Open legend"); });
    on(grid, "pointermove", (e) => {
      const r = e.target.closest("rect");
      if (!r || map.dataset.grid !== "true") return;
      grid.querySelector(".is-hover")?.classList.remove("is-hover");
      r.classList.add("is-hover");
      const c = cells[r.dataset.i], d = dp.find((n) => n.dataset.dp === type);
      d.querySelector("[data-v]").textContent = type === "score" ? c.lv.toUpperCase() : (type === "sun" ? (8 + c.v * 8).toFixed(1) : type === "rain" ? Math.round(800 + c.v * 1800) : (10 + c.v * 12).toFixed(1));
      d.querySelector("[data-lat]").textContent = c.lat;
      d.querySelector("[data-lng]").textContent = c.lng;
    });
    setType("score");
    return {
      phase(ph) {
        map.dataset.scan = ph === 2 ? "run" : "";
        map.dataset.grid = "false";
        if (ph === 0) hide(true);
        else if (ph < 3) show(ph);
        else pick(veg, false);
      },
    };
  })();

  // ---------- 3D stage ----------
  const T = window.THREE;
  const canvas = $("[data-stage]");
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(35, 1, 0.1, 200);
  camera.position.set(0, 0, 14);
  scene.add(new T.AmbientLight(new T.Color(window.vColor("--site-on-space")), 0.55));
  const key = new T.DirectionalLight(new T.Color(window.vColor("--site-on-space")), 2.4);
  key.position.set(-5, 6, 6);
  scene.add(key);
  const rim = new T.DirectionalLight(new T.Color(window.vColor("--kf-accent")), 0.9);
  rim.position.set(6, -2, -3);
  scene.add(rim);

  const C = { red: 0x8f1630, root: 0xd9b8b8, leaf: 0x3d6b2c, stem: 0x9fb06a, pumpkin: 0xb5663d, eggplant: 0x3e1b45, cap: 0x55693a, myoga: 0xc77a8a, white: 0xe8e0d2, purple: 0x7b3f8c }; // Not skin: a vegetable’s own color, so it stays the same when the skin changes
  const mat = (c, r = 0.55) => new T.MeshStandardMaterial({ color: c, roughness: r, metalness: 0.02 });
  const leaf = (len, w) => {
    const m = new T.Mesh(new T.SphereGeometry(1, 16, 12), mat(C.leaf, 0.8));
    m.scale.set(w, len, 0.04);
    return m;
  };
  const leaves = (g, n, y, len, spread) => {
    for (let i = 0; i < n; i++) {
      const pivot = new T.Group();
      const l = leaf(len, len * 0.38);
      l.position.y = len;
      const stem = new T.Mesh(new T.CylinderGeometry(0.03, 0.04, len * 1.1, 6), mat(C.stem));
      stem.position.y = len * 0.45;
      pivot.add(stem, l);
      pivot.position.y = y;
      pivot.rotation.set((Math.random() - 0.5) * spread, (i / n) * Math.PI * 2, (Math.random() - 0.3) * spread);
      g.add(pivot);
    }
  };
  const build = [
    () => { // Red turnip
      const g = new T.Group();
      const b = new T.Mesh(new T.SphereGeometry(1, 40, 30), mat(C.red, 0.45)); b.scale.set(1, 0.92, 1); g.add(b);
      const r = new T.Mesh(new T.ConeGeometry(0.16, 1.1, 10), mat(C.root)); r.position.y = -1.3; r.rotation.x = Math.PI; g.add(r);
      leaves(g, 6, 0.7, 1.5, 0.9); return g;
    },
    () => { // Ribbed pumpkin
      const geo = new T.SphereGeometry(1.2, 64, 32), p = geo.attributes.position, v = new T.Vector3();
      for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const a = Math.atan2(v.z, v.x); const k = 1 + 0.07 * Math.cos(a * 10); p.setXYZ(i, v.x * k, v.y * 0.68, v.z * k); }
      geo.computeVertexNormals();
      const g = new T.Group(); g.add(new T.Mesh(geo, mat(C.pumpkin, 0.7)));
      const s = new T.Mesh(new T.CylinderGeometry(0.1, 0.16, 0.45, 8), mat(C.stem, 0.9)); s.position.y = 0.9; s.rotation.z = 0.3; g.add(s); return g;
    },
    () => { // Branch
      const g = new T.Group();
      const b = new T.Mesh(new T.CapsuleGeometry(0.42, 1.9, 12, 24), mat(C.eggplant, 0.25)); b.scale.set(1, 1, 0.92); g.add(b);
      const c = new T.Mesh(new T.ConeGeometry(0.42, 0.5, 6), mat(C.cap, 0.8)); c.position.y = 1.35; g.add(c);
      const s = new T.Mesh(new T.CylinderGeometry(0.06, 0.08, 0.5, 6), mat(C.cap)); s.position.y = 1.75; g.add(s);
      g.rotation.z = 0.5; return g;
    },
    () => { // Myoga ginger (pink shoot bunch)
      const g = new T.Group();
      for (let i = 0; i < 5; i++) { const c = new T.Mesh(new T.ConeGeometry(0.22, 1.1, 10), mat(i % 2 ? C.myoga : C.cap, 0.6)); c.position.set(Math.cos(i * 1.3) * 0.16, 0, Math.sin(i * 1.3) * 0.16); c.rotation.set(Math.cos(i) * 0.18, 0, Math.sin(i) * 0.18); g.add(c); }
      return g;
    },
    () => { // Elongated white turnip
      const g = new T.Group();
      const b = new T.Mesh(new T.CapsuleGeometry(0.34, 1.4, 10, 20), mat(C.white, 0.5)); g.add(b);
      const top = new T.Mesh(new T.SphereGeometry(0.36, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), mat(C.purple, 0.5)); top.position.y = 0.72; g.add(top);
      leaves(g, 5, 0.9, 1.8, 0.5); return g;
    },
  ];
  const vegsG = build.map((f) => { const g = f(); scene.add(g); return g; });

  // ---------- Hero cursor hole (mouse hover of the original keyVisual scene) ----------
  // When the cursor touches a vegetable, the area around the touched spot is punched through with a noisy edge (radius ±30%), the inner face looks almost black (color ×.02), and the surface around it
  // Turns into dots and scatters to one side. Original values: hole strength 0 → 1 .8s cubic.out, .4s after contact 1 → 0 1.6s cubic.inOut / dot strength 1s cubic.out,
  // The dot holds 1.8s and vanishes in .6s cubic.inOut, then stays put — once lit it won’t light again for 2.8s, and only the hole position follows where it is touched.
  // Dot outline is 1.07× the hole (visible in place ±45%) and 1.29× (scatter ±45%, each grain starts up to .28 late). The original hole .07 (world) is
  // On a 1440 screen the vegetable radius is about 37px, so on the copy stage (camera z14·fov35 → 102px/unit at z0) it is .42 units. Scatter uses screen speeds measured from recordings
  // (about 160px/s, a narrow stream toward the bottom right — each particle’s direction scatters by .35) was moved.
  const HOLE = { r: 0.42, see: 1.07, fly: 1.29, speed: 1.6, spread: 0.35, size: 0.021, dir: new T.Vector3(0.45, -0.85, 0.15).normalize() };
  const fr = (v) => v - Math.floor(v);
  const hash3 = (x, y, z) => { x = fr(x * 0.3183099 + 0.1) * 17; y = fr(y * 0.3183099 + 0.1) * 17; z = fr(z * 0.3183099 + 0.1) * 17; return fr(x * y * z * (x + y + z)); };
  const noise3 = (x, y, z) => {
    const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
    const s = (t) => t * t * (3 - 2 * t), fx = s(x - ix), fy = s(y - iy), fz = s(z - iz), L = (a, b, t) => a + (b - a) * t;
    const c = (a, b, d) => hash3(ix + a, iy + b, iz + d);
    return L(L(L(c(0, 0, 0), c(1, 0, 0), fx), L(c(0, 1, 0), c(1, 1, 0), fx), fy), L(L(c(0, 0, 1), c(1, 0, 1), fx), L(c(0, 1, 1), c(1, 1, 1), fx), fy), fz);
  };
  const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const cubicInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const HOLE_HEAD = `uniform vec3 uHolePos; uniform float uHoleR; uniform float uHoleK; uniform float uHoleT; varying vec3 vHoleW;
float holeHash(vec3 p) { p = fract(p * 0.3183099 + 0.1) * 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float holeNoise(vec3 x) {
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(holeHash(i), holeHash(i + vec3(1, 0, 0)), f.x), mix(holeHash(i + vec3(0, 1, 0)), holeHash(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(holeHash(i + vec3(0, 0, 1)), holeHash(i + vec3(1, 0, 1)), f.x), mix(holeHash(i + vec3(0, 1, 1)), holeHash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
`;
  // When there are no holes, the back face is discarded so it matches the original (front only) drawing
  const HOLE_CUT = `#include <clipping_planes_fragment>
if (uHoleK <= 0.0) { if (!gl_FrontFacing) discard; }
else {
  float hn = holeNoise(vHoleW * (2.1 / uHoleR) + uHoleT * 0.4) * 2.0 - 1.0;
  float hr = uHoleR * (1.0 + hn * 0.3) * uHoleK;
  if (1.0 - (1.0 - smoothstep(hr, hr + uHoleR * 0.15, length(vHoleW - uHolePos))) * uHoleK < 0.5) discard;
}`;
  const DOT_VS = `attribute float aA; attribute vec3 aC; attribute vec2 aF;
uniform float uT; uniform float uSize; uniform float uPx; uniform float uOp;
varying float vA; varying vec3 vC;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  mv.z += uSize * 3.0 * aA;
  gl_Position = projectionMatrix * mv;
  vA = aA * uOp * (0.6 + 0.4 * sin(uT * aF.y + aF.x));
  vC = aC;
  gl_PointSize = max(uSize * uPx / -mv.z * aA * (0.9 + 0.2 * sin(uT * 0.7 + aF.x * 3.0)), 1.0);
}`;
  const DOT_FS = `varying float vA; varying vec3 vC;
void main() {
  vec2 d = gl_PointCoord - 0.5;
  if (dot(d, d) > 0.25 || vA < 0.003) discard;
  gl_FragColor = vec4(vC, vA);
  #include <colorspace_fragment>
}`;
  const DOT_CAP = 8000;
  const dotU = { uT: { value: 0 }, uSize: { value: HOLE.size }, uPx: { value: 1 } };
  const ray = new T.Raycaster(), ptr = new T.Vector2(9, 9), ptrPrev = new T.Vector2(9, 9), tq = new T.Quaternion();
  const hov = vegsG.map((g) => {
    const u = { uHolePos: { value: new T.Vector3(1e4, 1e4, 1e4) }, uHoleR: { value: HOLE.r }, uHoleK: { value: 0 }, uHoleT: { value: Math.random() * 100 } };
    g.updateMatrixWorld(true);
    const inv = g.matrixWorld.clone().invert(), tris = [];
    let sum = 0;
    g.traverse((m) => {
      if (!m.isMesh) return;
      const mt = m.material;
      mt.side = T.DoubleSide;
      mt.onBeforeCompile = (sh) => {
        Object.assign(sh.uniforms, u);
        sh.vertexShader = "varying vec3 vHoleW;\n" + sh.vertexShader.replace("#include <project_vertex>", "#include <project_vertex>\nvHoleW = (modelMatrix * vec4(transformed, 1.0)).xyz;");
        sh.fragmentShader = HOLE_HEAD + sh.fragmentShader.replace("#include <clipping_planes_fragment>", HOLE_CUT)
          .replace("#include <opaque_fragment>", "#include <opaque_fragment>\nif (!gl_FrontFacing) gl_FragColor.rgb = diffuseColor.rgb * 0.02;");
      };
      mt.customProgramCacheKey = () => "veg-hole";
      const pos = m.geometry.attributes.position, idx = m.geometry.index, mm = new T.Matrix4().multiplyMatrices(inv, m.matrixWorld);
      const n = idx ? idx.count : pos.count;
      for (let k = 0; k + 2 < n; k += 3) {
        const v = [0, 1, 2].map((j) => new T.Vector3().fromBufferAttribute(pos, idx ? idx.getX(k + j) : k + j).applyMatrix4(mm));
        const area = new T.Vector3().subVectors(v[1], v[0]).cross(new T.Vector3().subVectors(v[2], v[0])).length() / 2;
        if (area > 1e-7) { sum += area; tris.push({ sum, v, c: mt.color }); }
      }
    });
    // Surface dots — spread evenly in proportion to area (so each hole holds about 300, matching the original point-cloud density)
    const N = Math.round(Math.min(40000, Math.max(3000, sum * 1300)));
    const base = new Float32Array(N * 3), ru = new Float32Array(N * 3), rnd = new Float32Array(N * 4), nz = new Float32Array(N), col = new Float32Array(N * 3), off = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const t = Math.random() * sum;
      let lo = 0, hi = tris.length - 1;
      while (lo < hi) { const mid = (lo + hi) >> 1; if (tris[mid].sum < t) lo = mid + 1; else hi = mid; }
      const { v, c } = tris[lo];
      let a = Math.random(), b = Math.random();
      if (a + b > 1) { a = 1 - a; b = 1 - b; }
      for (let j = 0; j < 3; j++) base[i * 3 + j] = v[0].getComponent(j) + (v[1].getComponent(j) - v[0].getComponent(j)) * a + (v[2].getComponent(j) - v[0].getComponent(j)) * b;
      const th = Math.random() * Math.PI * 2, z = Math.random() * 2 - 1, q = Math.sqrt(1 - z * z);
      ru[i * 3] = q * Math.cos(th); ru[i * 3 + 1] = q * Math.sin(th); ru[i * 3 + 2] = z;
      rnd[i * 4] = Math.random(); rnd[i * 4 + 1] = Math.random(); rnd[i * 4 + 2] = Math.random() * Math.PI * 2; rnd[i * 4 + 3] = 1 + Math.random() * 2;
      nz[i] = noise3(base[i * 3] * 6, base[i * 3 + 1] * 6, base[i * 3 + 2] * 6) * 2 - 1;
      const k = 0.85 + Math.random() * 0.3;
      col[i * 3] = c.r * k; col[i * 3 + 1] = c.g * k; col[i * 3 + 2] = c.b * k;
    }
    const geo = new T.BufferGeometry();
    const attr = (name, n) => { const a = new T.BufferAttribute(new Float32Array(DOT_CAP * n), n); a.setUsage(T.DynamicDrawUsage); geo.setAttribute(name, a); return a.array; };
    const aP = attr("position", 3), aC = attr("aC", 3), aA = attr("aA", 1), aF = attr("aF", 2);
    const op = { uOp: { value: 1 } };
    const dots = new T.Points(geo, new T.ShaderMaterial({ uniforms: { ...dotU, ...op }, vertexShader: DOT_VS, fragmentShader: DOT_FS, transparent: true, depthWrite: false }));
    dots.frustumCulled = false;
    dots.raycast = () => {};
    geo.setDrawRange(0, 0);
    g.add(dots);
    const fade = { k: 0 }, loc = new T.Vector3(1e4, 1e4, 1e4), dirL = new T.Vector3();
    let busy = false, timer = 0;
    const h = {
      u, op, fade, loc,
      get busy() { return busy; },
      start() {
        busy = true;
        dirL.copy(HOLE.dir).applyQuaternion(g.getWorldQuaternion(tq).invert());
        gsap.killTweensOf(op.uOp);
        op.uOp.value = 1;
        gsap.to(u.uHoleK, { value: 1, duration: 0.8, ease: "power2.out", overwrite: true });
        gsap.to(fade, { k: 1, duration: 1, ease: "power2.out", overwrite: true });
        timer = setTimeout(() => {
          gsap.to(u.uHoleK, { value: 0, duration: 1.6, ease: "power2.inOut", overwrite: true });
          gsap.to(op.uOp, { value: 0, delay: 1.8, duration: 0.6, ease: "power2.inOut", overwrite: true, onComplete: h.stop });
        }, 400);
      },
      stop() {
        clearTimeout(timer);
        gsap.killTweensOf([u.uHoleK, fade, op.uOp]);
        u.uHoleK.value = 0; fade.k = 0; op.uOp.value = 1;
        off.fill(0);
        geo.setDrawRange(0, 0);
        busy = false;
      },
      step(dt) {
        u.uHoleT.value += dt;
        const s = g.scale.x || 1, Rl = HOLE.r / s, see = Rl * HOLE.see, fly = Rl * HOLE.fly, sp = HOLE.speed / s;
        let n = 0;
        for (let i = 0; i < N; i++) {
          const i3 = i * 3, bx = base[i3], by = base[i3 + 1], bz = base[i3 + 2];
          const d0 = Math.hypot(bx - loc.x, by - loc.y, bz - loc.z);
          const fr0 = fly * (1 + nz[i] * 0.45);
          const mF = (1 - sstep(fr0, fr0 + fly * 0.15, d0)) * fade.k;
          const e = cubicInOut(Math.min(1, Math.max(0, (mF - rnd[i * 4] * 0.28) / 0.72)));
          if (e <= 0) { off[i3] = off[i3 + 1] = off[i3 + 2] = 0; }
          else {
            let dx = dirL.x + ru[i3] * HOLE.spread, dy = dirL.y + ru[i3 + 1] * HOLE.spread, dz = dirL.z + ru[i3 + 2] * HOLE.spread;
            const l = Math.hypot(dx, dy, dz) || 1, v = (sp * (0.6 + 0.8 * rnd[i * 4 + 1]) * dt) / l;
            off[i3] = (off[i3] + dx * v) * e; off[i3 + 1] = (off[i3 + 1] + dy * v) * e; off[i3 + 2] = (off[i3 + 2] + dz * v) * e;
          }
          const px = bx + off[i3], py = by + off[i3 + 1], pz = bz + off[i3 + 2];
          const sr = see * (1 + nz[i] * 0.45) * fade.k;
          const mS = (1 - sstep(sr, sr + Rl * 0.15, Math.hypot(px - loc.x, py - loc.y, pz - loc.z))) * fade.k;
          const a = Math.max(sstep(0, 0.1, e), mS);
          if (a < 0.003 || n >= DOT_CAP) continue;
          aP[n * 3] = px; aP[n * 3 + 1] = py; aP[n * 3 + 2] = pz;
          aC[n * 3] = col[i3]; aC[n * 3 + 1] = col[i3 + 1]; aC[n * 3 + 2] = col[i3 + 2];
          aA[n] = a; aF[n * 2] = rnd[i * 4 + 2]; aF[n * 2 + 1] = rnd[i * 4 + 3];
          n++;
        }
        geo.setDrawRange(0, n);
        ["position", "aC", "aA", "aF"].forEach((k) => (geo.attributes[k].needsUpdate = true));
      },
    };
    return h;
  });
  const hoverStep = (dt) => {
    dotU.uT.value += dt;
    const kv = state.mode === "lead" && state.phase === 0, moved = !ptr.equals(ptrPrev);
    ptrPrev.copy(ptr);
    let cast = false;
    hov.forEach((h, i) => {
      if (!h.busy && !(kv && moved)) return;
      if (!cast) { ray.setFromCamera(ptr, camera); cast = true; }
      const hit = ray.intersectObject(vegsG[i], true)[0];
      if (hit) { h.u.uHolePos.value.copy(hit.point); vegsG[i].worldToLocal(h.loc.copy(hit.point)); }
      if (!h.busy && hit && kv && moved) h.start();
      if (h.busy) h.step(dt);
    });
  };

  // Dust (white dots) and an orange powder cloud, a dotted planet below
  const points = (n, fn, color, size, opacity) => {
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) fn(pos, i * 3);
    const geo = new T.BufferGeometry(); geo.setAttribute("position", new T.BufferAttribute(pos, 3));
    return new T.Points(geo, new T.PointsMaterial({ color: new T.Color(window.vColor(color)), size, transparent: true, opacity, depthWrite: false, blending: T.AdditiveBlending }));
  };
  const dust = points(1600, (p, i) => { p[i] = (Math.random() - 0.5) * 40; p[i + 1] = (Math.random() - 0.5) * 24; p[i + 2] = -Math.random() * 20; }, "--site-on-space", 0.035, 0.5);
  const powder = points(900, (p, i) => { const r = 0.6 + Math.random() * 2.4, a = Math.random() * 6.28, b = (Math.random() - 0.5) * 3; p[i] = Math.cos(a) * r * 1.6; p[i + 1] = b * 0.6; p[i + 2] = Math.sin(a) * r * 0.6; }, "--kf-accent", 0.05, 0.75);
  const planet = points(7000, (p, i) => { const u = Math.random() * 2 - 1, a = Math.random() * 6.28, s = Math.sqrt(1 - u * u), r = 7 + Math.random() * 0.15; p[i] = s * Math.cos(a) * r; p[i + 1] = u * r; p[i + 2] = s * Math.sin(a) * r; }, "--site-on-space", 0.045, 0.85);
  planet.position.set(0, -20, -4);
  scene.add(dust, powder, planet);

  const wide = () => innerWidth >= 768;
  const LEAD = [[-1.2, -0.9, 0.5, 1.45], [3.1, 2.3, -1, 1.5], [1.0, 0.9, -2.5, 0.8], [-3.4, -2.6, -1, 0.7], [-4.6, 1.6, -1.5, 0.95]];
  const HEAD = [[-4.2, 1.8, -2, 0.7], [4.4, 2.2, -3, 0.8], [3.6, -2.2, -2, 0.6], [-3.6, -2.4, -2, 0.55], [0.2, 3.2, -4, 0.6]];
  stage = {
    place() {
      const w = wide(), sx = w ? 1 : 0.42, dur = reduce ? 0 : 1.2;
      const to = (g, [x, y, z, s], extra = {}) => {
        s *= w ? 1 : 0.62;
        gsap.to(g.position, { x: x * sx, y, z, duration: dur, ease: "expo.out", overwrite: true });
        gsap.to(g.scale, { x: s, y: s, z: s, duration: dur, ease: "expo.out", overwrite: true, ...extra });
      };
      const { mode, phase, veg } = state;
      vegsG.forEach((g, i) => {
        if (mode === "lead") { const [x, y, z, s] = LEAD[i]; to(g, [x - phase * 0.35, y + Math.sin(phase + i) * 0.4, z, s]); }
        else if (mode === "head") to(g, HEAD[i]);
        else if (mode === "veg") to(g, i === veg ? (w ? [-2.6, -0.2, 1.5, 2.1] : [0, 2.2, 0, 1.4]) : [HEAD[i][0] * 1.9, HEAD[i][1] * 1.8, -8, 0.5]);
        else to(g, [HEAD[i][0] * 1.2, 10 + i, -4, 0.5]);
      });
      const powderAt = mode === "veg" && veg >= 0 ? (w ? [-2.6, -0.2, 1.5] : [0, 2.2, 0]) : mode === "lead" ? [LEAD[0][0] - phase * 0.35, LEAD[0][1], 0.5] : [0, 12, -4];
      gsap.to(powder.position, { x: powderAt[0] * (w ? 1 : 0.42), y: powderAt[1], z: powderAt[2], duration: dur * 1.5, ease: "expo.out", overwrite: true });
      // At the end of the vegetables only the top of the planet shows below the screen, at the first map slot it shows small and whole at the lower left of the map slot
      const py = mode === "planet" ? -10.2 : mode === "map" ? -1.6 : mode === "away" ? 6 : -20;
      const px = mode === "map" && w ? 1.2 : 0;
      const ps = mode === "map" ? 0.62 : 1;
      gsap.to(planet.position, { x: px, y: py, duration: reduce ? 0 : 1.8, ease: "expo.out", overwrite: true });
      gsap.to(planet.scale, { x: ps, y: ps, z: ps, duration: reduce ? 0 : 1.8, ease: "expo.out", overwrite: true });
      gsap.to(planet.material, { opacity: mode === "map" && phase > 0 ? 0 : mode === "away" ? 0 : 0.85, duration: reduce ? 0 : 0.6, overwrite: true });
    },
  };
  stage.place();

  const pxSize = new T.Vector2();
  const size = () => {
    renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); stage.place();
    dotU.uPx.value = renderer.getDrawingBufferSize(pxSize).y / (2 * Math.tan(T.MathUtils.degToRad(camera.fov) / 2));
  };
  size();
  on(window, "resize", size);

  // ---------- Dragging vegetable cells (original interaction-area) ----------
  // On the mouse surface in the blank area left of the panel, the Touch ring follows the cursor with .8s expo.out and the hand becomes grab · grabbing. Holding and dragging, that cell’s vegetable
  // Rotates 3rad per half screen width (NDC 1) (horizontal drag → vertical axis, vertical drag → horizontal axis). Rotation follows each frame by 1-e^(-6·dt) and returns when leaving the vegetable cell.
  // On phones the ring stands at the top right (CSS), and dragging with a finger there spins the vegetables instead of scrolling (like the original).
  const area = $("[data-veg-area]"), mark = $("[data-veg-mark]"), htmlEl = document.documentElement;
  const mk = { x: 0, y: 0 };
  const drag = vegsG.map(() => ({ q: new T.Quaternion(), to: new T.Quaternion() }));
  const qa = new T.Quaternion(), qb = new T.Quaternion(), AX = new T.Vector3(1, 0, 0), AY = new T.Vector3(0, 1, 0);
  let dragging = false, dragAt = null, wasVeg = false, touchDown = false;
  const inArea = (x, y) => {
    if (state.mode !== "veg") return false;
    const r = area.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };
  const turn = (x, y) => {
    if (dragAt && state.veg >= 0) {
      qa.setFromAxisAngle(AY, ((x - dragAt.x) / innerWidth) * 2 * 3);
      qb.setFromAxisAngle(AX, ((y - dragAt.y) / innerHeight) * 2 * 3);
      drag[state.veg].to.premultiply(qa.multiply(qb));
    }
    dragAt = { x, y };
  };
  const drawMark = () => (mark.style.transform = `translateX(${mk.x}px) translateY(${mk.y}px)`);
  const setPtr = (e) => ptr.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  if (!reduce) {
    // The cursor hole follows every move for a mouse, and only while touching for a finger (original detectIntent)
    on(window, "pointerdown", (e) => { touchDown = e.pointerType === "touch"; setPtr(e); });
    on(window, "pointerup", () => (touchDown = false));
    on(window, "pointercancel", () => (touchDown = false));
    on(window, "pointermove", (e) => { if (e.pointerType !== "touch" || touchDown) setPtr(e); });
    on(window, "mousedown", (e) => { dragging = true; dragAt = { x: e.clientX, y: e.clientY }; if (inArea(e.clientX, e.clientY)) htmlEl.style.cursor = "grabbing"; });
    on(window, "mouseup", (e) => { dragging = false; htmlEl.style.cursor = inArea(e.clientX, e.clientY) ? "grab" : ""; });
    on(window, "mousemove", (e) => {
      const x = e.clientX, y = e.clientY, inside = inArea(x, y);
      if (dragging && inside) { e.preventDefault(); turn(x, y); } else dragAt = { x, y };
      htmlEl.style.cursor = inside ? (dragging ? "grabbing" : "grab") : "";
      mark.dataset.on = inside;
      if (!inside) return;
      const r = area.getBoundingClientRect();
      gsap.to(mk, { x: x - r.left, y: y - r.top, duration: 0.8, ease: "expo.out", overwrite: true, onUpdate: drawMark });
    });
    on(document, "touchstart", (e) => { const t = e.touches[0]; dragging = true; dragAt = { x: t.clientX, y: t.clientY }; }, { passive: true });
    on(document, "touchmove", (e) => {
      const t = e.touches[0];
      if (dragging && inArea(t.clientX, t.clientY)) { e.preventDefault(); turn(t.clientX, t.clientY); } else dragAt = { x: t.clientX, y: t.clientY };
    }, { passive: false });
    on(document, "touchend", () => (dragging = false));
  }

  // The cursor hole shader and dot shader are precompiled at setup (compiling on first touch freezes the screen)
  renderer.compile(scene, camera);
  const spin = vegsG.map(() => 0), tilt0 = vegsG.map((g) => g.rotation.z), eul = new T.Euler(), qs = new T.Quaternion();
  let last = performance.now();
  const tick = (now) => {
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    if (!reduce) {
      const isVeg = state.mode === "veg";
      if (wasVeg && !isVeg) { drag.forEach((d) => d.to.identity()); htmlEl.style.cursor = ""; mark.dataset.on = false; }
      wasVeg = isVeg;
      vegsG.forEach((g, i) => {
        spin[i] += dt * (0.18 + i * 0.03);
        drag[i].q.slerp(drag[i].to, 1 - Math.exp(-6 * dt));
        g.quaternion.multiplyQuaternions(drag[i].q, qs.setFromEuler(eul.set(Math.sin(now / 2400 + i) * 0.18, spin[i], tilt0[i])));
      });
      powder.rotation.y += dt * 0.25;
      dust.rotation.y += dt * 0.004;
      planet.rotation.y += dt * 0.03;
      hoverStep(dt);
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };
  let raf = requestAnimationFrame(tick);
  startPins();

  return () => {
    cancelAnimationFrame(raf);
    off.forEach((f) => f());
    ro.disconnect();
    mm.revert();
    hov.forEach((h) => h.stop());
    htmlEl.style.cursor = "";
    gsap.killTweensOf(mk);
    gsap.killTweensOf([...vegsG.map((g) => [g.position, g.scale]).flat(), powder.position, planet.position, planet.scale, planet.material]);
    renderer.dispose();
    renderer.forceContextLoss();
    window.vJump = null;
  };
  };
})();
