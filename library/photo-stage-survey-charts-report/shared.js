// Shared across pages: Lenis 1.3.23 (same build and lerp .1 as the original), logo loader, logo hide, menu card, section ticks, page-number pill, share modal, black drawer,
// Background color switching · header text color · film grain · text reveal (original motionHeading/Text values) · Lottie chart (original dotlottie-web 0.71.0 as is, artwork is ours).
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = () => matchMedia("(max-width: 767px)").matches;
  const OW = (window.OW = { reduce, mobile, ready: false });

  // ── Smooth scroll: original ReactLenis defaults (lerp .1, smoothWheel) ──
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  OW.lenis = lenis;
  OW.scrollTo = (target) => (lenis ? lenis.scrollTo(target, { duration: 1.2 }) : (typeof target === "number" ? scrollTo(0, target) : document.querySelector(target)?.scrollIntoView()));

  // ── Shared color reading (canvas and Lottie can’t read var()) ──
  const swatch = document.createElement("i");
  OW.color = (v) => { swatch.style.color = `var(${v})`; document.body.append(swatch); const c = getComputedStyle(swatch).color; swatch.remove(); return c; };
  OW.rgb01 = (v) => { const m = OW.color(v).match(/[\d.]+/g).map(Number); return [m[0] / 255, m[1] / 255, m[2] / 255, 1]; };

  // ── Letter roll: the text in [data-roll] is stacked in two letter-level rows (hover is css) ──
  document.querySelectorAll("[data-roll]").forEach((el) => {
    const text = el.textContent.trim();
    if (!text) return;
    const row = () => `<span class="ow-roll__row">${[...text].map((c) => `<span class="ow-roll__ch">${c === " " ? "&nbsp;" : c}</span>`).join("")}</span>`;
    el.setAttribute("aria-label", text);
    el.innerHTML = `<span class="ow-roll" aria-hidden="true">${row()}${row()}</span>`;
  });
  // Original button hover: each text line moves yPercent −100 with a .02 gap, .5 back, the icon moves x 4 · rotates 315° in .5 back (reversed on leave)
  const hoverOf = (host) => {
    const rows = [...host.querySelectorAll(".ow-roll__row")].map((r) => [...r.children]);
    const icon = host.querySelector(".ow-btn__icon svg, .ow-pill__plus svg");
    if (!rows.length && !icon) return;
    const go = (on) => {
      rows.forEach((chars) => { gsap.killTweensOf(chars); gsap.to(chars, { yPercent: on ? -100 : 0, stagger: 0.02, duration: 0.5, ease: "back" }); });
      if (icon) { gsap.killTweensOf(icon); gsap.to(icon, { x: on ? 4 : 0, rotation: on ? 315 : 0, duration: 0.5, ease: "back" }); }
    };
    host.addEventListener("mouseenter", () => go(true));
    host.addEventListener("mouseleave", () => go(false));
    host.addEventListener("focus", () => go(true));
    host.addEventListener("blur", () => go(false));
  };
  if (!reduce) document.querySelectorAll(".ow-btn, .ow-pill, .ow-share").forEach(hoverOf);

  // ── Text appear: original motionHeadingFrom/To·motionTextFrom/To·motionDefaultExit ──
  const HEAD_FROM = { yPercent: 100, opacity: 0, rotation: 5, transformOrigin: "0% 100%" };
  const HEAD_TO = { yPercent: 0, opacity: 1, rotation: 0, stagger: 0.025, duration: 0.75, ease: "back" };
  const TEXT_FROM = { yPercent: 50, opacity: 0 };
  const TEXT_TO = { yPercent: 0, opacity: 1, stagger: 0.1, duration: 0.75, ease: "back" };
  const EXIT = { opacity: 0, duration: 1, ease: "back", overwrite: true };
  OW.motion = { HEAD_FROM, HEAD_TO, TEXT_FROM, TEXT_TO, EXIT };
  OW.splitWords = (el) => SplitText.create(el, { type: "words", mask: "words", wordsClass: "split-word", aria: "auto" });
  OW.splitLines = (el) => SplitText.create(el, { type: "lines", autoSplit: true, linesClass: "split-line", aria: "auto" });

  // Set up one pair (title word + body line) on entering and clear it on leaving — as in the original, it sets up again on re-entry
  OW.revealPair = (scope, { heading, text, start = "top 75%", end = "bottom 25%", trigger } = {}) => {
    const h = heading && (typeof heading === "string" ? scope.querySelector(heading) : heading);
    const t = text && (typeof text === "string" ? scope.querySelectorAll(text) : text);
    const words = h ? OW.splitWords(h).words : [];
    let lines = [];
    if (t) [...(t.length !== undefined ? t : [t])].forEach((p) => { lines = lines.concat(OW.splitLines(p).lines); });
    const all = [...words, ...lines];
    if (!all.length) return null;
    if (reduce) return null;
    gsap.set(all, { opacity: 0 });
    const enter = () => {
      gsap.killTweensOf(all);
      if (words.length) { gsap.set(words, HEAD_FROM); gsap.to(words, HEAD_TO); }
      if (lines.length) { gsap.set(lines, TEXT_FROM); gsap.to(lines, { ...TEXT_TO, delay: words.length ? 0.25 : 0 }); }
    };
    const exit = () => { gsap.killTweensOf(all); gsap.to(all, EXIT); };
    return ScrollTrigger.create({ trigger: trigger || scope, start, end, onEnter: enter, onEnterBack: enter, onLeave: exit, onLeaveBack: exit });
  };
  const bootReveals = () => {
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      OW.revealPair(el, { heading: el.querySelector("[data-reveal-heading]"), text: el.querySelectorAll("[data-reveal-text]") });
    });
  };

  // ── Logo loader: rests .5s, the text logo disappears and the W stands up, three underlines shrink into three squares and the logo moves to the very top (.6 power1.out) → the loading bar disappears at .6 power2.out ──
  const logo = document.querySelector(".ow-logo");
  const LOGO_TOP = () => (mobile() ? 14 : 22);
  const SQ = 38, J = (270 - SQ) / 2;
  const finishLoad = () => {
    OW.ready = true;
    root.classList.remove("is-loading");
    lenis?.start();
    document.dispatchEvent(new CustomEvent("ow:ready"));
  };
  if (logo) {
    const bars = [...logo.querySelectorAll("[class^='lg-bar']")];
    const squares = (i) => ({ x: J + i * 15.2, y: 29.74, width: 7.6, height: 7.63 });
    const animate = logo.dataset.animate !== "false";
    if (!animate || reduce) {
      gsap.set(logo.querySelectorAll(".lg-letters"), { opacity: 0 });
      gsap.set(logo.querySelector(".lg-w"), { opacity: 1 });
      bars.forEach((b, i) => gsap.set(b, { attr: squares(i) }));
      gsap.set(logo, { top: LOGO_TOP(), yPercent: 0, translate: "-50% 0" });
      gsap.set(".ow-loader", { autoAlpha: 0 });
      requestAnimationFrame(finishLoad);
    } else {
      root.classList.add("is-loading");
      lenis?.stop();
      const tl = gsap.timeline({ paused: true, delay: 0.5, onComplete: finishLoad });
      tl.to(logo.querySelectorAll(".lg-letters"), { opacity: 0, duration: 0.6 / 3, ease: "power1.out" })
        .to(logo.querySelector(".lg-w"), { opacity: 1, duration: 0.6 / 3, ease: "power1.out" }, "<");
      bars.forEach((b, i) => tl.to(b, { attr: squares(i), duration: 0.6, ease: "power1.out" }, "<"));
      gsap.set(logo, { willChange: "top", translate: "-50% 0", yPercent: -50 });
      tl.to(logo, { top: mobile() ? "20vh" : LOGO_TOP(), yPercent: 0, duration: 0.6, ease: "power1.out", force3D: true }, "<");
      tl.to(".ow-loader", { autoAlpha: 0, duration: 0.6, ease: "power2.out" });
      const go = () => requestAnimationFrame(() => tl.play());
      document.fonts?.ready ? document.fonts.ready.then(go) : go();
    }
  } else requestAnimationFrame(finishLoad);

  // The logo hides upward (-75) on scroll down and returns on scroll up — unchanged while the hero is pinned
  let lastY = 0, status = "initial";
  OW.heroPinned = false;
  addEventListener("scroll", () => {
    const y = scrollY;
    const next = y <= 0 ? "initial" : y > lastY ? "down" : y < lastY ? "up" : status;
    lastY = Math.max(0, y);
    if (next === status || !OW.ready || !logo) { status = next; return; }
    status = next;
    if (OW.heroPinned) return;
    gsap.to(logo, { top: status === "down" ? -75 : LOGO_TOP(), duration: 0.6, ease: "power1.out", force3D: true, overwrite: "auto" });
  }, { passive: true });

  // ── Menu Card ──
  const menuBtn = document.querySelector(".ow-menu-btn");
  const menu = document.querySelector(".ow-menu");
  const mask = document.querySelector(".ow-mask");
  const menuLabel = menuBtn?.querySelector(".ow-menu-btn__label");
  if (menuLabel) {
    // At the top the MENU text is pushed out to the right, then comes in with .5 power3.out when scrolling down
    const setLabel = (on) => gsap.to(menuLabel, { xPercent: on ? 0 : 100, autoAlpha: on ? 1 : 0, duration: 0.5, ease: "power3.out", overwrite: "auto" });
    gsap.set(menuLabel, { xPercent: 100, autoAlpha: 0 });
    ScrollTrigger.create({ start: 40, end: "max", onToggle: (s) => setLabel(s.isActive) });
  }
  let menuOpen = false;
  const setMenu = (open) => {
    menuOpen = open;
    menuBtn.setAttribute("aria-expanded", String(open));
    menu.inert = !open;
    mask.classList.toggle("is-on", open);
    gsap.killTweensOf(menu);
    gsap.to(menu, { autoAlpha: open ? 1 : 0, scale: open ? 1 : 0.94, y: open ? 0 : 16, duration: open ? 0.45 : 0.25, ease: "back" });
    // As in the original, the MENU text slides in to the left of the card head (.5 power3.out) and the icon rotates 135° after .42 to become × (.25)
    if (menuLabel) {
      const shift = open ? menu.getBoundingClientRect().left + 28 - (menuLabel.getBoundingClientRect().left - (gsap.getProperty(menuLabel, "x") || 0)) : 0;
      gsap.to(menuLabel, { x: shift, xPercent: 0, autoAlpha: open || scrollY > 40 ? 1 : 0, duration: 0.5, ease: "power3.out", overwrite: "auto" });
    }
    // Original (measured): the circle backdrop clears over .22 after a .14 delay, the two lines scale to 1.33x horizontally over .25 after .12, then after .42 they rotate to 135° and 45° to form an × (.25 back) — in the copy the first frame appears ~87ms late after the press, so the delays were moved earlier by that amount
    const bars = [...menuBtn.querySelectorAll(".ow-menu-btn__ico i")], ring = menuBtn.querySelector(".ow-menu-btn__ring");
    gsap.killTweensOf([...bars, ring]);
    gsap.to(ring, { backgroundColor: open ? "transparent" : OW.color("--kf-bg"), duration: 0.22, delay: open ? 0.055 : 0, ease: "power1.out" });
    gsap.to(bars, { scaleX: open ? 1.33 : 1, duration: 0.25, delay: open ? 0.035 : 0, ease: "back" });
    gsap.to(bars[0], { rotation: open ? 135 : 0, duration: 0.25, delay: open ? 0.335 : 0, ease: "back" });
    gsap.to(bars[1], { rotation: open ? 45 : 0, duration: 0.25, delay: open ? 0.335 : 0, ease: "back" });
    open ? lenis?.stop() : lenis?.start();
    if (open) menu.querySelector("a")?.focus({ preventScroll: true });
  };
  if (menuBtn && menu) {
    gsap.set(menu, { autoAlpha: 0, scale: 0.94, y: 16 });
    menu.inert = true;
    menuBtn.addEventListener("click", () => setMenu(!menuOpen));
    mask?.addEventListener("click", () => setMenu(false));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && menuOpen) { setMenu(false); menuBtn.focus(); } });
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
    hoverSlide(menu.querySelector(".ow-menu__links"), menu.querySelector(".ow-menu__bg"), "li");
  }
  // A panel slides behind the hovered row: show .35/.2 power3.out, position .45 power3.out
  function hoverSlide(list, bg, sel) {
    if (!list || !bg) return;
    let shown = false;
    list.querySelectorAll(sel).forEach((row) => row.addEventListener("mouseenter", () => {
      bg.style.setProperty("--row-h", row.offsetHeight + "px");
      gsap.to(bg, { height: row.offsetHeight, duration: shown ? 0.45 : 0, ease: "power3.out", overwrite: false });
      gsap.to(bg, { y: row.offsetTop, duration: shown ? 0.45 : 0, ease: "power3.out", overwrite: false });
      if (!shown) { shown = true; gsap.to(bg, { autoAlpha: 1, scaleY: 1, duration: 0.35, ease: "power3.out", overwrite: false }); }
    }));
    list.addEventListener("mouseleave", () => { shown = false; gsap.to(bg, { autoAlpha: 0, scaleY: 0.5, duration: 0.2, ease: "power3.out", overwrite: false }); });
    gsap.set(bg, { scaleY: 0.5 });
  }
  OW.hoverSlide = hoverSlide;

  // ── Chapter: count [data-chapter] to build the page-count pill and chapter ticks ──
  const chapters = [...document.querySelectorAll("[data-chapter]")];
  const total = String(chapters.length).padStart(2, "0");
  const cta = document.querySelector(".ow-cta");
  const rail = document.querySelector(".ow-rail");
  let current = 1;
  const idxEl = cta?.querySelector("[data-index]");
  cta && (cta.querySelector("[data-total]").textContent = total);
  const setIndex = (n) => {
    if (n === current || !idxEl) { current = n; return; }
    const dir = n > current ? 1 : -1;
    current = n;
    gsap.killTweensOf(idxEl);
    gsap.timeline()
      .to(idxEl, { yPercent: -100 * dir, autoAlpha: 0, duration: 0.18, ease: "power2.in" })
      .set(idxEl, { yPercent: 100 * dir })
      .call(() => { idxEl.textContent = String(n).padStart(2, "0"); })
      .to(idxEl, { yPercent: 0, autoAlpha: 1, duration: 0.22, ease: "back" });
    rail?.querySelectorAll(".ow-rail__dot").forEach((d, i) => d.classList.toggle("is-on", i === n - 1));
  };
  const dots = [];
  if (rail) {
    const track = rail.querySelector(".ow-rail__track");
    const pop = rail.querySelector(".ow-rail__pop ol");
    chapters.forEach((ch, i) => {
      const d = document.createElement("span");
      d.className = "ow-rail__dot" + (i === 0 ? " is-on" : "");
      d.innerHTML = "<b></b>";
      track.append(d);
      dots.push(d.firstChild);
      const li = document.createElement("li");
      li.innerHTML = `<a href="#${ch.id}"><span>${String(i + 1).padStart(2, "0")}</span>${ch.dataset.chapter}</a>`;
      pop?.append(li);
    });
  }
  chapters.forEach((ch, i) => {
    const next = chapters[i + 1];
    ScrollTrigger.create({
      trigger: ch, start: "top center", endTrigger: next || ch, end: next ? "top center" : "bottom bottom",
      onToggle: (s) => s.isActive && setIndex(i + 1),
      onUpdate: (s) => dots[i] && gsap.set(dots[i], { y: `${gsap.utils.interpolate(-82.14285714285714, 0, s.progress)}%` }),
    });
  });
  // Past the hero, the pill and ticks come in (pill yPercent 0 .5 power3.out, ticks xPercent 0 .5 power3.out)
  const firstAfterHero = document.querySelector("[data-ui-after]");
  if (rail) gsap.set(rail, { x: 0, xPercent: 100 });
  if (cta) gsap.set(cta, { yPercent: 100, transform: "none" });
  const showCta = () => cta && gsap.to(cta, { yPercent: 0, y: 0, duration: 0.5, ease: "power3.out", overwrite: "auto" });
  OW.ready ? showCta() : document.addEventListener("ow:ready", showCta, { once: true });
  ScrollTrigger.create({ trigger: firstAfterHero || document.body, start: firstAfterHero ? "top 80%" : 0, end: "max", onToggle: (s) => rail && gsap.to(rail, { x: 0, xPercent: s.isActive ? 0 : 100, autoAlpha: s.isActive ? 1 : 0, duration: 0.5, ease: "power3.out", overwrite: "auto" }) });
  // Pill hover: the background grows 4px wider (.5 back)
  const ctaBg = cta?.querySelector(".ow-cta__bg");
  cta?.querySelector(".ow-btn")?.addEventListener("mouseenter", () => gsap.to(ctaBg, { width: "calc(100% + 4px)", duration: 0.5, ease: "back", overwrite: true }));
  cta?.querySelector(".ow-btn")?.addEventListener("mouseleave", () => gsap.to(ctaBg, { width: "100%", duration: 0.5, ease: "back", overwrite: true }));

  // Ticks: on panel hover the base grows 4px (.5 back) and the list button lifts 4px and spins once (.5 back), on press the section list panel goes .94→1 (.45 back)
  if (rail) {
    const bg = rail.querySelector(".ow-rail__trackbg");
    const listBtn = rail.querySelector(".ow-rail__list");
    const pop = rail.querySelector(".ow-rail__pop");
    rail.addEventListener("mouseenter", () => { gsap.to(bg, { height: "calc(100% + 4px)", duration: 0.5, ease: "back", overwrite: true }); gsap.to(listBtn, { y: -4, rotation: 360, duration: 0.5, ease: "back", overwrite: true }); });
    rail.addEventListener("mouseleave", () => { gsap.to(bg, { height: "100%", duration: 0.5, ease: "back", overwrite: true }); gsap.to(listBtn, { y: 0, rotation: 0, duration: 0.5, ease: "back", overwrite: true }); });
    let open = false;
    const setPop = (on) => { open = on; listBtn.setAttribute("aria-expanded", String(on)); gsap.to(pop, { autoAlpha: on ? 1 : 0, scale: on ? 1 : 0.94, y: on ? 0 : 16, duration: on ? 0.45 : 0.25, ease: "back", pointerEvents: on ? "auto" : "none" }); };
    gsap.set(pop, { autoAlpha: 0, scale: 0.94, y: 16 });
    listBtn.addEventListener("click", () => setPop(!open));
    pop.addEventListener("click", (e) => { const a = e.target.closest("a"); if (!a) return; e.preventDefault(); OW.scrollTo(a.getAttribute("href")); setPop(false); });
    hoverSlide(pop.querySelector("ol"), pop.querySelector(".ow-rail__hover"), "li");
  }

  // ── Share modal ──
  const modal = document.querySelector(".ow-modal");
  if (modal) {
    const card = modal.querySelector(".ow-modal__card");
    const scrim = modal.querySelector(".ow-modal__scrim");
    // Original share modal: backdrop .35 power2.out, card 1.1 → 1 · transparent → .6 power3.out / close card .9 · .45 power3.in, backdrop .3 power2.in
    const setModal = (on) => {
      gsap.killTweensOf([card, scrim]);
      if (on) { modal.classList.add("is-open"); lenis?.stop(); gsap.set(card, { scale: 1.1, opacity: 0 }); gsap.set(scrim, { autoAlpha: 0 }); gsap.to(scrim, { autoAlpha: 1, duration: 0.35, ease: "power2.out" }); gsap.to(card, { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" }); }
      else { gsap.to(card, { scale: 0.9, opacity: 0, duration: 0.45, ease: "power3.in" }); gsap.to(scrim, { autoAlpha: 0, duration: 0.3, ease: "power2.in", delay: 0.15, onComplete: () => { modal.classList.remove("is-open"); lenis?.start(); } }); }
    };
    const closeBtn = modal.querySelector(".ow-modal__close");
    closeBtn.addEventListener("mouseenter", () => gsap.to(closeBtn, { rotation: 180, duration: 0.5, ease: "back" }));
    closeBtn.addEventListener("mouseleave", () => gsap.to(closeBtn, { rotation: 0, duration: 0.5, ease: "back" }));
    document.addEventListener("click", (e) => { if (e.target.closest(".ow-share")) setModal(true); });
    modal.querySelector(".ow-modal__scrim").addEventListener("click", () => setModal(false));
    modal.querySelector(".ow-modal__close").addEventListener("click", () => setModal(false));
  }

  // ── Black drawer (pill inside text) ──
  const drawer = document.querySelector(".ow-drawer");
  const dScrim = document.querySelector(".ow-drawer-scrim");
  if (drawer && dScrim) {
    let opener = null;
    const setDrawer = (on) => {
      drawer.inert = !on;
      gsap.to(dScrim, { autoAlpha: on ? 1 : 0, duration: on ? 0.5 : 0.35, ease: "power2.out" });
      gsap.to(drawer, { xPercent: on ? 0 : 100, autoAlpha: 1, duration: on ? 0.6 : 0.45, ease: on ? "power3.out" : "power3.in", onComplete: () => !on && gsap.set(drawer, { autoAlpha: 0 }) });
      opener?.setAttribute("aria-expanded", String(on));
      on ? lenis?.stop() : lenis?.start();
      if (on) drawer.querySelector(".ow-drawer__close").focus({ preventScroll: true });
    };
    gsap.set(drawer, { xPercent: 100, transform: "none", autoAlpha: 0 });
    drawer.inert = true;
    document.querySelectorAll("[data-drawer]").forEach((b) => b.addEventListener("click", () => { opener = b; setDrawer(true); }));
    dScrim.addEventListener("click", () => setDrawer(false));
    drawer.querySelector(".ow-drawer__close").addEventListener("click", () => { setDrawer(false); opener?.focus(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && !drawer.inert) setDrawer(false); });
  }

  // ── Background color (original background-theme block): when a section passes the screen center, it switches among paper, yellowish paper and black over .6s ──
  const THEME = { white: "var(--kf-bg)", yellow: "var(--kf-surface)", black: "var(--kf-contrast-bg)" };
  OW.setTheme = (name) => root.style.setProperty("--theme-bg", THEME[name] || THEME.white);
  document.querySelectorAll("[data-bg]").forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: "top center", end: "bottom center", onToggle: (s) => s.isActive && OW.setTheme(el.dataset.bg), onLeaveBack: () => el.dataset.bgBack && OW.setTheme(el.dataset.bgBack) });
  });
  // Header text color (original header-color-trigger): while the dark section covers the top, the logo and MENU turn light
  document.querySelectorAll("[data-header='light']").forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: "top 40px", end: "bottom 40px", onToggle: (s) => root.classList.toggle("is-light-header", s.isActive) });
  });

  // ── Film grain: tile a 128px noise plate and refresh it every 120ms ──
  const grain = document.querySelector(".ow-grain canvas");
  if (grain) {
    const ctx = grain.getContext("2d");
    const tile = document.createElement("canvas");
    tile.width = tile.height = 128;
    const tctx = tile.getContext("2d");
    const noise = () => { const img = tctx.createImageData(128, 128), d = img.data; for (let i = 0; i < d.length; i += 4) { const r = Math.floor(256 * Math.random()); d[i] = d[i + 1] = d[i + 2] = r; d[i + 3] = 255; } tctx.putImageData(img, 0, 0); };
    const paint = () => { const p = ctx.createPattern(tile, "repeat"); if (p) { ctx.fillStyle = p; ctx.fillRect(0, 0, grain.width, grain.height); } };
    const size = () => { grain.width = innerWidth; grain.height = innerHeight; paint(); };
    noise(); size();
    addEventListener("resize", size);
    requestAnimationFrame(() => grain.parentElement.classList.add("is-on"));
    if (!reduce) setInterval(() => { noise(); paint(); }, 120);
  }

  // ── Lottie chart: like the original, dotlottie-web draws the 600×600 25fps version and ties the frames to scroll.
  //    The art (arcs · stars · boxes · bars · dots) is ours — built in JS with the same panel size and frame count, and a static SVG is drawn from the same shapes ──
  const DL = window.DotLottieLib?.DotLottie;
  const lottieOK = /^https?:$/.test(location.protocol) && DL && !reduce;
  if (lottieOK) DL.setWasmUrl(new URL("../_vendor/dotlottie-web@0.71.0/dotlottie-player.wasm", location.href).href);
  const bez = (x1, y1, x2, y2) => (t) => { let lo = 0, hi = 1, u = t; for (let i = 0; i < 24; i++) { u = (lo + hi) / 2; const x = 3 * (1 - u) ** 2 * u * x1 + 3 * (1 - u) * u * u * x2 + u ** 3; x < t ? (lo = u) : (hi = u); } return 3 * (1 - u) ** 2 * u * y1 + 3 * (1 - u) * u * u * y2 + u ** 3; };
  const inOut = bez(0.33, 0, 0.67, 1);
  const st = (v) => ({ a: 0, k: v });
  const K = (frames) => ({ a: 1, k: frames.map(([t, v], i) => (i < frames.length - 1 ? { t, s: [].concat(v), i: { x: [0.67], y: [1] }, o: { x: [0.33], y: [0] } } : { t, s: [].concat(v) })) });
  const KL = (frames) => ({ a: 1, k: frames.map(([t, v], i) => (i < frames.length - 1 ? { t, s: [].concat(v), i: { x: [1], y: [1] }, o: { x: [0], y: [0] } } : { t, s: [].concat(v) })) });
  const tr = (p = [0, 0], s = st([100, 100]), a = [0, 0]) => ({ ty: "tr", p: st(p), a: st(a), s, r: st(0), o: st(100), sk: st(0), sa: st(0) });
  const strokeOf = (c, w, dash, op = 100) => ({ ty: "st", c: st(c), o: st(op), w: st(w), lc: 2, lj: 2, ml: 4, ...(dash ? { d: [{ n: "d", nm: "dash", v: st(dash[0]) }, { n: "g", nm: "gap", v: st(dash[1]) }, { n: "o", nm: "offset", v: st(0) }] } : {}) });
  const fillOf = (c) => ({ ty: "fl", c: st(c), o: st(100), r: 1 });
  const trim = (f0, f1) => ({ ty: "tm", s: st(0), e: K([[f0, 0], [f1, 100]]), o: st(0), m: 1 });
  // Shape list → Lottie layers
  const toLottie = (w, h, op, prims, col) => {
    const layers = prims.map((p, i) => {
      const c = col[p.c || "line"];
      let shapes = [];
      const paint = [p.fill ? fillOf(c) : null, p.w ? strokeOf(c, p.w, p.dash, p.op ?? 100) : null].filter(Boolean);
      const tm = p.trim ? [trim(...p.trim)] : [];
      let scale = st([100, 100]), pos = [0, 0], anchor = [0, 0];
      if (p.t === "circle") { shapes = [{ ty: "el", d: 1, s: st([p.r * 2, p.r * 2]), p: st([0, 0]) }]; pos = [p.cx, p.cy]; }
      if (p.t === "line") shapes = [{ ty: "sh", ks: st({ i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]], v: [[p.x1, p.y1], [p.x2, p.y2]], c: false }) }];
      if (p.t === "rect") { shapes = [{ ty: "rc", d: 1, s: st([p.w2, p.h2]), p: st([p.w2 / 2, p.h2 / 2]), r: st(p.r || 0) }]; pos = [p.x, p.y]; }
      if (p.grow) { const [f0, f1, ax] = p.grow; scale = K([[f0, ax === "x" ? [0, 100] : ax === "y" ? [100, 0] : [0, 0]], [f1, [100, 100]]]); if (ax === "y") { anchor = [0, p.h2]; pos = [p.x, p.y + p.h2]; } }
      let groupPos = st(pos);
      if (p.follow) { const { cx, cy, R, from, to, f0, f1 } = p.follow; const ks = []; for (let f = f0; f <= f1; f += 3) { const u = inOut(Math.min(1, (f - f0) / (f1 - f0))); const a = (-90 + 360 * (from + (to - from) * u)) * Math.PI / 180; ks.push([f, [cx + R * Math.cos(a), cy + R * Math.sin(a)]]); } groupPos = KL(ks); shapes = [{ ty: "el", d: 1, s: st([p.r * 2, p.r * 2]), p: st([0, 0]) }]; }
      const group = { ty: "gr", it: [...shapes, ...tm, ...paint, { ...tr(pos, scale, anchor), p: groupPos }] };
      const opk = p.appear ? K([[p.appear[0], 0], [p.appear[1], 100]]) : st(100);
      return { ddd: 0, ind: i + 1, ty: 4, sr: 1, ao: 0, ip: 0, op, st: 0, bm: 0, shapes: [group], ks: { o: opk, r: st(0), p: st([0, 0, 0]), a: st([0, 0, 0]), s: st([100, 100, 100]) } };
    }).reverse();
    return { v: "5.7.4", fr: 25, ip: 0, op, w, h, ddd: 0, assets: [], layers };
  };
  const toSvg = (w, h, prims) => {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("class", "ow-lottie__still");
    svg.setAttribute("aria-hidden", "true");
    prims.forEach((p) => {
      let el;
      const cls = p.c === "dim" ? "var(--site-lottie-dim)" : "var(--site-lottie-line)";
      if (p.t === "circle" || p.follow) {
        el = document.createElementNS(ns, "circle");
        let cx = p.cx, cy = p.cy;
        if (p.follow) { const { cx: X, cy: Y, R, to } = p.follow; const a = (-90 + 360 * to) * Math.PI / 180; cx = X + R * Math.cos(a); cy = Y + R * Math.sin(a); }
        el.setAttribute("cx", cx); el.setAttribute("cy", cy); el.setAttribute("r", p.r);
        if (p.trim && p.pct != null) { const L = 2 * Math.PI * p.r; el.setAttribute("stroke-dasharray", `${L * p.pct} ${L}`); el.setAttribute("transform", `rotate(-90 ${cx} ${cy})`); }
      } else if (p.t === "line") { el = document.createElementNS(ns, "line"); ["x1", "y1", "x2", "y2"].forEach((k) => el.setAttribute(k, p[k])); }
      else { el = document.createElementNS(ns, "rect"); el.setAttribute("x", p.x); el.setAttribute("y", p.y); el.setAttribute("width", p.w2); el.setAttribute("height", p.h2); el.setAttribute("rx", p.r || 0); }
      el.style.fill = p.fill ? cls : "none";
      if (p.w) { el.style.stroke = cls; el.style.strokeWidth = p.w; if (p.op != null) el.style.strokeOpacity = p.op / 100; if (p.dash && !(p.trim && p.pct != null)) el.style.strokeDasharray = p.dash.join(" "); }
      svg.append(el);
    });
    return svg;
  };
  // Chart types — original board sizes·lengths (600×600·76f, star 500×500·51f, box 800×400·76f)
  const CHARTS = {
    ring: (o) => { const pct = (+o.pct || 50) / 100, R = 225; return { w: 600, h: 600, op: 76, prims: [
      { t: "circle", cx: 300, cy: 300, r: R, w: 3, c: "dim", op: 35, appear: [0, 8] },
      { t: "circle", cx: 300, cy: 300, r: R, w: 3, trim: [4, 60], pct },
      { t: "circle", cx: 300, cy: 75, r: 5, fill: true, appear: [0, 4] },
      { t: "circle", r: 13, fill: true, follow: { cx: 300, cy: 300, R, from: 0, to: pct, f0: 4, f1: 60 } },
    ] }; },
    pie: (o) => { const pct = (+o.pct || 50) / 100, R = 225; return { w: 600, h: 600, op: 76, prims: [
      { t: "circle", cx: 300, cy: 300, r: R, w: 3, c: "dim", op: 50, appear: [0, 8] },
      { t: "circle", cx: 300, cy: 300, r: R / 2, w: R, c: "dim", op: 30, trim: [4, 60], pct },
      { t: "line", x1: 300, y1: 300, x2: 300, y2: 75, w: 3, trim: [0, 6] },
      { t: "circle", r: 9, fill: true, follow: { cx: 300, cy: 300, R, from: 0, to: pct, f0: 4, f1: 60 } },
    ] }; },
    star: (o) => { const n = +o.n || 10, k = +o.k || 7, R = 190, prims = []; for (let i = 0; i < n; i++) { const a = (-90 + (360 / n) * i) * Math.PI / 180, x = 250 + R * Math.cos(a), y = 250 + R * Math.sin(a), f0 = 4 + i * 2.6; prims.push({ t: "line", x1: 250, y1: 250, x2: x, y2: y, w: 2, c: i < k ? "line" : "dim", op: i < k ? 100 : 40, trim: [f0, f0 + 14] }); prims.push(i < k ? { t: "circle", cx: x, cy: y, r: 9, fill: true, appear: [f0 + 12, f0 + 16] } : { t: "circle", cx: x, cy: y, r: 9, w: 2, c: "dim", op: 60, appear: [f0 + 12, f0 + 16] }); } return { w: 500, h: 500, op: 51, prims }; },
    boxes: (o) => { const rows = (o.rows || "25,63;37,77").split(";").map((r) => r.split(",").map(Number)); const prims = [{ t: "line", x1: 400, y1: 40, x2: 400, y2: 360, w: 2, trim: [0, 14] }]; rows.forEach(([l, r], i) => { const y = 60 + i * 150, lw = 300 * l / 50, rw = 300 * r / 80; prims.push({ t: "rect", x: 380 - lw * 0.55, y, w2: lw * 0.55, h2: 120, w: 2.5, dash: [10, 7], grow: [10 + i * 10, 44 + i * 10, "x"] }); prims.push({ t: "rect", x: 420, y, w2: rw * 1.2, h2: 120, w: 2.5, grow: [14 + i * 10, 52 + i * 10, "x"] }); }); return { w: 800, h: 400, op: 76, prims }; },
    bars: (o) => { const v = (o.vals || "44,54,50,52").split(",").map(Number); const prims = [{ t: "line", x1: 60, y1: 520, x2: 540, y2: 520, w: 2, trim: [0, 12] }]; v.forEach((p, i) => { const h = 440 * p / 60, x = 80 + i * 120; prims.push({ t: "rect", x, y: 520 - h, w2: 80, h2: h, w: 2.5, dash: i ? [10, 7] : null, grow: [8 + i * 8, 48 + i * 8, "y"] }); }); return { w: 600, h: 600, op: 75, prims }; },
    dots: (o) => { const n = +o.n || 10, k = +o.k || 8, prims = []; for (let i = 0; i < n; i++) { const col = i % 5, row = Math.floor(i / 5), f0 = 4 + i * 4; prims.push({ t: "circle", cx: 140 + col * 80, cy: 255 + row * 90, r: 60, w: 2.5, dash: i < k ? null : [9, 7], op: i < k ? 100 : 70, appear: [f0, f0 + 10] }); } return { w: 600, h: 600, op: 76, prims }; },
    square: (o) => { const p = (+o.pct || 57) / 100; return { w: 600, h: 600, op: 76, prims: [
      { t: "rect", x: 120, y: 200, w2: 360 * p, h2: 200, w: 2.5, grow: [6, 46, "x"] },
      { t: "rect", x: 120 + 360 * p, y: 200, w2: 360 * (1 - p), h2: 200, w: 2.5, dash: [10, 7], grow: [40, 70, "x"] },
      { t: "circle", cx: 120 + 360 * p, cy: 300, r: 9, fill: true, appear: [44, 50] },
    ] }; },
    columns: (o) => { const v = (o.vals || "62,71").split(",").map(Number); const prims = []; v.forEach((p, i) => { const h = 420 * p / 80, x = 150 + i * 190; prims.push({ t: "rect", x, y: 520 - h, w2: 110, h2: h, w: 2.5, dash: i ? null : [10, 7], grow: [8 + i * 10, 52 + i * 10, "y"] }); }); return { w: 600, h: 600, op: 76, prims }; },
  };
  // Host: <div class="ow-lottie" data-lottie="ring" data-pct="67"> — A static SVG is laid underneath, once Lottie loads, is-live is set
  OW.chart = (host) => {
    const kind = host.dataset.lottie, make = CHARTS[kind];
    if (!make) return null;
    const def = make(host.dataset);
    host.style.aspectRatio = `${def.w} / ${def.h}`;
    host.prepend(toSvg(def.w, def.h, def.prims));
    const ctl = { host, def, player: null, frames: def.op, set: () => {} };
    if (!lottieOK) return ctl;
    const canvas = document.createElement("canvas");
    host.prepend(canvas);
    const col = { line: OW.rgb01("--site-lottie-line"), dim: OW.rgb01("--site-lottie-dim") };
    const player = new DL({ canvas, data: JSON.stringify(toLottie(def.w, def.h, def.op, def.prims, col)), autoplay: false, loop: false, renderConfig: { autoResize: true, devicePixelRatio: Math.min(2, devicePixelRatio) } });
    player.addEventListener("load", () => { host.classList.add("is-live"); player.setFrame(ctl.pending ?? 0); });
    ctl.player = player;
    ctl.set = (p) => { const f = Math.max(0, Math.min(def.op - 1, p * (def.op - 1))); ctl.pending = f; if (player.isLoaded) player.setFrame(f); };
    return ctl;
  };
  // Binds frames to scroll (original ScrollTrigger scrub:true → setFrame(progress × totalFrames)). The speech bubble pops out near the end
  OW.scrubChart = (host, st) => {
    const ctl = OW.chart(host);
    if (!ctl) return null;
    const badges = [...host.querySelectorAll(".ow-badge")];
    if (reduce) return ctl;
    gsap.set(badges, { scale: 0 });
    ScrollTrigger.create({ ...st, scrub: true, onUpdate: (s) => { ctl.set(s.progress); badges.forEach((b, i) => gsap.set(b, { scale: gsap.utils.clamp(0, 1, (s.progress - 0.62 - i * 0.04) / 0.12) })); } });
    return ctl;
  };

  // ── Photo stage (original cinematic-scroll): with p sections, panel height is (.5+1.5p+.5 [+1+.5 if there is a closing beat]) screens.
  //    the next section covers from below every 1.5 screens (section ↑ + inner ↓, ease none, scrub true), photos from yPercent 10/30 → -30/-10 with 1.2→1.3,
  //    Lottie and text only for the first 1 screen of each section (last section text 1 screen, others 1.5 screens). If there is a closing line, at the end a background-color panel grows to .76, the stage shrinks to .75 and that line stands.
  //    Without a measure, entering goes .5→1 (inner 2→1) and leaving goes 1→.5 (inner 1→2) — all scrub .5 ──
  OW.cinematic = (cine) => {
    if (!cine) return;
    const q = (s) => cine.querySelector(s), qa = (s) => [...cine.querySelectorAll(s)];
    const slides = qa("[data-slide]"), inners = qa("[data-slide-inner]"), imgs = qa("[data-slide-image]");
    const maskText = q("[data-slides-mask-text]");
    const P = slides.length, H = 0.5 + 1.5 * P + 0.5 + (maskText ? 1.5 : 0);
    cine.style.setProperty("--h", H);
    const vh = () => innerHeight, at = (k) => () => `top+=${vh() * k} top`;
    slides.forEach((s, i) => { const host = s.querySelector(".ow-lottie"); if (host && reduce) OW.chart(host)?.set(1); });
    if (reduce) return;
    gsap.set(slides, { yPercent: 100 }); gsap.set(slides[0], { yPercent: 0 });
    gsap.set(inners, { yPercent: -100 }); gsap.set(inners[0], { yPercent: 0 });
    if (P > 1) {
      const wipe = gsap.timeline({ scrollTrigger: { trigger: cine, start: at(0.5), end: at(0.5 + (P - 1) * 1.5), scrub: true, invalidateOnRefresh: true } });
      slides.forEach((s, t) => { if (!t) return; const k = (t - 1) * 1.5 + 0.5; wipe.to(s, { yPercent: 0, ease: "none", duration: 1 }, k).to(inners[t], { yPercent: 0, ease: "none", duration: 1 }, k); });
    }
    imgs.forEach((im) => { const i = slides.indexOf(im.closest("[data-slide]")); gsap.fromTo(im, { yPercent: i === 0 ? 10 : 30, scale: 1.2 }, { yPercent: i === P - 1 ? -10 : -30, scale: 1.3, ease: "none", scrollTrigger: { trigger: cine, start: at(0.5), end: at(0.5 + (P - 1) * 1.5 + 1), scrub: true, invalidateOnRefresh: true } }); });
    slides.forEach((s, i) => {
      s.querySelectorAll(".ow-lottie").forEach((host) => OW.scrubChart(host, { trigger: cine, start: at(1.5 * i), end: at(1 + 1.5 * i), invalidateOnRefresh: true }));
      OW.revealPair(s, { heading: s.querySelector("[data-slide-heading]"), text: s.querySelectorAll("[data-slide-text]"), trigger: cine, start: at(1.5 * i), end: at(1.5 * i + (i === P - 1 ? 1 : 1.5)) });
    });
    if (cine.dataset.header === "light") ScrollTrigger.create({ trigger: cine, start: "top 40px", end: at(0.5 + 1.5 * P), onToggle: (s) => root.classList.toggle("is-light-header", s.isActive) });
    const cont = q("[data-slides-container]"), contIn = q("[data-slides-container-inner]"), cMask = q("[data-slides-mask]");
    if (!maskText) {
      gsap.fromTo(cont, { scale: 0.5 }, { scale: 1, ease: "none", scrollTrigger: { trigger: cine, start: "top bottom", end: "top top", scrub: 0.5 } });
      gsap.fromTo(contIn, { scale: 2 }, { scale: 1, ease: "none", scrollTrigger: { trigger: cine, start: "top bottom", end: "top top", scrub: 0.5 } });
      gsap.fromTo(cont, { scale: 1 }, { scale: 0.5, ease: "none", immediateRender: false, scrollTrigger: { trigger: cine, start: "bottom bottom", end: "bottom top", scrub: 0.5 } });
      gsap.fromTo(contIn, { scale: 1 }, { scale: 2, ease: "none", immediateRender: false, scrollTrigger: { trigger: cine, start: "bottom bottom", end: "bottom top", scrub: 0.5 } });
      return;
    }
    const mS = 0.5 + 1.5 * P;
    const mst = () => ({ trigger: cine, start: at(mS), end: at(mS + 0.5), scrub: 0.5, invalidateOnRefresh: true });
    gsap.fromTo(cMask, { scale: 0 }, { scale: 0.76, ease: "none", immediateRender: false, scrollTrigger: mst() });
    gsap.fromTo(cont, { scale: 1 }, { scale: 0.75, ease: "none", immediateRender: false, scrollTrigger: mst() });
    gsap.fromTo(contIn, { scale: 1 }, { scale: 1 / 0.75, ease: "none", immediateRender: false, scrollTrigger: mst() });
    const mWords = OW.splitWords(maskText).words;
    gsap.set(mWords, HEAD_FROM);
    const mIn = () => { gsap.killTweensOf(mWords); gsap.set(mWords, HEAD_FROM); gsap.to(mWords, HEAD_TO); };
    const mOut = () => { gsap.killTweensOf(mWords); gsap.to(mWords, EXIT); };
    ScrollTrigger.create({ trigger: cine, start: at(mS + 0.25), end: "bottom top", invalidateOnRefresh: true, onEnter: mIn, onEnterBack: mIn, onLeave: mOut, onLeaveBack: mOut });
  };

  OW.boot = (fn) => {
    const run = () => { fn?.(); bootReveals(); ScrollTrigger.sort(); ScrollTrigger.refresh(); };
    // Font files only load when text is actually used, so fonts.ready alone is too early — load the skin’s heading and body fonts directly, then measure
    const fam = (v) => getComputedStyle(root).getPropertyValue(v).split(",")[0].trim();
    const want = [fam("--kf-font-display"), fam("--kf-font-serif"), fam("--kf-font-sans")].filter(Boolean);
    const loads = document.fonts ? want.flatMap((f) => [document.fonts.load(`400 100px ${f}`), document.fonts.load(`italic 400 100px ${f}`)]) : [];
    Promise.race([Promise.allSettled(loads), new Promise((r) => setTimeout(r, 2500))]).then(run);
    document.fonts?.addEventListener("loadingdone", () => { document.dispatchEvent(new CustomEvent("ow:fonts")); ScrollTrigger.refresh(); });
  };
})();
