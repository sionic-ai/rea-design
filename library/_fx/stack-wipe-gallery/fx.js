// Stacked photo panels stay stuck to the screen, and as you scroll down, from the top panel its bottom edge rolls up (clip-path inset bottom 0→100%) revealing the next panel.
// Section height = Number of panels × screen height, inner panels stick with sticky. On entering and leaving, a dark curtain lifts and covers in .1 steps (original toFixed(1))
(() => {
  kfFx.register("stack-wipe-gallery", (el, { options, reduce, scroller }) => {
    const narrow = +(options.narrow ?? 768);
    const pick = () => {
      const shots = [...el.querySelectorAll('[data-fx-part="shot"]')];
      return innerWidth <= narrow && shots.length ? shots : [...el.querySelectorAll('[data-fx-part="item"]')];
    };
    const items = pick();
    if (items.length < 2) return;
    const overlay = el.querySelector('[data-fx-part="overlay"]');
    const lag = +(options.lag ?? 0.5);
    const root = document.documentElement;
    const vh = () => (scroller ? scroller.clientHeight : innerHeight);
    const size = () => { el.style.height = `${items.length * vh()}px`; };
    size();
    items.forEach((it, i) => { it.style.zIndex = String(items.length - i); });
    gsap.set(items, { clipPath: "inset(0% 0% 0% 0%)" });
    const step = (p) => Math.round(p * 10) / 10;
    const inside = (on) => { root.classList.toggle("fx-stack-wipe-inside", on); el.dispatchEvent(new CustomEvent("fx:inside", { bubbles: true, detail: { on } })); };
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, scroller, start: "top top", end: "bottom bottom", scrub: lag, invalidateOnRefresh: true } });
      items.slice(0, -1).forEach((it) => tl.to(it, { clipPath: "inset(0% 0% 100% 0%)", duration: 1, ease: "none" }, ">"));
      ScrollTrigger.create({ trigger: el, scroller, start: "top 20%", end: "top top", scrub: true,
        onUpdate: (s) => { if (overlay) overlay.style.opacity = String(1 - step(s.progress)); },
        onEnter: () => inside(true), onLeaveBack: () => inside(false) });
      ScrollTrigger.create({ trigger: el, scroller, start: "bottom+=2px bottom", end: "bottom 80%", scrub: true,
        onUpdate: (s) => { if (overlay) overlay.style.opacity = String(step(s.progress)); },
        onLeave: () => inside(false), onEnterBack: () => inside(true) });
    });
    if (reduce && overlay) overlay.style.opacity = "0";
    // Section height follows only the screen height — re-measured only when the window size changes (even if inner images arrive late, the panel height stays 100vh)
    const onResize = () => { size(); ScrollTrigger.refresh(); };
    addEventListener("resize", onResize);
    return () => {
      removeEventListener("resize", onResize);
      mm.revert();
      inside(false);
      el.style.height = "";
      items.forEach((it) => { it.style.zIndex = ""; });
      gsap.set(items, { clearProps: "clipPath" });
      if (overlay) overlay.style.opacity = "";
    };
  });
})();
