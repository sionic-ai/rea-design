// Frame shared by all pages: header menu, phone menu, cookie window, loader, pixel-cell page transition, footer, plus motion helpers repeated throughout the original.
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText, Draggable, InertiaPlugin, CustomEase);
  // Seven curves the original made (names and values as is)
  [["accelerate", "1, 0, 1, 1"], ["natural", "0.8, 0, 0.2, 1"], ["slowDown", "0, 0, 0, 1"], ["slowDown-2", "0, 0.45, 0, 1"], ["smooth", "0.5, 0, 0, 1"], ["smooth-2", "0.63, 0, 0, 1"], ["smooth-3", "0.72, 0, 0, 1"]].forEach(([n, c]) => CustomEase.create(n, c));

  const page = document.body.dataset.page;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isDesk = () => innerWidth >= 1024;

  const logo = `<svg viewBox="0 0 7 7" aria-hidden="true"><path fill="currentColor" d="M0 0h7v7H0zM1 1v5h5V1zM2 2h1v1H2zM4 2h1v1H4zM2 4h3v1H2z" fill-rule="evenodd"/></svg><b data-label="Your brand’s English name here">Studio</b>`;
  const arr = `<i class="arr"></i>`;

  const NAV = [
    ["work", "index.html#work", "Menu 1"],
    ["services", "index.html#services", "Menu 2"],
  ];
  const roll = (t) => {
    const chars = [...t].map((c, i) => `<span class="ch" style="--i:${i}">${c}</span>`).join("");
    return `<span class="roll" aria-hidden="true"><span>${chars}</span><span>${chars}</span></span><span class="wf-sr" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">${t}</span>`;
  };

  // ── Header menu · phone menu ────────────────────
  const head = document.createElement("header");
  head.className = "site-head";
  head.dataset.slot = "header";
  head.innerHTML = `
    <a class="site-logo" href="index.html" aria-label="Back to start">${logo}</a>
    <nav class="site-nav" aria-label="Main menu">
      ${NAV.map(([k, h, t]) => `<a class="roll-host" href="${h}" data-k="${k}">${roll(t)}</a>`).join("")}
      <a class="roll-host is-cta" href="index.html#contact">${roll("Contact")}</a>
    </nav>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="m-menu"><span class="t">Menu</span> <i class="slash"></i><i class="x"></i></button>`;
  document.body.prepend(head);

  const mMenu = document.createElement("nav");
  mMenu.className = "m-menu";
  mMenu.id = "m-menu";
  mMenu.dataset.slot = "mobile-menu";
  mMenu.innerHTML = [...NAV.map(([, h, t]) => [h, t]), ["index.html#contact", "Contact"]].map(([h, t]) => `<div class="m-mask"><a href="${h}">${t}</a></div>`).join("") + `<button class="m-close" type="button">Close <i class="x"></i></button><i class="m-bg" aria-hidden="true"></i>`;
  const mClip = document.createElement("div");
  mClip.className = "m-clip";
  mClip.append(mMenu);
  // As in the original, the panel sits inside the header, so the logo lies over the panel and the ”Menu” button under it
  head.append(mClip);

  const menuBtn = head.querySelector(".menu-btn");
  // Original phone menu: the panel drops from -150% above with .75s elastic.out(1,1.25), and menu items rise from 100% below at .1 intervals (.5s power2.inOut) — closing reverses it
  const menuTl = gsap.timeline({ paused: true })
    .set(mMenu, { visibility: "visible" })
    .from(mMenu, { yPercent: -150, duration: 0.75, ease: "elastic.out(1, 1.25)" })
    .from(mMenu.querySelectorAll("a"), { yPercent: 100, stagger: 0.1, duration: 0.5, ease: "power2.inOut" }, "<-=0.1")
    .from(mMenu.querySelector(".m-close"), { autoAlpha: 0, duration: 0.5 }, ">-=0.1");
  // Leave the ”Menu” button as is, and close with the in-panel close button (original)
  const setMenu = (open) => {
    menuBtn.setAttribute("aria-expanded", open);
    head.classList.toggle("is-menu", open);
    open ? menuTl.play() : menuTl.reverse();
    (open ? mMenu.querySelector("a") : menuBtn)?.focus({ preventScroll: true });
  };
  menuBtn.addEventListener("click", () => setMenu(true));
  mMenu.addEventListener("click", (e) => (e.target.closest("a") || e.target.closest(".m-close")) && setMenu(false));
  addEventListener("keydown", (e) => e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true" && setMenu(false));

  // Logo text color follows whether the surface under the header is light or dark, and a translucent white pill is added on scroll down
  const headTone = () => {
    head.classList.toggle("is-solid", scrollY > 20);
    const hit = document.elementsFromPoint(60, 50).find((el) => el.closest("[data-head]") && !el.closest(".site-head"));
    head.classList.toggle("is-light", !!hit && hit.closest("[data-head]").dataset.head === "light");
  };
  addEventListener("scroll", headTone, { passive: true });

  // ── Cookie window ─────────────────────────────
  if (!localStorage.getItem("lib-1m1-cookie")) {
    const ck = document.createElement("aside");
    ck.className = "cookie";
    ck.dataset.slot = "cookie-banner";
    ck.innerHTML = `<h3><i class="slash"></i>A short cookie notice title</h3>
      <p>Your cookie notice goes here in two lines. Using the site counts as consent.</p>
      <div class="opts">
        <label class="opt"><div><b>Essential</b><span>Your one-line essential cookie description here.</span></div><input type="checkbox" checked disabled></label>
        <label class="opt"><div><b>Analytics</b><span>Your one-line analytics cookie description.</span></div><input type="checkbox"></label>
      </div>
      <div class="row"><button class="btn is-purple roll-host" type="button" data-ck>${roll("Accept all")}</button><button class="btn is-line roll-host" type="button" data-manage>${roll("Manage")}</button></div>`;
    document.body.append(ck);
    const close = () => {
      localStorage.setItem("lib-1m1-cookie", "1");
      // The original cookie window leaves right after consent (after the pressed button flashes a white background for .1s)
      setTimeout(() => ck.remove(), 100);
    };
    ck.querySelector("[data-ck]").addEventListener("click", close);
    ck.querySelector("[data-manage]").addEventListener("click", (e) => {
      if (ck.classList.contains("is-manage")) return close();
      ck.classList.add("is-manage");
      e.currentTarget.innerHTML = roll("Save");
    });
  }

  // ── Pixel-cell cover (page transition) ────────────────
  const cover = document.createElement("div");
  cover.className = "px-cover";
  cover.setAttribute("aria-hidden", "true");
  document.body.append(cover);
  const buildCover = () => {
    const n = isDesk() ? 16 : 6;
    const rows = Math.ceil(innerHeight / (innerWidth / n)) + 1;
    cover.style.gridTemplateColumns = `repeat(${n}, minmax(0, 1fr))`;
    cover.innerHTML = Array.from({ length: n }, () => `<div class="col">${'<i class="cell"></i>'.repeat(rows)}</div>`).join("");
    return { cols: cover.querySelectorAll(".col"), cells: [...cover.querySelectorAll(".cell")] };
  };
  // Original values: each cell row scaleY 0.7s·0.025s apart power2.inOut, and each cell appears and disappears in shuffled order
  const coverIn = (done) => {
    const { cols, cells } = buildCover();
    cover.classList.add("is-on");
    gsap.timeline({ onComplete: done })
      .set(cols, { transformOrigin: "50% 100%" })
      .from(cols, { scaleY: 0, duration: 0.7, stagger: 0.025, ease: "power2.inOut" })
      .from(gsap.utils.shuffle(cells), { autoAlpha: 0, stagger: 0.005 / cells.length * 12, duration: 0.7, ease: "power2.inOut" }, "<");
  };
  const coverOut = () => {
    const { cols, cells } = buildCover();
    cover.classList.add("is-on");
    return gsap.timeline({ onComplete: () => { cover.classList.remove("is-on"); cover.innerHTML = ""; } })
      .set(cols, { transformOrigin: "50% 0%" })
      .to(gsap.utils.shuffle(cells), { autoAlpha: 0, stagger: 0.005 / cells.length * 12, duration: 0.7, ease: "power2.inOut" })
      .to(cols, { scaleY: 0, duration: 0.7, stagger: 0.025, ease: "power2.inOut" }, "<");
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.metaKey || e.ctrlKey || a.target) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html$/.test(url.pathname)) return;
    if (url.pathname === location.pathname) {
      e.preventDefault();
      const t = url.hash && document.querySelector(url.hash);
      t && (window.lenis ? lenis.scrollTo(t, { duration: 1.5 }) : t.scrollIntoView());
      return;
    }
    if (reduce) return;
    e.preventDefault();
    sessionStorage.setItem("lib-1m1-cover", "1");
    coverIn(() => (location.href = url.href));
  });

  // ── Loader: only the first time. From the next page on, the cover lifts and the page enters ──
  const ready = new Set();
  const onReady = (fn) => (document.documentElement.classList.contains("is-loaded") ? fn() : ready.add(fn));
  const finish = () => {
    document.documentElement.classList.add("is-loaded");
    window.lenis && lenis.start();
    ready.forEach((fn) => fn());
    ready.clear();
    ScrollTrigger.refresh();
  };
  const fromCover = sessionStorage.getItem("lib-1m1-cover") === "1";
  sessionStorage.removeItem("lib-1m1-cover");
  const seen = sessionStorage.getItem("lib-1m1-seen") === "1";
  sessionStorage.setItem("lib-1m1-seen", "1");
  const runLoader = () => {
    if (reduce) return finish();
    if (fromCover || seen) { coverOut(); return finish(); }
    const ld = document.createElement("div");
    ld.className = "loader";
    ld.dataset.slot = "loader";
    ld.innerHTML = `<div class="loader-in"><div class="loader-title">${[..."Nearly there"].map((c) => `<span class="ch">${c}</span>`).join("")}</div><div class="loader-count">00</div></div>`;
    document.body.append(ld);
    const chars = ld.querySelectorAll(".ch");
    const count = ld.querySelector(".loader-count");
    const n = { v: 0 };
    gsap.timeline({ onComplete: () => { ld.remove(); coverOut(); finish(); } })
      .from(chars, { yPercent: (i) => (i % 2 ? 100 : -100), duration: 0.7, ease: "slowDown", stagger: { each: 0.03, from: "random" } })
      .to(n, { v: 100, duration: 1.4, ease: "power1.inOut", onUpdate: () => (count.textContent = String(Math.round(n.v)).padStart(2, "0")) }, 0)
      .to(chars, { yPercent: (i) => (i % 2 ? -100 : 100), duration: 0.5, ease: "power2.in", stagger: { each: 0.02, from: "random" } }, ">")
      .to(count, { autoAlpha: 0, duration: 0.3 }, "<");
  };

  // ── Smooth scroll ────────────────────────
  if (!reduce && window.Lenis) {
    window.lenis = new Lenis({ lerp: 0.1, autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  // ── Footer ─────────────────────────────────────
  const foot = document.querySelector("[data-foot]");
  if (foot) {
    const words = ["Keyword", "Another", "Third", "Fourth", "Fifth"];
    const copy = words.map((w) => `<span class="px px-thin is-ink">${w}</span>`).join("");
    foot.outerHTML = `<footer class="site-foot" data-slot="footer" data-head="dark">
      <div class="foot-gl" data-trail="var(--kf-surface)" aria-hidden="true"></div>
      <div class="foot-in">
        <div class="top"><button class="to-top" type="button"><i class="stair"></i>Back to top</button><a class="site-logo" href="index.html" aria-label="Back to start">${logo}</a></div>
        <div class="foot-marquee" aria-hidden="true"><div class="track" data-label="Five English words for company values">${copy}${copy}</div>
          <div class="foot-social">
            <a class="pill" href="#" style="left:41%;top:16%">Social 1 <i class="ne"></i></a>
            <a class="pill" href="#" style="left:15%;top:62%">Social 2 <i class="ne"></i></a>
            <a class="pill" href="#" style="left:66%;top:55%">Social 3 <i class="ne"></i></a>
          </div>
        </div>
        <div class="foot-bottom">
          <span class="copy">© 0000 Studio Name. All rights reserved.</span>
          <a class="btn is-dark roll-host" href="game.html">${roll("Play the game")}</a>
          <span class="links"><a class="roll-host" href="#">${roll("Cookies")}</a><i class="slash"></i><a class="roll-host" href="#">${roll("Privacy")}</a><i class="slash"></i><a class="roll-host" href="#">${roll("Terms")}</a></span>
        </div>
      </div></footer>`;
    const f = document.querySelector(".site-foot");
    f.querySelector(".to-top").addEventListener("click", () => (window.lenis ? lenis.scrollTo(0, { duration: 2 }) : scrollTo(0, 0)));
    if (!reduce) {
      const track = f.querySelector(".track");
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        // Original: the footer inner slides down from -100% to be revealed, and the band makes a half-width lap in 45s
        gsap.from(f.querySelector(".foot-in"), { yPercent: -100, ease: "none", scrollTrigger: { trigger: f, start: "top bottom", end: () => `+=${f.offsetHeight}`, scrub: true } });
        gsap.to(track, { x: () => -(track.offsetWidth + 100) * 0.5, duration: 45, repeat: -1, ease: "none", scrollTrigger: { trigger: f, start: "top bottom", end: "bottom top", toggleActions: "play pause play pause" } });
        f.querySelectorAll(".pill").forEach((p) => gsap.to(p, { y: "random(-25, 15)", ease: "none", scrollTrigger: { trigger: p, start: "top bottom", end: "bottom top", scrub: true } }));
      });
    }
  }

  // ── Keywords that bounce with mouse speed (original momentum hover) ──
  const mouse = { x: 0, y: 0, vx: 0, vy: 0, t: 0 };
  addEventListener("mousemove", (e) => {
    const now = performance.now();
    if (now - mouse.t < 16) return;
    mouse.t = now; mouse.vx = e.clientX - mouse.x; mouse.vy = e.clientY - mouse.y; mouse.x = e.clientX; mouse.y = e.clientY;
  }, { passive: true });
  const clamp = gsap.utils.clamp;
  const flick = (el, target = el) => el.addEventListener("mouseenter", (e) => {
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy);
    const rot = d < 1 ? 0 : ((dx * mouse.vy - dy * mouse.vx) / d) * 20;
    gsap.to(target, { inertia: { x: { velocity: clamp(-200, 200, mouse.vx * 30), end: 0 }, y: { velocity: clamp(-200, 200, mouse.vy * 30), end: 0 }, rotation: { velocity: clamp(-60, 60, rot), end: 0 }, resistance: 200 } });
  });

  // ── Text rising line by line (original LINE_Y 70 · gap .1 · .5s · power2.inOut) ──
  const lines = (root = document) => root.querySelectorAll("[data-lines]").forEach((el) => {
    const split = SplitText.create(el, { type: "lines", linesClass: "ln", mask: "lines" });
    gsap.from(split.lines, { yPercent: 70, autoAlpha: 0, stagger: 0.1, duration: 0.5, ease: "power2.inOut", scrollTrigger: { trigger: el, start: "top bottom-=100", once: true } });
  });

  // ── Stair band (pixel stair pattern found throughout the original) — cell size c, a band of thickness t rising from bottom-left to top-right, drawn as SVG rects ──
  const stairs = (svg, { cell = 40, thick = 5, slope = 0.55, seed = 1, start = 0.85, color = "currentColor", fade = 0 } = {}) => {
    const W = svg.clientWidth || svg.parentElement.clientWidth, H = svg.clientHeight || svg.parentElement.clientHeight;
    const cols = Math.ceil(W / cell) + 1, rows = Math.ceil(H / cell) + 1;
    let s = seed;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    let y = Math.round(rows * start), acc = 0, out = "";
    for (let i = 0; i < cols; i++) {
      acc += slope + (rnd() - 0.5) * 0.6;
      while (acc >= 1) { y--; acc--; }
      const t = thick + Math.round((rnd() - 0.5) * 2);
      for (let j = 0; j < t; j++) {
        const op = fade ? 1 - (j / t) * fade : 1;
        out += `<rect x="${i * cell}" y="${(y + j) * cell}" width="${cell + 0.5}" height="${cell + 0.5}" fill-opacity="${op.toFixed(2)}"/>`;
      }
    }
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("fill", color);
    svg.innerHTML = out;
  };

  // Skin variables and color formulas as sRGB 0~1 — user variables are read as pre-computation text (oklch(from …)), so read a painted pixel instead (for WebGL painting)
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const css2rgb = (css, el = document.body) => {
    const i = document.createElement("i");
    i.style.cssText = `position:absolute;visibility:hidden;color:${css}`;
    el.append(i);
    probe.fillStyle = getComputedStyle(i).color;
    i.remove();
    probe.clearRect(0, 0, 1, 1); probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  // ── Pixel trail (original WebGL — desktop 1024 and up): every time the mouse moves over 1px, a 125px stamp is printed for exactly .7s (max 150, pushed along with the scroll).
  //    The stamp is drawn on a 50-column panel at the window’s ratio, and each 25px cell attached to the document reads that panel —
  //    [data-trail] background panel takes the trail color past .2, [data-trail-video] video face · [data-trail-media] photo face brighten 1.2x while breaking into 25px only on the bright cells the trail has passed.
  //    Photo faces are the original case card · next case image — placeholder boxes have no image to break, so apply only when an img · video is put inside ──
  const trailEls = [...document.querySelectorAll("[data-trail], [data-trail-video], [data-trail-media]")].filter((el) => !el.matches("[data-trail-media]") || el.querySelector("img, video"));
  if (trailEls.length && window.THREE && !reduce && matchMedia("(min-width: 1024px) and (hover: hover)").matches) {
    const T = THREE, CFG = { scale: 125, max: 150, life: 0.7, cell: 25, edge: 0.2, edgeVideo: 0.25, bright: 1.2 };
    const rgb = (css, el) => new T.Color().setRGB(...css2rgb(css, el), T.SRGBColorSpace);
    const scrollY = () => (window.lenis ? lenis.scroll : window.scrollY);
    // Stamp: a circle solid in the center and fading toward the edges
    const brush = document.createElement("canvas");
    brush.width = brush.height = 64;
    const bx = brush.getContext("2d"), bg = bx.createRadialGradient(32, 32, 0, 32, 32, 32);
    bg.addColorStop(0, "rgba(255,255,255,1)"); /* Not skin: stamp alpha panel (not visible on screen) */
    bg.addColorStop(1, "rgba(255,255,255,0)"); /* Not skin: stamp alpha plate */
    bx.fillStyle = bg; bx.fillRect(0, 0, 64, 64);
    const brushTex = new T.CanvasTexture(brush);
    const stampVert = `uniform float uTime, uBirth, uBirthScroll, uScroll, uLife; varying float vOn; varying vec2 vUv;
      void main() { vec4 p = modelMatrix * vec4(position, 1.0); p.y += uScroll - uBirthScroll; gl_Position = projectionMatrix * viewMatrix * p;
        vUv = uv; float age = uTime - uBirth; vOn = (age >= 0.0 && age <= uLife) ? 1.0 : 0.0; }`;
    const stampFrag = `uniform sampler2D uTex; varying float vOn; varying vec2 vUv;
      void main() { if (vOn < 0.5) discard; gl_FragColor = texture2D(uTex, vUv); }`;
    // Where a point on the plate lands on screen — measured back through center·size·tilt (CSS rotate). Cells are document-relative, so scroll is added to cut it off
    const common = `uniform sampler2D uTouch; uniform vec2 uRes, uCenter, uSize; uniform float uAngle, uScroll, uCell; varying vec2 vUv;
      vec2 cellOf(vec2 px) { float py = px.y + uScroll; vec2 c = (floor(vec2(px.x, py) / uCell) + 0.5) * uCell; return vec2(c.x / uRes.x, 1.0 - (c.y - uScroll) / uRes.y); }
      vec2 screenOf() { vec2 d = (vUv - 0.5) * uSize * vec2(1.0, -1.0); float c = cos(uAngle), s = sin(uAngle); return uCenter + vec2(c * d.x - s * d.y, s * d.x + c * d.y); }`;
    const bgFrag = common + `uniform vec3 uColor, uTrail; uniform float uEdge;
      void main() { float on = step(uEdge, texture2D(uTouch, clamp(cellOf(screenOf()), 0.0, 1.0)).r); gl_FragColor = vec4(mix(uColor, uTrail, on), 1.0);
        #include <colorspace_fragment>
      }`;
    const videoFrag = common + `uniform sampler2D uVideo; uniform vec2 uVideoSize; uniform float uEdge, uBright;
      vec2 cover(vec2 uv) { float rs = uSize.x / uSize.y, ri = uVideoSize.x / max(1.0, uVideoSize.y); vec2 sc = rs < ri ? vec2(rs / ri, 1.0) : vec2(1.0, ri / rs); return (uv - 0.5) * sc + 0.5; }
      void main() {
        vec2 n = uSize / uCell, puv = (floor(vUv * n) + 0.5) / n;
        vec3 orig = texture2D(uVideo, cover(vUv)).rgb, pix = texture2D(uVideo, cover(puv)).rgb;
        float m = dot(texture2D(uTouch, clamp(cellOf(screenOf()), 0.0, 1.0)).rgb, vec3(0.2126, 0.7152, 0.0722));
        float lum = dot(pix, vec3(0.2126, 0.7152, 0.0722));
        float k = smoothstep(uEdge - 0.2, uEdge, lum) * smoothstep(uEdge - 0.2, uEdge, m);
        gl_FragColor = vec4(mix(orig, pix * uBright, k), 1.0);
        #include <colorspace_fragment>
      }`;
    // Video tagged as cross-origin (when opened via file://) can’t be read by WebGL, so draw one frame and try reading it — if blocked, skip the tail of that video
    const readable = (v) => {
      try { const c = document.createElement("canvas"); c.width = c.height = 2; const x = c.getContext("2d"); x.drawImage(v, 0, 0, 2, 2); x.getImageData(0, 0, 1, 1); return true; } catch (e) { return false; }
    };
    const targets = trailEls.map((el) => {
      const video = el.matches("[data-trail-video], [data-trail-media]") ? el.querySelector("video, img") : null;
      const isImg = video?.tagName === "IMG";
      const R = new T.WebGLRenderer({ alpha: true, antialias: false });
      R.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      R.outputColorSpace = T.SRGBColorSpace;
      R.domElement.className = "trail-gl";
      el.append(R.domElement);
      const u = { uTouch: { value: null }, uRes: { value: new T.Vector2() }, uCenter: { value: new T.Vector2() }, uSize: { value: new T.Vector2() }, uAngle: { value: 0 }, uScroll: { value: 0 }, uCell: { value: CFG.cell } };
      let ok = true;
      if (video) {
        // Don’t draw until the first video frame has arrived and is confirmed readable
        ok = false;
        const tex = isImg ? new T.Texture(video) : new T.VideoTexture(video);
        tex.colorSpace = T.SRGBColorSpace;
        Object.assign(u, { uVideo: { value: tex }, uVideoSize: { value: new T.Vector2(16, 9) }, uEdge: { value: CFG.edgeVideo }, uBright: { value: CFG.bright } });
        const check = () => {
          u.uVideoSize.value.set(video.videoWidth || video.naturalWidth, video.videoHeight || video.naturalHeight);
          ok = readable(video); R.domElement.hidden = !ok; tex.needsUpdate = true;
        };
        R.domElement.hidden = true;
        if (isImg ? video.complete && video.naturalWidth : video.readyState >= 2) check(); else video.addEventListener(isImg ? "load" : "loadeddata", check, { once: true });
      } else Object.assign(u, { uColor: { value: rgb(getComputedStyle(el).backgroundColor) }, uTrail: { value: rgb(el.dataset.trail, el) }, uEdge: { value: CFG.edge } });
      const scene = new T.Scene(), cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const mat = new T.ShaderMaterial({ vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }", fragmentShader: video ? videoFrag : bgFrag, uniforms: u });
      scene.add(new T.Mesh(new T.PlaneGeometry(2, 2), mat));
      const rt = new T.WebGLRenderTarget(50, 32);
      let seen = false;
      new IntersectionObserver((e) => (seen = e[0].isIntersecting)).observe(el);
      return { el, R, scene, cam, u, rt, seen: () => seen && ok, w: 0, h: 0 };
    });
    // The stamp board is an orthographic camera at window size — each board draws the same scene with its own renderer
    const touch = new T.Scene(), tcam = new T.OrthographicCamera(-1, 1, 1, -1, 1, 1000);
    tcam.position.z = 1;
    const quad = new T.PlaneGeometry(1, 1);
    const stamps = Array.from({ length: CFG.max }, () => {
      const m = new T.Mesh(quad, new T.ShaderMaterial({ vertexShader: stampVert, fragmentShader: stampFrag, transparent: true, depthTest: false, depthWrite: false,
        uniforms: { uTime: { value: 0 }, uBirth: { value: -999 }, uBirthScroll: { value: 0 }, uScroll: { value: 0 }, uLife: { value: CFG.life }, uTex: { value: brushTex } } }));
      m.scale.set(CFG.scale, CFG.scale, 1);
      touch.add(m);
      return m;
    });
    let W = 0, H = 0, next = 0;
    const size = () => {
      W = innerWidth; H = innerHeight;
      Object.assign(tcam, { left: -W / 2, right: W / 2, top: H / 2, bottom: -H / 2 });
      tcam.updateProjectionMatrix();
      targets.forEach((p) => { p.rt.setSize(50, Math.max(1, Math.round((50 * H) / W))); p.u.uRes.value.set(W, H); });
    };
    size();
    addEventListener("resize", size);
    // If shaders are first compiled when the panel first enters the screen, it freezes for 0.5s on the spot — compile everything up front when setting up
    targets.forEach((p) => { p.R.compile(p.scene, p.cam); p.R.compile(touch, tcam); p.R.initRenderTarget?.(p.rt); });
    const last = { x: null, y: null };
    addEventListener("mousemove", (e) => {
      const x = e.clientX - W / 2, y = -e.clientY + H / 2;
      if (last.x !== null && (x - last.x) ** 2 + (y - last.y) ** 2 < 1) return;
      last.x = x; last.y = y;
      const m = stamps[next];
      next = (next + 1) % CFG.max;
      m.position.set(x, y, 0);
      m.material.uniforms.uBirth.value = performance.now() / 1000;
      m.material.uniforms.uBirthScroll.value = scrollY();
    }, { passive: true });
    gsap.ticker.add(() => {
      const now = performance.now() / 1000, sy = scrollY();
      stamps.forEach((m) => { m.material.uniforms.uTime.value = now; m.material.uniforms.uScroll.value = sy; });
      targets.forEach((p) => {
        if (!p.seen()) return;
        // Plate size changes even during expansion (width·height animation), so check it on every draw
        const w = p.el.clientWidth, h = p.el.clientHeight, r = p.el.getBoundingClientRect();
        if (w !== p.w || h !== p.h) { p.w = w; p.h = h; p.R.setSize(w, h, false); }
        p.u.uCenter.value.set(r.left + r.width / 2, r.top + r.height / 2);
        p.u.uSize.value.set(w, h);
        p.u.uAngle.value = ((+gsap.getProperty(p.el, "rotation") || 0) * Math.PI) / 180;
        p.u.uScroll.value = sy;
        p.R.setRenderTarget(p.rt); p.R.clear(); p.R.render(touch, tcam); p.R.setRenderTarget(null);
        p.u.uTouch.value = p.rt.texture;
        p.R.render(p.scene, p.cam);
      });
    });
  }

  // Places where the text-roll button is written directly in HTML are changed to the same type
  document.querySelectorAll("[data-roll]").forEach((el) => (el.innerHTML = roll(el.textContent.trim())));

  // ── Letter roll (original BtnPrimary · BtnText, desktop only): per line, letters rise one step — .2s power1.inOut · .03s stagger, second line .1s later.
  //    forward on entry, reversed on exit ──
  const rollHosts = new WeakSet();
  const bindRoll = (host) => {
    if (rollHosts.has(host)) return;
    rollHosts.add(host);
    gsap.matchMedia().add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const lines = [...host.querySelectorAll(".roll > span")];
      if (!lines.length) return;
      const tl = gsap.timeline({ paused: true });
      lines.forEach((ln, i) => tl.to(ln.querySelectorAll(".ch"), { yPercent: -100, ease: "power1.inOut", stagger: 0.03, duration: 0.2 }, i ? "<+0.1" : 0));
      // In the original, the header menu text (WORK·SERVICES) did not roll on hover on any of the three pages when measured — only the contact button rolls
      if (host.closest(".site-head") && !host.classList.contains("is-cta")) return () => tl.revert();
      const on = () => tl.play(), off = () => tl.reverse();
      host.addEventListener("mouseenter", on); host.addEventListener("mouseleave", off);
      host.addEventListener("focus", on); host.addEventListener("blur", off);
      return () => { host.removeEventListener("mouseenter", on); host.removeEventListener("mouseleave", off); host.removeEventListener("focus", on); host.removeEventListener("blur", off); tl.revert(); };
    });
  };
  const bindRolls = (root = document) => root.querySelectorAll(".roll-host").forEach(bindRoll);
  // Also rebind buttons that swap roll text in later (cookie ”Save” etc.)
  new MutationObserver((ms) => ms.forEach((m) => m.target.closest?.(".roll-host") && (rollHosts.delete(m.target.closest(".roll-host")), bindRoll(m.target.closest(".roll-host"))))).observe(document.body, { childList: true, subtree: true });

  window.M1 = { reduce, isDesk, onReady, flick, lines, stairs, roll, mouse, css2rgb };

  addEventListener("DOMContentLoaded", () => {
    headTone();
    document.querySelectorAll(".tag[data-flick], .foot-social .pill").forEach(flick);
    bindRolls();
    // Line splitting happens after the title font (Archivo 125%) loads — splitting earlier would set lines at the narrow fallback font width, and each English line would re-wrap
    document.fonts.ready.then(() => { if (!reduce) lines(); runLoader(); });
  });
})();
