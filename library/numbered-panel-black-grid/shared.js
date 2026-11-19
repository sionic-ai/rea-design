// Shared across the whole site — header · footer · bottom bar · cursor tag · loader (%) · transition curtain, photo panel entrance, list glass band.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const small = () => innerWidth < 650;
  if (reduce) document.documentElement.classList.add("is-reduce");
  gsap.registerPlugin(ScrollTrigger);
  // Line-rise effect registered by the original — from 105% below, .5s power2, .035s stagger
  gsap.registerEffect({ name: "masked", effect: (t, c) => gsap.from(t, { yPercent: 105, ...c }), defaults: { duration: 0.5, stagger: 0.035, ease: "power2" }, extendTimeline: true });
  try { if (sessionStorage.getItem("g-sw") === "1") document.documentElement.classList.add("is-sw"); } catch {}

  // ── Outer frame ─────────────────────────────────────────────
  const page = document.body.dataset.page;
  const SERVICES = ["What we do 1", "What we do 2", "What we do 3"];
  const AWARDS = ["Award name 1 (00x)", "Award name 2 (00x)", "Award name 3 (0x)", "Award name 4 (0x)", "Award name 5 (0x)", "Award name 6 (0x)", "Award name 7 (0x)"];
  function renderChrome() {
    const head = document.querySelector("[data-g-head]");
    if (head) head.innerHTML = `<div class="g-max g-grid">
      <button class="g-head__name g-mask" type="button" data-home><span class="g-up">Your name here</span></button>
      <div class="g-head__avail g-mask"><span class="g-up">Your available working times here</span></div>
      <div class="g-head__col is-1"><div class="g-mask"><span class="g-up">What we do</span></div><ul>${SERVICES.map((t) => `<li class="g-mask"><span class="g-up">${t}</span></li>`).join("")}</ul></div>
      <div class="g-head__col is-2"><div class="g-mask"><span class="g-up">Award received</span></div><ul>${AWARDS.map((t) => `<li class="g-mask"><span class="g-up">${t}</span></li>`).join("")}</ul></div>
      <div class="g-head__pro"><span class="h-pill${page === "about" ? " is-active" : ""}"><span class="g-mask"><a class="g-up" href="about.html">About</a></span></span></div>
      <div class="g-head__mail"><span class="h-pill"><span class="g-mask"><button class="g-up" type="button" data-mail style="background:none;border:0;padding:0;color:inherit;font:inherit;cursor:pointer">Send email</button></span></span></div></div>`;
    const foot = document.querySelector("[data-g-foot]");
    if (foot) foot.innerHTML = `<div class="g-max g-grid">
      <div class="g-foot__a"><div>©0000</div><a class="h-pill" href="#privacy" data-nav-ignore>Privacy policy</a></div>
      <ul><li><a class="h-pill" href="#channel" data-nav-ignore>Channel 1</a></li><li><a class="h-pill" href="#channel" data-nav-ignore>Channel 2 (X)</a></li></ul>
      <ul><li><a class="h-pill" href="#channel" data-nav-ignore>Channel 3</a></li><li><a class="h-pill" href="#channel" data-nav-ignore>Channel 4</a></li></ul>
      <div class="g-foot__r is-end"><button class="h-pill" type="button" data-nav-ignore style="background:none;border:0;padding:0;color:inherit;font:inherit">Newsletter</button></div>
      <div class="g-foot__r"><a class="h-pill" href="#course" data-nav-ignore>Class</a></div></div>`;
    const bar = document.createElement("div");
    bar.className = "g-bar";
    bar.dataset.slot = "view-bar";
    bar.innerHTML = `<nav class="g-bar__set${page === "home" ? "" : " is-off"}"><a href="index.html" class="${page === "home" ? "is-on" : ""}">Grid</a><a href="#gallery" data-nav-ignore data-gallery>Gallery</a></nav>
      <div class="g-bar__set"><button type="button" data-mode="normal">Regular</button><button type="button" data-mode="sw">Product</button></div>`;
    const cursor = document.createElement("div");
    cursor.className = "g-cursor";
    const mask = document.createElement("div");
    mask.className = "g-tmask";
    document.body.append(bar, mask, cursor);
  }
  renderChrome();

  // ── Smooth scroll — Lenis 1.3.23, original lerp .15 · wheel 1.25×, driven by the gsap ticker ──
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.15, wheelMultiplier: 1.25, autoResize: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    const ro = new ResizeObserver(() => lenis.resize());
    ro.observe(document.body);
  }

  // ── Photo board appear — each board rises from below by (screen height − top of its cell) over 1.3s expo, staggered .075s (from the top) ──
  function intro() {
    if (reduce) return;
    const wh = innerHeight;
    const planes = [...document.querySelectorAll("[data-plane]")].filter((p) => { const r = p.getBoundingClientRect(); return r.width && r.top + r.height > 0 && r.top < wh && r.left + r.width > 0 && r.left < innerWidth; })
      .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    planes.forEach((p, i) => {
      const box = p.closest(".js-intro");
      const top = box ? box.getBoundingClientRect().top : p.getBoundingClientRect().top;
      const y = wh - top, d = i * 0.075 + (+p.dataset.introDelay || 0);
      gsap.fromTo(p, { y }, { y: 0, duration: 1.3, ease: "expo", delay: d, clearProps: "transform" });
      const els = box ? box.querySelectorAll(".js-intro-el") : [];
      if (els.length) gsap.fromTo(els, { y }, { y: 0, duration: 1.3, ease: "expo", delay: d, clearProps: "transform" });
    });
    window.dispatchEvent(new CustomEvent("g:intro"));
  }
  function headIn(delay) {
    const ups = document.querySelectorAll(".g-head .g-up");
    if (ups.length && !reduce) gsap.effects.masked(ups, { delay });
  }
  function fadeIn(sel, delay) {
    const els = document.querySelectorAll(sel);
    if (els.length && !reduce) gsap.fromTo(els, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: "power1.inOut", stagger: 0.15, delay });
  }

  // ── Loader — % follows as images download, rising .6s at a time, and when all are in the panel rises and the curtain clears in .6s ──
  // Pages entered via transition (the original is a single-page app, so there is no loader) lift the black transition curtain in .35s
  const mask = document.querySelector(".g-tmask");
  let arrived = null;
  try { arrived = sessionStorage.getItem("g-nav"); sessionStorage.removeItem("g-nav"); } catch {}
  function start() {
    if (arrived && !reduce) {
      gsap.set(mask, { autoAlpha: 1 });
      lenis?.scrollTo(0, { immediate: true });
      gsap.to(mask, { autoAlpha: 0, duration: 0.35, ease: "power1" });
      fadeIn(".js-t-fade", 0.3);
      headIn(0.25);
      intro();
      return;
    }
    const loader = document.createElement("div");
    loader.className = "g-loader";
    loader.dataset.slot = "loader";
    loader.innerHTML = "<p>0%</p>";
    document.body.append(loader);
    if (reduce) { loader.remove(); return; }
    lenis?.stop();
    const p = loader.firstElementChild, o = { v: 0 };
    let tw = null;
    const to = (m) => { tw?.kill(); tw = gsap.to(o, { v: m * 100, duration: 0.6, ease: "power1", onUpdate: () => (p.textContent = Math.round(o.v) + "%") }); return tw; };
    // Placeholder photos have nothing to load, so they count as evenly loaded by board count (the original advances one step per photo or video loaded)
    const n = Math.max(4, Math.min(12, document.querySelectorAll("[data-plane]").length));
    let k = 0;
    const step = () => {
      k++;
      const last = to(k / n);
      if (k < n) setTimeout(step, 200);
      else last.then(() => {
        intro();
        headIn(0.25);
        fadeIn(".js-i-fade", 0.5);
        gsap.to(loader, { autoAlpha: 0, duration: 0.6, ease: "power1.out", onComplete: () => { loader.remove(); lenis?.start(); } });
      });
    };
    setTimeout(step, 200);
  }

  // ── Transition — the panel blurs and a black curtain covers it in .35s power1, then navigates ──
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target || a.hasAttribute("data-nav-ignore") || e.metaKey || e.ctrlKey || e.button) return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html$/.test(href)) return;
    e.preventDefault();
    if (reduce) { location.href = href; return; }
    try { sessionStorage.setItem("g-nav", "1"); } catch {}
    gsap.to("[data-plane]", { autoAlpha: 0, duration: 0.3, ease: "power1" });
    gsap.to(mask, { autoAlpha: 1, duration: 0.35, ease: "power1", onComplete: () => (location.href = href) });
  });
  document.querySelector("[data-home]")?.addEventListener("click", () => {
    if (page === "home") { lenis ? lenis.scrollTo(0) : scrollTo({ top: 0, behavior: "smooth" }); return; }
    document.querySelector('.g-bar a[href="index.html"]')?.click();
  });

  // ── Bottom bar — normal/Sci-fi · grid/gallery ──
  const modeBtns = [...document.querySelectorAll("[data-mode]")];
  const setMode = (sw) => {
    document.documentElement.classList.toggle("is-sw", sw);
    modeBtns.forEach((b) => b.classList.toggle("is-on", (b.dataset.mode === "sw") === sw));
    try { sessionStorage.setItem("g-sw", sw ? "1" : "0"); } catch {}
  };
  setMode(document.documentElement.classList.contains("is-sw"));
  modeBtns.forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode === "sw")));

  // ── Mail button — on hover shows ‹Copy mail›, on press shows ‹Copied› for 2s (the original puts the address on the clipboard — a placeholder is not copied) ──
  const mailBtn = document.querySelector("[data-mail]");
  if (mailBtn) {
    let back = null;
    if (fine) { mailBtn.addEventListener("mouseenter", () => (mailBtn.textContent = "Copy Email")); mailBtn.addEventListener("mouseleave", () => (mailBtn.textContent = "Send email")); }
    mailBtn.addEventListener("click", () => { mailBtn.textContent = "Copied"; back?.kill(); back = gsap.delayedCall(2, () => (mailBtn.textContent = "Send email")); });
  }

  // ── Bottom bar — when the footer enters the bottom 15% of the screen, the whole bar steps aside in .3s power1 ──
  const barEl = document.querySelector(".g-bar"), footEl = document.querySelector(".g-foot");
  if (barEl && footEl && "IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => gsap.to(barEl, { autoAlpha: en.isIntersecting ? 0 : 1, duration: reduce ? 0 : 0.3, ease: "power1", overwrite: true }), { rootMargin: "0px 0px 15% 0px" }).observe(footEl);
  }

  // ── Cursor tag — follows 16px right of and below the cursor with .35s power3. The text comes from data-cursor under the cursor ──
  const cur = document.querySelector(".g-cursor");
  if (fine && !reduce) {
    const qx = gsap.quickTo(cur, "x", { duration: 0.35, ease: "power3" }), qy = gsap.quickTo(cur, "y", { duration: 0.35, ease: "power3" });
    const c = { x: -1, y: -1 };
    let first = true;
    addEventListener("pointermove", (e) => {
      c.x = e.clientX; c.y = e.clientY;
      if (first) { first = false; gsap.set(cur, { x: c.x + 16, y: c.y + 16 }); } else { qx(c.x + 16); qy(c.y + 16); }
    }, { passive: true });
    addEventListener("pointerdown", () => (cur.textContent = ""), true);
    gsap.ticker.add(() => {
      if (c.x < 0) return;
      const t = document.elementFromPoint(c.x, c.y)?.closest?.("[data-cursor]")?.getAttribute("data-cursor") || "";
      if (cur.textContent !== t) cur.textContent = t;
    });
  }

  // ── List group — a glass strip slides to the center of the hovered row in .35s expo (the first time it turns on in place in .3s, on leaving .15s) ──
  const ARROW = '<svg viewBox="0 0 9 9" fill="none"><path class="g-ar is-a" d="M8.8 6.5H7.5V2.3L1 8.8 0 7.9l6.6-6.6H2.3V0h6.5Z" fill="currentColor"/><path class="g-ar is-b" d="M8.8 6.5H7.5V2.3L1 8.8 0 7.9l6.6-6.6H2.3V0h6.5Z" fill="currentColor"/></svg>';
  const PLUS = '<svg viewBox="0 0 9 9"><path d="M4 0h1v9H4zM0 4h9v1H0z" fill="currentColor"/></svg>';
  document.querySelectorAll("[data-group]").forEach((g) => {
    const bar = document.createElement("div");
    bar.className = "g-group__bar";
    bar.innerHTML = (g.dataset.label ? `<span>${g.dataset.label}</span>` : "") + (g.dataset.group === "out" ? ARROW : PLUS);
    g.prepend(bar);
    const arrows = bar.querySelectorAll(".g-ar");
    if (arrows.length) { gsap.set(arrows[1], { xPercent: -105, yPercent: 105 }); }
    let on = false;
    const move = (li) => {
      const y = li.offsetTop + (li.offsetHeight - bar.offsetHeight) / 2;
      if (on) gsap.to(bar, { y, duration: 0.35, ease: "expo", overwrite: "auto" });
      else { on = true; gsap.set(bar, { y }); gsap.to(bar, { autoAlpha: 1, duration: 0.3, ease: "expo", overwrite: "auto" }); }
    };
    const leave = () => { if (!on) return; on = false; gsap.to(bar, { autoAlpha: 0, duration: 0.15, ease: "power1", overwrite: "auto" }); };
    g.querySelectorAll("li").forEach((li) => {
      li.classList.toggle("is-link", g.dataset.group !== "static");
      li.addEventListener("mouseenter", () => (g.dataset.group === "static" ? leave() : move(li)));
    });
    g.addEventListener("mouseleave", leave);
    // External links swap their two arrows crossing diagonally (.5s expo-out, .2s delay)
    if (arrows.length) {
      g.addEventListener("mouseenter", () => { gsap.to(arrows[0], { xPercent: 105, yPercent: -105, duration: 0.5, ease: "expo.out", overwrite: true }); gsap.to(arrows[1], { xPercent: 0, yPercent: 0, duration: 0.5, ease: "expo.out", delay: 0.2, overwrite: true }); });
      g.addEventListener("mouseleave", () => { gsap.to(arrows[1], { xPercent: -105, yPercent: 105, duration: 0.5, ease: "expo.out", overwrite: true }); gsap.to(arrows[0], { xPercent: 0, yPercent: 0, duration: 0.5, ease: "expo.out", delay: 0.2, overwrite: true }); });
    }
  });

  window.G = { reduce, fine, small, get lenis() { return lenis; }, intro };
  // Starts after the page scripts (index.js, about.js) have drawn all panels
  requestAnimationFrame(() => (document.fonts?.ready || Promise.resolve()).then(start));
})();
