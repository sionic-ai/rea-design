(() => {
  kfFx.register("corner-blob-menu", (el, { options, reduce }) => {
    const toggle = el.querySelector("[data-fx-part=toggle]");
    if (!toggle) return;
    const bg = el.querySelector("[data-fx-part=bg]"), panel = el.querySelector("[data-fx-part=panel]");
    const dur = +(options.dur ?? 0.5), close = +(options.close ?? 0.9), delay = +(options.delay ?? 0.4);
    const set = (open) => {
      el.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      if (reduce) return;
      gsap.killTweensOf([bg, panel].filter(Boolean));
      if (open) {
        if (bg) gsap.to(bg, { scale: 1, x: 0, y: 0, xPercent: 0, yPercent: 0, duration: dur, ease: "power2.out" });
        if (panel) gsap.to(panel, { autoAlpha: 1, delay });
      } else {
        if (panel) gsap.to(panel, { autoAlpha: 0 });
        if (bg) gsap.to(bg, { scaleX: 0.8, scaleY: 0.6, x: "100%", y: "-100%", duration: close, ease: "power2.out", delay: 0.2 });
      }
    };
    const onClick = () => set(!el.classList.contains("is-open"));
    const onKey = (e) => { if (e.key === "Escape" && el.classList.contains("is-open")) set(false); };
    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", onClick);
    addEventListener("keydown", onKey);
    return () => {
      toggle.removeEventListener("click", onClick);
      removeEventListener("keydown", onKey);
      el.classList.remove("is-open");
      gsap.killTweensOf([bg, panel].filter(Boolean));
      gsap.set([bg, panel].filter(Boolean), { clearProps: "all" });
    };
  });
})();
