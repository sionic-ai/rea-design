// Tilt = Base × (1 − scroll progress × .5) × (1 − interaction) — scroll and interaction don’t override each other, they multiply
(() => {
  kfFx.register("tilt-settle", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      const ease = window.CustomEase ? CustomEase.create("fx-smooth", "0.65,0,0.35,1") : "power2.inOut";
      if (options.origin) el.style.setProperty("--fx-origin", options.origin);
      const tilt = +(options.tilt ?? 12);
      const base = () => (innerWidth >= 1024 ? tilt : tilt / 2);
      const s = { k: 0, scroll: 0 };
      const set = () => gsap.set(el, { rotate: base() * (1 - s.scroll * 0.5) * (1 - s.k) });
      ScrollTrigger.create({ scroller, trigger: el, start: "top bottom", end: "bottom bottom", onUpdate: (st) => { s.scroll = st.progress; set(); } });
      const settle = (on) => gsap.to(s, { k: on ? 1 : 0, duration: reduce ? 0 : 0.6, ease, onUpdate: set });
      el.addEventListener("mouseenter", () => settle(true), { signal });
      el.addEventListener("mouseleave", () => !el.contains(document.activeElement) && settle(false), { signal });
      el.addEventListener("focusin", () => settle(true), { signal });
      el.addEventListener("focusout", () => setTimeout(() => !el.matches(":hover") && !el.contains(document.activeElement) && settle(false), 0), { signal });
      set();
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
