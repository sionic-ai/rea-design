// Brand rebuild — loader · text wall · swup transition · header color pairs · chunk menu · cursor blob · text splitting · polygon chunk entrance · footer
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Like the original, mobile detection uses UA and width (950 or less) — whether to turn on the cursor blob and hover enlargement
  const fine = !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && innerWidth > 950;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  gsap.registerPlugin(ScrollTrigger, SplitText, MorphSVGPlugin);
  gsap.config({ nullTargetWarn: false });
  const isMob = () => innerWidth <= 950;

  // Our chunk shapes (0–1 box) — not copied from the original art but redrawn with the same character (angular polygons, one or two concave spots)
  const SHAPES = {
    dot: "M.5 .47 L.53 .5 L.5 .53 L.47 .5Z",
    a: "M.08 .22 L.42 .04 L.6 .16 L.93 .1 L.97 .58 L.74 .96 L.3 .88 L.03 .66Z",
    b: "M.02 .3 L.3 .3 L.3 .06 L.7 .06 L.7 .28 L.98 .32 L.9 .8 L.6 .97 L.12 .9Z",
    c: "M.18 .02 L.84 .12 L.99 .46 L.82 .62 L.9 .98 L.36 .9 L.04 .74 L.1 .4Z",
    d: "M.05 .12 L.62 .02 L.62 .2 L.96 .24 L.88 .7 L.98 .94 L.3 .98 L.02 .6Z",
    e: "M.3 .02 L.98 .2 L.86 .56 L.98 .7 L.66 .98 L.06 .86 L.16 .5 L.02 .24Z",
    menuOff: "M.06 .1 L.78 0 L1 .34 L.94 .9 L.3 1 L0 .66Z",
    menuOn: "M0 0 L1 0 L1 1 L0 1Z",
  };
  window.rpShapes = SHAPES;
  const NS = "http://www.w3.org/2000/svg";
  let uid = 0;
  // Cut an element into a lump shape — change the path of an objectBoundingBox clipPath with MorphSVG
  function clip(el, shape = "a") {
    if (el._clip) return el._clip;
    const id = `rp-clip-${++uid}`;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("width", "0"); svg.setAttribute("height", "0"); svg.setAttribute("aria-hidden", "true");
    svg.style.position = "absolute";
    svg.innerHTML = `<clipPath id="${id}" clipPathUnits="objectBoundingBox"><path d="${SHAPES[shape] || shape}"/></clipPath>`;
    el.prepend(svg);
    el.style.clipPath = `url(#${id})`;
    el._clip = svg.querySelector("path");
    return el._clip;
  }
  window.rpClip = clip;
  const morph = (path, shape, vars) => gsap.to(path, { morphSVG: { shape: SHAPES[shape] || shape, type: "linear", map: "size" }, ...vars });
  window.rpMorph = morph;

  // Our logo (three abstract letters) — same shape on wall and head
  const LOGO = '<svg viewBox="0 0 92 36" aria-hidden="true"><path d="M2 2h20a10 10 0 0 1 0 20h-6l12 12H16L6 22v12H2Z"/><path d="M34 2h18a10 10 0 0 1 0 20h-14v12h-4Z"/><path d="M76 2h4l12 32h-6l-3-8H67l-3 8h-6Zm2 8-5 12h10Z"/></svg>';
  document.documentElement.style.setProperty("--rp-logo-mask", `url("data:image/svg+xml,${encodeURIComponent(LOGO.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" '))}")`);
  const BLOB = (shape) => `<svg viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true"><path d="${SHAPES[shape]}"/></svg>`;

  // Text wall: lays down rows, and odd and even rows flow in opposite directions by one cell width over 2.5s (loops)
  function wall(el, { transition = false } = {}) {
    const bg = document.createElement("div");
    bg.className = "rp-wall__bg";
    el.innerHTML = "";
    el.append(bg);
    const probe = document.createElement("span");
    const line0 = document.createElement("div");
    line0.className = "rp-wall__line"; line0.append(probe); bg.append(line0);
    const w = probe.offsetWidth || 96, h = line0.offsetHeight || 40;
    const rows = Math.ceil((el.offsetHeight || innerHeight) / h) + 2, cols = Math.ceil(innerWidth / w) + 2;
    bg.innerHTML = Array.from({ length: rows }, () => `<div class="rp-wall__line">${"<span></span>".repeat(cols * 2)}</div>`).join("");
    const lines = $$(".rp-wall__line", bg).slice(0, 25), odd = lines.filter((_, i) => i % 2 === 0), even = lines.filter((_, i) => i % 2 === 1);
    const step = w + 2;
    const intro = gsap.timeline({ paused: true });
    if (transition) intro.from(lines, { yPercent: (i) => -100 * (i + 1), filter: "blur(2px)", duration: 0.75, ease: "power4.out", stagger: -0.1 });
    else intro.from(lines, { yPercent: (i) => 110 * (rows - i), filter: "blur(2px)", duration: 1, ease: "power4.out", stagger: { amount: 1, ease: "power1.out" } });
    intro.fromTo(odd, { xPercent: -45 }, { xPercent: -50, duration: 2.5, ease: "power2.out" }, "<");
    intro.fromTo(even, { xPercent: -5 }, { xPercent: 0, duration: 2.5, ease: "power2.out" }, "<");
    const mov = gsap.timeline({ paused: true, repeat: -1 });
    mov.fromTo(odd.slice(0, 10), { x: 0 }, { x: step, duration: 2.5, ease: "none" });
    mov.fromTo(even.slice(0, 10), { x: 0 }, { x: -step, duration: 2.5, ease: "none" }, "<");
    const collapse = gsap.timeline({ paused: true, onStart: () => mov.pause() });
    collapse.to(odd.slice(0, 10), { x: step, duration: 1.25, ease: "power2.out" });
    collapse.to(even.slice(0, 10), { x: -step, duration: 1.25, ease: "power2.out" }, "<");
    collapse.to(lines.slice(0, 20), { yPercent: (i) => 115 * (rows - i), filter: "blur(5px)", duration: 0.75, ease: "power4.in", stagger: -0.09 });
    return (el._wall = { intro, mov, collapse });
  }
  window.rpWall = wall;

  // ───── Text splitting (original split--lines .4s·.1 stagger / split--chars .33s·.075 stagger) ─────
  function splitAll(root) {
    $$('[data-split="lines"]', root).forEach((el) => {
      if (el._tl) return;
      const s = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "rp-line" });
      el._tl = gsap.timeline({ paused: true }).from(s.lines, { y: "105%", duration: 0.4, stagger: 0.1, ease: "power2.out" });
    });
    $$('[data-split="chars"]', root).forEach((el) => {
      if (el._tl) return;
      const s = SplitText.create(el, { type: "words,chars", mask: "words", charsClass: "rp-char" });
      el._tl = gsap.timeline({ paused: true }).from(s.chars, { y: "105%", duration: 0.33, stagger: +(el.dataset.stagger || 0.075), ease: "power3.out" });
    });
    $$("[data-shape-in]", root).forEach((el) => {
      if (el._tl) return;
      // Original svgAnimaSimple: the panel grows from 0 over 1s power2.out and the shape goes start → end over .75s back.inOut(.75), then the letters rise at a .04 stagger
      const [from, to] = (el.dataset.shapeIn || "c a").split(" ");
      const path = clip(el, from);
      const txt = $(".rp-shape__txt", el);
      const chars = txt ? SplitText.create(txt, { type: "words,chars", mask: "words", charsClass: "rp-char" }).chars : [];
      const tl = gsap.timeline({ paused: true });
      tl.from(el, { scale: 0, duration: 1, ease: "power2.out" });
      tl.add(morph(path, to, { duration: 0.75, ease: "back.inOut(.75)" }), "<+=.05");
      if (chars.length) tl.from(chars, { y: "100%", duration: 0.3, ease: "power3.out", stagger: 0.04 });
      el._tl = tl;
    });
    $$(".rp-btn", root).forEach((b) => { if (!b.querySelector(".rp-btn__text")) b.innerHTML = `<span class="rp-btn__text">${b.textContent.trim()}</span>`; });
    $$("[data-btn-in]", root).forEach((el) => { if (!el._tl) el._tl = gsap.timeline({ paused: true }).from(el, { scale: 0, duration: 0.4, ease: "back.out(.75)" }); });
  }
  // Section head: block, lines and button play once when the section reaches 50% of the screen
  function sections(root) {
    $$("[data-reveal]", root).forEach((sec) => {
      const tl = gsap.timeline({ paused: true });
      $$("[data-shape-in], [data-split], [data-btn-in]", sec).filter((x) => x.closest("[data-reveal]") === sec && !x._used).forEach((x, i) => { if (!x._tl) return; x._used = 1; tl.add(x._tl.play(), i ? "<+=.15" : 0); });
      ScrollTrigger.create({ trigger: sec, start: sec.dataset.reveal || "top 50%", animation: tl, toggleActions: "play none none none" });
    });
    // Split text and blocks standing alone outside a section head trigger themselves at 85% of the screen
    $$("[data-shape-in], [data-split], [data-btn-in]", root).filter((x) => x._tl && !x._used && !x.closest("[data-menu]")).forEach((x) => {
      x._used = 1;
      ScrollTrigger.create({ trigger: x, start: "top 85%", animation: x._tl, toggleActions: "play none none none" });
    });
  }
  window.rpSplit = splitAll;

  // Work card — photo starts at 1.5x·50% below and opens over 1.5s, the panel opens top to bottom in 1s, the title line follows .33s late. First, second and fifth cards get ±25% parallax on scroll
  function works(root) {
    const mob = isMob;
    $$(".card-work", root).forEach((el, ind) => {
      const lines = $$("[data-card-lines]", el).map((x) => SplitText.create(x, { type: "lines", mask: "lines", linesClass: "rp-line" }).lines);
      const delay = ind === 1 || ind === 4 ? "<+=.15" : ind === 2 ? "<+=.3" : "";
      const tl = gsap.timeline({ paused: true });
      tl.from($(".rp-ph", el), { yPercent: 50, scale: 1.5, duration: 1.5, ease: "power3.out" }, delay || 0);
      tl.fromTo($(".card-work__img", el), { "--clip": "100% 0% 0% 0%" }, { "--clip": "0% 0% 0% 0%", duration: 1, ease: "power3.out" }, "<+=.15");
      lines.forEach((l) => tl.from(l, { yPercent: 100, duration: 0.75, ease: "power3.out", stagger: 0.1 }, "<+=.33"));
      ScrollTrigger.create({ trigger: el, start: "top 85%", animation: tl, toggleActions: "play none none none" });
      const mov = ind === 1 || ind === 4 ? 25 : ind === 0 ? -25 : 0;
      if (!mob() && mov) ScrollTrigger.create({ trigger: el, start: "top bottom", end: "+=100%", scrub: 0, animation: gsap.fromTo(el, { yPercent: mov }, { yPercent: -mov, ease: "none" }) });
    });
    const w = $("[data-sec-wall]", root);
    if (w) { const wl = rpWall(w); ScrollTrigger.create({ trigger: w.parentElement, start: "top 100%", animation: wl.intro, toggleActions: "play none none none", onEnter: () => wl.mov.play() }); }
  }

  // News card — block at 90% below and scale 0 for 1s, photo at 1.45x for 1.5s, even cards .35s later
  function news(root) {
    $$(".card-new", root).forEach((el, i) => {
      const sh = $("[data-new-shape]", el);
      rpClip(sh, sh.dataset.newShape);
      const tl = gsap.timeline({ paused: true });
      tl.from(sh, { yPercent: 90, scale: 0, duration: 1, ease: "power3.out" }, i % 2 === 0 ? 0.35 : 0);
      tl.from($(".rp-ph", sh), { scale: 1.45, duration: 1.5, ease: "power3.out" }, "<+=.2");
      const ln = $('[data-split="lines"]', el), b = $("[data-btn-in]", el);
      if (ln?._tl) { ln._used = 1; tl.add(ln._tl.play(), "<+=.33"); }
      if (b?._tl) { b._used = 1; tl.add(b._tl.progress(0).play(), "<+=.33"); }
      ScrollTrigger.create({ trigger: el, start: "top 60%", animation: tl, toggleActions: "play none none none" });
    });
  }

  // ───── Header ─────
  const MENU = [["First", "index.html"], ["About", "about.html"], ["Service", "service.html"], ["News", "news.html"], ["Work", "works.html"], ["Inquiry", "#"]];
  function header() {
    const slot = $('[data-slot="header"]');
    if (!slot || slot.dataset.built) return;
    slot.dataset.built = "1";
    slot.innerHTML = `<div class="rp-head" data-head>
  <a class="rp-logo" href="index.html" aria-label="First Page">${LOGO}</a>
  <button class="rp-mbtn" type="button" data-menu-btn aria-label="Menu" aria-expanded="false">${BLOB("menuOff")}<span class="rp-mbtn__lines"><i></i><i></i><i></i></span></button>
</div>
<nav class="rp-menu" data-menu><div class="rp-menu__in">
  <div class="rp-menu__list">${MENU.map(([n, h]) => `<a href="${h}" data-split="chars" data-stagger=".04"><svg viewBox="0 0 1 1" preserveAspectRatio="none"><path d="M0 .3 L.6 .3 L.6 0 L1 .5 L.6 1 L.6 .7 L0 .7Z"/></svg><span>${n}</span></a>`).join("")}</div>
  <div class="rp-menu__img rp-poly" data-menu-img><div class="rp-ph" data-label="People under stage lights at the venue · Dark interior · Portrait 3:4"></div></div>
  <div class="rp-menu__foot"><a href="#">Language 1</a><a href="#">Language 2</a><a href="#">Channel 1</a><a href="#">Channel 2</a><a href="#">Channel 3</a></div>
</div></nav>
<div class="rp-sect" data-sect aria-hidden="true"><span data-sect-name></span>${BLOB("c")}</div>
<div class="rp-cursor" data-cursor aria-hidden="true"><div class="rp-cursor__in">${BLOB("e")}<span class="rp-cursor__tag" data-cursor-tag>‹ ›</span></div></div>
<div class="rp-transition" data-transition><div class="rp-wall" data-wall-t></div></div>`;
  }

  // Menu: button blob becomes a square in .33s, panel 81.5vw×95svh in .6s back.out(.5), three lines turn into an X, item text .3s with .04 stagger
  let menuTl, menuOpen = false;
  function menu() {
    const btn = $("[data-menu-btn]"), panel = $("[data-menu]");
    if (!btn) return;
    const lines = $$(".rp-mbtn__lines i", btn), path = $("path", btn);
    const list = $(".rp-menu__list", panel);
    splitAll(panel);
    const build = () => {
      menuTl?.kill();
      const w = isMob() ? "93vw" : "81.5vw", h = isMob() ? "97svh" : "95svh";
      menuTl = gsap.timeline({ paused: true });
      menuTl.add(morph(path, "menuOn", { duration: 0.33, ease: "power2.out" }));
      menuTl.to(panel, { width: w, height: h, duration: 0.6, ease: "back.out(.5)", onStart: () => panel.classList.add("is-on"), onReverseComplete: () => panel.classList.remove("is-on") });
      menuTl.to(lines[0], { rotate: 45, y: "0.32rem", duration: 0.55, ease: "back.out" }, "<");
      menuTl.to(lines[1], { opacity: 0, duration: 0 }, "<");
      menuTl.to(lines[2], { rotate: -45, y: "-0.32rem", duration: 0.55, ease: "back.out" }, "<");
      menuTl.set(list, { opacity: 1 });
      $$("a", list).forEach((a, i) => { if (!a._tl) return; a._tl.paused(false); menuTl.add(a._tl, i ? "<+=.25" : "<-=.25"); });
      menuTl.fromTo($("[data-menu-img]", panel), { "--clipPath": "65% 0, 100% 0, 100% 0, 0 0" }, { "--clipPath": "0 100%, 100% 100%, 100% 0, 0 0", duration: 0.65, ease: "power3.inOut" }, "<");
    };
    build();
    btn.addEventListener("click", () => {
      menuOpen = !menuOpen;
      btn.setAttribute("aria-expanded", String(menuOpen));
      if (menuOpen) { menuTl.timeScale(1).play(); lenis?.stop(); }
      else { menuTl.timeScale(1.6).reverse(); lenis?.start(); }
    });
    window.rpCloseMenu = () => { if (!menuOpen) return; menuOpen = false; btn.setAttribute("aria-expanded", "false"); menuTl.progress(0).pause(); panel.classList.remove("is-on"); gsap.set(panel, { clearProps: "width,height" }); lenis?.start(); };
  }

  // ───── Color pair: when a section’s top edge passes 3% of the screen, the header · cursor color changes to that section’s color in .75s ─────
  function tones(root) {
    const head = $("[data-head]"), sect = $("[data-sect]"), nameEl = $("[data-sect-name]");
    const paint = (sec) => {
      const cs = getComputedStyle(sec);
      gsap.to([document.documentElement], { "--hfg": cs.getPropertyValue("--fgc").trim(), "--hbg": cs.getPropertyValue("--bgc").trim(), duration: 0.75, overwrite: "auto" });
      if (nameEl && sec.dataset.name) nameEl.innerHTML = sec.dataset.name;
    };
    const secs = $$("[data-tone]", root).filter((s) => s.matches("section, footer"));
    secs.forEach((sec) => ScrollTrigger.create({ trigger: sec, start: "top 3%", end: "bottom 3%", onEnter: () => paint(sec), onEnterBack: () => paint(sec) }));
    if (secs[0]) { const cs = getComputedStyle(secs[0]); gsap.set(document.documentElement, { "--hfg": cs.getPropertyValue("--fgc").trim(), "--hbg": cs.getPropertyValue("--bgc").trim() }); if (nameEl) nameEl.innerHTML = secs[0].dataset.name || ""; }
    if (sect) sect.style.display = root.querySelector("main")?.dataset.page === "home" || document.body.dataset.page === "home" ? "flex" : "none";
  }

  // ───── Cursor blob — follows 20% each tick (corrected for screen refresh rate), and over video·slider becomes 6.5rem with .25s back.in ─────
  function cursor() {
    const c = $("[data-cursor]");
    if (!c || !fine) return;
    const pos = { x: innerWidth / 2, y: innerHeight / 2 }, m = { ...pos };
    const xs = gsap.quickSetter(c, "x", "px"), ys = gsap.quickSetter(c, "y", "px");
    gsap.ticker.add(() => {
      const dt = 1 - Math.pow(1 - 0.2, gsap.ticker.deltaRatio());
      pos.x += (m.x - pos.x) * dt; pos.y += (m.y - pos.y) * dt;
      xs(pos.x); ys(pos.y);
    });
    addEventListener("mousemove", (e) => { m.x = e.clientX; m.y = e.clientY; });
    const w0 = c.offsetWidth, h0 = c.offsetHeight;
    const grow = gsap.timeline({ paused: true, onReverseComplete: () => gsap.set(c, { clearProps: "width,height" }) }).fromTo(c, { width: w0, height: h0 }, { width: "6.5rem", height: "6.5rem", duration: 0.25, ease: "back.in", immediateRender: false });
    const tag = $("[data-cursor-tag]", c);
    document.addEventListener("mouseover", (e) => {
      const a = e.target.closest("a, button"), x = e.target.closest("[data-cursor-grow]");
      c.classList.toggle("is-hover", !!a);
      if (x && !c._grown) { c._grown = true; grow.play(); gsap.to(tag, { opacity: 1, duration: 0.25 }); }
      if (!x && c._grown) { c._grown = false; grow.reverse(); gsap.to(tag, { opacity: 0, duration: 0.25 }); }
    });
  }

  // ───── Loader — first visit only: the blob changes shape every 1s, and when the number · bar fill up it folds away after 2.25s ─────
  function loader(done) {
    const first = !localStorage.getItem("rp-first");
    if (first) localStorage.setItem("rp-first", "1");
    const el = $("[data-loader]");
    if (!el || !first || reduce) { el?.remove(); return done(); }
    el.classList.add("is-on");
    const w = wall($(".rp-wall", el));
    const path = $(".rp-loader__blob path", el), num = $("[data-loader-num]", el), bar = $(".rp-loader__bar", el);
    const loop = gsap.timeline({ repeat: -1 });
    ["a", "b", "c", "d", "e"].forEach((s) => loop.add(morph(path, s, { duration: 1, ease: "power4.inOut" })));
    const intro = gsap.timeline();
    intro.add(w.mov.play());
    intro.from(path, { morphSVG: { shape: SHAPES.dot, type: "linear", map: "size" }, duration: 1, ease: "power4.inOut" }, 0);
    intro.from(num, { yPercent: 20, opacity: 0, duration: 0.5, ease: "power3.out" }, 1);
    let p = 0;
    const t = setInterval(() => {
      p = Math.min(100, p + 1);
      bar.style.setProperty("--progress", p + "%");
      num.textContent = p + "%";
      if (p < 100) return;
      clearInterval(t);
      setTimeout(() => {
        loop.pause();
        const out = gsap.timeline({ onStart: () => w.collapse.play(), onComplete: () => { el.remove(); done(); } });
        out.to(num, { yPercent: -20, opacity: 0, duration: 0.5, ease: "power3.in" });
        out.add(morph(path, "dot", { duration: 1, ease: "power4.inOut" }), "<+=.5");
        out.to($(".rp-loader__blob", el), { opacity: 0, duration: 0.2 }, "<+=1");
        out.to(el, { duration: 1.9 }, "<");
      }, 2250);
    }, 5);
  }

  // ───── Footer ─────
  function footer(root) {
    const slot = $('[data-slot="footer"]', root);
    if (!slot) return;
    slot.outerHTML = `<footer class="rp-foot" data-tone="blue-green" data-name="Here<br>Everything" data-foot>
  <div class="rp-foot__top">
    <ul data-split="lines"><li><a href="#">Legal notice</a></li><li><a href="#">Cookie Policy</a></li><li><a href="#">Personal information</a></li><li><a href="#">Sitemap</a></li></ul>
    <div data-split="lines"><a href="#">Your address first line here<br>Your address second line here</a><br><a href="#">+00 000 000 000</a><br><a href="#">hello@example.com</a></div>
    <span></span>
    <ul data-split="lines"><li><a href="#">Channel 1</a></li><li><a href="#">Channel 2</a></li><li><a href="#">Channel 3</a></li><li><a href="#">Channel 4</a></li></ul>
  </div>
  <div class="rp-foot__wall"><div class="rp-wall" data-wall-f></div>
    <a class="rp-foot__cta rp-shape" href="#" data-shape-in="c d"><span class="rp-shape__bg"></span><span class="rp-shape__txt f-exat" data-label="Two English fragments inviting contact and a greeting go here."><span>Say hello</span><span>Hey!</span></span></a>
    <span class="rp-foot__copy">© Company 0000</span>
  </div>
</footer>`;
    const f = $("[data-foot]", root);
    splitAll(f);
    const w = wall($("[data-wall-f]", f));
    const tl = gsap.timeline({ paused: true, onComplete: () => w.mov.play() });
    tl.add(w.intro.play());
    $$('[data-split="lines"]', f).forEach((el) => { el._used = 1; tl.add(el._tl.play(), "<+=.25"); });
    const fs = $("[data-shape-in]", f); fs._used = 1; tl.add(fs._tl.play(), "<");
    ScrollTrigger.create({ trigger: f, start: "top 75%", animation: tl, toggleActions: "play none none none" });
  }

  // ───── Lenis 1.3.1 (original default) — same tick as ScrollTrigger ─────
  let lenis;
  function smooth() {
    if (reduce || typeof Lenis === "undefined") return;
    lenis = new Lenis();
    window.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ───── Re-hooked on every page ─────
  const pageInits = [];
  window.rpPage = (fn) => pageInits.push(fn);
  function initPage() {
    const root = document;
    footer(root);
    splitAll(root);
    works(root);
    news(root);
    pageInits.forEach((fn) => { try { fn(root); } catch (e) { console.error(e); } });
    sections(root);
    tones(root);
    ScrollTrigger.refresh();
  }

  // ───── swup transition: the cover drops from the top with .75s power2.out to cover the page, then 1s after the new page it slides out downward with .75s power2.in ─────
  function swup() {
    if (typeof Swup === "undefined") return;
    const t = $("[data-transition]"), w = wall($("[data-wall-t]", t), { transition: true });
    const sw = new Swup({ containers: ["#swup"], linkSelector: 'a[href]:not([href^="#"]):not([target="_blank"])', animateHistoryBrowsing: true, cache: false });
    sw.hooks.replace("animation:out:await", async () => {
      window.rpCloseMenu?.();
      w.intro.progress(0).play(); w.mov.progress(0).play(); w.collapse.progress(0).pause();
      await gsap.fromTo(t, { y: "-105%" }, { y: "0%", duration: reduce ? 0 : 0.75, ease: "power2.out" });
    });
    sw.hooks.on("content:replace", () => {
      ScrollTrigger.getAll().forEach((s) => s.kill());
      pageInits.length = 0;
      document.body.dataset.page = $("#swup").dataset.page || "";
    });
    sw.hooks.replace("animation:in:await", async () => {
      // Attach after loading the new page script (rpPage)
      await loadPageScript();
      lenis?.scrollTo(0, { immediate: true });
      initPage();
      w.mov.pause(); w.collapse.play();
      await gsap.fromTo(t, { y: "0%" }, { y: "100%", duration: reduce ? 0 : 0.75, delay: reduce ? 0 : 1, ease: "power2.in" });
    });
  }
  // Loads the page script (data-page-js) called by the new body only once
  const loaded = new Set([...document.scripts].map((s) => s.src));
  function loadPageScript() {
    const src = $("#swup")?.dataset.pageJs;
    if (!src) return Promise.resolve();
    const url = new URL(src, location.href).href;
    if (loaded.has(url)) { if (window.rpPages?.[src]) pageInits.push(window.rpPages[src]); return Promise.resolve(); }
    loaded.add(url);
    return new Promise((ok) => { const s = document.createElement("script"); s.src = url; s.onload = ok; s.onerror = ok; document.body.append(s); });
  }

  header();
  menu();
  cursor();
  smooth();
  swup();
  document.fonts.ready.then(() => loader(() => { initPage(); window.dispatchEvent(new Event("rp:ready")); }));
})();
