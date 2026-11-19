// Home page — loader (percent follows at .06 steps → clears in .4s) → hole opens (shape-hole-hero) → .4s later the Hero copy (pixel-chars).
// 3D mosaic: six photo panels and one rock sit in fog (5~85), and as you scroll from the Hero to the end of the mosaic section the panel group approaches the camera by the depth amount.
// A panel spreads outward from its place by approach distance × .1 (follow .05), blurs once within camera 10, and bends barrel-like by scroll speed × 100.
(() => {
  const PD = window.PD;
  const T = window.THREE;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(pointer: coarse)").matches;
  const $ = (s) => document.querySelector(s);
  const CFG = {
    camera: { fov: 50, z: 5 }, fog: [5, 85], parallax: { delay: 0.1, lerp: 0.05 }, fade: [10, 0], barrel: touch ? 25 : 100, velLerp: 0.2,
    videos: [[8, -2, -40], [-8, 1, -55], [0, -2, -65]], images: [[-4, -5, -18], [-10, -0.5, -30], [3, 2, -45]],
    rock: { pos: [-1, 7, -53], rot: [-4.3, 0, 3], rotLerp: 0.4, yLerp: 0.8, scroll: 8 },
    light: { speed: 0.77, amp: 1.2, z: 0.58, ambient: 0.2, point: 6, decay: 0.5 },
  };

  // Placeholder image, plate color comes from the skin, what goes in is given by the label
  const placeholder = (label, w, h) => {
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const g = cv.getContext("2d"), [fr, fg, fb] = PD.rgb("--site-stage-fill"), [lr, lg, lb] = PD.rgb("--site-stage-line"), [ir, ig, ib] = PD.rgb("--kf-ink");
    g.fillStyle = `rgb(${fr},${fg},${fb})`; g.fillRect(0, 0, w, h);
    g.strokeStyle = `rgb(${lr},${lg},${lb})`; g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
    g.fillStyle = `rgb(${ir},${ig},${ib})`; g.font = `500 ${Math.round(h / 22)}px ${getComputedStyle(document.body).getPropertyValue("--wf-mono") || "monospace"}`;
    g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(label, w / 2, h / 2);
    return cv;
  };

  // Our rock — a flat stone slab (where the original GLB model was). An icosahedron pushed bumpy with noise and flattened vertically to .45
  const rockGeometry = (r = 1) => {
    const geo = new T.SphereGeometry(r, 96, 64), p = geo.attributes.position, v = new T.Vector3();
    const n3 = (x, y, z) => Math.sin(x * 2.1 + Math.sin(y * 1.7)) * 0.5 + Math.sin(y * 3.3 + z * 1.3) * 0.3 + Math.sin(z * 4.7 + x * 2.9) * 0.2;
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const k = 1 + n3(v.x, v.y, v.z) * 0.12;
      v.multiplyScalar(k); v.y *= 0.45;
      p.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  };
  const rockMaterial = () => { const [r, g, b] = PD.rgb("--site-rock"); return new T.MeshStandardMaterial({ color: new T.Color(r / 255, g / 255, b / 255), roughness: 0.92, metalness: 0, flatShading: false }); };

  // ───── 3D mosaic
  let stage = null;
  const buildStage = () => {
    const canvas = $(".pd-stage__canvas");
    if (!canvas || !T) return null;
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false }); } catch { return null; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    const [br, bg, bb] = PD.rgb("--kf-bg");
    const bgc = new T.Color(br / 255, bg / 255, bb / 255);
    renderer.setClearColor(bgc, 1);
    const scene = new T.Scene();
    scene.fog = new T.Fog(bgc, CFG.fog[0], CFG.fog[1]);
    const camera = new T.PerspectiveCamera(CFG.camera.fov, innerWidth / innerHeight, 0.1, 200);
    camera.position.set(0, 0, CFG.camera.z);
    const group = new T.Group();
    scene.add(group);
    scene.add(new T.AmbientLight(0xffffff, CFG.light.ambient)); // Not skin: light intensity (white light)
    const point = new T.PointLight(0xffffff, CFG.light.point, 0, CFG.light.decay); // Not skin: light intensity (white light)
    scene.add(point);
    const VS = "varying vec2 vUv; varying float vDepth; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vDepth = -mv.z; gl_Position = projectionMatrix * mv; }";
    const FS = `varying vec2 vUv; varying float vDepth; uniform sampler2D uMap; uniform float uOpacity, uVel, uBarrel, uNear, uFar; uniform vec3 uFog;
      vec2 barrel(vec2 uv, float s){ vec2 st = uv - 0.5; return 0.5 + (1.0 + s * dot(st, st)) * st; }
      void main(){ vec4 c = texture2D(uMap, barrel(vUv, uVel * uBarrel));
        float f = smoothstep(uNear, uFar, vDepth); gl_FragColor = vec4(mix(c.rgb, uFog, f), c.a * uOpacity); }`;
    const items = [];
    const add = (kind, pos, i) => {
      const lab = $(`.pd-stage [data-${kind}="${i}"]`)?.dataset.label || "";
      const w = kind === "video" ? 8.5 : 7.2, h = 4.8;
      const tex = new T.CanvasTexture(placeholder(lab, 640, Math.round((640 * h) / w)));
      const mat = new T.ShaderMaterial({ uniforms: { uMap: { value: tex }, uOpacity: { value: 0 }, uVel: { value: 0 }, uBarrel: { value: CFG.barrel }, uNear: { value: CFG.fog[0] }, uFar: { value: CFG.fog[1] }, uFog: { value: new T.Vector3(br / 255, bg / 255, bb / 255) } }, vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false });
      const m = new T.Mesh(new T.PlaneGeometry(w, h), mat);
      m.position.set(...pos);
      m.userData.base = pos;
      group.add(m);
      items.push(m);
    };
    CFG.videos.forEach((p, i) => add("video", p, i));
    CFG.images.forEach((p, i) => add("image", p, i));
    const rock = new T.Mesh(rockGeometry(1.1), rockMaterial());
    rock.position.set(...CFG.rock.pos);
    rock.rotation.set(...CFG.rock.rot);
    group.add(rock);
    const box = new T.Box3();
    items.forEach((m) => box.expandByObject(m));
    const depth = Math.abs(box.min.z - box.max.z) + Math.abs(box.max.z) + 5;
    const state = { progress: 0, vel: 0, reveal: 0, px: 0, py: 0, shown: true };
    const size = () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); };
    size();
    addEventListener("resize", size);
    // Cursor push — the whole scene beyond the hole shifts away from the cursor by up to .25% of screen width and .18% of height (follow .055). Turns off after 4% scroll
    const ptr = { x: 0, y: 0 };
    if (!touch && !reduce) addEventListener("pointermove", (e) => { ptr.x = (e.clientX / innerWidth) * 2 - 1; ptr.y = 1 - (e.clientY / innerHeight) * 2; }, { passive: true });
    let prev = 0;
    const wp = new T.Vector3();
    const tick = (time) => {
      if (!state.shown) return;
      const z = state.progress * depth;
      group.position.z = z;
      const v = state.progress - prev; prev = state.progress;
      state.vel += (v - state.vel) * CFG.velLerp;
      for (const m of items) {
        const [bx, by] = m.userData.base;
        const tx = bx > 0 ? bx + z * CFG.parallax.delay : bx - z * CFG.parallax.delay, ty = by > 0 ? by + z * CFG.parallax.delay : by - z * CFG.parallax.delay;
        m.position.x += (tx - m.position.x) * CFG.parallax.lerp;
        m.position.y += (ty - m.position.y) * CFG.parallax.lerp;
        m.getWorldPosition(wp);
        const d = Math.abs(wp.z - camera.position.z), a = Math.min(1, Math.max(0, (d - CFG.fade[1]) / (CFG.fade[0] - CFG.fade[1])));
        m.material.uniforms.uOpacity.value = a * state.reveal;
        m.material.uniforms.uVel.value = reduce ? 0 : state.vel;
      }
      const s = 1 - T.MathUtils.smoothstep(state.progress, 0, 0.04);
      state.px += (0.0025 * ptr.x * s - state.px) * 0.055;
      state.py += (0.0018 * ptr.y * s - state.py) * 0.055;
      camera.setViewOffset(innerWidth, innerHeight, state.px * innerWidth, -state.py * innerHeight, innerWidth, innerHeight);
      const o = z / (Math.abs(box.min.z) || 1);
      rock.rotation.x += (-(o * Math.PI * 2) - Math.PI / 6 + CFG.rock.rot[0] - rock.rotation.x) * CFG.rock.rotLerp;
      rock.position.y += (CFG.rock.pos[1] + 1 - CFG.rock.scroll * o - rock.position.y) * CFG.rock.yLerp;
      rock.getWorldPosition(wp);
      const t = time * CFG.light.speed;
      point.position.set(wp.x + Math.cos(t) * CFG.light.amp * 3, wp.y + Math.sin(t) * CFG.light.amp * 3, wp.z + CFG.light.z * 6);
      renderer.render(scene, camera);
    };
    renderer.compile(scene, camera);
    gsap.ticker.add(tick);
    return { state, items, depth };
  };

  // ───── Loader → hole opens → Hero copy
  const loader = $(".pd-loader"), pct = loader?.querySelector(".pd-loader__pct"), hero = $(".pd-hero");
  const tag = $(".pd-hero-text__tag"), hint = $(".pd-hero-text__hint");
  let heroTextOn = false, heroScrolled = false, revealed = false;
  const syncHeroText = () => {
    const want = revealed && !heroScrolled;
    if (want === heroTextOn) return;
    heroTextOn = want;
    [tag, hint].forEach((n) => (want ? n?.fxPixelChars?.show() : n?.fxPixelChars?.hide()));
  };
  hero?.addEventListener("fx:revealed", () => { if (stage) gsap.to(stage.state, { reveal: 1, duration: 0.1, ease: "none" }); setTimeout(() => { revealed = true; syncHeroText(); }, 400); });
  const startLoader = () => {
    let inSite = false;
    try { inSite = !!document.referrer && new URL(document.referrer).origin === location.origin && sessionStorage.getItem("pd-home") === "1"; } catch {}
    try { sessionStorage.setItem("pd-home", "1"); } catch {}
    if (inSite && loader) loader.remove();
    if (!loader || inSite) { hero?.dispatchEvent(new CustomEvent("fx:reveal", { detail: { instant: inSite } })); return; }
    PD.lenis.stop();
    const t0 = performance.now();
    let h = 0, ready = false;
    addEventListener("load", () => { ready = true; }, { once: true });
    if (document.readyState === "complete") ready = true;
    const step = () => {
      const t = (performance.now() - t0) / 1000, goal = ready ? 1 : Math.min(0.85, 0.15 * t);
      h += (goal - h) * 0.06;
      if (ready && h > 0.98) h = 1;
      pct.textContent = `${Math.floor(100 * h)}%`;
      if (h >= 1) {
        gsap.to(loader, { opacity: 0, duration: reduce ? 0 : 0.4, ease: "power2.out", onComplete: () => { loader.style.display = "none"; PD.lenis.start(); hero?.dispatchEvent(new Event("fx:reveal")); } });
      } else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // ───── Glow on Work cells and site cards — radius at the cursor position = A light of cell long side × .8 turns on as an overlay in .4s
  const halo = (root) => {
    root.addEventListener("pointermove", (e) => {
      const host = e.target.closest(".pd-card__media, .pd-flip__front");
      if (!host) return;
      const r = host.getBoundingClientRect();
      host.style.setProperty("--pd-hx", `${e.clientX - r.left}px`);
      host.style.setProperty("--pd-hy", `${e.clientY - r.top}px`);
      host.style.setProperty("--pd-halo-r", `${Math.max(r.width, r.height) * 0.8}px`);
    }, { passive: true });
    root.addEventListener("pointerover", (e) => e.target.closest(".pd-card__media, .pd-flip__front")?.classList.add("is-haloed"));
    root.addEventListener("pointerout", (e) => { const h = e.target.closest(".pd-card__media, .pd-flip__front"); if (h && !h.contains(e.relatedTarget)) h.classList.remove("is-haloed"); });
  };

  // ───── List Cover
  const listUi = () => {
    const btn = $(".pd-view-btn"), list = $(".pd-list"), work = $(".pd-work");
    if (!btn || !list) return;
    const posters = [...list.querySelectorAll(".pd-list__poster-media")], poster = list.querySelector(".pd-list__poster");
    let open = false;
    ScrollTrigger.create({ trigger: work, start: "top bottom-=20%", end: "bottom bottom",
      onToggle: (s) => { if (open) return; gsap.to(btn, s.isActive ? { autoAlpha: 1, duration: 0.3, ease: "power2.out", overwrite: true } : { autoAlpha: 0, duration: 0.22, ease: "power2.out", overwrite: true }); } });
    const t1 = btn.querySelectorAll(".pd-view-btn__t"), lines = btn.querySelector(".pd-view-btn__l");
    const morph = (on) => gsap.timeline({ defaults: { duration: 0.48, ease: "power3.inOut", overwrite: true } })
      .to(t1, { y: on ? -14 : 0, opacity: on ? 0 : 1, duration: 0.32 }, 0.04)
      .to(lines, { rotate: on ? 45 : 0, scale: on ? 0.8 : 1, transformOrigin: "74px 27px" }, 0);
    const setOpen = (on) => {
      open = on;
      btn.setAttribute("aria-expanded", String(on));
      list.setAttribute("aria-hidden", String(!on));
      morph(on);
      if (on) { PD.lenis.stop(); gsap.to(list, { autoAlpha: 1, duration: 0.44, ease: "power2.out", overwrite: true }); PD.headerColor.push("paper"); }
      else { gsap.to(list, { autoAlpha: 0, duration: 0.34, ease: "power2.inOut", overwrite: true, onComplete: () => PD.lenis.start() }); PD.headerColor.pop(); }
    };
    btn.addEventListener("click", () => setOpen(!open));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && open) setOpen(false); });
    let on = null;
    const show = (i) => {
      if (on === i) return;
      on = i;
      list.classList.toggle("is-hovering", i !== null);
      list.querySelectorAll(".pd-row__link").forEach((a) => a.classList.toggle("is-on", a.dataset.poster === String(i)));
      gsap.to(poster, { opacity: i === null ? 0 : 1, duration: 0.3, ease: "power2.out", overwrite: true });
      posters.forEach((p) => gsap.to(p, p.dataset.poster === String(i) ? { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out", overwrite: true } : { opacity: 0, scale: 1.015, duration: 0.22, ease: "power2.out", overwrite: true }));
    };
    list.addEventListener("pointerover", (e) => { const a = e.target.closest(".pd-row__link"); if (a) show(a.dataset.poster); });
    list.addEventListener("pointerleave", () => show(null));
  };

  // ───── About background — dotted vertical·horizontal lines, large arcs and contour rings. Each chunk slides by a different amount in proportion to where the cursor is on screen
  // Exactly the original worldwide scene: per chunk c = Cursor ndc × .1 ÷ (1 + layer index/4), drift each frame ← c + lerp(drift, ∓c·.4·remaining layers behind, follow).
  // The smaller the follow amount, the farther it goes: the center vertical line (.1) goes ~185px toward the screen-edge cursor, outer lines (.2) ~90px, the arc (.5) ~30px. Wide screens (768+) and mouse only
  const aboutBg = () => {
    const cv = $(".pd-about__bg"), sec = $(".pd-about"), kicker = sec?.querySelector(".pd-about__kicker");
    if (!cv || !sec) return;
    const g = cv.getContext("2d");
    let w = 0, h = 0, dpr = 1, nx = 0, ny = 0, vis = false, kickTop = 0;
    const live = !reduce && !touch && matchMedia("(min-width: 768px)").matches;
    const [ir, ig, ib] = PD.rgb("--kf-contrast-ink");
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2); w = sec.clientWidth; h = sec.clientHeight; cv.width = w * dpr; cv.height = h * dpr;
      kickTop = kicker ? kicker.getBoundingClientRect().top - sec.getBoundingClientRect().top : h * 0.1;
    };
    new ResizeObserver(resize).observe(sec);
    resize();
    // Original scene units → screen px (one unit at depth d with camera fov 50 · z 5)
    const unit = (d) => innerHeight / (2 * d * Math.tan((25 * Math.PI) / 180));
    const vlines = [[-5.5, 0.6], [-3, 0.2], [-1.5, 0.1], [1.5, 0.1], [3, 0.2], [5.5, 0.3]].map(([x, l]) => ({ x, l, o: 0 }));
    const hlines = [[0.42, 0.1], [0.78, 0.5]].map(([y, l]) => ({ y, l, o: 0 }));
    const arc = { l: 0.5, o: 0 }, RINGS = 14, rings = Array.from({ length: RINGS }, () => 0);
    if (live) addEventListener("pointermove", (e) => { nx = (e.clientX / innerWidth) * 2 - 1; ny = 1 - (e.clientY / innerHeight) * 2; }, { passive: true });
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(sec);
    const slide = () => {
      const cx = nx * 0.1, cy = ny * 0.1;
      for (const v of vlines) v.o = cx + v.o + (-cx * 0.4 - v.o) * v.l;
      for (const v of hlines) v.o = cy + v.o + (cy * 0.4 - v.o) * v.l;
      arc.o = cx + arc.o + (-cx * 0.4 - arc.o) * arc.l;
      for (let t = 0; t < RINGS; t++) { const c = cx / (1 + t / 4); rings[t] = c + rings[t] + (-c * 0.4 * (RINGS - t) - rings[t]) * 0.1; }
    };
    const draw = (time) => {
      if (live) slide();
      if (!vis) return;
      const uv = 1.3 * unit(6.5), uh = 1.14 * unit(6), u0 = unit(5);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      g.lineWidth = 1;
      g.strokeStyle = `rgba(${ir},${ig},${ib},0.35)`; // Dotted line: skin text color at 35%
      g.setLineDash([6, 6]);
      g.beginPath();
      for (const v of vlines) { const x = w / 2 + (v.x + v.o) * uv; if (x > -2 && x < w + 2) { g.moveTo(x, 0); g.lineTo(x, h); } }
      for (const v of hlines) { const y = h * v.y - v.o * uh; g.moveTo(0, y); g.lineTo(w, y); }
      g.stroke();
      // Big arc: the original circle (radius 6.62 units) with a radius of .944H measured from a 1440×900 print, top edge 15% of the screen above the eyebrow text
      const R = 0.944 * innerHeight, top = kickTop - innerHeight * 0.15;
      g.beginPath(); g.arc(w / 2 + (arc.o * R) / 6.62, top + R, R, Math.PI, Math.PI * 2); g.stroke();
      g.strokeStyle = `rgba(${ir},${ig},${ib},0.12)`; // Clothing text color at 12%
      g.setLineDash([3, 5]);
      const cy = h * 0.55;
      for (let k = 1; k <= RINGS; k++) {
        const cx = w * 0.5 + rings[k - 1] * u0;
        g.beginPath();
        for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.06) {
          const r = k * Math.min(w, h) * 0.045 * (1 + 0.08 * Math.sin(a * 3 + k * 0.7 + time * 0.1) + 0.05 * Math.sin(a * 7 - k));
          const x = cx + Math.cos(a) * r * 1.6, y = cy + Math.sin(a) * r;
          a === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
        }
        g.stroke();
      }
    };
    if (reduce) { vis = true; draw(0); vis = false; } else gsap.ticker.add(draw);
  };

  // ───── Site card — as you pass the section the row flows left (with the bar filling alongside), and cards with content flip when clicked
  const bts = () => {
    const sec = $(".pd-bts"), track = sec?.querySelector(".pd-bts__track"), bar = sec?.querySelector(".pd-bts__bar i");
    if (!track) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to(track, { x: () => -(track.scrollWidth - innerWidth + parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--pd-margin")) || 0), ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
      if (bar) gsap.fromTo(bar, { scaleX: 0.25 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: true } });
    });
    const flip = (card) => { card.setAttribute("data-flipped", ""); card.toggleAttribute("data-active"); };
    track.addEventListener("click", (e) => { const c = e.target.closest(".pd-flip.has-back"); if (c) flip(c); });
    track.addEventListener("keydown", (e) => { const c = e.target.closest(".pd-flip.has-back"); if (c && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); flip(c); } });
  };

  // ───── Three boxes — as the screen passes from 90% to 45%, each stands up from transparent, tilted −6° around its top right, and the corner dots light up
  const boxes = () => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      document.querySelectorAll("[data-box]").forEach((b) => {
        gsap.timeline({ scrollTrigger: { trigger: b, start: () => "top 90%", end: () => "top 45%", scrub: true, invalidateOnRefresh: true } })
          .fromTo(b, { opacity: 0, rotate: -6, transformOrigin: "top right" }, { opacity: 1, rotate: 0, ease: "none" }, 0)
          .fromTo(b.querySelectorAll("[data-dot]"), { opacity: 0 }, { opacity: 1, ease: "none" }, 0.5);
      });
    });
  };

  // ───── Footer rock — drag to spin (sensitivity .6, .9 while pressed · cools down at .965 on release, dragging starts past 6px), spins slowly when left alone. Appears in .1 steps when entering the section
  const footerRock = () => {
    const cv = $(".pd-footer__rock"), sec = $(".pd-footer");
    if (!cv || !T) return;
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); } catch { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    const scene = new T.Scene(), camera = new T.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 5);
    const mat = rockMaterial();
    mat.transparent = true;
    const rock = new T.Mesh(rockGeometry(1.25), mat);
    rock.rotation.set(-0.5, 0, 0.3);
    scene.add(rock);
    scene.add(new T.AmbientLight(0xffffff, 0.4)); // Not skin: light intensity (white light)
    const point = new T.PointLight(0xffffff, 7, 0, 0.6); // Not skin: light intensity (white light)
    scene.add(point);
    let vis = false, prog = 0, op = 0, vel = 0.004, drag = null, lastX = 0, moved = 0;
    const size = () => { const w = cv.clientWidth, h = cv.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); rock.scale.setScalar(1.15 * Math.min(1, h / (innerHeight * 0.68))); };
    new ResizeObserver(size).observe(cv);
    size();
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(sec);
    ScrollTrigger.create({ trigger: sec, start: "top center", end: "bottom bottom-=10%", onUpdate: (s) => { prog = s.progress; } });
    cv.addEventListener("pointerdown", (e) => { drag = e.pointerId; lastX = e.clientX; moved = 0; });
    addEventListener("pointermove", (e) => { if (drag !== e.pointerId) return; const dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx); if (moved > 6) vel = dx * 0.6 * 0.01; });
    addEventListener("pointerup", () => { drag = null; });
    const tick = (time) => {
      if (!vis) return;
      op += (Math.min(1, prog * 2) - op) * 0.1;
      mat.opacity = reduce ? 1 : op;
      vel *= drag !== null ? 0.9 : 0.965;
      if (!reduce) rock.rotation.y += vel + (drag !== null ? 0 : 0.002 * 1.15);
      rock.position.y = 0.3;
      const t = time * 1.07;
      point.position.set(Math.cos(t) * 1.05 * 3, Math.sin(t) * 1.05 * 3, 1.94);
      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);
  };

  const init = () => {
    stage = T ? buildStage() : null;
    if (stage) {
      ScrollTrigger.create({ trigger: ".pd-hero", start: "top top", endTrigger: ".pd-mosaic", end: "bottom top", onUpdate: (s) => { stage.state.progress = s.progress; } });
      ScrollTrigger.create({ trigger: ".pd-about", start: "top top", onToggle: (s) => { stage.state.shown = !s.isActive; } });
    }
    ScrollTrigger.create({ trigger: ".pd-hero", start: "top top-=1", onEnter: () => { heroScrolled = true; syncHeroText(); }, onLeaveBack: () => { heroScrolled = false; syncHeroText(); } });
    halo(document.querySelector(".pd-work") || document.body);
    halo(document.querySelector(".pd-bts") || document.body);
    listUi();
    aboutBg();
    bts();
    boxes();
    footerRock();
    startLoader();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true }); else init();
})();
