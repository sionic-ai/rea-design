// On wide screens the page becomes a horizontal scroll — sections line up in a row (one screen tall) and vertical wheel and trackpad scrolling is received as Lenis horizontal scroll.
// On narrow screens or ones with too wide an aspect ratio (over 3:1), detach Lenis and return to a normal page with sections stacked vertically.
(() => {
  // Window scroll is single, so only one Lenis too. A second element quietly steps aside
  let owner = null;
  kfFx.register("side-scroll-page", (el, { options, reduce }) => {
    if (typeof Lenis !== "function" || (owner && owner !== el && owner.isConnected)) return;
    owner = el;
    const q = matchMedia(`(min-width:${+(options.min ?? 782)}px) and (max-aspect-ratio:${options.aspect || "3/1"})`);
    let lenis = null;
    const setH = () => el.style.setProperty("--fx-side-h", `${document.documentElement.clientHeight}px`);
    const on = () => {
      if (q.matches && !lenis) {
        el.classList.add("is-fx-side");
        setH();
        // With reduced motion, only the sliding is removed — turning vertical wheel into horizontal movement still has to happen for the page to move
        lenis = new Lenis({ autoRaf: true, orientation: "horizontal", ...(reduce ? { lerp: 1 } : { duration: +(options.dur ?? 1) }) });
        el.lenis = lenis;
      } else if (!q.matches && lenis) {
        lenis.destroy();
        lenis = null;
        delete el.lenis;
        el.classList.remove("is-fx-side");
      }
      el.dispatchEvent(new CustomEvent("fx:side", { detail: { side: !!lenis } }));
    };
    q.addEventListener("change", on);
    addEventListener("resize", setH);
    on();
    return () => {
      q.removeEventListener("change", on);
      removeEventListener("resize", setH);
      lenis?.destroy();
      delete el.lenis;
      el.classList.remove("is-fx-side");
      el.style.removeProperty("--fx-side-h");
      if (owner === el) owner = null;
    };
  });
})();
