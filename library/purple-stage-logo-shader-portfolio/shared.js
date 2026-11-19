// Shared — the header’s local time (every second), the phone menu button, and the original Framer ”Appear” (rises from below with opacity, tween .5s cubic-bezier(.44,0,.56,1))
(() => {
  const root = document.documentElement;

  // Time follows the city time zone (data-tz) — the original shows City time as HH:MM
  const clocks = document.querySelectorAll("[data-clock]");
  const tick = () => clocks.forEach((el) => {
    try {
      el.textContent = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: el.dataset.tz || undefined }).format(new Date());
    } catch { el.textContent = "00:00"; }
  });
  if (clocks.length) { tick(); setInterval(tick, 1000); }

  const btn = document.querySelector(".gu-menu-btn");
  if (btn) {
    btn.addEventListener("click", () => {
      const open = root.classList.toggle("is-menu");
      btn.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape" || !root.classList.contains("is-menu")) return;
      root.classList.remove("is-menu");
      btn.setAttribute("aria-expanded", "false");
    });
  }

  // Contact links recede to .6 after the hand leaves (a Framer variant in the original) — they darken again when raised
  document.querySelectorAll(".gu-contact a").forEach((a) => a.addEventListener("pointerleave", () => a.classList.add("is-left")));

  if (!window.gsap) return;
  const ease = window.CustomEase ? CustomEase.create("gu-tween", "0.44,0,0.56,1") : "sine.inOut";
  // Bakes a Framer spring into a curve — length and bounce (bounce .2, .4s) use damping ratio .8 · natural frequency 22.5rad/s, stiffness and damping (400·60) use two overdamped roots
  if (window.CustomEase) {
    const bake = (name, f, dur) => CustomEase.create(name, `M0,0 ${Array.from({ length: 40 }, (_, i) => `L${((i + 1) / 40).toFixed(4)},${(i === 39 ? 1 : f(((i + 1) / 40) * dur)).toFixed(4)}`).join(" ")}`);
    const z = 0.8, w0 = 22.5, wd = w0 * Math.sqrt(1 - z * z);
    bake("gu-spring", (t) => 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t)), 0.45);
    const r1 = -30 + Math.sqrt(500), r2 = -30 - Math.sqrt(500);
    bake("gu-stiff", (t) => 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1), 0.9);
    // Word appear: stiffness 400 · damping 30 · mass 1 → damping ratio .75 · natural frequency 20rad/s
    const zw = 0.75, ww = 20, wdw = ww * Math.sqrt(1 - zw * zw);
    bake("gu-word", (t) => 1 - Math.exp(-zw * ww * t) * (Math.cos(wdw * t) + (zw * ww / wdw) * Math.sin(wdw * t)), 0.6);
  }
  const EASES = { spring: ["gu-spring", 0.45], word: ["gu-word", 0.6] };
  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
    if (!ctx.conditions.motion) return;
    // Things in the hero run right on load, those below once when they enter the screen
    document.querySelectorAll("[data-appear]").forEach((el) => {
      const o = Object.fromEntries(el.dataset.appear.split(";").map((s) => s.split(":").map((v) => v.trim())).filter((p) => p[0]));
      const spring = window.CustomEase && EASES[o.ease];
      const from = { opacity: +(o.opacity ?? 0.001) };
      const to = { opacity: 1, duration: spring ? spring[1] : +(o.dur ?? 0.5), delay: +(o.delay ?? 0), ease: spring ? spring[0] : ease };
      if (el.getBoundingClientRect().top < innerHeight) gsap.fromTo(el, from, to);
      else gsap.fromTo(el, from, { ...to, scrollTrigger: window.ScrollTrigger ? { trigger: el, start: "top bottom", once: true } : undefined });
    });
  });
})();
