// Common to both pages: Lenis (1.2.3 like the original, same options), Webflow IX2 curves and checks, phone menu (Webflow default .4s ease), line raising.
// Original motion is Webflow IX2, so the values were carried over as they are from ixData (actionLists·events) in the original webflow.schunk.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const X = (window.X = { reduce });

  // IX2 curve name → GSAP. Curves without a name ("") is a straight line
  X.ease = {
    ease: CustomEase.create("wf-ease", "0.25,0.1,0.25,1"),
    easeIn: CustomEase.create("wf-ease-in", "0.42,0,1,1"),
    easeOut: CustomEase.create("wf-ease-out", "0,0,0.58,1"),
    inCubic: "power2.in",
    outCubic: "power2.out",
    outQuad: "power1.out",
    outQuart: "power3.out",
  };
  X.rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);

  if (!reduce && window.Lenis) {
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9, gestureOrientation: "vertical", normalizeWheel: false, smoothTouch: false });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    X.lenis = lenis;
  }

  // Skin variable colors are given as rgb — IX2 blends rgb components linearly. Passing oklch means GSAP can’t read it, and CSS transitions blend in oklab so the midtones differ.
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  X.rgb = (cssColor) => {
    const el = document.createElement("i");
    el.style.color = cssColor;
    document.body.appendChild(el);
    const c = getComputedStyle(el).color;
    el.remove();
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = c;
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  };

  // IX2 ‹When visible›: with offset o% the element is visible while its top is (100−o)% above the screen and its bottom is o% below it
  X.inView = (el, o, on, off) =>
    ScrollTrigger.create({
      trigger: el, start: `top ${100 - o}%`, end: `bottom ${o}%`,
      onEnter: on, onEnterBack: on, onLeave: off, onLeaveBack: off,
    });

  // Once only: where already visible it is called immediately during creation, so detach using the callback’s self rather than the returned value.
  X.inViewOnce = (el, o, fn) => {
    let done = false;
    return X.inView(el, o, (self) => { if (done) return; done = true; fn(); requestAnimationFrame(() => self.kill()); });
  };

  // IX2 slideInBottom: once on first entry, from 100px below and transparent in 1s outQuart (power3.out). data-slide="Offset delay"
  X.slideIn = (root = document) => {
    root.querySelectorAll("[data-slide]").forEach((el) => {
      const [o, delay] = el.dataset.slide.split(" ").map(Number);
      if (reduce) return;
      gsap.set(el, { opacity: 0, y: 100 });
      X.inViewOnce(el, o, () => gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: X.ease.outQuart, delay }));
    });
  };

  // IX2 ”While scrolling”: from when the element touches the top of the screen until it has fully passed is 0→1 (element taller than the screen),
  // The value follows (1 − smoothing) of the remaining distance each frame. tl is a keyframe timeline of length 100
  X.ixScroll = (el, tl, smoothing) => {
    const k = Math.max(1 - smoothing, 0.01);
    const raw = () => {
      const r = el.getBoundingClientRect(), vh = document.documentElement.clientHeight;
      const c = r.top + Math.min(r.height, vh);
      const u = Math.min(vh + (r.top + r.height - c), document.documentElement.scrollHeight);
      return Math.min(Math.max(0, vh - c), u) / u;
    };
    let p = raw();
    tl.pause().progress(p);
    const tick = () => {
      const t = raw();
      if (Math.abs(t - p) < 1e-5) return;
      p += (t - p) * k;
      tl.progress(p);
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  };

  // Phone menu: Webflow default — the panel drops from above by (menu bar height + panel height) in .4s ease, and closing goes back up the same way
  const menu = document.querySelector("[data-nav-menu]");
  const open = document.querySelector("[data-nav-open]");
  const close = document.querySelector("[data-nav-close]");
  if (menu && open) {
    const nav = menu.closest(".x-nav");
    const away = () => -(nav.offsetHeight + menu.offsetHeight);
    const set = (on) => {
      if (on) menu.classList.add("is-open");
      gsap.fromTo(menu, { y: on ? away() : 0 }, {
        y: on ? 0 : away(), duration: reduce ? 0 : 0.4, ease: X.ease.ease,
        onComplete: () => { if (!on) { menu.classList.remove("is-open"); gsap.set(menu, { clearProps: "transform" }); } },
      });
      X.lenis && (on ? X.lenis.stop() : X.lenis.start());
    };
    open.addEventListener("click", () => set(true));
    close.addEventListener("click", () => set(false));
    menu.querySelectorAll("a[href^='#']").forEach((a) => a.addEventListener("click", () => menu.classList.contains("is-open") && set(false)));
    matchMedia("(max-width: 479px)").addEventListener("change", (e) => { if (!e.matches) { menu.classList.remove("is-open"); gsap.set(menu, { clearProps: "all" }); } });
  }

  // On Home the sections aren’t in the document until the entrance is clicked, so positions can’t be measured — index.js calls this after the click
  if (!document.body.classList.contains("is-gated")) X.slideIn();
})();
