// Map pin — while the section overlaps the screen it gets active, the pin shows and the soft glow behind the pin spreads from 0 over 3s. While staying on the map cell (hold) it repeats every 3s
(() => {
  kfFx.register("pin-pulse", (el, { options, reduce, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const pin = el.querySelector('[data-fx-part="pin"]');
    if (!pin) return;
    el.style.setProperty("--fx-dur", `${+(options.dur ?? 3)}s`);
    if (options.loop === "always") el.classList.add("fx-pulse-loop");
    if (reduce) { el.classList.add("is-active"); return () => el.classList.remove("is-active", "fx-pulse-loop"); }
    const st = ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start: options.start || "top-=10%", end: options.end || "bottom-=10%", toggleClass: "is-active" });
    return () => { st.kill(); el.classList.remove("is-active", "fx-pulse-loop"); el.style.removeProperty("--fx-dur"); };
  });
})();
