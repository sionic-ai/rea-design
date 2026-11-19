// Shared by all pages: draws the header buttons, three popups and footer in one place, and the loading curtain, page transition, reveal, wheel spin and
// Hangs the section background wave panel (one three r148 canvas). Original numbers: loading .15s power1.out · transition .3s power2.out ·
// Popup .3s power1.out (close .35) · phone panel y 100%→0 .3s power2.out · appear .3s (opacity power1.out · position power2.out, 70% of screen) ·
// Wave panel frequency 3 · amplitude 1% of width · horizontal flow -.4/s · time .2 (phone 3.8 · 5% · -.8 · .6).
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pcQuery = matchMedia("(min-width: 768px)");
  const isPc = () => pcQuery.matches;
  const page = document.body.dataset.page || "home";
  const SW = (window.SW = { reduced, isPc, page, ready: [] });
  if (reduced) document.documentElement.classList.add("no-motion");

  const arrow = '<span class="sw-circle__arrow" aria-hidden="true">→</span>';
  const circle = (cls = "") => `<span class="sw-circle ${cls}"><span class="sw-circle__fill"></span>${arrow}</span>`;
  const icons = {
    menu: '<svg viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="3" r="1.1"/><circle cx="8" cy="3" r="1.1"/><circle cx="13" cy="3" r="1.1"/><circle cx="3" cy="8" r="1.1"/><circle cx="8" cy="8" r="1.1"/><circle cx="13" cy="8" r="1.1"/><circle cx="3" cy="13" r="1.1"/><circle cx="8" cy="13" r="1.1"/><circle cx="13" cy="13" r="1.1"/></svg>',
    close: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4"><path d="m1 1 12 12M13 1 1 13"/></svg>',
    car: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 10.5 6.6 6.3A2 2 0 0 1 8.5 5h7a2 2 0 0 1 1.9 1.3L19 10.5a2 2 0 0 1 1.5 1.9V17a1 1 0 0 1-1 1h-1.2a1 1 0 0 1-1-1v-1H6.7v1a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1v-4.6A2 2 0 0 1 5 10.5Zm2.2-.3h9.6l-1.1-3a.8.8 0 0 0-.8-.5H9.1a.8.8 0 0 0-.8.5ZM6.8 14a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Zm10.4 0a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z"/></svg>',
    person: '<svg viewBox="0 0 24 24"><circle cx="12" cy="7.5" r="4" class="is-orange" fill="currentColor"/><path d="M4 21c.4-4.6 3.8-7 8-7s7.6 2.4 8 7Z" fill="currentColor"/><path d="m12 14 1.4 2.2L12 21l-1.4-4.8Z" fill="var(--kf-bg)"/></svg>',
    home: '<svg viewBox="0 0 14 14" width="13" height="13" fill="currentColor"><path d="M7 1 1 6.2h1.6V13h3.2V9h2.4v4h3.2V6.2H13Z"/></svg>',
    chev: '<svg viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1.2"><path d="m2.5 1 3 3-3 3"/></svg>',
    out: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 9 9 3M4.5 3H9v4.5"/></svg>',
    up: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M6 10.5v-9M2.5 5 6 1.5 9.5 5"/></svg>'
  };
  SW.circle = circle;
  SW.icons = icons;

  // Redraws the original thumbnail frame (a rounded rectangle slightly bulging top and bottom) as a superellipse — n 4.2
  const squircle = (() => {
    const n = 4.2, pts = [];
    for (let i = 0; i < 72; i++) {
      const t = (Math.PI * 2 * i) / 72, c = Math.cos(t), s = Math.sin(t);
      pts.push(`${(0.5 + 0.5 * Math.sign(c) * Math.abs(c) ** (2 / n)).toFixed(4)} ${(0.5 + 0.5 * Math.sign(s) * Math.abs(s) ** (2 / n)).toFixed(4)}`);
    }
    return "M" + pts.join(" L") + "Z";
  })();
  document.body.insertAdjacentHTML("afterbegin", `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><clipPath id="sw-squircle" clipPathUnits="objectBoundingBox"><path d="${squircle}"/></clipPath></svg><div class="sw-loader" data-slot="loader"></div>`);

  // ── Header and popup ──
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    const logoWhite = head.dataset.logo === "white" ? " is-white" : "";
    const logoSpWhite = head.dataset.logoSp === "white" ? " is-sp-white" : "";
    head.innerHTML = `
      <a class="sw-logo${logoWhite}${logoSpWhite}" href="index.html" aria-label="Home" data-label="Company logo wordmark"><span class="sw-logo__mark">Brand Taxi</span><span class="sw-logo__sub">BRAND KOUTSU</span></a>
      <button class="sw-menu-btn sw-menu-top" type="button" aria-label="Open Menu" data-open="sw-pop-menu"><span class="circle"></span>${icons.menu}</button>
      <div class="sw-head" data-head>
        <button class="sw-menu-btn" type="button" aria-label="Open Menu" data-open="sw-pop-menu"><span class="circle"></span>${icons.menu}</button>
        <button class="sw-pill is-taxi" type="button" data-open="sw-pop-taxi" data-shrink><span class="sw-pill__icon">${icons.car}</span><span class="sw-pill__wrap"><span class="sw-pill__text">Call a Taxi</span></span></button>
        <button class="sw-pill is-recruit" type="button" data-open="sw-pop-recruit" data-shrink><span class="sw-pill__icon">${icons.person}</span><span class="sw-pill__wrap"><span class="sw-pill__text">Hiring Info</span></span><span class="sw-pill__short">Hiring</span></button>
        <button class="sw-menu-btn is-bottom" type="button" aria-label="Open Menu" data-open="sw-pop-menu" aria-hidden="true"><span class="circle"></span>${icons.menu}</button>
      </div>`;
    const links = [
      ["Message from the CEO", "about.html"], ["Company overview", "about.html"], ["Our safety promise", "about.html"], ["Our service promise", "about.html"],
      ["Private car and driver dispatch", "service.html"], ["App guide", "service.html"], ["News List", "news.html"],
      ["Pricing Info", "service.html"], ["Lost and Found Info", "contact.html"], ["Frequently asked questions", "contact.html"], ["Contact Us", "contact.html"]
    ];
    const tel = (place) => `<li class="sw-tel"><span><span class="sw-tel__place">${place}</span><span class="sw-tel__num">0000-000-000</span></span>${circle("is-l")}</li>`;
    const area = (name, office) => `<li class="sw-area"><div><span class="sw-area__name">${name}</span><span class="sw-area__office">${office}</span></div><div class="sw-area__links"><a class="sw-chip" href="recruit.html">Application guidelines</a><a class="sw-chip" href="recruit.html">Company Briefing</a></div></li>`;
    document.body.insertAdjacentHTML("beforeend", `
      <div class="sw-popup" id="sw-pop-menu" data-slot="menu-popup" role="dialog" aria-modal="true" aria-label="Menu">
        <div class="sw-popup__bg" data-close></div>
        <button class="sw-popup__close" type="button" aria-label="Close" data-close>${icons.close}</button>
        <div class="sw-popup__inner"><nav class="sw-popup__panel" data-panel>
          <a class="sw-menu-home" href="index.html">${icons.home}<span>HOME</span></a>
          <div class="sw-popup__body">
            <ul class="sw-menu-lang"><li><a href="#">ENGLISH</a></li><li><a href="#">CHINESE</a></li></ul>
            <div class="sw-menu-grid">
              <div>
                <a class="sw-banner is-blue" href="service.html" data-hover><span class="sw-banner__bg"></span><span class="sw-banner__sub">MAIN SERVICE</span><span class="sw-banner__text"><span>Taxi Service</span>${circle()}</span></a>
                <a class="sw-banner is-red" href="service.html" data-hover><span class="sw-banner__bg"></span><span class="sw-banner__sub">EVENT &amp; TOUR</span><span class="sw-banner__text"><span>Events · Tours</span>${circle()}</span></a>
                <a class="sw-banner is-yellow" href="recruit.html" data-hover><span class="sw-banner__bg"></span><span class="sw-banner__sub">RECRUITING</span><span class="sw-banner__text"><span>View job info</span>${circle()}</span></a>
                <div class="sw-menu-media"><div class="wf-img" style="aspect-ratio:600/74" data-label="Recruitment site strip banner · group photo of engineers · landscape 600:74"></div></div>
              </div>
              <ul class="sw-list-link">${links.map(([t, h]) => `<li><a href="${h}"><span>${t}</span>${icons.chev}</a></li>`).join("")}</ul>
            </div>
          </div>
        </nav></div>
      </div>
      <div class="sw-popup" id="sw-pop-taxi" data-slot="call-popup" role="dialog" aria-modal="true" aria-label="Call a Taxi">
        <div class="sw-popup__bg" data-close></div>
        <button class="sw-popup__close" type="button" aria-label="Close" data-close>${icons.close}</button>
        <div class="sw-popup__inner"><section class="sw-popup__panel" data-panel>
          <h2 class="sw-popup__title">Call a Taxi</h2>
          <div class="sw-popup__body">
            <ul class="sw-tel-list">${tel("Region 1")}${tel("Region 2")}${tel("Region 3")}${tel("Region 4")}</ul>
            <div style="display:flex;gap:1rem;justify-content:center;margin-top:2rem"><a class="sw-chip" href="service.html">Register Service 1</a><a class="sw-chip" href="service.html">Service 2 Info</a></div>
            <div class="wf-img" style="aspect-ratio:1152/220;margin-top:2rem;border-radius:1rem" data-label="App launch banner · phone screen cutout + color background · landscape strip"></div>
          </div>
        </section></div>
      </div>
      <div class="sw-popup" id="sw-pop-recruit" data-slot="recruit-popup" role="dialog" aria-modal="true" aria-label="Hiring Info">
        <div class="sw-popup__bg" data-close></div>
        <button class="sw-popup__close" type="button" aria-label="Close" data-close>${icons.close}</button>
        <div class="sw-popup__inner"><section class="sw-popup__panel" data-panel>
          <h2 class="sw-popup__title">Hiring Info</h2>
          <div class="sw-popup__body">
            <ul>${area("Region 1", "Branch 1 / Branch 2 / Branch 3")}${area("Region 2", "Branch 4 / Branch 5")}${area("Region 3", "Branch 6 / Branch 7")}${area("Region 4", "")}</ul>
            <a class="wf-img" href="recruit.html" style="display:block;aspect-ratio:1152/260;margin-top:2rem;border-radius:1.5rem" data-label="Recruiting banner · smiling driver upper body · navy background wide"></a>
          </div>
        </section></div>
      </div>`);
  }

  // Footer — eight channel cells and two banners on a yellow panel, a row of white links, copyright
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    const ch = ["Channel 1", "Channel 2", "Channel 3", "Channel 4", "Channel 5", "Channel 6", "Channel 7", "Channel 8"];
    foot.outerHTML = `
      <section class="sw-contents" data-slot="footer-channels">
        <div class="sw-contents__body">
          <div class="sw-bg" data-wave='{"color":"yellow","type":"both","sp":{"frequency":3.3,"amplitude":0.025}}'></div>
          <ul class="sw-channels" data-rise>${ch.map((c) => `<li><a class="sw-channel" href="#"><span class="sw-channel__icon"><span class="sw-squircle"><span class="sw-ph" data-label="Channel app icon">Channel app<br>Icon</span></span><span class="sw-channel__badge"><span class="sw-channel__dot"></span>${icons.out}</span></span><span class="sw-channel__name">${c}</span></a></li>`).join("")}</ul>
          <div class="sw-media" data-rise>
            <a class="wf-img" href="#" style="aspect-ratio:600/74" data-label="Job media banner · yellow text logo · landscape 600:74"></a>
            <a class="wf-img" href="recruit.html" style="aspect-ratio:600/74" data-label="Recruit site banner · group photo of drivers + bold text · landscape"></a>
          </div>
        </div>
      </section>
      <footer class="sw-footer" data-slot="footer">
        <div class="sw-footer__links">
          <button class="sw-pagetop" type="button" data-pagetop><span class="sw-circle">${'<span class="sw-circle__fill"></span>' + arrow}</span><span>PAGE TOP</span></button>
          <a href="service.html">Pricing Info</a><a href="contact.html">Lost and Found Info</a><a href="contact.html">Terms of use · Privacy</a><a href="contact.html">Frequently asked questions</a><a href="contact.html">Inquiry</a><a href="news.html">Column</a><a href="contact.html">Online survey</a>
        </div>
        <p class="sw-copyright">Copyright, 0000 BRAND KOUTSU GROUP.</p>
      </footer>`;
  }

  // ── Popup Open/Close ──
  let openPop = null;
  const panelOf = (pop) => pop.querySelector("[data-panel]");
  const open = (pop) => {
    if (!pop) return;
    gsap.killTweensOf([pop, panelOf(pop)]);
    document.body.classList.add("is-locked");
    openPop = pop;
    const tl = gsap.timeline();
    tl.set(pop, { pointerEvents: "auto" }, 0).fromTo(pop, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, 0);
    if (!isPc()) tl.fromTo(panelOf(pop), { yPercent: 100 }, { yPercent: 0, duration: 0.3, ease: "power2.out" }, 0);
    else gsap.set(panelOf(pop), { yPercent: 0 });
  };
  const close = (pop) => {
    if (!pop) return;
    gsap.killTweensOf([pop, panelOf(pop)]);
    document.body.classList.remove("is-locked");
    openPop = null;
    const tl = gsap.timeline();
    tl.set(pop, { pointerEvents: "none" }, 0).fromTo(pop, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.35, ease: "power1.out" }, 0);
    if (!isPc()) tl.fromTo(panelOf(pop), { yPercent: 0 }, { yPercent: 100, duration: 0.35, ease: "power2.out" }, 0);
  };
  document.addEventListener("click", (e) => {
    const o = e.target.closest("[data-open]");
    if (o) { close(openPop); open(document.getElementById(o.dataset.open)); return; }
    if (e.target.closest("[data-close]")) close(e.target.closest(".sw-popup"));
    if (e.target.closest("[data-pagetop]")) gsap.to(window, { scrollTo: { y: 0 }, duration: reduced ? 0 : 0.5 });
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") close(openPop); });

  // ── Phone: past 70px of scroll, the bottom bar button keeps only its icon and the menu circle stands beside it (.44s power2.out, reversed with power2.in on return) ──
  const headEl = document.querySelector("[data-head]");
  let shrinkTl = null, shrunk = false;
  const buildShrink = (back) => {
    const ease = "power2." + (back ? "in" : "out");
    const tl = gsap.timeline({ paused: true });
    const bottomMenu = headEl.querySelector(".sw-menu-btn.is-bottom");
    const wraps = [...headEl.querySelectorAll("[data-shrink] .sw-pill__wrap")];
    const shorts = [...headEl.querySelectorAll(".sw-pill__short")];
    const shortIcons = shorts.map((s) => s.parentElement.querySelector(".sw-pill__icon"));
    tl.fromTo(bottomMenu, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.22, ease }, 0);
    if (shorts.length) {
      tl.fromTo(shorts, { left: "16.8vw", autoAlpha: 0 }, { left: (50 / 375) * 100 + "vw", autoAlpha: 1, duration: 0.44, ease }, 0);
      tl.fromTo(shortIcons, { marginLeft: 0 }, { marginLeft: (-28 / 375) * 100 + "vw", duration: 0.44, ease }, 0);
    }
    wraps.forEach((w) => tl.fromTo(w, { width: w.offsetWidth, opacity: 1 }, { width: 0, opacity: 0, duration: 0.44, ease }, 0));
    return tl;
  };
  const onScrollHead = () => {
    if (!headEl || isPc() || reduced) return;
    const now = scrollY > 70;
    if (now === shrunk) return;
    shrunk = now;
    if (shrinkTl) { shrinkTl.progress(shrunk ? 0 : 1).kill(); }
    shrinkTl = buildShrink(!shrunk);
    if (shrunk) shrinkTl.progress(0).play(); else shrinkTl.progress(1).reverse();
  };
  addEventListener("scroll", onScrollHead, { passive: true });
  pcQuery.addEventListener("change", () => {
    if (shrinkTl) { shrinkTl.kill(); shrinkTl = null; }
    if (headEl) gsap.set(headEl.querySelectorAll(".sw-menu-btn.is-bottom, .sw-pill__wrap, .sw-pill__short, .sw-pill__icon"), { clearProps: "all" });
    shrunk = false;
  });

  // ── Wheel: one turn in .7s, direction follows where the taxi goes ──
  document.querySelectorAll(".sw-taxi").forEach((taxi) => {
    if (reduced) return;
    const dir = taxi.classList.contains("is-left") ? 1 : -1;
    gsap.fromTo(taxi.querySelectorAll(".sw-taxi__tire"), { rotation: 360 * dir }, { rotation: 0, duration: 0.7, ease: "none", repeat: -1 });
  });

  // ── Appear ──
  const riseY = () => (isPc() ? (40 / 1600) * 100 : (20 / 375) * 100) + "vw";
  const initRise = () => {
    const start = innerWidth / innerHeight > 1 ? "top 70%" : "top 80%";
    document.querySelectorAll("[data-rise]").forEach((el) => {
      if (reduced) { gsap.set(el, { opacity: 1 }); return; }
      gsap.set(el, { opacity: 0, y: riseY() });
      ScrollTrigger.create({
        trigger: el, start, once: true,
        onEnter: () => {
          gsap.killTweensOf(el);
          gsap.timeline().fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power1.out" }, 0).fromTo(el, { y: riseY() }, { y: 0, duration: 0.3, ease: "power2.out" }, 0);
        }
      });
    });
  };

  // ── Page transition: the body leaves in .3s, the new page enters in .3s ──
  const main = document.querySelector(".sw-main");
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || /^(https?:|mailto:|tel:)/.test(href) || !/\.html(\?|#|$)/.test(href)) return;
    e.preventDefault();
    close(openPop);
    if (reduced) { location.href = href; return; }
    gsap.killTweensOf(main);
    gsap.to(main, { opacity: 0, duration: 0.3, ease: "power2.out", onComplete: () => { location.href = href; } });
  });
  addEventListener("pageshow", (e) => { if (e.persisted && main) gsap.set(main, { opacity: 1 }); });

  // ── Wave panel: one panel per section on a single canvas (top and bottom edges wobbled with noise) ──
  const colorProbe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const probeEl = document.createElement("i");
  probeEl.style.cssText = "position:absolute;width:0;height:0;visibility:hidden";
  document.body.append(probeEl);
  const NAMES = { blue: "--site-blue", purple: "--site-purple", red: "--site-red", orange: "--site-orange", yellow: "--site-yellow", gold: "--site-gold", cream: "--site-cream", white: "--kf-bg" };
  // Convert the skin variable (including oklch relative colors) to real sRGB — paint one point on a canvas and read it
  const rgbOf = (name) => {
    probeEl.style.color = `var(${NAMES[name] || name})`;
    colorProbe.clearRect(0, 0, 1, 1);
    colorProbe.fillStyle = "transparent"; /* Not skin: initial value that clears the previous fill */
    colorProbe.fillStyle = getComputedStyle(probeEl).color;
    colorProbe.fillRect(0, 0, 1, 1);
    const d = colorProbe.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };
  SW.rgbOf = rgbOf;
  SW.palette = () => ["blue", "purple", "red", "orange", "yellow"].map(rgbOf);
  document.querySelectorAll("[data-wave]").forEach((el) => {
    try { const o = JSON.parse(el.dataset.wave); if (o.color !== "all") el.style.setProperty("--wave-color", `var(${NAMES[o.color]})`); } catch (_) {}
  });

  // Our noise: 3D gradient noise that blends gradients set at each lattice corner (values roughly -1 to 1)
  const NOISE = `
    vec3 swHash(vec3 p) {
      p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6)));
      return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
    }
    float swNoise(vec3 p) {
      vec3 i = floor(p), f = fract(p);
      vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
      float n000 = dot(swHash(i), f);
      float n100 = dot(swHash(i + vec3(1, 0, 0)), f - vec3(1, 0, 0));
      float n010 = dot(swHash(i + vec3(0, 1, 0)), f - vec3(0, 1, 0));
      float n110 = dot(swHash(i + vec3(1, 1, 0)), f - vec3(1, 1, 0));
      float n001 = dot(swHash(i + vec3(0, 0, 1)), f - vec3(0, 0, 1));
      float n101 = dot(swHash(i + vec3(1, 0, 1)), f - vec3(1, 0, 1));
      float n011 = dot(swHash(i + vec3(0, 1, 1)), f - vec3(0, 1, 1));
      float n111 = dot(swHash(i + vec3(1, 1, 1)), f - vec3(1, 1, 1));
      float nx = mix(mix(mix(n000, n100, u.x), mix(n010, n110, u.x), u.y), mix(mix(n001, n101, u.x), mix(n011, n111, u.x), u.y), u.z);
      return clamp(nx * 1.6, -1.0, 1.0);
    }`;
  SW.NOISE = NOISE;
  const VERT = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
  SW.VERT = VERT;
  const WAVE_FRAG = `
    precision highp float;
    varying vec2 vUv;
    uniform vec2 uSize; uniform vec3 uColor; uniform float uTime, uFreq, uAmp, uFlow, uSpeed, uSeed, uType;
    ${NOISE}
    void main() {
      float py = (vUv.y - 0.5) * uSize.y;
      float half_ = uSize.y * 0.5;
      float a = uAmp * uSize.x;
      float x = vUv.x * uFreq + uTime * uFlow;
      float nTop = swNoise(vec3(x, uTime * uSpeed, uSeed));
      float nBot = swNoise(vec3(x, uTime * uSpeed, uSeed + 123.4));
      float top = half_ - a + nTop * a;
      float bot = -half_ + a - nBot * a;
      float mTop = 1.0 - smoothstep(top - 0.5, top + 0.5, py);
      float mBot = smoothstep(bot - 0.5, bot + 0.5, py);
      float m = uType < 0.5 ? mTop : (uType < 1.5 ? mBot : mTop * mBot);
      gl_FragColor = vec4(uColor, m);
    }`;

  const canvasHost = document.querySelector("[data-gl]");
  const gl = (SW.gl = { items: [], ok: false });
  const setupGL = () => {
    if (!canvasHost || typeof THREE === "undefined") { document.documentElement.classList.add("no-gl"); return; }
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvasHost, antialias: true, alpha: true, premultipliedAlpha: false });
    } catch (_) { document.documentElement.classList.add("no-gl"); return; }
    renderer.setClearAlpha(0);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
    const geo = new THREE.PlaneGeometry(1, 1);
    Object.assign(gl, { ok: true, renderer, scene, camera, geo });
    const size = () => {
      const w = innerWidth, h = innerHeight;
      renderer.setSize(w, h, false);
      Object.assign(camera, { left: -w / 2, right: w / 2, top: h / 2, bottom: -h / 2 });
      camera.updateProjectionMatrix();
    };
    size();
    addEventListener("resize", size);
    // Fit the panel to the element’s on-screen spot — measured every frame so it follows height changes from pinning or fonts
    gl.place = (mesh, el, z = 0) => {
      const r = el.getBoundingClientRect();
      const vis = r.bottom > -40 && r.top < innerHeight + 40 && r.width > 0;
      mesh.visible = vis;
      if (!vis) return null;
      mesh.scale.set(r.width, r.height, 1);
      mesh.position.set(r.left + r.width / 2 - innerWidth / 2, innerHeight / 2 - (r.top + r.height / 2), z);
      return r;
    };
    gl.add = (item) => { gl.items.push(item); if (item.mesh) scene.add(item.mesh); return item; };

    const waveEls = [...document.querySelectorAll("[data-wave]")];
    let order = 0;
    waveEls.forEach((el) => {
      let o = {};
      try { o = JSON.parse(el.dataset.wave); } catch (_) {}
      const colors = o.color === "all" ? ["blue", "purple", "red", "orange", "yellow"] : [o.color || "blue"];
      colors.forEach((c, i) => {
        const mat = new THREE.ShaderMaterial({
          transparent: true, depthTest: false,
          uniforms: {
            uSize: { value: new THREE.Vector2(1, 1) }, uColor: { value: new THREE.Color(...rgbOf(c)) }, uTime: { value: 0 },
            uFreq: { value: 3 }, uAmp: { value: 0.01 }, uFlow: { value: -0.4 }, uSpeed: { value: 0.2 },
            uSeed: { value: Math.random() * 999 }, uType: { value: { top: 0, bottom: 1, both: 2 }[o.type || "both"] }
          },
          vertexShader: VERT, fragmentShader: WAVE_FRAG
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.renderOrder = order++;
        const tune = () => {
          const pc = isPc(), u = mat.uniforms;
          u.uFreq.value = pc ? 3 : 3.8; u.uAmp.value = pc ? 0.01 : 0.05; u.uFlow.value = pc ? -0.4 : -0.8; u.uSpeed.value = pc ? 0.2 : 0.6;
          const n = pc ? o.noise : o.sp;
          if (n) {
            if (n.frequency) u.uFreq.value = n.frequency * (pc ? 1 : 0.5);
            if (n.amplitude) u.uAmp.value = n.amplitude * (pc ? 1 : 3);
            if (n.flow) u.uFlow.value = n.flow;
            if (n.speed) u.uSpeed.value = n.speed;
          }
        };
        tune();
        pcQuery.addEventListener("change", tune);
        gl.add({
          mesh, color: c, mat,
          update(t) {
            // "all" Five panels are stacked, each lowered by 1/6 of the height — each panel’s top edge wobbles separately
            const r = gl.place(mesh, el);
            if (!r) return;
            if (colors.length > 1) mesh.position.y -= (i * r.height) / (colors.length + 1);
            mat.uniforms.uSize.value.set(r.width, r.height);
            mat.uniforms.uTime.value = t;
          },
          recolor() { mat.uniforms.uColor.value.setRGB(...rgbOf(c)); }
        });
      });
    });

    // ── Subpage header: five lines running down to the lower right from the origin (width .4, top) overlap, each tilted a bit less in turn.
    //    A cosine wave per line (frequency 3, height .1) flows over time, and on the big header a band crosses between the top and bottom background colors ──
    const FAN_FRAG = `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime, uFreq, uAngle, uLarge;
      uniform vec2 uOrigin, uSize;
      uniform vec3 uTop, uBottom, c0, c1, c2, c3, c4;
      const float PI = 3.14159265;
      vec2 rot(vec2 p, float a) { float c = cos(a), s = sin(a); return vec2(c * p.x - s * p.y, s * p.x + c * p.y); }
      float above(vec2 uv, float ang) {
        float xp = (uv.x - uOrigin.x) / (1.0 - uOrigin.x);
        vec2 p = rot(uv - uOrigin, ang) + uOrigin;
        float wh = (cos(xp * PI * uFreq - uTime) * 0.5 + 0.5) * smoothstep(0.0, 0.3, xp) * 0.1;
        float e = 1.5 / uSize.y;
        return smoothstep(uOrigin.y - e, uOrigin.y, p.y + wh);
      }
      void main() {
        vec2 uv = vUv;
        float st = -abs(uAngle) * 1.3 / 5.0;
        vec3 col = uBottom;
        col = mix(col, c4, above(uv, uAngle));
        col = mix(col, c3, above(uv, uAngle + st));
        col = mix(col, c2, above(uv, uAngle + st * 2.0));
        col = mix(col, c1, above(uv, uAngle + st * 3.0));
        col = mix(col, c0, above(uv, uAngle + st * 4.0));
        float topMask = above(uv, uAngle + st * 5.0);
        // Big heading: the left side is tinted toward the background color below, so the band seems to bloom from blue
        float leftFade = uLarge * (1.0 - smoothstep(0.0, 0.75, uv.x)) * 0.35;
        col = mix(col, uBottom, leftFade * (1.0 - topMask));
        col = mix(col, uTop, topMask);
        float lm = smoothstep(uOrigin.x + 0.002, uOrigin.x, uv.x) * (1.0 - uLarge);
        col = mix(col, uTop, lm);
        gl_FragColor = vec4(col, 1.0);
      }`;
    document.querySelectorAll("[data-fan]").forEach((el) => {
      let o = {};
      try { o = JSON.parse(el.dataset.fan); } catch (_) {}
      const large = o.large ? 1 : 0;
      const pal = () => ["blue", "purple", "red", "orange", "yellow"].map(rgbOf);
      const [b, pu, r, or, y] = pal();
      const u = {
        uTime: { value: 0 }, uFreq: { value: 3 }, uAngle: { value: Math.PI * 0.15 }, uLarge: { value: large },
        uOrigin: { value: new THREE.Vector2(0.4, 1) }, uSize: { value: new THREE.Vector2(1, 1) },
        uTop: { value: new THREE.Color(...rgbOf(o.top || "white")) }, uBottom: { value: new THREE.Color(...rgbOf(o.bottom || "white")) },
        c0: { value: new THREE.Color(...b) }, c1: { value: new THREE.Color(...pu) }, c2: { value: new THREE.Color(...r) }, c3: { value: new THREE.Color(...or) }, c4: { value: new THREE.Color(...y) }
      };
      const tune = () => {
        const pc = isPc();
        u.uFreq.value = pc ? 3 : 1.5;
        if (large) { u.uOrigin.value.set(-0.05, pc ? 0.35 : 0.45); u.uAngle.value = Math.PI * (pc ? -0.09 : -0.1); }
        else { u.uOrigin.value.set(pc ? 0.4 : 0.3, 1); u.uAngle.value = Math.PI * 0.15; }
      };
      tune();
      pcQuery.addEventListener("change", tune);
      const mesh = new THREE.Mesh(geo, new THREE.ShaderMaterial({ depthTest: false, side: THREE.DoubleSide, uniforms: u, vertexShader: VERT, fragmentShader: FAN_FRAG }));
      mesh.renderOrder = -1;
      gl.add({
        mesh,
        update(t) { const rr = gl.place(mesh, el); if (!rr) return; if (o.flip) mesh.scale.x *= -1; u.uSize.value.set(rr.width, rr.height); u.uTime.value = t; },
        recolor() {
          const [b2, p2, r2, o2, y2] = pal();
          u.c0.value.setRGB(...b2); u.c1.value.setRGB(...p2); u.c2.value.setRGB(...r2); u.c3.value.setRGB(...o2); u.c4.value.setRGB(...y2);
          u.uTop.value.setRGB(...rgbOf(o.top || "white")); u.uBottom.value.setRGB(...rgbOf(o.bottom || "white"));
        }
      });
    });
  };

  const tick = () => {
    if (!gl.ok) return;
    const t = reduced ? 0 : performance.now() / 1000;
    gl.items.forEach((it) => it.update && it.update(t));
    gl.renderer.render(gl.scene, gl.camera);
  };
  SW.recolor = () => gl.items.forEach((it) => it.recolor && it.recolor());

  // Start after the page script adds its own boards (Hero ribbon, section title strip, subpage header wave)
  const start = () => {
    setupGL();
    SW.ready.forEach((fn) => fn(SW));
    initRise();
    gsap.ticker.add(tick);
    const loader = document.querySelector(".sw-loader");
    gsap.set(main, { opacity: 0 });
    const tl = gsap.timeline();
    tl.to(loader, { autoAlpha: 0, duration: reduced ? 0 : 0.15, ease: "power1.out" }, 0);
    tl.to(main, { opacity: 1, duration: reduced ? 0 : 0.3, ease: "power2.out" }, 0);
    tl.add(() => { ScrollTrigger.refresh(); document.dispatchEvent(new CustomEvent("sw:loaded")); }, 0);
  };
  if (document.readyState === "complete") setTimeout(start, 0);
  else addEventListener("load", start);
})();
