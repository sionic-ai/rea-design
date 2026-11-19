// About — chrome ribbon (spiral-twisted band, approaches on scroll), portrait (light enters from the cursor side and the face panel tilts — original uPointer), sandstorm particles.
(() => {
  if (!window.THREE) return;
  const T = THREE;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const C = { night: new T.Color(css("--kf-contrast-bg")), paper: new T.Color(css("--kf-contrast-ink")), accent: new T.Color(css("--kf-accent")), soft: new T.Color(css("--kf-accent-soft")), ink: new T.Color(css("--kf-ink")), dim: new T.Color(css("--kf-dim")) };
  const env = (renderer) => {
    const room = new T.Scene();
    room.background = C.night.clone().multiplyScalar(0.5);
    [[C.paper, 7, 0, 8, 2], [C.soft, 5, 8, 1, -3], [C.dim, 6, -8, 2, 4]].forEach(([c, s, x, y, z]) => { const m = new T.Mesh(new T.PlaneGeometry(s, s), new T.MeshBasicMaterial({ color: c.clone().multiplyScalar(2.2), side: T.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); room.add(m); });
    const pm = new T.PMREMGenerator(renderer);
    const t = pm.fromScene(room, 0.04).texture;
    pm.dispose();
    return t;
  };
  const visible = (el) => { const s = { on: false }; new IntersectionObserver(([e]) => { s.on = e.isIntersecting; }).observe(el); return s; };

  // Chrome ribbon — a band that circles a torus three times with twists (using our own vertices, without ParametricGeometry)
  const hero = document.querySelector(".ap-aboutp__hero");
  const rc = hero?.querySelector(".ap-aboutp__ribbon");
  if (rc) {
    const renderer = new T.WebGLRenderer({ canvas: rc, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.toneMapping = T.ACESFilmicToneMapping;
    const scene = new T.Scene();
    scene.environment = env(renderer);
    const cam = new T.PerspectiveCamera(38, 1, 0.1, 100);
    const U = 360, V = 24, pos = [], idx = [];
    for (let i = 0; i <= U; i++) {
      const u = (i / U) * Math.PI * 2, R = 2.4 + Math.sin(u * 2) * 0.25, tw = u * 1.5;
      const cx = Math.cos(u) * R, cy = Math.sin(u) * R * 0.92, cz = Math.sin(u * 3) * 0.5;
      for (let j = 0; j <= V; j++) {
        const v = (j / V - 0.5) * 1.6;
        const nx = Math.cos(u) * Math.cos(tw), ny = Math.sin(u) * Math.cos(tw), nz = Math.sin(tw);
        pos.push(cx + nx * v, cy + ny * v, cz + nz * v);
      }
    }
    for (let i = 0; i < U; i++) for (let j = 0; j < V; j++) { const a = i * (V + 1) + j, b = a + V + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const ribbon = new T.Mesh(geo, new T.MeshStandardMaterial({ color: C.paper, metalness: 1, roughness: 0.16, side: T.DoubleSide }));
    scene.add(ribbon, new T.DirectionalLight(C.soft, 1.4));
    const st = { p: 0 };
    ScrollTrigger.create({ trigger: hero, start: "top top", end: "bottom bottom", scrub: reduce ? false : 0.6, onUpdate: (s) => { st.p = s.progress; } });
    const resize = () => { renderer.setSize(rc.clientWidth, rc.clientHeight, false); cam.aspect = rc.clientWidth / Math.max(1, rc.clientHeight); cam.updateProjectionMatrix(); };
    new ResizeObserver(resize).observe(rc);
    resize();
    renderer.compile(scene, cam);
    const v = visible(hero);
    // Pause pill — pressing it stops the ribbon drawing and the label becomes ”Resume motion ▶”
    let still = false;
    const motion = hero.querySelector(".ap-aboutp__motion");
    motion?.addEventListener("click", () => {
      still = !still;
      motion.setAttribute("aria-pressed", String(still));
      motion.innerHTML = still ? 'Resume motion <span aria-hidden="true">▶</span>' : 'Pause motion <span aria-hidden="true">Ⅱ</span>';
    });
    // The line below the hero disappears within 15% of the hero scroll (original m = U/.15), the pause pill switches over as the Hero ends
    // The section-name row disappears with the pill at the end of the Hero only on phones and touch tablets, and on wide screens it passes along with the stage
    const foot = hero.querySelector(".ap-aboutp__foot"), track = hero.querySelector(".ap-aboutp__track");
    const small = () => innerWidth <= 760 || (matchMedia("(any-pointer: coarse)").matches && Math.min(innerWidth, innerHeight) <= 1024);
    const fadeOut = () => {
      const r = hero.getBoundingClientRect(), span = Math.max(1, hero.offsetHeight - innerHeight);
      const m = Math.min(1, Math.max(0, -r.top / span / 0.15)), end = 1 - Math.min(1, Math.max(0, (-r.top - span) / (innerHeight * 0.3)));
      if (foot) gsap.set(foot, { autoAlpha: 1 - m });
      if (track) gsap.set(track, { autoAlpha: small() ? end : 1 });
      if (motion) gsap.set(motion, { autoAlpha: end });
    };
    if (!reduce) { addEventListener("scroll", fadeOut, { passive: true }); fadeOut(); }
    gsap.ticker.add(() => {
      if (!v.on || still) return;
      const p = st.p;
      // In portrait the ribbon comes in whole at upper center, like the original (.85 of width)
      const tall = rc.clientWidth < rc.clientHeight;
      cam.position.set(tall ? -p * 0.6 : 2.6 - p * 1.2, 0.3, tall ? 19.6 - p * 9 : 11 - p * 6.5);
      cam.lookAt(tall ? 0 : 2.2 - p * 0.6, 0, 0);
      ribbon.rotation.set(0.35 + p * 0.5, p * 1.2, -0.2);
      ribbon.position.set(tall ? 0 : 2.4, tall ? 2.4 : 0, 0);
      renderer.render(scene, cam);
    });
  }

  // Portrait — person slot (our own shader drawing head·shoulder silhouettes as a distance field). When the cursor is over the panel, light comes in from that side and the panel tilts 4° (.08 follow)
  const team = document.querySelector(".ap-team");
  const pc = team?.querySelector(".ap-team__portrait");
  if (pc) {
    const renderer = new T.WebGLRenderer({ canvas: pc, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    const scene = new T.Scene();
    const cam = new T.PerspectiveCamera(30, 1, 0.1, 20);
    cam.position.z = 5;
    const mat = new T.ShaderMaterial({
      transparent: true,
      uniforms: { uPointer: { value: new T.Vector2(0.5, 0.5) }, uLit: { value: 0 }, uSeed: { value: 0 }, uSkin: { value: C.dim.clone().lerp(C.paper, 0.35) }, uSuit: { value: C.night.clone().multiplyScalar(0.7) }, uKey: { value: C.soft } },
      vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader: `uniform vec2 uPointer;uniform float uLit,uSeed;uniform vec3 uSkin,uSuit,uKey;varying vec2 vUv;
        float sdE(vec2 p,vec2 r){float k=length(p/r);return (k-1.)*min(r.x,r.y);}
        void main(){vec2 p=vUv-vec2(.5,0.);p.x+=sin(uSeed)*.01;
          float head=sdE(p-vec2(0.,.66),vec2(.13,.17));float neck=sdE(p-vec2(0.,.47),vec2(.07,.1));float body=sdE(p-vec2(0.,.08),vec2(.42,.36));
          float d=min(min(head,neck),body);if(d>0.)discard;
          float h=clamp(-d*8.,0.,1.);vec3 n=normalize(vec3(-dFdx(h)*40.,-dFdy(h)*40.,1.));
          vec3 L=normalize(vec3((uPointer-vec2(.5,.5))*vec2(2.2,1.6),.9));float dif=max(dot(n,L),0.);
          vec3 base=head<0.||neck<0.?uSkin:uSuit;vec3 col=base*(.35+.65*dif)+uKey*pow(dif,12.)*.35*uLit;
          float edge=smoothstep(0.,.01,-d);gl_FragColor=vec4(col,edge);}`,
    });
    const plane = new T.Mesh(new T.PlaneGeometry(2.6, 3.7), mat);
    scene.add(plane);
    const target = new T.Vector2(0.5, 0.5);
    let lit = 0;
    team.addEventListener("pointermove", (e) => {
      const r = pc.getBoundingClientRect();
      target.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
      lit = 1;
    });
    team.addEventListener("pointerleave", () => { target.set(0.5, 0.5); lit = 0; });
    const resize = () => { renderer.setSize(pc.clientWidth, pc.clientHeight, false); cam.aspect = pc.clientWidth / Math.max(1, pc.clientHeight); cam.updateProjectionMatrix(); };
    new ResizeObserver(resize).observe(pc);
    resize();
    renderer.compile(scene, cam);
    const v = visible(team);
    gsap.ticker.add(() => {
      if (!v.on) return;
      const u = mat.uniforms;
      u.uPointer.value.lerp(target, reduce ? 1 : 0.08);
      u.uLit.value += (lit - u.uLit.value) * 0.08;
      plane.rotation.y = (u.uPointer.value.x - 0.5) * 0.14;
      plane.rotation.x = -(u.uPointer.value.y - 0.5) * 0.1;
      renderer.render(scene, cam);
    });
    // Flip people
    const people = [...team.querySelectorAll(".ap-team__person")];
    const now = team.querySelector(".ap-team__now");
    let cur = 0;
    const go = (d) => {
      cur = (cur + d + people.length) % people.length;
      people.forEach((p, i) => p.classList.toggle("is-on", i === cur));
      now.textContent = String(cur + 1).padStart(2, "0");
      gsap.fromTo(mat.uniforms.uSeed, { value: cur * 2 }, { value: cur * 2 + 1, duration: 0.6, ease: "power3.out" });
      gsap.fromTo(plane.material, { opacity: 0 }, { opacity: 1, duration: 0.6 });
    };
    team.querySelector(".ap-team__prev").addEventListener("click", () => go(-1));
    team.querySelector(".ap-team__next").addEventListener("click", () => go(1));
  }

  // Sandstorm — dots pouring down from the top right, swirling
  const sand = document.querySelector(".ap-sand");
  const dc = sand?.querySelector(".ap-sand__dust");
  if (dc) {
    const renderer = new T.WebGLRenderer({ canvas: dc, antialias: false, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    const scene = new T.Scene();
    const cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 2);
    const N = 9000, seed = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) seed.set([Math.random(), Math.random(), Math.random()], i * 3);
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.BufferAttribute(new Float32Array(N * 3), 3));
    geo.setAttribute("aSeed", new T.BufferAttribute(seed, 3));
    const mat = new T.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uTime: { value: 0 }, uAsp: { value: 1 }, uColor: { value: C.ink.clone().lerp(C.dim, 0.3) }, uPx: { value: renderer.getPixelRatio() } },
      vertexShader: `uniform float uTime,uAsp,uPx;attribute vec3 aSeed;varying float vA;
        void main(){float life=fract(aSeed.x+uTime*(.035+aSeed.y*.03));
          vec2 top=vec2(.55,1.15);vec2 bot=vec2(.05+aSeed.z*.3,-.1);
          vec2 p=mix(top,bot,life);float sw=sin(life*9.+aSeed.y*6.28)*(.08+life*.25)*(.5+aSeed.z);p.x+=sw;p.y+=cos(life*7.+aSeed.z*6.28)*.04;
          p.x+= (aSeed.y-.5)*.12*(1.-life);
          gl_Position=vec4(p.x*2.-1.,p.y*2.-1.,0.,1.);gl_PointSize=(1.+aSeed.z*2.6)*uPx;vA=smoothstep(0.,.1,life)*(1.-smoothstep(.8,1.,life))*.75;}`,
      fragmentShader: `uniform vec3 uColor;varying float vA;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(uColor,vA*(1.-d*1.6));}`,
    });
    scene.add(new T.Points(geo, mat));
    const resize = () => renderer.setSize(dc.clientWidth, dc.clientHeight, false);
    new ResizeObserver(resize).observe(dc);
    resize();
    renderer.compile(scene, cam);
    const v = visible(sand);
    let paused = reduce, clock = 0, last = performance.now();
    const btn = sand.querySelector(".ap-sand__pause");
    btn?.addEventListener("click", () => { paused = !paused; btn.textContent = paused ? "Play motion ▷" : "Pause motion Ⅱ"; });
    gsap.ticker.add(() => {
      const n = performance.now(), dt = Math.max(0, Math.min(0.05, (n - last) / 1000));
      last = n;
      if (!v.on) return;
      if (!paused) clock += dt;
      mat.uniforms.uTime.value = clock;
      renderer.render(scene, cam);
    });
  }
})();

// Specialty expand — only one opens at a time, and the height shrinks in .25s when collapsing
(() => {
  const items = [...document.querySelectorAll(".ap-expertise__list details")];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  items.forEach((d) => d.querySelector("summary").addEventListener("click", (e) => {
    e.preventDefault();
    const close = (el) => {
      if (!el.open) return;
      if (reduce) { el.open = false; return; }
      const from = el.offsetHeight, to = el.querySelector("summary").offsetHeight;
      el.animate({ height: [`${from}px`, `${to}px`] }, { duration: 250, easing: "ease" }).onfinish = () => { el.open = false; };
    };
    if (d.open) { close(d); return; }
    items.forEach((o) => o !== d && close(o));
    d.open = true;
    if (!reduce) { const to = d.offsetHeight, from = d.querySelector("summary").offsetHeight; d.animate({ height: [`${from}px`, `${to}px`] }, { duration: 250, easing: "ease" }); }
  }));
})();

// Tech carousel — per cell, computes size .78→1, opacity .48→1 and number on-state on the fly from the distance to the carousel center (no transition).
// Dragging more than 6px with the mouse makes the panel follow the hand, and on release it slides over 1.05s power3.out to the nearest cell from the spot reached by going last velocity × 180px further.
// When the chosen cell changes, the description line rises away in .14s and stands back up in .4s. With the scroll through the section, the panel drifts on its own up to 2.4× the spacing between cells,
// After a manual swipe it won’t push itself along until you scroll vertically or press outside the panel. Line pattern behind (2D) — 32 Bezier lines·9 ellipses lean 24·16px toward the cursor (.65s), scroll phase 2.4
(() => {
  const root = document.querySelector(".ap-tech");
  if (!root || !window.gsap) return;
  const rail = root.querySelector(".ap-tech__rail"), gallery = root.querySelector(".ap-tech__gallery");
  const btns = [...rail.querySelectorAll("button")];
  const cat = root.querySelector(".ap-tech__cat"), count = root.querySelector(".ap-tech__count");
  const role = root.querySelector(".ap-tech__role"), desc = root.querySelector(".ap-tech__desc"), sel = root.querySelector(".ap-tech__selection");
  const prev = root.querySelector(".ap-tech__prev"), next = root.querySelector(".ap-tech__next");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const phone = () => innerWidth <= 760 || (matchMedia("(any-pointer: coarse)").matches && Math.min(innerWidth, innerHeight) <= 1024);
  const pos = { x: 0 };
  let centers = [], maxScroll = 0, target = 0, now = -1, mode = "idle", manual = false, auto = 0, bias = 0, drag = null, touch = null, dragged = false, idle = 0, selTl = null;
  const clampX = (x) => Math.max(0, Math.min(maxScroll, x));
  const step = () => centers[1] - centers[0] || 1;
  const centerOf = (i) => centers[Math.max(0, Math.min(btns.length - 1, i))] || 0;
  const field = { x: 0, y: 0, scroll: 0 };
  let drawField = () => {};

  const showText = (i) => {
    const b = btns[i];
    const put = () => { cat.textContent = b.dataset.cat; role.textContent = b.dataset.role; desc.textContent = b.dataset.desc; };
    selTl?.kill();
    if (reduce) { put(); return; }
    selTl = gsap.timeline().to(sel, { opacity: 0, y: -4, duration: 0.14, ease: "power1.in" }).call(put).set(sel, { y: 6 }).to(sel, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
  };
  const paint = () => {
    const x = rail.scrollLeft;
    let best = 0;
    btns.forEach((b, i) => {
      const f0 = Math.max(0, 1 - Math.abs(x - centerOf(i)) / step()), f = f0 * f0 * (3 - 2 * f0);
      b.style.setProperty("--card-scale", String(0.78 + 0.22 * f));
      b.style.setProperty("--card-alpha", String(0.48 + 0.52 * f));
      b.style.setProperty("--card-focus", String(f));
      if (Math.abs(x - centerOf(i)) < Math.abs(x - centerOf(best))) best = i;
    });
    if (best !== now) {
      const first = now < 0;
      now = best;
      btns.forEach((b, i) => b.setAttribute("aria-pressed", String(i === now)));
      count.textContent = `${String(now + 1).padStart(2, "0")} / ${String(btns.length).padStart(2, "0")}`;
      if (!first) showText(now);
    }
    prev.disabled = target < 1;
    next.disabled = target > maxScroll - 1;
    root.style.setProperty("--tech-progress", String(maxScroll ? x / maxScroll : 0));
    field.phase = x / step();
    drawField();
  };
  const glide = gsap.quickTo(pos, "x", { duration: 1.05, ease: "power3.out", onUpdate() { rail.scrollLeft = pos.x; paint(); }, onComplete() { mode = "idle"; } });
  const go = (x, byHand = false) => {
    target = clampX(x);
    if (byHand) { manual = true; bias = target - auto; }
    clearTimeout(idle);
    if (reduce) { glide.tween.pause(); pos.x = target; rail.scrollLeft = target; paint(); return; }
    mode = "glide";
    glide(target);
    paint();
  };
  const pick = (i) => go(centerOf(i), true);
  const nearest = () => Math.round(target / step());
  const toNative = () => { manual = true; glide.tween.pause(); pos.x = rail.scrollLeft; mode = "native"; bias = pos.x - auto; clearTimeout(idle); };
  const settle = () => { if (!drag && mode === "native") pick(now); };

  btns.forEach((b, i) => b.addEventListener("click", (e) => { if (dragged) { e.preventDefault(); return; } pick(i); }));
  prev.addEventListener("click", () => pick(nearest() - 1));
  next.addEventListener("click", () => pick(nearest() + 1));
  rail.addEventListener("scroll", () => {
    if (mode === "glide") return;
    pos.x = rail.scrollLeft; target = pos.x; paint();
    if (mode === "native") { bias = target - auto; clearTimeout(idle); idle = setTimeout(settle, 160); }
  }, { passive: true });
  rail.addEventListener("scrollend", settle);
  rail.addEventListener("wheel", (e) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) toNative(); }, { passive: true });
  rail.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    dragged = false;
    // Finger — past 6px of horizontal movement it hands off to the panel’s own scroll, and on release it settles to the nearest slot after .18s
    if (e.pointerType !== "mouse") { touch = { x: e.clientX, y: e.clientY }; return; }
    toNative();
    drag = { id: e.pointerId, x: e.clientX, start: rail.scrollLeft, lastX: e.clientX, time: performance.now(), v: 0, moved: false };
    e.preventDefault();
  });
  rail.addEventListener("pointermove", (e) => {
    if (touch) {
      const tx = Math.abs(e.clientX - touch.x), ty = Math.abs(e.clientY - touch.y);
      if (Math.max(tx, ty) > 6) { if (tx > ty) toNative(); else manual = false; touch = null; }
    }
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, t = performance.now(), dt = Math.max(1, t - drag.time);
    drag.v = drag.v * 0.5 + ((drag.lastX - e.clientX) / dt) * 0.5;
    drag.lastX = e.clientX; drag.time = t;
    if (!drag.moved && Math.abs(dx) > 6) { drag.moved = true; rail.setPointerCapture(e.pointerId); rail.classList.add("is-dragging"); }
    if (drag.moved) { rail.scrollLeft = clampX(drag.start - dx); pos.x = rail.scrollLeft; target = pos.x; paint(); dragged = true; }
  });
  const release = (e) => {
    touch = null;
    if (!drag) { if (mode === "native") { clearTimeout(idle); idle = setTimeout(settle, 180); } return; }
    if (e.pointerId !== drag.id) return;
    const { moved, v, time } = drag;
    drag = null;
    rail.classList.remove("is-dragging");
    if (rail.hasPointerCapture(e.pointerId)) rail.releasePointerCapture(e.pointerId);
    if (!moved) { mode = "idle"; return; }
    const x = clampX(rail.scrollLeft + (performance.now() - time < 100 ? v * 180 : 0));
    pick(Math.round(x / step()));
    setTimeout(() => { dragged = false; }, 0);
  };
  rail.addEventListener("pointerup", release);
  rail.addEventListener("pointercancel", release);
  rail.addEventListener("lostpointercapture", () => { drag = null; rail.classList.remove("is-dragging"); });
  addEventListener("wheel", (e) => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) manual = false; }, { passive: true });
  addEventListener("keydown", (e) => { if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(e.key)) manual = false; });
  addEventListener("pointerdown", (e) => { if (!e.target.closest(".ap-tech__gallery")) manual = false; });

  const measure = () => {
    centers = btns.map((b) => b.parentElement.offsetLeft + b.parentElement.offsetWidth / 2 - rail.clientWidth / 2);
    maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
    pos.x = rail.scrollLeft;
    target = pos.x;
    paint();
  };
  new ResizeObserver(measure).observe(rail);
  measure();

  // Line pattern
  const cv = document.createElement("canvas");
  cv.className = "ap-tech__field";
  cv.setAttribute("aria-hidden", "true");
  gallery.prepend(cv);
  const g = cv.getContext("2d");
  let W = 0, H = 0, raf = 0;
  const draw = () => {
    raf = 0;
    g.clearRect(0, 0, W, H);
    g.strokeStyle = getComputedStyle(root).color;
    g.lineWidth = 0.7;
    const cx = W * 0.5 + field.x * 24, cy = H * 0.46 + field.y * 16, ph = (field.phase || 0) + field.scroll * 2.4;
    for (let r = 0; r < 32; r++) {
      const i = r / 31, a = (i - 0.5) * Math.min(W * 0.7, 760), s = Math.sin(i * Math.PI), c = Math.cos(ph * 0.85) * 0.35;
      g.globalAlpha = 0.11 + s * 0.1;
      g.beginPath();
      g.moveTo(cx + a * 1.1, H * 0.03);
      g.bezierCurveTo(cx + a * (0.12 + c) + Math.sin(ph * 0.8 + i * 3) * 85, cy - H * 0.32, cx + a * (0.85 - c) + Math.cos(ph + i * 4) * 90, cy + H * 0.3, cx + a * 0.68, H * 0.91);
      g.stroke();
    }
    for (let t = 0; t < 9; t++) {
      const r = t / 8;
      g.globalAlpha = 0.055 + Math.sin(r * Math.PI) * 0.055;
      g.beginPath();
      g.ellipse(cx + Math.sin(ph * 0.5 + r * 2) * 24, H * (0.15 + r * 0.64), Math.sin(r * Math.PI) * W * 0.17 + W * 0.13, 12 + Math.sin(ph + r) * 9, field.x * 0.04, 0, Math.PI * 2);
      g.stroke();
    }
    g.globalAlpha = 1;
  };
  drawField = () => { raf ||= requestAnimationFrame(draw); };
  const size = () => { const r = gallery.getBoundingClientRect(), d = Math.min(devicePixelRatio, 1.5); W = r.width; H = r.height; cv.width = Math.round(W * d); cv.height = Math.round(H * d); g.setTransform(d, 0, 0, d, 0, 0); draw(); };
  new ResizeObserver(size).observe(gallery);
  size();

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Phone · touch tablet — heading · panel · button · foot each rise once from 20px below in .7s
    if (phone()) {
      [".ap-tech__heading", ".ap-tech__gallery", ".ap-tech__controls", ".ap-tech__foot"].forEach((s) => {
        const el = root.querySelector(s);
        gsap.from(el, { y: 20, opacity: 0, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 93%", once: true } });
      });
      return;
    }
    gallery.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const r = gallery.getBoundingClientRect();
      gsap.to(field, { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5, duration: 0.65, overwrite: "auto", onUpdate: drawField });
    }, { passive: true });
    gallery.addEventListener("pointerleave", () => gsap.to(field, { x: 0, y: 0, duration: 1, overwrite: "auto", onUpdate: drawField }));
    gsap.to(field, { scroll: 1, ease: "none", onUpdate: drawField, scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: 0.45 } });
    gsap.timeline({ scrollTrigger: { trigger: gallery, start: "top 95%", end: "top 38%", scrub: 0.45, invalidateOnRefresh: true } })
      .fromTo(cv, { scale: 1.08, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: "power2.out" }, 0)
      .fromTo(root.querySelector(".ap-tech__toolbar"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6 }, 0.12)
      .fromTo(rail, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, 0.15);
    [".ap-tech__selection", ".ap-tech__controls", ".ap-tech__foot"].forEach((s) => {
      const el = root.querySelector(s), parts = s === ".ap-tech__selection" ? [...el.children] : [el];
      gsap.fromTo(parts, { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 96%", end: "top 72%", scrub: 0.45 } });
    });
    ScrollTrigger.create({
      trigger: gallery, start: "top 75%", end: "bottom 25%", scrub: true,
      onUpdate: (st) => {
        auto = st.progress * Math.min(maxScroll, step() * 2.4);
        if (drag || mode === "native") return;
        if (manual) { bias = target - auto; return; }
        go(auto + bias);
      },
    });
  });
})();
