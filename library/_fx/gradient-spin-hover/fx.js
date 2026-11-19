(() => {
  // Original (a brand landing page arrow cell and contact button): when the pointer enters, a logo-color gradient panel turns on in .3s and from .2s later spins endlessly, one turn every 4 seconds.
  // Each entry and exit turns only the pattern another 60° (1.2s relax). With look: always it stays on and turns only while the pointer is present (Contact button)
  kfFx.register("gradient-spin-hover", (el, { options, reduce, hover }) => {
    let spin = el.querySelector('[data-fx-part="spin"]');
    const made = !spin;
    if (made) { spin = document.createElement("span"); spin.setAttribute("data-fx-part", "spin"); spin.setAttribute("aria-hidden", "true"); el.append(spin); }
    const size = () => { const r = el.getBoundingClientRect(); spin.style.setProperty("--fx-w", `${r.width}px`); spin.style.setProperty("--fx-h", `${r.height}px`); };
    size();
    const ro = new ResizeObserver(size); ro.observe(el);
    const turn = +(options.turn ?? 4), kick = +(options.kick ?? 60), ease = kfFx.ease(options.ease || "0.4,0.2,0.12,0.96", "power3.out");
    let loop = null, k = 0;
    const kickTo = () => { if (!reduce && window.gsap) { k += kick; gsap.to(spin, { "--fx-kick": `${k}deg`, duration: 1.2, ease }); } };
    const enter = () => {
      el.classList.add("is-fx-on"); spin.classList.add("is-fx-on");
      if (reduce || !window.gsap) return;
      loop?.kill();
      loop = gsap.to(spin, { rotate: "+=360", duration: turn, delay: 0.2, ease: "none", repeat: -1 });
      kickTo();
    };
    const leave = () => { el.classList.remove("is-fx-on"); spin.classList.remove("is-fx-on"); loop?.kill(); loop = null; kickTo(); };
    const host = el.closest("a, button") || el;
    const focus = () => { if (host.matches(":focus-visible")) enter(); };
    if (hover) { host.addEventListener("mouseenter", enter); host.addEventListener("mouseleave", leave); }
    host.addEventListener("focus", focus); host.addEventListener("blur", leave);
    return () => {
      host.removeEventListener("mouseenter", enter); host.removeEventListener("mouseleave", leave); host.removeEventListener("focus", focus); host.removeEventListener("blur", leave);
      ro.disconnect(); loop?.kill(); el.classList.remove("is-fx-on");
      if (made) spin.remove(); else { spin.classList.remove("is-fx-on"); window.gsap && gsap.set(spin, { clearProps: "transform,--fx-kick" }); }
    };
  });
})();
