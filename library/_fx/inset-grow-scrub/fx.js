(() => {
  // The fixed photo panel, in a cropped window or at a small scale, is tied to scroll and opens full-screen · at a slightly larger scale.
  // While the next panel covers in, the opened photo settles from a large scale to 1 (a photo pile where the back panel covers the front one)
  const parseInset = (s, d) => String(s || d).trim().split(/\s+/).map((v) => (v.endsWith("%") ? v : `${v}%`)).join(" ");
  kfFx.register("inset-grow-scrub", (el, { options, reduce, scroller }) => {
    if (!window.ScrollTrigger) return;
    const media = el.querySelector('[data-fx-part="media"]');
    if (!media) return;
    gsap.registerPlugin(ScrollTrigger);
    const narrow = options["from-narrow"] && matchMedia("(max-width: 767px)").matches;
    const from = parseInset(narrow ? options["from-narrow"] : options.from, "10% 26% 27% 26%");
    const zoom = +(options.zoom ?? 0.65);
    const to = +((narrow ? options["to-narrow"] : options.to) ?? 1.1);
    const scrub = options.scrub === "true" ? true : +(options.scrub ?? 1);
    // End point: the next panel (when that panel reaches the bottom of the screen). If an end option exists, use its css
    // until — an end position inside this panel instead of the next panel (ScrollTrigger end, ksr ”33% top”). When given, next is used only for settling, not for the end
    const next = options.until ? null : options.end ? document.querySelector(options.end) : el.nextElementSibling;
    // dim — initial brightness (filter brightness), brightens to 1 as it opens (.5 in one variant)
    const dim = options.dim != null ? +options.dim : null;
    const lit = (b) => (dim == null ? {} : { filter: `brightness(${b})` });
    if (reduce) { gsap.set(media, { clipPath: "inset(0% 0% 0% 0%)", scale: 1 }); return () => gsap.set(media, { clearProps: "clipPath,scale,transform" }); }
    const fire = (name) => el.dispatchEvent(new CustomEvent(name, { bubbles: true }));
    // shape: polygon — cuts the same window into a four-vertex polygon and opens it (the original’s polygon(20% 20%, 80% 20%, …))
    const poly = options.shape === "polygon";
    const clip = (ins) => {
      if (!poly) return `inset(${ins})`;
      const [t, r, b, l] = ins.split(/\s+/).map(parseFloat);
      return `polygon(${l}% ${t}%, ${100 - r}% ${t}%, ${100 - r}% ${100 - b}%, ${l}% ${100 - b}%)`;
    };
    const open = gsap.fromTo(media, { scale: zoom, clipPath: clip(from), ...lit(dim) }, {
      scale: to, clipPath: clip("0% 0% 0% 0%"), ...lit(1),
      scrollTrigger: {
        trigger: el, scroller, start: "top top", ...(options.until ? { end: options.until } : next ? { endTrigger: next, end: "top bottom" } : { end: "bottom bottom" }), scrub,
        onEnter: () => fire("fx:open"),
        onLeaveBack: () => fire("fx:close"),
        onLeave: () => fire("fx:full"),
        onEnterBack: () => fire("fx:unfull"),
      },
    });
    // While the next board rises and covers, to settles down to 1
    const settle = next && to !== 1 ? gsap.fromTo(media, { scale: to }, { scale: 1, immediateRender: false, scrollTrigger: { trigger: next, scroller, start: "top bottom", end: "top top", scrub } }) : null;
    return () => {
      open.scrollTrigger?.kill(); open.kill();
      settle?.scrollTrigger?.kill(); settle?.kill();
      gsap.set(media, { clearProps: "clipPath,scale,transform,filter" });
    };
  });
})();
