// Home page — hero copy panel pin, about grid alignment, product background flow, vertical sentence wipe, and contact field check.
(() => {
  const isPc = () => document.body.clientWidth > 767;
  const rpx = (x) => (x * document.body.clientWidth) / (isPc() ? 1440 : 375);
  const hero = document.querySelector(".sc-hero");
  const meta = hero.querySelector(".sc-hero__meta");
  const tag = meta.querySelector(".sc-tagline");
  const about = document.querySelector(".sc-about");
  const label = about.querySelector(".sc-about__label");

  // Even if hero height differs per screen, make the intro grid lock onto the background grid lines — set top margin by counting cells as in the original
  const fit = () => {
    const c = isPc() ? rpx(275) : rpx(118);
    const hh = isPc() ? Math.max(rpx(1620), hero.offsetHeight) : Math.min(rpx(630), hero.offsetHeight);
    const lead = isPc() ? rpx(417) : rpx(312);
    const o = Math.floor((hh + lead) / c);
    const pad = o * c + (o - 1) - hh + (isPc() ? rpx(106) : rpx(52));
    about.style.paddingTop = pad + "px";
    label.style.top = pad - rpx(92) + "px";
  };
  fit();
  addEventListener("resize", fit);

  const mm = gsap.matchMedia();
  mm.add({ pc: "(min-width: 768px) and (prefers-reduced-motion: no-preference)", sp: "(max-width: 767px) and (prefers-reduced-motion: no-preference)" }, (ctx) => {
    if (ctx.conditions.pc) {
      // .25s after the cover lifts, pins the copy panel until the end of the Hero
      addEventListener("sc:active", () => setTimeout(() => ScrollTrigger.create({ trigger: meta, start: "top top", end: () => "top+=" + (hero.offsetHeight - meta.offsetHeight) + " top", pin: true, pinType: window.scSmoother ? "transform" : "fixed", pinSpacing: false }), 250), { once: true });
    }
    // The product cell background pattern drifts ±400px while the cell passes through the screen
    document.querySelectorAll(".sc-psec").forEach((s) => ScrollTrigger.create({ trigger: s, start: "top bottom", end: "bottom top", onUpdate: (t) => (s.style.backgroundPosition = "center " + rpx(400 * (2 * t.progress - 1)) + "px") }));
    // Product header and swatch background photo go from -40% to 40%
    document.querySelectorAll(".sc-pintro__bg, .sc-sample__bg").forEach((bg) => {
      const pic = bg.firstElementChild;
      gsap.fromTo(pic, { yPercent: -40 }, { yPercent: 40, ease: "none", scrollTrigger: { trigger: bg, start: () => "top top+=" + innerHeight, end: () => "top+=" + innerHeight + " top", scrub: true, invalidateOnRefresh: true } });
    });
    document.querySelectorAll(".sc-vwipe").forEach((t) => ScrollTrigger.create({ trigger: t, start: () => "top bottom-=" + rpx(100), once: true, onEnter: () => t.classList.add("is-show") }));
  });
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) document.querySelectorAll(".sc-vwipe").forEach((t) => t.classList.add("is-show"));
  addEventListener("sc:active", () => setTimeout(() => tag?.classList.add("is-show"), 350), { once: true });

  // Contact — when leaving a field empty, show a red underline and a hint
  const form = document.querySelector(".sc-form");
  const need = [["cf-name", "name"], ["cf-mail", "mail"], ["cf-body", "body"]];
  const check = (id) => { const f = document.getElementById(id); const bad = !f.value || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value)); f.closest(".sc-form__part").classList.toggle("is-error", bad); return !bad; };
  need.forEach(([id]) => document.getElementById(id).addEventListener("blur", () => check(id)));
  form.addEventListener("submit", (e) => { e.preventDefault(); need.map(([id]) => check(id)); });
})();
