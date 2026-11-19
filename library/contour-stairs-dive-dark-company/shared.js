// Surface motion: Lenis 1.3.17 + ScrollTrigger, the original’s three curves (joe.in·out·inOut), menu position shift · current section underline, phone menu drawer,
// ‹Once when visible› text entrance (data-anim="up|rtl" — from 30 below·50 right, line·word splitting), rounded corner border drawing (data-draw).
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  CustomEase.create("joe.in", "M0,0 C0.8,0 0.8,0.5 1,1");
  CustomEase.create("joe.out", "M0,0 C0.2,0 0.1,1 1,1");
  CustomEase.create("joe.inOut", "M0,0 C0.333,0 0,1 1,1");

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lenis = reduce ? null : new Lenis({ autoRaf: false });
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  const small = matchMedia("(max-width: 767px)");

  // Menu → section: 2 seconds on desktop (.5s on phone), offset by the header bar height, data-ease="slow" Surface sine curve. data-dur overrides the length
  const scrollToSection = (a) => {
    const id = a.dataset.to;
    const target = id === "home" ? 0 : document.getElementById(id);
    if (target == null) return;
    const duration = +(a.dataset.dur || (small.matches ? 0.5 : 2));
    const offset = small.matches ? -40 : -80;
    const easing = a.dataset.ease === "slow" ? (x) => -(Math.cos(Math.PI * x) - 1) / 2 : undefined;
    if (lenis) lenis.scrollTo(target, { duration, offset, easing });
    else window.scrollTo({ top: target === 0 ? 0 : target.getBoundingClientRect().top + scrollY + offset });
  };
  document.querySelectorAll("[data-to]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    closeMenu();
    scrollToSection(a);
  }));

  // Menu underline for the current section — from when the section’s top edge passes screen center until the bottom edge reaches 30%
  ["about", "principles", "team", "portfolio", "goods"].forEach((id) => {
    const sec = document.getElementById(id);
    if (!sec) return;
    const links = document.querySelectorAll(`.tp-nav [data-to="${id}"], .tp-menu__list [data-to="${id}"]`);
    ScrollTrigger.create({ trigger: sec, start: "top 50%", end: "bottom 30%", onToggle: (s) => links.forEach((l) => l.classList.toggle("is-active", s.isActive)) });
  });

  // Phone menu drawer — the original opens the cover with joe.inOut. Menu rows come in from below at .05 intervals
  const toggle = document.querySelector(".tp-toggle");
  const menu = document.getElementById("tp-menu");
  function closeMenu() {
    if (!menu || menu.hidden) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open Menu");
    gsap.to(menu, { autoAlpha: 0, duration: reduce ? 0 : 0.5, ease: "joe.inOut", onComplete: () => { menu.hidden = true; } });
    lenis?.start();
  }
  const openMenu = () => {
    menu.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close Menu");
    lenis?.stop();
    gsap.fromTo(menu, { autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? 0 : 0.5, ease: "joe.inOut" });
    gsap.fromTo(menu.querySelectorAll(".tp-menu__list li"), { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: reduce ? 0 : 1, stagger: 0.05, ease: "joe.out", delay: 0.15 });
  };
  toggle?.addEventListener("click", () => (menu.hidden ? openMenu() : closeMenu()));

  // Rounded-corner border: top and bottom edges open from the center with .5s joe.inOut (scaleX), side edges scaleY, and when done the corners light up and the inside opens up and down
  const draw = (frame, trigger = {}) => {
    const h = frame.querySelectorAll(":scope > .tp-edge--top, :scope > .tp-edge--bottom");
    const v = frame.querySelectorAll(":scope > .tp-edge--left, :scope > .tp-edge--right");
    const open = frame.querySelector(":scope > [data-draw-open]");
    const edges = [...h, ...v];
    if (reduce) return;
    edges.forEach((e) => e.classList.add("is-hidden"));
    gsap.set(h, { scaleX: 0 });
    gsap.set(v, { scaleY: 0 });
    if (open) open.style.setProperty("--open", "0%");
    const top = frame.querySelector(":scope > .tp-edge--top"), bottom = frame.querySelector(":scope > .tp-edge--bottom");
    const tl = gsap.timeline({ scrollTrigger: { trigger: frame, start: "top 80%", ...trigger } })
      .to(h, { scaleX: 1, duration: 0.5, ease: "joe.inOut", onComplete: () => edges.forEach((e) => e.classList.remove("is-hidden")) })
      .to(v, { scaleY: 1, duration: 0.5, ease: "joe.inOut" }, "<");
    if (top && bottom) {
      tl.fromTo(top, { y: () => frame.offsetHeight / 2 }, { y: 0, duration: 1, ease: "joe.inOut" }, ">")
        .fromTo(bottom, { y: () => -frame.offsetHeight / 2 }, { y: 0, duration: 1, ease: "joe.inOut" }, "<");
    }
    if (open) tl.to(open, { "--open": "100%", duration: 1, ease: "joe.inOut" }, "<");
    return tl;
  };
  document.querySelectorAll("[data-draw]").forEach((f) => draw(f));

  // Once when visible: data-anim="up"(y 30) · "rtl"(x 50, overridden by data-x), length · gap · delay · curve set by data-dur·stagger·delay·ease, split into lines · words if data-split
  const play = (el) => {
    const kind = el.dataset.anim;
    const from = kind === "rtl" ? { x: +(el.dataset.x ?? 50), opacity: 0 } : { y: 30, opacity: 0 };
    let targets = el, split = null;
    if (el.dataset.split) {
      split = new SplitText(el, { type: el.dataset.split });
      targets = split[el.dataset.split] || el;
    } else if (el.children.length > 1 && el.dataset.stagger) targets = el.children;
    const to = { x: 0, y: 0, opacity: 1, duration: +(el.dataset.dur ?? 1), stagger: +(el.dataset.stagger ?? 0), delay: +(el.dataset.delay ?? 0), ease: el.dataset.ease || "joe.out", onComplete: () => split?.revert() };
    if (reduce) return;
    gsap.fromTo(targets, from, { ...to, scrollTrigger: { trigger: el, start: "top 90%", once: true } });
  };
  document.fonts.ready.then(() => {
    document.querySelectorAll("[data-anim]").forEach(play);
    ScrollTrigger.refresh();
  });

  window.tpSite = { lenis, reduce, draw, small };
})();
