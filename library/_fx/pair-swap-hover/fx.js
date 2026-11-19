(() => {
  // Original attached hover separately per image and per name, adding active to each other’s partner — reduced so items with the same data-key turn on and off together
  kfFx.register("pair-swap-hover", (el, { options, reduce, hover }) => {
    const parts = (role) => [...el.querySelectorAll(`[data-fx-part="${role}"]`)];
    const pairs = [...parts("item"), ...parts("label")].filter((n) => n.dataset.key != null);
    const offs = [];

    // Turning on in three batches — when waves is given, the data-wave-th group fades in for fade seconds at that many ms (jQuery fadeIn’s swing = sine.inOut)
    const waves = options.waves ? options.waves.split(",").map((v) => +v.trim()) : null;
    const wide = innerWidth >= +(options.min ?? 0);
    const waved = waves ? [...el.querySelectorAll("[data-wave]")] : [];
    if (waved.length) {
      if (reduce || !wide) gsap.set(waved, { opacity: 1 });
      else {
        const fade = +(options.fade ?? 0.5), ease = kfFx.ease(options.ease || "sine.inOut", "sine.inOut");
        waved.forEach((n) => {
          const at = waves[Math.min(+n.dataset.wave || 0, waves.length - 1)] / 1000;
          offs.push(gsap.fromTo(n, { opacity: 0 }, { opacity: 1, duration: fade, delay: at, ease }));
        });
      }
    }

    if (hover && pairs.length) {
      const set = (key, on) => pairs.forEach((n) => n.dataset.key === key && n.classList.toggle("is-fx-on", on));
      pairs.forEach((n) => {
        const enter = () => set(n.dataset.key, true), leave = () => set(n.dataset.key, false);
        n.addEventListener("pointerenter", enter);
        n.addEventListener("pointerleave", leave);
        offs.push(() => { n.removeEventListener("pointerenter", enter); n.removeEventListener("pointerleave", leave); });
      });
    }
    return () => {
      offs.forEach((o) => (typeof o === "function" ? o() : o.kill()));
      pairs.forEach((n) => n.classList.remove("is-fx-on"));
      if (waved.length) gsap.set(waved, { clearProps: "opacity" });
    };
  });
})();
