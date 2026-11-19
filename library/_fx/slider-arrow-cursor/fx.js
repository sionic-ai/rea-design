// The original follows in gsap.ticker with 1 − (1 − speed)^deltaRatio, but speed is 1 so it is always in place — attached immediately with no lag
(() => {
  kfFx.register("slider-arrow-cursor", (el, { options, hover }) => {
    if (!hover) return;
    const size = +(options.size || 70);
    const byArea = options.side === "area";
    const dot = document.createElement("div");
    dot.className = "fx-sac";
    dot.setAttribute("aria-hidden", "true");
    dot.style.setProperty("--fx-size", size + "px");
    dot.innerHTML = '<span class="fx-sac__bg"></span><svg class="fx-sac__arw" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 8h11M9 3.5 13.5 8 9 12.5"/></svg>';
    document.body.append(dot);
    const move = (e) => {
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      const r = el.getBoundingClientRect();
      const mid = byArea ? r.left + r.width / 2 : innerWidth / 2;
      dot.classList.toggle("is-left", e.clientX <= mid);
    };
    const enter = (e) => { move(e); dot.classList.add("is-show"); };
    const leave = () => dot.classList.remove("is-show");
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    addEventListener("pointermove", move, { passive: true });
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      removeEventListener("pointermove", move);
      dot.remove();
    };
  });
})();
