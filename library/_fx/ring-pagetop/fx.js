// The letters around the circle are drawn by the part (textPath id numbered per element so they don’t collide). Show·hide is measured as in the original with a 30ms scroll throttle + one 100ms delayed call.
(() => {
  let n = 0;
  kfFx.register("ring-pagetop", (el, { options, scroller }) => {
    let ring = el.querySelector(':scope > [data-fx-part="ring"]');
    const made = !ring;
    if (made) {
      const id = `fx-pt-path-${++n}`;
      const word = String(options.text || "PAGETOP");
      const rep = Math.max(1, Math.round(+(options.repeat ?? 3)) || 1);
      ring = document.createElement("span");
      ring.dataset.fxPart = "ring";
      ring.setAttribute("aria-hidden", "true");
      ring.innerHTML = `<svg viewBox="0 0 100 100"><defs><path id="${id}" d="M50 50m-40 0a40 40 0 1 1 80 0a40 40 0 1 1-80 0"/></defs><text><textPath href="#${id}" textLength="248" lengthAdjust="spacing">${Array(rep).fill(word).join(" ")} </textPath></text></svg>`;
      el.prepend(ring);
    }
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    const box = scroller || document.scrollingElement;
    const end = options.after ? document.querySelector(options.after) : el.closest("footer") || document.querySelector("footer");
    const check = () => {
      const y = Math.round(scroller ? scroller.scrollTop : scrollY);
      const view = scroller ? scroller.clientHeight : innerHeight;
      const max = box.scrollHeight - view - (end ? end.offsetHeight : 0);
      el.classList.toggle("fx-on", y > 0);
      el.classList.toggle("fx-end", !!end && max <= y);
    };
    let last = 0, late = 0;
    const onScroll = () => {
      const t = performance.now();
      if (t - last >= 30) { last = t; check(); }
      clearTimeout(late);
      late = setTimeout(check, 100);
    };
    const target = scroller || window;
    target.addEventListener("scroll", onScroll, { passive: true });
    const onClick = (e) => {
      e.preventDefault();
      (scroller || window).scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    };
    el.addEventListener("click", onClick);
    check();
    return () => {
      target.removeEventListener("scroll", onScroll);
      el.removeEventListener("click", onClick);
      clearTimeout(late);
      el.classList.remove("fx-on", "fx-end");
      if (made) ring.remove();
    };
  });
})();
