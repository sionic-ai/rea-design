/* Shared — Locomotive scroll, swapping in the italic o, button row sliding up, menu panel (dot + → ×, page drops 5rem), staggered float-in on entry, line drawing, footer marquee, light and 3D symbols */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  let refreshT = 0;
  const refresh = () => { clearTimeout(refreshT); refreshT = setTimeout(() => ScrollTrigger.refresh(), 100); };
  window.tkRefresh = refresh;

  // Only o is italic — as in the original, wraps the English o in titles and subtitles
  const wrapO = (node) => {
    if (node.nodeType === 3) {
      if (!/[oO]/.test(node.nodeValue)) return;
      const f = document.createDocumentFragment();
      node.nodeValue.split(/([oO])/).forEach((part) => { if (/^[oO]$/.test(part)) { const s = document.createElement("span"); s.className = "tk-o"; s.textContent = part; f.append(s); } else f.append(document.createTextNode(part)); });
      node.replaceWith(f);
    } else if (node.nodeType === 1 && !node.matches(".tk-o, script, style, svg, [data-fx]")) [...node.childNodes].forEach(wrapO);
  };
  document.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach(wrapO);

  let loco = null;
  if (!reduce && window.LocomotiveScroll) loco = new LocomotiveScroll();
  window.tkLoco = loco;

  // Button row — starts at the bottom of the screen, rises as you scroll and sticks at the top
  const nav = document.querySelector(".tk-nav");
  if (nav) {
    let h = nav.offsetHeight, raf = 0;
    const put = () => { raf = 0; nav.style.top = `${Math.max(0, innerHeight - h - scrollY)}px`; };
    const later = () => { if (!raf) raf = requestAnimationFrame(put); };
    new ResizeObserver(() => { h = nav.offsetHeight; later(); }).observe(nav);
    addEventListener("scroll", later, { passive: true }); addEventListener("resize", later, { passive: true }); put();
  }

  // Menu — four dots gather from the + position to the center (.22s), the fifth dot lights up (.08s), then spreads to the × position (.34s back.out(1.4))
  const trig = document.querySelector(".tk-navbtn--menu"), icon = trig?.querySelector(".tk-dots"), menu = document.querySelector(".tk-menu"), page = document.querySelector(".tk-page");
  if (trig && icon && menu && page) {
    const dots = [...icon.querySelectorAll("i")], links = [...menu.querySelectorAll(".tk-menu__link")], d = 5;
    const px = [0, d, 0, -d], py = [-d, 0, d, 0], cx = [-d, d, d, -d], cy = [-d, -d, d, d];
    gsap.set(dots, { xPercent: -50, yPercent: -50 });
    gsap.set(dots.slice(0, 4), { x: (i) => px[i], y: (i) => py[i], scale: 1 });
    gsap.set(dots[4], { x: 0, y: 0, scale: 0 });
    gsap.set(menu, { display: "none", autoAlpha: 0, y: "-2rem", pointerEvents: "none" });
    gsap.set(links, { autoAlpha: 0, yPercent: 60 });
    menu.inert = true;
    let open = false, go = null;
    const iconTl = gsap.timeline({ paused: true })
      .to(dots.slice(0, 4), { x: 0, y: 0, scale: 0.8, duration: 0.22, ease: "power3.in" })
      .to(dots[4], { scale: 1, duration: 0.08, ease: "power2.out" }, 0.18)
      .to(dots.slice(0, 4), { x: (i) => cx[i], y: (i) => cy[i], scale: 1, duration: 0.34, ease: "back.out(1.4)" }, 0.22);
    const done = () => { if (open) return; gsap.set(menu, { display: "none" }); const h = go; go = null; if (h) location.hash = h; };
    const menuTl = gsap.timeline({ paused: true, onReverseComplete: done })
      .to(page, { y: "5rem", duration: 1.05, ease: "power3.inOut" }, 0)
      .to(menu, { autoAlpha: 1, y: 0, pointerEvents: "auto", duration: 0.85, ease: "power4.out" }, 0.18)
      .to(links, { autoAlpha: 1, yPercent: 0, duration: 0.65, stagger: 0.06, ease: "power4.out" }, 0.75);
    const set = (v, href = null) => {
      open = v; go = href; trig.setAttribute("aria-expanded", String(v)); trig.setAttribute("aria-label", v ? "Close Menu" : "Open Menu"); menu.inert = !v;
      if (v) { gsap.set(menu, { display: "flex" }); iconTl.play(); menuTl.play(); if (reduce) { iconTl.progress(1).pause(); menuTl.progress(1).pause(); } }
      else { iconTl.reverse(); menuTl.reverse(); if (reduce) { iconTl.progress(0).pause(); menuTl.progress(0).pause(); } if (!menuTl.time()) done(); }
    };
    trig.addEventListener("click", (e) => { e.preventDefault(); set(!open); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && open) { set(false); trig.focus({ preventScroll: true }); } });
    links.forEach((a) => a.addEventListener("click", (e) => { if (!open) return; e.preventDefault(); set(false, a.getAttribute("href")); }));
  }

  // On entry, the children in the group rise from 2em below at a .1s stagger over .8s power4.inOut, and hide again when scrolled back up
  document.querySelectorAll(".tk-reveal").forEach((g) => {
    const kids = g.children.length ? [...g.children] : [g];
    if (reduce) return gsap.set(kids, { y: 0, autoAlpha: 1 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: g, start: "top 80%", toggleActions: "restart none none reset" } });
    kids.forEach((k, i) => tl.fromTo(k, { y: "2em", autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power4.inOut" }, i * 0.1));
  });

  // Line — each time it enters, 0 → 100% in 1.6s expo.inOut
  document.querySelectorAll(".tk-line").forEach((l) => {
    if (reduce) return gsap.set(l, { width: "100%" });
    gsap.fromTo(l, { width: "0%" }, { width: l.closest(".tk-foot__last") ? "calc(100% - 4rem)" : "100%", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: l, start: "top 95%", toggleActions: "restart none none reset" } });
  });

  // Footer marquee — one lap takes set width × 20 / screen width seconds, flowing left when scrolling down and right when scrolling up
  document.querySelectorAll(".tk-mq").forEach((mq) => {
    const set0 = mq.querySelector(".tk-mq__set"), track = mq.querySelector(".tk-mq__scroll");
    if (!set0 || !track || reduce) return;
    const dir = mq.dataset.dir === "right" ? 1 : -1, speed = +(mq.dataset.speed || 20), dup = +(mq.dataset.dup || 2);
    for (let i = 0; i < dup; i++) { const c = set0.cloneNode(true); c.setAttribute("aria-hidden", "true"); c.inert = true; track.append(c); }
    const sets = [...track.children]; let anim = null, ts = dir;
    const build = () => {
      const w = set0.getBoundingClientRect().width; if (!w) return;
      const p = anim ? anim.progress() : 0.5; anim?.kill();
      const k = innerWidth < 479 ? 0.25 : innerWidth < 991 ? 0.5 : 1, dur = Math.max(0.01, (speed * w) / innerWidth * k);
      anim = gsap.fromTo(sets, { xPercent: 0 }, { xPercent: -100, duration: dur, repeat: -1, ease: "none", onReverseComplete() { this.totalTime(this.duration() * 100); } });
      anim.totalTime(dur * (100 + p)).timeScale(ts);
    };
    new ResizeObserver(build).observe(set0);
    ScrollTrigger.create({ trigger: mq, start: "top bottom", end: "bottom top", onToggle: (s) => anim?.paused(!s.isActive), onUpdate: (s) => { ts = s.direction === 1 ? dir : -dir; anim?.timeScale(ts); } });
    build();
  });

  // Footer light blob — from bottom left at −30%·20%·.85x scale·.6 transparent into place (scrub 1.2)
  const glow = document.querySelector(".tk-foot__glow"), base = document.querySelector(".tk-foot__base");
  if (glow && base && !reduce) gsap.from(glow, { xPercent: -30, yPercent: 20, scale: 0.85, opacity: 0.6, ease: "none", scrollTrigger: { trigger: base, start: "top bottom", end: "bottom bottom", scrub: 1.2, invalidateOnRefresh: true } });

  // 3D symbol — stands in for the original Spline scene. A black glossy vertical pillar + horizontal arm (our default shape), slowly rotating and tilting slightly by how far the cursor moves over the canvas
  const tc = document.querySelector(".tk-tshape__canvas"), T = window.THREE;
  if (tc && T) {
    const r = new T.WebGLRenderer({ canvas: tc, antialias: true, alpha: true }); r.setPixelRatio(Math.min(devicePixelRatio, 2)); r.setClearColor(0, 0); r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping;
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, 0.1, 50); cam.position.set(0, 0.4, 9); cam.lookAt(0, 0, 0);
    const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    const pm = new T.PMREMGenerator(r), envTex = (() => { const w = 64, h = 32, d = new Uint8Array(w * h * 4); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4, k = y < 9 ? 30 : y < 13 ? 255 : y < 17 ? 70 : 12; d[i] = d[i + 1] = d[i + 2] = k; d[i + 3] = 255; } const t = new T.DataTexture(d, w, h); t.mapping = T.EquirectangularReflectionMapping; t.needsUpdate = true; return t; })();
    scene.environment = pm.fromEquirectangular(envTex).texture;
    const mat = new T.MeshPhysicalMaterial({ color: new T.Color(css("--kf-bg")), metalness: 0.4, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 });
    const rb = (w, h, d) => { const s = new T.Shape(), rr = 0.12; s.moveTo(-w / 2 + rr, -h / 2); s.lineTo(w / 2 - rr, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + rr); s.lineTo(w / 2, h / 2 - rr); s.quadraticCurveTo(w / 2, h / 2, w / 2 - rr, h / 2); s.lineTo(-w / 2 + rr, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - rr); s.lineTo(-w / 2, -h / 2 + rr); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + rr, -h / 2); const g = new T.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 4 }); g.center(); return g; };
    const shape = new T.Group();
    const post = new T.Mesh(rb(1.1, 4.4, 1.1), mat); shape.add(post);
    const arm = new T.Mesh(rb(2.6, 1.1, 1.1), mat); arm.position.set(0.15, 0.9, 0); shape.add(arm);
    // Cursor rotation goes on the outer group — in the original the camera orbits the target, and the symbol sits 405 units in front of the target (ortho zoom 1.75 → .98 of canvas height),
    // On rotation the symbol slides toward the cursor (about 20px per 700px swept). Put the rotation center behind the symbol at the same ratio — visible height × .98
    const piv = 0.98 * 2 * cam.position.length() * Math.tan((cam.fov * Math.PI) / 360);
    const hov = new T.Group(), lever = new T.Group(); hov.position.z = -piv; lever.position.z = piv; lever.add(shape); hov.add(lever); scene.add(hov);
    scene.add(new T.AmbientLight(0xffffff, 0.25));
    const key = new T.DirectionalLight(0xffffff, 2.2); key.position.set(-3, 4, 5); scene.add(key);
    const warm = new T.PointLight(new T.Color(css("--kf-accent")), 30, 12); warm.position.set(-3, -2, 2); scene.add(warm);
    const fit = () => { const w = tc.clientWidth || 1, h = tc.clientHeight || 1; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    fit(); new ResizeObserver(fit).observe(tc);
    // Pre-bake the shader before entering the Hero — compiling at first sight stalls the screen on that frame
    r.compile(scene, cam);
    // Hover-rotate values of the original Spline orbit camera: damping is on, so rotation speed .2 × strength (5/100)² × 2π / canvas height rad is added per px the cursor moves (movementX·Y), and
    // Each frame it moves .125 of the remaining amount and keeps turning (8 times a single movement — moving by the canvas height gives about 1.4°). Receives input only over the canvas (mouseEventTarget canvas).
    // On entry pushes once by (clientX − width/2, clientY − height/2) (the original behavior using window coordinates as is), and on leaving returns to the start position with the same damping, 1/8 of the remaining rotation at a time
    const K = 2 * Math.PI * 0.2 * 0.05 ** 2, spin = { y: 0, x: 0 };
    let inside = false, last = 0;
    const turn = (dx, dy) => { const h = tc.clientHeight || 1; spin.y += (K * dx) / h; spin.x += (K * dy) / h; };
    if (fine && !reduce) {
      // In the copy the contact row is a layer above the canvas, so the canvas can’t receive events directly — they are taken on the window and filtered by whether they fall inside the canvas rectangle (in the original desktop the canvas is on top)
      const out = () => { if (!inside) return; inside = false; spin.y = -hov.rotation.y / 8; spin.x = -hov.rotation.x / 8; };
      addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse") return;
        const b = tc.getBoundingClientRect(), on = e.clientX >= b.left && e.clientX < b.right && e.clientY >= b.top && e.clientY < b.bottom;
        if (!on) return out();
        if (!inside) { inside = true; turn(e.clientX - b.width / 2, e.clientY - b.height / 2); }
        else turn(e.movementX, e.movementY);
      }, { passive: true });
      document.addEventListener("mouseleave", out);
    }
    let raf = 0, t0 = performance.now();
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const t = (now - t0) / 1000, f = last ? Math.min((now - last) / (1000 / 60), 4) : 1, keep = 0.875 ** f, step = (1 - keep) / 0.125;
      last = now;
      hov.rotation.y += spin.y * step; hov.rotation.x += spin.x * step; spin.y *= keep; spin.x *= keep;
      shape.rotation.set(-0.25, reduce ? 0.6 : t * 0.35, 0.08); shape.position.y = -0.6 + (reduce ? 0 : Math.sin(t * 0.8) * 0.08); r.render(scene, cam);
    };
    new IntersectionObserver(([e]) => { if (e.isIntersecting) { if (!raf) raf = requestAnimationFrame(tick); } else { cancelAnimationFrame(raf); raf = 0; } }).observe(tc);
  }
  if (document.fonts) document.fonts.ready.then(refresh);
  addEventListener("load", refresh, { once: true });
})();
