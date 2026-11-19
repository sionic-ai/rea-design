// Watches scroll direction only — scrolling down more than threshold px at once sets the hide flag, scrolling up sets the return flag, and at the very top clears both. The motion itself comes from the transition in fx.css.
// When several things hide on the same tempo, like the burger button floating apart from the header row, attach each one separately (the tempo comes from the same scroll value)
(() => {
  kfFx.register("updown-header", (el, { options, scroller }) => {
    const th = +(options.threshold ?? 5);
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    const at = () => (scroller ? scroller.scrollTop : scrollY);
    let last = at(), busy = false;
    const check = () => {
      busy = false;
      const y = at();
      if (y <= 0) { el.classList.remove("fx-ud-hide", "fx-ud-back"); last = 0; return; }
      const d = y - last;
      if (Math.abs(d) < th) return;
      if (d > 0) { el.classList.add("fx-ud-hide"); el.classList.remove("fx-ud-back"); }
      else el.classList.add("fx-ud-back");
      last = y;
    };
    const onScroll = () => { if (!busy) { busy = true; requestAnimationFrame(check); } };
    const target = scroller || window;
    target.addEventListener("scroll", onScroll, { passive: true });
    check();
    return () => { target.removeEventListener("scroll", onScroll); el.classList.remove("fx-ud-hide", "fx-ud-back"); el.style.removeProperty("--fx-dur"); };
  });
})();
