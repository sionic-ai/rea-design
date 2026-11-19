// Work detail scene: header row (color change · hide), a Flip where the hero photo folds into the slot inside the title, walking stacked photos, phone photo row, footer stage swap, floating work list.
(() => {
  const { reduce } = window.eSite;
  gsap.registerPlugin(Flip);
  // The original, on Flip "base.inOut", on the walking snap "magic" …hands them over, but both names are registered nowhere, so it runs on the GSAP default curve (power1.out) — as it actually behaves
  const UNREGISTERED = "power1.out";

  // ── Header bar (original ProjectHeader): turns brick red once scroll passes 2% of screen height, slides up from 8% document progress
  const header = document.querySelector("[data-project-header]");
  const lenis = window.lenis;
  const paintHeader = (scroll, progress) => {
    header.dataset.dark = String(scroll > 0.02 * innerHeight);
    header.dataset.hide = String(progress >= 0.08);
  };
  const nativeProgress = () => { const max = document.documentElement.scrollHeight - innerHeight; return max > 0 ? scrollY / max : 0; };
  if (lenis) lenis.on("scroll", (l) => paintHeader(l.scroll, l.progress));
  else addEventListener("scroll", () => paintHeader(scrollY, nativeProgress()), { passive: true });
  paintHeader(scrollY, nativeProgress());

  window.eSite.scene(() => {
    const mm = gsap.matchMedia();

    // ── Hero (original HeroProject): full-screen photo cells, from when the first cell’s center hits the screen center until the last cell’s (the 16:10 cell inside the title) center reaches 35% of the screen
    // Tied to scroll, Flip.fit moves to the next cell, and the incoming cell opens from width 0 to its full width. Length is the distance between the two cell centers (px). Once it starts moving, the photo source turns off
    const hero = document.querySelector("[data-flip-hero]");
    const target = hero.querySelector("[data-target]");
    const credit = hero.querySelector("[data-hero-credits]");
    const zones = gsap.utils.toArray(hero.querySelectorAll("[data-zone]"));
    const mid = (el) => el.getBoundingClientRect().top + el.offsetHeight / 2;
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      let tl = null;
      const build = () => {
        tl?.kill();
        gsap.set(target, { clearProps: "all" });
        gsap.set(zones, { clearProps: "width" });
        tl = gsap.timeline({ scrollTrigger: { trigger: zones[0], start: "center center", endTrigger: zones[zones.length - 1], end: "center 35%", scrub: true } });
        zones.forEach((zone, i) => {
          const next = zones[i + 1];
          if (!next) return;
          const d = mid(next) - mid(zone);
          tl.add(Flip.fit(target, next, { duration: d, ease: UNREGISTERED }));
          tl.from(next, { width: 0, duration: d, ease: UNREGISTERED }, "<");
        });
      };
      build();
      const st = ScrollTrigger.create({
        trigger: zones[0], start: "center center", endTrigger: zones[zones.length - 1], end: "center 35%",
        onUpdate: (self) => gsap.set(credit, { opacity: self.progress > 0 ? 0 : 1 }),
      });
      ScrollTrigger.addEventListener("refreshInit", build);
      return () => {
        ScrollTrigger.removeEventListener("refreshInit", build);
        tl?.kill();
        st.kill();
        gsap.set([target, credit, ...zones], { clearProps: "all" });
      };
    });

    // ── Stacked photo walk (original stack piece): reverse the document order and walk from the top board. Snap per board (1/(boards-1)) .8s.
    // Child tweens are given no curve or duration, like the original, so they use the GSAP default (power1.out · .5s)
    const stack = document.querySelector("[data-stack]");
    const items = gsap.utils.toArray(stack.querySelectorAll("[data-stack-viewport] > div")).reverse();
    const stackTimeline = (extra) => gsap.timeline({
      ease: "none",
      scrollTrigger: { trigger: stack, start: "top top", scrub: true, invalidateOnRefresh: true, snap: { snapTo: 1 / (items.length - 1), duration: 0.8, ease: UNREGISTERED }, ...extra },
    });
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      // With the section pinned (panel-1) for one screen: the upper panel is cropped away from its bottom edge upward while the photo moves −15% up, the lower panel rises from 15% below as a black .9 veil lifts, and the description drops in from above
      const tl = stackTimeline({ end: `+=${(items.length - 1) * 100}%`, pin: true, pinType: "transform" });
      items.slice(0, -1).forEach((item, i) => {
        const next = items[i + 1];
        tl.to(item, { clipPath: "inset(0 0 100% 0)" })
          .to(item.querySelector(".e-ds__img"), { yPercent: -15 }, "<")
          .from(next, { yPercent: 15 }, "<")
          .fromTo(next.querySelector("[data-stack-layer]"), { autoAlpha: 0.9 }, { autoAlpha: 0 }, "<")
          .from(next.querySelector("[data-stack-caption]"), { yPercent: -100 }, "<");
      });
    });
    mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
      // Phone: during a 3-screen-long pin, the photo slot of the upper panel is pushed up and out (the inside is pushed the other way so it looks cropped and staying in place), and the description slot slides down and out (scrub .3)
      const tl = stackTimeline({ end: "bottom bottom", scrub: 0.3 });
      items.slice(0, -1).forEach((item, i) => {
        const next = items[i + 1];
        tl.to(item.querySelector("[data-stack-media]"), { yPercent: -100 })
          .to(item.querySelector("[data-stack-media-inner]"), { yPercent: 100 }, "<")
          .to(item.querySelector(".e-ds__img"), { yPercent: -15 }, "<")
          .from(next.querySelector(".e-ds__img"), { yPercent: 15 }, "<")
          .to(item.querySelector("[data-stack-caption]"), { yPercent: 100 }, "<");
      });
    });

    // ── Phone photo row: original BlossomCarousel as is (no repeat)
    const strip = document.querySelector(".e-gallery__scroller");
    if (strip && window.BlossomCarousel) BlossomCarousel.Blossom(strip, { repeat: false }).init();

    // ── Footer stage (original FooterSpy): when the footer’s top edge reaches screen center, body gets is-footer-inview — background and text color change over .7s
    ScrollTrigger.create({
      trigger: "[data-footer-spy]", start: "top center", end: "bottom top",
      onEnter: () => document.body.classList.add("is-footer-inview"),
      onLeaveBack: () => document.body.classList.remove("is-footer-inview"),
    });
  });

  // ── Floating work list (original WorkNav): rises from the bottom only when past the hero, scrolling is not stopped, and scrolled up more than 16px.
  // Scrolling down more than 16px hides it and closes it. Pressing opens the panel to min(23.25rem, screen−2rem) wide and list height over .8s expo.out,
  // The text slides out to the right, the two-line icon moves to the center and becomes an X, and the lines slide in from −(6+10·index)rem. On close it rewinds 1.35x faster
  const nav = document.querySelector("[data-work-nav]");
  const box = nav.querySelector("[data-wn-box]");
  const list = nav.querySelector("[data-wn-list]");
  const toggle = nav.querySelector("[data-wn-toggle]");
  const label = nav.querySelector("[data-wn-label]");
  const icon = nav.querySelector("[data-wn-icon]");
  const state = { open: false, passed: false, stopped: false, up: false };
  let flow = null;

  const sync = () => {
    const shown = state.passed && !state.stopped && state.up;
    nav.classList.toggle("is-shown", shown);
    nav.inert = !shown;
  };
  const setOpen = (on) => {
    if (state.open === on) return;
    state.open = on;
    toggle.setAttribute("aria-expanded", String(on));
    list.inert = !on;
    if (!flow) return;
    if (reduce.matches) return void flow.progress(on ? 1 : 0).pause();
    on ? flow.timeScale(1).play() : flow.timeScale(1.35).reverse();
  };
  const build = () => {
    const rows = list.querySelectorAll("li");
    const lines = icon.querySelectorAll("span");
    flow?.kill();
    gsap.set([box, list, label, icon, ...lines, ...rows], { clearProps: "all" });
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const w = Math.min(23.25 * rem, innerWidth - 2 * rem);
    gsap.set(list, { width: w });
    const h = list.offsetHeight + toggle.offsetHeight;
    const off = toggle.offsetWidth - (icon.offsetLeft + icon.offsetWidth / 2);
    const d = 0.125 * icon.offsetHeight;
    flow = gsap.timeline({ paused: true, defaults: { duration: 0.8, ease: "expo.out" } })
      .to(box, { width: w, height: h }, 0)
      .to(label, { xPercent: 110 }, 0)
      .to(icon, { x: -(w / 2 - off) }, 0)
      .to(lines[0], { y: d, rotation: 45 }, 0)
      .to(lines[1], { y: -d, rotation: -45 }, 0);
    if (rows.length) flow.fromTo(rows, { x: (i) => -(6 + 10 * i) * rem }, { x: 0, duration: 0.7 }, 0.1);
    flow.progress(state.open ? 1 : 0);
  };
  build();
  let raf = 0;
  addEventListener("resize", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { if (!state.open) build(); }); });
  document.fonts.ready.then(() => { if (!state.open) build(); });

  toggle.addEventListener("click", () => setOpen(!state.open));
  list.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  document.addEventListener("pointerdown", (e) => { if (state.open && !nav.contains(e.target)) setOpen(false); });

  let last = null;
  let acc = 0;
  const onScrollDir = (y) => {
    const prev = last;
    last = y;
    if (prev === null) return;
    const dy = y - prev;
    if (!dy) return;
    acc = Math.sign(dy) === Math.sign(acc) ? acc + dy : dy;
    if (acc <= -16) state.up = true;
    else if (acc >= 16) { state.up = false; setOpen(false); }
    sync();
  };
  if (lenis) lenis.on("scroll", (l) => onScrollDir(l.scroll));
  else addEventListener("scroll", () => onScrollDir(scrollY), { passive: true });

  new IntersectionObserver(([e]) => {
    state.passed = !e.isIntersecting && e.boundingClientRect.top < 0;
    if (!state.passed) setOpen(false);
    sync();
  }, { threshold: 0 }).observe(document.getElementById("hero"));

  const html = document.documentElement;
  const watchStop = () => {
    state.stopped = html.classList.contains("lenis-stopped");
    if (state.stopped) setOpen(false);
    sync();
  };
  new MutationObserver(watchStop).observe(html, { attributes: true, attributeFilter: ["class"] });
  watchStop();
})();
