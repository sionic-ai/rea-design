// Motion shared by all pages. Original curves: custom1 .19,1,.22,1 · transition intro .9,0,.1,1 · slide .2,0,0,1
// Page scenes are added with esrSite.scene(fn) — on the first page opened first, after the loader has fully cleared (at = Loader length), otherwise it runs after the transition cover clears.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EASE = CustomEase.create("esr-custom1", ".19,1,.22,1");
  const INTRO = CustomEase.create("esr-intro", ".9,0,.1,1");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const lenis = reduce ? null : new Lenis({ lerp: 0.1 });
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const page = $("#page-content");

  // Header text color: the background color over the dark Hero or when the menu is open (.3s expo.out)
  const dark = $("[data-dark-hero]");
  const cs = getComputedStyle(document.documentElement);
  const tone = (name) => cs.getPropertyValue(name).trim();
  const setFg = (light) => gsap.to(document.documentElement, { "--foreground": tone(light ? "--kf-bg" : "--site-fg"), duration: reduce ? 0 : 0.3, ease: "expo.out" });
  if (dark) setFg(true);

  // The subtitle letters roll up one line into another phrase (.6s expo.out) — the second phrase shows when the menu is open
  const sub = $(".e-head__sub .e-roll__track");
  const rollSub = (alt) => {
    if (!sub) return;
    const [a, b] = sub.children;
    const tl = gsap.timeline({ defaults: { ease: "expo.out", duration: reduce ? 0 : 0.6 } });
    if (alt) tl.to(a, { y: "-100%" }, 0).fromTo(b, { y: "100%" }, { y: "0%" }, 0);
    else tl.fromTo(a, { y: "100%" }, { y: "0%" }, 0).to(b, { y: "-100%" }, 0);
  };

  // The square dot beside the vertical menu slides to the hovered row (.6s), and returns to the current page row when leaving the menu
  $$(".e-nav").forEach((nav) => {
    const dot = $(".e-nav__dot", nav);
    const items = $$(".menu-item", nav);
    const here = items.findIndex((s) => s.parentElement.hasAttribute("aria-current"));
    // The dot sits 5.75px below the line (original) and moves via a css transition (.6s custom1) — it starts moving from the very frame of hover, so even if a busy frame intervenes the first step is not skipped
    let y = 0;
    const go = (i, now) => {
      const it = items[i];
      if (it) y = it.getBoundingClientRect().top - nav.getBoundingClientRect().top + 5.75;
      dot.style.transition = now || reduce ? "none" : "";
      dot.style.transform = `translateY(${y}px) scale(${it ? 1 : 0})`;
      if (now) { void dot.offsetWidth; dot.style.transition = ""; }
    };
    go(here, true);
    document.fonts.ready.then(() => !nav.matches(":hover") && go(here, true));
    // Move only on entering a link — doesn’t react to a mouse passing through the empty space beside the link (original)
    items.forEach((s, i) => s.parentElement.addEventListener("mouseenter", () => go(i)));
    nav.addEventListener("mouseleave", () => go(here));
  });

  // Menu panel: on open it rises from below (105%) in 1s ”custom1”, body goes -30vh, shadow .8 (.5s). On close it goes up (-105%) 1.3s expo.out, body returns from 30vh to its place
  const menu = $(".e-menu");
  // Let gsap hold the panel’s transform from the start so the first open doesn’t lose a frame reading the css value
  if (menu) gsap.set(menu, { y: "-105%" });
  const shade = $(".e-shade");
  const burger = $(".e-burger");
  let open = false;
  const setMenu = (on) => {
    if (!menu || on === open) return;
    open = on;
    burger.setAttribute("aria-expanded", String(on));
    gsap.killTweensOf(burger, "color");
    if (on) gsap.to(burger, { color: tone("--kf-ink"), duration: reduce ? 0 : 0.3, delay: reduce ? 0 : 0.4, ease: "expo.out" });
    else gsap.set(burger, { clearProps: "color" });
    menu.setAttribute("aria-hidden", String(!on));
    const tl = gsap.timeline({ defaults: { duration: reduce ? 0 : 1, ease: EASE } });
    if (on) {
      tl.fromTo(menu, { y: "105%" }, { y: "0%" }, 0).to(page, { y: "-30vh" }, 0);
      // Scroll lock on the frame after the panel starts moving — so style recalculation on a large document does not delay the first frame
      requestAnimationFrame(() => { if (open) { document.body.classList.add("lock-scroll"); lenis?.stop(); } });
      if (!document.body.classList.contains("e-home")) gsap.to(shade, { opacity: 0.8, duration: reduce ? 0 : 0.5, ease: "power2.inOut" });
      gsap.fromTo($$(".e-menu__links a", menu), { y: 80 }, { y: 0, duration: reduce ? 0 : 1, ease: "expo.out", stagger: 0.15, delay: 0.1 });
      // Button text color is switched to ink by css once the panel has nearly covered it (measured from the original), and the menu’s first photo turns on at .15s with no transition
      gsap.delayedCall(reduce ? 0 : 0.15, () => open && $(".e-menu__media .e-ph", menu)?.classList.add("is-on"));
      rollSub(true);
      $(".e-menu__links a", menu)?.focus({ preventScroll: true });
    } else {
      tl.to(menu, { y: "-105%", duration: reduce ? 0 : 1.3, ease: "expo.out" }, 0).fromTo(page, { y: "30vh" }, { y: 0, clearProps: "transform" }, 0);
      gsap.to(shade, { opacity: 0, duration: reduce ? 0 : 0.7, ease: "power2.inOut" });
      tl.add(() => { document.body.classList.remove("lock-scroll"); lenis?.start(); });
      setFg(dark && scrollY < dark.offsetHeight - 60);
      rollSub(false);
      $$(".e-menu__media .e-ph", menu).forEach((p) => p.classList.remove("is-on"));
    }
  };
  burger?.addEventListener("click", () => setMenu(!open));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && open) { setMenu(false); burger.focus(); } });
  // Hovering a menu link swaps the right photo to that link’s
  $$(".e-menu__links a", menu || document).forEach((a, i) => a.addEventListener("mouseenter", () => {
    $$(".e-menu__media .e-ph", menu).forEach((p, k) => p.classList.toggle("is-on", k === i + 1));
  }));
  menu && $(".e-menu__links", menu).addEventListener("mouseleave", () => $$(".e-menu__media .e-ph", menu).forEach((p, k) => p.classList.toggle("is-on", open && k === 0)));

  // After the dark Hero, turn the header text ink-black
  if (dark) ScrollTrigger.create({ trigger: dark, start: "bottom top+=60", onEnter: () => !open && setFg(false), onLeaveBack: () => !open && setFg(true) });

  // Page transition: when the curtain covers with .3s sine.out it navigates, and the new page rises from 101vh below in 1.2s ”intro”
  const curtain = $(".e-curtain");
  $$("a[href$='.html']").forEach((a) => a.addEventListener("click", (e) => {
    const url = a.getAttribute("href");
    if (e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    e.preventDefault();
    sessionStorage.setItem("esr-nav", "1");
    gsap.set(curtain, { visibility: "visible" });
    gsap.fromTo(curtain, { autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? 0 : 0.3, ease: "sine.out", onComplete: () => { location.href = url; } });
  }));
  const fromNav = sessionStorage.getItem("esr-nav") === "1";
  sessionStorage.removeItem("esr-nav");
  // The incoming page keeps its first image off-screen — if it is lowered after waiting for fonts, the content flashes once and vanishes (the original renders with #page-content parked 100vh below)
  // The first-page loader runs only on first entry (the original attaches the loader once to the app shell)
  // The transition curtain stays covering the header row·buttons on the new page too, and only the new body rises over it (the original is one app, so the curtain stays put)
  if (fromNav && !reduce) {
    $(".e-intro")?.remove();
    gsap.set(page, { y: "101vh", opacity: 0, position: "relative", zIndex: 75 });
    gsap.set(curtain, { autoAlpha: 1 });
  }

  // Cursor label: the panel (#cursor) follows the mouse by 10% per frame (lerp .1), and over [data-cursor] the label turns on, wiping open from the left (.3s expo.out)
  const tag = $(".e-cursor");
  if (tag && matchMedia("(hover: hover)").matches) {
    const label = $("span", tag);
    const cur = { x: null, y: null }, last = { x: null, y: null };
    let on = false;
    addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      cur.x = e.clientX; cur.y = e.clientY;
      const t = e.target.closest?.("[data-cursor]");
      if (t && !on) { label.textContent = t.dataset.cursor; on = true; gsap.to(label, { clipPath: "inset(0 0% 0 0)", ease: "expo.out", duration: reduce ? 0 : 0.3 }); }
      else if (!t && on) { on = false; gsap.to(label, { clipPath: "inset(0 100% 0 0)", ease: "expo.out", duration: reduce ? 0 : 0.3 }); }
    }, { passive: true });
    gsap.ticker.add(() => {
      if (cur.x == null) return;
      if (last.x == null || reduce) { last.x = cur.x; last.y = cur.y; }
      else { last.x += (cur.x - last.x) * 0.1; last.y += (cur.y - last.y) * 0.1; }
      tag.style.transform = `translate(${last.x}px, ${last.y}px)`;
    });
  }

  // Footer: when the cell enters the screen, the newsletter line turns on after .3s (.6s expo.out) and the underline is drawn from the left (.8s expo.out)
  const news = $(".e-foot__news");
  if (news) {
    const tl = gsap.timeline({ paused: true })
      .to($("label", news), { opacity: 1, duration: 0.6, ease: "expo.out" }, 0.3)
      .fromTo($(".e-foot__line", news), { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "expo.out", transformOrigin: "left" }, 0.4);
    gsap.set($("label", news), { opacity: reduce ? 1 : 0 });
    if (reduce) tl.progress(1);
    else ScrollTrigger.create({ trigger: ".e-foot", start: "top 60%", once: true, onEnter: () => tl.play() });
  }

  // Accordion: height 0 ↔ auto .3s power3.inOut, re-measures ScrollTrigger when done
  $$(".s-acc__btn").forEach((b) => b.addEventListener("click", () => {
    const on = b.getAttribute("aria-expanded") !== "true";
    b.setAttribute("aria-expanded", String(on));
    gsap.to(b.nextElementSibling, { height: on ? "auto" : 0, duration: reduce ? 0 : 0.3, ease: "power3.inOut", onComplete: () => ScrollTrigger.refresh() });
  }));

  // Hero text (on: state) comes in sequence after the curtain lifts — title after .5s, each next text .2s later
  const reveal = (at) => $$('[data-fx-char-fade-in*="on: state"]').forEach((el, i) => gsap.delayedCall(at + 0.5 + i * 0.2, () => el.dispatchEvent(new Event("fx:show"))));

  const scenes = [];
  window.esrSite = { lenis, reduce, EASE, INTRO, fromNav, scene: (fn) => scenes.push(fn) };

  // Header menu text: only on the first page opened, starting 2.4s in, each line types on at .2s intervals (over .3s power2.out, leading characters first).
  // Text isn’t erased, each letter is hidden and then switched on — it looks like the original TextPlugin typing, and the text stays in the document from the start
  const typeNav = () => {
    if (reduce || fromNav) return;
    $$(".e-head .e-nav .menu-item").forEach((s, i) => {
      const text = s.textContent;
      s.textContent = "";
      const chars = [...text].map((ch) => { const c = document.createElement("span"); c.textContent = ch; c.style.opacity = "0"; s.append(c); return c; });
      gsap.to(chars, { opacity: 1, duration: 0, delay: 0.2 * i + 2.4, stagger: { amount: 0.3, ease: "power2.out" } });
    });
  };
  typeNav();

  const run = (at) => { reveal(at); scenes.forEach((fn) => fn(at)); ScrollTrigger.refresh(); };
  document.fonts.ready.then(() => {
    const intro = $(".e-intro");
    if (fromNav && !reduce) {
      intro?.remove();
      gsap.set(page, { y: "101vh", opacity: 0 });
      gsap.set(page, { opacity: 1, delay: 0.1 });
      gsap.to(page, { y: 0, duration: 1.2, ease: INTRO, delay: 0.1, clearProps: "transform", onComplete: () => { gsap.set(page, { clearProps: "position,zIndex" }); gsap.set(curtain, { autoAlpha: 0 }); ScrollTrigger.refresh(); } });
      run(0.9);
      return;
    }
    if (!intro || reduce) { intro?.remove(); run(0); return; }
    // Loader: logo letters go from 170px below to −106px (1.2s expo.out .05 stagger, after .2s), and at 2s the logo plate exits to −60vh (1s expo.inOut)
    // The hero photo cells open from the right (inset left 100% → 0, .1 gaps)
    document.body.classList.add("lock-scroll");
    lenis?.stop();
    const logo = $(".e-intro__logo", intro);
    const letters = $$(".e-logo > *", logo);
    const reveal = $$("[data-intro-reveal]");
    const m = { duration: 1, ease: "expo.inOut" };
    const tl = gsap.timeline();
    tl.set(logo, { opacity: 1 })
      .fromTo(letters, { y: 170 }, { y: -106, duration: 1.2, ease: "expo.out", stagger: 0.05, delay: 0.2 })
      .to(intro, { y: "-60vh", ...m }, 2)
      .fromTo(reveal, { clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0 0 0%)", ...m, stagger: 0.1 }, 2)
      .add(() => run(0.4), "-=0.45")
      .set(intro, { display: "none" })
      .add(() => { document.body.classList.remove("lock-scroll"); lenis?.start(); ScrollTrigger.refresh(); });
  });
})();
