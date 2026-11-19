(() => {
  // On wide screens, once the document scrolls past a set distance (default 1000px), the header sticks to the top of the screen and drops in from above in .35s.
  // Coming back above that, it is sent up over .35s and then returned to its flow position. On narrow screens (default under 961px) it is not pinned
  kfFx.register("dock-down-header", (el, { options, reduce, scroller }) => {
    const after = +(options.after ?? 1000), dur = +(options.dur ?? 0.35) * 1000, wide = +(options.wide ?? 961);
    // The rise duration can be set separately (brand is .5s coming down, .2s going up)
    const out = +(options.out ?? dur / 1000) * 1000;
    const view = scroller || window;
    const top = () => (scroller ? scroller.scrollTop : scrollY);
    let timer = 0;
    const set = (cls, on) => el.classList.toggle(cls, on);
    // round: on — the header is attached to the screen from the start, and each time the type changes it slides up out (out) in its current type, then comes down in the new type (dur).
    // If scroll changes again during the retreat, only fix how it comes back down — Brand header (original #header: top 1s round trip, fix-head added and removed at transitionend)
    const round = options.round === "on";
    let pend = null;
    const swap = () => {
      const want = top() > after;
      if (pend !== null) { pend = want; return; }
      if (want === el.classList.contains("is-docked")) return;
      clearTimeout(timer);
      if (reduce) { set("is-docked", want); return; }
      pend = want;
      set("is-dock-in", false);
      set("is-dock-out", true);
      timer = setTimeout(() => {
        set("is-dock-out", false);
        set("is-docked", pend);
        pend = null;
        set("is-dock-in", true);
        timer = setTimeout(() => { set("is-dock-in", false); swap(); }, dur);
      }, out);
    };
    const update = () => {
      if (innerWidth < wide) { clearTimeout(timer); pend = null; el.classList.remove("is-docked", "is-dock-in", "is-dock-out"); return; }
      if (round) { swap(); return; }
      const docked = el.classList.contains("is-docked") && !el.classList.contains("is-dock-out");
      if (top() > after && !docked) {
        clearTimeout(timer);
        set("is-dock-out", false);
        set("is-docked", true);
        if (reduce || !dur) return;
        requestAnimationFrame(() => set("is-dock-in", true));
        timer = setTimeout(() => set("is-dock-in", false), dur);
      } else if (top() <= after && docked) {
        clearTimeout(timer);
        set("is-dock-in", false);
        if (reduce || !out) { set("is-docked", false); return; }
        set("is-dock-out", true);
        timer = setTimeout(() => { set("is-docked", false); set("is-dock-out", false); }, out);
      }
    };
    el.style.setProperty("--fx-dur", dur / 1000 + "s");
    el.style.setProperty("--fx-dur-out", out / 1000 + "s");
    view.addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
    return () => { clearTimeout(timer); view.removeEventListener("scroll", update); removeEventListener("resize", update); el.classList.remove("is-docked", "is-dock-in", "is-dock-out"); el.style.removeProperty("--fx-dur"); el.style.removeProperty("--fx-dur-out"); };
  });
})();
