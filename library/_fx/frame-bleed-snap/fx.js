// The original toggles one class at a 50px scroll threshold and a CSS transition handles the 1.6s — it always expands for the same length regardless of scroll speed
(() => {
  kfFx.register("frame-bleed-snap", (el, { options, scroller }) => {
    const at = +(options.at ?? 50);
    const src = scroller || window;
    const top = () => (scroller ? scroller.scrollTop : window.scrollY);
    let on = null;
    const check = () => {
      const now = top() > at;
      if (now === on) return;
      on = now;
      el.classList.toggle("fx-bleed", now);
      el.dispatchEvent(new CustomEvent("fx:bleed", { detail: { on: now } }));
    };
    src.addEventListener("scroll", check, { passive: true });
    check();
    return () => { src.removeEventListener("scroll", check); el.classList.remove("fx-bleed"); };
  });
})();
