// Shared across Studio — puts the header, bottom menu, contact panel and footer into every page with identical markup, and hooks up Lenis, fade-back, word rise-in, clock and 3D ring logo.
// Page transition (tile flicker) is handled by the tile-flicker-nav part on body.
(() => {
  const root = document.documentElement;
  const page = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = matchMedia("(hover: none), (pointer: coarse)").matches;
  const phone = matchMedia("(max-width: 767px)");
  const NAMES = { home: "Home", works: "Works", services: "Services", about: "About", detail: "Works" };
  const NAV = [["index.html", "home", "Home"], ["works.html", "works", "Works"], ["services.html", "services", "Services"], ["about.html", "about", "About"]];
  const here = page === "detail" ? "works" : page;
  const arrow = '<span class="ui-arrow" aria-hidden="true"><svg viewBox="0 0 9 9" fill="none"><path d="M1 8 8 1M2.6 1H8v5.4" stroke="currentColor" stroke-width="1.3"/></svg><svg viewBox="0 0 9 9" fill="none"><path d="M1 8 8 1M2.6 1H8v5.4" stroke="currentColor" stroke-width="1.3"/></svg></span>';
  const mark = '<svg class="un-logo-still" viewBox="0 0 51 51" fill="none" aria-hidden="true"><circle cx="25.5" cy="25.5" r="23.2" stroke="currentColor" stroke-width="2.3"/><rect x="17.5" y="18" width="13" height="15" rx="1.5" stroke="currentColor" stroke-width="2.2"/><circle cx="35.6" cy="32" r="1.3" fill="currentColor"/></svg>';
  window.unArrow = arrow;
  document.querySelectorAll(".arrow-slot").forEach((el) => (el.outerHTML = arrow));

  // ───────── Markup ─────────
  const header = document.querySelector('[data-slot="header"]');
  if (header) {
    header.classList.add("un-header");
    const top = `<div class="un-header__top">
      <p class="un-header__socials t-ui-regular"><a class="hover-underline" href="#"><span class="is-full">Instagram</span><span class="is-short">Ig</span></a>, <a class="hover-underline" href="#"><span class="is-full">LinkedIn</span><span class="is-short">In</span></a></p>
      <p class="un-header__clock t-ui-regular"><span data-label="English name of the city where the studio is">City Name</span><time class="tabular" data-clock>00:00:00</time></p>
      ${page === "home" ? `<button class="un-header__pitchdeck pressable" type="button" data-open="form" data-slot="pitchdeck">
        <span class="wf-img wf-video fill" data-label="Video · short clip of the team at work · dark interior · landscape 16:9 · auto loop"></span>
        <span class="un-pitch-text" data-label="Company brochure English name + one line to download it"><span class="t-ui">Deck Name</span><span class="t-small-regular dim">Request a copy</span></span></button>` : ""}
    </div>`;
    const crumb = page === "home" ? "" : `<a class="un-header__crumb ui-eyebrow" href="index.html"><span class="ui-eyebrow__dot">.</span><span class="t-ui">${NAMES[page]}</span></a>`;
    header.innerHTML = `${page === "home" ? "" : top}${crumb}
      <div class="un-booking-col">
        <button class="un-booking has-arrow transition-booking" type="button" data-open="form" data-recede>
          <span class="un-booking__box glass"></span>
          <span class="un-booking__logo"><span class="un-logo3d">${mark}<canvas aria-hidden="true"></canvas></span></span>
          <span class="un-booking__label t-ui" data-label="Consultation booking button English text">Book a slot</span>
          <span class="un-booking__avail t-small-regular">0 slots left this month</span>
          <span class="un-booking__arrow">${arrow}</span>
        </button>
      </div>`;
    const heroTop = document.querySelector("[data-hero-top]");
    if (heroTop) heroTop.innerHTML = top;
  }

  const menuHost = document.querySelector('[data-slot="menu"]');
  if (menuHost) {
    let i = 0;
    menuHost.innerHTML = `<div class="un-veil" data-menu-veil></div>
      <div class="un-menu-anchor">
        <nav class="un-menu-panel glass" aria-label="Menu" data-label="Menu — Page English name">
          <div class="un-menu__content">
            <p class="un-menu__label un-mask"><span class="un-rise t-small-regular" style="--i:${i++}">Menu</span></p>
            <ul class="un-menu__links">${NAV.map(([href, key, label]) => `<li class="un-mask"><span class="un-rise" style="--i:${i++}"><a class="un-menu__link t-menu hover-prefix${key === here ? " is-active" : ""}" href="${href}">${label}</a></span></li>`).join("")}
              <li class="un-mask"><span class="un-rise" style="--i:${i++}"><button class="un-menu__link t-menu hover-prefix" type="button" data-open="form">Contact</button></span></li></ul>
            <i class="un-menu__rule" style="--i:${i++}"></i>
            <p class="un-menu__social-label un-mask"><span class="un-rise t-small-regular" style="--i:${i++}">Social</span></p>
            <ul class="un-menu__socials">${["Instagram", "LinkedIn", "Brand"].map((s) => `<li class="un-mask"><span class="un-rise" style="--i:${i++}"><a class="t-ui hover-underline" href="#">${s}</a></span></li>`).join("")}</ul>
            <button class="un-menu__pitch t-ui pressable" type="button" data-open="form" style="--i:${i++}">Get the deck</button>
          </div>
        </nav>
        <button class="un-bar pressable" type="button" aria-expanded="false" data-menu-bar>
          <span class="un-bar__label t-small">Menu</span>
          <span class="un-bar__lines" aria-hidden="true"><i></i><i></i><i></i></span>
          <span class="un-bar__pill t-small"><span class="un-bar__word is-rest">${NAMES[page]}</span><span class="un-bar__word is-active">Close</span></span>
        </button>
      </div>`;
  }

  const formHost = document.querySelector('[data-slot="contact-form"]');
  if (formHost) {
    let i = 0;
    const field = (label, tag = "input") => `<label class="un-form__field un-form__line t-ui" style="--i:${i++}"><span>${label}</span>${tag === "input" ? '<input type="text">' : '<textarea rows="3"></textarea>'}</label>`;
    formHost.className = "un-form";
    formHost.innerHTML = `<div class="un-form__panel glass" role="dialog" aria-label="Contact">
      <div class="un-form__content">
        <div class="un-form__head un-form__line" style="--i:${i++}"><span class="t-ui" data-label="Consultation booking panel English title">Book a slot</span><button class="t-ui hover-underline" type="button" data-close>Close</button></div>
        ${field("Name")}${field("Email")}${field("Company")}${field("Your message", "textarea")}
        <button class="un-form__send t-ui pressable un-form__line" type="button" style="--i:${i++}" data-close>Send</button>
      </div></div>`;
  }

  const footer = document.querySelector('[data-slot="footer"]');
  if (footer) {
    footer.classList.add("un-footer");
    const cells = [["Project Name 01", "Person wearing product shot · Warm indoor light · Near-portrait 4:3"], ["Project Name 02", "Product screen on laptop · dark stand · front view"], ["Project Name 03", "Wide shot of office space · large window natural light · landscape"], ["Project Name 04", "Person profile · red background lighting · landscape"]];
    footer.innerHTML = `<nav class="un-footer__col un-footer__col--pages t-ui" data-label="Pages">${NAV.map(([href, key, label]) => `<a class="hover-prefix${key === here ? " is-active" : ""}" href="${href}">${key === here ? "/ " : ""}${label}</a>`).join("")}</nav>
      <nav class="un-footer__col un-footer__col--contact t-ui" data-label="Contact"><button class="hover-prefix" type="button" data-open="form">Contact</button><a class="hover-prefix" href="#">Legal</a></nav>
      <nav class="un-footer__col un-footer__col--social t-ui" data-label="Social"><a class="hover-underline" href="#">Instagram</a><a class="hover-underline" href="#">LinkedIn</a><a class="hover-underline" href="#">Brand</a></nav>
      <div class="footer-cells" data-slot="footer-cells">${cells.map(([n, l]) => `<a class="footer-cells__cell" href="detail.html" data-fx-part="plain"><span class="footer-cells__title t-small">${n}</span><span class="footer-cells__frame"><span class="footer-cells__img wf-img fill" data-label="${l}"></span></span></a>`).join("")}</div>
      <span class="un-footer__logo">${mark.replace("un-logo-still", "")}</span>
      <p class="un-footer__copy t-small-regular">© 0000 — 0000 Your company name here. All rights reserved. Patent pending</p>
      <button class="un-footer__pitch" type="button" data-open="form"><span class="wf-img wf-video fill" data-label="Video · short team intro clip · landscape"></span><span class="un-pitch-text" data-label="Company brochure English name + one line to download it"><span class="t-ui">Deck Name</span><span class="t-small-regular dim">Request a copy</span></span></button>`;
  }

  // ───────── Lenis — exactly the original settings (lerp .07 · 1.2s · wheel .8, smooth wheel off on touch devices) ─────────
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: coarse ? 0.1 : 0.07, duration: coarse ? 0.8 : 1.2, easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)), smoothWheel: !coarse, wheelMultiplier: 0.8, touchMultiplier: coarse ? 2 : 1.5, autoRaf: false });
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.unLenis = lenis;

  // ───────── Retreat · menu · contact panel ─────────
  const pageEl = document.querySelector(".un-page");
  const booking = document.querySelector(".un-booking");
  const open = new Set();
  const recede = () => {
    const on = open.size > 0;
    root.classList.remove("is-recede-reset");
    if (on && pageEl) {
      const r = pageEl.getBoundingClientRect();
      pageEl.style.transformOrigin = `50% ${innerHeight / 2 - r.top}px`;
    }
    pageEl?.classList.toggle("is-receded", on);
    if (booking) {
      if (on) { const b = booking.getBoundingClientRect(); booking.style.transformOrigin = `${innerWidth / 2 - b.left}px ${innerHeight / 2 - b.top}px`; }
      booking.classList.toggle("is-receded", on);
    }
  };
  const enter = (el, cls = "is-open") => {
    el.classList.add("is-entering");
    void el.offsetWidth;
    el.classList.remove("is-entering");
    el.classList.add(cls);
  };
  const menuPanel = document.querySelector(".un-menu-panel");
  const bar = document.querySelector("[data-menu-bar]");
  const veil = document.querySelector("[data-menu-veil]");
  const formEl = document.querySelector(".un-form");
  const setMenu = (on) => {
    if (!menuPanel) return;
    if (on) { enter(menuPanel); open.add("menu"); } else { menuPanel.classList.remove("is-open"); open.delete("menu"); }
    veil.classList.toggle("is-open", on);
    bar.classList.toggle("is-active", on || open.has("form"));
    bar.setAttribute("aria-expanded", on);
    recede();
  };
  const setForm = (on) => {
    if (!formEl) return;
    if (on) { setMenu(false); enter(formEl); open.add("form"); } else { formEl.classList.remove("is-open"); open.delete("form"); }
    bar?.classList.toggle("is-active", on);
    recede();
  };
  window.unPanels = { setMenu, setForm, recede, open };
  bar?.addEventListener("click", () => (open.has("menu") || open.has("form") ? (setMenu(false), setForm(false)) : setMenu(true)));
  veil?.addEventListener("click", () => setMenu(false));
  formEl?.addEventListener("click", (e) => { if (e.target === formEl || e.target.closest("[data-close]")) setForm(false); });
  document.addEventListener("click", (e) => { if (e.target.closest("[data-open='form']")) { e.preventDefault(); setForm(true); } });
  addEventListener("keydown", (e) => { if (e.key === "Escape") { setMenu(false); setForm(false); } });

  // ───────── Booking pill: dark glass over white panels, and on phones it collapses once scrolled below .6 of the screen ─────────
  const lightTone = () => {
    if (!booking) return false;
    const b = booking.querySelector(".un-booking__box").getBoundingClientRect();
    const hit = document.elementsFromPoint(b.left + b.width / 2, b.top + b.height / 2).find((n) => n.closest?.("[data-tone]"));
    return hit?.closest("[data-tone]")?.dataset.tone === "light";
  };
  let tick = 0;
  const onScroll = () => {
    tick = 0;
    if (!booking) return;
    booking.classList.toggle("is-solid", lightTone());
    booking.classList.toggle("is-folded", phone.matches && scrollY > innerHeight * 0.6);
  };
  addEventListener("scroll", () => { tick ||= requestAnimationFrame(onScroll); }, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  // ───────── Clock ─────────
  const clocks = document.querySelectorAll("[data-clock]");
  const fmt = new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "UTC" });
  const tickClock = () => clocks.forEach((c) => (c.textContent = fmt.format(new Date())));
  if (clocks.length) { tickClock(); setInterval(tickClock, 1000); }

  // ───────── Word rise (original v-reveal: once when visible, lines use min(60, 600/lines) ms per line) ─────────
  const splitWords = (el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [];
    while (walker.nextNode()) if (walker.currentNode.textContent.trim()) nodes.push(walker.currentNode);
    const words = [];
    for (const n of nodes) {
      const frag = document.createDocumentFragment();
      for (const part of n.textContent.split(/(\s+)/)) {
        if (!part) continue;
        if (/^\s+$/.test(part)) { frag.append(part); continue; }
        const s = document.createElement("span");
        s.className = "reveal-word"; s.textContent = part; frag.append(s); words.push(s);
      }
      n.replaceWith(frag);
    }
    return words;
  };
  const byLine = (el) => {
    const words = splitWords(el);
    el.dataset.reveal = "measure";
    let line = -1, last = null;
    const lines = words.map((w) => { const t = Math.round(w.getBoundingClientRect().top); if (last === null || t > last + 2) line += 1; last = t; return line; });
    const step = Math.min(60, 600 / Math.max(line, 1));
    words.forEach((w, i) => w.style.setProperty("--reveal-line-delay", `${Math.round(lines[i] * step)}ms`));
    el.dataset.reveal = "lines";
  };
  if (!reduce) {
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) { e.target.dataset.lines !== undefined ? byLine(e.target) : (e.target.dataset.reveal = "in"); io.unobserve(e.target); }
    }, { threshold: 0.1 });
    document.querySelectorAll("[data-reveal]").forEach((el, i) => { el.dataset.reveal = "wait"; io.observe(el); });
  } else document.querySelectorAll("[data-reveal]").forEach((el) => el.removeAttribute("data-reveal"));

  // ───────── Footer cells — one cell at a time lights up over 1s in turn, and on hover only that cell in 120ms ─────────
  const cellsEl = document.querySelector(".footer-cells");
  if (cellsEl) {
    const cells = [...cellsEl.children];
    let at = 0, timer = 0;
    const show = () => { cells.forEach((c, i) => c.classList.toggle("is-visible", i === at)); at = (at + 1) % cells.length; };
    const run = () => { clearInterval(timer); show(); timer = setInterval(show, 2600); };
    run();
    cells.forEach((c) => { c.addEventListener("mouseenter", () => { cellsEl.classList.add("is-pointer"); cells.forEach((d) => d.classList.toggle("is-hovered", d === c)); }); });
    cellsEl.addEventListener("mouseleave", () => { cellsEl.classList.remove("is-pointer"); cells.forEach((d) => d.classList.remove("is-hovered")); });
  }

  // ───────── Grid crosses — light the crosses around the row the hand reached, late ─────────
  window.unCrosses = (host, list, dark) => {
    host.querySelectorAll(":scope > .ui-grid-cross").forEach((c) => c.remove());
    return list.map(([x, y, delay]) => {
      const c = document.createElement("i");
      c.className = `ui-grid-cross${dark ? " is-dark" : ""}`;
      c.style.left = x; c.style.top = y; c.style.setProperty("--delay", `${delay || 0}ms`);
      host.append(c);
      return c;
    });
  };

  // ───────── 3D ring logo — spins on the Y axis by the scroll speed, settles to the nearest full turn when it stops, and tilts toward the mouse ─────────
  const logoWrap = document.querySelector(".un-booking .un-logo3d");
  if (logoWrap && window.THREE && !reduce) {
    try { logo3d(logoWrap, logoWrap.querySelector("canvas")); } catch (err) { /* Without WebGL, a flat logo remains */ }
  }
  function logo3d(wrap, canvas) {
    const T = window.THREE;
    const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    const scene = new T.Scene();
    // Ambient light is our own room — a box of a few bright panels set around, baked with PMREM
    const room = new T.Scene();
    const lightMat = new T.MeshBasicMaterial({ color: new T.Color(1, 1, 1) });
    const box = new T.Mesh(new T.BoxGeometry(30, 20, 30), new T.MeshBasicMaterial({ color: new T.Color(0.18, 0.18, 0.18), side: T.BackSide }));
    room.add(box);
    [[-8, 8, -6, 6, 0.4, 6], [9, 5, 2, 0.4, 6, 8], [0, -9.5, 0, 14, 0.2, 14], [-6, 2, 13, 8, 6, 0.2]].forEach(([x, y, z, w, h, d]) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), lightMat); m.position.set(x, y, z); room.add(m); });
    const pmrem = new T.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(room, 0.04).texture;
    pmrem.dispose();
    const share = 0.48, W = 51, camera = new T.PerspectiveCamera(22, 1, 1, 2000);
    camera.position.z = (W / share) / 2 / Math.tan((Math.PI / 180) * 11);
    // Grain roughness — 110~200 gray noise 256², repeat 0.25
    const N = 256, px = new Uint8Array(N * N * 4);
    for (let i = 0; i < N * N; i++) { const v = 110 + Math.random() * 90; px.set([v, v, v, 255], i * 4); }
    const grain = new T.DataTexture(px, N, N);
    grain.wrapS = grain.wrapT = T.RepeatWrapping; grain.repeat.set(0.25, 0.25); grain.needsUpdate = true;
    const probe = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d");
    probe.fillStyle = getComputedStyle(wrap).color; probe.fillRect(0, 0, 1, 1);
    const [r8, g8, b8] = probe.getImageData(0, 0, 1, 1).data;
    const tint = new T.Color(r8 / 255, g8 / 255, b8 / 255).convertSRGBToLinear();
    const mat = new T.MeshStandardMaterial({ color: tint, roughness: 0.72, roughnessMap: grain, bumpMap: grain, bumpScale: 0.6, metalness: 0, envMapIntensity: 0.9 });
    const depth = 5.1, opts = { depth, bevelEnabled: true, bevelThickness: 1, bevelSize: 0.42, bevelSegments: 5, curveSegments: 64 };
    const group = new T.Group(), ringG = new T.Group(), innerG = new T.Group();
    group.add(ringG, innerG);
    group.rotation.x = 0.233;
    group.scale.setScalar(1e-4);
    scene.add(group);
    const extrude = (shape, parent) => {
      const g = new T.ExtrudeGeometry(shape, opts);
      g.translate(0, 0, -depth / 2);
      const m = new T.Mesh(g, mat);
      parent.add(m);
      return g;
    };
    // Our mark: ring + inner square frame + dot (same size ratios as the original — ring diameter 48.6/51, inner 30%, dot 5%)
    const ring = new T.Shape(); ring.absarc(0, 0, 24.28, 0, Math.PI * 2, false);
    const hole = new T.Path(); hole.absarc(0, 0, 21.96, 0, Math.PI * 2, true); ring.holes.push(hole);
    const sq = new T.Shape(); sq.moveTo(-7.4, -8); sq.lineTo(6.4, -8); sq.lineTo(6.4, 8); sq.lineTo(-7.4, 8); sq.lineTo(-7.4, -8);
    const sqHole = new T.Path(); sqHole.moveTo(-5.2, -5.8); sqHole.lineTo(-5.2, 5.8); sqHole.lineTo(4.2, 5.8); sqHole.lineTo(4.2, -5.8); sqHole.lineTo(-5.2, -5.8); sq.holes.push(sqHole);
    const dot = new T.Shape(); dot.absarc(10.1, -6.4, 1.28, 0, Math.PI * 2, false);
    const geos = [extrude(ring, ringG), extrude(sq, innerG), extrude(dot, innerG)];
    const ease = (a, b, k, dt) => a + (b - a) * (1 - (1 - k) ** (dt / 16.667));
    let A = 0, J = 0, M = 0, Nn = 0, V = 0, F = 1, active = false, L = 0, R = 0, S = 0, lastY = scrollY, lastT = 0, dirty = true, raf = 0, prev = performance.now(), first = true;
    if (lenis) lenis.on("scroll", (l) => { V = l.velocity; F = l.direction || F; active = !!l.isScrolling; });
    else addEventListener("scroll", () => { V = scrollY - lastY; F = V >= 0 ? 1 : -1; active = true; lastY = scrollY; lastT = performance.now(); }, { passive: true });
    addEventListener("pointermove", (e) => { L = (e.clientX / innerWidth) * 2 - 1; R = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });
    const size = () => { const w = canvas.clientWidth, h = canvas.clientHeight; if (w && h) { renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); dirty = true; } };
    new ResizeObserver(size).observe(canvas);
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(Math.max(1, now - prev), 64);
      prev = now;
      if (!lenis && active && now - lastT > 120) { active = false; V = 0; }
      A += V * 0.0022;
      if (active) J = A;
      else { const turn = Math.PI * 2, t = (F === 1 ? Math.ceil(A / turn) : Math.floor(A / turn)) * turn; J = ease(J, t, 0.1, dt); A = ease(A, t, 0.1, dt); V = 0; }
      const m = ease(M, J, 0.1, dt), n = ease(Nn, J, 0.4, dt), ry = ease(group.rotation.y, L * 0.25, 0.15, dt), rx = ease(group.rotation.x, 0.233 + R * 0.25 * 0.4, 0.15, dt), s = ease(S, 1, 0.06, dt);
      const moved = Math.abs(m - M) > 1e-5 || Math.abs(n - Nn) > 1e-5 || Math.abs(ry - group.rotation.y) > 1e-5 || Math.abs(rx - group.rotation.x) > 1e-5 || Math.abs(s - S) > 1e-5;
      M = m; Nn = n; S = s;
      ringG.rotation.y = M; innerG.rotation.y = Nn; group.rotation.y = ry; group.rotation.x = rx; group.scale.setScalar(Math.max(S, 1e-4));
      if (moved || dirty) { renderer.render(scene, camera); dirty = false; if (first) { first = false; wrap.classList.add("is-ready"); } }
    };
    size();
    raf = requestAnimationFrame(loop);
    addEventListener("pagehide", () => { cancelAnimationFrame(raf); geos.forEach((g) => g.dispose()); mat.dispose(); grain.dispose(); renderer.dispose(); });
  }
})();
