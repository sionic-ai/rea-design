// Shared by all pages — Lenis (lerp .08, driven by the GSAP clock), cursor (follows at .1 per step only over targets), scramble text, banner reveal, sound button, back to top
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const site = (window.dvSite = {});
  gsap.registerPlugin(ScrollTrigger);

  if (window.Lenis && !reduce) {
    const lenis = (site.lenis = new Lenis({ lerp: 0.08 }));
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  site.scrollTo = (target) => {
    if (site.lenis) site.lenis.scrollTo(target);
    else (typeof target === "number" ? scrollTo({ top: target, behavior: reduce ? "auto" : "smooth" }) : document.querySelector(target)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }));
  };

  // Scramble text: reveals steps characters at a time from the front, and unrevealed spots get random letters and digits (original AppearingText)
  const POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  site.scramble = (el, steps = 2, dur = 0.6) => {
    const v = el.querySelector(".dv-scramble__v");
    if (!v) return gsap.timeline();
    const text = el.dataset.text || v.textContent;
    el.dataset.text = text;
    if (reduce) { v.textContent = text; return gsap.timeline(); }
    const n = [...text].length, segs = Math.ceil(n / steps), each = dur / segs, chars = [...text];
    const tl = gsap.timeline({ paused: true });
    v.textContent = "";
    for (let i = 0; i < segs; i++) {
      const shown = i * steps, o = { v: 0 };
      tl.to(o, {
        v: 1, duration: each, ease: "none",
        onUpdate: () => { const left = Math.min(steps, n - shown); v.textContent = chars.slice(0, shown).join("") + Array.from({ length: left }, () => POOL[Math.floor(Math.random() * POOL.length)]).join(""); },
        onComplete: () => { v.textContent = text; },
      });
    }
    return tl;
  };
  site.scrambleAll = (root, steps, dur) => {
    const tl = gsap.timeline({ paused: true });
    root.querySelectorAll("[data-scramble]").forEach((el) => tl.add(site.scramble(el, steps, dur).play(), 0));
    return tl;
  };
  // Left empty until start
  document.querySelectorAll("[data-scramble] .dv-scramble__v").forEach((v) => { v.parentElement.dataset.text = v.textContent; if (!reduce) v.textContent = ""; });

  // Banner strip: on entering the screen, a navy background stretches from the left in .6s power2.out while the letters shuffle into place two at a time
  site.banner = (b) => {
    const bg = b.querySelector(".dv-banner__bg"), sc = b.querySelector("[data-scramble]");
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(bg, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.out" }, 0);
    if (sc) tl.add(() => site.scramble(sc, +(b.dataset.steps || 2), 0.6).play(), 0);
    return tl;
  };
  document.querySelectorAll("[data-banner]:not([data-banner-manual])").forEach((b) => {
    if (reduce) return;
    gsap.set(b.querySelector(".dv-banner__bg"), { scaleX: 0 });
    const tl = site.banner(b);
    ScrollTrigger.create({ trigger: b, start: "top bottom", once: true, onEnter: () => tl.play() });
  });

  // Cursor: appears at size 1 only over a target (data-cursor) and follows by .1 of the remaining distance per frame. On first entry it snaps to that spot
  const cursor = document.querySelector(".dv-cursor");
  if (cursor && matchMedia("(hover: hover) and (pointer: fine)").matches && !reduce) {
    document.documentElement.classList.add("dv-fine");
    const shapes = [...cursor.querySelectorAll("[data-shape]")];
    let tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty, on = false, domKind = null;
    addEventListener("mousemove", (e) => {
      tx = e.clientX; ty = e.clientY;
      domKind = e.target.closest?.("[data-cursor]")?.dataset.cursor || null;
    }, { passive: true });
    gsap.ticker.add(() => {
      x += (tx - x) * 0.1; y += (ty - y) * 0.1;
      // Above the 3D object (speaker) comes before DOM targets — first see the box the original cursor picked with a ray
      const kind = window.dvScene?.hover?.on ? "circle-black" : domKind;
      if (kind) { if (!on) { on = true; x = tx; y = ty; } } else if (on) { on = false; shapes.forEach((s) => s.classList.remove("is-on")); }
      cursor.style.transform = `translate(${x}px, ${y}px)`;
      cursor.classList.toggle("is-on", on);
      if (on) shapes.forEach((s) => s.classList.toggle("is-on", s.dataset.shape === kind));
    });
  }

  // Sound button: on/off shape only (original background music and click sound are not included)
  document.querySelectorAll(".dv-sound").forEach((b) => b.addEventListener("click", () => {
    const on = b.getAttribute("aria-pressed") !== "true";
    b.setAttribute("aria-pressed", String(on));
    b.setAttribute("aria-label", on ? "Sound Off" : "Sound On");
  }));
  document.querySelectorAll("[data-top]").forEach((b) => b.addEventListener("click", () => site.scrollTo(0)));

  // Header logo: shows after scrolling down even slightly
  const head = document.querySelector(".dv-head");
  const sync = () => head?.classList.toggle("is-scrolled", scrollY > 4);
  addEventListener("scroll", sync, { passive: true });
  sync();
})();
