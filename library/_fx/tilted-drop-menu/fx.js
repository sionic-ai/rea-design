// Open and close as one timeline — close is a rewind, so closing mid-open returns from that spot
(() => {
  kfFx.register("tilted-drop-menu", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      const btn = el.querySelector("[data-fx-part=toggle]"), panel = el.querySelector("[data-fx-part=panel]");
      if (!btn || !panel) return;
      if (options.tilt) el.style.setProperty("--fx-tilt", options.tilt + "deg");
      btn.setAttribute("aria-expanded", "false");
      const drop = +(options.drop ?? -110), dur = +(options.dur ?? 0.6), ease = kfFx.ease(options.ease || "power3.out", "power3.out");
      const linkFrom = +(options.linkFrom ?? 70), linkAt = +(options.linkAt ?? 0.15), rewind = +(options.rewind ?? 1.6);
      const tl = gsap.timeline({ paused: true })
        .set(panel, { visibility: "visible" })
        .fromTo(panel, { translate: `0 ${drop}%` }, { translate: "0 0%", duration: dur, ease })
        .from(panel.querySelectorAll("a"), { yPercent: linkFrom, ...(options.linkFade === "off" ? {} : { autoAlpha: 0 }), stagger: 0.1, duration: 0.5, ease: "power2.inOut" }, `<${linkAt >= 0 ? "+" : "-"}=${Math.abs(linkAt)}`);
      const set = (open) => {
        btn.setAttribute("aria-expanded", open);
        if (reduce) return tl.progress(open ? 1 : 0);
        open ? tl.timeScale(1).play() : tl.timeScale(rewind).reverse();
      };
      btn.addEventListener("click", () => set(btn.getAttribute("aria-expanded") !== "true"), { signal });
      panel.addEventListener("click", (e) => e.target.closest("a") && set(false), { signal });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
