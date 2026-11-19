(() => {
  kfFx.register("slant-sweep-page", (el, { options, reduce }) => {
    const angle = +(options.angle ?? 20), dIn = +(options.in ?? 0.6), go = +(options.go ?? 0.5), dOut = +(options.out ?? 0.5);
    const on = (k) => (options[k] ?? "on") !== "off";
    const make = (part) => {
      const d = document.createElement("div");
      d.setAttribute("data-fx-part", part);
      d.setAttribute("aria-hidden", "true");
      d.style.setProperty("--fx-angle", `${angle}deg`);
      el.prepend(d);
      return d;
    };
    // veil: off — draws no veil and only delays the move by go seconds (in the original brand the gradient calc is invalid so no veil shows on screen and only the delay remains)
    const drawn = on("veil");
    const cover = make("cover");
    if (!drawn) cover.style.display = "none";
    const reveal = drawn && on("cover") ? make("reveal") : null;
    const timers = [];
    const lift = () => reveal && gsap.fromTo(reveal, { "--fx-progress": 0 }, { "--fx-progress": 1, duration: reduce ? 0 : dOut, ease: "power2.out" });
    if (reveal) {
      if (document.readyState === "complete") lift();
      else addEventListener("load", lift, { once: true });
    }
    const onClick = (e) => {
      const a = e.target.closest?.("a[href]");
      if (!a || !on("links") || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const href = a.getAttribute("href");
      if (href.startsWith("#") || a.target === "_blank" || a.origin !== location.origin) return;
      e.preventDefault();
      gsap.fromTo(cover, { "--fx-progress": 0 }, { "--fx-progress": 1, duration: reduce ? 0 : dIn, ease: "power2.out" });
      timers.push(setTimeout(() => (location.href = a.href), reduce ? 0 : go * 1000));
    };
    const onShow = (e) => {
      if (!e.persisted) return;
      const tl = gsap.timeline();
      tl.fromTo(cover, { "--fx-progress": 1 }, { "--fx-progress": 0, duration: 0.1, ease: "power2.out" });
      if (reveal) tl.fromTo(reveal, { "--fx-progress": 0 }, { "--fx-progress": 1, duration: dOut, ease: "power2.out" });
    };
    el.addEventListener("click", onClick);
    addEventListener("pageshow", onShow);
    return () => {
      el.removeEventListener("click", onClick);
      removeEventListener("pageshow", onShow);
      removeEventListener("load", lift);
      timers.forEach(clearTimeout);
      gsap.killTweensOf([cover, reveal].filter(Boolean));
      cover.remove();
      reveal?.remove();
    };
  });
})();
