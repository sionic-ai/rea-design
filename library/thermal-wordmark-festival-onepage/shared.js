// Motion shared by all pages: Lenis smooth scroll, hiding nav and menu drawer, three effects (melt, rise, sweep), footer wordmark.
// Put page scenes in with kMotion.scene(fn) and they are all built together in document order once fonts have loaded —
// The wordmark letter cell height depends on the typeface width, so building it first would misalign the pin range.
(() => {
  gsap.registerPlugin(ScrollTrigger);

  // Delay order that melts letters in a shuffled, water-drop-like sequence rather than left to right
  const DRIP = [0, 3, 1, 5, 2, 4];
  const effects = {
    melt(cells, from, to) {
      return gsap.timeline().fromTo(cells, { scaleY: from }, {
        scaleY: to, ease: "none", duration: 0.62, stagger: (i) => DRIP[i % DRIP.length] * 0.076,
      }, 0);
    },
    rise(el) {
      return gsap.timeline().fromTo(el, { scaleY: 0.16, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 1.05, ease: "expo.out" });
    },
    // The original color band enters from above the photo, rests briefly at its place (--at), then slips out below. The photo inside the band moves the opposite way so it looks fixed in place
    scan(frame) {
      const band = frame.querySelector(".k-heat__band");
      const plain = band.querySelector(".k-heat__plain");
      const at = parseFloat(getComputedStyle(frame).getPropertyValue("--at")) || 0;
      const from = -(at / 26) * 100 - 100;
      const to = ((100 - at) / 26) * 100;
      return gsap.timeline()
        .fromTo(band, { yPercent: from }, { yPercent: 0, ease: "none", duration: 0.4 }, 0)
        .fromTo(plain, { yPercent: -from * 0.26 }, { yPercent: 0, ease: "none", duration: 0.4 }, 0)
        .fromTo(band, { yPercent: 0 }, { yPercent: to, ease: "none", duration: 0.4, immediateRender: false }, 0.6)
        .fromTo(plain, { yPercent: 0 }, { yPercent: -to * 0.26, ease: "none", duration: 0.4, immediateRender: false }, 0.6);
    },
  };

  // Rewrites the thermal filter table into nine --site-heat-* slots made from the skin — change the skin and the photo’s heat colors follow.
  // Computed colors come out as oklch text, so paint them on a canvas and read them back as sRGB. If the canvas can’t accept that text, use the original table
  const heat = document.querySelector("#k-heat feComponentTransfer");
  if (heat) {
    const probe = document.body.appendChild(document.createElement("i"));
    const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const rgb = [];
    for (let i = 0; i < 9; i++) {
      probe.style.color = `var(--site-heat-${i})`;
      ctx.fillStyle = "transparent";
      const blank = ctx.fillStyle;
      ctx.fillStyle = getComputedStyle(probe).color;
      if (ctx.fillStyle === blank) break;
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillRect(0, 0, 1, 1);
      rgb.push(ctx.getImageData(0, 0, 1, 1).data);
    }
    probe.remove();
    if (rgb.length === 9) {
      ["R", "G", "B"].forEach((ch, k) =>
        heat.querySelector(`feFunc${ch}`).setAttribute("tableValues", rgb.map((c) => +(c[k] / 255).toFixed(3)).join(" ")));
    }
  }

  const scenes = [];
  window.kMotion = { effects, scene: (fn) => scenes.push(fn) };

  const nav = document.querySelector(".k-nav");
  const navHeight = () => (nav ? nav.offsetHeight : 0);
  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const lenis = (window.lenis = new Lenis({ lerp: 0.085, anchors: { offset: -navHeight() } }));
    const tick = (time) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      window.lenis = null;
    };
  });

  if (nav) {
    let last = scrollY;
    addEventListener("scroll", () => {
      const y = scrollY;
      if (y !== last) nav.classList.toggle("is-hidden", y > last && y > navHeight() * 2);
      last = y;
    }, { passive: true });
    nav.addEventListener("focusin", () => nav.classList.remove("is-hidden"));

    const menu = document.getElementById("menu");
    const open = nav.querySelector(".k-nav__open");
    const close = menu.querySelector(".k-menu__close");
    const setMenu = (on) => {
      menu.hidden = !on;
      open.setAttribute("aria-expanded", String(on));
      if (on) {
        nav.classList.remove("is-hidden");
        window.lenis?.stop();
        close.focus();
      } else {
        window.lenis?.start();
      }
    };
    open.addEventListener("click", () => setMenu(true));
    close.addEventListener("click", () => { setMenu(false); open.focus(); });
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
    addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !menu.hidden) { setMenu(false); open.focus(); }
    });
  }

  // Looping animations (glow, bands, haze) of sections off screen are paused
  const loops = new IntersectionObserver((entries) => entries.forEach((e) => e.target.toggleAttribute("data-paused", !e.isIntersecting)));
  document.querySelectorAll("[data-loop]").forEach((el) => loops.observe(el));

  const build = () => {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      scenes.forEach((fn) => fn(effects));

      document.querySelectorAll('[data-motion~="rise"]').forEach((el) =>
        ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, animation: effects.rise(el) }));
      document.querySelectorAll('[data-motion~="scan"]').forEach((frame) =>
        ScrollTrigger.create({ trigger: frame, start: "top bottom", end: "bottom top", scrub: true, animation: effects.scan(frame) }));

      const footer = document.querySelector(".k-footer");
      if (footer) {
        gsap.timeline({ scrollTrigger: { trigger: footer, start: "top bottom", end: "bottom bottom", scrub: true } })
          .add(effects.melt(footer.querySelectorAll(".k-word__cell"), 0.28, 1), 0);
      }
    });
    if (window.lenis) window.lenis.options.anchors = { offset: -navHeight() };
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  };

  const parsed = document.readyState === "loading"
    ? new Promise((r) => addEventListener("DOMContentLoaded", r, { once: true }))
    : Promise.resolve();
  Promise.all([document.fonts.ready, parsed]).then(build);
})();
