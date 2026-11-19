(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NS = "http://www.w3.org/2000/svg";
  const seg = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));

  // ── Dial: ticks on a semicircle, six value dots, fills blue up to the chosen dot ──
  const C = { x: 240, y: 270, r: 210 };
  const at = (k, r = C.r) => { const a = Math.PI * (1 - k); return [C.x + Math.cos(a) * r, C.y - Math.sin(a) * r]; };
  const ticks = $(".tw-dial__ticks");
  for (let i = 0; i <= 90; i++) {
    const [x1, y1] = at(i / 90, 236), [x2, y2] = at(i / 90, i % 5 ? 241 : 245);
    const l = document.createElementNS(NS, "line");
    l.setAttribute("x1", x1); l.setAttribute("y1", y1); l.setAttribute("x2", x2); l.setAttribute("y2", y2);
    ticks.append(l);
  }
  const labels = ["000", "0K", "0K", "0K", "00K", "Max"];
  const stopsG = $(".tw-dial__stops");
  const stops = labels.map((t, i) => {
    const k = i / (labels.length - 1);
    const [x, y] = at(k), [tx, ty] = at(k, 178);
    const g = document.createElementNS(NS, "g");
    g.style.setProperty("--i", i);
    g.innerHTML = `<circle class="o" cx="${x}" cy="${y}" r="9"/><circle class="m" cx="${x}" cy="${y}" r="12"/><circle class="i" cx="${x}" cy="${y}" r="3.5"/><text x="${tx}" y="${ty + 5}" text-anchor="middle">${t}</text>`;
    stopsG.append(g);
    g.addEventListener("click", () => setStop(i));
    return g;
  });
  const fillPath = $(".tw-dial__fill");
  const len = fillPath.getTotalLength();
  fillPath.style.strokeDasharray = `${len} ${len}`;
  const price = $(".tw-dial__price");
  const minus = $(".tw-dial__step--minus"), plus = $(".tw-dial__step--plus");
  const prices = ["$00", "$000", "$000", "$000", "$0,000", "Inquiry"];
  let cur = 2;
  const dial = { k: 0 };
  const paint = () => { fillPath.style.strokeDashoffset = String(len * (1 - dial.k)); };
  function setStop(i) {
    cur = Math.max(0, Math.min(labels.length - 1, i));
    stops.forEach((g, j) => { g.classList.toggle("is-on", j === cur); g.classList.toggle("is-past", j < cur); });
    minus.disabled = cur === 0; plus.disabled = cur === labels.length - 1;
    // Value pill: width settles at .217s and the digits roll up from below (1.05s)
    const from = price.offsetWidth;
    price.style.width = "";
    price.innerHTML = `<span>${prices[cur]}</span>`;
    const to = price.offsetWidth;
    price.style.width = `${from}px`;
    void price.offsetWidth;
    price.style.width = `${to}px`;
    gsap.to(dial, { k: cur / (labels.length - 1), duration: reduce ? 0 : 0.6, ease: "power3.out", onUpdate: paint });
    if (!reduce) gsap.fromTo(price.firstChild, { y: 20 }, { y: 0, duration: 1.05, ease: "expo.out" });
  }
  minus.addEventListener("click", () => setStop(cur - 1));
  plus.addEventListener("click", () => setStop(cur + 1));
  paint();
  setStop(cur);

  // ── Fog disc: our own shader — three colors flow diagonally and step through an 8×8 dot pattern ──
  const mist = twStage($(".tw-dial__mist"), { ortho: true, zoom: 1, camera: [0, 0, 5], dpr: 1.5 });
  if (mist) {
    const v3 = (n) => new THREE.Vector3(...twColor(n));
    const mat = new THREE.ShaderMaterial({
      uniforms: { uT: { value: 0 }, uA: { value: v3("--kf-accent-soft") }, uB: { value: v3("--site-mist-mid") }, uC: { value: v3("--kf-raised") }, uRes: { value: new THREE.Vector2(1, 1) } },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: `
        varying vec2 vUv; uniform float uT; uniform vec3 uA, uB, uC; uniform vec2 uRes;
        float h(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 15731.7); }
        float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
          return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
        float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * n(p); p *= 2.03; a *= 0.5; } return v; }
        float bayer(vec2 c){ vec2 q = mod(floor(c), 4.0);
          return mod(q.x * 2.0 + q.y * 3.0 + q.x * q.y * 5.0, 16.0) / 16.0; }
        void main(){
          vec2 uv = vUv; float t = uT * 0.7;
          float f = (uv.x + uv.y) * 0.5 + (fbm(uv * 2.2 + vec2(t * 0.05, t * 0.03)) - 0.5) * 0.7 + sin(t * 0.2) * 0.08;
          vec3 col = mix(uA, uB, smoothstep(0.1, 0.55, f));
          col = mix(col, uC, smoothstep(0.55, 0.95, f));
          float d = bayer(gl_FragCoord.xy);
          col += (d - 0.5) * 0.06;
          col = mix(col, floor(col * 16.0 + d) / 16.0, 0.04);
          float edge = smoothstep(0.5, 0.42, distance(uv, vec2(0.5)));
          gl_FragColor = vec4(col, edge);
        }`,
      transparent: true,
    });
    mist.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    mist.tick = (t) => { mat.uniforms.uT.value = t; };
    mist.ready();
  }

  // ── Unit picker in table header: press to go to the next unit ──
  $$(".tw-select").forEach((b) => {
    const opts = ["000 units", "0K units", "00K units"];
    let i = 0;
    b.addEventListener("click", () => { i = (i + 1) % opts.length; b.firstChild.textContent = opts[i]; });
  });

  // ── Comparison table expand ──
  const more = $(".tw-modes__more");
  more.addEventListener("click", () => {
    more.setAttribute("aria-expanded", String(more.getAttribute("aria-expanded") !== "true"));
    setTimeout(() => window.ScrollTrigger && ScrollTrigger.refresh(), 520);
  });

  // ── Three-depth stage: dot disc → contour lines → golden crescent and paper plane → blue sun ──
  const st = twStage($(".tw-modes__gl"), { fov: 30, camera: [0, 0, 20] });
  const chs = $$(".tw-modes__ch");
  const surf = $(".tw-modes__surface");
  const state = { a: 1, b: 0, c: 0, d: 0 };
  if (st) {
    st.light();
    // Dot disc + blue dot line crossing it
    const N = 1600, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = Math.sqrt(Math.random()) * 4.2, a = Math.random() * Math.PI * 2;
      pos.set([Math.cos(a) * r * 0.9, Math.sin(a) * r, (Math.random() - 0.5) * 0.6], i * 3);
    }
    const disc = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(pos, 3)), new THREE.PointsMaterial({ color: twThreeColor("--kf-dim"), size: 0.035, transparent: true }));
    const L = 70, lp = new Float32Array(L * 3);
    for (let i = 0; i < L; i++) lp.set([-5.5 + (i / L) * 11, (i / L) * 0.4 - 0.2 + (Math.random() - 0.5) * 0.12, 0.3], i * 3);
    const streak = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(lp, 3)), new THREE.PointsMaterial({ color: twThreeColor("--kf-accent"), size: 0.07, transparent: true }));
    const g0 = new THREE.Group(); g0.add(disc, streak); st.scene.add(g0);
    // Contour lines — twelve curved lines
    const g1 = new THREE.Group();
    const lineMat = new THREE.LineBasicMaterial({ color: twThreeColor("--kf-dim"), transparent: true, opacity: 0 });
    for (let k = 0; k < 12; k++) {
      const pts = [];
      for (let i = 0; i <= 80; i++) {
        const y = -6 + (i / 80) * 12;
        pts.push(new THREE.Vector3(Math.sin(y * 0.7 + k * 0.5) * (1.2 + k * 0.25) + Math.sin(y * 2.3 + k) * 0.25 + k * 0.18 - 1, y, 0));
      }
      g1.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
    }
    st.scene.add(g1);
    // Golden crescent ring + paper plane
    const g2 = new THREE.Group();
    const gold = new THREE.MeshStandardMaterial({ color: twThreeColor("--site-gold"), roughness: 0.3, metalness: 0.15, transparent: true });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.36, 24, 96, Math.PI), gold);
    ring.rotation.set(0.35, 0, Math.PI);
    ring.position.y = -1;
    const v = [1, 0, 0, -1, 0.02, 0, -1, 0.14, -0.78, 1, 0, 0, -1, 0.14, 0.78, -1, 0.02, 0, 1, 0, 0, -1, -0.32, 0, -1, 0.02, 0, 1, 0, 0, -1, 0.02, 0, -1, -0.32, 0];
    const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.Float32BufferAttribute(v, 3)); pg.computeVertexNormals();
    const plane = new THREE.Mesh(pg, new THREE.MeshStandardMaterial({ color: twThreeColor("--site-steel"), roughness: 0.4, metalness: 0.3, flatShading: true, side: THREE.DoubleSide, transparent: true }));
    plane.scale.setScalar(0.9);
    plane.position.set(0, 3.2, 0);
    g2.add(ring, plane);
    st.scene.add(g2);
    // Blue sun — center ring + eight rounded bars
    const g3 = new THREE.Group();
    const blue = new THREE.MeshPhysicalMaterial({ color: twThreeColor("--kf-accent"), roughness: 0.2, clearcoat: 1, transparent: true });
    const hub = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.32, 24, 64), blue);
    g3.add(hub);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2, len2 = i % 2 ? 1.2 : 1.8;
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, len2, 8, 24), blue);
      arm.position.set(Math.cos(a) * (1.9 + len2 / 2), Math.sin(a) * (1.9 + len2 / 2), 0);
      arm.rotation.z = a - Math.PI / 2;
      g3.add(arm);
    }
    st.scene.add(g3);
    st.tick = (t) => {
      g0.rotation.y = t * 0.15; g0.rotation.x = 0.3;
      disc.material.opacity = streak.material.opacity = state.a;
      g0.visible = state.a > 0.01;
      lineMat.opacity = state.b * 0.6; g1.visible = state.b > 0.01;
      g1.position.y = Math.sin(t * 0.2) * 0.2;
      gold.opacity = plane.material.opacity = state.c; g2.visible = state.c > 0.01;
      g2.rotation.y = Math.sin(t * 0.4) * 0.3;
      plane.position.y = 3.2 + Math.sin(t * 1.3) * 0.2;
      blue.opacity = state.d; g3.visible = state.d > 0.01;
      g3.rotation.set(0.2, -0.9 + t * 0.25, 0.1);
    };
    st.ready();
  }
  const mm = gsap.matchMedia();
  mm.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
    gsap.set(chs, { autoAlpha: 0 }); gsap.set(chs[0], { autoAlpha: 1 });
    const tint = { warm: 0, blue: 0 };
    const paintTint = () => surf.style.setProperty("--tw-modes-bg", `color-mix(in oklab, color-mix(in oklab, var(--site-panel), var(--site-gold) ${tint.warm * 12}%), var(--kf-accent) ${tint.blue * 10}%)`);
    const tl = gsap.timeline({ scrollTrigger: { trigger: ".tw-modes__pin", start: "top top", end: "+=400%", pin: true, scrub: true } });
    const step = (i, at) => {
      tl.to(chs[i - 1], { autoAlpha: 0, duration: 0.04 }, at).to(chs[i], { autoAlpha: 1, duration: 0.04 }, at + 0.03);
    };
    tl.to(state, { a: 0, b: 1, duration: 0.08 }, 0.2); step(1, 0.2);
    tl.to(state, { b: 0, c: 1, duration: 0.08 }, 0.45).to(tint, { warm: 1, duration: 0.08, onUpdate: paintTint }, 0.45); step(2, 0.45);
    tl.to(state, { c: 0, d: 1, duration: 0.08 }, 0.7).to(tint, { warm: 0, blue: 1, duration: 0.08, onUpdate: paintTint }, 0.7); step(3, 0.7);
    tl.to({}, { duration: 0.22 });
    return () => gsap.set(chs, { clearProps: "all" });
  });
})();
