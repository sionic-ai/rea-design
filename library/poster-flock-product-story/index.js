/* Story stage progress: pick the section by scroll position (viewport-height units p), and set the poster cluster, wall, branches, editor steps, distortion and small ring accordingly */
(() => {
  const { reduce, reveal, css } = window.PM;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const STORY = 52;
  const story = $("[data-story]");
  story.style.setProperty("--story-vh", STORY);
  const CH = [["hero", 0], ["good", 3.4], ["cats", 8.4], ["short", 17.4], ["edit", 19.6], ["dist", 31], ["agents", 36], ["dev", 42.4], ["export", 47]];
  const chEl = Object.fromEntries(CH.map(([n]) => [n, $(`[data-ch="${n}"]`)]));
  const swarm = window.PMStage?.build($("[data-swarm]"));

  const shot = (cls, label) => `<div class="pm-shot ${cls}" data-label="${label}"></div>`;
  const tones = ["is-red", "is-dark", "", "is-blue"];
  $("[data-wall-plane]").innerHTML = Array.from({ length: 98 }, (_, i) => shot(tones[i % 4], "Poster · portrait 4:5")).join("");
  $("[data-app-lib]").innerHTML = Array.from({ length: 12 }, (_, i) => shot(tones[(i + 1) % 4], "Poster")).join("");
  $("[data-app-strip]").innerHTML = Array.from({ length: 14 }, (_, i) => shot(tones[i % 4], "Scene")).join("");
  $("[data-phone]").innerHTML = Array.from({ length: 6 }, (_, i) => shot(tones[(i + 1) % 4], "Poster")).join("");
  $("[data-app-grid]").innerHTML = Array.from({ length: 24 }, (_, i) => shot(tones[(i + 2) % 4], "Poster")).join("");
  const ring = $("[data-minring]");
  ring.innerHTML = Array.from({ length: 14 }, (_, i) => shot(tones[i % 4], "Poster")).join("");
  /* Small ring: fourteen posters circle a slanted ring in 16s — larger and darker toward the front (overlapping by depth order) */
  const ringShots = $$(".pm-shot", ring), rs = { a: 0 };
  const placeRing = () => {
    const R = ring.clientWidth * 0.36;
    ringShots.forEach((s, i) => {
      const a = (i / ringShots.length) * Math.PI * 2 + rs.a, z = Math.cos(a), k = 0.62 + 0.38 * (z + 1) / 2;
      s.style.transform = `translate(${Math.sin(a) * R}px, ${z * R * 0.18}px) scale(${k}) rotateY(${Math.sin(a) * 50}deg)`;
      s.style.zIndex = String(Math.round((z + 1) * 50));
      s.style.opacity = (0.55 + 0.45 * (z + 1) / 2).toFixed(2);
    });
  };
  placeRing();
  new ResizeObserver(placeRing).observe(ring);
  if (!reduce) gsap.to(rs, { a: -Math.PI * 2, duration: 16, ease: "none", repeat: -1, onUpdate: placeRing });

  /* Section picker — on change the outgoing section title scatters upward and the incoming title enters letter by letter from below */
  let cur = null, ready = reduce;
  const setCh = (name) => {
    if (!ready || name === cur) return;
    const prev = cur ? chEl[cur] : null;
    cur = name;
    if (prev) { $$("[data-split]", prev).forEach((t) => reveal(t, false)); setTimeout(() => { if (cur !== prev.dataset.ch) prev.classList.remove("is-on"); }, reduce ? 0 : 420); }
    const el = chEl[name];
    el.classList.add("is-on");
    $$("[data-split]", el).forEach((t, i) => reveal(t, true, name === "hero" ? { delay: i * 0.06, stagger: 0.012 } : { delay: 0.1 + i * 0.12 }));
    if (!reduce) gsap.fromTo($$(":scope > :not([data-split]):not(.pm-dist__gl):not(.pm-hero__title):not(.pm-h1)", el), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.05, delay: 0.25, ease: "power3.out" });
  };

  const cats = $$("[data-cats] li"), CAT_AT = [9, 10.3, 11.6, 12.9, 14.2, 15.5, 16.6];
  const steps = $$("[data-steps] li"), STEP_AT = [19.6, 22.4, 25.2, 28];
  const canvas = $(".pm-app__canvas"), poster = $("[data-poster]");
  const wall = $("[data-wall]");
  let dist = null;
  const update = (p) => {
    swarm?.set(p);
    let name = CH[0][0];
    CH.forEach(([n, at]) => { if (p >= at) name = n; });
    setCh(name);
    const wo = Math.min(1, Math.max(0, (p - 3.4) / 1)) * (1 - Math.min(1, Math.max(0, (p - 6.8) / 1)));
    wall.style.opacity = wo.toFixed(3);
    let ci = -1; CAT_AT.forEach((a, i) => { if (p >= a) ci = i; });
    cats.forEach((li, i) => { li.classList.toggle("is-on", i === ci); li.classList.toggle("is-past", i < ci); });
    let si = 0; STEP_AT.forEach((a, i) => { if (p >= a) si = i; });
    steps.forEach((li, i) => li.classList.toggle("is-on", i === si));
    poster.classList.toggle("is-type", si >= 1);
    canvas.classList.toggle("is-bg", si >= 2);
    if (name === "dist" && !dist) dist = buildDist($("[data-dist]"));
    dist?.active(name === "dist");
  };
  const top = () => story.getBoundingClientRect().top + scrollY;
  CH.forEach(([n, at]) => { chEl[n].dataset.at = String(Math.round(top() + at * innerHeight + 2)); });
  ScrollTrigger.create({ trigger: story, start: "top top", end: "bottom bottom", onUpdate: (s) => update(Math.max(0, s.scroll() - top()) / innerHeight), onRefresh: (s) => update(Math.max(0, s.scroll() - top()) / innerHeight) });
  update(Math.max(0, scrollY - top()) / innerHeight);

  /* Split pill: the front end goes first (.35s) and the back end follows later (.55s), so it stretches and shrinks — original lead · trail */
  const pillTo = (seg, btn, instant) => {
    const pill = $(".pm-seg__pill", seg), L = btn.offsetLeft, R = L + btn.offsetWidth;
    const now = { l: pill.offsetLeft, r: pill.offsetLeft + pill.offsetWidth };
    const right = L > now.l;
    const st = seg._st || (seg._st = { l: now.l, r: now.r });
    const draw = () => { pill.style.left = `${st.l}px`; pill.style.width = `${st.r - st.l}px`; };
    gsap.killTweensOf(st);
    if (instant || reduce) { st.l = L; st.r = R; draw(); return; }
    gsap.to(st, { [right ? "r" : "l"]: right ? R : L, duration: 0.35, ease: "power3.out", onUpdate: draw });
    gsap.to(st, { [right ? "l" : "r"]: right ? L : R, duration: 0.55, delay: 0.05, ease: "power3.out", onUpdate: draw });
  };
  $$(".pm-seg").forEach((seg) => {
    const btns = $$("button", seg);
    requestAnimationFrame(() => pillTo(seg, btns.find((b) => b.classList.contains("is-on")) || btns[0], true));
    btns.forEach((b) => b.addEventListener("click", () => { btns.forEach((x) => x.classList.toggle("is-on", x === b)); pillTo(seg, b); seg.dispatchEvent(new CustomEvent("pick", { detail: b })); }));
  });
  $("[data-bill]").addEventListener("pick", (e) => {
    const y = e.detail.dataset.b === "y";
    $$("[data-price]").forEach((b) => {
      const v = b.dataset.price.split("|")[y ? 1 : 0];
      gsap.to(b, { yPercent: -100, opacity: 0, duration: reduce ? 0 : 0.25, ease: "power2.in", onComplete: () => { b.textContent = `$${v}`; gsap.fromTo(b, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: reduce ? 0 : 0.5, ease: "back.out(1.7)" }); } });
    });
    $$("[data-note]").forEach((n) => { n.textContent = n.dataset.note.split("|")[y ? 1 : 0]; });
  });
  $$(".pm-chips").forEach((row) => $$("button", row).forEach((b) => b.addEventListener("click", () => $$("button", row).forEach((x) => x.classList.toggle("is-on", x === b)))));

  /* Hero title letters: letters within 140px of the cursor get pushed outward up to 10px and split with an accent-color shadow, then return in .6s */
  if (!reduce) {
    const heroEl = chEl.hero;
    let mx = -999, my = -999;
    addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    gsap.ticker.add(() => {
      if (cur !== "hero") return;
      $$(".pm-c", heroEl).forEach((c) => {
        const r = c.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, d = Math.hypot(cx - mx, cy - my);
        const k = d < 140 ? 1 - d / 140 : 0, tx = k ? ((cx - mx) / (d || 1)) * 10 * k : 0, ty = k ? ((cy - my) / (d || 1)) * 10 * k : 0;
        c._x = (c._x || 0) + (tx - (c._x || 0)) * 0.12; c._y = (c._y || 0) + (ty - (c._y || 0)) * 0.12;
        c.style.translate = Math.abs(c._x) + Math.abs(c._y) > 0.05 ? `${c._x.toFixed(2)}px ${c._y.toFixed(2)}px` : "";
        c.style.textShadow = k > 0.05 ? `${(-3 * k).toFixed(2)}px 0 var(--kf-accent)` : "";
      });
    });
  }

  /* Hero: after the image has fully loaded (original 2.3s) the poster flock turns on and rises letter by letter */
  const go = () => { ready = true; swarm?.start(); update(Math.max(0, scrollY - top()) / innerHeight); };
  if (reduce) go(); else gsap.delayedCall(2.3, go);

  /* ── Distortion shader: flow (light streaks) · prism (color split) · bend (barrel warp). Intensity 0~100%. The picture slot is a skin-colored board ── */
  function buildDist(box) {
    const T = window.THREE;
    if (!T) return null;
    const r = new T.WebGLRenderer({ antialias: false, powerPreference: "low-power" });
    r.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    box.append(r.domElement);
    const c = document.createElement("canvas"); c.width = 1024; c.height = 640;
    const g = c.getContext("2d");
    const grad = g.createLinearGradient(0, 0, 1024, 640);
    grad.addColorStop(0, css("--kf-contrast-bg")); grad.addColorStop(0.55, css("--kf-accent")); grad.addColorStop(1, css("--kf-contrast-bg"));
    g.fillStyle = grad; g.fillRect(0, 0, 1024, 640);
    g.fillStyle = css("--kf-contrast-bg"); g.beginPath(); g.ellipse(560, 170, 52, 64, 0, 0, Math.PI * 2); g.fill(); g.fillRect(470, 230, 190, 410);
    g.fillStyle = css("--kf-contrast-ink"); g.font = `600 44px ${css("--kf-font-display")}`; g.fillText("LESS", 760, 300); g.fillText("NOISE", 760, 346); g.fillText("MORE", 760, 392);
    const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace;
    const mat = new T.ShaderMaterial({
      uniforms: { uMap: { value: tex }, uMode: { value: 1 }, uAmt: { value: 0.6 }, uTime: { value: 0 }, uAsp: { value: 1 } },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: `uniform sampler2D uMap; uniform float uMode, uAmt, uTime, uAsp; varying vec2 vUv;
        vec2 cover(vec2 uv) { float a = uAsp / 1.6; return a > 1.0 ? vec2(uv.x, 0.5 + (uv.y - 0.5) / a) : vec2(0.5 + (uv.x - 0.5) * a, uv.y); }
        void main() {
          vec2 uv = vUv, p = uv - 0.5; vec3 c;
          if (uMode > 2.5) { float r = dot(p, p); uv = 0.5 + p * (1.0 - uAmt * 0.9 * r + 0.08 * uAmt * sin(uv.y * 12.0 + uTime)); c = texture2D(uMap, cover(uv)).rgb; }
          else if (uMode > 1.5) { vec2 d = p * uAmt * 0.06; c = vec3(texture2D(uMap, cover(uv + d)).r, texture2D(uMap, cover(uv)).g, texture2D(uMap, cover(uv - d)).b); }
          else if (uMode > 0.5) {
            c = texture2D(uMap, cover(uv)).rgb; vec3 acc = vec3(0.0);
            for (int i = 1; i < 14; i++) { float f = float(i) / 14.0; acc += texture2D(uMap, cover(uv - p * f * 0.5 * uAmt)).rgb; }
            c = mix(c, max(c, acc / 13.0 * 1.35), uAmt);
          } else c = texture2D(uMap, cover(uv)).rgb;
          gl_FragColor = vec4(c, 1.0);
        }`,
    });
    const scene = new T.Scene(); scene.add(new T.Mesh(new T.PlaneGeometry(2, 2), mat));
    const cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const size = () => { const w = box.clientWidth || 1, h = box.clientHeight || 1; r.setSize(w, h, false); mat.uniforms.uAsp.value = w / h; };
    new ResizeObserver(size).observe(box); size(); r.compile(scene, cam);
    let on = false;
    const tick = (t) => { if (!on) return; mat.uniforms.uTime.value = reduce ? 0 : t; r.render(scene, cam); };
    gsap.ticker.add(tick);
    $("[data-dist-seg]").addEventListener("pick", (e) => gsap.to(mat.uniforms.uMode, { value: +e.detail.dataset.mode, duration: 0 }));
    const amt = $("[data-dist-amount]");
    amt.addEventListener("input", () => { mat.uniforms.uAmt.value = amt.value / 100; amt.nextElementSibling.textContent = `${amt.value}%`; });
    return { active: (v) => { on = v; if (v) tick(gsap.ticker.time); } };
  }
})();
