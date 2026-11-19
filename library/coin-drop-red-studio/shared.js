// Common to all pages: draws the header bar, menu cover, following header bar, “I need” panel, footer and transition panel, and wires up Lenis, menu and panel motion.
// Original values: menu height .7s cubic-bezier(.45,0,.2,1) → name 110% → 0 .6s elastic.out(1,.55) .07 stagger(.35s) · marker .4s .02(.45s) · bottom line .4s(.6s) · top line .32s(.66s)
// · ‹I need› pill band advances one slot every 4.2s expo.inOut, snaps to slots when dragged · the following headline line comes down when scrolled up.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const AW = (window.AW = { reduced, page, lenis: null });
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  if (window.CustomEase) { gsap.registerPlugin(CustomEase); CustomEase.create("panelFill", "M0,0 C0.45,0 0.2,1 1,1"); }

  const arrow = (d) => `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="${d}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const ARROWS = { "up-right": "M4 12 12 4M5.5 4H12v6.5", right: "M2.5 8h11M9 3.5 13.5 8 9 12.5", up: "M8 13.5v-11M3.5 7 8 2.5 12.5 7" };
  AW.swap = (dir = "up-right") => `<span class="aw-swap" data-dir="${dir}"><i>${arrow(ARROWS[dir])}</i><i>${arrow(ARROWS[dir])}</i></span>`;
  // English placeholder instead of the original wordmark — only the final dot uses the accent color. Each letter sits in its own window so only letters the cursor has passed get flipped
  AW.logo = `<span class="aw-logo__word" data-label="Studio English wordmark · lowercase + dot">${[..."studio"].map((c) => `<span class="aw-ch"><b>${c}</b></span>`).join("")}<span class="aw-ch"><b><i>.</i></b></span></span>`;
  const nav = (kind) => `<div class="aw-nav aw-nav--${kind}" data-site-nav="${kind}">
      <a class="aw-logo" href="index.html" data-page-label="Home" aria-label="Home">${AW.logo}</a>
      <div class="aw-nav__act">
        <a class="aw-pill aw-pill--contact" href="#contact">get in touch.</a>
        <button class="aw-pill aw-pill--menu" type="button" aria-expanded="false" aria-controls="aw-menu" aria-label="Open Menu" data-open="false">
          <span class="aw-pill__label"><span>menu.</span><span>close.</span></span><span class="aw-burger"><i></i><i></i><i></i></span>
        </button>
      </div>
    </div>`;
  AW.nav = nav;
  $$("[data-slot='header']").forEach((h) => { h.innerHTML = nav(h.dataset.kind || "dev"); });

  // Menu cover · follow-along header bar · transition panel
  document.body.insertAdjacentHTML("beforeend", `
    <div class="aw-sticky" data-slot="sticky-nav" data-shown="false" inert>${nav("dev")}</div>
    <div class="aw-menu" id="aw-menu" role="dialog" aria-modal="true" aria-label="Site Menu" data-open="false" data-visible="false" inert data-slot="menu-overlay">
      <div class="aw-menu__stage">
        <div class="aw-menu__bar">${nav("hero")}</div>
        <nav class="aw-menu__nav" aria-label="Main menu"><ul>
          ${[["index.html", "Home"], ["service.html", "Services"], ["works.html", "Projects"], ["#contact", "Contacts"]].map(([h, t], i) => `<li><a class="aw-menu__link" href="${h}" data-page-label="${t}"><span class="aw-menu__idx">0${i + 1}</span><i class="aw-menu__dia"></i><i class="aw-menu__rule"></i><span class="aw-menu__mask"><span class="aw-menu__label">${t}</span></span></a></li>`).join("")}
        </ul></nav>
        <div class="aw-menu__meta"><div class="aw-menu__socials"><a href="#">Social One</a><a href="#">Social Two</a></div><span>Say hello: <a href="#">hello@studio.name</a></span></div>
      </div>
    </div>
    <div data-fx="sheet-label-page" data-slot="page-transition"></div>`);

  const menu = $("#aw-menu");
  let open = false, menuTl = null;
  const buildMenu = () => {
    const bar = $(".aw-menu__bar", menu), labels = $$(".aw-menu__label", menu), marks = $$(".aw-menu__idx, .aw-menu__dia, .aw-menu__rule", menu), meta = $(".aw-menu__meta", menu);
    gsap.set(labels, { yPercent: 110 });
    gsap.set([bar, ...marks, meta], { opacity: 0 });
    menuTl = gsap.timeline({ paused: true, defaults: { ease: "elastic.out(1, 0.55)" }, onReverseComplete: () => (menu.dataset.visible = "false") })
      .fromTo(menu, { height: 0 }, { height: () => innerHeight - 2 * parseFloat(getComputedStyle(menu).top), duration: 0.7, ease: window.CustomEase ? "panelFill" : "power3.inOut" })
      .fromTo(labels, { yPercent: 110 }, { yPercent: 0, duration: 0.6, stagger: 0.07 }, 0.35)
      .fromTo(marks, { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.02 }, 0.45)
      .fromTo(meta, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, 0.6)
      .fromTo(bar, { opacity: 0 }, { opacity: 1, duration: 0.32 }, 0.66);
  };
  const setMenu = (v) => {
    open = v;
    menu.dataset.open = String(v);
    menu.inert = !v;
    $$(".aw-pill--menu").forEach((b) => { b.dataset.open = String(v); b.setAttribute("aria-expanded", String(v)); b.setAttribute("aria-label", v ? "Close Menu" : "Open Menu"); });
    if (v) { menu.dataset.visible = "true"; AW.lenis?.stop(); }
    else AW.lenis?.start();
    if (reduced) { gsap.set(menu, { height: v ? innerHeight - 2 * parseFloat(getComputedStyle(menu).top) : 0 }); if (!v) menu.dataset.visible = "false"; return; }
    if (!menuTl) buildMenu();
    v ? menuTl.timeScale(1).play() : menuTl.timeScale(1.45).reverse();
    if (v) $(".aw-menu__link", menu).focus({ preventScroll: true });
  };
  // Hide the name ahead of time, or on first open it jumps down and then rises back up
  if (!reduced) buildMenu();
  document.addEventListener("click", (e) => { if (e.target.closest(".aw-pill--menu")) setMenu(!open); else if (open && e.target.closest(".aw-menu__link")) setMenu(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && open) setMenu(false); });

  // Trailing headline — appears when you scroll up after the first headline has left the screen
  const sticky = $(".aw-sticky");
  let lastY = scrollY;
  addEventListener("scroll", () => {
    const y = scrollY, past = y > innerHeight * 0.6, up = y < lastY - 2, down = y > lastY + 2;
    if (past && up) { sticky.dataset.shown = "true"; sticky.inert = false; }
    else if (!past || down) { sticky.dataset.shown = "false"; sticky.inert = true; }
    lastY = y;
  }, { passive: true });

  // ”I need” panel
  const cta = $("[data-slot='cta-band']");
  if (cta) {
    const words = ["development", "web design", "branding"];
    const pills = Array.from({ length: 12 }, (_, i) => words[i % 3]);
    cta.classList.add("aw-cta");
    cta.dataset.step = "1";
    cta.innerHTML = `<div class="aw-cta__one">
        <p class="aw-cta__label" id="aw-cta-label">I need</p>
        <div class="aw-cta__win"><ul class="aw-cta__reel" role="radiogroup" aria-labelledby="aw-cta-label">${pills.map((w) => `<li><button class="aw-cta__pill" type="button" data-word="${w}">${w}</button></li>`).join("")}</ul></div>
        <button class="aw-cta__next" type="button" data-arrow-host>next ${AW.swap("right")}</button>
      </div>
      <form class="aw-cta__two" aria-label="Inquiry" onsubmit="return false">
        <p class="aw-cta__recap"><span>I need</span><button type="button" class="aw-cta__back">development</button></p>
        <div class="aw-cta__fields"><input class="aw-cta__field" type="text" placeholder="your name" aria-label="Name"><input class="aw-cta__field" type="email" placeholder="email" aria-label="Email"><button class="aw-cta__next" type="button" data-arrow-host>next ${AW.swap("right")}</button></div>
      </form>`;
    const reel = $(".aw-cta__reel", cta), btns = $$(".aw-cta__pill", cta);
    let idx = 3, timer = 0;
    const pitch = () => btns[1].getBoundingClientRect().top - btns[0].getBoundingClientRect().top || btns[1].getBoundingClientRect().left - btns[0].getBoundingClientRect().left;
    const vertical = () => innerWidth >= 1280;
    const place = (i, dur = 0.9) => {
      idx = i;
      btns.forEach((b, k) => b.toggleAttribute("data-selected", b.dataset.word === btns[i].dataset.word && k === i));
      const p = pitch();
      gsap.to(reel, vertical() ? { y: -i * p, x: 0, xPercent: -50, duration: reduced ? 0 : dur, ease: "expo.inOut" } : { x: -i * p, y: 0, xPercent: 0, duration: reduced ? 0 : dur, ease: "expo.inOut" });
      $(".aw-cta__back", cta).textContent = btns[i].dataset.word;
    };
    const loopIdx = (i) => (i < 3 ? i + 6 : i > 8 ? i - 6 : i);
    const tick = () => { if (!document.hidden && cta.dataset.step === "1") { place(idx + 1); setTimeout(() => { const j = loopIdx(idx); if (j !== idx) { idx = j; place(j, 0); } }, 950); } };
    const run = () => { clearInterval(timer); if (!reduced) timer = setInterval(tick, 4200); };
    btns.forEach((b, k) => b.addEventListener("click", () => { place(k); run(); }));
    // Drag it and it follows the hand, then settles on the nearest cell
    let drag = null;
    reel.addEventListener("pointerdown", (e) => { drag = { s: vertical() ? e.clientY : e.clientX, at: gsap.getProperty(reel, vertical() ? "y" : "x"), moved: false }; reel.setPointerCapture(e.pointerId); clearInterval(timer); });
    reel.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const d = (vertical() ? e.clientY : e.clientX) - drag.s;
      if (Math.abs(d) > 4) drag.moved = true;
      gsap.set(reel, vertical() ? { y: drag.at + d } : { x: drag.at + d });
    });
    reel.addEventListener("pointerup", () => { if (!drag) return; const cur = gsap.getProperty(reel, vertical() ? "y" : "x"); const was = drag.moved; drag = null; if (was) place(loopIdx(Math.round(-cur / pitch())), 0.6); run(); });
    $(".aw-cta__one .aw-cta__next", cta).addEventListener("click", () => { cta.dataset.step = "2"; clearInterval(timer); });
    $(".aw-cta__back", cta).addEventListener("click", () => { cta.dataset.step = "1"; run(); });
    requestAnimationFrame(() => { place(3, 0); run(); });
    addEventListener("resize", () => place(idx, 0));
  }

  // Work list hover (first page · detail) — 1280 and up: the photo of the hovered row comes to the front, and previously hovered photos are pushed up, shrunk and faded, stacking in layers.
  // Other lines fade to .28 (.34s power4.out · .2s power2.out). On leaving the list the photo blurs away over .38s and then returns to its hidden spot.
  $$(".aw-swap-slot").forEach((s) => (s.outerHTML = AW.swap(s.dataset.dir)));
  const arch = $(".ih-arch__rows");
  if (arch) gsap.matchMedia().add("(min-width: 1280px) and (prefers-reduced-motion: no-preference)", () => {
    const rows = $$(".ih-arch__row"), layers = $$(".ih-arch__layer");
    const STACK = [{ y: 0, scale: 1, blur: 0, opacity: 1 }, { y: -70, scale: 0.88, blur: 4, opacity: 0.45 }, { y: -120, scale: 0.78, blur: 7, opacity: 0.24 }, { y: -155, scale: 0.68, blur: 9, opacity: 0.12 }];
    const HIDE = { y: -180, scale: 0.6, blur: 9, opacity: 0 };
    gsap.set(layers, { y: HIDE.y, scale: HIDE.scale, opacity: 0, zIndex: 0, filter: `blur(${HIDE.blur}px)` });
    let order = [], live = false;
    const paint = () => layers.forEach((l, k) => {
      const at = live ? order.indexOf(k) : -1, on = at >= 0 && at < STACK.length, s = on ? STACK[at] : HIDE;
      gsap.set(l, { zIndex: on ? STACK.length - at : 0 });
      gsap.to(l, { y: s.y, scale: s.scale, opacity: s.opacity, filter: `blur(${s.blur}px)`, duration: 0.34, ease: "power4.out", overwrite: "auto" });
    });
    const enter = (i) => {
      live = true;
      order = [i, ...order.filter((k) => k !== i)].slice(0, STACK.length + 2);
      rows.forEach((r, k) => { r.dataset.active = String(k === i); gsap.to(r, { opacity: k === i ? 1 : 0.28, duration: 0.2, ease: "power2.out", overwrite: "auto" }); });
      paint();
    };
    const leave = () => {
      live = false;
      rows.forEach((r) => { r.dataset.active = "false"; gsap.to(r, { opacity: 1, duration: 0.22, ease: "power2.out", overwrite: "auto" }); });
      layers.forEach((l) => gsap.to(l, { opacity: 0, filter: `blur(${HIDE.blur}px)`, duration: 0.38, ease: "power2.out", overwrite: "auto", onComplete: () => gsap.set(l, { y: HIDE.y, scale: HIDE.scale }) }));
    };
    const on = rows.map((r, i) => { const f = () => enter(i); r.addEventListener("mouseenter", f); return [r, f]; });
    arch.addEventListener("mouseleave", leave);
    return () => { arch.removeEventListener("mouseleave", leave); on.forEach(([r, f]) => r.removeEventListener("mouseenter", f)); };
  });

  // Pink line behind the list panel — scrubbed to scroll, drawn from when the panel touches 85% of the screen until its bottom reaches 60% (scrub .8)
  $$(".ih-arch__rope path").forEach((p) => {
    p.setAttribute("pathLength", "1000");
    if (reduced) return;
    const d = { v: 0 };
    const paint = () => { p.style.strokeDasharray = `${d.v} 2000`; p.style.visibility = d.v > 0.5 ? "" : "hidden"; };
    paint();
    gsap.to(d, { v: 1000, ease: "none", onUpdate: paint, scrollTrigger: { trigger: p.closest(".ih-arch__panel"), start: "top 85%", end: "bottom 60%", scrub: 0.8 } });
  });

  const foot = $("[data-slot='footer']");
  if (foot) {
    foot.classList.add("aw-foot");
    foot.id = "contact";
    foot.innerHTML = `<div class="aw-foot__in">
        <a class="aw-logo" href="index.html" data-page-label="Home" aria-label="Home">${AW.logo}</a>
        <nav class="aw-foot__col" aria-label="Footer"><ul><li><a href="index.html" data-page-label="Home">Home</a></li><li><a href="service.html" data-page-label="Services">Services</a></li><li><a href="works.html" data-page-label="Projects">Projects</a></li><li><a href="#contact">Contacts</a></li></ul></nav>
        <div class="aw-foot__col"><ul><li><a href="#">Social One</a></li><li><a href="#">Social Two</a></li></ul></div>
        <div class="aw-foot__info"><div><span class="aw-foot__lab">Your contact name here</span><a class="aw-foot__val" href="#" data-copy-mail>hello@studio.name</a></div><div><span class="aw-foot__lab">Your location name here</span><span class="aw-foot__val">City 00:00 · 0°C</span></div></div>
        <p class="aw-foot__copy">© Studio 0000. All rights reserved.</p>
        <nav class="aw-foot__legal" aria-label="Terms"><ul><li><a href="#">Privacy</a></li><li><a href="#">Cookies</a></li><li><a href="#">Terms</a></li></ul></nav>
        <button class="aw-foot__top" type="button" data-arrow-host>Back to top ${AW.swap("up")}</button>
      </div>`;
    $(".aw-foot__top", foot).addEventListener("click", () => (AW.lenis ? AW.lenis.scrollTo(0) : scrollTo({ top: 0, behavior: "smooth" })));
  }

  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  // Letter swap (logo·Hero title) — when the cursor touches a new letter, only that letter slips off in the cursor’s direction (.18s power2.in) and bounces back from the opposite side (.5s elastic.out(1,.55)).
  // Moves inside a wrapper (parent, overflow hidden) around each character
  AW.charSwap = (root, glyphs) => {
    if (!fine || reduced || !glyphs.length) return;
    const host = new Map();
    glyphs.forEach((g) => { const p = g.parentElement; p.dataset.swapChar = ""; host.set(p, g); });
    let lastX = null, dir = 1, cur = null;
    root.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      if (lastX !== null && e.clientX !== lastX) dir = e.clientX > lastX ? 1 : -1;
      lastX = e.clientX;
      // Catch that character just above and below the text box (line spacing) too
      let g = host.get(document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-swap-char]")) || null;
      if (!g) for (const [p, k] of host) { const r = p.getBoundingClientRect(); if (e.clientX >= r.left && e.clientX < r.right && Math.abs(e.clientY - (r.top + r.bottom) / 2) < r.height * 0.75) { g = k; break; } }
      if (!g || g === cur) { cur = g; return; }
      cur = g;
      gsap.killTweensOf(g);
      gsap.timeline().to(g, { xPercent: 100 * dir, duration: 0.18, ease: "power2.in" }).set(g, { xPercent: -100 * dir }).to(g, { xPercent: 0, duration: 0.5, ease: "elastic.out(1, 0.55)" });
    });
    root.addEventListener("pointerleave", () => { cur = null; lastX = null; });
  };
  $$(".aw-logo").forEach((logo) => AW.charSwap(logo, $$(".aw-ch b", logo)));

  // Email address — hovering the hand makes the address slide up out of view and a ”Copy” prompt rise from below (.4s land · fade .2s), pressing it copies to the clipboard and changes to ”Copied”.
  // Once it is copied, a direct-send link appears beside it, and 4 seconds after release it returns to the start. On touch devices or without a clipboard it is just a mailto link.
  $$("[data-copy-mail]").forEach((a) => {
    const mail = a.textContent.trim();
    a.href = `mailto:${mail}`;
    if (!fine || !navigator.clipboard?.writeText) return;
    const wrap = document.createElement("span");
    wrap.className = "aw-mail";
    wrap.dataset.state = "idle";
    a.replaceWith(wrap);
    a.classList.add("aw-mail__copy");
    a.setAttribute("aria-label", `Copy to clipboard: ${mail}`);
    a.innerHTML = `<span class="aw-mail__lab aw-mail__addr" aria-hidden="true">${mail}</span><span class="aw-mail__lab aw-mail__hint" aria-hidden="true">Copy to clipboard</span><span class="aw-mail__lab aw-mail__done" aria-hidden="true">Copied to clipboard.</span>`;
    wrap.append(a);
    let t = 0;
    const reset = () => { wrap.dataset.state = "idle"; wrap.querySelector(".aw-mail__direct")?.remove(); };
    wrap.addEventListener("pointerenter", () => clearTimeout(t));
    wrap.addEventListener("pointerleave", () => { if (wrap.dataset.state === "copied") { clearTimeout(t); t = setTimeout(reset, 4000); } });
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      navigator.clipboard.writeText(mail).then(() => {
        wrap.dataset.state = "copied";
        if (!wrap.querySelector(".aw-mail__direct")) wrap.insertAdjacentHTML("beforeend", `<a class="aw-mail__direct" href="mailto:${mail}">Message us directly.</a>`);
      }, () => (location.href = `mailto:${mail}`));
    });
  });

  if (window.Lenis && !reduced && document.body.dataset.lenis !== "off") {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    AW.lenis = lenis;
  }
})();
