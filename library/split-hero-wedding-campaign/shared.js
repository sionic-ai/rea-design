// Motion shared by sub-sections — the same three-layer WebGL background as the original (three r118), rebuilt with our own shader:
//   ① 5×5 vertex-color gradient plane (the center 9 points drift 0~2px/frame within ±58px of home, colors swap every 1 second)
//   ② Screen-space light orb panels, two (position and size re-picked every 4–6 seconds and glide over)
//   ③ 200 bokeh particles (right in front of the camera at z 930~980 so they blur large, follow the target with spring .01 and friction .78 while swaying up and down)
// When scroll reaches the footer the panel turns ocean color, and when the menu opens it turns the menu color. Menu drawer, page turn (body shrinks to .96 over 900ms) and pair slider are here too.
(() => {
  const root = document.documentElement;
  const body = document.body;
  if (!body.classList.contains("crz")) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const site = body.dataset.site || "co";
  const page = body.dataset.page || "";
  const BP = 721;

  // Turn skin variables into real rgb (0~1) — oklch(from …) also resolves if painted on a canvas and read
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const css = getComputedStyle(root);
  const rgb = (name) => {
    probe.clearRect(0, 0, 1, 1);
    const tmp = document.createElement("i");
    tmp.style.color = `var(${name})`;
    body.appendChild(tmp);
    const col = getComputedStyle(tmp).color;
    tmp.remove();
    probe.fillStyle = col || css.getPropertyValue(name);
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  const C = {
    white: rgb("--kf-bg"),
    peach: rgb("--site-peach"), peachDeep: rgb("--site-peach-deep"),
    blush: rgb("--site-blush"), blushSoft: rgb("--site-blush-soft"),
    sky: rgb("--site-sky"), mist: rgb("--site-mist"), haze: rgb("--site-haze"),
    sea: rgb("--kf-contrast-bg"), deep: rgb("--site-deep"),
    sandLight: rgb("--site-sand-light"), sandTop: rgb("--site-sand-top"),
  };
  const LIST = {
    co: [C.peach, C.blush, C.blush, C.sky],
    menuCo: [C.peachDeep, C.blushSoft, C.white, C.mist],
    footer: [C.white, C.haze, C.mist, C.sea, C.deep],
    iwai: [C.white, C.sandLight, C.sandTop],
  };
  const PATTERN = {
    co: [0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0],
    menuCo: [0, 0, 1, 1, 1, 0, 0, 1, 2, 1, 0, 2, 2, 2, 1, 0, 2, 2, 2, 0, 1, 1, 1, 0, 0],
    footer: [0, 1, 2, 2, 3, 1, 1, 2, 3, 3, 2, 2, 3, 3, 4, 3, 3, 3, 3, 4, 3, 3, 3, 3, 4],
    iwai: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    iwaiTop: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  };
  const PLANE_IDS = { co: [0, 3], menuCo: [0, 3], footer: [3, 4], iwai: [0, 1] };

  // ───────── WebGL background ─────────
  const holder = document.querySelector(".crz-canvas");
  let gl = null;
  const showBody = () => document.querySelector(".crz-body")?.classList.add("is-show");
  try { if (holder && window.THREE) gl = initGL(holder); } finally { requestAnimationFrame(() => requestAnimationFrame(showBody)); }

  function initGL(holder) {
    const INFLATE = 100;
    let sw = innerWidth, sh = innerHeight;
    const canvas = document.createElement("canvas");
    holder.appendChild(canvas);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(1);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, sw / sh, 0.1, 1000);
    camera.position.z = 1000;
    const state = { mode: 1, menu: false, pageTop: false, footerScroll: 0, inputFooterScroll: 0 };

    // ① Gradient panel
    const COLS = 4, ROWS = 4, N = (COLS + 1) * (ROWS + 1);
    const W = 1400, H = 787;
    const cellW = W / 4, cellH = Math.max(H / 4, 250);
    const range = cellW / 6;
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 4), idx = new Uint16Array(COLS * ROWS * 6);
    const startList = sessionStorage.getItem("crz-from-site") === "co" && site === "iwai" ? "co" : sessionStorage.getItem("crz-from-site") === "iwai" && site === "co" ? "iwai" : null;
    const firstKey = site === "iwai" ? "iwai" : "co";
    for (let r = 0, k = 0; r <= ROWS; r++) for (let c = 0; c <= COLS; c++, k++) {
      pos[k * 3] = -cellW * 2 + cellW * c;
      pos[k * 3 + 1] = cellH * 2 - cellH * r;
      // The ceremony section starts on a white board like the original (isOpeningSub) and tints in the first 1s paint
      const key = startList || firstKey;
      const p = !startList && site === "iwai" ? C.white : LIST[key][PATTERN[key][k]];
      col.set([p[0], p[1], p[2], 1], k * 4);
    }
    for (let r = 0, i = 0, v = 0; r < ROWS; r++, v++) for (let c = 0; c < COLS; c++, v++, i += 6) {
      idx.set([v, v + COLS + 1, v + COLS + 2, v + COLS + 2, v + 1, v], i);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 4));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    const mesh = new THREE.Mesh(geo, new THREE.ShaderMaterial({
      vertexShader: "attribute vec4 color; varying vec4 vColor; void main(){ vColor = color; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: "varying vec4 vColor; void main(){ gl_FragColor = vColor; }",
      transparent: true,
    }));
    scene.add(mesh);
    const drift = [6, 7, 8, 11, 12, 13, 16, 17, 18].map((id) => {
      const speed = Math.random() * 2, a = Math.random() * Math.PI * 2;
      return { id, ox: pos[id * 3], oy: pos[id * 3 + 1], x: pos[id * 3], y: pos[id * 3 + 1], vx: Math.cos(a) * speed, vy: Math.sin(a) * speed };
    });
    const colTweens = [];
    function paint(key, patternKey = key) {
      const list = LIST[key], pat = PATTERN[patternKey];
      for (let k = 0; k < N; k++) {
        const p = list[pat[k]];
        if (!p) continue;
        colTweens[k]?.kill();
        const o = { r: col[k * 4], g: col[k * 4 + 1], b: col[k * 4 + 2] };
        colTweens[k] = gsap.to(o, { r: p[0], g: p[1], b: p[2], duration: reduce ? 0 : 1, ease: "power1.out",
          onUpdate: () => { col[k * 4] = o.r; col[k * 4 + 1] = o.g; col[k * 4 + 2] = o.b; } });
      }
    }

    // ② Two light-orb panels — alpha computed from the distance between screen coordinates and the point
    const orbFrag = `
      precision mediump float;
      uniform vec2 resolution; uniform vec2 point; uniform float size; uniform vec3 color;
      void main(){
        vec2 uv = gl_FragCoord.xy / resolution;
        float d = 1. - distance(point, uv);
        gl_FragColor = vec4(color, smoothstep(size, 1.0, d));
      }`;
    const orbs = [0, 1].map(() => {
      const u = { resolution: { value: new THREE.Vector2(sw, sh) }, point: { value: new THREE.Vector2(0.5, 0.5) }, size: { value: 0.6 }, color: { value: new THREE.Vector3(1, 1, 1) } };
      const m = new THREE.Mesh(new THREE.PlaneBufferGeometry(1400, 787, 2, 2),
        new THREE.ShaderMaterial({ vertexShader: "void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }", fragmentShader: orbFrag, uniforms: u, depthTest: false, depthWrite: false, transparent: true }));
      scene.add(m);
      return { mesh: m, u, p: { x: 0.5, y: 0.5 }, s: { v: 0.6 }, c: [1, 1, 1] };
    });
    orbs[1].p.x = orbs[1].p.y = 1;
    let orbHide = false;
    const SIZE_BASE = { 2: [[0.1, 0.7], [0.4, 0.4]], 3: [[0.1, 0.7], [0.1, 0.1]] };
    function orbLoop(i) {
      const o = orbs[i], dr = 4 + Math.random() * 2;
      const m = state.mode === 3 ? 3 : 2;
      let x, y;
      if (i === 0) { x = state.mode <= 2 ? Math.random() * 0.8 : Math.random(); y = Math.random(); }
      else if (state.mode <= 2) { x = 1 - Math.random() * 0.8; y = Math.random(); }
      else { x = 1 - Math.random() * 0.5; y = Math.random() * 0.5; }
      let size = SIZE_BASE[m][i][0] + Math.random() * SIZE_BASE[m][i][1];
      if (orbHide) { size = 0.7; y = 0; }
      gsap.to(o.s, { v: size, duration: dr, ease: "power1.out" });
      gsap.to(o.p, { x, y, duration: dr, ease: "power1.out", onComplete: () => orbLoop(i) });
    }
    function orbColors(key) {
      const list = LIST[key], ids = PLANE_IDS[key] || PLANE_IDS.co;
      orbs.forEach((o, i) => {
        const t = list[ids[i]], cur = { r: o.c[0], g: o.c[1], b: o.c[2] };
        gsap.to(cur, { r: t[0], g: t[1], b: t[2], duration: reduce ? 0 : 1, ease: "power1.out", onUpdate: () => { o.c = [cur.r, cur.g, cur.b]; } });
      });
    }
    function orbForce() {
      orbs.forEach((o) => { gsap.killTweensOf(o.p); gsap.killTweensOf(o.s); });
      gsap.to(orbs[0].s, { v: 0.5, duration: 0.7, ease: "power1.out" });
      gsap.to(orbs[1].s, { v: 0.1, duration: 0.7, ease: "power1.out" });
      gsap.to(orbs[0].p, { x: 0, y: 0, duration: 0.7, ease: "power1.out" });
      gsap.to(orbs[1].p, { x: 1, y: 0, duration: 0.7, ease: "power1.out" });
      gsap.delayedCall(2.6, () => { orbLoop(0); orbLoop(1); });
    }

    // ③ Bokeh particles — bake our drawings (blurred circle · crisp circle) onto a canvas
    const disc = (soft) => {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      const g = c.getContext("2d");
      const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      const w = C.white.map((v) => Math.round(v * 255)).join(",");
      grd.addColorStop(0, `rgba(${w},1)`);
      grd.addColorStop(soft ? 0.25 : 0.82, `rgba(${w},${soft ? 0.75 : 0.9})`);
      grd.addColorStop(1, `rgba(${w},0)`);
      g.fillStyle = grd;
      g.fillRect(0, 0, 128, 128);
      const t = new THREE.CanvasTexture(c);
      return t;
    };
    const texSoft = disc(true), texSolid = disc(false);
    const AMOUNTS = [20, 40, 60, 20, 20, 40], OPAC = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4];
    const groups = AMOUNTS.map((amount, gi) => {
      const p = new Float32Array(amount * 3);
      const pts = [];
      for (let j = 0; j < amount; j++) {
        const x = (Math.random() * 4 - 2) * 25, y = (Math.random() * 1.5 - 0.75) * 25, z = 930 + Math.random() * 50;
        pts.push({ x, y, z, tx: x, ty: y, vx: 0, vy: 0, cnt: Math.random() * 100, speed: 2 + Math.random() * 4, memoY: y });
        p.set([x, y, z], j * 3);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(p, 3));
      const mat = new THREE.PointsMaterial({ size: 21, map: gi < 2 ? texSoft : texSolid, depthTest: false, depthWrite: false, transparent: true, opacity: OPAC[gi] });
      const pm = new THREE.Points(g, mat);
      scene.add(pm);
      return { g, mat, pts, opacity: OPAC[gi] };
    });
    let changing = false, navSpread = false;
    const showParticles = (on) => groups.forEach((g) => { g.mat.opacity = on ? g.opacity : 0; });
    function spread(nav) {
      changing = true;
      navSpread = nav;
      const xr = sw / 38, yr = sh / 38;
      groups.forEach((g) => g.pts.forEach((pt) => {
        let x = Math.random() * xr - xr / 2, y = Math.random() * yr - yr / 2;
        if (!nav && x < -xr / 4 && y > yr / 4) { x = xr / 2 + (Math.random() * xr) / 2; y = yr / 2 + (Math.random() * yr) / 2; }
        if (nav) { if (sw >= BP) x += 10; else y -= 3; }
        const z = 930 + Math.random() * 50;
        gsap.killTweensOf(pt);
        gsap.to(pt, { x, y, z, duration: 2.2 + Math.random(), delay: Math.random() * 0.1, ease: "quad.out", onStart: () => { pt.tx = x; pt.ty = y; } });
      }));
      gsap.killTweensOf(endChange);
      gsap.delayedCall(3.3, endChange);
    }
    function endChange() { changing = false; }
    function memorize() { changing = true; groups.forEach((g) => g.pts.forEach((pt) => { pt.memoY = pt.ty; })); }
    function setSize() {
      const size = sw >= BP ? 21 : (20 * sw) / BP;
      groups.forEach((g) => { g.mat.size = size; g.mat.needsUpdate = true; });
    }

    function setMode(m, force) {
      if (!force && m === state.mode) return;
      const past = state.mode;
      state.mode = m;
      const key = state.menu ? (site === "iwai" ? "iwai" : "menuCo") : m === 3 ? "footer" : site === "iwai" ? "iwai" : "co";
      const patKey = key === "iwai" && state.pageTop && !state.menu ? "iwaiTop" : key;
      paint(key, patKey);
      orbColors(key);
      if (m === 3 && !state.menu) orbForce();
      if (!(past === 3 && m === 2)) { if (m === 2) spread(false); }
      else changing = false;
      if (m === 3) memorize();
      if (state.menu) showParticles(site !== "iwai");
      else showParticles(site === "iwai" ? m === 3 : true);
    }
    function setPageTop(top) {
      if (site !== "iwai" || page === "home" || top === state.pageTop) return;
      state.pageTop = top;
      orbHide = top;
      if (state.mode !== 3 && !state.menu) paint("iwai", top ? "iwaiTop" : "iwai");
    }

    function resize() {
      sw = innerWidth; sh = innerHeight;
      canvas.style.top = canvas.style.left = `-${INFLATE / 2}px`;
      camera.aspect = sw / sh;
      camera.updateProjectionMatrix();
      renderer.setSize(sw + INFLATE, sh + INFLATE);
      const ratio = sw / sh;
      const s = ratio > 1.69 ? ratio / 1.69 : 1;
      mesh.scale.set(s, s, 1);
      const ps = ratio < 1400 / 787 ? 1.1 : ratio / 1.69;
      orbs.forEach((o) => { o.mesh.scale.set(ps, ps, 1); o.u.resolution.value.set(sw, sh); });
      setSize();
    }

    const footer = document.querySelector(site === "iwai" ? ".crz-venue-foot" : ".crz-footer") || document.querySelector(".crz-footer");
    function frame() {
      if (!state.menu && footer) {
        const top = footer.getBoundingClientRect().top;
        const target = site === "iwai" ? -150 : sh - 150;
        if (top < target) { state.footerScroll = target - top; setMode(3); }
        else setMode(2);
        if (page !== "home") setPageTop(scrollY <= 50);
      }
      for (const d of drift) {
        d.x += d.vx; d.y += d.vy;
        if (d.x >= d.ox + range || d.x <= d.ox - range) d.vx *= -1;
        if (d.y >= d.oy + range || d.y <= d.oy - range) d.vy *= -1;
        pos[d.id * 3] = d.x; pos[d.id * 3 + 1] = d.y;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
      orbs.forEach((o) => { o.u.point.value.set(o.p.x, o.p.y); o.u.size.value = o.s.v; o.u.color.value.set(o.c[0], o.c[1], o.c[2]); });

      if (state.mode === 3 && !navSpread) {
        if (state.footerScroll > 0) {
          const ratio = sw >= BP ? (sw / sh > 0.8 ? (site === "iwai" ? 15 : 16) : site === "iwai" ? 0.1 : 16) : site === "iwai" ? 50 : 18;
          state.inputFooterScroll += (state.footerScroll / ratio - state.inputFooterScroll) / 35;
          groups.forEach((g) => g.pts.forEach((pt) => { pt.y = pt.memoY + state.inputFooterScroll; }));
        }
      } else state.inputFooterScroll = 0;
      groups.forEach((g) => {
        const a = g.g.attributes.position;
        g.pts.forEach((pt, j) => {
          pt.cnt += pt.speed;
          if (!changing) pt.ty += Math.cos((pt.cnt * Math.PI) / 180) * 0.03;
          if (state.mode !== 3) {
            pt.vx = (pt.vx + (pt.tx - pt.x) * 0.01) * 0.78;
            pt.vy = (pt.vy + (pt.ty - pt.y) * 0.01) * 0.78;
            pt.x += pt.vx; pt.y += pt.vy;
          }
          a.setXYZ(j, pt.x, pt.y, pt.z);
        });
        a.needsUpdate = true;
      });
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      if (!reduce) requestAnimationFrame(frame);
    }

    resize();
    addEventListener("resize", resize);
    paint(firstKey, site === "iwai" && scrollY <= 50 && page !== "home" ? "iwaiTop" : firstKey);
    state.pageTop = site === "iwai" && scrollY <= 50 && page !== "home";
    orbHide = state.pageTop;
    orbColors(firstKey);
    orbLoop(0); orbLoop(1);
    showParticles(site !== "iwai");
    renderer.compile(scene, camera);
    requestAnimationFrame(frame);
    sessionStorage.setItem("crz-from-site", site);

    return {
      openMenu(key) {
        state.menu = true;
        const k = key === "iwai" ? "iwai" : "menuCo";
        paint(k); orbColors(k);
        showParticles(k !== "iwai");
        spread(true);
      },
      switchMenu(key) { const k = key === "iwai" ? "iwai" : "menuCo"; paint(k); orbColors(k); showParticles(k !== "iwai"); },
      closeMenu() { state.menu = false; navSpread = false; setMode(state.mode, true); },
    };
  }

  // ───────── Page transition: the body shrinks to .96 scale and vanishes (0.95s) and returns on the next page in 900ms ─────────
  const lBody = document.querySelector(".crz-body");
  if (lBody && sessionStorage.getItem("crz-leaving") === "1" && !reduce) {
    root.classList.add("crz-enter");
    lBody.classList.add("is-hide");
    // The original (pjax) reverts after the new body has fully arrived — the copy, which opens a fresh document, starts 900ms after load
    const reveal = () => requestAnimationFrame(() => requestAnimationFrame(() => {
      root.classList.remove("crz-enter");
      lBody.classList.remove("is-hide");
    }));
    if (document.readyState === "complete") reveal();
    else addEventListener("load", reveal, { once: true });
  }
  sessionStorage.removeItem("crz-leaving");
  const isInner = (a) => {
    const href = a.getAttribute("href");
    return href && !href.startsWith("#") && !a.target && /\.html(#.*)?$/.test(href);
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a || !isInner(a) || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    const href = a.getAttribute("href");
    if (menu.open) closeMenu(true);
    sessionStorage.setItem("crz-leaving", "1");
    // In the original, it takes 140 to 180ms from pjax receiving the press until it calls contentsOut
    const lag = reduce ? 0 : 60;
    setTimeout(() => lBody?.classList.add("is-hide"), lag);
    setTimeout(() => { location.href = href; }, reduce ? 0 : lag + 950);
  });

  // ───────── Menu drawer ─────────
  const btn = document.querySelector(".crz-menu-btn");
  const header = document.querySelector(".crz-header");
  const nav = document.querySelector(".crz-nav");
  const sw = nav?.querySelector(".crz-nav__wheel");
  const wheelBtns = sw ? [...sw.querySelectorAll("button")] : [];
  const menu = { open: false, lock: false, current: site === "iwai" ? "iwai" : "co", roll: { v: 0 } };
  // Places the discs on an arc — the farther from center, the more they spread up and down and shift right
  function layWheel() {
    const narrow = innerWidth < BP;
    wheelBtns.forEach((b, i) => {
      const d = i - menu.roll.v;
      const a = d * 0.42;
      const x = narrow ? Math.sin(a) * 150 : (1 - Math.cos(a)) * 120;
      const y = narrow ? (1 - Math.cos(a)) * 30 : Math.sin(a) * 260;
      b.style.transform = `translate(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${y.toFixed(1)}px))`;
      b.style.opacity = String(Math.max(0, 1 - Math.abs(d) * 0.18));
    });
  }
  function showNav(key) {
    menu.current = key;
    nav.querySelectorAll(".crz-nav__item").forEach((it) => it.classList.toggle("is-current", it.dataset.navi === key));
    const at = wheelBtns.findIndex((b) => b.dataset.navi === key);
    wheelBtns.forEach((b, i) => { b.classList.toggle("is-current", i === at); b.setAttribute("aria-selected", String(i === at)); });
    if (at >= 0) gsap.to(menu.roll, { v: at, duration: reduce ? 0 : 1, ease: "quart.out", onUpdate: layWheel });
  }
  function openMenu() {
    menu.open = true;
    btn.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    header.classList.add("is-menu-open");
    body.classList.add("is-menu-open");
    lBody?.classList.add("is-hide");
    root.style.overflow = "hidden";
    nav.classList.add("is-open");
    showNav(site === "iwai" ? "iwai" : "co");
    if (sw) gsap.fromTo(sw, { opacity: 0, x: 100 }, { opacity: 1, x: 0, delay: 0.3, duration: 0.7, ease: "quart.out" });
    gsap.delayedCall(reduce ? 0 : 0.2, () => nav.classList.add("is-show"));
    gl?.openMenu(menu.current);
  }
  function closeMenu(leaving) {
    menu.open = false;
    btn.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    header.classList.remove("is-menu-open");
    body.classList.remove("is-menu-open");
    if (!leaving) lBody?.classList.remove("is-hide");
    nav.classList.remove("is-show");
    root.style.overflow = "";
    if (sw) gsap.to(sw, { opacity: 0, x: 100, duration: 0.7, ease: "quart.out" });
    gsap.delayedCall(0.6, () => { if (!menu.open) nav.classList.remove("is-open"); });
    gl?.closeMenu();
  }
  if (btn && nav) {
    btn.addEventListener("click", () => {
      if (menu.lock) return;
      menu.lock = true;
      gsap.delayedCall(1, () => { menu.lock = false; });
      menu.open ? closeMenu() : openMenu();
    });
    wheelBtns.forEach((b) => b.addEventListener("click", () => { if (b.disabled) return; showNav(b.dataset.navi); gl?.switchMenu(b.dataset.navi); }));
    menu.roll.v = Math.max(0, wheelBtns.findIndex((b) => b.dataset.navi === menu.current));
    layWheel();
    addEventListener("resize", layWheel);
    addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.open) closeMenu(); });
  }

  // ───────── Venue section: the reservation button hides when it reaches the very bottom (venue footer), pair slider (Swiper 5 · loop · 600ms) ─────────
  const reserve = document.querySelector(".crz-reserve");
  const vfoot = document.querySelector(".crz-venue-foot");
  if (reserve && vfoot) {
    const io = new IntersectionObserver(([en]) => reserve.classList.toggle("is-off", en.isIntersecting));
    io.observe(vfoot);
  }
  document.querySelectorAll(".crz-fair .swiper-container").forEach((el) => {
    if (!window.Swiper) return;
    const wrap = el.closest(".crz-fair");
    new Swiper(el, {
      slidesPerView: 1, spaceBetween: 20, loop: true, loopedSlides: el.querySelectorAll(".swiper-slide").length, speed: 600,
      navigation: { nextEl: wrap.querySelector(".crz-fair__next"), prevEl: wrap.querySelector(".crz-fair__prev") },
      breakpoints: { 721: { spaceBetween: 80 } },
    });
  });
})();
