(() => {
  // Original (Framer animation-nav variant Text ↔ Japette): in the header’s center cell, a sentence and a logo sit in a vertical strip 83px apart,
  // When the top edge of the designated section (scrollSection) touches the top of the screen, the band moves up one step and the logo stands, and scrolling back above it brings the sentence back
  kfFx.register("phrase-logo-swap", (el, { options, scroller }) => {
    const phrase = el.querySelector('[data-fx-part="phrase"]'), logo = el.querySelector('[data-fx-part="logo"]');
    if (!phrase || !logo) return;
    const box = scroller && scroller !== window ? scroller : null;
    const at = +(options.at ?? 0);
    const set = (on) => el.classList.toggle("is-fx-logo", on);
    if (options.state === "logo") { set(true); return () => set(false); }
    if (!options.target) { set(false); return; }
    let raf = 0;
    const check = () => {
      raf = 0;
      const t = document.querySelector(options.target);
      if (!t) return;
      const top = t.getBoundingClientRect().top - (box ? box.getBoundingClientRect().top : 0);
      set(top <= at);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(check); };
    const target = box || window;
    target.addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    el.classList.add("is-fx-instant");
    check();
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove("is-fx-instant")));
    return () => { target.removeEventListener("scroll", on); removeEventListener("resize", on); cancelAnimationFrame(raf); el.classList.remove("is-fx-logo", "is-fx-instant"); };
  });
})();
