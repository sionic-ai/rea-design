// Home — 13 stops (Hero · Spring About · Summer Services · Autumn threshold · seven Works · Winter Contact · Footer) set with the original values,
// Takes the position (pos) moved by station-dive and syncs the camera path, flower type, jellyfish, season color, work panel and depth scale.
// Pressing on the Hero or pressing M mixes the jellyfish with their paired shapes (ripple ring 1.5s · 1.4s until mix reaches .85 · releases over 2.2s after 4.2s).
(() => {
  const { Loader, Sound, rgbOf, reduce } = window.jbShared;
  const T = THREE;
  const WORD = "LOGOTYPEHERE";
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smootherstep = (x) => x * x * x * (x * (x * 6 - 15) + 10);
  const ease = (x) => smootherstep(clamp((x - 0.1) / 0.8, 0, 1));
  const pad = (n) => String(n).padStart(2, "0");

  // Seasons — water depth · floating objects · light bloom · number of echo jellyfish (original values)
  const SEASON = {
    prologue: { i: 0, water: 0.14, drift: { uPetal: 0, uLeaf: 0, uFirefly: 0, uFall: 0.07, uSway: 0.2, op: 0.55 }, bloom: 0.32, threshold: 0.78, school: 7 },
    spring: { i: 1, water: 0.03, drift: { uPetal: 1, uLeaf: 0, uFirefly: 0, uFall: 0.28, uSway: 0.4, op: 0.9 }, bloom: 0.3, threshold: 0.78, school: 4 },
    summer: { i: 2, water: 0.32, drift: { uPetal: 0, uLeaf: 0, uFirefly: 1, uFall: -0.06, uSway: 0.6, op: 0.95 }, bloom: 0.34, threshold: 0.74, school: 5 },
    autumn: { i: 3, water: 0.62, drift: { uPetal: 0, uLeaf: 1, uFirefly: 0, uFall: 0.24, uSway: 0.75, op: 0.95 }, bloom: 0.26, threshold: 0.82, school: 3 },
    winter: { i: 4, water: 1, drift: { uPetal: 0, uLeaf: 0, uFirefly: 0, uFall: 0.12, uSway: 0.15, op: 1 }, bloom: 0.38, threshold: 0.7, school: 2 },
  };
  const HUD_SEASONS = ["spring", "summer", "autumn", "winter"];
  const BASE = { x: 0, y: 0, z: 0, s: 1, rx: 0, ry: 0, rz: 0 };

  // Seven works — placeholders
  const WORKS = Array.from({ length: 7 }, (_, i) => ({
    name: `Project ${pad(i + 1)}`,
    sub: i >= 5 ? `Studio Name Version ${i - 4}` : "",
    summary: i % 2 ? "Your two-line text introducing the work here. Say what the site is for." : "Two lines introducing the work go here.",
    highlights: i === 5 ? ["Highlight 1 — a slightly longer one-line description", "Highlight 2", "Highlight 3"] : ["Highlight 1 — One-line description", "Highlight 2"],
    year: "0000", role: i % 3 === 1 ? "Planning, design, development" : "Design, development",
    stack: i % 2 ? ["Tech 1", "Tech 2", "Tech 3", "Tech 4"] : ["Tech 1", "Tech 2", "Tech 3"],
    host: `work-${pad(i + 1)}.example.com`,
  }));
  const PARTNERS = [
    { form: "hanabi", name: "Pair 1", color: "var(--site-mix-0)" },
    { form: "snowFall", name: "Pair 2", color: "var(--site-mix-1)" },
    { form: "mapleFall", name: "Pair 3", color: "var(--site-mix-2)" },
    { form: "sakuraFall", name: "Pair 4", color: "var(--site-mix-3)" },
  ];
  const DEFAULT_PARTNER = "Topic 2";

  const dive = document.querySelector('[data-fx~="station-dive"]');
  const canvas = document.querySelector("[data-stage]");
  const loader = new Loader(document.querySelector("[data-loader]"));
  const sound = new Sound(document.querySelector("[data-sound]"));
  let world = null;
  try { world = new window.JbWorld(canvas, { reduce }); } catch (e) { world = null; }

  // ── Station ──
  function zh(L, narrow) {
    const p = L.position.clone();
    if (narrow) { p.y -= 0.95; const c = p.clone().add(L.normal.clone().multiplyScalar(4.2)); return { x: c.x, y: c.y, z: c.z, tx: p.x, ty: p.y, tz: p.z }; }
    p.addScaledVector(L.tangent, -0.85); p.y -= 0.32;
    const c = p.clone().add(L.normal.clone().multiplyScalar(3.4));
    return { x: c.x, y: c.y, z: c.z, tx: p.x, ty: p.y, tz: p.z };
  }
  const layout = world ? world.panelLayout : [];
  const STATIONS = [
    { id: "hero", clear: [-1, -1, 0.15, -0.1], season: "prologue", depth: 10, flower: "seasonsRing", swing: 1,
      cam: { x: 0, y: -1.4, z: 7.6, tx: 0, ty: 3.6, tz: -4 }, flowerAt: { x: 0, y: 7.9, z: -8, s: 4.9, rx: 0.08, ry: 0, rz: 0.04 }, jellyAt: { x: 0, y: 1.3, z: -8, s: 7.6 },
      narrow: { cam: { x: 0, y: -1.6, z: 7.4, tx: 0, ty: 3.4, tz: -4 }, flowerAt: { x: 0, y: 7.2, z: -8, s: 4.2, rx: 0.08, ry: 0, rz: 0.04 }, jellyAt: { x: 0, y: 1.1, z: -8, s: 6.6 } },
      echo: { a: 0, x: 0, y: 0, z: -50, s: 12 } },
    { id: "about", clear: [-1, -1, 0.35, 0.3], season: "spring", depth: 60, flower: "sakuraFall", swing: -1,
      cam: { x: 0.8, y: 0.3, z: 6.4, tx: 0.6, ty: 0, tz: 0 }, flowerAt: BASE, jellyAt: { x: 2.1, y: -0.4, z: -1.6, s: 1.6 },
      narrow: { cam: { x: 0, tx: 0, ty: -0.8 }, jellyAt: { x: 0.2, y: 1.3, z: -2.8, s: 0.85 } }, echo: { a: 0.24, x: -13, y: 4, z: -50, s: 12 } },
    { id: "services", clear: [-1, -1, 0.12, 0.75], season: "summer", depth: 200, flower: "hanabi", swing: 1,
      cam: { x: 0, y: 0, z: 7.2, tx: 0, ty: 0, tz: 0 }, flowerAt: { x: 2.7, y: 0.55, z: -0.6, s: 2.05, rx: 0.1, ry: -0.25, rz: 0 }, jellyAt: { x: 5.4, y: 3.1, z: -7.5, s: 1.1 },
      narrow: { flowerAt: { x: 0.5, y: 3.9, z: -1.6, s: 1.05 }, jellyAt: { x: 1.8, y: 5.6, z: -9, s: 1 } }, echo: { a: 0, x: 0, y: 0, z: -50, s: 12 } },
    { id: "autumn", clear: [-1, -1, 0.15, -0.35], season: "autumn", depth: 800, flower: "mapleFall", swing: -1,
      cam: { x: 0.6, y: 1.4, z: 10.8, tx: 0, ty: 0.1, tz: 0 }, flowerAt: BASE, jellyAt: { x: 0.9, y: -3, z: -1.2, s: 1.1 },
      narrow: { cam: { x: 0, y: 1.4, z: 9, tx: 0, ty: -0.9, tz: 0 }, jellyAt: { x: 0.6, y: -3.6, z: -2, s: 0.9 } }, echo: { a: 0.2, x: 18, y: 2, z: -54, s: 13 } },
    ...WORKS.map((_, t) => ({ id: "works", work: t, clear: [-1, -1, 0.3, -0.15], season: "autumn", depth: 1000 + t * 120, flower: "mapleFall", swing: t % 2 ? 1 : -1,
      parallax: 0.55, flowerOpacity: 0.75, cam: layout[t] ? zh(layout[t], false) : { x: 0, y: 0, z: 7, tx: 0, ty: 0, tz: 0 }, flowerAt: BASE, jellyAt: { x: 0.9, y: -3.2, z: -3, s: 1 },
      narrow: { cam: layout[t] ? zh(layout[t], true) : {}, jellyAt: { x: 0.6, y: -3.8, z: -3, s: 0.85 } }, echo: { a: 0.2, x: 18, y: 2, z: -54, s: 13 } })),
    { id: "contact", clear: [-1, -1, 0.15, 0.6], season: "winter", depth: 4000, flower: "snowFall", swing: 1,
      cam: { x: 0, y: 0, z: 7, tx: 0, ty: 0, tz: 0 }, flowerAt: BASE, jellyAt: { x: 2.5, y: 0.3, z: 0.4, s: 0.75 },
      narrow: { cam: { ty: -0.6 }, jellyAt: { x: -1.3, y: 2.3, z: 0, s: 0.55 } }, echo: { a: 0.2, x: 24, y: 6, z: -62, s: 14 } },
    { id: "finale", clear: [-0.9, -0.35, 0.9, 0.35], season: "spring", depth: 0, flower: "wordmark", swing: -1,
      cam: { x: 0, y: 0, z: 7, tx: 0, ty: -0.1, tz: 0 }, flowerAt: BASE, jellyAt: { x: 3.4, y: 3.2, z: -6.5, s: 1.2 },
      narrow: { jellyAt: { x: 0.8, y: 4.4, z: -7, s: 1 } }, echo: { a: 0.16, x: 16, y: 6, z: -56, s: 13 } },
  ];
  const COUNT = STATIONS.length;
  const isNarrow = () => innerWidth / innerHeight < 0.9;
  const station = (i) => {
    const s = STATIONS[i], n = isNarrow() ? s.narrow || {} : {};
    return { ...s, cam: { ...s.cam, ...(n.cam || {}) }, flowerAt: { ...BASE, ...s.flowerAt, ...(n.flowerAt || {}) }, jellyAt: { ...BASE, ...s.jellyAt, ...(n.jellyAt || {}) } };
  };
  const stationOf = (id, sub = null) => STATIONS.findIndex((s) => s.id === id && (sub === null || s.work === sub));

  // Camera path: a centripetal curve with a point swung far to the side inserted between stops (27 away when the season changes, otherwise 15)
  let posCurve = null, lookCurve = null;
  function buildPath() {
    const P = [], L = [];
    for (let n = 0; n < COUNT; n++) {
      const a = station(n);
      P.push(new T.Vector3(a.cam.x, a.cam.y, a.cam.z)); L.push(new T.Vector3(a.cam.tx, a.cam.ty, a.cam.tz));
      if (n === COUNT - 1) break;
      const b = station(n + 1);
      const mid = new T.Vector3((a.cam.tx + b.cam.tx) / 2, (a.cam.ty + b.cam.ty) / 2 - 0.3, 0);
      const out = new T.Vector3((a.cam.x + b.cam.x) / 2, (a.cam.y + b.cam.y) / 2, (a.cam.z + b.cam.z) / 2).sub(mid);
      if (a.id === "works" && b.id === "works") {
        const m = new T.Vector3(a.cam.x, a.cam.y, a.cam.z).add(new T.Vector3(b.cam.x, b.cam.y, b.cam.z)).multiplyScalar(0.5);
        const s = new T.Vector3(m.x, 0, m.z);
        if (s.lengthSq() < 0.01) s.set(0, 0, 1);
        s.normalize().multiplyScalar(Math.max(8.2, Math.hypot(m.x, m.z) * 1.35));
        const lift = a.work % 2 ? -2.6 : 3.1;
        P.push(new T.Vector3(s.x, m.y + lift, s.z)); L.push(new T.Vector3(0, (a.cam.ty + b.cam.ty) / 2 + lift * 0.25, 0));
        continue;
      }
      const change = a.season !== b.season, dist = change ? 27 : 15, rise = [6, -5, 7, -6.5, 5, -5.5][n % 6] * (change ? 1 : 0.6);
      const dir = out.lengthSq() > 0.01 ? out.clone().normalize() : new T.Vector3(0, 0, 1);
      dir.applyAxisAngle(new T.Vector3(0, 1, 0), a.swing * 0.8);
      P.push(mid.clone().addScaledVector(dir, dist).add(new T.Vector3(0, rise, 0)));
      L.push(mid.clone().add(new T.Vector3(0, rise * 0.15, 0)));
    }
    posCurve = new T.CatmullRomCurve3(P, false, "centripetal");
    lookCurve = new T.CatmullRomCurve3(L, false, "centripetal");
  }

  // Wordmark width — .86 of the width visible at the footer stop, capped at 7.4
  function makeWordmark() {
    if (!world) return;
    const f = station(stationOf("finale"));
    const dist = Math.hypot(f.cam.x - f.cam.tx, f.cam.y - f.cam.ty, f.cam.z - f.cam.tz) * world.aspectFit;
    const vw = 2 * Math.tan(T.MathUtils.degToRad(20)) * dist * (innerWidth / innerHeight);
    world.addWordmark(WORD, Math.min(7.4, vw * 0.86));
  }

  // ── Season colors (from the outfit) ──
  let seasonColors = {};
  function readSeasons() {
    seasonColors = Object.fromEntries(Object.entries(SEASON).map(([k, s]) => [k, {
      tint: rgbOf(`--site-tint-${s.i}`), a: rgbOf(`--site-drift-${s.i}a`), b: rgbOf(`--site-drift-${s.i}b`), accent: rgbOf(`--site-season-${s.i}`),
    }]));
  }
  readSeasons();

  // ── Intro State ──
  const intro = { k: 1, reveal: 0, light: 0, ignite: 0, ring: 0, gather: 0, noise: 1.6 };
  let busy = true, entered = false;
  const heroPanel = document.querySelector('[data-key="hero"]');
  const worksPanel = document.querySelector('[data-key="works"]');
  const hud = { root: document.querySelector("[data-hud]"), seasons: [...document.querySelectorAll("[data-hud-season]")], depth: document.querySelector("[data-hud-depth]") };
  const brand = document.querySelector("[data-brand-name]");
  let dived = false, nameRevealed = false;

  // ── Shuffle ──
  const mix = { amount: 0, ambient: 0, phase: 0, hover: 0, tint: -1, state: "idle", index: -1, form: null, tween: null, press: null, focus: new T.Vector2(), ripple: { reach: 0, strength: 0 } };
  const mixWord = document.querySelector("[data-mix-word]"), partnerLabel = document.querySelector("[data-mix-partner]");
  const MIX_PEAK = 0.85, AMBIENT = 0.3, CYCLE = 14, HOVER_REACH = 1.8, HOLD = 4.2;
  const divePos = () => dive?.kfStationDive?.pos ?? 0;
  const diveRest = () => dive?.kfStationDive?.rest ?? 0;
  const diveTarget = () => dive?.kfStationDive?.target ?? 0;
  const canMix = () => !busy && world && !world.paused && diveRest() === 0 && diveTarget() === 0 && Math.abs(divePos()) < 0.02 && mixWord && mix.state !== "collapse";
  function setPartner(i) {
    mix.index = ((i % PARTNERS.length) + PARTNERS.length) % PARTNERS.length;
    const p = PARTNERS[mix.index];
    mix.form = world?.flower.forms[p.form];
    mixWord?.style.setProperty("--mix-color", p.color);
    partnerLabel?.style.setProperty("--mix-color", p.color);
    return p;
  }
  const announcer = document.querySelector("[data-announce]");
  function showMixName(name) {
    if (announcer) announcer.textContent = `Topic 1 × ${name}`;
    partnerLabel?.classList.add("is-mixed");
    partnerLabel?.dispatchEvent(new CustomEvent("fx:swap", { detail: { text: name } }));
  }
  function hideMixName() {
    if (!partnerLabel?.classList.contains("is-mixed")) return;
    partnerLabel.classList.remove("is-mixed");
    partnerLabel.dispatchEvent(new CustomEvent("fx:swap", { detail: { text: DEFAULT_PARTNER } }));
  }
  function triggerMix(x, y) {
    if (x === undefined) {
      const v = new T.Vector3().setFromMatrixPosition(world.flower.points.matrixWorld).project(world.camera);
      mix.focus.set(v.x, v.y);
    } else mix.focus.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1);
    const next = mix.state === "on" || !mix.form, i = next ? mix.index + 1 : mix.index;
    mix.tween?.kill();
    mix.amount = Math.max(mix.amount, mix.ambient); mix.ambient = 0; mix.phase = 0; mix.state = "on";
    if (reduce) { showMixName(setPartner(i).name); mix.amount = 0.6; mix.tween = gsap.delayedCall(HOLD, releaseMix); return; }
    const tl = gsap.timeline();
    if (next && mix.amount > 0.02) tl.to(mix, { amount: 0, duration: 0.3, ease: "power2.in" });
    tl.call(() => showMixName(setPartner(i).name))
      .set(mix.ripple, { reach: 0.4, strength: 1 })
      .to(mix.ripple, { reach: 9, duration: 1.5, ease: "power2.out" })
      .to(mix, { amount: MIX_PEAK, duration: 1.4, ease: "power2.inOut" }, "<0.5")
      .to(mix.ripple, { strength: 0, duration: 0.6, ease: "power1.out" }, ">-0.2")
      .call(releaseMix, null, `+=${HOLD}`);
    mix.tween = tl;
  }
  function releaseMix() {
    if (mix.state !== "on") return;
    mix.state = "release"; mix.tween?.kill();
    const done = () => { if (mix.state === "release") { mix.state = "idle"; setPartner(mix.index + 1); } };
    if (reduce) { mix.amount = 0; mix.ripple.strength = 0; hideMixName(); done(); return; }
    mix.tween = gsap.timeline({ onComplete: done })
      .to(mix.ripple, { strength: 0, duration: 0.4 }, 0)
      .to(mix, { amount: 0, duration: 2.2, ease: "power2.inOut" }, 0)
      .call(hideMixName, null, 0.7);
  }
  function cancelMix() {
    mix.press = null; mix.ambient = 0; mix.phase = 0; mix.hover = 0;
    if (mix.state === "collapse" || (mix.state === "idle" && mix.amount === 0 && mix.ripple.strength === 0)) return;
    const was = mix.state !== "idle";
    mix.state = "collapse"; mix.tween?.kill(); hideMixName();
    const d = reduce ? 0 : 0.35;
    mix.tween = gsap.timeline({ onComplete: () => { if (mix.state === "collapse") { mix.state = "idle"; if (was) setPartner(mix.index + 1); } } })
      .to(mix, { amount: 0, duration: d, ease: "power2.out" }, 0)
      .to(mix.ripple, { strength: 0, duration: d }, 0);
  }
  function updateMix(dt) {
    if (!world || !mixWord) return;
    if (!mix.form) setPartner(0);
    const ready = canMix() && intro.k < 0.001, idle = ready && mix.state === "idle" && !reduce;
    if (idle) {
      const before = Math.floor(mix.phase);
      mix.phase += dt / CYCLE;
      if (Math.floor(mix.phase) !== before && mix.hover < 0.02) setPartner(mix.index + 1);
      const r = mix.phase % 1;
      mix.ambient = r < 0.5 ? 0 : AMBIENT * Math.sin(((r - 0.5) / 0.5) * Math.PI) ** 2;
    } else {
      mix.ambient *= Math.exp(-dt * 4);
      if (mix.ambient < 5e-4) mix.ambient = 0;
      if (!ready) mix.phase = 0;
    }
    const ptr = world.pointer, want = idle && ptr.active ? 0.55 + 0.45 * Math.min(1, ptr.energy) : 0;
    mix.hover += (want - mix.hover) * (1 - Math.exp(-dt * 3));
    if (mix.hover < 0.001) mix.hover = 0;
    // Press is a screen ripple, hover is the area around the cursor gaze crossing over as a paired type (world.mixHover)
    const mf = world.mixFocus, mh = world.mixHover;
    if (mix.ripple.strength > 0.001) { mf.ndc.copy(mix.focus); mf.reach = mix.ripple.reach; mf.strength = mix.ripple.strength; mh.strength = 0; }
    else { mf.strength = 0; mh.ndc.copy(ptr.ndc); mh.reach = HOVER_REACH; mh.strength = mix.hover; }
    const tint = clamp(Math.max(mix.amount / MIX_PEAK, (mix.ambient / AMBIENT) * 0.45, mix.hover * Math.min(1, ptr.energy) * 0.4, mix.ripple.strength * 0.6), 0, 1);
    if (Math.abs(tint - mix.tint) > 0.004) { mix.tint = tint; mixWord.style.setProperty("--mix", tint.toFixed(3)); }
  }
  const INTERACTIVE = 'a, button, input, textarea, select, label, summary, [role="button"], form';
  window.addEventListener("pointerdown", (e) => {
    if (!e.isPrimary || e.button !== 0 || (e.target instanceof Element && e.target.closest(INTERACTIVE))) return;
    mix.press = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() };
  });
  window.addEventListener("pointerup", (e) => {
    const p = mix.press; mix.press = null;
    if (!p || e.pointerId !== p.id) return;
    if (Math.hypot(e.clientX - p.x, e.clientY - p.y) > 10 || performance.now() - p.t > 600 || window.getSelection()?.toString()) return;
    if (canMix()) triggerMix(e.clientX, e.clientY);
  });
  window.addEventListener("pointercancel", () => { mix.press = null; });
  window.addEventListener("keydown", (e) => {
    const tag = e.target instanceof HTMLElement ? e.target.tagName : "";
    if (busy || tag === "INPUT" || tag === "TEXTAREA" || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "m" || e.key === "M") { if (!e.repeat && canMix()) triggerMix(); }
    else if (e.key === "Escape" && mix.state === "on") releaseMix();
  });

  // ── Hovering a What We Do row lights up one flame strand ──
  document.querySelectorAll(".jb-service").forEach((row, n) => {
    const on = () => { if (!world) return; const u = world.flower.uniforms; u.uHighlight.value = n; gsap.to(u.uHighlightAmount, { value: 1, duration: 0.4, ease: "power2.out", overwrite: true }); };
    const off = () => { if (!world) return; gsap.to(world.flower.uniforms.uHighlightAmount, { value: 0, duration: 0.5, ease: "power2.out", overwrite: true }); };
    row.addEventListener("pointerenter", on); row.addEventListener("pointerleave", off);
    row.addEventListener("focus", on); row.addEventListener("blur", off);
  });

  // ── Work ──
  const list = document.querySelector("[data-work-list]");
  const work = {
    root: document.querySelector("[data-work-info]"), name: document.querySelector("[data-work-name]"), summary: document.querySelector("[data-work-summary]"),
    year: document.querySelector("[data-work-year]"), role: document.querySelector("[data-work-role]"), host: document.querySelector("[data-work-host]"),
    index: document.querySelector("[data-work-index]"), sub: document.querySelector("[data-work-ja]"), stack: document.querySelector("[data-work-stack]"),
    highlights: document.querySelector("[data-work-highlights]"), link: document.querySelector("[data-work-link]"),
  };
  list?.replaceChildren(...WORKS.map((w, t) => {
    const li = document.createElement("li"), b = document.createElement("button");
    b.type = "button";
    b.innerHTML = `<span class="jb-works__no">${pad(t + 1)}</span><span class="jb-works__label"></span>`;
    b.querySelector(".jb-works__label").textContent = w.name;
    b.addEventListener("click", () => dive?.kfStationDive?.goTo(stationOf("works", t), { cut: true }));
    li.append(b);
    return li;
  }));
  const workButtons = [...(list?.querySelectorAll("button") || [])];
  let workShown = -1;
  const fillWork = (i) => {
    const w = WORKS[i];
    work.name.textContent = w.name; work.summary.textContent = w.summary; work.year.textContent = w.year; work.role.textContent = w.role;
    work.host.textContent = w.host; work.sub.textContent = w.sub; work.index.textContent = pad(i + 1);
    work.stack.replaceChildren(...w.stack.map((s) => Object.assign(document.createElement("li"), { textContent: s })));
    work.highlights.replaceChildren(...w.highlights.map((s) => Object.assign(document.createElement("li"), { textContent: s })));
    work.link?.setAttribute("aria-label", `${w.name}(Opens in new tab)`);
    workButtons.forEach((b, n) => b.toggleAttribute("aria-current", n === i));
  };
  function setWorkInfo(i) {
    if (i === workShown || i < 0) return;
    const first = workShown < 0;
    workShown = i;
    if (first || reduce) { fillWork(i); return; }
    work.root.dispatchEvent(new CustomEvent("fx:swap", { detail: { apply: () => {
      fillWork(i);
      if (worksPanel.classList.contains("is-in")) worksPanel.dispatchEvent(new CustomEvent("fx:replay", { detail: { within: work.root } }));
    } } }));
  }
  setWorkInfo(0);

  // Refraction applied to the whole section when crossing between works — crossing strength × 46, grain .006 ± .0015 depending on position
  const worksWarp = document.querySelector("[data-works-warp]"), worksRipple = document.querySelector("[data-works-ripple]");
  function warpDom(s, e) {
    const on = s > 0.02;
    if (worksPanel.classList.contains("is-travelling") !== on) worksPanel.classList.toggle("is-travelling", on);
    if (!on || !worksWarp) return;
    worksWarp.setAttribute("scale", (s * 46).toFixed(1));
    const f = 0.006 + Math.sin(e * 3.1) * 0.0015;
    worksRipple.setAttribute("baseFrequency", `${f.toFixed(4)} ${(f * 3.6).toFixed(4)}`);
  }

  // ── One frame ──
  const accentMix = (a, b, r) => `color-mix(in oklab, var(--site-season-${a}) ${((1 - r) * 100).toFixed(1)}%, var(--site-season-${b}))`;
  let lastAccent = "";
  function apply(e) {
    if (!world || !posCurve) return;
    const n = clamp(Math.floor(e), 0, COUNT - 2), r = ease(clamp(e - n, 0, 1));
    const A = station(n), B = station(n + 1), wave = Math.sin(r * Math.PI);
    const s = (2 * n + 2 * r) / (2 * COUNT - 2), c = posCurve.getPoint(s), l = lookCurve.getPoint(s);
    const k = intro.k, rig = world.rig;
    rig.tx = l.x; rig.ty = l.y; rig.tz = l.z;
    rig.x = l.x + (c.x - l.x) * (1 + k * 0.9); rig.y = l.y + (c.y - l.y) * (1 + k * 0.9) - k * 2.2; rig.z = l.z + (c.z - l.z) * (1 + k * 0.9);
    const betweenWorks = A.id === "works" && B.id === "works", panelChange = !betweenWorks && A.id !== B.id;
    rig.roll = A.swing * wave * (betweenWorks ? 0.13 : panelChange ? 0.08 : 0.045);
    rig.fov = 40 + wave * (betweenWorks ? 7 : panelChange ? 9 : 3);
    const scatter = panelChange ? wave * (A.season === B.season ? 0.6 : 1.25) : 0;
    world.water.strength = betweenWorks && !reduce ? wave : 0;
    warpDom(world.water.strength, e);
    world.water.front = -1.5 + r * 3; world.water.dir = A.swing;
    world.parallax = lerp(A.parallax ?? 1, B.parallax ?? 1, r);
    world.flowerOpacity = lerp(A.flowerOpacity ?? 1, B.flowerOpacity ?? 1, r);
    world.place(world.flower.points, A.flowerAt, B.flowerAt, r);
    world.place(world.jelly.points, A.jellyAt, B.jellyAt, r);
    const fa = world.flower.forms[A.flower] || world.flower.forms.seasonsRing, g = Math.max(mix.amount, mix.ambient);
    const mixing = n === 0 && r < 1e-4 && mix.form && (g > 5e-4 || world.mixFocus.strength > 0.001 || world.mixHover.strength > 0.001);
    world.flower.setPair(fa, mixing ? mix.form : world.flower.forms[B.flower] || fa, mixing ? g : r);
    if (!mixing) world.mixFocus.strength = world.mixHover.strength = 0;
    world.flower.uniforms.uMixSpark.value = mixing ? 1 : 0;
    world.flower.uniforms.uScatter.value = scatter;
    world.flower.uniforms.uGather.value = intro.gather;
    world.flower.uniforms.uNoise.value = intro.noise;
    world.jellyIgnite = intro.ignite; world.ringIgnite = intro.ring;
    world.focus = c.distanceTo(l) * world.aspectFit;
    const autumnish = (x) => x.id === "autumn" || x.id === "works";
    const weight = (autumnish(A) ? 1 - r : 0) + (autumnish(B) ? r : 0);
    let focus = -10;
    if (A.work !== undefined && B.work !== undefined) focus = A.work + r;
    else if (B.work === undefined) { if (A.work !== undefined) focus = r < 0.5 ? A.work : -10; }
    else focus = r > 0.5 ? B.work : -10;
    world.updateWorks({ weight: weight * intro.reveal, focus, speed: betweenWorks ? wave : 0 });
    const C = STATIONS[Math.round(e)];
    if (C.work !== undefined) setWorkInfo(C.work);
    const W = SEASON[A.season], V = SEASON[B.season], ca = seasonColors[A.season], cb = seasonColors[B.season];
    rig.depth = lerp(1, lerp(W.water, V.water, r), intro.light);
    const mixv = (x, y) => [lerp(x[0], y[0], r), lerp(x[1], y[1], r), lerp(x[2], y[2], r)];
    world.setSeason({
      tint: mixv(ca.tint, cb.tint), a: mixv(ca.a, cb.a), b: mixv(ca.b, cb.b), accent: mixv(ca.accent, cb.accent),
      drift: { uPetal: lerp(W.drift.uPetal, V.drift.uPetal, r), uLeaf: lerp(W.drift.uLeaf, V.drift.uLeaf, r), uFirefly: lerp(W.drift.uFirefly, V.drift.uFirefly, r),
        uFall: lerp(W.drift.uFall, V.drift.uFall, r), uSway: lerp(W.drift.uSway, V.drift.uSway, r), uOpacity: lerp(W.drift.op, V.drift.op, r) * intro.reveal },
    });
    world.fx.bloom = lerp(W.bloom, V.bloom, r) + g * 0.08;
    world.fx.threshold = lerp(W.threshold, V.threshold, r);
    world.fx.travel = e * 6;
    const acc = accentMix(W.i, V.i, r);
    if (acc !== lastAccent) { lastAccent = acc; document.documentElement.style.setProperty("--accent", acc); }
    world.schoolCount = Math.round(lerp(W.school, V.school, r) * intro.reveal);
    world.schoolClear = (r < 0.5 ? A : B).clear;
    const ea = A.echo, eb = B.echo;
    world.echo = { a: lerp(ea.a, eb.a, r) * intro.reveal, x: lerp(ea.x, eb.x, r), y: lerp(ea.y, eb.y, r), z: lerp(ea.z, eb.z, r), s: lerp(ea.s, eb.s, r) };
    heroPanel.kfWeight = intro.reveal;
    applyHud(e, lerp(A.depth, B.depth, r));
  }
  function applyHud(e, depth) {
    const n = Math.round(e), st = STATIONS[n];
    if (!dived && e > 0.15) { dived = true; document.body.classList.add("has-dived"); }
    const si = HUD_SEASONS.indexOf(st.season), fin = st.id === "finale";
    hud.seasons.forEach((li, i) => li.toggleAttribute("aria-current", !fin && i === si));
    const d = Math.round(depth).toLocaleString("en-US");
    if (hud.depth && hud.depth.textContent !== d) hud.depth.textContent = d;
    hud.root?.style.setProperty("--progress", (e / (COUNT - 1)).toFixed(4));
    document.querySelectorAll(".jb-masthead__nav [data-dive-go]").forEach((a) => {
      const key = a.getAttribute("data-dive-go").split(":")[0];
      a.toggleAttribute("aria-current", key === st.id || (key === "works" && st.id === "autumn"));
    });
    if (fin && !nameRevealed) { nameRevealed = true; brand?.classList.add("is-resolved"); }
  }

  // ── Intro — after choosing, the jellyfish lights up (2.4s after .4s), the water color rises (2.4s after 1.5s), the ring is drawn (1.9s after 2.4s), and the text comes in (1.2s after 3.6s) ──
  function introPlay() {
    const tl = gsap.timeline();
    if (reduce) { Object.assign(intro, { k: 0, reveal: 1, light: 1, ignite: 1, ring: 1, gather: 1, noise: 0.05 }); release(); document.body.classList.remove("is-loading"); return; }
    tl.fromTo(intro, { gather: 0 }, { gather: 1, duration: 2.6, ease: "power2.inOut" }, 0)
      .fromTo(intro, { noise: 1.6 }, { noise: 0.05, duration: 2.8, ease: "power2.inOut" }, 0)
      .to(intro, { k: 0, duration: 5.2, ease: "power3.inOut" }, 0)
      .to(intro, { ignite: 1, duration: 2.4, ease: "power2.inOut" }, 0.4)
      .to(intro, { light: 1, duration: 2.4, ease: "power1.inOut" }, 1.5)
      .to(intro, { ring: 1, duration: 1.9, ease: "power2.inOut" }, 2.4)
      .to(intro, { reveal: 1, duration: 1.2, ease: "power1.inOut" }, 3.6)
      .call(release, null, 4.2)
      .call(() => document.body.classList.remove("is-loading"), null, 4.4);
  }
  function release() { busy = false; dive?.kfStationDive?.hold(false); }

  // ── Motion button — freezes the whole world ──
  const motionBtn = document.querySelector("[data-motion]"), motionLabel = document.querySelector("[data-motion-label]");
  motionBtn?.addEventListener("click", () => {
    if (!world) return;
    world.paused = !world.paused;
    motionBtn.setAttribute("aria-pressed", world.paused ? "false" : "true");
    if (motionLabel) motionLabel.textContent = world.paused ? "Motion off" : "Motion on";
  });

  // ── Contact → hidden section ──
  const form = document.querySelector("[data-contact-form]");
  const status = document.querySelector("[data-contact-form-status]");
  const secret = document.querySelector("[data-secret]");
  const MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const RULES = { name: (v) => (v.trim().length >= 2 ? "" : "Please enter a name of at least two characters."), email: (v) => (MAIL.test(v.trim()) ? "" : "Please check your email address."), message: (v) => (v.trim().length >= 20 ? "" : "Please enter at least 20 characters for your inquiry.") };
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    let firstBad = null;
    Object.entries(RULES).forEach(([k, rule]) => {
      const input = form.elements[k], msg = rule(input.value);
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      form.querySelector(`[data-error-for="${k}"]`).textContent = msg;
      if (msg && !firstBad) firstBad = input;
    });
    if (firstBad) { status.textContent = "Please check your input."; firstBad.focus(); return; }
    status.textContent = "Sent.";
    const b = e.submitter?.getBoundingClientRect();
    openSecret(b ? b.left + b.width / 2 : innerWidth / 2, b ? b.top + b.height / 2 : innerHeight * 0.7);
    form.reset();
  });
  let earthRaf = 0;
  function openSecret(x, y) {
    secret.style.setProperty("--x", `${x}px`); secret.style.setProperty("--y", `${y}px`);
    secret.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => { secret.setAttribute("data-open", ""); secret.classList.add("is-in"); }));
    dive?.kfStationDive?.hold(true);
    drawEarth();
    setTimeout(() => secret.querySelector("[tabindex='-1']")?.focus({ preventScroll: true }), reduce ? 0 : 1400);
  }
  function closeSecret() {
    secret.removeAttribute("data-open"); secret.classList.remove("is-in");
    setTimeout(() => { secret.hidden = true; cancelAnimationFrame(earthRaf); dive?.kfStationDive?.hold(false); }, reduce ? 0 : 1400);
  }
  secret?.querySelector("[data-secret-close]")?.addEventListener("click", closeSecret);
  secret?.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSecret(); });
  // Earth seen from low orbit — a round plate of dots slowly rotates
  function drawEarth() {
    const cv = secret.querySelector("[data-secret-canvas]"), g = cv.getContext("2d");
    const ink = rgbOf("--kf-ink"), glint = rgbOf("--kf-accent-soft");
    const col = (c, a) => `rgba(${Math.round(c[0] * 255)}, ${Math.round(c[1] * 255)}, ${Math.round(c[2] * 255)}, ${a})`;
    const pts = Array.from({ length: 2600 }, () => { const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2; return [Math.sqrt(1 - u * u) * Math.cos(a), u, Math.sqrt(1 - u * u) * Math.sin(a), Math.random()]; });
    const t0 = performance.now();
    const frame = (now) => {
      const w = (cv.width = innerWidth), h = (cv.height = innerHeight), t = (now - t0) / 1000;
      const R = Math.max(w, h) * 0.62, cx = w * 0.62, cy = h + R * 0.55;
      g.clearRect(0, 0, w, h);
      const glow = g.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.12);
      glow.addColorStop(0, col(glint, 0.22)); glow.addColorStop(1, col(glint, 0));
      g.fillStyle = glow; g.beginPath(); g.arc(cx, cy, R * 1.12, 0, Math.PI * 2); g.fill();
      const rot = t * 0.04;
      pts.forEach(([x, y, z, s]) => {
        const X = x * Math.cos(rot) - z * Math.sin(rot), Z = x * Math.sin(rot) + z * Math.cos(rot);
        if (Z < 0) return;
        const land = Math.sin(x * 5 + 1.3) * Math.cos(z * 4 - y * 3) > 0.15;
        g.fillStyle = col(land ? ink : glint, (land ? 0.55 : 0.18) * Z);
        g.fillRect(cx + X * R, cy - y * R, land ? 1.8 : 1.2, land ? 1.8 : 1.2);
      });
      if (!reduce) earthRaf = requestAnimationFrame(frame);
    };
    earthRaf = requestAnimationFrame(frame);
  }

  // ── Start ──
  async function start() {
    const choiceP = loader.waitForChoice();
    const fonts = Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 2500))]).catch(() => {});
    loader.setProgress(0.3);
    if (world) {
      // Build one shape per frame so the progress bar fills by actual work (the original also goes 0.3 → 0.92 per shape). Built together while waiting for the font
      // Jellyfish and rings used in the hero are built before the entrance, the remaining types during the intro after the entrance opens (within 4.2s)
      const tasks = world.buildTasks(), first = tasks.slice(0, 2), later = tasks.slice(2);
      for (let i = 0; i < first.length; i++) {
        await new Promise((r) => setTimeout(r, 0));
        first[i]();
        loader.setProgress(0.3 + ((i + 1) / first.length) * 0.62);
      }
      const buildLater = () => { const t = later.shift(); if (t) { t(); setTimeout(buildLater, 0); } };
      choiceP.then(() => setTimeout(buildLater, 300));
      // Wordmark is rebuilt once the typeface arrives — so the entrance doesn’t wait for the web font
      makeWordmark();
      fonts.then(makeWordmark);
      buildPath();
      apply(0);
      loader.setProgress(0.92);
      gsap.ticker.add((time, deltaMs) => {
        const dt = Math.min(0.1, (deltaMs || 16) / 1000);
        if (diveTarget() !== 0 && mix.state !== "idle" && mix.state !== "collapse") cancelMix();
        if (!entered) return;
        updateMix(dt);
        apply(divePos());
        world.frame(dt);
      });
      let t = 0;
      window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => { world.resize(); makeWordmark(); buildPath(); }, 180); });
    } else {
      await fonts;
      document.documentElement.classList.add("no-webgl");
    }
    loader.setProgress(1);
    const choice = await choiceP;
    entered = true;
    if (choice === "sound") sound.play();
    loader.finish();
    world ? introPlay() : (release(), document.body.classList.remove("is-loading"));
  }
  start();
})();
