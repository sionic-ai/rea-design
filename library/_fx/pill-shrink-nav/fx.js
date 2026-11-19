// Once the fixed header row scrolls down past at px, it shrinks from full width into a centered pill (width) and the margin changes from --fx-pad → --fx-pad-docked,
// The backdrop panel (bg) comes down from the top with rounded corners and gets painted (clip-path inset). On return it unfolds along the same path and the backdrop clears back times faster.
// Color changes (logo · buttons) are handled by whoever reads the is-docked flag and the fx:dock event — in the original the color depends on whether the section under the header is light or dark.
(() => {
  kfFx.register("pill-shrink-nav", (el, { options, reduce }) => {
    const bg = el.querySelector('[data-fx-part="bg"]');
    const at = +(options.at ?? 50);
    const width = options.width || "30rem";
    const min = +(options.min ?? 992);
    const dur = reduce ? 0 : +(options.dur ?? 1);
    const back = +(options.back ?? 2) || 2;
    const round = options.round || "5rem";
    const ease = kfFx.ease(options.ease || "0.65,0.05,0,1", "expo.inOut");
    const HIDE = "inset(0% 0% 100% 0% round 0rem)", SHOW = `inset(0% 0% 0% 0% round ${round})`;
    const four = (v) => {
      const p = String(v || "").trim().split(/\s+/).filter(Boolean);
      if (!p.length) return null;
      const [a, b = a, c = a, d = b] = p;
      return { paddingTop: a, paddingRight: b, paddingBottom: c, paddingLeft: d };
    };
    const padOf = (docked) => four(getComputedStyle(el).getPropertyValue(docked ? "--fx-pad-docked" : "--fx-pad"));
    const wide = () => innerWidth >= min;

    let bgTl = null;
    if (bg) {
      gsap.set(bg, { clipPath: HIDE });
      bgTl = gsap.timeline({ paused: true }).to(bg, { clipPath: SHOW, duration: dur, ease });
    }
    let docked = null;
    const apply = (next, now) => {
      const vars = { maxWidth: next && wide() ? width : "100%", ...(padOf(next) || {}) };
      if (now || !dur) gsap.set(el, vars);
      else gsap.to(el, { ...vars, duration: dur, ease, overwrite: "auto" });
      if (bgTl) {
        if (now || !dur) bgTl.progress(next ? 1 : 0).pause();
        else if (next) bgTl.timeScale(1).play();
        else bgTl.timeScale(back).reverse();
      }
      el.classList.toggle("is-docked", next);
      el.dispatchEvent(new CustomEvent("fx:dock", { bubbles: true, detail: { docked: next, now: !!now } }));
    };
    const check = (now) => {
      const next = scrollY > at;
      if (next === docked && !now) return;
      docked = next;
      apply(next, now);
    };
    gsap.set(el, { marginLeft: "auto", marginRight: "auto" });
    check(true);
    const ac = new AbortController();
    addEventListener("scroll", () => check(false), { passive: true, signal: ac.signal });
    // Redo only when the width tier (wide ↔ narrow) changes — wait .15s and batch, like the original
    const mode = () => (innerWidth >= min ? 2 : innerWidth >= 768 ? 1 : 0);
    let was = mode(), timer = 0;
    addEventListener("resize", () => {
      clearTimeout(timer);
      timer = setTimeout(() => { const m = mode(); if (m !== was) { was = m; check(true); } }, 150);
    }, { signal: ac.signal });
    return () => {
      ac.abort();
      clearTimeout(timer);
      bgTl?.kill();
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "maxWidth,marginLeft,marginRight,paddingTop,paddingRight,paddingBottom,paddingLeft" });
      if (bg) gsap.set(bg, { clearProps: "clipPath" });
      el.classList.remove("is-docked");
    };
  });
})();
