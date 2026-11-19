// Shared across the site — smooth scroll (lenis 1.1.19, duration .8 · lerp .13) · same-page section moves · nature icons (Lottie) · header (blurs current section · hides at footer) · phone menu · footer Back to top.
// Text · photo reveal is handled by the motion part blur-word-reveal (split: none) — here we only switch the .bs-t · .bs-i display into the part’s options.
(() => {
  const sp = matchMedia("(max-width: 768px), (orientation: portrait) and (hover: none)");
  const touch = !matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  // Text fades in per element from 10px blur and transparent over 1s (.6s on phone) power2.out, photo frames from .95 scale and transparent over 1.2s — once, when the top edge touches the very bottom of the screen.
  document.querySelectorAll(".bs-t").forEach((el) => {
    el.setAttribute("data-fx", ((el.getAttribute("data-fx") || "") + " blur-word-reveal").trim());
    el.setAttribute("data-fx-blur-word-reveal", `split: none; blur: 10; dur: ${sp.matches ? 0.6 : 1}; ease: power2.out; start: top bottom`);
  });
  document.querySelectorAll(".bs-i").forEach((el) => {
    el.setAttribute("data-fx", ((el.getAttribute("data-fx") || "") + " blur-word-reveal").trim());
    el.setAttribute("data-fx-blur-word-reveal", "split: none; blur: 0; scale: .95; dur: 1.2; ease: power2.out; start: top bottom");
  });

  // Smooth scroll — driven by the GSAP clock, and when the wheel direction changes inside an inner scroll panel (data-lenis-prevent) it pauses briefly and restarts (same as the original)
  const lenis = reduce ? null : new Lenis({ duration: 0.8, lerp: 0.13 });
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollbars = new WeakMap();
  if (!touch && window.OverlayScrollbarsGlobal) {
    const { OverlayScrollbars } = OverlayScrollbarsGlobal;
    const make = (el) => scrollbars.set(el, OverlayScrollbars(el, { scrollbars: { autoHide: "scroll" }, overflow: { x: "hidden" } }));
    make(document.body);
    document.querySelectorAll("[data-lenis-prevent]").forEach((el) => {
      make(el);
      el.addEventListener("wheel", (e) => {
        const a = Math.sign(lenis?.velocity ?? 0), b = Math.sign(e.deltaY);
        if (a && b && a !== b) { lenis?.stop(); setTimeout(() => lenis?.start(), 10); }
      });
    });
  }
  const headerH = () => document.querySelector(".bs-header__in")?.getBoundingClientRect().height ?? 0;
  const scrollToY = (y, offsetY = 0) => {
    lenis?.stop();
    gsap.to(window, { scrollTo: { y, offsetY }, duration: 0.8, ease: "power2.out", onComplete: () => lenis?.start() });
  };
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    if (a.getAttribute("href").length < 2) return;
    a.addEventListener("click", (e) => {
      const to = document.querySelector(a.getAttribute("href"));
      if (!to) return;
      e.preventDefault();
      scrollToY(to, headerH());
    });
  });

  // Nature icon. It draws the art.js artwork with the original settings (svg). With data-autoplay · data-loop it loops right away, and data-touch loops only on devices with no hover.
  const art = window.bsArt || {};
  const lottieOf = (el) => {
    if (el.bsLottie || !art[el.dataset.lottie] || !window.lottie) return el.bsLottie;
    let loop = el.hasAttribute("data-loop"), auto = el.hasAttribute("data-autoplay");
    if (touch && el.hasAttribute("data-touch")) loop = auto = true;
    const a = lottie.loadAnimation({ container: el, renderer: "svg", loop, autoplay: auto && !reduce, animationData: art[el.dataset.lottie]() });
    el.bsLottie = {
      a,
      play(rep = false) { if (reduce) return; a.setLoop(rep); a.setDirection(1); a.goToAndStop(0); a.play(); },
      stop() { a.goToAndStop(0); },
    };
    return el.bsLottie;
  };
  document.querySelectorAll("[data-lottie]").forEach(lottieOf);
  window.bsLottieOf = lottieOf;

  document.querySelectorAll(".bs-stitle").forEach((t) => {
    ScrollTrigger.create({ trigger: t, start: "top bottom", once: true, onEnter: () => lottieOf(t.querySelector("[data-lottie]"))?.play(true) });
  });
  document.querySelectorAll(".bs-flink").forEach((w) => {
    const icon = w.querySelector("[data-lottie]");
    w.querySelector("a")?.addEventListener("mouseenter", () => lottieOf(icon)?.play());
  });

  // Header — when the footer header touches below the header, it hides upward (.4s power1.out) and comes back down on return. On wide screens the menu of the current section fades
  const header = document.querySelector(".bs-header");
  const footer = document.querySelector(".bs-footer");
  const at = (extra = 0) => `top top+=${headerH() + extra}px`;
  if (header && footer) {
    ScrollTrigger.create({
      trigger: footer, start: () => at(),
      onEnter: () => gsap.to(header, { yPercent: -100, duration: 0.4, ease: "power1.out" }),
      onLeaveBack: () => gsap.to(header, { yPercent: 0, duration: 0.4, ease: "power1.out" }),
    });
  }
  if (!sp.matches) {
    const links = [...document.querySelectorAll(".bs-nav .bs-plink")];
    links.forEach((a, i) => {
      const sec = document.querySelector(a.getAttribute("href"));
      if (!sec) return;
      const next = links[i + 1] && document.querySelector(links[i + 1].getAttribute("href"));
      ScrollTrigger.create({
        trigger: sec, start: () => at(2),
        ...(next ? { endTrigger: next, end: () => at(2), onLeave: () => a.classList.remove("is-current"), onEnterBack: () => a.classList.add("is-current") } : {}),
        onEnter: () => a.classList.add("is-current"),
        onLeaveBack: () => a.classList.remove("is-current"),
      });
    });
  }

  // Phone menu: curtain .15s, each line in .5s with .05s stagger from 1.5rem above, bottom plate .7 → 1, the arrow hint below .2 later
  const menu = document.querySelector(".bs-menu");
  if (menu) {
    const dialog = menu.querySelector("dialog");
    const icons = (on) => menu.querySelectorAll("[data-lottie]").forEach((i) => (on ? lottieOf(i)?.play(true) : lottieOf(i)?.stop()));
    const open = () => {
      dialog.showModal();
      lenis?.stop();
      icons(true);
      const rows = [...menu.querySelectorAll(".bs-menu__links li"), ...menu.querySelectorAll(".bs-menu__outer li"), menu.querySelector(".bs-menu__sns")];
      const tl = gsap.timeline();
      tl.fromTo(menu, { "--opacity": 0 }, { "--opacity": 1, duration: 0.15, ease: "power1.out" });
      tl.fromTo(rows, { y: "-1.5rem", opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power1.out" });
      tl.fromTo(menu.querySelector(".bs-menu__body"), { "--btm-prog": 0.7 }, { "--btm-prog": 1, duration: 0.5, ease: "power1.out" }, 0);
      tl.fromTo(menu.querySelector(".bs-menu__guide"), { y: "-1.2rem", opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power1.out" }, "<20%");
    };
    const close = () => gsap.to(menu, { "--opacity": 0, duration: 0.15, ease: "power1.out", onComplete: () => { dialog.close(); lenis?.start(); icons(false); } });
    document.querySelector(".bs-menu-opener")?.addEventListener("click", open);
    menu.querySelector(".bs-menu__closer")?.addEventListener("click", close);
    menu.querySelectorAll(".bs-menu__links a").forEach((a) => a.addEventListener("click", close));
  }

  // ”Back to top” — enter (1s) → stay (3s repeat), exit on leave (1s). If you leave while entering, the enter plays in reverse. Devices with no pointer only repeat the stay
  const b2t = document.querySelector(".bs-b2t");
  if (b2t && window.lottie) {
    const layer = (cls) => b2t.querySelector(cls);
    const load = (cls, name, loop, auto) => lottie.loadAnimation({ container: layer(cls), renderer: "svg", loop, autoplay: auto && !reduce, animationData: art[name]() });
    const show = (cls) => b2t.querySelectorAll(":scope > span").forEach((s) => s.classList.toggle("is-on", s.matches(cls)));
    b2t.addEventListener("click", () => scrollToY(0));
    if (touch) { load(".is-hover", "b2t_hover", true, true); show(".is-hover"); }
    else {
      const aIn = load(".is-in", "b2t_in", false, false), aHover = load(".is-hover", "b2t_hover", true, false), aOut = load(".is-out", "b2t_out", false, false);
      let entering = false;
      const reset = () => { show(".is-in"); aIn.goToAndStop(0); aHover.goToAndStop(0); aOut.goToAndStop(0); aIn.setDirection(1); };
      reset();
      aOut.addEventListener("complete", () => { entering = false; reset(); });
      b2t.addEventListener("mouseenter", () => {
        entering = true; reset(); aIn.play();
        aIn.removeEventListener("complete");
        aIn.addEventListener("complete", () => { entering = false; show(".is-hover"); aIn.goToAndStop(0, true); aHover.play(); });
      });
      b2t.addEventListener("mouseleave", () => {
        if (entering) {
          entering = false; aIn.setDirection(-1);
          aIn.removeEventListener("complete");
          aIn.addEventListener("complete", reset);
        } else { show(".is-out"); aHover.stop(); aOut.play(); }
      });
    }
  }

  window.bsSite = { lenis, sp, touch, reduce, scrollbars, scrollToY };
})();
