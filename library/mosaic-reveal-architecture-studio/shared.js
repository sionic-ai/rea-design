// Motion spanning several pages — smooth scroll, header menu hide, menu drawer, anchor jump, back to top, footer title, footer pixel band.
// Letter splitting and pixel strip building are also used by the page (index.js), so they are exported as window.AN.
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const splitChars = (el) => {
    const text = el.textContent.replace(/\s+/g, " ").trim();
    el.textContent = "";
    return [...text].map((ch) => {
      const s = document.createElement("span");
      s.textContent = ch === " " ? " " : ch;
      el.append(s);
      return s;
    });
  };

  // For each cell pick the cells that flip to the next color by that row’s probability, and change six cells in the top four rows to the accent color (original values)
  // Skin variable to rgb() — the variable value is literal text (oklch(from var(…))) so GSAP can’t blend it as a color. Paint one point and read it back
  const dot = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const paint = (name) => {
    const probe = document.createElement("i");
    probe.style.color = `var(${name})`;
    document.body.appendChild(probe);
    dot.clearRect(0, 0, 1, 1);
    dot.fillStyle = getComputedStyle(probe).color;
    probe.remove();
    dot.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = dot.getImageData(0, 0, 1, 1).data;
    return `rgba(${r}, ${g}, ${b}, ${+(a / 255).toFixed(3)})`;
  };
  const pixelBand = (el, { from, to, accent, probs, end = "top 20%" }) => {
    const flips = [], upper = [];
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 25; col++) {
        const cell = document.createElement("div");
        cell.style.backgroundColor = from;
        if (Math.random() < probs[row]) {
          const f = { el: cell, color: to };
          flips.push(f);
          if (row < 4) upper.push(f);
        }
        el.append(cell);
      }
    }
    gsap.utils.shuffle(upper).slice(0, 6).forEach((f) => (f.color = accent));
    if (reduce) return flips.forEach((f) => (f.el.style.backgroundColor = f.color));
    gsap.to(flips.map((f) => f.el), {
      backgroundColor: (i) => flips[i].color,
      duration: 0.05,
      ease: "none",
      stagger: { each: 0.003, from: "random" },
      scrollTrigger: { trigger: el, start: "top bottom", end, scrub: true },
    });
  };

  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.2, easing: (t) => 1 - (1 - t) ** 3 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Header menu: hides off the top when scrolling down (.45s power3.inOut), comes down when scrolling up with buttons dropping in one by one
  const header = document.querySelector(".an-header");
  let anchoring = false;
  if (header && !reduce) {
    const items = header.querySelectorAll(".an-header__item");
    let hidden = false, tw;
    const away = () => -(header.offsetHeight + parseFloat(getComputedStyle(header).top) + 8);
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        if (anchoring) return;
        if (self.direction === 1 && !hidden) {
          hidden = true; tw?.kill();
          tw = gsap.to(header, { y: away(), duration: 0.45, ease: "power3.inOut" });
        } else if (self.direction === -1 && hidden) {
          hidden = false; tw?.kill();
          gsap.set(items, { y: -50 });
          tw = gsap.timeline()
            .to(header, { y: 0, duration: 0.45, ease: "power3.out" })
            .to(items, { y: 0, duration: 0.5, stagger: 0.1, ease: "power3.out" }, "<");
        }
      },
    });
  }

  document.querySelectorAll(".an-header__link").forEach((link) => {
    const def = link.querySelector(".an-header__label--default"), clone = link.querySelector(".an-header__label--clone");
    gsap.set(clone, { rotate: 28, y: "100%", transformOrigin: "left center" });
    const go = (on) => {
      const o = { duration: 0.6, ease: "power4.out", overwrite: "auto" };
      gsap.to(clone, { rotate: on ? 0 : 28, y: on ? "0%" : "100%", ...o });
      gsap.to(def, { scale: on ? 0 : 1, ...o });
    };
    link.addEventListener("mouseenter", () => go(true));
    link.addEventListener("mouseleave", () => go(false));
  });

  // Phone menu drawer: on open the curtain, panel, label and text move together with 1s power4.out, reversed on close. Scrolling stops while open
  const menu = document.querySelector(".an-menu");
  const menuBtn = document.querySelector(".an-menu-btn");
  let menuOpen = false, openTl, closeTl;
  if (menu && menuBtn) {
    const panel = menu.querySelector(".an-menu__panel");
    const lOpen = menuBtn.querySelector(".an-menu-btn__open"), lClose = menuBtn.querySelector(".an-menu-btn__close");
    const words = panel.querySelectorAll(".an-mask > span");
    const o = { duration: 1, ease: "power4.out" };
    gsap.set(menu, { opacity: 0, pointerEvents: "none" });
    gsap.set(panel, { opacity: 0, rotate: -28, transformOrigin: "left top" });
    gsap.set(lClose, { yPercent: 100 });
    gsap.set(words, { yPercent: 100 });
    openTl = gsap.timeline({ paused: true })
      .to(menu, { opacity: 1, pointerEvents: "all", ...o })
      .to(panel, { opacity: 1, rotate: 0, ...o }, 0)
      .to(lOpen, { yPercent: -100, ...o }, 0)
      .to(lClose, { yPercent: 0, ...o }, 0)
      .to(menuBtn, { backgroundColor: paint("--kf-ink"), color: paint("--kf-on-accent"), ...o }, 0)
      .to(words, { yPercent: 0, stagger: 0.1, ...o }, 0);
    closeTl = gsap.timeline({ paused: true })
      .to(lOpen, { yPercent: 0, ...o }, 0)
      .to(menuBtn, { backgroundColor: "transparent", color: paint("--kf-ink"), ...o }, 0)
      .to(lClose, { yPercent: 100, ...o }, 0)
      .to(panel, { opacity: 0, rotate: -28, ...o }, 0)
      .to(menu, { opacity: 0, pointerEvents: "none", ...o }, 0);
    menuBtn.addEventListener("click", () => {
      menuOpen = !menuOpen;
      menuBtn.setAttribute("aria-expanded", String(menuOpen));
      if (menuOpen) { lenis?.stop(); openTl.restart(); }
      else closeTl.restart().eventCallback("onComplete", () => { lenis?.start(); closeTl.eventCallback("onComplete", null); });
    });
  }

  // Anchor: closes the menu if open, and travels over 1s with 1-(1-t)². Does not hide the header menu while traveling
  document.querySelectorAll(".js-anchor").forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href?.startsWith("#")) return;
      e.preventDefault();
      if (menuOpen) { menuOpen = false; lenis?.start(); closeTl.restart(); }
      if (!lenis) return document.querySelector(href)?.scrollIntoView();
      anchoring = true;
      lenis.scrollTo(href, { duration: 1, easing: (t) => 1 - (1 - t) ** 2, lock: true, onComplete: () => (anchoring = false) });
    });
  });
  document.querySelector(".js-back-to-top")?.addEventListener("click", (e) => {
    e.preventDefault();
    if (lenis) lenis.scrollTo(0, { duration: 2, easing: (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2) });
    else gsap.to(window, { scrollTo: 0, duration: reduce ? 0 : 2, ease: "power2.inOut" });
  });

  // Footer title: split the letters and scaleY 0→1 from top to bottom (1.5s power3.out, .05 random stagger)
  const footTitle = document.querySelector(".an-footer__title .an-mask");
  if (footTitle) {
    const chars = splitChars(footTitle);
    if (!reduce) {
      gsap.set(chars, { scaleY: 0, transformOrigin: "top center" });
      gsap.to(chars, { scaleY: 1, duration: 1.5, ease: "power3.out", stagger: { each: 0.05, from: "random" }, scrollTrigger: { trigger: footTitle, start: "top 80%" } });
    }
  }
  const footPixels = document.querySelector(".an-footer__pixels");
  if (footPixels) pixelBand(footPixels, { from: paint("--kf-ink"), to: paint("--kf-bg"), accent: paint("--an-cyan"), probs: [0, 0.1, 0.2, 0.3, 0.5, 0.9], end: "bottom bottom" });

  window.AN = { reduce, lenis, splitChars, pixelBand, paint };
})();
