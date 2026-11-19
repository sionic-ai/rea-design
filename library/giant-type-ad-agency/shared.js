// Common to all pages: draws the header pill, expand panel, phone menu, search panel, language button and footer, and sets up Lenis, logo change (scroll 10px), ∞ drawing·
// Hooks up photo stack split (fixed 500ms / GL 1500ms), footer float-up and footer 3D ∞.
// Original values: transition .15s cubic-bezier(.4,0,.2,1) · ∞ drawing 1000ms inOutQuad (second line -500ms) · the logo check starts 1500ms after Lenis stops.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const CS = (window.CS = { reduced, lenis: null, mm: gsap.matchMedia() });

  const inf = (cls = "") => `<svg class="cs-inf ${cls}" viewBox="0 0 1524 830" aria-hidden="true"><path d="M762 415C640 250 520 115 380 115C215 115 115 250 115 415S215 715 380 715C520 715 640 580 762 415"/><path d="M762 415C884 250 1004 115 1144 115C1309 115 1409 250 1409 415S1309 715 1144 715C1004 715 884 580 762 415"/></svg>`;
  CS.inf = inf;
  const arrow = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10h13M11 5l5 5-5 5"/></svg>';
  CS.arrow = arrow;
  const links = [
    ["detail", "detail.html", "Project", "projects"],
    ["about", "index.html#legend", "About", "text"],
    ["services", "services.html", "Service", "text"],
    ["news", "news.html", "News", "projects"],
    ["career", "#contact", "Hiring", "text"],
    ["contact", "#contact", "Inquiry", "addr"],
  ];
  const curOf = { "service-detail": "services", article: "news" };
  const cur = (k) => (k === (curOf[page] || page) ? " is-current" : "");

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "cs-nav";
    head.innerHTML = `
      <div class="cs-nav__main" role="navigation">
        <div class="cs-nav__pill">
          <a class="cs-logo" href="index.html" aria-label="Home">
            <svg class="cs-logo__word" viewBox="0 0 100 19" aria-hidden="true"><rect x="0" y="2" width="15" height="15" rx="7.5" fill="currentColor"/><rect x="19" y="5" width="81" height="10" rx="2" fill="currentColor"/></svg>
            ${inf("cs-logo__inf")}
          </a>
          <button class="cs-burger" type="button" aria-label="Menu"><i></i><i></i><i></i></button>
          <div class="cs-nav__links">${links.map(([k, href, label], i) => `<a class="${cur(k).trim()}" href="${href}" data-drop="${i}">${label}</a>`).join("")}</div>
        </div>
        <div class="cs-drop">
          <div class="cs-drop__card" data-card="projects"><div class="cs-drop__projects">
            ${[1, 2, 3].map((n) => `<a href="detail.html"><div class="wf-img" data-label="Project key shot ${n} · Campaign scene · Square"></div><span>Your project name $ here{n}</span></a>`).join("")}
            <div class="cs-drop__foot"><a class="cs-btn" href="detail.html">All projects</a></div>
          </div></div>
          <div class="cs-drop__card" data-card="text"><div class="cs-drop__text"><div><div class="t-h2" data-label="Your menu board short English title here">Short Title</div><div class="t-body">Your two-line explanation of what this menu is goes here. The original is about this length.</div>${inf()}</div><a class="cs-btn" href="services.html">See more</a></div></div>
          <div class="cs-drop__card" data-card="addr"><div class="cs-drop__addr">
            ${["City 1", "City 2", "City 3", "City 4"].map((c) => `<div><span>${c}</span><a href="#contact">Your one-line address here</a></div>`).join("")}
          </div></div>
        </div>
      </div>
      <div class="cs-nav__tools">
        <button class="cs-sq cs-a11y" type="button" aria-label="Motion Paused"><svg viewBox="0 0 50 50"><g class="cs-a11y__man"><circle cx="25" cy="16" r="2.2"/><path d="M17 21.5h16M25 21.5v8M21.75 37l3.25-7.5 3.25 7.5"/></g><g class="cs-a11y__pause"><line x1="21.75" y1="18" x2="21.75" y2="32"/><line x1="29.75" y1="18" x2="29.75" y2="32"/></g></svg></button>
        <button class="cs-sq cs-search-btn" type="button" aria-label="Search"><svg viewBox="0 0 50 50"><circle cx="23.5" cy="24.5" r="7"/><path d="m28.5 29.5 5 5"/><path class="cs-search-btn__plus" d="M33 15v6M30 18h6"/></svg></button>
      </div>`;
    head.insertAdjacentHTML(
      "afterend",
      `<nav class="cs-mmenu t-h3-bold" data-slot="mobile-menu" aria-label="Phone menu">
        ${links.map(([k, href, label]) => `<a class="${cur(k).trim()}" href="${href}">${label}</a>`).join("")}
        <div class="cs-mmenu__sub t-ui"><a href="#contact">English</a><a href="#contact">Accessibility</a></div>
      </nav>
      <div class="cs-search" data-slot="search-panel" role="dialog" aria-label="Search">
        <label class="cs-search__field t-h3-bold"><input type="search" placeholder="Your search term here"></label>
        <div class="cs-search__tabs"><button class="is-on" type="button">Photo·Video</button><button type="button">Project</button><button type="button">Text</button></div>
        <div class="cs-search__grid">${[1, 2, 3, 4, 5, 6, 7, 8].map((n) => `<div class="wf-img" data-label="Search results ${n} · Campaign shot · square"></div>`).join("")}</div>
      </div>`,
    );
  }

  const lang = document.querySelector("[data-lang]");
  if (lang) lang.outerHTML = `<a class="cs-lang${lang.dataset.lang === "ink" ? " is-ink" : ""}" href="#contact" aria-label="Other language"><span><b>e</b></span><span><b>n</b></span></a>`;

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "cs-foot";
    foot.id = "contact";
    foot.innerHTML = `
      <div class="cs-foot__in">
        <div class="cs-foot__grid">
          <div></div>
          <div>
            <div class="cs-foot__links">${links.map(([, href, label]) => `<div><a class="hover-underline" href="${href}">${label}</a></div>`).join("")}</div>
            <div class="cs-foot__addr">
              ${["City 1", "City 2", "City 3", "City 4", "City 5"].map((c, i) => `<div><div>${c}</div><a href="#contact">${i + 1}00 Your address line here</a></div>`).join("")}
              <div><div>City 6</div><div>Your satellite office here</div></div>
            </div>
          </div>
        </div>
        <div class="cs-foot__gl" data-slot="footer-3d"><canvas aria-label="Drag-to-rotate 3D emblem"></canvas></div>
      </div>
      <div class="cs-foot__bar">
        <div>${["Social 1", "Social 2", "Social 3", "Social 4", "Social 5", "Social 6"].map((s) => `<a class="hover-underline" href="#contact">${s}</a>`).join("")}</div>
        <div><a class="hover-underline" href="#contact">English</a><a class="hover-underline" href="#contact">Privacy notice</a><a class="hover-underline" href="#contact">Privacy policy</a><button class="hover-underline" type="button">Consent settings</button></div>
      </div>`;
  }

  // Smooth scroll — original Lenis 1.3.27 defaults (lerp .1). The original scrolls an inner panel but the copy scrolls the window (gaps)
  if (!reduced && window.Lenis) {
    const lenis = (CS.lenis = new Lenis({ lerp: 0.1 }));
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ∞ drawing — the first line is erased from the front (0 1 → 1 1) and the second is drawn (0 0 → 0 1), 1000ms inOutQuad, the second after 500ms
  const drawInf = (svg) => {
    const [a, b] = svg.querySelectorAll("path");
    const la = a.getTotalLength(), lb = b.getTotalLength();
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(a, { strokeDasharray: `${la} ${la}`, strokeDashoffset: 0 }, { strokeDashoffset: -la, duration: 1, ease: "power1.inOut" })
      .fromTo(b, { strokeDasharray: `${lb} ${lb}`, strokeDashoffset: lb }, { strokeDashoffset: 0, duration: 1, ease: "power1.inOut" }, 0.5)
      .set(a, { strokeDashoffset: 0 });
    return tl;
  };

  if (head) {
    const logoTl = drawInf(head.querySelector(".cs-logo__inf"));
    let inInf = false;
    const judge = (y) => {
      const want = y > 10 && !reduced;
      if (want === inInf) return;
      inInf = want;
      head.classList.toggle("is-inf", want);
      if (want) logoTl.restart();
    };
    setTimeout(() => {
      judge(scrollY);
      if (CS.lenis) CS.lenis.on("scroll", (l) => judge(l.scroll));
      else addEventListener("scroll", () => judge(scrollY), { passive: true });
    }, 1500);

    // Dropdown panel — touching an item opens its panel, leaving the pill closes it
    const main = head.querySelector(".cs-nav__main");
    const cards = [...head.querySelectorAll(".cs-drop__card")];
    const show = (type) => cards.forEach((c) => c.classList.toggle("is-on", c.dataset.card === type));
    head.querySelectorAll(".cs-nav__links a").forEach((a) =>
      a.addEventListener("mouseenter", () => {
        const type = links[+a.dataset.drop][3];
        show(type);
        const card = cards.find((c) => c.dataset.card === type);
        const svg = card && card.querySelector(".cs-inf");
        if (svg) drawInf(svg).play();
      }),
    );
    main.addEventListener("mouseleave", () => show(null));

    // Phone menu — a panel unfolds below the pill
    const mm = document.querySelector(".cs-mmenu");
    head.querySelector(".cs-burger").addEventListener("click", () => {
      const open = !head.classList.contains("is-open");
      head.classList.toggle("is-open", open);
      if (open) CS.lenis?.stop(); else CS.lenis?.start();
      gsap.to(mm, { clipPath: open ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)", autoAlpha: 1, duration: reduced ? 0 : 0.2, ease: "power1.inOut", onComplete: () => !open && gsap.set(mm, { autoAlpha: 0 }) });
    });

    head.querySelector(".cs-a11y").addEventListener("click", () => document.documentElement.classList.toggle("cs-paused"));

    // Search panel — covers down from above and lifts when pressed again, Lenis paused while open
    const sp = document.querySelector(".cs-search");
    head.querySelector(".cs-search-btn").addEventListener("click", () => {
      const open = !head.classList.contains("is-search");
      head.classList.toggle("is-search", open);
      if (open) CS.lenis?.stop(); else CS.lenis?.start();
      CS.shrink(open);
      gsap.to(sp, { clipPath: open ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)", autoAlpha: 1, duration: reduced ? 0 : 0.75, ease: "expo.inOut", onComplete: () => { if (open) sp.querySelector("input").focus(); else gsap.set(sp, { autoAlpha: 0 }); } });
    });
    sp.querySelectorAll(".cs-search__tabs button").forEach((b) => b.addEventListener("click", () => sp.querySelectorAll(".cs-search__tabs button").forEach((x) => x.classList.toggle("is-on", x === b))));
  }

  // When the overlay (search · menu) opens, the page and header shrink by (width-100)/width and corners round to 10rem — 1000ms outExpo
  const pageEl = document.querySelector(".cs-page");
  CS.shrink = (on) => {
    if (!pageEl || innerWidth <= 768) return;
    const s = on ? (innerWidth - 100) / innerWidth : 1, rem = innerWidth / 1512;
    pageEl.style.transformOrigin = `50% ${scrollY + innerHeight / 2}px`;
    gsap.to(pageEl, { scale: s, borderRadius: on ? 10 * rem : 0, duration: reduced ? 0 : 1, ease: "expo.out" });
    gsap.to(head, { scale: s, duration: reduced ? 0 : 1, ease: "expo.out" });
  };

  // Page transition — the old page shrinks to .9 with 10rem corners and .25 opacity (1000ms outExpo), the new page rises from 100% below (1000ms outExpo).
  // The original runs the two overlapped in one document, but the copy opens a new document so it joins exit → enter in two pieces (gaps)
  if (pageEl && !reduced) {
    const portrait = innerWidth <= 768;
    if (sessionStorage.getItem("cs-nav")) {
      sessionStorage.removeItem("cs-nav");
      if (portrait) gsap.from(pageEl, { opacity: 0, duration: 0.3, delay: 0.3, ease: "none" });
      else gsap.from(pageEl, { yPercent: 0, y: innerHeight, duration: 1, ease: "expo.out", clearProps: "transform" });
    }
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target) return;
      const href = a.getAttribute("href");
      if (!/\.html(#.*)?$/.test(href)) return;
      const to = new URL(href, location.href);
      if (to.pathname === location.pathname) return;
      e.preventDefault();
      sessionStorage.setItem("cs-nav", "1");
      CS.lenis?.stop();
      pageEl.style.transformOrigin = `50% ${scrollY + innerHeight / 2}px`;
      if (portrait) gsap.to(pageEl, { opacity: 0, duration: 0.3, ease: "none" });
      else gsap.to(pageEl, { scale: 0.9, borderRadius: 10 * (innerWidth / 1512), opacity: 0.25, duration: 1, ease: "expo.out" });
      setTimeout(() => (location.href = to.href), portrait ? 300 : 120);
    });
  }

  // Photo stack — Pinned swaps instantly every 500ms, runs only while on screen, and stops when a hand is over it
  document.querySelectorAll("[data-stack]").forEach((st) => {
    const items = [...st.children];
    if (items.length < 2) return;
    let i = 0, timer = 0;
    items.forEach((el, n) => el.classList.toggle("is-on", n === 0));
    const step = () => { items[i].classList.remove("is-on"); i = (i + 1) % items.length; items[i].classList.add("is-on"); };
    const play = () => { if (reduced) return; clearInterval(timer); timer = setInterval(step, +st.dataset.stack || 500); };
    const stop = () => clearInterval(timer);
    ScrollTrigger.create({ trigger: st, start: "top bottom", end: "bottom top", onToggle: (s) => (s.isActive ? play() : stop()) });
    st.addEventListener("mouseenter", stop);
    st.addEventListener("mouseleave", () => ScrollTrigger.isInViewport(st) && play());
  });

  // Drag row — original Embla (dragFree) on the same build (8.6.0)
  if (window.EmblaCarousel) document.querySelectorAll("[data-rail]").forEach((vp) => EmblaCarousel(vp, { dragFree: true, align: "start", containScroll: "trimSnaps" }));

  // Collapsible — height at 750ms outExpo (the original’s shared collapse)
  CS.fold = (el, open) => {
    const from = el.offsetHeight, to = open ? el.scrollHeight : 0;
    gsap.fromTo(el, { height: from }, { height: to, duration: reduced ? 0 : 0.75, ease: "expo.out", onComplete: () => open && (el.style.height = "auto") });
  };

  // Footer — a black panel faintly rises over a gray background and settles down (tied to scroll)
  CS.mm.add("(prefers-reduced-motion: no-preference)", () => {
    const inner = document.querySelector(".cs-foot__in");
    if (!inner) return;
    gsap.fromTo(inner, { yPercent: -15, opacity: 0.35 }, { yPercent: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: ".cs-foot", start: "top bottom", end: "bottom bottom", scrub: true } });
  });

  // Skin variables as 0~1 RGB — so shaders and canvases follow the skin. Paints on a 1×1 canvas and reads it back, so oklab and color-mix values work too
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  CS.rgb = (v, mix) => {
    const css = getComputedStyle(document.documentElement);
    const val = v.startsWith("--") ? css.getPropertyValue(v).trim() : v;
    const d = document.createElement("i"); d.style.color = val; document.body.append(d);
    const c = getComputedStyle(d).color; d.remove();
    probe.clearRect(0, 0, 1, 1); probe.fillStyle = c; probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255];
  };
  CS.css = (arr) => `rgb(${arr.map((x) => Math.round(x * 255)).join(" ")})`;

  // 3D ∞ — stands up our thick ribbon ∞ with OGL. Tilts with mouse position (z ±.045π×10 · y ±.028π×10, 1000ms) and spins when dragged
  CS.glInf = (canvas, { drag = true } = {}) => {
    if (!window.OGL || !canvas) return;
    const { Renderer, Camera, Transform, Mesh, Program, Geometry, Vec3 } = OGL;
    const renderer = new Renderer({ canvas, dpr: Math.min(devicePixelRatio, 2), alpha: true, antialias: true });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const camera = new Camera(gl, { fov: 35 });
    camera.position.set(0, 0, 9);
    const scene = new Transform();
    // Built by winding a round tube along the ∞ centerline — same silhouette ratio instead of the original model (width 1.84 : height 1)
    const seg = 220, ring = 28, R = 0.34, pos = [], nor = [], idx = [];
    const c = (t) => { const s = Math.sin(t), k = 1 + s * s; return new Vec3((1.6 * Math.cos(t)) / k, (1.6 * Math.cos(t) * s) / k, 0.18 * Math.sin(t)); };
    for (let i = 0; i <= seg; i++) {
      const t = (i / seg) * Math.PI * 2, p = c(t), q = c(t + 0.001);
      const T = new Vec3().sub(q, p).normalize(), N = new Vec3(0, 0, 1).cross(T).normalize(), B = new Vec3().cross(T, N).normalize();
      for (let j = 0; j <= ring; j++) {
        const a = (j / ring) * Math.PI * 2, n = new Vec3().copy(N).scale(Math.cos(a)).add(new Vec3().copy(B).scale(Math.sin(a)));
        pos.push(p.x + n.x * R, p.y + n.y * R * 1.2, p.z + n.z * R);
        nor.push(n.x, n.y, n.z);
      }
    }
    for (let i = 0; i < seg; i++) for (let j = 0; j < ring; j++) { const a = i * (ring + 1) + j, b = a + ring + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const geometry = new Geometry(gl, { position: { size: 3, data: new Float32Array(pos) }, normal: { size: 3, data: new Float32Array(nor) }, index: { data: new Uint16Array(idx) } });
    const program = new Program(gl, {
      vertex: `attribute vec3 position; attribute vec3 normal; uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix; uniform mat3 normalMatrix; varying vec3 vN; varying vec3 vV;
        void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
      fragment: `precision highp float; varying vec3 vN; varying vec3 vV; uniform vec3 uInk; uniform vec3 uLight;
        void main(){ vec3 n = normalize(vN); float fr = pow(1. - max(dot(n, vV), 0.), 2.5);
          float band = smoothstep(.55,.6, n.y*.5+.5) * .35 + smoothstep(.92,.97, n.y*.5+.5) * .9;
          float spec = pow(max(dot(reflect(-normalize(vec3(.5,.7,1.)), n), vV), 0.), 40.);
          vec3 col = mix(uInk, uLight, clamp(band + spec + fr*.6, 0., 1.)); gl_FragColor = vec4(col, 1.); }`,
      uniforms: { uInk: { value: [0, 0, 0] }, uLight: { value: [1, 1, 1] } },
    });
    program.uniforms.uInk.value = CS.rgb("--kf-contrast-bg");
    program.uniforms.uLight.value = CS.rgb("--kf-contrast-ink");
    const pivot = new Transform(); pivot.setParent(scene); pivot.rotation.y = Math.PI / 2;
    const mesh = new Mesh(gl, { geometry, program }); mesh.setParent(pivot);
    const tilt = { z: 0, y: 0 }, spin = { y: 0, x: 0 };
    const qz = gsap.quickTo(tilt, "z", { duration: 1, ease: "expo.out" }), qy = gsap.quickTo(tilt, "y", { duration: 1, ease: "expo.out" });
    const onMove = (e) => { if (reduced || innerWidth <= 768) return; qz(((e.clientY / innerHeight) - 0.5) * Math.PI * 0.045 * 10 * -1); qy(((e.clientX / innerWidth) - 0.5) * Math.PI * 0.028 * 10 * -1); };
    addEventListener("pointermove", onMove);
    let down = null;
    if (drag) {
      canvas.addEventListener("pointerdown", (e) => { down = { x: e.clientX, y: e.clientY, sy: spin.y, sx: spin.x }; canvas.style.cursor = "grabbing"; canvas.setPointerCapture(e.pointerId); });
      canvas.addEventListener("pointermove", (e) => { if (!down) return; gsap.to(spin, { y: down.sy + (e.clientX - down.x) * 0.01, x: down.sx + (e.clientY - down.y) * 0.01, duration: 0.05, ease: "expo.out" }); });
      const up = () => { down = null; canvas.style.cursor = ""; };
      canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);
    }
    const resize = () => { const w = canvas.parentElement.clientWidth, h = canvas.parentElement.clientHeight; if (!w || !h) return; renderer.setSize(w, h); camera.perspective({ aspect: w / h }); };
    new ResizeObserver(resize).observe(canvas.parentElement);
    resize();
    let vis = false;
    new IntersectionObserver(([e]) => (vis = e.isIntersecting)).observe(canvas);
    gsap.ticker.add(() => {
      if (!vis) return;
      pivot.rotation.z = tilt.z; pivot.rotation.x = spin.x; pivot.rotation.y = Math.PI / 2 + tilt.y + spin.y;
      renderer.render({ scene, camera });
    });
  };
  if (foot) CS.glInf(foot.querySelector("canvas"));
})();
