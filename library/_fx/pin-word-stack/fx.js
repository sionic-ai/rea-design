(() => {
  kfFx.register("pin-word-stack", (el, { options, reduce, hover, scroller }) => {
    const lead = el.querySelector('[data-fx-part="lead"]');
    const photos = [...el.querySelectorAll('[data-fx-part="photo"]')];
    if (!lead || !photos.length || !window.ScrollTrigger) return;
    const words = [...lead.children];
    if (!words.length) return;

    // One sentence layer per photo — layer i shows only its own word (the last layer up to the remaining words) and the rest is transparent, just holding its space
    const layers = photos.map((ph, i) => {
      const layer = document.createElement("div");
      layer.dataset.fxPart = "layer";
      layer.setAttribute("aria-hidden", "true");
      const copy = lead.cloneNode(true);
      copy.removeAttribute("data-fx-part");
      [...copy.children].forEach((w, k) => { const mine = k === i || (i === photos.length - 1 && k > i); if (!mine) w.classList.add("is-fx-off"); });
      layer.append(copy);
      el.append(layer);
      return layer;
    });
    el.classList.add("is-fx-on");
    const place = () => layers.forEach((l, i) => { l.style.top = `${photos[i].offsetTop}px`; l.style.height = `${photos[i].offsetHeight}px`; });
    place();
    const ro = new ResizeObserver(() => { place(); ScrollTrigger.refresh(); });
    ro.observe(el);

    const mm = gsap.matchMedia();
    if (!reduce) mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (!hover) {
        const at = options.touch || "50% 50%";
        layers.forEach((l) => ScrollTrigger.create({ trigger: l.firstElementChild, scroller, start: at, endTrigger: el, end: () => `bottom 50%+=${innerWidth / 2}`, pin: true, pinSpacing: false }));
        return;
      }
      if (options.parallax !== "off") photos.forEach((ph) => {
        const img = ph.firstElementChild;
        if (img) gsap.fromTo(img, { y: "-50%" }, { y: "50%", ease: "none", scrollTrigger: { trigger: ph, scroller, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
      });
      layers.forEach((l) => ScrollTrigger.create({ trigger: l, scroller, start: "top top", endTrigger: el, end: "bottom bottom", pin: true, pinSpacing: false }));
    });

    return () => {
      mm.revert();
      ro.disconnect();
      layers.forEach((l) => l.remove());
      el.classList.remove("is-fx-on");
    };
  });
})();
