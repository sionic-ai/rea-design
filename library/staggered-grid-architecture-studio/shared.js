// Common to all pages — lenis (lerp .1 · wheel .7), white curtain .5s, link transition (blurs out in .3s sine.inOut then navigates), white dot cursor (.45s power3, 80px over links · .15),
// Line rise (110% below inside a mask, power4.out, line .8s·.08 / word .6s·.06 / character .4s·.01), appear (transparent→2~3s, .06 stagger), phone menu (1.5s curtain)
(() => {
  const X = (window.X = {});
  const reduce = (X.reduce = matchMedia("(prefers-reduced-motion: reduce)").matches);
  const root = document.documentElement;
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  CustomEase.create("osmo", "M0,0 C0.625,0.05 0,1 1,1");
  CustomEase.create("osmoFade", "M0,0 C0.25,0.1 0.25,1 1,1");
  if (reduce) root.classList.add("no-motion");

  if (!reduce && window.Lenis) {
    X.lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.7, smoothWheel: true, syncTouch: false });
    X.lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => X.lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // White overlay
  const loader = document.querySelector(".x-loader");
  const ready = () => { dispatchEvent(new Event("x:ready")); ScrollTrigger.refresh(); };
  if (loader && !reduce) gsap.to(loader, { autoAlpha: 0, duration: 0.5, ease: "power2.inOut", onComplete() { loader.style.zIndex = "-1"; ready(); } });
  else { loader?.remove(); requestAnimationFrame(ready); }

  // Link flip
  document.querySelectorAll('a[href]:not([target="_blank"]):not([href^="#"]):not([href^="mailto:"]):not([href^="tel:"])').forEach((a) => {
    a.addEventListener("click", (e) => {
      if (e.shiftKey || e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      const href = a.getAttribute("href");
      if (reduce) return void (location.href = href);
      gsap.to("html", { duration: 0.3, autoAlpha: 0, ease: "sine.inOut", onComplete: () => (location.href = href) });
    });
  });
  addEventListener("pageshow", (e) => { if (e.persisted) gsap.set("html", { autoAlpha: 1 }); });

  // White dot cursor
  const cur = document.querySelector(".x-cursor"), dot = cur?.querySelector("i");
  if (cur && !matchMedia("(hover: none) and (pointer: coarse)").matches) {
    const OFF = -16, SMALL = 20, BIG = 80, HOT = 'a:hover, button:hover, [data-cursor]:hover, label:hover, summary:hover, input[type="submit"]:hover';
    gsap.set(cur, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
    gsap.set(dot, { width: SMALL, height: SMALL, opacity: 1 });
    let qx = gsap.quickTo(cur, "x", { duration: 0.45, ease: "power3" }), qy = gsap.quickTo(cur, "y", { duration: 0.45, ease: "power3" });
    let big = false, shown = false, fresh = true, mx = 0, my = 0;
    const at = (x, y, b) => ({ x: x + (b ? 0 : OFF), y: y + (b ? 0 : OFF) });
    const grow = (b) => {
      big = b;
      gsap.to(dot, { width: b ? BIG : SMALL, height: b ? BIG : SMALL, opacity: b ? 0.15 : 1, duration: 0.55, ease: "power3.out", overwrite: "auto" });
      const p = at(mx, my, b);
      if (!fresh) { qx(p.x); qy(p.y); } else gsap.set(cur, p);
    };
    addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      const hot = !!document.querySelector(HOT);
      if (hot !== big) grow(hot);
      const p = at(mx, my, big);
      if (fresh) { gsap.set(cur, p); qx = gsap.quickTo(cur, "x", { duration: 0.45, ease: "power3" }); qy = gsap.quickTo(cur, "y", { duration: 0.45, ease: "power3" }); fresh = false; }
      else { qx(p.x); qy(p.y); }
      if (!shown) { shown = true; gsap.to(cur, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }); }
    });
    const hide = () => { if (!shown) return; shown = false; fresh = true; grow(false); gsap.to(cur, { autoAlpha: 0, duration: 0.2, ease: "power2.out" }); };
    document.body.addEventListener("mouseleave", hide);
    addEventListener("blur", hide);
  }

  // Line rise
  const PRESET = { lines: { duration: 0.8, stagger: 0.08 }, words: { duration: 0.6, stagger: 0.06 }, chars: { duration: 0.4, stagger: 0.01 } };
  X.splitReveal = (el, { now = false } = {}) => {
    const kind = el.dataset.splitBy || "lines", p = PRESET[kind];
    // Like the original, text already inside the first screen goes at once without a trigger — if clamp(top 80%) sticks to 0 it won’t wake at the very top
    now = now || el.getBoundingClientRect().top < innerHeight;
    if (reduce) { el.classList.add("is-split"); return null; }
    let tween = null;
    SplitText.create(el, { type: kind === "lines" ? "lines" : `lines, ${kind}`, mask: "lines", autoSplit: true, linesClass: "line", wordsClass: "word", charsClass: "letter",
      onSplit(s) {
        el.classList.add("is-split");
        const parts = s[kind];
        tween = gsap.from(parts, { yPercent: 110, duration: +el.dataset.duration || p.duration, stagger: +el.dataset.stagger || p.stagger, ease: "power4.out", autoRound: false, force3D: true,
          ...(now ? {} : { scrollTrigger: { trigger: el, start: el.dataset.start || "clamp(top 80%)", once: true } }) });
        return tween;
      } });
    return tween;
  };
  // After the white curtain lifts (original loadingScreenAnimationComplete), split once all fonts have arrived, so it doesn’t run ahead behind the curtain
  const splitAll = () => document.fonts.ready.then(() => document.querySelectorAll("[data-split]:not([data-split-manual])").forEach((el) => X.splitReveal(el)));
  addEventListener("x:ready", splitAll, { once: true });

  // Reveal — children of a group appear in sequence once visible
  const groups = document.querySelectorAll("[data-reveal-group]");
  if (reduce) groups.forEach((g) => [...g.children].forEach((c) => c.classList.remove("is-reveal-pending")));
  else {
    const io = new IntersectionObserver((es) => {
      const fresh = es.filter((e) => e.isIntersecting).map((e) => e.target);
      fresh.forEach((el, i) => {
        io.unobserve(el);
        const g = el.closest("[data-reveal-group]");
        el.style.setProperty("--reveal-duration", (+(g.dataset.duration ?? 3)) + "s");
        el.style.setProperty("--reveal-delay", (i * (+(g.dataset.stagger ?? 0.06))) + "s");
        requestAnimationFrame(() => el.classList.add("is-revealed"));
        el.addEventListener("transitionend", function done(ev) { if (ev.target !== el || ev.propertyName !== "opacity") return; el.removeEventListener("transitionend", done); el.classList.remove("is-reveal-pending", "is-revealed"); }, { once: false });
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    groups.forEach((g) => [...g.children].filter((c) => !c.hasAttribute("data-reveal-exclude")).forEach((c) => {
      c.style.setProperty("--reveal-y", (g.dataset.distance ?? "30") + "px");
      c.classList.add("is-reveal-pending");
      io.observe(c);
    }));
  }

  // Phone menu
  const mnav = document.querySelector(".x-mnav"), opens = document.querySelectorAll("[data-menu-open]"), closes = document.querySelectorAll("[data-menu-close]");
  if (mnav) {
    const SHUT = "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)", OPEN = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
    gsap.set(mnav, { clipPath: SHUT, visibility: "hidden" });
    const set = (on) => {
      mnav.classList.toggle("is-opened", on);
      opens.forEach((b) => b.setAttribute("aria-expanded", on ? "true" : "false"));
      if (on) { X.lenis?.stop(); gsap.set(mnav, { visibility: "visible" }); gsap.to(mnav, { clipPath: OPEN, duration: reduce ? 0 : 1.5, ease: "osmo", overwrite: true }); }
      else { X.lenis?.start(); gsap.to(mnav, { clipPath: SHUT, duration: reduce ? 0 : 1.5, ease: "osmo", overwrite: true, onComplete: () => gsap.set(mnav, { visibility: "hidden" }) }); }
    };
    opens.forEach((b) => b.addEventListener("click", () => set(true)));
    closes.forEach((b) => b.addEventListener("click", () => set(false)));
    addEventListener("keydown", (e) => e.key === "Escape" && mnav.classList.contains("is-opened") && set(false));
  }
})();
