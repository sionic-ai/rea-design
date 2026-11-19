(() => {
  // Rest then hop — once it enters above the bottom 15% of the screen, every N seconds (the every value) it hops once, rising by height px and scaling up by scale during 45~60% of the beat, then settles back (CSS keyframes)
  kfFx.register("idle-hop-loop", (el, { options, reduce }) => {
    if (reduce) return;
    const every = +options.every || 5, height = +(options.height ?? 20), scale = +(options.scale ?? 1.05), delay = +(options.delay ?? 0);
    el.style.setProperty("--fx-every", `${every}s`);
    el.style.setProperty("--fx-h", `${-height}px`);
    el.style.setProperty("--fx-s", String(scale));
    el.style.setProperty("--fx-delay", `${delay}s`);
    const io = new IntersectionObserver((list) => list.forEach((en) => {
      if (!en.isIntersecting) return;
      el.classList.add("is-hop");
      io.disconnect();
    }), { rootMargin: "0px 0px -15% 0px" });
    io.observe(el);
    return () => {
      io.disconnect();
      el.classList.remove("is-hop");
      ["--fx-every", "--fx-h", "--fx-s", "--fx-delay"].forEach((k) => el.style.removeProperty(k));
    };
  });
})();
